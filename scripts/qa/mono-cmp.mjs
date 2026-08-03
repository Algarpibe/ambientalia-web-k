/**
 * MONOGRÁFICO: original vs clon **módulo a módulo**, no fila a fila.
 * Uso: node mono-cmp.mjs <edar|petroleo> [ancho]   (con el clon servido)
 *
 * `tree-cmp.mjs` se para en la fila y dice *cuánto* falta; con ~60 módulos por
 * página eso no dice *dónde*. Y el total de una fila puede ser dos errores que
 * se anulan, que ya pasó una vez en este proyecto (el CTA de Industria: −47.5
 * de contenido tapados por +74 de ritmo).
 *
 * Compara, por columna y en orden: alto de cada módulo y su `margin-bottom`.
 * Así el informe separa **contenido** (el alto) de **ritmo** (el margen), que
 * son dos defectos distintos con dos arreglos distintos.
 */
import { env, Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const URLS = {
  edar: [
    "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
    "http://localhost:3000/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
  ],
  petroleo: [
    "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    "http://localhost:3000/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
  ],
};

const cual = process.argv[2] || "edar";
const width = Number(process.argv[3] || 1440);
const mobile = width <= 500;
const [ORIG, CLON] = URLS[cual];
/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
/**
 * ⚠ **El mínimo era `1` y esta sonda es un COMPARADOR: necesita los dos lados.**
 * `URLS[clave]` es siempre `[original, clon]`, así que el invariante es «he
 * abierto el original **y** el clon». Con `1`, una corrida que sacara el
 * original y se dejara el clon —o al revés— salía verde **habiendo comparado
 * nada**, que es la familia entera de «0 comparado = verde».
 *
 * Se **deriva**, no se escribe: si un día se compara más de un monográfico por
 * corrida, el listón sube solo.
 */
const ev = new Evaluadas({ nombre: "mono-cmp", unidad: "páginas (2 por monográfico: original y clon)", minimo: 2, porPaginas: true });

const { browser } = await launch();

const extraer = function (esOriginal) {
  const r = (n) => Math.round(n * 100) / 100;
  const t = (el, n = 30) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;

  let secs, filaSel, colSel, modSel;
  let avisoCorte = null;
  if (esOriginal) {
    const todas = [...document.querySelectorAll(".et_pb_section")];
    const iMigas = todas.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
    const iSlider = todas.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
    if (iMigas < 0) avisoCorte = "no se localizó el breadcrumb en el ORIGINAL";
    else if (iSlider < 0) avisoCorte = "no se localizó el slider en el ORIGINAL";
    secs = todas.slice(iMigas + 2, iSlider);
    filaSel = ":scope > .et_pb_row";
    colSel = ":scope > .et_pb_column";
    modSel = ":scope > .et_pb_module";
  } else {
    const todas = [...document.querySelectorAll("main > section")];
    const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
    // ── E1, corregido (2026-07-30) — misma causa y mismo arreglo que en
    // `tree-cmp.mjs`, que es el punto: el fallo estaba en DOS sondas y la nota
    // de E1 solo nombraba una. `CtaBannerSlider` es un fundido escrito a mano
    // (`aria-roledescription="carrusel"`), sin Swiper; los `.swiper` los pone
    // `TrustBar`, ANTES del hero. Así que «la última sección con `.swiper`»
    // daba un índice por detrás del corte, la rebanada se iba al final de
    // `main` y el clon aportaba **la sección del slider** como sección de más.
    let iSlider = -1;
    for (let i = iHero + 1; i < todas.length; i++) {
      if (todas[i].querySelector("[aria-roledescription='carrusel'], .swiper")) {
        iSlider = i;
        break;
      }
    }
    if (iHero < 0) avisoCorte = "no se localizó el hero en el CLON";
    else if (iSlider <= iHero) avisoCorte = "no se localizó la sección del slider en el CLON";
    secs = todas.slice(iHero + 1, iSlider > iHero ? iSlider : undefined);
    filaSel = ":scope > div";
    colSel = ":scope > div > div"; // fila → flex → columna
    modSel = ":scope > div";
  }

  return { aviso: avisoCorte, secs: secs.map((sec, i) => ({
    i,
    h: r(sec.getBoundingClientRect().height),
    filas: [...sec.querySelectorAll(filaSel)].map((f, j) => ({
      j,
      h: r(f.getBoundingClientRect().height),
      cols: [...f.querySelectorAll(colSel)].map((c, k) => ({
        k,
        h: r(c.getBoundingClientRect().height),
        // a 390 las columnas apilan y llevan hueco entre ellas: es dato, no
        // regla — hay columnas no-últimas con `margin-bottom: 0`
        mb: px(getComputedStyle(c).marginBottom),
        mods: [...c.querySelectorAll(modSel)]
          // el punteado no cuenta: va fuera del flujo en los dos lados
          .filter((m) => !m.querySelector('img[src*="punteado"]') || m.children.length > 1)
          .map((m) => ({
            h: r(m.getBoundingClientRect().height),
            mb: px(getComputedStyle(m).marginBottom),
            pb: px(getComputedStyle(m).paddingBottom),
            txt: t(m),
          })),
      })),
    })),
  })) };
};

async function medir(url, esOriginal) {
  const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
  await settle(page);
  const out = await page.evaluate(extraer, esOriginal);
  await page.close();
  return out;
}

const medidaO = await medir(ORIG, true);
const medidaC = await medir(CLON, false);
await browser.close();
const o = medidaO.secs;
const c = medidaC.secs;

/** El corte, en voz alta. Un `-1` da un árbol plausible y equivocado (E1). */
let corteRoto = false;
for (const [lado, m] of [["ORIGINAL", medidaO], ["CLON", medidaC]]) {
  if (m.aviso) {
    console.error(`\n❌ CORTE ROTO en el ${lado}: ${m.aviso}`);
    console.error(`   El árbol de abajo NO es el cuerpo. No se juzga nada con esto.`);
    corteRoto = true;
  }
}

const d = (a, b) => {
  const v = Math.round((b - a) * 100) / 100;
  return v === 0 ? "   ·  " : (v > 0 ? "+" : "") + v;
};

console.log(`\n════════ ${cual} @${width} · original → clon ════════`);
let malContenido = 0;
let malRitmo = 0;
/**
 * Secciones, filas y columnas que no cuadran.
 *
 * ⚠ Hace falta contarlas **aparte de los módulos**: la primera versión de esta
 * sonda solo contaba módulos y sacó un "✅ 0 módulos distintos" con la sección 0
 * de EDAR a −48. El desfase estaba en el `margin-bottom` de la `<table>`, que no
 * es de ningún módulo. Una sonda que no mira un nivel del árbol da el mismo
 * "limpio" que una que no encuentra nada.
 */
let malEstructura = 0;
/**
 * Nodos sin pareja, a cualquier nivel. **Contarlos era el agujero que dejó vivir
 * a E1 una tanda entera**: con el corte roto, el clon aportaba una sección de
 * más, la sonda escribía `SEC 3 SOBRA en clon`… y acto seguido
 * `✅ 0 · 0 · 0` **con código 0**, porque ningún `continue` incrementaba nada.
 *
 * Es el mismo fallo que ya avisa la cabecera de `malEstructura` —una sonda que
 * no mira un nivel del árbol da el mismo "limpio" que una que no encuentra
 * nada—, una vuelta más arriba: aquí sí lo miraba, lo imprimía, y no lo contaba.
 */
let sinPareja = 0;
/** Columnas con el alto distinto — ver E3. Se informa; no cierra el código. */
let malColumna = 0;

for (let i = 0; i < Math.max(o.length, c.length); i++) {
  const so = o[i];
  const sc = c[i];
  if (!so || !sc) {
    sinPareja++;
    console.log(`SEC ${i}  ${so ? "FALTA en clon" : "SOBRA en clon"}`);
    continue;
  }
  if (so.h !== sc.h) malEstructura++;
  console.log(`\nSEC ${i}   h ${so.h} → ${sc.h}   Δ${d(so.h, sc.h)}`);
  for (let j = 0; j < Math.max(so.filas.length, sc.filas.length); j++) {
    const fo = so.filas[j];
    const fc = sc.filas[j];
    if (!fo || !fc) {
      sinPareja++;
      console.log(`  F${j}  ${fo ? "FALTA en clon" : "SOBRA en clon"}`);
      continue;
    }
    if (fo.h !== fc.h) malEstructura++;
    console.log(`  F${j}  h ${fo.h} → ${fc.h}   Δ${d(fo.h, fc.h)}`);
    for (let k = 0; k < Math.max(fo.cols.length, fc.cols.length); k++) {
      const co = fo.cols[k];
      const cc = fc.cols[k];
      if (!co || !cc) {
        sinPareja++;
        console.log(`    C${k}  ${co ? "FALTA en clon" : "SOBRA en clon"}`);
        continue;
      }
      const dif = co.h !== cc.h;
      // el hueco entre columnas apiladas a 390 no es de ningún módulo
      if (co.mb !== cc.mb) malEstructura++;
      // El ALTO de la columna se imprimía y no se contaba (ver E3 en
      // PENDIENTES-QA). Se cuenta aparte y **no cierra el código de salida**,
      // porque las instancias medidas son columnas del clon que ESTIRAN por ser
      // hijas de un flex (Divi las deja a la altura del contenido) y eso es
      // geométricamente inerte: los módulos de dentro cuadran y la fila también.
      // Contarlo aparte y decirlo es lo contrario de lo que hacía antes, que era
      // imprimirlo y callarse.
      if (dif) malColumna++;
      console.log(
        `    C${k}  h ${co.h} → ${cc.h}   Δ${d(co.h, cc.h)}` +
          (co.mb !== cc.mb ? `   ❌ mb ${co.mb} → ${cc.mb}` : "") +
          (dif ? "" : "  ok"),
      );
      if (!dif) continue;
      for (let l = 0; l < Math.max(co.mods.length, cc.mods.length); l++) {
        const mo = co.mods[l];
        const mc = cc.mods[l];
        if (!mo || !mc) {
          sinPareja++;
          console.log(`      M${l}  ${mo ? "FALTA en clon" : "SOBRA en clon"}  "${(mo || mc).txt}"`);
          continue;
        }
        const dh = Math.round((mc.h - mo.h) * 100) / 100;
        const dm = Math.round((mc.mb - mo.mb) * 100) / 100;
        if (dh) malContenido++;
        if (dm) malRitmo++;
        console.log(
          `      M${l}  alto ${String(mo.h).padStart(8)} → ${String(mc.h).padStart(8)} Δ${d(mo.h, mc.h).padEnd(8)}` +
            ` mb ${String(mo.mb).padStart(8)} → ${String(mc.mb).padStart(8)} Δ${d(mo.mb, mc.mb).padEnd(8)}  "${mo.txt}"`,
        );
      }
    }
  }
}

const total = malContenido + malRitmo + malEstructura + sinPareja + (corteRoto ? 1 : 0);
console.log(
  `\n${total === 0 ? "✅" : "❌"} módulos con el ALTO distinto: ${malContenido}` +
    `  ·  con el MARGEN distinto: ${malRitmo}` +
    `  ·  secciones/filas/columnas que no cuadran: ${malEstructura}` +
    `  ·  nodos SIN PAREJA: ${sinPareja}` +
    (corteRoto ? `  ·  CORTE ROTO` : ""),
);
console.log("   (el alto es contenido; el margen es ritmo — son dos defectos distintos,");
console.log("    y lo que no cae en ningún módulo se cuenta como estructura)");
console.log(
  `   secciones: ${o.length} original · ${c.length} clon` +
    `   ·   columnas con el ALTO distinto: ${malColumna} (informativo, ver E3: el clon` +
    ` estira las columnas por ser hijas de un flex; no cierra el código de salida)`,
);

/**
 * Salida congelada — la sonda no la escribía. Sus números están citados en el
 * acta del monográfico y en `HANDOFF.md`, y la única copia era la consola de
 * quien la corrió: por eso E1 hubo que demostrarlo re-midiendo en vez de
 * diffeando. Ahora queda artefacto.
 */
w(env("SALIDA") || `medidas/mono-cmp-${cual}-${width}.json`, {
  meta: { cual, width, orig: ORIG, clon: CLON },
  original: o,
  clon: c,
  avisos: { original: medidaO.aviso, clon: medidaC.aviso },
  resumen: {
    malContenido,
    malRitmo,
    malEstructura,
    sinPareja,
    malColumna,
    secciones: { original: o.length, clon: c.length },
  },
});

process.exit(total === 0 ? 0 : 1);
