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
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import net from "node:net";
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
 *
 * ⚠⚠ REESCRITO 2026-09-03 (143.ª · B1). LA VERSIÓN ANTERIOR TENÍA EL MECANISMO
 * CABLEADO Y NO FUNCIONABA, Y LOS TRES DEFECTOS ERAN INDEPENDIENTES.
 *
 * Medido por la 142.ª con un monótono de cinco servidores: el del editor llevaba
 * **7 builds** sirviendo el de cinco horas antes (PID 25100, vivo al cerrar).
 * Toda la cadena salía verde menos el último eslabón — el gancho dispara, el
 * build sale `codigo 0`, la promoción deja el `.next` bueno, `GET /estado`
 * publica su `ultimoExito` con sus rutas — **y el sitio no cambiaba nunca**.
 *
 * Los tres defectos, y hay que nombrarlos por separado porque arreglar uno
 * dejaba los otros dos en pie:
 *
 *   1 · **el `kill` mataba al SHELL, no al servidor.** `spawn("npm", …,
 *       {shell:true})` crea en Windows `cmd.exe` → `node`, y `p.kill()` mata el
 *       `cmd.exe`: el `node` sobrevive **con el puerto tomado**. Se arregla en
 *       la CLASE y no en la instancia (§sondas 4) — **no se añade un
 *       `taskkill`: se quita el shell**, y sin shell no hay nieto. Es lo que ya
 *       hicieron `qa/programada.mjs` y `qa/publicar.mjs` en su día;
 *   2 · **el reemplazo moría en silencio** porque su `stdio` era `"ignore"`:
 *       no podía enlazar el puerto que el huérfano retenía, y nadie lo veía.
 *       Ahora va a un LOG. Un fallo que no se ve es el modo que este repo no
 *       acepta, y era el propio `stdio` lo que lo enterraba;
 *   3 · **y nadie comprobaba que el servidor recogiera el build.** Éste es el
 *       que de verdad cierra la clase: con 1 y 2 arreglados el defecto se hace
 *       improbable, con 3 se hace **imposible de repetir en silencio**. Se
 *       verifica **contra lo SERVIDO** (§El principio), no contra el disco.
 *
 * ⚠ Y el 3 es el que ninguna sonda del repo podía dar: `publica-e2e` tiene el
 * invariante `E4·el cambio llega SERVIDO` y lo mide con
 * `rutasEmitidas(leeManifiesto())`, o sea **el `prerender-manifest.json` en
 * disco**. Su verde es cierto de la PROMOCIÓN y mudo sobre el SERVICIO. Además
 * `GESTIONA_SERVIDOR` es falso en las 0 corridas de sonda que ponen
 * `PUBLICAR_SERVIDOR=1`, así que este código **no se ejecutaba en ninguna** —
 * cero instancias separadoras por construcción.
 * ═════════════════════════════════════════════════════════════════════════ */
let servidorWeb = null;

/* El log del servidor. NO es `"ignore"`: el aviso de Next sobre `output:
 * standalone` y cualquier fallo de enlace del puerto salen por aquí, y su
 * ausencia es lo que costó la 142.ª. Se trunca en cada arranque para que lo que
 * se lea sea del servidor vivo y no de otro de hace días (§regla 5, las fugas
 * de los logs: un nombre canónico sin guarda da la corrida de otro día con
 * toda la cara de ser la tuya). */
const LOG_SERVIDOR = path.join(RAIZ, "scripts/publicar/servidor-web.log");

/**
 * El binario de Next, resuelto en el árbol. Se invoca **con `process.execPath`**
 * —o sea el `node` que corre este publicador— y **sin shell**, que es el arreglo
 * del defecto 1: sin `cmd.exe` en medio no hay nieto que sobreviva al `kill`.
 */
const NEXT_BIN = path.join(RAIZ, "node_modules/next/dist/bin/next");

/**
 * ¿Está el puerto libre? La comprobación es **por EFECTO**, no por que el `kill`
 * devuelva (§regla 53): en Windows un `kill` sobre el proceso equivocado
 * devuelve sin error y deja el puerto tomado, que es exactamente el defecto 1.
 */
function puertoLibre(puerto) {
  return new Promise((res) => {
    const s = net.createServer();
    s.once("error", () => res(false));
    s.once("listening", () => s.close(() => res(true)));
    s.listen(puerto, "127.0.0.1");
  });
}

/**
 * Mata el ÁRBOL, no el proceso. `next start` bifurca trabajadores, así que
 * aunque se haya quitado el shell sigue habiendo descendencia — y matar sólo al
 * padre dejaría el mismo defecto con otro nieto.
 */
function mataArbol(pid) {
  if (!pid) return;
  try {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(-pid, "SIGKILL");
  } catch {
    /* ya muerto: no es un fallo, y la comprobación de verdad es `puertoLibre` */
  }
}

/**
 * Para el servidor y **comprueba POR EFECTO que el puerto quedó libre**, que es
 * la mitad que faltaba: en Windows un `kill` sobre el proceso equivocado
 * devuelve sin error y deja el puerto tomado (§regla 53).
 *
 * ⚠ **NO TIRA, y la razón es de nivel (§regla 31).** Un puerto que sigue tomado
 * NO impide promocionar —el artefacto está bien y el rename es correcto—, así
 * que tirar aquí marcaría el build como FALLIDO, que es falso. Se **declara**, y
 * la consecuencia la caza `esperaServido()` con su diagnóstico completo, que es
 * el nivel donde la afirmación *«la publicación llegó al sitio»* vive.
 *
 * Devuelve si el puerto quedó libre, para que `promociona()` lo registre.
 */
async function paraServidor() {
  const p = servidorWeb;
  servidorWeb = null;
  if (p) {
    await new Promise((res) => {
      p.once("exit", () => res());
      mataArbol(p.pid);
      setTimeout(res, 5000).unref();
    });
  }
  if (!GESTIONA_SERVIDOR) return { libre: null };
  for (let i = 0; i < 40; i++) {
    if (await puertoLibre(PUERTO_WEB)) return { libre: true };
    await new Promise((r) => setTimeout(r, 250));
  }
  log(
    `⚠⚠ el puerto :${PUERTO_WEB} sigue TOMADO 10 s después de parar el servidor.\n` +
      `   No es nuestro proceso —acaba de morir con su árbol—: lo tiene OTRO.\n` +
      `   Se promociona igual (el artefacto está bien), pero el servidor nuevo no\n` +
      `   podrá enlazar y la publicación NO llegará al sitio. Libera el puerto o\n` +
      `   cambia PUBLICAR_PUERTO_WEB.`,
  );
  return { libre: false };
}

function arrancaServidor() {
  if (!GESTIONA_SERVIDOR) return;
  /* ⚠ `next start` y NO el servidor del `standalone`, y la razón está MEDIDA
   * (143.ª): `output: "standalone"` produce `.next/standalone/apps/web/server.js`
   * con su config congelada dentro, pero **NO copia `static/` ni `public/`** —
   * comprobado: los dos directorios están ausentes del árbol standalone—. Next
   * documenta que hay que copiarlos a mano, así que usarlo aquí añadiría un paso
   * de copia a CADA promoción y un paso de copia olvidado sirve **páginas sin
   * CSS ni assets**, o sea la salida plausible-y-falsa. El `standalone` es para
   * el contenedor (B4); el publicador local sirve con `next start`, que lee todo
   * de `.next` y de `public/`.
   *
   * Su aviso —*«next start does not work with output: standalone»*,
   * `next/dist/server/next.js:227`— es un `log.warn`, **no un `throw`** (el
   * `throw` de tres líneas más abajo es para `output: "export"`), así que sirve.
   * Y ahora **el aviso se VE**, que es lo que faltaba: va al log de abajo. */
  const fd = fs.openSync(LOG_SERVIDOR, "w");
  const hijo = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PUERTO_WEB)], {
    cwd: APP,
    env: { ...process.env, PORT: String(PUERTO_WEB), NEXT_DIST_DIR: NOMBRE_DIST },
    stdio: ["ignore", fd, fd],
  });
  servidorWeb = hijo;
  /* ⚠ La comparación es contra ESTE hijo, no contra la variable de módulo: si ya
   * hay un relevo arrancado, `servidorWeb` apunta al nuevo y comparar con `null`
   * atribuiría la muerte de éste al otro. Es §*un cardinal es un contenedor*
   * cometido sobre una referencia. */
  hijo.once("exit", (codigo, senal) => {
    if (servidorWeb !== hijo) return; // lo paramos nosotros, o ya hay relevo
    servidorWeb = null;
    estado.ultimoFallo = {
      cuando: new Date().toISOString(),
      motivo: "el servidor web MURIÓ solo",
      codigo,
      senal,
      cola: colaLog(),
      servido: "NADA se está sirviendo en este puerto",
    };
    guardaEstado();
    log(`❌ el servidor web murió (codigo ${codigo}, señal ${senal}) — ver ${LOG_SERVIDOR}`);
  });
  log(`servidor web arrancado en :${PUERTO_WEB} (pid ${hijo.pid}) — log en ${LOG_SERVIDOR}`);
}

/* ⚠⚠ EL GANCHO DE SALIDA, y su ausencia es la otra mitad de cómo la 142.ª acabó
 * con CINCO servidores vivos: sin esto, el publicador al morir deja el suyo
 * huérfano **con el puerto tomado**, y el siguiente publicador se encuentra un
 * servidor que sirve un build de hace horas.
 *
 * `exit` es un aviso y no releva nada. `SIGINT`/`SIGTERM` **sí relevan** la
 * terminación por defecto, así que hay que devolverla explícitamente
 * (§4bis-sexta: *cualquier gancho que RELEVE un comportamiento por defecto tiene
 * que devolver el fallo a su sitio*). Se mata el ÁRBOL de forma síncrona porque
 * en `exit` no queda bucle de eventos donde esperar nada. */
let cerrando = false;
function cierraServidorAlSalir() {
  if (cerrando) return;
  cerrando = true;
  const p = servidorWeb;
  servidorWeb = null;
  if (p) mataArbol(p.pid);
}
process.on("exit", cierraServidorAlSalir);
for (const senal of ["SIGINT", "SIGTERM"]) {
  process.on(senal, () => {
    cierraServidorAlSalir();
    process.exit(senal === "SIGINT" ? 130 : 143); // devuelve la terminación que el gancho relevó
  });
}

/** Las últimas líneas del log del servidor, que es donde vive la causa. */
function colaLog() {
  try {
    return fs.readFileSync(LOG_SERVIDOR, "utf8").split(/\r?\n/).filter(Boolean).slice(-25).join("\n");
  } catch {
    return null;
  }
}

/**
 * ⚠⚠ EL `buildId` **SERVIDO**, que es el único que contesta la pregunta que el
 * editor hace — *«¿cambió el sitio?»*.
 *
 * `estado.ultimoExito.buildId` sale de `.next/BUILD_ID`, o sea **del disco**, y
 * el disco es justo el canal que este defecto NO mueve: la promoción aterriza
 * siempre. Por eso el estado publicaba un verde con su número de rutas mientras
 * el sitio no cambiaba — §*promocionar un artefacto no es servirlo*.
 *
 * El canal es el `buildId` del payload RSC del propio HTML servido, `"b":"<id>"`.
 * Se eligió porque `/_next/static/<id>/` **no aparece** en el HTML de Next 16
 * App Router (comprobado: 0 ocurrencias), así que no hay una segunda cadena que
 * leer; el segundo canal —la resolución de `/_next/static/<id>/_ssgManifest.js`—
 * es un comportamiento de enrutado y lo comprueba la derivación de fuera, no
 * este proceso.
 */
async function buildIdServido() {
  try {
    const r = await fetch(`http://127.0.0.1:${PUERTO_WEB}/`, { redirect: "manual" });
    const html = await r.text();
    const m = /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) || /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Espera a que el servidor sirva EL BUILD QUE ACABAMOS DE PROMOCIONAR, y
 * devuelve qué pasó. **No tira**: quien decide qué hacer con un desacuerdo es
 * `promociona()`, que es quien tiene el estado a mano.
 *
 * ⚠ La comparación es SERVIDO contra DISCO, y ése es el punto: si coinciden, la
 * publicación llegó al sitio; si no, el servidor está anclado a otro build y hay
 * que decirlo **en voz alta**, que es lo que no pasaba.
 */
async function esperaServido(buildIdEnDisco, ms = 60_000) {
  const t0 = Date.now();
  let visto = null;
  while (Date.now() - t0 < ms) {
    visto = await buildIdServido();
    if (visto === buildIdEnDisco) return { ok: true, servido: visto, segundos: +((Date.now() - t0) / 1000).toFixed(2) };
    await new Promise((r) => setTimeout(r, 500));
  }
  return { ok: false, servido: visto, segundos: +((Date.now() - t0) / 1000).toFixed(2) };
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
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ CORREGIDO 2026-08-08 (`qa:publica-e2e`) · LA CURA REINTRODUCÍA LA ENFERMEDAD
 *
 * La frase de arriba —*«la excepción sube y el build se marca fallido»*— era
 * **falsa como estaba implementada**, y de las dos mitades falla la segunda:
 * `dispara()` llama a `bombea()` **sin `await` y sin `catch`**, así que la
 * excepción no subía a ningún sitio — era una **rechazo no capturado** y mataba
 * el proceso. Nadie marcaba nada. Es §sondas 3 (*documentado no es conectado*)
 * dentro del propio publicador.
 *
 * **Y lo que dejaba detrás es lo grave.** La promoción son DOS renames:
 *
 *   1 · `.next` → `.next-anterior`     2 · `.next-nuevo` → `.next`
 *
 * Morir entre los dos deja el árbol **sin `.next`** — que es, palabra por
 * palabra, el modo de fallo que la §2 de este fichero existe para cerrar,
 * reintroducido por la propia cura. Medido dos veces el 2026-08-08, la segunda
 * con el publicador muerto y `.next` ausente durante 7 minutos.
 *
 * Dos renames no se pueden hacer atómicos. Lo que sí se puede es **no dejar la
 * ventana abierta**: si el segundo falla, se deshace el primero y el artefacto
 * que ya se servía vuelve a su sitio antes de propagar el error.
 * ═════════════════════════════════════════════════════════════════════════ */
async function promociona() {
  if (!fs.existsSync(path.join(DIST_NUEVO, "BUILD_ID")))
    throw new Error(
      "el build salió 0 pero `.next-nuevo` no tiene BUILD_ID.\n" +
        "  Un exit 0 sin artefacto es un verde que no se puede cobrar: se rechaza.",
    );
  const { libre } = await paraServidor();
  fs.rmSync(DIST_ANTERIOR, { recursive: true, force: true });

  const apartado = fs.existsSync(DIST);
  if (apartado) fs.renameSync(DIST, DIST_ANTERIOR);
  try {
    fs.renameSync(DIST_NUEVO, DIST);
  } catch (e) {
    /* NO se traga el error (§regla 6): se cierra la ventana y se relanza con la
     * causa dentro, para que `ultimoFallo` diga qué pasó y no sólo que pasó. */
    if (apartado && !fs.existsSync(DIST)) {
      fs.renameSync(DIST_ANTERIOR, DIST);
      log(`⚠ la promoción falló y se ha DESHECHO: \`${NOMBRE_DIST}\` vuelve a ser el de antes`);
    }
    throw new Error(`no se pudo promocionar \`${NOMBRE_DIST}-nuevo\` → \`${NOMBRE_DIST}\`: ${e.message}`);
  }
  arrancaServidor();
  const buildId = fs.readFileSync(path.join(DIST, "BUILD_ID"), "utf8").trim();

  /* ⚠⚠ Y AQUÍ LA MITAD QUE FALTABA, que es la que convierte el defecto de la
   * 142.ª en imposible-de-repetir-en-silencio en vez de sólo improbable:
   * **comprobar que el servidor sirve el build que acabamos de promocionar.**
   *
   * Sin esto, `promociona()` devolvía el `BUILD_ID` **del disco** y el estado lo
   * publicaba como si fuera lo servido. Los dos números son ciertos y sólo uno
   * contesta la pregunta del editor. §*promocionar un artefacto no es servirlo*.
   *
   * Si el publicador NO gestiona el servidor, no hay nada que comprobar y se
   * declara —`null` es ausencia, no un verde (§regla 6)—: quien despliegue es
   * quien tiene que recoger la promoción, y el estado lo dice. */
  if (!GESTIONA_SERVIDOR) return { buildId, servido: null, notaServido: "el publicador no gestiona el servidor: nadie ha comprobado lo servido" };

  const v = await esperaServido(buildId);
  if (!v.ok) {
    /* No se tira: el artefacto ESTÁ promocionado y tirar aquí lo daría por
     * fallido, que es falso. Lo que se hace es lo contrario de lo que pasaba —
     * decirlo, con los dos lados del par y su diagnóstico. */
    log(
      `❌❌ PROMOCIONADO ${buildId} PERO EL SERVIDOR SIRVE ${v.servido ?? "NADA"} ` +
        `tras ${v.segundos}s — la publicación NO ha llegado al sitio`,
    );
    estado.ultimoFallo = {
      cuando: new Date().toISOString(),
      motivo: "el servidor NO recogió la promoción",
      buildIdEnDisco: buildId,
      buildIdServido: v.servido,
      segundos: v.segundos,
      /* el puerto quedó libre o no: es lo que separa «el servidor nuevo no pudo
       * enlazar» de «enlazó y sirve otro build», que son dos causas distintas
       * con dos arreglos distintos */
      puertoQuedoLibre: libre,
      cola: colaLog(),
      servido:
        v.servido === null
          ? "el servidor no contesta: mira el log del servidor web"
          : `se sigue sirviendo ${v.servido}, o sea un build ANTERIOR`,
    };
    guardaEstado();
  }
  return { buildId, servido: v.servido, segundosHastaServido: v.ok ? v.segundos : null };
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

  const { buildId, servido, segundosHastaServido, notaServido } = await promociona();
  /* ⚠ `buildId` es el del DISCO y `buildIdServido` el que el sitio devuelve. Se
   * publican **los dos**, porque un par se cita con sus dos lados o no se cita
   * (§sondas 1): `9SKeO…` a secas no se puede leer mal, y era exactamente lo que
   * el estado publicaba mientras el sitio no cambiaba. */
  estado.ultimoExito = {
    cuando: new Date().toISOString(),
    motivo,
    segundos: r.segundos,
    buildId,
    buildIdServido: servido,
    llegoAlSitio: notaServido ? null : servido === buildId,
    segundosHastaServido: segundosHastaServido ?? null,
    ...(notaServido ? { notaServido } : {}),
    rutas: contarRutas(),
  };
  /* Un éxito limpia el fallo — **salvo el que `promociona()` acaba de escribir**
   * porque el servidor no recogió la promoción. Limpiarlo aquí sería enterrar el
   * hallazgo justo después de encontrarlo, que es §regla 6 con el objeto puesto
   * en el propio estado. */
  if (notaServido || servido === buildId) estado.ultimoFallo = null;
  guardaEstado();
  log(
    `✓ build #${estado.builds} OK (${r.segundos}s) — promocionado ${buildId}` +
      (notaServido
        ? " · servido SIN COMPROBAR (el publicador no gestiona el servidor)"
        : servido === buildId
          ? ` · SERVIDO en ${segundosHastaServido}s`
          : ` · ⚠ SERVIDO sigue siendo ${servido ?? "NADA"}`),
  );
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
  } catch (e) {
    /* ⚠ **UN PUBLICADOR QUE SE MUERE ES UN WEBHOOK QUE FALLA EN SILENCIO**, que
     * es justo lo que la §3 de este fichero dice que no puede pasar — sólo que
     * peor, porque además se lleva el `GET /estado` con el que quien publicó
     * iba a enterarse.
     *
     * Esto NO es tragarse el error (§regla 6): el error **cambia de canal** y
     * el canal de destino es el que el editor ya tiene que mirar. Se escribe en
     * `ultimoFallo` con su causa, se grita por stderr, y `ultimoFallo` NO se
     * borra hasta que un build termine bien.
     *
     * Antes de esto, `dispara()` llamaba a `bombea()` sin `await` y sin
     * `catch`: cualquier throw de `promociona()` era un rechazo no capturado y
     * mataba el proceso. Medido dos veces el 2026-08-08 con `qa:publica-e2e`. */
    estado.ultimoFallo = {
      cuando: new Date().toISOString(),
      motivo: estado.motivo ?? "(sin motivo)",
      codigo: null,
      donde: "promoción",
      cola: String(e?.stack || e?.message || e),
    };
    log(`❌❌ el bucle de build REVENTÓ y el publicador sigue vivo a propósito: ${e?.message || e}`);
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

/**
 * ── LA VENTANA DE LA PROMOCIÓN, y NO es teórica: se midió cayendo dentro ──
 *
 * La cabecera de `promociona()` dice que un `rename` en el mismo volumen es
 * atómico. Es cierto **de un rename**, y la promoción hace **dos**:
 *
 *   1 · `.next` → `.next-anterior`
 *   2 · `.next-nuevo` → `.next`
 *
 * Entre los dos hay un instante en el que **`.next` no existe**. Morir ahí no
 * deja el sitio desactualizado: lo deja **sin sitio** — que es exactamente el
 * modo de fallo que toda la §2 de este fichero viene a cerrar, reintroducido
 * por la propia cura.
 *
 * > **Medido el 2026-08-08 en la corrida de `qa:publica-e2e`:** la sonda murió
 * > por un `ECONNRESET` mientras el publicador promocionaba el build #2, y el
 * > árbol quedó con `.next` **ausente**, `.next-anterior` = build #1 (32 rutas)
 * > y `.next-nuevo` = build #2 (31 rutas). No se perdió nada, pero **hacía falta
 * > una persona** para saber cuál de los dos era el bueno.
 *
 * Dos renames no se pueden hacer atómicos, así que lo que se añade no es una
 * garantía de que la ventana no exista —existe— sino **que salir de ella no
 * dependa de nadie**: al arrancar, si falta `DIST` y hay un `DIST_NUEVO`
 * completo, se termina la promoción que se quedó a medias; y si no lo hay, se
 * devuelve el anterior. Se GRITA en los dos casos: un arranque que repara algo
 * en silencio es un fallo que nadie investiga.
 */
function reparaPromocionAMedias() {
  if (fs.existsSync(path.join(DIST, "BUILD_ID"))) return;

  const nuevoOk = fs.existsSync(path.join(DIST_NUEVO, "BUILD_ID"));
  const anteriorOk = fs.existsSync(path.join(DIST_ANTERIOR, "BUILD_ID"));
  if (!nuevoOk && !anteriorOk) {
    log(`⚠ no hay artefacto: ni ${NOMBRE_DIST}, ni -nuevo, ni -anterior. Hace falta un build.`);
    return;
  }

  /* El nuevo gana: si existe entero, el build que lo produjo salió 0 —es la
   * única forma de que `promociona()` llegue a renombrar— así que terminar la
   * promoción es lo que iba a pasar. El anterior es el respaldo. */
  const origen = nuevoOk ? DIST_NUEVO : DIST_ANTERIOR;
  fs.renameSync(origen, DIST);
  const buildId = fs.readFileSync(path.join(DIST, "BUILD_ID"), "utf8").trim();
  estado.reparado = { cuando: new Date().toISOString(), desde: path.basename(origen), buildId };
  log(
    `⚠⚠ PROMOCIÓN A MEDIAS REPARADA — \`${NOMBRE_DIST}\` no existía y se ha restaurado desde ` +
      `\`${path.basename(origen)}\` (${buildId}). El proceso anterior murió entre los dos renames.`,
  );
}

servidor.listen(PUERTO, () => {
  estado.ganchos = { PUBLICAR_CMD: CMD, SABOTAJE };
  log(`publicador escuchando en :${PUERTO} · web :${PUERTO_WEB} · gestiona servidor: ${GESTIONA_SERVIDOR}`);
  reparaPromocionAMedias();
  guardaEstado();
  if (GESTIONA_SERVIDOR && fs.existsSync(path.join(DIST, "BUILD_ID"))) arrancaServidor();
});
