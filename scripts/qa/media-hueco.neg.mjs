/**
 * TEST EN NEGATIVO de `media-hueco` — entero, cada sabotaje por SU invariante,
 * **y con control**.
 * Uso: npm run qa:media-hueco-neg
 *
 * Esta sonda produce un veredicto que **CIERRA una frontera del esquema sin
 * añadirle nada**: *«la caja pedida es PLANTILLA por encima del contenedor de
 * contenido y viaja dentro del campo rico por debajo ⇒ no entra nada»*. Un
 * veredicto que dice «no hay que modelar» es el más cómodo de dar y el más caro
 * de equivocar, así que tiene que **saber salir del otro lado**:
 *
 *   · `selector-muerto` — si las `<img>` se buscaran por un atributo que no
 *     existe, la sonda no vería ninguna y **eso se leería como «no varía»**.
 *     Tiene que salir por ERROR (regla 4, el cero);
 *   · `hueco-ubicuo` — un solo hueco para las 1 719 observaciones. Entonces la
 *     varianza deja de estar explicada por el hueco y el veredicto **VOLTEA a
 *     CAMPO**. Es la prueba de que el «SÍ» del control no es una constante de la
 *     sonda, y además la guarda del pleno tiene que gritar;
 *   · `hueco-circular` — el hueco incluye la caja pedida. Así *«la caja es
 *     función del hueco»* es verdad **por construcción**: es el defecto que haría
 *     verde cualquier corpus. Tiene que salir por ERROR;
 *   · `ancho-en-px` — **el defecto REAL de la primera corrida**, conservado: se
 *     mide el ancho renderizado en vez de la caja pedida, y con él se mezcla la
 *     anchura NATIVA de cada imagen (`size-large` da 1024 y 900 en el mismo
 *     hueco). El veredicto **VOLTEA a CAMPO** con 86 grupos falsos;
 *   · `sin-zona` — cuerpo y cascarón juntos. Las 7 excepciones, que viven todas
 *     **por debajo** del contenedor de contenido, se le imputan al cascarón y el
 *     veredicto **VOLTEA**. Es la prueba de que la frontera no es decorativa;
 *   · `transformacion-agresiva` — una T de más que borra el `srcset`. La mitad
 *     «viaja verbatim» deja de cumplirse. Sin este sabotaje, ese 311/311 podría
 *     ser el resultado de no haber aplicado nada.
 *
 * Y el **CONTROL**, que es la mitad que decide si los seis significan algo
 * (F2-1 §5): sin sabotaje, exit 0 y las dos mitades del veredicto en SÍ.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "atributo buscado por un nombre inexistente ⇒ PATRÓN MUERTO, nunca «la caja no varía»",
    salidaTiene: /PATRÓN MUERTO/,
  },
  {
    sabotaje: "hueco-ubicuo",
    exit: 2,
    porQue: "un solo hueco para todo ⇒ IDENTIFICADOR UBICUO, y el veredicto voltea a CAMPO",
    salidaTiene: /IDENTIFICADOR UBICUO/,
    comprueba: (d) =>
      d.veredicto?.esDelHuecoEnCascaron === false ? null : `esperaba esDelHuecoEnCascaron=false, salió ${d.veredicto?.esDelHuecoEnCascaron}`,
  },
  {
    sabotaje: "hueco-circular",
    exit: 2,
    porQue: "el hueco mira la caja de la propia <img> ⇒ «es función del hueco» sería verdad por construcción",
    salidaTiene: /IDENTIFICADOR CIRCULAR/,
  },
  {
    sabotaje: "ancho-en-px",
    exit: 0,
    porQue: "el ancho RENDERIZADO mezcla la anchura nativa ⇒ el veredicto VOLTEA (el defecto real de la 1.ª corrida)",
    comprueba: (d) =>
      d.veredicto?.esDelHuecoEnCascaron === false && d.intraPagina?.varianCascaron > 0
        ? null
        : `esperaba esDelHuecoEnCascaron=false con grupos de cascarón variando; salió ` +
          `${d.veredicto?.esDelHuecoEnCascaron} / ${d.intraPagina?.varianCascaron}`,
  },
  {
    sabotaje: "sin-zona",
    exit: 0,
    porQue: "cuerpo y cascarón juntos ⇒ las excepciones del contenido se le imputan al cascarón y el veredicto VOLTEA",
    comprueba: (d) =>
      d.veredicto?.esDelHuecoEnCascaron === false && d.entreInstancias?.varianCascaron > 0
        ? null
        : `esperaba esDelHuecoEnCascaron=false con pares de cascarón variando; salió ` +
          `${d.veredicto?.esDelHuecoEnCascaron} / ${d.entreInstancias?.varianCascaron}`,
  },
  {
    sabotaje: "transformacion-agresiva",
    exit: 0,
    porQue: "una T que borra el `srcset` ⇒ la supervivencia verbatim deja de cumplirse",
    comprueba: (d) =>
      d.veredicto?.sobreviveTodo === false && d.supervivencia?.srcsetSobreviven < d.supervivencia?.srcsetAntes
        ? null
        : `esperaba sobreviveTodo=false; salió ${d.veredicto?.sobreviveTodo} ` +
          `(${d.supervivencia?.srcsetSobreviven}/${d.supervivencia?.srcsetAntes})`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-hueco ════════\n`);
console.log(`  ${casos.length} sabotajes contra el veredicto que CIERRA la frontera + control\n`);

const ev = new Evaluadas({ nombre: "media-hueco-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* Todo por `corridaNegativa`: el desvío a `-neg-` lo pone NEG por construcción,
 * y borra `PISAR`/`SALIDA` del hijo. Una corrida negativa NO PUEDE pisar la
 * canónica (regla 5, cerrada en el sitio común). */
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "media-hueco.mjs")], env, timeout: 900_000 });

const ficheroDe = (etiqueta) => join(QA, nombreNeg("medidas/media-hueco.json", etiqueta));
const leeArtefacto = (etiqueta) => {
  const f = ficheroDe(etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};
const borraArtefacto = (etiqueta) => {
  const f = ficheroDe(etiqueta);
  if (existsSync(f)) rmSync(f);
};

for (const c of casos) {
  borraArtefacto(c.sabotaje);
  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = leeArtefacto(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(24)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(24)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
borraArtefacto("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!/NO ENTRA NADA EN EL ESQUEMA/.test(ctlOut))
  /* ⚠ FICHADO 2026-08-18 (83.ª) · §MEDIA-HUECO-T10-EN-LA-CADENA.
   * Este rojo NO es del negativo: es el control haciendo su trabajo. La sonda
   * corría reventada (le faltaba `ctx.mediaPublicada`), y al repararla resultó
   * que su veredicto ha VOLTEADO —de «NO ENTRA NADA EN EL ESQUEMA» (congelada
   * del 2026-08-04) a «el CUERPO no lo conserva», con 0/311—.
   *
   * El 0/311 está MEDIDO como artefacto de T10, que entró en
   * `TRANSFORMACIONES` después de aquella congelada: comparando la cadena con
   * y sin T10 sobre los mismos cuerpos salen **311 pares distintos y los 311
   * con los MISMOS anchos** — 0 pérdida real de la caja pedida. Lo que cambia
   * es el prefijo de la URL, que es justo para lo que T10 existe, y la
   * comparación «verbatim» lo cuenta como pérdida.
   *
   * NO se cablea el veredicto de hoy para poner esto en verde: eso escribiría
   * el artefacto en la guarda. Se deja rojo, con su número, hasta que se
   * decida en su tanda si la comparación tiene que ser de la CAJA (anchos +
   * sizes + width + size-) en vez de la cadena literal. Afecta a una decisión
   * publicada: `docs/ESQUEMA-CMS.md` §276. */
  malCtl =
    "el veredicto VOLTEÓ (0/311 srcset «no sobreviven») — FICHADO §MEDIA-HUECO-T10-EN-LA-CADENA: " +
    "medido, los 311 conservan los anchos y sólo cambia la URL que T10 localiza a propósito";
else {
  const d = leeArtefacto("control");
  if (!d) malCtl = "no congeló su medida";
  else if (d.veredicto?.esDelHuecoEnCascaron !== true) malCtl = "esDelHuecoEnCascaron ≠ true";
  else if (d.veredicto?.sobreviveTodo !== true) malCtl = "sobreviveTodo ≠ true";
  else if (d.entreInstancias?.varianCascaron !== 0) malCtl = `varianCascaron = ${d.entreInstancias?.varianCascaron}, esperaba 0`;
  else if (!(d.entreInstancias?.varianCuerpo > 0))
    malCtl =
      `varianCuerpo = ${d.entreInstancias?.varianCuerpo}. Si NADA variase en ningún sitio, «no varía en el ` +
      `cascarón» no diría nada: la sonda estaría midiendo un corpus sin varianza`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)      (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL      (sin sabotaje)      (${segCtl}s)  exit 0 · cascarón 0 · cuerpo >0 · verbatim`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-hueco · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} que cazan · control)\n` +
    (fallos === 0
      ? `   La sonda grita cuando su patrón no casa, cuando su identificador no discrimina\n` +
        `   y cuando es circular; y su veredicto VOLTEA por tres caminos distintos (la\n` +
        `   magnitud, la frontera y la cadena de transformación). El «no entra nada en el\n` +
        `   esquema» ya se puede citar: no es lo que la sonda contesta siempre.\n`
      : `   La frontera del ancho pedido NO se puede cerrar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
