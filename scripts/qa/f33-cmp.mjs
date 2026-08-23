/* f33-cmp — 93.ª tanda, 2026-08-22. ESCALÓN 3.
 *
 * EL COMPARADOR DE DOS LADOS DE LA COLA LARGA. No existía: `COBERTURA-MEDICION`
 * declara **0 ejes comparados** en las 31, y §*UN ARQUETIPO NUEVO NO HEREDA
 * COBERTURA* dice que construirlo **es parte de la tanda, no un extra**.
 *
 * ══ LOS DOS LADOS, Y POR QUÉ EL DE LA IZQUIERDA NO ES EL ORIGINAL VIVO ══════
 *
 *   · **ORIGINAL** = la captura de `corpus/fase-3/**` renderizada por `file://`
 *     **CON SUS HOJAS**, que viven en `corpus/css/`. Toda petición que no sea
 *     `file:` se aborta: sin eso Chrome pide los assets absolutos al sitio vivo
 *     y la medida «offline» estaría pegándole al original;
 *   · **CLON** = lo que sirve `next start`.
 *
 * ⚠⚠ **LAS HOJAS NO SON UN EXTRA: SIN ELLAS LA MEDIDA ES PLAUSIBLE Y FALSA.**
 * Está medido en este repo (§F3-1-CSS-NO-CAPTURADO): una captura sin hojas dio
 * `columna.width` **678.52** contra **430.80** en vivo — la partición en
 * columnas **no ocurre**, y una spec habría afirmado con número que el cuerpo
 * de ese arquetipo es plano. Por eso:
 *
 *   > **El nº de hojas que CARGARON se cuenta y se publica, y si alguna página
 *   > carga 0 la corrida NO vale.** Un `<link>` a `https://kunakair.com/…` con
 *   > la red cortada no da error: da una página sin estilo, que es exactamente
 *   > la salida que no se nota.
 *
 * Las hojas se sirven reescribiendo el `href` del `<link>` a la copia local
 * **antes** de cargar, y el control de que eso funciona es el recuento de
 * arriba más el sabotaje `sin-hojas` del negativo.
 *
 * ══ CÓMO SE LEE ════════════════════════════════════════════════════════════
 *
 * §CONTRATO A DOS ANCHOS: a **1440 y 390** se exige FIDELIDAD (Δ ≠ 0 es
 * defecto por encima del suelo). No se mide ningún ancho intermedio: ahí el
 * contrato es de RANGO y este comparador no lo contesta — se declara.
 *
 * ⚠ **El eje MIXTO se publica con su reparto ACERCAN/ALEJAN y se mira ANTES
 * del titular** (§*el eje que no lee como defecto esconde la mejora igual que
 * esconde la deriva*). Un recuento de pares distintos dice cuántos difieren;
 * sólo la DISTANCIA dice hacia dónde se movieron.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { Evaluadas, launch, iniciarClon, w, hoy, Censo } from "./lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");
const ANCHO = Number(process.argv[2] || process.env.ANCHO || 1440);

/* ── 1 · el dominio: el PILOTO, derivado de su congelada ───────────────────── */
const PILOTO = JSON.parse(readFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/piloto-f33.json"), "utf8")).piloto;
if (!PILOTO.length) throw new Error("PILOTO VACÍO: la congelada no lista ninguna página (§sondas 4)");

/* El mínimo se DERIVA del piloto, no se escribe: una página más sube el listón
 * sola (§4bis). */
const ev = new Evaluadas({ nombre: "f33-cmp", minimo: PILOTO.length, unidad: "páginas del piloto" });

/* ── 2 · las HOJAS: mapa url → copia local, derivado del índice ────────────── */
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (LOCAL.size === 0) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

/** Reescribe los `<link rel=stylesheet>` a la copia local. Devuelve cuántos
 *  ENLAZABA el documento y cuántos se resolvieron — los dos se publican. */
function conHojasLocales(html, sinHojas = false) {
  let enlazadas = 0, resueltas = 0;
  const sinResolver = [];
  const out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    if (sinHojas) return "";                    /* SABOTAJE `sin-hojas` */
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) { sinResolver.push(rel); return tag; }
    const abs = pathToFileURL(join(CSS, rel)).href;
    resueltas++;
    return tag.replace(/href=["'][^"']+["']/i, `href="${abs}"`);
  });
  return { html: out, enlazadas, resueltas, sinResolver };
}

/**
 * ⚠ **A 390 NO basta `setViewport({width})`.** Sin emulación de móvil, Chrome
 * headless fuerza un ancho mínimo y el «móvil» que salga es falso
 * (`CLAUDE.md` §Notas de método). Se aplica a **LOS DOS LADOS** por el mismo
 * camino: si sólo se emulara uno, el Δ mediría la emulación, no el clon.
 *
 * Es `setViewport` con `isMobile`/`hasTouch` y no CDP a pelo porque es lo que
 * este repo ya midió que funciona — `openPage`, con su porqué escrito.
 */
const MOVIL = ANCHO <= 500;
const UA_MOVIL = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
async function preparaViewport(page) {
  if (MOVIL) {
    await page.setViewport({ width: ANCHO, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.setUserAgent(UA_MOVIL);
  } else {
    await page.setViewport({ width: ANCHO, height: 900, deviceScaleFactor: 1 });
  }
}

/* ── 3 · LOS EJES — los mismos nombres que la matriz de cobertura ──────────── */
const censo = new Censo();
function medir() {
  const $ = (s) => globalThis.__q(s);
  const $$ = (s) => globalThis.__qa(s);
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };

  /**
   * ⚠⚠ **SÓLO LA CAPA PROPIA. El sufijo `_tb_` es el discriminador, y sin él
   * este comparador daría «las 6 distintas» — que sería el INSTRUMENTO, no un
   * hallazgo.**
   *
   * Divi mete la cabecera y el pie del theme-builder **dentro de
   * `.et_pb_section`**, y el clon no los emite así. La primera versión de
   * `c-cmp` se comió exactamente esto: dio **31 de 31 rutas con el árbol
   * distinto**, cero defectos, porque los dos selectores no denotaban el mismo
   * conjunto (sector `{tb_header:1, tb_footer:3, propia:7}` = 11 contra los 7
   * del clon, **y los 7 eran exactos**).
   *
   * Aquí lo destapó el control a 390: `/es/recursos/` daba `sec 8` cuando el
   * censo del piloto —que sí filtra `_tb_`— dice **4 secciones propias**. Las
   * otras 4 son cascarón.
   *
   * El criterio es el mismo que `arbol-f33.mjs` §`esPropia`: una clase con
   * `_tb_` es de la plantilla, no de la instancia.
   */
  const propio = (el) => ![...el.classList].some((c) => c.includes("_tb_"));

  const h1 = $("h1");
  const secciones = $$(".et_pb_section, [data-seccion]").filter(propio);
  const filas = $$(".et_pb_row:not(.et_pb_row_inner), [data-fila]").filter(propio);
  const modulos = $$("[class*='et_pb_module'], [data-modulo]").filter(propio);

  const out = {
    docH: +document.documentElement.getBoundingClientRect().height.toFixed(2),
    /* BASE EN CRUDO — la `y` absoluta del `h1`, SIN corregir. §Notas de método:
     * la regla del h1 resta la base antes de comparar, así que no puede
     * auditarse a sí misma; cada arquetipo mide su base cruda UNA vez. */
    base: h1 ? +(h1.getBoundingClientRect().top + window.scrollY).toFixed(2) : null,
    nSecciones: secciones.length,
    nFilas: filas.length,
    nModulos: modulos.length,
    /* ANCHOS — el eje que una guarda vertical no ve (§`clon-base` mide otro eje) */
    anchos: {},
    cajas: {},
    enlaces: $$("a[href]").map((a) => a.getAttribute("href")).filter((h) => h && !h.startsWith("#")).length,
    /* CONTROL de que las hojas llegaron: sin CSS, Divi no pinta ni una caja. */
    hojasAplicadas: [...document.styleSheets].length,
    cuerpoTieneEstilo: getComputedStyle(document.body).fontFamily,
  };
  secciones.forEach((s, i) => { out.cajas[`sec${i}`] = r(s); });
  filas.forEach((f, i) => { out.anchos[`fila${i}`] = +f.getBoundingClientRect().width.toFixed(2); });
  return out;
}

/* ── 4 · el recorrido ─────────────────────────────────────────────────────── */
const SIN_HOJAS = !!process.env.NEG_SIN_HOJAS;
const MISMO_LADO = !!process.env.NEG_MISMO_LADO;   /* control: los dos lados iguales */
const DELTA = Number(process.env.NEG_INYECTA_DELTA || 0);

/**
 * ⚠ **El control `mismo-lado` NO levanta el clon, y es deliberado.**
 *
 * Lo que ese caso pregunta es *«¿el comparador compara, o inventa
 * diferencias?»*, y eso **no depende de que exista emisión**. Poder correrlo
 * sin clon es lo que permite **probar el instrumento ANTES de emitir**, que es
 * el orden que CORTE LIMPIO 3 impone: un comparador sin negativo probado no
 * adjudica nada, así que se prueba primero.
 */
const { browser } = await launch();
const baseClon = MISMO_LADO ? null : (await iniciarClon()).base;

const salida = { meta: { sonda: "f33-cmp", fecha: hoy(), ancho: ANCHO, movil: MOVIL, contrato: "FIDELIDAD (1440/390)", sabotajes: { SIN_HOJAS, MISMO_LADO, DELTA } }, paginas: {} };
const pares = [];
let hojasCero = [];

for (const pg of PILOTO) {
  const f = join(CORPUS, pg.fichero);
  if (!existsSync(f)) { ev.fallo(pg.ruta, "captura ausente"); continue; }

  /* (a) ORIGINAL — captura por file:// con sus hojas y la red cortada */
  const { html, enlazadas, resueltas, sinResolver } = conHojasLocales(readFileSync(f, "utf8"), SIN_HOJAS);
  const off = await browser.newPage();
  await off.setRequestInterception(true);
  let bloqueadas = 0;
  off.on("request", (q) => { if (q.url().startsWith("file:") || q.url().startsWith("data:")) return void q.continue(); bloqueadas++; q.abort().catch(() => {}); });
  await preparaViewport(off);
  /* `setContent` con `baseURL` no existe en puppeteer: se navega al fichero y
   * se sustituye el documento. El `file://` de partida es el que hace que las
   * rutas locales de las hojas resuelvan. */
  await off.goto(pathToFileURL(f).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await off.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 800));
  const orig = (await censo.medir(off, medir)).datos;
  await off.close();

  /**
   * ⚠⚠ **LA GUARDA VA SOBRE `resueltas`, NO SOBRE `document.styleSheets`, y
   * la primera versión la puso mal — lo destapó su propio sabotaje.**
   *
   * `styleSheets` cuenta también los `<style>` EN LÍNEA, y estas páginas traen
   * **8**. Así que con las 7 hojas externas fuera, `hojasAplicadas` valía 8 y
   * la guarda `!hojasAplicadas` **no podía dispararse nunca**: §sondas 4 —una
   * guarda que no casa con nada— cometida dentro de la guarda misma.
   *
   * Lo que discrimina es **enlazadas vs resueltas**, las dos derivadas del
   * documento. Y el número que justifica la guarda es lo que el sabotaje midió:
   * sin las externas, `docH` de `/es/empresa/` pasa de **6623.91 a 13361.03**
   * —más del doble— sin un solo error. Ésa es la medida «plausible y falsa».
   */
  if (enlazadas && !resueltas) hojasCero.push(pg.ruta);

  /* (b) CLON */
  let clon = null, httpClon = 0;
  if (MISMO_LADO) {
    /* CONTROL `mismo-lado`: se copia el original al lado del clon. Exige 0
     * distintos — si saliera algo, el comparador INVENTA diferencias. */
    clon = JSON.parse(JSON.stringify(orig));
    httpClon = 200;
  } else {
    const cp = await browser.newPage();
    await preparaViewport(cp);
    try {
      const url = baseClon + (pg.ruta.replace(/^\/es/, "").replace(/\/$/, "") || "/");
      const resp = await cp.goto(url, { waitUntil: "networkidle0", timeout: 120_000 });
      httpClon = resp ? resp.status() : 0;
      if (httpClon < 400 && httpClon !== 0) clon = (await censo.medir(cp, medir)).datos;
    } catch { httpClon = -1; }
    await cp.close();
  }

  /* SABOTAJE `inyecta-delta`: un Δ CONOCIDO. La sonda tiene que cazarlo **y
   * nombrarlo** — §regla 21: sin defecto, la pregunta del negativo deja de ser
   * «¿sabe callar?» y pasa a ser «¿sabe gritar?». */
  if (DELTA && clon) clon.docH = +(clon.docH + DELTA).toFixed(2);

  salida.paginas[pg.ruta] = {
    regimen: pg.reg, httpClon,
    hojas: { enlazadas, resueltas, sinResolver: sinResolver.length, aplicadas: orig.hojasAplicadas, peticionesBloqueadas: bloqueadas },
    original: orig, clon,
  };

  /**
   * ⚠⚠ **CRUCE OBLIGATORIO CON OTRO INSTRUMENTO, y no es ceremonia.**
   *
   * `piloto-f33` cuenta las secciones propias **parseando el HTML**; esto las
   * cuenta **sobre el DOM renderizado**. Son dos instrumentos distintos sobre
   * el mismo objeto, así que **tienen que dar lo mismo** — y cuando no lo dan,
   * lo que falla es el selector, no la página.
   *
   * Es lo que destapó que este comparador contaba la cabecera y el pie del
   * theme-builder: el DOM daba `sec 8` en `/es/recursos/` donde el parser da
   * **4**. Sin este cruce, el clon habría salido «distinto» en las 6 y el
   * veredicto habría sido del INSTRUMENTO (§sondas 4 · *antes de creerse un
   * pleno, reconstruye un caso contra una medida buena anterior*).
   *
   * ⚠ Y su límite, declarado: los dos leen **la misma captura**, así que este
   * cruce prueba *«los dos cuentan lo mismo»*, **no** *«el recuento es
   * correcto»* (§regla 15).
   */
  if (orig.nSecciones !== pg.nSec) {
    ev.fallo(pg.ruta, `CRUCE ROTO: el DOM cuenta ${orig.nSecciones} secciones propias y el parser de \`piloto-f33\` cuenta ${pg.nSec}. Es el selector, no la página.`);
    console.log(`  ⛔ ${pg.ruta}: DOM ${orig.nSecciones} ≠ parser ${pg.nSec} secciones propias`);
    continue;
  }

  if (!clon) { ev.fallo(pg.ruta, `el clon no sirve la ruta (HTTP ${httpClon})`); continue; }
  ev.ok(1);

  for (const k of ["docH", "base", "nSecciones", "nFilas", "nModulos", "enlaces"])
    pares.push({ ruta: pg.ruta, eje: k, o: orig[k], c: clon[k] });
  for (const k of Object.keys(orig.anchos))
    pares.push({ ruta: pg.ruta, eje: `ancho.${k}`, o: orig.anchos[k], c: clon.anchos?.[k] ?? null });
  for (const k of Object.keys(orig.cajas))
    for (const d of ["y", "h", "w"])
      pares.push({ ruta: pg.ruta, eje: `caja.${k}.${d}`, o: orig.cajas[k][d], c: clon.cajas?.[k]?.[d] ?? null });
}

await browser.close();

/* ── 5 · el informe ───────────────────────────────────────────────────────── */
const numericos = pares.filter((p) => typeof p.o === "number" && typeof p.c === "number");
const mixtos = pares.filter((p) => !(typeof p.o === "number" && typeof p.c === "number"));
const distintos = numericos.filter((p) => Math.abs(p.o - p.c) >= 0.01);

console.log(`═══ 0 · LOS DOS LADOS · ancho ${ANCHO}${MOVIL ? " (MÓVIL emulado: isMobile+hasTouch+UA, los DOS lados)" : ""} · contrato FIDELIDAD`);
console.log(`  ORIGINAL: captura de corpus/fase-3 por file:// CON SUS HOJAS (corpus/css), red cortada`);
console.log(`  CLON:     ${baseClon || "(no se levanta: control mismo-lado)"}`);
if (SIN_HOJAS || MISMO_LADO || DELTA) console.log(`  ⚠ SABOTAJES ACTIVOS: ${JSON.stringify(salida.meta.sabotajes)}`);

console.log(`\n═══ 1 · CONTROL DE HOJAS — sin ellas la medida es plausible y FALSA`);
for (const [r, v] of Object.entries(salida.paginas))
  console.log(`  ${r.padEnd(50)} enlazadas ${String(v.hojas.enlazadas).padStart(2)} · RESUELTAS ${String(v.hojas.resueltas).padStart(2)} · sin resolver ${String(v.hojas.sinResolver).padStart(2)} · styleSheets ${String(v.hojas.aplicadas).padStart(3)} (incluye <style> en línea) · bloqueadas ${v.hojas.peticionesBloqueadas}`);
if (hojasCero.length) {
  console.log(`\n⛔ ${hojasCero.length} página(s) con CERO hojas aplicadas: ${hojasCero.join(" · ")}`);
  console.log(`   La corrida NO vale: es la medida sin estilo, que da números plausibles y falsos.`);
  console.log(`   Medido con el sabotaje: sin las externas, docH de /es/empresa/ pasa de 6623.91 a 13361.03.`);
}

console.log(`\n═══ 2 · LOS PARES`);
console.log(`  numéricos ${numericos.length} · MIXTOS ${mixtos.length} · distintos ${distintos.length}`);

/* ⚠ EL EJE MIXTO, ANTES DEL TITULAR. */
console.log(`\n═══ 3 · EJE MIXTO — publicado con su reparto, y mirado ANTES del titular`);
console.log(`  Son pares donde un lado no es número: el ancla no se renderiza en uno de los dos.`);
console.log(`  §*el eje que no lee como defecto esconde la mejora igual que esconde la deriva*.`);
const soloOrig = mixtos.filter((p) => typeof p.o === "number" && typeof p.c !== "number");
const soloClon = mixtos.filter((p) => typeof p.o !== "number" && typeof p.c === "number");
const ninguno = mixtos.filter((p) => typeof p.o !== "number" && typeof p.c !== "number");
console.log(`  sólo en el ORIGINAL (el clon no lo emite): ${soloOrig.length}`);
console.log(`  sólo en el CLON (sobra):                   ${soloClon.length}`);
console.log(`  en ninguno de los dos:                     ${ninguno.length}`);
for (const p of soloOrig.slice(0, 12)) console.log(`     · ${p.ruta} ${p.eje}  orig ${p.o} → clon —`);
if (soloOrig.length > 12) console.log(`     … y ${soloOrig.length - 12} más`);

console.log(`\n═══ 4 · POR PÁGINA — Δ = clon − original`);
for (const [r, v] of Object.entries(salida.paginas)) {
  if (!v.clon) { console.log(`  ❌ ${r}  ·  el clon no sirve la ruta (HTTP ${v.httpClon})`); continue; }
  const d = (k) => (typeof v.original[k] === "number" && typeof v.clon[k] === "number" ? (v.clon[k] - v.original[k]).toFixed(2) : "—");
  console.log(`  ${r}  [${v.regimen}]`);
  console.log(`     docH ${String(v.original.docH).padStart(9)} → ${String(v.clon.docH).padStart(9)}  Δ${d("docH")}`);
  console.log(`     base ${String(v.original.base).padStart(9)} → ${String(v.clon.base).padStart(9)}  Δ${d("base")}   ← EN CRUDO, sin corregir`);
  console.log(`     sec ${v.original.nSecciones}→${v.clon.nSecciones} · filas ${v.original.nFilas}→${v.clon.nFilas} · mód ${v.original.nModulos}→${v.clon.nModulos} · enlaces ${v.original.enlaces}→${v.clon.enlaces}`);
}

console.log(`\n═══ 5 · LO QUE ESTE COMPARADOR **NO** CONTESTA`);
console.log(`  · sólo mide ${ANCHO}. El contrato de FIDELIDAD es a 1440 y 390: hay que correr LOS DOS`);
console.log(`  · NO mide ningún ancho intermedio — allí el contrato es de RANGO, y es otra pregunta`);
console.log(`  · el lado «original» es la CAPTURA, no el sitio vivo. Lo que mide es fidelidad`);
console.log(`    del clon a la captura; que la captura reproduzca al vivo lo dice otra sonda`);
console.log(`  · ${PILOTO.length} páginas de 31: un verde aquí NO es un verde del arquetipo`);

/* El nombre del negativo NO lo pone la sonda: lo pone `w()` desde `NEG`.
 * Ponerlo aquí produciría `…-neg-mismo-lado-neg-delta`, que ningún negativo
 * sabe buscar — y el caso saldría «no congeló» en vez de por su motivo.
 *
 * ⚠⚠ **PERO UNA CORRIDA SABOTEADA A MANO NO PUEDE LLEVARSE EL NOMBRE
 * CANÓNICO, y esta sonda ya se lo llevó una vez (93.ª).** Lanzada como
 * `NEG_MISMO_LADO=1 node f33-cmp.mjs` —sin `NEG=`— `w()` no desvía nada y
 * congeló `medidas/f33-cmp-1440.json` con el lado del clon COPIADO del
 * original y un `httpClon: 200` fabricado. Un fichero con **nombre de medida y
 * contenido de control**: quien lo abriera leería «248 pares · 0 distintos ·
 * clon 200» y concluiría que el clon es perfecto (§regla 7, el precedente de
 * `dos-rutas-1440.json`).
 *
 * Se arregla **la clase, no la instancia**: si hay sabotaje y no hay `NEG`, la
 * salida se desvía igual y se dice en voz alta. Así el nombre canónico sólo
 * puede escribirlo una corrida de verdad — y hasta que exista, quien lo lea
 * **falla en voz alta** en vez de leer un control (§el defecto en la dirección
 * que grita). */
const SABOTEADA = SIN_HOJAS || MISMO_LADO || DELTA;
if (SABOTEADA && !process.env.NEG) {
  console.log(`\n⚠ CORRIDA SABOTEADA SIN \`NEG=\`: la salida NO puede llevarse el nombre canónico.`);
  console.log(`  Se desvía a \`f33-cmp-${ANCHO}-neg-a-mano.json\`. Para un negativo con nombre propio, usa \`npm run qa:f33-cmp-neg\`.`);
}
w(`medidas/f33-cmp-${ANCHO}${SABOTEADA && !process.env.NEG ? "-neg-a-mano" : ""}.json`, salida);

console.log(`\n═══ 6 · VEREDICTO`);
console.log(`  ✓ evaluadas ${ev.n}/${PILOTO.length} páginas del piloto · pares ${pares.length} · distintos ${distintos.length}`);
if (hojasCero.length) process.exit(2);
if (distintos.length) {
  console.log(`\n  ${distintos.length} pares con Δ ≠ 0. Los 20 mayores:`);
  for (const p of [...distintos].sort((a, b) => Math.abs(b.c - b.o) - Math.abs(a.c - a.o)).slice(0, 20))
    console.log(`     ${p.ruta.padEnd(46)} ${p.eje.padEnd(18)} orig ${String(p.o).padStart(9)} → clon ${String(p.c).padStart(9)}  Δ${(p.c - p.o).toFixed(2)}`);
  process.exit(3);
}
