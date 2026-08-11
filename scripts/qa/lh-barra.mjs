/**
 * ¿LA RETÍCULA DEL CUERPO ES LA MISMA EN LAS TRES VARIANTES DE `L1`? — y qué
 * hay en la columna que sobra.
 * Uso: node scripts/qa/lh-barra.mjs        (npm run qa:lh-barra)
 *
 * ── De dónde sale la pregunta ─────────────────────────────────────────────
 * De `qa:lh-spec` (fase de specs de F3-2), midiendo la retícula por primera vez:
 * `/es/blog/` sirve su listado en una fila **`3_4 + 1_4`** con la columna de
 * contenido a **911.75**, y `/es/recursos/articulos/` en una fila **`4_4`** a
 * **1238.39**. Las dos son `L1`, y `DECISIONES.md` §D1 afirma que **lo único que
 * difiere entre familias de `L1` es la configuración del módulo de tarjetas**.
 *
 * Esa afirmación se apoya en `lh-censo`, que midió **el primer nivel de
 * secciones** — 6 secciones y 2 `_tb_body` en 23/23, sin excepción, y es
 * verdad—. Pero la barra lateral **no vive en ese nivel**: vive en una FILA
 * dentro de la 2.ª sección. Es §La causa común de `CLAUDE.md` en su forma
 * literal: **se midió al nivel que absorbe**, y el contenedor —el recuento de
 * secciones— tenía holgura de sobra para esconder una columna entera.
 *
 * ── Por qué sobre la CAPTURA y no en vivo ─────────────────────────────────
 * Porque la pregunta es de MARCADO SERVIDO y la población entera ya está
 * congelada: **149 documentos** de F3-0. Medir en vivo daría 13 páginas y una
 * cota; medir aquí da el censo completo sin tocar el original. Lo que sí exige
 * el vivo es el píxel, y ése lo pone `lh-spec` (911.75 / 1238.39 medidos).
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · los tres patrones son DISCRIMINANTES, así que declaran **mínimo y
 *     máximo**: si uno casa en 0 documentos sale MUERTO y si casa en los 149
 *     sale UBICUO, los dos con código ≠ 0 (§sondas 4 y su complementario). Un
 *     patrón de barra lateral que casara en todo es exactamente lo que le pasó
 *     a `lh-serie` con su firma `sb`, que da `·sb` en las 149 porque mira
 *     `et_pb_widget_area` **en el documento entero** — y el pie también tiene
 *     widgets;
 * 2 · `Evaluadas`, mínimo derivado del recuento de ficheros de la captura;
 * 3 · congela en `medidas/lh-barra.json`;
 * 4 · negativo: `SABOTAJE=patron-falso|patron-ubicuo|familia-vacia`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const SAB = process.env.SABOTAJE ?? "";
const RAIZ = join(QA, "../..");
const BASE = join(RAIZ, "corpus/fase-3/listados");

const ficheros = (d, acc = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) ficheros(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
};
const F = ficheros(BASE);
if (!F.length) throw new Error(`la captura de F3-0 no está en ${BASE}: sin población no hay censo`);

/** Marcado sin `<style>`/`<script>`: el CSS de Divi nombra sus propias clases y
 *  ya hizo pasar un selector por marcado una vez (`lh-censo`, defecto 1). */
const marcado = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

/* ⚠ El `_tb_body` del sufijo es lo que separa el CUERPO del pie. Sin él, el
 * patrón casa también con los widgets del pie y sale ubicuo. */
const PATRONES = {
  barraEnElCuerpo: SAB === "patron-falso" ? /class="[^"]*\bno-existe-esta-barra\b/ : /class="[^"]*\bet_pb_sidebar_\d+_tb_body\b/,
  columna1_4: SAB === "patron-ubicuo" ? /</ : /class="[^"]*\bet_pb_column_1_4\b[^"]*\bet_pb_column_\d+_tb_body\b/,
  columna3_4: /class="[^"]*\bet_pb_column_3_4\b[^"]*\bet_pb_column_\d+_tb_body\b/,
};

/** La familia se deriva de la RUTA, que es la misma partición que usa el censo. */
const familiaDe = (r) =>
  /^\/etiqueta\//.test(r) ? "L1-etiqueta"
  : /^\/blog(\/|$)/.test(r) ? "L1-blog"
  : /^\/recursos\/articulos(\/|$)/.test(r) || /^\/recursos\/seminarios-web(\/|$)/.test(r) ? "L1-resources"
  : /^\/scientific-category\//.test(r) ? "L3-sci"
  : /^\/glosario(\/|$)/.test(r) ? "L2-glosario"
  : /^\/preguntas-frecuentes(\/|$)/.test(r) ? "L2-faqs"
  : /^\/casos-de-exito(\/|$)/.test(r) ? "L5-casos"
  : /^\/recursos(\/page)?(\/|$)/.test(r) ? "L4-hub"
  : "otra";

const ev = new Evaluadas({ nombre: "lh-barra", unidad: "documentos", minimo: SAB === "familia-vacia" ? F.length + 1 : F.length });

const casos = Object.fromEntries(Object.keys(PATRONES).map((k) => [k, 0]));
const porFamilia = {};
const firmas = {};

for (const f of F) {
  const ruta = "/" + relative(BASE, f).replace(/\\/g, "/").replace(/\/index\.html$/, "").replace(/^index\.html$/, "");
  const m = marcado(readFileSync(f, "utf8"));
  const hit = Object.fromEntries(Object.entries(PATRONES).map(([k, re]) => [k, re.test(m)]));
  for (const k of Object.keys(PATRONES)) if (hit[k]) casos[k]++;

  const fam = familiaDe(ruta);
  const acc = (porFamilia[fam] ??= { n: 0, conBarra: 0, con3_4: 0, rutasSinBarra: [] });
  acc.n++;
  if (hit.barraEnElCuerpo) acc.conBarra++;
  else acc.rutasSinBarra.push(ruta);
  if (hit.columna3_4) acc.con3_4++;

  /* La COMPOSICIÓN de la barra: qué widgets, en qué orden. Es lo que decide si
   * es plantilla (varianza 0) o contenido por instancia. */
  if (hit.barraEnElCuerpo) {
    const i = m.search(PATRONES.barraEnElCuerpo);
    const trozo = m.slice(i, i + 14000);
    const widgets = [...trozo.matchAll(/<div[^>]*id="([^"]+)"[^>]*class="([^"]*widget[^"]*)"/g)].map((x) => x[1]);
    const titulos = [...trozo.matchAll(/<h[1-6][^>]*class="[^"]*widgettitle[^"]*"[^>]*>([\s\S]*?)<\/h[1-6]>/g)].map((x) => x[1].replace(/<[^>]+>/g, "").trim());
    const clave = JSON.stringify({ widgets, titulos });
    (firmas[clave] ??= []).push(ruta);
  }
  ev.ok();
}

/* ── Las dos guardas de patrón discriminante ─────────────────────────────── */
let rotos = 0;
for (const [k, n] of Object.entries(casos)) {
  if (n === 0) { console.error(`❌ patrón MUERTO: \`${k}\` no casa en NINGUNO de los ${F.length} documentos. Un cero de selector no es un cero de dato.`); rotos++; }
  else if (n === F.length) { console.error(`❌ patrón UBICUO: \`${k}\` casa en los ${F.length}. Si su trabajo es discriminar, casar en todos no mide nada.`); rotos++; }
}

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿la retícula del CUERPO es la misma en las tres variantes de L1, y qué hay en la columna que sobra?",
    fuente: "corpus/fase-3/listados — captura congelada de F3-0, población COMPLETA (sin red, sin muestreo)",
    porQue: "lh-spec midió por primera vez la retícula y dio 3_4+1_4 en blog contra 4_4 en resources. DECISIONES.md §D1 dice que entre familias de L1 sólo difiere la configuración de tarjeta.",
    sabotaje: SAB || null,
    noMide: [
      "el píxel: los anchos 911.75 / 1238.39 los pone lh-spec contra el original vivo",
      "el comportamiento del buscador de la barra: no se abrió navegador aquí",
      "las instancias de L1 que la captura no trae",
    ],
  },
  documentos: F.length,
  patrones: casos,
  porFamilia,
  barraLateral: {
    documentosConBarra: Object.values(porFamilia).reduce((s, v) => s + v.conBarra, 0),
    firmasDistintas: Object.keys(firmas).length,
    firmas: Object.entries(firmas).map(([k, v]) => ({ ...JSON.parse(k), enDocumentos: v.length, ejemplo: v[0] })),
  },
};

console.log(`\n═══ RETÍCULA DEL CUERPO — ${F.length} documentos de la captura`);
console.log(`  familia`.padEnd(24) + `n`.padStart(5) + `  con barra lateral`.padEnd(22) + `con columna 3_4`);
for (const [k, v] of Object.entries(porFamilia).sort())
  console.log(`  ${k.padEnd(22)}${String(v.n).padStart(5)}${String(v.conBarra).padStart(16)}${String(v.con3_4).padStart(22)}`);
console.log(`\n  barra lateral: ${salida.barraLateral.documentosConBarra} documentos · ${salida.barraLateral.firmasDistintas} firma(s) distinta(s)`);
for (const f of salida.barraLateral.firmas)
  console.log(`    ${f.enDocumentos} docs · ${f.widgets.length} widgets · títulos: ${f.titulos.join(" | ")}`);
/* La partición se declara: dentro de cada familia tiene que ser 0 o n, nunca
 * intermedia — si lo fuera, «variante» sería la palabra equivocada. */
const mixtas = Object.entries(porFamilia).filter(([, v]) => v.conBarra !== 0 && v.conBarra !== v.n);
console.log(`  familias con reparto MIXTO (ni 0 ni n): ${mixtas.length}${mixtas.length ? " → " + mixtas.map(([k]) => k).join(" · ") : "  ← la partición es por familia, no por instancia"}`);
console.log(`✓ evaluadas ${F.length}/${F.length} documentos · retícula del cuerpo`);

salida.veredicto = {
  particionPorFamilia: mixtas.length === 0,
  familiasConBarra: Object.entries(porFamilia).filter(([, v]) => v.conBarra === v.n && v.n > 0).map(([k]) => k),
  familiasSinBarra: Object.entries(porFamilia).filter(([, v]) => v.conBarra === 0).map(([k]) => k),
  lectura:
    mixtas.length === 0
      ? "régimen plantillado: varianza 0 DENTRO de cada familia y distinta ENTRE familias ⇒ distingue PLANTILLAS (variantes), no campos — la misma lectura que la configuración de tarjeta"
      : "⚠ reparto mixto dentro de una familia: «variante» no es la palabra correcta, hay que mirarlo",
};

w("medidas/lh-barra.json", salida);
process.exit(rotos || salida.veredicto.particionPorFamilia === false ? 2 : 0);
