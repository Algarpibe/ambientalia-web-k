// 127.ª · ESCALON 1 — LA VARIANZA INTER-INSTANCIA SOBRE LA FAMILIA PRODUCTO
//
// El dominio son 3 documentos del MISMO arquetipo (monitor + sus 2 vecinos a
// Jaccard >=0.7), no 4 arquetipos distintos. Eso cambia lo que la varianza
// significa: en el lote, dos valores distintos podian ser dos PLANTILLAS; aqui
// son dos instancias de la misma, luego lo escribio quien edito cada pagina.
//
// LAS DOS PATAS, y la segunda NO es opcional (punto 3 del encargo):
//
//   PATA 1 · varianza inter-instancia. Valores distintos entre documentos para
//            la misma pieza ⇒ CAMPO.
//   PATA 2 · la CASCADA (`CSS.getMatchedStylesForNode`), a LOS DOS ANCHOS.
//            Del selector GANADOR se deriva quien escribio:
//              · lleva ORDINAL (`et_pb_<tipo>_<n>`) ⇒ el editor  ⇒ CAMPO
//              · GENERICO (sin ordinal)             ⇒ el tema    ⇒ PLANTILLA
//              · ordinal DENTRO de `@media`         ⇒ el editor por punto de
//                ruptura (`FN-bp`, medido en la 124.ª) ⇒ CAMPO
//              · sin declaracion ganadora           ⇒ SIN ESCRIBIR
//
// ⚠ DISCREPANCIA CON EL ENUNCIADO DEL ENCARGO, declarada en vez de resuelta en
// silencio. El punto 2 dice «varianza CERO entre instancias de la misma forma
// ⇒ PLANTILLA». Esa lectura es la del regimen PLANTILLADO, y el PASO 0 midio
// que los 3 documentos son `B-` (BUILDER): ahi SI existe la persona que edito
// cada pagina, y varianza cero es el FALSO NEGATIVO DECLARADO del test B — un
// campo que el editor puso uniforme. Asi que aqui:
//
//   varianza cero es NECESARIA pero NO SUFICIENTE para PLANTILLA.
//   Quien la dicta es la PATA 2, y todo eje declarado PLANTILLA sale con su
//   selector ganador, su UNIDAD DECLARADA y si vive dentro de un `@media`.
//
// ⚠ Y LA CONDICION QUE SE ESCRIBE ANTES DE MIRAR (pre-registro §4): un eje cuyo
// valor ganador ES EL INICIAL de la propiedad sale SIN ESCRIBIR sea cual sea el
// selector. Un reset generico que produce 0 no es «la plantilla decidio este
// valor»: es que nadie decidio. Sin esto la pata 2 dictaria PLANTILLA en casi
// los 46 y eso seria el PLENO de §sondas 4.
//
// CRITERIO DE RECUENTO: el mismo de la 125.ª —nodos CON CAJA (w>0 y h>0)—, para
// que el cruce contra su congelada compare lo mismo (§regla 31 hermana).
//
// ALCANCE: 3 documentos, 2 anchos, 4 ejes de ritmo. NO mide el clon. NO mide
// caja ni tipografia.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch, openPage, settle } from "../../../../scripts/qa/lib.mjs";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const MEDIA_RAICES = [join(RAIZ, "apps/web/public/images/uploads"), join(RAIZ, "media-corpus")];
const V125 = join(DERIV, "escalon4-varianza-125.json");
const PASO0 = join(DERIV, "paso0-dominio-127.json");

const EJES = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
const PROPS_CSS = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
const INICIAL = 0; /* el valor inicial de margin/padding */
const ANCHOS = [1440, 390];

/* ── PRECONDICIONES ANTES DEL LAUNCH (§regla 37) ──────────────────────────── */
{
  const faltan = [];
  for (const p of [CORPUS, CSS, V125, PASO0]) if (!existsSync(p)) faltan.push(p);
  if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }
}
const paso0 = JSON.parse(readFileSync(PASO0, "utf8"));
const v125 = JSON.parse(readFileSync(V125, "utf8"));

/* ═══ MODO — un solo instrumento, dos dominios y un sabotaje ══════════════ */
/* §regla 8: un control corrido con OTRO codigo no adjudica este. El dominio
   `lote` reproduce la medicion de la 125.ª con ESTE mismo codigo, y eso es lo
   unico que separa «el cero es del dominio» de «el cero es del instrumento». */
const DOMINIO = process.env.DOMINIO === "lote" ? "lote" : "familia";
/* SABOTAJE / TRATAMIENTO: quitar las hojas `et-cache`, que es donde Divi
   compila lo que el editor escribio por modulo. Se aplica a TODOS los
   documentos (§regla 32: lo que se le hace a un lado se le hace al otro). */
const SIN_ETCACHE = !!process.env.SIN_ETCACHE;

/* Los documentos se DERIVAN del PASO 0, no se escriben aqui: si el Jaccard
   cambia, esta sonda lo recoge sola (§regla 9, 7.º caso). */
const DOCS = (DOMINIO === "lote" ? paso0.alcance.docsLote : paso0.alcance.docsFamilia)
  .map((f) => ({ doc: f, etiqueta: f.replace(/\.html$/, "") }));
{
  const faltan = DOCS.filter((d) => !existsSync(join(CORPUS, d.doc)));
  if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.map((d) => d.doc).join(", ")}`); process.exit(1); }
}
/* Y el regimen es PRECONDICION DE LECTURA: si algun documento no fuera `B-`, el
   veredicto de varianza se invierte para el y esta sonda no lo sabe leer. */
const noBuilder = Object.entries(paso0.regimenes).filter(([, r]) => !r.casillero.startsWith("B"));

/* ═══ EL DETECTOR DE ORDINAL, con su control en negativo ══════════════════ */
/* El constructor emite `et_pb_<tipo>_<n>` por modulo. NO es ordinal el TIPO DE
   COLUMNA (`et_pb_column_1_2`, dos numeros) ni `et_pb_gutters3` (sin `_`). */
const esTokenOrdinal = (t) => /^et_pb_[a-z][a-z_]*_\d+(_wrapper|_inner)?$/.test(t);
const llevaOrdinal = (selector) =>
  [...String(selector).matchAll(/\.([A-Za-z_][\w-]*)/g)].some((m) => esTokenOrdinal(m[1]));

const CASOS_ORDINAL = [
  [".et_pb_text_4", true], [".et_pb_button_0_wrapper", true], [".et_pb_section_0", true],
  [".et_pb_column_1_2", false], [".et_pb_gutters3 .et_pb_module", false], [".kunak-faq-item", false],
];

/* ═══ §regla 36 — papel del marcador en el selector ═══════════════════════ */
function papel(selector, marcador) {
  let vioContexto = false;
  for (const alt of String(selector).split(",")) {
    const comps = alt.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    if (!comps.length) continue;
    const tieneEn = (c) => [...c.matchAll(/\.([A-Za-z_][\w-]*)/g)].some((m) => m[1] === marcador);
    if (tieneEn(comps[comps.length - 1])) return "sujeto";
    if (comps.slice(0, -1).some(tieneEn)) vioContexto = true;
  }
  return vioContexto ? "contexto" : "no-aparece";
}
const CASOS_PAPEL = [
  [".et-db .kunak-faq-item", "kunak-faq-item", "sujeto"],
  [".kunak-faq-item .et_pb_row", "kunak-faq-item", "contexto"],
  [".et_pb_text_4", "kunak-faq-item", "no-aparece"],
];

/* ═══ ASSETS LOCALES — §regla 32: se resuelven y se PUBLICA el cardinal ═══ */
const attr = (t, n) => t.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;
function conAssetsLocales(html, cont) {
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = attr(tag, "href");
    if (!href) return tag;
    cont.hojasEnlazadas++;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    /* TRATAMIENTO: se deja la hoja SIN resolver, que es exactamente el estado en
       que estan los 2 vecinos — no se borra el <link>, para reproducir el modo
       de fallo y no otro. */
    if (SIN_ETCACHE && /et-cache/.test(rel)) { cont.hojasEtCacheSoltadas++; return tag; }
    if (/^https?:/i.test(rel) || !existsSync(join(CSS, rel))) return tag;
    cont.hojasResueltas++;
    return tag.replace(/href=["'][^"']*["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attr(tag, "src");
    if (!src || /^data:/i.test(src)) return tag;
    cont.imgEnlazadas++;
    const rel = src.replace(/^https?:\/\/[^/]*kunakair\.com\/wp-content\/uploads\//i, "").split("?")[0];
    if (/^https?:/i.test(rel)) return tag;
    const b = rel.slice(rel.lastIndexOf("/") + 1);
    const norm = rel.slice(0, rel.lastIndexOf("/") + 1) + b.slice(0, b.lastIndexOf(".")).toLowerCase().replace(/\./g, "") + b.slice(b.lastIndexOf("."));
    for (const d of MEDIA_RAICES) for (const r of [rel, norm]) if (existsSync(join(d, r))) {
      cont.imgResueltas++;
      return tag.replace(/src=["'][^"']*["']/i, `src="${pathToFileURL(join(d, r)).href}"`);
    }
    return tag;
  });
  return out;
}

/* ═══ EXTRACCION — mismo criterio de recuento que la 125.ª (CON CAJA) ═════ */
const extraer = (ejes) => {
  const px = (v) => Math.round((parseFloat(v) || 0) * 10000) / 10000;
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  const esSemantica = (c) => !/^et[_-]/.test(c) && !/^(wp|has|is|clearfix)/.test(c) && c.length > 2;
  const out = [];
  let enDom = 0;
  for (const [tipo, sel] of [["seccion", ".et_pb_section"], ["fila", ".et_pb_row"], ["modulo", ".et_pb_module"]]) {
    for (const n of document.querySelectorAll(sel)) {
      if (enCascaron(n)) continue;
      const clases = String(n.className).split(/\s+/).filter(Boolean);
      const sem = clases.filter(esSemantica);
      if (!sem.length) continue;
      enDom++;
      if (!conCaja(n)) continue;
      const cs = getComputedStyle(n);
      const v = {};
      for (const e of ejes) v[e] = px(cs[e]);
      /* ⚠ HEREDADO DE LA 125.ª Y ARREGLADO AQUI: `for (const s of sem)
       * n.setAttribute("data-sem", s)` deja SOLO EL ULTIMO marcador, asi que
       * un marcador que nunca va el ultimo no recibe NINGUN dato de cascada —
       * y eso no sale como error: sale como «sin declaracion ganadora», o sea
       * SIN PROBAR. Medido: los 6 SIN PROBAR de la corrida defectuosa son
       * exactamente `iconos-xs-2`, `dvmd_table_maker` y `dvmd_table_maker_0`,
       * los tres que co-ocurren SIEMPRE con otro que va detras. */
      n.setAttribute("data-sem", sem.join(" "));
      out.push({ tipo, semanticas: sem, v, anchoCaja: Math.round(n.getBoundingClientRect().width * 100) / 100 });
    }
  }
  return { nodos: out, enDom };
};

/* ═══ CASCADA — a LOS DOS ANCHOS, con @media, unidad y origen ═════════════ */
async function cascada(client) {
  const { root } = await client.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await client.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-sem]" });
  const fuera = new Map();
  for (const nodeId of nodeIds) {
    let marcs = null;
    try {
      const { attributes } = await client.send("DOM.getAttributes", { nodeId });
      const i = attributes.indexOf("data-sem");
      if (i < 0) continue;
      marcs = attributes[i + 1].split(/\s+/).filter(Boolean);
    } catch { continue; }
    let m;
    try { m = await client.send("CSS.getMatchedStylesForNode", { nodeId }); } catch { continue; }
    const gana = {};
    const anota = (sel, style, orden, inline, media, origen) => {
      for (const p of style?.cssProperties ?? []) {
        if (!p.value || p.disabled || !PROPS_CSS.includes(p.name)) continue;
        const peso = (p.important ? 2 : 0) + (inline ? 1 : 0);
        const prev = gana[p.name];
        if (!prev || peso > prev.peso || (peso === prev.peso && orden >= prev.orden))
          gana[p.name] = {
            peso, orden, selector: sel, valorDeclarado: p.value,
            unidad: (String(p.value).match(/[a-z%]+$/i) ?? ["(sin unidad)"])[0],
            enMedia: media, origen, ordinal: inline ? true : llevaOrdinal(sel), inline,
          };
      }
    };
    (m.matchedCSSRules ?? []).forEach((r, i2) =>
      anota(
        r.rule?.selectorList?.text ?? "", r.rule?.style, i2, false,
        (r.rule?.media ?? []).map((x) => x.text).filter(Boolean).join(" | ") || null,
        r.rule?.origin ?? "?",
      ));
    if (m.inlineStyle) anota("(style=)", m.inlineStyle, 1e6, true, null, "inline");
    for (const marc of marcs) {
      if (!fuera.has(marc)) fuera.set(marc, []);
      fuera.get(marc).push(gana);
    }
  }
  return fuera;
}

/* ═══ RECORRIDO ══════════════════════════════════════════════════════════ */
const cont = { hojasEnlazadas: 0, hojasResueltas: 0, hojasEtCacheSoltadas: 0, imgEnlazadas: 0, imgResueltas: 0 };
const porDocAssets = {};
const medidas = {};
const { browser } = await launch();
try {
  for (const d of DOCS) {
    const f = join(CORPUS, d.doc);
    const antes = { ...cont };
    const porAncho = {};
    for (const ancho of ANCHOS) {
      const { page } = await openPage(browser, pathToFileURL(f).href, { width: ancho, height: ancho <= 480 ? 844 : 900, mobile: ancho <= 480 });
      const client = await page.createCDPSession().catch(() => null);
      if (client) { await client.send("DOM.enable"); await client.send("CSS.enable"); }
      await page.setRequestInterception(true);
      page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
      const html = ancho === ANCHOS[0]
        ? conAssetsLocales(readFileSync(f, "utf8"), cont)
        : conAssetsLocales(readFileSync(f, "utf8"), { hojasEnlazadas: 0, hojasResueltas: 0, hojasEtCacheSoltadas: 0, imgEnlazadas: 0, imgResueltas: 0 });
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await settle(page);
      const { nodos, enDom } = await page.evaluate(extraer, EJES);
      /* La cascada se toma a LOS DOS anchos (la 125.ª sólo a 1440): `FN-bp` es
         justo el caso en que el ganador cambia con el ancho (§regla 35). */
      const casc = client ? await cascada(client) : new Map();
      porAncho[ancho] = { nodos, enDom, casc };
      await page.close();
    }
    porDocAssets[d.etiqueta] = {
      hojas: `${cont.hojasResueltas - antes.hojasResueltas}/${cont.hojasEnlazadas - antes.hojasEnlazadas}`,
      imagenes: `${cont.imgResueltas - antes.imgResueltas}/${cont.imgEnlazadas - antes.imgEnlazadas}`,
    };
    medidas[d.etiqueta] = porAncho;
  }
} finally { await browser.close(); }

/* ═══ ANALISIS ═══════════════════════════════════════════════════════════ */
const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* CENSO — derivado, con su denominador: en cuantos de los 3 aparece. */
const docsPorMarcador = new Map();
const instanciasPorMarcadorDoc = new Map();
for (const d of DOCS)
  for (const n of medidas[d.etiqueta][ANCHOS[0]].nodos)
    for (const s of n.semanticas) {
      if (!docsPorMarcador.has(s)) docsPorMarcador.set(s, new Set());
      docsPorMarcador.get(s).add(d.etiqueta);
      const k = `${s}::${d.etiqueta}`;
      instanciasPorMarcadorDoc.set(k, (instanciasPorMarcadorDoc.get(k) ?? 0) + 1);
    }
const compartidos = [...docsPorMarcador].filter(([, s]) => s.size >= 2);
const singleton = [...docsPorMarcador].filter(([, s]) => s.size < 2);

/* ── LOS PARES, con las dos patas ───────────────────────────────────────── */
const pares = [];
for (const [marc, docsSet] of compartidos) {
  for (const ancho of ANCHOS) {
    for (const eje of EJES) {
      const prop = PROPS_CSS[EJES.indexOf(eje)];
      const porDoc = {};
      for (const d of DOCS) {
        if (!docsSet.has(d.etiqueta)) continue;
        const vals = medidas[d.etiqueta][ancho].nodos.filter((n) => n.semanticas.includes(marc)).map((n) => n.v[eje]);
        if (!vals.length) continue;
        porDoc[d.etiqueta] = [...new Set(vals)].sort((a, b) => a - b);
      }
      const docs = Object.keys(porDoc);
      if (docs.length < 2) continue;

      const firmas = new Set(docs.map((k) => JSON.stringify(porDoc[k])));
      const hayVarianza = firmas.size > 1;
      const todoInicial = Object.values(porDoc).every((v) => v.every((x) => x === INICIAL));

      /* PATA 2 — el selector ganador de ESTE eje a ESTE ancho, agregado sobre
         los nodos del marcador en los documentos donde aparece. */
      const ganadores = [];
      for (const d of docs)
        for (const g of medidas[d][ancho].casc.get(marc) ?? []) {
          const gg = g[prop];
          if (gg) ganadores.push({ doc: d, ...gg, papelDelMarcador: gg.inline ? "inline" : papel(gg.selector, marc) });
        }
      const conOrdinal = ganadores.filter((g) => g.ordinal);
      const genericos = ganadores.filter((g) => !g.ordinal);
      const enMedia = ganadores.filter((g) => g.enMedia);

      /* ⚠⚠ VARIANZA DE ESTRUCTURA, NO DE CAMPO — el hallazgo de esta tanda.
       * Comparar CONJUNTOS de valores entre instancias confunde «el editor
       * escribió otro valor» con «la MISMA regla se aplicó a otro número de
       * hermanos». Una pseudo-clase estructural —`:last-child`, `:first-child`,
       * `:nth-*`, `.et-last-child`— mete un valor extra en el conjunto SIN QUE
       * NADIE ESCRIBA NADA. Medido: `iconos-xs-2` da [31.6719] en PRODUCTO y
       * [0, 31.6719] en SOFTWARE-corta, y el 0 es el `:last-child` de Divi.
       * El discriminador es la CASCADA: si quitando los valores que declaran
       * las reglas estructurales todos los documentos coinciden, Y ningún
       * ganador lleva ordinal, entonces no hubo editor. */
      const RE_ESTRUCTURAL = /:(last|first|only)-child|:nth-|\.et-last-child/;
      const valoresEstructurales = new Set(
        ganadores.filter((g) => RE_ESTRUCTURAL.test(g.selector))
          .map((g) => Math.round(parseFloat(g.valorDeclarado) * 10000) / 10000)
          .filter((x) => Number.isFinite(x)));
      const sinEstruct = docs.map((d) => JSON.stringify(porDoc[d].filter((v) => !valoresEstructurales.has(v))));
      const coincidenSinEstructurales = valoresEstructurales.size > 0
        && new Set(sinEstruct).size === 1 && JSON.parse(sinEstruct[0]).length > 0;
      const varianzaEstructural = hayVarianza && coincidenSinEstructurales && conOrdinal.length === 0;

      /* CONTROL DE COHERENCIA (§regla 1): el valor declarado del ganador tiene
         que ser compatible con el computado. Si no, el modelo de cascada no
         vale para ese par y sale INCONSISTENTE en vez de usarse. */
      const computados = new Set(Object.values(porDoc).flat());
      const declaradosPx = ganadores.filter((g) => /px$/.test(g.valorDeclarado)).map((g) => Math.round(parseFloat(g.valorDeclarado) * 10000) / 10000);
      const coherente = declaradosPx.length === 0 || declaradosPx.some((x) => computados.has(x));

      /* VEREDICTO — en cascada, y el orden importa. */
      let veredicto, via;
      if (varianzaEstructural) {
        /* La varianza existe y NO la escribió nadie: es una regla estructural
           sobre otro número de hermanos. Cae al lado de la cascada. */
        veredicto = genericos.length ? "PLANTILLA" : "SIN PROBAR";
        via = `varianza ESTRUCTURAL (${[...valoresEstructurales].join(",")} de una pseudo-clase), sin ordinal ⇒ no es campo` +
          (genericos.length ? " · pata 2 · cascada · selector GENÉRICO" : " · y sin genérico legible");
      } else if (hayVarianza) { veredicto = "CAMPO"; via = "pata 1 · varianza inter-instancia"; }
      else if (todoInicial) { veredicto = "SIN ESCRIBIR"; via = "único valor observado = el inicial de la propiedad"; }
      else if (!ganadores.length) { veredicto = "SIN PROBAR"; via = "sin varianza y sin declaración ganadora legible"; }
      else if (!coherente) { veredicto = "SIN PROBAR"; via = "cascada INCOHERENTE con el computado — no se usa"; }
      else if (conOrdinal.length) {
        veredicto = "CAMPO";
        via = enMedia.some((g) => g.ordinal) ? "pata 2 · cascada · ordinal DENTRO de @media (FN-bp)" : "pata 2 · cascada · selector ORDINAL";
      } else if (genericos.length) { veredicto = "PLANTILLA"; via = "pata 2 · cascada · selector GENÉRICO"; }
      else { veredicto = "SIN PROBAR"; via = "sin separar"; }

      pares.push({
        marcador: marc, ancho, eje, prop,
        docsConLaPieza: docs.length, denominador: DOCS.length,
        instancias: Object.fromEntries(docs.map((d) => [d, instanciasPorMarcadorDoc.get(`${marc}::${d}`) ?? 0])),
        porDoc, firmasDistintas: firmas.size, todoInicial,
        varianzaEstructural, valoresEstructurales: [...valoresEstructurales],
        veredicto, via,
        segundaPata: ganadores.length
          ? {
            selectorGanador: [...new Set(ganadores.map((g) => g.selector))].slice(0, 4),
            unidadDeclarada: [...new Set(ganadores.map((g) => g.unidad))],
            valorDeclarado: [...new Set(ganadores.map((g) => g.valorDeclarado))].slice(0, 4),
            enMedia: [...new Set(ganadores.map((g) => g.enMedia).filter(Boolean))],
            origen: [...new Set(ganadores.map((g) => g.origen))],
            ordinal: conOrdinal.length > 0,
            papelDelMarcador: [...new Set(ganadores.map((g) => g.papelDelMarcador))],
            coherenteConComputado: coherente,
          }
          : null,
      });
    }
  }
}

const cuenta = (v) => pares.filter((p) => p.veredicto === v).length;
const CAMPO = pares.filter((p) => p.veredicto === "CAMPO");
const PLANTILLA = pares.filter((p) => p.veredicto === "PLANTILLA");
const SINESCR = pares.filter((p) => p.veredicto === "SIN ESCRIBIR");
const SINPROB = pares.filter((p) => p.veredicto === "SIN PROBAR");

/* ── CRUCE CONTRA LOS 46 DEL LOTE — la unidad es el PAR, y se nombra ────── */
const llave = (p) => `${p.marcador}|${p.ancho}|${p.eje}`;
const los46 = (v125.varianza ?? []).filter((p) => p.firmasDistintas === 1);
const los6 = (v125.varianza ?? []).filter((p) => p.firmasDistintas > 1);
const aqui = new Map(pares.map((p) => [llave(p), p]));
const veredicto46 = los46.map((p) => {
  const n = aqui.get(llave(p));
  return { llave: llave(p), evaluadoAqui: !!n, veredicto: n?.veredicto ?? "NO EVALUABLE en la familia", via: n?.via ?? null };
});
const resueltos46 = veredicto46.filter((x) => x.veredicto === "CAMPO" || x.veredicto === "PLANTILLA");
const abiertos46 = veredicto46.filter((x) => x.veredicto !== "CAMPO" && x.veredicto !== "PLANTILLA");
const nuevos = pares.filter((p) => !los46.some((q) => llave(q) === llave(p)) && !los6.some((q) => llave(q) === llave(p)));

/* CONTROL de la refutación A — y su LÍMITE, que hay que declarar.
 * Los 6 CAMPO de la 125.ª son varianza entre PRODUCTO y {CATALOGO, SOFTWARE,
 * SOFTWARE-corta}. En el dominio `familia` esos documentos NO EXISTEN, así que
 * la misma comparación no se puede rehacer: el control es DEGENERADO POR
 * CONSTRUCCIÓN —0 instancias separadoras— igual que el `occ == 1` de un
 * marcador. Se publica con su cardinal y NO adjudica el instrumento.
 * Quien adjudica el instrumento es `DOMINIO=lote`. */
const DOCS_125 = new Set(["PRODUCTO", "CATALOGO", "SOFTWARE", "SOFTWARE-corta"]);
const etiquetasAqui = new Set(DOCS.map((d) => d.etiqueta));
const reproduce6 = los6.map((p) => {
  const n = aqui.get(llave(p));
  /* ¿la comparación de la 125.ª es REHACIBLE aquí? Sólo si sus documentos
     están en este dominio. En `lote` sí; en `familia` no, y eso no es un fallo
     del instrumento sino del dominio. */
  const docsDelPar = Object.keys(p.porDoc);
  const rehacible = DOMINIO === "lote"
    ? docsDelPar.every((x) => DOCS_125.has(x))
    : docsDelPar.every((x) => etiquetasAqui.has(x));
  /* ⚠ §regla 5ter — ARREGLAR EL INSTRUMENTO CADUCA SUS MEDIDAS, así que el
   * control se parte en dos afirmaciones que NO son la misma:
   *   · ¿reproduce la MEDIDA?  → los conjuntos de valores, comparados como
   *     multiconjunto porque las ETIQUETAS de documento difieren entre la
   *     125.ª (arquetipos) y esta corrida (nombres de fichero);
   *   · ¿reproduce el VEREDICTO? → puede no hacerlo por un discriminador NUEVO,
   *     y eso es un hallazgo, no una avería. Se reporta con su motivo. */
  const firma = (o) => JSON.stringify(Object.values(o).map((v) => JSON.stringify(v)).sort());
  const mismaMedida = !!n && firma(p.porDoc) === firma(n.porDoc);
  return {
    llave: llave(p), evaluadoAqui: !!n, docsDelPar, rehacible,
    veredicto: n?.veredicto ?? "NO EVALUABLE",
    veredicto125: "CAMPO",
    mismaMedida,
    reproduce: n?.veredicto === "CAMPO",
    motivoDelCambio: n && n.veredicto !== "CAMPO" ? n.via : null,
  };
});
const evaluables6 = reproduce6.filter((x) => x.evaluadoAqui && x.rehacible);
const degenerados6 = reproduce6.filter((x) => !x.rehacible);

/* CORRIDA VÁLIDA — §regla 31: una precondición que invalida la MEDIDA se
 * cuenta en rojo y deja llegar al informe, pero lo que sale NO es una medida:
 * las refutaciones pre-registradas quedan NO EVALUABLES, no verdes ni rojas.
 * Un SIN PROBAR en verde se lee como probado. */
/* Y cuando FALTEN hojas, la validez NO la decide el criterio de quien mide:
 * la decide una MEDICIÓN. `hojas-etcache-127` soltó las `et-cache` en el
 * dominio donde SÍ están y midió qué se mueve, con su control. Si dice que el
 * canal se ejercita (control mueve) y que las `et-cache` son NO-OP sobre estos
 * ejes (tratamiento no mueve), la corrida VALE PARA ESTOS EJES, y se cita la
 * congelada. Si la congelada no existe o dice otra cosa, no vale. */
const ADJ = join(DERIV, "hojas-etcache-127.json");
const adj = existsSync(ADJ) ? JSON.parse(readFileSync(ADJ, "utf8")).veredicto : null;
const ausenciaAdjudicada = !!adj && adj.controlMueve > 0 && adj.tratamientoMueve === 0 && adj.ritmoOrdinalEnEtCacheHermanas === 0;
const corridaValida = !SIN_ETCACHE && (cont.hojasResueltas === cont.hojasEnlazadas || ausenciaAdjudicada);

/* ═══ CONTROLES ══════════════════════════════════════════════════════════ */
ctl(CASOS_ORDINAL.every(([s, e]) => llevaOrdinal(s) === e),
  "CONTROL EN NEGATIVO · el detector de ORDINAL distingue ordinal de tipo-de-columna y de gutters",
  CASOS_ORDINAL.map(([s, e]) => `${s}⇒${llevaOrdinal(s)}(esperado ${e})`).join(" · "));
ctl(CASOS_PAPEL.every(([s, m, e]) => papel(s, m) === e),
  "CONTROL EN NEGATIVO §regla 36 · sujeto/contexto/no-aparece se distinguen",
  `${CASOS_PAPEL.length} selectores conocidos`);
const hojasCompletas = cont.hojasResueltas > 0 && cont.hojasResueltas === cont.hojasEnlazadas;
ctl(SIN_ETCACHE || hojasCompletas || ausenciaAdjudicada,
  SIN_ETCACHE
    ? "§regla 32 · TRATAMIENTO activo: las `et-cache` se sueltan A PROPÓSITO en todos los documentos"
    : hojasCompletas
      ? "§regla 32 · las hojas se resolvieron TODAS"
      : "§regla 32 · FALTAN hojas — y la ausencia está ADJUDICADA POR MEDICIÓN, no por criterio (`hojas-etcache-127`)",
  `${cont.hojasResueltas}/${cont.hojasEnlazadas}${SIN_ETCACHE ? ` · et-cache soltadas ${cont.hojasEtCacheSoltadas}` : ""}` +
  (!SIN_ETCACHE && !hojasCompletas
    ? adj
      ? ` · las ausentes son TODAS et-cache; soltarlas donde SÍ están es NO-OP en ${4 - adj.tratamientoMueve}/4 documentos, el control (soltar TODAS) mueve en ${adj.controlMueve}/4, y las 85 et-cache hermanas traen ${adj.ritmoOrdinalEnEtCacheHermanas} reglas de ritmo con ordinal ⇒ VÁLIDA PARA ESTOS 4 EJES`
      : " · SIN ADJUDICAR: falta `hojas-etcache-127.json`"
    : ""));
ctl(true, "§regla 32 · reparto de assets POR DOCUMENTO (asimetría fabricaría varianza)",
  Object.entries(porDocAssets).map(([k, v]) => `${k} hojas ${v.hojas} img ${v.imagenes}`).join(" · "));
ctl(noBuilder.length === 0,
  "PRECONDICIÓN DE LECTURA · los 3 documentos son BUILDER (si no, el veredicto de varianza se invierte)",
  noBuilder.length ? noBuilder.map(([k, r]) => `${k}=${r.casillero}`).join(" · ") : "3/3 `B-`");
ctl(compartidos.length > 0 && singleton.length > 0,
  "el censo DISCRIMINA (ni cero compartidos ni pleno)",
  `${compartidos.length} compartidos · ${singleton.length} singleton de ${docsPorMarcador.size}`);
/* CONTROL POR CASO CONOCIDO del discriminador nuevo (§sondas 4, el corolario:
 * reconstruye UN caso a mano contra una medida buena anterior). En el lote,
 * `iconos-xs-2` mb tiene que salir ESTRUCTURAL —[31.6719] vs [0,31.6719], y el
 * 0 lo declara el `:last-child`— y `menu-anclas` mb tiene que salir CAMPO
 * —27.2 contra 31.6719, con `.et_pb_text_*` ordinal—. Si no los separara, el
 * discriminador no discrimina y su reparto no vale. */
const estructurales = pares.filter((p) => p.varianzaEstructural);
if (DOMINIO === "lote") {
  const ix = pares.find((p) => p.marcador === "iconos-xs-2" && p.ancho === 1440 && p.eje === "marginBottom");
  const ma = pares.find((p) => p.marcador === "menu-anclas" && p.ancho === 1440 && p.eje === "marginBottom");
  ctl(!!ix && !!ma && ix.varianzaEstructural && !ma.varianzaEstructural,
    "CONTROL POR CASO CONOCIDO · el discriminador ESTRUCTURAL separa `iconos-xs-2` (es la regla :last-child) de `menu-anclas` (es el editor)",
    `iconos-xs-2 estructural=${ix?.varianzaEstructural} (${JSON.stringify(ix?.porDoc)}) · menu-anclas estructural=${ma?.varianzaEstructural} ordinal=${ma?.segundaPata?.ordinal}`);
}
ctl(pares.length > 0 && new Set(pares.map((p) => p.veredicto)).size >= 3,
  "el clasificador DISCRIMINA (>=3 veredictos distintos, ni cero ni pleno)",
  `CAMPO ${cuenta("CAMPO")} · PLANTILLA ${cuenta("PLANTILLA")} · SIN ESCRIBIR ${cuenta("SIN ESCRIBIR")} · SIN PROBAR ${cuenta("SIN PROBAR")} de ${pares.length}`);
/* REFUTACIONES PRE-REGISTRADAS — sólo se evalúan si la CORRIDA VALE. Sobre una
 * corrida inválida no dicen nada del original, y su verde se leería como
 * probado. Se declaran NO EVALUABLES con su motivo. */
const varianzaEn46 = veredicto46.filter((x) => x.via?.startsWith("pata 1")).length;
const plantillaEn46 = veredicto46.filter((x) => x.veredicto === "PLANTILLA").length;
if (!corridaValida) {
  ctl(false,
    "PRE-REGISTRO · las CUATRO refutaciones quedan NO EVALUABLES — la corrida no vale",
    `hojas ${cont.hojasResueltas}/${cont.hojasEnlazadas}${SIN_ETCACHE ? " (tratamiento SIN_ETCACHE)" : ""}. Los números que siguen describen esta corrida, NO el original.`);
} else if (DOMINIO === "lote") {
  /* ⚠ EN EL LOTE ESTA REFUTACIÓN ES TAUTOLÓGICA, no verde ni roja: los 46 SE
   * DEFINEN como los pares sin varianza DE ESTE DOMINIO, así que volver a
   * medirlo aquí sólo puede dar 0. §*antes de fichar una indeterminación,
   * comprueba que las dos hipótesis sean DISTINTAS* — aquí no lo son, y hay 0
   * instancias separadoras POR CONSTRUCCIÓN. Lo que este dominio SÍ adjudica
   * es el instrumento: que los 6 CAMPO y el reparto reproduzcan. */
  ctl(true,
    "PRE-REGISTRO · mitad A · TAUTOLÓGICA en el lote (los 46 se definen aquí) — 0 separadoras por construcción, no adjudica",
    `${varianzaEn46} de 46, que es el único valor posible en este dominio`);
  ctl(plantillaEn46 < Math.ceil(0.9 * 46),
    "PRE-REGISTRO · mitad B por EXCESO: PLANTILLA en <90 % de los 46 (un pleno sería el reset genérico, §sondas 4)",
    `${plantillaEn46} de 46`);
} else {
  ctl(varianzaEn46 > 0,
    "PRE-REGISTRO · mitad A por DEFECTO: >0 de los 46 muestran varianza",
    `${varianzaEn46} de 46`);
  ctl(varianzaEn46 < 40,
    "PRE-REGISTRO · mitad A por EXCESO: <40 de los 46 (un pleno sería emparejamiento roto, §regla 29)",
    `${varianzaEn46} de 46`);
  ctl(plantillaEn46 < Math.ceil(0.9 * 46),
    "PRE-REGISTRO · mitad B por EXCESO: PLANTILLA en <90 % de los 46 (un pleno sería el reset genérico, §sondas 4)",
    `${plantillaEn46} de 46`);
}
/* El control de los 6 se publica SIEMPRE, con su cardinal de degenerados — y
 * sólo ADJUDICA cuando es rehacible, o sea en `DOMINIO=lote`. */
/* (a) LA MEDIDA — esto SÍ adjudica el instrumento y es cierto en los dos
 * estados: los valores de la 125.ª tienen que salir idénticos. */
ctl(degenerados6.length === los6.length || evaluables6.every((x) => x.mismaMedida),
  degenerados6.length === los6.length
    ? "CONTROL (a) LA MEDIDA · DEGENERADO POR CONSTRUCCIÓN en este dominio — 0 separadoras, NO adjudica"
    : "CONTROL (a) LA MEDIDA · los valores de los 6 pares de la 125.ª REPRODUCEN al conjunto",
  `rehacibles ${evaluables6.length} de ${los6.length} · misma medida ${evaluables6.filter((x) => x.mismaMedida).length} · degenerados ${degenerados6.length}`);
/* (b) EL VEREDICTO — se REPORTA con su motivo, no se exige. Un veredicto que
 * cambia por un discriminador NUEVO es un hallazgo (§regla 5ter), y exigir que
 * no cambie sería escribir el defecto viejo dentro de la guarda (§regla 21). */
const cambian6 = evaluables6.filter((x) => !x.reproduce);
ctl(true,
  `CONTROL (b) EL VEREDICTO · de los 6 CAMPO de la 125.ª, ${evaluables6.length - cambian6.length} siguen CAMPO y ${cambian6.length} se RECLASIFICAN`,
  cambian6.length
    ? cambian6.map((x) => `${x.llave} → ${x.veredicto} [${x.motivoDelCambio}]`).join(" · ")
    : "ninguno cambia");
const coherentes = pares.filter((p) => p.segundaPata).filter((p) => p.segundaPata.coherenteConComputado).length;
const conPata2 = pares.filter((p) => p.segundaPata).length;
ctl(conPata2 === 0 || coherentes / conPata2 >= 0.5,
  "§regla 1 · la cascada es COHERENTE con el computado en la mayoría de los pares que la tienen",
  `${coherentes}/${conPata2} coherentes`);

/* ═══ INFORME ════════════════════════════════════════════════════════════ */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== ALCANCE Y MODO ===");
say(`  dominio: ${DOMINIO}${SIN_ETCACHE ? "   ·   TRATAMIENTO: et-cache SOLTADAS a propósito" : ""}`);
say(`  documentos: ${DOCS.map((d) => d.etiqueta).join(" · ")}`);
say(`  anchos: ${ANCHOS.join(" · ")}   ·   ejes: ${EJES.join(" · ")}`);
say(`  criterio de recuento: nodos CON CAJA (w>0 y h>0) — el mismo de la 125.ª`);
say(`  hojas: ${cont.hojasResueltas}/${cont.hojasEnlazadas}${SIN_ETCACHE ? ` · et-cache soltadas ${cont.hojasEtCacheSoltadas}` : ""}`);
say(`  ⇒ CORRIDA ${corridaValida ? "VÁLIDA" : "**NO VÁLIDA** — los números describen esta corrida, NO el original"}`);
say();

say("=== CENSO CON SU DENOMINADOR (§punto 4: en cuántos de los 3 aparece) ===");
for (const [m, s] of [...docsPorMarcador].sort((a, b) => b[1].size - a[1].size)) {
  const inst = DOCS.map((d) => `${d.etiqueta.slice(0, 14)}=${instanciasPorMarcadorDoc.get(`${m}::${d.etiqueta}`) ?? 0}`).join(" ");
  say(`  ${s.size}/${DOCS.length}  ${m.padEnd(24)} instancias: ${inst}`);
}
say(`  compartidos ${compartidos.length} · singleton ${singleton.length} · total ${docsPorMarcador.size}`);
say();

say("=== REPARTO DE VEREDICTOS (unidad: par marcador × ancho × eje) ===");
say(`  pares evaluables: ${pares.length}`);
say(`    CAMPO         ${cuenta("CAMPO")}`);
say(`    PLANTILLA     ${cuenta("PLANTILLA")}`);
say(`    SIN ESCRIBIR  ${cuenta("SIN ESCRIBIR")}`);
say(`    SIN PROBAR    ${cuenta("SIN PROBAR")}`);
say();

say("=== LOS CAMPO, con la varianza o la cascada que los sostiene ===");
for (const p of CAMPO) {
  say(`  ★ ${p.marcador} @${p.ancho} ${p.eje}  (${p.docsConLaPieza}/${p.denominador} docs) — ${p.via}`);
  for (const [d, v] of Object.entries(p.porDoc)) say(`        ${d.padEnd(42)} ${JSON.stringify(v)}`);
  if (p.segundaPata) say(`        selector: ${p.segundaPata.selectorGanador.join(" | ")}  ·  ${p.segundaPata.valorDeclarado.join(",")}  ·  @media: ${p.segundaPata.enMedia.join(" | ") || "no"}`);
}
say();

say("=== VARIANZA ESTRUCTURAL — existe y NO la escribió nadie (el hallazgo de la 127.ª) ===");
say(`  ${estructurales.length} pares de ${pares.length}: los conjuntos difieren SÓLO en el valor que declara`);
say("  una pseudo-clase estructural, y NINGÚN selector ganador lleva ordinal ⇒ no es campo.");
for (const p of estructurales) {
  say(`  ◇ ${p.marcador} @${p.ancho} ${p.eje} → ${p.veredicto}`);
  say(`        ${JSON.stringify(p.porDoc)}   valor(es) estructural(es): ${p.valoresEstructurales.join(",")}`);
}
if (!estructurales.length) say("  (ninguno)");
say();

say("=== LOS PLANTILLA, cada uno CON SU SEGUNDA PATA (§punto 3) ===");
for (const p of PLANTILLA) {
  say(`  ▣ ${p.marcador} @${p.ancho} ${p.eje}  (${p.docsConLaPieza}/${p.denominador} docs)`);
  say(`        valores: ${JSON.stringify(p.porDoc)}`);
  say(`        selector GENÉRICO: ${p.segundaPata.selectorGanador.join(" | ")}`);
  say(`        unidad declarada: ${p.segundaPata.unidadDeclarada.join(",")}  ·  valor: ${p.segundaPata.valorDeclarado.join(",")}`);
  say(`        @media: ${p.segundaPata.enMedia.join(" | ") || "NO (fuera de todo punto de ruptura)"}  ·  origen: ${p.segundaPata.origen.join(",")}`);
}
if (!PLANTILLA.length) say("  (ninguno)");
say();

say("=== CRUCE CONTRA LOS 46 SIN PROBAR DEL LOTE ===");
say(`  resueltos aquí (CAMPO o PLANTILLA): ${resueltos46.length} de 46`);
say(`  siguen abiertos:                    ${abiertos46.length} de 46`);
const porVia = new Map();
for (const x of veredicto46) porVia.set(`${x.veredicto} · ${x.via ?? "-"}`, (porVia.get(`${x.veredicto} · ${x.via ?? "-"}`) ?? 0) + 1);
for (const [k, n] of [...porVia].sort((a, b) => b[1] - a[1])) say(`    ${String(n).padStart(3)}  ${k}`);
say();
for (const x of resueltos46) say(`    ✔ ${x.llave}  → ${x.veredicto}  (${x.via})`);
say();

say("=== CONTROL · ¿reproducen los 6 CAMPO de la 125.ª? ===");
for (const x of reproduce6) say(`  ${x.reproduce ? "OK " : "·· "} ${x.llave}  → ${x.veredicto}`);
say();

say("=== DOMINIO NUEVO — pares que el lote NO tenía ===");
say(`  ${nuevos.length} pares nuevos de ${pares.length} evaluables`);
const rn = new Map();
for (const p of nuevos) rn.set(p.veredicto, (rn.get(p.veredicto) ?? 0) + 1);
for (const [k, n] of rn) say(`    ${String(n).padStart(3)}  ${k}`);
say();

say("=== SIN PROBAR — con su cardinal, y NO se cablean (§punto 5) ===");
say(`  ${SINPROB.length} pares SIN PROBAR · ${SINESCR.length} SIN ESCRIBIR · ${singleton.length} marcadores singleton (no establecidos, denominador ${docsPorMarcador.size})`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 127, escalon: 1,
  modo: { dominio: DOMINIO, sinEtCache: SIN_ETCACHE, corridaValida },
  alcance: {
    docs: DOCS.map((d) => d.doc), anchos: ANCHOS, ejes: EJES,
    criterioDeRecuento: "nodos CON CAJA (w>0 y h>0) — el mismo de la 125.ª (§regla 31 hermana)",
    regimen: paso0.regimenes,
    nota: "propiedad del ORIGINAL. El clon no entra en ningún eje de esta medición.",
  },
  discrepanciaConElEncargo: {
    punto: "el punto 2 dice «varianza CERO ⇒ PLANTILLA»",
    porQueNoSeAplicaTalCual: "esa es la lectura del régimen PLANTILLADO; el PASO 0 midió que los 3 documentos son `B-` (BUILDER), donde varianza cero es el falso negativo declarado del test B (un campo que el editor puso uniforme)",
    loQueSeHizo: "varianza cero es NECESARIA pero NO SUFICIENTE: PLANTILLA la dicta la pata 2 (la cascada), y sale con su selector, su unidad declarada y su estado de @media",
  },
  controles,
  censo: {
    total: docsPorMarcador.size, compartidos: compartidos.length, singleton: singleton.length,
    detalle: [...docsPorMarcador].map(([m, s]) => ({
      marcador: m, docs: [...s], denominador: DOCS.length,
      instancias: Object.fromEntries(DOCS.map((d) => [d.etiqueta, instanciasPorMarcadorDoc.get(`${m}::${d.etiqueta}`) ?? 0])),
    })),
  },
  reparto: { pares: pares.length, CAMPO: cuenta("CAMPO"), PLANTILLA: cuenta("PLANTILLA"), SIN_ESCRIBIR: cuenta("SIN ESCRIBIR"), SIN_PROBAR: cuenta("SIN PROBAR"), varianzaEstructural: estructurales.length },
  pares,
  cruceContraLos46: { resueltos: resueltos46.length, abiertos: abiertos46.length, detalle: veredicto46 },
  controlLos6DeLa125: { detalle: reproduce6, rehacibles: evaluables6.length, degenerados: degenerados6.length, adjudica: DOMINIO === "lote" },
  dominioNuevo: { pares: nuevos.length, reparto: Object.fromEntries(rn) },
  assets: { hojas: `${cont.hojasResueltas}/${cont.hojasEnlazadas}`, etCacheSoltadas: cont.hojasEtCacheSoltadas, porDoc: porDocAssets },
  noContesta: [
    "NO mide el clon: la varianza es propiedad del ORIGINAL",
    "NO alcanza a los marcadores singleton — NO ESTABLECIDOS con su denominador",
    "NO mide caja ni tipografía: sólo los 4 ejes de ritmo",
  ],
};

/* ═══ EL NOMBRE LO DESVÍA LA SONDA, no quien la lanza (§regla 24 higiene) ══
 * Si el modo no es el canónico —otro dominio, tratamiento activo, o corrida
 * inválida— el nombre canónico NO se toca. Lo peor de §regla 7 es un fichero
 * con nombre de medida y contenido de control. */
let sufijo = "";
if (SIN_ETCACHE) sufijo = "-neg-sin-etcache";
else if (DOMINIO === "lote") sufijo = "-control-lote";
else if (!corridaValida) sufijo = "-neg-sin-et-cache-de-los-2-vecinos";
if (sufijo) console.log(`⚠ MODO NO CANÓNICO (dominio=${DOMINIO}${SIN_ETCACHE ? " · SIN_ETCACHE" : ""}${corridaValida ? "" : " · CORRIDA INVÁLIDA"}) — la salida se DESVÍA a «escalon1-varianza-127${sufijo}»`);
const base = join(DERIV, process.env.SALIDA || `escalon1-varianza-127${sufijo}`);
for (const [ruta, texto] of [[`${base}.json`, JSON.stringify(salida, null, 1)], [`${base}.log`, L.join("\n") + "\n"]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto && !process.env.PISAR) {
    console.error(`❌ ${ruta} existe y DIFIERE — no se pisa (§regla 5). PISAR=1 para forzar.`);
    process.exit(1);
  }
  writeFileSync(ruta, texto);
}
const fallos = controles.filter((c) => !c.ok);
console.log(`\n✓ evaluados ${DOCS.length}/${DOCS.length} documentos · ${ANCHOS.length}/${ANCHOS.length} anchos · ${pares.length} pares · controles ${controles.length - fallos.length}/${controles.length}`);
console.log(`→ ${base}.json  ·  ${base}.log`);
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
