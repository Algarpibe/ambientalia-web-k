/**
 * ¿PUEDE EL CLON ELEGIR SU CASCARÓN? — el discriminador del RÉGIMEN, derivado.
 * Uso: node --env-file=apps/cms/.env docs/research/cola-larga/derivaciones/f33-regimen-discriminador.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LA PREGUNTA, Y POR QUÉ NO ES ACADÉMICA
 *
 * El régimen decide **qué cascarón lleva la página**, y los dos cascarones ya
 * existen medidos en este repo:
 *
 *   · `BT` → fila **911.75** con columna `1_4` de barra lateral — es el de
 *     `articulos-kb` (`SeccionCuerpoTb`/`FilaTb`/`ColumnaEstrecha`/`ColumnaAncha`);
 *   · `B-` → fila **1238.39** sin barra — el de SECTOR/MONOGRÁFICO, y el que
 *     `CLAUDE.md` describe como *«sin cascarón, la fila mide 1238.39 siempre»*;
 *   · `--` → plantilla clásica del tema, `entry-content`.
 *
 * Y el ancho de fila **no es decorativo**: es la variable que resuelve el
 * default de `mb` de un módulo (2.75 % de la FILA ⇒ **34.05** contra **25.06**),
 * que `CLAUDE.md` documenta como el caso donde dos variables confundidas dan la
 * regla al revés.
 *
 * Así que la pregunta es: **¿con qué campo del documento elige el clon?**
 *
 * ── EL MÉTODO: instancias SEPARADORAS, no porcentaje de acierto ───────────
 * §*un modelo se elige por lo que lo SEPARA de su alternativa, no por lo que
 * acierta*. Un candidato que acierta 30 de 31 no está «casi bien»: está
 * **refutado**, y lo que hay que publicar es **la instancia que lo refuta**.
 */
import { readFileSync, existsSync } from "node:fs";

const REPO = new URL("../../../../", import.meta.url);
const { construyeConfig } = await import(new URL("packages/cms-config/src/index.ts", REPO).href);
const { getPayload } = await import("payload");

/* ── El régimen MEDIDO, del lado del original (congelada de la 95.ª) ──────── */
/* ⚠ EL CANÓNICO `f33-geo.json` YA NO EXISTE: la 104.ª lo RENOMBRÓ (§regla 5bis)
 * con su defecto y su alcance —`modulos390` y `veredictosA`—, y las 10
 * congeladas de la familia llevan marcador (6 `SONDA-`, 4 `-neg-`), 0 sin
 * marcar. No hay fichero limpio al que apuntar: se nombra el marcado y se
 * declara por qué es lícito.
 *
 * Lo es: de aquí sólo salen `paginas[].ruta` y `paginas[].regimen` — ni
 * `modulos390` ni `veredictos`, que son los dos únicos sitios donde el defecto
 * entra. Derivado en `resolutores-109.log` §2. */
const GEO_F33 = "f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json";
const geoURL = new URL(`scripts/qa/medidas/${GEO_F33}`, REPO);
if (!existsSync(geoURL))
  throw new Error(
    `no existe ${GEO_F33}.\n` +
      `  Es la familia f33-geo, que NO tiene canónico: si la han vuelto a renombrar,\n` +
      `  actualiza este nombre y comprueba que \`paginas[].regimen\` siga fuera del\n` +
      `  alcance declarado en el nombre nuevo.`,
  );
const geo = JSON.parse(readFileSync(geoURL, "utf8"));
const regimenDe = new Map(geo.paginas.map((p) => [p.ruta.replace(/^\/es/, "").replace(/\/$/, "") || "/", p.regimen]));

/* ── Lo que el CLON tiene: el documento de la DB, y nada más ──────────────── */
const payload = await getPayload({ config: await construyeConfig() });
const r = await payload.find({ collection: "paginas", limit: 500, depth: 0, pagination: false });

const docs = r.docs.map((d) => {
  const ruta = "/" + [d.prefijo, d.slug].filter(Boolean).join("/");
  return {
    ruta,
    regimen: regimenDe.get(ruta) ?? "?",
    /* Los ÚNICOS campos que el documento lleva. Si el discriminador no está
     * aquí, el clon no puede elegir — y eso es lo que hay que demostrar. */
    prefijo: d.prefijo ?? null,
    tieneCuerpoClasico: Boolean(d.cuerpoClasico),
    tieneBloques: Array.isArray(d.bloques) && d.bloques.length > 0,
    nSecciones: Array.isArray(d.bloques) ? d.bloques.length : 0,
  };
});

const sinRegimen = docs.filter((d) => d.regimen === "?");
const porRegimen = {};
for (const d of docs) (porRegimen[d.regimen] = porRegimen[d.regimen] || []).push(d);

console.log("\n════════ ¿PUEDE EL CLON ELEGIR SU CASCARÓN? ════════\n");
console.log(`  documentos            ${docs.length}`);
console.log(`  sin régimen medido    ${sinRegimen.length}${sinRegimen.length ? " ⚠ " + sinRegimen.map((d) => d.ruta).join(" · ") : ""}`);
console.log(`  reparto               ${Object.entries(porRegimen).map(([k, v]) => `${k}:${v.length}`).join(" · ")}\n`);

/* ── CANDIDATO 1 · `cuerpoClasico` ⇒ `--` ─────────────────────────────────── */
const c1Bien = docs.filter((d) => d.tieneCuerpoClasico === (d.regimen === "--"));
console.log(`  CANDIDATO 1 · \`cuerpoClasico\` presente ⇒ régimen \`--\``);
console.log(`     acierta ${c1Bien.length}/${docs.length}  ⇒ ${c1Bien.length === docs.length ? "✅ el régimen `--` SÍ es derivable del documento" : "❌"}\n`);

/* ── CANDIDATO 2 · la RUTA ⇒ BT ───────────────────────────────────────────
 * El candidato natural, porque 7 de los 8 `BT` llevan `centro-de-ayuda` en la
 * ruta. Se evalúa contra el régimen medido y **se nombran las separadoras**. */
const porRuta = (d) => (d.ruta.includes("centro-de-ayuda") ? "BT" : d.tieneCuerpoClasico ? "--" : "B-");
const fallos = docs.filter((d) => porRuta(d) !== d.regimen);
console.log(`  CANDIDATO 2 · la RUTA elige el cascarón (\`centro-de-ayuda\` ⇒ BT)`);
console.log(`     acierta ${docs.length - fallos.length}/${docs.length}`);
console.log(`     ⚠ INSTANCIAS SEPARADORAS que lo REFUTAN: ${fallos.length}`);
for (const f of fallos) console.log(`        ${f.ruta.padEnd(46)} medido=${f.regimen}  la ruta diría=${porRuta(f)}`);

/* ── Y los que SÍ separan en la dirección contraria, para que no se lea como
 *    «casi acierta»: rutas bajo `soporte` que NO son BT. ───────────────── */
const soporteNoBt = docs.filter((d) => (d.prefijo ?? "").startsWith("soporte") && d.regimen !== "BT");
console.log(`\n     y en la otra dirección, bajo \`soporte\` sin ser BT: ${soporteNoBt.length}`);
for (const f of soporteNoBt) console.log(`        ${f.ruta.padEnd(46)} medido=${f.regimen}`);

/* ── CANDIDATO 3 · cualquier campo del documento ──────────────────────────
 * La comprobación que cierra: ¿hay ALGÚN par (BT, B-) indistinguible con todo
 * lo que el documento lleva? Si lo hay, ningún candidato puede existir. */
const clave = (d) => JSON.stringify([d.prefijo === null, d.tieneCuerpoClasico, d.tieneBloques]);
const colisiones = [];
for (const a of docs)
  for (const b of docs)
    if (a.ruta < b.ruta && a.regimen !== b.regimen && clave(a) === clave(b)) colisiones.push([a, b]);

console.log(`\n  CANDIDATO 3 · ¿algún campo del DOCUMENTO los separa?`);
console.log(`     pares de régimen distinto e INDISTINGUIBLES por los campos: ${colisiones.length}`);
for (const [a, b] of colisiones.slice(0, 6))
  console.log(`        ${a.regimen} ${a.ruta}   ≡   ${b.regimen} ${b.ruta}`);
if (colisiones.length > 6) console.log(`        … y ${colisiones.length - 6} más`);

console.log(
  `\n  ⇒ ${colisiones.length ? "❌ NO existe discriminador en el documento: BT y B- son INDISTINGUIBLES" : "✅ separables"}\n`,
);
process.exit(0);
