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
 * | **`taxonomia-a-medias`** | ⛔ **SIN TÉRMINO en las 12 de etiqueta** | «no hay documentos», que es lo que la cota vieja habría dicho |
 * | `huerfana` | **serie sin mapear** ⇒ exit 2 | «sin población que comparar», que es como se leería el olvido |
 * | (control) | ⛔ rojo con **3 series cortas** | un fallo de lectura: si no leyera nada, el rojo no significaría lo mismo |
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
    /**
     * ⚠ **El sabotaje de LA COTA ESTRECHADA** (§F3-LH-TAXONOMIA-RECURSOS).
     *
     * Se elige `etiquetas` **porque hoy sale verde en 12 de 12**: saboteando
     * `categorias-recursos`, que ya está roja, el resultado no cambiaría y el
     * caso no probaría nada — *un sabotaje que no cambia el resultado no ha
     * probado la guarda* (§sondas 8a). Con la cota vieja —toda la colección
     * atribuida a cada serie— este sabotaje **habría salido igual de verde**,
     * porque el recuento no pasaba por el término.
     */
    etiqueta: "taxonomia-a-medias",
    porQue: "una TAXONOMÍA a medias tiñe de rojo las 12 series de etiqueta que hoy pasan",
    env: { SABOTAJE: "taxonomia-a-medias" },
    exit: 2,
    salidaTiene: /SIN TÉRMINO/,
    comprueba: (j) => {
      const etq = j.series.filter((s) => s.ruta.startsWith("/etiqueta/"));
      if (etq.length !== 12) return `esperaba 12 series de etiqueta, hay ${etq.length}`;
      const rojas = etq.filter((s) => s.viaClon === "termino-AUSENTE");
      if (rojas.length !== 12) return `sólo ${rojas.length} de 12 series de etiqueta cayeron: el sabotaje no llegó a todas`;
      if (etq.some((s) => s.alcanza)) return "alguna serie de etiqueta sigue alcanzando con la taxonomía vacía";
      /* Y que el rojo sea MAYOR que el del control: si diera lo mismo, el
       * sabotaje no estaría cambiando el resultado y no probaría la cota. */
      if (j.resumen.seriesQueNoAlcanzan <= 3) return `${j.resumen.seriesQueNoAlcanzan} series cortas: no supera las 3 del control, así que el sabotaje no cambió nada`;
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
        `   población alcanza, así que «3 series cortas» mide el clon, no el código.\n` +
        `   Y la COTA ESTRECHADA está probada por los dos lados: con la taxonomía a\n` +
        `   medias las 12 series de etiqueta caen, y con la cota vieja no habrían caído.\n`
      : `   Ni el rojo ni el verde de esta sonda se pueden leer hasta que esto pase.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
