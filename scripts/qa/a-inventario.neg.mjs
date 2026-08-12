/**
 * TEST EN NEGATIVO de `a-inventario`.
 * Uso: npm run qa:a-inventario-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda lee **campos** del HTML servido, así que sus dos modos de fallo
 * son los clásicos de §sondas 4 — y los dos dan **números plausibles**:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `selector-muerto` | **lector MUERTO** — `<h9>` y `wp-contenido/subidas` no casan en ninguna de las 209 | «esos campos no están», que es como se lee un cero |
 * | `control-roto` | **el CONTROL no reproduce** la transcripción a mano | un fallo de lectura del corpus |
 * | (control) | ✅ verde: 209 leídos, 0 discrepancias, 0 lectores muertos | — |
 *
 * `control-roto` es el que da valor al censo: sin él, «209 documentos con
 * taxonomía» sólo dice que un patrón casó 209 veces, no que case **bien**. Con
 * él, un lector que se desvíe de los 7 transcritos a mano **tiene que salir
 * rojo**, que es la única forma de saber que el otro 97 % está bien leído.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/a-inventario.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 209 documentos leídos, el control reproduce los 7 transcritos, 0 lectores muertos",
    env: {},
    exit: 0,
    salidaTiene: /0 discrepancia\(s\) contra la transcripción/,
    comprueba: (j) => {
      const n = Object.keys(j.documentos).length;
      if (n !== 209) return `leyó ${n} documentos, no 209`;
      if (j.control.discrepancias !== 0) return `${j.control.discrepancias} discrepancias en el CONTROL`;
      /* Sin taxonomías leídas, los sabotajes no probarían nada. */
      if (j.taxonomias.etiquetas.terminos < 5) return `sólo ${j.taxonomias.etiquetas.terminos} etiquetas: el censo no está midiendo`;
      if (!j.assets.referenciados) return "0 assets referenciados: el patrón de media no casa (fue un defecto real de esta sonda)";
      return null;
    },
  },
  {
    etiqueta: "selector-muerto",
    porQue: "lectores que no casan en NINGUNA página ⇒ MUERTO, nunca «ese campo no está»",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    etiqueta: "control-roto",
    porQue: "el CONTROL deja de reproducir la transcripción ⇒ rojo, aunque los 209 se lean",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    salidaTiene: /discrepancia\(s\)/,
    comprueba: (j) => {
      if (j.control.discrepancias === 0) return "el sabotaje no movió el control";
      if (Object.keys(j.documentos).length !== 209) return "cayó por no leer el corpus, no por el control";
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · a-inventario ════════`);
console.log(`  alcance: corpus congelado del grupo A (209) · sin red\n`);

const ev = new Evaluadas({ nombre: "a-inventario-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "a-inventario.mjs")], env: c.env, timeout: 600_000 });
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
  `\n${fallos === 0 ? "✅" : "❌"} a-inventario · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los 209 documentos están leídos con lectores VIVOS y contrastados contra\n` +
        `   la transcripción a mano. El inventario se puede citar.\n`
      : `   El inventario NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
