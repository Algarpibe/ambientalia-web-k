/**
 * CAPTURA DEL CORPUS — el HTML crudo del original, congelado ANTES de tocarlo.
 * Uso: npm run cms:captura            (SIN_CLON: solo pega al original)
 *
 * ── La regla que este fichero ejecuta (F2-2 bloque 2 · PASO 2) ─────────────
 * **CAPTURA separada de TRANSFORMACIÓN.** T1–T8 corren OFFLINE contra esta
 * captura congelada y son re-ejecutables; re-pegar al sitio vivo para re-correr
 * una transformación está prohibido — el original no es un objetivo estable
 * (`CLAUDE.md` §Notas de método) y esta captura es la LÍNEA BASE del corpus.
 * El HTML se congela y se COMMITEA antes de transformar nada.
 *
 * ── De dónde sale la lista de trabajo (derivada, no escrita) ───────────────
 * De `medidas/cms-arquetipos.json` —el instrumento congelado detrás de la tabla
 * CONSTRUYÓ/REFERENCIÓ del ESQUEMA §2f— sale QUÉ colecciones tienen corpus en
 * el original; de los censos congelados sale QUÉ páginas tiene cada una:
 *
 *   · `a-censo.json`          → entradas-blog · terminos-kunakpedia ·
 *                               documentos-cientificos (209, censo 2026-07-29)
 *   · `c-censo.json`          → casos (53 es + 4 en) · faqs (19)   (76, 2026-07-30)
 *   · `solutions-campos.json` → productos (24, derivado del sitemap 2026-08-03)
 *
 * Las que NO se capturan lo declaran con su razón — una exclusión sin razón es
 * una declaración muerta (regla 4) y una colección nueva sin decidir TIRA
 * (regla 6: la ausencia se rechaza, no se sustituye).
 *
 * ── La etiqueta ────────────────────────────────────────────────────────────
 * UNA petición por página, secuencial, espaciada (500 ms), NUNCA en paralelo —
 * la etiqueta de los censos. Y «una vez por página» vale ENTRE corridas: si el
 * fichero ya está en `corpus/` no se vuelve a pedir, así que una corrida
 * interrumpida se reanuda sin re-pegar lo capturado.
 *
 * ── Qué NO hace ────────────────────────────────────────────────────────────
 * No transforma (T1–T8 son del extractor), no sanea, no siembra. Solo congela
 * bytes tal como los sirvió el CDN, con su hash, y mide de paso el número que
 * CMS-0b tenía SIN MEDIR: el tamaño real del corpus.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1"; // solo pega al original: un build del clon no contamina

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const INDICE = join(CORPUS, "INDICE.json");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;

const lee = (f) => JSON.parse(readFileSync(join(QA, "medidas", f), "utf8"));
const arq = lee("cms-arquetipos.json");
const aCenso = lee("a-censo.json");
const cCenso = lee("c-censo.json");
const solutions = lee("solutions-campos.json");

const slugDeUrl = (u) => {
  const partes = new URL(u).pathname.split("/").filter(Boolean);
  return partes[partes.length - 1];
};

/**
 * El plan por colección. `paginas()` devuelve [{url, slug}]; `fuera` es la
 * razón medida por la que una colección NO tiene captura. Cada entrada se
 * consume o TIRA (abajo): así la tabla no puede pudrirse en silencio.
 */
const PLAN = {
  "entradas-blog": { fuente: "a-censo·blog", paginas: () => aCenso.formas.blog.paginas.map((p) => ({ url: p.url, slug: slugDeUrl(p.url) })) },
  "terminos-kunakpedia": { fuente: "a-censo·termino", paginas: () => aCenso.formas.termino.paginas.map((p) => ({ url: p.url, slug: slugDeUrl(p.url) })) },
  "documentos-cientificos": { fuente: "a-censo·doc-cientifico", paginas: () => aCenso.formas["doc-cientifico"].paginas.map((p) => ({ url: p.url, slug: slugDeUrl(p.url) })) },
  casos: { fuente: "c-censo·caso-es+caso-en", paginas: () => cCenso.paginas.filter((p) => p.forma.startsWith("caso")).map((p) => ({ url: p.url, slug: slugDeUrl(p.url) })) },
  faqs: { fuente: "c-censo·faq", paginas: () => cCenso.paginas.filter((p) => p.forma === "faq").map((p) => ({ url: p.url, slug: slugDeUrl(p.url) })) },
  productos: { fuente: "solutions-campos (sitemap derivado)", paginas: () => Object.keys(solutions.paginas).map((slug) => ({ url: `https://kunakair.com/es/${slug}/`, slug })) },
  sectores: { fuera: "CONSTRUIDA completa: el cuerpo es dato tipado transcrito (SectorPage), no blob de WordPress" },
  monograficos: { fuera: "CONSTRUIDA completa: ídem (MonoModulo/MonoInline, §3.1d)" },
  "taxonomia-sectores": { fuera: "REFERENCIADA con término embebido completo (§2c): no tiene cuerpo que capturar" },
};

/* ── La derivación: toda colección del instrumento tiene que estar decidida ── */
const decididas = new Set(Object.keys(PLAN));
const delInstrumento = arq.colecciones.map((c) => c.coleccion);
for (const col of delInstrumento)
  if (!decididas.has(col))
    throw new Error(
      `COLECCIÓN SIN DECIDIR EN LA CAPTURA: '${col}' está en cms-arquetipos.json y el PLAN ` +
        `no dice ni cómo capturarla ni por qué no. La ausencia se rechaza (regla 6).`,
    );
for (const col of decididas)
  if (!delInstrumento.includes(col))
    throw new Error(`DECLARACIÓN MUERTA en el PLAN de captura: '${col}' no existe en cms-arquetipos.json.`);

const trabajo = [];
for (const [coleccion, plan] of Object.entries(PLAN)) {
  if (plan.fuera) {
    console.log(`  · ${coleccion.padEnd(24)} FUERA — ${plan.fuera}`);
    continue;
  }
  for (const p of plan.paginas()) trabajo.push({ coleccion, fuente: plan.fuente, ...p });
}

/* Dos páginas distintas no pueden caer en el mismo fichero. */
const porFichero = new Map();
for (const t of trabajo) {
  const clave = `${t.coleccion}/${t.slug}`;
  if (porFichero.has(clave)) throw new Error(`COLISIÓN de fichero en la captura: ${clave} (${porFichero.get(clave)} y ${t.url})`);
  porFichero.set(clave, t.url);
}

console.log(`\n════════ CAPTURA DEL CORPUS · ${trabajo.length} páginas derivadas ════════\n`);

const ev = new Evaluadas({ nombre: "captura", unidad: "páginas", minimo: trabajo.length });
const previo = existsSync(INDICE) ? JSON.parse(readFileSync(INDICE, "utf8")) : { paginas: {} };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const paginas = {};
let nuevas = 0, reutilizadas = 0, fallos = 0;

for (const t of trabajo) {
  const rel = `${t.coleccion}/${t.slug}.html`;
  const destino = join(CORPUS, rel);
  const clave = `${t.coleccion}/${t.slug}`;

  /* Ya capturada: NO se vuelve a pedir (una vez por página, entre corridas). */
  if (existsSync(destino)) {
    const buf = readFileSync(destino);
    const antes = previo.paginas[clave];
    paginas[clave] = antes && antes.sha256 === sha(buf)
      ? antes
      : { url: t.url, fichero: rel, http: antes?.http ?? null, bytes: buf.length, sha256: sha(buf), capturada: antes?.capturada ?? "(desconocida: fichero en disco sin entrada de índice)" };
    reutilizadas++;
    ev.ok();
    continue;
  }

  let res = null, error = null;
  for (let intento = 1; intento <= 2 && !res; intento++) {
    try {
      const r = await fetch(t.url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(90_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      res = { buf: Buffer.from(await r.arrayBuffer()), http: r.status, urlFinal: r.url };
    } catch (e) {
      error = String(e.message ?? e).slice(0, 120);
      if (intento === 1) await dormir(5_000); // un reintento sobre un FALLO no es una segunda captura
    }
  }

  if (!res) {
    fallos++;
    ev.fallo(clave, error);
    console.log(`  ✗ ${clave.padEnd(70)} ${error}`);
  } else {
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, res.buf);
    paginas[clave] = {
      url: t.url,
      ...(res.urlFinal && res.urlFinal !== t.url ? { urlFinal: res.urlFinal } : {}),
      fichero: rel,
      http: res.http,
      bytes: res.buf.length,
      sha256: sha(res.buf),
      capturada: new Date().toISOString(),
    };
    nuevas++;
    ev.ok();
    if (nuevas % 20 === 0) console.log(`  … ${nuevas} capturadas (${reutilizadas} reutilizadas)`);
  }
  await dormir(ESPACIADO_MS);
}

/* ══════════════════════════ EL TAMAÑO DEL CORPUS ══════════════════════════
 * CMS-0b lo tenía SIN MEDIR. Se mide aquí porque sale gratis de la captura:
 * bytes del HTML crudo, bytes del `post_content` donde el marcador existe, y
 * las URLs de media distintas que el corpus referencia (la unidad del bloque 3).
 * ═════════════════════════════════════════════════════════════════════════ */
function interiorDiv(html, desde) {
  const fin = html.indexOf(">", desde);
  if (fin < 0) return null;
  const re = /<(\/?)div\b/gi;
  re.lastIndex = fin + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}
const postContent = (html) => {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  return i < 0 ? null : interiorDiv(html, i);
};

const porColeccion = {};
const media = new Set();
for (const [clave, p] of Object.entries(paginas)) {
  const col = clave.split("/")[0];
  const html = readFileSync(join(CORPUS, p.fichero), "utf8");
  const cuerpo = postContent(html);
  const e = (porColeccion[col] ??= { paginas: 0, htmlBytes: 0, cuerpoBytes: 0, conPostContent: 0, sinPostContent: 0 });
  e.paginas++;
  e.htmlBytes += p.bytes;
  if (cuerpo === null) e.sinPostContent++;
  else { e.conPostContent++; e.cuerpoBytes += Buffer.byteLength(cuerpo); }
  for (const m of html.matchAll(/["'(](https?:\/\/kunakair\.com\/wp-content\/uploads\/[^"')?\s]+)/g)) media.add(m[1]);
}

const resumen = {
  paginas: Object.keys(paginas).length,
  htmlBytes: Object.values(porColeccion).reduce((a, e) => a + e.htmlBytes, 0),
  cuerpoBytes: Object.values(porColeccion).reduce((a, e) => a + e.cuerpoBytes, 0),
  mediaUrlsDistintas: media.size,
  porColeccion,
};

console.log(`\n════════ TAMAÑO DEL CORPUS (CMS-0b, medido) ════════\n`);
const MB = (b) => (b / 1024 / 1024).toFixed(1) + " MB";
for (const [col, e] of Object.entries(porColeccion))
  console.log(
    `   ${col.padEnd(24)} ${String(e.paginas).padStart(3)} pág · HTML ${MB(e.htmlBytes).padStart(8)} · cuerpo ${MB(e.cuerpoBytes).padStart(8)}` +
      (e.sinPostContent ? ` · sin post_content: ${e.sinPostContent}` : ""),
  );
console.log(`\n   TOTAL ${resumen.paginas} páginas · HTML ${MB(resumen.htmlBytes)} · cuerpo ${MB(resumen.cuerpoBytes)} · ${media.size} URLs de media distintas`);

/* El índice NO pasa por `w()`: no es una medida de `medidas/`, es el manifiesto
 * del corpus, y su evidencia la protege GIT (se commitea antes de transformar).
 * Se reescribe entero en cada corrida porque se deriva de lo que hay en disco. */
const indice = {
  meta: {
    fecha: hoy(),
    fuente: "HTML crudo servido por kunakair.com (bytes sin re-codificar)",
    derivacion: "cms-arquetipos.json (§2f) + a-censo.json + c-censo.json + solutions-campos.json",
    etiqueta: `secuencial · ${ESPACIADO_MS} ms entre peticiones · una vez por página (entre corridas)`,
    fuera: Object.fromEntries(Object.entries(PLAN).filter(([, p]) => p.fuera).map(([c, p]) => [c, p.fuera])),
  },
  resumen,
  paginas,
};
mkdirSync(CORPUS, { recursive: true });
writeFileSync(INDICE, JSON.stringify(indice, null, 2));
console.log(`\n→ corpus/INDICE.json`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura: ${nuevas} nuevas · ${reutilizadas} reutilizadas · ${fallos} fallos` +
    `\n   Congela y COMMITEA antes de transformar nada: la captura es la línea base.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
