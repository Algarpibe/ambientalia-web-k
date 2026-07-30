/**
 * EXPERIMENTO URBANO — la composición de los tres Δ, módulo a módulo.
 * Uso: node exp-detalle.mjs [ancho]
 *
 * ── Por qué hace falta además de `dos-rutas.mjs` ──────────────────────────
 * `CLAUDE.md` §El principio: **el total solo dice si cuadra; la composición
 * dice qué.** Y aquí el total mintió en un sitio concreto: a 1440 la fila del
 * claim salió **Δ0**, y a 390 la misma fila sale **+10**. Un Δ0 que no se
 * reproduce entre anchos no es "cuadra": es un defecto que la columna hermana
 * —la foto, 390.08 de alto— tapa mientras las dos van en fila.
 *
 * Peor: **la alineación vertical no la ve NINGUNA medida de alto de fila.**
 * Centrado o pegado arriba, la fila mide lo mismo. Se ve solo mirando dónde
 * cae el claim DENTRO de su fila. Eso es lo que mide esta sonda.
 *
 * Es andamio del experimento, no una guarda: se conserva porque el acta cita
 * sus números y el experimento se repite si C2/C3 fallan con C1 cumplido (§6).
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const BASE = process.env.CLON || "http://localhost:3000";
const A = "/sectores/calidad-del-aire-en-las-ciudades";
const B = "/sectores/urbano-mono";
const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;

const extraer = function () {
  const r = (n) => Math.round(n * 100) / 100;
  const caja = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      y: r(b.top + scrollY),
      h: r(b.height),
      w: r(b.width),
      pb: s.paddingBottom,
      pr: s.paddingRight,
      mb: s.marginBottom,
      ls: s.letterSpacing,
      fs: s.fontSize,
      lh: s.lineHeight,
    };
  };
  const porTexto = (sel, txt) =>
    [...document.querySelectorAll(sel)].find((e) =>
      (e.textContent || "").replace(/\s+/g, " ").trim().includes(txt),
    );

  /* el claim: puede ser `p` (SECTOR) o `h2` (reexpresión con el modelo mono) */
  const claim =
    porTexto("p", "Protege la salud de tus ciudadanos tomando") ||
    porTexto("h2", "Protege la salud de tus ciudadanos tomando") ||
    porTexto("h3", "Protege la salud de tus ciudadanos tomando");
  /* su fila Divi y su columna: se sube hasta la fila de la retícula (86%) */
  let colClaim = null,
    filaClaim = null;
  if (claim) {
    let n = claim;
    while (n && n !== document.body) {
      const cn = typeof n.className === "string" ? n.className : "";
      if (!colClaim && /w-\[47\.25%\]|md:w-\[47\.25%\]/.test(cn)) colClaim = n;
      if (/max-w-\[1380px\]/.test(cn)) {
        filaClaim = n;
        break;
      }
      n = n.parentElement;
    }
  }
  const foto = porTexto("p,h2,h3", "") && null; // placeholder, se resuelve abajo
  const imgClaim = document.querySelector(
    'img[src*="control-de-la-calidad-del-aire-en-ciudades"]',
  );

  /* el CTA de descarga */
  const ctaTitulo = porTexto("p,h2,h3,h4", "¿Necesitas medir la contaminación");
  let cajaCta = null;
  if (ctaTitulo) {
    let n = ctaTitulo;
    while (n && n !== document.body) {
      const cn = typeof n.className === "string" ? n.className : "";
      if (/calls|cta-descarga|bg-\[|rounded/.test(cn) && n.getBoundingClientRect().height > 150) {
        cajaCta = n;
        break;
      }
      n = n.parentElement;
    }
  }

  return {
    cta: {
      titulo: caja(ctaTitulo),
      caja: caja(cajaCta),
      // la foto de la piel `"foto"` es un <img>; en la piel `"fondo"` no existe
      imgFoto: caja(document.querySelector('img[src*="cta-informe-tecnico-urban"]')),
      bgFondo: (() => {
        const el = cajaCta;
        if (!el) return null;
        return getComputedStyle(el).backgroundImage.slice(0, 60);
      })(),
    },
    claim: {
      el: caja(claim),
      columna: caja(colClaim),
      fila: caja(filaClaim),
      img: caja(imgClaim),
      /** dónde cae el claim DENTRO de su fila — lo que delata el centrado */
      offsetEnFila:
        claim && filaClaim
          ? r(
              claim.getBoundingClientRect().top -
                filaClaim.getBoundingClientRect().top,
            )
          : null,
    },
    foto,
  };
};

const { browser } = await launch();
async function medir(ruta) {
  const { page } = await openPage(browser, BASE + ruta, {
    width,
    height: mobile ? 844 : 900,
    mobile,
  });
  await settle(page);
  const out = await page.evaluate(extraer);
  await page.close();
  return out;
}
const a = await medir(A);
const b = await medir(B);
await browser.close();

const pinta = (etiqueta, x, y) => {
  console.log(`\n── ${etiqueta} ──`);
  const claves = new Set([...Object.keys(x || {}), ...Object.keys(y || {})]);
  for (const k of claves) {
    const va = x?.[k],
      vb = y?.[k];
    const d =
      typeof va === "number" && typeof vb === "number"
        ? `   Δ${(vb - va >= 0 ? "+" : "") + +(vb - va).toFixed(2)}`
        : "";
    const marca = String(va) === String(vb) ? "" : "  ←";
    console.log(`  ${k.padEnd(6)} ${String(va).padStart(12)} → ${String(vb).padStart(12)}${d}${marca}`);
  }
};

console.log(`\n════════ composición @${width} · SECTOR → reexpresión mono ════════`);

console.log(`\n█ CTA DE DESCARGA — el campo \`variante\` que falta`);
console.log(`  ¿lleva <img> de la piel "foto"?   A: ${!!a.cta.imgFoto}   B: ${!!b.cta.imgFoto}`);
console.log(`  background-image de la caja       A: ${a.cta.bgFondo}`);
console.log(`                                   B: ${b.cta.bgFondo}`);
pinta("caja del CTA", a.cta.caja, b.cta.caja);
pinta("título del CTA", a.cta.titulo, b.cta.titulo);

console.log(`\n█ CLAIM — el nivel semántico y el centrado vertical que faltan`);
pinta("el claim (elemento)", a.claim.el, b.claim.el);
pinta("su columna", a.claim.columna, b.claim.columna);
pinta("su fila", a.claim.fila, b.claim.fila);
pinta("la foto", a.claim.img, b.claim.img);
console.log(
  `\n  offset del claim dentro de su fila:  ${a.claim.offsetEnFila} → ${b.claim.offsetEnFila}` +
    `   Δ${(b.claim.offsetEnFila - a.claim.offsetEnFila >= 0 ? "+" : "") + +(b.claim.offsetEnFila - a.claim.offsetEnFila).toFixed(2)}`,
);
console.log(
  `  ↑ ninguna medida de ALTO de fila ve esto: centrado o pegado arriba, la fila mide igual.`,
);

w(`medidas/exp-detalle-${width}.json`, { meta: { A, B, width }, A: a, B: b });
