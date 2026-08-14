/**
 * EL PAGINADOR DE `LISTADO-B` — **dos pieles**, una por variante.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS TRES PIELES CENSADAS, Y LAS TRES CONSTRUIDAS
 *
 * | variante | piel | selector | alto @1440 |
 * |---|---|---|---|
 * | `L1-blog` | **A** | `div.wp-pagenavi[role="pagination"]` | **42** |
 * | `L1-etiqueta` · `L2` | **B** | `div.wp-pagenavi[role="navigation"]` | **40** |
 * | `L1-resources` | **C** | `nav.kunak-pagination` | **42** |
 *
 * `piel` es eje **plantilla** en el comparador, así que el `role` no es un
 * detalle de accesibilidad copiado por gusto: **es lo que discrimina la piel**.
 * Emitir el mismo `role` en las dos haría que el barrido leyera «piel A» en las
 * tres formas y el error saldría como un acierto.
 *
 * ── Navega por ENLACE REAL, no por AJAX ───────────────────────────────────
 * `defaultPrevented: false` en las 5 formas con control (`BEHAVIORS.md` §1b), y
 * es lo que `D2.3` necesitaba para poder derivar las `/page/N/` en build sin un
 * punto de entrada de datos.
 *
 * ── La instancia de UNA sola página NO sirve paginador ────────────────────
 * Medido: `piel: ninguna` en `h2s-es` y en los `resources` de 1 tarjeta. O sea
 * que el paginador es **condicional al nº de páginas**, no un elemento fijo de
 * la plantilla — y por eso este componente devuelve `null` con `total <= 1`.
 *
 * ⚠ Y las dos pieles **no imprimen lo mismo**: la B trae `span.pages` con «Page
 * N of M» y la A no. También eso está medido, y también es plantilla.
 */

import { Fragment } from "react";

/** Cuántos números pinta la piel A alrededor del actual, medido en el corpus. */
const VENTANA_A = 2;

export function Paginador({
  piel,
  n,
  total,
  href,
}: {
  piel: "A" | "B" | "C";
  /** Página actual, 1-based. */
  n: number;
  total: number;
  /** `(k) => "/blog/page/3"`. La página 1 va sin sufijo, como el original. */
  href: (k: number) => string;
}) {
  if (total <= 1) return null;
  if (piel === "A") return <PielA n={n} total={total} href={href} />;
  if (piel === "C") return <PielC n={n} total={total} href={href} />;
  return <PielB n={n} total={total} href={href} />;
}

/**
 * Piel **A** — `/blog`. `span.page-numbers.current` para la actual, `a.page-numbers`
 * para el resto, `span.page-numbers.dots` cuando hay salto, y un
 * `a.next.page-numbers` con «Siguiente »».
 *
 * La ventana la reproduce el corpus: en la página 1 de 8 sirve
 * `1 · 2 · 3 · … · 8 · Siguiente »`.
 */
function PielA({ n, total, href }: { n: number; total: number; href: (k: number) => string }) {
  const nums = ventana(n, total, VENTANA_A);
  const pieza = (k: number | null, i: number) =>
    k === null ? (
      <span key={`d${i}`} className="page-numbers dots">
        &hellip;
      </span>
    ) : k === n ? (
      <span key={k} aria-current="page" className="page-numbers current">
        {k}
      </span>
    ) : (
      <a key={k} className="page-numbers" href={href(k)}>
        {k}
      </a>
    );

  return (
    /* ⚠⚠ **EL SALTO DE LÍNEA ENTRE PIEZAS ES GEOMETRÍA, NO FORMATO.**
       Las piezas son `inline-block`, así que el espacio en blanco que las separa
       en el HTML **se renderiza**: 3.61 px a 18 px de cuerpo. El original las
       sirve una por línea; la primera versión de este componente las emitía
       pegadas, y el resultado fue un desplazamiento ACUMULATIVO de 3.61 px por
       pieza —146.41 → 142.8, 190.02 → 182.8, 233.63 → 222.8…— en las 5 piezas
       de la piel A.

       Es §El principio en su forma más incómoda: lo servido incluye **el espacio
       en blanco del marcado**, y un JSX «limpio» es una desviación medible. Por
       eso el `{" "}` va explícito y comentado: sin el comentario, el primer
       formateador que pase por aquí se lo lleva y nadie sabrá por qué se movió
       la paginación. */
    <div className="wp-pagenavi" role="pagination">
      {/* ⚠⚠ **ESTO FALTABA, y lo destapó construir la piel C (2026-08-14).**
          El original sirve en `/blog/page/N` con N≥2:

              <a class="prev page-numbers" href="…/es/blog/">&laquo; Anterior</a>

          y este componente **sólo emitía `next`**. No lo vio nadie porque el
          espejo de `lh-spec` mide **la página 1 de cada forma**, y en la página 1
          este enlace no existe: el defecto vivía entero en las 7 rutas
          `/blog/page/N` que ninguna comparación cubre.

          Es §La causa común con el contenedor de siempre —lo que el instrumento
          no mira— y su forma barata: **el defecto sólo aparece con OTRO
          CONTENIDO**, aquí «otra página de la misma serie».

          ⚠ El arreglo es **NO-OP sobre todo lo verificado**: `n > 1` es falso en
          la página 1, que es lo único que el comparador ha comparado nunca. Y
          sigue **SIN VERIFICAR** contra el original por comparador, porque el
          espejo no cubre `/page/N` — se replica lo medido en el corpus, y se
          dice. */}
      {n > 1 ? (
        <>
          <a className="prev page-numbers" href={href(n - 1)}>
            &laquo; Anterior
          </a>{" "}
        </>
      ) : null}
      {nums.map((k, i) => (
        <Fragment key={k === null ? `d${i}` : k}>
          {i > 0 ? " " : null}
          {pieza(k, i)}
        </Fragment>
      ))}
      {n < total ? (
        <>
          {" "}
          <a className="next page-numbers" href={href(n + 1)}>
            Siguiente &raquo;
          </a>
        </>
      ) : null}
    </div>
  );
}

/**
 * Piel **B** — `/etiqueta/*`. Trae `span.pages` («Page 1 of 4»), `span.current`,
 * `a.page.larger` para las siguientes y `a.nextpostslink` con `»`.
 *
 * ⚠ El literal es **«Page N of M», en inglés, en un sitio en español**. Es una
 * errata del original y va *verbatim*: la regla 1 del proyecto dice textos tal
 * cual, erratas incluidas.
 */
function PielB({ n, total, href }: { n: number; total: number; href: (k: number) => string }) {
  return (
    <div className="wp-pagenavi" role="navigation">
      <span className="pages">
        Page {n} of {total}
      </span>
      {n > 1 ? (
        <a className="previouspostslink" rel="prev" aria-label="Página anterior" href={href(n - 1)}>
          &laquo;
        </a>
      ) : null}
      <span aria-current="page" className="current">
        {n}
      </span>
      {Array.from({ length: total - n }, (_, i) => n + 1 + i).map((k) => (
        <a key={k} className="page larger" title={`Página ${k}`} href={href(k)}>
          {k}
        </a>
      ))}
      {n < total ? (
        <a className="nextpostslink" rel="next" aria-label="Página siguiente" href={href(n + 1)}>
          &raquo;
        </a>
      ) : null}
    </div>
  );
}

/**
 * Piel **C** — `/recursos/*`. `nav.kunak-pagination` con un `<ul>` de `<li>`, y
 * **la misma ventana que la piel A**: en la página 1 de 6 el original sirve
 * `1 · 2 · 3 · … · 6 · Siguiente`, que es exactamente `ventana(n, total, 2)`.
 *
 * ⚠⚠ **EL SALTO DE LÍNEA ENTRE LOS `<li>` ES GEOMETRÍA, IGUAL QUE EN LA PIEL A**
 * — y aquí el mecanismo está en el CSS servido, no deducido:
 *
 *     .kunak-pagination li { display: inline-block; line-height: 1.7em }
 *
 * `inline-block` ⇒ el espacio en blanco que separa los `<li>` en el marcado **se
 * renderiza**. El original sirve uno por línea (`\n\t`), así que el clon emite
 * `{" "}` entre ellos, explícito y comentado para que ningún formateador se lo
 * lleve. Es la misma lección que costó 3.61 px por pieza en la piel A.
 *
 * ── Y lo que NO lleva, dicho porque la piel B sí ──────────────────────────
 * Ni `span.pages` («Page N of M») ni `role`: el `<nav>` sólo trae
 * `aria-label="Posts pagination"`. Copiarle el `role` de las otras dos haría que
 * el barrido leyera «piel A» en las tres formas y **el error saldría como un
 * acierto** — `piel` es eje `plantilla` y el discriminador es justo eso.
 */
function PielC({ n, total, href }: { n: number; total: number; href: (k: number) => string }) {
  const nums = ventana(n, total, VENTANA_A);
  return (
    <nav className="kunak-pagination" aria-label="Posts pagination">
      <ul className="page-numbers">
        {/* ⚠ **El enlace de «Previous» y el del número 1 apuntan en el original
            a `…/page/1/`, y eso NO es una ruta: es un 301.** Medido contra el
            original vivo el 2026-08-14:

              /es/recursos/articulos/page/1/   → 301 → /es/recursos/articulos/
              /es/recursos/articulos/page/16/  → 200
              /es/recursos/articulos/page/17/  → 404

            O sea que la frontera del servidor son 16 páginas y la 1 **no está
            entre ellas**. §Regla de rutas locales dice qué hacer con un href
            que tiene 301: el clon apunta al DESTINO y el href original queda
            anotado — que es esto. Copiar `/page/1` verbatim habría metido en el
            HTML servido un enlace que el build no emite, y `qa:enlaces` tiene
            razón en llamarlo roto.

            href original: `https://kunakair.com/es/recursos/<término>/page/1/` (301) */}
        {n > 1 ? (
          <>
            <li>
              <a className="prev page-numbers" href={href(n - 1)}>
                Previous
              </a>
            </li>{" "}
          </>
        ) : null}
        {nums.map((k, i) => (
          <Fragment key={k === null ? `d${i}` : k}>
            {i > 0 ? " " : null}
            <li>
              {k === null ? (
                <span className="page-numbers dots">&hellip;</span>
              ) : k === n ? (
                <span aria-current="page" className="page-numbers current">
                  {k}
                </span>
              ) : (
                <a className="page-numbers" href={href(k)}>
                  {k}
                </a>
              )}
            </li>
          </Fragment>
        ))}
        {n < total ? (
          <>
            {" "}
            <li>
              {/* El rótulo es «Siguiente» **a secas**: sin `»`, que es lo que
                  lleva la piel A. Verbatim del original. */}
              <a className="next page-numbers" href={href(n + 1)}>
                Siguiente
              </a>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}

/**
 * La ventana de números de las pieles A y C: primera, un entorno de la actual,
 * la última, y `null` donde hay salto.
 *
 * Devuelve `[1,2,3,null,8]` para `n=1, total=8`, que es lo que el corpus sirve.
 */
function ventana(n: number, total: number, radio: number): (number | null)[] {
  const quiere = new Set<number>([1, total]);
  for (let k = n - radio; k <= n + radio; k++) if (k >= 1 && k <= total) quiere.add(k);
  const orden = [...quiere].sort((a, b) => a - b);
  const salida: (number | null)[] = [];
  for (let i = 0; i < orden.length; i++) {
    if (i > 0 && orden[i] - orden[i - 1] > 1) salida.push(null);
    salida.push(orden[i]);
  }
  return salida;
}
