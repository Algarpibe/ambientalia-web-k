import { BlueButton } from "@/components/SectionRow";
import { HERO } from "@/lib/api";

/**
 * S1 · fila 1 — hero de /kunak-api.
 * Spec: docs/research/kunak-api/components/hero-api.spec.md
 *
 * Misma inversión tipográfica que /accesorios y /software: el titular VISUAL es
 * el `<p>` de 50px/fw800 y el `<h1>` real va debajo a 23px/fw300. A diferencia
 * de /software solo hay **un** CTA (no está el de la app de Android).
 *
 * Retícula medida en vivo a cw 1264.7: fila 80% máx 1380 con `padding-bottom`
 * 1% y sin `padding-top` (lo pone la sección), columnas 47.25% + 47.25% y
 * gutter 5.5%.
 *
 * Lo propio de esta página es el **`margin-top: -10%` de la foto**: es un
 * porcentaje del ancho de la columna, no un valor fijo — medido −47.80 a
 * columna 478.0 y −54.42 a columna 544.3 (el recon lo anotó como "−54.42px").
 */
export function HeroApi() {
  return (
    // QA Fase 5 (2026-07-28): en móvil el `pb-[30px]` sobraba. El hueco medido
    // del botón a la foto es 88.8 (no 120) y el de la foto al rótulo de la fila
    // siguiente 23.9 (no 50): los 30 de aquí se sumaban al `pt` de
    // `InfoProductoApi`, que ahora carga el valor entero.
    <div data-fila="" className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-0 md:flex-row md:items-start md:gap-[5.5%] md:pb-[1vw]">
      <div className="relative w-full md:w-[47.25%]">
        {/* MARCADOR DE SONDA (129.ª) — ver la cabecera de este fichero. */}
        <img
          data-modulo="image"
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          // el punteado cuelga 65px a la izquierda de la retícula y 26 por
          // encima de la fila (medido: x 61.5 / y 299.3 con la fila en 126.5 / 325.3)
          className="absolute -top-[26px] -left-[65px]"
          style={{ width: 60, height: 22 }}
        />
        {/**
         * ⚠ EL ÚNICO ENVOLTORIO NUEVO DE ESTA RUTA, y por eso lleva su razón:
         * el kicker y el `<h1>` son DOS elementos aquí y **UN** `et_pb_text` en
         * el original —derivado, no supuesto: la fila 1 sirve `image · text ·
         * text · text · button · image`, y los tres `text` son (kicker+h1),
         * (h2) y (claim)—. Marcar sólo uno de los dos partiría el módulo en
         * dos y el comparador leería un alto que no es el suyo.
         *
         * Va SIN CLASES: en flujo normal un `<div>` sin margen ni padding no
         * cambia el reparto —el `mt-[37.4px]` del `<h2>` sigue colapsando
         * contra un margen 0 igual que antes—, pero eso es una PREDICCIÓN y la
         * cierra la medida a umbral cero, no este comentario (§*el marcador
         * prueba que el build es nuevo, no que el cambio tenga efecto*).
         */}
        <div data-modulo="text">
          {/* Móvil (≤767): el kicker BAJA a 35px/42, como en /software. */}
          <p className="text-[35px] font-extrabold leading-[42px] text-[#333] md:text-[50px] md:leading-[60px]">
            {HERO.kicker}
          </p>
          <h1 className="pb-[10px] text-[23px] font-light leading-[23px] tracking-[-0.5px] text-[#333]">
            {HERO.h1}
          </h1>
        </div>
        {/* 37.4 = los 9.55 de `padding-bottom` del módulo de texto + los 27.81
            de `margin-bottom` de módulo Divi (el mismo hueco que en /software). */}
        <h2 data-modulo="text" className="mt-[37.4px] pb-[10px] text-[35px] font-light leading-[1.25] text-[#333] md:text-[44px]">
          {HERO.h2}
        </h2>
        {/* El módulo del h2 va con `margin-bottom: 0`, así que el claim arranca
            pegado (medido: claim.y == h2.y + h2.h). El separador `|` es el único
            trozo que NO va en azul: lleva un `<span style="color:#333333">`. */}
        <p data-modulo="text" className="mb-[27.81px] text-[16px] font-extrabold leading-[30.6px] text-[#0075C9]">
          {HERO.claim.antes}
          <span className="text-[#333]">{HERO.claim.separador}</span>
          {HERO.claim.despues}
        </p>
        {/* 90 = los 30 de `margin-bottom` del propio botón Divi + los 60 del
            `et_pb_button_module_wrapper` (medido: la columna cierra 90px bajo él).
            En MÓVIL el remate es otro: del borde inferior del botón al techo de
            la foto el original mide **88.8**, y como el flex ya pone `gap-30`
            aquí quedan 58.8 (QA Fase 5, 2026-07-28). */}
        <div data-modulo="button" className="mb-[58.8px] md:mb-[90px]">
          <BlueButton href={HERO.ctaHref}>{HERO.ctaLabel}</BlueButton>
        </div>
      </div>

      {/* La foto SÍ se ve en móvil (a diferencia de la de /software, que el
          original oculta): a 390 mide 312×312. El `-mt-[10%]` va en la `<img>`,
          no en la columna: los márgenes en % se resuelven contra el ANCHO del
          bloque contenedor, y desde la columna (flex item) ese bloque sería la
          fila entera. Solo desde md, que es donde el original solapa. */}
      <div className="w-full md:w-[47.25%]">
        <img
          data-modulo="image"
          src={HERO.image.src}
          alt={HERO.image.alt}
          width={HERO.image.width}
          height={HERO.image.height}
          className="h-auto w-full md:-mt-[10%]"
        />
      </div>
    </div>
  );
}
