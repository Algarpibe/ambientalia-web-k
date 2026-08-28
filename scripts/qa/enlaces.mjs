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
import { Evaluadas, hoy, w, APP} from "./lib.mjs";

/**
 * Raíz de la APP de render — donde viven `.next` y `src/`.
 *
 * ⚠ Desde la conversión a monorepo (F2-1, 2026-08-03) **NO es la raíz del
 * repo**: las sondas se quedaron arriba y la app bajó a `apps/web/`. Antes
 * esto era `new URL("../..")`, que ahora apuntaría al repo — y un
 * `prerender-manifest.json` que no existe deja `RUTAS` vacío, o sea **verde
 * sin medir**. Lo resuelve y lo VERIFICA `APP` en `lib.mjs`.
 */
const RAIZ = APP;
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

/* ─────────── dirección 2: el href interno, ¿existe como ruta? ───────────── */

/**
 * Un typo en un href interno da 404 y **ninguna medida de altura lo ve**: la
 * página que enlaza sigue midiendo lo mismo. Por eso la guarda mira las dos
 * direcciones.
 *
 * Qué se descarta de antemano, para que el informe no se llene de ruido —
 * decidido antes de correrla, no después de ver la salida:
 *   · **anclas puras** (`#seccion`) → misma página, no son navegación;
 *   · **esquemas** `mailto:` `tel:` `javascript:` `data:` → no son rutas;
 *   · **query y hash** se recortan antes de comparar (`/x?a=1#b` → `/x`);
 *   · **barra final** se recorta para la comparación. `trailingSlash` está
 *     desactivado, así que `/x/` redirige a `/x`: no está roto, pero infringe
 *     la regla del proyecto → va a AVISOS, no a fallos;
 *   · **rutas con extensión** (`.pdf`, `.svg`…) son ficheros de `public/`, no
 *     rutas emitidas: se cuentan aparte y no se juzgan aquí.
 *
 * La comparación es **exacta contra el conjunto de rutas publicadas**, nunca
 * por subcadena — mismo tropiezo que ya costó una corrida en la otra dirección.
 */
function clasificaInterno(href) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null; // http:, mailto:, tel:…
  if (href.startsWith("//")) return null; // protocol-relative → externo
  if (href.startsWith("#")) return null; // ancla pura
  if (!href.startsWith("/")) return null; // relativo al documento: no se usa
  const sinHash = href.split("#")[0].split("?")[0];
  if (sinHash === "") return null; // era solo query/hash
  if (/\.[a-z0-9]{2,5}$/i.test(sinHash)) return { activo: false }; // fichero
  const ruta = sinHash.replace(/\/+$/, "") || "/";
  return {
    ruta,
    roto: !PUBLICADAS.has(ruta),
    aviso: sinHash !== "/" && sinHash.endsWith("/") ? "barra final" : null,
  };
}

/* ──────────────────────────── recorrido ────────────────────────────────── */

const PAGINAS = ["/", ...[...PUBLICADAS].filter((r) => r !== "/")].sort();
const fallos = [];
const rotos = [];
const avisos = [];
const vistosAvisos = new Set();
let totalHrefs = 0;
let externosOk = 0;
let internos = 0;
let ficheros = 0;

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "enlaces", unidad: "páginas servidas", minimo: PAGINAS.length });
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

  /* ── dirección 2: hrefs INTERNOS que no corresponden a ruta emitida ────── */
  /* ⚠ La deduplicación es POR PÁGINA, igual que `vistos` en la dirección 1.
   * Hasta la 121.ª este `Set` vivía FUERA del bucle y se indexaba sólo por
   * `href`: la primera página en que aparecía un roto se quedaba el registro y
   * **las demás se tiraban**. `rotos.length` publicaba entonces el número de
   * HREFS DISTINTOS bajo un rótulo sin unidad, y una página entera podía estar
   * rota sin salir en la lista — pasó con `/politica-de-privacidad…`. Es §*un
   * cardinal es un contenedor y absorbe la membresía* cometido DENTRO del
   * instrumento, y la dirección 1 ya lo hacía bien al lado. */
  const vistosRotosPag = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = m[1];
    const r = clasificaInterno(href);
    if (!r) continue;
    if (r.activo === false) {
      ficheros++;
      continue;
    }
    internos++;
    if (r.aviso && !vistosAvisos.has(href)) {
      vistosAvisos.add(href);
      avisos.push({ href, ruta: r.ruta, motivo: r.aviso, origen: origen(href) });
    }
    if (r.roto && !vistosRotosPag.has(href)) {
      vistosRotosPag.add(href);
      rotos.push({ pagina: ruta, href, ruta: r.ruta, origen: origen(href) });
    }
  }
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ──────────────────────────── informe ──────────────────────────────────── */

console.log(`\nRutas publicadas (del build): ${[...PUBLICADAS].sort().join(" · ")}`);
console.log(
  `Páginas recorridas: ${PAGINAS.length}  ·  hrefs al original: ${totalHrefs}` +
    `  ·  hrefs internos: ${internos}  ·  a ficheros: ${ficheros}`,
);

/* ── dirección 2 primero: un interno roto es un 404, más grave que un href
      que va al original teniendo copia ────────────────────────────────────── */
/* Las TRES unidades, y ninguna sustituye a las otras: un href se arregla una
 * vez, una página se ve rota una vez, y la aparición es el par (página, href)
 * que es lo que de verdad recorre la sonda. Publicar sólo la primera —lo que
 * hacía hasta la 121.ª— deja «4» sin unidad y esconde 1 de las 5 páginas. */
const rotosPorHref = new Map();
for (const r of rotos) {
  if (!rotosPorHref.has(r.href)) rotosPorHref.set(r.href, { ...r, paginas: new Set() });
  rotosPorHref.get(r.href).paginas.add(r.pagina);
}
const rotosPaginas = new Set(rotos.map((r) => r.pagina));

if (rotos.length) {
  console.log(
    `\n❌ ROTOS (404) — ${rotosPorHref.size} href distinto(s) · ` +
      `${rotosPaginas.size} de ${PAGINAS.length} páginas · ${rotos.length} apariciones:\n`,
  );
  for (const [href, r] of [...rotosPorHref].sort()) {
    console.log(`  ${href}`);
    console.log(`      normaliza a  : ${r.ruta}`);
    console.log(`      origen       : ${r.origen}`);
    console.log(`      aparece en   : ${r.paginas.size} de ${PAGINAS.length} páginas`);
    console.log(`                     ${[...r.paginas].sort().join(" · ")}`);
    console.log();
  }
}

if (avisos.length) {
  console.log(`\n⚠ ${avisos.length} href interno(s) con barra final (redirigen, no rompen):`);
  for (const a of avisos) console.log(`  ${a.href}  →  ${a.ruta}   ${a.origen}`);
  console.log();
}

/* ── Congelado (regla 2 de §sondas) ────────────────────────────────────────
 * Era la ÚNICA sonda con cobertura completa cuya evidencia no existía en
 * `medidas/`: sus «31/31 limpio» se citaban en actas y la única copia era la
 * consola de quien la corrió. Ahora se puede diffear qué enlaces había el día
 * que se afirmó algo. Lo detectó la auditoría de cobertura (2026-08-01).
 * ------------------------------------------------------------------------ */
w("medidas/enlaces.json", {
  meta: {
    fecha: hoy(),
    paginas: PAGINAS.length,
    publicadas: PUBLICADAS.size,
    totalHrefs,
    internos,
    externosOk,
    ficheros,
    fallos: fallos.length,
    /* ⚠ `rotos` se publica CON SU UNIDAD desde la 121.ª. Antes era un escalar
     * sin rótulo que valía «hrefs distintos» y se leía como «páginas rotas». */
    rotosHrefs: rotosPorHref.size,
    rotosPaginas: rotosPaginas.size,
    rotosApariciones: rotos.length,
    avisos: avisos.length,
  },
  // las rutas que la sonda considera emitidas: si el build cambia, se ve aquí
  publicadas: [...PUBLICADAS].sort(),
  // el detalle de lo que NO cerró, que es lo que hay que poder auditar después
  fallos,
  rotos,
  avisos,
});

if (!fallos.length && !rotos.length) {
  console.log(`\n✅ LIMPIO en las dos direcciones.`);
  console.log(`   · saliente: ningún enlace apunta fuera a una ruta ya publicada`);
  console.log(`     (${externosOk} destinos externos distintos, correctos: no están clonados)`);
  console.log(`   · entrante: los ${internos} hrefs internos corresponden a rutas emitidas`);
  process.exit(avisos.length ? 1 : 0);
}
if (!fallos.length) process.exit(1);

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
