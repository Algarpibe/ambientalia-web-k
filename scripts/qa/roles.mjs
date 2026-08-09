/**
 * LOS ROLES DEL ADMIN, EJERCITADOS — F2-5 · ADMIN + EDITOR (firmados por el
 * propietario).
 *
 * Uso:  npm run qa:roles                 (necesita el Postgres del CMS vivo)
 *       SABOTAJE=<caso> …                → `npm run qa:roles-neg`
 *
 * ── Por qué por Local API y no contra el admin en el navegador ────────────
 * `overrideAccess: false` + `user` hace que la Local API aplique EXACTAMENTE
 * las mismas funciones de `acceso.ts` que guardan el REST del admin — el
 * objeto medido es el control de acceso, no el formulario. Lo que el
 * navegador añade (que el menú esconda `usuarios` a un editor) es cosmética
 * declarada como tal en la colección; el invariante es el acceso, y es esto.
 *
 * ── Los OCHO invariantes ──────────────────────────────────────────────────
 *
 * | # | invariante | por qué importa |
 * |---|---|---|
 * | R1 | un EDITOR crea y edita CONTENIDO | el rol existe para esto; si no puede, el rol «seguro» ha roto el trabajo |
 * | R2 | un editor NO crea usuarios | la mitad «SIN usuarios» del encargo |
 * | R3 | un editor sólo SE VE a sí mismo | la lista de usuarios es información de administración |
 * | R4 | un editor NO se cambia el rol, y CAE CON MENSAJE | la escalada tiene que fallar por su invariante, no descartarse en silencio |
 * | R5 | el registro `slugs` está CERRADO por API (admin incluido) y lo siguen escribiendo los hooks | estado derivado: editarlo a mano lo desincroniza (§4) |
 * | R6 | un ADMIN gestiona usuarios | la otra mitad del modelo; sin esto R2 sería «nadie puede» |
 * | R7 | el hook del WEBHOOK dispara igual con sesión de editor | «no distingue quién guarda» estaba SUPUESTO; aquí se mide (encargo F2-5 PASO 1) |
 * | R8 | la COLISIÓN de slug cae igual bajo editor | las guardas de F2-4/§4 no pueden depender del rol |
 *
 * ── Los sabotajes, cada uno por SU invariante (`qa:roles-neg`) ────────────
 *   · `sin-acceso`     — el acceso de `usuarios` y `slugs` vuelve al defecto
 *                        «cualquier autenticado» ⇒ rompe **R2, R3 y R5**;
 *   · `sin-guarda-rol` — se le quita el `beforeChange` a `usuarios` ⇒ la
 *                        escalada entra ⇒ rompe **R4**;
 *   · CONTROL          — sin sabotaje, los ocho pasan.
 *
 * ⚠ Esta sonda ESCRIBE en la DB compartida: todo lleva la marca del pid y la
 * limpieza del `finally` se COMPRUEBA contra los recuentos de antes.
 */
import { createServer } from "node:http";
import { Evaluadas, env, gritaSiRevienta, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = env("SABOTAJE", "");
const SABOTAJES = ["sin-acceso", "sin-guarda-rol"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");

const config = await construyeConfig();

/* Los sabotajes van sobre la config RESUELTA — la que Payload va a usar —, y
 * uno que no encuentre su objetivo TIRA (un sabotaje inerte fabrica un
 * negativo aprobado sin haber ejercitado nada). Mismo patrón que `cms-slugs`. */
const coleccion = (slug) => {
  const c = config.collections.find((x) => x.slug === slug);
  if (!c) throw new Error(`SABOTAJE ${SABOTAJE}: la colección '${slug}' no existe`);
  return c;
};
if (SABOTAJE === "sin-acceso") {
  console.error("⚠⚠ SABOTAJE=sin-acceso: usuarios y slugs vuelven a «cualquier autenticado»");
  const autenticado = ({ req }) => Boolean(req.user);
  for (const slug of ["usuarios", "slugs"])
    coleccion(slug).access = {
      read: autenticado,
      create: autenticado,
      update: autenticado,
      delete: autenticado,
      unlock: autenticado,
    };
}
if (SABOTAJE === "sin-guarda-rol") {
  console.error("⚠⚠ SABOTAJE=sin-guarda-rol: usuarios pierde su beforeChange (la guarda de la escalada)");
  const u = coleccion("usuarios");
  if (!u.hooks?.beforeChange?.length)
    throw new Error("SABOTAJE sin-guarda-rol: no hay beforeChange que quitar — el sabotaje sería inerte");
  u.hooks.beforeChange = [];
}

const payload = await getPayload({ config });

const MARCA = `qa-roles-${process.pid}`;
const CLAVE = `${MARCA}-clave-de-prueba`;
const SLUG = `${MARCA}-entrada`;

/** El objeto que la Local API espera en `user`: el documento + su colección. */
const como = (doc) => ({ ...doc, collection: "usuarios" });

const cuentaUsuarios = async () => (await payload.count({ collection: "usuarios" })).totalDocs;
const cuentaEntradas = async () => (await payload.count({ collection: "entradas-blog" })).totalDocs;
const USUARIOS_ANTES = await cuentaUsuarios();
const ENTRADAS_ANTES = await cuentaEntradas();

const INVARIANTES = [
  "R1·un editor crea y edita CONTENIDO",
  "R2·un editor NO crea usuarios",
  "R3·un editor sólo SE VE a sí mismo",
  "R4·un editor NO se cambia el rol, y cae con mensaje",
  "R5·el registro `slugs` está cerrado por API y lo escriben los hooks",
  "R6·un admin gestiona usuarios",
  "R7·el webhook dispara igual con sesión de editor",
  "R8·la colisión de slug cae igual bajo editor",
];
const ev = new Evaluadas({ unidad: "invariantes", minimo: INVARIANTES.length, nombre: "roles" });
const resultados = {};
let violados = 0;
const pasa = (i, d) => { resultados[i] = { ok: true, detalle: d }; ev.ok(); console.log(`  ✓ ${i} — ${d}`); };
const falla = (i, d) => { resultados[i] = { ok: false, detalle: d }; violados++; ev.ok(); console.log(`  ✗ ${i} — ${d}`); };

/** Ejecuta esperando el rechazo; devuelve el error o `null` si (mal) pasó. */
async function rechaza(fn) {
  try {
    await fn();
    return null;
  } catch (e) {
    return e;
  }
}

console.log(`\n════════ ROLES · admin + editor · marca ${MARCA} ════════\n`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}\n`);

let admin = null;
let editor = null;
let entrada = null;
let receptor = null;

try {
  /* Los dos usuarios de la prueba, por Local API SIN usuario (los procesos
   * pueden poner roles — es como se crearía un primer admin por script). */
  admin = await payload.create({
    collection: "usuarios",
    data: { email: `${MARCA}-admin@qa.local`, password: CLAVE, nombre: `${MARCA} admin`, rol: "admin" },
  });
  editor = await payload.create({
    collection: "usuarios",
    data: { email: `${MARCA}-editor@qa.local`, password: CLAVE, nombre: `${MARCA} editor`, rol: "editor" },
  });

  /* R1 · contenido: el editor da de alta una entrada (forma clonada de una
   * real, como `publica-e2e`) y la edita. Borrador: nada servido depende. */
  {
    const { docs } = await payload.find({ collection: "entradas-blog", limit: 1, depth: 0, sort: "id" });
    if (!docs[0]) throw new Error("no hay ninguna entrada de blog de la que copiar la forma — ¿DB sin sembrar?");
    const err = await rechaza(async () => {
      entrada = await payload.create({
        collection: "entradas-blog",
        data: { ...docs[0], id: undefined, slug: SLUG, titulo: `ROLES ${SLUG}`, estado: "borrador", publicarEn: null },
        user: como(editor),
        overrideAccess: false,
      });
      await payload.update({
        collection: "entradas-blog",
        id: entrada.id,
        data: { titulo: `ROLES ${SLUG} · editada` },
        user: como(editor),
        overrideAccess: false,
      });
    });
    if (!err) pasa(INVARIANTES[0], `alta y edición de \`${SLUG}\` con sesión de editor`);
    else falla(INVARIANTES[0], `el editor no pudo con el contenido: ${err.message}`);
  }

  /* R2 · usuarios: el alta tiene que CAER. */
  {
    const err = await rechaza(() =>
      payload.create({
        collection: "usuarios",
        data: { email: `${MARCA}-intruso@qa.local`, password: CLAVE, rol: "editor" },
        user: como(editor),
        overrideAccess: false,
      }),
    );
    if (err) pasa(INVARIANTES[1], `rechazado: ${err.message.slice(0, 60)}`);
    else falla(INVARIANTES[1], "un EDITOR creó un usuario — el acceso no está cableado");
  }

  /* R3 · la lista: como editor sólo puede salir él. */
  {
    const { docs } = await payload.find({
      collection: "usuarios",
      pagination: false,
      depth: 0,
      user: como(editor),
      overrideAccess: false,
    });
    const ids = docs.map((d) => d.id);
    if (ids.length === 1 && ids[0] === editor.id) pasa(INVARIANTES[2], `find usuarios como editor ⇒ 1 doc, él mismo`);
    else falla(INVARIANTES[2], `find usuarios como editor ⇒ ${ids.length} docs (esperaba sólo el suyo)`);
  }

  /* R4 · la escalada: tiene que TIRAR con su mensaje, y el rol no moverse. */
  {
    const err = await rechaza(() =>
      payload.update({
        collection: "usuarios",
        id: editor.id,
        data: { rol: "admin" },
        user: como(editor),
        overrideAccess: false,
      }),
    );
    const despues = await payload.findByID({ collection: "usuarios", id: editor.id, depth: 0 });
    if (err && /SOLO UN ADMIN CAMBIA ROLES/.test(err.message) && despues.rol === "editor")
      pasa(INVARIANTES[3], `cae con su mensaje y el rol sigue \`editor\``);
    else if (!err && despues.rol === "admin") falla(INVARIANTES[3], "el editor SE HIZO ADMIN — la guarda no existe");
    else if (!err) falla(INVARIANTES[3], `no tiró (rol quedó \`${despues.rol}\`): un descarte en silencio no es una guarda`);
    else falla(INVARIANTES[3], `tiró pero no por su invariante: ${err.message.slice(0, 80)}`);
  }

  /* R5 · el registro: cerrado por API para TODOS, y vivo por los hooks. */
  {
    const errAdmin = await rechaza(() =>
      payload.create({
        collection: "slugs",
        data: { slug: `${MARCA}-a-mano`, familia: "qa" },
        user: como(admin),
        overrideAccess: false,
      }),
    );
    const errEditor = await rechaza(() =>
      payload.create({
        collection: "slugs",
        data: { slug: `${MARCA}-a-mano-2`, familia: "qa" },
        user: como(editor),
        overrideAccess: false,
      }),
    );
    /* …y la mitad viva: el alta de R1 tiene que haber dejado su registro. */
    const { totalDocs: registrado } = await payload.count({
      collection: "slugs",
      where: { slug: { equals: SLUG } },
    });
    if (errAdmin && errEditor && registrado === 1)
      pasa(INVARIANTES[4], `admin y editor rechazados · el hook registró \`${SLUG}\` (1 fila)`);
    else
      falla(
        INVARIANTES[4],
        `admin ${errAdmin ? "rechazado" : "ESCRIBIÓ"} · editor ${errEditor ? "rechazado" : "ESCRIBIÓ"} · registro del alta: ${registrado} filas`,
      );
  }

  /* R6 · el admin gestiona: alta, cambio de rol ajeno y baja. */
  {
    const err = await rechaza(async () => {
      const tercero = await payload.create({
        collection: "usuarios",
        data: { email: `${MARCA}-tercero@qa.local`, password: CLAVE, rol: "editor" },
        user: como(admin),
        overrideAccess: false,
      });
      const subido = await payload.update({
        collection: "usuarios",
        id: tercero.id,
        data: { rol: "admin" },
        user: como(admin),
        overrideAccess: false,
      });
      if (subido.rol !== "admin") throw new Error(`el cambio de rol no se aplicó (quedó \`${subido.rol}\`)`);
      await payload.delete({ collection: "usuarios", id: tercero.id, user: como(admin), overrideAccess: false });
    });
    if (!err) pasa(INVARIANTES[5], "alta, ascenso y baja de un tercero con sesión de admin");
    else falla(INVARIANTES[5], `el admin no pudo gestionar usuarios: ${err.message.slice(0, 80)}`);
  }

  /* R7 · el webhook bajo sesión de editor: receptor propio, un guardado, UN
   * disparo con su Bearer. El hook espera su fetch (`await avisa`), así que al
   * volver el update el aviso ya llegó — el margen es por cortesía. */
  {
    const avisos = [];
    receptor = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/rebuild")
        avisos.push({ auth: req.headers.authorization ?? null });
      res.end("ok");
    });
    await new Promise((r) => receptor.listen(0, "127.0.0.1", r));
    const puerto = receptor.address().port;
    process.env.PUBLICAR_URL = `http://127.0.0.1:${puerto}`;
    process.env.PUBLICAR_SECRETO = `${MARCA}-secreto`;
    await payload.update({
      collection: "entradas-blog",
      id: entrada.id,
      data: { titulo: `ROLES ${SLUG} · webhook` },
      user: como(editor),
      overrideAccess: false,
    });
    await new Promise((r) => setTimeout(r, 300));
    delete process.env.PUBLICAR_URL;
    delete process.env.PUBLICAR_SECRETO;
    const buenos = avisos.filter((a) => a.auth === `Bearer ${MARCA}-secreto`).length;
    if (avisos.length === 1 && buenos === 1)
      pasa(INVARIANTES[6], "1 guardado de editor ⇒ 1 disparo con su credencial");
    else falla(INVARIANTES[6], `${avisos.length} aviso(s), ${buenos} con credencial (esperaba 1 y 1)`);
  }

  /* R8 · la colisión ENTRE familias cae igual con sesión de editor: el mismo
   * slug de la entrada de R1, desde `terminos-kunakpedia`. */
  {
    const { docs } = await payload.find({ collection: "terminos-kunakpedia", limit: 1, depth: 0, sort: "id" });
    if (!docs[0]) throw new Error("no hay ningún término del que copiar la forma — ¿DB sin sembrar?");
    const err = await rechaza(() =>
      payload.create({
        collection: "terminos-kunakpedia",
        data: { ...docs[0], id: undefined, slug: SLUG, titulo: `ROLES colisión`, estado: "borrador", publicarEn: null },
        user: como(editor),
        overrideAccess: false,
      }),
    );
    if (err) pasa(INVARIANTES[7], `la colisión con \`${SLUG}\` cayó: ${err.message.slice(0, 60)}`);
    else falla(INVARIANTES[7], "la colisión ENTRÓ bajo sesión de editor — la guarda del §4 depende del rol");
  }
} finally {
  /* La limpieza se comprueba, no se supone. El borrado va sin usuario (Local
   * API con overrideAccess por defecto): limpiar no es parte del modelo. */
  delete process.env.PUBLICAR_URL;
  delete process.env.PUBLICAR_SECRETO;
  if (receptor) await new Promise((r) => receptor.close(r));
  const { docs: sobras } = await payload.find({
    collection: "entradas-blog",
    where: { slug: { equals: SLUG } },
    limit: 10,
    depth: 0,
  });
  for (const d of sobras) await payload.delete({ collection: "entradas-blog", id: d.id });
  const { docs: usuariosQa } = await payload.find({
    collection: "usuarios",
    where: { email: { like: `${MARCA}-` } },
    limit: 10,
    depth: 0,
  });
  for (const u of usuariosQa) await payload.delete({ collection: "usuarios", id: u.id });
  const usuariosFinal = await cuentaUsuarios();
  const entradasFinal = await cuentaEntradas();
  console.log(
    `\n  · limpieza: usuarios ${usuariosFinal} (era ${USUARIOS_ANTES}) · entradas ${entradasFinal} (era ${ENTRADAS_ANTES})`,
  );
  if (usuariosFinal !== USUARIOS_ANTES || entradasFinal !== ENTRADAS_ANTES) {
    violados++;
    console.error("❌ la sonda dejó residuo en la DB compartida");
  }
  await payload.db.destroy?.();
}

w(
  env("SALIDA") || "medidas/roles.json",
  { meta: { fecha: hoy(), sabotaje: SABOTAJE || null, marca: MARCA }, invariantes: resultados },
  { pisar: !!SABOTAJE },
);

const noEvaluados = ev.informe();
console.log(
  violados === 0
    ? `\n✅ roles: los ${INVARIANTES.length} invariantes se cumplen — editor = contenido y publicación; usuarios y sistema, del admin`
    : `\n❌ ${violados} invariante(s) violado(s)`,
);
process.exitCode = violados === 0 && noEvaluados === 0 ? 0 : 1;

/**
 * ⚠ **EL VIGILANTE — el de `publica-e2e`, y por la misma factura.** El pool de
 * Payload mantiene vivo el bucle aunque `db.destroy()` haya corrido (medido en
 * la primera corrida de esta sonda: 8/8 impreso y el proceso vivo a los 300 s).
 * Suelto es molesto; dentro de `corridaNegativa` —`spawnSync` con timeout— son
 * minutos por caso y un `exit null` que el negativo lee como fallo del control.
 * `unref()`: si el bucle drena solo, nunca dispara. Va con todos los `fetch` y
 * la limpieza ya hechos, así que la carrera de §F2-3-EXIT-FETCH no existe aquí.
 */
setTimeout(() => {
  console.error("⚠ el bucle no drenó en 2 s (pool aún referenciado): se sale con el código ya calculado");
  process.exit(process.exitCode ?? 0);
}, 2000).unref();
