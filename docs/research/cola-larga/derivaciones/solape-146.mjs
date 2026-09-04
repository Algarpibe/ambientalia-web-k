/**
 * 146.ª ESCALÓN 2 · P1 — EL SOLAPE `apps/web/public` ↔ `media/`, POR HASH.
 *
 * Criterio de identidad pre-registrado: **SHA-256 del CONTENIDO**, sobre los
 * bytes del DISCO —que es lo que Docker copia— y no sobre el blob de git.
 *
 * ⚠ LOS DOS TESTIGOS VAN PRIMERO Y CIERRAN EL CÓDIGO DE SALIDA (§regla 28c,
 * §regla 28d por la polaridad). Un comparador roto da 0 solape y eso se lee
 * como un dato del repo, no como una avería:
 *
 *   · POSITIVO — un fichero DERIVADO que tiene que salir DENTRO. Si no está,
 *     el comparador no sabe encontrar lo que sí está;
 *   · NEGATIVO — un `.woff2` de `public/fonts/`, que no es un upload de
 *     Payload y no puede estar en `media/`. Si sale dentro, casa de más.
 *
 * Con uno solo no basta: un comparador que dijera «todo solapa» pasaría el
 * positivo, y uno que dijera «nada solapa» pasaría el negativo.
 *
 * Y se publican LOS DOS LADOS del emparejamiento, nunca su resta
 * (§*un cardinal es un contenedor y absorbe la membresía*).
 *
 * Uso:  node docs/research/cola-larga/derivaciones/solape-146.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "solape-146.json");

const PUB = path.join(RAIZ, "apps/web/public");
const MED = path.join(RAIZ, "media");
const MB = (b) => Number((b / 1048576).toFixed(2));

/* ── el sabotaje declarado, para que el negativo pueda anular el arreglo
 * ENTERO y no media hipótesis (§regla 17 segunda cara) ─────────────────── */
const SABOTAJE = process.env.SABOTAJE_SOLAPE || "";
if (SABOTAJE) console.error(`⚠⚠ SABOTAJE_SOLAPE=${SABOTAJE}: esta corrida está ROTA A PROPÓSITO`);

function recorre(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...recorre(p, base));
    else if (e.isFile())
      out.push({
        abs: p,
        rel: path.relative(base, p).replace(/\\/g, "/"),
        base: e.name,
        bytes: fs.statSync(p).size,
      });
  }
  return out;
}

function sha(abs) {
  /* streaming, no readFileSync: hay ficheros de cientos de MB y cargarlos
   * enteros en memoria mata la corrida con un OOM que se lee como «la sonda
   * murió», no como «no cabía». */
  const h = crypto.createHash("sha256");
  const fd = fs.openSync(abs, "r");
  try {
    const buf = Buffer.alloc(1 << 20);
    let n;
    while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  } finally {
    fs.closeSync(fd);
  }
  return h.digest("hex");
}

console.log("═══ 146.ª ESCALÓN 2 · P1 — SOLAPE public/ ↔ media/ POR HASH ═══\n");

const pub = recorre(PUB);
const med = recorre(MED);
console.log(`  public/ ${pub.length} ficheros · ${MB(pub.reduce((s, f) => s + f.bytes, 0))} MiB`);
console.log(`  media/  ${med.length} ficheros · ${MB(med.reduce((s, f) => s + f.bytes, 0))} MiB`);

/* ── LOS TESTIGOS, ELEGIDOS ANTES DE HASHEAR ──────────────────────────────
 * El positivo se DERIVA (§regla 9: no se escribe a mano) buscando el primer
 * fichero de media/ cuyo basename Y tamaño existan también bajo
 * public/images/uploads/. Si no hay ninguno, eso YA es el resultado y hay
 * que decirlo: significa que el solape es 0 por construcción y el testigo
 * positivo no existe. */
const porBaseTam = new Map();
for (const f of pub) porBaseTam.set(`${f.base}|${f.bytes}`, f);

const testigoPositivo =
  med.find((f) => {
    const c = porBaseTam.get(`${f.base}|${f.bytes}`);
    return c && c.rel.startsWith("images/uploads/");
  }) ?? null;

const testigoNegativo = pub.find((f) => f.rel.startsWith("fonts/") && f.base.endsWith(".woff2")) ?? null;

console.log(`\n── TESTIGOS (§regla 28d, uno por polaridad) ──`);
console.log(`  POSITIVO (debe salir DENTRO): ${testigoPositivo ? testigoPositivo.rel : "(no derivable)"}`);
console.log(`  NEGATIVO (debe salir FUERA):  ${testigoNegativo ? testigoNegativo.rel : "(no derivable)"}`);

/* ── el hashing ───────────────────────────────────────────────────────────*/
console.log(`\n  hasheando ${pub.length + med.length} ficheros…`);
const t0 = Date.now();

/* SABOTAJE `hash-por-nombre`: sustituye el digest del contenido por el
 * basename. Anula el criterio de identidad ENTERO —que es lo que el arreglo
 * afirma— en vez de media hipótesis. */
const digest = (f) => (SABOTAJE === "hash-por-nombre" ? f.base : sha(f.abs));

const hashMedia = new Map(); // digest -> [rel…]
for (const f of med) {
  const d = digest(f);
  if (!hashMedia.has(d)) hashMedia.set(d, []);
  hashMedia.get(d).push(f.rel);
}

const hashPub = new Map();
for (const f of pub) {
  const d = digest(f);
  if (!hashPub.has(d)) hashPub.set(d, []);
  hashPub.get(d).push(f.rel);
}

const conHash = pub.map((f) => ({ ...f, sha: digest(f) }));
const segundos = Number(((Date.now() - t0) / 1000).toFixed(1));
console.log(`  hecho en ${segundos}s`);

/* ── los DOS lados, nunca la resta ────────────────────────────────────────*/
const enAmbos = conHash.filter((f) => hashMedia.has(f.sha));
const soloPublic = conHash.filter((f) => !hashMedia.has(f.sha));
const soloMedia = med.filter((f) => !hashPub.has(digest(f)));

/* ── ¿el comparador funcionó? ─────────────────────────────────────────────*/
const positivoDentro = testigoPositivo
  ? enAmbos.some((f) => f.base === testigoPositivo.base && f.bytes === testigoPositivo.bytes)
  : null;
const negativoFuera = testigoNegativo ? !enAmbos.some((f) => f.rel === testigoNegativo.rel) : null;
const testigosOk = positivoDentro === true && negativoFuera === true;

console.log(`\n── VEREDICTO DE LOS TESTIGOS ──`);
console.log(`  positivo DENTRO: ${positivoDentro === true ? "✓" : "✗"}`);
console.log(`  negativo FUERA:  ${negativoFuera === true ? "✓" : "✗"}`);
console.log(`  ${testigosOk ? "✓ el comparador discrimina — el número significa algo" : "✗ EL COMPARADOR NO DISCRIMINA — la corrida NO adjudica"}`);

/* ── el reparto del solape por subdirectorio de public/ ───────────────────*/
const cubo = (rel) => {
  const p = rel.split("/");
  return p.length >= 3 && p[0] === "images" ? `${p[0]}/${p[1]}` : p[0];
};
const porCubo = {};
for (const f of conHash) {
  const k = cubo(f.rel);
  porCubo[k] ??= { total: 0, bytesTotal: 0, solapan: 0, bytesSolapan: 0 };
  porCubo[k].total++;
  porCubo[k].bytesTotal += f.bytes;
  if (hashMedia.has(f.sha)) {
    porCubo[k].solapan++;
    porCubo[k].bytesSolapan += f.bytes;
  }
}

/* ── LA SEPARADORA PRE-REGISTRADA: mismo byte no es misma URL ─────────────
 * Un fichero que solapa sólo se puede mover al volumen si quien lo pide usa
 * la URL de `media/`. Se deriva del HTML emitido: ¿cuántas veces aparece
 * `/api/media/` frente a `/images/`? */
const DIRHTML = path.join(RAIZ, "apps/web/.next/server/app");
let urlsApiMedia = 0;
let urlsImages = 0;
let htmlLeidos = 0;
if (fs.existsSync(DIRHTML)) {
  for (const f of recorre(DIRHTML)) {
    if (!f.abs.endsWith(".html")) continue;
    htmlLeidos++;
    const t = fs.readFileSync(f.abs, "utf8");
    urlsApiMedia += (t.match(/\/api\/media\//g) || []).length;
    urlsImages += (t.match(/["'(\\]\/images\//g) || []).length;
  }
}

const informe = {
  meta: {
    tanda: "146.ª",
    escalon: "ESCALÓN 2 · P1",
    fecha: new Date().toISOString(),
    saboteada: SABOTAJE || null,
    acredita: testigosOk && !SABOTAJE,
    criterioDeIdentidad: "SHA-256 del contenido, sobre los bytes del DISCO",
    segundosHasheando: segundos,
  },

  testigos: {
    positivo: testigoPositivo ? { rel: testigoPositivo.rel, bytes: testigoPositivo.bytes } : null,
    negativo: testigoNegativo ? { rel: testigoNegativo.rel, bytes: testigoNegativo.bytes } : null,
    positivoDentro,
    negativoFuera,
    veredicto: testigosOk ? "DISCRIMINA" : "NO DISCRIMINA — la corrida no adjudica",
  },

  /* los dos lados, nombrados */
  cardinales: {
    publicTotal: { ficheros: pub.length, MiB: MB(pub.reduce((s, f) => s + f.bytes, 0)) },
    mediaTotal: { ficheros: med.length, MiB: MB(med.reduce((s, f) => s + f.bytes, 0)) },
    enAmbos: { ficheros: enAmbos.length, MiB: MB(enAmbos.reduce((s, f) => s + f.bytes, 0)) },
    soloEnPublic: { ficheros: soloPublic.length, MiB: MB(soloPublic.reduce((s, f) => s + f.bytes, 0)) },
    soloEnMedia: { ficheros: soloMedia.length, MiB: MB(soloMedia.reduce((s, f) => s + f.bytes, 0)) },
  },

  repartoDelSolapePorCubo: Object.entries(porCubo)
    .map(([c, v]) => ({
      cubo: c,
      ficheros: v.total,
      MiB: MB(v.bytesTotal),
      solapan: v.solapan,
      solapanMiB: MB(v.bytesSolapan),
      pctFicheros: Number(((100 * v.solapan) / v.total).toFixed(1)),
    }))
    .sort((a, b) => b.MiB - a.MiB),

  /* la separadora: ¿por qué URL los pide el HTML servido? */
  separadoraDeURL: {
    pregunta: "mismo byte no es misma URL — ¿por dónde los pide el HTML emitido?",
    htmlLeidos,
    ocurrenciasApiMedia: urlsApiMedia,
    ocurrenciasImages: urlsImages,
    lectura:
      urlsApiMedia === 0
        ? "el HTML NO pide NADA por /api/media/: el solape por hash no basta para mover un solo fichero al volumen sin cambiar además el canal del render"
        : "hay peticiones por los dos canales — hay que repartirlas antes de decidir",
  },

  /* muestra nombrada, no sólo el total */
  muestraEnAmbos: enAmbos.slice(0, 15).map((f) => ({ rel: f.rel, MiB: MB(f.bytes), enMedia: hashMedia.get(f.sha)[0] })),
  muestraSoloPublicPesados: [...soloPublic].sort((a, b) => b.bytes - a.bytes).slice(0, 15).map((f) => ({ rel: f.rel, MiB: MB(f.bytes) })),
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log(`\n── LOS DOS LADOS (nunca la resta) ──`);
console.log(`  en AMBOS:        ${informe.cardinales.enAmbos.ficheros} f · ${informe.cardinales.enAmbos.MiB} MiB`);
console.log(`  sólo en public/: ${informe.cardinales.soloEnPublic.ficheros} f · ${informe.cardinales.soloEnPublic.MiB} MiB`);
console.log(`  sólo en media/:  ${informe.cardinales.soloEnMedia.ficheros} f · ${informe.cardinales.soloEnMedia.MiB} MiB`);

console.log(`\n── REPARTO por subdirectorio de public/ ──`);
for (const r of informe.repartoDelSolapePorCubo)
  console.log(
    `  ${String(r.MiB).padStart(9)} MiB  ${String(r.ficheros).padStart(5)} f  ` +
      `solapan ${String(r.solapan).padStart(5)} (${String(r.pctFicheros).padStart(5)}%) = ${r.solapanMiB} MiB  ${r.cubo}`
  );

console.log(`\n── SEPARADORA: ¿por qué URL los pide el HTML? ──`);
console.log(`  ${htmlLeidos} HTML leídos · /api/media/ ×${urlsApiMedia} · /images/ ×${urlsImages}`);
console.log(`  ${informe.separadoraDeURL.lectura}`);

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);
if (!testigosOk) {
  console.error("\n✗ TESTIGOS EN ROJO: la corrida NO adjudica el solape.");
  process.exitCode = 2;
}
