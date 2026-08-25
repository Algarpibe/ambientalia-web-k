/**
 * LAS FUENTES WEB — el QUINTO canal, y el primero que no se descubrió chocando.
 * Uso: npm run cms:captura-fuentes
 *      SOLO_DERIVA=1 npm run cms:captura-fuentes   (inventario, sin pedir nada)
 * Negativo: npm run cms:captura-fuentes-neg
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────
 * §EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA DECLARA lleva
 * cuatro canales anotados —cuerpo rico, destacada, panel de producto, hojas
 * CSS— y de los cuatro, **tres mataron un seed** y el cuarto dejó una condición
 * sin pagar. Éste es el quinto y **no rompe nada**: una fuente que no carga
 * renderiza con el respaldo del sistema y la página **sigue midiendo**.
 *
 * Es exactamente la salida que la ley llama *plausible y falsa*, y aquí se pagó
 * con un número que enseña (`derivaciones/fuente-f33.log`, 3 páginas a 1440):
 *
 *   > con Manrope cargada frente a sin ella, **`docH` se mueve −1** y **944 de
 *   > 1257 cajas (75.1 %) se mueven**, con `|Δh|` hasta **28.00** y `|Δw|`
 *   > hasta **52.42**.
 *
 * O sea: leído por el total, el canal de fuentes parece **despreciable**; leído
 * por elemento, mueve **tres cuartas partes de la página**. El total era el
 * contenedor (§*un Δ de cero puede ser dos errores que se anulan*).
 *
 * Y por qué NO vale con bloquearlas en los dos lados, que sería más barato: el
 * clon sirve Manrope **auto-alojada** por `next/font/google`, que además genera
 * una cara de respaldo con `size-adjust`. Bloquear dejaría al original con el
 * `sans-serif` del sistema y al clon con la cara ajustada de Next: **dos
 * respaldos distintos**, o sea la misma asimetría con otro nombre.
 *
 * ── LO QUE DERIVA (siempre) Y LO QUE PIDE ────────────────────────────────
 * El inventario sale de **todo el corpus**, por los DOS canales por los que una
 * fuente entra:
 *
 *   1 · `@import url(...)` dentro de una hoja ya capturada (`corpus/css/`);
 *   2 · `@import url(...)` dentro de un `<style>` EN LÍNEA del HTML.
 *
 * Mirar sólo el primero habría dado **1 familia** en vez de 4: los `<style>` de
 * los módulos `et_pb_code` traen Lato y Roboto de `fonts.bunny.net`, y ninguna
 * hoja de `corpus/css` los nombra (§*la salida servida incluye el canal que no
 * estabas mirando*).
 *
 * ── LA ETIQUETA ──────────────────────────────────────────────────────────
 * Secuencial · 500 ms · nunca en paralelo · sha256 · reanudable · el CSS se
 * pide con **UA de navegador moderno** (Google sirve `woff2` o `ttf` según UA:
 * con el UA del repo devolvería otra cosa y las métricas no serían las que el
 * original compone). Y **no se toca `kunakair.com`**: estos hosts son
 * `fonts.googleapis.com`, `fonts.gstatic.com` y `fonts.bunny.net`.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
/** UA de navegador moderno: decide QUÉ FORMATO sirve Google (`woff2` vs `ttf`). */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const ESPACIADO_MS = 500;
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;

/**
 * §sondas 5 · una corrida negativa NO pisa la campaña buena.
 *
 * ⚠⚠ **Y EL DESVÍO ES DEL ÁRBOL ENTERO, NO SÓLO DEL ÍNDICE — la primera
 * versión desviaba el índice y escribía los CSS en su sitio.**
 *
 * El sabotaje `css-vacio` escribió **4 hojas de 0 bytes encima de las
 * capturadas** y salió en verde: el índice decía `INDICE-neg-…` y los
 * artefactos tenían nombre de captura buena. Es §regla 7 —*un artefacto de
 * test en negativo no puede parecer una medida*— con la mitad que no estaba
 * escrita: **lo que hay que desviar es todo lo que la corrida ESCRIBE**, y un
 * índice desviado al lado de unos bytes pisados es la peor de las dos salidas,
 * porque el nombre bueno tiene ahora contenido de control.
 *
 * Lo que lo destapó fue el propio negativo. Lo que lo habría hecho
 * recuperable, y no estaba hecho, es §regla 5: **congelar y COMMITEAR van en
 * la misma tanda**.
 */
const NEG = process.env.NEG || null;
const DESTINO = join(RAIZ, NEG ? `corpus/fuentes-neg-${NEG}` : "corpus/fuentes");
const INDICE = join(DESTINO, "INDICE.json");

const SABOTAJES = new Set(["sin-ua", "css-vacio"]);
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.has(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${[...SABOTAJES].join(" · ")})`);
/**
 * ⚠ §regla 24 · **el desvío del nombre lo hace la campaña, no quien la lanza.**
 * Si dependiera de acordarse de poner `NEG=`, una corrida de sabotaje dejaría
 * un índice con NOMBRE DE MEDIDA y contenido de control.
 */
if (SABOTAJE && !NEG)
  throw new Error(
    `SABOTAJE='${SABOTAJE}' sin NEG=: la salida canónica quedaría con contenido de control (§regla 7/24).\n` +
      "  Lánzalo con NEG=<caso>.",
  );

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── 1 · el inventario: los DOS canales por los que entra una fuente ──────── */
const RE_IMPORT = /@import\s+url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
const HOSTS = /^https?:\/\/(fonts\.googleapis\.com|fonts\.bunny\.net|fonts\.gstatic\.com)\//i;

/** Recorre un árbol quedándose con las extensiones pedidas. */
function anda(dir, ext, fuera) {
  const out = [];
  (function rec(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { if (p !== fuera) rec(p); }
      else if (ext.test(e.name)) out.push(p);
    }
  })(dir);
  return out;
}

const htmls = anda(CORPUS, /\.html?$/i, DESTINO);
/**
 * ⚠ **`CORPUS_CSS_VACIO` sabotea EL DATO, no el umbral** (§regla 28): reproduce
 * el modo de fallo del que la guarda protege —que el canal 1 no se esté
 * leyendo— en vez de la aritmética de su condición. Bajar un umbral aquí no
 * mordería: el lado medido no es 0.
 */
const hojas = process.env.CORPUS_CSS_VACIO ? [] : anda(join(RAIZ, "corpus/css"), /\.css$/i, DESTINO);
if (!htmls.length) throw new Error("0 HTML en `corpus/`: su cero se leería como «no hay fuentes» (§sondas 4).");
if (!hojas.length) throw new Error("0 hojas en `corpus/css`: sin ellas el canal 1 sale a cero sin haberse mirado (§sondas 4).");

/** url → { canal:Set, donde:Set } */
const inventario = new Map();
const anota = (url, canal, donde) => {
  if (!HOSTS.test(url)) return;
  if (!inventario.has(url)) inventario.set(url, { canal: new Set(), donde: new Set() });
  const v = inventario.get(url);
  v.canal.add(canal);
  v.donde.add(relative(RAIZ, donde).split("\\").join("/"));
};

for (const f of hojas) for (const m of readFileSync(f, "utf8").matchAll(RE_IMPORT)) anota(m[2], "hoja", f);
for (const f of htmls) {
  const html = readFileSync(f, "utf8");
  /* Sólo dentro de `<style>`: el markup de fuera puede nombrar la URL en un
   * atributo y eso no la PIDE (§*el markup se busca sobre el HTML sin <style>*,
   * aquí al revés — lo que se busca es justo lo que hay dentro). */
  for (const s of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))
    for (const m of s[1].matchAll(RE_IMPORT)) anota(m[2], "style-en-linea", f);
}

const porCanal = {};
for (const v of inventario.values()) for (const c of v.canal) porCanal[c] = (porCanal[c] ?? 0) + 1;

console.log("\n════════ FUENTES WEB — inventario del corpus ════════\n");
console.log(`  HTML leídos          ${htmls.length}`);
console.log(`  hojas leídas         ${hojas.length}`);
console.log(`  familias distintas   ${inventario.size}`);
console.log(`  por canal            ${Object.entries(porCanal).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}`);
for (const [u, v] of inventario) console.log(`    · ${u}   [${[...v.canal].join("+")}]  en ${v.donde.size} fichero(s)`);

if (!inventario.size)
  throw new Error(
    "0 familias de fuente en TODO el corpus. Eso no es «este sitio no usa fuentes web»:\n" +
      "  es una lectura que no encontró nada, y su cero saldría como campaña verde (§sondas 4).",
  );

/* ── 2 · la campaña ──────────────────────────────────────────────────────── */
/** `https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap`
 *  → `googleapis/css2-family-Manrope-wght-200..800-display-swap.css`
 *  El nombre se DERIVA de la URL entera —query incluida—: dos familias del
 *  mismo host se distinguen sólo por el query, y colapsarlo las pisaría. */
function nombreCss(url) {
  const u = new URL(url);
  const host = u.host.replace(/^fonts\./, "").replace(/\..*$/, "");
  const cuerpo = (u.pathname.replace(/^\//, "") + (u.search ? "-" + u.search.slice(1) : ""))
    .replace(/[^A-Za-z0-9.]+/g, "-").replace(/^-|-$/g, "");
  return `${host}/${cuerpo}.css`;
}
const nombreBinario = (url) => {
  const u = new URL(url);
  const host = u.host.replace(/^fonts\./, "").replace(/\..*$/, "");
  return `${host}/${u.pathname.replace(/^\//, "").replace(/[^A-Za-z0-9./-]+/g, "-")}`;
};

const ev = new Evaluadas({
  sonda: "captura-fuentes",
  unidad: "recursos de fuente",
  /* El mínimo se DERIVA del inventario: una familia nueva sube el listón sola. */
  minimo: SOLO_DERIVA ? 1 : inventario.size,
});

const ficheros = existsSync(INDICE) ? (JSON.parse(readFileSync(INDICE, "utf8")).ficheros ?? {}) : {};
const fallos = [];
let binariosPedidos = 0;

async function pide(url, cabeceras) {
  const r = await fetch(url, { headers: cabeceras });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

if (!SOLO_DERIVA) {
  let i = 0;
  for (const url of inventario.keys()) {
    i++;
    const localCss = nombreCss(url);
    try {
      const cab = SABOTAJE === "sin-ua" ? {} : { "User-Agent": UA };
      let css = (await pide(url, cab)).toString("utf8");
      if (SABOTAJE === "css-vacio") css = "";

      /* Los binarios que ese CSS referencia, y su reescritura a ruta RELATIVA:
       * la hoja capturada tiene que valer servida por `file://` desde su sitio. */
      const urls = [...css.matchAll(/url\(\s*(['"]?)(https?:\/\/[^'")]+)\1\s*\)/gi)].map((m) => m[2]);
      const unicas = [...new Set(urls)];
      for (const b of unicas) {
        const localBin = nombreBinario(b);
        const destinoBin = join(DESTINO, localBin);
        /**
         * ⚠ **La reanudación salta la PETICIÓN, nunca el ASIENTO EN EL ÍNDICE.**
         * La primera versión metía las dos cosas dentro del mismo `if
         * (!existsSync)`, así que un fichero ya en disco con el índice borrado
         * quedaba **fuera del índice** — y el índice es lo que el consumidor
         * lee. Salió `binarios 40` con **50 en disco**, y lo cazó la
         * DIFERENCIA SIMÉTRICA contra el disco: un recuento no podía verlo
         * (§*un cardinal es un contenedor y absorbe la membresía*).
         */
        if (!existsSync(destinoBin)) {
          await dormir(ESPACIADO_MS);
          const buf = await pide(b, { "User-Agent": UA });
          mkdirSync(dirname(destinoBin), { recursive: true });
          writeFileSync(destinoBin, buf);
          binariosPedidos++;
        }
        const bytes = readFileSync(destinoBin);
        ficheros[localBin] = { url: b, bytes: bytes.length, sha256: sha(bytes), fecha: hoy(), tipo: "binario" };
        /* Relativa DESDE la hoja: `googleapis/x.css` y `googleapis/s/...` están
         * en el mismo host-directorio, así que basta subir uno. */
        const rel = relative(dirname(join(DESTINO, localCss)), destinoBin).split("\\").join("/");
        css = css.split(b).join(rel);
      }

      const destinoCss = join(DESTINO, localCss);
      mkdirSync(dirname(destinoCss), { recursive: true });
      const bufCss = Buffer.from(css, "utf8");
      writeFileSync(destinoCss, bufCss);
      ficheros[localCss] = {
        url, bytes: bufCss.length, sha256: sha(bufCss), fecha: hoy(), tipo: "css",
        binarios: unicas.length, caras: (css.match(/@font-face/g) || []).length,
      };
      console.log(`  ✓ ${i}/${inventario.size}  ${localCss}  (${bufCss.length} bytes · ${unicas.length} binarios · ${(css.match(/@font-face/g) || []).length} caras)`);
    } catch (e) {
      fallos.push({ url, error: String(e.message ?? e) });
      console.log(`  ✗ ${i}/${inventario.size}  ${localCss}  ${e.message ?? e}`);
    }
    ev.ok(1);
    if (i < inventario.size) await dormir(ESPACIADO_MS);
  }
} else ev.ok(1);

/* ── 3 · el índice ───────────────────────────────────────────────────────── */
mkdirSync(DESTINO, { recursive: true });
const css = Object.entries(ficheros).filter(([, v]) => v.tipo === "css");
const caras = css.reduce((a, [, v]) => a + (v.caras ?? 0), 0);
writeFileSync(INDICE, JSON.stringify({
  meta: {
    fecha: hoy(),
    que: "Las FUENTES WEB que el corpus pide — el canal que no rompe nada y mueve el 75 % de las cajas.",
    fuente: "fonts.googleapis.com · fonts.bunny.net · fonts.gstatic.com (bytes servidos, sin re-codificar)",
    derivacion: "@import url() de corpus/css/**.css (canal 1) y de los <style> en línea de corpus/**.html (canal 2)",
    etiqueta: `secuencial · ${ESPACIADO_MS} ms · UA de navegador moderno (decide woff2 vs ttf) · sha256 · reanudable`,
    porQue: "derivaciones/fuente-f33.log — con Manrope frente a sin ella, docH se mueve −1 y 944 de 1257 cajas (75.1 %) se mueven.",
    noToca: "kunakair.com. El original sigue fuera del camino crítico.",
    reescritura: "en el CSS capturado las url() absolutas quedan RELATIVAS a la copia local: la hoja vale servida por file://",
  },
  resumen: {
    htmlLeidos: htmls.length, hojasLeidas: hojas.length,
    familias: inventario.size, porCanal,
    css: css.length, binarios: Object.values(ficheros).filter((v) => v.tipo === "binario").length,
    caras, binariosPedidosEstaCorrida: binariosPedidos, fallos: fallos.length,
  },
  inventario: Object.fromEntries([...inventario].map(([u, v]) => [u, { canal: [...v.canal], ficheros: v.donde.size, capturada: existsSync(join(DESTINO, nombreCss(u))) }])),
  ficheros, fallos,
}, null, 2));

/**
 * ⚠⚠ **LA GUARDA ES LA DIFERENCIA SIMÉTRICA CONTRA EL DISCO, NO EL RECUENTO.**
 * `44` y `50` no se pueden comparar sin nombrar los elementos, y con un
 * recuento igual los dos conjuntos aún pueden diferir por los dos lados
 * (§*un cardinal es un contenedor y absorbe la membresía*). Los DOS lados se
 * publican: sobrar en el índice y faltar en él son defectos distintos.
 */
if (!SOLO_DERIVA) {
  const enDisco = new Set(anda(DESTINO, /.*/, null)
    .map((p) => relative(DESTINO, p).split("\\").join("/"))
    .filter((p) => !/^INDICE.*\.json$/.test(p)));
  const enIndice = new Set(Object.keys(ficheros));
  const soloDisco = [...enDisco].filter((p) => !enIndice.has(p));
  const soloIndice = [...enIndice].filter((p) => !enDisco.has(p));
  console.log(`\n  índice vs disco      en disco ${enDisco.size} · en índice ${enIndice.size} · sólo disco ${soloDisco.length} · sólo índice ${soloIndice.length}`);
  if (soloDisco.length || soloIndice.length) {
    console.log("⛔ ÍNDICE Y DISCO NO DENOTAN EL MISMO CONJUNTO");
    for (const p of soloDisco.slice(0, 10)) console.log(`   sólo en DISCO   ${p}`);
    for (const p of soloIndice.slice(0, 10)) console.log(`   sólo en ÍNDICE  ${p}`);
    process.exitCode = 3;
  }
}

console.log(`\n  índice               ${relative(RAIZ, INDICE).split("\\").join("/")}`);
console.log(`  css capturados       ${css.length} de ${inventario.size}`);
console.log(`  binarios             ${Object.values(ficheros).filter((v) => v.tipo === "binario").length}   caras @font-face ${caras}`);
if (fallos.length) {
  console.log(`\n⛔ ${fallos.length} FALLOS`);
  for (const f of fallos) console.log(`   ${f.url} — ${f.error}`);
  process.exitCode = 2;
} else if (!SOLO_DERIVA) console.log(`\n✅ ${inventario.size} familias capturadas · 0 fallos`);
