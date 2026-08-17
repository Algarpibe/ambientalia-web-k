/**
 * EL BARRIDO DE UN LISTADO — una sola definición, servida a los DOS lados.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ES UN FICHERO APARTE, Y NO UNA COPIA EN EL COMPARADOR
 *
 * Esta función la escribió `lh-spec` para medir el ORIGINAL. El comparador de
 * dos lados (`lh-cmp`) tiene que medir **lo mismo** en el clon, y la forma
 * barata de conseguirlo —copiarla— es exactamente la **clase C7** con su peor
 * salida: dos barridos que divergen y **los dos verdes en su propio marco**,
 * uno diciendo «la tarjeta mide 277.2» y el otro comparando otra cosa.
 *
 * Es el mismo argumento que ya tiene escrito `css-compilado.mjs`, y el mismo
 * que `kb-cmp` resuelve con «un walker, dos vocabularios».
 *
 * ── Por qué UNA función vale para los dos lados ───────────────────────────
 * Porque **no busca por clases del tema: busca por ROLES**. `deTarjeta()`
 * pregunta «¿cuál es la media, el título, la fecha?» recorriendo una lista de
 * selectores candidatos y **declarando cuál casó** (`sel`), en vez de exigir el
 * markup de WordPress. Un clon fiel emite marcado equivalente, así que el mismo
 * barrido lo lee — y si no lo lee, **eso es el hallazgo**, no un fallo del
 * instrumento: significa que el clon no sirve el rol.
 *
 * ⚠ **Un rol vacío no es culpa del clon por defecto.** `sel: null` dice
 * «ninguno de los candidatos casó», y eso es distinto de «el elemento no
 * existe». El comparador lo trata como par comparable y lo cuenta aparte.
 *
 * ── Contrato de ejecución ─────────────────────────────────────────────────
 * Se serializa con `page.evaluate`, así que **no puede cerrar sobre nada del
 * módulo**: todo lo que usa vive dentro o lo inyecta la página. Usa `__q` del
 * `Censo` (inyectado por `lib.mjs`) para que un selector muerto salga por error
 * y no por cero (§sondas 4).
 *
 * ── Procedencia ───────────────────────────────────────────────────────────
 * Extraída **verbatim** de `lh-spec.mjs` el 2026-08-13, sin tocar una coma: la
 * extracción es mecánica y se comprueba por **igualdad de texto**, para que el
 * NO-OP no dependa de que nadie la transcribiera bien.
 * ═════════════════════════════════════════════════════════════════════════ */
export function barrer() {
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
      /**
       * ⚠⚠ **EL TOPE SE DECLARA, PORQUE UN `slice` SE LEE COMO UNA AUSENCIA DEL
       * ORIGINAL (2026-08-17, 75.ª tanda).**
       *
       * `piezas` va recortado a 12 y **eso no se veía en ningún sitio**: quien
       * derivaba una tabla de secuencias desde el espejo leía «12 piezas» y
       * escribía que el original no sirve más. Medido: las páginas 4 y 5 de
       * `/etiqueta/monitorizacion-ambiental` (`total 11`) emiten **14**, y las
       * dos que se caían eran justo `»` y `Last »` — o sea que la tabla decía
       * que el original NO los sirve, y sí los sirve. Ver `CLAUDE.md` §sondas 4,
       * cuarta cara.
       *
       * `piezasTotales` es el recuento SIN recortar, en la misma unidad que el
       * tope. Con él, la próxima tabla derivada del espejo puede ver que se
       * quedó corta en vez de creerse completa.
       *
       * ⚠ Es **NO-OP sobre todo lo comparado hoy**: `lh-cmp` recorre las claves
       * del ESPEJO, y los espejos congelados (2026-08-14) no traen este campo,
       * así que no genera ni un par. Empieza a comparar el día que se re-mida el
       * original — y entonces compara algo que hoy nadie mira: **cuántas piezas
       * tiene el paginador de verdad**.
       */
      piezasTotales: as.length,
      topeDePiezas: 12,
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
