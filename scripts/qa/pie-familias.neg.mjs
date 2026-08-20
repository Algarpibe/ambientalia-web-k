/**
 * TEST EN NEGATIVO de `pie-familias`.
 * Uso: npm run qa:pie-familias-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTA SONDA NO MIDE: AGRUPA Y CUENTA. Su modo de fallo es **publicar un
 * modelo plausible con el `n` equivocado**, que es exactamente la trampa que
 * viene a cerrar: *una varianza cero con n = 1 no es varianza cero*.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | 4 familias ⇒ **3 pieles**, las 3 con n ≥ 2, partición estable | «hay 4 pies», que es lo que sale de mirar el total |
 * | `sin-espejo` | no existe el fichero ⇒ exit 2 antes de agrupar | agrupar 0 formas y llamarlo 0 familias |
 * | `mismo-espejo` | **los dos anchos leen el MISMO fichero** ⇒ el control sería vacuo | imprimir «✓ coinciden» sin haber comparado nada |
 * | `piel-mezclada` | una forma sirve **dos pies distintos** ⇒ «una familia por forma» es falso | repartirla en dos familias y seguir como si nada |
 *
 * ⚠ **`mismo-espejo` es el que protege del daño real.** El control de la sonda
 * es *«la partición coincide a los dos anchos»*; con un solo fichero eso se
 * cumple **por construcción**. Sería §regla 15 llevada al extremo —la premisa
 * compartida es el fichero mismo— y su salida es un ✓ que no ha comparado nada.
 *
 * ⚠ **`piel-mezclada` es el que valida el modelo.** Si una forma pudiera servir
 * dos pies, «piel por forma» no sería una función y el `Footer` no se podría
 * parametrizar por forma. El caso se fabrica **cambiando un solo `rect.h`** de
 * una página del espejo: si la sonda no lo nota, su partición no discrimina.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/pie-familias.json";
const SONDA = join(QA, "pie-familias.mjs");

/** Un espejo con UNA página de `L1-blog` cuyo `footer-links` mide otra cosa. */
const MEZCLADO = "medidas/pie-familias-neg-piel-mezclada-espejo.json";
{
  const base = JSON.parse(readFileSync(join(QA, "medidas/lh-espejo-1440.json"), "utf8"));
  let tocada = null;
  for (const [k, v] of Object.entries(base.paginas)) {
    if (v.forma !== "L1-blog") continue;
    const sec = (v.esqueleto?.cascaron || []).find((s) => s.capa === "tb_footer" && (s.clases || []).includes("footer-links"));
    if (!sec) continue;
    sec.rect.h = +(sec.rect.h + 13).toFixed(2); // 13 px que nadie sirve
    tocada = k;
    break;
  }
  if (!tocada) throw new Error("pie-familias.neg: no se encontró una página de L1-blog con footer-links que sabotear");
  base.meta = { ...(base.meta || {}), fecha: "«artefacto de negativo»", sabotaje: `footer-links +13 en ${tocada}` };
  writeFileSync(join(QA, MEZCLADO), JSON.stringify(base));
}

const casos = [
  {
    etiqueta: "control",
    porQue: "4 familias por la firma entera ⇒ 3 PIELES al sacar la CTA, las 3 con n ≥ 2 y partición estable",
    args: [],
    exit: 0,
    salidaTiene: /3 PIELES/,
    comprueba: (j) => {
      if (!j.pieles || !j.pieles["1440"]) return "sin bloque `pieles`";
      const p = j.pieles["1440"];
      if (p.length !== 3) return `${p.length} pieles, esperaba 3`;
      const flojas = p.filter((x) => !x.establecida);
      if (flojas.length) return `${flojas.length} piel(es) con n < 2: el modelo no está sostenido`;
      if (!j.control.coincide) return "la partición no coincide entre anchos";
      if (j.porAncho["1440"].formasConMasDeUnPie.length) return "hay formas con más de un pie";
      /* La mitad que da valor: L5 tiene que caer en la piel de L1 al sacar la
         CTA. Si no, «la CTA es ortogonal» no está probado. */
      const conL5 = p.find((x) => Object.keys(x.formas).includes("L5-casos"));
      if (!conL5) return "L5-casos no aparece en ninguna piel";
      if (!Object.keys(conL5.formas).includes("L1-blog")) return "L5-casos NO cae en la piel de L1: la CTA no sería ortogonal";
      if (conL5.instancias < 60) return `la piel de L1+L5 sólo suma ${conL5.instancias} instancias`;
      return null;
    },
  },
  {
    etiqueta: "sin-espejo",
    porQue: "sin el fichero no hay nada que derivar: tira en vez de agrupar 0 formas",
    args: ["--espejo=medidas/pie-familias-neg-NO-EXISTE.json"],
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
    prohibidoEnSalida: /PIELES/,
  },
  {
    etiqueta: "mismo-espejo",
    porQue: "los dos anchos con el MISMO fichero harían vacuo el control de partición",
    args: ["--espejo=medidas/lh-espejo-1440.json"],
    exit: 2,
    salidaTiene: /apuntan al MISMO espejo/,
    /* La frase del verde no puede aparecer: si el rojo también dice
       «coinciden», el negativo no ha probado nada (§sondas 17). */
    prohibidoEnSalida: /✓ coinciden/,
  },
  {
    etiqueta: "piel-mezclada",
    porQue: "una forma que sirve DOS pies rompe «una piel por forma», y la sonda lo NOMBRA en vez de repartirla en silencio",
    /* ⚠ Sustituye SÓLO el ancho 1440: con el `--espejo=` global los dos anchos
       compartirían fichero y lo pararía antes la guarda de `mismo-espejo`, así
       que el caso saldría verde **sin haber ejercitado nada** (§sondas 17). */
    args: [`--espejo1440=${MEZCLADO}`],
    exit: 1,
    salidaTiene: /formas que sirven MÁS DE UN pie: L1-blog/,
    /* La partición deja de coincidir entre anchos, así que la frase del verde
       tampoco puede salir. */
    prohibidoEnSalida: /✓ coinciden/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · pie-familias ════════`);
console.log(`  alcance: SIN red y SIN clon — sólo lee espejos congelados.\n`);

const ev = new Evaluadas({ nombre: "pie-familias-neg", unidad: "sabotajes", minimo: casos.length });

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
  if (!mal && c.prohibidoEnSalida && c.prohibidoEnSalida.test(out)) mal = `la salida contiene ${c.prohibidoEnSalida}, que es la frase del VERDE`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(18)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(18)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} pie-familias · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El modelo de 3 pieles sale de agrupar por SECCIÓN con la CTA fuera, y su \`n\`\n` +
        `   se publica con él: sin espejo no arranca, con un solo fichero se niega a dar\n` +
        `   por bueno un control que no compara, y L5 cae en la piel de L1 —que es lo que\n` +
        `   prueba que la CTA es ortogonal y no una cuarta piel—.\n`
      : `   El modelo de pieles no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
