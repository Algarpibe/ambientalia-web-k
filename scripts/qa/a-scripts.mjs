/**
 * LOS `<script>` DEL BLOB — qué son exactamente, uno a uno.
 * Uso: npm run qa:a-scripts        (no necesita navegador)
 *
 * El censo (`a-censo.mjs`) contó **15 páginas del arquetipo A con `script`
 * dentro del `post_content`** y ahí paró: contar no es clasificar. Esa cuenta
 * quedó como A-SP8 en `components/campo-rico.spec.md`.
 *
 * Hace falta cerrarla porque es **la decisión seria de la whitelist del editor**:
 * en un CMS propio, script arbitrario dentro del contenido no debe existir, y
 * cada caso tiene que acabar en **nodo-embed tipado** o en **eliminación
 * documentada**. Eso no se decide sin saber qué son.
 *
 * Congela su salida en `medidas/a-scripts.json` — regla 2 de `CLAUDE.md`
 * §«Dos reglas sobre las sondas mismas».
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const censo = JSON.parse(readFileSync(join(QA, "medidas", "a-censo.json"), "utf8"));

/** Las páginas que el censo marcó con `script` en el blob. */
const objetivo = [];
for (const [forma, d] of Object.entries(censo.formas))
  for (const p of d.paginas.filter((x) => !x.error && x.etiquetas.script))
    objetivo.push({ forma, url: p.url, n: p.etiquetas.script });

console.log(`${objetivo.length} páginas con <script> en el blob\n`);

/* mismo extractor equilibrado que el censo */
function interiorDiv(html, desde) {
  const fin = html.indexOf(">", desde);
  const re = /<(\/?)div\b/gi;
  re.lastIndex = fin + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}

/**
 * Clasificación por lo que el script ES, no por lo que parece. El orden importa:
 * lo más específico primero.
 */
function clasificar(tag, cuerpo, src) {
  const t = (src || "") + " " + (cuerpo || "");
  if (/wp-content\/plugins\/.*mediaelement|mejs|wp-mediaelement/i.test(t))
    return "reproductor de vídeo de WordPress (MediaElement)";
  if (/youtube|vimeo|player\./i.test(t)) return "embed de vídeo";
  if (/gtag|googletagmanager|analytics|gtm\.|fbq|hotjar|clarity/i.test(t)) return "analítica";
  if (/instagram|twitter|x\.com\/widgets|platform\.twitter|linkedin|facebook/i.test(t))
    return "widget de red social";
  if (/ourworldindata|datawrapper|flourish|tableau|infogram/i.test(t))
    return "widget de datos de terceros";
  if (/typeform|hubspot|mailchimp|calendly|form/i.test(t)) return "formulario/marketing";
  if (/wp-emoji|wp-includes/i.test(t)) return "runtime de WordPress";
  if (/^\s*$/.test(cuerpo || "") && !src) return "vacío";
  return "OTRO — leer a mano";
}

const salida = { meta: { fecha: "2026-07-30", paginas: objetivo.length }, scripts: [] };

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "a-scripts", unidad: "páginas", minimo: objetivo.length });
for (const o of objetivo) {
  const html = await (await fetch(o.url)).text();
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  const blob = i < 0 ? "" : interiorDiv(html, i) || "";
  for (const m of blob.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] || "";
    const src = (attrs.match(/src="([^"]*)"/) || [])[1] || null;
    const cuerpo = (m[2] || "").trim();
    salida.scripts.push({
      forma: o.forma,
      url: o.url,
      src,
      tipoAttr: (attrs.match(/type="([^"]*)"/) || [])[1] || null,
      bytes: cuerpo.length,
      clase: clasificar(attrs, cuerpo, src),
      // los primeros caracteres, para poder auditar la clasificación después
      inicio: cuerpo.replace(/\s+/g, " ").slice(0, 120),
    });
  }
  await new Promise((r) => setTimeout(r, 120));
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ─────────────────────────────── informe ───────────────────────────────── */

const porClase = {};
for (const s of salida.scripts) (porClase[s.clase] = porClase[s.clase] || []).push(s);

console.log("clase".padEnd(46) + "scripts  páginas");
for (const [c, xs] of Object.entries(porClase).sort((a, b) => b[1].length - a[1].length))
  console.log(c.padEnd(46) + String(xs.length).padStart(7) + String(new Set(xs.map((x) => x.url)).size).padStart(9));

console.log(`\n─── detalle ───`);
for (const [c, xs] of Object.entries(porClase)) {
  console.log(`\n█ ${c}`);
  for (const x of xs.slice(0, 6))
    console.log(
      `   ${x.url.replace("https://kunakair.com/es/", "").slice(0, 44).padEnd(44)}` +
        ` ${x.src ? "src=" + x.src.slice(0, 46) : x.bytes + "B inline: " + x.inicio.slice(0, 60)}`,
    );
  if (xs.length > 6) console.log(`   … y ${xs.length - 6} más`);
}

w("medidas/a-scripts.json", salida);
