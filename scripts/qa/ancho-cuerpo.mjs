/**
 * EL ANCHO DEL CUERPO — original contra clon, por COMPOSICIÓN horizontal.
 * Uso: npm run qa:ancho -- [ancho]     SOLO=<txt> · SALIDA=… · SABOTAJE=1|pleno
 *
 * El eje que `COBERTURA-MEDICION.md` tiene a **0/31**: nunca se ha comparado el
 * ancho de la retícula del cuerpo contra el original. Las cuatro pistas que
 * existen —la miga (−33.25), el kicker de /monitor, el `w-[80%]` por defecto de
 * `Breadcrumb`/`UltimosArticulos` y el `h1` al 100 % de la cabecera— salieron
 * **todas de refilón**, buscando otra cosa. Esta sonda lo mira a propósito.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO LECCIONES QUE LE DAN FORMA
 *
 * **1 · El NIVEL, en horizontal.** *El ancho de un elemento ENVUELTO es el de su
 * contenedor, no el de su contenido.* Así que el Δ de ancho de un bloque que
 * LLENA su contenedor **no es evidencia de nada**: repite el número de su padre.
 * La sonda marca cada medida con `informativo`, y **un Δ0 sobre una medida no
 * informativa NO cuenta como verificación** — es la trampa que dejó este eje a
 * 0/31 pareciendo verde.
 *
 * **2 · Identidad por marcador semántico, no por `className`.** En el original
 * las clases del tema (`et_pb_row`, `et_pb_column`, `et_pb_module`) SÍ nombran
 * una cosa. En el clon no hay equivalente, así que la fila se identifica **por
 * comportamiento**: el bloque hijo de la sección que va centrado y es más
 * estrecho que ella. Se dice por dónde se entró (`via`) en cada lado.
 *
 * **3 · Emparejar por CONTENIDO, no por índice.** El nº de secciones ya difiere
 * entre lados por partición (D1/D2), así que casar por posición compararía cosas
 * distintas — la clase C7. Se empareja por la **firma de texto** de la fila, y lo
 * que no case se reporta como HUÉRFANO en vez de desaparecer.
 *
 * **4 · Censo en los DOS lados, y el pleno también avisa.** Un selector que no
 * casa en ninguna página sale por error; uno que casa en el 100 % se declara con
 * su máximo, porque *un patrón que casa en todas no mide nada*.
 *
 * DIAGNÓSTICO PURO: esta sonda no arregla nada y no propone arreglos.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, QA, env, iniciarClon, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = env("SABOTAJE");
const SOLO = env("SOLO");

const { base: CLON, parar: pararClon } = await iniciarClon();

/* Las rutas salen del BUILD, como en `c-cmp`: una ruta nueva entra sola. */
const manifiesto = JSON.parse(readFileSync(join(QA, "../../.next/prerender-manifest.json"), "utf8"));
const RUTAS = Object.keys(manifiesto.routes || {})
  // Rutas internas de Next: no existen en el original y solo aportan 404.
  .filter((r) => !/^\/(_not-found|_global-error|favicon)/.test(r))
  .sort()
  .filter((r) => !SOLO || r.includes(SOLO));
if (RUTAS.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna ruta emitida — filtro equivocado, no corrida limpia.`);
  await pararClon();
  process.exit(2);
}
/** `/x` → `/es/x/`, igual que en `c-cmp`: el clon reproduce el árbol del original. */
const aOriginal = (r) => `https://kunakair.com/es${r === "/" ? "/" : r + "/"}`;

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const W = (el) => r(el.getBoundingClientRect().width);
  /**
   * ⚠ La firma va SIN ESPACIOS. El original separa los nodos en línea con
   * espacios y el clon no —el mismo texto sale «Inicio Productos» contra
   * «InicioProductos»—, así que normalizar a UN espacio no empareja: la primera
   * versión casó **0 de 13 filas** y aun así imprimió ✅. Es la trampa de
   * `charsCenso()` de `CLAUDE.md`: dos definiciones de «lo mismo».
   */
  const firma = (el) => (el?.textContent || "").replace(/\s+/g, "").slice(0, 48);

  // Negativo 1: selector muerto en los dos lados ⇒ tiene que salir por error.
  if (sabotaje === "1" || sabotaje === "muerto") __q(".ancho-selector-que-no-existe");
  // Negativo 2: un patrón ubicuo ⇒ tiene que salir por PLENO, no por dato.
  if (sabotaje === "pleno") __qa("div");

  const esOriginal = !!__q(".et_pb_section");

  /* ── Las SECCIONES del cuerpo, con el selector de cada lado ─────────────── */
  const secciones = esOriginal
    ? __qa(".et_pb_section").filter((s) => !/_tb_(header|footer)\b/.test(s.className))
    : __qa("main > section, main > div");

  /**
   * La FILA dentro de una sección.
   *   · original → `.et_pb_row` (clase del tema: eso SÍ es identidad)
   *   · clon     → por COMPORTAMIENTO: hijo de la sección, más estrecho que ella
   *                y centrado (márgenes laterales iguales y no nulos).
   * Devolver el primer hijo a secas —lo que hacían sondas anteriores— casa con
   * bloques a ancho completo que no son filas.
   */
  const filasDe = (sec) => {
    if (esOriginal) return [...sec.querySelectorAll(".et_pb_row, [class*='et_pb_row']")];
    const anchoSec = sec.getBoundingClientRect().width;
    const cand = [];
    const visita = (el, prof) => {
      if (prof > 3) return;
      for (const h of el.children) {
        const b = h.getBoundingClientRect();
        const cs = getComputedStyle(h);
        const izq = b.left - el.getBoundingClientRect().left;
        const der = el.getBoundingClientRect().right - b.right;
        const centrado = Math.abs(izq - der) < 1.5 && izq > 0.5;
        if (b.width > 0 && b.width < anchoSec - 1 && centrado && cs.display !== "none") cand.push(h);
        else visita(h, prof + 1);
      }
    };
    visita(sec, 0);
    return cand;
  };

  const columnasDe = (fila) =>
    esOriginal ? [...fila.querySelectorAll(".et_pb_column")] : [...fila.children].filter((c) => getComputedStyle(c).display !== "none");

  const filas = [];
  secciones.forEach((sec, iSec) => {
    const anchoSec = W(sec);
    filasDe(sec).forEach((fila, iFila) => {
      const anchoFila = W(fila);
      const cols = columnasDe(fila);
      filas.push({
        iSec,
        iFila,
        firma: firma(fila),
        secW: anchoSec,
        filaW: anchoFila,
        // El % que es lo trasladable al CMS: la retícula se escribe en %.
        pctDeSeccion: anchoSec ? r((anchoFila / anchoSec) * 100) : null,
        /**
         * ⚠ La marca que decide si el número vale: una fila que MIDE LO MISMO que
         * su sección no está diciendo su ancho, está repitiendo el de su padre.
         * Un Δ0 ahí no verifica nada (lección 1).
         */
        informativo: anchoSec - anchoFila > 1,
        nCols: cols.length,
        cols: cols.slice(0, 8).map((c) => {
          const cw = W(c);
          return { w: cw, pctDeFila: anchoFila ? r((cw / anchoFila) * 100) : null, informativo: anchoFila - cw > 1 };
        }),
      });
    });
  });

  return {
    ancho: r(document.documentElement.clientWidth),
    nSecciones: secciones.length,
    nFilas: filas.length,
    filas,
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), solo: SOLO ?? null, sabotaje: SABOTAJE ?? null }, rutas: {} };
let muertas = 0, conDelta = 0, huerfanasTot = 0, noInformativas = 0, comparadas = 0;

for (const ruta of RUTAS) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    return datos;
  };
  try {
    const o = await lee(aOriginal(ruta));
    const c = await lee(CLON + ruta);

    /* ── Emparejar por FIRMA DE TEXTO, no por índice (lección 3) ──────────── */
    const usadas = new Set();
    const pares = [];
    for (const fo of o.filas) {
      const i = c.filas.findIndex((fc, k) => !usadas.has(k) && fc.firma && fc.firma === fo.firma);
      if (i >= 0) { usadas.add(i); pares.push([fo, c.filas[i]]); }
      else pares.push([fo, null]);
    }
    const huerfanasClon = c.filas.filter((_, k) => !usadas.has(k));

    const difs = [];
    for (const [fo, fc] of pares) {
      if (!fc) continue;
      const d = +(fc.filaW - fo.filaW).toFixed(2);
      const dPct = fo.pctDeSeccion != null && fc.pctDeSeccion != null ? +(fc.pctDeSeccion - fo.pctDeSeccion).toFixed(2) : null;
      // Solo cuenta como comparación con valor si el ancho DICE algo en los dos.
      const vale = fo.informativo && fc.informativo;
      comparadas++;
      if (!vale) noInformativas++;
      if (vale && Math.abs(d) > 0.5) difs.push({ firma: fo.firma, orig: fo.filaW, clon: fc.filaW, d, dPct, pctO: fo.pctDeSeccion, pctC: fc.pctDeSeccion, nColsO: fo.nCols, nColsC: fc.nCols });
    }
    const huerfanasOrig = pares.filter(([, fc]) => !fc).length;
    huerfanasTot += huerfanasOrig + huerfanasClon.length;
    if (difs.length) conDelta++;

    salida.rutas[ruta] = {
      nFilas: { orig: o.nFilas, clon: c.nFilas },
      nSecciones: { orig: o.nSecciones, clon: c.nSecciones },
      huerfanas: { orig: huerfanasOrig, clon: huerfanasClon.length, firmasClon: huerfanasClon.slice(0, 6).map((f) => f.firma) },
      difs,
    };

    const marca = difs.length ? "▲" : "·";
    console.log(
      `  ${marca} ${ruta.slice(0, 52).padEnd(54)} filas ${String(o.nFilas).padStart(3)}→${String(c.nFilas).padStart(3)}` +
        `  Δ≠0 ${String(difs.length).padStart(2)}  huérfanas ${huerfanasOrig}/${huerfanasClon.length}`,
    );
    for (const d of difs.slice(0, 6))
      console.log(`        ${String(d.orig).padStart(8)} → ${String(d.clon).padStart(8)}  Δ ${String(d.d).padStart(8)}  (${d.pctO}% → ${d.pctC}%)  cols ${d.nColsO}/${d.nColsC}  | ${d.firma}`);
  } catch (e) {
    muertas++;
    salida.rutas[ruta] = { error: String(e).slice(0, 200) };
    console.log(`  ✗ ${ruta.slice(0, 52).padEnd(54)} ERROR ${String(e).slice(0, 70)}`);
  }
}
await browser.close();
await pararClon();

w(env("SALIDA") || `medidas/ancho-cuerpo-${width}${SOLO ? `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}` : ""}.json`, salida);

/* ── Un canal de verdad ──────────────────────────────────────────────────── */
const muertos = censo.informe(`@${width}`);
/** El pleno: un selector que casa en TODAS las páginas no discrimina (lección 4). */
const ubicuos = Object.entries(censo.total).filter(([, n]) => n > censo.paginas * 40);
if (ubicuos.length)
  console.error(`\n⚠ PATRÓN UBICUO — casa ${ubicuos[0][1]} veces en ${censo.paginas} páginas: no está discriminando nada.\n` + ubicuos.map(([s, n]) => `     · ${s} (${n})`).join("\n"));
if (muertas) console.error(`\n❌ ${muertas} ruta(s) no se pudieron medir — NO son «sin diferencia».`);

console.log(
  `\n─── ANCHO DEL CUERPO @${width} · ${RUTAS.length - muertas}/${RUTAS.length} rutas\n` +
    `      filas comparadas      : ${comparadas}\n` +
    `      de ellas NO informativas: ${noInformativas}  ← su Δ0 no verifica nada (llenan a su padre)\n` +
    `      rutas con Δ ≠ 0       : ${conDelta}\n` +
    `      filas huérfanas       : ${huerfanasTot}  ← no emparejadas por firma: son PREGUNTAS, no defectos\n`,
);
/**
 * ⚠ ACOTAR NO PUEDE VOLVERSE VERDE POR VACIADO. La primera corrida comparó
 * **0 filas** —el emparejamiento no casaba ninguna— y salió con ✅ y código 0.
 * Una sonda que no compara nada y una que compara y no encuentra nada dan la
 * misma salida; sin esta guarda, este eje habría pasado de «0/31» a «verde»
 * sin haber medido una sola fila.
 */
const sinComparar = comparadas === 0;
if (sinComparar)
  console.error(
    `\n❌ 0 FILAS COMPARADAS en ${RUTAS.length - muertas} ruta(s): el emparejamiento no casó NADA.\n` +
      "   Eso no es «no hay diferencias», es que la sonda no midió. Revisa la firma.",
  );
const fallos = muertos + muertas + ubicuos.length + (sinComparar ? 1 : 0);
console.log(`${fallos === 0 ? "✅" : "❌"} ancho-cuerpo @${width} · ${muertos} muerto(s) · ${ubicuos.length} ubicuo(s)\n   ⚠ DIAGNÓSTICO: nada se arregla aquí. Cada Δ se adjudica contra el original y se ficha con su encuadre.`);
process.exit(fallos === 0 ? 0 : 2);
