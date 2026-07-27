"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mecanismo compartido del shortcode `lista-contenido` del tema KunakAir,
 * transcrito de `themes/KunakAir/assets/js/init.js`:
 *
 *   $("#<shortcode> li span").on("mouseenter", toggleActiveClasses)
 *
 * Desktop (≥768px, `body.min-768`): **hover**, no click — `mouseenter` activa
 * el ítem en exclusiva y no existe cierre.
 * Móvil (<768px): acordeón táctil — el tap dispara `mouseenter`; si el ítem ya
 * estaba activo se cierra todo (estado "ninguno abierto" es válido) y, al
 * abrir, anima el scroll hasta `li.offset().top − 5` (jQuery "slow", ~600ms).
 *
 * Lo usan las dos instancias del shortcode en el clon:
 * `ProductosTabs` (#lista-soluciones) y `ListaContenido` (#producto-accesorios-*).
 *
 * Specs: docs/research/components/productos-tabs.spec.md ·
 *        docs/research/monitor-calidad-aire/components/sondas-meteorologicas.spec.md
 */
export function useListaContenido(initialId: string | null) {
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // B5 — scroll animado del acordeón móvil, verificado en vivo (b5-probe):
  // al ABRIR, el original anima hasta `li.offset().top − 5` (~600ms, jQuery
  // "slow"; liTop final = 5); al CERRAR no hay scroll. Se mide DESPUÉS del
  // commit (el cierre del ítem anterior desplaza el destino).
  const liNodes = useRef(new Map<string, HTMLElement>());
  const liCallbacks = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const scrollTargetRef = useRef<string | null>(null);

  /** `ref` para el `<li>` del ítem (estable por id). */
  const liRef = useCallback((id: string) => {
    let cb = liCallbacks.current.get(id);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) liNodes.current.set(id, el);
        else liNodes.current.delete(id);
      };
      liCallbacks.current.set(id, cb);
    }
    return cb;
  }, []);

  const onEnter = useCallback(
    (id: string) => {
      if (isDesktop) setActiveId(id);
    },
    [isDesktop],
  );

  const onClick = useCallback(
    (id: string) => {
      if (isDesktop) return;
      const opening = activeId !== id;
      scrollTargetRef.current = opening ? id : null;
      setActiveId(opening ? id : null);
    },
    [isDesktop, activeId],
  );

  useEffect(() => {
    const id = scrollTargetRef.current;
    if (!id || id !== activeId) return;
    scrollTargetRef.current = null;
    const li = liNodes.current.get(id);
    if (!li) return;
    window.scrollTo({
      top: li.getBoundingClientRect().top + window.scrollY - 5,
      behavior: "smooth",
    });
  }, [activeId]);

  return { activeId, isDesktop, liRef, onEnter, onClick };
}
