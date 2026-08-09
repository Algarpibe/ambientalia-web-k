/**
 * LA MEDIA DE LA CAMPAÑA F3 — la otra mitad del PASO 0, y sin ella el PASO 0
 * NO está hecho.
 * Uso: npm run cms:captura-f3-media     (SOLO_DERIVA=1 → deriva y no pide nada)
 *
 * ── Por qué existe: capturar las PÁGINAS no es capturar sus ASSETS ─────────
 * `captura-f3` congeló 249 ficheros de HTML y con eso el acta decía que «el
 * original sale del camino crítico». **Era falso a medias, y lo destapó
 * intentar sembrar**: de las **56 imágenes** que usan los 6 artículos de KB,
 * **0 estaban en `media-corpus/`**. O sea que construir cualquiera de estos
 * arquetipos seguía exigiendo pegarle al sitio vivo — que es justo lo que la
 * campaña venía a terminar.
 *
 * Es la misma lección que `captura-media.mjs` escribió para el corpus de F2-2,
 * cobrada otra vez por no haberla aplicado a la vez: *«mientras eso siga así,
 * el sitio vivo está en el camino crítico de las imágenes igual que lo estaba
 * del HTML»*.
 *
 * ── De dónde sale la lista (DERIVADA de lo congelado) ─────────────────────
 * De `corpus/fase-3/INDICE.json` → se recorren los 249 HTML capturados y se
 * sacan las referencias a `/wp-content/uploads/`. Dos reducciones, las MISMAS
 * que `media-regenera` midió para el corpus y por las mismas razones:
 *
 *   · **las VARIANTES no se capturan** — `origenDe()` quita el sufijo
 *     `-WxH`, porque el pipeline real (Payload + sharp) reproduce la dimensión
 *     exacta (73/73 medido) y lo que no reproduce son bytes que no mueven un
 *     píxel. Es la MISMA función que usa el resto del proyecto, importada;
 *   · **lo que ya está en `media-corpus/` no se re-pide** — la captura de F2-2
 *     y ésta son dos tandas del mismo archivo, no dos archivos.
 *
 * ⚠ **Lo que NO se reduce aquí, y se dice: el CASCARÓN.** Para el corpus,
 * `media-regenera` midió que dos tercios de la media la pinta la plantilla y la
 * quitó. Aquí **no se ha medido esa partición**, así que **no se aplica**: se
 * captura de más. El defecto se pone en la dirección que grita — sobrar media
 * cuesta disco, y faltarla deja al original en el camino crítico sin que nadie
 * se entere hasta que un build muere.
 *
 * ── Dónde vive ────────────────────────────────────────────────────────────
 * `media-corpus/fase-3/` con **índice propio**, por la misma razón que
 * `corpus/fase-3/`: `media-corpus/INDICE.json` sigue diciendo **534** y ningún
 * acta que lo cite se mueve. La regla `media-corpus/** -text` de
 * `.gitattributes` ya cubre el subárbol.
 *
 * ── La etiqueta ───────────────────────────────────────────────────────────
 * UNA petición por fichero · secuencial · 500 ms · nunca en paralelo · sha256 ·
 * reanudable entre corridas · COMMITEADA antes de transformar nada.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, origenDe, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const F3 = join(RAIZ, "corpus/fase-3");
const DESTINO = join(RAIZ, "media-corpus/fase-3");
const INDICE = join(DESTINO, "INDICE.json");
const PREVIO = join(RAIZ, "media-corpus/INDICE.json");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const PREFIJO = "https://kunakair.com/wp-content/uploads/";
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── la derivación ───────────────────────────────────────────────────────── */
const indiceF3 = JSON.parse(readFileSync(join(F3, "INDICE.json"), "utf8"));
const conFichero = Object.values(indiceF3.paginas).filter((p) => p.fichero);
if (!conFichero.length)
  throw new Error(
    "0 páginas con fichero en `corpus/fase-3/INDICE.json`: sin HTML no hay referencias que derivar,\n" +
      "  y una lista vacía se leería como «ya está todo capturado» — la regla del cero.",
  );

const referencias = new Map(); // origen → nº de referencias
for (const p of conFichero) {
  const html = readFileSync(join(F3, p.fichero), "utf8");
  for (const m of html.matchAll(/["'(](https?:\/\/kunakair\.com\/wp-content\/uploads\/[^"')?\s]+)/g)) {
    const o = origenDe(m[1]);
    referencias.set(o, (referencias.get(o) ?? 0) + 1);
  }
}

/* Lo que la captura de F2-2 ya tiene: dos tandas del MISMO archivo. */
const yaEnCorpus = new Set();
if (existsSync(PREVIO))
  for (const f of Object.values(JSON.parse(readFileSync(PREVIO, "utf8")).ficheros ?? {}))
    yaEnCorpus.add(origenDe(f.url ?? ""));

/**
 * ⚠ **Una referencia que no es un FICHERO no es una captura fallida.**
 * El barrido por regex recoge también rutas de DIRECTORIO —medido:
 * `…/uploads/3d-flip-book/cache/`, que el CDN contesta con **403**— y contarlas
 * como fallo deja el contrato en rojo para siempre por algo que no existe.
 * Se declaran FUERA con su razón y **se imprimen una a una**: es la misma
 * guarda que las URLs malformadas de `captura-f3`, y por lo mismo — descartar
 * en silencio y fallar por ello dan informes distintos, y ninguno de los dos
 * es el correcto.
 */
const esFichero = (u) => !u.endsWith("/") && /\.[A-Za-z0-9]{2,5}$/.test(u.split("/").pop());
const candidatos = [...referencias.keys()].filter((u) => !yaEnCorpus.has(u)).sort();
const noSonFichero = candidatos.filter((u) => !esFichero(u));
const lista = candidatos.filter(esFichero);

console.log(`\n════════ MEDIA DE LA CAMPAÑA F3 ════════\n`);
console.log(`  HTML leído          ${conFichero.length} ficheros de corpus/fase-3/`);
console.log(`  referencias         ${[...referencias.values()].reduce((a, b) => a + b, 0)}`);
console.log(`  orígenes distintos  ${referencias.size}   (variantes -WxH ya colapsadas)`);
console.log(`  ya en media-corpus  ${referencias.size - candidatos.length}`);
if (noSonFichero.length) {
  console.log(`  FUERA · no es un fichero (${noSonFichero.length}) — ruta de directorio recogida por el barrido:`);
  for (const u of noSonFichero) console.log(`     ${u.replace(PREFIJO, "")}`);
}
console.log(`  A CAPTURAR          ${lista.length}\n`);

const ev = new Evaluadas({ nombre: "captura-f3-media", unidad: "ficheros", minimo: lista.length });
if (SOLO_DERIVA) {
  console.log(`  (SOLO_DERIVA=1 — no se ha pedido ni un fichero.)\n`);
  ev.ok(lista.length);
  ev.informe();
  process.exit(0);
}

const previo = existsSync(INDICE) ? JSON.parse(readFileSync(INDICE, "utf8")) : { ficheros: {} };
const ficheros = {};
const errores = [];
let nuevos = 0, reutilizados = 0, fallos = 0, bytes = 0, i = 0;

for (const url of lista) {
  i++;
  if (!url.startsWith(PREFIJO)) {
    /* Un origen fuera del prefijo no se descarta en silencio: se NOMBRA. */
    errores.push({ url, error: "fuera del prefijo de uploads: no se captura lo que no se sabe dónde poner" });
    fallos++;
    ev.fallo(url, "fuera del prefijo");
    continue;
  }
  const rel = decodeURIComponent(url.slice(PREFIJO.length));
  const destino = join(DESTINO, rel);

  if (existsSync(destino)) {
    const buf = readFileSync(destino);
    const antes = previo.ficheros[rel];
    ficheros[rel] = antes && antes.sha256 === sha(buf) ? antes : { url, fichero: rel, bytes: buf.length, sha256: sha(buf), tipo: antes?.tipo ?? null, capturado: antes?.capturado ?? "(desconocido: fichero en disco sin entrada de índice)" };
    bytes += buf.length;
    reutilizados++;
    ev.ok();
    continue;
  }

  let buf = null, tipo = null, error = null;
  for (let intento = 1; intento <= 2 && !buf; intento++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(120_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      buf = Buffer.from(await r.arrayBuffer());
      tipo = r.headers.get("content-type");
    } catch (e) {
      error = e.message;
      if (intento < 2) await dormir(2000);
    }
  }

  if (!buf) {
    fallos++;
    errores.push({ url, error });
    ev.fallo(rel, error);
    console.log(`  ✗ ${String(i).padStart(3)}/${lista.length}  ${rel} — ${error}`);
    await dormir(ESPACIADO_MS);
    continue;
  }

  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, buf);
  ficheros[rel] = { url, fichero: rel, bytes: buf.length, sha256: sha(buf), tipo, capturado: hoy(), referencias: referencias.get(url) };
  bytes += buf.length;
  nuevos++;
  ev.ok();
  if (nuevos % 25 === 0) console.log(`  … ${String(i).padStart(3)}/${lista.length}  (${nuevos} nuevos · ${(bytes / 1e6).toFixed(1)} MB)`);
  await dormir(ESPACIADO_MS);
}

mkdirSync(DESTINO, { recursive: true });
writeFileSync(
  INDICE,
  JSON.stringify(
    {
      meta: {
        fecha: hoy(),
        que: "La media que referencia la captura de la FASE 3. Índice PROPIO: `media-corpus/INDICE.json` sigue en 534.",
        derivacion: "corpus/fase-3/INDICE.json → referencias a /wp-content/uploads/, con `origenDe()` colapsando variantes -WxH",
        etiqueta: `secuencial · ${ESPACIADO_MS} ms · nunca en paralelo · una petición por fichero, también entre corridas`,
        porQue: "sin esto el original SIGUE en el camino crítico: 0 de las 56 imágenes de `articulos-kb` estaban capturadas.",
        fuera: `las VARIANTES (el pipeline reproduce su dimensión: 73/73) y ${noSonFichero.length} ruta(s) de DIRECTORIO que no son un fichero. El CASCARÓN **NO** se excluye: esa partición no se ha medido para estas páginas y el defecto se pone en la dirección que grita.`,
      },
      resumen: { pedidos: lista.length, nuevos, reutilizados, fallos, bytes },
      errores,
      ficheros,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n──────── MEDIA F3 ────────`);
console.log(`  nuevos ....... ${nuevos}`);
console.log(`  reutilizados . ${reutilizados}`);
console.log(`  fallos ....... ${fallos}`);
console.log(`  bytes ........ ${(bytes / 1e6).toFixed(1)} MB`);
for (const e of errores.slice(0, 12)) console.log(`     ✗ ${e.url.replace(PREFIJO, "")} — ${e.error}`);
console.log(`\n→ media-corpus/fase-3/INDICE.json`);
console.log(`  ⚠ COMMITEA esto ANTES de transformar nada (regla 5b).`);

process.exit(ev.informe() ? 2 : 0);
