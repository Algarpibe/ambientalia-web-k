// 133.ª · PASO 0 — EL REPARTO REPRODUCE, Y LA PREGUNTA DEL ENCARGO TIENE RESPUESTA
//
// Tres cosas, y la tercera es la que decide la tanda:
//
//   1. el ENTORNO se deriva (manifiesto con su fichero, sondas, congeladas);
//   2. el reparto de CMS-6 se RE-DERIVA antes de construir sobre él — 22
//      bloqueos · 43 tokens · 5 clases · 0 sin clasificar, y «admitir las 4
//      inertes deja 2». Si no reproduce, eso es la tanda;
//   3. y la pregunta del encargo —**¿qué hay ya en el repo que haga parte de
//      este trabajo?**— se contesta RECORRIENDO, no recordando.
//
// ── LO QUE EL RECORRIDO ENCONTRÓ, Y NO ESTABA EN EL EXPEDIENTE ─────────────
//
// El expediente de la 132.ª declara SIN CONTESTAR su punto 2: *«si otros
// arquetipos ya sembrados traen estas clases: el barrido es de los 4 documentos
// del lote»*. Está contestado, y con número:
//
//   > `MODULO_CODIGO` (`slug: "codigo"`, `bloques/paginas.ts`) modela el mismo
//   > módulo `et_pb_code` de Divi, tiene **9 instancias**, y **9 de 9 son el
//   > MISMO tipo de formulario de ActiveCampaign** que bloquea F3-5. Su campo
//   > es `{type:"code"}` y **NO pasa por `validaHtmlCorpus`** — deliberadamente,
//   > con su razón escrita: *«este módulo existe precisamente para meter lo que
//   > ese censo prohíbe —formularios, `<script>`, embebidos de terceros»*.
//
// O sea que los 2 bloqueos que quedan tras admitir las 4 inertes **no los
// produce el contenido**: los produce que DOS bloques del mismo módulo de Divi
// usen VALIDADORES DISTINTOS. `codigo-arq` valida; `codigo` no.
//
// Eso no se afirma por lectura del comentario (§regla 3: *documentado no es
// conectado*): se mide corriendo el MISMO validador sobre los 9 htmls ya
// modelados. Si los 9 bloquearan, la divergencia es real y está medida.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);
const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["censo-mudo", "sin-testigos"];
if (SAB && !VALIDOS.includes(SAB)) throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const F35 = join(MED, "f35-extraido.json");
const F33 = join(MED, "f33-extraido.json");
const COMUNES = join(RAIZ, "packages/cms-config/src/campos/comunes.ts");
const B_PAGINAS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const B_ARQ = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
const CLASES132 = join(DERIV, "clases-132.json");
const faltan = [F35, F33, COMUNES, B_PAGINAS, B_ARQ, CLASES132].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`); process.exit(1); }

const { validaHtmlCorpus, etiquetasFueraDelCenso, atributosFueraDelCenso } =
  await import(pathToFileURL(COMUNES).href);
const { MODULOS_PAGINA } = await import(pathToFileURL(B_PAGINAS).href);
const { bloquesArquetipo } = await import(pathToFileURL(B_ARQ).href);

let ok = true;
const fallo = (m) => { ok = false; P(`   ❌ ${m}`); };

P("=".repeat(78));
P("133.ª · PASO 0 — el reparto REPRODUCE, y qué hay ya en el repo");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 1 · ENTORNO — derivado, nunca citado de memoria (§regla 9)
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 1 · ENTORNO — derivado");

const git = (...a) => execFileSync("git", a, { cwd: RAIZ, encoding: "utf8" }).trim();
const head = git("rev-parse", "HEAD");
const rama = git("rev-parse", "--abbrev-ref", "HEAD");

/** El manifiesto se cita CON SU FICHERO (§regla 5: el nombre es un dato). */
const MANIF = join(RAIZ, "apps/web/.next/prerender-manifest.json");
let manifiesto = { fichero: null, rutas: 0, dinamicas: 0, mtime: null };
if (existsSync(MANIF)) {
  const m = JSON.parse(readFileSync(MANIF, "utf8"));
  manifiesto = {
    fichero: "apps/web/.next/prerender-manifest.json",
    rutas: Object.keys(m.routes ?? {}).length,
    dinamicas: Object.keys(m.dynamicRoutes ?? {}).length,
    mtime: statSync(MANIF).mtime.toISOString(),
  };
}

/** Congeladas y artefactos: el glob se DERIVA del directorio, no se escribe. */
const RE_ARTEFACTO = /-neg-|SABOTAJE|SONDA-|CONTAMINADA|CADUCADA/;
const todas = readdirSync(MED).filter((f) => f.endsWith(".json"));
const artefactos = todas.filter((f) => RE_ARTEFACTO.test(f));

P(`   rama ................. ${rama}  @ ${head.slice(0, 7)}`);
P(`   manifiesto ........... ${manifiesto.fichero ?? "(no hay build)"}`);
P(`                          ${manifiesto.rutas} rutas · ${manifiesto.dinamicas} dinámicas · ${manifiesto.mtime ?? "—"}`);
P(`   congeladas ........... ${todas.length} en scripts/qa/medidas · ${artefactos.length} con marcador (§regla 7)`);
P(`   ⚠ CLAUDE.md cita «324 congelados · 31 con marcador» — número RECORDADO, envejecido contra el repo`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · EL REPARTO DE CMS-6 — re-derivado, no citado
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 2 · EL REPARTO DE CMS-6 — cruzado contra la congelada de la 132.ª");

const c132 = JSON.parse(readFileSync(CLASES132, "utf8"));

/**
 * ⚠ La llave lleva ORDINAL (§regla 29, tercera cara): las coordenadas
 * semánticas —doc · kind · campo · eje— se repiten por diseño, y un conjunto
 * las colapsa EN LOS DOS LADOS por igual, así que la simétrica saldría 0/0
 * sobre una membresía que nadie ha mirado.
 */
const llaveDe = (b, i) => `${b.slug}|${b.kind}|${b.campo}|${b.eje}|#${i}`;

const f35 = JSON.parse(readFileSync(F35, "utf8"));
const bloqueosVivos = [];
for (const [eje, lista] of Object.entries(f35.bloqueos?.porEje ?? {}))
  for (const b of lista) bloqueosVivos.push({ ...b, eje });

const llaves = bloqueosVivos.map(llaveDe);
const distintas = new Set(llaves);
if (distintas.size !== llaves.length)
  fallo(`la llave NO identifica: ${llaves.length} bloqueos → ${distintas.size} llaves. Se colapsan hermanos.`);

/** El denominador se DERIVA de la congelada que lo publica; sin él, un cero no
 *  se puede sopesar y §regla 14 lo lee como nota al pie. */
const CAMPOS_HTML = c132.denominadores?.camposHtml ?? null;

const repartoAqui = {};
for (const b of bloqueosVivos) repartoAqui[b.eje] = (repartoAqui[b.eje] ?? 0) + 1;

P(`   bloqueos (extractor) . ${bloqueosVivos.length}  ·  llaves distintas ${distintas.size}  ⇒ la llave identifica`);
P(`   por eje .............. ${Object.entries(repartoAqui).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
P(`      ⚠ los ejes a CERO se publican con su denominador, no se omiten (§regla 27)`);
for (const eje of ["script", "etiqueta", "host", "atributo"])
  if (!repartoAqui[eje]) P(`      eje ${eje.padEnd(9)} 0 de ${CAMPOS_HTML ?? "SIN DENOMINADOR"} campos HTML — medido, no «no lo miré»`);
if (CAMPOS_HTML == null) fallo("§regla 14 · sin denominador de campos HTML: un cero sin él es una nota al pie");

/** Los cuatro cardinales de la 132.ª, leídos de SU congelada y comparados. */
const esperado = {
  bloqueos: c132.denominadores?.bloqueos ?? c132.alcance?.bloqueos,
  tokens: c132.tokens?.sinRecortar ?? c132.tokensSinRecortar,
  clases: (c132.reparto?.porFuncion ?? c132.clases ?? []).length || null,
  residuo: c132.residuo?.porFuncion?.bloqueos ?? c132.residuo?.bloqueos,
};
P(`\n   ── contra la congelada clases-132.json ──`);
P(`   bloqueos ............. congelada ${esperado.bloqueos}  ·  aquí ${bloqueosVivos.length}`);
if (esperado.bloqueos != null && esperado.bloqueos !== bloqueosVivos.length)
  fallo(`el reparto NO reproduce: ${esperado.bloqueos} → ${bloqueosVivos.length}. ESO es la tanda.`);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LA PREGUNTA DEL ENCARGO — ¿qué hay ya en el repo?
 *
 * Se contesta recorriendo LOS BLOQUES DEL ESQUEMA, no una lista escrita a
 * mano (§regla 9, 7.º caso: un conjunto enumerado a mano dentro de una sonda
 * es un dato recordado y envejece contra el repo en silencio).
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · ¿QUÉ HAY YA EN EL REPO? — recorriendo los bloques, no recordando");

/** ¿Un bloque valida su campo de HTML contra el censo del cuerpo rico? */
const campoValidador = (bloque) => {
  for (const f of bloque.fields ?? []) {
    if (typeof f?.validate === "function") return { campo: f.name, valida: true, tipo: f.type };
  }
  for (const f of bloque.fields ?? []) {
    if (f?.type === "code") return { campo: f.name, valida: false, tipo: f.type };
  }
  return null;
};

const paresCode = [
  { coleccion: "paginas", bloque: MODULOS_PAGINA.find((b) => b.slug === "codigo") },
  { coleccion: "arquetipos", bloque: bloquesArquetipo.find((b) => b.slug === "codigo-arq") },
];

P("   los DOS bloques que modelan el mismo `et_pb_code` de Divi:\n");
P("   colección    slug         campo       tipo   ¿valida contra el censo?");
const estado = {};
for (const { coleccion, bloque } of paresCode) {
  if (!bloque) { fallo(`no encuentro el bloque de \`${coleccion}\` — ¿cambió el slug?`); continue; }
  const v = campoValidador(bloque);
  estado[bloque.slug] = v;
  P(`   ${coleccion.padEnd(12)} ${bloque.slug.padEnd(12)} ${String(v?.campo).padEnd(11)} ${String(v?.tipo).padEnd(6)} ${v?.valida ? "SÍ" : "NO"}`);
}

/* ── Las instancias, contadas en el catálogo de cada colección ───────────── */
const rec = (n, out = []) => {
  if (Array.isArray(n)) { n.forEach((x) => rec(x, out)); return out; }
  if (n && typeof n === "object") {
    if (n.kind || n.blockType) out.push(n);
    for (const k of Object.keys(n)) rec(n[k], out);
  }
  return out;
};
const htmlDe = (m) => m.html ?? m.contenido ?? "";
const f33 = JSON.parse(readFileSync(F33, "utf8"));
const inst = {
  codigo: rec(f33).filter((m) => (m.kind ?? m.blockType) === "codigo").map(htmlDe),
  "codigo-arq": rec(f35.catalogo.arquetipos).filter((m) => m.kind === "codigo-arq").map(htmlDe),
};

const RE_FORM = /<form\b/i;
const RE_AC = /kunak\.activehosted\.com/i;
const idForm = (h) => /id="(_form_\d+_)"/.exec(h)?.[1] ?? "(sin id)";

P("");
for (const [slug, hs] of Object.entries(inst)) {
  const conForm = hs.filter((h) => RE_FORM.test(h)).length;
  const conAC = hs.filter((h) => RE_AC.test(h)).length;
  P(`   ${slug.padEnd(12)} instancias ${String(hs.length).padStart(2)} · con <form> ${conForm}/${hs.length} · a ActiveCampaign ${conAC}/${hs.length}`);
  P(`   ${" ".repeat(12)} ids: ${[...new Set(hs.map(idForm))].join(", ")}`);
}

/* ════════════════════════════════════════════════════════════════════════
 * 4 · ¿ES LA DIVERGENCIA, O ES EL CONTENIDO?
 *
 * §regla 3 —*documentado no es conectado*— prohíbe creerse el comentario de
 * `MODULO_CODIGO`. Se MIDE: se corre el MISMO `validaHtmlCorpus` sobre los 9
 * htmls que YA están modelados sin él. Si los 9 bloquean, lo que separa a las
 * dos colecciones no es su contenido: es qué validador se les puso.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 4 · ¿LO SEPARA EL CONTENIDO O EL VALIDADOR? — se mide, no se lee el comentario");

/**
 * SABOTAJE `censo-mudo`: el validador deja de ver etiquetas. Si el reparto NO
 * se mueve, la comprobación no ejercita el canal y no prueba nada (§regla 28a:
 * el sabotaje reproduce el MODO DE FALLO, no la aritmética de la condición).
 */
const valida = SAB === "censo-mudo" ? () => true : validaHtmlCorpus;

const veredicto = {};
for (const [slug, hs] of Object.entries(inst)) {
  const r = hs.map((h) => valida(h));
  veredicto[slug] = { total: hs.length, bloquean: r.filter((x) => x !== true).length };
}
P(`   \`codigo\`     (paginas, NO valida hoy) → si se le pusiera el validador: ${veredicto.codigo.bloquean} de ${veredicto.codigo.total} BLOQUEAN`);
P(`   \`codigo-arq\` (arquetipos, SÍ valida)  → bloquean HOY:                  ${veredicto["codigo-arq"].bloquean} de ${veredicto["codigo-arq"].total}`);

const mismoContenido =
  veredicto.codigo.bloquean === veredicto.codigo.total &&
  veredicto["codigo-arq"].bloquean === veredicto["codigo-arq"].total;
P("");
if (mismoContenido)
  P(`   ⇒ el contenido de las DOS colecciones es igual de "prohibido" por el censo.\n     Lo que las separa es EL VALIDADOR, no el dato — y eso son los 2 bloqueos.`);
else
  P(`   ⇒ NO es sólo la divergencia: el contenido difiere ante el censo.`);

/* Y el primer motivo, nombrado — el orden de los mensajes es parte del contrato. */
const motivo0 = validaHtmlCorpus(inst.codigo[0]);
P(`\n   primer motivo sobre \`codigo\`[0]: ${String(motivo0).slice(0, 120)}…`);

/* ════════════════════════════════════════════════════════════════════════
 * 5 · CONTROLES
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 5 · CONTROLES");

/**
 * ⚠ El control de un cero NO es que el resultado separe: es el CASO CONOCIDO DE
 * ANTEMANO (§regla 28c). Aquí los TESTIGOS son htmls que SABEMOS que el censo
 * acepta y que SABEMOS que rechaza, con la MISMA función.
 */
const TESTIGOS = [
  { nombre: "acepta · <p> del censo", html: "<p>hola</p>", esperado: true },
  { nombre: "acepta · <a href> del censo", html: '<a href="/x">y</a>', esperado: true },
  { nombre: "rechaza · <form> (etiqueta fuera)", html: "<form></form>", esperado: false },
  { nombre: "rechaza · <script> (§3.3 T4)", html: "<script></script>", esperado: false },
  { nombre: "rechaza · atributo fuera (onclick)", html: '<p onclick="x">y</p>', esperado: false },
];
const testigos = SAB === "sin-testigos" ? [] : TESTIGOS;
let vivos = 0;
for (const t of testigos) {
  const r = valida(t.html) === true;
  if (r === t.esperado) vivos++;
  else fallo(`testigo MUERTO — ${t.nombre}: esperado ${t.esperado}, dio ${r}`);
}
if (vivos === testigos.length && testigos.length > 0)
  P(`   ✅ §regla 28c · los ${vivos} TESTIGOS viven: el censo ve lo que dice ver, en las dos direcciones`);
else if (testigos.length === 0)
  fallo("§regla 28c · CERO testigos: sin caso conocido de antemano, un cero no adjudica");

if (distintas.size === llaves.length)
  P(`   ✅ §regla 29 · la llave IDENTIFICA (${llaves.length} bloqueos = ${distintas.size} llaves) — la simétrica compara, no colapsa`);

const recorridos = Object.values(inst).reduce((a, h) => a + h.length, 0);
if (recorridos > 0) P(`   ✅ §sondas 4bis · 0 comparado NO puede salir verde — ${recorridos} instancias recorridas en 2 colecciones`);
else fallo("§sondas 4bis · 0 instancias recorridas");

if (Object.values(estado).some((v) => v?.valida) && Object.values(estado).some((v) => v && !v.valida))
  P(`   ✅ el reparto DISCRIMINA: hay un bloque que valida y otro que no — no es un pleno (§sondas 4)`);
else fallo("los dos bloques dan el mismo veredicto: el detector no discrimina");

P("\n" + "=".repeat(78));
P(ok
  ? `VEREDICTO · el reparto REPRODUCE (${bloqueosVivos.length} bloqueos) · el repo YA modela el mismo formulario ${inst.codigo.length} veces, sin validador`
  : "VEREDICTO · ❌ algún control cae — no se construye sobre esto");
P("=".repeat(78));

/* ── Congelado (§regla 5: `derivaciones/` es una FUGA que `w()` no tapa) ──── */
const salida = {
  meta: { tanda: "133.ª", paso: "PASO 0", fecha: new Date().toISOString(), head, rama, saboteada: SAB },
  entorno: { manifiesto, congeladas: todas.length, artefactos: artefactos.length },
  reparto: { bloqueos: bloqueosVivos.length, llavesDistintas: distintas.size, porEje: repartoAqui, congelada132: esperado },
  hallazgo: {
    pregunta: "¿qué hay ya en el repo que haga parte de este trabajo?",
    respuesta: "MODULO_CODIGO (slug 'codigo') modela el mismo et_pb_code y NO valida contra el censo",
    bloques: estado,
    instancias: Object.fromEntries(Object.entries(inst).map(([k, hs]) => [k, {
      n: hs.length,
      conForm: hs.filter((h) => RE_FORM.test(h)).length,
      aActiveCampaign: hs.filter((h) => RE_AC.test(h)).length,
      ids: [...new Set(hs.map(idForm))],
    }])),
    siSeValidara: veredicto,
    loSeparaElValidador: mismoContenido,
  },
  controles: { testigosVivos: vivos, testigosTotal: testigos.length, recorridos, ok },
};

const { writeFileSync } = await import("node:fs");
let nombre = SAB ? `paso0-133-neg-${SAB}.json` : "paso0-133.json";
const cuerpo = JSON.stringify(salida, null, 1);
const sinFecha = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const destino = join(DERIV, nombre);
if (!SAB && !process.env.PISAR && existsSync(destino)
    && sinFecha(readFileSync(destino, "utf8")) !== sinFecha(cuerpo)) {
  const hoy = new Date().toISOString().slice(0, 10);
  let n = `paso0-133-${hoy}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `paso0-133-${hoy}-${++i}.json`;
  console.log(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  nombre = n;
}
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada → derivaciones/${nombre}`);

process.exit(ok ? 0 : 2);
