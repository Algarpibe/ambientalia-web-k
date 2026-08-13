/**
 * EL ALCANCE VERIFICABLE DE LOS LISTADOS — cuántos pares puede una tanda
 * verificar, y cuántos NO, declarado ANTES de construir.
 * Uso: node scripts/qa/lh-alcance.mjs [1440|390]     (npm run qa:lh-alcance)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTA SONDA EXISTE, Y POR QUÉ CORRE ANTES Y NO DESPUÉS
 *
 * §*la cobertura declarada al nivel de arriba absorbe todo lo que no se midió
 * abajo*. Un cierre que diga «L1-blog verificado» es cierto **y absorbe** que
 * una parte de sus pares no tiene referencia limpia: son magnitudes MIXTAS —
 * dependen de la plantilla **y** del contenido a la vez— y `lh-cmp` las cuenta
 * aparte a propósito, sin leerlas como defecto.
 *
 * El problema no es que el comparador las esconda —no lo hace, las imprime—:
 * es que **el denominador aparece DESPUÉS de construir**, cuando ya hay un
 * verde delante y la tentación es leerlo entero. Así que el número se deriva
 * **antes**, cuando todavía no hay nada que defender.
 *
 * ── Lo que esta sonda NO hace, dicho para que nadie lo dé por hecho ───────
 * No mide el clon. No abre una página. **No es una comparación**: es un censo
 * del universo del espejo, clasificado por el MISMO `ejeDe()` que usará el
 * comparador (`lh-ejes.mjs` — una sola definición, §C7).
 *
 * Su afirmación es exactamente ésta y ninguna más:
 *
 *   > de los N pares que la forma X tiene en el espejo, V son verificables
 *   > (contenido contra el corpus + plantilla contra el original) y M no lo
 *   > son, porque no tienen referencia limpia.
 *
 * ── Y por qué un camino sin eje sale por ERROR ────────────────────────────
 * §regla 6: la ausencia se rechaza, no se sustituye. Si el barrido gana una
 * propiedad nueva y nadie la clasifica, el alcance saldría **plausible y
 * mal** — con el par nuevo desaparecido del denominador. Aquí tira, igual que
 * en el comparador y por la misma razón.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { censaEjes } from "./lh-ejes.mjs";
import { Evaluadas, hoy, leeManifiesto, QA, rutasEmitidas, w } from "./lib.mjs";

const ARGS = process.argv.slice(2);
const ANCHO = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);

const SABOTAJES = ["sin-espejo", "eje-sin-declarar"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const ESPEJO_F = join(QA, `medidas/lh-spec-${ANCHO}.json`);
if (!existsSync(ESPEJO_F) || SABOTAJE === "sin-espejo")
  throw new Error(
    `ESPEJO AUSENTE: no existe medidas/lh-spec-${ANCHO}.json.\n` +
      `  El universo de pares SALE del espejo. Sin él, el alcance saldría «0 pares»,\n` +
      `  que se lee como «no hay nada que verificar» en vez de como «no miré» (§sondas 4bis).`,
  );
const ESPEJO = JSON.parse(readFileSync(ESPEJO_F, "utf8"));

/**
 * ⚠ **Las formas EMITIDAS se derivan del `prerender-manifest`, y la primera
 * versión de esta sonda las derivó MAL — así que el error queda escrito.**
 *
 * Derivaba por el primer segmento del árbol de `app/`: *«¿existe
 * `app/recursos/`?»*. Existe — es el catch-all del DOCUMENTO CIENTÍFICO— y la
 * sonda daba **`✓ recursos/` en las cuatro formas `L1-resources`**, o sea
 * **6 de 13 formas emitidas** cuando el build no emite **ninguna** ruta de
 * listado. §sondas 4 en su tercera cara: un detector que encuentra **más** de lo
 * que hay no da error, **da un número plausible de más** — y aquí habría inflado
 * el denominador de la tanda antes de que existiera nada que contar.
 *
 * La derivación buena es la RUTA EXACTA contra lo que el build emitió, que es
 * §El principio (*verificar contra la salida servida*) aplicado al manifiesto.
 *
 * ⚠ Y si no hay manifiesto **no se sustituye por nada**: se declara con su cero
 * y su razón (§regla 6). Un `?? new Set()` diría «el build no emite ninguna»,
 * que es la respuesta correcta por accidente hoy y falsa mañana.
 */
const aLocal = (r) => r.replace(/^\/es/, "").replace(/\/$/, "") || "/";
let EMITIDAS = null;
let porQueNoHayManifiesto = null;
try {
  EMITIDAS = new Set(rutasEmitidas(leeManifiesto()));
} catch (e) {
  porQueNoHayManifiesto = e.message.split("\n")[0];
}
const construida = (ruta) => (EMITIDAS ? EMITIDAS.has(aLocal(ruta)) : null);

const FORMAS = Object.entries(ESPEJO.paginas ?? {})
  .filter(([, v]) => v && !v.error)
  .map(([clave, v]) => {
    const i = clave.indexOf("::");
    if (i < 0) throw new Error(`clave sin '::' en lh-spec.paginas: '${clave}'. El formato cambió y el universo saldría a medias.`);
    return { clave, forma: clave.slice(0, i), ruta: clave.slice(i + 2), espejo: v };
  });

if (!FORMAS.length) throw new Error("0 formas en el espejo: un cero aquí se leería como «nada que verificar» (§regla del cero).");

const ev = new Evaluadas({ nombre: `lh-alcance@${ANCHO}`, unidad: "formas del espejo censadas", minimo: FORMAS.length });

console.log(`\n════════ LISTADOS · ALCANCE VERIFICABLE @${ANCHO} ════════`);
console.log(`  espejo     medidas/lh-spec-${ANCHO}.json (congelado ${ESPEJO.meta?.fecha ?? "?"})`);
console.log(`  formas     ${FORMAS.length}`);
console.log(`  ⚠ esto NO es una comparación: es el DENOMINADOR de la que venga después.\n`);
console.log(`  ${"forma".padEnd(46)} ${"pares".padStart(6)} ${"verif.".padStart(7)} ${"MIXTOS".padStart(7)}  ${"%mixto".padStart(7)}  ruta en app/`);

const total = { contenido: 0, plantilla: 0, mixta: 0 };
const porForma = {};
const sinEje = [];

for (const F of FORMAS) {
  const { censo, sinClasificar } = censaEjes(SABOTAJE === "eje-sin-declarar" ? { ...F.espejo, __inventado__: 1 } : F.espejo);
  for (const k of sinClasificar) sinEje.push(`${F.clave}::${k}`);
  for (const e of Object.keys(total)) total[e] += censo[e];

  const pares = censo.contenido + censo.plantilla + censo.mixta;
  const verificables = censo.contenido + censo.plantilla;
  const pct = pares ? +((censo.mixta * 100) / pares).toFixed(1) : 0;
  porForma[F.clave] = { ruta: F.ruta, ...censo, pares, verificables, pctMixto: pct, emiteElBuild: construida(F.ruta) };
  ev.ok(1);

  const em = construida(F.ruta);
  console.log(
    `  ${F.clave.padEnd(46)} ${String(pares).padStart(6)} ${String(verificables).padStart(7)} ${String(censo.mixta).padStart(7)}  ` +
      `${String(pct).padStart(6)}%  ${em === null ? "? sin manifiesto" : em ? `✓ ${aLocal(F.ruta)}` : `⛔ ${aLocal(F.ruta)}`}`,
  );
}

/* §regla 6 · un camino sin eje NO se mete en un cubo por defecto: tira. */
if (sinEje.length)
  throw new Error(
    `PARES SIN EJE DECLARADO: ${sinEje.length} camino(s).\n` +
      sinEje.slice(0, 12).map((s) => `    · ${s}`).join("\n") +
      `\n  El alcance saldría PLAUSIBLE y mal: el par nuevo desaparecería del denominador.\n` +
      `  Clasifícalos en ejeDe() (scripts/qa/lh-ejes.mjs) o declara el ESCALÓN.`,
  );

const pares = total.contenido + total.plantilla + total.mixta;
const verificables = total.contenido + total.plantilla;
const pctMixto = +((total.mixta * 100) / pares).toFixed(1);

/* Lo que el build YA emite, derivado del manifiesto — no una lista de esta tanda. */
const emitidas = FORMAS.filter((F) => construida(F.ruta) === true);
const sumaDe = (fs, k) => fs.reduce((a, F) => a + porForma[F.clave][k], 0);

const salida = {
  meta: {
    fecha: hoy(),
    que: `ALCANCE VERIFICABLE de los listados a ${ANCHO}: el denominador de qa:lh-cmp, derivado ANTES de comparar`,
    espejo: `medidas/lh-spec-${ANCHO}.json (${ESPEJO.meta?.fecha ?? "?"})`,
    unidad: "el PAR (camino × propiedad), la misma que qa:lh-cmp",
    noMide: [
      "el clon: esta sonda no abre una página ni arranca el servidor",
      "si un par CUADRA: eso es la comparación, no el alcance",
      "las rutas /page/N: el espejo mide la página 1 de cada forma",
    ],
    porQueMixto:
      "una magnitud MIXTA depende de la plantilla Y del contenido a la vez (alto, y, renglones, nTarjetas, " +
      "clases, marca). Contra el espejo absorbe la deriva del contenido; contra el corpus, la geometría de un " +
      "render sin hojas. La referencia que las arreglaría es una tercera —el corpus RENDERIZADO con sus hojas— " +
      "y construirla es una tanda, no un parámetro.",
  },
  universo: { formas: FORMAS.length, pares, ...total, verificables, pctMixto },
  emiteElBuild: {
    fuente: EMITIDAS ? "apps/web/.next/prerender-manifest.json (la ruta EXACTA, no el segmento)" : `SIN MANIFIESTO — ${porQueNoHayManifiesto}`,
    rutasEnElManifiesto: EMITIDAS ? EMITIDAS.size : null,
    formas: EMITIDAS ? emitidas.length : null,
    claves: emitidas.map((F) => F.clave),
    pares: sumaDe(emitidas, "pares"),
    verificables: sumaDe(emitidas, "verificables"),
    mixtos: sumaDe(emitidas, "mixta"),
  },
  porForma,
};

console.log(`\n  ── el universo, en la unidad que compara ──`);
console.log(`  pares totales          ${pares}`);
console.log(`  verificables           ${verificables}   (contenido ${total.contenido} contra el CORPUS · plantilla ${total.plantilla} contra el ORIGINAL)`);
console.log(`  MIXTOS                 ${total.mixta}   = ${pctMixto} % SIN referencia limpia (§ESCALÓN eje mixto)`);
console.log(`\n  ── y lo que el build EMITE hoy (ruta EXACTA contra el prerender-manifest) ──`);
if (!EMITIDAS) console.log(`  ⚠ SIN MANIFIESTO — ${porQueNoHayManifiesto}\n    No se sustituye por «ninguna»: sería la respuesta correcta por accidente.`);
else {
  console.log(`  rutas en el manifiesto ${EMITIDAS.size}`);
  console.log(`  formas con ruta        ${emitidas.length} de ${FORMAS.length}`);
  console.log(`  sus pares              ${salida.emiteElBuild.pares}   ⇒ ${salida.emiteElBuild.verificables} verificables · ${salida.emiteElBuild.mixtos} mixtos`);
}
console.log(`\n  ⚠ «verificable» NO quiere decir «verificado»: dice que el par TIENE referencia.`);
console.log(`    Que cuadre o no lo dice qa:lh-cmp, y sólo en las formas que el clon sirva.\n`);

w(`medidas/lh-alcance-${ANCHO}.json`, salida);

console.log(
  `✅ ${FORMAS.length} formas censadas · ${pares} pares · ${verificables} verificables · ${total.mixta} MIXTOS (${pctMixto} %).\n`,
);
process.exit(0);
