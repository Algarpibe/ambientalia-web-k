/* ═════════════════════════════════════════════════════════════════════════
 *  ¿ES EL «11» DE §regla 37 REPRODUCIBLE POR ALGUNA DEFINICIÓN DEL DETECTOR?
 *  110.ª · PASO 0 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * EL DEFECTO QUE LA ORIGINA
 *   `insumo-tardio-109.mjs` publica DOS números para la misma cosa, y los dos
 *   en el MISMO fichero:
 *     · L154  say("… eso es la v1, y dio 11 de más")     ← CABLEADO
 *     · L221  `${inocuas.length + gastan.length}` = 10   ← DERIVADO
 *   Su `.log` publica los dos (L5 dice 11, L70 dice 10), y la ficha
 *   §F3-3-INSUMO-TARDIO los mezcla igual («publicó 11» contra una tabla con
 *   10). Es §regla 5ter: *el valor que un control escribe se DERIVA de la
 *   fuente que lo declara, nunca se cablea*.
 *
 *   Y la aritmética lo delata sin medir nada: 11 con 5 separadoras deja el
 *   otro lado en 6, y no hay 6 en ninguna parte del reparto. Con 10 cierra:
 *   10 − 5 = 5, que son las `gastan`.
 *
 * QUÉ PREGUNTA CONTESTA
 *   NO «¿cuál de los dos elijo?» — eso sería §*una lectura se borra, no se
 *   concilia con una nota al pie* aplicada al revés. La pregunta es la de
 *   §regla 9: **¿es el 11 un número DERIVABLE por alguna definición del
 *   detector, o es un número RECORDADO?** Un derivado se escribe con su
 *   definición; un recordado se va.
 *
 *   Se contesta BARRIENDO el espacio de definiciones en vez de razonándolo
 *   (§*antes de escribir una regla ajustada, BARRE el parámetro*). Cuatro ejes
 *   binarios ⇒ 16 detectores, y se cuenta cuántos publican 11.
 *
 * QUÉ PREGUNTAS **NO** CONTESTA
 *   · si la v1 REALMENTE tenía esos defectos. La v1 **nunca se commiteó**
 *     —`git log --all` sobre el fichero devuelve UN solo commit, el de la v2—
 *     así que no hay original contra el que diffear. Esto reconstruye
 *     CANDIDATOS, no recupera la v1. Es §regla 5 cobrada: lo que no se
 *     commiteó no se puede exhibir;
 *   · cuál de los 16 corrió de verdad aquel día. Si varios dan 11, el número
 *     es reproducible pero no queda identificada la definición;
 *   · nada sobre si los 3 DEFECTOS de la v2 son correctos. Eso ya está
 *     adjudicado y esta derivación no lo toca.
 *
 * ⚠ DE DÓNDE SALEN LOS TRES EJES DE DEFECTO, Y LA CORRECCIÓN QUE TRAEN
 *   El encargo de la 110.ª los atribuye a la v1 de ESTE detector: «sobre-casó
 *   `corpus/INDICE.json`, confundió LECTOR con ESCRITOR, contó un comentario
 *   como lectura». Derivado contra el archivo (§regla 8b: *los hechos que un
 *   pre-registro afirme se comprueban al escribirlo, contra el archivo, no de
 *   memoria*), la atribución **es de otro detector**:
 *
 *     · `resolutores-109.mjs` L26-35 los declara como defectos de **SU**
 *       primera versión, los tres con su instancia nombrada
 *       (`corpus/INDICE.json` · `f33-geo.mjs:730` · `caducidad-geo390.mjs:39`);
 *     · `insumo-tardio-109.mjs` L52-54 sólo cita el segundo, y **como guarda
 *       heredada**: «Es §confundir LECTOR con ESCRITOR, que el detector de
 *       `resolutores-109` ya pagó en esta misma tanda».
 *
 *   O sea que los tres defectos existen y están medidos — **en el detector de
 *   al lado**. Se barren aquí igualmente, porque son las guardas que la v2
 *   lleva puestas y quitarlas es exactamente «la v1 de este detector»: lo que
 *   se comprueba es si ALGUNA de esas retiradas produce 11.
 *
 * CONTROL (§regla 8: un negativo sin control no es un negativo)
 *   · el detector con las 4 guardas puestas DEBE reproducir la congelada de
 *     la 109.ª al número: 11 antes · 5 inocuas · 5 gastan · 3 defectos. Si no,
 *     la reconstrucción no reconstruye y ningún cero suyo es dato;
 *   · y el eje NAVEGA DEBE separar: si con y sin él sale lo mismo, no hay dos
 *     hipótesis (§*antes de fichar una indeterminación, comprueba que las dos
 *     hipótesis sean DISTINTAS*).
 * ═════════════════════════════════════════════════════════════════════════ */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const RAIZ = fileURLToPath(new URL("../../../../", import.meta.url));

function fuentes(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === "medidas") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) fuentes(p, acc);
    else if (e.name.endsWith(".mjs") || e.name.endsWith(".js")) acc.push(p);
  }
  return acc;
}

const ARRANQUE = /\b(launch\s*\(|iniciarClon\s*\()/;
const NAVEGA = /\b(openPage\s*\(|\.goto\s*\(|settle\s*\()/;
const LITERAL_JSON = /["'`][^"'`\n]*\.json["'`]/;
const esComentario = (L) => /^\s*[*/]/.test(L);
const corto = (f) => relative(RAIZ, f).replace(/\\/g, "/");

const TODAS = fuentes(join(RAIZ, "scripts"));
const FUENTES = TODAS.map((f) => ({ rel: corto(f), lineas: readFileSync(f, "utf8").split("\n") }));

/* ── EL DETECTOR PARAMETRIZADO ────────────────────────────────────────────
 *  Cuatro ejes binarios. `true` = la guarda PUESTA (o sea, la v2 de hoy).
 *    gateNavega  : ¿exige NAVEGACIÓN entre medias?  (false = v1: sólo la línea)
 *    exigeMedidas: ¿el literal .json tiene que estar bajo `medidas/`?
 *    excluyeLib  : ¿se descarta `lib.mjs`, que DEFINE launch y no lo llama?
 *    saltaComents: ¿se ignoran las líneas de comentario?                     */
function detecta({ gateNavega, exigeMedidas, excluyeLib, saltaComents }) {
  const esCodigo = (L) => (saltaComents ? !esComentario(L) : true);
  let antes = 0, inocuas = 0, gastan = 0, sinArranque = 0, sinLectura = 0;
  const nombres = { antes: [], inocuas: [], gastan: [] };

  for (const { rel, lineas } of FUENTES) {
    let lArranque = -1;
    if (!(excluyeLib && rel.endsWith("qa/lib.mjs")))
      for (let i = 0; i < lineas.length; i++)
        if (esCodigo(lineas[i]) && ARRANQUE.test(lineas[i])) { lArranque = i + 1; break; }
    if (lArranque < 0) { sinArranque++; continue; }

    const lecturas = [];
    for (let i = 0; i < lineas.length; i++) {
      const L = lineas[i];
      if (!esCodigo(L)) continue;
      if (!/readFileSync\s*\(|existsSync\s*\(/.test(L)) continue;
      const ventana = lineas.slice(Math.max(0, i - 25), i + 1).join("\n");
      if (exigeMedidas && !/medidas/.test(ventana)) continue;
      if (!LITERAL_JSON.test(ventana)) continue;
      lecturas.push(i + 1);
    }
    if (!lecturas.length) { sinLectura++; continue; }

    const tardias = lecturas.filter((n) => n > lArranque);
    if (!tardias.length) { antes++; nombres.antes.push(rel); continue; }

    if (!gateNavega) { gastan++; nombres.gastan.push(rel); continue; }

    const corte = Math.min(...tardias);
    let navega = 0;
    for (let i = lArranque; i < corte - 1; i++) if (esCodigo(lineas[i]) && NAVEGA.test(lineas[i])) navega++;
    if (!navega) { inocuas++; nombres.inocuas.push(rel); }
    else { gastan++; nombres.gastan.push(rel); }
  }
  return { antes, inocuas, gastan, despues: inocuas + gastan, sinArranque, sinLectura, nombres };
}

/* ═══════════════════════════════ INFORME ════════════════════════════════ */
const say = console.log;
say("══════════════════════════════════════════════════════════════════════");
say("  ¿ES EL «11» REPRODUCIBLE?  ·  110.ª PASO 0  ·  2026-08-26");
say("══════════════════════════════════════════════════════════════════════");
say("  El detector de la 109.ª publica 11 (cableado, L154) y 10 (derivado,");
say("  L221) para la misma cosa. Aquí se barre el espacio de definiciones y");
say("  se cuenta cuántas publican 11.");
say("");

/* ── CONTROL 1: la v2 de hoy reproduce su congelada ─────────────────────── */
const V2 = { gateNavega: true, exigeMedidas: true, excluyeLib: true, saltaComents: true };
const v2 = detecta(V2);
const CONGELADA = { antes: 11, inocuas: 5, gastan: 5, despues: 10 };
const c1 =
  v2.antes === CONGELADA.antes && v2.inocuas === CONGELADA.inocuas &&
  v2.gastan === CONGELADA.gastan && v2.despues === CONGELADA.despues;
say("── CONTROL 1 · ¿reconstruye la v2 congelada de la 109.ª? ──────────────");
say(`  congelada : antes ${CONGELADA.antes} · inocuas ${CONGELADA.inocuas} · gastan ${CONGELADA.gastan} · después ${CONGELADA.despues}`);
say(`  reconstr. : antes ${v2.antes} · inocuas ${v2.inocuas} · gastan ${v2.gastan} · después ${v2.despues}`);
say(`  ${c1 ? "✅" : "❌"} ${c1 ? "reproduce" : "NO reproduce — ningún cero de abajo es dato"}`);
say("");

/* ── EL BARRIDO: 4 ejes binarios = 16 detectores ────────────────────────── */
const ejes = ["gateNavega", "exigeMedidas", "excluyeLib", "saltaComents"];
const filas = [];
for (let m = 0; m < 16; m++) {
  const cfg = {};
  ejes.forEach((e, i) => { cfg[e] = !((m >> i) & 1); });
  const r = detecta(cfg);
  filas.push({ cfg, r });
}

const etiqueta = (cfg) =>
  ejes.map((e) => (cfg[e] ? "·" : e === "gateNavega" ? "N" : e === "exigeMedidas" ? "M" : e === "excluyeLib" ? "L" : "C")).join("");

say("── EL BARRIDO · 4 ejes binarios ⇒ 16 detectores ───────────────────────");
say("   guardas RETIRADAS:  N=sin gate de navegación (la «v1»)  M=sin exigir");
say("   `medidas/`  L=sin excluir lib.mjs  C=sin saltar comentarios");
say("");
say("   guardas   antes  inocuas  gastan  DESPUÉS   ¿publica 11?");
for (const { cfg, r } of filas) {
  const once = [r.antes, r.inocuas, r.gastan, r.despues].filter((n) => n === 11).length;
  const cual = [];
  if (r.antes === 11) cual.push("antes");
  if (r.inocuas === 11) cual.push("inocuas");
  if (r.gastan === 11) cual.push("gastan");
  if (r.despues === 11) cual.push("DESPUÉS");
  say(
    `   ${etiqueta(cfg).padEnd(9)} ${String(r.antes).padStart(5)} ${String(r.inocuas).padStart(8)} ` +
    `${String(r.gastan).padStart(7)} ${String(r.despues).padStart(8)}   ${once ? "SÍ → " + cual.join(", ") : "no"}`,
  );
}
say("");

/* ── CONTROL 2: ¿el eje NAVEGA separa? ──────────────────────────────────── */
const sinGate = detecta({ ...V2, gateNavega: false });
const c2 = sinGate.gastan !== v2.gastan;
say("── CONTROL 2 · ¿el eje NAVEGA tiene instancias SEPARADORAS? ───────────");
say(`  con gate (v2) : gastan ${v2.gastan}`);
say(`  sin gate (v1) : gastan ${sinGate.gastan}`);
say(`  separadoras   : ${sinGate.gastan - v2.gastan}   ${v2.nombres.inocuas.join(", ")}`);
say(`  ${c2 ? "✅" : "❌"} ${c2 ? "separa: v1 y v2 NO son la misma función" : "NO separa"}`);
say("");

/* ── EL VEREDICTO ───────────────────────────────────────────────────────── */
const conOnce = filas.filter(({ r }) => r.despues === 11 || r.gastan === 11);
const soloAntes = filas.filter(({ r }) => r.antes === 11);
say("══════════════════════════════════════════════════════════════════════");
say("  VEREDICTO");
say("══════════════════════════════════════════════════════════════════════");
say(`  detectores barridos ................................ ${filas.length}`);
say(`  que publican 11 como «leen DESPUÉS» o «gastan» ..... ${conOnce.length}   ← la magnitud que §37 cita`);
say(`  que publican 11 como «comprueban ANTES» ............ ${soloAntes.length}   ← otra magnitud, otro eje`);
say("");
if (!conOnce.length) {
  say("  ⇒ NINGUNA de las 16 definiciones publica 11 en la magnitud que §regla 37");
  say("    cita («la v1 … dio 11 de más», o sea de MÁS sobre los 5 que gastan).");
  say("    El 11 NO es derivable por ninguna retirada de guarda: es un NÚMERO");
  say("    RECORDADO (§regla 9) y se va.");
  say("");
  say("  ⇒ Y de dónde salió, que está en su propio .log una línea más arriba:");
  say(`    «la comprueban ANTES de arrancar ... ${v2.antes}» (L13 de la congelada).`);
  say("    El 11 es el cardinal del OTRO lado del reparto — las que lo hacen");
  say("    BIEN—, citado como si fuera el de las que lo hacen mal. Es §*dos");
  say("    lecturas dan cardinales distintos midiendo objetos distintos*, con");
  say("    los dos números a cuatro renglones de distancia en el mismo fichero.");
} else {
  say(`  ⇒ el 11 SÍ es reproducible, por ${conOnce.length} definición(es):`);
  for (const { cfg } of conOnce) say(`      ${etiqueta(cfg)}`);
  say("    Se escribe CON SU DEFINICIÓN al lado, nunca a secas.");
}
say("");
say(`  ⇒ el número que la congelada SÍ reproduce para «v1 habría publicado»`);
say(`    es ${sinGate.gastan}, y cierra la aritmética: ${sinGate.gastan} − ${v2.nombres.inocuas.length} separadoras = ${v2.gastan} que gastan.`);
say("");
say(`  ⇒ CONTROL: ${[c1, c2].filter(Boolean).length}/2`);

if (![c1, c2].every(Boolean)) {
  console.error("\n❌ el control no pasa: los ceros de arriba no son datos.");
  process.exit(2);
}
