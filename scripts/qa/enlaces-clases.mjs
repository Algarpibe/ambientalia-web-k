/**
 * ¿POR QUÉ apunta al original cada href que ya tiene ruta local? — el reparto.
 * Uso: npm run qa:enlaces-clases        (lee la congelada de `qa:enlaces`)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE — un total sin reparto esconde conjuntos con causas distintas
 *
 * `qa:enlaces` dice **cuántos** href apuntan al original teniendo ruta local, y
 * ese número solo no dice qué hay que hacer: mezcla los que se escriben en un
 * `src/lib/*.ts` —que se arreglan editando el dato— con los que vienen dentro
 * del **cuerpo rico importado**, que no se editan a mano porque los tiene que
 * coger una transformación al importar. Son dos trabajos distintos y el total
 * los suma (§*la causa común: el NIVEL al que se mide*, aplicado al informe).
 *
 * Y se escribe como SONDA en vez de como una tabla en un acta porque un reparto
 * citado de memoria envejece **contra** el repo (§regla 9): esto se re-deriva.
 *
 * ── QUÉ CONTESTA, Y QUÉ NO ───────────────────────────────────────────────
 * CONTESTA: de los destinos distintos que `qa:enlaces` marca, cuántos son
 * internos con ruta emitida, cuántos internos SIN ruta emitida, cuántos
 * externos, y de los primeros, cuántos se escriben en `src/` y cuántos llegan
 * por el cuerpo rico.
 *
 * NO CONTESTA, y va con su cardinal (§regla 14):
 *   · **los href ROTOS** (404 contra el build) — ésos son el otro informe de
 *     `qa:enlaces` y tienen otra causa. Aquí se cuentan y se nombran, no se
 *     clasifican;
 *   · **si el href DEBE localizarse** — la §Regla de rutas locales dice que sí
 *     cuando el destino está clonado, pero un `target="_blank"` deliberado o
 *     una cita textual al original son excepciones que esta sonda no puede
 *     distinguir. Da el reparto, no la orden.
 *
 * ── EL ALCANCE SE DECLARA, PORQUE SE MUEVE ───────────────────────────────
 * El reparto es **contra las rutas que el build emite HOY**. Una familia que
 * se construya mañana mueve destinos de «NO emitida» a «emitida» sin que aquí
 * cambie una línea, así que el número va SIEMPRE con la fecha de su congelada.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, QA, w } from "./lib.mjs";

gritaSiRevienta();

/* ── La congelada de origen se DERIVA, no se escribe (§regla 9, 7.º caso) ──
 * El nombre canónico conserva la PRIMERA foto (§regla 5), así que se toma la
 * MÁS RECIENTE por fecha en el nombre, y los artefactos de negativo (§regla 7)
 * quedan fuera. Una lista de literales se habría quedado corta el día que la
 * sonda vuelva a congelar. */
const MED = join(QA, "medidas");
const candidatas = readdirSync(MED)
  .filter((f) => /^enlaces(-\d{4}-\d{2}-\d{2}(-\d+)?)?\.json$/.test(f))
  .filter((f) => !/-neg-|SABOTAJE|SONDA-/.test(f))
  .sort();
if (!candidatas.length) throw new Error("no hay ninguna congelada de `qa:enlaces` en medidas/: corre `npm run qa:enlaces` primero");
/* La más reciente: las fechadas ordenan por nombre, y el canónico es el más viejo. */
const fuente = candidatas.filter((f) => f !== "enlaces.json").pop() ?? "enlaces.json";
const j = JSON.parse(readFileSync(join(MED, fuente), "utf8"));

const emitidas = new Set(j.publicadas ?? []);
if (!emitidas.size) throw new Error(`${fuente} no declara \`publicadas\`: sin el conjunto de rutas emitidas no hay contra qué clasificar`);

/* `fallos` trae una fila por APARICIÓN; el reparto se hace por DESTINO
 * distinto, que es la unidad en la que se decide el trabajo. */
const porHref = new Map();
for (const f of j.fallos ?? []) {
  if (!porHref.has(f.href)) porHref.set(f.href, { href: f.href, local: f.local, origen: f.origen, paginas: new Set() });
  porHref.get(f.href).paginas.add(f.pagina);
}
const destinos = [...porHref.values()];

/* El mínimo se DERIVA de la propia congelada y no se escribe: así un bucle que
 * se saltara destinos saldría rojo en vez de publicar un reparto incompleto.
 *
 * ⚠ El caso `destinos = 0` —el día que no quede ningún href sin localizar— cae
 * en el mínimo 1 y saldría «NO SE PUDO EVALUAR». No es un defecto por tapar:
 * esta sonda sólo existe para repartir fallos, y quien dictamina que no los hay
 * es `qa:enlaces`, que ese día sale verde. Se deja dicho para que nadie lea ese
 * rojo como una regresión. */
const ev = new Evaluadas({
  nombre: "enlaces-clases",
  unidad: "destinos distintos",
  minimo: Math.max(1, destinos.length),
});

const clases = { emitida: [], noEmitida: [], externo: [], sinClasificar: [] };
for (const d of destinos) {
  ev.ok(1);
  if (!/^https?:\/\/kunakair\.com\//.test(d.href)) clases.externo.push(d);
  else if (!d.local) clases.sinClasificar.push(d);
  else if (emitidas.has(d.local)) clases.emitida.push(d);
  else clases.noEmitida.push(d);
}

/* Dentro de la clase que decide el trabajo, el corte que lo parte en dos. */
const delCuerpo = clases.emitida.filter((d) => /no está en src/.test(d.origen ?? ""));
const deSrc = clases.emitida.filter((d) => !/no está en src/.test(d.origen ?? ""));

const familia = (l) =>
  l === "/blog" || l.startsWith("/blog/") ? "LISTADO · blog"
  : l.startsWith("/etiqueta/") ? "LISTADO · etiqueta"
  : l.startsWith("/recursos/articulos") ? "LISTADO · recursos/articulos"
  : l.startsWith("/scientific-category/") ? "LISTADO · scientific-category"
  : l.startsWith("/recursos/") ? "recursos (otros)"
  : l.startsWith("/casos-de-exito") ? "casos-de-exito"
  : l.startsWith("/case-studies/") ? "case-studies"
  : l.startsWith("/sectores/") ? "sectores"
  : l.startsWith("/faqs/") ? "faqs"
  : l.startsWith("/centro-de-ayuda") || l.startsWith("/soporte/") ? "centro de ayuda"
  : "raíz /[slug]";

const porFamilia = new Map();
for (const d of clases.emitida) {
  const k = familia(d.local);
  if (!porFamilia.has(k)) porFamilia.set(k, { destinos: 0, apariciones: 0, cuerpo: 0, src: 0 });
  const x = porFamilia.get(k);
  x.destinos++;
  x.apariciones += d.paginas.size;
  /no está en src/.test(d.origen ?? "") ? x.cuerpo++ : x.src++;
}

const apariciones = (j.fallos ?? []).length;
const n = (x) => String(x).padStart(5);

console.log(`\n════ POR QUÉ APUNTAN AL ORIGINAL — el reparto de los ${destinos.length} destinos ════`);
console.log(`  fuente     ${fuente}  (${j.meta?.fecha ?? "sin fecha"})`);
console.log(`  alcance    contra las ${emitidas.size} rutas que el build emite HOY\n`);
console.log(`  ${n(clases.emitida.length)}  interno · el build SÍ emite la ruta local`);
console.log(`  ${n(clases.noEmitida.length)}  interno · el build NO emite la ruta local  → o se clona, o se queda con su comentario`);
console.log(`  ${n(clases.externo.length)}  externo legítimo`);
console.log(`  ${n(clases.sinClasificar.length)}  SIN CLASIFICAR`);
const suma = Object.values(clases).reduce((a, x) => a + x.length, 0);
console.log(`  ${n(suma)}  SUMA — ${suma === destinos.length ? "✓ cuadra" : "✗ FALTA UNA CLASE"}`);

console.log(`\n  ── los ${clases.emitida.length} localizables, por DÓNDE se escriben (dos trabajos distintos) ──`);
console.log(`  ${n(deSrc.length)}  con origen literal en \`src/\`      → se edita el dato tipado`);
console.log(`  ${n(delCuerpo.length)}  del CUERPO RICO / dato derivado   → lo tiene que coger una T al importar`);

console.log(`\n  ── por FAMILIA de destino ──`);
console.log(`  ${"familia".padEnd(30)} ${"dest".padStart(5)} ${"aparic".padStart(7)} ${"cuerpo".padStart(7)} ${"src".padStart(5)}`);
for (const [k, v] of [...porFamilia].sort((a, b) => b[1].destinos - a[1].destinos))
  console.log(`  ${k.padEnd(30)} ${n(v.destinos)} ${String(v.apariciones).padStart(7)} ${String(v.cuerpo).padStart(7)} ${String(v.src).padStart(5)}`);

const deListado = [...porFamilia].filter(([k]) => k.startsWith("LISTADO"));
const nList = deListado.reduce((a, [, v]) => a + v.destinos, 0);
const aList = deListado.reduce((a, [, v]) => a + v.apariciones, 0);

console.log(`\n  ── lo que NO clasifica esta sonda, con su cardinal (§regla 14) ──`);
console.log(`  ${n((j.rotos ?? []).length)}  href ROTOS (404 contra el build) — otra causa, otro informe`);

console.log(
  `\n${clases.sinClasificar.length ? "❌" : "✅"} ${destinos.length} destinos · ${apariciones} apariciones · ` +
    `${nList} destinos a familias de LISTADO (${aList} apariciones)`,
);

w("medidas/enlaces-clases.json", {
  meta: {
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: "de los href que apuntan al original teniendo ruta local, ¿qué CAUSA tiene cada uno?",
    fuente,
    alcance: `contra las ${emitidas.size} rutas emitidas por el build en la fecha de arriba`,
    noClasifica: `${(j.rotos ?? []).length} href rotos (404): otra causa`,
  },
  totales: { destinos: destinos.length, apariciones },
  clases: {
    internoEmitida: clases.emitida.length,
    internoNoEmitida: clases.noEmitida.length,
    externo: clases.externo.length,
    sinClasificar: clases.sinClasificar.length,
  },
  dondeSeEscriben: { enSrc: deSrc.length, enCuerpoRico: delCuerpo.length },
  porFamilia: Object.fromEntries(porFamilia),
  noEmitidas: clases.noEmitida.map((d) => ({ local: d.local, paginas: d.paginas.size })),
  detalle: destinos.map((d) => ({ href: d.href, local: d.local, paginas: d.paginas.size, origen: d.origen })),
});

/* Una clase «sin clasificar» es un cubo de sobras, y ahí es donde se pierden
 * las causas que nadie nombró: es ROJO (§sondas 4, el cero y el pleno). */
process.exitCode = clases.sinClasificar.length ? 1 : 0;
