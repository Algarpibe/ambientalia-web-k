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
 * | `sin-cargas` | el contrato de `Evaluadas`, **en CONSTRUCCIÓN** ⇒ código ≠ 0 | imprimir el párrafo de «un solo estado» sin cargas |
 *
 * ⚠ **`sin-cargas` es el que protege la afirmación que esta tanda va a
 * escribir.** Si el veredicto del `+16` se apoya en «un solo estado», ese
 * enunciado sólo vale si la sonda **no puede** producirlo sin haber medido.
 *
 * ── ⚠⚠ CORREGIDO 2026-08-17 (77.ª tanda): ESTE NEGATIVO NO PROBABA LO QUE DECÍA
 *
 * La fila de `sin-cargas` decía *«0 cargas **< mínimo** ⇒ NO SE PUDO EVALUAR»*,
 * o sea el contrato **en tiempo de ejecución**. **No puede ejercitarlo**, y el
 * motivo es de álgebra, no de código: el mínimo de esta sonda se **deriva** de
 * lo mismo que el sabotaje anula —`minimo: RUTAS.length * CARGAS`—, así que
 * `CARGAS=0` pone el mínimo **a 0 también**. El sabotaje **mueve la portería**:
 * nunca hay «0 evaluadas contra un mínimo positivo», hay «0 contra 0».
 *
 * Lo que ocurre de verdad es **anterior y más fuerte**: `Evaluadas` rechaza
 * `minimo < 1` **al construirse** y la sonda muere ahí, antes de abrir una sola
 * página. Sigue siendo el contrato, y sigue siendo imposible imprimir la frase
 * barata — pero por **otro mecanismo y con otro código**, y decirlo mal es
 * §*una afirmación de completitud se verifica ejercitándola, no releyéndola*.
 *
 * **El contrato en tiempo de EJECUCIÓN (`n < minimo` con mínimo positivo) está
 * cubierto donde toca: en `qa:lib`**, que es el negativo de la clase. Un
 * negativo de sonda no tiene que volver a probar la guarda común; tiene que
 * probar **lo suyo**, y lo suyo es que la frase barata no salga.
 *
 * ⚠ **Y por eso la aserción sustantiva se muda a `muerto`**, que es el caso que
 * sí recorre el cuerpo entero con 0 cargas válidas: se le exige **que imprima
 * «NO SE PUDO EVALUAR» y que NO imprima «UN SOLO ESTADO»**. Antes eso no se le
 * pedía a nadie que llegara hasta el recuento.
 *
 * ── Lo que destapó el fallo: NO fue un rojo, fue un CUELGUE ────────────────
 *
 * `sin-cargas` no daba «exit 1 ≠ 2»: daba **`status: null` tras 15 min**, o sea
 * el `timeout` de `spawnSync`. La causa estaba en `lib.mjs`: `gritaSiRevienta`
 * ponía `process.exitCode = 1` **y nada más**, y `exitCode` no termina el
 * proceso —sólo elige el código para cuando el bucle se vacíe—. Con el navegador
 * de puppeteer ya abierto (la excepción salta **después** de `launch()`), el
 * bucle no se vacía nunca. Arreglado en `lib.mjs` con un remate `unref()`ado.
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
    /* ⚠ Las dos aserciones que ANTES no se le pedían a nadie que llegara al
     * recuento. `muerto` es el único caso que recorre el cuerpo entero **con 0
     * cargas válidas**, así que es aquí —y no en `sin-cargas`, que muere al
     * construirse— donde se prueba que la frase barata no se puede imprimir. */
    salidaTiene: /NO SE PUDO EVALUAR: 0 cargas válidas/,
    salidaNoTiene: /UN SOLO ESTADO en las/,
    comprueba: (j) => {
      const alguna = Object.values(j.resumen || {}).some((v) => v.cargasValidas > 0);
      if (alguna) return "con el ancla muerta alguna ruta trae cargas válidas ⇒ el sabotaje no muerde";
      return null;
    },
  },
  {
    etiqueta: "sin-cargas",
    porQue: "0 cargas pedidas: el contrato de `Evaluadas` mata AL CONSTRUIR, y no se llega a imprimir nada",
    env: {},
    args: [SONDA, "0"],
    /* ⚠ exit **1**, no 2, y no es una rebaja: es el código que le corresponde al
     * mecanismo que de verdad actúa. `minimo` se deriva de `CARGAS`, así que
     * `CARGAS=0` deja el mínimo en 0 y `Evaluadas` **rechaza construirse**; la
     * sonda muere por excepción —código 1, vía `gritaSiRevienta`— antes de abrir
     * una página. Escribir 2 aquí era describir un camino que este sabotaje no
     * puede recorrer (ver la cabecera). El contrato en EJECUCIÓN vive en `qa:lib`. */
    exit: 1,
    salidaTiene: /Evaluadas: 'minimo' es obligatorio/,
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
