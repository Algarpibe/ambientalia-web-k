// 133.ª · ESCALÓN 2 — LA PÉRDIDA DE LA OPCIÓN C, MEDIDA POR ELEMENTO
//
// El precedente del Tramo C de `HOSTS_PERMITIDOS` se firmó con *«cero pérdida
// medida»*, y el expediente de CMS-6 declara que **esa medición aquí NO está
// hecha** (§2o.9, «lo que el expediente NO contesta», punto 3). Es la condición
// de cierre de la decisión, no un extra.
//
// ── POR QUÉ POR ELEMENTO Y NO POR EL TOTAL (§regla 34) ─────────────────────
// «El campo mide 24 681 caracteres y el bloque tipado expresa 24 000» sería un
// total, y un total absorbe con el signo de «no pasa nada»: el `<form>` trae
// 286 trozos de texto visible y 17 `<input>`, y perder los 12 ocultos o los 269
// `<option>` da diferencias de tamaño MUY distinto con el mismo veredicto.
//
// ── LAS DOS PREGUNTAS, QUE NO SON LA MISMA ─────────────────────────────────
//   1. **frontera** — ¿sacar el `<form>` del campo se lleva contenido VECINO?
//      Se contesta con los índices, no con el tamaño;
//   2. **cobertura** — de lo que el `<form>` trae, ¿qué NO cabe en el bloque
//      tipado? Se contesta recorriendo EL DOCUMENTO, no los campos del modelo
//      (§*un campo opcional no expresa un caso*: un recorrido que sólo mira lo
//      que el modelo sabe leer no puede ver lo que no sabe leer).
//
// ── Y LA REFERENCIA SE DECLARA, PORQUE HAY DOS Y DAN NÚMEROS DISTINTOS ─────
// «Pérdida» contra el ORIGINAL y «pérdida» contra el CLON no son la misma
// afirmación (§*un denominador se escribe CON SU UNIDAD*). El clon lleva desde
// su spec una desviación ACEPTADA —«omitir reCAPTCHA», «submit → /es/contacto/,
// sin backend»— así que parte de lo que C «pierde» ya estaba perdido, y
// atribuírselo a C sería fabricar un bloqueo.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);
const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["modelo-ciego", "solo-el-total"];
if (SAB && !VALIDOS.includes(SAB)) throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
/**
 * ⚠ Lee la extracción **ANTES de CMS-6 · C**, no la canónica, y es deliberado:
 * esta derivación se pronuncia sobre el estado en que `codigo-arq` llevaba el
 * formulario como HTML crudo. Tras C la canónica es la post-C —`formulario-arq`,
 * 0 bloqueos— y leerla aquí no daría un error: daría OTRA MEDIDA con la misma
 * cara (§regla 5bis: arreglar el objeto no arregla sus medidas, las CADUCA).
 *
 * El nombre deriva del ESTADO, así que no se mueve con la siguiente corrida.
 */
const F35 = join(MED, "f35-extraido-ANTES-DE-CMS6-C.json");
const SPEC = join(RAIZ, "docs/research/monitor-calidad-aire/components/reutilizables.spec.md");
const CLON = join(RAIZ, "apps/web/src/components/monitor/CtaGuiaProyecto.tsx");
const faltan = [F35, SPEC, CLON].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`); process.exit(1); }

let ok = true;
const fallo = (m) => { ok = false; P(`   ❌ ${m}`); };

P("=".repeat(78));
P("133.ª · ESCALÓN 2 — la PÉRDIDA de la opción C, medida POR ELEMENTO");
P("=".repeat(78));

const f35 = JSON.parse(readFileSync(F35, "utf8"));
const rec = (n, out = []) => {
  if (Array.isArray(n)) { n.forEach((x) => rec(x, out)); return out; }
  if (n && typeof n === "object") { if (n.kind) out.push(n); for (const k of Object.keys(n)) rec(n[k], out); }
  return out;
};
const modulos = rec(f35.catalogo.arquetipos);
const codigos = modulos.filter((m) => m.kind === "codigo-arq");
if (codigos.length !== 1) fallo(`esperaba 1 \`codigo-arq\` en el lote, hay ${codigos.length}`);
const H = codigos[0]?.contenido ?? "";

/* ════════════════════════════════════════════════════════════════════════
 * 1 · FRONTERA — ¿se lleva contenido VECINO?
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 1 · FRONTERA — ¿sacar el <form> se lleva contenido vecino del mismo campo?");

const iIni = H.indexOf("<form");
const iFin = H.lastIndexOf("</form>");
const antes = iIni >= 0 ? H.slice(0, iIni) : H;
const despues = iFin >= 0 ? H.slice(iFin + "</form>".length) : "";
const nForms = (H.match(/<form\b/gi) ?? []).length;

P(`   campo \`codigo-arq.contenido\` .... ${H.length} caracteres`);
P(`   <form> ......................... ${nForms}   (cierres ${(H.match(/<\/form>/gi) ?? []).length})`);
P(`   ANTES del <form> ............... ${antes.length} caracteres  ${JSON.stringify(antes.slice(0, 40))}`);
P(`   DESPUÉS del </form> ............ ${despues.length} caracteres  ${JSON.stringify(despues.slice(0, 40))}`);
const vecino = antes.trim().length + despues.trim().length;
P(`\n   ⇒ contenido VECINO que se llevaría: **${vecino} caracteres**`);
if (vecino === 0) P(`     el campo ES el formulario, de principio a fin. Frontera limpia.`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · COBERTURA — recorriendo EL DOCUMENTO, no el modelo
 *
 * El bloque tipado que la 132.ª especificó: «destino · método · campos
 * visibles · ocultos» (+ botón). Aquí se enumera TODO lo que el `<form>` trae
 * y se adjudica cada pieza a un campo del modelo o al cubo de PÉRDIDA.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 2 · COBERTURA — qué trae el <form> y dónde cae cada pieza");

const piezas = [];
const anota = (que, n, destino, nota = "") => piezas.push({ que, n, destino, nota });

/* ── lo que el modelo EXPRESA ── */
const action = /<form[^>]*\baction="([^"]*)"/i.exec(H)?.[1] ?? null;
const metodo = /<form[^>]*\bmethod="([^"]*)"/i.exec(H)?.[1] ?? null;
anota("`action` (destino)", action ? 1 : 0, "destino", action ?? "");
anota("`method`", metodo ? 1 : 0, "metodo", metodo ?? "");

const labels = [...H.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/gi)]
  .map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
anota("`<label>` con texto", labels.length, "campos[].etiqueta");

const visibles = [...H.matchAll(/<input\b(?![^>]*type="hidden")[^>]*>/gi)];
anota("`<input>` visibles", visibles.length, "campos[]");

const selects = [...H.matchAll(/<select[\s\S]*?<\/select>/gi)].map((m) => m[0]);
anota("`<select>`", selects.length, "campos[] tipo select");
const opciones = selects.reduce((a, s) => a + (s.match(/<option/gi) ?? []).length, 0);
anota("`<option>`", opciones, "campos[].opciones[]");

const ocultos = [...H.matchAll(/<input[^>]*type="hidden"[^>]*>/gi)].map((m) => ({
  nombre: /name="([^"]*)"/.exec(m[0])?.[1] ?? null,
  valor: /value="([^"]*)"/.exec(m[0])?.[1] ?? null,
}));
anota("`<input type=hidden>`", ocultos.length, "ocultos[]", ocultos.map((o) => o.nombre).join(" "));

const boton = /<button[^>]*>([\s\S]*?)<\/button>/i.exec(H)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
anota("`<button>` (texto)", boton ? 1 : 0, "textoBoton", boton ?? "");

const legend = /<legend[^>]*>([\s\S]*?)<\/legend>/i.exec(H)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
anota("`<fieldset>`+`<legend>`", legend ? 1 : 0, "campos[] tipo casillas", legend ?? "");

/* ── lo que el modelo NO expresa ── */
const recaptcha = (H.match(/g-recaptcha/gi) ?? []).length;
anota("`div.g-recaptcha` + `data-sitekey`", recaptcha, "PÉRDIDA", "desviación YA aceptada: spec §2d «omitir en el clon»");

const clasesForm = [...new Set([...H.matchAll(/class="([^"]*)"/gi)].flatMap((m) => m[1].split(/\s+/)).filter((c) => /^_/.test(c)))];
anota("clases `_form*` (andamiaje)", clasesForm.length, "PÉRDIDA", "presentación del plugin; el clon pinta la suya (spec §2d)");

const novalidate = /<form[^>]*\bnovalidate/i.test(H) ? 1 : 0;
const stylesVer = /data-styles-version="([^"]*)"/.exec(H)?.[1] ?? null;
anota("`novalidate`", novalidate, "PÉRDIDA", "atributo del plugin");
anota("`data-styles-version`", stylesVer ? 1 : 0, "PÉRDIDA", `valor ${stylesVer}`);
/**
 * ⚠ El `id` NO se pierde: se RECUPERA de los ocultos. `id="_form_106_"` y los
 * ocultos `u`/`f` valen los tres `106`, así que el bloque tipado lo reconstruye
 * —`_form_${u}_`— sin necesidad de un campo propio. Antes de fichar una pérdida
 * se comprueba si otra pieza del modelo ya la porta; si no, se ficha una
 * pérdida que no existe.
 */
const idNum = /<form[^>]*id="_form_(\d+)_"/i.exec(H)?.[1] ?? null;
const uOculto = ocultos.find((o) => o.nombre === "u")?.valor ?? null;
const fOculto = ocultos.find((o) => o.nombre === "f")?.valor ?? null;
const idRecuperable = idNum != null && idNum === uOculto && idNum === fOculto;
const idForm = /<form[^>]*\bid="([^"]*)"/i.exec(H)?.[1] ?? null;
anota(
  "`id` del form",
  idForm ? 1 : 0,
  idRecuperable ? "RECUPERABLE de ocultos[]" : "PÉRDIDA",
  idRecuperable ? `${idForm} = \`_form_\${u}_\` con u=f=${uOculto}` : `${idForm} — identificador de ActiveCampaign`,
);

P("\n   pieza                                    n     destino");
for (const p of piezas)
  P(`   ${p.que.padEnd(38)} ${String(p.n).padStart(4)}  ${p.destino}${p.nota ? `  — ${String(p.nota).slice(0, 60)}` : ""}`);

const perdidas = piezas.filter((p) => p.destino === "PÉRDIDA");
const nPerdidas = perdidas.reduce((a, p) => a + p.n, 0);
const nExpresadas = piezas.filter((p) => p.destino !== "PÉRDIDA").reduce((a, p) => a + p.n, 0);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · EL TEXTO VISIBLE — la unidad de §regla 1 (fidelidad)
 *
 * Lo de arriba cuenta ELEMENTOS. La fidelidad se mide en lo que el visitante
 * VE, así que va aparte y con su propio cardinal.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · EL TEXTO VISIBLE — la unidad en la que §regla 1 se pronuncia");

/**
 * ⚠ Las etiquetas se sustituyen por un SEPARADOR antes de partir: sin él, dos
 * textos separados sólo por marcado se pegarían en un trozo que no existe.
 *
 * Y el separador se escribe con `String.fromCharCode`, no con un escape ni con
 * el carácter literal: el literal es frágil en un fuente y el escape lo perdió
 * un `sed` —quedó `"0001"`, un separador que casi nunca casa, y la corrida
 * salió **EXIT 0** con 3 trozos en vez de 286—. §regla 13 cobrada sobre el
 * fichero que la cita.
 */
const SEP = String.fromCharCode(1);
const trozos = H.replace(/<[^>]+>/g, SEP).split(SEP).map((s) => s.trim()).filter(Boolean);
const clon = readFileSync(CLON, "utf8");
const countries = readFileSync(join(RAIZ, "apps/web/src/lib/countries.ts"), "utf8");
const monitor = readFileSync(join(RAIZ, "apps/web/src/lib/monitor.ts"), "utf8");
const textoClon = clon + countries + monitor;

/**
 * SABOTAJE `modelo-ciego`: el buscador no encuentra nada en el clon. Si el
 * veredicto NO cambia, la comprobación no ejercita el canal (§regla 28a).
 */
const buscaEn = SAB === "modelo-ciego" ? "" : textoClon;
const norm = (s) => s.replace(/\s+/g, " ").trim();
const fuera = trozos.filter((t) => !buscaEn.includes(norm(t)));

P(`   trozos de texto visible en el <form> ..... ${trozos.length}  (${trozos.join("").length} caracteres)`);
P(`   de ellos, presentes en el CLON hoy ....... ${trozos.length - fuera.length}`);
P(`   NO presentes en el clon .................. ${fuera.length}   ${fuera.slice(0, 8).map((t) => JSON.stringify(t.slice(0, 30))).join(" ")}`);

/* ════════════════════════════════════════════════════════════════════════
 * 4 · LA PÉRDIDA, CONTRA CADA REFERENCIA
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 4 · LA PÉRDIDA — contra cada referencia, porque dan números distintos");

const yaAceptada = perdidas.filter((p) => /YA aceptada|spec §2d/.test(p.nota));
const nYaAceptada = yaAceptada.reduce((a, p) => a + p.n, 0);
const introduceC = nPerdidas - nYaAceptada;

P(`   ── contra el CLON (lo que el sitio sirve hoy) ──`);
P(`   texto visible perdido ......................... ${fuera.length} de ${trozos.length}`);
P(`   piezas funcionales perdidas ................... 0  (destino, método, ocultos y opciones SÍ los expresa el bloque tipado)`);
P(`\n   ── contra el ORIGINAL ──`);
P(`   piezas del <form> que el modelo NO expresa .... ${nPerdidas}`);
P(`      de ellas, desviación YA ACEPTADA antes de C .. ${nYaAceptada}  (${yaAceptada.map((p) => p.que).join(", ")})`);
P(`      **las que C introduce de nuevo** ............. ${introduceC}`);
for (const p of perdidas.filter((x) => !yaAceptada.includes(x)))
  P(`         · ${p.que} (${p.n}) — ${p.nota}`);

/* ════════════════════════════════════════════════════════════════════════
 * 4b · LO QUE LA COMPROBACIÓN REUTILIZADA **NO** CONTESTA
 *
 * El encargo manda reutilizar el «¿queda contenido SIN SITIO?» de la 131.ª y
 * decir si su veredicto cambia. **No cambia: 0 en los dos mapeos.** Y ese
 * empate es justo lo que hay que mirar dos veces (§*un verde vale lo que valen
 * sus instancias SEPARADORAS, no lo que vale su recuento*).
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 4b · lo que la comprobación de la 131.ª NO contesta");

const SS_PRE = join(DERIV, "sin-sitio-131.json");
const SS_POST = join(DERIV, "sin-sitio-133-POST-C.json");
let separadoras = null;
if (existsSync(SS_PRE) && existsSync(SS_POST)) {
  /**
   * ⚠ Se comparan EL VEREDICTO Y SU REPARTO, no el fichero entero — §*la causa
   * común: el NIVEL al que se mide*, con el contenedor puesto en el JSON.
   *
   * La v1 comparaba todo el documento y publicó `separadoras: 0` y luego `1`
   * **sin que el mapeo cambiara**: lo que se movió fue el detalle de un control
   * (`11 bloques` → `12`, por el alta de `formulario-arq`), que es del ESQUEMA
   * y no de la pregunta. Un detector que absorbe diferencias ajenas da un
   * número que parece del objeto.
   */
  const veredicto = (p) => {
    const o = JSON.parse(readFileSync(p, "utf8"));
    return JSON.stringify({ resumen: o.resumen, informe: o.informe });
  };
  separadoras = veredicto(SS_PRE) === veredicto(SS_POST) ? 0 : 1;
  P(`   veredicto con \`et_pb_code → codigo-arq\`   (PRE-C) .... SIN SITIO = 0`);
  P(`   veredicto con \`et_pb_code → formulario-arq\` (POST-C) .. SIN SITIO = 0`);
  P(`   veredicto + reparto por documento idénticos .......... ${separadoras === 0 ? "SÍ" : "no"}`);
  P(`   ⇒ **instancias SEPARADORAS entre los dos modelos: ${separadoras}**`);
}

/**
 * Y el MECANISMO del empate, medido y no deducido: N3 pregunta *«¿tiene este
 * bloque un campo de la lista `contenido|titulo|texto|alt`?»* y casa por
 * NOMBRE. `formulario-arq` trae un campo llamado `texto` —el rótulo de una
 * `<option>`, anidado en `opciones[]`— así que N3 pasa por una coincidencia de
 * nombre, no porque el modelo exprese el contenido del módulo.
 */
const BLOQUES_TS = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
let porQuePasa = null;
if (existsSync(BLOQUES_TS)) {
  const fuente = readFileSync(BLOQUES_TS, "utf8");
  const marcas = [...fuente.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => ({ slug: m[1], i: m.index }));
  const k = marcas.findIndex((m) => m.slug === "formulario-arq");
  if (k >= 0) {
    const cuerpo = fuente.slice(marcas[k].i, k + 1 < marcas.length ? marcas[k + 1].i : fuente.length);
    const campos = new Set();
    for (const m of cuerpo.matchAll(/\b(?:campoHtml|htmlLinea|subida|enlace)\(\s*"([a-zA-Z]+)"/g)) campos.add(m[1]);
    for (const m of cuerpo.matchAll(/\{\s*name:\s*"([a-zA-Z]+)",\s*type:\s*"(text|textarea|number|checkbox)"/g)) campos.add(m[1]);
    porQuePasa = ["contenido", "titulo", "texto", "alt"].filter((c) => campos.has(c));
    P(`\n   por qué PASA \`formulario-arq\` en N3: casa por **${porQuePasa.join(", ") || "(nada)"}**`);
    P(`   y ese \`texto\` es el rótulo de una \`<option>\` dentro de \`opciones[]\`, no el canal del módulo.`);
  }
}
P(`\n   ⇒ el verde de la 131.ª es cierto DE LO QUE MIDE y **no adjudica C**.`);
P(`     Lo que adjudica C es el reparto por elemento de arriba, no este 0.`);

/* ════════════════════════════════════════════════════════════════════════
 * 5 · CONTROLES
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 5 · CONTROLES");

if (trozos.length > 200) P(`   ✅ §sondas 4bis · el recorrido VE el documento (${trozos.length} trozos) — un 0 es del dato`);
else fallo(`§sondas 4bis · sólo ${trozos.length} trozos: un 0 sería del instrumento`);

/** §regla 28c · TESTIGOS: casos conocidos de antemano, en las DOS direcciones. */
const TESTIGOS = [
  { nombre: "está en el clon · «DESCARGAR»", t: "DESCARGAR", esperado: true },
  { nombre: "está en el clon · «Afghanistan»", t: "Afghanistan", esperado: true },
  { nombre: "está en el clon · «Nombre y Apellidos*»", t: "Nombre y Apellidos*", esperado: true },
  { nombre: "NO está en el clon · el hash de AC", t: "3898163d1495aca8c8346e0fc40de428", esperado: false },
  { nombre: "NO está en el clon · la sitekey", t: "6LcwIw8TAAAAACP1ysM08EhCgzd6q5JAOUR1a0Go", esperado: false },
];
let vivos = 0;
for (const t of TESTIGOS) {
  const r = buscaEn.includes(t.t);
  if (r === t.esperado) vivos++;
  else fallo(`testigo MUERTO — ${t.nombre}: esperado ${t.esperado}, dio ${r}`);
}
if (vivos === TESTIGOS.length) P(`   ✅ §regla 28c · los ${vivos} TESTIGOS viven, en las dos direcciones`);

if (SAB === "solo-el-total") {
  P(`   (sabotaje: se publica sólo el total, sin reparto por elemento)`);
  fallo("§regla 34 · el veredicto se dio POR EL TOTAL: un total absorbe con el signo de «no pasa nada»");
}

if (piezas.length >= 12) P(`   ✅ §regla 34 · el reparto es POR ELEMENTO: ${piezas.length} piezas con su cardinal, no un total`);
else fallo(`§regla 34 · sólo ${piezas.length} piezas enumeradas: el reparto no discrimina`);

if (nExpresadas > 0 && nPerdidas > 0) P(`   ✅ el reparto DISCRIMINA: ${nExpresadas} piezas expresadas y ${nPerdidas} no — no es un pleno ni un cero (§sondas 4)`);
else fallo(`reparto degenerado: expresadas ${nExpresadas}, perdidas ${nPerdidas}`);

P("\n" + "=".repeat(78));
P(ok
  ? `VEREDICTO · vecino ${vecino} car · texto visible perdido ${fuera.length} de ${trozos.length} · piezas que C introduce de nuevo: ${introduceC}`
  : "VEREDICTO · ❌ algún control cae — la pérdida NO está medida");
P("=".repeat(78));

const salida = {
  meta: { tanda: "133.ª", escalon: "ESCALÓN 2", fecha: new Date().toISOString(), saboteada: SAB },
  frontera: { campo: H.length, nForms, antes: antes.length, despues: despues.length, vecino },
  cobertura: { piezas, expresadas: nExpresadas, perdidas: nPerdidas },
  textoVisible: { trozos: trozos.length, caracteres: trozos.join("").length, fueraDelClon: fuera },
  perdida: {
    contraElClon: { textoVisible: fuera.length, funcional: 0 },
    contraElOriginal: { total: nPerdidas, yaAceptadaAntesDeC: nYaAceptada, introduceC },
  },
  /** §regla 14 · la limitación de la comprobación reutilizada, CON SU NÚMERO. */
  sinSitioReutilizada: {
    veredictoPreC: 0,
    veredictoPostC: 0,
    separadoras,
    pasaPor: porQuePasa,
    nota: "N3 casa por NOMBRE de campo; `formulario-arq` trae `texto` (rótulo de <option>). El verde no adjudica C.",
  },
  controles: { testigosVivos: vivos, testigosTotal: TESTIGOS.length, ok },
};

const { writeFileSync } = await import("node:fs");
let nombre = SAB ? `perdida-133-neg-${SAB}.json` : "perdida-133.json";
const cuerpo = JSON.stringify(salida, null, 1);
const sinFecha = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const destino = join(DERIV, nombre);
if (!SAB && !process.env.PISAR && existsSync(destino)
    && sinFecha(readFileSync(destino, "utf8")) !== sinFecha(cuerpo)) {
  const hoy = new Date().toISOString().slice(0, 10);
  let n = `perdida-133-${hoy}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `perdida-133-${hoy}-${++i}.json`;
  console.log(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  nombre = n;
}
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada → derivaciones/${nombre}`);

process.exit(ok ? 0 : 2);
