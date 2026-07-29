/**
 * GUARDA DE LA REGLA DE RUTAS LOCALES.
 * Uso: node enlaces.mjs            (con el clon servido en localhost:3000)
 *
 * La regla de `CLAUDE.md` dice: **si el destino de un enlace ya está clonado,
 * el href va a la ruta local; si no, se deja apuntando al original.** Es fácil
 * de cumplir a medias y no se ve en ninguna medida de alturas: un href no mueve
 * un píxel. El 2026-07-29 estaba rota en TRES ficheros y se creía que en uno.
 *
 * ── Cómo se comprueba, y por qué así ──────────────────────────────────────
 * Se recorre el **HTML SERVIDO**, no la fuente. Ése fue el error que costó la
 * tanda: se arregló `nav.ts` dando por hecho que era el responsable, y el menú
 * seguía trayendo hrefs del original desde `footer.ts` y `sectors.ts`. La
 * salida servida es la única que no miente sobre quién pinta qué.
 *
 * Y **no hay lista manual de rutas**: se leen del `prerender-manifest.json` que
 * emite el build. Así la guarda se automantiene — cuando se clone el
 * monográfico, sus rutas entran solas y sus enlaces pasan a ser fallo sin que
 * nadie toque este fichero.
 *
 * ── La regla, exacta ──────────────────────────────────────────────────────
 *   href al dominio original  →  se normaliza su path (se le quita el prefijo
 *   de idioma y la barra final)  →  ¿está entre las rutas publicadas?
 *     · SÍ  → **FALLO**: apunta fuera a algo que ya tenemos clonado.
 *     · NO  → **correcto**, y tiene que pasar. Los sectores sin clonar deben
 *             seguir apuntando al original; eso no es deuda, es lo pedido.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const BASE = process.env.CLON || "http://localhost:3000";
const DOMINIO = "kunakair.com";
/**
 * El clon reproduce **solo el árbol `/es`**. Cualquier otra rama del original
 * —la raíz `https://kunakair.com/`, `/fr/`, `/en/`…— es OTRA PÁGINA que no
 * tenemos clonada, y sus enlaces deben seguir apuntando fuera. Mapear por
 * "quitar el prefijo de idioma, sea cual sea" daba la home francesa como si
 * fuera la nuestra.
 */
const RAMA = "/es";

/* ───────────────────── rutas publicadas, leídas del build ───────────────── */

const manifiesto = JSON.parse(readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"));
const PUBLICADAS = new Set(
  Object.keys(manifiesto.routes || {}).filter((r) => !r.startsWith("/_") && !r.includes(".")),
);
if (PUBLICADAS.size === 0) {
  console.error("No hay rutas en .next/prerender-manifest.json — ¿falta `npm run build`?");
  process.exit(2);
}

/**
 * Path del original → ruta local equivalente, o `null` si no puede tenerla.
 * `/es/x/` → `/x`  ·  `/es/` → `/`  ·  `/fr/…`, `/case-studies/`, `/` → null.
 */
function aRutaLocal(pathname) {
  if (pathname !== RAMA && !pathname.startsWith(RAMA + "/")) return null;
  const p = pathname.slice(RAMA.length).replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/* ─────────────── de dónde sale el href: grep de la fuente ───────────────── */

const FUENTES = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(f)) FUENTES.push(f);
  }
})(join(RAIZ, "src"));

const INDICE = FUENTES.map((f) => ({ f, lineas: readFileSync(f, "utf8").split(/\r?\n/) }));

/**
 * Busca el href en src/ y devuelve `fichero:linea`, saltando comentarios.
 *
 * La cola tiene que **cerrar el literal** (comilla, backtick o fin de línea).
 * Buscándola como subcadena suelta, el href de la home (`/es/`) casaba con
 * TODA línea que tuviera cualquier URL del original y el informe salía inútil.
 */
function origen(href) {
  const cola = href.replace(/^https?:\/\/[^/]+/, "");
  const re = new RegExp(cola.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + `(?=["'\`]|$)`);
  const golpes = new Set();
  for (const { f, lineas } of INDICE) {
    lineas.forEach((l, i) => {
      if (!re.test(l)) return;
      const t = l.trim();
      // las cabeceras anotan el href original a propósito: no son el culpable
      if (t.startsWith("*") || t.startsWith("//") || t.startsWith("/*")) return;
      golpes.add(`${relative(RAIZ, f).replace(/\\/g, "/")}:${i + 1}`);
    });
  }
  return golpes.size ? [...golpes].join(" · ") : "(no está en src/ literal — plantilla o dato derivado)";
}

/* ──────────────────────────── recorrido ────────────────────────────────── */

const PAGINAS = ["/", ...[...PUBLICADAS].filter((r) => r !== "/")].sort();
const fallos = [];
let totalHrefs = 0;
let externosOk = 0;

for (const ruta of PAGINAS) {
  const res = await fetch(BASE + ruta);
  if (!res.ok) {
    console.error(`  ⚠ ${ruta} → HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();
  const vistos = new Set();
  // SOLO anclas. `<link rel="canonical">` y `og:url` **deben** apuntar al
  // original a propósito: declaran cuál es la página buena para los buscadores.
  // Mirándolos, la guarda pedía romper el SEO.
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = m[1];
    if (!href.includes(DOMINIO)) continue;
    totalHrefs++;
    if (vistos.has(href)) continue;
    vistos.add(href);
    let u;
    try {
      u = new URL(href);
    } catch {
      continue;
    }
    const local = aRutaLocal(u.pathname);
    if (local && PUBLICADAS.has(local))
      fallos.push({ pagina: ruta, href, local, origen: origen(href) });
    else externosOk++;
  }
}

/* ──────────────────────────── informe ──────────────────────────────────── */

console.log(`\nRutas publicadas (del build): ${[...PUBLICADAS].sort().join(" · ")}`);
console.log(`Páginas recorridas: ${PAGINAS.length}  ·  hrefs al original: ${totalHrefs}`);

if (!fallos.length) {
  console.log(`\n✅ LIMPIO — ningún enlace apunta fuera a una ruta ya publicada.`);
  console.log(`   (${externosOk} destinos externos distintos, correctos: no están clonados)`);
  process.exit(0);
}

// agrupado por HREF distinto, que es la unidad que se arregla
const porHref = new Map();
for (const f of fallos) {
  if (!porHref.has(f.href)) porHref.set(f.href, { ...f, paginas: new Set() });
  porHref.get(f.href).paginas.add(f.pagina);
}

console.log(
  `\n❌ ${porHref.size} href distinto(s) apuntan al original teniendo ruta local` +
    `  (${fallos.length} apariciones en total):\n`,
);
for (const [href, f] of [...porHref].sort()) {
  console.log(`  ${href}`);
  console.log(`      → debería ser : ${f.local}`);
  console.log(`      origen        : ${f.origen}`);
  console.log(`      aparece en    : ${f.paginas.size} de ${PAGINAS.length} páginas`);
  console.log();
}
process.exit(1);
