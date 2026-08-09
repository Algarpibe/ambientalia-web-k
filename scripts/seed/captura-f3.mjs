/**
 * LA ÚLTIMA CAMPAÑA CONTRA EL SITIO VIVO — lo que el corpus de F2-2 no cubre.
 * Uso: npm run cms:captura-f3            (SOLO_DERIVA=1 → deriva y no pide nada)
 *
 * ── Qué congela, y por qué se hace UNA vez ─────────────────────────────────
 * `corpus/` (309 páginas, 2026-08-04) capturó las SEIS colecciones que F2-2
 * necesitaba: blog · términos · documentos científicos · casos · faqs ·
 * productos. Fuera quedó todo lo demás del original, que es exactamente lo que
 * la FASE 3 va a construir: los 13 del centro de ayuda, los 35 listados/hubs
 * con su paginación, la cola larga de páginas sueltas, y las familias de
 * archivo que NINGÚN censo ha mirado (`/es/categoria/*` — LH-SP8 —, `author`,
 * `sector`).
 *
 * El original es un sitio VIVO (`CLAUDE.md` §Notas de método): cada día que
 * pasa la captura que no se hizo es una captura que ya no se puede hacer igual.
 * Por eso esto es UNA campaña, no una por bloque de la fase.
 *
 * ── Dónde vive, y qué NO mueve ─────────────────────────────────────────────
 * En `corpus/fase-3/`, **con su propio índice** (`corpus/fase-3/INDICE.json`).
 * Dentro de `corpus/` para que la regla `corpus/** -text` de `.gitattributes`
 * la cubra sin excepciones nuevas —son BYTES del original y su sha256 tiene que
 * casar en el siguiente checkout— y **con denominador propio** para que los
 * congelados no se muevan: `corpus/INDICE.json` sigue diciendo **309** y
 * `a-censo.json` sigue diciendo **209**. Nada de esta campaña entra en esos dos
 * números, ni en `cms:captura` (su PLAN se deriva de los censos, no del disco).
 *
 * ── La etiqueta, la misma de la tanda 27 ───────────────────────────────────
 * UNA petición por página · SECUENCIAL · espaciada (500 ms) · NUNCA en
 * paralelo · sha256 de los bytes · «una vez por página» ENTRE corridas (si el
 * fichero está en disco no se vuelve a pedir, así que una corrida interrumpida
 * se reanuda sin re-pegar). Y se COMMITEA antes de transformar nada.
 *
 * ── La lista de trabajo se DERIVA, no se escribe (regla 9) ─────────────────
 * De cinco fuentes, cuatro congeladas y una viva:
 *
 *   · `medidas/grupo-d-inventario.json`  → los 13 del centro de ayuda
 *   · `medidas/lh-censo.json`            → los 35 listados y hubs
 *   · `corpus/**.html` (309, congelado)  → los `href` a `/es/…` del original,
 *                                          que es donde viven las familias que
 *                                          NO están en ningún sitemap
 *   · `apps/web/src/lib/*.ts`            → los `href` que el clon ya transcribe
 *   · `sitemap_index.xml` (VIVO)         → los 11 sub-sitemaps, congelados aquí
 *                                          porque hasta hoy sólo había 2
 *
 * ── Las guardas que cierran el código de salida ────────────────────────────
 * 1 · **FAMILIA SIN DECIDIR** — si ≥3 URLs desconocidas comparten prefijo y ese
 *     prefijo no está en `FAMILIAS`, TIRA. Es la guarda de `captura.mjs`
 *     («colección sin decidir») trasladada a la unidad de esta campaña: sin
 *     ella, una familia entera se barre a «sueltas» y el informe la cuenta como
 *     cola larga. La ausencia se rechaza, no se sustituye (regla 6);
 * 2 · **COLISIÓN** — dos URLs distintas no pueden caer en el mismo fichero;
 * 3 · **`Evaluadas`** con el mínimo DERIVADO del tamaño de la lista;
 * 4 · **`gritaSiRevienta`** — una muerte temprana no puede salir en verde.
 *
 * ── Lo que esta campaña NO hace ────────────────────────────────────────────
 * No transforma, no sanea, no siembra y no mide píxeles. Congela bytes.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1"; // sólo pega al original: un build del clon no contamina
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const BASE = join(CORPUS, "fase-3");
const INDICE_F3 = join(BASE, "INDICE.json");
const SITEMAPS = join(BASE, "_sitemaps");
const ORIGEN = "https://kunakair.com";
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const MAX_PAGINA = 64; // el tope de `lh-paginas`: ningún listado del sitio se acerca
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;
/** Sabotajes del test en negativo. Cada uno tiene que morder por SU guarda. */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = ["familia-sin-decidir", "colision", "cero-evaluadas"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — su guarda DEBE morder.\n`);

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const leeMedida = (f) => JSON.parse(readFileSync(join(QA, "medidas", f), "utf8"));

/**
 * La ruta canónica de una URL del original: pathname con barra final.
 * Devuelve `null` para lo que NO es una página (`mailto:`, otro host, una
 * cadena rota). Un `null` que se colara como ruta sería la regla 4 —un selector
 * que no casa da un cero, no un error—, así que quien llama lo filtra y lo
 * CUENTA aparte, nunca lo descarta en silencio.
 */
const camino = (u) => {
  let p;
  try {
    p = new URL(u, ORIGEN);
  } catch {
    return null;
  }
  if (p.host !== "kunakair.com") return null;
  let ruta = decodeURI(p.pathname);
  if (!ruta.startsWith("/es/")) return null;
  if (!ruta.endsWith("/")) ruta += "/";
  return ruta;
};

/* ═══════════════════════ 1 · LOS SITEMAPS (vivos, y se congelan) ═══════════
 * Hasta hoy `medidas/_sitemaps/` sólo tenía 2 de los 11: el censo de julio los
 * leyó y no los guardó. Con el sitio vivo por medio, eso es una derivación que
 * no se puede repetir — así que la campaña los congela enteros.            */
async function baja(url) {
  let error = null;
  for (let intento = 1; intento <= 2; intento++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(90_000) });
      const buf = Buffer.from(await r.arrayBuffer());
      return { buf, http: r.status, location: r.headers.get("location") ?? null };
    } catch (e) {
      error = String(e.message ?? e).slice(0, 120);
      if (intento === 1) await dormir(5_000); // un reintento sobre un FALLO no es una segunda captura
    }
  }
  return { error };
}

async function sitemaps() {
  mkdirSync(SITEMAPS, { recursive: true });
  const guarda = async (nombre, url) => {
    const destino = join(SITEMAPS, nombre);
    if (existsSync(destino)) return readFileSync(destino, "utf8");
    /* ⚠ `SOLO_DERIVA` NO se salta esto: el sitemap es una FUENTE de la
     * derivación, no una página capturada. Sin él la lista sale corta y el
     * informe no lo distingue de «no falta nada» — la regla del cero otra vez.
     * Son 12 peticiones y quedan congeladas para siempre. */
    const r = await baja(url);
    await dormir(ESPACIADO_MS);
    if (r.error || r.http !== 200) {
      console.log(`  ✗ sitemap ${nombre} — ${r.error ?? `HTTP ${r.http}`}`);
      return null;
    }
    writeFileSync(destino, r.buf);
    return r.buf.toString("utf8");
  };

  const indice = await guarda("_index.xml", `${ORIGEN}/sitemap_index.xml`);
  if (!indice) return { urls: new Set(), ficheros: [], indice: false };
  const subs = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set();
  const ficheros = [];
  for (const sub of subs) {
    const nombre = sub.split("/").pop().replace(/\.xml$/, "") + ".xml";
    const xml = await guarda(nombre, sub);
    if (!xml) continue;
    ficheros.push(nombre);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const c = camino(m[1]);
      if (c) urls.add(c);
    }
  }
  return { urls, ficheros, indice: true, subs: subs.length };
}

/* ═══════════════════════ 2 · LOS `href` DEL CORPUS CONGELADO ═══════════════
 * Aquí viven las familias que NO están en ningún sitemap: Yoast omite lo que
 * está en `noindex`, y el censo de arquetipos ya lo dijo — «ese 10 es un suelo,
 * no un total». El corpus son 309 páginas del propio original: lo que ellas
 * enlazan existe.                                                           */
function hrefsDeArbol(raiz, exts) {
  const out = new Map();
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "transformado" || e.name === "fase-3" || e.name === "_sitemaps") continue;
        walk(p);
      } else if (exts.some((x) => e.name.endsWith(x))) {
        const t = readFileSync(p, "utf8");
        /* charset ancho a propósito: el original enlaza `/es/categoría/` CON
         * tilde en el widget de la barra lateral, y un `[A-Za-z0-9-]` lo parte
         * en `/es/categor` — una ruta que no existe, con 132 apariciones. */
        for (const m of t.matchAll(/https:\/\/kunakair\.com(\/es\/[^"'\s<>)\\]*)/g)) {
          const c = camino(m[1]);
          if (c) out.set(c, (out.get(c) ?? 0) + 1);
        }
      }
    }
  };
  walk(raiz);
  return out;
}

/* ═══════════════════════ 3 · LO YA CONOCIDO ════════════════════════════════ */
const indice309 = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const YA_CAPTURADO = new Set(Object.values(indice309.paginas).map((p) => camino(p.url)).filter(Boolean));

/**
 * CONSTRUIDO = el cuerpo es dato tipado transcrito, no un blob de WordPress.
 * Se DERIVA de `src/lib/sectores.ts` y `monografico.ts` (sus catálogos), no se
 * escribe: dar de alta un sector es añadir una entrada al catálogo, y una lista
 * a mano aquí envejecería contra el repo en silencio (regla 9).
 */
function slugsConstruidos() {
  const lib = join(RAIZ, "apps/web/src/lib");
  const slugs = new Set();
  for (const f of ["sectores.ts", "monografico.ts"]) {
    const t = readFileSync(join(lib, f), "utf8");
    for (const m of t.matchAll(/slug:\s*"([a-z0-9-]+)"/g)) slugs.add(m[1]);
  }
  if (!slugs.size)
    throw new Error(
      "0 slugs construidos derivados de sectores.ts/monografico.ts: el patrón no casó con nada.\n" +
        "  Un selector que no casa da un CERO, no un error (regla 4) — y aquí el cero se leería\n" +
        "  como «no hay nada construido» y mandaría a capturar lo que ya es dato tipado.",
    );
  return slugs;
}
const CONSTRUIDO = new Set(["/es/"]);
for (const s of slugsConstruidos()) CONSTRUIDO.add(`/es/sectores/${s}/`);

/* ═══════════════════════ 4 · LAS FAMILIAS, DECLARADAS ══════════════════════
 * Cada regla dice a qué BUCKET va o por qué queda FUERA. Se aplican en orden.
 * `paginable` marca las que son ARCHIVO: de ésas se recorre `/page/N/`.        */
const FAMILIAS = [
  /* ⚠ Las fuentes incluyen CÓDIGO (`src/lib/*.ts`), y ahí una URL vive dentro
   * de una plantilla: `${ORIGEN}/es/sector/${t.slug}/`. El barrido por regex se
   * lleva el trozo literal y produce rutas que no existen —`/es/sector/${t.…`,
   * `/es/kunak-api/\``—, más algún `%20` del HTML del original. Se declaran
   * FUERA con su razón y **se imprimen una a una**: descartarlas en silencio
   * sería la regla 1 (lo que se mira, se cuenta) rota en la propia derivación. */
  { id: "malformada", prueba: (c) => /[\s$`{};"'\\]|%[0-9A-Fa-f]{2}/.test(c), fuera: "no es una ruta: trozo de plantilla o escape recogido al barrer código/HTML por regex" },
  { id: "sistema", prueba: (c) => /^\/es\/(wp-json|wp-content|wp-admin|wp-login|wp-includes|xmlrpc)/.test(c) || /\/feed\/$/.test(c) || /\/amp\/$/.test(c), fuera: "endpoint del sistema WordPress, no una página del sitio" },
  { id: "paginacion", prueba: (c) => /\/page\/\d+\/$/.test(c), fuera: "ruta de paginación: la genera la FASE D recorriendo su listado, no la lista base" },
  { id: "categoria", prueba: (c) => /^\/es\/categoria\//.test(c), bucket: "categoria", paginable: true },
  { id: "categoria-tilde", prueba: (c) => /^\/es\/categor[ií]a\//.test(c), bucket: "categoria", paginable: true },
  { id: "autor", prueba: (c) => /^\/es\/author\//.test(c), bucket: "autor", paginable: true },
  { id: "sector-tax", prueba: (c) => /^\/es\/sector\//.test(c), bucket: "taxonomia-sector", paginable: true },
  { id: "cartuchos", prueba: (c) => /^\/es\/cartuchos-inteligentes\//.test(c) || c === "/es/cartuchos-inteligentes/", bucket: "sueltas" },
  { id: "informe-tecnico", prueba: (c) => /^\/es\/informe-tecnico-/.test(c), bucket: "sueltas" },
  /* La cazó la guarda de familia, no yo: 3 slugs de raíz con los mismos dos
   * primeros tokens. Es la forma LEGAL del censo de arquetipos, que allí se
   * enumeró a mano y aquí sale del prefijo. `aviso-legal` es de la misma forma
   * y NO comparte prefijo — se queda en cola larga, que es lo honesto: lo que
   * la guarda no deriva no se le atribuye. */
  { id: "legal-politica", prueba: (c) => /^\/es\/politica-de-/.test(c), bucket: "sueltas" },
  { id: "glossary-en", prueba: (c) => /^\/es\/glossary\//.test(c), bucket: "sueltas" },
  { id: "caso-suelto", prueba: (c) => /^\/es\/(casos-de-exito|case-studies)\//.test(c), bucket: "sueltas" },
  { id: "empresa", prueba: (c) => /^\/es\/empresa\//.test(c) || c === "/es/empresa/", bucket: "sueltas" },
  { id: "soporte", prueba: (c) => /^\/es\/soporte\//.test(c) || c === "/es/soporte/", bucket: "sueltas" },
  { id: "recursos-otros", prueba: (c) => /^\/es\/recursos\//.test(c), bucket: "sueltas" },
];

/** Los buckets que existen, con su razón de ser un bucket y no otro. */
const BUCKETS = {
  "articulos-kb": "artículo del centro de ayuda — la colección `articulos-kb` de §2d.1 (6, varianza 0)",
  "hubs-kb": "hub/índice del centro de ayuda — cola larga, casillero L4 de LH-2 (7, de 1 a 11 secciones)",
  listados: "los 35 listados y hubs de LH-2 (L1·L2·L3·L4·L5) y su paginación",
  categoria: "archivo de `category` — la familia SIN CENSAR de LH-SP8",
  autor: "archivo de `author` — 0 URLs en el sitemap de `/es` y VIVO en el original",
  "taxonomia-sector": "archivo de la taxonomía `sector` — referenciada por §2c, nunca censada como página",
  sueltas: "cola larga: legales, landings, empresa, suscripción, soporte, contacto y los huérfanos de una familia ya capturada",
};

/* ═══════════════════════ 5 · LA DERIVACIÓN ═════════════════════════════════ */
const { urls: DEL_SITEMAP, ficheros: xmls, indice: hayIndice, subs } = await sitemaps();
const DEL_CORPUS = hrefsDeArbol(CORPUS, [".html"]);
const DEL_CLON = hrefsDeArbol(join(RAIZ, "apps/web/src/lib"), [".ts"]);

/* KB: los 13 del grupo D, partidos por la MEDIDA (no por la forma de la URL).
 * Artículo = 1 sección propia y sin `toggle` ni `video`; hub = el resto. Y el
 * reparto se contrasta contra la forma de la URL: si las dos lecturas no dan lo
 * mismo, TIRA — un discriminador que nadie contrasta es un supuesto. */
const gd = leeMedida("grupo-d-inventario.json").paginas;
const esArticulo = (p) => p.propias === 1 && !p.cuenta.toggle && !p.cuenta.video;
const porUrl = (p) => /\/articulos-de-ayuda\/[^/]+$/.test(p.u);
for (const p of gd)
  if (esArticulo(p) !== porUrl(p))
    throw new Error(
      `KB · las dos lecturas del reparto NO coinciden en '${p.u}': por la medida ` +
        `${esArticulo(p) ? "artículo" : "hub"}, por la URL ${porUrl(p) ? "artículo" : "hub"}.\n` +
        `  El reparto 6/7 de §2d.1 se apoya en la medida; si la forma de la URL ya no la ` +
        `acompaña, el original cambió y hay que re-medir antes de capturar.`,
    );
const KB = new Map(gd.map((p) => [`/es/${p.u}/`, esArticulo(p) ? "articulos-kb" : "hubs-kb"]));

/* Los 35, del censo congelado de LH-2. */
const LISTADOS = new Set(Object.keys(leeMedida("lh-censo.json").paginas).map(camino).filter(Boolean));

/* ── La 6.ª fuente: los `noindex` que el CENSO encontró y nadie enlaza ya ──
 * El censo de arquetipos (2026-07-30 §0) enumeró 10 páginas vivas y fuera de
 * todo sitemap. Hoy **`/es/newsletter/` no la enlaza ni una de las 309 del
 * corpus ni una línea del clon**: si la campaña se derivara sólo de enlaces, la
 * página desaparecería sin que nadie lo notara — un cero que se lee como «no
 * existe» (regla 4). Así que el bloque del censo entra como fuente, LEÍDO del
 * documento: si mañana el censo cambia, la lista cambia con él y nadie tiene
 * que acordarse (regla 9: derivado, no recordado). */
function delCenso() {
  const doc = readFileSync(join(RAIZ, "docs/research/CENSO-ARQUETIPOS.md"), "utf8");
  const m = doc.match(/aparecen en ningún sitemap\*\*:\s*```([\s\S]*?)```/);
  if (!m)
    throw new Error(
      "no se encontró el bloque de `noindex` en CENSO-ARQUETIPOS.md.\n" +
        "  Un selector que no casa devuelve un CERO, no un error (regla 4): sin este `throw`,\n" +
        "  la campaña saldría verde habiendo perdido una fuente entera.",
    );
  const slugs = m[1].split(/\s+/).filter(Boolean);
  if (slugs.length < 5) throw new Error(`el bloque del censo dio ${slugs.length} slugs: no es lo que ese documento contiene.`);
  return slugs.map((s) => `/es/${s.replace(/^\/|\/$/g, "")}/`);
}
const DEL_CENSO = delCenso();

/* La unión: todo lo que alguna fuente dice que existe. */
const UNION = new Map(); // ruta → [fuentes]
const suma = (ruta, fuente) => UNION.set(ruta, [...(UNION.get(ruta) ?? []), fuente]);
for (const c of DEL_SITEMAP) suma(c, "sitemap");
for (const c of DEL_CORPUS.keys()) suma(c, "corpus");
for (const c of DEL_CLON.keys()) suma(c, "clon");
for (const c of DEL_CENSO) suma(c, "censo-noindex");
for (const c of KB.keys()) suma(c, "grupo-d");
for (const c of LISTADOS) suma(c, "lh-censo");
if (SABOTAJE === "familia-sin-decidir")
  for (const n of ["uno", "dos", "tres"]) suma(`/es/familia-inventada/${n}/`, "SABOTAJE");

/* El reparto. Cada ruta sale por UNA puerta y todas quedan contadas. */
const trabajo = [];
const fuera = { yaCapturado: [], construido: [] };
const porFamiliaFuera = {};
const desconocidas = [];

for (const [ruta, fuentes] of UNION) {
  if (YA_CAPTURADO.has(ruta)) { fuera.yaCapturado.push(ruta); continue; }
  if (CONSTRUIDO.has(ruta)) { fuera.construido.push(ruta); continue; }
  if (KB.has(ruta)) { trabajo.push({ ruta, bucket: KB.get(ruta), familia: "grupo-d", fuentes, paginable: false }); continue; }
  if (LISTADOS.has(ruta)) { trabajo.push({ ruta, bucket: "listados", familia: "lh-censo", fuentes, paginable: true }); continue; }
  const regla = FAMILIAS.find((f) => f.prueba(ruta));
  if (!regla) { desconocidas.push(ruta); continue; }
  if (regla.fuera) { (porFamiliaFuera[regla.id] ??= []).push(ruta); continue; }
  trabajo.push({ ruta, bucket: regla.bucket, familia: regla.id, fuentes, paginable: !!regla.paginable });
}

/* ── GUARDA 1 · familia sin decidir ────────────────────────────────────────
 * Una ruta desconocida suelta es cola larga y va a `sueltas`. TRES o más con el
 * mismo prefijo NO son cola larga: son una familia que nadie ha nombrado, y
 * barrerla a `sueltas` la hace desaparecer del informe con un número plausible
 * (la tercera cara de la regla 4: el sobre-casado se lee como un dato). */
const UMBRAL_FAMILIA = 3;
/**
 * ⚠ **`/es/` NO es un prefijo de familia: es el PLANO DE RAÍZ**, y que 202+
 * slugs de cinco familias compartan ese espacio de nombres es una propiedad
 * medida del original (`CLAUDE.md` §Páginas clonadas · `npm run qa:slugs`). La
 * primera versión de esta guarda contaba la raíz como prefijo y marcaba las 18
 * páginas de la cola larga como «familia sin decidir»: un pleno, que es la otra
 * cara de la regla 4 — un patrón que casa con todo no discrimina nada.
 *
 * Así que la raíz se mira con OTRO discriminador, el único que ahí significa
 * algo: **slugs que comparten sus dos primeros tokens** (`informe-tecnico-…`).
 * Eso sí es una familia con nombre, y es la que se estaba barriendo a la cola.
 */
const porPrefijo = {};
for (const c of desconocidas) {
  const seg = c.split("/").filter(Boolean); // ["es", …]
  if (seg.length > 2) { (porPrefijo[`/es/${seg[1]}/`] ??= []).push(c); continue; }
  const tokens = seg[1].split("-");
  if (tokens.length >= 3) (porPrefijo[`/es/${tokens.slice(0, 2).join("-")}-*`] ??= []).push(c);
}
const familiasNuevas = Object.entries(porPrefijo).filter(([, l]) => l.length >= UMBRAL_FAMILIA);

/* Todo lo desconocido que NO forma familia es cola larga declarada. */
if (!familiasNuevas.length)
  for (const c of desconocidas) trabajo.push({ ruta: c, bucket: "sueltas", familia: "cola-larga", fuentes: UNION.get(c), paginable: false });

/* ── GUARDA 2 · colisión de fichero ────────────────────────────────────────
 * El fichero es la RUTA: `corpus/fase-3/<bucket>/<ruta sin /es/>index.html`.
 * Dos rutas distintas no pueden dar el mismo fichero, y una que lo diera se
 * sobrescribiría en silencio — la mitad de la captura sería de otra página. */
const ficheroDe = (bucket, ruta) => join(bucket, ruta.replace(/^\/es\//, ""), "index.html").replace(/\\/g, "/");
if (SABOTAJE === "colision")
  trabajo.push({ ruta: "/es/colision-inventada/", bucket: "sueltas", familia: "SABOTAJE", fuentes: ["SABOTAJE"], paginable: false },
                { ruta: "/es/colision-inventada/", bucket: "sueltas", familia: "SABOTAJE", fuentes: ["SABOTAJE"], paginable: false });
const porFichero = new Map();
const colisiones = [];
for (const t of trabajo) {
  const f = ficheroDe(t.bucket, t.ruta);
  if (porFichero.has(f) && porFichero.get(f) !== t.ruta) colisiones.push([f, porFichero.get(f), t.ruta]);
  else if (porFichero.has(f)) colisiones.push([f, porFichero.get(f), `${t.ruta} (duplicada en la lista)`]);
  porFichero.set(f, t.ruta);
  t.fichero = f;
}

trabajo.sort((a, b) => a.bucket.localeCompare(b.bucket) || a.ruta.localeCompare(b.ruta));

/* ═══════════════════════ 6 · EL INFORME DE LA DERIVACIÓN ═══════════════════ */
console.log(`\n════════ CAMPAÑA F3 · derivación ════════\n`);
console.log(`  sitemaps            ${hayIndice ? `${xmls.length}/${subs} sub-sitemaps congelados` : "SIN LEER (SOLO_DERIVA y no estaban congelados)"}`);
console.log(`  fuentes             sitemap ${DEL_SITEMAP.size} · corpus ${DEL_CORPUS.size} · clon ${DEL_CLON.size} · censo ${DEL_CENSO.length} · grupo-d ${KB.size} · lh-censo ${LISTADOS.size}`);
console.log(`  unión               ${UNION.size} rutas distintas de /es/`);
/* Qué aporta CADA fuente por encima de las demás. Sin esto, «la fuente está
 * puesta» no distingue «aporta» de «es redundante» — y sólo la segunda permite
 * decir que el sitemap ya no hace falta. */
const soloDe = (f) => [...UNION].filter(([, fs]) => fs.length === 1 && fs[0] === f).length;
console.log(`  aporta en exclusiva sitemap ${soloDe("sitemap")} · corpus ${soloDe("corpus")} · clon ${soloDe("clon")} · censo ${soloDe("censo-noindex")}`);
console.log(`  ya capturado (309)  ${fuera.yaCapturado.length}`);
console.log(`  construido          ${fuera.construido.length}`);
for (const [id, l] of Object.entries(porFamiliaFuera)) {
  console.log(`  fuera · ${id.padEnd(11)} ${l.length}`);
  /* La regla 1: lo que se mira, se cuenta; y lo que se descarta, se nombra. */
  if (id === "malformada") for (const c of l) console.log(`           ${JSON.stringify(c)}`);
}
console.log(`\n  ── A CAPTURAR: ${trabajo.length} páginas ──`);
const porBucket = {};
for (const t of trabajo) (porBucket[t.bucket] ??= []).push(t);
for (const [b, l] of Object.entries(porBucket)) console.log(`   ${b.padEnd(18)} ${String(l.length).padStart(4)}   ${BUCKETS[b] ?? "⚠ BUCKET SIN DECLARAR"}`);
const paginables = trabajo.filter((t) => t.paginable);
console.log(`\n   de ellas ARCHIVO (se recorre su /page/N/): ${paginables.length}`);

if (colisiones.length) {
  console.error(`\n❌ COLISIÓN de fichero — ${colisiones.length}:`);
  for (const [f, a, b] of colisiones.slice(0, 10)) console.error(`   ${f}\n     ← ${a}\n     ← ${b}`);
  process.exit(1);
}
if (familiasNuevas.length) {
  console.error(`\n❌ FAMILIA SIN DECIDIR — ${familiasNuevas.length} prefijo(s) con ≥${UMBRAL_FAMILIA} URLs desconocidas:`);
  for (const [p, l] of familiasNuevas) {
    console.error(`   ${p}  (${l.length})`);
    for (const c of l.slice(0, 8)) console.error(`      ${c}`);
  }
  console.error(
    `\n   Barrerlas a 'sueltas' las haría desaparecer del informe con un número plausible.\n` +
      `   Declara cada una en FAMILIAS (con bucket o con su razón de quedar fuera) y repite.\n`,
  );
  process.exit(1);
}
for (const b of Object.keys(porBucket))
  if (!BUCKETS[b]) { console.error(`\n❌ BUCKET SIN DECLARAR: '${b}'. Un bucket sin razón escrita es una declaración muerta.`); process.exit(1); }

const ev = new Evaluadas({ nombre: "captura-f3", unidad: "páginas", minimo: trabajo.length });
/* ⚠ El sabotaje va AQUÍ y no antes, y la diferencia es el test entero: vaciando
 * la lista ANTES, la campaña moría en el `minimo ≥ 1` del constructor — otra
 * guarda, y no la que se quería probar. Vaciándola DESPUÉS se reproduce la
 * forma real de la clase «0 comparado = verde»: la sonda DECLARA su mínimo, no
 * evalúa ninguna unidad, y quien tiene que gritar es el gancho de salida. */
if (SABOTAJE === "cero-evaluadas") trabajo.length = 0;

if (SOLO_DERIVA) {
  console.log(`\n  (SOLO_DERIVA=1 — no se ha pedido ni una página. Revisa la lista y repite sin la variable.)\n`);
  writeFileSync(join(BASE, "LISTA-DERIVADA.json"), JSON.stringify({ meta: { fecha: hoy(), solo: "derivación" }, trabajo }, null, 2));
  console.log(`→ corpus/fase-3/LISTA-DERIVADA.json`);
  ev.ok(trabajo.length);
  ev.informe();
  process.exit(0);
}

/* ═══════════════════════ 7 · LA CAPTURA ════════════════════════════════════ */
console.log(`\n════════ CAPTURA · secuencial, ${ESPACIADO_MS} ms, una petición por página ════════\n`);
const previo = existsSync(INDICE_F3) ? JSON.parse(readFileSync(INDICE_F3, "utf8")) : { paginas: {} };
const paginas = {};
let nuevas = 0, reutilizadas = 0, fallos = 0, redirecciones = 0, ausentes = 0;

/**
 * Pide y congela UNA página. Devuelve el registro (nunca `null` en silencio).
 * Un 3xx o un 404 NO son un fallo de la campaña: son el resultado, y se
 * registran con su `location`. Un fallo es no haber podido preguntar.
 */
async function captura(clave, ruta, rel, extra = {}) {
  const destino = join(BASE, rel);
  if (existsSync(destino)) {
    const buf = readFileSync(destino);
    const antes = previo.paginas[clave];
    reutilizadas++;
    return antes && antes.sha256 === sha(buf)
      ? antes
      : { url: `${ORIGEN}${ruta}`, fichero: rel, http: antes?.http ?? null, bytes: buf.length, sha256: sha(buf), capturada: antes?.capturada ?? "(desconocida: fichero en disco sin entrada de índice)", ...extra };
  }
  const r = await baja(`${ORIGEN}${ruta}`);
  await dormir(ESPACIADO_MS);
  if (r.error) {
    fallos++;
    ev.fallo(clave, r.error);
    console.log(`  ✗ ${clave.padEnd(74)} ${r.error}`);
    return null;
  }
  if (r.http >= 300 && r.http < 400) {
    redirecciones++;
    return { url: `${ORIGEN}${ruta}`, http: r.http, location: r.location, fichero: null, capturada: new Date().toISOString(), ...extra };
  }
  if (r.http !== 200) {
    ausentes++;
    return { url: `${ORIGEN}${ruta}`, http: r.http, fichero: null, capturada: new Date().toISOString(), ...extra };
  }
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, r.buf);
  nuevas++;
  return { url: `${ORIGEN}${ruta}`, fichero: rel, http: 200, bytes: r.buf.length, sha256: sha(r.buf), capturada: new Date().toISOString(), ...extra };
}

for (const t of trabajo) {
  const clave = `${t.bucket}:${t.ruta}`;
  const reg = await captura(clave, t.ruta, t.fichero, { bucket: t.bucket, familia: t.familia, fuentes: [...new Set(t.fuentes)] });
  if (reg) { paginas[clave] = reg; ev.ok(); }
  const n = nuevas + reutilizadas + redirecciones + ausentes;
  if (n % 25 === 0) console.log(`  … ${n}/${trabajo.length}  (nuevas ${nuevas} · reutilizadas ${reutilizadas} · 3xx ${redirecciones} · ≠200 ${ausentes})`);
}

/* ═══════════════════════ 8 · LA PAGINACIÓN ═════════════════════════════════
 * Se recorre `/page/N/` de cada ARCHIVO hasta el primer 404, capturando cada
 * una. El criterio de parada es el de `lh-paginas` y el mismo control: hay 7
 * rutas que sirven **200 para cualquier N** con el canonical apuntando a la
 * primera —o sea que NO paginan— y contarlas sería inventar rutas. Se
 * distingue con el canonical de `/page/2/`, que cuesta la misma petición.  */
console.log(`\n════════ PAGINACIÓN · ${paginables.length} archivos ════════\n`);
const canonicalDe = (html) => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || null;
const paginacion = {};
let rutasPagina = 0;

for (const t of paginables) {
  const base = t.ruta;
  const dos = join(t.bucket, base.replace(/^\/es\//, ""), "page/2/index.html").replace(/\\/g, "/");
  const reg2 = await captura(`${t.bucket}:${base}page/2/`, `${base}page/2/`, dos, { bucket: t.bucket, familia: t.familia, paginaDe: base, n: 2 });
  if (!reg2 || reg2.http !== 200) {
    paginacion[base] = { paginas: 1, paginaDeVerdad: false, motivo: `page/2/ → HTTP ${reg2?.http ?? "sin respuesta"}` };
    console.log(`  ${base.padEnd(62)} 1 página`);
    continue;
  }
  const html = readFileSync(join(BASE, dos), "utf8");
  const can = canonicalDe(html);
  const mismaPagina = !!can && camino(can) === base;
  if (mismaPagina) {
    paginacion[base] = { paginas: 1, paginaDeVerdad: false, motivo: `page/2/ sirve 200 y su canonical vuelve a ${base}: no es una ruta`, canonicalConfirmaMismaPagina: true };
    console.log(`  ${base.padEnd(62)}  NO PAGINA  (canonical → la misma página ✓)`);
    continue;
  }
  paginas[`${t.bucket}:${base}page/2/`] = reg2;
  rutasPagina++;
  let n = 3;
  for (; n <= MAX_PAGINA; n++) {
    const rel = join(t.bucket, base.replace(/^\/es\//, ""), `page/${n}/index.html`).replace(/\\/g, "/");
    const reg = await captura(`${t.bucket}:${base}page/${n}/`, `${base}page/${n}/`, rel, { bucket: t.bucket, familia: t.familia, paginaDe: base, n });
    if (!reg || reg.http !== 200) break;
    paginas[`${t.bucket}:${base}page/${n}/`] = reg;
    rutasPagina++;
  }
  const ultima = n - 1;
  paginacion[base] = { paginas: ultima, paginaDeVerdad: true, ...(ultima >= MAX_PAGINA ? { topo: MAX_PAGINA } : {}) };
  console.log(`  ${base.padEnd(62)} ${String(ultima).padStart(3)} páginas${ultima >= MAX_PAGINA ? "  ⚠ TOPÓ CON EL MÁXIMO — míralo" : ""}`);
}

/* ═══════════════════════ 9 · EL ÍNDICE ═════════════════════════════════════ */
const porColeccion = {};
for (const [clave, p] of Object.entries(paginas)) {
  const b = clave.split(":")[0];
  const e = (porColeccion[b] ??= { paginas: 0, htmlBytes: 0, http200: 0, http3xx: 0, otro: 0, paginacion: 0 });
  e.paginas++;
  e.htmlBytes += p.bytes ?? 0;
  if (p.http === 200) e.http200++;
  else if (p.http >= 300 && p.http < 400) e.http3xx++;
  else e.otro++;
  if (p.paginaDe) e.paginacion++;
}
const media = new Set();
for (const p of Object.values(paginas))
  if (p.fichero)
    for (const m of readFileSync(join(BASE, p.fichero), "utf8").matchAll(/["'(](https?:\/\/kunakair\.com\/wp-content\/uploads\/[^"')?\s]+)/g)) media.add(m[1]);

const resumen = {
  paginas: Object.keys(paginas).length,
  base: trabajo.length,
  rutasDePaginacion: rutasPagina,
  htmlBytes: Object.values(porColeccion).reduce((a, e) => a + e.htmlBytes, 0),
  mediaUrlsDistintas: media.size,
  porColeccion,
};

const indice = {
  meta: {
    fecha: hoy(),
    que: "La captura de la FASE 3: lo que `corpus/INDICE.json` (309 páginas, 2026-08-04) NO cubre.",
    denominadorPropio: "Este índice NO toca los congelados: `corpus/INDICE.json` sigue en 309 y `a-censo.json` en 209.",
    fuente: "HTML crudo servido por kunakair.com (bytes sin re-codificar)",
    derivacion: "sitemap_index.xml (11 sub) + href de corpus/**.html (309) + href de apps/web/src/lib/*.ts + grupo-d-inventario.json + lh-censo.json",
    etiqueta: `secuencial · ${ESPACIADO_MS} ms entre peticiones · una vez por página (entre corridas) · redirect manual`,
    buckets: BUCKETS,
    fuera: Object.fromEntries(FAMILIAS.filter((f) => f.fuera).map((f) => [f.id, f.fuera])),
    yaCapturado: fuera.yaCapturado.length,
    construido: [...CONSTRUIDO],
  },
  resumen,
  paginacion,
  paginas,
};
mkdirSync(BASE, { recursive: true });
writeFileSync(INDICE_F3, JSON.stringify(indice, null, 2));

console.log(`\n════════ RESUMEN ════════\n`);
const MB = (b) => (b / 1024 / 1024).toFixed(1) + " MB";
for (const [b, e] of Object.entries(porColeccion))
  console.log(`   ${b.padEnd(18)} ${String(e.paginas).padStart(4)} · HTML ${MB(e.htmlBytes).padStart(9)} · 200:${e.http200} 3xx:${e.http3xx} otro:${e.otro} · de paginación ${e.paginacion}`);
console.log(`\n   TOTAL ${resumen.paginas} registros (${trabajo.length} base + ${rutasPagina} de paginación) · HTML ${MB(resumen.htmlBytes)} · ${media.size} URLs de media distintas`);
console.log(`\n→ corpus/fase-3/INDICE.json`);
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} campaña: ${nuevas} nuevas · ${reutilizadas} reutilizadas · ${redirecciones} redirecciones · ${ausentes} ≠200 · ${fallos} fallos` +
    `\n   Congela y COMMITEA antes de transformar nada: esta captura es la línea base de la FASE 3.\n`,
);
ev.informe();
process.exit(fallos === 0 ? 0 : 1);
