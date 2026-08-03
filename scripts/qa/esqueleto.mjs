/**
 * ESQUELETO — la topología de una página del ORIGINAL, para decidir arquetipos.
 * Uso: node scripts/qa/esqueleto.mjs [ancho]        (npm run qa:esqueleto)
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * `RECON-LISTADOS.md` pregunta si las 7 formas de contenido editorial del
 * original son un arquetipo o varios. La pregunta se contesta **por el
 * esqueleto**, igual que se contestó para EDAR y Petróleo: lo que decidió allí
 * que eran el mismo arquetipo no fue que se parecieran los textos, sino que la
 * topología de secciones coincidía medida original contra original.
 *
 * ── Qué mide, y por qué esto y no la geometría ──────────────────────────────
 * **Las clases del `<body>` son la medida más directa que existe de "¿los
 * renderiza la misma plantilla?"**. WordPress emite ahí el post type y la
 * plantilla (`single-post`, `single-case-studies`, `page-template-…`), y Divi
 * añade la suya (`et-tb-has-template-…`, `et_pb_pagebuilder_layout`). No hay que
 * inferirlo de alturas: lo dice el HTML servido.
 *
 * Y el discriminador que más peso tiene (F1 del pre-registro): **si el cuerpo es
 * Divi Builder o un blob de plantilla de tema.** En el primero el cuerpo lo
 * compone el editor por página; en el segundo lo fija la plantilla y el editor
 * solo escribe texto. Eso no es una diferencia de campos, es otra forma de
 * página — y por sí solo separa arquetipos.
 *
 * No mide alturas a propósito: aquí la pregunta es de topología, y meter números
 * invitaría a leerlos como si dijeran algo sobre el arquetipo.
 */
import { Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;

/** Dos instancias por forma: con una no se puede ni empezar a comparar. */
const FORMAS = {
  "ENTRADA DE BLOG": [
    "https://kunakair.com/es/nos-hemos-mudado/",
    "https://kunakair.com/es/webinar-deteccion-temprana-de-episodios-de-contaminacion-por-malos-olores-en-edar/",
  ],
  "CASO DE EXITO": [
    "https://kunakair.com/es/casos-de-exito/analisis-de-la-calidad-del-aire-estaciones-moviles-en-belgica/",
    "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/",
  ],
  "TERMINO KUNAKPEDIA": [
    "https://kunakair.com/es/sensor-calidad-aire/",
    "https://kunakair.com/es/redes-de-vigilancia-de-calidad-del-aire/",
  ],
  "DOCUMENTO CIENTIFICO": [
    "https://kunakair.com/es/recursos/documentos-cientificos/articulos-cientificos-y-estudios/uso-de-un-sistema-basado-en-sensores-para-medir-con-precision-los-olores-a-bajas-concentraciones/",
    "https://kunakair.com/es/recursos/documentos-cientificos/articulos-cientificos-y-estudios/cartografia-movil-de-la-calidad-del-aire-mediante-sensores-instalados-en-vehiculos-del-servicio-postal/",
  ],
  "FAQ SUELTA": [
    "https://kunakair.com/es/faqs/el-equipo-tiene-memoria-interna/",
    "https://kunakair.com/es/faqs/a-que-altura-debe-instalarse-el-equipo/",
  ],
  "ARCHIVO DE TAXONOMIA": [
    "https://kunakair.com/es/etiqueta/calidad-del-aire/",
    "https://kunakair.com/es/etiqueta/co2-es/",
  ],
  "ARTICULO DE KB": [
    "https://kunakair.com/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-es-kunak-air/",
    "https://kunakair.com/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-puedes-hacer-con-kunak-air/",
  ],
  /* Controles: dos formas cuyo arquetipo YA conocemos. Sin ellos no se sabe si
     la sonda distingue algo o si todo le sale igual — el test en negativo del
     protocolo (§0), aplicado a una sonda de topología. */
  "· control SECTOR": ["https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/"],
  "· control MONOGRAFICO": [
    "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
  ],
};

const extraer = function () {
  const t = (el, n = 40) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const cls = (el) => (typeof el?.className === "string" ? el.className.trim() : "");

  /** Clases del <body>, que es donde WordPress declara plantilla y post type. */
  const body = cls(document.body).split(/\s+/).filter(Boolean);
  const interesantes = body.filter((c) =>
    /^(single|page|archive|tax|category|tag|postid|page-id|type-|et-tb|et_pb_pagebuilder|et_pb_page|blog|search)/.test(
      c,
    ),
  );

  /**
   * El contenedor del contenido: **`#main-content`**, comprobado y no supuesto.
   *
   * Divi reparte la página en tres árboles y hay que quedarse con el del medio:
   * la cabecera y el pie del Theme Builder cuelgan de `#et-boc`, y `#et-main-area`
   * los envuelve. Medido en tres formas: en una entrada de blog, `body` tiene 6
   * secciones, `#et-main-area` 5 y `#main-content` **2** — que son las del cuerpo.
   * Contar sobre `body` habría metido cabecera y pie en el esqueleto de todas las
   * formas y las habría hecho parecer más iguales de lo que son.
   */
  const main = document.querySelector("#main-content") || document.body;

  /** Secciones Divi de primer nivel dentro del contenido. */
  const seccionesDivi = [...main.querySelectorAll(".et_pb_section")];

  /**
   * ── LA MEDIDA DECISIVA: de qué plantilla sale cada sección ──
   *
   * Divi sufija la clase de cada sección con la plantilla del Theme Builder que
   * la emite: `et_pb_section_0_tb_header`, `…_tb_body`, `…_tb_footer`. Sin
   * sufijo = contenido propio de la entrada o página.
   *
   * Esto responde **directamente** a la pregunta que el recon plantea —¿lo
   * renderiza una plantilla o lo compone el editor?— sin inferir nada de la
   * geometría. Y `et-tb-has-body` en el `<body>` dice si esa forma tiene
   * plantilla de cuerpo **en absoluto**.
   */
  const origen = (el) => {
    const c = typeof el.className === "string" ? el.className : "";
    const m = c.match(/et_pb_section_\d+_(tb_header|tb_body|tb_footer)/);
    return m ? m[1] : "propia";
  };
  const porOrigen = { tb_header: 0, tb_body: 0, tb_footer: 0, propia: 0 };
  for (const s of document.querySelectorAll(".et_pb_section")) porOrigen[origen(s)]++;

  return {
    bodyClases: interesantes,
    /* ── F1: ¿el cuerpo lo compone el editor, o lo fija la plantilla? ── */
    cuerpo: {
      // páginas construidas con el builder llevan esta clase en el <body>
      esBuilder: body.includes("et_pb_pagebuilder_layout"),
      /** ¿Tiene plantilla de CUERPO del Theme Builder? La medida decisiva. */
      tieneTbBody: body.includes("et-tb-has-body"),
      /** Reparto de TODAS las secciones del documento por plantilla de origen. */
      porOrigen,
      nSeccionesDivi: seccionesDivi.length,
      // el blob de plantilla de tema: un único contenedor de contenido
      tieneEntryContent: !!document.querySelector(
        ".entry-content, .post-content, article .et_pb_post_content",
      ),
      // Divi Theme Builder: cuerpo plantillado con el contenido inyectado
      tienePostContentModule: !!document.querySelector(
        ".et_pb_post_content, .et_pb_post_content_0_tb_body",
      ),
    },
    /* ── F2: la secuencia de secciones de primer nivel ── */
    esqueleto: seccionesDivi.map((s) => {
      const clases = cls(s).split(/\s+/).filter((c) => /^et_pb_(section|fullwidth|with)/.test(c));
      return {
        clases: clases.join(" "),
        // de qué está hecha: los tipos de módulo que contiene, sin repetir
        modulos: [
          ...new Set(
            [...s.querySelectorAll("[class*='et_pb_'][class*='_0'], .et_pb_module")]
              .map((m) =>
                (cls(m).match(/et_pb_(?!section|row|column|module|bg|css)([a-z_]+)/) || [])[1],
              )
              .filter(Boolean),
          ),
        ].slice(0, 8),
        txt: t(s, 34),
      };
    }),
    /**
     * ── F3: elementos estructurales propios ──
     *
     * ⚠ **Aquí había ocho booleanos y cuatro mentían.** `barraLateral` daba `sí`
     * en las nueve páginas (cazaba el área de widgets del PIE); `sliderAncho`
     * daba `no` en el control SECTOR, cuya S5 es literalmente
     * `[fullwidth_slider_,slide]`; `relacionados` daba `no` en una entrada de
     * blog que lleva un «También te puede interesar»; y `fecha` daba `no` en un
     * post que muestra «24 mayo 2019».
     *
     * Se quitaron en vez de parchearlos uno a uno, porque **el inventario de
     * módulos por sección de `esqueleto` ya los dice bien** y era el canal
     * fiable. Dos canales que discrepan es el fallo que `CLAUDE.md` §«Dos reglas
     * sobre las sondas mismas» prohíbe: aquí el atajo daba 4 de 8 valores
     * equivocados y el camino largo daba los 8 bien.
     *
     * Quedan los tres que sí se pueden medir sin ambigüedad y que separan un
     * listado de un detalle.
     */
    propios: {
      paginacion: !!document.querySelector(
        ".pagination, .wp-pagenavi, .wp_pagenavi, nav.navigation, .page-numbers",
      ),
      /** Entradas listadas: `>0` es un listado, no un detalle. */
      rejillaEntradas: main.querySelectorAll("article.et_pb_post, .et_pb_post").length,
      /** Barra lateral **de contenido** (módulo Divi), no el pie. */
      barraLateralContenido: !!main.querySelector("[class*='et_pb_sidebar']"),
    },
    /* ── la cola: lo que va entre el contenido y el pie ── */
    cola: {
      sliderAncho: !!document.querySelector("[class*='et_pb_fullwidth_slider']"),
      bloqueK: /Nuestras soluciones/.test(document.body.textContent || ""),
      newsletter: !!document.querySelector("[class*='et_pb_signup'], form[class*='newsletter']"),
    },
    h1: t(document.querySelector("h1"), 60),
    nSecciones: seccionesDivi.length,
  };
};

const { browser } = await launch();
const todo = { meta: { width, fecha: "2026-07-30" }, formas: {} };

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
/**
 * ⚠ **NUMERADOR Y DENOMINADOR EN UNIDADES DISTINTAS — imprimía `16/9`.**
 * `porPaginas` hace que cuente `openPage`, o sea **páginas** (16), y el mínimo
 * contaba **FORMAS** (9). Con eso, **siete páginas caídas seguían dando verde**:
 * basta con que llegue una por forma… y ni eso, porque nueve páginas cualesquiera
 * bastan aunque siete formas se queden sin ninguna.
 *
 * El bucle de abajo es `for (forma of FORMAS) for (url of urls)`, así que el
 * universo en páginas es **la suma de las urls**, y se deriva: añadir una url a
 * una forma sube el listón sola.
 */
const ev = new Evaluadas({ nombre: "esqueleto", unidad: "páginas", minimo: Object.values(FORMAS).reduce((a, u) => a + u.length, 0), porPaginas: true });

for (const [forma, urls] of Object.entries(FORMAS)) {
  todo.formas[forma] = [];
  for (const url of urls) {
    try {
      const { page } = await openPage(browser, url, {
        width,
        height: mobile ? 844 : 900,
        mobile,
      });
      await settle(page);
      const d = await page.evaluate(extraer);
      await page.close();
      todo.formas[forma].push({ url, ...d });
    } catch (e) {
      todo.formas[forma].push({ url, error: String(e).slice(0, 160) });
    }
  }
}
await browser.close();

/* ─────────────────────────────── informe ───────────────────────────────── */

const si = (b) => (b ? "sí" : "· ");

console.log(`\n════════ ESQUELETO POR FORMA @${width} ════════`);
for (const [forma, insts] of Object.entries(todo.formas)) {
  console.log(`\n█ ${forma}`);
  for (const d of insts) {
    if (d.error) {
      console.log(`   ⚠ ${d.url.slice(-52)}  ${d.error}`);
      continue;
    }
    console.log(`   ${d.url.replace("https://kunakair.com/es/", "…/").slice(0, 62)}`);
    console.log(`     body: ${d.bodyClases.join(" ") || "(ninguna interesante)"}`);
    const o = d.cuerpo.porOrigen;
    console.log(
      `     CUERPO: tb-body ${si(d.cuerpo.tieneTbBody)} · builder ${si(d.cuerpo.esBuilder)}` +
        ` · módulo post_content ${si(d.cuerpo.tienePostContentModule)}` +
        ` · secciones en #main-content ${d.cuerpo.nSeccionesDivi}`,
    );
    console.log(
      `     secciones por plantilla de origen: tb_body ${o.tb_body} · propias ${o.propia}` +
        ` · (tb_header ${o.tb_header} · tb_footer ${o.tb_footer})`,
    );
    const p = d.propios;
    const c = d.cola;
    console.log(
      `     propios: paginación ${si(p.paginacion)} · entradas listadas ${p.rejillaEntradas}` +
        ` · lateral de contenido ${si(p.barraLateralContenido)}`,
    );
    console.log(
      `     cola: slider ${si(c.sliderAncho)} · bloqueK ${si(c.bloqueK)} · newsletter ${si(c.newsletter)}`,
    );
    console.log(`     esqueleto (${d.nSecciones} secciones):`);
    d.esqueleto.slice(0, 12).forEach((s, i) =>
      console.log(`        S${i}  [${s.modulos.join(",") || "—"}]  | ${s.txt}`),
    );
  }
}

w("medidas/esqueleto.json", todo);
console.log(
  `\n${Object.keys(todo.formas).length} formas · ` +
    `${Object.values(todo.formas).flat().length} páginas medidas`,
);
