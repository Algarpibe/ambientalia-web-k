/**
 * EL PUBLICADOR — F2-4. Publicar dispara reconstrucción (CMS-0c), y esto es lo
 * que la dispara.
 *
 * Uso:  node --env-file=apps/cms/.env scripts/publicar/publicador.mjs
 *       PUBLICAR_PUERTO=4000 PUBLICAR_SECRETO=… npm run publicar
 *
 * Endpoints:
 *   POST /rebuild   Authorization: Bearer <PUBLICAR_SECRETO>   → 202 {estado}
 *   GET  /estado                                               → lo que ve el editor
 *   POST /cron      Authorization: Bearer <PUBLICAR_SECRETO>   → publicación programada
 *
 * ── Por qué existe un proceso aparte y no un hook que construya ───────────
 * El rebuild son **~91 s a 220 rutas** (A-SP13, `medidas/a-sp13-*.json`).
 * Construir dentro del proceso del admin significa que quien pulsa «Publicar»
 * espera minuto y medio a que le conteste el formulario, y que dos personas
 * editando a la vez compiten por la CPU con el build. El hook de Payload sólo
 * **avisa**; construir es de aquí.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 1 · LA POLÍTICA DE IDEMPOTENCIA: COALESCER, y por qué no las otras dos
 * ══════════════════════════════════════════════════════════════════════════
 *
 * La propiedad que hay que garantizar no es «no construir de más». Es ésta, y
 * conviene escribirla porque es la que descarta una de las tres opciones:
 *
 *   > **Para toda publicación P existe un build B que EMPEZÓ después de que P
 *   > estuviera en la DB.**
 *
 * Un build lee la DB al arrancar; lo que entre después no sale en él. Con eso:
 *
 * | política | qué hace con un disparo durante un build | ¿cumple? |
 * |---|---|---|
 * | **descartar** | lo tira | ❌ **NO.** Una publicación que llegue en el segundo 2 de un build de 91 no se sirve **nunca**, y nadie se entera |
 * | **encolar (N)** | apila N builds | ✅ sí, pero **10 saves seguidos = 15 minutos** de builds que se pisan: los 9 primeros publican un estado ya superado |
 * | **COALESCER** ← | marca **un** pendiente (no N) y al terminar construye **una** vez más | ✅ sí, y con **2 builds como máximo** por ráfaga |
 *
 * Coalescer cumple el invariante porque el build de la cola **arranca después**
 * del último disparo recibido, y por tanto después de cualquier publicación que
 * lo provocó. Encolar cumple lo mismo gastando N−1 builds de más; descartar no
 * cumple, y su fallo es **silencioso**, que es el que este repo no acepta.
 *
 * **El pendiente es un booleano a propósito, no un contador.** Un contador
 * volvería a ser «encolar» con otro nombre: lo que hay que reconstruir no es
 * «una vez por publicación», es **el estado final**, y el estado final es uno
 * solo por muchas veces que se haya guardado.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 2 · CONSTRUIR FUERA Y PROMOCIONAR — medido, no precavido
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **2026-08-07, con la DB parada:** `next build` → `exit 1`, y `.next` queda
 * **sin `BUILD_ID`, sin `standalone` y sin `prerender-manifest`**. Los tres
 * comprobados. `next build` vacía su directorio al empezar, así que:
 *
 *   · si el build FALLA, el sitio no se queda desactualizado: **se queda sin
 *     build**;
 *   · y aunque no falle, hay una ventana de ~90 s **sin sitio**.
 *
 * Por eso se construye en `NEXT_DIST_DIR=.next-nuevo` y sólo se promociona con
 * `exit 0`. La promoción es un **rename**, que en el mismo volumen es atómico:
 * no hay estado intermedio en el que el directorio esté a medias.
 *
 * ⚠ **Y la promoción NO se hace con el servidor levantado sobre `.next`.** En
 * Windows renombrar un directorio en uso falla; en Linux funciona pero el
 * proceso servidor sigue con los inodos viejos. Las dos cosas piden lo mismo:
 * **parar, promocionar, arrancar**. Si el publicador arrancó el servidor
 * (`PUBLICAR_SERVIDOR=1`) lo hace él; si no, lo declara en el estado y quien
 * despliegue se encarga.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 3 · QUÉ VE EL EDITOR — la tercera incógnita de CMS-0c
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `GET /estado` es la respuesta, y es un endpoint y no un mensaje porque tiene
 * que sobrevivir a que el editor cierre la pestaña. Devuelve **en qué punto
 * está**, **desde cuándo** y —lo que importa— **si el último falló y por qué**.
 *
 * > **Un webhook que falla en silencio es el peor de los modos de fallo de este
 * > repo con otro traje**: quien publicó cree que publicó. Por eso el fallo se
 * > guarda con su código de salida y sus últimas líneas, y NO se borra al
 * > disparar el siguiente: se conserva en `ultimoFallo` hasta que un build
 * > termine bien.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP = path.join(RAIZ, "apps/web");
/**
 * ⚠ **`PUBLICAR_DIST` no es un gancho de test: es configuración — y existe
 * porque la sonda se cobró el defecto que evita.**
 *
 * `qa:publicar` prueba la política de coalescencia con builds falsos de 1.2 s.
 * La primera versión los dejaba promocionar sobre el `.next` **de verdad**, así
 * que al comprobar el invariante D —*«un build fallido no pisa el bueno»*— el
 * build bueno ya no estaba: **lo había pisado la propia sonda**, y el `BUILD_ID`
 * que leyó como «el de antes» era `falso-1786155509694`.
 *
 * Es §sondas 3 con el instrumento como víctima: la sonda medía correctamente
 * una precondición que ella misma había destruido. Con el árbol separado, A · B
 * y C corren sobre `.next-prueba` y **D es el único que toca el artefacto real**,
 * que es donde su afirmación tiene sentido.
 */
const NOMBRE_DIST = process.env.PUBLICAR_DIST || ".next";
const DIST = path.join(APP, NOMBRE_DIST);
const DIST_NUEVO = path.join(APP, `${NOMBRE_DIST}-nuevo`);
const DIST_ANTERIOR = path.join(APP, `${NOMBRE_DIST}-anterior`);
const ESTADO_FICHERO = path.join(
  RAIZ,
  `scripts/publicar/estado${NOMBRE_DIST === ".next" ? "" : NOMBRE_DIST}.json`,
);

const PUERTO = Number(process.env.PUBLICAR_PUERTO || 4000);
const PUERTO_WEB = Number(process.env.PUBLICAR_PUERTO_WEB || 3000);
const GESTIONA_SERVIDOR = process.env.PUBLICAR_SERVIDOR === "1";

/**
 * ⚠ **Sin defecto a propósito, igual que `PAYLOAD_SECRET`.** Un secreto por
 * defecto es un secreto en el repo, y aquí el endpoint **dispara un proceso**:
 * dejarlo abierto es dejar que cualquiera reconstruya el sitio en bucle. Si
 * falta, el publicador no arranca.
 */
const SECRETO = process.env.PUBLICAR_SECRETO;
if (!SECRETO)
  throw new Error(
    "PUBLICAR_SECRETO no está definido.\n" +
      "  Este endpoint lanza builds: sin secreto es un disparador anónimo de carga.\n" +
      "  Y un valor por defecto sería un secreto commiteado, que es peor que ninguno.",
  );

/* ══════════════════════════════════════════════════════════════════════════
 * LOS DOS GANCHOS DE TEST — declarados y RUIDOSOS
 *
 * Un rebuild real son ~42 s (A-SP13), así que probar la política de coalescencia
 * con builds de verdad costaría minutos por falsador y nadie la re-correría. Y
 * probar la política **no necesita** un build real: lo que se comprueba es la
 * máquina de estados, no Next.
 *
 * Pero un gancho que no se ve fabrica verdes sin dejar rastro (§sondas, la
 * guarda del `MANIFIESTO` de `manifiesto.mjs`), así que los dos:
 *
 *   · se anuncian en la salida **y** en `GET /estado`, o sea que cualquier
 *     congelada tomada con ellos lo lleva escrito dentro;
 *   · y el fallo REAL —build con Postgres caído— se prueba **sin** `PUBLICAR_CMD`,
 *     porque ahí lo que se mide sí es Next.
 * ═════════════════════════════════════════════════════════════════════════ */
const CMD = process.env.PUBLICAR_CMD || null;
const SABOTAJE = process.env.SABOTAJE || null;
if (CMD) console.error(`⚠ PUBLICAR_CMD puesto: NO se construye con Next, se ejecuta «${CMD}»`);
if (SABOTAJE) console.error(`⚠⚠ SABOTAJE=${SABOTAJE}: este publicador está ROTO A PROPÓSITO`);

/* ══════════════════════════════════════════════════════════════════════════
 * ESTADO
 * ═════════════════════════════════════════════════════════════════════════ */
const estado = {
  fase: "ocioso", // ocioso | construyendo
  pendiente: false, // el booleano de la §1 — NO un contador
  desde: new Date().toISOString(),
  motivo: null,
  ultimoExito: null,
  ultimoFallo: null,
  builds: 0,
  disparos: 0,
  coalescidos: 0,
  promocionRequierePararServidor: !GESTIONA_SERVIDOR,
  /* El testigo del INVARIANTE de la §1: por cada build, cuándo empezó y cuántos
   * disparos se habían recibido ya. Con eso la sonda puede comprobar «para todo
   * disparo P existe un build B que empezó después de P» **sin creerse el
   * recuento**: compara instantes, que es el nivel donde vive la propiedad. */
  historia: [],
  /* Un gancho de test activo viaja DENTRO del estado: cualquier congelada que lo
   * cite lo lleva escrito y no se puede confundir con una corrida real. */
  ganchos: { PUBLICAR_CMD: null, SABOTAJE: null },
  /**
   * ⚠ **La IDENTIDAD del proceso, y está aquí porque su ausencia costó una
   * corrida entera.** `qa:publicar` levantaba su publicador, y si el puerto ya
   * estaba ocupado por uno **de la corrida anterior** —en Windows, `spawn` con
   * `shell: true` mata el shell y deja vivo al node— la sonda hablaba con el
   * viejo **sin enterarse**: leía `builds: 2` de otra corrida, sobre otro `dist`,
   * y adjudicaba con eso.
   *
   * O sea la §causa común otra vez, con un contenedor nuevo: **el proceso al
   * otro lado del puerto**. Un `200 OK` no prueba que sea el tuyo. Con `pid` y
   * `dist` en el estado, la sonda puede exigir que lo sea.
   */
  pid: process.pid,
  dist: NOMBRE_DIST,
  arrancado: Date.now(),
};

function guardaEstado() {
  fs.mkdirSync(path.dirname(ESTADO_FICHERO), { recursive: true });
  fs.writeFileSync(ESTADO_FICHERO, JSON.stringify(estado, null, 2));
}

function log(...xs) {
  console.log(`[${new Date().toISOString()}]`, ...xs);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL SERVIDOR WEB — sólo si el publicador lo gestiona
 * ═════════════════════════════════════════════════════════════════════════ */
let servidorWeb = null;

function paraServidor() {
  if (!servidorWeb) return Promise.resolve();
  return new Promise((res) => {
    const p = servidorWeb;
    servidorWeb = null;
    p.once("exit", () => res());
    p.kill();
    setTimeout(res, 5000).unref();
  });
}

function arrancaServidor() {
  if (!GESTIONA_SERVIDOR) return;
  servidorWeb = spawn("npm", ["run", "start", "-w", "web"], {
    shell: true,
    cwd: RAIZ,
    env: { ...process.env, PORT: String(PUERTO_WEB) },
    stdio: "ignore",
  });
  log(`servidor web arrancado en :${PUERTO_WEB}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL BUILD
 * ═════════════════════════════════════════════════════════════════════════ */
function construye() {
  return new Promise((resolve) => {
    fs.rmSync(DIST_NUEVO, { recursive: true, force: true });
    const t0 = Date.now();
    const cola = [];
    const p = CMD
      ? spawn(CMD, { shell: true, cwd: RAIZ, env: { ...process.env, DIST_NUEVO } })
      : spawn("npm", ["run", "build", "-w", "web"], {
          shell: true,
          cwd: RAIZ,
          env: { ...process.env, NEXT_DIST_DIR: `${NOMBRE_DIST}-nuevo` },
        });
    const on = (d) => {
      const s = d.toString();
      process.stdout.write(s);
      cola.push(s);
      if (cola.length > 400) cola.shift();
    };
    p.stdout.on("data", on);
    p.stderr.on("data", on);
    p.on("close", (codigo) =>
      resolve({ codigo, segundos: +((Date.now() - t0) / 1000).toFixed(2), cola: cola.join("") }),
    );
  });
}

/**
 * La PROMOCIÓN. Se llama **sólo** con `codigo === 0`.
 *
 * ⚠ Aquí no hay `try/catch` que devuelva un valor benigno (§regla 6): si el
 * rename falla, la excepción sube y el build se marca fallido. Un «promocionado»
 * que en realidad no promocionó es exactamente el fallo silencioso que este
 * fichero existe para evitar.
 */
async function promociona() {
  if (!fs.existsSync(path.join(DIST_NUEVO, "BUILD_ID")))
    throw new Error(
      "el build salió 0 pero `.next-nuevo` no tiene BUILD_ID.\n" +
        "  Un exit 0 sin artefacto es un verde que no se puede cobrar: se rechaza.",
    );
  await paraServidor();
  fs.rmSync(DIST_ANTERIOR, { recursive: true, force: true });
  if (fs.existsSync(DIST)) fs.renameSync(DIST, DIST_ANTERIOR);
  fs.renameSync(DIST_NUEVO, DIST);
  arrancaServidor();
  return fs.readFileSync(path.join(DIST, "BUILD_ID"), "utf8").trim();
}

async function unaVuelta(motivo) {
  estado.fase = "construyendo";
  estado.desde = new Date().toISOString();
  estado.motivo = motivo;
  estado.builds++;
  /* El testigo del invariante: el instante en que ESTE build empezó a leer. */
  estado.historia.push({
    build: estado.builds,
    empezo: Date.now(),
    disparosPrevios: estado.disparos,
    motivo,
  });
  guardaEstado();
  log(`build #${estado.builds} — ${motivo}`);

  const r = await construye();
  estado.historia.at(-1).codigo = r.codigo;
  estado.historia.at(-1).termino = Date.now();

  /* ⚠ SABOTAJE `promociona-roto`: promocionar sin mirar el código de salida.
   * Es exactamente lo que hacía el mundo antes de F2-4 —construir en sitio— y
   * su efecto es que un build fallido **sustituye al bueno**. */
  if (SABOTAJE === "promociona-roto") {
    if (fs.existsSync(DIST_NUEVO)) {
      fs.rmSync(DIST, { recursive: true, force: true });
      fs.renameSync(DIST_NUEVO, DIST);
    } else {
      fs.rmSync(DIST, { recursive: true, force: true });
    }
    log(`⚠⚠ SABOTAJE promociona-roto: promocionado con exit ${r.codigo}`);
    guardaEstado();
    return;
  }

  if (r.codigo !== 0) {
    /* El artefacto a medias se tira: es lo que impide que un fallo se
     * promocione por descuido en una vuelta posterior. `.next` no se ha tocado. */
    fs.rmSync(DIST_NUEVO, { recursive: true, force: true });
    estado.ultimoFallo = {
      cuando: new Date().toISOString(),
      motivo,
      codigo: r.codigo,
      segundos: r.segundos,
      cola: r.cola.split(/\r?\n/).filter(Boolean).slice(-25).join("\n"),
      servido: "el build ANTERIOR sigue servido: no se promocionó nada",
    };
    guardaEstado();
    log(`❌ build #${estado.builds} FALLÓ (exit ${r.codigo}, ${r.segundos}s) — no se promociona`);
    return;
  }

  const buildId = await promociona();
  estado.ultimoExito = {
    cuando: new Date().toISOString(),
    motivo,
    segundos: r.segundos,
    buildId,
    rutas: contarRutas(),
  };
  estado.ultimoFallo = null; // un éxito sí lo limpia; un disparo nuevo, no
  guardaEstado();
  log(`✓ build #${estado.builds} OK (${r.segundos}s) — promocionado ${buildId}`);
}

function contarRutas() {
  const f = path.join(DIST, "prerender-manifest.json");
  if (!fs.existsSync(f)) return null; // ausencia, no cero (§regla 6)
  const m = JSON.parse(fs.readFileSync(f, "utf8"));
  return Object.keys(m.routes || {}).filter((r) => !r.startsWith("/_") && !r.includes(".")).length;
}

/**
 * EL BUCLE COALESCENTE. Es toda la §1 en ocho líneas, y la propiedad que hay
 * que leer es que **`pendiente` se pone a `false` ANTES de construir**: así, un
 * disparo que llegue durante ese build vuelve a marcarlo y provoca otra vuelta.
 * Ponerlo a `false` después perdería justamente los disparos de esa ventana, que
 * son los que el invariante de la §1 obliga a atender.
 */
let corriendo = false;
async function bombea() {
  if (corriendo) return;
  corriendo = true;
  try {
    while (estado.pendiente) {
      const motivo = estado.motivo ?? "(sin motivo)";
      estado.pendiente = false;
      await unaVuelta(motivo);
    }
  } finally {
    corriendo = false;
    estado.fase = "ocioso";
    estado.desde = new Date().toISOString();
    guardaEstado();
  }
}

function dispara(motivo) {
  estado.disparos++;
  /* ⚠ SABOTAJE `politica-descartar`: tirar el disparo que llega durante un
   * build. Es la política que la §1 descarta, y su fallo es justo el que no se
   * ve mirando el recuento de builds: **el invariante**. */
  if (SABOTAJE === "politica-descartar" && (corriendo || estado.pendiente)) {
    estado.coalescidos++;
    guardaEstado();
    return;
  }
  if (estado.pendiente || corriendo) estado.coalescidos++;
  estado.pendiente = true;
  estado.motivo = motivo;
  guardaEstado();
  bombea();
}

/* ══════════════════════════════════════════════════════════════════════════
 * HTTP
 * ═════════════════════════════════════════════════════════════════════════ */
/* ⚠ SABOTAJE `sin-auth`: el endpoint acepta a cualquiera. */
const autorizado = (req) =>
  SABOTAJE === "sin-auth" || req.headers.authorization === `Bearer ${SECRETO}`;

const json = (res, codigo, cuerpo) => {
  res.writeHead(codigo, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(cuerpo, null, 2));
};

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);

  if (req.method === "GET" && url.pathname === "/estado") return json(res, 200, estado);

  if (req.method === "POST" && (url.pathname === "/rebuild" || url.pathname === "/cron")) {
    if (!autorizado(req)) return json(res, 401, { error: "no autorizado" });

    if (url.pathname === "/cron") {
      const r = await publicaVencidos();
      if (!r.publicados.length) return json(res, 200, { disparado: false, ...r });
      dispara(r.motivo);
      return json(res, 202, { disparado: true, ...r, estado });
    }

    let cuerpo = "";
    for await (const c of req) cuerpo += c;
    let motivo = "webhook";
    try {
      const j = JSON.parse(cuerpo || "{}");
      if (j.motivo) motivo = String(j.motivo).slice(0, 200);
    } catch {
      /* cuerpo no-JSON: el motivo se queda en "webhook". No es un dato medido. */
    }
    dispara(motivo);
    return json(res, 202, { encolado: true, estado });
  }

  json(res, 404, { error: "no existe" });
});

/* ══════════════════════════════════════════════════════════════════════════
 * EL CRON — §3 del encargo. La consulta vive aquí, el reloj fuera.
 *
 * Con rebuild-por-webhook **no hay servidor mirando fechas**: lo servido es
 * HTML estático y no sabe qué hora es. Así que la publicación programada es
 * exactamente esto — alguien pregunta cada N minutos *«¿hay algo cuya hora haya
 * pasado y todavía no se haya construido?»* y, si lo hay, dispara un rebuild.
 *
 * ⚠ **La idempotencia del cron NO puede ser la del webhook.** El coalescer
 * impide builds solapados, pero no impide que el cron dispare **otra vez** por
 * el mismo documento en la vuelta siguiente: la consulta seguiría devolviéndolo.
 * De ahí la condición que sí lo cierra, y que es una comparación de instantes y
 * no una marca que haya que escribir en el documento:
 *
 *   > **dispara sólo si existe un documento con `publicarEn` VENCIDO y ese
 *   > instante es POSTERIOR al comienzo del último build promocionado.**
 *
 * Si el último build empezó después de que venciera, ese build ya lo lleva
 * dentro: no hay nada que reconstruir. Es idempotente **sin escribir en la DB**,
 * que es lo que la hace segura de reintentar.
 * ═════════════════════════════════════════════════════════════════════════ */
let payloadCms = null;
async function cms() {
  if (payloadCms) return payloadCms;
  const { getPayload } = await import("payload");
  const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
  payloadCms = await getPayload({ config: await construyeConfig() });
  return payloadCms;
}

/** Las colecciones con `publicarEn`, derivadas de la config — no una lista a mano. */
async function coleccionesProgramables() {
  const p = await cms();
  return p.config.collections
    .filter((c) => c.fields?.some((f) => f.name === "publicarEn"))
    .map((c) => c.slug);
}

/**
 * ⚠ **LA IDEMPOTENCIA DEL CRON ES EL CAMBIO DE ESTADO, no una marca de tiempo.**
 *
 * La primera versión comparaba `publicarEn` con el instante del último build
 * promocionado. Funcionaba y era **frágil por una razón de nivel**: el corte
 * vive en la memoria del publicador, así que un reinicio, un despliegue o dos
 * publicadores lo pierden o lo contradicen, y entonces el mismo documento se
 * «publica» otra vez. Un estado que decide si algo ya pasó **no puede vivir en
 * el proceso que pregunta**.
 *
 * Lo que sí lo cierra es que la publicación **es una transición** y las
 * transiciones sólo ocurren una vez:
 *
 *   > `estado = 'borrador'` **y** `publicarEn <= ahora` ⇒ se pone `publicado` y
 *   > se dispara UN rebuild. La segunda vuelta del cron encuentra **cero**,
 *   > porque ya no hay ninguno en borrador con la hora pasada.
 *
 * Idempotente sin escribir marcas auxiliares, sin memoria en el proceso, y
 * **seguro de reintentar**: es la propiedad que hace que un cron pueda correr
 * cada minuto sin pensar. Y `publicarEn` en el futuro no casa el `where`, que
 * es la otra mitad —la que prueba el negativo.
 */
export async function publicaVencidos(ahora = new Date()) {
  const p = await cms();
  const cols = await coleccionesProgramables();
  if (!cols.length) return { publicados: [], motivo: "ninguna colección declara `publicarEn`" };

  const publicados = [];
  for (const col of cols) {
    const { docs } = await p.find({
      collection: col,
      /* ⚠ SABOTAJE `cron-sin-hora`: publicar todo borrador sin mirar la hora.
       * Es el falsador del PASO 3 — sin él, «el cron publica lo que vence» se
       * cumpliría publicándolo TODO y la sonda no lo distinguiría. */
      where:
        SABOTAJE === "cron-sin-hora"
          ? { estado: { equals: "borrador" } }
          : {
              and: [
                { estado: { equals: "borrador" } },
                { publicarEn: { less_than_equal: ahora.toISOString() } },
              ],
            },
      limit: 0,
      pagination: false,
      depth: 0,
    });
    for (const d of docs) {
      /* El `update` dispara el hook de la colección, que a su vez avisa al
       * publicador. Da igual: el coalescer absorbe N avisos en un build, y el
       * `dispara()` de abajo garantiza que hay uno aunque el hook esté apagado
       * (`PUBLICAR_URL` sin poner, que es el caso normal del cron local). */
      await p.update({ collection: col, id: d.id, data: { estado: "publicado" } });
      publicados.push(`${col}:${d.slug ?? d.id}@${d.publicarEn}`);
    }
  }
  return {
    publicados,
    motivo: publicados.length
      ? `cron · ${publicados.length} publicado(s): ${publicados.slice(0, 5).join(", ")}`
      : `0 borradores con la hora vencida`,
  };
}

servidor.listen(PUERTO, () => {
  estado.ganchos = { PUBLICAR_CMD: CMD, SABOTAJE };
  log(`publicador escuchando en :${PUERTO} · web :${PUERTO_WEB} · gestiona servidor: ${GESTIONA_SERVIDOR}`);
  guardaEstado();
  if (GESTIONA_SERVIDOR && fs.existsSync(path.join(DIST, "BUILD_ID"))) arrancaServidor();
});
