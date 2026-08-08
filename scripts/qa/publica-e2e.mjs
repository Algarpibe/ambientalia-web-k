/**
 * PUBLICAR DE PUNTA A PUNTA — F2-4, el criterio de «hecho» de la fase.
 *
 * Uso:  npm run qa:publica-e2e
 * Negativo:  npm run qa:publica-e2e-neg
 *
 * ── Por qué existe, y no es una sonda más ─────────────────────────────────
 * `qa:publicar` prueba **la máquina de estados** del publicador y `qa:programada`
 * prueba **el cron y la preview**. Las dos disparan el rebuild **a mano**, con un
 * `POST /rebuild`. O sea que el eslabón que da nombre a CMS-0c —*publicar ES
 * reconstruir*— **no lo ejercita ninguna**: el hook `afterChange` estaba escrito,
 * documentado y **sin un solo consumidor que lo hiciera correr**.
 *
 *   > Derivado, no recordado: `grep -rn PUBLICAR_URL scripts packages apps` sólo
 *   > devolvía la definición y sus comentarios. **Cero llamadas.** Es §sondas 3
 *   > (*documentado no es conectado*) sobre la pieza central de la fase.
 *
 * ── Los cuatro invariantes ────────────────────────────────────────────────
 *
 * | # | invariante | qué modo de fallo cierra |
 * |---|---|---|
 * | **E1** | sin `PUBLICAR_URL` el hook es **inerte** | es el CONTROL de E2 — sin él, «hubo un disparo» no prueba que lo causara el guardado |
 * | **E2** | con `PUBLICAR_URL`, **guardar dispara** | el eslabón que nadie ejercitaba |
 * | **E3** | un guardado de contenido produce **UN** disparo, no dos | `slugs` está excluido del grupo que dispara; si entrara, cada guardado avisaría dos veces y el recuento que ve el editor mentiría |
 * | **E4** | el cambio **llega SERVIDO** | alta y baja de un documento ⇒ rebuild ⇒ la ruta aparece y desaparece del artefacto. Es la frase del PLAN medida |
 *
 * ── ⚠ E1 es un CONTROL, no un adorno (§regla 8a) ─────────────────────────
 * *«Un sabotaje que no cambia el resultado no ha probado la guarda: ha probado
 * que el instrumento no la ejercita.»* Aquí la forma es la contraria y el riesgo
 * el mismo: si el publicador contara disparos venidos de otro sitio, E2 saldría
 * verde sin que el hook existiera. E1 mide **el mismo guardado con la variable
 * quitada** y exige **cero**.
 *
 * ── ⚠ Esta sonda ESCRIBE en la DB y CONSTRUYE de verdad ──────────────────
 * E4 da de alta un documento, construye, comprueba, lo borra, vuelve a construir
 * y comprueba que el artefacto quedó como estaba. La limpieza va en `finally`
 * **con el recuento verificado**: un residuo dejaría a `qa:manifiesto` viendo 32
 * rutas donde su base dice 31, y la causa estaría a dos tandas de distancia.
 */
import { spawn } from "node:child_process";

import path from "node:path";

import { APP, Evaluadas, env, gritaSiRevienta, hoy, leeManifiesto, rutasEmitidas, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta(() => matarTodos());

const SABOTAJE = env("SABOTAJE", "");
const SECRETO = "secreto-de-prueba-de-la-sonda";
const RAIZ = path.resolve(APP, "../..");
const PUERTO = 4123;
const URL_PUB = `http://127.0.0.1:${PUERTO}`;
const SLUG = `qa-e2e-${Date.now()}`;

const INVARIANTES = [
  "E1·sin PUBLICAR_URL el hook es inerte",
  "E2·guardar DISPARA",
  "E3·un guardado, UN disparo",
  "E4·el cambio llega SERVIDO",
];
const ev = new Evaluadas({ unidad: "invariantes", minimo: INVARIANTES.length, nombre: "publica-e2e" });

const resultados = {};
let violados = 0;
const pasa = (i, d) => { resultados[i] = { ok: true, detalle: d }; ev.ok(); console.log(`  ✓ ${i} — ${d}`); };
const falla = (i, d) => { resultados[i] = { ok: false, detalle: d }; violados++; ev.ok(); console.log(`  ✗ ${i} — ${d}`); };

const vivos = new Set();
const colaDe = new Map();
function matarTodos() {
  for (const p of vivos) try { p.kill(); } catch { /* ya muerto */ }
  vivos.clear();
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ══════════════════════════════════════════════════════════════════════════
 * EL PUBLICADOR — con guarda de identidad por `pid`, que es el defecto que
 * `qa:publicar` se cobró: un 200 en el puerto no prueba que conteste el proceso
 * que acabas de lanzar.
 * ═════════════════════════════════════════════════════════════════════════ */


async function arrancaPublicador({ cmdFalso, dist }) {
  const p = spawn(
    process.execPath,
    ["--env-file", path.join(RAIZ, "apps/cms/.env"), path.join(RAIZ, "scripts/publicar/publicador.mjs")],
    {
      cwd: RAIZ,
      env: {
        ...process.env,
        PUBLICAR_PUERTO: String(PUERTO),
        PUBLICAR_SECRETO: SECRETO,
        PUBLICAR_DIST: dist,
        ...(cmdFalso ? { PUBLICAR_CMD: cmdFalso } : {}),
        PUBLICAR_URL: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  vivos.add(p);
  /* ⚠ La salida del publicador se GUARDA siempre, no sólo con `E2E_RUIDO`.
   * La primera versión la descartaba, y cuando el publicador murió promocionando
   * la sonda sólo pudo decir «ECONNRESET»: **el motivo estaba en el canal que
   * ella misma había cerrado**. Se retiene la cola y se imprime si algo falla. */
  const cola = [];
  const recoge = (d) => {
    const s = d.toString();
    cola.push(s);
    if (cola.length > 300) cola.shift();
    if (process.env.E2E_RUIDO) process.stdout.write(s);
  };
  p.stdout.on("data", recoge);
  p.stderr.on("data", recoge);
  p.on("exit", (c) => {
    if (c !== 0 && c !== null)
      console.error(`\n⚠⚠ el publicador (pid ${p.pid}) MURIÓ con exit ${c}. Sus últimas líneas:\n${cola.slice(-25).join("")}`);
  });
  colaDe.set(p, cola);

  for (let i = 0; i < 60; i++) {
    await espera(500);
    try {
      const r = await fetch(`${URL_PUB}/estado`);
      if (r.ok) {
        const e = await r.json();
        if (e.pid === p.pid) return p;
        throw new Error(`OTRO publicador en :${PUERTO} (pid ${e.pid} ≠ ${p.pid})`);
      }
    } catch (e) {
      if (String(e.message).includes("OTRO publicador")) throw e;
    }
  }
  throw new Error(`el publicador no levantó en :${PUERTO}`);
}

const estadoPub = async () => (await fetch(`${URL_PUB}/estado`)).json();

/**
 * Espera a que el publicador quede ocioso tras haber hecho al menos `n` builds.
 *
 * ⚠ **Un `fetch` cortado NO es un veredicto, y esto se pagó midiendo.** La
 * primera versión hacía `await estadoPub()` a pelo dentro del bucle: en la
 * corrida del 2026-08-08 un **`ECONNRESET`** durante un sondeo de 90 s mató la
 * sonda entera —y de paso al publicador, en mitad de una promoción—. Un corte de
 * transporte y «el publicador no terminó» son cosas distintas y no pueden dar la
 * misma salida.
 *
 * Y la tolerancia va **acotada por la fecha límite, no por un número de
 * reintentos**: si nunca vuelve, esto tiene que fallar igual de fuerte (§regla 6
 * — una ausencia se rechaza, no se traduce a un valor benigno). Por eso el error
 * del último intento se conserva y se cita en el mensaje.
 */
async function esperaOcioso(n, ms = 600_000) {
  const t0 = Date.now();
  let ultimoCorte = null;
  let cortes = 0;
  while (Date.now() - t0 < ms) {
    try {
      const e = await estadoPub();
      if (e.fase === "ocioso" && e.builds >= n && !e.pendiente) return e;
    } catch (err) {
      cortes++;
      ultimoCorte = err;
    }
    await espera(1000);
  }
  throw new Error(
    `el publicador no llegó a ${n} build(s) ociosos en ${ms} ms` +
      (cortes ? ` · ${cortes} corte(s) de transporte, el último: ${ultimoCorte?.message}` : ""),
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * PAYLOAD — la MISMA Local API por la que escribe el formulario del admin.
 * ═════════════════════════════════════════════════════════════════════════ */
const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

const cuenta = async () => (await payload.count({ collection: "entradas-blog" })).totalDocs;
const CUENTA_ANTES = await cuenta();

async function creaEntrada(estado) {
  const { docs } = await payload.find({ collection: "entradas-blog", limit: 1, depth: 0, sort: "id" });
  const modelo = docs[0];
  if (!modelo) throw new Error("no hay ninguna entrada de blog de la que copiar la forma");
  return payload.create({
    collection: "entradas-blog",
    data: {
      ...modelo,
      id: undefined,
      slug: SLUG,
      titulo: `E2E ${SLUG}`,
      estado,
      publicarEn: null,
    },
  });
}

async function borraEntrada() {
  const { docs } = await payload.find({
    collection: "entradas-blog",
    where: { slug: { equals: SLUG } },
    limit: 10,
    depth: 0,
  });
  for (const d of docs) await payload.delete({ collection: "entradas-blog", id: d.id });
  return docs.length;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS INVARIANTES
 * ═════════════════════════════════════════════════════════════════════════ */
let doc = null;

try {
  /* ─────────── FASE 1 · el hook, con build FALSO (la máquina, no Next) ─── */
  const cmdFalso =
    process.platform === "win32"
      ? `node -e "const fs=require('fs');fs.mkdirSync(process.env.DIST_NUEVO,{recursive:true});fs.writeFileSync(require('path').join(process.env.DIST_NUEVO,'BUILD_ID'),'falso-'+Date.now())"`
      : `mkdir -p "$DIST_NUEVO" && echo falso-$RANDOM > "$DIST_NUEVO/BUILD_ID"`;

  await arrancaPublicador({ cmdFalso, dist: ".next-e2e" });

  /* E1 · CONTROL: sin `PUBLICAR_URL`, el mismo guardado no debe disparar. */
  delete process.env.PUBLICAR_URL;
  /* ⚠ Punto de sabotaje declarado y ruidoso: un disparo que NO viene de guardar
   * nada. Es el falsador del control — si E1 no supiera ver esto, un recuento
   * contaminado dejaría pasar un E2 verde sin hook (§regla 8a). */
  if (SABOTAJE === "disparo-fantasma") {
    console.error("⚠⚠ SABOTAJE=disparo-fantasma: se dispara el rebuild SIN guardar nada");
    await fetch(`${URL_PUB}/rebuild`, {
      method: "POST",
      headers: { authorization: `Bearer ${SECRETO}` },
      body: JSON.stringify({ motivo: "fantasma" }),
    });
    await espera(500);
  }
  doc = await creaEntrada("borrador");
  await espera(1500);
  const e1 = await estadoPub();
  if (e1.disparos === 0) pasa(INVARIANTES[0], `guardado con la variable quitada ⇒ ${e1.disparos} disparos`);
  else falla(INVARIANTES[0], `${e1.disparos} disparos sin PUBLICAR_URL: el hook no es opt-in, o los cuenta otro`);

  /* E2 · con la variable puesta, el MISMO guardado dispara. */
  process.env.PUBLICAR_URL = URL_PUB;
  process.env.PUBLICAR_SECRETO = SECRETO;
  /* ⚠ Punto de sabotaje declarado: sin él, «el hook dispara» no tendría falsador. */
  if (SABOTAJE === "hook-mudo") {
    console.error("⚠⚠ SABOTAJE=hook-mudo: se quita PUBLICAR_URL, el hook no puede avisar");
    delete process.env.PUBLICAR_URL;
  }
  await payload.update({
    collection: "entradas-blog",
    id: doc.id,
    data: { titulo: `E2E ${SLUG} · tocado` },
  });
  await espera(2500);
  const e2 = await estadoPub();
  if (e2.disparos >= 1) pasa(INVARIANTES[1], `${e2.disparos} disparo(s) · motivo «${e2.motivo ?? e2.historia.at(-1)?.motivo}»`);
  else falla(INVARIANTES[1], `0 disparos con PUBLICAR_URL puesto: el hook NO está cableado`);

  /* E3 · UN guardado ⇒ UN disparo. `slugs` está fuera del grupo que dispara, y
   * un guardado de contenido escribe también su registro de slug: si `slugs`
   * disparase, aquí saldrían dos. */
  const antes = (await estadoPub()).disparos;
  await payload.update({
    collection: "entradas-blog",
    id: doc.id,
    data: { titulo: `E2E ${SLUG} · otra vez` },
  });
  await espera(2500);
  const e3 = await estadoPub();
  const delta = e3.disparos - antes;
  const motivos = e3.historia.map((h) => h.motivo).filter(Boolean);
  const deSlugs = motivos.filter((m) => String(m).startsWith("slugs:")).length;
  if (delta === 1 && deSlugs === 0)
    pasa(INVARIANTES[2], `1 guardado ⇒ ${delta} disparo · 0 avisos de \`slugs\` en ${motivos.length} motivos`);
  else falla(INVARIANTES[2], `1 guardado ⇒ ${delta} disparos · ${deSlugs} de \`slugs\` (se esperaba 1 y 0)`);

  matarTodos();
  await espera(1000);

  /* ─────────── FASE 2 · el artefacto de VERDAD ─────────────────────────── */
  const rutasAntes = rutasEmitidas(leeManifiesto()).length;
  await arrancaPublicador({ cmdFalso: null, dist: ".next" });

  process.env.PUBLICAR_URL = URL_PUB;
  await payload.update({ collection: "entradas-blog", id: doc.id, data: { estado: "publicado" } });
  const trasAlta = await esperaOcioso(1);
  const rutasConAlta = rutasEmitidas(leeManifiesto());
  const apareció = rutasConAlta.includes(`/${SLUG}`);

  await borraEntrada();
  doc = null;
  const trasBaja = await esperaOcioso(trasAlta.builds + 1);
  const rutasFinal = rutasEmitidas(leeManifiesto());
  const desapareció = !rutasFinal.includes(`/${SLUG}`);

  if (apareció && desapareció && rutasFinal.length === rutasAntes)
    pasa(
      INVARIANTES[3],
      `alta ⇒ ${rutasAntes}→${rutasConAlta.length} rutas con /${SLUG} dentro (build ${trasAlta.ultimoExito?.buildId}) · ` +
        `baja ⇒ ${rutasFinal.length} y fuera (build ${trasBaja.ultimoExito?.buildId})`,
    );
  else
    falla(
      INVARIANTES[3],
      `apareció=${apareció} desapareció=${desapareció} rutas ${rutasAntes}→${rutasConAlta.length}→${rutasFinal.length}`,
    );
} finally {
  /* La limpieza se comprueba, no se supone. */
  const borradas = await borraEntrada();
  const cuentaFinal = await cuenta();
  console.log(`\n  · limpieza: ${borradas} borrada(s) · entradas-blog ${cuentaFinal} (era ${CUENTA_ANTES})`);
  if (cuentaFinal !== CUENTA_ANTES)
    console.error(`❌ la sonda dejó residuo: ${CUENTA_ANTES} → ${cuentaFinal}`);
  matarTodos();
  await payload.db.destroy?.();
}

w(
  env("SALIDA") || "medidas/publica-e2e.json",
  { meta: { fecha: hoy(), sabotaje: SABOTAJE || null, slug: SLUG }, invariantes: resultados },
  { pisar: !!SABOTAJE },
);

const noEvaluados = ev.informe();
console.log(
  violados === 0
    ? `\n✅ publicar de punta a punta: los ${INVARIANTES.length} invariantes se cumplen`
    : `\n❌ ${violados} invariante(s) violado(s)`,
);
process.exitCode = violados === 0 && noEvaluados === 0 ? 0 : 1;

/**
 * ⚠ **EL VIGILANTE — el mismo de `programada.mjs`, y por la misma factura.**
 *
 * Esta sonda lanza publicadores como hijos, y un `child_process` **mantiene vivo
 * el bucle de su padre** mientras el manejador exista. La sonda imprimía su 4/4
 * y **se quedaba viva**. Suelta eso sólo es molesto; dentro de `corridaNegativa`
 * —que usa `spawnSync` con timeout— se convierte en **~14 minutos por caso** y en
 * un `exit null` que el negativo lee, con razón, como *«sin sabotaje tiene que
 * salir 0»*. Medido: el control escribió su congelada a las 10:09 y el harness
 * seguía esperándolo a las 10:23.
 *
 * `unref()`: si el bucle drena solo, **nunca dispara**. Y va después de
 * `matarTodos()` y a 2 s del último `fetch`, así que la carrera de
 * §F2-3-EXIT-FETCH no existe aquí.
 */
setTimeout(() => {
  console.error("⚠ el bucle no drenó en 2 s (hijos aún referenciados): se sale con el código ya calculado");
  process.exit(process.exitCode ?? 0);
}, 2000).unref();
