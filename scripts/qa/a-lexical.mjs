/**
 * PILOTO DE CMS-0e — ¿la conversión HTML clásico → Lexical es SIN PÉRDIDA?
 * Uso: npm run qa:a-lexical            (necesita Chrome; no necesita el clon)
 *
 * ── La pregunta, exacta ────────────────────────────────────────────────────
 * `docs/ESQUEMA-CMS.md` §CMS-0e: convertir el cuerpo **al importar**, o guardar
 * **HTML crudo primero** y convertir por entrada después. El esquema dice que se
 * decide «con un piloto sobre la muestra adversaria de 24», y esto es ese piloto.
 *
 * **No migra nada.** Produce la evidencia: cuántas de las 24 se convierten sin
 * pérdida, cuántas pierden algo que el importador puede arreglar solo, y cuántas
 * necesitan que una persona aporte lo que falta.
 *
 * ── Cómo se decide «sin pérdida», que es lo único que importa aquí ─────────
 * No se compara HTML contra HTML —eso siempre difiere y no dice nada—. Se
 * extraen **invariantes** de los dos lados y se exige igualdad exacta:
 *
 *   texto · enlaces · encabezados (con su `id`, T6 abierta) · énfasis
 *   (incluidos sub/sup, 139/209) · imágenes con leyenda · listas · citas ·
 *   reglas · tablas · embebidos
 *
 * El texto se compara como **flujo de caracteres sin espacios**: así la
 * comparación es inmune a dónde une bloques cada lado —que es decisión de
 * serialización, no contenido— y sigue cazando un solo carácter perdido.
 *
 * ── Y el árbol convertido se mide a SÍ MISMO, no al HTML de origen ────────
 * Las invariantes del lado Lexical se leen **del árbol de nodos**, no del HTML.
 * Si el convertidor tira algo, no hay de dónde sacarlo y el diff lo canta. Leer
 * las dos del mismo sitio habría dado 24/24 limpio sin mirar nada — es el fallo
 * que `CLAUDE.md` llama «una sonda que no mira nada da la misma salida que una
 * que no encuentra nada».
 *
 * ── La rebanada es la MISMA del censo, y se comprueba ──────────────────────
 * `extraerPostContent` es el emparejamiento equilibrado de `<div>` de
 * `a-censo.mjs`. Para que no puedan divergir, cada página compara su longitud de
 * texto contra la congelada en `medidas/a-censo.json`: si no cuadra, esa página
 * **no se juzga** (o el original ha cambiado, o la rebanada no es la misma), se
 * cuenta como DERIVA y sale en el informe. Medir otra cosa que el censo y
 * llamarlo lo mismo es cómo se fabrican dos verdades.
 *
 * ── Test en negativo ───────────────────────────────────────────────────────
 * Tres modos, uno por familia de invariante, y cada uno TIENE que caer por un
 * diff distinto — si dos cayeran por el mismo, uno de los dos no se está
 * mirando:
 *
 *   SABOTAJE=sub      el convertidor no emite sub/sup   → `formato:subscript`
 *   SABOTAJE=hid      el heading pierde su `id`         → `encabezados`
 *   SABOTAJE=leyenda  el upload no absorbe la leyenda   → `imagenes`
 *
 * El de `leyenda` es el fino: el texto de la leyenda NO se pierde —se convierte
 * como párrafo suelto—, así que el invariante `texto` sigue cuadrando y solo
 * cae la asociación imagen↔leyenda. Una sonda que solo mirase texto daría
 * «limpio» con la leyenda desprendida.
 *
 * ⚠ Se sabotea el CONVERTIDOR, no el HTML de origen. Quitar la construcción del
 * origen la quita de los DOS lados a la vez: cuadrarían y no se probaría nada.
 * Lo que hay que provocar es justo la asimetría que la sonda existe para ver.
 *
 * Protocolo §0 del README: un «limpio» sin haber probado que sabe fallar no es
 * un dato.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { launch, w, QA } from "./lib.mjs";

const DORMIR = Number(process.env.DORMIR || 150); // cortesía con el sitio vivo
const SABOTAJE = process.env.SABOTAJE || "";

/* ─────────── la muestra adversaria y el censo, los dos congelados ─────────── */

const muestra = JSON.parse(readFileSync(join(QA, "medidas/a-muestra.json"), "utf8"));
const censo = JSON.parse(readFileSync(join(QA, "medidas/a-censo.json"), "utf8"));

const CHARS_CENSO = new Map();
for (const d of Object.values(censo.formas))
  for (const p of d.paginas) if (!p.error) CHARS_CENSO.set(p.url, p.chars);

const PAGINAS = Object.entries(muestra.formas).flatMap(([forma, d]) =>
  d.muestra.map((m) => ({ forma, url: m.url, chars: m.chars, razones: m.razones })),
);
if (PAGINAS.length !== 24) {
  console.error(`❌ la muestra no trae 24 páginas sino ${PAGINAS.length}`);
  process.exit(2);
}

/* ─────────── extracción del cuerpo: la misma que a-censo.mjs ─────────── */

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

/**
 * `chars` **con la definición del censo**, copiada literal de `a-censo.mjs`.
 *
 * ⚠ Esto costó una corrida entera de falsos positivos: la primera versión
 * comparaba el `chars` del censo contra `textContent` del DOM, y **21 de 24
 * páginas salieron como DERIVA**. No había derivado ninguna — el censo sustituye
 * **cada etiqueta por un espacio** antes de colapsar, así que `<p>a</p><p>b</p>`
 * le da `a b` (3) y a `textContent` le da `ab` (2). Dos definiciones de «lo
 * mismo» y una guarda que dispara. La guarda tiene que usar la definición de
 * aquello con lo que compara, o no es una guarda: es ruido con autoridad.
 */
function charsCenso(blob) {
  return blob
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

/* ═══════════════════ conversión + invariantes, en el navegador ═══════════════
 * Va entera dentro de `page.evaluate` porque necesita un parser de HTML de
 * verdad: es el mismo que usaría Lexical al importar (`$generateNodesFromDOM`
 * recibe un DOM, no una cadena). Escribir un parser a mano aquí habría metido
 * sus propios fallos en la medida.
 *
 * ⚠ Nada del módulo viaja: todo lo que use tiene que estar dentro o llegar por
 * argumento (trampa ya pagada, README §«Dos trampas»).
 * ═════════════════════════════════════════════════════════════════════════ */

async function convertirEnNavegador(page, html, sabotaje) {
  return page.evaluate(
    (html, sabotaje) => {
      // `\s` en JS ya incluye el espacio duro (U+00A0), así que el `&nbsp;` del
      // editor clásico colapsa igual en los dos lados de la comparación.
      const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
      // El texto se compara como FLUJO DE CARACTERES sin espacios: dónde une
      // bloques cada lado es serialización, no contenido — pero un solo carácter
      // de prosa que se caiga sigue cantando.
      const flujo = (s) => (s || "").replace(/\s+/g, "");

      const doc = new DOMParser().parseFromString(
        `<body><div id="__raiz">${html}</div></body>`,
        "text/html",
      );
      const raiz = doc.getElementById("__raiz");

      /* ── §3.3: la lista CERRADA de proveedores de embebido ── */
      const PROVEEDOR = [
        [/youtube\.com|youtu\.be|youtube-nocookie\.com/i, "youtube"],
        [/ourworldindata\.org/i, "ourworldindata"],
        [/flourish\.studio/i, "flourish"],
        [/platform\.twitter\.com|\btwitter\.com|\bx\.com/i, "twitter"],
        [/instagram\.com/i, "instagram"],
      ];
      const proveedorDe = (u) => {
        for (const [re, nombre] of PROVEEDOR) if (re.test(u || "")) return nombre;
        return null;
      };

      /* ── §3.3: los scripts que NO son embebido, con su sustitución ── */
      const SUSTITUCION = [
        [/FB3D_CLIENT_DATA/, "flipbook-fb3d", "el PDF, como relación a media"],
        [/cdn\.jsdelivr\.net\/npm\/swiper/i, "galeria-swiper", "una galería nativa"],
        [/nbcwashington\.com\/portableplayer/i, "reproductor-nbc", "un enlace a la noticia"],
      ];

      /* ── §3.1: qué admite el campo rico ── */
      const INLINE = {
        strong: "bold", b: "bold", em: "italic", i: "italic",
        u: "underline", s: "strikethrough", strike: "strikethrough", del: "strikethrough",
        sub: "subscript", sup: "superscript", mark: "mark", small: "small",
      };
      // T5: estructura suelta del editor clásico — se desenvuelve, no se pierde
      const DESENVOLVER = new Set([
        "div", "span", "section", "article", "header", "footer", "main",
        "picture", "font", "tbody", "thead", "tfoot", "colgroup", "col", "label",
      ]);
      const IGNORAR_TEXTO = new Set(["script", "style", "noscript"]);

      const perdidas = [];   // lo que la conversión NO representa
      const notas = [];      // transformaciones aplicadas, para el informe
      const sinMapear = {};  // etiqueta → veces, de lo que no encaja en nada
      // Elementos ya absorbidos por otro nodo (la leyenda viaja dentro del
      // upload). Sin esto se convertirían dos veces o cero, según el orden.
      const consumidos = new Set();

      /**
       * Flujo de caracteres cubierto por CADA formato, en orden de documento.
       *
       * ⚠ Es la única forma de comparar énfasis entre un HTML y un árbol, y la
       * primera versión de esta sonda no lo hacía: contaba ELEMENTOS con
       * `querySelectorAll('strong,b,em,…')` contra NODOS DE TEXTO del árbol. Un
       * `<strong>` con un `<a>` dentro es 1 elemento y 2 nodos de texto, así que
       * daba «386 → 403 negritas» en una página donde no se había perdido nada.
       * Contar cosas distintas y llamarlas iguales es la forma más cara de
       * fabricar un defecto.
       */
      function streamsOrigen(el, formatos, acc) {
        for (const n of el.childNodes) {
          if (n.nodeType === 3) {
            for (const f of formatos) acc[f] = (acc[f] || "") + n.nodeValue;
            continue;
          }
          if (n.nodeType !== 1) continue;
          const tag = n.tagName.toLowerCase();
          // mismo criterio que `textoOrigen`: el RAWTEXT del iframe no es prosa
          if (IGNORAR_TEXTO.has(tag) || tag === "iframe") continue;
          streamsOrigen(n, INLINE[tag] ? new Set([...formatos, INLINE[tag]]) : formatos, acc);
        }
      }

      /* ══════════════ 1 · invariantes del ORIGEN (el HTML servido) ══════════ */

      /**
       * ⚠ `iframe` se excluye igual que `script`/`style`/`noscript`, y por una
       * razón medida, no por comodidad.
       *
       * El parser de HTML5 trata el contenido de `<iframe>` como RAWTEXT: todo
       * lo que hay hasta `</iframe>` es texto, no marcado. En el corpus hay
       * iframes MAL CERRADOS por quien editó —`<iframe …>&nbsp;</p><p></iframe>`
       * en una página, `<br/>Ver Real Decreto 214/2025` en otra—, así que esos
       * caracteres de marcado acaban siendo texto del documento.
       *
       * Contarlos como contenido hacía que el invariante `texto` acusara al
       * convertidor de perder 13 y 135 caracteres que no son prosa de nadie:
       * son restos del parser sobre HTML roto, y el árbol emite ahí un `embed`
       * —que es exactamente lo que hay que hacer—. Dos de las 24 salían CON
       * PÉRDIDA por esto.
       */
      const RAWTEXT = "script,style,noscript,iframe";

      const textoOrigen = (() => {
        const c = raiz.cloneNode(true);
        c.querySelectorAll(RAWTEXT).forEach((n) => n.remove());
        return c.textContent || "";
      })();

      /** El elemento de leyenda asociado a una imagen, si lo hay. */
      const capDe = (img) => {
        const cont = img.closest(".wp-caption, figure");
        return cont ? cont.querySelector(".wp-caption-text, figcaption") : null;
      };
      const leyendaDe = (img) => {
        const cap = capDe(img);
        return cap ? norm(cap.textContent) : "";
      };

      const origen = {
        texto: flujo(textoOrigen),
        palabras: norm(textoOrigen).split(" ").filter(Boolean).length,
        enlaces: [...raiz.querySelectorAll("a")].map((a) => ({
          href: a.getAttribute("href") || "",
          txt: norm(a.textContent),
          target: a.getAttribute("target") || "",
          rel: a.getAttribute("rel") || "",
          boton: a.classList.contains("et_pb_button"),
        })),
        encabezados: [...raiz.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
          nivel: Number(h.tagName[1]),
          txt: norm(h.textContent),
          id: h.getAttribute("id") || "",
        })),
        formatos: (() => {
          const acc = {};
          streamsOrigen(raiz, new Set(), acc);
          for (const k of Object.keys(acc)) {
            acc[k] = flujo(acc[k]);
            if (!acc[k]) delete acc[k];
          }
          return acc;
        })(),
        imagenes: [...raiz.querySelectorAll("img")].map((i) => ({
          src: (i.getAttribute("src") || "").split("/").pop(),
          alt: i.getAttribute("alt") || "",
          w: i.getAttribute("width") || "",
          h: i.getAttribute("height") || "",
          srcset: !!i.getAttribute("srcset"),
          leyenda: leyendaDe(i),
        })),
        // ⚠ items y citas se comparan como FLUJO, no con `norm`, por la misma
        // razón que el texto: un `<li>` puede llevar una lista anidada dentro y
        // un `blockquote` lleva `<p>`. En el origen esos bloques vienen
        // separados por el espacio de formato del fuente; en el árbol,
        // `textoDe` concatena sin separador. Con `norm` eso daba un diff en una
        // de las 24 —lista anidada— donde no faltaba ni un carácter: los dos
        // lados decían lo mismo y el que discrepaba era el comparador.
        listas: [...raiz.querySelectorAll("ul,ol")].map((l) => ({
          tipo: l.tagName.toLowerCase(),
          items: [...l.children].filter((c) => c.tagName === "LI").map((c) => flujo(c.textContent)),
        })),
        citas: [...raiz.querySelectorAll("blockquote")].map((b) => flujo(b.textContent)),
        reglas: raiz.querySelectorAll("hr").length,
        saltos: raiz.querySelectorAll("br").length,
        tablas: [...raiz.querySelectorAll("table")].map((t) => ({
          filas: t.querySelectorAll("tr").length,
          celdas: t.querySelectorAll("td,th").length,
          thead: !!t.querySelector("thead"),
          tfoot: !!t.querySelector("tfoot"),
        })),
      };

      /* ══════════════ 2 · conversión a la estructura Lexical ═══════════════ */

      const T = (txt, f) => ({ t: "text", txt, f: [...f].sort() });

      /** Inline → nodos de texto con formatos acumulados, y enlaces. */
      function inline(nodo, formatos, salida) {
        for (const hijo of nodo.childNodes) {
          if (hijo.nodeType === 3) {
            if (hijo.nodeValue) salida.push(T(hijo.nodeValue, formatos));
            continue;
          }
          if (hijo.nodeType !== 1) continue;
          if (consumidos.has(hijo)) continue;
          const tag = hijo.tagName.toLowerCase();

          if (IGNORAR_TEXTO.has(tag)) { bloqueEspecial(hijo, salida); continue; }
          if (tag === "br") { salida.push({ t: "linebreak" }); continue; }
          if (tag === "img") { salida.push(upload(hijo)); continue; }

          if (INLINE[tag]) {
            // SABOTAJE del test en negativo: el convertidor "olvida" sub y sup.
            const f = new Set(formatos);
            const olvidado =
              sabotaje === "sub" &&
              (INLINE[tag] === "subscript" || INLINE[tag] === "superscript");
            if (!olvidado) f.add(INLINE[tag]);
            inline(hijo, f, salida);
            continue;
          }
          if (tag === "a") {
            const hijos = [];
            inline(hijo, formatos, hijos);
            // T1 · el 80 % del corpus pinta botones con una clase del tema
            const boton = hijo.classList.contains("et_pb_button");
            if (boton) notas.push("T1 enlace→botón");
            salida.push({
              t: "link",
              url: hijo.getAttribute("href") || "",
              target: hijo.getAttribute("target") || "",
              rel: hijo.getAttribute("rel") || "",
              variante: boton ? "boton" : null,
              hijos,
            });
            continue;
          }
          if (DESENVOLVER.has(tag)) { inline(hijo, formatos, salida); continue; } // T5
          // cualquier otra cosa dentro de un párrafo: se trata como bloque
          bloque(hijo, salida);
        }
      }

      /** `script`/`style`/`noscript`: nunca sobreviven como tales (T4). */
      function bloqueEspecial(el, salida) {
        const tag = el.tagName.toLowerCase();
        if (tag !== "script") {
          perdidas.push({
            que: `<${tag}> en el contenido`,
            clase: "recuperable",
            detalle: "no está en la whitelist §3.1; se descarta al importar",
          });
          return;
        }
        const src = el.getAttribute("src") || "";
        const cuerpo = el.textContent || "";
        const prov = proveedorDe(src);
        if (prov) { salida.push({ t: "embed", proveedor: prov, id: src }); notas.push(`T4 script→embed ${prov}`); return; }
        for (const [re, nombre, sust] of SUSTITUCION) {
          if (re.test(src) || re.test(cuerpo)) {
            perdidas.push({
              que: `script ${nombre}`,
              clase: "irrecuperable",
              detalle: `§3.3 lo elimina y exige sustituto: ${sust}. El importador no lo puede fabricar`,
            });
            salida.push({ t: "hueco", motivo: nombre });
            return;
          }
        }
        perdidas.push({
          que: `script sin clasificar (${src || "en línea"})`,
          clase: "irrecuperable",
          detalle: "no es proveedor de la lista cerrada ni sustitución conocida",
        });
      }

      function upload(img) {
        // T2 · el ancho absoluto del editor clásico no es dato del autor
        const cont = img.closest(".wp-caption, figure");
        const estilo = (cont && cont.getAttribute("style")) || img.getAttribute("style") || "";
        if (/width\s*:\s*\d+px/i.test(estilo)) notas.push("T2 style width px eliminado");
        // T3 · las clases wp-* se van; la relación con el media es de colección
        if (/wp-image-\d+|wp-caption|aligncenter/.test((cont ? cont.className : "") + " " + img.className))
          notas.push("T3 clases wp-* eliminadas");
        // La leyenda es un campo del nodo upload, y es TEXTO RICO: puede llevar
        // enlaces y énfasis. Se absorbe aquí (y se marca consumida) para que el
        // recorrido no la convierta además como párrafo suelto.
        // SABOTAJE `leyenda`: el upload no la absorbe. El texto NO se pierde
        // —cae después como párrafo suelto—, así que solo se rompe la
        // asociación imagen↔leyenda: cae `imagenes` y `texto` sigue cuadrando.
        const cap = sabotaje === "leyenda" ? null : capDe(img);
        const hijosLeyenda = [];
        if (cap) { consumidos.add(cap); inline(cap, new Set(), hijosLeyenda); }
        return {
          t: "upload",
          src: (img.getAttribute("src") || "").split("/").pop(),
          alt: img.getAttribute("alt") || "",
          w: img.getAttribute("width") || "",
          h: img.getAttribute("height") || "",
          srcset: !!img.getAttribute("srcset"),
          hijosLeyenda,
        };
      }

      /** La celda es texto rico: modelarla como opaca haría parecer pérdida el
       *  énfasis de dentro. §3.4 sigue abierta (nodo de Lexical vs block), pero
       *  en las dos salidas la celda lleva contenido rico. */
      function tabla(el) {
        const celdas = [...el.querySelectorAll("td,th")];
        const hijos = celdas.map((c) => {
          const h = [];
          inline(c, new Set(), h);
          return { t: "celda", hijos: h };
        });
        return {
          t: "table",
          filas: el.querySelectorAll("tr").length,
          celdas: celdas.length,
          thead: !!el.querySelector("thead"),
          tfoot: !!el.querySelector("tfoot"),
          hijos,
        };
      }

      function bloque(el, salida) {
        if (consumidos.has(el)) return;
        const tag = el.tagName.toLowerCase();

        if (IGNORAR_TEXTO.has(tag)) return bloqueEspecial(el, salida);

        if (tag === "p") {
          const hijos = [];
          inline(el, new Set(), hijos);
          salida.push({ t: "paragraph", hijos });
          return;
        }
        if (/^h[1-6]$/.test(tag)) {
          const n = Number(tag[1]);
          let nivel = n;
          if (n === 1 || n > 4) {
            // §3.1 habilita h2·h3·h4; h1 y h5 son residuales y NO se habilitan
            nivel = n === 1 ? 2 : 4;
            perdidas.push({
              que: `<${tag}>`,
              clase: "recuperable",
              detalle: `fuera de la whitelist §3.1; degradado a h${nivel} al importar`,
            });
          }
          const hijos = [];
          inline(el, new Set(), hijos);
          // T6 ABIERTA: el `id` se conserva tal cual, sin regenerar
          // SABOTAJE `hid`: el convertidor tira el ancla del encabezado.
          const anclaje = sabotaje === "hid" ? "" : el.getAttribute("id") || "";
          salida.push({ t: "heading", nivel, id: anclaje, hijos });
          return;
        }
        if (tag === "ul" || tag === "ol") {
          const items = [...el.children]
            .filter((c) => c.tagName === "LI")
            .map((li) => {
              const hijos = [];
              inline(li, new Set(), hijos);
              return { t: "listitem", hijos };
            });
          salida.push({ t: "list", tipo: tag, hijos: items });
          return;
        }
        if (tag === "blockquote") {
          const hijos = [];
          for (const c of el.childNodes) {
            if (c.nodeType === 3) { if (c.nodeValue) hijos.push(T(c.nodeValue, new Set())); continue; }
            if (c.nodeType === 1) bloque(c, hijos);
          }
          salida.push({ t: "quote", hijos });
          return;
        }
        if (tag === "hr") { salida.push({ t: "horizontalrule" }); return; }
        if (tag === "img") { salida.push(upload(el)); return; }
        if (tag === "br") { salida.push({ t: "linebreak" }); return; }
        if (tag === "table") { salida.push(tabla(el)); return; }
        if (tag === "a") {
          // ⚠ Un `<a>` SUELTO a nivel de bloque —sin `<p>` que lo envuelva—.
          // La versión anterior hacía `inline(el, …)`, que recorre los HIJOS del
          // enlace: el nodo `link` no se emitía y el enlace desaparecía entero,
          // dejando solo su texto. Como el texto sí sobrevivía, el invariante
          // `texto` cuadraba y solo lo delataba `enlaces` — 6 páginas de las 24.
          // Hay que envolverlo, no desenvolverlo: un párrafo con el enlace
          // dentro, que es lo que `inline` produce cuando el `<a>` sí venía
          // envuelto.
          //
          // ⚠ Se construye sobre el elemento REAL, no sobre un clon. La primera
          // versión de este arreglo hacía `cloneNode(true)` dentro de un div
          // sintético, y eso sacaba al `<img>` de su `.wp-caption`: el
          // `closest()` de `capDe` devolvía null y las imágenes enlazadas
          // perdían la leyenda —2 de las 24—. Un arreglo que estrena su propio
          // defecto en otro invariante.
          const hijosEnlace = [];
          inline(el, new Set(), hijosEnlace);
          const boton = el.classList.contains("et_pb_button");
          if (boton) notas.push("T1 enlace→botón");
          salida.push({
            t: "paragraph",
            hijos: [{
              t: "link",
              url: el.getAttribute("href") || "",
              target: el.getAttribute("target") || "",
              rel: el.getAttribute("rel") || "",
              variante: boton ? "boton" : null,
              hijos: hijosEnlace,
            }],
          });
          return;
        }

        if (tag === "iframe") {
          const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
          const prov = proveedorDe(src);
          if (prov) { salida.push({ t: "embed", proveedor: prov, id: src }); return; }
          perdidas.push({
            que: `iframe de ${(src.split("/")[2] || src).slice(0, 60)}`,
            clase: "irrecuperable",
            detalle: "proveedor fuera de la lista cerrada de 5 (§3.3): o se amplía la lista, o se decide caso a caso",
          });
          salida.push({ t: "hueco", motivo: "iframe-no-listado" });
          return;
        }
        if (tag === "video" || tag === "embed" || tag === "audio" || tag === "source") {
          if (tag === "source") return; // viaja con su <video>
          perdidas.push({
            que: `<${tag}>`,
            clase: "recuperable",
            detalle: "§3.1 no tiene nodo de vídeo: hace falta uno (upload o embed propio). Es hueco de esquema, no de dato",
          });
          salida.push({ t: "hueco", motivo: tag });
          // El contenido de reserva del reproductor (texto y el enlace al .mp4)
          // SÍ es dato del autor y sobrevive: si no se bajara aquí, la pérdida
          // se contaría dos veces —el vídeo y su enlace— y sonaría peor de lo
          // que es. Lo que falta es el nodo, no el texto.
          for (const c of el.childNodes) {
            if (c.nodeType === 3) { if (c.nodeValue) salida.push(T(c.nodeValue, new Set())); continue; }
            if (c.nodeType === 1 && c.tagName.toLowerCase() !== "source") bloque(c, salida);
          }
          return;
        }
        if (tag === "center") {
          perdidas.push({
            que: "<center>",
            clase: "recuperable",
            detalle: "alineación: §3.1 la deja SIN PROBAR y no la habilita; el texto sobrevive, la alineación no",
          });
          for (const c of el.childNodes) {
            if (c.nodeType === 3) { if (c.nodeValue) salida.push(T(c.nodeValue, new Set())); continue; }
            if (c.nodeType === 1) bloque(c, salida);
          }
          return;
        }
        if (tag === "figure") {
          for (const c of el.childNodes) {
            if (c.nodeType === 3) { if (c.nodeValue) salida.push(T(c.nodeValue, new Set())); continue; }
            if (c.nodeType === 1) bloque(c, salida);
          }
          return;
        }
        if (tag === "figcaption") { // sin imagen que la absorba: es un párrafo
          const hijos = [];
          inline(el, new Set(), hijos);
          salida.push({ t: "paragraph", hijos });
          return;
        }
        if (tag === "li") { // <li> suelto fuera de lista
          const hijos = [];
          inline(el, new Set(), hijos);
          salida.push({ t: "listitem", hijos });
          return;
        }
        if (INLINE[tag]) {
          // ⚠ El formato del PROPIO elemento entra en el conjunto inicial. Con
          // `new Set()` se perdía: `<small>` suelto daba un párrafo sin `small`,
          // y el texto seguía cuadrando, así que solo lo veía `formato:small`
          // —329 caracteres a 0 en una de las 24—.
          const hijos = [];
          inline(el, new Set([INLINE[tag]]), hijos);
          salida.push({ t: "paragraph", hijos });
          return;
        }
        if (DESENVOLVER.has(tag)) { // T5
          for (const c of el.childNodes) {
            if (c.nodeType === 3) { if (c.nodeValue) salida.push(T(c.nodeValue, new Set())); continue; }
            if (c.nodeType === 1) bloque(c, salida); // `consumidos` corta las leyendas
          }
          return;
        }

        sinMapear[tag] = (sinMapear[tag] || 0) + 1;
        perdidas.push({
          que: `<${tag}>`,
          clase: "irrecuperable",
          detalle: "no hay nodo ni regla: el importador no sabe qué hacer con esto",
        });
      }

      const arbol = [];
      for (const c of raiz.childNodes) {
        if (c.nodeType === 3) { if (c.nodeValue.trim()) arbol.push(T(c.nodeValue, new Set())); continue; }
        if (c.nodeType === 1) bloque(c, arbol);
      }

      /* ══════════ 3 · invariantes del ÁRBOL CONVERTIDO (no del HTML) ═══════ */

      const conv = {
        texto: "", palabras: 0, enlaces: [], encabezados: [], formatos: {},
        imagenes: [], listas: [], citas: [], reglas: 0, saltos: 0, tablas: [],
        embeds: [], huecos: [],
      };

      /** Todo hijo de un nodo, incluida la leyenda que viaja dentro del upload. */
      const hijosDe = (n) => [...(n.hijosLeyenda || []), ...(n.hijos || [])];

      const textoDe = (nodos) => {
        let s = "";
        for (const n of nodos) {
          if (n.t === "text") s += n.txt;
          else s += textoDe(hijosDe(n));
        }
        return s;
      };

      /**
       * Como `textoDe`, pero SIN bajar a la leyenda absorbida por un `upload`.
       *
       * Hace falta solo para el texto del ENLACE, y por una asimetría real: en
       * el original la leyenda es HERMANA del `<a>` —`<a><img></a><p
       * class="wp-caption-text">…</p>` dentro del mismo `.wp-caption`—, así que
       * el `textContent` del enlace no la incluye. Al convertir, la leyenda pasa
       * a ser un campo del `upload`, que sí cuelga del enlace: leerla con
       * `textoDe` metía la leyenda dentro del texto del enlace y daba dos
       * páginas CON PÉRDIDA por un texto que no se ha perdido, solo cambiado de
       * sitio.
       *
       * Para encabezados, ítems y citas NO se usa: ahí la imagen y su leyenda sí
       * están dentro del contenedor en los dos lados, y excluirla daría el falso
       * positivo contrario.
       */
      const textoPropio = (nodos) => {
        let s = "";
        for (const n of nodos) {
          if (n.t === "text") s += n.txt;
          else s += textoPropio(n.hijos || []);
        }
        return s;
      };

      /** El espejo de `streamsOrigen`, leído del ÁRBOL. */
      const streamsArbol = (nodos, acc) => {
        for (const n of nodos) {
          if (n.t === "text") {
            for (const f of n.f) acc[f] = (acc[f] || "") + n.txt;
            continue;
          }
          streamsArbol(hijosDe(n), acc);
        }
      };

      (function recorrer(nodos) {
        for (const n of nodos) {
          switch (n.t) {
            case "heading":
              conv.encabezados.push({ nivel: n.nivel, txt: norm(textoDe(n.hijos)), id: n.id });
              break;
            case "link":
              conv.enlaces.push({
                href: n.url, txt: norm(textoPropio(n.hijos)),
                target: n.target, rel: n.rel, boton: n.variante === "boton",
              });
              break;
            case "upload":
              conv.imagenes.push({
                src: n.src, alt: n.alt, w: n.w, h: n.h, srcset: n.srcset,
                // derivada del subárbol, no copiada del origen: si la conversión
                // de la leyenda pierde algo, aquí se ve
                leyenda: norm(textoDe(n.hijosLeyenda)),
              });
              break;
            case "list":
              // flujo, no norm: ver la nota en el lado del origen
              conv.listas.push({ tipo: n.tipo, items: n.hijos.map((li) => flujo(textoDe(li.hijos))) });
              break;
            case "quote":
              conv.citas.push(flujo(textoDe(n.hijos)));
              break;
            case "horizontalrule": conv.reglas++; break;
            case "linebreak": conv.saltos++; break;
            case "table":
              conv.tablas.push({ filas: n.filas, celdas: n.celdas, thead: n.thead, tfoot: n.tfoot });
              break;
            case "embed": conv.embeds.push({ proveedor: n.proveedor, id: n.id }); break;
            case "hueco": conv.huecos.push(n.motivo); break;
          }
          recorrer(hijosDe(n));
        }
      })(arbol);

      const txtConv = textoDe(arbol);
      conv.texto = flujo(txtConv);
      conv.palabras = norm(txtConv).split(" ").filter(Boolean).length;
      {
        const acc = {};
        streamsArbol(arbol, acc);
        for (const k of Object.keys(acc)) {
          acc[k] = flujo(acc[k]);
          if (!acc[k]) delete acc[k];
        }
        conv.formatos = acc;
      }

      /* ══════════════════════ 4 · el diff, invariante a invariante ═════════ */

      const difs = [];

      /**
       * Primer elemento que difiere, serializado. Es OBLIGATORIO en todo `cmp`
       * de listas: sin él, dos arrays de la misma longitud con distinto
       * contenido imprimen «10 → 10», que es un descuadre anunciado y no
       * contado — el defecto que `CLAUDE.md` §«Dos reglas sobre las sondas»
       * pone el primero. Si las longitudes coinciden, el número no dice nada y
       * el ejemplo es lo único que informa.
       */
      const primerDistinto = (a, b) => {
        const n = Math.min(a.length, b.length);
        for (let i = 0; i < n; i++)
          if (JSON.stringify(a[i]) !== JSON.stringify(b[i]))
            return `#${i} ${JSON.stringify(a[i])} → ${JSON.stringify(b[i])}`;
        // mismos primeros n: entonces lo que sobra o falta está en la cola
        const larga = a.length > b.length ? a : b;
        const lado = a.length > b.length ? "solo en origen" : "solo en convertido";
        return `${a.length} → ${b.length}; ${lado}: ${JSON.stringify(larga.slice(n)).slice(0, 220)}`;
      };

      const cmp = (nombre, a, b) => {
        if (JSON.stringify(a) === JSON.stringify(b)) return;
        const lista = Array.isArray(a);
        difs.push({
          invariante: nombre,
          origen: lista ? a.length : a,
          convertido: lista ? b.length : b,
          ejemplo: lista ? primerDistinto(a, b) : undefined,
        });
      };

      if (origen.texto !== conv.texto) {
        // ¿qué se perdió? primer punto de divergencia, con contexto
        let i = 0;
        while (i < origen.texto.length && origen.texto[i] === conv.texto[i]) i++;
        difs.push({
          invariante: "texto",
          origen: origen.texto.length,
          convertido: conv.texto.length,
          ejemplo:
            `diverge en el carácter ${i}: origen «…${origen.texto.slice(Math.max(0, i - 30), i + 40)}…» ` +
            `vs convertido «…${conv.texto.slice(Math.max(0, i - 30), i + 40)}…»`,
        });
      }
      cmp("enlaces", origen.enlaces, conv.enlaces);
      cmp("encabezados", origen.encabezados, conv.encabezados);
      // Los énfasis se comparan formato a formato, como flujo de caracteres
      // cubierto: dice CUÁL se pierde y DÓNDE, no cuántas etiquetas hay.
      for (const f of new Set([...Object.keys(origen.formatos), ...Object.keys(conv.formatos)])) {
        const a = origen.formatos[f] || "";
        const b = conv.formatos[f] || "";
        if (a === b) continue;
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        difs.push({
          invariante: `formato:${f}`,
          origen: a.length,
          convertido: b.length,
          ejemplo: `diverge en ${i}: origen «${a.slice(Math.max(0, i - 20), i + 30)}» vs convertido «${b.slice(Math.max(0, i - 20), i + 30)}»`,
        });
      }
      cmp("imagenes", origen.imagenes, conv.imagenes);
      cmp("listas", origen.listas, conv.listas);
      cmp("citas", origen.citas, conv.citas);
      cmp("reglas", origen.reglas, conv.reglas);
      cmp("saltos", origen.saltos, conv.saltos);
      cmp("tablas", origen.tablas, conv.tablas);

      return {
        origen: {
          chars: norm(textoOrigen).length,
          palabras: origen.palabras,
          enlaces: origen.enlaces.length,
          botones: origen.enlaces.filter((e) => e.boton).length,
          encabezados: origen.encabezados.length,
          conId: origen.encabezados.filter((h) => h.id).length,
          // caracteres cubiertos por cada énfasis, no nº de etiquetas
          formatos: Object.fromEntries(
            Object.entries(origen.formatos).map(([k, v]) => [k, v.length]),
          ),
          sub: (origen.formatos.subscript || "").length,
          sup: (origen.formatos.superscript || "").length,
          imagenes: origen.imagenes.length,
          conLeyenda: origen.imagenes.filter((i) => i.leyenda).length,
          listas: origen.listas.length,
          citas: origen.citas.length,
          tablas: origen.tablas.length,
        },
        convertido: {
          nodos: JSON.stringify(arbol).length,
          embeds: conv.embeds,
          huecos: conv.huecos,
        },
        difs,
        perdidas,
        sinMapear,
        notas: [...new Set(notas)],
      };
    },
    html,
    sabotaje,
  );
}

/* ═══════════════════════════════ recorrido ═══════════════════════════════ */

console.log(`\n════════ PILOTO CMS-0e · HTML clásico → Lexical, ${PAGINAS.length} páginas ════════`);
if (SABOTAJE) console.log(`⚠ SABOTAJE=${SABOTAJE} — test en negativo, se espera que CAIGA\n`);

const { browser } = await launch();
const page = await browser.newPage();
await page.goto("about:blank");

/* ══════════════════ PROBETA: el control del test en negativo ══════════════
 * `PROBETA=1 node a-lexical.mjs` convierte este fragmento en vez de las 24.
 *
 * Existe por una razón medida, no por comodidad: **las 24 páginas de la muestra
 * traen 299 encabezados en el cuerpo y NINGUNO con `id`** (comprobado sobre el
 * HTML servido, 2026-07-30). El invariante del `id` —T6— no lo ejercita el
 * corpus, así que sabotearlo contra las 24 no probaría nada: no caería por
 * falta de materia, no por ceguera de la sonda. Y ésas son justo las dos cosas
 * que un test en negativo tiene que distinguir.
 *
 * La probeta lleva UNA instancia de cada construcción que los tres sabotajes
 * atacan. El control (sin sabotaje) tiene que salir LIMPIA: si no, el fallo
 * está en la sonda y ningún veredicto suyo vale.
 * ═══════════════════════════════════════════════════════════════════════ */
const PROBETA = `
<h2 id="ancla-uno">Un encabezado con ancla</h2>
<p>Prosa con <strong>negrita</strong>, <em>cursiva</em>, CO<sub>2</sub> y m<sup>3</sup>.</p>
<p>Un párrafo con <a href="/es/destino/">un enlace</a> dentro.</p>
<div class="wp-caption aligncenter" style="width: 310px">
  <img src="https://kunakair.com/wp-content/uploads/foto.jpg" alt="una foto"
       width="300" height="200" class="wp-image-123" />
  <p class="wp-caption-text">Leyenda con <em>cursiva</em> dentro</p>
</div>
<ul><li>primero</li><li>segundo</li></ul>
<blockquote><p>una cita</p></blockquote>
<hr />
<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>
<a href="/es/suelto/">un enlace suelto, sin párrafo que lo envuelva</a>
<small>un inline suelto al nivel de bloque</small>
`;

if (process.env.PROBETA) {
  const r = await convertirEnNavegador(page, PROBETA, SABOTAJE);
  await browser.close();
  const etiqueta = SABOTAJE ? `SABOTAJE=${SABOTAJE}` : "control (sin sabotaje)";
  console.log(`\n──── PROBETA · ${etiqueta} ────`);
  console.log(
    `  origen: ${r.origen.encabezados} h (${r.origen.conId} con id) · ` +
      `${r.origen.enlaces} a · ${r.origen.imagenes} img (${r.origen.conLeyenda} con leyenda) · ` +
      `sub ${r.origen.sub} · sup ${r.origen.sup} · ${r.origen.listas} listas · ` +
      `${r.origen.citas} citas · ${r.origen.tablas} tablas`,
  );
  for (const d of r.difs)
    console.log(`  ✗ ${d.invariante}: ${d.origen} → ${d.convertido}${d.ejemplo ? ` | ${d.ejemplo}` : ""}`);
  for (const x of r.perdidas) console.log(`  ${x.clase === "irrecuperable" ? "❌" : "⚠"} ${x.que} — ${x.detalle}`);
  const invariantes = r.difs.map((d) => d.invariante);
  console.log(
    r.difs.length || r.perdidas.length
      ? `\n  CAE por: ${invariantes.join(", ") || "(solo pérdidas declaradas)"}`
      : `\n  LIMPIA — ningún invariante se mueve`,
  );
  // Sin sabotaje la probeta TIENE que salir limpia; con sabotaje TIENE que caer.
  const esperadoOk = SABOTAJE ? r.difs.length > 0 : r.difs.length === 0 && r.perdidas.length === 0;
  console.log(esperadoOk ? "  ✅ se comporta como debe" : "  ❌ NO se comporta como debe");
  process.exit(esperadoOk ? 0 : 1);
}

const salida = {
  meta: {
    fecha: "2026-07-30",
    fuente: "HTML servido del original",
    muestra: "medidas/a-muestra.json (adversaria, 24)",
    sabotaje: SABOTAJE || null,
  },
  paginas: [],
};

let limpias = 0, conPerdida = 0, irrecuperables = 0, deriva = 0, fallos = 0;

for (const p of PAGINAS) {
  const corto = p.url.replace("https://kunakair.com/es/", "").replace(/\/$/, "").slice(-58);
  try {
    const res = await fetch(p.url, { redirect: "follow" });
    const html = await res.text();
    const cuerpo = extraerPostContent(html);
    if (cuerpo === null) {
      fallos++;
      salida.paginas.push({ ...p, error: "sin et_pb_post_content", http: res.status });
      console.log(`  ⚠ ${corto}  sin et_pb_post_content (HTTP ${res.status})`);
      continue;
    }

    const r = await convertirEnNavegador(page, cuerpo, SABOTAJE);

    /* La rebanada tiene que ser la MISMA que censó a-censo.json. Si no, esta
     * página no se juzga: se estaría midiendo otro documento y llamándolo igual.
     *
     * ⚠ Se compara `charsCenso(cuerpo)` —la definición del censo, aplicada al
     * MISMO blob crudo— y no el `chars` que devuelve el navegador, que es
     * `textContent` normalizado. Son dos definiciones distintas de «lo mismo»:
     * el censo mete un espacio POR ETIQUETA antes de colapsar, así que
     * `<p>a</p><p>b</p>` le da 3 y a `textContent` le da 2. La primera versión
     * de esta sonda comparaba contra el del navegador y marcó 21 de 24 páginas
     * como DERIVA sin que ninguna hubiera derivado — dejando el recuento en
     * 3 páginas juzgadas y el veredicto en nada. La guarda tiene que usar la
     * definición de aquello con lo que compara, o no es una guarda: es ruido
     * con autoridad. */
    const ahoraCenso = charsCenso(cuerpo);
    const esperado = CHARS_CENSO.get(p.url);
    const derivo = esperado !== undefined && esperado !== ahoraCenso;

    const irre = r.perdidas.filter((x) => x.clase === "irrecuperable");
    const recu = r.perdidas.filter((x) => x.clase === "recuperable");
    const veredicto = derivo
      ? "DERIVA"
      : irre.length
        ? "IRRECUPERABLE"
        : r.difs.length || recu.length
          ? "CON PÉRDIDA"
          : "LIMPIA";

    if (veredicto === "DERIVA") deriva++;
    else if (veredicto === "IRRECUPERABLE") irrecuperables++;
    else if (veredicto === "CON PÉRDIDA") conPerdida++;
    else limpias++;

    salida.paginas.push({
      ...p, veredicto,
      // los dos comparables entre sí (definición del censo), y aparte el del
      // DOM, que es otra medida y no debe confundirse con éstas
      charsCenso: esperado ?? null,
      charsAhora: ahoraCenso,
      charsDom: r.origen.chars,
      origen: r.origen,
      convertido: r.convertido,
      difs: r.difs,
      perdidas: r.perdidas,
      sinMapear: r.sinMapear,
      notas: r.notas,
    });

    const icono = { LIMPIA: "✅", "CON PÉRDIDA": "⚠", IRRECUPERABLE: "❌", DERIVA: "🔀" }[veredicto];
    // `formatos` es un mapa formato→caracteres cubiertos, no un número: se
    // imprime cuántos formatos distintos hay. Imprimirlo tal cual daba
    // `fmt [object Object]`, que es un dato que no dice nada ocupando el sitio
    // de uno que sí.
    const nFmt = Object.keys(r.origen.formatos).length;
    console.log(
      `  ${icono} ${corto.padEnd(58)} ${String(r.origen.chars).padStart(6)} ch · ` +
        `a ${String(r.origen.enlaces).padStart(3)} · h ${String(r.origen.encabezados).padStart(2)} · ` +
        `fmt ${String(nFmt).padStart(2)} · img ${String(r.origen.imagenes).padStart(2)} · ` +
        `tbl ${r.origen.tablas}`,
    );
    if (derivo)
      console.log(`       🔀 el censo dice ${esperado} chars y ahora hay ${r.origen.chars}: NO se juzga`);
    for (const d of r.difs)
      console.log(`       ✗ ${d.invariante}: ${d.origen} → ${d.convertido}${d.ejemplo ? ` | ${d.ejemplo}` : ""}`);
    for (const x of r.perdidas)
      console.log(`       ${x.clase === "irrecuperable" ? "❌" : "⚠"} ${x.que} — ${x.detalle}`);
  } catch (e) {
    fallos++;
    salida.paginas.push({ ...p, error: String(e).slice(0, 200) });
    console.log(`  ⚠ ${corto}  ${String(e).slice(0, 120)}`);
  }
  if (DORMIR) await new Promise((r) => setTimeout(r, DORMIR));
}

await browser.close();

/* ════════════════════════════════ informe ════════════════════════════════ */

const juzgadas = limpias + conPerdida + irrecuperables;
salida.resumen = { juzgadas, limpias, conPerdida, irrecuperables, deriva, fallos };

// agregados que el informe necesita y que no se deben recontar a mano
const porClase = {};
for (const pg of salida.paginas)
  for (const x of pg.perdidas || []) {
    const k = `${x.clase} · ${x.que.replace(/\(.*\)/, "").trim()}`;
    porClase[k] = (porClase[k] || 0) + 1;
  }
salida.perdidasAgregadas = porClase;

console.log(`\n════════ RESUMEN ════════`);
console.log(`  ✅ limpias         ${limpias}`);
console.log(`  ⚠ con pérdida     ${conPerdida}   (el importador lo arregla solo)`);
console.log(`  ❌ irrecuperables  ${irrecuperables}   (hace falta que una persona aporte el sustituto)`);
if (deriva) console.log(`  🔀 deriva          ${deriva}   (el original cambió respecto al censo: NO juzgadas)`);
if (fallos) console.log(`  ⚠ fallos          ${fallos}`);
console.log(`  ── ${juzgadas} juzgadas de ${PAGINAS.length}`);

if (Object.keys(porClase).length) {
  console.log(`\n  pérdidas por tipo:`);
  for (const [k, v] of Object.entries(porClase).sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(v).padStart(3)} × ${k}`);
}

// Una corrida saboteada NO puede pisar la congelada: son dos medidas distintas
// y el fichero es lo único que queda para auditarlas después.
w(SABOTAJE ? `medidas/a-lexical-sabotaje-${SABOTAJE}.json` : "medidas/a-lexical.json", salida);

/* Código de salida: 0 solo si TODAS las juzgadas salen limpias. El piloto no
 * "aprueba" nada — pero un piloto que devuelve 0 con pérdidas dentro sería el
 * mismo informe que uno sin pérdidas, y eso es lo que este repo no admite. */
const todoLimpio = juzgadas > 0 && limpias === juzgadas && deriva === 0 && fallos === 0;
console.log(`\n${todoLimpio ? "✅" : "❌"} conversión sin pérdida en ${limpias}/${PAGINAS.length}`);
process.exit(todoLimpio ? 0 : 1);
