// 130.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
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
      "Un canal de media no se cierra con el `src`: dentro del MISMO `<img>` el `srcset` GANA, y reescribir sólo el `src` deja media unidad. No da error — da un rojo CON EL SIGNO INVERTIDO, porque el lado que no carga es el ORIGINAL.",
    porQue:
      "§regla 32 ya dice «reescribir un canal a copias locales y otro no es cerrar MEDIO canal», pero su ejemplo son DOS canales (hojas vs imágenes). Aquí el canal es UNO y lo que falta es un ATRIBUTO suyo, así que la comprobación de «¿está cerrado?» no es por canal sino por ATRIBUTO. Medido: 22 de 56 `<img>` del corpus con `srcset` remoto, y las 16 capturas de RejillaHerramientas entre ellos, produciendo un Δ+243.75 EXACTO y constante en 14 tarjetas que se lee como defecto del clon.",
    vocabulario: ["srcset", "medio canal"],
    enunciadoClave: "el `srcset` GANA",
    destino: "CLAUDE.md, §regla 32 (la mitad del atributo)",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "El contrato de `Evaluadas` sólo cierra la clase «0 comparado = verde» si su UNIDAD es la que la sonda compara. Declarado un nivel por encima —pares cuando se comparan ejes— no ve un 0 de ejes: las 4 rutas se recorrieron, así que el contrato está satisfecho y la sonda publica «sin diferencias».",
    porQue:
      "§sondas 4bis da la clase por cerrada con `Evaluadas`, y §regla 14 dice que la cobertura se declara en la unidad que la sonda compara — pero nadie las cruza. Medido: romper `[data-fila]` daba `0 ejes comparados · 0 distintos · EXIT 0` con `✓ evaluadas 4/4 pares`. La sexta instancia de la clase, y por un camino que el contrato NO PODÍA ver.",
    vocabulario: ["Evaluadas", "unidad que la sonda compara"],
    enunciadoClave: "sólo cierra la clase",
    destino: "CLAUDE.md, §sondas 4bis (el límite del contrato)",
  },
  {
    id: "R3",
    tipo: "REGLA",
    enunciado:
      "Antes de leer un `ejesExcluidos` —o cualquier «el clon no emite X»— como propiedad del CLON, comprueba con qué versión de la SONDA se tomó. El mtime del HTML servido contra el de la congelada lo dirime en dos `stat`.",
    porQue:
      "§sondas 4 cubre el cero de un selector, y §regla 5bis que arreglar un instrumento CADUCA sus medidas. Lo que falta es la lectura: una congelada acreditada, con `saboteada: null`, publica una frase sobre el clon que era de la sonda — y sobrevive intacta a la corrección del instrumento. Medido: las DOS hipótesis del encargo eran falsas y la tercera («la sonda no leía») la dirimió el build, no la prosa.",
    vocabulario: ["ejesExcluidos", "mtime"],
    enunciadoClave: "con qué versión de la SONDA se tomó",
    destino: "CLAUDE.md, §sondas 4 / §regla 5bis",
  },
  {
    id: "R4",
    tipo: "REGLA",
    enunciado:
      "Marcar PARCIALMENTE una fila no aporta cobertura: con el recuento descuadrado la sonda la declara PARCIAL y no compara ninguno de sus módulos. El trabajo de marcado es por FILA y es todo-o-nada.",
    porQue:
      "Se sigue de §regla 33 (emparejar por orden dos listas de distinto tamaño da PAREJAS FALSAS, no huecos) pero no está dicho como criterio de PLANIFICACIÓN, que es donde decide. Medido: 6 de 19 marcados en la fila 2 de software la dejan igual de sin comparar que 0 de 19 — y de paso la sacan de SIN MARCADOR a PARCIAL, que suma al recuento de distintos.",
    vocabulario: ["PARCIAL", "todo-o-nada"],
    enunciadoClave: "es por FILA y es todo-o-nada",
    destino: "CLAUDE.md, junto a §regla 33",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "El emparejamiento por índice de las filas está desalineado en las 4 rutas: el original sirve una fila propia de 146 px para el botón «Amplia tus conocimientos» que el clon no marca, y la FAQ del clon se compara contra ella.",
    porQue:
      "§*31 de 31 rutas distintas no es un hallazgo: es el instrumento* ya lo cubre entero, con su firma (4 de 4 con el MISMO `orig`). Lo específico —qué botón, qué 146 px, qué 4 rutas— es un evento con su fecha y su número.",
    vocabulario: ["desalineamiento", "el instrumento"],
    enunciadoClave: "31 de 31 rutas distintas no es un hallazgo",
    destino: "el acta y PENDIENTES-QA",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "Un comentario JSX `{/* */}` dentro del retorno implícito de un `map` no compila, y el error apunta al `<ul>` de arriba.",
    porQue:
      "Es sintaxis del lenguaje, no método: lo caza el typecheck en el acto y no hay veredicto que pueda salir falso por él. Quitarle la fecha no deja ninguna regla útil.",
    vocabulario: ["JSX", "map"],
    enunciadoClave: "comentario JSX",
    destino: "el acta",
  },
];

di("═".repeat(78));
di("130.ª · BARRIDO DE §regla 12 — los DOS cruces, al lado");
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
  join(OUT, "regla12-barrido-130.json"),
  JSON.stringify({ meta: { tanda: "130.ª", fecha: new Date().toISOString().slice(0, 10), offline: true }, candidatos, cruceA, cruceB, resumen: { candidatos: candidatos.length, promovidas, aYa, bYa } }, null, 2) + "\n",
);
writeFileSync(join(OUT, "regla12-barrido-130.log"), salida.join("\n") + "\n");
