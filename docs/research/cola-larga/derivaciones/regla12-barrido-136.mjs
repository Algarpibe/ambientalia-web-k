// 136.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
//
// §regla 12: un acta se lee UNA VEZ; `CLAUDE.md` se lee CADA sesión. Un
// enunciado con forma de regla general escrito sólo en un acta equivale a no
// haberlo escrito. El discriminador: quítale la fecha y el nombre propio — si
// sigue diciendo qué hacer, es regla.
//
// ⚠ ACOTADO a lo que esta tanda midió, y **el número se escribe aunque sea
// cero**: «no encontré ninguna» y «no barrí» son la misma salida si no se dice.
//
// ⚠⚠ LOS DOS CRUCES, y manda el ENDURECIDO — con sus TRES testigos y el
// ANTES/DESPUÉS contra HEAD, que es lo único que prueba que la regla LLEGÓ.
// La 133.ª publicó «0 de 6» con 4 reglas YA escritas; la 134.ª lo verificó
// corriendo el mismo cruce contra HEAD. Se hereda ese diseño entero.
//
// OFFLINE: no mide un píxel, no abre navegador, no toca red ni DB.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const CLAUDE = readFileSync(join(RAIZ, "CLAUDE.md"), "utf8");

const salida = [];
const di = (s = "") => { salida.push(s); console.log(s); };

/* Los candidatos se ENUMERAN a mano —salen de leer lo que la tanda midió, que
 * es lo que §regla 12 pide—. El instrumento los CRUZA, no los encuentra.
 *
 * ⚠ LÍMITE declarado (§regla 14): este barrido sólo ve enunciados YA ESCRITOS
 * EN PROSA. Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un `slice`—
 * es invisible para él, así que su cero es cierto de la prosa y no del repo. */
const candidatos = [
  {
    id: "R1",
    tipo: "REGLA",
    enunciado:
      "Una guarda de exhaustividad —«lo que no tenga sitio sale NOMBRADO»— sólo puede nombrar las clases que su recorrido ENUMERA. Lo que no esté en esa enumeración no sale nombrado: DESAPARECE, y su 0 de «piezas sin sitio» se lee como «todo cabe». Así que la enumeración se DERIVA del dominio que se va a recorrer, no del que la calibró.",
    porQue:
      "Medido hoy: `formularioDe` de `extractor-f35.mjs` declara que todo control del `<form>` que no tenga sitio sale en `SIN_SITIO_FORM`, y enumera `input` · `select` · `fieldset` · `button`. `textarea` aparece 0 veces en el fichero, así que el `<textarea name=\"field[23]\" required>` de `contacto` no cae, no se nombra y no se emite: el informe publica 0 NOMBRADOS y 1 PERDIDA EN SILENCIO. La guarda es cierta de su dominio (4 documentos de `arquetipos`, sin `<textarea>`) y SIN PROBAR fuera de él. Es §regla 6 —un renderizador que devuelve undefined no falla, no pinta— con el objeto puesto en una GUARDA DE EXHAUSTIVIDAD, y §regla 9 7.º caso con la lista enumerada a mano dentro del recorrido.",
    vocabulario: ["exhaustividad", "enumera", "desaparece"],
    enunciadoClave:
      "sólo puede nombrar las clases que su recorrido ENUMERA",
    destino: "CLAUDE.md, §regla 6 / §regla 9 (un conjunto enumerado a mano es un dato recordado)",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "El cardinal de un conjunto de campos ANIDADOS sólo es el de un conjunto si las rutas van CUALIFICADAS. Los grupos hermanos repiten los mismos subcampos, así que el nombre PELADO cuenta el mismo nombre N veces y publica una intersección que no existe — y el número sale plausible, con su lista al lado.",
    porQue:
      "Medido en esta tanda, sobre la propia sonda: comparando `codigo` con `formulario-arq` por `name` pelado salía «comunes (22)» con `valor`, `unidad` y `movilValor` repetidos tres veces cada uno, porque `mt`, `mb` y `pb` son grupos con los mismos subcampos. Con rutas cualificadas (`mt.valor`) y separando la BASE de módulo del CONTENIDO, la intersección real es CERO. Es §*un cardinal es un contenedor y absorbe la membresía* con el contenedor puesto en el NOMBRE CORTO, y la guarda que lo caza cuesta un `filter`: `llaves distintas === elementos`, o el cardinal no se publica.",
    vocabulario: ["cualificadas", "anidados", "pelado"],
    enunciadoClave:
      "sólo es el de un conjunto si las rutas van CUALIFICADAS",
    destino: "CLAUDE.md, §La causa común (un cardinal es un contenedor) / §regla 29",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "`F3-5-CODE-DIVERGE` levantada a decisión numerada CMS-7 con sus cuatro opciones: los dos modelos no comparten NI UN campo de contenido (0 comunes), las 9 son `<form>` entero 9 de 9 en 9 documentos, y unificar hacia lo tipado pierde el `<textarea>` de `contacto`.",
    porQue:
      "Tiene fecha, cardinales y nombres propios: es un hallazgo sobre ESTE repo. Vive en `ESQUEMA-CMS.md` §CMS-7 y en el acta.",
    vocabulario: ["F3-5-CODE-DIVERGE"],
    enunciadoClave: "F3-5-CODE-DIVERGE",
    destino: "ESQUEMA-CMS.md §CMS-7 + PENDIENTES-QA.md §136.ª + PLAN-FASE-3.md",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "El sabotaje `extractor-mudo` llegó apuntando a la mitad del blanco: anulaba la §4 pero no T1, que es lo que su condición de fallo mira, así que salía VERDE con 0 instancias separadoras.",
    porQue:
      "La REGLA ya está escrita —§regla 17, 2.ª cara: «si el arreglo que estás probando tiene DOS mitades, el sabotaje tiene que anular LAS DOS»—. Lo de hoy es una instancia suya con su fecha, no un enunciado nuevo.",
    vocabulario: ["sabotaje", "mitades"],
    enunciadoClave: "el sabotaje tiene que anular LAS DOS",
    destino: "PENDIENTES-QA.md §136.ª (instancia de una regla ya escrita)",
  },
  {
    id: "E3",
    tipo: "EVENTO",
    enunciado:
      "Los cuatro heredados de `F3-5-CODE-DIVERGE` reproducen: 9 instancias · `{type:\"code\"}` sin `validate` · 21 tokens fuera del censo · 9 de 9 bloquearían. Y el «21 contra 20» son dos conjuntos, no dos lecturas: el 20 del comentario de `arquetipos.ts` está enumerado a mano y no trae `<textarea>`.",
    porQue:
      "Es una re-derivación con sus números, no un enunciado general. La regla que lo cubre —§regla 9, un conjunto enumerado a mano dentro del fuente es un dato recordado— ya está escrita.",
    vocabulario: ["heredado", "reproduce"],
    enunciadoClave: "un conjunto enumerado a mano",
    destino: "PENDIENTES-QA.md §136.ª",
  },
];

/* ── TESTIGOS del propio cruce (§regla 28c) ──────────────────────────────────
 * Heredados de la 134.ª enteros: uno positivo en prosa, uno inventado, y el
 * de CAJA —un titular en CAPS— que es el que destapó la tercera cara del
 * sub-casado. Sin los tres, ni un 0 ni un pleno adjudican. */
const TESTIGOS = [
  {
    id: "T+",
    espera: true,
    clave: "Una medición tomada a un nivel que puede absorber el error no es una medición",
    que: "un enunciado que SE SABE escrito en CLAUDE.md",
  },
  {
    id: "T-",
    espera: false,
    clave: "Antes de medir un color se calibra el monitor contra una carta de grises",
    que: "un enunciado INVENTADO que no puede estar",
  },
  {
    id: "T±",
    espera: true,
    clave: "UN SELECTOR QUE NO CASA CON NADA NO ES UN CERO: ES UN DEFECTO",
    que: "un TITULAR EN MAYÚSCULAS que lleva meses escrito",
  },
];

di("=".repeat(78));
di("136.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces y su NEGATIVO");
di("=".repeat(78));

/** Cruce A · HEREDADO: ¿aparecen las PALABRAS? SOBRE-CASA. */
const laxo = (c) => c.vocabulario.every((v) => CLAUDE.toLowerCase().includes(v.toLowerCase()));

/** Cruce B · ENDURECIDO: ¿aparece el ENUNCIADO? SUB-CASA. Manda éste.
 *  Normaliza espacios, quita los `>` de cita y baja la caja — las tres caras
 *  del sub-casado que las tandas 133.ª y 134.ª pagaron. Sigue exigiendo el
 *  enunciado entero, no su vocabulario; su testigo T- lo demuestra. */
const plano = (s) => s.replace(/^[>\s]+/gm, " ").replace(/\s+/g, " ").toLowerCase();
const CLAUDE_PLANO = plano(CLAUDE);
const endurecido = (c) => CLAUDE_PLANO.includes(plano(c.enunciadoClave));

/** El ANTES/DESPUÉS contra HEAD — lo único que prueba que la regla LLEGÓ.
 *  Que el cruce diga «ya escrito» tras escribirla no separa «la escribí» de
 *  «el cruce se aflojó» (§regla 21). */
const { execFileSync } = await import("node:child_process");
let CLAUDE_HEAD = null;
try {
  CLAUDE_HEAD = plano(
    execFileSync("git", ["show", "HEAD:CLAUDE.md"], {
      cwd: RAIZ, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    }),
  );
} catch { /* sin HEAD legible, el antes/después se declara NO MEDIDO */ }
const enHead = (c) => (CLAUDE_HEAD === null ? null : CLAUDE_HEAD.includes(plano(c.enunciadoClave)));

let ok = true;
const fallo = (m) => { ok = false; di(`   ❌ ${m}`); };

di("");
di("── TESTIGOS DEL CRUCE (antes de creerse ningún número) ──");
for (const t of TESTIGOS) {
  const hallado = CLAUDE_PLANO.includes(plano(t.clave));
  const bien = hallado === t.espera;
  di(`  ${t.id} · ${t.que}`);
  di(`      espera ${t.espera ? "«ya escrito»" : "«NO está»"} → ${hallado ? "«ya escrito»" : "«NO está»"} ${bien ? "✓" : "✗"}`);
  if (!bien) fallo(`el testigo ${t.id} falla: el cruce ${t.espera ? "SUB-CASA" : "SOBRE-CASA"} y su número NO adjudica`);
}
di(`  HEAD legible para el antes/después: ${CLAUDE_HEAD === null ? "NO ✗" : "SÍ ✓"}`);
if (CLAUDE_HEAD === null) fallo("sin HEAD no hay antes/después: «ya escrito» no se puede separar de «el cruce se aflojó»");

di("");
di("── CANDIDATOS ──");
const filas = [];
for (const c of candidatos) {
  const l = laxo(c), e = endurecido(c), h = enHead(c);
  filas.push({ ...c, laxo: l, endurecido: e, enHead: h });
  di("");
  di(`  ${c.id} · ${c.tipo}`);
  di(`      ${c.enunciado}`);
  di(`      POR QUÉ: ${c.porQue}`);
  di(`      cruce LAXO (vocabulario) ....... ${l ? "ya escrito" : "NO está"}`);
  di(`      cruce ENDURECIDO (enunciado) ... ${e ? "ya escrito" : "NO está"}   ← manda`);
  di(`      en HEAD (antes de esta tanda) .. ${h === null ? "NO MEDIDO" : h ? "ya estaba" : "NO estaba"}`);
  di(`      DESTINO: ${c.destino}`);
  if (l && !e) di("      ⚠ el laxo SOBRE-CASA: sus palabras están, el enunciado no.");
}

const reglas = filas.filter((f) => f.tipo === "REGLA");
const suben = reglas.filter((f) => !f.endurecido);
const yaEstaban = reglas.filter((f) => f.endurecido);

di("");
di("── VEREDICTO ──");
di(`  candidatos ................ ${filas.length}`);
di(`  · REGLA ................... ${reglas.length}`);
di(`      · YA escritas ......... ${yaEstaban.length}${yaEstaban.length ? " :: " + yaEstaban.map((f) => f.id).join(", ") : ""}`);
di(`      · SUBEN a CLAUDE.md ... ${suben.length}${suben.length ? " :: " + suben.map((f) => f.id).join(", ") : ""}`);
di(`  · EVENTO (se quedan) ...... ${filas.filter((f) => f.tipo === "EVENTO").length}`);
di("  (el número se escribe aunque sea cero: «no encontré» y «no barrí» son la misma salida)");

di("");
di(ok
  ? "  ✅ los tres testigos pasan y HEAD es legible — el cruce ADJUDICA"
  : "  ❌ el cruce NO adjudica: arriba está el testigo que falla");

writeFileSync(
  join(OUT, "regla12-barrido-136.json"),
  JSON.stringify({
    meta: { tanda: "136.ª", fecha: new Date().toISOString().slice(0, 10), offline: true, adjudica: ok },
    limite: "sólo ve enunciados YA ESCRITOS EN PROSA; una regla que viva en el código es invisible",
    testigos: TESTIGOS.map((t) => ({ ...t, hallado: CLAUDE_PLANO.includes(plano(t.clave)) })),
    candidatos: filas,
    veredicto: { reglas: reglas.length, yaEstaban: yaEstaban.map((f) => f.id), suben: suben.map((f) => f.id) },
  }, null, 2) + "\n",
  "utf8",
);
writeFileSync(join(OUT, "regla12-barrido-136.log"), salida.join("\n") + "\n", "utf8");

process.exitCode = ok ? 0 : 1;
