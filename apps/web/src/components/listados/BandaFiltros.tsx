import type { ReactNode } from "react";

/**
 * LA BANDA DE FILTROS de `L3` y `L5` — **geometría obligatoria**, aunque su
 * comportamiento no lo sea.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTE COMPONENTE EXISTE ANTES QUE EL FILTRADO
 *
 * ⚠ **Ninguna de las dos specs la nombra**, y las dos congelan números que la
 * incluyen: en `L3`, `h1.y = 337.59` y el listado en `y = 500.39` dejan
 * **162.8 px** sin dueño; en `L5`, `593.28` y `857.88` dejan **264.6**.
 * **Construir sin la banda sube el listado esos píxeles** — el número estaba
 * dentro de las medidas y el elemento fuera del texto, que es cómo un hueco
 * llega a la construcción sin que nada dé error (§UNA REGLA INCOMPLETA SE LEE
 * IGUAL QUE UNA COMPLETA).
 *
 * Derivada en `medidas/lh-huecos.json` (`qa:lh-huecos`, negativo 6/6):
 *
 * | | `L3` | `L5` |
 * |---|---|---|
 * | envoltorio | `.scientific-filter` | `.case-filter` |
 * | título | **no lleva** | `h2.case-filter-title` «Sectores» |
 * | etiqueta de los botones | **`<a>`** | **`<button>`** con `data-filter` |
 * | cuántos | **3** (uno por término) | **12** (11 sectores + «Ver todos») |
 * | alto | **108.8** | **210.6** |
 * | clase del grupo | `button-group filtros-scientific` | `button-group` |
 *
 * ⚠ **La clase del grupo importa y no es cosmética**: la hoja del tema sirve
 * `.button-group:not(.filtros-resources):not(.filtros-scientific) { padding-top:
 * 16px }`, o sea que **`L5` lleva ese padding y `L3` no**, y la diferencia la
 * decide una clase. Es §El principio: se replica lo que el navegador hace con
 * lo servido, no lo que el marcado parece querer decir.
 *
 * ── ⛔ En `L5` la banda entra INERTE, y eso es una desviación DECLARADA ────
 * El filtrado por sector consume la relación `caso → sector`, que se decide en
 * **F3-4** (§LH-C6-FILTRO-L5). Lo que se declara es *«sin FILTRADO»*, **no «sin
 * BANDA»**: son dos cosas, la banda es geometría y omitirla es un defecto de
 * 264.6 px con una desviación por coartada.
 */
export function BandaFiltros({
  variante,
  titulo,
  children,
}: {
  variante: "sci" | "casos";
  /** Sólo `L5`: el `h2.case-filter-title`. `L3` **no lleva título**. */
  titulo?: string;
  children: ReactNode;
}) {
  const esSci = variante === "sci";
  return (
    <div className={esSci ? "scientific-filter" : "case-filter"}>
      {titulo ? <h2 className="case-filter-title">{titulo}</h2> : null}
      <div id="filters" className={esSci ? "button-group filtros-scientific" : "button-group"}>
        {children}
      </div>
    </div>
  );
}

/**
 * Un botón de la banda de `L3`: un `<a>` al archivo del término, con `current`
 * en el que se está viendo.
 *
 * ⚠ **Los 3 botones consumen la TAXONOMÍA ENTERA, no el término**: la consulta
 * de esta forma necesita **los 3 términos** aunque pinte las tarjetas de uno.
 */
export function BotonTermino({ href, actual, children }: { href: string; actual: boolean; children: ReactNode }) {
  return (
    <a href={href} className={actual ? "button current" : "button"}>
      {children}
    </a>
  );
}
