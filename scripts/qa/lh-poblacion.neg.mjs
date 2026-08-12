/**
 * TEST EN NEGATIVO de `lh-poblacion` — y aquí el caso raro es EL VERDE.
 * Uso: npm run qa:lh-poblacion-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda sale **roja a propósito** mientras el escalón de POBLACIÓN siga
 * abierto, y eso invierte lo que hay que probar: lo barato es que salga roja
 * —cualquier código roto lo consigue—; lo que hay que demostrar es que
 * **sabe ponerse verde cuando la condición se cumple**.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `completa` | ✅ **VERDE**: con la población del original, el veredicto pasa | nada — es el control invertido |
 * | `huerfana` | **serie sin mapear** ⇒ exit 2 | «sin población que comparar», que es como se leería el olvido |
 * | (control) | ⛔ rojo con **19 series cortas** | un fallo de lectura: si no leyera nada, el rojo no significaría lo mismo |
 *
 * `completa` es el que importa. Sin él, §sondas 4bis en su forma invertida: una
 * sonda que **sólo sabe salir roja** no distingue *«el clon no llega»* de *«el
 * código siempre falla»*, y las dos imprimen exactamente lo mismo.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-poblacion.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: lee las 35 series y las 5 colecciones, y sale ROJO por población",
    env: {},
    exit: 2,
    salidaTiene: /EL CLON NO PUEDE EJERCITAR EL UNIVERSO/,
    comprueba: (j) => {
      if (j.series.length !== 35) return `leyó ${j.series.length} series, no 35: el rojo sería de otra cosa`;
      if (!j.resumen.seriesQueNoAlcanzan) return "0 series cortas en el control: entonces el rojo no viene de la población";
      /* El cruce que evita citar un número con la etiqueta de otra fuente. */
      if (j.resumen.rutasD25 !== 142) return `rutasD25 = ${j.resumen.rutasD25}, y D2.5 dice 142`;
      if (j.resumen.paginasCapturadasPorLhSerie === j.resumen.rutasD25)
        return "las dos congeladas dan el mismo total: la separación de magnitudes no se está midiendo";
      return null;
    },
  },
  {
    etiqueta: "completa",
    porQue: "EL CONTROL INVERTIDO: con la población del original la sonda tiene que salir VERDE",
    env: { SABOTAJE: "completa" },
    exit: 0,
    salidaTiene: /el clon alcanza la población del original/,
    comprueba: (j) => {
      if (j.resumen.seriesQueNoAlcanzan !== 0) return `siguen faltando ${j.resumen.seriesQueNoAlcanzan} series con la población completa`;
      if (j.series.length !== 35) return `leyó ${j.series.length} series, no 35`;
      return null;
    },
  },
  {
    etiqueta: "huerfana",
    porQue: "una serie que `MAPA` no cubre ⇒ SIN MIRAR, nunca «sin población que comparar»",
    env: { SABOTAJE: "huerfana" },
    exit: 2,
    salidaTiene: /que `MAPA` no cubre/,
    /* Cae ANTES de congelar: la guarda va delante de la DB a propósito, así que
     * aquí no hay fichero que comprobar y eso es lo correcto. */
    sinFichero: true,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-poblacion ════════`);
console.log(`  alcance: lh-serie + lh-paginas congeladas · DB del clon (sin red al original)\n`);

const ev = new Evaluadas({ nombre: "lh-poblacion-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: ["--env-file=apps/cms/.env", join(QA, "lh-poblacion.mjs")],
    env: c.env,
    timeout: 600_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && !c.sinFichero) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else if (c.comprueba) mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(10)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(10)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-poblacion · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El rojo del control es EXHIBIBLE: la misma sonda sale verde en cuanto la\n` +
        `   población alcanza, así que «19 series cortas» mide el clon, no el código.\n`
      : `   Ni el rojo ni el verde de esta sonda se pueden leer hasta que esto pase.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
