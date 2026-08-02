/**
 * CENSO DEL ARQUETIPO A — inventario del `post_content` de las 209 páginas.
 * Uso: npm run qa:a-censo            (no necesita navegador ni el clon servido)
 *
 * ── Por qué censo y no muestra ─────────────────────────────────────────────
 * `docs/research/arquetipo-A/PLAN-MUESTREO.md` §1. Contar etiquetas dentro de un
 * contenedor es `fetch` + parseo: no hace falta navegador, así que muestrear
 * sería aceptar incertidumbre a cambio de nada. Con el censo, la frecuencia de
 * cada elemento es **un dato y no una estimación**, y la pregunta que produjo la
 * familia S9–S11 —«¿esto es raro, o es que no lo he visto?»— deja de existir.
 *
 * Lo que sí se muestrea es la LECTURA, y de eso se encarga la regla de selección
 * del §3 del plan, que se alimenta de las señales que saca esta sonda.
 *
 * ── Por qué el HTML servido y no el navegador ──────────────────────────────
 * WordPress renderiza el `post_content` en servidor: está entero en la fuente.
 * Comprobado antes de escribir esto, no supuesto. Y `CLAUDE.md` §El principio
 * manda verificar contra la salida servida, que es literalmente lo que se lee.
 *
 * ── El contenedor ──────────────────────────────────────────────────────────
 * `<div class="et_pb_module et_pb_post_content et_pb_post_content_0_tb_body
 * entry-content">`. Se extrae por **emparejamiento equilibrado de `<div>`**, no
 * por regex de «hasta el próximo `</div>`»: el contenido lleva divs dentro y un
 * corte ingenuo se comería la mitad del inventario sin dar ningún error.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const DORMIR = Number(process.env.DORMIR || 150); // cortesía con el sitio vivo
const LIMITE = Number(process.env.LIMITE || 0); // 0 = todas

/* ───────────────────── las 209 URLs, de los sitemaps ───────────────────── */

const CACHE = join(QA, "medidas", "_sitemaps");

async function sitemap(nombre) {
  const local = join(CACHE, `${nombre}.xml`);
  if (existsSync(local)) return readFileSync(local, "utf8");
  const r = await fetch(`https://kunakair.com/${nombre}-sitemap.xml`);
  return r.text();
}

/** URLs de `/es` de un sub-sitemap, sin los índices que no son instancias. */
function urlsDe(xml, excluir = []) {
  const todas = [...xml.matchAll(/<loc>(https:\/\/kunakair\.com\/es\/[^<]*)<\/loc>/g)].map(
    (m) => m[1],
  );
  const fuera = new Set(excluir.map((s) => `https://kunakair.com/es/${s}/`));
  return todas.filter((u) => !fuera.has(u));
}

const FORMAS = {
  blog: urlsDe(await sitemap("post"), ["blog"]),
  termino: urlsDe(await sitemap("glossary"), ["glosario"]),
  "doc-cientifico": urlsDe(await sitemap("scientific-docs"), []),
};

/* ─────────────────── extracción del `post_content` ─────────────────────── */

/**
 * Contenido interior de un `<div>` a partir de su posición de apertura,
 * emparejando aperturas y cierres. Devuelve `null` si no cierra (HTML roto).
 */
function interiorDiv(html, desdeApertura) {
  const finApertura = html.indexOf(">", desdeApertura);
  if (finApertura < 0) return null;
  const re = /<(\/?)div\b/gi;
  re.lastIndex = finApertura + 1;
  let nivel = 1;
  let m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(finApertura + 1, m.index);
  }
  return null;
}

function extraerPostContent(html) {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  if (i < 0) return null;
  return interiorDiv(html, i);
}

/**
 * Los módulos `…_tb_body` en **orden del DOM**: el esqueleto de la plantilla.
 *
 * ⚠ **No vale barrer el HTML entero con un regex.** Divi emite en un `<style>`
 * en línea una regla CSS por cada módulo, con esas mismas clases dentro, así que
 * la primera versión de esta función mezclaba **reglas CSS con elementos** y
 * devolvía firmas con la cola repetida decenas de veces. Parecían tres
 * esqueletos distintos donde había uno. No dio ningún error: dio un dato falso.
 *
 * Ahora: se recorta a `#main-content`, se tiran `<style>` y `<script>`, y solo
 * se leen **atributos `class`**.
 */
function esqueletoTb(html) {
  const i = html.indexOf('id="main-content"');
  if (i < 0) return [];
  const j = html.indexOf("<footer", i);
  const zona = html
    .slice(i, j > 0 ? j : undefined)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
  const out = [];
  for (const m of zona.matchAll(/\sclass="([^"]*)"/g)) {
    const t = m[1].match(/\bet_pb_([a-z_]+?)_(\d+)_tb_body\b/);
    if (t) out.push(`${t[1]}#${t[2]}`);
  }
  return out;
}

const sinEtiquetas = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ────────────────────────────── recorrido ──────────────────────────────── */

const censo = { meta: { fecha: "2026-07-30", fuente: "HTML servido del original" }, formas: {} };
let n = 0;
let fallos = 0;

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "a-censo", unidad: "formas", minimo: Object.keys(FORMAS).length });
for (const [forma, urls] of Object.entries(FORMAS)) {
  const lista = LIMITE ? urls.slice(0, LIMITE) : urls;
  censo.formas[forma] = { total: lista.length, paginas: [] };
  for (const url of lista) {
    n++;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const html = await res.text();
      const cuerpo = extraerPostContent(html);
      if (cuerpo === null) {
        fallos++;
        censo.formas[forma].paginas.push({ url, error: "sin et_pb_post_content", http: res.status });
        continue;
      }
      const texto = sinEtiquetas(cuerpo);
      /** Inventario: cuántas veces aparece cada etiqueta DENTRO del blob. */
      const etiquetas = {};
      for (const m of cuerpo.matchAll(/<([a-z][a-z0-9]*)\b/gi)) {
        const t = m[1].toLowerCase();
        etiquetas[t] = (etiquetas[t] || 0) + 1;
      }
      /** ¿El blob es HTML de editor, o trae salida del builder dentro? */
      const clasesEtPb = [
        ...new Set([...cuerpo.matchAll(/\bet_pb_([a-z_]+)/g)].map((m) => m[1])),
      ];
      censo.formas[forma].paginas.push({
        url,
        http: res.status,
        chars: texto.length,
        palabras: texto ? texto.split(" ").length : 0,
        etiquetas,
        clasesEtPb,
        // clases de WordPress dentro del blob: delatan bloques de Gutenberg,
        // shortcodes y plugins, que son estructura dentro del contenido
        clasesWp: [
          ...new Set(
            [...cuerpo.matchAll(/class="([^"]*)"/g)]
              .flatMap((m) => m[1].split(/\s+/))
              .filter((c) => /^(wp-|has-|is-|alignwide|alignfull|gallery|wp-block)/.test(c)),
          ),
        ].slice(0, 20),
        esqueletoTb: esqueletoTb(html),
      });
    } catch (e) {
      fallos++;
      censo.formas[forma].paginas.push({ url, error: String(e).slice(0, 120) });
    }
    if (n % 25 === 0) console.log(`  … ${n} páginas`);
    if (DORMIR) await new Promise((r) => setTimeout(r, DORMIR));
  }
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ─────────────────────────────── informe ───────────────────────────────── */

console.log(`\n════════ CENSO DEL ARQUETIPO A ════════`);
const global = {};
for (const [forma, d] of Object.entries(censo.formas)) {
  const ok = d.paginas.filter((p) => !p.error);
  const inv = {};
  for (const p of ok)
    for (const [t, c] of Object.entries(p.etiquetas)) {
      inv[t] = inv[t] || { paginas: 0, total: 0 };
      inv[t].paginas++;
      inv[t].total += c;
      global[t] = global[t] || { paginas: 0, total: 0 };
      global[t].paginas++;
      global[t].total += c;
    }
  d.inventario = inv;
  const chars = ok.map((p) => p.chars).sort((a, b) => a - b);
  d.longitud = {
    min: chars[0],
    p50: chars[Math.floor(chars.length / 2)],
    max: chars[chars.length - 1],
  };
  console.log(
    `\n█ ${forma}: ${ok.length}/${d.total} leídas` +
      `   longitud ${d.longitud.min} · ${d.longitud.p50} · ${d.longitud.max} chars`,
  );
  const orden = Object.entries(inv).sort((a, b) => b[1].paginas - a[1].paginas);
  console.log(
    `   etiquetas (páginas/${ok.length}): ` +
      orden.map(([t, v]) => `${t} ${v.paginas}`).join(" · "),
  );
}
censo.inventarioGlobal = global;

const totalOk = Object.values(censo.formas)
  .flatMap((d) => d.paginas)
  .filter((p) => !p.error).length;
console.log(`\n${totalOk} páginas con blob leído · ${fallos} fallos`);

w("medidas/a-censo.json", censo);
