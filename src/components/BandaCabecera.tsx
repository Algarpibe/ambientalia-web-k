import type { CSSProperties } from "react";

/**
 * `.banda-cabecera` — el hueco EN FLUJO que ocupa la cabecera del original.
 *
 * Diagnóstico C-QA1 en `docs/PENDIENTES-QA.md`; medición congelada en
 * `scripts/qa/medidas/c-banda-{1440,390}.json` (`npm run qa:banda`).
 *
 * ── Qué arregla ────────────────────────────────────────────────────────────
 * En el original **la cabecera está EN FLUJO** y su alto depende de la
 * plantilla; en el clon `HeaderNav` es `absolute` y no ocupa nada. Las 11 rutas
 * anteriores no lo notaban porque todas meten algo en medio que **absorbe** la
 * diferencia. El caso y la FAQ arrancan directas y la destaparon: el `h1` caía
 * **−391.6** y **−225** a 1440.
 *
 * Esto es el mismo patrón que ya usan los 6 sectores —`HeaderNav` absoluto +
 * una sección en flujo con el alto de la cabecera del original— extraído para
 * las plantillas cuyo `h1` va **en el cuerpo** y no dentro de la banda. Por eso
 * no lleva texto: es la banda, y el titular lo pone quien la usa, debajo.
 *
 * ── Lo que se midió, y por qué el alto es plantilla y la foto es campo ──────
 * `min-height` del `et_pb_section` de la cabecera, en las 6 instancias:
 *
 *   caso  387px  · 4 de 4, con **foto distinta en las 4** → alto plantilla, foto CAMPO
 *   FAQ     0px  · 2 de 2, **sin foto** → la banda la llenan las filas del menú
 *
 * Es el discriminador de `CLAUDE.md` en su forma de régimen plantillado: **cero
 * varianza entre instancias = plantilla; lo que varía = campo.** El alto no lo
 * escribió nadie por instancia; la foto sí, una por caso.
 *
 * ── El degradado va aquí, como en `CabeceraSector` ─────────────────────────
 * `linear-gradient(rgba(71,71,71,0.17) 0%, rgba(0,0,0,0) 100%)` es el que el
 * original pone en la sección, y se replica igual que ya hace la banda de
 * sector. `HeaderNav` conserva su propia veladura de 200px encima: la
 * duplicidad ya existía en sector y está verificada, así que no se toca aquí —
 * cambiar `HeaderNav` movería las 17 rutas y eso es otra tanda.
 *
 * ── Los altos van por variable CSS, no por clase de Tailwind ───────────────
 * Tailwind no genera clases a partir de valores dinámicos, y estos son dos por
 * plantilla (móvil y ≥768). La regla vive en `globals.css`; aquí solo el dato.
 */
export function BandaCabecera({
  alto,
  altoMovil,
  foto,
  corte = 768,
  className = "",
}: {
  /** `min-height` a partir de `corte`. Medido en el original. */
  alto: number;
  /** `min-height` por debajo de `corte`. Medido en el original. */
  altoMovil: number;
  /** La foto de fondo, cuando la plantilla la tiene. El caso sí; la FAQ no. */
  foto?: string;
  /**
   * Dónde cambia de alto. **No es el mismo en todas las plantillas y no se
   * unifica sin medirlo**: producto lleva **1024** desde su QA del 2026-07-26
   * (el cambio va con el menú de hamburguesa), y caso/FAQ heredaron **768** de
   * `CabeceraSector`.
   *
   * ⚠ El de caso y FAQ está **SIN PROBAR**: sus altos se midieron a 1440 y a
   * 390, y entre esos dos anchos hay sitio para los dos cortes. Ponerlos a 1024
   * «para que cuadren con producto» sería inventar; dejarlos en 768 es lo que
   * ya se sirvió y verificó a los dos anchos medidos. Se anota, no se adivina.
   */
  corte?: 768 | 1024;
  className?: string;
}) {
  const DEGRADADO = "linear-gradient(rgba(71,71,71,0.17) 0%, rgba(0,0,0,0) 100%)";
  return (
    <section
      aria-hidden
      className={`${corte === 1024 ? "banda-cabecera-lg" : "banda-cabecera"} w-full bg-cover bg-center ${className}`}
      style={
        {
          "--banda-alto": `${altoMovil}px`,
          "--banda-alto-md": `${alto}px`,
          backgroundImage: foto ? `${DEGRADADO}, url('${foto}')` : DEGRADADO,
        } as CSSProperties
      }
    />
  );
}

/**
 * Los altos medidos, en un sitio. Se exportan para que la banda de cada
 * plantilla no los reescriba a mano en cada `page.tsx` — y para que se vea de
 * un vistazo qué plantillas los comparten y cuáles no.
 *
 * ⚠ A 1440 el caso mide 387 y la FAQ 225, **igual que producto**; a 390 la FAQ
 * mide 165.58 y producto 136.58. Comparten el número en un ancho y no en el
 * otro, así que **no son la misma banda**: la fila del menú lleva `pt/pb 30/30`
 * en la FAQ y `19/12` en producto. Dar por buena la coincidencia de 1440
 * habría metido −29 en las dos FAQ a 390.
 */
export const BANDA = {
  /** `/casos-de-exito/*` y `/case-studies/*` — con foto por instancia. */
  caso: { alto: 387, altoMovil: 362.91 },
  /** `/faqs/*` — sin foto. */
  faq: { alto: 225, altoMovil: 165.58 },
  /**
   * Las 4 de producto (`/accesorios`, `/kunak-api`, `/monitor-calidad-aire`,
   * `/software-…`), con su foto por página. **C-QA2**, corregido 2026-07-30.
   *
   * Antes valía `137 / lg:177`, escrito a ojo contra la cabecera **del clon**
   * en vez de contra la del original. De ahí el **−48 exacto a 1440** de tres
   * de las cuatro, invisible durante meses porque la regla del `h1` resta la
   * base antes de comparar y el desfase vivía **en** la base.
   *
   * Medido por composición (`medidas/c-banda-{1440,390}.json`): la cabecera del
   * original mide **225** a 1440 y **136.58** a 390, y el offset del `h1` por
   * debajo del espaciador **ya coincidía al céntimo** (167.59 en los dos lados
   * en `/kunak-api`). O sea: **un solo cambio, sin segundo defecto debajo**.
   */
  producto: { alto: 225, altoMovil: 136.58, corte: 1024 },
  /**
   * ARQUETIPO A — las tres plantillas (blog, término, documento científico).
   *
   * **225 / 165.58**, y no se copiaron de la FAQ: se **dedujeron por
   * composición** de la `y` cruda del `h1` del original, que es la medida que
   * `CLAUDE.md` §Notas de método manda tomar **una vez por arquetipo nuevo**
   * antes de fiarse de ningún Δ de cuerpo (`a-cascaron-*-2026-07-31-4.json`):
   *
   *   @1440  332.59 − 50 (`section#0`) − 57.59 (`section#1 pt`) = **225**
   *   @390   317.58 − 102 (`section#0`) − 50 (`section#1 pt`)   = **165.58**
   *
   * Y cuadra en las tres formas: el término da 346.98 porque su `row#1` añade
   * `pt 14.39` (225 + 50 + 57.59 + 14.39 = 346.98 ✓).
   *
   * ⚠ Coincide con la FAQ **en los dos anchos**, que es justo lo que el aviso de
   * arriba dice que hace falta: producto y FAQ comparten el 225 de 1440 y
   * difieren a 390, así que coincidir en uno solo no habría probado nada.
   * Aun así va con entrada propia y no reusando `faq`: son plantillas distintas
   * y que hoy midan igual no es una razón para acoplarlas.
   */
  grupoA: { alto: 225, altoMovil: 165.58 },
} as const;
