/**
 * ANTES vs DESPUÉS de `f33-cmp` — por DISTANCIA, no por recuento.
 * Uso: node scripts/qa/f33-distancia.mjs <antes.json> <despues.json>
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO SIRVE EL TITULAR DEL COMPARADOR
 *
 * `CLAUDE.md` §*el eje que no lee como defecto esconde la MEJORA exactamente
 * igual que esconde la deriva*: la 106.ª movió **31 164 elementos** y el
 * titular —`pares distintos`— dio **113 contra 112**, o sea **mudo**, mientras
 * `Σ|clon−orig|` bajaba **8 600 px**. Leído por el titular, el veredicto habría
 * sido *«el cambio no hace nada»* y el paso siguiente, revertirlo.
 *
 * > **La lectura que discrimina no es un recuento: es comparar
 * > `|clon − original|` ANTES y DESPUÉS, par a par.** El recuento dice cuántos
 * > pares difieren; sólo la distancia dice **hacia dónde se movieron**.
 *
 * ── Y el eje MIXTO va SOLO, con su cardinal ───────────────────────────────
 * Un par cuyo lado del clon es `null` —una propiedad que el clon no emite— no
 * tiene distancia: **no se puede restar**. Meterlo en la suma con un 0 lo
 * contaría como «encaja», y meterlo con el valor del original lo contaría como
 * error máximo. Las dos son falsas, así que va **fuera del total y publicado
 * con su cardinal** (§regla 14 · §los ejes excluidos se reparten igual).
 *
 * Y dentro del mixto se separa lo que la 88.ª aprendió: **APARECER no es
 * ALEJARSE**. Un par que pasa de `null` a un número **no es un alejamiento**:
 * es una propiedad que el clon **no emitía y ahora emite**, que es justo lo que
 * un escalón de construcción viene a hacer.
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { Evaluadas } from "./lib.mjs";

const [fA, fB] = process.argv.slice(2);
if (!fA || !fB) throw new Error("Uso: node f33-distancia.mjs <antes.json> <despues.json>");

const A = JSON.parse(readFileSync(fA, "utf8"));
const B = JSON.parse(readFileSync(fB, "utf8"));

/**
 * ⚠⚠ **UN RECT `{0,0,0,0}` NO ES UNA MEDIDA: ES UN ELEMENTO SIN CAJA — y la
 * primera versión de esto lo metió en la suma como si fuera dato.**
 *
 * `CLAUDE.md` §*lo que no tiene caja no es que no se cuente, es que NO SE PUEDE
 * MEDIR, y aun así devuelve números*: `getBoundingClientRect` sobre un elemento
 * dentro de un desplegable cerrado devuelve ceros, y esos ceros **entran en una
 * distribución como si fueran dato, fabricando un pico que el original no
 * tiene**.
 *
 * Medido, y le dio la vuelta al veredicto: a 390 el original de
 * `/es/centro-de-ayuda/kunak-air/` trae `nSecciones: 7` **y `sec1..sec6` a
 * `{0,0,0,0}`** —secciones sin caja—, mientras el clon las emite con `h: 161`.
 * Comparar el `y` real del clon contra un `0` inexistente daba **36 pares
 * «ALEJA» de exactamente 504.35** —el alto de la barra— y un titular de
 * **+12465.64 ALEJÁNDOSE**, cuando lo que la barra hizo en esa página fue
 * **acercar `sec0.y` de |Δ| 650.34 a 146.00**.
 *
 * Se excluyen **los cuatro ejes del rect a la vez** (no sólo el `w`/`h`), porque
 * el elemento entero es el que no tiene caja, y se publican **con su cardinal**.
 */
const sinCaja = (rect) => !rect || (rect.w === 0 && rect.h === 0);

/** Aplana una página a `eje → {o, c}`, con el mismo criterio en los dos lados. */
function aplana(p, fuera) {
  const out = {};
  if (!p.original) return out;
  const num = (v) => (typeof v === "number" ? v : null);
  const put = (k, o, c) => { out[k] = { o: num(o), c: num(c) }; };

  for (const k of ["docH", "nSecciones", "nFilas", "nModulos", "enlaces"])
    put(k, p.original[k], p.clon?.[k]);

  /**
   * ⚠ **`base` (la `y` del `h1`) TIENE EL MISMO CENTINELA, y por eso va aparte.**
   * `f33-cmp` escribe **0** cuando el `h1` no tiene caja, igual que escribe
   * `{0,0,0,0}` en un rect. Y en esta familia pasa de verdad: `kb-spec` lo tiene
   * medido por su cuenta —`h1Oculto: 6`— y el `<h1>` **está en el marcado** de
   * las 3 rutas (grep: ×1 en cada una), o sea que existe y **está oculto**.
   *
   * Restar `799.92 − 0` daba **8 pares «ALEJA» de 504.34** —el alto de la
   * barra— sobre un `h1` que el original no pinta. No es una distancia: es una
   * DIFERENCIA DE PRESENCIA, y va a su cubo con su cardinal.
   *
   * ⚠ Que el clon SÍ pinte ahí un `h1` es un defecto real, pero **PRE-EXISTENTE**:
   * §*el discriminador es el corte CREA / MUEVE* — el par ya difería (|Δ| 295.58)
   * y la barra sólo le cambió la magnitud. **0 pares creados.**
   */
  if (p.original.base === 0 && (p.clon?.base ?? 0) !== 0) fuera?.push("base(h1 sin caja)");
  else put("base", p.original.base, p.clon?.base);

  for (const grupo of ["cajas", "cascaron"]) {
    const pre = grupo === "cajas" ? "caja" : "cascaron";
    for (const k of Object.keys(p.original[grupo] ?? {})) {
      const ro = p.original[grupo][k];
      if (sinCaja(ro)) { fuera?.push(`${pre}.${k}`); continue; }
      for (const d of ["x", "y", "w", "h"])
        put(`${pre}.${k}.${d}`, ro?.[d], p.clon?.[grupo]?.[k]?.[d]);
    }
  }

  return out;
}

const rutas = [...new Set([...Object.keys(A.paginas), ...Object.keys(B.paginas)])].sort();

/* ── EL CONTRATO DE `Evaluadas` (§4bis) ────────────────────────────────────
 * Esta sonda no abre navegador y no congela, pero **sí evalúa unidades**, así
 * que no se exime con `SIN_CONTRATO` — mismo criterio que `kb-tests.mjs`.
 *
 * ⚠ EL MÍNIMO SE DERIVA DE LA UNIÓN DE LAS DOS FOTOS, no del recuento que la
 * corrida produce (§4bis: *derivarlo es mejor que escribirlo, porque una ruta
 * nueva sube el listón sola*). Y son DOS conjuntos distintos a propósito
 * (§regla 17: *un sabotaje que comparte variable con el mínimo mueve la
 * portería*):
 *   · el MÍNIMO  = rutas de la unión ......... lo que habría que comparar;
 *   · el CONTADOR = rutas con ≥1 par limpio ... lo que se comparó de verdad.
 * Una ruta que está en una foto y no en la otra suma al primero y no al
 * segundo, así que sale **en rojo** en vez de desaparecer del informe — que es
 * justo la clase «0 comparado = verde» que este contrato existe para cerrar.
 * Si la unión es 0, `Evaluadas` TIRA: una sonda que no sabe cuántas unidades
 * debería evaluar no puede afirmar que las evaluó. */
const ev = new Evaluadas({ nombre: "f33-distancia", unidad: "rutas", minimo: rutas.length });

let sumA = 0, sumB = 0, nLimpio = 0;
let acercan = 0, alejan = 0, igual = 0;
const mixto = { aparecen: [], desaparecen: [], ambosNull: 0 };
const porRuta = {};
const mayores = [];

const fueraA = [], fueraB = [];
for (const r of rutas) {
  const a = aplana(A.paginas[r] ?? {}, fueraA);
  const b = aplana(B.paginas[r] ?? {}, fueraB);
  const ejes = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  let rA = 0, rB = 0, rN = 0;
  for (const e of ejes) {
    const pa = a[e], pb = b[e];
    if (!pa || !pb) continue;
    const dA = pa.o !== null && pa.c !== null ? Math.abs(pa.c - pa.o) : null;
    const dB = pb.o !== null && pb.c !== null ? Math.abs(pb.c - pb.o) : null;

    if (dA === null && dB !== null) { mixto.aparecen.push({ ruta: r, eje: e, o: pb.o, c: pb.c }); continue; }
    if (dA !== null && dB === null) { mixto.desaparecen.push({ ruta: r, eje: e }); continue; }
    if (dA === null && dB === null) { mixto.ambosNull++; continue; }

    nLimpio++; rN++;
    sumA += dA; sumB += dB; rA += dA; rB += dB;
    if (dB < dA - 0.005) { acercan++; mayores.push({ ruta: r, eje: e, dA, dB, gana: dA - dB }); }
    else if (dB > dA + 0.005) { alejan++; mayores.push({ ruta: r, eje: e, dA, dB, gana: dA - dB }); }
    else igual++;
  }
  if (rN) { porRuta[r] = { n: rN, antes: +rA.toFixed(2), despues: +rB.toFixed(2), gana: +(rA - rB).toFixed(2) }; ev.ok(); }
}

console.log(`\n═══ DISTANCIA · ${basename(fA)}  →  ${basename(fB)} ═══`);
console.log(`\n═══ 1 · EL EJE LIMPIO — los pares con número en LOS DOS lados y en las DOS fotos`);
console.log(`  pares comparables      ${nLimpio}`);
console.log(`  Σ|clon−orig| ANTES     ${sumA.toFixed(2)}`);
console.log(`  Σ|clon−orig| DESPUÉS   ${sumB.toFixed(2)}`);
const gana = sumA - sumB;
console.log(`  MOVIMIENTO             ${gana >= 0 ? "−" : "+"}${Math.abs(gana).toFixed(2)} px  ${gana >= 0 ? "← HACIA el original" : "← ALEJÁNDOSE"}`);
console.log(`  reparto                ACERCAN ${acercan} · ALEJAN ${alejan} · iguales ${igual}`);

/* §regla 14: una limitación sin su cardinal se lee como una nota al pie. Estos
 * ejes se EXCLUYEN del total, así que su número va al lado del total o el total
 * afirma más de lo que midió. */
console.log(`\n═══ 1b · SIN CAJA EN EL ORIGINAL — excluidos del total, con su cardinal`);
console.log(`  rects \`{0,0,0,0}\` en el ORIGINAL: ANTES ${fueraA.length} · DESPUÉS ${fueraB.length}  (×4 ejes cada uno)`);
console.log(`  Un elemento sin caja NO devuelve geometría: devuelve ceros. Restarlos fabrica`);
console.log(`  un pico que el original no tiene — aquí valían +12465.64 de «ALEJÁNDOSE» falso.`);
{
  const porGrupo = {};
  for (const k of fueraB) {
    const g = k.replace(/\.sec\d+$/, ".sec*");
    porGrupo[g] = (porGrupo[g] || 0) + 1;
  }
  for (const [k, n] of Object.entries(porGrupo).sort((x, y) => y[1] - x[1]).slice(0, 8))
    console.log(`     ${k.padEnd(20)} ×${n}`);
}

console.log(`\n═══ 2 · EL EJE MIXTO — sin distancia, FUERA del total y con su cardinal`);
console.log(`  APARECEN (null → número): ${mixto.aparecen.length}   ← el clon NO emitía y ahora emite. NO es alejarse`);
console.log(`  DESAPARECEN (número → null): ${mixto.desaparecen.length}`);
console.log(`  null en las dos fotos: ${mixto.ambosNull}`);
const porEje = {};
for (const m of mixto.aparecen) porEje[m.eje] = (porEje[m.eje] || 0) + 1;
for (const [e, n] of Object.entries(porEje).sort((x, y) => y[1] - x[1]).slice(0, 12))
  console.log(`     ${e.padEnd(24)} ×${n}`);
if (mixto.desaparecen.length) {
  console.log(`  ⚠ los que DESAPARECEN, que sí serían regresión:`);
  for (const m of mixto.desaparecen.slice(0, 12)) console.log(`     ${m.ruta.padEnd(48)} ${m.eje}`);
}

console.log(`\n═══ 3 · POR RUTA — sólo las que se movieron`);
const movidas = Object.entries(porRuta).filter(([, v]) => Math.abs(v.gana) > 0.005).sort((a, b) => Math.abs(b[1].gana) - Math.abs(a[1].gana));
console.log(`  ${movidas.length} de ${Object.keys(porRuta).length} rutas se mueven`);
for (const [r, v] of movidas)
  console.log(`     ${r.padEnd(56)} ${String(v.antes).padStart(10)} → ${String(v.despues).padStart(10)}  ${v.gana >= 0 ? "−" : "+"}${Math.abs(v.gana).toFixed(2)}`);

console.log(`\n═══ 4 · LOS 20 PARES QUE MÁS SE MUEVEN`);
for (const m of mayores.sort((a, b) => Math.abs(b.gana) - Math.abs(a.gana)).slice(0, 20))
  console.log(`     ${m.ruta.replace("/es/", "").padEnd(46)} ${m.eje.padEnd(20)} |Δ| ${m.dA.toFixed(2).padStart(9)} → ${m.dB.toFixed(2).padStart(9)}  ${m.gana >= 0 ? "acerca" : "ALEJA "} ${Math.abs(m.gana).toFixed(2)}`);

/* La línea de unidades: `31/31 rutas`. El gancho de `exit` fuerza el veredicto
 * aunque nadie llame aquí, pero se llama para que la línea salga UNA vez y en
 * su sitio (§regla 1: lo que imprime y lo que cuenta no pueden discrepar). */
console.log("");
process.exitCode = ev.informe();
