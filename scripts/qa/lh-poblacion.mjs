/**
 * ¿PUEDE EL CLON EJERCITAR EL UNIVERSO QUE F3-2 DECLARA VERIFICAR?
 * Uso:  node lh-poblacion.mjs
 * Negativos:
 *   NEG=poblacion-completa SABOTAJE=completa node lh-poblacion.mjs  → exit 0
 *   NEG=serie-huerfana SABOTAJE=huerfana    node lh-poblacion.mjs  → exit ≠0
 *
 * ── La pregunta, y por qué no la contesta ninguna sonda anterior ───────────
 * `D2.5` fijó la entrega de F3-2 en **142 rutas** (35 índices + 107 de
 * paginación) y `P-LH-C3`/`P-LH-C7` las convirtieron en criterio de
 * verificación: *«las rutas emitidas coinciden con una corrida de
 * `qa:lh-paginas` del día»* y *«las 55 vacías cumplen SU contrato»*.
 *
 * **Los tres números salen del ORIGINAL.** Un listado no tiene contenido
 * propio: es una CONSULTA, y cuántas páginas emite es una función de **cuántos
 * documentos hay en la colección que consulta**. El clon consulta **su** DB.
 *
 * Nadie había puesto los dos lados en la misma tabla. Esta sonda lo hace:
 *
 *   original → `medidas/lh-serie.json` (congelada, población COMPLETA de F3-0)
 *   clon     → la DB por Local API, `estado=publicado` — la MISMA fuente que
 *              usa el build (la lección de `slugs.mjs`: anclarse a `src/lib`
 *              es anclarse a algo que el propio trabajo mueve)
 *
 * ── Por qué sale ROJA a propósito ─────────────────────────────────────────
 * Mientras el clon no pueda ejercitar el universo, un «✅» aquí sería
 * exactamente el verde falso que `CLAUDE.md` §sondas persigue: *no encontrar
 * nada y no mirar nada dan la misma salida*. Precedente en el propio repo:
 * `§LH-CONTENEDOR-ROL` vigiló su caso saliendo roja hasta que se decidió.
 * La ficha que la cierra: `PENDIENTES-QA.md` §ESCALÓN F3-2 (4.º) · POBLACIÓN.
 *
 * ── Lo que esta sonda NO mide ─────────────────────────────────────────────
 * · píxeles — no abre navegador ni pide una sola URL;
 * · si sembrar el corpus entero es la salida correcta: eso es **una decisión**
 *   y va a `DECISIONES.md`, no a un instrumento (§la causa común: un criterio
 *   de medición ocupando el sitio de una decisión);
 * · el reparto por término de las etiquetas: el clon no tiene la taxonomía
 *   poblada, así que la comparación por serie de `/etiqueta/*` se agrega a su
 *   colección de origen y **se declara agregada**.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // no arranca el clon: lee la DB y dos congeladas
gritaSiRevienta();

const SERIE = JSON.parse(readFileSync(join(QA, "medidas/lh-serie.json"), "utf8"));

/* ══════════════════════════════════════════════════════════════════════════
 * LAS DOS CONGELADAS NO CUENTAN LO MISMO, Y HAY QUE DECIR CUÁL MANDA
 *
 * `lh-serie` cuenta **páginas capturadas** (149); `lh-paginas` cuenta **rutas
 * bajo el criterio de `D2.5`** (142). La diferencia son **7 series** que la
 * captura recorrió hasta `/page/2/` y que **no paginan**: sirven 200 para
 * cualquier `N` con canonical a la página 1, o sea `D2.4` — *«no soy una
 * ruta»*. Sumar `lh-serie` y llamarlo «las rutas de la entrega» sería citar un
 * número de una fuente con la etiqueta de otra, que es como se fabrican los
 * denominadores mal formados de §D4.
 *
 * Manda **`lh-paginas`**, y la del DÍA (`P-LH-C3`): se elige la congelada más
 * reciente y **se declara cuál** en la salida.
 * ═════════════════════════════════════════════════════════════════════════ */
const CANDIDATAS = readdirSync(join(QA, "medidas"))
  .filter((f) => /^lh-paginas.*\.json$/.test(f) && !/-neg-|SABOTAJE|SONDA-/.test(f))
  .map((f) => ({ f, j: JSON.parse(readFileSync(join(QA, "medidas", f), "utf8")) }))
  .sort((a, b) => String(b.j.meta?.fecha ?? "").localeCompare(String(a.j.meta?.fecha ?? "")));
if (!CANDIDATAS.length) {
  console.error(`\n❌ no hay ninguna congelada de \`lh-paginas\` en medidas/. Corre \`npm run qa:lh-paginas\` primero.\n`);
  process.exit(2);
}
const { f: FUENTE_PAGINAS, j: PAGINAS } = CANDIDATAS[0];
/** `lh-paginas` indexa por ruta completa (`/es/blog/`) y `lh-serie` por ruta
 * relativa (`/blog`). Se normalizan las dos a la relativa sin barra final. */
const rel = (r) => ("/" + String(r).replace(/^\/es\//, "").replace(/^\/+|\/+$/g, "")).replace(/\/$/, "");
const PAGINAS_POR_RUTA = new Map(Object.entries(PAGINAS.paginas).map(([r, v]) => [rel(r), v]));

/**
 * De qué colección se sirve cada serie. **Derivado del HTML capturado, no
 * supuesto**: los `href` de las tarjetas de `/recursos/articulos/` apuntan a
 * `/es/{slug}/` del plano de raíz —los mismos documentos que `/blog`—, así que
 * `L1-blog` y `L1-resources` **consultan el mismo pozo** y lo que los separa es
 * la taxonomía, no el content type.
 *
 * `hub` = página compuesta cuyo listado embebido no es una consulta paginada de
 * colección (`L4`): no tiene población que comparar.
 */
const MAPA = [
  { prefijo: "/blog", coleccion: "entradas-blog", forma: "L1-blog" },
  { prefijo: "/etiqueta/", coleccion: "entradas-blog", forma: "L1-etiqueta" },
  { prefijo: "/recursos/articulos", coleccion: "entradas-blog", forma: "L1-resources" },
  { prefijo: "/recursos/seminarios-web", coleccion: "entradas-blog", forma: "L1-resources" },
  { prefijo: "/glosario", coleccion: "terminos-kunakpedia", forma: "L2-glosario" },
  { prefijo: "/preguntas-frecuentes", coleccion: "faqs", forma: "L2-faqs" },
  { prefijo: "/scientific-category/", coleccion: "documentos-cientificos", forma: "L3-sci" },
  { prefijo: "/casos-de-exito", coleccion: "casos", forma: "L5-casos" },
  { prefijo: "/recursos/kunakpedia", coleccion: null, forma: "L4-hub" },
  { prefijo: "/recursos/documentos-cientificos", coleccion: null, forma: "L4-hub" },
  { prefijo: "/recursos/preguntas-frecuentes", coleccion: null, forma: "L4-hub" },
  { prefijo: "/recursos", coleccion: null, forma: "L4-hub" },
  { prefijo: "/productos", coleccion: null, forma: "L4-hub" },
  { prefijo: "/sectores", coleccion: null, forma: "L4-hub" },
];
/* El más largo primero: `/recursos/articulos` tiene que ganarle a `/recursos`. */
const ORDENADO = [...MAPA].sort((a, b) => b.prefijo.length - a.prefijo.length);
const deQuien = (ruta) => ORDENADO.find((m) => ruta === m.prefijo || ruta.startsWith(m.prefijo + "/") || (m.prefijo.endsWith("/") && ruta.startsWith(m.prefijo)));

const SABOTAJE = process.env.SABOTAJE;

/* ─────────────── el ORIGINAL, de la congelada ─────────────── */

const series = Object.entries(SERIE.series).map(([ruta, s]) => {
  const conContenido = s.paginas.filter((p) => !p.vacia);
  const pag = PAGINAS_POR_RUTA.get(rel(ruta));
  return {
    ruta,
    map: deQuien(ruta),
    paginasCapturadas: s.nPaginas,
    /** Bajo `D2.5` una serie que no pagina aporta **una** ruta, no las que la
     * captura recorrió: su canonical dice que no son rutas (`D2.4`). */
    paginaDeVerdad: pag ? pag.paginaDeVerdad === true : null,
    rutasD25: pag ? (pag.paginaDeVerdad ? pag.paginas : 1) : null,
    paginasConContenido: conContenido.length,
    tarjetasPrimera: s.paginas[0]?.tarjetas ?? 0,
    porPagina: Math.max(0, ...s.paginas.map((p) => p.tarjetas)),
    clases: s.clases,
  };
});

/* GUARDA 0 · las dos congeladas tienen que hablar de las MISMAS series. Un
 * emparejamiento que falla en silencio dejaría `rutasD25: null` y el total
 * saldría corto sin que nada protestara (§sondas 4: un selector que no casa da
 * cero, no error). */
const sinPar = series.filter((s) => s.rutasD25 === null).map((s) => s.ruta);
if (sinPar.length) {
  console.error(
    `\n❌ ${sinPar.length} serie(s) de \`lh-serie.json\` sin par en \`${FUENTE_PAGINAS}\`:\n` +
      sinPar.map((r) => `     · ${r}`).join("\n") +
      `\n   Las dos congeladas tienen que cubrir las mismas 35 series.\n`,
  );
  process.exit(2);
}
if (SABOTAJE === "huerfana") {
  console.log(`\n⚠ SABOTAJE=huerfana — serie sin mapear inyectada. Esta corrida DEBE fallar.\n`);
  series.push({ ruta: "/inventada-por-el-sabotaje", map: undefined, paginasCapturadas: 3, paginaDeVerdad: true, rutasD25: 3, paginasConContenido: 2, tarjetasPrimera: 9, porPagina: 9, clases: [] });
}

/* GUARDA 1 · una serie sin mapear TIRA. Es la de `captura-f3` («familia sin
 * decidir») en la unidad de esta sonda: sin ella, una familia nueva se cuenta
 * como «sin población que comparar» y el informe la da por cubierta. */
const huerfanas = series.filter((s) => !s.map).map((s) => s.ruta);
if (huerfanas.length) {
  console.error(
    `\n❌ ${huerfanas.length} serie(s) de \`lh-serie.json\` que \`MAPA\` no cubre:\n` +
      huerfanas.map((r) => `     · ${r}`).join("\n") +
      `\n   Una serie sin colección declarada no es «sin población»: es SIN MIRAR.\n`,
  );
  process.exit(2);
}

/* ─────────────── el CLON, de la DB que usa el build ─────────────── */

const COLECCIONES = [...new Set(MAPA.map((m) => m.coleccion).filter(Boolean))];

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

const ev = new Evaluadas({ nombre: "lh-poblacion", unidad: "series comparadas", minimo: series.length });

const clon = {};
for (const coleccion of COLECCIONES) {
  const { totalDocs } = await payload.find({
    collection: coleccion,
    where: { estado: { equals: "publicado" } },
    limit: 0,
    depth: 0,
  });
  clon[coleccion] = totalDocs;
}
await payload.db.destroy?.();

/* El negativo que prueba que esta sonda SABE ponerse verde: con la población
 * del original, el veredicto tiene que ser ✅. Sin él, una sonda que sólo sabe
 * salir roja no distingue «el clon no llega» de «el código siempre falla». */
if (SABOTAJE === "completa") {
  console.log(`\n⚠ SABOTAJE=completa — al clon se le atribuye la población del ORIGINAL. Esta corrida DEBE salir VERDE.\n`);
  for (const coleccion of COLECCIONES) {
    clon[coleccion] = Math.max(
      0,
      ...series.filter((s) => s.map.coleccion === coleccion).map((s) => poblacionOriginal(s).n),
    );
  }
}

/**
 * Los documentos DISTINTOS que la serie recorre.
 *
 * Normalmente es la SUMA de las tarjetas de sus páginas con contenido. Pero
 * `/casos-de-exito` sirve **las 57 en las dos páginas** —no pagina, repite— y
 * sumar daría 114. El discriminador **no se cablea a esa ruta**: una serie que
 * repite trae **una sola clase estructural** y el mismo número de tarjetas en
 * todas sus páginas con contenido, que es justo lo que `lh-serie` ya mide.
 * El camino usado se declara en `via` (§sondas: un heurístico va declarado,
 * nunca como identidad).
 */
function poblacionOriginal(s) {
  const paginas = (SERIE.series[s.ruta]?.paginas ?? []).filter((p) => !p.vacia);
  if (paginas.length <= 1) return { n: s.tarjetasPrimera, via: "pagina-unica" };
  const repite = s.clases.length === 1 && paginas.every((p) => p.tarjetas === s.porPagina);
  if (repite) return { n: s.porPagina, via: "repite-en-todas-sus-paginas" };
  return { n: paginas.reduce((a, p) => a + p.tarjetas, 0), via: "suma-de-paginas-con-contenido" };
}

/* ─────────────── la comparación, serie a serie ─────────────── */

const filas = [];
for (const s of series) {
  const col = s.map.coleccion;
  const { n: orig, via } = poblacionOriginal(s);
  if (!col) {
    filas.push({ ...s, coleccion: null, poblacionOriginal: orig, via, poblacionClon: null, paginasClon: null, alcanza: null });
    ev.ok();
    continue;
  }
  const disponible = clon[col] ?? 0;
  /* El clon no tiene la taxonomía poblada: para las series de término, lo más
   * favorable que se puede afirmar es que dispone de TODA su colección. Es una
   * cota SUPERIOR, y se declara como tal — si ni así llega, no llega. */
  const paginasClon = !s.paginaDeVerdad
    ? 1
    : s.porPagina > 0
      ? Math.max(1, Math.ceil(Math.min(disponible, orig) / s.porPagina))
      : 1;
  filas.push({
    ...s,
    coleccion: col,
    poblacionOriginal: orig,
    via,
    poblacionClon: disponible,
    cotaSuperior: true,
    paginasClon,
    alcanza: disponible >= orig,
  });
  ev.ok();
}

/* ─────────────── informe ─────────────── */

const conPoblacion = filas.filter((f) => f.coleccion);
const cortas = conPoblacion.filter((f) => !f.alcanza);
const rutasD25 = filas.reduce((a, f) => a + f.rutasD25, 0);
const paginasCapturadas = filas.reduce((a, f) => a + f.paginasCapturadas, 0);
const noPaginanConCaptura = filas.filter((f) => !f.paginaDeVerdad && f.paginasCapturadas > 1);
const rutasClon = filas.reduce((a, f) => a + (f.paginasClon ?? f.rutasD25), 0);

console.log(`\n════════ lh-poblacion · ¿puede el clon ejercitar el universo de F3-2? ════════\n`);
console.log(`  original → medidas/lh-serie.json + medidas/${FUENTE_PAGINAS} (${PAGINAS.meta?.fecha ?? "sin fecha"})`);
console.log(`  clon     → DB por Local API, estado=publicado\n`);
console.log(`  población del CLON, por colección:`);
for (const c of COLECCIONES) console.log(`    · ${c.padEnd(24)} ${String(clon[c]).padStart(4)}`);

console.log(`\n  serie                                          orig  clon   rutas D2.5 → clon`);
for (const f of filas) {
  if (!f.coleccion) {
    console.log(`  ⊘ ${f.ruta.padEnd(46)}   —     —    ${String(f.rutasD25).padStart(3)}  (hub: sin población que comparar)`);
    continue;
  }
  const marca = f.alcanza ? "✅" : "⛔";
  console.log(
    `  ${marca} ${f.ruta.padEnd(46)}${String(f.poblacionOriginal).padStart(4)}${String(f.poblacionClon).padStart(6)}   ` +
      `${String(f.rutasD25).padStart(3)} → ${String(f.paginasClon).padStart(3)}`,
  );
}

console.log(`\n  ── el número de la entrega, por los dos lados ──`);
console.log(`  rutas que D2.5 declara (criterio canonical)  : ${rutasD25}`);
console.log(`  rutas que el clon PODRÍA emitir hoy (cota)   : ${rutasClon}`);
console.log(`  series que NO alcanzan                       : ${cortas.length} de ${conPoblacion.length}`);
console.log(`\n  ⚠ Y las dos congeladas NO cuentan lo mismo: \`lh-serie\` capturó`);
console.log(`    ${paginasCapturadas} páginas y \`lh-paginas\` declara ${rutasD25} rutas. La diferencia son`);
console.log(`    ${noPaginanConCaptura.length} series que la captura recorrió hasta /page/2/ y que NO paginan`);
console.log(`    (canonical → la página 1, o sea D2.4): ${noPaginanConCaptura.map((f) => f.ruta).join(" · ")}`);
console.log(`\n  ⚠ La columna «clon» es una COTA SUPERIOR: se le atribuye a cada serie de`);
console.log(`    término TODA su colección, porque el clon no tiene la taxonomía poblada.`);

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿tiene el clon población para emitir y verificar las 142 rutas que D2.5 declara?",
    fuentes: {
      original: `medidas/lh-serie.json (población COMPLETA de F3-0) + medidas/${FUENTE_PAGINAS} (${PAGINAS.meta?.fecha ?? "sin fecha"}) — manda ésta para el recuento de rutas`,
      clon: "DB por Local API, estado=publicado — la misma fuente que usa el build",
    },
    sabotaje: SABOTAJE ?? null,
    noMide: [
      "píxeles: no abre navegador ni pide una URL",
      "si sembrar el corpus entero es la salida correcta: eso es una DECISIÓN, no una medida",
      "el reparto por término: el clon no tiene la taxonomía poblada; la columna del clon es COTA SUPERIOR",
    ],
  },
  poblacionClon: clon,
  series: filas,
  resumen: {
    rutasD25: rutasD25,
    paginasCapturadasPorLhSerie: paginasCapturadas,
    seriesQueCapturaronSinPaginar: noPaginanConCaptura.map((f) => f.ruta),
    rutasClonCotaSuperior: rutasClon,
    seriesQueNoAlcanzan: cortas.length,
    seriesConPoblacion: conPoblacion.length,
    deficitPorColeccion: Object.fromEntries(
      COLECCIONES.map((c) => {
        const suyas = conPoblacion.filter((f) => f.coleccion === c);
        const mayorSerie = Math.max(0, ...suyas.map((f) => f.poblacionOriginal));
        return [c, { clon: clon[c], mayorSerie, deficit: Math.max(0, mayorSerie - clon[c]) }];
      }),
    ),
  },
};
w("medidas/lh-poblacion.json", salida);

if (cortas.length) {
  console.error(
    `\n⛔ EL CLON NO PUEDE EJERCITAR EL UNIVERSO — ${cortas.length} de ${conPoblacion.length} series se quedan cortas.\n` +
      `\n   Y no es un fleco de datos: los criterios de verificación ya escritos\n` +
      `   presuponen la población del ORIGINAL —\`P-LH-C3\` (las rutas emitidas\n` +
      `   coinciden con una corrida del día), \`P-LH-C7\` (las 55 vacías cumplen su\n` +
      `   contrato) y la comparación PAR A PAR, que necesita que la página N del\n` +
      `   clon y la del original tengan las mismas tarjetas—.\n` +
      `\n   Esto NO lo decide una sonda. Ficha: \`PENDIENTES-QA.md\` §ESCALÓN F3-2\n` +
      `   (4.º) · POBLACIÓN. Congelada: medidas/lh-poblacion.json\n`,
  );
} else {
  console.log(`\n✅ el clon alcanza la población del original en las ${conPoblacion.length} series con listado.\n`);
}

/* ⚠ Sale con el código CALCULADO, nunca con un `0` fijo — el defecto que
 * `lh-paginas` pagó (§sondas 1 por la puerta de atrás: un `process.exit(0)`
 * final RESETEA el `exitCode` que ya había puesto una guarda). Y hace falta un
 * `exit` explícito: Payload deja el pool abierto y sin esto el proceso no
 * termina, que en un test en negativo se lee como TIMEOUT y no como veredicto. */
process.exit(cortas.length ? 2 : 0);
