/**
 * ESCALÓN 3 · 118.ª — ADJUDICACIÓN DE **P5** CONTRA EL PRE-REGISTRO
 *
 * Predicado pre-registrado, LITERAL (PASO 0b, commit `24f87e9`):
 *
 *   «P5 · las 413 existentes NO se mueven, a los DOS anchos: `Δ docH = 0` en
 *    413 de 413. REFUTA: cualquiera ≠ 0 — y se lee por |clon − original|
 *    ANTES/DESPUÉS par a par, no por el recuento.»
 *
 * Se corre y se compara contra eso. NO se reescribe el predicado (§regla 8b).
 *
 * ⚠ **Esto NO vuelve a medir**: las dos congeladas ya existen, así que la
 * comparación es OFFLINE. `clon-base --cmp` habría exigido re-recorrer 426
 * rutas × 2 anchos para leer números que ya están en disco.
 *
 * ⚠ **Y el eje del PRE-REGISTRO es `docH`, no `|clon − original|`.** La
 * fórmula que el pre-registro cita es la de §*el eje que no lee como defecto
 * esconde la mejora*, y aquí **no aplica**: `clon-base` es una guarda
 * CLON-CONTRA-CLON —no tiene lado del original— así que la distancia al
 * original no se puede calcular con estos ficheros. Se dice en voz alta en vez
 * de calcular otra cosa y llamarla igual: lo que esta derivación adjudica es
 * **«el clon de hoy contra el clon de ayer»**, que es exactamente lo que P5
 * predice, y **no** fidelidad (§*una guarda solo-clon se lee como verde y no
 * mide fidelidad*).
 *
 * Salida: `p5-adjudicacion-118.log`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MED = path.resolve(AQUI, "../../../../scripts/qa/medidas");

const lee = (f) => {
  const r = path.join(MED, f);
  if (!fs.existsSync(r)) {
    const fam = fs.readdirSync(MED).filter((x) => x.startsWith(f.slice(0, 16)));
    throw new Error(`p5-adjudicacion-118: falta \`${f}\`. Candidatas (${fam.length}):\n  ` + fam.join("\n  "));
  }
  return JSON.parse(fs.readFileSync(r, "utf8"));
};

const ANCHO = Number(process.argv[2] || 1440);
const F_ANTES = `clon-base-${ANCHO}-t117-tras-la-ficha.json`;
const F_HOY = `clon-base-${ANCHO}-t118-tras-el-archivo.json`;

const antes = lee(F_ANTES);
const hoy = lee(F_HOY);

const L = [];
const say = (s = "") => {
  L.push(s);
  console.log(s);
};

say("═".repeat(78));
say(`ESCALÓN 3 · 118.ª — ADJUDICACIÓN DE P5 @${ANCHO}`);
say("═".repeat(78));
say("");
say("Predicado pre-registrado, LITERAL (PASO 0b, `24f87e9`):");
say("  «las 413 existentes NO se mueven, a los DOS anchos: Δ docH = 0 en 413/413»");
say("");
say(`  ANTES : ${F_ANTES}  (${antes.meta.rutas} rutas · ${antes.meta.width}px)`);
say(`  HOY   : ${F_HOY}  (${hoy.meta.rutas} rutas · ${hoy.meta.width}px)`);
say("");

if (antes.meta.width !== hoy.meta.width) throw new Error("p5-adjudicacion-118: los dos lados no son del mismo ancho.");

/* ── 1 · MEMBRESÍA, con sus DOS lados (§*un cardinal es un contenedor*) ─── */

const A = new Set(Object.keys(antes.paginas));
const B = new Set(Object.keys(hoy.paginas));
const nuevas = [...B].filter((r) => !A.has(r)).sort();
const idas = [...A].filter((r) => !B.has(r)).sort();
const comunes = [...A].filter((r) => B.has(r)).sort();

say("─".repeat(78));
say("1 · MEMBRESÍA — diferencia simétrica, nunca el neto");
say("─".repeat(78));
say("");
say(`  comunes ....... ${comunes.length}`);
say(`  NUEVAS ........ ${nuevas.length}   (esperado 13)`);
say(`  desaparecidas . ${idas.length}   (esperado 0)`);
say("");
for (const r of nuevas) say(`     + ${r}`);
for (const r of idas) say(`     - ${r}`);
say("");

/* ── 2 · P5: ¿se movió alguna de las comunes? ───────────────────────────── */

say("─".repeat(78));
say("2 · P5 — el Δ de las rutas COMUNES, par a par");
say("─".repeat(78));
say("");

const movidas = [];
const sinDato = [];
for (const r of comunes) {
  const a = antes.paginas[r];
  const b = hoy.paginas[r];
  if (!a || !b || a.docH == null || b.docH == null) {
    sinDato.push(r);
    continue;
  }
  const d = b.docH - a.docH;
  if (d !== 0) movidas.push({ r, a: a.docH, b: b.docH, d });
}

say(`  comunes con dato ...... ${comunes.length - sinDato.length}`);
say(`  SIN DATO (excluidas) .. ${sinDato.length}`);
for (const r of sinDato) say(`     ⚠ sin docH: ${r}`);
say("");
say(`  MOVIDAS ............... ${movidas.length}   (predicho 0)`);
say(`  quietas ............... ${comunes.length - sinDato.length - movidas.length}`);
say("");

/* Los Δ se publican CON SUS DOS LADOS (§regla 1 lector). */
if (movidas.length) {
  say("  Las movidas, con sus dos lados:");
  for (const m of movidas.sort((x, y) => Math.abs(y.d) - Math.abs(x.d))) {
    say(`     ${m.r.padEnd(56)} ${String(m.a).padStart(7)} → ${String(m.b).padStart(7)}   Δ${m.d > 0 ? "+" : ""}${m.d}`);
  }
  say("");
  /* La DISTRIBUCIÓN, no sólo el recuento: dice si comparten causa. */
  const dist = movidas.reduce((acc, m) => ((acc[m.d] = (acc[m.d] || 0) + 1), acc), {});
  say(`  distribución de Δ : ${JSON.stringify(dist)}`);
  say("");
}

/* ── 3 · Y LOS OTROS EJES QUE `clon-base` GUARDA ────────────────────────── */

say("─".repeat(78));
say("3 · LOS OTROS EJES — porque `docH` solo es el nivel de arriba");
say("─".repeat(78));
say("");
say("  §*la causa común*: un `docH` idéntico puede tapar dos cambios que se");
say("  anulan. Se comprueban también `h1.y`, nº de secciones y nº de anclas.");
say("");

const ejes = { "h1.y": (p) => p.h1?.y ?? null, secciones: (p) => p.secciones?.length ?? null, anclas: (p) => p.nAnclas ?? null };
const movEje = {};
for (const [nombre, f] of Object.entries(ejes)) {
  const m = [];
  for (const r of comunes) {
    const a = f(antes.paginas[r]);
    const b = f(hoy.paginas[r]);
    if (a === null || b === null) continue;
    if (a !== b) m.push({ r, a, b });
  }
  movEje[nombre] = m;
  say(`  ${nombre.padEnd(12)} movidas ${String(m.length).padStart(4)} de ${comunes.length}`);
  for (const x of m.slice(0, 8)) say(`       ${x.r.padEnd(54)} ${String(x.a).padStart(8)} → ${String(x.b).padStart(8)}`);
  if (m.length > 8) say(`       … y ${m.length - 8} más`);
}
say("");

/* ── VEREDICTO ──────────────────────────────────────────────────────────── */

say("═".repeat(78));
say("VEREDICTO");
say("═".repeat(78));
say("");
const P5 = movidas.length === 0;
const P3 = nuevas.length === 13 && idas.length === 0;
const otros = Object.values(movEje).reduce((a, m) => a + m.length, 0);

say(`  P3 · +13 nuevas y 0 desaparecidas ....... ${P3 ? "✅ CONFIRMADO" : "❗ REFUTADO"}  (${nuevas.length} y ${idas.length})`);
say(`  P5 · las comunes no se mueven (docH) .... ${P5 ? "✅ CONFIRMADO" : "❗ REFUTADO"}  (${movidas.length} movidas)`);
say(`       y en los otros 3 ejes ............... ${otros === 0 ? "✅ 0 movidas" : `⚠ ${otros} movidas`}`);
say("");
if (P5 && otros === 0) {
  say("  El archivo de `sector` es ADITIVO: suma 13 rutas y no toca ninguna de");
  say("  las que ya había, en ninguno de los 4 ejes que esta guarda mira.");
  say("");
  say("  ⚠ Y lo que este verde NO dice, que hay que declarar:");
  say("     · es una guarda CLON-CONTRA-CLON. **No mide fidelidad** — compara");
  say("       el clon de hoy con el de ayer, y ayer podía estar mal;");
  say("     · mide alto y estructura. Un defecto de ANCHO que no cambie el nº");
  say("       de renglones no le mueve un píxel (§*la guarda también tiene un");
  say("       NIVEL, y el suyo es vertical*);");
  say("     · la fidelidad de las 13 nuevas la da el cotejo contra la CAPTURA,");
  say("       que es otro instrumento: 12 de 12 ejes a Δ0 en `/sector/edar`.");
}
say("");

fs.writeFileSync(path.join(AQUI, `p5-adjudicacion-118-${ANCHO}.log`), L.join("\n") + "\n", "utf8");
