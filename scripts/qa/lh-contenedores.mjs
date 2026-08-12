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
 * 4 · negativo: `SABOTAJE=sin-constantes|forma-huerfana|tabla-sin-kb`.
 *
 * ⚠ **ESTA SONDA SALE ROJA A PROPÓSITO, y no es un defecto suyo.** Su rojo es el
 * hallazgo: mientras `L3-sci` (fila **1152**) no esté medida y la **colisión de
 * rol** de `911.75` no se cierre, el veredicto correcto es ≠ 0. Fichas:
 * `PENDIENTES-QA.md` §LH-CONTENEDOR-L3 y §LH-CONTENEDOR-ROL. Se pondrá verde
 * cuando se decidan, no antes — un verde hoy sería el §sondas 4bis clásico.
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

/** De una página: los anchos de FILA y de COLUMNA distintos que tiene su cuerpo. */
const anchosDe = (p) => {
  const filas = new Set();
  const columnas = new Map();
  for (const s of p.esqueleto?.cuerpo ?? [])
    for (const f of s.filas ?? []) {
      filas.add(f.rect.w);
      for (const c of f.columnas ?? []) {
        const t = (c.tipo ?? "").replace("et_pb_column_", "");
        columnas.set(`${t}@${c.rect.w}`, (columnas.get(`${t}@${c.rect.w}`) ?? 0) + 1);
      }
    }
  return { filas: [...filas], columnas: Object.fromEntries(columnas) };
};

/* La FORMA es la unidad, y una forma puede traer varias instancias medidas. */
const formas = {};
for (const [k, p] of Object.entries(S[1440].paginas)) (formas[p.forma] ??= { rutas: [] }).rutas.push(p.ruta ?? k);

const ev = new Evaluadas({ nombre: "lh-contenedores", unidad: "formas", minimo: SAB === "forma-huerfana" ? Object.keys(formas).length + 1 : Object.keys(formas).length });

const filasPorForma = {};
for (const [k, p] of Object.entries(S[1440].paginas)) {
  const a = anchosDe(p);
  const f = p.forma;
  const acc = (filasPorForma[f] ??= { instancias: 0, filas: new Set(), columnas: {}, filas390: new Set() });
  acc.instancias++;
  for (const x of a.filas) acc.filas.add(x);
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
  const sinCubrir = filas.filter((x) => x > 0 && !(x in CUBIERTOS));
  salida.formas[f] = {
    instancias: v.instancias,
    anchosDeFila1440: filas,
    anchosDeFila390: [...v.filas390].sort((a, b) => a - b),
    columnas: v.columnas,
    cubiertaPorMbPorDefecto: filas.length > 0 && sinCubrir.length === 0,
    anchosDeFilaSinCubrir: sinCubrir,
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
if (colisiones.length) {
  console.error(`\n⛔ COLISIÓN DE ROL — un mismo número es FILA en la tabla y COLUMNA en otra forma:`);
  for (const c of colisiones)
    console.error(`   ${c.forma}: la columna ${c.columna} vale ${c.anchoQueEnLaTablaEsFila}, que en la tabla es \`${c.nombreEnLaTabla}\` — pero la FILA de esta forma mide ${c.filaRealDeEstaForma.join(" · ")}`);
  console.error(`   ⇒ pasarle ese número a mbPorDefecto NO da error: da el default del OTRO arquetipo.`);
  rotos++;
}
console.log(`\n✓ evaluadas ${Object.keys(salida.formas).length}/${Object.keys(formas).length} formas · contenedor de los %`);

w("medidas/lh-contenedores.json", salida);
process.exit(rotos ? 2 : 0);
