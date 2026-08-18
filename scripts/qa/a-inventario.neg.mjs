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
 * | `selector-muerto` | **lector MUERTO** — `<h9>` y `wp-contenido/subidas` no casan en ninguna del corpus | «esos campos no están», que es como se lee un cero |
 * | `control-roto` | **el CONTROL no reproduce** la transcripción a mano | un fallo de lectura del corpus |
 * | (control) | ✅ verde: el grupo A ENTERO leído, 0 discrepancias, 0 lectores muertos | — |
 *
 * `control-roto` es el que da valor al censo: sin él, «N documentos con
 * taxonomía» sólo dice que un patrón casó N veces, no que case **bien**. Con
 * él, un lector que se desvíe de los 7 transcritos a mano **tiene que salir
 * rojo**, que es la única forma de saber que el otro 97 % está bien leído.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/a-inventario.json";

/* ══════════════════════════════════════════════════════════════════════════
 * EL CARDINAL SE DERIVA (§regla 9, 7.º caso) — corregido 2026-08-18, 83.ª
 *
 * Aquí estuvo escrito `209` en dos comprobaciones, y el corpus pasó a **212**
 * en la 74.ª (149 → 152 entradas de blog). El negativo salió rojo por un
 * número recordado, **no por su invariante** — que es exactamente el caso que
 * `cms:extractor-a-neg` ya había pagado con `149`.
 *
 * Lo que el `209` quería decir no era «hay 209»: era **«no se saltó ninguna
 * del grupo A»**. Eso se comprueba contra `corpus/INDICE.json`, colección por
 * colección, y **no envejece cuando el corpus crece**.
 * ═════════════════════════════════════════════════════════════════════════ */
const INDICE = JSON.parse(readFileSync(join(QA, "../..", "corpus", "INDICE.json"), "utf8"));

/** Recuento por colección del corpus en disco, para las colecciones que se pidan. */
function enElIndice(colecciones) {
  const n = {};
  for (const clave of Object.keys(INDICE.paginas)) {
    const col = clave.split("/")[0];
    if (colecciones.has(col)) n[col] = (n[col] ?? 0) + 1;
  }
  return n;
}

/**
 * ¿Leyó la sonda TODO el grupo A? Se deriva de lo que ella misma declara haber
 * leído, contrastado contra el índice. La guarda anti-degeneración es que un
 * `documentos` vacío daría 0 colecciones y pasaría por vacuidad (§sondas 4).
 */
function corpusCompleto(j) {
  const docs = Object.values(j.documentos ?? {});
  const cols = new Set(docs.map((d) => d.coleccion));
  if (cols.size < 3) return `sólo ${cols.size} colecciones leídas: el censo no está mirando el grupo A`;
  const enDisco = enElIndice(cols);
  const leidos = {};
  for (const d of docs) leidos[d.coleccion] = (leidos[d.coleccion] ?? 0) + 1;
  for (const col of cols)
    if (leidos[col] !== enDisco[col]) return `${col}: leyó ${leidos[col]}, el corpus tiene ${enDisco[col]}`;
  return null;
}

/**
 * Sólo para la PROSA de la cabecera: el total derivado, nunca escrito a mano.
 * El invariante fuerte (`corpusCompleto`) NO depende de esta lista — sale de
 * lo que la sonda declara haber leído. Si las colecciones se renombran, esto
 * daría 0, y un 0 se lee como dato (§sondas 4): por eso tira en voz alta.
 */
const TOTAL_GRUPO_A = Object.values(
  enElIndice(new Set(["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"])),
).reduce((a, b) => a + b, 0);
if (!TOTAL_GRUPO_A) throw new Error("0 páginas del grupo A en corpus/INDICE.json: las colecciones se renombraron");

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: el corpus del grupo A ENTERO, el control reproduce los 7 transcritos, 0 lectores muertos",
    env: {},
    exit: 0,
    salidaTiene: /0 discrepancia\(s\) contra la transcripción/,
    comprueba: (j) => {
      const incompleto = corpusCompleto(j);
      if (incompleto) return incompleto;
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
    porQue: "el CONTROL deja de reproducir la transcripción ⇒ rojo, aunque el corpus entero se lea",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    salidaTiene: /discrepancia\(s\)/,
    comprueba: (j) => {
      if (j.control.discrepancias === 0) return "el sabotaje no movió el control";
      const incompleto = corpusCompleto(j);
      if (incompleto) return `cayó por no leer el corpus (${incompleto}), no por el control`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · a-inventario ════════`);
console.log(`  alcance: corpus congelado del grupo A (${TOTAL_GRUPO_A}, DERIVADO del índice) · sin red\n`);

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
      ? `   Los ${TOTAL_GRUPO_A} documentos están leídos con lectores VIVOS y contrastados contra\n` +
        `   la transcripción a mano. El inventario se puede citar.\n`
      : `   El inventario NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
