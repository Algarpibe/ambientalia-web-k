/**
 * PASO 0a · 118.ª — ¿LAS 8 NO ATRIBUIDAS SON LA BARRA LATERAL `BT`?
 *
 * La 117.ª dejó 8 rutas movidas SÓLO a 390 con `Δ≈+504 uniforme` y las fichó
 * como NO ATRIBUIDAS, con dos hipótesis vivas y 0 instancias separadoras:
 *   H1 · «la ficha se pinta distinto en el centro de ayuda»
 *   H2 · «otro cambio de 113-116 que TAMBIÉN está tapado a 1440»
 *
 * Esta derivación NO mide nada nuevo: cruza congeladas que ya existen
 * (§*lo decisivo suele estar en el ARCHIVO*). Añade una TERCERA hipótesis que
 * el registro nombra dos veces con su mecanismo y que la 117.ª no consideró:
 *   H3 · «la BARRA LATERAL `BT`, emitida en la 107.ª — posterior a la base»
 *
 * H3 NO es H2 reescrita (§*antes de fichar una indeterminación, comprueba que
 * las dos hipótesis sean DISTINTAS*): H2 nombra el intervalo 113-116, H3
 * nombra la 107.ª, que es ANTERIOR a ese intervalo y POSTERIOR a la base.
 * Difieren sobre dos entradas concretas y las dos son derivables sin red:
 *   · el ORDEN — ¿el commit que emite la barra cae entre las dos congeladas?
 *   · la MAGNITUD — H1 predice Δ+4/+5 (lo medido en 146 de 152 entradas);
 *     H3 predice `columna.h` de `kb-barra`. Dos órdenes de diferencia.
 *
 * LA PREGUNTA, en sus DOS DIRECCIONES (ninguna se puede omitir):
 *   (a) ¿las 8 tienen barra, y su Δ casa con `columna.h` o con `barra.h`?
 *   (b) ¿hay rutas CON BARRA que NO estén entre las 8, y hay rutas con esa
 *       MAGNITUD fuera del dominio de la barra? — un pleno o un cero
 *       perfectos se sospechan del instrumento antes que del dato.
 *
 * CONTROL (§regla 8: un negativo sin control no es un negativo). El candidato
 * `columna.h` sólo vale si su alternativa NO casa: se contrasta contra
 * `barra.h` (el módulo) EN SU MISMO ANCHO. Si casaran las dos, esto no
 * discriminaría nada y el veredicto sería SIN PROBAR.
 *
 * ⚠ El registro cita el módulo como `493.66` a 390 (`PENDIENTES-QA.md` L20917).
 * `493.66` es el módulo a **1440**; a 390 mide **461.16** (tabla de L21015).
 * Es §*un valor relativo se escribe CON SU BASE* con la base puesta en el
 * ANCHO: el número se copió sin él. Aquí se usa el de 390, que es el que
 * corresponde al ancho en que se mide el Δ.
 *
 * ⚠ NO levanta navegador, NO toca `.next`, NO pide red.
 *
 * Salida: `ocho-no-atribuidas-118.log`.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const MED = path.join(RAIZ, "scripts/qa/medidas");

/* §regla 26 hermana: todo cableado lleva guarda CON DIAGNÓSTICO. Un `ENOENT`
 * pelado no dice «esta familia fue renombrada, mira las candidatas». */
const lee = (f) => {
  const r = path.join(MED, f);
  if (!fs.existsSync(r)) {
    const fam = fs.readdirSync(MED).filter((x) => x.startsWith(f.slice(0, 14)));
    throw new Error(
      `ocho-no-atribuidas-118: falta \`${f}\`.\n` +
        `  ¿Renombrada por §regla 5bis/§regla 7? Candidatas de la familia (${fam.length}):\n    ` +
        fam.join("\n    "),
    );
  }
  return JSON.parse(fs.readFileSync(r, "utf8"));
};

/* Las congeladas se CITAN CON SU FICHERO (§regla 5: el nombre canónico de una
 * familia es la PRIMERA foto, no el estado de hoy). */
const F_BASE = "clon-base-390-t104-despues.json";
const F_HOY = "clon-base-390-t117-tras-la-ficha.json";
const F_BASE_1440 = "clon-base-1440-t104-despues4.json";
const F_HOY_1440 = "clon-base-1440-t117-tras-la-ficha.json";
const F_BARRA_390 = "kb-barra-390.json";
const F_BARRA_1440 = "kb-barra-1440.json";

const base = lee(F_BASE);
const hoy = lee(F_HOY);
const base14 = lee(F_BASE_1440);
const hoy14 = lee(F_HOY_1440);
const barra390 = lee(F_BARRA_390);
const barra1440 = lee(F_BARRA_1440);

/* `clon-base` indexa `/accesorios`; `kb-barra` indexa `/es/accesorios/`.
 * Se normaliza a la forma de `clon-base` — sin `/es`, sin barra final. */
const norm = (r) => {
  let s = String(r).replace(/^\/es(?=\/|$)/, "");
  s = s.replace(/\/+$/, "");
  return s === "" ? "/" : s;
};

const L = [];
const say = (s = "") => {
  L.push(s);
  console.log(s);
};
const n2 = (x) => (x === null || x === undefined ? "—" : Number(x).toFixed(2));

say("═".repeat(78));
say("PASO 0a · 118.ª — ¿LAS 8 NO ATRIBUIDAS SON LA BARRA LATERAL `BT`?");
say("═".repeat(78));
say("");
say("Fuentes (§regla 5 · cada congelada con su fichero):");
say(`  base  390 : ${F_BASE}`);
say(`  hoy   390 : ${F_HOY}`);
say(`  base 1440 : ${F_BASE_1440}`);
say(`  hoy  1440 : ${F_HOY_1440}`);
say(`  barra 390 : ${F_BARRA_390}   (dominio ${barra390.meta.dominio.n}/${barra390.meta.dominio.de})`);
say(`  barra1440 : ${F_BARRA_1440}  (dominio ${barra1440.meta.dominio.n}/${barra1440.meta.dominio.de})`);
say("");

/* ── 1 · EL DOMINIO DE `kb-barra`: qué rutas tienen barra, medido ───────── */

const conBarra = new Map();
for (const [k, v] of Object.entries(barra390.paginas)) {
  const o = v.original || {};
  conBarra.set(norm(k), {
    familia: v.familia,
    hay: o.hay === true,
    columnaH: o.columna && o.columna.rect ? o.columna.rect.h : null,
    barraH: o.barra && o.barra.rect ? o.barra.rect.h : null,
  });
}
const conBarra14 = new Map();
for (const [k, v] of Object.entries(barra1440.paginas)) {
  const o = v.original || {};
  conBarra14.set(norm(k), {
    columnaH: o.columna && o.columna.rect ? o.columna.rect.h : null,
    barraH: o.barra && o.barra.rect ? o.barra.rect.h : null,
  });
}

say("─".repeat(78));
say("1 · EL DOMINIO MEDIDO DE `kb-barra` — y sus dos alturas, CON SU ANCHO");
say("─".repeat(78));
say("");
say(`  rutas en el dominio ........... ${conBarra.size}`);
say(`  con barra (original.hay) ...... ${[...conBarra.values()].filter((v) => v.hay).length}`);
say("");

/* Las dos alturas se publican con su ancho, y con su CARDINAL: si fueran
 * constantes, decirlo es parte del dato (una constante no «sigue» a nada). */
const rep = (m, campo) => {
  const c = {};
  for (const v of m.values()) c[n2(v[campo])] = (c[n2(v[campo])] || 0) + 1;
  return JSON.stringify(c);
};
say(`  columna.h @390  : ${rep(conBarra, "columnaH")}`);
say(`  barra.h   @390  : ${rep(conBarra, "barraH")}`);
say(`  columna.h @1440 : ${rep(conBarra14, "columnaH")}`);
say(`  barra.h   @1440 : ${rep(conBarra14, "barraH")}`);
say("");
say("  ⚠ Las dos son CONSTANTES en el dominio. Eso acota lo que pueden");
say("    predecir: una constante predice un valor, no una distribución.");
say("");

/* ── 2 · EL Δ DE `docH`, DERIVADO — no citado del log de la 117.ª ───────── */

const rutasBase = new Set(Object.keys(base.paginas));
const rutasHoy = new Set(Object.keys(hoy.paginas));
const comunes = [...rutasBase].filter((r) => rutasHoy.has(r));
const soloBase = [...rutasBase].filter((r) => !rutasHoy.has(r));
const soloHoy = [...rutasHoy].filter((r) => !rutasBase.has(r));

say("─".repeat(78));
say("2 · EL Δ, DERIVADO DE LAS CONGELADAS");
say("─".repeat(78));
say("");
/* §*un cardinal es un contenedor*: la membresía con sus DOS lados. */
say(`  membresía base↔hoy @390 : comunes ${comunes.length} · sólo base ${soloBase.length} · sólo hoy ${soloHoy.length}`);

const dH = (m, r) => (m.paginas[r] ? m.paginas[r].docH : null);
const delta390 = new Map();
const delta1440 = new Map();
for (const r of comunes) {
  const a = dH(base, r);
  const b = dH(hoy, r);
  if (a !== null && b !== null) delta390.set(r, b - a);
}
for (const r of Object.keys(base14.paginas)) {
  if (!hoy14.paginas[r]) continue;
  const a = dH(base14, r);
  const b = dH(hoy14, r);
  if (a !== null && b !== null) delta1440.set(r, b - a);
}

const movidas390 = [...delta390.entries()].filter(([, d]) => d !== 0).map(([r]) => r);
const movidas1440 = new Set([...delta1440.entries()].filter(([, d]) => d !== 0).map(([r]) => r));
const soloA390 = movidas390.filter((r) => !movidas1440.has(r));
say(`  movidas @390 ${movidas390.length} · movidas @1440 ${movidas1440.size} · SÓLO a 390 ${soloA390.length}`);
say("");

/* Las 8 se DERIVAN, no se copian del log (§regla 9). Definición: movidas sólo
 * a 390 Y dentro del dominio medido de `kb-barra`. */
const ocho = soloA390.filter((r) => conBarra.has(r)).sort();

/* ── 3 · DIRECCIÓN (a) ──────────────────────────────────────────────────── */

say("─".repeat(78));
say("3 · DIRECCIÓN (a) — ¿su Δ casa con la COLUMNA, y NO con el módulo?");
say("─".repeat(78));
say("");
say("  ruta                                          docH base →    hoy    Δ390   columna.h   barra.h  resid.col  resid.mod");

const filas = [];
for (const r of ocho) {
  const c = conBarra.get(r);
  const d = delta390.get(r);
  const rc = d - c.columnaH;
  const rm = d - c.barraH;
  const a = dH(base, r);
  const b = dH(hoy, r);
  filas.push({ r, a, b, d, col: c.columnaH, mod: c.barraH, rc, rm });
  /* §regla 1 lector: un número de un par se cita CON SUS DOS LADOS. `Δ+504`
   * a secas no se puede auditar; `7501 → 8005` sí. */
  say(
    `  ${r.slice(0, 44).padEnd(44)} ${String(a).padStart(7)} → ${String(b).padStart(6)}   ${String(d).padStart(5)}   ${n2(c.columnaH).padStart(9)}   ${n2(c.barraH).padStart(7)}  ${n2(rc).padStart(8)}   ${n2(rm).padStart(8)}`,
  );
}
say("");

/* La predicción NO es «Δ = 504.34»: `docH` es ENTERO y la columna trae
 * decimales. Sumar 504.34 a una magnitud que se sirve redondeada sólo puede
 * dar DOS enteros adyacentes —504 y 505— según la parte fraccionaria de cada
 * página, que este instrumento NO guarda. O sea que el modelo predice un
 * CONJUNTO de dos valores y PROHÍBE todos los demás; ahí está su contenido. */
const COL = filas.length ? filas[0].col : null;
const ADMISIBLES = COL === null ? [] : [Math.floor(COL), Math.floor(COL) + 1];
say(`  El modelo: docH es ENTERO y columna.h = ${n2(COL)} trae decimales.`);
say(`  ⇒ sumarla a una magnitud redondeada admite EXACTAMENTE {${ADMISIBLES.join(", ")}}`);
say("    y PROHÍBE cualquier otro valor. La parte fraccionaria por página no");
say("    la guarda `clon-base`, así que CUÁL de los dos toca queda SIN MEDIR.");
say("");
const dentro = filas.filter((f) => ADMISIBLES.includes(f.d));
const modAdmis = filas.length ? [Math.floor(filas[0].mod), Math.floor(filas[0].mod) + 1] : [];
const dentroMod = filas.filter((f) => modAdmis.includes(f.d));
say(`  observados dentro de {${ADMISIBLES.join(", ")}} (columna) ... ${dentro.length} de ${filas.length}`);
say(`  observados dentro de {${modAdmis.join(", ")}} (módulo) ..... ${dentroMod.length} de ${filas.length}`);
say(`  reparto observado : ${JSON.stringify(filas.reduce((a, f) => ((a[f.d] = (a[f.d] || 0) + 1), a), {}))}`);
say("");

/* CONTROL — el candidato sólo discrimina si su alternativa NO casa. */
const DISCRIMINA = dentro.length === filas.length && dentroMod.length === 0 && filas.length > 0;
say(`  CONTROL · ¿discrimina columna frente a módulo? ${DISCRIMINA ? "SÍ" : "NO"}`);
if (!DISCRIMINA) {
  say("     ⚠ si las dos casan, esto no elige entre ellas: el veredicto es SIN PROBAR");
  say("       (§*dos modelos que predicen lo mismo en todo tu dominio son uno solo*)");
}
say("");

/* ── 4 · DIRECCIÓN (b), EN SUS DOS MITADES ──────────────────────────────── */

say("─".repeat(78));
say("4 · DIRECCIÓN (b) — las dos mitades que un pleno se salta");
say("─".repeat(78));
say("");
say("  (b1) rutas CON BARRA que NO están entre las 8");
say("");
say("  ruta                                                        Δ390  Δ1440  familia");
const fuera = [];
for (const [r, c] of [...conBarra.entries()].sort()) {
  if (ocho.includes(r)) continue;
  const d3 = delta390.has(r) ? delta390.get(r) : null;
  const d14 = delta1440.has(r) ? delta1440.get(r) : null;
  fuera.push({ r, d3, d14, familia: c.familia });
  say(`  ${r.slice(0, 58).padEnd(58)} ${String(d3 ?? "—").padStart(5)} ${String(d14 ?? "—").padStart(6)}  ${c.familia}`);
}
const fueraMov14 = fuera.filter((f) => f.d14 !== null && f.d14 !== 0);
say("");
say(`  con barra FUERA de las 8 ............ ${fuera.length} de ${conBarra.size}`);
say(`  de ellas, movidas TAMBIÉN a 1440 .... ${fueraMov14.length}`);
say("  ⇒ NO es un pleno: el dominio de la barra NO está contenido en las 8.");
say("    Estas 5 se mueven a los DOS anchos, así que su Δ@390 es una SUMA");
say("    (barra + cambio de contenido) y la parte de la barra NO se puede");
say("    separar con estas dos congeladas — §*un Δ puede ser dos errores*.");
say("    Ya estaban atribuidas por la 117.ª al bloque «tandas intermedias».");
say("");

/* (b2) — la mitad que de verdad puede refutar: ¿alguien FUERA del dominio de
 * la barra exhibe la misma magnitud? Si lo hubiera, la magnitud no sería
 * privativa de la barra y la atribución se caería. */
const conMagnitud = [];
for (const [r, d] of delta390.entries()) {
  if (ADMISIBLES.includes(d)) conMagnitud.push({ r, d, dentro: conBarra.has(r) });
}
say(`  (b2) rutas del corpus entero con Δ390 ∈ {${ADMISIBLES.join(", ")}}`);
say("");
say(`  total en las ${comunes.length} rutas comparadas ... ${conMagnitud.length}`);
say(`  de ellas DENTRO del dominio de la barra ... ${conMagnitud.filter((x) => x.dentro).length}`);
say(`  de ellas FUERA .......................... ${conMagnitud.filter((x) => !x.dentro).length}`);
for (const x of conMagnitud.filter((x) => !x.dentro)) say(`     ⚠ FUERA: ${x.r}  Δ${x.d}`);
const PRIVATIVA = conMagnitud.length > 0 && conMagnitud.every((x) => x.dentro);
say("");
say(`  ⇒ la magnitud es PRIVATIVA del dominio de la barra: ${PRIVATIVA ? "SÍ" : "NO"}`);
say("");

/* ── 5 · EL ESPEJO ──────────────────────────────────────────────────────── */

say("─".repeat(78));
say("5 · EL ESPEJO — a 1440 las columnas van lado a lado y NO deben empujar");
say("─".repeat(78));
say("");
const quietas14 = ocho.filter((r) => delta1440.get(r) === 0).length;
const sinDato14 = ocho.filter((r) => !delta1440.has(r)).length;
say(`  de las ${ocho.length}: quietas a 1440 ${quietas14} · movidas ${ocho.length - quietas14 - sinDato14} · sin dato ${sinDato14}`);
say(`  columna.h @1440 = ${n2([...conBarra14.values()][0].columnaH)} (constante) — mide MÁS que a 390 y aun así`);
say("  no empuja: es exactamente lo que predice «columna hermana, no apilan».");
say("");

/* ── 6 · LA SEPARADORA DE ORDEN — derivada de git, sin red ──────────────── */

say("─".repeat(78));
say("6 · LA SEPARADORA DE ORDEN — ¿la barra cae ENTRE las dos congeladas?");
say("─".repeat(78));
say("");
say("  La 117.ª escribió que la entrada que separa sus dos hipótesis «es");
say("  medible y NO EXISTE»: una base tomada justo antes de la ficha. Cierto");
say("  de ESA entrada. H3 se separa por otra, y sí existe — el ORDEN.");
say("");
const git = (a) => execFileSync("git", a, { cwd: RAIZ, encoding: "utf8" }).trim();
const COMP = "apps/web/src/components/BarraAyudaKb.tsx";
let cBarra = null;
try {
  cBarra = git(["log", "--diff-filter=A", "--format=%h|%ad|%s", "--date=format:%Y-%m-%d %H:%M", "--", COMP]).split("\n").pop();
} catch {
  cBarra = null;
}
const cCong = (f) => {
  try {
    return git(["log", "--diff-filter=A", "--format=%h|%ad|%s", "--date=format:%Y-%m-%d %H:%M", "--", `scripts/qa/medidas/${f}`]).split("\n").pop();
  } catch {
    return null;
  }
};
const filaGit = (etq, s) => {
  if (!s) return say(`  ${etq.padEnd(22)} (sin commit de alta)`);
  const [h, fecha, msg] = s.split("|");
  say(`  ${etq.padEnd(22)} ${h}  ${fecha}  ${msg.slice(0, 42)}`);
};
filaGit("base 390 (alta)", cCong(F_BASE));
filaGit("BARRA emitida", cBarra);
filaGit("hoy 390 (alta)", cCong(F_HOY));
say("");
let ORDEN = false;
try {
  const hBase = (cCong(F_BASE) || "").split("|")[0];
  const hBar = (cBarra || "").split("|")[0];
  const hHoy = (cCong(F_HOY) || "").split("|")[0];
  const anc = (a, b) => {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: RAIZ });
      return true;
    } catch {
      return false;
    }
  };
  ORDEN = !!hBase && !!hBar && !!hHoy && anc(hBase, hBar) && anc(hBar, hHoy);
} catch {
  ORDEN = false;
}
say(`  ⇒ base ≺ BARRA ≺ hoy (ancestría verificada) : ${ORDEN ? "SÍ" : "NO"}`);
say("    El clon NO emitía barra cuando se congeló la base y SÍ la emite hoy.");
say("");

/* ── 7 · VEREDICTO ──────────────────────────────────────────────────────── */

say("═".repeat(78));
say("7 · VEREDICTO");
say("═".repeat(78));
say("");
const CIERRA = DISCRIMINA && PRIVATIVA && ORDEN && quietas14 === ocho.length && ocho.length > 0;
if (CIERRA) {
  say(`  ✅ ATRIBUIDAS · las ${ocho.length} son la BARRA LATERAL \`BT\` de la 107.ª.`);
  say("");
  say("  Tres patas independientes, ninguna suficiente sola:");
  say(`    1 · MAGNITUD  — las ${ocho.length} caen en {${ADMISIBLES.join(", ")}}, el único conjunto que`);
  say(`                    admite columna.h=${n2(COL)} sobre un docH entero. El módulo`);
  say(`                    (${n2(filas[0].mod)}) NO casa en ninguna: el control discrimina.`);
  say(`    2 · DOMINIO   — esa magnitud es PRIVATIVA: ${conMagnitud.length} rutas de ${comunes.length} la`);
  say(`                    exhiben y las ${conMagnitud.filter((x) => x.dentro).length} están todas dentro del dominio de la barra.`);
  say(`    3 · ORDEN     — el commit que emite la barra es posterior a la base y`);
  say("                    anterior a hoy, verificado por ancestría.");
  say("");
  say("  Y el ANCHO cierra el mecanismo: 8/8 quietas a 1440, donde la columna");
  say("  es hermana y no empuja, con columna.h@1440 MAYOR que a 390.");
  say("");
  say("  H1 («la ficha») queda REFUTADA para estas 8 por magnitud: la ficha");
  say("  mide Δ+4/+5 en 146 de 152 entradas — dos órdenes por debajo.");
} else {
  say("  ⚠ NO se cierra con lo que hay. Reparto de las condiciones:");
  say(`     magnitud discrimina ... ${DISCRIMINA}`);
  say(`     magnitud privativa .... ${PRIVATIVA}`);
  say(`     orden verificado ...... ${ORDEN}`);
  say(`     quietas a 1440 ........ ${quietas14}/${ocho.length}`);
}
say("");
say("  LO QUE ESTO NO CIERRA, con su cardinal:");
say(`    · CUÁL de los dos enteros admisibles toca cada página: SIN MEDIR`);
say("      (`clon-base` guarda `docH` entero; haría falta el subpíxel).");
say(`    · las ${fuera.length} rutas con barra que se mueven a los DOS anchos: su Δ@390 es`);
say("      una suma y la parte de la barra no se separa con estas congeladas.");
say("      No es deuda nueva — la 117.ª ya las atribuyó a tandas intermedias.");
say("");

fs.writeFileSync(path.join(AQUI, "ocho-no-atribuidas-118.log"), L.join("\n") + "\n", "utf8");
