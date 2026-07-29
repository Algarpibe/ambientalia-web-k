/**
 * S7 (2/2) — original vs clon, ancla a ancla, para CUALQUIER sector poblado.
 * Uso: node cmp-sector.mjs <urbano|industria> [ancho]
 *
 * Las anclas son el arranque de cada bloque del cuerpo (que es lo que S7 mueve)
 * más las secciones de abajo, que sirven de acumulador del desfase.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const SECTORES = {
  urbano: {
    orig: "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/",
    clon: "http://localhost:3000/sectores/calidad-del-aire-en-las-ciudades",
    anclas: [
      ["h1", "h1", ""],
      ["cta", "p", "¿Necesitas medir la contaminación"],
      ["beneficios", "h3", "Beneficios de monitorizar"],
      ["aplicaciones", "h3", "Aplicaciones en las ciudades"],
      ["claim", "p", "Protege la salud de tus ciudadanos"],
    ],
  },
  industria: {
    orig: "https://kunakair.com/es/sectores/control-de-emisiones-industriales/",
    clon: "http://localhost:3000/sectores/control-de-emisiones-industriales",
    anclas: [
      ["h1", "h1", ""],
      ["beneficios", "h3", "Beneficios del control de las emisiones"],
      ["aplicaciones", "h3", "Aplicaciones en las industrias"],
      ["cta", "p", "¿Quieres controlar el impacto de tus procesos"],
      ["lista", "p", "Algunos de las aplicaciones donde desplegar"],
      // ojo: el hero abre un párrafo con las mismas 8 palabras, así que el
      // ancla del claim tiene que ser su COLA, no su cabeza.
      ["claim", "p", "partículas en industrias"],
      ["mapa", "h2", "Proyectos por todo el mundo"],
    ],
  },
};

const cual = process.argv[2] || "industria";
const width = Number(process.argv[3] || 1440);
const mobile = width <= 500;
const cfg = SECTORES[cual];
const { browser } = await launch();

async function medir(url) {
  const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
  await settle(page);
  const out = await page.evaluate((anclas) => {
    const r = (n) => Math.round(n * 10) / 10;
    const t = (s) => (s || "").replace(/\s+/g, " ").trim();
    const y = (el) => (el ? r(el.getBoundingClientRect().top + scrollY) : null);
    const porTexto = (sel, txt) =>
      txt === ""
        ? document.querySelector(sel)
        : [...document.querySelectorAll(sel)].find((e) => t(e.textContent).includes(txt));

    const res = {};
    for (const [nombre, sel, txt] of anclas) res[nombre] = y(porTexto(sel, txt));

    // colas comunes de la plantilla: acumulan todo el desfase del cuerpo
    res.slider = y(
      document.querySelector("[aria-roledescription='carrusel'], .et_pb_fullwidth_slider"),
    );
    res.soluciones = y(porTexto("h2", "Nuestras soluciones"));
    res.proyectos = y(porTexto("h2", "Últimos proyectos"));
    res.articulos = y(porTexto("h2", "Artículos y Guías"));
    res.footer = y(document.querySelector("footer, .et_pb_section_0_tb_footer"));
    res.docH = document.documentElement.scrollHeight;
    return res;
  }, cfg.anclas);
  await page.close();
  return out;
}

const o = await medir(cfg.orig);
const c = await medir(cfg.clon);

console.log(`\n======== ${cual} @${width} ========`);
console.log("ancla".padEnd(14) + "original".padEnd(12) + "clon".padEnd(12) + "Δ");
const filas = {};
for (const k of Object.keys(o)) {
  const a = o[k],
    b = c[k];
  const d =
    typeof a === "number" && typeof b === "number"
      ? Math.round((b - a) * 10) / 10
      : null;
  filas[k] = { orig: a, clon: b, delta: d };
  console.log(
    k.padEnd(14) +
      String(a).padEnd(12) +
      String(b).padEnd(12) +
      (d === null ? "≠" : (d >= 0 ? "+" : "") + d),
  );
}
w(`cmp-${cual}-${width}.json`, filas);
await browser.close();
