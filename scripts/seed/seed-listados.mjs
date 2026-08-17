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

const SABOTAJES = ["sin-extraccion", "slug-fantasma", "sin-recursos", "padre-huerfano"];
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
const recursos = SABOTAJE === "sin-recursos" ? [] : [...(EXTRACCION.categoriasRecursos ?? [])];
if (SABOTAJE === "slug-fantasma") extractos["este-slug-no-existe-jamas"] = "sabotaje";
/* ⚠ El sabotaje NO añade un término: le cambia el `padre` a uno que YA existe.
   Añadirlo daría de alta `termino-inventado` en la DB, y un negativo que deja
   basura en la base es un negativo que cambia lo que el siguiente mide. */
if (SABOTAJE === "padre-huerfano") {
  const i = recursos.findIndex((r) => r.padre);
  if (i < 0) throw new Error("SABOTAJE padre-huerfano: no hay ningún término con padre que sabotear.");
  recursos[i] = { ...recursos[i], padre: "no-existe-este-padre" };
}

/**
 * ⚠ **Un catálogo de `resources` VACÍO no puede pasar por «no hay jerarquía».**
 * `categoriasRecursos` es una clave nueva de la extracción: si un
 * `extractor-listados.json` viejo llega aquí, el `?? []` de arriba la
 * convertiría en «0 términos» y este seed sembraría la jerarquía a medias
 * saliendo verde — §regla 6, la ausencia se rechaza en el sitio donde todavía
 * se sabe.
 */
if (!recursos.length)
  throw new Error(
    `EXTRACCIÓN SIN \`categoriasRecursos\`: medidas/extractor-listados.json no trae la jerarquía.\n` +
      `  Es una clave NUEVA (D2.8): una extracción anterior al 2026-08-14 no la tiene, y su ausencia\n` +
      `  se leería como «resources es plana» en vez de como «esta extracción es vieja».\n` +
      `  Corre antes \`npm run cms:extractor-listados\`.`,
  );

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

/* ══════════════════════════════════════════════════════════════════════════
 * EL HUECO DE CAPTURA, DECLARADO — Y LA DECLARACIÓN CADUCA SOLA
 *
 * Aquí vivían 2 slugs que el `/blog` del original lista y que **no estaban en el
 * corpus de las 149** (§F3-LH-DOS-CONJUNTOS-DE-149): su extracto no se podía
 * sembrar, y eso **no era un fallo de este seed** sino un hueco de CAPTURA.
 *
 * ⚠ Antes de la declaración, esto salía como `exit 2` + contrato roto **sin
 * motivo registrado**, y un rojo permanente se lee como ruido a las dos
 * corridas. Lo que lo arregló NO fue bajar el listón: fue **nombrar la
 * excepción y compararla en los dos sentidos**, para que
 *
 *   · un slug huérfano NUEVO ponga la sonda roja (hueco que nadie vio), y
 *   · un slug de esta lista que YA se pueda sembrar la ponga roja también
 *     (la captura se hizo y la declaración se quedó vieja).
 *
 * Es el patrón de «declaración de defecto abierto» de `cms:extractor-a`: una
 * excepción que no caduca sola acaba tapando su propio arreglo.
 *
 * ✅ **VACIADA 2026-08-17 (73.ª tanda), Y LA VACIÓ LA SEGUNDA MITAD DE LA
 * GUARDA — no una revisión a mano.** Sembrados los 3 documentos capturados
 * (§F3-LH-TERCER-DOCUMENTO), esta corrida salió **roja** diciendo
 * *«DECLARACIÓN CADUCADA: `descarga-catalogo-kunak` · `kunak-obtiene-el-sello-reconcilia`
 * ya se puede(n) sembrar»*. O sea que la mitad que casi nadie escribe —la que
 * vigila que la excepción **deje de hacer falta**— es la que cobró: sin ella,
 * el hueco de captura habría seguido descontándose del mínimo para siempre,
 * bajando el listón en 2 sobre un dato que ya estaba completo.
 *
 * La lista se queda **vacía y con su comentario**, no se borra: el mecanismo
 * sigue armado para el próximo hueco, y el `[]` es la evidencia de que hoy no
 * hay ninguno.
 * ═════════════════════════════════════════════════════════════════════════ */
const HUECO_DE_CAPTURA = [];

const ev = new Evaluadas({
  nombre: "seed-listados",
  unidad: "campos sembrados",
  /**
   * Derivado de la extracción: si mañana el corpus trae más, el listón sube
   * solo.
   *
   * ⚠ El sumando de `resources` es **los que tienen padre**, no los 10: las
   * altas de fila son condicionales (si el seed ya las derivó, no hay alta) y
   * meterlas en el mínimo lo pondría por encima de lo que se puede evaluar en
   * una DB ya sembrada. Los `padre` sí son 8 siempre.
   */
  minimo:
    Object.keys(extractos).length -
    HUECO_DE_CAPTURA.length +
    terminos.filter((t) => t.descripcionHtml).length +
    recursos.filter((r) => r.padre).length,
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
  if (!doc) { blogSinDb.push(slug); ev.fallo(slug, "no está en el corpus de las 149 — hueco de CAPTURA"); continue; }
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

/* ══════════════════════════════════════════════════════════════════════════
 * (3) LA JERARQUÍA DE `categorias-recursos` — `D2.8`
 *
 * `seed.mjs` deriva esta taxonomía deduplicando `entradas-blog.recurso`, y una
 * taxonomía derivada de sus miembros **no puede ver dos cosas**:
 *
 *   · un término que NINGUNA entrada referencia — `articulos` sólo existe como
 *     PADRE, y por eso faltaba;
 *   · el `padre` mismo, que no viaja en el `{slug, nombre}` embebido.
 *
 * Las dos salen del ARCHIVO del término, o sea del corpus de listados. Este
 * paso es de ACTUALIZACIÓN, como los otros dos: da de alta lo que falta y
 * apunta `padre`, sin tocar lo que el seed ya sembró bien.
 *
 * ⚠ **Se hace en DOS PASADAS y no en una**, porque un `padre` es una relación a
 * una fila que puede no existir todavía: con una sola pasada el orden del
 * catálogo decidiría cuántas relaciones se quedan a null, y saldría verde.
 * ═════════════════════════════════════════════════════════════════════════ */
const { docs: recDb0 } = await payload.find({ collection: "categorias-recursos", pagination: false, depth: 0 });
const yaEstaban = new Set(recDb0.map((r) => r.slug));

/* — pasada 1 · las filas, sin `padre` — */
let recAltas = 0;
for (const r of recursos) {
  if (yaEstaban.has(r.slug)) continue;
  await payload.create({ collection: "categorias-recursos", data: { slug: r.slug, nombre: r.nombre }, depth: 0 });
  recAltas++;
  /* Las altas NO entran en el contrato: son CONDICIONALES (si el seed ya derivó
     la fila, no hay alta), y meter una unidad condicional en un mínimo fijo es
     cómo un contrato deja de expresar lo que la sonda afirma. */
}

/* — pasada 2 · el `padre`, con todas las filas ya existiendo — */
const { docs: recDb } = await payload.find({ collection: "categorias-recursos", pagination: false, depth: 0 });
const porSlugRec = new Map(recDb.map((r) => [r.slug, r]));
const recSinDb = [];
let recPadres = 0;
for (const r of recursos) {
  if (!r.padre) continue;
  const doc = porSlugRec.get(r.slug);
  const padre = porSlugRec.get(r.padre);
  if (!doc || !padre) { recSinDb.push(`${r.slug}→${r.padre}`); continue; }
  await payload.update({ collection: "categorias-recursos", id: doc.id, data: { padre: padre.id }, depth: 0 });
  recPadres++;
  ev.ok();
}
/* La dirección que se olvida: filas en la DB que el corpus no lista. */
const recSinCorpus = recDb.filter((r) => !recursos.some((x) => x.slug === r.slug)).map((r) => r.slug);

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

console.log(`\n  categorias-recursos      ${recDb.length} filas tras la siembra (${recAltas} altas nuevas)`);
console.log(`     \`padre\` apuntado en    ${recPadres} de ${recursos.filter((r) => r.padre).length} que el corpus declara`);
console.log(`     relaciones sin destino ${recSinDb.length}${recSinDb.length ? ` — ${recSinDb.join(" · ")}` : ""}`);
console.log(`     filas de la DB que el corpus no trae ${recSinCorpus.length}${recSinCorpus.length ? ` — ${recSinCorpus.join(" · ")}` : ""}`);

/* La excepción, comparada en los DOS sentidos. Va ANTES de la salida porque la
   salida la congela: computarla después dejaba el fichero sin ella (y reventaba). */
const huerfanosNuevos = blogSinDb.filter((s) => !HUECO_DE_CAPTURA.includes(s));
const declaradosYaSembrables = HUECO_DE_CAPTURA.filter((s) => !blogSinDb.includes(s));

const salida = {
  meta: {
    fecha: hoy(),
    que: "siembra de los dos campos que viven en el listado + la jerarquía de `categorias-recursos` (D2.8)",
    fuente: `medidas/extractor-listados.json (${EXTRACCION.meta?.fecha ?? "?"})`,
    sabotaje: SABOTAJE,
  },
  etiquetas: { sembradas: etqSembradas, slugsSinFilaEnLaDb: etqSinDb, filasSinCorpus: etqSinCorpus },
  huecoDeCaptura: {
    declarado: HUECO_DE_CAPTURA,
    huerfanosNuevos,
    declaradosYaSembrables,
    porQue: "§F3-LH-DOS-CONJUNTOS-DE-149 — el /blog del original los lista y no están en el corpus de 149",
  },
  entradasBlog: {
    sembrados: blogSembrados,
    slugsSinFilaEnLaDb: blogSinDb,
    entradasNoCubiertas: blogSinCorpus.length,
    deEllasConRecurso: sinCorpusConRecurso,
  },
  categoriasRecursos: {
    filas: recDb.length,
    altas: recAltas,
    padresApuntados: recPadres,
    padresDeclaradosPorElCorpus: recursos.filter((r) => r.padre).length,
    relacionesSinDestino: recSinDb,
    filasSinCorpus: recSinCorpus,
  },
};
w("medidas/seed-listados.json", salida);

let codigo = 0;
if (huerfanosNuevos.length || etqSinDb.length || recSinDb.length) {
  console.log(
    `\n⛔ ${huerfanosNuevos.length + etqSinDb.length + recSinDb.length} slug(s) del corpus NO tienen fila en la DB\n` +
      `   y NO están en la excepción declarada: ${[...huerfanosNuevos, ...etqSinDb, ...recSinDb].join(" · ")}\n` +
      `   El corpus lista algo que el clon no sembró: es un hueco de POBLACIÓN, y\n` +
      `   saltárselo dejaría el campo a medias sin que nada fallara.`,
  );
  codigo = 2;
} else if (declaradosYaSembrables.length) {
  console.log(
    `\n⛔ DECLARACIÓN CADUCADA: ${declaradosYaSembrables.join(" · ")} ya se puede(n) sembrar.\n` +
      `   El hueco de captura se cerró y \`HUECO_DE_CAPTURA\` se quedó viejo. Quítalos de\n` +
      `   la lista: una excepción que no caduca acaba tapando su propio arreglo.`,
  );
  codigo = 2;
} else if (recPadres !== recursos.filter((r) => r.padre).length) {
  /* Un `padre` que se queda a null no rompe nada: deja la ruta del término
     compuesta a medias y el archivo del padre listando de menos. Grita aquí. */
  console.log(
    `\n⛔ \`padre\` apuntado en ${recPadres} de ${recursos.filter((r) => r.padre).length}.\n` +
      `   Un padre a null NO revienta: deja la ruta compuesta a medias y el archivo del\n` +
      `   padre listando de menos, que es un clon plausible y equivocado.`,
  );
  codigo = 2;
} else {
  console.log(
    `\n✅ ${etqSembradas} descripciones · ${blogSembrados} extractos · ` +
      `${recDb.length} categorias-recursos con ${recPadres} padres.\n` +
      `   Huérfanos: ${blogSinDb.length}, TODOS en la excepción declarada (hueco de CAPTURA,\n` +
      `   §F3-LH-DOS-CONJUNTOS-DE-149) — ${HUECO_DE_CAPTURA.join(" · ")}`,
  );
}
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} campos sembrados · seed-listados`);
process.exit(codigo);
