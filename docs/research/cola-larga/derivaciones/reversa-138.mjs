/**
 * 138.ª · ESCALÓN 1 — LA REVERSA DE `f3_5_formulario_arq`, PROBADA MIENTRAS LA
 * VENTANA ESTÁ ABIERTA.
 *
 * ── QUÉ VENTANA, CON PRECISIÓN ───────────────────────────────────────────
 * §regla 30 está enunciada sobre una migración que **relaja una restricción**:
 * su `down` la reimpone y sólo puede correr mientras no exista una fila que
 * use la relajación. Ésta **no relaja nada** —el `up` sólo CREA cuatro tablas
 * y catorce tipos—, así que lo que la ventana compra es lo otro que aquella
 * regla protege: **poder correr el `down` sin que cueste dato**. Con
 * `arquetipos` a 0 filas el `down` no destruye nada; con la primera fila
 * dentro, probarlo pasa a tener precio. Es la misma ventana y conviene
 * escribir por qué, no citar la regla y ya.
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 *   1 · ¿el `up` aplica y crea lo que dice?
 *   2 · ¿el `down` REVIERTE —o sale con exit 1 y cero revertido, que es el
 *       modo de fallo de §regla 42?
 *   3 · ¿el estado TRAS-DOWN es IDÉNTICO al de ANTES, comparado **elemento a
 *       elemento en cuatro ejes**? Nunca por el total: `151 → 151` es exacto
 *       con dos tablas compensándose (§*un cardinal es un contenedor y absorbe
 *       la membresía*).
 *   4 · ¿lo dice la TABLA `payload_migrations`, no el log? §*el LOG de la
 *       herramienta no es lo que la herramienta hizo*: `migrate:down` imprime
 *       «Rolling back batch N consisting of M migration(s)» y revierte una.
 *
 * ── LOS CUATRO EJES, Y POR QUÉ NO BASTA EL DE TABLAS ─────────────────────
 * Un `DROP TABLE … CASCADE` **no se lleva los tipos enum** —es la razón por la
 * que `scripts/seed/reset.mjs` dropea el esquema por `psql` en vez de fiarse de
 * `migrate:fresh`—. Así que un `down` que deje 14 enums huérfanos daría
 * «tablas idénticas» y un esquema sucio. Se censan **tablas · columnas ·
 * tipos enum · constraints**, y cada eje publica su diferencia simétrica con
 * los DOS lados nombrados.
 *
 * ── QUÉ **NO** CONTESTA ──────────────────────────────────────────────────
 *   · no dice si el MODELO de `formulario-arq` es correcto: dice si su
 *     migración va y viene;
 *   · no siembra ni una fila, así que no cierra la ventana que usa;
 *   · no mide render ni geometría.
 *
 * ── EL CONTROL, POR CASO CONOCIDO DE ANTEMANO (§regla 28c) ───────────────
 * Un «idéntico» de este derivador tiene dos causas que se escriben igual: *la
 * reversa funcionó* y *el instrumento no vio nada de lo que el `up` creó*. Así
 * que el paso TRAS-UP lleva su testigo POSITIVO: las 4 tablas y los 14 tipos
 * que el `up` declara **tienen que APARECER**. Si TRAS-UP sale igual que
 * ANTES, la corrida NO ADJUDICA — es el instrumento, no la reversa.
 */
import { Pool } from "pg";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const CMS = path.join(RAIZ, "apps/cms");
const SALIDA = path.join(AQUI, "reversa-138.json");

const MIGRACION = "20260901_230502_f3_5_formulario_arq";

/** Lo que el `up` declara crear, leído del propio fichero de migración — no
 *  escrito a mano (§regla 9: un conjunto enumerado a mano es un dato
 *  recordado, y envejece contra el repo en silencio). */
function loQueElUpDeclara() {
  const f = path.join(RAIZ, "packages/cms-config/src/migrations", `${MIGRACION}.ts`);
  const src = fs.readFileSync(f, "utf8");
  const up = src.slice(src.indexOf("export async function up"), src.indexOf("export async function down"));
  const tablas = [...up.matchAll(/CREATE TABLE "([^"]+)"/g)].map((m) => m[1]).sort();
  const tipos = [...up.matchAll(/CREATE TYPE "public"\."([^"]+)"/g)].map((m) => m[1]).sort();
  return { tablas, tipos };
}

const uri = process.env.DATABASE_URI;
if (!uri) {
  console.error("✗ DATABASE_URI no está definido — córrelo con --env-file=apps/cms/.env");
  process.exit(2);
}
const pool = new Pool({ connectionString: uri, max: 3, connectionTimeoutMillis: 8000 });

/** El censo de los cuatro ejes. Cada elemento es una CADENA identificable,
 *  para que la diferencia simétrica nombre en vez de contar. */
async function censo() {
  const q = async (sql) => (await pool.query(sql)).rows;
  const tablas = (
    await q(`select table_name from information_schema.tables
             where table_schema='public' and table_type='BASE TABLE' order by 1`)
  ).map((r) => r.table_name);
  const columnas = (
    await q(`select table_name||'.'||column_name||':'||data_type as c
             from information_schema.columns where table_schema='public' order by 1`)
  ).map((r) => r.c);
  const tipos = (
    await q(`select t.typname from pg_type t
             join pg_namespace n on n.oid=t.typnamespace
             where n.nspname='public' and t.typtype='e' order by 1`)
  ).map((r) => r.typname);
  const constraints = (
    await q(`select tc.table_name||'.'||tc.constraint_name||':'||tc.constraint_type as c
             from information_schema.table_constraints tc
             where tc.table_schema='public' order by 1`)
  ).map((r) => r.c);
  const migraciones = (await q(`select name, batch from payload_migrations order by id`)).map(
    (r) => `${r.name}#${r.batch}`
  );
  const filasArq = (await q(`select count(*)::int as n from arquetipos`))[0].n;
  return { tablas, columnas, tipos, constraints, migraciones, filasArq };
}

/** Diferencia simétrica con LOS DOS LADOS NOMBRADOS (§regla 20, tercera mitad). */
const simetrica = (a, b) => ({
  soloEnA: a.filter((x) => !b.includes(x)),
  soloEnB: b.filter((x) => !a.includes(x)),
});

const payload = (args) =>
  spawnSync("npx", ["payload", ...args], { cwd: CMS, encoding: "utf8", shell: true, env: process.env });

const out = { meta: { fecha: new Date().toISOString(), sonda: "reversa-138", migracion: MIGRACION } };

try {
  const declara = loQueElUpDeclara();
  out.declara = declara;
  console.log(`El \`up\` declara: ${declara.tablas.length} tablas · ${declara.tipos.length} tipos`);

  /* ── ANTES ─────────────────────────────────────────────────────────── */
  const antes = await censo();
  out.antes = { ...antes, n: { tablas: antes.tablas.length, tipos: antes.tipos.length } };
  console.log(
    `ANTES     · ${antes.tablas.length} tablas · ${antes.columnas.length} columnas · ` +
      `${antes.tipos.length} tipos · ${antes.constraints.length} constraints · ` +
      `${antes.migraciones.length} migraciones · arquetipos ${antes.filasArq} filas`
  );

  if (antes.filasArq !== 0) {
    console.error(`✗ La ventana está CERRADA: arquetipos tiene ${antes.filasArq} filas. No se prueba la reversa.`);
    out.veredicto = { ventana: "CERRADA", filas: antes.filasArq };
    throw new Error("ventana cerrada");
  }

  /* ── UP ────────────────────────────────────────────────────────────── */
  const rUp = payload(["migrate"]);
  out.up = { exit: rUp.status, salida: (rUp.stdout ?? "").split("\n").filter((l) => l.includes("INFO")).slice(-6) };
  console.log(`UP        · exit ${rUp.status}`);
  if (rUp.status !== 0) {
    console.error(rUp.stderr || rUp.stdout);
    throw new Error("el up falló");
  }

  const trasUp = await censo();
  out.trasUp = { ...trasUp, n: { tablas: trasUp.tablas.length, tipos: trasUp.tipos.length } };

  /* CONTROL POSITIVO — el `up` tiene que haber creado lo que declara. */
  const faltanTablas = declara.tablas.filter((t) => !trasUp.tablas.includes(t));
  const faltanTipos = declara.tipos.filter((t) => !trasUp.tipos.includes(t));
  const creoTablas = declara.tablas.filter((t) => !antes.tablas.includes(t) && trasUp.tablas.includes(t));
  const creoTipos = declara.tipos.filter((t) => !antes.tipos.includes(t) && trasUp.tipos.includes(t));
  out.control = {
    declaraTablas: declara.tablas.length,
    creadasTablas: creoTablas.length,
    faltanTablas,
    declaraTipos: declara.tipos.length,
    creadasTipos: creoTipos.length,
    faltanTipos,
    adjudica: faltanTablas.length === 0 && faltanTipos.length === 0 && creoTablas.length === declara.tablas.length,
  };
  console.log(
    `TRAS-UP   · ${trasUp.tablas.length} tablas (+${trasUp.tablas.length - antes.tablas.length}) · ` +
      `${trasUp.tipos.length} tipos (+${trasUp.tipos.length - antes.tipos.length})`
  );
  console.log(
    `  CONTROL · creadas ${creoTablas.length}/${declara.tablas.length} tablas · ` +
      `${creoTipos.length}/${declara.tipos.length} tipos ⇒ ${out.control.adjudica ? "ADJUDICA" : "NO ADJUDICA"}`
  );

  /* ── DOWN ──────────────────────────────────────────────────────────── */
  const rDown = payload(["migrate:down"]);
  const logDown = (rDown.stdout ?? "") + (rDown.stderr ?? "");
  out.down = {
    exit: rDown.status,
    /* §*el LOG de la herramienta no es lo que la herramienta hizo* — se
     * conserva su frase para poder contrastarla con la tabla. */
    diceElLog: (logDown.match(/Rolling back[^\n]*/) ?? [null])[0],
  };
  console.log(`DOWN      · exit ${rDown.status}`);
  console.log(`  el LOG dice: ${out.down.diceElLog ?? "(nada)"}`);
  if (rDown.status !== 0) {
    console.error(logDown.split("\n").slice(-15).join("\n"));
    out.veredicto = { reversa: "FALLA", exit: rDown.status };
    throw new Error("el down falló");
  }

  const trasDown = await censo();
  out.trasDown = { ...trasDown, n: { tablas: trasDown.tablas.length, tipos: trasDown.tipos.length } };

  /* ── EL DIFF, EJE A EJE ────────────────────────────────────────────── */
  const ejes = ["tablas", "columnas", "tipos", "constraints"];
  out.diff = {};
  let limpio = true;
  for (const e of ejes) {
    const d = simetrica(antes[e], trasDown[e]);
    out.diff[e] = d;
    const ok = d.soloEnA.length === 0 && d.soloEnB.length === 0;
    if (!ok) limpio = false;
    console.log(
      `  diff ${e.padEnd(11)} · desaparecen ${d.soloEnA.length} · aparecen ${d.soloEnB.length}` +
        (ok ? "  ✓" : `  ✗  ${[...d.soloEnA, ...d.soloEnB].slice(0, 6).join(" | ")}`)
    );
  }

  /* La ÚNICA fila de diferencia legítima entre `up` y `down` es el registro de
   * la propia migración — y aquí ni siquiera esa, porque el `down` la retira. */
  const dMig = simetrica(antes.migraciones, trasDown.migraciones);
  out.diff.migraciones = dMig;
  console.log(
    `  diff migraciones · desaparecen ${dMig.soloEnA.length} · aparecen ${dMig.soloEnB.length}` +
      (dMig.soloEnA.length === 0 && dMig.soloEnB.length === 0 ? "  ✓" : `  ✗ ${[...dMig.soloEnA, ...dMig.soloEnB]}`)
  );

  /* §*el LOG no es lo que la herramienta hizo*: lo dirime la TABLA. */
  const sigueAplicada = trasDown.migraciones.some((m) => m.startsWith(MIGRACION + "#"));
  out.tabla = {
    migracionSigueAplicada: sigueAplicada,
    nAntes: antes.migraciones.length,
    nTrasUp: trasUp.migraciones.length,
    nTrasDown: trasDown.migraciones.length,
    revertidasSegunLaTabla: trasUp.migraciones.length - trasDown.migraciones.length,
  };
  console.log(
    `  la TABLA dice: revirtió ${out.tabla.revertidasSegunLaTabla} migración(es) · ` +
      `${MIGRACION} aplicada = ${sigueAplicada}`
  );

  /* ── RE-APLICAR: el entorno queda CON la migración puesta ───────────── */
  const rUp2 = payload(["migrate"]);
  out.reaplica = { exit: rUp2.status };
  console.log(`RE-UP     · exit ${rUp2.status}`);
  const final = await censo();
  out.final = { ...final, n: { tablas: final.tablas.length, tipos: final.tipos.length } };
  const dFinal = simetrica(trasUp.tablas, final.tablas);
  out.diff.finalVsTrasUp = dFinal;
  console.log(
    `  final vs TRAS-UP · desaparecen ${dFinal.soloEnA.length} · aparecen ${dFinal.soloEnB.length}` +
      (dFinal.soloEnA.length === 0 && dFinal.soloEnB.length === 0 ? "  ✓" : "  ✗")
  );

  out.veredicto = {
    ventana: "ABIERTA",
    control: out.control.adjudica,
    reversaLimpia: limpio && dMig.soloEnA.length === 0 && dMig.soloEnB.length === 0,
    revertidasSegunLaTabla: out.tabla.revertidasSegunLaTabla,
    entornoFinal: rUp2.status === 0 && dFinal.soloEnA.length === 0 && dFinal.soloEnB.length === 0,
  };
  console.log(
    `\n${out.veredicto.control && out.veredicto.reversaLimpia && out.veredicto.entornoFinal ? "✅" : "❌"} ` +
      `control=${out.veredicto.control} · reversaLimpia=${out.veredicto.reversaLimpia} · ` +
      `entornoFinal=${out.veredicto.entornoFinal}`
  );
} catch (e) {
  out.error = { mensaje: e.message, code: e.code ?? null };
  console.error(`✗ ${e.message}`);
} finally {
  await pool.end().catch(() => {});
}

fs.writeFileSync(SALIDA, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`  congelada → ${path.relative(RAIZ, SALIDA)}`);

const v = out.veredicto;
process.exit(v && v.control && v.reversaLimpia && v.entornoFinal ? 0 : 2);
