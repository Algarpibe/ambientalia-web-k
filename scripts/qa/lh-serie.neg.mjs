/**
 * TEST EN NEGATIVO de `lh-serie` — y el sabotaje central ES EL ATAJO.
 * Uso: npm run qa:lh-serie-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda existe para contestar *«¿basta una página por serie?»*, así que su
 * negativo tiene que probar, sobre todo, que **el atajo no puede colarse como
 * respuesta**:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `una-por-serie` | **NO SE PUDO COMPARAR** — con n=1 no hay homogeneidad que establecer | «todas homogéneas», que es como se leería el atajo |
 * | `patron-falso` | **patrón MUERTO** — ninguna serie trae paginador reconocible | el sitio: los paginadores están, el selector no |
 *
 * `una-por-serie` es el que importa: reproduce exactamente el razonamiento que
 * dejó MONOGRÁFICO a cero —mirar la primera de cada contenedor y declarar la
 * familia cubierta— y **tiene que salir rojo**. Si saliera verde, la sonda
 * estaría bendiciendo el atajo que vino a impedir.
 *
 * ── EL CONTROL (§sondas, regla 8a) ────────────────────────────────────────
 * Sin sabotaje: verde, con las 149 firmas leídas y **series heterogéneas
 * encontradas**. Si el control no encontrara heterogeneidad, los dos rojos de
 * abajo no probarían nada — podrían ser de un corpus vacío.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-serie.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: se leen las 149 firmas y aparecen series heterogéneas",
    env: {},
    exit: 0,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "LA SERIE NO ES UNA UNIDAD") return `el CONTROL dijo «${j.resumen.veredicto}»`;
      if (!j.resumen.heterogeneas) return "0 series heterogéneas en el control: los sabotajes no probarían nada";
      if (j.resumen.documentos < 100) return `sólo leyó ${j.resumen.documentos} documentos: el corpus no está entero`;
      /* Y que la separación de los DOS ceros esté hecha: sin ella, «vacías»
       * mezcla las páginas sin entradas con las formas que no usan <article>. */
      if (!j.resumen.seriesSinArticles) return "no separa las series que no sirven <article>: los dos ceros están mezclados";
      return null;
    },
  },
  {
    etiqueta: "una-por-serie",
    porQue: "EL ATAJO: mirar sólo la página 1 de cada serie ⇒ NO SE PUDO COMPARAR, nunca «homogéneas»",
    env: { SABOTAJE: "una-por-serie" },
    exit: 2,
    salidaTiene: /NO SE PUDO COMPARAR NINGUNA SERIE/,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "NO SE PUDO EVALUAR") return `cayó por «${j.resumen.veredicto}», que es el discriminador de otro sabotaje`;
      if (j.resumen.heterogeneas !== 0) return "encontró heterogéneas mirando una sola página: el sabotaje no se aplicó";
      /* La mitad que de verdad importa: que NO haya salido «homogéneas». */
      if (/homog[ée]nea/i.test(String(j.resumen.veredicto))) return "el atajo se leyó como homogeneidad — es justo lo que esto tiene que impedir";
      return null;
    },
  },
  {
    etiqueta: "patron-falso",
    porQue: "el selector de paginador no casa en NINGUNA serie ⇒ patrón MUERTO, no «no hay paginación»",
    env: { SABOTAJE: "patron-falso" },
    exit: 2,
    salidaTiene: /patrón MUERTO/,
    comprueba: (j) => {
      if (j.resumen.documentos < 100) return "no llegó a leer el corpus: el rojo sería de otra cosa";
      const pieles = new Set(Object.values(j.series).flatMap((v) => v.paginas.map((p) => p.piel)));
      if (!(pieles.size === 1 && pieles.has("ninguna"))) return `alguna piel sobrevivió al sabotaje: ${[...pieles].join(",")}`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-serie ════════`);
console.log(`  alcance: corpus F3-0 de listados, población completa (sin red)\n`);

const ev = new Evaluadas({ nombre: "lh-serie-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-serie.mjs")], env: c.env, timeout: 600_000 });
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

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(14)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(14)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-serie · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El atajo «una por serie» sale ROJO por no poder comparar, que es la única\n` +
        `   salida honesta cuando n=1. Un «homogéneas» de esta sonda significa que se\n` +
        `   miraron todas las páginas y salieron iguales.\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
