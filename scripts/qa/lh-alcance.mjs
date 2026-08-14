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
import { env, Evaluadas, hoy, leeManifiesto, QA, rutasEmitidas, w } from "./lib.mjs";

const ARGS = process.argv.slice(2);
const ANCHO = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);

const SABOTAJES = ["sin-espejo", "eje-sin-declarar"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

/**
 * ⚠ **DE QUÉ espejo, y por qué es un PARÁMETRO y no un `if existe`.**
 *
 * Hay dos, y miden cosas distintas: `lh-spec` es el espejo de **FORMAS** (13
 * páginas, todas la 1.ª) y `lh-espejo` es el de **PÁGINAS** (todas las que
 * listan). El alcance que esta sonda declara **depende de cuál**, así que se
 * elige por argumento y **nunca por fallback silencioso** — un `?? el que haya`
 * haría que el mismo comando publicara dos denominadores distintos según el
 * estado del disco, que es §regla 6 con el número del informe dentro.
 */
const ESPEJO_REL =
  env("ESPEJO") ??
  (ARGS.find((a) => a.startsWith("--espejo=")) ?? "").split("=").slice(1).join("=") ??
  null;
const ESPEJO_NOMBRE = ESPEJO_REL || `medidas/lh-spec-${ANCHO}.json`;
/** Sufijo del fichero congelado: dos espejos NO pueden pisar la misma salida. */
const SUFIJO = ESPEJO_REL ? "-todas" : "";

const ESPEJO_F = join(QA, ESPEJO_NOMBRE);
if (!existsSync(ESPEJO_F) || SABOTAJE === "sin-espejo")
  throw new Error(
    `ESPEJO AUSENTE: no existe ${ESPEJO_NOMBRE}.\n` +
      `  El universo de pares SALE del espejo. Sin él, el alcance saldría «0 pares»,\n` +
      `  que se lee como «no hay nada que verificar» en vez de como «no miré» (§sondas 4bis).`,
  );
const ESPEJO = JSON.parse(readFileSync(ESPEJO_F, "utf8"));
/* §regla 6 · un espejo PARCIAL se rechaza: declararía un alcance de prueba con
 * la misma cara que uno de campaña, que es justo lo que esta sonda evita. */
if (ESPEJO.meta?.parcial)
  throw new Error(
    `ESPEJO PARCIAL: ${ESPEJO_NOMBRE} se midió con SOLO= y no contiene el universo.\n` +
      `  El denominador que saldría de aquí sería el de una prueba, no el de la tanda.`,
  );

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
console.log(`  espejo     ${ESPEJO_NOMBRE} (congelado ${ESPEJO.meta?.fecha ?? "?"}) — unidad ${ESPEJO.meta?.unidad ?? "?"}`);
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

/* ══════════════════════════════════════════════════════════════════════════
 * EL ALCANCE EN LA OTRA UNIDAD: LA PÁGINA — y por qué NO es un detalle
 *
 * Todo lo de arriba cuenta **pares**, y un par es *camino × propiedad* DENTRO de
 * una página. Pero el denominador de una tanda tiene una segunda mitad que el
 * recuento de pares **absorbe entera**: *¿sobre CUÁNTAS PÁGINAS se tomaron esos
 * pares?* — §UNA COBERTURA DECLARADA AL NIVEL DE ARRIBA ABSORBE TODO LO QUE NO SE
 * MIDIÓ ABAJO, con la unidad cambiada de la ruta a la página.
 *
 * ── El cruce que obliga a declararlo ──────────────────────────────────────
 * `qa:lh-serie` **midió esta pregunta y la contestó**: su veredicto literal es
 * **«LA SERIE NO ES UNA UNIDAD»** — 19 de 28 series heterogéneas, **38 clases**
 * distintas, y su test en negativo sale **rojo por construcción** si alguien
 * toma el atajo de *«una página por serie»*.
 *
 * Y el espejo del comparador (`lh-spec`) mide **la página 1** de cada forma.
 * O sea que `lh-cmp` toma exactamente el atajo que `lh-serie` rechaza, y hasta
 * hoy eso vivía como una línea suelta en `noMide` —sin número— mientras el
 * cierre de la tanda se leía como *«LISTADO-B verificado»*. **Dos instrumentos
 * del mismo repo en desacuerdo sobre la misma unidad**, que es justo el caso en
 * el que este proyecto tiene escrito que se cruzan antes de creerse ninguno.
 *
 * ── Lo que esta sección NO hace ───────────────────────────────────────────
 * No ensancha el comparador: **declara su alcance con su número**. Ensancharlo
 * es una tanda con su coste, y el coste se publica aquí abajo para que la
 * decisión se tome con él delante y no de memoria.
 *
 * ⚠ Y **no cierra el código de salida** (§sondas 1: lo que se imprime y no se
 * cuenta se dice, y se dice por qué). Un rojo permanente aquí convertiría el
 * censo del alcance en una guarda de otra cosa; el rojo que corresponde es el
 * de `lh-cmp` cuando se decida ensancharlo.
 * ═════════════════════════════════════════════════════════════════════════ */
/** `/es/etiqueta/x/` · `/etiqueta/x` · `etiqueta/x` → `etiqueta/x`. Los tres
 *  ficheros congelados usan convenciones distintas y compararlas sin normalizar
 *  daría **0 coincidencias**, que se leería como «el comparador no mira nada». */
const aClave = (r) => r.replace(/^\/es/, "").replace(/^\/+/, "").replace(/\/+$/, "") || "/";

/* §regla 6 · las dos congeladas que este cruce necesita se RECHAZAN si faltan:
 * un `?? null` daría «0 páginas ciegas», que es la respuesta tranquilizadora. */
const leeCongelada = (f, porQue) => {
  const p = join(QA, `medidas/${f}`);
  if (!existsSync(p))
    throw new Error(
      `FALTA medidas/${f}: ${porQue}\n` +
        `  Sin ella el alcance en PÁGINAS saldría vacío, y un cero aquí se lee como\n` +
        `  «no hay nada ciego» en vez de como «no lo miré» (§regla del cero).`,
    );
  return JSON.parse(readFileSync(p, "utf8"));
};
const SERIE = leeCongelada("lh-serie.json", "es quien estableció que la unidad es la PÁGINA y no la serie");
const HUECOS = leeCongelada("lh-huecos.json", "es quien tiene el modelo del paginador y sus 43 instancias");

const universoCmp = new Set(FORMAS.map((F) => aClave(F.ruta)));
/** Las páginas del original, en la unidad de `lh-serie`: serie + `/page/N`. */
const paginasUniverso = [];
for (const [serie, s] of Object.entries(SERIE.series ?? {}))
  for (const pg of s.paginas ?? []) paginasUniverso.push({ clave: aClave(pg.n === 1 ? serie : `${serie}/page/${pg.n}`), pos: pg.pos, clase: pg.clase, vacia: pg.vacia });

const cuenta = (xs) => xs.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
const vistas = paginasUniverso.filter((p) => universoCmp.has(p.clave));
const clasesUniverso = new Set(paginasUniverso.map((p) => p.clase));
const clasesVistas = new Set(vistas.map((p) => p.clase));
const clasesCiegas = [...clasesUniverso].filter((c) => !clasesVistas.has(c));
const paginasEnClasesCiegas = paginasUniverso.filter((p) => clasesCiegas.includes(p.clase)).length;

/* ── EL CASO QUE LO DEMUESTRA, y no es hipotético: la PIEL B ───────────────
 * §F3-LH-PIELB-VENTANA. El modelo viejo emitía `current` + `n+1..total`, o sea
 * **cero `page smaller`**, y era **falso en 31 de las 38** instancias juzgables
 * (43 menos las 5 con `larger page`, que quedan fuera del denominador). Salió
 * verde. La razón se deriva aquí, y **no es la que decía el acta**: no es que el
 * comparador mirase sólo las buenas — es que de esta piel **comparó UNA**, y no
 * separaba los dos modelos. */
const pb = HUECOS.huecos?.ventanaPielB ?? {};
const instPB = (pb.instancias_ ?? []).map((i) => ({ ...i, clave: aClave(i.ruta) }));
const buenasPB = new Set((pb.viejoAciertaEn ?? []).map((i) => aClave(i.ruta)));
/** La página 1 SEPARA los dos modelos sólo si `total ≥ 6`: con `total ≤ 5` la
 *  ventana de 5 y «todas» emiten la MISMA secuencia (§DOS MODELOS QUE PREDICEN
 *  LO MISMO EN TODO TU DOMINIO SON UNO SOLO). */
const separaPB = (i) => !(i.n === 1 ? i.total <= 5 : false) && !buenasPB.has(i.clave);
const pbEnUniverso = instPB.filter((i) => universoCmp.has(i.clave));
/**
 * Y de ésas, las que el clon SIRVE hoy: una forma AUSENTE **no se compara**, así
 * que estar en el universo del espejo no basta.
 *
 * ⚠ **Sin manifiesto esto NO es 0, es `null`** (§regla 6). `construida()`
 * devuelve `null` cuando no hay `prerender-manifest`, y un `=== true` lo
 * convertiría en «ninguna comparada» — un número que aquí apunta al lado
 * prudente y **por la razón equivocada**: diría «el comparador no mira ninguna»
 * cuando lo que pasa es que nadie miró el build.
 */
const pbComparadas = EMITIDAS ? pbEnUniverso.filter((i) => construida(`/${i.clave}/`) === true) : null;
const pbSeparadorasComparadas = pbComparadas ? pbComparadas.filter(separaPB) : null;

const alcanceReal = {
  pregunta: "¿sobre cuántas PÁGINAS compara qa:lh-cmp, y sobre cuántas NO?",
  unidad: "la PÁGINA (las /page/N incluidas), que es la unidad que estableció qa:lh-serie",
  porQueImporta:
    "el recuento de PARES es «camino × propiedad DENTRO de una página»: absorbe entero sobre cuántas páginas se tomaron.",
  cruceConLhSerie: {
    veredicto: SERIE.resumen?.veredicto ?? null,
    seriesHeterogeneas: SERIE.resumen?.heterogeneas ?? null,
    deSeriesConVariasPaginas: SERIE.resumen?.seriesConVariasPaginas ?? null,
    loQueSignifica: "cada /page/N es su propia unidad; «una página por serie» es el atajo que su negativo rechaza",
  },
  paginas: {
    enElUniverso: paginasUniverso.length,
    conContenido: paginasUniverso.filter((p) => !p.vacia).length,
    queCompara: vistas.length,
    porPosicionQueCompara: cuenta(vistas.map((p) => p.pos)),
    porPosicionDelUniverso: cuenta(paginasUniverso.map((p) => p.pos)),
  },
  clases: {
    enElUniverso: clasesUniverso.size,
    queToca: clasesVistas.size,
    ciegas: clasesCiegas.length,
    paginasEnClasesCiegas,
  },
  pielB: {
    porQue: "§F3-LH-PIELB-VENTANA — el defecto vivía ENTERO en lo que el comparador no mira, y salió verde",
    instancias: instPB.length,
    enElUniversoDelComparador: pbEnUniverso.length,
    realmenteComparadas: pbComparadas ? pbComparadas.length : null,
    separadorasComparadas: pbSeparadorasComparadas ? pbSeparadorasComparadas.length : null,
    detalle: pbEnUniverso.map((i) => ({
      ruta: i.ruta,
      n: i.n,
      total: i.total,
      laSirveElClon: construida(`/${i.clave}/`),
      separaLosDosModelos: separaPB(i),
    })),
    veredicto: !pbSeparadorasComparadas
      ? `SIN MANIFIESTO: no se puede decir cuáles se comparan (${porQueNoHayManifiesto}). No se sustituye por 0.`
      : pbSeparadorasComparadas.length === 0
        ? "SIN PROBAR: 0 instancias SEPARADORAS entre las comparadas — el acierto del comparador sobre esta piel no distingue los dos modelos"
        : `${pbSeparadorasComparadas.length} separadora(s) comparada(s)`,
  },
  costeDeEnsanchar: {
    paginasConContenidoSinComparar: paginasUniverso.filter((p) => !p.vacia).length - vistas.filter((p) => !p.vacia).length,
    factorSobreLoQueHoySeCompara: vistas.length ? +(paginasUniverso.filter((p) => !p.vacia).length / vistas.length).toFixed(1) : null,
    queCuesta:
      "cada página nueva es una carga del clon (y del original en --vivo) más su barrido: el comparador tarda ~ lineal en páginas. " +
      "No es un parámetro: es una tanda con su corrida, su congelada y su lectura.",
    loQueNoCuesta: "el espejo YA existe por forma; ensanchar exige medir el original en las /page/N, que hoy no están en lh-spec.",
  },
};

console.log(`\n  ── EL ALCANCE EN LA OTRA UNIDAD: LA PÁGINA (§lh-serie: «${alcanceReal.cruceConLhSerie.veredicto}») ──`);
console.log(`  páginas del universo   ${alcanceReal.paginas.enElUniverso}   (${alcanceReal.paginas.conContenido} con contenido)`);
console.log(`  páginas que COMPARA    ${alcanceReal.paginas.queCompara}   ${JSON.stringify(alcanceReal.paginas.porPosicionQueCompara)}`);
console.log(`  del universo           ${JSON.stringify(alcanceReal.paginas.porPosicionDelUniverso)}`);
console.log(`  clases                 toca ${alcanceReal.clases.queToca} de ${alcanceReal.clases.enElUniverso} · CIEGAS ${alcanceReal.clases.ciegas} (${paginasEnClasesCiegas} páginas)`);
console.log(
  `  piel B                 ${alcanceReal.pielB.instancias} instancias · ${alcanceReal.pielB.enElUniversoDelComparador} en su universo · ` +
    `${alcanceReal.pielB.realmenteComparadas ?? "?"} COMPARADAS · ${alcanceReal.pielB.separadorasComparadas ?? "?"} separadoras`,
);
console.log(`     ⚠ ${alcanceReal.pielB.veredicto}`);
console.log(`  ⚠ esto NO cierra el código de salida: es el CENSO del alcance, no la guarda del comparador.`);

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
    espejo: `${ESPEJO_NOMBRE} (${ESPEJO.meta?.fecha ?? "?"})`,
    unidad: "el PAR (camino × propiedad), la misma que qa:lh-cmp",
    /**
     * ⚠ **CADA LÍNEA CON SU CARDINAL Y SU DENOMINADOR (§regla 14, 2026-08-14).**
     *
     * Estas líneas existían desde el primer día **sin número**, y así se leen
     * como una nota al pie en vez de como lo que son: la otra mitad del
     * denominador. Y no vale un puntero —*«ver `alcanceReal`, que lo dice con su
     * número»*—: mover el número a otro campo lo saca de al lado de la frase que
     * contradice, que es justo donde tiene que estar para que alguien lo sopese.
     */
    noMide: [
      `el clon: esta sonda no abre una página ni arranca el servidor — 0 de las ${FORMAS.length} formas se renderiza aquí`,
      `si un par CUADRA: eso es la comparación, no el alcance — de los ${pares} pares censados, esta sonda comprueba 0`,
      `las páginas que el espejo NO trae: compara ${alcanceReal.paginas.queCompara} de ${alcanceReal.paginas.enElUniverso} ` +
        `(${JSON.stringify(alcanceReal.paginas.porPosicionQueCompara)} de ${JSON.stringify(alcanceReal.paginas.porPosicionDelUniverso)}), ` +
        `y toca ${alcanceReal.clases.queToca} de ${alcanceReal.clases.enElUniverso} clases — ${alcanceReal.clases.ciegas} ciegas, ${alcanceReal.clases.paginasEnClasesCiegas} páginas dentro`,
      `las formas AUSENTES en el clon: el dominio EFECTIVO es universo − ausentes, y esta sonda no abre el clon — ` +
        `de las ${FORMAS.length} formas, ${FORMAS.filter((F) => construida(F.ruta) === true).length} tienen ruta emitida`,
    ],
    porQueMixto:
      "una magnitud MIXTA depende de la plantilla Y del contenido a la vez (alto, y, renglones, nTarjetas, " +
      "clases, marca). Contra el espejo absorbe la deriva del contenido; contra el corpus, la geometría de un " +
      "render sin hojas. La referencia que las arreglaría es una tercera —el corpus RENDERIZADO con sus hojas— " +
      "y construirla es una tanda, no un parámetro.",
  },
  universo: { formas: FORMAS.length, pares, ...total, verificables, pctMixto },
  /* La otra mitad del denominador: sobre cuántas PÁGINAS se toman esos pares. */
  alcanceReal,
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

/* Dos espejos, dos congeladas: pisar la misma borraría la evidencia de que el
 * alcance era otro antes de ensanchar (§sondas 5). */
w(`medidas/lh-alcance-${ANCHO}${SUFIJO}.json`, salida);

console.log(
  `✅ ${FORMAS.length} formas censadas · ${pares} pares · ${verificables} verificables · ${total.mixta} MIXTOS (${pctMixto} %).\n`,
);
process.exit(0);
