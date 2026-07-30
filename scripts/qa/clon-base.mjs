/**
 * LÍNEA BASE DEL CLON — el "Antes/Después" de tocar un componente compartido.
 * Uso: node clon-base.mjs [ancho] [etiqueta] [--cmp <fichero.json>]
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * Las demás sondas comparan el clon **contra el original**, y por tanto arrastran
 * el ruido del sitio vivo. Ésta compara el clon **contra sí mismo** antes y
 * después de un cambio: dos builds del mismo código dan el mismo número al
 * céntimo, así que aquí **el umbral es cero** y no hay tolerancia que discutir.
 *
 * Se escribió al construir MONOGRÁFICO (2026-07-29), que añade campos a
 * `CabeceraSector` y `SectorHero` — compartidos con los 4 sectores. Que añadir un
 * campo opcional sea aditivo no prueba que no mueva un píxel: eso se mide.
 *
 * ── Las rutas salen del BUILD, no de una lista ─────────────────────────────
 * Igual que `enlaces.mjs`: `.next/prerender-manifest.json`. Así la sonda se
 * automantiene — cuando el monográfico emita sus rutas entran solas, y el informe
 * las marca como NUEVAS en vez de callárselas. Una lista a mano habría medido 9
 * páginas antes y 9 después, dando "sin regresión" sin mirar las dos nuevas.
 *
 * ── El marcador discriminante ──────────────────────────────────────────────
 * `CLAUDE.md` §El principio, corolario 2: un "limpio" contra un `next start`
 * desincronizado de `.next` es un limpio falso, y ya pasó una vez. Antes de medir
 * nada, la sonda exige encontrar un marcador del cambio en el HTML **servido**:
 *
 *   MARCADOR="texto que solo existe en el build nuevo" node clon-base.mjs 1440
 *   MARCADOR_RUTA=/sectores/x MARCADOR="…" node clon-base.mjs 1440
 *
 * Sin `MARCADOR` avisa y sigue: la primera corrida de una tanda no tiene contra
 * qué discriminar todavía. Con `MARCADOR` y sin encontrarlo, **sale con 2 y no
 * mide** — que es el punto: la corrida que más importa es la que dice "no se
 * movió nada".
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { launch, openPage, ruta, settle, w } from "./lib.mjs";

const RAIZ = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const BASE = process.env.CLON || "http://localhost:3000";

const args = process.argv.slice(2);
const iCmp = args.indexOf("--cmp");
const ficheroCmp = iCmp >= 0 ? args[iCmp + 1] : null;
const libres = (iCmp >= 0 ? args.slice(0, iCmp) : args).filter(Boolean);
const width = Number(libres[0] || 1440);
const etiqueta = libres[1] ? `-${libres[1]}` : "";
const mobile = width <= 500;

/* ─────────────── rutas publicadas, leídas del build ─────────────── */

const manifiesto = JSON.parse(
  readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"),
);
const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => !r.startsWith("/_") && !r.includes("."))
  .sort();
if (RUTAS.length === 0) {
  console.error("No hay rutas en .next/prerender-manifest.json — ¿falta `npm run build`?");
  process.exit(2);
}

/* ─────────────── marcador discriminante del build servido ─────────────── */

const marcador = process.env.MARCADOR || null;
if (marcador) {
  // `ruta()` deshace la traducción de MSYS. Git Bash convierte cualquier valor
  // que empiece por `/` en una ruta de Windows, así que `MARCADOR_RUTA=/x`
  // llegaba como `C:/Program Files/Git/x` y la sonda moría con `Invalid URL`.
  // El README decía que `ruta()` cubría `MARCADOR_RUTA` **y aquí no se
  // llamaba**: el corolario de `CLAUDE.md` §DOCUMENTADO NO ES CONECTADO, en la
  // propia sonda. Aquí falla ruidosamente; en un caso menos afortunado habría
  // medido otra página.
  const rutaMarcador = ruta(process.env.MARCADOR_RUTA || "/");
  const res = await fetch(BASE + rutaMarcador);
  const html = res.ok ? await res.text() : "";
  if (!html.includes(marcador)) {
    console.error(
      `\n❌ MARCADOR no encontrado en ${BASE + rutaMarcador} (HTTP ${res.status}).\n` +
        `   El servidor NO está sirviendo el build que crees. Mátalo POR PUERTO,\n` +
        `   rehaz \`npm run build\`, relánzalo y repite. No se mide nada.\n`,
    );
    process.exit(2);
  }
  console.log(`✓ marcador presente en ${rutaMarcador} — el build servido es el nuevo`);
} else {
  console.log("⚠ sin MARCADOR: no se ha discriminado el build servido (ver cabecera)");
}

/* ─────────────────────────── medida ─────────────────────────── */

const { browser } = await launch();
const todo = { meta: { width, base: BASE, rutas: RUTAS.length }, paginas: {} };

for (const ruta of RUTAS) {
  try {
    const { page } = await openPage(browser, BASE + ruta, {
      width,
      height: mobile ? 844 : 900,
      mobile,
    });
    await settle(page);
    todo.paginas[ruta] = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const t = (el, n = 60) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
      const h1 = document.querySelector("h1");
      const caja = (el) => {
        const b = el.getBoundingClientRect();
        return { x: r(b.x), y: r(b.y + window.scrollY), w: r(b.width), h: r(b.height) };
      };
      return {
        docH: r(document.documentElement.scrollHeight),
        // La base de lectura del protocolo (README §2): dispersión 0 en 42 cargas.
        h1: h1 ? { ...caja(h1), txt: t(h1) } : null,
        // Árbol de primer nivel: una entrada por sección del documento, con su
        // ritmo. Un Δ localizado dice QUÉ sección se movió; el `docH` solo dice
        // que algo se movió — y puede ser dos errores anulándose.
        secciones: [...document.querySelectorAll("main > section, main > div")].map((s, i) => {
          const st = getComputedStyle(s);
          return {
            i,
            h: r(s.getBoundingClientRect().height),
            mt: st.marginTop,
            pt: st.paddingTop,
            pb: st.paddingBottom,
            txt: t(s, 34),
          };
        }),
        nAnclas: document.querySelectorAll("a[href]").length,
        nImgs: document.querySelectorAll("img").length,
      };
    });
    await page.close();
  } catch (e) {
    todo.paginas[ruta] = { error: String(e).slice(0, 200) };
  }
}
await browser.close();

const salida = `clon-base-${width}${etiqueta}.json`;
w(process.env.SALIDA || `medidas/${salida}`, todo);

for (const [ruta, d] of Object.entries(todo.paginas)) {
  if (d.error) {
    console.log(`  ⚠ ${ruta}  ${d.error}`);
    continue;
  }
  console.log(
    `  ${ruta.padEnd(52)} docH ${String(d.docH).padStart(8)}  h1.y ${String(d.h1?.y ?? "—").padStart(8)}` +
      `  secciones ${String(d.secciones.length).padStart(2)}  a ${String(d.nAnclas).padStart(3)}`,
  );
}

/* ─────────────────────────── comparación ─────────────────────────── */

if (!ficheroCmp) process.exit(0);

const antes = JSON.parse(readFileSync(ficheroCmp, "utf8"));
if (antes.meta.width !== width) {
  console.error(`\n❌ ${ficheroCmp} se midió a ${antes.meta.width}, no a ${width}.`);
  process.exit(2);
}

console.log(`\n═══ ANTES (${ficheroCmp}) vs DESPUÉS @${width}\n`);
const rutasAntes = Object.keys(antes.paginas);
const nuevas = RUTAS.filter((r) => !rutasAntes.includes(r));
const idas = rutasAntes.filter((r) => !RUTAS.includes(r));
if (nuevas.length) console.log(`  NUEVAS (no había línea base): ${nuevas.join(" · ")}`);
if (idas.length) console.log(`  ❌ DESAPARECIDAS del build: ${idas.join(" · ")}`);

let regresiones = 0;
for (const ruta of rutasAntes.filter((r) => RUTAS.includes(r))) {
  const a = antes.paginas[ruta];
  const b = todo.paginas[ruta];
  if (a.error || b.error) {
    console.log(`  ⚠ ${ruta}: error en una de las dos corridas`);
    continue;
  }
  const deltas = [];
  const dDoc = +(b.docH - a.docH).toFixed(2);
  if (dDoc !== 0) deltas.push(`docH ${dDoc > 0 ? "+" : ""}${dDoc}`);
  const dH1 = +((b.h1?.y ?? 0) - (a.h1?.y ?? 0)).toFixed(2);
  if (dH1 !== 0) deltas.push(`h1.y ${dH1 > 0 ? "+" : ""}${dH1}`);
  if (a.secciones.length !== b.secciones.length)
    deltas.push(`nº secciones ${a.secciones.length}→${b.secciones.length}`);
  else
    a.secciones.forEach((sa, i) => {
      const sb = b.secciones[i];
      const d = +(sb.h - sa.h).toFixed(2);
      if (d !== 0) deltas.push(`S${i} h ${d > 0 ? "+" : ""}${d} ("${sa.txt}")`);
      if (sa.mt !== sb.mt || sa.pt !== sb.pt || sa.pb !== sb.pb)
        deltas.push(`S${i} ritmo ${sa.mt}/${sa.pt}/${sa.pb} → ${sb.mt}/${sb.pt}/${sb.pb}`);
    });
  if (a.nAnclas !== b.nAnclas) deltas.push(`anclas ${a.nAnclas}→${b.nAnclas}`);

  if (deltas.length) {
    regresiones++;
    console.log(`  ❌ ${ruta}`);
    deltas.forEach((d) => console.log(`       ${d}`));
  } else {
    console.log(`  ✅ ${ruta}  sin mover un píxel`);
  }
}

console.log(
  `\n${regresiones === 0 ? "✅" : "❌"} ${rutasAntes.length - idas.length} páginas comparadas · ` +
    `${regresiones} con regresión · umbral CERO (clon contra clon)`,
);
process.exit(regresiones === 0 && idas.length === 0 ? 0 : 1);
