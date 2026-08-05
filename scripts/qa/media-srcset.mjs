/**
 * EL CONTRATO DEL `srcset` DEL ORIGINAL — derivado de la captura congelada.
 * Uso: npm run qa:media-srcset      (SABOTAJE=… → test en negativo)
 *
 * ── La pregunta que contesta, y por qué se hace ANTES de declarar nada ─────
 * El PLAN (§F2-2) cierra **M-IMG** con «los *image sizes* de Payload
 * **replicando el `srcset` del original**». Eso presupone que el `srcset` sale
 * de un conjunto FIJO de tamaños. Un `grep` tosco sobre `corpus/` devuelve
 * anchos irregulares —1110, 1156, 1198, 1238, 1279, 1333, 1338, 1478…— que es
 * la firma de anchos POR IMAGEN, y con esa lectura la premisa del PLAN es
 * falsa. **Un grep no distingue las dos cosas: hay que parsear el atributo.**
 *
 * Esta sonda no mide el clon: **deriva el contrato del lado del original**, y
 * lo hace sobre la captura de `corpus/` (309 páginas congeladas con sha256), no
 * pegándole al sitio vivo.
 *
 * ── Las CINCO derivaciones, y qué decide cada una ─────────────────────────
 *
 *   1 · **las dos poblaciones de anchos.** Un ancho del `srcset` puede venir de
 *       una VARIANTE generada (`-WxH` en el nombre) o del fichero ORIGINAL sin
 *       recortar. Son cosas distintas y el grep las mezcla: el primero es un
 *       tamaño declarable, el segundo es una propiedad de la imagen;
 *   2 · **las CAJAS, no los anchos.** WordPress mete la imagen en una caja y
 *       deja salir el lado libre; un retrato dentro de la caja 300×300 sale a
 *       247 de ancho. `247` parece un tamaño exótico y es la SALIDA de un
 *       tamaño fijo. Se agrupa por caja, no por ancho, o el censo cuenta
 *       tamaños que no existen;
 *   3 · **¿hay RECORTES?** Un recorte (proporción distinta de la del original)
 *       necesita `width`+`height`+`fit` en Payload; un reescalado sólo `width`.
 *       Los dos son declarables — la derivación dice CUÁL toca, no si se puede;
 *   4 · **¿el `srcset` es función de la IMAGEN?** Ésta es la que puede tumbar
 *       la premisa: si el mismo fichero se sirve con `srcset` DISTINTO en dos
 *       páginas, el atributo no lo determina la imagen —y por tanto tampoco un
 *       juego de tamaños— sino el punto de uso;
 *   5 · **CUERPO contra CASCARÓN.** Un `srcset` dentro del `post_content` es
 *       contenido y va al CMS; uno de fuera lo pone la plantilla del tema. La
 *       lectura de `googletagmanager` en C-SP6 aplicada al media: **contar los
 *       dos juntos infla el contrato con tamaños que ninguna entrada usa.**
 *
 * ── Tres cosas que la PRIMERA corrida destapó, y están aquí por eso ───────
 * · el patrón `sizes` casaba sobre `<link rel="icon" sizes="32x32">` — 309 de
 *   309 páginas. Es el **sobre-casado** de la regla 4 (tercera cara): un
 *   heurístico que encuentra de más no da error, da un dato plausible. Ahora se
 *   exige `<img>`/`<source>`;
 * · `srcset` SÍ está en las 309, y no es defecto: lo pone el **sello de
 *   certificación del pie** (cascarón). Por eso el máximo de ese patrón no es
 *   309−1 sino «no discrimina», declarado como tal — y el patrón que sí
 *   discrimina es el del cuerpo, con tope 209;
 * · hay **un** candidato cuyo descriptor `w` NO coincide con el ancho del
 *   fichero (`…-2048x1152.jpg 1920w`). Va a su propio cubo, nombrado. Fichado,
 *   no colado.
 *
 * ── Las guardas (reglas de `CLAUDE.md` §sondas) ───────────────────────────
 * · **regla 4, el cero:** un patrón que no casa en NINGUNA página sale por
 *   error, no por «esta propiedad no está»;
 * · **regla 4, el pleno:** todo patrón DISCRIMINANTE declara su máximo;
 * · **el markup se busca SIN `<style>` ni `<script>`** — el CSS de Divi nombra
 *   sus propias clases y el JS lleva plantillas de `srcset`;
 * · **`Evaluadas` con mínimo DERIVADO** del propio índice de la captura.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";
import { postContent } from "../seed/corpus.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const PAGINAS = Object.entries(INDICE.paginas);
/** Las colecciones que SÍ tienen `post_content` (las de builder no). Derivado. */
const CON_CUERPO = Object.entries(INDICE.resumen.porColeccion).filter(([, e]) => e.conPostContent > 0);
const MAX_CON_CUERPO = CON_CUERPO.reduce((a, [, e]) => a + e.conPostContent, 0);

/* ── sabotajes: cada uno tiene que caer por SU invariante ────────────────── */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "selector-muerto": "el atributo se busca por un nombre que no existe → patrón MUERTO (regla 4, el cero)",
  "sobre-casado": "`sizes` se busca sin exigir <img>/<source> → casa sobre <link rel=icon sizes=\"32x32\"> (regla 4, tercera cara)",
  "sin-marcado": "no se quitan <script>/<style> → DIANA PERDIDA declarada: en este corpus no cambia un byte",
  "un-solo-uso": "se pliegan las firmas por origen → la varianza POR PUNTO DE USO desaparece y el veredicto voltea",
  "sin-cajas": "se agrupa por ANCHO en vez de por CAJA → aparecen formas que ninguna caja explica",
  "sin-cascaron": "el cuerpo y el cascarón se cuentan juntos → el contrato se infla con tamaños que ninguna entrada usa",
  control: "ningún sabotaje: la sonda tiene que salir LIMPIA",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control")
  console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * CENSO DE PATRONES DE TEXTO — el `Censo` de `lib.mjs` vive en la página
 * (`page.evaluate`) y esta sonda es OFFLINE: no hay DOM. La regla que protege
 * es la misma y no se salta por eso, así que se implementan aquí sus dos caras.
 *
 * ⚠ `max: null` significa **enumerador, no discriminante**, y hay que
 * escribirlo: `srcset` está en las 309 porque el pie lleva el sello de
 * certificación. Exigirle que discrimine sería inventarle un trabajo que no
 * tiene — y callarlo sería dejar un pleno sin explicar, que es lo que la regla
 * prohíbe. El que discrimina es el del CUERPO, y ése sí lleva tope.
 * ═════════════════════════════════════════════════════════════════════════ */
class CensoTexto {
  constructor() { this.pat = new Map(); this.paginas = 0; }
  declara(id, { max, razon }) {
    if (max === null && !razon) throw new Error(`CensoTexto: '${id}' sin máximo tiene que declarar su RAZÓN`);
    this.pat.set(id, { casos: 0, paginas: 0, max, razon });
  }
  cuenta(id, n) {
    const p = this.pat.get(id);
    if (!p) throw new Error(`CensoTexto: patrón '${id}' sin declarar (una ausencia se rechaza, no se sustituye)`);
    p.casos += n;
    if (n > 0) p.paginas++;
  }
  pagina() { this.paginas++; }
  informe() {
    const muertos = [...this.pat].filter(([, p]) => p.casos === 0).map(([id]) => id);
    const ubicuos = [...this.pat]
      .filter(([, p]) => p.max !== null && p.paginas > p.max)
      .map(([id, p]) => `${id} (${p.paginas} páginas > máx ${p.max})`);
    if (muertos.length)
      console.error(
        `\n❌ ${muertos.length} PATRÓN(ES) MUERTO(S) — no casaron en NINGUNA de las ${this.paginas} páginas:\n` +
          muertos.map((s) => `     · ${s}`).join("\n") +
          `\n   Un patrón que no encuentra nada y uno que no mira nada dan la misma salida.\n`,
      );
    if (ubicuos.length)
      console.error(
        `\n❌ ${ubicuos.length} PATRÓN(ES) UBICUO(S) — casan por encima de su máximo declarado:\n` +
          ubicuos.map((s) => `     · ${s}`).join("\n") +
          `\n   Un patrón que casa en (casi) todas no discrimina: está mirando otra cosa.\n`,
      );
    if (!muertos.length && !ubicuos.length) {
      const enum_ = [...this.pat].filter(([, p]) => p.max === null).length;
      console.log(`  ✓ censo de patrones: ${this.pat.size} vivos (${enum_} enumeradores declarados), 0 muertos, 0 ubicuos (${this.paginas} páginas)`);
    }
    return muertos.length + ubicuos.length;
  }
  aJson() {
    return Object.fromEntries([...this.pat].map(([id, p]) => [id, { casos: p.casos, paginas: p.paginas, max: p.max, razon: p.razon ?? null }]));
  }
}

/* ── el markup, sin CSS ni JS (donde viven los selectores disfrazados) ───── */
const soloMarcado = (h) =>
  h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

/** El sufijo de variante de WordPress: `-<W>x<H>` justo antes de la extensión. */
const RE_VARIANTE = /-(\d+)x(\d+)(?=\.[A-Za-z0-9]+$)/;
/** Origen de una URL: la misma imagen sin su sufijo de variante. */
const origenDe = (url) => url.split("?")[0].replace(RE_VARIANTE, "");
const corto = (u) => u.replace("https://kunakair.com/wp-content/uploads/", "");

/**
 * Parsea un atributo `srcset` DE VERDAD — el formato es
 * `url [descriptor], url [descriptor], …` y el descriptor puede ser `Nw` o `Nx`.
 * Se parsea, no se `grep`ea: es la diferencia entera de esta derivación.
 */
function parseSrcset(v) {
  const out = [];
  for (const trozo of v.split(",")) {
    const t = trozo.trim();
    if (!t) continue;
    const partes = t.split(/\s+/);
    const url = partes[0];
    const desc = partes[1] ?? null;
    if (!url) continue;
    const mw = desc && /^(\d+)w$/.exec(desc);
    const mx = desc && /^([\d.]+)x$/.exec(desc);
    out.push({ url, w: mw ? Number(mw[1]) : null, x: mx ? Number(mx[1]) : null, desc });
  }
  return out;
}

/** Los `srcset` de un HTML, cada uno con el valor del atributo. Sólo `<img>`/`<source>`. */
function srcsetsDe(html, nombreAttr) {
  const RE = new RegExp(`<(?:img|source)\\b[^>]*?\\b(?:data-)?${nombreAttr}\\s*=\\s*"([^"]*)"[^>]*>`, "gi");
  return [...html.matchAll(RE)].map((m) => m[1]);
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA DERIVACIÓN
 * ═════════════════════════════════════════════════════════════════════════ */
const ev = new Evaluadas({ unidad: "páginas del corpus", minimo: PAGINAS.length, nombre: "media-srcset" });
const censo = new CensoTexto();
censo.declara("srcset en <img>/<source>", {
  max: null,
  razon: "enumerador, no discriminante: está en las 309 porque el PIE lleva el sello de certificación con srcset (cascarón, medido). El que discrimina es el del cuerpo",
});
censo.declara("sizes en <img>/<source>", {
  max: null,
  razon: "ídem — y restringido a img/source a propósito: sin restringir casaba sobre <link rel=icon sizes=32x32> en las 309 (sobre-casado)",
});
censo.declara("srcset DENTRO de post_content", {
  max: MAX_CON_CUERPO,
  razon: `las páginas de builder (casos · faqs · productos) NO tienen post_content: el tope se deriva del INDICE (${MAX_CON_CUERPO})`,
});
censo.declara("variante -WxH", { max: null, razon: "enumerador: el sello del pie ya trae una variante en las 309" });

/** origen → { firmas, variantes:Map(W→H), nativo } */
const porOrigen = new Map();
const anchosVariante = new Map();
const anchosFull = new Map();
/** "WxH" → { cuerpo, cascaron } */
const formas = new Map();
const formasSizes = new Map();
/** valores de `sizes` que NO pueden ser de una imagen (la forma de `<link rel=icon>`) */
const sizesImposibles = new Map();
/** candidatos cuyo descriptor `w` NO es el ancho del fichero */
const descriptorDiscrepante = [];
let atributos = 0, candidatos = 0, sinDescriptor = 0, conX = 0, mezclanOrigen = 0;
let atributosCuerpo = 0, atributosCascaron = 0;

for (const [clave, meta] of PAGINAS) {
  const crudo = readFileSync(join(CORPUS, meta.fichero), "utf8");
  const html = SABOTAJE === "sin-marcado" ? crudo : soloMarcado(crudo);
  censo.pagina();

  const cuerpo = postContent(html);
  // ⚠ SABOTAJE `sin-cascaron`: todo cuenta como cuerpo, y el contrato se infla.
  const enCuerpo = SABOTAJE === "sin-cascaron" ? new Set() : new Set(cuerpo ? srcsetsDe(cuerpo, "srcset") : []);

  const nombreAttr = SABOTAJE === "selector-muerto" ? "srcsets" : "srcset";
  const valores = srcsetsDe(html, nombreAttr);
  const delCuerpo = cuerpo ? srcsetsDe(SABOTAJE === "selector-muerto" ? cuerpo : cuerpo, nombreAttr) : [];
  censo.cuenta("srcset en <img>/<source>", valores.length);
  censo.cuenta("srcset DENTRO de post_content", delCuerpo.length);

  let nVar = 0;
  for (const valor of valores) {
    atributos++;
    const esCuerpo = SABOTAJE === "sin-cascaron" ? true : enCuerpo.has(valor);
    if (esCuerpo) atributosCuerpo++; else atributosCascaron++;
    const cands = parseSrcset(valor);
    candidatos += cands.length;
    sinDescriptor += cands.filter((c) => c.desc === null).length;
    conX += cands.filter((c) => c.x !== null).length;
    const conAncho = cands.filter((c) => c.w !== null);
    if (!conAncho.length) continue;

    if (new Set(conAncho.map((c) => origenDe(c.url))).size > 1) mezclanOrigen++;
    const o = origenDe(conAncho[0].url);

    // La FIRMA de este uso. Es lo que hace visible que dos usos de la MISMA
    // imagen traigan `srcset` distinto — la derivación nº 4.
    const firma = conAncho
      .map((c) => {
        const vm = c.url.split("?")[0].match(RE_VARIANTE);
        return vm ? `${vm[1]}x${vm[2]}` : `FULL@${c.w}`;
      })
      .sort()
      .join(" ");

    if (!porOrigen.has(o)) porOrigen.set(o, { firmas: new Map(), variantes: new Map(), nativo: null, cuerpo: false });
    const reg = porOrigen.get(o);
    if (esCuerpo) reg.cuerpo = true;
    // ⚠ SABOTAJE `un-solo-uso`: pliega las firmas. Es el defecto que haría
    // invisible la varianza por punto de uso — el hallazgo que decide el PASO 1.
    const clv = SABOTAJE === "un-solo-uso" ? "(plegada)" : firma;
    if (!reg.firmas.has(clv)) reg.firmas.set(clv, { n: 0, paginas: new Set() });
    const f = reg.firmas.get(clv);
    f.n++; f.paginas.add(clave);

    for (const c of conAncho) {
      const vm = c.url.split("?")[0].match(RE_VARIANTE);
      if (!vm) { anchosFull.set(c.w, (anchosFull.get(c.w) || 0) + 1); reg.nativo = c.w; continue; }
      nVar++;
      anchosVariante.set(c.w, (anchosVariante.get(c.w) || 0) + 1);
      if (Number(vm[1]) !== c.w) descriptorDiscrepante.push({ url: corto(c.url), fichero: `${vm[1]}x${vm[2]}`, descriptor: `${c.w}w`, pagina: clave });
      // ⚠ SABOTAJE `sin-cajas`: agrupa por ANCHO en vez de por caja WxH.
      const k = SABOTAJE === "sin-cajas" ? `${vm[1]}x?` : `${vm[1]}x${vm[2]}`;
      const e = formas.get(k) || { cuerpo: 0, cascaron: 0 };
      e[esCuerpo ? "cuerpo" : "cascaron"]++;
      formas.set(k, e);
      reg.variantes.set(Number(vm[1]), Number(vm[2]));
    }
  }
  censo.cuenta("variante -WxH", nVar);

  /* ⚠ SABOTAJE `sobre-casado`: busca `sizes` sin exigir `<img>`/`<source>`, que
   * es literalmente el defecto de la primera corrida — casaba sobre
   * `<link rel="icon" sizes="32x32">` en las 309 páginas y lo contaba como
   * dato. La guarda de abajo es la que lo caza. */
  const valoresSizes =
    SABOTAJE === "sobre-casado"
      ? [...html.matchAll(/\bsizes\s*=\s*"([^"]*)"/gi)].map((m) => m[1])
      : srcsetsDe(html, "sizes");
  let nSizes = 0;
  for (const v of valoresSizes) {
    nSizes++;
    formasSizes.set(v, (formasSizes.get(v) || 0) + 1);
    // Un `sizes` de imagen es una lista de condiciones con longitudes; `32x32`
    // es la forma de `<link rel="icon">`, no de una imagen. Si aparece, el
    // patrón está mirando otra cosa: sale por error, no como forma nº 76.
    if (/^\s*\d+x\d+\s*$/.test(v)) sizesImposibles.set(v, (sizesImposibles.get(v) || 0) + 1);
  }
  censo.cuenta("sizes en <img>/<source>", nSizes);
  ev.ok();
}

/* ── 1 · las dos poblaciones de anchos ───────────────────────────────────── */
const setVar = new Set(anchosVariante.keys());
const setFull = new Set(anchosFull.keys());
const ordena = (s) => [...s].sort((a, b) => a - b);
const soloVariante = ordena([...setVar].filter((x) => !setFull.has(x)));
const ambos = ordena([...setVar].filter((x) => setFull.has(x)));
const soloOriginal = ordena([...setFull].filter((x) => !setVar.has(x)));

/* ── 2 · las CAJAS ───────────────────────────────────────────────────────── */
const listaFormas = [...formas.keys()].filter((k) => !k.endsWith("x?")).map((k) => k.split("x").map(Number));
/** Un lado es FIJO si lo comparten ≥2 formas distintas: eso es un tamaño declarado. */
function ladosFijos(i) {
  const m = new Map();
  for (const f of listaFormas) {
    const v = f[i];
    if (!m.has(v)) m.set(v, new Set());
    m.get(v).add(f.join("x"));
  }
  return new Set([...m].filter(([, s]) => s.size >= 2).map(([v]) => v));
}
const anchoFijo = ladosFijos(0);
const altoFijo = ladosFijos(1);
/** Formas cuyo descriptor discrepa: se sacan del reparto y van a su cubo. */
const discrepantes = new Set(descriptorDiscrepante.map((d) => d.fichero));

const cajas = new Map();
const sinCaja = [];
for (const [k, n] of formas) {
  if (k.endsWith("x?")) { sinCaja.push(k); continue; }
  if (discrepantes.has(k)) continue;
  const [W, H] = k.split("x").map(Number);
  let id;
  if (anchoFijo.has(W) && !altoFijo.has(H)) id = `w${W}`;
  else if (altoFijo.has(H) && !anchoFijo.has(W)) id = `caja${H}`;
  else if (W === H) id = `caja${W}`;
  else if (anchoFijo.has(W)) id = `w${W}`;
  else { sinCaja.push(k); continue; }
  const c = cajas.get(id) || { formas: new Set(), cuerpo: 0, cascaron: 0 };
  c.formas.add(k); c.cuerpo += n.cuerpo; c.cascaron += n.cascaron;
  cajas.set(id, c);
}

/* ── 3 · ¿RECORTES? proporción de las variantes de un mismo origen ───────── */
const recortes = [];
let conVariasVariantes = 0;
for (const [o, reg] of porOrigen) {
  if (reg.variantes.size < 2) continue;
  conVariasVariantes++;
  const rs = [...reg.variantes].map(([W, H]) => W / H);
  const tol = 1.5 / Math.min(...reg.variantes.values()); // el alto es entero: el error de redondeo es ~1/h
  const min = Math.min(...rs), max = Math.max(...rs);
  if ((max - min) / min > tol)
    recortes.push({ origen: corto(o), formas: [...reg.variantes].map(([W, H]) => `${W}x${H} (${(W / H).toFixed(4)})`) });
}
/* ── ¿QUÉ LADO del conflicto recorta? ──────────────────────────────────────
 * Un conflicto de proporción implica DOS formas, y marcar las dos como
 * «recorta» es lo que hacía la primera versión: dejaba `w480` —88 formas WxH
 * distintas, o sea alto libre— señalado como recortador por aparecer enfrente
 * de un `600x600`. Eso no es una medida, es no haber repartido la culpa.
 *
 * El reparto sale de la FORMA de la caja, que ya está derivada: una caja con
 * muchas formas distintas tiene ese lado LIBRE (escala); una con dos o tres lo
 * tiene ACOTADO. En un conflicto, quien recorta es la acotada.
 *
 *   · CONSTREÑIDA (≤3 formas) e implicada en un conflicto → recorta: en Payload
 *     necesita `width`+`height`+`fit`;
 *   · LIBRE (>3 formas) → escala: le basta `width`.
 */
const LIBRE = 3; // umbral declarado, no implícito
const cajasQueRecortan = new Set();
for (const r of recortes) {
  for (const f of r.formas) {
    const forma = f.split(" ")[0];
    for (const [id, c] of cajas) if (c.formas.has(forma) && c.formas.size <= LIBRE) cajasQueRecortan.add(id);
  }
}

/* ── 4 · ¿el `srcset` es función de la IMAGEN? ───────────────────────────── */
const multiFirma = [...porOrigen].filter(([, r]) => r.firmas.size > 1);

/* ── 5 · cuerpo contra cascarón ──────────────────────────────────────────── */
const origenesCuerpo = [...porOrigen].filter(([, r]) => r.cuerpo).length;

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
const M = (n) => String(n).padStart(5);
console.log(`\n═══ CONTRATO DEL \`srcset\` — derivado de corpus/ (${PAGINAS.length} páginas congeladas) ═══\n`);
console.log(`  atributos srcset ......... ${M(atributos)}  (cuerpo ${atributosCuerpo} · cascarón ${atributosCascaron})`);
console.log(`  candidatos ............... ${M(candidatos)}  (sin descriptor ${sinDescriptor} · con \`Nx\` ${conX})`);
console.log(`  imágenes ORIGEN .......... ${M(porOrigen.size)}  (de ellas EN CUERPO ${origenesCuerpo})`);
console.log(`  ⇒ las 1 819 URLs del INDICE son VARIANTES: el srcset multiplica.`);

console.log(`\n── 1 · las DOS poblaciones de anchos ───────────────────────────────`);
console.log(`  anchos distintos: ${setVar.size + soloOriginal.length}`);
console.log(`  · como VARIANTE generada (${setVar.size}): ${ordena(setVar).join(" · ")}`);
console.log(`  · SOLO como original sin recortar (${soloOriginal.length}): ${soloOriginal.slice(0, 20).join(" · ")}${soloOriginal.length > 20 ? ` … +${soloOriginal.length - 20}` : ""}`);
console.log(`  · en ambas (${ambos.length}): ${ambos.join(" · ")}`);
console.log(`  ⇒ los anchos IRREGULARES del grep son la anchura NATIVA de cada imagen, no tamaños.`);

console.log(`\n── 2 · las CAJAS (no los anchos) ───────────────────────────────────`);
for (const [id, c] of [...cajas].sort((a, b) => b[1].cuerpo + b[1].cascaron - a[1].cuerpo - a[1].cascaron))
  console.log(
    `  ${id.padEnd(9)} ${String(c.formas.size).padStart(3)} formas WxH · cuerpo ${String(c.cuerpo).padStart(4)} · cascarón ${String(c.cascaron).padStart(4)}` +
      `  ${c.formas.size > LIBRE ? "escala (width)" : "acotada"}` +
      (cajasQueRecortan.has(id) ? "  ⚠ RECORTA (width+height+fit)" : ""),
  );
if (descriptorDiscrepante.length)
  console.log(`  ⚠ ${descriptorDiscrepante.length} candidato(s) con descriptor ≠ ancho del fichero, fuera del reparto: ` +
    descriptorDiscrepante.map((d) => `${d.fichero}→${d.descriptor}`).join(" "));

console.log(`\n── 3 · ¿RECORTES? ──────────────────────────────────────────────────`);
console.log(`  orígenes con ≥2 variantes: ${conVariasVariantes} · con proporción INCOMPATIBLE: ${recortes.length}`);
for (const r of recortes.slice(0, 6)) console.log(`     ⚠ ${r.origen}  ${r.formas.join("  ")}`);
console.log(`  cajas que recortan: ${[...cajasQueRecortan].join(" ") || "(ninguna)"}`);

console.log(`\n── 4 · ¿el \`srcset\` es función de la IMAGEN? ───────────────────────`);
console.log(`  orígenes con MÁS DE UNA firma de srcset: ${multiFirma.length} de ${porOrigen.size}`);
for (const [o, r] of multiFirma.slice(0, 4)) {
  console.log(`     ${corto(o)}`);
  for (const [f, d] of r.firmas) console.log(`        ×${String(d.n).padStart(3)}  ${f}`);
}

console.log(`\n── formas del atributo \`sizes\`: ${formasSizes.size} distintas ──────────────`);

/* ── EL VEREDICTO ────────────────────────────────────────────────────────── */
const generaLosFicheros = sinCaja.length === 0;
const esFuncionDeLaImagen = multiFirma.length === 0;
console.log(`\n═══ VEREDICTO ═════════════════════════════════════════════════════`);
console.log(`  ¿un juego FIJO genera los FICHEROS?   ${generaLosFicheros ? "SÍ" : "NO"}   ` +
  `${cajas.size} cajas · ${cajasQueRecortan.size} con recorte · ${sinCaja.length} formas sin caja · ${descriptorDiscrepante.length} excepción(es) nombrada(s)`);
console.log(`  ¿el \`srcset\` es función de la IMAGEN? ${esFuncionDeLaImagen ? "SÍ" : "NO"}   ` +
  `${multiFirma.length} orígenes con ≥2 firmas`);
console.log(
  `  ⇒ un juego fijo de image sizes es ` +
    (generaLosFicheros && esFuncionDeLaImagen ? "SUFICIENTE" : generaLosFicheros ? "NECESARIO y NO SUFICIENTE" : "INSUFICIENTE") +
    `.`,
);
if (generaLosFicheros && !esFuncionDeLaImagen)
  console.log(
    `     Los TAMAÑOS son declarables; el ATRIBUTO no sale de ellos: se compone en\n` +
      `     el punto de USO (la lista se topa en el ancho pedido y lo incluye). Ese\n` +
      `     dato NO está en la colección de media — y hoy no está modelado en ningún\n` +
      `     sitio. M-IMG no se cierra declarando imageSizes.`,
  );

/* ── congelar ────────────────────────────────────────────────────────────── */
w("medidas/media-srcset.json", {
  meta: {
    fecha: INDICE.meta.fecha,
    fuente: `corpus/ (${PAGINAS.length} páginas congeladas, sha256 por página)`,
    alcance:
      "grupo A (entradas-blog · terminos-kunakpedia · documentos-cientificos) + casos · faqs · productos. " +
      "⚠ NO incluye sectores ni monograficos — están FUERA del corpus por construcción (INDICE.meta.fuera), " +
      "y son EXACTAMENTE la población donde M-IMG está medida.",
    sabotaje: SABOTAJE,
  },
  totales: { paginas: PAGINAS.length, atributos, atributosCuerpo, atributosCascaron, candidatos, origenes: porOrigen.size, origenesCuerpo, sinDescriptor, conX, mezclanOrigen },
  censo: censo.aJson(),
  anchos: { soloVariante, ambos, soloOriginal, frecuenciaVariante: Object.fromEntries([...anchosVariante].sort((a, b) => a[0] - b[0])) },
  cajas: Object.fromEntries(
    [...cajas].map(([id, c]) => [id, { formas: [...c.formas].sort(), cuerpo: c.cuerpo, cascaron: c.cascaron, recorta: cajasQueRecortan.has(id) }]),
  ),
  formasSinCaja: sinCaja,
  descriptorDiscrepante,
  recortes,
  porPuntoDeUso: {
    origenesConVariasFirmas: multiFirma.length,
    origenes: porOrigen.size,
    ejemplos: multiFirma.slice(0, 20).map(([o, r]) => ({
      origen: corto(o),
      firmas: [...r.firmas].map(([f, d]) => ({ firma: f, usos: d.n, paginas: [...d.paginas].slice(0, 4) })),
    })),
  },
  sizes: { formas: formasSizes.size, top: Object.fromEntries([...formasSizes].sort((a, b) => b[1] - a[1]).slice(0, 12)) },
  veredicto: {
    generaLosFicheros,
    esFuncionDeLaImagen,
    lectura:
      generaLosFicheros && !esFuncionDeLaImagen
        ? "un juego FIJO de image sizes genera todos los ficheros que el corpus usa, pero NO determina el atributo: el srcset se compone en el punto de USO. M-IMG no se cierra declarando imageSizes."
        : "ver el informe",
  },
});

const fallos = censo.informe() + ev.informe() + (sinCaja.length ? 1 : 0) + (sizesImposibles.size ? 1 : 0);
if (sinCaja.length) console.error(`\n❌ ${sinCaja.length} forma(s) WxH que ninguna caja explica: ${sinCaja.join(" ")}`);
if (sizesImposibles.size)
  console.error(
    `\n❌ PATRÓN SOBRE-CASADO — ${sizesImposibles.size} valor(es) de \`sizes\` que NO pueden ser de una\n` +
      `   imagen (es la forma de \`<link rel="icon" sizes="32x32">\`): ` +
      [...sizesImposibles].map(([v, n]) => `"${v}"×${n}`).join(" ") + `\n` +
      `   Un heurístico que encuentra DE MÁS no da error: da un dato plausible.\n`,
  );
process.exit(fallos ? 2 : 0);
