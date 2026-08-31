/**
 * TEST EN NEGATIVO de `productos-cmp`.
 * Uso: npm run qa:productos-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §regla 24 — **EL NEGATIVO DE UN COMPARADOR SE CORRE ANTES DE QUE EXISTA EL
 * LADO QUE VA A MEDIR.** Casi todas las preguntas de un negativo de comparador
 * —*¿compara o inventa? ¿sabe gritar? ¿tiene sus insumos?*— **no dependen del
 * lado que todavía no está acreditado**: se contestan copiando un lado sobre el
 * otro. Y la ganancia no es de calendario, es de ATRIBUCIÓN: cuando la corrida
 * de verdad exista, un rojo sólo puede ser suyo, porque el instrumento ya está
 * adjudicado.
 *
 * ── El modo de fallo de ESTE comparador ───────────────────────────────────
 * Es un comparador, así que su conclusión barata es **«0 distintos»**: sale
 * igual de un clon fiel que de una sonda que no mira, de un selector muerto o
 * de una captura sin estilo. Los tres casos atacan las tres, **con tres códigos
 * de salida distintos** para que un rojo futuro se pueda atribuir:
 *
 * | caso | tiene que caer por | y NO por |
 * |---|---|---|
 * | `mismo-lado` (control) | dar **0 distintos con los dos lados idénticos** | inventar diferencias |
 * | `inyecta-delta` | cazar un Δ **conocido** y **NOMBRARLO** con sus dos lados | cambiar el exit sin decir qué se movió |
 * | `sin-insumos` | los documentos ausentes ⇒ **corrida NULA** | publicar números plausibles de la nada |
 *
 * ⚠⚠ **`inyecta-delta` es el caso que §regla 21 (la vuelta) exige y que casi
 * nunca se escribe.** Sin objeto no hay defecto que ocultar, así que la pregunta
 * no es *«¿sabe callar?»* sino **«¿sabe gritar?»** — y un caso atado sólo al
 * código de salida caducaría el día que el objeto se ponga en verde.
 *
 * ⚠ **Los sabotajes van en el DATO, no en un umbral** (§regla 28): `sin-insumos`
 * hace que los documentos no existan —el modo de fallo real— en vez de bajar una
 * condición; y `inyecta-delta` mueve una ALTURA medida, no el criterio de
 * comparación.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "productos-cmp.mjs");
const CANONICA = "medidas/productos-cmp-1440.json";
const DELTA = "37.5";

const casos = [
  {
    etiqueta: "mismo-lado",
    porQue: "los dos lados IDÉNTICOS: tiene que dar 0 distintos, o el comparador inventa diferencias",
    env: { NEG_MISMO_LADO: "1" },
    /* ⚠ ESTE EXIT CAMBIÓ DE 2 A 0 EN LA MISMA TANDA, y no es acomodar la guarda
     * al defecto (§regla 21): es §regla 5ter — *arreglar el OBJETO caduca el
     * control del instrumento que lo midió*. Cuando se escribió, al lote le
     * faltaban 10 hojas `et-cache` y 1 imagen, así que la corrida MEDÍA pero NO
     * ACREDITABA y salía por 2. Capturadas las hojas y resuelta la imagen, los
     * tres canales cierran y el control pasa a salir por 0.
     *
     * Y el cambio MEJORA el poder discriminante en vez de rebajarlo: con los
     * canales abiertos los tres casos salían por 2, 2 y 3 —dos indistinguibles—;
     * ahora son **0 · 4 · 3**, tres códigos que sí atribuyen. */
    exit: 0,
    salidaTiene: /distintos: 0/,
    comprueba: (j) => {
      if (j.resumen.pares < 2) return `sólo ${j.resumen.pares} par(es): un comparador de un par no separa nada`;
      if (j.resumen.distintos !== 0) return `distintos ${j.resumen.distintos} ≠ 0 — con los dos lados iguales, inventa diferencias`;
      if (!j.resumen.ejesComparados) return `0 ejes comparados: el control no llegó a comparar NADA (§4bis, «0 comparado = verde»)`;
      if (j.resumen.huerfanasO || j.resumen.huerfanasC)
        return `huérfanas O=${j.resumen.huerfanasO} C=${j.resumen.huerfanasC} con los dos lados iguales — el emparejamiento pierde filas`;
      if (!j.meta.lado) return `la congelada no declara \`meta.lado\`: no se puede saber qué lados midió`;
      return null;
    },
  },
  {
    etiqueta: "inyecta-delta",
    porQue: `Δ CONOCIDO de ${DELTA} en el alto de una fila: tiene que cazarlo Y NOMBRARLO con sus dos lados`,
    env: { NEG_MISMO_LADO: "1", NEG_DELTA: DELTA },
    /* 4 = «hay ejes distintos», que es lo que un Δ inyectado TIENE que producir.
     * Antes era 2 por la misma razón que el caso de arriba (§regla 5ter). */
    exit: 4,
    /* No basta con que el exit cambie: se exige que el informe DIGA qué se movió
     * y con qué valores (§sondas 1 · un número de un par se cita con sus dos
     * lados). Un rojo mudo no adjudica nada. */
    salidaTiene: new RegExp(`h\\s+orig\\s+[\\d.]+\\s+→ clon\\s+[\\d.]+\\s+Δ\\+${DELTA}`),
    salidaNoTiene: /distintos: 0/,
    comprueba: (j) => {
      if (!j.resumen.distintos) return `distintos 0 con un Δ de ${DELTA} inyectado: NO SABE GRITAR`;
      const conDelta = j.informe.filter((i) => i.difs.some((d) => d.eje === "h" && Math.abs(d.delta - Number(DELTA)) < 0.01));
      if (conDelta.length !== j.informe.length)
        return `${j.informe.length - conDelta.length} de ${j.informe.length} rutas sin el Δ cazado en \`h\``;
      const sinLados = j.informe.flatMap((i) => i.difs).filter((d) => d.orig === undefined || d.clon === undefined);
      if (sinLados.length) return `${sinLados.length} diferencias publicadas SIN sus dos lados (§sondas 1)`;
      return null;
    },
  },
  {
    /* ⚠⚠ EL 4.º CASO (129.ª) — EL QUE ESTE MISMO NEGATIVO PEDÍA, Y EL ÚNICO
     * QUE EJERCITA EL SELECTOR DEL LADO CLON.
     *
     * Los tres de arriba usan NEG_MISMO_LADO, que COPIA el original sobre el
     * clon: el selector del clon —[data-fila], y desde la 129.ª [data-modulo]—
     * nunca se aplica a marcado del clon, así que tiene 0 instancias
     * separadoras en ellos (§regla 15, con lo compartido puesto en el MARCADO).
     * El bloque de límites de abajo lo declaraba y pedía exactamente este caso.
     *
     * Va CON SU CONTROL en la misma corrida, no contra una congelada previa: un
     * sabotaje sin control no prueba que la guarda pare, prueba que el
     * instrumento no la ejercita (§regla 8a).
     *
     * Y lo que se exige es la DIFERENCIA control/sabotaje, NO el código de
     * salida: aquí el exit es 4 en los dos lados —lo fija el eje de FILA, que
     * este sabotaje no toca— así que atarlo al exit sería atarlo a algo que no
     * mide lo que el caso afirma (§regla 21, la vuelta).
     *
     * ⚠ NECESITA EL CLON SERVIDO. `productos-cmp` lo levanta él mismo. */
    etiqueta: "selector-clon-falso",
    porQue: "el marcador del CLON no casa: el eje de modulos tiene que caer a 0 comparados, no seguir publicando",
    env: { NEG_SELECTOR_CLON_FALSO: "1" },
    conControl: true,
    exit: 4,
    comprueba: (j, ctrl) => {
      if (!ctrl) return "sin corrida de CONTROL: el sabotaje solo no prueba nada (§regla 8a)";
      const nCtrl = ctrl.resumen.modulos?.filasComparadas ?? 0;
      const nSab = j.resumen.modulos?.filasComparadas ?? 0;
      /* Si el control no compara ninguna fila, el caso está SIN PROBAR — y eso
       * cuenta como FALLO, no como verde: un SIN PROBAR en verde se lee como
       * probado (§regla 21, tercer caso). Se reporta con su denominador. */
      if (nCtrl === 0)
        return `el CONTROL compara 0 filas con marcador: 0 instancias separadoras, caso SIN PROBAR (denominador ${ctrl.resumen.pares} pares)`;
      if (nSab !== 0) return `con el selector roto sigue comparando ${nSab} filas: no las estaba leyendo del clon`;
      if ((j.resumen.modulos?.ejesComparados ?? 0) !== 0) return `ejes de modulo ${j.resumen.modulos.ejesComparados} != 0 con el selector roto`;
      /* Y el sabotaje tiene que ser ESPECÍFICO: si además tumbara el eje de
       * fila estaría midiendo otra cosa, y su caída no diría nada del marcador. */
      if (j.resumen.ejesComparados !== ctrl.resumen.ejesComparados)
        return `el sabotaje movió también el eje de FILA (${ctrl.resumen.ejesComparados} -> ${j.resumen.ejesComparados}): no es específico`;
      return null;
    },
  },
  {
    /* ⚠⚠ EL 5.º CASO (130.ª) — EL NIVEL DE ARRIBA, QUE LA 129.ª DEJÓ NOMBRADO.
     *
     * El 4.º rompe `[data-modulo]`. Éste rompe `[data-fila]`, y no es simetría
     * decorativa: el eje de FILA es el que da el TITULAR de esta sonda —los 43
     * ejes distintos que se citan— y hasta hoy **no tenía ni una instancia
     * separadora**. Los tres primeros casos usan `NEG_MISMO_LADO`, que copia el
     * original sobre el clon y por tanto nunca aplica el selector del clon a
     * marcado del clon; el 4.º sólo toca los módulos.
     *
     * Y escribirlo destapó que el modo de fallo daba VERDE: con 0 filas del
     * lado clon, `n = min(orig, clon)` vale 0, así que `comparados` y
     * `distintos` valen 0 y la sonda publicaba `EXIT 0 — sin diferencias`. El
     * contrato de `Evaluadas` no podía verlo porque su unidad es el PAR y las 4
     * rutas se recorrieron — §regla 14 con el nivel de arriba absorbiendo lo
     * que no se midió abajo. La guarda nueva sale por 6.
     *
     * El sabotaje es DEL DATO —un marcador que no casa, el modo de fallo real—
     * y no de un umbral (§regla 28a). Y antes de creérselo: hoy el lado medido
     * vale 27 filas de clon, así que romperlo tiene con qué morder. */
    etiqueta: "selector-fila-falso",
    porQue: "el marcador de FILA del clon no casa: la corrida tiene que declararse NULA, no publicar «sin diferencias»",
    env: { NEG_SELECTOR_FILA_FALSO: "1" },
    conControl: true,
    /* Atado al exit PROPIO de la guarda —6, no 4— porque el caso afirma
     * exactamente eso: que el motivo se puede ATRIBUIR (§regla 24). Un exit
     * compartido no diría cuál de los dos ejes cayó. */
    exit: 6,
    salidaTiene: /CORRIDA NULA — 0 ejes de FILA comparados/,
    /* La aserción que de verdad separa este caso del control: que NO se declare
     * limpio. Con 0 filas el recuento de distintos también es 0 —correctamente—
     * así que lo único que los separa es la guarda. */
    salidaNoTiene: /EXIT 0 — sin diferencias/,
    comprueba: (j, ctrl) => {
      if (!ctrl) return "sin corrida de CONTROL: el sabotaje solo no prueba nada (§regla 8a)";
      /* El control tiene que APORTAR, o el sabotaje no ejercita nada: si el
       * clon no aportara filas ya sin sabotear, el caso estaría SIN PROBAR — y
       * un SIN PROBAR en verde se lee como probado (§regla 21, tercer caso). */
      const filasCtrl = ctrl.informe.reduce((s, i) => s + i.filas.clon, 0);
      if (filasCtrl === 0)
        return `el CONTROL aporta 0 filas de clon: 0 instancias separadoras, caso SIN PROBAR (denominador ${ctrl.resumen.pares} pares)`;
      if (ctrl.resumen.ejesComparados === 0) return "el CONTROL no compara ejes de fila: nada que tumbar";
      /* Y el sabotaje tiene que caer POR SU MOTIVO: 0 filas de clon y 0 ejes.
       * Si cayera con filas > 0 estaría cayendo por otra cosa. */
      const filasSab = j.informe.reduce((s, i) => s + i.filas.clon, 0);
      if (filasSab !== 0) return `con el selector de fila roto el clon sigue aportando ${filasSab} filas: no las estaba leyendo de él`;
      if (j.resumen.ejesComparados !== 0) return `ejes de fila ${j.resumen.ejesComparados} != 0 con el selector roto`;
      /* Y es ESPECÍFICO del lado clon: el original no lo toca ningún sabotaje,
       * así que sus filas tienen que seguir intactas. Sin esto, un sabotaje que
       * tumbara los DOS lados pasaría igual y no diría nada del marcador. */
      const origCtrl = ctrl.informe.reduce((s, i) => s + i.filas.orig, 0);
      const origSab = j.informe.reduce((s, i) => s + i.filas.orig, 0);
      if (origSab !== origCtrl) return `el sabotaje movió también el lado ORIGINAL (${origCtrl} -> ${origSab} filas): no es específico del clon`;
      return null;
    },
  },
  {
    etiqueta: "sin-insumos",
    porQue: "los documentos del corpus ausentes: corrida NULA, no números plausibles de la nada",
    env: { NEG_MISMO_LADO: "1", NEG_SIN_INSUMOS: "1" },
    exit: 3,
    salidaTiene: /CORRIDA NULA/,
    /* ⚠ La aserción que de verdad importa: que NO se declare limpio. Con 0
     * documentos el recuento de distintos también sería 0 —correctamente—, así
     * que lo único que separa este caso del control es la guarda. */
    salidaNoTiene: /EXIT 0 — sin diferencias/,
    /* Sin insumos no hay congelada: comprobar el fichero sería exigirle que
     * escriba justo lo que su guarda impide. La aserción es la salida. */
  },
];

const ev = new Evaluadas({ nombre: "productos-cmp-neg", unidad: "casos", minimo: casos.length });
let fallos = 0;

console.log("═══ NEGATIVO de productos-cmp — 123.ª · ESCALÓN 1 (§regla 24)\n");
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const problemas = [];

  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperado ${c.exit})`);
  if (c.salidaTiene && !c.salidaTiene.test(salida)) problemas.push(`la salida no casa ${c.salidaTiene}`);
  if (c.salidaNoTiene && c.salidaNoTiene.test(salida))
    problemas.push(`la salida SÍ trae ${c.salidaNoTiene} — la conclusión barata se coló`);

  if (c.comprueba) {
    const ruta = join(QA, nombreNeg(CANONICA, c.etiqueta));
    if (!existsSync(ruta)) problemas.push(`no congeló ${nombreNeg(CANONICA, c.etiqueta)}`);
    else {
      /* ── el CONTROL, para los casos que lo necesitan ──────────────────────
       * Un caso cuya aserción es la DIFERENCIA entre control y sabotaje no
       * puede leerse sin las dos corridas (§regla 8a). Se corre la sonda SIN
       * sabotaje y se le pasa su congelada a `comprueba` como segundo
       * argumento. Los casos que no lo declaran no pagan esta corrida. */
      let ctrl = null;
      if (c.conControl) {
        /* El control es una corrida negativa etiquetada `-control` y SIN
         * sabotaje: `corridaNegativa` borra `SALIDA` a propósito —el desvío lo
         * pone `NEG`, no la disciplina de quien llama— así que ésta es la vía
         * sancionada para que el control tampoco pueda tocar una canónica. */
        const etCtrl = `${c.etiqueta}-control`;
        const rc = corridaNegativa({ etiqueta: etCtrl, args: [SONDA], env: {} });
        const rutaCtrl = join(QA, nombreNeg(CANONICA, etCtrl));
        if (!existsSync(rutaCtrl)) problemas.push(`el CONTROL de ${c.etiqueta} no congeló nada (exit ${rc.status}): sin él el sabotaje no prueba nada`);
        else ctrl = JSON.parse(readFileSync(rutaCtrl, "utf8"));
      }
      const m = c.comprueba(JSON.parse(readFileSync(ruta, "utf8")), ctrl);
      if (m) problemas.push(m);
    }
  }

  if (problemas.length) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(14)} ${c.porQue}`);
    problemas.forEach((p) => console.log(`       ${p}`));
  } else {
    console.log(`  ✅ ${c.etiqueta.padEnd(14)} ${c.porQue}`);
  }
  ev.ok();
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} ${casos.length - fallos}/${casos.length} — la conclusión BARATA («0 distintos») no se puede\n` +
    `   producir sin haber comparado: la tumban el Δ inyectado y la guarda de insumos.`,
);
console.log(`\n⚠ LO QUE ESTE NEGATIVO **NO** PRUEBA, con su cardinal (§regla 14):`);
console.log(`  · no prueba que el clon esté bien — no hay lado de clon en estos ${casos.length} casos.`);
console.log(`    Prueba que el INSTRUMENTO discrimina, que es otra afirmación;`);
console.log(`  · los ${casos.length} corren a 1440. El contrato de fidelidad es a los DOS anchos;`);
/* ⚠ ESTE BLOQUE SE RE-DERIVA DE `casos`, NO SE ESCRIBE. Hasta la 129.ª decía
 * «los 4 usan NEG_MISMO_LADO» y «FALTA un 4.º caso» — las dos frases eran
 * ciertas cuando se escribieron y las dos se volvieron FALSAS el día que ese
 * caso se añadió, sin dar error (§regla 5ter: arreglar el objeto caduca la
 * declaración del instrumento; §regla 9: un número escrito a mano envejece
 * CONTRA el repo, en silencio). */
const conMismoLado = casos.filter((c) => c.env?.NEG_MISMO_LADO).length;
const conClonReal = casos.filter((c) => !c.env?.NEG_MISMO_LADO).map((c) => c.etiqueta);
console.log(`  · ⚠ el límite de §regla 24, con su cardinal DERIVADO: ${conMismoLado} de ${casos.length} usan`);
console.log(`    NEG_MISMO_LADO, que COPIA el lado del original sobre el del clon,`);
console.log(`    así que en ellos el selector del LADO CLON no se aplica nunca a`);
console.log(`    marcado del clon: 0 instancias separadoras para él (§regla 15,`);
console.log(`    con lo compartido puesto en el MARCADO).`);
console.log(`  · ✅ y ${conClonReal.length} caso(s) SÍ lo ejercitan contra el clon servido:`);
console.log(`    ${conClonReal.join(", ")} — añadido en la 129.ª, que es cuando el clon`);
console.log(`    empezó a emitir \`data-modulo\`. Su aserción es la DIFERENCIA`);
console.log(`    control/sabotaje, no el exit: el exit lo fija el eje de FILA.`);
/* ⚠ EL ESTADO DEL EQUIVALENTE PARA `[data-fila]` SE DERIVA DE `casos`, NO SE
 * ESCRIBE — es la misma lección que el bloque de arriba, y es la que lo hizo
 * falso: hasta la 130.ª aquí decía «SIGUE FALTANDO», y esa frase se volvió
 * mentira el día que el caso se añadió, sin dar error (§regla 5ter). */
const rompenFila = casos.filter((c) => c.env?.NEG_SELECTOR_FILA_FALSO).map((c) => c.etiqueta);
const rompenModulo = casos.filter((c) => c.env?.NEG_SELECTOR_CLON_FALSO).map((c) => c.etiqueta);
if (rompenFila.length) {
  console.log(`  · ✅ y el equivalente para \`[data-fila]\` YA EXISTE (130.ª): ${rompenFila.join(", ")}`);
  console.log(`    — el de MÓDULO es ${rompenModulo.join(", ")}. Los dos niveles del lado`);
  console.log(`    clon quedan ejercitados, cada uno con su código de salida propio.`);
} else {
  console.log(`  · ⇒ FALTA el equivalente para \`[data-fila]\`: los sabotajes de selector`);
  console.log(`    (${rompenModulo.join(", ") || "ninguno"}) rompen el de MÓDULO, no el de fila. Si`);
  console.log(`    \`data-fila\` dejara de casar, estos ${casos.length} casos seguirían en verde.`);
}
console.log(`  · los canales del lote están CERRADOS (hojas 30/30, media 162/162,`);
console.log(`    y desde la 130.ª también los \`srcset\` remotos, que ganaban al \`src\`),`);
console.log(`    así que los casos salen por códigos distintos y un rojo se atribuye.`);
console.log(`  ✓ evaluadas ${casos.length}/${casos.length} casos`);
ev.informe();
process.exit(fallos === 0 ? 0 : 1);
