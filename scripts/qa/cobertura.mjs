/**
 * MATRIZ DE COBERTURA — qué se ha comparado CONTRA EL ORIGINAL y qué no.
 * Uso: npm run qa:cobertura            (no necesita Chrome ni servidor)
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * En A-QA1b tres rutas resultaron tener el mismo defecto que una cuarta, y no
 * por fallar una comprobación: **nunca se habían comparado con el original en
 * ese eje**. El problema de fondo es que
 *
 *     «no hay defecto conocido» y «no se ha mirado» producen el MISMO informe.
 *
 * Sólo se distinguen con la lista de lo que se ha medido, y una lista escrita a
 * mano se pudre. Ésta se **computa de las salidas congeladas de `medidas/`**, o
 * sea que refrescarla es una corrida y no una tarde.
 *
 * ── Los tres estados, y por qué la distinción es el documento entero ───────
 *   O = comparado CONTRA EL ORIGINAL: alguna sonda abrió los DOS lados
 *   c = solo clon-contra-clon (`clon-base`, `offsets`): detecta regresión
 *       respecto a un build anterior y **no dice nada sobre fidelidad**
 *   · = nunca
 *
 * ⚠ `c` no es media medición: es cero información sobre fidelidad. Los tres
 * defectos de la miga vivían en rutas con `c` verde durante meses, y `clon-base`
 * dio 31/31 «sin mover un píxel» en la corrida que corregía +33.25 px de ancho.
 *
 * ── La guarda: una FUENTE QUE NO EXISTE ES UN ERROR, NO UN CERO ────────────
 * `CLAUDE.md` §sondas regla 4, aplicada a ficheros en vez de a selectores. Si
 * esta sonda declara que `mono-cmp-edar-1440.json` acredita el eje «módulos» y
 * el fichero no está, la celda saldría `·` — indistinguible de «nunca se midió».
 * Por eso toda fuente declarada y ausente sale por ERROR y cierra el código de
 * salida. Test en negativo: `SABOTAJE=1 npm run qa:cobertura` inventa una
 * fuente y tiene que salir con 2.
 */
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const M = path.join(QA, "medidas");
const SABOTAJE = !!process.env.SABOTAJE;
const hay = (f) => fs.existsSync(path.join(M, f));
const J = (f) => JSON.parse(fs.readFileSync(path.join(M, f), "utf8"));

/**
 * La congelación MÁS RECIENTE de una sonda: `base.json`, `base-FECHA.json`,
 * `base-FECHA-N.json`.
 *
 * ⚠ NO se ordena por nombre. `.` (0x2E) va DESPUÉS de `-` (0x2D), así que un
 * `.sort().pop()` elige `a-miga-1440-2026-08-01.json` por encima de
 * `…-08-01-4.json` — o sea la corrida de 8 pares en vez de la de 11. Da un
 * número plausible y MÁS BAJO, que es el peor fallo posible en una matriz de
 * cobertura: subestima en silencio. Se ordena por (fecha, secuencia) parseadas,
 * y el fichero sin fecha cuenta como el más antiguo.
 */
const congeladas = (base) => {
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:-(\\d{4}-\\d{2}-\\d{2})(?:-(\\d+))?)?\\.json$`);
  return fs
    .readdirSync(M)
    .map((x) => {
      const m = x.match(re);
      return m && { x, fecha: m[1] || "0000-00-00", seq: Number(m[2] || 1) };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.seq - b.seq)
    .map((o) => o.x);
};

/**
 * ⚠ La cobertura es la UNIÓN de todas las congelaciones, no la última.
 *
 * La pregunta que contesta la matriz es «¿se ha comparado ESTO alguna vez?», y
 * dos corridas de la misma sonda pueden cubrir rutas distintas: `c-banda`
 * congeló primero `world-athletics` + `kunak-api` y después **solo**
 * `/monitor-calidad-aire`. Quedarse con la última borraba dos rutas que sí se
 * habían medido — la matriz subestimaría, que es su peor fallo posible: manda a
 * remedir lo hecho y, peor, hace ruido donde no lo hay.
 */
const ultima = (base) => congeladas(base).pop();

const MANIFIESTO = path.join(QA, "../../.next/prerender-manifest.json");
if (!fs.existsSync(MANIFIESTO)) {
  console.error("❌ no hay .next/prerender-manifest.json — corre `npm run build` antes.");
  process.exit(2);
}
/* Contrato de `Evaluadas` (lib.mjs): la unidad es una RUTA de la matriz. Si el
 * manifiesto no da rutas no hay matriz que computar, y eso no es «matriz
 * limpia»: es NO SE PUDO EVALUAR. */
const RUTAS = Object.keys(JSON.parse(fs.readFileSync(MANIFIESTO, "utf8")).routes)
  .filter((r) => !r.startsWith("/_") && r !== "/favicon.ico")
  .sort();
const ev = new Evaluadas({ nombre: "cobertura", unidad: "rutas de la matriz", minimo: RUTAS.length });

/* ───────────────────────────── ejes y familias ───────────────────────────── */

const EJES = [
  ["docH", "docH"],
  ["base", "base cruda (h1.y)"],
  ["secciones", "árbol secciones"],
  ["filas", "filas"],
  ["modulos", "módulos"],
  ["offsets", "offsets/holgura"],
  ["anchos", "anchos horiz."],
  ["enlaces", "enlaces"],
  ["comport", "comportamiento"],
];

const FAMILIAS = [
  ["HOME", (r) => r === "/"],
  ["PRODUCTO", (r) => r === "/monitor-calidad-aire"],
  ["CATÁLOGO", (r) => r === "/accesorios"],
  ["SOFTWARE", (r) => r === "/kunak-api" || r === "/software-de-medicion-calidad-del-aire"],
  ["MONOGRÁFICO", (r) => /^\/sectores\/(monitorizacion-ambiental|monitorizacion-de-emisiones-en-petroleo)/.test(r)],
  ["SECTOR", (r) => r.startsWith("/sectores/")],
  ["CASO", (r) => r.startsWith("/casos-de-exito/") || r.startsWith("/case-studies/")],
  ["FAQ", (r) => r.startsWith("/faqs/")],
  ["A · documento científico", (r) => r.startsWith("/recursos/")],
  ["A · blog / término", () => true],
];
const familia = (r) => FAMILIAS.find(([, t]) => t(r))[0];

/* ─────────────────── acreditaciones, leídas de los congelados ────────────── */

const cov = {};
const errores = [];
/** Marca celdas. `nivel`: "O" (dos lados) | "c" (solo clon). */
const set = (ejes, rutas, nivel, sonda, fichero) => {
  for (const eje of [].concat(ejes))
    for (const r of [].concat(rutas)) {
      if (!r) continue;
      cov[eje] ??= {};
      const prev = cov[eje][r];
      if (prev?.nivel === "O") continue; // O gana a c
      if (prev?.nivel === "c" && nivel === "c") continue;
      cov[eje][r] = { nivel, sonda, fichero };
    }
};
/** Toda fuente declarada tiene que existir: si no, ERROR (no cero). */
const fuente = (f) => {
  if (hay(f)) return true;
  errores.push(f);
  return false;
};

// 1 · clon-base — guarda de no-regresión: docH, base, nº secciones. SOLO CLON.
for (const f of ["clon-base-1440-aqa1b.json", "clon-base-390-aqa1b.json"])
  if (fuente(f)) set(["docH", "base", "secciones"], Object.keys(J(f).paginas || J(f)), "c", "clon-base", f.replace(".json", ""));

// 2 · c-cabecera — BASE EN CRUDO contra el original. Deriva rutas del build.
for (const f of [...congeladas("c-cabecera-1440"), ...congeladas("c-cabecera-390")]) {
  if (fuente(f)) set("base", Object.keys(J(f).paginas || {}), "O", "c-cabecera", f.replace(".json", ""));
}

// 2b · a-cascaron (original) emparejado A MANO con clon-base en A-QA1.
//      Es comparación real de base en crudo, pero NO la hace una sonda sola.
if (fuente("a-cascaron-1440-2026-07-31-4.json"))
  set(
    "base",
    [
      "/contaminacion-por-metano",
      "/todas-nuestras-soluciones-en-el-iotswc",
      "/emisiones-atmosfericas",
      "/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
    ],
    "O",
    "a-cascaron×clon-base (a mano)",
    "a-cascaron-{1440,390}-2026-07-31-4",
  );

// 3 · c-cmp — docH + árbol contra el original. Desde 2026-08-01 deriva del build
//     y congela la ruta en cada entrada, así que ya no hace falta mapa a mano.
for (const f of [...congeladas("c-cmp-1440"), ...congeladas("c-cmp-390")]) {
  if (!fuente(f)) continue;
  const pag = J(f).paginas || {};
  const rutas = Object.values(pag)
    .map((v) => v?.ruta)
    .filter(Boolean);
  set(["docH", "secciones"], rutas.length ? rutas : [], "O", "c-cmp", f.replace(".json", ""));
}

// 4 · mono-cmp — docH, árbol, filas y MÓDULOS de los 2 monográficos.
for (const cual of ["edar", "petroleo"])
  for (const wdt of [1440, 390]) {
    const f = `mono-cmp-${cual}-${wdt}.json`;
    if (!fuente(f)) continue;
    set(
      ["docH", "secciones", "filas", "modulos"],
      J(f).meta.clon.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, ""),
      "O",
      "mono-cmp",
      f.replace(".json", ""),
    );
  }

// 5 · tree-cmp — árbol de secciones/filas del cuerpo, original vs clon.
for (const f of fs.readdirSync(M).filter((x) => /^tree-cmp-.*\.json$/.test(x)))
  set(["secciones", "filas"], J(f).meta.clon.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, ""), "O", "tree-cmp", f.replace(".json", ""));

// 6 · cmp-sector — sector ancla a ancla contra el original.
for (const f of fs.readdirSync(M).filter((x) => /^cmp-sector-.*\.json$/.test(x))) {
  const r = J(f).meta?.clon?.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  set(["secciones", "filas"], r, "O", "cmp-sector", f.replace(".json", ""));
}

// 7 · a-miga — ANCHOS, pero SOLO de la miga de pan (ver §caveat del informe).
{
  // ⚠ NO se ordena por nombre: `.` (0x2E) va DESPUÉS de `-` (0x2D), así que un
  // `.sort().pop()` elige `…-08-01.json` por encima de `…-08-01-4.json` y se
  // queda con la congelación de 8 pares en vez de la de 11. Da un número
  // plausible y más bajo — el peor tipo de fallo de sonda. Se ordena por
  // (fecha, secuencia) parseadas.
  const f = fs
    .readdirSync(M)
    .map((x) => {
      const m = x.match(/^a-miga-1440-(\d{4}-\d{2}-\d{2})(?:-(\d+))?\.json$/);
      return m && { x, fecha: m[1], seq: Number(m[2] || 1) };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.seq - b.seq)
    .pop()?.x;
  if (f) {
    const MAPA = {
      "blog CON relacionados": "/contaminacion-por-metano",
      "blog SIN relacionados": "/todas-nuestras-soluciones-en-el-iotswc",
      termino: "/emisiones-atmosfericas",
      "doc-cientifico":
        "/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
      "caso de éxito": "/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa",
      producto: "/monitor-calidad-aire",
      sector: "/sectores/calidad-del-aire-en-las-ciudades",
      "monográfico (petróleo)": "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
      accesorios: "/accesorios",
      software: "/software-de-medicion-calidad-del-aire",
      "kunak-api": "/kunak-api",
    };
    for (const k of Object.keys(J(f).pares || {})) set("anchos", MAPA[k], "O", "a-miga", f.replace(".json", ""));
  }
}

// 8 · c-banda — ancho/composición de la banda de título.
for (const f of [...congeladas("c-banda-1440"), ...congeladas("c-banda-390")])
  if (fuente(f)) set("anchos", Object.keys(J(f).paginas || {}), "O", "c-banda", f.replace(".json", ""));

// 9 · offsets — holgura de columna. SOLO CLON por construcción.
for (const f of fs.readdirSync(M).filter((x) => x.startsWith("offsets-") && x.endsWith(".json")))
  set("offsets", J(f).meta.ruta, "c", "offsets", f.replace(".json", ""));

// 10 · enlaces — las 31 contra las rutas que emite el build.
if (fuente("enlaces.json")) set("enlaces", J("enlaces.json").publicadas || RUTAS, "O", "enlaces", "enlaces");

// 11 · comportamiento — `a-behaviors` y `c-behaviors` SOLO abren el original:
//      son recon de fase 1. Censar el original no es comparar el clon: no se
//      acredita nada, y ése es el hallazgo.

if (SABOTAJE) fuente("cobertura-FUENTE-INVENTADA.json");

/* ──────────────────────────────── informe ────────────────────────────────── */

const sim = (c) => (!c ? "·" : c.nivel === "O" ? "**O**" : "c");
const lineas = [];
lineas.push("| ruta | " + EJES.map(([, n]) => n).join(" | ") + " |");
lineas.push("|---|" + EJES.map(() => "---").join("|") + "|");
const orden = FAMILIAS.map(([n]) => n);
let ultimaFam = "";
for (const r of [...RUTAS].sort((a, b) => orden.indexOf(familia(a)) - orden.indexOf(familia(b)) || a.localeCompare(b))) {
  ev.ok();
  if (familia(r) !== ultimaFam) {
    ultimaFam = familia(r);
    lineas.push(`| **${ultimaFam}** |` + EJES.map(() => "").join("|") + "|");
  }
  lineas.push("| `" + r + "` | " + EJES.map(([e]) => sim(cov[e]?.[r])).join(" | ") + " |");
}

const recuento = EJES.map(([e, n]) => {
  const O = RUTAS.filter((r) => cov[e]?.[r]?.nivel === "O").length;
  const c = RUTAS.filter((r) => cov[e]?.[r]?.nivel === "c").length;
  const sondas = [...new Set(RUTAS.map((r) => cov[e]?.[r]?.sonda).filter(Boolean))];
  return { eje: e, nombre: n, O, c, nunca: RUTAS.length - O - c, sondas };
});

console.log(lineas.join("\n"));
console.log("\n=== RECUENTO POR EJE ===");
for (const x of [...recuento].sort((a, b) => b.O - a.O))
  console.log(
    x.nombre.padEnd(20),
    "O=" + String(x.O).padStart(2),
    " c=" + String(x.c).padStart(2),
    " nunca=" + String(x.nunca).padStart(2),
    " ← " + (x.sondas.join(" · ") || "NINGUNA"),
  );
console.log("\ntotal rutas emitidas:", RUTAS.length);

w("medidas/cobertura.json", {
  meta: { fecha: new Date().toISOString().slice(0, 10), rutas: RUTAS.length, sabotaje: SABOTAJE },
  recuento,
  matriz: Object.fromEntries(RUTAS.map((r) => [r, Object.fromEntries(EJES.map(([e]) => [e, cov[e]?.[r] ?? null]))])),
  tablaMarkdown: lineas.join("\n"),
});

if (errores.length) {
  console.log(
    `\n❌ ${errores.length} FUENTE(S) DECLARADA(S) QUE NO EXISTEN. Una fuente ausente\n` +
      `   deja su celda en «·», que es indistinguible de «nunca se midió»: la matriz\n` +
      `   mentiría a la baja sin dar un solo error. Restaura el fichero o quita su\n` +
      `   declaración de esta sonda:\n` +
      errores.map((e) => "     · medidas/" + e).join("\n"),
  );
  process.exit(2);
}
console.log("\n✅ matriz computada · todas las fuentes declaradas existen.");
