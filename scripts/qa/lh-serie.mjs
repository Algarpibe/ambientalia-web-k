/**
 * ¿ES UNA SERIE `/page/N/` UNA SOLA UNIDAD? — la pregunta que decide el
 * denominador de F3-2, contestada sobre la POBLACIÓN ENTERA y no sobre una
 * muestra.
 *
 * Uso:  npm run qa:lh-serie
 *       SABOTAJE=patron-falso|una-por-serie   → test en negativo
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTA SONDA EXISTE, Y POR QUÉ AHORA
 *
 * F3-2 va a emitir **~142 rutas**: 35 listados + **107 `/page/N/`**. La
 * tentación evidente al declarar cobertura es *«con una página de cada serie
 * basta: son la misma plantilla»*. Y ese enunciado tiene nombre en este repo:
 *
 *   > **«Una por familia» es EXACTAMENTE la frase que dejó MONOGRÁFICO a cero**
 *   > (§LH-C6-FAMILIA-NO-ES-FAMILIA). Un contenedor que mapea a varias unidades
 *   > reportadas, con «la primera de cada uno» actuando de **filtro
 *   > silencioso**. Costó el −36.02 del `h1`, invisible en las 4 instancias que
 *   > sí se miraron.
 *
 * Así que la homogeneidad **no se supone: se mide**. Y aquí se puede medir
 * entera, sin muestreo y sin red, porque **la captura de F3-0 ya trae las 149
 * páginas** —cada índice y **cada** `/page/N/`—. Muestrear teniendo la población
 * delante sería elegir el riesgo gratis.
 *
 * ── PRE-REGISTRO (escrito ANTES de correrla, §sondas 8b) ──────────────────
 *
 * Predicción: **las series NO son homogéneas**, y de una forma concreta —
 *
 *   H1 · la página 1 no tiene enlace «anterior» y la última no tiene
 *        «siguiente» ⇒ al menos 2 formas en cualquier serie de ≥2;
 *   H2 · la última página trae **menos tarjetas** (el resto de la división);
 *   H3 · las intermedias son todas iguales entre sí salvo por qué números
 *        imprime la ventana de `paginate_links`.
 *
 * Si sale H1+H2+H3, la unidad **no es la serie**: es la POSICIÓN dentro de la
 * serie, y el muestreo legítimo es *«una de cada forma medida»*, con el censo
 * detrás. Si saliera homogéneo de verdad, quedaría probado y **entonces** una
 * por serie sería defendible — con su fichero.
 *
 * ── LO QUE NO CONTESTA ────────────────────────────────────────────────────
 *
 * Esto es **estructura del HTML servido**, no píxeles. Dos páginas con la misma
 * firma pueden diferir en alto si su contenido envuelve distinto — por eso la
 * salida declara `firma` y no «idénticas». Lo que la firma decide es **cuántas
 * clases hay que comparar contra el original**, no si cada una cuadra.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, env, gritaSiRevienta, hoy, w } from "./lib.mjs";

/** `QA` es `scripts/qa/`; el corpus cuelga de la RAÍZ del repo, dos arriba. */
const RAIZ = join(QA, "../../corpus/fase-3/listados");

const SABOTAJE = env("SABOTAJE", "");
const SABOTAJES = ["patron-falso", "una-por-serie"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) {
  console.error(`\n❌ SABOTAJE=${SABOTAJE} no existe. Los que hay: ${SABOTAJES.join(" · ")}`);
  process.exit(2);
}
const SAB = Object.fromEntries(SABOTAJES.map((s) => [s, SABOTAJE === s]));
gritaSiRevienta();

/** El marcado SIN `<style>` ni `<script>` (§sondas 4: ahí viven los selectores disfrazados de marcado). */
const marcadoDe = (html) =>
  html.replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<script\b[\s\S]*?<\/script>/gi, "");

/* ── Las tres pieles de paginación, censadas en F3-0 y alineadas 1:1 con las
 * tres variantes de tarjeta (`BEHAVIORS.md` §1b). Con el sabotaje, una que no
 * existe: tiene que salir por patrón MUERTO y no por «no hay paginador». */
const PIELES = SAB["patron-falso"]
  ? [{ id: "X", re: /class="no-existe-esta-piel"/ }]
  : [
      { id: "A", re: /<div[^>]*class="wp-pagenavi"[^>]*role="pagination"/ },
      { id: "B", re: /<div[^>]*class="wp-pagenavi"[^>]*role="navigation"/ },
      { id: "C", re: /<nav[^>]*class="[^"]*kunak-pagination/ },
    ];

/** Firma ESTRUCTURAL de un documento de listado. Nada de contenido. */
function firma(html) {
  const m = marcadoDe(html);
  const arts = [...m.matchAll(/<article\b[^>]*class="([^"]*)"/g)].map((x) => x[1]);
  const tarjetas = arts.filter((c) => !/\btype-page\b/.test(c)).length;
  const piel = PIELES.find((p) => p.re.test(m))?.id ?? "ninguna";
  /* La ventana de `paginate_links` — los números que ESTA página imprime. */
  const numeros = [...m.matchAll(/\/page\/(\d+)\/"[^>]*>\s*(?:<[^>]*>)*\s*(\d+)/g)].map((x) => Number(x[1]));
  /* ⚠ Dos fuentes del TOTAL que no tienen por qué coincidir, y no coinciden:
   *   · la VENTANA de `paginate_links` — el mayor número que la página enlaza;
   *   · el `<title>` de Yoast — «… - Página N de M -», que sale de
   *     `max_num_pages` de la consulta.
   * Se leen las dos por separado a propósito: donde discrepan está el hallazgo,
   * y fundirlas en «el total» lo taparía. */
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const pag = /P[áa]gina\s+(\d+)\s+de\s+(\d+)/i.exec(t);
  return {
    tarjetas,
    vacia: tarjetas === 0,
    ventanaMax: numeros.length ? Math.max(...numeros) : null,
    tituloN: pag ? Number(pag[1]) : null,
    tituloTotal: pag ? Number(pag[2]) : null,
    piel,
    prev: /class="[^"]*\bprev(?:iouspostslink)?\b/.test(m) || /class="[^"]*prev page-numbers/.test(m),
    next: /class="[^"]*\bnext(?:postslink)?\b/.test(m) || /class="[^"]*next page-numbers/.test(m),
    dots: /page-numbers dots|extend/.test(m),
    /* La piel B imprime «Page 1 of 4» en el propio HTML — fuente del total sin
     * una petición por página (`BEHAVIORS.md` §1b). */
    spanPages: (m.match(/<span class="pages">([^<]*)<\/span>/) || [])[1]?.replace(/\s+/g, " ").trim() || null,
    ventana: [...new Set(numeros)].sort((a, b) => a - b).length,
    secciones: (m.match(/class="[^"]*et_pb_section/g) || []).length,
    sidebar: /id="sidebar"|et_pb_widget_area|widget_search/.test(m),
  };
}

/** Lo que hace COMPARABLES dos páginas: la firma menos lo que depende del número de página. */
const clase = (f) => `t${f.tarjetas}·${f.piel}·${f.prev ? "P" : "-"}${f.next ? "N" : "-"}·s${f.secciones}${f.sidebar ? "·sb" : ""}`;
/** Y la POSICIÓN, que es la hipótesis alternativa a «la serie es una unidad». */
const posicion = (n, total) => (n === 1 ? "primera" : n === total ? "última" : "intermedia");

/* ══════════════════════════════════════════════════════════════════════════
 * EL UNIVERSO — se recorre el árbol capturado, no una lista escrita
 * ═════════════════════════════════════════════════════════════════════════ */
const series = [];
(function rec(dir, ruta) {
  const ent = readdirSync(dir, { withFileTypes: true });
  const idx = join(dir, "index.html");
  let tieneIdx = false;
  try { tieneIdx = statSync(idx).isFile(); } catch { /* no hay */ }
  if (tieneIdx) {
    const paginas = [{ n: 1, fichero: idx }];
    const pdir = join(dir, "page");
    let ns = [];
    try { ns = readdirSync(pdir).filter((x) => /^\d+$/.test(x)).map(Number).sort((a, b) => a - b); } catch { /* sin page/ */ }
    for (const n of ns) {
      const f = join(pdir, String(n), "index.html");
      try { if (statSync(f).isFile()) paginas.push({ n, fichero: f }); } catch { /* nada */ }
    }
    series.push({ ruta: ruta || "/", paginas });
  }
  for (const e of ent) if (e.isDirectory() && e.name !== "page") rec(join(dir, e.name), `${ruta}/${e.name}`);
})(RAIZ, "");

if (!series.length) {
  console.error(`\n❌ el universo salió VACÍO en ${RAIZ}. Cero series medidas darían un verde\n   sin haber mirado: por eso esto tira.`);
  process.exit(2);
}

/* El sabotaje `una-por-serie` reproduce EL ATAJO: mirar sólo la primera página
 * de cada serie. Tiene que salir por su propio invariante —«no se puede
 * establecer homogeneidad con n=1»— y NO por patrón muerto. */
const universo = SAB["una-por-serie"]
  ? series.map((s) => ({ ...s, paginas: s.paginas.slice(0, 1) }))
  : series;

const nDocs = universo.reduce((a, s) => a + s.paginas.length, 0);
const ev = new Evaluadas({ nombre: "lh-serie", unidad: "documentos de listado con su firma leída", minimo: nDocs });

/* ══════════════════════════════════════════════════════════════════════════
 * MEDIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿basta UNA página por serie /page/N/, o cada una es su propia unidad?",
    fuente: "corpus/fase-3/listados — captura congelada de F3-0, población COMPLETA (sin red, sin muestreo)",
    preRegistro: {
      H1: "la 1.ª no tiene «anterior» y la última no tiene «siguiente» ⇒ ≥2 formas por serie",
      H2: "la última trae MENOS tarjetas (el resto de la división)",
      H3: "las intermedias son iguales entre sí salvo la ventana de números",
    },
    sabotaje: SABOTAJE || null,
    noMide: [
      "píxeles: dos páginas con la misma firma pueden diferir de alto si el texto envuelve distinto",
      "el contenido: qué entradas salen en cada página es dato, no forma",
    ],
  },
  series: {},
};

let pielesMuertas = 0;
const clasesGlobal = {};
const porPosicion = {};

for (const S of universo) {
  const total = S.paginas.length;
  const filas = S.paginas.map(({ n, fichero }) => {
    const f = firma(readFileSync(fichero, "utf8"));
    ev.ok();
    const c = clase(f);
    clasesGlobal[c] = (clasesGlobal[c] || 0) + 1;
    const pos = posicion(n, Math.max(...S.paginas.map((p) => p.n)));
    (porPosicion[pos] ||= {})[c] = (porPosicion[pos][c] || 0) + 1;
    return { n, pos, clase: c, ...f };
  });
  const clases = [...new Set(filas.map((r) => r.clase))];
  /* Qué campo concreto varía dentro de la serie: sin esto, «hay 3 clases» no
   * dice si el que cambia es el paginador (esperado) o el esqueleto (hallazgo). */
  const varia = {};
  for (const k of ["tarjetas", "piel", "prev", "next", "secciones", "sidebar", "ventana"]) {
    const vs = [...new Set(filas.map((r) => JSON.stringify(r[k])))];
    if (vs.length > 1) varia[k] = vs.slice(0, 6).map((v) => JSON.parse(v));
  }
  salida.series[S.ruta] = { nPaginas: total, nClases: clases.length, clases, varia, paginas: filas };
  if (filas.every((r) => r.piel === "ninguna")) pielesMuertas++;
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
const conVarias = Object.entries(salida.series).filter(([, v]) => v.nPaginas > 1);
const homogeneas = conVarias.filter(([, v]) => v.nClases === 1);
const heterogeneas = conVarias.filter(([, v]) => v.nClases > 1);

console.log(`\n════════ SERIES /page/N/ · ¿una unidad o varias? ════════`);
console.log(`  fuente: captura F3-0 · **población completa**, ${nDocs} documentos en ${universo.length} series\n`);
for (const [r, v] of Object.entries(salida.series)) {
  if (v.nPaginas === 1) continue;
  console.log(`  ── ${r.padEnd(52)} ${String(v.nPaginas).padStart(2)} págs · ${v.nClases} clase(s)`);
  console.log(`     varía: ${Object.keys(v.varia).length ? Object.entries(v.varia).map(([k, vs]) => `${k}=${JSON.stringify(vs)}`).join(" · ") : "NADA"}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ ANTES DE CONTAR VACÍAS: QUÉ SERIES PUEDEN ESTARLO
 *
 * La primera versión contó **65 documentos con 0 tarjetas** y llamó a eso
 * «páginas que existen y no listan nada». **Estaba mezclando dos ceros
 * distintos**, que es el defecto que este repo tiene escrito y que aquí me
 * cacé con el control en vivo, no leyendo el código:
 *
 *   · `/es/blog/page/9/` sirve 0 `<article>` **y su página 1 sirve 9** ⇒ la
 *     página existe y no lista nada. Hallazgo;
 *   · `/es/productos/` sirve 0 `<article>` **en la página 1 también** ⇒ esa
 *     forma NO USA `<article>` para sus tarjetas (es un hub de builder). Cero
 *     del selector, no del sitio.
 *
 * > **Un cero de «no hay entradas» y un cero de «aquí no se cuenta así» se
 * > escriben igual** (§sondas 4). Se separan mirando la página 1 de la serie:
 * > si ella tampoco tiene `<article>`, la pregunta no aplica a esa serie.
 * ═════════════════════════════════════════════════════════════════════════ */
const sirveArticles = (v) => (v.paginas.find((p) => p.n === 1)?.tarjetas ?? 0) > 0;

/* ── LAS PÁGINAS QUE EXISTEN Y NO LISTAN NADA ──────────────────────────────
 * Salió al mirar por qué una serie tenía `tarjetas=[9,7,0]`, y **no estaba en
 * el pre-registro**: hay páginas que responden 200, se declaran a sí mismas
 * canónicas y sirven **cero** entradas. El `<title>` de Yoast sigue diciendo
 * «Página 9 de 17» — o sea que WordPress cree que existen— mientras la ventana
 * de `paginate_links` de la página 1 dice que la última es la 8.
 *
 * Se cuenta aparte porque decide el DENOMINADOR de F3-2: «107 rutas /page/N/»
 * sale de contar 200s hasta el primer 404, y esa cuenta **incluye las vacías**. */
const vacias = [];
const conContenido = [];
const sinArticles = [];
for (const [r, v] of Object.entries(salida.series)) {
  if (!sirveArticles(v)) { sinArticles.push(r); continue; }
  for (const p of v.paginas) (p.vacia ? vacias : conContenido).push(`${r}${p.n > 1 ? `/page/${p.n}` : ""}`);
}
/* ⚠ El `<title>` de la página 1 **no lleva** «Página N de M» — Yoast sólo lo
 * escribe a partir de la 2. Leer el total de la página 1 daba `null` y el
 * desacuerdo salía **0 en las 28**: un cero que era del instrumento, no del
 * sitio (§sondas 4). El total se toma de CUALQUIER página que lo declare. */
const desacuerdo = Object.entries(salida.series)
  .map(([r, v]) => {
    const p1 = v.paginas.find((p) => p.n === 1);
    const totales = [...new Set(v.paginas.map((p) => p.tituloTotal).filter((x) => x !== null))];
    const ultimaConContenido = Math.max(0, ...v.paginas.filter((p) => !p.vacia).map((p) => p.n));
    return {
      ruta: r,
      ventanaMax: p1?.ventanaMax ?? null,
      tituloTotal: totales.length === 1 ? totales[0] : totales,
      ultimaConContenido,
      nCapturadas: v.nPaginas,
    };
  })
  .filter((x) => typeof x.tituloTotal === "number" && x.ventanaMax !== null && x.tituloTotal !== x.ventanaMax);

salida.resumen = {
  documentos: nDocs,
  series: universo.length,
  seriesConVariasPaginas: conVarias.length,
  homogeneas: homogeneas.length,
  heterogeneas: heterogeneas.length,
  clasesGlobales: Object.fromEntries(Object.entries(clasesGlobal).sort((a, b) => b[1] - a[1])),
  clasesPorPosicion: Object.fromEntries(Object.entries(porPosicion).map(([p, c]) => [p, Object.keys(c).length])),
  paginasVacias: { n: vacias.length, deCuantas: vacias.length + conContenido.length, rutas: vacias },
  conContenido: conContenido.length,
  seriesSinArticles: { n: sinArticles.length, rutas: sinArticles, porQue: "su página 1 tampoco sirve <article>: la pregunta de «vacía» no aplica" },
  desacuerdoVentanaVsTitulo: desacuerdo,
  veredicto: null,
};

console.log(`\n═══ RESUMEN`);
console.log(`  series con >1 página            ${conVarias.length}`);
console.log(`  …HOMOGÉNEAS (1 sola clase)      ${homogeneas.length}`);
console.log(`  …HETEROGÉNEAS (≥2 clases)       ${heterogeneas.length}`);
console.log(`  clases estructurales distintas  ${Object.keys(clasesGlobal).length}`);
console.log(`\n  ── páginas que EXISTEN y no listan nada`);
console.log(`  documentos con 0 tarjetas       ${vacias.length} de ${nDocs}`);
console.log(`  series donde la VENTANA y el <title> discrepan  ${desacuerdo.length}`);
for (const d of desacuerdo.slice(0, 8))
  console.log(`     ${d.ruta.padEnd(46)} ventana ${String(d.ventanaMax).padStart(2)} · título «de ${d.tituloTotal}» · última con contenido ${d.ultimaConContenido}`);

/* ── LA GUARDA DEL ATAJO ───────────────────────────────────────────────────
 * Con una sola página por serie no se puede decir NADA sobre homogeneidad, y
 * el peligro es que eso se lea como «todas homogéneas» — cero comparaciones y
 * verde, la familia de §sondas 4bis. Sale por error. */
const sinComparar = conVarias.length === 0;
if (sinComparar) {
  console.error(
    `\n❌ NO SE PUDO COMPARAR NINGUNA SERIE: todas traen una sola página.\n` +
      `   «No encontré variación» y «no miré más de una» dan la misma salida, y la\n` +
      `   segunda no autoriza a muestrear. Por eso esto sale por error.\n`,
  );
}
if (pielesMuertas === universo.length) {
  console.error(
    `\n❌ patrón MUERTO: ninguna de las ${universo.length} series trae paginador reconocible.\n` +
      `   Un selector equivocado y un sitio sin paginación dan el mismo cero (§sondas 4).\n`,
  );
}

const veredicto = sinComparar
  ? "NO SE PUDO EVALUAR"
  : heterogeneas.length
    ? "LA SERIE NO ES UNA UNIDAD"
    : "SERIE HOMOGÉNEA — el muestreo queda probado";
salida.resumen.veredicto = veredicto;
console.log(`\n  VEREDICTO: ${veredicto}`);
if (heterogeneas.length) {
  console.log(
    `\n  ⇒ La unidad NO es la serie. Las ${conVarias.length} series con varias páginas se reparten en\n` +
      `    ${Object.keys(clasesGlobal).length} clases estructurales, y «la primera de cada serie» sólo vería las de\n` +
      `    posición «primera». Declarar cobertura por serie sería el filtro silencioso\n` +
      `    de §LH-C6-FAMILIA-NO-ES-FAMILIA con otro contenedor.\n`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * CONTROL EN VIVO — ¿la captura de F3-0 dice lo mismo que el sitio de HOY?
 *
 * Todo lo de arriba sale del corpus congelado, y la conclusión que se va a
 * sacar de él —*«58 de las 107 rutas /page/N/ no listan nada»*— es lo bastante
 * cara como para no apoyarse en una captura de hace tres días sin comprobarla.
 * Podría ser un defecto DE LA CAPTURA (una petición que falló y se guardó
 * igual) y se leería exactamente igual que un hecho del sitio.
 *
 * No se muestrea: se piden **las tres fronteras de CADA serie afectada** — la
 * última con contenido, la primera vacía y la primera que debería dar 404 —,
 * que es donde el fenómeno se decide. Con `VIVO=1` porque cuesta red.
 * ═════════════════════════════════════════════════════════════════════════ */
if (env("VIVO")) {
  const UA = { "user-agent": "Mozilla/5.0 (qa kunak-web-clone lh-serie)" };
  const pide = async (u) => {
    try {
      const r = await fetch(u, { headers: UA, redirect: "manual", cache: "no-store" });
      const h = r.status === 200 ? await r.text() : "";
      return { status: r.status, articles: (marcadoDe(h).match(/<article\b/g) || []).length };
    } catch (e) { return { status: 0, articles: null, error: String(e).slice(0, 60) }; }
  };
  /* Sólo las series a las que la pregunta APLICA (§el cero de arriba). Y el
   * 404 de frontera sólo se le exige a las que paginan de verdad: las 7 de
   * `D2.4` responden 200 a cualquier N por diseño del original, así que
   * esperar 404 ahí sería exigirle al sitio lo que ya sabemos que no hace. */
  const noPagina = new Set(
    Object.entries(JSON.parse(readFileSync(join(QA, "medidas/lh-paginas.json"), "utf8")).paginas)
      .filter(([, v]) => v.paginaDeVerdad === false)
      .map(([k]) => k.replace(/^\/es/, "").replace(/\/$/, "")),
  );
  const afectadas = Object.entries(salida.series).filter(([, v]) => sirveArticles(v) && v.paginas.some((p) => p.vacia) && v.nPaginas > 1);
  console.log(`\n  ── CONTROL EN VIVO · las fronteras de las ${afectadas.length} series a las que la pregunta APLICA`);
  const control = [];
  let discrepan = 0;
  for (const [r, v] of afectadas) {
    const conten = v.paginas.filter((p) => !p.vacia).map((p) => p.n);
    const vacs = v.paginas.filter((p) => p.vacia).map((p) => p.n);
    const maxCap = Math.max(...v.paginas.map((p) => p.n));
    const base = `https://kunakair.com/es${r}/`;
    const exigirse404 = !noPagina.has(r);
    const puntos = [
      { que: "última con contenido", n: Math.max(...conten), esperado: ">0 articles, 200" },
      { que: "primera vacía", n: Math.min(...vacs), esperado: "0 articles, 200" },
      ...(exigirse404 ? [{ que: "primera fuera de rango", n: maxCap + 1, esperado: "404" }] : []),
    ];
    const filas = [];
    for (const p of puntos) {
      /* ⚠ `/page/1/` NO es una URL de este sitio: WordPress la redirige (301) a
       * la base. Pedirla daba «✗» en 5 series y el fallo era del control, no
       * del sitio — el instrumento inventándose una frontera que no existe. */
      const res = await pide(p.n === 1 ? base : `${base}page/${p.n}/`);
      const okEsperado =
        p.que === "última con contenido" ? res.status === 200 && res.articles > 0
          : p.que === "primera vacía" ? res.status === 200 && res.articles === 0
            : res.status === 404;
      if (!okEsperado) discrepan++;
      filas.push({ ...p, url: p.n === 1 ? base : `${base}page/${p.n}/`, ...res, coincideConLaCaptura: okEsperado });
    }
    control.push({ ruta: r, puntos: filas });
    const pinta = filas.map((f) => `${f.n}:${f.status}${f.articles !== null ? `/${f.articles}art` : ""}${f.coincideConLaCaptura ? "✓" : "✗"}`).join(" ");
    console.log(`     ${r.padEnd(46)} ${pinta}`);
  }
  salida.controlEnVivo = { fecha: hoy(), series: afectadas.length, puntos: control.reduce((a, c) => a + c.puntos.length, 0), discrepan, detalle: control };
  console.log(`  ⇒ ${control.reduce((a, c) => a + c.puntos.length, 0)} puntos de frontera · **${discrepan} discrepancias** con la captura de F3-0`);
  if (discrepan) {
    console.error(
      `\n❌ la captura y el sitio VIVO no dicen lo mismo en ${discrepan} punto(s) de frontera.\n` +
        `   Entonces el «58 vacías» podría ser de la captura y no del sitio, y no se puede\n` +
        `   publicar como hallazgo hasta saber cuál de los dos manda.\n`,
    );
  }
}

w(`medidas/lh-serie${SABOTAJE ? `-neg-${SABOTAJE}` : ""}${env("VIVO") ? "-vivo" : ""}.json`, salida);
ev.informe();
process.exitCode = sinComparar || pielesMuertas === universo.length ? 2 : 0;
