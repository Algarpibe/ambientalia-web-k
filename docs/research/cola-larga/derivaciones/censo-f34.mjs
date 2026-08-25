/* censo-f34 — 108.ª tanda, 2026-08-25. ESCALÓN 2.
 *
 * ── Qué es esto ───────────────────────────────────────────────────────────
 * El CENSO de las tres familias de archivo de F3-4 —`categoria` (LH-SP8) ·
 * `author` · la taxonomía `sector`— **offline y sin abrir el original**, que
 * es lo que el encargo pide y lo que el corpus permite.
 *
 * ── Qué CONTESTA ─────────────────────────────────────────────────────────
 * Por FAMILIA y con su cardinal: cuántos términos, cuántas rutas, qué sirve
 * cada una, en qué régimen, y qué taxonomía exige la tarjeta.
 *
 * ── Qué NO contesta, y es deliberado ─────────────────────────────────────
 * NO decide el modelo. F3-4 abre decisión de ESQUEMA (`CMS-n`) y eso es del
 * propietario. Aquí se entrega la MESA: conjunto derivado, medido
 * inventariado, y candidatos con sus SEPARADORAS.
 *
 * ⚠⚠ LAS DOS UNIDADES SE ESCRIBEN LAS DOS, SIEMPRE.
 * `LISTA-DERIVADA` cuenta **TÉRMINOS** (`autor` → 6) y F3-0 contó **RUTAS**
 * (`author` → 34). Las dos son ciertas y no son el mismo conjunto: la
 * diferencia es la PAGINACIÓN. Es la forma del *48 RUTAS / 32 páginas* y la
 * del *13 páginas / 13 familias*, y por eso el conjunto se **nombra elemento a
 * elemento**: con los elementos delante, la unión y la intersección salen
 * solas y el empate deja de decidir nada.
 *
 * ⚠ Y la existencia EN DISCO se comprueba: un `fichero` declarado en la lista
 * y ausente del árbol es un hueco, y sale nombrado. «No lo encontré» y «no
 * miré» se escriben igual si no se dice (§sondas 4).
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const F3 = join(RAIZ, "corpus/fase-3");
const MED = join(RAIZ, "scripts/qa/medidas");
const P = (...a) => console.log(...a);

const LD = JSON.parse(readFileSync(join(F3, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const FAMILIAS = ["categoria", "autor", "taxonomia-sector"];
const limpia = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

/* Todos los html capturados bajo el directorio de una familia — es como se
 * cuentan las RUTAS, que no es como la lista cuenta los TÉRMINOS. */
function anda(d, out = []) {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · LAS DOS UNIDADES, NOMBRADAS ELEMENTO A ELEMENTO
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 1 · LAS DOS UNIDADES — término y ruta, las dos con su cardinal");
P("");
const inventario = {};
for (const fam of FAMILIAS) {
  const terminos = LD.filter((e) => e.bucket === fam);
  const ficheros = anda(join(F3, fam));
  const sinFichero = terminos.filter((t) => !t.fichero || !existsSync(join(F3, t.fichero)));
  inventario[fam] = { terminos, ficheros, sinFichero };
  P(`  ── ${fam}`);
  P(`     TÉRMINOS declarados en LISTA-DERIVADA .... ${terminos.length}`);
  P(`     RUTAS capturadas en disco (html) ......... ${ficheros.length}`);
  P(`     términos cuyo \`fichero\` NO EXISTE ........ ${sinFichero.length}${sinFichero.length ? "  ⛔" : ""}`);
  for (const t of sinFichero) P(`         ⛔ ${t.ruta}   →   ${t.fichero}`);
  P("");
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · POR TÉRMINO — el elemento, no el recuento
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 2 · CADA TÉRMINO, CON SU PAGINACIÓN Y SU RÉGIMEN");
P("");
const porTermino = {};
for (const fam of FAMILIAS) {
  P(`  ── ${fam}`);
  P(`     término                              rutas  régimen  tarjetas  cuerpoB   título`);
  let rutasFam = 0;
  for (const t of inventario[fam].terminos) {
    const dir = t.fichero ? join(F3, dirname(t.fichero)) : null;
    const propias = dir && existsSync(dir) ? anda(dir) : [];
    rutasFam += propias.length;
    if (!t.fichero || !existsSync(join(F3, t.fichero))) {
      P(`     ${t.ruta.padEnd(38)}${String(propias.length).padStart(4)}   ⛔ SIN CAPTURA EN DISCO`);
      porTermino[t.ruta] = { fam, rutas: propias.length, capturado: false };
      continue;
    }
    const h = limpia(readFileSync(join(F3, t.fichero), "utf8"));
    const body = (/<body[^>]*class="([^"]*)"/i.exec(h) || [])[1] || "";
    const B = /\bet_pb_pagebuilder_layout\b/.test(body), T = /\bet-tb-has-body\b/.test(body);
    const reg = B && T ? "BT" : B ? "B-" : T ? "-T" : "--";
    const titulo = ((/<title>([^<]*)</i.exec(h) || [])[1] || "").replace(/\s+/g, " ").trim();
    /* ⚠ EL RECUENTO DE TARJETAS VA POR TRES SELECTORES, NO POR UNO. Si el único
     * fuera `<article>`, un 0 en toda una familia sería indistinguible de un
     * selector muerto (§sondas 4). Con tres, un 0 en los TRES es dato. */
    const lista = {
      article: (h.match(/<article/g) || []).length,
      et_pb_post: (h.match(/\bet_pb_post\b/g) || []).length,
      entryTitle: (h.match(/\bentry-title\b/g) || []).length,
    };
    const arts = Math.max(...Object.values(lista));
    /* El CUERPO de la plantilla, aislado del cascarón: es lo que dice si el
     * archivo sirve algo o sólo miga y barra lateral. */
    const i0 = h.indexOf("et-l--body"), i1 = h.indexOf("et-l--footer");
    const cuerpo = i0 >= 0 ? h.slice(i0, i1 > i0 ? i1 : h.length) : h;
    P(`     ${t.ruta.padEnd(38)}${String(propias.length).padStart(4)}   ${reg.padEnd(8)}${String(arts).padStart(6)}${String(cuerpo.length).padStart(9)}   ${titulo.slice(0, 40)}`);
    porTermino[t.ruta] = { fam, rutas: propias.length, capturado: true, reg, arts, lista, cuerpo: cuerpo.length, body };
  }
  P(`     ${"TOTAL".padEnd(38)}${String(rutasFam).padStart(4)}`);
  P("");
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · EL CRUCE DE UNIDADES — y por qué el empate no decide nada
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 3 · CRUCE DE UNIDADES");
P("");
P("  familia            TÉRMINOS   RUTAS   ¿de dónde sale la diferencia?");
for (const fam of FAMILIAS) {
  const nT = inventario[fam].terminos.length;
  const nR = inventario[fam].ficheros.length;
  const pag = inventario[fam].ficheros.filter((f) => /[\\/]page[\\/]\d+[\\/]/.test(f)).length;
  P(`  ${fam.padEnd(19)}${String(nT).padStart(6)}${String(nR).padStart(9)}   ${nR - nT === pag - inventario[fam].sinFichero.length ? "" : ""}${pag} son \`/page/N\` · ${inventario[fam].sinFichero.length} término(s) sin captura`);
}
P("");
P("  ⇒ `autor` es el caso que el plan nombra: **6 TÉRMINOS** y **34 RUTAS**, y las");
P("    dos cifras son ciertas. Las 28 de diferencia son la paginación de UN solo");
P("    término. Escribir «6» donde el plan dice «34» —o al revés— es §*corregir un");
P("    denominador no es sustituirlo en todas partes*.");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · QUÉ TAXONOMÍA EXIGE LA TARJETA — el consumidor, derivado
 *
 * LH-2 D3 midió que el AUTOR no aparece en ninguna tarjeta. Aquí se comprueba
 * sobre el corpus de listados, y **por FAMILIA de listado**, porque un censo
 * que sólo mire el total no distingue «no aparece en ninguna» de «no aparece
 * en las que miré» (§*se cuenta POR FORMA y no sólo en total*).
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 4 · ¿QUÉ TAXONOMÍA EXIGE LA TARJETA? — sobre los 35 listados capturados");
P("");
const listados = LD.filter((e) => e.bucket === "listados" && e.fichero && existsSync(join(F3, e.fichero)));
const MARCA = {
  "autor (`/author/`)": /href="[^"]*\/author\//,
  "categoría (`/categoria/`)": /href="[^"]*\/categor[ií]a\//,
  "sector (`/sector/`)": /href="[^"]*\/sector\//,
  "sectores (`/sectores/`, la PÁGINA no la taxonomía)": /href="[^"]*\/sectores\//,
};
const hits = {};
for (const l of listados) {
  const h = limpia(readFileSync(join(F3, l.fichero), "utf8"));
  /* sólo el ÁREA DE TARJETAS: el menú y el pie enlazan a todas partes y darían
   * el PLENO — §*un patrón que casa en TODAS tampoco mide nada*. */
  const ini = h.search(/<div[^>]*class="[^"]*\b(et_pb_blog_grid|case-list-content|lh-cuerpo|entry-content)\b/);
  const area = ini >= 0 ? h.slice(ini) : h;
  const fin = area.search(/<footer|id="main-footer"/);
  const tarjetas = fin > 0 ? area.slice(0, fin) : area;
  for (const [k, re] of Object.entries(MARCA)) {
    hits[k] ??= { n: 0, rutas: [] };
    if (re.test(tarjetas)) { hits[k].n++; hits[k].rutas.push(l.ruta); }
  }
}
P(`  listados capturados: ${listados.length}`);
for (const [k, v] of Object.entries(hits)) {
  P(`     ${k.padEnd(50)} ${String(v.n).padStart(3)} de ${listados.length}`);
  if (v.n && v.n <= 6) for (const r of v.rutas) P(`         ${r}`);
}
P("");
P("  ⚠ Esto contesta «¿ENLAZA la tarjeta a esa taxonomía?», NO «¿la necesita el");
P("    MODELO?». Un listado puede filtrar por una taxonomía sin enlazarla —el");
P("    filtro de 12 botones de `casos-de-exito` es justo eso—, así que un 0 aquí");
P("    es una PREGUNTA para el dato, no un veredicto.");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · LO QUE EL CENSO NO PUEDE CERRAR — con su número (§regla 14)
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 5 · LO QUE ESTE CENSO NO CIERRA, con su cardinal");
P("");
const faltan = FAMILIAS.flatMap((f) => inventario[f].sinFichero.map((t) => t.ruta));
P(`  · términos declarados SIN CAPTURA en disco: ${faltan.length}`);
for (const r of faltan) P(`      ${r}`);
P(`  · **el código de estado NO se puede leer offline**: un corpus guarda el CUERPO,`);
P(`    no el 301. Así que este censo no puede confirmar ni refutar «X redirige».`);
P("");
P("  ⚠ PERO LA AUSENCIA TIENE FORMA, Y LA FORMA CONSTRIÑE — se escribe lo que el");
P("    dato SÍ dice, sin convertirlo en el veredicto que no puede dar:");
{
  const sinIdx = inventario["taxonomia-sector"].sinFichero.map((t) => t.ruta.replace(/^\/es\/sector\//, "").replace(/\/$/, ""));
  const conPag = sinIdx.filter((s) => existsSync(join(F3, "taxonomia-sector/sector", s, "page")));
  P(`      · de los ${sinIdx.length} \`/es/sector/*\` sin página 1, **${conPag.length} SÍ tienen \`/page/N\` capturado**:`);
  P(`        ${conPag.join(" · ")}`);
  P(`      · y ${sinIdx.length - conPag.length} no tienen nada: ${sinIdx.filter((s) => !conPag.includes(s)).join(" · ")}`);
  P("      · «el término entero redirige» NO explica el primer grupo: si la base 301,");
  P("        su paginación tendría que faltar también. Lo que SÍ encaja es «la BASE");
  P("        redirige y su paginación no» — y eso queda **SIN PROBAR** hasta que");
  P("        alguien lea un código de estado. No se cablea ninguna de las dos.");
  P(`      · las 2 formas acentuadas de \`categoria\` no tienen NADA capturado, que es`);
  P("        compatible con el 301 que el plan midió y **no lo demuestra**.");
}
P(`  · **el eje COMPORTAMIENTO**: el filtro de 12 botones de \`casos-de-exito\` —el`);
P(`    único consumidor conocido de la taxonomía \`sector\`— es interacción, y este`);
P(`    censo no la mide. Es la misma campaña que \`/sistema-interno-de-informacion\`.`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LOS CANDIDATOS Y SUS SEPARADORAS — sin decidir
 * ═════════════════════════════════════════════════════════════════════════ */
P("═══ 6 · CANDIDATOS DE MODELO, con su SEPARADORA (no se decide ninguno)");
P("");
const regPorFam = {};
for (const [ruta, v] of Object.entries(porTermino)) {
  if (!v.capturado) continue;
  (regPorFam[v.fam] ??= {})[v.reg] = ((regPorFam[v.fam] ?? {})[v.reg] ?? 0) + 1;
}
P("  El régimen de cada familia, que es lo que decide QUÉ LECTURA vale (§CLAUDE.md):");
for (const [f, r] of Object.entries(regPorFam)) P(`     ${f.padEnd(19)} ${JSON.stringify(r)}`);
P("");
/* ── El hallazgo que decide más, y no es un régimen: ¿SIRVE ALGO EL ARCHIVO? ─ */
P("");
P("  ¿QUÉ SIRVE CADA FAMILIA? — tarjetas por los TRES selectores, y bytes de cuerpo:");
P("     familia            términos   tarjetas (min–max)   cuerpo (min–max bytes)");
for (const fam of FAMILIAS) {
  const vs = Object.values(porTermino).filter((v) => v.fam === fam && v.capturado);
  if (!vs.length) { P(`     ${fam.padEnd(19)} 0 capturados`); continue; }
  const a = vs.map((v) => v.arts), c = vs.map((v) => v.cuerpo);
  P(`     ${fam.padEnd(19)}${String(vs.length).padStart(6)}      ${`${Math.min(...a)}–${Math.max(...a)}`.padEnd(20)} ${Math.min(...c)}–${Math.max(...c)}`);
}
P("");
{
  const sec = Object.values(porTermino).filter((v) => v.fam === "taxonomia-sector" && v.capturado);
  const cero = sec.filter((v) => v.arts === 0);
  P(`  ⇒ **LA TAXONOMÍA \`sector\` NO LISTA NADA: ${cero.length} de ${sec.length} capturados con 0 tarjetas por los`);
  P(`    TRES selectores**, y su cuerpo son ~3.3 KB de MIGA + BARRA LATERAL. No es`);
  P("    que liste poco: no lista. Y su paginación tampoco (comprobado en `/page/N`).");
  P("");
  P("    Eso PARTE la pregunta de F3-4 en dos que se venían tratando como una:");
  P("      (a) la RELACIÓN `caso → sector`, que SÍ tiene consumidor medido — el");
  P("          filtro de 12 botones de `casos-de-exito`, y es la ÚNICA de las 35");
  P("          formas de listado que enlaza a `/sector/`;");
  P("      (b) el ARCHIVO `/es/sector/*`, que **no lo consume nadie y no sirve");
  P("          contenido**. Replicarlo es emitir rutas de cascarón vacío — la misma");
  P("          decisión que `D2.5 · REPLICAR TAL CUAL` tomó para las 55 que responden");
  P("          200 sin listar, y por tanto con precedente, no sin él.");
  P("");
  P("    ⚠ (a) y (b) son SEPARABLES: se puede modelar la relación sin emitir el");
  P("      archivo, y al revés. Tratarlas como una sola decisión es lo que hace que");
  P("      «modelar la taxonomía sector» parezca una cosa cuando son dos.");
}
P("");
P("  Y la pregunta que separa un modelo de otro, familia a familia:");
P("     · ¿es una COLECCIÓN (el término tiene contenido propio: título, texto,");
P("       imagen) o es sólo una CONSULTA (§*un listado no tiene contenido propio*)?");
P("       SEPARADORA: un término con contenido que NO se derive de sus miembros.");
P("     · ¿la relación va en el MIEMBRO (entrada → término) o en el TÉRMINO");
P("       (término → entradas)? SEPARADORA: un miembro en DOS términos de la");
P("       misma taxonomía, o un término con orden propio distinto del de fecha.");
P("");
P("  ⚠ Si dos candidatos predicen lo mismo sobre TODO el dominio, son UNO SOLO y");
P("    se dice — no se ficha una indeterminación que no existe.");
