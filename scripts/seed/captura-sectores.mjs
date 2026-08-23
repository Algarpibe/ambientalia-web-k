/**
 * EL HUECO QUE NADIE HABÍA MIRADO: los cuerpos de SECTOR y MONOGRÁFICO.
 * Uso: npm run cms:captura-sectores        (SOLO_DERIVA=1 → deriva y no pide nada)
 *
 * ── Por qué esta captura existe, y por qué no estaba hecha ─────────────────
 * `corpus/INDICE.json` (309 páginas) los deja fuera **a propósito**, y su razón
 * está escrita en `meta.fuera`:
 *
 *   > `sectores`: "CONSTRUIDA completa: el cuerpo es dato tipado transcrito
 *   >              (SectorPage), no blob de WordPress"
 *   > `monograficos`: "CONSTRUIDA completa: ídem (MonoModulo/MonoInline, §3.1d)"
 *
 * Esa razón es correcta **para lo que la captura de F2-2 tenía que contestar**
 * —¿de dónde saco el dato para sembrar?— porque el dato ya estaba transcrito en
 * `apps/web/src/lib`. Y es **exactamente la que produce el hueco** para la
 * pregunta de F3-1: *¿sobre qué población se derivó `MODULO_TEXTO`?*
 *
 * > **No se puede auditar una transcripción contra sí misma.** El tipo
 * > compartido (`BLOQUES_TEXTO` + `inline` = párrafo y negrita) se calibró sobre
 * > `MonoModulo`/`MonoInline`, que son **lo transcrito**. Preguntarle a lo
 * > transcrito si le falta algo devuelve siempre que no: lo que no se transcribió
 * > no está ahí para contarlo. La pregunta sólo la contesta **el original**, y el
 * > original de estas 8 páginas no estaba congelado en ningún sitio del repo
 * > (derivado: 0 en `corpus/INDICE.json`, 0 en `corpus/fase-3/INDICE.json`).
 *
 * O sea que la captura de F3-0 dejó **el original fuera del camino crítico para
 * construir** —y es cierto— pero seguía **dentro** del camino crítico para
 * AUDITAR una decisión de modelo. Esto cierra ese hueco, y lo cierra en bytes:
 * la próxima vez que alguien discuta el tipo del módulo de texto, la evidencia
 * está en disco.
 *
 * ── La lista se DERIVA de un congelado (regla 9) ───────────────────────────
 * De `corpus/fase-3/listados/sectores/index.html`, que la campaña de F3-0 ya
 * congeló: los `href` a `/es/sectores/<slug>/` del listado del original. **Ocho**,
 * que son los 8 del original — los 6 SECTOR y los 2 MONOGRÁFICO. No se escribe a
 * mano ni se lee de `SECTORES_PUBLICADOS`: el clon publica 4 de 8, así que
 * derivarla del clon capturaría **la mitad** y el informe diría «8/8» de una
 * población recortada.
 *
 * ── La etiqueta, la misma de las dos campañas anteriores ───────────────────
 * UNA petición por página · SECUENCIAL · 500 ms · sha256 de los bytes · «una vez
 * por página» ENTRE corridas. Denominador propio: `corpus/fase-3-sectores/`, con
 * su índice. **No mueve los 309 ni los 272**, que hay actas citando.
 *
 * ── Guardas ────────────────────────────────────────────────────────────────
 * 1 · **LISTA CORTA** — si la derivación da menos de 8, TIRA: la población es lo
 *     único que esta captura aporta, y una población recortada da un veredicto
 *     recortado con la misma cara (regla 4, el cero que no es cero);
 * 2 · **COLISIÓN** — dos URLs no pueden caer en el mismo fichero;
 * 3 · **`Evaluadas`** con el mínimo derivado del tamaño de la lista;
 * 4 · **`gritaSiRevienta`** — una muerte temprana no puede salir en verde.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1"; // sólo pega al original: un build del clon no contamina
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const BASE = join(CORPUS, "fase-3-sectores");
const INDICE = join(BASE, "INDICE.json");
const LISTADO = join(CORPUS, "fase-3/listados/sectores/index.html");
const ORIGEN = "https://kunakair.com";
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const ESPACIADO_MS = 500;
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;
/** Sabotajes del test en negativo. Cada uno tiene que morder por SU guarda. */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = ["lista-corta", "colision", "cero-evaluadas"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — su guarda DEBE morder.\n`);

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════ 1 · LA LISTA, DERIVADA DEL CONGELADO ═══════════════════ */
if (!existsSync(LISTADO))
  throw new Error(
    `no existe ${LISTADO}.\n` +
      `  La lista de esta captura se DERIVA del listado congelado por F3-0, no se escribe\n` +
      `  a mano. Sin él no hay población, y una población inventada no vale para auditar\n` +
      `  un tipo. Corre antes 'npm run cms:captura-f3'.`,
  );

const htmlListado = readFileSync(LISTADO, "utf8");
const URLS = [
  ...new Set(
    [...htmlListado.matchAll(/href="(https:\/\/kunakair\.com\/es\/sectores\/[^"#?]+)"/g)]
      .map((m) => (m[1].endsWith("/") ? m[1] : `${m[1]}/`))
      .filter((u) => u !== `${ORIGEN}/es/sectores/`),
  ),
].sort();

/** Los 8 del original. El número no es decorativo: es la población entera. */
const ESPERADAS = 8;
const lista = SABOTAJE === "lista-corta" ? URLS.slice(0, 3) : URLS;
if (lista.length < ESPERADAS)
  throw new Error(
    `la derivación da ${lista.length} páginas de /es/sectores/ y el original tiene ${ESPERADAS}.\n` +
      `  Una población recortada produce un veredicto recortado con la misma cara que uno\n` +
      `  completo: si sólo se capturan los sectores y no los monográficos, «ninguna trae\n` +
      `  <sub>» puede ser cierto de la muestra y falso del original.\n` +
      `  Derivadas: ${URLS.map((u) => u.replace(`${ORIGEN}/es/sectores/`, "")).join(" · ") || "(ninguna)"}`,
  );

/** El fichero de cada URL, y la guarda de colisión. */
const ficheroDe = (u) => {
  const slug = new URL(u).pathname.replace(/^\/es\/sectores\//, "").replace(/\/$/, "");
  return SABOTAJE === "colision" ? "colision.html" : `${slug}.html`;
};
const porFichero = new Map();
for (const u of lista) {
  const f = ficheroDe(u);
  if (porFichero.has(f))
    throw new Error(`COLISIÓN: '${porFichero.get(f)}' y '${u}' caen los dos en ${f}`);
  porFichero.set(f, u);
}

console.log(`\n═══ CAPTURA · los cuerpos de SECTOR y MONOGRÁFICO ═══`);
console.log(`  derivadas de  corpus/fase-3/listados/sectores/index.html (congelado F3-0)`);
console.log(`  páginas       ${lista.length}\n`);
if (SOLO_DERIVA) {
  for (const u of lista) console.log(`  · ${u}`);
  console.log(`\n  SOLO_DERIVA=1 — no se ha pedido nada al original.`);
  process.exit(0);
}

/* ══════════════════════════ 2 · LA CAMPAÑA ══════════════════════════════════ */
/* ⚠ El mínimo se deriva de la LISTA y **no lo toca ningún sabotaje** — es lo
 * que hace que `cero-evaluadas` pueda morder. Aquí vivía un ternario cuyas dos
 * ramas eran `lista.length`, o sea que no hacía nada y **leía como si el
 * sabotaje moviera la portería** (§regla 17). Se quita: lo que el sabotaje anula
 * es el `ev.ok()`, y el mínimo tiene que quedarse quieto para acusarlo. */
const ev = new Evaluadas({ nombre: "captura-sectores", unidad: "páginas", minimo: lista.length });

const indice = existsSync(INDICE)
  ? JSON.parse(readFileSync(INDICE, "utf8"))
  : { meta: {}, resumen: {}, paginas: {} };

let bajadas = 0,
  reusadas = 0,
  fallos = 0,
  bytes = 0;

for (const url of lista) {
  const rel = join("fase-3-sectores", ficheroDe(url));
  const destino = join(CORPUS, rel);
  const slug = ficheroDe(url).replace(/\.html$/, "");

  if (existsSync(destino)) {
    /* «Una vez por página» ENTRE corridas: una corrida interrumpida se reanuda
     * sin volver a pegarle al original. */
    const buf = readFileSync(destino);
    indice.paginas[url] = { ...(indice.paginas[url] ?? {}), fichero: rel.replace(/\\/g, "/"), bytes: buf.length, sha256: sha(buf), http: indice.paginas[url]?.http ?? 200 };
    reusadas++;
    bytes += buf.length;
    if (SABOTAJE !== "cero-evaluadas") ev.ok();
    console.log(`  ↺ ${slug.padEnd(52)} ${String(buf.length).padStart(8)} B  (en disco)`);
    continue;
  }

  let r = null,
    error = null;
  for (let intento = 1; intento <= 2 && !r; intento++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(90_000) });
      r = { buf: Buffer.from(await res.arrayBuffer()), http: res.status, location: res.headers.get("location") ?? null };
    } catch (e) {
      error = String(e.message ?? e).slice(0, 120);
      if (intento < 2) await dormir(2000);
    }
  }
  if (!r || r.http !== 200) {
    fallos++;
    indice.paginas[url] = { http: r?.http ?? null, error: error ?? null, location: r?.location ?? null };
    console.log(`  ✗ ${slug.padEnd(52)} http ${r?.http ?? "—"}  ${error ?? ""}`);
    await dormir(ESPACIADO_MS);
    continue;
  }

  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, r.buf);
  indice.paginas[url] = { fichero: rel.replace(/\\/g, "/"), bytes: r.buf.length, sha256: sha(r.buf), http: 200 };
  bajadas++;
  bytes += r.buf.length;
  if (SABOTAJE !== "cero-evaluadas") ev.ok();
  console.log(`  ✓ ${slug.padEnd(52)} ${String(r.buf.length).padStart(8)} B`);
  await dormir(ESPACIADO_MS);
}

indice.meta = {
  fecha: hoy(),
  que: "Los 8 cuerpos de /es/sectores/ del ORIGINAL — los 6 SECTOR y los 2 MONOGRÁFICO.",
  porQue:
    "corpus/INDICE.json los deja fuera con la razón «CONSTRUIDA completa: el cuerpo es dato tipado transcrito». " +
    "Correcto para sembrar y falso para AUDITAR: el tipo compartido MODULO_TEXTO se calibró sobre esa transcripción, " +
    "y una transcripción no se puede auditar contra sí misma. Esta es su población de verdad.",
  denominadorPropio:
    "NO toca los congelados: corpus/INDICE.json sigue en 309 y corpus/fase-3/INDICE.json en 272.",
  fuente: "HTML crudo servido por kunakair.com (bytes sin re-codificar)",
  derivacion: "href de corpus/fase-3/listados/sectores/index.html (congelado F3-0)",
  etiqueta: "secuencial · 500 ms entre peticiones · una vez por página (entre corridas) · redirect manual",
};
indice.resumen = { paginas: Object.keys(indice.paginas).length, bytes, bajadas, reusadas, fallos };

/* ⚠ §regla 24, mitad de higiene: **la campaña desvía sus propios sabotajes.**
 * Ésta no congela por `w()` —escribe en `corpus/`, que ninguna guarda vigila—,
 * así que una corrida saboteada reescribiría el índice REAL con su fecha de hoy
 * y su recuento saboteado: un fichero con nombre de artefacto bueno y contenido
 * de sabotaje (§regla 7). El desvío no puede depender de que quien la lanza se
 * acuerde de nada, y se marca además DENTRO del JSON. */
const SALIDA = SABOTAJE ? join(BASE, `INDICE-neg-${SABOTAJE}.json`) : INDICE;
if (SABOTAJE) {
  indice.meta.sabotaje = SABOTAJE;
  console.log(`\n  ⚠ SABOTAJE activo: el índice se desvía a \`${SALIDA.slice(RAIZ.length + 1)}\` — el real NO se toca.`);
}
mkdirSync(BASE, { recursive: true });
writeFileSync(SALIDA, `${JSON.stringify(indice, null, 2)}\n`);

console.log(`\n  bajadas ${bajadas} · reusadas ${reusadas} · fallos ${fallos} · ${(bytes / 1e6).toFixed(1)} MB`);
console.log(`  índice   ${SALIDA.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);

process.exit(ev.informe() + (fallos ? 1 : 0) === 0 ? 0 : 1);
