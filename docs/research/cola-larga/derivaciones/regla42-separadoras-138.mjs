/**
 * 138.ª · ESCALÓN 1 · ¿EL `IF EXISTS` QUE LE PUSE A LA REVERSA TIENE
 * INSTANCIAS SEPARADORAS, O ES NO-OP?
 *
 * ── POR QUÉ SE MIDE EN VEZ DE DARLO POR BUENO ────────────────────────────
 * El encargo manda ponerle `IF EXISTS` porque §regla 42 tiene cuatro
 * instancias y dos siguen expuestas. Puesto está — y **eso no dice que aquí
 * hiciera falta**. §*antes de fichar una indeterminación, comprueba que las
 * dos hipótesis sean DISTINTAS*: si el `down` sin `IF EXISTS` corre igual de
 * limpio, las dos versiones son **la misma función sobre este dominio** y hay
 * **0 instancias separadoras**. Publicarlo importa por dos motivos opuestos:
 *
 *   · si separa → §regla 42 mordió a una QUINTA instancia, y eso sube el
 *     cardinal de la clase (§regla 42, la corrección del 2026-09-01: *el
 *     cardinal de una clase se DERIVA barriendo, no se hereda del
 *     descubrimiento*);
 *   · si NO separa → el `IF EXISTS` es una **guarda preventiva**, no un
 *     arreglo, y escribirlo como arreglo dejaría a la tanda siguiente creyendo
 *     que aquí había un defecto.
 *
 * ── POR QUÉ NO SE EDITA EL FUENTE ────────────────────────────────────────
 * §regla 20, tercera mitad: *un sabotaje que edita el fuente sobrevive a la
 * muerte de su corrida* — un `finally` no corre ante una señal, y el fuente
 * saboteado **sigue compilando**, así que entra en el commit siguiente. Aquí
 * ni siquiera hace falta: el SQL del `down` se lee del fichero y se ejecuta
 * **por su canal**, dentro de `BEGIN … ROLLBACK`, así que la DB no cambia ni
 * en el caso bueno ni en el malo.
 *
 * ── LOS DOS LADOS, Y EL CONTROL ES EL LADO BUENO (§regla 8) ──────────────
 *   · CONTROL  · el `down` TAL COMO ESTÁ (con `IF EXISTS`) → tiene que correr
 *                limpio. Si fallara, el instrumento no ejercita nada;
 *   · SABOTAJE · el mismo `down` con los `IF EXISTS` retirados → si falla, hay
 *                separadora; si no, son la misma función.
 *
 * Y se corren en el estado en que las tablas **SÍ existen**, que es el estado
 * en el que la reversa se usa de verdad. El estado interesante para §regla 42
 * es el otro —cuando el `CASCADE` ya se llevó lo que la sentencia siguiente
 * busca—, así que va un TERCER caso: correr el `down` DOS VECES seguidas
 * dentro de la misma transacción. La segunda encuentra todo ya borrado, que es
 * exactamente la forma del defecto de §regla 42.
 */
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "regla42-separadoras-138.json");
const MIGRACION = "20260901_230502_f3_5_formulario_arq";

/** El SQL del `down`, leído del fichero y acotado por ESTRUCTURA —los
 *  backticks de la plantilla—, nunca por un comentario (§*un marcador de texto
 *  no delimita una región de código*). */
function sqlDelDown() {
  const f = path.join(RAIZ, "packages/cms-config/src/migrations", `${MIGRACION}.ts`);
  const src = fs.readFileSync(f, "utf8");
  const i = src.indexOf("export async function down");
  if (i < 0) throw new Error("no se halló la función down");
  const cuerpo = src.slice(i);
  const a = cuerpo.indexOf("sql`");
  const b = cuerpo.indexOf("`)", a);
  if (a < 0 || b < 0) throw new Error("no se halló la plantilla sql del down");
  return cuerpo.slice(a + 4, b);
}

const uri = process.env.DATABASE_URI;
if (!uri) {
  console.error("✗ DATABASE_URI no está definido");
  process.exit(2);
}
const pool = new Pool({ connectionString: uri, max: 3, connectionTimeoutMillis: 8000 });

/** Corre un SQL dentro de BEGIN…ROLLBACK: mide si falla sin cambiar nada. */
async function enSeco(sql, etiqueta) {
  const c = await pool.connect();
  let r;
  try {
    await c.query("BEGIN");
    await c.query(sql);
    r = { etiqueta, falla: false, error: null };
  } catch (e) {
    r = { etiqueta, falla: true, error: `${e.code ?? ""} ${e.message}`.trim() };
  } finally {
    await c.query("ROLLBACK").catch(() => {});
    c.release();
  }
  console.log(`  ${etiqueta.padEnd(28)} ⇒ ${r.falla ? "FALLA · " + r.error : "corre limpio"}`);
  return r;
}

const out = { meta: { fecha: new Date().toISOString(), sonda: "regla42-separadoras-138", migracion: MIGRACION } };

try {
  const conIf = sqlDelDown();
  const sinIf = conIf.replace(/DROP TABLE IF EXISTS /g, "DROP TABLE ").replace(/DROP TYPE IF EXISTS /g, "DROP TYPE ");

  out.sentencias = {
    dropTableConIf: (conIf.match(/DROP TABLE IF EXISTS/g) || []).length,
    dropTypeConIf: (conIf.match(/DROP TYPE IF EXISTS/g) || []).length,
    dropTableSinIf: (sinIf.match(/DROP TABLE "/g) || []).length,
    dropTypeSinIf: (sinIf.match(/DROP TYPE "/g) || []).length,
  };
  console.log(
    `Sentencias · con IF ${out.sentencias.dropTableConIf}+${out.sentencias.dropTypeConIf} · ` +
      `sin IF ${out.sentencias.dropTableSinIf}+${out.sentencias.dropTypeSinIf}`
  );

  /* PRECONDICIÓN: las tablas tienen que EXISTIR, o los tres casos miden el
   * mismo vacío y la corrida no adjudica (§regla 28c). */
  const hay = (
    await pool.query(
      `select count(*)::int as n from information_schema.tables
        where table_schema='public' and table_name like 'arquetipos_blocks_formulario_arq%'`
    )
  ).rows[0].n;
  out.precondicion = { tablasFormulario: hay, adjudica: hay === 4 };
  console.log(`Precondición · ${hay} tablas de formulario presentes ⇒ ${hay === 4 ? "ADJUDICA" : "NO ADJUDICA"}`);
  if (hay !== 4) throw new Error(`se esperaban 4 tablas presentes, hay ${hay}`);

  console.log("\nLos tres casos, todos en BEGIN…ROLLBACK (la DB no cambia):");
  out.casos = {};
  out.casos.control = await enSeco(conIf, "CONTROL · con IF EXISTS");
  out.casos.sabotaje = await enSeco(sinIf, "SABOTAJE · sin IF EXISTS");
  /* El estado de §regla 42: la segunda pasada encuentra todo ya borrado. */
  out.casos.dobleConIf = await enSeco(conIf + "\n" + conIf, "DOBLE · con IF EXISTS");
  out.casos.dobleSinIf = await enSeco(sinIf + "\n" + sinIf, "DOBLE · sin IF EXISTS");

  /* ⚠⚠ LOS DOS ESCENARIOS NO SON EL MISMO, Y CONFUNDIRLOS INFLA EL CARDINAL
   * DE UNA CLASE. §regla 42 describe un patrón concreto —`DROP TABLE … CASCADE`
   * y DESPUÉS el `DROP CONSTRAINT` que ese CASCADE ya se llevó— que hace
   * fallar la reversa **la PRIMERA vez**. Que el `IF EXISTS` separe en la
   * SEGUNDA pasada es otra propiedad: **idempotencia**. Escribir «§regla 42
   * muerde aquí» porque hay una separadora en la doble pasada sería heredar el
   * cardinal del descubrimiento en vez de derivarlo (§regla 42, corrección del
   * 2026-09-01). Así que se publican POR SEPARADO. */
  const sepPrimera = out.casos.control.falla !== out.casos.sabotaje.falla;
  const sepSegunda = out.casos.dobleConIf.falla !== out.casos.dobleSinIf.falla;

  /* ¿Emite este `down` el PATRÓN de §regla 42? Se comprueba sobre el SQL, no
   * sobre el resultado: es una propiedad de la forma, no del efecto. */
  const emitePatron42 = /DROP TABLE[^;]*CASCADE;[\s\S]*ALTER TABLE[^;]*DROP CONSTRAINT/i.test(conIf);

  out.veredicto = {
    /* La unidad de §regla 42 es la PRIMERA pasada: es cuando `migrate:down` se
     * usa de verdad. */
    separadorasPrimeraPasada: sepPrimera ? 1 : 0,
    separadorasSegundaPasada: sepSegunda ? 1 : 0,
    denominador: 1,
    emitePatronRegla42: emitePatron42,
    esInstanciaDeRegla42: emitePatron42 && sepPrimera,
    controlCorreLimpio: !out.casos.control.falla,
    lecturaRegla42: emitePatron42
      ? "emite el patrón: es instancia de la clase"
      : "NO emite el patrón `DROP TABLE … CASCADE` + `DROP CONSTRAINT`: esta migración NO es instancia de §regla 42, y el cardinal de la clase SIGUE EN 4",
    lecturaIfExists: sepSegunda
      ? "el IF EXISTS SÍ compra algo, y es IDEMPOTENCIA: sin él una segunda pasada falla con 42P01. No es un arreglo de §regla 42 — es una guarda distinta, y la separadora está en la segunda pasada, no en la primera"
      : "el IF EXISTS es NO-OP también en la doble pasada: 0 separadoras en todo el dominio medido",
  };
  console.log(`\nSEPARADORAS · primera pasada ${out.veredicto.separadorasPrimeraPasada}/1 · segunda pasada ${out.veredicto.separadorasSegundaPasada}/1`);
  console.log(`  ¿emite el patrón de §regla 42? ${emitePatron42}`);
  console.log(`  §regla 42  ⇒ ${out.veredicto.lecturaRegla42}`);
  console.log(`  IF EXISTS  ⇒ ${out.veredicto.lecturaIfExists}`);

  if (out.casos.control.falla) {
    console.error("✗ El CONTROL falla: el instrumento no ejercita nada (§regla 8).");
  }
} catch (e) {
  out.error = { mensaje: e.message };
  console.error(`✗ ${e.message}`);
} finally {
  await pool.end().catch(() => {});
}

fs.writeFileSync(SALIDA, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`  congelada → ${path.relative(RAIZ, SALIDA)}`);
process.exit(out.veredicto && out.veredicto.controlCorreLimpio ? 0 : 2);
