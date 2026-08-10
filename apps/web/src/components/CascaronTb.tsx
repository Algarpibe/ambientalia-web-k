import type { ReactNode } from "react";

/**
 * LA RETÍCULA DEL `_tb_body` — la capa que el THEME BUILDER pone, compartida.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTE FICHERO EXISTE, Y ES UNA MEDIDA
 *
 * Vivía en `arquetipo-a/CascaronA.tsx` con nombres de arquetipo (`FilaA`,
 * `SeccionCuerpoA`…). Al construir `articulos-kb` salió que **es la MISMA
 * plantilla de theme-builder**, medida de los dos lados y al píxel:
 *
 * | eje | grupo A | `articulos-kb` |
 * |---|---|---|
 * | fila | 1238.39 / 335.39, `max-width` 1380 | **idéntico** |
 * | sección `pt/pb` | 57.5938 / 50 | **idéntico** |
 * | columna ancha | 911.75 (73.62 %) | **idéntico** |
 * | columna estrecha | 258.5 (20.87 %) | **idéntico** |
 * | canal | 68.1094 (5.5 %) | **idéntico** |
 *
 * (`a-cascaron-{1440,390}` · `kb-spec-{1440,390}.json` → `veredicto.cascaron`.)
 *
 * **Lo único que cambia es el LADO de la columna estrecha:** en grupo A la
 * barra va a la derecha; en KB, a la izquierda. Eso es un parámetro de la
 * plantilla —el editor de theme-builder eligió el orden de las dos columnas—,
 * **no un campo del documento**: sale igual en las 6 instancias de KB y en las
 * 24 de A. Por eso `lado` es una prop del cascarón y no vive en el dato.
 *
 * ⚠ **El cambio es un RENOMBRE, no una reescritura** — y esa frase está
 * respaldada POR CONSTRUCCIÓN, no por una medición. Hay que decirlo así porque
 * el intento de medirlo salió mal y el resultado es un dato:
 *
 * > **`qa:html-cmp` NO puede adjudicar esto en este entorno.** Antes/después
 * > con dos builds propios (`medidas/html-cascaron-{antes,despues}.json`):
 * > **31 de 31 rutas con el marcado visible distinto, y también con los nombres
 * > de chunk quitados** — incluidas `/` y `/accesorios`, que **no importan este
 * > fichero**. Dos rutas que el cambio no toca bastan para saber que lo que
 * > varía es el build, no la edición (§sondas 4: *31 de 31 no es un hallazgo,
 * > es el instrumento*).
 *
 * Lo que sí sostiene la frase es que las cuatro funciones emiten **la misma
 * cadena literal de clases** que emitían: `ColumnaEstrecha` con
 * `lado="derecha"` compone exactamente `w-full min-[981px]:w-[20.87%]
 * min-[981px]:ml-[5.5%]`, que es carácter a carácter lo que escribía
 * `ColumnaLateralA`; las otras tres conservan su cuerpo intacto. Es un
 * argumento de código, **más débil que una medida**, y va etiquetado como tal.
 *
 * Ficha con el detalle y el dueño: `PENDIENTES-QA.md` §HTML-CMP-NO-REPRODUCIBLE.
 *
 * ── El corte responsive es el de Divi: 980, no el `md` de Tailwind ────────
 * Las columnas apilan por debajo de **981 px**. Usar `md:` (768) habría dejado
 * dos columnas entre 768 y 980, que es donde el original ya apila.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Fila del `tb_body`: 86 % con tope de 1380 (1238.39 a 1440 · 335.39 a 390). */
export function FilaTb({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-fila="" className={`mx-auto w-[86%] max-w-[1380px] ${className}`}>{children}</div>
  );
}

/**
 * La sección que contiene el `post_content`. `pt/pb` **57.59 a 1440 y 50 a
 * 390**: se mueve con el ancho, o sea que es el 4 % por defecto de Divi.
 */
export function SeccionCuerpoTb({ children }: { children: ReactNode }) {
  return (
    <section className="w-full bg-white pt-[50px] pb-[50px] min-[981px]:pt-[57.59px] min-[981px]:pb-[57.59px]">
      {children}
    </section>
  );
}

/**
 * Columna `3_4`: **73.624 %** (911.75 a 1440), ancho completo al apilar.
 *
 * ⚠ **El 73.62 % de antes daba 911.703, o sea −0.047 px, y de ahí salían 45
 * pares distintos** — el ancho de la sección, el de sus 39 filas y el 2 % de
 * `padding` que cada una resuelve contra él. Lo cazó `qa:kb-cmp` par a par; una
 * guarda de alturas no lo habría visto nunca, porque a esa escala el texto no
 * cambia de renglón (§la GUARDA TAMBIÉN TIENE UN NIVEL).
 *
 * El valor no es «el porcentaje de Divi»: es **el que reproduce el píxel
 * medido**. El ancho computado está cuantizado a 1/64 px, así que un px no
 * determina un porcentaje —determina un conjunto— y quién elige dentro de él es
 * el motor. Se ajusta contra la medida y lo adjudica el comparador, que es la
 * única forma de saberlo sin modelar cómo redondea Chrome.
 *
 * Y aprovecha a las DOS familias: grupo A tiene la misma columna de 911.75 en el
 * original y arrastraba el mismo −0.047 **sin que ninguna sonda lo mirase**.
 */
export function ColumnaAncha({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`w-full min-[981px]:w-[73.624%] ${className}`}>{children}</div>;
}

/**
 * Columna `1_4`: 20.87 % (258.5 a 1440) con canal de 5.5 % (68.1094).
 *
 * El canal va **del lado por el que toca a su hermana**: a la izquierda si la
 * columna estrecha va a la derecha (grupo A) y a la derecha si va a la
 * izquierda (`articulos-kb`). Es la regla posicional de la retícula de Divi
 * —`margin-right` en toda columna que no es la última, `0` en la última—, no
 * un campo (`MEDICION.md` §3.2, medido en las 60 columnas de KB).
 */
export function ColumnaEstrecha({
  children,
  className = "",
  lado = "derecha",
}: {
  children?: ReactNode;
  className?: string;
  lado?: "izquierda" | "derecha";
}) {
  const canal = lado === "derecha" ? "min-[981px]:ml-[5.5%]" : "min-[981px]:mr-[5.5%]";
  return <div className={`w-full min-[981px]:w-[20.87%] ${canal} ${className}`}>{children}</div>;
}
