/**
 * TEST EN NEGATIVO · f33-membresia
 *
 * | sabotaje | qué tiene que pasar | qué taparía si no |
 * |---|---|---|
 * | `cardinal` | 1 elemento movido por lado ⇒ **rojo**, y NOMBRANDO los dos | el `68 → 68` otra vez: cardinales exactos y conjuntos distintos |
 * | `corpus-mudo` | dominio encogido a 0 ⇒ **rojo por el CARDINAL** | «diferencia simétrica 0 y 0» sobre un dominio vacío, que es cierto y no dice nada |
 * | `control` | ✅ 0 y 0 sobre 31 · 0 geometría · 1 `srcExterno` · `1_5`×10 | — |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ EL SABOTAJE VA EN EL DATO, NO EN EL UMBRAL (§regla 28)
 *
 * `cardinal` **no baja un listón**: mueve **un elemento real de un lado al
 * otro**, dejando los dos cardinales en 31. Es la instancia separadora que
 * distingue esta sonda de un recuento con otro nombre — sin ella, «31 = 31» y
 * «diferencia simétrica 0 y 0» salen idénticos desde fuera, y el caso probaría
 * la aritmética en vez del modo de fallo.
 *
 * Y `corpus-mudo` cierra el otro lado: §regla 22 — un booleano de concordancia
 * vale `true` sobre un dominio de uno igual que sobre uno de mil, así que el
 * veredicto se cierra **con el `n`**, no con el booleano. Bajar el dominio a 0
 * tiene que salir rojo aunque la diferencia simétrica siga siendo 0 y 0.
 *
 * ⚠ **LO QUE ESTE NEGATIVO NO PUEDE PROBAR HOY, y se dice con su denominador:**
 * la guarda de GEOMETRÍA (`0 claves con valor en la DB`) **no tiene instancia
 * separadora en el dato**: nada escribe geometría, así que sabotearla exigiría
 * fabricar una fila. En su lugar, el predicado `hayValor` lleva su propio
 * **control de 4 casos** DENTRO de la sonda —dos que tienen que dar `true` y
 * dos `false`—, y ése sí se ejercita en cada corrida. Es lo que separa «0
 * claves» de «el predicado nunca dice que sí», que es como se leyó la primera
 * versión de esta sonda **al revés**: contaba 299 con un `hayValor` de un solo
 * nivel (§sondas 4, tercera cara).
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/f33-membresia.json";
const SONDA = join(QA, "f33-membresia.mjs");
/* La sonda lee la DB: necesita el `.env`, igual que su `npm run`. */
const ENV_FILE = ["--env-file", join(QA, "../../apps/cms/.env")];

const casos = [
  {
    etiqueta: "control",
    porQue: "0 y 0 sobre 31 documentos · 0 claves de geometría · 1 `srcExterno` · `1_5` ejercitado",
    env: {},
    exit: 0,
    salidaTiene: /diferencia simétrica 0 y 0 sobre 31 documentos/,
    comprueba: (j) => {
      if (j.membresia?.diferenciaSimetrica !== 0) return `diferencia simétrica ${j.membresia?.diferenciaSimetrica}, esperaba 0`;
      /* §regla 22: el cardinal al lado del booleano, siempre. */
      if (j.membresia?.enElExtraido !== 31) return `${j.membresia?.enElExtraido} documentos comparados, esperaba 31`;
      if (j.geometria?.clavesConValor !== 0) return `${j.geometria?.clavesConValor} claves de geometría en la DB`;
      if (j.decisiones?.d1?.dataTeamsEnLaDb !== 0) return `queda \`data-teams\` en la DB: T11 no llegó`;
      if (j.decisiones?.d2?.conSrcExterno !== 1) return `${j.decisiones?.d2?.conSrcExterno} \`srcExterno\`, esperaba 1`;
      if (!j.decisiones?.d3?.repartoDeAncho?.["1_5"]) return "`1_5` no aparece en la DB: el enum lo admite pero nadie lo ejercita";
      return null;
    },
  },
  {
    etiqueta: "cardinal",
    porQue: "1 elemento movido por lado, cardinales intactos ⇒ MEMBRESÍA en rojo, con los dos lados nombrados",
    env: { SABOTAJE: "cardinal" },
    exit: 2,
    salidaTiene: /MEMBRESÍA: la diferencia simétrica NO es 0 y 0/,
    comprueba: (j) => {
      const m = j.membresia ?? {};
      /* El sabotaje NO puede mover los cardinales: si los mueve, el caso está
       * probando un recuento y no la membresía (0 instancias separadoras). */
      if (m.enElExtraido !== m.enLaDb)
        return `el sabotaje movió los cardinales (${m.enElExtraido} vs ${m.enLaDb}): entonces un recuento ya lo cazaría`;
      if (m.diferenciaSimetrica !== 2) return `diferencia simétrica ${m.diferenciaSimetrica}, esperaba 2 (1 por lado)`;
      if (!m.soloEnElExtraido?.length || !m.soloEnLaDb?.length)
        return "la sonda no nombró LOS DOS lados: un solo lado no es una diferencia simétrica";
      return null;
    },
  },
  {
    etiqueta: "corpus-mudo",
    porQue: "dominio encogido a 0 ⇒ rojo por el CARDINAL, no verde por el booleano",
    env: { SABOTAJE: "corpus-mudo" },
    exit: 2,
    salidaTiene: /DOMINIO ENCOGIDO/,
    comprueba: (j) => {
      const m = j.membresia ?? {};
      if (m.enElExtraido !== 0) return `${m.enElExtraido} en el extraído con el sabotaje, esperaba 0`;
      /* §regla 22 en su forma exacta: la concordancia sigue diciendo que sí. */
      if (m.soloEnElExtraido?.length) return "el sabotaje dejó elementos: no ejercita el dominio vacío";
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · f33-membresia ════════`);
console.log(`  alcance: la congelada del extractor + la colección \`paginas\` de la DB`);
console.log(`  NO cubre: el CONTENIDO campo a campo (eso es \`qa:cms-roundtrip\`) ni la geometría`);
console.log(`            del CLON contra el original (0 ejes comparados, \`qa:f33-cmp\`)`);
console.log(`  ⚠ y NO puede sabotear la guarda de GEOMETRÍA: 0 instancias separadoras en el dato.`);
console.log(`    Lo que sí se ejercita en cada corrida es el CONTROL de 4 casos de \`hayValor\`.\n`);

const ev = new Evaluadas({ nombre: "f33-membresia-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [...ENV_FILE, SONDA], env: c.env, timeout: 600_000 });
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
  `\n${fallos === 0 ? "✅" : "❌"} f33-membresia · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Un elemento movido POR LADO —cardinales intactos— sale rojo y con los dos lados\n` +
        `   nombrados, y un dominio encogido a 0 sale rojo por el CARDINAL en vez de verde\n` +
        `   por el booleano. O sea que «diferencia simétrica 0 y 0 sobre 31» es una medida,\n` +
        `   no un \`31 === 31\` con otro nombre.\n`
      : `   La membresía de \`paginas\` NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
