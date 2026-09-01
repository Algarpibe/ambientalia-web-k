// 135.ª · BARRIDO DE §regla 42 SOBRE LAS MIGRACIONES YA ESCRITAS.
//
// §regla 42 está fichada como CLASE con DOS instancias (`autores` 2026-08-27 ·
// `arquetipos` 2026-08-31): el generador de Payload emite, para una colección
// nueva con relación a `payload_locked_documents_rels`,
//
//     DROP TABLE "<coleccion>" CASCADE;
//     ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "…_fk";
//
// y el `CASCADE` YA se llevó esa FK, así que la sentencia siguiente falla con
// «constraint … does not exist» y la transacción entera hace rollback: exit 1
// y CERO revertido.
//
// El ESCALÓN 1 de esta tanda tiene que crear la migración de `formulario-arq`
// y su reversa hereda la clase. El socket de la DB está CERRADO
// (ECONNREFUSED), así que `migrate:create` no se puede correr — pero el
// BARRIDO de lo ya escrito es FUENTE PURA y contesta hoy lo que la 136.ª
// necesitaría averiguar mañana:
//
//   · ¿cuántas migraciones tienen el patrón? (¿es clase o son dos anécdotas?)
//   · ¿cuántas llevan YA el `IF EXISTS` que la regla manda?
//   · ¿cuáles quedan expuestas?
//
// EL DENOMINADOR SE PUBLICA ENTERO (§regla 27 · §regla 14): los cubos a cero
// salen nombrados, y las migraciones que no tienen `DROP TABLE` se declaran
// FUERA DE ALCANCE en vez de contarse como limpias — decirlo de otra forma
// declara un cero que nadie midió (§sondas 4).
//
// CONTROL POR CASO CONOCIDO DE ANTEMANO (§regla 28c): las DOS instancias que
// la regla nombra —`autores` y `arquetipos`— TIENEN que salir detectadas. Si
// el barrido no las encuentra, su patrón no casa y ningún cero adjudica.
//
// OFFLINE: no abre navegador, no toca red, NO TOCA LA DB.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const DIR = join(RAIZ, "packages", "cms-config", "src", "migrations");
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");

const ficheros = readdirSync(DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .sort();

const RE_DROP_TABLE = /DROP\s+TABLE\s+(IF\s+EXISTS\s+)?"?([\w-]+)"?\s+CASCADE/gi;
const RE_DROP_CONSTRAINT = /ALTER\s+TABLE\s+"?([\w-]+)"?\s+DROP\s+CONSTRAINT\s+(IF\s+EXISTS\s+)?"?([\w-]*?)"?\s*;/gi;

const filas = [];
for (const f of ficheros) {
  const src = readFileSync(join(DIR, f), "utf8");
  // La reversa: todo lo que va de `export async function down` al final.
  const iDown = src.search(/export\s+async\s+function\s+down/);
  const down = iDown >= 0 ? src.slice(iDown) : "";

  const drops = [...down.matchAll(RE_DROP_TABLE)].map((m) => ({
    tabla: m[2],
    ifExists: !!m[1],
    at: m.index,
  }));
  const cons = [...down.matchAll(RE_DROP_CONSTRAINT)].map((m) => ({
    tabla: m[1],
    constraint: m[3],
    ifExists: !!m[2],
    at: m.index,
  }));

  // El patrón peligroso: un DROP CONSTRAINT que va DESPUÉS de un
  // DROP TABLE … CASCADE, y SIN `IF EXISTS`.
  const primerDrop = drops.length ? Math.min(...drops.map((d) => d.at)) : Infinity;
  const expuestos = cons.filter((c) => c.at > primerDrop && !c.ifExists);

  filas.push({
    fichero: f,
    tieneDown: iDown >= 0,
    nDropTable: drops.length,
    nDropTableSinIfExists: drops.filter((d) => !d.ifExists).length,
    nDropConstraint: cons.length,
    nDropConstraintSinIfExists: cons.filter((c) => !c.ifExists).length,
    expuestos: expuestos.length,
    tablasExpuestas: [...new Set(expuestos.map((c) => c.tabla))],
  });
}

// ── Reparto, con TODOS los cubos nombrados ─────────────────────────────────
const sinDown = filas.filter((f) => !f.tieneDown);
const fueraDeAlcance = filas.filter((f) => f.tieneDown && f.nDropTable === 0);
const enAlcance = filas.filter((f) => f.tieneDown && f.nDropTable > 0);
const expuestas = enAlcance.filter((f) => f.expuestos > 0);
const protegidas = enAlcance.filter((f) => f.expuestos === 0);

console.log("=== BARRIDO §regla 42 · migraciones ya escritas ===");
console.log(`  ficheros de migración (sin index.ts) ....... ${ficheros.length}`);
console.log(`  · sin función \`down\` ..................... ${sinDown.length}`);
console.log(`  · FUERA DE ALCANCE (down sin DROP TABLE) .. ${fueraDeAlcance.length}`);
console.log(`  · EN ALCANCE (down con DROP TABLE) ........ ${enAlcance.length}`);
console.log(`      · EXPUESTAS (constraint tras cascade) . ${expuestas.length}`);
console.log(`      · protegidas .......................... ${protegidas.length}`);
console.log("  (los cubos a cero salen nombrados: «fuera de alcance» NO es «limpia»)");

if (expuestas.length) {
  console.log("\n=== LAS EXPUESTAS, con su cardinal ===");
  for (const f of expuestas) {
    console.log(`  ${f.fichero}`);
    console.log(`      DROP TABLE…CASCADE: ${f.nDropTable} (sin IF EXISTS: ${f.nDropTableSinIfExists})`);
    console.log(`      DROP CONSTRAINT expuestos: ${f.expuestos} sobre ${f.tablasExpuestas.join(", ")}`);
  }
}

// ── CONTROL, antes del veredicto ───────────────────────────────────────────
//
// ⚠⚠ CORREGIDO EN LA MISMA CORRIDA, Y ES §regla 5ter LITERAL: la v1 exigía que
// los dos testigos de §regla 42 salieran EXPUESTOS. Cayeron los dos — y no
// porque el patrón no casara, sino porque **YA ESTÁN ARREGLADOS**: `autores`
// L9 y `arquetipos` L660 llevan `DROP CONSTRAINT IF EXISTS`. El control se
// definió sobre el estado CON defecto, el defecto se arregló, y el control
// siguió esperando el valor de AYER — o sea aplicando el tratamiento al revés.
// No calló: FALLÓ EN VOZ ALTA, que es como se lee un hallazgo del objeto en
// vez de una avería del instrumento.
//
// El control corregido se ata a lo que es cierto en LOS DOS ESTADOS (§regla 21,
// corolario de diseño), y va por PARTIDA DOBLE — un testigo por estado:
//
//   · SABE VER LO ARREGLADO: los dos testigos tienen que salir EN ALCANCE y
//     PROTEGIDOS. Si el regex de `DROP TABLE` fallara saldrían «fuera de
//     alcance», así que este testigo distingue «no casa» de «está arreglado»;
//   · SABE VER LO EXPUESTO: tiene que hallar ≥1 migración expuesta. Un barrido
//     que sólo supiera decir «todo protegido» no discriminaría nada.
const TESTIGOS_ARREGLADOS = ["autores", "arquetipos"];
const enAlcanceYProtegido = (t) =>
  protegidas.some((f) => f.fichero.includes(t));
const fueraDelPatron = (t) =>
  fueraDeAlcance.some((f) => f.fichero.includes(t)) || sinDown.some((f) => f.fichero.includes(t));

const okArreglados = TESTIGOS_ARREGLADOS.every(enAlcanceYProtegido);
const okSabeVerExpuesto = expuestas.length > 0;
const controlOk = okArreglados && okSabeVerExpuesto;

console.log("\n=== CONTROL (caso conocido de antemano, §regla 28c · §regla 21) ===");
console.log("  Por PARTIDA DOBLE: un testigo del estado ARREGLADO y uno del EXPUESTO.");
for (const t of TESTIGOS_ARREGLADOS) {
  const ok = enAlcanceYProtegido(t);
  const fuera = fueraDelPatron(t);
  console.log(
    `  testigo ARREGLADO \`${t}\` ... ${
      ok ? "EN ALCANCE y PROTEGIDO ✓" : fuera ? "FUERA DEL PATRÓN ✗ (el regex no casa)" : "EXPUESTO ✗ (¿regresión?)"
    }`,
  );
}
console.log(`  testigo EXPUESTO (≥1 hallada) ... ${okSabeVerExpuesto ? `SÍ ✓ (${expuestas.length})` : "NO ✗ — el barrido no sabe gritar"}`);
console.log(controlOk
  ? "  ✅ el barrido discrimina en las DOS direcciones — ADJUDICA"
  : "  ❌ el barrido NO discrimina — NO adjudica (§sondas 4: el cero es del instrumento)");

console.log("\n=== CONSECUENCIA PARA EL ESCALÓN 1 ===");
if (controlOk) {
  console.log(`  La clase tiene ${expuestas.length + TESTIGOS_ARREGLADOS.length} instancias, no 2:`);
  console.log(`    · ${TESTIGOS_ARREGLADOS.length} ARREGLADAS (las que §regla 42 nombra, ya con IF EXISTS)`);
  console.log(`    · ${expuestas.length} EXPUESTAS que nunca se arreglaron — HALLAZGO de esta tanda`);
  console.log(`  Denominador: ${enAlcance.length} migraciones en alcance de ${ficheros.length}.`);
  console.log("");
  console.log("  La migración de `formulario-arq` HEREDA la clase: al crearla hay que");
  console.log("  revisarla a mano y poner `IF EXISTS` en el desmontaje del `down`.");
  console.log("  ⚠ BLOQUEADO HOY: `migrate:create` introspecciona la DB y el socket da");
  console.log("     ECONNREFUSED. Este barrido deja hecho el QUÉ revisar, no el crearla.");
  console.log("");
  console.log("  ⚠ Las 2 expuestas se FICHAN, no se arreglan aquí: §regla 30 dice que");
  console.log("     «¿revierte limpia?» sólo tiene respuesta ANTES de que entre el dato, y");
  console.log("     las dos ya lo tienen encima. Con el socket cerrado el arreglo no se");
  console.log("     podría verificar — sería escribir una reversa sin poder probarla.");
} else {
  console.log("  SIN CONSECUENCIA: el control no adjudica.");
}

const salida = {
  meta: {
    tanda: "135.ª",
    regla: "42",
    fecha: new Date().toISOString().slice(0, 10),
    offline: true,
    tocaDb: false,
    porQueNoSeCreaLaMigracion: "socket 127.0.0.1:55432 -> ECONNREFUSED (binding declarado, no publicado)",
  },
  control: {
    testigosArreglados: TESTIGOS_ARREGLADOS,
    okArreglados,
    okSabeVerExpuesto,
    adjudica: controlOk,
    nota: "v1 exigia que los testigos salieran EXPUESTOS y cayo: ya estan arreglados (§regla 5ter)",
  },
  reparto: {
    ficheros: ficheros.length,
    sinDown: sinDown.length,
    fueraDeAlcance: fueraDeAlcance.length,
    enAlcance: enAlcance.length,
    expuestas: expuestas.length,
    protegidas: protegidas.length,
  },
  expuestas: expuestas.map((f) => ({
    fichero: f.fichero,
    nDropTable: f.nDropTable,
    expuestos: f.expuestos,
    tablasExpuestas: f.tablasExpuestas,
  })),
  todas: filas,
};

const dest = join(OUT, "regla42-barrido-135.json");
writeFileSync(dest, JSON.stringify(salida, null, 2) + "\n", "utf8");
console.log(`\n  congelada -> ${dest}`);

process.exitCode = controlOk ? 0 : 1;
