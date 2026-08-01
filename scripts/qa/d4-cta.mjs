/**
 * D4 · LA 4ª SECCIÓN DEL PIE DEL CASO — su spec, para poder construirla.
 * Uso: npm run qa:d4-cta -- [ancho]        SABOTAJE=1 → test en negativo
 *
 * `d4-pie` ya midió QUÉ es: una sección de más que solo tiene el CASO, de
 * **343.06 @1440 / 265.06 @390**, con 4 módulos y ninguna fila Divi. `c-spec`
 * ya congeló su HTML y dice que es un `et_pb_fullwidth_slider` repetido **una
 * vez por idioma** (`ocultar-en|es|fr|ar`), de los que en /es/ solo uno se ve.
 *
 * Lo que falta para construirla es la CAJA: qué módulo es el visible, con qué
 * `padding`, qué tipografía y qué foto. Eso no está en el HTML congelado —el
 * `background-image` lo pone el CSS— así que se mide en el DOM asentado.
 *
 * ⚠ Cuál de los 4 se ve **no se deduce del nombre de la clase**: `ocultar-es`
 * está en el módulo cuyo texto es español, así que el nombre dice lo contrario
 * de lo que parece. Se mide el alto de cada uno: el que no es 0 es el que sale.
 * Es la regla de C2 — «alto 0 no se deduce de la clase, se mide».
 */
import { Censo, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = !!process.env.SABOTAJE;
const URL = "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/";

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const H = (el) => r(el.getBoundingClientRect().height);
  const W2 = (el) => r(el.getBoundingClientRect().width);
  const cs = (el, ...p) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const o = {};
    for (const k of p) o[k] = s[k];
    return o;
  };

  if (sabotaje) __q(".d4-cta-selector-que-no-existe");

  const pie = __q("footer.et-l--footer, #main-footer");
  if (!pie) return { ausente: true };
  // La 4ª sección es la que NO es links/legal/background.
  const sec = __qa(".et_pb_section", pie).find(
    (s) => !/footer-(links|legal|background)/.test(s.className),
  );
  if (!sec) return { sinCta: true };

  const modulos = __qa(".et_pb_module", sec).map((m) => ({
    clase: (m.className.match(/ocultar-\w+/) || ["?"])[0],
    h: H(m),
    display: getComputedStyle(m).display,
    txt: (m.textContent || "").replace(/\s+/g, " ").trim().slice(0, 46),
  }));
  // El visible: el único con alto. Medir, no deducir de la clase.
  const vivo = __qa(".et_pb_module", sec).find((m) => m.getBoundingClientRect().height > 0);

  const slide = vivo ? __q(".et_pb_slide", vivo) : null;
  const desc = vivo ? __q(".et_pb_slide_description", vivo) : null;
  const h2 = vivo ? __q(".et_pb_slide_title", vivo) : null;
  const boton = vivo ? __q("a.et_pb_button", vivo) : null;
  const cont = vivo ? __q(".et_pb_container", vivo) : null;

  return {
    seccion: { h: H(sec), w: W2(sec), ...cs(sec, "paddingTop", "paddingBottom", "backgroundColor") },
    modulos,
    vivoClase: vivo ? (vivo.className.match(/ocultar-\w+/) || ["?"])[0] : null,
    slide: slide && {
      h: H(slide),
      ...cs(slide, "backgroundImage", "backgroundColor", "backgroundSize", "backgroundPosition",
        "backgroundBlendMode", "paddingTop", "paddingBottom"),
    },
    contenedor: cont && { h: H(cont), w: W2(cont), ...cs(cont, "paddingTop", "paddingBottom", "width", "maxWidth", "marginLeft") },
    desc: desc && { h: H(desc), w: W2(desc), ...cs(desc, "paddingTop", "paddingBottom", "paddingLeft", "textAlign") },
    h2: h2 && {
      h: H(h2), w: W2(h2),
      txt: (h2.textContent || "").trim(),
      href: __q("a", h2)?.getAttribute("href") ?? null,
      ...cs(h2, "fontSize", "lineHeight", "fontWeight", "color", "letterSpacing", "paddingBottom", "marginBottom"),
    },
    boton: boton && {
      h: H(boton), w: W2(boton),
      txt: (boton.textContent || "").trim(),
      href: boton.getAttribute("href"),
      ...cs(boton, "fontSize", "lineHeight", "color", "backgroundColor", "borderWidth", "borderColor",
        "borderRadius", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "letterSpacing"),
    },
  };
};

const { browser } = await launch();
const censo = new Censo();
const { page, status } = await openPage(browser, URL, { width, height: mobile ? 844 : 900, mobile });
if (status !== 200) { console.error("❌ HTTP " + status); process.exit(2); }
await settle(page);
const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
await page.close();
await browser.close();

console.log(`\n█ 4ª sección del pie del CASO @${width}`);
console.log(JSON.stringify(datos, null, 2));
w(`medidas/d4-cta-${width}.json`, { meta: { width, url: URL, fecha: new Date().toISOString().slice(0, 10) }, datos });

const muertos = censo.informe(`@${width}`);
const roto = datos.ausente || datos.sinCta ? 1 : 0;
if (roto) console.error("❌ no se encontró la 4ª sección — eso no es «no tiene CTA», es un selector equivocado.");
console.log(`\n${muertos + roto === 0 ? "✅" : "❌"} d4-cta @${width} · ${muertos} selector(es) muerto(s)`);
process.exit(muertos + roto === 0 ? 0 : 2);
