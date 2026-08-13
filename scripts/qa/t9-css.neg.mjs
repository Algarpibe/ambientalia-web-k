/**
 * TEST EN NEGATIVO de `t9-css`.
 * Uso: npm run qa:t9-css-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda existe para producir **un cero**, y un cero es exactamente lo que
 * este proyecto no se cree sin negativo: *no encontrar nada y no mirar nada dan
 * la misma salida* (§sondas 4). Los tres sabotajes atacan las tres formas en
 * que ese cero podría ser del instrumento y no del documento:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `regla-para-el-envoltorio` | **encuentra la regla** inyectada para una clase del envoltorio | un fallo de lectura |
 * | `lector-ciego` | **CONTROL MUDO** — el parser no lee nada | «0 clases con regla», que es el MISMO número que la corrida buena |
 * | `sin-hojas` | **TIRA** por hojas sin capturar | medir sólo el CSS en línea y titular «ninguna en absoluto» |
 * | (control) | ✅ verde: 44 clases, 0 con regla, control con reglas | — |
 *
 * **`lector-ciego` es el que da valor a todo lo demás**, y merece decirse en
 * voz alta: produce **el mismo `0 de 44`** que la corrida buena. Si la sonda no
 * llevara control, las dos corridas serían **indistinguibles en su número** y
 * la cuarta condición de T9 se habría pagado con un cero que no midió nada.
 *
 * Y `sin-hojas` es el hueco histórico con forma de test: la derivación anterior
 * midió sólo el CSS en línea y **declaró su límite** en vez de titular de más.
 * Aquí ese límite es un fallo duro.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/t9-css.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: T9 desenvuelve sus contenedores, 0 clases con regla y el CONTROL vivo",
    env: {},
    exit: 0,
    salidaTiene: /PAGADA POR MECANISMO/,
    comprueba: (j) => {
      if (!j.resumen.clases) return "0 clases del envoltorio: no se evaluó nada";
      if (j.resumen.conRegla !== 0) return `${j.resumen.conRegla} clases con regla en la corrida buena`;
      if (j.resumen.hojasEnlazadas !== 7) return `${j.resumen.hojasEnlazadas} hojas enlazadas, esperaba 7`;
      /* Sin control con reglas, el cero de arriba no distingue nada. */
      for (const [c, n] of Object.entries(j.resumen.control)) if (!n) return `control mudo en .${c}`;
      if (j.resumen.bytesCss < 300_000) return `sólo ${j.resumen.bytesCss} bytes de CSS: faltan canales`;
      return null;
    },
  },
  {
    etiqueta: "regla-para-el-envoltorio",
    porQue: "una regla servida para una clase del envoltorio ⇒ la sonda la ENCUENTRA y tumba el mecanismo",
    env: { SABOTAJE: "regla-para-el-envoltorio" },
    exit: 2,
    salidaTiene: /clases del envoltorio TIENEN regla servida/,
    comprueba: (j) => {
      if (j.resumen.conRegla !== 1) return `esperaba 1 clase con regla, hay ${j.resumen.conRegla}`;
      const con = j.clases.filter((c) => c.conRegla);
      if (!con.length || con[0].donde[0].fuente !== "SABOTAJE") return "la encontró, pero no por la hoja saboteada";
      /* Y que la haya visto DENTRO de un @media: perder el contexto de at-rule
       * es el fallo clásico de un parser de CSS a regex. */
      if (con[0].donde[0].media == null) return "encontró la regla pero perdió su @media: el parser no lleva la pila de at-rules";
      return null;
    },
  },
  {
    etiqueta: "lector-ciego",
    porQue: "el parser no lee nada ⇒ CONTROL MUDO, aunque el número de clases con regla sea el MISMO que en verde",
    env: { SABOTAJE: "lector-ciego" },
    exit: 2,
    salidaTiene: /CONTROL MUDO/,
    comprueba: (j) => {
      if (j.resumen.conRegla !== 0) return "no cayó por el control: encontró reglas";
      if (Object.values(j.resumen.control).some((n) => n)) return "el control no quedó mudo: el sabotaje no cegó nada";
      if (!j.resumen.clases) return "cayó por no derivar clases, no por el control";
      return null;
    },
  },
  {
    etiqueta: "sin-hojas",
    porQue: "hojas enlazadas sin capturar ⇒ TIRA, en vez de medir medio canal y titular «ninguna en absoluto»",
    env: { SABOTAJE: "sin-hojas" },
    exit: 1,
    salidaTiene: /hojas enlazadas NO están capturadas/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · t9-css ════════`);
console.log(`  alcance: el caso congelado de castel-d-ario + las 7 hojas de corpus/css · sin red\n`);

const ev = new Evaluadas({ nombre: "t9-css-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "t9-css.mjs")], env: c.env, timeout: 300_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(26)} (${seg}s)  ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(26)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} t9-css · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El cero se puede citar: la sonda encuentra una regla cuando la hay, se declara\n` +
        `   MUDA cuando no sabe leer, y TIRA cuando le falta un canal.\n`
      : `   La cuarta condición de T9 NO se puede dar por pagada hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
