/**
 * ¿QUÉ DESCANSA SOBRE EL LADO DE 390 DE `f33-geo`? — derivación de la 104.ª, PASO 0·A.
 * Uso: node docs/research/cola-larga/derivaciones/caducidad-geo390.mjs
 *
 * §regla 5bis: **arreglar un instrumento no arregla sus medidas, LAS CADUCA.**
 * La 102.ª fichó que el lado de 390 de `qa:f33-geo` se midió sin las hojas
 * enlazadas (§F3-3-GEO-390-SIN-HOJAS-ENLAZADAS). La regla exige tres cosas, y
 * la primera es la que esta derivación paga:
 *
 *   > **el alcance del daño se declara con su número, y casi nunca es «todo»**.
 *
 * Todo lo de aquí sale de congeladas ya commiteadas. NO se toca `f33-geo`
 * (fuera de alcance por encargo) y NO se mide nada en vivo: si hiciera falta el
 * original para contestar, la respuesta sería «no se sabe», no una estimación.
 *
 * Las cuatro preguntas, y ninguna se contesta de memoria:
 *
 *   1 · de las N celdas de veredicto, ¿cuántas las decide el lado de 390?
 *   2 · de ésas, ¿en cuántas el defecto MUEVE de verdad el número de entrada?
 *       (que no es lo mismo: una celda puede depender de 390 y que el defecto
 *        no toque su eje)
 *   3 · ¿alguna cambia de VEREDICTO? — que es lo único que llega al modelo
 *   4 · ¿depende de esto la comparación a 390 de esta tanda?
 *
 * La 2 y la 3 se pueden contestar porque `qa:f33-clases` midió los MISMOS 31
 * documentos a 390 por los DOS caminos y congeló las dos corridas. O sea que el
 * tratamiento está aplicado y medido, no razonado (§CUANDO EL CAMBIO SE PUEDA
 * APLICAR, APLÍCALO Y MIDE).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts/qa/medidas");
const lee = (n) => JSON.parse(readFileSync(join(MED, n), "utf8"));

/* ⚠ el nombre CANÓNICO `f33-geo.json` lo liberó esta misma tanda (§regla 5bis):
 * lo que no se haya re-medido tiene que fallar EN VOZ ALTA en vez de leer lo
 * caducado. Esta derivación lee la caducada A PROPÓSITO — es su objeto. */
const GEO = lee("f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json");
const CL_BUENO = lee("f33-clases.json");
const CL_MALO = lee(
  "f33-clases-SONDA-MEDIA-390-CON-setViewport-QUE-RECARGA-Y-PIERDE-LAS-HOJAS-ENLAZADAS-2026-08-24.json",
);
const CMP390 = lee("f33-cmp-390-neg-mismo-lado.json");

let rojo = 0;
const err = (m) => { rojo++; console.log(`\n❌ ${m}`); };

console.log(`\n══════════════════════════════════════════════════════════════════════`);
console.log(`  CADUCIDAD DEL LADO 390 DE \`f33-geo\` — alcance DERIVADO (104.ª · PASO 0·A)`);
console.log(`══════════════════════════════════════════════════════════════════════`);
console.log(`  fuentes (todas congeladas y commiteadas):`);
console.log(`    · f33-geo-SONDA-390-SIN-HOJAS-…    ${GEO.meta.fecha}  (la CADUCADA, renombrada por esta tanda)`);
console.log(`    · f33-clases.json                   ${CL_BUENO.meta.fecha}  (390 por el camino BUENO)`);
console.log(`    · f33-clases-…-QUE-RECARGA-….json   ${CL_MALO.meta.fecha}  (390 por el camino VIEJO)`);
console.log(`    · f33-cmp-390-neg-mismo-lado.json   ${CMP390.meta.fecha}  (el comparador, a 390)`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · ¿QUÉ BLOQUES DE `f33-geo` LEEN EL LADO DE 390?
 *
 * Se deriva del CÓDIGO de la sonda, no de la congelada: la congelada no dice de
 * qué ancho salió cada bloque. `f33-geo.mjs` construye `todosMod1440`,
 * `todasFilas`, `todasCols` y `todasSecs` a partir de `d[1440]` (líneas 350-354),
 * así que todo lo que se derive de ahí es de 1440 y el defecto no lo alcanza.
 * El único consumidor de `mod390` es el test A (línea 541).
 * ══════════════════════════════════════════════════════════════════════════ */
const FUENTE = join(RAIZ, "scripts/qa/f33-geo.mjs");
const SRC = readFileSync(FUENTE, "utf8");
const usos390 = SRC.split("\n")
  .map((l, i) => [i + 1, l])
  .filter(([, l]) => /\b(mod390|d\[390\]|en390)\b/.test(l));

console.log(`\n── 1 · LOS BLOQUES QUE LEEN 390, derivados del fuente ─────────────────`);
console.log(`   líneas de \`f33-geo.mjs\` que tocan el lado de 390: ${usos390.length}`);
for (const [n, l] of usos390) console.log(`     ${String(n).padStart(4)}: ${l.trim().slice(0, 96)}`);
if (usos390.length === 0) err(`0 líneas casan \`mod390|d[390]|en390\` en ${FUENTE}: eso no es «no usa 390», es que el patrón no casó (§sondas 4).`);

const BLOQUES = Object.keys(GEO).filter((k) => k !== "meta");
console.log(`\n   bloques de primer nivel en la congelada: ${BLOQUES.length} — ${BLOQUES.join(" · ")}`);
console.log(`   de 1440 (INTACTOS): anchoDeFilaPorRegimen · separabilidadFilaColumna · defaultMbPorAnchoDeFila`);
console.log(`                       anchoPctPorDisplay · criterioDeRecuento · porTipo · ejesSinEscribir · corteLimpio2`);
console.log(`   con 390 dentro:     veredictos (sólo su campo \`A\`) · paginas[].modulos390`);

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LAS CELDAS DE VEREDICTO — cuántas las DECIDE el lado de 390
 *
 * `f33-geo.mjs` §5d resuelve en cascada: soloCero → test B → anchoPct no
 * concluyente → test A. Sólo se llega a A cuando las tres de arriba no
 * deciden, así que la clasificación se reproduce aquí con el mismo orden.
 * ══════════════════════════════════════════════════════════════════════════ */
const V = GEO.veredictos;
const clasifica = (k, v) => {
  if (v.soloCero) return ["1440", "SIN ESCRIBIR · valor inicial"];
  if (v.paginasQueVarian > 0) return ["1440", "CAMPO (test B, intra-página)"];
  if (k.endsWith(".anchoPct")) return ["1440", "SIN PROBAR · el test A no aplica a la caja"];
  if (v.A.igual > 0 && v.A.mueve === 0) return ["390", "CAMPO (test A: px absolutos)"];
  if (v.A.mueve > 0 && v.A.igual === 0) return ["390", "plantilla (test A: se mueve)"];
  if (v.A.mueve > 0 && v.A.igual > 0) return ["390", "MIXTO"];
  return ["390", "SIN PROBAR (0 pares)"];
};

const porFuente = { 1440: [], 390: [] };
const porClase = {};
for (const [k, v] of Object.entries(V)) {
  const [fuente, clase] = clasifica(k, v);
  /* control: la clasificación reproducida tiene que coincidir con el `ver`
   * congelado. Si no, esta derivación está clasificando por su cuenta. */
  if (!v.ver.startsWith(clase.split(" ·")[0].split(" (")[0])) {
    err(`la reclasificación de \`${k}\` no reproduce el veredicto congelado: «${clase}» vs «${v.ver}»`);
  }
  porFuente[fuente].push(k);
  (porClase[`${fuente} · ${clase}`] ??= []).push(k);
}

console.log(`\n── 2 · LAS CELDAS DE VEREDICTO ────────────────────────────────────────`);
console.log(`   total: ${Object.keys(V).length}   ·   decididas a 1440: ${porFuente[1440].length}   ·   decididas por el test A (390): ${porFuente[390].length}`);
for (const [c, ks] of Object.entries(porClase).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n     ${String(ks.length).padStart(2)}  ${c}`);
  console.log(`         ${ks.join(" · ")}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · ¿QUÉ MUEVE EL DEFECTO DE VERDAD? — las dos corridas de `f33-clases`
 *
 * Depender del lado de 390 y estar CONTAMINADO no es lo mismo: el defecto sólo
 * mueve los ejes cuya declaración GANADORA cambia al perder las hojas
 * enlazadas. Eso está medido, sobre los mismos 31 documentos, por los dos
 * caminos.
 * ══════════════════════════════════════════════════════════════════════════ */
const llave = (r) => `${r.selector} | ${r.prop}`;
const MALO = new Map(CL_MALO.reglas.map((r) => [llave(r), r]));
const movidas = [], iguales = [], sinPar = [];
for (const r of CL_BUENO.reglas) {
  const o = MALO.get(llave(r));
  if (!o) { sinPar.push(llave(r)); continue; }
  const d = (x) => JSON.stringify(x ?? null);
  if (d(r.declarado390) === d(o.declarado390) && d(r.computado390) === d(o.computado390)) iguales.push(llave(r));
  else movidas.push({ k: llave(r), bd: d(r.declarado390), md: d(o.declarado390), bc: d(r.computado390), mc: d(o.computado390) });
}

console.log(`\n── 3 · QUÉ MUEVE EL DEFECTO, medido por los dos caminos ───────────────`);
console.log(`   reglas de \`f33-clases\`: ${CL_BUENO.reglas.length}  ·  emparejadas ${iguales.length + movidas.length}  ·  SIN PAR ${sinPar.length}`);
if (sinPar.length) console.log(`     sin par (existen por el camino bueno y no por el viejo): ${sinPar.join(" · ")}`);
console.log(`   @390 IGUALES por los dos caminos: ${iguales.length}   ·   MOVIDAS: ${movidas.length}`);
for (const m of movidas) {
  console.log(`\n     ${m.k}`);
  if (m.bd !== m.md) console.log(`        declarado  bueno=${m.bd}   viejo=${m.md}`);
  if (m.bc !== m.mc) console.log(`        computado  bueno=${m.bc}   viejo=${m.mc}`);
}
if (movidas.length === 0) err(`0 reglas movidas entre los dos caminos: el defecto está medido en 6 de 6 rutas (§F3-3-GEO-390-SIN-HOJAS-ENLAZADAS), así que un 0 aquí es del emparejamiento, no del dato.`);

/* Los ejes de RITMO que el defecto mueve, por nombre — que es lo que hay que
 * cruzar con las celdas del test A. */
const EJE_DE_PROP = { "margin-top": "mt", "margin-bottom": "mb", "padding-top": "pt", "padding-bottom": "pb" };
const ejesMovidos = new Set();
for (const m of movidas) {
  const prop = m.k.split(" | ")[1];
  if (EJE_DE_PROP[prop]) ejesMovidos.add(EJE_DE_PROP[prop]);
}
console.log(`\n   ejes de RITMO que el defecto mueve: ${[...ejesMovidos].join(" · ") || "(ninguno)"}`);
console.log(`   ejes de RITMO intactos:             ${["mt", "mb", "pt", "pb"].filter((e) => !ejesMovidos.has(e)).join(" · ")}`);

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · ¿CAMBIA ALGÚN VEREDICTO? — el cruce que decide el alcance real
 *
 * El defecto sólo mueve `padding-top`/`padding-bottom` de `.f33-modulo`, y sólo
 * en su valor en `em` (`0.5em!`/`0.6em!` → `0.3em`). Así que hay que ver QUÉ
 * TIPO lleva ese `em`: se deriva del propio `f33-geo`, comparando el valor a
 * 1440 con el que la corrida buena de `f33-clases` mide a 390.
 * ══════════════════════════════════════════════════════════════════════════ */
const modsPorTipo = {};
for (const p of GEO.paginas) {
  for (const m of p.modulos1440) ((modsPorTipo[m.tipo] ??= { a1440: {}, a390: {} }).a1440[`${m.pt}|${m.pb}`] ??= 0, modsPorTipo[m.tipo].a1440[`${m.pt}|${m.pb}`]++);
  for (const m of p.modulos390) ((modsPorTipo[m.tipo] ??= { a1440: {}, a390: {} }).a390[`${m.pt}|${m.pb}`] ??= 0, modsPorTipo[m.tipo].a390[`${m.pt}|${m.pb}`]++);
}

/* el `em` bueno y el `em` viejo, leídos de las dos corridas */
const rPT = CL_BUENO.reglas.find((r) => r.selector === ".f33-modulo" && r.prop === "padding-top");
const rPB = CL_BUENO.reglas.find((r) => r.selector === ".f33-modulo" && r.prop === "padding-bottom");
const rPTm = MALO.get(".f33-modulo | padding-top");
const rPBm = MALO.get(".f33-modulo | padding-bottom");
if (!rPT || !rPB || !rPTm || !rPBm) err(`no se encontraron las reglas de padding de \`.f33-modulo\` en una de las dos corridas (§sondas 4)`);

console.log(`\n── 4 · ¿CAMBIA ALGÚN VEREDICTO? ───────────────────────────────────────`);
console.log(`   pt/pb de \`.f33-modulo\` computados:`);
console.log(`     @1440            ${JSON.stringify(rPT?.computado1440)} / ${JSON.stringify(rPB?.computado1440)}`);
console.log(`     @390 camino BUENO ${JSON.stringify(rPT?.computado390)} / ${JSON.stringify(rPB?.computado390)}`);
console.log(`     @390 camino VIEJO ${JSON.stringify(rPTm?.computado390)} / ${JSON.stringify(rPBm?.computado390)}`);

console.log(`\n   pt|pb por tipo (todas las instancias):`);
console.log(`     ${"tipo".padEnd(18)} ${"@1440".padEnd(30)} @390 (en la congelada CADUCADA)`);
const afectados = [];
for (const [t, v] of Object.entries(modsPorTipo).sort()) {
  const a = JSON.stringify(v.a1440), b = JSON.stringify(v.a390);
  const marca = a !== b ? "   ⚠ DIFIERE" : "";
  console.log(`     ${t.padEnd(18)} ${a.padEnd(30)} ${b}${marca}`);
  if (a !== b) afectados.push(t);
}

/* El cruce final: de las celdas decididas por el test A, cuáles tocan un eje
 * movido Y un tipo cuyo pt/pb difiere entre anchos por culpa del defecto. */
const celdasA = porFuente[390];
const contaminadas = celdasA.filter((k) => {
  const [tipo, eje] = k.split(".");
  return ejesMovidos.has(eje) && afectados.includes(tipo);
});
const intactasA = celdasA.filter((k) => !contaminadas.includes(k));

console.log(`\n   de las ${celdasA.length} celdas decididas por el test A:`);
console.log(`     CONTAMINADAS (el defecto mueve su entrada): ${contaminadas.length} — ${contaminadas.join(" · ") || "(ninguna)"}`);
console.log(`     intactas (el defecto no toca su eje/tipo):  ${intactasA.length} — ${intactasA.join(" · ")}`);

/**
 * ⚠ Y la precisión que separa DOS afirmaciones que se escriben casi igual: el
 * campo `A` está contaminado en más celdas de las que lo LEEN. `A` se publica
 * siempre; sólo lo lee el veredicto cuando `soloCero` y el test B no deciden.
 * Decir «2 contaminadas» sin esto sería cierto del veredicto y falso de la
 * congelada — y quien lea `A` directamente se lo encontraría.
 */
const conAcontaminado = Object.keys(V).filter((k) => {
  const [tipo, eje] = k.split(".");
  return ejesMovidos.has(eje) && afectados.includes(tipo);
});
const contaminadoNoLeido = conAcontaminado.filter((k) => !celdasA.includes(k));
console.log(`\n   ⚠ el campo \`A\` está CONTAMINADO en ${conAcontaminado.length} celdas — ${conAcontaminado.join(" · ")}`);
console.log(`     de ésas, el veredicto lo LEE en ${contaminadas.length}: ${contaminadas.join(" · ")}`);
console.log(`     y en ${contaminadoNoLeido.length} NO lo lee (deciden \`soloCero\` o el test B, los dos a 1440): ${contaminadoNoLeido.join(" · ")}`);
console.log(`     ⇒ su \`ver\` es bueno y su \`A\` no se puede citar.`);

/* ¿el veredicto se INVIERTE? Se recalcula con el valor bueno de 390. */
console.log(`\n   recálculo con el 390 BUENO — el veredicto que llega al modelo:`);
for (const k of contaminadas) {
  const [tipo, eje] = k.split(".");
  const v = V[k];
  const v1440 = Number(v.valoresDistintos[0]);
  const bueno = eje === "pt" ? rPT?.computado390 : rPB?.computado390;
  const casa = bueno?.includes(v1440);
  const nuevo = casa ? "CAMPO (test A: px absolutos)" : "plantilla (test A: se mueve)";
  const flip = nuevo !== v.ver ? "  ⚠⚠ SE INVIERTE" : "  (no cambia)";
  console.log(`     ${k.padEnd(14)} @1440 ${String(v1440).padEnd(6)} · @390 bueno ${JSON.stringify(bueno)}`);
  console.log(`        congelado: «${v.ver}»`);
  console.log(`        con el 390 bueno: «${nuevo}»${flip}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · ¿DEPENDE DE ESTO LA COMPARACIÓN A 390 DE ESTA TANDA?
 *
 * §El principio: no se contesta leyendo el código, se contesta con la salida
 * SERVIDA — y ya está congelada y commiteada desde el 2026-08-22 (§regla 8b:
 * `medidas/` es una muestra del original que nadie interroga).
 * ══════════════════════════════════════════════════════════════════════════ */
console.log(`\n── 5 · ¿DEPENDE LA COMPARACIÓN A 390 DE ESTA TANDA? ───────────────────`);
const CMP = readFileSync(join(RAIZ, "scripts/qa/f33-cmp.mjs"), "utf8").split("\n");
const li = (re) => CMP.findIndex((l) => re.test(l)) + 1;
const GEOL = SRC.split("\n");
const lig = (re) => GEOL.findIndex((l) => re.test(l)) + 1;
console.log(`   el ORDEN, derivado del fuente (es el discriminador mecánico):`);
console.log(`     f33-cmp  · preparaViewport ${String(li(/^\s*await preparaViewport\(off\)/)).padStart(4)}  →  goto ${String(li(/^\s*await off\.goto/)).padStart(4)}  →  setContent ${String(li(/^\s*await off\.setContent/)).padStart(4)}   ⇒ el viewport se fija ANTES de montar`);
console.log(`     f33-geo  · goto ${String(lig(/^\s*await page\.goto/)).padStart(4)}  →  setContent ${String(lig(/^\s*await page\.setContent/)).padStart(4)}  →  setViewport ${String(lig(/isMobile: true/)).padStart(4)}   ⇒ el \`isMobile\` llega DESPUÉS ⇒ RECARGA`);

const anchosOrig = [];
for (const [ruta, p] of Object.entries(CMP390.paginas)) {
  for (const [f, w] of Object.entries(p.original.anchos ?? {})) anchosOrig.push({ ruta, f, w });
}
const reparto = {};
for (const a of anchosOrig) reparto[a.w] = (reparto[a.w] || 0) + 1;
console.log(`\n   la SALIDA SERVIDA de \`f33-cmp\` a 390 (lado ORIGINAL, ${Object.keys(CMP390.paginas).length} páginas del piloto):`);
console.log(`     anchos de fila medidos: ${anchosOrig.length}  ·  reparto ${JSON.stringify(reparto)}`);
const BUENO_390 = 335.39, MALOS_390 = [312, 249.59];
const nBueno = anchosOrig.filter((a) => a.w === BUENO_390).length;
const nMalo = anchosOrig.filter((a) => MALOS_390.includes(a.w)).length;
console.log(`     con el valor BUENO (${BUENO_390}): ${nBueno} de ${anchosOrig.length}   ·   con los del defecto (${MALOS_390.join("/")}): ${nMalo}`);
if (anchosOrig.length === 0) err(`0 anchos de fila en la congelada de \`f33-cmp\` a 390: sin eso esta pregunta no está contestada, sólo argumentada.`);

const dependeCmp = nMalo > 0;
console.log(`\n   ⇒ ${dependeCmp ? "❌ SÍ depende: el comparador arrastra el mismo defecto" : "✅ NO depende: `f33-cmp` mide 390 con las hojas puestas"}`);

/* ══════════════════════════════════════════════════════════════════════════ */
console.log(`\n══ RESUMEN — el alcance del daño, con su número ═══════════════════════`);
console.log(`   celdas de veredicto             ${Object.keys(V).length}`);
console.log(`     · decididas a 1440 (INTACTAS) ${porFuente[1440].length}`);
console.log(`     · decididas por el test A     ${porFuente[390].length}`);
console.log(`         de ésas, CONTAMINADAS     ${contaminadas.length}   (${contaminadas.join(" · ") || "—"})`);
console.log(`         de ésas, que se INVIERTEN ${contaminadas.filter((k) => { const [, e] = k.split("."); const v = V[k]; const b = e === "pt" ? rPT?.computado390 : rPB?.computado390; const n = b?.includes(Number(v.valoresDistintos[0])) ? "CAMPO (test A: px absolutos)" : "plantilla (test A: se mueve)"; return n !== v.ver; }).length}`);
console.log(`   bloques de primer nivel         ${BLOQUES.length}  ·  con 390 dentro: 2 (veredictos.A · paginas[].modulos390)`);
console.log(`   módulos con 390 crudo           ${GEO.paginas.reduce((a, p) => a + p.modulos390.length, 0)}  (w/wCol/wFila resueltos contra el 80 %, no el 86 %)`);
console.log(`   comparación a 390 de esta tanda ${dependeCmp ? "DEPENDE" : "NO depende"}`);
console.log(`\n${rojo === 0 ? "✅" : "❌"} caducidad-geo390: ${rojo} control(es) en rojo\n`);
process.exit(rojo === 0 ? 0 : 2);
