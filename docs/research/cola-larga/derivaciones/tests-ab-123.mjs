// 123.ª · ESCALON 2 — LOS DOS TESTS, sobre el ORIGINAL y a los DOS ANCHOS.
//
// RÉGIMEN PRIMERO (ya derivado en candidatos-f35-123.json): los 4 documentos son
// `B-` —builder puro—, asi que los tests A y B valen TAL COMO ESTAN ESCRITOS y
// son INTRA-INSTANCIA. En regimen plantillado la lectura del px absoluto se
// INVIERTE, y aplicarlos sin mirar el <body> es como se convierte una plantilla
// en ocho campos inventados.
//
// TEST A (Divi, los dos anchos) — SOLO para el RITMO (margin/padding de seccion,
//   fila y modulo). Lo que el editor NO toca es responsive (% del padre); lo que
//   toca queda en px absolutos, IGUALES a 1440 y a 390.
//
// ⚠⚠ SU PREMISA CALLADA, que es donde mas barato se rompe: EL TEST A SUPONE QUE
// HAY ALGO ESCRITO. Un eje cuyo UNICO valor observado es el INICIAL de la
// propiedad —0 para margin/padding— sale igual a los dos anchos y NO porque
// alguien escribiera «0px»: porque nadie toco nada. Eso NO es campo: es SIN
// ESCRIBIR, que pesa lo mismo que SIN PROBAR y no se cablea.
//   Medido en otro arquetipo: 24 de 49 celdas computan 0, y leerlas por el
//   enunciado literal habria dado 24 campos inventados de una sola vez.
//
// ⚠ Y SU FALSO POSITIVO: un valor en `em` no se mueve con el ancho lo escriba
// quien lo escriba, asi que el test A lo lee como «px absolutos» y dicta CAMPO
// sobre algo que escribio la hoja del tema. Aqui NO se mira la unidad declarada
// —haria falta la cascada— asi que TODO veredicto «campo» del test A sale con
// esa reserva anotada, no como conclusion.
//
// TEST B (general, la varianza intra-pagina) — sin restriccion de alcance:
//   ¿varia de un modulo a otro DENTRO de la misma pagina? Si dos hermanos del
//   mismo hueco traen valores distintos, lo escribio una persona: es CAMPO.
//
// Y LA CONCLUSION OPERATIVA, que es lo unico que hay que recordar: una propiedad
// que no pasa NINGUNO de los dos NO esta probada como plantilla — esta SIN
// PROBAR, y SIN PROBAR no se cablea.

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

const attr = (t, n) => t.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;
function conAssetsLocales(html) {
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = attr(tag, "href");
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    if (/^https?:/i.test(rel) || !existsSync(join(CSS, rel))) return tag;
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

/* Se miden los EJES DE RITMO, que es el alcance declarado del test A. La caja y
 * la tipografia quedan FUERA: ahi el test A da la respuesta AL REVES (el ancho
 * de modulo se escribe en % igual que su default, asi que se mueve con el ancho
 * y parece plantilla, y sin embargo es campo — 70·80·90·100 en la misma pagina). */
const EJES = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
/* El valor INICIAL de estas cuatro propiedades es 0. Es la premisa callada del
 * test A y hay que comprobarla explicitamente. */
const INICIAL = 0;

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
      /* la clase con ORDINAL es la huella del editor; la generica, la del tema */
      const ord = (n.className.match(/et_pb_[a-z_]+_(\d+)\b/) ?? [])[0] ?? null;
      out.push({ tipo, i, sel: ord, v });
    }
    out.push({ tipo, i: -1, censo: { enElDOM: nodos.length, conCaja: conC.length } });
  }
  return out;
};

const { browser } = await launch();
async function medir(doc, ancho) {
  const f = join(CORPUS, doc);
  const { page } = await openPage(browser, pathToFileURL(f).href, { width: ancho, height: ancho <= 480 ? 844 : 900, mobile: ancho <= 480 });
  await page.setRequestInterception(true);
  page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
  await page.setContent(conAssetsLocales(readFileSync(f, "utf8")), { waitUntil: "domcontentloaded" });
  await settle(page);
  const o = await page.evaluate(extraer, EJES);
  await page.close();
  return o;
}

const medidas = {};
for (const d of DOCS) {
  medidas[d.doc] = { a1440: await medir(d.doc, 1440), a390: await medir(d.doc, 390) };
}
await browser.close();

/* ── LOS DOS TESTS, por (documento × tipo × eje) ───────────────────────────── */
const filas = [];
for (const d of DOCS) {
  const m = medidas[d.doc];
  const censo = Object.fromEntries(m.a1440.filter((x) => x.i === -1).map((x) => [x.tipo, x.censo]));
  for (const tipo of ["seccion", "fila", "modulo"]) {
    /* ⚠⚠ EL EMPAREJAMIENTO ENTRE ANCHOS NO PUEDE SER POR ORDEN. El constructor
     * resuelve «esto solo en movil» DUPLICANDO el modulo y escondiendo uno por
     * ancho, asi que el n.º de nodos CON CAJA difiere entre anchos —medido:
     * 119/117, 68/66, 102/100— y emparejar por indice compara NODOS DISTINTOS.
     * Lo detecto el control, que por eso existe.
     *
     * La llave es el ORDINAL de la clase (`et_pb_text_4`), que es la identidad
     * que el constructor asigna. §regla 33: una llave que puede valer `null` NO
     * es opcional — los nodos sin ordinal se cuentan APARTE y no se emparejan,
     * porque un `null` en una llave es «no lo se» disfrazado de valor. */
    const idx = (arr) => {
      const m2 = new Map(); const sinLlave = [];
      for (const x of arr.filter((y) => y.tipo === tipo && y.i >= 0)) {
        if (!x.sel) { sinLlave.push(x); continue; }
        if (!m2.has(x.sel)) m2.set(x.sel, x); /* un ordinal repetido no se pisa: se ignora el 2.º */
      }
      return { m: m2, sinLlave };
    };
    const IA = idx(m.a1440), IB = idx(m.a390);
    const comunes = [...IA.m.keys()].filter((k) => IB.m.has(k));
    const n = comunes.length;
    for (const eje of EJES) {
      const v1440 = comunes.map((k) => IA.m.get(k).v[eje]);
      const v390 = comunes.map((k) => IB.m.get(k).v[eje]);
      const distintos1440 = [...new Set(v1440)];
      /* PREMISA del test A: ¿hay algo ESCRITO? Si el unico valor observado es el
       * inicial de la propiedad, el test A no tiene nada sobre lo que
       * pronunciarse — no es «px absolutos», es que nadie toco nada. */
      const hayAlgoEscrito = distintos1440.some((x) => x !== INICIAL);
      /* TEST A: ¿se mueve con el ancho? */
      const seMueve = v1440.some((x, k) => x !== v390[k]);
      /* TEST B: ¿varia entre hermanos de la misma pagina? */
      const varia = distintos1440.length > 1;

      let veredicto, porQue;
      if (!hayAlgoEscrito) {
        veredicto = "SIN ESCRIBIR";
        porQue = `unico valor observado = ${INICIAL}, el INICIAL de la propiedad: la premisa del test A no se cumple`;
      } else if (varia) {
        veredicto = "CAMPO";
        porQue = `test B: ${distintos1440.length} valores distintos entre hermanos de la misma pagina`;
      } else if (seMueve) {
        veredicto = "PLANTILLA";
        porQue = "test A: el valor SE MUEVE con el ancho ⇒ es un % del padre, lo pone la plantilla";
      } else {
        veredicto = "CAMPO (test A, CON RESERVA)";
        porQue = "test A: px iguales a 1440 y a 390. ⚠ RESERVA: no se miro la unidad DECLARADA — un `em` no se mueve con el ancho lo escriba quien lo escriba, y entonces esto seria plantilla del TEMA";
      }
      filas.push({
        arquetipo: d.arquetipo, doc: d.doc, tipo, eje, n,
        valores1440: distintos1440.sort((a, b) => a - b).slice(0, 8),
        nDistintos: distintos1440.length,
        hayAlgoEscrito, seMueve, varia, veredicto, porQue,
        censoDelTipo: censo[tipo],
        emparejamiento: { llave: "ordinal de la clase", comunes: n, soloEn1440: IA.m.size - n, soloEn390: IB.m.size - n, sinLlave1440: IA.sinLlave.length, sinLlave390: IB.sinLlave.length },
      });
    }
  }
}

/* ── CONTROLES ────────────────────────────────────────────────────────────── */
const controles = [];
const totalNodos = Object.values(medidas).flatMap((m) => m.a1440.filter((x) => x.i >= 0)).length;
controles.push({ nombre: "se midio algo (nodos con caja > 0)", ok: totalNodos > 0, visto: `${totalNodos} nodos con caja a 1440` });
/* El control ya NO exige que los cardinales coincidan —no coinciden, y es un
 * DATO del original: el constructor duplica modulos y esconde uno por ancho—.
 * Lo que se exige es que el EMPAREJAMIENTO por ordinal alcance a la mayoria y
 * publique sus dos lados sueltos, que es §*se publican los dos numeros, nunca su
 * diferencia*. */
const empJuntas = filas.map((f) => f.emparejamiento);
const sueltos = empJuntas.reduce((a, e) => a + e.soloEn1440 + e.soloEn390, 0);
const comunesTot = empJuntas.reduce((a, e) => a + e.comunes, 0);
controles.push({
  nombre: "el emparejamiento por ORDINAL alcanza (comunes > sueltos) y publica sus dos lados",
  ok: comunesTot > 0 && comunesTot > sueltos,
  visto: `comunes ${comunesTot} · solo-1440 ${empJuntas.reduce((a,e)=>a+e.soloEn1440,0)} · solo-390 ${empJuntas.reduce((a,e)=>a+e.soloEn390,0)} · sin llave ${empJuntas.reduce((a,e)=>a+e.sinLlave1440,0)}/${empJuntas.reduce((a,e)=>a+e.sinLlave390,0)}`,
});
const vered = {};
for (const f of filas) vered[f.veredicto] = (vered[f.veredicto] ?? 0) + 1;
controles.push({
  nombre: "los tests DISCRIMINAN (>1 veredicto distinto)",
  ok: Object.keys(vered).length > 1,
  visto: Object.entries(vered).map(([k, v]) => `${k}=${v}`).join(" · "),
});

const salida = {
  meta: {
    tanda: "123.ª · ESCALON 2", fecha: new Date().toISOString().slice(0, 10),
    lado: "UNO — el ORIGINAL capturado con sus hojas. NO compara con el clon: eso es qa:productos-cmp",
    regimen: "B- (builder puro) en los 4, derivado en candidatos-f35-123.json ⇒ los tests A y B valen tal como estan escritos, y son INTRA-INSTANCIA",
    alcance: "SOLO ejes de RITMO (margin/padding). La caja y la tipografia quedan fuera: ahi el test A responde AL REVES",
    noContesta: [
      "la UNIDAD DECLARADA de cada valor: un `em` no se mueve con el ancho y el test A lo lee como campo. Haria falta la CASCADA (CSS.getMatchedStylesForNode)",
      "la varianza INTER-instancia: estos 4 documentos son 4 arquetipos distintos, no 4 instancias de uno",
    ],
  },
  controles,
  reparto: vered,
  /* ⚠ El veredicto UNICO esconde el cruce, y el cruce es lo que informa: el test
   * B se evalua ANTES que el A (es la regla general, sin restriccion de
   * alcance), asi que en cuanto hay varianza sale CAMPO y el test A no llega a
   * pronunciarse. Publicar solo el veredicto daria «0 PLANTILLA» y eso se leeria
   * como un dato del original cuando es una consecuencia del ORDEN. */
  cruce2x2: (() => {
    const c = { "varia+seMueve": 0, "varia+noSeMueve": 0, "noVaria+seMueve": 0, "noVaria+noSeMueve": 0, sinEscribir: 0 };
    for (const f of filas) {
      if (!f.hayAlgoEscrito) { c.sinEscribir++; continue; }
      c[(f.varia ? "varia" : "noVaria") + "+" + (f.seMueve ? "seMueve" : "noSeMueve")]++;
    }
    return c;
  })(),
  filas,
};
writeFileSync("docs/research/cola-larga/derivaciones/tests-ab-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== REPARTO DE VEREDICTOS (documento × tipo × eje) ===");
for (const [k, v] of Object.entries(vered).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);
console.log("");
console.log("=== EL CRUCE 2x2 (lo que el veredicto unico esconde) ===");
for (const [k, v] of Object.entries(salida.cruce2x2)) console.log(`  ${String(v).padStart(3)}  ${k}`);
console.log("");
console.log("=== DETALLE ===");
for (const f of filas) {
  console.log(`  ${f.arquetipo.padEnd(15)} ${f.tipo.padEnd(8)} ${f.eje.padEnd(15)} n=${String(f.n).padStart(2)} vals=${JSON.stringify(f.valores1440)}  ⇒ ${f.veredicto}`);
}
const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
if (nulo) process.exit(1);
