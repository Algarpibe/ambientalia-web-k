/**
 * D4 · EL PIE — ¿mismo pie con contenido distinto, o PLANTILLAS de pie distintas?
 * Uso: npm run qa:d4 -- [ancho]
 *
 * C1 midió que el pie del ORIGINAL vale 593.75 en blog, 1048.25 en catálogo y
 * 681.09 en software, **constante dentro de cada familia**, mientras el clon
 * sirve siempre 681.09. Esa firma —constante por familia, distinta entre
 * familias— es la de una **variante de plantilla**, no la de un campo por
 * instancia (§«Estructura que en realidad es contenido»). Pero eso hay que
 * verificarlo, no deducirlo de la forma del número.
 *
 * Lo que decide la pregunta es la COMPOSICIÓN interna del pie: si las tres
 * familias traen las MISMAS secciones con distinto contenido, es contenido; si
 * traen un número o un tipo distinto de secciones, son plantillas distintas —
 * que es lo que C-1 ya vio en el censo (`tb_footer` 4 en caso de éxito contra 3
 * en el resto, `esqueleto.json`).
 *
 * Se mide sobre el ORIGINAL, que es donde vive la respuesta.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";

/** Una ruta por familia, más dos controles de familias ya conocidas. */
const RUTAS = [
  ["A · blog", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/", "/todas-nuestras-soluciones-en-el-iotswc"],
  ["A · término", "https://kunakair.com/es/emisiones-atmosfericas/", "/emisiones-atmosfericas"],
  ["CATÁLOGO", "https://kunakair.com/es/accesorios/", "/accesorios"],
  ["SOFTWARE", "https://kunakair.com/es/kunak-api/", "/kunak-api"],
  ["PRODUCTO", "https://kunakair.com/es/monitor-calidad-aire/", "/monitor-calidad-aire"],
  ["SECTOR", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/", "/sectores/calidad-del-aire-en-las-ciudades"],
  ["CASO", "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/", "/casos-de-exito/red-calidad-de-aire-para-world-athletics"],
];

const LECTOR = () => {
  const r = (n) => Math.round(n * 100) / 100;
  const H = (el) => r(el.getBoundingClientRect().height);
  const t = (el, n = 42) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);

  const esOriginal = !!document.querySelector(".et_pb_section");
  const pie = document.querySelector(esOriginal ? "footer.et-l--footer, #main-footer" : "footer");
  if (!pie) return { ausente: true };

  // En el original el pie del Theme Builder son `.et_pb_section` con sufijo
  // `_tb_footer`. En el clon son los bloques de nivel 1 del <footer>.
  const secciones = esOriginal
    ? [...pie.querySelectorAll(".et_pb_section")]
    : [...pie.children];

  return {
    alto: H(pie),
    nSecciones: secciones.length,
    // La IDENTIDAD de cada sección, no solo su alto: es lo que distingue
    // «mismo pie con otro contenido» de «otra plantilla de pie».
    secciones: secciones.map((s, i) => ({
      i,
      h: H(s),
      clase: (s.className || "").split(" ").filter((c) => /_tb_footer|et_pb_section_\d|^[a-z-]{4,}$/.test(c)).slice(0, 3).join(" "),
      nFilas: s.querySelectorAll(".et_pb_row, [class*='et_pb_row']").length,
      nModulos: s.querySelectorAll(".et_pb_module").length,
      // ── Por qué la MISMA sección mide distinto en dos familias ───────────
      // Con las mismas clases y los mismos módulos, lo único que puede cambiar
      // el alto es la CAJA: si la fila es más estrecha, las columnas apilan y
      // el bloque crece. Es la regla del ancho aplicada al pie.
      caja: (() => {
        const fila = s.querySelector(".et_pb_row, [class*='et_pb_row']");
        const cols = [...s.querySelectorAll(".et_pb_column")];
        const r2 = (n) => Math.round(n * 100) / 100;
        return {
          secW: r2(s.getBoundingClientRect().width),
          filaW: fila ? r2(fila.getBoundingClientRect().width) : null,
          nCols: cols.length,
          colsW: cols.slice(0, 6).map((c) => r2(c.getBoundingClientRect().width)),
          colsY: cols.slice(0, 6).map((c) => r2(c.getBoundingClientRect().y + window.scrollY)),
          pt: getComputedStyle(s).paddingTop,
          pb: getComputedStyle(s).paddingBottom,
        };
      })(),
      txt: t(s),
    })),
    // Marcadores de contenido que podrían explicar una diferencia de alto
    nEnlaces: pie.querySelectorAll("a[href]").length,
    nImgs: pie.querySelectorAll("img").length,
    nForm: pie.querySelectorAll("form").length,
    nWidgets: pie.querySelectorAll(".et_pb_widget, .widget").length,
  };
};

const { browser } = await launch();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10) }, familias: {} };

for (const [fam, orig, clon] of RUTAS) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const d = await page.evaluate(LECTOR);
    await page.close();
    return d;
  };
  const o = await lee(orig), c = await lee(CLON + clon);
  salida.familias[fam] = { orig: o, clon: c };

  console.log(`\n█ ${fam}  @${width}`);
  console.log(`   PIE  orig ${String(o.alto).padStart(8)} (${o.nSecciones} secs · ${o.nEnlaces} a · ${o.nImgs} img · ${o.nForm} form · ${o.nWidgets} widg)`);
  console.log(`        clon ${String(c.alto).padStart(8)} (${c.nSecciones} secs · ${c.nEnlaces} a · ${c.nImgs} img · ${c.nForm} form)   Δ ${+(c.alto - o.alto).toFixed(2)}`);
  for (const s of o.secciones) console.log(`          orig sec${s.i} h=${String(s.h).padStart(8)} filas=${s.nFilas} mods=${s.nModulos}  ${s.clase.padEnd(34)} | ${s.txt}`);
}
await browser.close();
w(`medidas/d4-pie-${width}.json`, salida);
