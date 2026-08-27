/**
 * LA FICHA DE AUTOR, COMPARADA A DOS LADOS — 117.ª · ESCALÓN 1
 * Uso: npm run qa:ficha-cmp     (NEG=<etiqueta> para una corrida de negativo)
 *      SABOTAJES: NEG_MISMO_LADO=1 | NEG_GRITA=<px> | NEG_SIN_INSUMOS=1
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y POR QUÉ AHORA
 *
 * GRUPO A está en `c` en la matriz de cobertura: su guarda es `clon-base`
 * —clon contra clon— y `a-cascaron` —censo del original—, **dos sondas que no
 * se tocan**. §UN ARQUETIPO NUEVO NO HEREDA COBERTURA: construir el comparador
 * es parte de la tanda, no un extra.
 *
 * Y se estrena **ANTES de que exista el lado que va a medir** (§regla 24). Sus
 * preguntas —¿compara o inventa? ¿sabe gritar? ¿tiene sus insumos?— se
 * contestan copiando un lado sobre el otro. La ganancia no es de calendario,
 * es de ATRIBUCIÓN: cuando la ficha aparezca, un rojo sólo puede ser suyo.
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 *   · por entrada y a los DOS anchos: la CAJA de la ficha, la del `<img>`, la
 *     tipografía del `<p>` y **el PROEMIO al carácter**;
 *   · el reparto CREA/MUEVE no aplica todavía: el clon no la pinta, así que
 *     hoy la salida es «ausente en el clon» en las N del catálogo. Eso **no es
 *     un fallo del comparador**: es su estado de partida, y se publica.
 *
 * ── QUÉ **NO** CONTESTA, con su cardinal (§regla 14) ─────────────────────
 *   · **NO mide las 152**: el catálogo son las entradas DERIVADAS abajo, y su
 *     número se publica en la línea de unidades. Las demás quedan sin comparar;
 *   · **NO mide la foto**: 0 de 5 fotos de la ficha están capturadas
 *     (§PASO 0b). Las peticiones externas se bloquean **en los dos lados** y el
 *     cardinal se publica en los dos — un lado con la red cortada y el otro no
 *     mide la ASIMETRÍA, no el objeto (§regla 32). El CSS fija el `img` en
 *     64x64 con `min-width`, así que la caja sigue siendo medible sin bytes;
 *   · **NO mide el `et-cache` dinámico**: de 1083 hojas del corpus resuelven
 *     925 y faltan **158**, todas `et-cache` por página. De las 2 capturadas de
 *     la familia del blog, **0 estilizan la ficha** — evidencia con n=2, no
 *     prueba. Si una de las 157 la estilizara, el lado del original estaría
 *     midiendo de menos y **esta sonda no puede verlo**.
 *
 * ── LOS CONTROLES, Y CUÁL SEPARA QUÉ (§regla 21, la vuelta) ──────────────
 * El control NO se ata al código de salida: un comparador cambia de exit con
 * el estado del objeto (hoy «ausente», mañana Δ0), así que un caso atado al
 * exit CADUCA el día del arreglo. Se ata a lo que es cierto en los dos estados:
 *   C1 `mismo-lado`  copiado un lado sobre el otro ⇒ **0 distintos**. Separa
 *                    «compara» de «inventa diferencias»;
 *   C2 `grita`       inyectado un Δ CONOCIDO ⇒ lo caza **y lo NOMBRA con sus
 *                    dos lados**. Separa «mide» de «mira para otro lado»;
 *   C3 `sin-insumos` sin corpus ⇒ corrida **NULA** con exit ≠ 0, nunca verde;
 *   C4 el dominio ALCANZADO se publica y cierra el código de salida — un
 *      booleano de concordancia es cierto sobre un dominio de uno igual que
 *      sobre uno de mil (§regla 22).
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { Evaluadas, gritaSiRevienta, hoy, iniciarClon, launch, w } from "./lib.mjs";

gritaSiRevienta();

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const BLOG = join(RAIZ, "corpus", "entradas-blog");
const CSS = join(RAIZ, "corpus", "css");

/* ── LOS SABOTAJES, Y LA HIGIENE QUE EXIGE §regla 24 ──────────────────────
 * La sonda comprueba SUS PROPIOS sabotajes y, si hay alguno activo sin corrida
 * de negativo, **desvía el nombre de la salida ella misma y lo dice en voz
 * alta**. Si el desvío dependiera de que quien lanza ponga además `NEG=`, el
 * nombre CANÓNICO quedaría al alcance de una corrida de control — y lo que
 * saldría es un fichero con NOMBRE DE MEDIDA y CONTENIDO DE CONTROL. */
const NEG_MISMO_LADO = process.env.NEG_MISMO_LADO === "1";
const NEG_GRITA = process.env.NEG_GRITA ? Number(process.env.NEG_GRITA) : 0;
const NEG_SIN_INSUMOS = process.env.NEG_SIN_INSUMOS === "1";
const SABOTAJES = [
  NEG_MISMO_LADO && "mismo-lado",
  NEG_GRITA && `grita:${NEG_GRITA}`,
  NEG_SIN_INSUMOS && "sin-insumos",
].filter(Boolean);
/* El desvío lo hace `w()` a partir de `NEG`. Así que la sonda no inventa un
 * segundo mecanismo —eso producía nombres con el sufijo DOS veces—: si hay
 * sabotaje sin `NEG`, **se pone `NEG` ella misma** y `w()` hace el resto. Un
 * solo camino, que es lo que §regla 4 pide (la CLASE, no la instancia). */
if (SABOTAJES.length && !process.env.NEG) {
  process.env.NEG = `auto-${SABOTAJES[0].replace(/[^a-z0-9]+/g, "-")}`;
  console.log(
    `\n⚠ SABOTAJE ACTIVO SIN 'NEG=': ${SABOTAJES.join(", ")}\n` +
      `  La salida se DESVÍA sola a '${process.env.NEG}'. El nombre canónico NO se toca:\n` +
      `  un fichero con nombre de medida y contenido de control es una medida falsa\n` +
      `  con la autoridad de una congelada (§regla 7).\n`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · PRECONDICIONES — **ANTES DEL `launch`** (§regla 37)
 *
 * Lo que no depende de la medición se comprueba antes de gastarla. Una
 * ausencia descubierta después del navegador cuesta la corrida entera, y si la
 * matan a medias, evidencia (§regla 5). La magnitud no es la distancia en
 * líneas: es que ENTRE MEDIAS SE MIDA.
 * ═════════════════════════════════════════════════════════════════════════ */
const faltan = [];
if (!existsSync(BLOG)) faltan.push(`corpus/entradas-blog (lo produce la campaña de captura de F3)`);
if (!existsSync(join(CSS, "INDICE.json"))) faltan.push(`corpus/css/INDICE.json (lo produce 'cms:captura-css')`);
if (NEG_SIN_INSUMOS) faltan.push("SABOTAJE sin-insumos: insumo retirado a propósito");

if (faltan.length) {
  console.error(
    `\n❌ CORRIDA NULA — faltan insumos y NO se ha abierto el navegador:\n` +
      faltan.map((f) => `   · ${f}`).join("\n") +
      `\n\n  No es «0 diferencias»: es que no se pudo comparar. Un comparador sin\n` +
      `  sus dos lados no adjudica nada, y salir en verde sería el caso 4bis.\n`,
  );
  process.exit(2);
}

const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (LOCAL.size === 0) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4: un cero de un índice roto)");

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · EL CATÁLOGO — DERIVADO, y con la instancia donde la holgura SE ACABA
 *
 * §*la instancia que hay que meter en el catálogo es aquélla DONDE LA HOLGURA
 * SE ACABA, y casi nunca es la típica: es la más corta*. Un catálogo de
 * «típicas» no puede detectar si un arreglo llega a la maquetación cuando la
 * pieza vive en una columna con hermana: en todas las típicas el contenedor
 * gana y el número sale igual con la pieza bien y con la pieza mal.
 * ═════════════════════════════════════════════════════════════════════════ */
const txt = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function bloqueBalanceado(html, desde) {
  const re = /<div\b[^>]*>|<\/div>/gi;
  re.lastIndex = desde;
  let prof = 0, m;
  while ((m = re.exec(html))) {
    prof += m[0][1] === "/" ? -1 : 1;
    if (prof === 0) return html.slice(desde, re.lastIndex);
  }
  return null;
}

const inventario = [];
for (const f of readdirSync(BLOG).filter((x) => x.endsWith(".html")).sort()) {
  const html = readFileSync(join(BLOG, f), "utf8");
  const i = html.indexOf('<div class="ficha-autor-revisor"');
  if (i < 0) continue;
  const blk = bloqueBalanceado(html, i);
  if (!blk) continue;
  const slugs = [...blk.matchAll(/\/author\/([^/"]+)/g)].map((m) => m[1]);
  const nPapeles = (blk.match(/<div class="(revisor|autor)">/g) || []).length;
  inventario.push({ fichero: f, slug: f.replace(/\.html$/, ""), bytes: html.length, autores: [...new Set(slugs)], nPapeles });
}

const catalogo = [];
const mete = (x, razon) => { if (x && !catalogo.some((c) => c.slug === x.slug)) catalogo.push({ ...x, razon }); };
// (a) las SEPARADORAS del papel: las únicas con dos huecos
for (const x of inventario.filter((y) => y.nPapeles >= 2)) mete(x, "dos papeles (separadora del papel)");
// (b) una por AUTOR: el proemio depende del autor, así que un autor sin
//     representar es un proemio sin comparar
for (const a of [...new Set(inventario.flatMap((x) => x.autores))])
  mete(inventario.find((x) => x.autores.includes(a)), `primer uso de ${a}`);
// (c) donde la HOLGURA SE ACABA: la más corta y la más larga
const porBytes = [...inventario].sort((p, q) => p.bytes - q.bytes);
mete(porBytes[0], "la MÁS CORTA — donde la columna hermana puede mandar");
mete(porBytes[porBytes.length - 1], "la más larga");

const ev = new Evaluadas({
  unidad: "pares (entrada × ancho)",
  minimo: catalogo.length * 2,
  nombre: "ficha-cmp",
});

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LA MEDIDA — la misma función en los DOS lados
 * ═════════════════════════════════════════════════════════════════════════ */
function medirEnPagina() {
  const cont = document.querySelector(".ficha-autor-revisor");
  if (!cont) return { presente: false };
  const cs = getComputedStyle(cont);
  const r = cont.getBoundingClientRect();
  const papeles = [...cont.querySelectorAll(":scope > div")].map((d) => {
    const p = d.querySelector("p");
    const img = d.querySelector("img");
    const a = d.querySelector("a[href*='/author/']");
    const ps = p ? getComputedStyle(p) : null;
    const ir = img ? img.getBoundingClientRect() : null;
    const is = img ? getComputedStyle(img) : null;
    const texto = p ? p.textContent.replace(/\s+/g, " ").trim() : null;
    const nombre = p && p.querySelector("a") ? p.querySelector("a").textContent.replace(/\s+/g, " ").trim() : null;
    return {
      clase: d.className,
      ds: getComputedStyle(d).display,
      mis: getComputedStyle(d).marginInlineStart,
      mt: getComputedStyle(d).marginTop,
      texto,
      // el PROEMIO: el texto con el nombre enlazado sustituido. Es lo que
      // escribió el editor, separado de lo que viene del autor.
      proemio: texto && nombre ? texto.replace(nombre, "‹NOMBRE›") : texto,
      href: a ? a.getAttribute("href") : null,
      p: ps ? { fs: ps.fontSize, lh: ps.lineHeight, mis: ps.marginInlineStart } : null,
      img: ir ? { w: +ir.width.toFixed(2), h: +ir.height.toFixed(2), br: is.borderRadius, bw: is.borderTopWidth } : null,
    };
  });
  return {
    presente: true,
    caja: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
    pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
    br: cs.borderRadius,
    bg: cs.backgroundColor,
    nPapeles: papeles.length,
    papeles,
  };
}

function conHojasLocales(html) {
  let enlazadas = 0, resueltas = 0;
  const out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    resueltas++;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  return { html: out, enlazadas, resueltas };
}

/* ── el bloqueo va en LOS DOS lados, y su cardinal se publica en los dos ── */
async function conBloqueo(page, permitido) {
  await page.setRequestInterception(true);
  let bloqueadas = 0;
  page.on("request", (r) => {
    const u = r.url();
    if (u === "about:blank" || permitido(u)) return r.continue();
    bloqueadas++;
    r.abort();
  });
  return () => bloqueadas;
}

const ANCHOS = [1440, 390];
const { base, parar: pararClon } = await iniciarClon();
const { browser } = await launch();

const filas = [];
let hojasCero = 0;

try {
  for (const item of catalogo) {
    const crudo = readFileSync(join(BLOG, item.fichero), "utf8");
    const { html, enlazadas, resueltas } = conHojasLocales(crudo);
    if (enlazadas && !resueltas) hojasCero++;

    for (const ancho of ANCHOS) {
      /* ── lado ORIGINAL ── */
      const pO = await browser.newPage();
      const nBloqO = await conBloqueo(pO, (u) => u.startsWith("file://"));
      await pO.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1, isMobile: ancho < 500 });
      await pO.goto(pathToFileURL(join(BLOG, item.fichero)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
      await pO.setContent(html, { waitUntil: "domcontentloaded", timeout: 120_000 });
      await pO.evaluate(() => { for (const i of document.querySelectorAll("img[loading]")) i.loading = "eager"; });
      const orig = await pO.evaluate(medirEnPagina);
      const bloqO = nBloqO();
      await pO.close();

      /* ── lado CLON ── */
      const pC = await browser.newPage();
      const nBloqC = await conBloqueo(pC, (u) => u.startsWith(base) || u.startsWith("file://"));
      await pC.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1, isMobile: ancho < 500 });
      let httpClon = null;
      try {
        const resp = await pC.goto(`${base}/${item.slug}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
        httpClon = resp ? resp.status() : null;
      } catch { httpClon = null; }
      await pC.evaluate(() => { for (const i of document.querySelectorAll("img[loading]")) i.loading = "eager"; });
      let clon = await pC.evaluate(medirEnPagina);
      const bloqC = nBloqC();
      await pC.close();

      /* ── LOS SABOTAJES, aplicados AQUÍ para que atraviesen la comparación ── */
      if (NEG_MISMO_LADO) clon = JSON.parse(JSON.stringify(orig));
      if (NEG_GRITA && clon.presente) clon.caja = { ...clon.caja, h: +(clon.caja.h + NEG_GRITA).toFixed(2) };
      else if (NEG_GRITA && !clon.presente) {
        // sin objeto todavía: se inyecta el Δ sobre una COPIA del original, que
        // es la única forma de que el caso «sabe gritar» sea ejercitable HOY.
        clon = JSON.parse(JSON.stringify(orig));
        if (clon.presente) clon.caja = { ...clon.caja, h: +(clon.caja.h + NEG_GRITA).toFixed(2) };
      }

      filas.push({ ...item, ancho, httpClon, hojas: { enlazadas, resueltas }, bloqueadas: { orig: bloqO, clon: bloqC }, orig, clon });
      ev.ok();
    }
  }
} finally {
  await browser.close();
  pararClon();
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA COMPARACIÓN — se NOMBRA cada Δ con SUS DOS LADOS (§sondas 1)
 * `orig X → clon Y`. Un número solo no se puede leer bien.
 * ═════════════════════════════════════════════════════════════════════════ */
const EJES = [
  ["caja.w", (m) => m.caja?.w], ["caja.h", (m) => m.caja?.h],
  ["pad", (m) => m.pad], ["br", (m) => m.br], ["bg", (m) => m.bg],
  ["nPapeles", (m) => m.nPapeles],
];
const EJES_PAPEL = [
  ["ds", (p) => p.ds], ["mis", (p) => p.mis], ["mt", (p) => p.mt],
  ["proemio", (p) => p.proemio], ["href", (p) => p.href],
  ["p.fs", (p) => p.p?.fs], ["p.lh", (p) => p.p?.lh], ["p.mis", (p) => p.p?.mis],
  ["img.w", (p) => p.img?.w], ["img.h", (p) => p.img?.h], ["img.br", (p) => p.img?.br],
];

const dif = [];
let ausentes = 0, comparados = 0;
for (const f of filas) {
  if (!f.orig.presente) { dif.push({ ...f, eje: "ficha", nota: "AUSENTE EN EL ORIGINAL" }); continue; }
  if (!f.clon.presente) { ausentes++; continue; }
  comparados++;
  for (const [eje, get] of EJES) {
    const a = get(f.orig), b = get(f.clon);
    if (String(a) !== String(b)) dif.push({ slug: f.slug, ancho: f.ancho, eje, orig: a, clon: b });
  }
  const n = Math.max(f.orig.papeles.length, f.clon.papeles.length);
  for (let i = 0; i < n; i++) {
    const po = f.orig.papeles[i], pc = f.clon.papeles[i];
    if (!po || !pc) { dif.push({ slug: f.slug, ancho: f.ancho, eje: `papel[${i}]`, orig: po ? po.clase : "—", clon: pc ? pc.clase : "—" }); continue; }
    for (const [eje, get] of EJES_PAPEL) {
      const a = get(po), b = get(pc);
      if (String(a) !== String(b)) dif.push({ slug: f.slug, ancho: f.ancho, eje: `papel[${i}].${eje}`, orig: a, clon: b });
    }
  }
}

console.log(`\n═══ FICHA-CMP · ${hoy()} ═══\n`);
console.log(`  catálogo: **${catalogo.length}** entradas de **${inventario.length}** con ficha` +
            `  (§regla 14: lo NO medido son ${inventario.length - catalogo.length})`);
for (const c of catalogo) console.log(`     · ${c.slug.slice(0, 46).padEnd(46)} ${c.razon}`);
console.log(`\n  hojas: resueltas ${filas[0]?.hojas.resueltas}/${filas[0]?.hojas.enlazadas} por página` +
            ` · páginas con CERO resueltas: ${hojasCero}`);
console.log(`  bloqueadas (§regla 32 — el cardinal va en LOS DOS lados):` +
            ` orig ${filas.reduce((s, f) => s + f.bloqueadas.orig, 0)}` +
            ` · clon ${filas.reduce((s, f) => s + f.bloqueadas.clon, 0)}`);
console.log(`\n  pares con ficha en el ORIGINAL: ${filas.filter((f) => f.orig.presente).length}/${filas.length}`);
console.log(`  pares con ficha en el CLON:     ${filas.filter((f) => f.clon.presente).length}/${filas.length}`);
console.log(`  AUSENTE en el clon: **${ausentes}** · comparados de verdad: **${comparados}**`);

if (dif.length) {
  console.log(`\n  ── Δ NOMBRADOS CON SUS DOS LADOS ──`);
  for (const d of dif.slice(0, 40))
    console.log(`     ${String(d.ancho).padStart(4)}  ${d.slug?.slice(0, 34).padEnd(34)} ${d.eje.padEnd(22)} orig ${String(d.orig).slice(0, 34)} → clon ${String(d.clon).slice(0, 34)}`);
  if (dif.length > 40) console.log(`     … y ${dif.length - 40} más (todas en la congelada)`);
}

w(`medidas/ficha-cmp.json`, {
  fecha: hoy(),
  que: "la ficha de autor comparada a dos lados, original capturado con sus hojas contra el clon servido",
  sabotajes: SABOTAJES,
  catalogo: catalogo.map((c) => ({ slug: c.slug, razon: c.razon })),
  noMide: {
    entradasFueraDelCatalogo: inventario.length - catalogo.length,
    de: inventario.length,
    fotosSinCapturar: 5,
    hojasEtCacheSinResolver: 158,
  },
  ausentesEnClon: ausentes,
  comparados,
  diferencias: dif,
  filas,
});

/* ── el veredicto: se cierra con el DOMINIO, no con el booleano (§regla 22) ── */
console.log(`\n  ✓ evaluadas ${ev.n}/${ev.minimo} pares (entrada × ancho)`);
if (dif.length) {
  console.error(`\n❌ ${dif.length} diferencias. Arriba van nombradas con sus dos lados.`);
  process.exit(1);
}
if (ausentes) {
  console.log(
    `\n⚠ ${ausentes} pares con la ficha AUSENTE EN EL CLON.\n` +
      `  Hoy eso es el ESTADO DE PARTIDA, no un fallo del comparador: el clon no\n` +
      `  la pinta (0 de 155 ficheros de código). El comparador queda adjudicado\n` +
      `  ANTES de que exista el objeto, que es lo que §regla 24 compra: cuando\n` +
      `  aparezca, un rojo sólo puede ser suyo.\n`,
  );
  process.exit(3);
}
console.log(`\n✅ sin diferencias en ${comparados} pares comparados.`);
