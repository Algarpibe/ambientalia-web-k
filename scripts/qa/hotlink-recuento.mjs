/**
 * LOS DOS NÚMEROS DEL HOTLINK, ATADOS — cuál mide qué y cuál MANDA.
 * Uso: npm run qa:hotlink-recuento      (SABOTAJE=sin-build | rsc-ciego)
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * §DATOS-MEDIA-HOTLINK publicó **3688 referencias en 180 de 234 rutas**; la
 * tanda siguiente re-derivó **1820 referencias · 1268 URL distintas**. Los dos
 * son correctos y **miden objetos distintos**, pero mientras no se diga cuál,
 * el siguiente suma el que tenga a mano.
 *
 * > Es el caso ya fichado de `lh-serie` **149** contra `lh-paginas` **142**: dos
 * > congeladas que no cuentan lo mismo. La salida no es elegir una — es
 * > **publicar las dos con su fuente y declarar cuál manda**.
 *
 * ── Las tres magnitudes, y la relación entre ellas ───────────────────────
 * | magnitud | unidad | de dónde sale |
 * |---|---|---|
 * | **DATO** | referencias en el cuerpo almacenado | `corpus/transformado/` — lo que el seed inserta |
 * | **SERVIDO visible** | referencias en el HTML que el navegador pinta | `.next/server/app`, sin la carga RSC |
 * | **SERVIDO bruto** | ídem + la carga RSC | `.next/server/app` tal cual |
 *
 * **El SERVIDO no es el DATO multiplicado por un factor limpio**, y por eso hay
 * que medirlo en vez de razonarlo: un cuerpo se pinta en su ruta de detalle,
 * otra vez en cada listado que lo teasea, y **una tercera vez dentro del payload
 * RSC** del mismo documento (`self.__next_f.push`). `lib.mjs` ya tiene
 * `visibleDe()` para separar esa tercera, y aquí se usa **la misma función** —
 * escribir otra sería la clase C7 sobre el propio recuento.
 *
 * ── Cuál MANDA, y por qué ────────────────────────────────────────────────
 * **Manda el DATO.** Es la unidad sobre la que se decide y se transforma: T10
 * actúa sobre el cuerpo almacenado, su diana se cuenta ahí y su postcondición se
 * comprueba ahí. El SERVIDO es **consecuencia**, depende del nº de rutas
 * emitidas —que cambia cada vez que se siembra— y por tanto no puede ser el
 * denominador de nada estable: entre las dos medidas el clon pasó de 234 a 302
 * rutas sin que el dato se moviera un byte.
 *
 * El SERVIDO se sigue publicando porque es **el impacto real** —peticiones que
 * salen de verdad al original— y es lo que justifica la prioridad. Pero se cita
 * SIEMPRE con su build.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { APP, enApp, Evaluadas, gritaSiRevienta, hoy, QA, visibleDe, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["sin-build", "rsc-ciego"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const RAIZ = join(QA, "../..");
const TRANSFORMADO = join(RAIZ, "corpus/transformado");
const SERVIDO = SABOTAJE === "sin-build" ? join(APP, ".next/no-existe") : enApp(".next/server/app");

/** La misma expresión que usa T10, para que las tres magnitudes cuenten LO MISMO. */
const RE = /https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/([^"'\s)<>\\]+)/gi;
const cuenta = (texto) => {
  RE.lastIndex = 0;
  const urls = [];
  let m;
  while ((m = RE.exec(texto))) urls.push(m[1].split("?")[0]);
  return urls;
};

/* ── (1) EL DATO — y su alcance son LAS DOS MITADES del corpus ─────────────
 *
 * ⚠ El grupo A vive en `corpus/transformado/`; **casos y faqs viven en
 * `medidas/c-extraido.json`**, y contar sólo la primera daría un DATO más
 * pequeño que el SERVIDO sin que nada lo dijera — un número con el alcance
 * escondido, que es justo lo que este recuento existe para no volver a publicar.
 */
const dato = { refs: 0, urls: new Set(), docs: 0, conHotlink: 0, porFuente: {} };
const suma = (fuente, id, texto) => {
  const urls = cuenta(texto);
  dato.docs++;
  if (urls.length) dato.conHotlink++;
  dato.refs += urls.length;
  dato.porFuente[fuente] = (dato.porFuente[fuente] ?? 0) + urls.length;
  for (const u of urls) dato.urls.add(decodeURIComponent(u));
};
for (const col of readdirSync(TRANSFORMADO))
  for (const f of readdirSync(join(TRANSFORMADO, col)))
    suma("corpus/transformado", `${col}/${f}`, readFileSync(join(TRANSFORMADO, col, f), "utf8"));

const fC = join(QA, "medidas/c-extraido.json");
if (!existsSync(fC))
  throw new Error("no existe medidas/c-extraido.json: el DATO saldría corto y el factor, inventado.");
const C = JSON.parse(readFileSync(fC, "utf8"));
const RICAS_C = ["necesidad", "solucion", "resultados", "destacado", "detalles.parametros", "cuerpo"];
const enRuta = (o, r) => r.split(".").reduce((x, k) => x?.[k], o);
for (const [coleccion, filas] of Object.entries(C.catalogo ?? {}))
  for (const d of filas)
    for (const campo of RICAS_C) {
      const v = enRuta(d, campo);
      if (typeof v === "string" && v) suma("c-extraido", `${coleccion}/${d.slug}#${campo}`, v);
    }

/**
 * ⚠ **Y la TERCERA mitad, que costó exactamente lo que este recuento persigue.**
 * Con sólo dos fuentes el DATO daba **1820** y el SERVIDO visible **1827**: los
 * 7 de diferencia eran de `articulos-kb`, que siembra `seed-kb.mjs` desde
 * `medidas/kb-extraido.json`. Un número con dos de tres fuentes **no da error**:
 * da un residuo de 7 con pinta de fleco, y quien lo lea explicará el fleco en vez
 * de mirar el alcance.
 */
const fKb = join(QA, "medidas/kb-extraido.json");
if (!existsSync(fKb))
  throw new Error("no existe medidas/kb-extraido.json: el DATO saldría corto en `articulos-kb`.");
const KB = JSON.parse(readFileSync(fKb, "utf8"));
/**
 * ⚠ Se camina **`articulos[].cuerpo`**, no el fichero entero. La primera versión
 * recorría la raíz y se llevaba `meta` y `censo` —medidas, no contenido—: el
 * DATO subió a 1884 y quedó POR ENCIMA del servido, que es aritméticamente
 * imposible para un dato que se sirve. Es el sobre-casado de §sondas 4, y lo
 * delató el signo, no un error.
 */
const textos = (x, id) => {
  if (typeof x === "string") suma("kb-extraido", id, x);
  else if (Array.isArray(x)) x.forEach((y, i) => textos(y, `${id}[${i}]`));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) textos(v, `${id}.${k}`);
};
if (!Array.isArray(KB.articulos) || !KB.articulos.length)
  throw new Error("kb-extraido.json no trae `articulos` como array no vacío: el DATO saldría corto sin decirlo.");
const kb = { refs: 0, urls: new Set() };
for (const a of KB.articulos) {
  for (const u of cuenta(JSON.stringify(a.cuerpo ?? null))) { kb.refs++; kb.urls.add(decodeURIComponent(u)); }
}

/* ── (2) y (3) EL SERVIDO ────────────────────────────────────────────────── */
const servido = { bruto: 0, visible: 0, rutas: 0, rutasConHotlink: 0, urls: new Set() };
if (!existsSync(SERVIDO))
  throw new Error(
    `no existe ${SERVIDO}.\n` +
      `  Sin build no hay HTML servido, y una magnitud que sale CERO se leería como\n` +
      `  «ya no hay hotlinks» (regla 6). ¿Falta \`npm run build\`?`,
  );
const baja = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { baja(p); continue; }
    if (!e.name.endsWith(".html")) continue;
    const bruto = readFileSync(p, "utf8");
    /* `rsc-ciego`: si no se separa la carga RSC, «servido visible» y «servido
     * bruto» dan lo mismo — y entonces la sonda no está midiendo las TRES
     * magnitudes que dice medir, sino dos. */
    const vis = SABOTAJE === "rsc-ciego" ? bruto : visibleDe(bruto);
    const nb = cuenta(bruto).length;
    const nv = cuenta(vis);
    servido.rutas++;
    servido.bruto += nb;
    servido.visible += nv.length;
    if (nb) servido.rutasConHotlink++;
    for (const u of nv) servido.urls.add(decodeURIComponent(u));
  }
};
baja(SERVIDO);

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

const ev = new Evaluadas({ nombre: "hotlink-recuento", unidad: "magnitudes", minimo: 3 });
ev.ok(3);

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

console.log(`\n════════ LOS DOS NÚMEROS DEL HOTLINK, ATADOS ════════\n`);
console.log(`  magnitud            refs   URL dist.   unidad`);
console.log(`  DATO (manda)     ${String(dato.refs).padStart(7)}   ${String(dato.urls.size).padStart(9)}   referencias en ${dato.docs} regiones almacenadas (${dato.conHotlink} con hotlink)`);
console.log(`  SERVIDO visible  ${String(servido.visible).padStart(7)}   ${String(servido.urls.size).padStart(9)}   lo que el navegador pinta, en ${servido.rutas} rutas (${servido.rutasConHotlink} con hotlink)`);
console.log(`  SERVIDO bruto    ${String(servido.bruto).padStart(7)}   ${"—".padStart(9)}   ídem + la carga RSC del mismo documento`);
console.log(
  `  (aparte) KB      ${String(kb.refs).padStart(7)}   ${String(kb.urls.size).padStart(9)}   ` +
    `articulos-kb: su media son RELACIONES upload, no URLs en HTML — otro canal, NO se suma`,
);
console.log(
  `\n  factor servido/dato  ${(servido.bruto / (dato.refs || 1)).toFixed(2)}×  (bruto)  ·  ` +
    `${(servido.visible / (dato.refs || 1)).toFixed(2)}×  (visible)`,
);
console.log(
  `\n  → **MANDA EL DATO.** Es la unidad sobre la que T10 actúa, cuenta su diana y\n` +
    `    comprueba su postcondición. El SERVIDO es consecuencia y depende del nº de\n` +
    `    rutas emitidas, así que se cita SIEMPRE con su build — no es denominador de nada.`,
);

/* La guarda del sabotaje `rsc-ciego`: si bruto y visible coinciden, la carga RSC
 * no se está separando y las «tres magnitudes» son dos. */
if (servido.bruto === servido.visible)
  err(
    `SERVIDO BRUTO === VISIBLE (${servido.bruto}): la carga RSC no se está separando,\n` +
      `   así que esta sonda mide DOS magnitudes y dice medir tres.`,
  );
if (dato.refs === 0) err(`0 referencias en el dato: el lector no casa, o \`corpus/transformado\` está vacío.`);
if (servido.rutas === 0) err(`0 rutas servidas leídas en ${SERVIDO}.`);

w("medidas/hotlink-recuento.json", {
  meta: {
    fecha: hoy(),
    que: "las TRES magnitudes del hotlink, con su unidad y su fuente, y cuál manda",
    manda: "DATO",
    porQue:
      "es la unidad sobre la que T10 actúa y comprueba; el SERVIDO depende del nº de rutas emitidas " +
      "(234 → 302 en dos tandas) y no puede ser denominador estable",
    sabotaje: SABOTAJE,
  },
  articulosKb: { refs: kb.refs, urlsDistintas: kb.urls.size, porQue: "su media son relaciones upload, no URLs en HTML: otro canal, no sumable al DATO" },
  dato: { refs: dato.refs, urlsDistintas: dato.urls.size, regiones: dato.docs, conHotlink: dato.conHotlink, porFuente: dato.porFuente, fuente: "corpus/transformado/ + medidas/c-extraido.json" },
  servidoVisible: { refs: servido.visible, urlsDistintas: servido.urls.size, rutas: servido.rutas, rutasConHotlink: servido.rutasConHotlink, fuente: ".next/server/app sin carga RSC" },
  servidoBruto: { refs: servido.bruto, fuente: ".next/server/app tal cual" },
  factores: { brutoSobreDato: Number((servido.bruto / (dato.refs || 1)).toFixed(3)), visibleSobreDato: Number((servido.visible / (dato.refs || 1)).toFixed(3)) },
});

console.log(`\n${rojo === 0 ? "✅" : "❌"} hotlink-recuento: dato ${dato.refs} · servido visible ${servido.visible} · bruto ${servido.bruto} · ${rojo} guarda(s) en rojo\n`);
process.exit(rojo === 0 ? 0 : 2);
