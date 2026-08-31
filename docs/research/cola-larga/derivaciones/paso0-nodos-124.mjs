// 124.ª · PASO 0 (2.ª mitad) — EL TEST A POR NODO, CONTRA LA CASCADA.
//
// La 123.ª agrega con `.some()` a nivel de CELDA (documento × tipo × eje), asi
// que basta UN nodo que se mueva para que la celda entera salga «seMueve». El
// PASO 0 ya derivo que **20 de las 27 celdas «al reves» contienen un DEFAULT
// publicado entre sus valores**, o sea que mezclan lo que escribio el
// constructor con lo que escribio el editor. Esta derivacion baja a la unidad
// donde el test A se pronuncia de verdad: EL NODO.
//
// ⚠⚠ Y EL ADJUDICADOR NO ES OTRO TEST A MEJOR: ES LA CASCADA, que es la que
// CLAUDE.md nombra autoridad — *«cuando el test A y la CASCADA discrepen, gana
// la cascada. El test A INFIERE quien escribio a partir de como se comporta el
// numero; la cascada LO DICE»*. Un selector con ordinal (`et_pb_<tipo>_<n>`) es
// el editor; uno generico, la plantilla. La 123.ª la dejo en su `noContesta`.
//
// De paso cierra la RESERVA que la 123.ª anoto en sus 4 veredictos «campo con
// reserva»: la cascada devuelve la UNIDAD DECLARADA, y un `em` no se mueve con
// el ancho lo escriba quien lo escriba (§el falso positivo del test A).
//
// CONTROL PRINCIPAL (§sondas 4, *cruzar con una medida buena anterior*):
// re-agregando MIS nodos con el `.some()` de la 123.ª tiene que salir su 2x2
// EXACTO —27 · 4 · 0 · 0 · 17—. Si no sale, la diferencia es de INSTRUMENTO y
// no del nivel, y la derivacion es NULA.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch, openPage, settle } from "../../../../scripts/qa/lib.mjs";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const CSS = join(RAIZ, "corpus/css");
const MEDIA_RAICES = [join(RAIZ, "apps/web/public/images/uploads"), join(RAIZ, "media-corpus")];
const REF_123 = "docs/research/cola-larga/derivaciones/tests-ab-123.json";

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];
const EJES = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
const PROPS_CSS = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
const INICIAL = 0;

/* ── PRECONDICIONES, ANTES DE GASTAR LA NAVEGACION (§regla 37) ─────────────── */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(`corpus/productos/${d.doc}`);
if (!existsSync(REF_123)) faltan.push(REF_123);
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.length} insumos y se comprueban ANTES del launch:\n   ${faltan.join("\n   ")}`);
  console.error(`   Si el nombre existio y hoy no, mira si lo renombro una §regla 5bis.`);
  process.exit(1);
}
const REF = JSON.parse(readFileSync(REF_123, "utf8"));

/* ── LOCALIZACION DE ASSETS — copiada de la 123.ª SIN TOCAR, para que la
 * diferencia entre las dos corridas no pueda venir del montaje ───────────── */
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

/* ── EXTRACCION — igual que la 123.ª, pero CONSERVANDO EL NODO ────────────── */
const extraer = (ejes) => {
  const px = (v) => Math.round((parseFloat(v) || 0) * 10000) / 10000;
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  const out = [];
  for (const [tipo, sel] of [["seccion", ".et_pb_section"], ["fila", ".et_pb_row"], ["modulo", ".et_pb_module"]]) {
    const nodos = [...document.querySelectorAll(sel)].filter((n) => !enCascaron(n));
    const conC = nodos.filter(conCaja);
    for (const [i, n] of conC.entries()) {
      const cs = getComputedStyle(n);
      const v = {};
      for (const e of ejes) v[e] = px(cs[e]);
      /* LLAVE DE LA 123.ª — se conserva TAL CUAL para poder reproducir su 2x2 */
      const ord123 = (n.className.match(/et_pb_[a-z_]+_(\d+)\b/) ?? [])[0] ?? null;
      /* LLAVE MEJORADA — el `\b` de arriba NO casa antes de un `_`, asi que
       * `et_pb_button_0_wrapper` (lo que Divi compila cuando el editor mueve un
       * boton) se queda SIN LLAVE. La forma buena esta derivada y depurada en
       * `f33-clases.mjs`: se tokeniza en clases y se pregunta por cada una. */
      let ordMej = null;
      for (const m of String(n.className).matchAll(/([A-Za-z_][\w-]*)/g)) {
        if (/^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(m[1]) && !/_tb_/.test(m[1])) { ordMej = m[1]; break; }
      }
      const clave = ord123 ? `${tipo}|${ord123}` : null;
      if (clave) n.setAttribute("data-k124", clave);
      out.push({ tipo, i, sel: ord123, ordMej, v, ancho: Math.round(n.getBoundingClientRect().width * 10000) / 10000 });
    }
    out.push({ tipo, i: -1, censo: { enElDOM: nodos.length, conCaja: conC.length } });
  }
  return out;
};

/* ── LA CASCADA, POR CDP ───────────────────────────────────────────────────
 * Tecnica copiada de `scripts/qa/f33-clases.mjs` §4, con sus dos correcciones
 * ya pagadas: el ganador se CALCULA (`!important` gana a todo lo normal, y
 * entre iguales gana el ultimo) y `esOrdinal` decide POR TOKEN, no con un
 * regex sobre el selector entero. */
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;
const esOrdinal = (sel) => {
  if (/_tb_/.test(sel)) return false;
  for (const m of sel.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (ORDINAL.test(m[1])) return true;
  return false;
};

async function cascada(client) {
  const { root } = await client.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await client.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-k124]" });
  const fuera = new Map();
  for (const nodeId of nodeIds) {
    let clave = null;
    try {
      const { attributes } = await client.send("DOM.getAttributes", { nodeId });
      const i = attributes.indexOf("data-k124");
      if (i < 0) continue;
      clave = attributes[i + 1];
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
          gana[p.name] = { peso, orden, sel, valor: p.value, editor: inline || esOrdinal(sel), imp: !!p.important, inline };
      }
    };
    (m.matchedCSSRules ?? []).forEach((r, i2) => anota(r.rule?.selectorList?.text ?? "", r.rule?.style, i2, false));
    if (m.inlineStyle) anota("(style=)", m.inlineStyle, 1e6, true);
    fuera.set(clave, gana);
  }
  return fuera;
}

/* ── RECORRIDO ────────────────────────────────────────────────────────────── */
const { browser } = await launch();
const medidas = {};
const cascadas = {};
try {
  for (const d of DOCS) {
    const f = join(CORPUS, d.doc);
    const porAncho = {};
    for (const ancho of [1440, 390]) {
      const { page } = await openPage(browser, pathToFileURL(f).href, { width: ancho, height: ancho <= 480 ? 844 : 900, mobile: ancho <= 480 });
      /* La sesion CDP se abre ANTES del setContent para que `CSS.enable` vea
       * llegar las hojas locales. Solo hace falta a 1440: la cascada se lee ahi. */
      const client = ancho === 1440 ? await page.createCDPSession() : null;
      if (client) { await client.send("DOM.enable"); await client.send("CSS.enable"); }
      await page.setRequestInterception(true);
      page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
      await page.setContent(conAssetsLocales(readFileSync(f, "utf8")), { waitUntil: "domcontentloaded" });
      await settle(page);
      porAncho[ancho === 1440 ? "a1440" : "a390"] = await page.evaluate(extraer, EJES);
      if (client) cascadas[d.doc] = await cascada(client);
      await page.close();
    }
    medidas[d.doc] = porAncho;
  }
} finally {
  await browser.close();
}

/* ── CRUCE POR NODO ───────────────────────────────────────────────────────── */
const nodos = [];
const celdas = [];
for (const d of DOCS) {
  const m = medidas[d.doc];
  const casc = cascadas[d.doc] ?? new Map();
  for (const tipo of ["seccion", "fila", "modulo"]) {
    const idx = (arr) => {
      const m2 = new Map(); let sinLlave = 0, rescatables = 0;
      for (const x of arr.filter((y) => y.tipo === tipo && y.i >= 0)) {
        if (!x.sel) { sinLlave++; if (x.ordMej) rescatables++; continue; }
        if (!m2.has(x.sel)) m2.set(x.sel, x);
      }
      return { m: m2, sinLlave, rescatables };
    };
    const IA = idx(m.a1440), IB = idx(m.a390);
    const comunes = [...IA.m.keys()].filter((k) => IB.m.has(k));
    for (const eje of EJES) {
      const cssProp = eje.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      const deLaCelda = [];
      for (const k of comunes) {
        const v1 = IA.m.get(k).v[eje], v2 = IB.m.get(k).v[eje];
        const g = casc.get(`${tipo}|${k}`)?.[cssProp] ?? null;
        /* PREMISA CALLADA, ahora POR NODO: sin nada declarado y con el valor
         * inicial, el test A no tiene nada sobre lo que pronunciarse. */
        const declarado = g ? g.valor : null;
        const hayAlgoEscrito = v1 !== INICIAL || v2 !== INICIAL || (declarado !== null && parseFloat(declarado) !== 0);
        const seMueve = v1 !== v2;
        /* TEST A por nodo */
        const testA = seMueve ? "PLANTILLA" : "CAMPO";
        /* CASCADA — el adjudicador */
        const cascVer = g ? (g.editor ? "CAMPO" : "PLANTILLA") : null;
        /**
         * LA UNIDAD DECLARADA, y decide si el test A puede siquiera hablar.
         *
         * ⚠⚠ `auto` NO ES UN VALOR ESCRITO A EFECTOS DEL TEST A, y la primera
         * corrida lo contaba como tal (`paso0-nodos-124-SONDA-CONTABA-AUTO-COMO-
         * ESCRITO.*`). Un `margin-top: auto` de bloque COMPUTA 0, asi que sale
         * igual a los dos anchos — y no porque nadie lo tocara ni porque sea un
         * px absoluto: porque `auto` se resuelve a 0 en el eje vertical. El test
         * A lo leia como «px absolutos ⇒ CAMPO» sobre una regla del TEMA.
         *
         * Es la MISMA forma que el `em` que CLAUDE.md ya documenta —un valor que
         * no se mueve con el ancho lo escriba quien lo escriba— con la unidad
         * cambiada. Asi que va al mismo cubo: CIEGO, no fallo.
         */
        const unidad =
          declarado === null ? null
          : /^(auto|inherit|initial|unset|revert|normal)$/i.test(declarado.trim()) ? "no-numerica"
          : /(^|[\s(])-?[\d.]+(em|rem|ch|ex)\b/.test(declarado) ? "relativa-al-font"
          : /%/.test(declarado) ? "%"
          : /px/.test(declarado) ? "px"
          : "otra";
        const n = { arquetipo: d.arquetipo, tipo, eje, clave: k, v1440: v1, v390: v2, hayAlgoEscrito, seMueve, testA, declarado, selectorGanador: g?.sel ?? null, cascVer, unidad, importante: g?.imp ?? null };
        nodos.push(n);
        deLaCelda.push(n);
      }
      /* re-agregacion con el `.some()` DE LA 123.ª — el control */
      const v1440 = comunes.map((k) => IA.m.get(k).v[eje]);
      const v390 = comunes.map((k) => IB.m.get(k).v[eje]);
      const distintos = [...new Set(v1440)];
      const hayEscritoCelda = distintos.some((x) => x !== INICIAL);
      celdas.push({
        arquetipo: d.arquetipo, tipo, eje, n: comunes.length,
        hayAlgoEscrito: hayEscritoCelda,
        seMueve: v1440.some((x, k) => x !== v390[k]),
        varia: distintos.length > 1,
        nodosMalClasificados: deLaCelda.filter((x) => x.hayAlgoEscrito && x.cascVer && x.testA !== x.cascVer).length,
        nodosAdjudicados: deLaCelda.filter((x) => x.hayAlgoEscrito && x.cascVer).length,
        sinLlave1440: IA.sinLlave, rescatablesConLlaveMejorada: IA.rescatables,
      });
    }
  }
}

/* ── LOS NUMEROS ──────────────────────────────────────────────────────────── */
const escritos = nodos.filter((n) => n.hayAlgoEscrito);
/* CIEGO = el test A no tiene nada sobre lo que pronunciarse, por la UNIDAD.
 * Son dos familias y las dos estan en CLAUDE.md o se derivan de el:
 *   · `em`/`rem`/`ch` — no se mueven con el ancho lo escriba quien lo escriba;
 *   · `auto`/`inherit`/… — computan al inicial y no informan de quien escribio. */
const CIEGAS = ["relativa-al-font", "no-numerica"];
const adjudicables = escritos.filter((n) => n.cascVer && !CIEGAS.includes(n.unidad));
const ciegos = escritos.filter((n) => n.cascVer && CIEGAS.includes(n.unidad));
const sinCascada = escritos.filter((n) => !n.cascVer);
const acierta = adjudicables.filter((n) => n.testA === n.cascVer);
const falla = adjudicables.filter((n) => n.testA !== n.cascVer);

/**
 * ── LA TAXONOMIA DE LOS FALLOS ─────────────────────────────────────────────
 * «109 fallan» es un TOTAL, y un total es el nivel de arriba (§la causa comun).
 * Los fallos del test A no son un monton homogeneo: son modos con MECANISMO, y
 * dos de ellos CLAUDE.md ya los describe —pero atribuidos a la caja y a la
 * tipografia, NO al ritmo—. Se clasifican y se publica el cardinal de cada uno.
 */
const claseDelFallo = (n) => {
  if (n.cascVer === "CAMPO" && n.testA === "PLANTILLA" && n.unidad === "%") return "FN-% · el EDITOR escribio un PORCENTAJE (se mueve con el ancho y parece plantilla)";
  if (n.cascVer === "CAMPO" && n.testA === "PLANTILLA" && n.unidad === "px") return "FN-bp · el EDITOR escribio un px POR PUNTO DE RUPTURA (@media lo cambia, asi que se mueve)";
  if (n.cascVer === "CAMPO" && n.testA === "PLANTILLA") return "FN-otro";
  if (n.cascVer === "PLANTILLA" && n.testA === "CAMPO" && n.unidad === "px") return "FP-px · la PLANTILLA escribio un px ABSOLUTO (no se mueve y parece del editor)";
  return "FP-otro";
};
const porClase = {};
for (const n of falla) (porClase[claseDelFallo(n)] ??= []).push(n);

const cruce123 = { "varia+seMueve": 0, "varia+noSeMueve": 0, "noVaria+seMueve": 0, "noVaria+noSeMueve": 0, sinEscribir: 0 };
for (const c of celdas) {
  if (!c.hayAlgoEscrito) { cruce123.sinEscribir++; continue; }
  cruce123[(c.varia ? "varia" : "noVaria") + "+" + (c.seMueve ? "seMueve" : "noSeMueve")]++;
}

/* ── CONTROLES ────────────────────────────────────────────────────────────── */
const controles = [];
controles.push({ nombre: "las HOJAS ENLAZADAS se resolvieron (sin ellas la medida es PLAUSIBLE y falsa)", ok: RESUELTAS > 0, visto: `enlazadas ${ENLAZADAS} · resueltas ${RESUELTAS} · sin resolver ${ENLAZADAS - RESUELTAS}` });
controles.push({ nombre: "se midio algo (nodos emparejados > 0)", ok: nodos.length > 0, visto: `${nodos.length} pares (nodo,eje) emparejados` });
/* ⚠ EL CONTROL QUE DECIDE: re-agregando MIS nodos con el `.some()` de la 123.ª
 * tiene que salir SU 2x2 exacto. Si no, la diferencia es de INSTRUMENTO. */
const ref = REF.cruce2x2;
const igual = Object.keys(ref).every((k) => ref[k] === cruce123[k]);
controles.push({
  nombre: "REPRODUCE el 2x2 de la 123.ª al re-agregar por celda (§sondas 4: cruce con medida buena anterior)",
  ok: igual,
  visto: `123.ª ${JSON.stringify(ref)}\n      124.ª ${JSON.stringify(cruce123)}${igual ? "" : "  ⇒ DIFIEREN: la diferencia seria de INSTRUMENTO, no de nivel"}`,
});
controles.push({ nombre: "la CASCADA alcanza (adjudica a la mayoria de los escritos)", ok: adjudicables.length > escritos.length / 2, visto: `escritos ${escritos.length} · adjudicables ${adjudicables.length} · ciegos por unidad relativa ${ciegos.length} · sin declaracion ganadora ${sinCascada.length}` });
controles.push({ nombre: "la CASCADA DISCRIMINA (no publica un veredicto unico, §regla 22)", ok: new Set(adjudicables.map((n) => n.cascVer)).size > 1, visto: `veredictos de la cascada: ${[...new Set(adjudicables.map((n) => n.cascVer))].join(" · ")} — PLANTILLA ${adjudicables.filter((n) => n.cascVer === "PLANTILLA").length} · CAMPO ${adjudicables.filter((n) => n.cascVer === "CAMPO").length}` });

const nulo = controles.some((c) => !c.ok);

/* ── LAS TRES PREDICCIONES PRE-REGISTRADAS ────────────────────────────────── */
const celdasAlReves = celdas.filter((c) => c.hayAlgoEscrito && c.varia && c.seMueve);
const separadoras = celdasAlReves.filter((c) => c.nodosAdjudicados > 0 && c.nodosMalClasificados === 0);
const P = {
  "P1 · en las celdas que mezclan, los que SE MUEVEN llevan valor de PLANTILLA y los que NO, de EDITOR": (() => {
    const enMezcla = adjudicables.filter((n) => celdasAlReves.some((c) => c.arquetipo === n.arquetipo && c.tipo === n.tipo && c.eje === n.eje));
    const ok = enMezcla.filter((n) => n.testA === n.cascVer).length;
    return { total: enMezcla.length, concuerdan: ok, pct: enMezcla.length ? +((ok / enMezcla.length) * 100).toFixed(1) : null, cumple: enMezcla.length > 0 && ok / enMezcla.length > 0.5 };
  })(),
  "P2 · por NODO el test A acierta muy por encima del 12.9 % que da la lectura por celda": { total: adjudicables.length, acierta: acierta.length, pct: adjudicables.length ? +((acierta.length / adjudicables.length) * 100).toFixed(1) : null, cumple: adjudicables.length > 0 && acierta.length / adjudicables.length > 0.5 },
  "P3 · existe al menos UNA celda separadora: «al reves» por celda y 0 nodos mal clasificados": { celdasAlReves: celdasAlReves.length, separadoras: separadoras.length, cumple: separadoras.length > 0, cuales: separadoras.slice(0, 12).map((c) => `${c.arquetipo} ${c.tipo} ${c.eje} (n=${c.nodosAdjudicados})`) },
};

const salida = {
  meta: {
    tanda: "124.ª · PASO 0 (2.ª mitad)", fecha: new Date().toISOString().slice(0, 10),
    lado: "UNO — el ORIGINAL capturado con sus hojas. No compara con el clon",
    unidad: "EL NODO (par nodo×eje), no la celda. Es la correccion de nivel que motiva la derivacion",
    adjudicador: "LA CASCADA (CSS.getMatchedStylesForNode): selector con ordinal = editor = CAMPO; generico = plantilla = PLANTILLA",
    contesta: ["si el «87 % al reves» de la 123.ª es un artefacto de la UNIDAD", "la RESERVA del `em` que la 123.ª dejo abierta en sus 4 veredictos"],
    noContesta: [
      "la varianza INTER-instancia: los 4 documentos son 4 arquetipos, no 4 instancias de uno",
      "los nodos SIN LLAVE, que no se emparejan entre anchos y salen contados aparte",
      "el test B por nodo: el test B es un test de GRUPO y no tiene lectura por nodo",
    ],
  },
  controles,
  reproduccionDelCruce123: { referencia: ref, obtenido: cruce123, identico: igual },
  porNodo: {
    paresTotales: nodos.length,
    escritos: escritos.length,
    sinEscribir: nodos.length - escritos.length,
    adjudicables: adjudicables.length,
    ciegosPorUnidadRelativa: ciegos.length,
    sinDeclaracionGanadora: sinCascada.length,
    acierta: acierta.length,
    falla: falla.length,
    pctAcierto: adjudicables.length ? +((acierta.length / adjudicables.length) * 100).toFixed(1) : null,
  },
  predicciones: P,
  /* ⚠ SIN `slice`: un tope se lee como una ausencia del original (§sondas 4,
   * 4.ª cara). Van los 4 conjuntos ENTEROS, con su cardinal por clase. */
  taxonomiaDeFallos: Object.fromEntries(Object.entries(porClase).map(([k, v]) => [k, {
    n: v.length,
    yaEnClaudeMd: /FN-%/.test(k) ? "SI, pero atribuido a la CAJA y la TIPOGRAFIA — no al ritmo" : /FP-px/.test(k) ? "PARCIAL: CLAUDE.md documenta el falso positivo con `em`; aqui la unidad es `px`" : "NO",
    nodos: v.map((n) => ({ nodo: `${n.arquetipo} ${n.tipo} ${n.clave} ${n.eje}`, v1440: n.v1440, v390: n.v390, testA: n.testA, cascada: n.cascVer, declarado: n.declarado, selector: n.selectorGanador })),
  }])),
  ciegos: { n: ciegos.length, porUnidad: ciegos.reduce((a, n) => ((a[n.unidad] = (a[n.unidad] ?? 0) + 1), a), {}), nodos: ciegos.map((n) => ({ nodo: `${n.arquetipo} ${n.tipo} ${n.clave} ${n.eje}`, declarado: n.declarado, selector: n.selectorGanador, unidad: n.unidad, testA: n.testA, cascada: n.cascVer })) },
  llaves: { sinLlaveTotal: celdas.reduce((a, c) => a + (c.eje === "marginTop" ? c.sinLlave1440 : 0), 0), rescatablesConLlaveMejorada: celdas.reduce((a, c) => a + (c.eje === "marginTop" ? c.rescatablesConLlaveMejorada : 0), 0) },
  celdas,
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/paso0-nodos-124.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== EL TEST A POR NODO, CONTRA LA CASCADA ===");
console.log(`  pares (nodo,eje)          ${nodos.length}`);
console.log(`  con algo escrito          ${escritos.length}`);
console.log(`  ADJUDICABLES              ${adjudicables.length}   (cascada con ganador y unidad NO relativa)`);
console.log(`    acierta el test A       ${acierta.length}   (${salida.porNodo.pctAcierto} %)`);
console.log(`    falla el test A         ${falla.length}`);
console.log(`  ciegos (unidad em/rem)    ${ciegos.length}   ⇒ el test A no tiene nada sobre lo que pronunciarse`);
console.log(`  sin declaracion ganadora  ${sinCascada.length}`);
console.log("");
console.log("=== LAS TRES PREDICCIONES PRE-REGISTRADAS ===");
for (const [k, v] of Object.entries(P)) console.log(`  ${v.cumple ? "CUMPLE  " : "REFUTADA"} ${k}\n           ${JSON.stringify(Object.fromEntries(Object.entries(v).filter(([x]) => x !== "cuales")))}`);
console.log("");
console.log("=== CELDAS «AL REVES» POR CELDA, MIRADAS POR NODO ===");
for (const c of celdasAlReves) console.log(`  ${c.arquetipo.padEnd(15)} ${c.tipo.padEnd(8)} ${c.eje.padEnd(15)} adjudicados=${String(c.nodosAdjudicados).padStart(3)} malClasificados=${c.nodosMalClasificados}${c.nodosAdjudicados > 0 && c.nodosMalClasificados === 0 ? "   ⇐ SEPARADORA" : ""}`);
console.log("");
if (falla.length) {
  console.log("=== TAXONOMIA DE LOS 「fallos」 DEL TEST A (el total es el nivel de arriba) ===");
  for (const [k, v] of Object.entries(salida.taxonomiaDeFallos).sort((a, b) => b[1].n - a[1].n)) {
    console.log(`  ${String(v.n).padStart(3)}  ${k}`);
    console.log(`       ¿ya en CLAUDE.md? ${v.yaEnClaudeMd}`);
    for (const n of v.nodos.slice(0, 4)) console.log(`         p.ej. ${n.nodo.padEnd(44)} ${String(n.v1440).padStart(9)}→${String(n.v390).padStart(9)}  decl=${n.declarado}  [${n.selector}]`);
    if (v.nodos.length > 4) console.log(`         … y ${v.nodos.length - 4} mas, LOS ${v.nodos.length} en el JSON (sin recortar)`);
  }
  console.log("");
}
console.log("=== CIEGOS — el test A no tiene NADA sobre lo que pronunciarse ===");
console.log(`  ${ciegos.length} en total · por unidad: ${JSON.stringify(salida.ciegos.porUnidad)}`);
console.log("");
console.log(`LLAVES: sin llave (123.ª) ${salida.llaves.sinLlaveTotal} · rescatables con la llave depurada de f33-clases ${salida.llaves.rescatablesConLlaveMejorada}`);
console.log("");
console.log(`VEREDICTO: ${salida.veredicto}`);
process.exit(nulo ? 1 : 0);
