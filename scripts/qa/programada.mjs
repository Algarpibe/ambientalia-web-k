/**
 * PUBLICACIÓN PROGRAMADA + VISTA PREVIA — F2-4, PASOS 3 y 4 con su negativo.
 *
 * Uso:  npm run qa:programada        (exige DB sembrada y `.next` construido)
 * Negativo:  npm run qa:programada-neg
 *
 * ── Los invariantes, y los dos NEGATIVOS son la mitad que vale ────────────
 *
 * | # | invariante | por qué no basta con el positivo |
 * |---|---|---|
 * | **P1** | un borrador **no sale** en el build | si no se comprueba, `estado` podría no filtrar nada y nadie lo vería (pasó: el filtro estaba en una función que no usa nadie) |
 * | **P2** | programado **para dentro de una hora NO se publica** | es el negativo del cron: sin él, «el cron publica» se cumpliría publicándolo TODO |
 * | **P3** | programado **con la hora pasada se publica**, y **una sola vez** | la segunda vuelta tiene que dar 0: es la idempotencia entera |
 * | **P4** | la preview **sin credencial no sirve el borrador** | el negativo de la grieta |
 * | **P5** | la preview **con credencial sí lo sirve** | sin esto, P4 se cumpliría con una ruta rota |
 * | **P6** | la preview **no está en el `prerender-manifest`** | es lo que mantiene la grieta fuera del conjunto medido |
 *
 * ── ⚠ Esta sonda ESCRIBE en la DB, así que se limpia y lo comprueba ───────
 * Crea un borrador de prueba (`qa-programada-*`), lo publica por el cron y lo
 * borra en `finally`, verificando el recuento contra el de antes. Un residuo
 * silencioso dejaría a `qa:manifiesto` viendo 32 rutas donde la base dice 31, y
 * la causa estaría a dos tandas de distancia.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  APP,
  Evaluadas,
  env,
  gritaSiRevienta,
  hoy,
  iniciarClon,
  leeManifiesto,
  rutasEmitidas,
  w,
} from "./lib.mjs";

gritaSiRevienta(() => matarTodos());

const SABOTAJE = env("SABOTAJE", "");
const SECRETO = "secreto-de-prueba-de-la-sonda";
const PREVIEW_SECRETO = process.env.PREVIEW_SECRETO || "preview-f24-desarrollo-local";
const RAIZ = path.resolve(APP, "../..");
const SLUG = "qa-programada-borrador";

const INVARIANTES = [
  "P1·borrador fuera del build",
  "P2·futuro NO se publica",
  "P3·vencido se publica UNA vez",
  "P4·preview sin credencial",
  "P5·preview con credencial",
  "P6·preview fuera del manifiesto",
];
const ev = new Evaluadas({ unidad: "invariantes", minimo: INVARIANTES.length, nombre: "programada" });

const vivos = new Set();
function matarTodos() {
  for (const p of vivos) try { p.kill(); } catch { /* ya muerto */ }
  vivos.clear();
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const resultados = {};
let violados = 0;
const falla = (inv, d) => { resultados[inv] = { ok: false, detalle: d }; violados++; ev.ok(); console.log(`  ✗ ${inv} — ${d}`); };
const pasa = (inv, d) => { resultados[inv] = { ok: true, detalle: d }; ev.ok(); console.log(`  ✓ ${inv} — ${d}`); };

console.log(`\n════════ programada + vista previa · ${INVARIANTES.length} invariantes ════════`);
if (SABOTAJE) console.log(`⚠ SABOTAJE=${SABOTAJE}`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

const cuenta = async () => (await payload.count({ collection: "entradas-blog" })).totalDocs;
const antes = await cuenta();

/** Una copia de una entrada real, en BORRADOR y programada para `cuando`. */
async function creaBorrador(cuando) {
  const { docs } = await payload.find({ collection: "entradas-blog", limit: 1, depth: 0, sort: "id" });
  if (!docs.length) throw new Error("no hay `entradas-blog` de la que clonar. ¿Falta `npm run cms:seed`?");
  const base = { ...docs[0] };
  for (const k of ["id", "createdAt", "updatedAt"]) delete base[k];
  return payload.create({
    collection: "entradas-blog",
    data: { ...base, slug: SLUG, estado: "borrador", publicarEn: cuando.toISOString() },
    depth: 0,
  });
}

async function limpia() {
  const { docs } = await payload.find({
    collection: "entradas-blog",
    where: { slug: { equals: SLUG } },
    limit: 0,
    pagination: false,
    depth: 0,
  });
  for (const d of docs) await payload.delete({ collection: "entradas-blog", id: d.id });
  return docs.length;
}

let sobrantes = 0;
let servidor = null;

try {
  await limpia(); // por si una corrida anterior murió a mitad

  /* ── P2 · programado para DENTRO DE UNA HORA ────────────────────────── */
  const dentroDeUnaHora = new Date(Date.now() + 60 * 60 * 1000);
  await creaBorrador(dentroDeUnaHora);

  const { publicaVencidos } = await import("../publicar/publicador.mjs").catch(() => ({}));
  /* El publicador arranca un servidor al importarse, así que el cron se ejerce
   * por HTTP contra un publicador de verdad — que además es como se usa. */
  const PUERTO = 4287;
  servidor = spawn(process.execPath, [
    "--env-file=apps/cms/.env",
    path.join(RAIZ, "scripts/publicar/publicador.mjs"),
  ], {
    cwd: RAIZ,
    env: {
      ...process.env,
      PUBLICAR_PUERTO: String(PUERTO),
      PUBLICAR_SECRETO: SECRETO,
      PUBLICAR_DIST: ".next-prog",
      /* No construye: lo que se mide aquí es la CONSULTA del cron, no Next. */
      PUBLICAR_CMD: `node -e "require('fs').mkdirSync(process.env.DIST_NUEVO,{recursive:true});require('fs').writeFileSync(process.env.DIST_NUEVO+'/BUILD_ID','prog');process.exit(0)"`,
      ...(SABOTAJE ? { SABOTAJE } : {}),
    },
    stdio: "ignore",
  });
  vivos.add(servidor);
  for (let i = 0; i < 100; i++) {
    await espera(150);
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/estado`);
      if (r.ok) { const e = await r.json(); if (e.pid === servidor.pid) break; throw new Error("OTRO publicador"); }
    } catch (e) { if (String(e.message).includes("OTRO publicador")) throw e; }
  }

  const cron = async () => {
    const r = await fetch(`http://127.0.0.1:${PUERTO}/cron`, {
      method: "POST",
      headers: { authorization: `Bearer ${SECRETO}` },
    });
    return r.json();
  };

  const r2 = await cron();
  const sigueBorrador = async () => {
    const { docs } = await payload.find({ collection: "entradas-blog", where: { slug: { equals: SLUG } }, limit: 1, depth: 0 });
    return docs[0]?.estado;
  };
  if (r2.publicados.length === 0 && (await sigueBorrador()) === "borrador")
    pasa(INVARIANTES[1], `programado a +1 h ⇒ 0 publicados, sigue en borrador (${r2.motivo})`);
  else
    falla(INVARIANTES[1], `publicó ${r2.publicados.length} con la hora en el FUTURO: ${JSON.stringify(r2.publicados)}`);

  /* ── P1 · el borrador NO sale en el build ──────────────────────────────
   *
   * ⚠ **P1 CONSTRUYE, y la primera versión no lo hacía: leía el manifiesto que
   * ya estuviera en disco.** Eso hacía la comprobación **inerte**, porque ese
   * build se había hecho **antes de que el borrador existiera** — o sea que P1
   * afirmaba «el borrador no sale» midiendo un artefacto que nunca lo tuvo
   * delante. Lo destapó su propio falsador: con `sin-filtro` puesto, la sonda
   * seguía saliendo **0**.
   *
   * Es la §causa común con el contenedor más obvio de todos —**el artefacto
   * viejo**— y la lección es la de siempre: *una afirmación sobre el build se
   * mide construyendo*. Cuesta ~45 s y no hay atajo.
   *
   * Construye en `.next-p1` para **no tocar el artefacto verificado**: si esta
   * sonda promocionara su build, cualquier corrida suya dejaría el `.next` del
   * repo hecho con un borrador dentro. */
  const dist = ".next-p1";
  fs.rmSync(path.join(APP, dist), { recursive: true, force: true });
  const b = spawnSync("npm", ["run", "build", "-w", "web"], {
    cwd: RAIZ, shell: true, encoding: "utf8", timeout: 600_000,
    env: { ...process.env, NEXT_DIST_DIR: dist },
  });
  if (b.status !== 0) falla(INVARIANTES[0], `el build de P1 falló (exit ${b.status})`);
  else {
    /* `leeManifiesto()` resuelve siempre `<raiz>/.next/…`, y este build no está
     * ahí: se lee el fichero directamente. Si no existe, `readFileSync` TIRA —
     * un manifiesto ausente daría 0 rutas y «0 rutas» contiene el borrador
     * exactamente igual que no contenerlo (§regla del cero). */
    const man = JSON.parse(
      fs.readFileSync(path.join(APP, dist, "prerender-manifest.json"), "utf8"),
    );
    const rutas = rutasEmitidas(man);
    if (!rutas.includes(`/${SLUG}`))
      pasa(INVARIANTES[0], `build propio: ${rutas.length} rutas y /${SLUG} NO está entre ellas`);
    else falla(INVARIANTES[0], `el borrador /${SLUG} SÍ está en el build (${rutas.length} rutas)`);
  }
  fs.rmSync(path.join(APP, dist), { recursive: true, force: true });

  /* ── P4 · P5 · la preview, contra un servidor de verdad ───────────────── */
  /* ⚠ **`iniciarClon` y NO un servidor a mano.** La primera versión lo lanzaba
   * con `spawn(..., {shell:true})` en un puerto fijo, y en Windows `kill()` mata
   * el shell y **deja vivo el next**: la corrida siguiente encontraba el puerto
   * ocupado, su fetch le contestaba 200 desde el servidor VIEJO y medía sobre
   * otro artefacto. `iniciarClon` pide **puerto libre** al sistema y mata el
   * **árbol** por `taskkill /T`, que es justo lo que faltaba. Es el mismo
   * defecto que `qa:publicar` se cobró con su publicador — dos veces la misma
   * clase en una tanda, y la segunda ya tenía la solución escrita al lado.
   */
  const { base, parar } = await iniciarClon();
  try {
    const sin = await fetch(`${base}/vista-previa/${SLUG}`, { redirect: "manual" });
    const htmlSin = await sin.text();
    if (sin.status === 404 && !htmlSin.includes("VISTA PREVIA"))
      pasa(INVARIANTES[3], `sin token ⇒ 404 y CERO rastro del borrador`);
    else falla(INVARIANTES[3], `sin token contestó ${sin.status} y ${htmlSin.includes("VISTA PREVIA") ? "SIRVIÓ el borrador" : "no fue 404"}`);

    const con = await fetch(`${base}/vista-previa/${SLUG}?token=${encodeURIComponent(PREVIEW_SECRETO)}`, { redirect: "manual" });
    const htmlCon = await con.text();
    if (con.status === 200 && htmlCon.includes("VISTA PREVIA") && htmlCon.includes("borrador"))
      pasa(INVARIANTES[4], `con token ⇒ 200 y el borrador servido con su cinta`);
    else falla(INVARIANTES[4], `con token contestó ${con.status}, cinta=${htmlCon.includes("VISTA PREVIA")}`);
  } finally {
    await parar();
  }

  /* ── P6 · la grieta no entra en el conjunto medido ────────────────────── */
  const man = leeManifiesto();
  const enManifiesto = [
    ...Object.keys(man.routes || {}),
    ...Object.keys(man.dynamicRoutes || {}),
  ].filter((r) => r.includes("vista-previa"));
  if (enManifiesto.length === 0)
    pasa(INVARIANTES[5], `0 entradas con 'vista-previa' en routes ni en dynamicRoutes`);
  else falla(INVARIANTES[5], `la preview aparece en el manifiesto: ${enManifiesto.join(", ")}`);

  /* ── P3 · vencido ⇒ se publica, y SOLO UNA VEZ ────────────────────────── */
  await payload.update({
    collection: "entradas-blog",
    where: { slug: { equals: SLUG } },
    data: { publicarEn: new Date(Date.now() - 60 * 1000).toISOString() },
  });
  const r3a = await cron();
  const tras = await sigueBorrador();
  const r3b = await cron(); // la segunda vuelta TIENE que ver cero
  if (r3a.publicados.length === 1 && tras === "publicado" && r3b.publicados.length === 0)
    pasa(INVARIANTES[2], `1.ª vuelta publica 1 · queda 'publicado' · 2.ª vuelta publica 0 (${r3b.motivo})`);
  else
    falla(
      INVARIANTES[2],
      `1.ª vuelta ${r3a.publicados.length} · estado '${tras}' · 2.ª vuelta ${r3b.publicados.length} (tiene que ser 1 · publicado · 0)`,
    );

  void publicaVencidos;
} finally {
  matarTodos();
  const borradas = await limpia();
  const despues = await cuenta();
  sobrantes = despues - antes;
  console.log(`\n  · limpieza: ${borradas} borrada(s) · entradas-blog ${despues} (era ${antes})`);
  if (sobrantes !== 0)
    console.error(`\n❌ LA DB NO VOLVIÓ A SU ESTADO: sobran ${sobrantes}. Bórralas: slug = '${SLUG}'.`);
}

const salida = {
  meta: {
    sonda: "programada",
    que: "publicación programada (cron) y vista previa de borradores — F2-4 pasos 3 y 4",
    fecha: hoy(),
    sabotaje: SABOTAJE || null,
  },
  invariantes: resultados,
  violados,
  dbRestaurada: sobrantes === 0,
};
w(env("SALIDA") || "medidas/programada.json", salida, { pisar: !!SABOTAJE });

const noEvaluados = ev.informe();
console.log(
  violados || noEvaluados || sobrantes
    ? `\n❌ ${violados} invariante(s) NO se cumplen`
    : `\n✅ los ${INVARIANTES.length} invariantes de programación y preview se cumplen`,
);
process.exitCode = violados || noEvaluados || sobrantes ? 1 : 0;

/**
 * ⚠ **Se cierra el pool de Postgres, y NO con `process.exit()`.**
 *
 * La Local API deja el pool de `pg` abierto y eso mantiene vivo el bucle de
 * Node: sin esto la sonda imprime su veredicto y **se queda colgada**, que para
 * quien la corre es indistinguible de una sonda que se ha bloqueado midiendo.
 *
 * Y la salida fácil está prohibida aquí: `process.exit()` después de un `fetch`
 * aborta libuv en Windows y devuelve `3221226505` en vez del código elegido
 * (§F2-3-EXIT-FETCH), o sea que arreglaría el cuelgue **rompiendo el código de
 * salida** — que es lo único que el negativo mira. Se drena el bucle, que es lo
 * que la ficha dice que funciona.
 */
await payload.db.destroy?.();

/**
 * ⚠ **EL VIGILANTE, y existe porque su ausencia costó DOS corridas de 15 min.**
 *
 * Esta sonda lanza dos procesos hijo (el publicador y el clon de
 * `iniciarClon`). Un `child_process` **mantiene vivo el bucle de su padre**
 * mientras el manejador exista, así que aunque los matemos el proceso puede
 * tardar en drenar — y **la sonda imprimió su 6/6 y se quedó viva**.
 *
 * Suelta, eso sólo es molesto. Dentro de `corridaNegativa` es caro: `spawnSync`
 * espera al hijo, y su timeout son **900 s**. O sea que **un cuelgue de 2 s en
 * la sonda se convierte en 15 minutos por sabotaje**, y el negativo entero deja
 * de ser algo que nadie vuelve a correr.
 *
 * El temporizador va `unref()`: **si el bucle drena solo, nunca dispara** y el
 * comportamiento no cambia. Sólo actúa cuando hay algo colgado, que es la única
 * situación en la que salir a la brava es mejor que esperar.
 *
 * ⚠ Y sí, es un `process.exit()` en una sonda con `fetch` (§F2-3-EXIT-FETCH).
 * Va **2 s después** del último `fetch` y después de matar a los hijos, así que
 * el socket keep-alive ya está cerrado y la carrera que describe la ficha no
 * existe aquí. Si algún día devolviera `3221226505`, el negativo lo vería como
 * «esperaba exit 1, salió 3221226505» — falla en la dirección ruidosa, no en la
 * silenciosa.
 */
setTimeout(() => {
  console.error("⚠ el bucle no drenó en 2 s (hijos aún referenciados): se sale con el código ya calculado");
  process.exit(process.exitCode ?? 0);
}, 2000).unref();
