/**
 * EL PAGINADOR DE `LISTADO-B` — **dos pieles**, una por variante.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS TRES PIELES CENSADAS, Y LAS DOS QUE ESTA TANDA CONSTRUYE
 *
 * | variante | piel | selector | alto @1440 |
 * |---|---|---|---|
 * | `L1-blog` | **A** | `div.wp-pagenavi[role="pagination"]` | **42** |
 * | `L1-etiqueta` · `L2` | **B** | `div.wp-pagenavi[role="navigation"]` | **40** |
 * | `L1-resources` | **C** | `nav.kunak-pagination` | 42 — **no se construye** |
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

/** Cuántos números pinta la piel A alrededor del actual, medido en el corpus. */
const VENTANA_A = 2;

export function Paginador({
  piel,
  n,
  total,
  href,
}: {
  piel: "A" | "B";
  /** Página actual, 1-based. */
  n: number;
  total: number;
  /** `(k) => "/blog/page/3"`. La página 1 va sin sufijo, como el original. */
  href: (k: number) => string;
}) {
  if (total <= 1) return null;
  return piel === "A" ? <PielA n={n} total={total} href={href} /> : <PielB n={n} total={total} href={href} />;
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
  return (
    <div className="wp-pagenavi" role="pagination">
      {nums.map((k, i) =>
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
        ),
      )}
      {n < total ? (
        <a className="next page-numbers" href={href(n + 1)}>
          Siguiente &raquo;
        </a>
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
 * La ventana de números de la piel A: primera, un entorno de la actual, la
 * última, y `null` donde hay salto.
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
