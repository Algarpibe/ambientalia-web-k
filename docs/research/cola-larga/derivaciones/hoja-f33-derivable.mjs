/* ¿CUÁNTO DE `f33.css` ESTÁ YA DERIVADO? — 101.ª tanda, 2026-08-24.
 *
 * El PASO 0 destapó que **no existe `f33.css`** (§F3-3-SIN-HOJA): 17 clases y 5
 * familias de variables emitidas, 0 reglas en las cuatro hojas del clon. La
 * pregunta que decide si eso para la emisión o no es **cuánto de esa hoja se
 * puede escribir HOY sin volver a medir**, y esa pregunta no se contesta de
 * memoria: se deriva de las congeladas.
 *
 * ⚠ **NO es una sonda** —no declara `Evaluadas` ni congela en `medidas/`—: es
 * una lectura de lo ya congelado. Su fuente es `f33-geo.json`, resuelta por
 * mtime y nombrada abajo (§regla 5: el nombre canónico puede ser la PRIMERA
 * foto, así que se dice cuál se leyó).
 *
 * Lo que contesta: para cada valor que la hoja necesita, si está en la
 * congelada, con qué `n` y con qué varianza.
 * Lo que NO contesta: si el valor es PLANTILLA o CAMPO. Eso lo dicen los
 * veredictos de `f33-geo`, y aquí sólo se citan.
 */
import { readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const F = join(RAIZ, "scripts/qa/medidas/f33-geo.json");
const geo = JSON.parse(readFileSync(F, "utf8"));

console.log(`fuente : ${F.replace(RAIZ, ".")}`);
console.log(`mtime  : ${statSync(F).mtime.toISOString()}`);
console.log(`medida : ${geo.meta.fecha} · ${geo.meta.dominio.medidas}/${geo.meta.dominio.rutasDeclaradas} rutas\n`);

/* ── 1 · ANCHOS DE COLUMNA — la razón wCol/wFila por reparto ──────────────── */
console.log("═══ 1 · ANCHO DE COLUMNA por reparto (razón wCol/wFila) ═══");
console.log("   Es lo que hace que las columnas no apilen. Derivable: la");
console.log("   congelada trae `wCol`, `wFila` y `reparto` en cada módulo.\n");

for (const ancho of ["modulos1440", "modulos390"]) {
  const porReparto = new Map();
  for (const p of geo.paginas) {
    for (const m of p[ancho] ?? []) {
      if (!m.wFila || !m.wCol) continue;            /* sin caja: no se mide */
      const pct = +((m.wCol / m.wFila) * 100).toFixed(4);
      const k = m.reparto;
      if (!porReparto.has(k)) porReparto.set(k, new Map());
      const v = porReparto.get(k);
      v.set(pct, (v.get(pct) ?? 0) + 1);
    }
  }
  console.log(`  ── ${ancho === "modulos1440" ? "1440" : "390"} ──`);
  for (const [rep, vals] of [...porReparto].sort()) {
    const orden = [...vals].sort((a, b) => b[1] - a[1]);
    const total = orden.reduce((s, [, n]) => s + n, 0);
    const unico = orden.length === 1;
    console.log(
      `    ${rep.padEnd(5)} n=${String(total).padStart(3)}  ` +
        (unico ? `✅ ${orden[0][0]} %` : `⚠ ${orden.length} valores: ` + orden.map(([v, n]) => `${v} ×${n}`).join(" · ")),
    );
  }
  console.log();
}

/* ── 2 · DEFAULT DE `mb` — ya derivado por la propia sonda ────────────────── */
console.log("═══ 2 · DEFAULT DE `mb` por ancho de fila ═══");
const d = geo.defaultMbPorAnchoDeFila;
console.log(`   ${d.nota}`);
for (const [fila, c] of Object.entries(d.cruce)) {
  console.log(
    `    fila ${fila.padEnd(8)} n=${String(c.total).padStart(3)}  ` +
      `en el default ${c.enElDefault}  esperado ${c.esperado ?? "— (SIN DERIVAR)"}`,
  );
}
console.log(`   separadoras: ${d.nSeparadoras}\n`);

/* ── 3 · LO QUE LA CONGELADA NO TIENE ─────────────────────────────────────── */
console.log("═══ 3 · LO QUE LA CONGELADA **NO** TIENE ═══");
const p0 = geo.paginas[0];
const filas = Object.keys((p0.filas1440 ?? [])[0] ?? {});
const secs = Object.keys((p0.secciones1440 ?? [])[0] ?? {});
console.log(`   claves de una FILA    : ${filas.join(" · ") || "(ninguna)"}`);
console.log(`   claves de una SECCIÓN : ${secs.join(" · ") || "(ninguna)"}`);
const hay390 = geo.paginas.some((p) => p.filas390 || p.secciones390);
console.log(`   ¿filas/secciones a 390?  ${hay390 ? "sí" : "⛔ NO — sólo 1440"}`);
console.log();
console.log("   Faltan, y ninguna se puede inventar:");
console.log("     · el ritmo por DEFECTO de sección y fila — la congelada trae el");
console.log("       valor COMPUTADO, y no separa «lo que el dato trae» de «lo que");
console.log("       la hoja pone». Eso es justo lo que `qa:kb-clases` hace en KB:");
console.log("       derivarlo de los nodos cuyo DATO omite la propiedad;");
console.log("     · el CANAL entre columnas (`margin-right` de la no-última);");
console.log("     · el corte RESPONSIVE y el comportamiento al apilar;");
console.log("     · `float` / `max-width` de fila / `min-height` de columna;");
console.log("     · el ritmo de los WRAPPERS interiores (`et_pb_text_inner`…),");
console.log("       que en KB se omitieron CON medida («ritmo 0 en los 85») y");
console.log("       aquí no están medidos — §F3-3-MARCADO-INTERIOR.");
console.log();
console.log("   Instrumento que lo daría: `qa:f33-clases`, el equivalente de");
console.log("   `qa:kb-clases`. NO EXISTE (derivado: package.json declara");
console.log("   qa:f33-{cmp,geo,spec,membresia} y ninguna más).");
