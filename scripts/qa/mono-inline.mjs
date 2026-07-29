/**
 * ¿Dónde vive el estilo del cuerpo editorial: en el tema, en el módulo Divi, o
 * en atributos `style` que escribió quien editó el texto?
 *
 * Es la medida que decide (a): si los `<p>` y los `<li>` traen `style` inline,
 * el payload NO es texto plano y modelarlo como campos tipados tiene un coste
 * que hay que conocer ANTES de elegir. Vuelca, de cada módulo de texto del
 * cuerpo, el esqueleto de etiquetas **con sus atributos `style` y `class`**.
 *
 * Comprueba de paso si la <table> desborda el viewport a 390 (scroll horizontal
 * de página) — el mismo caso que las tablas de /accesorios.
 *
 * Uso: node mono-inline.mjs [ancho]
 * Salida congelada: scripts/qa/medidas/mono-inline-<ancho>.json
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const PAGINAS = [
  ["edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["petroleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
];

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const { browser } = await launch();
const todo = {};

for (const [nombre, slug] of PAGINAS) {
  const { page } = await openPage(
    browser,
    `https://kunakair.com/es/sectores/${slug}/`,
    { width, height: mobile ? 844 : 900, mobile },
  );
  await settle(page);
  todo[nombre] = await page.evaluate(() => {
    const r = (n) => Math.round(n * 100) / 100;
    const secs = [...document.querySelectorAll(".et_pb_section")];
    const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
    const iMigas = secs.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
    const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
    const cuerpo = secs.slice(iMigas + 2, iSlider);

    const marca = (el) =>
      [...el.children].map((n) => {
        const st = n.getAttribute("style");
        const cl = n.getAttribute("class");
        const hijos = [...n.querySelectorAll("[style]")].map(
          (h) => `${h.tagName.toLowerCase()}[${h.getAttribute("style")}]`,
        );
        return (
          n.tagName.toLowerCase() +
          (st ? `{${st}}` : "") +
          (cl ? `.${cl}` : "") +
          (hijos.length ? ` ⟨${hijos.slice(0, 4).join(" ")}⟩` : "")
        );
      });

    const mods = cuerpo.flatMap((s, i) =>
      [...s.querySelectorAll(".et_pb_row")].flatMap((f, j) =>
        [...f.querySelectorAll(":scope > .et_pb_column")].flatMap((c, k) =>
          [...c.querySelectorAll(":scope > .et_pb_text")].map((m) => {
            const inner = m.querySelector(".et_pb_text_inner");
            const ms = getComputedStyle(m);
            return {
              id: `S${i}F${j}C${k}`,
              clase: [...m.classList].find((x) => /^et_pb_text_\d+$/.test(x)),
              mb: ms.marginBottom,
              pb: ms.paddingBottom,
              hijos: inner ? marca(inner) : [],
              txt: (m.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
            };
          }),
        ),
      ),
    );

    const tabla = document.querySelector(".et_pb_text_inner table");
    return {
      mods,
      overflow: {
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        bodyOverflowX: getComputedStyle(document.body).overflowX,
        htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
        tabla: tabla
          ? {
              w: r(tabla.getBoundingClientRect().width),
              right: r(tabla.getBoundingClientRect().right),
              padreW: r(tabla.parentElement.getBoundingClientRect().width),
              padreOverflow: getComputedStyle(tabla.parentElement).overflowX,
              minW: getComputedStyle(tabla).minWidth,
              html: tabla.outerHTML.slice(0, 300),
            }
          : null,
      },
    };
  });
  await page.close();
}

w(`mono-inline-${width}.json`, todo);

for (const [n, d] of Object.entries(todo)) {
  console.log(`\n═══ ${n} @${width}`);
  d.mods.forEach((m) =>
    console.log(
      `  ${m.id.padEnd(7)} ${String(m.clase).padEnd(15)} mb ${m.mb.padStart(10)} pb ${m.pb.padStart(6)}  "${m.txt}"\n      ${m.hijos.join("\n      ")}`,
    ),
  );
  console.log("  overflow:", JSON.stringify(d.overflow, null, 2).slice(0, 1400));
}

await browser.close();
