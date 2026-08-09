/**
 * LA PRUEBA FINAL DE F2-5, ENTERA Y REPETIBLE — el editor da de alta las DOS
 * familias y el sitio se reconstruye con ellas dentro.
 *
 * Uso:  npm run qa:f25-final        (necesita Postgres del CMS · construye)
 *       SABOTAJE=<caso> …           → `npm run qa:f25-final-neg`
 *
 * ── Por qué esto existe como SONDA y no como acta de una sesión ───────────
 * La prueba final de la 40.ª tanda se hizo **a mano** y paró en el escalón. Su
 * evidencia quedó congelada, pero **no se podía volver a correr**: cada
 * re-verificación habría sido otra sesión manual, con otro criterio. Y el
 * hallazgo que la paró —una entrada sin etiquetas mata el render— es
 * exactamente el tipo de cosa que hay que poder re-preguntar después de tocar
 * la proyección.
 *
 * Es además la regla 3 del catálogo aplicada a una prueba: *documentado no es
 * conectado*. Un acta que dice «el editor pudo» no vuelve a comprobar nada.
 *
 * ── Los SEIS invariantes, y por qué ninguno sobra ─────────────────────────
 *
 * | # | invariante | qué se cae si falta |
 * |---|---|---|
 * | P1 | el EDITOR da de alta una entrada **sin etiquetas, sin imagen y sin extracto** | es el caso del escalón: los tres opcionales a la vez |
 * | P2 | el EDITOR da de alta un **producto** con padre | la mitad que NO corrió en la 40.ª — §F2-3-HREF-DERIVADO |
 * | P3 | las guardas de entrada las **acogen**: esquema · slug registrado · webhook con SU sesión | si rechazan, la fase no entrega lo que promete |
 * | P4 | **`next build` sobrevive** y emite las dos rutas nuevas | el escalón murió aquí: `undefined.length`, exit 1 |
 * | P5 | el eje `href` **cubre el producto nuevo** y no lo cuenta como coincidente | un producto del admin no tiene dato medido: «no lo pude comparar» ≠ «coincide» |
 * | P6 | deshecho el alta y reconstruido, el artefacto **vuelve a las rutas de antes** | sin esto la prueba deja el sitio distinto y nadie lo sabría |
 *
 * ── Lo que esta sonda NO cubre, dicho antes de que nadie lo suponga ───────
 * · **la promoción del publicador** — la cubre `qa:publica-e2e` (4/4) y
 *   repetirla aquí sería medir dos veces lo mismo con la mitad del rigor;
 * · **el Δ0 del artefacto** — es de `clon-base`/`html-cmp`, que se corren
 *   aparte; aquí sólo se comprueba que el CONJUNTO de rutas vuelve a su sitio;
 * · **el navegador** — igual que `qa:roles`: el objeto medido es el acceso y el
 *   render, no el formulario.
 *
 * ⚠ **ESCRIBE en la DB compartida y CONSTRUYE.** Todo lleva la marca del pid,
 * la limpieza se COMPRUEBA contra los recuentos de antes, y no se puede correr
 * con otra sonda en vuelo (la regla de siempre: un build en marcha le cambia
 * el `.next` por debajo a quien esté midiendo).
 */
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { APP, enApp, env, Evaluadas, gritaSiRevienta, hoy, leeManifiesto, nombreNeg, rutasEmitidas, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // esta sonda construye a propósito: la guarda de BUILD_ID no aplica
gritaSiRevienta();

const SABOTAJE = env("SABOTAJE", "");
const SABOTAJES = {
  "sin-guarda-render": "se salta la comprobación del build ⇒ P4 no mide nada y la sonda tiene que decirlo",
  "href-no-cubre":
    "el eje `href` se corre con la regla desactivada ⇒ el producto DEL ADMIN tiene que salir entre los defectos. Si no aparece, es que el eje no lo mira",
  "sin-limpieza": "no se deshace el alta ⇒ P6 tiene que acusar que el artefacto no volvió",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const config = await construyeConfig();
const payload = await getPayload({ config });

const MARCA = `qa-f25-${process.pid}`;
const CLAVE = `${MARCA}-clave-de-prueba`;
const SLUG_ENTRADA = `${MARCA}-entrada-sin-etiquetas`;
const SLUG_PRODUCTO = `${MARCA}-producto`;
const como = (doc) => ({ ...doc, collection: "usuarios" });

const INVARIANTES = [
  "P1·el editor da de alta una entrada SIN etiquetas, SIN imagen y SIN extracto",
  "P2·el editor da de alta un PRODUCTO con padre",
  "P3·las guardas de entrada la acogen (esquema · slug · webhook con SU sesión)",
  "P4·`next build` sobrevive y emite las dos rutas nuevas",
  "P5·el eje `href` cubre el producto nuevo y NO lo cuenta como coincidente",
  "P6·deshecho el alta y reconstruido, el artefacto vuelve a las rutas de antes",
];
const ev = new Evaluadas({ unidad: "invariantes", minimo: INVARIANTES.length, nombre: "f25-final" });
const resultados = {};
let violados = 0;
const pasa = (i, d) => { resultados[i] = { ok: true, detalle: d }; ev.ok(); console.log(`  ✓ ${i}\n      ${d}`); };
const falla = (i, d) => { resultados[i] = { ok: false, detalle: d }; violados++; ev.ok(); console.log(`  ✗ ${i}\n      ${d}`); };

const cuenta = async (c) => (await payload.count({ collection: c })).totalDocs;
const ANTES = {
  usuarios: await cuenta("usuarios"),
  "entradas-blog": await cuenta("entradas-blog"),
  productos: await cuenta("productos"),
};

/** `next build` en `apps/web`. Devuelve `{ ok, codigo, cola }`. */
function construye(etiqueta) {
  console.log(`\n  ── construyendo (${etiqueta}) …`);
  const t = Date.now();
  const r = spawnSync("npm", ["run", "build", "-w", "web"], {
    cwd: APP.replace(/[\\/]apps[\\/]web[\\/]?$/, ""),
    encoding: "utf8",
    shell: true,
    timeout: 900_000,
  });
  const seg = ((Date.now() - t) / 1000).toFixed(2);
  const salida = (r.stdout || "") + (r.stderr || "");
  console.log(`     exit ${r.status} en ${seg}s`);
  return { ok: r.status === 0, codigo: r.status, seg: Number(seg), cola: salida.slice(-1600) };
}

const rutasDelArtefacto = () => new Set(rutasEmitidas(leeManifiesto(APP)));
const RUTAS_ANTES = rutasDelArtefacto();

console.log(`\n════════ PRUEBA FINAL DE F2-5 · alta del EDITOR en las DOS familias · marca ${MARCA} ════════`);
console.log(`  artefacto de partida: ${RUTAS_ANTES.size} rutas\n`);

let admin = null, editor = null, entrada = null, producto = null, receptor = null;
const disparos = [];
const evidencia = { rutasAntes: RUTAS_ANTES.size, builds: {} };

try {
  /* Los dos usuarios, por Local API SIN usuario — como se crearía el primer
   * admin por script. Sólo el EDITOR toca el contenido a partir de aquí. */
  admin = await payload.create({
    collection: "usuarios",
    data: { email: `${MARCA}-admin@qa.local`, password: CLAVE, nombre: `${MARCA} admin`, rol: "admin" },
  });
  editor = await payload.create({
    collection: "usuarios",
    data: { email: `${MARCA}-editor@qa.local`, password: CLAVE, nombre: `${MARCA} editor`, rol: "editor" },
  });

  /* El receptor del webhook: se levanta ANTES de las altas, para que P3 pueda
   * contar disparos con la credencial de quien guardó (R7 de `qa:roles`). */
  receptor = createServer((req, res) => {
    let cuerpo = "";
    req.on("data", (c) => (cuerpo += c));
    req.on("end", () => {
      if (req.method === "POST") disparos.push({ url: req.url, auth: req.headers.authorization ?? null, cuerpo: cuerpo.slice(0, 400) });
      res.end("ok");
    });
  });
  await new Promise((r) => receptor.listen(0, "127.0.0.1", r));
  process.env.PUBLICAR_URL = `http://127.0.0.1:${receptor.address().port}`;
  /* ⚠ Las DOS variables o ninguna: con `PUBLICAR_URL` puesta y el secreto sin
   * poner, el hook avisa —y lo GRITA— de que cada aviso daría 401, así que no
   * dispara. La primera corrida de esta sonda cayó justo ahí: **P3 en rojo por
   * un defecto de la sonda, no del producto**, con el motivo impreso en su
   * propia salida (§sondas 1: lo que se imprime y lo que se cuenta no pueden
   * discrepar — aquí discrepaban en el sentido contrario, y el grito ganó). */
  process.env.PUBLICAR_SECRETO = `${MARCA}-secreto`;

  /* ── P1 · la entrada del ESCALÓN ────────────────────────────────────────
   * Se compone a mano y NO copiando una fila existente: copiar traería las
   * etiquetas de la copiada, que es justo lo que hay que NO tener. Los tres
   * opcionales se omiten a la vez, como hizo el editor de la 40.ª. */
  {
    const { docs: cats } = await payload.find({ collection: "categorias", limit: 1, depth: 0, sort: "id" });
    if (!cats[0]) throw new Error("no hay ninguna `categorias` — ¿DB sin sembrar?");
    try {
      entrada = await payload.create({
        collection: "entradas-blog",
        data: {
          slug: SLUG_ENTRADA,
          seo: { title: `Prueba final F2-5 · ${MARCA}` },
          titulo: `Prueba final F2-5 · entrada sin etiquetas`,
          fechaPublicacion: "8 agosto 2026",
          categorias: [cats[0].id],
          cuerpo: "<p>Alta del editor para la prueba final de F2-5. Sin etiquetas a propósito.</p>",
          relacionados: false,
          estado: "publicado",
        },
        user: como(editor),
        overrideAccess: false,
      });
      const et = entrada.etiquetas;
      const vacia = et === undefined || et === null || (Array.isArray(et) && et.length === 0);
      if (vacia) pasa(INVARIANTES[0], `alta de \`${SLUG_ENTRADA}\` con sesión de editor · etiquetas ${JSON.stringify(et)} · sin imagenDestacada ni extracto`);
      else falla(INVARIANTES[0], `la entrada salió CON etiquetas (${JSON.stringify(et)}): no es el caso del escalón`);
    } catch (e) {
      falla(INVARIANTES[0], `el editor NO pudo dar de alta la entrada: ${e.message.slice(0, 160)}`);
    }
  }

  /* ── P2 · el producto (la mitad que no corrió) ──────────────────────────
   * `padre` decide el candidato local del §4: con él, `/{padre}/{slug}`. El
   * sabotaje lo cambia por uno que el build no emite. */
  {
    const padre = "cartuchos-inteligentes";
    try {
      producto = await payload.create({
        collection: "productos",
        data: {
          slug: SLUG_PRODUCTO,
          titulo: `Prueba final F2-5 · producto`,
          padre,
          seo: { title: `Prueba final F2-5 · producto · ${MARCA}` },
          tipo: "ficha",
          estado: "publicado",
        },
        user: como(editor),
        overrideAccess: false,
      });
      pasa(INVARIANTES[1], `alta de \`${SLUG_PRODUCTO}\` (padre \`${padre}\`) con sesión de editor`);
    } catch (e) {
      falla(INVARIANTES[1], `el editor NO pudo dar de alta el producto: ${e.message.slice(0, 200)}`);
    }
  }

  /* ── P3 · las guardas de entrada ────────────────────────────────────────
   * Tres cosas distintas, y las tres tienen que haber pasado: el esquema
   * (implícito en P1/P2), el REGISTRO de slug (§4) y el webhook. */
  {
    const { docs: registrados } = await payload.find({
      collection: "slugs",
      where: { slug: { in: [SLUG_ENTRADA, SLUG_PRODUCTO] } },
      pagination: false,
      depth: 0,
    });
    const conEntrada = registrados.some((s) => s.slug === SLUG_ENTRADA);
    /* Con credencial: un disparo sin ella no es un disparo, es un 401 que el
     * publicador rechazaría. Se cuentan los BUENOS, no los que llegaron. */
    const buenos = disparos.filter((d) => d.auth === `Bearer ${MARCA}-secreto`).length;
    /* El producto NO entra en el plano de raíz (`/[slug]`), así que no tiene
     * por qué registrarse: se exige del que sí, y se DICE del otro. */
    if (conEntrada && buenos >= 1)
      pasa(
        INVARIANTES[2],
        `slug de la entrada registrado (${registrados.length} de las 2 altas está en el plano de raíz; el producto no cuelga de él) · ` +
          `webhook disparó ${buenos} vez/veces CON la credencial, bajo la sesión del editor`,
      );
    else
      falla(
        INVARIANTES[2],
        `slug de la entrada registrado: ${conEntrada} · disparos con credencial: ${buenos} de ${disparos.length} — alguna guarda de entrada NO acogió el alta`,
      );
  }

  /* ── P4 · el build, que es donde murió la 40.ª ──────────────────────────── */
  {
    const b = SABOTAJE === "sin-guarda-render" ? { ok: true, codigo: 0, seg: 0, cola: "(saboteado: no se construyó)" } : construye("con las dos altas");
    evidencia.builds.conAltas = { ok: b.ok, codigo: b.codigo, seg: b.seg, cola: b.ok ? null : b.cola };
    if (SABOTAJE === "sin-guarda-render") {
      falla(INVARIANTES[3], "SABOTEADO: no se construyó, así que P4 no midió nada — y eso no puede salir verde");
    } else if (!b.ok) {
      falla(INVARIANTES[3], `\`next build\` murió con exit ${b.codigo}. Cola:\n${b.cola.split("\n").slice(-12).join("\n")}`);
    } else {
      const ahora = rutasDelArtefacto();
      const faltan = [`/${SLUG_ENTRADA}`].filter((r) => !ahora.has(r));
      evidencia.rutasConAltas = ahora.size;
      if (faltan.length)
        falla(INVARIANTES[3], `el build pasó (${b.seg}s) pero NO emitió ${faltan.join(", ")} — un alta que no llega a ruta no es un alta`);
      else
        pasa(
          INVARIANTES[3],
          `\`next build\` exit 0 en ${b.seg}s · ${RUTAS_ANTES.size} → ${ahora.size} rutas · \`/${SLUG_ENTRADA}\` emitida.\n` +
            `      Es EL CASO QUE MATÓ A LA 40.ª: una entrada sin etiquetas prerenderizada sin \`undefined.length\`.`,
        );
    }
  }

  /* ── P5 · el eje `href` sobre el producto nuevo ─────────────────────────
   * Se corre la sonda de verdad, no una reimplementación: el objeto medido es
   * lo que `qa:tipo-hoja` dice, no lo que esta sonda calcularía por su cuenta.
   *
   * ⚠ **El invariante no es «0 defectos»: es que el producto del admin ESTÉ
   * EN LA LISTA.** Con el eje anclado al seed —como estaba hasta el pre-vuelo
   * de esta tanda— el alta no aparecería en absoluto y «0 defectos» sería
   * verdad y vacío a la vez. Por eso el sabotaje `href-no-cubre` desactiva la
   * regla de rutas locales: el alta tiene que salir **entre los defectos**, y
   * si no sale es que el eje no la mira. */
  {
    const salida = `medidas/f25-final-tipo-hoja.json`;
    /* ⚠ **La ruta que se LEE es la que `w()` ESCRIBE, no la que se pide.** En
     * una corrida negativa `NEG` viaja en el entorno hasta el nieto y `w()`
     * desvía a `-neg-<etiqueta>`; leer la sin marcar encontraba **el fichero de
     * otra corrida** y lo daba por bueno — la primera corrida del negativo
     * reportó «el eje no cubre las altas del admin» leyendo la congelada de una
     * sesión anterior, con otro `marca`. Es §El principio otra vez: se verifica
     * contra la salida SERVIDA, y aquí la salida servida es el fichero que la
     * sonda escribió en ESTA corrida. */
    const escrita = process.env.NEG ? nombreNeg(salida, process.env.NEG) : salida;
    const rutaEscrita = enApp(`../../scripts/qa/${escrita}`);
    /* Y se borra antes: un fichero viejo no puede pasar por fresco (paso 1 del
     * protocolo de dos pasos — frescura primero, efecto después). */
    if (existsSync(rutaEscrita)) rmSync(rutaEscrita);
    const r = spawnSync("node", ["scripts/qa/tipo-hoja.mjs"], {
      cwd: APP.replace(/[\\/]apps[\\/]web[\\/]?$/, ""),
      encoding: "utf8",
      shell: true,
      timeout: 600_000,
      env: {
        ...process.env,
        SALIDA: salida,
        PISAR: "1",
        ...(SABOTAJE === "href-no-cubre" ? { HREF_SABOTAJE: "todo-construido" } : {}),
      },
    });
    let d = null;
    try { d = JSON.parse(readFileSync(rutaEscrita, "utf8")); } catch { /* lo dice el veredicto */ }
    const h = d?.href;
    const mio = h?.filas?.find((f) => f.id === SLUG_PRODUCTO) ?? null;
    if (!h) falla(INVARIANTES[4], `\`tipo-hoja\` no congeló su eje href (exit ${r.status})`);
    else if (!mio)
      falla(
        INVARIANTES[4],
        `el alta \`${SLUG_PRODUCTO}\` NO está entre los ${h.n} productos que el eje juzga — el eje no cubre las altas del admin`,
      );
    else if (mio.medido !== null || h.sinDatoMedido !== 1)
      falla(
        INVARIANTES[4],
        `el alta se contó como si tuviera dato medido (medido=${JSON.stringify(mio.medido)}, sinDatoMedido=${h.sinDatoMedido}): «no lo pude comparar» ≠ «coincide»`,
      );
    else if (SABOTAJE === "href-no-cubre")
      mio.defecto
        ? pasa(INVARIANTES[4], `SABOTEADO y MUERDE sobre el alta del admin: ${mio.defecto} en \`${mio.local}\``)
        : falla(INVARIANTES[4], `con la regla desactivada el alta del admin NO produjo defecto: el eje la lista pero no la juzga`);
    else if (h.defectos !== 0) falla(INVARIANTES[4], `${h.defectos} defecto(s) de href sobre ${h.n} productos`);
    else
      pasa(
        INVARIANTES[4],
        `${h.n} productos juzgados (fuente DB, era 9 desde el seed) · 0 defectos · el alta \`${SLUG_PRODUCTO}\` → ${mio.final}\n` +
          `      y cuenta como SIN dato medido, no como coincidente.`,
      );
  }
} finally {
  delete process.env.PUBLICAR_URL;
  delete process.env.PUBLICAR_SECRETO;
  if (receptor) await new Promise((r) => receptor.close(r));

  /* ── P6 · deshacer y volver ─────────────────────────────────────────────
   * La limpieza no es higiene: es el invariante. Si el artefacto no vuelve a
   * su conjunto de rutas, la prueba ha dejado el sitio distinto. */
  if (SABOTAJE !== "sin-limpieza") {
    for (const [col, slug] of [["entradas-blog", SLUG_ENTRADA], ["productos", SLUG_PRODUCTO]]) {
      const { docs } = await payload.find({ collection: col, where: { slug: { equals: slug } }, limit: 10, depth: 0 });
      for (const d of docs) await payload.delete({ collection: col, id: d.id });
    }
    const { docs: us } = await payload.find({ collection: "usuarios", where: { email: { like: `${MARCA}-` } }, limit: 10, depth: 0 });
    for (const u of us) await payload.delete({ collection: "usuarios", id: u.id });
  }

  const b2 = construye("tras deshacer el alta");
  evidencia.builds.trasDeshacer = { ok: b2.ok, codigo: b2.codigo, seg: b2.seg, cola: b2.ok ? null : b2.cola };
  const despues = b2.ok ? rutasDelArtefacto() : new Set();
  evidencia.rutasDespues = despues.size;
  const sobran = [...despues].filter((r) => !RUTAS_ANTES.has(r));
  const faltan = [...RUTAS_ANTES].filter((r) => !despues.has(r));
  const conteos = { usuarios: await cuenta("usuarios"), "entradas-blog": await cuenta("entradas-blog"), productos: await cuenta("productos") };
  evidencia.conteos = { antes: ANTES, despues: conteos };
  const residuo = Object.keys(ANTES).filter((k) => ANTES[k] !== conteos[k]);

  if (!b2.ok) falla(INVARIANTES[5], `el build de vuelta murió con exit ${b2.codigo} — el árbol queda distinto de como se encontró`);
  else if (sobran.length || faltan.length)
    falla(INVARIANTES[5], `el artefacto NO volvió: ${sobran.length} ruta(s) de más [${sobran.slice(0, 3)}] · ${faltan.length} de menos`);
  else if (residuo.length)
    falla(INVARIANTES[5], `rutas OK pero la DB tiene residuo en: ${residuo.map((k) => `${k} ${ANTES[k]}→${conteos[k]}`).join(" · ")}`);
  else
    pasa(INVARIANTES[5], `${despues.size} rutas, las mismas de partida · DB sin residuo (${Object.entries(conteos).map(([k, v]) => `${k} ${v}`).join(" · ")})`);

  await payload.db.destroy?.();
}

console.log(
  `\n${violados === 0 ? "✅" : "❌"} prueba final de F2-5: ${INVARIANTES.length - violados}/${INVARIANTES.length} invariantes\n` +
    (violados === 0
      ? `   El editor da de alta las DOS familias sin tocar código, las guardas la acogen,\n` +
        `   el build SOBREVIVE al caso que lo mató en la 40.ª, el eje href cubre el alta del\n` +
        `   admin, y el sitio vuelve exactamente a donde estaba.\n`
      : `   La FASE 2 no se puede declarar cerrada con esto en rojo.\n`),
);

w(
  env("SALIDA") || "medidas/f25-final.json",
  {
    meta: {
      fecha: hoy(),
      que: "la prueba final de F2-5: el EDITOR da de alta entrada (sin etiquetas) y producto, y el sitio se reconstruye",
      marca: MARCA,
      sabotaje: SABOTAJE || null,
    },
    evidencia,
    invariantes: resultados,
    veredicto: { violados, ok: violados === 0 },
  },
  { pisar: !!SABOTAJE },
);

process.exitCode = violados === 0 ? 0 : 1;
setTimeout(() => {
  console.error("⚠ el bucle no drenó en 2 s (pool aún referenciado): se sale con el código ya calculado");
  process.exit(process.exitCode ?? 0);
}, 2000).unref();
