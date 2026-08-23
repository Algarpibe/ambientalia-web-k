/**
 * ¿E1 HACE QUE LOS 6 RECLAMOS FALSOS DE `articulos-kb` DEJEN DE SER INERTES?
 * Uso: node docs/research/cola-larga/derivaciones/cms4-reclamos-f33.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO (§*escribe qué pregunta contesta y cuál no*)
 *
 * CONTESTA: con **CMS-4 = E1** tomada —`/[slug]` despacha un tercer catálogo
 * para las 19 páginas de un segmento de la cola larga—, ¿alguno de los **6
 * slugs de raíz que `articulos-kb` reclama sin usar** choca con lo que E1 va a
 * meter en el plano? O sea: ¿el reclamo latente pasa a **bloquear**?
 *
 * NO CONTESTA:
 *   · si los 6 reclamos deben quitarse. Eso ya está fichado
 *     (`F3-3-REGISTRO-SOBRE-RECLAMA`) y toca una colección VERIFICADA;
 *   · si un alta futura querrá uno de esos 6. Ninguna medición puede: es una
 *     afirmación sobre contenido que no existe. Lo que sí se puede acotar es
 *     **contra qué población compite hoy**, y eso es lo que se publica;
 *   · nada de `productos`. Sus 2 reclamos sin página se cuentan aparte, con su
 *     nombre, porque son **otra decisión** (§*corregir un denominador no es
 *     sustituirlo en todas partes*).
 *
 * ⚠ **La fuente es una congelada COMMITEADA, no una medición nueva**:
 * `medidas/f33-rutas.json` (94.ª tanda), que trae las 31 rutas con su
 * profundidad **y** el registro de slugs por familia. Derivar es cruzar dos
 * campos que ya están ahí — no hace falta abrir el original ni la DB.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const J = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8"));

const registro = J.registro;
const paginas = J.paginas;

/* Control §sondas 4: si la congelada no trae lo que se va a cruzar, TIRA.
 * «0 reclamos» y «no pude leer el registro» no pueden dar la misma salida. */
if (!registro || Object.keys(registro).length === 0)
  throw new Error("f33-rutas.json sin `registro`: no se puede cruzar contra la nada (§sondas 4).");
if (!Array.isArray(paginas) || paginas.length === 0)
  throw new Error("f33-rutas.json sin `paginas`: ídem.");

/** Lo que E1 pone en el PLANO DE RAÍZ: las páginas de la cola larga de 1 segmento. */
const enElPlanoPorE1 = paginas.filter((p) => p.segmentos === 1).map((p) => p.slug).sort();
/** Lo que la cola larga deja BAJO PREFIJO: no toca el plano de raíz. */
const bajoPrefijo = paginas.filter((p) => p.segmentos > 1).map((p) => p.rutaClon).sort();

const KB = registro["articulos-kb"]?.slugs ?? [];
const PROD = registro["productos"]?.slugs ?? [];

/* Las familias que YA están en el plano, para acotar contra qué compite hoy. */
const otras = Object.entries(registro).filter(([f]) => f !== "articulos-kb");

const inter = (a, b) => a.filter((x) => b.includes(x));

console.log(`\n════════ CMS-4 = E1 · ¿los 6 reclamos falsos dejan de ser inertes? ════════\n`);
console.log(`   páginas de la cola larga                ${String(paginas.length).padStart(4)}`);
console.log(`   · que E1 pone en el PLANO DE RAÍZ       ${String(enElPlanoPorE1.length).padStart(4)}   ← con éstas compiten los reclamos`);
console.log(`   · que quedan BAJO PREFIJO (catch-all)   ${String(bajoPrefijo.length).padStart(4)}   ← no tocan el plano`);
console.log(`   reclamos de raíz de \`articulos-kb\`      ${String(KB.length).padStart(4)}   (6 de 6 sin ruta de raíz)`);

const choque = inter(KB, enElPlanoPorE1);
console.log(`\n  ── EL CRUCE ──`);
console.log(`   \`articulos-kb\` ∩ lo que E1 pone en raíz   ${String(choque.length).padStart(3)}   ${choque.length ? JSON.stringify(choque) : "— ninguno"}`);
for (const [f, v] of otras)
  console.log(`   \`articulos-kb\` ∩ \`${f}\``.padEnd(46) + `${String(inter(KB, v.slugs).length).padStart(3)}   (familia de ${v.n})`);

/* El otro lado del mismo reclamo, contado aparte y con su nombre. */
const RUTAS = new Set(
  Object.keys(JSON.parse(readFileSync(join(RAIZ, "apps/web/.next/prerender-manifest.json"), "utf8")).routes ?? {}),
);
const prodSinPagina = PROD.filter((s) => !RUTAS.has(`/${s}`));
console.log(`\n  ── \`productos\`, que es la OTRA decisión y no se mezcla ──`);
console.log(`   reclama ${PROD.length} · sin página emitida ${prodSinPagina.length}: ${prodSinPagina.join(" · ")}`);
console.log(`   ∩ lo que E1 pone en raíz: ${inter(prodSinPagina, enElPlanoPorE1).length}`);

console.log(`\n  ── VEREDICTO ──`);
if (choque.length === 0) {
  console.log(`   ✅ **E1 NO lo cambia: 0 de ${KB.length}.** Los 6 reclamos siguen siendo LATENTES.`);
  console.log(`      Ninguno de los ${enElPlanoPorE1.length} slugs que E1 baja al plano de raíz es uno de ellos, y`);
  console.log(`      tampoco choca con ninguna de las ${otras.length} familias ya registradas.`);
  console.log(`\n   ⚠ Y lo que esto NO dice: que sean inofensivos. Siguen pudiendo bloquear`);
  console.log(`      un alta legítima — lo único que E1 cambia es CUÁNTA población compite`);
  console.log(`      por el plano, y hoy esa población no los quiere. Ficha abierta:`);
  console.log(`      F3-3-REGISTRO-SOBRE-RECLAMA (arreglo medido: \`enElPlano: () => false\`).`);
} else {
  console.log(`   ⛔ **E1 SÍ lo cambia: ${choque.length} de ${KB.length} chocan** — ${JSON.stringify(choque)}.`);
  console.log(`      Dejan de ser latentes el día que se siembre \`paginas\`.`);
}
console.log(``);

/* ══════════════════════════════════════════════════════════════════════════
 * LA VUELTA — §*una comprobación retroactiva se enmarca en LAS DOS DIRECCIONES*
 *
 * Arriba se pregunta *«¿los reclamos VIEJOS estorban a E1?»*. La otra mitad se
 * contesta con el mismo cruce y casi nunca se hace: **¿los 19 slugs NUEVOS de
 * E1 chocan con alguna familia ya registrada?** Es la pregunta que la guarda
 * `qa:slugs` hará el día de sembrar, y contestarla hoy cuesta un `filter`.
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`  ── LA VUELTA: ¿los 19 de E1 chocan con lo YA registrado? ──`);
let choquesE1 = 0;
for (const [f, v] of Object.entries(registro)) {
  const c = inter(enElPlanoPorE1, v.slugs);
  choquesE1 += c.length;
  console.log(`   E1 ∩ \`${f}\``.padEnd(46) + `${String(c.length).padStart(3)}   ${c.length ? JSON.stringify(c) : `— ninguno (familia de ${v.n})`}`);
}
console.log(
  choquesE1 === 0
    ? `   ✅ **0 colisiones de slug.** E1 es sembrable sin tocar ninguna familia existente.\n`
    : `   ⛔ **${choquesE1} colisiones**: E1 NO es sembrable tal cual — la guarda del §4 las rechazaría.\n`,
);

console.log(`  ── los ${enElPlanoPorE1.length} slugs que E1 baja al plano, nombrados ──`);
for (const s of enElPlanoPorE1) console.log(`   ${s}`);
console.log(``);
