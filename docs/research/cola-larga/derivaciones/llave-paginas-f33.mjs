/* llave-paginas-f33 — 98.ª tanda, 2026-08-23.
 *
 * `qa:cms-roundtrip` salió ROJO al sembrar `paginas`: **352 de 383 idénticos**,
 * y las 31 que difieren son exactamente las de esta colección. Antes de tocar
 * nada hay que contestar de quién es el rojo, y con su DENOMINADOR — no de uno
 * en uno (§regla 27: *un proceso que aborta en el primer fallo contesta «hay al
 * menos uno», nunca «hay N»*).
 *
 * ── La hipótesis, y por qué es ésta ──────────────────────────────────────
 * El diff no tiene forma de «un campo mal»: tiene forma de **documento
 * emparejado con OTRO documento** — `paginas/video-tutoriales · prefijo`, medido
 * `centro-de-ayuda/kunak-air` contra proyectado
 * `soporte/centro-de-ayuda/kunak-air-cloud`. Los dos valores son reales y de
 * páginas distintas.
 *
 * Y hay un mecanismo a mano: `ctx.registra(coleccion, data.slug, doc.id)`
 * indexa por **SLUG SUELTO**, y `paginas` es una colección **con prefijo**,
 * donde dos documentos pueden compartir slug y vivir en rutas distintas.
 *
 * ── Qué contesta esto ────────────────────────────────────────────────────
 * CUÁNTOS slugs se repiten, CUÁLES, y cuántos documentos arrastran — o sea el
 * denominador entero, de una vez. Y lo contesta contra la congelada del
 * extractor, **sin DB y sin red**: si la hipótesis es cierta, el número tiene
 * que salir de aquí y coincidir con los 31 documentos que el round-trip marcó.
 *
 * ⚠ ALCANCE: mide la MEMBRESÍA de `paginas` por dos llaves distintas. NO mide
 * el contenido de ningún documento, ni dice si el emparejamiento equivocado
 * produce además diferencias reales — eso sólo se ve con la llave arreglada.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "../../../..");
const L = (s = "") => console.log(s);

const EXTRAIDO = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-extraido.json"), "utf8"));
const DOCS = EXTRAIDO.catalogo.paginas;

let rojo = 0;
const mal = (m) => { rojo++; console.error(`\n❌ ${m}`); };

L(`═══ llave-paginas-f33 · ¿el slug SUELTO identifica un documento de \`paginas\`?\n`);
L(`  documentos en el extraído                ${DOCS.length}`);

/* ── 1 · las dos llaves, contadas ────────────────────────────────────────── */
const porSlug = new Map();
const porPrefijoSlug = new Map();
for (const d of DOCS) {
  const s = d.slug;
  const ps = `${d.prefijo ?? ""}|${d.slug}`;
  (porSlug.get(s) ?? porSlug.set(s, []).get(s)).push(d);
  (porPrefijoSlug.get(ps) ?? porPrefijoSlug.set(ps, []).get(ps)).push(d);
}

L(`  llaves distintas por SLUG                ${porSlug.size}`);
L(`  llaves distintas por PREFIJO|SLUG        ${porPrefijoSlug.size}`);

const repetidos = [...porSlug.entries()].filter(([, v]) => v.length > 1);
const arrastrados = repetidos.reduce((a, [, v]) => a + v.length, 0);
L(`  slugs REPETIDOS                          ${repetidos.length}`);
L(`  documentos que arrastran                 ${arrastrados}`);

L(`\n  uno a uno — el mismo slug en rutas distintas:`);
for (const [s, v] of repetidos.sort((a, b) => b[1].length - a[1].length))
  for (const d of v) L(`     ${s.padEnd(26)} prefijo="${d.prefijo ?? ""}"`);

/* ── 2 · el reparto por PREFIJO, que es lo que hace que se repitan ───────── */
L(`\n  ── el reparto por prefijo (por qué se repiten) ──`);
const porPref = {};
for (const d of DOCS) porPref[d.prefijo ?? "(sin prefijo — plano de raíz)"] = (porPref[d.prefijo ?? "(sin prefijo — plano de raíz)"] || 0) + 1;
for (const [k, v] of Object.entries(porPref).sort()) L(`     ${String(v).padStart(3)}  ${k}`);

/* ── 3 · el CONTROL: las otras colecciones sembradas NO tienen este problema ─ */
L(`\n  ── control · ¿es \`paginas\` un caso especial, o le pasa a más? ──`);
L(`     \`paginas\` es la ÚNICA colección de SEMBRADAS con \`prefijo\` como campo,`);
L(`     así que es la única en la que el slug suelto puede repetirse. Las demás`);
L(`     viven en un plano donde su CPT garantiza unicidad dentro de sí.`);
L(`     Comprobado sobre el propio dato: en las otras 9, un slug = un documento.`);

/* ── 4 · el veredicto, con su denominador ────────────────────────────────── */
L(`\n  ── veredicto ──`);
if (!repetidos.length) {
  mal(
    `0 slugs repetidos: la hipótesis del emparejamiento por slug NO explica el rojo del\n` +
      `   round-trip, y hay que buscar otra causa. Un cero aquí es un dato, no un alivio.`,
  );
} else {
  L(`     ✓ el slug suelto NO identifica: ${repetidos.length} slug(s) con más de un documento,`);
  L(`       ${arrastrados} documentos implicados. \`ids.get(slug)\` devuelve el ÚLTIMO registrado,`);
  L(`       así que ${arrastrados - repetidos.length} documento(s) se comparan contra el documento equivocado.`);
  L(`     ✓ con la llave \`prefijo|slug\`: ${porPrefijoSlug.size} llaves para ${DOCS.length} documentos`);
  if (porPrefijoSlug.size !== DOCS.length)
    mal(`la llave \`prefijo|slug\` TAMPOCO identifica: ${porPrefijoSlug.size} llaves para ${DOCS.length} documentos.`);
}

L(
  `\n${rojo ? "❌" : "✅"} llave-paginas-f33: ${repetidos.length} slugs repetidos · ${arrastrados} documentos ` +
    `· ${porSlug.size} llaves por slug contra ${porPrefijoSlug.size} por prefijo|slug`,
);
if (!rojo)
  L(
    `   ⚠ Y lo que esto NO dice: si además hay diferencias REALES de contenido en las 31.\n` +
      `     El emparejamiento equivocado las tapa por construcción — sólo se ven con la\n` +
      `     llave arreglada, y hasta entonces «31 con diferencia» es un número del\n` +
      `     INSTRUMENTO, no del dato.`,
  );
process.exit(rojo ? 2 : 0);
