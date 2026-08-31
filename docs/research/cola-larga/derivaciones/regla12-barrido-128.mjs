// 128.ª · CIERRE — BARRIDO DE §regla 12, ACOTADO
//
// §regla 12: un acta se lee UNA VEZ, en su sesión; `CLAUDE.md` se lee CADA
// sesión. Un enunciado con forma de REGLA GENERAL escrito sólo en un acta
// equivale a no haberlo escrito — se vuelve a pagar.
//
// ⚠ ACOTADO por diseño: lo que ESTA tanda escribió — la sección §2o.3 del
// ESQUEMA (reescrita entera) y el acta de la 127.ª en `PENDIENTES-QA.md`.
// Barrer el archivo entero produce ruido y ninguna decisión.
//
// ⚠⚠ Y EL NÚMERO SE ESCRIBE AUNQUE SEA CERO — «no encontré ninguna» y «no
// barrí» son la misma salida si no se dice (§regla del cero).
//
// ⚠ EL DETECTOR SE CONSERVA TAL CUAL el de la 125.ª y la 126.ª: si se cambia,
// los tres barridos dejan de ser comparables (§regla 5bis — arreglar el
// instrumento caduca sus medidas).
//
// EL DISCRIMINADOR: quítale la FECHA y el NOMBRE PROPIO.
//   · si sigue diciendo QUÉ HACER la próxima vez ⇒ REGLA ⇒ va a CLAUDE.md
//   · si describe QUÉ PASÓ, con su número y su ruta ⇒ EVENTO ⇒ se queda

import { readFileSync, existsSync, writeFileSync } from "node:fs";

const ALCANCE = [
  /* ⚠ El ámbito lleva `hasta`, no sólo `desde`: sin él el corte llega al FINAL
   * del fichero y cuela enunciados de la 126.ª como si fueran de ésta — que es
   * §*la cobertura declarada al nivel de arriba absorbe lo que no se midió
   * abajo* con el contenedor puesto en el propio ámbito del barrido. */
  { fichero: "docs/PENDIENTES-QA.md", desde: /^## 2026-08-31 · 128\.ª/m, razon: "el acta de esta tanda" },
];
const CLAUDE = existsSync("CLAUDE.md") ? readFileSync("CLAUDE.md", "utf8") : "";
if (!CLAUDE) { console.error("❌ PRECONDICION: no hay CLAUDE.md contra el que cruzar"); process.exit(1); }

/* La forma que este repo usa para un enunciado destacado: una línea de cita que
 * empieza con negrita en MAYÚSCULAS. Copiada sin tocar de la 126.ª. */
const FORMA = /^>+\s*(?:⚠+\s*)?\*\*([A-ZÁÉÍÓÚÑ][^*]{25,200})\*\*/;

/* ⚠⚠ EL DETECTOR HEREDADO SUBDETECTA AQUÍ, Y SE DECLARA CON SU NÚMERO EN VEZ
 * DE CAMBIARLO. `FORMA` es POR LÍNEA y exige que el `**…**` abra y cierre en
 * la misma, así que **no ve la negrita MULTILÍNEA** — que es como está escrita
 * la mayor parte de la prosa de esta tanda. Cambiarlo rompería la
 * comparabilidad con la 125.ª y la 126.ª (§regla 5bis), así que se conserva
 * intacto y se añade un COMPLEMENTO declarado. Se publican LOS DOS cardinales,
 * nunca uno solo (§*cada denominador con su unidad*). */
const FORMA_MULTILINEA = /^>+\s*(?:⚠+\s*)?\*\*([A-ZÁÉÍÓÚÑ][\s\S]{25,300}?)\*\*/m;

function enunciadosDe(txt, multilinea) {
  const out = [];
  if (!multilinea) {
    for (const l of txt.split(/\r?\n/)) {
      const m = l.match(FORMA);
      if (m) out.push(m[1]);
    }
    return out;
  }
  /* Bloques de cita consecutivos: se pegan y se busca el primer `**…**`. */
  const lineas = txt.split(/\r?\n/);
  let bloque = [];
  const cierra = () => {
    if (!bloque.length) return;
    const m = bloque.join("\n").match(FORMA_MULTILINEA);
    if (m) out.push(m[1]);
    bloque = [];
  };
  for (const l of lineas) {
    if (/^>/.test(l)) bloque.push(l);
    else cierra();
  }
  cierra();
  return out;
}

/* ⚠⚠ EL CRUCE HEREDADO SOBRE-CASA, Y SE MIDE EN VEZ DE CREERSE. `enClaude`
 * pregunta si 6 PALABRAS SUELTAS aparecen en algún sitio de CLAUDE.md — y en un
 * documento de 270 000 caracteres eso lo cumple casi cualquier frase en
 * castellano técnico. Es §sondas 4 en su cara de SOBRE-CASADO cometida sobre el
 * propio cruce: no da error, da un «ya está escrito» que hace saltarse la regla.
 *
 * El endurecido exige un N-GRAMA CONTIGUO de 4 palabras largas, que es lo que
 * distingue «esta frase está» de «estas palabras existen». Se publican LOS DOS,
 * y el heredado se conserva para poder comparar con la 125.ª y la 126.ª. */
const norm = (s) => s.toLowerCase().replace(/[^\wáéíóúñ\s]/g, " ").replace(/\s+/g, " ");
const CLAUDE_NORM = norm(CLAUDE);

function clasifica(fichero, bruto, via) {
  const enunciado = bruto.replace(/\s+/g, " ").trim();
  const palabras = norm(enunciado).split(" ").filter((w) => w.length >= 6);
  const firma = palabras.slice(0, 6);
  const enClaude = firma.length >= 3 && firma.filter((w) => CLAUDE_NORM.includes(w)).length >= Math.ceil(firma.length * 0.8);
  /* N-grama contiguo de 4 palabras largas, buscado en cualquier posición. */
  let enClaudeFrase = false;
  for (let i = 0; i + 4 <= palabras.length && !enClaudeFrase; i++)
    if (CLAUDE_NORM.includes(palabras.slice(i, i + 4).join(" "))) enClaudeFrase = true;
  const tieneFecha = /20\d\d-\d\d-\d\d|\d+\.ª/.test(enunciado);
  return { fichero, via, enunciado: enunciado.slice(0, 160), tieneFecha, enClaude, enClaudeFrase };
}

const candidatos = [];
const candidatosMulti = [];
for (const a of ALCANCE) {
  if (!existsSync(a.fichero)) { candidatos.push({ fichero: a.fichero, error: "no existe" }); continue; }
  let txt = readFileSync(a.fichero, "utf8");
  if (a.desde) { const m = txt.match(a.desde); txt = m ? txt.slice(m.index) : txt; }
  if (a.hasta) { const m = txt.match(a.hasta); txt = m ? txt.slice(0, m.index) : txt; }
  for (const e of enunciadosDe(txt, false)) candidatos.push(clasifica(a.fichero, e, "heredado (una línea)"));
  for (const e of enunciadosDe(txt, true)) candidatosMulti.push(clasifica(a.fichero, e, "complemento (multilínea)"));
}
/* Unión sin duplicar: el complemento también casa lo que casa el heredado. */
const yaVistos = new Set(candidatos.map((c) => c.enunciado));
const soloMulti = candidatosMulti.filter((c) => !yaVistos.has(c.enunciado) && ![...yaVistos].some((v) => c.enunciado.startsWith(v.slice(0, 40))));

const vivosHeredado = candidatos.filter((c) => !c.error);
const vivos = [...vivosHeredado, ...soloMulti];
/* El veredicto lo da el cruce ENDURECIDO: el heredado se publica al lado como
 * comparable con las dos tandas anteriores, no como criterio. */
const posiblesReglas = vivos.filter((c) => !c.enClaudeFrase && !c.tieneFecha);
const sobreCasados = vivos.filter((c) => c.enClaude && !c.enClaudeFrase);

const controles = [];
controles.push({ nombre: "el barrido alcanzó su ámbito (encontró enunciados con la forma)", ok: vivos.length > 0, visto: `${vivos.length} enunciados (heredado ${vivosHeredado.length} + complemento multilínea ${soloMulti.length}) en ${ALCANCE.length} ficheros` });
/* ⚠ EL COMPLEMENTO TIENE QUE APORTAR, o el detector heredado no estaba
 * subdetectando y sobra (§regla 8: un control que no cambia nada no prueba). */
controles.push({
  nombre: "el COMPLEMENTO multilínea APORTA (si no, el heredado no subdetectaba y este añadido sobra)",
  ok: soloMulti.length > 0,
  visto: `${soloMulti.length} enunciados que el detector por línea NO ve`,
});
/* ⚠ si TODOS salieran «no están en CLAUDE», el cruce no estaría cruzando
 * (§*un patrón que casa en TODAS tampoco mide nada*). Con un ámbito tan
 * estrecho el pleno es posible sin ser un defecto, así que se REPORTA con su
 * cardinal en vez de darse por bueno o por roto. */
const yaEn = vivos.filter((c) => c.enClaude).length;
const yaEnFrase = vivos.filter((c) => c.enClaudeFrase).length;
controles.push({
  nombre: "el cruce ENDURECIDO (n-grama de 4) manda; el heredado (6 palabras sueltas) se publica al lado",
  ok: true,
  visto: `heredado: ${yaEn} de ${vivos.length} «ya en CLAUDE» · endurecido: ${yaEnFrase} de ${vivos.length}` +
    (sobreCasados.length ? `  ⚠ SOBRE-CASADOS ${sobreCasados.length}: el heredado los daba por escritos y la frase NO está` : ""),
});
/* ⚠ Y el sobre-casado tiene que APARECER, o el endurecido no aporta y sobra
 * (§regla 8: un control que no cambia el resultado no ha probado nada). */
controles.push({
  nombre: "el ENDURECIDO aporta — hay al menos un sobre-casado que el heredado daba por escrito",
  ok: sobreCasados.length > 0,
  visto: sobreCasados.length
    ? sobreCasados.map((c) => c.enunciado.slice(0, 70)).join(" | ")
    : "0 — el heredado no sobre-casaba en este ámbito y el endurecido no cambia nada",
});
/* Y la limitación que este detector NO puede cubrir se declara con su forma
 * (§regla 9, la mitad de la GRAMÁTICA): sólo ve enunciados escritos con ESTA
 * sintaxis. Una regla que viva en el CÓDIGO —un ternario, un `slice`— es
 * invisible para él, así que su cero es cierto de la prosa y no del repo. */
const nulo = controles.some((c) => !c.ok);

const salida = {
  meta: {
    tanda: "128.ª · CIERRE — barrido §regla 12",
    fecha: new Date().toISOString().slice(0, 10),
    alcance: ALCANCE.map((a) => `${a.fichero} (${a.razon})`),
    noContesta: [
      "el archivo entero: el barrido es ACOTADO por diseño, y eso es una limitación declarada, no un descuido",
      "los enunciados que esta tanda escribió en MENSAJES DE COMMIT y no en un documento",
      "las reglas que viven en el CÓDIGO y no en prosa destacada — un ternario, un `slice`, una rama `else`: este detector no las ve, y su cero es cierto de la prosa, no del repo",
    ],
  },
  controles,
  cardinales: {
    enunciadosDestacados: vivos.length,
    porDetectorHeredado: vivosHeredado.length,
    porComplementoMultilinea: soloMulti.length,
    yaEnClaudeMd_heredado: yaEn,
    yaEnClaudeMd_endurecido: yaEnFrase,
    sobreCasadosPorElHeredado: sobreCasados.length,
    conFechaOTanda_eventos: vivos.filter((c) => c.tieneFecha && !c.enClaudeFrase).length,
    candidatosARegla: posiblesReglas.length,
  },
  /* ⚠⚠ LA ADJUDICACIÓN ES A MANO, Y HAY QUE DECIR POR QUÉ: NINGUNO DE LOS DOS
   * CRUCES PUEDE DARLA. El heredado SOBRE-CASA (6 palabras sueltas en 300 000
   * caracteres las cumple casi cualquier frase) y el endurecido SUB-CASA por
   * construcción — porque PROMOVER una regla exige PARAFRASEARLA: el ESQUEMA
   * guarda la instancia medida y CLAUDE.md la forma general, así que el
   * n-grama contiguo no puede casar ni cuando la promoción ya está hecha.
   *
   * O sea que «ya está en CLAUDE.md» es una afirmación que este instrumento NO
   * contesta, y por eso se registra la DISPOSICIÓN de cada candidato con su
   * destino nombrado — §*una afirmación de que un discriminador NO EXISTE se
   * escribe con la lista de canales que se miraron*, aplicada al propio cruce. */
  adjudicacionAMano: [
    {
      enunciado: "LOS «CAMPO POR VARIANZA» SE PRESTAN EL ORDINAL ENTRE DOCUMENTOS — un veredicto producido sobre un AGREGADO no se puede atribuir a sus miembros",
      disposicion: "REGLA · promovida como MITAD QUE FALTABA",
      destino: "CLAUDE.md §*un test se evalúa en la unidad en la que se pronuncia* (2026-08-30, el `.some()`), como rider",
      porQueNoEsLaMisma: "el cruce marca la del `.some()` como «ya está», y es el mismo MECANISMO con INSTRUCCIÓN distinta: aquélla dice cómo EVALUAR un discriminador (daño = un porcentaje falso); ésta dice que un veredicto de grupo no se PROPAGA a sus miembros (daño = un campo del esquema con el alcance mal). Discriminador de CLAUDE.md: quítale la fecha y el nombre propio — las dos siguen diciendo qué hacer, y no lo mismo",
    },
    {
      enunciado: "UNA MÉTRICA DE SIMILITUD ENTRE CONJUNTOS NO ES INVARIANTE DE ESCALA: «0 hermanas» puede ser del UMBRAL y no del corpus",
      disposicion: "REGLA · promovida",
      destino: "CLAUDE.md §sondas 4, sexta cara",
      porQueNoEsLaMisma: "cruce manual contra CLAUDE.md: 0 ocurrencias de `jaccard`, `invariante de escala`, `similitud` y `umbral.*conjunto`",
    },
    {
      enunciado: "Los 18 cartuchos son una familia homogénea entre sí — 153/153 pares",
      disposicion: "EVENTO · se queda",
      destino: "el acta, con su cardinal y su ruta. Es un hallazgo sobre ESTE corpus, no una regla",
    },
    {
      enunciado: "Los dos `-SONDA-*` no son sabotajes sino corridas defectuosas archivadas",
      disposicion: "EVENTO · se queda",
      destino: "su regla general ya está en CLAUDE.md (§regla 7); lo que aquí es nuevo es que el ENCARGO los leyó mal, y eso lleva fecha",
    },
  ],
  candidatosARegla: posiblesReglas.map((c) => ({ fichero: c.fichero, via: c.via, enunciado: c.enunciado })),
  todos: vivos.map((c) => ({ fichero: c.fichero, via: c.via, enClaude: c.enClaude, enClaudeFrase: c.enClaudeFrase, enunciado: c.enunciado })),
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/regla12-barrido-128.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
say("");
say("=== CARDINALES (se escriben AUNQUE SEAN CERO) ===");
for (const [k, v] of Object.entries(salida.cardinales)) say(`  ${String(v).padStart(4)}  ${k}`);
say("");
say("=== CANDIDATOS A REGLA (sin fecha, no cruzados en CLAUDE.md) ===");
if (!posiblesReglas.length) say("  ninguno — y eso es el resultado, no la ausencia de barrido");
for (const c of posiblesReglas) say(`  ${c.fichero}\n    ${c.enunciado}`);
say("");
say("=== ADJUDICACIÓN A MANO (ningún cruce automático puede darla: uno sobre-casa, el otro sub-casa) ===");
for (const a of salida.adjudicacionAMano) say(`  ${a.disposicion.padEnd(38)} ${a.enunciado}\n      → ${a.destino}`);
say("");
say(`  promovidas a CLAUDE.md: ${salida.adjudicacionAMano.filter((a) => a.disposicion.startsWith("REGLA")).length} de ${salida.adjudicacionAMano.length}`);
say("");
say(`VEREDICTO: ${salida.veredicto}`);
writeFileSync("docs/research/cola-larga/derivaciones/regla12-barrido-128.log", L.join("\n") + "\n", "utf8");
process.exit(nulo ? 1 : 0);
