/**
 * EL EJE `srcset`, COMPARADO DE DOS LADOS — original contra clon.
 * Uso: npm run qa:cmp-srcset       (SABOTAJE=… → test en negativo)
 *
 * ── Por qué existe, y por qué es parte de la tanda y no un extra ──────────
 * `CLAUDE.md` §UN ARQUETIPO NUEVO NO HEREDA COBERTURA: *toda tanda cierra con
 * una sonda comparadora DE DOS LADOS sobre los ejes estándar; si no existe,
 * construirla es parte de la tanda*. El `srcset` es un **eje nuevo**: las 48
 * sondas del proyecto miden alto, ancho, árbol, enlaces y tipografía, y
 * **ninguna compara el `srcset`**. Por eso M-IMG —cuya causa medida es
 * justamente el `srcset`— lleva abierta desde que se fichó: no había con qué
 * cerrarla.
 *
 * ── Los dos lados, y de dónde sale cada uno ───────────────────────────────
 *   · **ORIGINAL** — `corpus/`, la captura CONGELADA con sha256. No se pega al
 *     sitio vivo: el original es un objetivo inestable y aquí no hace falta;
 *   · **CLON** — el HTML **servido** por su propio `next start`, nunca los
 *     `src/lib/*.ts`. *Verificar contra la salida servida* (§El principio).
 *
 * ── La UNIDAD, que es lo que hace auditable la cobertura ─────────────────
 * No es la ruta: es **(ruta × imagen origen)**. Declarar «24 rutas comparadas»
 * cuando una ruta cuenta como cubierta con una sola de sus doce imágenes es
 * exactamente el séptimo contenedor de `CLAUDE.md` —*la unidad en la que se
 * declara la cobertura absorbe lo que no se midió abajo*—. El denominador se
 * DERIVA del lado del original.
 *
 * ── El emparejamiento: por IMAGEN ORIGEN, no por orden en el DOM ─────────
 * El clon se descargó los ficheros a `/images/uploads/…` conservando la ruta
 * del original, así que
 *   `https://kunakair.com/wp-content/uploads/2026/04/x.jpg`  ↔  `/images/uploads/2026/04/x.jpg`
 * son la misma imagen y lo dicen ellas. Emparejar por posición en el DOM sería
 * frágil (el cascarón no coincide nodo a nodo) y **por eso mismo produciría un
 * pleno**: todo distinto, que es el instrumento y no un hallazgo.
 *
 * ── Las guardas ───────────────────────────────────────────────────────────
 * · **`Evaluadas`** con mínimo derivado del original;
 * · **patrón muerto ⇒ ROJO** (regla 4, el cero);
 * · **PLENO ⇒ ROJO** (regla 4, la otra cara, en su forma de COMPARADOR): *«31
 *   de 31 rutas distintas no es un hallazgo: es el instrumento»*. Si el 100 %
 *   de los pares sale distinto, la sonda se acusa a sí misma antes de que
 *   alguien cite el número;
 * · **0 pares ⇒ ROJO** (regla 4bis).
 *
 * ── ⚠ ALCANCE, y hay que leerlo antes que el veredicto ────────────────────
 * Se comparan las rutas que están **en el corpus Y en el build**. Son 24 de las
 * 34 que emite el build. Las que faltan son `/` y **los 4 sectores + los 2
 * monográficos**, que están fuera del corpus por construcción — y son
 * **exactamente la población donde M-IMG está medida** (la ficha de
 * `PENDIENTES-QA` cita `alert-cloud-vertical-web-3`, que vive en
 * `monografico.ts`). Esta sonda **no puede cerrar M-IMG**, y eso no es un fallo
 * suyo: es la frontera del PASO 1, escrita aquí para que el verde de las 24 no
 * se lea como si cubriera las 6.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { enApp, Evaluadas, iniciarClon, QA, w } from "./lib.mjs";

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

/* ── sabotajes ───────────────────────────────────────────────────────────── */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "selector-muerto": "las <img> se buscan por una etiqueta que no existe → 0 pares, que NO es «todo coincide»",
  "sin-normalizar": "no se pliega el host del original contra el prefijo del clon → el 100 % sale distinto (el PLENO)",
  "sin-pares": "el emparejamiento se rompe → 0 comparados, que no puede salir verde",
  control: "ningún sabotaje: la sonda mide y su veredicto se puede citar",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ── el emparejamiento de RUTAS, derivado de los dos catálogos ───────────── */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const RUTAS_BUILD = new Set(Object.keys(manifiesto.routes || {}));
const rutaLocal = (url) => (new URL(url).pathname.replace(/^\/es/, "").replace(/\/+$/, "") || "/");
const PARES = [];
for (const [clave, p] of Object.entries(INDICE.paginas)) {
  const r = rutaLocal(p.url);
  if (RUTAS_BUILD.has(r)) PARES.push({ clave, ruta: r, fichero: p.fichero });
}
const FUERA = [...RUTAS_BUILD].filter((r) => !r.startsWith("/_") && r !== "/favicon.ico" && !PARES.some((p) => p.ruta === r)).sort();
if (PARES.length === 0) {
  console.error("❌ 0 rutas emparejadas entre el corpus y el build. Eso no es «todo coincide».");
  process.exit(2);
}

/* ── extracción: toda <img> que apunte a un fichero de uploads ───────────── */
const soloMarcado = (h) =>
  h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
const RE_VARIANTE = /-(\d+)x(\d+)(?=\.[A-Za-z0-9]+$)/;

/** Pliega las dos formas de nombrar el MISMO fichero a una sola clave. */
function normaliza(url) {
  if (SABOTAJE === "sin-normalizar") return url;
  return url
    .split("?")[0]
    .replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "")
    .replace(/^\/images\/uploads\//, "")
    .replace(/^https?:\/\/[^/]+\/images\/uploads\//, "");
}
/** La imagen ORIGEN: el mismo fichero sin su sufijo de variante. */
const origenDe = (url) => normaliza(url).replace(RE_VARIANTE, "");

/** `<img>` → { origen, src, candidatos:[fichero descriptor], sizes } */
function imagenesDe(html) {
  const etiqueta = SABOTAJE === "selector-muerto" ? "imagen" : "img";
  const RE = new RegExp(`<${etiqueta}\\b[^>]*>`, "gi");
  const salida = new Map();
  for (const m of html.matchAll(RE)) {
    const tag = m[0];
    const attr = (n) => (tag.match(new RegExp(`\\b${n}\\s*=\\s*"([^"]*)"`, "i")) || [, null])[1];
    const src = attr("src") || attr("data-src");
    if (!src) continue;
    const esUploads = /wp-content\/uploads\//.test(src) || /\/images\/uploads\//.test(src);
    if (!esUploads) continue;
    const o = origenDe(src);
    const srcset = attr("srcset") || attr("data-srcset");
    const candidatos = srcset
      ? srcset
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => {
            const [u, d] = t.split(/\s+/);
            return `${normaliza(u)} ${d ?? ""}`.trim();
          })
          .sort()
      : null;
    // Una imagen puede repetirse en la página; se queda la primera aparición,
    // que es la que las dos partes van a tener en el mismo sitio.
    if (!salida.has(o)) salida.set(o, { origen: o, src: normaliza(src), candidatos, sizes: attr("sizes") });
  }
  return salida;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA COMPARACIÓN
 * ═════════════════════════════════════════════════════════════════════════ */
const { base, parar } = await iniciarClon();

// El denominador se deriva del ORIGINAL, y antes de mirar el clon.
const original = new Map();
let totalPares = 0;
for (const p of PARES) {
  const imgs = imagenesDe(soloMarcado(readFileSync(join(CORPUS, p.fichero), "utf8")));
  original.set(p.ruta, imgs);
  totalPares += imgs.size;
}
console.log(`\n· denominador DERIVADO del original: ${totalPares} imágenes en ${PARES.length} rutas emparejadas`);

const ev = new Evaluadas({ unidad: "pares (ruta × imagen)", minimo: Math.max(1, totalPares), nombre: "cmp-srcset" });

const veredictos = { igual: 0, clonSinSrcset: 0, originalSinSrcset: 0, distinto: 0, sinPareja: 0 };
const detalle = [];
const porRuta = {};

for (const p of PARES) {
  const orig = original.get(p.ruta);
  let clon;
  try {
    const r = await fetch(base + p.ruta);
    if (r.status >= 400) { ev.fallo(p.ruta, `HTTP ${r.status}`); continue; }
    clon = imagenesDe(soloMarcado(await r.text()));
  } catch (e) { ev.fallo(p.ruta, e); continue; }

  const fila = { igual: 0, clonSinSrcset: 0, originalSinSrcset: 0, distinto: 0, sinPareja: 0 };
  for (const [o, io] of orig) {
    const ic = SABOTAJE === "sin-pares" ? undefined : clon.get(o);
    let v;
    if (!ic) v = "sinPareja";
    else if (io.candidatos && !ic.candidatos) v = "clonSinSrcset";
    else if (!io.candidatos && ic.candidatos) v = "originalSinSrcset";
    else if (!io.candidatos && !ic.candidatos) v = "igual";
    else v = io.candidatos.join("|") === ic.candidatos.join("|") ? "igual" : "distinto";
    veredictos[v]++; fila[v]++;
    ev.ok();
    if (v !== "igual")
      detalle.push({
        ruta: p.ruta, origen: o, veredicto: v,
        original: io.candidatos, clon: ic ? ic.candidatos : null,
      });
  }
  porRuta[p.ruta] = { imagenes: orig.size, ...fila };
}
await parar();

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
const comparados = Object.values(veredictos).reduce((a, b) => a + b, 0);
const M = (n) => String(n).padStart(5);
console.log(`\n═══ EJE \`srcset\` · ORIGINAL (corpus congelado) contra CLON (servido) ═══\n`);
console.log(`  pares comparados ......... ${M(comparados)} de ${totalPares}`);
console.log(`  ✓ IGUAL .................. ${M(veredictos.igual)}`);
console.log(`  ✗ el clon NO emite srcset  ${M(veredictos.clonSinSrcset)}   ← la clase M-IMG`);
console.log(`  ✗ srcset DISTINTO ........ ${M(veredictos.distinto)}`);
console.log(`  ? el original no lo emite  ${M(veredictos.originalSinSrcset)}`);
console.log(`  ? sin pareja en el clon .. ${M(veredictos.sinPareja)}`);

const conDefecto = Object.entries(porRuta).filter(([, f]) => f.clonSinSrcset + f.distinto > 0);
if (conDefecto.length) {
  console.log(`\n── rutas con algún par no igual ────────────────────────────────────`);
  for (const [r, f] of conDefecto.sort((a, b) => b[1].clonSinSrcset + b[1].distinto - a[1].clonSinSrcset - a[1].distinto))
    console.log(`  ${String(f.clonSinSrcset).padStart(3)} sin srcset · ${String(f.distinto).padStart(3)} distinto · de ${String(f.imagenes).padStart(3)}   ${r}`);
}
for (const d of detalle.filter((x) => x.veredicto === "distinto").slice(0, 4)) {
  console.log(`\n  ⚠ ${d.ruta} · ${d.origen}`);
  console.log(`      orig: ${(d.original || []).join(" , ") || "(sin srcset)"}`);
  console.log(`      clon: ${(d.clon || []).join(" , ") || "(sin srcset)"}`);
}

console.log(`\n── ALCANCE ─────────────────────────────────────────────────────────`);
console.log(`  ${PARES.length} rutas emparejadas (corpus ∩ build) · ${totalPares} imágenes`);
console.log(`  FUERA, y hay que saberlo antes de leer el veredicto: ${FUERA.length} rutas del build`);
for (const r of FUERA) console.log(`     · ${r}`);
console.log(`  ⇒ los sectores y los monográficos NO están en el corpus, y son la población`);
console.log(`    donde M-IMG está medida. Esta sonda NO la cubre.`);

/* ── la guarda del PLENO, en su forma de comparador ──────────────────────── */
const noIguales = comparados - veredictos.igual;
const esPleno = comparados > 0 && noIguales === comparados;
if (esPleno)
  console.error(
    `\n❌ PLENO — los ${comparados} pares salen distintos, o sea el 100 %.\n` +
      `   «31 de 31 rutas distintas no es un hallazgo: es el instrumento.» Antes de\n` +
      `   creerse esto, reconstruye UN caso a mano: casi siempre son dos selectores\n` +
      `   que no denotan el mismo conjunto.\n`,
  );

w("medidas/cmp-srcset.json", {
  meta: {
    fecha: INDICE.meta.fecha,
    original: `corpus/ congelado (${PARES.length} de ${Object.keys(INDICE.paginas).length} páginas emparejadas con el build)`,
    clon: "HTML servido por next start (no src/lib)",
    unidad: "par (ruta × imagen origen) — NO la ruta",
    alcance: { rutasEmparejadas: PARES.length, imagenes: totalPares, rutasDelBuildFuera: FUERA },
    fronteraMImg:
      "los 4 sectores y los 2 monográficos están fuera del corpus por construcción, y son la población donde M-IMG está medida (alert-cloud-vertical-web-3 vive en monografico.ts). Esta sonda no la cubre.",
    sabotaje: SABOTAJE,
  },
  veredictos,
  porRuta,
  detalle,
});

const fallos = ev.informe() + (esPleno ? 1 : 0) + (comparados === 0 ? 1 : 0) + (veredictos.clonSinSrcset + veredictos.distinto > 0 ? 1 : 0);
if (comparados === 0) console.error(`\n❌ 0 PARES COMPARADOS — eso no es «todo coincide».`);
if (veredictos.clonSinSrcset + veredictos.distinto > 0)
  console.error(
    `\n❌ ${veredictos.clonSinSrcset + veredictos.distinto} par(es) con el \`srcset\` distinto del original.\n` +
      `   El criterio del PLAN para M-IMG es «el srcset emitido coincide con el del\n` +
      `   original en las páginas medidas», así que esto es exactamente lo que ese\n` +
      `   criterio prohíbe — y ahora tiene número.\n`,
  );
process.exit(fallos ? 2 : 0);
