/**
 * LA GUARDA DEL PUBLICADOR — F2-4. Cuatro invariantes, y ninguno es «tarda poco».
 *
 * Uso:  npm run qa:publicar
 * Negativo:  npm run qa:publicar-neg   (3 sabotajes + control = 4 casos)
 *   ⚠ decía «4 sabotajes» y son 3. El recuento no mintió en la salida porque el
 *   contrato lo DERIVA de `casos.length` (§sondas 9: un número recordado y uno
 *   derivado se escriben igual y no valen lo mismo) — pero la cabecera sí.
 *
 * ── Qué prueba, y por qué CADA uno hace falta ─────────────────────────────
 *
 * | # | invariante | qué modo de fallo cierra |
 * |---|---|---|
 * | **A** | sin credencial, **401 y CERO builds** | un endpoint que dispara procesos, abierto |
 * | **B** | **nunca dos builds a la vez** | dos `next build` sobre el mismo árbol se pisan el `.next-nuevo` |
 * | **C** | **para todo disparo hay un build que EMPEZÓ después** | la política «descartar»: una publicación que no se sirve **nunca**, en silencio |
 * | **D** | un build que falla **NO toca `.next`** | medido: `next build` con la DB caída deja `.next` **sin BUILD_ID, sin standalone y sin manifiesto** |
 *
 * ── ⚠ C es el que no se puede medir contando ─────────────────────────────
 * La tentación es afirmar la política mirando `estado.builds` —«3 disparos, 2
 * builds: coalesció»—. **Ese número no distingue coalescer de descartar**: las
 * dos hacen 2 builds con 3 disparos. Lo que las separa es *cuál* fue el último
 * disparo que un build llegó a ver, y eso es una comparación de **instantes**:
 *
 *   > para cada disparo `d`, ¿existe un build `b` con `b.empezo > d`?
 *
 * Descartar falla ahí y sólo ahí, y por eso el falsador `politica-descartar`
 * es el que justifica que el invariante se escriba así. Es la §causa común de
 * `CLAUDE.md` una vez más: el recuento es el contenedor con holgura, y el
 * defecto cabe dentro sin moverlo.
 *
 * ── D se prueba con un build DE VERDAD, y por eso vale ───────────────────
 * A · B · C corren con `PUBLICAR_CMD` (una orden falsa de ~1.2 s): lo que
 * comprueban es la máquina de estados, no Next. **D no**: lo que afirma es una
 * propiedad de `next build`, así que se mide parando Postgres y construyendo de
 * verdad. Con `PUBLICAR_CMD` puesto, D no probaría nada — sería un falso verde
 * de manual, y por eso la sonda lo corre en su propio publicador sin gancho.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { APP, Evaluadas, env, gritaSiRevienta, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta(() => matarTodos());

const SABOTAJE = env("SABOTAJE", "");
const SECRETO = "secreto-de-prueba-de-la-sonda";
const DIST = path.join(APP, ".next");
const RAIZ = path.resolve(APP, "../..");

/* 4 invariantes; el mínimo se DERIVA de la lista, no se escribe. */
const INVARIANTES = ["A·auth", "B·sin solape", "C·invariante de disparo", "D·fallo no pisa .next"];
const ev = new Evaluadas({ unidad: "invariantes", minimo: INVARIANTES.length, nombre: "publicar" });

const vivos = new Set();
function matarTodos() {
  for (const p of vivos) try { p.kill(); } catch { /* ya muerto */ }
  vivos.clear();
}

/**
 * Levanta un publicador y espera a que conteste. **No devuelve un puerto por
 * defecto si no arrancó**: tira. Un publicador que no está y una petición que
 * no se manda dan el mismo 0 de builds (§regla 6).
 */
async function levanta({ puerto, cmd = null, sabotaje = null, dist = null }) {
  /* ⚠ **`shell: false` y no es un detalle.** Con `shell: true`, `p.kill()` mata
   * el shell y **deja vivo al node**: el publicador de la corrida anterior sigue
   * escuchando, `levanta()` recibe su `200 OK` y la sonda mide el estado de otro
   * proceso. Medido — dio `builds: 2` antes del primer disparo. */
  const p = spawn(process.execPath, [
    "--env-file=apps/cms/.env",
    path.join(RAIZ, "scripts/publicar/publicador.mjs"),
  ], {
    cwd: RAIZ,
    env: {
      ...process.env,
      PUBLICAR_PUERTO: String(puerto),
      PUBLICAR_SECRETO: SECRETO,
      ...(dist ? { PUBLICAR_DIST: dist } : {}),
      ...(cmd ? { PUBLICAR_CMD: cmd } : {}),
      ...(sabotaje ? { SABOTAJE: sabotaje } : {}),
    },
    stdio: "ignore",
  });
  vivos.add(p);
  for (let i = 0; i < 100; i++) {
    await espera(150);
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/estado`);
      if (!r.ok) continue;
      const e = await r.json();
      /* LA GUARDA DE IDENTIDAD. Un `200 OK` en el puerto no prueba que conteste
       * el proceso que acabamos de lanzar: puede ser el de la corrida anterior,
       * con su estado y su `dist`. Se exige el pid nuestro. */
      if (e.pid !== p.pid)
        throw new Error(
          `el puerto :${puerto} lo tiene OTRO publicador (pid ${e.pid}, esperado ${p.pid}, dist ${e.dist}).\n` +
            `  Medir su estado sería medir otra corrida. Mátalo antes de repetir.`,
        );
      if (dist && e.dist !== dist)
        throw new Error(`el publicador de :${puerto} sirve '${e.dist}' y se esperaba '${dist}'.`);
      return p;
    } catch (err) {
      if (String(err.message).includes("OTRO publicador") || String(err.message).includes("se esperaba"))
        throw err;
      /* todavía no escucha */
    }
  }
  throw new Error(`el publicador de :${puerto} no contestó en 15 s.`);
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const estadoDe = async (puerto) => (await fetch(`http://127.0.0.1:${puerto}/estado`)).json();

/**
 * ⚠ **`cuando` se toma ANTES de mandar la petición, y no es un detalle: la
 * primera versión lo tomaba después y eso rompía el invariante C.**
 *
 * Dos razones, y la segunda es la que importa:
 *
 *   1 · **semántica.** El invariante habla de *«después de que la publicación
 *       estuviera en la DB»*, y eso ocurre **antes** del POST: el hook avisa
 *       cuando el documento ya está guardado. El instante correcto es el de
 *       antes;
 *   2 · **y con el de después la medida era falsa.** `dispara()` arranca el
 *       build de forma síncrona y la respuesta HTTP llega más tarde, así que un
 *       build que SÍ atendió a su disparo salía con `empezo < cuando` y se
 *       contaba como huérfano. En la corrida limpia C pasaba igualmente —el
 *       segundo build tapaba a los cuatro—, o sea **verde por el motivo
 *       equivocado**, que es la peor forma de pasar.
 */
async function disparaHTTP(puerto, motivo, { conSecreto = true } = {}) {
  const cuando = Date.now();
  const r = await fetch(`http://127.0.0.1:${puerto}/rebuild`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(conSecreto ? { authorization: `Bearer ${SECRETO}` } : {}),
    },
    body: JSON.stringify({ motivo }),
  });
  return { codigo: r.status, cuando };
}

/** Espera a que el publicador vuelva a ocioso. Tira si no llega: no devuelve el último estado. */
async function esperaOcioso(puerto, ms = 240_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const e = await estadoDe(puerto);
    if (e.fase === "ocioso" && !e.pendiente) return e;
    await espera(300);
  }
  throw new Error(`el publicador de :${puerto} no volvió a ocioso en ${ms / 1000}s`);
}

const resultados = {};
let violados = 0;

/**
 * ⚠ **Un invariante VIOLADO sí se evaluó.** `ev.fallo()` significa *«esta unidad
 * no se pudo medir»* —§sondas 4bis—, y usarlo para un veredicto negativo haría
 * que la sonda gritara «NO SE PUDO EVALUAR» cuando lo que pasa es que midió
 * perfectamente y salió mal. Son dos frases distintas y el negativo depende de
 * cuál sale: por eso `falla()` cuenta la unidad **y** el incumplimiento aparte.
 */
const falla = (inv, detalle) => {
  resultados[inv] = { ok: false, detalle };
  violados++;
  ev.ok();
  console.log(`  ✗ ${inv} — ${detalle}`);
};
const pasa = (inv, detalle) => {
  resultados[inv] = { ok: true, detalle };
  ev.ok();
  console.log(`  ✓ ${inv} — ${detalle}`);
};

console.log(`\n════════ publicador · ${INVARIANTES.length} invariantes ════════`);
if (SABOTAJE) console.log(`⚠ SABOTAJE=${SABOTAJE}`);

/* Orden falsa: dura ~1.2 s y deja un `.next-nuevo` creíble (con BUILD_ID), que
 * es lo que la promoción exige. Node y no `sleep`, que en Windows no existe. */
const CMD_FALSO =
  `node -e "const fs=require('fs');fs.mkdirSync(process.env.DIST_NUEVO,{recursive:true});` +
  `fs.writeFileSync(process.env.DIST_NUEVO+'/BUILD_ID','falso-'+Date.now());` +
  `setTimeout(()=>process.exit(0),1200)"`;

try {
  /* ───────────────── A · B · C — con build falso ───────────────── */
  const PUERTO = 4187;
  /* ⚠ `dist: ".next-prueba"` — A · B y C NO tocan el artefacto real. Ver la
   * cabecera de `PUBLICAR_DIST` en el publicador: sin esto, los builds falsos
   * de esta sonda pisan el `.next` bueno y **D mide su propia destrucción**. */
  fs.rmSync(path.join(APP, ".next-prueba"), { recursive: true, force: true });
  fs.mkdirSync(path.join(APP, ".next-prueba"), { recursive: true });
  fs.writeFileSync(path.join(APP, ".next-prueba/BUILD_ID"), "prueba-inicial");
  await levanta({ puerto: PUERTO, cmd: CMD_FALSO, sabotaje: SABOTAJE || null, dist: ".next-prueba" });

  /* A — sin credencial */
  const sinAuth = await disparaHTTP(PUERTO, "sin-credencial", { conSecreto: false });
  await espera(400);
  const trasSinAuth = await estadoDe(PUERTO);
  if (sinAuth.codigo === 401 && trasSinAuth.builds === 0 && trasSinAuth.disparos === 0)
    pasa(INVARIANTES[0], "401 y 0 builds · 0 disparos registrados");
  else
    falla(
      INVARIANTES[0],
      `contestó ${sinAuth.codigo} y quedó en builds=${trasSinAuth.builds} disparos=${trasSinAuth.disparos}`,
    );

  /* B + C — una ráfaga de 4 disparos, el 1.º arranca y los otros 3 caen dentro */
  const disparos = [];
  disparos.push(await disparaHTTP(PUERTO, "ráfaga-1"));
  for (const n of [2, 3, 4]) {
    await espera(300); // dentro del build de 1.2 s
    disparos.push(await disparaHTTP(PUERTO, `ráfaga-${n}`));
  }
  const fin = await esperaOcioso(PUERTO);

  /* B — ningún build empezó antes de que terminara el anterior */
  const solapes = fin.historia.filter((b, i) => i > 0 && b.empezo < fin.historia[i - 1].termino);
  if (solapes.length === 0)
    pasa(INVARIANTES[1], `${fin.historia.length} builds, 0 solapados`);
  else falla(INVARIANTES[1], `${solapes.length} build(s) empezaron antes de que acabara el anterior`);

  /* C — para cada disparo, un build que empezó después */
  const huerfanos = disparos.filter((d) => !fin.historia.some((b) => b.empezo > d.cuando));
  if (huerfanos.length === 0)
    pasa(
      INVARIANTES[2],
      `${disparos.length} disparos · ${fin.historia.length} builds · 0 disparos sin build posterior`,
    );
  else
    falla(
      INVARIANTES[2],
      `${huerfanos.length} de ${disparos.length} disparos NO tienen ningún build que empezara después: ` +
        `se guardaron y no se sirven`,
    );

  matarTodos();

  /* ───────────────── D — build REAL con la DB parada ───────────────── */
  const PUERTO_D = 4188;
  const antesBuildId = fs.existsSync(path.join(DIST, "BUILD_ID"))
    ? fs.readFileSync(path.join(DIST, "BUILD_ID"), "utf8").trim()
    : null;
  if (!antesBuildId)
    throw new Error(
      "no hay `.next/BUILD_ID` antes de empezar D.\n" +
        "  D afirma que un build fallido NO pisa el bueno: sin build bueno delante\n" +
        "  la comprobación no puede decir nada. Construye antes.",
    );

  await levanta({ puerto: PUERTO_D, sabotaje: SABOTAJE || null }); // ← SIN PUBLICAR_CMD
  console.log(`  · parando kunak-cms-pg para forzar el fallo de build…`);
  await ejecuta("docker", ["stop", "kunak-cms-pg"]);
  let dbParada = true;
  try {
    await disparaHTTP(PUERTO_D, "prueba-D-db-caida");
    const finD = await esperaOcioso(PUERTO_D);
    await ejecuta("docker", ["start", "kunak-cms-pg"]);
    dbParada = false;
    await espera(3000);

    const ahoraBuildId = fs.existsSync(path.join(DIST, "BUILD_ID"))
      ? fs.readFileSync(path.join(DIST, "BUILD_ID"), "utf8").trim()
      : null;
    const intacto =
      ahoraBuildId === antesBuildId &&
      fs.existsSync(path.join(DIST, "prerender-manifest.json")) &&
      fs.existsSync(path.join(DIST, "standalone"));

    if (intacto && finD.ultimoFallo && finD.ultimoFallo.codigo !== 0)
      pasa(
        INVARIANTES[3],
        `build exit ${finD.ultimoFallo.codigo} · \`.next\` intacto (BUILD_ID ${ahoraBuildId}) · el fallo QUEDA en /estado`,
      );
    else if (!intacto)
      falla(
        INVARIANTES[3],
        `un build FALLIDO tocó \`.next\`: BUILD_ID ${antesBuildId} → ${ahoraBuildId ?? "(borrado)"}` +
          ` · manifiesto ${fs.existsSync(path.join(DIST, "prerender-manifest.json"))}` +
          ` · standalone ${fs.existsSync(path.join(DIST, "standalone"))}`,
      );
    else
      falla(
        INVARIANTES[3],
        `\`.next\` intacto pero /estado NO registró el fallo: ${JSON.stringify(finD.ultimoFallo)}`,
      );
  } finally {
    if (dbParada) await ejecuta("docker", ["start", "kunak-cms-pg"]);
  }
} finally {
  matarTodos();
  for (const d of [".next-prueba", ".next-prueba-nuevo", ".next-prueba-anterior"])
    fs.rmSync(path.join(APP, d), { recursive: true, force: true });
  fs.rmSync(path.join(RAIZ, "scripts/publicar/estado.next-prueba.json"), { force: true });
}

function ejecuta(cmd, args) {
  return new Promise((res) => {
    const p = spawn(cmd, args, { shell: true, stdio: "ignore" });
    p.on("close", res);
  });
}

const salida = {
  meta: {
    sonda: "publicar",
    que: "los 4 invariantes del publicador de F2-4 (auth · sin solape · invariante de disparo · fallo no pisa .next)",
    fecha: hoy(),
    sabotaje: SABOTAJE || null,
  },
  invariantes: resultados,
  violados,
};
w(env("SALIDA") || `medidas/publicar.json`, salida, { pisar: !!SABOTAJE });

const noEvaluados = ev.informe();
console.log(
  violados || noEvaluados
    ? `\n❌ ${violados} invariante(s) del publicador NO se cumplen`
    : `\n✅ los ${INVARIANTES.length} invariantes del publicador se cumplen`,
);
process.exitCode = violados || noEvaluados ? 1 : 0;
