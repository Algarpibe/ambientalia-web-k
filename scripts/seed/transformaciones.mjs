/**
 * T1–T8 — las transformaciones de migración del §3.2, como FUNCIONES PURAS.
 *
 * Corren OFFLINE contra la captura congelada (`corpus/`) y son re-ejecutables:
 * mismo HTML de entrada ⇒ mismo HTML de salida. Re-pegar al sitio vivo para
 * re-correr una transformación está PROHIBIDO — la captura es la línea base.
 *
 * ── El contrato de cada una ────────────────────────────────────────────────
 * `aplica(html, ctx)` → { html, n }   la transformación y cuántas veces actuó
 * `post(html, ctx)`   → string[]      violaciones de SU postcondición (vacío = limpia)
 * `diana(html, ctx)`  → nº            ocurrencias del patrón en la ENTRADA
 *
 * `diana` existe por la regla 8a, cobrada dos veces el 2026-08-04: *un sabotaje
 * que no cambia el resultado no ha probado la guarda*. El test en negativo
 * desactiva una T y espera que su `post` muerda; si la entrada no trae el
 * patrón, eso es SIN DIANA y se declara — nunca se lee como verde.
 *
 * ── Las dos mitades que FALTABAN, escritas el 2026-08-05 ──────────────────
 * `T3b` y `T4b` quedaron nombradas y sin escribir mientras la media no estaba
 * capturada: las dos necesitan que el artefacto exista offline. Con
 * `media-corpus/` congelada y commiteada (tanda 31.ª) el bloqueo cae, y aquí
 * están. Su forma NO se inventó: cada una se derivó de un censo del propio
 * corpus, y las dos derivaciones cazaron un número mal contado — ver sus
 * cabeceras.
 *
 * ── LA CLAVE DE MEDIA: una sola definición, la de la captura ───────────────
 * `claveDeMedia()` reproduce EXACTAMENTE la llave de `media-corpus/INDICE.json`
 * (`captura-media.mjs`: `decodeURIComponent(url.slice(PREFIJO.length))`). Dos
 * definiciones de «la misma llave» serían la clase C7, y además romperían el
 * invariante D de `qa:artefacto`, que empareja las dos listas por esa cadena.
 */

import { origenDe } from "../qa/lib.mjs";

/* ── utilidades de átomo: clase y atributo dentro de un tag ya casado ────── */
const atributo = (tag, nombre) => new RegExp(`\\b${nombre}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1];
const sinAtributo = (tag, nombre) => tag.replace(new RegExp(`\\s*\\b${nombre}\\s*=\\s*"[^"]*"`, "i"), "");
const conClase = (tag, filtro) => {
  const clase = atributo(tag, "class");
  if (clase === undefined) return tag;
  const quedan = clase.split(/\s+/).filter(Boolean).filter(filtro);
  return quedan.length
    ? tag.replace(/\bclass\s*=\s*"[^"]*"/i, `class="${quedan.join(" ")}"`)
    : sinAtributo(tag, "class");
};

/** Deshace un envoltorio balanceado `<tag>…</tag>` empezando en `desde`. */
function cierreDe(html, tag, desde) {
  const re = new RegExp(`<(/?)${tag}\\b`, "gi");
  re.lastIndex = html.indexOf(">", desde) + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return m.index;
  }
  return -1;
}

/* ══════════════════════════════ T8 · el token del CDN ═════════════════════ */
const RE_ROCKET = /([0-9a-f]{16,}-)(text\/javascript)/gi;
export const T8 = {
  id: "t8",
  titulo: "T8 · token de Rocket Loader → `text/javascript`",
  aplica(html) {
    let n = 0;
    const salida = html.replace(RE_ROCKET, (_, __, tipo) => (n++, tipo));
    return { html: salida, n };
  },
  post: (html) => ([...html.matchAll(RE_ROCKET)].length ? [`quedan ${[...html.matchAll(RE_ROCKET)].length} token(s) de Rocket Loader`] : []),
  diana: (html) => [...html.matchAll(RE_ROCKET)].length,
};

/* ══════════════════════════════ T1 · et_pb_button ═════════════════════════ */
const RE_TAG_BOTON = /<[a-zA-Z][^>]*\bclass="[^"]*\bet_pb_button\b[^"]*"[^>]*>/g;
export const T1 = {
  id: "t1",
  titulo: "T1 · `et_pb_button` → `data-variante=\"boton\"` (el acoplamiento contenido↔tema se corta)",
  aplica(html) {
    let n = 0;
    const salida = html.replace(RE_TAG_BOTON, (tag) => {
      n++;
      let t = conClase(tag, (c) => !/^et_pb_/.test(c));
      return t.replace(/>$/, ` data-variante="boton">`);
    });
    return { html: salida, n };
  },
  post: (html) => (/\bclass="[^"]*\bet_pb_button\b/.test(html) ? ["queda `et_pb_button` en el contenido"] : []),
  diana: (html) => [...html.matchAll(RE_TAG_BOTON)].length,
};

/* ═════════════════ T2 · width absoluto del editor en wp-caption ═══════════ */
const RE_TAG_CAPTION = /<[a-zA-Z][^>]*\bclass="[^"]*\bwp-caption\b[^"]*"[^>]*>/g;
const tieneWidth = (tag) => /\bstyle\s*=\s*"[^"]*width\s*:\s*\d+px/i.test(tag);
export const T2 = {
  id: "t2",
  titulo: "T2 · `style=\"width: NNNpx\"` de `wp-caption` — residuo del editor, se elimina",
  aplica(html) {
    let n = 0;
    const salida = html.replace(RE_TAG_CAPTION, (tag) => {
      if (!tieneWidth(tag)) return tag;
      n++;
      const estilo = atributo(tag, "style") ?? "";
      const resto = estilo.split(";").map((s) => s.trim()).filter((s) => s && !/^width\s*:/i.test(s));
      return resto.length
        ? tag.replace(/\bstyle\s*=\s*"[^"]*"/i, `style="${resto.join("; ")}"`)
        : sinAtributo(tag, "style");
    });
    return { html: salida, n };
  },
  post: (html) => ([...html.matchAll(RE_TAG_CAPTION)].filter(tieneWidth).length ? ["queda un ancho absoluto de editor en `wp-caption`"] : []),
  diana: (html) => [...html.matchAll(RE_TAG_CAPTION)].filter(tieneWidth).length,
};

/* ═══════════ T3a · clases de otro sistema: wp-image-<id> · aligncenter ════ */
const esResiduoT3 = (c) => /^wp-image-\d+$/.test(c) || c === "aligncenter";
const RE_TAG_T3 = /<[a-zA-Z][^>]*\bclass="[^"]*\b(?:wp-image-\d+|aligncenter)\b[^"]*"[^>]*>/g;
export const T3 = {
  id: "t3",
  titulo: "T3a · `wp-image-<id>` y `aligncenter` se descartan (T3b, wp-caption→relación, es del bloque 3)",
  aplica(html) {
    let n = 0;
    const salida = html.replace(RE_TAG_T3, (tag) => (n++, conClase(tag, (c) => !esResiduoT3(c))));
    return { html: salida, n };
  },
  /* ⚠ nunca `.test()` sobre una regex /g: `lastIndex` queda pegado entre
   * llamadas y alterna limpio/sucio — `matchAll` clona y no arrastra estado. */
  post: (html) => ([...html.matchAll(RE_TAG_T3)].length ? ["queda `wp-image-<id>` o `aligncenter` en el contenido"] : []),
  diana: (html) => [...html.matchAll(RE_TAG_T3)].length,
};

/* ══════════════════════════════════════════════════════════════════════════
 * LA LLAVE DE MEDIA — la MISMA cadena que `media-corpus/INDICE.json`
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_SUBIDAS = /^https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/(.+)$/i;
/**
 * `…/uploads/2025/08/foo-1024x576.jpg` → `2025/08/foo.jpg`.
 *
 * ⚠ **Devuelve el ORIGEN, no la variante, y ésa es la mitad que costó un rojo de
 * 80.** El documento de la colección es `foo.jpg`; `foo-1024x576.jpg` es **un
 * tamaño suyo** que Payload regenera (`media-regenera`, dimensión 73/73), y por
 * eso la captura sólo tiene orígenes. La primera versión de T3b tomaba el `src`
 * tal cual, así que las **80** referencias del cuerpo que apuntan a una variante
 * no resolvían contra la captura — y el invariante D las cazó a la primera.
 *
 * Y no se pierde nada: **la caja que el cuerpo pidió sigue viajando verbatim**
 * en el `src` y el `srcset` (§la frontera del «ancho pedido», `media-hueco`
 * 7/7). `data-media` contesta *qué documento es*, no *de qué tamaño se pidió*.
 *
 * **`null` si la URL no está bajo el prefijo de subidas**, y ese `null` NO se
 * traduce a nada benigno (regla 6): quien llama cuenta el caso y lo declara —
 * son 3 imágenes hotlinkeadas a eea.europa.eu · freudenberg · ccacoalition, que
 * no son media nuestra y no pueden tener relación con nuestra colección.
 */
export const claveDeMedia = (url) => {
  const m = RE_SUBIDAS.exec(typeof url === "string" ? url : "");
  if (!m) return null;
  let ruta;
  try {
    ruta = decodeURIComponent(m[1]);
  } catch {
    ruta = m[1]; // %-encoding roto: la llave cruda es mejor que ninguna, y casa igual
  }
  return origenDe(ruta);
};

/* ═════════ T3b · wp-caption → <figure>/<figcaption> + relación de media ═══
 *
 * §3.2 T3: *«`wp-image-<id>`, `wp-caption`, `aligncenter` se descartan; la
 * relación con el media pasa a ser **relación a la colección**, no una clase con
 * un id de otro sistema»*. T3a ya se llevó `wp-image-<id>` y `aligncenter`; esto
 * es la otra mitad, y son tres cosas a la vez:
 *
 *   1 · **se descartan los ids de OTRO sistema** — `id="attachment_<N>"` y el
 *       `aria-describedby="caption-attachment-<N>"` que lo apunta. Los dos
 *       JUNTOS: quitar el `id` y dejar el `aria-describedby` fabricaría un
 *       puntero colgante, que es peor que el residuo;
 *   2 · **la leyenda deja de ser un `<p>` con una clase del tema** y pasa a ser
 *       `<figcaption>` dentro de `<figure>`, que es el HTML que significa
 *       exactamente «esta es la leyenda de este medio». Las dos etiquetas están
 *       en las 43 censadas (209/209), así que el saneador las admite sin tocar
 *       la whitelist;
 *   3 · **la relación se hace explícita**: `data-media="<llave>"`, la misma
 *       cadena con la que la captura indexa el fichero. El `src` sigue apuntando
 *       al original —la regla de rutas locales: el destino no está publicado—,
 *       así que el `src` es *dónde está hoy* y `data-media` es *qué documento de
 *       NUESTRA colección es*. Conflarlos es justo lo que §3.2 T3 prohíbe.
 *
 * ── Censo que fija el alcance (446 bloques en 83 páginas, `corpus/`) ───────
 * 446/446 con **exactamente un `<img>`** y **con leyenda** · 420 con
 * `id="attachment_N"` + su `aria-describedby` · 24 con el `<img>` envuelto en
 * `<a>` · 443 con el `src` bajo el prefijo de subidas, **3 hotlinkeadas fuera**.
 *
 * ⚠ **Y lo que el censo obligó a NO hacer: nada de emparejar `<div>` por
 * balanceo.** 2 de los 446 traen dentro un bloque `calls` inyectado por
 * shortcode con el `<p>` sin cerrar, así que su `</div>` cae *después* del CTA.
 * Un emparejado balanceado —o un `[\s\S]*?` hasta el siguiente `</p></div>`—
 * se tragaría el CTA entero o saltaría al bloque siguiente. Se empareja por
 * **forma canónica** y lo que no encaja **se deja y se cuenta** (regla 6: una
 * ausencia se rechaza, no se sustituye a ojo). Los 2 van declarados en el
 * informe y en `PENDIENTES-QA.md` §T3B-NO-CANONICO.
 *
 * ⚠ **Lo que NO se toca, y es deliberado:** `alignnone` (29) y `alignright` (2)
 * sobreviven en el `<figure>`, y las clases `size-full`/`size-large`/
 * `size-medium` del `<img>` (405) también. §3.2 T3 nombra TRES marcadores y
 * éstos no están: quitarlos sería ampliar el alcance de una decisión ajena por
 * mi cuenta. Quedan nombrados como hallazgo, no barridos en silencio.
 */
const RE_ABRE_CAPTION = /<div\b[^>]*\bclass="[^"]*\bwp-caption\b[^"]*"[^>]*>/gi;
/** La forma canónica: [<a>]<img>[</a>] + <p.wp-caption-text>…</p></div>. */
const RE_CUERPO_CAPTION =
  /^((?:<a\b[^>]*>\s*)?<img\b[^>]*>(?:\s*<\/a>)?)\s*<p\b([^>]*\bclass="[^"]*\bwp-caption-text\b[^"]*"[^>]*)>((?:(?!<\/p>)[\s\S])*)<\/p>\s*<\/div>/i;

/** Recorre los `wp-caption` canónicos. `fn(bloque)` decide qué se emite. */
function porCaption(html, fn) {
  let salida = "", desde = 0, n = 0, noCanonicos = 0;
  RE_ABRE_CAPTION.lastIndex = 0;
  let m;
  while ((m = RE_ABRE_CAPTION.exec(html))) {
    if (m.index < desde) continue; // ya consumido por un bloque anterior
    const cuerpo = RE_CUERPO_CAPTION.exec(html.slice(m.index + m[0].length));
    if (!cuerpo) { noCanonicos++; continue; }
    const fin = m.index + m[0].length + cuerpo[0].length;
    salida += html.slice(desde, m.index) + fn({ abre: m[0], medio: cuerpo[1], leyenda: cuerpo[3] });
    desde = fin;
    RE_ABRE_CAPTION.lastIndex = fin;
    n++;
  }
  return { html: salida + html.slice(desde), n, noCanonicos };
}

export const T3B = {
  id: "t3b",
  titulo: "T3b · `wp-caption` → `<figure>`/`<figcaption>` con `data-media` (la relación deja de ser un id de WordPress)",
  aplica(html, ctx) {
    const r = porCaption(html, ({ abre, medio, leyenda }) => {
      const clases = (atributo(abre, "class") ?? "")
        .split(/\s+/).filter(Boolean).filter((c) => c !== "wp-caption");
      const src = atributo(/<img\b[^>]*>/i.exec(medio)?.[0] ?? "", "src");
      const clave = claveDeMedia(src);
      if (ctx?.mediaDelCuerpo && clave) ctx.mediaDelCuerpo.push({ pagina: ctx.pagina, clave, via: "t3b" });
      if (ctx?.mediaDelCuerpo && !clave) ctx.sinLlaveT3b?.push({ pagina: ctx.pagina, src });
      return (
        `<figure${clases.length ? ` class="${clases.join(" ")}"` : ""}${clave ? ` data-media="${clave}"` : ""}>` +
        /* el `aria-describedby` apuntaba al `id` que se va: se van los dos juntos */
        medio.replace(/\s*\baria-describedby\s*=\s*"caption-attachment-\d+"/i, "") +
        `<figcaption>${leyenda}</figcaption></figure>`
      );
    });
    if (ctx && r.noCanonicos) ctx.captionNoCanonico = (ctx.captionNoCanonico ?? 0) + r.noCanonicos;
    return { html: r.html, n: r.n };
  },
  /**
   * Muerde si queda un `wp-caption` **canónico** sin convertir.
   *
   * ⚠ Y NO comprueba «no queda ningún `wp-caption` en el HTML», que es lo que
   * pedía el dedo: los 2 no canónicos lo llevan y **no se tocan a propósito**,
   * así que esa postcondición sería roja para siempre. Una guarda que no puede
   * salir verde no discrimina — es el mismo defecto que el criterio de F2-2 que
   * exigía cerrar M-IMG desde una fase que no puede cerrarlo.
   */
  post(html) {
    const n = porCaption(html, () => "").n;
    return n ? [`quedan ${n} bloque(s) \`wp-caption\` canónicos sin pasar a <figure>`] : [];
  },
  diana: (html) => porCaption(html, () => "").n,
};

/* ══════════════════════ T4a · ningún <script> sobrevive ═══════════════════ */
const CLASES_T4 = [
  [/fb3d|flipbook/i, "fb3d-flipbook (→ T4b: PDF a media)"],
  [/flourish/i, "flourish (→ T4b: nodo-embed tipado)"],
  [/cdn\.jsdelivr\.net/i, "swiper-jsdelivr (→ T4b: galería nativa)"],
  [/platform\.twitter\.com|\btwitter\.com/i, "twitter (→ T4b: nodo-embed tipado)"],
  [/instagram\.com/i, "instagram (→ T4b: nodo-embed tipado)"],
  [/nbcwashington\.com/i, "nbc (→ T4b: enlace a la noticia)"],
];
const RE_SCRIPT_PAR = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
export const T4 = {
  id: "t4",
  titulo: "T4a · `<script>` se elimina, clasificado §3.3 (T4b, la sustitución, necesita datos que no hay)",
  aplica(html, ctx) {
    let n = 0;
    const salida = html.replace(RE_SCRIPT_PAR, (bloque) => {
      n++;
      const clase = CLASES_T4.find(([re]) => re.test(bloque))?.[1] ?? "SIN CLASIFICAR";
      (ctx?.scriptsQuitados ?? []).push({ pagina: ctx?.pagina, clase, muestra: bloque.slice(0, 120) });
      return "";
    });
    return { html: salida, n };
  },
  post: (html) => (/<script\b/i.test(html) ? ["queda un `<script>` en el contenido"] : []),
  diana: (html) => [...html.matchAll(RE_SCRIPT_PAR)].length,
};

/* ═══════════ T4b · la SUSTITUCIÓN de lo que T4a deja huérfano ═════════════
 *
 * §3.3 reparte los 17 `<script>` en **nodo-embed tipado (7)** y **eliminación
 * documentada con sustitución (10)**. T4a ejecuta la eliminación; esto ejecuta
 * la sustitución **de las dos clases que la tienen DERIVABLE**, y deja las otras
 * con nombre y dueño en vez de inventarlas (regla 6).
 *
 * ⚠ **LA UNIDAD NO ES EL `<script>`, ES EL CONTENEDOR — y contarlo mal costaba
 * dos sustituciones.** El reparto que venía en el HANDOFF («fb3d ×6, flourish
 * ×4») sale de `scriptsQuitados`, o sea de contar **scripts**. Censados los
 * CONTENEDORES del corpus:
 *
 * | clase | scripts | contenedores | por qué difieren |
 * |---|---|---|---|
 * | `fb3d` | 6 | **8** | 2 visores traen `data-pdf="<URL>"` en el propio atributo y **no cargan script**: T4a nunca los vio, así que ningún censo hecho sobre `scriptsQuitados` podía contarlos |
 * | `flourish` | 4 | 5 | 1 ya trae su `<iframe>` materializado — y es **la que da la forma** |
 *
 * Es la misma trampa que el «13 mecánicos» de la tanda 30.ª, una vuelta más
 * abajo: allí se contaba como trabajo lo que no lo era; aquí se dejaba fuera
 * trabajo que sí lo es. **Se cuenta en la unidad sobre la que se actúa.**
 *
 * ── FB3D · el PDF, con sus DOS formas ─────────────────────────────────────
 * · forma A (6) — `data-id="<N>"` y el PDF **sólo** dentro del payload base64
 *   del `<script>`: `posts[<N>].data.guid` + `.title`;
 * · forma B (2) — `data-id="0"` y `data-pdf="<URL>"` en el atributo, sin script.
 *
 * El texto del enlace es `.title` cuando el payload lo trae (6) y **el nombre
 * del fichero** cuando no (2). Ninguno de los dos es texto inventado: los dos
 * salen del dato. El `href` **se queda apuntando al original** — la regla de
 * rutas locales: el PDF no está publicado— y `data-media` nombra el documento
 * de nuestra colección, igual que en T3b.
 *
 * ── FLOURISH · el `<iframe>` que el script habría insertado ────────────────
 * La forma **no se inventa: se copia de un hermano del mismo corpus.**
 * `contaminacion-de-la-industria-de-fertilizantes…` trae el embed ya
 * materializado —el script ya había corrido cuando se guardó—, y es
 * literalmente `<div class="flourish-embed" data-src="visualisation/15668216?…">
 * <iframe src="https://flo.uri.sh/visualisation/15668216/embed?auto=1" …>`.
 * O sea: el `<div>` se CONSERVA con su `data-src` y el `<iframe>` entra dentro.
 * `flo.uri.sh` ya está en la allowlist firmada (§3.3b), donde entró por el censo
 * de `a-embeds` — que lo vio por esta misma instancia.
 *
 * De ese hermano se copia todo menos dos cosas, y las dos con razón:
 *   · `height: 673.078px` — lo mide el script en tiempo de ejecución para ESA
 *     visualización. Copiarlo a las otras cuatro sería cablear el valor de la
 *     instancia que tengo delante, que es cómo se fabrica una familia de
 *     calibración;
 *   · `data-mce-fragment="1"` — residuo del editor TinyMCE, misma familia que
 *     el `style="width:NNNpx"` que T2 se lleva.
 *
 * ── LAS QUE NO TIENEN SUSTITUTO, con nombre y dueño (no son escalón) ───────
 * · `swiper` ×3 — **decisión de RENDER**, no falta de dato: los 10/11/11 slides
 *   sobreviven como `<a class="swiper-slide" href="<original>"><img …></a>`.
 *   Lo que falta es decidir si el CMS trae galería nativa (§3.3);
 * · `nbc` ×1 — **imposible**: el `<script>` sólo da la URL del REPRODUCTOR con
 *   su `CID` caducable, nunca la del artículo, y §3.3 decidió *enlace a la
 *   noticia*. Su `<div class="contenedor-video-fijo">` queda vacío;
 * · `twitter` ×2 · `instagram` ×1 — **no necesitan nada**, verificado: el
 *   `<blockquote>` sobrevive con su texto y su enlace al estado/permalink, y
 *   degrada a una cita válida. Que no haya trabajo aquí es un resultado medido,
 *   no una omisión.
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_FB3D = /<div\b[^>]*\bclass="[^"]*_3d-flip-book[^"]*"[^>]*>/gi;
const RE_FLOURISH = /<div\b[^>]*\bclass="[^"]*\bflourish-embed\b[^"]*"[^>]*>/gi;
const RE_IFRAME_FLOURISH = /^\s*<iframe\b[^>]*\bsrc="https?:\/\/flo\.uri\.sh\//i;
/** Del hermano ya materializado, menos la altura medida y el residuo de TinyMCE. */
const SANDBOX_FLOURISH =
  "allow-same-origin allow-forms allow-scripts allow-downloads allow-popups " +
  "allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";

/** Los `posts` de todos los payloads base64 de FB3D que haya en el documento. */
function postsFb3d(html, ctx) {
  const posts = {};
  for (const m of html.matchAll(/FB3D_CLIENT_DATA\.push\('([A-Za-z0-9+/=]+)'\)/g)) {
    let j = null;
    try {
      j = JSON.parse(Buffer.from(m[1], "base64").toString("utf8"));
    } catch (e) {
      /* Regla 6: la ausencia NO se traduce a nada benigno. No se devuelve un
       * `{}` que haría pasar el visor por «sin datos»: se apunta, el `<div>` se
       * queda sin sustituir y la POSTCONDICIÓN de T4b muerde por él. */
      ctx?.payloadIlegible?.push({ pagina: ctx?.pagina, error: String(e.message).slice(0, 90) });
      continue;
    }
    Object.assign(posts, j?.posts ?? {});
  }
  return posts;
}

/** El PDF de un visor FB3D, por sus dos formas. `null` = no derivable. */
function documentoFb3d(tag, posts) {
  const porAtributo = atributo(tag, "data-pdf");
  if (porAtributo) {
    const clave = claveDeMedia(porAtributo);
    return { url: porAtributo, titulo: (clave ?? porAtributo).split("/").pop(), via: "data-pdf", clave };
  }
  const id = atributo(tag, "data-id");
  const post = id && id !== "0" ? posts[id] : null;
  const url = post?.data?.guid;
  if (!url) return null;
  const clave = claveDeMedia(url);
  return { url, titulo: post.title || (clave ?? url).split("/").pop(), via: "payload", clave };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const T4B = {
  id: "t4b",
  titulo: "T4b · sustitución de lo que T4a deja huérfano: FB3D → enlace al PDF con `data-media`; Flourish → su `<iframe>`",
  aplica(html, ctx) {
    let n = 0;
    const posts = postsFb3d(html, ctx);

    /* FB3D · el <div> del visor está vacío: se sustituye entero. */
    html = html.replace(new RegExp(RE_FB3D.source + "\\s*<\\/div>", "gi"), (todo) => {
      const doc = documentoFb3d(todo, posts);
      if (!doc) return todo; // no derivable: se deja, y la postcondición muerde
      n++;
      ctx?.sustitucionesT4b?.push({ pagina: ctx?.pagina, clase: "fb3d-flipbook", via: doc.via, clave: doc.clave, url: doc.url });
      if (doc.clave && ctx?.mediaDelCuerpo) ctx.mediaDelCuerpo.push({ pagina: ctx?.pagina, clave: doc.clave, via: "t4b" });
      return `<p><a href="${esc(doc.url)}"${doc.clave ? ` data-media="${esc(doc.clave)}"` : ""}>${esc(doc.titulo)}</a></p>`;
    });

    /* Flourish · el <div> se CONSERVA y el <iframe> entra dentro. */
    html = html.replace(RE_FLOURISH, (tag, ...resto) => {
      const entero = resto[resto.length - 1];
      const desplaz = resto[resto.length - 2];
      if (RE_IFRAME_FLOURISH.test(entero.slice(desplaz + tag.length))) return tag; // ya materializado
      const id = /visualisation\/(\d+)/.exec(atributo(tag, "data-src") ?? "")?.[1];
      if (!id) return tag; // sin identificador: no derivable, la postcondición muerde
      n++;
      ctx?.sustitucionesT4b?.push({ pagina: ctx?.pagina, clase: "flourish", via: "data-src", visualizacion: id });
      return (
        `${tag}<iframe style="width: 100%;" title="Interactive or visual content" ` +
        `src="https://flo.uri.sh/visualisation/${id}/embed?auto=1" frameborder="0" scrolling="no" ` +
        `sandbox="${SANDBOX_FLOURISH}"></iframe>`
      );
    });

    return { html, n };
  },
  post(html) {
    const mal = [];
    const fb = [...html.matchAll(new RegExp(RE_FB3D.source + "\\s*<\\/div>", "gi"))].length;
    if (fb) mal.push(`quedan ${fb} visor(es) FB3D sin su documento: el PDF se perdería`);
    for (const m of html.matchAll(RE_FLOURISH))
      if (!RE_IFRAME_FLOURISH.test(html.slice(m.index + m[0].length)))
        mal.push(`queda un embed de Flourish VACÍO (${atributo(m[0], "data-src") ?? "sin data-src"})`);
    return mal;
  },
  diana(html, ctx) {
    const posts = postsFb3d(html, ctx);
    let n = 0;
    for (const m of html.matchAll(new RegExp(RE_FB3D.source + "\\s*<\\/div>", "gi")))
      if (documentoFb3d(m[0], posts)) n++;
    for (const m of html.matchAll(RE_FLOURISH))
      if (!RE_IFRAME_FLOURISH.test(html.slice(m.index + m[0].length)) && /visualisation\/\d+/.test(atributo(m[0], "data-src") ?? "")) n++;
    return n;
  },
};

/* ════════ T5 · envoltorios sueltos del editor clásico, sin atributos ══════ */
const RE_ENVOLTORIO = /<(div|span|section)>/i;
export const T5 = {
  id: "t5",
  titulo: "T5 · `<div>`/`<span>`/`<section>` sin atributos se deshacen (no hay estructura que preservar)",
  aplica(html) {
    let n = 0;
    for (let pasada = 0; pasada < 50; pasada++) {
      const m = RE_ENVOLTORIO.exec(html);
      if (!m) break;
      const tag = m[1].toLowerCase();
      const cierra = cierreDe(html, tag, m.index);
      if (cierra < 0) break; // sin cierre: se deja tal cual, el saneador lo verá
      const interior = html.slice(m.index + m[0].length, cierra);
      const finCierre = html.indexOf(">", cierra) + 1;
      html = html.slice(0, m.index) + interior + html.slice(finCierre);
      n++;
      pasada = -1; // reinicia: el interior puede traer otro envoltorio
    }
    return { html, n };
  },
  post: (html) => (RE_ENVOLTORIO.test(html) ? ["queda un envoltorio sin atributos"] : []),
  diana: (html) => (RE_ENVOLTORIO.test(html) ? 1 : 0),
};

/* ═══════════ T6 · el `id` de los encabezados se REGENERA, no se migra ═════ */
const RE_H_CON_ID = /<h[234]\b[^>]*\bid\s*=\s*"[^"]*"[^>]*>/gi;
export const T6 = {
  id: "t6",
  titulo: "T6 · `id` de encabezado no entra (lo pone el JS del tema; el índice se deriva) — A-SP9",
  aplica(html) {
    let n = 0;
    const salida = html.replace(RE_H_CON_ID, (tag) => (n++, sinAtributo(tag, "id")));
    return { html: salida, n };
  },
  post: (html) => ([...html.matchAll(RE_H_CON_ID)].length ? ["queda un encabezado con `id` migrado"] : []),
  diana: (html) => [...html.matchAll(RE_H_CON_ID)].length,
};

/* ═════════ T7 · enlaces internos del cuerpo → ruta local publicada ════════
 *
 * ⚠ **REESCRITA 2026-08-13 (§DATOS-C-PIPELINE, PASO 4), y las dos mitades del
 * cambio son REGLAS QUE YA ESTABAN ESCRITAS, no criterio nuevo.**
 *
 * **(1) Opera sobre el `<a>` ENTERO, no sobre el atributo `href`.** La versión
 * anterior casaba sólo el `href`, así que no tenía forma de tocar el `target` —
 * y por eso dejaba **1788 enlaces localizados con `target="_blank"`** en los 209
 * cuerpos. `CLAUDE.md` §Regla de rutas locales: *«`target="_blank"` **solo si el
 * destino es externo**»*.
 *
 * **Y no choca con FIDELIDAD, que era el único motivo para dudar:** localizar el
 * `href` **YA es una transformación declarada**, así que en cuanto T7 muerde el
 * enlace deja de ser el del original. Conservar el `target` lo dejaba en un
 * tercer estado que no es ninguno de los dos — ni el original (fuera, pestaña
 * nueva) ni la regla (dentro, misma pestaña). La fidelidad se conserva **no
 * localizando**; una vez localizado, manda la regla.
 *
 * **(2) `ctx.rutas` es SÓLO el manifiesto del build.** Antes era *manifiesto +
 * todas las URL del corpus*, y **una URL capturada no es una ruta publicada**:
 * de ahí salían **53 destinos locales que el build no emite**. Es
 * §F2-3-HREF-DERIVADO —salida (b), adjudicada el 2026-08-07: *componer contra
 * las rutas que el build emite*— sin aplicar al pipeline. La otra mitad de la
 * misma regla dice qué hacer con el resto: *«si no, se deja apuntando al
 * original»*, y es lo que hace el `return todo`.
 *
 * ── Lo que NO se toca, y es deliberado ───────────────────────────────────
 * **`rel="noopener"` sobrevive.** Existe *por* el `target="_blank"` y sin él es
 * inerte, pero la regla nombra el `target` y sólo el `target`; quitarlo sería
 * ampliar el alcance de una decisión ajena por mi cuenta — el mismo argumento
 * por el que T3b deja `alignnone` y `size-full`. Queda nombrado, no barrido en
 * silencio: `ctx.relHuerfano` lo cuenta.
 *
 * ── La MARCA de lo que se deja fuera ─────────────────────────────────────
 * §Regla de rutas locales pide anotar el destino que no se localiza. En código
 * eso es un comentario; **en un cuerpo rico no hay dónde ponerlo sin cambiar lo
 * que se sirve**, así que la marca es la CONGELADA: `ctx.noLocalizadas` recoge
 * cada destino dejado al original con su página, y el extractor lo publica. Una
 * marca que se puede contar vale más que una que hay que leer.
 */
const RE_ANCLA = /<a\b[^>]*>/gi;
const RE_HREF_ORIGINAL = /\bhref="https?:\/\/(?:www\.)?kunakair\.com\/es(\/[^"#?]*?)?\/?(#[^"]*)?"/;
const localDe = (camino) => ((camino ?? "") === "" ? "/" : camino);
/** El destino local de un `<a>` al original, o `null` si no apunta al original. */
const destinoDe = (tag) => {
  const m = RE_HREF_ORIGINAL.exec(tag);
  return m ? { local: localDe(m[1]), ancla: m[2] ?? "", href: m[0] } : null;
};
/** El camino de un `href` ya local, sin query ni ancla: `/x?a=b#c` → `/x`. */
const caminoLocal = (href) => (href.startsWith("/") ? href.split("#")[0].split("?")[0] || "/" : null);
/** ¿Este `<a>` apunta a una página que NOSOTROS publicamos? Una sola pregunta. */
const esNuestro = (tag, rutas) => {
  const d = destinoDe(tag);
  if (d) return rutas.has(d.local);
  const href = (tag.match(/\bhref="([^"]*)"/) ?? [])[1];
  const c = href === undefined ? null : caminoLocal(href);
  return c !== null && rutas.has(c);
};
const conBlank = (tag) => /\btarget\s*=\s*"_blank"/i.test(tag);

export const T7 = {
  id: "t7",
  titulo: 'T7 · enlaces internos del cuerpo: a ruta local si el BUILD la emite, y sin `target="_blank"`; fuera se quedan',
  /**
   * ⚠ **Una sola pregunta, aplicada a los dos casos: «¿este destino lo
   * publicamos NOSOTROS?».**
   *
   * Hay enlaces que llegan del original **ya locales** —`/?resources=guides`—
   * y la regla les aplica igual: si el destino es nuestro, no lleva `target`.
   * La primera versión sólo miraba los que T7 reescribía, y su postcondición
   * cazó 3 que venían así. Tratarlos aparte habría sido **medir al nivel que
   * absorbe**: dos predicados distintos para la misma pregunta.
   *
   * Y el contraejemplo que fija el límite: `/cdn-cgi/l/email-protection` **se
   * escribe local y NO es nuestro** —es infraestructura de Cloudflare del sitio
   * original—, así que conserva su `target`. Lo decide `ctx.rutas`, no la forma
   * del `href`.
   */
  aplica(html, ctx) {
    let n = 0;
    const salida = html.replace(RE_ANCLA, (tag) => {
      const d = destinoDe(tag);
      if (!esNuestro(tag, ctx.rutas)) {
        if (d) ctx.noLocalizadas?.push({ pagina: ctx.pagina, destino: d.local });
        return tag; // no la publicamos: al original, CON su target — sigue siendo externo
      }
      let t = tag;
      if (d) { n++; t = t.replace(d.href, `href="${d.local}${d.ancla}"`); }
      if (conBlank(t)) {
        t = t.replace(/\s*\btarget\s*=\s*"_blank"/i, "");
        if (/\brel\s*=\s*"[^"]*\bnoopener\b/i.test(t))
          ctx.relHuerfano?.push({ pagina: ctx.pagina, destino: d ? d.local : (t.match(/\bhref="([^"]*)"/) ?? [])[1] });
      }
      return t;
    });
    return { html: salida, n };
  },
  /**
   * Dos postcondiciones, y la segunda es la que no existía:
   * 1 · no queda ningún `href` al original de una ruta que SÍ publicamos;
   * 2 · **no queda ningún enlace a una página NUESTRA con `target="_blank"`** —
   *     lo hubiera reescrito T7 o hubiera venido ya local del original.
   */
  post(html, ctx) {
    const mal = [];
    for (const m of html.matchAll(RE_ANCLA)) {
      const d = destinoDe(m[0]);
      if (d && ctx.rutas.has(d.local)) mal.push(`queda href al original de una ruta publicada: ${d.local}`);
      if (esNuestro(m[0], ctx.rutas) && conBlank(m[0]))
        mal.push(`queda target="_blank" hacia una página nuestra: ${(m[0].match(/href="([^"]*)"/) ?? [])[1]}`);
    }
    return mal;
  },
  diana(html, ctx) {
    let n = 0;
    for (const m of html.matchAll(RE_ANCLA)) if (esNuestro(m[0], ctx.rutas) && (destinoDe(m[0]) || conBlank(m[0]))) n++;
    return n;
  },
};

/* ════════ T9 · contenedores de TRANSPORTE ajenos se desenvuelven ══════════
 *
 * ── El enunciado, y es de CLASE, no de instancia ──────────────────────────
 *
 * > **Se desenvuelven los contenedores de TRANSPORTE ajenos —los que no
 * > aportan contenido ni estilo servido—, conservando su contenido.**
 *
 * Nació de un caso (`castel-d-ario`) cuyo campo `Parámetros` trae **el DOM de
 * una conversación de ChatGPT pegado en el editor**: un `<article>` con 9
 * `<div>` anidados alrededor de un `<ul>` de tres viñetas. Pero **la instancia
 * no es la clase**: preguntar *«¿cuántas páginas traen `<article>`?»* contesta
 * **1 de 309** y es la pregunta equivocada. La clase es *«el editor pegó DOM de
 * otra aplicación»*, y censada (`npm run qa:dom-ajeno`, 6 familias) son **10 de
 * 309**.
 *
 * Es el mismo argumento de **T8**: *«ese `type` no lo escribió nadie, lo inyecta
 * la capa de entrega — migrarlo verbatim sería importar un artefacto del CDN
 * como si fuera contenido»*. Aquí lo escribió alguien, pero **no como
 * contenido**: es el envoltorio de la UI de la aplicación de la que copió.
 *
 * ── EL DISCRIMINADOR, que es lo único que separa esto de un barrido ───────
 * Un contenedor se desenvuelve **sólo si las dos cosas**:
 *
 *   1 · está **dentro de una raíz ajena** — un elemento con marcadores de una
 *       aplicación de origen (`data-testid="conversation-turn…"`,
 *       `data-message-author-role`, `class="… prose …"`…). Fuera de esa raíz,
 *       T9 no toca nada;
 *   2 · **no aporta estilo SERVIDO**: ninguna de sus clases tiene regla en el
 *       CSS que el documento se trae, y no lleva `style=` en línea.
 *
 * La 2 se deriva del propio documento —`ctx.clasesConEstilo`— y no de una lista
 * escrita: es §*la salida servida incluye el CSS que el documento se trae*. Y es
 * la condición que hace el **negativo** posible: un envoltorio cuya clase SÍ
 * está en el CSS **tiene que sobrevivir**. Sin ese sabotaje, T9 no está probada
 * — sería un `replace` de `<div>` con una historia bonita.
 *
 * ── Lo que se midió antes de escribirla, y lo que NO ──────────────────────
 * ✅ De las **10 clases** del envoltorio (`markdown` · `prose` ·
 *    `dark:prose-invert` · `text-token-text-primary` · `agent-turn` …),
 *    **ninguna tiene regla** en los **231 103 bytes** de `<style>` que la página
 *    sirve. Divi **compila** ahí lo que el editor toca, así que es el sitio
 *    donde estaría si existiera.
 * ⛔ **Las 7 hojas ENLAZADAS no están en el corpus** (plugins · `et-cache` ·
 *    tema), así que *«ninguna regla en el CSS en línea»* está medido y
 *    *«ninguna regla en absoluto»* **no**. Queda declarado, no dado por hecho.
 *
 * ── Y lo que T9 NO hace, con su número ────────────────────────────────────
 * **No toca ATRIBUTOS ajenos sobre etiquetas legítimas.** `data-start` /
 * `data-end` de un renderizador de markdown aparecen en **10 páginas** sobre
 * `<li>` y `<p>`, que son contenido de verdad. Desenvolver es una cosa y limpiar
 * atributos es otra; la segunda no está decidida y **no se cuela dentro de la
 * primera**. Ficha: §DATOS-DOM-AJENO.
 */
const RAIZ_AJENA = [
  /\bdata-testid\s*=\s*"conversation-turn/i,
  /\bdata-message-author-role\s*=/i,
  /\bdata-message-model-slug\s*=/i,
  /\bclass\s*=\s*"[^"]*\b(?:markdown\s+prose|prose)\b/i,
  /\bclass\s*=\s*"[^"]*\bnotion-/i,
  /\bclass\s*=\s*"Mso[A-Za-z]/i,
  /\bdocs-internal-guid/i,
];
const CONTENEDOR = /<(div|article|section|span)\b[^>]*>/i;
/** ¿Este tag es transporte? Sin `style=` y sin una sola clase con regla servida. */
const esTransporte = (tag, clasesConEstilo) => {
  if (/\bstyle\s*=\s*"/i.test(tag)) return false;
  const clase = atributo(tag, "class");
  if (clase === undefined) return true; // sin clase y sin estilo: no puede aportar render
  return clase.split(/\s+/).filter(Boolean).every((c) => !clasesConEstilo?.has(c));
};
/** El primer contenedor de una raíz ajena, o `null`. */
function raizAjenaEn(html, desde = 0) {
  const re = new RegExp(CONTENEDOR.source, "gi");
  re.lastIndex = desde;
  let m;
  while ((m = re.exec(html))) if (RAIZ_AJENA.some((r) => r.test(m[0]))) return m;
  return null;
}
export const T9 = {
  id: "t9",
  titulo: "T9 · contenedores de TRANSPORTE ajenos (DOM pegado de otra app) se desenvuelven, conservando su contenido",
  aplica(html, ctx) {
    let n = 0;
    for (let vuelta = 0; vuelta < 200; vuelta++) {
      const raiz = raizAjenaEn(html);
      if (!raiz) break;
      const tag = raiz[1].toLowerCase();
      const cierra = cierreDe(html, tag, raiz.index);
      if (cierra < 0) break; // sin cierre: se deja y el saneador lo verá
      const finCierre = html.indexOf(">", cierra) + 1;
      let dentro = html.slice(raiz.index + raiz[0].length, cierra);

      /* Dentro de la raíz: se desenvuelve TODO contenedor de transporte. Lo que
       * lleve estilo servido sobrevive — es la condición 2, y es lo que el
       * sabotaje `envoltorio-con-render` tiene que demostrar. */
      for (let i = 0; i < 200; i++) {
        const re = new RegExp(CONTENEDOR.source, "gi");
        let m, hecho = false;
        while ((m = re.exec(dentro))) {
          if (!esTransporte(m[0], ctx?.clasesConEstilo)) continue;
          const t = m[1].toLowerCase();
          const c = cierreDe(dentro, t, m.index);
          if (c < 0) continue;
          const fin = dentro.indexOf(">", c) + 1;
          dentro = dentro.slice(0, m.index) + dentro.slice(m.index + m[0].length, c) + dentro.slice(fin);
          ctx?.transporteDesenvuelto?.push({ pagina: ctx.pagina, tag: t, clase: atributo(m[0], "class") ?? null });
          n++;
          hecho = true;
          break;
        }
        if (!hecho) break;
      }

      /* Y la raíz misma, con el mismo criterio. Si LLEVA estilo servido se
       * queda —y entonces su etiqueta la juzgará el saneador, que es quien
       * decide qué entra—; si no, se va como los de dentro. */
      if (esTransporte(raiz[0], ctx?.clasesConEstilo)) {
        ctx?.transporteDesenvuelto?.push({ pagina: ctx.pagina, tag, clase: atributo(raiz[0], "class") ?? null, raiz: true });
        n++;
        html = html.slice(0, raiz.index) + dentro + html.slice(finCierre);
      } else {
        html = html.slice(0, raiz.index + raiz[0].length) + dentro + html.slice(cierra);
        break; // la raíz se queda: no hay más que hacer con ella y no se cicla
      }
    }
    return { html, n };
  },
  /** Muerde si queda una raíz ajena que ADEMÁS era transporte: ésa tenía que irse. */
  post(html, ctx) {
    const m = raizAjenaEn(html);
    return m && esTransporte(m[0], ctx?.clasesConEstilo)
      ? [`queda una raíz de DOM ajeno sin desenvolver: ${m[0].slice(0, 90)}`]
      : [];
  },
  diana: (html) => (raizAjenaEn(html) ? 1 : 0),
};

/* ═══════ T10 · la media del CUERPO se LOCALIZA (§DATOS-MEDIA-HOTLINK) ═════
 *
 * ── Qué arregla, y por qué no era un criterio sino un defecto ─────────────
 * `CLAUDE.md` §Assets: *«Nunca se enlaza a kunakair.com en caliente»*. El cuerpo
 * rico del grupo A lo incumplía en **169 de 209** documentos —**1820
 * referencias**, **3688** en el HTML servido de 180 rutas— y **ninguna guarda
 * del repo lo veía**.
 *
 * La cabecera de T3b lo justificaba con *«el destino no está publicado»*. **Era
 * cierto cuando se escribió y es falso desde `cms:coloca-media`**: derivado hoy,
 * **1265 de las 1268 URL distintas ya están** en `apps/web/public` (99.8 %). Es
 * §regla 9 aplicada a un HECHO en vez de a un número — los hechos que una
 * decisión cita se re-derivan **cuando la decisión se invoca**, no cuando se
 * escribe.
 *
 * Y la prueba de que era defecto y no criterio: **el pipeline se contradecía a
 * sí mismo**. T4b ya emitía el enlace al PDF como `/images/uploads/…` mientras
 * T3b dejaba el `<img src>` en `https://kunakair.com/…`; y el extractor
 * localizaba la media de los METADATOS (`rutaLocalMedia`) y no la del cuerpo.
 *
 * ── Por qué importa para MEDIR, que es lo que sube su prioridad ───────────
 * > **Una ruta que sirve la imagen DESDE kunakair.com compara la imagen del
 * > original contra la imagen del original: Δ0 por construcción**, y en el eje
 * > donde vive el elemento principal de una tarjeta de listado. Es §el NIVEL al
 * > que se mide con un contenedor nuevo —**el propio origen del asset**— y
 * > construir LISTADO-B encima daría un verde de la familia «0 comparado = verde».
 *
 * ── La guarda de entorno, y NO es opcional ───────────────────────────────
 * ⚠ `ctx.mediaPublicada` **es obligatorio y TIRA si falta**. Sin él la
 * transformación localizaría **cero** y su `post` no encontraría nada que
 * reclamar: saldría **verde habiendo hecho nada**, que es exactamente el verde
 * falso que `rutasConstruidas` ya tiene cerrado del otro lado (§regla 6 — una
 * ausencia se rechaza, no se sustituye por un valor benigno).
 *
 * ── Lo que se queda CALIENTE, con su razón ───────────────────────────────
 * Una URL que **no** está en `public` **no se localiza** —apuntaría a un 404, y
 * un 404 propio es peor que un hotlink que funciona— y se cuenta en
 * `ctx.mediaCaliente` para que el informe la nombre. Medidas: **3**.
 */
const RE_SUBIDA_EN_TEXTO = /https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/([^"'\s)<>\\]+)/gi;

/** La ruta relativa con la que se busca en `public`: sin query y decodificada. */
const relDeSubida = (crudo) => {
  const sinQuery = String(crudo).split("?")[0];
  try {
    return decodeURIComponent(sinQuery);
  } catch {
    return sinQuery;
  }
};

/** Las que HAY que localizar: están bajo uploads **y** publicadas. */
function subidasLocalizables(html, publicadas) {
  const fuera = [];
  RE_SUBIDA_EN_TEXTO.lastIndex = 0;
  let m;
  while ((m = RE_SUBIDA_EN_TEXTO.exec(html))) if (publicadas.has(relDeSubida(m[1]))) fuera.push(m[0]);
  return fuera;
}

/** El `Set` de publicadas, exigido y no supuesto. */
function exigePublicadas(ctx, quien) {
  const s = ctx?.mediaPublicada;
  if (!(s instanceof Set))
    throw new Error(
      `T10.${quien}: \`ctx.mediaPublicada\` tiene que ser un Set y llegó ${typeof s}.\n` +
        `  Sin el entorno, T10 localizaría CERO y saldría verde habiendo hecho nada —\n` +
        `  el mismo verde falso que \`rutasConstruidas\` cierra para los href (§regla 6).`,
    );
  if (s.size === 0)
    throw new Error(
      `T10.${quien}: \`ctx.mediaPublicada\` está VACÍO.\n` +
        `  Eso no es «no hay media publicada»: es que el barrido de apps/web/public no miró.`,
    );
  return s;
}

export const T10 = {
  id: "t10",
  titulo: "T10 · la media del CUERPO se LOCALIZA — el clon deja de servir imágenes desde kunakair.com",
  aplica(html, ctx) {
    const publicadas = exigePublicadas(ctx, "aplica");
    let n = 0;
    const salida = String(html).replace(RE_SUBIDA_EN_TEXTO, (todo, cola) => {
      const rel = relDeSubida(cola);
      if (!publicadas.has(rel)) {
        /* Caliente a propósito: localizarla apuntaría a un 404 propio, que es
         * peor que un hotlink que funciona. Se NOMBRA, no se silencia. */
        ctx?.mediaCaliente?.push({ pagina: ctx.pagina, rel, porQue: "no está en apps/web/public" });
        return todo;
      }
      n++;
      /* La cola viaja VERBATIM —con su `%`-encoding y su query si la trae—:
       * lo único que cambia es el origen. Decodificar aquí cambiaría el `src`
       * servido por uno equivalente pero distinto, y eso ya no sería un NO-OP. */
      return `/images/uploads/${cola}`;
    });
    return { html: salida, n };
  },
  /** Muerde si queda una subida que SÍ estaba publicada: ésa tenía que irse. */
  post(html, ctx) {
    const quedan = subidasLocalizables(html, exigePublicadas(ctx, "post"));
    return quedan.length
      ? [`quedan ${quedan.length} URL(s) de subida SIN localizar y publicadas: ${quedan[0].slice(0, 100)}`]
      : [];
  },
  diana: (html, ctx) => subidasLocalizables(html, exigePublicadas(ctx, "diana")).length,
};

/**
 * EL ORDEN ES PARTE DEL CONTRATO: T8 antes que T4a (el token se normaliza
 * antes de que la eliminación se lleve el script — es lo que estabiliza la
 * comparación contra el HTML crudo en el importador); T3a antes que T5 (las
 * clases descartadas pueden dejar el envoltorio desnudo, y ése es exactamente
 * el que T5 normaliza); T7 al final, sobre el HTML ya limpio.
 *
 * ⚠ **Y las dos posiciones que las mitades nuevas OBLIGAN, las dos por dato:**
 *
 * · **T3b después de T2 y de T3a.** T2 encuentra el ancho absoluto *por* la
 *   clase `wp-caption`, y T3a quita `aligncenter` del contenedor. Poner T3b
 *   antes le quitaría la diana a T2 (415 de los 446 contenedores traen
 *   `aligncenter` en el crudo) — o sea: una transformación desactivaría a otra
 *   sin que nada diera error.
 * · **T4b ANTES de T4a.** La referencia al PDF de 6 de los 8 visores vive
 *   **dentro del `<script>`**, así que después de T4a ya no existe. Es el orden
 *   que hace la sustitución posible, no una preferencia.
 *
 * ⚠ **Y la posición de T9 (2026-08-13): después de T4b y ANTES de T5.**
 *
 * · **antes de T5**, que es la restricción con dato: T5 deshace envoltorios
 *   **sin atributos**, y los de transporte llegan **con sus clases puestas** —
 *   que es justo lo que T9 tiene que juzgar («¿alguna tiene estilo servido?»).
 *   Con T5 delante, T9 encontraría un árbol ya medio deshecho por otro criterio;
 * · **después de T4b**, por la misma razón que T4a: T4b lee el payload del visor
 *   antes de que nadie toque la estructura;
 * · **NO antes de T3a**, aunque la simetría lo sugiera: T3a sólo quita
 *   `wp-image-<id>` y `aligncenter`, que no son clases de ninguna raíz ajena, y
 *   moverla rompería su propia restricción —**T3b va después de T2 y de T3a**—
 *   que está medida en 415 de 446 contenedores. Una restricción documentada
 *   pesa más que una simetría.
 *
 * ⚠ **Y la de T10 (2026-08-13): LA ÚLTIMA, después incluso de T7.**
 *
 * Es §lección (c) de la tanda de PIPELINE aplicada antes de que costara nada:
 * *un pliegue que normaliza tiene que correr DESPUÉS de todo lo que puede
 * PRODUCIR lo que él normaliza*. Y aquí hay **tres** productores, no uno:
 *
 * · **T4b INTRODUCE URLs de subida** al decodificar el payload del visor FB3D —
 *   es literalmente el defecto que la tanda anterior se comió dos veces;
 * · **T3b LEE el `src` absoluto** para calcular `claveDeMedia`, y su `RE_SUBIDAS`
 *   sólo casa la forma `https://kunakair.com/wp-content/uploads/…`. Con T10
 *   delante, `data-media` saldría `null` en los 446 contenedores **sin dar
 *   error**: la relación con la colección de media desaparecería en silencio;
 * · **T7 decide destinos** de `<a href>`, y un enlace a un fichero de subida no
 *   es una ruta que el build emita — así que T7 lo deja en el original y T10 lo
 *   recoge después. Al revés, T7 vería un `/images/uploads/…` y tendría que
 *   opinar sobre una ruta que no es de página.
 */
export const TRANSFORMACIONES = [T8, T1, T2, T3, T3B, T4B, T9, T4, T5, T6, T7, T10];
