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

const SABOTAJES = ["sin-espejo", "eje-sin-declarar", "pagina-sin-pares", "frontera-sin-explicar"];
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
  const espejoDe =
    SABOTAJE === "eje-sin-declarar"
      ? { ...F.espejo, __inventado__: 1 }
      : /* El sabotaje vacía UNA página: la del final, para que no dependa del
         * orden de recorrido ni de cuál caiga primero. */
        SABOTAJE === "pagina-sin-pares" && F.clave === FORMAS[FORMAS.length - 1].clave
        ? {}
        : F.espejo;
  const { censo, sinClasificar } = censaEjes(espejoDe);
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
/**
 * ⚠ **LA TERCERA CONGELADA, Y ENTRA POR LA §regla 14: SIN ELLA LAS TRES
 * FRONTERAS DE LA EXCLUSIÓN SE LEEN COMO UNA SOLA.**
 *
 * `lh-serie` marca `vacia: true` en 65 páginas, y **`vacia` no es una frontera:
 * son TRES** (§F3-LH-VACIA-DOS-CAUSAS, 71.ª tanda). Quien las separa es
 * `paginaDeVerdad` — *«¿esta serie pagina de verdad, o sirve 200 para cualquier
 * N con canonical a la 1.ª?»*—, y su autoridad es ésta.
 *
 * Sin este fichero, la frase que sale es *«las que el comparador no mira son las
 * vacías de D2.5»*: **cierta de 55 de 67 y falsa de las otras 12**, y con la
 * cara de una explicación cerrada. Es exactamente el error que la 71.ª tanda
 * midió y escribió — repetirlo aquí sería §*MENCIONADO NO ES DOCUMENTADO* al
 * revés: documentado, y vuelto a cometer en el instrumento.
 */
const PAGINAS = leeCongelada(
  "lh-paginas.json",
  "es la AUTORIDAD de `paginaDeVerdad`, y sin ella las TRES fronteras de la exclusión (D2.5 · D2.4 · sin decisión) salen como una",
);
/** Las series que NO paginan: su `/page/N` es el MISMO documento (canonical a la 1.ª). */
const noPagina = new Set(
  Object.entries(PAGINAS.paginas ?? {})
    .filter(([, v]) => v?.paginaDeVerdad === false)
    .map(([r]) => aClave(r)),
);
if (!noPagina.size)
  throw new Error(
    `0 series con paginaDeVerdad===false en lh-paginas.json.\n` +
      `  Un cero aquí NO es «todas paginan»: es un campo que cambió de nombre, y el\n` +
      `  reparto por frontera saldría entero en el cubo equivocado (§regla del cero).`,
  );

const universoCmp = new Set(FORMAS.map((F) => aClave(F.ruta)));
/** Las páginas del original, en la unidad de `lh-serie`: serie + `/page/N`. */
const paginasUniverso = [];
for (const [serie, s] of Object.entries(SERIE.series ?? {}))
  for (const pg of s.paginas ?? [])
    paginasUniverso.push({
      serie,
      n: pg.n,
      clave: aClave(pg.n === 1 ? serie : `${serie}/page/${pg.n}`),
      pos: pg.pos,
      clase: pg.clase,
      vacia: pg.vacia,
    });

const cuenta = (xs) => xs.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
const vistas = paginasUniverso.filter((p) => universoCmp.has(p.clave));
const clasesUniverso = new Set(paginasUniverso.map((p) => p.clase));
const clasesVistas = new Set(vistas.map((p) => p.clase));
const clasesCiegas = [...clasesUniverso].filter((c) => !clasesVistas.has(c));
const paginasEnClasesCiegas = paginasUniverso.filter((p) => clasesCiegas.includes(p.clase)).length;

/* ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ CADA PÁGINA QUE NO SE COMPARA ESTÁ FUERA — con su frontera, no con
 * su parecido (§regla 6: la ausencia se rechaza, no se mete en un cubo)
 *
 * Las dos líneas que la §regla 14 reclama —*«¿qué son las clases CIEGAS?»* y
 * *«¿por qué `última` es 4 y no 28?»*— tienen **la misma** respuesta debajo, y
 * es un reparto en TRES, no en uno. El campo `vacia` de `lh-serie` no lo
 * separa: mezcla las 55 de `D2.5` con las 5 sin decisión y con 5 de los 7
 * duplicados de `D2.4`.
 *
 * ⚠ Y una página fuera **sin frontera que la explique TIRA**. Un cubo «otras»
 * convertiría un hueco en una nota, que es §regla 6 con el número del informe
 * dentro.
 * ═════════════════════════════════════════════════════════════════════════ */
const FRONTERAS = {
  "D2.4·duplicado": "/page/N de una serie que NO pagina: canonical a la 1.ª ⇒ el MISMO documento, no una ruta (D2.4)",
  "B·sin-decisión": "la página 1 de una serie que no pagina y no lista nada: NI D2.5 NI D2.4 le aplican (§F3-LH-VACIA-DOS-CAUSAS, grupo B)",
  "D2.5·vacía": "página de una serie que SÍ pagina y no lista nada: 200 · canonical a sí misma · «Página N de M» (D2.5, contrato P-LH-C7)",
  "espejo·no-la-trae": "página CON CONTENIDO que este espejo no mide: NO es una decisión, es EL ALCANCE — el número que hay que mirar",
};
/**
 * ⚠ **LA CUARTA FRONTERA ES LA QUE DE VERDAD IMPORTA, Y NO ES UNA DECISIÓN.**
 *
 * Las tres primeras dicen *«esta página está fuera porque alguien lo firmó»*. La
 * cuarta dice *«está fuera porque este espejo no llega»*, y **ésa es la única
 * que cuenta como hueco**. Con `lh-spec` vale **69**; con `lh-espejo`, **0** —
 * y ese contraste es justo lo que un `noMide` sin número no podía expresar.
 *
 * ⚠ Y el `null` NO es dead code: se reserva para el caso que rebucketearía todo
 * en silencio — que `lh-serie` renombre `vacia` o `n`. Sin esta comprobación,
 * un `vacia` ausente haría `!undefined === true` y **las 65 vacías saldrían como
 * «el espejo no las trae»**: un hueco de 65 inventado, con cara de dato
 * (§sondas 4, el pleno que parece un hallazgo).
 */
const porQueFuera = (p) => {
  if (typeof p.vacia !== "boolean" || typeof p.n !== "number") return null;
  const serie = aClave(p.serie);
  if (noPagina.has(serie) && p.n >= 2) return "D2.4·duplicado";
  if (noPagina.has(serie) && p.n === 1 && p.vacia) return "B·sin-decisión";
  if (p.vacia) return "D2.5·vacía";
  return "espejo·no-la-trae";
};
/** El sabotaje le quita `vacia` a UNA página: el campo renombrado, que es el
 *  fallo que rebucketearía las 65 en silencio. */
const conSabotajeDeFrontera = (p) =>
  SABOTAJE === "frontera-sin-explicar" && p.clave === paginasUniverso.find((x) => x.vacia)?.clave ? { ...p, vacia: undefined } : p;
const fuera = paginasUniverso
  .filter((p) => !universoCmp.has(p.clave))
  .map((p0) => {
    const p = conSabotajeDeFrontera(p0);
    return { ...p0, frontera: porQueFuera(p) };
  });
const sinFrontera = fuera.filter((p) => !p.frontera);
if (sinFrontera.length)
  throw new Error(
    `${sinFrontera.length} página(s) FUERA del comparador sin frontera que lo explique:\n` +
      sinFrontera.slice(0, 12).map((p) => `    · ${p.clave}  (n=${p.n}, vacia=${p.vacia}, clase=${p.clase})`).join("\n") +
      `\n  Los campos que el reparto necesita son \`n\` y \`vacia\` de lh-serie. Si uno de los\n` +
      `  dos cambió de nombre, TODAS las vacías caerían en «el espejo no las trae»: un\n` +
      `  hueco inventado con cara de dato. No se mete en un cubo por defecto (§regla 6).`,
  );
/* La suma tiene que cuadrar con la unidad de arriba: 149 = comparadas + fuera. */
if (vistas.length + fuera.length !== paginasUniverso.length)
  throw new Error(`el reparto no cuadra: ${vistas.length} + ${fuera.length} ≠ ${paginasUniverso.length}`);

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
    /**
     * ⚠ **EL REPARTO DE LO QUE NO SE COMPARA, POR POSICIÓN Y POR FRONTERA
     * (§regla 14).** Sin él, `última 4 de 28` se lee como **24 de hueco**; con
     * él se ve que las 24 están fuera **por dos decisiones ya firmadas** y que
     * el hueco es **0**.
     */
    /**
     * ⚠ **EL ÚNICO NÚMERO DE ESTE REPARTO QUE ES UN HUECO: `espejo·no-la-trae`.**
     * Las otras tres fronteras son decisiones firmadas; ésta es el alcance. Con
     * el espejo de FORMAS (13, todas la 1.ª) vale **69**; con el de PÁGINAS,
     * **0** — y hasta hoy la diferencia entre las dos cosas no tenía número.
     */
    fueraPorFrontera: cuenta(fuera.map((p) => p.frontera)),
    fueraQueEsHueco: fuera.filter((p) => p.frontera === "espejo·no-la-trae").length,
    fueraPorPosicionYFrontera: Object.fromEntries(
      ["primera", "intermedia", "última"].map((pos) => [
        pos,
        {
          delUniverso: paginasUniverso.filter((p) => p.pos === pos).length,
          compara: vistas.filter((p) => p.pos === pos).length,
          fuera: cuenta(fuera.filter((p) => p.pos === pos).map((p) => p.frontera)),
        },
      ]),
    ),
    fronteras: FRONTERAS,
    /**
     * ⚠⚠ **Y LA VUELTA QUE EXPLICA EL 4, QUE NO ES UN REPARTO SINO UN CAMBIO DE
     * UNIDAD: `pos` SE CALCULA SOBRE LA SERIE SERVIDA Y EL ESPEJO ES LA SERIE
     * CON CONTENIDO.**
     *
     * `última` en `lh-serie` significa *la última página **SERVIDA*** de la
     * serie, y en 22 de 35 series ésa es una página **vacía**. O sea que el 4 no
     * mide *«¿ve el comparador el final de una lista?»*: mide *«¿ve la última
     * página servida?»*, que es otra pregunta y **más estricta de lo que nadie
     * quería preguntar**.
     *
     * La que sí se quería preguntar —la del **resto de la división**, la fila
     * incompleta, el `next` ausente— es ésta: **¿está comparada la última página
     * CON CONTENIDO de cada serie?** Y esa respuesta es otra.
     *
     * Es §La causa común con el contenedor puesto en **la etiqueta**: `última`
     * absorbía la diferencia entre *última servida* y *última con contenido*.
     */
    ultimaConContenido: (() => {
      const series = Object.entries(SERIE.series ?? {}).map(([serie, s]) => {
        const ps = (s.paginas ?? []).slice().sort((a, b) => a.n - b.n);
        const conC = ps.filter((p) => !p.vacia);
        const ult = conC[conC.length - 1];
        return {
          serie,
          nPaginasServidas: ps.length,
          nPaginasConContenido: conC.length,
          ultimaConContenido: ult ? ult.n : null,
          ultimaServida: ps.length ? ps[ps.length - 1].n : null,
          comparada: ult ? universoCmp.has(aClave(ult.n === 1 ? serie : `${serie}/page/${ult.n}`)) : null,
        };
      });
      const conAlgo = series.filter((s) => s.ultimaConContenido !== null);
      const noComparadas = conAlgo.filter((s) => !s.comparada);
      const noComparadasCuyoDocSíEstá = noComparadas.filter(
        (s) => porQueFuera(paginasUniverso.find((x) => x.serie === s.serie && x.n === s.ultimaConContenido) ?? {}) === "D2.4·duplicado" && universoCmp.has(aClave(s.serie)),
      ).length;
      return {
        porQue: "`pos` se calcula sobre la serie SERVIDA; el espejo es la serie CON CONTENIDO. Son dos unidades y sólo una contesta «¿se ve el final de la lista?»",
        seriesDelUniverso: series.length,
        seriesConAlgunaPaginaConContenido: conAlgo.length,
        suUltimaConContenidoComparada: conAlgo.length - noComparadas.length,
        deEllas: conAlgo.length,
        /** En DOCUMENTOS y no en URL: un duplicado sirve el documento de la 1.ª. */
        suUltimaConContenidoComparadaEnDOCUMENTOS: conAlgo.length - noComparadas.length + noComparadasCuyoDocSíEstá,
        /* La frontera se DERIVA con el mismo `porQueFuera()` que el resto: escribirla
         * aquí a mano sería un número recordado al lado de uno derivado (§regla 9). */
        noComparadas: noComparadas.map((s) => {
          const p = paginasUniverso.find((x) => x.serie === s.serie && x.n === s.ultimaConContenido);
          const frontera = p ? porQueFuera(p) : "SIN LOCALIZAR";
          /* ⚠ Y la vuelta que cierra la pregunta: un `D2.4·duplicado` **no es un
           * documento distinto** —su canonical apunta a la página 1—, así que su
           * DOCUMENTO sí puede estar comparado aunque su URL no lo esté. Sin esto,
           * «28 de 30» se lee como 2 finales de lista sin mirar, y no lo son. */
          return {
            serie: s.serie,
            pagina: s.ultimaConContenido,
            frontera,
            suDocumentoSeCompara: frontera === "D2.4·duplicado" ? universoCmp.has(aClave(s.serie)) : false,
          };
        }),
        seriesSinNingunaPaginaConContenido: series.filter((s) => s.ultimaConContenido === null).map((s) => s.serie),
        /* Las series donde `última servida` y `última con contenido` NO son la
         * misma página: es el tamaño del malentendido, medido. */
        seriesDondeLasDosUltimasDIFIEREN: series.filter((s) => s.ultimaConContenido !== null && s.ultimaConContenido !== s.ultimaServida).length,
      };
    })(),
  },
  clases: {
    enElUniverso: clasesUniverso.size,
    queToca: clasesVistas.size,
    ciegas: clasesCiegas.length,
    paginasEnClasesCiegas,
    /**
     * ⚠ **QUÉ SON LAS CIEGAS, NOMBRADAS (§regla 14).** «toca 35 de 38» sin esto
     * se lee como cobertura casi completa **y como que las 3 que faltan son
     * formas sin construir**. No lo son: las tres empiezan por **`t0`** —cero
     * tarjetas— y su denominador es de páginas **sin cuerpo que medir**, cuyo
     * contrato es `P-LH-C7` (200 · canonical · `<title>`) y **no** la
     * comparación par a par que hace `lh-cmp`. Ensanchar el comparador **no las
     * cubriría**: hace falta otra sonda, y eso se dice aquí y no en una nota.
     */
    ciegasDetalle: clasesCiegas.map((c) => {
      const ps = paginasUniverso.filter((p) => p.clase === c);
      return {
        clase: c,
        formato: "t{tarjetas}·{piel}·{P|-}{N|-}·s{secciones}[·sb]  (lh-serie.mjs §clase)",
        paginas: ps.length,
        series: [...new Set(ps.map((p) => p.serie))].length,
        tarjetas: Number((/^t(\d+)/.exec(c) ?? [])[1]),
        conContenido: ps.filter((p) => !p.vacia).length,
        porFrontera: cuenta(ps.map((p) => porQueFuera(p) ?? "SIN FRONTERA")),
        seriesQueLaTraen: [...new Set(ps.map((p) => p.serie))],
      };
    }),
    queSonLasCiegas: (() => {
      const ps = paginasUniverso.filter((p) => clasesCiegas.includes(p.clase));
      const tar = [...new Set(clasesCiegas.map((c) => Number((/^t(\d+)/.exec(c) ?? [])[1])))];
      const porF = cuenta(ps.map((p) => porQueFuera(p) ?? "SIN FRONTERA"));
      const emite = EMITIDAS ? ps.filter((p) => EMITIDAS.has(`/${p.clave}`)).length : null;
      /* Las FAMILIAS de las formas del espejo, derivadas del prefijo de la clave
       * — la lista «L1 · L2 · …» escrita a mano envejecería contra el espejo. */
      const familias = [...new Set(FORMAS.map((F) => F.forma.split("-")[0]))].sort();
      return {
        paginas: ps.length,
        deUnUniversoDe: paginasUniverso.length,
        conContenido: ps.filter((p) => !p.vacia).length,
        tarjetasDeEsasClases: tar,
        porFrontera: porF,
        /* Las dos lecturas que hay que descartar EXPLÍCITAMENTE, porque son las
         * que uno da por buenas al leer «3 clases ciegas». Y se descartan con el
         * número derivado al lado, no con la palabra «no» (§regla 9). */
        noSon: {
          formasSinConstruir:
            `NO: las ${familias.length} familias del espejo (${familias.join(" · ")}) están TODAS dentro. ` +
            `Lo que falta son PÁGINAS de esas formas, no formas`,
          L4: `NO: L4 está en el universo del comparador (${FORMAS.filter((F) => F.forma.startsWith("L4")).length} forma[s]) y toca clase`,
        },
        decididoPor: Object.entries(porF)
          .map(([f, n]) => `${f} ${n}`)
          .join(" · "),
        /**
         * ⚠ **EL VEREDICTO SE DERIVA, PORQUE CAMBIA CON EL ESPEJO.** Con el de
         * PÁGINAS las ciegas son todas de cero tarjetas y el hueco es 0; con el
         * de FORMAS, 57 de sus páginas tienen contenido y **sí** son hueco. Una
         * frase fija diría lo primero en los dos casos — y sería falsa en uno,
         * en el titular, que es donde §regla 14 dice que gana.
         */
        veredicto:
          porF["espejo·no-la-trae"]
            ? `${porF["espejo·no-la-trae"]} de esas ${ps.length} páginas TIENEN CONTENIDO y este espejo no las trae: eso SÍ es hueco de alcance`
            : `todas de CERO tarjetas (t=${tar.join("/")}) y 0 con contenido: NO son formas sin construir ni L4, y lh-cmp no las cubriría ni ensanchado`,
        /* Y qué se ganaría ENSANCHANDO, que tampoco es lo mismo con los dos
         * espejos: lo que no tiene cuerpo no lo alcanza ningún comparador. */
        loQueNoCubre:
          `ensanchar lh-cmp alcanzaría ${porF["espejo·no-la-trae"] ?? 0} de estas ${ps.length}; las otras ` +
          `${ps.length - (porF["espejo·no-la-trae"] ?? 0)} NO tienen cuerpo que comparar y su contrato es P-LH-C7 ` +
          `(200 · canonical · <title>), no una comparación par a par. Hoy el clon emite ${emite ?? "?"} de ${ps.length}`,
        emiteElClon: emite,
      };
    })(),
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

/* §regla 14 · las dos líneas que el resumen se traga si no llevan su cardinal. */
const qs = alcanceReal.clases.queSonLasCiegas;
console.log(`\n  ── QUÉ SON LAS ${alcanceReal.clases.ciegas} CLASES CIEGAS (§regla 14: sin esto, «${alcanceReal.clases.queToca} de ${alcanceReal.clases.enElUniverso}» se lee como cobertura completa) ──`);
for (const c of alcanceReal.clases.ciegasDetalle)
  console.log(
    `  ${c.clase.padEnd(24)} ${String(c.paginas).padStart(3)} págs · ${String(c.series).padStart(2)} series · ` +
      `t=${c.tarjetas} tarjetas · con contenido ${c.conContenido} · ${JSON.stringify(c.porFrontera)}`,
  );
console.log(`  ⇒ ${qs.paginas} de ${qs.deUnUniversoDe} páginas · con contenido ${qs.conContenido} · ${JSON.stringify(qs.porFrontera)}`);
console.log(`     ${qs.veredicto}`);
console.log(`     ${qs.noSon.formasSinConstruir}`);
console.log(`     ${qs.noSon.L4}`);
console.log(`     ${qs.loQueNoCubre}`);

const uc = alcanceReal.paginas.ultimaConContenido;
console.log(`\n  ── POR QUÉ \`última\` ES ${alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0} Y NO ${alcanceReal.paginas.porPosicionDelUniverso["última"] ?? 0} (§regla 14) ──`);
for (const [pos, v] of Object.entries(alcanceReal.paginas.fueraPorPosicionYFrontera))
  console.log(`  ${pos.padEnd(11)} universo ${String(v.delUniverso).padStart(3)} · compara ${String(v.compara).padStart(3)} · fuera ${JSON.stringify(v.fuera)}`);
const firmadas = Object.fromEntries(Object.entries(alcanceReal.paginas.fueraPorFrontera).filter(([f]) => f !== "espejo·no-la-trae"));
console.log(
  `  ⇒ de las ${paginasUniverso.length - vistas.length} fuera, HUECO real (el espejo no las trae) = ${alcanceReal.paginas.fueraQueEsHueco}; ` +
    `las otras ${paginasUniverso.length - vistas.length - alcanceReal.paginas.fueraQueEsHueco} son decisiones firmadas: ${JSON.stringify(firmadas)}`,
);
console.log(
  `  ⇒ y ese ${alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0} NO mide «¿ve el final de la lista?»: \`pos\` se calcula sobre la serie SERVIDA.\n` +
    `     La última página CON CONTENIDO está comparada en ${uc.suUltimaConContenidoComparada} de ${uc.deEllas} series con contenido ` +
    `(de ${uc.seriesDelUniverso}; ${uc.seriesSinNingunaPaginaConContenido.length} no tienen ninguna).\n` +
    `     Las ${uc.noComparadas.length} que faltan: ${uc.noComparadas.map((s) => `${s.serie} p${s.pagina} [${s.frontera}${s.suDocumentoSeCompara ? ", su DOCUMENTO sí se compara" : ""}]`).join(" · ") || "—"}\n` +
    `     En DOCUMENTOS —un duplicado sirve el de la 1.ª— sale ${uc.suUltimaConContenidoComparadaEnDOCUMENTOS} de ${uc.deEllas}.\n` +
    `     Y en ${uc.seriesDondeLasDosUltimasDIFIEREN} series la última SERVIDA no es la última CON CONTENIDO: ahí estaba el malentendido.`,
);
console.log(
  `  piel B                 ${alcanceReal.pielB.instancias} instancias · ${alcanceReal.pielB.enElUniversoDelComparador} en su universo · ` +
    `${alcanceReal.pielB.realmenteComparadas ?? "?"} COMPARADAS · ${alcanceReal.pielB.separadorasComparadas ?? "?"} separadoras`,
);
console.log(`     ⚠ ${alcanceReal.pielB.veredicto}`);
console.log(`  ⚠ esto NO cierra el código de salida: es el CENSO del alcance, no la guarda del comparador.`);

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTRATO DE `Evaluadas`, APLICADO POR PÁGINA Y NO EN AGREGADO
 *
 * `Evaluadas` protege del verde por vaciado **en el total**: si el conjunto
 * rinde menos unidades de las declaradas, el veredicto no vale. Pero el total
 * es un CONTENEDOR (§La causa común) y **absorbe la página concreta**: 82
 * páginas pueden dar 10 000 pares con una de ellas aportando **cero**, y el
 * agregado ni se despeina.
 *
 * Y una página del universo que rinda **0 pares no sale limpia**: sale como
 * **candidata a un TERCER tipo de fantasma**, después de los 7 duplicados
 * (`/page/N` con canonical a la 1.ª) y de los 2 invisibles al filtro por
 * contenido. Puede ser un barrido que no encontró nada, un documento vacío o una
 * ruta que no es lo que el universo cree — y las tres son la misma salida si
 * nadie las separa.
 *
 * ⚠ **Y esto SÍ cierra el código de salida**, a diferencia del censo de
 * alcance en páginas de más abajo: aquél declara una limitación conocida, éste
 * dice que **una unidad del universo no se pudo medir**. No cuesta una corrida:
 * los pares ya están contados aquí, tres líneas más arriba.
 * ═════════════════════════════════════════════════════════════════════════ */
const MIN_PARES_POR_PAGINA = 1;
const sinPares = Object.entries(porForma).filter(([, v]) => v.pares < MIN_PARES_POR_PAGINA);
if (sinPares.length) {
  console.error(
    `\n❌ ${sinPares.length} página(s) del universo con MENOS de ${MIN_PARES_POR_PAGINA} par:\n` +
      sinPares.slice(0, 12).map(([k, v]) => `    · ${k}  (${v.pares} pares)`).join("\n") +
      `\n  Una página que rinde CERO pares no está limpia: es candidata a un TERCER tipo\n` +
      `  de fantasma —tras los duplicados y los invisibles al filtro— y el agregado la\n` +
      `  absorbe entera. El universo no se puede declarar hasta separarlas.`,
  );
  process.exitCode = 2;
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
      /**
       * ⚠ **§regla 14, las DOS mitades.** La primera —cada línea con su
       * cardinal— la cumplía ya la de arriba. La segunda es ésta: **qué SON esos
       * números**, porque «3 ciegas» y «última 4 de 28» se leen los dos como
       * hueco, y ninguno de los dos lo es.
       */
      `qué son las ${alcanceReal.clases.ciegas} clases CIEGAS: ${alcanceReal.clases.queSonLasCiegas.paginas} de ${alcanceReal.paginas.enElUniverso} páginas ` +
        `(t=${alcanceReal.clases.queSonLasCiegas.tarjetasDeEsasClases.join("/")} tarjetas, ${alcanceReal.clases.queSonLasCiegas.conContenido} con contenido, ` +
        `${JSON.stringify(alcanceReal.clases.queSonLasCiegas.porFrontera)}) — ${alcanceReal.clases.queSonLasCiegas.veredicto}. ` +
        `${alcanceReal.clases.queSonLasCiegas.noSon.formasSinConstruir}. ${alcanceReal.clases.queSonLasCiegas.noSon.L4}. ` +
        `${alcanceReal.clases.queSonLasCiegas.loQueNoCubre}`,
      `por qué \`última\` es ${alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0} y no ${alcanceReal.paginas.porPosicionDelUniverso["última"] ?? 0}: ` +
        `las ${(alcanceReal.paginas.porPosicionDelUniverso["última"] ?? 0) - (alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0)} que faltan salen ` +
        `${JSON.stringify(alcanceReal.paginas.fueraPorPosicionYFrontera["última"].fuera)} — de ellas HUECO ` +
        `${alcanceReal.paginas.fueraPorPosicionYFrontera["última"].fuera["espejo·no-la-trae"] ?? 0}, el resto decisiones firmadas. ` +
        `Y el ${alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0} no mide «¿ve el final de la lista?»: \`pos\` va sobre la serie SERVIDA y el espejo sobre la que tiene CONTENIDO ` +
        `(difieren en ${alcanceReal.paginas.ultimaConContenido.seriesDondeLasDosUltimasDIFIEREN} de ${alcanceReal.paginas.ultimaConContenido.seriesDelUniverso} series). ` +
        `Esa pregunta sale ${alcanceReal.paginas.ultimaConContenido.suUltimaConContenidoComparada} de ${alcanceReal.paginas.ultimaConContenido.deEllas}`,
      `las formas AUSENTES en el clon: el dominio EFECTIVO es universo − ausentes, y esta sonda no abre el clon — ` +
        `de las ${FORMAS.length} formas, ${FORMAS.filter((F) => construida(F.ruta) === true).length} tienen ruta emitida`,
      /**
       * ⚠ **LA LÍNEA QUE SEPARA LO QUE EL CRUCE PRUEBA DE LO QUE NO.**
       *
       * Que esta sonda y `qa:lh-cmp` den el mismo número **al par** prueba UNA
       * cosa: que **leen el mismo universo**. No prueba que el universo esté
       * bien — **los dos lo derivan del MISMO espejo**, así que concuerdan
       * igual de bien sobre una premisa falsa. Medido: los cruces de la 66.ª
       * (5 445) y de la 68.ª (10 707/10 714) salieron al par sobre un universo
       * que llevaba **7 fantasmas y 2 duplicados dentro**, y no se inmutaron.
       */
      `si el UNIVERSO es correcto: el cruce al par con qa:lh-cmp prueba que los dos leen EL MISMO (${FORMAS.length} formas · ${pares} pares), ` +
        `no que sea el bueno — los dos salen del mismo espejo. Quien lo verifica es la derivación de qa:lh-espejo ` +
        `(documentos − duplicados) con su guarda que los RECALCULA y su sabotaje \`duplicado-sin-marcar\` en rojo`,
    ],
    porQueMixto:
      "una magnitud MIXTA depende de la plantilla Y del contenido a la vez (alto, y, renglones, nTarjetas, " +
      "clases, marca). Contra el espejo absorbe la deriva del contenido; contra el corpus, la geometría de un " +
      "render sin hojas. La referencia que las arreglaría es una tercera —el corpus RENDERIZADO con sus hojas— " +
      "y construirla es una tanda, no un parámetro.",
  },
  universo: { formas: FORMAS.length, pares, ...total, verificables, pctMixto },
  /**
   * El TERCER apoyo del universo, y el único con canal propio: el contrato de
   * `Evaluadas` **por página**. Los otros dos —el cruce alcance↔comparador y la
   * derivación `documentos − duplicados`— comparten fichero con algo; éste
   * pregunta a cada página si rindió medida, que es una pregunta que ninguno de
   * los dos hace.
   */
  minParPorPagina: {
    minimo: MIN_PARES_POR_PAGINA,
    cumplen: FORMAS.length - sinPares.length,
    de: FORMAS.length,
    conCero: sinPares.map(([k, v]) => ({ clave: k, pares: v.pares })),
    queSignificaUnCero: "candidata a un TERCER tipo de fantasma, tras los duplicados y los invisibles al filtro por contenido",
    cierraElCodigo: true,
  },
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
  sinPares.length
    ? `⛔ ${FORMAS.length} formas censadas · ${pares} pares · ${sinPares.length} PÁGINA(S) CON CERO PARES — el universo no se puede declarar.\n`
    : `✅ ${FORMAS.length} formas censadas · ${pares} pares · ${verificables} verificables · ${total.mixta} MIXTOS (${pctMixto} %).\n` +
        `   min 1 par por página: ${FORMAS.length}/${FORMAS.length} lo cumplen.\n` +
        /**
         * ⚠ **§regla 14, mitad 2: «si la limitación cambia lo que una frase de
         * cierre afirma, se escribe TAMBIÉN en esa frase.»** El campo que declara
         * el límite y el titular que lo ignora conviven sin contradecirse a la
         * vista, y gana el titular. Así que el titular lo lleva dentro.
         */
        `   clases ${alcanceReal.clases.queToca}/${alcanceReal.clases.enElUniverso} — las ${alcanceReal.clases.ciegas} ciegas son ` +
        `${alcanceReal.clases.queSonLasCiegas.paginas} págs (${alcanceReal.clases.queSonLasCiegas.conContenido} con contenido, ${JSON.stringify(alcanceReal.clases.queSonLasCiegas.porFrontera)}): ` +
        `${alcanceReal.clases.queSonLasCiegas.veredicto}.\n` +
        `   última ${alcanceReal.paginas.porPosicionQueCompara["última"] ?? 0}/${alcanceReal.paginas.porPosicionDelUniverso["última"] ?? 0} — las que faltan ` +
        `${JSON.stringify(alcanceReal.paginas.fueraPorPosicionYFrontera["última"].fuera)}, de las que son HUECO ` +
        `${alcanceReal.paginas.fueraPorPosicionYFrontera["última"].fuera["espejo·no-la-trae"] ?? 0}; la última CON CONTENIDO sale ` +
        `${alcanceReal.paginas.ultimaConContenido.suUltimaConContenidoComparada}/${alcanceReal.paginas.ultimaConContenido.deEllas} series ` +
        `(${alcanceReal.paginas.ultimaConContenido.suUltimaConContenidoComparadaEnDOCUMENTOS}/${alcanceReal.paginas.ultimaConContenido.deEllas} en DOCUMENTOS).\n`,
);
/**
 * ⚠ **`process.exit(0)` a secas PISABA el ❌ de arriba**, que es el mismo
 * defecto que `lh-paginas` tiene documentado en su última línea: un descuadre
 * contado y luego **borrado en la salida** (§sondas 1, por la puerta de atrás).
 * Se sale explícito, pero **con el código que se haya calculado**.
 */
process.exit(process.exitCode ?? 0);
