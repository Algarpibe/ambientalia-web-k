/**
 * P3 · 117.ª — ¿MOVIÓ LA FICHA DE `author` ALGUNA RUTA A 1440?
 *
 * Deriva, no cita (§regla 9). Compara la congelada de 1440 tomada TRAS la
 * ficha contra la base disponible.
 *
 * ⚠ LA SALVEDAD QUE HACE VÁLIDA LA LECTURA: la base es de la t104 (2026-08-25)
 * y entre medias corrieron las tandas 113-116. Así que «quieta» aquí NO es
 * «la ficha no la movió»: es «NI la ficha NI las tandas intermedias la
 * movieron», o sea una COTA, no una atribución limpia.
 *
 * Salida: `p3-cota-117.log`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MED = path.resolve(AQUI, "../../../../scripts/qa/medidas");

/**
 * Lectura CABLEADA con guarda y diagnóstico (§regla 26, hermana). Un
 * `readFileSync` pelado sobre un canónico da `ENOENT` y no dice *«mira si lo
 * renombraron»* — y ésa es toda la diferencia entre diez minutos y una tanda.
 * Esta misma sonda lo cobró: el rename de `-neg-117-…` a `-t117-…` la rompió.
 */
const lee = (f) => {
  const r = path.join(MED, f);
  if (!fs.existsSync(r)) {
    const fam = fs.readdirSync(MED).filter((x) => x.startsWith(f.slice(0, 16)));
    throw new Error(
      `p3-cota-117: falta la congelada \`${f}\`.\n` +
        `  Puede haber sido RENOMBRADA (§regla 5bis/9-8.º caso: el canónico se libera al caducar).\n` +
        `  Candidatas de su familia en medidas/ (${fam.length}):\n    ` +
        fam.join("\n    "),
    );
  }
  return JSON.parse(fs.readFileSync(r, "utf8"));
};

const F_BASE = "clon-base-1440-t104-despues4.json";
const F_HOY = "clon-base-1440-t117-tras-la-ficha.json";

const base = lee(F_BASE);
const hoy = lee(F_HOY);

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("═══ P3 · 117.ª — COTA DE MOVIMIENTO A 1440 ═══");
say(`base : ${F_BASE}  (rutas meta ${base.meta.rutas})`);
say(`hoy  : ${F_HOY}  (rutas meta ${hoy.meta.rutas})`);
say("");

const kb = Object.keys(base.paginas);
const kh = Object.keys(hoy.paginas);

/* ── MEMBRESÍA: diferencia simétrica con sus DOS lados nombrados ──────────
 * Nunca el neto (§*un cardinal es un contenedor y absorbe la membresía*). */
const sb = new Set(kb), sh = new Set(kh);
const soloBase = kb.filter((k) => !sh.has(k));
const soloHoy = kh.filter((k) => !sb.has(k));
say("── MEMBRESÍA (diferencia simétrica, los dos lados) ──");
say(`  en la base y NO hoy : ${soloBase.length}${soloBase.length ? "  " + soloBase.slice(0, 20).join(" · ") : ""}`);
say(`  hoy y NO en la base : ${soloHoy.length}${soloHoy.length ? "  " + soloHoy.slice(0, 20).join(" · ") : ""}`);
say(`  comunes             : ${kh.filter((k) => sb.has(k)).length}`);
say("");

/* ── EL PLANO DE RAÍZ — Y POR QUÉ ESTO **NO** ES LA FAMILIA «BLOG» ────────
 *
 * ⚠⚠ EL HEURÍSTICO SOBRE-CASA, Y SE DECLARA (§sondas 4, 3.ª cara).
 *
 * «Un segmento y sin `page.tsx` propio» NO es «entrada de blog»: el plano de
 * raíz de `/es/` lo comparten **5 familias** —`entradas-blog`,
 * `terminos-kunakpedia`, `articulos-kb`, `productos` y las estáticas—, y este
 * predicado las mete a TODAS en el mismo saco. Por eso publica 208 donde
 * `slugs.mjs` deriva 152 para `entradas-blog`: no son dos lecturas del mismo
 * conjunto, son DOS CONJUNTOS (§*dos lecturas pueden dar el mismo —o distinto—
 * cardinal contando unidades distintas*).
 *
 * La fuente correcta de la membresía es el REGISTRO (`slugs`, campo
 * `familia`), que se escribe en la misma transacción que el alta — y vive en
 * la DB, así que exige Docker. Se cruza en `p3-familias-117.mjs`. */
const APP = path.resolve(AQUI, "../../../../apps/web/src/app");
const construidas = new Set(["/"]);
(function recorre(dir, pref) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("_") || e.name.startsWith("(") || e.name.startsWith("[")) continue;
    const r = `${pref}/${e.name}`;
    if (fs.existsSync(path.join(dir, e.name, "page.tsx"))) construidas.add(r);
    recorre(path.join(dir, e.name), r);
  }
})(APP, "");

const segmentos = (r) => r.split("/").filter(Boolean).length;
const enPlanoRaiz = (r) => segmentos(r) === 1 && !construidas.has(r);

say("── REPARTO POR PROFUNDIDAD (derivado de apps/web/src/app; NO es el reparto por FAMILIA) ──");
say(`  páginas con page.tsx propio : ${construidas.size}`);

const familias = new Map();
for (const k of kh) {
  const f = enPlanoRaiz(k)
    ? "PLANO DE RAÍZ (5 familias mezcladas — NO es «blog»)"
    : segmentos(k) === 0 ? "home"
    : construidas.has(k) ? "construida a mano"
    : `prefijada (${segmentos(k)} segmentos)`;
  if (!familias.has(f)) familias.set(f, []);
  familias.get(f).push(k);
}
for (const [f, rs] of [...familias].sort((a, b) => b[1].length - a[1].length)) say(`  ${String(rs.length).padStart(4)}  ${f}`);
say("");

/* ── EL EJE: docH, comparado sólo sobre los comunes ───────────────────────
 * Y `undefined` se declara APARTE de «movida»: una ruta que en la foto vieja
 * no renderizaba y hoy sí no se ha «movido», ha APARECIDO. Son dos hechos
 * distintos y el total los suma (§*un cardinal es un contenedor*). */
const movidas = [], aparecidas = [], desaparecidas = [], quietas = [];
for (const k of kh) {
  if (!sb.has(k)) continue;
  const a = base.paginas[k]?.docH, b = hoy.paginas[k]?.docH;
  const na = typeof a === "number", nb = typeof b === "number";
  if (!na && nb) aparecidas.push({ k, a, b });
  else if (na && !nb) desaparecidas.push({ k, a, b });
  else if (na && nb && a !== b) movidas.push({ k, a, b, d: +(b - a).toFixed(2) });
  else quietas.push(k);
}

say("── EJE docH sobre los COMUNES ──");
say(`  quietas       : ${quietas.length}`);
say(`  movidas       : ${movidas.length}`);
say(`  aparecidas    : ${aparecidas.length}   (undefined → número: NO es movimiento)`);
say(`  desaparecidas : ${desaparecidas.length}`);
say("");

const clasi = (k) => (enPlanoRaiz(k) ? "plano-raiz" : "prefijada");
for (const [tit, arr] of [["MOVIDAS", movidas], ["APARECIDAS", aparecidas], ["DESAPARECIDAS", desaparecidas]]) {
  if (!arr.length) continue;
  say(`  ── ${tit} (${arr.length}) ──`);
  for (const x of arr) say(`     [${clasi(x.k)}] ${x.k}  ${x.a} → ${x.b}${x.d !== undefined ? `  Δ${x.d > 0 ? "+" : ""}${x.d}` : ""}`);
  say("");
}

/* ── EL VEREDICTO, EN LA UNIDAD QUE ESTA SONDA SÍ PUEDE AFIRMAR ────────── */
const raizComunes = kh.filter((k) => sb.has(k) && enPlanoRaiz(k));
const raizQuietas = raizComunes.filter((k) => {
  const a = base.paginas[k]?.docH, b = hoy.paginas[k]?.docH;
  return typeof a === "number" && typeof b === "number" && a === b;
});
const raizNoNumerica = raizComunes.filter((k) => typeof base.paginas[k]?.docH !== "number" || typeof hoy.paginas[k]?.docH !== "number");

say("── VEREDICTO P3 — EN UNIDAD «PLANO DE RAÍZ», NO EN UNIDAD «FAMILIA» ──");
say(`  plano de raíz comunes a las 2 fotos : ${raizComunes.length}`);
say(`  de ellas, docH IDÉNTICO             : ${raizQuietas.length}`);
say(`  de ellas, sin docH en algún lado    : ${raizNoNumerica.length}${raizNoNumerica.length ? "  " + raizNoNumerica.join(" · ") : ""}`);
say(`  plano de raíz sólo en la foto de HOY: ${soloHoy.filter(enPlanoRaiz).length}`);
say("");
say("  ⚠ SIN DERIVAR AQUÍ: el reparto en unidad FAMILIA (`entradas-blog` = 152");
say("     según `slugs.mjs`) exige el registro `slugs` de la DB. 208 y 152 NO son");
say("     dos lecturas del mismo conjunto: 208 es EL PLANO, 152 es UNA de sus 5");
say("     familias. Cruce en `p3-familias-117.mjs`.");
say("");
say("  ⚠ SALVEDAD (lo que esta lectura NO dice):");
say("     la base es de la t104 y entre medias corrieron 113-116, así que");
say("     «quieta» = «NI la ficha NI las tandas intermedias la movieron».");
say("     Es una COTA sobre el movimiento, NO una atribución limpia a la ficha.");
say("     La atribución limpia exigiría una base tomada JUSTO antes de la ficha,");
say("     y esa base NO EXISTE — no se puede derivar de lo congelado.");

fs.writeFileSync(path.join(AQUI, "p3-cota-117.log"), L.join("\n") + "\n");
