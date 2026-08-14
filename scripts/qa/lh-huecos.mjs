/**
 * LO QUE LAS SPECS DE `L2` · `L3` · `L5` **NO** CONTESTAN — medido ANTES de
 * construir, que es cuando todavía no hay nada que defender.
 * Uso: node scripts/qa/lh-huecos.mjs        (npm run qa:lh-huecos)
 *      SABOTAJE=<x> node …                  (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y POR QUÉ NO ES «REVISAR LAS SPECS OTRA VEZ»
 *
 * `CLAUDE.md` §*UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA*: una
 * medida contesta las preguntas que se le hicieron, y **su fichero no lleva
 * escrito cuáles NO**. `lh-barra.json` acertó en todo lo que midió y el
 * componente de `L1-resources` salió mal igual, porque nadie le preguntó
 * cuántas filas tenía el cuerpo.
 *
 * La regla operativa que dejó es: **antes de construir sobre una medida,
 * escribe qué pregunta contesta y qué preguntas NO.** Esta sonda es ese
 * ejercicio hecho contra `L2`, `L3` y `L5`, y lo que devuelve **no** es una
 * opinión sobre las specs: son **cinco huecos con su número**, cada uno
 * derivado del canal que lo contesta.
 *
 * ── Los cinco, y qué decide cada uno ──────────────────────────────────────
 * | # | hueco | lo que la spec dice | lo que el canal dice |
 * |---|---|---|---|
 * | 1 | la BARRA de `L2` | `lh-barra`: **0 de 12** con barra | el `<body>` trae `et_right_sidebar` y el árbol un `#sidebar` con **3 widgets** — es la barra del TEMA, no la partición Divi `3_4+1_4` que aquella medida buscaba |
 * | 2 | la BANDA de `.container` | la spec da `ancla y = 283` y `cabecera h = 225` y **no nombra los 58 de en medio** | `58` px, **iguales a 1440 y a 390** |
 * | 3 | la VENTANA de la piel B | «todas las páginas de `n+1` a `total`» | **5 números** con `« First`, `...` y `Last »` — y las instancias que la calibraron (`total ≤ 4`) **no podían separar los dos modelos** |
 * | 4 | el ORDEN de `L2` | la spec **no lo trata** | `/glosario` = `datePublished` DESC **37/37**; `/preguntas-frecuentes` **sin canal** |
 * | 5 | la BANDA DE FILTROS de `L3` y `L5` | ninguna de las dos specs la nombra | `L3` sirve `#filters.filtros-scientific` (3 botones) y `L5` `.case-filter` (12) **entre el `h1` y el listado** |
 *
 * ── Y lo que esta sonda NO hace ──────────────────────────────────────────
 * No mide el clon —las 6 formas no están emitidas— ni compara píxeles: lee el
 * **corpus congelado** de `corpus/fase-3/listados` y los sitemaps de F3-0. Su
 * afirmación es *«la spec no contesta X, y el canal Y dice esto»*, ni una más.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina
gritaSiRevienta();

const SABOTAJES = ["sin-corpus", "sin-control-de-orden", "ventana-sin-separadores"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const RAIZ = join(QA, "../..");
const LISTADOS = join(RAIZ, SABOTAJE === "sin-corpus" ? "corpus/no-existe" : "corpus/fase-3/listados");
const SITEMAPS = join(RAIZ, "corpus/fase-3/_sitemaps");
const CORPUS = join(RAIZ, "corpus");

if (!existsSync(LISTADOS))
  throw new Error(
    `CORPUS DE LISTADOS AUSENTE: no existe '${LISTADOS}'.\n` +
      `  Los cinco huecos salen de él. Sin corpus la sonda mediría CERO huecos,\n` +
      `  que se lee como «las specs están completas» en vez de como «no miré»\n` +
      `  (§sondas 4bis).`,
  );

const sinSS = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");

/** Las páginas de una serie, en orden (índice primero, luego `page/N`). */
function serie(dir) {
  const base = join(LISTADOS, dir);
  if (!existsSync(base)) return [];
  const out = [{ n: 1, f: join(base, "index.html") }];
  const pg = join(base, "page");
  if (existsSync(pg)) for (const d of readdirSync(pg)) out.push({ n: Number(d), f: join(pg, d, "index.html") });
  return out.sort((a, b) => a.n - b.n).filter((p) => existsSync(p.f));
}

const informe = { meta: {}, huecos: {} };
const ev = new Evaluadas({ nombre: "lh-huecos", unidad: "huecos derivados", minimo: 5 });

/* ══════════════════════════════════════════════════════════════════════════
 * HUECO 1 · la BARRA de `L2` — `lh-barra` dijo «0 de 12» y la hay
 *
 * No es que `lh-barra` midiera mal: midió **la partición de columnas de Divi**
 * (`3_4 + 1_4` con `et_pb_widget_area`), que es la que `L1` usa, y `L2` no
 * tiene cuerpo Divi ninguno. Su barra la pone **la plantilla del tema**:
 * `et_right_sidebar` en el `<body>` y un `#sidebar` hermano de `#left-area`.
 * Leer aquel «0» como «`L2` no tiene barra» es §el alcance al leer la medida.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const filas = [];
  for (const dir of ["glosario", "preguntas-frecuentes"]) {
    for (const { n, f } of serie(dir)) {
      const crudo = readFileSync(f, "utf8");
      const h = sinSS(crudo);
      const body = (crudo.match(/<body[^>]*class="([^"]*)"/) || [, ""])[1];
      const iSb = h.indexOf('id="sidebar"');
      const widgets = iSb < 0 ? [] : [...h.slice(iSb, iSb + 4000).matchAll(/class="et_pb_widget ([^"]*)"/g)].map((m) => m[1]);
      const titulos = iSb < 0 ? [] : [...h.slice(iSb, iSb + 4000).matchAll(/<h4 class="widgettitle">([^<]*)<\/h4>/g)].map((m) => m[1]);
      /**
       * ⚠ **El CUERPO, no el documento — y la primera versión buscó en el
       * documento entero y dio un PLENO.** `et_pb_column_3_4` casaba en **12 de
       * 12** porque la CABECERA del theme builder la usa, así que el número
       * decía *«L2 sí tiene la partición Divi»* y era falso del cuerpo. Es
       * §*un patrón que casa en TODAS tampoco mide nada*, y la misma trampa que
       * la firma `sb` de `lh-serie` (casaba `et_pb_widget_area` en el PIE) y que
       * `c-cascaron` con `#main-header`.
       *
       * El cuerpo empieza en `#main-content` y acaba donde arranca el pie; se
       * recorta ahí antes de preguntar.
       */
      const iMain = h.indexOf('id="main-content"');
      const iPie = h.indexOf("et_pb_section_0_tb_footer");
      const cuerpo = iMain < 0 ? "" : h.slice(iMain, iPie > iMain ? iPie : undefined);
      filas.push({
        ruta: `/${dir}${n > 1 ? `/page/${n}` : ""}`,
        etRightSidebar: /\bet_right_sidebar\b/.test(body),
        sidebar: iSb >= 0,
        widgets: widgets.slice(0, 4),
        titulos: titulos.slice(0, 4),
        /* la partición Divi que `lh-barra` sí buscaba — EN EL CUERPO */
        columna3_4: /et_pb_column_3_4/.test(cuerpo),
        /* y el otro lado del pleno: en el DOCUMENTO entero sí aparece */
        columna3_4EnElDocumento: /et_pb_column_3_4/.test(h),
      });
    }
  }
  const con = filas.filter((f) => f.sidebar).length;
  const firmas = new Set(filas.map((f) => f.widgets.join("|")));
  informe.huecos.barraDeTema = {
    pregunta: "¿`L2` sirve barra lateral? — `lh-barra.json` dice conBarra 0 de 12",
    canalDeLaMedidaVieja: "la partición de columnas de Divi (`et_pb_column_3_4` + `et_pb_widget_area`)",
    canalQueLoContesta: "`<body class=… et_right_sidebar>` + `#sidebar` hermano de `#left-area`",
    documentos: filas.length,
    conSidebar: con,
    conColumnaDivi3_4EnElCuerpo: filas.filter((f) => f.columna3_4).length,
    conColumnaDivi3_4EnElDocumento: filas.filter((f) => f.columna3_4EnElDocumento).length,
    firmasDeWidgets: firmas.size,
    widgets: filas[0]?.widgets ?? [],
    titulos: filas[0]?.titulos ?? [],
    veredicto:
      con === filas.length && firmas.size === 1
        ? "SÍ hay barra, la misma en las 12 (varianza 0 ⇒ plantilla de la familia). Las DOS medidas son ciertas y contestan preguntas distintas."
        : "heterogénea — mirar antes de construir",
  };
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * HUECO 2 · los 58 px de `.container`
 *
 * La spec da `ancla y` y `cabecera h` y no nombra la diferencia. Es el
 * `padding-top` del `.container` del tema, y **el mismo número a los dos
 * anchos** — o sea px absolutos que no se mueven con el ancho.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const porAncho = {};
  for (const ancho of [1440, 390]) {
    const f = join(QA, `medidas/lh-spec-${ancho}.json`);
    if (!existsSync(f)) continue;
    const esp = JSON.parse(readFileSync(f, "utf8")).paginas;
    const filas = [];
    for (const [clave, p] of Object.entries(esp)) {
      if (!clave.startsWith("L2-")) continue;
      const ancla = p.listado?.tarjetas?.[0]?.rect?.y;
      const cab = p.cabecera?.rect?.h;
      const cont = p.contenedorTema?.rect?.y;
      if (ancla == null || cab == null) continue;
      filas.push({ forma: clave.split("::")[0], ancla, cabecera: cab, contenedorTema: cont, banda: +(ancla - cab).toFixed(2) });
    }
    porAncho[ancho] = filas;
  }
  const bandas = new Set(Object.values(porAncho).flat().map((f) => f.banda));
  informe.huecos.bandaDelContenedor = {
    pregunta: "¿qué hay entre el contenedor del tema y la primera tarjeta de `L2`?",
    porAncho,
    valoresDistintos: [...bandas],
    veredicto:
      bandas.size === 1
        ? `${[...bandas][0]} px, IGUALES a 1440 y a 390 — px absolutos: la spec los tiene en sus dos números y no los nombra`
        : "varía con el ancho — mirar antes de cablear",
  };
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * HUECO 3 · la VENTANA de la piel B, y sus INSTANCIAS SEPARADORAS
 *
 * §DOS MODELOS QUE PREDICEN LO MISMO EN TODO TU DOMINIO SON UNO SOLO: lo que
 * decide no es el acierto, es cuántas instancias **separan** los dos
 * candidatos. Con `total ≤ 5` *«todas las siguientes»* y *«ventana de 5»*
 * producen el MISMO HTML, y las dos instancias que calibraron la piel tenían
 * `total = 4`.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const inst = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) {
        const h = sinSS(readFileSync(p, "utf8"));
        const m = h.match(/<div class='wp-pagenavi' role='navigation'>([\s\S]*?)<\/div>/);
        if (!m) return;
        const pg = m[1].match(/<span class='pages'>Page (\d+) of (\d+)<\/span>/);
        if (!pg) return;
        const n = Number(pg[1]), total = Number(pg[2]);
        const nums = [...m[1].matchAll(/class="page (?:smaller|larger)"[^>]*>(\d+)</g)].map((x) => Number(x[1]));
        /**
         * La SECUENCIA de piezas, en orden. Los números solos no bastan: el
         * componente viejo emitía `current` y luego `n+1..total` —o sea **cero
         * `page smaller`**— y comparar sólo el conjunto de números lo daría por
         * bueno en la página 1, que es justo donde el comparador mira.
         */
        const piezas = [];
        for (const q of m[1].matchAll(/<(span|a)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
          const cls = (q[2].match(/class=["']([^"']*)["']/) || [, ""])[1];
          if (cls === "pages") continue;
          const txt = q[3].replace(/<[^>]+>/g, "").replace(/&raquo;/g, "»").replace(/&laquo;/g, "«").trim();
          piezas.push(`${cls}:${txt}`);
        }
        inst.push({
          ruta: p.slice(LISTADOS.length + 1).split("\\").join("/").replace(/\/index\.html$/, ""),
          n, total,
          numeros: [...nums, n].sort((a, b) => a - b),
          piezas,
          first: /class="first"/.test(m[1]),
          extend: (m[1].match(/class='extend'/g) || []).length,
          last: /class="last"/.test(m[1]),
          largerPage: /class="larger page"/.test(m[1]),
        });
      }
    }
  };
  walk(LISTADOS);

  /** El modelo NUEVO: ventana de 5 centrada. */
  const ventana = (n, total) => {
    const inicio = Math.max(1, Math.min(Math.max(n - 2, 1), total - 4));
    return { inicio, fin: Math.min(total, inicio + 4) };
  };
  /** El modelo VIEJO: todas de 1 a total (lo que la piel B emitía). */
  const todas = (n, total) => ({ inicio: 1, fin: total });

  /**
   * La SECUENCIA que emite el componente, reproducida aquí desde el MISMO
   * modelo. Es lo que convierte esto en una verificación y no en un recuento:
   * §*una sonda que compara conjuntos no ve el orden ni las piezas que faltan*.
   */
  const secuenciaNueva = (n, total) => {
    const { inicio, fin } = ventana(n, total);
    const out = [];
    if (inicio > 1) out.push("first:« First");
    if (n > 1) out.push("previouspostslink:«");
    if (inicio > 1) out.push("extend:...");
    for (let k = inicio; k <= fin; k++) out.push(k === n ? `current:${k}` : `page ${k < n ? "smaller" : "larger"}:${k}`);
    if (fin < total) out.push("extend:...");
    if (n < total) out.push("nextpostslink:»");
    if (fin < total) out.push("last:Last »");
    return out;
  };
  /** La secuencia que emitía el componente VIEJO: current y luego n+1..total. */
  const secuenciaVieja = (n, total) => {
    const out = [];
    if (n > 1) out.push("previouspostslink:«");
    out.push(`current:${n}`);
    for (let k = n + 1; k <= total; k++) out.push(`page larger:${k}`);
    if (n < total) out.push("nextpostslink:»");
    return out;
  };

  let aciertaNuevo = 0, aciertaViejo = 0, separadoras = 0;
  let secNueva = 0, secVieja = 0;
  const fallos = [], fallosSec = [];
  /**
   * ⚠ **Las instancias donde el modelo VIEJO acertaba, CON SU RUTA.** El
   * recuento `secuenciaViejaAcierta: 7` es un cardinal, y §UN CARDINAL ES UN
   * CONTENEDOR Y ABSORBE LA MEMBRESÍA: dice *cuántas* acertaban, no *cuáles* —
   * y la pregunta que decide el alcance del comparador es exactamente cuáles.
   * Sin esta lista, cruzar «las que el viejo acertaba» con «las que `lh-cmp`
   * mira» exigiría re-implementar el modelo del paginador en otra sonda, que es
   * la clase C7 con su peor salida: dos verdes midiendo cosas distintas.
   */
  const viejoAciertaEn = [];
  for (const i of inst) {
    const v = ventana(i.n, i.total), t = todas(i.n, i.total);
    const esperadoV = Array.from({ length: v.fin - v.inicio + 1 }, (_, k) => v.inicio + k);
    const esperadoT = Array.from({ length: t.fin - t.inicio + 1 }, (_, k) => t.inicio + k);
    const casaV = JSON.stringify(esperadoV) === JSON.stringify(i.numeros);
    const casaT = JSON.stringify(esperadoT) === JSON.stringify(i.numeros);
    if (casaV) aciertaNuevo++; else fallos.push(`${i.ruta} (n=${i.n}/${i.total})`);
    if (casaT) aciertaViejo++;
    /* SEPARADORA: los dos modelos predicen cosas distintas. Sin ninguna, la
       elección no está hecha — está escrita al azar. */
    if (JSON.stringify(esperadoV) !== JSON.stringify(esperadoT)) separadoras++;

    /* Y la comprobación que de verdad adjudica: la SECUENCIA entera. */
    const sinLarger = i.piezas.filter((p) => !p.startsWith("larger page:"));
    if (JSON.stringify(secuenciaNueva(i.n, i.total)) === JSON.stringify(sinLarger)) secNueva++;
    else if (!i.largerPage) fallosSec.push(`${i.ruta} (n=${i.n}/${i.total}): ${sinLarger.join(" | ")}`);
    if (JSON.stringify(secuenciaVieja(i.n, i.total)) === JSON.stringify(sinLarger)) {
      secVieja++;
      viejoAciertaEn.push({ ruta: i.ruta, n: i.n, total: i.total, esPagina1: i.n === 1 });
    }
  }
  if (SABOTAJE === "ventana-sin-separadores") separadoras = 0;

  informe.huecos.ventanaPielB = {
    pregunta: "¿qué números pinta la piel B? — el componente emitía TODAS de n+1 a total",
    instancias: inst.length,
    totalesDistintos: [...new Set(inst.map((i) => i.total))].sort((a, b) => a - b),
    separadoras,
    aciertaVentana5: aciertaNuevo,
    aciertaTodas: aciertaViejo,
    /* la unidad que adjudica: la SECUENCIA entera, no el conjunto de números */
    secuenciaNuevaAcierta: secNueva,
    secuenciaViejaAcierta: secVieja,
    /* CUÁLES, no cuántas — ver el comentario de `viejoAciertaEn`. Es lo que
     * permite que `lh-alcance` cruce el defecto con el alcance del comparador
     * sin re-implementar el modelo del paginador. */
    viejoAciertaEn,
    viejoAciertaSoloEnPagina1: viejoAciertaEn.every((i) => i.esPagina1),
    /* Todas las instancias, para que el cruce se haga por RUTA y no por cardinal. */
    instancias_: inst.map((i) => ({ ruta: i.ruta, n: i.n, total: i.total })),
    instanciasConLargerPageExcluidasDeLaSecuencia: inst.filter((i) => i.largerPage).length,
    fallosDeSecuencia: fallosSec,
    conFirst: inst.filter((i) => i.first).length,
    conLast: inst.filter((i) => i.last).length,
    conLargerPage: inst.filter((i) => i.largerPage).length,
    seriesConLargerPage: [...new Set(inst.filter((i) => i.largerPage).map((i) => i.ruta.replace(/\/page\/\d+$/, "")))],
    fallosDeLaVentana: fallos,
  };
  if (separadoras === 0)
    console.log(
      "\n  ⚠ CERO instancias SEPARADORAS: los dos modelos predicen lo mismo en todo el\n" +
        "    dominio, así que este hueco NO está decidido — está escrito al azar.",
    );
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * HUECO 4 · el ORDEN de `L2` — y su CONTROL
 *
 * §sondas 8(a): *un negativo sin control no es un negativo*. Para poder decir
 * «el `lastmod` del sitemap NO ordena `/preguntas-frecuentes`» hace falta
 * enseñar que tampoco ordena `/glosario`, **donde el orden verdadero se
 * conoce**. Sin el control, «no casa» sería indistinguible de «mi lectura del
 * sitemap está mal».
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const ordenDe = (dir, re) => {
    const out = [];
    for (const { f } of serie(dir)) for (const m of readFileSync(f, "utf8").matchAll(re)) out.push(m[1]);
    return out;
  };
  const lastmodDe = (fichero, prefijo) => {
    const p = join(SITEMAPS, fichero);
    const m = new Map();
    if (!existsSync(p)) return m;
    for (const u of readFileSync(p, "utf8").matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = (u[1].match(/<loc>([^<]*)<\/loc>/) || [, ""])[1];
      const lm = (u[1].match(/<lastmod>([^<]*)<\/lastmod>/) || [, null])[1];
      if (loc.startsWith(prefijo)) m.set(loc.slice(prefijo.length).replace(/\/$/, ""), lm);
    }
    return m;
  };
  const publicadoDe = (col, slug) => {
    const f = join(CORPUS, col, `${slug}.html`);
    if (!existsSync(f)) return null;
    const h = readFileSync(f, "utf8");
    return (h.match(/"datePublished"\s*:\s*"([^"]+)"/) || [, null])[1];
  };

  const formas = [
    { forma: "L2-glosario", dir: "glosario", col: "terminos-kunakpedia", papel: "CONTROL", re: /<h2 class="entry-title"><a href="https:\/\/kunakair\.com\/es\/([^"/]*?)\/">/g, sm: "glossary-sitemap.xml", prefijo: "https://kunakair.com/es/" },
    { forma: "L2-faqs", dir: "preguntas-frecuentes", col: "faqs", papel: "el que se quiere contestar", re: /<h2 class="entry-title"><a href="https:\/\/kunakair\.com\/es\/faqs\/([^"]*?)\/">/g, sm: "faqs-sitemap.xml", prefijo: "https://kunakair.com/es/faqs/" },
  ];
  const salida = [];
  for (const F of formas) {
    const orden = ordenDe(F.dir, F.re);
    const pub = orden.map((s) => publicadoDe(F.col, s));
    const lm = lastmodDe(F.sm, F.prefijo);
    const conLm = orden.filter((s) => lm.has(s));
    const porLm = [...conLm].sort((a, b) => String(lm.get(b)).localeCompare(String(lm.get(a))));
    const conPub = pub.filter(Boolean);
    salida.push({
      forma: F.forma,
      papel: F.papel,
      tarjetas: orden.length,
      /* canal 1: el `<span class="fecha-publicacion">` que usa `entradas-blog` */
      conSpanFechaRenderizado: orden.filter((s) => {
        const f = join(CORPUS, F.col, `${s}.html`);
        return existsSync(f) && /<span class="fecha-publicacion">/.test(readFileSync(f, "utf8"));
      }).length,
      /* canal 2: JSON-LD `datePublished` */
      conDatePublished: conPub.length,
      datePublishedOrdenaDesc:
        conPub.length === orden.length && conPub.length > 1
          ? conPub.every((v, i) => i === 0 || conPub[i - 1] >= v)
          : null,
      /* canal 3: el `lastmod` del sitemap */
      conLastmod: conLm.length,
      lastmodOrdenaDesc: conLm.length > 1 ? conLm.every((s, i) => porLm[i] === s) : null,
    });
  }
  const control = salida.find((s) => s.papel === "CONTROL");
  const controlSirve = SABOTAJE === "sin-control-de-orden" ? false : control && control.datePublishedOrdenaDesc === true;
  informe.huecos.ordenDeL2 = {
    pregunta: "¿qué ordena el archivo de CPT? — ninguna de las specs lo trata",
    canalesMirados: [
      '<span class="fecha-publicacion"> (el que usa `entradas-blog`)',
      "JSON-LD `datePublished`",
      "sitemap `<lastmod>`",
    ],
    porForma: salida,
    control: controlSirve
      ? "`/glosario`: `datePublished` DESC reproduce el orden servido, así que el canal se sabe LEER"
      : "SIN CONTROL — no se puede afirmar nada sobre el otro",
    veredicto: controlSirve
      ? "`/glosario` ordena por `datePublished` DESC. `/preguntas-frecuentes` NO tiene ese canal, y `lastmod` NO ordena ni siquiera en el control ⇒ su orden NO es derivable de lo servido."
      : "NO SE PUEDE AFIRMAR: el control no pasa",
  };
  if (!controlSirve)
    console.log("\n  ⚠ El CONTROL del orden no pasa: cualquier «no casa» del otro lado es indistinguible\n    de una lectura mal hecha del canal (§sondas 8a).");
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * HUECO 5 · la BANDA DE FILTROS de `L3` y `L5`
 *
 * Ninguna de las dos specs la nombra, y las dos tienen su geometría dentro
 * (la `y` del listado que congelaron ya la incluye). Omitirla al construir
 * subiría el listado ~160 px en `L3` y ~265 en `L5` — o sea que **el número
 * está en la medida y el elemento no está en la prosa**.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const filas = [];
  for (const [forma, ruta, sel] of [
    ["L3-sci", "scientific-category/articulos-cientificos-y-estudios", /<div class="scientific-filter">([\s\S]*?)<div class="scientific-list-content">/],
    ["L3-sci", "scientific-category/articulos-tecnicos", /<div class="scientific-filter">([\s\S]*?)<div class="scientific-list-content">/],
    ["L5-casos", "casos-de-exito", /<div class="case-filter">([\s\S]*?)<div class="case-list-content">/],
  ]) {
    const f = join(LISTADOS, ruta, "index.html");
    if (!existsSync(f)) continue;
    const h = sinSS(readFileSync(f, "utf8"));
    const m = h.match(sel);
    const bloque = m ? m[1] : "";
    filas.push({
      forma,
      ruta: `/${ruta}`,
      presente: Boolean(m),
      /* ⚠ Sólo los CONTROLES: `class="button-group"` es el envoltorio y contarlo
         daba 4 donde hay 3 y 13 donde hay 12 — un patrón que casa de más
         (§sondas 4, la 3.ª cara: el sobre-casado se lee como un dato). */
      botones: (bloque.match(/<(?:a|button)[^>]*class="button(?:\s[^"]*)?"/g) || []).length,
      etiqueta: bloque.includes("<button") ? "button" : bloque.includes("<a ") ? "a" : "—",
      titulo: (bloque.match(/<h2 class="case-filter-title">([^<]*)<\/h2>/) || [, null])[1],
      enLaSpec: false,
    });
  }
  /* La `y` que la spec congeló ya incluye la banda: se enseña la diferencia. */
  const esp = existsSync(join(QA, "medidas/lh-spec-1440.json"))
    ? JSON.parse(readFileSync(join(QA, "medidas/lh-spec-1440.json"), "utf8")).paginas
    : {};
  const hueco = (clave) => {
    const p = esp[clave];
    if (!p) return null;
    const h1 = p.baseEnCrudo?.rect;
    const lst = p.listado?.contenedor?.rect?.y;
    if (!h1 || lst == null) return null;
    return +(lst - (h1.y + h1.h)).toFixed(2);
  };
  informe.huecos.bandaDeFiltros = {
    pregunta: "¿qué hay entre el `h1` y el listado en `L3` y `L5`? — ninguna spec lo nombra",
    filas,
    pxEntreH1YListado: {
      "L3-sci::/es/scientific-category/articulos-cientificos-y-estudios/": hueco("L3-sci::/es/scientific-category/articulos-cientificos-y-estudios/"),
      "L5-casos::/es/casos-de-exito/": hueco("L5-casos::/es/casos-de-exito/"),
    },
    veredicto:
      filas.every((f) => f.presente) && filas.length === 3
        ? "las TRES sirven banda de filtros. Está en la geometría congelada y no en la prosa: construir sin ella sube el listado."
        : "no encontrada en alguna instancia — mirar",
  };
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
informe.meta = {
  fecha: hoy(),
  que: "los huecos que las specs de L2·L3·L5 no contestan y que DECIDEN la construcción",
  fuente: "corpus/fase-3/listados (149 documentos congelados de F3-0) + corpus/fase-3/_sitemaps + medidas/lh-spec-{1440,390}.json",
  porQue:
    "§UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA: una medida no lleva escrito qué NO contesta, " +
    "así que el alcance se escribe a mano ANTES de construir. Es lo que costó `L1-resources`.",
  sabotaje: SABOTAJE,
  noMide: [
    "el CLON: las 6 formas de L2·L3·L5 no están emitidas, así que esto es de UN lado",
    "píxeles nuevos: la geometría la pone lh-spec contra el original vivo; aquí sólo se cruza con ella",
    "si los huecos son TODOS los que hay — es una lista de los encontrados al escribir el alcance, no un censo cerrado",
    "el mecanismo de `larger page` de la piel B: lo ejercita UNA serie y no se deriva de n=1",
  ],
};

console.log(`\n════════ LISTADOS · LO QUE LAS SPECS NO CONTESTAN ════════`);
console.log(`  corpus  ${LISTADOS.slice(RAIZ.length + 1)}`);
console.log(`  ⚠ esto NO es una comparación: es el ALCANCE de las medidas sobre las que se iba a construir.\n`);
for (const [k, v] of Object.entries(informe.huecos)) {
  console.log(`  ── ${k}`);
  console.log(`     ${v.pregunta}`);
  console.log(`     ⇒ ${v.veredicto ?? JSON.stringify(v).slice(0, 120)}`);
}

const b = informe.huecos.barraDeTema;
const c = informe.huecos.bandaDelContenedor;
const p = informe.huecos.ventanaPielB;
const o = informe.huecos.ordenDeL2;
const fl = informe.huecos.bandaDeFiltros;
console.log(`\n  ── los números ──`);
console.log(
  `   barra de tema        ${b.conSidebar}/${b.documentos} con \`#sidebar\` · ` +
    `${b.conColumnaDivi3_4EnElCuerpo}/${b.documentos} con la columna Divi que \`lh-barra\` buscaba EN EL CUERPO ` +
    `(${b.conColumnaDivi3_4EnElDocumento}/${b.documentos} si se mira el documento entero — el pleno que engaña)`,
);
console.log(`   banda del contenedor ${c.valoresDistintos.join(" · ")} px · ${c.valoresDistintos.length === 1 ? "IGUAL a los dos anchos" : "varía"}`);
console.log(`   ventana de la piel B ${p.instancias} instancias · totales ${p.totalesDistintos.join("·")} · SEPARADORAS ${p.separadoras}`);
console.log(`                        números:   ventana-5 ${p.aciertaVentana5}/${p.instancias} · el modelo viejo ${p.aciertaTodas}/${p.instancias}`);
console.log(
  `                        SECUENCIA: el componente NUEVO ${p.secuenciaNuevaAcierta}/${p.instancias - p.instanciasConLargerPageExcluidasDeLaSecuencia} · ` +
    `el VIEJO ${p.secuenciaViejaAcierta}/${p.instancias - p.instanciasConLargerPageExcluidasDeLaSecuencia} ` +
    `(fuera las ${p.instanciasConLargerPageExcluidasDeLaSecuencia} con \`larger page\`, que no se implementa)`,
);
console.log(`   orden de L2          ${o.porForma.map((f) => `${f.forma}: datePublished ${f.conDatePublished}/${f.tarjetas}`).join(" · ")}`);
console.log(`   banda de filtros     ${fl.filas.map((f) => `${f.ruta.split("/").pop()}: ${f.botones}`).join(" · ")} botones`);

w("medidas/lh-huecos.json", informe);

/* ── El veredicto: los cinco huecos tienen que quedar DERIVADOS ─────────── */
const rojos = [];
if (b.conSidebar !== b.documentos) rojos.push("la barra de L2 no es uniforme");
if (c.valoresDistintos.length !== 1) rojos.push("la banda del contenedor no es un solo número");
if (p.separadoras === 0) rojos.push("la ventana de la piel B no tiene instancias SEPARADORAS: el modelo no está elegido");
if (p.aciertaVentana5 !== p.instancias) rojos.push(`la ventana de 5 falla en ${p.instancias - p.aciertaVentana5} instancia(s)`);
if (!o.control.startsWith("`/glosario`")) rojos.push("el control del orden no pasa");
if (!fl.filas.every((f) => f.presente)) rojos.push("la banda de filtros no aparece en alguna instancia");

console.log(
  rojos.length === 0
    ? `\n✅ los 5 huecos DERIVADOS, cada uno con su canal y su denominador.\n` +
        `   Ninguno estaba en su spec, y los cinco deciden la construcción.\n`
    : `\n❌ ${rojos.length} hueco(s) sin derivar:\n${rojos.map((r) => `     · ${r}`).join("\n")}\n`,
);
process.exit(rojos.length === 0 ? 0 : 1);
