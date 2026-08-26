/**
 * EXTRACTOR DE `productos` — del corpus congelado al catálogo del CPT
 * `solutions`. Uso: npm run cms:extractor-p
 * Negativos: npm run cms:extractor-p-neg  (lector-muerto · control-roto · ficha-divergente · sin-seo)
 *
 * ── Por qué existe, y por qué la fuente es el PANEL y no la página ────────
 * `qa:productos-hueco` (PASO 1) repartió el hueco: de los 19 slugs que los 57
 * casos referencian, el clon modela 9 **a mano** (`src/lib/products.ts`,
 * transcritos de `medidas/c-spec.json` en julio) y faltan 10. Y midió dónde
 * está el dato:
 *
 * > **La ficha de un producto vive en el PANEL de `#lista-soluciones`, y el
 * > corpus la sirve para 17 de los 19.** Ninguna página de `productos/` sirve
 * > panel de cartucho — sólo los casos —, así que los 8 productos del CPT que
 * > ningún caso referencia **no tienen ficha en el corpus** y quedan fuera con
 * > su razón medida, no por olvido (§F3-COLA-DESTINOS: ésos necesitan PÁGINA).
 *
 * ── El invariante que este arquetipo estrena, y que hay que vigilar ───────
 * C-2 midió sobre 640 nodos de panel que **la ficha es PROYECCIÓN del
 * producto**: los `data-id` que salen en más de un caso dan la ficha idéntica.
 * Aquí eso deja de ser un hallazgo y pasa a ser **una precondición del
 * extractor**: si dos casos sirvieran fichas distintas para el mismo slug, leer
 * «la primera» devolvería una por azar de orden. Por eso se leen **TODAS** las
 * apariciones y **divergir es rojo** — hasta 98 por slug.
 *
 * ── El CONTROL, que es lo que autoriza a sustituir la fuente ──────────────
 * Los 9 transcritos a mano se comparan campo a campo contra lo extraído. Misma
 * disciplina que `extractor-a` y `extractor-c`: que el instrumento reproduzca lo
 * que una persona midió es lo que permite fiarse de los 10 que nadie miró.
 *
 * ⚠ **Y las discrepancias del control se CLASIFICAN, sin cubo de sobras.** Lo
 * que no encaje en una clase declarada sale `SIN CLASIFICAR` y es rojo — la
 * lección de la tanda de PIPELINE: *un cubo de «combinaciones» es donde se
 * pierden las clases que nadie nombró*.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No toca el original, no siembra y no decide modelo.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cargaExportados } from "./catalogos.mjs";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, QA, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["lector-muerto", "control-roto", "ficha-divergente", "sin-seo"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

/* ══════════════════════════════════════════════════════════════════════════
 * LOS LECTORES — censados, para que un selector muerto salga por error
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * El censo de lectores, propio y no el `Censo` de `lib.mjs`: aquél inyecta
 * `__q`/`__qa` en una PÁGINA y esta sonda no abre navegador — llamarlo aquí
 * habría sido una guarda que no cuenta nada, o sea *documentado no es
 * conectado* (§sondas 3) escrito a propósito.
 *
 * Cuenta intentos y aciertos por lector; **un lector con 0 aciertos sale por
 * error**, porque «no encontró nada» y «no miró» se escriben igual.
 */
const lectores = new Map();
const lee = (id, re, texto) => {
  const m = re.exec(texto);
  if (!lectores.has(id)) lectores.set(id, { intentos: 0, aciertos: 0 });
  const e = lectores.get(id);
  e.intentos++;
  if (m) e.aciertos++;
  return m;
};

/**
 * ⚠ `<span[^>]*\bdata-id=`, no `<span data-id=`: el original sirve **dos
 * espacios** en algunas instancias. Lo pagó `qa:productos-hueco` en su primera
 * corrida — 0 evidencias, sin error, y sólo la guarda de MUERTO lo cazó.
 */
const RE_LI = /<li><span[^>]*\bdata-id="([^"]+)"[^>]*>([\s\S]*?)<\/span><div[^>]*\bdata-id="item-\1"[^>]*>([\s\S]*?)<\/div><\/li>/g;
const RE_IMG = /<div class="lista-contenido-item-imagen">\s*(?:<img[^>]*\ssrc="([^"]+)")?/;
const RE_H4 = /<h4>([\s\S]*?)<\/h4>/;
const RE_INTRO = /<div class="lista-contenido-item-introduccion[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<a\b/;
const RE_HREF = /<a href="([^"]+)"[^>]*class="[^"]*et_pb_button/;
const RE_P = /<p>([\s\S]*?)<\/p>/g;
const RE_LIS = /<li>([\s\S]*?)<\/li>/g;
const RE_SUBTITULO = /<strong class="subtitulo-producto">([\s\S]*?)<\/strong>/;

const limpia = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/**
 * ── EL REPARTO TEXTO / HTML, y por qué el extractor TIENE que saberlo ─────
 * `ProductosTabs` pinta `bullets` con `dangerouslySetInnerHTML` y **todo lo
 * demás como TEXTO**. O sea que la misma cadena servida significa dos cosas
 * distintas según el campo, y copiarla igual en los dos sitios rompe uno:
 *
 * · en un campo HTML, `Plug &amp; Play` **es** el dato (y pinta `Plug & Play`);
 * · en un campo de texto, ese mismo valor **pinta `&amp;` literal**.
 *
 * Por eso los campos de texto se DECODIFICAN y los de HTML no. No es una
 * normalización de comodidad: es que el destino los interpreta distinto, y el
 * control lo confirma —la transcripción a mano decodificó los dos, y en
 * `bullets` eso era perder el dato sin cambiar el píxel.
 */
const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', "#039": "'", "#39": "'", nbsp: " " };
const decodifica = (s) =>
  String(s ?? "").replace(/&(amp|lt|gt|quot|#0?39|nbsp);/g, (t, e) => ENTIDADES[e] ?? ENTIDADES[e.replace(/^#0/, "#")] ?? t);

/**
 * ⚠ **`tagline` SE SIRVE CON MARCADO Y EL CLON NO PUEDE PINTARLO HOY.**
 * Medido: 2 de 19 traen marcado en línea en el subtítulo de la pestaña
 * (`Datos fiables sobre el H<sub>2</sub>S`), que es una FÓRMULA, no adorno — el
 * mismo caso que ya obligó a `bullets` a ser `htmlLinea`. `ProductosTabs` lo
 * pinta como TEXTO (`<strong>{p.tagline}</strong>`), así que sembrar el valor
 * servido imprimiría `<sub>` literal: sería una REGRESIÓN de píxel.
 *
 * Se quita el marcado **con su número y su ficha**, no en silencio
 * (`PENDIENTES-QA.md` §CMS-PR4-TAGLINE-MARCADO). Y el valor servido se congela
 * al lado, para que arreglarlo sea leer la medida y no volver al original.
 */
const sinMarcado = (s) => decodifica(String(s ?? "").replace(/<[^>]+>/g, ""));

/**
 * La media del panel, localizada igual que la de los metadatos
 * (`rutaLocalMedia` del grupo A): `…/wp-content/uploads/X` → `/images/uploads/X`.
 * Es la forma que el catálogo transcrito ya usa, así que el control la ejerce.
 */
const rutaLocalMedia = (src) =>
  typeof src === "string" && src.includes("/wp-content/uploads/")
    ? `/images/uploads/${src.split("/wp-content/uploads/")[1].split("?")[0]}`
    : (src ?? "");

/** Una ficha desde el `<li>` completo del panel. */
function fichaDe(idServido, spanHtml, cuerpoHtml) {
  const intro = lee("introduccion", RE_INTRO, cuerpoHtml);
  const parrafos = intro ? [...intro[1].matchAll(RE_P)].map((m) => limpia(m[1])) : [];
  const viñetas = intro ? [...intro[1].matchAll(RE_LIS)].map((m) => limpia(m[1])) : [];
  const h4 = lee("h4", RE_H4, cuerpoHtml);
  const img = lee("imagen", RE_IMG, cuerpoHtml);
  const href = lee("href", RE_HREF, cuerpoHtml);
  const sub = RE_SUBTITULO.exec(spanHtml);

  /* El 3.º párrafo es el TÍTULO de la lista (`<p><strong>Ventajas</strong></p>`),
   * y su valor es campo desde C-SP14: los cartuchos titulan «Especificaciones».
   * ⚠ Y esta corrida le encuentra un TERCER valor — `kunak-api` titula
   * **«Beneficios»** — que el catálogo transcrito a mano NO tenía, así que el
   * clon lleva pintando «Ventajas» donde el original dice otra cosa. */
  const tituloLista = parrafos[2] ? sinMarcado(parrafos[2]) : undefined;

  return {
    id: idServido,
    /* El rótulo de la pestaña es el `<span>` SIN su subtítulo — el subtítulo es
     * `tagline` y va aparte. */
    name: sinMarcado(limpia(spanHtml.replace(RE_SUBTITULO, ""))),
    tagline: sub ? sinMarcado(limpia(sub[1])) : "",
    description: decodifica(parrafos[0] ?? ""),
    highlight: decodifica(parrafos[1] ?? ""),
    /* **El defecto se omite del dato cuando coincide** — la regla de defaults de
     * la casa, y la razón de 4 de las discrepancias de control: el catálogo a
     * mano lo omitía y el extractor lo emitía. */
    ...(tituloLista && tituloLista !== DEFECTO_BULLETS_TITULO ? { bulletsTitulo: tituloLista } : {}),
    /* `bullets` es HTML (`htmlLinea` en el esquema, `dangerouslySetInnerHTML` en
     * el render): su dato es la fuente servida, entidades incluidas. */
    bullets: viñetas,
    image: img?.[1] ? rutaLocalMedia(img[1]) : "",
    href: href?.[1] ?? "",
    /* `h4` no es campo: en las 19 repite el rótulo. Se lee para PODER
     * comprobarlo, no para guardarlo. */
    _h4: h4 ? sinMarcado(limpia(h4[1])) : "",
    /* El valor SERVIDO del subtítulo, con su marcado, congelado al lado del que
     * se siembra. Es la evidencia de §CMS-PR4-TAGLINE-MARCADO. */
    _taglineServido: sub ? limpia(sub[1]) : "",
  };
}

/** El defecto medido de `bulletsTitulo` (C-SP14), declarado una vez. */
const DEFECTO_BULLETS_TITULO = "Ventajas";

/* ══════════════════════════════════════════════════════════════════════════
 * BARRIDO — todas las apariciones de cada slug, en todas las páginas
 * ═════════════════════════════════════════════════════════════════════════ */

const paginas = Object.entries(INDICE.paginas);
const apariciones = new Map(); // slug → [{pagina, ficha}]

/**
 * ⚠ **EL ÁMBITO, y no es cosmético: el mismo marcado sirve DOS shortcodes.**
 * `#lista-soluciones` pinta productos del CPT; `#producto-accesorios-*` pinta
 * **accesorios**, con los mismos `data-id`, los mismos `lista-contenido-item` y
 * los mismos botones. La primera versión de este extractor no acotaba y sacó
 * **29 productos en vez de 19** — diez accesorios (`panel-solar`,
 * `anemometro-*`, `pluviometro`…) colados como fichas del CPT.
 *
 * No dio error y no era un cero: era **un número plausible de más**, que es la
 * tercera cara de §sondas 4 y la que más invita a explicarse. La discriminación
 * es el CONTENEDOR, que es lo que dice qué es cada cosa — no un heurístico
 * sobre el contenido del panel.
 */
const RE_AMBITO = /id="lista-soluciones"[\s\S]*?<\/section>/g;

for (const [clave, p] of paginas) {
  const html = sinScriptNiStyle(readFileSync(join(CORPUS, p.fichero), "utf8"));
  if (!html.includes('id="lista-soluciones"')) continue;
  RE_AMBITO.lastIndex = 0;
  const ambitos = [...html.matchAll(RE_AMBITO)].map((a) => a[0]);
  lee("ambito", /id="lista-soluciones"/, html);
  const dentro = ambitos.join("\n");
  RE_LI.lastIndex = 0;
  let m;
  while ((m = RE_LI.exec(dentro))) {
    const [, id, span, cuerpo] = m;
    const ficha = fichaDe(id, span, cuerpo);
    if (!ficha.href) continue;
    if (!apariciones.has(id)) apariciones.set(id, []);
    apariciones.get(id).push({ pagina: clave, ficha });
  }
}

/* Sabotaje 1: el lector del `<li>` no casa ⇒ 0 fichas. Sin la guarda, «no hay
 * productos» y «no miré ninguno» dan la misma salida (§sondas 4). */
if (SABOTAJE === "lector-muerto") apariciones.clear();

/* Sabotaje 3: una aparición trae otra ficha ⇒ la premisa «la ficha es proyección
 * del producto» deja de sostenerse, y leer «la primera» sería azar de orden. */
if (SABOTAJE === "ficha-divergente") {
  const [, lista] = [...apariciones.entries()].find(([, l]) => l.length > 1) ?? [];
  if (lista) lista[1] = { ...lista[1], ficha: { ...lista[1].ficha, description: "OTRA COSA" } };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA GUARDA DEL INVARIANTE — la ficha no puede divergir entre apariciones
 * ═════════════════════════════════════════════════════════════════════════ */

const divergentes = [];
const catalogo = [];
for (const [slug, lista] of [...apariciones.entries()].sort()) {
  const firmas = new Map();
  for (const a of lista) firmas.set(JSON.stringify(a.ficha), (firmas.get(JSON.stringify(a.ficha)) ?? 0) + 1);
  if (firmas.size > 1)
    divergentes.push({ slug, formas: firmas.size, apariciones: lista.length, paginas: lista.slice(0, 3).map((a) => a.pagina) });
  const { _h4, _taglineServido, ...ficha } = lista[0].ficha;
  catalogo.push({ ...ficha, _apariciones: lista.length, _h4CoincideConRotulo: _h4 === ficha.name, _taglineServido });
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL SEO — de la medida congelada de las 24 URLs, por slug
 * ═════════════════════════════════════════════════════════════════════════ */

/* ⚠ GUARDA CON DIAGNÓSTICO (114.ª, PASO 0): un `ENOENT` pelado no dice QUIÉN
 * produce esta congelada, y §regla 5bis puede haber LIBERADO el nombre canónico
 * a propósito al renombrarla. */
const F_SEO = join(QA, "medidas/solutions-seo.json");
if (!existsSync(F_SEO))
  throw new Error(
    `CONGELADA AUSENTE: no existe medidas/solutions-seo.json.\n` +
      `  La produce \`npm run qa:solutions-seo\`. Si la renombraron (§regla 5bis), el nombre\n` +
      `  canónico quedó LIBRE a propósito: repunta este lector al nombre nuevo.`,
  );
const SEO = JSON.parse(readFileSync(F_SEO, "utf8"));
const seoPorSlug = new Map();
for (const f of SABOTAJE === "sin-seo" ? [] : SEO.filas) {
  const segs = f.url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/es(?=\/|$)/, "").split("/").filter(Boolean);
  seoPorSlug.set(segs[segs.length - 1], {
    title: f.title,
    ...(f.description ? { description: f.description } : {}),
    ...(f.ogImage ? { ogImage: f.ogImage } : {}),
  });
}

/** El discriminador de CMS-PR3, con la MISMA pregunta que hace la ida. */
const tienePagina = (p) => {
  const segs = String(p.href ?? "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/es(?=\/|$)/, "").split("/").filter(Boolean);
  return segs.length > 0 && segs[segs.length - 1] === p.id;
};

const filas = catalogo.map((p) => {
  const seo = seoPorSlug.get(p.id);
  const conPagina = tienePagina(p);
  const { _apariciones, _h4CoincideConRotulo, _taglineServido, ...limpio } = p;
  return {
    ...limpio,
    /* `seo` sólo donde el documento tiene página: es donde `qa:solutions-seo` lo
     * midió, y donde el esquema lo exige (CMS-PR3). */
    ...(conPagina && seo ? { seo } : {}),
    _meta: { apariciones: _apariciones, h4CoincideConRotulo: _h4CoincideConRotulo, pagina: conPagina ? "propia" : "ninguna", taglineServido: _taglineServido },
  };
});

/** Un documento CON página y sin `seo` medido no puede sembrarse: el esquema lo
 *  exige. Se nombra aquí en vez de morir en el alta. */
const sinSeo = filas.filter((f) => f._meta.pagina === "propia" && !f.seo).map((f) => f.id);

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTROL — los 9 transcritos a mano, campo a campo
 * ═════════════════════════════════════════════════════════════════════════ */

/* ⚠ **El control se lee de SU FICHERO, no del catálogo activo.** Desde que
 *  cambió de fuente a , pasar por
 *  compararía la salida de este extractor CONSIGO MISMA — un
 * control que no puede fallar, que es la peor forma de pasar. */
const aMano = new Map(
  (await cargaExportados("src/lib/products.ts", ["PRODUCTS_TABS", "PRODUCTS_CARTUCHOS"])).map((p) => [p.id, p]),
);
const extraidoPorId = new Map(filas.map((f) => [f.id, f]));

/**
 * Las clases de discrepancia **declaradas**. Lo que no encaje sale
 * `SIN CLASIFICAR` y es rojo: no hay cubo de sobras.
 */
const CLASIFICA = (campo, aM, ex) => {
  const s = (x) => (Array.isArray(x) ? x.join("␟") : String(x ?? ""));
  const quitaMarcado = (x) => s(x).replace(/<[^>]+>/g, "");
  if (s(aM) === s(ex)) return null;
  /* La transcripción a mano NORMALIZÓ marcado en línea que el original SÍ sirve
   * (`H<sub>2</sub>S` → `H2S`). Es la clase que `CLAUDE.md` §El principio tiene
   * fichada: *se midió sobre la TRANSCRIPCIÓN, que ya había tirado lo que
   * faltaba*. Gana el original. */
  if (quitaMarcado(ex) === s(aM) && /<[a-z]/i.test(s(ex))) return "transcripcion-perdio-marcado";
  /* La transcripción DECODIFICÓ entidades en un campo que se pinta como HTML
   * (`bullets`). El píxel es el mismo —`&amp;` y `&` pintan igual dentro de
   * `dangerouslySetInnerHTML`— pero el DATO no: el servido es la fuente. */
  if (s(ex).replace(/&amp;/g, "&") === s(aM)) return "transcripcion-decodifico-entidades";
  /* El catálogo a mano OMITÍA `bulletsTitulo` y el original sirve un valor que
   * NO es el defecto. No es normalización: es un dato que faltaba, y el clon
   * lleva pintando el defecto en su lugar. */
  if (campo === "bulletsTitulo" && !s(aM) && s(ex)) return "⚠ DATO QUE FALTABA EN LA TRANSCRIPCIÓN";
  /* El `href` del catálogo a mano está LOCALIZADO donde el clon construye la
   * ruta; el servido es siempre absoluto. No es discrepancia de dato. */
  if (campo === "href" && s(ex).endsWith(`${s(aM).replace(/^\//, "")}/`)) return "href-localizado-a-mano";
  return "SIN CLASIFICAR";
};

const CAMPOS = ["name", "tagline", "description", "highlight", "bulletsTitulo", "bullets", "image", "href"];
const discrepancias = [];
let comparaciones = 0;
for (const [id, aM] of aMano) {
  const ex = extraidoPorId.get(id);
  if (!ex) { discrepancias.push({ id, campo: "(documento)", clase: "SIN CLASIFICAR", aMano: "existe", extraido: "AUSENTE" }); continue; }
  for (const campo of CAMPOS) {
    comparaciones++;
    const a = SABOTAJE === "control-roto" && campo === "name" ? "SABOTEADO" : aM[campo];
    const clase = CLASIFICA(campo, a, ex[campo]);
    if (clase) discrepancias.push({ id, campo, clase, aMano: String(Array.isArray(a) ? a.join(" | ") : a ?? "").slice(0, 110), extraido: String(Array.isArray(ex[campo]) ? ex[campo].join(" | ") : ex[campo] ?? "").slice(0, 110) });
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

const ev = new Evaluadas({ nombre: "extractor-p", unidad: "productos extraídos", minimo: SABOTAJE ? 1 : 19 });
for (const _ of filas) ev.ok();

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

console.log(`\n════════ EXTRACTOR DE \`productos\` · ${paginas.length} páginas del corpus ════════\n`);
console.log(`   productos con ficha SERVIDA        ${String(filas.length).padStart(4)}`);
console.log(`   · con página propia                ${String(filas.filter((f) => f._meta.pagina === "propia").length).padStart(4)}`);
console.log(`   · SIN página propia (CMS-PR3)      ${String(filas.filter((f) => f._meta.pagina === "ninguna").length).padStart(4)}   ${filas.filter((f) => f._meta.pagina === "ninguna").map((f) => f.id).join(" · ")}`);
console.log(`   apariciones leídas                 ${String(filas.reduce((a, f) => a + f._meta.apariciones, 0)).padStart(4)}`);

if (divergentes.length)
  err(
    `FICHA DIVERGENTE en ${divergentes.length} slug(s): ${divergentes.map((d) => `${d.slug} (${d.formas} formas en ${d.apariciones})`).join(" · ")}.\n` +
      `   La premisa «la ficha es proyección del producto» (C-2, 640 nodos) deja de sostenerse,\n` +
      `   y leer «la primera aparición» sería devolver una por azar de orden.`,
  );
else console.log(`   ✓ ficha IDÉNTICA en todas las apariciones de cada slug (invariante de C-2, re-medido)`);

if (sinSeo.length)
  err(`SIN SEO MEDIDO: ${sinSeo.length} documento(s) con página propia y sin fila en solutions-seo.json — ${sinSeo.join(" · ")}.`);

console.log(`\n  ── CONTROL · los ${aMano.size} transcritos a mano, ${CAMPOS.length} campos ──`);
const porClase = new Map();
for (const d of discrepancias) porClase.set(d.clase, (porClase.get(d.clase) ?? 0) + 1);
console.log(`   comparaciones ${comparaciones} · discrepancias ${discrepancias.length}`);
for (const [clase, n] of [...porClase].sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(3)}  ${clase}`);
for (const d of discrepancias.filter((x) => x.clase === "SIN CLASIFICAR").slice(0, 12))
  console.log(`     ⛔ ${d.id} · ${d.campo}\n        a mano   ${d.aMano}\n        servido  ${d.extraido}`);
const sinClasificar = discrepancias.filter((d) => d.clase === "SIN CLASIFICAR").length;
if (sinClasificar)
  err(`${sinClasificar} discrepancia(s) SIN CLASIFICAR — un cubo de sobras es donde se pierden las clases que nadie nombró.`);

console.log(`\n  ── CENSO DE LECTORES ──`);
const muertos = [];
for (const [id, e] of lectores) {
  if (e.aciertos === 0) muertos.push(id);
  console.log(`   ${id.padEnd(16)} ${String(e.aciertos).padStart(4)}/${String(e.intentos).padStart(4)} aciertos${e.aciertos === 0 ? "  ⛔ MUERTO" : ""}`);
}
if (!lectores.size) err(`el censo de lectores está VACÍO: ningún lector llegó a intentarlo.`);
if (muertos.length) err(`LECTOR MUERTO: ${muertos.join(" · ")} — no casó ni una vez. Un cero de lector no es un dato.`);
if (!filas.length) err(`0 productos extraídos — eso no es «el CPT está vacío», es que el lector no casa.`);

/* ⚠ §regla 24, mitad de higiene: **la sonda desvía sus propios sabotajes.**
 * Hasta la 97.ª esto congelaba en `medidas/p-extraido.json` con SABOTAJE puesto.
 * La guarda de `w()` impide pisar la canónica —el contenido difiere—, así que no
 * había corrupción; pero lo que salía era un fichero **fechado y SIN marcar**,
 * o sea con nombre de medida y contenido de sabotaje (§regla 7). El desvío no
 * puede depender de que quien la lanza se acuerde de poner `NEG=`: se arregla la
 * CLASE, no la instancia. */
const SALIDA = SABOTAJE ? nombreNeg("medidas/p-extraido.json", SABOTAJE) : "medidas/p-extraido.json";
if (SABOTAJE) console.log(`\n  ⚠ SABOTAJE activo: la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.`);

w(SALIDA, {
  meta: {
    fecha: hoy(),
    que: "el catálogo del CPT `solutions` derivado del PANEL servido en el corpus congelado",
    fuentes: [
      `corpus/ (${paginas.length} páginas) — el panel de #lista-soluciones`,
      "medidas/solutions-seo.json — el bloque seo de las 24 URLs",
      "apps/web/src/lib/products.ts — el CONTROL (9 transcritos a mano)",
    ],
    alcance:
      "los 19 slugs que los 57 casos referencian. Los 8 productos del CPT que NINGÚN caso " +
      "referencia NO tienen panel en el corpus y quedan fuera con su razón medida (§F3-COLA-DESTINOS: necesitan PÁGINA).",
    sabotaje: SABOTAJE,
    noMide: ["no toca el original", "no siembra", "no decide modelo"],
  },
  recuento: {
    extraidos: filas.length,
    conPagina: filas.filter((f) => f._meta.pagina === "propia").length,
    sinPagina: filas.filter((f) => f._meta.pagina === "ninguna").length,
    apariciones: filas.reduce((a, f) => a + f._meta.apariciones, 0),
  },
  invariante: { divergentes },
  control: {
    denominador: `${aMano.size} de ${filas.length} productos · ${CAMPOS.length} campos · ${comparaciones} comparaciones`,
    porClase: Object.fromEntries(porClase),
    discrepancias,
  },
  catalogo: { productos: filas.map(({ _meta, ...f }) => f) },
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} extractor-p: ${filas.length} productos · ${discrepancias.length} discrepancias de control ` +
    `(${sinClasificar} sin clasificar) · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
