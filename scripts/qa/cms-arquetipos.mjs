/**
 * ¿QUÉ ARQUETIPOS **CONSTRUYÓ** EL CLON, Y CUÁLES SÓLO **REFERENCIÓ**?
 *
 * Uso: node scripts/qa/cms-arquetipos.mjs
 *
 * ── La pregunta, y por qué no estaba escrita en ningún sitio ───────────────
 * `PLAN-FASE-2.md` §F2-2 arranca de una premisa de una línea:
 *
 *   > *«`src/lib/*.ts` **son** los datos»*
 *
 * El bloque 1 la dio por buena, y el sondeo de frontera la rompió por tres
 * sitios distintos sin que ninguno se pareciera al otro. La causa común no es
 * ninguna de las tres: es que **la premisa es cierta de unas colecciones y falsa
 * de otras, y nadie había escrito cuáles son cuáles.**
 *
 * El clon hizo dos cosas muy distintas con el original, y las dos dejan filas en
 * `src/lib`:
 *
 * | | qué hizo | qué hay en `src/lib` |
 * |---|---|---|
 * | **CONSTRUYÓ** | reconstruyó la página entera y la sirve | **el contenido completo** de esa página — la premisa se cumple |
 * | **REFERENCIÓ** | pintó un enlace o un teaser hacia ella | **lo que el que la pinta necesitaba**, y nada más — la premisa NO se cumple |
 *
 * Una fila referenciada **no es una fila incompleta por descuido**: es una
 * PROYECCIÓN, y está completa respecto de su propósito. Lo que no puede es
 * sembrar la colección destino, porque el resto de los campos **nunca se
 * midió**. Confundir las dos cosas es lo que hace que un `required` sin dato se
 * lea como «se me olvidó rellenarlo» en vez de «este dato no existe todavía».
 *
 * ── Los DOS ejes, que no son el mismo y se confundían ─────────────────────
 *   · **A · ¿la FILA es completa?** — ¿sale de una página construida, o es la
 *     proyección que pinta otra? Lo dice si el clon **emite ruta** para ella.
 *   · **B · ¿está el CORPUS completo?** — cuántas filas hay de las que existen
 *     en el original. 4 casos de 57 es un eje distinto de 4 casos incompletos.
 *
 * Una colección puede estar construida y con el corpus al 3 % (`casos`), o
 * tener el corpus entero y las filas proyectadas. Los dos ejes hay que darlos
 * por separado o la cobertura se lee al nivel de arriba, que es el error de
 * `CLAUDE.md` §El NIVEL al que se mide aplicado a un informe.
 *
 * ── De dónde sale cada lado, y ninguno se escribe a mano ──────────────────
 *   · las rutas emitidas → **`prerender-manifest.json`**, o sea el build;
 *   · las filas → los `src/lib/*.ts`, cargados como módulo;
 *   · las aristas colgantes → **`medidas/sondeo-frontera.json`**, la congelada
 *     del sondeo. No se recalculan aquí: dos definiciones de «lo mismo» son la
 *     clase C7 de este repo, y ésta es exactamente esa tentación.
 */
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, enApp, hoy, w } from "./lib.mjs";
import { CATALOGOS, cargaCatalogos } from "../seed/catalogos.mjs";
import { PREPARA } from "../seed/seed.mjs";

/* No abre el clon: lee su manifiesto. Pero el manifiesto ES del build, así que
 * la guarda de `BUILD_ID` sí tiene sentido aquí — no se desactiva. */

const MANIFIESTO = enApp(".next/prerender-manifest.json");
if (!fs.existsSync(MANIFIESTO)) {
  console.error(
    `\n❌ no hay \`prerender-manifest.json\` en ${MANIFIESTO}.\n` +
      `   Sin él la lista de rutas emitidas sería VACÍA y esta sonda diría que el\n` +
      `   clon no construyó nada — que es la regla del cero aplicada a la raíz.\n` +
      `   Construye antes: \`npm run build\`.`,
  );
  process.exit(2);
}
const RUTAS = new Set(Object.keys(JSON.parse(fs.readFileSync(MANIFIESTO, "utf8")).routes ?? {}));
if (RUTAS.size === 0) {
  console.error(`\n❌ el manifiesto existe y no declara NINGUNA ruta. No es una corrida limpia.`);
  process.exit(2);
}

/* La congelada del sondeo. Se exige LIMPIA: citar las aristas colgantes de una
 * corrida cuyo instrumento falló es exactamente lo que el PASO 1 vino a cerrar. */
const RUTA_SONDEO = path.join(QA, "medidas/sondeo-frontera.json");
if (!fs.existsSync(RUTA_SONDEO)) {
  console.error(`\n❌ falta ${RUTA_SONDEO}. Corre \`npm run cms:sondeo\` antes.`);
  process.exit(2);
}
const SONDEO = JSON.parse(fs.readFileSync(RUTA_SONDEO, "utf8"));
if (SONDEO.instrumento?.sinLlave?.length || SONDEO.grafo?.ciclos?.length || SONDEO.required?.sinAuditar?.length) {
  console.error(
    `\n❌ la congelada del sondeo es de una corrida con el INSTRUMENTO ROTO.\n` +
      `   Sus aristas colgantes no se pueden citar. Vuelve a correr \`cms:sondeo\`.`,
  );
  process.exit(2);
}
if (SONDEO.meta?.sabotaje) {
  console.error(`\n❌ la congelada del sondeo es de un SABOTAJE (${SONDEO.meta.sabotaje}), no de una medida.`);
  process.exit(2);
}

const catalogos = await cargaCatalogos();
const ev = new Evaluadas({ nombre: "cms-arquetipos", unidad: "colecciones", minimo: CATALOGOS.length });

/**
 * Cómo se construye la ruta de una fila. **Es el enrutado del §4, y sale de las
 * páginas del clon, no de una convención**: `/sectores/<slug>` porque existe
 * `app/sectores/[slug]`, `/<slug>` porque existe `app/[slug]`.
 */
const RUTA_DE = {
  productos: (f) => [`/${f.slug}`, f.padre ? `/${f.padre}/${f.slug}` : null],
  sectores: (f) => [`/sectores/${f.slug}`],
  monograficos: (f) => [`/sectores/${f.slug}`],
  "taxonomia-sectores": (f) => [`/sector/${f.slug}`],
  casos: (f) => [`/casos-de-exito/${f.slug}`, `/case-studies/${f.slug}`],
  faqs: (f) => [`/faqs/${f.slug}`],
  "entradas-blog": (f) => [`/${f.slug}`],
  "terminos-kunakpedia": (f) => [`/${f.slug}`],
  "documentos-cientificos": (f) => [
    `/recursos/${f.prefijo ?? "documentos-cientificos"}/${f.categoria?.slug}/${f.slug}`,
  ],
};

/* Aristas colgantes por colección de ORIGEN y por colección de DESTINO. Las dos
 * mitades: el origen dice quién no puede sembrarse; el destino, qué falta. */
const colgantesPorOrigen = SONDEO.huerfanas.porColeccion;
const colgantesPorDestino = {};
for (const [k, slugs] of Object.entries(SONDEO.huerfanas.porDestino)) {
  const destino = k.split(" → ")[1];
  (colgantesPorDestino[destino] ??= new Set());
  for (const s of slugs) colgantesPorDestino[destino].add(s);
}

const filas = [];
for (const c of CATALOGOS) {
  const rows = catalogos.get(c.coleccion);
  const prep = (f) => (PREPARA[c.coleccion] ?? ((x) => x))(f);
  let conRuta = 0;
  const sinRuta = [];
  for (const f of rows) {
    const cands = (RUTA_DE[c.coleccion]?.(prep(f)) ?? []).filter(Boolean);
    if (cands.some((r) => RUTAS.has(r))) conRuta++;
    else sinRuta.push(prep(f).slug);
  }
  ev.ok();
  filas.push({
    coleccion: c.coleccion,
    filas: rows.length,
    conRuta,
    sinRuta,
    colganteDesde: colgantesPorOrigen[c.coleccion] ?? 0,
    colganteHacia: colgantesPorDestino[c.coleccion]?.size ?? 0,
    clase: conRuta === rows.length ? "CONSTRUIDA" : conRuta === 0 ? "REFERENCIADA" : "MIXTA",
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * SALIDA
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ ARQUETIPOS · construidos vs referenciados ════════`);
console.log(`  ${RUTAS.size} rutas emitidas por el build · ${hoy()}\n`);
console.log(
  `  ${"colección".padEnd(24)}${"filas".padStart(6)}${"con ruta".padStart(10)}` +
    `${"colgantes↑".padStart(12)}${"colgantes↓".padStart(12)}   clase`,
);
for (const f of filas)
  console.log(
    `  ${f.coleccion.padEnd(24)}${String(f.filas).padStart(6)}${String(f.conRuta).padStart(10)}` +
      `${String(f.colganteDesde).padStart(12)}${String(f.colganteHacia).padStart(12)}   ${f.clase}`,
  );
console.log(
  `\n  colgantes↑ = relaciones de ESTA colección sin destino  ·  ` +
    `colgantes↓ = documentos de ESTA colección que otras piden y no existen`,
);

const referenciadas = filas.filter((f) => f.clase !== "CONSTRUIDA");
console.log(`\n  ⇒ la premisa «\`src/lib/*.ts\` SON los datos»:`);
for (const f of filas)
  console.log(
    `   ${f.clase === "CONSTRUIDA" ? "✓" : "✗"} ${f.coleccion.padEnd(24)} ` +
      (f.clase === "CONSTRUIDA"
        ? `cierta — las ${f.filas} filas salen de páginas que el clon sirve`
        : `FALSA para ${f.sinRuta.length} de ${f.filas} — proyección, no página: ${f.sinRuta.slice(0, 3).join(", ")}${f.sinRuta.length > 3 ? "…" : ""}`),
  );

w("medidas/cms-arquetipos.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿de qué colecciones es cierta la premisa «src/lib/*.ts son los datos»?",
    fuentes: {
      rutas: ".next/prerender-manifest.json (el build, no una lista)",
      filas: "src/lib/*.ts cargados como módulo",
      colgantes: "medidas/sondeo-frontera.json (congelada, verificada limpia)",
    },
    rutasEmitidas: RUTAS.size,
    ejeB:
      "ESTA SONDA NO MIDE EL EJE B (cuántas filas hay de las que existen en el original). " +
      "El corpus completo son 57 casos y 149 entradas; aquí sólo se cuenta lo transcrito.",
  },
  colecciones: filas,
  colgantesPorDestino: Object.fromEntries(
    Object.entries(colgantesPorDestino).map(([k, v]) => [k, [...v].sort()]),
  ),
});

console.log(
  `\n✅ ${filas.length} colecciones clasificadas · ` +
    `${filas.length - referenciadas.length} CONSTRUIDAS, ${referenciadas.length} con filas sólo referenciadas.\n` +
    `   ⚠ Eje B (cuánto del corpus hay) NO se mide aquí y se declara: 4 casos de 57,\n` +
    `     7 entradas de 149. Una colección puede estar CONSTRUIDA y al 3 % del corpus.\n`,
);
process.exit(0);
