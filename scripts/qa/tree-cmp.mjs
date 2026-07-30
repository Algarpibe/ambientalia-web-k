/**
 * S7 (2/2) — árbol de secciones/filas del CUERPO, original vs clon, lado a lado.
 * Uso: node tree-cmp.mjs <urbano|industria|construccion|investigacion|edar|petroleo> [ancho]
 *
 * El cuerpo es lo que va **entre el hero y el slider de ancho completo**, en los
 * dos lados.
 *
 * ⚠ **El hero NO se localiza por su `padding-bottom`.** Se localizaba por
 * `pb === 60px`, y eso dejó de valer al entrar el arquetipo MONOGRÁFICO, cuyo
 * hero cierra a **39** en desktop (y a 20 en móvil, como todos). Ahora se
 * localiza por la sección del breadcrumb, que es estructural y vale para los
 * dos arquetipos: hero = la siguiente, cuerpo = de la de después al slider.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const URLS = {
  urbano: [
    "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/",
    "http://localhost:3000/sectores/calidad-del-aire-en-las-ciudades",
  ],
  industria: [
    "https://kunakair.com/es/sectores/control-de-emisiones-industriales/",
    "http://localhost:3000/sectores/control-de-emisiones-industriales",
  ],
  construccion: [
    "https://kunakair.com/es/sectores/contaminacion-por-construccion/",
    "http://localhost:3000/sectores/contaminacion-por-construccion",
  ],
  investigacion: [
    "https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/",
    "http://localhost:3000/sectores/estudio-de-la-contaminacion-atmosferica",
  ],
  // arquetipo MONOGRÁFICO TÉCNICO
  edar: [
    "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
    "http://localhost:3000/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
  ],
  petroleo: [
    "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    "http://localhost:3000/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
  ],
};

const cual = process.argv[2] || "industria";
const width = Number(process.argv[3] || 1440);
const mobile = width <= 500;
const [ORIG, CLON] = URLS[cual];
const { browser } = await launch();

// ojo: se serializa al navegador, así que el flag va por ARGUMENTO, no por
// closure (un `const` de fuera no viaja: ReferenceError en la página).
const extraer = function (esOriginal) {
    const r = (n) => Math.round(n * 100) / 100;
    const t = (el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
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

    let secs, filaSel;
    let avisoCorte = null;
    const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
    if (esOriginal) {
      const todas = [...document.querySelectorAll(".et_pb_section")];
      // el breadcrumb, no el `pb` del hero: sirve para los dos arquetipos
      const iMigas = todas.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
      const iSlider = todas.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
      // El mismo aviso que en el lado del clon, y por la misma razón: un `-1`
      // aquí rebana desde el principio o hasta el final y el árbol sale mal
      // **sin decirlo**.
      if (iMigas < 0) avisoCorte = "no se localizó el breadcrumb en el ORIGINAL";
      else if (iSlider < 0) avisoCorte = "no se localizó el slider en el ORIGINAL";
      secs = todas.slice(iMigas + 2, iSlider);
      filaSel = ":scope > .et_pb_row";
    } else {
      const todas = [...document.querySelectorAll("main > section")];
      // El hero es la única sección con `pb-[20px]`: la cabecera cierra a 40 y
      // el resto no lleva esa clase. Vale para los dos arquetipos, porque lo
      // que cambia entre ellos es el `pb` de DESKTOP (39 vs 60), no el móvil.
      const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
      // ── E1, corregido (2026-07-30) ─────────────────────────────────────────
      // El cierre era «la ÚLTIMA sección con `.swiper`», y eso **no encuentra
      // el slider**: `CtaBannerSlider` es un fundido escrito a mano
      // (`aria-roledescription="carrusel"`), sin Swiper. Los únicos `.swiper` de
      // la página los pone `TrustBar`, que va **antes** del hero. Medido en las
      // 6 rutas × 2 anchos: `iSwiper` 1 · `iHero` 2, así que `iSlider > iHero`
      // salía falso, la rebanada se iba al final de `main` y el árbol del clon
      // arrastraba **la sección del slider** como si fuera una fila del cuerpo.
      //
      // El corte correcto es la PRIMERA sección después del hero que contenga
      // el carrusel por su rol ARIA — el mismo ancla que ya usa
      // `cmp-sector.mjs`. Se deja `.swiper` en el selector para el día que
      // alguna sección de abajo vuelva a montar Swiper.
      let iSlider = -1;
      for (let i = iHero + 1; i < todas.length; i++) {
        if (todas[i].querySelector("[aria-roledescription='carrusel'], .swiper")) {
          iSlider = i;
          break;
        }
      }
      // Y si no lo encuentra, lo DICE. Rebanar hasta el final en silencio es
      // exactamente cómo E1 sobrevivió sin que nadie lo viera.
      if (iHero < 0) avisoCorte = "no se localizó el hero en el CLON";
      else if (iSlider <= iHero) avisoCorte = "no se localizó la sección del slider en el CLON";
      secs = todas.slice(iHero + 1, iSlider > iHero ? iSlider : undefined);
      filaSel = ":scope > div";
    }

    return {
      aviso: avisoCorte,
      secs: secs.map((sec) => ({
        ...geo(sec),
        filas: [...sec.querySelectorAll(filaSel)].map((f) => ({ ...geo(f), txt: t(f) })),
      })),
    };
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
const o = medidaO.secs;
const c = medidaC.secs;

/**
 * El corte, en voz alta. Un `-1` en cualquiera de los dos lados produce un árbol
 * plausible y equivocado, que es lo que pasó con E1 durante toda una tanda.
 */
let corteRoto = false;
for (const [lado, m] of [["ORIGINAL", medidaO], ["CLON", medidaC]]) {
  if (m.aviso) {
    console.error(`\n❌ CORTE ROTO en el ${lado}: ${m.aviso}`);
    console.error(`   El árbol de abajo NO es el cuerpo. No se juzga nada con esto.`);
    corteRoto = true;
  }
}

const pinta = (etiqueta, secs) => {
  console.log(`\n--- ${etiqueta} ---`);
  secs.forEach((s, i) => {
    console.log(
      `SEC ${i}  top ${String(s.top).padStart(8)}  h ${String(s.h).padStart(8)}  mt ${s.mt.padStart(7)}  pt ${s.pt.padStart(9)}  pb ${s.pb.padStart(7)}`,
    );
    s.filas.forEach((f, j) =>
      console.log(
        `   fila ${j}  top ${String(f.top).padStart(8)}  h ${String(f.h).padStart(8)}  pt ${f.pt.padStart(9)}  pb ${f.pb.padStart(9)} | ${f.txt}`,
      ),
    );
  });
};

console.log(`\n======== ${cual} @${width} ========`);
pinta("ORIGINAL", o);
pinta("CLON", c);

// diff plano de filas, en orden
const plano = (secs) => secs.flatMap((s) => s.filas);
const fo = plano(o),
  fc = plano(c);
console.log(`\n--- filas en orden (Δ top / Δ h) ---`);
/**
 * Filas que sobran o faltan. **Se cuentan**, no solo se imprimen: E1 vivió una
 * tanda entera como un `SOBRA en clon` suelto en la última línea, y una sonda
 * que imprime un descuadre sin contarlo da el mismo informe que una que no lo ve.
 */
let descuadres = 0;
for (let i = 0; i < Math.max(fo.length, fc.length); i++) {
  const a = fo[i],
    b = fc[i];
  if (!a || !b) {
    descuadres++;
    console.log(`fila ${i}  ${!a ? "SOBRA en clon" : "FALTA en clon"}  | ${(a || b).txt}`);
    continue;
  }
  const dt = Math.round((b.top - a.top) * 10) / 10;
  const dh = Math.round((b.h - a.h) * 10) / 10;
  console.log(
    `fila ${i}  top ${String(a.top).padStart(8)} → ${String(b.top).padStart(8)}  Δ${(dt >= 0 ? "+" : "") + dt}`.padEnd(52) +
      `h ${String(a.h).padStart(8)} → ${String(b.h).padStart(8)}  Δ${(dh >= 0 ? "+" : "") + dh}  | ${a.txt}`,
  );
}

console.log(
  `\n${descuadres === 0 && !corteRoto ? "✅" : "❌"} filas: ${fo.length} en el original · ` +
    `${fc.length} en el clon · **${descuadres} sin pareja**` +
    (corteRoto ? " · CORTE ROTO" : ""),
);

/**
 * Salida congelada. La sonda no la escribía, así que sus conclusiones —las que
 * cita el acta del monográfico— no tenían artefacto que auditar: la única copia
 * era la consola de quien la corrió. Ahora sí, y por eso E1 se pudo demostrar
 * con un diff en vez de con un argumento.
 */
w(process.env.SALIDA || `medidas/tree-cmp-${cual}-${width}.json`, {
  meta: { cual, width, orig: ORIG, clon: CLON },
  original: o,
  clon: c,
  avisos: { original: medidaO.aviso, clon: medidaC.aviso },
  resumen: { filasOriginal: fo.length, filasClon: fc.length, descuadres },
});

await browser.close();
process.exit(descuadres === 0 && !corteRoto ? 0 : 1);
