/**
 * PASO 0 DE LAS SPECS DE `articulos-kb` — ¿DÓNDE se pueden medir?
 * Uso: node scripts/qa/kb-css.mjs        (npm run qa:kb-css)
 *
 * ── La pregunta, y por qué no se puede contestar de oído ───────────────────
 * La fase de specs (`CLAUDE.md` §Flujo, paso 2) es `getComputedStyle` de cada
 * elemento, y `getComputedStyle` **necesita las hojas de estilo**. Los 6 HTML de
 * `articulos-kb` están congelados en `corpus/fase-3/`, pero la 43.ª tanda acaba
 * de aprender —§regla 10— que **capturar las páginas NO es capturar sus
 * assets**: las 56 imágenes de este mismo arquetipo no estaban.
 *
 * Así que antes de medir hay que saber contra qué se mide, y hay exactamente
 * dos salidas con consecuencias opuestas:
 *
 *   · el CSS está en la captura  → se mide OFFLINE, reproducible para siempre;
 *   · no está                    → **las specs necesitan el sitio vivo**, y eso
 *                                  se DECLARA con su alcance en vez de dejar la
 *                                  frase «el original sale del camino crítico»
 *                                  en absoluto (§regla 10: una campaña se
 *                                  declara completa respecto a un USO).
 *
 * ── Por qué la respuesta NO es un `grep` de `<link rel=stylesheet>` ────────
 * Porque en este sitio la respuesta es **las dos cosas a la vez**, que es el
 * peor caso posible: Divi emite **7 hojas externas** (absolutas a kunakair.com,
 * ninguna capturada) **y** ~204 KB de CSS **EN LÍNEA** dentro del propio HTML
 * —incluido `divi-dynamic-critical-inline-css` y los `et-core-unified-…-cached-
 * inline-styles`, que son justo donde viven los paddings del builder—.
 *
 * O sea que la captura **renderiza algo con estilo**, y ése es el problema: no
 * sale desnuda y evidente, sale **plausible**. Es la regla del cero con la
 * tercera cara (§sondas 4, el sobre-casado): un valor que se lee como dato.
 * Medido en el exploratorio: `body` sale `Manrope 18px` y el `h1` `44/44` —
 * creíbles— **y a la vez** `documentElement.scrollWidth = 1565` con el viewport
 * a 1440, o sea 125 px de desbordamiento que el original no tiene.
 *
 * ── Cómo se contesta, entonces: DE DOS LADOS ──────────────────────────────
 * La única medida que decide es **la misma batería de anclas en los dos
 * sitios**: la captura por `file://` con la red cortada, y el original vivo con
 * el protocolo de siempre (perfil limpio, Cookiebot bloqueado, scroll + settle).
 * Si coinciden, la captura sirve y las specs se miden offline. Si no, no sirve
 * — y el número de anclas que difieren dice **cuánto** no sirve, que es lo que
 * hay que escribir en el alcance.
 *
 * Y se separan **dos familias de ancla**, porque no fallan por lo mismo:
 *
 *   · `estilo`  — `getComputedStyle` (tipografía, ritmo, color). Depende sólo
 *                 de que las REGLAS estén;
 *   · `caja`    — `getBoundingClientRect`. Depende además de las **fuentes** y
 *                 de las imágenes, que la captura tampoco trae.
 *
 * Un veredicto que las mezclara diría «no sirve» sin decir para qué.
 *
 * ── Guardas ────────────────────────────────────────────────────────────────
 * 1 · `Censo`: un selector que no case en ninguna de las 6 sale por error;
 * 2 · `Evaluadas` con el mínimo derivado del índice de la captura (6 pares);
 * 3 · congela en `medidas/kb-css.json`;
 * 4 · `SIN_CLON=1`: esta sonda no mira el clon, así que un `build` concurrente
 *     no la contamina — y lo declara ella, no quien la lanza.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // mide la captura y el original: el clon no entra
gritaSiRevienta();

const ANCHO = Number(process.argv[2] || 1440);
const RAIZ = join(QA, "../..");
const BASE = join(RAIZ, "corpus/fase-3");

/** Las 6 salen del índice de la captura, no de una lista a mano (regla 9). */
const indice = JSON.parse(readFileSync(join(BASE, "INDICE.json"), "utf8"));
const ARTICULOS = Object.entries(indice.paginas)
  .filter(([clave, p]) => clave.startsWith("articulos-kb:") && p.fichero && p.http === 200)
  .map(([clave, p]) => ({ ruta: clave.slice("articulos-kb:".length), url: p.url, fichero: join(BASE, p.fichero) }));

if (ARTICULOS.length !== 6)
  throw new Error(
    `el índice de la captura da ${ARTICULOS.length} artículos de KB y §2d.1 midió 6.\n` +
      `  Sin las 6 no hay denominador: re-mide antes de decidir dónde se miden las specs.`,
  );

/* ══════════════════════════════════════════════════════════════════════════
 * LA BATERÍA DE ANCLAS — lo que una spec necesita leer, no una muestra al azar
 *
 * Cada ancla nombra un selector y las propiedades que la fase de specs escribe
 * para ese elemento. Si la captura reproduce ESTAS, reproduce una spec.
 * ═════════════════════════════════════════════════════════════════════════ */
/* ⚠ **Cada ancla se toma sobre el primer elemento RENDERIZADO, no sobre el
 * primero del DOM.** La primera versión anclaba en `.et_pb_row` a secas y en
 * las 6 páginas ése es `et_pb_row_0`, que el tema esconde con `d-none` — y
 * `d-none` vive en `style.css`, una de las hojas que la captura NO trae. O sea
 * que el lado OFFLINE lo renderizaba y el VIVO no, y la sonda comparaba **una
 * fila oculta contra una fila oculta que se ve**: cinco de las diez anclas que
 * «fallaban en las seis» eran eso. Es el aviso de `CLAUDE.md` §sondas 4 —*antes
 * de creerte un pleno, reconstruye un caso a mano*— cobrado en la sonda que
 * estrena el PASO 0. Corrida con el defecto, conservada:
 * `medidas/kb-css-SONDA-ANCLA-EN-FILA-OCULTA.json`.
 *
 * «Renderizado» se comprueba con `getClientRects().length`, no con la clase:
 * la clase es justo lo que un lado no tiene. */
const ANCLAS = [
  { id: "body", sel: "body", props: ["fontFamily", "fontSize", "lineHeight", "color", "backgroundColor"] },
  { id: "seccion", sel: ".et_pb_section:not([class*='_tb_'])", props: ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "backgroundColor"] },
  { id: "fila", sel: ".et_pb_section:not([class*='_tb_']) .et_pb_row", props: ["maxWidth", "paddingTop", "paddingBottom", "marginLeft", "marginRight"] },
  { id: "columna", sel: ".et_pb_section:not([class*='_tb_']) .et_pb_row > .et_pb_column", props: ["width", "marginRight", "paddingTop"] },
  { id: "h1", sel: "h1", props: ["fontFamily", "fontSize", "lineHeight", "fontWeight", "color", "letterSpacing"] },
  { id: "texto-p", sel: ".et_pb_section:not([class*='_tb_']) .et_pb_text_inner p", props: ["fontSize", "lineHeight", "color", "marginBottom"] },
  { id: "modulo-texto", sel: ".et_pb_section:not([class*='_tb_']) .et_pb_text", props: ["marginBottom", "paddingTop", "width"] },
  { id: "blurb-titular", sel: ".et_pb_blurb .et_pb_module_header", props: ["fontSize", "lineHeight", "fontWeight", "color"] },
];

/** Las anclas de CAJA: dependen además de fuentes e imágenes. */
const CAJAS = [
  { id: "docW", que: "documentElement.scrollWidth" },
  { id: "docH", que: "documentElement.scrollHeight" },
  { id: "h1.w", que: "rect" },
  { id: "h1.h", que: "rect" },
  { id: "fila.w", que: "rect" },
  { id: "columna.w", que: "rect" },
];

/** Lo que se ejecuta DENTRO de la página, igual en los dos lados. */
function medir(anclas) {
  const cs = (el, p) => (el ? getComputedStyle(el)[p] : null);
  const r = (el) => (el ? el.getBoundingClientRect() : null);
  /** El primero que de verdad ocupa sitio. `null` si ninguno — nunca «el 1.º». */
  const prim = (sel) => __qa(sel).find((el) => el.getClientRects().length > 0) ?? null;
  const estilo = {};
  /** Por ancla: ¿había un elemento RENDERIZADO al que medir en este lado? */
  const renderizada = {};
  for (const a of anclas) {
    const el = a.sel === "body" ? __q("body") : prim(a.sel);
    renderizada[a.id] = !!el;
    for (const p of a.props) estilo[`${a.id}.${p}`] = cs(el, p);
  }
  const h1 = __q("h1");
  const fila = prim(".et_pb_section:not([class*='_tb_']) .et_pb_row");
  const col = prim(".et_pb_section:not([class*='_tb_']) .et_pb_row > .et_pb_column");
  const n2 = (x) => (x === null || x === undefined ? null : +Number(x).toFixed(2));
  return {
    estilo,
    renderizada,
    caja: {
      docW: n2(document.documentElement.scrollWidth),
      docH: n2(document.documentElement.scrollHeight),
      "h1.w": n2(r(h1)?.width),
      "h1.h": n2(r(h1)?.height),
      "fila.w": n2(r(fila)?.width),
      "columna.w": n2(r(col)?.width),
    },
    hojas: {
      /* Cuántas hojas de estilo llegaron a aplicarse y con cuántas reglas: la
       * diferencia entre los dos lados es, literalmente, el CSS que falta. */
      n: document.styleSheets.length,
      reglas: [...document.styleSheets].reduce((n, s) => { try { return n + s.cssRules.length; } catch { return n; } }, 0),
      /* Las fuentes que el documento DECLARA (no las que cargaron). */
      fuentesDeclaradas: document.fonts ? document.fonts.size : null,
    },
    /* Testigo independiente del maquetado: cuántos módulos tiene el árbol. */
    modulos: __qa(".et_pb_section:not([class*='_tb_']) .et_pb_module").length,
  };
}

const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: "kb-css", unidad: "pares (captura vs original)", minimo: ARTICULOS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: `PASO 0 de las specs de \`articulos-kb\`: ¿la captura congelada sirve para \`getComputedStyle\`? Batería de ${ANCLAS.reduce((n, a) => n + a.props.length, 0)} anclas de ESTILO + ${CAJAS.length} de CAJA, medida de DOS LADOS a ${ANCHO}.`,
    ancho: ANCHO,
    lados: { captura: "corpus/fase-3/articulos-kb/** por file:// con TODA petición no-file abortada", original: "kunakair.com vivo · perfil limpio · Cookiebot bloqueado · scroll+settle" },
    anclas: ANCLAS,
  },
  hojasExternas: {},
  articulos: {},
};

/* ── 1 · INVENTARIO DE HOJAS EXTERNAS, sobre los bytes congelados ──────────
 * Antes de renderizar nada: qué hojas pide el HTML y si alguna está en el
 * repo. Es la mitad barata de la pregunta y no necesita navegador.
 *
 * ⚠ «está en el repo» se DERIVA recorriendo el árbol, no mirando el primer
 * nivel de tres directorios: un `readFileSync(dir, nombre)` que falla y un
 * fichero que está tres carpetas más abajo dan la misma salida (§sondas 4). */
function basenamesBajo(dir, acc = new Set()) {
  let entradas;
  try { entradas = readdirSync(dir); } catch { return acc; }
  for (const e of entradas) {
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) basenamesBajo(p, acc);
    else acc.add(e.toLowerCase());
  }
  return acc;
}
const EN_EL_REPO = basenamesBajo(join(RAIZ, "corpus"), basenamesBajo(join(RAIZ, "media-corpus"), basenamesBajo(join(RAIZ, "apps/web/public"))));

for (const a of ARTICULOS) {
  const html = readFileSync(a.fichero, "utf8");
  const enlaces = [...html.matchAll(/<link[^>]+(?:rel=['"]stylesheet['"]|as=['"]style['"])[^>]*>/g)].map((m) => {
    const href = m[0].match(/href=['"]([^'"]+)['"]/)?.[1] ?? null;
    return href;
  }).filter(Boolean);
  const estilos = [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
  salida.hojasExternas[a.ruta] = {
    externas: enlaces,
    externasEnElRepo: enlaces.filter((h) => EN_EL_REPO.has(h.split("?")[0].split("/").pop().toLowerCase())),
    enLinea: { bloques: estilos.length, bytes: estilos.reduce((n, s) => n + s[2].length, 0) },
  };
}

/* ── 2 · LOS DOS LADOS ─────────────────────────────────────────────────────
 * Secuencial y con etiqueta de 500 ms contra el original, como la campaña. */
for (const a of ARTICULOS) {
  /* (a) LA CAPTURA — `file://` con toda petición que no sea `file:` abortada.
   * Sin esto, Chrome pide los assets absolutos al sitio vivo y la medida
   * «offline» estaría pegándole al original (el fallo que kb-recon documenta). */
  const off = await browser.newPage();
  await off.setRequestInterception(true);
  let bloqueadas = 0, bloqueadasCss = 0;
  off.on("request", (r) => {
    if (r.url().startsWith("file:")) return void r.continue();
    bloqueadas++;
    if (/\.css(\?|$)/.test(r.url())) bloqueadasCss++;
    r.abort().catch(() => {});
  });
  await off.setViewport({ width: ANCHO, height: 900 });
  await off.goto(pathToFileURL(a.fichero).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 1200));
  const { datos: captura } = await censo.medir(off, medir, ANCLAS);
  await off.close();

  /* (b) EL ORIGINAL VIVO — protocolo estándar. */
  const { page, status } = await openPage(browser, a.url, { width: ANCHO, height: 900 });
  if (status >= 400 || status === 0) {
    ev.fallo(a.ruta, `HTTP ${status}`);
    await page.close();
    continue;
  }
  await settle(page);
  const { datos: vivo } = await censo.medir(page, medir, ANCLAS);
  await page.close();
  await new Promise((r) => setTimeout(r, 500)); // etiqueta con el original

  /* (c) EL DIFF, por familia.
   *
   * Se separa **«el ancla no se renderiza en uno de los dos lados»** de «el
   * valor difiere», porque no son el mismo hallazgo y mezclarlos daría un
   * recuento que no se puede leer: el `h1` del centro de ayuda («Kunak Help
   * Center») está OCULTO en el original y VISIBLE en la captura, y eso es una
   * sola cosa —el CSS que lo esconde no está— contada seis veces si se mira
   * propiedad a propiedad. */
  const estiloDif = [], soloUnLado = [];
  for (const k of Object.keys(vivo.estilo)) {
    if (captura.estilo[k] === vivo.estilo[k]) continue;
    const id = k.split(".")[0];
    if (captura.renderizada[id] !== vivo.renderizada[id])
      soloUnLado.push({ ancla: k, enCaptura: captura.renderizada[id], enOriginal: vivo.renderizada[id] });
    else estiloDif.push({ ancla: k, captura: captura.estilo[k], original: vivo.estilo[k] });
  }
  const cajaDif = [];
  for (const k of Object.keys(vivo.caja)) {
    const d = (captura.caja[k] ?? NaN) - (vivo.caja[k] ?? NaN);
    if (!(Math.abs(d) < 0.01)) cajaDif.push({ ancla: k, captura: captura.caja[k], original: vivo.caja[k], delta: +Number(d).toFixed(2) });
  }

  salida.articulos[a.ruta] = {
    captura: { ...captura, peticionesBloqueadas: bloqueadas, hojasCssBloqueadas: bloqueadasCss },
    original: vivo,
    diff: {
      estilo: { total: Object.keys(vivo.estilo).length, distintas: estiloDif.length, detalle: estiloDif },
      soloUnLado: { n: soloUnLado.length, detalle: soloUnLado },
      caja: { total: Object.keys(vivo.caja).length, distintas: cajaDif.length, detalle: cajaDif },
      modulos: { captura: captura.modulos, original: vivo.modulos, iguales: captura.modulos === vivo.modulos },
    },
  };
  ev.ok();

  const nombre = a.ruta.replace(/\/$/, "").split("/").pop();
  console.log(
    `  ${nombre.padEnd(52)} estilo ${String(estiloDif.length).padStart(2)}/${Object.keys(vivo.estilo).length} distintas · ` +
      `sólo-un-lado ${soloUnLado.length} · caja ${cajaDif.length}/${Object.keys(vivo.caja).length} · ` +
      `módulos ${captura.modulos}${captura.modulos === vivo.modulos ? "=" : "≠"}${vivo.modulos} · ` +
      `reglas ${captura.hojas.reglas} vs ${vivo.hojas.reglas} (${bloqueadasCss} hojas CSS bloqueadas)`,
  );
}

await browser.close();

/* ══════════════════════ EL VEREDICTO, CON SU ALCANCE ══════════════════════ */
const A = Object.values(salida.articulos);
const estiloDistintas = A.reduce((n, x) => n + x.diff.estilo.distintas, 0);
const estiloTotal = A.reduce((n, x) => n + x.diff.estilo.total, 0);
const soloUnLadoN = A.reduce((n, x) => n + x.diff.soloUnLado.n, 0);
const anclasSoloUnLado = [...new Set(A.flatMap((x) => x.diff.soloUnLado.detalle.map((d) => d.ancla.split(".")[0])))];
const cajaDistintas = A.reduce((n, x) => n + x.diff.caja.distintas, 0);
const cajaTotal = A.reduce((n, x) => n + x.diff.caja.total, 0);
const arbolIgual = A.filter((x) => x.diff.modulos.iguales).length;
const hojasBloqueadas = [...new Set(Object.values(salida.hojasExternas).flatMap((h) => h.externas.map((u) => u.split("/").pop().split("?")[0])))];
const enRepo = Object.values(salida.hojasExternas).reduce((n, h) => n + h.externasEnElRepo.length, 0);

/** Qué anclas de estilo fallan SIEMPRE (en las 6) — son la causa, no el ruido. */
const porAncla = {};
for (const x of A) for (const d of x.diff.estilo.detalle) porAncla[d.ancla] = (porAncla[d.ancla] ?? 0) + 1;
const siempre = Object.entries(porAncla).filter(([, n]) => n === A.length).map(([k]) => k);

salida.veredicto = {
  ancho: ANCHO,
  articulos: A.length,
  cssExternoCapturado: enRepo,
  hojasExternasDistintas: hojasBloqueadas,
  cssEnLineaBytes: Object.values(salida.hojasExternas)[0]?.enLinea ?? null,
  estilo: { total: estiloTotal, distintas: estiloDistintas, iguales: estiloTotal - estiloDistintas },
  soloUnLado: { n: soloUnLadoN, anclas: anclasSoloUnLado },
  caja: { total: cajaTotal, distintas: cajaDistintas },
  arbolIgual: `${arbolIgual}/${A.length}`,
  anclasQueFallanEnLasSeis: siempre,
  sirveOffline: estiloDistintas === 0 && cajaDistintas === 0 && soloUnLadoN === 0,
};

console.log(`\n═══ VEREDICTO · ¿SIRVE LA CAPTURA PARA MEDIR SPECS? ═══`);
console.log(`  hojas externas que el HTML pide   ${hojasBloqueadas.length} distintas · CAPTURADAS en el repo: ${enRepo}`);
console.log(`  CSS EN LÍNEA dentro del HTML      ${salida.veredicto.cssEnLineaBytes?.bloques} bloques · ${salida.veredicto.cssEnLineaBytes?.bytes} bytes  ← por esto la captura NO sale desnuda`);
console.log(`  anclas de ESTILO                  ${estiloDistintas} distintas de ${estiloTotal}`);
console.log(`  anclas que sólo se RENDERIZAN en un lado  ${soloUnLadoN} (${anclasSoloUnLado.join(" · ") || "ninguna"})`);
console.log(`  anclas de CAJA                    ${cajaDistintas} distintas de ${cajaTotal}`);
console.log(`  árbol de módulos idéntico         ${arbolIgual}/${A.length}`);
if (siempre.length) console.log(`  anclas que fallan en las SEIS     ${siempre.join(" · ")}`);

if (salida.veredicto.sirveOffline) {
  console.log(
    `\n  ✅ SALIDA (a): la captura reproduce el original en las ${estiloTotal + cajaTotal} anclas.\n` +
      `     Las specs se miden OFFLINE contra \`corpus/fase-3/\`, y son reproducibles.\n`,
  );
} else {
  console.log(
    `\n  ⚠⚠ SALIDA (b): la captura NO reproduce el original.\n` +
      `     Las specs de \`articulos-kb\` **necesitan el sitio vivo**. Eso NO deroga la\n` +
      `     campaña de F3-0: la deja declarada con su ALCANCE — el original salió del\n` +
      `     camino crítico para OBTENER DATOS (sembrar, censar, transcribir) y NO salió\n` +
      `     para MEDIR EL PÍXEL, que es lo que una spec hace. (§regla 10: una campaña se\n` +
      `     declara completa respecto a un USO, nunca en absoluto.)\n` +
      `     Y ojo con el modo de fallo: la captura renderiza algo PLAUSIBLE —${estiloTotal - estiloDistintas} de\n` +
      `     ${estiloTotal} anclas de estilo coinciden—, así que medir ahí no habría dado error:\n` +
      `     habría dado una spec con ${estiloDistintas} valores inventados.\n`,
  );
}

const muertos = censo.informe();
w("medidas/kb-css.json", salida);
/* El veredicto de esta sonda es una MEDIDA, no un invariante del clon: que la
 * captura no sirva no es un fallo de la sonda. El código de salida sólo lo
 * cierran las guardas —mínimo de unidades y selectores muertos—. */
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
