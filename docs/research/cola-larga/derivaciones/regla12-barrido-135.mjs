// 135.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
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
      "Cuando una tanda ascienda un defecto de EVENTO a CLASE, el cardinal de la clase se DERIVA barriendo el repo EN ESE MOMENTO — no se hereda de las instancias que la descubrieron. Las instancias que descubren una clase son las que alguien tenía delante, no las que hay.",
    porQue:
      "Medido hoy: §regla 42 se fichó como CLASE con 2 instancias (`autores` 2026-08-27 · `arquetipos` 2026-08-31) y el barrido da 4. Las otras 2 —`registro_slugs` 2026-08-04 y `f3_3_paginas_cola_larga` 2026-08-23— son ANTERIORES a las dos que la descubrieron, o sea que llevaban meses expuestas mientras la clase ya estaba escrita. Es §regla 9 —un recuento afirmado de memoria— aplicada al CARDINAL DE UNA CLASE, y el sitio donde más engaña: el documento dice «es una clase, luego toda migración futura la hereda» y nadie mira las pasadas.",
    vocabulario: ["clase", "cardinal", "derive"],
    enunciadoClave:
      "el cardinal de la clase se DERIVA barriendo el repo EN ESE MOMENTO",
    destino: "CLAUDE.md, §regla 9 (un recuento afirmado de memoria se barre) / §regla 42",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Un control cuyo testigo es un DEFECTO CONOCIDO no puede leer su propia ausencia: «no lo encuentro porque el objeto se arregló» y «no lo encuentro porque no sé buscarlo» son la MISMA salida, y las dos caen en rojo. El testigo se ata a un estado POSITIVO que las separa — «EN ALCANCE y protegido», no «expuesto».",
    porQue:
      "Medido en esta tanda, sobre el barrido que la tanda escribió: los dos testigos de §regla 42 salieron NO DETECTADOS y las dos causas estaban vivas a la vez —el regex podía no casar, y de hecho los dos ya llevaban `IF EXISTS`—. Atado a «EN ALCANCE y PROTEGIDO», el testigo distingue «fuera del patrón» de «arreglado» y el control adjudica. Es §sondas 4 —un selector que no casa con nada no es un cero— con el cero puesto en el TESTIGO DE UN CONTROL, y §regla 5ter con la polaridad puesta en vez del valor.",
    vocabulario: ["testigo", "ausencia", "positivo"],
    enunciadoClave:
      "Un control cuyo testigo es un DEFECTO CONOCIDO no puede leer su propia ausencia",
    destino: "CLAUDE.md, §regla 5ter / §regla 28c (el control por caso conocido de antemano)",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "§regla 42 tiene 4 instancias, no 2: 2 arregladas (`autores` L9 · `arquetipos` L660, con IF EXISTS) y 2 EXPUESTAS (`20260804_122225_registro_slugs.ts` · `20260823_131718_f3_3_paginas_cola_larga.ts`). Denominador: 12 migraciones en alcance de 26.",
    porQue: "Tiene fecha, cardinal y nombre propio de fichero: es un hallazgo sobre ESTE repo.",
    vocabulario: ["registro_slugs"],
    enunciadoClave: "registro_slugs",
    destino: "PENDIENTES-QA.md §135.ª + PLAN-FASE-3.md",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "La premisa de F3-5-CODE-DIVERGE contestada por config: `MODULO_CODIGO.html` de `paginas` es `{type:'code'}` SIN `validate` (0 campos de contenido validados, 18 de ritmo); `codigo-arq.contenido` SÍ lo lleva (1 de contenido, 12 de ritmo). Denominador entero: 448 campos con `validate` en 20 colecciones.",
    porQue: "Cardinales de este esquema con su fecha: evento. La regla que lo gobierna ya está escrita.",
    vocabulario: ["F3-5-CODE-DIVERGE"],
    enunciadoClave: "F3-5-CODE-DIVERGE",
    destino: "PENDIENTES-QA.md §135.ª + ESQUEMA-CMS.md §2o.9",
  },
  {
    id: "E3",
    tipo: "EVENTO",
    enunciado:
      "El socket 127.0.0.1:55432 sigue en ECONNREFUSED con el binding declarado (`55432`) y NO publicado (`{\"5432/tcp\":[]}`), nadie escuchando en el puerto y el volumen ANÓNIMO `2ebbe245…`. Tripwires: KV-01 al 21.2 % y KV-08 al 100 % de 339 658 chars = 2.26× el aviso. 219 sondas.",
    porQue: "Estado de la instalación y del árbol de hoy: evento. Los cinco canales ya son regla escrita.",
    vocabulario: ["ECONNREFUSED"],
    enunciadoClave: "ECONNREFUSED",
    destino: "PENDIENTES-QA.md §135.ª",
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
di("135.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces y su NEGATIVO");
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
  join(OUT, "regla12-barrido-135.json"),
  JSON.stringify({
    meta: { tanda: "135.ª", fecha: new Date().toISOString().slice(0, 10), offline: true, adjudica: ok },
    limite: "sólo ve enunciados YA ESCRITOS EN PROSA; una regla que viva en el código es invisible",
    testigos: TESTIGOS.map((t) => ({ ...t, hallado: CLAUDE_PLANO.includes(plano(t.clave)) })),
    candidatos: filas,
    veredicto: { reglas: reglas.length, yaEstaban: yaEstaban.map((f) => f.id), suben: suben.map((f) => f.id) },
  }, null, 2) + "\n",
  "utf8",
);
writeFileSync(join(OUT, "regla12-barrido-135.log"), salida.join("\n") + "\n", "utf8");

process.exitCode = ok ? 0 : 1;
