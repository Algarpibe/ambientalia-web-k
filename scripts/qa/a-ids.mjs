/**
 * A-SP9 — ¿los `id` de los encabezados los trae el CONTENIDO o los pone el TEMA?
 * Uso: npm run qa:a-ids            (necesita Chrome)
 *
 * ── Por qué existe: dos medidas del repo se contradecían ───────────────────
 *   `campo-rico.spec.md` §4:  «16 de 61 encabezados con id en la página medida»
 *   el piloto de CMS-0e:      «299 encabezados en 24 páginas, NINGUNO con id»
 *
 * Las dos no pueden ser ciertas a la vez, y dejarlas en pie es peor que
 * cualquiera de ellas. Pero **no difieren en una sola cosa, sino en dos**, y por
 * eso ninguna de las dos era comprobable contra la otra:
 *
 *   | | `campo-rico` §4 | piloto CMS-0e |
 *   | ÁMBITO  | el documento ENTERO | solo dentro de `post_content` |
 *   | MOMENTO | el DOM tras settle  | el HTML servido, crudo |
 *
 * Esta sonda mide **las cuatro casillas en la MISMA página**, que es la única
 * forma de saber cuál de las dos diferencias explica la contradicción — o si son
 * las dos. Es el principio de `CLAUDE.md` §«El NIVEL al que se mide» aplicado al
 * eje del tiempo: comparar dos medidas que difieren en dos variables no decide
 * ninguna.
 *
 * ── Qué decide ────────────────────────────────────────────────────────────
 * Si dentro de `post_content` hay `id` en el DOM y NO en el HTML servido, los
 * pone el JS del tema: **A-SP9 se cierra** («el tema los genera, el índice es
 * derivable») y **T6 pasa a regenerar, no conservar**.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, launch, openPage, QA, settle, w } from "./lib.mjs";

/* La página del spec, identificada por sus anclas en `a-behaviors-1440.json`:
 * es la que produjo el «16 de 61», y además está en la muestra de 24, así que es
 * exactamente donde las dos afirmaciones se cruzan.
 *
 * ⚠ No es `/es/metano/` —el término—, que es a donde apuntaba el parecido de los
 * nombres: ése da 6 de 18. La del spec es el POST. Los dos hablan de metano y
 * comparten el prefijo de las anclas; verificar cuál era costó una corrida. */
const PAGINA = process.env.PAGINA || "https://kunakair.com/es/contaminacion-por-metano/";

/* Y unas cuantas más, porque una sola página decide el caso pero no la clase:
 * se toman de la muestra adversaria ya congelada. */
const muestra = JSON.parse(readFileSync(join(QA, "medidas/a-muestra.json"), "utf8"));
const OTRAS = Object.values(muestra.formas)
  .flatMap((d) => d.muestra.map((m) => m.url))
  .filter((u) => u !== PAGINA)
  .slice(0, 7);

/* ─────────── la rebanada del censo, idéntica a a-censo/a-lexical ─────────── */

function interiorDiv(html, desdeApertura) {
  const finApertura = html.indexOf(">", desdeApertura);
  if (finApertura < 0) return null;
  const re = /<(\/?)div\b/gi;
  re.lastIndex = finApertura + 1;
  let nivel = 1;
  let m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(finApertura + 1, m.index);
  }
  return null;
}

function extraerPostContent(html) {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  if (i < 0) return null;
  return interiorDiv(html, i);
}

/** Encabezados de un blob de HTML crudo, por regex sobre la etiqueta de apertura. */
function headingsCrudos(blob) {
  const hs = [...blob.matchAll(/<h([1-6])\b([^>]*)>/gi)];
  const conId = hs.filter((m) => /\bid\s*=/i.test(m[2]));
  return {
    total: hs.length,
    conId: conId.length,
    ejemplos: conId.slice(0, 3).map((m) => (m[2].match(/\bid\s*=\s*"([^"]*)"/i) || [])[1] || ""),
  };
}

/* ═══════════════════════════════ recorrido ═══════════════════════════════ */

console.log(`\n════════ A-SP9 · ¿el \`id\` lo trae el contenido o lo pone el tema? ════════`);

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
/**
 * ⚠ **El mínimo era `1` y el universo de esta sonda está a la vista: recorre
 * `[PAGINA, ...OTRAS]`.** Escribir `1` decía «con que mire una, me vale», y lo
 * que la sonda **afirma** es un censo de anclas sobre las 8 páginas de la
 * muestra. Con `1`, siete fallos seguidos salían verdes.
 *
 * **Derivado, no escrito** (`CLAUDE.md` §sondas): si la muestra crece, el listón
 * sube solo, que es la diferencia entre un contrato y una copia desactualizada.
 */
const ev = new Evaluadas({ nombre: "a-ids", unidad: "páginas", minimo: 1 + OTRAS.length, porPaginas: true });

const { browser } = await launch();
const salida = {
  meta: {
    fecha: "2026-07-30",
    pregunta: "A-SP9: origen de los `id` de encabezado",
    ejes: "ÁMBITO (documento entero vs post_content) × MOMENTO (HTML servido vs DOM tras settle)",
    viewport: "1440x900 · DPR 1",
  },
  paginas: [],
};

for (const url of [PAGINA, ...OTRAS]) {
  const corto = url.replace("https://kunakair.com/es/", "").replace(/\/$/, "").slice(-52);
  try {
    /* ── 1 · el HTML SERVIDO, crudo ── */
    const html = await (await fetch(url, { redirect: "follow" })).text();
    const cuerpo = extraerPostContent(html);
    const servidoDoc = headingsCrudos(html);
    const servidoPost = cuerpo === null ? null : headingsCrudos(cuerpo);

    /* ── 2 · el DOM tras settle ── */
    const { page } = await openPage(browser, url, { width: 1440, height: 900 });
    await settle(page);
    const dom = await page.evaluate(() => {
      const cuenta = (raiz) => {
        if (!raiz) return null;
        const hs = [...raiz.querySelectorAll("h1,h2,h3,h4,h5,h6")];
        const conId = hs.filter((h) => h.id);
        return {
          total: hs.length,
          conId: conId.length,
          ejemplos: conId.slice(0, 3).map((h) => h.id),
        };
      };
      return {
        doc: cuenta(document),
        post: cuenta(document.querySelector(".et_pb_post_content")),
        // ¿hay índice, y a qué apunta? Es el consumidor de los `id`
        anclasIndice: [...document.querySelectorAll('a[href^="#"]')].length,
      };
    });
    await page.close();

    const p = { url, servidoDoc, servidoPost, dom };
    // El veredicto por página: los `id` de DENTRO del contenido, ¿existen ya en
    // el HTML servido o aparecen después?
    p.veredicto =
      servidoPost === null || dom.post === null
        ? "sin post_content"
        : servidoPost.conId === 0 && dom.post.conId > 0
          ? "LOS PONE EL TEMA"
          : servidoPost.conId > 0
            ? "vienen en el contenido"
            : "no hay id en ninguno de los dos";
    salida.paginas.push(p);

    console.log(`\n  ${corto}`);
    console.log(
      `    servido · doc  ${String(servidoDoc.conId).padStart(3)}/${String(servidoDoc.total).padEnd(3)} con id` +
        `   |  post_content ${servidoPost ? `${String(servidoPost.conId).padStart(3)}/${String(servidoPost.total).padEnd(3)}` : "  —"} con id`,
    );
    console.log(
      `    DOM     · doc  ${String(dom.doc.conId).padStart(3)}/${String(dom.doc.total).padEnd(3)} con id` +
        `   |  post_content ${dom.post ? `${String(dom.post.conId).padStart(3)}/${String(dom.post.total).padEnd(3)}` : "  —"} con id` +
        `   |  anclas «#» ${dom.anclasIndice}`,
    );
    console.log(`    → ${p.veredicto}`);
    if (dom.post && dom.post.ejemplos.length) console.log(`      p.ej. ${dom.post.ejemplos.join(" · ")}`);
  } catch (e) {
    salida.paginas.push({ url, error: String(e).slice(0, 200) });
    console.log(`  ⚠ ${corto}  ${String(e).slice(0, 120)}`);
  }
}

await browser.close();

/* ════════════════════════════════ informe ════════════════════════════════ */

const juzgadas = salida.paginas.filter((p) => !p.error && p.veredicto !== "sin post_content");
const tema = juzgadas.filter((p) => p.veredicto === "LOS PONE EL TEMA");
const contenido = juzgadas.filter((p) => p.veredicto === "vienen en el contenido");
const ninguno = juzgadas.filter((p) => p.veredicto === "no hay id en ninguno de los dos");

salida.resumen = {
  juzgadas: juzgadas.length,
  losPoneElTema: tema.length,
  vienenEnElContenido: contenido.length,
  sinIdEnNinguno: ninguno.length,
};

console.log(`\n════════ RESUMEN ════════`);
console.log(`  los pone el TEMA          ${tema.length}`);
console.log(`  vienen en el CONTENIDO    ${contenido.length}`);
console.log(`  sin id en ninguno         ${ninguno.length}`);
console.log(`  ── ${juzgadas.length} juzgadas`);

w("medidas/a-ids.json", salida);

/* Código 0 solo si la respuesta es UNÁNIME: la pregunta de A-SP9 es de origen,
 * y un corpus donde a veces los trae el contenido no se cierra con «se
 * regeneran». Si hay mezcla, hay que verla. */
const unanime = juzgadas.length > 0 && contenido.length === 0;
console.log(
  `\n${unanime ? "✅" : "❌"} ${unanime ? "ninguna página trae `id` en el contenido servido" : "MEZCLA: alguna página sí los trae en el contenido"}`,
);
process.exit(unanime ? 0 : 1);
