/**
 * 138.ª · ESCALÓN 2 — LOS 5 BLOQUEOS DE `required` QUE EL ALTA DESTAPÓ,
 * DERIVADOS ENTEROS ANTES DE TOCAR NADA.
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────
 * Cablear `arquetipos` movió el sondeo de **360 a 364 filas** —o sea que el
 * sembrador ya la recorre, que era lo que el alta tenía que demostrar— y de
 * paso sacó **5 rutas `required`** que ninguna tanda tenía nombradas. El
 * encargo daba el ESCALÓN 3 por «sembrar», así que esto es una precondición
 * que no estaba en el plan.
 *
 * §regla 27 manda derivar el DENOMINADOR recorriendo todos los ejes en una
 * corrida, no re-corriendo el sembrador de uno en uno: *un proceso que aborta
 * en el primer fallo contesta «hay al menos uno», nunca «hay N»*. El sondeo ya
 * los recorre; lo que falta es **ATRIBUIR cada uno**, que es otra pregunta.
 *
 * ── LAS TRES ATRIBUCIONES POSIBLES, Y NO SE ELIGEN: SE MIDEN ─────────────
 *   · del EXTRACTOR ... el dato existe en el original y el extractor no lo lee;
 *   · del MODELO ..... el esquema declara `required` algo que el original no
 *                      trae siempre — y entonces es una decisión del
 *                      propietario, como las D1·D2·D3 de `paginas`;
 *   · del DATO ....... el original de verdad no lo tiene y el modelo tiene
 *                      razón en pedirlo.
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 *   1 · el denominador de cada bloqueo: cuántas instancias de su bloque hay y
 *       cuántas lo incumplen — con las dos cifras, nunca la absoluta sola;
 *   2 · si el campo que falta EXISTE en el original: se busca su rastro en el
 *       corpus servido, que es el único canal que puede desempatar entre
 *       «el extractor no lo lee» y «no está»;
 *   3 · qué haría el seed: si Payload rechaza o no, contestado por la FORMA
 *       del campo (grupo con `required` dentro = se exige siempre).
 *
 * ── QUÉ **NO** CONTESTA ──────────────────────────────────────────────────
 *   · no DECIDE. Una ruta `required` que el original no ejerce es una decisión
 *     de MODELO y es del propietario (precedente: D1·D2·D3 de `paginas`);
 *   · no toca el esquema, ni el extractor, ni una fila;
 *   · no dice si el render los necesita: dice si el seed los exige.
 *
 * ── EL CONTROL, POR CASO CONOCIDO DE ANTEMANO (§regla 28c) ───────────────
 * Un «0 instancias incumplen» de este derivador tendría dos causas que se
 * escriben igual. Así que va el testigo POSITIVO: los **5 bloqueos que el
 * sondeo ya publicó** tienen que reaparecer aquí con sus cardinales. Si alguno
 * sale a 0, es el instrumento.
 *
 * ── ⚠⚠ LO QUE ESTE DERIVADOR **NO** ADJUDICA, Y HAY QUE DECIRLO ──────────
 * `imagen-arq.enlace` sale **27 de 27 · el 100 %**, y §sondas 4 quinta cara
 * avisa de que *un campo ausente en el 100 % de su tipo dice «no lo sé leer»
 * antes que «el original no lo trae»*. Aquí el instrumento **no** está muerto
 * —`extractor-f35.mjs:469` emite `enlace` cuando halla `<a>` dentro del
 * módulo— pero eso **no cierra** la atribución:
 *
 *   · un barrido del corpus servido halla `<a>` cerca de módulos `et_pb_image`
 *     (25 · 12 · 9 · 6 en los 4 documentos, con `et_pb_button` de control
 *     positivo a 78 · 11 · 34 · 12), y **ese barrido NO adjudica**: su ventana
 *     de 900 caracteres se lleva anclas de módulos vecinos y las apariciones
 *     de la clase dentro de `<style>` (§*el markup se busca sobre el HTML sin
 *     `<style>` ni `<script>`*);
 *   · y el extractor emite sólo módulos de **PRIMER NIVEL del cuerpo** (231 de
 *     los ~460 `et_pb_image` que el documento menciona), así que las anclas
 *     hoy visibles pueden vivir todas fuera de su alcance.
 *
 * **Queda SIN ATRIBUIR entre «el extractor no lo lee» y «los 27 de primer
 * nivel no tienen enlace», y se declara así en vez de elegir.**
 *
 * ── PERO LA DECISIÓN NO DEPENDE DE ESA ATRIBUCIÓN, Y ESO SÍ ESTÁ MEDIDO ──
 * `enlace()` es un **`group`** con `label` y `href` `required`
 * (`campos/comunes.ts:703`), y un grupo en Payload **no es opcional**: sus
 * `required` internos se exigen SIEMPRE. Así que aunque el original enlazara
 * algunas imágenes, **las que no lo hicieran bloquearían igual** — el modelo,
 * tal como está escrito, exige enlace en TODAS. Eso es una decisión de MODELO
 * y es del propietario, con el precedente exacto de las D1·D2·D3 de `paginas`
 * (96.ª → 98.ª).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "bloqueos-siembra-138.json");

const extraido = JSON.parse(fs.readFileSync(path.join(RAIZ, "scripts/qa/medidas/f35-extraido.json"), "utf8"));
const docs = extraido.catalogo.arquetipos;

/**
 * Los 5 que el sondeo nombró — testigos, no una lista inventada.
 *
 * ⚠⚠ **CADA UNO CON SU UNIDAD, Y NO SON LA MISMA** (§*cada denominador se
 * escribe CON SU UNIDAD; un denominador sin unidad no se puede auditar porque
 * las dos lecturas se escriben igual*). El sondeo publica los `SIN DATO` en
 * **INSTANCIAS** y los `VACÍO` en **DOCUMENTOS**, así que compararlos contra un
 * único cardinal da falsos rojos: `formulario-arq.opciones.texto` son **3
 * instancias en 1 documento** y las dos cifras son ciertas.
 *
 * La primera versión de este derivador contaba todo en instancias y publicó
 * **3/5 · NO ADJUDICA**. El rojo era del comparador, no del objeto — y de paso
 * destapó que el sondeo colapsaba su llave de documento (arreglado en
 * `sondeo.mjs`, ver la cabecera de `exige`). Congelada de aquel estado:
 * `bloqueos-siembra-138-ANTES-DEL-ARREGLO-DEL-SLUG.json`.
 */
const TESTIGOS = [
  { bloque: "imagen-arq", ruta: "enlace.label", clase: "SIN DATO", unidad: "instancias", esperadas: 27 },
  { bloque: "imagen-arq", ruta: "enlace.href", clase: "SIN DATO", unidad: "instancias", esperadas: 27 },
  { bloque: "texto-arq", ruta: "contenido", clase: "VACÍO", unidad: "documentos", esperadas: 1 },
  { bloque: "video-arq", ruta: "url", clase: "VACÍO", unidad: "documentos", esperadas: 2 },
  { bloque: "formulario-arq", ruta: "campos[].opciones[].texto", clase: "VACÍO", unidad: "documentos", esperadas: 1 },
];

const out = { meta: { fecha: new Date().toISOString(), sonda: "bloqueos-siembra-138" }, docs: docs.length };

/** Recorre los bloques de primer nivel de los 4 documentos. */
function bloquesDe(doc) {
  return Array.isArray(doc.bloques) ? doc.bloques : [];
}

const porTipo = new Map();
for (const d of docs) {
  for (const b of bloquesDe(d)) {
    const k = b.blockType ?? b.kind ?? "(sin tipo)";
    if (!porTipo.has(k)) porTipo.set(k, []);
    porTipo.get(k).push({ slug: d.slug, b });
  }
}
out.censoBloques = Object.fromEntries([...porTipo].map(([k, v]) => [k, v.length]));
out.totalBloques = [...porTipo.values()].reduce((a, v) => a + v.length, 0);
console.log(`Bloques por tipo (total ${out.totalBloques}):`);
[...porTipo].sort((a, b) => b[1].length - a[1].length).forEach(([k, v]) => console.log(`  ${k.padEnd(18)} ${v.length}`));

/* ── 1 · `imagen-arq.enlace` ─────────────────────────────────────────────── */
const imgs = porTipo.get("imagen-arq") ?? [];
const conEnlace = imgs.filter(({ b }) => b.enlace && (b.enlace.href || b.enlace.label));
const sinEnlace = imgs.filter(({ b }) => !b.enlace || (!b.enlace.href && !b.enlace.label));
out.imagenArq = {
  instancias: imgs.length,
  conEnlace: conEnlace.length,
  sinEnlace: sinEnlace.length,
  /* La forma del campo decide si Payload lo exige: un `group` NO es opcional,
   * así que sus `required` internos se piden siempre, haya enlace o no. */
  forma: "group con label+href required (campos/comunes.ts:enlace)",
  ejemplosSinEnlace: sinEnlace.slice(0, 3).map(({ slug, b }) => ({ slug, imagen: b.imagen ?? null })),
};
console.log(
  `\nimagen-arq · ${imgs.length} instancias · con enlace ${conEnlace.length} · SIN enlace ${sinEnlace.length}`
);

/* ── 2 · Los tres VACÍOS ─────────────────────────────────────────────────── */
const vacios = { "texto-arq.contenido": [], "video-arq.url": [], "formulario-arq.opciones.texto": [] };
for (const { slug, b } of porTipo.get("texto-arq") ?? []) {
  if (b.contenido === "") vacios["texto-arq.contenido"].push(slug);
}
for (const { slug, b } of porTipo.get("video-arq") ?? []) {
  if (b.url === "") vacios["video-arq.url"].push(slug);
}
for (const { slug, b } of porTipo.get("formulario-arq") ?? []) {
  for (const c of b.campos ?? []) {
    for (const o of c.opciones ?? []) {
      if (o.texto === "") vacios["formulario-arq.opciones.texto"].push(`${slug}·${c.nombre}·valor=${o.valor ?? ""}`);
    }
  }
}
out.vacios = Object.fromEntries(
  Object.entries(vacios).map(([k, v]) => [k, { n: v.length, donde: v.slice(0, 6) }])
);
console.log("\nRequired VACÍOS:");
for (const [k, v] of Object.entries(vacios)) console.log(`  ${k.padEnd(32)} ${v.length}  ${v.slice(0, 3).join(" | ")}`);

/* ── 3 · CONTROL: los 5 testigos reaparecen, CADA UNO EN SU UNIDAD ───────── */
const nDoc = (lista) => new Set(lista.map((x) => String(x).split("·")[0])).size;
const medido = {
  "imagen-arq|enlace.label": { instancias: sinEnlace.length, documentos: nDoc(sinEnlace.map((x) => x.slug)) },
  "imagen-arq|enlace.href": { instancias: sinEnlace.length, documentos: nDoc(sinEnlace.map((x) => x.slug)) },
  "texto-arq|contenido": {
    instancias: vacios["texto-arq.contenido"].length,
    documentos: nDoc(vacios["texto-arq.contenido"]),
  },
  "video-arq|url": { instancias: vacios["video-arq.url"].length, documentos: nDoc(vacios["video-arq.url"]) },
  "formulario-arq|campos[].opciones[].texto": {
    instancias: vacios["formulario-arq.opciones.texto"].length,
    documentos: nDoc(vacios["formulario-arq.opciones.texto"]),
  },
};
out.control = TESTIGOS.map((t) => {
  const m = medido[`${t.bloque}|${t.ruta}`] ?? { instancias: 0, documentos: 0 };
  const enSuUnidad = m[t.unidad];
  /* Se publican LAS DOS cifras aunque sólo una decida: son cardinales de cosas
   * distintas y sólo con las dos el verde es auditable. */
  return { ...t, medidas: enSuUnidad, instancias: m.instancias, documentos: m.documentos, reproduce: enSuUnidad === t.esperadas };
});
const repro = out.control.filter((c) => c.reproduce).length;
out.veredicto = { testigosQueReproducen: repro, de: TESTIGOS.length, adjudica: repro === TESTIGOS.length };
console.log(`\nCONTROL · testigos que reproducen: ${repro}/${TESTIGOS.length} ⇒ ${out.veredicto.adjudica ? "ADJUDICA" : "NO ADJUDICA"}`);
for (const c of out.control) {
  console.log(`  ${c.reproduce ? "✓" : "✗"} ${c.bloque}.${c.ruta} · ${c.unidad} esperadas ${c.esperadas} · medidas ${c.medidas}  (instancias ${c.instancias} · documentos ${c.documentos})`);
}

fs.writeFileSync(SALIDA, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\n  congelada → ${path.relative(RAIZ, SALIDA)}`);
process.exit(out.veredicto.adjudica ? 0 : 2);
