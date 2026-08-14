/**
 * TEST EN NEGATIVO de `seed-listados`.
 * Uso: npm run cms:seed-listados-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTE FICHERO NO EXISTÍA, Y POR QUÉ AHORA SÍ
 *
 * `seed-listados.mjs` declaraba sus sabotajes desde el primer día y **nadie los
 * corría**: un `SABOTAJES = [...]` sin ejecutor es §sondas 3 —*documentado no es
 * conectado*— con la forma más cómoda que hay, porque el array se lee como si
 * fuera una prueba.
 *
 * Se escribe ahora porque esta tanda le tocó las guardas: la jerarquía de
 * `categorias-recursos` (`D2.8`) y la **excepción declarada** del hueco de
 * captura. Las dos pueden fabricar un verde:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-extraccion` | **EXTRACCIÓN AUSENTE** | «0 campos sembrados», que es un seed mudo |
 * | `slug-fantasma` | un huérfano **NUEVO**, fuera de la excepción | quedarse dentro de la excepción y salir verde |
 * | `sin-recursos` | **EXTRACCIÓN SIN `categoriasRecursos`** | «resources es plana» |
 * | `padre-huerfano` | **relación sin destino** | un `padre` a null en silencio |
 *
 * ── ⚠ EL CONTROL ES EL QUE DECIDE (§sondas 8a) ────────────────────────────
 * Un sabotaje que no cambia el resultado no ha probado la guarda: ha probado que
 * el instrumento no la ejercita. Así que el control exige, **con su número**,
 * las tres cosas que los rojos tienen que poder romper: 12 descripciones, 66
 * extractos y 10 términos con 8 padres.
 *
 * ── Y por qué `slug-fantasma` es el sabotaje que importa hoy ──────────────
 * La excepción declarada (`HUECO_DE_CAPTURA`) baja el listón a propósito. Si
 * estuviera mal escrita —demasiado ancha— **taparía huérfanos de verdad**, y el
 * seed saldría verde con el campo a medias. `slug-fantasma` mete uno que la
 * excepción NO cubre y comprueba que eso sigue siendo rojo.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/seed-listados.json";
const ENV = ["--env-file=apps/cms/.env"];

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 12 descripciones · 66 extractos · 10 categorias-recursos con 8 padres",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      if (!j.etiquetas.sembradas) return "0 descripciones en el CONTROL: los rojos no probarían nada";
      if (!j.entradasBlog.sembrados) return "0 extractos en el CONTROL: `slug-fantasma` no probaría nada";
      if (!j.categoriasRecursos?.filas)
        return "0 filas de `categorias-recursos`: `sin-recursos` y `padre-huerfano` no probarían nada";
      if (j.categoriasRecursos.padresApuntados !== j.categoriasRecursos.padresDeclaradosPorElCorpus)
        return `padres ${j.categoriasRecursos.padresApuntados}/${j.categoriasRecursos.padresDeclaradosPorElCorpus}: la jerarquía quedó a medias`;
      /* La excepción, en los dos sentidos: ni tapa de más ni se queda vieja. */
      if (j.huecoDeCaptura?.huerfanosNuevos?.length)
        return `huérfanos NUEVOS fuera de la excepción: ${j.huecoDeCaptura.huerfanosNuevos.join(" · ")}`;
      if (j.huecoDeCaptura?.declaradosYaSembrables?.length)
        return `la excepción caducó: ${j.huecoDeCaptura.declaradosYaSembrables.join(" · ")} ya se pueden sembrar`;
      return null;
    },
  },
  {
    etiqueta: "sin-extraccion",
    porQue: "no hay extracción ⇒ EXTRACCIÓN AUSENTE, nunca «0 campos sembrados»",
    env: { SABOTAJE: "sin-extraccion" },
    exitNoCero: true,
    salidaTiene: /EXTRACCIÓN AUSENTE/,
  },
  {
    etiqueta: "slug-fantasma",
    porQue: "un huérfano que la excepción NO cubre ⇒ rojo; la excepción no puede tapar huecos de verdad",
    env: { SABOTAJE: "slug-fantasma" },
    exitNoCero: true,
    salidaTiene: /NO están en la excepción declarada/,
  },
  {
    etiqueta: "sin-recursos",
    porQue: "extracción sin `categoriasRecursos` ⇒ TIRA, nunca «resources es plana»",
    env: { SABOTAJE: "sin-recursos" },
    exitNoCero: true,
    salidaTiene: /EXTRACCIÓN SIN `categoriasRecursos`/,
  },
  {
    etiqueta: "padre-huerfano",
    porQue: "un `padre` que no existe como término ⇒ relación sin destino, no un null en silencio",
    env: { SABOTAJE: "padre-huerfano" },
    exitNoCero: true,
    salidaTiene: /no-existe-este-padre/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · seed-listados ════════`);
console.log(`  alcance: la DB sembrada (Local API). Los sabotajes NO dejan filas nuevas.\n`);

const ev = new Evaluadas({ nombre: "seed-listados-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [...ENV, join(QA, "../seed/seed-listados.mjs")],
    env: c.env,
    timeout: 600_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.exitNoCero && res.status === 0) mal = `esperaba exit ≠ 0, salió 0 — un seed a medias NO puede salir verde`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.congela && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} seed-listados · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La excepción del hueco de captura NO tapa huérfanos nuevos, y la jerarquía\n` +
        `   no se puede sembrar a medias sin que esto se ponga rojo.\n`
      : `   Un verde de este seed NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
