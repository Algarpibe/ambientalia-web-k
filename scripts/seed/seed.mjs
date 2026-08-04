/**
 * SEEDS MECÁNICOS — `src/lib/*.ts` **son** los datos (`PLAN-FASE-2.md` §8).
 *
 * Uso:  npm run cms:seed            (exige una DB VACÍA; ver abajo)
 *       npm run cms:reset && npm run cms:seed
 *
 * ── Por qué exige DB vacía, y no es higiene ────────────────────────────────
 * §F2-2 lo pide: *«corre siempre contra una DB vacía (migrate desde cero +
 * seed)»*. La razón es que **la salida determinista es lo que hace alcanzable el
 * Δ0 de F2-3**: un seed que depende del estado anterior no es mecánico, y sus
 * ids —que son claves foráneas de todo lo demás— cambiarían de una corrida a
 * otra. Así que la comprobación no es una advertencia: **si hay documentos,
 * TIRA** (regla 6 — una precondición incumplida se rechaza, no se sortea).
 *
 * ── Alcance del BLOQUE 1, declarado ───────────────────────────────────────
 * `sectores` y `monograficos` **no se siembran aquí**, y no por falta de
 * tiempo: su round-trip topa con una frontera que ningún documento decide. Está
 * escrita en `PLAN-FASE-2.md` §F2-2 · FRONTERA. **Lo que no se puede verificar
 * no se siembra**: sembrarlo sin poder comprobarlo es exactamente el verde que
 * este repo no se cree.
 */
import fs from "node:fs";
import path from "node:path";
import { APP } from "../qa/lib.mjs";
import { CATALOGOS, TAXONOMIAS_DERIVADAS, cargaCatalogos } from "./catalogos.mjs";
import { aPayload } from "./mapeo.mjs";

/**
 * Las colecciones que este bloque siembra, **en orden de dependencia**.
 *
 * `sectores` y `monograficos` están FUERA con su razón —ver la cabecera— y no
 * como omisión silenciosa: `SEMBRADAS` es lo que la comprobación del PASO 2
 * usa de denominador, así que el alcance viaja con el dato.
 */
export const SEMBRADAS = [
  "faqs",
  "terminos-kunakpedia",
  "documentos-cientificos",
];

export const FUERA_DE_BLOQUE_1 = {
  "entradas-blog":
    "FRONTERA — 4 de 7 cuerpos traen `" + "<script" + ">` del corpus (NBC x1 · FB3D x2 · Instagram x1). " +
    "El `validate` de §3.3/T4 los rechaza, así que el SEED necesita T4 — que el PLAN puso en el bloque 2",
  productos:
    "FRONTERA — `seo.title` es `required` en el esquema (§2e: «seo, grupo como en las demás») y NO está medido en ningún sitio del repo: ni en `src/lib/products.ts` (que es la proyección de PESTAÑA) ni en `medidas/solutions-campos.json`. 9 de 9 instancias",
  sectores:
    "FRONTERA — 20 relaciones de teaser sin documento, y el `date` del teaser no es derivable del documento real",
  monograficos: "FRONTERA — ídem, 11 relaciones (comparte `colaComercial` con SECTOR)",
  casos: "arrastrada: `soluciones` → `productos`, que está en frontera",
  "taxonomia-sectores": "arrastrada: `pagina` → `sectores`/`monograficos`, que están en frontera",
  "articulos-kb": "§2d.1 — no tiene contraparte medida en `src/lib`: las 6 instancias no están transcritas",
  media: "no es un catálogo: se deriva de los campos `upload` de los demás",
  usuarios: "infraestructura (CMS-0f), sin lado medido",
  slugs: "registro del plano (§4): lo escriben los hooks, no un seed",
};

/**
 * ⚠ **LA FRONTERA, y va aquí porque el corte lo decidió una MEDICIÓN.**
 *
 * `scripts/seed/sondeo.mjs` recorrió los 9 catálogos contra la config resuelta y
 * contó las relaciones sin destino: **0 en siete colecciones, y 31 en dos** —
 * las 31, sin excepción, de `sectores`/`monograficos` hacia los **teasers** de
 * `casos` y `entradas-blog` (§2c.1, proyecciones). 28 slugs distintos que el
 * clon **nunca transcribió**: sólo hay 4 casos de 57 y 7 entradas de 149.
 *
 * **Por qué NO se resuelve sembrando más:** la mitad es sequencing —esos
 * documentos llegan con el extractor del corpus, bloque 2— pero **la otra mitad
 * es una decisión que ningún documento tiene escrita**, y por eso este bloque
 * para aquí:
 *
 * | campo del teaser | teaser | documento real | ¿derivable? |
 * |---|---|---|---|
 * | `title` · `client` | idénticos | idénticos | ✅ |
 * | `image` | `…_Kunak-1024x683.jpg` | `…_Kunak.jpg` | ⏳ es un *image size* — bloque 3 (M-IMG) |
 * | **`date`** | **`"Ene 7, 2025"`** | **`"7 enero 2025"`** | ❌ **nadie ha escrito la regla** |
 *
 * `EntradaBlog.fechaPublicacion` está declarada *«verbatim, como lo escribe el
 * original»* y es `string` a propósito. El teaser trae **otra renderización de
 * la misma fecha**, así que proyectarla exige un formateador de meses en
 * español —o dejar de guardar la fecha verbatim—, y **eso es una decisión de
 * modelo, no una transformación**. Acta y evidencia: `PLAN-FASE-2.md` §F2-2 ·
 * FRONTERA.
 *
 * **Lo que este bloque hace mientras tanto, y lo hace VISIBLE:** no escribe esas
 * dos rutas, y **la comprobación del PASO 2 las declara NO COMPARADAS con su
 * recuento**. No se normalizan ni se omiten en silencio: una cobertura declarada
 * al nivel de arriba absorbe justo lo que no se midió abajo.
 */
export const RUTAS_EN_FRONTERA = ["proyectos.posts", "articulos.posts"];

const PUBLICO = path.join(APP, "public");

/* ══════════════════════════════════════════════════════════════════════════
 * CONTEXTO — lo que el walker no puede derivar de la forma
 * ═════════════════════════════════════════════════════════════════════════ */

export function creaContexto(payload, { sondeo = false, llave = esSlug } = {}) {
  const mediaPorRuta = new Map();
  const idsPorColeccion = new Map(); // coleccion → Map(slug → id)

  const registra = (coleccion, slug, id) => {
    if (!idsPorColeccion.has(coleccion)) idsPorColeccion.set(coleccion, new Map());
    idsPorColeccion.get(coleccion).set(slug, id);
  };

  /** `"/images/…"` → id de `media`. Sube el fichero de `apps/web/public`. */
  const media = async (ruta, donde) => {
    if (typeof ruta !== "string" || !ruta.startsWith("/"))
      throw new Error(`MEDIA: en ${donde} se esperaba una ruta de asset y llegó ${JSON.stringify(ruta)?.slice(0, 60)}`);
    if (mediaPorRuta.has(ruta)) return mediaPorRuta.get(ruta);

    const abs = path.join(PUBLICO, decodeURIComponent(ruta));
    if (!fs.existsSync(abs))
      throw new Error(
        `MEDIA AUSENTE: ${ruta} (referenciada en ${donde}) no existe en apps/web/public.\n` +
          `  No se sustituye por nada: un alta de media vacía convertiría «falta el fichero»\n` +
          `  en «la imagen es opcional», y el Δ0 de F2-3 lo pagaría después.`,
      );

    const doc = await payload.create({ collection: "media", filePath: abs, data: {} });
    mediaPorRuta.set(ruta, doc.id);
    return doc.id;
  };

  /**
   * Resuelve una relación. El valor medido llega de **tres formas**, y las tres
   * son datos reales, no variantes de estilo:
   *   · **término embebido** `{slug, nombre}` — §2c: el término es su colección;
   *   · **id/slug suelto** `"monitor-calidad-aire"` — `casos.soluciones`;
   *   · **slug de página** para la relación polimórfica de `taxonomia-sectores`.
   */
  const huerfanas = [];
  /**
   * ⚠ **LA LLAVE NO DERIVABLE ES UN DEFECTO DEL INSTRUMENTO, NO UN DATO.**
   *
   * Éste es el defecto 1 de la tanda anterior, convertido en guarda. `esSlug`
   * no leía el `href` de los teasers, así que devolvía `undefined` para los 31;
   * `idsPorColeccion.get(d)?.get(undefined)` da `undefined` **igual que un slug
   * que de verdad falta**, y las 31 se apuntaron como huérfanas con la misma
   * llave. De ahí el informe *«34 huérfanas, 1 slug distinto»* — un número
   * plausible que sólo delató ser **aritméticamente imposible**.
   *
   * Ahora se separan las dos cosas en el sitio donde todavía se distinguen: un
   * valor no nulo del que no sale llave **no es una relación huérfana**, es que
   * la sonda no sabe leer ese valor. Es la regla 6 —una ausencia se rechaza, no
   * se sustituye por un valor benigno— aplicada a la llave.
   */
  const sinLlave = [];

  /**
   * ⚠ **LA FORMA CON QUE EL DATO MEDIDO ESCRIBE UNA RELACIÓN, POR RUTA DE
   * CAMPO — y se DERIVA de la ida, no se declara.**
   *
   * §2c convierte el **término embebido** en relación (`categoria:
   * {slug, nombre}` ⇒ id), y §2b escribe otras relaciones como **slug pelado**
   * (`casos.soluciones: string[]`). Las dos entran igual —un id— así que **la
   * ida es la misma y la VUELTA no puede serlo**: devolver siempre el slug
   * pierde el término, y devolver siempre el objeto lo inventa donde no estaba.
   *
   * Es exactamente el problema de `MonoInline` (`"hola"` vs `[{b:"hola"}]`) en
   * otro campo, y se resuelve igual: **la forma la dice el dato**, y quien la
   * ve es la ida. Una lista escrita a mano de «qué relaciones llevan objeto»
   * sería una copia desactualizada de algo derivable — regla 9.
   *
   * Lo destapó la PRIMERA corrida del proyector (2026-08-04): 4 de 12
   * documentos con `categoria` proyectada como cadena donde el dato medido
   * tiene `{slug, nombre}`.
   */
  const formaDeRel = new Map(); // ruta sin índices → "objeto" | "slug"
  const rutaLimpia = (r) => r.replace(/\[\d+\]/g, "");

  const rel = async (relationTo, valor, donde) => {
    const destinos = Array.isArray(relationTo) ? relationTo : [relationTo];
    formaDeRel.set(rutaLimpia(donde), valor !== null && typeof valor === "object" ? "objeto" : "slug");
    const slug = llave(valor);
    if (slug === undefined || slug === null || slug === "") {
      const detalle = { donde, valor: JSON.stringify(valor)?.slice(0, 120), destinos };
      if (sondeo) {
        sinLlave.push(detalle);
        return undefined;
      }
      throw new Error(
        `LLAVE NO DERIVABLE: de ${detalle.valor} (en ${donde}) no sale ningún slug.\n` +
          `  Eso NO es «esta relación apunta a un documento que falta»: es que el\n` +
          `  lector de llaves no sabe leer esta forma de valor. Las dos dan el mismo\n` +
          `  \`undefined\`, y confundirlas fue el defecto de instrumento del 2026-08-04.`,
      );
    }
    for (const d of destinos) {
      const id = idsPorColeccion.get(d)?.get(slug);
      if (id !== undefined) return destinos.length > 1 ? { relationTo: d, value: id } : id;
    }
    /**
     * ⚠ **En SONDEO se anota; sembrando se TIRA.** No es la misma pregunta: el
     * sondeo existe para **medir dónde está la frontera** antes de decidir el
     * alcance, y para eso tiene que poder recorrerlo todo. Sembrando, una
     * relación a la nada es un dato perdido y el round-trip lo leería como «este
     * campo no estaba» — o sea un Δ0 en falso.
     */
    if (sondeo) {
      huerfanas.push({ donde, slug, destinos });
      return undefined;
    }
    throw new Error(
      `RELACIÓN SIN DESTINO: '${slug}' (en ${donde}) no está en [${destinos.join(", ")}].\n` +
        `  No se omite: una relación que apunta a la nada es un dato perdido, y el\n` +
        `  round-trip del PASO 2 lo vería como «este campo no estaba».`,
    );
  };

  /* ════════════════════════════════════════════════════════════════════════
   * LA VUELTA — lo que `aMedido` necesita y hasta hoy no existía
   *
   * El proyector de `mapeo.mjs` llamaba a `ctx.rutaDeMedia`, `ctx.deRel` y
   * `ctx.conKind`, y **ninguna de las tres estaba escrita**: por eso «escrito y
   * nunca corrido» no era una etiqueta prudente, era literal — la primera
   * llamada habría muerto con `ctx.rutaDeMedia is not a function`.
   *
   * Las tres son la INVERSA de la ida y se construyen con los mismos mapas que
   * la ida llenó, no con una segunda lista: si fueran independientes, un mismo
   * olvido en las dos daría Δ0 en falso, que es justo lo que el walker único
   * evita.
   * ══════════════════════════════════════════════════════════════════════ */

  /** id de `media` → la ruta `"/images/…"` con la que se subió. */
  const porId = new Map();
  const rutaDeMedia = (id, donde) => {
    if (!porId.size) for (const [ruta, i] of mediaPorRuta) porId.set(i, ruta);
    const v = typeof id === "object" && id !== null ? id.id : id;
    const r = porId.get(v);
    if (r === undefined)
      throw new Error(
        `MEDIA SIN RUTA: el id ${JSON.stringify(v)} (en ${donde}) no lo subió esta corrida.\n` +
          `  No se devuelve \`undefined\`: eso lo leería el comparador como «este campo\n` +
          `  no estaba», que es un Δ0 en falso justo donde hay un dato perdido.`,
      );
    return r;
  };

  /** id de documento → el slug con el que se registró (la inversa de `rel`). */
  const slugPorId = new Map(); // "coleccion\0id" → slug
  const indexaSlugs = () => {
    if (slugPorId.size) return;
    for (const [col, m] of idsPorColeccion) for (const [slug, id] of m) slugPorId.set(`${col}\0${id}`, slug);
  };

  /**
   * Lo pone el comparador: `(coleccion, docPoblado) → objeto medido`. Sin él,
   * una relación cuya forma medida es OBJETO no se puede reconstruir, y esto
   * **tira en vez de devolver el slug** — devolver el slug sería sustituir «no
   * puedo reconstruirlo» por «esto es lo que había», que es la regla 6 otra vez.
   */
  let proyectaDoc = null;
  const declaraProyector = (fn) => { proyectaDoc = fn; };

  const deRel = (relationTo, valor, donde) => {
    indexaSlugs();
    const destinos = Array.isArray(relationTo) ? relationTo : [relationTo];
    /* Payload devuelve `{relationTo, value}` en las polimórficas y el id (o el
     * documento poblado, si se leyó con `depth ≥ 1`) en las demás. */
    const col = valor?.relationTo ?? destinos[0];
    const bruto = valor?.value !== undefined ? valor.value : valor;
    const poblado = bruto !== null && typeof bruto === "object" ? bruto : null;
    const crudo = poblado ? poblado.id : bruto;
    const slug = slugPorId.get(`${col}\0${crudo}`);
    if (slug === undefined)
      throw new Error(
        `RELACIÓN SIN SLUG: el id ${JSON.stringify(crudo)} de '${col}' (en ${donde}) no está registrado.`,
      );
    if (formaDeRel.get(rutaLimpia(donde)) !== "objeto") return slug;
    if (!poblado)
      throw new Error(
        `RELACIÓN EMBEBIDA SIN POBLAR: ${donde} se midió como término embebido y el\n` +
          `  documento llegó con el id pelado. Léelo con \`depth: 1\` — reconstruirlo\n` +
          `  desde el catálogo medido sería comparar el dato consigo mismo.`,
      );
    if (!proyectaDoc)
      throw new Error(`RELACIÓN EMBEBIDA SIN PROYECTOR: ${donde}. Llama a \`ctx.declaraProyector()\`.`);
    return proyectaDoc(col, poblado, donde);
  };

  /**
   * ⚠ **El `kind` vuelve SÓLO si el dato medido lo llevaba**, y eso no lo sabe
   * el esquema: en Payload la identidad del bloque **es** `blockType`, y el
   * dato medido la expresa de **dos** maneras —`kind: "…"` en `MonoModulo`, y
   * **la clave presente** en `MonoBloqueTexto` (`{p} | {ul} | {claim}`)—.
   *
   * Devolverlo siempre inventaría un `kind` donde el original no lo tiene;
   * omitirlo siempre lo perdería donde sí. Lo decide **el bloque**, que es
   * donde está escrito, y por eso esto no es una excepción del comparador.
   */
  const CON_KIND = new Set();
  const declaraKinds = (slugs) => { for (const s of slugs) CON_KIND.add(s); };
  const conKind = (slug, cuerpo) => (CON_KIND.has(slug) ? { kind: slug, ...cuerpo } : cuerpo);

  return {
    media, rel, registra, mediaPorRuta, idsPorColeccion, huerfanas, sinLlave, formaDeRel,
    rutaDeMedia, deRel, conKind, declaraKinds, declaraProyector,
  };
}

/**
 * El slug de un valor de relación, venga en la forma que venga.
 *
 * ⚠ **El `href` NO es un extra: es la única llave de los TEASERS.** `CaseStudy`
 * y `BlogPost` (§2c.1, proyecciones) no llevan `slug` — llevan `href`, a veces
 * absoluto al original. La primera versión de esta función no lo contemplaba y
 * devolvía `undefined` para los 34 teasers, así que el sondeo de frontera
 * reportó «34 huérfanas, 1 slug distinto»: **estaba midiendo mi propio defecto,
 * no el dato.** Lo delató que un slug distinto para 34 referencias es
 * imposible — la clase «un número plausible de más» de la regla 4.
 */
export function esSlug(v) {
  if (typeof v === "string") return v.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? v;
  if (v && typeof v === "object")
    return v.slug ?? v.id ?? v.paginaSlug ?? (v.href ? esSlug(v.href) : undefined);
  return undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
 * TRANSFORMACIONES DECLARADAS — las que no salen de la forma
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `productos`: los alias de §2e y la derivación de `padre`.
 *
 * `href` **no se guarda** —§4 replica el plano del original, así que la ruta es
 * `padre` + `slug`— y por tanto la ida tiene que hacer el camino inverso. Ojo:
 * en el corpus el `href` viene **absoluto** para los productos aún no clonados
 * (`https://kunakair.com/es/cartuchos-inteligentes/x/`), así que se normaliza
 * por segmentos y no por prefijo.
 */
export function preparaProducto(p) {
  const segs = String(p.href ?? "")
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/es/, "")
    .split("/")
    .filter(Boolean);
  const padre = segs.length > 1 ? segs[segs.length - 2] : undefined;
  const { id, name, href, ...resto } = p;
  return { ...resto, slug: id, titulo: name, ...(padre ? { padre } : {}) };
}

/** `taxonomia-sectores`: `paginaSlug` → relación polimórfica `pagina`. */
export function preparaTermino(t) {
  const { paginaSlug, ...resto } = t;
  return { ...resto, ...(paginaSlug ? { pagina: paginaSlug } : {}) };
}

export const PREPARA = {
  productos: preparaProducto,
  "taxonomia-sectores": preparaTermino,
};

/* ══════════════════════════════════════════════════════════════════════════
 * LAS TAXONOMÍAS DERIVADAS — §2c
 * ═════════════════════════════════════════════════════════════════════════ */

/** Deduplica por slug los términos embebidos en las entradas. */
export function derivaTaxonomias(catalogos) {
  const salida = new Map();
  for (const t of TAXONOMIAS_DERIVADAS) {
    const filas = catalogos.get(t.de) ?? [];
    const porSlug = new Map();
    for (const f of filas) {
      const v = f[t.campo];
      if (!v) continue;
      for (const term of t.lista ? v : [v]) if (term?.slug) porSlug.set(term.slug, term);
    }
    salida.set(t.coleccion, [...porSlug.values()]);
  }
  return salida;
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL SEED
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Quita del dato las rutas en frontera **antes** de mapear, para que el walker
 * no tenga que saber nada de esto. Devuelve una copia: el catálogo medido es la
 * fuente de verdad y no se toca.
 */
export function podaFrontera(fila) {
  let copia = fila;
  for (const ruta of RUTAS_EN_FRONTERA) {
    const [grupo, campo] = ruta.split(".");
    if (copia?.[grupo]?.[campo] === undefined) continue;
    copia = { ...copia, [grupo]: { ...copia[grupo] } };
    delete copia[grupo][campo];
  }
  return copia;
}

export async function siembra(payload, colecciones) {
  const catalogos = await cargaCatalogos();
  const taxonomias = derivaTaxonomias(catalogos);
  const ctx = creaContexto(payload);
  const resumen = [];

  const inserta = async (coleccion, filas) => {
    const cfg = colecciones.find((c) => c.slug === coleccion);
    if (!cfg) throw new Error(`SEED: la colección '${coleccion}' no está en la config`);
    let n = 0;
    for (const fila of filas) {
      const preparada = podaFrontera((PREPARA[coleccion] ?? ((x) => x))(fila));
      const data = await aPayload(cfg.fields, preparada, ctx, coleccion);
      const doc = await payload.create({ collection: coleccion, data });
      ctx.registra(coleccion, data.slug ?? doc.slug, doc.id);
      n++;
    }
    resumen.push({ coleccion, insertados: n });
    console.log(`  ✓ ${coleccion.padEnd(24)} ${String(n).padStart(4)}`);
    return n;
  };

  console.log("\n── taxonomías derivadas (§2c) ──");
  for (const t of TAXONOMIAS_DERIVADAS) {
    /* Sólo las que alimentan a una colección sembrada: sembrar la taxonomía de
     * una colección que no entra dejaría términos que nadie usa, y el recuento
     * del PASO 2 los contaría como sembrados. */
    if (!SEMBRADAS.includes(t.de)) continue;
    await inserta(t.coleccion, taxonomias.get(t.coleccion));
  }

  console.log("\n── catálogos medidos ──");
  for (const c of CATALOGOS) {
    if (!SEMBRADAS.includes(c.coleccion)) continue;
    await inserta(c.coleccion, catalogos.get(c.coleccion));
  }

  return { resumen, ctx, taxonomias, catalogos };
}

/**
 * Colecciones que Payload se monta solas y que **deben** tener filas: el
 * registro de migraciones es justo la prueba de que `cms:reset` hizo su trabajo.
 * Se listan con su porqué en vez de filtrar por prefijo `payload-`: un prefijo
 * casaría también con una colección nuestra que empezara así.
 */
const INTERNAS = {
  "payload-migrations": "el registro de migraciones — con la DB migrada trae 2 filas, y eso es lo correcto",
  "payload-locked-documents": "bloqueos de edición del admin",
  "payload-preferences": "preferencias de usuario del admin",
  "payload-jobs": "cola de trabajos",
};

/** La DB tiene que estar vacía. Si no, TIRA. */
export async function exigeVacia(payload, colecciones) {
  const conDatos = [];
  for (const c of colecciones) {
    if (c.slug === "usuarios") continue; // el admin puede existir
    if (INTERNAS[c.slug]) continue;
    const r = await payload.count({ collection: c.slug });
    if (r.totalDocs > 0) conDatos.push(`${c.slug}=${r.totalDocs}`);
  }
  if (conDatos.length)
    throw new Error(
      `LA DB NO ESTÁ VACÍA: ${conDatos.join(" · ")}\n` +
        `  El seed tiene que ser DETERMINISTA — es lo que hace alcanzable el Δ0 de F2-3 —\n` +
        `  y sobre datos previos ni los ids ni el resultado lo son.\n` +
        `  Ejecuta:  npm run cms:reset && npm run cms:seed`,
    );
}
