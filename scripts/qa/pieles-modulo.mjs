/**
 * LAS PIELES POR MÓDULO — el CSS que Divi COMPILÓ, sobre todo el corpus congelado.
 * Uso:  npm run qa:pieles          (offline: sólo lee `corpus/`)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y POR QUÉ NO LA VIO LA SONDA ANTERIOR
 *
 * `qa:kb-tipografia` paró en un ESCALÓN: el `h2` de `articulos-kb` tiene TRES
 * pieles, salen CAMPO por el test B, y **ninguno de los 10 ejes que miró las
 * separa**. Los diez ejes eran: `style=` y `class=` de la etiqueta, las clases
 * del módulo, `estiloInline`, el reparto, la posición, la fila, `mb`, `mt` y las
 * etiquetas vecinas.
 *
 * Los diez son **atributos y estructura**. Ninguno es CSS.
 *
 *   > **El principio de `CLAUDE.md`: verificar contra la SALIDA SERVIDA, nunca
 *   > contra la fuente que uno supone responsable.** El escalón supuso que si el
 *   > editor tocó la tipografía tenía que quedar rastro en el marcado. Divi no
 *   > escribe marcado: **COMPILA CSS**, y lo sirve en el mismo documento.
 *
 * Lo servido, medido: `.et_pb_text_3 h2,.et_pb_text_5 h2 { font-weight:300;
 * font-size:44px; line-height:1.25em }`. Eso ES lo que escribió quien editó, con
 * su valor y su etiqueta. `et_pb_text_N` no es el campo —es el ordinal con el que
 * Divi cuelga la regla— pero **las declaraciones sí lo son**.
 *
 * ── Y de paso destapa una afirmación falsa que ya estaba en el esquema ─────
 * `MODULO_TEXTO_KB` dice, para justificar que no lleva tipografía:
 *
 *   > *«`estiloInline` es null en los 85 módulos: el editor no tocó ni la
 *   > interlínea ni el ancho en ninguno»*
 *
 * La premisa es cierta y **la conclusión no se sigue**: `estiloInline` es el
 * atributo `style=`, y Divi **no lo usa** — compila a `et-core-unified`. Medir la
 * ausencia de `style=` para concluir «el editor no tocó» es medir al nivel que
 * absorbe. Esta sonda mide al nivel donde vive la propiedad.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS DOS PREGUNTAS QUE CONTESTA, Y QUE SON ANTERIORES A LA FORMA DEL CAMPO
 *
 *   (a) **¿ES CERRADO el conjunto de pieles?** Un conjunto cerrado admite `enum`;
 *       uno abierto obliga a propiedades. 3 pieles de `h2` en 6 instancias no
 *       prueban nada: se cuenta sobre TODO el corpus.
 *
 *   (b) **¿EXISTE EL MECANISMO FUERA DE KB?** Si otras colecciones traen
 *       overrides por módulo, el campo NO es de `articulos-kb`: es del módulo de
 *       texto compartido, que estaría infra-especificado igual que lo estaba
 *       `inline` (§2d.3) — y entonces es un ENSANCHAMIENTO retrocompatible.
 *
 * ── La CAPA importa, y se lee del propio selector ─────────────────────────
 * `.et_pb_text_0_tb_header` y `…_tb_body` son módulos de la plantilla de
 * theme-builder; `.et_pb_text_18` es un módulo propio de la instancia. Es el
 * híbrido de `CLAUDE.md` §régimen: la capa `_tb_` la fijó quien construyó la
 * plantilla (se espera varianza CERO entre instancias) y la capa propia la
 * escribió quien editó la página. **La sonda las separa y las cuenta aparte**:
 * mezclarlas daría «el mecanismo existe en las 309», que es verdad de la
 * plantilla y falso del editor.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Evaluadas, QA, hoy, w } from "./lib.mjs";
import {
  esTitular,
  analizaSelector,
  cssDe,
  declara,
  hojasExternas,
  reglas,
  soloTipo,
} from "./css-compilado.mjs";

process.env.SIN_CLON = "1"; // no toca el clon: lee `corpus/`

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");

/* ── Las colecciones del corpus congelado, con su carpeta ─────────────────── */
const COLECCIONES = [
  ["articulos-kb", "fase-3/articulos-kb"],
  ["hubs-kb", "fase-3/hubs-kb"],
  ["entradas-blog", "entradas-blog"],
  ["terminos-kunakpedia", "terminos-kunakpedia"],
  ["documentos-cientificos", "documentos-cientificos"],
  ["casos", "casos"],
  ["faqs", "faqs"],
  ["productos", "productos"],
  ["sectores", "fase-3-sectores"],
  ["listados", "fase-3/listados"],
  ["sueltas", "fase-3/sueltas"],
  ["taxonomia-sector", "fase-3/taxonomia-sector"],
  ["categoria", "fase-3/categoria"],
  ["autor", "fase-3/autor"],
];

function htmlsDe(dir) {
  const out = [];
  const anda = (d) => {
    let entradas;
    try {
      entradas = readdirSync(d);
    } catch {
      return;
    }
    for (const e of entradas) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) anda(p);
      else if (e.endsWith(".html")) out.push(p);
    }
  };
  anda(dir);
  return out.sort();
}

/* El parser del CSS compilado, `analizaSelector`, `declara` y `soloTipo` viven
 * en `css-compilado.mjs`: los consume tambien `cms:extractor-kb`, y dos copias
 * serian la clase C7 — la sonda contando 82 overrides y el extractor
 * escribiendo otros, las dos verdes en su propio marco. */

/* ══════════════════════════════════════════════════════════════════════════
 * EL BARRIDO
 * ═════════════════════════════════════════════════════════════════════════ */
const paginas = [];
for (const [coleccion, carpeta] of COLECCIONES) {
  for (const f of htmlsDe(join(CORPUS, carpeta))) paginas.push({ coleccion, f });
}

const ev = new Evaluadas({ unidad: "páginas del corpus", minimo: paginas.length, nombre: "pieles-modulo" });

/** Guarda de la regla del cero: un patrón que no casa en NINGUNA página es defecto. */
const censo = { conStyle: 0, conModulo: 0, conTitular: 0 };

const porColeccion = {};
const filas = [];

for (const { coleccion, f } of paginas) {
  const html = readFileSync(f, "utf8");
  const css = cssDe(html);
  const c = (porColeccion[coleccion] ??= {
    paginas: 0,
    cssBytes: 0,
    hojasExternas: 0,
    reglasModulo: 0,
    titularPropia: 0,
    titularPlantilla: 0,
    /** piel → nº de reglas (capa propia, titular) */
    pielesTitularPropia: {},
    pielesTitularPlantilla: {},
    /** piel del MÓDULO (el texto del párrafo), capa propia */
    pielesModuloPropia: {},
    paginasConTitularPropio: 0,
  });
  c.paginas++;
  c.cssBytes += css.length;
  c.hojasExternas += hojasExternas(html);
  if (css.length) censo.conStyle++;

  let tuvoModulo = false;
  let tuvoTitularPropio = false;

  for (const { media, selector, declaraciones } of reglas(css)) {
    for (const sel of selector.split(",")) {
      const a = analizaSelector(sel);
      if (!a) continue;
      tuvoModulo = true;
      c.reglasModulo++;
      const tipo = soloTipo(declara(declaraciones));
      if (!tipo) continue; // ritmo/caja: no es piel tipográfica
      const clave = `${a.objetivo}${media ? ` @${media.replace(/@media\s*/g, "").replace(/\s+/g, "")}` : ""} { ${tipo} }`;
      if (esTitular(a.objetivo)) {
        censo.conTitular++;
        if (a.capa === "propia") {
          c.titularPropia++;
          c.pielesTitularPropia[clave] = (c.pielesTitularPropia[clave] || 0) + 1;
          tuvoTitularPropio = true;
          filas.push({ coleccion, pagina: relative(CORPUS, f).replace(/\\/g, "/"), modulo: `${a.tipo}_${a.n}`, objetivo: a.objetivo, media, tipo });
        } else {
          c.titularPlantilla++;
          c.pielesTitularPlantilla[clave] = (c.pielesTitularPlantilla[clave] || 0) + 1;
        }
      } else if (a.objetivo === "modulo" && a.capa === "propia" && a.tipo === "text") {
        c.pielesModuloPropia[clave] = (c.pielesModuloPropia[clave] || 0) + 1;
      }
    }
  }
  if (tuvoModulo) censo.conModulo++;
  if (tuvoTitularPropio) c.paginasConTitularPropio++;
  ev.ok();
}

/* ── Los muertos: patrones que no casaron en NINGUNA página ───────────────── */
const muertos = Object.entries(censo).filter(([, n]) => n === 0).map(([k]) => k);

/* ══════════════════════════════════════════════════════════════════════════
 * (a) ¿ES CERRADO EL CONJUNTO?
 * ═════════════════════════════════════════════════════════════════════════ */
const todasPropias = {};
for (const c of Object.values(porColeccion))
  for (const [p, n] of Object.entries(c.pielesTitularPropia)) todasPropias[p] = (todasPropias[p] || 0) + n;

/** Las PROPIEDADES que aparecen en alguna piel de titular de capa propia. */
const propiedades = {};
for (const p of Object.keys(todasPropias)) {
  const cuerpo = p.slice(p.indexOf("{") + 1, p.lastIndexOf("}"));
  for (const d of cuerpo.split(";")) {
    const k = d.split(":")[0].trim();
    if (k) propiedades[k] = (propiedades[k] || 0) + 1;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * (b) ¿EXISTE EL MECANISMO FUERA DE KB?
 * ═════════════════════════════════════════════════════════════════════════ */
const fueraDeKb = Object.entries(porColeccion)
  .filter(([k]) => k !== "articulos-kb")
  .filter(([, c]) => c.titularPropia > 0)
  .map(([k, c]) => ({ coleccion: k, reglas: c.titularPropia, paginas: c.paginasConTitularPropio, de: c.paginas, pieles: Object.keys(c.pielesTitularPropia).length }));

const pielesKb = new Set(Object.keys(porColeccion["articulos-kb"]?.pielesTitularPropia ?? {}));
const compartidas = [];
for (const [k, c] of Object.entries(porColeccion)) {
  if (k === "articulos-kb") continue;
  for (const p of Object.keys(c.pielesTitularPropia)) if (pielesKb.has(p)) compartidas.push({ coleccion: k, piel: p, n: c.pielesTitularPropia[p] });
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ PIELES POR MÓDULO · el CSS que Divi COMPILÓ ════════`);
console.log(`  ${paginas.length} páginas del corpus congelado · ${Object.keys(porColeccion).length} colecciones\n`);
console.log(`  ${"colección".padEnd(22)} ${"pág".padStart(4)} ${"hojas ext".padStart(9)} ${"reglas mód".padStart(10)} ${"tit·propia".padStart(10)} ${"tit·plant".padStart(9)} ${"pieles".padStart(6)}`);
for (const [k, c] of Object.entries(porColeccion))
  console.log(
    `  ${k.padEnd(22)} ${String(c.paginas).padStart(4)} ${String(c.hojasExternas).padStart(9)} ${String(c.reglasModulo).padStart(10)} ` +
      `${String(c.titularPropia).padStart(10)} ${String(c.titularPlantilla).padStart(9)} ${String(Object.keys(c.pielesTitularPropia).length).padStart(6)}`,
  );

console.log(`\n── (a) ¿ES CERRADO EL CONJUNTO? ──────────────────────────────`);
console.log(`  pieles DISTINTAS de titular en capa propia, todo el corpus: ${Object.keys(todasPropias).length}`);
console.log(`  propiedades que el editor escribe: ${Object.entries(propiedades).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join(" · ")}`);
const kbPieles = Object.entries(porColeccion["articulos-kb"]?.pielesTitularPropia ?? {}).sort((a, b) => b[1] - a[1]);
console.log(`\n  de las cuales, en \`articulos-kb\` (${kbPieles.length}):`);
for (const [p, n] of kbPieles) console.log(`      ×${String(n).padStart(3)}  ${p}`);

console.log(`\n── (b) ¿EXISTE EL MECANISMO FUERA DE KB? ─────────────────────`);
if (!fueraDeKb.length) console.log(`  NO — 0 colecciones fuera de \`articulos-kb\` con override de titular en capa propia.`);
else
  for (const x of fueraDeKb)
    console.log(`  SÍ · ${x.coleccion.padEnd(22)} ${x.reglas} reglas en ${x.paginas}/${x.de} páginas · ${x.pieles} pieles distintas`);
console.log(`\n  pieles IDÉNTICAS a alguna de KB fuera de KB: ${compartidas.length}`);
for (const x of compartidas.slice(0, 12)) console.log(`      · ${x.coleccion} ×${x.n}  ${x.piel}`);

console.log(`\n── EL MÓDULO DE TEXTO EN SÍ (capa propia, \`.et_pb_text_N\` a secas) ──`);
const modKb = Object.entries(porColeccion["articulos-kb"]?.pielesModuloPropia ?? {}).sort((a, b) => b[1] - a[1]);
console.log(`  \`articulos-kb\`: ${modKb.length} pieles distintas`);
for (const [p, n] of modKb) console.log(`      ×${String(n).padStart(3)}  ${p}`);

w("medidas/pieles-modulo.json", {
  meta: {
    fecha: hoy(),
    que: "Las pieles tipográficas que Divi COMPILÓ por módulo, leídas del CSS servido de todo el corpus congelado.",
    fuente: "corpus/**/*.html (bloques <style> del documento servido)",
    porQue:
      "`qa:kb-tipografia` buscó el discriminador en 10 ejes de MARCADO y estructura, y no en el CSS. " +
      "Divi no escribe marcado: compila CSS y lo sirve en el mismo documento.",
    alcance:
      "Sólo los <style> EN LÍNEA del documento congelado. Las hojas externas no están capturadas " +
      "(§F3-1-CSS-NO-CAPTURADO), así que un override que viviera SÓLO en ellas no se vería: el recuento es un MÍNIMO.",
    capas: "`_tb_header|body|footer` = plantilla de theme-builder; sin sufijo = módulo propio de la instancia (builder).",
  },
  censo,
  porColeccion,
  cerrado: { pieles: todasPropias, propiedades },
  fueraDeKb,
  compartidas,
  filas,
});

let fallos = 0;
if (muertos.length) {
  console.error(`\n❌ PATRÓN MUERTO: ${muertos.join(", ")} no casó en NINGUNA de las ${paginas.length} páginas.`);
  fallos++;
}
if (fallos) process.exitCode = 2;
else console.log(`\n✅ barrido completo.`);
ev.informe();
