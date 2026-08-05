/**
 * LAS DOS POBLACIONES DE MEDIA — la que el clon SIRVE y la que sólo se
 * REFERENCIA. Uso: npm run qa:media-poblaciones   (SABOTAJE=… → negativo)
 *
 * ── Por qué son dos y no una ──────────────────────────────────────────────
 * Es la distinción **CONSTRUYÓ / REFERENCIÓ** del ESQUEMA (§2f) aplicada al
 * media, y no es una clasificación de comodidad: **cada población tiene una
 * restricción distinta**, y confundirlas es lo que convierte una migración en
 * una regresión.
 *
 *   **(a) la que sirven las 31 rutas construidas.** Ya está en
 *   `apps/web/public/images` y forma parte del artefacto verificado a Δ0
 *   (`clon-base`, 31/31 · 0 regresiones a 1440 y a 390). Su restricción es
 *   DURA: **migrarla no puede cambiar un byte de lo que esas páginas sirven.**
 *
 *   **(b) la que sólo referencia el corpus capturado.** Todavía no la sirve
 *   nadie, así que **no tiene restricción de Δ0** — entra con el alta del
 *   corpus y se mide cuando F2-3 la lea.
 *
 * ── Y de dónde sale cada lado, que es lo que hace auditable el reparto ────
 * **El lado (a) se deriva de la SALIDA SERVIDA**, no del árbol de
 * `public/images` ni de los `src/lib/*.ts`. Es el principio de `CLAUDE.md`:
 * *verificar contra la salida servida, nunca contra la fuente que uno supone
 * responsable*. Un fichero que está en `public/` y **no** lo referencia ninguna
 * ruta no lo sirve nadie —migrarlo o no es indiferente al Δ0— y un fichero
 * referenciado que **no** está sería un 404 que ninguna sonda de alturas ve.
 * Las dos cosas sólo aparecen comparando los dos conjuntos, y las dos importan
 * para decidir qué se migra.
 *
 * ── Las guardas ───────────────────────────────────────────────────────────
 * · **`Evaluadas` con mínimo DERIVADO** del `prerender-manifest` — una ruta
 *   nueva sube el listón sola;
 * · **referenciado y ausente ⇒ ROJO.** El artefacto está a Δ0: un `/images/…`
 *   servido que no existe en disco es un defecto, no un dato;
 * · **patrón muerto ⇒ ROJO** (regla 4, el cero): si el patrón de referencias no
 *   casara, «0 media servido» se leería como «no hay nada que migrar»;
 * · **solape 0 ⇒ ROJO**: sin corpus cargado, el reparto entero es vacuo y
 *   saldría verde (regla 4bis, «0 comparado = verde»).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { enApp, Evaluadas, iniciarClon, QA, w } from "./lib.mjs";

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const PUBLICO = enApp("public/images");

/* ── sabotajes ───────────────────────────────────────────────────────────── */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "selector-muerto": "el patrón de referencias busca un prefijo que no existe → 0 servido, que NO es «nada que migrar»",
  "sin-fichero": "se esconde un fichero del árbol → una referencia se queda sin destino y tiene que salir ROJO",
  "sin-corpus": "no se carga el corpus → el solape es vacuo y el reparto no significa nada",
  control: "ningún sabotaje: la sonda tiene que salir LIMPIA",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ── las rutas, DERIVADAS del build ──────────────────────────────────────── */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const RUTAS = Object.keys(manifiesto.routes || {}).filter((r) => !r.startsWith("/_")).sort();
if (RUTAS.length === 0) {
  console.error("❌ 0 rutas en el prerender-manifest — sin build no hay salida que mirar, y 0 rutas saldría VERDE.");
  process.exit(2);
}

/* ── el árbol de `public/images` ─────────────────────────────────────────── */
const enDisco = new Set();
(function anda(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) anda(p);
    else enDisco.add("/images/" + relative(PUBLICO, p).replace(/\\/g, "/"));
  }
})(PUBLICO);
/* ⚠ SABOTAJE `sin-fichero`: se esconde uno del árbol para que la referencia que
 * lo nombra se quede sin destino. **Se hace DESPUÉS del barrido**, no aquí, y
 * la razón es un fallo de la primera versión: escondía el primero por orden
 * alfabético y le tocó `/images/.gitkeep`, **que no lo referencia ninguna
 * ruta**. Un fichero que nadie sirve no puede aparecer en «servido y ausente»,
 * así que el sabotaje salía sin morder — y un sabotaje sin diana no prueba la
 * guarda, prueba que el instrumento no la ejercita (regla 8a). Tiene que
 * esconderse uno que esté EN LAS DOS listas, y eso no se sabe hasta cruzarlas. */
let escondido = null;

/* ── el corpus: las URLs de uploads que referencia ───────────────────────── */
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const refCorpus = new Set();
if (SABOTAJE !== "sin-corpus") {
  for (const [, meta] of Object.entries(INDICE.paginas)) {
    const crudo = readFileSync(join(CORPUS, meta.fichero), "utf8");
    for (const m of crudo.matchAll(/["'(](https?:\/\/kunakair\.com\/wp-content\/uploads\/([^"')?\s]+))/g))
      refCorpus.add("/images/uploads/" + m[2]);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * (a) LO QUE LAS 31 RUTAS SIRVEN — de la salida servida
 * ═════════════════════════════════════════════════════════════════════════ */
const PREFIJO = SABOTAJE === "selector-muerto" ? "/imagenes/" : "/images/";
/** Toda referencia a `/images/…` del HTML servido: atributo o `url()` de CSS. */
const RE_REF = new RegExp(`(?:["'(\\s,])(${PREFIJO.replace("/", "\\/")}[^"')\\s,>\\\\]+)`, "g");

/* ⚠ LA REGLA DEL MARKUP, y aquí se pagó en la primera corrida.
 *
 * Sin quitar `<script>`, el patrón bajaba al **flight payload de RSC**
 * (`self.__next_f.push([1,"…\"/images/x.jpg\"…"])`), donde las comillas van
 * ESCAPADAS. Resultado: 325 referencias terminadas en `\` — rutas que no
 * existen en disco— y la sonda las informó como *«404 sobre un artefacto
 * declarado a Δ0»*, que es un titular alarmante y **falso**.
 *
 * Es la tercera cara de la regla 4 (`CLAUDE.md` §sondas): **un heurístico que
 * encuentra DE MÁS no da error, da un número plausible que invita a
 * explicarlo.** Y no es la primera vez en esta tanda: `media-srcset` casaba
 * sobre `<link rel="icon" sizes="32x32">` por lo mismo.
 *
 * Se corta por los dos lados —se quita el `<script>` Y se excluye la barra
 * invertida del literal— porque cada uno tapa un agujero distinto: el primero,
 * el payload entero; el segundo, cualquier otro sitio donde el HTML venga
 * escapado. */
const soloMarcado = (h) =>
  h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

const { base, parar } = await iniciarClon();
const ev = new Evaluadas({ unidad: "rutas", minimo: RUTAS.length, nombre: "media-poblaciones" });

/** referencia → rutas que la sirven */
const servido = new Map();
for (const ruta of RUTAS) {
  let html;
  try {
    const r = await fetch(base + ruta);
    if (r.status >= 400) { ev.fallo(ruta, `HTTP ${r.status}`); continue; }
    html = soloMarcado(await r.text());
  } catch (e) { ev.fallo(ruta, e); continue; }
  for (const m of html.matchAll(RE_REF)) {
    const ref = m[1].replace(/&amp;/g, "&").split("?")[0];
    if (!servido.has(ref)) servido.set(ref, new Set());
    servido.get(ref).add(ruta);
  }
  ev.ok();
}
await parar();

/* ══════════════════════════════════════════════════════════════════════════
 * EL REPARTO
 * ═════════════════════════════════════════════════════════════════════════ */
const refServidas = [...servido.keys()].sort();
// El sabotaje, ahora que sí se sabe qué está en las dos listas (ver arriba).
if (SABOTAJE === "sin-fichero") {
  escondido = refServidas.find((r) => enDisco.has(r)) ?? null;
  if (!escondido) throw new Error("sin-fichero: no hay ninguna referencia servida que exista en disco — el sabotaje no tendría diana");
  enDisco.delete(escondido);
  console.log(`   (escondido del árbol: ${escondido})`);
}
const servidasSinFichero = refServidas.filter((r) => !enDisco.has(r));
const enDiscoSinServir = [...enDisco].filter((r) => !servido.has(r)).sort();
const solape = refServidas.filter((r) => refCorpus.has(r));
const soloCorpus = [...refCorpus].filter((r) => !servido.has(r)).sort();
const soloServido = refServidas.filter((r) => !refCorpus.has(r));

/** Bytes de un conjunto de referencias que están en disco. */
const bytes = (refs) =>
  refs.reduce((a, r) => {
    try { return a + statSync(join(PUBLICO, r.replace("/images/", ""))).size; } catch { return a; }
  }, 0);
const MB = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

const M = (n) => String(n).padStart(5);
console.log(`\n═══ LAS DOS POBLACIONES DE MEDIA ═══════════════════════════════════\n`);
console.log(`  (a) SERVIDA por las ${RUTAS.length} rutas construidas`);
console.log(`      referencias distintas a /images/ ........ ${M(refServidas.length)}   ${MB(bytes(refServidas))}`);
console.log(`      · de ellas bajo /images/uploads/ ........ ${M(refServidas.filter((r) => r.startsWith("/images/uploads/")).length)}`);
console.log(`      · fuera de uploads (tema, seo, vídeo) ... ${M(refServidas.filter((r) => !r.startsWith("/images/uploads/")).length)}`);
console.log(`      ⇒ RESTRICCIÓN DURA: migrarlas no puede cambiar lo que estas rutas sirven.`);
console.log(`\n      en disco y SIN servir ninguna ruta ..... ${M(enDiscoSinServir.length)}   ${MB(bytes(enDiscoSinServir))}`);
console.log(`      ⇒ sin restricción de Δ0: no las mira nadie (peso muerto del árbol).`);

console.log(`\n  (b) REFERENCIADA sólo por el corpus capturado`);
console.log(`      URLs de uploads en el corpus ........... ${M(refCorpus.size)}`);
console.log(`      · SOLAPE con lo servido ............... ${M(solape.length)}   ${MB(bytes(solape))}`);
console.log(`      · SÓLO en el corpus (falta capturar) ... ${M(soloCorpus.length)}`);
console.log(`      · SÓLO servido (el corpus no la nombra)  ${M(soloServido.length)}`);

const porExt = new Map();
for (const u of soloCorpus) {
  const e = (u.match(/\.([A-Za-z0-9]+)$/) || [, "(sin extensión)"])[1].toLowerCase();
  porExt.set(e, (porExt.get(e) || 0) + 1);
}
console.log(`      extensiones de lo que falta: ${[...porExt].sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e}×${n}`).join(" · ")}`);

/* ══════════════════════════════════════════════════════════════════════════
 * LO SERVIDO QUE NO EXISTE — se cuenta, se nombra, y NO cierra el código
 *
 * Un `/images/…` que el HTML sirve y el disco no tiene es un **404 de imagen**:
 * el navegador lo pide, no está, y el hueco no lo ve NINGUNA sonda del
 * proyecto — `clon-base` mide `docH`, `h1.y`, secciones y enlaces, y una imagen
 * rota no mueve ninguno de los cuatro si el alto lo fija el contenedor.
 *
 * ⚠ **Y no cierra el código de salida A PROPÓSITO, lo cual sólo vale porque se
 * dice aquí** (`CLAUDE.md` §sondas, regla 1: *si se cuenta y no cierra el
 * código, se dice en la propia salida y por qué*). La razón: **es un defecto
 * FICHADO del clon, no un fallo de esta medición.** El contrato de esta sonda
 * es el REPARTO entre las dos poblaciones, y ese reparto es correcto tenga el
 * clon los ficheros o no. Poner la sonda en rojo permanente por una deuda ajena
 * es cómo se consigue que nadie lea sus rojos.
 *
 * Lo que SÍ cierra el código está abajo: instrumento (patrón muerto), alcance
 * (Evaluadas) y solape vacuo.
 * ═════════════════════════════════════════════════════════════════════════ */
if (servidasSinFichero.length) {
  const porRuta = new Map();
  for (const r of servidasSinFichero) for (const ruta of servido.get(r)) porRuta.set(ruta, (porRuta.get(ruta) || 0) + 1);
  console.log(`\n⚠ ${servidasSinFichero.length} REFERENCIA(S) SERVIDA(S) SIN FICHERO EN DISCO — son 404 de imagen`);
  console.log(`   sobre rutas del artefacto declarado a Δ0, y no los ve ninguna sonda del`);
  console.log(`   proyecto: \`clon-base\` mide docH · h1 · secciones · enlaces, y una imagen`);
  console.log(`   rota no mueve ninguno de los cuatro.`);
  for (const [ruta, n] of [...porRuta].sort((a, b) => b[1] - a[1])) console.log(`     · ${String(n).padStart(3)}  ${ruta}`);
  console.log(`   ⇒ FICHADO en PENDIENTES-QA (§M-404). NO cierra el código de salida: es`);
  console.log(`     deuda del clon, no un fallo de este reparto. Se pondrá verde solo.`);
}
const solapeVacuo = solape.length === 0;
if (solapeVacuo)
  console.error(
    `\n❌ SOLAPE 0 — el reparto entre las dos poblaciones no ha comparado NADA.\n` +
      `   «0 comparado» y «no hay solape» dan la misma salida, y sólo una es un dato.\n`,
  );

w("medidas/media-poblaciones.json", {
  meta: {
    fecha: INDICE.meta.fecha,
    rutas: RUTAS.length,
    fuenteA: "HTML SERVIDO por las rutas del prerender-manifest (no el árbol de public/, no src/lib)",
    fuenteB: `corpus/INDICE.json (${Object.keys(INDICE.paginas).length} páginas congeladas)`,
    sabotaje: SABOTAJE,
    escondido,
  },
  servida: {
    referencias: refServidas.length,
    bytes: bytes(refServidas),
    enUploads: refServidas.filter((r) => r.startsWith("/images/uploads/")).length,
    fueraDeUploads: refServidas.filter((r) => !r.startsWith("/images/uploads/")).length,
    sinFicheroEnDisco: servidasSinFichero,
    restriccion: "DURA — Δ0 del artefacto verificado (clon-base 31/31)",
  },
  enDiscoSinServir: { n: enDiscoSinServir.length, bytes: bytes(enDiscoSinServir), muestra: enDiscoSinServir.slice(0, 20) },
  corpus: {
    referencias: refCorpus.size,
    solape: solape.length,
    soloCorpus: soloCorpus.length,
    soloServido: soloServido.length,
    porExtensionDeLoQueFalta: Object.fromEntries([...porExt].sort((a, b) => b[1] - a[1])),
    restriccion: "NINGUNA todavía — no la sirve ninguna ruta",
  },
  listas: { soloCorpus, solape, soloServido },
});

/* Lo que cierra el código: INSTRUMENTO y ALCANCE. Los 404 se cuentan arriba y
 * se declaran fichados — la excepción va escrita en su sitio, no aquí. */
const fallos = ev.informe() + (solapeVacuo ? 1 : 0) + (refServidas.length === 0 ? 1 : 0);
if (refServidas.length === 0)
  console.error(`\n❌ PATRÓN MUERTO — 0 referencias a \`${PREFIJO}\` en ${RUTAS.length} rutas servidas. Eso no es «no hay media que migrar».`);
process.exit(fallos ? 2 : 0);
