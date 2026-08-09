/**
 * TEST EN NEGATIVO de `escalon-etiquetas` — con control.
 * Uso: npm run qa:escalon-neg
 *
 * La sonda sostiene **un arbitraje de esquema**, así que hay dos familias de
 * sabotaje y conviene no mezclarlas:
 *
 *   **(a) los que atacan al INSTRUMENTO** — que sepa decir «no he mirado»:
 *     · `localizador-muerto`   el bloque se busca por una clase inexistente ⇒ 0
 *       localizadas. Sin esta guarda, «ninguna tiene taxonomías» y «no miré
 *       ninguna» dan la misma salida (`CLAUDE.md` §sondas 4, el cero);
 *     · `discriminante-ubicuo` el discriminante casa con cualquier span del
 *       bloque ⇒ 149/149 con etiquetas ⇒ **0 sin ellas**, que es el pleno
 *       disfrazado de medida — y encima de la medida que decide el arbitraje;
 *     · `sin-corpus`           la lista llega vacía ⇒ 0 evaluadas de 149. Es la
 *       regla 4bis: «0 comparado» no puede salir verde.
 *
 *   **(b) el que ataca al HALLAZGO**, que es el que de verdad importa aquí:
 *     · `tags-vacio` inyecta en UNA entrada el bloque **presente y vacío**. Si
 *       el original hiciera eso aunque fuera una vez, «OMITE» sería falso y el
 *       arreglo copiaría un contrato que el original no tiene. El veredicto
 *       tiene que **voltear a AMBIGUO**. Una sonda que dijera OMITE igualmente
 *       daría la misma salida verde que la buena, y el arbitraje se apoyaría en
 *       nada.
 *
 * El **CONTROL** (sin sabotaje) cierra el triángulo: sin él, los cuatro
 * negativos los aprobaría una sonda rota de fábrica.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "localizador-muerto",
    exit: 2,
    porQue: "0 entradas localizadas ⇒ LOCALIZADOR MUERTO, no «ninguna tiene taxonomías»",
    salidaTiene: /LOCALIZADOR MUERTO/,
    comprueba: (d) =>
      d.veredicto?.decision === "NO SE PUDO MEDIR" && d.censo?.bloque === 0
        ? null
        : `esperaba NO SE PUDO MEDIR con bloque 0, salió ${d.veredicto?.decision} con ${d.censo?.bloque}`,
  },
  {
    sabotaje: "discriminante-ubicuo",
    exit: 2,
    porQue: "el discriminante casa en las 149 ⇒ UBICUO, y su «0 sin etiquetas» no es una medida",
    salidaTiene: /DISCRIMINANTE UBICUO/,
    comprueba: (d) =>
      d.veredicto?.decision === "NO SE PUDO MEDIR" && d.sinEtiquetas?.n === 0
        ? null
        : `esperaba NO SE PUDO MEDIR con 0 sin etiquetas, salió ${d.veredicto?.decision} con ${d.sinEtiquetas?.n}`,
  },
  {
    sabotaje: "tags-vacio",
    exit: 2,
    porQue: "una sola instancia de bloque vacío ⇒ el veredicto VOLTEA a AMBIGUO",
    salidaTiene: /AMBIGUO/,
    comprueba: (d) =>
      d.veredicto?.decision === "AMBIGUO" && d.bloquesVacios?.length === 1
        ? null
        : `esperaba AMBIGUO con 1 bloque vacío, salió ${d.veredicto?.decision} con ${d.bloquesVacios?.length}`,
  },
  {
    sabotaje: "sin-corpus",
    exit: 2,
    porQue: "0 de 149 evaluadas ⇒ NO SE PUDO EVALUAR (el contrato, no la sonda)",
    salidaTiene: /NO SE PUDO EVALUAR/,
    comprueba: (d) =>
      d.contrato?.evaluadas === 0 ? null : `esperaba 0 evaluadas, salió ${d.contrato?.evaluadas}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · escalon-etiquetas ════════`);
console.log(`  la medida que arbitra §F2-5-ESCALON-ETIQUETAS, falsada — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "escalon-etiquetas-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "escalon-etiquetas.mjs")], env, timeout: 300_000 });

for (const c of casos) {
  const fichero = join(QA, nombreNeg("medidas/escalon-etiquetas.json", c.sabotaje));
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(21)} ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(21)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
const fCtl = join(QA, nombreNeg("medidas/escalon-etiquetas.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  if (d.veredicto?.decision !== "OMITE") malCtl = `veredicto ${d.veredicto?.decision}, esperaba OMITE`;
  else if (d.sinEtiquetas?.n < 1) malCtl = `0 entradas sin etiquetas: el caso que arbitra la ficha NO estaría en el corpus`;
  else if (d.formasSinEtiquetas?.length !== 1) malCtl = `${d.formasSinEtiquetas?.length} formas distintas, esperaba 1`;
  else if (d.bloquesVacios?.length !== 0) malCtl = `${d.bloquesVacios.length} bloques vacíos — OMITE no puede sostenerse`;
  else if (!/VEREDICTO: OMITE/.test(ctlOut)) malCtl = "la salida no imprime el veredicto";
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL    (sin sabotaje)      ${malCtl}`); }
else console.log(`  ✓  CONTROL    (sin sabotaje)      8 de 149 sin etiquetas · 1 forma · el original OMITE`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} escalon-etiquetas · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe decir «no he mirado» (3 formas distintas) y sabe decir «me\n` +
        `   equivoqué»: con UNA sola instancia de bloque vacío el veredicto cae de\n` +
        `   OMITE a AMBIGUO. O sea que «el original OMITE» es una medida, no un\n` +
        `   supuesto — y §F2-5-ESCALON-ETIQUETAS se puede arbitrar con ella.\n`
      : `   El arbitraje NO se puede apoyar en \`escalon-etiquetas\` hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
