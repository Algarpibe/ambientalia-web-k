/**
 * EL SEED DE `articulos-kb` — **la primera colección cuyo dato NACE en el CMS.**
 * Uso:  npm run cms:seed-kb        (exige la colección VACÍA)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO ENTRA EN `seed.mjs`, Y NO ES SEPARACIÓN POR GUSTO
 *
 * `seed.mjs` siembra desde `CATALOGOS` —los `src/lib/*.ts`, que **son** los
 * datos (§8 de `PLAN-FASE-2.md`)— y `articulos-kb` **no tiene catálogo**: sus 6
 * instancias no están transcritas y no lo van a estar. Su fuente es
 * `medidas/kb-extraido.json`, derivado de las medidas congeladas por
 * `cms:extractor-kb`.
 *
 * Eso cambia una cosa importante y por eso está escrito arriba del todo: **su
 * verificación no es `qa:cms-campos`** —que empareja colección contra `src/lib`
 * y aquí no tiene contra qué emparejar— **sino el comparador de dos lados
 * contra el ORIGINAL** (F3-1 PASO 5).
 *
 * ── La media ──────────────────────────────────────────────────────────────
 * Las 56 imágenes vienen de `media-corpus/fase-3/` (índice propio, capturado
 * por `cms:captura-f3-media`), **no del sitio vivo**, y se copian a
 * `apps/web/public/images/uploads/` — la convención del clon, ver el bloque de
 * `ficheroDe` para por qué NO es `/wp-content/uploads/`.
 *
 * ⚠ **Una imagen que falte NO se sustituye por nada.** Un alta de media vacía
 * convierte «falta el fichero» en «la imagen es opcional», y el Δ0 lo paga
 * después (§regla 6).
 * ══════════════════════════════════════════════════════════════════════════
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, QA, origenDe } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const RAIZ = join(QA, "../..");
const EXTRAIDO = join(QA, "medidas/kb-extraido.json");

if (!existsSync(EXTRAIDO))
  throw new Error(
    `FALTA medidas/kb-extraido.json. Corre antes \`npm run cms:extractor-kb\`.\n` +
      `  No se siembra desde el HTML congelado: el PASO 0 midió que miente en 55 de 210 anclas.`,
  );
const extraido = JSON.parse(readFileSync(EXTRAIDO, "utf8"));
if (extraido.problemas?.length)
  throw new Error(
    `kb-extraido.json trae ${extraido.problemas.length} problema(s) sin resolver. No se siembra un extracto que no cuadra.`,
  );

/* ── Los dos índices de media capturada, en orden de preferencia ─────────── */
const INDICES = [
  { indice: join(RAIZ, "media-corpus/fase-3/INDICE.json"), raiz: join(RAIZ, "media-corpus/fase-3") },
  { indice: join(RAIZ, "media-corpus/INDICE.json"), raiz: join(RAIZ, "media-corpus") },
];
const catalogoMedia = new Map(); // fichero relativo → ruta absoluta
for (const { indice, raiz } of INDICES) {
  if (!existsSync(indice)) continue;
  for (const rel of Object.keys(JSON.parse(readFileSync(indice, "utf8")).ficheros || {}))
    if (!catalogoMedia.has(rel)) catalogoMedia.set(rel, join(raiz, rel));
}

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA RUTA DEL ASSET EN EL CLON ES `/images/uploads/…`, NO `/wp-content/…`
 *
 * Corregido el 2026-08-10 (tanda 46.ª) **antes de servir nada**, y lo destapó
 * ir a construir la plantilla: la primera versión de este seed escribió
 * `rutaOrigen = /wp-content/uploads/…` —la ruta del ORIGINAL— y esa carpeta no
 * existe en `apps/web/public`. O sea **56 imágenes rotas en el HTML servido**,
 * sin un solo error en el seed ni en el build.
 *
 * La convención del clon estaba ya derivada y no se miró: de las 168 filas de
 * `media`, **112 llevan `/images/uploads/…`** —el grupo A, cuyo corpus pasó por
 * la reescritura de T3— y los ficheros viven en `apps/web/public/images/uploads`.
 * Es la misma ruta con otro prefijo, que es lo que T3 hace: *cortar el
 * acoplamiento con el sistema de origen*.
 *
 * Así que este seed **copia el fichero capturado a `public/` si no está**, y
 * escribe la ruta del clon. 19 de las 56 ya estaban (las comparte con grupo A);
 * las 37 restantes las pone esta corrida.
 * ═════════════════════════════════════════════════════════════════════════ */
const PUBLICO_SUBIDAS = join(RAIZ, "apps/web/public/images/uploads");

/**
 * `https://kunakair.com/wp-content/uploads/2023/02/x-480x480.jpg` → el fichero
 * del clon. `origenDe` colapsa la variante `-WxH`, que es la misma regla con
 * la que se capturó (una definición, no dos).
 */
function ficheroDe(url) {
  const rel = String(url).split("/wp-content/uploads/")[1];
  if (!rel) throw new Error(`MEDIA con URL inesperada: ${url}`);
  for (const cand of [origenDe(rel), rel]) {
    const enPublico = join(PUBLICO_SUBIDAS, cand);
    if (existsSync(enPublico)) return { abs: enPublico, ruta: `/images/uploads/${cand}`, copiado: false };
    const capturado = catalogoMedia.get(cand);
    if (capturado && existsSync(capturado)) {
      mkdirSync(dirname(enPublico), { recursive: true });
      copyFileSync(capturado, enPublico);
      return { abs: enPublico, ruta: `/images/uploads/${cand}`, copiado: true };
    }
  }
  throw new Error(
    `MEDIA AUSENTE: ${url} no está ni en apps/web/public/images/uploads ni en media-corpus.\n` +
      `  No se sustituye por nada: un alta vacía convierte «falta el fichero» en\n` +
      `  «la imagen es opcional», y el Δ0 lo paga después. Corre \`npm run cms:captura-f3-media\`.`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * ARRANQUE — con `sharp`, o los `imageSizes` son inertes (lección de D4)
 * ═════════════════════════════════════════════════════════════════════════ */
const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const sharp = (await import("sharp")).default;
const payload = await getPayload({ config: await construyeConfig({ extra: { sharp } }) });

const previas = await payload.count({ collection: "articulos-kb" });
if (previas.totalDocs)
  throw new Error(
    `articulos-kb ya tiene ${previas.totalDocs} documento(s). El seed exige la colección VACÍA:\n` +
      `  una siembra que depende del estado anterior no es mecánica, y sus ids son claves\n` +
      `  foráneas de todo lo demás (§F2-2). Vacíala antes o corre \`npm run cms:reset\`.`,
  );

/* ── media: se sube una vez por origen, y el mapa ES la ida ──────────────── */
const idsMedia = new Map();
let copiadas = 0;
async function media(url) {
  const { abs, ruta, copiado } = ficheroDe(url);
  if (idsMedia.has(ruta)) return idsMedia.get(ruta);
  const ya = await payload.find({ collection: "media", where: { rutaOrigen: { equals: ruta } }, limit: 1 });
  const id = ya.docs[0]?.id ?? (await payload.create({ collection: "media", filePath: abs, data: { rutaOrigen: ruta } })).id;
  if (copiado) copiadas++;
  idsMedia.set(ruta, id);
  return id;
}

/** Sustituye las URL de imagen por ids de `media`, en su sitio. */
async function conMedia(modulo) {
  const m = { ...modulo };
  if (m.blockType === "imagen-kb") m.src = await media(m.src);
  if (m.blockType === "blurb" && m.imagen) m.imagen = await media(m.imagen);
  if (m.blockType === "gallery")
    m.items = await Promise.all(m.items.map(async (it) => ({ ...it, imagen: await media(it.imagen) })));
  return m;
}

const ev = new Evaluadas({ unidad: "artículos", minimo: extraido.articulos.length, nombre: "seed-kb" });

console.log(`\n════════ SEED · articulos-kb (F3-1 PASO 2) ════════`);
console.log(`  fuente: medidas/kb-extraido.json — derivado de las medidas, no del HTML`);
console.log(`  media : media-corpus/fase-3 (${catalogoMedia.size} ficheros capturados)\n`);

let filas = 0;
let modulos = 0;
for (const a of extraido.articulos) {
  const cuerpo = [];
  for (const f of a.cuerpo) {
    const columnas = [];
    for (const c of f.columnas) columnas.push({ ...c, modulos: await Promise.all(c.modulos.map(conMedia)) });
    cuerpo.push({ ...f, columnas });
    filas++;
    modulos += columnas.reduce((n, c) => n + c.modulos.length, 0);
  }
  await payload.create({ collection: "articulos-kb", data: { ...a, cuerpo } });
  ev.ok();
  console.log(`  ✓ ${a.slug.padEnd(58)} ${a.cuerpo.length} filas`);
}

console.log(
  `\n✅ seed-kb: ${extraido.articulos.length} artículos · ${filas} filas · ${modulos} módulos · ${idsMedia.size} imágenes.\n`,
);
console.log(`  ✓ evaluadas ${ev.n}/${extraido.articulos.length} artículos · seed-kb`);
process.exit(0);
