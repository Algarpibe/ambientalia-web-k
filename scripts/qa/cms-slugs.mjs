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
 * ── Los CINCO invariantes, y qué ve cada uno ──────────────────────────────
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
 *       forma de que una guarda deje de servir.
 *
 * ── Los sabotajes, cada uno por SU invariante (`qa:cms-slugs-neg`) ─────────
 *   · `sin-hook`        — se le quita el hook a `terminos-kunakpedia` ⇒ rompe **2**
 *   · `fuera-plano`     — `productos` registra aunque tenga `padre` ⇒ rompe **4**
 *   · `sin-afterdelete` — `entradas-blog` no suelta al borrar ⇒ rompe **5**
 *   · CONTROL           — sin sabotaje, los cinco pasan. Sin él, una sonda que
 *                         fallara siempre aprobaría los tres sabotajes.
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

const ev = new Evaluadas({ nombre: "cms-slugs", unidad: "invariantes del plano", minimo: 5 });
const pasos = [];
const creados = { "entradas-blog": [], "terminos-kunakpedia": [], productos: [], categorias: [] };

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
 */
const cuerpoBlog = (slug, categoria) => ({
  slug,
  titulo: "sonda",
  fechaPublicacion: "7 enero 2025",
  cuerpo: "<p>sonda</p>",
  seo: { title: "sonda" },
  categorias: [categoria],
});
const cuerpoTermino = (slug) => ({
  slug,
  titulo: "sonda",
  cuerpo: "<p>sonda</p>",
  seo: { title: "sonda" },
});
const cuerpoProducto = (slug, padre) => ({
  slug,
  titulo: "sonda",
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

  /* 0 · Andamio: la categoría que `entradas-blog` exige (1..n, obligatoria). */
  cat = await crear("categorias", { nombre: MARCA, slug: `${MARCA}-cat` });

  /* 1 · El alta legítima entra, y deja su registro. ───────────────────────── */
  await crear("entradas-blog", cuerpoBlog(SLUG_A, cat.id));
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
  const r5 = await intenta(() => crear("entradas-blog", cuerpoBlog(SLUG_A, cat.id)));
  ok = anota(
    "5 · borrar ⇒ suelta el slug y se puede reusar",
    "pasa",
    r5.mensaje,
    !r5.cayo,
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
    ? `\n✅ cms-slugs: los 5 invariantes del plano se comportan como el §4 dice.\n`
    : `\n❌ cms-slugs: algún invariante NO se comporta como el §4 dice.\n`,
);

process.exit(ok ? 0 : 1);
