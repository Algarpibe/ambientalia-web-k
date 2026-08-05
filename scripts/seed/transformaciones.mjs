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
 * ── Dos mitades que NO están aquí, con su porqué (el precedente es T4a/T4b) ─
 * · **T3b** — `wp-caption`/`wp-caption-text` NO se descartan todavía: §3.2 los
 *   liga a *«la relación con el media pasa a ser relación a la colección»*, y
 *   esa relación es del bloque 3 (media). Descartar el marcador ANTES de
 *   construir la relación ejecutaría media transformación cuya otra mitad no
 *   puede correr — la misma partición que T4a (la regla, aquí) / T4b (la
 *   sustitución, con los datos que el catálogo no tiene). T3a sí corre:
 *   `wp-image-<id>` y `aligncenter` son residuo de otro sistema.
 * · **T4b** — la sustitución (PDF→media, embed→nodo tipado, NBC→enlace)
 *   necesita el fichero PDF y la URL de la noticia. T4a elimina y CLASIFICA
 *   (§3.3), y la pérdida se cuenta documento a documento, no se tapa.
 */

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

/* ═════════ T7 · enlaces internos del cuerpo → ruta local publicada ════════ */
const RE_HREF_ORIGINAL = /\bhref="https?:\/\/(?:www\.)?kunakair\.com\/es(\/[^"#?]*?)?\/?(#[^"]*)?"/g;
const localDe = (camino) => (camino ?? "") === "" ? "/" : camino;
export const T7 = {
  id: "t7",
  titulo: "T7 · enlaces internos del cuerpo: a ruta local si la publicamos; fuera se quedan",
  aplica(html, ctx) {
    let n = 0;
    const salida = html.replace(RE_HREF_ORIGINAL, (todo, camino, ancla) => {
      const local = localDe(camino);
      if (!ctx.rutas.has(local)) return todo; // no publicada: se deja apuntando al original
      n++;
      return `href="${local === "/" ? "/" : local}${ancla ?? ""}"`;
    });
    return { html: salida, n };
  },
  post(html, ctx) {
    const mal = [];
    for (const m of html.matchAll(RE_HREF_ORIGINAL))
      if (ctx.rutas.has(localDe(m[1]))) mal.push(`queda href al original de una ruta publicada: ${localDe(m[1])}`);
    return mal;
  },
  diana(html, ctx) {
    let n = 0;
    for (const m of html.matchAll(RE_HREF_ORIGINAL)) if (ctx.rutas.has(localDe(m[1]))) n++;
    return n;
  },
};

/**
 * EL ORDEN ES PARTE DEL CONTRATO: T8 antes que T4a (el token se normaliza
 * antes de que la eliminación se lleve el script — es lo que estabiliza la
 * comparación contra el HTML crudo en el importador); T3a antes que T5 (las
 * clases descartadas pueden dejar el envoltorio desnudo, y ése es exactamente
 * el que T5 normaliza); T7 al final, sobre el HTML ya limpio.
 */
export const TRANSFORMACIONES = [T8, T1, T2, T3, T4, T5, T6, T7];
