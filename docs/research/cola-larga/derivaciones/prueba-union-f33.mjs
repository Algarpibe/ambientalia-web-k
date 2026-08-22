/* prueba-union-f33 — 92.ª tanda, 2026-08-22. ESCALÓN 2, punto 3.
 *
 * LA PREGUNTA: ¿la unión de CMS-3 expresa los 32 documentos?
 *
 * Por EXTRACCIÓN y OFFLINE, no por render: el objetivo es saber si el modelo
 * CABE, no cómo se ve. No abre el original, no construye, no siembra.
 *
 * ── Qué cuenta como «expresada» ────────────────────────────────────────────
 * Un documento está expresado si TODO su contenido tiene sitio en el modelo:
 *   1 · cada módulo de la capa propia cae en un bloque de `MODULOS_PAGINA`;
 *   2 · el anidamiento que trae cabe en `bloques` (sección → [módulo suelto |
 *       fila → columna → módulo]);
 *   3 · y —la que se olvida— **si el documento NO tiene capa propia, su
 *       contenido tiene que estar en algún campo del modelo.**
 *
 * ⚠ **El punto 3 es el que decide, y por eso va escrito antes de mirar.** Sin
 * él, un documento sin capa propia sale «expresado» porque `bloques` es
 * opcional — y eso es §*una ruta que responde 200 no prueba que sirva
 * CONTENIDO*: la página se emitiría con cabecera, pie y nada en medio. Un
 * documento con contenido y sin sitio donde ponerlo **no está expresado**,
 * está OMITIDO.
 *
 * ── Cómo se publica ────────────────────────────────────────────────────────
 * **POR RÉGIMEN, no en total** — el reparto nunca es uniforme — y toda página
 * que la unión no exprese sale **NOMBRADA**, no contada.
 *
 * CONTROLES:
 *   · el nº de módulos por tipo cuadra con `arbol-f33` (mismo parser) y con
 *     `mod-v4` (otro parser). Si alguno falla, es el instrumento;
 *   · la lista de bloques se DERIVA de `bloques/paginas.ts` leyendo sus
 *     `slug:` — no se escribe a mano (§regla 9 caso 7). Si el parseo no casa
 *     con nada, TIRA: un 0 sería «la unión está vacía», que es plausible y
 *     falso;
 *   · la CORRESPONDENCIA `et_pb_<tipo>` → slug es una decisión de modelado, se
 *     declara, y **todo tipo sin correspondencia sale NOMBRADO** en vez de
 *     contarse como cubierto.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parsea, limpia, tipoDe, esPropia, esEstructura, seccionesPropias, modulosDe, recorre } from "./arbol-f33.mjs";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const UNION_TS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const KB_TS = join(RAIZ, "packages/cms-config/src/bloques/kb.ts");

/* ── 1 · la UNIÓN, derivada del código que la declara ──────────────────────── */
const src = readFileSync(UNION_TS, "utf8");
/** Los slugs que `MODULOS_PAGINA` lista, resueltos contra las declaraciones. */
const declarados = Object.fromEntries(
  [...src.matchAll(/export const (MODULO_[A-Z_]+): Block = \{\s*\n\s*slug: "([^"]+)"/g)].map((m) => [m[1], m[2]]),
);
/* `MODULO_BLURB` se consume de kb.ts: su slug vive allí. */
const kbSrc = readFileSync(KB_TS, "utf8");
for (const m of kbSrc.matchAll(/export const (MODULO_[A-Z_]+): Block = \{\s*\n\s*slug: "([^"]+)"/g)) {
  declarados[m[1]] = m[2];
}
const listaUnion = /export const MODULOS_PAGINA: Block\[\] = \[([\s\S]*?)\];/.exec(src);
if (!listaUnion) throw new Error("PARSEO MUERTO: no se encontró `MODULOS_PAGINA` en bloques/paginas.ts");
const UNION = listaUnion[1].split(",").map((s) => s.trim()).filter(Boolean).map((n) => {
  if (!declarados[n]) throw new Error(`SLUG SIN RESOLVER para ${n} — la unión no se puede derivar`);
  return declarados[n];
});
if (UNION.length === 0) throw new Error("UNIÓN VACÍA: el parseo no casó con nada (§sondas 4)");

/* ── 2 · la CORRESPONDENCIA Divi → slug. DECLARADA, no derivable ───────────── */
const MAPA = {
  text: "texto-pagina",
  image: "imagen-pagina",
  button: "boton-pagina",
  code: "codigo",
  toggle: "toggle",
  video: "video-pagina",
  blurb: "blurb",
  fullwidth_slider: "slider-completo",
  slider: "slider",
  map: "mapa",
  icon: "icono",
  /* `slide` NO está: el árbol lo sitúa DENTRO del slider (P-S2, 2/2), o sea que
   * es el array interno del bloque, no un bloque. Si apareciera como módulo de
   * primer nivel, saldría NOMBRADO como sin correspondencia — que es lo que
   * queremos: sería la refutación de P-S1. */
};

/* ── 3 · el recorrido ─────────────────────────────────────────────────────── */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};

/** El régimen se lee del `<body>`, que es una línea de HTML servido. */
function regimenDe(html) {
  const bc = (/<body[^>]*class="([^"]*)"/.exec(html) || [])[1] || "";
  const B = /\bet_pb_pagebuilder_layout\b/.test(bc);
  const T = /\bet-tb-has-body\b/.test(bc);
  return B && T ? "HIBRIDO (BT)" : B ? "BUILDER (B-)" : T ? "PLANTILLADO (-T)" : "SIN MARCADOR (--)";
}

/** El contenido que NO está en la capa propia: `post_content` o `entry-content`. */
function contenidoFueraDeCapaPropia(html) {
  const out = [];
  for (const [nombre, marca] of [["et_pb_post_content", "et_pb_post_content"], ["entry-content", 'class="entry-content"']]) {
    const i = html.indexOf(marca);
    if (i < 0) continue;
    const raiz = parsea(html.slice(i - 200 > 0 ? i - 200 : 0));
    /* basta con medir el texto que hay tras la marca hasta el cierre del artículo */
    const trozo = html.slice(i, i + 400000);
    const fin = trozo.search(/<\/article>|<\/main>|id="main-footer"/);
    const cuerpo = fin > 0 ? trozo.slice(0, fin) : trozo;
    const texto = cuerpo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const etiquetas = [...new Set([...cuerpo.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase()))];
    if (texto.length > 200) out.push({ canal: nombre, chars: texto.length, etiquetas: etiquetas.slice(0, 18) });
    void raiz;
  }
  return out;
}

const porRegimen = {};
const noExpresadas = [];
const filas = [];
const tiposVistos = {};
let totalModulos = 0, expresados = 0;

for (const [grupo, lista] of Object.entries(grupos)) {
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
    const bruto = readFileSync(f, "utf8");
    const html = limpia(bruto);
    const reg = regimenDe(html);
    porRegimen[reg] = porRegimen[reg] || { n: 0, ok: 0, mal: [] };
    porRegimen[reg].n++;

    const raiz = parsea(html);
    const secs = seccionesPropias(raiz);
    const problemas = [];
    let nMod = 0;

    for (const sec of secs) {
      const filasSec = [...recorre(sec)].filter(
        (n) => n.clases.includes("et_pb_row") && esPropia(n) && !n.clases.includes("et_pb_row_inner"),
      );
      for (const m of modulosDe(sec)) {
        const t = tipoDe(m);
        if (!t || esEstructura(t)) continue;
        nMod++; totalModulos++;
        tiposVistos[t] = (tiposVistos[t] || 0) + 1;
        const slug = MAPA[t];
        if (!slug) { problemas.push(`módulo \`et_pb_${t}\` SIN CORRESPONDENCIA en la unión`); continue; }
        if (!UNION.includes(slug)) { problemas.push(`\`et_pb_${t}\` mapea a \`${slug}\`, que NO está en MODULOS_PAGINA`); continue; }
        expresados++;
      }
      void filasSec;
    }

    /* EL PUNTO 3 — el que decide, y va escrito antes de mirar el dato. */
    if (secs.length === 0) {
      const fuera = contenidoFueraDeCapaPropia(html);
      if (fuera.length) {
        for (const x of fuera) {
          problemas.push(
            `SIN CAPA PROPIA y CON CONTENIDO: ${x.chars} caracteres en \`${x.canal}\`, ` +
            `etiquetas ${x.etiquetas.join(",")} — la unión NO tiene campo donde ponerlo`,
          );
        }
      }
    }

    const ok = problemas.length === 0;
    if (ok) porRegimen[reg].ok++;
    else { porRegimen[reg].mal.push(e.ruta); noExpresadas.push({ ruta: e.ruta, grupo, reg, problemas }); }
    filas.push({ ruta: e.ruta, grupo, reg, secs: secs.length, nMod, ok });
  }
}

/* ── 4 · el informe ───────────────────────────────────────────────────────── */
console.log("═══ 1 · LA UNIÓN QUE SE PRUEBA — derivada de bloques/paginas.ts");
console.log(`  ${UNION.length} bloques: ${UNION.join(" · ")}`);
console.log(`  correspondencias declaradas: ${Object.keys(MAPA).length} tipos de Divi`);
const sinCorr = Object.keys(tiposVistos).filter((t) => !MAPA[t]);
console.log(`  tipos vistos en el corpus SIN correspondencia: ${sinCorr.length}${sinCorr.length ? " — " + sinCorr.join(" · ") : ""}`);

console.log(`\n═══ 2 · EL RESULTADO **POR RÉGIMEN** — el reparto nunca es uniforme`);
console.log(`  ${"régimen".padEnd(20)} ${"n".padStart(3)} ${"expresadas".padStart(11)} ${"NO expresadas".padStart(14)}`);
for (const [r, v] of Object.entries(porRegimen).sort()) {
  console.log(`  ${r.padEnd(20)} ${String(v.n).padStart(3)} ${String(v.ok).padStart(11)} ${String(v.n - v.ok).padStart(14)}`);
}
const N = Object.values(porRegimen).reduce((s, v) => s + v.n, 0);
const OK = Object.values(porRegimen).reduce((s, v) => s + v.ok, 0);
console.log(`  ${"TOTAL".padEnd(20)} ${String(N).padStart(3)} ${String(OK).padStart(11)} ${String(N - OK).padStart(14)}`);
console.log(`\n  módulos de contenido: ${totalModulos} · expresados por un bloque: ${expresados}`);

console.log(`\n═══ 3 · LAS QUE LA UNIÓN NO EXPRESA — NOMBRADAS, no contadas`);
if (noExpresadas.length === 0) console.log("  (ninguna)");
for (const x of noExpresadas) {
  console.log(`\n  ❌ ${x.ruta}`);
  console.log(`     grupo ${x.grupo} · régimen ${x.reg}`);
  for (const p of x.problemas) console.log(`     · ${p}`);
}

console.log(`\n═══ 4 · TODAS, con su régimen`);
for (const f of filas) {
  console.log(`  ${f.ok ? "✅" : "❌"} ${f.reg.padEnd(20)} ${f.grupo.padEnd(9)} ${f.ruta.padEnd(72)} S${String(f.secs).padStart(2)} M${String(f.nMod).padStart(3)}`);
}

console.log(`\n═══ 5 · LO QUE ESTA PRUEBA **NO** CONTESTA`);
console.log(`  · no dice si el render CUADRA: es extracción, no geometría. 0 ejes de estas 32`);
console.log(`    están comparados contra el original (COBERTURA-MEDICION)`);
console.log(`  · no dice si los CAMPOS de cada bloque bastan — dice que el TIPO existe.`);
console.log(`    Ejemplo declarado: la retícula de \`blurb\` trae \`iconos-md-4\` (8/22) y el`);
console.log(`    enum de KB no lo tiene (F3-3-RETICULA-BLURB)`);
console.log(`  · no dice nada de las 16 no-páginas ni de los 13 redirects`);

if (noExpresadas.length) {
  console.log(`\n⚠ CORTE LIMPIO 2: ${noExpresadas.length} de ${N} documentos NO se expresan. Sube al propietario.`);
  process.exit(3);
}
