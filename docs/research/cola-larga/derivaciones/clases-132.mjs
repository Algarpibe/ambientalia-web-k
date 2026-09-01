// 132.ª · ESCALÓN 1 — LOS BLOQUEOS POR CLASE, QUE ES LA UNIDAD QUE FALTABA
//
// La 131.ª publicó cuántos TOKENS tiene cada clase. Eso no dice qué está en el
// camino crítico: un token puede aparecer en muchos bloqueos y una clase entera
// puede no aparecer en ninguno que importe. Aquí se derivan las CUATRO unidades
// —bloqueos · campos · documentos · kind— y la separadora que decide:
//
//   > admitir las cuatro clases INERTES —`data-*`, schema.org, aria de tabla,
//   > estructura HTML5— ¿desbloquea la siembra, o quedan bloqueos de FORMULARIO?
//
// contestada por DIFERENCIA SIMÉTRICA con los dos lados nombrados, nunca por
// resta (§*un cardinal es un contenedor y absorbe la membresía*).
//
// ── ⚠ Y ANTES DE NADA, EL TOPE ─────────────────────────────────────────────
// `extractor-f35` congela `hit.slice(0, 6)`. TRES bloqueos traen exactamente 6,
// o sea que están EN el tope y pueden llevar tokens recortados que la congelada
// no enseña —§*una sonda que congela `lista.slice(0,N)` está afirmando «hay N» a
// todo el que la lea después*—. Aquí se recalculan los hits SIN recortar y se
// publica el margen: cuántos tokens aparecen de más y en qué bloqueos.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);
const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["clase-muda", "sin-tope"];
if (SAB && !VALIDOS.includes(SAB)) throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const F35 = join(MED, "f35-extraido.json");
const ARBOL = join(DERIV, "arbol-f33.mjs");
const COMUNES = join(RAIZ, "packages/cms-config/src/campos/comunes.ts");
const DOCS = [
  { doc: "monitor-calidad-aire.html", slug: "monitor-calidad-aire", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", slug: "accesorios", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", slug: "software-de-medicion-calidad-del-aire", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", slug: "kunak-api", arquetipo: "SOFTWARE-corta" },
];
const faltan = [F35, ARBOL, COMUNES, ...DOCS.map((d) => join(CORPUS, d.doc))].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`); process.exit(1); }

const congelada = JSON.parse(readFileSync(F35, "utf8"));
const A = await import(pathToFileURL(ARBOL).href);
const { etiquetasFueraDelCenso, hostsFueraDeAllowlist, atributosFueraDelCenso } =
  await import(pathToFileURL(COMUNES).href);

P("=".repeat(78));
P("132.ª · ESCALÓN 1 — los BLOQUEOS por clase, y qué desbloquea admitir las inertes");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 0 · REPLICAR EL CAMINO, y CRUZARLO contra la congelada antes de usarlo
 *
 * §sondas 4: cuando existe otra medición del mismo objeto, cruzarla es
 * obligatorio antes de creerse un recuento nuevo. Si mi replicación no
 * reproduce los 22 bloqueos de la congelada al par (slug·kind·campo), no
 * publico nada derivado de ella: el instrumento sería mío, no el suyo.
 * ══════════════════════════════════════════════════════════════════════ */
/**
 * `sin-tope` reproduce EL MODO DE FALLO que esta derivación vigila —leer los
 * hits YA RECORTADOS como si fueran todos, que es lo que la 131.ª hizo sin
 * saberlo— y no la aritmética de ninguna condición (§regla 28a). Con él, los
 * 13 tokens ocultos desaparecen y el margen sale 0.
 */
const TOPE = SAB === "sin-tope" ? 6 : Infinity;
const A_KIND = {
  et_pb_text: "texto-arq", et_pb_blurb: "icono-arq", et_pb_image: "imagen-arq",
  et_pb_button: "boton-arq", et_pb_fullwidth_slider: "slider-ancho-arq",
  et_pb_slider: "slider-arq", et_pb_video: "video-arq", et_pb_code: "codigo-arq",
  et_pb_cta: "cta-arq", dvmd_table_maker: "tabla-arq", et_pb_gallery: "galeria-arq",
};
const tieneClase = (n, c) => n.clases.includes(c);
const buscaClase = (n, c) => { for (const h of A.recorre(n)) if (tieneClase(h, c)) return h; return null; };
const dentro = (html, n) => html.slice(n.ini, n.fin).trim();
function tipoDe(n) {
  const ord = n.clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c));
  if (ord) return `et_pb_${/^et_pb_(.+?)_\d+(_[a-z]+)*$/.exec(ord)[1]}`;
  return n.clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module")
      ?? n.clases.find((c) => /^dvmd_[a-z_]+$/.test(c)) ?? null;
}
/** Los campos HTML de un bloque, tal como los enumera el extractor: `contenido` y `titulo`. */
function camposDe(html, n, tipo) {
  const innerDe = (c) => dentro(html, buscaClase(n, c) ?? n);
  switch (tipo) {
    case "et_pb_text": return { contenido: innerDe("et_pb_text_inner") };
    case "et_pb_code": return { contenido: innerDe("et_pb_code_inner") };
    case "dvmd_table_maker": return { contenido: dentro(html, n) };
    case "et_pb_slider": case "et_pb_fullwidth_slider": return { contenido: dentro(html, n) };
    case "et_pb_blurb": {
      const t = buscaClase(n, "et_pb_module_header");
      const d = buscaClase(n, "et_pb_blurb_description");
      return { titulo: t ? dentro(html, t) : undefined, contenido: d ? dentro(html, d) : undefined };
    }
    case "et_pb_cta": {
      const t = buscaClase(n, "et_pb_module_header");
      const d = buscaClase(n, "et_pb_promo_description");
      return { titulo: t ? dentro(html, t) : undefined, contenido: d ? dentro(html, d) : undefined };
    }
    default: return {}; // image · button · video · gallery no llevan campo HTML
  }
}

const EJES = [
  { eje: "script", f: (h) => (/<script\b/i.test(h) ? ["<script>"] : []) },
  { eje: "etiqueta", f: (h) => etiquetasFueraDelCenso(h) },
  { eje: "host", f: (h) => hostsFueraDeAllowlist(h) },
  { eje: "atributo", f: (h) => atributosFueraDelCenso(h) },
];

const mios = [];   // { eje, slug, kind, campo, hit[] (SIN recortar), nHit }
let camposHtml = 0;
for (const d of DOCS) {
  const html = A.limpia(readFileSync(join(CORPUS, d.doc), "utf8"));
  const raiz = A.parsea(html);
  const modulos = [];
  (function baja(n, dentroModulo, dentroCascaron) {
    for (const h of n.hijos ?? []) {
      const casc = dentroCascaron || h.clases.some((c) => /_tb_(header|footer)/.test(c));
      const esMod = h.clases.includes("et_pb_module");
      if (esMod && !dentroModulo && !casc) modulos.push(h);
      baja(h, dentroModulo || (esMod && !casc), casc);
    }
  })(raiz, false, false);
  for (const n of modulos) {
    const tipo = tipoDe(n);
    const kind = A_KIND[tipo];
    if (!kind) continue;
    const campos = camposDe(html, n, tipo);
    for (const k of ["contenido", "titulo"]) {
      const v = campos[k];
      if (typeof v !== "string" || !v) continue;
      camposHtml++;
      for (const e of EJES) {
        const hit = e.f(v);
        if (hit.length) mios.push({ eje: e.eje, slug: d.slug, kind, campo: k, hit: hit.slice(0, TOPE), nHit: hit.slice(0, TOPE).length, html: v });
      }
    }
  }
}

/* ── EL CRUCE, que decide si sigo ─────────────────────────────────────────
 *
 * ⚠⚠ LA LLAVE TIENE QUE IDENTIFICAR, Y `eje|slug|kind|campo` NO LO HACE: tres
 * módulos DISTINTOS del mismo documento son los tres `texto-arq.contenido`, así
 * que esa llave colapsa los 22 bloqueos en 15. Y una diferencia simétrica sobre
 * CONJUNTOS no puede verlo —colapsa igual en los dos lados y sale 0/0—, o sea
 * §regla 29 con el daño puesto en el control que iba a adjudicar.
 *
 * Se arregla por las dos mitades: (a) la llave lleva el ORDINAL de emisión, que
 * es lo único que distingue a dos módulos hermanos, y (b) hay guarda de que la
 * llave IDENTIFICA —si se repite, TIRA (§regla 29: pisarla en silencio es el
 * defecto original una vuelta más abajo)—.
 */
P("\n## 0 · CRUCE contra la congelada de la 131.ª — antes de usar nada de esto");
const suyos = [];
for (const [eje, v] of Object.entries(congelada.bloqueos.porEje))
  v.forEach((b, i) => suyos.push({ eje, orden: i, ...b }));
mios.forEach((b) => { b.orden = mios.filter((x) => x.eje === b.eje).indexOf(b); });

/** Identidad: ordinal DENTRO de su eje + coordenadas. El hit va recortado a 6
 *  para poder compararse contra la congelada, que lo lleva recortado. */
const clave = (b) => `${b.eje}#${b.orden}|${b.slug}|${b.kind}|${b.campo}|${b.hit.slice(0, 6).join(",")}`;
/** Coordenadas sin ordinal — la que la v1 usaba, conservada para MEDIR el colapso. */
const claveFloja = (b) => `${b.eje}|${b.slug}|${b.kind}|${b.campo}`;

for (const [quien, xs] of [["míos", mios], ["suyos", suyos]]) {
  const ks = xs.map(clave);
  const dup = ks.filter((k, i) => ks.indexOf(k) !== i);
  if (dup.length) { console.error(`❌ la llave NO identifica en ${quien}: ${dup.length} repetidas → ${dup[0]}`); process.exit(1); }
}
const colapso = mios.length - new Set(mios.map(claveFloja)).size;
P(`   ⚠ la llave FLOJA (sin ordinal) colapsaría ${mios.length} bloqueos en ${new Set(mios.map(claveFloja)).size} — ${colapso} hermanos del mismo campo`);

const setMios = new Set(mios.map(clave));
const setSuyos = new Set(suyos.map(clave));
const soloMios = [...setMios].filter((k) => !setSuyos.has(k));
const soloSuyos = [...setSuyos].filter((k) => !setMios.has(k));
P(`   campos HTML .......... míos ${camposHtml}  ·  suyos ${congelada.bloqueos.camposHtml}`);
P(`   bloqueos ............. míos ${mios.length}  ·  suyos ${suyos.length}`);
P(`   llaves distintas ..... míos ${setMios.size}  ·  suyos ${setSuyos.size}  (= bloqueos ⇒ la llave identifica)`);
P(`   diferencia simétrica . sólo míos ${soloMios.length}  ·  sólo suyos ${soloSuyos.length}`);
for (const k of soloMios) P(`      + ${k}`);
for (const k of soloSuyos) P(`      − ${k}`);
const cruceOk = camposHtml === congelada.bloqueos.camposHtml
  && mios.length === suyos.length && setMios.size === mios.length
  && soloMios.length === 0 && soloSuyos.length === 0;
P(`   ${cruceOk ? "✅ REPLICACIÓN FIEL" : "❌ mi replicación no es la suya — nada de lo que sigue vale"}`);

/* ════════════════════════════════════════════════════════════════════════
 * 1 · EL TOPE — cuántos tokens escondía `hit.slice(0, 6)`
 * ══════════════════════════════════════════════════════════════════════ */
P(`   ⚠ y con la llave floja la simétrica habría salido 0/0 IGUAL, colapsando en los dos lados`);
P(`     — un cardinal correcto (22=22) al lado de una membresía ciega (§regla 29)`);

P("\n## 1 · EL TOPE DE LA CONGELADA — `hit.slice(0, 6)`, con su margen");
const enTope = mios.filter((b) => Math.min(b.nHit, 6) === 6);
const recortados = mios.filter((b) => b.nHit > 6);
P(`   bloqueos EN el tope (6 hits congelados) ....... ${enTope.length} de ${mios.length}`);
P(`   bloqueos que el tope RECORTÓ de verdad ........ ${recortados.length}`);
for (const b of recortados)
  P(`      ⚠ ${b.slug} · ${b.kind}.${b.campo} (${b.eje}) — ${b.nHit} tokens, congelados 6, OCULTOS ${b.nHit - 6}: ${b.hit.slice(6).join(", ")}`);
const tokCong = new Set(suyos.flatMap((b) => b.hit));
const tokReal = new Set(mios.flatMap((b) => b.hit));
const nuevos = [...tokReal].filter((t) => !tokCong.has(t)).sort();
P(`\n   tokens distintos · congelada ${tokCong.size}  ·  SIN recortar ${tokReal.size}  ·  ocultos ${nuevos.length}`);
if (nuevos.length) P(`   los que la 131.ª no podía ver: ${nuevos.join(", ")}`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LAS CLASES — la misma función de la 131.ª, sin cubo de sobras
 * ══════════════════════════════════════════════════════════════════════ */
const CLASES = {
  "schema.org": ["itemprop", "itemscope", "itemtype", "content", "meta"],
  "estructura HTML5": ["article", "header", "section", "footer", "aside", "nav"],
  formulario: ["form", "input", "label", "button", "fieldset", "legend", "action", "method", "for",
               "novalidate", "placeholder", "name", "value", "required", "autocomplete", "checked",
               "maxlength", "minlength", "pattern", "disabled", "readonly", "selected", "multiple",
               "accept", "enctype", "textarea", "select", "option", "optgroup", "datalist", "output"],
  "data-* del constructor": [],
  "aria de tabla": ["aria-colcount", "aria-colindex", "aria-rowcount", "aria-rowindex"],
};
const clasifica = SAB === "clase-muda"
  ? () => "data-* del constructor"                       // todo cae en un cubo inerte
  : (t) => {
      if (t.startsWith("data-")) return "data-* del constructor";
      for (const [c, xs] of Object.entries(CLASES)) if (xs.includes(t)) return c;
      return "SIN CLASIFICAR";
    };

/**
 * ⚠ LA CLASE `data-*` SE ASIGNA POR SINTAXIS, NO POR FUNCIÓN — y eso importa.
 * `data-sitekey` es la clave pública de reCAPTCHA y `data-autofill` /
 * `data-styles-version` los emite el mismo widget de ActiveCampaign: son
 * SINTÁCTICAMENTE `data-*` y FUNCIONALMENTE del formulario. Se publican las dos
 * lecturas, porque cambian el reparto y sólo una es la que decide.
 */
const DEL_WIDGET = new Set(["data-sitekey", "data-autofill", "data-styles-version"]);

const INERTES = ["data-* del constructor", "schema.org", "aria de tabla", "estructura HTML5"];

function reparto(clasificador, etiqueta) {
  const porClase = {};
  const toca = (c) => (porClase[c] ??= { tokens: new Set(), bloqueos: new Set(), campos: new Set(), docs: new Set(), kinds: new Set(), exclusivos: new Set() });
  for (const b of mios) {
    const k = clave(b);
    const campo = `${b.slug}|${b.kind}|${b.campo}`;
    const cs = new Set(b.hit.map(clasificador));
    for (const c of cs) {
      const x = toca(c);
      for (const t of b.hit) if (clasificador(t) === c) x.tokens.add(t);
      x.bloqueos.add(k); x.campos.add(campo); x.docs.add(b.slug); x.kinds.add(b.kind);
      if (cs.size === 1) x.exclusivos.add(k);
    }
  }
  P(`\n   ── ${etiqueta} ──`);
  P(`   ${"clase".padEnd(26)} ${"tok".padStart(3)} ${"bloq".padStart(4)} ${"excl".padStart(4)} ${"camp".padStart(4)} ${"doc".padStart(3)} ${"kind".padStart(4)}`);
  const filas = Object.entries(porClase).sort((a, b) => b[1].bloqueos.size - a[1].bloqueos.size);
  for (const [c, x] of filas)
    P(`   ${c.padEnd(26)} ${String(x.tokens.size).padStart(3)} ${String(x.bloqueos.size).padStart(4)} ${String(x.exclusivos.size).padStart(4)} ${String(x.campos.size).padStart(4)} ${String(x.docs.size).padStart(3)} ${String(x.kinds.size).padStart(4)}`);
  const sumaBloq = filas.reduce((a, [, x]) => a + x.bloqueos.size, 0);
  P(`   ${"(suma)".padEnd(26)} ${" ".repeat(3)} ${String(sumaBloq).padStart(4)} ← ${sumaBloq === mios.length ? "= " + mios.length : `> ${mios.length}: un bloqueo con tokens de DOS clases cuenta en las dos`}`);
  return porClase;
}

P("\n## 2 · REPARTO POR CLASE — con su unidad y su denominador");
P(`   denominadores: ${mios.length} bloqueos · ${camposHtml} campos HTML · ${DOCS.length} documentos · ${new Set(mios.map((b) => b.kind)).size} kinds tocados`);
const repSintaxis = reparto(clasifica, "A · clase por SINTAXIS (la de la 131.ª: prefijo `data-`)");
const clasificaFn = (t) => (DEL_WIDGET.has(t) ? "formulario" : clasifica(t));
const repFuncion = reparto(clasificaFn, "B · clase por FUNCIÓN (los 3 `data-` del widget van con su formulario)");

const sinClas = [...new Set([...tokReal].filter((t) => clasifica(t) === "SIN CLASIFICAR"))];
P(`\n   ${sinClas.length === 0 ? "✅" : "❌"} SIN CLASIFICAR: ${sinClas.length} de ${tokReal.size}${sinClas.length ? " → " + sinClas.join(", ") : ""}`);

/* ── los ceros, CON SU DENOMINADOR (§regla 14) ───────────────────────────── */
P("\n   ── los ceros, con su denominador ──");
for (const [eje, v] of Object.entries(congelada.bloqueos.porEje))
  if (!v.length) P(`   eje ${eje.padEnd(10)} 0 de ${camposHtml} campos HTML — medido, no «no lo miré»`);
for (const c of [...INERTES, "formulario"])
  if (!repSintaxis[c]) P(`   clase ${c.padEnd(24)} 0 de ${mios.length} bloqueos`);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LA PREGUNTA QUE DECIDE — por DIFERENCIA SIMÉTRICA, no por resta
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · ¿ADMITIR LAS CUATRO INERTES DESBLOQUEA LA SIEMBRA?");

function residuo(clasificador, admitidas) {
  const ok = new Set(admitidas);
  const quedan = mios.filter((b) => b.hit.some((t) => !ok.has(clasificador(t))));
  return quedan;
}
for (const [nombre, fn] of [["A · por sintaxis", clasifica], ["B · por función", clasificaFn]]) {
  const hoy = new Set(mios.map(clave));
  const quedan = residuo(fn, INERTES);
  const setQ = new Set(quedan.map(clave));
  const desaparecen = [...hoy].filter((k) => !setQ.has(k));
  const aparecen = [...setQ].filter((k) => !hoy.has(k));
  P(`\n   ── ${nombre} ──`);
  P(`   bloqueos HOY ................................. ${hoy.size}`);
  P(`   bloqueos si se admiten las 4 inertes ......... ${setQ.size}`);
  P(`   diferencia simétrica: DESAPARECEN ${desaparecen.length}  ·  APARECEN ${aparecen.length}`);
  P(`   los que QUEDARÍAN, nombrados uno a uno:`);
  if (!quedan.length) P(`      (ninguno)`);
  for (const b of quedan) {
    const culpables = b.hit.filter((t) => !INERTES.includes(fn(t)));
    P(`      ❗ ${b.slug} · ${b.kind}.${b.campo} (${b.eje}) → ${culpables.join(", ")}  [clase: ${[...new Set(culpables.map(fn))].join(" + ")}]`);
  }
  const campos = new Set(quedan.map((b) => `${b.slug}|${b.kind}|${b.campo}`));
  const docs = new Set(quedan.map((b) => b.slug));
  P(`   → residuo: ${quedan.length} bloqueos · ${campos.size} campo(s) de ${camposHtml} · ${docs.size} documento(s) de ${DOCS.length}`);
}

/* ════════════════════════════════════════════════════════════════════════
 * 4 · CONTROLES — y el veredicto sale de ELLOS
 * ══════════════════════════════════════════════════════════════════════ */
const ctrl = [];
const ctl = (ok, n, d) => ctrl.push({ ok, nombre: n, detalle: d });
ctl(cruceOk, "§sondas 4 · la replicación REPRODUCE la congelada de la 131.ª al par", `${mios.length}=${suyos.length} bloqueos · ${camposHtml}=${congelada.bloqueos.camposHtml} campos · simétrica 0/0 · llave identifica (${setMios.size}=${mios.length})`);
ctl(sinClas.length === 0, "§regla 27 · 0 SIN CLASIFICAR sobre los tokens SIN RECORTAR", `${tokReal.size} tokens, ${sinClas.length} sin cubo`);

/**
 * ⚠ EL CONTROL DEL TOPE NO PUEDE SER `real >= congelada`: eso lo cumple también
 * una corrida que recorte, porque `30 >= 30`. Lo que discrimina es re-leer el
 * validador sobre el MISMO campo y exigir que los hits guardados sean los
 * COMPLETOS — con el tope puesto, la re-lectura devuelve más y el control cae.
 */
let hitsCompletos = 0, hitsTruncos = 0;
for (const b of mios) {
  const e = EJES.find((x) => x.eje === b.eje);
  (e.f(b.html).length === b.nHit ? () => hitsCompletos++ : () => hitsTruncos++)();
}
ctl(hitsTruncos === 0, "el margen del tope se MIDE: los hits guardados son los completos, re-leídos del validador", `completos ${hitsCompletos} · truncos ${hitsTruncos} · congelada ${tokCong.size} → real ${tokReal.size} (ocultos ${nuevos.length})`);

const rf = residuo(clasificaFn, INERTES);
/**
 * ⚠ Y EL CONTROL DE LA CLASIFICACIÓN TAMPOCO PUEDE SER `docs <= 1`: un residuo
 * VACÍO también lo cumple, y vacío es exactamente lo que produce una
 * clasificación que mete el formulario en un cubo inerte. El control exige que
 * el residuo sea EXACTAMENTE el conjunto de bloqueos con token de formulario, y
 * que ese conjunto NO esté vacío — o sea que la clasificación DISCRIMINA.
 */
const conForm = mios.filter((b) => b.hit.some((t) => CLASES.formulario.includes(t) || DEL_WIDGET.has(t)));
const iguales = conForm.length === rf.length && conForm.every((b) => rf.includes(b));
ctl(conForm.length > 0 && iguales, "§regla 28a · la clasificación DISCRIMINA: el residuo ES el conjunto con token de formulario, y no está vacío", `residuo ${rf.length} · con-formulario ${conForm.length} · ${iguales ? "mismo conjunto" : "CONJUNTOS DISTINTOS"}`);
ctl(rf.length > 0 && new Set(rf.map((b) => b.slug)).size <= 1, "§regla 22 · el residuo va con su CARDINAL, no con un booleano", `${rf.length} bloqueos en ${new Set(rf.map((b) => b.slug)).size} documento(s) · ${new Set(rf.map((b) => `${b.slug}|${b.kind}|${b.campo}`)).size} campo(s)`);
/* §regla 44: el contrato en la unidad de la COMPARACIÓN, no en la de arriba. */
ctl(mios.length > 0 && camposHtml > 0, "§sondas 4bis · 0 comparado NO puede salir verde", `${camposHtml} campos recorridos · ${mios.length} bloqueos`);

P("\n## 4 · CONTROLES");
for (const c of ctrl) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const ok = ctrl.every((c) => c.ok);
P("\n" + "=".repeat(78));
P(`VEREDICTO · ${ok ? "los controles pasan" : "HAY CONTROLES EN ROJO"} · residuo tras admitir las 4 inertes: ${rf.length} bloqueos`);
P("=".repeat(78));

/* ── congelada, con el nombre DERIVADO del estado (§regla 5, las dos fugas) ─ */
const salida = {
  meta: { fecha: new Date().toISOString().slice(0, 10), tanda: "132.ª", derivacion: "clases-132", saboteada: SAB },
  noContesta: [
    "NO decide: el expediente describe, el propietario decide",
    "NO mide riesgo de ejecución en el navegador del visitante — eso es la ficha del ESCALÓN 2",
    "NO abre el original vivo: lee el corpus congelado de `corpus/productos`",
  ],
  denominadores: { bloqueos: mios.length, camposHtml, documentos: DOCS.length, kindsTocados: [...new Set(mios.map((b) => b.kind))] },
  tope: { congeladoPorSonda: 6, bloqueosEnTope: enTope.length, bloqueosRecortados: recortados.length, tokensOcultos: nuevos },
  bloqueos: mios.map(({ html, ...b }) => b), // el HTML no se congela: lo trae el corpus
  porClase: {
    sintaxis: Object.fromEntries(Object.entries(repSintaxis).map(([c, x]) => [c, { tokens: [...x.tokens].sort(), bloqueos: x.bloqueos.size, exclusivos: x.exclusivos.size, campos: x.campos.size, documentos: [...x.docs], kinds: [...x.kinds] }])),
    funcion: Object.fromEntries(Object.entries(repFuncion).map(([c, x]) => [c, { tokens: [...x.tokens].sort(), bloqueos: x.bloqueos.size, exclusivos: x.exclusivos.size, campos: x.campos.size, documentos: [...x.docs], kinds: [...x.kinds] }])),
  },
  residuoTrasInertes: {
    sintaxis: residuo(clasifica, INERTES).map((b) => ({ ...b, culpables: b.hit.filter((t) => !INERTES.includes(clasifica(t))) })),
    funcion: rf.map((b) => ({ ...b, culpables: b.hit.filter((t) => !INERTES.includes(clasificaFn(t))) })),
  },
  controles: ctrl,
};
/**
 * ⚠ LA GUARDA DE §regla 5, CONECTADA — no sólo escrita en la cabecera.
 * `derivaciones/` es una de las DOS FUGAS que `w()` no tapa: un `writeFileSync`
 * pelado deja que la corrida que VERIFICA un arreglo pise a la que lo
 * DIAGNOSTICÓ. Aquí no se pisa una congelada que difiera: se escribe al lado con
 * su fecha y se dice en voz alta. Idéntica se reescribe —no se pierde nada—.
 * Para re-congelar a propósito, `PISAR=1`.
 */
const { writeFileSync } = await import("node:fs");
let nombre = SAB ? `clases-132-neg-${SAB}.json` : "clases-132.json";
const cuerpo = JSON.stringify(salida, null, 1);
const sinFecha = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const destino = join(DERIV, nombre);
if (!SAB && !process.env.PISAR && existsSync(destino)
    && sinFecha(readFileSync(destino, "utf8")) !== sinFecha(cuerpo)) {
  const hoy = new Date().toISOString().slice(0, 10);
  let n = `clases-132-${hoy}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `clases-132-${hoy}-${++i}.json`;
  console.log(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  nombre = n;
}
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada → derivaciones/${nombre}`);

process.exit(ok ? 0 : 2);
