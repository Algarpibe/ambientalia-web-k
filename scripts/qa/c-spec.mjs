/**
 * SPEC DEL GRUPO C — el texto verbatim y las piezas que hay que teclear.
 * Uso: npm run qa:c-spec            (Chrome solo como DOMParser, como c-censo)
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * El censo (C-1) contó; esto **transcribe**. Es la fase 2 del flujo para el
 * grupo C: sacar del HTML servido el contenido exacto de las instancias que va
 * a poblar C-3, para que los textos entren verbatim y no a ojo.
 *
 * Y de paso cierra cuatro SIN PROBAR que el censo dejó abiertos, porque son
 * lectura del mismo HTML y no merecen una corrida propia:
 *
 *   C-SP8  · el contenido exacto de las migas
 *   C-SP9  · si `destacado` lleva marcado inline — y DÓNDE vive en el árbol
 *   C-SP10 · leyendas y `alt` de las imágenes de galería
 *   C-SP12 · si el chip de sector del DETALLE enlaza a /es/sector/<slug>/
 *   C-SP6  · los hosts de los `iframe` del cuerpo (para la allowlist del §3.3b)
 *
 * ── P-C3-1, la predicción que se cobra aquí ────────────────────────────────
 * «La 4ª sección del pie contiene lo mismo en cualquier par de casos —nada
 * derivado del post—. *Refuta:* cualquier diferencia no atribuible a la
 * plantilla. Si refuta, se reabre D5.»
 *
 * Se compara el HTML **normalizado** de cada sección del pie entre todos los
 * pares de casos. Normalizar es quitar lo que Divi numera por página
 * (`et_pb_section_0_tb_footer` es el mismo módulo aunque cambie el ordinal) y
 * nada más: si se normalizara el texto, la prueba dejaría de poder fallar.
 */
import { Evaluadas, launch, w } from "./lib.mjs";

const DORMIR = Number(process.env.DORMIR || 150); // cortesía con el sitio vivo

/* ── Las instancias que puebla C-3, y por qué cada una ────────────────────
 * El mínimo ADVERSARIO, no el cómodo: cada una rompe un eje distinto del
 * modelo. Si el modelo solo aguanta las cómodas, no aguanta.               */
const PAGINAS = [
  { forma: "caso", clave: "des-moines",
    porque: "DOS términos de sector · galería 7 · soluciones · mapa",
    url: "https://kunakair.com/es/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa/" },
  { forma: "caso", clave: "world-athletics",
    porque: "SIN término de sector (chips vacíos) · SIN galería · destacado",
    url: "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/" },
  { forma: "caso", clave: "rio-de-janeiro",
    porque: "prefijo INGLÉS · SIN mapa (el único de 57) · galería 15 (la mayor)",
    url: "https://kunakair.com/es/case-studies/distrito-baja-emision-rio-de-janeiro/" },
  { forma: "caso", clave: "lindano",
    porque: "SIN soluciones · SIN parámetros (el único de 57) · SIN galería",
    url: "https://kunakair.com/es/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano/" },
  { forma: "faq", clave: "dron", porque: "la más corta (151)",
    url: "https://kunakair.com/es/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento/" },
  { forma: "faq", clave: "calibracion-correccion", porque: "la más larga (539) y la de más etiquetas (ul li a)",
    url: "https://kunakair.com/es/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion/" },
];

async function get(url, intentos = 4) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000) });
      return { http: r.status, html: await r.text() };
    } catch (e) {
      ultimo = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw ultimo;
}

const { browser } = await launch();
const page = await browser.newPage();
await page.goto("about:blank");

const salida = { meta: { fecha: new Date().toISOString().slice(0, 10), n: PAGINAS.length }, paginas: {} };

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "c-spec", unidad: "páginas", minimo: PAGINAS.length });
for (const p of PAGINAS) {
  const { http, html } = await get(p.url);
  salida.paginas[p.clave] = {
    ...p, http,
    ...(await page.evaluate((html, forma) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const q = (s, r = doc) => r.querySelector(s);
      const qa = (s, r = doc) => [...r.querySelectorAll(s)];
      const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
      /** El HTML tal cual, con los saltos del original: es lo que se teclea. */
      const raw = (el) => (el ? el.innerHTML.trim() : null);

      /* ── migas · C-SP8 ── */
      const migas = qa("ol.kunak-breadcrumbs > li").map((li) => ({
        texto: txt(li.querySelector("[itemprop=name]")),
        href: li.querySelector("a")?.getAttribute("href") ?? null,
      }));

      /* ── chip de sector · C-SP12: ¿enlaza o es texto? ── */
      const chip = q(".case-sectores");
      const chips = {
        html: raw(chip),
        texto: txt(chip) || "",
        enlaces: qa("a", chip || doc.createElement("div")).map((a) => ({
          texto: txt(a), href: a.getAttribute("href"),
        })),
      };

      /* ── los tres bloques ricos: el HTML de dentro del contenedor ── */
      const bloque = (clase) => {
        const el = q(`.entry-content-${clase}`);
        if (!el) return null;
        const cont = el.querySelector(".entry-content-bloque");
        return {
          h2: txt(el.querySelector("h2")),
          html: raw(cont),
          // C-SP9: ¿dónde vive `texto-destacado` en el ÁRBOL? Si cuelga dentro
          // del contenedor del bloque, no es un campo hermano: es contenido.
          destacadoDentro: !!cont?.querySelector(".texto-destacado"),
          destacadoEsUltimo: cont?.lastElementChild?.classList?.contains("texto-destacado") ?? false,
        };
      };

      /* ── destacado · C-SP9: ¿marcado inline dentro? ── */
      const dest = q(".texto-destacado");
      const destacado = dest
        ? { html: raw(dest), texto: txt(dest), tieneMarcado: /<[a-z]/i.test(dest.innerHTML) }
        : null;

      /* ── galería · C-SP10: leyenda y alt ── */
      const slides = qa(".swiper-slide:not(.swiper-slide-duplicate), .case-galeria img")
        .map((s) => {
          const img = s.tagName === "IMG" ? s : s.querySelector("img");
          if (!img) return null;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? null,
            width: img.getAttribute("width"), height: img.getAttribute("height"),
            leyenda: txt(s.querySelector("figcaption, .wp-caption-text")),
          };
        }).filter(Boolean);

      /* ── detalles: fila a fila ─────────────────────────────────────────
       * ⚠ NO vale `.case-detalles-txt > p`. El original escribe
       *     <p><span>Parámetros:</span><br><ul><li>…</ul></p>
       * y `<ul>` dentro de `<p>` es HTML inválido: **el parser cierra el `<p>`
       * antes del `<ul>`**, así que la lista queda de HERMANA, no de hija. Con
       * el selector ingenuo, «Parámetros» salía vacío — un dato plausible, no
       * un error, que es exactamente como sobreviven los fallos de sonda.
       *
       * Una fila empieza en un `<p>` con `<span>` de rótulo y se acaba en el
       * siguiente. Se guarda además el HTML crudo del contenedor entero,
       * porque el original emite un `<p>` VACÍO donde iría el sector cuando el
       * caso no lo tiene, y eso es estructura que hay que poder reproducir. */
      const cont = q(".case-detalles-txt");
      const detalles = [];
      let actual = null;
      for (const hijo of [...(cont?.children || [])]) {
        const rot = hijo.tagName === "P" ? hijo.querySelector(":scope > span") : null;
        if (rot) {
          const clon = hijo.cloneNode(true);
          clon.querySelector(":scope > span")?.remove();
          actual = { rotulo: txt(rot), html: clon.innerHTML.trim(), texto: txt(clon) };
          detalles.push(actual);
        } else if (actual) {
          actual.html += "\n" + hijo.outerHTML.trim();
          actual.texto = (actual.texto + " " + txt(hijo)).trim();
        }
      }
      const detallesCrudo = raw(cont);
      const marcadores = qa(".acf-map .marker").map((m) => ({
        lat: m.getAttribute("data-lat"), lng: m.getAttribute("data-lng"),
      }));

      /* ── soluciones: el data-id (relación) y la ficha (proyección) ── */
      const soluciones = qa("#lista-soluciones .lista-contenido-ul > ul > li").map((li) => {
        const sp = li.querySelector("span[data-id]");
        const panel = li.querySelector(".lista-contenido-item");
        const sub = sp?.querySelector(".subtitulo-producto");
        const clonSp = sp?.cloneNode(true);
        clonSp?.querySelector(".subtitulo-producto")?.remove();
        return {
          dataId: sp?.getAttribute("data-id") ?? null,
          etiqueta: txt(clonSp),
          subtitulo: txt(sub),
          panel: panel ? {
            h4: txt(panel.querySelector("h4")),
            img: panel.querySelector("img")?.getAttribute("src") ?? null,
            alt: panel.querySelector("img")?.getAttribute("alt") ?? null,
            intro: raw(panel.querySelector(".lista-contenido-item-introduccion")),
            cta: {
              texto: txt(panel.querySelector("a.et_pb_button")),
              href: panel.querySelector("a.et_pb_button")?.getAttribute("href") ?? null,
            },
          } : null,
        };
      });

      /* ── el cuerpo de la FAQ ── */
      const faqCuerpo = forma === "faq"
        ? { html: raw(q("#left-area .entry-content")), h1: txt(q("h1")) } : null;

      /* ── C-SP6: los hosts de los iframe del cuerpo ── */
      const iframes = qa(".entry-content-need iframe, .entry-content-solution iframe, .entry-content-results iframe, #left-area .entry-content iframe")
        .map((f) => f.getAttribute("src"))
        .map((s) => ({ src: s, host: (() => { try { return new URL(s, "https://kunakair.com").host; } catch { return "?"; } })() }));

      /* ── P-C3-1: el pie, sección a sección, HTML normalizado ── */
      const pie = qa("footer .et_pb_section").map((s, i) => {
        const clase = [...s.classList].filter((c) => !/_\d+_tb_footer$/.test(c)).join(" ");
        // Se quita SOLO el ordinal que Divi numera por página. Nada más: si se
        // normalizara el texto, la prueba dejaría de poder fallar.
        const norm = s.outerHTML.replace(/_\d+_tb_footer/g, "_N_tb_footer").replace(/\s+/g, " ").trim();
        return { i, clase, chars: norm.length, html: norm };
      });

      return {
        bodyClass: doc.body.className,
        migas,
        campos: forma === "caso" ? {
          sobretitulo: txt(q("p.sobretitulo")),
          titulo: txt(q("h1.entry-title")),
          cliente: txt(q(".case-cliente")),
          chips,
          necesidad: bloque("need"), solucion: bloque("solution"), resultados: bloque("results"),
          destacado,
          galeria: slides,
          detallesTitulo: txt(q(".case-detalles-title")),
          detalles, detallesCrudo, marcadores,
          solucionesTitulo: txt(q(".case-soluciones .titulo-puntos")),
          soluciones,
        } : faqCuerpo,
        iframes,
        seo: {
          title: q("title")?.textContent ?? null,
          description: q('meta[name="description"]')?.getAttribute("content") ?? null,
          canonical: q('link[rel="canonical"]')?.getAttribute("href") ?? null,
          ogImage: q('meta[property="og:image"]')?.getAttribute("content") ?? null,
        },
        pie,
      };
    }, html, p.forma)),
  };
  console.log(`  ✓ ${p.forma.padEnd(4)} ${p.clave.padEnd(24)} http ${http}  ${p.porque}`);
  await new Promise((r) => setTimeout(r, DORMIR));
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}
await browser.close();

/* ────────────────── P-C3-1: el pie, par a par entre casos ────────────────── */

const casos = Object.entries(salida.paginas).filter(([, v]) => v.forma === "caso");
const faqs = Object.entries(salida.paginas).filter(([, v]) => v.forma === "faq");

/**
 * ⚠ P-C3-1 pregunta por **LA 4ª SECCIÓN** del pie del caso — la que el caso
 * tiene y la FAQ no (D1: pie 4 vs 3). No por el pie entero.
 *
 * La primera versión comparaba las cuatro y daba «REFUTADA» por una diferencia
 * de `footer-legal`, que es otra sección: el veredicto contestaba a una pregunta
 * que nadie había hecho, y de paso habría reabierto D5 sin motivo. Es el error
 * de nivel de `CLAUDE.md` otra vez, en la dirección contraria: medir MÁS de lo
 * que la propiedad ocupa también invalida la medida.
 *
 * Y la sección se identifica **midiendo**, no por su índice: clases del pie del
 * caso menos clases del pie de la FAQ. Lo que sobra es la 4ª.
 */
const clasesFaq = new Set(faqs.flatMap(([, v]) => v.pie.map((s) => s.clase)));
const idxObjetivo = casos[0][1].pie.findIndex((s) => !clasesFaq.has(s.clase));
const objetivo = casos[0][1].pie[idxObjetivo];

console.log(`\n═══ P-C3-1 · la 4ª sección del pie del caso, ${casos.length} instancias, todos los pares`);
console.log(`  · identificada midiendo: pie del caso ${casos[0][1].pie.length} secciones · pie de la FAQ ${faqs[0][1].pie.length}`);
console.log(`  · la que sobra es S${idxObjetivo} «${objetivo?.clase}» — ${objetivo?.chars} chars normalizados`);

let difs = 0, pares = 0;
const otras = [];
const nSecs = [...new Set(casos.map(([, v]) => v.pie.length))];
if (nSecs.length > 1) {
  console.log(`  ❌ nº de secciones de pie distinto entre casos: ${nSecs.join(" vs ")}`);
  difs++;
}
for (let a = 0; a < casos.length; a++)
  for (let b = a + 1; b < casos.length; b++) {
    pares++;
    const [ia, va] = casos[a], [ib, vb] = casos[b];
    for (let s = 0; s < Math.min(va.pie.length, vb.pie.length); s++) {
      if (va.pie[s].html === vb.pie[s].html) continue;
      const A = va.pie[s].html, B = vb.pie[s].html;
      let i = 0; while (i < A.length && A[i] === B[i]) i++;
      const detalle = [`S${s} (${va.pie[s].clase}) difiere entre ${ia} y ${ib}`,
        `     …${A.slice(Math.max(0, i - 60), i + 60)}`,
        `     …${B.slice(Math.max(0, i - 60), i + 60)}`];
      if (s === idxObjetivo) { difs++; console.log("  ❌ " + detalle.join("\n  ")); }
      else otras.push({ seccion: s, clase: va.pie[s].clase, a: ia, b: ib, detalle });
    }
  }
console.log(
  difs === 0
    ? `  ✅ P-C3-1 SE SOSTIENE · ${pares} pares · S${idxObjetivo} idéntica byte a byte · 0 diferencias`
    : `  ❌ P-C3-1 REFUTADA · ${difs} diferencias en S${idxObjetivo} → se REABRE D5`,
);

/* ── Lo que se vio de PASO en las OTRAS secciones del pie ────────────────────
 * No cierra P-C3-1 y no toca D5, pero callarlo sería el defecto de imprimir sin
 * contar al revés: contarlo sin decirlo. Va con su propio recuento.          */
if (otras.length) {
  const porSeccion = {};
  for (const o of otras) porSeccion[`S${o.seccion} ${o.clase}`] = (porSeccion[`S${o.seccion} ${o.clase}`] || 0) + 1;
  console.log(`\n  · FUERA de P-C3-1 — otras secciones del pie que SÍ difieren entre casos:`);
  for (const [k, n] of Object.entries(porSeccion)) console.log(`      ${n} pares · ${k}`);
  console.log("  " + otras[0].detalle.join("\n  "));
  salida.pieOtrasSecciones = otras;
}

/* ────────────────── C-SP12 · el chip del detalle, ¿enlaza? ────────────────── */
console.log(`\n═══ C-SP12 · el chip de sector del DETALLE`);
for (const [k, v] of casos)
  console.log(`  ${k.padEnd(18)} texto=${JSON.stringify(v.campos.chips.texto)} enlaces=${v.campos.chips.enlaces.length} ${v.campos.chips.enlaces.map((a) => a.href).join(" ")}`);

/* ────────────────── C-SP9 · dónde vive el destacado ────────────────── */
console.log(`\n═══ C-SP9 · \`destacado\`: dónde vive y si lleva marcado`);
for (const [k, v] of casos) {
  const d = v.campos.destacado;
  const n = v.campos.necesidad;
  console.log(`  ${k.padEnd(18)} ${d ? `marcado=${d.tieneMarcado}` : "AUSENTE"} · dentro de \`necesidad\`=${n?.destacadoDentro} · último hijo=${n?.destacadoEsUltimo}`);
}

/* ────────────────── C-SP6 · hosts de iframe ────────────────── */
const hosts = {};
for (const v of Object.values(salida.paginas)) for (const f of v.iframes) hosts[f.host] = (hosts[f.host] || 0) + 1;
console.log(`\n═══ C-SP6 · hosts de \`iframe\` en el cuerpo (muestra, no censo)`);
for (const [h, n] of Object.entries(hosts).sort((a, b) => b[1] - a[1])) console.log(`  ×${n}  ${h}`);

w("medidas/c-spec.json", salida);
process.exit(difs === 0 ? 0 : 1);
