/**
 * RECON DEL ARQUETIPO `articulos-kb` — el árbol de módulos de las 6 instancias,
 * medido sobre la CAPTURA CONGELADA (`corpus/fase-3/`), no sobre el sitio vivo.
 * Uso: node scripts/qa/kb-recon.mjs        (npm run qa:kb-recon)
 *
 * ── Qué contesta, y por qué hacía falta ────────────────────────────────────
 * El recon del grupo D (2026-08-03) midió **qué kinds** hay —`blurb` ×36/×18/×18
 * y `gallery` ×2, los dos ausentes de `MonoModulo`— y con eso §2d.1 decidió la
 * colección. Lo que **no** midió es **qué CAMPOS tiene cada kind**, porque para
 * eso hay que construir y D2/D3 quedaron «sin objeto». Esa es exactamente la
 * incógnita que `PLAN-FASE-3.md` §F3-1 declara, y ésta es su medida.
 *
 * ── Sobre el HTML congelado, y con DOM de verdad ───────────────────────────
 * Se sirve el fichero por `file://` a Chrome headless y se recorre con
 * `querySelectorAll`. **No es la misma pregunta que un `getComputedStyle`**: el
 * píxel se mide contra el original vivo en la sonda comparadora; aquí se mide
 * ESTRUCTURA, que es lo que decide el content type, y la estructura está entera
 * en los bytes servidos.
 *
 * ── El discriminador plantilla/campo que aplica, y por qué ─────────────────
 * Régimen: el centro de ayuda es **híbrido** (`CLAUDE.md` §régimen, corrección
 * del grupo D): capa `_tb_` plantillada + secciones propias de builder. Esta
 * sonda sólo mira **las secciones propias**, o sea la capa de BUILDER, así que
 * el discriminador es el **test B** (varianza intra-página entre hermanos) más
 * la varianza entre las 6 instancias. Lo que varía es campo; lo que no varía en
 * las 6 **no queda probado como plantilla — queda SIN PROBAR**, y eso se dice.
 *
 * ── Guardas ────────────────────────────────────────────────────────────────
 * 1 · `Censo` sobre cada selector: uno que no case en NINGUNA de las 6 sale por
 *     error, nunca por cero (regla 4). Y todo selector discriminante declara su
 *     máximo: casar en el 100 % tampoco mide nada;
 * 2 · `Evaluadas` con el mínimo derivado del índice de la captura;
 * 3 · congela en `medidas/kb-recon.json`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, hoy, launch, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: el clon no la contamina

const RAIZ = join(QA, "../..");
const BASE = join(RAIZ, "corpus/fase-3");

/** Las 6 salen del índice de la captura, no de una lista a mano (regla 9). */
const indice = JSON.parse(readFileSync(join(BASE, "INDICE.json"), "utf8"));
const ARTICULOS = Object.entries(indice.paginas)
  .filter(([clave, p]) => clave.startsWith("articulos-kb:") && p.fichero && p.http === 200)
  .map(([clave, p]) => ({ ruta: clave.slice("articulos-kb:".length), fichero: join(BASE, p.fichero) }));

if (ARTICULOS.length !== 6)
  throw new Error(
    `el índice de la captura da ${ARTICULOS.length} artículos de KB y §2d.1 midió 6.\n` +
      `  Un número distinto no es un detalle: la colección se decidió sobre «6 instancias,\n` +
      `  1 sección propia las 6, varianza cero». Re-mide antes de construir.`,
  );

const { browser, userDataDir } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: "kb-recon", unidad: "artículos", minimo: ARTICULOS.length });

const salida = { meta: { fecha: hoy(), que: "Árbol de módulos de las 6 instancias de `articulos-kb`, sobre la captura congelada de F3-0.", fuente: "corpus/fase-3/articulos-kb/**", metodo: "file:// + DOM real; sólo SECCIONES PROPIAS (se excluyen las _tb_)" }, articulos: {} };

for (const a of ARTICULOS) {
  /* ⚠ **Un `file://` NO es una página offline.** El HTML del original trae sus
   * `src`/`href` en ABSOLUTO (`https://kunakair.com/wp-content/…`), así que
   * Chrome se los pide a la red igual que si estuviera navegando el sitio: la
   * primera versión de esta sonda decía «sobre la captura congelada» y estaba
   * pegándole al original en cada corrida — exactamente lo que la campaña de
   * F3-0 existe para no volver a hacer.
   *
   * Se corta de raíz: **todo lo que no sea `file:` se aborta**. Y no es sólo
   * higiene de red — es lo que hace la medida REPRODUCIBLE para siempre: con
   * assets vivos, el árbol podría depender de un JS que mañana cambia. */
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let bloqueadas = 0;
  page.on("request", (r) => {
    if (r.url().startsWith("file:")) return void r.continue();
    bloqueadas++;
    r.abort().catch(() => {});
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(a.fichero).href, { waitUntil: "domcontentloaded", timeout: 120000 });
  const { datos: inv } = await censo.medir(page, () => {
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
    /* Secciones PROPIAS: las `et_pb_section` que NO son del theme builder. */
    const propias = [...__qa(".et_pb_section")].filter((s) => !/_tb_(header|body|footer)/.test(s.className));

    const delModulo = (m) => {
      const base = {
        clases: [...m.classList].filter((c) => !/^et_pb_module$/.test(c)),
        /* Los dos campos de `moduloBase`: el ritmo y el ancho de módulo, que en
         * Divi viajan como estilo EN LÍNEA cuando el editor los toca. */
        estiloInline: m.getAttribute("style") || null,
      };
      if (m.classList.contains("et_pb_blurb")) {
        const img = m.querySelector(".et_pb_main_blurb_image img");
        const h = m.querySelector(".et_pb_module_header");
        return {
          kind: "blurb",
          ...base,
          imagen: img ? { src: img.getAttribute("src"), alt: img.getAttribute("alt"), w: img.getAttribute("width"), h: img.getAttribute("height"), clase: img.className } : null,
          titularEtiqueta: h ? h.tagName.toLowerCase() : null,
          titularEnvuelto: !!(h && h.querySelector("span")),
          titular: txt(h),
          descripcionHtml: (m.querySelector(".et_pb_blurb_description")?.innerHTML ?? "").trim(),
          enlace: m.querySelector("a.et_pb_module_header, .et_pb_blurb_content > a")?.getAttribute("href") ?? null,
        };
      }
      if (m.classList.contains("et_pb_gallery")) {
        const items = [...m.querySelectorAll(".et_pb_gallery_item")].map((g) => {
          const i = g.querySelector("img");
          return { src: i?.getAttribute("src") ?? null, alt: i?.getAttribute("alt") ?? null, titulo: txt(g.querySelector(".et_pb_gallery_title")) };
        });
        return { kind: "gallery", ...base, n: items.length, items, orientacion: [...m.classList].find((c) => /^et_pb_gallery_grid|fullwidth/.test(c)) ?? null };
      }
      if (m.classList.contains("et_pb_text")) return { kind: "text", ...base, html: (m.querySelector(".et_pb_text_inner")?.innerHTML ?? "").trim() };
      if (m.classList.contains("et_pb_image")) {
        const i = m.querySelector("img");
        return { kind: "image", ...base, src: i?.getAttribute("src") ?? null, alt: i?.getAttribute("alt") ?? null, srcset: !!i?.getAttribute("srcset") };
      }
      if (m.classList.contains("et_pb_button_module_wrapper") || m.classList.contains("et_pb_button")) {
        const b = m.querySelector("a.et_pb_button") ?? (m.matches("a.et_pb_button") ? m : null);
        return { kind: "button", ...base, texto: txt(b), href: b?.getAttribute("href") ?? null };
      }
      if (m.classList.contains("et_pb_toggle")) return { kind: "toggle", ...base, titulo: txt(m.querySelector(".et_pb_toggle_title")) };
      if (m.classList.contains("et_pb_video")) return { kind: "video", ...base, src: m.querySelector("iframe")?.getAttribute("src") ?? null };
      return { kind: "?", ...base };
    };

    const secciones = propias.map((s) => ({
      clases: [...s.classList],
      filas: [...s.querySelectorAll(":scope > .et_pb_row, :scope > .et_pb_row_inner")].map((f) => ({
        clases: [...f.classList],
        estiloInline: f.getAttribute("style") || null,
        columnas: [...f.querySelectorAll(":scope > .et_pb_column")].map((c) => ({
          clases: [...c.classList],
          modulos: [...c.querySelectorAll(":scope > .et_pb_module")].map(delModulo),
        })),
      })),
    }));

    const cuenta = {};
    for (const s of secciones) for (const f of s.filas) for (const c of f.columnas) for (const m of c.modulos) cuenta[m.kind] = (cuenta[m.kind] ?? 0) + 1;

    return {
      h1: txt(__q("h1")),
      title: document.title,
      propias: propias.length,
      cuenta,
      secciones,
      /* El cascarón, para confirmar contra §2d que es plantilla en las 6. */
      cascaron: {
        sidebar: !!__q(".et_pb_widget_area, .et_pb_sidebar_0, aside"),
        sticky: /et_pb_sticky/.test(document.body.innerHTML.slice(0, 400000)),
        seccionesTb: __qa(".et_pb_section").length - propias.length,
      },
    };
  });
  salida.articulos[a.ruta] = { ...inv, peticionesBloqueadas: bloqueadas };
  ev.ok(); // `openPage` ya no cuenta por nosotros: esta sonda abre la página a mano
  console.log(`  ${a.ruta.split("/").pop().padEnd(56)} propias ${inv.propias} · ${Object.entries(inv.cuenta).map(([k, n]) => `${k}×${n}`).join(" ")}  (${bloqueadas} peticiones a la red BLOQUEADAS)`);
  await page.close();
}

await browser.close();

/* ══════════════════ LO QUE LA MEDIDA DECIDE, CON SU TEST ══════════════════ */
const A = Object.values(salida.articulos);
const varianza = (f) => new Set(A.map((x) => JSON.stringify(f(x)))).size;

const blurbs = A.flatMap((x) => x.secciones.flatMap((s) => s.filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos)))).filter((m) => m.kind === "blurb");
const galerias = A.flatMap((x) => x.secciones.flatMap((s) => s.filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos)))).filter((m) => m.kind === "gallery");

/** Clases de `blurb` que NO son del tema: son la configuración del editor. */
const clasesBlurb = {};
for (const b of blurbs) for (const c of b.clases) if (!/^et_pb_blurb_\d+$/.test(c)) clasesBlurb[c] = (clasesBlurb[c] ?? 0) + 1;

/* ══════════════════════════════════════════════════════════════════════════
 * EL CENSO DE LO QUE HAY DENTRO DE UN `et_pb_text` — la pregunta que decide si
 * el módulo de texto compartido SIRVE aquí.
 *
 * `MODULO_TEXTO` (compartido) tiene `bloques: BLOQUES_TEXTO` = `p` · `ul` ·
 * `claim` · `titular`, y sus textos son `inline` = **párrafo + negrita y nada
 * más**. Ese tipo se midió sobre datos TRANSCRITOS A MANO a `src/lib` (SECTOR y
 * MONOGRÁFICO). Aquí el dato viene del **editor de WordPress**, que es el caso
 * de CMS-0e, así que la pregunta no es de gusto: **¿cabe lo medido en ese
 * tipo?** Y esto es lo que la contesta con un número.
 * ═════════════════════════════════════════════════════════════════════════ */
const textos = A.flatMap((x) => x.secciones.flatMap((s) => s.filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos)))).filter((m) => m.kind === "text");
const etiquetas = {}, atributos = {};
for (const t of textos) {
  for (const m of t.html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b/g)) { const e = m[1].toLowerCase(); etiquetas[e] = (etiquetas[e] ?? 0) + 1; }
  for (const m of t.html.matchAll(/<[a-zA-Z][^>]*?\s([a-zA-Z-]+)=/g)) atributos[m[1]] = (atributos[m[1]] ?? 0) + 1;
}
/** Lo que `BLOQUES_TEXTO` + `inline` (párrafo + negrita) SÍ puede expresar. */
const EXPRESABLES = new Set(["p", "ul", "li", "h1", "h2", "h3", "h4", "strong", "b"]);
const fueraDelTipo = Object.entries(etiquetas).filter(([e]) => !EXPRESABLES.has(e));

salida.veredicto = {
  seccionesPropias: { valores: A.map((x) => x.propias), varianza: varianza((x) => x.propias) },
  moduloTexto: { n: textos.length, etiquetas, atributos, expresables: [...EXPRESABLES], fueraDelTipo: Object.fromEntries(fueraDelTipo) },
  blurbs: {
    n: blurbs.length,
    conImagen: blurbs.filter((b) => b.imagen).length,
    conEnlace: blurbs.filter((b) => b.enlace).length,
    conDescripcion: blurbs.filter((b) => b.descripcionHtml).length,
    titularEtiquetas: [...new Set(blurbs.map((b) => b.titularEtiqueta))],
    titularEnvuelto: blurbs.filter((b) => b.titularEnvuelto).length,
    clases: clasesBlurb,
  },
  galerias: { n: galerias.length, items: galerias.map((g) => g.n), titulos: galerias.flatMap((g) => g.items.map((i) => i.titulo)) },
  cascaron: { sidebar: A.filter((x) => x.cascaron.sidebar).length, sticky: A.filter((x) => x.cascaron.sticky).length, seccionesTb: [...new Set(A.map((x) => x.cascaron.seccionesTb))] },
};

console.log(`\n═══ VEREDICTO ═══`);
console.log(`  secciones propias      ${salida.veredicto.seccionesPropias.valores.join(" · ")}  → varianza ${salida.veredicto.seccionesPropias.varianza}${salida.veredicto.seccionesPropias.varianza === 1 ? " ⇒ plantilla (confirma §2d.1)" : " ⚠ NO es varianza cero"}`);
const b = salida.veredicto.blurbs;
console.log(`  blurb                  ${b.n} módulos · imagen ${b.conImagen}/${b.n} · descripción ${b.conDescripcion}/${b.n} · enlace ${b.conEnlace}/${b.n}`);
console.log(`     titular             ${b.titularEtiquetas.join(" · ")} · envuelto en <span> ${b.titularEnvuelto}/${b.n}`);
console.log(`     clases del editor   ${Object.entries(b.clases).map(([c, n]) => `${c}×${n}`).join(" · ")}`);
console.log(`  gallery                ${salida.veredicto.galerias.n} módulos · items ${salida.veredicto.galerias.items.join(" · ")}`);
console.log(`  cascarón               sidebar ${salida.veredicto.cascaron.sidebar}/6 · sticky ${salida.veredicto.cascaron.sticky}/6 · secciones _tb_ ${salida.veredicto.cascaron.seccionesTb.join("/")}`);

const mt = salida.veredicto.moduloTexto;
const fuera = Object.entries(mt.fueraDelTipo);
console.log(`  módulo de texto        ${mt.n} módulos · ${Object.keys(mt.etiquetas).length} etiquetas distintas dentro`);
console.log(`     etiquetas           ${Object.entries(mt.etiquetas).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e}×${n}`).join(" · ")}`);
console.log(`     atributos           ${Object.entries(mt.atributos).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e}×${n}`).join(" · ")}`);
if (fuera.length) {
  /* ⚠ Esto NO cierra el código de salida: es una MEDIDA, y una medida que
   * contradice una decisión escrita no es un fallo de la sonda. Se imprime
   * gritando y se congela; quien decide es el ESQUEMA, no este fichero. */
  console.log(
    `\n  ⚠⚠ ESCALÓN · FRONTERA DE MODELO — ${fuera.length} etiquetas que \`BLOQUES_TEXTO\` NO expresa:\n` +
      `     ${fuera.map(([e, n]) => `${e}×${n}`).join(" · ")}\n` +
      `     §2d.1 escribió que este arquetipo «CONSUME las definiciones compartidas sin\n` +
      `     cambiarlas» y PD2 predijo que «texto, imagen y botón entran». Para imagen y\n` +
      `     botón la medida lo confirma; para TEXTO no: el tipo compartido es párrafo +\n` +
      `     negrita, y aquí hay ${fuera.map(([e]) => e).join(", ")}.\n` +
      `     Evidencia congelada en medidas/kb-recon.json → veredicto.moduloTexto.\n` +
      `     Ficha: PENDIENTES-QA.md §F3-1-ESCALON-TEXTO. NO se cablea nada hasta decidirlo.\n`,
  );
}

const muertos = censo.informe();
w("medidas/kb-recon.json", salida);
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
