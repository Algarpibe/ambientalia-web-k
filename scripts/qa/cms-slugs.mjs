/**
 * LA GUARDA DE COLISIÓN DE SLUG, MITAD DE **ENTRADA** — el hook contra Postgres.
 *
 * Uso:  npm run qa:cms-slugs                (necesita el Postgres del CMS vivo)
 *       SABOTAJE=<caso> npm run qa:cms-slugs
 *
 * ── Por qué existe una sonda aparte de `qa:slugs` ──────────────────────────
 * `ESQUEMA-CMS.md` §4 dice que las dos guardas son **complementarias, no
 * alternativas**: *«el hook avisa a quien edita, la guarda caza lo que entre por
 * cualquier otra vía»*. Y ven cosas distintas:
 *
 *   · `qa:slugs` (build) mira el `prerender-manifest` — ve sombras y huérfanas,
 *     y **no puede ver** un alta rechazada, porque el alta no llega al build;
 *   · ésta mira el **alta**, contra la DB real — ve el rechazo, y **no puede
 *     ver** que una ruta estática del clon sombree un slug del catálogo.
 *
 * Una sola no cubre a la otra, así que probar una y dar la otra por buena sería
 * exactamente *«un verde que no mide lo que dice»*.
 *
 * ── Por qué NO entra en `npm run check` ────────────────────────────────────
 * Necesita Postgres. `check` tiene que poder correr sin infraestructura, y
 * meterle una dependencia de servicio convertiría «la DB está apagada» en «el
 * código está mal». `qa:slugs` sí entra, y es estática.
 *
 * ── Los SEIS invariantes, y qué ve cada uno ───────────────────────────────
 *   1 · un alta legítima entra **y deja su registro**;
 *   2 · **el mismo slug desde otra familia CAE** — el caso literal del §4. El
 *       slug de la sonda lleva `accesorios`, que es con el que `ENRUTADO.md` §2
 *       provocó la colisión real que **no dio error**;
 *   3 · con otro slug pasa — la guarda no bloquea lo legítimo;
 *   4 · un producto **CON `padre`** puede repetir el slug de una entrada de
 *       blog: **está fuera del plano** (18 de 24, §2e). Si cayera, la guarda
 *       inventaría colisiones que en la URL real no existen;
 *   5 · **borrar libera el slug** — si no, renombrar o borrar quemaría el slug
 *       para siempre y la guarda bloquearía altas legítimas, que es la otra
 *       forma de que una guarda deje de servir;
 *   6 · **CMS-9 (140.ª): un slug que EMITE UNA CARPETA ESTÁTICA no arbitra el
 *       plano** — dos familias distintas pueden reclamarlo SIN colisión,
 *       porque ninguna de las dos es quien lo sirve de verdad (lo sirve
 *       `apps/web/src/app/casos-de-exito/page.tsx`, no `/[slug]`). Antes de
 *       CMS-9 esto habría caído igual que el invariante 2 — es el caso real
 *       medido en `ESQUEMA-CMS.md` §CMS-9 (139.ª), con `casos-de-exito` en vez
 *       de `monitor-calidad-aire` porque ésta última ya tiene dueño real en la
 *       DB sembrada y mediría el `unique` DE CAMPO en vez del registro.
 *
 * ── Los sabotajes, cada uno por SU invariante (`qa:cms-slugs-neg`) ─────────
 *   · `sin-hook`        — se le quita el hook a `terminos-kunakpedia` ⇒ rompe **2**
 *   · `fuera-plano`     — `productos` registra aunque tenga `padre` ⇒ rompe **4**
 *   · `sin-afterdelete` — `entradas-blog` no suelta al borrar ⇒ rompe **5**
 *   · CONTROL           — sin sabotaje, los seis pasan. Sin él, una sonda que
 *                         fallara siempre aprobaría los tres sabotajes.
 *
 * ⚠ **El 6 no lleva sabotaje propio, y es el mismo patrón que ya tienen el 1 y
 * el 3 en este fichero**: no todo invariante necesita un interruptor de
 * config para poder romperse — el filtro que el 6 comprueba vive DENTRO de
 * `enPlano()`, compartido por las seis, y no hay forma de desactivarlo sólo
 * para una colección sin añadir superficie que ninguna colección real
 * necesita. Se verificó DISCRIMINANDO por el otro canal disponible: corrido
 * contra el código de la 139.ª (antes de CMS-9), el 6 CAE — es exactamente
 * la colisión que `ESQUEMA-CMS.md` §CMS-9 midió. Contra el código de la
 * 140.ª, pasa. Acta con los dos lados en `PENDIENTES-QA.md`.
 */
import { Evaluadas, env, w } from "./lib.mjs";

/* No toca el clon: un `build` no la contamina, así que no debe dispararle la
 * guarda de `BUILD_ID` de `w()`. Arriba, junto al import, por lo de siempre. */
process.env.SIN_CLON = "1";

const SABOTAJE = env("SABOTAJE");

/* ── Carga de la config, igual que `apps/cms`: el paquete compartido ────────
 * `construyeConfig` sale de `@kunak/cms-config`, o sea **la misma config que
 * usa el admin**. Si esta sonda montara la suya, mediría un CMS que no existe. */
const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const { registroDeSlug } = await import("../../packages/cms-config/src/hooks/registro-slug.ts");

/** Marca de esta corrida: la DB es compartida y una sonda no debe pisar a otra. */
const MARCA = `qa-slugs-${process.pid}`;
const SLUG_A = `${MARCA}-accesorios`;
const SLUG_B = `${MARCA}-otro`;
/**
 * ⚠ SIN prefijo de MARCA a propósito — tiene que ser el nombre LITERAL de una
 * carpeta estática real de `apps/web/src/app/` para que el filtro de CMS-9 la
 * reconozca. `casos-de-exito` está entre las «estáticas sin dueño» de
 * `medidas/slugs-2026-09-02.json` (ninguna familia la reclama hoy), así que no
 * hay fixture real con este slug que este test pueda pisar.
 */
const SLUG_ESTATICO = "casos-de-exito";

const config = await construyeConfig();

/* Los sabotajes se aplican sobre la config RESUELTA, que es la que Payload va a
 * usar de verdad — no sobre el texto del fichero fuente.
 *
 * ⚠ Y un sabotaje que no encuentra su objetivo TIRA en vez de no hacer nada: un
 * sabotaje inerte produce una corrida verde que parece un negativo aprobado, que
 * es el falso verde de siempre puesto en el instrumento que existe para
 * evitarlo. */
const coleccion = (slug) => {
  const c = config.collections.find((x) => x.slug === slug);
  if (!c) throw new Error(`SABOTAJE ${SABOTAJE}: la colección '${slug}' no existe`);
  return c;
};

if (SABOTAJE === "sin-hook") {
  const c = coleccion("terminos-kunakpedia");
  c.hooks = { ...(c.hooks ?? {}), beforeValidate: [], afterChange: [], afterDelete: [] };
} else if (SABOTAJE === "fuera-plano") {
  /* `productos` pasa a registrar SIEMPRE, o sea sin el predicado de §2e. */
  const c = coleccion("productos");
  c.hooks = { ...(c.hooks ?? {}), ...registroDeSlug({ familia: "productos" }) };
} else if (SABOTAJE === "sin-afterdelete") {
  const c = coleccion("entradas-blog");
  c.hooks = { ...(c.hooks ?? {}), afterDelete: [] };
} else if (SABOTAJE) {
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}'`);
}

const payload = await getPayload({ config });

const ev = new Evaluadas({ nombre: "cms-slugs", unidad: "invariantes del plano", minimo: 6 });
const pasos = [];
const creados = { "entradas-blog": [], "terminos-kunakpedia": [], productos: [], categorias: [], autores: [] };

const anota = (paso, esperado, obtenido, ok) => {
  pasos.push({ paso, esperado, obtenido, ok });
  console.log(`  ${ok ? "✓" : "✗"} ${paso.padEnd(46)} esperado ${esperado} · ${obtenido}`);
  return ok;
};

/**
 * Datos mínimos que cada colección exige, para que **lo que falle sea el slug**
 * y no un campo obligatorio que se me olvidó: una caída por `categorias` vacías
 * se leería como «la guarda funciona», que es el falso verde de siempre con el
 * signo cambiado.
 *
 * ⚠⚠ **Y ESO ES EXACTAMENTE LO QUE PASÓ, con el signo al revés y durante 20
 * días (cazado en la 99.ª, PASO 0).** El aviso de arriba miraba al falso verde;
 * el fallo real fue **el fixture caducando contra el esquema** (§regla 5ter: *
 * arreglar el objeto caduca el control del instrumento que lo midió*):
 *
 * | invariante | campo que pasó a `required` | commit | desde |
 * |---|---|---|---|
 * | **4** (`productos`) | `pagina` — CMS-PR3, **sin defecto a propósito** | `df64363` | **2026-08-13** |
 * | **3** (`terminos-kunakpedia`) | `fechaPublicacion` — el orden del glosario | `021b6b0` | **2026-08-18** |
 *
 * Los dos fixtures dejaron de poder CREARSE, así que **los invariantes 3 y 4 no
 * estaban fallando: estaban SIN EJERCITAR** — el alta moría antes de llegar a la
 * guarda. Última corrida en verde: `medidas/cms-slugs.json`, **2026-08-04**.
 *
 * **Y se llevó por delante a su propio negativo EN LAS DOS DIRECCIONES**, que es
 * lo que lo hace instructivo — el mismo fixture caducado produjo un rojo y un
 * verde, los dos falsos:
 *
 * | caso | salía | por qué, y cuál es el modo de fallo |
 * |---|---|---|
 * | `sin-hook` | ❌ *«el invariante 2 no salió roto»* | el 2 crea un término con el slug repetido y **espera que caiga**. Quitado el hook debería PASAR — y seguía cayendo, por el campo obligatorio ausente. O sea: **el 2 pasaba POR EL MOTIVO EQUIVOCADO**, y con eso la guarda de colisión **no se podía demostrar portante** (§regla 8: *un sabotaje que no cambia el resultado no ha probado la guarda*) |
 * | `fuera-plano` | ✓ **gratis** | el 4 ya salía rojo sin sabotaje, así que el caso pasaba **prediciendo lo mismo que la corrida limpia**: 0 instancias separadoras (§regla 17, segunda cara) |
 *
 * Las dos mitades tienen la misma causa y **ninguna se ve desde el código de
 * salida del negativo**: uno grita por algo que no es lo suyo y el otro calla
 * sin poder morder.
 *
 * **Por qué nadie lo vio:** `cms-slugs.neg` necesita la DB, y `qa:negativos` no
 * corre los que la necesitan (hoy **32 de 79**: 17 de navegador · 15 de DB). Es
 * la **segunda** instancia de la clase que la 98.ª estrenó con `sondeo.neg`.
 *
 * **El denominador se DERIVÓ, no se descubrió de uno en uno** (§regla 27):
 * recorriendo la config resuelta salen **exactamente 2 campos ausentes, uno por
 * fixture, y 0 restantes** — `productos {slug, titulo, pagina}` ·
 * `terminos-kunakpedia {slug, seo.title, fechaPublicacion, cuerpo}`.
 */
/**
 * ⚠⚠ **`firmas` ES `required · minRows: 1` (`grupo-a.ts:96`) desde ANTES de
 * esta tanda, y este fixture no la traía — §regla 5ter, la misma clase que
 * `pagina` y `fechaPublicacion` ya se cobraron aquí dos veces (ver la nota de
 * arriba).** Cazado al correr el CONTROL: `entradas-blog` moría en el paso 1
 * con `ValidationError: Firmas — This field requires at least 1 Rows`, ANTES
 * de llegar al invariante 6 — «0 de 6 invariantes evaluados», no un rojo del
 * invariante 6. Se arregla dándole un autor real, no aflojando el fixture.
 */
const cuerpoBlog = (slug, categoria, autor) => ({
  slug,
  titulo: "sonda",
  fechaPublicacion: "7 enero 2025",
  cuerpo: "<p>sonda</p>",
  seo: { title: "sonda" },
  categorias: [categoria],
  firmas: [{ autor }],
});
const cuerpoTermino = (slug) => ({
  slug,
  titulo: "sonda",
  fechaPublicacion: "2025-01-07",
  cuerpo: "<p>sonda</p>",
  seo: { title: "sonda" },
});
/**
 * ⚠ **`pagina: "propia"` NO es una elección de gusto: es la única que deja a
 * `padre` siendo la causa separadora** (99.ª tanda). El predicado del alcance
 * es una CONJUNCIÓN — `enElPlano: (doc) => !doc.padre && doc.pagina ===
 * "propia"` (`colecciones/productos.ts`)— así que un fixture con `pagina:
 * "ninguna"` **también** saldría fuera del plano, el invariante 4 pasaría, y
 * **no habría forma de saber cuál de los dos términos hizo el trabajo**: 0
 * instancias separadoras, que es §*dos modelos que predicen lo mismo en todo tu
 * dominio son uno solo* cometida sobre un fixture.
 *
 * Con `"propia"`, el ÚNICO motivo por el que el alta puede quedar fuera del
 * plano es el `padre` — que es exactamente lo que el invariante 4 afirma medir,
 * y lo que el sabotaje `fuera-plano` tiene que poder romper.
 */
const cuerpoProducto = (slug, padre) => ({
  slug,
  titulo: "sonda",
  pagina: "propia",
  seo: { title: "sonda" },
  ...(padre ? { padre } : {}),
});

const crear = async (collection, data) => {
  const doc = await payload.create({ collection, data });
  creados[collection].push(doc.id);
  return doc;
};

let ok = true;
let cat;
try {
  console.log(`\n════════ GUARDA DE COLISIÓN · mitad de ENTRADA ════════`);
  console.log(`  sabotaje: ${SABOTAJE ?? "(ninguno — CONTROL)"}\n`);

  /* 0 · Andamio: la categoría y el autor que `entradas-blog` exige (1..n,
   * obligatorias las dos). */
  cat = await crear("categorias", { nombre: MARCA, slug: `${MARCA}-cat` });
  const autor = await crear("autores", { nombre: MARCA, slug: `${MARCA}-autor` });

  /* 1 · El alta legítima entra, y deja su registro. ───────────────────────── */
  await crear("entradas-blog", cuerpoBlog(SLUG_A, cat.id, autor.id));
  const reg = await payload.find({
    collection: "slugs",
    where: { slug: { equals: SLUG_A } },
    limit: 1,
  });
  ok = anota(
    "1 · alta legítima ⇒ entra y se registra",
    "1 registro",
    `${reg.totalDocs} · familia=${reg.docs[0]?.familia ?? "—"}`,
    reg.totalDocs === 1 && reg.docs[0]?.familia === "entradas-blog",
  ) && ok;
  ev.ok();

  /* 2 · La colisión ENTRE familias cae. El caso del §4. ───────────────────── */
  const intenta = async (fn) => {
    try {
      await fn();
      return { cayo: false, mensaje: "pasó" };
    } catch (e) {
      return { cayo: true, mensaje: `cayó: ${String(e?.message ?? e).slice(0, 80)}` };
    }
  };

  const r2 = await intenta(() => crear("terminos-kunakpedia", cuerpoTermino(SLUG_A)));
  ok = anota("2 · MISMO slug, otra familia ⇒ el alta CAE", "cae", r2.mensaje, r2.cayo) && ok;
  ev.ok();

  /* 3 · Con otro slug pasa: la guarda no bloquea lo legítimo. ─────────────── */
  const r3 = await intenta(() => crear("terminos-kunakpedia", cuerpoTermino(SLUG_B)));
  ok = anota("3 · slug distinto ⇒ pasa en limpio", "pasa", r3.mensaje, !r3.cayo) && ok;
  ev.ok();

  /* 4 · Alcance: un producto CON `padre` NO está en el plano (18 de 24). ──── */
  const r4 = await intenta(() =>
    crear("productos", cuerpoProducto(SLUG_A, "cartuchos-inteligentes")),
  );
  ok = anota(
    "4 · producto CON `padre` repite slug ⇒ PASA (fuera del plano)",
    "pasa",
    r4.mensaje,
    !r4.cayo,
  ) && ok;
  ev.ok();

  /* 5 · Borrar libera el slug: si no, un borrado lo quema para siempre. ───── */
  const idBlog = creados["entradas-blog"].pop();
  await payload.delete({ collection: "entradas-blog", id: idBlog });
  const r5 = await intenta(() => crear("entradas-blog", cuerpoBlog(SLUG_A, cat.id, autor.id)));
  ok = anota(
    "5 · borrar ⇒ suelta el slug y se puede reusar",
    "pasa",
    r5.mensaje,
    !r5.cayo,
  ) && ok;
  ev.ok();

  /* 6 · CMS-9: un slug de carpeta ESTÁTICA no arbitra el plano — dos familias
   * distintas lo reclaman y NINGUNA colisiona, porque ninguna es quien lo
   * sirve de verdad. Antes de CMS-9 la segunda habría caído igual que el 2. */
  const r6a = await intenta(() => crear("entradas-blog", cuerpoBlog(SLUG_ESTATICO, cat.id, autor.id)));
  const r6b = await intenta(() => crear("terminos-kunakpedia", cuerpoTermino(SLUG_ESTATICO)));
  const reg6 = await payload.find({
    collection: "slugs",
    where: { slug: { equals: SLUG_ESTATICO } },
    limit: 1,
  });
  ok = anota(
    "6 · slug de carpeta ESTÁTICA, dos familias ⇒ ninguna arbitra",
    "las dos pasan · 0 en `slugs`",
    `blog:${r6a.mensaje} · término:${r6b.mensaje} · ${reg6.totalDocs} en el registro`,
    !r6a.cayo && !r6b.cayo && reg6.totalDocs === 0,
  ) && ok;
  ev.ok();
} finally {
  /* Limpieza: la sonda no deja residuo en la DB. Un residuo haría fallar la
   * corrida SIGUIENTE por el paso 1, y el diagnóstico apuntaría al sitio
   * equivocado. */
  for (const [collection, ids] of Object.entries(creados))
    for (const id of ids)
      await payload.delete({ collection, id }).catch(() => {});
  await payload.delete({
    collection: "slugs",
    where: { slug: { like: MARCA } },
  }).catch(() => {});
}

const sufijo = SABOTAJE ? `-neg-${SABOTAJE}` : "";
w(`medidas/cms-slugs${sufijo}.json`, {
  meta: { fecha: new Date().toISOString().slice(0, 10), sabotaje: SABOTAJE ?? null },
  alcance:
    "plano de UN segmento de /es/ — entradas-blog · terminos-kunakpedia · productos SIN padre. " +
    "Las prefijadas (casos, faqs, sectores, monograficos, documentos-cientificos, taxonomías) " +
    "tienen unicidad nativa de colección y NO entran. Mismo alcance que `qa:slugs`.",
  pasos,
});

console.log(
  ok
    ? `\n✅ cms-slugs: los 6 invariantes del plano se comportan como el §4 dice.\n`
    : `\n❌ cms-slugs: algún invariante NO se comporta como el §4 dice.\n`,
);

process.exit(ok ? 0 : 1);
