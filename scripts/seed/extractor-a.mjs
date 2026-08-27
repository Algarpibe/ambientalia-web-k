/**
 * EXTRACTOR DEL GRUPO A — del corpus congelado al CATÁLOGO completo.
 * Uso: npm run cms:extractor-a
 * Negativos: SABOTAJE=selector-muerto | control-roto | cuerpo-ausente | cuerpo-cambiado
 *
 * ── Qué es esto, y por qué hace falta ─────────────────────────────────────
 * `D2.7` decide sembrar el corpus completo. La maquinaria de F2 ya sabe sacar
 * **el cuerpo** (`cms:extractor` → `corpus/transformado/`, T1–T8 + saneador),
 * pero **nadie sacaba los METADATOS**: el seed lee `src/lib/arquetipo-a.ts`, que
 * es una **transcripción de MUESTRA** —7 entradas de 149— hecha a mano cuando
 * el arquetipo se midió.
 *
 * Este extractor produce el catálogo entero desde la captura, con la misma
 * forma que el tipo medido (`EntradaBlog` · `TerminoKunakpedia` ·
 * `DocumentoCientifico`), y lo congela en `medidas/a-extraido.json`.
 *
 * ── Por qué el dato pasa a nacer aquí y no en `src/lib` ───────────────────
 * Es el precedente de **F3-1**: `articulos-kb` **nace en el CMS**, sembrado
 * desde `medidas/kb-extraido.json`. Lo mismo aquí, con una diferencia que hay
 * que decir en voz alta: `src/lib/arquetipo-a.ts` **no se borra ni se
 * contradice** — se queda como (a) la definición de los TIPOS y (b) **el
 * CONTROL**. Que el extractor reproduzca los 7 transcritos a mano es lo que
 * autoriza a sustituir la fuente para los otros 142.
 *
 * ── Las guardas que cierran el código de salida ───────────────────────────
 * 1 · **CONTROL** — los 7 de `ENTRADAS_BLOG` (y los 3 términos, y los 4
 *     documentos) tienen que reproducirse campo a campo. Una discrepancia es
 *     roja: sin esto, «149 extraídos» sólo dice que un patrón casó 149 veces.
 *     ⚠ **Desde 2026-08-13 el CUERPO RICO entra en el control** (§PASO 3): hasta
 *     entonces comparaba 18 campos y ninguno era `cuerpo`, o sea que el HTML de
 *     T1–T8 llevaba desde F2-2 sin compararse contra nada;
 * 2 · **censo de lectores** — uno que no case en NINGÚN documento sale por
 *     error, nunca por cero (§sondas 4);
 * 3 · **cuerpo obligatorio** — un documento sin su fichero en
 *     `corpus/transformado/` no se emite a medias: TIRA. `undefined` en un
 *     campo rico es un render vacío servido con 200 (§sondas 6bis);
 * 4 · `Evaluadas` con el mínimo DERIVADO del índice, no escrito.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No toca el original, no siembra, no transforma el cuerpo (eso es
 * `cms:extractor`, cuyo resultado consume) y no decide modelo.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, clasificaDiscrepancia, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";
import { mediaPublicada } from "./media-publicada.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

/** T10 · el entorno, derivado una vez: qué media sirve el clon (§regla 6: TIRA si no hay árbol). */
const MEDIA_PUBLICADA = mediaPublicada();
const mediaCaliente = [];

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const TRANSFORMADO = join(CORPUS, "transformado");
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

if (!existsSync(TRANSFORMADO))
  throw new Error("no hay `corpus/transformado/`: corre `npm run cms:extractor` antes — el cuerpo sale de ahí, no de esta sonda.");

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const GRUPO_A = ["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"];

/* ══════════════════════════════════════════════════════════════════════════
 * LECTORES — sobre el HTML servido, con la regla del markup
 * ═════════════════════════════════════════════════════════════════════════ */

const censo = new Censo();
const cuenta = (id, v) => {
  const vacio = v === null || v === undefined || (Array.isArray(v) && !v.length);
  censo.total[id] = (censo.total[id] || 0) + (vacio ? 0 : 1);
  return v;
};

const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

/* ══════════════════════════════════════════════════════════════════════════
 * LA FIRMA — 117.ª · la `ficha-autor-revisor`, en 152 de 152 entradas
 *
 * ⚠ **SE LEE DEL DOCUMENTO, NO DEL CUERPO TRANSFORMADO, y eso es medida.**
 * La ficha vive en un MÓDULO DE LA PLANTILLA (`et_pb_text_N_tb_body`), no en
 * el `post_content`. Buscarla en el cuerpo rico daría **0 en las 152** y se
 * leería como «la transformación la perdió» — que es exactamente el tercer
 * defecto de la 116.ª: *comparar el cuerpo rico contra la página entera*
 * (§regla 40, y §*la salida servida incluye el canal que no estabas mirando*).
 *
 * ⚠ **EXTRACCIÓN BALANCEADA, NO UNA VENTANA.** Una `slice` alrededor de la
 * ficha se lleva las imágenes del cuerpo que vienen detrás: medido, una
 * ventana de 2500 chars daba **17** fotos donde el bloque balanceado da **5**
 * (§sondas 4, la cara del sobre-casado).
 * ═════════════════════════════════════════════════════════════════════════ */
function bloqueBalanceado(html, desde) {
  const re = /<div\b[^>]*>|<\/div>/gi;
  re.lastIndex = desde;
  let prof = 0, m;
  while ((m = re.exec(html))) {
    prof += m[0][1] === "/" ? -1 : 1;
    if (prof === 0) return html.slice(desde, re.lastIndex);
  }
  return null;
}

const soloTexto = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/**
 * Devuelve `{ firmas, autores }` de un documento, o `null` si no hay ficha.
 * El ORDEN importa: el elemento 0 se pinta en el hueco `revisor` —el que lleva
 * la foto, 152 de 152— y el 1 en `autor`, que no la lleva (2 de 2).
 */
function firmasDe(html) {
  const i = html.indexOf('<div class="ficha-autor-revisor"');
  if (i < 0) return null;
  const bloque = bloqueBalanceado(html, i);
  if (!bloque) return null;

  const firmas = [];
  const autores = [];
  const re = /<div class="(revisor|autor)">/gi;
  let m;
  while ((m = re.exec(bloque))) {
    const b = bloqueBalanceado(bloque, m.index);
    if (!b) continue;
    const href = (b.match(/href="([^"]+)"/) || [])[1] || null;
    const slug = href ? (href.match(/\/author\/([^/]+)/) || [])[1] || null : null;
    if (!slug) continue; // una llave que no se puede derivar se TIRA (§regla 33)
    const img = (b.match(/<img[^>]*\bsrc="([^"]+)"/) || [])[1] || null;
    const p = (b.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    const nombre = soloTexto((p.match(/<a[^>]*>([\s\S]*?)<\/a>/) || [])[1] || "");
    const proemio = soloTexto(p.replace(/<a[^>]*>[\s\S]*?<\/a>/g, "‹NOMBRE›"));
    firmas.push({
      /* TERMINO EMBEBIDO {slug, nombre}, como categorias y etiquetas: el render
       * necesita el NOMBRE para el texto del enlace, y una relacion dentro de
       * un array queda un nivel por debajo de depth:1, o sea que llegaria como
       * id. Subir el depth es la salida cara; el embebido es el patron que este
       * repo ya usa. Se declara con formaMedida: objeto en la coleccion. */
      autor: { slug, nombre: soloTexto(nombre) },
      papel: /^Revisado y aprobado/i.test(proemio) ? "revisado" : "escrito",
      proemio,
    });
    autores.push({ slug, nombre, foto: img });
  }
  return firmas.length ? { firmas, autores } : null;
}

const deco = (s) =>
  s === null || s === undefined
    ? s
    : s
        .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘")
        .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&hellip;|&#8230;/g, "…")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&nbsp;/g, " ")
        .trim();

const uno = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

/** T3b: la ruta del original pasa a la local que sirve el clon. */
const rutaLocalMedia = (u) =>
  u === null || u === undefined ? u : u.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "/images/uploads/").replace(/^\/wp-content\/uploads\//, "/images/uploads/");

const SEL = {
  h1: /<h1[^>]*>([\s\S]*?)<\/h1>/,
  title: /<title>([\s\S]*?)<\/title>/,
  desc: /<meta\s+name="description"\s+content="([^"]*)"/,
  og: /<meta\s+property="og:image"\s+content="([^"]*)"/,
  pub: /<span class="fecha-publicacion">([^<]*)<\/span>/,
  /**
   * `CMS-ORDEN-L2` §7g — la fecha de publicación del TÉRMINO, que es la clave
   * de orden de `/glosario/` (37/37, `qa:lh-fecha-orden`).
   *
   * ⚠ **Va contra `crudo`, NO contra `sin`**: el término no pinta su fecha en
   * ninguna parte, así que el único canal es el **JSON-LD**, y el JSON-LD vive
   * dentro de un `<script>` — lo que `sinScriptNiStyle` se lleva por delante.
   * Es el mismo par de canales con tratamiento opuesto que documenta la sonda:
   * el MARCADO se busca sin scripts, el DATO se busca con ellos.
   */
  pubIso: /"datePublished"\s*:\s*"([^"]+)"/,
  act: /<span class="fecha-actualizacion">\s*Actualizado\s*([^<]*)<\/span>/,
  /**
   * La destacada es un `et_pb_image` del `_tb_body`, FUERA del `post_content`
   * — medido: el `post_content` empieza después. Por eso es campo propio.
   *
   * ⚠ **Se ancla al `et_pb_image_wrap` y NO se deja cruzar su frontera.** La
   * primera versión hacía `…_tb_body">[\s\S]*?(<img…)` y en las páginas SIN
   * destacada el envoltorio existe **vacío** (`<span class="et_pb_image_wrap
   * "></span>`), así que el `[\s\S]*?` seguía buscando y se traía **la foto del
   * autor** de dos módulos más abajo. Lo cazó el CONTROL —la transcripción dice
   * que `todas-nuestras-soluciones-en-el-iotswc` no tiene destacada— y no lo
   * habría cazado ningún recuento: 149 de 149 «con imagen» es un pleno
   * plausible (§sondas 4, el complementario).
   */
  destacada: /<div class="et_pb_module et_pb_image et_pb_image_0_tb_body">\s*<span class="et_pb_image_wrap[^"]*">([\s\S]*?)<\/span>/,

  /* ── los CINCO del documento científico (PASO 5, 2026-08-12) ────────────
   * Los cuatro lectores de abajo cubren `autores` · `anyo` · `portada` ·
   * `descarga.{href,label}`, que §2.4 declara `required` en las 23 y que el
   * extractor no leía. No es un hallazgo: era trabajo declarado. */

  /** `<div class="scientific-taxonomies"><strong>Reche et al.</strong> | 2020<div …` */
  autores: /<div class="scientific-taxonomies">\s*<strong>([\s\S]*?)<\/strong>/,
  /**
   * El año va SUELTO entre el `</strong>` y el `<div class="scientific-category">`,
   * con un `|` de separador que es **plantilla** (constante en las 23) y no dato.
   */
  anyo: /<div class="scientific-taxonomies">\s*<strong>[\s\S]*?<\/strong>\s*\|\s*([^<]*?)\s*<div/,
  /**
   * La PORTADA — mismo envoltorio que la destacada del blog, con la diferencia
   * de que aquí va **dentro de un `<a>`**, que es justo de donde sale la
   * descarga. Se ancla al módulo, no al `<a>`, para no depender de que exista.
   */
  portada: /<div class="et_pb_with_border et_pb_module et_pb_image et_pb_image_0_tb_body">([\s\S]*?)<\/div>/,
  /** El botón: su `href` es la descarga y su texto el rótulo (en INGLÉS). */
  descarga: /<a class="et_pb_button et_pb_button_0_tb_body[^"]*"\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/,
};

/**
 * El rótulo corto del término = **el último eslabón de la miga**, que no es
 * enlace y no lleva `class="pagina"` (medido: el `<li>` final sólo trae su
 * `<span itemprop="name">`).
 */
function migaDe(sin) {
  const i = sin.indexOf("kunak-breadcrumbs");
  if (i < 0) return null;
  const ol = sin.slice(i, sin.indexOf("</ol>", i));
  const ultimo = ol.slice(ol.lastIndexOf("<li"));
  const m = ultimo.match(/<span itemprop="name">([\s\S]*?)<\/span>/);
  return m ? textoPlano(m[1]) : null;
}

/**
 * ⚠ **Las etiquetas se sustituyen por UN ESPACIO, no por nada.** Es lo que hace
 * la transcripción medida: `Metano (CH<sub>4</sub>)` está transcrito como
 * `«Metano (CH 4 )»`, y el campo es texto plano. Reproducirlo es fidelidad a la
 * medida; «mejorarlo» a `Metano (CH4)` sería criterio propio.
 */
const textoPlano = (s) => deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

const attr = (tag, n) => { const m = tag.match(new RegExp(`${n}="([^"]*)"`)); return m ? m[1] : null; };

function imagen(tag) {
  if (!tag) return undefined;
  const src = rutaLocalMedia(attr(tag, "src"));
  if (!src) return undefined;
  const srcset = attr(tag, "srcset");
  const o = { src };
  if (srcset) o.srcset = srcset.split(",").map((p) => rutaLocalMedia(p.trim())).join(", ");
  for (const k of ["sizes", "width", "height"]) { const v = attr(tag, k); if (v) o[k] = v; }
  const alt = deco(attr(tag, "alt")); if (alt) o.alt = alt;
  return o;
}

/**
 * Los términos de una taxonomía, con su NOMBRE.
 *
 * ⚠ El nombre se lee **hasta `</a>` y se le quitan las etiquetas**: en la miga
 * el rótulo va envuelto (`<a …><span itemprop="name">Industria y contaminación
 * por olores</span></a>`), así que un `>([^<]*)<` capturaba **vacío** y caía al
 * slug — dando `nombre: "industria-y-contaminacion-por-olores"`, que **parece
 * un dato** y no lo es. Lo cazó el CONTROL.
 */
function terminosDe(sin, tax) {
  const re = new RegExp(`href="https://kunakair\\.com/es/${tax}/([^"/]+)/"[^>]*>([\\s\\S]*?)<\\/a>`, "g");
  const m = new Map();
  for (const x of sin.matchAll(re)) {
    const nombre = textoPlano(x[2]).trim();
    if (!m.has(x[1]) || (!m.get(x[1]) && nombre)) m.set(x[1], nombre);
  }
  return [...m].map(([slug, nombre]) => ({ slug, nombre: nombre || slug }));
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL TÉRMINO DE `resources` — DERIVADO DE LA MIGA, NO POR UN PREFIJO LITERAL
 *
 * ⚠ **Aquí vivió `terminosDe(sin, "recursos/articulos")`, y era un MODELO
 * CABLEADO que acertaba 81 veces y fallaba 2 en silencio.** La ficha es
 * §F3-LH-EXTRACTOR-PREFIJO-CABLEADO. Lo que lo hace instructivo no es el fallo:
 * es que **el modelo equivocado no dio error, dio 81 aciertos** — y un 81/83 se
 * lee como una medida.
 *
 * Los dos modelos y lo que los SEPARA (§DOS MODELOS QUE PREDICEN LO MISMO):
 *
 * | modelo | `…/recursos/articulos/<hija>/` | `…/recursos/<primer nivel>/` |
 * |---|---|---|
 * | cablear el prefijo `recursos/articulos` | acierta (81) | **falla — pierde el campo** |
 * | **derivar de la miga** | acierta (81) | **acierta (2)** |
 *
 * O sea que el denominador de la elección **es 2, no 83**: en las 81 hijas los
 * dos modelos dan exactamente lo mismo y no deciden nada.
 *
 * ── ⚠ Y el canal NO es el que la ficha proponía ───────────────────────────
 * §F3-LH-EXTRACTOR-PREFIJO-CABLEADO escribió *«el término se deriva de la miga
 * POR SU CLASE (`taxonomia padre` / `categoria`)»*. **Medido sobre las 149
 * entradas: 0 llevan clase en sus `<li>`.** Esas clases existen en el ARCHIVO
 * del término, no en la página del post — así que la recomendación describía un
 * canal servido en OTRA plantilla. Es §El principio otra vez, y por eso el
 * discriminador que se usa es el que sí está servido aquí: **la PROFUNDIDAD**.
 *
 * Formas de la cadena, medidas sobre las 149 (por nº de eslabones):
 *
 *   66 · `Inicio › Blog › <título>`                           ⇒ sin `recurso`
 *   81 · `Inicio › Recursos › <padre> › <hija> › <título>`    ⇒ la hija
 *    2 · `Inicio › Recursos › <primer nivel> › <título>`      ⇒ el de primer nivel
 *
 * Regla: **el eslabón más profundo bajo `/es/recursos/`, excluido el hub
 * `/es/recursos/` mismo.** Sirve para los dos niveles sin nombrar ninguno, que
 * es justamente lo que el prefijo cableado no podía hacer.
 *
 * ── Por qué se lee la MIGA y no el documento entero ───────────────────────
 * `terminosDe()` casa en **todo el HTML**, y la página de una entrada sirve
 * enlaces a `/es/recursos/…` fuera de la miga (las tarjetas de «también te
 * puede interesar», por ejemplo). La miga es el canal que declara **a qué
 * término pertenece ESTA entrada**; el resto son enlaces que hablan de otras.
 * ═════════════════════════════════════════════════════════════════════════ */

/** El `<ol>` de la miga, o `null` si la página no la sirve. */
function olMiga(sin) {
  const i = sin.indexOf("kunak-breadcrumbs");
  if (i < 0) return null;
  const fin = sin.indexOf("</ol>", i);
  return fin < 0 ? null : sin.slice(i, fin);
}

function recursoDeLaMiga(sin) {
  const ol = olMiga(sin);
  if (!ol) return undefined;
  const eslabones = [...ol.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((x) => x[1]);
  let mejor = null;
  for (const li of eslabones) {
    const href = (li.match(/href="https:\/\/kunakair\.com(\/es\/recursos\/[^"]*)"/) || [, null])[1];
    if (!href) continue;
    /* Los segmentos DESPUÉS de `recursos`. El hub `/es/recursos/` da 0 y no es
       un término: excluirlo es lo que evita adjudicarle a 66 entradas un
       `recurso` que no tienen. */
    const segmentos = href.replace(/^\/es\/recursos\//, "").replace(/\/$/, "").split("/").filter(Boolean);
    if (!segmentos.length) continue;
    const nombre = textoPlano((li.match(/<span itemprop="name">([\s\S]*?)<\/span>/) || [, ""])[1]).trim();
    if (!mejor || segmentos.length >= mejor.profundidad)
      mejor = { slug: segmentos[segmentos.length - 1], nombre, profundidad: segmentos.length };
  }
  if (!mejor) return undefined;
  return { slug: mejor.slug, nombre: mejor.nombre || mejor.slug };
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const trabajo = Object.entries(INDICE.paginas).filter(([c]) => GRUPO_A.includes(c.split("/")[0]));
const ev = new Evaluadas({ nombre: "extractor-a", unidad: "documentos del grupo A", minimo: trabajo.length });

const salida = { "entradas-blog": [], "terminos-kunakpedia": [], "documentos-cientificos": [] };
const sinCuerpo = [];

/**
 * LOS AUTORES (117.ª) — se acumulan desde las FIRMAS de las entradas, y sus
 * campos propios se completan desde SU ARCHIVO.
 *
 * ⚠ **Un autor sin entradas NO entra**, y eso es deliberado: la colección
 * existe para que las firmas apunten a algo. `mar_ramirez` tiene archivo y
 * firma **0** entradas (medido: 0 de 152), así que no se siembra — sembrarlo
 * sería añadir una fila que ninguna URL del clon alcanza. Se dice con su
 * cardinal en vez de dejarlo pasar por omisión.
 */
const AUTORES = new Map();

/* ══════════════════════════════════════════════════════════════════════════
 * EL DUPLICADO — SE DETECTA Y SE REPORTA; **NO SE EXCLUYE**
 *
 * ⛔⛔ **Y ESO ES UNA CORRECCIÓN DEL MISMO DÍA, cobrada por la MEDIDA (2026-08-17).**
 * Esta guarda se escribió **excluyendo**, con el razonamiento de abajo, que
 * parecía —y sigue pareciendo— sólido. Al medir, `lh-cmp` dijo lo contrario:
 *
 * | residuos de FECHA | inicio | tras sembrar | **tras excluir** |
 * |---|---|---|---|
 * | @1440 y @390 | 58 | **6** | **10** |
 *
 * **Excluirlo empeora.** Y la razón, mirada después, es de manual:
 *
 * > **`D2.4` contesta «¿es una RUTA?» y aquí hacía falta contestar «¿es un
 * > DOCUMENTO?», que no es la misma pregunta.** En el dominio donde `D2.4` se
 * > derivó —los `/page/N`— las dos coinciden, porque un `/page/N` **no aparece
 * > listado en ningún sitio**. Para una ENTRADA se separan: el original
 * > **redirige su permalink** y **sigue listando su tarjeta** en los archivos de
 * > etiqueta. Lo que 301 es la URL del documento, no su presencia en la lista.
 *
 * Es §*una regla derivada sobre un dominio donde el caso NO SE DA está SIN
 * PROBAR para ese caso*, en su forma más cara: la derivación era correcta, el
 * dominio era real, y **la conclusión no se sigue**. Lo único que lo separó de
 * un acierto fue **medir después de aplicar** — leer el precedente otra vez
 * habría vuelto a dar «sí, lo cubre» las veces que hiciera falta.
 *
 * ⇒ **ESCALÓN 1 del encargo**: *«si el 301 no lo cubre el precedente escrito,
 * para y ficha: qué es una ruta es decisión firmada en este proyecto, no
 * criterio de tanda»*. Ficha con sus salidas: `PENDIENTES-QA.md`
 * §F3-LH-ENTRADA-QUE-ES-UN-301. **Aquí sólo se DERIVA y se NOMBRA.**
 *
 * ── El razonamiento que NO basta, conservado porque es la mitad correcta ───
 * `DECISIONES.md` §D2.5, la tabla que cierra `D2.4`: *«El original **declara él
 * mismo** cuáles de sus URL son rutas, y lo declara **en el canonical**»* —
 * canonical **a sí misma** ⇒ *«sí soy una ruta»*, canonical **a otra** ⇒ *«no
 * soy una ruta» ⇒ 404 en el clon*. Y textualmente: *«**la misma regla da las dos
 * respuestas**»*.
 *
 * Aquí el objeto es una ENTRADA en vez de un `/page/N`, y el discriminador da la
 * misma respuesta con **más** margen, no con menos:
 *
 * | canal servido | qué dice de `medicion-de-gases-en-los-vertederos-de-basura` |
 * |---|---|
 * | el servidor, medido en vivo el 2026-08-17 | **HTTP 301** → `/es/contaminacion-del-aire-en-vertederos/` |
 * | `<link rel=canonical>` de su captura | **la otra** |
 * | `og:url` | **la otra** |
 * | `<title>` | **el de la otra** |
 *
 * > **Los casos de `D2.4` servían 200 y sólo el canonical los delataba. Éste ni
 * > siquiera se sirve.** O sea que si la regla alcanzaba a aquéllos, a éste le
 * > sobra — la diferencia entre los dominios apunta **en la dirección segura**.
 *
 * ── Y la vuelta que había que dar antes de aplicarla (§regla 9) ───────────
 * La ficha declaraba el barrido como NO CORRIDO, así que se corrió: de los
 * **212** documentos del grupo A, **1** trae canonical a otro slug. Los otros 3
 * que el barrido saca **no traen canonical NINGUNO** —y su `og:url` apunta a sí
 * mismos, y el original en vivo tampoco lo sirve—, así que **no son duplicados**:
 * son documentos con un canal ausente, que es otra cosa. De ahí que la guarda
 * mire los DOS canales y que «ausente» NO cuente como duplicado.
 *
 * ── Se RECALCULA, no se lee una marca (la lección de `duplicado-sin-marcar`) ─
 * No hay lista de exclusión. Si mañana el original redirige otro slug, entra
 * solo; y si deja de redirigir éste, sale solo. Una lista a mano es §regla 9 en
 * código, y este repo ya la pagó en `cobertura.mjs`.
 * ═════════════════════════════════════════════════════════════════════════ */
const slugDe = (url) => {
  try { return new URL(url).pathname.replace(/\/+$/, "").split("/").pop() || null; }
  catch { return null; }
};
/** El slug que el documento dice ser, por los canales servidos. `null` = no lo dice. */
const seDeclaraComo = (crudo) => {
  const can = uno(crudo, /<link rel="canonical" href="([^"]+)"/);
  if (can) return { slug: slugDe(can), canal: "canonical", url: can };
  const og = uno(crudo, /property="og:url" content="([^"]+)"/);
  if (og) return { slug: slugDe(og), canal: "og:url", url: og };
  return { slug: null, canal: null, url: null };
};
const duplicados = [];

for (const [clave, p] of trabajo) {
  const col = clave.split("/")[0];
  const slug = clave.slice(col.length + 1);
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const sin = sinScriptNiStyle(crudo);

  /* Se DETECTA y se REPORTA; **no se excluye**. Ver la cabecera: el precedente
   * contesta «no es una ruta» y NO contesta «no es un documento», que es la
   * pregunta que hace falta aquí. */
  const dice = seDeclaraComo(crudo);
  if (dice.slug && dice.slug !== slug) duplicados.push({ clave, seDeclara: dice.slug, canal: dice.canal, url: dice.url });

  const fCuerpo = join(TRANSFORMADO, `${clave}.html`);
  if (SABOTAJE === "cuerpo-ausente" && salida["entradas-blog"].length === 3) { sinCuerpo.push(clave); ev.fallo(clave, "cuerpo ausente (sabotaje)"); continue; }
  if (!existsSync(fCuerpo)) { sinCuerpo.push(clave); ev.fallo(clave, "sin cuerpo en corpus/transformado"); continue; }
  const cuerpo = readFileSync(fCuerpo, "utf8");

  const titulo = cuenta("titulo", deco(uno(sin, SABOTAJE === "selector-muerto" ? /<h9[^>]*>([\s\S]*?)<\/h9>/ : SEL.h1)?.replace(/<[^>]+>/g, "")));
  const seo = {
    title: cuenta("seo.title", deco(uno(crudo, SEL.title))),
    description: cuenta("seo.description", deco(uno(crudo, SEL.desc))) ?? undefined,
    ogImage: cuenta("seo.ogImage", rutaLocalMedia(uno(crudo, SEL.og))) ?? undefined,
  };
  if (seo.description === undefined) delete seo.description;
  if (seo.ogImage === undefined) delete seo.ogImage;

  const base = { slug, seo, titulo, cuerpo };

  if (col === "entradas-blog") {
    const envoltorio = uno(sin, SEL.destacada);
    const destacada = imagen(cuenta("destacada", envoltorio ? (envoltorio.match(/<img[^>]*>/) ?? [null])[0] : null));
    /* §F3-LH-EXTRACTOR-PREFIJO-CABLEADO — derivado de la miga, ver arriba. El
       `cuenta()` lo mete en el censo de lectores, así que un selector que deje
       de casar sale por su cero en vez de por un campo que desaparece. */
    const recurso = cuenta("recurso", SABOTAJE === "selector-muerto" ? undefined : recursoDeLaMiga(sin));
    const doc = {
      ...base,
      fechaPublicacion: cuenta("fechaPublicacion", deco(uno(sin, SEL.pub))) ?? "",
      categorias: cuenta("categorias", terminosDe(sin, "categoria")),
      etiquetas: cuenta("etiquetas", terminosDe(sin, "etiqueta")),
      relacionados: /tambi[ée]n te puede interesar/i.test(sin),
    };
    const act = deco(uno(sin, SEL.act)); if (act) { cuenta("fechaActualizacion", act); doc.fechaActualizacion = act; }
    if (destacada) doc.imagenDestacada = destacada;
    if (recurso) doc.recurso = recurso;
    /* LA FIRMA (117.ª) — `cuenta()` la mete en el censo, así que si el selector
     * dejara de casar saldría por su CERO en vez de por un campo que
     * desaparece en silencio (§sondas 4). */
    const f = cuenta("firmas", SABOTAJE === "selector-muerto" ? null : firmasDe(sin));
    if (f) {
      doc.firmas = f.firmas.map((x) => ({ ...x, proemio: deco(x.proemio) }));
      for (const a of f.autores) {
        const ya = AUTORES.get(a.slug);
        if (!ya) AUTORES.set(a.slug, { slug: a.slug, nombre: deco(a.nombre), fotos: new Set(a.foto ? [a.foto] : []) });
        else if (a.foto) ya.fotos.add(a.foto);
      }
    }
    salida["entradas-blog"].push(doc);
  } else if (col === "terminos-kunakpedia") {
    const miga = cuenta("miga", SABOTAJE === "selector-muerto" ? null : migaDe(sin));
    const doc = { ...base };
    /* SIN fallback a `""` a propósito (§sondas 6): si el canal se rompe, lo que
     * tiene que pasar es que el seed MUERA —el campo es `required`—, no que
     * entre un vacío que deje el listado en un orden inventado y en verde. */
    doc.fechaPublicacion = cuenta("termino.fechaPublicacion", uno(crudo, SEL.pubIso));
    /* El rótulo de la miga es campo con defecto «el título», OMITIDO cuando
     * coinciden — el mismo patrón que `prefijo` (CMS-1). */
    if (miga && miga !== titulo) doc.tituloMiga = miga;
    salida["terminos-kunakpedia"].push(doc);
  } else {
    const cat = terminosDe(sin, "scientific-category")[0];
    const envPortada = uno(sin, SABOTAJE === "selector-muerto" ? /<div class="et_pb_portada_inexistente">([\s\S]*?)<\/div>/ : SEL.portada);
    const mDescarga = SABOTAJE === "selector-muerto" ? null : sin.match(SEL.descarga);
    const doc = {
      ...base,
      categoria: cuenta("categoria", cat) ?? null,
      autores: cuenta("autores", textoPlano(uno(sin, SEL.autores))) ?? "",
      anyo: cuenta("anyo", deco(uno(sin, SEL.anyo))) ?? "",
      portada: cuenta("portada", imagen(envPortada ? (envPortada.match(/<img[^>]*>/) ?? [null])[0] : null)),
      descarga: cuenta("descarga", mDescarga ? { href: mDescarga[1], label: textoPlano(mDescarga[2]) } : null),
    };
    /* El prefijo se omite cuando vale el defecto (CMS-1). La ruta es
     * `/es/recursos/<prefijo>/<categoría>/<slug>/`, así que el prefijo es el
     * segmento **2**, no el 1 — el 1 es `recursos`, que es constante y por eso
     * daba «recursos» en las 23 sin dar error. */
    const pref = new URL(p.url).pathname.split("/").filter(Boolean)[2];
    if (pref && pref !== "documentos-cientificos") doc.prefijo = pref;
    /**
     * ⚠ **LA FIRMA TAMBIÉN AQUÍ — 23 de 23, y NO es la misma pregunta que
     * `autores`.** El campo `autores` de arriba es texto libre: los firmantes
     * del PAPER. `firmas` es quién lo publica en el sitio, que es la entidad
     * de la colección `autores`. Dos cosas distintas con nombres parecidos.
     *
     * Barridas las 23: **todas `kunak`**, **un** solo proemio y **0** con dos
     * papeles. O sea que aquí la constante del clon SÍ acertaba — y aun así se
     * modela, porque lo que la hacía falsa en blog es el mismo mecanismo, y
     * §*el test B no ve un campo que el editor puso UNIFORME*: varianza cero
     * dentro de una forma no prueba plantilla cuando la forma hermana varía.
     */
    const fd = cuenta("firmas", SABOTAJE === "selector-muerto" ? null : firmasDe(sin));
    if (fd) {
      doc.firmas = fd.firmas.map((x) => ({ ...x, proemio: deco(x.proemio) }));
      for (const a of fd.autores) {
        const ya = AUTORES.get(a.slug);
        if (!ya) AUTORES.set(a.slug, { slug: a.slug, nombre: deco(a.nombre), fotos: new Set(a.foto ? [a.foto] : []) });
        else if (a.foto) ya.fotos.add(a.foto);
      }
    }
    salida["documentos-cientificos"].push(doc);
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTROL — los transcritos a mano tienen que reproducirse
 * ═════════════════════════════════════════════════════════════════════════ */

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
mkdirSync(join(QA, ".tmp"), { recursive: true });
const bundle = join(QA, ".tmp", "arquetipo-a-ext.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/arquetipo-a.ts")],
  outfile: bundle, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const LIB = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

const control = [];
/**
 * ⚠⚠ **EL CONTADOR ES REAL DESDE LA 117.ª — antes era una FÓRMULA A MANO.**
 *
 * `nControl` se calculaba como `ENTRADAS_BLOG.length * 12 + TERMINOS * 4 +
 * DOCUMENTOS * 8`, o sea con un multiplicador ESCRITO por campo. Consecuencia:
 * añadir una comparación **no movía el número**, y el titular seguía diciendo
 * «128 comparaciones» mientras se hacían 139. Es §regla 9 caso 7 —*un conjunto
 * enumerado a mano dentro de una sonda es un dato recordado*— cometido sobre
 * el **denominador del propio control**, que es el sitio donde peor sienta:
 * §sondas 1 dice que *lo que imprime y lo que cuenta no pueden discrepar*.
 *
 * Se cuenta aquí, que es por donde pasan todas.
 */
let nComparaciones = 0;
const cmp = (slug, campo, leido, esperado) => {
  nComparaciones++;
  const a = JSON.stringify(leido ?? null), b = JSON.stringify(esperado ?? null);
  if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null, clases: ["valor"] });
};
/** Normaliza una firma a lo que la transcripcion a mano puede afirmar del HTML
 * servido de ESA pagina: el slug del autor, el papel y el proemio. El resto del
 * autor vive en SU archivo, o sea en otro documento. */
const firma = (fs_) => (fs_ ?? []).map((f) => ({ autor: f.autor?.slug ?? f.autor, papel: f.papel, proemio: f.proemio }));
const porSlug = (col) => new Map(salida[col].map((d) => [d.slug, d]));

/* ══════════════════════════════════════════════════════════════════════════
 * EL CUERPO — el campo que este control NO comparaba, y era el que importa
 *
 * ⚠ **Añadido el 2026-08-13 (§DATOS-C-PIPELINE, PASO 3).** Hasta hoy el control
 * comparaba 18 campos y **ninguno era `cuerpo`**, así que el HTML que T1–T8
 * produce llevaba desde F2-2 **sin compararse contra nada** — y el verde decía
 * *«los metadatos se reproducen»*, no *«el cuerpo se reproduce»*. Es §el
 * séptimo contenedor: la unidad en la que se declara la cobertura de un control
 * absorbe lo que no compara.
 *
 * **Y alcanza a §DATOS-PIXEL**: las 8 rutas que se movieron al cambiar de
 * fuente son de este arquetipo, y su Δ no se podía adjudicar porque no había
 * ningún instrumento que mirara el objeto que cambió.
 *
 * Se compara con `clasificaDiscrepancia` (`qa/lib.mjs`), que es el MISMO
 * instrumento de `extractor-c` —importado, no copiado (clase C7)—: exige
 * identidad **plegada la serialización** y devuelve la CLASE de lo que difiere.
 * Una clase que no reconoce sale `SIN CLASIFICAR`, y eso es rojo.
 */
/**
 * Los pliegues del PIPELINE de este proyecto. No pueden vivir en `lib.mjs` sin
 * atarla a `transformaciones.mjs`, así que se inyectan.
 *
 * **Las dos son transformaciones DECLARADAS (§3.2 T3) y POSTERIORES a la
 * transcripción a mano**, que se escribió antes de que existieran. Que el
 * pipeline y la transcripción difieran aquí no es un defecto de ninguno de los
 * dos: es que miden momentos distintos del proyecto.
 */
/**
 * Las rutas publicadas, que T7 necesita para plegar. **Mismo conjunto y misma
 * fuente que `extractor.mjs`: SÓLO el manifiesto del build.** Si se leyera de
 * otro sitio, el pliegue aplicaría un T7 distinto del que produjo el cuerpo y
 * la comparación mediría la diferencia entre las dos listas.
 */
const rutasT7 = new Set();
{
  const m = enApp(".next/prerender-manifest.json");
  if (!existsSync(m))
    throw new Error("no hay `prerender-manifest.json`: sin él no se puede plegar T7, y plegarlo con 0 rutas daría un pliegue que no mira nada (la regla del cero).");
  for (const r of Object.keys(JSON.parse(readFileSync(m, "utf8")).routes ?? {})) rutasT7.add(r);
}
const ctxMudo = () => ({
  pagina: "control", rutas: rutasT7,
  scriptsQuitados: [], mediaDelCuerpo: [], sinLlaveT3b: [], sustitucionesT4b: [], payloadIlegible: [],
  noLocalizadas: [], relHuerfano: [],
  /* T10 · el entorno: qué media sirve el clon. Sin esto T10 TIRA (§regla 6). */
  mediaPublicada: MEDIA_PUBLICADA, mediaCaliente: [],
});
const PLIEGUES_PIPELINE = [
  /**
   * Los pliegues NO se escriben: se DERIVAN de `TRANSFORMACIONES`, así que una
   * transformación nueva entra sola y su divergencia contra la transcripción
   * deja de contar como defecto sin tocar esta sonda (§sondas 9: la afirmación
   * trae su derivación al lado).
   *
   * ⚠ **T7 ENTRA AQUÍ DESDE EL 2026-08-13, y sólo porque ya está decidida.**
   * Mientras §PASO 2/4 la arbitraban se quedó fuera a propósito: plegar lo que
   * estás decidiendo tapa justo lo que hay que medir. Tomada la decisión, T7 es
   * una transformación declarada como las otras nueve — **y la transcripción a
   * mano es anterior a ella igual que a T1 y a T3b**, así que su `href` al
   * original y su `target` no la contradicen: no la habían aplicado.
   *
   * **Lo que arbitra T7 no es la transcripción**, y por eso plegarla no deja un
   * hueco: la arbitran §Regla de rutas locales y §F2-3-HREF-DERIVADO (b), sus
   * **dos** postcondiciones, y el efecto medido — `1788 → 2` enlaces locales con
   * `target` y `53 → 2` destinos que el build no emite.
   *
   * Se pueden aplicar a la transcripción porque son **idempotentes por
   * contrato**: la postcondición de cada una exige que después no quede diana.
   *
   * ⚠ **Y lo que este pliegue NO puede probar, dicho en voz alta:** una
   * transformación con un defecto lo aplica IGUAL a los dos lados, así que el
   * pliegue lo esconde. La transcripción no puede arbitrar T1–T8 —se escribió
   * antes de que existieran—, y quien las guarda son sus POSTCONDICIONES y sus
   * censos en `cms:extractor`. Aquí se mide otra cosa: que fuera de ellas los
   * dos cuerpos son el mismo.
   */
  ...TRANSFORMACIONES.map((t) =>({
    clase: `${t.id}-declarada`,
    aplica: (s) => t.aplica(s, ctxMudo()).html,
    firma: (s) => String(t.diana(s, ctxMudo())),
  })),
  /**
   * ⚠ **`data-media` NO es una clase propia: es una CONSECUENCIA de
   * `media-original`, y por eso se pliega aparte.** T3b lo deriva de la llave
   * del `src`, y la llave sólo existe si el `src` apunta al prefijo de subidas
   * del original. La transcripción a mano **localizó el `src`**, así que su
   * llave no es derivable y su `<figure>` sale sin atributo — no porque T3b
   * falle, sino porque la entrada es otra.
   *
   * Que T3b lo emita cuando toca **está guardado en otro sitio**, y por eso
   * plegarlo aquí no deja un hueco: `medidas/extractor-corpus.json`
   * → `mediaDelCuerpo.referencias`, que es derivada y la consume el invariante
   * D de `qa:artefacto`.
   */
  { clase: "t3b-data-media", aplica: (s) => s.replace(/\s*data-media="[^"]*"/g, ""), firma: (s) => String((s.match(/data-media="/g) ?? []).length) },
  /**
   * `srcset` — **la transcripción es más VIEJA que la captura**, y aquí no hace
   * falta muestrear para saber de qué lado está la razón: se DERIVA.
   *
   * **Ninguna de las 10 transformaciones toca `srcset`** —T1 y T3a tocan
   * `class`, T2 toca `style`, T3b reutiliza el `<img>` verbatim— así que el
   * `srcset` del pipeline **es, por construcción, el del corpus congelado**, o
   * sea el del original. Comprobado además en las 2 instancias que divergen:
   * `contaminacion-por-metano` (original `980w 480w`, y la transcripción trae
   * un `1280w` que el original ya no sirve) y `running-for-clean-air` (original
   * `1751w 1280w 980w 480w`, y la transcripción se queda en `980w 480w`).
   *
   * WordPress regenera variantes; el original es un sitio vivo. No es defecto
   * de ninguno de los dos: es que miden fechas distintas, y el frozen manda.
   */
  {
    clase: "srcset-recapturado",
    /* `sizes` va CON `srcset`, no aparte: WordPress genera los dos del mismo
     * juego de variantes, así que cuando cambia el juego cambian los dos. Fue
     * el último residuo del PASO 3 — plegar sólo `srcset` dejaba `sizes` fuera
     * y sacaba un `SIN CLASIFICAR` que era la misma cosa con otro nombre. */
    aplica: (s) => s.replace(/\bsrcset="[^"]*"/g, 'srcset="·"').replace(/\bsizes="[^"]*"/g, 'sizes="·"'),
    firma: (s) => [...s.matchAll(/\b(?:srcset|sizes)="([^"]*)"/g)].map((m) => m[1]).join("|"),
  },
];

/**
 * ⚠ **LA ADJUDICACIÓN DE CADA CLASE, POR ESCRITO Y CON SU RAZÓN.**
 *
 * El clasificador dice EN QUÉ difieren; esta tabla dice **qué significa cada
 * diferencia**, y es lo único que separa un pliegue que MIDE de uno que TAPA.
 * Una clase que no esté aquí es roja por no estar adjudicada — que es la §regla
 * del cero aplicada al catálogo de clases: no reconocer una clase y no tener
 * ninguna dan la misma salida si el defecto por defecto es benigno.
 */
const CLASES = {
  espacio: ["dato", "la transcripción normalizó sangrado y finales de línea; el original sirve LF y CRLF MEZCLADOS (9184 CRLF en el corpus) — §PASO 2"],
  "cierre-xhtml": ["dato", "el original sirve `<br />` en las 3 instancias medidas; la transcripción lo normalizó a `<br>` — §PASO 2"],
  "espacio-duro": ["dato", "el original sirve U+00A0 CRUDO; la transcripción lo escapó a `&nbsp;` — §PASO 2"],
  /* Las declaradas se adjudican en bloque y por DERIVACIÓN, igual que se
   * pliegan: `<id>-declarada` es una transformación de §3.2 posterior a la
   * transcripción a mano, y su título dice cuál. */
  ...Object.fromEntries(
    TRANSFORMACIONES.map((t) =>[
      `${t.id}-declarada`,
      ["dato", `transformación declarada §3.2, POSTERIOR a la transcripción — ${t.titulo.slice(0, 72)}`],
    ]),
  ),
  "srcset-recapturado": ["dato", "ninguna de las 10 transformaciones toca `srcset`, así que el del pipeline ES el del corpus. La transcripción es más VIEJA que la captura y el original regenera variantes — arbitrado contra el corpus en 2/2"],
  "t3b-data-media": ["dato", "CONSECUENCIA de `media-original`: la llave sólo se deriva del `src` del original, y la transcripción lo localizó. Guardado aparte en `extractor-corpus.json` → `mediaDelCuerpo`"],
  /* ⚠ Siguen siendo DEFECTO, y eso NO contradice que T7 se pliegue: el pliegue
   * aplica T7 a los dos lados, así que si después de él un `href` o un `target`
   * todavía difieren, la diferencia **no es T7** — es otra cosa, y no tiene
   * adjudicación. Antes del 2026-08-13 llegaban aquí 9 y 9; hoy tienen que
   * llegar 0, y si vuelve alguno es un hallazgo. */
  href: ["DEFECTO", "difieren DESPUÉS de plegar T7, así que no lo explica T7 — §Regla de rutas locales + §F2-3-HREF-DERIVADO (b)"],
  target: ["DEFECTO", 'difieren DESPUÉS de plegar T7 — §Regla de rutas locales: `target="_blank"` sólo si el destino es externo'],
  "media-original": ["DEFECTO", "§Assets: «nunca se enlaza a kunakair.com en caliente», y el destino SÍ está publicado — §DATOS-MEDIA-HOTLINK"],
  "SIN CLASIFICAR": ["DEFECTO", "ninguna regla escrita la cubre"],
};

/**
 * ⚠ **DEFECTOS ABIERTOS, CON FICHA Y CON NÚMERO.**
 *
 * Un defecto declarado **sin número** es un permiso: deja pasar el suyo y todos
 * los que lleguen detrás con la misma etiqueta. Con número es una **medida que
 * caduca sola** — si aparece uno más, o se arregla uno, el control se pone rojo
 * y obliga a re-declarar. Es el mismo idioma que los 28 `404` del original y los
 * 2 `wp-caption` no canónicos: ausencia MEDIDA, no ausencia supuesta.
 *
 * `media-original` está aquí y `href`/`target` NO, y la diferencia es de
 * ALCANCE: los segundos los arregla esta tanda (T7, §PASO 4); el primero es una
 * transformación distinta sobre los mismos 209 cuerpos, y meterla en el mismo
 * re-sembrado haría **inatribuible** el efecto de T7 — que es exactamente el
 * agujero por el que §DATOS-PIXEL no se pudo adjudicar.
 */
/**
 * ✅ **`media-original` SE RETIRA, no se baja a 0 (2026-08-13, PASO 4).** T10
 * localiza la media del cuerpo, así que la clase deja de producirse: **9 → 0**,
 * y la guarda de «declaración caducada» lo cazó en la misma corrida en que se
 * aplicó. Un defecto abierto declarado a 0 sería una entrada que no puede
 * caducar nunca — o sea una guarda que dejó de vigilar sin decirlo.
 */
const ABIERTOS = {};

/** Los pares que son el MISMO documento con otra ortografía: dato, no defecto. */
const serializacion = [];
let nRicosComparados = 0;
const cmpRico = (slug, campo, leido, esperado) => {
  nRicosComparados++;
  const r = clasificaDiscrepancia(leido, esperado, PLIEGUES_PIPELINE);
  const defectos = r.clases.filter((c) => (CLASES[c]?.[0] ?? "DEFECTO") === "DEFECTO" && !(c in ABIERTOS));
  if (!defectos.length) {
    /* Todas sus clases están adjudicadas como DATO: se anota y no es discrepancia.
     * ⚠ `mismoDocumento` tiene que ser cierto para llegar aquí — si sobrevive
     * algo a todos los pliegues, `SIN CLASIFICAR` está en `clases` y es DEFECTO. */
    if (r.clases.length) serializacion.push({ slug, campo, clases: r.clases });
    return;
  }
  control.push({
    slug, campo, clases: r.clases, defectos,
    /* ⚠ RECORTADOS a 400: la congelada es para auditar el RECUENTO y las CLASES,
     * no para re-clasificar. Re-clasificar sobre el recorte da otro reparto. */
    leido: typeof leido === "string" ? leido.slice(0, 400) : (leido ?? null),
    esperado: typeof esperado === "string" ? esperado.slice(0, 400) : (esperado ?? null),
  });
};

const blog = porSlug("entradas-blog");
for (const e of LIB.ENTRADAS_BLOG) {
  const d = blog.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  const esp = SABOTAJE === "control-roto" ? { ...e, titulo: `${e.titulo} ✂` } : e;
  cmp(e.slug, "titulo", d.titulo, esp.titulo);
  cmp(e.slug, "seo.title", d.seo.title, esp.seo.title);
  cmp(e.slug, "seo.description", d.seo.description, esp.seo.description);
  cmp(e.slug, "seo.ogImage", d.seo.ogImage, esp.seo.ogImage);
  cmp(e.slug, "fechaPublicacion", d.fechaPublicacion, esp.fechaPublicacion);
  cmp(e.slug, "fechaActualizacion", d.fechaActualizacion, esp.fechaActualizacion);
  cmp(e.slug, "categorias", d.categorias, esp.categorias);
  cmp(e.slug, "etiquetas", [...d.etiquetas].sort((x, y) => x.slug.localeCompare(y.slug)), [...esp.etiquetas].sort((x, y) => x.slug.localeCompare(y.slug)));
  cmp(e.slug, "recurso", d.recurso, esp.recurso);
  cmp(e.slug, "relacionados", d.relacionados, esp.relacionados);
  cmp(e.slug, "imagenDestacada", d.imagenDestacada, esp.imagenDestacada);
  /**
   * ⚠ **LA FIRMA ENTRA EN EL CONTROL (117.ª) — y sin esta línea el campo de la
   * transcripción a mano sería un campo SIN LECTOR**: estaría escrito, se
   * leería como verificado y no lo compararía nadie (§sondas 3, *documentado no
   * es conectado*).
   *
   * Se compara sólo `autor.slug` + `papel` + `proemio`, que es lo que la
   * transcripción a mano puede afirmar del HTML servido de esa entrada. El
   * resto del autor —cargo, redes, bio— vive en SU archivo, o sea en otro
   * documento, y compararlo aquí sería pedirle a esta página algo que no sirve.
   */
  cmp(e.slug, "firmas", firma(d.firmas), firma(esp.firmas));
  cmpRico(e.slug, "cuerpo", SABOTAJE === "cuerpo-cambiado" ? `${d.cuerpo}<p>✂</p>` : d.cuerpo, esp.cuerpo);
}
const term = porSlug("terminos-kunakpedia");
for (const e of LIB.TERMINOS_KUNAKPEDIA) {
  const d = term.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo);
  cmp(e.slug, "tituloMiga", d.tituloMiga, e.tituloMiga);
  /* Añadido en la 82.ª por la misma razón que en `extractor-c`: el tipo exige
     la fecha, así que la transcripción existe — y si nadie la compara, no mide. */
  cmp(e.slug, "fechaPublicacion", d.fechaPublicacion, e.fechaPublicacion);
  cmpRico(e.slug, "cuerpo", d.cuerpo, e.cuerpo);
}
const docs = porSlug("documentos-cientificos");
for (const e of LIB.DOCUMENTOS_CIENTIFICOS) {
  const d = docs.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo);
  cmp(e.slug, "categoria", d.categoria, e.categoria);
  /* La firma, también aquí: 23 de 23 documentos la traen. Misma razón que en
   * blog — un campo transcrito que nadie compara no mide (§sondas 3). */
  cmp(e.slug, "firmas", firma(d.firmas), firma(e.firmas));
  cmp(e.slug, "prefijo", d.prefijo, e.prefijo);
  /* Los CINCO del PASO 5, contra los 4 transcritos a mano. */
  cmp(e.slug, "autores", d.autores, e.autores);
  cmp(e.slug, "anyo", d.anyo, e.anyo);
  cmp(e.slug, "portada", d.portada, e.portada);
  cmp(e.slug, "descarga", d.descarga, e.descarga);
  cmpRico(e.slug, "cuerpo", d.cuerpo, e.cuerpo);
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ extractor-a · el catálogo del grupo A desde el corpus ════════\n`);
for (const col of GRUPO_A) console.log(`  ${col.padEnd(24)} ${String(salida[col].length).padStart(4)} documentos`);
if (sinCuerpo.length) console.log(`\n  ⛔ ${sinCuerpo.length} sin cuerpo en corpus/transformado: ${sinCuerpo.slice(0, 4).join(" · ")}`);

/* DERIVADO del número de comparaciones que se hicieron de verdad — ver el
 * comentario de `cmp`. La fórmula a mano que había aquí no se movía al añadir
 * una comparación, así que publicaba 128 mientras se hacían 139. */
const nControl = nComparaciones + nRicosComparados;
const nRicos = LIB.ENTRADAS_BLOG.length + LIB.TERMINOS_KUNAKPEDIA.length + LIB.DOCUMENTOS_CIENTIFICOS.length;
console.log(`\n  CONTROL · ${nControl} comparaciones contra la transcripción a mano ` +
  `(${nRicosComparados} de ellas son el CUERPO RICO): ` +
  `${control.length === 0 ? "✅ TODAS" : `❌ ${control.length} discrepancia(s)`}`);
for (const c of control.slice(0, 10))
  console.log(`     · ${c.slug} · ${c.campo}  [${(c.clases ?? []).join("+") || "—"}]\n         leído    ${JSON.stringify(c.leido)?.slice(0, 150)}\n         esperado ${JSON.stringify(c.esperado)?.slice(0, 150)}`);
if (control.length > 10) console.log(`     … y ${control.length - 10} más`);

/* ── El INVENTARIO de clases, que es lo que el PASO 3 tenía que producir ──
 * Se imprime SIEMPRE, incluso en verde: es el dato que dice qué formas de
 * divergencia existen entre el pipeline y la transcripción a mano, y sin él
 * «0 discrepancias» no distingue «coinciden» de «coinciden por poco». */
const porClase = new Map();
for (const x of [...serializacion, ...control])
  for (const cl of x.clases ?? ["valor"]) porClase.set(cl, (porClase.get(cl) ?? 0) + 1);
console.log(`\n  INVENTARIO de clases de divergencia sobre ${nRicos} cuerpos controlados:`);
if (!porClase.size) console.log(`     (ninguna: los ${nRicos} cuerpos coinciden)`);
for (const [cl, n] of [...porClase].sort((a, b) => b[1] - a[1])) {
  const [v, porQue] = CLASES[cl] ?? ["DEFECTO", "⛔ CLASE SIN ADJUDICAR: no está en la tabla `CLASES`"];
  console.log(`     ${String(n).padStart(3)} × ${cl.padEnd(15)} ${v === "dato" ? "· dato   " : "⛔ DEFECTO"}  ${porQue}`);
}
console.log(
  `     ${serializacion.length} de los ${nRicos} cuerpos divergen SÓLO en clases adjudicadas como dato o ABIERTAS\n` +
    `     ${control.filter((c) => c.campo === "cuerpo").length} traen al menos un DEFECTO no declarado`,
);

/* ── Los ABIERTOS: se comprueba el NÚMERO, que es lo que los hace caducar ── */
const abiertosMal = [];
for (const [cl, { n, ficha }] of Object.entries(ABIERTOS)) {
  const visto = porClase.get(cl) ?? 0;
  const ok = visto === n;
  if (!ok) abiertosMal.push(`${cl}: declarados ${n}, vistos ${visto}`);
  console.log(
    `\n  ${ok ? "⚠" : "❌"} DEFECTO ABIERTO \`${cl}\` — ${visto} de ${nRicos} cuerpos ` +
      `(declarados ${n})  ${ficha}` +
      (ok ? "" : `\n     ⛔ EL NÚMERO SE MOVIÓ: la declaración caduca. Re-mídelo y re-decláralo, no lo subas.`),
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS AUTORES — completados desde SU ARCHIVO (117.ª · ESCALÓN 2)
 *
 * Las firmas dan `slug`, `nombre` y `foto`. `cargo`, `redes` y `bio` son
 * contenido propio del término y viven en `/author/<slug>/`, así que se leen
 * de ahí. Los tres son OPCIONALES **con su fracción medida** — el original
 * ejercita el caso vacío, así que no son caminos sin estrenar.
 * ═════════════════════════════════════════════════════════════════════════ */
const DIR_AUTOR = join(RAIZ, "corpus", "fase-3", "autor", "author");
const autoresSalida = [];
let sinArchivo = 0;
for (const a of [...AUTORES.values()].sort((x, y) => x.slug.localeCompare(y.slug))) {
  const idx = join(DIR_AUTOR, a.slug, "index.html");
  const doc = { slug: a.slug, nombre: a.nombre };
  /* La foto del TEMA (`user.svg`) NO es la foto de nadie: es el marcador por
   * defecto. Guardarla como si fuera contenido sería transcribir un default
   * del tema como si lo hubiera escrito una persona. */
  const propias = [...a.fotos].filter((f) => !/\/themes\/[^/]+\/assets\/images\/user\.svg$/i.test(f));
  if (propias.length) doc.fotoOrigen = propias[0];

  if (!existsSync(idx)) { sinArchivo++; autoresSalida.push(doc); continue; }
  const h = sinScriptNiStyle(readFileSync(idx, "utf8"));
  const tras = (h.match(/<h1[^>]*>[\s\S]*?<\/h1>([\s\S]{0,900})/i) || [])[1] || "";
  const cargo = deco(soloTexto((tras.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || ""));
  if (cargo) doc.cargo = cargo;
  /* ⚠ El nombre de la red se DERIVA DEL HOST, no de una lista de literales.
   * La v1 llevaba un allowlist —linkedin/facebook/twitter/instagram— y daba
   * **4 de 5** donde el censo del archivo dice 5: se comía el `website` de
   * `admin`. Es §regla 9 caso 7 (*un conjunto enumerado a mano dentro de una
   * sonda es un dato recordado*) con su modo de fallo típico: no dio error,
   * dio un campo que desaparece. Derivado del host, lo nuevo entra solo. */
  const redes = [];
  for (const m of tras.matchAll(/<a[^>]*\bhref="([^"]+)"[^>]*>/g)) {
    const href = m[1];
    if (/^(#|mailto:|javascript:)/i.test(href)) continue;
    let host;
    try { host = new URL(href, "https://kunakair.com").hostname.replace(/^www\./, ""); } catch { continue; }
    const red = host === "kunakair.com" ? "website" : host.split(".")[0];
    if (!redes.some((x) => x.red === red)) redes.push({ red, href });
  }
  /* Vuelve `[]`, no ausente: el bloque de redes existe y simplemente puede no
   * llevar enlaces (§F2-5-ESCALON-ETIQUETAS). */
  doc.redes = redes;
  autoresSalida.push(doc);
}
console.log(
  `\n  AUTORES (117.ª): **${autoresSalida.length}** derivados de las firmas` +
    ` · con cargo **${autoresSalida.filter((a) => a.cargo).length}**` +
    ` · con foto propia **${autoresSalida.filter((a) => a.fotoOrigen).length}**` +
    ` · con ≥1 red **${autoresSalida.filter((a) => a.redes?.length).length}**` +
    ` · SIN archivo en el corpus **${sinArchivo}**`,
);
const conFirmas = salida["entradas-blog"].filter((d) => d.firmas?.length).length;
console.log(
  `  FIRMAS: **${conFirmas} de ${salida["entradas-blog"].length}** entradas` +
    ` · con DOS papeles **${salida["entradas-blog"].filter((d) => d.firmas?.length >= 2).length}**`,
);
salida.autores = autoresSalida;

censo.paginas = trabajo.length - sinCuerpo.length;
const muertos = censo.informe("de campos");

w("medidas/a-extraido.json", {
  meta: {
    fecha: hoy(),
    que: "el catálogo COMPLETO del grupo A, extraído del corpus congelado",
    fuente: "corpus/ (metadatos) + corpus/transformado/ (cuerpo, T1–T8 + saneador)",
    control: `${nControl} comparaciones contra src/lib/arquetipo-a.ts`,
    sabotaje: SABOTAJE,
    noMide: ["no toca el original", "no siembra", "el cuerpo lo transforma `cms:extractor`, no esta sonda"],
  },
  recuento: Object.fromEntries(GRUPO_A.map((c) => [c, salida[c].length])),
  /**
   * Los que el original declara que NO son documentos (`D2.4` un nivel abajo).
   * Se publican **con su denominador y su canal**, no como un número: «1» a
   * secas no dice si el barrido miró 1 o 212.
   */
  duplicados: {
    n: duplicados.length,
    deUnTotalDe: trabajo.length,
    regla: "DECISIONES.md §D2.5/§D2.4 — canonical a OTRA URL ⇒ «no soy una ruta». Aquí, además, el servidor responde 301.",
    canalesMirados: ["<link rel=canonical>", "og:url"],
    ausenteNoEsDuplicado: "un documento SIN canonical NI og:url no se excluye: «no lo dice» y «dice que es otro» son distintos (§regla 6)",
    todos: duplicados,
  },
  /**
   * ⚠ **El DENOMINADOR del control se congela al lado de su numerador.** El
   * control no compara los 209 documentos: compara los **transcritos a mano**,
   * que son otro conjunto y mucho más pequeño. Sin este número, cualquiera que
   * lea `comparaciones: 111` tiene que adivinar contra qué población es — y su
   * negativo lo adivinó mal en cuanto los campos crecieron (§sondas 9: la
   * afirmación trae su derivación al lado).
   */
  control: {
    comparaciones: nControl,
    documentos: LIB.ENTRADAS_BLOG.length + LIB.TERMINOS_KUNAKPEDIA.length + LIB.DOCUMENTOS_CIENTIFICOS.length,
    /** De las `comparaciones`, cuántas miran el CUERPO RICO. Antes: **0**. */
    cuerposComparados: nRicos,
    poblacion: Object.values(salida).reduce((a, b) => a + b.length, 0),
    discrepancias: control.length,
    detalle: control,
  },
  /**
   * El INVENTARIO del PASO 3: qué formas de divergencia existen entre el HTML
   * del pipeline y la transcripción a mano, con su recuento. Un `SIN
   * CLASIFICAR` aquí es una clase que ninguna regla escrita cubre.
   */
  divergencia: {
    porClase: Object.fromEntries([...porClase].sort((a, b) => b[1] - a[1])),
    /** La adjudicación se congela CON el reparto: un recuento sin ella no dice si es defecto. */
    adjudicacion: Object.fromEntries(Object.entries(CLASES).map(([k, [v, p]]) => [k, `${v} — ${p}`])),
    /** Los defectos ABIERTOS con su número declarado: si se mueve, la sonda cierra en rojo. */
    abiertos: ABIERTOS,
    abiertosMal,
    serializacion,
    sinClasificar: control.filter((c) => (c.clases ?? []).includes("SIN CLASIFICAR")).map((c) => `${c.slug}.${c.campo}`),
  },
  catalogo: salida,
});

/* Los duplicados se IMPRIMEN uno a uno: un documento que desaparece del catálogo
 * sin decir por qué es exactamente lo que §sondas 1 persigue —lo que se mira, se
 * cuenta; lo que se cuenta, se dice—. No cierran el código: excluirlos es la
 * decisión, no un fallo. */
if (duplicados.length)
  console.log(
    `\n  ── DECLARAN SER OTRA URL — detectados, NO excluidos (§F3-LH-ENTRADA-QUE-ES-UN-301, sin decidir) ──\n` +
      duplicados.map((d) => `   · ${d.clave}\n       ${d.canal} → ${d.url}`).join("\n") +
      `\n   ${duplicados.length} de ${trabajo.length}. Se recalcula en cada corrida: no hay lista de exclusión.\n`,
  );

const rojo = control.length > 0 || muertos > 0 || sinCuerpo.length > 0 || abiertosMal.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} extractor-a: ${GRUPO_A.map((c) => `${salida[c].length} ${c}`).join(" · ")} · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinCuerpo.length} sin cuerpo · ` +
    `${duplicados.length} que declaran ser OTRA URL (detectados, SIN excluir) · ` +
    `${abiertosMal.length} declaración(es) de defecto abierto caducada(s)\n`,
);
process.exit(rojo ? 2 : 0);
