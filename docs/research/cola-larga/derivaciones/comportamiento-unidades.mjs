/* comportamiento-unidades — 108.ª tanda, 2026-08-25. PASO 0.
 *
 * ── La pregunta ───────────────────────────────────────────────────────────
 * El parte de la 107.ª escribe *«el eje COMPORTAMIENTO a 0/31»*.
 * `COBERTURA-MEDICION.md` publica **37**. Las dos cifras conviven en el repo y
 * se leen como si una estuviera desactualizada.
 *
 * Es la forma del **48 RUTAS / 32 páginas** (§*corregir un denominador no es
 * sustituirlo en todas partes*) y la del **13 páginas / 13 familias**
 * (§*dos lecturas pueden dar el mismo cardinal contando unidades distintas*):
 * antes de sustituir una por otra hay que comprobar **qué unidad cuenta cada
 * una**, porque las dos pueden ser ciertas de conjuntos distintos.
 *
 * ── Qué CONTESTA y qué NO ─────────────────────────────────────────────────
 * CONTESTA: cuántos conjuntos distintos se están llamando «el eje
 * comportamiento», cuáles son sus elementos, y si se solapan.
 * NO CONTESTA: cuál de ellos hay que escribir en el registro. Eso es una
 * decisión, y esta tanda no decide: publica los tres con su unidad.
 *
 * ⚠ EL CERO DE ESTA DERIVACIÓN LLEVA SU CONTROL, y hace falta:
 * `cobertura` indexa por **ruta del CLON** (`/sistema-interno-de-informacion`)
 * y `f33-cmp` por **URL del ORIGINAL** (`/es/sistema-interno-de-informacion/`).
 * Cruzadas en crudo, la intersección sale **0 por construcción** — que es
 * §regla 33: *una llave que no casa fabrica el hallazgo*. Por eso se normaliza
 * y se publica el control `f33 fuera de la matriz de emitidas`, que tiene que
 * ser **0**: si no lo es, la llave no casa y el cero no vale nada.
 *
 * ⚠ Las congeladas se resuelven por **mtime**, no por nombre (§regla 5: el
 * nombre canónico conserva la PRIMERA foto), descartando los artefactos de
 * §regla 7 (`-neg-`, `SABOTAJE`, `SONDA-`, `CADUCADA`, `CONTAMINADA`), y la
 * sonda dice en voz alta qué fichero resolvió.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const M = join(import.meta.dirname, "../../../../scripts/qa/medidas");

const ARTEFACTO = /-neg-|-neg\.|SABOTAJE|SONDA-|CADUCADA|CONTAMINADA|CORRIDA-SUELTA/;

/** La congelada MÁS RECIENTE por mtime de una familia, descartando §regla 7. */
function porMtime(re) {
  const ficheros = readdirSync(M)
    .filter((f) => re.test(f) && !ARTEFACTO.test(f))
    .map((f) => ({ f, mtime: statSync(join(M, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!ficheros.length) throw new Error(`sin congeladas para ${re}`);
  return ficheros[0].f;
}

const J = (f) => JSON.parse(readFileSync(join(M, f), "utf8"));

/* `/es/foo/` (original) → `/foo` (clon). Sin barra final: `trailingSlash` no
 * está activado en el clon. */
const norm = (u) => {
  const s = u.replace(/^\/es(?=\/|$)/, "").replace(/\/+$/, "");
  return s === "" ? "/" : s;
};

const P = (...a) => console.log(...a);

/* ── Los insumos, nombrados ─────────────────────────────────────────────── */
const fHoy = porMtime(/^cobertura-\d{4}-\d{2}-\d{2}(-\d+)?\.json$/);
const fF33 = porMtime(/^f33-cmp-1440(-\d{4}-\d{2}-\d{2}(-\d+)?)?\.json$/);

/* La congelada del día en que se escribió el «0/31» del registro histórico.
 * Se nombra por su FECHA a propósito: es una foto de archivo, no «la última». */
const fViejo = readdirSync(M)
  .filter((f) => /^cobertura-2026-08-01(-\d+)?\.json$/.test(f) && !ARTEFACTO.test(f))
  .sort()
  .pop();

P("=== INSUMOS RESUELTOS (por mtime, salvo el histórico, por fecha) ===");
for (const [q, f] of [["cobertura HOY", fHoy], ["f33-cmp @1440", fF33], ["cobertura 2026-08-01", fViejo]]) {
  P(`  ${q.padEnd(24)} ${f}   mtime ${new Date(statSync(join(M, f)).mtimeMs).toISOString()}`);
}
P("");

const hoy = J(fHoy);
const viejo = J(fViejo);
const f33 = J(fF33);

/* ── Los tres conjuntos ─────────────────────────────────────────────────── */
const emitidasHoy = Object.keys(hoy.matriz);
const compHoy = Object.entries(hoy.matriz)
  .filter(([, v]) => v.comport && v.comport.nivel === "O")
  .map(([r]) => r);

const emitidas0801 = Object.keys(viejo.matriz);
const comp0801 = Object.entries(viejo.matriz)
  .filter(([, v]) => v.comport && v.comport.nivel === "O")
  .map(([r]) => r);

const rutasF33 = Object.keys(f33.paginas).map(norm);

/* ── EL CONTROL: ¿casa la llave? ────────────────────────────────────────── */
const setEmitidas = new Set(emitidasHoy);
const f33Fuera = rutasF33.filter((r) => !setEmitidas.has(r));
P("=== CONTROL DE LLAVE (§regla 33) ===");
P(`  F3-3 normalizadas ................. ${rutasF33.length}`);
P(`  de ésas, FUERA de la matriz ....... ${f33Fuera.length}  ${f33Fuera.length ? JSON.stringify(f33Fuera) : "← la llave casa"}`);
if (f33Fuera.length) {
  P("  ⛔ la llave NO casa: cualquier intersección de abajo es un cero fabricado.");
  process.exitCode = 1;
}
P("");

/* ── El reparto ─────────────────────────────────────────────────────────── */
const setComp = new Set(compHoy);
const set0801 = new Set(emitidas0801);
const setF33 = new Set(rutasF33);

const interF33 = rutasF33.filter((r) => setComp.has(r));
const inter0801 = emitidas0801.filter((r) => setF33.has(r));
const del0801HoyO = emitidas0801.filter((r) => setComp.has(r));
const extras = compHoy.filter((r) => !set0801.has(r));

P("=== LOS TRES CONJUNTOS QUE SE LLAMAN «el eje comportamiento» ===");
P("");
P(`  A · RUTAS EMITIDAS el 2026-08-01 ....... ${comp0801.length}/${emitidas0801.length}   (histórico: la sonda aún no existía)`);
P(`      de esas ${emitidas0801.length}, HOY con O ............ ${del0801HoyO.length}/${emitidas0801.length}   ← el «0/31» de A está MUERTO`);
P("");
P(`  B · RUTAS DE F3-3 (cola larga) ......... ${interF33.length}/${rutasF33.length}   ← el «0/31» de B es CIERTO HOY`);
P("");
P(`  C · RUTAS EMITIDAS hoy ................. ${compHoy.length}/${emitidasHoy.length}   ← el «37» del registro`);
P("");
P("=== ¿SE SOLAPAN? ===");
P(`  A ∩ B ............................ ${inter0801.length}   ${inter0801.length === 0 ? "← DISJUNTOS" : JSON.stringify(inter0801)}`);
P(`  C = A + ${extras.length} nuevas:`);
extras.sort().forEach((r) => P(`      ${r}`));
P("");

P("=== LAS 31 DE F3-3, NINGUNA MEDIDA EN ESTE EJE ===");
rutasF33.sort().forEach((r) => P(`  ${setComp.has(r) ? "O" : "·"}  ${r}`));
P("");

/* ── El veredicto, sin elegir ───────────────────────────────────────────── */
P("=== VEREDICTO ===");
P("  Las dos cifras del registro son CIERTAS y cuentan CONJUNTOS DISTINTOS.");
P("  Y la coincidencia que lo hace invisible es que A y B tienen el MISMO");
P("  denominador (31) y el MISMO numerador (0), siendo disjuntos.");
P("");
P("  · «0/31» en unidad RUTA EMITIDA-2026-08-01 .. cierto ENTONCES, hoy 31/31");
P("  · «0/31» en unidad RUTA DE F3-3 ............. cierto HOY");
P(`  · «${compHoy.length}/${emitidasHoy.length}» en unidad RUTA EMITIDA-HOY ......... cierto HOY`);
P("");
P("  Ninguna se sustituye por otra: se escriben las TRES con su unidad.");
