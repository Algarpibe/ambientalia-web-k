// 132.ª · ESCALÓN 2 — LA EVIDENCIA DE CADA CLASE, con los MISMOS campos
//
// `CLAUDE.md` cita el censo: una clase «se admite AÑADIÉNDOLA con su evidencia,
// no colándola». Esto es esa evidencia. Cinco fichas, los mismos cinco campos,
// para que se puedan comparar:
//
//   · cardinal ......... tokens · bloqueos · campos · documentos, con denominador
//   · el ORIGINAL ...... qué hace con ella, leído de la SALIDA SERVIDA
//   · el CLON .......... ¿la sirve? ¿la ejecuta algo?
//   · el EDITOR ........ qué amplía en concreto si se admite
//   · el DOMINIO ....... dónde se censó la regla, y si ese dominio EJERCITA el caso
//
// ⚠ El último es el que cambia el marco, y se contesta MIDIENDO: se cuentan las
// apariciones de cada token en el corpus que el censo recorrió (grupo A
// transformado + grupo C + articulos-kb). Un token con 0 apariciones ahí está
// **SIN PROBAR** para ese caso —el censo no lo excluyó, no lo vio—; uno con >0
// sí fue mirado y quedó fuera, y eso es otra afirmación.
//
// El expediente DESCRIBE. No recomienda: la decisión es del propietario.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const CORPUS = join(RAIZ, "corpus/productos");
const TRANSFORMADO = join(RAIZ, "corpus/transformado");
const SRC = join(RAIZ, "apps/web/src");
const P = (...a) => console.log(...a);
const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["dominio-mudo", "sin-corpus-c"];
if (SAB && !VALIDOS.includes(SAB)) throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const CLASES132 = join(DERIV, "clases-132.json");
const C_EXTRAIDO = join(MED, "c-extraido.json");
const KB_EXTRAIDO = join(MED, "kb-extraido.json");
const faltan = [CLASES132, C_EXTRAIDO, KB_EXTRAIDO, TRANSFORMADO, CORPUS, SRC].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`); process.exit(1); }

const D = JSON.parse(readFileSync(CLASES132, "utf8"));

P("=".repeat(78));
P("132.ª · ESCALÓN 2 — la ficha de cada clase, con los mismos cinco campos");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO DEL CENSO — reconstruido igual que `atributos-censo.mjs`
 * ══════════════════════════════════════════════════════════════════════ */
const regiones = [];
for (const col of readdirSync(TRANSFORMADO)) {
  const dir = join(TRANSFORMADO, col);
  for (const f of readdirSync(dir))
    regiones.push({ grupo: "A", pagina: `${col}/${f.replace(/\.html$/, "")}`, html: readFileSync(join(dir, f), "utf8") });
}
const RICAS_C = ["necesidad", "solucion", "resultados", "destacado", "detalles.parametros", "cuerpo"];
const enRuta = (o, r) => r.split(".").reduce((x, k) => x?.[k], o);
if (SAB !== "sin-corpus-c") {
  const C = JSON.parse(readFileSync(C_EXTRAIDO, "utf8"));
  for (const [col, filas] of Object.entries(C.catalogo ?? {}))
    for (const d of filas)
      for (const campo of RICAS_C) {
        const v = enRuta(d, campo);
        if (typeof v === "string" && v) regiones.push({ grupo: "C", pagina: `${col}/${d.slug}`, html: v });
      }
}
const KB = JSON.parse(readFileSync(KB_EXTRAIDO, "utf8"));
(function bajaKb(o, pag) {
  if (typeof o === "string") { if (/<[a-z]/i.test(o)) regiones.push({ grupo: "KB", pagina: pag, html: o }); return; }
  if (Array.isArray(o)) { for (const x of o) bajaKb(x, pag); return; }
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) bajaKb(v, o.slug ? `kb/${o.slug}` : pag);
})(KB.catalogo ?? KB, "kb");

const paginasCenso = new Set(regiones.map((r) => r.pagina));
P(`\n## 1 · EL DOMINIO DEL CENSO, reconstruido`);
P(`   ${regiones.length} regiones ricas · ${paginasCenso.size} páginas`);
for (const g of ["A", "C", "KB"])
  P(`     grupo ${g.padEnd(3)} ${String(regiones.filter((r) => r.grupo === g).length).padStart(4)} regiones · ${new Set(regiones.filter((r) => r.grupo === g).map((r) => r.pagina)).size} páginas`);

/**
 * ⚠⚠ EL CONTROL DE ESTE INSTRUMENTO SON LOS TESTIGOS, Y NO ES OPCIONAL.
 *
 * La medición de abajo va a decir «0 apariciones» para muchos tokens, y §sondas
 * 4 manda que la primera hipótesis ante un cero —y sobre todo ante un 100 %
 * redondo— sea el INSTRUMENTO. La forma de separar «el corpus no lo trae» de «mi
 * regex no casa» es un CASO CONOCIDO DE ANTEMANO: tokens que SÍ están en ese
 * corpus, medidos con la MISMA función. Si los testigos salen a 0, el cero de
 * los 43 no vale y la corrida NO ADJUDICA.
 *
 * Los testigos se eligen de las propias listas censadas —`href`/`style`/`class`/
 * `data-start` de ATRIBUTOS_CENSADOS, `p`/`a`/`img`/`strong` de
 * ETIQUETAS_CENSADAS—, o sea del conjunto que el censo declara haber visto.
 */
const TESTIGOS = [
  { token: "href", eje: "atributo" }, { token: "style", eje: "atributo" },
  { token: "class", eje: "atributo" }, { token: "data-start", eje: "atributo" },
  { token: "p", eje: "etiqueta" }, { token: "a", eje: "etiqueta" },
  { token: "img", eje: "etiqueta" }, { token: "strong", eje: "etiqueta" },
];

/** ¿Aparece el token en el dominio del censo? Etiqueta o atributo, según su eje. */
function apariciones(token, eje) {
  const re = eje === "etiqueta"
    ? new RegExp(`<\\/?${token}(?=[\\s/>])`, "gi")
    : new RegExp(`\\s${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`, "gi");
  let n = 0; const pags = new Set();
  for (const r of regiones) {
    const m = r.html.match(re);
    if (m) { n += m.length; pags.add(r.pagina); }
  }
  return { n, paginas: pags.size };
}

/* ── ⚠ LOS DOS CENSOS TIENEN DOMINIOS DISTINTOS, Y HAY QUE CRUZAR EL SUYO ──
 *
 * `ETIQUETAS_CENSADAS` (43) sale de `a-censo` — el `post_content` SERVIDO de las
 * 209 páginas del arquetipo A. `ATRIBUTOS_CENSADOS` (81) sale de
 * `atributos-censo` — el corpus TRANSFORMADO + C + KB. Son dos dominios, y medir
 * las etiquetas contra el transformado contestaría la pregunta del otro censo
 * (§*una medida contesta las preguntas que se le hicieron*).
 *
 * Para las etiquetas se cruza contra su propia congelada, que publica el
 * inventario con su cardinal por etiqueta: si una etiqueta bloqueada estuviera
 * ahí, el censo SÍ la vio y la dejó fuera —otra afirmación—.
 */
const A_CENSO = join(MED, "a-censo.json");
if (!existsSync(A_CENSO)) { console.error("PRECONDICION: falta a-censo.json"); process.exit(1); }
const inventarioA = JSON.parse(readFileSync(A_CENSO, "utf8")).inventarioGlobal ?? {};
P(`\n## 1a · EL CENSO DE ETIQUETAS tiene OTRO dominio: \`a-censo\`, post_content servido de 209 páginas`);
P(`   inventario global: ${Object.keys(inventarioA).length} etiquetas distintas`);

/* ── LOS TESTIGOS, ANTES DE MEDIR NADA ───────────────────────────────────── */
P(`\n## 1b · TESTIGOS — el control que decide si un 0 es del corpus o de mi regex`);
const testigos = TESTIGOS.map((t) => ({ ...t, ...(SAB === "dominio-mudo" ? { n: 0, paginas: 0 } : apariciones(t.token, t.eje)) }));
for (const t of testigos)
  P(`   ${t.token.padEnd(12)} (${t.eje.padEnd(8)}) ${String(t.n).padStart(6)} apariciones en ${String(t.paginas).padStart(3)} de ${paginasCenso.size} páginas`);
const testigosVivos = testigos.filter((t) => t.n > 0).length;
P(`   → ${testigosVivos} de ${testigos.length} testigos vivos ${testigosVivos === testigos.length ? "· el instrumento VE el corpus, así que un 0 es del CORPUS" : "· ❌ el instrumento NO ve: ningún 0 de abajo adjudica"}`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LAS CINCO FICHAS
 * ══════════════════════════════════════════════════════════════════════ */
const tokenEje = new Map();
for (const b of D.bloqueos) for (const t of b.hit) if (!tokenEje.has(t)) tokenEje.set(t, b.eje);

/** El original: dónde vive cada token, leído del corpus servido de los 4 docs. */
const DOCS = ["monitor-calidad-aire", "accesorios", "software-de-medicion-calidad-del-aire", "kunak-api"];
const crudos = Object.fromEntries(DOCS.map((s) => [s, readFileSync(join(CORPUS, `${s}.html`), "utf8")]));
function portadores(token, eje) {
  const out = new Set();
  for (const html of Object.values(crudos)) {
    const re = eje === "etiqueta"
      ? new RegExp(`<${token}(?=[\\s/>])[^>]*>`, "gi")
      : new RegExp(`<([a-z][a-z0-9-]*)((?:\\s+[^\\s=/>]+(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s"'>]+))?)*\\s+${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^>]*)>`, "gi");
    for (const m of html.matchAll(re)) out.add(eje === "etiqueta" ? token : m[1].toLowerCase());
  }
  return [...out].sort();
}

/** El clon: ¿emite el token? Barrido de `apps/web/src` (§regla 9: se deriva). */
const fuentes = [];
(function baja(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) baja(p);
    else if (/\.(tsx?|css)$/.test(f.name)) fuentes.push({ p: p.slice(RAIZ.length + 1).replace(/\\/g, "/"), s: readFileSync(p, "utf8") });
  }
})(SRC);
function enElClon(token, eje) {
  const re = eje === "etiqueta"
    ? new RegExp(`<${token}(?=[\\s/>\\n])`, "g")
    : new RegExp(`(?:^|\\s|\\{)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[=:]`, "g");
  const hits = fuentes.filter((f) => re.test(f.s)).map((f) => f.p);
  return hits;
}

const CLASES_ORDEN = ["formulario", "data-* del constructor", "schema.org", "aria de tabla", "estructura HTML5"];
const rep = D.porClase.funcion;
const fichas = [];

for (const clase of CLASES_ORDEN) {
  const x = rep[clase];
  if (!x) { P(`\n## FICHA · ${clase} — 0 de ${D.denominadores.bloqueos} bloqueos (clase declarada, sin instancias)`); continue; }
  P(`\n${"═".repeat(78)}`);
  P(`## FICHA · ${clase.toUpperCase()}`);
  P("═".repeat(78));

  /* — 1 · CARDINAL, cada uno con su denominador — */
  P(`\n### cardinal`);
  P(`   tokens ..... ${String(x.tokens.length).padStart(3)} de ${D.denominadores ? Object.keys(tokenEje).length || "" : ""}${43}`);
  P(`   bloqueos ... ${String(x.bloqueos).padStart(3)} de ${D.denominadores.bloqueos}   (exclusivos ${x.exclusivos})`);
  P(`   campos ..... ${String(x.campos).padStart(3)} de ${D.denominadores.camposHtml}`);
  P(`   documentos . ${String(x.documentos.length).padStart(3)} de ${DOCS.length}  → ${x.documentos.join(", ")}`);
  P(`   kinds ...... ${String(x.kinds.length).padStart(3)} de ${D.denominadores.kindsTocados.length}  → ${x.kinds.join(", ")}`);

  /* — 2 · EL ORIGINAL: qué elementos la portan, leído de lo servido — */
  P(`\n### qué hace el ORIGINAL con ella (leído de la salida servida)`);
  const porToken = [];
  for (const t of x.tokens) {
    const eje = tokenEje.get(t) ?? "atributo";
    const port = portadores(t, eje);
    porToken.push({ token: t, eje, portadores: port });
    P(`   ${t.padEnd(34)} (${eje}) → ${port.length ? port.map((e) => `<${e}>`).join(" ") : "(no localizado en el crudo)"}`);
  }

  /* — 3 · EL CLON hoy — */
  P(`\n### qué hace el CLON hoy`);
  const enClon = [];
  for (const t of x.tokens) {
    const hits = enElClon(t, tokenEje.get(t) ?? "atributo");
    if (hits.length) enClon.push({ token: t, ficheros: hits });
  }
  if (!enClon.length) P(`   0 de ${x.tokens.length} tokens aparecen en apps/web/src — el clon NO los emite`);
  else for (const e of enClon) P(`   ${e.token.padEnd(34)} → ${e.ficheros.slice(0, 3).join(" · ")}${e.ficheros.length > 3 ? ` (+${e.ficheros.length - 3})` : ""}`);

  /* — 5 · EL DOMINIO: ¿lo ejercita? — MEDIDO, que es lo que cambia el marco — */
  P(`\n### el DOMINIO del censo, ¿EJERCITA el caso?`);
  const dominio = [];
  for (const t of x.tokens) {
    const eje = tokenEje.get(t) ?? "atributo";
    const a = SAB === "dominio-mudo" ? { n: 0, paginas: 0 } : apariciones(t, eje);
    /* Cada eje contra SU censo: la etiqueta contra `a-censo` (209 páginas
       servidas), el atributo contra el corpus que `atributos-censo` recorrió. */
    const enA = eje === "etiqueta" ? (SAB === "dominio-mudo" ? null : inventarioA[t] ?? null) : undefined;
    dominio.push({ token: t, eje, ...a, enCensoDeEtiquetas: enA });
    const suCenso = eje === "etiqueta"
      ? (enA ? `a-censo: ${enA.total} en ${enA.paginas} de 209` : "a-censo: NO está en el inventario de 209")
      : `${a.n} apariciones en ${a.paginas} de ${paginasCenso.size} páginas`;
    const vio = eje === "etiqueta" ? !!enA : a.n > 0;
    P(`   ${t.padEnd(34)} ${suCenso.padEnd(44)} ${vio ? "← el censo SÍ lo vio y quedó fuera" : "← SIN PROBAR (el censo no lo vio)"}`);
  }
  const nunca = dominio.filter((d) => (d.eje === "etiqueta" ? !d.enCensoDeEtiquetas : d.n === 0));
  P(`\n   → ${nunca.length} de ${x.tokens.length} tokens NO aparecen ni una vez en el dominio del censo`);
  P(`   → veredicto de alcance: ${nunca.length === x.tokens.length ? "**SIN PROBAR ENTERA** — la regla nunca vio esta clase"
      : nunca.length === 0 ? "el censo la vio ENTERA y la dejó fuera" : `MIXTA — ${x.tokens.length - nunca.length} vistos · ${nunca.length} no vistos`}`);

  fichas.push({ clase, cardinal: { tokens: x.tokens.length, bloqueos: x.bloqueos, exclusivos: x.exclusivos, campos: x.campos, documentos: x.documentos, kinds: x.kinds }, tokens: x.tokens, original: porToken, clon: enClon, dominio, sinProbar: nunca.map((d) => d.token) });
}

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LA SUPERFICIE DE `formulario` — lo que las otras cuatro no necesitan
 * ══════════════════════════════════════════════════════════════════════ */
P(`\n${"═".repeat(78)}`);
P("## LA SUPERFICIE DE `formulario` — qué pasa exactamente si un editor lo escribe");
P("═".repeat(78));
const mon = crudos["monitor-calidad-aire"];
const formTag = /<form\b[^>]*>/i.exec(mon)?.[0] ?? "(no hay <form>)";
P(`\n### el <form> del original, verbatim`);
P(`   ${formTag}`);
const action = /\baction="([^"]*)"/i.exec(formTag)?.[1];
const metodo = /\bmethod="([^"]*)"/i.exec(formTag)?.[1];
let host = "(sin action)";
try { host = new URL(action, "https://kunakair.com/").host; } catch { host = "(url ilegible)"; }
P(`   destino ..... ${action ?? "(sin action)"}`);
P(`   host ........ ${host}  ${host.endsWith("kunakair.com") ? "(propio)" : "← TERCERO"}`);
P(`   método ...... ${metodo ?? "(por defecto: GET)"}`);
P(`   ¿el host está en HOSTS_PERMITIDOS? — esa allowlist SÓLO mira <iframe>, no <form>`);

P(`\n### qué se envía — los campos, uno a uno`);
const campos = [...mon.matchAll(/<input\b[^>]*>/gi)].map((m) => m[0]);
const nombreDe = (t) => /\bname="([^"]*)"/i.exec(t)?.[1];
const tipoDe = (t) => (/\btype="([^"]*)"/i.exec(t)?.[1] ?? "text");
const visibles = campos.filter((c) => tipoDe(c) !== "hidden");
const ocultos = campos.filter((c) => tipoDe(c) === "hidden");
P(`   ${campos.length} <input> · ${visibles.length} visibles · ${ocultos.length} OCULTOS`);
for (const c of visibles) P(`     visible  ${String(tipoDe(c)).padEnd(9)} name=${nombreDe(c)}`);
for (const c of ocultos) P(`     oculto   ${String(tipoDe(c)).padEnd(9)} name=${nombreDe(c)}  value=${(/\bvalue="([^"]*)"/i.exec(c)?.[1] ?? "").slice(0, 40)}`);
const selects = [...mon.matchAll(/<select\b[^>]*>/gi)].map((m) => nombreDe(m[0]));
P(`   ${selects.length} <select>: ${selects.join(" · ")} · ${(mon.match(/<option/gi) ?? []).length} <option>`);

P(`\n### reCAPTCHA — qué hace \`data-sitekey\` sin backend`);
const rec = /<div[^>]*class="[^"]*g-recaptcha[^"]*"[^>]*>/i.exec(mon)?.[0];
P(`   portador ...... ${rec ? rec.replace(/data-sitekey="([^"]{8})[^"]*"/, 'data-sitekey="$1…"') : "(no localizado)"}`);
P(`   la clave es PÚBLICA por diseño (va en el HTML servido de cualquier sitio con reCAPTCHA)`);
const scriptsRecaptcha = (mon.match(/<script[^>]*recaptcha[^>]*>/gi) ?? []).length;
P(`   <script> de reCAPTCHA en el documento ... ${scriptsRecaptcha}`);

P(`\n### ⚠ EL CAMPO QUE ENTRARÍA AL CMS NO ES ESE HTML: \`A.limpia()\` YA QUITÓ LOS <script>`);
const inner = /<div[^>]*class="[^"]*et_pb_code_inner[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i.exec(mon);
const nScriptsDoc = (mon.match(/<script\b/gi) ?? []).length;
P(`   <script> en el documento entero ......... ${nScriptsDoc}`);
P(`   <script> que sobreviven al campo ........ 0  (eje \`script\`: 0 de ${D.denominadores.camposHtml} campos)`);
P(`   → el HTML que entraría es el <form> SIN sus scripts: validación, reCAPTCHA`);
P(`     y envío AJAX se quedan fuera. Es §*un marcado y el <script> que lo REPARA`);
P(`     son una unidad; media unidad es un defecto que el original no tiene*.`);

P(`\n### qué hace el CLON hoy con este mismo formulario`);
const cta = join(SRC, "components/monitor/CtaGuiaProyecto.tsx");
if (existsSync(cta)) {
  const s = readFileSync(cta, "utf8");
  P(`   apps/web/src/components/monitor/CtaGuiaProyecto.tsx — EXISTE`);
  P(`     <form> reconstruido en TSX ......... ${/(<form)/.test(s) ? "sí" : "no"}`);
  P(`     postea a ActiveCampaign ........... ${/activehosted/.test(s) ? "sí" : "NO"}`);
  P(`     carga reCAPTCHA ................... ${/recaptcha|sitekey/i.test(s) ? "sí" : "NO"}`);
  P(`     destino del submit ................ ${/CONTACT_HREF/.test(s) ? "CONTACT_HREF (contacto propio)" : "(otro)"}`);
  P(`   → el clon YA resolvió este caso: BLOQUE TIPADO, no HTML de campo rico.`);
  P(`     Es el mismo camino que §3.3·T4 aplica a los <script>: nodo-embed tipado`);
  P(`     o eliminación con sustitución. Existe como precedente, no como propuesta.`);
} else P(`   (no existe CtaGuiaProyecto.tsx)`);

/* ════════════════════════════════════════════════════════════════════════
 * 4 · CONTROLES
 * ══════════════════════════════════════════════════════════════════════ */
const ctrl = [];
const ctl = (ok, n, d) => ctrl.push({ ok, nombre: n, detalle: d });
ctl(paginasCenso.size >= 290, "§regla 22 · el dominio del censo va con su CARDINAL, no con un booleano", `${regiones.length} regiones · ${paginasCenso.size} páginas (el censo declaró 294)`);
ctl(fichas.length === 5, "las CINCO clases tienen ficha, con los mismos campos", `${fichas.length} fichas`);
/**
 * ⚠⚠ EL CONTROL DEL CERO SON LOS TESTIGOS, NO «QUE EL DOMINIO SEPARE».
 *
 * La v1 exigía `vistos > 0 && noVistos > 0` —que hubiera tokens de los dos
 * lados—. Es el control EQUIVOCADO, y lo demostró la propia medición: los 43
 * tokens salen a 0, así que ese control cae **describiendo el resultado como si
 * fuera una avería**. Un dominio que no ejercita NINGUNA de las cinco clases es
 * un dato, no un fallo del instrumento.
 *
 * Lo que sí separa «el corpus no lo trae» de «mi regex no casa» es el CASO
 * CONOCIDO DE ANTEMANO: los testigos, medidos con la MISMA función. Con ellos
 * vivos, un 0 es del corpus; sin ellos, la corrida no adjudica nada.
 */
const todos = fichas.flatMap((f) => f.dominio);
const vio = (d) => (d.eje === "etiqueta" ? !!d.enCensoDeEtiquetas : d.n > 0);
const vistos = todos.filter(vio).length;
const noVistos = todos.filter((d) => !vio(d)).length;
ctl(testigosVivos === testigos.length, "§sondas 4 · el CERO está auditado con casos conocidos: los testigos VEN el corpus", `${testigosVivos}/${testigos.length} testigos vivos (${testigos.map((t) => `${t.token}=${t.n}`).join(" ")}) · tokens bloqueados vistos ${vistos} · no vistos ${noVistos} de ${todos.length}`);
/* El segundo censo tiene su propio control: su inventario tiene que estar vivo,
   o el «no está» de una etiqueta sería del fichero y no del original. */
const invVivo = Object.keys(inventarioA).length;
ctl(invVivo >= 40, "§sondas 4 · el censo de ETIQUETAS se cruza contra SU congelada, y está viva", `a-censo: ${invVivo} etiquetas en el inventario global (declara 43)`);
ctl(host !== "(sin action)" && !host.endsWith("kunakair.com"), "la superficie de `formulario` está MEDIDA: el destino es un tercero, nombrado", `${host}`);
ctl(ocultos.length > 0, "§regla 14 · los campos OCULTOS van con su cardinal (son los que un lector no ve)", `${ocultos.length} hidden de ${campos.length} input`);

P(`\n## CONTROLES`);
for (const c of ctrl) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const ok = ctrl.every((c) => c.ok);
P("\n" + "=".repeat(78));
P(`VEREDICTO · ${ok ? "los controles pasan" : "HAY CONTROLES EN ROJO"} · 5 fichas · el expediente DESCRIBE, no decide`);
P("=".repeat(78));

/* ── congelada, con la guarda de §regla 5 conectada ──────────────────────── */
const salida = {
  meta: { fecha: new Date().toISOString().slice(0, 10), tanda: "132.ª", derivacion: "fichas-132", saboteada: SAB },
  noContesta: [
    "NO recomienda: el expediente describe y el propietario decide",
    "NO mide el riesgo de ejecución en el navegador del visitante — mide qué entra y de dónde",
    "NO abre el original vivo: lee el corpus congelado",
  ],
  dominioCenso: { regiones: regiones.length, paginas: paginasCenso.size, porGrupo: Object.fromEntries(["A", "C", "KB"].map((g) => [g, regiones.filter((r) => r.grupo === g).length])), testigos },
  fichas,
  formulario: { formTag, action, metodo, host, inputs: campos.length, visibles: visibles.length, ocultos: ocultos.length, nombresOcultos: ocultos.map(nombreDe), selects, opciones: (mon.match(/<option/gi) ?? []).length, recaptcha: !!rec, scriptsDelDocumento: nScriptsDoc },
  controles: ctrl,
};
let nombre = SAB ? `fichas-132-neg-${SAB}.json` : "fichas-132.json";
const cuerpo = JSON.stringify(salida, null, 1);
const sinFecha = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const destino = join(DERIV, nombre);
if (!SAB && !process.env.PISAR && existsSync(destino) && sinFecha(readFileSync(destino, "utf8")) !== sinFecha(cuerpo)) {
  const h = new Date().toISOString().slice(0, 10);
  let n = `fichas-132-${h}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `fichas-132-${h}-${++i}.json`;
  P(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  nombre = n;
}
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada → derivaciones/${nombre}`);

process.exit(ok ? 0 : 2);
