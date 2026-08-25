/* simetria-f33 — 106.ª tanda, 2026-08-25. EL ANTES/DESPUÉS DE CERRAR LOS TRES
 * CANALES, leído por DISTANCIA y no por recuento.
 *
 * ── Por qué no basta con `distintos` ─────────────────────────────────────
 * §*el eje que no lee como defecto esconde la mejora igual que esconde la
 * deriva*: **el recuento de pares distintos dice cuántos difieren; sólo la
 * DISTANCIA dice hacia dónde se movieron.** Un arreglo que acerca 1000 pares
 * sin llevar ninguno a Δ0 deja el recuento clavado.
 *
 * ── Qué compara ──────────────────────────────────────────────────────────
 * La congelada CADUCADA (red cortada en un solo lado) contra la nueva, par a
 * par por `ruta+eje`, y publica:
 *
 *   · **ACERCAN / ALEJAN / IGUALES** por |clon − original|;
 *   · el reparto **por LADO**: cuánto se movió el original y cuánto el clon.
 *     Es el control de que el arreglo hizo lo que dice — tocaba el montaje del
 *     ORIGINAL, así que el lado del clon tiene que quedarse quieto salvo donde
 *     de verdad pedía algo externo;
 *   · y la **diferencia simétrica** de las llaves: si un par aparece o
 *     desaparece, el recuento lo taparía (§*un cardinal es un contenedor*).
 *
 * ── Qué NO contesta ──────────────────────────────────────────────────────
 * · **No adjudica ningún Δ al clon.** Dice si el INSTRUMENTO mejoró. Lo que
 *   quede después sigue necesitando su causa medida;
 * · no dice que la nueva sea correcta: dice que se movió hacia el otro lado.
 *   Que el canal esté cerrado lo dicen los tres cardinales de `f33-cmp` §1.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const MED = join(RAIZ, "scripts/qa/medidas");

const ANCHOS = [1440, 390];
/**
 * Los dos lados se NOMBRAN por parámetro. El defecto es el par del ESCALÓN 1
 * —caducada contra canónica—; `ANTES=`/`AHORA=` sirven para leer cualquier otro
 * par (p.ej. el del `toggle`, que compara dos corridas ya con los tres canales
 * cerrados). Sin parámetro no hay fallback silencioso a «la más reciente»: el
 * par se elige, no se adivina.
 */
const PLANTILLA_ANTES = process.env.ANTES || "f33-cmp-{A}-CADUCADA-RED-CORTADA-EN-UN-SOLO-LADO-imagen-fuente-31-de-31.json";
const PLANTILLA_AHORA = process.env.AHORA || "f33-cmp-{A}.json";
const ANTES = (a) => join(MED, PLANTILLA_ANTES.replace("{A}", a));
const AHORA = (a) => join(MED, PLANTILLA_AHORA.replace("{A}", a));

/** Los mismos pares que arma `f33-cmp`, reconstruidos desde la congelada. */
function pares(j) {
  const out = new Map();
  for (const [ruta, v] of Object.entries(j.paginas)) {
    const o = v.original, c = v.clon;
    if (!o) continue;
    const pon = (eje, a, b) => out.set(`${ruta}|${eje}`, [a, b]);
    for (const k of ["docH", "base", "nSecciones", "nFilas", "nModulos", "enlaces"]) pon(k, o[k], c ? c[k] : null);
    for (const k of Object.keys(o.anchos ?? {})) pon(`ancho.${k}`, o.anchos[k], c?.anchos?.[k] ?? null);
    for (const k of Object.keys(o.cajas ?? {})) for (const d of ["y", "h", "w"]) pon(`caja.${k}.${d}`, o.cajas[k]?.[d], c?.cajas?.[k]?.[d] ?? null);
    for (const m of o.modulos ?? []) {
      const cm = (c?.modulos ?? [])[m.i] ?? null;
      for (const e of ["w", "h", "mt", "mb", "pt", "pb"]) pon(`mod${m.i}.${e}`, m[e], cm ? cm[e] : null);
    }
  }
  return out;
}

const l = [];
l.push("═══ simetria-f33 · cerrar los TRES canales, leído por DISTANCIA\n");
l.push(`  ANTES = ${PLANTILLA_ANTES}`);
l.push(`  AHORA = ${PLANTILLA_AHORA}\n`);

let corridas = 0;
for (const a of ANCHOS) {
  if (!existsSync(ANTES(a)) || !existsSync(AHORA(a))) {
    l.push(`  ${a}: SIN MEDIR — falta ${existsSync(ANTES(a)) ? "la corrida nueva" : "la caducada"}`);
    continue;
  }
  corridas++;
  const A = pares(JSON.parse(readFileSync(ANTES(a), "utf8")));
  const B = pares(JSON.parse(readFileSync(AHORA(a), "utf8")));

  /* Membresía por ELEMENTO, no por cardinal. */
  const soloA = [...A.keys()].filter((k) => !B.has(k));
  const soloB = [...B.keys()].filter((k) => !A.has(k));

  let comparables = 0, acercan = 0, alejan = 0, iguales = 0, aCero = 0, desdeCero = 0;
  let sumaAntes = 0, sumaAhora = 0;
  let movOrig = 0, movClon = 0;
  const mayores = [];
  for (const [k, [oa, ca]] of A) {
    const v = B.get(k);
    if (!v) continue;
    const [ob, cb] = v;
    if (typeof oa === "number" && typeof ob === "number" && Math.abs(ob - oa) >= 0.01) movOrig++;
    if (typeof ca === "number" && typeof cb === "number" && Math.abs(cb - ca) >= 0.01) movClon++;
    if (!(typeof oa === "number" && typeof ca === "number" && typeof ob === "number" && typeof cb === "number")) continue;
    comparables++;
    const dA = Math.abs(ca - oa), dB = Math.abs(cb - ob);
    sumaAntes += dA; sumaAhora += dB;
    if (Math.abs(dB - dA) < 0.01) iguales++;
    else if (dB < dA) { acercan++; if (dB < 0.01) aCero++; }
    else { alejan++; if (dA < 0.01) desdeCero++; }
    mayores.push({ k, dA, dB, delta: dB - dA });
  }

  l.push(`─── ${a} ────────────────────────────────────────────────────────────`);
  l.push(`  llaves            antes ${A.size} · ahora ${B.size} · sólo antes ${soloA.length} · sólo ahora ${soloB.length}`);
  l.push(`  pares comparables ${comparables}`);
  l.push(`  ACERCAN           ${acercan}   (de ellos, a Δ0 exacto: ${aCero})`);
  l.push(`  ALEJAN            ${alejan}   (de ellos, desde Δ0: ${desdeCero})`);
  l.push(`  iguales           ${iguales}`);
  l.push(`  Σ|clon−orig|      ${sumaAntes.toFixed(2)} → ${sumaAhora.toFixed(2)}   (${(sumaAhora - sumaAntes).toFixed(2)})`);
  l.push(`  se movió el lado  ORIGINAL ${movOrig} · CLON ${movClon}`);
  l.push("     ↑ el reparto por LADO es el control de ATRIBUCIÓN: un arreglo del montaje del original");
  l.push("       no puede mover el clon, y uno del clon no puede mover el original. Si los dos se mueven,");
  l.push("       el par mezcla DOS cambios y su Δ no se puede atribuir (§la causa común, en el instrumento).");
  /* Los que se ALEJAN van NOMBRADOS: un recuento de daño sin sus elementos no
   * se puede auditar, y es el lado que decide si un arreglo se revierte. */
  const seAlejan = mayores.filter((m) => m.delta > 0.01).sort((x, y) => y.delta - x.delta);
  if (seAlejan.length) {
    l.push(`  los que se ALEJAN, NOMBRADOS (${seAlejan.length}):`);
    for (const m of seAlejan.slice(0, 12)) {
      l.push(`     ↑ ${m.k.padEnd(62)} |Δ| ${m.dA.toFixed(2).padStart(10)} → ${m.dB.toFixed(2).padStart(10)}`);
    }
    if (seAlejan.length > 12) l.push(`     … y ${seAlejan.length - 12} más`);
  } else l.push("  los que se ALEJAN: NINGUNO");
  const top = mayores.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)).slice(0, 10);
  l.push("  los 10 que más se movieron:");
  for (const m of top) l.push(`     ${m.delta < 0 ? "↓" : "↑"} ${m.k.padEnd(62)} |Δ| ${m.dA.toFixed(2).padStart(10)} → ${m.dB.toFixed(2).padStart(10)}`);
  l.push("");
}

if (!corridas) { l.push("\n⛔ 0 anchos comparados: sin las dos congeladas esto no mide nada (§sondas 4)."); }
const txt = l.join("\n") + "\n";
console.log(txt);
writeFileSync(join(AQUI, process.env.LOG || "simetria-f33.log"), txt);
if (!corridas) process.exitCode = 2;
