/**
 * CENSO DEL GRUPO C — caso de éxito (57) + FAQ (19), las 76/76.
 * Uso: npm run qa:c-censo            (necesita Chrome solo como PARSER)
 *
 * ── Por qué censo y no muestra ─────────────────────────────────────────────
 * Lo mismo que en el arquetipo A: leer el cascarón y los campos visibles es
 * `fetch` + parseo, así que muestrear sería **aceptar incertidumbre a cambio de
 * nada**. Lo que se muestrea es la LECTURA FINA, y de eso se encarga
 * `c-muestra.mjs` con la regla pre-registrada de `PLAN-MUESTREO.md`.
 *
 * ── Por qué el navegador si no se renderiza nada ───────────────────────────
 * Solo como **parser de HTML**: `DOMParser` sobre la cadena servida. No se
 * navega, no corre el JS del sitio, no hay layout. Es el patrón que ya usa
 * `a-lexical.mjs`, y evita escribir a mano un parser que traería sus propios
 * fallos a la medida. Sigue siendo el **HTML servido**, que es lo que manda
 * `CLAUDE.md` §El principio.
 *
 * ── Lo que este censo NO hace ──────────────────────────────────────────────
 * **No decide nada.** El grupo C se modela en C-2; aquí solo se mide. Donde una
 * medida no alcanza para afirmar, sale como SIN PROBAR en el recon.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, launch, QA, w } from "./lib.mjs";

const DORMIR = Number(process.env.DORMIR || 120); // cortesía con el sitio vivo

/* ─────────────────── las 76 URLs, de los sitemaps ─────────────────── */

const CACHE = join(QA, "medidas", "_sitemaps");

async function sitemap(nombre) {
  const local = join(CACHE, `${nombre}.xml`);
  if (existsSync(local)) return readFileSync(local, "utf8");
  const xml = await get(`https://kunakair.com/${nombre}-sitemap.xml`);
  try {
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(local, xml);
  } catch { /* el cache es una comodidad, no un requisito */ }
  return xml;
}

/**
 * `fetch` con reintento. No es paranoia: el original dio un
 * `UND_ERR_CONNECT_TIMEOUT` durante este mismo recon, y en un censo de 76 una
 * caída puntual convierte una página medida en un `error` que luego hay que
 * distinguir a mano de un dato real.
 */
async function get(url, intentos = 4) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000) });
      return await r.text();
    } catch (e) {
      ultimo = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw ultimo;
}

/** URLs `/es/` de un sub-sitemap, quitando los ÍNDICES, que no son instancias. */
function urlsDe(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/kunakair\.com\/es\/[^<]*)<\/loc>/g)].map((m) => m[1]);
}

const INDICES = new Set([
  "https://kunakair.com/es/casos-de-exito/",
  "https://kunakair.com/es/preguntas-frecuentes/",
]);

const casos = urlsDe(await sitemap("case-studies")).filter((u) => !INDICES.has(u));
const faqs = urlsDe(await sitemap("faqs")).filter((u) => !INDICES.has(u));

const PAGINAS = [
  ...casos.map((url) => ({
    forma: url.includes("/case-studies/") ? "caso-en" : "caso-es",
    url,
  })),
  ...faqs.map((url) => ({ forma: "faq", url })),
];

console.log(`\n════════ CENSO DEL GRUPO C · ${PAGINAS.length} páginas ════════`);
const porForma = {};
/* Contrato de `Evaluadas` (lib.mjs): una unidad = una página censada de verdad
 * (las que fallaron el `fetch` llevan `error` y no cuentan). */
const ev = new Evaluadas({ nombre: "c-censo", unidad: "páginas censadas", minimo: PAGINAS.length });
for (const p of PAGINAS) porForma[p.forma] = (porForma[p.forma] || 0) + 1;
console.log(`  ${JSON.stringify(porForma)}\n`);

/* ═══════════════════ lectura, dentro del navegador ═══════════════════════
 * ⚠ Nada del módulo viaja: todo lo que use va dentro o llega por argumento.
 * ═════════════════════════════════════════════════════════════════════════ */

async function leer(page, html) {
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const txt = (sel, raiz = doc) => {
      const n = raiz.querySelector(sel);
      return n ? norm(n.textContent) : null;
    };
    const n = (sel, raiz = doc) => raiz.querySelectorAll(sel).length;

    /* ── el RÉGIMEN, que es lo primero que hay que saber (CLAUDE.md) ── */
    const bodyCls = (doc.body.getAttribute("class") || "").split(/\s+/).filter(Boolean);
    const regimen = {
      clasesPlantilla: bodyCls.filter((c) =>
        /template|^single$|^single-|^page$|^page-id-|^postid-|^tax-|^wp-singular$/.test(c),
      ),
      etTb: bodyCls.filter((c) => /^et-tb-/.test(c)),
      esBuilder: bodyCls.includes("et_pb_pagebuilder_layout"),
      tieneTbBody: bodyCls.includes("et-tb-has-body"),
    };

    /* ── el CASCARÓN: cada sección Divi, por plantilla de origen ── */
    const secciones = [...doc.querySelectorAll(".et_pb_section")].map((s) => {
      const c = s.getAttribute("class") || "";
      const origen = /_tb_header/.test(c)
        ? "tb_header"
        : /_tb_footer/.test(c)
          ? "tb_footer"
          : /_tb_body/.test(c)
            ? "tb_body"
            : "propia";
      // la clase «de autor» (migas, footer-links…), que es lo que identifica
      const semantica = c
        .split(/\s+/)
        .filter((x) => x && !/^et_pb_|^et_section_|^et_animated$/.test(x));
      return { origen, semantica: semantica.join(" ") };
    });
    const porOrigen = { tb_header: 0, tb_body: 0, tb_footer: 0, propia: 0 };
    for (const s of secciones) porOrigen[s.origen]++;

    /* ── el CUERPO: ¿un post_content, o campos? ── */
    const cuerpo = {
      // el contenedor del arquetipo A. Si no está, el cuerpo no es aquello
      postContentModulo: n(".et_pb_post_content"),
      // los bloques ricos de la plantilla de tema, que son VARIOS
      entryContent: [...doc.querySelectorAll(".entry-content")].map((e) => {
        const c = e.getAttribute("class") || "";
        const etiquetas = {};
        for (const el of e.querySelectorAll("*")) {
          const t = el.tagName.toLowerCase();
          etiquetas[t] = (etiquetas[t] || 0) + 1;
        }
        return {
          clase: c,
          chars: norm(e.textContent).length,
          etiquetas,
          nEtiquetas: Object.keys(etiquetas).length,
        };
      }),
    };

    /* ── los CAMPOS VISIBLES. Se listan por presencia, no se interpretan ── */
    const galeria = doc.querySelector(".case-galeria");
    const mapa = doc.querySelector(".acf-map");
    const soluciones = doc.querySelector(".case-soluciones");
    const campos = {
      sobretitulo: txt(".sobretitulo"),
      titulo: txt("h1.entry-title") || txt("h1"),
      cliente: [...doc.querySelectorAll(".case-cliente")].map((e) => norm(e.textContent)),
      sectores: [...doc.querySelectorAll(".case-sectores")].map((e) => norm(e.textContent)),
      bloques: [...doc.querySelectorAll(".entry-content-bloque-title")].map((e) => norm(e.textContent)),
      bloquesClase: [...doc.querySelectorAll(".entry-content[class*='entry-content-']")].map((e) =>
        (e.getAttribute("class") || "").replace(/\bentry-content\b/, "").trim(),
      ),
      textoDestacado: txt(".texto-destacado"),
      galeria: galeria ? { slides: n(".swiper-slide", galeria), imgs: n("img", galeria) } : null,
      detalles: doc.querySelector(".case-detalles")
        ? {
            titulo: txt(".case-detalles-title"),
            // pares etiqueta/valor del bloque de detalles, sin interpretarlos
            lineas: norm(doc.querySelector(".case-detalles-txt")?.textContent || "").slice(0, 400),
            tieneMapa: !!mapa,
            marcadores: mapa ? n(".marker", mapa) : 0,
            // ACF Google Map guarda lat/lng en data-*: es dato del autor
            datosMarcador: mapa
              ? [...mapa.querySelectorAll(".marker")].map((m) =>
                  Object.fromEntries(
                    [...m.attributes].filter((a) => a.name.startsWith("data-")).map((a) => [a.name, a.value]),
                  ),
                )
              : [],
          }
        : null,
      soluciones: soluciones
        ? {
            titulo: txt("h2", soluciones),
            items: n(".lista-contenido-item", soluciones),
            pestanas: n(".lista-contenido-ul span, .lista-contenido-ul li", soluciones),
            productos: [...soluciones.querySelectorAll(".subtitulo-producto")].map((e) => norm(e.textContent)),
          }
        : null,
    };

    /* ── SEO por instancia, que es lo que al grupo C le falta en el clon ── */
    const meta = (sel, attr = "content") => doc.querySelector(sel)?.getAttribute(attr) || null;
    const seo = {
      title: txt("title"),
      description: meta('meta[name="description"]'),
      canonical: meta('link[rel="canonical"]', "href"),
      ogImage: meta('meta[property="og:image"]'),
      hreflang: [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({
        lang: l.getAttribute("hreflang"),
        href: l.getAttribute("href"),
      })),
    };

    return { regimen, secciones, porOrigen, cuerpo, campos, seo };
  }, html);
}

/* ═══════════════════════════════ recorrido ═══════════════════════════════ */

const { browser } = await launch();
const page = await browser.newPage();
await page.goto("about:blank");

const salida = {
  meta: {
    fecha: "2026-07-30",
    fuente: "HTML servido del original",
    alcance: `censo ${PAGINAS.length}/76, no muestra`,
    navegador: "solo como DOMParser: no se navega ni corre el JS del sitio",
  },
  paginas: [],
};
let fallos = 0;

for (const p of PAGINAS) {
  const corto = p.url.replace("https://kunakair.com/es/", "").replace(/\/$/, "").slice(-56);
  try {
    const html = await get(p.url);
    const r = await leer(page, html);
    salida.paginas.push({ ...p, http: 200, ...r });
    const c = r.campos;
    console.log(
      `  ${p.forma.padEnd(8)} ${corto.padEnd(56)} ` +
        `sec ${r.porOrigen.tb_header}/${r.porOrigen.propia}/${r.porOrigen.tb_footer}` +
        ` · ec ${String(r.cuerpo.entryContent.length).padStart(2)}` +
        ` · gal ${c.galeria ? c.galeria.slides : "—"}` +
        ` · sol ${c.soluciones ? c.soluciones.items : "—"}` +
        ` · mapa ${c.detalles?.tieneMapa ? "sí" : "no"}`,
    );
  } catch (e) {
    fallos++;
    salida.paginas.push({ ...p, error: String(e).slice(0, 180) });
    console.log(`  ⚠ ${p.forma.padEnd(8)} ${corto}  ${String(e).slice(0, 90)}`);
  }
  if (DORMIR) await new Promise((r) => setTimeout(r, DORMIR));
}

await browser.close();

/* ════════════════════════════════ informe ════════════════════════════════ */

const ok = salida.paginas.filter((p) => !p.error);
ev.ok(ok.length);
const formas = [...new Set(ok.map((p) => p.forma))];

/** El discriminador de plantillado: ¿cuánto varía esto entre instancias? */
function varianza(lista, fn) {
  const vals = new Map();
  for (const p of lista) {
    const k = JSON.stringify(fn(p));
    vals.set(k, (vals.get(k) || 0) + 1);
  }
  return [...vals.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => ({ valor: v, n }));
}

salida.porForma = {};
console.log(`\n════════ CASCARÓN · varianza entre instancias, por forma ════════`);
for (const f of formas) {
  const lista = ok.filter((p) => p.forma === f);
  const ejes = {
    reparto: varianza(lista, (p) => p.porOrigen),
    firmaSecciones: varianza(lista, (p) => p.secciones.map((s) => `${s.origen}:${s.semantica}`)),
    clasesPlantilla: varianza(lista, (p) => p.regimen.clasesPlantilla.filter((c) => !/postid-|page-id-/.test(c))),
    etTb: varianza(lista, (p) => p.regimen.etTb),
    bloquesDelCuerpo: varianza(lista, (p) => p.campos.bloquesClase),
  };
  salida.porForma[f] = { n: lista.length, ejes };
  console.log(`\n  ── ${f} (${lista.length}) ──`);
  for (const [nombre, v] of Object.entries(ejes)) {
    const unico = v.length === 1;
    console.log(
      `    ${nombre.padEnd(18)} ${unico ? "✅ varianza CERO" : `⚠ ${v.length} formas`}` +
        `  ${v.slice(0, 2).map((x) => `${x.n}× ${x.valor.slice(0, 74)}`).join("  |  ")}`,
    );
  }
}

/* campos: en cuántas instancias aparece cada uno */
console.log(`\n════════ CAMPOS VISIBLES · presencia por forma ════════`);
salida.presencia = {};
for (const f of formas) {
  const lista = ok.filter((p) => p.forma === f);
  const pres = {};
  for (const p of lista) {
    const c = p.campos;
    const marcar = (k, v) => { if (v) pres[k] = (pres[k] || 0) + 1; };
    marcar("sobretitulo", c.sobretitulo);
    marcar("titulo", c.titulo);
    marcar("cliente", c.cliente.length);
    marcar("sectores", c.sectores.length);
    marcar("textoDestacado", c.textoDestacado);
    marcar("galeria", c.galeria);
    marcar("detalles", c.detalles);
    marcar("mapa", c.detalles?.tieneMapa);
    marcar("soluciones", c.soluciones);
    marcar("hreflang", p.seo.hreflang.length);
  }
  salida.presencia[f] = { n: lista.length, campos: pres };
  console.log(`  ${f.padEnd(8)} (${lista.length})  ${JSON.stringify(pres)}`);
}

salida.resumen = {
  paginas: PAGINAS.length,
  ok: ok.length,
  fallos,
  porForma,
};

console.log(`\n════════ RESUMEN ════════`);
console.log(`  ${ok.length} leídas · ${fallos} fallos`);

w("medidas/c-censo.json", salida);

/* Código 0 solo si se leyeron todas: un censo con huecos no es un censo, y la
 * diferencia tiene que verse en el código de salida, no solo por pantalla. */
console.log(`\n${fallos === 0 ? "✅" : "❌"} ${fallos === 0 ? "censo completo" : `${fallos} páginas sin leer`}`);
process.exit(fallos === 0 ? 0 : 1);
