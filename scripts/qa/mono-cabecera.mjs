/**
 * ¿La cabecera, el hero y el slider del MONOGRÁFICO son los mismos que los del
 * arquetipo SECTOR, o solo se parecen? (decisión (b) del HANDOFF).
 *
 * Compara **original contra original** —EDAR y Petróleo contra dos sectores de
 * plantilla clásica— en la misma corrida y el mismo ancho, que es la única forma
 * de que la respuesta no dependa de la spec escrita hace dos tandas.
 *
 * Mide además la TIPOGRAFÍA del cuerpo (h2/h3/h4/p/li y celdas de tabla) y el
 * módulo de imagen de 22px que abre casi todas las columnas del monográfico.
 *
 * Uso: node mono-cabecera.mjs [ancho]
 * Salida congelada: scripts/qa/medidas/mono-cabecera-<ancho>.json
 */
import { Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const PAGINAS = [
  ["edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["petroleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
  ["urbano", "calidad-del-aire-en-las-ciudades"],
  ["investigacion", "estudio-de-la-contaminacion-atmosferica"],
];

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const { browser } = await launch();
const todo = {};

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "mono-cabecera", unidad: "páginas", minimo: PAGINAS.length, porPaginas: true });

for (const [nombre, slug] of PAGINAS) {
  try {
    const { page } = await openPage(
      browser,
      `https://kunakair.com/es/sectores/${slug}/`,
      { width, height: mobile ? 844 : 900, mobile },
    );
    await settle(page);
    todo[nombre] = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const box = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: r(b.x), y: r(b.y + window.scrollY), w: r(b.width), h: r(b.height) };
      };
      const tipo = (el) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          fs: s.fontSize,
          lh: s.lineHeight,
          fw: s.fontWeight,
          color: s.color,
          pad: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          mb: s.marginBottom,
          h: r(el.getBoundingClientRect().height),
          txt: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44),
        };
      };
      const rit = (el) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          mt: s.marginTop,
          pt: s.paddingTop,
          pb: s.paddingBottom,
          h: r(el.getBoundingClientRect().height),
        };
      };

      const secs = [...document.querySelectorAll(".et_pb_section")];
      const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
      const iMigas = secs.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
      const secCab = secs.slice(0, iMigas).find((s) => s.querySelector("h1"));
      const secHero = secs[iMigas + 1];
      const secSlider = secs.find((s) => s.classList.contains("et_pb_fullwidth_section"));

      // ── cabecera de foto: kicker + h1 sobre la foto a sangre ──────────────
      const h1 = document.querySelector("h1");
      const kicker = secCab?.querySelector("h2, h3, .et_pb_text_inner > *:not(h1)");
      const cabImg = secCab
        ? getComputedStyle(secCab).backgroundImage.match(/url\("([^"]+)"\)/)?.[1] ||
          secCab.querySelector("img")?.currentSrc
        : null;

      // ── hero 1/2 + 1/2 ────────────────────────────────────────────────────
      const heroFila = secHero?.querySelector(".et_pb_row");
      const heroCols = [...(secHero?.querySelectorAll(".et_pb_row > .et_pb_column") || [])];
      const heroH2 = secHero?.querySelector("h2");
      const heroSpan = heroH2?.querySelector("span[style*=color]");

      // ── slider de ancho completo ──────────────────────────────────────────
      const slides = [...(secSlider?.querySelectorAll(".et_pb_slide") || [])];

      // ── tipografía del cuerpo (primer ejemplar de cada cosa) ──────────────
      const iSlider = secs.indexOf(secSlider);
      const cuerpo = secs.slice(iMigas + 2, iSlider);
      const q = (sel) => {
        for (const s of cuerpo) {
          const el = s.querySelector(sel);
          if (el) return el;
        }
        return null;
      };
      // el módulo de imagen de 22px que abre las columnas
      const punteados = cuerpo
        .flatMap((s) => [...s.querySelectorAll(".et_pb_image")])
        .filter((m) => Math.round(m.getBoundingClientRect().height) <= 30);
      const punt = punteados[0]?.querySelector("img");

      const tabla = q("table");

      return {
        docH: r(document.body.scrollHeight),
        cabecera: {
          ...rit(secCab),
          clases: secCab ? [...secCab.classList].join(" ") : null,
          img: cabImg,
          fila: box(secCab?.querySelector(".et_pb_row")),
          kicker: tipo(kicker),
          h1: { ...tipo(h1), ...box(h1) },
        },
        hero: {
          ...rit(secHero),
          fila: { ...box(heroFila), ...rit(heroFila) },
          cols: heroCols.map((c) => ({
            clases: [...c.classList].filter((x) => /column_\d_\d|column_\d_\d+/.test(x)).join(" "),
            ...box(c),
            mods: [...c.querySelectorAll(":scope > .et_pb_module")].map((m) => ({
              clases: [...m.classList].filter((x) => /^et_pb_(text|image|button|blurb|code)/.test(x)).join(" "),
              h: r(m.getBoundingClientRect().height),
              mb: getComputedStyle(m).marginBottom,
              txt: (m.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34),
            })),
          })),
          h2: tipo(heroH2),
          h2color: heroSpan ? getComputedStyle(heroSpan).color : null,
        },
        slider: {
          ...rit(secSlider),
          n: slides.length,
          slide0: box(slides[0]),
          h2: tipo(secSlider?.querySelector(".et_pb_slide_title, .et_pb_slide_description h2")),
        },
        tipografia: {
          h2: tipo(q("h2")),
          h3: tipo(q("h3")),
          h4: tipo(q("h4")),
          p: tipo(q(".et_pb_text_inner p")),
          li: tipo(q(".et_pb_text_inner li")),
          ul: tipo(q(".et_pb_text_inner ul")),
        },
        punteado: punt
          ? {
              src: punt.currentSrc,
              ...box(punt),
              modulo: box(punteados[0]),
              align: getComputedStyle(punteados[0]).textAlign,
              mb: getComputedStyle(punteados[0]).marginBottom,
              n: punteados.length,
            }
          : { n: 0 },
        tabla: tabla
          ? {
              ...box(tabla),
              layout: getComputedStyle(tabla).tableLayout,
              borderCollapse: getComputedStyle(tabla).borderCollapse,
              wrap: box(tabla.parentElement),
              wrapOverflow: getComputedStyle(tabla.parentElement).overflowX,
              th: [...tabla.querySelectorAll("th")].map((c) => ({
                ...box(c),
                ...tipo(c),
                bg: getComputedStyle(c).backgroundColor,
                border: getComputedStyle(c).borderBottomWidth + " " + getComputedStyle(c).borderBottomColor,
                inner: c.firstElementChild?.tagName || null,
              })),
              td0: [...(tabla.tBodies[0]?.rows[0]?.cells || [])].map((c) => ({
                ...box(c),
                ...tipo(c),
                bg: getComputedStyle(c).backgroundColor,
              })),
              filas: [...(tabla.tBodies[0]?.rows || [])].map((tr) => ({
                h: r(tr.getBoundingClientRect().height),
                celdas: [...tr.cells].map((c) => (c.textContent || "").replace(/\s+/g, " ").trim()),
              })),
            }
          : null,
      };
    });
    await page.close();
  } catch (e) {
    todo[nombre] = { error: String(e).slice(0, 200) };
  }
}

w(`mono-cabecera-${width}.json`, todo);

const linea = (k, o) => console.log(`  ${k.padEnd(12)} ${JSON.stringify(o)}`);
for (const [n, d] of Object.entries(todo)) {
  console.log(`\n═══ ${n} @${width}   docH ${d.docH}`);
  if (d.error) { console.log("  ", d.error); continue; }
  linea("cabecera", { mt: d.cabecera.mt, pt: d.cabecera.pt, pb: d.cabecera.pb, h: d.cabecera.h, fila: d.cabecera.fila });
  linea("kicker", d.cabecera.kicker);
  linea("h1", d.cabecera.h1);
  linea("hero", { mt: d.hero.mt, pt: d.hero.pt, pb: d.hero.pb, h: d.hero.h });
  linea("hero.fila", d.hero.fila);
  d.hero.cols.forEach((c, i) => linea(`hero.col${i}`, { clases: c.clases, w: c.w, h: c.h, mods: c.mods }));
  linea("hero.h2", { ...d.hero.h2, color: d.hero.h2color });
  linea("slider", { mt: d.slider.mt, pt: d.slider.pt, pb: d.slider.pb, h: d.slider.h, n: d.slider.n, slide0: d.slider.slide0 });
  linea("slider.h2", d.slider.h2);
  for (const [k, v] of Object.entries(d.tipografia)) linea("tipo." + k, v);
  linea("punteado", d.punteado);
  if (d.tabla) {
    linea("tabla", { w: d.tabla.w, h: d.tabla.h, layout: d.tabla.layout, wrapOverflow: d.tabla.wrapOverflow, wrap: d.tabla.wrap });
    d.tabla.th.forEach((c, i) => linea(`  th${i}`, c));
    d.tabla.td0.forEach((c, i) => linea(`  td${i}`, c));
    d.tabla.filas.forEach((f, i) => console.log(`   fila${i} h${f.h}  ${JSON.stringify(f.celdas)}`));
  }
}

await browser.close();
