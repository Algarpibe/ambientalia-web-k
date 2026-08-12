/**
 * LA MEDIA DE LA CAMPAÑA F3 — la otra mitad del PASO 0, y sin ella el PASO 0
 * NO está hecho.
 * Uso: npm run cms:captura-f3-media     (SOLO_DERIVA=1 → deriva y no pide nada)
 *      LISTA=medidas/media-siembra.json npm run cms:captura-f3-media
 * Negativo: npm run cms:captura-f3-media-neg
 *
 * ── ⚠ DOS MODOS, y el segundo se añadió el 2026-08-12 ─────────────────────
 * El modo original **deriva su lista del HTML de `corpus/fase-3/`**, que es lo
 * correcto para lo que capturó: las páginas de esa campaña. Pero la tanda de
 * DATOS necesita capturar la media de **los CAMPOS de cinco colecciones**, y
 * esos campos no viven en el HTML de `corpus/fase-3/` — la imagen destacada,
 * sin ir más lejos, es un campo propio fuera del cuerpo.
 *
 * Volver a derivar aquí sería **una segunda definición del hueco**, que es la
 * clase C7 y además la que ya se pagó: `qa:media-siembra` lo deriva **contra la
 * guarda que para** (`apps/web/public`, no `media-corpus`) y con los canales
 * enumerados contra el esquema. Así que este script **consume esa lista** en vez
 * de fabricar otra:
 *
 *   · `LISTA=<json>` → la lista sale de `origenesACapturar` de esa congelada, y
 *     el destino es **`media-corpus/datos/` con índice propio** — por la misma
 *     razón que `fase-3/` lo tiene: `media-corpus/INDICE.json` sigue diciendo
 *     534 y `fase-3/INDICE.json` lo suyo, y **ningún acta que los cite se
 *     mueve**;
 *   · sin `LISTA` → el comportamiento de siempre, intacto.
 *
 * Y la guarda que hacía falta para que el modo nuevo no herede el fallo de
 * siempre: **una lista que no resuelve, o que resuelve a CERO, TIRA.** Un `?? []`
 * ahí convertiría «la sonda no se ha corrido» en «no hay nada que capturar», y
 * la campaña saldría verde sin pedir un fichero (§sondas 4 · regla 6).
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
import { dirname, join, relative, sep } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, origenDe, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const F3 = join(RAIZ, "corpus/fase-3");
/**
 * `LISTA=<json>` — la campaña de CAMPOS, con su propio subárbol e índice.
 *
 * ⚠ **También por argumento (`--lista=…`), y no es una comodidad:** `npm run`
 * ejecuta el script con `cmd.exe` en Windows, donde el prefijo `VAR=valor cmd`
 * **no es sintaxis** — sale *«"LISTA" no se reconoce como un comando»*. Un
 * `npm run` que sólo funciona en POSIX es una sonda que en esta máquina no se
 * puede correr, así que el modo se declara por las dos vías.
 */
const LISTA =
  process.env.LISTA || (process.argv.slice(2).find((a) => a.startsWith("--lista=")) ?? "").split("=").slice(1).join("=") || null;
const DESTINO = join(RAIZ, LISTA ? "media-corpus/datos" : "media-corpus/fase-3");
/**
 * ⚠ **UNA CORRIDA NEGATIVA NO PISA EL ÍNDICE DE LA CAMPAÑA**, y esto se escribió
 * después de que lo hiciera: el sabotaje `error-no-404` reescribió
 * `media-corpus/datos/INDICE.json` con 28 fallos y 0 ficheros, o sea **borró el
 * acta de la campaña buena en el acto de comprobar una guarda**.
 *
 * Es exactamente §sondas 5 —*congelar no sirve de nada si la siguiente corrida
 * descongela sin avisar*— y **la guarda de `w()` no lo cubría**, porque este
 * script escribe su índice con `writeFileSync` directo. `corridaNegativa` ya
 * pone `NEG` en el entorno; lo que faltaba era leerlo aquí.
 */
const NEG = process.env.NEG || null;
const INDICE = join(DESTINO, NEG ? `INDICE-neg-${NEG}.json` : "INDICE.json");
const PREVIO = join(RAIZ, "media-corpus/INDICE.json");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const PREFIJO = "https://kunakair.com/wp-content/uploads/";
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;
const SABOTAJE_NO_404 = process.env.SABOTAJE === "error-no-404";
if (process.env.SABOTAJE && !SABOTAJE_NO_404)
  throw new Error(`SABOTAJE desconocido: '${process.env.SABOTAJE}' (error-no-404)`);

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── la derivación ───────────────────────────────────────────────────────── */
const referencias = new Map(); // origen → nº de referencias
let conFichero = [];

if (LISTA) {
  /**
   * MODO LISTA — la lista viene DERIVADA de fuera, y las dos guardas de abajo
   * son la regla 6 aplicada a un fichero de entrada: una ausencia se **rechaza**,
   * no se sustituye por un valor benigno.
   */
  const f = join(QA, LISTA);
  if (!existsSync(f))
    throw new Error(
      `LISTA AUSENTE: no existe ${LISTA}.\n` +
        `  Corre \`npm run qa:media-siembra\` antes: la lista se DERIVA contra la guarda\n` +
        `  que para (apps/web/public), y sin ella esta campaña no sabe qué pedir.`,
    );
  const raiz = JSON.parse(readFileSync(f, "utf8"));
  const origenes = raiz.origenesACapturar;
  if (!Array.isArray(origenes) || !origenes.length)
    throw new Error(
      `LISTA VACÍA: ${LISTA} no trae 'origenesACapturar' con contenido (es ${typeof origenes}, ${origenes?.length ?? "—"} entradas).\n` +
        `  Eso NO es «no hay nada que capturar»: es una lista que no se pudo leer, y su\n` +
        `  cero saldría como una campaña verde que no pidió un solo fichero.`,
    );
  for (const local of origenes) {
    /* `/images/uploads/X` es la ruta LOCAL (T3b). Al original se le pide la suya. */
    referencias.set(PREFIJO + local.replace(/^\/images\/uploads\//, ""), 1);
  }
  console.log(`\n  (modo LISTA — ${origenes.length} orígenes derivados por ${LISTA}, destino media-corpus/datos/)`);
} else {
  const indiceF3 = JSON.parse(readFileSync(join(F3, "INDICE.json"), "utf8"));
  conFichero = Object.values(indiceF3.paginas).filter((p) => p.fichero);
  if (!conFichero.length)
    throw new Error(
      "0 páginas con fichero en `corpus/fase-3/INDICE.json`: sin HTML no hay referencias que derivar,\n" +
        "  y una lista vacía se leería como «ya está todo capturado» — la regla del cero.",
    );
  for (const p of conFichero) {
    const html = readFileSync(join(F3, p.fichero), "utf8");
    for (const m of html.matchAll(/["'(](https?:\/\/kunakair\.com\/wp-content\/uploads\/[^"')?\s]+)/g)) {
      const o = origenDe(m[1]);
      referencias.set(o, (referencias.get(o) ?? 0) + 1);
    }
  }
}

/**
 * Lo que la captura de F2-2 ya tiene: dos tandas del MISMO archivo.
 *
 * ⚠ En modo LISTA **no se vuelve a filtrar**: `media-siembra` ya cruzó contra
 * `media-corpus` **y** contra `public`, y volver a hacerlo aquí sería la segunda
 * definición del hueco que este modo existe para no tener.
 */
const yaEnCorpus = new Set();
if (!LISTA && existsSync(PREVIO))
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

console.log(`\n════════ MEDIA DE LA CAMPAÑA ${LISTA ? "DE DATOS (modo LISTA)" : "F3"} ════════\n`);
console.log(`  ${LISTA ? `lista               ${LISTA}` : `HTML leído          ${conFichero.length} ficheros de corpus/fase-3/`}`);
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
/** 404 del original: ausencia MEDIDA, no captura fallida. Se congela con su fecha. */
const ausentesEnOrigen = [];
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
  /**
   * ⚠ `SABOTAJE=error-no-404` — el negativo del reclasificador de arriba, y
   * **sin una sola petición**: sustituye el error por uno que NO es 404, así
   * que lo que era «ausencia medida» tiene que volver a ser FALLO. Sin él, la
   * excepción del 404 sería una puerta por la que se colaría cualquier error.
   */
  if (SABOTAJE_NO_404) {
    error = "HTTP 503 (sabotaje: no es un 404)";
  } else
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
    /**
     * ⚠ **UN 404 DEL ORIGINAL NO ES UNA CAPTURA FALLIDA: es una AUSENCIA
     * MEDIDA EN EL ORIGINAL**, y mezclarlos deja el contrato en rojo para
     * siempre por algo que no se puede arreglar capturando más.
     *
     * Es el mismo precedente que las rutas de DIRECTORIO de arriba —*«contarlas
     * como fallo deja el contrato en rojo para siempre por algo que no
     * existe»*— y se aplica con las mismas dos condiciones, que son las que
     * impiden que se convierta en una excusa:
     *
     *   · **sólo el 404**, que es reproducible y decidible: un 500, un timeout
     *     o un DNS caído siguen siendo FALLO, porque ahí no sabemos nada;
     *   · **se imprime una a una y se congela con su fecha**. Un descarte en
     *     silencio y un fallo dan informes distintos, y ninguno de los dos es el
     *     correcto (§sondas 1: lo que imprime y lo que cuenta no discrepan).
     *
     * Medido el 2026-08-12 en DOS corridas seguidas: **28 de 393**, todas del
     * canal C (el cuerpo rico), **ninguna del canal A**. O sea que no bloquean
     * ninguna siembra — y el clon servirá para ellas exactamente el mismo 404
     * que sirve el original, que es fidelidad y no deuda.
     */
    if (/HTTP 404/.test(error ?? "")) {
      ausentesEnOrigen.push({ url, fichero: rel, http: 404, comprobado: hoy() });
      console.log(`  ⌀ ${String(i).padStart(3)}/${lista.length}  ${rel} — 404 EN EL ORIGINAL (ausencia medida, no fallo)`);
      ev.ok();
      await dormir(ESPACIADO_MS);
      continue;
    }
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
        que: LISTA
          ? "La media de los CAMPOS de las 5 colecciones de la tanda de DATOS. Índice PROPIO: los de `media-corpus/` y `fase-3/` no se mueven."
          : "La media que referencia la captura de la FASE 3. Índice PROPIO: `media-corpus/INDICE.json` sigue en 534.",
        derivacion: LISTA
          ? `${LISTA} → \`origenesACapturar\`, derivado contra la guarda que PARA (apps/web/public) y con los canales enumerados contra el esquema`
          : "corpus/fase-3/INDICE.json → referencias a /wp-content/uploads/, con `origenDe()` colapsando variantes -WxH",
        etiqueta: `secuencial · ${ESPACIADO_MS} ms · nunca en paralelo · una petición por fichero, también entre corridas`,
        porQue: "sin esto el original SIGUE en el camino crítico: 0 de las 56 imágenes de `articulos-kb` estaban capturadas.",
        fuera: `las VARIANTES (el pipeline reproduce su dimensión: 73/73) y ${noSonFichero.length} ruta(s) de DIRECTORIO que no son un fichero. El CASCARÓN **NO** se excluye: esa partición no se ha medido para estas páginas y el defecto se pone en la dirección que grita.`,
      },
      resumen: { pedidos: lista.length, nuevos, reutilizados, fallos, ausentesEnOrigen: ausentesEnOrigen.length, bytes },
      errores,
      /* Ausencias MEDIDAS en el original (404), no capturas fallidas. Se congelan
       * con su fecha para que la afirmación sea auditable y no una excusa. */
      ausentesEnOrigen,
      ficheros,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n──────── MEDIA ${LISTA ? "DE DATOS" : "F3"} ────────`);
console.log(`  nuevos ....... ${nuevos}`);
console.log(`  reutilizados . ${reutilizados}`);
console.log(`  fallos ....... ${fallos}`);
console.log(`  404 en origen  ${ausentesEnOrigen.length}   ← ausencia MEDIDA del original, no captura fallida`);
console.log(`  bytes ........ ${(bytes / 1e6).toFixed(1)} MB`);
for (const e of errores.slice(0, 12)) console.log(`     ✗ ${e.url.replace(PREFIJO, "")} — ${e.error}`);
/* Una a una, sin recortar: un descarte en silencio y un fallo dan informes
 * distintos, y ninguno de los dos es el correcto (§sondas 1). */
for (const a of ausentesEnOrigen) console.log(`     ⌀ ${a.fichero} — 404 el ${a.comprobado}`);
/* ⚠ La ruta se DERIVA de `INDICE`, no se teclea: la primera corrida en modo
 * LISTA escribió en `media-corpus/datos/` e imprimió `media-corpus/fase-3/`.
 * §sondas 1 — lo que imprime y lo que hace no pueden discrepar, y un lector del
 * informe habría ido a buscar la campaña al archivo equivocado. */
console.log(`\n→ ${relative(RAIZ, INDICE).split(sep).join("/")}`);
console.log(`  ⚠ COMMITEA esto ANTES de transformar nada (regla 5b).`);

process.exit(ev.informe() ? 2 : 0);
