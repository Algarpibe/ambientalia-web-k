/**
 * SIEMBRA DE LOS DOS CAMPOS DE LISTADO — `etiquetas.descripcion` y
 * `entradas-blog.extracto`.
 * Uso: node --env-file=apps/cms/.env scripts/seed/seed-listados.mjs
 *      (npm run cms:seed-listados)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Es una siembra de ACTUALIZACIÓN, no de alta: los 149 documentos y los 12
 * términos ya existen. Lo que se puebla es lo que vive en el LISTADO y no en la
 * ficha del documento, extraído por `cms:extractor-listados`.
 *
 * ── La guarda que importa, y por qué va en las DOS direcciones ────────────
 * §regla del cero: *no encontrar nada y no mirar nada dan la misma salida*. Así
 * que se cuentan y se nombran **los dos huecos**:
 *
 *  · un slug del extractor que **no existe** en la DB (el corpus trae algo que
 *    el clon no sembró);
 *  · un documento de la DB que el extractor **no cubre** (el clon tiene algo que
 *    el corpus no lista).
 *
 * El segundo es el que se olvida, y es justamente el que dice si la cobertura
 * del campo es completa. Los dos se imprimen **con su número**, y sembrar 0
 * documentos sale por error.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, hoy, w } from "../qa/lib.mjs";

const SABOTAJES = ["sin-extraccion", "slug-fantasma"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const F = join(QA, "medidas/extractor-listados.json");
if (!existsSync(F) || SABOTAJE === "sin-extraccion")
  throw new Error(
    `EXTRACCIÓN AUSENTE: no existe medidas/extractor-listados.json.\n` +
      `  Sin ella este seed sembraría 0 campos y saldría verde — que es «no había nada»\n` +
      `  y «no miré» dando la misma salida. Corre antes \`npm run cms:extractor-listados\`.`,
  );
const EXTRACCION = JSON.parse(readFileSync(F, "utf8"));

const extractos = { ...EXTRACCION.extractos };
const terminos = [...EXTRACCION.terminos];
if (SABOTAJE === "slug-fantasma") extractos["este-slug-no-existe-jamas"] = "sabotaje";

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

const ev = new Evaluadas({
  nombre: "seed-listados",
  unidad: "campos sembrados",
  /* Derivado de la extracción: si mañana el corpus trae más, el listón sube solo. */
  minimo: Object.keys(extractos).length + terminos.filter((t) => t.descripcionHtml).length,
});

/* ── (1) etiquetas.descripcion ───────────────────────────────────────────── */
const { docs: etqDb } = await payload.find({ collection: "etiquetas", pagination: false, depth: 0 });
const porSlugEtq = new Map(etqDb.map((e) => [e.slug, e]));
const etqSinDb = [];
let etqSembradas = 0;
for (const t of terminos) {
  if (!t.descripcionHtml) continue;
  const doc = porSlugEtq.get(t.slug);
  if (!doc) { etqSinDb.push(t.slug); continue; }
  await payload.update({ collection: "etiquetas", id: doc.id, data: { descripcion: t.descripcionHtml }, depth: 0 });
  etqSembradas++;
  ev.ok();
}
const etqSinCorpus = etqDb.filter((e) => !terminos.some((t) => t.slug === e.slug)).map((e) => e.slug);

/* ── (2) entradas-blog.extracto ──────────────────────────────────────────── */
const { docs: blogDb } = await payload.find({ collection: "entradas-blog", pagination: false, depth: 0 });
const porSlugBlog = new Map(blogDb.map((e) => [e.slug, e]));
const blogSinDb = [];
let blogSembrados = 0;
for (const [slug, texto] of Object.entries(extractos)) {
  const doc = porSlugBlog.get(slug);
  if (!doc) { blogSinDb.push(slug); continue; }
  await payload.update({ collection: "entradas-blog", id: doc.id, data: { extracto: texto }, depth: 0 });
  blogSembrados++;
  ev.ok();
}
/**
 * ⚠ Los que el extractor NO cubre **no son un fallo**: son las 81 entradas con
 * `recurso`, que **no salen en `/blog`** y cuyo extracto de tarjeta lo pinta el
 * módulo de Divi, o sea DERIVADO (LH-SP10). Se cuentan y se nombran igual,
 * porque «81 sin extracto» y «81 que no lo necesitan» son afirmaciones distintas
 * y sólo una está respaldada.
 */
const blogSinCorpus = blogDb.filter((e) => !(e.slug in extractos));
const sinCorpusConRecurso = blogSinCorpus.filter((e) => e.recurso).length;

await payload.db.destroy?.();

console.log(`\n════════ seed-listados ════════\n`);
console.log(`  extracción  medidas/extractor-listados.json (${EXTRACCION.meta?.fecha ?? "?"})`);
console.log(`\n  etiquetas.descripcion    ${etqSembradas} sembradas de ${terminos.filter((t) => t.descripcionHtml).length} extraídas`);
console.log(`     slugs del corpus SIN fila en la DB   ${etqSinDb.length}${etqSinDb.length ? ` — ${etqSinDb.join(" · ")}` : ""}`);
console.log(`     filas de la DB que el corpus no trae ${etqSinCorpus.length}${etqSinCorpus.length ? ` — ${etqSinCorpus.join(" · ")}` : ""}`);
console.log(`\n  entradas-blog.extracto   ${blogSembrados} sembrados de ${Object.keys(extractos).length} extraídos`);
console.log(`     slugs del corpus SIN fila en la DB   ${blogSinDb.length}${blogSinDb.length ? ` — ${blogSinDb.slice(0, 8).join(" · ")}` : ""}`);
console.log(`     entradas que el corpus no cubre      ${blogSinCorpus.length}, de las que ${sinCorpusConRecurso} tienen \`recurso\``);
console.log(`        (esas NO salen en /blog: su extracto de tarjeta es DERIVADO — LH-SP10)`);

const salida = {
  meta: {
    fecha: hoy(),
    que: "siembra de los dos campos que viven en el listado",
    fuente: `medidas/extractor-listados.json (${EXTRACCION.meta?.fecha ?? "?"})`,
    sabotaje: SABOTAJE,
  },
  etiquetas: { sembradas: etqSembradas, slugsSinFilaEnLaDb: etqSinDb, filasSinCorpus: etqSinCorpus },
  entradasBlog: {
    sembrados: blogSembrados,
    slugsSinFilaEnLaDb: blogSinDb,
    entradasNoCubiertas: blogSinCorpus.length,
    deEllasConRecurso: sinCorpusConRecurso,
  },
};
w("medidas/seed-listados.json", salida);

let codigo = 0;
if (blogSinDb.length || etqSinDb.length) {
  console.log(
    `\n⛔ ${blogSinDb.length + etqSinDb.length} slug(s) del corpus NO tienen fila en la DB.\n` +
      `   El corpus lista algo que el clon no sembró: es un hueco de POBLACIÓN, y\n` +
      `   saltárselo dejaría el campo a medias sin que nada fallara.`,
  );
  codigo = 2;
} else {
  console.log(`\n✅ ${etqSembradas} descripciones · ${blogSembrados} extractos · 0 slugs huérfanos.`);
}
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} campos sembrados · seed-listados`);
process.exit(codigo);
