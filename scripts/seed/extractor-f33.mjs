/**
 * EXTRACTOR F3-3 — la cola larga: 31 páginas del corpus → documentos de `paginas`.
 * Uso: npm run cms:extractor-f33
 * Negativos:
 *   SABOTAJE=tipo-fantasma   → exit ≠0 (un tipo Divi sin bloque ⇒ TIRA, no se omite)
 *   SABOTAJE=sin-secciones   → exit ≠0 (0 secciones propias ⇒ parser roto, no «página vacía»)
 *   SABOTAJE=geometria       → exit ≠0 (escribir un 0 de ritmo ⇒ campo INVENTADO)
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 * `arbol-f33` (92.ª) DERIVÓ la forma: 11 tipos, 313 módulos, sección → fila →
 * columna → módulo. `f33-geo` (95.ª) derivó la geometría del ORIGINAL. El
 * esquema (`bloques/paginas.ts` + `colecciones/paginas.ts`) la expresa. Lo que
 * no existía es **el dato**: esto lo produce.
 *
 * ⚠ **NO abre el original.** Lee `corpus/fase-3/`, que está capturado con sus
 * hojas (32/32) y con su `sha256`.
 *
 * ── EL PARSER SE IMPORTA, NO SE REESCRIBE ────────────────────────────────
 * `parsea` · `seccionesPropias` · `modulosDe` · `tipoDe` · `esEstructura` salen
 * de `arbol-f33.mjs`, que es donde se derivaron **y donde su control cruzado
 * contra `mod-v4.log` los validó**. Un segundo tokenizador sería la clase C7:
 * dos definiciones de «los módulos de esta columna», y la que cuente distinto
 * no daría error — daría otro número (§*una definición, no dos*).
 *
 * Y por eso los recuentos de aquí tienen que CUADRAR con los suyos: 313 módulos
 * y 11 tipos. Si no cuadran, el que está mal es éste (§sondas 4: *cruzar con
 * otra medida del mismo objeto es obligatorio antes de creerse un recuento*).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA GEOMETRÍA NO SE ESCRIBE, Y ES LA REGLA QUE MÁS FÁCIL SE ROMPE AQUÍ
 *
 * El esquema declara `pt/pb/mt/mb` y `anchoPct` con la fuente **«SIN PROBAR —
 * 0 ejes COMPARADOS en las 31»**, y `medida()` dice *«Vacío = el default
 * responsive de Divi»*. O sea que **omitir es expresar el default**, y escribir
 * un número es afirmar que el editor lo tocó.
 *
 * La 95.ª dejó **tres huecos nombrados**, y los tres producen campos inventados
 * si se tratan como dato:
 *
 * | hueco | qué pasa si se escribe |
 * |---|---|
 * | **el 0 es el VALOR INICIAL, no «px absolutos»** — 24 de 49 celdas SIN ESCRIBIR | 24 campos inventados de una vez, cada uno con su medición real de coartada |
 * | **«en el DOM» ≠ «con caja»** — 36 módulos en desplegables CERRADOS | `getComputedStyle` no resuelve % sin caja: devuelve ceros que entran como dato |
 * | **`anchoPct` en BLOQUE ≠ en LÍNEA** — 25 instancias sin medir por el instrumento | una razón sobre un enlínea mide el TEXTO, no una declaración |
 *
 * **Lo SIN ESCRIBIR se omite. Lo NO MEDIBLE se declara. Ninguno de los dos se
 * convierte en un número.** Este extractor **no emite ni una sola clave de
 * geometría**, y el sabotaje `geometria` existe para que eso no se pueda
 * relajar en silencio: es la §regla del arreglo falso puesta en una guarda.
 *
 * ⚠ Y `video` (0 con caja), `map` y `slider` (n = 1) salieron de la 95.ª
 * **nombrados con lo que haría falta para medirlos**. Siguen sin cablear.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, QA, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["tipo-fantasma", "sin-secciones", "geometria"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ── el parser, importado ─────────────────────────────────────────────────── */
const A = await import(pathToFileURL(join(RAIZ, "docs/research/cola-larga/derivaciones/arbol-f33.mjs")).href);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — las 31, de la congelada que las derivó
 *
 * §regla 9: la lista no se escribe, se deriva. `f33-rutas.json` ya trae `slug` y
 * `prefijo` calculados por segmentos, que es exactamente lo que el esquema pide
 * (`prefijo` es campo porque las rutas van de 1 a 5 segmentos).
 * ═════════════════════════════════════════════════════════════════════════ */
const RUTAS = JSON.parse(readFileSync(join(QA, "medidas/f33-rutas.json"), "utf8"));
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

const CLAVES = Object.keys(INDICE.paginas);
function ficheroDe(ruta) {
  const k = CLAVES.find((x) => x.endsWith(`:${ruta}`));
  if (!k) return null;
  const f = join(CORPUS, INDICE.paginas[k].fichero);
  return existsSync(f) ? f : null;
}

/* ── utilidades de lectura sobre el árbol ─────────────────────────────────── */
const tieneClase = (n, c) => n.clases.includes(c);
const buscaClase = (n, c) => {
  for (const h of A.recorre(n)) if (tieneClase(h, c)) return h;
  return null;
};
const todasClase = (n, c) => {
  const out = [];
  for (const h of A.recorre(n)) if (tieneClase(h, c)) out.push(h);
  return out;
};
const attr = (n, nombre) => {
  const m = new RegExp(`\\b${nombre}="([^"]*)"`).exec(n.attrs || "");
  return m ? m[1] : undefined;
};
/** El HTML interno de un nodo, tal cual lo sirve el original (§verbatim). */
const dentro = (html, n) => html.slice(n.ini, n.fin).trim();
/** El texto plano de un nodo: para `label`, `titulo`, `alt`. */
const texto = (html, n) =>
  dentro(html, n)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const nivelDe = (n, def) => {
  const m = /^h([1-6])$/.exec(n.etiqueta);
  return m ? Number(m[1]) : def;
};
const oUndef = (v) => (v === undefined || v === null || v === "" ? undefined : v);

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · UN MÓDULO DIVI → UN BLOQUE DEL ESQUEMA
 *
 * Los selectores están DERIVADOS del marcado servido (una instancia de cada uno
 * de los 11 tipos, leída antes de escribir esto), nunca supuestos. Y el `switch`
 * lleva `default` que TIRA (§regla 6 gemelo): un renderizador que devuelve
 * `undefined` no falla, **no pinta** — y el extractor que devuelve `undefined`
 * no falla, **no siembra**. Los dos modos de fallo son el mismo, y el segundo
 * llega hasta una página que responde 200 con cero módulos.
 *
 * ⚠ NINGUNA rama escribe `ritmo`, `anchoPct` ni ninguna otra clave de
 * geometría. Ver la cabecera.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Las diapositivas de un slider: `et_pb_slide` es hijo del slider, no bloque (P-S2). */
function diapositivasDe(html, n) {
  return todasClase(n, "et_pb_slide").map((s) => {
    const t = buscaClase(s, "et_pb_slide_title");
    const desc = buscaClase(s, "et_pb_slide_description");
    const btn = buscaClase(s, "et_pb_button");
    const img = buscaClase(s, "et_pb_slide_image");
    const imgN = img ? buscaClase(img, "wp-image") || [...A.recorre(img)].find((x) => x.etiqueta === "img") : null;
    /* El cuerpo es la descripción SIN su titular ni su botón: los dos son campos
     * propios, y dejarlos dentro los duplicaría en el render. */
    let cuerpo;
    if (desc) {
      let h = dentro(html, desc);
      if (t) h = h.replace(dentro(html, t), "");
      h = h.replace(/<h[1-6][^>]*class="et_pb_slide_title"[\s\S]*?<\/h[1-6]>/i, "");
      h = h.replace(/<div[^>]*class="et_pb_button_wrapper"[\s\S]*?<\/div>/i, "").trim();
      cuerpo = oUndef(h);
    }
    return {
      titulo: t ? texto(html, t) : "(sin título)",
      nivel: t ? nivelDe(t, 2) : undefined,
      cuerpo,
      botonLabel: btn ? oUndef(texto(html, btn)) : undefined,
      botonHref: btn ? oUndef(attr(btn, "href")) : undefined,
      fondo: imgN ? oUndef(attr(imgN, "src")) : undefined,
    };
  });
}

/** El sabotaje `tipo-fantasma`: un doceavo tipo, que el esquema no tiene. */
let fantasmaInyectado = false;

function aBloque(html, n, donde) {
  let tipo = A.tipoDe(n);
  if (SABOTAJE === "tipo-fantasma" && !fantasmaInyectado) {
    fantasmaInyectado = true;
    tipo = "un_tipo_que_divi_no_sirve";
  }

  switch (tipo) {
    case "text": {
      const inner = buscaClase(n, "et_pb_text_inner");
      return { blockType: "texto-pagina", html: dentro(html, inner ?? n) };
    }

    case "image": {
      const img = [...A.recorre(n)].find((x) => x.etiqueta === "img");
      const a = [...A.recorre(n)].find((x) => x.etiqueta === "a");
      const href = a ? attr(a, "href") : undefined;
      return {
        blockType: "imagen-pagina",
        src: img ? attr(img, "src") : undefined,
        alt: img ? oUndef(attr(img, "alt")) : undefined,
        href: oUndef(href),
        /* `external` se DERIVA del destino, no se supone: la regla de rutas
         * locales dice que `_blank` sólo vale si el destino es externo. */
        external: href && !/^https?:\/\/(www\.)?kunakair\.com/.test(href) && /^https?:/.test(href) ? true : undefined,
      };
    }

    case "button":
      return {
        blockType: "boton-pagina",
        label: texto(html, n),
        href: attr(n, "href"),
        external: undefined,
        /* `boton-azul` es CAMPO con su n (4 de 13): varía entre hermanos de la
         * misma página, o sea test B. */
        piel: tieneClase(n, "boton-azul") ? "azul" : undefined,
      };

    case "code": {
      const inner = buscaClase(n, "et_pb_code_inner");
      return { blockType: "codigo", html: dentro(html, inner ?? n) };
    }

    case "toggle": {
      const t = buscaClase(n, "et_pb_toggle_title");
      const c = buscaClase(n, "et_pb_toggle_content");
      return {
        blockType: "toggle",
        titulo: t ? texto(html, t) : "(sin título)",
        nivel: t ? nivelDe(t, 3) : undefined,
        cuerpo: c ? dentro(html, c) : "",
      };
    }

    case "video": {
      const f = [...A.recorre(n)].find((x) => x.etiqueta === "iframe");
      return {
        blockType: "video-pagina",
        embedUrl: f ? attr(f, "src") : undefined,
        titulo: f ? oUndef(attr(f, "title")) : undefined,
      };
    }

    case "blurb": {
      const cab = buscaClase(n, "et_pb_module_header");
      const desc = buscaClase(n, "et_pb_blurb_description");
      const wrap = buscaClase(n, "et_pb_main_blurb_image");
      const img = wrap ? [...A.recorre(wrap)].find((x) => x.etiqueta === "img") : null;
      return {
        blockType: "blurb",
        titulo: cab ? texto(html, cab) : "(sin título)",
        nivel: cab ? nivelDe(cab, 3) : undefined,
        imagen: img ? oUndef(attr(img, "src")) : undefined,
        alt: img ? oUndef(attr(img, "alt")) : undefined,
        descripcion: desc ? oUndef(dentro(html, desc)) : undefined,
      };
    }

    case "fullwidth_slider":
      return { blockType: "slider-completo", diapositivas: diapositivasDe(html, n) };

    case "slider":
      return { blockType: "slider", diapositivas: diapositivasDe(html, n) };

    case "map":
      return {
        blockType: "mapa",
        pines: todasClase(n, "et_pb_map_pin").map((p) => {
          const info = buscaClase(p, "infowindow");
          return {
            titulo: attr(p, "data-title") ?? "(sin título)",
            descripcion: info ? oUndef(dentro(html, info)) : undefined,
            lat: oUndef(attr(p, "data-lat")),
            lng: oUndef(attr(p, "data-lng")),
          };
        }),
      };

    case "icon": {
      const i = buscaClase(n, "et-pb-icon");
      return {
        blockType: "icono",
        /* El carácter de la fuente, TAL CUAL lo sirve Divi. No se traduce a un
         * enum: con n = 1 página, enum / carácter / imagen son indistinguibles
         * (F3-3-ICONO-DATO). */
        icono: i ? dentro(html, i) : "",
        texto: undefined,
      };
    }

    default:
      /* §sondas 4 + §regla 6 gemelo: un tipo que no casa NO se omite. Omitirlo
       * daría un documento con menos módulos y CERO errores — que es como se
       * sirven seis páginas vacías en verde. */
      throw new Error(
        `TIPO SIN BLOQUE: '${tipo}' en ${donde}.\n` +
          `  arbol-f33 censó ONCE tipos y el esquema declara once bloques. Un doceavo\n` +
          `  no se omite ni se mete en el cajón de otro: se mide y se modela.`,
      );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LA RETÍCULA — sección → fila → columna → módulo
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_COLUMNA = /^et_pb_column_(\d+_\d+)$/;
const anchoDe = (n) => {
  for (const c of n.clases) {
    const m = RE_COLUMNA.exec(c);
    if (m) return m[1];
  }
  return undefined;
};
const esFila = (n) => tieneClase(n, "et_pb_row") || tieneClase(n, "et_pb_row_inner");

/** Las filas DIRECTAS de una sección (sin bajar a la fila de dentro de otra). */
function filasDe(nodo) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      if (esFila(h)) { out.push(h); continue; }
      baja(h);
    }
  };
  baja(nodo);
  return out;
}

/** Las columnas DIRECTAS de una fila. */
function columnasDe(fila) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      if (anchoDe(h)) { out.push(h); continue; }
      baja(h);
    }
  };
  baja(fila);
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL CASCARÓN — título y SEO del `<head>`
 * ═════════════════════════════════════════════════════════════════════════ */
const entreEtiquetas = (html, re) => {
  const m = re.exec(html);
  return m ? m[1].trim() : undefined;
};
const desescapa = (s) =>
  s === undefined
    ? undefined
    : s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&#8211;/g, "–")
        .replace(/&#8217;/g, "’")
        .replace(/&nbsp;/g, " ");

function cascaronDe(html) {
  const title = desescapa(entreEtiquetas(html, /<title>([\s\S]*?)<\/title>/i));
  const desc = desescapa(
    entreEtiquetas(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ??
      entreEtiquetas(html, /<meta[^>]+content="([^"]*)"[^>]+name="description"/i),
  );
  /* El `<h1>` de la capa propia es el título editorial; el `<title>` lleva el
   * sufijo del sitio. Se prefiere el `h1` y el `<title>` queda para el SEO. */
  const h1 = desescapa(entreEtiquetas(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]*>/g, ""));
  return { title, desc, h1 };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL RÉGIMEN — y el segundo canal de contenido (S2)
 *
 * `--` (ni `et_pb_pagebuilder_layout` ni `et-tb-has-body`) es la plantilla
 * CLÁSICA del tema: el cuerpo vive en `entry-content` como HTML. Hoy lo ejercita
 * **1 documento de 31**, y ese n = 1 se DECLARA (§*un campo que ningún dato
 * ejercita es un camino de render sin estrenar*).
 * ═════════════════════════════════════════════════════════════════════════ */
function regimenDe(html) {
  const m = /<body[^>]*class="([^"]*)"/i.exec(html);
  const cls = m ? m[1] : "";
  const b = /\bet_pb_pagebuilder_layout\b/.test(cls);
  const t = /\bet-tb-has-body\b/.test(cls);
  return b && t ? "BT" : b ? "B-" : t ? "-T" : "--";
}

function cuerpoClasicoDe(html) {
  const raiz = A.parsea(html);
  const n = buscaClase(raiz, "entry-content");
  return n ? dentro(html, n) : undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LA EXTRACCIÓN
 * ═════════════════════════════════════════════════════════════════════════ */
const ev = new Evaluadas({ nombre: "extractor-f33", unidad: "páginas", minimo: RUTAS.paginas.length });

const docs = [];
const censo = { porTipo: {}, modulos: 0, secciones: 0, filas: 0, columnas: 0, sueltos: 0, porRegimen: {} };
const sinFichero = [];
const problemas = [];

for (const p of RUTAS.paginas) {
  const f = ficheroDe(p.ruta);
  if (!f) { sinFichero.push(p.ruta); continue; }

  const html = A.limpia(readFileSync(f, "utf8"));
  const reg = regimenDe(html);
  censo.porRegimen[reg] = (censo.porRegimen[reg] || 0) + 1;
  const { title, desc, h1 } = cascaronDe(html);

  const doc = {
    slug: p.slug,
    prefijo: oUndef(p.prefijo),
    titulo: h1 || title || p.slug,
    seo: { title: oUndef(title), description: oUndef(desc) },
  };

  if (reg === "--") {
    /* S2 · el segundo canal. No es un escape elegido sin medir: es `campoHtml`,
     * el mismo helper y el mismo `validaHtmlCorpus` que ya usan otras cuatro
     * colecciones, con su contrato censado en 209/209. */
    doc.cuerpoClasico = cuerpoClasicoDe(html);
    if (!doc.cuerpoClasico)
      problemas.push(`${p.ruta}: régimen \`--\` y sin \`entry-content\` — el canal del cuerpo no casa`);
  } else {
    const raiz = A.parsea(html);
    const secciones = SABOTAJE === "sin-secciones" ? [] : A.seccionesPropias(raiz);
    const bloques = [];

    for (const sec of secciones) {
      censo.secciones++;
      const filas = filasDe(sec);
      const enFilas = new Set();
      for (const fila of filas) for (const m of A.modulosDe(fila)) enFilas.add(m);

      /* Los `fullwidth` cuelgan de la sección SIN fila. 2 medidos en 32 páginas. */
      const sueltos = A.modulosDe(sec).filter((m) => !enFilas.has(m));
      censo.sueltos += sueltos.length;

      const seccion = {};
      if (sueltos.length)
        seccion.modulosSueltos = sueltos.map((m) => {
          censo.modulos++;
          const t = A.tipoDe(m);
          censo.porTipo[t] = (censo.porTipo[t] || 0) + 1;
          return aBloque(html, m, p.ruta);
        });

      const filasOut = [];
      for (const fila of filas) {
        censo.filas++;
        const cols = columnasDe(fila);
        const columnas = [];
        for (const col of cols) {
          censo.columnas++;
          const modulos = A.modulosDe(col).map((m) => {
            censo.modulos++;
            const t = A.tipoDe(m);
            censo.porTipo[t] = (censo.porTipo[t] || 0) + 1;
            return aBloque(html, m, p.ruta);
          });
          columnas.push({ ancho: anchoDe(col), modulos });
        }
        if (columnas.length) filasOut.push({ columnas });
      }
      if (filasOut.length) seccion.filas = filasOut;
      if (seccion.filas || seccion.modulosSueltos) bloques.push(seccion);
    }
    if (bloques.length) doc.bloques = bloques;
  }

  docs.push(doc);
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · LOS CONTROLES — antes de congelar nada
 * ═════════════════════════════════════════════════════════════════════════ */
let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

/** El sabotaje de la geometría: escribir un ritmo donde el esquema dice SIN PROBAR. */
if (SABOTAJE === "geometria" && docs[0]?.bloques?.[0]) docs[0].bloques[0].pt = { valor: 0, unidad: "px" };

/**
 * §regla del cero: un extractor que no encuentra NI UN módulo en NINGUNA página
 * no ha medido «páginas vacías» — tiene el parser roto.
 */
if (!censo.modulos) err(`0 MÓDULOS en las ${docs.length} páginas: el parser no casa, no es que estén vacías.`);
if (!censo.secciones) err(`0 SECCIONES propias: `+`\`seccionesPropias\` no casa con nada (§sondas 4).`);
if (sinFichero.length) err(`${sinFichero.length} ruta(s) SIN CAPTURA: ${sinFichero.join(" · ")}`);
for (const x of problemas) err(x);

/**
 * ⚠ EL CRUCE OBLIGATORIO (§sondas 4): otro instrumento, mismo objeto.
 * `arbol-f33.log` contó 313 módulos en 11 tipos con el mismo parser pero por
 * otro camino. Si esto da otro número, el que está mal es esto.
 */
const ESPERADO = { text: 151, image: 71, video: 30, blurb: 22, button: 13, toggle: 10, code: 9, icon: 3, fullwidth_slider: 2, map: 1, slider: 1 };
const TOTAL_ESPERADO = Object.values(ESPERADO).reduce((a, b) => a + b, 0);
const discrepancias = [];
for (const [t, n] of Object.entries(ESPERADO)) if ((censo.porTipo[t] || 0) !== n) discrepancias.push(`${t}: ${censo.porTipo[t] || 0} ≠ ${n}`);
for (const t of Object.keys(censo.porTipo)) if (!(t in ESPERADO)) discrepancias.push(`${t}: ${censo.porTipo[t]} y arbol-f33 no lo tiene`);

/**
 * ⚠⚠ LA GUARDA DE LA GEOMETRÍA — el arreglo falso puesto en código.
 *
 * Recorre lo emitido y exige que NO haya ni una clave de ritmo ni de ancho. El
 * esquema las declara «SIN PROBAR», y `medida()` dice que vacío = el default de
 * Divi: escribir un número ahí **afirma que el editor lo tocó**, que es
 * exactamente el campo inventado del que avisan los tres huecos de la 95.ª.
 */
const GEOMETRIA = new Set(["pt", "pb", "mt", "mb", "ritmo", "anchoPct"]);
const geoEscrita = [];
(function barre(v, ruta) {
  if (Array.isArray(v)) return v.forEach((x, i) => barre(x, `${ruta}[${i}]`));
  if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (GEOMETRIA.has(k)) geoEscrita.push(`${ruta}.${k}`);
      barre(x, `${ruta}.${k}`);
    }
})(docs, "docs");

/* ══════════════════════════════════════════════════════════════════════════
 * 8 · INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ extractor-f33 · corpus congelado, sin red ════════\n`);
console.log(`  ── 1 · DOMINIO ──`);
console.log(`   las 31 de f33-rutas.json          ${String(RUTAS.paginas.length).padStart(4)}`);
console.log(`   con captura en corpus/fase-3      ${String(docs.length).padStart(4)}`);
console.log(`   documentos producidos             ${String(docs.length).padStart(4)}`);
console.log(`   por régimen                            ${Object.entries(censo.porRegimen).sort().map(([k, v]) => `${k}×${v}`).join(" · ")}`);

console.log(`\n  ── 2 · RETÍCULA ──`);
console.log(`   secciones ${String(censo.secciones).padStart(4)}   filas ${String(censo.filas).padStart(4)}   columnas ${String(censo.columnas).padStart(4)}`);
console.log(`   módulos   ${String(censo.modulos).padStart(4)}   de ellos SUELTOS (fullwidth, sin fila) ${censo.sueltos}`);

console.log(`\n  ── 3 · POR TIPO, cruzado con arbol-f33.log (otro camino, mismo objeto) ──`);
for (const [t, n] of Object.entries(ESPERADO)) {
  const v = censo.porTipo[t] || 0;
  console.log(`   ${t.padEnd(20)} ${String(v).padStart(4)}   ${v === n ? "✓" : `✗ arbol-f33 dice ${n}`}`);
}
console.log(`   ${"TOTAL".padEnd(20)} ${String(censo.modulos).padStart(4)}   ${censo.modulos === TOTAL_ESPERADO ? "✓" : `✗ arbol-f33 dice ${TOTAL_ESPERADO}`}`);

console.log(`\n  ── 4 · GEOMETRÍA ──`);
console.log(`   claves de ritmo/ancho escritas    ${String(geoEscrita.length).padStart(4)}   ← tiene que ser 0`);
console.log(`   (SIN ESCRIBIR se omite · NO MEDIBLE se declara · ninguno se convierte en número)`);

if (discrepancias.length) err(`CRUCE CON arbol-f33: ${discrepancias.length} discrepancia(s) — ${discrepancias.join(" · ")}`);
if (geoEscrita.length)
  err(
    `GEOMETRÍA ESCRITA: ${geoEscrita.length} clave(s) — ${geoEscrita.slice(0, 5).join(" · ")}${geoEscrita.length > 5 ? " …" : ""}\n` +
      `   El esquema las declara SIN PROBAR y \`medida()\` dice que vacío = el default de\n` +
      `   Divi. Escribir un número afirma que el editor lo tocó: eso es un CAMPO INVENTADO.`,
  );

/* ⚠ §regla 24, mitad de higiene: **la sonda desvía sus propios sabotajes.** Si
 * el desvío dependiera de que quien la lanza ponga además `NEG=`, el nombre
 * CANÓNICO quedaría al alcance de una corrida de control — y lo que sale
 * entonces es lo peor de §regla 7: un fichero con **nombre de medida y
 * contenido de sabotaje**, plausible y con la autoridad de una congelada. Se
 * arregla la CLASE (aquí), no la instancia (acordarse). */
const SALIDA = SABOTAJE ? nombreNeg("medidas/f33-extraido.json", SABOTAJE) : "medidas/f33-extraido.json";
if (SABOTAJE) console.log(`\n  ⚠ SABOTAJE activo: la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.`);

w(SALIDA, {
  meta: {
    fecha: hoy(),
    sonda: "extractor-f33",
    pregunta: "¿qué documentos de `paginas` produce el corpus de las 31 de la cola larga?",
    fuente: "corpus/fase-3/ (32/32 con sus hojas) + medidas/f33-rutas.json (el dominio)",
    parser: "docs/research/cola-larga/derivaciones/arbol-f33.mjs — importado, no reescrito",
    sabotaje: SABOTAJE,
    alcance: {
      completaPara: "SEMBRAR las 31 en la colección `paginas`",
      noCubre: [
        "la GEOMETRÍA: `pt/pb/mt/mb` y `anchoPct` salen SIN ESCRIBIR (0 ejes comparados en las 31). No es 0: es ausente, que en `medida()` significa «el default de Divi»",
        "`srcset`: omisión DECLARADA, M-IMG sigue abierta en §CMS-0b",
        "los 36 módulos dentro de desplegables CERRADOS: su geometría NO ES MEDIBLE sin interacción, y no medible no es 0",
        "`anchoPct` de las 25 instancias en LÍNEA: el instrumento no las midió (una razón sobre un enlínea mide el texto, no una declaración)",
      ],
    },
  },
  censo,
  cruce: { esperado: ESPERADO, totalEsperado: TOTAL_ESPERADO, discrepancias },
  geometria: { clavesEscritas: geoEscrita.length, detalle: geoEscrita.slice(0, 20) },
  catalogo: { paginas: docs },
});

console.log(
  `\n${rojo ? "❌" : "✅"} extractor-f33: ${docs.length} documentos · ${censo.modulos} módulos · ` +
    `${Object.keys(censo.porTipo).length} tipos · ${geoEscrita.length} claves de geometría · ${rojo} guarda(s) en rojo`,
);
if (rojo) process.exit(2);
