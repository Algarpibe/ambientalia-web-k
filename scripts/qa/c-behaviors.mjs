/**
 * COMPORTAMIENTOS DEL GRUPO C — lo que solo se ve con el JS corriendo.
 * Uso: npm run qa:c-behaviors [ancho]        (necesita Chrome)
 *
 * El censo lee el HTML servido y por eso no puede responder a esto: qué de lo
 * que hay en el marcado es **interacción** y qué es adorno. Cuatro preguntas,
 * las cuatro sobre la muestra de `c-muestra.json`:
 *
 *   1 · la GALERÍA (`swiper casegalerySwiper`) — ¿carrusel real? ¿cuántos
 *       visibles a la vez, y responden los botones?
 *   2 · las PESTAÑAS de soluciones (`lista-contenido` con `item-activo`) —
 *       ¿cambia el activo al pulsar, o están todos pintados y es CSS?
 *   3 · el MAPA (`acf-map`) — ¿carga un mapa de terceros? ¿cuál?
 *   4 · la FAQ — **¿acordeón o lista plana?** Es la pregunta del PASO 4: en el
 *       DETALLE de una FAQ el cuerpo se ve entero, pero eso no dice qué hace el
 *       ÍNDICE. Se miran los dos.
 *
 * ⚠ Se mide con `settle` (`CLAUDE.md` §Notas de método): Divi y Swiper
 * recalculan por JS después del load, y sin el pase de scroll la mitad de esto
 * se lee como «no hay nada».
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { launch, openPage, settle, w, QA } from "./lib.mjs";

const ANCHO = Number(process.argv[2] || 1440);
const MOVIL = ANCHO <= 500;

const muestra = JSON.parse(readFileSync(join(QA, "medidas/c-muestra.json"), "utf8"));

/* Una de cada forma basta para la topología de interacción; la galería y las
 * pestañas se miran en varias porque su TAMAÑO varía y el número es dato. */
const CASOS = [...muestra.formas["caso-es"].muestra.slice(0, 4), ...muestra.formas["caso-en"].muestra.slice(0, 1)].map((m) => m.url);
const FAQS = muestra.formas.faq.muestra.slice(0, 2).map((m) => m.url);
const INDICES = [
  "https://kunakair.com/es/preguntas-frecuentes/",
  "https://kunakair.com/es/casos-de-exito/",
];

console.log(`\n════════ COMPORTAMIENTOS DEL GRUPO C · ${ANCHO}px ════════`);

const { browser } = await launch();
const salida = {
  meta: {
    fecha: "2026-07-30",
    viewport: `${ANCHO}${MOVIL ? "x844 (device metrics)" : "x900"} · DPR 1`,
    metodo: "settle: pase de scroll + espera; lazy→eager",
  },
  paginas: [],
};

async function mirar(url, tipo) {
  const { page } = await openPage(browser, url, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  await settle(page);

  const r = await page.evaluate(() => {
    const vis = (e) => {
      if (!e) return false;
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();

    /* ── galería ── */
    /* ⚠ Swiper en modo bucle CLONA slides, y cuántos clona depende del ancho:
     * la misma galería daba 17 a 1440 y 13 a 390 con **11 reales** en el HTML
     * servido. Contar `.swiper-slide` a secas mide el modo del carrusel, no el
     * contenido. Los clones llevan `.swiper-slide-duplicate`.
     *
     * ⚠⚠ Y hay que casar la clase EXACTA, no un `includes("duplicate")`: swiper
     * pone además `swiper-slide-duplicate-prev`/`-next` sobre slides
     * **ORIGINALES** vecinos de un clon. Con `includes` salían 10 reales + 7
     * clones donde el HTML servido trae 11 — el censo y esta sonda discrepaban
     * en uno, y quien estaba mal era ésta. Con la clase exacta: 11 + 6 = 17. */
    const gal = document.querySelector(".case-galeria");
    const esClon = (s) => s.classList.contains("swiper-slide-duplicate");
    const galeria = gal
      ? {
          slidesReales: [...gal.querySelectorAll(".swiper-slide")].filter((s) => !esClon(s)).length,
          clones: [...gal.querySelectorAll(".swiper-slide")].filter(esClon).length,
          visibles: [...gal.querySelectorAll(".swiper-slide")].filter(vis).length,
          // swiper añade estas clases SOLO si se inicializó de verdad
          inicializado: !!gal.querySelector(".swiper-initialized, .swiper-slide-active"),
          botones: {
            prev: vis(gal.querySelector(".swiper-button-prev")),
            next: vis(gal.querySelector(".swiper-button-next")),
          },
          lightbox: !!gal.querySelector("a[href$='.jpg'], a[href$='.png'], a[data-fancybox], a.lightbox"),
        }
      : null;

    /* ── pestañas de soluciones ──
     *
     * ⚠ DOS trampas, las dos pagadas midiendo:
     *
     * 1 · La etiqueta de pestaña es `li > span[data-id]`, NO el `li`. La primera
     *     versión seleccionaba `.lista-contenido-ul span, … li` y el `li`
     *     contiene además el PANEL entero: cada «etiqueta» salía como un blob de
     *     400 caracteres con la ficha del producto dentro.
     * 2 · **Los paneles están DUPLICADOS**: los mismos `data-id` aparecen dentro
     *     del `li` y otra vez en `.lista-contenido-content`. Contar
     *     `.lista-contenido-item` da 16 donde hay **8 soluciones**, y «2 activos»
     *     es uno por copia, no dos selecciones. Se cuenta por `data-id` ÚNICO. */
    const sol = document.querySelector(".case-soluciones");
    const pestanas = sol
      ? (() => {
          const etiquetas = [...sol.querySelectorAll("li > span[data-id]")];
          const items = [...sol.querySelectorAll(".lista-contenido-item[data-id]")];
          const ids = new Set(items.map((e) => e.getAttribute("data-id")));
          return {
            solucionesDistintas: ids.size,
            itemsEnElDom: items.length,
            duplicado: items.length > ids.size,
            copias: {
              enElLi: items.filter((e) => e.closest(".lista-contenido-ul")).length,
              enElPanel: items.filter((e) => e.closest(".lista-contenido-content")).length,
            },
            etiquetas: etiquetas.map((s) => ({
              id: s.getAttribute("data-id"),
              // el nombre corto es el primer nodo de texto; el resto es el
              // subtítulo del producto, que va en un <strong> aparte
              texto: norm([...s.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(" ")),
            })),
            activaEtiqueta: sol.querySelectorAll("li > span.li-activo").length,
            panelesVisibles: items.filter(vis).length,
          };
        })()
      : null;

    /* ── mapa ── */
    const mapa = document.querySelector(".acf-map");
    const mapaInfo = mapa
      ? {
          visible: vis(mapa),
          alto: Math.round(mapa.getBoundingClientRect().height),
          marcadores: mapa.querySelectorAll(".marker").length,
          // ¿se ha montado un mapa de terceros dentro?
          hijos: mapa.children.length,
          proveedor: /google/i.test(document.documentElement.innerHTML.slice(0, 0) || "")
            ? "google"
            : [...document.querySelectorAll("script[src]")]
                .map((s) => s.src)
                .filter((s) => /maps\.google|maps\.googleapis|leaflet|mapbox|openstreetmap/i.test(s))
                .map((s) => new URL(s).host)[0] || null,
          gmStyle: !!mapa.querySelector(".gm-style"), // firma inequívoca de Google Maps montado
        }
      : null;

    /* ── acordeón: ¿hay paneles que empiecen colapsados? ── */
    const candidatos = [
      ".et_pb_toggle", ".et_pb_accordion_item", "details", "[data-toggle]",
      ".faq-item", ".accordion", ".acordeon", ".et_pb_toggle_close",
    ];
    const acordeon = {};
    for (const sel of candidatos) {
      const n = document.querySelectorAll(sel).length;
      if (n) acordeon[sel] = n;
    }
    /* Paneles colapsados = el síntoma real de un acordeón, independiente del
     * nombre de la clase.
     *
     * ⚠ Se EXCLUYE el subárbol de `.case-soluciones`: sus paneles ocultos son
     * las pestañas de arriba, no un acordeón. Sin excluirlo esta cuenta daba
     * 7·15·19 «paneles colapsados» en páginas de caso y hacía parecer que el
     * caso de éxito tiene un acordeón que no tiene. */
    const colapsados = [...document.querySelectorAll("h2,h3,h4,summary,.et_pb_toggle_title")]
      .filter((h) => !h.closest(".case-soluciones"))
      .filter((h) => {
        const sig = h.nextElementSibling;
        return sig && !vis(sig) && norm(sig.textContent).length > 20;
      }).length;

    /* Si es un ARCHIVO, lo que importa es cómo lista: enlaces a detalle o
     * contenido desplegable en la propia página. */
    const arts = [...document.querySelectorAll("article, .type-faqs, .et_pb_post")];
    const archivo = arts.length
      ? {
          articulos: arts.length,
          titulos: arts.map((a) => norm(a.querySelector("h1,h2,h3,h4,a")?.textContent || "").slice(0, 60)),
          paginacion: document.querySelectorAll(".pagination, .wp-pagenavi, .nav-links, .paginacion, a.next").length,
          // ¿el cuerpo de cada entrada está en la propia página?
          conCuerpoEnLista: arts.filter((a) => norm(a.textContent).length > 300).length,
        }
      : null;

    return {
      galeria,
      pestanas,
      mapa: mapaInfo,
      acordeon: { selectores: acordeon, panelesColapsados: colapsados },
      archivo,
      // cuántos enlaces a detalles hay (para el índice)
      enlacesADetalle: {
        casos: document.querySelectorAll('a[href*="/casos-de-exito/"], a[href*="/case-studies/"]').length,
        faqs: document.querySelectorAll('a[href*="/faqs/"]').length,
      },
    };
  });

  /* ── ¿las pestañas RESPONDEN? Se pulsa y se vuelve a mirar. ── */
  /* ── ¿las pestañas RESPONDEN? ──────────────────────────────────────────
   *
   * ⚠ DOS trampas más, las dos con el mismo síntoma: «no cambia nada».
   *
   * 1 · **`elemento.click()` NO sirve aquí.** El manejador no reacciona al
   *     click sintético; con `page.mouse.click()` sobre las coordenadas reales
   *     la pestaña cambia sin falta. Un `.click()` que no dispara y una pestaña
   *     rota dan exactamente la misma salida.
   * 2 · **Hay que mirar la copia BUENA.** El panel visible es el de
   *     `.lista-contenido-content`; el gemelo de dentro del `li` mide 0 siempre.
   *     Buscar por `data-id` a secas devuelve el del `li` y da «no visible»
   *     pase lo que pase.
   *
   * Lo cazó comparar contra algo ya sabido: a ojo, en el navegador, la pestaña
   * cambia. La sonda decía que no.
   */
  /* ⚠ Se miran LAS DOS copias, no solo la del panel. A 1440 el que se ve es el
   * de `.lista-contenido-content`; a 390 **es el de dentro del `li`**, y mirar
   * solo la primera daba «no muestra su panel» en móvil con la pestaña
   * funcionando. La duplicación del marcado ES el mecanismo responsive. */
  const estado = () =>
    page.evaluate(() => {
      const visibles = (raiz) =>
        raiz
          ? [...raiz.querySelectorAll(".lista-contenido-item")]
              .filter((e) => e.getBoundingClientRect().height > 0)
              .map((e) => e.getAttribute("data-id"))
          : [];
      const enPanel = visibles(document.querySelector(".lista-contenido-content"));
      const enLi = visibles(document.querySelector(".lista-contenido-ul"));
      return {
        etiquetaActiva: document.querySelector("li > span.li-activo")?.getAttribute("data-id") || null,
        panelesVisibles: [...enPanel, ...enLi],
        dondeSeVe: enPanel.length ? "lista-contenido-content" : enLi.length ? "dentro del li" : "ninguno",
      };
    });

  let interaccion = null;
  if (r.pestanas && r.pestanas.etiquetas.length > 1) {
    const antes = await estado();
    const diana = await page.evaluate(() => {
      const t = [...document.querySelectorAll("li > span[data-id]")].find((s) => !s.className.includes("li-activo"));
      if (!t) return null;
      t.scrollIntoView({ block: "center" });
      const c = t.getBoundingClientRect();
      return { id: t.getAttribute("data-id"), x: c.x + c.width / 2, y: c.y + c.height / 2 };
    });
    if (!diana) {
      interaccion = { pulsable: false, motivo: "solo hay una pestaña" };
    } else {
      await page.mouse.click(diana.x, diana.y);
      await new Promise((r) => setTimeout(r, 700));
      const despues = await estado();
      interaccion = {
        pulsable: true,
        idPulsado: diana.id,
        antes,
        despues,
        cambiaEtiqueta: antes.etiquetaActiva !== despues.etiquetaActiva,
        muestraSuPanel: despues.panelesVisibles.includes(`item-${diana.id}`),
        unSoloPanelALaVez: despues.panelesVisibles.length === 1,
      };
    }
  }

  await page.close();
  return { url, tipo, ...r, interaccion };
}

for (const [lista, tipo] of [[CASOS, "caso"], [FAQS, "faq-detalle"], [INDICES, "indice"]]) {
  for (const url of lista) {
    try {
      const r = await mirar(url, tipo);
      salida.paginas.push(r);
      const corto = url.replace("https://kunakair.com/es/", "").slice(0, 46);
      console.log(`\n  ${tipo.padEnd(11)} ${corto}`);
      if (r.galeria)
        console.log(`    galería   ${r.galeria.slidesReales} slides reales (+${r.galeria.clones} clones de swiper) · ${r.galeria.visibles} visibles · swiper ${r.galeria.inicializado ? "inicializado" : "NO inicializado"} · botones ${r.galeria.botones.prev && r.galeria.botones.next ? "sí" : "no"}`);
      if (r.pestanas)
        console.log(
          `    pestañas  ${r.pestanas.solucionesDistintas} soluciones distintas · ${r.pestanas.itemsEnElDom} nodos` +
            `${r.pestanas.duplicado ? ` (DUPLICADO: ${r.pestanas.copias.enElLi} en li + ${r.pestanas.copias.enElPanel} en panel)` : ""}` +
            ` · ${r.pestanas.panelesVisibles} visible(s) · ${JSON.stringify(r.pestanas.etiquetas.slice(0, 3).map((e) => e.texto))}`,
        );
      if (r.interaccion)
        console.log(
          `    al pulsar ${
            r.interaccion.pulsable
              ? `«${r.interaccion.idPulsado}» → etiqueta ${r.interaccion.cambiaEtiqueta ? "CAMBIA" : "no cambia"}` +
                ` · muestra su panel ${r.interaccion.muestraSuPanel ? "SÍ" : "no"}` +
                ` · uno a la vez ${r.interaccion.unSoloPanelALaVez ? "sí" : "no"} · se ve en ${r.interaccion.despues.dondeSeVe}`
              : r.interaccion.motivo
          }`,
        );
      if (r.mapa)
        console.log(`    mapa      ${r.mapa.visible ? "visible" : "oculto"} · alto ${r.mapa.alto} · ${r.mapa.marcadores} marcador(es) · Google Maps montado: ${r.mapa.gmStyle ? "sí" : "no"} · script ${r.mapa.proveedor || "—"}`);
      console.log(`    acordeón  paneles colapsados ${r.acordeon.panelesColapsados} · selectores ${JSON.stringify(r.acordeon.selectores)}`);
      if (r.archivo)
        console.log(
          `    archivo   ${r.archivo.articulos} entradas listadas · paginación ${r.archivo.paginacion ? "sí" : "no"}` +
            ` · con cuerpo en la lista ${r.archivo.conCuerpoEnLista}`,
        );
      if (tipo === "indice") console.log(`    enlaces   casos ${r.enlacesADetalle.casos} · faqs ${r.enlacesADetalle.faqs}`);
    } catch (e) {
      salida.paginas.push({ url, tipo, error: String(e).slice(0, 160) });
      console.log(`  ⚠ ${url}  ${String(e).slice(0, 100)}`);
    }
  }
}

await browser.close();
w(`medidas/c-behaviors-${ANCHO}.json`, salida);
console.log(`\n(recon: sin veredicto. Las decisiones son de C-2.)`);
