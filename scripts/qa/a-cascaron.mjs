/**
 * CASCARÓN DEL ARQUETIPO A — el `tb_body` de 2 secciones, a los dos anchos.
 * Uso: npm run qa:a-cascaron -- [ancho]      (mide el ORIGINAL, no el clon)
 *
 * `docs/research/arquetipo-A/` PASO 2. El censo (`a-censo.mjs`) dio el esqueleto
 * de las 209 por conteo; esto da **los valores**, que es lo que hace falta para
 * aplicar los dos tests de `CLAUDE.md` §«Cómo se decide si algo es plantilla o
 * campo» — y, sobre todo, para marcar lo que quede **SIN PROBAR**, que es la
 * categoría que costó P3.
 *
 * Cuatro páginas: las dos variantes de blog (con y sin bloque de relacionados),
 * un término y un documento científico. A 1440 y a 390.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;

const PAGINAS = {
  "blog CON relacionados": "https://kunakair.com/es/contaminacion-por-metano/",
  "blog SIN relacionados": "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/",
  termino: "https://kunakair.com/es/emisiones-atmosfericas/",
  // ⚠ La primera versión apuntaba a `…/documentos-cientificos/evaluaciones-independientes/`,
  // que es una **categoría**, no un documento: la sonda devolvió la fila entera
  // vacía. Las URLs salen ahora de `medidas/a-muestra.json`, que es donde la
  // regla de selección las dejó — escribirlas a mano fue el error.
  "doc-cientifico":
    "https://kunakair.com/es/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo/",
};

const extraer = function () {
  const r = (n) => Math.round(n * 100) / 100;
  const t = (el, n = 30) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? v : Math.round(n * 100) / 100;
  };

  const main = document.querySelector("#main-content");
  if (!main) return { error: "sin #main-content" };

  /** Cada módulo del `tb_body`, con su ritmo y su tipografía. */
  const nodos = [...main.querySelectorAll("[class*='_tb_body']")].map((el) => {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const tok = (el.className.match(/et_pb_([a-z_]+?)_(\d+)_tb_body/) || []);
    return {
      id: tok[1] ? `${tok[1]}#${tok[2]}` : "?",
      w: r(b.width),
      h: r(b.height),
      mt: px(s.marginTop),
      mb: px(s.marginBottom),
      pt: px(s.paddingTop),
      pb: px(s.paddingBottom),
      pl: px(s.paddingLeft),
      pr: px(s.paddingRight),
      fs: px(s.fontSize),
      lh: px(s.lineHeight),
      txt: t(el),
    };
  });

  /** El `post_content` y su columna: dónde vive el blob. */
  const pc = main.querySelector("[class*='et_pb_post_content']");
  const col = pc?.closest("[class*='et_pb_column']");
  const fila = pc?.closest("[class*='et_pb_row']");
  const caja = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { w: r(b.width), h: r(b.height), pl: px(s.paddingLeft), pr: px(s.paddingRight) };
  };

  return {
    nodos,
    postContent: caja(pc),
    columna: caja(col),
    fila: caja(fila),
    /** Anchura de la retícula: lo que decide si la columna es % o px. */
    filaMax: fila ? getComputedStyle(fila).maxWidth : null,
    filaW: fila ? getComputedStyle(fila).width : null,
  };
};

/**
 * Con `--muestra`, en vez de las 4 de referencia mide **las 24 de la muestra**
 * seleccionada por `a-muestra.mjs`.
 *
 * Existe porque la afirmación que sostiene el PASO 2 —«el cascarón no tiene
 * campos por instancia»— se apoyaba en **2 instancias de 149**, que es
 * exactamente el tamaño de muestra que produjo la familia S9–S11. Con esto se
 * comprueba en 24.
 */
if (process.argv.includes("--muestra")) {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { QA } = await import("./lib.mjs");
  const m = JSON.parse(readFileSync(join(QA, "medidas", "a-muestra.json"), "utf8"));
  for (const k of Object.keys(PAGINAS)) delete PAGINAS[k];
  for (const [forma, d] of Object.entries(m.formas))
    d.muestra.forEach((x, i) => {
      PAGINAS[`${forma}[${i}] ${x.chars}ch`] = x.url;
    });
}

const { browser } = await launch();
const todo = { meta: { width } , paginas: {} };
for (const [etq, url] of Object.entries(PAGINAS)) {
  const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
  await settle(page);
  todo.paginas[etq] = { url, ...(await page.evaluate(extraer)) };
  await page.close();
}
await browser.close();

console.log(`\n════════ CASCARÓN DEL ARQUETIPO A @${width} ════════`);
for (const [etq, d] of Object.entries(todo.paginas)) {
  console.log(`\n█ ${etq}`);
  if (d.error) {
    console.log(`   ⚠ ${d.error}`);
    continue;
  }
  console.log(
    `   fila: w ${d.fila?.w} (css ${d.filaW}, max ${d.filaMax}) · columna w ${d.columna?.w}` +
      ` · post_content w ${d.postContent?.w}`,
  );
  for (const n of d.nodos)
    console.log(
      `   ${n.id.padEnd(16)} w ${String(n.w).padStart(8)} h ${String(n.h).padStart(8)}` +
        `  m ${String(n.mt).padStart(6)}/${String(n.mb).padEnd(6)}` +
        ` p ${String(n.pt).padStart(5)}/${String(n.pb).padEnd(5)}` +
        ` ${String(n.fs).padStart(5)}/${String(n.lh).padEnd(6)} | ${n.txt}`,
    );
}

w(`medidas/a-cascaron-${width}.json`, todo);
