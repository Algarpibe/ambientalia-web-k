// 125.ª · ESCALON 3 — LA BASE DE LAS UNIDADES RELATIVAS, MEDIDA EN EL ELEMENTO.
//
// LO QUE YA ESTA CERRADO Y NO SE REABRE: la 124.ª corrio la cascada sobre los
// 984 pares y adjudico **269 · 0 sin declaracion ganadora**. QUIEN escribio
// cada valor esta dicho por el selector, no inferido. Los 10 «ciegos relativos
// al font» salen **CAMPO en los 10** por su ordinal.
//
// LO QUE QUEDA, Y ES OTRA PREGUNTA: **con que BASE**. Este documento avisa dos
// veces y las dos con numero —
//   · «un `em` citado sin su `font-size` es la misma trampa que un `%` citado
//      sin su contenedor»: se predijo 22 px donde eran 16.5, y el fallo estaba
//      en el DENOMINADOR, no en la lectura de la regla;
//   · «un valor relativo se escribe CON SU BASE MEDIDA —"0.5em de un cuerpo de
//      15"— o no se escribe. Y la base se mide EN EL ELEMENTO, no se hereda de
//      la hoja donde aparecio la declaracion».
//
// Y LA PREGUNTA QUE ESTO DECIDE, que es la del PASO 0 de esta misma tanda:
//   ¿la base es CONSTANTE entre 1440 y 390?
//     · SI  ⇒ un `rem` sirve el mismo px a los dos anchos, asi que guardarlo en
//             px es FIEL y `medida()` no necesita un valor de unidad para el;
//     · NO  ⇒ guardarlo en px pierde informacion, y el eje de unidad hace falta.
//   El PASO 0 dejo ese hueco «SIN PROBAR con su cardinal (32)». Esto lo mide.
//
// EL CONTROL, y sin el la medida no vale: **`declarado × base == computado`**,
// al bit. Si la aritmetica no cierra, la base que se ha medido NO es la que el
// navegador uso, y el numero seria plausible y falso.
//
// §regla 35 — se publica ademas, por cada eje, QUE reglas compiten dentro de un
// `@media` y con que especificidad. Un arreglo verificado en el ancho donde su
// regla no tiene rival sale perfecto y es el ancho donde no se puede saber si
// gana.
//
// ALCANCE: los 4 documentos del lote. NO es el sitio.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch, openPage, settle } from "../../../../scripts/qa/lib.mjs";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
const MEDIA_RAICES = [join(RAIZ, "apps/web/public/images/uploads"), join(RAIZ, "media-corpus")];
const REF_124 = "docs/research/cola-larga/derivaciones/paso0-nodos-124.json";

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];
const EJES = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
const PROPS_CSS = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
const ANCHOS = [1440, 390];

/* ── PRECONDICIONES, ANTES DEL LAUNCH (§regla 37) ─────────────────────────── */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(`corpus/productos/${d.doc}`);
if (!existsSync(CSS)) faltan.push("corpus/css");
if (!existsSync(REF_124)) faltan.push(REF_124);
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.length} insumos, comprobados ANTES del launch:\n   ${faltan.join("\n   ")}`);
  process.exit(1);
}
const ref124 = JSON.parse(readFileSync(REF_124, "utf8"));

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

/* ── EXTRACCION — marca los nodos y mide LAS DOS BASES en el elemento ─────── */
const extraer = (ejes) => {
  const px = (v) => Math.round((parseFloat(v) || 0) * 10000) / 10000;
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  const out = [];
  /* LA BASE DEL `rem` — el `font-size` computado del elemento RAIZ. Se mide,
   * no se supone 16: el customizer del sitio puede bajarlo (ya paso: se predijo
   * 22 px con el 20 del core donde el customizer servia 15). */
  const baseRem = px(getComputedStyle(document.documentElement).fontSize);
  for (const [tipo, sel] of [["seccion", ".et_pb_section"], ["fila", ".et_pb_row"], ["modulo", ".et_pb_module"]]) {
    const nodos = [...document.querySelectorAll(sel)].filter((n) => !enCascaron(n));
    for (const [i, n] of nodos.filter(conCaja).entries()) {
      const ord = (String(n.className).match(/et_pb_[a-z_]+_(\d+)\b/) ?? [])[0] ?? null;
      if (!ord) continue;
      const clave = `${tipo}|${ord}`;
      n.setAttribute("data-k125", clave);
      const cs = getComputedStyle(n);
      const v = {};
      for (const e of ejes) v[e] = px(cs[e]);
      out.push({
        tipo, i, clave,
        v,
        /* LA BASE DEL `em` — el `font-size` DEL PROPIO ELEMENTO, que es contra
         * lo que se resuelve. No se hereda de la hoja donde vive la regla. */
        baseEm: px(cs.fontSize),
        baseRem,
      });
    }
  }
  return { nodos: out, baseRem, anchoVentana: window.innerWidth };
};

/* ── CASCADA — copiada de la 124.ª, con el ganador CALCULADO ──────────────── */
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;
const esOrdinal = (sel) => {
  if (/_tb_/.test(sel)) return false;
  for (const m of sel.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (ORDINAL.test(m[1])) return true;
  return false;
};
/** Especificidad (a,b,c) de un compuesto — §regla 35: se necesita para saber
 *  si una regla dentro de un `@media` le gana a la de fuera. */
function especificidad(sel) {
  const s = sel.split(",")[0];
  const ids = (s.match(/#[\w-]+/g) ?? []).length;
  const cls = (s.match(/\.[\w-]+|\[[^\]]+\]|:[a-z-]+\([^)]*\)|:(?!:)[a-z-]+/gi) ?? []).length;
  const tags = (s.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return [ids, cls, tags];
}
const cmpEsp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

async function cascada(client) {
  const { root } = await client.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await client.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-k125]" });
  const fuera = new Map();
  for (const nodeId of nodeIds) {
    let clave = null;
    try {
      const { attributes } = await client.send("DOM.getAttributes", { nodeId });
      const i = attributes.indexOf("data-k125");
      if (i < 0) continue;
      clave = attributes[i + 1];
    } catch { continue; }
    let m;
    try { m = await client.send("CSS.getMatchedStylesForNode", { nodeId }); } catch { continue; }
    const gana = {};
    const compiten = {};
    const anota = (sel, style, orden, inline, media) => {
      for (const p of style?.cssProperties ?? []) {
        if (!p.value || p.disabled || !PROPS_CSS.includes(p.name)) continue;
        const peso = (p.important ? 2 : 0) + (inline ? 1 : 0);
        const esp = inline ? [1, 0, 0] : especificidad(sel);
        (compiten[p.name] ??= []).push({ sel: sel.slice(0, 90), valor: p.value, imp: !!p.important, media: media || null, esp });
        const prev = gana[p.name];
        if (!prev || peso > prev.peso || (peso === prev.peso && orden >= prev.orden))
          gana[p.name] = { peso, orden, sel, valor: p.value, editor: inline || esOrdinal(sel), imp: !!p.important, inline, media: media || null, esp };
      }
    };
    (m.matchedCSSRules ?? []).forEach((r, i2) => {
      const media = (r.rule?.media ?? []).map((x) => x.text).join(" & ");
      anota(r.rule?.selectorList?.text ?? "", r.rule?.style, i2, false, media);
    });
    if (m.inlineStyle) anota("(style=)", m.inlineStyle, 1e6, true, null);
    fuera.set(clave, { gana, compiten });
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
      const ext = await page.evaluate(extraer, EJES);
      const casc = client ? await cascada(client) : new Map();
      porAncho[ancho] = { ...ext, casc };
      await page.close();
    }
    medidas[d.doc] = porAncho;
  }
} finally {
  await browser.close();
}

/* ── ANALISIS ─────────────────────────────────────────────────────────────── */
const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

const REL = /^(-?[\d.]+)(rem|em)$/;
const relativos = [];
const basesRem = {};
let conCompetenciaMedia = 0;

for (const d of DOCS) {
  const m = medidas[d.doc];
  basesRem[d.arquetipo] = { 1440: m[1440].baseRem, 390: m[390].baseRem };
  const idx = (a) => new Map(a.nodos.map((n) => [n.clave, n]));
  const I = { 1440: idx(m[1440]), 390: idx(m[390]) };

  for (const ancho of ANCHOS) {
    for (const [clave, n] of I[ancho]) {
      const c = m[ancho].casc.get(clave);
      if (!c) continue;
      for (const [i, prop] of PROPS_CSS.entries()) {
        const g = c.gana[prop];
        if (!g) continue;
        const mm = String(g.valor).trim().replace(/\s*!important$/, "").match(REL);
        if (!mm) continue;
        const num = parseFloat(mm[1]), unidad = mm[2];
        const base = unidad === "rem" ? n.baseRem : n.baseEm;
        const predicho = Math.round(num * base * 10000) / 10000;
        const observado = n.v[EJES[i]];
        /* Competencia dentro de `@media` — §regla 35. */
        const rivalesMedia = (c.compiten[prop] ?? []).filter((r) => r.media);
        if (rivalesMedia.length) conCompetenciaMedia++;
        relativos.push({
          doc: d.arquetipo, ancho, clave, eje: EJES[i],
          declarado: g.valor, unidad, num,
          base, predicho, observado,
          cuadra: Math.abs(predicho - observado) < 0.02,
          quien: g.editor ? "EDITOR (ordinal/inline)" : "PLANTILLA (generico)",
          selector: g.sel.slice(0, 90),
          media: g.media,
          espGanador: g.esp,
          rivalesEnMedia: rivalesMedia.map((r) => ({ sel: r.sel, valor: r.valor, media: r.media, esp: r.esp, imp: r.imp })),
        });
      }
    }
  }
}

const cuadran = relativos.filter((r) => r.cuadra).length;
const noCuadran = relativos.filter((r) => !r.cuadra);
const porUnidad = {};
for (const r of relativos) porUnidad[r.unidad] = (porUnidad[r.unidad] ?? 0) + 1;

/* ¿LA BASE ES CONSTANTE ENTRE ANCHOS? — la pregunta que decide el PASO 0. */
const baseRemConstante = Object.values(basesRem).every((b) => b[1440] === b[390]);
const basesEmPorClave = new Map();
for (const d of DOCS) {
  const m = medidas[d.doc];
  const a = new Map(m[1440].nodos.map((n) => [n.clave, n.baseEm]));
  const b = new Map(m[390].nodos.map((n) => [n.clave, n.baseEm]));
  for (const [k, v] of a) if (b.has(k) && b.get(k) !== v) basesEmPorClave.set(`${d.arquetipo}|${k}`, { 1440: v, 390: b.get(k) });
}

/* CONTROLES */
ctl(relativos.length > 0, "se hallaron declaraciones ganadoras en unidad relativa", `${relativos.length} pares`);
ctl(
  Object.keys(porUnidad).length > 0 && relativos.length < 984,
  "el detector DISCRIMINA (ni cero ni pleno sobre los 984 pares)",
  JSON.stringify(porUnidad),
);
/* EL CONTROL QUE SOSTIENE TODO: la aritmetica tiene que cerrar al bit. */
ctl(
  noCuadran.length === 0,
  "CONTROL ARITMETICO: `declarado × base == computado` en TODOS",
  `${cuadran}/${relativos.length} cuadran · ${noCuadran.length} no`,
);
/* CRUCE con la 124.ª (§sondas 4): sus 10 ciegos relativos al font deben estar. */
const ciegos124 = (ref124.ciegos?.nodos ?? []).filter((n) => n.unidad === "relativa-al-font");
const clavesRel = new Set(relativos.filter((r) => r.ancho === 1440).map((r) => `${r.doc}|${r.clave}|${r.eje}`));
const cubiertos = ciegos124.filter((n) => {
  const p = n.nodo.split(" ");
  return clavesRel.has(`${p[0]}|${p[1]}|${p[2]}|${p[3]}`);
}).length;
ctl(
  ciegos124.length > 0,
  "CRUCE: la 124.ª declaraba ciegos relativos al font (el dominio existe)",
  `${ciegos124.length} en la 124.ª · ${cubiertos} reencontrados @1440`,
);
ctl(RESUELTAS > 0 && RESUELTAS === ENLAZADAS, "§regla 32: las hojas se resolvieron TODAS", `${RESUELTAS}/${ENLAZADAS}`);

/* ── INFORME ──────────────────────────────────────────────────────────────── */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== LA BASE DEL `rem` — medida, no supuesta ===");
for (const d of DOCS) {
  const b = basesRem[d.arquetipo];
  say(`  ${d.arquetipo.padEnd(15)} @1440 = ${b[1440]}px   @390 = ${b[390]}px   ${b[1440] === b[390] ? "IGUAL" : "⚠ DISTINTA"}`);
}
say(`  ⇒ base del \`rem\` CONSTANTE entre anchos: ${baseRemConstante ? "SI" : "NO"}`);
say();
say(`  bases de \`em\` (font-size del propio elemento) que CAMBIAN entre anchos: ${basesEmPorClave.size}`);
for (const [k, v] of [...basesEmPorClave].slice(0, 6)) say(`      ${k}: ${v[1440]} → ${v[390]}`);
say();

say("=== LOS PARES CON DECLARACION GANADORA EN UNIDAD RELATIVA ===");
say(`  total ${relativos.length} · por unidad ${JSON.stringify(porUnidad)}`);
say(`  CONTROL ARITMETICO: ${cuadran}/${relativos.length} cuadran al bit`);
if (noCuadran.length) for (const r of noCuadran.slice(0, 8)) say(`      ❌ ${r.doc} ${r.clave} ${r.eje}: ${r.declarado} × ${r.base} = ${r.predicho} pero se observa ${r.observado}`);
say();
say("  CADA UNO CON SU BASE MEDIDA (§«0.5em de un cuerpo de 15» o no se escribe):");
for (const r of relativos.filter((x) => x.ancho === 1440)) {
  say(`      [${r.doc}] ${r.clave} ${r.eje}`);
  say(`          ${r.declarado}  =  ${r.num} ${r.unidad} de una base de ${r.base}px  =  ${r.predicho}px   (observado ${r.observado})`);
  say(`          quien: ${r.quien}   ·   selector: ${r.selector}${r.media ? `   ·   @media ${r.media}` : ""}`);
  if (r.rivalesEnMedia.length)
    for (const v of r.rivalesEnMedia) say(`          §regla 35 · rival en @media ${v.media}: ${v.sel} = ${v.valor}${v.imp ? " !important" : ""} esp=(${v.esp})`);
}
say();

say("=== §regla 35 · COMPETENCIA DENTRO DE `@media` ===");
say(`  pares relativos con al menos una regla rival dentro de un @media: ${conCompetenciaMedia}`);
say();

say("=== VEREDICTO ===");
say(`  1 · ¿la base del \`rem\` es CONSTANTE entre 1440 y 390? → ${baseRemConstante ? "SI" : "NO"}`);
say(`      ⇒ ${baseRemConstante
  ? "un `rem` sirve el MISMO px a los dos anchos en estos 4 documentos: guardarlo en px es FIEL,\n        asi que `medida()` NO necesita un valor de unidad para `rem` — POR ESTE DOMINIO"
  : "guardar px PIERDE informacion: el eje de unidad hace falta"}`);
say(`  2 · bases de \`em\` que cambian entre anchos: ${basesEmPorClave.size}`);
say(`  3 · el control aritmetico ${noCuadran.length === 0 ? "CIERRA" : "NO cierra"}: sin el, la base medida no seria la que el navegador uso`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 125, escalon: 3,
  alcance: { docs: DOCS.map((d) => d.doc), nota: "propiedad de estos 4 documentos, no del sitio" },
  controles,
  basesRem, baseRemConstante,
  basesEmQueCambian: Object.fromEntries(basesEmPorClave),
  relativos,
  resumen: { pares: relativos.length, porUnidad, cuadran, noCuadran: noCuadran.length, conCompetenciaMedia },
  hojas: { enlazadas: ENLAZADAS, resueltas: RESUELTAS },
};

const base = join(RAIZ, "docs/research/cola-larga/derivaciones", process.env.SALIDA || "escalon3-bases-125");
writeFileSync(`${base}.json`, JSON.stringify(salida, null, 2));
writeFileSync(`${base}.log`, L.join("\n"));
console.log(`\n→ ${base}.json  ·  ${base}.log`);
process.exit(controles.every((c) => c.ok) ? 0 : 1);
