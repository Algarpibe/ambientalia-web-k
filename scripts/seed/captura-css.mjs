/**
 * LAS HOJAS CSS ENLAZADAS — el cuarto canal que se descubrió chocando.
 * Uso: npm run cms:captura-css -- --pagina=corpus/casos/<fichero>.html
 *      SOLO_DERIVA=1 npm run cms:captura-css     (inventario, sin pedir nada)
 * Negativo: npm run cms:captura-css-neg
 *
 * ── POR QUÉ EXISTE, y por qué es una REGLA y no una ficha ─────────────────
 * Es la **cuarta** vez que un canal de media aparece chocando en vez de
 * derivarse (§EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA
 * DECLARA): cuerpos → destacadas → panel de producto → **hojas enlazadas**.
 * Las tres primeras mataron un seed; ésta dejó una condición de T9 sin pagar
 * y una campaña (`cqa6`) midiendo contra una captura *plausible y equivocada*
 * (§F3-1-CSS-NO-CAPTURADO: `columna.width` **678.52 offline contra 430.80** en
 * vivo, porque sin las hojas la partición en columnas no ocurre).
 *
 * Un HTML capturado sin sus hojas **no es la página**: es su esqueleto con el
 * estilo puesto por otro. Y el corpus lo lleva declarando desde el principio
 * en el sitio equivocado — dentro del comentario de `clasesConEstiloDe`, como
 * límite de una función, en vez de como hueco del archivo.
 *
 * ── LO QUE DERIVA (siempre) Y LO QUE PIDE (sólo lo que se le nombre) ──────
 * El inventario se deriva de **todo el corpus**, no de la página que se vaya a
 * capturar: un canal declarado y todavía sin dato **sale nombrado con su cero**,
 * que es lo que lo convierte en hueco visible en vez de en la próxima sorpresa.
 * Medido hoy: **505 hojas distintas · 62 en más de una página · 443 en una
 * sola**, y de ellas **498 son `et-cache`** — Divi compila una hoja por página
 * y por plantilla, así que el inventario NO es un conjunto pequeño y compartido.
 *
 * Lo que se **pide** es sólo la lista que se nombre por parámetro. Una sola
 * definición de «lo que falta», elegida por argumento y **nunca por fallback
 * silencioso**: sin `--pagina` ni `SOLO_DERIVA` esto TIRA, porque «captura todo
 * el corpus» son 505 peticiones y ésa es una campaña, no un parámetro por
 * defecto (§regla 6 — una ausencia se rechaza, no se sustituye).
 *
 * ── LA ETIQUETA ──────────────────────────────────────────────────────────
 * UNA petición por fichero · secuencial · 500 ms · nunca en paralelo · sha256 ·
 * reanudable entre corridas · COMMITEADA antes de derivar nada contra ella.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const DESTINO = join(RAIZ, "corpus/css");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;

const arg = (n) => (process.argv.slice(2).find((a) => a.startsWith(`--${n}=`)) ?? "").split("=").slice(1).join("=") || null;
const PAGINA = process.env.PAGINA || arg("pagina");

/** §sondas 5 · una corrida negativa NO pisa el índice de la campaña buena. */
const NEG = process.env.NEG || null;
const INDICE = join(DESTINO, NEG ? `INDICE-neg-${NEG}.json` : "INDICE.json");

const SABOTAJE_NO_404 = process.env.SABOTAJE === "error-no-404";
if (process.env.SABOTAJE && !SABOTAJE_NO_404)
  throw new Error(`SABOTAJE desconocido: '${process.env.SABOTAJE}' (error-no-404)`);

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── la derivación: el inventario completo, de todo el corpus ─────────────── */
/**
 * Se lee el `<link>` **sin filtrar por `rel="stylesheet"` a secas**: el corpus
 * trae la misma hoja escrita de dos formas y contar sólo una daría un número
 * plausible más bajo. La condición es *rel de hoja de estilo* **o** *href .css*.
 */
const RE_LINK = /<link\b[^>]*>/gi;
const hojaDe = (tag) => {
  if (!/stylesheet/i.test(tag) && !/\.css/i.test(tag)) return null;
  const m = tag.match(/href=["']([^"']+)["']/i);
  return m ? m[1] : null;
};
/** La URL sin `?ver=`: el query es la versión del plugin, no otro fichero. */
const sinVer = (u) => u.split("?")[0];

const htmls = [];
(function anda(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) {
      if (p !== DESTINO) anda(p);
    } else if (/\.html?$/i.test(e.name)) htmls.push(p);
  }
})(CORPUS);

if (!htmls.length)
  throw new Error(
    "0 ficheros HTML en `corpus/`: sin páginas no hay hojas que derivar, y su cero\n" +
      "  se leería como «no hay nada que capturar» — la regla del cero.",
  );

const inventario = new Map(); // url sin ?ver → { paginas:Set, conVer:Set }
for (const f of htmls) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(RE_LINK)) {
    const href = hojaDe(m[0]);
    if (!href) continue;
    const base = sinVer(href);
    if (!inventario.has(base)) inventario.set(base, { paginas: new Set(), conVer: new Set() });
    inventario.get(base).paginas.add(relative(RAIZ, f).split("\\").join("/"));
    inventario.get(base).conVer.add(href);
  }
}

const familiaDe = (u) =>
  u.includes("/et-cache/") ? "et-cache" : u.includes("/plugins/") ? "plugins" : u.includes("/themes/") ? "themes" : u.includes("/wp-includes/") ? "wp-includes" : "otro";

const yaCapturada = (base) => {
  const destino = join(DESTINO, rutaLocalDe(base));
  return existsSync(destino);
};
/** `https://kunakair.com/wp-content/themes/X/style.css` → `wp-content/themes/X/style.css`. */
const rutaLocalDe = (u) => u.replace(/^https?:\/\/[^/]+\//, "").replace(/[?#].*$/, "");

const porFamilia = {};
for (const [u] of inventario) {
  const f = familiaDe(u);
  porFamilia[f] = (porFamilia[f] ?? 0) + 1;
}
const compartidas = [...inventario.values()].filter((v) => v.paginas.size > 1).length;

console.log(`\n════════ HOJAS CSS ENLAZADAS — inventario del corpus ════════\n`);
console.log(`  HTML leídos          ${htmls.length}`);
console.log(`  hojas distintas      ${inventario.size}   (sin \`?ver=\`)`);
console.log(`  en más de 1 página   ${compartidas}`);
console.log(`  en 1 sola página     ${inventario.size - compartidas}`);
console.log(`  por familia          ${Object.entries(porFamilia).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
const capturadasYa = [...inventario.keys()].filter(yaCapturada).length;
console.log(`  ya capturadas        ${capturadasYa} de ${inventario.size}`);

/* ── la lista que se pide, que NO es el inventario ────────────────────────── */
let lista = [];
if (PAGINA) {
  const f = join(RAIZ, PAGINA);
  if (!existsSync(f))
    throw new Error(
      `PÁGINA AUSENTE: no existe ${PAGINA}.\n` +
        `  Se nombra la ruta del HTML del corpus, p.ej. corpus/casos/<fichero>.html`,
    );
  const html = readFileSync(f, "utf8");
  const suyas = [];
  for (const m of html.matchAll(RE_LINK)) {
    const href = hojaDe(m[0]);
    if (href) suyas.push(href);
  }
  if (!suyas.length)
    throw new Error(
      `0 hojas enlazadas en ${PAGINA}: eso NO es «esta página no necesita CSS».\n` +
        `  Es una lectura que no encontró nada, y su cero saldría como campaña verde\n` +
        `  sin pedir un fichero (§sondas 4).`,
    );
  /* Se pide CON su `?ver=`: es la URL que el documento sirve. */
  lista = [...new Set(suyas)];
  console.log(`\n  lista pedida         ${lista.length} hojas de ${PAGINA}`);
} else if (!SOLO_DERIVA) {
  throw new Error(
    "SIN LISTA: hay que nombrar qué capturar (`--pagina=corpus/…/x.html`) o pedir sólo el\n" +
      "  inventario (`SOLO_DERIVA=1`).\n" +
      `  Capturar el inventario entero son ${inventario.size} peticiones: eso es una campaña con su\n` +
      "  encargo, no el valor por defecto de un parámetro que se olvidó.",
  );
}

const pendientes = lista.filter((u) => !yaCapturada(sinVer(u)));
console.log(`  ya en corpus/css     ${lista.length - pendientes.length}`);
console.log(`  A PEDIR              ${pendientes.length}\n`);

/* ── la campaña ──────────────────────────────────────────────────────────── */
const ev = new Evaluadas({
  sonda: "captura-css",
  unidad: "hojas",
  minimo: SOLO_DERIVA ? 1 : pendientes.length || 1,
});

const ficheros = existsSync(INDICE) ? (JSON.parse(readFileSync(INDICE, "utf8")).ficheros ?? {}) : {};
const fallos = [];

if (!SOLO_DERIVA) {
  for (const [i, url] of pendientes.entries()) {
    const base = sinVer(url);
    const local = rutaLocalDe(base);
    try {
      const r = await fetch(SABOTAJE_NO_404 ? url.replace(/\.css/, ".no-existe.css") : url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      const destino = join(DESTINO, local);
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(destino, buf);
      ficheros[local] = { url, bytes: buf.length, sha256: sha(buf), fecha: hoy() };
      console.log(`  ✓ ${String(i + 1).padStart(3)}/${pendientes.length}  ${local}  (${buf.length} bytes)`);
    } catch (e) {
      fallos.push({ url, error: String(e.message ?? e) });
      console.log(`  ✗ ${String(i + 1).padStart(3)}/${pendientes.length}  ${local}  ${e.message ?? e}`);
    }
    ev.ok(1);
    if (i < pendientes.length - 1) await dormir(ESPACIADO_MS);
  }
} else ev.ok(1);

mkdirSync(DESTINO, { recursive: true });
writeFileSync(
  INDICE,
  JSON.stringify(
    {
      meta: {
        fecha: hoy(),
        fuente: "hojas CSS que el HTML del corpus enlaza (bytes servidos, sin re-codificar)",
        derivacion: "los <link> de los 782 HTML de corpus/ — inventario completo; se PIDE sólo la lista nombrada",
        etiqueta: `secuencial · ${ESPACIADO_MS} ms entre peticiones · sha256 · reanudable`,
        alcance: PAGINA ? `lista de ${PAGINA}` : "sólo derivación",
      },
      resumen: {
        htmlLeidos: htmls.length,
        hojasDistintas: inventario.size,
        enMasDeUnaPagina: compartidas,
        enUnaSola: inventario.size - compartidas,
        porFamilia,
        capturadas: Object.keys(ficheros).length,
        sinCapturar: inventario.size - [...inventario.keys()].filter(yaCapturada).length,
        fallos: fallos.length,
      },
      inventario: Object.fromEntries(
        [...inventario].map(([u, v]) => [u, { familia: familiaDe(u), paginas: v.paginas.size, capturada: yaCapturada(u) }]),
      ),
      ficheros,
      fallos,
    },
    null,
    2,
  ),
);

console.log(`\n  índice               ${relative(RAIZ, INDICE).split("\\").join("/")}`);
console.log(`  capturadas en total  ${Object.keys(ficheros).length}`);
if (fallos.length) {
  console.log(`\n⛔ ${fallos.length} FALLOS`);
  for (const f of fallos) console.log(`   ${f.url} — ${f.error}`);
  process.exitCode = 2;
} else if (!SOLO_DERIVA) console.log(`\n✅ ${pendientes.length} hojas capturadas · 0 fallos`);
