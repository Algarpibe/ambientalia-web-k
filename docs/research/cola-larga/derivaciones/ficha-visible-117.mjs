/* ═════════════════════════════════════════════════════════════════════════
 *  ¿CUÁL DE LAS DOS FICHAS SE VE, Y A QUÉ ANCHO? — 117.ª · ESCALÓN 3
 * ═════════════════════════════════════════════════════════════════════════
 *
 * POR QUÉ ESTA DERIVACIÓN EXISTE
 *   El comparador midió `document.querySelector(".ficha-autor-revisor")` —la
 *   PRIMERA— y salió `caja {w:0, h:0}` **a 1440** y `{335.39, 115}` a 390. Un
 *   elemento con caja 0 no es un elemento pequeño: es un elemento **sin caja**,
 *   y §*getComputedStyle sobre un elemento sin caja NO resuelve los porcentajes
 *   contra nada — devuelve ceros, y esos ceros entran en una distribución como
 *   si fueran dato*.
 *
 *   Y hay una segunda señal en la misma medida: el `border-radius` del `<img>`
 *   computa **37.0577%** donde la hoja declara **50%**. Un porcentaje que no es
 *   el declarado es la firma de que se está resolviendo contra una caja que no
 *   es la que uno cree.
 *
 * LA PREGUNTA, ENTONCES, NO ES «¿cómo es la ficha?» SINO **«¿CUÁL?»**
 *   El documento trae **2** fichas con el MISMO HTML (152 de 152, medido). Si
 *   una se pinta a un ancho y la otra al otro, el modelo del clon **no** es «una
 *   ficha»: es una ficha con dos emplazamientos, y transcribir sólo uno deja la
 *   mitad de los anchos sin pintar.
 *
 * ⚠ Es §*un recuento de NODOS y un censo de LO QUE SE VE son dos medidas
 *   distintas* — con el añadido de que aquí la de nodos ya estaba hecha y
 *   **decía que eran idénticas**, que es cierto del HTML y no de la caja.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { launch } from "../../../../scripts/qa/lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const BLOG = join(RAIZ, "corpus", "entradas-blog");
const CSS = join(RAIZ, "corpus", "css");
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

function conHojasLocales(html) {
  let resueltas = 0;
  const out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    resueltas++;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  return { html: out, resueltas };
}

const FICHERO = "calidad-del-aire-en-las-comunidades.html"; // una de las 2 de DOS papeles
const crudo = readFileSync(join(BLOG, FICHERO), "utf8");
const { html, resueltas } = conHojasLocales(crudo);

say("═══ ¿CUÁL DE LAS DOS FICHAS SE VE? · 117.ª ESCALÓN 3 ═══");
say("");
say(`  fichero: ${FICHERO} · hojas resueltas: ${resueltas}`);

const { browser } = await launch();
const salida = {};
try {
  for (const ancho of [1440, 390]) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (r) => (r.url().startsWith("file://") || r.url() === "about:blank" ? r.continue() : r.abort()));
    await page.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1, isMobile: ancho < 500 });
    await page.goto(pathToFileURL(join(BLOG, FICHERO)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 120_000 });
    /* ⚠ **LAS PEREZOSAS A `eager` ANTES DE MEDIR, y no es higiene.**
     * La v1 de esta derivación no lo hacía y midió el `<img>` de la ficha de
     * 1440 como `br=0% bw=0px`, contra el `br=50% bw=3px` que da el comparador
     * —que sí lo hace— **sobre el mismo módulo y el mismo ancho**. `CLAUDE.md`
     * lo tiene escrito en §Notas de método y `f33-geo` lo pagó con un diff de
     * veredictos «confinado enteramente a `image`». Dos medidas mías que se
     * contradicen se dirimen arreglando el instrumento, no eligiendo una. */
    await page.evaluate(() => { for (const i of document.querySelectorAll("img[loading]")) i.loading = "eager"; });

    const r = await page.evaluate(() => {
      const todas = [...document.querySelectorAll(".ficha-autor-revisor")];
      return todas.map((el, i) => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        /* La CADENA de ancestros hasta el body, con quién esconde a quién: un
         * elemento sin caja casi nunca se esconde a sí mismo. */
        const cadena = [];
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const c = getComputedStyle(n);
          const rr = n.getBoundingClientRect();
          if (c.display === "none" || c.visibility === "hidden" || (rr.width === 0 && rr.height === 0))
            cadena.push(`${n.tagName.toLowerCase()}.${(n.className || "").split(/\s+/).filter(Boolean).slice(0, 2).join(".")} [display:${c.display} vis:${c.visibility} ${rr.width.toFixed(0)}x${rr.height.toFixed(0)}]`);
        }
        const img = el.querySelector("img");
        /* QUIÉN es su módulo: en Divi la piel se compila por módulo con su
         * ORDINAL (`et_pb_text_7`), así que dos fichas con el MISMO HTML pueden
         * tener pieles distintas y el discriminador está en el ancestro, no en
         * ellas. §*el veredicto lo da la cascada*. */
        let modulo = null, seccion = null;
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const cl = n.className || "";
          if (!modulo && /\bet_pb_text_\d+/.test(cl)) modulo = (cl.match(/et_pb_text_\d+(_tb_body)?/) || [])[0];
          if (!seccion && /\bet_pb_section_\d+/.test(cl)) seccion = (cl.match(/et_pb_section_\d+(_tb_body)?/) || [])[0];
        }
        return {
          i, modulo, seccion,
          w: +rect.width.toFixed(2), h: +rect.height.toFixed(2),
          display: cs.display,
          conCaja: rect.width > 0 && rect.height > 0,
          img: img ? { w: +img.getBoundingClientRect().width.toFixed(2), h: +img.getBoundingClientRect().height.toFixed(2), br: getComputedStyle(img).borderRadius, bw: getComputedStyle(img).borderTopWidth } : null,
          sinCaja: cadena,
        };
      });
    });
    /* ── CRUCE DE LOS DOS CAMINOS, EN LA MISMA PÁGINA ────────────────────
     * La derivación lee `ficha.querySelector("img")`; el comparador recorre
     * `:scope > div` y lee el `img` de cada hueco. A 1440 dieron `br=0%/bw=0px`
     * y `br=50%/bw=3px` **del mismo módulo**, y una contradicción entre dos
     * instrumentos propios no se resuelve eligiendo: se mide en la misma
     * página, que es la única forma de quitar los confundidos. */
    const cruce = await page.evaluate(() => {
      const vis = [...document.querySelectorAll(".ficha-autor-revisor")]
        .find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      if (!vis) return null;
      const via = (img) => img ? { w: +img.getBoundingClientRect().width.toFixed(2), br: getComputedStyle(img).borderRadius, bw: getComputedStyle(img).borderTopWidth } : null;
      const todos = [...vis.querySelectorAll("img")];
      return {
        nImgs: todos.length,
        viaFicha: via(vis.querySelector("img")),
        viaHueco: via([...vis.querySelectorAll(":scope > div")].map((d) => d.querySelector("img")).find(Boolean)),
        cadaUno: todos.map((im) => ({ cls: im.className || "(sin clase)", ...via(im) })),
      };
    });
    say(`     CRUCE @${ancho}: imgs en la ficha visible = ${cruce?.nImgs}`);
    say(`        vía ficha.querySelector: ${JSON.stringify(cruce?.viaFicha)}`);
    say(`        vía hueco (comparador):  ${JSON.stringify(cruce?.viaHueco)}`);
    if (cruce) for (const c of cruce.cadaUno) say(`        · ${JSON.stringify(c)}`);
    r.cruce = cruce;

    salida[ancho] = r;
    say("");
    say(`  ── ancho ${ancho} ──  fichas en el DOM: **${r.length}** · CON CAJA: **${r.filter((x) => x.conCaja).length}**`);
    for (const f of r) {
      say(`     #${f.i}  ${f.conCaja ? "CON CAJA" : "sin caja"}  ${f.w}x${f.h}  mod=${f.modulo} sec=${f.seccion}` +
          `  img: ${f.img ? `${f.img.w}x${f.img.h} br=${f.img.br} bw=${f.img.bw}` : "—"}`);
      if (!f.conCaja && f.sinCaja.length) say(`         quién lo esconde: ${f.sinCaja[f.sinCaja.length - 1]}`);
    }
    await page.close();
  }
} finally { await browser.close(); }

say("");
say("  ⇒ VEREDICTO");
for (const a of [1440, 390]) {
  const v = salida[a].map((x, i) => (x.conCaja ? i : null)).filter((x) => x !== null);
  say(`     a ${a}: se pinta la ficha #${v.join(", #") || "NINGUNA"} de ${salida[a].length}`);
}
const v1440 = salida[1440].findIndex((x) => x.conCaja);
const v390 = salida[390].findIndex((x) => x.conCaja);
say("");
say(`  ⇒ ${v1440 === v390
  ? `LA MISMA (#${v1440}) a los dos anchos: el modelo tiene UNA ficha y un solo emplazamiento.`
  : `**DISTINTAS**: #${v1440} a 1440 y #${v390} a 390. El clon necesita LOS DOS emplazamientos —\n     transcribir sólo uno deja un ancho sin pintar, y el otro ancho no lo vería.`}`);
say("");
say("  ⚠ Y ESO EXPLICA LOS CEROS DEL COMPARADOR: medía `querySelector`, o sea");
say("    SIEMPRE la #0, que a uno de los dos anchos no tiene caja. Los `w:0 h:0`");
say("    y el `border-radius: 37.0577%` no eran datos del original: eran lo que");
say("    devuelve `getComputedStyle` sobre un elemento sin caja.");

const { writeFileSync } = await import("node:fs");
writeFileSync(join(AQUI, "ficha-visible-117.log"), L.join("\n") + "\n");
writeFileSync(join(RAIZ, "scripts", "qa", "medidas", "ficha-visible-117.json"),
  JSON.stringify({ fecha: "2026-08-27", fichero: FICHERO, hojasResueltas: resueltas, porAncho: salida }, null, 2));
