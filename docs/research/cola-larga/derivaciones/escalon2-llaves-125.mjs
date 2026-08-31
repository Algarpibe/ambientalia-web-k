// 125.ª · ESCALON 2 — LOS 105 NODOS SIN LLAVE, REPARTIDOS POR CAUSA.
//
// LO ESTABLECIDO Y LO QUE FALTA:
//   · la 123.ª publico «420/420 sin llave» — cierto en unidad PAR nodo×eje;
//   · la 124.ª corrigio la unidad: **420 pares = 105 NODOS** (420/4 ejes), y
//     midio que **24 de los 105 son rescatables** con la llave depurada de
//     `f33-clases` (el `\b` no casa antes de `_`, asi que `et_pb_button_0_wrapper`
//     se queda fuera).
//   · QUEDAN **81 SIN EXPLICAR**. «81 sin llave» es un total, y un total es el
//     nivel de arriba de la atribucion: no dice si son un mecanismo o cinco.
//
// LO QUE ESTA DERIVACION HACE: recorre los MISMOS nodos con el MISMO criterio
// (con caja, cascaron descontado) y publica el `className` de cada sin-llave
// clasificado POR CAUSA. Nada de totales.
//
// §regla 33 — LA SEÑAL DE QUE UNA LLAVE NO CASA es que `faltan` y `sobran`
// crezcan JUNTOS con el mismo cardinal: el nodo no se pierde, se cuenta en los
// DOS lados y el neto lo tapa. Se publican los dos lados SUELTOS, nunca su
// diferencia. Y §regla 6: una llave nunca es opcional — si no se puede derivar,
// se TIRA; aqui se tira al cubo `SIN CAUSA`, que cierra el codigo de salida.
//
// MONTAJE: copiado de `paso0-nodos-124.mjs` SIN TOCAR, para que la diferencia
// entre las dos corridas no pueda venir del montaje (§regla 15 al reves: si
// comparten montaje, lo que difiera es del objeto).

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
const ANCHOS = [1440, 390];

/* ── PRECONDICIONES, ANTES DE GASTAR LA NAVEGACION (§regla 37) ────────────── */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(`corpus/productos/${d.doc}`);
if (!existsSync(REF_124)) faltan.push(REF_124);
if (!existsSync(CSS)) faltan.push("corpus/css");
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.length} insumos, comprobados ANTES del launch:\n   ${faltan.join("\n   ")}`);
  console.error(`   Si el nombre existio y hoy no, mira si lo renombro una §regla 5bis.`);
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

/* ── EXTRACCION — mismos nodos, mismo criterio, CONSERVANDO EL className ──── */
const extraer = () => {
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const enCascaron = (el) => !!el.closest("[class*='_tb_header'], [class*='_tb_footer']");
  const out = [];
  for (const [tipo, sel] of [["seccion", ".et_pb_section"], ["fila", ".et_pb_row"], ["modulo", ".et_pb_module"]]) {
    const nodos = [...document.querySelectorAll(sel)].filter((n) => !enCascaron(n));
    const conC = nodos.filter(conCaja);
    for (const [i, n] of conC.entries()) {
      /* LLAVE DE LA 123.ª — se conserva TAL CUAL (el `\b` incluido). */
      const ord123 = (String(n.className).match(/et_pb_[a-z_]+_(\d+)\b/) ?? [])[0] ?? null;
      /* LLAVE MEJORADA — tokeniza en clases y pregunta por cada una. Se
       * conserva TAL CUAL (el descarte de `_tb_` incluido) porque es la que
       * reproduce el `24` de la 124.ª: es el CRUCE, y tocarla lo rompería. */
      let ordMej = null;
      for (const m of String(n.className).matchAll(/([A-Za-z_][\w-]*)/g)) {
        if (/^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(m[1]) && !/_tb_/.test(m[1])) { ordMej = m[1]; break; }
      }
      /* TERCERA LLAVE — §regla 29 punto 2: no se cambia la llave que ya tiene
       * consumidores, se AÑADE la que contesta la otra pregunta, desde la misma
       * derivación y en la misma llamada.
       *
       * El descarte de `_tb_` de arriba es §regla 25 —una guarda cuyo dominio
       * es más ancho que su invariante—: existe para dejar fuera el CASCARÓN
       * (`_tb_header` · `_tb_footer`) y se lleva por delante `_tb_body`, que no
       * es cascarón sino el CUERPO de la plantilla del theme builder. Es la
       * capa `-T` del régimen híbrido, y sus nodos SÍ están numerados. */
      let ordTbBody = null;
      for (const m of String(n.className).matchAll(/([A-Za-z_][\w-]*)/g)) {
        if (/^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(m[1]) && !/_tb_(header|footer)/.test(m[1])) { ordTbBody = m[1]; break; }
      }
      out.push({
        tipo, i,
        sel: ord123,
        ordMej,
        ordTbBody,
        clases: String(n.className).split(/\s+/).filter(Boolean),
        etiqueta: n.tagName.toLowerCase(),
        padreClases: n.parentElement ? String(n.parentElement.className).split(/\s+/).filter(Boolean).slice(0, 6) : [],
      });
    }
    out.push({ tipo, i: -1, censo: { enElDOM: nodos.length, conCaja: conC.length } });
  }
  return out;
};

/* ═══ CLASIFICACION POR CAUSA — se deriva de las clases, no se supone ═══════
 * Los cubos son EXCLUYENTES y se evaluan en cascada. El ultimo, `SIN CAUSA`,
 * es el que cierra el codigo de salida: un nodo que no cae en ninguno es una
 * llave que no se pudo derivar, y §regla 6 dice que eso se rechaza, no se
 * sustituye por un valor benigno. */
function causaDe(n) {
  const cl = n.clases;
  const tieneOrdinalCrudo = cl.some((c) => /^et_pb_[a-z_]+_\d+/.test(c));
  if (n.ordMej && !n.sel) {
    /* La llave mejorada SI lo rescata: el ordinal lleva SUFIJO y el `\b` de la
     * llave vieja no casa antes de `_`. */
    return { causa: "SUFIJO-TRAS-ORDINAL", detalle: n.ordMej };
  }
  if (!n.ordMej && n.ordTbBody) {
    /* CUARTA CAUSA, DERIVADA y no relajada: el nodo SI esta numerado, pero por
     * OTRA CAPA — `et_pb_blog_0_tb_body`. El descarte de `_tb_` de la llave es
     * mas ancho que su invariante (§regla 25): existe para dejar fuera el
     * CASCARON y se lleva por delante el CUERPO de la plantilla. */
    return { causa: "ORDINAL-DE-OTRA-CAPA-tb_body", detalle: n.ordTbBody };
  }
  if (!tieneOrdinalCrudo) {
    /* No hay NINGUNA clase con ordinal: el constructor no numero este nodo. */
    const tipoDivi = cl.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module");
    if (cl.some((c) => /^et_pb_(section|row|column|module)$/.test(c)) || tipoDivi)
      return { causa: "SIN-ORDINAL-EN-EL-MARCADO", detalle: tipoDivi ?? cl.find((c) => c.startsWith("et_pb_")) ?? "?" };
    return { causa: "SIN-CLASE-DIVI", detalle: cl.slice(0, 3).join(" ") };
  }
  return { causa: "SIN CAUSA", detalle: cl.join(" ").slice(0, 120) };
}

/* ── MEDICION ─────────────────────────────────────────────────────────────── */
const medidas = {};
const { browser } = await launch();
try {
  for (const d of DOCS) {
    const f = join(CORPUS, d.doc);
    const porAncho = {};
    for (const ancho of ANCHOS) {
      const { page } = await openPage(browser, "about:blank", { width: ancho, height: ancho === 390 ? 844 : 900, mobile: ancho === 390 });
      await page.setRequestInterception(true);
      page.on("request", (r) => (r.url().startsWith("file:") || r.url().startsWith("data:") ? r.continue() : r.abort()));
      await page.setContent(conAssetsLocales(readFileSync(f, "utf8")), { waitUntil: "domcontentloaded" });
      await settle(page);
      porAncho[ancho] = await page.evaluate(extraer);
      await page.close();
    }
    medidas[d.doc] = porAncho;
  }
} finally {
  await browser.close();
}

/* ── REPARTO POR CAUSA, y §regla 33 con los DOS LADOS SUELTOS ─────────────── */
const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

const porCausa = new Map();
const porCausaTipo = new Map();
const muestras = new Map();
let nodosTotales = 0, sinLlave = 0, rescatables = 0, rescatablesTbBody = 0, irrecuperables = 0;
const porDoc = {};

/* §regla 33 — los DOS lados del emparejamiento entre anchos, sueltos. */
let soloA = 0, soloB = 0;

for (const d of DOCS) {
  const m = medidas[d.doc];
  const nodosA = m[1440].filter((x) => x.i >= 0);
  const nodosB = m[390].filter((x) => x.i >= 0);
  nodosTotales += nodosA.length;

  const sinA = nodosA.filter((x) => !x.sel);
  sinLlave += sinA.length;
  rescatables += sinA.filter((x) => x.ordMej).length;
  /* Rescate por la TERCERA llave, publicado aparte: son los que la llave
   * depurada de la 124.ª tampoco alcanza y que SI tienen ordinal. */
  rescatablesTbBody += sinA.filter((x) => !x.ordMej && x.ordTbBody).length;
  /* Y lo que NO rescata NINGUNA de las tres: sin ordinal en el marcado. Es lo
   * unico que de verdad no tiene llave derivable (§regla 6: se tira, no se
   * sustituye por un valor benigno). */
  irrecuperables += sinA.filter((x) => !x.ordMej && !x.ordTbBody).length;

  const cuentaDoc = {};
  for (const n of sinA) {
    const { causa, detalle } = causaDe(n);
    porCausa.set(causa, (porCausa.get(causa) ?? 0) + 1);
    const kt = `${causa}|${n.tipo}`;
    porCausaTipo.set(kt, (porCausaTipo.get(kt) ?? 0) + 1);
    cuentaDoc[causa] = (cuentaDoc[causa] ?? 0) + 1;
    if (!muestras.has(causa)) muestras.set(causa, []);
    if (muestras.get(causa).length < 4)
      muestras.get(causa).push({ doc: d.arquetipo, tipo: n.tipo, etiqueta: n.etiqueta, clases: n.clases.slice(0, 5).join(" "), detalle });
  }

  /* Los dos lados del emparejamiento por llave, SUELTOS y sin restar. */
  const kA = new Set(nodosA.filter((x) => x.sel).map((x) => `${x.tipo}|${x.sel}`));
  const kB = new Set(nodosB.filter((x) => x.sel).map((x) => `${x.tipo}|${x.sel}`));
  const sA = [...kA].filter((k) => !kB.has(k)).length;
  const sB = [...kB].filter((k) => !kA.has(k)).length;
  soloA += sA; soloB += sB;
  porDoc[d.arquetipo] = {
    nodosConCaja1440: nodosA.length, nodosConCaja390: nodosB.length,
    sinLlave1440: sinA.length, rescatables: sinA.filter((x) => x.ordMej).length,
    porCausa: cuentaDoc, soloA: sA, soloB: sB,
  };
}

const sinCausa = porCausa.get("SIN CAUSA") ?? 0;

/* CONTROLES */
ctl(nodosTotales > 0, "se recorrio algo (hay nodos con caja)", `${nodosTotales} nodos @1440`);
ctl(
  sinLlave > 0 && sinLlave < nodosTotales,
  "el detector de sin-llave DISCRIMINA (ni cero ni pleno)",
  `${sinLlave} de ${nodosTotales}`,
);
/* CRUCE con la 124.ª — §sondas 4: otra medida del mismo objeto, obligatoria. */
const ref = ref124.llaves ?? {};
const refNodos = Math.round((ref.sinLlaveTotal ?? 0));
ctl(
  refNodos === sinLlave,
  "CRUCE con la 124.ª: el n.º de NODOS sin llave REPRODUCE",
  `124.ª=${refNodos} · 125.ª=${sinLlave}`,
);
ctl(
  (ref.rescatablesConLlaveMejorada ?? -1) === rescatables,
  "CRUCE con la 124.ª: los RESCATABLES reproducen",
  `124.ª=${ref.rescatablesConLlaveMejorada} · 125.ª=${rescatables}`,
);
ctl(porCausa.size > 1, "la clasificacion por causa DISCRIMINA (mas de un cubo)", `${porCausa.size} cubos`);
ctl(sinCausa === 0, "§regla 6: ningun nodo cae en `SIN CAUSA`", `SIN CAUSA = ${sinCausa}`);
ctl(
  rescatables + rescatablesTbBody + irrecuperables === sinLlave,
  "el reparto por llave SUMA el total (ningun nodo en dos cubos ni fuera)",
  `${rescatables} + ${rescatablesTbBody} + ${irrecuperables} = ${sinLlave}`,
);
ctl(RESUELTAS > 0 && RESUELTAS === ENLAZADAS, "§regla 32: las hojas se resolvieron TODAS", `${RESUELTAS}/${ENLAZADAS}`);

/* ── INFORME ──────────────────────────────────────────────────────────────── */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== EL REPARTO POR CAUSA (unidad: NODO con caja @1440) ===");
say(`  nodos totales: ${nodosTotales} · sin llave: ${sinLlave}`);
say(`  RESCATE, por llave y SIN RESTAR NADA (§regla 33: los lados sueltos):`);
say(`      con la llave depurada de la 124.ª (sufijo tras ordinal):  ${rescatables}`);
say(`      con la TERCERA llave (\`_tb_body\` deja de descartarse):    ${rescatablesTbBody}`);
say(`      IRRECUPERABLES — sin ordinal en el marcado:               ${irrecuperables}`);
say(`      ${rescatables} + ${rescatablesTbBody} + ${irrecuperables} = ${rescatables + rescatablesTbBody + irrecuperables}  (tiene que dar ${sinLlave})`);
say();
for (const [causa, n] of [...porCausa].sort((a, b) => b[1] - a[1])) {
  say(`  ${String(n).padStart(4)}  ${causa}`);
  const porT = [...porCausaTipo].filter(([k]) => k.startsWith(`${causa}|`)).map(([k, v]) => `${k.split("|")[1]}=${v}`);
  say(`        por tipo: ${porT.join(" · ")}`);
  for (const m of muestras.get(causa) ?? []) say(`        · [${m.doc}/${m.tipo}] <${m.etiqueta}> ${m.clases}   → ${m.detalle}`);
}
say();

say("=== §regla 33 · LOS DOS LADOS SUELTOS (emparejamiento entre anchos, por llave) ===");
say("  (nunca su diferencia: si los dos crecen JUNTOS con el mismo cardinal, la llave no casa)");
say(`  solo-1440: ${soloA}   ·   solo-390: ${soloB}`);
say();

say("=== POR DOCUMENTO ===");
for (const d of DOCS) {
  const r = porDoc[d.arquetipo];
  say(`  ${d.arquetipo.padEnd(15)} conCaja 1440=${r.nodosConCaja1440} 390=${r.nodosConCaja390} · sinLlave=${r.sinLlave1440} (rescatables ${r.rescatables})`);
  say(`      ${Object.entries(r.porCausa).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
  say(`      solo-1440=${r.soloA} · solo-390=${r.soloB}`);
}

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 125, escalon: 2,
  alcance: { docs: DOCS.map((d) => d.doc), unidad: "NODO con caja @1440", nota: "propiedad de estos 4 documentos" },
  controles,
  totales: { nodos: nodosTotales, sinLlave, rescatables, rescatablesTbBody, irrecuperables, sinCausa },
  porCausa: Object.fromEntries(porCausa),
  porCausaTipo: Object.fromEntries(porCausaTipo),
  muestras: Object.fromEntries(muestras),
  regla33: { soloA, soloB, nota: "los dos lados sueltos; su diferencia NO se publica" },
  porDoc,
  hojas: { enlazadas: ENLAZADAS, resueltas: RESUELTAS },
};

const base = join(RAIZ, "docs/research/cola-larga/derivaciones", process.env.SALIDA || "escalon2-llaves-125");
writeFileSync(`${base}.json`, JSON.stringify(salida, null, 2));
writeFileSync(`${base}.log`, L.join("\n"));
console.log(`\n→ ${base}.json  ·  ${base}.log`);
process.exit(controles.every((c) => c.ok) ? 0 : 1);
