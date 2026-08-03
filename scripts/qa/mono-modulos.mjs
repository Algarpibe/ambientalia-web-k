/**
 * Recon del arquetipo MONOGRÁFICO TÉCNICO: el árbol
 * sección → fila → columna → MÓDULO del cuerpo, con las clases Divi reales.
 *
 * Por qué hace falta otra sonda y no vale `tree-todos.mjs`: aquélla se para en
 * la FILA y adivina el tipo de bloque por una huella ("lleva img y pocos p").
 * En estas dos páginas esa huella etiqueta como `claimConFoto` 13 filas que no
 * lo son (§2.1 del PAGE_TOPOLOGY). Para decidir si la sección editorial es UN
 * tipo con variantes o varios tipos, hay que ver los MÓDULOS: sus clases Divi,
 * su esqueleto de etiquetas y el reparto de columnas.
 *
 * Uso: node mono-modulos.mjs [ancho]      (1440 por defecto; ≤500 → móvil 390)
 * Salida congelada: scripts/qa/medidas/mono-modulos-<ancho>.json
 */
import { Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const PAGINAS = [
  ["edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["petroleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
  // control: un sector de plantilla clásica, para leer los dos árboles juntos
  ["urbano", "calidad-del-aire-en-las-ciudades"],
];

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const { browser } = await launch();
const todo = {};

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "mono-modulos", unidad: "páginas", minimo: PAGINAS.length, porPaginas: true });

for (const [nombre, slug] of PAGINAS) {
  try {
    const { page } = await openPage(
      browser,
      `https://kunakair.com/es/sectores/${slug}/`,
      { width, height: mobile ? 844 : 900, mobile },
    );
    await settle(page);
    const out = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const txt = (el, n = 60) =>
        (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
      /** Clases Divi que dicen QUÉ es el módulo (sin las de estado ni las _N). */
      const clasesUtiles = (el) =>
        [...el.classList]
          .filter(
            (c) =>
              !/^et_pb_(module|css_mix_blend|text_align|bg_layout)/.test(c) &&
              !/^et_animated|^et-waypoint|^et_had_animation/.test(c),
          )
          .join(" ");
      /** Esqueleto de etiquetas: qué pinta el módulo, en orden y con repeticiones. */
      const esqueleto = (el) => {
        const tags = [...el.querySelectorAll("h1,h2,h3,h4,h5,p,ul,ol,table,img,a.et_pb_button,blockquote")]
          .map((n) => (n.tagName === "A" ? "btn" : n.tagName.toLowerCase()));
        const out = [];
        for (const t of tags) {
          const last = out[out.length - 1];
          if (last && last.t === t) last.n++;
          else out.push({ t, n: 1 });
        }
        return out.map(({ t, n }) => (n > 1 ? `${t}×${n}` : t)).join(" ");
      };

      const sinEspacios = (el) => (el.textContent || "").replace(/\s+/g, "");
      const secs = [...document.querySelectorAll(".et_pb_section")];
      const iMigas = secs.findIndex((s) => sinEspacios(s).startsWith("InicioSectores"));
      const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));

      return secs.slice(iMigas + 2, iSlider).map((sec) => {
        const s = getComputedStyle(sec);
        return {
          clases: clasesUtiles(sec),
          h: r(sec.getBoundingClientRect().height),
          mt: s.marginTop,
          pt: s.paddingTop,
          pb: s.paddingBottom,
          filas: [...sec.querySelectorAll(":scope > .et_pb_row, :scope > .et_pb_row_inner")].map((f) => {
            const fs = getComputedStyle(f);
            const cols = [...f.querySelectorAll(":scope > .et_pb_column")];
            return {
              clases: clasesUtiles(f),
              pt: fs.paddingTop,
              pb: fs.paddingBottom,
              w: r(f.getBoundingClientRect().width),
              h: r(f.getBoundingClientRect().height),
              cols: cols.map((c) => {
                const cs = getComputedStyle(c);
                return {
                  clases: clasesUtiles(c),
                  w: r(c.getBoundingClientRect().width),
                  h: r(c.getBoundingClientRect().height),
                  mr: cs.marginRight,
                  mods: [...c.querySelectorAll(":scope > .et_pb_module")].map((m) => {
                    const ms = getComputedStyle(m);
                    const tabla = m.querySelector("table");
                    return {
                      clases: clasesUtiles(m),
                      esq: esqueleto(m),
                      h: r(m.getBoundingClientRect().height),
                      mb: ms.marginBottom,
                      mt: ms.marginTop,
                      pad: `${ms.paddingTop} ${ms.paddingRight} ${ms.paddingBottom} ${ms.paddingLeft}`,
                      ...(tabla
                        ? {
                            tabla: {
                              filas: tabla.rows.length,
                              cols: [...tabla.rows].map((tr) => tr.cells.length),
                              thead: !!tabla.tHead,
                              th: tabla.querySelectorAll("th").length,
                              cab: [...(tabla.rows[0]?.cells || [])].map((c) => txt(c, 40)),
                            },
                          }
                        : {}),
                      txt: txt(m),
                    };
                  }),
                };
              }),
            };
          }),
        };
      });
    });
    todo[nombre] = out;
    await page.close();
  } catch (e) {
    todo[nombre] = { error: String(e).slice(0, 160) };
  }
}

w(`medidas/mono-modulos-${width}.json`, todo);

for (const [nombre, secs] of Object.entries(todo)) {
  console.log(`\n═══ ${nombre} @${width}`);
  if (!Array.isArray(secs)) {
    console.log("   ", secs.error);
    continue;
  }
  secs.forEach((s, i) => {
    console.log(
      `\nSEC ${i}  h ${s.h}  mt ${s.mt} pt ${s.pt} pb ${s.pb}   [${s.clases}]`,
    );
    s.filas.forEach((f, j) => {
      console.log(
        `  fila ${j}  pt ${f.pt} pb ${f.pb}  w ${f.w} h ${f.h}  cols ${f.cols.length}  [${f.clases}]`,
      );
      f.cols.forEach((c, k) => {
        console.log(`    col ${k}  w ${c.w} h ${c.h} mr ${c.mr}  [${c.clases}]`);
        c.mods.forEach((m) => {
          console.log(
            `      · ${String(m.esq || "—").padEnd(22)} h ${String(m.h).padStart(7)} mb ${m.mb.padStart(7)} pad ${m.pad}  [${m.clases}]`,
          );
          if (m.tabla) console.log(`          TABLA ${JSON.stringify(m.tabla)}`);
          console.log(`          "${m.txt}"`);
        });
      });
    });
  });
}

await browser.close();
