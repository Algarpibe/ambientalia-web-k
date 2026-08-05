/**
 * EL EJE `existencia` — ¿EXISTE EL ARTEFACTO EN DISCO, Y MIDE LO QUE DICE?
 * Uso: npm run qa:artefacto           (SABOTAJE=… → test en negativo)
 *
 * ── El sitio ciego que este eje cubre, y por qué es UNO y no dos fichas ───
 * Dos hallazgos independientes en dos días cayeron exactamente en el mismo
 * hueco, y ninguna de las 65 sondas los vio:
 *
 *   · **23 imágenes que el clon SIRVE y no existen** (HTTP 404). Invisibles a
 *     `clon-base`, que mide `docH` · `h1.y` · secciones · enlaces: **una imagen
 *     rota no mueve ninguno de los cuatro**;
 *   · **`media/` con 112 ficheros y CERO variantes reales** — los `imageSizes`
 *     inertes por segunda vez. Invisible porque **ninguna sonda mira `media/`**.
 *
 * No son dos deudas: es **un eje**. Todo el instrumento mide **HTML SERVIDO**, y
 * la propiedad *«el fichero existe y mide lo que dice»* **no vive en el HTML**.
 * Es `CLAUDE.md` §La causa común —*se mide al nivel donde vive la propiedad*—
 * aplicada al **soporte** en vez de a la caja: el HTML puede estar perfecto al
 * píxel y referirse a un fichero que no está.
 *
 * ⚠ **Y el eje se llama `existencia`, no «imágenes»**: el mismo agujero cubre
 * `<img>`, `srcset`, `<source>`, `<video>`, los PDF de `/recursos` y las
 * fuentes. Nombrarlo por el síntoma que se vio primero heredaría un alcance sin
 * elegirlo.
 *
 * ── Los TRES invariantes, cada uno sobre su árbol de artefactos ───────────
 *
 *   **A · SERVIDO** — lo que el clon referencia tiene que estar en
 *   `apps/web/public`. Fuente: las referencias congeladas de
 *   `media-poblaciones.json` (`solape` ∪ `soloServido`), no un barrido nuevo:
 *   así el eje es OFFLINE y reproducible.
 *
 *   **B · CAPTURA** — lo que `media-corpus/INDICE.json` declara tiene que
 *   existir **y su `sha256` tiene que casar**. Es lo que convierte la captura en
 *   línea base: un fichero que cambia bajo los pies no es una congelada.
 *
 *   **C · CMS** — por cada tamaño que la FICHA de la DB declara
 *   (`sizes_<n>_filename` + `width`/`height`), el fichero tiene que existir en
 *   `media/` **y medir exactamente eso**. Éste es el que habría cazado los
 *   `imageSizes` inertes el primer día.
 *
 *   **D · CUERPO TRANSFORMADO** (2026-08-05) — cada `data-media` que T3b y T4b
 *   escriben en el cuerpo tiene que resolver contra la captura. Es el invariante
 *   que la relación de media necesitaba para no ser una promesa: sin él,
 *   `data-media="2025/02/loquesea.pdf"` es una cadena que nadie comprueba.
 *
 * ── D · las tres salidas, y las tres DERIVADAS (nunca escritas a mano) ─────
 * La captura es una lista congelada de lo que se PIDIÓ (`media-regenera.json` ·
 * `listaACapturar`) y un índice de lo que LLEGÓ (`media-corpus/INDICE.json`, con
 * sus `errores`). Cruzando las dos, una referencia sólo puede caer en tres
 * sitios, y **cada uno significa algo distinto**:
 *
 * | caso | qué significa | ¿rojo? |
 * |---|---|---|
 * | está en el índice | resuelve — y B ya le comprueba el `sha256` | — |
 * | **se pidió y falló** (está en `listaACapturar`, con `errores`) | **§M-ORIGEN404**: el original ya no lo sirve. Ausencia permanente del ORIGEN, no captura incompleta | **no** |
 * | **nunca se pidió** y es un **PDF de T4b** | el mecanismo está medido: `listaACapturar` se derivó del **markup**, y la referencia de FB3D vive **sólo dentro del payload base64** — ningún barrido de markup podía verla (§M-PDF-FB3D) | **no** |
 * | cualquier otra ausencia | **defecto** | **sí** |
 *
 * ⚠ **Y la última fila es la que hace que esto sea una guarda y no una excusa.**
 * Las dos exenciones son **predicados**, no listas: «se pidió y el índice
 * registró su error» y «es un PDF que T4b sacó de un base64». Una imagen nueva
 * sin fichero **no cumple ninguno de los dos** y sale roja — que es exactamente
 * la diferencia entre *«404 conocido en el origen»* y *«404 nuevo»* que este eje
 * tiene que saber distinguir.
 *
 * ── La deuda conocida NO pone el eje en rojo, y eso es deliberado ─────────
 * Las 23 de §M-404 son **deuda del clon fichada** (`apps/web` paga Δ0 y es otra
 * tanda). Van en una **lista derivada de la congelada**, y el eje sale ROJO en
 * cuanto aparezca **una nueva**. *Un rojo permanente por deuda ajena es cómo se
 * consigue que nadie lea los rojos* — y una lista escrita a mano sería peor:
 * envejece contra el repo (regla 9). Se deriva.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { Evaluadas, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const RAIZ = join(QA, "../..");
const PUBLIC = join(RAIZ, "apps/web/public");
const MEDIA = join(RAIZ, "media");
const CAPTURA = join(RAIZ, "media-corpus");

const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "fichero-ausente": "se inventa una referencia servida que NO está en disco y NO está fichada → invariante A",
  "sha-cambiado": "se falsea el sha256 de un fichero capturado → invariante B (una congelada que cambia no es congelada)",
  "dimension-distinta": "la ficha del CMS declara una dimensión que el fichero no tiene → invariante C",
  "variante-no-generada": "la ficha declara un tamaño cuyo fichero no está → invariante C, el defecto de los `imageSizes` inertes",
  "media-inventada": "el cuerpo transformado declara un `data-media` que no se pidió y NO es un PDF de T4b → invariante D, el «404 nuevo»",
  "sin-fuente": "las listas congeladas se vacían → 0 unidades, y «nada roto» sería la regla del cero",
  control: "ningún sabotaje: sólo la deuda FICHADA, y el eje no sale rojo por ella",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const ES_IMAGEN = /\.(jpe?g|png|webp|gif|avif|tiff?)$/i;

/* ══ A · lo que el clon SIRVE tiene que existir ══════════════════════════ */
const pob = JSON.parse(readFileSync(join(QA, "medidas", "media-poblaciones.json"), "utf8"));
let servidas = [...(pob.listas.solape ?? []), ...(pob.listas.soloServido ?? [])];
/** La deuda FICHADA (§M-404), DERIVADA de la congelada — nunca escrita a mano. */
const FICHADAS = new Set(pob.servida?.sinFicheroEnDisco ?? []);
if (SABOTAJE === "sin-fuente") servidas = [];
if (SABOTAJE === "fichero-ausente") servidas = [...servidas, "/images/uploads/2099/01/no-existe-y-no-esta-fichada.jpg"];

const faltanServidas = [], faltanFichadas = [];
for (const ref of servidas) {
  if (!ref.startsWith("/images/")) continue;
  if (!existsSync(join(PUBLIC, ref.replace(/^\//, "")))) (FICHADAS.has(ref) ? faltanFichadas : faltanServidas).push(ref);
}

/* ══ B · la CAPTURA tiene que existir y casar su sha256 ══════════════════ */
const hayCaptura = existsSync(join(CAPTURA, "INDICE.json"));
const idx = hayCaptura ? JSON.parse(readFileSync(join(CAPTURA, "INDICE.json"), "utf8")) : { ficheros: {} };
let entradas = Object.entries(idx.ficheros ?? {});
if (SABOTAJE === "sin-fuente") entradas = [];
const capturaAusente = [], capturaCambiada = [];
let nCaptura = 0;
for (const [clave, f] of entradas) {
  const p = join(CAPTURA, f.fichero);
  if (!existsSync(p)) { capturaAusente.push(clave); continue; }
  nCaptura++;
  const real = sha(p);
  const declarado = SABOTAJE === "sha-cambiado" && capturaCambiada.length === 0 && nCaptura === 1 ? "0".repeat(64) : f.sha256;
  if (real !== declarado) capturaCambiada.push({ clave, declarado, real });
}

/* ══ C · la FICHA del CMS contra el fichero en disco ═════════════════════ */
const enMedia = existsSync(MEDIA) ? new Set(readdirSync(MEDIA)) : new Set();
/** La ficha: `media/*.json` no existe, así que se deriva de la DB por psql. */
let fichas = [];
try {
  const { execFileSync } = await import("node:child_process");
  const cols = execFileSync("docker", [
    "exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-tAF", "\t", "-c",
    "select column_name from information_schema.columns where table_name='media' and column_name like 'sizes\\_%\\_filename' order by 1;",
  ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const nombres = cols.map((c) => c.replace(/^sizes_/, "").replace(/_filename$/, ""));
  const sel = ["filename", ...nombres.flatMap((n) => [`sizes_${n}_filename`, `sizes_${n}_width`, `sizes_${n}_height`])].join(", ");
  const filas = execFileSync("docker", [
    "exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-tAF", "\t", "-c", `select ${sel} from media order by id;`,
  ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  for (const linea of filas) {
    const c = linea.split("\t");
    const original = c[0];
    nombres.forEach((n, i) => {
      const fn = c[1 + i * 3], wd = c[2 + i * 3], ht = c[3 + i * 3];
      if (!fn || fn === "") return;
      fichas.push({ original, tamano: n, fichero: fn, width: Number(wd), height: Number(ht) });
    });
  }
} catch (e) {
  fichas = [];
  console.log(`  ⚠ la DB no respondió (${String(e.message).split("\n")[0].slice(0, 70)}): el invariante C no se puede evaluar.`);
}
if (SABOTAJE === "sin-fuente") fichas = [];
if (SABOTAJE === "dimension-distinta" && fichas.length) fichas = [{ ...fichas[0], width: fichas[0].width + 7 }, ...fichas.slice(1)];
if (SABOTAJE === "variante-no-generada" && fichas.length) fichas = [{ ...fichas[0], fichero: "no-generada-jamas-12x12.jpg" }, ...fichas.slice(1)];

const varianteAusente = [], dimensionDistinta = [];
for (const f of fichas) {
  if (!enMedia.has(f.fichero)) { varianteAusente.push(f); continue; }
  if (!ES_IMAGEN.test(f.fichero)) continue;
  const m = await sharp(join(MEDIA, f.fichero)).metadata();
  if (m.width !== f.width || m.height !== f.height)
    dimensionDistinta.push({ ...f, real: `${m.width}x${m.height}`, declarado: `${f.width}x${f.height}` });
}

/* ══ D · el CUERPO TRANSFORMADO contra la captura ════════════════════════ */
const fExtractor = join(QA, "medidas", "extractor-corpus.json");
if (!existsSync(fExtractor))
  throw new Error(
    "no hay `medidas/extractor-corpus.json`: sin él el invariante D no tiene referencias que comprobar,\n" +
      "  y 0 referencias darían un verde que no miró nada (la regla del cero). Corre `npm run cms:extractor`.",
  );
const extractor = JSON.parse(readFileSync(fExtractor, "utf8"));
if (!extractor.mediaDelCuerpo)
  throw new Error(
    "`extractor-corpus.json` es de ANTES de T3b/T4b (sin `mediaDelCuerpo`). Una congelada rancia leída como\n" +
      "  actual daría «0 referencias, todo bien»: se para aquí. Re-congela con `PISAR=1 npm run cms:extractor`.",
  );

/** Lo que la captura PIDIÓ, congelado la tanda anterior — el alcance de la lista. */
const regenera = JSON.parse(readFileSync(join(QA, "medidas", "media-regenera.json"), "utf8"));
const PREFIJO = "https://kunakair.com/wp-content/uploads/";
const pedidas = new Set((regenera.listaACapturar ?? []).map((u) => decodeURIComponent(u.replace(PREFIJO, ""))));
/**
 * ⚠ **La media del corpus vive en DOS árboles, y mirar sólo uno da 51 falsos
 * positivos.** `media-regenera` derivó `listaACapturar` **restando lo que ya
 * estaba local** (`faltanCuerpo = origCuerpo − local`): de los 600 orígenes del
 * cuerpo, **63 ya los tenía el clon** en `apps/web/public/images/uploads` y por
 * eso no se volvieron a pedir. Un invariante que sólo mirase `media-corpus/`
 * leería esos 63 como ausentes — y es exactamente lo que hizo la primera
 * versión: **51 «404 nuevos» que están todos en disco.**
 */
const RAIZ_SUBIDAS = join(PUBLIC, "images/uploads");
const yaLocales = new Set();
(function anda(d, rel = "") {
  if (!existsSync(d)) return;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) anda(join(d, e.name), rel ? `${rel}/${e.name}` : e.name);
    else yaLocales.add(rel ? `${rel}/${e.name}` : e.name);
  }
})(RAIZ_SUBIDAS);
/** Lo que se pidió y NO llegó, con su error — §M-ORIGEN404, derivado del índice. */
const fallaronEnOrigen = new Set(
  (idx.errores ?? []).map((e) => decodeURIComponent(String(e.url ?? "").replace(PREFIJO, ""))),
);
/** Las que T4b sacó de un payload base64: markup no las podía ver (§M-PDF-FB3D). */
const deT4b = new Set((extractor.mediaDelCuerpo.detalle ?? []).filter((m) => m.via === "t4b").map((m) => m.clave));

let referidas = extractor.mediaDelCuerpo.documentos ?? [];
if (SABOTAJE === "sin-fuente") referidas = [];
if (SABOTAJE === "media-inventada") referidas = [...referidas, "2099/01/esta-referencia-no-se-pidio-jamas.jpg"];

const cuerpoOk = [], cuerpoLocal = [], cuerpo404Origen = [], cuerpoNuncaPedida = [], cuerpoNueva = [];
for (const clave of referidas) {
  if (idx.ficheros?.[clave]) { cuerpoOk.push(clave); continue; }
  if (yaLocales.has(clave)) { cuerpoLocal.push(clave); continue; }
  if (fallaronEnOrigen.has(clave)) { cuerpo404Origen.push(clave); continue; }
  if (!pedidas.has(clave) && deT4b.has(clave) && /\.pdf$/i.test(clave)) { cuerpoNuncaPedida.push(clave); continue; }
  cuerpoNueva.push(clave);
}

/* ══ INFORME ════════════════════════════════════════════════════════════ */
/* El mínimo se DERIVA de las fuentes congeladas —no se escribe—: las
 * referencias servidas y las entradas de la captura se conocen ANTES de mirar
 * un solo fichero. `fichas` NO entra en el mínimo: sale de la DB, y una DB
 * apagada no puede convertirse en «el código está mal» (el mismo criterio por
 * el que `qa:cms-slugs` está fuera de `check`). Un mínimo puesto sobre el
 * RESULTADO no puede detectar que el instrumento no miró. */
const MINIMO = servidas.length + entradas.length + referidas.length;
const unidades = servidas.length + entradas.length + fichas.length + referidas.length;
const ev = new Evaluadas({
  unidad: "artefactos (servidos + capturados + fichas del CMS)",
  minimo: Math.max(1, MINIMO),
  nombre: "artefacto",
});
for (let i = 0; i < unidades; i++) ev.ok();

console.log(`\n═══ EJE \`existencia\` — EL ARTEFACTO EN DISCO ═══\n`);
console.log(`── A · lo que el clon SIRVE existe en apps/web/public ──────────────`);
console.log(`  referencias servidas ....... ${String(servidas.length).padStart(5)}`);
console.log(`  ausentes FICHADAS (§M-404) . ${String(faltanFichadas.length).padStart(5)}  ← deuda conocida: NO pone el eje en rojo`);
console.log(`  ausentes NUEVAS ............ ${String(faltanServidas.length).padStart(5)}`);
for (const r of faltanServidas.slice(0, 8)) console.log(`     ✗ ${r}`);

console.log(`\n── B · la CAPTURA existe y su sha256 casa ──────────────────────────`);
if (!hayCaptura) console.log(`  (no hay media-corpus/INDICE.json todavía)`);
console.log(`  ficheros declarados ........ ${String(entradas.length).padStart(5)}`);
console.log(`  ausentes ................... ${String(capturaAusente.length).padStart(5)}`);
console.log(`  sha256 que NO casa ......... ${String(capturaCambiada.length).padStart(5)}`);
for (const c of capturaCambiada.slice(0, 5)) console.log(`     ✗ ${c.clave}`);

console.log(`\n── C · la FICHA del CMS contra el fichero ──────────────────────────`);
console.log(`  tamaños declarados ......... ${String(fichas.length).padStart(5)}`);
console.log(`  variante NO generada ....... ${String(varianteAusente.length).padStart(5)}`);
for (const v of varianteAusente.slice(0, 6)) console.log(`     ✗ ${v.original} · ${v.tamano} → ${v.fichero}`);
console.log(`  dimensión ≠ la de su ficha . ${String(dimensionDistinta.length).padStart(5)}`);
for (const d of dimensionDistinta.slice(0, 6)) console.log(`     ✗ ${d.fichero}  ficha ${d.declarado} · real ${d.real}`);

console.log(`\n── D · el \`data-media\` del CUERPO TRANSFORMADO resuelve ────────────`);
console.log(`  documentos referidos ....... ${String(referidas.length).padStart(5)}  (T3b + T4b)`);
console.log(`  resuelven en media-corpus .. ${String(cuerpoOk.length).padStart(5)}`);
console.log(`  resuelven ya locales ....... ${String(cuerpoLocal.length).padStart(5)}  ← los que la captura NO pidió porque el clon ya los tenía`);
console.log(`  §M-ORIGEN404 (404 en origen) ${String(cuerpo404Origen.length).padStart(5)}  ← se pidió y el original ya no lo sirve: NO pone el eje en rojo`);
for (const c of cuerpo404Origen) console.log(`     · ${c}`);
console.log(`  §M-PDF-FB3D (nunca pedida) . ${String(cuerpoNuncaPedida.length).padStart(5)}  ← la lista se derivó del MARKUP y el PDF vive en base64`);
for (const c of cuerpoNuncaPedida) console.log(`     · ${c}`);
console.log(`  ausencias NUEVAS ........... ${String(cuerpoNueva.length).padStart(5)}`);
for (const c of cuerpoNueva.slice(0, 8)) console.log(`     ✗ ${c}`);

w("medidas/artefacto.json", {
  meta: {
    fecha: new Date(pob.meta?.fecha ?? Date.now()).toISOString().slice(0, 10),
    eje: "existencia — el artefacto EN DISCO, no el HTML servido",
    fuentes: "media-poblaciones.json (referencias servidas, congeladas) · media-corpus/INDICE.json · la DB (ficha de tamaños)",
    deudaFichada: "las ausentes de §M-404 se derivan de la congelada y NO ponen el eje en rojo; una NUEVA sí",
    sabotaje: SABOTAJE,
  },
  servido: { referencias: servidas.length, ausentesFichadas: faltanFichadas.length, ausentesNuevas: faltanServidas, listaFichadas: [...FICHADAS] },
  captura: { declarados: entradas.length, ausentes: capturaAusente, shaNoCasa: capturaCambiada },
  cms: { tamanosDeclarados: fichas.length, varianteAusente, dimensionDistinta },
  cuerpo: {
    referidos: referidas.length,
    resuelven: cuerpoOk.length + cuerpoLocal.length,
    enCaptura: cuerpoOk.length,
    yaLocales: cuerpoLocal.length,
    origen404: cuerpo404Origen,
    nuncaPedida: cuerpoNuncaPedida,
    nuevas: cuerpoNueva,
    fuente: "medidas/extractor-corpus.json · mediaDelCuerpo (T3b + T4b)",
    exenciones: "§M-ORIGEN404 = se pidió y el índice registró su error · §M-PDF-FB3D = PDF que T4b sacó de un base64 y la lista, derivada del markup, no podía ver",
  },
});

const errores = [];
if (unidades === 0)
  errores.push(
    "SIN UNIDADES — 0 artefactos evaluados en los tres invariantes.\n" +
      "   «Nada roto» y «no se ha mirado nada» dan la misma salida: la regla del cero.",
  );
if (faltanServidas.length) errores.push(`${faltanServidas.length} referencia(s) servida(s) SIN FICHERO y NO fichadas. El clon sirve algo que no existe.`);
if (capturaAusente.length) errores.push(`${capturaAusente.length} fichero(s) de la captura declarados y AUSENTES.`);
if (capturaCambiada.length) errores.push(`${capturaCambiada.length} fichero(s) capturados cuyo sha256 NO casa: la línea base cambió bajo los pies.`);
if (varianteAusente.length) errores.push(`${varianteAusente.length} tamaño(s) que la ficha declara y cuyo fichero NO está. Es el defecto de los \`imageSizes\` inertes.`);
if (dimensionDistinta.length) errores.push(`${dimensionDistinta.length} fichero(s) que NO miden lo que su ficha dice.`);
if (cuerpoNueva.length)
  errores.push(
    `${cuerpoNueva.length} \`data-media\` del cuerpo transformado que NO resuelve y NO está exento:\n` +
      `   ni se pidió y falló (§M-ORIGEN404) ni es un PDF que T4b sacara de un base64 (§M-PDF-FB3D).\n` +
      `   Es un 404 NUEVO: ${cuerpoNueva.slice(0, 4).join(", ")}`,
  );

console.log(`\n═══ VEREDICTO ═════════════════════════════════════════════════════`);
if (!errores.length)
  console.log(`  ✅ ${unidades} artefactos: existen y miden lo que su ficha dice.\n` +
    `     (${faltanFichadas.length} ausencias FICHADAS de §M-404 · ${cuerpo404Origen.length} de §M-ORIGEN404 ·\n` +
    `      ${cuerpoNuncaPedida.length} de §M-PDF-FB3D — las tres son deuda con dueño y ficha, no huecos)`);
for (const e of errores) console.error(`\n❌ ${e}`);
process.exit(errores.length + ev.informe() ? 2 : 0);
