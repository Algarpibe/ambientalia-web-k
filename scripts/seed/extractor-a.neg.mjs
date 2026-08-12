/**
 * TEST EN NEGATIVO de `extractor-a`.
 * Uso: npm run cms:extractor-a-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Este extractor sustituye la FUENTE del dato del grupo A: hasta hoy el seed
 * leía `src/lib/arquetipo-a.ts` (7 entradas transcritas a mano) y a partir de
 * aquí lee el catálogo extraído (149). Lo único que autoriza ese cambio es que
 * **el extractor reproduzca lo transcrito**, así que el negativo tiene que
 * probar que esa comprobación **sabe fallar**:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `control-roto` | **el CONTROL no reproduce** la transcripción | un fallo de lectura del corpus |
 * | `selector-muerto` | **lector MUERTO** (`<h9>`, miga anulada) | «ese campo no está», que es como se lee un cero |
 * | `cuerpo-ausente` | **documento sin cuerpo ⇒ TIRA**, no se emite a medias | un catálogo con 148 y verde |
 * | (control) | ✅ 209 extraídos, el control reproduce la transcripción entera | — |
 *
 * `cuerpo-ausente` es el que protege del fallo más caro de este proyecto: un
 * campo rico `undefined` **no revienta, no pinta** (§sondas 6bis) — 6 páginas
 * de `articulos-kb` se sirvieron con 200 y cero módulos. Aquí un documento sin
 * cuerpo tiene que impedir el catálogo entero, no colarse.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./../qa/lib.mjs";

const CANONICA = "medidas/a-extraido.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 209 documentos y TODAS las comparaciones contra la transcripción",
    env: {},
    exit: 0,
    /**
     * ⚠ **El número de comparaciones NO se escribe aquí, se DERIVA de la
     * congelada** (§sondas 9). Estaba cableado a `95`, y al añadir los 5 campos
     * del documento científico pasó a **111**: el negativo salió rojo por su
     * propio literal, no por un defecto del extractor.
     *
     * Un número recordado envejece **contra** el repo y no hay lectura que lo
     * distinga de uno derivado — así que se exige que el control **cubra más de
     * un campo por documento CONTROLADO**, y el total exacto lo dice la
     * congelada.
     *
     * ⚠ **Y la primera versión de esta derivación usó el DENOMINADOR
     * EQUIVOCADO**: comparó las 111 contra los **209** del catálogo cuando el
     * control mira sólo los **14 transcritos a mano**. Dos poblaciones
     * distintas, y la sonda salió roja por eso. Por eso el extractor congela
     * ahora `control.documentos` al lado de `control.comparaciones`: un
     * numerador sin su denominador invita a compararlo con el que se tenga a
     * mano.
     */
    salidaTiene: /CONTROL · \d+ comparaciones[\s\S]*?✅ TODAS/,
    comprueba: (j) => {
      if (j.recuento["entradas-blog"] !== 149) return `${j.recuento["entradas-blog"]} entradas, no 149`;
      if (j.control.discrepancias !== 0) return `${j.control.discrepancias} discrepancias en el control`;
      if (!j.control.documentos) return "la congelada no trae `control.documentos`: el numerador viene sin denominador";
      if (j.control.comparaciones <= j.control.documentos)
        return `${j.control.comparaciones} comparaciones para ${j.control.documentos} documentos controlados: el control mira un campo o menos por documento`;
      /* Sin destacadas ni taxonomías leídas los sabotajes no probarían nada. */
      const conImagen = j.catalogo["entradas-blog"].filter((d) => d.imagenDestacada).length;
      if (conImagen === 0 || conImagen === 149) return `imagenDestacada en ${conImagen} de 149: o el lector está muerto o es un pleno`;
      return null;
    },
  },
  {
    etiqueta: "control-roto",
    porQue: "el CONTROL deja de reproducir la transcripción ⇒ rojo aunque los 209 se extraigan",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    salidaTiene: /discrepancia\(s\)/,
    comprueba: (j) => (j.control.discrepancias === 0 ? "el sabotaje no movió el control" : null),
  },
  {
    etiqueta: "selector-muerto",
    porQue: "lectores que no casan en NINGÚN documento ⇒ MUERTO, nunca «ese campo no está»",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    etiqueta: "cuerpo-ausente",
    porQue: "un documento sin cuerpo TIRA — un campo rico vacío no revienta, NO PINTA (§sondas 6bis)",
    env: { SABOTAJE: "cuerpo-ausente" },
    exit: 2,
    salidaTiene: /sin cuerpo/,
    comprueba: (j) => (j.recuento["entradas-blog"] === 149 ? "el sabotaje no quitó ningún cuerpo" : null),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-a ════════`);
console.log(`  alcance: corpus congelado del grupo A (209) + corpus/transformado · sin red\n`);

const ev = new Evaluadas({ nombre: "extractor-a-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "../seed/extractor-a.mjs")], env: c.env, timeout: 600_000 });
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
  `\n${fallos === 0 ? "✅" : "❌"} extractor-a · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El catálogo extraído se puede usar como FUENTE: reproduce lo transcrito a\n` +
        `   mano y sus tres modos de fallo salen rojos.\n`
      : `   El catálogo NO se puede sembrar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
