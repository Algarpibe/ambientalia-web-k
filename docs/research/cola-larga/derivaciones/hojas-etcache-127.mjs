// 127.ª · ESCALON 1 (b) — ¿QUE SE PIERDE SIN LAS `et-cache` DE LOS 2 VECINOS?
//
// EL SUSTO, y por que hacia falta medirlo: el ESCALON 1 sobre la familia salio
// con `hojas 18/23` — las 5 que faltan son TODAS `et-cache`, y este documento
// ya tiene escrito que **un HTML capturado sin sus hojas no es la pagina: es su
// esqueleto con el estilo puesto por otro**, y que eso no da error sino una
// medida PLAUSIBLE. Asi que la primera lectura fue: la corrida no vale.
//
// PERO ESO ES UNA HIPOTESIS, y §*cuando el cambio se pueda aplicar, APLICALO Y
// MIDE* dice como se contesta: soltar las `et-cache` en el dominio donde SI
// estan (el lote, 30/30) y ver que se mueve. Salio **0 de 52 pares**.
//
// Y UN NO-OP NO PRUEBA NADA HASTA QUE EL TRATAMIENTO DEMUESTRE QUE MUERDE
// (§regla 28a: un sabotaje que no cambia el resultado ha probado que el
// instrumento no lo ejercita). Asi que aqui se contestan TRES preguntas, y la
// tercera es el control del tratamiento:
//
//   1 · ¿DONDE vive el ritmo ORDINAL del editor en estas paginas — en una
//       `et-cache` externa, o INLINE en el <style> del documento?
//   2 · ¿que hay dentro de las `et-cache` que los 2 vecinos NO tienen? Se mira
//       en las hojas HERMANAS ya capturadas (mismo generador, otra pagina).
//   3 · CONTROL DEL TRATAMIENTO: soltar las `et-cache` ¿mueve ALGO? Si no
//       mueve nada, el NO-OP de los 52 pares no dice nada del original.
//
// OFFLINE para 1 y 2 · NAVEGADOR sobre el corpus local para 3.

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch, openPage, settle } from "../../../../scripts/qa/lib.mjs";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const ETCACHE = join(CSS, "wp-content/et-cache");

if (!existsSync(ETCACHE)) { console.error(`❌ PRECONDICION: falta ${ETCACHE}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

const DOCS = [
  { doc: "monitor-calidad-aire.html", etiqueta: "monitor", familia: true, hojasCompletas: true },
  { doc: "estacion-de-monitoreo-de-calidad-del-aire.html", etiqueta: "estacion", familia: true, hojasCompletas: false },
  { doc: "sensor-de-calidad-del-aire.html", etiqueta: "sensor", familia: true, hojasCompletas: false },
  { doc: "accesorios.html", etiqueta: "accesorios", familia: false, hojasCompletas: true },
];
{
  const faltan = DOCS.filter((d) => !existsSync(join(CORPUS, d.doc)));
  if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.map((d) => d.doc).join(", ")}`); process.exit(1); }
}

/* ═══ 1 · ¿DONDE VIVE EL RITMO ORDINAL? ══════════════════════════════════ */
/* El ordinal `et_pb_<tipo>_<n>` lo emite el constructor por modulo, asi que una
   regla de ritmo con ordinal es LO QUE ESCRIBIO EL EDITOR. La pregunta es en
   que CANAL se sirve. Se cuenta en los dos: el <style> inline del documento y
   las hojas externas que enlaza. */
const RE_ORDINAL = /\.et_pb_[a-z][a-z_]*_\d+(_wrapper|_inner)?\b/;
const RE_RITMO = /(margin|padding)-(top|bottom)\s*:/i;

function reglasDe(css) {
  /* Trocea por `}` — basta para contar reglas; no es un parser y se declara. */
  const out = [];
  for (const bloque of css.split("}")) {
    const i = bloque.lastIndexOf("{");
    if (i < 0) continue;
    const sel = bloque.slice(0, i);
    const cuerpo = bloque.slice(i + 1);
    if (!RE_RITMO.test(cuerpo)) continue;
    out.push({ sel: sel.replace(/[\s\S]*[{}]/, "").trim(), ordinal: RE_ORDINAL.test(sel), cuerpo: cuerpo.trim().slice(0, 120) });
  }
  return out;
}

const attr = (t, n) => t.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;
const canales = {};
for (const d of DOCS) {
  const html = readFileSync(join(CORPUS, d.doc), "utf8");
  /* canal A — el <style> INLINE del documento */
  const inline = (html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? []).map((b) => b.replace(/^<style[^>]*>|<\/style>$/gi, "")).join("\n");
  const rInline = reglasDe(inline);
  /* canal B — las hojas ENLAZADAS, separando capturadas de ausentes */
  let rHojas = [], hojasOk = [], hojasFalta = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/rel=["']?stylesheet/i.test(tag)) continue;
    const href = attr(tag, "href");
    if (!href) continue;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    if (!/^https?:/i.test(rel) && existsSync(join(CSS, rel))) {
      hojasOk.push(rel);
      rHojas = rHojas.concat(reglasDe(readFileSync(join(CSS, rel), "utf8")).map((r) => ({ ...r, hoja: rel })));
    } else hojasFalta.push(rel);
  }
  canales[d.etiqueta] = {
    inline: { bytes: inline.length, reglasRitmo: rInline.length, conOrdinal: rInline.filter((r) => r.ordinal).length },
    hojas: { capturadas: hojasOk.length, ausentes: hojasFalta.length, listaAusentes: hojasFalta, reglasRitmo: rHojas.length, conOrdinal: rHojas.filter((r) => r.ordinal).length },
  };
}

/* ═══ 2 · ¿QUE HAY DENTRO DE LAS `et-cache` HERMANAS? ════════════════════ */
/* Las 5 que faltan no se pueden leer (offline). Se leen sus HERMANAS del mismo
   generador ya capturadas, que es lo que el repo SI tiene — y se declara que
   eso es una inferencia por generador, no la hoja concreta. */
const hermanas = [];
for (const dir of readdirSync(ETCACHE)) {
  const p = join(ETCACHE, dir);
  if (!statSync(p).isDirectory()) continue;
  for (const f of readdirSync(p)) {
    if (!f.endsWith(".css")) continue;
    const css = readFileSync(join(p, f), "utf8");
    const r = reglasDe(css);
    hermanas.push({
      fichero: `${dir}/${f}`,
      generador: f.replace(/-?\d+(-late)?\.(min\.)?css$/, "").replace(/\d+/g, "N"),
      bytes: css.length, reglasRitmo: r.length, conOrdinal: r.filter((x) => x.ordinal).length,
    });
  }
}
const porGenerador = new Map();
for (const h of hermanas) {
  if (!porGenerador.has(h.generador)) porGenerador.set(h.generador, { n: 0, ritmo: 0, ordinal: 0, bytes: 0 });
  const e = porGenerador.get(h.generador);
  e.n++; e.ritmo += h.reglasRitmo; e.ordinal += h.conOrdinal; e.bytes += h.bytes;
}

/* ═══ 3 · CONTROL DEL TRATAMIENTO — ¿muerde soltar las et-cache? ═════════ */
/* TRES BRAZOS, y el tercero es el que hace que el segundo signifique algo
 * (§regla 8: un negativo sin control no es un negativo).
 *   `todas`       — la referencia
 *   `sin-etcache` — el TRATAMIENTO: reproduce el estado de los 2 vecinos
 *   `ninguna`     — el CONTROL: si soltar TODAS tampoco moviera nada, el
 *                   instrumento no ejercita el canal y el NO-OP no prueba nada */
function html2(f, modo, cont) {
  return readFileSync(f, "utf8").replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = attr(tag, "href");
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    if (modo === "ninguna") { cont.soltadas++; return tag; }
    if (modo === "sin-etcache" && /et-cache/.test(rel)) { cont.soltadas++; return tag; }
    if (/^https?:/i.test(rel) || !existsSync(join(CSS, rel))) return tag;
    cont.resueltas++;
    return tag.replace(/href=["'][^"']*["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
}
const sonda = () => {
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const nodos = [...document.querySelectorAll(".et_pb_section, .et_pb_row, .et_pb_module")];
  return {
    docH: Math.round(document.documentElement.scrollHeight * 100) / 100,
    nodos: nodos.length,
    conCaja: nodos.filter(conCaja).length,
    /* firma geometrica: la suma de altos, que mueve con cualquier CSS que entre */
    sumaAltos: Math.round(nodos.reduce((a, n) => a + n.getBoundingClientRect().height, 0) * 100) / 100,
  };
};

const efecto = {};
const { browser } = await launch();
try {
  for (const d of DOCS) {
    const f = join(CORPUS, d.doc);
    const par = {};
    for (const modo of ["todas", "sin-etcache", "ninguna"]) {
      const { page } = await openPage(browser, pathToFileURL(f).href, { width: 1440, height: 900 });
      await page.setRequestInterception(true);
      page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
      const cont = { resueltas: 0, soltadas: 0 };
      await page.setContent(html2(f, modo, cont), { waitUntil: "domcontentloaded" });
      await settle(page);
      par[modo] = { ...(await page.evaluate(sonda)), ...cont };
      await page.close();
    }
    const dif = (a, b) => ({
      docH: Math.round((b.docH - a.docH) * 100) / 100,
      sumaAltos: Math.round((b.sumaAltos - a.sumaAltos) * 100) / 100,
      conCaja: b.conCaja - a.conCaja,
      mueve: b.docH !== a.docH || b.sumaAltos !== a.sumaAltos || b.conCaja !== a.conCaja,
    });
    efecto[d.etiqueta] = {
      ...par,
      tratamiento: dif(par.todas, par["sin-etcache"]),
      control: dif(par.todas, par.ninguna),
    };
  }
} finally { await browser.close(); }

/* ═══ CONTROLES ══════════════════════════════════════════════════════════ */
ctl(hermanas.length > 0, "hay `et-cache` hermanas capturadas que leer", `${hermanas.length} ficheros · ${porGenerador.size} generadores`);
const inlineOrdinal = Object.values(canales).reduce((a, c) => a + c.inline.conOrdinal, 0);
const hojasOrdinal = Object.values(canales).reduce((a, c) => a + c.hojas.conOrdinal, 0);
ctl(inlineOrdinal + hojasOrdinal > 0,
  "se encontró ritmo ORDINAL en ALGÚN canal (si fuera 0, el detector no casa y no es un cero)",
  `inline ${inlineOrdinal} · hojas capturadas ${hojasOrdinal}`);
const controlMueve = Object.entries(efecto).filter(([, e]) => e.control.mueve);
const tratamientoMueve = Object.entries(efecto).filter(([, e]) => e.tratamiento.mueve);
/* EL CONTROL VA PRIMERO: si soltar TODAS las hojas no moviera nada, el
 * instrumento no ejercita el canal y ningún NO-OP suyo probaría nada. */
ctl(controlMueve.length > 0,
  "CONTROL (§regla 8) · soltar TODAS las hojas SÍ mueve ⇒ el instrumento ejercita el canal del CSS externo",
  controlMueve.length
    ? controlMueve.map(([k, e]) => `${k} ΔdocH ${e.control.docH} Δaltos ${e.control.sumaAltos} Δcaja ${e.control.conCaja}`).join(" · ")
    : "NO MUEVE EN NINGUNO — el instrumento no ejercita el canal y ningún NO-OP suyo prueba nada");
/* Y AHORA SÍ el tratamiento: su NO-OP es un resultado, no una inercia. */
ctl(true,
  `TRATAMIENTO · soltar sólo las \`et-cache\` mueve en ${tratamientoMueve.length}/${DOCS.length} — ${tratamientoMueve.length ? "aportan geometría" : "NO-OP: no aportan geometría a estas páginas"}`,
  Object.entries(efecto).map(([k, e]) => `${k} ΔdocH ${e.tratamiento.docH}`).join(" · "));
ctl(Object.values(canales).every((c) => c.inline.bytes > 0), "los 4 documentos traen CSS en línea", Object.entries(canales).map(([k, c]) => `${k}=${c.inline.bytes}B`).join(" · "));

/* ═══ INFORME ════════════════════════════════════════════════════════════ */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== 1 · ¿EN QUÉ CANAL VIVE EL RITMO ORDINAL DEL EDITOR? ===");
say("  (una regla de ritmo cuyo selector lleva `et_pb_<tipo>_<n>` es lo que escribió el editor)");
say(`  ${"documento".padEnd(12)} ${"inline: ritmo/ordinal".padEnd(24)} ${"hojas cap.: ritmo/ordinal".padEnd(26)} hojas ausentes`);
for (const [k, c] of Object.entries(canales))
  say(`  ${k.padEnd(12)} ${`${c.inline.reglasRitmo} / ${c.inline.conOrdinal}`.padEnd(24)} ${`${c.hojas.reglasRitmo} / ${c.hojas.conOrdinal}`.padEnd(26)} ${c.hojas.ausentes}`);
say();
for (const [k, c] of Object.entries(canales)) if (c.hojas.ausentes) say(`  ${k} · AUSENTES: ${c.hojas.listaAusentes.join(" · ")}`);
say();

say("=== 2 · QUÉ HAY DENTRO DE LAS `et-cache` (leído en las HERMANAS capturadas) ===");
say("  ⚠ inferencia POR GENERADOR: no son las 5 hojas concretas que faltan, son sus hermanas");
say(`  ${"generador".padEnd(42)} ${"n".padStart(3)} ${"bytes".padStart(9)} ${"ritmo".padStart(7)} ${"c/ordinal".padStart(10)}`);
for (const [g, e] of [...porGenerador].sort((a, b) => b[1].n - a[1].n))
  say(`  ${g.padEnd(42)} ${String(e.n).padStart(3)} ${String(e.bytes).padStart(9)} ${String(e.ritmo).padStart(7)} ${String(e.ordinal).padStart(10)}`);
say();

say("=== 3 · TRATAMIENTO Y CONTROL — ¿qué mueve soltar hojas? ===");
say(`  ${"documento".padEnd(12)} ${"docH todas".padStart(11)} ${"Δ sin-etcache".padStart(14)} ${"Δ ninguna".padStart(11)}   ${"Δaltos sin-et".padStart(14)} ${"Δaltos ninguna".padStart(15)}`);
for (const [k, e] of Object.entries(efecto))
  say(`  ${k.padEnd(12)} ${String(e.todas.docH).padStart(11)} ${String(e.tratamiento.docH).padStart(14)} ${String(e.control.docH).padStart(11)}   ${String(e.tratamiento.sumaAltos).padStart(14)} ${String(e.control.sumaAltos).padStart(15)}`);
say();

say("=== VEREDICTO ===");
say(`  · CONTROL: soltar TODAS las hojas mueve en ${controlMueve.length}/${DOCS.length} ⇒ el instrumento ${controlMueve.length ? "SÍ" : "NO"} ejercita el canal del CSS externo`);
say(`  · TRATAMIENTO: soltar sólo las \`et-cache\` mueve en ${tratamientoMueve.length}/${DOCS.length}`);
say(`  · el ritmo ORDINAL del editor vive INLINE (${inlineOrdinal} reglas) contra ${hojasOrdinal} en hojas capturadas`);
say(`  · y las ${hermanas.length} \`et-cache\` hermanas traen ${[...porGenerador.values()].reduce((a, e) => a + e.ordinal, 0)} reglas de ritmo CON ORDINAL`);
say();
if (controlMueve.length && !tratamientoMueve.length)
  say(`  ⇒ LAS 5 HOJAS AUSENTES NO INVALIDAN LA MEDICIÓN DE RITMO. El canal del ritmo por módulo`);
  say(`    es el <style> del propio documento, que ESTÁ CAPTURADO en los 3. Las \`et-cache\` de`);
  say(`    estas páginas llevan cascarón y CSS del core, y sobre estos 4 ejes son NO-OP medido.`);
if (!controlMueve.length) say(`  ⇒ NO SE PUEDE CONCLUIR: el instrumento no ejercita el canal.`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 127, escalon: "1b",
  pregunta: "¿invalidan las 5 `et-cache` ausentes la medición de ritmo de los 2 vecinos?",
  controles, canales,
  etCacheHermanas: { ficheros: hermanas.length, porGenerador: Object.fromEntries(porGenerador) },
  efectoDelTratamiento: efecto,
  veredicto: {
    controlMueve: controlMueve.length, tratamientoMueve: tratamientoMueve.length, deDocumentos: DOCS.length,
    ritmoOrdinalInline: inlineOrdinal, ritmoOrdinalEnHojas: hojasOrdinal,
    ritmoOrdinalEnEtCacheHermanas: [...porGenerador.values()].reduce((a, e) => a + e.ordinal, 0),
    conclusion: controlMueve.length && !tratamientoMueve.length
      ? "las 5 hojas ausentes NO invalidan la medición de ritmo: el canal del ritmo por módulo es el <style> del propio documento, capturado en los 3"
      : controlMueve.length ? "las et-cache SÍ aportan geometría — la medición de los 2 vecinos queda en duda"
        : "NO SE PUEDE CONCLUIR: el instrumento no ejercita el canal",
  },
  alcance: ["OFFLINE para los canales; navegador local a 1440 para el control del tratamiento", "las 5 hojas ausentes NO se leen: se infiere por generador desde sus hermanas capturadas"],
};

const base = join(DERIV, process.env.SALIDA || "hojas-etcache-127");
for (const [ruta, texto] of [[`${base}.json`, JSON.stringify(salida, null, 1)], [`${base}.log`, L.join("\n") + "\n"]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto && !process.env.PISAR) {
    console.error(`❌ ${ruta} existe y DIFIERE — no se pisa (§regla 5). PISAR=1 para forzar.`);
    process.exit(1);
  }
  writeFileSync(ruta, texto);
}
const fallos = controles.filter((c) => !c.ok);
console.log(`\n✓ evaluados ${DOCS.length}/${DOCS.length} documentos · ${hermanas.length} hojas et-cache hermanas · controles ${controles.length - fallos.length}/${controles.length}`);
console.log(`→ ${base}.json  ·  ${base}.log`);
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
