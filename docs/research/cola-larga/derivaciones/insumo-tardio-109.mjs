/* ═════════════════════════════════════════════════════════════════════════
 *  ¿CUÁNTAS SONDAS GASTAN EL TRABAJO ANTES DE MIRAR SU INSUMO?
 *  109.ª · cierre de verificación · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * QUÉ PREGUNTA CONTESTA
 *   Una sonda que levanta navegador y necesita una congelada para su cruce
 *   puede comprobar que existe ANTES de medir o DESPUÉS. Si lo hace después,
 *   una ausencia le cuesta la corrida entera — y el modo de fallo no es un
 *   número falso, es TRABAJO TIRADO y, si la corrida se mata a medias,
 *   EVIDENCIA perdida (§regla 5).
 *
 *   Nació de un caso concreto: el PASO 0 de esta misma tanda arregló el
 *   ENOENT de `qa:f33-spec` cambiándole el NOMBRE del fichero, y dejó la
 *   comprobación donde estaba (L472) — con el `launch()` en L275. O sea que
 *   el commit describe el daño («levantaba Chrome, medía las 31 rutas y
 *   moría con ENOENT en su cruce») y arregló otra cosa. La pregunta de aquí
 *   es si eso es INSTANCIA o CLASE.
 *
 * QUÉ PREGUNTAS **NO** CONTESTA  (§*antes de construir sobre una medida,
 * escribe qué preguntas NO contesta* — lo segundo es justo lo que el fichero
 * congelado no puede decirte)
 *   · si la congelada que cada una nombra es la CORRECTA. Existir no es ser
 *     la buena: eso es §regla 5bis y se adjudica caso a caso;
 *   · si alguna está muerta HOY. Eso lo contesta `resolutores-109.mjs`, que
 *     cruza contra el disco. Aquí sólo se mira CUÁNDO comprueba, no QUÉ;
 *   · nada de las sondas sin arranque: una derivación offline que lee tarde
 *     no gasta nada, así que la pregunta no se le aplica;
 *   · y NO propone el arreglo de ninguna. Esta tanda ficha, no toca sondas.
 *
 * ⚠ LA MAGNITUD, QUE ES LO ÚNICO QUE HAY QUE HEREDAR DE AQUÍ
 *   La v1 de este detector midió DISTANCIA EN LÍNEAS entre el arranque y la
 *   comprobación, y dio **11**. Estaba SOBRE-CASADO (§sondas 4, 3.ª cara: un
 *   detector que encuentra de más no da error, da un número plausible de
 *   más). Un `launch()` en L65 y una lectura en L72 no gasta nada: son
 *   cabecera. Lo que hace caro un insumo tardío no es que su línea esté
 *   abajo, es que ENTRE MEDIAS SE MIDA.
 *
 *   v2 mide la magnitud correcta: ¿hay NAVEGACIÓN entre el arranque y la
 *   primera comprobación? Es §*la causa común: el NIVEL al que se mide* con
 *   el contenedor puesto en el número de línea.
 *
 * CONTROL (§regla 8: un negativo sin control no es un negativo), tres casos
 * conocidos de antemano, cada uno por un lado distinto:
 *   · `f33-spec.mjs`  DEBE salir en v1 Y en v2 — derivado a mano: launch
 *     L275, mide, comprueba L472. Si no sale, el detector no ve lo que dice;
 *   · `kb-cmp.mjs`    DEBE salir en v1 y NO en v2 (launch L65, lee L72). Es
 *     la instancia SEPARADORA: si ninguna cambia de lado, v2 y v1 son la
 *     misma función escrita de dos maneras y v2 no valía la pena escribirla
 *     (§*antes de fichar una indeterminación, comprueba que las dos
 *     hipótesis sean DISTINTAS*);
 *   · `lib.mjs`       NO puede salir: DEFINE `launch`, no lo llama. Es
 *     §*confundir LECTOR con ESCRITOR*, que el detector de `resolutores-109`
 *     ya pagó en esta misma tanda.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const RAIZ = fileURLToPath(new URL("../../../../", import.meta.url));

/* ── El universo: todo lo ejecutable bajo `scripts/`, sin node_modules ────── */
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
const esCodigo = (L) => !/^\s*[*/]/.test(L);
const corto = (f) => relative(RAIZ, f).replace(/\\/g, "/");

/* ⚠ EXCEPCIÓN DECLARADA, no derivada — y por eso va escrita con su razón.
 * `ruido.mjs` lee las ráfagas de su campaña INCLUIDA LA QUE ELLA MISMA ACABA
 * DE ESCRIBIR. Su lectura no se puede adelantar POR CONSTRUCCIÓN: el fichero
 * no existe hasta que la corrida termina. No es un insumo tardío, es un
 * producto propio. El instrumento no puede distinguirlo solo. */
const AUTO_PRODUCIDO = {
  "scripts/qa/ruido.mjs": "lee las ráfagas de la campaña, incluida la que ella misma acaba de escribir: no existe hasta que la corrida termina",
};

const TODAS = fuentes(join(RAIZ, "scripts"));
const filas = [];
let sinArranque = 0, sinLectura = 0;

for (const f of TODAS) {
  const rel = corto(f);
  const lineas = readFileSync(f, "utf8").split("\n");

  /* ¿ARRANCA? — y `lib.mjs` no: define `launch`, no lo llama (control 3) */
  let lArranque = -1;
  if (!rel.endsWith("qa/lib.mjs"))
    for (let i = 0; i < lineas.length; i++)
      if (esCodigo(lineas[i]) && ARRANQUE.test(lineas[i])) { lArranque = i + 1; break; }
  if (lArranque < 0) { sinArranque++; continue; }

  /* ¿LEE una congelada nombrada por literal? (el canal cableado y el de la
   * constante: ventana de 25 líneas hacia atrás para atrapar el `const`) */
  const lecturas = [];
  for (let i = 0; i < lineas.length; i++) {
    const L = lineas[i];
    if (!esCodigo(L)) continue;
    if (!/readFileSync\s*\(|existsSync\s*\(/.test(L)) continue;
    const ventana = lineas.slice(Math.max(0, i - 25), i + 1).join("\n");
    if (!/medidas/.test(ventana) || !LITERAL_JSON.test(ventana)) continue;
    lecturas.push(i + 1);
  }
  if (!lecturas.length) { sinLectura++; continue; }

  const tardias = lecturas.filter((n) => n > lArranque);
  if (!tardias.length) {
    filas.push({ rel, lArranque, primera: Math.min(...lecturas), clase: "ANTES" });
    continue;
  }

  /* LA MAGNITUD: ¿se navega entre el arranque y la 1.ª comprobación tardía? */
  const corte = Math.min(...tardias);
  let navega = 0;
  for (let i = lArranque; i < corte - 1; i++) if (esCodigo(lineas[i]) && NAVEGA.test(lineas[i])) navega++;
  if (!navega) { filas.push({ rel, lArranque, primera: corte, clase: "INOCUA", navega: 0 }); continue; }

  /* ¿la lectura es PRECONDICIÓN (si falta, la corrida no vale) o EXTRA
   * (hay fallback y el código sigue)? Derivado, no supuesto:
   *   `if (!existsSync(X))` + throw/exit ....... precondición CON guarda
   *   `if (existsSync(X)) { …lectura… }` ....... extra OPCIONAL
   *   `readFileSync` sin `existsSync` ........... precondición PELADA        */
  const ctx = lineas.slice(Math.max(0, corte - 3), Math.min(lineas.length, corte + 10)).join("\n");
  let modo;
  if (/if\s*\(\s*!\s*existsSync/.test(ctx) && /throw |process\.exit/.test(ctx)) modo = "precondición (guarda tardía)";
  else if (/if\s*\(\s*existsSync/.test(ctx)) modo = "extra opcional";
  else modo = "precondición PELADA";

  const auto = AUTO_PRODUCIDO[rel];
  filas.push({
    rel, lArranque, primera: corte, navega, clase: "GASTA", modo,
    legitima: !!auto || modo === "extra opcional",
    razon: auto ?? (modo === "extra opcional" ? "hay fallback: si no está, la corrida sigue" : null),
  });
}

/* ═══════════════════════════════ INFORME ════════════════════════════════ */
const say = console.log;
const P = (n) => String(n).padStart(4);
say("══════════════════════════════════════════════════════════════════════");
say("  INSUMO TARDÍO — ¿instancia o clase?  ·  109.ª cierre  ·  2026-08-26");
say("══════════════════════════════════════════════════════════════════════");
say("  magnitud: NAVEGACIÓN entre el arranque y la comprobación.");
say("            NO la distancia en líneas — eso es la v1, y dio 11 de más.");
say("");

const antes = filas.filter((r) => r.clase === "ANTES");
const inocuas = filas.filter((r) => r.clase === "INOCUA");
const gastan = filas.filter((r) => r.clase === "GASTA");
const defectos = gastan.filter((r) => !r.legitima);
const legitimas = gastan.filter((r) => r.legitima);

say("── EL REPARTO, CON SU DENOMINADOR ────────────────────────────────────");
say(`  fuentes ejecutables bajo scripts/ ................. ${P(TODAS.length)}`);
say(`    ├─ NO arrancan navegador ni clon ............... ${P(sinArranque)}   la pregunta no se les aplica`);
say(`    └─ CON arranque (launch / iniciarClon) ......... ${P(TODAS.length - sinArranque)}   ← el universo`);
say(`         ├─ no leen ninguna congelada cableada ..... ${P(sinLectura)}`);
say(`         └─ leen una congelada ..................... ${P(filas.length)}`);
say(`              ├─ la comprueban ANTES de arrancar ... ${P(antes.length)}  ✅`);
say(`              └─ la leen DESPUÉS .................. ${P(inocuas.length + gastan.length)}`);
say(`                   ├─ sin navegar entre medias .... ${P(inocuas.length)}  ·  tardía INOCUA`);
say(`                   └─ NAVEGANDO entre medias ...... ${P(gastan.length)}  ⛔ gasta el trabajo`);
say(`                        ├─ legítimas .............. ${P(legitimas.length)}  ✅`);
say(`                        └─ DEFECTOS ............... ${P(defectos.length)}  ⛔`);
say("");

say(`── ⛔ DEFECTOS: precondición obligatoria comprobada TARDE ── ${defectos.length}`);
for (const r of defectos.sort((a, b) => b.navega - a.navega)) {
  say(`  ⛔ ${r.rel}`);
  say(`       arranque L${r.lArranque} → ${r.navega} navegación(es) → comprueba L${r.primera}   [${r.modo}]`);
}
say("");

say(`── ✅ LEGÍTIMAS: leen tarde y hacen bien ── ${legitimas.length}`);
say("   Éstas NO son ruido que se descarta: son las que fijan el LÍMITE de la");
say("   regla. Sin ellas escritas, se relee como «toda lectura va antes del");
say("   launch» y produce dos arreglos falsos.");
for (const r of legitimas) {
  say(`  ✅ ${r.rel}   L${r.lArranque} → L${r.primera}`);
  say(`       ${r.razon}`);
}
say("");

say(`── · TARDÍAS INOCUAS: línea posterior, 0 navegación ── ${inocuas.length}`);
say("   Son las instancias SEPARADORAS entre v1 y v2: v1 las marcaba, v2 no.");
for (const r of inocuas) say(`  ·  ${r.rel}   L${r.lArranque} → L${r.primera}`);
say("");
say(`── ✅ COMPRUEBAN ANTES DE ARRANCAR ── ${antes.length}`);
for (const r of antes) say(`  ✅ ${r.rel}   lee L${r.primera} · arranca L${r.lArranque}`);
say("");

/* ── CONTROL ─────────────────────────────────────────────────────────────── */
say("══════════════════════════════════════════════════════════════════════");
say("  CONTROL (§regla 8) — tres casos conocidos de antemano, uno por lado");
say("══════════════════════════════════════════════════════════════════════");
const spec = filas.find((r) => r.rel.endsWith("qa/f33-spec.mjs"));
const kb = filas.find((r) => r.rel.endsWith("qa/kb-cmp.mjs"));
const lib = filas.find((r) => r.rel.endsWith("qa/lib.mjs"));
const c1 = spec?.clase === "GASTA" && !spec.legitima;
const c2 = kb?.clase === "INOCUA";
const c3 = !lib;
say(`  ${c1 ? "✅" : "❌"} f33-spec sale en v1 Y en v2 (el caso que originó la pregunta)`);
say(`       medido: arranque L${spec?.lArranque} · ${spec?.navega} navegación · comprueba L${spec?.primera}`);
say(`  ${c2 ? "✅" : "❌"} kb-cmp sale en v1 y NO en v2 — la instancia SEPARADORA`);
say(`       medido: L${kb?.lArranque} → L${kb?.primera}, ${kb?.navega} navegaciones`);
say(`  ${c3 ? "✅" : "❌"} lib.mjs NO aparece: DEFINE launch, no lo llama (lector≠escritor)`);
say("");
say(`  ⇒ instancias SEPARADORAS entre v1 y v2: ${inocuas.length}`);
say("     Si fuera 0, v1 y v2 serían la MISMA función escrita de dos maneras y");
say("     no habría dos hipótesis que separar — sólo una escrita dos veces.");
say(`  ⇒ v1 habría publicado ${inocuas.length + gastan.length} · v2 publica ${gastan.length} · defectos reales ${defectos.length}`);
say("");
say(`  ⇒ CONTROL: ${[c1, c2, c3].filter(Boolean).length}/3`);
say(`  ⇒ VEREDICTO: ${defectos.length > 1 ? `CLASE (${defectos.length})` : defectos.length === 1 ? "INSTANCIA (1)" : "NINGUNA"}`);
say("");
say("  ⚠ Y LA CLASE NO SON N SONDAS: es que NO HAY SITIO COMÚN por el que pase");
say("    la comprobación de precondiciones, como sí lo hay para `Evaluadas`,");
say("    `w()` y `gritaSiRevienta()` en lib.mjs. Las de arriba son sus");
say("    instancias de hoy — arreglarlas una a una es §regla 4 otra vez.");

if ([c1, c2, c3].filter(Boolean).length !== 3) {
  console.error("\n❌ el control no pasa: los ceros de arriba no son datos.");
  process.exit(2);
}
