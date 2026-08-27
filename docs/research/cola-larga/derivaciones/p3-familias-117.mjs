/**
 * P3 · 117.ª — EL REPARTO EN UNIDAD **FAMILIA**, CRUZADO CONTRA EL REGISTRO
 *
 * `p3-cota-117.mjs` sólo puede afirmar en unidad PLANO DE RAÍZ: su predicado
 * («un segmento y sin `page.tsx` propio») mete CINCO familias en el mismo
 * saco y publica 208 donde `entradas-blog` tiene 152. Esta derivación cierra
 * el hueco cruzando contra el REGISTRO (`slugs`, campo `familia`), que se
 * escribe en la misma transacción que el alta.
 *
 * ⚠ NO levanta navegador y NO toca `.next`: sólo lee la congelada y consulta
 *   la DB. Es seguro con una sonda en vuelo.
 *
 * Salida: `p3-familias-117.log`.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MED = path.resolve(AQUI, "../../../../scripts/qa/medidas");

const lee = (f) => {
  const r = path.join(MED, f);
  if (!fs.existsSync(r)) {
    const fam = fs.readdirSync(MED).filter((x) => x.startsWith(f.slice(0, 16)));
    throw new Error(`p3-familias-117: falta \`${f}\`. ¿Renombrada? Candidatas (${fam.length}):\n  ` + fam.join("\n  "));
  }
  return JSON.parse(fs.readFileSync(r, "utf8"));
};

const F_BASE = "clon-base-1440-t104-despues4.json";
const F_HOY = "clon-base-1440-t117-tras-la-ficha.json";
const base = lee(F_BASE);
const hoy = lee(F_HOY);

/* ── EL REGISTRO, por consulta REAL (§ESCALÓN 1.3) ───────────────────────
 * Y si no se puede leer, se TIRA: «0 familias» y «no pude leer» no pueden dar
 * la misma salida (§regla 6, la ausencia se rechaza). */
const psql = (sql) =>
  execFileSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-t", "-A", "-F", "\t", "-c", sql], { encoding: "utf8" });

const filas = psql("select familia, slug from slugs order by familia, slug;")
  .split("\n").map((l) => l.trim()).filter(Boolean)
  .map((l) => { const [familia, slug] = l.split("\t"); return { familia, slug }; });
if (!filas.length) throw new Error("p3-familias-117: REGISTRO DE SLUGS VACÍO — no se puede derivar la familia");

const famDe = new Map();
for (const { familia, slug } of filas) famDe.set(`/${slug}`, familia);

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("═══ P3 · 117.ª — REPARTO EN UNIDAD FAMILIA ═══");
say(`base : ${F_BASE}`);
say(`hoy  : ${F_HOY}`);
say(`registro slugs : ${filas.length} filas`);
say("");

const porFam = new Map();
for (const { familia } of filas) porFam.set(familia, (porFam.get(familia) || 0) + 1);
say("── FAMILIAS DEL REGISTRO (derivadas, no escritas) ──");
for (const [f, n] of [...porFam].sort((a, b) => b[1] - a[1])) say(`  ${String(n).padStart(4)}  ${f}`);
say("");

/* ── CRUCE: cada ruta medida contra su familia ───────────────────────────
 * Lo NO registrado se nombra APARTE, nunca se mete en un cajón «otros» que
 * lo haga desaparecer del recuento (§regla 14: con su cardinal). */
const kh = Object.keys(hoy.paginas);
const sb = new Set(Object.keys(base.paginas));

const est = new Map(); // familia -> {quietas, movidas:[], aparecidas:[], desaparecidas:[]}
const SIN = "«sin fila en el registro» (estáticas / prefijadas)";
for (const k of kh) {
  if (!sb.has(k)) continue;
  const f = famDe.get(k) || SIN;
  if (!est.has(f)) est.set(f, { quietas: 0, movidas: [], aparecidas: [], desaparecidas: [] });
  const e = est.get(f);
  const a = base.paginas[k]?.docH, b = hoy.paginas[k]?.docH;
  const na = typeof a === "number", nb = typeof b === "number";
  if (!na && nb) e.aparecidas.push({ k, a, b });
  else if (na && !nb) e.desaparecidas.push({ k, a, b });
  else if (na && nb && a !== b) e.movidas.push({ k, a, b, d: +(b - a).toFixed(2) });
  else e.quietas++;
}

say("── VEREDICTO P3, POR FAMILIA (docH, comunes a las dos fotos) ──");
say("");
say("  familia                                        quietas  movidas  aparec.  desap.");
say("  ─────────────────────────────────────────────  ───────  ───────  ───────  ──────");
for (const [f, e] of [...est].sort((a, b) => (b[1].quietas + b[1].movidas.length) - (a[1].quietas + a[1].movidas.length))) {
  say(`  ${f.padEnd(45)}  ${String(e.quietas).padStart(7)}  ${String(e.movidas.length).padStart(7)}  ${String(e.aparecidas.length).padStart(7)}  ${String(e.desaparecidas.length).padStart(6)}`);
}
say("");

for (const [f, e] of est) {
  const raros = [...e.movidas, ...e.aparecidas, ...e.desaparecidas];
  if (!raros.length) continue;
  say(`  ── ${f} — las ${raros.length} que NO están quietas ──`);
  for (const x of e.movidas) say(`     MOVIDA     ${x.k}  ${x.a} → ${x.b}  Δ${x.d > 0 ? "+" : ""}${x.d}`);
  for (const x of e.aparecidas) say(`     APARECIDA  ${x.k}  undefined → ${x.b}`);
  for (const x of e.desaparecidas) say(`     DESAPAREC. ${x.k}  ${x.a} → undefined`);
  say("");
}

const blog = est.get("entradas-blog");
say("── P3, LA AFIRMACIÓN QUE SE ENCARGÓ ──");
if (!blog) {
  say("  ❗ `entradas-blog` NO aparece en el cruce: el registro no casa con las rutas medidas.");
} else {
  const tot = blog.quietas + blog.movidas.length + blog.aparecidas.length + blog.desaparecidas.length;
  say(`  entradas-blog medidas en las DOS fotos : ${tot}  (registro: ${porFam.get("entradas-blog")})`);
  say(`  de ellas, docH IDÉNTICO                : ${blog.quietas}`);
  say(`  movidas / aparecidas / desaparecidas   : ${blog.movidas.length} / ${blog.aparecidas.length} / ${blog.desaparecidas.length}`);
  const falta = porFam.get("entradas-blog") - tot;
  if (falta) say(`  ⚠ ${falta} del registro NO están en el cruce — se nombran, no se descuentan en silencio`);
}
say("");
say("  ⚠ SALVEDAD (idéntica a la de `p3-cota-117`): la base es de la t104 y");
say("     entre medias corrieron 113-116. «Quieta» = «NI la ficha NI las tandas");
say("     intermedias la movieron». Es una COTA, no una atribución limpia.");

fs.writeFileSync(path.join(AQUI, "p3-familias-117.log"), L.join("\n") + "\n");
