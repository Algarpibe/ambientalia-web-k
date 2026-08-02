/**
 * COMPORTAMIENTO DEL ARQUETIPO A — lo que no se ve en el HTML estático.
 * Uso: npm run qa:a-behaviors -- [ancho]
 *
 * Fase 1 del flujo (`CLAUDE.md` §Flujo de trabajo): clasificar cada interacción
 * en scroll / click / tiempo. Aquí interesan cuatro cosas concretas que el censo
 * no puede ver porque son estado y no marcado:
 *
 *   · el índice del artículo (`sidebar`): ¿es sticky? ¿sus enlaces son anclas?
 *   · la duplicidad móvil/desktop del índice: ¿son dos módulos o uno responsive?
 *   · los `iframe`: ¿cargan perezosos? ¿de qué orígenes?
 *   · el bloque de relacionados: ¿es estático o pide datos?
 */
import { Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const URL_BLOG = "https://kunakair.com/es/contaminacion-por-metano/";

const ev = new Evaluadas({ nombre: "a-behaviors", unidad: "páginas", minimo: 1 });
const { browser } = await launch();
const { page } = await openPage(browser, URL_BLOG, {
  width,
  height: mobile ? 844 : 900,
  mobile,
});
await settle(page);

const d = await page.evaluate(() => {
  const cls = (el) => (typeof el?.className === "string" ? el.className : "");
  const main = document.querySelector("#main-content");
  const sidebars = [...main.querySelectorAll("[class*='et_pb_sidebar']")].map((el) => {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const tok = (cls(el).match(/et_pb_sidebar_(\d+)_tb_body/) || [])[1];
    const enlaces = [...el.querySelectorAll("a")];
    return {
      id: `sidebar#${tok ?? "?"}`,
      visible: b.width > 0 && b.height > 0,
      position: s.position,
      top: s.top,
      w: Math.round(b.width),
      h: Math.round(b.height),
      nEnlaces: enlaces.length,
      // ¿son anclas al propio documento? eso lo hace un índice de contenidos
      anclas: enlaces.filter((a) => (a.getAttribute("href") || "").startsWith("#")).length,
      muestraAncla: enlaces.find((a) => (a.getAttribute("href") || "").startsWith("#"))?.getAttribute("href"),
    };
  });

  const pc = main.querySelector("[class*='et_pb_post_content']");
  const iframes = [...(pc?.querySelectorAll("iframe") || [])].map((f) => ({
    loading: f.getAttribute("loading"),
    origen: (() => {
      try {
        return new URL(f.src, location.href).host;
      } catch {
        return f.src?.slice(0, 40);
      }
    })(),
    w: Math.round(f.getBoundingClientRect().width),
    h: Math.round(f.getBoundingClientRect().height),
  }));

  /** ¿A qué apuntan los encabezados del blob? (anclas del índice) */
  const headings = [...(pc?.querySelectorAll("h2,h3,h4") || [])].map((h) => ({
    tag: h.tagName,
    id: h.id || null,
    txt: (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
  }));

  const relacionados = main.querySelector("[class*='et_pb_blog']");
  return {
    sidebars,
    iframes,
    headingsConId: headings.filter((h) => h.id).length,
    headingsTotal: headings.length,
    primerosHeadings: headings.slice(0, 4),
    relacionados: relacionados
      ? {
          nArticulos: relacionados.querySelectorAll("article").length,
          clases: cls(relacionados).split(/\s+/).filter((c) => /blog|masonry|grid|fullwidth/.test(c)),
        }
      : null,
    /**
     * ⚠ **`loading` NO se mide aquí.** `settle()` de `lib.mjs` pone
     * `img.loading = "eager"` en todas antes de medir, así que cualquier conteo
     * de perezosas sale **0 por construcción** — un dato falso, no un hallazgo.
     * Se lee del HTML crudo, que es donde vive el atributo.
     */
    imgTotal: pc?.querySelectorAll("img").length || 0,
  };
});
ev.ok();
await page.close();
await browser.close();

console.log(`\n════════ COMPORTAMIENTO · arquetipo A @${width} ════════`);
console.log(`\n█ Índice del artículo (módulos sidebar)`);
for (const s of d.sidebars)
  console.log(
    `   ${s.id}  visible ${s.visible ? "sí" : "NO"}  position ${s.position} (top ${s.top})` +
      `  ${s.w}×${s.h}  enlaces ${s.nEnlaces} de los cuales anclas ${s.anclas}` +
      (s.muestraAncla ? `  ej ${s.muestraAncla}` : ""),
  );
console.log(
  `\n█ Encabezados del blob con \`id\`: ${d.headingsConId} de ${d.headingsTotal}` +
    `  → ${d.headingsConId ? "el índice enlaza a anclas generadas" : "sin anclas"}`,
);
d.primerosHeadings.forEach((h) => console.log(`   ${h.tag} #${h.id ?? "(sin id)"} | ${h.txt}`));
console.log(`\n█ iframes del blob: ${d.iframes.length}`);
d.iframes.forEach((f) => console.log(`   ${f.origen}  loading=${f.loading ?? "(sin atributo)"}  ${f.w}×${f.h}`));
console.log(`\n█ imágenes en el blob: ${d.imgTotal}  (el atributo \`loading\` NO se mide aquí: settle() lo pisa)`);
console.log(`█ relacionados: ${d.relacionados ? JSON.stringify(d.relacionados) : "no hay"}`);

w(`medidas/a-behaviors-${width}.json`, d);
