/**
 * C-SP6 · LOS IFRAMES DEL GRUPO C, CENSADOS POR HOST — de la captura, no del vivo.
 * Uso: npm run qa:c-embeds            (offline: lee `corpus/`)
 *
 * La allowlist §3.3b se firmó con alcance GRUPO A y con este pendiente escrito:
 * *«los iframes del grupo C siguen sin censar por host (C-SP6); un censo del
 * grupo C puede añadir hosts, y ésos entran por el procedimiento de alta»*.
 * La captura del bloque 2 congeló los 76 documentos del grupo C (57 casos +
 * 19 FAQ), así que el censo sale de ficheros commiteados — cero peticiones.
 *
 * ⚠ **La unidad es la PÁGINA SERVIDA COMPLETA, sin `<script>` ni `<style>`**
 * (la regla del markup), no el campo rico del caso: es un SUPERSET deliberado
 * — un host que solo viviera en el cascarón también ejecuta código de terceros.
 * Se declara para que nadie lea este censo como «los iframes del cuerpo».
 *
 * La comparación es POR HOST contra la allowlist FIRMADA (`HOSTS_PERMITIDOS`
 * importada resuelta de la config — no copiada: clase C7). Un host de más NO es
 * un error de la sonda: es el dato que dispara el procedimiento de alta.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");

const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "comunes.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/campos/comunes.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  logLevel: "silent",
});
const { HOSTS_PERMITIDOS } = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
const PERMITIDOS = new Set(HOSTS_PERMITIDOS);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const DEL_C = ["casos", "faqs"];
const trabajo = Object.entries(INDICE.paginas).filter(([clave]) => DEL_C.includes(clave.split("/")[0]));

const ev = new Evaluadas({ nombre: "c-embeds", unidad: "páginas", minimo: trabajo.length });

const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");
const hostDe = (u) => {
  try {
    return new URL(u, "https://kunakair.com/").host.replace(/^www\./, "");
  } catch {
    return "(url ilegible)";
  }
};

console.log(`\n════════ C-SP6 · iframes del grupo C por host · ${trabajo.length} páginas de la captura ════════\n`);

const porHost = new Map();
for (const [clave, p] of trabajo) {
  const html = sinScriptNiStyle(readFileSync(join(CORPUS, p.fichero), "utf8"));
  for (const m of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = /\bsrc\s*=\s*"([^"]+)"/i.exec(m[0])?.[1] ?? /\bdata-src\s*=\s*"([^"]+)"/i.exec(m[0])?.[1] ?? "";
    const host = hostDe(src);
    const e = porHost.get(host) ?? { n: 0, paginas: new Set(), enAllowlist: PERMITIDOS.has(host) };
    e.n++;
    e.paginas.add(clave);
    porHost.set(host, e);
  }
  ev.ok();
}

const hosts = [...porHost.entries()]
  .map(([host, e]) => ({ host, n: e.n, paginas: [...e.paginas], enAllowlist: e.enAllowlist }))
  .sort((a, b) => b.n - a.n);
const nuevos = hosts.filter((h) => !h.enAllowlist);

for (const h of hosts)
  console.log(`   ${String(h.n).padStart(3)} × ${h.host.padEnd(44)} (${h.paginas.length} pág.)${h.enAllowlist ? "" : "  ⚠ FUERA de la allowlist"}`);
if (!hosts.length) console.log(`   (ningún iframe en las ${trabajo.length} páginas)`);

w("medidas/c-embeds.json", {
  meta: {
    fecha: hoy(),
    fuente: "corpus/ (captura congelada del 2026-08-04) — OFFLINE",
    unidad: "página servida completa sin <script>/<style> — SUPERSET del campo rico, declarado",
    alcance: `${trabajo.length} páginas del grupo C (casos + faqs)`,
    allowlist: `§3.3b firmada, ${HOSTS_PERMITIDOS.length} hosts`,
  },
  hosts,
  resumen: { paginas: trabajo.length, iframes: hosts.reduce((a, h) => a + h.n, 0), hostsDistintos: hosts.length, fueraDeAllowlist: nuevos.length },
});

console.log(
  `\n${nuevos.length === 0 ? "✅" : "⚠"} C-SP6: ${hosts.reduce((a, h) => a + h.n, 0)} iframes · ${hosts.length} hosts en el grupo C — ` +
    (nuevos.length === 0
      ? `todos dentro de la allowlist firmada.\n`
      : `${nuevos.length} host(s) FUERA: van por el procedimiento de alta (§3.3b), no re-firmando la lista.\n`),
);
/* Un host de más no es un fallo de la sonda: el censo cierra C-SP6 igual. El
 * código de salida solo protege el contrato de evaluación (arriba). */
process.exit(0);
