/**
 * GUARDA DEL CORTE DEL CUERPO — que la rebanada del clon acabe en el slider.
 * Uso: node corte-cuerpo.mjs            (con el clon servido; no toca el original)
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * `tree-cmp.mjs` y `mono-cmp.mjs` aíslan «el cuerpo» del clon rebanando sus
 * `main > section` entre el hero y el slider. **Ese corte estuvo roto una tanda
 * entera** (E1 en `docs/PENDIENTES-QA.md`): el cierre era «la última sección con
 * `.swiper`», y `CtaBannerSlider` no lleva Swiper —es un fundido escrito a mano
 * con `aria-roledescription="carrusel"`—, así que el único `.swiper` de la página
 * lo ponía `TrustBar`, **antes** del hero. El índice caía por detrás del corte,
 * la rebanada se iba al final de `main` y las dos sondas metían la sección del
 * slider en el cuerpo como si fuera una fila más.
 *
 * Se arregló en las dos. Y `CLAUDE.md` §El principio, corolario 1: **no se da
 * por cerrada una clase de fallo hasta que una sonda recorre la salida y sale
 * limpia.** Ésta es esa sonda.
 *
 * ── Qué comprueba, y por qué así ───────────────────────────────────────────
 * Para cada ruta que emite el build y cada ancho:
 *
 *   1. el hero se localiza (la única sección con `pb-[20px]`);
 *   2. el corte de cierre se localiza **después** del hero;
 *   3. la sección donde cae el corte **es** el slider — verificado por
 *      `[aria-roledescription="carrusel"]`, no por la clase que se buscaba;
 *   4. no queda **ninguna** sección del slider dentro de la rebanada.
 *
 * El 3 y el 4 son el punto: un corte que "encuentra algo" y un corte que
 * encuentra **el slider** dan la misma rebanada hasta el día que no.
 *
 * No necesita el original, así que es determinista y sirve de check: código 0
 * limpia, 1 sucia. Rutas del `prerender-manifest`, como `enlaces.mjs` — las
 * páginas nuevas entran solas.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { env, launch, openPage, settle, w } from "./lib.mjs";

const RAIZ = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const BASE = process.env.CLON || "http://localhost:3000";

const manifiesto = JSON.parse(
  readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"),
);
/**
 * Solo las páginas que tienen cuerpo-entre-hero-y-slider, que son las que las
 * dos sondas rebanan: las de `/sectores/`. El resto no monta ese esqueleto y
 * medirlo aquí solo daría ruido.
 */
const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => r.startsWith("/sectores/"))
  .sort();
if (RUTAS.length === 0) {
  console.error("No hay rutas /sectores/ en el manifiesto — ¿falta `npm run build`?");
  process.exit(2);
}

const extraer = function () {
  const t = (el, n = 34) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const esSlider = (s) => !!s.querySelector("[aria-roledescription='carrusel']");

  const todas = [...document.querySelectorAll("main > section")];
  const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));

  // el corte que usan las dos sondas, tal cual
  let iCorte = -1;
  for (let i = iHero + 1; i < todas.length; i++) {
    if (todas[i].querySelector("[aria-roledescription='carrusel'], .swiper")) {
      iCorte = i;
      break;
    }
  }
  const cuerpo = todas.slice(iHero + 1, iCorte > iHero ? iCorte : undefined);

  return {
    nSecciones: todas.length,
    iHero,
    iCorte,
    corteEsSlider: iCorte >= 0 ? esSlider(todas[iCorte]) : false,
    txtCorte: iCorte >= 0 ? t(todas[iCorte]) : null,
    nCuerpo: cuerpo.length,
    // cualquier sección del slider que se haya quedado DENTRO de la rebanada
    sliderDentro: cuerpo.filter(esSlider).map((s) => t(s)),
    cuerpoTxt: cuerpo.map((s) => t(s)),
  };
};

const { browser } = await launch();
const todo = {};
let fallos = 0;

for (const width of [1440, 390]) {
  const mobile = width <= 500;
  for (const ruta of RUTAS) {
    const { page } = await openPage(browser, BASE + ruta, {
      width,
      height: mobile ? 844 : 900,
      mobile,
    });
    await settle(page);
    const d = await page.evaluate(extraer);
    await page.close();
    todo[`${width} ${ruta}`] = d;

    const problemas = [];
    if (d.iHero < 0) problemas.push("no se localiza el HERO");
    if (d.iCorte <= d.iHero) problemas.push("el corte no cae después del hero");
    if (!d.corteEsSlider) problemas.push(`el corte NO es el slider (cae en "${d.txtCorte}")`);
    if (d.sliderDentro.length)
      problemas.push(`${d.sliderDentro.length} sección(es) de slider DENTRO del cuerpo`);
    if (d.nCuerpo === 0) problemas.push("el cuerpo sale VACÍO");
    if (problemas.length) fallos++;

    console.log(
      `${problemas.length ? "❌" : "✅"} @${width} ${ruta.replace("/sectores/", "").padEnd(48)}` +
        ` secciones ${String(d.nSecciones).padStart(2)}  hero ${String(d.iHero).padStart(2)}` +
        `  corte ${String(d.iCorte).padStart(2)}  cuerpo ${d.nCuerpo}`,
    );
    problemas.forEach((p) => console.log(`      ${p}`));
  }
}
await browser.close();

w(env("SALIDA") || "medidas/corte-cuerpo.json", {
  meta: { base: BASE, rutas: RUTAS.length, anchos: [1440, 390] },
  casos: todo,
});

console.log(
  `\n${fallos === 0 ? "✅" : `❌ ${fallos} caso(s) con el corte mal`} · ` +
    `${RUTAS.length} rutas × 2 anchos = ${RUTAS.length * 2} casos`,
);
process.exit(fallos === 0 ? 0 : 1);
