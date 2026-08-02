/**
 * LOS EMBEBIDOS DEL BLOB — de qué proveedor es cada `iframe`, en las 209.
 * Uso: npm run qa:a-embeds        (no necesita navegador)
 *
 * ── Por qué censo y no muestra, otra vez ───────────────────────────────────
 * El piloto de CMS-0e vio **3 proveedores fuera de la lista cerrada de 5** en
 * solo 24 páginas, así que §3.3 daba por cubierto un corpus que no cubría. Pero
 * la muestra no puede decir **cuántos faltan**: para eso hay que contarlos.
 *
 * Y contar dentro de un contenedor es `fetch` + parseo —el mismo argumento que
 * escribió `campo-rico.spec.md` para el censo de etiquetas—, así que muestrear
 * sería **aceptar incertidumbre a cambio de nada**. Van las 209.
 *
 * ── Qué mide ──────────────────────────────────────────────────────────────
 * Por página, dentro del `post_content`: cada `iframe` con su **host**, y el
 * inventario de `video`/`audio`/`embed`/`object`, que es el otro hueco que el
 * piloto destapó (§3.1 no tiene nodo de vídeo).
 *
 * Congela su salida en `medidas/a-embeds.json` — regla 2 de `CLAUDE.md`
 * §«Dos reglas sobre las sondas mismas».
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const censo = JSON.parse(readFileSync(join(QA, "medidas", "a-censo.json"), "utf8"));

/** LA LISTA CERRADA de §3.3, tal como está escrita hoy. Se mide contra ella. */
const LISTA_CERRADA = [
  [/youtube\.com|youtu\.be|youtube-nocookie\.com/i, "youtube"],
  [/ourworldindata\.org/i, "ourworldindata"],
  [/flourish\.studio/i, "flourish"],
  [/platform\.twitter\.com|\btwitter\.com|\bx\.com/i, "twitter"],
  [/instagram\.com/i, "instagram"],
];
const enLaLista = (u) => {
  for (const [re, nombre] of LISTA_CERRADA) if (re.test(u || "")) return nombre;
  return null;
};

/* mismo extractor equilibrado que el censo */
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
function extraerPostContent(html) {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  return i < 0 ? null : interiorDiv(html, i);
}

const atributo = (tag, nombre) => {
  const m = tag.match(new RegExp(`\\b${nombre}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? m[1] : "";
};
const hostDe = (u) => {
  try {
    return new URL(u, "https://kunakair.com/").host.replace(/^www\./, "");
  } catch {
    return "(url ilegible)";
  }
};

/* ═══════════════════════════════ recorrido ═══════════════════════════════ */

const PAGINAS = [];
for (const [forma, d] of Object.entries(censo.formas))
  for (const p of d.paginas.filter((x) => !x.error)) PAGINAS.push({ forma, url: p.url });

console.log(`\n════════ PROVEEDORES DE EMBEBIDO · censo de ${PAGINAS.length} páginas ════════\n`);

const salida = {
  meta: {
    fecha: "2026-07-30",
    fuente: "HTML servido del original",
    alcance: `censo ${PAGINAS.length}/209, no muestra`,
    listaCerrada: LISTA_CERRADA.map(([, n]) => n),
  },
  paginas: [],
};

const porHost = {};       // host → { n, paginas:Set, enLista }
const medios = {};        // etiqueta → nº de apariciones
const paginasConMedio = {}; // etiqueta → Set de urls
let fallos = 0;

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "a-embeds", unidad: "páginas", minimo: PAGINAS.length });
for (const p of PAGINAS) {
  try {
    const html = await (await fetch(p.url, { redirect: "follow" })).text();
    const cuerpo = extraerPostContent(html);
    if (cuerpo === null) { fallos++; salida.paginas.push({ ...p, error: "sin et_pb_post_content" }); continue; }

    const iframes = [...cuerpo.matchAll(/<iframe\b[^>]*>/gi)].map((m) => {
      // `data-src` cuenta: Divi difiere algunos iframes y el `src` llega vacío
      const src = atributo(m[0], "src") || atributo(m[0], "data-src");
      const host = hostDe(src);
      const prov = enLaLista(src);
      return { host, proveedor: prov, enLista: !!prov, src: src.slice(0, 120) };
    });

    for (const f of iframes) {
      const e = (porHost[f.host] = porHost[f.host] || { n: 0, paginas: new Set(), enLista: f.enLista, proveedor: f.proveedor });
      e.n++;
      e.paginas.add(p.url);
    }

    const cuentaMedios = {};
    for (const tag of ["video", "audio", "embed", "object", "source", "track"]) {
      const n = [...cuerpo.matchAll(new RegExp(`<${tag}\\b`, "gi"))].length;
      if (!n) continue;
      cuentaMedios[tag] = n;
      medios[tag] = (medios[tag] || 0) + n;
      (paginasConMedio[tag] = paginasConMedio[tag] || new Set()).add(p.url);
    }

    salida.paginas.push({ ...p, iframes, medios: cuentaMedios });
    if (iframes.length || Object.keys(cuentaMedios).length) {
      const fuera = iframes.filter((f) => !f.enLista);
      console.log(
        `  ${p.forma.padEnd(14)} ${p.url.replace("https://kunakair.com/es/", "").slice(0, 46).padEnd(48)}` +
          ` iframe ${String(iframes.length).padStart(2)}${fuera.length ? ` (⚠ ${fuera.length} fuera)` : ""}` +
          `${Object.keys(cuentaMedios).length ? `  medios ${JSON.stringify(cuentaMedios)}` : ""}`,
      );
    }
  } catch (e) {
    fallos++;
    salida.paginas.push({ ...p, error: String(e).slice(0, 160) });
  }
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ════════════════════════════════ informe ════════════════════════════════ */

const hosts = Object.entries(porHost)
  .map(([host, e]) => ({ host, n: e.n, paginas: e.paginas.size, enLista: e.enLista, proveedor: e.proveedor }))
  .sort((a, b) => b.n - a.n);

const dentro = hosts.filter((h) => h.enLista);
const fuera = hosts.filter((h) => !h.enLista);

salida.hosts = hosts;
salida.medios = Object.fromEntries(
  Object.entries(medios).map(([k, v]) => [k, { apariciones: v, paginas: paginasConMedio[k].size }]),
);
salida.resumen = {
  paginas: PAGINAS.length,
  fallos,
  iframesTotales: hosts.reduce((a, h) => a + h.n, 0),
  hostsDistintos: hosts.length,
  hostsEnLaLista: dentro.length,
  hostsFueraDeLaLista: fuera.length,
  iframesFueraDeLaLista: fuera.reduce((a, h) => a + h.n, 0),
};

console.log(`\n════════ PROVEEDORES ════════`);
console.log(`\n  EN la lista cerrada de 5:`);
for (const h of dentro) console.log(`    ${String(h.n).padStart(3)} × ${h.host.padEnd(38)} (${h.paginas} pág.) → ${h.proveedor}`);
/* Hosts de la cola que merecen una nota: la lista falla de dos formas distintas
 * y conviene no contarlas como la misma. */
const NOTA = {
  "flo.uri.sh": "es FLOURISH por su acortador — fallo del PATRÓN, no proveedor nuevo",
  "essic.umd.edu": "el iframe apunta a un .gif: no es un proveedor de embebido",
  "google.es": "mismo proveedor que google.com (Maps) con otro TLD",
};

console.log(`\n  ⚠ FUERA de la lista cerrada:`);
for (const h of fuera)
  console.log(
    `    ${String(h.n).padStart(3)} × ${h.host.padEnd(44)} (${h.paginas} pág.)` +
      (NOTA[h.host] ? `  ← ${NOTA[h.host]}` : ""),
  );

console.log(`\n════════ MEDIOS (el hueco del nodo de vídeo) ════════`);
for (const [k, v] of Object.entries(salida.medios).sort((a, b) => b[1].apariciones - a[1].apariciones))
  console.log(`    ${String(v.apariciones).padStart(3)} × <${k}> en ${v.paginas} páginas`);

console.log(`\n════════ RESUMEN ════════`);
console.log(`  ${salida.resumen.iframesTotales} iframes · ${hosts.length} hosts distintos`);
console.log(`  en la lista   ${dentro.length} hosts`);
console.log(`  ⚠ fuera       ${fuera.length} hosts · ${salida.resumen.iframesFueraDeLaLista} iframes`);
if (fallos) console.log(`  ⚠ fallos      ${fallos}`);

w("medidas/a-embeds.json", salida);

/* Código 0 solo si la lista cerrada cubre el corpus. Hoy NO lo hace, y la sonda
 * tiene que decirlo con el código de salida, no solo por pantalla: un descuadre
 * impreso y no contado da el mismo informe que uno no visto. */
console.log(
  `\n${fuera.length === 0 ? "✅" : "❌"} la lista cerrada de 5 ${fuera.length === 0 ? "cubre" : `NO cubre: faltan ${fuera.length} proveedores`}`,
);
process.exit(fuera.length === 0 && fallos === 0 ? 0 : 1);
