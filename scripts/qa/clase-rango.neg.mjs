/**
 * TEST EN NEGATIVO de `clase-rango` — ENTERO, y cada sabotaje por SU invariante.
 * Uso: node clase-rango.neg.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTE TEST NO PUEDE ASERTAR SOBRE EL CÓDIGO DE SALIDA
 *
 * `clase-rango` cierra con **dos** números, y el código de salida es **uno**.
 * «Salió rojo» no distingue por cuál de los dos ejes cayó, y esa distinción es
 * **exactamente** lo que hay que probar: una sonda que solo sabe fallar por uno
 * de los dos no está probada para esta clase, porque el defecto que se busca
 * —«no varía»— solo lo ve el segundo.
 *
 * Así que se aserta sobre los CONTADORES congelados en `veredicto`, y cada
 * sabotaje declara **por qué eje tiene que caer Y por cuál NO**:
 *
 *   · `fidelidad` → ① sube, ② se queda a CERO   (la varianza se conserva)
 *   · `rango`     → ② sube, y ① se queda SIN PARES (no puede opinar)
 *
 * El segundo es el que prueba que el eje ② sirve: reproduce el caso real —
 * instancias que no emparejan— y ahí la fidelidad enmudece mientras el rango
 * sigue hablando. Si los dos sabotajes cayeran por el mismo contador, los dos
 * ejes serían el mismo número escrito dos veces.
 *
 * `muerto` y `pleno` son los dos de siempre (regla 4 y su complementaria) y sí
 * cierran el código de salida.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA } from "./lib.mjs";

/* Una sola ruta, y **tiene que ser un monográfico**: es la única familia con
 * respuesta conocida (CAMPO, `anchoPct` 70·80·90), o sea la única donde el
 * original varía con seguridad. Un sabotaje de rango sobre una página sin
 * varianza en el original no podría disparar nunca — y su verde no probaría
 * nada. */
const SOLO = "petroleo-y-gas";
const SUF = `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}`;

const casos = [
  {
    sabotaje: "fidelidad",
    porQue: "① FIDELIDAD sube y ② RANGO se queda a 0 (el δ constante conserva la varianza)",
    comprueba: (v) => (v.fidelidad > 0 && v.rango === 0
      ? null
      : `esperaba fidelidad>0 y rango===0, salió fidelidad=${v.fidelidad} rango=${v.rango}`),
  },
  {
    sabotaje: "rango",
    porQue: "② RANGO sube y ① FIDELIDAD se queda SIN PARES — el eje que sobrevive al no-emparejamiento",
    comprueba: (v) => (v.rango > 0 && v.pares === 0
      ? null
      : `esperaba rango>0 y pares===0, salió rango=${v.rango} pares=${v.pares}`),
  },
  {
    sabotaje: "muerto",
    porQue: "un selector que no casa en NINGUNA página sale por ERROR, nunca por cero (regla 4)",
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    sabotaje: "pleno",
    porQue: "un patrón que casa en TODAS no discrimina: sale por PLENO (la complementaria)",
    exit: 2,
    salidaTiene: /PATRÓN UBICUO/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · clase-rango ════════`);
console.log(`  ruta: ${SOLO} (monográfico — el único con varianza CONOCIDA en el original)\n`);

/* Contrato de `Evaluadas`, y aquí NO se exime con `SIN_CONTRATO` aunque este
 * fichero solo orqueste: la unidad es **el sabotaje**, y un sabotaje que no
 * llegó a correr —un `spawn` que revienta, un timeout— dejaría un eje sin
 * probar. Que la lista se recorra entera es justo lo que hay que garantizar:
 * *una sonda que solo sabe fallar por uno de los dos ejes no está probada*, y
 * eso incluye el caso de que el segundo sabotaje ni se ejecute. */
const ev = new Evaluadas({ nombre: "clase-rango-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = join(QA, `medidas/clase-rango-1440-neg-${c.sabotaje}${SUF}.json`);
  // Artefacto de una corrida anterior: se borra para no asertar sobre lo viejo.
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = spawnSync(process.execPath, [join(QA, "clase-rango.mjs"), "1440"], {
    env: { ...process.env, SABOTAJE: c.sabotaje, SOLO, PISAR: "1" },
    encoding: "utf8",
    timeout: 600_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  /* «Corrió» ≠ «pasó»: el contrato cuenta unidades EVALUADAS, y el veredicto de
   * cada una lo lleva `fallos` más abajo. Un sabotaje que ni arrancó no es una
   * aserción que falla — es una que no se hizo, y son cosas distintas. */
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")).veredicto);
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(10)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(10)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

/* Los artefactos se quedan en `medidas/` CON `-neg-` en el nombre (regla 7):
 * son la prueba de que la sonda sabe fallar, no medidas del sitio. */
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} clase-rango · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los DOS ejes disparan por separado: ① sin ② y ② sin ①. No son el mismo\n` +
        `   número escrito dos veces, así que un limpio de esta sonda se puede leer.\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
