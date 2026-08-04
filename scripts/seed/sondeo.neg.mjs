/**
 * TEST EN NEGATIVO de `sondeo` — entero, y **cada sabotaje reproduce UNO de los
 * tres defectos de instrumento del 2026-08-04 y cae por SU invariante.**
 *
 * No es un negativo genérico: es la prueba de que la sonda que produjo las tres
 * fronteras del bloque 1 **sabe fallar por los mismos sitios por los que falló**.
 * Los tres daban números plausibles, que es lo único que los hace peligrosos, y
 * los tres se cazaron a mano —uno por aritmética imposible, otro por
 * contradecir al seed en la misma corrida, el tercero por reconstruir el grafo
 * en papel—. Una guarda que sólo sabe cazarlos a mano no es una guarda.
 *
 * | sabotaje | reintroduce | cae por |
 * |---|---|---|
 * | `slug`  | el lector de llaves sin `href` | **LLAVE NO DERIVABLE** — no por «hay más huérfanas» |
 * | `grupo` | no descender a un grupo ausente | **RUTA `required` SIN AUDITAR** — no por «hay menos required sin dato» |
 * | `ciclo` | el grafo sin podar | **CICLO** — no por un orden mal puesto |
 *
 * ⚠ **La columna de la derecha es la mitad que importa.** Un sabotaje que hace
 * caer la sonda *por otro motivo* prueba que la sonda es frágil, no que la
 * guarda funciona: por eso cada caso exige su cadena y además comprueba que la
 * congelada del sabotaje trae **su** campo con contenido.
 *
 * Uso: npm run cms:sondeo-neg
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const SONDEO = join(QA, "../seed/sondeo.mjs");
const ENV = join(QA, "../../apps/cms/.env");

const casos = [
  {
    sabotaje: "slug",
    porQue: "el lector de llaves sin `href` ⇒ LLAVE NO DERIVABLE, no «más huérfanas»",
    salidaTiene: /VALOR\(ES\) DE RELACIÓN SIN LLAVE DERIVABLE/,
    comprueba: (d) =>
      d.instrumento?.sinLlave?.length
        ? null
        : "no congeló ni un valor sin llave: el defecto pasó como si fueran huérfanas",
    /* Y la otra mitad, la que delató el defecto original: con el `href` sin
     * leer, las 31 referencias de teaser colapsan en UNA sola llave. Si el
     * artefacto no lo enseña, el sabotaje no reprodujo el defecto. */
    ademas: (d) =>
      d.instrumento.sinLlave.length >= 31
        ? null
        : `esperaba ≥31 valores sin llave (los teasers), hay ${d.instrumento.sinLlave.length}`,
  },
  {
    sabotaje: "grupo",
    porQue: "no descender a un grupo ausente ⇒ RUTA required SIN AUDITAR, no «(ninguno)»",
    salidaTiene: /RUTA\(S\) `required` DEL ESQUEMA SIN AUDITAR/,
    comprueba: (d) =>
      d.required?.sinAuditar?.includes("productos·seo.title")
        ? null
        : "no nombró `productos·seo.title`, que es justo el que tumbó el seed",
    /* El defecto original no era «faltaba una línea»: era que el informe decía
     * «(ninguno)» — o sea que el campo **desaparecía** del recuento. */
    ademas: (d) =>
      d.required.sinDato["productos · seo.title"] === undefined
        ? null
        : "el sabotaje no llegó a ocultar el campo: no reproduce el defecto",
  },
  {
    sabotaje: "ciclo",
    porQue: "el grafo sin podar ⇒ CICLO nombrado, no un orden mal puesto",
    salidaTiene: /CICLO EN EL GRAFO DE DEPENDENCIAS/,
    comprueba: (d) =>
      d.grafo?.ciclos?.length ? null : "no congeló ningún ciclo",
    ademas: (d) =>
      d.grafo.ciclos.some((c) => c.includes("sectores") && c.includes("casos") && c.includes("taxonomia-sectores"))
        ? null
        : `el ciclo congelado no es el medido (taxonomia-sectores → sectores → casos): ${JSON.stringify(d.grafo.ciclos)}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · sondeo de frontera ════════`);
console.log(`  ${casos.length} sabotajes, cada uno por su propio invariante\n`);

const ev = new Evaluadas({ nombre: "sondeo-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (extra) =>
  spawnSync(process.execPath, [`--env-file=${ENV}`, SONDEO], {
    env: { ...process.env, PISAR: "1", ...extra },
    encoding: "utf8",
    timeout: 300_000,
  });

for (const c of casos) {
  const fichero = join(QA, `medidas/sondeo-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corre({ SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== 2) mal = `esperaba exit 2, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else {
      const d = JSON.parse(readFileSync(fichero, "utf8"));
      mal = c.comprueba(d) ?? c.ademas?.(d) ?? null;
    }
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  ${mal}`);
  } else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL, que es lo que decide si los tres de arriba significan algo.
 *    Sin él, una sonda que fallara SIEMPRE los pasaría los tres — y la lección
 *    de F2-1 §5 se pagó justo por no tenerlo. ─────────────────────────────── */
const ctl = corre({});
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
if (ctl.status !== 0) {
  fallos++;
  console.log(`  ❌ CONTROL          exit ${ctl.status} — sin sabotaje tiene que salir 0`);
} else if (!/0 defecto\(s\) de INSTRUMENTO/.test(ctlOut)) {
  fallos++;
  console.log(`  ❌ CONTROL          exit 0 pero sin la línea de 0 defectos de instrumento`);
} else if (!/evaluadas 46\/46 filas de catálogo/.test(ctlOut)) {
  /* La línea de unidades es la mitad legible del contrato: un verde sin ella no
   * distingue «no hay defectos» de «no se midió». */
  fallos++;
  console.log(`  ❌ CONTROL          exit 0 pero sin la línea de unidades evaluadas`);
} else console.log(`  ✓  CONTROL         (sin sabotaje) exit 0 con sus 46 filas — la sonda no falla siempre`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} sondeo · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Los tres defectos de instrumento del 2026-08-04 tienen guarda, y cada una\n` +
        `   cae por lo suyo. Las fronteras que esta sonda mide ya se pueden citar.\n`
      : `   NADA de lo que mida \`sondeo\` se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
