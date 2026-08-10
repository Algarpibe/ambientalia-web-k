/**
 * LA FASE DE SPECS DE `articulos-kb` — `getComputedStyle` de todo el árbol, en
 * el ORIGINAL VIVO, a los dos anchos.
 * Uso: node scripts/qa/kb-spec.mjs [1440|390]     (npm run qa:kb-spec)
 *
 * ── Por qué contra el sitio vivo, y no contra la captura ──────────────────
 * Lo contestó el PASO 0 con una medida de dos lados (`qa:kb-css`,
 * `medidas/kb-css.json`): de las **19 hojas externas** que el HTML pide, la
 * captura tiene **0**, y aun así renderiza —trae 184 KB de CSS en línea—, así
 * que sale **plausible y equivocada**. Las 9 anclas que fallan en las 6 son el
 * ritmo y la caja; la peor, `columna.width` **678.52 offline contra 430.80 en
 * el original**: sin las hojas externas la partición en columnas no ocurre y
 * todas salen de ancho completo. Medir ahí habría fabricado una spec que dice
 * «el cuerpo es plano», que es justo el defecto que esta fase viene a corregir.
 *
 * ⚠ Alcance, y se escribe porque la frase anterior circulaba en absoluto: el
 * original está fuera del camino crítico **para obtener datos** (sembrar,
 * censar, transcribir) y **NO lo está para medir el píxel**.
 *
 * ── El régimen, que decide cómo se lee cada número ────────────────────────
 * El centro de ayuda es **HÍBRIDO** (`CLAUDE.md` §régimen, corrección del grupo
 * D del 2026-08-03): el `<body>` trae `et_pb_pagebuilder_layout` **y**
 * `et-tb-has-body`, y no es un tercer régimen — son los dos conviviendo en
 * CAPAS. Por eso esta sonda separa las dos y **les aplica lecturas opuestas**:
 *
 *   · capa `_tb_` (cabecera · retícula de cuerpo con su barra lateral · pie):
 *     **lectura PLANTILLADA**. El discriminador es la VARIANZA ENTRE
 *     INSTANCIAS; un px absoluto aquí significa «lo fijó quien construyó la
 *     plantilla», o sea PLANTILLA, no campo;
 *   · capa PROPIA (las secciones del builder dentro del `post_content`):
 *     **lectura de BUILDER**. Valen los dos tests tal cual — A (igual a 1440 y
 *     a 390 ⇒ lo escribió una persona ⇒ campo) y B (varía entre hermanos de la
 *     misma página ⇒ campo).
 *
 * Aplicar el test A a la capa `_tb_` daría la respuesta INVERTIDA, que es
 * exactamente cómo se convierte una plantilla en ocho campos inventados.
 *
 * ── Y la regla que gobierna lo que NO pase ningún test ────────────────────
 * Una propiedad que no pasa ninguno de los dos **no está probada como
 * plantilla: está SIN PROBAR**, y se congela como tal. No se cablea.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Censo`: selector que no case en ninguna de las 6 ⇒ error, no cero;
 * 2 · `Evaluadas`, mínimo derivado del índice de la captura (6 artículos);
 * 3 · congela en `medidas/kb-spec-<ancho>.json`;
 * 4 · `SIN_CLON=1`: no mira el clon, así que un `build` no la contamina;
 * 5 · los renglones se cuentan con un `Range`, **nunca** con
 *     `getClientRects().length` sobre el elemento — en un bloque eso devuelve 1
 *     siempre, y da un número plausible y falso (`CLAUDE.md` §corolario de
 *     instrumento).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const ANCHO = Number(process.argv[2] || 1440);
const MOVIL = ANCHO <= 500;
const RAIZ = join(QA, "../..");
const BASE = join(RAIZ, "corpus/fase-3");

const indice = JSON.parse(readFileSync(join(BASE, "INDICE.json"), "utf8"));
const ARTICULOS = Object.entries(indice.paginas)
  .filter(([clave, p]) => clave.startsWith("articulos-kb:") && p.fichero && p.http === 200)
  .map(([clave, p]) => ({ ruta: clave.slice("articulos-kb:".length), url: p.url }));

if (ARTICULOS.length !== 6)
  throw new Error(`el índice da ${ARTICULOS.length} artículos y §2d.1 midió 6. Sin denominador no hay spec.`);

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
  const TIPO = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign", "textTransform"];
  const CAJA = ["width", "maxWidth", "minHeight", "display", "backgroundColor", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderColor", "borderRadius", "boxShadow"];

  /** Renglones DE VERDAD: cajas de un `Range` sobre el contenido, agrupadas por `top`. */
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

  /* ── el módulo, con sus tripas por KIND ─────────────────────────────────── */
  const delModulo = (m) => {
    const kindDe = () => {
      for (const [c, k] of [["et_pb_blurb", "blurb"], ["et_pb_gallery", "gallery"], ["et_pb_text", "text"], ["et_pb_image", "image"], ["et_pb_toggle", "toggle"], ["et_pb_video", "video"], ["et_pb_divider", "divider"], ["et_pb_code", "code"], ["et_pb_cta", "cta"], ["et_pb_accordion", "accordion"], ["et_pb_tabs", "tabs"]])
        if (m.classList.contains(c)) return k;
      if (m.classList.contains("et_pb_button_module_wrapper") || m.matches("a.et_pb_button")) return "button";
      return "?";
    };
    const kind = kindDe();
    const base = {
      kind,
      clases: [...m.classList].filter((c) => c !== "et_pb_module"),
      estiloInline: m.getAttribute("style") || null,
      rect: R(m),
      renderizado: rend(m),
      ritmo: S(m, RITMO),
      caja: S(m, CAJA),
    };
    if (kind === "text") {
      const inner = m.querySelector(".et_pb_text_inner");
      const p = inner?.querySelector("p");
      const li = inner?.querySelector("li");
      const hs = [...(inner?.querySelectorAll("h1,h2,h3,h4,h5,h6") ?? [])];
      return {
        ...base,
        inner: { ritmo: S(inner, RITMO), caja: S(inner, CAJA) },
        p: p ? { tipo: S(p, TIPO), ritmo: S(p, RITMO), rect: R(p), renglones: renglones(p), texto: txt(p)?.slice(0, 120) } : null,
        li: li ? { tipo: S(li, TIPO), ritmo: S(li, RITMO), lista: S(li.parentElement, [...RITMO, "listStyleType", "listStylePosition"]) } : null,
        titulares: hs.slice(0, 4).map((h) => ({ etiqueta: h.tagName.toLowerCase(), tipo: S(h, TIPO), ritmo: S(h, RITMO), rect: R(h), renglones: renglones(h), texto: txt(h)?.slice(0, 90) })),
        etiquetas: [...new Set([...(inner?.querySelectorAll("*") ?? [])].map((e) => e.tagName.toLowerCase()))],
        html: (inner?.innerHTML ?? "").trim(),
      };
    }
    if (kind === "blurb") {
      const img = m.querySelector(".et_pb_main_blurb_image img");
      const cont = m.querySelector(".et_pb_main_blurb_image");
      const h = m.querySelector(".et_pb_module_header");
      const d = m.querySelector(".et_pb_blurb_description");
      const dp = d?.querySelector("p");
      return {
        ...base,
        imagen: img ? { src: img.getAttribute("src"), alt: img.getAttribute("alt"), attrW: img.getAttribute("width"), attrH: img.getAttribute("height"), rect: R(img), caja: S(img, CAJA), contenedor: { rect: R(cont), ritmo: S(cont, RITMO), caja: S(cont, CAJA) } } : null,
        titular: h ? { etiqueta: h.tagName.toLowerCase(), tipo: S(h, TIPO), ritmo: S(h, RITMO), rect: R(h), renglones: renglones(h), texto: txt(h), envuelto: !!h.querySelector("span") } : null,
        descripcion: d ? { ritmo: S(d, RITMO), rect: R(d), p: dp ? { tipo: S(dp, TIPO), ritmo: S(dp, RITMO) } : null, html: d.innerHTML.trim() } : null,
        contenido: S(m.querySelector(".et_pb_blurb_content"), [...RITMO, ...CAJA]),
        enlace: m.querySelector("a.et_pb_module_header, .et_pb_blurb_content > a")?.getAttribute("href") ?? null,
      };
    }
    if (kind === "gallery") {
      const items = [...m.querySelectorAll(".et_pb_gallery_item")];
      const i0 = items[0];
      return {
        ...base,
        n: items.length,
        item0: i0 ? { rect: R(i0), ritmo: S(i0, RITMO), caja: S(i0, CAJA), img: R(i0.querySelector("img")), titulo: txt(i0.querySelector(".et_pb_gallery_title")), tituloTipo: S(i0.querySelector(".et_pb_gallery_title"), TIPO) } : null,
        items: items.map((g) => { const i = g.querySelector("img"); return { src: i?.getAttribute("src") ?? null, alt: i?.getAttribute("alt") ?? null, titulo: txt(g.querySelector(".et_pb_gallery_title")), rect: R(g) }; }),
        contenedor: S(m.querySelector(".et_pb_gallery_items"), [...RITMO, ...CAJA]),
      };
    }
    if (kind === "image") {
      const i = m.querySelector("img");
      const wrap = m.querySelector(".et_pb_image_wrap");
      return { ...base, src: i?.getAttribute("src") ?? null, alt: i?.getAttribute("alt") ?? null, srcset: i?.getAttribute("srcset") ?? null, attrW: i?.getAttribute("width") ?? null, attrH: i?.getAttribute("height") ?? null, img: { rect: R(i), caja: S(i, CAJA) }, wrap: { rect: R(wrap), caja: S(wrap, CAJA) }, alineacion: [...m.classList].filter((c) => /align/.test(c)) };
    }
    if (kind === "button") {
      const b = m.querySelector("a.et_pb_button") ?? (m.matches("a.et_pb_button") ? m : null);
      return { ...base, texto: txt(b), href: b?.getAttribute("href") ?? null, boton: { rect: R(b), tipo: S(b, TIPO), ritmo: S(b, RITMO), caja: S(b, CAJA) } };
    }
    if (kind === "toggle") {
      const t = m.querySelector(".et_pb_toggle_title");
      const c = m.querySelector(".et_pb_toggle_content");
      return { ...base, abierto: m.classList.contains("et_pb_toggle_open"), titulo: { texto: txt(t), tipo: S(t, TIPO), ritmo: S(t, RITMO), rect: R(t) }, contenido: { ritmo: S(c, RITMO), rect: R(c), html: (c?.innerHTML ?? "").trim().slice(0, 400) } };
    }
    if (kind === "video") {
      const f = m.querySelector("iframe");
      return { ...base, src: f?.getAttribute("src") ?? null, marco: R(f) };
    }
    return base;
  };

  /* ── la retícula ────────────────────────────────────────────────────────── */
  const deColumna = (c) => ({
    clases: [...c.classList],
    tipo: [...c.classList].find((x) => /^et_pb_column_(\d_\d|\d_\d+|empty)/.test(x)) ?? [...c.classList].find((x) => /^et_pb_column_/.test(x)) ?? null,
    estiloInline: c.getAttribute("style") || null,
    rect: R(c),
    renderizada: rend(c),
    ritmo: S(c, RITMO),
    caja: S(c, CAJA),
    modulos: [...c.querySelectorAll(":scope > .et_pb_module")].map(delModulo),
  });
  const deFila = (f) => {
    const cols = [...f.querySelectorAll(":scope > .et_pb_column")].map(deColumna);
    return {
      clases: [...f.classList],
      estiloInline: f.getAttribute("style") || null,
      rect: R(f),
      renderizada: rend(f),
      ritmo: S(f, RITMO),
      caja: S(f, CAJA),
      nColumnas: cols.length,
      reparto: cols.map((c) => c.tipo).join(" + "),
      columnas: cols,
    };
  };
  const deSeccion = (s) => ({
    clases: [...s.classList],
    estiloInline: s.getAttribute("style") || null,
    rect: R(s),
    renderizada: rend(s),
    ritmo: S(s, RITMO),
    caja: S(s, CAJA),
    filas: [...s.querySelectorAll(":scope > .et_pb_row, :scope > .et_pb_row_inner")].map(deFila),
  });

  const todas = __qa(".et_pb_section");
  const esTb = (s) => /_tb_(header|body|footer)/.test(s.className);
  const propias = todas.filter((s) => !esTb(s));
  const tb = todas.filter(esTb);

  /* ── el cascarón, con la retícula que aloja al cuerpo ───────────────────── */
  const cuerpoTb = tb.find((s) => /_tb_body/.test(s.className)) ?? null;
  const filaTb = cuerpoTb?.querySelector(":scope > .et_pb_row") ?? null;
  const colsTb = filaTb ? [...filaTb.querySelectorAll(":scope > .et_pb_column")] : [];
  const barra = colsTb.find((c) => /column_1_4/.test(c.className)) ?? colsTb[0] ?? null;
  const contenido = colsTb.find((c) => /column_3_4/.test(c.className)) ?? colsTb[1] ?? null;

  return {
    body: { clases: document.body.className, tipo: S(document.body, TIPO), caja: S(document.body, CAJA) },
    doc: { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight },
    title: document.title,
    /* El `h1` del centro de ayuda: existe, es el mismo en las 6 y está OCULTO.
     * Se mide para poder decirlo con número en vez de por observación. */
    h1: (() => { const h = __q("h1"); return h ? { texto: txt(h), renderizado: rend(h), rect: R(h), tipo: S(h, TIPO) } : null; })(),
    cascaron: {
      nSecciones: tb.length,
      cabecera: (() => { const c = tb.find((s) => /_tb_header/.test(s.className)); return c ? { clases: [...c.classList], rect: R(c), ritmo: S(c, RITMO), caja: S(c, CAJA) } : null; })(),
      cuerpo: cuerpoTb ? { clases: [...cuerpoTb.classList], rect: R(cuerpoTb), ritmo: S(cuerpoTb, RITMO), caja: S(cuerpoTb, CAJA) } : null,
      fila: filaTb ? { clases: [...filaTb.classList], rect: R(filaTb), ritmo: S(filaTb, RITMO), caja: S(filaTb, CAJA) } : null,
      barraLateral: barra ? { clases: [...barra.classList], rect: R(barra), ritmo: S(barra, RITMO), caja: S(barra, CAJA), widgets: [...barra.querySelectorAll(":scope > .et_pb_module")].map((m) => [...m.classList].filter((c) => c !== "et_pb_module").slice(0, 3).join(" ")) } : null,
      contenido: contenido ? { clases: [...contenido.classList], rect: R(contenido), ritmo: S(contenido, RITMO), caja: S(contenido, CAJA) } : null,
      pie: tb.filter((s) => /_tb_footer/.test(s.className)).map((s) => ({ clases: [...s.classList], rect: R(s), ritmo: S(s, RITMO) })),
    },
    propias: propias.map(deSeccion),
  };
}

const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: `kb-spec@${ANCHO}`, unidad: "artículos", minimo: ARTICULOS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: `SPECS de \`articulos-kb\`: \`getComputedStyle\` del árbol entero (cascarón \`_tb_\` + secciones propias) de las 6 instancias, a ${ANCHO}.`,
    fuente: "kunakair.com VIVO — la captura no sirve para esto (PASO 0, medidas/kb-css.json)",
    ancho: ANCHO,
    protocolo: "perfil limpio · Cookiebot bloqueado · " + (MOVIL ? "Emulation.setDeviceMetricsOverride 390×844" : "viewport 1440×900") + " · scroll+settle · lazy→eager",
    regimen: "HÍBRIDO: capa `_tb_` con lectura PLANTILLADA (varianza entre instancias) + capa propia con lectura de BUILDER (tests A y B)",
    ruido: "⚠ este arquetipo NO tiene campaña de ruido propia: un residuo pequeño en estas rutas es SIN PROBAR, no limpio",
  },
  articulos: {},
};

for (const a of ARTICULOS) {
  const { page, status } = await openPage(browser, a.url, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  if (status >= 400 || status === 0) { ev.fallo(a.ruta, `HTTP ${status}`); await page.close(); continue; }
  await settle(page);
  const { datos } = await censo.medir(page, barrer);
  salida.articulos[a.ruta] = datos;
  await page.close();
  await new Promise((r) => setTimeout(r, 500));
  ev.ok();

  const filas = datos.propias.flatMap((s) => s.filas);
  const mods = filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos));
  const cuenta = {};
  for (const m of mods) cuenta[m.kind] = (cuenta[m.kind] ?? 0) + 1;
  console.log(
    `  ${a.ruta.replace(/\/$/, "").split("/").pop().padEnd(52)} secciones ${datos.propias.length} · filas ${filas.length} (${filas.filter((f) => !f.renderizada).length} ocultas) · ` +
      `módulos ${mods.length} · ${Object.entries(cuenta).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k}×${n}`).join(" ")}`,
  );
}

await browser.close();

/* ══════════════════ LO QUE LA SPEC DECIDE, CON SU TEST ══════════════════ */
const A = Object.values(salida.articulos);
const filas = A.flatMap((x) => x.propias.flatMap((s) => s.filas));
const columnas = filas.flatMap((f) => f.columnas);
const modulos = columnas.flatMap((c) => c.modulos);

const cuentaPor = (arr, f) => arr.reduce((o, x) => { const k = f(x); o[k] = (o[k] ?? 0) + 1; return o; }, {});
const uniq = (arr) => [...new Set(arr)];

/** Varianza entre las 6 instancias de una propiedad del CASCARÓN (lectura plantillada). */
const varTb = (f) => uniq(A.map((x) => JSON.stringify(f(x))));

salida.veredicto = {
  ancho: ANCHO,
  /* ── capa `_tb_`: lectura PLANTILLADA — lo que no varía entre instancias
   *    lo fijó quien construyó la plantilla. ────────────────────────────── */
  cascaron: {
    nSecciones: varTb((x) => x.cascaron.nSecciones),
    cabeceraAlto: varTb((x) => x.cascaron.cabecera?.rect.h),
    filaAncho: varTb((x) => x.cascaron.fila?.rect.w),
    barraAncho: varTb((x) => x.cascaron.barraLateral?.rect.w),
    contenidoAncho: varTb((x) => x.cascaron.contenido?.rect.w),
    canal: varTb((x) => x.cascaron.barraLateral?.ritmo?.marginRight),
    cuerpoRitmo: varTb((x) => x.cascaron.cuerpo?.ritmo),
    widgets: varTb((x) => x.cascaron.barraLateral?.widgets),
    h1Oculto: A.filter((x) => x.h1 && !x.h1.renderizado).length,
    h1Texto: uniq(A.map((x) => x.h1?.texto)),
  },
  /* ── capa propia: lectura de BUILDER ──────────────────────────────────── */
  cuerpo: {
    seccionesPorArticulo: A.map((x) => x.propias.length),
    filas: filas.length,
    filasOcultas: filas.filter((f) => !f.renderizada).length,
    filasPorNColumnas: cuentaPor(filas.filter((f) => f.renderizada), (f) => `${f.nColumnas} col`),
    repartos: cuentaPor(filas.filter((f) => f.renderizada), (f) => f.reparto),
    columnasPorTipo: cuentaPor(columnas.filter((c) => c.renderizada), (c) => c.tipo),
    modulos: modulos.length,
    modulosPorKind: cuentaPor(modulos, (m) => m.kind),
    /* Test B sobre el ritmo: ¿varía entre hermanos de la misma página? */
    variaEntreHermanos: {
      seccionPt: uniq(A.flatMap((x) => x.propias.map((s) => s.ritmo.paddingTop))),
      seccionPb: uniq(A.flatMap((x) => x.propias.map((s) => s.ritmo.paddingBottom))),
      filaPt: uniq(filas.filter((f) => f.renderizada).map((f) => f.ritmo.paddingTop)),
      filaPb: uniq(filas.filter((f) => f.renderizada).map((f) => f.ritmo.paddingBottom)),
      moduloMb: uniq(modulos.filter((m) => m.renderizado).map((m) => m.ritmo.marginBottom)),
      moduloAncho: uniq(modulos.filter((m) => m.renderizado).map((m) => m.caja.width)),
    },
    estiloInline: {
      secciones: A.flatMap((x) => x.propias.map((s) => s.estiloInline)).filter(Boolean),
      filas: filas.map((f) => f.estiloInline).filter(Boolean),
      modulos: modulos.map((m) => m.estiloInline).filter(Boolean),
    },
  },
};

const v = salida.veredicto;
console.log(`\n═══ SPEC @${ANCHO} ═══`);
console.log(`  CASCARÓN (lectura plantillada — varianza entre las 6)`);
for (const [k, val] of Object.entries(v.cascaron))
  console.log(`    ${k.padEnd(18)} ${Array.isArray(val) ? `${val.length} valor(es): ${val.map((x) => String(x).slice(0, 70)).join(" | ").slice(0, 150)}` : val}`);
console.log(`  CUERPO (lectura de builder)`);
console.log(`    secciones/artículo ${v.cuerpo.seccionesPorArticulo.join(" · ")}`);
console.log(`    filas              ${v.cuerpo.filas} (${v.cuerpo.filasOcultas} ocultas) · ${Object.entries(v.cuerpo.filasPorNColumnas).map(([k, n]) => `${k}×${n}`).join(" · ")}`);
console.log(`    repartos           ${Object.entries(v.cuerpo.repartos).map(([k, n]) => `${k}×${n}`).join(" · ")}`);
console.log(`    columnas por tipo  ${Object.entries(v.cuerpo.columnasPorTipo).map(([k, n]) => `${k.replace("et_pb_column_", "")}×${n}`).join(" · ")}`);
console.log(`    módulos            ${v.cuerpo.modulos} · ${Object.entries(v.cuerpo.modulosPorKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join(" · ")}`);
console.log(`    test B · ritmo     sección pt ${v.cuerpo.variaEntreHermanos.seccionPt.join("/")} · pb ${v.cuerpo.variaEntreHermanos.seccionPb.join("/")}`);
console.log(`                       fila pt ${v.cuerpo.variaEntreHermanos.filaPt.join("/")} · pb ${v.cuerpo.variaEntreHermanos.filaPb.join("/")}`);
console.log(`                       módulo mb ${v.cuerpo.variaEntreHermanos.moduloMb.length} valores: ${v.cuerpo.variaEntreHermanos.moduloMb.join(" · ")}`);
console.log(`                       módulo ancho ${v.cuerpo.variaEntreHermanos.moduloAncho.length} valores`);
console.log(`    estilo en línea    secciones ${v.cuerpo.estiloInline.secciones.length} · filas ${v.cuerpo.estiloInline.filas.length} · módulos ${v.cuerpo.estiloInline.modulos.length}`);

const muertos = censo.informe();
w(`medidas/kb-spec-${ANCHO}.json`, salida);
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
