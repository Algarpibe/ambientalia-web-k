/**
 * ¿CONTRA QUÉ CONTENEDOR RESUELVE SUS % CADA UNA DE LAS 9 FORMAS? — y ¿los
 * cubre la tabla de `mbPorDefecto`?
 * Uso: node scripts/qa/lh-contenedores.mjs        (npm run qa:lh-contenedores)
 *
 * ── De dónde sale la pregunta ─────────────────────────────────────────────
 * Del ⚠⚠ del §Test A de `CLAUDE.md`: *«un default expresado como porcentaje se
 * lee como constante en cuanto se cita, porque el px es lo que se puede
 * comparar y el contenedor no viaja con él»*. `lh-spec` midió los dos
 * contenedores de `L1` —**911.75** y **1238.39**— y son **literalmente** los dos
 * de ese aviso, así que la pregunta no es retórica: hay que comprobar contra
 * cuál resuelve cada forma **antes** de construir ninguna.
 *
 * ── Las dos direcciones, escritas ANTES de mirar ───────────────────────────
 * §UNA COMPROBACIÓN RETROACTIVA SE ENMARCA EN LAS DOS DIRECCIONES:
 *
 *   (a) ¿alguna medida ya congelada resolvió un % contra el contenedor
 *       EQUIVOCADO?
 *   (b) ¿la regla nueva (`mbPorDefecto`, «manda el ancho de la FILA») vale para
 *       las 9 formas, o sólo para las que se midieron?
 *
 * ── Qué NO es esto ────────────────────────────────────────────────────────
 * No es una sonda del sitio: **no abre navegador ni toca el original**. Deriva
 * de dos congeladas (`lh-spec-{1440,390}.json`) y del FUENTE de `defaults.ts`.
 * Su unidad es **la forma**, no la ruta.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas` con el mínimo derivado del nº de formas de la congelada;
 * 2 · los anchos cubiertos se **derivan del fuente** con una expresión sobre
 *     `export const ANCHO_FILA_* = N`; si no encuentra ninguno **TIRA** — un
 *     cero ahí daría «ninguna forma está cubierta», que es un dato falso con
 *     forma de hallazgo (§sondas 4);
 * 3 · congela en `medidas/lh-contenedores.json`;
 * 4 · negativo: `SABOTAJE=sin-constantes|forma-huerfana|tabla-sin-kb|modulo-en-l3`.
 *
 * ── ⚠ ESTA SONDA ESTUVO ROJA A PROPÓSITO, y se puso VERDE sola ────────────
 * Nació roja el 2026-08-11 con dos causas, y **las dos se cerraron en la tanda
 * de decisión del mismo día**. Se documenta el recorrido porque un verde sin
 * historia es indistinguible de un verde que nunca miró:
 *
 * | ficha | cómo cerró |
 * |---|---|
 * | **§LH-CONTENEDOR-ROL** | ✅ **MITIGADA** (PASO 3) — `mbPorDefecto` **exige el rol** y una COLUMNA tira. Ejercitado en `qa:lh-rol`: 7 casos, negativo 1/1. La colisión sigue **en el dato** —911.75 es las dos cosas— así que se informa, pero ya no puede colarse en silencio |
 * | **§LH-CONTENEDOR-L3** | ✅ **CERRADA** (PASO 6) — y no midiendo el default, sino viendo que **la pregunta no aplica**: el listado de `L3-sci` va por **`loop-del-tema`**, no por módulo Divi, y de su fila de 1152 **no cuelga ni un módulo de cuerpo** (el único es la miga). Sin módulos no hay `mb` que omitir, así que no hace falta defecto |
 *
 * **Y la guarda queda, no se relaja:** si `L3` gana algún día módulos Divi de
 * cuerpo, su 1152 vuelve a contar como huérfano y `mbPorDefecto` **tira**. Lo
 * que cambió no es el umbral: es que ahora se cuenta **de qué anchos cuelga
 * contenido**, en vez de qué anchos existen.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const SAB = process.env.SABOTAJE ?? "";
const RAIZ = join(QA, "../..");

/* ── Los anchos que la tabla de `mbPorDefecto` cubre, DERIVADOS del fuente ── */
const FUENTE = readFileSync(join(RAIZ, "packages/cms-config/src/defaults.ts"), "utf8");
const RE_ANCHO = SAB === "sin-constantes" ? /export const NO_EXISTE_(\w+)\s*=\s*([\d.]+)/g : /export const ANCHO_FILA_(\w+)\s*=\s*([\d.]+)/g;
const CUBIERTOS = Object.fromEntries(
  [...FUENTE.matchAll(RE_ANCHO)]
    .map((m) => [Number(m[2]), m[1]])
    /* El negativo de la COLISIÓN: si la tabla no tuviera 911.75, la colisión
     * tendría que desaparecer. Eso prueba que la produce el cruce dato × tabla
     * y no una constante escrita dentro de la sonda. */
    .filter(([, n]) => !(SAB === "tabla-sin-kb" && n === "KB")),
);
if (!Object.keys(CUBIERTOS).length)
  throw new Error(
    "no se encontró ni una constante `ANCHO_FILA_*` en packages/cms-config/src/defaults.ts.\n" +
      "  Sin ellas, TODA forma saldría «no cubierta»: eso es un cero de selector\n" +
      "  disfrazado de hallazgo (§sondas 4), no un resultado.",
  );

const spec = (a) => JSON.parse(readFileSync(join(QA, `medidas/lh-spec-${a}.json`), "utf8"));
const S = { 1440: spec(1440), 390: spec(390) };

/** La miga de pan es un módulo del CASCARÓN, no del cuerpo editorial. */
const ES_MIGA = (m) => (m.clases ?? []).some((c) => /breadcrumb/i.test(c));

/**
 * De una página: los anchos de FILA y de COLUMNA distintos que tiene su cuerpo,
 * **y cuántos MÓDULOS DIVI de cuerpo cuelgan de cada ancho de fila**.
 *
 * ⚠ Lo último es lo que decide si a esa forma le hace falta `mbPorDefecto`: la
 * tabla existe para **omitir el `mb` de un módulo cuando coincide con su
 * defecto**, así que una fila **sin módulos de cuerpo** no necesita ningún
 * defecto — no hay nada que omitir. Sin este recuento, `lh-contenedores`
 * marcaba `L3-sci` como huérfana por un ancho (1152) del que **no cuelga ni un
 * módulo editorial**.
 */
const anchosDe = (p) => {
  const filas = new Set();
  const columnas = new Map();
  const modulosPorFila = {};
  for (const s of p.esqueleto?.cuerpo ?? [])
    for (const f of s.filas ?? []) {
      filas.add(f.rect.w);
      modulosPorFila[f.rect.w] ??= 0;
      for (const c of f.columnas ?? []) {
        const t = (c.tipo ?? "").replace("et_pb_column_", "");
        columnas.set(`${t}@${c.rect.w}`, (columnas.get(`${t}@${c.rect.w}`) ?? 0) + 1);
        modulosPorFila[f.rect.w] += (c.modulos ?? []).filter((m) => !ES_MIGA(m)).length;
        /* ⚠ CONTROL de §sondas 8a: desde que `L3` se cerró, **nada dispara la
         * guarda de huérfanas** — y una guarda que ya no se ejercita no se
         * distingue de una que no funciona. Este sabotaje finge un módulo de
         * cuerpo colgando de la fila de 1152, y la guarda tiene que volver a
         * saltar. */
        if (SAB === "modulo-en-l3" && f.rect.w === 1152) modulosPorFila[f.rect.w] += 1;
      }
    }
  return { filas: [...filas], columnas: Object.fromEntries(columnas), modulosPorFila, via: p.listado?.via ?? null };
};

/* La FORMA es la unidad, y una forma puede traer varias instancias medidas. */
const formas = {};
for (const [k, p] of Object.entries(S[1440].paginas)) (formas[p.forma] ??= { rutas: [] }).rutas.push(p.ruta ?? k);

const ev = new Evaluadas({ nombre: "lh-contenedores", unidad: "formas", minimo: SAB === "forma-huerfana" ? Object.keys(formas).length + 1 : Object.keys(formas).length });

const filasPorForma = {};
for (const [k, p] of Object.entries(S[1440].paginas)) {
  const a = anchosDe(p);
  const f = p.forma;
  const acc = (filasPorForma[f] ??= { instancias: 0, filas: new Set(), columnas: {}, filas390: new Set(), modulosPorFila: {}, via: null });
  acc.instancias++;
  acc.via ??= a.via;
  for (const x of a.filas) acc.filas.add(x);
  for (const [w, n] of Object.entries(a.modulosPorFila)) acc.modulosPorFila[w] = Math.max(acc.modulosPorFila[w] ?? 0, n);
  for (const [c, n] of Object.entries(a.columnas)) acc.columnas[c] = (acc.columnas[c] ?? 0) + n;
  const p390 = Object.values(S[390].paginas).find((q) => q.forma === f && q.ruta === p.ruta);
  if (p390) for (const x of anchosDe(p390).filas) acc.filas390.add(x);
}

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿contra qué contenedor resuelve sus % cada una de las 9 formas, y los cubre la tabla de mbPorDefecto?",
    fuente: "medidas/lh-spec-{1440,390}.json (congeladas) + packages/cms-config/src/defaults.ts (fuente)",
    sabotaje: SAB || null,
    anchosCubiertosPorLaTabla: CUBIERTOS,
    noMide: [
      "el original: no abre navegador — deriva de dos congeladas",
      "el valor de `mb` de cada módulo: eso es `lh-spec`/`kb-spec`; aquí sólo se pregunta si el CONTENEDOR está en la tabla",
      "las formas que lh-spec no trae: su alcance son 9 formas × 1 instancia canónica + 4 segundas",
    ],
  },
  formas: {},
};

const huerfanas = [];
for (const [f, v] of Object.entries(filasPorForma)) {
  const filas = [...v.filas].sort((a, b) => a - b);
  /* Sólo cuenta como huérfano un ancho SIN CUBRIR del que cuelgue al menos un
   * módulo de cuerpo: si no cuelga ninguno, no hay ningún `mb` que omitir. */
  const sinCubrir = filas.filter((x) => x > 0 && !(x in CUBIERTOS) && (v.modulosPorFila[x] ?? 0) > 0);
  const sinCubrirSinModulos = filas.filter((x) => x > 0 && !(x in CUBIERTOS) && (v.modulosPorFila[x] ?? 0) === 0);
  salida.formas[f] = {
    instancias: v.instancias,
    anchosDeFila1440: filas,
    anchosDeFila390: [...v.filas390].sort((a, b) => a - b),
    columnas: v.columnas,
    viaDelListado: v.via,
    modulosDeCuerpoPorAnchoDeFila: v.modulosPorFila,
    cubiertaPorMbPorDefecto: filas.length > 0 && sinCubrir.length === 0,
    anchosDeFilaSinCubrir: sinCubrir,
    anchosSinCubrirPeroSinModulosDeCuerpo: sinCubrirSinModulos,
    tieneFilasDivi: filas.length > 0,
  };
  if (filas.length && sinCubrir.length) huerfanas.push(`${f} → fila ${sinCubrir.join(" · ")}`);
  ev.ok();
}

/* ── LA COLISIÓN DE ROL, que es lo que esta sonda existe para ver ──────────
 * Un mismo NÚMERO puede ser el ancho de una FILA en un arquetipo y el de una
 * COLUMNA en otro. `mbPorDefecto` recibe un número suelto, así que no puede
 * distinguirlos — y el número 911.75 tiene los dos papeles. */
const colisiones = [];
for (const [f, v] of Object.entries(salida.formas))
  for (const [c, n] of Object.entries(v.columnas)) {
    const anchoCol = Number(c.split("@")[1]);
    const rol = CUBIERTOS[anchoCol];
    if (rol && !v.anchosDeFila1440.includes(anchoCol))
      colisiones.push({ forma: f, columna: c, veces: n, anchoQueEnLaTablaEsFila: anchoCol, nombreEnLaTabla: `ANCHO_FILA_${rol}`, filaRealDeEstaForma: v.anchosDeFila1440 });
  }

salida.veredicto = {
  formasCubiertas: Object.values(salida.formas).filter((v) => v.cubiertaPorMbPorDefecto).length,
  formasSinFilasDivi: Object.entries(salida.formas).filter(([, v]) => !v.tieneFilasDivi).map(([k]) => k),
  formasHuerfanas: huerfanas,
  colisionesDeRol: colisiones,
  b_valeParaLasNueve: huerfanas.length === 0,
};

console.log(`\n═══ CONTENEDORES POR FORMA — ${Object.keys(salida.formas).length} formas, derivadas de lh-spec`);
console.log(`  la tabla de mbPorDefecto cubre: ${Object.entries(CUBIERTOS).map(([w, n]) => `${w} (ANCHO_FILA_${n})`).join(" · ")}`);
console.log(`\n  forma`.padEnd(28) + `inst`.padStart(5) + `  fila@1440`.padEnd(22) + `¿cubierta?`);
for (const [f, v] of Object.entries(salida.formas).sort())
  console.log(`  ${f.padEnd(26)}${String(v.instancias).padStart(4)}  ${(v.anchosDeFila1440.join(" · ") || "(sin filas Divi)").padEnd(20)}${v.tieneFilasDivi ? (v.cubiertaPorMbPorDefecto ? "✅" : "❌ " + v.anchosDeFilaSinCubrir.join(" · ")) : "⊘ no aplica"}`);

let rotos = 0;
if (huerfanas.length) {
  console.error(`\n⛔ ${huerfanas.length} forma(s) con un ancho de fila que la tabla NO cubre — mbPorDefecto TIRARÍA:\n   ${huerfanas.join("\n   ")}`);
  rotos++;
}
/* ── La COLISIÓN DE ROL: sigue siendo un hecho del dato, y ya está MITIGADA ──
 * Hasta el 2026-08-11 esto cerraba el código porque `mbPorDefecto` recibía un
 * número suelto y no podía distinguirlos. Desde el PASO 3 de la tanda de
 * decisión la firma **exige el rol** (`"fila" | "columna"`) y una columna TIRA:
 * ejercitado en `npm run qa:lh-rol`, 7 casos, negativo 1/1. El dato no cambia
 * —911.75 sigue siendo las dos cosas— pero ya no puede colarse en silencio, así
 * que se informa en vez de bloquear. */
if (colisiones.length) {
  console.log(`\n  ℹ COLISIÓN DE ROL (mitigada) — un mismo número es FILA en la tabla y COLUMNA en otra forma:`);
  for (const c of colisiones)
    console.log(`     ${c.forma}: la columna ${c.columna} vale ${c.anchoQueEnLaTablaEsFila} = \`${c.nombreEnLaTabla}\`, pero su FILA mide ${c.filaRealDeEstaForma.join(" · ")}`);
  console.log(`     ⇒ desde 2026-08-11 \`mbPorDefecto\` exige el rol y una COLUMNA tira. Guarda: qa:lh-rol.`);
}
console.log(`\n✓ evaluadas ${Object.keys(salida.formas).length}/${Object.keys(formas).length} formas · contenedor de los %`);

w("medidas/lh-contenedores.json", salida);
process.exit(rotos ? 2 : 0);
