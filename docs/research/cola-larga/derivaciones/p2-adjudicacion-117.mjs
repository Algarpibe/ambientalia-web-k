/**
 * P2 · 117.ª — ADJUDICACIÓN DEL PRE-REGISTRO A 390
 *
 * Predicado pre-registrado, LITERAL, del commit `d023918`:
 *
 *   «P2 a 390: se mueven las 152 y NO se mueven las 261. Apilan, no hay
 *    dónde absorber.»
 *
 * Se corre y se compara contra eso. NO se reescribe el predicado (§regla 8b:
 * un pre-registro protege de decidir por cansancio).
 *
 * El cruce va POR FAMILIA contra el registro `slugs` — un total no distingue
 * las 152 de blog de las 261 restantes (§*un cardinal es un contenedor*).
 *
 * ⚠ NO levanta navegador y NO toca `.next`.
 *
 * Salida: `p2-adjudicacion-117.log`.
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
    throw new Error(`p2-adjudicacion-117: falta \`${f}\`. ¿Renombrada? Candidatas (${fam.length}):\n  ` + fam.join("\n  "));
  }
  return JSON.parse(fs.readFileSync(r, "utf8"));
};

/* La base se CITA CON SU FICHERO (§regla 5: el nombre canónico de esta
 * familia es la PRIMERA foto, no el estado de hoy). */
const F_BASE = "clon-base-390-t104-despues.json";
const F_HOY = "clon-base-390-t117-tras-la-ficha.json";
const base = lee(F_BASE);
const hoy = lee(F_HOY);

const psql = (sql) =>
  execFileSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-t", "-A", "-F", "\t", "-c", sql], { encoding: "utf8" });
const filas = psql("select familia, slug from slugs order by familia, slug;")
  .split("\n").map((l) => l.trim()).filter(Boolean)
  .map((l) => { const [familia, slug] = l.split("\t"); return { familia, slug }; });
if (!filas.length) throw new Error("p2-adjudicacion-117: REGISTRO DE SLUGS VACÍO");
const famDe = new Map();
for (const { familia, slug } of filas) famDe.set(`/${slug}`, familia);

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("═══ P2 · 117.ª — ADJUDICACIÓN A 390 ═══");
say("");
say("  PREDICADO PRE-REGISTRADO (d023918, literal):");
say("    «P2 a 390: se mueven las 152 y NO se mueven las 261.»");
say("");
say(`  base : ${F_BASE}  (${base.meta.rutas} rutas · ${base.meta.width}px)`);
say(`  hoy  : ${F_HOY}  (${hoy.meta.rutas} rutas · ${hoy.meta.width}px)`);
say("");

const kb = Object.keys(base.paginas), kh = Object.keys(hoy.paginas);
const sb = new Set(kb), sh = new Set(kh);
const soloBase = kb.filter((k) => !sh.has(k));
const soloHoy = kh.filter((k) => !sb.has(k));
say("── MEMBRESÍA (diferencia simétrica, los DOS lados nombrados) ──");
say(`  en la base y NO hoy : ${soloBase.length}${soloBase.length ? "  " + soloBase.slice(0, 20).join(" · ") : ""}`);
say(`  hoy y NO en la base : ${soloHoy.length}${soloHoy.length ? "  " + soloHoy.slice(0, 20).join(" · ") : ""}`);
say(`  comunes             : ${kh.filter((k) => sb.has(k)).length}`);
say("");

const est = new Map();
const SIN = "«sin fila en el registro»";
for (const k of kh) {
  if (!sb.has(k)) continue;
  const f = famDe.get(k) || SIN;
  if (!est.has(f)) est.set(f, { quietas: [], movidas: [], aparecidas: [], desaparecidas: [] });
  const e = est.get(f);
  const a = base.paginas[k]?.docH, b = hoy.paginas[k]?.docH;
  const na = typeof a === "number", nb = typeof b === "number";
  if (!na && nb) e.aparecidas.push({ k, a, b });
  else if (na && !nb) e.desaparecidas.push({ k, a, b });
  else if (na && nb && a !== b) e.movidas.push({ k, a, b, d: +(b - a).toFixed(2) });
  else e.quietas.push(k);
}

say("── REPARTO POR FAMILIA (docH, comunes) ──");
say("");
say("  familia                        quietas  movidas  aparec.  desap.");
say("  ─────────────────────────────  ───────  ───────  ───────  ──────");
for (const [f, e] of [...est].sort((a, b) => (b[1].quietas.length + b[1].movidas.length) - (a[1].quietas.length + a[1].movidas.length))) {
  say(`  ${f.padEnd(29)}  ${String(e.quietas.length).padStart(7)}  ${String(e.movidas.length).padStart(7)}  ${String(e.aparecidas.length).padStart(7)}  ${String(e.desaparecidas.length).padStart(6)}`);
}
say("");

/* ── EL VEREDICTO: los DOS lados del predicado, por separado ─────────────
 * «se mueven las 152» y «NO se mueven las 261» son DOS afirmaciones, y una
 * puede cumplirse sin la otra. Se adjudican por separado o el total las
 * confunde. */
const blog = est.get("entradas-blog") || { quietas: [], movidas: [], aparecidas: [], desaparecidas: [] };
const resto = [...est].filter(([f]) => f !== "entradas-blog").map(([, e]) => e);
const sum = (sel) => resto.reduce((n, e) => n + sel(e).length, 0);

const blogTot = blog.quietas.length + blog.movidas.length + blog.aparecidas.length + blog.desaparecidas.length;
const restoTot = sum((e) => e.quietas) + sum((e) => e.movidas) + sum((e) => e.aparecidas) + sum((e) => e.desaparecidas);

say("── VEREDICTO, LADO A LADO ──");
say("");
say(`  LADO 1 · «se mueven las 152»`);
say(`     entradas-blog en el cruce : ${blogTot}`);
say(`     MOVIDAS                   : ${blog.movidas.length}`);
say(`     quietas                   : ${blog.quietas.length}`);
say(`     aparecidas / desaparec.   : ${blog.aparecidas.length} / ${blog.desaparecidas.length}`);
const lado1 = blog.movidas.length === 152;
say(`     ⇒ ${lado1 ? "✅ CONFIRMADO" : "❗ REFUTADO"} — se predijeron 152 movidas, hay ${blog.movidas.length}`);
say("");
say(`  LADO 2 · «NO se mueven las 261»`);
say(`     no-blog en el cruce       : ${restoTot}`);
say(`     quietas                   : ${sum((e) => e.quietas)}`);
say(`     MOVIDAS                   : ${sum((e) => e.movidas)}`);
say(`     aparecidas / desaparec.   : ${sum((e) => e.aparecidas)} / ${sum((e) => e.desaparecidas)}`);
const lado2 = sum((e) => e.movidas) === 0;
say(`     ⇒ ${lado2 ? "✅ CONFIRMADO" : "❗ REFUTADO"} — se predijeron 0 movidas, hay ${sum((e) => e.movidas)}`);
say("");

for (const [f, e] of est) {
  if (f === "entradas-blog") continue;
  const raros = [...e.movidas, ...e.aparecidas, ...e.desaparecidas];
  if (!raros.length) continue;
  say(`  ── no-blog · ${f} — las ${raros.length} que NO están quietas ──`);
  for (const x of e.movidas) say(`     MOVIDA     ${x.k}  ${x.a} → ${x.b}  Δ${x.d > 0 ? "+" : ""}${x.d}`);
  for (const x of e.aparecidas) say(`     APARECIDA  ${x.k}  undefined → ${x.b}`);
  for (const x of e.desaparecidas) say(`     DESAPAREC. ${x.k}  ${x.a} → undefined`);
  say("");
}

/* ── LA MAGNITUD DEL MOVIMIENTO, no sólo su recuento ─────────────────────
 * Un recuento dice cuántas se movieron; sólo la distribución dice si se
 * movieron POR LA MISMA CAUSA (§*el recuento no dice hacia dónde*). */
if (blog.movidas.length) {
  const ds = blog.movidas.map((x) => x.d);
  const uniq = new Map();
  for (const d of ds) uniq.set(d, (uniq.get(d) || 0) + 1);
  say("── MAGNITUD del movimiento en entradas-blog (Δ docH) ──");
  say(`  valores distintos : ${uniq.size}`);
  say(`  min / max         : ${Math.min(...ds)} / ${Math.max(...ds)}`);
  const top = [...uniq].sort((a, b) => b[1] - a[1]).slice(0, 8);
  say(`  más frecuentes    : ${top.map(([d, n]) => `Δ${d > 0 ? "+" : ""}${d} ×${n}`).join(" · ")}`);
  say("");
}

/* ── ATRIBUCIÓN: el ANCHO separa la ficha de las tandas intermedias ──────
 *
 * §regla espejo, usada como DISCRIMINADOR y no como comprobación: el efecto
 * de la ficha está TAPADO a 1440 (la columna de contenido `3_4` es más alta
 * que la hermana `1_4` donde vive). Por tanto:
 *
 *   · una ruta que se mueve en LOS DOS anchos **no puede ser la ficha** — su
 *     causa se ve donde la ficha no llega, o sea es otra;
 *   · una ruta que se mueve **sólo a 390** lleva la firma de la pieza tapada.
 *
 * Sin este corte, las 14 del LADO 2 se leen todas como refutación del
 * pre-registro, y 6 de ellas no lo son (§*el recuento de pares tocados por una
 * deriva del objetivo no dice si hay daño: el discriminador es CREA/MUEVE*). */
const F_B14 = "clon-base-1440-t104-despues4.json";
const F_H14 = "clon-base-1440-t117-tras-la-ficha.json";
const b14 = lee(F_B14), h14 = lee(F_H14);
const movidasDe = (b, h) =>
  new Set(Object.keys(h.paginas).filter((k) => {
    const a = b.paginas[k]?.docH, c = h.paginas[k]?.docH;
    return typeof a === "number" && typeof c === "number" && a !== c;
  }));
const m14 = movidasDe(b14, h14);
const m39 = movidasDe(base, hoy);
const enAmbos = [...m39].filter((k) => m14.has(k));
const solo390 = [...m39].filter((k) => !m14.has(k));
const solo1440 = [...m14].filter((k) => !m39.has(k));

say("── ATRIBUCIÓN POR ANCHO (§regla espejo como discriminador) ──");
say(`  movidas @1440 : ${m14.size}     (base ${F_B14})`);
say(`  movidas @390  : ${m39.size}`);
say("");
say(`  en LOS DOS anchos : ${enAmbos.length}  ⇒ NO es la ficha (su efecto está tapado a 1440)`);
for (const k of enAmbos) say(`     ${k}`);
say("");
say(`  sólo a 390        : ${solo390.length}  ⇒ firma de PIEZA TAPADA = la ficha`);
say(`     de ellas, entradas-blog : ${solo390.filter((k) => famDe.get(k) === "entradas-blog").length}`);
const no1 = solo390.filter((k) => famDe.get(k) !== "entradas-blog");
say(`     de ellas, NO blog       : ${no1.length}`);
for (const k of no1) {
  const d = +(hoy.paginas[k].docH - base.paginas[k].docH).toFixed(2);
  say(`        ${k}  Δ${d > 0 ? "+" : ""}${d}`);
}
say("");
say(`  sólo a 1440       : ${solo1440.length}`);
say("");
say("  ⇒ LECTURA DEL LADO 2, en dos mitades que NO se pueden fundir:");
say("");
say("     (a) EL HECHO — el pre-registro predijo 0 movidas no-blog y hay 14.");
say("         **REFUTADO**, sin matices. De ellas, 6 se mueven a los dos anchos");
say("         y por tanto NO son la ficha: son las tandas intermedias.");
say("");
say("     (b) LA ATRIBUCIÓN de las 8 restantes — **SIN PROBAR**, y no por");
say("         pereza: la firma de ancho y la MAGNITUD dicen cosas distintas.");
say("");
say("           firma de ancho : sólo a 390  → compatible con la ficha (tapada)");
say("           magnitud       : Δ≈+504 uniforme, contra Δ+4/+5 en 146 de las");
say("                            152 entradas — **dos órdenes de diferencia**");
say("");
say("         Un mismo mecanismo que produce +5 en una familia y +504 en otra");
say("         necesita explicación, y no la hay medida. Las dos hipótesis vivas");
say("         —«la ficha se pinta distinto en el centro de ayuda» y «otro cambio");
say("         de 113-116 que TAMBIÉN está tapado a 1440»— predicen lo mismo en");
say("         todo lo que esta corrida puede ver: **0 instancias separadoras**.");
say("");
say("         Y lo que las separaría es medible: una base tomada JUSTO antes de");
say("         la ficha. No existe, así que esto NO se cierra aquí (§*antes de");
say("         fichar una indeterminación, comprueba que las dos hipótesis sean");
say("         DISTINTAS* — aquí lo son, y difieren sobre esa base).");
say("");

say("── SALVEDAD (la misma que P3) ──");
say(`  la base es de la t104 (${F_BASE}) y entre medias corrieron 113-116, así`);
say("  que «movida» aquí es «la movió la ficha O una tanda intermedia». Para el");
say("  LADO 1 eso no debilita nada —lo predicho era que se movieran—, pero el");
say("  LADO 2 sí queda como COTA: una quieta lo está frente a TODO lo intermedio.");

fs.writeFileSync(path.join(AQUI, "p2-adjudicacion-117.log"), L.join("\n") + "\n");
