/* f33-rutas — 94.ª tanda, 2026-08-22. ESCALÓN 1, puntos 2 y 3.
 *
 * LA PREGUNTA: ¿DÓNDE ATERRIZA hoy cada una de las 31 páginas de `paginas`, y
 * qué haría falta para emitirlas **sin que ninguna se sirva por dos vías**?
 *
 * ══ POR QUÉ SON DOS PREGUNTAS Y NO UNA ═════════════════════════════════════
 *
 * La 93.ª midió *«0 colisiona literalmente»* y de ahí se puede leer «no hay
 * problema». **Son dos afirmaciones distintas y sólo la segunda estaba medida:**
 *
 *   · **COLISIÓN LITERAL** — la ruta del clon YA la emite algo. Hoy: 0.
 *   · **SOLAPE DE PLANO**  — la ruta caería DENTRO del segmento dinámico de
 *     OTRA familia. Eso no es una colisión hoy porque la página no se emite;
 *     **se convierte en una el día que se emita**, y entonces el build **no
 *     avisa**: compila, emite por las dos vías y sirve la equivocada con 200.
 *
 * Se publican **por separado y con su cardinal**, porque un «0 colisiones» al
 * lado de un solape sin contar es §*una limitación declarada sin su número se
 * lee como una nota al pie*.
 *
 * ══ Y LA TERCERA, QUE ES LA QUE ESTA TANDA DESTAPÓ ═════════════════════════
 *
 * El registro de slugs (`slugs`, el `UNIQUE` de Postgres que impone la unicidad
 * ENTRE familias) lo escribe `registroDeSlug({familia, enElPlano})`. **Una
 * colección PREFIJADA que no pase `enElPlano` reclama sus slugs en el plano de
 * raíz sin estar en él** — y entonces la guarda deja de proteger y pasa a
 * **bloquear altas legítimas**, que es la otra forma de que una guarda deje de
 * servir (lo dice el propio hook en su comentario de `afterDelete`).
 *
 * Medido hoy contra la DB, no supuesto. Y le toca a `paginas`: llama a
 * `registroDeSlug` **sin `enElPlano`** y sus rutas tienen profundidad 1..5.
 *
 * CONTROLES (§sondas 4):
 *   · las 31 se DERIVAN de la congelada de la unión, no se escriben;
 *   · el manifiesto tiene que traer rutas; si no, TIRA — un manifiesto vacío
 *     daría «0 solapes» y sería el cero de la sonda, no del sitio;
 *   · y los planos dinámicos se DERIVAN del árbol de `app/`, no de una lista:
 *     una ruta nueva entra sola.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { Evaluadas, hoy, w, APP } from "./lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");

/* ── 1 · las 31, derivadas de la congelada de la unión ─────────────────────── */
const ld = JSON.parse(readFileSync(join(RAIZ, "corpus/fase-3/LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const CORPUS = join(RAIZ, "corpus/fase-3");

/** S1: las entradas de blog no son de esta colección. Derivado del `<body>`. */
const esOtraColeccion = (html) => /\bsingle-post\b/.test((/<body[^>]*class="([^"]*)"/.exec(html) || [])[1] || "");

const PAGINAS = [];
for (const e of [...ld.filter((x) => x.bucket === "hubs-kb"), ...L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean), ...ld.filter((x) => x.bucket === "sueltas")]) {
  if (!e.fichero || !existsSync(join(CORPUS, e.fichero))) continue;
  if (esOtraColeccion(readFileSync(join(CORPUS, e.fichero), "utf8"))) continue;
  /** La ruta del clon: sin `/es`, sin barra final (§Regla de rutas locales). */
  const rutaClon = e.ruta.replace(/^\/es/, "").replace(/\/$/, "") || "/";
  const seg = rutaClon.split("/").filter(Boolean);
  PAGINAS.push({ ruta: e.ruta, rutaClon, segmentos: seg.length, slug: seg[seg.length - 1], prefijo: seg.slice(0, -1).join("/") });
}
if (PAGINAS.length === 0) throw new Error("0 páginas derivadas — es el instrumento (§sondas 4)");

const ev = new Evaluadas({ nombre: "f33-rutas", unidad: "páginas de la cola larga", minimo: PAGINAS.length });

/* ── 2 · los planos que `app/` declara, DERIVADOS del árbol ────────────────── */
function* dirs(d, base = d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) { yield relative(base, f).replace(/\\/g, "/"); yield* dirs(f, base); }
  }
}
const APP_DIR = join(APP, "src/app");
const PLANOS = [...dirs(APP_DIR)]
  .filter((p) => existsSync(join(APP_DIR, p, "page.tsx")))
  .map((p) => "/" + p)
  .filter((p) => /\[/.test(p));
if (PLANOS.length === 0) throw new Error("0 planos dinámicos en app/ — es el instrumento");

/** ¿Qué plano dinámico se comería esta ruta? El MÁS ESPECÍFICO que case. */
function planoQueCome(rutaClon) {
  const seg = rutaClon.split("/").filter(Boolean);
  const casan = [];
  for (const p of PLANOS) {
    const ps = p.split("/").filter(Boolean);
    const catchAll = ps.some((x) => x.startsWith("[..."));
    const fijos = ps.filter((x) => !x.startsWith("["));
    /* Los segmentos fijos del plano tienen que ser prefijo de la ruta. */
    if (!fijos.every((f, i) => seg[i] === f)) continue;
    if (catchAll) { if (seg.length > fijos.length) casan.push({ plano: p, esp: fijos.length, catchAll }); }
    else if (seg.length === ps.length) casan.push({ plano: p, esp: fijos.length, catchAll });
  }
  casan.sort((a, b) => b.esp - a.esp);
  return casan[0] || null;
}

/* ── 3 · el manifiesto: quién emite QUÉ hoy ────────────────────────────────── */
const man = JSON.parse(readFileSync(join(APP, ".next/prerender-manifest.json"), "utf8"));
const RUTAS = man.routes || {};
if (Object.keys(RUTAS).length === 0) throw new Error("manifiesto vacío — ¿falta `npm run build`? (§sondas 4)");
const quienEmite = new Map(Object.entries(RUTAS).map(([r, v]) => [r, v.srcRoute ?? r]));

/* ── 4 · el registro de slugs: quién RECLAMA el plano de raíz ──────────────── */
const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });
const { docs: registro } = await payload.find({ collection: "slugs", pagination: false, depth: 0, sort: "familia" });
await payload.db.destroy?.();
const porFamilia = {};
for (const r of registro) (porFamilia[r.familia] = porFamilia[r.familia] || []).push(r.slug);

/* ── 5 · el reparto ───────────────────────────────────────────────────────── */
const colisionLiteral = [], solapeDePlano = [], sinPlano = [];
for (const p of PAGINAS) {
  p.emitida = quienEmite.has(p.rutaClon) ? quienEmite.get(p.rutaClon) : null;
  const c = planoQueCome(p.rutaClon);
  p.plano = c ? c.plano : null;
  p.catchAll = c ? c.catchAll : false;
  if (p.emitida) colisionLiteral.push(p);
  else if (p.plano) solapeDePlano.push(p);
  else sinPlano.push(p);
  ev.ok();
}

const porPlano = {};
for (const p of solapeDePlano) (porPlano[p.plano] = porPlano[p.plano] || []).push(p);
const porProfundidad = {};
for (const p of PAGINAS) (porProfundidad[p.segmentos] = porProfundidad[p.segmentos] || []).push(p);

/* ── 6 · el informe ───────────────────────────────────────────────────────── */
console.log(`═══ 0 · EL CONJUNTO — ${PAGINAS.length} páginas de \`paginas\`, derivadas (S1 aplicada)`);
console.log(`  planos dinámicos que \`app/\` declara: ${PLANOS.length}`);
for (const p of PLANOS.sort()) console.log(`     ${p}`);

console.log(`\n═══ 1 · PROFUNDIDAD — cuántos segmentos tiene cada ruta del clon`);
console.log(`  ⚠ Decide si el slug vive en EL PLANO DE RAÍZ o bajo un prefijo, y por tanto`);
console.log(`  si su unicidad tiene que imponerse ENTRE familias o basta la de la colección.`);
for (const [n, l] of Object.entries(porProfundidad).sort())
  console.log(`  ${n} segmento(s): ${String(l.length).padStart(3)} páginas`);

console.log(`\n═══ 2 · COLISIÓN LITERAL — la ruta del clon YA la emite algo`);
console.log(`  n = ${colisionLiteral.length}`);
for (const p of colisionLiteral) console.log(`  ⛔ ${p.rutaClon.padEnd(50)} ya emitida por ${p.emitida}`);
if (!colisionLiteral.length) console.log(`  (ninguna)`);

console.log(`\n═══ 3 · SOLAPE DE PLANO — caería DENTRO del segmento dinámico de otra familia`);
console.log(`  ⚠ **NO es lo mismo que el 2, y es lo que la 93.ª no había contado.** Hoy no`);
console.log(`  es una colisión porque la página no se emite; lo será el día que se emita, y`);
console.log(`  el build NO avisa: compila, emite por las dos vías y sirve la equivocada con 200.`);
console.log(`  n = ${solapeDePlano.length} de ${PAGINAS.length}`);
for (const [plano, l] of Object.entries(porPlano).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  ── ${plano}  ${l.length} página(s)${l[0].catchAll ? "   [catch-all]" : ""}`);
  for (const p of l) console.log(`       ${p.rutaClon}`);
}
if (sinPlano.length) {
  console.log(`\n  ── SIN plano que las coma: ${sinPlano.length}`);
  for (const p of sinPlano) console.log(`       ${p.rutaClon}`);
}

console.log(`\n═══ 4 · EL REGISTRO DE SLUGS — quién RECLAMA el plano de raíz hoy`);
console.log(`  Lo escribe \`registroDeSlug({familia, enElPlano})\` y lo impone el \`UNIQUE\` de`);
console.log(`  Postgres. Reclamar sin estar en el plano no protege: **bloquea altas legítimas**.`);
let reclamados = 0, fantasma = 0;
for (const [f, slugs] of Object.entries(porFamilia).sort((a, b) => b[1].length - a[1].length)) {
  const noRaiz = slugs.filter((s) => {
    const e = quienEmite.get("/" + s);
    return !e;                       /* no hay ruta de raíz para ese slug */
  });
  reclamados += slugs.length; fantasma += noRaiz.length;
  console.log(`  ${f.padEnd(22)} ${String(slugs.length).padStart(4)} reclamados · ${String(noRaiz.length).padStart(3)} SIN ruta de raíz que los sirva`);
  if (noRaiz.length && noRaiz.length <= 8) for (const s of noRaiz) console.log(`       · ${s}`);
}
console.log(`  ── total reclamados ${reclamados} · sin ruta de raíz ${fantasma}`);

console.log(`\n═══ 5 · LO QUE ESTA DERIVACIÓN **NO** CONTESTA`);
console.log(`  · no dice QUÉ hacer: el reparto es el insumo de la decisión, no la decisión`);
console.log(`  · no mira geometría ni contenido — es enrutado`);
console.log(`  · «sin ruta de raíz» NO es por sí solo un defecto: puede ser un documento no`);
console.log(`    emitido todavía. Lo que sí dice es que el slug está RESERVADO en el plano`);
console.log(`  · y no comprueba la guarda: eso lo hace \`qa:slugs\`, que hoy compara`);
console.log(`    ${Object.keys(porFamilia).length > 2 ? "MENOS familias de las que el registro tiene" : "las familias del registro"}`);

w(`medidas/f33-rutas.json`, {
  meta: { sonda: "f33-rutas", fecha: hoy(), n: PAGINAS.length, planos: PLANOS },
  paginas: PAGINAS, colisionLiteral: colisionLiteral.map((p) => p.rutaClon),
  solapeDePlano: Object.fromEntries(Object.entries(porPlano).map(([k, v]) => [k, v.map((p) => p.rutaClon)])),
  registro: Object.fromEntries(Object.entries(porFamilia).map(([f, s]) => [f, { n: s.length, slugs: s }])),
});

console.log(`\n═══ 6 · CONTRATO`);
console.log(`  ✓ evaluadas ${ev.n}/${PAGINAS.length} páginas de la cola larga · planos ${PLANOS.length} · rutas del manifiesto ${Object.keys(RUTAS).length}`);
