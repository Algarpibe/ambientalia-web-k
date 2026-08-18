/**
 * ¿HAY QUE CAPTURAR LAS VARIANTES, O BASTA CON LOS ORÍGENES? — y cuántos.
 * Uso: npm run qa:media-regenera        (SABOTAJE=… → test en negativo)
 *
 * ── La pregunta, y por qué se hace ANTES de capturar nada ─────────────────
 * `media-poblaciones` dejó **1 571 URLs que el corpus referencia y el clon no
 * sirve**, y el plan del bloque 3 era capturarlas. Pero `media-srcset` ya había
 * medido que **un juego fijo de image sizes GENERA todos los ficheros** (9
 * cajas, 0 formas sin explicar). Si eso se sostiene, capturar las variantes es
 * pedirle al sitio vivo cientos de ficheros que Payload sabe fabricar.
 *
 * **No se da por hecho en ninguna de las dos direcciones: se mide**, y se mide
 * con el pipeline REAL —el `sharp` que la config compartida le pasa a Payload—
 * contra las variantes que YA están capturadas en `apps/web/public/images`.
 *
 * ── ⚠ LAS DOS POBLACIONES DE `media/`, que no se pueden mezclar ───────────
 * Un fichero de `media/` con `-WxH` en el nombre puede ser dos cosas:
 *
 *   · **GENERADO** por sharp — su origen (el nombre sin `-WxH`) también está;
 *   · **SUBIDO** — un fichero FUENTE que ya se llamaba así (`…-300x300-1.jpg`).
 *
 * Comparar los segundos contra su homónimo capturado es **comparar un fichero
 * CONSIGO MISMO**, y sale `sha256` idéntico por construcción. La primera
 * corrida de esta comparación mezcló los dos y sacó *«38 de 111 idénticos»*,
 * que es un dato **inventado por el instrumento**. Aquí van separados, y los
 * SUBIDOS se conservan **como CONTROL**: tienen que dar 100 % de identidad, y
 * si no la dan es la comparación la que está mal.
 *
 * ── Las tres poblaciones del corpus, que es lo que dimensiona la captura ──
 * La reducción real **no viene de regenerar variantes**: viene de que **dos
 * tercios de la media del corpus vive en el CASCARÓN**, que el clon construye
 * con sus propios componentes y que **no entra en el CMS**. Lo que hay que
 * capturar es lo que el CONTENIDO importado referencia, o sea lo que está
 * dentro de `post_content`.
 *
 * ── Las guardas ───────────────────────────────────────────────────────────
 * · **regla 4, el cero** — 0 pares comparables sale por ERROR, no por «todo
 *   coincide»;
 * · **el CONTROL de los subidos** — si un fichero contra sí mismo no da
 *   identidad, la comparación no mide lo que dice;
 * · **`Evaluadas`** con mínimo derivado del propio índice de la captura;
 * · **el patrón de URL excluye `<`** — la primera versión capturaba `mp4</a` y
 *   contaba 5 orígenes que no existen (sobre-casado, regla 4, tercera cara).
 */
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { Evaluadas, origenDe, QA, RE_VARIANTE, w } from "./lib.mjs";
import { postContent } from "../seed/corpus.mjs";

process.env.SIN_CLON = "1";

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const MEDIA = join(RAIZ, "media");
const PUBLIC = join(RAIZ, "apps/web/public/images/uploads");
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const PAGINAS = Object.entries(INDICE.paginas);

const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "sin-poblaciones": "GENERADAS y SUBIDAS se cuentan juntas → el `sha256 idéntico` se infla con ficheros comparados consigo mismos",
  "selector-muerto": "las URLs de uploads se buscan por un prefijo que no existe → 0 pares (regla 4, el cero)",
  "sobre-casado": "el patrón de URL NO excluye `<` → captura `mp4</a` y cuenta orígenes que no existen",
  "sin-cascaron": "no se separa el cuerpo del cascarón → la lista de captura se infla con thumbs que el CMS no usa",
  control: "ningún sabotaje: la sonda tiene que salir LIMPIA",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* `RE_VAR`/`origenDe` estaban aquí; viven en `lib.mjs` desde el 2026-08-05 —
 * T3b los necesita para la misma decisión y dos copias serían la clase C7. */
const RE_VAR = RE_VARIANTE;
const UP = "https://kunakair.com/wp-content/uploads/";
const soloMarcado = (h) =>
  h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

/* ⚠ SABOTAJE `sobre-casado`: sin `<` en la clase negada, el patrón se come el
 *    cierre de la etiqueta siguiente (`…​.mp4</a`) y fabrica orígenes inexistentes.
 * ⚠ SABOTAJE `selector-muerto`: el prefijo de uploads no existe ⇒ 0 URLs, y una
 *    lista de captura vacía se lee como «ya está todo». */
const RE_URL =
  SABOTAJE === "sobre-casado"
    ? /https:\/\/kunakair\.com\/wp-content\/uploads\/[^"'\s,)>]+/gi
    : SABOTAJE === "selector-muerto"
      ? /https:\/\/kunakair\.com\/wp-content\/subidas\/[^"'\s,)>< ]+/gi
      : /https:\/\/kunakair\.com\/wp-content\/uploads\/[^"'\s,)>< ]+/gi;

const ev = new Evaluadas({ unidad: "páginas del corpus", minimo: PAGINAS.length, nombre: "media-regenera" });

/* ══ 1 · las tres poblaciones del corpus ═════════════════════════════════ */
const enTodo = new Set(), enCuerpo = new Set();
for (const [, meta] of PAGINAS) {
  const html = soloMarcado(readFileSync(join(CORPUS, meta.fichero), "utf8"));
  const cuerpo = SABOTAJE === "sin-cascaron" ? html : postContent(html);
  for (const m of html.matchAll(RE_URL)) enTodo.add(m[0]);
  if (cuerpo) for (const m of cuerpo.matchAll(RE_URL)) enCuerpo.add(m[0]);
  ev.ok();
}
const origTodo = new Set([...enTodo].map(origenDe));
const origCuerpo = new Set([...enCuerpo].map(origenDe));

/* lo que YA está local */
const local = new Set();
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else local.add((UP + p.slice(PUBLIC.length + 1)).split("\\").join("/"));
  }
})(PUBLIC);
const faltanCuerpo = [...origCuerpo].filter((o) => !local.has(o)).sort();

/* ══ 2 · ¿reproduce el pipeline la variante capturada? ═══════════════════ */
const enMedia = new Set(readdirSync(MEDIA));
const esGenerada = (b) => RE_VAR.test(b) && enMedia.has(b.replace(RE_VAR, ""));
const capturadas = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else capturadas.push(p.split("\\").join("/"));
  }
})(PUBLIC);

const gen = [], sub = [];
for (const c of capturadas) {
  if (!RE_VAR.test(c)) continue;
  const b = basename(c);
  if (!enMedia.has(b)) continue;
  // ⚠ SABOTAJE `sin-poblaciones`: todo va al cubo de GENERADAS.
  (SABOTAJE === "sin-poblaciones" || esGenerada(b) ? gen : sub).push({ capturado: c, generado: join(MEDIA, b) });
}

const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ UN FICHERO QUE NO SE PUEDE LEER SE ANOTA, NO MATA LA SONDA
 * (corregido 2026-08-18, 83.ª)
 *
 * `sharp` reventaba con «Input file is missing» en un fichero que SÍ existe:
 * `existsSync` da true y `ls` lo ve. La causa es el **MAX_PATH de Windows** —
 * la ruta mide 260 caracteres exactos y libvips, que es código nativo, no usa
 * la API de rutas largas. Barrido: **3 de 2 707** ficheros de
 * `apps/web/public` pasan de 260.
 *
 * La sonda moría en el primero, así que sus 5 casos del negativo salían con
 * exit 1 —control incluido— y el 0/5 se leía como «este negativo no caza
 * nada». Es el patrón que la casa ya tiene escrito para el inventario de
 * media: *un inventario no se puede derivar con un instrumento que muere en
 * la primera ausencia*.
 *
 * Y NO se salta en silencio (§regla 6, *un valor por defecto convierte «no lo
 * sé» en «está bien»*): el par no analizado sale del DENOMINADOR —si no,
 * `dimensionesIguales/n` bajaría y el veredicto voltearía a NO por un fallo
 * de lectura— y se publica aparte con su cardinal y su razón (§regla 14).
 * ═════════════════════════════════════════════════════════════════════════ */
async function analiza(pares) {
  let dim = 0, id = 0;
  const difDim = [], porFmt = new Map(), noAnalizables = [];
  for (const p of pares) {
    let a, b;
    try {
      [a, b] = await Promise.all([sharp(p.capturado).metadata(), sharp(p.generado).metadata()]);
    } catch (e) {
      noAnalizables.push({
        fichero: basename(p.capturado),
        chars: p.capturado.length,
        razon: String(e?.message ?? e).split("\n")[0],
      });
      continue;
    }
    if (a.width === b.width && a.height === b.height) dim++;
    else difDim.push({ n: basename(p.capturado), capturado: `${a.width}x${a.height}`, generado: `${b.width}x${b.height}` });
    if (sha(p.capturado) === sha(p.generado)) id++;
    const pct = ((statSync(p.generado).size - statSync(p.capturado).size) / statSync(p.capturado).size) * 100;
    if (!porFmt.has(a.format)) porFmt.set(a.format, []);
    porFmt.get(a.format).push(pct);
  }
  const peso = Object.fromEntries(
    [...porFmt].map(([f, v]) => [f, { n: v.length, media: +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1), min: +Math.min(...v).toFixed(1), max: +Math.max(...v).toFixed(1) }]),
  );
  /* `n` son los ANALIZADOS, no los pares: es el denominador de todo lo de
   * abajo y tiene que expresar lo que de verdad se comparó. `pares` va al
   * lado para que la diferencia sea visible y no haya que restarla. */
  return {
    n: pares.length - noAnalizables.length,
    pares: pares.length,
    dimensionesIguales: dim,
    shaIdentico: id,
    difDim,
    peso,
    noAnalizables,
  };
}
const G = await analiza(gen);
const S = await analiza(sub);

/* ══ 3 · ¿qué cajas del corpus NO regenera IMAGE_SIZES? ═════════════════
 * Los anchos se IMPORTAN de la config resuelta, no se copian: dos listas de
 * «los tamaños declarados» serían la clase C7. */
const require = createRequire(import.meta.url);
const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "defaults.mjs");
await require("esbuild").build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/defaults.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  logLevel: "silent",
});
const { IMAGE_SIZES } = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
const ANCHOS = new Set(IMAGE_SIZES.valor.map((s) => s.width));
const noRegenerable = new Map();
let variantesCuerpo = 0, regenerables = 0;
for (const u of enCuerpo) {
  const m = RE_VAR.exec(u.split("?")[0]);
  if (!m) continue;
  variantesCuerpo++;
  if (ANCHOS.has(Number(m[1]))) regenerables++;
  else noRegenerable.set(`${m[1]}x${m[2]}`, (noRegenerable.get(`${m[1]}x${m[2]}`) ?? 0) + 1);
}

/* ══ INFORME ════════════════════════════════════════════════════════════ */
const M = (n) => String(n).padStart(5);
console.log(`\n═══ ¿CAPTURAR VARIANTES, O SÓLO ORÍGENES? — ${PAGINAS.length} páginas congeladas ═══\n`);
console.log(`── 1 · ¿reproduce el pipeline REAL la variante capturada? ──────────`);
console.log(`  GENERADAS por sharp .... n=${M(G.n)}  dimensiones iguales ${G.dimensionesIguales}/${G.n} · sha256 idéntico ${G.shaIdentico}/${G.n}`);
for (const [f, p] of Object.entries(G.peso)) console.log(`      peso ${f.padEnd(5)} n=${String(p.n).padStart(3)}  media ${p.media >= 0 ? "+" : ""}${p.media}%  [${p.min}%, ${p.max}%]`);
for (const d of G.difDim.slice(0, 6)) console.log(`      ⚠ ${d.n}  capturado ${d.capturado} → generado ${d.generado}`);
console.log(`  CONTROL · SUBIDAS ...... n=${M(S.n)}  dimensiones iguales ${S.dimensionesIguales}/${S.n} · sha256 idéntico ${S.shaIdentico}/${S.n}  ← fichero contra sí mismo: tiene que ser 100 %`);
/* La limitación va CON SU CARDINAL y su denominador, no como nota al pie
 * (§regla 14): «no analiza algunas» es una frase, «no analiza 1 de 112» es
 * una decisión. Y sale nombrada aunque sea cero. */
const noAn = [...G.noAnalizables, ...S.noAnalizables];
console.log(
  `  noMide · ${noAn.length} par(es) NO analizables de ${G.pares + S.pares}` +
    (noAn.length ? ` — fuera del denominador de arriba:` : ` (ninguno)`),
);
for (const x of noAn) console.log(`      ⚠ ${x.fichero}  (ruta ${x.chars} chars) · ${x.razon}`);

console.log(`\n── 2 · las poblaciones del corpus, y qué hay que capturar ──────────`);
console.log(`  URLs de uploads en TODO el HTML .... ${M(enTodo.size)}  → orígenes ${origTodo.size}`);
console.log(`  URLs DENTRO de post_content ....... ${M(enCuerpo.size)}  → orígenes ${origCuerpo.size}`);
console.log(`  ⇒ el CASCARÓN se lleva ${enTodo.size - enCuerpo.size} URLs que el CMS no usa`);
console.log(`  ya locales ......................... ${M(origCuerpo.size - faltanCuerpo.length)}`);
console.log(`  ⇒ A CAPTURAR ....................... ${M(faltanCuerpo.length)}`);

console.log(`\n── 3 · cajas del CUERPO que IMAGE_SIZES no regenera ────────────────`);
console.log(`  variantes en el cuerpo ${variantesCuerpo} · regenerables ${regenerables} · no ${variantesCuerpo - regenerables}`);
for (const [k, n] of [...noRegenerable].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`      ${k} × ${n}`);

const reproduce = G.n > 0 && G.dimensionesIguales === G.n;
/* ⚠ `S.n === 0 || …` sería la regla 6 EN LA PROPIA GUARDA: un control vacío no
 * es un control que pasa, es un control que no existe. El sabotaje
 * `sin-poblaciones` vacía este cubo, y con el `||` salía VERDE. */
const controlOk = S.n > 0 && S.shaIdentico === S.n;
console.log(`\n═══ VEREDICTO ═════════════════════════════════════════════════════`);
console.log(`  ¿el pipeline reproduce la DIMENSIÓN?  ${reproduce ? "SÍ" : "NO"}   ${G.dimensionesIguales}/${G.n}`);
console.log(`  ¿y los BYTES?                        ${G.shaIdentico === G.n && G.n > 0 ? "SÍ" : "NO"}   ${G.shaIdentico}/${G.n}`);
console.log(`  ⇒ basta capturar los ORÍGENES para la GEOMETRÍA; los bytes se re-codifican.`);

w("medidas/media-regenera.json", {
  meta: {
    fecha: INDICE.meta.fecha,
    fuente: `corpus/ (${PAGINAS.length} páginas) + media/ (pipeline REAL de Payload+sharp) + apps/web/public/images`,
    pregunta: "¿hay que capturar las 1571 variantes, o basta con los orígenes y Payload regenera?",
    sabotaje: SABOTAJE,
  },
  reproduccion: { generadas: G, control_subidas: S },
  poblaciones: {
    urlsTodoElHtml: enTodo.size,
    origenesTodoElHtml: origTodo.size,
    urlsEnCuerpo: enCuerpo.size,
    origenesEnCuerpo: origCuerpo.size,
    yaLocales: origCuerpo.size - faltanCuerpo.length,
    aCapturar: faltanCuerpo.length,
  },
  cajasDelCuerpo: { variantes: variantesCuerpo, regenerables, noRegenerables: Object.fromEntries(noRegenerable) },
  listaACapturar: faltanCuerpo,
  veredicto: {
    reproduceDimension: reproduce,
    reproduceBytes: G.n > 0 && G.shaIdentico === G.n,
    controlOk,
    lectura: reproduce
      ? "el pipeline reproduce la DIMENSIÓN exacta de la variante capturada; los BYTES no (re-codificación). Para la geometría —lo único que este proyecto mide— basta con capturar los ORÍGENES."
      : "el pipeline NO reproduce la dimensión: hay que capturar las variantes",
  },
});

const errores = [];
if (G.n === 0) errores.push("PATRÓN MUERTO — 0 pares GENERADOS comparables. Sin `media/` sembrado no hay nada que comparar, y «todo coincide» sería falso.");
if (origCuerpo.size === 0)
  errores.push(
    "PATRÓN MUERTO — 0 URLs de uploads en los cuerpos de las 309 páginas.\n" +
      "   Una lista de captura VACÍA se lee como «ya está todo capturado», que es\n" +
      "   exactamente la regla del cero: no encontrar nada y no mirar nada dan la misma salida.",
  );
if (S.n === 0)
  errores.push(
    "CONTROL AUSENTE — 0 pares SUBIDOS. El control es la mitad que decide si la\n" +
      "   comparación significa algo (un fichero contra sí mismo TIENE que dar sha256\n" +
      "   idéntico). Un control vacío no es un control que pasa: es uno que no existe.",
  );
else if (!controlOk)
  errores.push(`CONTROL ROTO — ${S.shaIdentico}/${S.n} de los SUBIDOS dan sha256 idéntico. Un fichero comparado consigo mismo tiene que dar 100 %: si no, la comparación no mide lo que dice.`);
for (const e of errores) console.error(`\n❌ ${e}\n`);
process.exit(errores.length + ev.informe() ? 2 : 0);
