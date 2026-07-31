/**
 * LISTADOS + HUBS — censo de las 35 (12 índices/hub + 23 archivos de taxonomía).
 * Uso:  MODO=rutas    node scripts/qa/lh-censo.mjs   → solo la lista (sitemaps)
 *       MODO=regimen  node scripts/qa/lh-censo.mjs   → PASO 1: el <body> servido, 35/35
 *       node scripts/qa/lh-censo.mjs                 → censo completo 35/35
 *       SABOTAJE=1 …                                 → test en negativo (escribe aparte)
 *
 * ── Por qué fetch+parseo y no navegador ────────────────────────────────────
 * La pregunta del recon es de TOPOLOGÍA SERVIDA: régimen (`<body>`), reparto de
 * secciones por plantilla de origen (sufijos `_tb_`), módulo `post_content`,
 * paginación y tarjetas. Todo eso lo emite WordPress/Divi en el HTML — no hay
 * que inferirlo del render, y un navegador solo añadiría las mutaciones de JS
 * que aquí no se miden. (La geometría, si algún día hace falta, es otra sonda.)
 *
 * ── Las 35: de dónde salen ─────────────────────────────────────────────────
 * Los 12 hubs son la lista del censo (`CENSO-ARQUETIPOS.md` §4 — finita y
 * cerrada, ES el alcance). Los 23 archivos NO se escriben a mano: se leen de
 * los 3 sub-sitemaps de Yoast (post_tag · resources · scientific-category)
 * filtrados a /es, deduplicados contra los hubs, y la sonda RECONCILIA contra
 * el 12+8+3 del censo — si el sitemap trae otra cosa, eso es dato y se imprime.
 *
 * ── Reglas de la casa que implementa ───────────────────────────────────────
 * · regla 1: lo que imprime es lo que cuenta; el código de salida cierra con
 *   fallos de fetch + patrones muertos.
 * · regla 2: congela en `medidas/` (`lh-regimen.json` · `lh-censo.json`).
 * · regla 4: un patrón que no casa en NINGUNA de las 35 no es un cero, es un
 *   defecto de la sonda → exit 2. (Equivalente fetch del `Censo` de lib.mjs.)
 * · test en negativo: `SABOTAJE=1` estropea un patrón a propósito; tiene que
 *   salir 2 y escribir en `…-SABOTAJE.json`, nunca sobre la medida buena.
 *
 * ── Muestra adversaria (PASO 2 del recon, pre-registrada) ──────────────────
 * El censo es 35/35. La LECTURA FINA (esqueleto sección a sección + campos por
 * tarjeta) se hace sobre una muestra elegida por máquina con SEMILLA FIJA
 * (mulberry32, semilla 1440): 4 hubs de 12 · 3 etiqueta de 12 · 3 categorías
 * de recursos · 2 scientific-category de 3, MÁS dos adversarias por regla (el
 * listado con MÁS entradas y con MENOS). La muestra se imprime y se congela
 * con el resto.
 */
import { env, w } from "./lib.mjs";

const ORIGEN = "https://kunakair.com";
const MODO = env("MODO") || "censo";
const SABOTAJE = !!env("SABOTAJE");

/** Los 12 hubs del censo §4 — lista cerrada, es el alcance del recon. */
const HUBS = [
  "/es/productos/",
  "/es/sectores/",
  "/es/recursos/",
  "/es/casos-de-exito/",
  "/es/blog/",
  "/es/glosario/",
  "/es/preguntas-frecuentes/",
  "/es/recursos/articulos/",
  "/es/recursos/seminarios-web/",
  "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/",
  "/es/recursos/preguntas-frecuentes/",
];

/* ── Patrones censados (regla 4: 0 en TODAS las páginas = sonda rota) ────────
 * `min` es en cuántas páginas COMO POCO tiene que casar para que la sonda se
 * crea a sí misma. El sabotaje estropea el primero. */
const PATRONES = {
  bodyTag: { re: /<body[^>]*class="([^"]*)"/, min: 35 },
  tbBody: { re: /et_pb_section_\d+_tb_body/g, min: 1 },
  seccion: { re: /class="[^"]*\bet_pb_section\b/g, min: 1 },
  postContentMod: { re: /et_pb_post_content/g, min: 0 },
  pageNumbers: { re: /class="[^"]*page-numbers[^"]*"/g, min: 1 },
  pagina2: { re: /href="[^"]*\/page\/(\d+)\/"/g, min: 1 },
  tarjeta: { re: /<article[^>]*class="[^"]*\bet_pb_post\b/g, min: 1 },
  tituloTarjeta: { re: /<h2 class="entry-title"><a href="([^"]+)"[^>]*>(.*?)<\/a>/g, min: 1 },
  fechaTarjeta: { re: /class="published"[^>]*>([^<]+)</g, min: 0 },
  h1: { re: /<h1[^>]*>([\s\S]*?)<\/h1>/, min: 1 },
};
if (SABOTAJE) PATRONES.bodyTag.re = /<cuerpo[^>]*clase="([^"]*)"/;

const usoPatron = Object.fromEntries(Object.keys(PATRONES).map((k) => [k, 0]));
const casa = (nombre, html) => {
  const p = PATRONES[nombre];
  const m = p.re.global ? [...html.matchAll(p.re)] : (() => { const x = html.match(p.re); return x ? [x] : []; })();
  if (m.length) usoPatron[nombre]++;
  return m;
};

const baja = async (url, reintentos = 2) => {
  for (let i = 0; ; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 90000);
    const t0 = Date.now();
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (recon kunak-web-clone)" } });
      clearTimeout(t);
      return { status: r.status, html: await r.text(), cargaMs: Date.now() - t0 };
    } catch (e) {
      clearTimeout(t);
      if (i >= reintentos) return { status: 0, html: "", error: String(e).slice(0, 90), cargaMs: Date.now() - t0 };
    }
  }
};

/* ── 1 · la lista: hubs (constante) + archivos (de los sitemaps) ── */
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const indice = await baja(`${ORIGEN}/sitemap_index.xml`);
if (!indice.html) {
  console.error(`❌ sin sitemap_index.xml (${indice.error || indice.status}) — no hay lista, no hay censo.`);
  process.exit(2);
}
const subsitemaps = locs(indice.html).filter((u) => /(post_tag|resources|scientific-category)-sitemap/.test(u));
const archivos = [];
for (const sm of subsitemaps) {
  const s = await baja(sm);
  const familia = (sm.match(/(post_tag|resources|scientific-category)/) || [])[1];
  for (const u of locs(s.html)) {
    if (!u.includes("/es/")) continue;
    const ruta = u.replace(ORIGEN, "");
    if (HUBS.includes(ruta)) continue; // un término no puede ser un hub
    archivos.push({ ruta, familia });
  }
}

console.log(`\n═══ LA LISTA — 12 hubs (censo §4) + archivos de los sitemaps`);
const porFamilia = {};
for (const a of archivos) (porFamilia[a.familia] ||= []).push(a.ruta);
for (const [f, rs] of Object.entries(porFamilia)) console.log(`  ${f.padEnd(20)} ${rs.length}`);
console.log(`  esperado por el censo: post_tag 12 · resources 8 · scientific-category 3 = 23`);
const nArchivos = archivos.length;
const cuadra = porFamilia.post_tag?.length === 12 && porFamilia.resources?.length === 8 && porFamilia["scientific-category"]?.length === 3;
console.log(cuadra ? `  ✅ cuadra: ${nArchivos}` : `  ⚠ NO cuadra (${nArchivos}): la diferencia es DATO y va al recon`);
if (MODO === "rutas") {
  for (const a of archivos) console.log(`    ${a.familia.padEnd(20)} ${a.ruta}`);
  process.exit(0);
}

const PAGINAS = [
  ...HUBS.map((r) => ({ ruta: r, grupo: "hub" })),
  ...archivos.map((a) => ({ ruta: a.ruta, grupo: a.familia })),
];

/* ── 2 · el censo 35/35 ── */
const leer = (html) => {
  const bodyCls = (casa("bodyTag", html)[0]?.[1] || "").split(/\s+/).filter(Boolean);
  const interesantes = bodyCls.filter((c) =>
    /^(home|blog|archive|search|tax-|term-|category|tag-|page-template|page-id|postid|single|et-tb|et_pb_pagebuilder|et_pb_page)/.test(c),
  );
  const secciones = casa("seccion", html).length;
  const tbBody = new Set(casa("tbBody", html).map((m) => m[0])).size;
  const paginas = casa("pagina2", html).map((m) => Number(m[1]));
  const tarjetas = casa("tarjeta", html).length;
  const titulos = casa("tituloTarjeta", html).map((m) => ({ href: m[1], titulo: m[2].replace(/<[^>]+>/g, "").slice(0, 60) }));
  const fechas = casa("fechaTarjeta", html).length;
  casa("postContentMod", html); casa("pageNumbers", html); casa("h1", html);
  return {
    regimen: {
      tieneTbBody: bodyCls.includes("et-tb-has-body"),
      esBuilder: bodyCls.includes("et_pb_pagebuilder_layout"),
      esArchivo: bodyCls.some((c) => /^(archive|tax-|category|tag-|blog|home)$/.test(c) || c.startsWith("tax-") || c.startsWith("term-")),
      clases: interesantes,
    },
    esqueleto: {
      seccionesDivi: secciones,
      seccionesTbBody: tbBody,
      postContentModule: /et_pb_post_content/.test(html),
    },
    paginacion: {
      tiene: /class="[^"]*page-numbers[^"]*"/.test(html),
      maxPagina: paginas.length ? Math.max(...paginas) : 1,
      patron: paginas.length ? "/page/N/" : null,
    },
    tarjetas: { n: tarjetas, conFecha: fechas, muestra: titulos.slice(0, 3) },
    h1: (casa("h1", html)[0]?.[1] || "").replace(/<[^>]+>/g, "").trim().slice(0, 60),
  };
};

const salida = { meta: { fecha: new Date().toISOString().slice(0, 10), modo: MODO, sabotaje: SABOTAJE, paginas: PAGINAS.length }, paginas: {} };
let fallos = 0;
for (const p of PAGINAS) {
  const r = await baja(ORIGEN + p.ruta);
  if (!r.html || r.status !== 200) {
    fallos++;
    salida.paginas[p.ruta] = { grupo: p.grupo, status: r.status, error: r.error || `HTTP ${r.status}` };
    console.log(`  ⚠ ${p.ruta} → ${r.status} ${r.error || ""}`);
    continue;
  }
  salida.paginas[p.ruta] = { grupo: p.grupo, status: r.status, cargaMs: r.cargaMs, ...leer(r.html) };
  console.log(`  ✓ ${p.ruta}`);
}

/* ── 3 · informes ── */
if (MODO === "regimen") {
  console.log(`\n═══ PASO 1 · RÉGIMEN — la línea del <body> servido, ${PAGINAS.length} páginas`);
  console.log(`  ${"ruta".padEnd(44)} ${"tb-body".padEnd(8)} ${"builder".padEnd(8)} ${"archivo".padEnd(8)} clases`);
  for (const [ruta, v] of Object.entries(salida.paginas)) {
    if (v.error) { console.log(`  ${ruta.padEnd(44)} ⚠ ${v.error}`); continue; }
    const s = (b) => (b ? "sí" : "· ");
    console.log(`  ${ruta.padEnd(44)} ${s(v.regimen.tieneTbBody).padEnd(8)} ${s(v.regimen.esBuilder).padEnd(8)} ${s(v.regimen.esArchivo).padEnd(8)} ${v.regimen.clases.slice(0, 5).join(" ")}`);
  }
} else {
  console.log(`\n═══ CENSO — esqueleto · paginación · tarjetas (${PAGINAS.length} páginas)`);
  console.log(`  ${"ruta".padEnd(44)} ${"secc".padStart(4)} ${"tbB".padStart(4)} ${"postC".padEnd(5)} ${"pag".padStart(4)} ${"tarj".padStart(5)}  h1`);
  for (const [ruta, v] of Object.entries(salida.paginas)) {
    if (v.error) { console.log(`  ${ruta.padEnd(44)} ⚠ ${v.error}`); continue; }
    console.log(
      `  ${ruta.padEnd(44)} ${String(v.esqueleto.seccionesDivi).padStart(4)} ${String(v.esqueleto.seccionesTbBody).padStart(4)} ` +
        `${(v.esqueleto.postContentModule ? "sí" : "· ").padEnd(5)} ${String(v.paginacion.maxPagina).padStart(4)} ${String(v.tarjetas.n).padStart(5)}  ${v.h1.slice(0, 40)}`,
    );
  }

  /* paginación total (PASO 4): páginas EXTRA que suman los /page/N/ */
  const extra = Object.values(salida.paginas).filter((v) => !v.error).reduce((s, v) => s + (v.paginacion.maxPagina - 1), 0);
  console.log(`\n  PASO 4 · paginación: ${extra} páginas extra en total (patrón /page/N/; el máximo por listado va arriba)`);

  /* muestra adversaria con semilla fija (PASO 2) */
  const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rng = mulberry32(1440);
  const eligiendo = (arr, n) => { const c = [...arr]; const out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(rng() * c.length), 1)[0]); return out; };
  const vivos = Object.entries(salida.paginas).filter(([, v]) => !v.error);
  const deGrupo = (g) => vivos.filter(([, v]) => v.grupo === g).map(([r]) => r);
  const muestra = [
    ...eligiendo(deGrupo("hub"), 4),
    ...eligiendo(deGrupo("post_tag"), 3),
    ...eligiendo(deGrupo("resources"), 3),
    ...eligiendo(deGrupo("scientific-category"), 2),
  ];
  const porTarjetas = vivos.filter(([, v]) => v.tarjetas.n > 0).sort((a, b) => a[1].tarjetas.n - b[1].tarjetas.n);
  for (const [r] of [porTarjetas[0], porTarjetas.at(-1)].filter(Boolean)) if (!muestra.includes(r)) muestra.push(r);
  salida.muestra = { semilla: 1440, regla: "4 hub · 3 post_tag · 3 resources · 2 sci-cat + min/max tarjetas", rutas: muestra };
  console.log(`\n  PASO 2 · muestra adversaria (semilla 1440, lectura fina): \n    ${muestra.join("\n    ")}`);
}

/* ── 4 · guardas y congelado ── */
const muertos = Object.entries(PATRONES).filter(([k, p]) => usoPatron[k] < p.min);
if (muertos.length) {
  console.error(`\n❌ ${muertos.length} PATRÓN(ES) MUERTO(S) — casaron en menos páginas que su mínimo:`);
  for (const [k, p] of muertos) console.error(`   · ${k}: ${usoPatron[k]} < ${p.min}. Un cero así es la sonda rota, no el sitio.`);
}
if (fallos) console.error(`\n⚠ ${fallos} página(s) sin leer (fetch fallido) — el censo NO es 35/35 hasta que lean.`);

const nombre = MODO === "regimen" ? "lh-regimen" : "lh-censo";
w(`medidas/${nombre}${SABOTAJE ? "-SABOTAJE" : ""}.json`, salida);
process.exit(muertos.length || fallos ? 2 : 0);
