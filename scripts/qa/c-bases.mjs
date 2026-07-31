/**
 * AUDITORÍA DE BASES DE LECTURA — ¿tiene cada ruta un punto de apoyo válido?
 * Uso: npm run qa:bases            (no necesita navegador ni servidor)
 *
 * ── Por qué hace falta, y por qué nadie la había corrido ───────────────────
 * `CLAUDE.md` §El principio: *la regla del `h1` es CIEGA A SU PROPIO PUNTO DE
 * APOYO.* El protocolo resta la base antes de comparar, así que un desfase que
 * está EN la base se normaliza a cero por construcción. El contenedor con
 * holgura es **el propio instrumento de medida**.
 *
 * C-QA3 encontró el caso extremo: el `h1` de la home mide **0 px de alto** en el
 * original y **1 px** en el clon — son títulos ocultos para SEO, no el titular
 * de la página. No es que la base estuviera movida: **no era una base**, y todas
 * las lecturas del cuerpo de la home se hicieron contra un origen arbitrario.
 *
 * Eso obliga a una pregunta que el arreglo implica y **nadie había contestado**:
 * ¿a cuántas rutas más les pasa? Esto la contesta en las 17, a los dos anchos.
 *
 * ── De dónde salen los datos: del CONGELADO, no del original vivo ──────────
 * `medidas/c-cabecera-{1440,390}.json` ya trae `h1alto` de los dos lados en las
 * 17 rutas (regenerado en `82142e2` con la sonda enriquecida). Volver a medir el
 * original sería re-medirlo a mano —lo que el HANDOFF prohíbe— y añadiría el
 * ruido de un sitio vivo a una pregunta que el fichero ya responde.
 *
 * ⚠ Por eso la primera guarda es de FORMATO: si el congelado es anterior a
 * `h1alto`, la clave llega `undefined`, `undefined <= 4` es `false` y esta sonda
 * diría **«las 17 tienen base»** sin haber mirado nada. Es la regla del selector
 * muerto (`Censo`) con otra ropa, así que se comprueba y se muere.
 *
 * ── Los tres ejes, que no son el mismo ─────────────────────────────────────
 *  (1) **caja real**: `h1alto > 4` en LOS DOS lados. Sin esto no hay base.
 *  (2) **mismo elemento**: `h1txt` coincide. Un selector que casa en ambos lados
 *      pero apunta a cosas distintas no lo caza ningún censo (C-SP16 bis).
 *  (3) **mismo alto**: si el `h1` envuelve en distinto nº de renglones, la base
 *      es válida —el borde superior sigue siendo comparable— pero hay un defecto
 *      de ANCHO del contenedor debajo. Se reporta aparte: no invalida la base,
 *      y confundirlo con (1) sería medir al nivel equivocado.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QA, w } from "./lib.mjs";

const ANCHOS = [1440, 390];

/**
 * Rutas cuya base se sabe inválida, con su registro. **La lista es una
 * ALLOWANCE explícita, no un silencio**: sale impresa, y cualquier ruta que no
 * esté en ella y falle cierra el código de salida en 2.
 */
const CONOCIDAS = {
  "/": "C-QA3 · `h1` oculto para SEO (0/1 px). Ancla alternativa medida: el `h2` «La solución profesional…»",
};

const leer = (ancho) => {
  const f = join(QA, `medidas/c-cabecera-${ancho}.json`);
  try {
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    console.error(`\n❌ falta el congelado ${f}\n   Corre \`npm run qa:c-cabecera -- ${ancho}\` antes.\n`);
    process.exit(2);
  }
};

const datos = Object.fromEntries(ANCHOS.map((a) => [a, leer(a)]));
const rutas = Object.keys(datos[ANCHOS[0]].paginas);

/* ── Guarda de FORMATO: sin `h1alto` esta sonda no mide, adivina ── */
for (const a of ANCHOS) {
  for (const [r, v] of Object.entries(datos[a].paginas)) {
    if (v.error) continue;
    if (!("h1alto" in v.orig) || !("h1alto" in v.clon)) {
      console.error(
        `\n❌ el congelado @${a} no trae \`h1alto\` (ruta ${r}): es anterior a la sonda\n` +
          `   enriquecida. Sin esa clave esto NO mide nada y diría «todas con base».\n` +
          `   Regenera con \`npm run qa:c-cabecera -- ${a}\`.\n`,
      );
      process.exit(2);
    }
  }
}

/* ─────────────────────────────── el barrido ─────────────────────────────── */

const salida = {
  meta: {
    fecha: new Date().toISOString().slice(0, 10),
    origen: ANCHOS.map((a) => `medidas/c-cabecera-${a}.json`),
    anchos: ANCHOS,
    rutas: rutas.length,
  },
  bases: {},
};

let sinBase = 0;
let sinBaseNuevas = 0;
let distintoElemento = 0;
let distintoAlto = 0;

console.log(`\n═══ BASES DE LECTURA · ${rutas.length} rutas × ${ANCHOS.length} anchos (del congelado)\n`);
console.log(`  ${"ruta".padEnd(52)}${ANCHOS.map((a) => `alto o/c @${a}`.padEnd(20)).join("")}base`);

for (const r of rutas) {
  const fila = { anchos: {}, base: true, mismoElemento: true, mismoAlto: true };
  const celdas = [];

  for (const a of ANCHOS) {
    const v = datos[a].paginas[r];
    if (v.error) {
      fila.anchos[a] = { error: v.error };
      fila.base = false;
      celdas.push("ERROR".padEnd(20));
      continue;
    }
    const o = v.orig.h1alto ?? 0;
    const c = v.clon.h1alto ?? 0;
    const caja = o > 4 && c > 4;
    const mismo = v.orig.h1txt === v.clon.h1txt;
    fila.anchos[a] = {
      origAlto: v.orig.h1alto, clonAlto: v.clon.h1alto, caja, mismoElemento: mismo,
      origY: v.orig.h1yCrudo, clonY: v.clon.h1yCrudo,
      dY: +(v.clon.h1yCrudo - v.orig.h1yCrudo).toFixed(2),
      anclaVisible: { orig: v.orig.anclaVisible, clon: v.clon.anclaVisible },
    };
    if (!caja) fila.base = false;
    if (!mismo) fila.mismoElemento = false;
    if (caja && o !== c) fila.mismoAlto = false;
    celdas.push(`${o}/${c}${caja ? "" : "  ← SIN CAJA"}`.padEnd(20));
  }

  const conocida = r in CONOCIDAS;
  if (!fila.base) { sinBase++; if (!conocida) sinBaseNuevas++; }
  if (!fila.mismoElemento) distintoElemento++;
  if (!fila.mismoAlto) distintoAlto++;
  fila.registrada = conocida ? CONOCIDAS[r] : null;
  salida.bases[r] = fila;

  console.log(
    `  ${r.slice(0, 51).padEnd(52)}${celdas.join("")}` +
      (fila.base ? "sí" : conocida ? "NO (registrada)" : "NO  ← ¡NUEVA!"),
  );
}

/* ── (2) el mismo elemento en los dos lados ── */
console.log(`\n═══ ¿es el MISMO \`h1\` en los dos lados?`);
console.log(
  distintoElemento
    ? `  ❌ ${distintoElemento} ruta(s) donde no: su Δ no es comparable`
    : `  ✅ las ${rutas.length}: el texto coincide, los Δ son legítimos`,
);

/* ── (3) el alto, que NO invalida la base pero sí es un defecto ── */
console.log(`\n═══ ¿ENVUELVE igual? — base válida, pero el ancho del contenedor no cuadra`);
if (!distintoAlto) {
  console.log(`  ✅ ninguna: el \`h1\` mide lo mismo en los dos lados en todas`);
} else {
  for (const [r, f] of Object.entries(salida.bases)) {
    if (f.mismoAlto || !f.base) continue;
    const det = ANCHOS.filter((a) => f.anchos[a] && f.anchos[a].origAlto !== f.anchos[a].clonAlto)
      .map((a) => `@${a} ${f.anchos[a].origAlto}→${f.anchos[a].clonAlto}`)
      .join(" · ");
    console.log(`  ⚠ ${r.slice(0, 60).padEnd(61)} ${det}`);
  }
  console.log(
    `  → ${distintoAlto} ruta(s). La base SIGUE VALIENDO (el borde superior es\n` +
      `     comparable); lo que no cuadra es el ANCHO del contenedor del título.\n` +
      `     Se cuenta aparte a propósito: mezclarlo con «sin base» sería medir al\n` +
      `     nivel equivocado.`,
  );
}

/* ── El veredicto, y su código de salida ── */
console.log(`\n═══ VEREDICTO`);
for (const [r, motivo] of Object.entries(CONOCIDAS)) {
  if (salida.bases[r] && !salida.bases[r].base) console.log(`  · ${r} — sin base, REGISTRADA: ${motivo}`);
}
console.log(`  · ${rutas.length - sinBase} de ${rutas.length} rutas con base válida a los dos anchos`);

salida.meta.sinBase = sinBase;
salida.meta.sinBaseNuevas = sinBaseNuevas;
salida.meta.distintoAlto = distintoAlto;
salida.meta.distintoElemento = distintoElemento;
w("medidas/c-bases.json", salida);

if (sinBaseNuevas || distintoElemento) {
  console.error(
    `\n❌ ${sinBaseNuevas} ruta(s) SIN BASE no registrada(s) y ${distintoElemento} con \`h1\` distinto.\n` +
      `   Sus deltas de cuerpo NO significan nada hasta que tengan ancla alternativa\n` +
      `   medida. PARA y anótalas antes de leer un solo número de esas páginas.\n`,
  );
  process.exit(2);
}
console.log(`\n✅ sin bases inválidas nuevas: solo la(s) ya registrada(s).\n`);
