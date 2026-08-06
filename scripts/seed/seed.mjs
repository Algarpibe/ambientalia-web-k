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
/**
 * ⚠ **T4b se IMPORTA, no se re-escribe** (2026-08-06). El seed tenía su propia
 * copia a mano de T8+T4a y por eso nunca vio a T4b: `grep -c transformaciones
 * scripts/seed/seed.mjs` daba **0** mientras `TRANSFORMACIONES` ya lo llevaba
 * en su orden correcto, usado por el extractor, el round-trip y `media-hueco`.
 * Una segunda definición de una transformación de migración es la clase C7 con
 * la peor salida: dos caminos que dicen migrar lo mismo y migran cosas distintas.
 */
import { T4B } from "./transformaciones.mjs";
import { aPayload } from "../../packages/cms-config/src/mapeo.mjs";
/**
 * ⚠ **La mitad de VUELTA vive en el paquete compartido desde el 2026-08-06**
 * (CMS-0g): el RENDER la necesita y no puede importar este fichero, que abre
 * ficheros y habla con Payload. Se re-exporta para que sus importadores no
 * cambien de sitio y para que siga habiendo UNA sola definición.
 */
export { DEVUELVE, comoEmbebido, devuelveProducto, devuelveTermino, rutaLocal } from "../../packages/cms-config/src/vuelta.mjs";
import { comoEmbebido, DEVUELVE } from "../../packages/cms-config/src/vuelta.mjs";

/**
 * Las colecciones que este bloque siembra, **en orden de dependencia**.
 *
 * `sectores` y `monograficos` están FUERA con su razón —ver la cabecera— y no
 * como omisión silenciosa: `SEMBRADAS` es lo que la comprobación del PASO 2
 * usa de denominador, así que el alcance viaja con el dato.
 */
/**
 * ✅ **LAS 9, desde el 2026-08-04.** Las tres fronteras que pararon el bloque 1
 * están decididas y aplicadas —teaser como dato propio · `seo` medido en el
 * original · T4a antes del alta— así que el alcance es **el catálogo entero**:
 * **46 filas** en 9 colecciones, más las 4 taxonomías derivadas.
 *
 * El orden **NO es estético y ya no se afirma**: `scripts/seed/grafo.mjs` lo
 * deriva de la config resuelta y `cms:sondeo` verifica que es topológico. Lo que
 * manda es `CATALOGOS`; esta lista sólo dice cuáles entran.
 */
export const SEMBRADAS = [
  "productos",
  "sectores",
  "monograficos",
  "taxonomia-sectores",
  "casos",
  "faqs",
  "entradas-blog",
  "terminos-kunakpedia",
  "documentos-cientificos",
];

export const FUERA_DE_BLOQUE_1 = {
  "articulos-kb": "§2d.1 — no tiene contraparte medida en `src/lib`: las 6 instancias no están transcritas",
  media: "no es un catálogo: se deriva de los campos `upload` de los demás",
  usuarios: "infraestructura (CMS-0f), sin lado medido",
  slugs: "registro del plano (§4): lo escriben los hooks, no un seed",
};

/**
 * ✅ **LA FRONTERA DE TEASER, CERRADA el 2026-08-04 — y la lista queda VACÍA.**
 *
 * Aquí vivían `proyectos.posts` y `articulos.posts`, podadas del dato porque
 * **31 de sus 34 relaciones no tenían documento destino**. La decisión de §F2-2
 * · TEASER las convirtió en **dato propio** (ver `campos/comunes.ts`), así que
 * ya no son relaciones y no hay nada que podar: se siembran enteras.
 *
 * **La lista se queda porque el mecanismo es real y la guarda lo vigila**: una
 * ruta declarada aquí que no case con ningún campo sale por `PODA MUERTA` en el
 * sondeo. Es lo que pasó al aplicar la decisión, y es lo que tenía que pasar —
 * la declaración avisó de que se había quedado obsoleta en vez de seguir
 * «podando» nada en silencio.
 */
export const RUTAS_EN_FRONTERA = [];

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

    /**
     * ⚠ **`rutaOrigen` es la PROCEDENCIA, y la escribe la IDA (CMS-0g).**
     *
     * Es el mismo mapa que `mediaPorRuta`, persistido — no una segunda lista.
     * `seed.mjs` lo dice de los tres métodos de vuelta: *«se construyen con los
     * mismos mapas que la ida llenó, no con una segunda lista: si fueran
     * independientes, un mismo olvido en las dos daría Δ0 en falso»*. Derivar
     * la ruta del `filename` al leer sería exactamente esa segunda lista, y
     * `qa:media-colision` midió que **se rompe en la unión con el corpus**.
     *
     * Se escribe la ruta **tal cual la trae el dato medido** —sin decodificar—
     * porque es la cadena que el clon renderiza: normalizarla aquí movería el
     * HTML, que es justo lo que el Δ0 de F2-3 no admite.
     */
    const doc = await payload.create({ collection: "media", filePath: abs, data: { rutaOrigen: ruta } });
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

  /**
   * Rutas de `upload` en las que el dato medido usa `""` para decir «no hay».
   * Lo apunta la IDA al verlo; la VUELTA lo consulta. Una sola definición, dos
   * sentidos — igual que `formaDeRel` y por la misma razón.
   */
  const centinelas = new Set();
  const centinelaVacio = (ruta) => centinelas.add(rutaLimpia(ruta));
  const esCentinela = (ruta) => centinelas.has(rutaLimpia(ruta));

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
   *
   * ⚠⚠ **La llave es (RUTA, slug), no el slug (corregido el 2026-08-04).** Un
   * `Set` de slugs a secas daba **7 `kind` inventados** en el cuerpo de los
   * monográficos: `claim` y `titular` nombran **dos bloques distintos** —el
   * módulo de `modulos[]`, que trae `kind`, y el bloque de `bloques[]`, que
   * discrimina por la clave presente y no lo trae— y marcar el slug marcaba los
   * dos. Es la misma forma que `formaDeRel`, y por eso usa la misma
   * `rutaLimpia`: una propiedad **del sitio**, no del nombre.
   */
  const CON_KIND = new Set(); // "rutaLimpia\0slug"
  const declaraKinds = (ruta, slugs) => {
    for (const s of slugs) CON_KIND.add(`${rutaLimpia(ruta)}\0${s}`);
  };
  const conKind = (ruta, slug, cuerpo) =>
    CON_KIND.has(`${rutaLimpia(ruta)}\0${slug}`) ? { kind: slug, ...cuerpo } : cuerpo;

  return {
    media, rel, registra, mediaPorRuta, idsPorColeccion, huerfanas, sinLlave, formaDeRel,
    rutaDeMedia, deRel, conKind, declaraKinds, declaraProyector,
    centinelaVacio, esCentinela, centinelas,
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
 * LA VUELTA DE `PREPARA` — ⚠ **no existía, y ésa era la mitad de las 157
 * diferencias del round-trip (2026-08-04).**
 *
 * El walker de `mapeo.mjs` es bidireccional **por construcción**: un solo
 * recorrido de la config leído al derecho y al revés. `PREPARA` no lo es —es una
 * transformación escrita a mano encima— así que **tenía ida y no vuelta**, y eso
 * no dio error: dio 72 diferencias con pinta de campo perdido.
 *
 * Dónde muerde, que no es donde parece: los documentos de `productos` se
 * comparan ya preparados en los dos lados, así que ahí cuadraban. Lo que no
 * cuadra es el **documento EMBEBIDO**: `sectores.soluciones` guarda el `Product`
 * entero con sus nombres medidos (`id` · `name` · `href`), y el proyector
 * devolvía el documento con los del ESQUEMA (`slug` · `titulo`). Los dos son
 * correctos en su lado; lo que faltaba era el traductor de vuelta.
 *
 * ── `href`: la REGLA DE RUTAS LOCALES, y no es una pérdida de modelo ───────
 * §4 no guarda `href`: la ruta se compone de `padre` + `slug`. Así que la vuelta
 * la reconstruye **local**, y el dato medido trae **3 locales y 6 absolutas al
 * original** (derivado del catálogo, no recordado):
 *
 *     /monitor-calidad-aire                                       ← construido
 *     https://kunakair.com/es/cartuchos-inteligentes/amoniaco/     ← referenciado
 *
 * Y ese reparto **no es ruido: es exactamente `CLAUDE.md` §Regla de rutas
 * locales** —*«si el destino ya está clonado, el href va a la ruta local; si no,
 * se deja apuntando al original hasta que se clone»*—, o sea la misma regla de
 * la que **T7** (§3.2) es la mitad de cuerpo rico. Los 6 absolutos son los 6
 * productos que el clon sólo REFERENCIÓ (`qa:cms-arquetipos`); **dentro del CMS
 * los 24 son documentos**, así que su ruta es local por definición y
 * reconstruirla local es la regla haciendo su trabajo, no un dato perdido.
 *
 * Por eso el comparador **normaliza el lado medido con `rutaLocal()`** —una
 * función sobre la CADENA medida— y la vuelta **la compone de `padre` + `slug`».
 * Son **dos cálculos independientes que tienen que coincidir**: si discreparan,
 * el comparador lo dice. No es una tolerancia compartida.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **`PREPARA` y `DEVUELVE` son un par escrito a mano, así que su coherencia
 * se EJECUTA, no se declara.** El comentario que esto sustituye prometía un
 * `aliasCoherentes()` que no existía (regla 3, en `mapeo.mjs`). Esto sí corre:
 * `DEVUELVE(PREPARA(fila))` sobre cada fila del catálogo, contra la fila medida
 * ya normalizada por `comoEmbebido`. Devuelve las rutas que no vuelven.
 */
export function sonInversas(coleccion, filas) {
  const ida = PREPARA[coleccion];
  const vuelta = DEVUELVE[coleccion];
  if (!ida || !vuelta) return [];
  const rotas = [];
  for (const fila of filas) {
    const esperado = comoEmbebido(coleccion, fila);
    const real = vuelta(ida(fila));
    for (const k of new Set([...Object.keys(esperado), ...Object.keys(real)]))
      if (JSON.stringify(esperado[k]) !== JSON.stringify(real[k]))
        rotas.push({ coleccion, slug: fila.slug ?? fila.id, campo: k });
  }
  return rotas;
}

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

/* ══════════════════════════════════════════════════════════════════════════
 * T4 · LOS `<script>` DEL CORPUS — ⚠ y **T4 TIENE DOS MITADES**, que es lo que
 * el PLAN no decía y por lo que quedó en el bloque equivocado.
 *
 * `PLAN-FASE-2.md` puso los seeds en el bloque 1 y T1–T8 en el bloque 2. Medido:
 * **el seed NECESITA T4**, porque el `validate` de `campoHtml` (§3.3) rechaza
 * `<script>` y **4 de las 7 entradas lo traen** — `npm run cms:sondeo` lo deriva
 * corriendo el `validate` de cada campo contra su dato, ya no se cuenta a mano.
 *
 * Pero «subir T4 al bloque 1» entero **no se puede**, y la razón es de dato, no
 * de tiempo:
 *
 * | mitad | qué hace | dónde puede estar |
 * |---|---|---|
 * | **T4a · la REGLA** | ningún `<script>` sobrevive: se quita | **aquí**. Es mecánica y no inventa nada |
 * | **T4b · la SUSTITUCIÓN** | el PDF pasa a media, el embed a nodo tipado, el reproductor a enlace (§3.3) | ~~bloque 2~~ → **AQUÍ TAMBIÉN, desde 2026-08-06** |
 *
 * ⚠ **CORREGIDO 2026-08-06 — la razón escrita arriba era una premisa YA FALSADA,
 * y llevaba dos tandas sin que nadie volviera a por ella.**
 *
 * La celda decía *«necesita datos que el catálogo NO tiene: el fichero PDF, la
 * URL de la noticia»*. `PLAN-FASE-2.md` §871 la derribó en la tanda 30.ª —*«T4b
 * es DERIVABLE: la premisa del PLAN es falsa para 6 de los 17»*— porque **la
 * referencia al PDF viaja dentro del payload base64 del propio `<script>`**.
 * Comprobado ahora contra el catálogo del seed, no contra el corpus: **3 de 3
 * visores FB3D derivables por `payload`, `post()` limpia, 0 payloads
 * ilegibles**.
 *
 * Y el mecanismo del fallo es §sondas 3 en su tercera forma: allí un comentario
 * prometía una LLAMADA que no existía, y luego unos CONSUMIDORES que no
 * existían; aquí prometía **una RAZÓN**, medida falsa, en el único sitio del
 * repo que nadie ejecuta ni verifica. La sonda de al lado imprimía
 * `0 sustituidos` como **literal de cadena**, no como recuento — así que ni
 * siquiera contradecía al comentario.
 *
 * **Lo que T4b NO arregla, y por eso el criterio de aceptación es de bloque y no
 * de ruta:** T4b **sustituye, no restaura**. El visor de PDF pasa a ser un
 * enlace al PDF: el CONTENIDO se conserva, la PRESENTACIÓN no. Y `nbc` +
 * `instagram` siguen sin sustituto —el primero por imposible, el segundo porque
 * no lo necesita—. El criterio, con su diana por clase, está en
 * `PENDIENTES-QA.md` §F2-3-T4B-CRITERIO; el instrumento, en `qa:t4b-bloque`.
 *
 * **La pérdida que QUEDA se cuenta y se nombra igual.** Un `?? ""` silencioso
 * aquí sería exactamente el verde falso del que va toda la casa: la eliminación
 * se congela con su clasificación §3.3, y el seed la imprime **con el número
 * contado, no escrito**.
 *
 * **T8 va antes, y sobre este corpus resulta ser NO-OP**: los 5 scripts llevan el
 * token de Rocket Loader en su `type`, y **medido: 5 dentro de `<script>`, 0
 * fuera**, así que T4a se lo lleva por delante. T8 sigue haciendo falta en el
 * importador del bloque 2, donde la comparación se hace contra el HTML crudo del
 * origen ANTES de transformar — que es donde el token produce el ruido de
 * re-import que §3.2 documenta.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Clasificación §3.3, por lo que el script CARGA o DEFINE. */
const CLASE_SCRIPT = [
  [/FB3D_CLIENT_DATA/, "FB3D FlipBook — visor de PDF; el contenido real es un PDF ⇒ relación a media (§3.3)"],
  [/instagram\.com\/embed\.js/, "Instagram ⇒ nodo-embed tipado `proveedor: instagram` (§3.3)"],
  [/platform\.twitter\.com/, "Twitter/X ⇒ nodo-embed tipado `proveedor: twitter` (§3.3)"],
  [/flourish\.studio/, "Flourish ⇒ nodo-embed tipado `proveedor: flourish` (§3.3)"],
  [/nbcwashington\.com\/portableplayer/, "Reproductor NBC ⇒ enlace a la noticia (§3.3, resuelto 2026-07-30)"],
  [/cdn\.jsdelivr\.net/, "Swiper 8 desde jsDelivr ⇒ galería nativa (§3.3)"],
];

const SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
/** El token de 24 hex que Cloudflare Rocket Loader antepone al `type` (T8). */
const ROCKET = /\btype=("|')[0-9a-f]{24}-(text\/javascript)\1/gi;

/** Lo que T4a quitó, para que la pérdida no sea silenciosa. */
export const SCRIPTS_ELIMINADOS = [];
/** Lo que T4b SÍ sustituyó. Se cuenta: el `0 sustituidos` era un literal. */
export const SUSTITUCIONES_T4B = [];
/** Payloads base64 de FB3D que no se pudieron leer. Cero no se supone: se mide. */
export const PAYLOAD_ILEGIBLE = [];

/**
 * T8 + T4a sobre una cadena de HTML. Devuelve el HTML sin scripts y apunta cada
 * eliminación —con su clase §3.3 y el script entero— en `SCRIPTS_ELIMINADOS`.
 */
export function aplicaT4(html, donde) {
  if (typeof html !== "string" || !SCRIPT.test(html)) return html;
  SCRIPT.lastIndex = 0;
  const conT8 = html.replace(ROCKET, (_m, q, tipo) => `type=${q}${tipo}${q}`);
  /* ── T4b ANTES de T4a, y el orden es DATO, no preferencia ────────────────
   * La referencia al PDF de los visores FB3D vive **dentro del `<script>`**
   * (payload base64), así que después de T4a ya no existe. Es el mismo orden
   * que `TRANSFORMACIONES` declara en `transformaciones.mjs`, y se importa de
   * allí en vez de re-implementarse: **una sola definición**. Re-escribirla
   * aquí es cómo nació este defecto —el seed tenía su propia copia de T4a y por
   * eso nunca vio a T4b— y repetirlo sería arreglar la instancia, no la clase.
   *
   * `post()` de T4b es su POSTCONDICIÓN: un visor que quede sin sustituir se
   * anota y TIRA, en vez de pasar por T4a y desaparecer en silencio. */
  const ctx = { pagina: donde, sustitucionesT4b: SUSTITUCIONES_T4B, payloadIlegible: PAYLOAD_ILEGIBLE, mediaDelCuerpo: [] };
  const conT4b = T4B.aplica(conT8, ctx).html;
  const mal = T4B.post(conT4b);
  if (mal.length)
    throw new Error(
      `T4b · POSTCONDICIÓN INCUMPLIDA en ${donde}:\n  ${mal.join("\n  ")}\n` +
        `  Dejarlo pasar sería que T4a se llevara el <script> y el contenido desapareciera\n` +
        `  sin que nadie lo contara. La ausencia se rechaza, no se sustituye (regla 6).`,
    );
  return conT4b.replace(SCRIPT, (script) => {
    const clase = CLASE_SCRIPT.find(([re]) => re.test(script))?.[1] ?? null;
    if (!clase)
      /* Regla 6: un script que no se sabe qué es NO se quita en silencio. §3.3
       * clasificó los 17 del corpus uno a uno; uno nuevo es dato nuevo. */
      throw new Error(
        `T4 · SCRIPT SIN CLASIFICAR en ${donde}:\n  ${script.replace(/\s+/g, " ").slice(0, 160)}\n` +
          `  §3.3 clasificó los 17 del corpus uno a uno. Éste no está, así que no se\n` +
          `  puede quitar «como los demás»: clasifícalo primero.`,
      );
    SCRIPTS_ELIMINADOS.push({ donde, clase, script: script.replace(/\s+/g, " ").slice(0, 400) });
    return "";
  });
}

/** Aplica T4 a todas las cadenas del dato. El catálogo medido no se toca. */
export function podaScripts(fila, donde) {
  const anda = (v, ruta) => {
    if (typeof v === "string") return aplicaT4(v, ruta);
    if (Array.isArray(v)) return v.map((x, i) => anda(x, `${ruta}[${i}]`));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, anda(x, `${ruta}.${k}`)]));
    return v;
  };
  return anda(fila, donde);
}

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
      const preparada = podaScripts(
        podaFrontera((PREPARA[coleccion] ?? ((x) => x))(fila)),
        `${coleccion}/${fila.slug ?? fila.id}`,
      );
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

  /* ── T4a, en voz alta. Lo que se quitó y NO se sustituyó es contenido que hoy
   *    no está en el CMS: si esto se imprimiera sin contarse, sería la regla 1
   *    (*lo que se imprime se cuenta*) rota en el sitio más caro. ────────── */
  if (SCRIPTS_ELIMINADOS.length || SUSTITUCIONES_T4B.length) {
    /* ⚠ Los dos números se CUENTAN. El `0 sustituidos` de antes era un LITERAL
     * de cadena: decía la verdad y no la medía, así que el día que dejó de ser
     * verdad habría seguido diciendo cero. Regla 1 — lo que se imprime, se
     * cuenta. */
    console.log(
      `\n── T4 · ${SCRIPTS_ELIMINADOS.length} <script> eliminados (T4a) · ` +
        `${SUSTITUCIONES_T4B.length} sustituidos (T4b) ──`,
    );
    for (const s of SUSTITUCIONES_T4B) console.log(`  ✓ ${s.pagina}\n      ${s.clase} · vía ${s.via} → ${s.clave ?? s.visualizacion}`);
    for (const s of SCRIPTS_ELIMINADOS) console.log(`  · ${s.donde}\n      ${s.clase}`);
    if (PAYLOAD_ILEGIBLE.length) {
      console.log(`  ⚠ ${PAYLOAD_ILEGIBLE.length} payload(s) base64 ILEGIBLES:`);
      for (const p of PAYLOAD_ILEGIBLE) console.log(`      ${p.pagina}: ${p.error}`);
    }
    console.log(
      `  ⚠ LO QUE SIGUE SIN SUSTITUTO no es un escalón, es una lista con dueño:\n` +
        `    · nbc ×1 — IMPOSIBLE: el <script> sólo da la URL del REPRODUCTOR con su CID\n` +
        `      caducable; la del artículo no está en el dato (§3.3);\n` +
        `    · instagram ×1 — NO LO NECESITA: el <blockquote> sobrevive con su permalink.\n` +
        `    Y T4b SUSTITUYE, no restaura: el visor de PDF pasa a ser un enlace al PDF.\n` +
        `    Criterio de aceptación por clase: PENDIENTES-QA.md §F2-3-T4B-CRITERIO.`,
    );
  }

  return {
    resumen,
    ctx,
    taxonomias,
    catalogos,
    scriptsEliminados: SCRIPTS_ELIMINADOS,
    sustitucionesT4b: SUSTITUCIONES_T4B,
    payloadIlegible: PAYLOAD_ILEGIBLE,
  };
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
