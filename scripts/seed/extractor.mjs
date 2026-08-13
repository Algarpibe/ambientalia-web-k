/**
 * EL EXTRACTOR DEL CORPUS — de la captura congelada al cuerpo importable.
 * Uso: npm run cms:extractor        (SABOTAJE=t1…t8 → test en negativo)
 *
 * ── Qué hace, y sobre qué ──────────────────────────────────────────────────
 * Lee `corpus/` (la captura congelada y COMMITEADA — nunca el sitio vivo),
 * extrae el `post_content` de las tres colecciones del grupo A y le aplica
 * **T1–T8** (§3.2) en su orden de contrato. El resultado va a
 * `corpus/transformado/` (derivable: NO se commitea; se regenera de captura +
 * código) y el informe congela en `medidas/extractor-corpus.json`.
 *
 * casos · faqs · productos están CAPTURADOS pero NO se extraen aquí: son
 * páginas de builder (su contenido no vive en un `post_content`) y su
 * extracción a bloques es otra mecánica — queda declarado en el informe y en
 * el HANDOFF, no omitido.
 *
 * ── Las tres guardas que cierran el código de salida ───────────────────────
 * 1 · POSTCONDICIÓN por transformación, evaluada EN SU ETAPA (T8 se comprueba
 *     antes de que T4a se lleve los scripts — en el HTML final sería vacua);
 * 2 · `<script>` SIN CLASIFICAR = el censo §3.3 no lo contempla → rojo;
 * 3 · el contrato del saneador (§3.1 whitelist · §3.3b allowlist · sin script)
 *     sobre CADA cuerpo transformado, con `validaHtmlCorpus` — el MISMO código
 *     que corre el `validate` del alta, importado, no copiado (clase C7).
 *
 * Y la lectura del censo de julio contra la captura de hoy: etiquetas u hosts
 * del cuerpo CRUDO (sin <script>/<style>, la regla del markup) que el censo no
 * tenga salen NOMBRADOS — el original es un sitio vivo y la contradicción es
 * un dato, no un error de la sonda.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { enApp, Evaluadas, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";
import { postContent } from "./corpus.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = TRANSFORMACIONES.map((t) => t.id);
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — la transformación NO se aplica. Su postcondición DEBE morder.\n`);

/* ── el contrato del saneador: importado de la config, no copiado ────────── */
const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "comunes.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/campos/comunes.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  logLevel: "silent",
});
const { validaHtmlCorpus, etiquetasFueraDelCenso, hostsFueraDeAllowlist } = await import(
  `${pathToFileURL(bundle).href}?t=${Date.now()}`
);

/* ── la captura y la lista de trabajo (derivadas, no escritas) ───────────── */
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const DEL_GRUPO_A = ["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"];
const FUERA = ["casos", "faqs", "productos"]; // capturadas; extracción de builder = otra mecánica
const trabajo = Object.entries(INDICE.paginas).filter(([clave]) => DEL_GRUPO_A.includes(clave.split("/")[0]));

/* ── las rutas publicadas, para T7: SÓLO el manifiesto del build ───────────
 *
 * ⚠ **CORREGIDO 2026-08-13 (§DATOS-C-PIPELINE, PASO 4).** Aquí ponía
 * *«manifiesto del build **+ el propio corpus**»*, y **una URL capturada no es
 * una ruta publicada**: T7 localizaba 53 destinos que el build no emite, y 20
 * de ellos son **enlaces rotos vivos** hoy (`/cartuchos-inteligentes/*` ·
 * `/sensor-de-calidad-del-aire/*`).
 *
 * No es una elección de esta tanda: es §F2-3-HREF-DERIVADO —salida **(b)**,
 * adjudicada el 2026-08-07: *componer contra las rutas que el build emite*—
 * que estaba aplicada en el render y **no en el pipeline**.
 *
 * El conjunto correcto tiene además la propiedad que hace falta: **crece solo**.
 * Cuando se siembren `casos`, sus 57 rutas entran en el manifiesto del build
 * siguiente y sus 31 destinos pasan a localizarse sin tocar una línea.
 */
const rutas = new Set();
const manifest = enApp(".next/prerender-manifest.json");
if (!existsSync(manifest))
  throw new Error("no hay `prerender-manifest.json`: sin build no hay conjunto de rutas publicadas para T7 (regla del cero — 0 rutas daría un T7 «limpio» que no miró nada).");
for (const r of Object.keys(JSON.parse(readFileSync(manifest, "utf8")).routes ?? {})) rutas.add(r);

/* ── el cuerpo: el interior de `et_pb_post_content` ────────────────────────
 * IMPORTADO de `corpus.mjs`, no copiado: estaba definido aquí y en
 * `captura.mjs`, y la sonda del `srcset` iba a traer la tercera copia. */
/** La regla del markup: se busca sobre el HTML sin `<script>` ni `<style>`. */
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

/**
 * Las clases con regla en el CSS que el documento SIRVE — el discriminador de T9.
 *
 * ⚠ **Sin esto T9 se pasa de largo, y en la dirección peor.** `esTransporte`
 * pregunta *«¿ninguna de sus clases tiene estilo servido?»*, y con el conjunto
 * `undefined` la respuesta es **sí para todas** — o sea que cualquier
 * contenedor dentro de una raíz ajena se desenvolvería. Es §regla 6 en su forma
 * exacta: una ausencia traducida a un valor benigno, en el sitio donde todavía
 * se sabía. Aquí el valor benigno **borra marcado**.
 *
 * Misma definición que en `extractor-c.mjs` — y misma limitación declarada: las
 * hojas ENLAZADAS no están en el corpus, así que esto es *«con regla en el CSS
 * EN LÍNEA»*. Como T9 lo usa como condición NECESARIA, el sesgo va hacia **no**
 * desenvolver, que es la dirección segura.
 */
const clasesConEstiloDe = (crudo) => {
  const css = [...crudo.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]).join("\n");
  const s = new Set();
  for (const m of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) s.add(m[1]);
  return s;
};

console.log(`\n════════ EXTRACTOR · ${trabajo.length} cuerpos del grupo A · T1–T8 ════════`);
console.log(`  fuera de esta extracción (capturadas, builder): ${FUERA.join(" · ")}\n`);

const ev = new Evaluadas({ nombre: "extractor", unidad: "cuerpos", minimo: trabajo.length });

const porT = Object.fromEntries(VALIDOS.map((id) => [id, { aplicadas: 0, dianas: 0, violaciones: [] }]));
const scriptsQuitados = [];
/* Lo que T3b y T4b producen, y que el eje `existencia` empareja contra la
 * captura: la LLAVE de cada media referenciada desde el cuerpo transformado. */
const mediaDelCuerpo = [];
const sinLlaveT3b = [];
const sustitucionesT4b = [];
const payloadIlegible = [];
/** T7 · la MARCA de §Regla de rutas locales: qué destinos se dejan al original. */
const noLocalizadas = [];
/** T7 · `rel="noopener"` que se queda sin su `target`. Nombrado, no barrido. */
const relHuerfano = [];
/** T9 · los contenedores de transporte ajeno desenvueltos, con su página. */
const transporteDesenvuelto = [];
let captionNoCanonico = 0;
/** §3.3 · las clases cuya sustitución NO es derivable — se listan, no se inventan. */
const SIN_SUSTITUTO = {
  "swiper-jsdelivr (→ T4b: galería nativa)": "decisión de RENDER — el dato está (10 · 11 · 11 slides como <a class=\"swiper-slide\">)",
  "nbc (→ T4b: enlace a la noticia)": "IMPOSIBLE — el script sólo da la URL del REPRODUCTOR con su CID caducable, nunca la del artículo",
};
/** §3.3 · las que NO necesitan sustitución, verificado corriendo T1–T8. */
const SIN_TRABAJO = {
  "twitter (→ T4b: nodo-embed tipado)": "el <blockquote class=\"twitter-tweet\"> sobrevive con su texto y su enlace al estado: degrada a cita válida",
  "instagram (→ T4b: nodo-embed tipado)": "el <blockquote class=\"instagram-media\"> sobrevive con su permalink: degrada a cita válida",
};
const censoContradicho = { etiquetas: new Map(), hosts: new Map() };
const rechazosSaneador = [];
const sinCuerpo = [];
const paginas = {};

for (const [clave, p] of trabajo) {
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const cuerpo = postContent(crudo);
  if (cuerpo === null) {
    sinCuerpo.push(clave);
    ev.fallo(clave, "sin et_pb_post_content");
    continue;
  }

  /* el censo de julio contra la captura de hoy, sobre el cuerpo CRUDO */
  const legible = sinScriptNiStyle(cuerpo);
  for (const t of etiquetasFueraDelCenso(legible)) {
    if (!censoContradicho.etiquetas.has(t)) censoContradicho.etiquetas.set(t, []);
    censoContradicho.etiquetas.get(t).push(clave);
  }
  for (const h of hostsFueraDeAllowlist(legible)) {
    if (!censoContradicho.hosts.has(h)) censoContradicho.hosts.set(h, []);
    censoContradicho.hosts.get(h).push(clave);
  }

  /* T1–T8, cada una con su diana y su postcondición EN SU ETAPA */
  const ctx = {
    pagina: clave, rutas, scriptsQuitados, mediaDelCuerpo, sinLlaveT3b, sustitucionesT4b, payloadIlegible,
    noLocalizadas, relHuerfano,
    clasesConEstilo: clasesConEstiloDe(crudo),
    transporteDesenvuelto,
  };
  let html = cuerpo;
  const aplicado = {};
  for (const t of TRANSFORMACIONES) {
    const diana = t.diana(html, ctx);
    porT[t.id].dianas += diana;
    if (SABOTAJE !== t.id) {
      const r = t.aplica(html, ctx);
      html = r.html;
      porT[t.id].aplicadas += r.n;
      aplicado[t.id] = r.n;
    }
    for (const v of t.post(html, ctx)) porT[t.id].violaciones.push(`${clave}: ${v}`);
  }
  captionNoCanonico += ctx.captionNoCanonico ?? 0;

  /* el contrato del alta, con el MISMO código que el `validate` */
  const veredicto = validaHtmlCorpus(html);
  if (veredicto !== true) rechazosSaneador.push({ pagina: clave, veredicto });

  if (!SABOTAJE) {
    const destino = join(CORPUS, "transformado", `${clave}.html`);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, html);
  }
  paginas[clave] = { bytes: Buffer.byteLength(cuerpo), bytesTransformado: Buffer.byteLength(html), ...aplicado };
  ev.ok();
}

/* ════════════════════════════════ informe ════════════════════════════════ */
let rojo = 0;

console.log(`  transformación                aplicadas   dianas`);
for (const t of TRANSFORMACIONES) {
  const e = porT[t.id];
  console.log(`   ${t.id.padEnd(4)} ${t.titulo.slice(5, 60).padEnd(58)} ${String(e.aplicadas).padStart(6)} ${String(e.dianas).padStart(8)}`);
}

for (const t of TRANSFORMACIONES) {
  const e = porT[t.id];
  if (!e.violaciones.length) continue;
  rojo++;
  console.error(
    `\n❌ ${t.id.toUpperCase()} POSTCONDICIÓN — ${e.violaciones.length} violación(es):\n` +
      e.violaciones.slice(0, 6).map((v) => `     · ${v}`).join("\n"),
  );
}
if (SABOTAJE && porT[SABOTAJE].dianas === 0 && !porT[SABOTAJE].violaciones.length) {
  console.error(
    `\n❌ SABOTAJE=${SABOTAJE} SIN DIANA — el corpus no trae el patrón de esta transformación,\n` +
      `   así que desactivarla no cambia nada (regla 8a). No se lee como verde.`,
  );
  rojo++;
}

const sinClasificar = scriptsQuitados.filter((s) => s.clase === "SIN CLASIFICAR");
if (sinClasificar.length) {
  rojo++;
  console.error(
    `\n❌ ${sinClasificar.length} <script> SIN CLASIFICAR — el censo §3.3 no los contempla:\n` +
      sinClasificar.slice(0, 6).map((s) => `     · ${s.pagina}: ${s.muestra.slice(0, 80)}`).join("\n"),
  );
}
if (sinCuerpo.length) rojo++;
if (rechazosSaneador.length) {
  rojo++;
  console.error(
    `\n❌ EL SANEADOR RECHAZA ${rechazosSaneador.length} cuerpo(s) TRANSFORMADO(s):\n` +
      rechazosSaneador.slice(0, 6).map((r) => `     · ${r.pagina}: ${r.veredicto.slice(0, 110)}`).join("\n"),
  );
}
if (censoContradicho.etiquetas.size || censoContradicho.hosts.size) {
  console.log(`\n⚠ LA CAPTURA CONTRADICE EL CENSO DE JULIO (dato, no error — va al ESQUEMA):`);
  for (const [t, pags] of censoContradicho.etiquetas)
    console.log(`   · etiqueta <${t}> en ${pags.length} página(s): ${pags.slice(0, 3).join(", ")}`);
  for (const [h, pags] of censoContradicho.hosts)
    console.log(`   · host ${h} en ${pags.length} página(s): ${pags.slice(0, 3).join(", ")}`);
}

/* ── T4b · lo sustituido, lo que no lo necesita, y lo que NO tiene sustituto ── */
const porClase = (pred) => scriptsQuitados.filter((s) => pred(s.clase));
const sinSustituto = porClase((c) => c in SIN_SUSTITUTO);
const sinTrabajo = porClase((c) => c in SIN_TRABAJO);
console.log(`\n  T4a se llevó ${scriptsQuitados.length} <script>. Reparto de T4b, en la unidad del CONTENEDOR:`);
const porClaseT4b = new Map();
for (const s of sustitucionesT4b) porClaseT4b.set(s.clase, (porClaseT4b.get(s.clase) ?? 0) + 1);
for (const [c, n] of porClaseT4b) console.log(`   ✅ SUSTITUIDO  ${String(n).padStart(2)} × ${c}`);
for (const s of sinTrabajo) console.log(`   ✅ SIN TRABAJO      ${s.pagina}  — ${SIN_TRABAJO[s.clase]}`);
for (const s of sinSustituto) console.log(`   ⛔ SIN SUSTITUTO    ${s.pagina}  [${s.clase.split(" ")[0]}] — ${SIN_SUSTITUTO[s.clase]}`);
if (payloadIlegible.length) {
  rojo++;
  console.error(`\n❌ ${payloadIlegible.length} payload(s) FB3D ilegible(s): el visor se queda sin su documento.`);
}

/* ── T7 · la marca de lo que NO se localiza, y el `rel` que queda huérfano ── */
const porDestino = new Map();
for (const x of noLocalizadas) porDestino.set(x.destino, (porDestino.get(x.destino) ?? 0) + 1);
console.log(
  `\n  T7 · ${rutas.size} rutas publicadas (SÓLO el manifiesto del build) · ` +
    `${noLocalizadas.length} enlace(s) dejado(s) apuntando al ORIGINAL en ${porDestino.size} destino(s) distintos`,
);
for (const [d, n] of [...porDestino].sort((a, b) => b[1] - a[1]).slice(0, 8))
  console.log(`     ${String(n).padStart(4)} × ${d}`);
if (porDestino.size > 8) console.log(`     … y ${porDestino.size - 8} destino(s) más (la lista entera va a la congelada)`);
if (relHuerfano.length)
  console.log(
    `   ⚠ ${relHuerfano.length} \`rel="noopener"\` se quedan SIN su \`target\`: inertes, y se dejan a\n` +
      `      propósito — §Regla de rutas locales nombra el \`target\` y sólo el \`target\`.`,
  );

/* ── T3b · la relación de media que el cuerpo transformado declara ────────── */
const llaves = new Set(mediaDelCuerpo.map((m) => m.clave));
console.log(`\n  T3b/T4b · relación de media declarada en el cuerpo: ${mediaDelCuerpo.length} \`data-media\` · ${llaves.size} documentos distintos`);
if (captionNoCanonico)
  console.log(
    `   ⚠ ${captionNoCanonico} bloque(s) \`wp-caption\` NO CANÓNICOS, dejados sin tocar a propósito:\n` +
      `      su <p> sin cerrar mete un bloque \`calls\` dentro del contenedor, así que el </div>\n` +
      `      cae después del CTA. Emparejarlos por balanceo se tragaría el CTA (§T3B-NO-CANONICO).`,
  );
if (sinLlaveT3b.length)
  console.log(
    `   ⚠ ${sinLlaveT3b.length} <img> de \`wp-caption\` SIN llave de media — hotlink a un host ajeno,\n` +
      `      así que no son media nuestra y no pueden tener relación con la colección:\n` +
      sinLlaveT3b.map((s) => `      · ${new URL(s.src).host}  (${s.pagina})`).join("\n"),
  );

w("medidas/extractor-corpus.json", {
  meta: {
    fecha: hoy(),
    sabotaje: SABOTAJE,
    fuente: "corpus/ (captura congelada) — OFFLINE, sin tocar el sitio vivo",
    alcance: `${trabajo.length} cuerpos de ${DEL_GRUPO_A.join(" · ")}; fuera (builder): ${FUERA.join(" · ")}`,
    rutasParaT7: rutas.size,
  },
  porT: Object.fromEntries(Object.entries(porT).map(([id, e]) => [id, { aplicadas: e.aplicadas, dianas: e.dianas, violaciones: e.violaciones }])),
  scriptsQuitados,
  /* La lista que consume el invariante D de `qa:artefacto` (eje `existencia`):
   * lo que el cuerpo transformado declara como relación de media. Es DERIVADA
   * —no escrita— y por eso una referencia nueva entra sola y pasa a exigirse. */
  mediaDelCuerpo: {
    referencias: mediaDelCuerpo.length,
    documentos: [...new Set(mediaDelCuerpo.map((m) => m.clave))].sort(),
    detalle: mediaDelCuerpo,
    sinLlave: sinLlaveT3b,
  },
  t4b: {
    sustituciones: sustitucionesT4b,
    sinSustituto: sinSustituto.map((s) => ({ pagina: s.pagina, clase: s.clase, porQue: SIN_SUSTITUTO[s.clase] })),
    sinTrabajo: sinTrabajo.map((s) => ({ pagina: s.pagina, clase: s.clase, porQue: SIN_TRABAJO[s.clase] })),
    payloadIlegible,
  },
  t3b: { noCanonicos: captionNoCanonico },
  /**
   * T7 · la MARCA que §Regla de rutas locales pide para lo que no se localiza.
   * En código eso es un comentario; en un cuerpo rico no hay dónde ponerlo sin
   * cambiar lo servido, así que la marca es esto — contable y auditable.
   */
  t7: {
    rutasPublicadas: rutas.size,
    fuente: "SÓLO `.next/prerender-manifest.json` — una URL capturada no es una ruta publicada (§F2-3-HREF-DERIVADO b)",
    dejadosAlOriginal: noLocalizadas.length,
    porDestino: Object.fromEntries([...porDestino].sort((a, b) => b[1] - a[1])),
    detalle: noLocalizadas,
    relHuerfano,
  },
  censoContradicho: {
    etiquetas: Object.fromEntries(censoContradicho.etiquetas),
    hosts: Object.fromEntries(censoContradicho.hosts),
  },
  rechazosSaneador,
  sinCuerpo,
  paginas,
});

const N = TRANSFORMACIONES.length;
console.log(
  `\n${rojo === 0 ? "✅" : "❌"} extractor: ${trabajo.length - sinCuerpo.length}/${trabajo.length} cuerpos · ` +
    `${rojo === 0 ? `${N}/${N} postcondiciones limpias y el saneador admite el corpus transformado` : `${rojo} guarda(s) en rojo`}\n`,
);
process.exit(rojo === 0 ? 0 : 2);
