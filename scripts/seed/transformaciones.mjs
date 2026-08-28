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
 * ── Lo que se midió antes de escribirla, y lo que se CERRÓ después ────────
 * ✅ De las **44 clases** del envoltorio (`markdown` · `prose` ·
 *    `dark:prose-invert` · `text-token-text-primary` · `agent-turn` …),
 *    **ninguna tiene regla** en los **231 508 bytes** de `<style>` que la página
 *    sirve. Divi **compila** ahí lo que el editor toca, así que es el sitio
 *    donde estaría si existiera.
 * ✅ **CERRADO 2026-08-13 — y las «10 clases» eran un número RECORDADO: son
 *    44.** Las 7 hojas ENLAZADAS ya están capturadas (`corpus/css/`,
 *    `cms:captura-css`) y el cruce se hace sobre **los 8 canales**: `npm run
 *    qa:t9-css` da **0 de 44 en 576 823 bytes**, con CONTROL vivo
 *    (`.et_pb_section` 26 reglas · `.et_pb_row` 254 · `.et_pb_text` 19) y
 *    negativo 4/4. O sea que la cuarta condición de T9 —el NO-OP al píxel—
 *    queda **PAGADA POR MECANISMO**: los contenedores no llevan render en el
 *    original, así que desenvolverlos no puede mover nada.
 *
 * ⚠ **Y lo que este código sigue leyendo NO cambia:** `clasesConEstiloDe` mira
 *    sólo el `<style>` en línea, o sea que el discriminador que corre en
 *    producción sigue siendo *«ninguna regla en el CSS EN LÍNEA»*. Lo medido es
 *    que en la única página que ejercita T9 **las enlazadas no añaden ninguna**,
 *    y el sesgo del discriminador va hacia **no** desenvolver de más — que es la
 *    dirección segura. Un arquetipo nuevo con DOM ajeno vuelve a pasar por
 *    `qa:t9-css` antes de fiarse.
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

/* ═════ T9B · el CIERRE HUÉRFANO — la otra mitad del DOM ajeno ═════════════
 *
 * §F3-LH-ARTICLE-ETIQUETA-44, adjudicada en la 70.ª tanda: *«es un caso de T9,
 * no de la whitelist»*. Va aparte de T9 por lo mismo que T3B va aparte de T3 y
 * T4B de T4 —misma decisión, mecanismo distinto, y así cada postcondición muerde
 * por lo suyo—.
 *
 * ── Qué pasó, contra el crudo capturado ───────────────────────────────────
 * Un find/replace de WordPress destrozó la apertura de un `<article>` metiendo
 * el atributo DENTRO del nombre de la etiqueta:
 *
 *     <a target="_blank"rticle class="post-content">   …   </article>
 *
 * O sea que el documento sirve **un cierre sin apertura casada**. La corrupción
 * está en el original, no en el pipeline (comprobado sobre el fichero recién
 * bajado).
 *
 * ── Y lo que se replica lo dijo EL PARSER, no la especificación ────────────
 * §El principio: *lo que se transcribe es lo que el navegador hace con lo
 * servido*. Medido en Chrome sobre ese marcado exacto:
 *
 * | | medido |
 * |---|---|
 * | elementos `article` en el DOM | **0** — el cierre huérfano se **descarta entero** |
 * | elementos `a` | **1**, con atributos `target="_blank"` · `rticle=""` · `class="post-content"` |
 * | hijos de esa `<a>` | `h2` · `p` · `figure` · **`p`** ← se traga incluso lo que iba DESPUÉS del cierre |
 *
 * De donde las dos mitades de la regla, y las dos son «replicar lo servido»:
 *
 *   1 · **el cierre se ELIMINA** — el parser no lo materializa, así que emitirlo
 *       es emitir un token sin efecto; quitarlo es **NO-OP al píxel** y de paso
 *       deja de ejercitar una etiqueta 44 fuera del censo de 43;
 *   2 · **la `<a>` corrupta se CONSERVA** — el parser sí la materializa.
 *       Repararla a `<article>` sería «lo que el autor quería decir», que es
 *       justo lo que §*una declaración inválida* prohíbe. Es la misma familia
 *       que `min-width: none`, con marcado en vez de CSS.
 *
 * ── El discriminador tiene DOS mitades, y la primera versión sólo tenía una ─
 * La ficha pide *«el cierre **sin apertura casada**, no el literal
 * `</article>`»*, y eso es **necesario y no suficiente**. La primera versión de
 * esta transformación se quedó ahí y **disparó en 170 de 212 documentos**
 * cuando la ficha decía **1 de 3 nuevos y 0 de 209 sembrados**.
 *
 * > ⚠ **Lo cazó la CONTRADICCIÓN CON UNA MEDIDA BUENA ANTERIOR** (§sondas 4),
 * > que es el único control que había: un 170/212 es un número plausible y no
 * > da ningún error. Es §*un detector que encuentra MÁS de lo que hay* en su
 * > tercera cara — y el fallo de fondo fue derivar la regla de un MECANISMO
 * > («falta la apertura») en vez de **de lo que hace el parser**.
 *
 * **La segunda mitad, medida en Chrome sobre 44 etiquetas** (envoltorio neutro,
 * `<main id=r>A</X>B</main>`, mirando `innerHTML`):
 *
 * | | n | qué hace el parser |
 * |---|---|---|
 * | **41 de 44** (`div a article span section figure figcaption em strong li ul ol h2 h3 h4 td tr table tbody thead b i u sup sub blockquote iframe center mark small code pre dl dt dd noscript hr header footer aside nav`) | 41 | **lo IGNORA** — `AB` |
 * | **`p`** | 1 | **lo materializa**: `A<p></p>B`, un párrafo VACÍO |
 * | **`br`** | 1 | **lo materializa**: `A<br>B` |
 * | *(`main` salió «no ignorada» las dos veces por el ENVOLTORIO de la sonda, no por el parser — igual que `div` en el primer intento con `<div id=r>`)* | | |
 *
 * De donde el reparto en el corpus, que es lo que reconcilia el número con la
 * ficha: de **183** cierres huérfanos, **172 son `</p>`** — y ésos **NO se
 * tocan**, porque quitarlos borraría un `<p></p>` que el navegador sí crea.
 *
 * ── Y por qué la ficha decía 0 de 209 y aquí salen 10: son OTRA PREGUNTA ───
 * La ficha contaba **violaciones de la whitelist de 43** —lo que hacía morder al
 * saneador—, y `</a>` (9) y `</span>` (1) están **dentro** de las 43, así que
 * nunca bloquearon nada y nadie los buscó. §*una regla incompleta se lee igual
 * que una completa*: la medida contestaba *«¿qué me impide sembrar?»*, no
 * *«¿cuántos cierres huérfanos hay?»*.
 *
 * ── Alcance, con su denominador (§regla 9) ────────────────────────────────
 * **11 cierres en 11 documentos de 212**: `</article>` **1** (el de la ficha) ·
 * `</a>` **9** · `</span>` **1**. Los `</p>` (172) quedan **fuera por medida**,
 * no por prudencia.
 *
 * ⚠ **Por qué la cuenta de profundidad no da falsos positivos por su lado:** los
 * cierres implícitos del parser —`<p>a<p>b</p>`, `<li>…<li>…</li>`— producen
 * **más aperturas que cierres**, nunca al revés, así que la profundidad no baja
 * de 0 por ellos. Para que la primera mitad muerda hace falta literalmente **un
 * cierre de más**.
 */
const VACIAS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);
/**
 * Las que el parser **materializa** en vez de ignorar. Es una lista corta y
 * **medida**, no deducida de la especificación — y es la mitad del
 * discriminador que la primera versión no tenía.
 */
const CIERRE_QUE_EL_PARSER_MATERIALIZA = new Set(["p", "br"]);
const RE_TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;

/**
 * Los cierres sin apertura casada, en orden. `todos: true` los devuelve TODOS
 * —incluidos los que el parser materializa—, que es lo que necesita el censo
 * para poder publicar el reparto en vez de un número ya filtrado.
 */
function cierresHuerfanos(html, { todos = false } = {}) {
  const prof = new Map();
  const fuera = [];
  RE_TAG.lastIndex = 0;
  let m;
  while ((m = RE_TAG.exec(html))) {
    if (m[2] === undefined) continue; // comentario
    const tag = m[2].toLowerCase();
    if (VACIAS.has(tag)) continue;
    if (m[1] === "/") {
      const d = prof.get(tag) ?? 0;
      if (d > 0) { prof.set(tag, d - 1); continue; }
      if (todos || !CIERRE_QUE_EL_PARSER_MATERIALIZA.has(tag))
        fuera.push({ tag, desde: m.index, hasta: m.index + m[0].length });
    } else if (!/\/\s*$/.test(m[3])) {
      prof.set(tag, (prof.get(tag) ?? 0) + 1);
    }
  }
  return fuera;
}
/** Exportado para que el censo pueda publicar el reparto y no sólo el filtrado. */
export const censoDeCierresHuerfanos = (html) => cierresHuerfanos(html, { todos: true });

export const T9B = {
  id: "t9b",
  titulo: "T9B · un cierre SIN apertura casada se elimina (el parser lo descarta; la apertura corrupta se conserva)",
  aplica(html, ctx) {
    const fuera = cierresHuerfanos(html);
    if (!fuera.length) return { html, n: 0 };
    let salida = "", desde = 0;
    for (const h of fuera) {
      salida += html.slice(desde, h.desde);
      desde = h.hasta;
      ctx?.cierresHuerfanos?.push({ pagina: ctx.pagina, tag: h.tag });
    }
    return { html: salida + html.slice(desde), n: fuera.length };
  },
  /** Muerde si queda alguno: la transformación es idempotente y tiene que cerrar. */
  post(html) {
    const q = cierresHuerfanos(html);
    return q.length ? [`queda un cierre sin apertura casada: </${q[0].tag}>`] : [];
  },
  diana: (html) => cierresHuerfanos(html).length,
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
/* ══════════ T12 · el descifrador de correo de Cloudflare ══════════════════ */
/**
 * T12 · **el marcado ofuscado LLEGÓ SIN SU DESCIFRADOR, y eso son 404.**
 *
 * Cloudflare ofusca los `mailto:` del autor antes de servirlos: reescribe el
 * `href` a `/cdn-cgi/l/email-protection#<hex>`, sustituye el texto por
 * `[email protected]`, y **sirve `email-decode.min.js`, que lo deshace en el
 * cliente**. O sea que lo que el visitante ve NUNCA es el marcado ofuscado.
 *
 * El clon transcribió el marcado y **no** el descifrador. `CLAUDE.md` lo tiene
 * escrito con su precedente —*«quitar el script y dejar el marcado convirtió 2
 * enlaces vivos en 404 permanentes»*— y con su enunciado: **un marcado ofuscado
 * más su descifrador son UNA UNIDAD; media unidad no es una versión más limpia,
 * es un defecto que el original no tiene.** Aquí costó **4 hrefs · 5 páginas ·
 * 6 apariciones**, todos 404 (121.ª, `qa:enlaces`).
 *
 * **Es la MISMA familia que T8** y por la misma razón de fondo: ese `href` *no
 * lo escribió nadie*, lo inyecta la capa de entrega — migrarlo verbatim importa
 * un artefacto del CDN como si fuera contenido. Lo que el autor escribió es un
 * `mailto:`, y es lo que se restituye. No es «limpiar»: es **deshacer a mano la
 * reparación que hacía el script que no transcribimos**.
 *
 * ── Las TRES formas, censadas en el corpus (no supuestas) ─────────────────
 *   A · `<a href="…#hex"><span class="__cf_email__" data-cfemail="hex2">…</span></a>`
 *       el href Y el texto ofuscados, con DOS claves distintas (CF sortea una
 *       por ocurrencia);
 *   B · `<a href="…#hex">Texto normal</a>` — sólo el href; el texto es del autor
 *       y **no se toca**;
 *   C · `<a href="/cdn-cgi/l/email-protection" class="__cf_email__"
 *       data-cfemail="hex">…</a>` — **sin `#`**: la clase va en el propio `<a>`
 *       y el href es un señuelo. Ésta es la que el rótulo «4 hrefs» escondía,
 *       porque las 4 apariciones comparten literal.
 *
 * El cifrado es XOR con clave de un byte: los dos primeros dígitos hex son la
 * clave, y cada par siguiente es un carácter.
 */
const descifraCf = (hex) => {
  if (typeof hex !== "string" || hex.length < 4 || hex.length % 2 || !/^[0-9a-f]+$/i.test(hex)) return null;
  const k = parseInt(hex.slice(0, 2), 16);
  let s = "";
  for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k);
  /* Un descifrado que no parece un correo NO se escribe: es §regla 6 —una
   * ausencia se rechaza, no se sustituye—. Mejor el 404 visible, que la sonda
   * caza, que un `mailto:` inventado, que nadie vuelve a mirar. */
  return /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/.test(s) ? s : null;
};
const RE_CF_A = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const RE_CF_SPAN = /<span\b([^>]*)>([\s\S]*?)<\/span>/gi;
const RE_CF_HREF = /href="\/cdn-cgi\/l\/email-protection#([0-9a-fA-F]+)"/gi;
const hexDe = (attrs) => /\bdata-cfemail\s*=\s*"([0-9a-fA-F]+)"/i.exec(attrs)?.[1];
const esCf = (attrs) => /\b__cf_email__\b/.test(attrs);

export const T12 = {
  id: "t12",
  titulo: "T12 · descifrador de correo de Cloudflare → `mailto:` (el marcado llegaba sin su script)",
  aplica(html) {
    let n = 0;
    let salida = String(html);

    /* 1 · forma C — la clase en el propio `<a>`: href señuelo + texto señuelo */
    salida = salida.replace(RE_CF_A, (todo, attrs) => {
      if (!esCf(attrs)) return todo;
      const correo = descifraCf(hexDe(attrs));
      if (!correo) return todo;
      n++;
      let t = conClase(`<a${attrs}>`, (c) => c !== "__cf_email__");
      t = sinAtributo(t, "data-cfemail");
      t = /\bhref\s*=/i.test(t)
        ? t.replace(/\bhref\s*=\s*"[^"]*"/i, `href="mailto:${correo}"`)
        : t.replace(/>$/, ` href="mailto:${correo}">`);
      return `${t}${correo}</a>`;
    });

    /* 2 · forma A — el `<span>` de dentro: el descifrador lo SUSTITUYE por el
     *     correo, así que el envoltorio tampoco sobrevive. */
    salida = salida.replace(RE_CF_SPAN, (todo, attrs) => {
      if (!esCf(attrs)) return todo;
      const correo = descifraCf(hexDe(attrs));
      if (!correo) return todo;
      n++;
      return correo;
    });

    /* 3 · formas A y B — el href con `#hex`. Va el ÚLTIMO: la forma C ya se
     *     resolvió arriba y su href no lleva `#`, así que no se pisan. */
    salida = salida.replace(RE_CF_HREF, (todo, hex) => {
      const correo = descifraCf(hex);
      if (!correo) return todo;
      n++;
      return `href="mailto:${correo}"`;
    });

    return { html: salida, n };
  },
  /** Muerde si queda UN SOLO rastro del CDN: los tres canales, no sólo el href. */
  post: (html) => {
    const q = [];
    const s = String(html);
    if (/\/cdn-cgi\/l\/email-protection/i.test(s)) q.push("queda un href `/cdn-cgi/l/email-protection` (404 servido)");
    if (/__cf_email__/.test(s)) q.push("queda la clase `__cf_email__` sin descifrar");
    if (/\bdata-cfemail\s*=/i.test(s)) q.push("queda `data-cfemail` sin descifrar");
    return q;
  },
  diana: (html) => {
    const s = String(html);
    return (s.match(/\bdata-cfemail\s*=\s*"/gi) || []).length + [...s.matchAll(RE_CF_HREF)].length;
  },
};

/**
 * ⚠ **T9B va DESPUÉS de T9 y ANTES de T5, y el orden no es de estilo.**
 *
 * · **después de T9** porque T9 desenvuelve contenedores y *quita cierres al
 *   hacerlo*: contar huérfanos antes lo dejaría opinando sobre un árbol que
 *   está a medio desenvolver;
 * · **antes de T5** porque T5 deshace envoltorios buscando su cierre con
 *   `cierreDe`, y un cierre huérfano por medio le desplaza el emparejado.
 */
/**
 * ⚠ **T12 va junto a T8 —las dos primeras— y ANTES de T5, y tampoco es estilo.**
 *
 * · **junto a T8** porque son la misma familia: artefactos que inyecta la capa
 *   de entrega (Cloudflare) y que no escribió ningún autor. Deshacerlos antes
 *   que nada deja al resto de la cadena viendo el contenido, no el CDN;
 * · **antes de T5** porque T5 desenvuelve `<span>` sueltos del editor clásico,
 *   y el `<span class="__cf_email__">` de la forma A **es** un span suelto a sus
 *   ojos: desenvuelto primero, T12 se queda sin el `data-cfemail` y el correo
 *   ya no se puede descifrar — el 404 se convertiría en un `[email protected]`
 *   literal, que es peor porque ninguna sonda lo caza.
 */
export const TRANSFORMACIONES = [T8, T12, T1, T2, T3, T3B, T4B, T9, T9B, T4, T5, T6, T7, T10];

/* ══════════════════════════════════════════════════════════════════════════
 * T11 · `data-teams` — el residuo de PEGAR DESDE TEAMS en el editor
 *
 * Decisión del propietario (2026-08-22, D1): **transformación de importación
 * que lo limpie**. La otra salida —dar el atributo de alta en
 * `ATRIBUTOS_CENSADOS`— se descartó, y la razón está escrita en
 * `ESQUEMA-CMS.md` §3.2 T11: ese censo es la **whitelist de cinco colecciones
 * verificadas**, y lo que aquí se limpia está medido como **inerte**, así que
 * la salida servida no cambia y el listón de §8 se mantiene.
 *
 * ── El cardinal, DERIVADO y no recordado (§regla 9) ───────────────────────
 * `derivaciones/atributo-teams-f33.log`: **1 fichero de 788** bajo `corpus/`,
 * **1 ocurrencia**, portadora `span`, valor `"true"`. Inerte en las cuatro
 * familias que el censo mide a cero (manejador `on*` · `javascript:` · `data:`
 * URI · `srcdoc`).
 *
 * ⚠ **Y el ALCANCE se declara, porque sin él este uno se lee como una clase:**
 * T11 limpia **UN atributo**, no la familia «residuo de pegado del editor».
 * Cuántos atributos de esa familia trae el corpus es otra pregunta y sale
 * **SIN MEDIR — que no es 0** (mismo log, §ALCANCE).
 *
 * ── Se quita el ATRIBUTO, no el envoltorio ────────────────────────────────
 * Es la forma de T3a, que descarta clases y deja el tag: la transformación
 * mínima que hace desaparecer el bloqueo. Lo que quede desnudo es trabajo de
 * T5, que es exactamente el reparto que el contrato de orden ya declara
 * (*«T3a antes que T5: las clases descartadas pueden dejar el envoltorio
 * desnudo, y ése es el que T5 normaliza»*).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ POR QUÉ T11 **NO** ESTÁ EN `TRANSFORMACIONES`, Y ES UNA MEDIDA
 *
 * La cadena `TRANSFORMACIONES` la corre `extractor.mjs` sobre el `post_content`
 * del **grupo A** (209 cuerpos: `entradas-blog` · `terminos-kunakpedia` ·
 * `documentos-cientificos`). Ahí la diana de T11 es **0**: el único fichero con
 * `data-teams` es `fase-3/sueltas/empresa/index.html`, que **no es post_content
 * de nadie**.
 *
 * Y `extractor.neg.mjs` desactiva una T por corrida y **exige que su
 * postcondición muerda**; con diana 0 informa **SIN DIANA** y sale rojo — que es
 * lo correcto (§regla 8a: *un sabotaje que no cambia el resultado no ha probado
 * la guarda*). Meterla ahí sería, literalmente, el **tercer caso de §regla 21**:
 * el sabotaje muerde, la sonda está bien y **el dominio no tiene con qué
 * ejercitar el caso**. Eso no es «roto» ni «probado»: es **SIN PROBAR**, y un
 * SIN PROBAR que sale verde se lee como probado.
 *
 * Así que T11 se declara en el registro con su número y **se consume donde
 * SÍ tiene diana**: `TRANSFORMACIONES_F33`, la cadena de la cola larga, y su
 * negativo vive en `extractor-f33.neg.mjs` §`t11`.
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_TAG_T11 = /<[a-zA-Z][^>]*\sdata-teams\s*=\s*"[^"]*"[^>]*>/g;
const RE_ATR_T11 = /\sdata-teams\s*=\s*"[^"]*"/gi;

export const T11 = {
  id: "t11",
  titulo: 'T11 · `data-teams` — residuo de pegar desde Teams; se quita el ATRIBUTO, no el envoltorio',
  aplica(html) {
    let n = 0;
    const salida = String(html).replace(RE_TAG_T11, (tag) => {
      n++;
      return tag.replace(new RegExp(RE_ATR_T11.source, "gi"), "");
    });
    return { html: salida, n };
  },
  /** Muerde si queda un `data-teams` servido: ése tenía que irse. */
  post: (html) => (/\sdata-teams\s*=/i.test(String(html)) ? ["queda `data-teams` en el contenido"] : []),
  diana: (html) => [...String(html).matchAll(RE_TAG_T11)].length,
};

/**
 * LA CADENA DE LA COLA LARGA (F3-3) — hoy, **una sola transformación**.
 *
 * ⚠ **No es «la cadena entera menos las que no hacían falta»**: `extractor-f33`
 * no aplicaba NINGUNA transformación de importación, así que esto es el estreno
 * del canal, no un recorte. Cuál de las otras doce le corresponde a este
 * arquetipo **está SIN MEDIR** —cada una tendría que derivar su diana contra
 * `corpus/fase-3/`— y sale nombrado en vez de resuelto de paso.
 */
/**
 * ⚠ **T12 entra aquí POR MEDICIÓN, no por simetría con la otra cadena.** El
 * aviso de arriba dice que cuál de las otras le toca a este arquetipo está SIN
 * MEDIR; ésta sí se midió: `paginas_blocks_texto_pagina.html` —el campo rico que
 * produce `extractor-f33`— trae el marcado ofuscado en **3 filas** (`aviso-legal`
 * · `politica-de-privacidad-y-de-proteccion-de-datos` · `sistema-interno-de-
 * informacion`), o sea **diana > 0 derivada del corpus**. Las otras siguen sin
 * derivar y siguen fuera.
 */
export const TRANSFORMACIONES_F33 = [T11, T12];
