/**
 * CMS-1 — las DOS rutas del caso de éxito, medidas.
 * Uso: npm run qa:c-rutas            (no necesita navegador)
 *
 * 53 casos viven en `/es/casos-de-exito/…` y 4 en `/es/case-studies/…`. El censo
 * (`c-censo.mjs`) ya dijo que **el cascarón es idéntico**: mismo
 * `case-studies-template-default`, mismo reparto de secciones, mismos bloques de
 * cuerpo. Lo que falta para decidir CMS-1 es lo que el cascarón no dice:
 *
 *   1 · ¿el prefijo alterno RESUELVE? — `/casos-de-exito/<slug-inglés>` y
 *       `/case-studies/<slug-español>`: 200, 301 o 404. Si redirige, hay alias y
 *       el prefijo es cosmético; si da 404, son dos espacios de nombres.
 *   2 · ¿qué dice el `canonical` de cada uno? Es la respuesta del propio sitio a
 *       «cuál de las dos rutas es la buena».
 *   3 · ¿los 4 son CONTENIDO PROPIO o la misma ficha en otro idioma? Se compara
 *       el título y el cuerpo, no la ruta.
 *
 * ⚠ **No decide CMS-1.** Trae el dato; la decisión es de C-2.
 *
 * Congela en `medidas/c-rutas.json`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { w, QA } from "./lib.mjs";

const censo = JSON.parse(readFileSync(join(QA, "medidas/c-censo.json"), "utf8"));
const casos = censo.paginas.filter((p) => !p.error && p.forma.startsWith("caso"));
const ES = casos.filter((p) => p.forma === "caso-es");
const EN = casos.filter((p) => p.forma === "caso-en");

const slug = (u) => u.replace(/\/$/, "").split("/").pop();

/** `fetch` sin seguir redirecciones: la redirección ES el dato. */
async function sonda(url, intentos = 3) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30000) });
      return { status: r.status, location: r.headers.get("location") || null };
    } catch (e) {
      ultimo = e;
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
    }
  }
  return { status: null, error: String(ultimo).slice(0, 120) };
}

console.log(`\n════════ CMS-1 · las dos rutas del caso de éxito ════════`);
console.log(`  ${ES.length} en /casos-de-exito/ · ${EN.length} en /case-studies/\n`);

const salida = {
  meta: {
    fecha: "2026-07-30",
    pregunta: "CMS-1: ¿un arquetipo con dos prefijos, o dos cosas?",
    fuente: "cabeceras HTTP sin seguir redirección + censo c-censo.json",
  },
};

/* ── 1 · ¿resuelve el prefijo cruzado? ── */

console.log(`  ── ¿resuelve el prefijo CRUZADO? ──`);
const cruzados = [];
for (const p of EN) {
  const s = slug(p.url);
  const alterna = `https://kunakair.com/es/casos-de-exito/${s}/`;
  const r = await sonda(alterna);
  cruzados.push({ origen: p.url, alterna, ...r, direccion: "en→es" });
  console.log(`    en→es  ${String(r.status).padStart(3)}${r.location ? ` → ${r.location.slice(0, 62)}` : ""}  ${s.slice(0, 44)}`);
}
// y al revés, con una muestra de los españoles (los 53 no aportan más que 5)
for (const p of ES.slice(0, 5)) {
  const s = slug(p.url);
  const alterna = `https://kunakair.com/es/case-studies/${s}/`;
  const r = await sonda(alterna);
  cruzados.push({ origen: p.url, alterna, ...r, direccion: "es→en" });
  console.log(`    es→en  ${String(r.status).padStart(3)}${r.location ? ` → ${r.location.slice(0, 62)}` : ""}  ${s.slice(0, 44)}`);
}
salida.cruzados = cruzados;

/* ── 2 · el canonical que declara cada uno ── */

console.log(`\n  ── canonical declarado ──`);
const canon = [];
for (const p of [...EN, ...ES.slice(0, 5)]) {
  const propio = p.seo.canonical;
  const coincide = propio === p.url;
  canon.push({ url: p.url, forma: p.forma, canonical: propio, coincideConSuUrl: coincide });
  console.log(
    `    ${p.forma.padEnd(8)} ${coincide ? "= su propia url" : `⚠ ${String(propio).slice(0, 70)}`}  ${slug(p.url).slice(0, 40)}`,
  );
}
salida.canonical = canon;

/* ── 3 · ¿contenido propio o la misma ficha? ── */

console.log(`\n  ── los 4 de /case-studies/: qué son ──`);
const ficha = EN.map((p) => ({
  url: p.url,
  titulo: p.campos.titulo,
  sobretitulo: p.campos.sobretitulo,
  cliente: p.campos.cliente[0] || null,
  sectores: p.campos.sectores[0] || null,
  chars: p.cuerpo.entryContent.reduce((a, e) => a + e.chars, 0),
  hreflang: p.seo.hreflang,
}));
for (const f of ficha)
  console.log(
    `    ${String(f.chars).padStart(6)} ch · cliente ${String(f.cliente).slice(0, 22).padEnd(24)} · ${String(f.titulo).slice(0, 56)}`,
  );
salida.fichasEn = ficha;

/* ¿algún título/cliente de los 4 se repite entre los 53? Sería el mismo caso
 * publicado dos veces, que es una respuesta distinta a «contenido propio». */
const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9áéíóúñ ]/gi, "").replace(/\s+/g, " ").trim();
const titulosEs = new Map(ES.map((p) => [norm(p.campos.titulo), p.url]));
const clientesEs = new Map(ES.map((p) => [norm(p.campos.cliente[0]), p.url]));
const duplicados = ficha
  .map((f) => ({
    url: f.url,
    porTitulo: titulosEs.get(norm(f.titulo)) || null,
    porCliente: clientesEs.get(norm(f.cliente)) || null,
  }))
  .filter((d) => d.porTitulo || d.porCliente);
salida.duplicadosConEs = duplicados;

console.log(`\n  ── ¿alguno de los 4 repite título o cliente de los 53? ──`);
if (!duplicados.length) console.log(`    ninguno`);
for (const d of duplicados)
  console.log(`    ⚠ ${slug(d.url)}  título→${d.porTitulo ? "SÍ" : "no"}  cliente→${d.porCliente ? slug(d.porCliente) : "no"}`);

/* ── 4 · hreflang en el conjunto ── */
const conHreflang = casos.filter((p) => p.seo.hreflang.length).length;
salida.hreflang = { conHreflang, de: casos.length };
console.log(`\n  ── hreflang ──\n    ${conHreflang} de ${casos.length} casos declaran alternate/hreflang`);

/* ════════════════════════════════ informe ════════════════════════════════ */

const enResuelveEnEs = cruzados.filter((c) => c.direccion === "en→es" && c.status === 200).length;
const enRedirige = cruzados.filter((c) => c.direccion === "en→es" && [301, 302, 308].includes(c.status)).length;
const en404 = cruzados.filter((c) => c.direccion === "en→es" && c.status === 404).length;

salida.resumen = {
  es: ES.length,
  en: EN.length,
  cruzado_en_a_es: { ok200: enResuelveEnEs, redirige: enRedirige, noExiste: en404 },
  canonicalSiempreProio: canon.every((c) => c.coincideConSuUrl),
  duplicados: duplicados.length,
  hreflang: conHreflang,
};

console.log(`\n════════ RESUMEN ════════`);
console.log(`  prefijo cruzado en→es:  200 ${enResuelveEnEs} · redirige ${enRedirige} · 404 ${en404}`);
console.log(`  canonical = su propia url en todos: ${salida.resumen.canonicalSiempreProio ? "sí" : "NO"}`);
console.log(`  duplicados con los 53: ${duplicados.length}`);

w("medidas/c-rutas.json", salida);
console.log(`\n(sin veredicto: CMS-1 la decide C-2)`);
