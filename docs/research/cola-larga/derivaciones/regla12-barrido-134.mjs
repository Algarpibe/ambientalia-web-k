// 134.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
//
// §regla 12: un acta se lee UNA VEZ; `CLAUDE.md` se lee CADA sesión. Un
// enunciado con forma de regla general escrito sólo en un acta equivale a no
// haberlo escrito. El discriminador: quítale la fecha y el nombre propio — si
// sigue diciendo qué hacer, es regla.
//
// ⚠ ACOTADO a las actas de esta tanda, y **el número se escribe aunque sea
// cero**: «no encontré ninguna» y «no barrí» son la misma salida si no se dice.
//
// ⚠⚠ LOS DOS CRUCES, y manda el ENDURECIDO. El encargo avisa de que el de la
// 133.ª publicó «0 de 6» con las 4 reglas YA ESCRITAS, y por eso el cruce va
// con su NEGATIVO: un enunciado que SE SABE escrito tiene que salir «ya
// escrito», y uno inventado tiene que salir «NO está». Sin esos dos testigos,
// ni un 0 ni un pleno adjudican (§regla 28c).
//
// OFFLINE: no mide un píxel, no abre navegador, no toca red ni DB.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const CLAUDE = readFileSync(join(RAIZ, "CLAUDE.md"), "utf8");

const salida = [];
const di = (s = "") => { salida.push(s); console.log(s); };

/* Los candidatos se ENUMERAN a mano —salen de leer las actas de la tanda, que
 * es lo que §regla 12 pide—. El instrumento los CRUZA, no los encuentra.
 *
 * ⚠ Y su LÍMITE se declara (§regla 14): este barrido sólo ve enunciados YA
 * ESCRITOS EN PROSA. Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un
 * `slice`— es invisible para él, así que su cero es cierto de la prosa y no del
 * repo. */
const candidatos = [
  {
    id: "R1",
    tipo: "REGLA",
    enunciado:
      "Un servicio se da por disponible ABRIENDO UN SOCKET, no leyendo el estado de su proceso. Lo DECLARADO y lo PUBLICADO son dos canales distintos, y el cliente usa el segundo: un contenedor puede estar `Up`, servir por dentro y tener su binding declarado sin que nadie lo haya publicado al host.",
    porQue:
      "Medido dos tandas seguidas. `docker ps` dice `Up 16 minutes`, `pg_isready` DENTRO dice *accepting connections*, `HostConfig.PortBindings` declara `5432→55432` — y `NetworkSettings.Ports` sale `{\"5432/tcp\":[]}` y el socket da ECONNREFUSED. Los cuatro primeros canales son ciertos y ninguno contesta la pregunta que se estaba haciendo. La 133.ª lo escribió SÓLO en su acta (`0359ba0` toca `PENDIENTES-QA.md`, no `CLAUDE.md`), que es §regla 12 en su forma pura.",
    vocabulario: ["socket", "publicado", "declarado"],
    enunciadoClave: "se da por disponible ABRIENDO UN SOCKET, no leyendo el estado de su proceso",
    destino: "CLAUDE.md, §El principio — verificar contra la salida SERVIDA, con el canal puesto en el puerto",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Un MARCADOR DE TEXTO no delimita una región de código. Si el marcador puede vivir DENTRO de la región —un comentario en medio de un array—, leer «del marcador al cierre» se traga la cola entera y no da error: da un número plausible de más. Lo que delimita es la ESTRUCTURA (casar llaves) o el `diff`.",
    porQue:
      "Medido en esta misma tanda, sobre la sonda que la tanda escribió: leer el tramo por su comentario «Tramo F3-5» publicó 205 tokens donde hay 23, porque el comentario está DENTRO del array y no delante. Es la cara *sobre-casado* de §sondas 4 aplicada a un lector de fuente. Lo cazó el control del cardinal conocido de antemano, no la lectura del código.",
    vocabulario: ["marcador", "sobre-casa", "estructura"],
    enunciadoClave: "Un MARCADOR DE TEXTO no delimita una región de código",
    destino: "CLAUDE.md, §sondas 4 (cara sobre-casado) / §regla 8b (derivar del `diff`)",
  },
  {
    id: "R3",
    tipo: "REGLA",
    enunciado:
      "El control de una re-medición se ata al MECANISMO, no al recuento que se espera. Atar el control al número convierte el HALLAZGO en control: el día que el objeto cambie de verdad, el control cae y se lee como avería del instrumento en vez de como el resultado.",
    porQue:
      "Aplicado aquí: el control de «9 de 9 bloquean» NO es exigir 9, es exigir que el validador siga rechazando un `<form>` testigo y aceptando un html limpio. Con el control atado al 9, una tanda futura en la que el tramo SÍ moviera el veredicto leería su propio hallazgo como instrumento roto.",
    vocabulario: ["control", "mecanismo", "hallazgo"],
    enunciadoClave: "se ata al MECANISMO, no al recuento que se espera",
    destino: "CLAUDE.md, §regla 5ter (arreglar el objeto caduca el control)",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "`F3-5-CODE-DIVERGE` re-medida con el tramo puesto: A · 9 de 9 siguen bloqueando; B · ALCANZA 3 campos y ADMITE DE MÁS 0 de 23. Y `codigo-arq` da 0 instancias, no 1.",
    porQue: "Tiene fecha, cardinal y nombre propio: es un hallazgo sobre ESTE repo, no una regla.",
    vocabulario: ["F3-5-CODE-DIVERGE"],
    enunciadoClave: "F3-5-CODE-DIVERGE",
    destino: "PENDIENTES-QA.md §134.ª + ESQUEMA-CMS.md §2o.9 + PLAN-FASE-3.md",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "El volumen de `kunak-cms-pg` es ANÓNIMO (`2ebbe245…`): sobrevive a stop/start/restart y moriría con un `compose up` que recreara el contenedor. Y la migración de `formulario-arq` no existe: la última es del 2026-08-31.",
    porQue: "Hechos de la instalación y del árbol de hoy, con su fecha y su hash: evento.",
    vocabulario: ["kunak-cms-pg"],
    enunciadoClave: "kunak-cms-pg",
    destino: "PENDIENTES-QA.md §134.ª + PLAN-FASE-3.md (celda F3-5)",
  },
];

/* ── TESTIGOS del propio cruce (§regla 28c) ──────────────────────────────────
 * El encargo avisa: el cruce de la 133.ª publicó «0 de 6» con 4 reglas YA
 * escritas. Así que el cruce lleva su caso conocido de antemano por los DOS
 * lados, o su número no adjudica. */
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
  /**
   * ⚠⚠ **T± · EL TESTIGO QUE DESTAPÓ LA TERCERA CARA DEL MISMO SUB-CASADO.**
   *
   * La 133.ª arregló dos: el SALTO DE LÍNEA (envuelto a ~78 columnas) y el `>`
   * de CITA. Falta la tercera y es de la misma familia — **las MAYÚSCULAS**:
   * casi todo enunciado nuevo entra en este documento como TITULAR en caps, así
   * que un `includes` sensible a caja no lo encuentra **el día que se escribe**,
   * que es justo el día que se comprueba. La v1 de este barrido publicó «R1 y
   * R2 NO están» con las dos YA ESCRITAS, cuatro minutos después de escribirlas.
   *
   * Este testigo es un titular en CAPS que lleva meses en `CLAUDE.md`: si sale
   * «NO está», el cruce es ciego a la caja y su cero no adjudica.
   */
  {
    id: "T±",
    espera: true,
    clave: "UN SELECTOR QUE NO CASA CON NADA NO ES UN CERO: ES UN DEFECTO",
    que: "un TITULAR EN MAYÚSCULAS que lleva meses escrito",
  },
];

di("=".repeat(78));
di("134.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces y su NEGATIVO");
di("=".repeat(78));

/** Cruce A · HEREDADO: ¿aparecen las PALABRAS en CLAUDE.md? SOBRE-CASA. */
const laxo = (c) => c.vocabulario.every((v) => CLAUDE.toLowerCase().includes(v.toLowerCase()));
/**
 * Cruce B · ENDURECIDO: ¿aparece el ENUNCIADO? SUB-CASA. Manda éste.
 *
 * Se normalizan espacios y se quitan los `>` de cita: `CLAUDE.md` va envuelto a
 * ~78 columnas y casi toda regla vive en un blockquote, así que un `includes`
 * literal no encontraría nunca un enunciado de más de una línea. Sigue siendo
 * estricto —exige el enunciado, no su vocabulario—; lo que deja de exigir es el
 * salto de línea.
 */
/**
 * ⚠⚠ **Y LA CAJA ES LA TERCERA CARA DEL MISMO SUB-CASADO (2026-09-01).** La
 * 133.ª arregló el salto de línea y el `>` de cita. Faltaba ésta, y es la que
 * muerde **el día que se escribe la regla**: un enunciado entra en este
 * documento como TITULAR EN CAPS y se cruza contra su redacción en prosa, así
 * que un `includes` sensible a caja dice «NO está» sobre algo escrito cuatro
 * minutos antes. **No es aflojar el cruce**: sigue exigiendo el enunciado
 * entero, no su vocabulario — y su testigo negativo (T-) lo demuestra.
 */
const plano = (s) => s.replace(/^[>\s]+/gm, " ").replace(/\s+/g, " ").toLowerCase();
const CLAUDE_PLANO = plano(CLAUDE);
const endurecido = (c) => CLAUDE_PLANO.includes(plano(c.enunciadoClave));

/**
 * ⚠ **EL ANTES/DESPUÉS, que es lo único que prueba que la regla LLEGÓ.** Que el
 * cruce diga «ya escrito» después de escribirla no separa *«la escribí»* de
 * *«el cruce se aflojó»* (§regla 21: un caso que pasa a verde ajustando su
 * expectativa no ha arreglado nada). La separadora es correr el MISMO cruce
 * contra el `CLAUDE.md` de `HEAD` —que no las tiene— y exigir que allí salgan
 * «NO está» y aquí «ya escrito».
 */
const { execFileSync } = await import("node:child_process");
let CLAUDE_HEAD = null;
try {
  CLAUDE_HEAD = plano(execFileSync("git", ["show", "HEAD:CLAUDE.md"], { cwd: RAIZ, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
} catch { /* sin HEAD legible, el antes/después se declara NO MEDIDO */ }
const enHead = (c) => (CLAUDE_HEAD === null ? null : CLAUDE_HEAD.includes(plano(c.enunciadoClave)));

let ok = true;
const fallo = (m) => { ok = false; di(`   ❌ ${m}`); };

di("\n## 0 · EL CRUCE SE ADJUDICA ANTES DE USARLO (§regla 28c)");
for (const t of TESTIGOS) {
  const r = CLAUDE_PLANO.includes(plano(t.clave));
  if (r === t.espera) di(`   ✅ ${t.id} · ${t.que} → ${r ? "ya escrito" : "NO está"}, como se esperaba`);
  else fallo(`${t.id} · ${t.que} → ${r ? "ya escrito" : "NO está"}, y se esperaba lo contrario: el cruce NO adjudica`);
}

di("\n   | id | tipo   | cruce A (laxo, heredado) | cruce B (ENDURECIDO, manda) |");
di("   |----|--------|--------------------------|------------------------------|");
let laxoSi = 0, endSi = 0;
for (const c of candidatos) {
  const a = laxo(c), b = endurecido(c);
  if (a) laxoSi++;
  if (b) endSi++;
  di(`   | ${c.id} | ${c.tipo.padEnd(6)} | ${(a ? "ya escrito" : "NO está").padEnd(24)} | ${(b ? "ya escrito" : "NO está").padEnd(28)} |`);
}

di("\n## 0b · EL ANTES/DESPUÉS — ¿llegó la regla, o se aflojó el cruce?");
if (CLAUDE_HEAD === null) {
  di("   ⚠ NO MEDIDO: no se pudo leer `HEAD:CLAUDE.md`. El «ya escrito» de abajo no separa");
  di("     «la escribí» de «el cruce se aflojó» (§regla 21).");
} else {
  di("   | id | en HEAD (antes) | en el árbol (después) | ¿llegó? |");
  di("   |----|-----------------|-----------------------|---------|");
  for (const c of candidatos.filter((x) => x.tipo === "REGLA")) {
    const a = enHead(c), b = endurecido(c);
    const v = !a && b ? "SÍ — entró en esta tanda" : a && b ? "ya estaba antes" : !a && !b ? "no está ni antes ni ahora" : "⚠ estaba y ya no";
    di(`   | ${c.id} | ${(a ? "ya escrito" : "NO está").padEnd(15)} | ${(b ? "ya escrito" : "NO está").padEnd(21)} | ${v} |`);
  }
  const movidas = candidatos.filter((c) => c.tipo === "REGLA" && !enHead(c) && endurecido(c)).length;
  di(`\n   reglas que ENTRARON en esta tanda: ${movidas}`);
  di(`   ⇒ el cruce no se aflojó: en HEAD las mismas claves salen «NO está» con el MISMO`);
  di(`     cruce insensible a caja, así que la diferencia es el texto y no el instrumento.`);
}

di(`\n   laxo «ya escrito» ......... ${laxoSi} de ${candidatos.length}`);
di(`   ENDURECIDO «ya escrito» ... ${endSi} de ${candidatos.length}   ← el que manda`);
di(`   ⚠ el laxo SOBRE-CASA (basta con que el vocabulario exista en algún sitio) y el`);
di(`     endurecido SUB-CASA (exige el literal). Ninguno adjudica solo — la decisión va A MANO.`);

const reglas = candidatos.filter((c) => c.tipo === "REGLA");
const eventos = candidatos.filter((c) => c.tipo === "EVENTO");
di(`\n   candidatos: ${candidatos.length}  ·  REGLA ${reglas.length}  ·  EVENTO ${eventos.length}`);

di("\n── LAS REGLAS, con su destino ──");
for (const c of reglas) {
  di(`\n   ${c.id} · ${c.enunciado}`);
  di(`      por qué: ${c.porQue}`);
  di(`      destino: ${c.destino}`);
  di(`      cruces: laxo ${laxo(c) ? "ya escrito" : "NO está"} · ENDURECIDO ${endurecido(c) ? "ya escrito" : "NO está"}`);
}

di("\n── LOS EVENTOS, que se quedan donde están ──");
for (const c of eventos) di(`   ${c.id} · ${c.destino}`);

di("\n── LÍMITE DECLARADO (§regla 14) ──");
di("   este barrido sólo ve enunciados YA ESCRITOS EN PROSA de las actas de la tanda.");
di("   Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un `slice`— es invisible");
di("   para él: su cero es cierto de la prosa y NO del repo.");
di("   Y el cruce endurecido exige el literal: un enunciado REFORMULADO sale «NO está»");
di("   aunque su contenido ya sea ley — por eso la adjudicación final es a mano.");

di("\n" + "=".repeat(78));
di(ok
  ? `VEREDICTO · ${reglas.length} reglas · ${eventos.length} eventos · endurecido ${endSi}/${candidatos.length} · el cruce pasa sus 2 testigos`
  : "VEREDICTO · ❌ el cruce no adjudica — sus testigos caen");
di("=".repeat(78));

const json = {
  meta: { tanda: "134.ª", fecha: new Date().toISOString().slice(0, 10) },
  testigos: TESTIGOS.map((t) => ({ ...t, resultado: CLAUDE_PLANO.includes(plano(t.clave)) })),
  candidatos: candidatos.map((c) => ({ ...c, laxo: laxo(c), endurecido: endurecido(c), enHead: enHead(c) })),
  resumen: { total: candidatos.length, reglas: reglas.length, eventos: eventos.length, laxoSi, endSi },
  limite: "sólo ve enunciados en prosa; una regla escrita en código es invisible para este barrido",
  ok,
};
const base = join(OUT, "regla12-barrido-134");
let dest = `${base}.json`;
if (existsSync(dest) && !process.env.PISAR) {
  const prev = JSON.parse(readFileSync(dest, "utf8"));
  if (JSON.stringify({ ...prev, meta: null }) !== JSON.stringify({ ...json, meta: null })) {
    dest = `${base}-${json.meta.fecha}.json`;
    di(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${dest.split(/[\\/]/).pop()}`);
  }
}
writeFileSync(dest, JSON.stringify(json, null, 1) + "\n");
writeFileSync(`${base}.log`, salida.join("\n") + "\n");
di(`\ncongelado: ${dest.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);
process.exit(ok ? 0 : 1);
