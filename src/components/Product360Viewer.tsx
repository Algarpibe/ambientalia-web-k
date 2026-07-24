"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Visor 360° drag-to-rotate — réplica NATIVA (sin `@3dweb/360javascriptviewer`)
 * del hero de /monitor-calidad-aire. Config original del div holder:
 *   data-total-frames=35 · data-speed=90 · data-inertia=12 · data-reverse=true
 *   · data-auto-rotate=1 · hint "arrastrar para rotar".
 * Spec: docs/research/monitor-calidad-aire/components/hero-producto.spec.md §Visor.
 *
 * Comportamiento (verificado en el original):
 *  1. Precarga los 35 frames con una barra de progreso sobre el frame 01 borroso.
 *  2. Al terminar, da UNA vuelta automática (auto-rotate) y descansa.
 *  3. Drag horizontal → avanza/retrocede frames (reverse invierte el sentido);
 *     al soltar, inercia con decaimiento. El hint se oculta al primer pointerdown.
 *
 * Implementación: un solo <img> cuyo `src` conmuta entre los frames ya cacheados
 * por la precarga (swap instantáneo). `indexRef` guarda el frame como float para
 * acumular el arrastre; el render redondea y envuelve con módulo.
 */
export function Product360Viewer({
  frames,
  reverse = true,
  inertia = 12,
  autoRotate = true,
  hint = "arrastrar para rotar",
  ariaLabel = "Vista 360° del producto",
  className,
}: {
  frames: string[];
  reverse?: boolean;
  inertia?: number;
  autoRotate?: boolean;
  hint?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const total = frames.length;

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const wrapRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0); // frame como float (permite acumular el arrastre)
  const dragRef = useRef<{ active: boolean; lastX: number; lastT: number; vel: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pxPerFrameRef = useRef(11);

  const wrap = useCallback(
    (f: number) => ((Math.round(f) % total) + total) % total,
    [total]
  );

  const setFrame = useCallback(
    (f: number) => {
      indexRef.current = f;
      setIndex(wrap(f));
    },
    [wrap]
  );

  const stopAnim = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  /* Precarga: cuenta onload/onerror de los 35 frames para la barra de progreso. */
  useEffect(() => {
    let alive = true;
    let count = 0;
    const imgs: HTMLImageElement[] = [];
    frames.forEach((src) => {
      const img = new Image();
      const done = () => {
        if (!alive) return;
        count += 1;
        setLoaded(count);
        if (count >= total) setReady(true);
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
      imgs.push(img);
    });
    return () => {
      alive = false;
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [frames, total]);

  /* Vuelta automática única al terminar la precarga. */
  useEffect(() => {
    if (!ready || !autoRotate) return;
    const duration = 1400; // ~1 vuelta
    const from = indexRef.current;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start == null) start = now;
      const t = Math.min(1, (now - start) / duration);
      setFrame(from + t * total);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => stopAnim();
  }, [ready, autoRotate, total, setFrame, stopAnim]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    stopAnim();
    setShowHint(false);
    const w = wrapRef.current?.clientWidth ?? 380;
    pxPerFrameRef.current = Math.max(4, w / total); // ~1 vuelta por ancho arrastrado
    dragRef.current = { active: true, lastX: e.clientX, lastT: e.timeStamp, vel: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.lastX;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    const dir = reverse ? -1 : 1;
    const deltaFrames = (dx * dir) / pxPerFrameRef.current;
    setFrame(indexRef.current + deltaFrames);
    d.vel = deltaFrames / dt; // frames por ms
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    d.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    // Inercia: velocidad (frames/frame de 16ms) que decae según `inertia`.
    let vel = d.vel * 16;
    const decay = Math.max(0.8, 1 - 1 / (inertia + 6)); // inertia 12 → ~0.944
    const step = () => {
      vel *= decay;
      if (Math.abs(vel) < 0.02) {
        rafRef.current = null;
        return;
      }
      setFrame(indexRef.current + vel);
      rafRef.current = requestAnimationFrame(step);
    };
    if (Math.abs(vel) > 0.05) rafRef.current = requestAnimationFrame(step);
  };

  const progress = total ? Math.round((loaded / total) * 100) : 0;

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "jsv-holder relative aspect-square w-full touch-pan-y select-none overflow-hidden",
        ready ? "cursor-grab active:cursor-grabbing" : "cursor-progress",
        className
      )}
    >
      {/* Frame activo (borroso mientras precarga, como el placeholder original). */}
      <img
        src={frames[index]}
        alt=""
        draggable={false}
        className={
          "pointer-events-none h-full w-full object-contain transition-[filter] duration-300 " +
          (ready ? "" : "blur-[5px]")
        }
      />

      {/* Barra de progreso de precarga (5px, 30% de ancho, centrada). */}
      {!ready ? (
        <div
          className="absolute left-1/2 top-1/2 h-[5px] w-[30%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[0.25rem] bg-white/50"
          style={{ zIndex: 200 }}
        >
          <div
            className="h-full bg-black transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {/* Hint pill "arrastrar para rotar" — se oculta al primer arrastre. */}
      {ready && showHint ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ zIndex: 200 }}
        >
          <span
            className="whitespace-nowrap rounded-[0.5em] bg-black/20 px-[0.5em] py-[0.2em] text-center text-[12px] leading-none"
            style={{ color: "rgb(243, 237, 237)" }}
          >
            {hint}
          </span>
        </div>
      ) : null}
    </div>
  );
}
