// 125.ª · ESCALON 4 — LA VARIANZA INTER-INSTANCIA. ¿Hay con que medirla?
//
// LA INCOGNITA DECLARADA DE F3-5 es que «cada uno es singleton o casi», asi que
// no se sabe que es plantilla y que es campo: modelar desde UNA instancia es el
// arreglo falso que la fase existe para no cometer.
//
// PERO ANTES DE DARLO POR IMPOSIBLE (punto 1 del encargo): el LOTE son 4 rutas.
// Si una PIEZA aparece en varias, su varianza entre instancias SI se puede
// medir — «una varianza entre instancias de la misma PIEZA vale aunque los
// arquetipos sean singleton».
//
// LA LLAVE NO PUEDE SER EL ORDINAL: `et_pb_text_4` en PRODUCTO y en CATALOGO
// son modulos distintos, no dos instancias de uno. Lo que identifica una pieza
// es el **marcador SEMANTICO** —la clase CSS personalizada que el editor pone
// en el modulo—, que es §*el literal de className no discrimina; lo que
// identifica un modulo es el marcador semantico*.
//
// Y EL CONJUNTO DE MARCADORES SE DERIVA CENSANDO LO QUE APARECE, no se escribe
// de memoria (§sondas 4, el corolario de construccion).
//
// §regla 36 — se separa SUJETO de CONTEXTO. Un eje cuyo efecto vive en los
// descendientes daria Δ0 comparado en el nodo AUNQUE el defecto este puesto,
// asi que atribuirselo al nodo es un enunciado falso con medida de coartada.
//
// EL LISTON NO ES «≥2» (§*ese «≥2» esta mal puesto como liston*): es TODO EL
// DOMINIO ALCANZABLE, y lo que no se alcance sale con su fraccion — nunca «se
// comprobo».
//
// ALCANCE: los 4 documentos del lote, a 1440 y 390.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch, openPage, settle } from "../../../../scripts/qa/lib.mjs";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
const MEDIA_RAICES = [join(RAIZ, "apps/web/public/images/uploads"), join(RAIZ, "media-corpus")];

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];
const EJES = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
const PROPS_CSS = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
const ANCHOS = [1440, 390];

/* ── PRECONDICIONES ANTES DEL LAUNCH (§regla 37) ──────────────────────────── */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(`corpus/productos/${d.doc}`);
if (!existsSync(CSS)) faltan.push("corpus/css");
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

/* ── LOCALIZACION DE ASSETS — copiada sin tocar ───────────────────────────── */
const attr = (t, n) => t.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;
let ENLAZADAS = 0, RESUELTAS = 0;
function conAssetsLocales(html) {
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = attr(tag, "href");
    if (!href) return tag;
    ENLAZADAS++;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    if (/^https?:/i.test(rel) || !existsSync(join(CSS, rel))) return tag;
    RESUELTAS++;
    return tag.replace(/href=["'][^"']*["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attr(tag, "src");
    if (!src || /^data:/i.test(src)) return tag;
    const rel = src.replace(/^https?:\/\/[^/]*kunakair\.com\/wp-content\/uploads\//i, "").split("?")[0];
    if (/^https?:/i.test(rel)) return tag;
    const b = rel.slice(rel.lastIndexOf("/") + 1);
    const norm = rel.slice(0, rel.lastIndexOf("/") + 1) + b.slice(0, b.lastIndexOf(".")).toLowerCase().replace(/\./g, "") + b.slice(b.lastIndexOf("."));
    for (const d of MEDIA_RAICES) for (const r of [rel, norm]) if (existsSync(join(d, r))) return tag.replace(/src=["'][^"']*["']/i, `src="${pathToFileURL(join(d, r)).href}"`);
    return tag;
  });
  return out;
}

/* ── EXTRACCION ───────────────────────────────────────────────────────────── */
const extraer = (ejes) => {
  const px = (v) => Math.round((parseFloat(v) || 0) * 10000) / 10000;
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  /* Un marcador SEMANTICO es una clase que NO viene del constructor ni del
   * tema: ni `et_pb_*`, ni `et-*`, ni `et_*`. El conjunto se CENSA. */
  const esSemantica = (c) => !/^et[_-]/.test(c) && !/^(wp|has|is|clearfix)/.test(c) && c.length > 2;
  const out = [];
  for (const [tipo, sel] of [["seccion", ".et_pb_section"], ["fila", ".et_pb_row"], ["modulo", ".et_pb_module"]]) {
    for (const n of [...document.querySelectorAll(sel)].filter((x) => !enCascaron(x) && conCaja(x))) {
      const clases = String(n.className).split(/\s+/).filter(Boolean);
      const sem = clases.filter(esSemantica);
      if (!sem.length) continue;
      const cs = getComputedStyle(n);
      const v = {};
      for (const e of ejes) v[e] = px(cs[e]);
      for (const s of sem) n.setAttribute("data-sem", s);
      out.push({
        tipo, semanticas: sem, v,
        anchoCaja: Math.round(n.getBoundingClientRect().width * 100) / 100,
        clases: clases.slice(0, 8),
      });
    }
  }
  return out;
};

/* ── CASCADA con §regla 36 — el papel del marcador en el selector ganador ─── */
function papel(selector, marcador) {
  let vioContexto = false;
  for (const alt of selector.split(",")) {
    const comps = alt.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    if (!comps.length) continue;
    const tieneEn = (c) => [...c.matchAll(/\.([A-Za-z_][\w-]*)/g)].some((m) => m[1] === marcador);
    if (tieneEn(comps[comps.length - 1])) return "sujeto";
    if (comps.slice(0, -1).some(tieneEn)) vioContexto = true;
  }
  return vioContexto ? "contexto" : "no-aparece";
}

async function cascada(client) {
  const { root } = await client.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await client.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-sem]" });
  const fuera = new Map();
  for (const nodeId of nodeIds) {
    let marc = null;
    try {
      const { attributes } = await client.send("DOM.getAttributes", { nodeId });
      const i = attributes.indexOf("data-sem");
      if (i < 0) continue;
      marc = attributes[i + 1];
    } catch { continue; }
    let m;
    try { m = await client.send("CSS.getMatchedStylesForNode", { nodeId }); } catch { continue; }
    const gana = {};
    const anota = (sel, style, orden, inline) => {
      for (const p of style?.cssProperties ?? []) {
        if (!p.value || p.disabled || !PROPS_CSS.includes(p.name)) continue;
        const peso = (p.important ? 2 : 0) + (inline ? 1 : 0);
        const prev = gana[p.name];
        if (!prev || peso > prev.peso || (peso === prev.peso && orden >= prev.orden))
          gana[p.name] = { peso, orden, sel, valor: p.value, papelDelMarcador: inline ? "inline" : papel(sel, marc) };
      }
    };
    (m.matchedCSSRules ?? []).forEach((r, i2) => anota(r.rule?.selectorList?.text ?? "", r.rule?.style, i2, false));
    if (m.inlineStyle) anota("(style=)", m.inlineStyle, 1e6, true);
    if (!fuera.has(marc)) fuera.set(marc, []);
    fuera.get(marc).push(gana);
  }
  return fuera;
}

/* ── RECORRIDO ────────────────────────────────────────────────────────────── */
const medidas = {};
const { browser } = await launch();
try {
  for (const d of DOCS) {
    const f = join(CORPUS, d.doc);
    const porAncho = {};
    for (const ancho of ANCHOS) {
      const { page } = await openPage(browser, pathToFileURL(f).href, { width: ancho, height: ancho <= 480 ? 844 : 900, mobile: ancho <= 480 });
      const client = await page.createCDPSession().catch(() => null);
      if (client) { await client.send("DOM.enable"); await client.send("CSS.enable"); }
      await page.setRequestInterception(true);
      page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
      await page.setContent(conAssetsLocales(readFileSync(f, "utf8")), { waitUntil: "domcontentloaded" });
      await settle(page);
      const nodos = await page.evaluate(extraer, EJES);
      const casc = ancho === 1440 && client ? await cascada(client) : new Map();
      porAncho[ancho] = { nodos, casc };
      await page.close();
    }
    medidas[d.doc] = porAncho;
  }
} finally { await browser.close(); }

/* ── ANALISIS ─────────────────────────────────────────────────────────────── */
const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* CENSO DE MARCADORES — derivado, no escrito de memoria. */
const docsPorMarcador = new Map();
for (const d of DOCS)
  for (const n of medidas[d.doc][1440].nodos)
    for (const s of n.semanticas) {
      if (!docsPorMarcador.has(s)) docsPorMarcador.set(s, new Set());
      docsPorMarcador.get(s).add(d.arquetipo);
    }

const conVariasInstancias = [...docsPorMarcador].filter(([, s]) => s.size >= 2);
const singleton = [...docsPorMarcador].filter(([, s]) => s.size < 2);

/* VARIANZA INTER-INSTANCIA — un marcador con >=2 documentos. Se agrega el
 * valor de cada eje POR DOCUMENTO. Si dos documentos traen valores distintos,
 * lo escribio una persona: CAMPO (test B, inter-instancia). */
const varianza = [];
for (const [marc, docsSet] of conVariasInstancias) {
  for (const ancho of ANCHOS) {
    for (const eje of EJES) {
      const porDoc = {};
      for (const d of DOCS) {
        if (!docsSet.has(d.arquetipo)) continue;
        const vals = medidas[d.doc][ancho].nodos.filter((n) => n.semanticas.includes(marc)).map((n) => n.v[eje]);
        if (!vals.length) continue;
        /* Dentro de un documento el marcador puede repetirse (19 toggles): se
         * publica el conjunto, no la media — un promedio taparia la varianza. */
        porDoc[d.arquetipo] = [...new Set(vals)].sort((a, b) => a - b);
      }
      const docs = Object.keys(porDoc);
      if (docs.length < 2) continue;
      const firmas = docs.map((k) => JSON.stringify(porDoc[k]));
      const distintas = new Set(firmas).size;
      /* §regla 36 — el papel del marcador en el selector GANADOR de ese eje. */
      const prop = PROPS_CSS[EJES.indexOf(eje)];
      const papeles = new Set();
      if (ancho === 1440)
        for (const d of DOCS) {
          for (const g of medidas[d.doc][1440].casc.get(marc) ?? []) {
            const gg = g[prop];
            if (gg) papeles.add(gg.papelDelMarcador);
          }
        }
      varianza.push({
        marcador: marc, ancho, eje,
        instancias: docs.length, porDoc,
        firmasDistintas: distintas,
        veredicto: distintas > 1 ? "CAMPO (varia entre instancias)" : "SIN VARIANZA (no distingue)",
        papelDelMarcador: [...papeles],
      });
    }
  }
}

const conVarianza = varianza.filter((v) => v.firmasDistintas > 1);
const sinVarianza = varianza.filter((v) => v.firmasDistintas === 1);

/* CONTROLES */
ctl(docsPorMarcador.size > 0, "se censo algo (hay marcadores semanticos)", `${docsPorMarcador.size} marcadores`);
ctl(
  conVariasInstancias.length > 0,
  "HAY piezas con >=2 instancias (la varianza inter-instancia ES medible)",
  conVariasInstancias.map(([m, s]) => `${m}=${s.size}`).join(" · "),
);
ctl(
  varianza.length > 0 && conVarianza.length < varianza.length,
  "el detector de varianza DISCRIMINA (ni cero ni pleno)",
  `${conVarianza.length} con varianza · ${sinVarianza.length} sin`,
);
/* CONTROL EN NEGATIVO de §regla 36: el papel tiene que saber decir «no-aparece»
   —el marcador semantico casi nunca es el sujeto del selector de Divi—. */
ctl(
  papel(".et-db .kunak-faq-item", "kunak-faq-item") === "sujeto" &&
    papel(".kunak-faq-item .et_pb_row", "kunak-faq-item") === "contexto" &&
    papel(".et_pb_text_4", "kunak-faq-item") === "no-aparece",
  "CONTROL EN NEGATIVO §regla 36: sujeto/contexto/no-aparece se distinguen",
  "3 selectores conocidos",
);
ctl(RESUELTAS > 0 && RESUELTAS === ENLAZADAS, "§regla 32: las hojas se resolvieron TODAS", `${RESUELTAS}/${ENLAZADAS}`);

/* ── INFORME ──────────────────────────────────────────────────────────────── */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== CENSO DE MARCADORES SEMANTICOS (derivado, no escrito de memoria) ===");
for (const [m, s] of [...docsPorMarcador].sort((a, b) => b[1].size - a[1].size))
  say(`  ${String(s.size)} doc(s)  ${m.padEnd(24)} ${[...s].join(" · ")}`);
say();
say(`  con >=2 instancias: ${conVariasInstancias.length}   ·   singleton: ${singleton.length}`);
say();

say("=== VARIANZA INTER-INSTANCIA (unidad: marcador × ancho × eje) ===");
say(`  pares evaluables: ${varianza.length}  ·  CON varianza: ${conVarianza.length}  ·  SIN varianza: ${sinVarianza.length}`);
say();
for (const v of varianza) {
  const marca = v.firmasDistintas > 1 ? "★" : " ";
  say(`  ${marca} ${v.marcador} @${v.ancho} ${v.eje}  → ${v.veredicto}  (n=${v.instancias} instancias)`);
  for (const [d, vals] of Object.entries(v.porDoc)) say(`        ${d.padEnd(16)} ${JSON.stringify(vals)}`);
  if (v.papelDelMarcador.length) say(`        §regla 36 · papel del marcador en el selector ganador: ${v.papelDelMarcador.join(" · ")}`);
}
say();

say("=== VEREDICTO ===");
say(`  1 · ¿es medible la varianza inter-instancia en el lote? ${conVariasInstancias.length ? "SI" : "NO"}`);
say(`      piezas con >=2 instancias: ${conVariasInstancias.map(([m, s]) => `${m} (${s.size})`).join(" · ") || "(ninguna)"}`);
say(`  2 · ejes que salen CAMPO por varianza inter-instancia: ${conVarianza.length} de ${varianza.length}`);
say(`  3 · ejes SIN VARIANZA: ${sinVarianza.length} — NO son «plantilla probada», son SIN VARIANZA en el dominio alcanzable`);
say(`  4 · marcadores singleton (no establecido, con su denominador): ${singleton.length} de ${docsPorMarcador.size}`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 125, escalon: 4,
  alcance: { docs: DOCS.map((d) => d.doc), anchos: ANCHOS, nota: "propiedad de estos 4 documentos; el liston es el dominio alcanzable, no «>=2»" },
  controles,
  censoMarcadores: Object.fromEntries([...docsPorMarcador].map(([m, s]) => [m, [...s]])),
  conVariasInstancias: conVariasInstancias.map(([m, s]) => ({ marcador: m, docs: [...s] })),
  singleton: singleton.map(([m, s]) => ({ marcador: m, docs: [...s] })),
  varianza,
  resumen: { pares: varianza.length, conVarianza: conVarianza.length, sinVarianza: sinVarianza.length },
  hojas: { enlazadas: ENLAZADAS, resueltas: RESUELTAS },
};

const base = join(RAIZ, "docs/research/cola-larga/derivaciones", process.env.SALIDA || "escalon4-varianza-125");
writeFileSync(`${base}.json`, JSON.stringify(salida, null, 2));
writeFileSync(`${base}.log`, L.join("\n"));
console.log(`\n→ ${base}.json  ·  ${base}.log`);
process.exit(controles.every((c) => c.ok) ? 0 : 1);
