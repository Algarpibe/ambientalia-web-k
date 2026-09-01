// 137.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
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
      "La verificación de un arreglo se toma DONDE EL CASO EXISTE, no donde el código corre. Si el dominio que ejecuta la rama arreglada no ejercita el caso, el arreglo es NO-OP allí — y un control atado a esa corrida no puede distinguir «la rama funciona» de «la rama está muerta»: los dos dan el mismo verde.",
    porQue:
      "Medido hoy: el arreglo del `<textarea>` vive en `formularioDe` de `extractor-f35.mjs`, que recorre los 4 documentos del lote F3-5 — y ésos traen `textarea` 0 veces (censo `controles-form-137.json`: `arquetipos` 0 · `paginas` 1). La prueba: `f35-extraido.json` no cambió un byte tras el arreglo. El caso existe en `contacto`, que es de OTRA colección, así que el testigo positivo hay que ir a buscarlo allí — se corre `formularioDe` cortada por estructura sobre su html y se exige que el `<textarea name=field[23]>` salga NOMBRADO. Es §*una regla derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR para ese caso* con el objeto puesto en LA VERIFICACIÓN en vez de en la regla, y §regla 28c con el caso conocido de antemano viviendo fuera del dominio de la sonda.",
    vocabulario: ["donde el caso existe", "no-op", "dominio"],
    enunciadoClave:
      "La verificación de un arreglo se toma DONDE EL CASO EXISTE, no donde el código corre",
    destino: "CLAUDE.md, §regla 28c / §*el marcador prueba que el build es nuevo, no que el cambio tenga efecto*",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Al RE-DECLARAR el alcance de una guarda que afirmaba de más, se publican DOS cardinales y no uno: lo que ahora CUBRE y lo que sigue SIN PROBAR — derivado del dominio, nombrando las clases que el dominio no ejercita. Publicar sólo «0 perdidos» dice que la guarda es completa, y lo que dice el dato es que es completa PARA LO QUE SE MIDIÓ.",
    porQue:
      "Medido: tras el arreglo, `PERDIDOS EN SILENCIO` pasa de 1 a 0 sobre 9 etiquetas censadas — y `optgroup` · `datalist` · `output` · `progress` · `meter` salen a 0 ocurrencias en las 13 instancias, así que la guarda NO está probada para ellas: si entran, caerán por la rama del `<select>` o por ninguna. El 0 de perdidos y el 5 de sin-probar son cubos distintos y sólo publicándolos juntos es auditable. Es §regla 25 (una guarda que afirma de más) más §regla 14 (una limitación sin su número se lee como nota al pie), unidas en el momento en que la guarda se reescribe.",
    vocabulario: ["re-declarar", "sin probar", "cardinal"],
    enunciadoClave:
      "se publican DOS cardinales y no uno: lo que ahora CUBRE y lo que sigue SIN PROBAR",
    destino: "CLAUDE.md, §regla 25 / §regla 14",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "CMS-7 resuelto en `A · NO UNIFICAR` por el propietario, con su operación de deshacer NOMBRADA (empieza separada, deshacerla es fusionar, el lado barato) y su coste latente con disparador. `F3-5-CODE-DIVERGE` cerrada, y la cierra el CERO: intersección de contenido 0 entre `codigo` (1 campo) y `formulario-arq` (11).",
    porQue:
      "Tiene fecha, opción elegida y cardinales: es una decisión sobre ESTE repo. La regla que lo gobierna —§regla 23, se cita el criterio CON SU OPERACIÓN— ya está escrita y se aplicó.",
    vocabulario: ["CMS-7"],
    enunciadoClave: "F3-5-CODE-DIVERGE",
    destino: "ESQUEMA-CMS.md §CMS-7 + PENDIENTES-QA.md §137.ª + PLAN-FASE-3.md",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "El testigo del censo llegó con la POLARIDAD cableada al defecto —exigía `textarea` NO enumerado— y se habría muerto en rojo el día del arreglo, describiéndolo como avería. Re-atado a lo cierto en los DOS estados (que el censo VEA la etiqueta), los dos sabotajes siguen mordiendo tras el arreglo.",
    porQue:
      "La REGLA ya está escrita —§regla 5ter (arreglar el objeto caduca el control) y §regla 28d (un control cuyo testigo es un defecto conocido no puede leer su propia ausencia)—. Lo de hoy es una instancia suya, cazada dentro de la misma tanda que escribió el testigo.",
    vocabulario: ["polaridad", "testigo"],
    enunciadoClave: "El testigo se ata a un estado POSITIVO que separe las dos causas",
    destino: "PENDIENTES-QA.md §137.ª (instancia de una regla ya escrita)",
  },
  {
    id: "E3",
    tipo: "EVENTO",
    enunciado:
      "El sabotaje `ciega-el-censo` publica `PERDIDOS EN SILENCIO: 0`, el MISMO número que la corrida buena: el veredicto no separa, lo que separa es el testigo. Y la primera corrida del censo dio `instancias: 0` por un lector que no casaba — un cero que sin testigos se habría leído como «no se pierde nada», en verde.",
    porQue:
      "Las dos son instancias de reglas escritas: §regla 28c (el control de un cero no es que el resultado separe, es el caso conocido de antemano) y §sondas 4 (un selector que no casa con nada no es un cero). Tienen número y fecha, no enunciado nuevo.",
    vocabulario: ["ciega", "separadoras"],
    enunciadoClave: "el control de un cero NO es que el resultado separe",
    destino: "PENDIENTES-QA.md §137.ª",
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
di("137.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces y su NEGATIVO");
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
  join(OUT, "regla12-barrido-137.json"),
  JSON.stringify({
    meta: { tanda: "137.ª", fecha: new Date().toISOString().slice(0, 10), offline: true, adjudica: ok },
    limite: "sólo ve enunciados YA ESCRITOS EN PROSA; una regla que viva en el código es invisible",
    testigos: TESTIGOS.map((t) => ({ ...t, hallado: CLAUDE_PLANO.includes(plano(t.clave)) })),
    candidatos: filas,
    veredicto: { reglas: reglas.length, yaEstaban: yaEstaban.map((f) => f.id), suben: suben.map((f) => f.id) },
  }, null, 2) + "\n",
  "utf8",
);
writeFileSync(join(OUT, "regla12-barrido-137.log"), salida.join("\n") + "\n", "utf8");

process.exitCode = ok ? 0 : 1;
