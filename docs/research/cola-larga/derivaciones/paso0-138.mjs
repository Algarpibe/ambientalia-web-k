/**
 * 138.ª · PASO 0 — EL ESTADO REAL, DERIVADO, NO EL QUE EL ENCARGO SUPONE.
 *
 * ── POR QUÉ ESTE DERIVADOR EXISTE ───────────────────────────────────────
 * El encargo llega rotulado «135.ª (RETOMADA)» y el árbol ya tiene la 135.ª
 * CIERRE, la 136.ª y la 137.ª commiteadas. O sea que **sus premisas son
 * recordadas, no derivadas** (§regla 9), y tres de ellas deciden el orden
 * entero de la tanda:
 *
 *   P1 · «el socket está ABIERTO» ......... §*lo DECLARADO y lo PUBLICADO son
 *         dos canales*: `docker ps`, `pg_isready`, `PortBindings` y
 *         `NetworkSettings.Ports` son CUATRO canales y ninguno es el que usa
 *         el cliente. El quinto —abrir el socket— es el único que contesta.
 *   P2 · «`arquetipos` tiene 0 filas» ..... es la que abre la ventana de
 *         §regla 30 (probar la reversa). Se cierra con la PRIMERA fila.
 *   P3 · «151 tablas» .................... se DERIVA, no se cita.
 *
 * ── QUÉ CONTESTA ────────────────────────────────────────────────────────
 *   0 · SOCKET ....... ¿abre? con CONSULTA REAL, no con un `Up`;
 *   1 · TABLAS ....... cardinal derivado + censo tabla a tabla congelado,
 *                      que es lo que la §regla 30 exige para el `diff` de la
 *                      reversa —nunca el total: `151 → 151` es exacto con
 *                      dos tablas compensándose;
 *   2 · VENTANA ...... filas de `arquetipos`, que es lo único que decide si
 *                      el ESCALÓN 1 se puede hacer HOY;
 *   3 · MIGRACIONES .. las aplicadas en la tabla `payload_migrations`
 *                      contra las que hay en disco —§*el LOG de la
 *                      herramienta no es lo que la herramienta hizo*;
 *   4 · POBLACIÓN .... las 3 tablas que el encargo cita, re-derivadas.
 *
 * ── QUÉ **NO** CONTESTA (§*antes de construir sobre una medida, escribe qué
 *    preguntas NO contesta*) ───────────────────────────────────────────────
 *   · no dice si la migración de `formulario-arq` está BIEN escrita: sólo si
 *     existe en disco y si está aplicada;
 *   · no toca ni una fila: es de LECTURA. No resetea nada, así que §regla 20
 *     no aplica y el entorno queda como estaba;
 *   · no mide geometría, ni render, ni un solo píxel.
 *
 * ── EL CONTROL, Y ES POR CASO CONOCIDO DE ANTEMANO (§regla 28c) ──────────
 * Un cero de este derivador —«0 tablas», «0 migraciones»— tiene dos causas
 * que se escriben igual: *no hay* y *no sé mirar*. Así que van TESTIGOS:
 * tres tablas que el encargo afirma pobladas (`paginas`, `productos`,
 * `entradas_blog`). Si salen a 0, la corrida NO ADJUDICA — es el
 * instrumento, no el objeto.
 */
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "paso0-138.json");

/* Testigos: tablas que el encargo afirma pobladas. Su cero refuta al
 * instrumento antes que al objeto. */
const TESTIGOS = ["paginas", "productos", "entradas_blog"];

const uri = process.env.DATABASE_URI;
if (!uri) {
  console.error("✗ DATABASE_URI no está definido — córrelo con --env-file=apps/cms/.env");
  process.exit(2);
}

const pool = new Pool({ connectionString: uri, max: 3, connectionTimeoutMillis: 8000 });

const out = {
  meta: { fecha: new Date().toISOString(), sonda: "paso0-138" },
  socket: null,
  tablas: null,
  ventana: null,
  migraciones: null,
  testigos: null,
  veredicto: null,
};

try {
  /* ── 0 · SOCKET, con CONSULTA REAL ─────────────────────────────────── */
  const t0 = Date.now();
  const ping = await pool.query("select current_database() as db, current_user as usr, version() as v");
  out.socket = {
    abre: true,
    ms: Date.now() - t0,
    db: ping.rows[0].db,
    usuario: ping.rows[0].usr,
    servidor: ping.rows[0].v.split(",")[0],
  };
  console.log(`✓ SOCKET ABIERTO en ${out.socket.ms} ms · ${out.socket.db} como ${out.socket.usuario}`);
  console.log(`  ${out.socket.servidor}`);

  /* ── 1 · TABLAS, censo tabla a tabla (§regla 30: nunca el total) ───── */
  const tt = await pool.query(
    `select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name`
  );
  const nombres = tt.rows.map((r) => r.table_name);
  out.tablas = { n: nombres.length, nombres };
  console.log(`✓ TABLAS: ${nombres.length} (censo tabla a tabla congelado)`);

  /* ── 2 · LA VENTANA — filas de `arquetipos` ────────────────────────── */
  if (nombres.includes("arquetipos")) {
    const a = await pool.query("select count(*)::int as n from arquetipos");
    out.ventana = { tabla: "arquetipos", existe: true, filas: a.rows[0].n, abierta: a.rows[0].n === 0 };
  } else {
    out.ventana = { tabla: "arquetipos", existe: false, filas: null, abierta: null };
  }
  console.log(
    `✓ VENTANA §regla 30: arquetipos existe=${out.ventana.existe} filas=${out.ventana.filas} ` +
      `⇒ ${out.ventana.abierta ? "ABIERTA" : "CERRADA"}`
  );

  /* ── 3 · MIGRACIONES: aplicadas contra disco ───────────────────────── */
  const aplicadas = nombres.includes("payload_migrations")
    ? (await pool.query("select name, batch from payload_migrations order by id")).rows
    : [];
  const dir = path.join(RAIZ, "packages/cms-config/src/migrations");
  const enDisco = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
  const nombresAplicados = aplicadas.map((r) => r.name).sort();
  out.migraciones = {
    aplicadas: aplicadas.map((r) => ({ name: r.name, batch: r.batch })),
    nAplicadas: aplicadas.length,
    enDisco,
    nEnDisco: enDisco.length,
    /* Diferencia SIMÉTRICA con los dos lados nombrados — nunca el recuento
     * (§*un cardinal es un contenedor y absorbe la membresía*). */
    enDiscoSinAplicar: enDisco.filter((m) => !nombresAplicados.includes(m)),
    aplicadasSinDisco: nombresAplicados.filter((m) => !enDisco.includes(m)),
    ultimaAplicada: aplicadas.length ? aplicadas[aplicadas.length - 1].name : null,
    ultimoBatch: aplicadas.length ? aplicadas[aplicadas.length - 1].batch : null,
  };
  console.log(
    `✓ MIGRACIONES: ${out.migraciones.nAplicadas} aplicadas · ${out.migraciones.nEnDisco} en disco · ` +
      `simétrica ${out.migraciones.enDiscoSinAplicar.length} y ${out.migraciones.aplicadasSinDisco.length}`
  );
  console.log(`  última aplicada: ${out.migraciones.ultimaAplicada} (batch ${out.migraciones.ultimoBatch})`);

  /* ── 4 · TESTIGOS (§regla 28c) ─────────────────────────────────────── */
  const testigos = {};
  for (const t of TESTIGOS) {
    if (!nombres.includes(t)) {
      testigos[t] = { existe: false, filas: null };
      continue;
    }
    const r = await pool.query(`select count(*)::int as n from "${t}"`);
    testigos[t] = { existe: true, filas: r.rows[0].n };
  }
  out.testigos = testigos;
  const vivos = Object.values(testigos).filter((t) => t.existe && t.filas > 0).length;
  out.veredicto = {
    testigosVivos: vivos,
    de: TESTIGOS.length,
    adjudica: vivos === TESTIGOS.length,
  };
  console.log(
    `✓ TESTIGOS: ${Object.entries(testigos)
      .map(([k, v]) => `${k}=${v.filas}`)
      .join(" · ")} ⇒ ${vivos}/${TESTIGOS.length} vivos`
  );

  if (!out.veredicto.adjudica) {
    console.error("✗ La corrida NO ADJUDICA: algún testigo salió a 0 (§regla 28c). El cero es del instrumento.");
  }
} catch (e) {
  out.socket = { abre: false, error: e.code ?? null, mensaje: e.message };
  console.error(`✗ SOCKET CERRADO: ${e.code ?? ""} ${e.message}`);
} finally {
  await pool.end().catch(() => {});
}

/* Congela SIEMPRE — también el fallo, que es evidencia (§regla 2). */
fs.writeFileSync(SALIDA, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\n  congelada → ${path.relative(RAIZ, SALIDA)}`);

process.exit(out.socket?.abre && out.veredicto?.adjudica ? 0 : 2);
