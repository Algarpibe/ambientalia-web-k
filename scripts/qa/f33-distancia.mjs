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

const [fA, fB] = process.argv.slice(2);
if (!fA || !fB) throw new Error("Uso: node f33-distancia.mjs <antes.json> <despues.json>");

const A = JSON.parse(readFileSync(fA, "utf8"));
const B = JSON.parse(readFileSync(fB, "utf8"));

/** Aplana una página a `eje → {o, c}`, con el mismo criterio en los dos lados. */
function aplana(p) {
  const out = {};
  if (!p.original) return out;
  const num = (v) => (typeof v === "number" ? v : null);
  const put = (k, o, c) => { out[k] = { o: num(o), c: num(c) }; };

  for (const k of ["docH", "base", "nSecciones", "nFilas", "nModulos", "enlaces"])
    put(k, p.original[k], p.clon?.[k]);

  for (const k of Object.keys(p.original.cajas ?? {}))
    for (const d of ["x", "y", "w", "h"])
      put(`caja.${k}.${d}`, p.original.cajas[k]?.[d], p.clon?.cajas?.[k]?.[d]);

  for (const k of Object.keys(p.original.cascaron ?? {}))
    for (const d of ["x", "y", "w", "h"])
      put(`cascaron.${k}.${d}`, p.original.cascaron[k]?.[d], p.clon?.cascaron?.[k]?.[d]);

  return out;
}

const rutas = [...new Set([...Object.keys(A.paginas), ...Object.keys(B.paginas)])].sort();
let sumA = 0, sumB = 0, nLimpio = 0;
let acercan = 0, alejan = 0, igual = 0;
const mixto = { aparecen: [], desaparecen: [], ambosNull: 0 };
const porRuta = {};
const mayores = [];

for (const r of rutas) {
  const a = aplana(A.paginas[r] ?? {});
  const b = aplana(B.paginas[r] ?? {});
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
  if (rN) porRuta[r] = { n: rN, antes: +rA.toFixed(2), despues: +rB.toFixed(2), gana: +(rA - rB).toFixed(2) };
}

console.log(`\n═══ DISTANCIA · ${basename(fA)}  →  ${basename(fB)} ═══`);
console.log(`\n═══ 1 · EL EJE LIMPIO — los pares con número en LOS DOS lados y en las DOS fotos`);
console.log(`  pares comparables      ${nLimpio}`);
console.log(`  Σ|clon−orig| ANTES     ${sumA.toFixed(2)}`);
console.log(`  Σ|clon−orig| DESPUÉS   ${sumB.toFixed(2)}`);
const gana = sumA - sumB;
console.log(`  MOVIMIENTO             ${gana >= 0 ? "−" : "+"}${Math.abs(gana).toFixed(2)} px  ${gana >= 0 ? "← HACIA el original" : "← ALEJÁNDOSE"}`);
console.log(`  reparto                ACERCAN ${acercan} · ALEJAN ${alejan} · iguales ${igual}`);

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
