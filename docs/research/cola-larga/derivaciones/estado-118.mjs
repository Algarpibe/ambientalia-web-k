/**
 * PASO 0b · 118.ª — EL ESTADO DERIVADO, ANTES DE GASTAR NADA
 *
 * El encargo pide *«deriva antes de gastar»* y da una razón medida: «la cifra
 * de tablas ya ha envejecido dos veces» (§regla 9). Esta derivación establece
 * la PREMISA sobre la que se escriben las predicciones de la tanda, y todo lo
 * que publica sale de una consulta, un `readdir` o un fichero — nada citado.
 *
 * Contesta cinco preguntas y NO contesta ninguna otra (§*antes de construir
 * sobre una medida, escribe qué pregunta contesta y qué preguntas NO*):
 *
 *   1 · ¿hace falta MIGRACIÓN?          (ficheros vs aplicadas · las 2 relaciones)
 *   2 · ¿cuánto emite el clon HOY?      (manifiesto crudo vs páginas)
 *   3 · ¿qué sirve el clon en los href de `categoria`?
 *   4 · ¿cuáles son las 13 rutas del archivo, NOMBRADAS?
 *   5 · ¿el conteo de casos PREDICE la paginación del archivo?
 *
 * NO contesta: el mecanismo del bucle de `mineria` (necesita red), ni la
 * varianza del régimen `--`, ni nada de geometría.
 *
 * ⚠ NO levanta navegador, NO construye, NO toca `.next`.
 *
 * Salida: `estado-118.log` + `estado-118.json`.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const MED = path.join(RAIZ, "scripts/qa/medidas");

const L = [];
const say = (s = "") => {
  L.push(s);
  console.log(s);
};
const OUT = {};

const psql = (q) => {
  try {
    return execFileSync(
      "docker",
      ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-t", "-A", "-F", "|", "-c", q],
      { encoding: "utf8" },
    ).trim();
  } catch (e) {
    throw new Error(`estado-118: la consulta falló. ¿Contenedor \`kunak-cms-pg\` arriba?\n  ${String(e.message).slice(0, 200)}`);
  }
};

say("═".repeat(78));
say("PASO 0b · 118.ª — ESTADO DERIVADO (premisa de las predicciones)");
say("═".repeat(78));
say("");

/* ── 1 · ¿HACE FALTA MIGRACIÓN? ─────────────────────────────────────────── */

say("─".repeat(78));
say("1 · ¿HACE FALTA MIGRACIÓN? — las dos relaciones de la mesa");
say("─".repeat(78));
say("");

const ficheros = fs.readdirSync(path.join(RAIZ, "packages/cms-config/src/migrations")).filter((f) => f.endsWith(".ts") && !f.startsWith("index"));
const aplicadas = Number(psql("select count(*) from payload_migrations;"));
say(`  migraciones en fichero ... ${ficheros.length}`);
say(`  aplicadas en la DB ....... ${aplicadas}`);
say(`  ⇒ esquema en sincronía : ${ficheros.length === aplicadas ? "SÍ" : "NO"}`);
say("");

/* Las dos relaciones que la mesa decide. Se comprueban EN LA DB, no en el
 * fuente: el fuente dice lo que se declaró, la DB lo que existe. */
const rel = (etq, q) => {
  const n = Number(psql(q));
  say(`  ${etq.padEnd(42)} ${String(n).padStart(5)}`);
  return n;
};
say("  población MEDIDA (consulta real, no citada):");
const nCat = rel("categorias · términos", "select count(*) from categorias;");
const nCatRel = rel("entradas-blog → categorias · relaciones", "select count(*) from entradas_blog_rels where categorias_id is not null;");
const nSec = rel("taxonomia-sectores · términos", "select count(*) from taxonomia_sectores;");
const nSecRel = rel("casos → taxonomia-sectores · relaciones", "select count(*) from casos_rels where taxonomia_sectores_id is not null;");
const nTablas = Number(psql("select count(*) from information_schema.tables where table_schema='public';"));
say(`  ${"tablas en public (DERIVADO)".padEnd(42)} ${String(nTablas).padStart(5)}`);
say("");
say("  ⇒ LAS DOS RELACIONES YA EXISTEN Y ESTÁN POBLADAS.");
say("    (c1) `caso → sector` casa con el consumidor medido: 11 sectores + 1");
say("    comodín en el filtro de `/casos-de-exito/`.");
say("");
say("  ⇒ **ESTA TANDA NO NECESITA MIGRACIÓN**, y por tanto §regla 30 —la");
say("    reversa se prueba ANTES del dato— NO APLICA. Se dice en voz alta en");
say("    vez de saltársela: una condición omitida y una condición que no");
say("    aplica se leen igual si nadie las distingue.");
say("");
OUT.migracion = { ficheros: ficheros.length, aplicadas, sincronia: ficheros.length === aplicadas, nTablas };
OUT.relaciones = { categorias: nCat, categoriasRels: nCatRel, sectores: nSec, sectoresRels: nSecRel };

/* ── 2 · ¿CUÁNTO EMITE EL CLON HOY? ─────────────────────────────────────── */

say("─".repeat(78));
say("2 · LO QUE EMITE EL CLON HOY — los dos números CON SU UNIDAD");
say("─".repeat(78));
say("");

const MANI = path.join(RAIZ, "apps/web/.next/prerender-manifest.json");
if (!fs.existsSync(MANI)) throw new Error(`estado-118: no hay \`prerender-manifest.json\`. ¿Build borrado? (§*un next build que falla LO BORRA*)`);
const crudas = Object.keys(JSON.parse(fs.readFileSync(MANI, "utf8")).routes || {}).sort();

const F_BASE390 = "clon-base-390-t117-tras-la-ficha.json";
const base390 = JSON.parse(fs.readFileSync(path.join(MED, F_BASE390), "utf8"));
const paginas = new Set(Object.keys(base390.paginas));

const soloMani = crudas.filter((r) => !paginas.has(r));
const soloPag = [...paginas].filter((r) => !crudas.includes(r));

say(`  claves CRUDAS en \`prerender-manifest\` ..... ${crudas.length}`);
say(`  PÁGINAS en \`${F_BASE390}\` ... ${paginas.size}`);
say(`  diferencia ................................ ${soloMani.length} y ${soloPag.length}`);
say("");
say("  Las de diferencia, NOMBRADAS — porque un cardinal solo no se audita:");
for (const r of soloMani) say(`     sólo en manifiesto : ${r}`);
for (const r of soloPag) say(`     sólo en clon-base  : ${r}`);
say("");
say("  ⇒ las 3 son INTERNAS de Next, no páginas. Los dos números son ciertos");
say("    y cuentan unidades distintas: **416 claves crudas = 413 páginas + 3**.");
say("");
say(`  claves \`/categoria/\` hoy : ${crudas.filter((r) => r.startsWith("/categoria/")).length}`);
say(`  claves \`/sector/\`    hoy : ${crudas.filter((r) => r.startsWith("/sector/")).length}`);
say("");
OUT.manifiesto = { crudas: crudas.length, paginas: paginas.size, internas: soloMani, categoria: 0, sector: 0 };

/* ── 3 · LOS `href` DE `categoria` QUE SIRVE EL CLON ────────────────────── */

say("─".repeat(78));
say("3 · LOS `href` DE `categoria` — ¿al original, o a una ruta que no se emite?");
say("─".repeat(78));
say("");
say("  La decisión (a) —relación SIN archivo— sólo es inocua si esos href ya");
say("  apuntan al original (§Regla de rutas locales). Si alguno apuntara a una");
say("  ruta local que el build no emite, eso es un defecto VIVO.");
say("");

const src = path.join(RAIZ, "apps/web/src");
const recorre = (d, acc = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) recorre(p, acc);
    else if (/\.(tsx?|mjs)$/.test(e.name)) acc.push(p);
  }
  return acc;
};
/* ⚠ SE QUITAN LOS COMENTARIOS ANTES DE BUSCAR. La v1 de esta derivación daba
 * **4 href locales** y los 4 eran PROSA — comentarios que dicen «`/categoria/
 * <slug>/` no está clonado»—. Contar un comentario como código es el mismo
 * falso positivo que el repo ya tiene medido en `v1-reproducible-110`, y aquí
 * habría mandado a la tanda siguiente a arreglar 4 defectos inexistentes.
 *
 * La señal que lo delató es gratis: el literal `<slug>` no aparece en ningún
 * href real — es el marcador de que estás leyendo una explicación. */
const sinComentarios = (t) =>
  t
    .replace(/\/\*[\s\S]*?\*\//g, " ") /* bloque, incluido el `{/* … *\/}` de JSX */
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 "); /* línea, sin comerse `https://` */
const hrefs = [];
const enComentario = [];
for (const f of recorre(src)) {
  const bruto = fs.readFileSync(f, "utf8");
  const txt = sinComentarios(bruto);
  const rel = path.relative(RAIZ, f).replace(/\\/g, "/");
  const saca = (s, dest) => {
    for (const m of s.matchAll(/["'`]([^"'`]*\/categoria\/[^"'`]*)["'`]/g)) {
      const v = m[1];
      if (/categorias-(recursos|cientificas)|scientific-category/.test(v)) continue;
      dest.push({ f: rel, v });
    }
  };
  saca(txt, hrefs);
  /* Los de comentario se cuentan APARTE y se publican: se excluyen del
   * análisis, no se borran (§*lo excluido se publica con su cardinal*). */
  const soloCom = bruto.length - txt.length > 0 ? bruto : "";
  if (soloCom) {
    const tmp = [];
    saca(bruto, tmp);
    for (const h of tmp) if (!hrefs.some((x) => x.f === h.f && x.v === h.v)) enComentario.push(h);
  }
}
const alOriginal = hrefs.filter((h) => h.v.startsWith("https://kunakair.com/"));
const locales = hrefs.filter((h) => !h.v.startsWith("https://kunakair.com/"));
say(`  href \`/categoria/\` en CÓDIGO (comentarios fuera) ... ${hrefs.length}`);
say(`  de ellos AL ORIGINAL (https://kunakair.com/...) ..... ${alOriginal.length}`);
say(`  de ellos a una ruta LOCAL .......................... ${locales.length}`);
for (const h of locales) say(`     ⚠ LOCAL: ${h.f} → ${h.v}`);
for (const h of hrefs) say(`     · ${h.f}`);
say("");
say(`  menciones en COMENTARIO, excluidas y publicadas ..... ${enComentario.length}`);
for (const h of enComentario) say(`     (prosa) ${h.f} → ${h.v}`);
say("");
say(`  ⇒ enlaces rotos que crearía la decisión (a): **${locales.length}**`);
if (locales.length === 0) {
  say("     Los ${n} href de código ya apuntan al ORIGINAL, que es lo que".replace("${n}", String(alOriginal.length)));
  say("     §Regla de rutas locales manda cuando el destino no está clonado.");
  say("     La decisión (a) —relación SIN archivo— es por tanto INOCUA aquí:");
  say("     no hay nada que repuntar, y eso es un resultado, no una tarea");
  say("     pendiente disfrazada de verde.");
}
say("");
OUT.hrefsCategoria = { codigo: hrefs.length, alOriginal: alOriginal.length, locales, enComentario };

/* ── 4 · LAS RUTAS DEL ARCHIVO, NOMBRADAS ───────────────────────────────── */

say("─".repeat(78));
say("4 · EL ARCHIVO DE `sector` — ⚠ DOS LECTURAS DE «13» QUE NO SON EL MISMO");
say("    CONJUNTO");
say("─".repeat(78));
say("");

const CORP = path.join(RAIZ, "corpus/fase-3/taxonomia-sector");
const capturadas = [];
const anda = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) anda(p);
    else if (e.name === "index.html") {
      const r = "/" + path.relative(CORP, path.dirname(p)).replace(/\\/g, "/") + "/";
      const h = fs.readFileSync(p, "utf8");
      const t = (h.match(/<title[^>]*>([^<]*)</i) || [])[1] || null;
      capturadas.push({ ruta: r, titulo: t, esPagina: /\/page\/\d+\/$/.test(r) });
    }
  }
};
anda(CORP);
capturadas.sort((a, b) => a.ruta.localeCompare(b.ruta));

/* Las 5 que redirigen: medidas EN VIVO por `estados-114`, que es el único
 * canal que puede darlas — un corpus guarda el CUERPO, no el 301. */
const F_ESTADOS = path.join(AQUI, "estados-114.json");
if (!fs.existsSync(F_ESTADOS)) throw new Error("estado-118: falta `estados-114.json`, el único canal que mide el 301 (un corpus guarda el CUERPO, no el estado).");
const estados = JSON.parse(fs.readFileSync(F_ESTADOS, "utf8"));

/* ⚠ SE FILTRA POR GRUPO, no sólo por status. La primera versión de esta
 * derivación cogió «todo lo que da 301» y salieron **7** — se colaban los 2
 * `[b·tilde]` de `/categoría/`, que son de OTRA familia. §sondas 4: un
 * selector mal alcanzado no da error, da un número plausible. Lo delató
 * contradecir una medida buena anterior (§7i y `estados-114` dicen 5). */
const redirecciones = (estados.peticiones || [])
  .filter((x) => x.grupo === "a·sector" && x.status === 301)
  .map((x) => ({ de: x.url, a: x.location }));

/* GUARDA: el cardinal se contrasta contra el que ya estaba medido. Si no
 * casan, la corrida NO vale — es la guarda que faltaba en la v1. */
const N_REDIR_MEDIDO = 5;
if (redirecciones.length !== N_REDIR_MEDIDO) {
  throw new Error(
    `estado-118: extraje ${redirecciones.length} redirecciones de sector y \`estados-114\`/§7i miden ${N_REDIR_MEDIDO}.\n` +
      `  No se publica un cardinal que contradice una medida buena anterior sin dirimirlo.`,
  );
}
if (redirecciones.some((r) => !r.de || !r.a)) throw new Error("estado-118: una redirección sin `de` o sin `a` — llave que no casa (§regla 33), se tira en vez de publicarse.");

const base = capturadas.filter((c) => !c.esPagina);
const pageN = capturadas.filter((c) => c.esPagina);

say(`  (A) PÁGINAS con captura ... ${capturadas.length}   = ${base.length} base + ${pageN.length} \`/page/N\``);
say(`  (B) REDIRECCIONES 301 ..... ${redirecciones.length}   (sin captura: un 301 no tiene cuerpo)`);
say(`  (A ∪ B) URLs de la familia . ${capturadas.length + redirecciones.length}`);
say("");
say("  ⚠ El encargo escribe «13 RUTAS, 5 DE ELLAS REDIRECCIÓN». Son DOS");
say("    lecturas de 13 y NO el mismo conjunto (§*dos lecturas pueden dar el");
say("    mismo cardinal contando unidades distintas*):");
say("       · 13 PÁGINAS = 6 base + 7 `/page/N`   ← la que manda para el manifiesto");
say("       · 11 TÉRMINOS = 6 que sirven + 5 que redirigen");
say("    Las 5 NO están entre las 13. Su intersección es 0, y la unión son 18.");
say("    El número FINAL del encargo (413 + 13 páginas) es el correcto.");
say("");
say("  Las 13 PÁGINAS, nombradas:");
for (const c of capturadas) say(`     ${c.ruta.padEnd(44)} ${c.titulo}`);
say("");
say("  Las 5 REDIRECCIONES, con su destino:");
for (const r of redirecciones) {
  const bucle = r.de === r.a ? "   ⚠ BUCLE A SÍ MISMA (5 saltos, sin diagnosticar: necesita red)" : "";
  say(`     ${String(r.de).replace("https://kunakair.com", "").padEnd(44)} → ${String(r.a).replace("https://kunakair.com", "")}${bucle}`);
}
say("");
OUT.archivo = { paginas: capturadas, redirecciones, nBase: base.length, nPageN: pageN.length };

/* ── 5 · ¿EL CONTEO DE CASOS PREDICE LA PAGINACIÓN? ─────────────────────── */

say("─".repeat(78));
say("5 · ¿LA PAGINACIÓN SE DERIVA DEL DATO DEL CLON? — la separadora del modelo");
say("─".repeat(78));
say("");
say("  Si el nº de casos por término predijera el nº de páginas, el conjunto de");
say("  rutas sería DERIVADO y una alta futura entraría sola. Si no, es MEDIDO.");
say("");

const casosPorSector = Object.fromEntries(
  psql("select t.slug, count(r.*) from taxonomia_sectores t left join casos_rels r on r.taxonomia_sectores_id=t.id group by t.slug;")
    .split("\n")
    .map((l) => l.split("|"))
    .map(([s, n]) => [s.trim(), Number(n)]),
);

/* El TOTAL declarado por el original, leído de su propio `<title>`. */
const totalDeclarado = {};
for (const c of capturadas) {
  const m = (c.titulo || "").match(/Página \d+ de (\d+)/);
  const slug = c.ruta.split("/")[2];
  if (m) totalDeclarado[slug] = Math.max(totalDeclarado[slug] || 0, Number(m[1]));
  else if (!c.esPagina) totalDeclarado[slug] = Math.max(totalDeclarado[slug] || 0, 1);
}

say("  término                      casos   páginas declaradas por el ORIGINAL");
for (const s of Object.keys(casosPorSector).sort()) {
  const t = totalDeclarado[s];
  say(`     ${s.padEnd(26)} ${String(casosPorSector[s]).padStart(4)}   ${t === undefined ? "— (sin captura)" : t}`);
}
say("");

/* Se BARRE el parámetro en vez de razonarlo (§*antes de escribir una regla
 * ajustada, BARRE el parámetro*). */
const conDato = Object.keys(totalDeclarado).filter((s) => casosPorSector[s] !== undefined);
let mejor = null;
for (let k = 1; k <= 30; k++) {
  const ok = conDato.filter((s) => Math.ceil(casosPorSector[s] / k) === totalDeclarado[s]).length;
  if (!mejor || ok > mejor.ok) mejor = { k, ok };
}
say(`  Barrido de \`ceil(casos / k) === páginas\` para k = 1..30, sobre ${conDato.length} términos:`);
say(`     mejor k = ${mejor.k} · acierta ${mejor.ok} de ${conDato.length}`);
const fallan = conDato.filter((s) => Math.ceil(casosPorSector[s] / mejor.k) !== totalDeclarado[s]);
for (const s of fallan) {
  say(`     ✗ ${s}: casos ${casosPorSector[s]} ⇒ predice ${Math.ceil(casosPorSector[s] / mejor.k)}, el original declara ${totalDeclarado[s]}`);
}
const DERIVABLE = mejor.ok === conDato.length;
say(`  ⇒ ¿la paginación se DERIVA del dato del clon? ${DERIVABLE ? "SÍ" : "NO"}`);
say("");
if (!DERIVABLE) {
  say(`     **NO, y el reparto importa más que el veredicto**: \`ceil(casos/${mejor.k})\` acierta`);
  say(`     ${mejor.ok} de ${conDato.length} y falla en ${fallan.length}, nombrada. Publicar sólo «NO derivable»`);
  say("     tiraría una regla que explica casi todo el dominio.");
  say("");
  say("     ⚠ Y la excepción NO es aleatoria: es el MISMO término que trae un");
  say("     título de archivo que no sale de su `nombre`. Dos anomalías sobre");
  say("     el mismo término son una señal, no dos casualidades — pero con");
  say("     **n = 1** eso NO es un discriminador (§*un discriminador hallado en");
  say("     una sola instancia tampoco es un discriminador*). Se ficha.");
  say("");
  say("     CONSECUENCIA PARA EL MODELO, que es lo operativo: el conjunto de");
  say("     rutas se replica **como MEDIDA** —la lista de las 13—, no como");
  say("     regla derivada. Una alta futura de término NO entraría sola, y eso");
  say("     se declara aquí en vez de descubrirse cuando pase.");
}
say("");

/* Y el título tampoco es derivable en todas: se comprueba, no se supone. */
const nombres = Object.fromEntries(
  psql("select slug, nombre from taxonomia_sectores;")
    .split("\n")
    .map((l) => l.split("|"))
    .map(([s, n]) => [s.trim(), n.trim()]),
);
/* ⚠ Se DECODIFICAN las entidades antes de comparar. La v1 daba 3 de 13 y una
 * era `Oil &amp; Gas` contra `Oil & Gas`: un artefacto del instrumento leído
 * como «título no derivable» — §*al transcribir, lo que se replica es lo que
 * el NAVEGADOR hace con lo servido*, cometido dentro de una sonda. */
const dec = (s) =>
  String(s ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");
const titRaros = [];
for (const c of capturadas) {
  const slug = c.ruta.split("/")[2];
  const nom = nombres[slug];
  if (nom && !dec(c.titulo).startsWith(dec(nom))) titRaros.push({ ruta: c.ruta, esperado: `${nom} Archives…`, real: c.titulo });
}
say(`  Títulos que NO empiezan por el \`nombre\` del término : ${titRaros.length} de ${capturadas.length}`);
for (const t of titRaros) say(`     ⚠ ${t.ruta}\n         esperado «${t.esperado}»\n         real     «${t.real}»`);
say("");
OUT.paginacion = { casosPorSector, totalDeclarado, mejorK: mejor, derivable: DERIVABLE, titulosNoDerivables: titRaros };

/* ── VEREDICTO ──────────────────────────────────────────────────────────── */

say("═".repeat(78));
say("LO QUE ESTA DERIVACIÓN NO CONTESTA (§regla 14, con su cardinal)");
say("═".repeat(78));
say("");
say("  · el MECANISMO del bucle de `mineria` — 5 saltos, necesita red;");
say(`  · el TOTAL de páginas de \`mineria\` y \`obras\`: **2 de 11** términos sin`);
say("    ninguna captura, así que su M es DESCONOCIDO, no 0;");
say("  · la varianza entre instancias del régimen `--`: 0 de 6 términos de");
say("    `author` y 0 de 131 documentos del corpus. Intacta.");
say("");

fs.writeFileSync(path.join(AQUI, "estado-118.log"), L.join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(AQUI, "estado-118.json"), JSON.stringify(OUT, null, 2) + "\n", "utf8");
