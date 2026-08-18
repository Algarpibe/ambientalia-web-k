/**
 * TEST EN NEGATIVO de `lh-cubos`.
 * Uso: npm run qa:lh-cubos-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTA SONDA NO COMPARA: ATRIBUYE. Y su modo de fallo no es un Δ0 falso — es
 * **decir que la deriva no llegó**, que es exactamente la salida que se obtiene
 * sin mirar. Los tres sabotajes son las tres formas de llegar ahí:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | reparte los pares en 3 cubos + las mixtas, con su control independiente | «no hay deriva», que es lo que sale del cruce que no mira |
 * | `sin-viejo` | **todo SIN CLASIFICAR**: sin el espejo caducado no hay atribución | meterlo todo en «del clon» por defecto (§regla 6) |
 * | `espejo-igual` | **el espejo no movió NADA**: los dos ficheros son el mismo | un reparto que no reparte saliendo verde |
 * | `cmp-sin-diferencias` | el **contrato de `Evaluadas`**: 0 formas < mínimo | «0 pares del clon» leído como un clon limpio (§sondas 4bis) |
 *
 * ⚠ **`espejo-igual` es el que protege del daño de verdad.** Si alguien apunta
 * los dos `--espejo=` al mismo fichero —o el caducado se pierde y alguien
 * «arregla» el comando—, los cubos 1 y 2 salen 0, TODO cae en «del clon» y el
 * informe dice *«la deriva no llegó»* con la cara de una medida. La guarda del
 * control independiente lo caza sin depender de que nadie se acuerde de mirar.
 *
 * ⚠ Y el control comprueba **lo que la primera versión de la sonda no hacía**:
 * que las **MIXTAS estén repartidas y publicadas con su cardinal**. Saltándolas
 * con un `continue`, esta sonda publicó `cubo 1 = 0` junto a un control que
 * decía 299 caminos movidos — dos números ciertos y una lectura falsa. El
 * negativo lo exige explícitamente para que no pueda volver.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-cubos-1440.json";
const SONDA = join(QA, "lh-cubos.mjs");

/* El `cmp` y el `antes` se nombran aquí para que el negativo no dependa del
   fichero por defecto, que cambia de nombre con cada corrida (§sondas 5). */
const CMP = "medidas/lh-cmp-1440-todas-2026-08-18.json";
const ANTES = "medidas/lh-cmp-1440-todas-2026-08-17-4.json";
const ARGS = ["1440", `--cmp=${CMP}`, `--antes=${ANTES}`];

/** Un `cmp` de mentira: todas las formas AUSENTES ⇒ 0 formas que repartir. */
const CMP_VACIO = "medidas/lh-cubos-neg-cmp-sin-diferencias.json";
import { writeFileSync } from "node:fs";
writeFileSync(
  join(QA, CMP_VACIO),
  JSON.stringify({ meta: { fecha: "«artefacto de negativo»" }, formas: { "L1-blog::/es/blog/": { estado: "AUSENTE" } } }, null, 2),
);

const casos = [
  {
    etiqueta: "control",
    porQue: "reparte en 3 cubos + mixtas, con el control independiente del espejo",
    args: ARGS,
    exit: 0,
    salidaTiene: /pares repartidos en 3 cubos/,
    comprueba: (j) => {
      const r = j.resumen;
      if (!r) return "sin bloque `resumen`";
      if (r.sinClasificar !== 0) return `${r.sinClasificar} pares sin clasificar`;
      if (!(r.control_caminosQueElEspejoMovio > 0))
        return "el control dice que el espejo no movió NADA: los dos espejos son el mismo fichero y el reparto no reparte";
      if (r.cubo1_deriva + r.cubo2_instrumento + r.cubo3_delClon !== r.paresRepartidos)
        return "los tres cubos no suman `paresRepartidos`: hay pares que se pierden por el camino";
      if (r.cubo1a_derivaCREA + r.cubo1b_derivaMUEVE !== r.cubo1_deriva)
        return "1a + 1b ≠ cubo 1: el corte que decide si la deriva CREA o sólo MUEVE no cuadra";
      /* ⚠ La mitad que la primera versión no tenía: sin el reparto de las
         MIXTAS, `cubo 1 = 0` se lee como «la deriva no llegó al clon». */
      if (typeof r.mixtas_deriva !== "number")
        return "sin `mixtas_deriva`: los caminos que la deriva mueve son de eje MIXTO, y sin su cardinal el cubo 1 sale 0 y se lee como que no llegó";
      if (!(r.mixtas_deriva > 0))
        return "mixtas_deriva = 0 con el espejo movido: o el reparto no mira las mixtas, o la deriva no cayó donde el control dice";
      if (r.mixtas_derivaCREA + r.mixtas_derivaMUEVE !== r.mixtas_deriva)
        return "las mixtas no cuadran su propio corte CREA/MUEVE";
      /* Los creados van NOMBRADOS, no sólo contados (§regla 9 sobre la salida). */
      if (!Array.isArray(j.mixtas?.creados) || j.mixtas.creados.length !== r.mixtas_derivaCREA)
        return "`mixtas.creados` no lista los pares creados: un cardinal suelto manda a la tanda siguiente a re-derivarlos";
      if (r.cubo1_deriva + r.mixtas_deriva > r.control_caminosQueElEspejoMovio)
        return "se atribuye a la deriva más caminos de los que el espejo movió: el reparto la está inventando";
      if (r.resueltosPorLaDeriva === null)
        return "`resueltosPorLaDeriva` a null con `--antes=` dado: el recuento no se hizo";
      if (!j.meta?.camposDelInstrumento?.length)
        return "sin la lista de campos del instrumento CON SU COMMIT: sería un dato recordado (§regla 9)";
      if (!j.meta?.noMide?.length)
        return "sin `noMide`: una sonda de atribución que no declara su alcance es la propia trampa que persigue";
      return null;
    },
  },
  {
    etiqueta: "sin-viejo",
    porQue: "sin el espejo caducado no hay atribución posible: TODO sale sin clasificar, no «del clon»",
    args: ARGS,
    env: { SABOTAJE: "sin-viejo" },
    exit: 1,
    salidaTiene: /SIN CLASIFICAR/,
    prohibidoEnSalida: /pares repartidos en 3 cubos/,
  },
  {
    etiqueta: "espejo-igual",
    porQue: "los dos espejos apuntando al mismo fichero ⇒ 0 movidos y todo cae en «del clon»: un reparto que no reparte",
    args: ARGS,
    env: { SABOTAJE: "espejo-igual" },
    exit: 1,
    salidaTiene: /el espejo NO movió ni un camino/,
    prohibidoEnSalida: /pares repartidos en 3 cubos/,
  },
  {
    etiqueta: "cmp-sin-diferencias",
    porQue: "un `cmp` con todo AUSENTE ⇒ 0 formas repartidas: lo para el contrato de Evaluadas, no un verde de 0 pares",
    args: ["1440", `--cmp=${CMP_VACIO}`],
    exit: 1,
    salidaTiene: /NO SE PUDO EVALUAR|evaluadas 0/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-cubos ════════`);
console.log(`  alcance: congeladas · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-cubos-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA, ...c.args], env: c.env ?? {}, timeout: 180_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  /* ⚠ Que caiga POR SU MOTIVO y no por el código de salida: si el rojo imprime
     la misma frase que el verde, el negativo no ha probado nada (§sondas 17). */
  if (!mal && c.prohibidoEnSalida && c.prohibidoEnSalida.test(out)) mal = `la salida contiene ${c.prohibidoEnSalida}, que es la frase del VERDE`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(22)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(22)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-cubos · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La atribución sale del CRUCE de tres congeladas y no del instrumento: sin el\n` +
        `   espejo caducado no clasifica nada, con los dos espejos iguales no reparte, y\n` +
        `   un comparador sin formas servidas lo para el contrato en vez de darlo verde.\n`
      : `   El reparto no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
