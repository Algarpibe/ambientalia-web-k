/**
 * ESCALÓN 1 de la 130.ª · ¿es NO-OP el marcador? — y la pregunta se contesta
 * SOBRE EL EJE QUE EL MARCADOR PODRÍA MOVER, no sobre el fichero entero.
 *
 * ⚠ POR QUÉ NO VALE «la congelada sale idéntica»: la guarda de `w()` compara
 * el CONTENIDO, y el contenido cambia por el propio eje que esta tanda
 * enciende —el bloque `modulos` pasa de 85 ejes a 191—. O sea que aquí la
 * guarda **no puede** firmar el NO-OP: firmaría un rojo garantizado. La
 * pregunta correcta es si la GEOMETRÍA DE FILAS se movió, que es lo único que
 * un atributo (o un envoltorio) podría tocar.
 *
 * Y no se compara el TOTAL (`130 · 43 · 3`): un recuento igual no prueba que
 * los conjuntos sean el mismo (§*un cardinal es un contenedor y absorbe la
 * membresía*). Se compara **eje a eje, con la diferencia simétrica**.
 *
 * QUÉ NO CONTESTA: no dice si los Δ del eje `modulos` son defectos del clon —
 * eso es la LÍNEA BASE del escalón 3, y es cobertura nueva, no regresión.
 */
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const RAIZ = join(import.meta.dirname, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts", "qa", "medidas");
const SAL = import.meta.dirname;

/* ANTES: la corrida del build SIN los 34 marcadores de la 130.ª.
 * DESPUÉS: la de este escalón. §regla 5, la guarda de las derivaciones: se
 * EXIGE que el después sea POSTERIOR al antes, o un resolutor al que le falte
 * el después compara dos fotos del mismo día llamándolas antes y después. */
const PARES = [
  { ancho: 1440, antes: "productos-cmp-1440-2026-08-31.json", despues: "productos-cmp-1440-2026-08-31-tras-marcador-software.json" },
  { ancho: 390, antes: "productos-cmp-390-2026-08-31.json", despues: "productos-cmp-390-2026-08-31-tras-marcador-software.json" },
];

const statMs = (f) => statSync(f).mtimeMs;
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

const informe = [];
let roto = false;
for (const p of PARES) {
  const pa = join(MED, p.antes), pd = join(MED, p.despues);
  for (const [k, f] of [["antes", pa], ["despues", pd]]) if (!existsSync(f)) throw new Error(`PRECONDICIÓN: falta la congelada de ${k}: ${basename(f)}`);
  const ta = statMs(pa), td = statMs(pd);
  if (!(td > ta)) throw new Error(`PRECONDICIÓN: el DESPUÉS (${p.despues}) no es posterior al ANTES (${p.antes}) — §regla 5`);

  const A = JSON.parse(readFileSync(pa, "utf8"));
  const D = JSON.parse(readFileSync(pd, "utf8"));

  /* La unidad es el EJE DE FILA: `ruta::fila::eje` → valor del clon. Se toma
   * del lado CLON porque es el único que este cambio puede mover: el original
   * es el mismo fichero de corpus en las dos corridas. */
  const claves = (J) => {
    const m = new Map();
    for (const i of J.informe) for (const d of i.difs) m.set(`${i.ruta}::f${d.fila}::${d.eje}`, `orig ${d.orig} → clon ${d.clon}`);
    return m;
  };
  const ka = claves(A), kd = claves(D);
  const soloAntes = [...ka.keys()].filter((k) => !kd.has(k));
  const soloDespues = [...kd.keys()].filter((k) => !ka.has(k));
  const cambiados = [...ka.keys()].filter((k) => kd.has(k) && ka.get(k) !== kd.get(k));

  /* Y los ejes de fila que NO difieren tampoco pueden haberse movido: se
   * comprueban los totales al lado, como resumen — nunca como prueba. */
  const tot = (J) => ({ ejes: J.resumen.ejesComparados, distintos: J.resumen.distintos, subpixel: J.resumen.subpixel });

  const ok = soloAntes.length === 0 && soloDespues.length === 0 && cambiados.length === 0;
  if (!ok) roto = true;

  say(`═══ ${p.ancho} · ${p.antes}  →  ${p.despues} ═══`);
  say(`  totales (resumen, NO prueba): antes ${JSON.stringify(tot(A))}  después ${JSON.stringify(tot(D))}`);
  say(`  diferencia simétrica de los ejes de FILA que difieren:`);
  say(`     sólo ANTES   : ${soloAntes.length}${soloAntes.length ? " → " + soloAntes.join(" · ") : ""}`);
  say(`     sólo DESPUÉS : ${soloDespues.length}${soloDespues.length ? " → " + soloDespues.join(" · ") : ""}`);
  say(`     con VALOR distinto : ${cambiados.length}${cambiados.length ? " → " + cambiados.map((k) => `${k} (${ka.get(k)} ⇒ ${kd.get(k)})`).join(" · ") : ""}`);
  say(`  ⇒ eje FILAS ${ok ? "NO-OP al bit ✓" : "MOVIDO ✗ — el marcador toca maquetación"}`);

  /* Lo que SÍ cambia, que es lo que la tanda compra. */
  const mods = (J) => J.resumen.modulos || null;
  say(`  eje MÓDULOS (cobertura nueva): antes ${JSON.stringify(mods(A))}`);
  say(`                                 después ${JSON.stringify(mods(D))}`);
  say("");

  informe.push({ ancho: p.ancho, antes: p.antes, despues: p.despues, noOpEjeFilas: ok, soloAntes, soloDespues, cambiados, totales: { antes: tot(A), despues: tot(D) }, modulos: { antes: mods(A), despues: mods(D) } });
}


/* ── CONTROL en negativo (§regla 8: un negativo sin control no es un negativo)
 * Si esta comparación no supiera GRITAR, su «0 · 0 · 0» no valdría nada. Se
 * inyecta un Δ conocido en una copia del lado clon y se exige que lo cace Y lo
 * nombre. */
say("═══ CONTROL — ¿sabe GRITAR? (§regla 24: un caso atado sólo al exit caduca) ═══");
{
  const D = JSON.parse(readFileSync(join(MED, PARES[0].despues), "utf8"));
  const A = JSON.parse(readFileSync(join(MED, PARES[0].antes), "utf8"));
  const sab = JSON.parse(JSON.stringify(D));
  const primera = sab.informe.find((i) => i.difs.length);
  primera.difs[0].clon = primera.difs[0].clon + 37.5;
  const claves = (J) => { const m = new Map(); for (const i of J.informe) for (const d of i.difs) m.set(`${i.ruta}::f${d.fila}::${d.eje}`, `orig ${d.orig} → clon ${d.clon}`); return m; };
  const ka = claves(A), ks = claves(sab);
  const cambiados = [...ka.keys()].filter((k) => ks.has(k) && ka.get(k) !== ks.get(k));
  const cazado = cambiados.length === 1;
  say(`  Δ inyectado de +37.5 en ${primera.ruta} → cazado: ${cazado ? "SÍ ✓" : "NO ✗"} (${cambiados.length} cambios)`);
  say(`     nombrado: ${cambiados[0] || "(ninguno)"} · ${ka.get(cambiados[0])} ⇒ ${ks.get(cambiados[0])}`);
  if (!cazado) { roto = true; say("  ✗ el control NO discrimina: el 0·0·0 de arriba no prueba nada"); }
}

const salida = {
  meta: {
    tanda: "130.ª", escalon: "1", fecha: new Date().toISOString().slice(0, 10),
    pregunta: "¿mueve el marcador la geometría de FILAS? — la unidad es el EJE DE FILA (ruta::fila::eje), no el total",
    porQueNoLaFirmaW: "la guarda de w() compara el fichero entero, y el fichero cambia por el bloque `modulos` que esta tanda enciende: no puede firmar este NO-OP",
    noContesta: "no dice si los Δ del eje `modulos` son defectos del clon — eso es la línea base, y es cobertura nueva",
  },
  informe,
};

const w2 = (nombre, contenido) => {
  const p = join(SAL, nombre);
  if (existsSync(p) && readFileSync(p, "utf8") !== contenido) {
    const alt = p.replace(/(\.\w+)$/, `-${new Date().toISOString().slice(0, 10)}$1`);
    writeFileSync(alt, contenido); say(`⚠ ${nombre} existe y difiere — al lado: ${basename(alt)}`); return;
  }
  writeFileSync(p, contenido); say(`→ ${nombre}`);
};
say("");
w2("escalon1-noop-130.json", JSON.stringify(salida, null, 1));
w2("escalon1-noop-130.log", L.join("\n") + "\n");
say(`✓ evaluadas ${informe.length}/2 anchos · NO-OP del marcador sobre el eje FILAS`);
if (roto) process.exitCode = 1;
