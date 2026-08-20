/**
 * EL REPARTO POR CAUSA DE LAS DIFERENCIAS DE `lh-cmp` — tres cubos, no un total.
 * Uso: node scripts/qa/lh-cubos.mjs [1440|390]     (npm run qa:lh-cubos)
 * Negativos: node scripts/qa/lh-cubos.neg.mjs      (npm run qa:lh-cubos-neg)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ UN TOTAL NO SIRVE AQUÍ
 *
 * Entre la corrida del comparador del **2026-08-17** y la de hoy cambiaron
 * **DOS cosas a la vez y ninguna es el clon**:
 *
 *   1. **el ORIGINAL se movió** — el pie creció (+3 @1440 · +6.65 @390 en `L1`;
 *      +308.64 · +321.89 en `L2`), y con él las `y` del cascarón;
 *   2. **el INSTRUMENTO cambió** — `0bb9707` añadió `paginador.piezasTotales`
 *      y `3412c91` arregló los selectores de `titulo`, `meta` y `extracto`.
 *
 * Un «N pares distintos» suma los tres conjuntos y **sólo uno es del clon**.
 * §La causa común con el contenedor puesto en el recuento: un total absorbe
 * entera la pregunta de por qué difiere cada par.
 *
 * ── Cómo se atribuye, y por qué se puede ──────────────────────────────────
 * Los dos espejos están congelados y commiteados, así que **la causa se DERIVA**
 * en vez de razonarse: para cada par que hoy difiere se mira qué hacía ese
 * camino en el espejo CADUCADO.
 *
 * | cubo | condición | qué significa |
 * |---|---|---|
 * | **2 · INSTRUMENTO** | el camino es NUEVO o MOVIDO **y** cae en uno de los cuatro campos que tocaron los dos commits | el barrido mide algo que antes no medía. **Ni deriva ni defecto** |
 * | **1 · DERIVA** | el camino es nuevo o su valor MOVIÓ en el espejo, y no es del instrumento | el original cambió. **No es del clon** |
 * | **3 · CLON** | el camino existía y el espejo dice **lo mismo** que decía | la diferencia es enteramente del clon |
 *
 * ⚠ **El eje `contenido` NO se reparte por el espejo, y eso es la mitad que
 * engaña.** Su referencia es el CORPUS (§F3-LH-DOS-FOTOS), que no se ha movido,
 * así que un par de contenido que difiere hoy difería ayer **aunque el espejo se
 * haya movido en ese mismo camino**. Atribuirlo a la deriva sería la forma más
 * barata de vaciar el cubo 3 sin arreglar nada.
 *
 * ⚠⚠ **Y LAS MIXTAS SE REPARTEN APARTE, CON SU CARDINAL — porque si no, la
 * deriva SALE CERO Y PARECE QUE NO LLEGÓ (2026-08-18, 80.ª tanda).**
 *
 * La primera versión de esta sonda saltaba las mixtas con un `continue` —el
 * comparador las declara *sin referencia limpia* y no las cuenta como defecto—
 * y publicó **cubo 1 = 0** con el control diciendo que el espejo había movido
 * **299** caminos. Los dos números eran ciertos y juntos daban la lectura
 * falsa: *«la deriva no llega al clon»*.
 *
 * Lo que pasa es que **los caminos que la deriva movió son justo los de eje
 * MIXTO** — `esqueleto.cascaron.N.rect.{y,h}` y `pie.rect.h` son `y`/`h`, y
 * `ejeDe()` las clasifica mixtas por construcción. O sea que la deriva **sí
 * llega**, y llega entera al único cubo que el comparador no lee como defecto.
 *
 * **Decirlo es distinto de contarlo como defecto**, y las dos cosas hacen
 * falta: el reparto de las mixtas va en su propio bloque, con su número, y
 * **no** se suma a `paresRepartidos`. §regla 14: *una limitación sin su cardinal
 * se lee como una nota al pie* — y aquí la nota al pie era un cero.
 *
 * ⚠⚠ **Y el cubo 1 se parte en DOS, porque la mitad importa más que el total:**
 *
 *   1a · la deriva CREÓ el par   — antes el espejo decía lo que dice el clon.
 *                                  **Daño nuevo**: la única mitad que justifica
 *                                  recalibrar
 *   1b · la deriva lo MOVIÓ      — ya difería. Cambia la magnitud, no la
 *                                  existencia; casi siempre es una divergencia
 *                                  ya declarada
 *
 * **Sin ese corte, «la deriva toca 248 pares» y «la deriva rompió 248 pares» se
 * escriben igual y sólo la segunda justifica tocar el clon.**
 *
 * ── El control interno, que es lo que impide inventar deriva ──────────────
 * El cubo 1 se cruza contra una derivación **independiente**: cuántos caminos
 * se movieron entre los dos espejos **en las formas comparadas**, contados sin
 * mirar la congelada de `lh-cmp`. Si el reparto atribuyera a la deriva más
 * caminos de los que el espejo movió, estaría fabricándola — y la sonda cierra
 * su código de salida con eso.
 *
 * ⚠ Es un cruce **entre dos lecturas del mismo par de ficheros**, así que
 * §regla 15 aplica: prueba que las dos lecturas coinciden, **no** que los
 * espejos sean correctos. Lo segundo lo verifica `qa:lh-espejo` con su sabotaje.
 *
 * ── Lo que esta sonda NO hace ─────────────────────────────────────────────
 * · **no abre un navegador ni pide una URL**: cruza congeladas;
 * · no dice si el clon está bien — dice **de quién es cada diferencia**;
 * · no decide si recalibrar. Eso es una DECISIÓN y va a `DECISIONES.md`;
 * · **no ve los pares que la deriva RESOLVIÓ** salvo que se le pase
 *   `--antes=<congelada anterior>`; sin él, ese recuento sale `null` y no 0.
 *
 * ── El canal, declarado ───────────────────────────────────────────────────
 * Se miran **tres ficheros y sólo tres** (cuatro con `--antes=`). Un camino que
 * no esté en el espejo caducado **no se clasifica en silencio**: sale en
 * `sinClasificar` y cierra el código de salida.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aplana, IGNORAR } from "./lh-ejes.mjs";
import { eligeCongeladaAnterior, Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // cruza congeladas: un build del clon no la contamina
gritaSiRevienta();

const SABOTAJES = ["sin-viejo", "espejo-igual", "cmp-sin-diferencias"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const ARGS = process.argv.slice(2);
const ANCHO = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);
const arg = (n, d) => (ARGS.find((a) => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split("=").slice(1).join("=");

/**
 * ⚠ **Los ficheros se nombran por ARGUMENTO, nunca por fallback silencioso**
 * (§regla 6). Y §sondas 5: el nombre canónico de una congelada conserva la
 * PRIMERA foto, así que la corrida de hoy hay que nombrarla en vez de suponerla.
 *
 * ⚠⚠ **Y ESTE COMENTARIO AVISABA DEL ERROR EXACTO QUE EL CÓDIGO DE ABAJO
 * COMETÍA (corregido 2026-08-20, 87.ª tanda).** El defecto de `--cmp=` era
 * `medidas/lh-cmp-<ancho>-todas.json`, o sea **la canónica** — justo el fichero
 * que la línea de arriba dice que conserva la primera foto. Medido el día de la
 * corrección: esa canónica es del **2026-08-17** y publica `paresDistintos:
 * 6207` mientras la corrida del día daba **5423**. Correr `qa:lh-cubos` sin
 * argumento repartía por causa **una foto de tres días antes**, sin un aviso.
 *
 * Es §*documentado no es conectado* en su forma más pura: el comentario y el
 * defecto de la línea siguiente se contradicen, y gana el código.
 *
 * **El arreglo es §regla 9 en su 8.ª forma —derivar en vez de recordar—** y
 * reutiliza la función que la misma tanda escribió para el eje mixto: sin
 * `--cmp=`, se toma **la más reciente por `mtime`** (nunca por nombre: `-2.json`
 * ordena antes que `.json`) y **se dice cuál en la salida, con su fecha**. Los
 * artefactos de negativo y las `-CONTAMINADA` quedan fuera por §regla 7.
 */
const _autoCmp = eligeCongeladaAnterior(new RegExp(`^lh-cmp-${ANCHO}-todas(-\\d{4}-\\d{2}-\\d{2}(-\\d+)?)?\\.json$`));
const F_CMP = arg("cmp", _autoCmp.fichero ? `medidas/${_autoCmp.fichero}` : `medidas/lh-cmp-${ANCHO}-todas.json`);
const CMP_DERIVADO = !ARGS.some((a) => a.startsWith("--cmp="));
const F_NUEVO = arg("espejo", `medidas/lh-espejo-${ANCHO}.json`);
const F_VIEJO = SABOTAJE === "espejo-igual" ? arg("espejo", `medidas/lh-espejo-${ANCHO}.json`) : arg("viejo", `medidas/lh-espejo-${ANCHO}-SONDA-EXTRACTO-EN-2-FORMAS-DE-9.json`);
const F_ANTES = arg("antes", "");

const lee = (rel, que) => {
  const f = join(QA, rel);
  if (!existsSync(f))
    throw new Error(
      `FALTA ${que}: no existe ${rel}.\n` +
        `  Sin él no hay atribución posible, y su ausencia saldría como «0 pares de\n` +
        `  deriva» — un verde de una sonda que no miró (§sondas 4bis).`,
    );
  return JSON.parse(readFileSync(f, "utf8"));
};

const CMP = lee(F_CMP, "la congelada de lh-cmp");
const NUEVO = lee(F_NUEVO, "el espejo VIGENTE");
const VIEJO = SABOTAJE === "sin-viejo" ? { meta: { fecha: "«SABOTAJE: sin espejo caducado»" }, paginas: {} } : lee(F_VIEJO, "el espejo CADUCADO");

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CUATRO CAMPOS DEL INSTRUMENTO — derivados del `git diff`, no de memoria
 *
 * §regla 9 + §sondas 8b (2.ª mitad): *«qué cambió el instrumento» se deriva del
 * diff, nunca se recuerda*. La 79.ª nombró dos roles y eran tres, y los 273
 * pares del rol olvidado eran la mayoría del movimiento.
 *
 * **Y la ventana de la derivación es la que separa las DOS medidas que se van a
 * comparar**, no la del último commit que uno recuerda: los espejos son del
 * 2026-08-14 y del 2026-08-18, y
 * `git log --since=2026-08-14 -- scripts/qa/lh-barrido.mjs scripts/qa/lh-ejes.mjs`
 * devuelve **DOS** commits, no uno.
 *
 * ⚠ La lista va **con su commit al lado** para que la próxima ventana se pueda
 * auditar. Cambiarla sin cambiar el commit la vuelve un dato recordado.
 * ═════════════════════════════════════════════════════════════════════════ */
const CAMPOS_DEL_INSTRUMENTO = [
  { patron: /^paginador\.piezasTotales$/, campo: "paginador.piezasTotales", commit: "0bb9707", tanda: "75.ª" },
  { patron: /^listado\.tarjetas\.\d+\.titulo\./, campo: "titulo", commit: "3412c91", tanda: "78.ª" },
  { patron: /^listado\.tarjetas\.\d+\.meta(\.|$)/, campo: "meta", commit: "3412c91", tanda: "78.ª" },
  { patron: /^listado\.tarjetas\.\d+\.extracto(\.|$)/, campo: "extracto", commit: "3412c91", tanda: "78.ª" },
];
const delInstrumento = (c) => CAMPOS_DEL_INSTRUMENTO.find((x) => x.patron.test(c)) ?? null;

/* ══════════════════════════════════════════════════════════════════════════
 * EL CRUCE
 * ═════════════════════════════════════════════════════════════════════════ */
const cubos = {
  instrumento: { pares: 0, porCampo: {}, porForma: {} },
  deriva: { pares: 0, creados: 0, movidos: 0, porCaminoNuevo: 0, porCamino: {}, porForma: {} },
  clon: { pares: 0, porCamino: {}, porForma: {} },
};
/**
 * El MISMO reparto sobre los pares de eje MIXTO. No se suma a los tres cubos
 * —el comparador los declara sin referencia limpia— pero **se publica con su
 * cardinal**: es donde vive la deriva de esta tanda, y sin este bloque el cubo 1
 * sale 0 y se lee como «la deriva no llegó».
 */
const mixtas = {
  pares: 0,
  instrumento: 0,
  deriva: 0,
  derivaCrea: 0,
  derivaMueve: 0,
  clon: 0,
  derivaPorCamino: {},
  derivaPorForma: {},
  ejemplosDeriva: [],
  /**
   * ⚠ **Los CREADOS van nombrados uno a uno, no sólo contados.** Son la única
   * mitad de la deriva que significa daño nuevo, así que un cardinal suelto
   * («CREA 11») manda a la tanda siguiente a re-derivarlos — §regla 9 aplicada
   * a la propia salida de la sonda.
   */
  creados: [],
};
const sinClasificar = [];
const ejemplos = { instrumento: [], deriva1a: [], deriva1b: [], clon: [] };
const porForma = {};

const gen = (c) => c.replace(/\.\d+\./g, ".N.").replace(/\.\d+$/, ".N");
const sube = (o, k) => { o[k] = (o[k] || 0) + 1; };
const mete = (lista, x) => { if (lista.length < 6) lista.push(x); };

/** Las formas del `cmp` que el clon SÍ sirve — el universo de este reparto. */
const SERVIDAS = Object.entries(CMP.formas ?? {}).filter(([, v]) => v && v.estado !== "AUSENTE");

/* ── El CONTROL INDEPENDIENTE: cuántos caminos movió el espejo, contado sin
 *    mirar la congelada de `lh-cmp` ─────────────────────────────────────── */
let espejoMovioCaminos = 0;
for (const [clave] of SERVIDAS) {
  const a = VIEJO.paginas?.[clave];
  const b = NUEVO.paginas?.[clave];
  if (!a || !b) continue;
  const pa = aplana(a);
  const pb = aplana(b);
  for (const [c, v] of pb) {
    if (IGNORAR.has(c)) continue;
    if (!pa.has(c) || JSON.stringify(pa.get(c)) !== JSON.stringify(v)) espejoMovioCaminos++;
  }
}

const ev = new Evaluadas({
  nombre: `lh-cubos@${ANCHO}`,
  unidad: "formas del comparador repartidas",
  /* Se DERIVA de la congelada que se reparte: si mañana el clon emite una forma
     más, el listón sube solo (§regla 9, 7.º caso). Nunca escrito a mano. */
  minimo: Math.max(1, SERVIDAS.length),
});

for (const [clave, v] of SERVIDAS) {
  const nuevo = NUEVO.paginas?.[clave];
  if (!nuevo) { ev.fallo(clave, "la forma no está en el espejo VIGENTE"); continue; }
  const viejo = VIEJO.paginas?.[clave];
  const pN = aplana(nuevo);
  const pV = viejo ? aplana(viejo) : null;
  const f = (porForma[clave] = { distintosSegunCmp: v.distintos ?? 0, instrumento: 0, deriva1a: 0, deriva1b: 0, clon: 0, sinEspejoViejo: !pV });

  for (const d of v.diferencias ?? []) {
    const c = d.camino;
    if (IGNORAR.has(c)) continue;

    /* Sin la página en el espejo caducado no se puede atribuir NADA suyo: se
       nombra. Meterla en «del clon» por defecto sería §regla 6 en la guarda. */
    if (!pV) { sinClasificar.push(`${clave}::${c} — la página no está en el espejo caducado`); continue; }

    const caminoNuevo = !pV.has(c);
    const espejoMovio = !caminoNuevo && JSON.stringify(pV.get(c)) !== JSON.stringify(pN.get(c));
    /* ⚠ El eje `contenido` se mide contra el CORPUS: que el espejo se moviera en
       ese camino NO explica su diferencia. Sólo un camino NUEVO puede crear un
       par de contenido que antes no existía. */
    const laReferenciaEsElEspejo = d.contra !== "corpus";
    const ins = delInstrumento(c);

    /* ── Los MIXTOS: el MISMO reparto, en su propio bloque ──────────────────
       No son defecto por contrato del comparador (§ESCALÓN del eje mixto), así
       que no entran en los tres cubos. Pero **es aquí donde vive la deriva de
       esta tanda** —`rect.y`/`rect.h` son mixtas por construcción— y saltarlas
       con un `continue` publicaba `cubo 1 = 0` junto a un control que decía 299:
       dos números ciertos y una lectura falsa. */
    if (d.eje === "mixta") {
      mixtas.pares++;
      if (ins && (caminoNuevo || espejoMovio)) mixtas.instrumento++;
      else if (caminoNuevo || (espejoMovio && laReferenciaEsElEspejo)) {
        mixtas.deriva++;
        sube(mixtas.derivaPorCamino, gen(c));
        sube(mixtas.derivaPorForma, clave);
        if (!caminoNuevo && JSON.stringify(pV.get(c)) === JSON.stringify(d.clon)) {
          mixtas.derivaCrea++;
          mixtas.creados.push({ clave, camino: c, antes: pV.get(c), ahora: d.referencia, clon: d.clon });
        } else mixtas.derivaMueve++;
        mete(mixtas.ejemplosDeriva, { clave, camino: c, antes: caminoNuevo ? "«el camino no estaba»" : pV.get(c), ahora: d.referencia, clon: d.clon });
      } else mixtas.clon++;
      continue;
    }

    if (ins && (caminoNuevo || espejoMovio)) {
      cubos.instrumento.pares++;
      sube(cubos.instrumento.porCampo, ins.campo);
      sube(cubos.instrumento.porForma, clave);
      f.instrumento++;
      mete(ejemplos.instrumento, { clave, camino: c, campo: ins.campo, commit: ins.commit, espejo: d.referencia, clon: d.clon });
      continue;
    }

    if (caminoNuevo || (espejoMovio && laReferenciaEsElEspejo)) {
      cubos.deriva.pares++;
      sube(cubos.deriva.porCamino, gen(c));
      sube(cubos.deriva.porForma, clave);
      if (caminoNuevo) {
        /* Camino que el espejo no tenía: el par no podía existir. Es creación,
           pero por APARICIÓN, no porque un valor se moviera. Se cuenta aparte
           para no leerlo como «la deriva rompió algo que casaba». */
        cubos.deriva.porCaminoNuevo++;
        cubos.deriva.creados++;
        f.deriva1a++;
        mete(ejemplos.deriva1a, { clave, camino: c, antes: "«el camino no estaba»", ahora: d.referencia, clon: d.clon });
      } else {
        /* 1a vs 1b: ¿el par CASABA antes? El clon no ha cambiado entre las dos
           corridas, así que `d.clon` vale para las dos lecturas. */
        const casabaAntes = JSON.stringify(pV.get(c)) === JSON.stringify(d.clon);
        if (casabaAntes) { cubos.deriva.creados++; f.deriva1a++; mete(ejemplos.deriva1a, { clave, camino: c, antes: pV.get(c), ahora: d.referencia, clon: d.clon }); }
        else { cubos.deriva.movidos++; f.deriva1b++; mete(ejemplos.deriva1b, { clave, camino: c, antes: pV.get(c), ahora: d.referencia, clon: d.clon }); }
      }
      continue;
    }

    cubos.clon.pares++;
    sube(cubos.clon.porCamino, gen(c));
    sube(cubos.clon.porForma, clave);
    f.clon++;
    mete(ejemplos.clon, { clave, camino: c, eje: d.eje, contra: d.contra, referencia: d.referencia, clon: d.clon });
  }
  ev.ok(1);
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS PARES QUE LA DERIVA RESOLVIÓ — sólo con `--antes=`
 *
 * No se pueden leer de la congelada de hoy: **ya no están**. Sin la anterior el
 * recuento sale `null`, nunca 0 — «no hubo» y «no miré» no pueden imprimirse
 * igual (§regla del cero).
 * ═════════════════════════════════════════════════════════════════════════ */
let resueltos = null;
let difAntes = null;
if (F_ANTES) {
  const A = lee(F_ANTES, "la congelada ANTERIOR de lh-cmp");
  const hoyDif = new Set();
  for (const [clave, v] of Object.entries(CMP.formas ?? {}))
    for (const d of v?.diferencias ?? []) if (d.eje !== "mixta") hoyDif.add(`${clave}::${d.camino}`);
  resueltos = 0;
  difAntes = 0;
  for (const [clave, v] of Object.entries(A.formas ?? {})) {
    if (!v || v.estado === "AUSENTE") continue;
    for (const d of v.diferencias ?? []) {
      if (d.eje === "mixta") continue;
      difAntes++;
      if (!hoyDif.has(`${clave}::${d.camino}`)) resueltos++;
    }
  }
}

const informe = {
  meta: {
    fecha: hoy(),
    que: `REPARTO POR CAUSA de las diferencias de lh-cmp @${ANCHO} — tres cubos, no un total`,
    ancho: ANCHO,
    cmpDerivadoPorMtime: CMP_DERIVADO ? { candidatas: _autoCmp.candidatas, mtime: _autoCmp.fecha } : false,
    canales: { cmp: F_CMP, espejoVigente: F_NUEVO, espejoCaducado: F_VIEJO, cmpAnterior: F_ANTES || "«no se pasó --antes=»" },
    fechas: { cmp: CMP.meta?.fecha ?? "?", espejoVigente: NUEVO.meta?.fecha ?? "?", espejoCaducado: VIEJO.meta?.fecha ?? "?" },
    ventanaDeLaDerivacion: "2026-08-14 → 2026-08-18: la que separa los DOS espejos, no la del último commit",
    camposDelInstrumento: CAMPOS_DEL_INSTRUMENTO.map((c) => ({ campo: c.campo, commit: c.commit, tanda: c.tanda })),
    noMide: [
      "el clon: no abre navegador ni pide una URL — cruza congeladas",
      "si el clon está BIEN: dice de quién es cada diferencia, no si es defecto",
      `los pares MIXTOS del comparador: sin referencia limpia (§ESCALÓN), no se reparten`,
      F_ANTES ? null : "los pares que la deriva RESOLVIÓ: sin `--antes=` salen `null`, no 0",
      "el TOPE de `diferencias` del comparador (400 por forma): lo que se reparte es lo que la congelada lista",
    ].filter(Boolean),
  },
  resumen: {
    formasRepartidas: ev.n,
    paresRepartidos: cubos.instrumento.pares + cubos.deriva.pares + cubos.clon.pares,
    cubo2_instrumento: cubos.instrumento.pares,
    cubo1_deriva: cubos.deriva.pares,
    cubo1a_derivaCREA: cubos.deriva.creados,
    cubo1b_derivaMUEVE: cubos.deriva.movidos,
    cubo1a_deElloPorCaminoNuevo: cubos.deriva.porCaminoNuevo,
    cubo3_delClon: cubos.clon.pares,
    /* ⚠ FUERA de `paresRepartidos` a propósito: el comparador los declara sin
       referencia limpia. Van con su cardinal porque es donde cae la deriva. */
    mixtas_paresQueDifieren: mixtas.pares,
    mixtas_instrumento: mixtas.instrumento,
    mixtas_deriva: mixtas.deriva,
    mixtas_derivaCREA: mixtas.derivaCrea,
    mixtas_derivaMUEVE: mixtas.derivaMueve,
    mixtas_delClon: mixtas.clon,
    resueltosPorLaDeriva: resueltos,
    paresDistintosEnLaCorridaANTERIOR: difAntes,
    sinClasificar: sinClasificar.length,
    control_caminosQueElEspejoMovio: espejoMovioCaminos,
  },
  cubos,
  mixtas,
  porForma,
  ejemplos,
  sinClasificar: sinClasificar.slice(0, 40),
};

console.log(`\n════════ LISTADOS · REPARTO POR CAUSA @${ANCHO} ════════`);
console.log(
  `  cmp         ${F_CMP} (${informe.meta.fechas.cmp})` +
    (CMP_DERIVADO
      ? `   ← DERIVADA por mtime de ${_autoCmp.candidatas} candidata(s), mtime ${_autoCmp.fecha}. NUNCA por nombre ni por la canónica (§sondas 5: la canónica es la PRIMERA foto)`
      : `   ← nombrada con --cmp=`),
);
console.log(`  espejo      ${F_NUEVO} (${informe.meta.fechas.espejoVigente})   ← VIGENTE`);
console.log(`  caducado    ${F_VIEJO} (${informe.meta.fechas.espejoCaducado})`);
console.log(`  instrumento ${CAMPOS_DEL_INSTRUMENTO.map((c) => `${c.campo}(${c.commit})`).join(" · ")}`);
console.log(`  formas      ${SERVIDAS.length} servidas de ${Object.keys(CMP.formas ?? {}).length}\n`);
console.log(`  ── los tres cubos, en la unidad que compara: el PAR ──`);
console.log(`  cubo 2 · INSTRUMENTO   ${String(cubos.instrumento.pares).padStart(6)}   ${JSON.stringify(cubos.instrumento.porCampo)}`);
console.log(`  cubo 1 · DERIVA        ${String(cubos.deriva.pares).padStart(6)}   CREA ${cubos.deriva.creados} (de ellos ${cubos.deriva.porCaminoNuevo} por camino nuevo) · MUEVE ${cubos.deriva.movidos}`);
console.log(`  cubo 3 · DEL CLON      ${String(cubos.clon.pares).padStart(6)}   ← el único que es del clon`);
console.log(`  resueltos por la deriva ${resueltos === null ? "   n/d (sin --antes=)" : String(resueltos).padStart(5)}`);
console.log(`  sin clasificar         ${String(sinClasificar.length).padStart(6)}`);
console.log(`  control · caminos que el espejo movió en estas formas: ${espejoMovioCaminos}`);
console.log(`\n  ── y los MIXTOS, repartidos igual y FUERA del recuento (sin referencia limpia) ──`);
console.log(
  `  mixtos que difieren    ${String(mixtas.pares).padStart(6)}   instrumento ${mixtas.instrumento} · ` +
    `DERIVA ${mixtas.deriva} (CREA ${mixtas.derivaCrea} · MUEVE ${mixtas.derivaMueve}) · del clon ${mixtas.clon}`,
);
for (const [k, n] of Object.entries(mixtas.derivaPorCamino).sort((a, b) => b[1] - a[1]).slice(0, 6)) console.log(`   ${String(n).padStart(5)}  ${k}   ← deriva, eje mixto`);
if (mixtas.creados.length) {
  console.log(`\n  ── los ${mixtas.creados.length} pares que la deriva CREÓ (antes casaban), uno a uno ──`);
  for (const c of mixtas.creados) console.log(`   ${c.clave.split("::")[1]}  ${c.camino}   ${c.antes} → ${c.ahora}   (clon ${c.clon})`);
}
console.log(`\n  ── el cubo 3, por camino (top 12) ──`);
for (const [k, n] of Object.entries(cubos.clon.porCamino).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`   ${String(n).padStart(5)}  ${k}`);
console.log(`\n  ── el cubo 1, por camino (top 8) ──`);
for (const [k, n] of Object.entries(cubos.deriva.porCamino).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`   ${String(n).padStart(5)}  ${k}`);

w(`medidas/lh-cubos-${ANCHO}.json`, informe);

const rojos = [];
if (sinClasificar.length) rojos.push(`${sinClasificar.length} par(es) SIN CLASIFICAR: ${sinClasificar.slice(0, 2).join(" ;; ")}`);
if (ev.fallos.length) rojos.push(`${ev.fallos.length} forma(s) sin su página en el espejo vigente`);
/* §sondas 8a · un reparto que no reparte no es un reparto: si los dos espejos
   fueran el mismo fichero, todo caería en «del clon» y el verde sería el de no
   haber mirado. */
if (espejoMovioCaminos === 0)
  rojos.push("el espejo NO movió ni un camino en las formas servidas: o los dos ficheros son el mismo, o el cruce no está mirando");
/* El control independiente: no se puede atribuir a la deriva más de lo que el
   espejo movió. Si esto salta, el reparto la está fabricando. Cuenta las dos
   mitades —los cubos y las mixtas— porque las dos salen del mismo movimiento. */
if (cubos.deriva.pares + mixtas.deriva > espejoMovioCaminos)
  rojos.push(`deriva atribuida (${cubos.deriva.pares} + ${mixtas.deriva} mixtas) > caminos que el espejo movió (${espejoMovioCaminos}): el reparto está INVENTANDO deriva`);
/* ⚠ Y el simétrico, que es el que la PRIMERA versión de esta sonda necesitaba:
   si el espejo movió caminos y **nada** los recoge —ni cubo, ni mixta, ni un
   par resuelto—, el reparto no está mirando donde la deriva cayó, y su cero se
   lee como «la deriva no llegó al clon». Es la §regla del cero aplicada a la
   ATRIBUCIÓN en vez de a un selector. */
if (espejoMovioCaminos > 0 && cubos.deriva.pares === 0 && mixtas.deriva === 0 && !resueltos)
  rojos.push(
    `el espejo movió ${espejoMovioCaminos} caminos y la atribución recoge CERO (cubos 0 · mixtas 0 · resueltos ${resueltos ?? "n/d"}): ` +
      "el reparto no está mirando donde la deriva cae",
  );

console.log(
  rojos.length === 0
    ? `\n✅ ${informe.resumen.paresRepartidos} pares repartidos en 3 cubos · ${ev.n} formas · 0 sin clasificar.\n` +
        `   Sólo el cubo 3 (${cubos.clon.pares}) es del clon. Control: el espejo movió ${espejoMovioCaminos} caminos.\n`
    : `\n❌ ${rojos.length} problema(s):\n${rojos.map((r) => `     · ${r}`).join("\n")}\n`,
);
process.exit(rojos.length === 0 ? 0 : 1);
