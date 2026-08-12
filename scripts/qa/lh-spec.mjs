/**
 * LA FASE DE SPECS DE LISTADOS Y HUBS — `getComputedStyle` del árbol de las 9
 * formas, en el ORIGINAL VIVO, a los dos anchos.
 * Uso: node scripts/qa/lh-spec.mjs [1440|390]      (npm run qa:lh-spec)
 *
 * ── Por qué existe: `LH-SP2` dice que aquí NO HAY UN PÍXEL MEDIDO ─────────
 * El recon de `listados-hubs` es de topología (régimen, esqueleto de primer
 * nivel, campos por tarjeta) y lo dice él mismo: *«LH-SP2 · la geometría: ni un
 * píxel medido en esta tanda»*. `LH-2` decidió el modelado sobre eso, y la
 * pasada de comportamiento (`P-LH-C6`) cerró las interacciones. Lo que nunca se
 * midió es **la caja, el ritmo y la tipografía** — o sea la spec.
 *
 * Construir sin ella es §UN ARQUETIPO NUEVO NO HEREDA COBERTURA con su versión
 * más cara: la plantilla se inventa y después las anclas de QA se calibran
 * contra lo inventado.
 *
 * ── Contra el sitio VIVO, no contra la captura ────────────────────────────
 * Misma razón medida que en `kb-spec` (PASO 0 de F3-1, `medidas/kb-css.json`):
 * la captura **no trae las hojas externas** y aun así renderiza, así que sale
 * *plausible y equivocada*. Aquí el riesgo es idéntico y está cuantificado por
 * `qa:hover-zonal`, que tuvo que pedir **7–14 hojas externas por forma** para
 * encontrar la regla de zoom: sin ellas, esa regla no está en el documento.
 *
 * ── EL RÉGIMEN, que decide cómo se lee cada número ────────────────────────
 * `CLAUDE.md` §régimen: se identifica ANTES de aplicar ningún test, porque en
 * el régimen equivocado los tests dan la respuesta INVERTIDA. Medido en
 * `medidas/lh-regimen.json`, y las 9 formas NO son homogéneas:
 *
 *   · **L1** (23 archivos, `tb_body`) · **L2** · **L3** (plantilla de tema) ·
 *     **L5** (plantilla PHP) → **PLANTILLADOS**. No existe un editor por
 *     instancia: el discriminador es la **VARIANZA ENTRE INSTANCIAS**, y un px
 *     absoluto significa «lo fijó quien construyó la plantilla» = PLANTILLA.
 *   · **L4** (6 hubs de builder) → **BUILDER**. Ahí sí valen los tests A y B
 *     tal como están escritos.
 *
 * ⚠ Y de ahí sale el alcance de esta sonda, que es lo que la hace útil o
 * inútil: **la varianza entre instancias no se puede medir con UNA instancia.**
 * Por eso no se mide «una por forma»: se mide la canónica **más una segunda por
 * familia**, elegida por la regla adversaria que el propio recon pre-registró
 * (*el extremo* — la instancia con MENOS tarjetas, que es la que rompe una
 * plantilla calibrada con la abundante). Sin segunda instancia, toda propiedad
 * de esa forma se congela como **SIN PROBAR**, no como plantilla.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Censo`: un selector que no case en ninguna página ⇒ error, no cero
 *     (§sondas 4). Los selectores de tarjeta son DOS FAMILIAS —módulo de Divi y
 *     loop del tema— y confundirlas ya costó un defecto en `lh-censo`;
 * 2 · `Evaluadas`, mínimo **derivado** de la lista de páginas, no escrito;
 * 3 · congela en `medidas/lh-spec-<ancho>.json` (§sondas 2 y 5);
 * 4 · `SIN_CLON=1`: no toca el clon, así que un `build` en vuelo no la
 *     contamina — y al revés, ella no obliga a parar nada;
 * 5 · los renglones se cuentan con un `Range`, **nunca** con
 *     `getClientRects().length` sobre el elemento: en un bloque eso devuelve 1
 *     siempre, que es un número plausible y falso (§corolario de instrumento);
 * 6 · **la base se mide EN CRUDO** (`y` absoluta del `h1`, sin corregir): es la
 *     obligación de §Notas de método para todo arquetipo nuevo, y lo que
 *     destapó los −48 que cuatro páginas llevaban meses escondiendo.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const ANCHO = Number(process.argv[2] || 1440);
const MOVIL = ANCHO <= 500;
const ORIGEN = "https://kunakair.com";

/* ── QUÉ PÁGINAS, y todas DERIVADAS de congeladas ──────────────────────────
 * Las 9 canónicas salen de `hover-zonal.json` (las mismas que midió el eje de
 * comportamiento: si la spec midiera otras instancias, las dos medidas no se
 * podrían cruzar). Las segundas salen de `lh-censo.json` por la regla
 * adversaria. Ni una ruta escrita a mano. */
const hover = JSON.parse(readFileSync(join(QA, "medidas/hover-zonal.json"), "utf8"));
const censoLh = JSON.parse(readFileSync(join(QA, "medidas/lh-censo.json"), "utf8"));

/** Familia del censo → forma de las 9. El reparto es el del recon §4. */
const FAMILIA_DEL_GRUPO = { post_tag: "L1-etiqueta", resources: "L1-resources-hijo", "scientific-category": "L3-sci" };

const nTarjetas = (r) => censoLh.paginas[r]?.tarjetas?.n ?? censoLh.paginas[r]?.tarjetas?.length ?? 0;

/** El EXTREMO de cada familia: la que menos tarjetas trae, desempate alfabético.
 *  Es la regla adversaria que el recon pre-registró («el que MÁS y el que MENOS»),
 *  y la que rompe una plantilla calibrada con la instancia abundante. */
const segundaDe = (grupo, canonica) =>
  Object.entries(censoLh.paginas)
    .filter(([r, v]) => v.grupo === grupo && r !== canonica && !v.error)
    .sort((a, b) => nTarjetas(a[0]) - nTarjetas(b[0]) || a[0].localeCompare(b[0]))[0]?.[0] ?? null;

const PAGINAS = [];
for (const [forma, v] of Object.entries(hover.formas)) {
  PAGINAS.push({ forma, ruta: v.ruta, papel: "canónica", n: nTarjetas(v.ruta) });
  const grupo = Object.entries(FAMILIA_DEL_GRUPO).find(([, f]) => f === forma)?.[0];
  if (grupo) {
    const s = segundaDe(grupo, v.ruta);
    if (s) PAGINAS.push({ forma, ruta: s, papel: "2.ª (extremo: menos tarjetas)", n: nTarjetas(s) });
  }
}
/* L1-resources-PADRE tiene 2 instancias y su hermana es la otra ruta de su par;
 * L2 ya viene con sus dos instancias como dos «formas» del censo de 9. */
{
  const canon = hover.formas["L1-resources-padre"]?.ruta;
  const otra = ["/es/recursos/articulos/", "/es/recursos/seminarios-web/"].find((r) => r !== canon);
  if (canon && otra) PAGINAS.push({ forma: "L1-resources-padre", ruta: otra, papel: "2.ª (la otra del par)", n: nTarjetas(otra) });
}

if (PAGINAS.length < Object.keys(hover.formas).length)
  throw new Error(`derivadas ${PAGINAS.length} páginas y las formas son ${Object.keys(hover.formas).length}. Sin denominador no hay spec.`);

/** Lo que se ejecuta dentro de la página. Es la spec entera. */
function barrer() {
  const n2 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : +Number(x).toFixed(2));
  const R = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { w: n2(b.width), h: n2(b.height), y: n2(b.top + scrollY), x: n2(b.left) };
  };
  const S = (el, props) => {
    if (!el) return null;
    const c = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = c[p];
    return o;
  };
  const RITMO = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"];
  const TIPO = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign", "textTransform", "textDecorationLine"];
  const CAJA = ["width", "maxWidth", "minHeight", "display", "backgroundColor", "backgroundImage", "borderTopWidth", "borderBottomWidth", "borderColor", "borderRadius", "boxShadow", "overflow", "position", "objectFit"];

  const renglones = (el) => {
    if (!el || !el.firstChild) return null;
    try {
      const r = document.createRange();
      r.selectNodeContents(el);
      const tops = new Set([...r.getClientRects()].filter((b) => b.width > 0 && b.height > 0).map((b) => Math.round(b.top * 10) / 10));
      return tops.size || null;
    } catch { return null; }
  };
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const rend = (el) => !!el && el.getClientRects().length > 0;
  const marca = (el) => (el ? `${el.tagName.toLowerCase()}${[...el.classList].slice(0, 3).map((c) => "." + c).join("")}` : null);

  /* ── LA TARJETA ──────────────────────────────────────────────────────────
   * Dos familias de markup, y confundirlas ya costó dos defectos en `lh-censo`
   * (el módulo de Divi `article.et_pb_post` contra el loop del tema
   * `article.type-*`, y el wrapper `article.type-page` de la propia página).
   * Se buscan las dos, se declara CUÁL casó, y el wrapper de página se excluye
   * explícitamente. */
  const contenedorDeTarjetas = () => {
    const viaDivi = [...document.querySelectorAll(".et_pb_blog_grid article.et_pb_post, .et_pb_ajax_pagination_container article.et_pb_post, article.et_pb_post")];
    if (viaDivi.length) return { via: "modulo-divi", cards: viaDivi };
    const viaTema = [...document.querySelectorAll("article[class*='type-']")].filter((a) => !a.classList.contains("type-page") && !a.classList.contains("page"));
    if (viaTema.length) return { via: "loop-del-tema", cards: viaTema };
    const viaCaso = [...document.querySelectorAll(".case-list-content article, .case-list article")];
    if (viaCaso.length) return { via: "plantilla-php-casos", cards: viaCaso };
    return { via: null, cards: [] };
  };

  /** Las partes de la tarjeta por ROL, con el selector que casó al lado — para
   *  que la spec diga qué se midió y no sólo el número. */
  const parteDe = (card, sels) => {
    for (const s of sels) { const e = card.querySelector(s); if (e) return { sel: s, el: e }; }
    return null;
  };
  const deTarjeta = (card) => {
    const media = parteDe(card, [".entry-featured-image-url img", ".et_pb_image_container img", "a.case-imagen", ".scientific-imagen-container", ".post-thumbnail img", "img"]);
    const envoltorioMedia = parteDe(card, [".entry-featured-image-url", ".et_pb_image_container", "a.case-imagen", ".scientific-imagen-container"]);
    const titulo = parteDe(card, ["h1.entry-title", "h2.entry-title", "h3.entry-title", ".case-titulo", ".scientific-titulo", "h1", "h2", "h3", "h4"]);
    const fecha = parteDe(card, [".published", "time", ".post-meta .updated", ".fecha"]);
    const categoria = parteDe(card, ["a[rel~='category']", ".post-meta a[href*='/categoria/']", "a[href*='/scientific-category/']", ".post-meta a"]);
    const meta = parteDe(card, [".post-meta", ".et_pb_title_meta_container", ".entry-meta"]);
    const extracto = parteDe(card, [".post-content p", ".post-content-inner p", ".entry-summary p", ".excerpt"]);
    const enlaces = [...card.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    const un = (p, extra = {}) => (p ? { sel: p.sel, marca: marca(p.el), rect: R(p.el), tipo: S(p.el, TIPO), ritmo: S(p.el, RITMO), caja: S(p.el, CAJA), texto: txt(p.el)?.slice(0, 300), renglones: renglones(p.el), ...extra } : null);
    return {
      marca: marca(card),
      clases: [...card.classList],
      rect: R(card),
      ritmo: S(card, RITMO),
      caja: S(card, CAJA),
      media: media ? { ...un(media), src: media.el.getAttribute("src"), srcset: media.el.getAttribute("srcset"), alt: media.el.getAttribute("alt"), attrW: media.el.getAttribute("width"), attrH: media.el.getAttribute("height") } : null,
      envoltorioMedia: un(envoltorioMedia),
      titulo: un(titulo, { etiqueta: titulo ? titulo.el.tagName.toLowerCase() : null, href: titulo?.el.querySelector("a")?.getAttribute("href") ?? null }),
      fecha: un(fecha),
      categoria: un(categoria, { href: categoria?.el.getAttribute("href") ?? null }),
      meta: un(meta),
      extracto: un(extracto),
      hrefs: [...new Set(enlaces)].slice(0, 6),
      etiquetas: [...new Set([...card.querySelectorAll("*")].map((e) => e.tagName.toLowerCase()))],
    };
  };

  /* ── EL PAGINADOR ───────────────────────────────────────────────────────
   * Tres pieles censadas en F3-0. Y `L3` **no sirve ninguno** en el cuerpo
   * (§LH-C6-L3-SIN-PAGINADOR): el único `/page/2/` del documento vive en el
   * `<link rel=next>` del `<head>`. Se registra la ausencia CON su número, que
   * es distinto de no haber mirado. */
  const paginador = (() => {
    /* ⚠ Las TRES pieles vienen de `lh-serie.mjs`, que las censó sobre el corpus
     * de F3-0 — no se escriben de nuevo aquí de memoria. La primera versión de
     * esta sonda se dejó la **C** (`nav.kunak-pagination`, 12 documentos) y dio
     * «paginador NO» en 6 páginas que SÍ paginan: §sondas 4 en su forma pura, y
     * salió porque contradecía `BEHAVIORS.md` §1b, no porque diera error. */
    const p =
      document.querySelector('div.wp-pagenavi[role="pagination"]') ??
      document.querySelector('div.wp-pagenavi[role="navigation"]') ??
      document.querySelector("nav.kunak-pagination") ??
      document.querySelector("div.wp-pagenavi, nav.navigation");
    const linkNext = document.querySelector("link[rel='next']")?.getAttribute("href") ?? null;
    /* La ausencia se registra CON su número: `L3` no sirve paginador en el
     * cuerpo y su único `/page/2/` vive en el `<head>` (§LH-C6-L3-SIN-PAGINADOR).
     * «no hay» y «no miré» tienen que salir distintos. */
    if (!p) return { presente: false, enElCuerpo: false, piel: "ninguna", linkNextDelHead: linkNext, hrefs: [] };
    const piel = p.matches('div.wp-pagenavi[role="pagination"]') ? "A" : p.matches('div.wp-pagenavi[role="navigation"]') ? "B" : p.matches("nav.kunak-pagination") ? "C" : "?";
    const as = [...p.querySelectorAll("a[href], span")];
    return {
      presente: true,
      enElCuerpo: true,
      piel,
      marca: marca(p),
      rect: R(p),
      ritmo: S(p, RITMO),
      caja: S(p, CAJA),
      tipo: S(p, TIPO),
      linkNextDelHead: linkNext,
      hrefs: as.map((a) => a.getAttribute?.("href") ?? null).filter(Boolean),
      piezas: as.slice(0, 12).map((a) => ({ marca: marca(a), texto: txt(a), rect: R(a), tipo: S(a, TIPO), ritmo: S(a, RITMO), caja: S(a, CAJA) })),
    };
  })();

  /* ── EL ESQUELETO ───────────────────────────────────────────────────────
   * Se separan las secciones `_tb_` (theme builder: cascarón, lectura
   * plantillada) de las propias. En L2/L3/L5 no hay `_tb_` y el cuerpo lo pone
   * la plantilla del tema: se registra el contenedor del tema aparte. */
  const secciones = [...document.querySelectorAll(".et_pb_section")];
  /* ⚠ `_tb_` NO es «cascarón»: la cabecera y el pie del theme builder viven en
   * TODAS las páginas del sitio, y en L1 el CUERPO también es `_tb_body`. La
   * primera versión metía las tres capas en un saco, así que L1 salía con
   * «0 secciones propias» y la cola comercial daba **0 en las 13** — un PLENO
   * (§sondas 4bis) que se lee como dato. Se separan las cuatro capas. */
  const capaDe = (s) =>
    /_tb_header/.test(s.className) ? "tb_header" : /_tb_footer/.test(s.className) ? "tb_footer" : /_tb_body/.test(s.className) ? "tb_body" : /_tb_/.test(s.className) ? "tb_otra" : "propia";
  const esTb = (s) => capaDe(s) === "tb_header" || capaDe(s) === "tb_footer";
  /** Las que componen el CUERPO de la página: `_tb_body` en L1, propias en L4/L5. */
  const esCuerpo = (s) => capaDe(s) === "tb_body" || capaDe(s) === "propia";
  const deSeccion = (s) => {
    const filas = [...s.querySelectorAll(":scope > .et_pb_row, :scope > .et_pb_row_inner, :scope > .et_pb_with_border > .et_pb_row")];
    return {
      clases: [...s.classList],
      estiloInline: s.getAttribute("style") || null,
      rect: R(s),
      renderizada: rend(s),
      ritmo: S(s, RITMO),
      caja: S(s, CAJA),
      nFilas: filas.length,
      filas: filas.map((f) => {
        const cols = [...f.querySelectorAll(":scope > .et_pb_column")];
        return {
          clases: [...f.classList],
          estiloInline: f.getAttribute("style") || null,
          rect: R(f),
          renderizada: rend(f),
          ritmo: S(f, RITMO),
          caja: S(f, CAJA),
          nColumnas: cols.length,
          reparto: cols.map((c) => [...c.classList].find((x) => /^et_pb_column_\w+$/.test(x))?.replace("et_pb_column_", "") ?? "?").join("+"),
          columnas: cols.map((c) => ({
            tipo: [...c.classList].find((x) => /^et_pb_column_\w+$/.test(x)) ?? null,
            rect: R(c),
            ritmo: S(c, RITMO),
            caja: S(c, CAJA),
            modulos: [...c.querySelectorAll(":scope > .et_pb_module")].map((m) => ({
              marca: marca(m),
              clases: [...m.classList].filter((x) => x !== "et_pb_module"),
              estiloInline: m.getAttribute("style") || null,
              rect: R(m),
              renderizado: rend(m),
              ritmo: S(m, RITMO),
              caja: S(m, CAJA),
              texto: txt(m)?.slice(0, 160),
            })),
          })),
        };
      }),
    };
  };

  const { via, cards } = contenedorDeTarjetas();
  const h1 = __q("h1");
  const cabecera = __q("header.et-l--header") ?? document.querySelector("header");
  const pie = document.querySelector("footer.et-l--footer, footer#main-footer, footer");
  /* El contenedor del tema, que en L2/L3/L5 es donde vive el listado. */
  const contenedorTema = document.querySelector("#main-content .container, #main-content, .case-list-content, .et_pb_ajax_pagination_container");

  return {
    ancho: innerWidth,
    body: { clases: [...document.body.classList], regimen: { builder: document.body.classList.contains("et_pb_pagebuilder_layout"), tbBody: document.body.classList.contains("et-tb-has-body") } },
    docH: n2(document.documentElement.scrollHeight),
    canonical: document.querySelector("link[rel=canonical]")?.getAttribute("href") ?? null,
    titulo: document.title,
    /* ⚠ EN CRUDO, sin restar nada: es la obligación de §Notas de método para un
     * arquetipo nuevo, y lo único que puede ver un desfase que viva EN la base. */
    /* ⚠ Y si NO hay `h1` eso es un HECHO, no un hueco de medición: se dice, y se
     * da un ancla alternativa. `D4` afirma «los 35 h1 = nombre del término», y
     * `lh-censo` guardó `h1: ""` para `glosario` y `preguntas-frecuentes` — que
     * es «lo encontré vacío» y «no lo encontré» colapsados en el mismo valor.
     * Derivado sobre el HTML capturado: esas dos páginas tienen CERO `<h1>`. */
    baseEnCrudo: h1
      ? { hayH1: true, yAbsoluta: R(h1).y, texto: txt(h1), etiqueta: h1.tagName.toLowerCase(), tipo: S(h1, TIPO), ritmo: S(h1, RITMO), rect: R(h1), renglones: renglones(h1), renderizado: rend(h1) }
      /* ⚠ ARREGLADO 2026-08-11 (F3-2, PASO 2). Esto decía
       * `querySelector("article[class*='type-'], article.et_pb_post")` **sin
       * filtrar el wrapper `article.type-page`** — el mismo filtro que
       * `contenedorDeTarjetas()` sí tiene 160 líneas más arriba, y que su
       * propio comentario explica. §sondas 3 (*documentado no es conectado*)
       * en su forma más barata: el arreglo existe, está razonado, y **no está
       * en la llamada que importa**.
       *
       * Medido sobre el corpus (`qa:lh-ancla`, 149 documentos): en `/recursos`
       * y `/recursos/page/2` el selector viejo apunta a `post-33166 type-page`
       * —la página— y la 1.ª tarjeta es `post-71347 type-post`.
       *
       * **Y el arreglo es NO-OP sobre lo ya congelado**, comprobado y no
       * supuesto: `anclaAlternativa` sólo se evalúa donde NO hay `h1`, y las
       * únicas rutas así son `/es/glosario/` y `/es/preguntas-frecuentes/`, que
       * no traen wrapper. `lh-spec-{1440,390}.json` **no se re-emiten**. Se
       * arregla la CLASE igualmente: el día que se mida una forma sin `h1` que
       * sí lo traiga, el ancla apuntaría mal **en silencio**. */
      : { hayH1: false, yAbsoluta: null, anclaAlternativa: (() => { const c = contenedorDeTarjetas().cards[0] ?? null; return c ? { que: "primera tarjeta", marca: marca(c), yAbsoluta: R(c).y } : null; })() },
    cabecera: cabecera ? { marca: marca(cabecera), rect: R(cabecera), ritmo: S(cabecera, RITMO), caja: S(cabecera, CAJA) } : null,
    pie: pie ? { marca: marca(pie), yAbsoluta: R(pie).y, rect: R(pie) } : null,
    contenedorTema: contenedorTema ? { marca: marca(contenedorTema), rect: R(contenedorTema), ritmo: S(contenedorTema, RITMO), caja: S(contenedorTema, CAJA) } : null,
    esqueleto: {
      nSecciones: secciones.length,
      porCapa: secciones.reduce((o, s) => { const c = capaDe(s); o[c] = (o[c] ?? 0) + 1; return o; }, {}),
      cascaron: secciones.filter(esTb).map((s) => ({ capa: capaDe(s), clases: [...s.classList], rect: R(s), ritmo: S(s, RITMO) })),
      /** El cuerpo, sea `_tb_body` (L1) o propio (L4/L5). Es lo que la plantilla del arquetipo tiene que emitir. */
      cuerpo: secciones.filter(esCuerpo).map((s) => ({ capa: capaDe(s), ...deSeccion(s) })),
    },
    listado: {
      via,
      nTarjetas: cards.length,
      /* Las 3 primeras: una no enseña la varianza intra-página; las 3 la enseñan
       * y no cuestan. La 1.ª y la 2.ª además dan el HUECO entre tarjetas, que a
       * 390 es donde se apilan (§la regla espejo). */
      tarjetas: cards.slice(0, 3).map(deTarjeta),
      /* ⚠ El hueco de una REJILLA no es `y[1] − fin(y[0])`: la tarjeta 1 está al
       * LADO de la 0, así que esa resta da un número negativo grande y plausible
       * (salió −653.53 en la primera corrida). Se decide primero si la 1 está en
       * la misma banda que la 0 —mismo `y`— y sólo entonces el hueco es
       * horizontal; el vertical se mide contra la primera tarjeta de la banda
       * SIGUIENTE, que es la primera con `y` mayor. */
      rejilla: (() => {
        if (cards.length < 2) return { columnas: cards.length, huecoH: null, huecoV: null, nota: "una sola tarjeta: sin hueco medible" };
        const r = cards.map(R);
        const y0 = r[0].y;
        const banda0 = r.filter((b) => Math.abs(b.y - y0) < 2);
        const sig = r.find((b) => b.y - y0 >= 2);
        return {
          columnas: banda0.length,
          huecoH: banda0.length > 1 ? n2(banda0[1].x - (banda0[0].x + banda0[0].w)) : null,
          huecoV: sig ? n2(sig.y - (r[0].y + r[0].h)) : null,
          apiladas: banda0.length === 1,
        };
      })(),
      contenedor: cards.length ? { marca: marca(cards[0].parentElement), rect: R(cards[0].parentElement), ritmo: S(cards[0].parentElement, RITMO), caja: S(cards[0].parentElement, CAJA) } : null,
    },
    paginador,
    /* LH-SP4 · la COLA COMERCIAL: qué hay entre el listado y el pie. El censo
     * contaba secciones; nunca las identificó una a una. */
    cola: (() => {
      if (!cards.length) return null;
      const yFin = R(cards[cards.length - 1]).y + R(cards[cards.length - 1]).h;
      return secciones
        .filter((s) => esCuerpo(s) && rend(s) && R(s).y >= yFin - 1)
        .map((s) => ({ clases: [...s.classList].filter((c) => c !== "et_pb_section").slice(0, 4), rect: R(s), ritmo: S(s, RITMO), titular: txt(s.querySelector("h1,h2,h3"))?.slice(0, 120) ?? null }));
    })(),
  };
}

const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: `lh-spec@${ANCHO}`, unidad: "páginas", minimo: PAGINAS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: `SPECS de listados y hubs: \`getComputedStyle\` del árbol de las 9 formas + una 2.ª instancia por familia, a ${ANCHO}.`,
    fuente: "kunakair.com VIVO — la captura no trae las hojas externas (7–14 por forma, medido en hover-zonal.json)",
    ancho: ANCHO,
    protocolo: "perfil limpio · Cookiebot bloqueado · " + (MOVIL ? "Emulation.setDeviceMetricsOverride 390×844" : "viewport 1440×900") + " · scroll+settle · lazy→eager",
    regimen: "L1/L2/L3/L5 PLANTILLADOS (discriminador = varianza ENTRE INSTANCIAS) · L4 BUILDER (tests A y B). Aplicar el test del otro régimen da la respuesta invertida.",
    alcance:
      "9 formas × 1 instancia canónica + 4 segundas instancias (regla adversaria: la de MENOS tarjetas). " +
      "Toda propiedad de una forma con n=1 se congela SIN PROBAR: la varianza entre instancias no se mide con una.",
    ruido: "⚠ estas rutas NO tienen campaña de ruido: un residuo pequeño aquí es SIN PROBAR, no limpio",
    noMide: [
      "el clon: no está construido (las 9 dan 404 — medido en comportamiento-1440.json)",
      "anchos intermedios: el contrato ahí es de RANGO, no de fidelidad (§CONTRATO)",
      "la varianza de las formas con una sola instancia (L1-blog · L4-listado-embebido · L5-casos)",
    ],
  },
  paginas: {},
};

for (const P of PAGINAS) {
  const { page, status } = await openPage(browser, ORIGEN + P.ruta, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  if (status >= 400 || status === 0) { ev.fallo(P.ruta, `HTTP ${status}`); await page.close(); continue; }
  await settle(page);
  const { datos } = await censo.medir(page, barrer);
  salida.paginas[`${P.forma}::${P.ruta}`] = { forma: P.forma, ruta: P.ruta, papel: P.papel, ...datos };
  await page.close();
  await new Promise((r) => setTimeout(r, 400));
  ev.ok();

  console.log(
    `  ${P.forma.padEnd(20)} ${P.ruta.padEnd(56)} ${P.papel.padEnd(30)}` +
      ` h1.y ${String(datos.baseEnCrudo?.yAbsoluta ?? "—").padStart(8)} · secc ${datos.esqueleto.nSecciones} (tb ${datos.esqueleto.nTb})` +
      ` · tarjetas ${String(datos.listado.nTarjetas).padStart(3)} vía ${datos.listado.via ?? "—"}` +
      ` · paginador ${datos.paginador.enElCuerpo ? "sí" : "NO"}`,
  );
}

await browser.close();

/* ══════════ LO QUE LA SPEC DECIDE, CON SU TEST Y SU DENOMINADOR ══════════ */
const P = Object.values(salida.paginas);
const uniq = (a) => [...new Set(a.map((x) => JSON.stringify(x)))].map((s) => JSON.parse(s));
const porForma = {};
for (const p of P) (porForma[p.forma] ??= []).push(p);

/** Varianza ENTRE INSTANCIAS de una familia. Con n=1 devuelve SIN PROBAR — que
 *  es una afirmación distinta de «no varía», y confundirlas es cómo se cablea
 *  una plantilla inventada. */
const entreInstancias = (grupo, f) => {
  const vals = uniq(grupo.map(f));
  if (grupo.length < 2) return { n: grupo.length, veredicto: "SIN PROBAR (n=1)", valores: vals };
  return { n: grupo.length, veredicto: vals.length === 1 ? "PLANTILLA (varianza 0)" : "VARÍA — mirar", valores: vals };
};

salida.veredicto = {
  ancho: ANCHO,
  porForma: Object.fromEntries(
    Object.entries(porForma).map(([forma, g]) => [
      forma,
      {
        instancias: g.length,
        regimen: g[0].body.regimen.tbBody ? (g[0].body.regimen.builder ? "híbrido" : "plantillado (tb_body)") : g[0].body.regimen.builder ? "builder" : "plantillado (tema)",
        baseEnCrudo: entreInstancias(g, (x) => x.baseEnCrudo?.yAbsoluta ?? null),
        cabeceraAlto: entreInstancias(g, (x) => x.cabecera?.rect.h ?? null),
        nSecciones: entreInstancias(g, (x) => x.esqueleto.nSecciones),
        capas: entreInstancias(g, (x) => x.esqueleto.porCapa),
        pielPaginador: entreInstancias(g, (x) => x.paginador.piel),
        via: entreInstancias(g, (x) => x.listado.via),
        anchoTarjeta: entreInstancias(g, (x) => x.listado.tarjetas[0]?.rect.w ?? null),
        rejilla: entreInstancias(g, (x) => ({ columnas: x.listado.rejilla?.columnas ?? null, huecoH: x.listado.rejilla?.huecoH ?? null, huecoV: x.listado.rejilla?.huecoV ?? null })),
        tipoTitulo: entreInstancias(g, (x) => x.listado.tarjetas[0]?.titulo?.tipo ?? null),
        tipoH1: entreInstancias(g, (x) => x.baseEnCrudo?.tipo ?? null),
        paginadorEnElCuerpo: entreInstancias(g, (x) => x.paginador.enElCuerpo),
        colaSecciones: entreInstancias(g, (x) => (x.cola ?? []).length),
      },
    ]),
  ),
  /* Test B (varía entre hermanos de la MISMA página) — sólo legítimo en L4, que
   * es la única forma en régimen de builder. En las plantilladas se registra
   * igual, pero NO decide: ahí el discriminador es el de arriba. */
  testB_soloL4: (() => {
    const l4 = porForma["L4-listado-embebido"]?.[0];
    if (!l4) return null;
    const secc = l4.esqueleto.cuerpo;
    const filas = secc.flatMap((s) => s.filas);
    const mods = filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos));
    return {
      seccionPt: uniq(secc.map((s) => s.ritmo?.paddingTop)),
      seccionPb: uniq(secc.map((s) => s.ritmo?.paddingBottom)),
      filaPt: uniq(filas.filter((f) => f.renderizada).map((f) => f.ritmo?.paddingTop)),
      moduloMb: uniq(mods.filter((m) => m.renderizado).map((m) => m.ritmo?.marginBottom)),
      moduloAncho: uniq(mods.filter((m) => m.renderizado).map((m) => m.caja?.width)),
    };
  })(),
};

console.log(`\n═══ SPEC LISTADOS @${ANCHO} — ${P.length} páginas, ${Object.keys(porForma).length} formas`);
for (const [forma, v] of Object.entries(salida.veredicto.porForma)) {
  console.log(`  ${forma.padEnd(20)} n=${v.instancias} · ${v.regimen}`);
  for (const k of ["baseEnCrudo", "anchoTarjeta", "rejilla", "capas", "pielPaginador", "colaSecciones"]) {
    const r = v[k];
    console.log(`      ${k.padEnd(16)} ${r.veredicto.padEnd(24)} ${JSON.stringify(r.valores).slice(0, 90)}`);
  }
}
console.log(`✓ evaluadas ${P.length}/${PAGINAS.length} páginas · spec de listados`);

const muertos = censo.informe();
w(`medidas/lh-spec-${ANCHO}.json`, salida);
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
