// 129.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
//
// §regla 12: un acta se lee UNA VEZ; `CLAUDE.md` se lee CADA sesión. Un
// enunciado con forma de regla general escrito sólo en un acta equivale a no
// haberlo escrito: se vuelve a pagar, y con la sensación de que ya estaba
// resuelto. El discriminador es quitarle la fecha y el nombre propio — si sigue
// diciendo qué hacer, es regla.
//
// ⚠ EL BARRIDO VA ACOTADO (a las actas de esta tanda) y **el número se escribe
// aunque sea cero**: «no encontré ninguna» y «no barrí» son la misma salida si
// no se dice.
//
// ⚠⚠ Y SE PUBLICAN LOS DOS CRUCES, porque la 128.ª midió que el heredado
// SOBRE-CASA: comprueba si las PALABRAS del enunciado aparecen en `CLAUDE.md` y
// da por escritas frases que no están —6 de 9 en su corrida—. El endurecido
// exige que aparezca el ENUNCIADO, no su vocabulario. Ninguno de los dos
// adjudica solo: uno sobre-casa y el otro sub-casa, así que la adjudicación va
// A MANO y con los dos números delante.
//
// OFFLINE: no mide un píxel, no abre navegador, no toca red ni DB.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const CLAUDE = readFileSync(join(RAIZ, "CLAUDE.md"), "utf8");

const salida = [];
const di = (s = "") => {
  salida.push(s);
  console.log(s);
};

/* Los candidatos se ENUMERAN a mano —salen de leer las actas de la tanda, que
 * es lo que §regla 12 pide— y cada uno declara su veredicto propuesto. Lo que
 * el instrumento hace es CRUZARLOS, no encontrarlos: un barrido automático
 * sobre 7.000 líneas produce ruido y ninguna decisión. */
const candidatos = [
  {
    id: "R1",
    tipo: "REGLA",
    enunciado:
      "Un desempate escrito SÓLO en el documento que nadie relee pierde contra la frase que vive en el que se lee siempre. §regla 12 AL REVÉS: no es que falte escribirlo, es que se escribió donde no gana.",
    porQue:
      "la 108.ª dirimió bien las tres lecturas de `comportamiento` y lo escribió en COBERTURA-MEDICION.md; la lectura MUERTA siguió 6 días en CLAUDE.md, que se lee cada sesión, y ganó.",
    vocabulario: ["desempate", "documento que nadie relee", "regla 12"],
    enunciadoClave: "pierde contra la frase que está en el que sí",
    destino: "CLAUDE.md §regla 12, como rider",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Un instrumento puede EXISTIR y tener su eje CIEGO por falta de un INSUMO, no de código. Ante «¿existe la sonda que mide X?» las dos salidas binarias son falsas, y la tercera es la que decide el trabajo.",
    porQue:
      "el encargo declaraba un corte con dos salidas; la real era la tercera, y de ella salía un trabajo distinto (poner el insumo) del que las dos contemplaban (construir o correr).",
    vocabulario: ["insumo", "eje ciego", "binario"],
    enunciadoClave: "EXISTE Y SU EJE ESTÁ CIEGO",
    destino: "CLAUDE.md §UN ARQUETIPO NUEVO NO HEREDA COBERTURA, como rider",
  },
  {
    id: "R3",
    tipo: "REGLA",
    enunciado:
      "Un marcador de sonda se pone como ATRIBUTO sobre un elemento que ya existe siempre que se pueda; un ENVOLTORIO nuevo es la excepción, se cuenta aparte y es el único punto donde el NO-OP puede romperse.",
    porQue:
      "15 de 16 marcadores fueron atributo puro —no pueden mover un píxel por construcción— y sólo 1 envoltorio. Separarlos concentra el riesgo en un sitio nombrado en vez de repartirlo.",
    vocabulario: ["marcador de sonda", "atributo", "envoltorio"],
    enunciadoClave: "marcador de sonda, no estilo",
    destino: "CLAUDE.md §sondas 4, tercera cara (donde vive `data-fila`)",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado: "`productos-cmp` ya existía y su eje `modulos` estaba declarado SIN COMPARAR con su cardinal por fila.",
    porQue: "es un hallazgo sobre ESTE repo con su fecha y su ruta, no algo que hacer la próxima vez.",
    vocabulario: [],
    enunciadoClave: null,
    destino: "el acta, con su cardinal",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado: "La línea de uso de `productos-cmp` decía `[ancho]` y el código lee `ANCHO=`.",
    porQue: "su regla general ya está en CLAUDE.md (§regla 3: documentado no es conectado). Lo nuevo es el OBJETO —la línea de uso— y eso lleva fecha.",
    vocabulario: ["línea de uso"],
    enunciadoClave: "documentado no es conectado",
    destino: "el acta; la regla ya está",
  },
  {
    id: "E3",
    tipo: "EVENTO",
    enunciado: "Usé `NEG=` donde tocaba `SALIDA=` y la medida quedó invisible a los censos.",
    porQue: "§regla 7 (la vuelta) ya lo describe ENTERO, incluida la parte de que «la palanca equivocada funciona». No hay nada que promover.",
    vocabulario: ["palanca", "NEG"],
    enunciadoClave: "una medida con nombre de artefacto",
    destino: "el acta",
  },
];

di("═".repeat(78));
di("129.ª · BARRIDO DE §regla 12 — los DOS cruces, al lado");
di("═".repeat(78));
di("");
di(`   candidatos enumerados de las actas de la tanda: ${candidatos.length}`);
di("");

/* ── cruce A · HEREDADO (laxo): ¿aparece el VOCABULARIO en CLAUDE.md? ────── */
const norm = (s) => s.toLowerCase().replace(/[`*_·—]/g, "").replace(/\s+/g, " ");
const CN = norm(CLAUDE);
const cruceA = candidatos.map((c) => ({
  id: c.id,
  yaEscrito: c.vocabulario.length > 0 && c.vocabulario.every((v) => CN.includes(norm(v))),
}));

/* ── cruce B · ENDURECIDO: ¿aparece el ENUNCIADO, no su vocabulario? ─────── */
const cruceB = candidatos.map((c) => ({
  id: c.id,
  yaEscrito: !!c.enunciadoClave && CN.includes(norm(c.enunciadoClave)),
}));

di("   | id | tipo | cruce A (laxo, heredado) | cruce B (endurecido) |");
di("   |---|---|---|---|");
for (let i = 0; i < candidatos.length; i++) {
  const c = candidatos[i];
  di(`   | ${c.id} | ${c.tipo} | ${cruceA[i].yaEscrito ? "ya escrito" : "NO escrito"} | ${cruceB[i].yaEscrito ? "ya escrito" : "NO escrito"} |`);
}
di("");
const aYa = cruceA.filter((x) => x.yaEscrito).length;
const bYa = cruceB.filter((x) => x.yaEscrito).length;
di(`   cruce A dice «ya escrito» en ${aYa} de ${candidatos.length}`);
di(`   cruce B dice «ya escrito» en ${bYa} de ${candidatos.length}`);
di(`   ⇒ discrepan en ${candidatos.filter((_, i) => cruceA[i].yaEscrito !== cruceB[i].yaEscrito).length}`);
di("");
di("   ⚠ NINGUNO DE LOS DOS ADJUDICA SOLO. El laxo sobre-casa —le basta que las");
di("     palabras existan en algún sitio del documento— y el endurecido sub-casa");
di("     —una regla puede estar escrita con otras palabras—. La adjudicación va");
di("     A MANO, y los dos números se publican para que se pueda auditar.");
di("");

di("═".repeat(78));
di("ADJUDICACIÓN A MANO");
di("");
let promovidas = 0;
for (const c of candidatos) {
  if (c.tipo === "REGLA") promovidas++;
  di(`  ${c.tipo === "REGLA" ? "REGLA · promovida" : "EVENTO · se queda "}  [${c.id}] ${c.enunciado.slice(0, 96)}${c.enunciado.length > 96 ? "…" : ""}`);
  di(`      porque: ${c.porQue}`);
  di(`      → ${c.destino}`);
  di("");
}
di(`  promovidas a CLAUDE.md: ${promovidas} de ${candidatos.length}  ·  eventos que se quedan: ${candidatos.length - promovidas}`);
di("═".repeat(78));

writeFileSync(
  join(OUT, "regla12-barrido-129.json"),
  JSON.stringify({ meta: { tanda: "129.ª", fecha: new Date().toISOString().slice(0, 10), offline: true }, candidatos, cruceA, cruceB, resumen: { candidatos: candidatos.length, promovidas, aYa, bYa } }, null, 2) + "\n",
);
writeFileSync(join(OUT, "regla12-barrido-129.log"), salida.join("\n") + "\n");
