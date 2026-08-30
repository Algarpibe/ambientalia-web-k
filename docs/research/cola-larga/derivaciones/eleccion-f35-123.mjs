// 123.ª · PASO 0 (3) — ELEGIR el candidato, con el criterio DERIVADO.
//
// El encargo fija el criterio: «el que deje menos SIN PROBAR, no el mas
// pequeño». Aqui se le pone numero, porque un criterio aplicado de memoria sale
// invertido la mitad de las veces (§regla 23).
//
// SIN PROBAR de un candidato = ejes de dos lados que le faltan, PONDERADOS por
// si el arquetipo puede o no separar plantilla de campo:
//
//   · un arquetipo con n instancias CAPTURADAS >= 2 tiene la varianza
//     INTER-instancia, que es el discriminador fuerte;
//   · uno con n == 1 solo tiene los tests A y B, que son intra-instancia — y
//     lo que ellos no separen sale SIN PROBAR y NO SE CABLEA.
//
// Asi que el hueco de un candidato de n==1 es IRREDUCIBLE en esta fase: medirlo
// no lo cierra. El de n>=2 si se cierra midiendo, y por eso «deja menos SIN
// PROBAR» al terminar.
//
// CONTROL: el criterio tiene que SEPARAR (§*un modelo se elige por lo que lo
// separa, no por lo que acierta*). Si todos los candidatos empatan, no se ha
// elegido: se ha escrito uno. Se publica el n.º de separadoras.

import { readFileSync, writeFileSync } from "node:fs";

const censo = JSON.parse(readFileSync("docs/research/cola-larga/derivaciones/censo-lib-123.json", "utf8"));
const cand = JSON.parse(readFileSync("docs/research/cola-larga/derivaciones/candidatos-f35-123.json", "utf8"));

// ── ejes de dos lados: se leen de COBERTURA-MEDICION.md, la tabla por ruta ────
// `O` = comparado contra el original · `c` = solo clon-contra-clon · `·` = nunca
const COB = readFileSync("docs/research/COBERTURA-MEDICION.md", "utf8");
const EJES = ["docH", "base", "arbol", "filas", "modulos", "offsets", "anchos", "enlaces", "comportamiento"];

function ejesDe(ruta) {
  // la fila de la tabla empieza por | `<ruta>` |
  const esc = ruta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = COB.match(new RegExp("^\\|\\s*`" + esc + "`\\s*\\|(.+)$", "m"));
  if (!m) return null;
  const celdas = m[1].split("|").map((c) => c.trim().replace(/\*/g, ""));
  const out = {};
  EJES.forEach((e, i) => (out[e] = celdas[i] ?? "?"));
  return out;
}

// ── candidatos: page.tsx con contenido PROPIO + su arquetipo + sus rutas ──────
// Cada candidato se nombra con UNA ruta concreta de la tabla (las dinamicas no
// tienen fila propia: la tienen sus instancias).
// ⚠ SECTOR y MONOGRAFICO NO son candidatos, y la v1 los metia. Sus 13 imports de
// `@/lib/sectores` y `@/lib/monografico` son TODOS `import type`: su contenido lo
// sirve ya `lib/cms/sectores` por `leeColeccion`. Los metio un descuento roto de
// `import type` en el censo, y lo delato contradecir a PLAN-FASE-3 §F3-5, que ya
// los tenia fuera del alcance (§sondas 4, *la contradiccion con una medida buena
// anterior*). Con el censo arreglado, los dos inventarios CONCUERDAN: 5 rutas ·
// 4 arquetipos + 1 variante.
const CANDIDATOS = [
  { arquetipo: "HOME", page: "/", lib: ["products", "testimonials", "clients", "home-carrusel-sectores"], rutas: ["/"], corpusDir: null },
  { arquetipo: "PRODUCTO", page: "/monitor-calidad-aire", lib: ["monitor"], rutas: ["/monitor-calidad-aire"], corpusDir: "corpus/productos" },
  { arquetipo: "CATALOGO", page: "/accesorios", lib: ["accesorios"], rutas: ["/accesorios"], corpusDir: "corpus/productos" },
  { arquetipo: "SOFTWARE", page: "/software-de-medicion-calidad-del-aire", lib: ["software"], rutas: ["/software-de-medicion-calidad-del-aire", "/kunak-api"], corpusDir: "corpus/productos" },
];

// instancias CAPTURADAS del arquetipo = documentos B- de su directorio de corpus
const capturadasPorDir = new Map();
for (const f of cand.filas) {
  const d = f.fichero.split("/").slice(0, -1).join("/");
  capturadasPorDir.set(d, (capturadasPorDir.get(d) ?? 0) + 1);
}

const filas = CANDIDATOS.map((c) => {
  const ejesPorRuta = c.rutas.map((r) => ({ ruta: r, ejes: ejesDe(r) }));
  const leidas = ejesPorRuta.filter((x) => x.ejes);
  // un eje esta CUBIERTO para el candidato si lo esta en TODAS sus rutas
  const cubiertos = EJES.filter((e) => leidas.length && leidas.every((x) => x.ejes[e] === "O"));
  const faltan = EJES.filter((e) => !cubiertos.includes(e));
  const nCap = c.corpusDir ? (capturadasPorDir.get(c.corpusDir) ?? 0) : 0;
  const censoFila = censo.filas.find((f) => f.ruta === c.page);
  return {
    arquetipo: c.arquetipo,
    page: c.page,
    lib: c.lib,
    rutasEnLaTabla: leidas.length,
    rutasPedidas: c.rutas.length,
    modulosPropiosDelCenso: censoFila ? censoFila.propio : null,
    instanciasCapturadas: nCap,
    puedeSepararInter: nCap >= 2,
    ejesCubiertos: cubiertos,
    ejesQueFaltan: faltan,
    nFaltan: faltan.length,
    // SIN PROBAR irreducible: los ejes que faltan Y ademas no hay con que
    // separar plantilla de campo mas alla de A y B
    sinProbarIrreducible: nCap >= 2 ? 0 : faltan.length,
    detallePorRuta: ejesPorRuta,
  };
});

// ── CONTROLES ────────────────────────────────────────────────────────────────
const controles = [];
controles.push({
  nombre: "la tabla de cobertura se LEE (no es un cero de regex)",
  ok: filas.some((f) => f.rutasEnLaTabla > 0),
  visto: filas.map((f) => `${f.arquetipo}:${f.rutasEnLaTabla}/${f.rutasPedidas}`).join(" "),
});
controles.push({
  nombre: "toda ruta pedida existe en la tabla (si no, el candidato se lee con menos ejes de los que tiene)",
  ok: filas.every((f) => f.rutasEnLaTabla === f.rutasPedidas),
  visto: filas.filter((f) => f.rutasEnLaTabla !== f.rutasPedidas).map((f) => f.arquetipo).join(",") || "todas",
});
// ⚠ EL CRITERIO PRINCIPAL EMPATA, Y HAY QUE PUBLICARLO EN VEZ DE TAPARLO CON EL
// DESEMPATE. «Menos SIN PROBAR irreducible» solo separa a los candidatos SIN
// captura: los que tienen n>=2 empatan TODOS en 0, porque todos cierran su hueco
// midiendo. Contar sus pares como «separados» seria §*un booleano de
// concordancia es verdadero sobre un dominio de uno igual que sobre uno de mil*
// con el objeto puesto en el criterio.
//
// Y el desempate NO se inventa: lo nombra el encargo — «lo que falta son FILAS y
// MODULOS, que es exactamente el nivel donde F3-5 mide». Un desempate que nadie
// escribe lo elige el lenguaje y no lo dice (§regla 38).
const NIVEL_F35 = ["filas", "modulos"];
for (const f of filas) f.ejesDelNivelQueFaltan = f.ejesQueFaltan.filter((e) => NIVEL_F35.includes(e));

const sepPrincipal = [];
const sepDesempate = [];
for (let i = 0; i < filas.length; i++)
  for (let j = i + 1; j < filas.length; j++) {
    const a = filas[i], b = filas[j];
    if (a.sinProbarIrreducible !== b.sinProbarIrreducible) sepPrincipal.push(`${a.arquetipo}|${b.arquetipo}`);
    else if (a.ejesDelNivelQueFaltan.length !== b.ejesDelNivelQueFaltan.length) sepDesempate.push(`${a.arquetipo}|${b.arquetipo}`);
  }
const sep = [...sepPrincipal, ...sepDesempate];
const nPares = (filas.length * (filas.length - 1)) / 2;
controles.push({
  nombre: "el criterio PRINCIPAL separa, y se publica cuanto (no se tapa con el desempate)",
  ok: sepPrincipal.length > 0,
  visto: `principal ${sepPrincipal.length}/${nPares} · desempate ${sepDesempate.length}/${nPares} · sin ordenar ${nPares - sep.length}`,
});

// ── ORDEN: menos SIN PROBAR irreducible; a igualdad, MAS ejes DEL NIVEL F3-5
//    que cerrar; a igualdad, mas instancias capturadas.
const orden = filas.slice().sort(
  (a, b) =>
    a.sinProbarIrreducible - b.sinProbarIrreducible ||
    b.ejesDelNivelQueFaltan.length - a.ejesDelNivelQueFaltan.length ||
    b.instanciasCapturadas - a.instanciasCapturadas,
);

const salida = {
  meta: {
    tanda: "123.ª · PASO 0 (3)",
    fecha: new Date().toISOString().slice(0, 10),
    criterio: "menos SIN PROBAR IRREDUCIBLE; a igualdad, mas ejes que cerrar; a igualdad, mas instancias",
    noContesta: ["si el content type se puede escribir (eso lo dice el ESCALON 2)"],
  },
  controles,
  separadoras: { principal: sepPrincipal, desempate: sepDesempate, nPares },
  nivelF35: NIVEL_F35,
  orden: orden.map((f) => f.arquetipo),
  filas: orden,
};
writeFileSync("docs/research/cola-larga/derivaciones/eleccion-f35-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== CANDIDATOS, ordenados por el criterio ===");
console.log("  arq          lib                inst  ejesFaltan             irred  nivelF35-falta");
for (const f of orden) {
  console.log(
    `  ${f.arquetipo.padEnd(12)} ${f.lib.join(",").slice(0, 18).padEnd(18)} ${String(f.instanciasCapturadas).padStart(4)}  ${f.ejesQueFaltan.join(",").padEnd(22)} ${String(f.sinProbarIrreducible).padStart(5)}  ${f.ejesDelNivelQueFaltan.join(",") || "-"}`,
  );
}
console.log("");
console.log(`ELEGIDO: ${orden[0].arquetipo}  (page ${orden[0].page}, lib ${orden[0].lib.join(",")})`);
console.log(`  ejes que cierra      : ${orden[0].ejesQueFaltan.join(", ")}`);
console.log(`  de ellos, nivel F3-5 : ${orden[0].ejesDelNivelQueFaltan.join(", ") || "ninguno"}`);
console.log(`  instancias      : ${orden[0].instanciasCapturadas} capturadas -> ${orden[0].puedeSepararInter ? "SI hay varianza INTER-instancia" : "NO: solo tests A y B"}`);

const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
if (nulo) process.exit(1);
