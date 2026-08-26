/**
 * DERIVACIÓN · ATRIBUCIÓN del residuo de la tabla de T1 (113.ª, ESCALÓN 4)
 *
 * El residuo NO se resta: se ATRIBUYE. Medido con `f33-cmp`:
 *
 *   módulo 5 · ORIGINAL w=880 h=1511   ·   CLON w=880 h=2311.78
 *
 * Mismo ANCHO, mismo `mt` (−18.56) y mismo `mb` (34.05): la caja del módulo y
 * su ritmo están transcritos exactos. Lo que difiere está DENTRO, y 1511/2311.78
 * = 0.6536 tiene la forma de una razón de interlínea, no de un padding.
 *
 * Esta derivación mide la TIPOGRAFÍA COMPUTADA de una celda en los dos lados,
 * porque §*al transcribir tipografía se mide también el BLOQUE que la contiene*:
 * el alto de una línea lo fija el strut del bloque, y la celda del original no
 * declara `font-size` ni `line-height` en ninguna regla `dvmd` — los HEREDA.
 *
 * Los DOS lados se abren igual (§regla 32): mismo viewport, mismo asentado,
 * y el original por `file://` con sus hojas locales, como hace `f33-cmp`.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Evaluadas, gritaSiRevienta, iniciarClon, launch, openPage, w } from "../../../../scripts/qa/lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const RUTA = "/politica-de-cookies";
const ANCHO = Number(process.argv[2] || 1440);
const CORPUS = join(RAIZ, "corpus/fase-3/sueltas/politica-de-cookies/index.html");

gritaSiRevienta();

/* ⚠ PRECONDICIÓN ANTES DE GASTAR NADA (§regla 37): la comprobación que no
 * depende de la medición va DELANTE del navegador, no 200 líneas después. */
if (!existsSync(CORPUS)) {
  console.error(`✗ falta la captura del original: ${CORPUS}\n  la produce la campaña de captura de corpus/fase-3.`);
  process.exit(2);
}

const ev = new Evaluadas({ nombre: "tabla-residuo-113", unidad: "lados", minimo: 2 });

const LEE = () => {
  const cel = document.querySelector(".dvmd_tm_tcell, .f33-tabla-celda");
  const dat = document.querySelector(".dvmd_tm_cdata, .f33-tabla-cdata");
  const rej = document.querySelector(".dvmd_tm_table, .f33-tabla-rejilla");
  const cs = (n) => (n ? getComputedStyle(n) : null);
  const r = (n) => (n ? n.getBoundingClientRect() : null);
  const c = cs(cel), d = cs(dat), g = cs(rej);
  const rc = r(cel), rg = r(rej);
  return {
    celda: c && { fontSize: c.fontSize, lineHeight: c.lineHeight, fontFamily: c.fontFamily.slice(0, 40), padding: c.padding, display: c.display },
    cdata: d && { fontSize: d.fontSize, lineHeight: d.lineHeight },
    /* P3 · el PAPEL recuperado por POSICIÓN. La celda [0] es col 0 (`rhead`) y
     * la [4] es col 4 (`rfoot`): si sus fondos casan, el papel perdido no
     * cuesta un píxel ni un color, que es exactamente lo que P3 predijo. */
    papelPorPosicion: (() => {
      const todas = document.querySelectorAll(".dvmd_tm_tcell, .f33-tabla-celda");
      const lee = (n) => (n ? { bg: getComputedStyle(n).backgroundColor, color: getComputedStyle(n).color } : null);
      return { col0: lee(todas[0]), col1: lee(todas[1]), col4: lee(todas[4]) };
    })(),
    rejilla: g && { display: g.display, cols: g.gridTemplateColumns, autoRows: g.gridAutoRows, gap: `${g.columnGap}/${g.rowGap}`, overflow: g.overflow },
    cajaCelda: rc && { w: +rc.width.toFixed(2), h: +rc.height.toFixed(2) },
    cajaRejilla: rg && { w: +rg.width.toFixed(2), h: +rg.height.toFixed(2) },
    nCeldas: document.querySelectorAll(".dvmd_tm_tcell, .f33-tabla-celda").length,
  };
};

const { browser } = await launch();
const { base: BASE, parar } = await iniciarClon();
const out = {};

/* ── LOS DOS LADOS SE ABREN IGUAL (§regla 32) ──────────────────────────────
 * Mismo `openPage`, mismo viewport, misma espera. La 105.ª pagó poner
 * `setRequestInterception` en un solo lado: 65 de 71 imágenes del original a
 * 16 px, y el artefacto valía el 200 % del Δ que se estaba midiendo. Aquí no
 * hay interceptación en NINGUNO — el original va por `file://` con sus hojas
 * ya locales, que es como lo abre `f33-cmp`. */
{
  const { page } = await openPage(browser, pathToFileURL(CORPUS).href, { width: ANCHO, height: 900, mobile: ANCHO <= 480 });
  out.original = await page.evaluate(LEE);
  await page.close();
  ev.ok(1);
}
{
  const { page } = await openPage(browser, `${BASE}${RUTA}`, { width: ANCHO, height: 900, mobile: ANCHO <= 480 });
  out.clon = await page.evaluate(LEE);
  await page.close();
  ev.ok(1);
}

await parar();
await browser.close();

const P = (...a) => console.log(...a);
P("══════════════════════════════════════════════════════════════════════");
P(`  ATRIBUCIÓN DEL RESIDUO DE LA TABLA — 113.ª · ESCALÓN 4 · @${ANCHO}`);
P("══════════════════════════════════════════════════════════════════════\n");
P(`  celdas encontradas   original ${out.original.nCeldas}  ·  clon ${out.clon.nCeldas}`);
P("");
for (const eje of ["celda", "cdata", "papelPorPosicion", "rejilla", "cajaCelda", "cajaRejilla"]) {
  P(`── ${eje} ──`);
  const o = out.original[eje] || {}, c = out.clon[eje] || {};
  for (const k of new Set([...Object.keys(o), ...Object.keys(c)])) {
    const a = JSON.stringify(o[k] ?? "—").replace(/"/g,""), b = JSON.stringify(c[k] ?? "—").replace(/"/g,"");
    P(`   ${k.padEnd(14)} orig ${a.padEnd(34)} clon ${b}${a !== b ? "   ← DIFIERE" : ""}`);
  }
  P("");
}

w(`medidas/tabla-residuo-113-${ANCHO}.json`, out);
