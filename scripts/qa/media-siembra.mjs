/**
 * EL HUECO DE MEDIA DE LA SIEMBRA — por COLECCIÓN y por CANAL, contra la guarda
 * que va a parar de verdad.
 * Uso: npm run qa:media-siembra
 * Negativos:
 *   SABOTAJE=canal-mudo      → exit ≠0 (un canal que no encuentra NADA)
 *   SABOTAJE=guarda-blanda   → exit ≠0 (el hueco se mide contra la guarda equivocada)
 *   SABOTAJE=catalogo-ausente→ exit ≠0 (una colección sin catálogo no vale 0)
 *
 * ── Qué contesta, y por qué el diagnóstico anterior no bastaba ────────────
 * `DATOS-A` dejó escrito **«90 orígenes sin capturar»** para `entradas-blog`, y
 * el diagnóstico del punto ciego era correcto: los 534 de `media-corpus/`
 * salieron de una lista derivada de los **CUERPOS de la muestra**, y la imagen
 * destacada es un campo propio que vive **fuera** del `post_content`.
 *
 * Pero ese 90 tiene dos límites que hay que quitar antes de capturar:
 *
 *   1 · **es de UNA colección de cinco.** El punto ciego es **de la lista**, no
 *       de `entradas-blog` — así que las otras cuatro tienen el mismo agujero y
 *       nadie lo ha contado;
 *   2 · **se derivó contra `media-corpus`, y la guarda que para NO mira ahí.**
 *       Las dos guardas de este repo **no miran lo mismo**, y confundirlas es
 *       medir el hueco contra el sitio equivocado:
 *
 * | guarda | qué exige | a quién para |
 * |---|---|---|
 * | `seed.mjs` · `media()` | el fichero **EXACTO** en `apps/web/public` | las **5** colecciones de `cms:seed` |
 * | `seed-kb.mjs` · `ficheroDe()` | `public/images/uploads` **o** `media-corpus`, y **colapsa la variante** a su origen | sólo `articulos-kb` |
 *
 * Un origen que esté en `media-corpus` y no en `public` **pasa la segunda y
 * muere en la primera**. Y una variante `-WxH` que falte **pasa la segunda**
 * (colapsa a su origen) y **muere en la primera** (pide la ruta exacta). O sea
 * que el hueco de esta tanda **es más grande que el de `media-corpus`**, y
 * medirlo contra la guarda cómoda daría un verde que el seed desmiente.
 *
 * ── LOS CANALES, enumerados contra el ESQUEMA y no de memoria ─────────────
 * §*la salida servida incluye el canal que no estabas mirando*: la lista vieja
 * miró **un** canal (el cuerpo) y por eso perdió la destacada. Aquí los canales
 * se **derivan recorriendo los campos de cada colección** y clasificando por
 * TIPO, no por nombre — un campo nuevo que traiga una URL entra solo:
 *
 *   · **A · `upload`** — el único que llega a `ctx.media()`, o sea **el único
 *     que BLOQUEA la siembra**. Ruta exacta contra `apps/web/public`;
 *   · **B · escalar con pinta de fichero** (`seo.ogImage`, `imagenA.srcset`,
 *     `descarga.href`…) — **no bloquea el seed**, y aun así el clon lo sirve:
 *     si falta, es un 404 en la página, no un error de siembra;
 *   · **C · cuerpo RICO (`code`)** — la media que vive dentro del HTML
 *     importado. Tampoco bloquea el seed, y también se sirve.
 *
 * **Que B y C no bloqueen no los hace opcionales**: los bloquea el RENDER, que
 * es más tarde y más caro. Se cuentan aparte y se capturan igual.
 *
 * ── El ALCANCE, declarado como pide §COMPLETITUD ──────────────────────────
 * La lista que sale es **COMPLETA PARA SEMBRAR LAS CINCO COLECCIONES** con el
 * catálogo de hoy. No es «completa» en absoluto: no cubre el cascarón (que el
 * clon construye con sus propios assets), ni `articulos-kb` (que ya está
 * sembrada y tiene su propia guarda), ni ninguna colección futura.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No captura, no siembra y **no toca el original**: cuenta y cruza ficheros.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, gritaSiRevienta, hoy, origenDe, QA, RE_VARIANTE, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const PUBLICO = join(RAIZ, "apps/web/public");
const MEDIA_CORPUS = join(RAIZ, "media-corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["canal-mudo", "guarda-blanda", "catalogo-ausente"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CATÁLOGOS — de dónde sale el dato de cada colección
 *
 * Cada una con su procedencia declarada. Una que no resuelva **TIRA**: un
 * catálogo ausente leído como «esta colección no tiene media» es exactamente
 * el verde falso que la regla 6 persigue.
 * ═════════════════════════════════════════════════════════════════════════ */

const FUENTES = [
  { coleccion: "entradas-blog", json: "medidas/a-extraido.json", en: "catalogo.entradas-blog", forma: "anidada" },
  { coleccion: "terminos-kunakpedia", json: "medidas/a-extraido.json", en: "catalogo.terminos-kunakpedia", forma: "anidada" },
  { coleccion: "documentos-cientificos", json: "medidas/a-extraido.json", en: "catalogo.documentos-cientificos", forma: "anidada" },
  { coleccion: "casos", json: "medidas/c-inventario.json", en: "documentos", forma: "plana", filtra: "casos" },
  { coleccion: "faqs", json: "medidas/c-inventario.json", en: "documentos", forma: "plana", filtra: "faqs" },
];

function cargaFuente(f) {
  const ruta = join(QA, f.json);
  if (SABOTAJE === "catalogo-ausente" && f.coleccion === "documentos-cientificos") return null;
  if (!existsSync(ruta)) return null;
  const raiz = JSON.parse(readFileSync(ruta, "utf8"));
  const v = f.en.split(".").reduce((o, k) => o?.[k], raiz);
  if (!v) return null;
  if (f.forma === "plana") return Object.values(v).filter((d) => d.coleccion === f.filtra);
  return Array.isArray(v) ? v : null;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CANALES — derivados del esquema, clasificando por TIPO
 * ═════════════════════════════════════════════════════════════════════════ */

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
mkdirSync(join(QA, ".tmp"), { recursive: true });
const bundle = join(QA, ".tmp", "colecciones-msiembra.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/colecciones.ts")],
  outfile: bundle, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const COLEC = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
const POR_SLUG = new Map(
  Object.values(COLEC).filter((c) => c && typeof c === "object" && c.slug && Array.isArray(c.fields)).map((c) => [c.slug, c]),
);

/**
 * Aplana los campos a rutas, marcando el CANAL de cada una.
 * `[]` en la ruta = «esto es un array, hay que iterar».
 */
function canalesDe(cfg, prefijo = "") {
  const out = [];
  for (const f of cfg.fields ?? []) {
    if (!f?.name) { if (Array.isArray(f?.fields)) out.push(...canalesDe(f, prefijo)); continue; }
    const ruta = prefijo ? `${prefijo}.${f.name}` : f.name;
    if (f.type === "group") out.push(...canalesDe(f, ruta));
    else if (f.type === "array") out.push(...canalesDe(f, `${ruta}[]`));
    else if (f.type === "upload") out.push({ ruta, canal: "A", tipo: f.type });
    else if (f.type === "code") out.push({ ruta, canal: "C", tipo: f.type });
    else if (f.type === "text" || f.type === "textarea") out.push({ ruta, canal: "B", tipo: f.type });
  }
  return out;
}

/** Lee una ruta `a.b[].c` de un documento; devuelve SIEMPRE un array de valores. */
function valoresEn(doc, ruta) {
  if (ruta in doc) { const v = doc[ruta]; return v === null || v === undefined ? [] : [v]; } // forma plana
  let actual = [doc];
  for (const paso of ruta.split(".")) {
    const array = paso.endsWith("[]");
    const clave = array ? paso.slice(0, -2) : paso;
    const siguiente = [];
    for (const o of actual) {
      const v = o?.[clave];
      if (v === null || v === undefined) continue;
      if (array) { if (Array.isArray(v)) siguiente.push(...v); }
      else siguiente.push(v);
    }
    actual = siguiente;
  }
  return actual.filter((v) => v !== null && v !== undefined);
}

/* ══════════════════════════════════════════════════════════════════════════
 * LO QUE CUENTA COMO REFERENCIA A UN FICHERO
 * ═════════════════════════════════════════════════════════════════════════ */

/** Rutas locales ya reescritas por T3b **y** las crudas del original. */
const RE_LOCAL = /\/images\/uploads\/[^\s"'),<>]+/g;
const RE_CRUDA = /(?:https?:\/\/kunakair\.com)?\/wp-content\/uploads\/[^\s"'),<>]+/g;
const aLocal = (u) => "/" + u.replace(/^https?:\/\/kunakair\.com/, "").replace(/^\/?wp-content\/uploads\//, "images/uploads/").replace(/^\//, "");
/** Un fichero tiene extensión; una ruta de directorio, no (lección de `captura-f3-media`). */
const esFichero = (u) => !u.endsWith("/") && /\.[A-Za-z0-9]{2,5}$/.test(u.split("/").pop() ?? "");

/** De un valor (cadena) saca todas las rutas de media que contiene, en local. */
function rutasDe(valor) {
  if (typeof valor !== "string" || !valor) return [];
  const out = [];
  for (const m of valor.matchAll(RE_LOCAL)) out.push(m[0].split("?")[0]);
  for (const m of valor.matchAll(RE_CRUDA)) out.push(aLocal(m[0].split("?")[0]));
  return [...new Set(out)].filter(esFichero);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CRUCE — contra la GUARDA que para (`apps/web/public`), no contra la otra
 * ═════════════════════════════════════════════════════════════════════════ */

/** Índice de `media-corpus/` por ruta relativa a `uploads/`. */
const enMediaCorpus = new Set();
(function barre(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) barre(p);
    else if (e.isFile() && !e.name.endsWith(".json"))
      enMediaCorpus.add(relative(MEDIA_CORPUS, p).replace(/\\/g, "/").replace(/^fase-3\//, ""));
  }
})(MEDIA_CORPUS);

/**
 * ⚠ **`guarda-blanda` mide contra `media-corpus` en vez de contra `public`**,
 * que es exactamente el error que esta sonda existe para no cometer: el hueco
 * sale más pequeño, la sonda sale verde y el seed muere igual.
 */
const enPublico = (ruta) => existsSync(join(PUBLICO, decodeURIComponent(ruta)));
const enCorpus = (ruta) => enMediaCorpus.has(decodeURIComponent(ruta).replace(/^\/images\/uploads\//, ""));
const disponible = SABOTAJE === "guarda-blanda" ? (r) => enPublico(r) || enCorpus(r) : enPublico;

const porColeccion = {};
const porCanal = { A: new Set(), B: new Set(), C: new Set() };
const faltan = new Map(); // ruta local → { canales:Set, colecciones:Set, refs }
const sinCatalogo = [];

const ev = new Evaluadas({ nombre: "media-siembra", unidad: "colecciones", minimo: FUENTES.length });

for (const f of FUENTES) {
  const docs = cargaFuente(f);
  if (!docs || !docs.length) {
    sinCatalogo.push(f.coleccion);
    ev.fallo(f.coleccion, `sin catálogo en ${f.json} · ${f.en}`);
    continue;
  }
  const cfg = POR_SLUG.get(f.coleccion);
  if (!cfg) { sinCatalogo.push(f.coleccion); ev.fallo(f.coleccion, "no está en colecciones.ts"); continue; }
  const canales = canalesDe(cfg);

  const c = (porColeccion[f.coleccion] = { documentos: docs.length, canales: {} });
  for (const { ruta, canal } of canales) {
    /* `canal-mudo` deja al canal A sin ninguna ruta: el hueco de siembra
     * saldría 0 y la sonda verde — el mismo cero que §sondas 4 persigue. */
    if (SABOTAJE === "canal-mudo" && canal === "A") continue;
    for (const doc of docs) {
      for (const valor of valoresEn(doc, ruta)) {
        for (const r of rutasDe(valor)) {
          porCanal[canal].add(r);
          c.canales[canal] ??= { rutas: new Set(), refs: 0 };
          c.canales[canal].rutas.add(r);
          c.canales[canal].refs++;
          if (!disponible(r)) {
            if (!faltan.has(r)) faltan.set(r, { canales: new Set(), colecciones: new Set(), refs: 0 });
            const e = faltan.get(r);
            e.canales.add(canal); e.colecciones.add(f.coleccion); e.refs++;
          }
        }
      }
    }
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL REPARTO — porque «1889 sin capturar» sería el número MAL ENMARCADO
 *
 * ⚠ **La primera versión de este reparto lo estaba**, y es la misma familia que
 * el `1174 assets sin capturar` que `a-inventario` ya había separado: metía en
 * un solo montón cosas con coste de red muy distinto. Un origen que **ya está
 * en `media-corpus/`** no hay que pedírselo a nadie — hay que **colocarlo**, y
 * eso es una copia de fichero. Contarlo como captura infla la campaña y la
 * convierte en una salida a la red que no hace falta.
 *
 * Cuatro montones, y sólo el último es una petición al original:
 *
 *   1 · VARIANTE `-WxH` con su origen en disco   → `sharp` la regenera
 *   2 · ORIGEN ya en `media-corpus/`             → copiar, sin red
 *   3 · VARIANTE cuyo origen está en `media-corpus` → copiar + regenerar
 *   4 · **ORIGEN que no está en ningún sitio**   → ESTO es la campaña
 * ═════════════════════════════════════════════════════════════════════════ */
const reparto = { variantesConOrigenEnPublico: [], enMediaCorpus: [], variantesConOrigenEnCorpus: [], aPedir: [] };
for (const [ruta] of faltan) {
  const esVar = RE_VARIANTE.test(ruta);
  const origen = esVar ? origenDe(ruta) : ruta;
  if (esVar && enPublico(origen)) { reparto.variantesConOrigenEnPublico.push(ruta); continue; }
  if (!esVar && enCorpus(ruta)) { reparto.enMediaCorpus.push(ruta); continue; }
  if (esVar && enCorpus(origen)) { reparto.variantesConOrigenEnCorpus.push(ruta); continue; }
  reparto.aPedir.push(ruta);
}

/**
 * Lo que hay que PEDIRLE AL ORIGINAL, en ORÍGENES: una variante nunca se pide
 * —se regenera— así que se colapsa con la misma `origenDe()` que usa el resto
 * del proyecto (una definición, no dos).
 */
const origenesACapturar = [...new Set(reparto.aPedir.map((r) => (RE_VARIANTE.test(r) ? origenDe(r) : r)))].sort();
/** Y lo que se resuelve SIN RED, que es lo que separa una campaña de una copia. */
const sinRed = reparto.variantesConOrigenEnPublico.length + reparto.enMediaCorpus.length + reparto.variantesConOrigenEnCorpus.length;

/**
 * ⚠ **El reparto de la campaña por CANAL y por COLECCIÓN, que es lo que decide
 * qué desbloquea cada trozo.** Sin él, «393 orígenes» es un bulto: el canal A
 * de `entradas-blog` es lo único que impide **sembrar**, y el resto impide
 * **servir sin 404**. Son dos bloqueos distintos, a dos horas distintas, y
 * juntarlos haría parecer que la siembra necesita la campaña entera.
 */
const campanaPor = { canal: {}, coleccion: {} };
for (const r of reparto.aPedir) {
  const e = faltan.get(r);
  for (const c of e.canales) (campanaPor.canal[c] ??= new Set()).add(RE_VARIANTE.test(r) ? origenDe(r) : r);
  for (const c of e.colecciones) (campanaPor.coleccion[c] ??= new Set()).add(RE_VARIANTE.test(r) ? origenDe(r) : r);
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ media-siembra · el hueco de media de las CINCO colecciones ════════\n`);
console.log(`  guarda contra la que se mide: seed.mjs · media() ⇒ el fichero EXACTO en apps/web/public`);
console.log(`  (la otra —seed-kb, public O media-corpus, colapsando variantes— NO es la que para aquí)\n`);

console.log(`  colección                 docs    canal A (upload)   canal B (escalar)   canal C (cuerpo)`);
for (const f of FUENTES) {
  const c = porColeccion[f.coleccion];
  if (!c) { console.log(`  ${f.coleccion.padEnd(24)}    —   ⛔ SIN CATÁLOGO`); continue; }
  const col = (k) => {
    const v = c.canales[k];
    if (!v) return "        —      ";
    const falta = [...v.rutas].filter((r) => faltan.has(r)).length;
    return `${String(v.rutas.size).padStart(5)} · falta ${String(falta).padStart(3)}`;
  };
  console.log(`  ${f.coleccion.padEnd(24)}${String(c.documentos).padStart(5)}    ${col("A")}   ${col("B")}   ${col("C")}`);
}

console.log(`\n  rutas DISTINTAS por canal (unión de las cinco):`);
for (const k of ["A", "B", "C"]) {
  const falta = [...porCanal[k]].filter((r) => faltan.has(r)).length;
  const que = { A: "upload — BLOQUEA la siembra", B: "escalar — bloquea el RENDER", C: "cuerpo rico — bloquea el RENDER" }[k];
  console.log(`    canal ${k} · ${String(porCanal[k].size).padStart(4)} rutas · faltan ${String(falta).padStart(4)}   (${que})`);
}

console.log(`\n  reparto de las ${faltan.size} que faltan, que NO son la misma cosa:`);
console.log(`    · ${String(reparto.variantesConOrigenEnPublico.length).padStart(4)} VARIANTES con su origen ya en public/  → las regenera sharp, SIN RED`);
console.log(`    · ${String(reparto.enMediaCorpus.length).padStart(4)} ORÍGENES ya en media-corpus/          → copiar, SIN RED`);
console.log(`    · ${String(reparto.variantesConOrigenEnCorpus.length).padStart(4)} VARIANTES con su origen en media-corpus → copiar + regenerar, SIN RED`);
console.log(`    · ${String(reparto.aPedir.length).padStart(4)} sin origen en NINGÚN sitio            → ESTO es la campaña`);
console.log(`\n  ⇒ SIN RED se resuelven ${sinRed} de ${faltan.size} (${((sinRed / faltan.size) * 100).toFixed(1)} %)`);
console.log(`  ⇒ A CAPTURAR del original: ${origenesACapturar.length} orígenes distintos`);
console.log(`\n  y el reparto de esos ${origenesACapturar.length}, porque NO desbloquean lo mismo:`);
for (const [c, s] of Object.entries(campanaPor.canal).sort())
  console.log(`    canal ${c} · ${String(s.size).padStart(4)} orígenes  ${c === "A" ? "← lo ÚNICO que impide SEMBRAR" : "← impide SERVIR sin 404"}`);
for (const [c, s] of Object.entries(campanaPor.coleccion).sort((a, b) => b[1].size - a[1].size))
  console.log(`    ${c.padEnd(24)} ${String(s.size).padStart(4)} orígenes`);
for (const r of origenesACapturar.slice(0, 5)) console.log(`       ${r}`);
if (origenesACapturar.length > 5) console.log(`       … y ${origenesACapturar.length - 5} más`);

if (sinCatalogo.length) {
  console.error(`\n  ❌ ${sinCatalogo.length} colección(es) SIN CATÁLOGO: ${sinCatalogo.join(" · ")}`);
  console.error(`     Eso NO es «no tienen media»: es que no se pudo mirar, y un 0 de ahí`);
  console.error(`     se leería como hueco cerrado (§sondas 4).`);
}

/** §sondas 4: un canal que no encuentra NADA en ninguna colección está muerto. */
const canalesMudos = ["A", "B", "C"].filter((k) => porCanal[k].size === 0);
if (canalesMudos.length) {
  console.error(`\n  ❌ CANAL(ES) MUDO(S): ${canalesMudos.join(" · ")} — 0 rutas en las 5 colecciones.`);
  console.error(`     Un canal sin una sola ruta no dice «ahí no hay media»: dice que su`);
  console.error(`     clasificador no casa, y su cero se estaba a punto de leer como hueco cerrado.`);
}

w("medidas/media-siembra.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿qué media le falta a apps/web/public para que las CINCO colecciones se siembren y se sirvan?",
    guarda: "seed.mjs · media() — el fichero EXACTO en apps/web/public. NO es la de seed-kb.",
    fuente: "medidas/a-extraido.json (grupo A) + medidas/c-inventario.json (grupo C) + colecciones.ts (canales)",
    sabotaje: SABOTAJE,
    alcance: {
      completaPara: "SEMBRAR Y SERVIR las 5 colecciones con el catálogo de hoy",
      noCubre: [
        "el CASCARÓN: el clon lo construye con sus propios assets, no entran en el CMS",
        "articulos-kb: ya sembrada, y su guarda es la otra (seed-kb)",
        "cualquier colección futura: esta lista es de HOY",
      ],
    },
    canales: {
      A: "campos `upload` — el único que llega a ctx.media(): BLOQUEA la siembra",
      B: "escalares con pinta de fichero (ogImage, srcset, descarga.href): bloquean el RENDER",
      C: "cuerpo rico (`code`): bloquea el RENDER",
    },
    noMide: ["no captura", "no siembra", "no toca el original"],
  },
  porColeccion: Object.fromEntries(
    Object.entries(porColeccion).map(([k, v]) => [
      k,
      {
        documentos: v.documentos,
        canales: Object.fromEntries(
          Object.entries(v.canales).map(([c, d]) => [
            c,
            { rutas: d.rutas.size, referencias: d.refs, faltan: [...d.rutas].filter((r) => faltan.has(r)).length },
          ]),
        ),
      },
    ]),
  ),
  porCanal: Object.fromEntries(["A", "B", "C"].map((k) => [k, { rutas: porCanal[k].size, faltan: [...porCanal[k]].filter((r) => faltan.has(r)).length }])),
  reparto: {
    faltanEnPublico: faltan.size,
    sinRed,
    variantesConOrigenEnPublico: reparto.variantesConOrigenEnPublico.length,
    origenesYaEnMediaCorpus: reparto.enMediaCorpus.length,
    variantesConOrigenEnMediaCorpus: reparto.variantesConOrigenEnCorpus.length,
    aPedirAlOriginal: reparto.aPedir.length,
    origenesDistintosACapturar: origenesACapturar.length,
  },
  faltan: Object.fromEntries(
    [...faltan].sort().map(([r, e]) => [r, { canales: [...e.canales].sort(), colecciones: [...e.colecciones].sort(), referencias: e.refs }]),
  ),
  sinRedDetalle: {
    variantesConOrigenEnPublico: reparto.variantesConOrigenEnPublico.sort(),
    origenesYaEnMediaCorpus: reparto.enMediaCorpus.sort(),
    variantesConOrigenEnMediaCorpus: reparto.variantesConOrigenEnCorpus.sort(),
  },
  campanaPor: {
    canal: Object.fromEntries(Object.entries(campanaPor.canal).map(([k, v]) => [k, v.size])),
    coleccion: Object.fromEntries(Object.entries(campanaPor.coleccion).map(([k, v]) => [k, v.size])),
  },
  origenesPorCanal: Object.fromEntries(Object.entries(campanaPor.canal).map(([k, v]) => [k, [...v].sort()])),
  origenesACapturar,
});

const rojo = sinCatalogo.length > 0 || canalesMudos.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} media-siembra: ${faltan.size} rutas ausentes en public · ` +
    `${origenesACapturar.length} orígenes a capturar · ${sinRed} resolubles sin red · ` +
    `${sinCatalogo.length} colección(es) sin catálogo · ${canalesMudos.length} canal(es) mudo(s)\n`,
);
process.exit(rojo ? 2 : 0);
