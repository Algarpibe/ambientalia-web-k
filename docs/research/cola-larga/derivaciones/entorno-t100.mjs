/**
 * ENTORNO DE LA 100.ª — **la comprobación se hace en la unidad de la MEMBRESÍA,
 * no con el recuento** (`CLAUDE.md` §regla 20, tercera mitad).
 *
 * La 99.ª pagó por qué: tras un reseteo, el build emitió **376 contra 382** y el
 * neto —«faltan 6»— escondía **17 desaparecidas y 11 nuevas**, o sea **28 rutas
 * tocadas**. Un cardinal es un contenedor y absorbe la membresía: `382 → 382`
 * sería exacto con dos rutas compensándose.
 *
 * Así que aquí se publica la **DIFERENCIA SIMÉTRICA con sus DOS LADOS
 * NOMBRADOS**, y el recuento va al lado como resumen — nunca como prueba.
 *
 * ── Qué contesta y qué NO contesta ────────────────────────────────────────
 * **Contesta:** si el conjunto de rutas emitidas tras la migración de CMS-5 y
 * el re-sembrado es EL MISMO que el de la línea base de la 99.ª.
 *
 * **NO contesta:** nada sobre la geometría, el marcado ni el contenido de esas
 * rutas — sólo su membresía. Y no dice nada de las 31 de `paginas`, que esta
 * tanda **no emite a propósito** (E1 no se implementa aquí).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MED = join(RAIZ, "scripts/qa/medidas");

/* La línea base se nombra CON SU FICHERO (§regla 5: el nombre canónico de una
 * congelada conserva la PRIMERA foto, así que citar «la línea base» a secas
 * manda a leer la más vieja del montón). */
const BASE = "clon-base-1440-t99-antes.json";
const AHORA = "manifiesto-2026-08-24.json";

const base = Object.keys(JSON.parse(readFileSync(join(MED, BASE), "utf8")).paginas);
const ahora = JSON.parse(readFileSync(join(MED, AHORA), "utf8")).rutas;

const sBase = new Set(base);
const sAhora = new Set(ahora);
const desaparecidas = base.filter((r) => !sAhora.has(r)).sort();
const nuevas = ahora.filter((r) => !sBase.has(r)).sort();

console.log(`\n════════ ENTORNO T100 · DIFERENCIA SIMÉTRICA DE RUTAS ════════\n`);
console.log(`  línea base    ${BASE}`);
console.log(`                ${base.length} rutas`);
console.log(`  tras CMS-5    ${AHORA}`);
console.log(`                ${ahora.length} rutas\n`);
console.log(`  ── LOS DOS LADOS, NOMBRADOS ──`);
console.log(`  en la BASE que hoy NO se emiten    ${desaparecidas.length}`);
for (const r of desaparecidas) console.log(`     − ${r}`);
console.log(`  emitidas hoy que la BASE no tenía  ${nuevas.length}`);
for (const r of nuevas) console.log(`     + ${r}`);

const limpio = desaparecidas.length === 0 && nuevas.length === 0;
console.log(`\n  ⇒ ${limpio ? "✅ diferencia simétrica 0 y 0 — el entorno es el de la línea base" : "❌ el entorno NO es el de la línea base"}\n`);

/* El recuento va DESPUÉS de los dos lados y como resumen, que es el único sitio
 * donde no puede hacer de prueba. */
console.log(`  (resumen, no prueba: ${base.length} → ${ahora.length})\n`);

process.exit(limpio ? 0 : 1);
