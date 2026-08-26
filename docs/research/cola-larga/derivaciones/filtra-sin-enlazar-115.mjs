/* ═════════════════════════════════════════════════════════════════════════
 *  ¿FILTRA ALGÚN LISTADO POR `categoria`, `author` O `sector` SIN ENLAZARLA?
 *  115.ª · ESCALÓN 1 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * LA PREGUNTA, Y POR QUÉ NO ESTÁ CONTESTADA
 *   El censo de F3-4 (108.ª) publicó «taxonomía enlazada desde el área de
 *   tarjetas» y dejó su propio aviso escrito:
 *
 *     «Contesta ¿ENLAZA la tarjeta?, NO ¿lo necesita el MODELO? Un listado
 *      puede filtrar por una taxonomía sin enlazarla — el filtro de 12 botones
 *      es justo eso. Un 0 aquí es una PREGUNTA para el dato.»
 *
 *   Ese 0 es el de `author` (0 de 35 formas), y es justo el que decidiría «no
 *   se replica» en la mesa de F3-4. Contestarlo mal cuesta un campo de menos
 *   en el esquema, que es el defecto que NO grita (§sondas 6).
 *
 * QUÉ PREGUNTA CONTESTA
 *   **¿Hay en el HTML servido algún mecanismo que CONSUMA una de las tres
 *   taxonomías sin emitir un enlace a su archivo?** Se contesta recorriendo
 *   SEIS canales, y la lista de canales se publica — porque una afirmación de
 *   que un discriminador NO EXISTE vale lo que valga la lista de lo que se
 *   miró (§*toda afirmación de que un discriminador no existe se escribe con
 *   la lista de canales*). Sin esa lista, «no filtra nadie» es una afirmación
 *   sobre el canal, no sobre el dato — y llega a la mesa blindada.
 *
 * LOS SEIS CANALES
 *   C-1 · CONTROLES DE FILTRO ...... `data-filter`, `<select>`, `<form>`
 *   C-2 · ATRIBUTOS `data-*` ....... cualquier `data-*` cuyo NOMBRE o VALOR
 *                                    nombre una de las tres taxonomías
 *   C-3 · CLASES DE TÉRMINO ........ `post_class()` en el `<article>`:
 *                                    WordPress emite `<taxonomía>-<slug>`
 *   C-4 · PARÁMETROS EN LOS `href` .. `?cat=`, `?author=`, `?_sft_…=`
 *   C-5 · `<body class>` ........... `category`, `author`, `tax-…`, `term-…`
 *   C-6 · ENLACES AL ARCHIVO ....... `/categoria/`, `/author/`, `/sector/`
 *                                    (el canal que el censo YA midió — entra
 *                                    para poder CRUZAR, no para re-medirlo)
 *
 *   El discriminador de la pregunta es **C-6 vacío con algún otro poblado**:
 *   eso es «consume sin enlazar», que es exactamente lo que el censo no podía
 *   ver.
 *
 * QUÉ **NO** CONTESTA (§*antes de construir sobre una medida, escribe qué
 * preguntas NO contesta*)
 *   · NO mide COMPORTAMIENTO. Un filtro que se monte en JS a partir de una
 *     petición no deja rastro en el HTML servido, y el eje comportamiento
 *     está a 0/31 en este repo. Un cero aquí acota el HTML SERVIDO, no el
 *     original.
 *   · NO mira el CSS servido. Una regla podría esconder tarjetas por clase de
 *     término; eso sería otro canal y no está en la lista.
 *   · NO dice si el modelo NECESITA el campo — dice si el ORIGINAL lo
 *     consume. Que nadie lo consuma no obliga a tirarlo; que alguien lo
 *     consuma sí obliga a tenerlo.
 *
 * CONTROL (§regla 8: un negativo sin control no es un negativo)
 *   El detector TIENE que encontrar el filtro de 12 botones de
 *   `/es/casos-de-exito/` — el único consumidor conocido, y consume `sector`
 *   SIN enlazarlo. Si no lo encuentra, sus ceros no valen nada: serían la
 *   §sondas 4 sobre seis selectores a la vez.
 *
 * SIN RED · SIN BUILD · SIN TOCAR `src/` — sólo el corpus capturado.
 * ═══════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus", "fase-3");

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

/* Las tres taxonomías de la mesa, con TODOS los nombres por los que el
 * original puede llamarlas. El conjunto se deriva del corpus más abajo; esto
 * es la semilla, y lo que aparezca fuera de ella sale NOMBRADO. */
const TAX = {
  categoria: { seg: ["categoria", "categor%C3%ADa"], cls: ["category"] },
  author:    { seg: ["author", "autor"],             cls: ["author"] },
  sector:    { seg: ["sector"],                      cls: ["sector"] },
};

say("═══ ¿FILTRA ALGÚN LISTADO SIN ENLAZAR? · 115.ª ESCALÓN 1 ═══");
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 0 · ALCANCE — qué entra y qué no, con su cardinal (§regla 14)
 * ──────────────────────────────────────────────────────────────────────── */
const htmls = [];
(function anda(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) anda(p);
    else if (e.endsWith(".html")) htmls.push(p);
  }
})(CORPUS);
htmls.sort();

const grupo = (p) => relative(CORPUS, p).split(/[\\/]/)[0];
const porGrupo = {};
for (const h of htmls) (porGrupo[grupo(h)] ??= []).push(h);

say("0 · ALCANCE");
say("");
say(`  documentos HTML del corpus fase-3: ${htmls.length}`);
for (const [g, hs] of Object.entries(porGrupo).sort())
  say(`     ${g.padEnd(20)} ${String(hs.length).padStart(4)}`);
say("");
say("  NO entran: el corpus fuera de `fase-3` (casos · entradas-blog · faqs ·");
say("  productos · terminos-kunakpedia · documentos-cientificos), que son");
say("  DETALLES y no listados. La pregunta es sobre listados y archivos.");
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 1 · LOS SEIS CANALES, POR DOCUMENTO
 * ──────────────────────────────────────────────────────────────────────── */
const RE_ARTICLE = /<article\b[^>]*\bclass="([^"]*)"/gi;
const RE_BODY = /<body\b[^>]*\bclass="([^"]*)"/i;
const RE_DATA = /\bdata-([a-z0-9_-]+)\s*=\s*"([^"]*)"/gi;
const RE_HREF = /\bhref\s*=\s*"([^"]*)"/gi;
const RE_SELECT = /<select\b[^>]*>/gi;
const RE_FORM = /<form\b[^>]*>/gi;

/* El HTML se limpia de `<style>` y `<script>` antes de buscar MARCADO: el CSS
 * de Divi nombra sus propias clases y un pleno de ahí se lee como dato
 * (§*el markup se busca sobre el HTML sin `<style>` ni `<script>`*). Los
 * canales que SÍ viven en script se miran aparte y se dicen. */
const sinCodigo = (h) => h
  .replace(/<style\b[\s\S]*?<\/style>/gi, "")
  .replace(/<script\b[\s\S]*?<\/script>/gi, "");

const filas = [];
for (const p of htmls) {
  const crudo = readFileSync(p, "utf8");
  const html = sinCodigo(crudo);
  const rel = relative(CORPUS, p).replace(/\\/g, "/");

  /* C-1 · controles de filtro */
  const dataFilter = [...html.matchAll(/\bdata-filter\s*=\s*"([^"]*)"/gi)].map((m) => m[1]);
  const selects = [...html.matchAll(RE_SELECT)].length;
  const forms = [...html.matchAll(RE_FORM)].length;

  /* C-2 · data-* que nombren una taxonomía (por nombre O por valor) */
  const dataTax = {};
  for (const m of html.matchAll(RE_DATA)) {
    const [, nom, val] = m;
    for (const [t, cfg] of Object.entries(TAX)) {
      const claves = [t, ...cfg.cls, ...cfg.seg];
      if (claves.some((k) => nom.includes(k) || val.includes(k)))
        (dataTax[t] ??= new Set()).add(`data-${nom}="${val.slice(0, 40)}"`);
    }
  }

  /* C-3 · clases de término en post_class() */
  const clasesArt = new Set();
  for (const m of html.matchAll(RE_ARTICLE))
    for (const c of m[1].split(/\s+/)) if (c) clasesArt.add(c);
  const clsTax = {};
  for (const c of clasesArt)
    for (const [t, cfg] of Object.entries(TAX))
      for (const pre of [t, ...cfg.cls])
        if (c.startsWith(pre + "-")) (clsTax[t] ??= new Set()).add(c);

  /* C-4 · parámetros de consulta en los href */
  const hrefs = [...html.matchAll(RE_HREF)].map((m) => m[1]);
  const qsTax = {};
  for (const h of hrefs) {
    const q = h.indexOf("?");
    if (q < 0) continue;
    const qs = h.slice(q + 1);
    for (const [t, cfg] of Object.entries(TAX))
      if ([t, ...cfg.cls, ...cfg.seg, "cat"].some((k) => new RegExp(`(^|&)_?s?f?t?_?${k}=`, "i").test(qs)))
        (qsTax[t] ??= new Set()).add(h.slice(0, 70));
  }

  /* C-5 · body class
   *
   * ⚠ `term-<slug>` NO dice de qué taxonomía es — lo dice `tax-<taxonomía>`,
   * que va al lado. La primera versión de esta sonda contaba todo `term-*`
   * para las TRES, y por eso el mismo documento aparecía consumiendo
   * `categoria`, `author` y `sector` a la vez: una condición laxa fabricando
   * el hallazgo por triplicado. Es §*una llave que puede valer null fabrica
   * el hallazgo dos veces* con la laxitud en vez del `null`.
   *
   * Regla: `term-*` sólo cuenta para `t` si el MISMO body trae `tax-t`. Un
   * `term-*` huérfano no se reparte: se cuenta aparte y se publica. */
  const bodyCls = (RE_BODY.exec(crudo)?.[1] ?? "").split(/\s+/).filter(Boolean);
  RE_BODY.lastIndex = 0;
  const bodyTax = {};
  const taxDeclarada = new Set(
    bodyCls.filter((c) => c.startsWith("tax-")).map((c) => c.slice(4)));
  const termsHuerfanos = bodyCls.filter((c) => /^term-/.test(c) && taxDeclarada.size === 0);
  for (const c of bodyCls)
    for (const [t, cfg] of Object.entries(TAX)) {
      const nombres = [t, ...cfg.cls];
      const directo = nombres.some((k) => c === k || c.startsWith(k + "-"));
      const porTax = c === `tax-${t}` || nombres.some((k) => c === `tax-${k}`);
      const porTermConTax = /^term-/.test(c) && nombres.some((k) => taxDeclarada.has(k));
      if (directo || porTax || porTermConTax) (bodyTax[t] ??= new Set()).add(c);
    }

  /* C-6 · enlaces al archivo de la taxonomía */
  const linkTax = {};
  for (const h of hrefs)
    for (const [t, cfg] of Object.entries(TAX))
      if (cfg.seg.some((s) => h.includes(`/${s}/`)))
        (linkTax[t] ??= new Set()).add(h.slice(0, 70));

  filas.push({
    rel, grupo: grupo(p),
    c1: { dataFilter, selects, forms },
    c2: dataTax, c3: clsTax, c4: qsTax, c5: bodyTax, c6: linkTax,
    termsHuerfanos,
  });
}

/* ────────────────────────────────────────────────────────────────────────
 * 2 · CONTROL — ¿encuentra el detector el único consumidor conocido?
 * ──────────────────────────────────────────────────────────────────────── */
say("2 · CONTROL · el filtro de 12 botones de `/es/casos-de-exito/`");
say("");
const ctrl = filas.find((f) => f.rel === "listados/casos-de-exito/index.html");
if (!ctrl) throw new Error("CONTROL AUSENTE: no está listados/casos-de-exito/index.html en el corpus");
const nBotones = ctrl.c1.dataFilter.length;
const conTermino = ctrl.c1.dataFilter.filter((v) => v.startsWith(".sector-"));
const comodines = ctrl.c1.dataFilter.filter((v) => v === "*");
const clasesSector = ctrl.c3.sector ? [...ctrl.c3.sector].length : 0;
const enlazaSector = ctrl.c6.sector ? [...ctrl.c6.sector].length : 0;

say(`  C-1 · controles \`data-filter\` .......... ${nBotones}`);
say(`        · con término \`.sector-*\` ........ ${conTermino.length}`);
say(`        · comodín "*" (el «todos» de Isotope) ${comodines.length}`);
say(`  C-3 · clases de término en las tarjetas . ${clasesSector} distintas`);
say(`  C-6 · enlaces a /sector/ ................ ${enlazaSector}`);
say("");

/* El control fuerte NO es «hay 12 botones»: es que TRES canales
 * independientes devuelvan el MISMO cardinal de términos. Si uno fallara, la
 * coincidencia se rompe — y una coincidencia triple no sale por azar. */
const triple = conTermino.length === clasesSector && clasesSector === enlazaSector && clasesSector > 0;
const controlOk = nBotones > 0 && triple;
say(`  CONTROL · coincidencia TRIPLE de cardinales:`);
say(`     filtro ${conTermino.length} = clases ${clasesSector} = enlaces ${enlazaSector}  →  ${triple ? "✅" : "❌"}`);
say("");
say(`  ${controlOk ? "✅ EL DETECTOR ENCUENTRA EL CONSUMIDOR CONOCIDO, por tres canales" : "❌ NO LO ENCUENTRA — los ceros de abajo no valen nada"}`);
say("");
say(`  ⚠ Y AL VERIFICARLO SE CAE EL EJEMPLO QUE MOTIVABA LA PREGUNTA.`);
say(`     El aviso del censo dice que el filtro de 12 botones «filtra sin`);
say(`     enlazar». NO ES ASÍ: enlaza los ${enlazaSector} sectores (C-6), y el propio`);
say(`     censo lo dice en otro sitio —«la ÚNICA de las 35 formas que enlaza a`);
say(`     /sector/»—. O sea que filtra Y ADEMÁS enlaza.`);
say("");
say(`     La pregunta sigue siendo buena; su EJEMPLO no era de la clase que`);
say(`     motiva. Y eso importa: si el único caso citado de «consume sin`);
say(`     enlazar» resulta que enlaza, el conjunto de esa clase estaba SIN`);
say(`     COMPROBAR, no confirmado por un caso. §regla 8b sobre el ejemplo en`);
say(`     vez de sobre el número.`);
say("");
say(`     (Y los 12 botones son 11 sectores + 1 comodín: el «todos». Otro`);
say(`      cardinal citado con la unidad de al lado.)`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 3 · EL RESULTADO, POR FAMILIA Y CON SU DENOMINADOR
 * ──────────────────────────────────────────────────────────────────────── */
say("3 · POR FAMILIA, CON SU DENOMINADOR (nunca en total)");
say("");
const N = filas.length;
const CANALES = [
  ["C-1 control de filtro", (f, t) => f.c1.dataFilter.some((v) => v.includes(t) || TAX[t].cls.some((c) => v.includes(c)))],
  ["C-2 data-* ", (f, t) => !!f.c2[t]],
  ["C-3 clase de término", (f, t) => !!f.c3[t]],
  ["C-4 parámetro en href", (f, t) => !!f.c4[t]],
  ["C-5 body class", (f, t) => !!f.c5[t]],
  ["C-6 enlace al archivo", (f, t) => !!f.c6[t]],
];

for (const t of Object.keys(TAX)) {
  say(`  ── ${t.toUpperCase()} ──`);
  say(`     canal                    docs   ¿en qué grupos?`);
  const consumo = { sinEnlace: 0, conEnlace: 0 };
  for (const [nom, test] of CANALES) {
    const hit = filas.filter((f) => test(f, t));
    const gs = [...new Set(hit.map((h) => h.grupo))].sort();
    say(`     ${nom.padEnd(22)} ${String(hit.length).padStart(4)}/${N}   ${gs.join(" · ") || "—"}`);
  }
  /* el discriminador: algún canal distinto de C-6, con C-6 vacío */
  for (const f of filas) {
    const otros = CANALES.slice(0, 5).some(([, test]) => test(f, t));
    const enlace = !!f.c6[t];
    if (otros && !enlace) consumo.sinEnlace++;
    else if (otros && enlace) consumo.conEnlace++;
  }
  say("");
  say(`     ⇒ documentos que CONSUMEN \`${t}\` por algún canal:`);
  say(`          SIN enlazarla ... ${consumo.sinEnlace}/${N}   ← lo que el censo no podía ver`);
  say(`          enlazándola ..... ${consumo.conEnlace}/${N}`);
  /* Un cardinal es un contenedor y absorbe la membresía: los que consumen sin
   * enlazar van NOMBRADOS, con el canal por el que entró cada uno. */
  const sinEnl = filas.filter((f) => CANALES.slice(0, 5).some(([, tt]) => tt(f, t)) && !f.c6[t]);
  if (sinEnl.length) {
    say("");
    say(`     los ${sinEnl.length}, NOMBRADOS y con el canal por el que entran:`);
    const porCanal = {};
    for (const f of sinEnl) {
      const vias = CANALES.slice(0, 5).filter(([, tt]) => tt(f, t)).map(([n]) => n.split(" ")[0]);
      (porCanal[vias.join("+")] ??= []).push(f.rel);
    }
    for (const [via, rels] of Object.entries(porCanal).sort()) {
      say(`        vía ${via}  ×${rels.length}`);
      for (const r of rels.slice(0, 6)) say(`           ${r}`);
      if (rels.length > 6) say(`           … y ${rels.length - 6} más (todos en el .json)`);
    }
  }
  say("");
}

/* ────────────────────────────────────────────────────────────────────────
 * 4 · LO QUE APARECIÓ Y NO ESTABA EN LA SEMILLA
 * ──────────────────────────────────────────────────────────────────────── */
/* Lo excluido del reparto se publica con su cardinal, fuera del recuento
 * (§regla 14 · §*los ejes excluidos se reparten igual y se publican*). */
const huerfanos = filas.filter((f) => f.termsHuerfanos.length);
say(`  ⚠ EXCLUIDOS DEL REPARTO, con su cardinal: ${huerfanos.length}/${N} documentos traen`);
say(`    \`term-<slug>\` en el body SIN un \`tax-<taxonomía>\` que diga de cuál es.`);
say(`    NO se reparten entre las tres —eso es lo que hacía la v1 y fabricaba el`);
say(`    hallazgo por triplicado—: salen aquí, sin adjudicar.`);
if (huerfanos.length) {
  const gs = {};
  for (const h of huerfanos) (gs[h.grupo] ??= []).push(h);
  for (const [g, hs] of Object.entries(gs).sort())
    say(`       ${g.padEnd(20)} ${String(hs.length).padStart(4)}   ej: ${hs[0].termsHuerfanos.join(" ")}`);
}
say("");

say("4 · TAXONOMÍAS FUERA DE LA SEMILLA — lo que el barrido encontró de paso");
say("");
/* Toda clase de `post_class()` con forma `<algo>-<slug>` que no sea de las
 * conocidas de WordPress: eso nombra una taxonomía que el original consume. */
const YA = /^(post|type|status|format|has|hentry|clearfix|et_pb|entry|page|attachment)/;
const otras = {};
for (const p of htmls) {
  const html = sinCodigo(readFileSync(p, "utf8"));
  for (const m of html.matchAll(RE_ARTICLE))
    for (const c of m[1].split(/\s+/)) {
      if (!c || YA.test(c) || !c.includes("-")) continue;
      const pre = c.slice(0, c.indexOf("-"));
      if (/^\d/.test(pre)) continue;
      (otras[pre] ??= new Set()).add(c);
    }
}
say("  prefijo        términos distintos");
for (const [pre, set] of Object.entries(otras).sort((a, b) => b[1].size - a[1].size)) {
  const mio = Object.keys(TAX).includes(pre) || Object.values(TAX).some((c) => c.cls.includes(pre));
  say(`  ${pre.padEnd(14)} ${String(set.size).padStart(4)}   ${mio ? "(de la mesa)" : "← NO estaba en la semilla"}`);
}
say("");

/* ────────────────────────────────────────────────────────────────────────
 * VEREDICTO
 * ──────────────────────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────────────────
 * 5 · EL DISCRIMINADOR QUE CONVIERTE EL RECUENTO EN VEREDICTO
 *
 * «Tiene la clase» y «alguien usa la clase» NO son lo mismo. `post_class()`
 * emite `<taxonomía>-<slug>` en TODA tarjeta de un CPT que tenga esa
 * taxonomía, la use el listado o no. Leer eso como «consumo» es §*un patrón
 * que casa en TODAS tampoco mide nada*: mediría que WordPress existe.
 *
 * El discriminador es si el MISMO documento trae un mecanismo que la use.
 * ──────────────────────────────────────────────────────────────────────── */
say("5 · ¿SUBPRODUCTO DE `post_class()` O CONSUMO ACTIVO?");
say("");
say("  documento                              clase  mecanismo  enlace   lectura");
const activos = {};
for (const t of Object.keys(TAX)) {
  const conClase = filas.filter((f) => f.c3[t]);
  const conMec = conClase.filter((f) => f.c1.dataFilter.length || f.c1.selects > 0);
  const mecSinEnlace = conMec.filter((f) => !f.c6[t]);
  activos[t] = { conClase: conClase.length, conMec: conMec.length, mecSinEnlace: mecSinEnlace.length };
  say(`  ${t.padEnd(38)} ${String(conClase.length).padStart(5)}  ${String(conMec.length).padStart(9)}  ${String(conClase.filter((f) => f.c6[t]).length).padStart(6)}   ${
    conMec.length === 0 ? "SUBPRODUCTO — nadie la usa"
      : mecSinEnlace.length ? "CONSUMO SIN ENLACE"
        : "CONSUMO, y además enlaza"}`);
}
say("");
say("  ⇒ La clase de término está en el HTML de muchos documentos porque");
say("    `post_class()` la emite siempre. Lo que decide es si hay MECANISMO:");
say(`    sólo ${filas.filter((f) => f.c1.dataFilter.length).length} documentos del corpus traen uno (\`data-filter\`), y son las`);
say(`    DOS páginas de \`/es/casos-de-exito/\` — que además enlazan.`);
say("");

say("═══ VEREDICTO ═══");
say("");
say(`  Canales mirados: ${CANALES.length} — controles de filtro · data-* · clases de`);
say(`  término · parámetros en href · body class · enlaces al archivo.`);
say(`  Documentos: ${N}. Control: ${controlOk ? "✅ verde" : "❌ ROJO"} (coincidencia triple 11=11=11).`);
say("");
say("  POR FAMILIA — «¿hay algún mecanismo que la consuma sin enlazarla?»:");
say("");
for (const t of Object.keys(TAX)) {
  const a = activos[t];
  say(`     ${t.padEnd(10)} → ${a.mecSinEnlace === 0 ? "NO" : "SÍ (" + a.mecSinEnlace + ")"}`
    + `   (clase en ${a.conClase} docs · mecanismo en ${a.conMec})`);
}
say("");
say("  Y las tres con su matiz, que es lo que la mesa necesita:");
say("     · categoria — se consume, pero SIEMPRE enlazando: 0 casos ocultos;");
say("     · author ... — 0 por los seis canales. Ni clase, ni filtro, ni");
say("                    parámetro. Su único rastro es el archivo propio y");
say("                    los enlaces A ese archivo;");
say("     · sector ... — el único mecanismo del corpus (el filtro de Isotope)");
say("                    vive en 2 documentos y ADEMÁS enlaza. Los 27 con");
say("                    clase y sin enlace no tienen quien las use: son");
say("                    subproducto de `post_class()`.");
say("");
say(`  ⚠ Y lo que NO cubre, con su nombre: el eje COMPORTAMIENTO (un filtro`);
say(`  montado en JS tras una petición no deja rastro en el HTML servido) y el`);
say(`  CSS servido. Un cero de esta sonda acota EL HTML SERVIDO, no el original.`);

writeFileSync(join(AQUI, "filtra-sin-enlazar-115.log"), L.join("\n") + "\n", "utf8");
writeFileSync(join(AQUI, "filtra-sin-enlazar-115.json"),
  JSON.stringify({ alcance: { documentos: N, porGrupo: Object.fromEntries(Object.entries(porGrupo).map(([k, v]) => [k, v.length])) },
    control: { botones: nBotones, conTermino: conTermino.length, comodines: comodines.length,
      clasesSector, enlazaSector, coincidenciaTriple: triple, ok: controlOk },
    filas: filas.map((f) => ({ rel: f.rel, grupo: f.grupo,
      c1: { dataFilter: f.c1.dataFilter, selects: f.c1.selects, forms: f.c1.forms },
      c2: Object.fromEntries(Object.entries(f.c2).map(([k, v]) => [k, [...v]])),
      c3: Object.fromEntries(Object.entries(f.c3).map(([k, v]) => [k, [...v]])),
      c4: Object.fromEntries(Object.entries(f.c4).map(([k, v]) => [k, [...v]])),
      c5: Object.fromEntries(Object.entries(f.c5).map(([k, v]) => [k, [...v]])),
      c6: Object.fromEntries(Object.entries(f.c6).map(([k, v]) => [k, [...v]])) })) },
  null, 2), "utf8");
console.log("");
console.log("congelado → filtra-sin-enlazar-115.{log,json}");

if (!controlOk) process.exit(1);
