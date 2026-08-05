/**
 * CAPTURA DE LA MEDIA DEL CORPUS — los bytes del original, congelados.
 * Uso: npm run cms:captura-media       (SIN_CLON: solo pega al original)
 *
 * ── Por qué existe, y por qué es la ÚLTIMA vez ────────────────────────────
 * `captura.mjs` congeló el HTML de las 309 páginas. Dentro de ese HTML hay
 * **referencias** a ficheros que nunca se bajaron: el corpus apunta a imágenes,
 * PDF y vídeos del original. Mientras eso siga así, **el sitio vivo está en el
 * camino crítico de las imágenes** igual que lo estaba del HTML.
 *
 * > **Con esta captura congelada y commiteada, el original deja de estar en el
 * > camino crítico también para la media.** Es la última vez que este proyecto
 * > tiene que pegarle al sitio vivo por un fichero: a partir de aquí, todo —el
 * > extractor, T3b, T4b, el alta— corre OFFLINE contra bytes con `sha256`.
 *
 * ── De dónde sale la lista (DERIVADA y congelada, no escrita) ─────────────
 * De `medidas/media-regenera.json` → `listaACapturar`, que `qa:media-regenera`
 * derivó con su negativo 5/5. **537 orígenes**, no las 1 571 referencias, y las
 * dos reducciones están medidas ahí:
 *
 *   · **el CASCARÓN no entra** — dos tercios de la media del corpus la pinta la
 *     plantilla del tema, no el contenido, y el CMS no la usa;
 *   · **las VARIANTES no se capturan** — el pipeline real (Payload + sharp)
 *     reproduce su **dimensión exacta** (73/73 medido); lo que no reproduce son
 *     los bytes, que no mueven un píxel.
 *
 * ⚠ **FUERA de `corpus/`, y no es una preferencia:** meter ficheros ahí movería
 * los denominadores congelados que hay citados en actas —309 páginas de
 * `media-srcset`, 209 cuerpos del extractor—, que se derivan de `INDICE.json`.
 * Esta captura tiene su propio árbol y su propio índice.
 *
 * ── La etiqueta, la misma de los censos ───────────────────────────────────
 * UNA petición por fichero, **secuencial**, espaciada 500 ms, **NUNCA en
 * paralelo**. Y «una vez» vale ENTRE corridas: lo ya capturado no se re-pide,
 * así que una corrida interrumpida se reanuda sin volver a pegarle al original.
 *
 * ── Qué NO hace ───────────────────────────────────────────────────────────
 * No transforma, no redimensiona, no sanea. Congela bytes tal como los sirvió
 * el CDN, con su `sha256`, su `content-type` y su tamaño.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1"; // solo pega al original: un build del clon no contamina

const RAIZ = join(QA, "../..");
const DESTINO = join(RAIZ, "media-corpus");
const INDICE = join(DESTINO, "INDICE.json");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const PREFIJO = "https://kunakair.com/wp-content/uploads/";

/* ── la lista, DERIVADA de la congelada (regla 9: no se escribe, se deriva) ── */
const medida = JSON.parse(readFileSync(join(QA, "medidas", "media-regenera.json"), "utf8"));
const lista = medida.listaACapturar ?? [];
if (!lista.length)
  throw new Error(
    "`media-regenera.json` no trae `listaACapturar`. Sin lista no hay captura, y una lista vacía\n" +
      "  se leería como «ya está todo capturado» — la regla del cero. Corre `npm run qa:media-regenera`.",
  );
if (medida.veredicto?.reproduceDimension !== true)
  throw new Error(
    "`media-regenera` NO afirma que el pipeline reproduzca la dimensión. Sin eso, capturar sólo\n" +
      "  orígenes pierde variantes que nadie va a regenerar. Se para aquí a propósito (regla 6).",
  );

console.log(`\n════════ CAPTURA DE MEDIA · ${lista.length} orígenes derivados ════════`);
console.log(`  fuente de la lista: medidas/media-regenera.json (${medida.meta?.fecha}) · negativo 5/5`);
console.log(`  destino: media-corpus/  ← FUERA de corpus/, para no mover sus denominadores\n`);

const ev = new Evaluadas({ nombre: "captura-media", unidad: "ficheros", minimo: lista.length });
const previo = existsSync(INDICE) ? JSON.parse(readFileSync(INDICE, "utf8")) : { ficheros: {} };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const ficheros = {};
let nuevos = 0, reutilizados = 0, fallos = 0, bytes = 0;
const errores = [];
let i = 0;

for (const url of lista) {
  i++;
  if (!url.startsWith(PREFIJO)) {
    errores.push({ url, error: "fuera del prefijo de uploads: no se captura lo que no se sabe dónde poner" });
    fallos++;
    continue;
  }
  const rel = decodeURIComponent(url.slice(PREFIJO.length));
  const destino = join(DESTINO, rel);
  const clave = rel;

  /* Ya capturado: NO se vuelve a pedir (una vez por fichero, ENTRE corridas). */
  if (existsSync(destino)) {
    const buf = readFileSync(destino);
    const antes = previo.ficheros[clave];
    ficheros[clave] =
      antes && antes.sha256 === sha(buf)
        ? antes
        : { url, fichero: rel, bytes: buf.length, sha256: sha(buf), tipo: antes?.tipo ?? null, capturado: antes?.capturado ?? "(desconocido: fichero en disco sin entrada de índice)" };
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
    ev.fallo(clave, error);
    console.log(`  ✗ ${String(i).padStart(3)}/${lista.length}  ${rel}  — ${error}`);
    await dormir(ESPACIADO_MS);
    continue;
  }

  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, buf);
  ficheros[clave] = { url, fichero: rel, bytes: buf.length, sha256: sha(buf), tipo, capturado: hoy() };
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
        fuente: `medidas/media-regenera.json · listaACapturar (${lista.length})`,
        etiqueta: `secuencial · ${ESPACIADO_MS} ms · nunca en paralelo · una petición por fichero, también entre corridas`,
        porQue:
          "con esta captura congelada y commiteada, el sitio vivo deja de estar en el camino crítico también para la media. " +
          "El extractor, T3b, T4b y el alta corren OFFLINE contra estos bytes.",
        fuera: "las VARIANTES (el pipeline reproduce su dimensión: 73/73) y el CASCARÓN (dos tercios, y el CMS no lo usa)",
      },
      resumen: { pedidos: lista.length, nuevos, reutilizados, fallos, bytes },
      errores,
      ficheros,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n──────── CAPTURA DE MEDIA ────────`);
console.log(`  nuevos ....... ${nuevos}`);
console.log(`  reutilizados . ${reutilizados}`);
console.log(`  fallos ....... ${fallos}`);
console.log(`  bytes ........ ${(bytes / 1e6).toFixed(1)} MB`);
for (const e of errores.slice(0, 12)) console.log(`     ✗ ${e.url.replace(PREFIJO, "")} — ${e.error}`);
console.log(`\n→ media-corpus/INDICE.json`);
console.log(`  ⚠ COMMITEA esto ANTES de transformar nada (regla 5b).`);

process.exit(ev.informe() ? 2 : 0);
