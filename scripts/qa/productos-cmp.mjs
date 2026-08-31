/* productos-cmp — 123.ª tanda, 2026-08-30. F3-5 · ESCALÓN 1.
 *
 * EL COMPARADOR DE DOS LADOS DEL NIVEL QUE FALTA —**filas y módulos**— PARA EL
 * LOTE PRODUCTO · CATÁLOGO · SOFTWARE.
 *
 * `COBERTURA-MEDICION` declara `filas` y `módulos` a `·` en las 4 rutas, y
 * §*UN ARQUETIPO NUEVO NO HEREDA COBERTURA* dice que construir la sonda **es
 * parte de la tanda, no un extra**. Barrido el archivo (218 sondas,
 * `derivaciones/archivo-sondas-123.json`): **ninguna** mide este nivel para
 * estas rutas — las 5 que cruzaban son cascarón o matriz.
 *
 * ══ LOS DOS LADOS ═════════════════════════════════════════════════════════
 *
 *   · **ORIGINAL** = la captura de `corpus/productos/**` renderizada por
 *     `file://` **CON SUS HOJAS** (`corpus/css/<rel>`, resolución idéntica a la
 *     de `f33-cmp` L182-186: el `href` sin origen ni query);
 *   · **CLON** = lo que sirve `next start`.
 *
 * ⚠⚠ **§regla 32 — A UN COMPARADOR DE DOS LADOS SE LE HACE A LOS DOS TODO LO
 * QUE SE LE HACE A UNO.** `f33-cmp` cortó la red **de un solo lado** y dejó
 * *65 de 71 imágenes del original a 16 px* —el alto de un `<img>` roto— contra
 * las del clon cargadas: +12 764.95 de altos falsos, el 58 % del Δ de cuerpo.
 * Aquí la intercepción se instala en **los dos**, y lo que se aplica a un lado
 * se enumera para el otro:
 *
 *   | qué                    | ORIGINAL | CLON |
 *   |------------------------|----------|------|
 *   | intercepción de red    | sí       | sí   |
 *   | viewport / emulación   | idéntico | idéntico |
 *   | `settle()`             | sí       | sí   |
 *
 * ⚠ **Y las precondiciones se comprueban ANTES del `launch`** (§regla 37): un
 * insumo tardío cuesta la corrida entera, y la magnitud no es la distancia en
 * líneas sino la NAVEGACIÓN que hay entre medias. Aquí no hay ninguna.
 *
 * ⚠ **Sin las hojas la medida NO da error: da una medida PLAUSIBLE y falsa.**
 * Medido en este repo (§F3-1-CSS-NO-CAPTURADO): `columna.width` **678.52**
 * contra **430.80** en vivo — la partición en columnas no ocurre. Por eso el
 * cardinal de «sin resolver» de CADA canal se publica y **una corrida con
 * alguno ≠ 0 NO VALE** (§regla 32).
 *
 * Uso:  ANCHO=1440 node productos-cmp.mjs      (con el clon servido)
 *       ANCHO=390  node productos-cmp.mjs
 *
 * ⚠ **EL ANCHO VA POR `ANCHO=`, NO POR ARGUMENTO.** Aquí decía `node
 * productos-cmp.mjs [ancho]` y el código lee `env("ANCHO", "1440")` (L66), así
 * que un `node productos-cmp.mjs 390` **corre a 1440 sin dar error**: mismo
 * fichero de salida, mismo `pares 4/4`, misma línea de unidades. Cobrado en la
 * 129.ª — dos corridas seguidas «a 1440 y a 390» que fueron **las dos a 1440**,
 * y sólo lo delató que las dos publicaran `distintos: 43` cuando la congelada
 * de 390 dice 49.
 *
 * Es §regla 3 —*documentado no es conectado*— sobre la LÍNEA DE USO: lo único
 * del fichero que nadie ejecuta ni verifica, y que aquí no describía el
 * programa sino una intención.
 *
 * Sabotajes (negativo):  NEG_MISMO_LADO=1 · NEG_DELTA=<px> · NEG_SIN_INSUMOS=1
 * Nombrar la corrida sin marcarla como negativa:  SALIDA=<ruta.json>
 *   (⚠ `NEG=` NO es la palanca para eso: MARCA la salida como artefacto de
 *    §regla 7 y la vuelve invisible a `eligeCongeladaAnterior` y a los censos.)
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, launch, openPage, settle, w, env, QA, gritaSiRevienta } from "./lib.mjs";

const RAIZ = join(QA, "..", "..");
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
/* Las raíces de media y su criterio de `rel` se REPLICAN de `f33-cmp` (L121-128,
 * L154-165), no se inventan: dos instrumentos que resuelven el mismo canal con
 * criterios distintos inventan el desacuerdo (§regla 31, hermana).
 *
 * ⚠ El `rel` NO es «el href sin el origen»: es lo que va DESPUÉS de
 * `wp-content/uploads/`, porque así es como están guardadas las copias. Mi v1
 * quitaba sólo el origen y daba **0 de 162 resueltas** — un cero del resolutor
 * que se habría leído como «el canal de imagen está sin capturar». */
const MEDIA_RAICES = [
  { nombre: "public/images/uploads", dir: join(RAIZ, "apps/web/public/images/uploads") },
  { nombre: "media-corpus", dir: join(RAIZ, "media-corpus") },
];

const ANCHO = Number(env("ANCHO", "1440"));
const MOVIL = ANCHO <= 480;

/* ── SABOTAJES, y los declara la sonda ─────────────────────────────────────
 * §regla 24 (mitad de higiene): un sabotaje por variable de entorno TIENE que
 * desviar el nombre de la salida ÉL MISMO. Si el desvío dependiera de que quien
 * lanza ponga además `NEG=`, el nombre CANÓNICO quedaría al alcance de una
 * corrida de control — y lo que sale entonces es un fichero con **nombre de
 * medida y contenido de control** (§regla 7). */
const MISMO_LADO = !!env("NEG_MISMO_LADO");
const DELTA = Number(env("NEG_DELTA", "0"));
const SIN_INSUMOS = !!env("NEG_SIN_INSUMOS");
const SABOTEADA = MISMO_LADO || DELTA || SIN_INSUMOS;
if (SABOTEADA && !process.env.NEG) {
  process.env.NEG = MISMO_LADO ? "mismo-lado" : DELTA ? `delta-${DELTA}` : "sin-insumos";
  console.log(`⚠ sabotaje ACTIVO sin NEG=: la sonda desvía su salida a «${process.env.NEG}» ella misma (§regla 24)`);
}

/* ── EL LOTE ───────────────────────────────────────────────────────────────
 * Se declara el par (documento capturado ↔ ruta del clon). No se deriva del
 * directorio porque `corpus/productos` trae además 18 fichas de cartucho y una
 * estación que **no están clonadas**: meterlas daría 19 pares sin lado de clon,
 * que es ruido, no cobertura. */
const LOTE = [
  { doc: "monitor-calidad-aire.html", ruta: "/monitor-calidad-aire", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", ruta: "/accesorios", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", ruta: "/software-de-medicion-calidad-del-aire", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", ruta: "/kunak-api", arquetipo: "SOFTWARE (variante corta)" },
];

/* ══ PRECONDICIONES — ANTES del launch (§regla 37) ═════════════════════════
 * Se comprueban las tres y se publica el cardinal de cada una. Una precondición
 * que invalida la MEDIDA se cuenta en rojo y deja llegar al informe (§regla 31);
 * la que impide medir del todo —no hay documento— sí corta. */
const relDeHoja = (href) => {
  const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
  return /^https?:/i.test(rel) || rel.startsWith("/") ? null : rel;
};
const attr = (tag, n) => tag.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;

function mediaLocal(url0) {
  if (/^data:/i.test(url0)) return { url: "data", motivo: null };
  const rel = url0.replace(/^https?:\/\/[^/]*kunakair\.com\/wp-content\/uploads\//i, "").split("?")[0];
  /* Un host AJENO no es un hueco de captura: es simétrico por construcción —el
   * clon lo sirve absoluto también, así que con la red cortada en los dos lados
   * los dos lo pintan roto. No comparte contador con «local sin capturar». */
  if (/^https?:/i.test(rel) || rel.startsWith("/")) return { url: null, motivo: "externo" };
  for (const r of MEDIA_RAICES) if (existsSync(join(r.dir, rel))) return { url: pathToFileURL(join(r.dir, rel)).href, motivo: null, via: "exacta" };
  /* ⚠ SEGUNDO INTENTO, y va DECLARADO con su vía porque no es gratis: el
   * pipeline del clon NORMALIZA el nombre del fichero —minúsculas y sin el
   * punto—, así que `PM2.5_belgium.webp` está capturada como `pm25_belgium.webp`.
   * Eso NO es «colapsar variantes»: las variantes `-WxH` servirían otras
   * dimensiones intrínsecas y siguen SIN colapsarse (f33-cmp L149-152). Aquí es
   * el MISMO fichero con el nombre normalizado, y por eso la vía se publica:
   * un resolutor que acierta «de alguna manera» sin decir cuál es un heurístico
   * disfrazado de identidad (§sondas 4, tercera cara). */
  const dir = rel.slice(0, rel.lastIndexOf("/") + 1);
  const base = rel.slice(rel.lastIndexOf("/") + 1);
  const ext = base.slice(base.lastIndexOf("."));
  const norm = dir + base.slice(0, base.lastIndexOf(".")).toLowerCase().replace(/\./g, "") + ext;
  if (norm !== rel) for (const r of MEDIA_RAICES) if (existsSync(join(r.dir, norm))) return { url: pathToFileURL(join(r.dir, norm)).href, motivo: null, via: "nombre-normalizado" };
  return { url: null, motivo: "sin-capturar" };
}

const precondiciones = { documentos: { faltan: [] }, hojas: { pedidas: 0, resueltas: 0, sinResolver: [] }, media: { pedidas: 0, resueltas: 0, sinResolver: [], externas: 0 } };

for (const it of LOTE) {
  const f = join(CORPUS, SIN_INSUMOS ? it.doc.replace(/\.html$/, "-QUE-NO-EXISTE.html") : it.doc);
  if (!existsSync(f)) { precondiciones.documentos.faltan.push(it.doc); continue; }
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/rel=["']?stylesheet/i.test(m[0])) continue;
    const href = attr(m[0], "href");
    if (!href) continue;
    const rel = relDeHoja(href);
    if (rel === null) continue; /* externo: lo pintan roto los dos lados */
    precondiciones.hojas.pedidas++;
    if (existsSync(join(CSS, rel))) precondiciones.hojas.resueltas++;
    else precondiciones.hojas.sinResolver.push(rel);
  }
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = attr(m[0], "src");
    if (!src) continue;
    precondiciones.media.pedidas++;
    const r = mediaLocal(src);
    if (r.url) { precondiciones.media.resueltas++; if (r.via === "nombre-normalizado") (precondiciones.media.porNombreNormalizado ??= []).push(src.slice(0, 110)); }
    else if (r.motivo === "externo") precondiciones.media.externas++;
    else precondiciones.media.sinResolver.push(src.slice(0, 110));
  }
}

const hojasFaltan = precondiciones.hojas.sinResolver.length;
const mediaFaltan = precondiciones.media.sinResolver.length;
const docsFaltan = precondiciones.documentos.faltan.length;

console.log("═══ PRECONDICIONES (comprobadas ANTES del launch, §regla 37) ═══");
console.log(`  documentos   : ${LOTE.length - docsFaltan}/${LOTE.length} presentes`);
console.log(`  hojas        : ${precondiciones.hojas.resueltas}/${precondiciones.hojas.pedidas} resueltas · sin resolver ${hojasFaltan}`);
console.log(`  media (<img>): ${precondiciones.media.resueltas}/${precondiciones.media.pedidas} resueltas · sin resolver ${mediaFaltan} · externas ${precondiciones.media.externas} · por nombre normalizado ${(precondiciones.media.porNombreNormalizado ?? []).length}`);

/* Sin documentos no hay nada que medir: corrida NULA, y se dice por qué. */
if (docsFaltan === LOTE.length) {
  console.log("");
  console.log("❌ CORRIDA NULA — no hay NI UN documento del lote en corpus/productos.");
  console.log("   No es un defecto del clon: es que el insumo no está. Nada que comparar.");
  process.exit(3);
}

/* Los canales incompletos NO cortan aquí: dejan llegar al informe y cierran el
 * código de salida al final (§regla 31), porque los números que la sonda
 * produciría son justamente la evidencia que su negativo necesita. */
const CANAL_ABIERTO = hojasFaltan > 0 || mediaFaltan > 0;
if (CANAL_ABIERTO) {
  console.log("");
  console.log("⚠ HAY CANALES SIN CERRAR — la corrida MIDE pero NO ACREDITA (§regla 32).");
  console.log("  Sin sus hojas la captura no da error: da una medida PLAUSIBLE y falsa.");
}

/* ── el mínimo se DERIVA, no se escribe ────────────────────────────────────
 * `minimo: 1` sería un contrato que no expresa lo que la sonda afirma. La
 * unidad es el PAR (una ruta × un ancho) y el mínimo es el lote entero menos
 * los documentos ausentes, que ya están contados arriba. */
const ev = new Evaluadas({
  unidad: "pares ruta×ancho",
  minimo: Math.max(1, LOTE.length - docsFaltan),
  nombre: "productos-cmp",
});
gritaSiRevienta();

/* ── reescritura de los TRES canales a copia local ─────────────────────────── */
function conAssetsLocales(html) {
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = attr(tag, "href");
    if (!href) return tag;
    const rel = relDeHoja(href);
    if (rel === null || !existsSync(join(CSS, rel))) return tag;
    return tag.replace(/href=["'][^"']*["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attr(tag, "src");
    if (!src || /^data:/i.test(src)) return tag;
    const f = mediaLocal(src);
    if (!f.url || f.url === "data") return tag;
    return tag.replace(/src=["'][^"']*["']/i, `src="${f.url}"`);
  });
  return out;
}

/* ── LA MEDIDA — mismo criterio de recuento que `mono-cmp` ──────────────────
 * §regla 31 (hermana): dos instrumentos que censan el mismo objeto tienen que
 * compartir el criterio de recuento, o su cruce inventa el desacuerdo. Se
 * replica el de `mono-cmp` L92-115: fila → columna → módulo con `h`, `mb`, `pb`.
 *
 * ⚠ Y se selecciona **por CAJA, no por orden**: el constructor resuelve «esto
 * sólo en móvil» DUPLICANDO el módulo y escondiendo uno por ancho, así que el
 * primero del DOM puede ser el escondido — y `getComputedStyle` sobre un
 * elemento sin caja no resuelve los porcentajes contra nada: devuelve ceros que
 * entran en la distribución como si fueran dato. */
const extraer = (esOriginal) => {
  const r = (n) => Math.round(n * 100) / 100;
  const px = (v) => r(parseFloat(v) || 0);
  const conCaja = (el) => {
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  };
  /* ⚠⚠ LOS DOS SELECTORES TIENEN QUE DENOTAR EL MISMO CONJUNTO — y a la primera
   * NO lo hacían. `.et_pb_row` a secas casa también las filas de la CABECERA y
   * el PIE del theme builder, que Divi mete dentro de `.et_pb_section`, y el
   * clon no las marca con `data-fila`. Medido en monitor-calidad-aire: 14 filas
   * totales, **5 del cascarón** (1 `_tb_header` + 3 `_tb_footer` y sus filas).
   *
   * La firma de que era el instrumento y no el clon estaba a la vista y este
   * repo la tiene escrita: **103 de 156 ejes distintos (66 %)**, `w` valiendo
   * `1440` —el viewport entero, que es lo que mide una fila de cascarón y no
   * una de cuerpo— en TODAS las filas, y **24 huérfanas de un solo lado**.
   * §*31 de 31 rutas distintas no es un hallazgo: es el instrumento*, y es
   * literalmente el mismo defecto que tuvo la v1 del árbol de `c-cmp`.
   *
   * Se acota a CUERPO en los dos lados: en el original, fuera las filas que
   * cuelgan de una sección `_tb_header`/`_tb_footer`; en el clon, sólo las de
   * `main`. */
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  const todas = esOriginal
    ? [...document.querySelectorAll(".et_pb_row")].filter((el) => !enCascaron(el))
    : [...document.querySelectorAll("main [data-fila]")];
  const vivas = todas.filter(conCaja);
  return {
    nFilasEnElDOM: todas.length,
    nFilasConCaja: vivas.length,
    filas: vivas.map((f, j) => {
      const cs = getComputedStyle(f);
      const mods = [...f.querySelectorAll(esOriginal ? ".et_pb_module" : ":scope > div, :scope > *")]
        .filter(conCaja)
        .slice(0, 60);
      return {
        j,
        h: r(f.getBoundingClientRect().height),
        w: r(f.getBoundingClientRect().width),
        mb: px(cs.marginBottom),
        pt: px(cs.paddingTop),
        pb: px(cs.paddingBottom),
        nModulosEnElDOM: f.querySelectorAll(esOriginal ? ".et_pb_module" : ":scope > div, :scope > *").length,
        nModulosConCaja: mods.length,
        mods: mods.map((m, k) => {
          const ms = getComputedStyle(m);
          return { k, h: r(m.getBoundingClientRect().height), mb: px(ms.marginBottom), pb: px(ms.paddingBottom) };
        }),
      };
    }),
  };
};

const { browser } = await launch();

/* §regla 32: la intercepción se instala en LOS DOS lados. */
async function corta(page) {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const u = req.url();
    if (u.startsWith("file:") || u.startsWith("data:") || u.startsWith("http://localhost") || u.startsWith("http://127.0.0.1")) req.continue();
    else req.abort();
  });
}

async function medirOriginal(doc) {
  const f = join(CORPUS, doc);
  /* Se navega DIRECTAMENTE al `file://` —no a `about:blank`— porque el origen
   * de partida es lo que hace que las rutas locales de las hojas resuelvan, y
   * porque `openPage` cuenta como no-evaluada toda página cuyo HTTP no sea 2xx:
   * un `about:blank` intermedio metía 4 avisos de «HTTP 0» que son ruido del
   * instrumento, no del objeto. */
  const { page } = await openPage(browser, pathToFileURL(f).href, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  await corta(page);
  /* `domcontentloaded` y no `networkidle0`: con la red cortada las peticiones
   * abortadas no producen «idle», asi que el segundo se agota a los 30 s SIN
   * que nada este mal. El asentado lo hace `settle()`, en los DOS lados. */
  await page.setContent(conAssetsLocales(readFileSync(f, "utf8")), { waitUntil: "domcontentloaded" });
  await settle(page);
  const out = await page.evaluate(extraer, true);
  out.hojasAplicadas = await page.evaluate(() => document.styleSheets.length);
  await page.close();
  return out;
}

async function medirClon(base, ruta) {
  const { page, res } = await openPage(browser, base + ruta, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  await settle(page);
  const out = await page.evaluate(extraer, false);
  out.http = res?.status?.() ?? null;
  await page.close();
  return out;
}

let baseClon = null;
if (!MISMO_LADO) {
  const { iniciarClon } = await import("./lib.mjs");
  baseClon = (await iniciarClon()).base;
}

const pares = [];
for (const it of LOTE) {
  if (precondiciones.documentos.faltan.includes(it.doc)) continue;
  const O = await medirOriginal(it.doc);
  /* SABOTAJE `mismo-lado`: el lado del clon ES el original. Si el comparador
   * compara de verdad, tiene que dar 0 distintos. */
  let C = MISMO_LADO ? JSON.parse(JSON.stringify(O)) : await medirClon(baseClon, it.ruta);
  /* SABOTAJE `delta`: se inyecta un Δ CONOCIDO en la primera fila del clon. El
   * caso no puede atarse sólo al código de salida (§regla 21, la vuelta): se
   * exige que la sonda lo CACE y lo NOMBRE con sus dos lados. */
  if (DELTA && C.filas.length) C.filas[0].h = Math.round((C.filas[0].h + DELTA) * 100) / 100;
  pares.push({ ...it, O, C });
}
await browser.close();

/* ── COMPARAR ──────────────────────────────────────────────────────────────
 * El emparejamiento es por ORDEN dentro del documento, y la llave NO puede ser
 * opcional (§regla 33): una fila sin pareja se cuenta como HUÉRFANA por su
 * lado, nunca se empareja con la de al lado. Y los dos lados se publican por
 * separado — `faltan` y `sobran` creciendo juntos es la firma de una llave que
 * no casa, no un hallazgo. */
const informe = [];
let distintos = 0, comparados = 0, huerfanasO = 0, huerfanasC = 0, nSubpixel = 0;
for (const p of pares) {
  const n = Math.min(p.O.filas.length, p.C.filas.length);
  huerfanasO += Math.max(0, p.O.filas.length - n);
  huerfanasC += Math.max(0, p.C.filas.length - n);
  /* ⚠⚠ EL EJE `nModulos` SE EXCLUYE, Y SE PUBLICA CON SU CARDINAL — no se
   * cuenta como defecto ni se calla (§regla 14: *una limitación declarada sin su
   * número se lee como una nota al pie*).
   *
   * Motivo, y es el mismo de las filas una vuelta más abajo: **el clon no emite
   * marcador de MÓDULO**. En el original `.et_pb_module` casa los módulos
   * anidados dentro de cada columna; en el clon lo único disponible son los
   * hijos directos de `[data-fila]`, que es otro conjunto. Medido: `14 → 2`,
   * `7 → 2`, `6 → 2` — la firma de dos selectores que no denotan lo mismo, no la
   * de un clon al que le falten 12 módulos.
   *
   * ⇒ El eje `módulos` de este arquetipo sigue **SIN COMPARAR**, y cerrarlo pide
   * emitir `data-modulo` en los componentes, que es trabajo de otra tanda. */
  const EJES_FILA = ["h", "w", "mb", "pt", "pb"];
  /* La rejilla de `LayoutUnit`: Chrome guarda la maquetación en 1/64 de px. Dos
   * valores que caen en el mismo 1/64 sirven EL MISMO píxel, así que un Δ por
   * debajo de 1/64 es una diferencia de lo DECLARADO que no llega a la
   * geometría. Se publica aparte —es real como transcripción— pero no se suma a
   * `distintos`, o el eje se llena de ruido de redondeo. */
  const REJILLA = 1 / 64;
  const difs = [];
  const subpixel = [];
  for (let j = 0; j < n; j++) {
    for (const eje of EJES_FILA) {
      const o = p.O.filas[j][eje], c = p.C.filas[j][eje];
      comparados++;
      if (o === c) continue;
      const d = Math.round((c - o) * 10000) / 10000;
      if (Math.abs(d) < REJILLA) { subpixel.push({ fila: j, eje, orig: o, clon: c, delta: d }); continue; }
      distintos++;
      difs.push({ fila: j, eje, orig: o, clon: c, delta: Math.round(d * 100) / 100 });
    }
  }
  informe.push({
    ruta: p.ruta, arquetipo: p.arquetipo,
    filas: { orig: p.O.filas.length, clon: p.C.filas.length, origEnElDOM: p.O.nFilasEnElDOM, clonEnElDOM: p.C.nFilasEnElDOM },
    hojasAplicadas: p.O.hojasAplicadas, httpClon: p.C.http ?? null,
    nDifs: difs.length, difs: difs.slice(0, 40),
    subpixel: { n: subpixel.length, casos: subpixel.slice(0, 12) },
    /* SIN COMPARAR, con su cardinal y su motivo (§regla 14) */
    modulosSinComparar: {
      motivo: "el clon no emite marcador de MODULO: los dos selectores no denotan el mismo conjunto",
      porFila: p.O.filas.slice(0, n).map((f, j) => ({ fila: j, orig: f.nModulosConCaja, clonHijosDirectos: p.C.filas[j].nModulosConCaja })),
    },
  });
  nSubpixel += subpixel.length;
  ev.ok(1);
}

const salida = {
  meta: {
    sonda: "productos-cmp", tanda: "123.ª", fecha: new Date().toISOString().slice(0, 10), ancho: ANCHO,
    /* §encargo: se declara `lado` aunque no sea obligatorio todavía — es gratis
     * en una sonda nueva y es justo lo que la 121.ª midió que NO se puede
     * retrofitar (472 canónicas caducarían). */
    lado: "DOS — ORIGINAL: captura de corpus/productos por file:// con sus hojas de corpus/css, red cortada. CLON: next start. La intercepción se instala en LOS DOS lados (§regla 32).",
    saboteada: SABOTEADA ? process.env.NEG : null,
    acredita: !CANAL_ABIERTO,
    porQueNoAcredita: CANAL_ABIERTO ? `canales sin cerrar: hojas ${hojasFaltan}, media ${mediaFaltan}` : null,
  },
  precondiciones: {
    documentos: { presentes: LOTE.length - docsFaltan, total: LOTE.length, faltan: precondiciones.documentos.faltan },
    hojas: { pedidas: precondiciones.hojas.pedidas, resueltas: precondiciones.hojas.resueltas, sinResolver: [...new Set(precondiciones.hojas.sinResolver)] },
    media: { pedidas: precondiciones.media.pedidas, resueltas: precondiciones.media.resueltas, externas: precondiciones.media.externas, porNombreNormalizado: precondiciones.media.porNombreNormalizado ?? [], sinResolver: [...new Set(precondiciones.media.sinResolver)].slice(0, 40) },
  },
  resumen: {
    pares: pares.length, ejesComparados: comparados, distintos, huerfanasO, huerfanasC,
    subpixel: nSubpixel,
    ejesExcluidos: { modulos: "el clon no emite marcador de MODULO — SIN COMPARAR, ver modulosSinComparar por ruta" },
  },
  informe,
};
w(`medidas/productos-cmp-${ANCHO}.json`, salida);

console.log("");
console.log("═══ RESULTADO ═══");
console.log(`  pares comparados : ${pares.length} de ${LOTE.length}`);
console.log(`  ejes comparados  : ${comparados}   distintos: ${distintos}   subpixel (<1/64, no cuentan): ${nSubpixel}`);
console.log(`  eje EXCLUIDO     : modulos — el clon no emite marcador de MODULO (SIN COMPARAR, no 0 defectos)`);
console.log(`  filas huérfanas  : original ${huerfanasO} · clon ${huerfanasC}`);
for (const i of informe) {
  console.log(`  ${i.ruta.padEnd(40)} filas orig=${i.filas.orig} clon=${i.filas.clon}  hojas=${i.hojasAplicadas}  http=${i.httpClon}  difs=${i.nDifs}`);
  for (const d of i.difs.slice(0, 6)) console.log(`      fila ${d.fila} ${d.eje.padEnd(16)} orig ${d.orig} → clon ${d.clon}  Δ${d.delta > 0 ? "+" : ""}${d.delta}`);
}
console.log("");
console.log(`✓ evaluadas ${pares.length}/${LOTE.length - docsFaltan} pares · ${comparados} ejes`);

/* ── el código de salida, con un valor por MOTIVO ──────────────────────────
 * Tres motivos, tres códigos: así un rojo futuro se puede ATRIBUIR (§regla 24). */
if (CANAL_ABIERTO) { console.log("EXIT 2 — la corrida MIDE pero NO ACREDITA: hay canales sin cerrar."); process.exit(2); }
if (distintos) { console.log(`EXIT 4 — ${distintos} ejes distintos entre original y clon.`); process.exit(4); }
console.log("EXIT 0 — sin diferencias en los ejes comparados.");
