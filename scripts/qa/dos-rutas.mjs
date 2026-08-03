/**
 * DOS RUTAS DEL CLON, CARA A CARA — árbol del cuerpo + `docH` + anclas de texto.
 * Uso: node dos-rutas.mjs <rutaA> <rutaB> [ancho] [etiqueta]
 *
 *   MARCADOR="…" MARCADOR_RUTA=/x node dos-rutas.mjs /sectores/a /sectores/b 1440
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * `clon-base.mjs` compara **la misma ruta** antes y después de un cambio. Ésta
 * compara **dos rutas distintas del mismo build**, que es lo que hace falta
 * cuando se quiere saber si dos modelos de contenido producen la misma página.
 *
 * Se escribió para `EXPERIMENTO-URBANO.md` (2026-07-30), que pregunta si el
 * content type de MONOGRÁFICO expresa el cuerpo de SECTOR sin campos nuevos, y
 * mide para ello el cuerpo de Urbano contra su reexpresión.
 *
 * ── Umbral CERO, y no es un capricho ───────────────────────────────────────
 * Es clon contra clon en la MISMA corrida y el mismo build: no hay ruido del
 * sitio vivo que justifique tolerancia. Un Δ de 8.6 es tan real como uno de 100.
 *
 * ── Qué mide, y por composición ────────────────────────────────────────────
 * `CLAUDE.md` §El principio: el total solo dice si cuadra; la composición dice
 * qué. Por eso de cada sección y de cada fila del cuerpo salen `mt`/`pt`/`pb` y
 * el alto **por separado**, y no solo el `docH`. Un Δ de cero en el total puede
 * ser dos errores que se anulan.
 *
 * El corte arranca **después del hero** (la única sección con `pb-[20px]`), con
 * la misma heurística que `tree-cmp.mjs` en su lado del clon.
 *
 * ⚠ **Y llega hasta el final de `main`, no hasta el slider.** El cierre de
 * `tree-cmp.mjs` es "la ÚLTIMA sección con `.swiper`", y en el clon eso **no
 * localiza el slider**: `CtaBannerSlider` es un fundido escrito a mano
 * (`aria-roledescription="carrusel"`), sin Swiper. Los únicos `.swiper` de la
 * página los pone `TrustBar`, que va ANTES del hero, así que el índice sale por
 * detrás del corte y la rebanada se va al final. Resultado: la última entrada
 * del árbol es **la sección del slider**, no una fila del cuerpo.
 *
 * Se deja así a propósito y anotado, en vez de "arreglarlo" a ciegas: mide una
 * sección más del cascarón, que en esta comparación **es información** (si el
 * slider no sale Δ0, lo que cambió no era el cuerpo). Quien reutilice la sonda
 * tiene que saber que esa fila de la salida es el slider.
 */
import { env, envRuta, Evaluadas, launch, openPage, ruta, settle, w } from "./lib.mjs";

const BASE = process.env.CLON || "http://localhost:3000";
// `ruta()` deshace la traducción de MSYS (`/sectores/x` →
// `C:/Program Files/Git/sectores/x`) y acepta la ruta con o sin barra inicial.
const [rutaA, rutaB] = process.argv.slice(2, 4).map(ruta);
const width = Number(process.argv[4] || 1440);
const etiqueta = process.argv[5] ? `-${process.argv[5]}` : "";
const mobile = width <= 500;

if (!rutaA || !rutaB) {
  console.error("Uso: node dos-rutas.mjs <rutaA> <rutaB> [ancho] [etiqueta]");
  process.exit(2);
}

/* ── marcador discriminante del build servido (corolario 2 de CLAUDE.md) ─── */

const marcador = process.env.MARCADOR || null;
if (marcador) {
  // Por `envRuta()`: MARCADOR_RUTA es la variable que MSYS corrompía, y la
  // normalización va en la lectura para que no haya que acordarse de ella.
  const rutaMarcador = envRuta("MARCADOR_RUTA", rutaB);
  const res = await fetch(BASE + rutaMarcador);
  const html = res.ok ? await res.text() : "";
  if (!html.includes(marcador)) {
    console.error(
      `\n❌ MARCADOR no encontrado en ${BASE + rutaMarcador} (HTTP ${res.status}).\n` +
        `   El servidor NO sirve el build que crees. Mátalo POR PUERTO, rehaz\n` +
        `   \`npm run build\`, relánzalo y repite. No se mide nada.\n`,
    );
    process.exit(2);
  }
  console.log(`✓ marcador presente en ${rutaMarcador} — el build servido es el nuevo`);
} else {
  console.log("⚠ sin MARCADOR: no se ha discriminado el build servido");
}

/* ─────────────────────────────── medida ────────────────────────────────── */

const extraer = function () {
  const r = (n) => Math.round(n * 100) / 100;
  const t = (el, n = 44) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const geo = (el) => {
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      top: r(b.top + scrollY),
      h: r(b.height),
      mt: s.marginTop,
      pt: s.paddingTop,
      pb: s.paddingBottom,
    };
  };

  const todas = [...document.querySelectorAll("main > section")];
  const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
  let iSlider = -1;
  todas.forEach((s, i) => {
    if (s.querySelector(".swiper")) iSlider = i;
  });
  const secs = todas.slice(iHero + 1, iSlider > iHero ? iSlider : undefined);

  const cuerpo = secs.map((sec) => ({
    ...geo(sec),
    txt: t(sec, 34),
    filas: [...sec.querySelectorAll(":scope > div")].map((f) => ({ ...geo(f), txt: t(f) })),
  }));

  /* colas comunes de la plantilla: acumulan TODO el desfase del cuerpo */
  const porTexto = (sel, txt) =>
    [...document.querySelectorAll(sel)].find((e) =>
      (e.textContent || "").replace(/\s+/g, " ").trim().includes(txt),
    );
  const y = (el) => (el ? r(el.getBoundingClientRect().top + scrollY) : null);

  return {
    docH: r(document.documentElement.scrollHeight),
    // La base de lectura del protocolo (README §2). Aquí es el cascarón: si el
    // `h1` no cuadra, lo que cambió NO es el cuerpo y la corrida no vale.
    h1y: y(document.querySelector("h1")),
    heroFin: iHero >= 0 ? r(todas[iHero].getBoundingClientRect().bottom + scrollY) : null,
    cuerpo,
    anclas: {
      slider: y(document.querySelector("[aria-roledescription='carrusel']")),
      soluciones: y(porTexto("h2", "Nuestras soluciones")),
      proyectos: y(porTexto("h2", "Últimos proyectos")),
      articulos: y(porTexto("h2", "Artículos y Guías")),
      footer: y(document.querySelector("footer")),
    },
  };
};

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
/**
 * ⚠ **El mínimo era `1`, y el invariante de esta sonda es que compara DOS.**
 * Con `1`, medir una ruta y fallar la otra salía **verde**: el nombre de la
 * sonda es `dos-rutas` y su veredicto entero —secciones, filas, columnas— es un
 * `A` contra `B`. Una sola no es media comparación, es **ninguna**.
 */
const ev = new Evaluadas({ nombre: "dos-rutas", unidad: "páginas (las 2 rutas que compara)", minimo: 2, porPaginas: true });

const { browser } = await launch();
// el parámetro NO se llama `ruta`: taparía el import del mismo nombre
async function medir(destino) {
  const { page } = await openPage(browser, BASE + destino, {
    width,
    height: mobile ? 844 : 900,
    mobile,
  });
  await settle(page);
  const out = await page.evaluate(extraer);
  await page.close();
  return out;
}

const a = await medir(rutaA);
const b = await medir(rutaB);
await browser.close();

/* ─────────────────────────────── informe ───────────────────────────────── */

const d = (x, y) => +(y - x).toFixed(2);
const sig = (n) => (n > 0 ? `+${n}` : String(n));
let fallos = 0;

console.log(`\n════════ ${rutaA}  vs  ${rutaB}   @${width} ════════`);

/* cascarón: si esto no cuadra, la comparación del cuerpo no significa nada */
const dH1 = d(a.h1y, b.h1y);
const dHero = d(a.heroFin, b.heroFin);
console.log(
  `\ncascarón   h1.y ${a.h1y} → ${b.h1y}  Δ${sig(dH1)}` +
    `   ·   fin del hero ${a.heroFin} → ${b.heroFin}  Δ${sig(dHero)}`,
);
if (dH1 !== 0 || dHero !== 0) {
  console.log(
    `  ⚠ el cascarón NO es el mismo: lo que se mida del cuerpo lleva este desfase dentro`,
  );
}

/* C2 — árbol sección → fila */
console.log(`\n── C2 · árbol sección→fila (umbral 0 en mt/pt/pb y en el alto) ──`);
if (a.cuerpo.length !== b.cuerpo.length) {
  console.log(`  ❌ nº de secciones ${a.cuerpo.length} → ${b.cuerpo.length}`);
  fallos++;
}
const nSec = Math.max(a.cuerpo.length, b.cuerpo.length);
for (let i = 0; i < nSec; i++) {
  const sa = a.cuerpo[i],
    sb = b.cuerpo[i];
  if (!sa || !sb) {
    console.log(`  SEC ${i}  ${!sa ? "SOBRA en B" : "FALTA en B"}  | ${(sa || sb).txt}`);
    fallos++;
    continue;
  }
  const dh = d(sa.h, sb.h);
  const ritmoA = `${sa.mt}/${sa.pt}/${sa.pb}`;
  const ritmoB = `${sb.mt}/${sb.pt}/${sb.pb}`;
  const malRitmo = ritmoA !== ritmoB;
  if (dh !== 0 || malRitmo) fallos++;
  console.log(
    `  SEC ${i}  h ${String(sa.h).padStart(8)} → ${String(sb.h).padStart(8)}  Δ${sig(dh).padStart(8)}` +
      `   ritmo ${ritmoA} → ${ritmoB} ${malRitmo ? "❌" : dh === 0 ? "✅" : "❌"}`,
  );
  const nF = Math.max(sa.filas.length, sb.filas.length);
  for (let j = 0; j < nF; j++) {
    const fa = sa.filas[j],
      fb = sb.filas[j];
    if (!fa || !fb) {
      console.log(
        `     fila ${j}  ${!fa ? "SOBRA en B" : "FALTA en B"}  | ${(fa || fb).txt}`,
      );
      fallos++;
      continue;
    }
    const dfh = d(fa.h, fb.h);
    const rA = `${fa.mt}/${fa.pt}/${fa.pb}`;
    const rB = `${fb.mt}/${fb.pt}/${fb.pb}`;
    const mal = rA !== rB;
    if (dfh !== 0 || mal) fallos++;
    console.log(
      `     fila ${j}  h ${String(fa.h).padStart(8)} → ${String(fb.h).padStart(8)}  Δ${sig(dfh).padStart(8)}` +
        `   ritmo ${rA} → ${rB} ${mal || dfh !== 0 ? "❌" : "✅"}  | ${fa.txt}`,
    );
  }
}

/* C3 — docH */
const dDoc = d(a.docH, b.docH);
console.log(`\n── C3 · docH (umbral 0) ──`);
console.log(`  docH ${a.docH} → ${b.docH}   Δ${sig(dDoc)}  ${dDoc === 0 ? "✅" : "❌"}`);
if (dDoc !== 0) fallos++;

/* anclas de la cola: acumulan el desfase del cuerpo */
console.log(`\n── anclas de la cola (acumulan el desfase del cuerpo) ──`);
for (const k of Object.keys(a.anclas)) {
  const dd = d(a.anclas[k] ?? 0, b.anclas[k] ?? 0);
  console.log(
    `  ${k.padEnd(12)} ${String(a.anclas[k]).padStart(9)} → ${String(b.anclas[k]).padStart(9)}   Δ${sig(dd)}  ${dd === 0 ? "✅" : "❌"}`,
  );
  if (dd !== 0) fallos++;
}

w(env("SALIDA") || `medidas/dos-rutas-${width}${etiqueta}.json`, {
  meta: { rutaA, rutaB, width, base: BASE },
  A: a,
  B: b,
});

console.log(
  `\n${fallos === 0 ? "✅ IDÉNTICAS" : `❌ ${fallos} discrepancia(s)`} · umbral CERO (clon contra clon)`,
);
process.exit(fallos === 0 ? 0 : 1);
