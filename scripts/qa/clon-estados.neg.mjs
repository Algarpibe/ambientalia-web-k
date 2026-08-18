/**
 * TEST EN NEGATIVO de `clon-estados`.
 * Uso: npm run qa:clon-estados-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * **El modo de fallo de esta sonda es su conclusión BARATA, no su conclusión
 * cara.** «Dos estados» hay que verlo; «un solo estado» sale solo — de una
 * sonda que no mide, de un ancla muerta, de un servidor caído. Y las tres
 * producen exactamente la misma frase tranquilizadora.
 *
 * Es la regla del cero aplicada al muestreo: *no encontrar un segundo estado y
 * no mirar dan la misma salida*, y `estados-390` ya se cobró esta instancia una
 * vez —imprimía «un solo estado» con **0 cargas válidas**—.
 *
 * | sabotaje | tiene que caer por | y NO por |
 * |---|---|---|
 * | (control) | medir sus cargas y publicar su COTA | «no vi nada, luego es determinista» |
 * | `muerto` | el **CENSO**: el ancla no casa en ninguna carga ⇒ código ≠ 0 | contar 0 estados y salir en verde |
 * | `sin-cargas` | el **contrato de `Evaluadas`**: 0 cargas < mínimo ⇒ NO SE PUDO EVALUAR | imprimir el párrafo de «un solo estado» sin cargas |
 *
 * ⚠ **`sin-cargas` es el que protege la afirmación que esta tanda va a
 * escribir.** Si el veredicto del `+16` se apoya en «un solo estado», ese
 * enunciado sólo vale si la sonda **no puede** producirlo sin haber medido.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "clon-estados.mjs");
const CANONICA = "medidas/clon-estados-1440.json";
/** Pocas cargas: el negativo prueba las GUARDAS, no el fenómeno. */
const CARGAS = "2";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: mide sus cargas y publica la cota en vez de una tranquilidad",
    env: {},
    args: [SONDA, CARGAS],
    exit: 0,
    comprueba: (j) => {
      const rutas = Object.keys(j.resumen || {});
      if (rutas.length < 2)
        return `sólo ${rutas.length} ruta(s): sin CONTROL, un «dos estados» no distingue la página de la sonda`;
      let validas = 0;
      for (const [r, v] of Object.entries(j.resumen)) {
        if (!v.cargasValidas) return `${r}: 0 cargas válidas — eso no es «un estado», es «ninguna medida»`;
        if (!v.nEstados) return `${r}: nEstados = 0 con cargas válidas ⇒ el recuento no cuadra`;
        if (v.cotaSiUnEstado == null) return `${r}: sin \`cotaSiUnEstado\` — un cero de muestreo sin su cota se lee como prueba de ausencia`;
        validas += v.cargasValidas;
      }
      if (validas !== rutas.length * Number(CARGAS))
        return `cargas válidas ${validas} ≠ ${rutas.length * Number(CARGAS)} pedidas`;
      if (!j.meta?.queEs?.includes("UN SOLO build"))
        return "el `meta.queEs` no declara que la unidad es la carga contra UN build: es lo único que separa esta sonda de `clon-base`";
      return null;
    },
  },
  {
    etiqueta: "muerto",
    porQue: "el ancla no casa en ninguna carga: tiene que caer por el CENSO, no medir 0 estados",
    env: { SABOTAJE: "muerto" },
    args: [SONDA, CARGAS],
    exit: 2,
    comprueba: (j) => {
      const alguna = Object.values(j.resumen || {}).some((v) => v.cargasValidas > 0);
      if (alguna) return "con el ancla muerta alguna ruta trae cargas válidas ⇒ el sabotaje no muerde";
      return null;
    },
  },
  {
    etiqueta: "sin-cargas",
    porQue: "0 cargas pedidas: tiene que caer por el contrato de `Evaluadas`, no imprimir «un solo estado»",
    env: {},
    args: [SONDA, "0"],
    exit: 2,
    salidaNoTiene: /UN SOLO ESTADO en las/,
  },
];

const ev = new Evaluadas({ nombre: "clon-estados-neg", unidad: "casos", minimo: casos.length });
let fallos = 0;

for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: c.args, env: c.env });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const problemas = [];

  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperado ${c.exit})`);
  if (c.salidaTiene && !c.salidaTiene.test(salida)) problemas.push(`la salida no casa ${c.salidaTiene}`);
  if (c.salidaNoTiene && c.salidaNoTiene.test(salida))
    problemas.push(`la salida SÍ trae ${c.salidaNoTiene} — la conclusión barata se coló sin medir`);

  if (c.comprueba) {
    const ruta = join(QA, nombreNeg(CANONICA, c.etiqueta));
    if (!existsSync(ruta)) problemas.push(`no congeló ${nombreNeg(CANONICA, c.etiqueta)}`);
    else {
      const m = c.comprueba(JSON.parse(readFileSync(ruta, "utf8")));
      if (m) problemas.push(m);
    }
  }

  if (problemas.length) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(12)} ${c.porQue}`);
    problemas.forEach((p) => console.log(`       ${p}`));
  } else {
    console.log(`  ✅ ${c.etiqueta.padEnd(12)} ${c.porQue}`);
  }
  ev.ok();
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} ${casos.length - fallos}/${casos.length} — la conclusión BARATA («un solo estado») ` +
    `no se puede producir sin haber medido: la tumban el censo y el contrato.`,
);
console.log(`  ✓ evaluadas ${casos.length}/${casos.length} casos`);
ev.informe();
process.exit(fallos === 0 ? 0 : 1);
