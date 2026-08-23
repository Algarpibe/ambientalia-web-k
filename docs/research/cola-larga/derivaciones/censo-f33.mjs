/* censo-f33 — 96.ª tanda, 2026-08-23. CORTE LIMPIO 2, la evidencia.
 *
 * Qué etiquetas de los campos RICOS de las 31 caen FUERA del censo de 43 que
 * `campoHtml` valida. Es lo que paró la siembra de `paginas`, y se congela aquí
 * para que la decisión de la 97.ª se tome sobre un dato y no sobre un recuerdo
 * (§regla 9).
 *
 * ⚠ **El censo se LEE del fuente que lo declara**, no se copia: una segunda
 * lista de 43 etiquetas dentro de esta derivación envejecería contra el repo en
 * silencio y no daría error (§regla 9, caso 7 — un conjunto enumerado a mano
 * dentro de una sonda es un dato recordado).
 *
 * ── Qué contesta y qué NO ────────────────────────────────────────────────
 * CONTESTA: qué etiquetas, en cuántas páginas, y en qué campo de qué módulo.
 * NO CONTESTA: si son legítimas. `<article>`/`<header>`/`<svg>` pueden ser un
 * LISTADO EMBEBIDO —o sea una CONSULTA congelada como texto, que es lo que
 * §*un listado no tiene contenido propio* prohíbe— y eso exige mirar el
 * contenido, no la etiqueta. Esa es la medida que la 97.ª tiene que hacer.
 *
 * ⚠ `codigo.html` queda FUERA a propósito: es `type: "code"`, no `campoHtml`, y
 * su descripción dice que existe **para meter lo que el censo prohíbe**.
 * Contarlo aquí inflaría el hueco con lo único que sí tiene sitio.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "../../../..");

const src = readFileSync(join(RAIZ, "packages/cms-config/src/campos/comunes.ts"), "utf8");
const bloque = /export const ETIQUETAS_CENSADAS = \[([\s\S]*?)\] as const;/.exec(src);
if (!bloque) throw new Error("no encuentro ETIQUETAS_CENSADAS: el censo no se puede derivar (§sondas 4)");
const CENSO = new Set([...bloque[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
if (CENSO.size < 10) throw new Error(`censo de ${CENSO.size} etiquetas: el regex no casó (§sondas 4, el cero)`);

const j = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-extraido.json"), "utf8"));

/** Los campos que pasan por `campoHtml` → `validaHtmlCorpus`. */
const RICOS = { "texto-pagina": ["html"], toggle: ["cuerpo"], blurb: ["descripcion"] };
const RICOS_ARR = { slider: "diapositivas", "slider-completo": "diapositivas", mapa: "pines" };

const porTag = {};
const sitios = {};
const anota = (html, pag, donde) => {
  if (typeof html !== "string") return;
  for (const m of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b/g)) {
    const t = m[1].toLowerCase();
    if (CENSO.has(t)) continue;
    (porTag[t] ??= new Set()).add(pag);
    (sitios[t] ??= new Set()).add(donde);
  }
};
const rec = (v, pag) => {
  if (Array.isArray(v)) return v.forEach((x) => rec(x, pag));
  if (v && typeof v === "object") {
    if (v.kind) {
      for (const c of RICOS[v.kind] ?? []) anota(v[c], pag, `${pag}·${v.kind}.${c}`);
      const arr = RICOS_ARR[v.kind];
      if (arr && Array.isArray(v[arr]))
        for (const d of v[arr])
          for (const [k, x] of Object.entries(d))
            if (typeof x === "string" && /<[a-z]/i.test(x)) anota(x, pag, `${pag}·${v.kind}.${arr}.${k}`);
    }
    for (const x of Object.values(v)) rec(x, pag);
  }
};
for (const p of j.catalogo.paginas) {
  rec(p.bloques ?? [], p.slug);
  if (p.cuerpoClasico) anota(p.cuerpoClasico, p.slug, `${p.slug}·cuerpoClasico`);
}

const afectadas = new Set(Object.values(porTag).flatMap((s) => [...s]));

console.log(`═══ censo-f33 · las etiquetas de F3-3 fuera del censo de campoHtml\n`);
console.log(`  censo declarado (leído de comunes.ts)   ${CENSO.size} etiquetas`);
console.log(`  documentos de f33-extraido              ${j.catalogo.paginas.length}`);
console.log(`  PÁGINAS AFECTADAS                       ${afectadas.size} de ${j.catalogo.paginas.length}\n`);

console.log(`  etiqueta      páginas   dónde`);
for (const [t, s] of Object.entries(porTag).sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  <${t}>`.padEnd(15) + String(s.size).padStart(5) + `     ${[...s].sort().join(" · ")}`);
}

console.log(`\n  y el SITIO exacto, que es lo que dice si es contenido o cascarón:`);
for (const [t, s] of Object.entries(sitios).sort((a, b) => b[1].size - a[1].size))
  for (const x of [...s].sort()) console.log(`     <${t}>  ${x}`);

console.log(`\n  ⚠ LO QUE ESTO NO DICE: si son legítimas. \`<meta itemprop>\` viene de una miga`);
console.log(`     \`schema.org/BreadcrumbList\` servida DENTRO del \`et_pb_text\`, y`);
console.log(`     \`<article>/<header>/<svg>\` pueden ser un LISTADO EMBEBIDO — o sea una`);
console.log(`     CONSULTA, que no se congela como texto. Eso se mide, no se deduce.`);
