/**
 * TEST EN NEGATIVO de `c-inventario`.
 * Uso: npm run qa:c-inventario-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Los tres modos de fallo, y **cada uno tiene que caer por LO SUYO**:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `selector-muerto` | **lector MUERTO** — `<h9 class="entry-title">` no casa en ninguna de las 76 | «esas páginas no tienen título», que es como se lee un cero |
 * | `control-roto` | **el CONTROL no reproduce** la transcripción a mano | un fallo de lectura del corpus (los 76 se siguen leyendo) |
 * | `campo-inventado` | un campo del esquema **sin lector** en la sonda | un campo que el corpus no trae |
 * | (control) | ✅ verde: 76 leídos, 60 comparaciones, 0 muertos, 0 sin lector | — |
 *
 * ── Por qué `campo-inventado` es el sabotaje que esta sonda necesitaba ─────
 * Los otros dos son los clásicos. El tercero cubre el modo de fallo **propio de
 * un inventario**: que el esquema crezca y la sonda siga informando cobertura
 * sobre los campos viejos. Sin él, un campo nuevo en `colecciones.ts` sale del
 * informe **por omisión**, y la omisión se lee como *«está cubierto»* — que es
 * exactamente el hueco que esta tanda vino a cerrar para casos y faqs.
 *
 * ── Y lo que el CONTROL ya se cobró en la primera corrida ─────────────────
 * El lector de `soluciones` recortaba hasta el primer `</ul>` y devolvía **un
 * solo producto** en los tres casos que tienen varios. Un array de UNO es un
 * dato plausible: ningún recuento lo habría visto. Lo cazó comparar contra los
 * 4 transcritos a mano, y su salida está congelada como
 * `c-inventario-SONDA-CORTABA-SOLUCIONES-EN-EL-PRIMER-UL.json` (§sondas 7).
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/c-inventario.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 76 documentos leídos, el control reproduce los 4+2 transcritos, 0 muertos, 0 sin lector",
    env: {},
    exit: 0,
    salidaTiene: /0 discrepancia\(s\) · 0 lector\(es\) muerto\(s\) · 0 campo\(s\) sin lector/,
    comprueba: (j) => {
      const n = Object.keys(j.documentos).length;
      if (n !== 76) return `leyó ${n} documentos, no 76`;
      if (j.control.discrepancias !== 0) return `${j.control.discrepancias} discrepancias en el CONTROL`;
      if (j.control.comparaciones < 50) return `sólo ${j.control.comparaciones} comparaciones: el control no está midiendo`;
      /* Sin cobertura leída los sabotajes no probarían nada: un inventario que
       * no cuenta ningún campo saldría verde por vacío. */
      if (Object.keys(j.cobertura.casos.campos).length < 15) return `sólo ${Object.keys(j.cobertura.casos.campos).length} campos de caso con lector`;
      if (j.caminoDeExtraccion.casos.conPostContent !== 0) return "el camino de extracción no está derivado del índice";
      return null;
    },
  },
  {
    etiqueta: "selector-muerto",
    porQue: "un lector que no casa en NINGUNA de las 76 ⇒ MUERTO, nunca «ese campo no está»",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    etiqueta: "control-roto",
    porQue: "el CONTROL deja de reproducir la transcripción ⇒ rojo, aunque los 76 se lean",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    salidaTiene: /discrepancia\(s\)/,
    comprueba: (j) => {
      if (j.control.discrepancias === 0) return "el sabotaje no movió el control";
      if (Object.keys(j.documentos).length !== 76) return "cayó por no leer el corpus, no por el control";
      return null;
    },
  },
  {
    etiqueta: "campo-inventado",
    porQue: "un campo del esquema sin lector ⇒ ERROR, nunca desaparece del informe en silencio",
    env: { SABOTAJE: "campo-inventado" },
    exit: 2,
    salidaTiene: /campo\(s\) del esquema SIN LECTOR/,
    comprueba: (j) => {
      if (!j.camposSinLector.length) return "el sabotaje no llegó a la comprobación de campos";
      if (Object.keys(j.documentos).length !== 76) return "cayó por no leer el corpus, no por el campo";
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · c-inventario ════════`);
console.log(`  alcance: corpus congelado del grupo C (57 casos + 19 faqs) · sin red\n`);

const ev = new Evaluadas({ nombre: "c-inventario-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "c-inventario.mjs")], env: c.env, timeout: 600_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} c-inventario · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los 76 documentos del grupo C están leídos con lectores VIVOS, contrastados\n` +
        `   contra los 6 transcritos a mano, y el esquema no puede crecer sin que la\n` +
        `   sonda lo note. El inventario se puede citar — con su denominador (4/57, 2/19).\n`
      : `   El inventario NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
