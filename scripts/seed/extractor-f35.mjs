/**
 * EXTRACTOR DEL LOTE **F3-5** — del corpus congelado al catálogo de `arquetipos`.
 * Uso: npm run cms:extractor-f35
 * Negativos: npm run cms:extractor-f35-neg
 *   (tipo-fantasma · media-ausente · ritmo-cableado · sin-modulos · bloqueo-mudo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PRODUCE, Y EN QUÉ UNIDAD
 *
 * **4 FILAS** de `arquetipos`, una por documento del lote, con **231 módulos de
 * PRIMER NIVEL** dentro (90 · 35 · 70 · 36). Las tres cifras del mismo objeto
 * son ciertas y cuentan cosas distintas —231 de primer nivel · 311 nodos
 * `.et_pb_module` en el DOM · 215 con caja dentro del truncado del comparador—,
 * y ésta es la del elemento de la unión (§2n del ESQUEMA).
 *
 * La fuente es el **CORPUS**, no `src/lib`. Los 231 se midieron sobre
 * `monitor-calidad-aire.html` y compañía; sembrar desde `src/lib` —como hacen
 * `sectores` y `monograficos` por su vía `modulo`+`exportado`— poblaría el
 * content type con una estructura que **nadie midió contra el original**.
 *
 * ── EL RITMO SE OMITE, Y ESO ESTÁ DERIVADO ───────────────────────────────
 * `arquetipos` declara `ritmo.mb` y `ritmo.pt` como CAMPO. Los valores medidos
 * los publica `escalon1-varianza-127.json`, y su alcance es **la familia
 * PRODUCTO** (monitor · estación · sensor) — **no el lote**. Reparto: 132 pares ·
 * 8 CAMPO · 26 PLANTILLA · 98 SIN ESCRIBIR.
 *
 * **Y los 8 CAMPO son los 8 del MISMO documento** (§*un veredicto producido
 * sobre un agregado no se puede atribuir a sus miembros*): el valor no-default
 * está SIEMPRE en `estacion-de-monitoreo-…`, que no es del lote. El único del
 * lote en esa familia lleva **el default en las 5 piezas**:
 *
 *   parametros·mb 0 · clear-both·mb 0 · menu-anclas·mb 31.6719 (= 2.75 % de su
 *   fila) · menu-anclas·pt 0 · clear·pt 0
 *
 * > **Ningún documento del lote tiene un valor de ritmo medido como
 * > no-default, así que el `ritmo` de los 231 módulos se OMITE.** Los otros 226
 * > ni siquiera entraron en el denominador de la 127.ª: son **SIN MEDIR por
 * > alcance**, que no es «default confirmado». Se declara, no se cablea — un
 * > valor cableado donde tocaba omitir es un campo inventado con una medida de
 * > coartada.
 *
 * El sabotaje `ritmo-cableado` existe para que eso no se relaje en silencio.
 *
 * ── EL DENOMINADOR DE LOS BLOQUEOS SE DERIVA, NO SE RE-CORRE (§regla 27) ──
 * `validaHtmlCorpus` mira CUATRO ejes —script · etiqueta · host · atributo— y
 * devuelve **el primero** que falla. Un proceso que aborta al primer fallo
 * contesta *«hay al menos uno»*, nunca *«hay N»*, y este repo ya pagó
 * «uno por corrida» con su reset por delante. Aquí se recorren **los cuatro**
 * contra el mismo dato y **los que salgan a cero se publican con su
 * denominador** — «0 bloqueos de host» y «no miré host» son la misma salida si
 * el informe no lo nombra.
 *
 * ── LO QUE NO HACE ───────────────────────────────────────────────────────
 * No toca el original, no siembra y no decide modelo. Y **no mide geometría**:
 * el ritmo sale del análisis de la 127.ª, no de este recorrido.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, QA, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus/productos");
const PUBLICO = join(RAIZ, "apps/web/public");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["tipo-fantasma", "media-ausente", "ritmo-cableado", "sin-modulos", "bloqueo-mudo"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ── el parser y el validador, IMPORTADOS — no hay segunda definición ────── */
const A = await import(pathToFileURL(join(DERIV, "arbol-f33.mjs")).href);
const { validaHtmlCorpus, etiquetasFueraDelCenso, hostsFueraDeAllowlist, atributosFueraDelCenso } = await import(
  pathToFileURL(join(RAIZ, "packages/cms-config/src/campos/comunes.ts")).href
);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — los 4, con su discriminante
 * ═════════════════════════════════════════════════════════════════════════ */
const DOCS = [
  { doc: "monitor-calidad-aire.html", slug: "monitor-calidad-aire", arquetipo: "producto" },
  { doc: "accesorios.html", slug: "accesorios", arquetipo: "catalogo" },
  { doc: "software-de-medicion-calidad-del-aire.html", slug: "software-de-medicion-calidad-del-aire", arquetipo: "software" },
  { doc: "kunak-api.html", slug: "kunak-api", arquetipo: "software", varianteCorta: true },
];

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const CT126 = join(DERIV, "tipos-f35-126.json");
const faltan0 = [...DOCS.map((d) => join(CORPUS, d.doc)), CT126, PUBLICO].filter((p) => !existsSync(p));
if (faltan0.length) throw new Error(`PRECONDICIÓN: faltan ${faltan0.length}:\n  ${faltan0.join("\n  ")}`);

const ev = new Evaluadas({ sonda: "cms:extractor-f35", minimo: DOCS.length, unidad: "documentos del lote F3-5" });

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · UTILIDADES — copiadas de `extractor-f33`, que es el patrón del repo
 * ═════════════════════════════════════════════════════════════════════════ */
const tieneClase = (n, c) => n.clases.includes(c);
const buscaClase = (n, c) => {
  for (const h of A.recorre(n)) if (tieneClase(h, c)) return h;
  return null;
};
const attr = (n, nombre) => new RegExp(`\\b${nombre}="([^"]*)"`).exec(n.attrs || "")?.[1];
const dentro = (html, n) => html.slice(n.ini, n.fin).trim();
const texto = (html, n) => dentro(html, n).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const oUndef = (v) => (v === undefined || v === null || v === "" ? undefined : v);
const RE_IMG = /<img\b[^>]*>/i;
const imgDe = (html, n) => RE_IMG.exec(dentro(html, n))?.[0] ?? null;
const attrTag = (tag, nombre) => (tag ? new RegExp(`\\b${nombre}="([^"]*)"`).exec(tag)?.[1] : undefined);

/**
 * URL del original → ruta local. **La cola viaja VERBATIM**, igual que en
 * `transformaciones.mjs` L995-1003: decodificar o colapsar variantes cambiaría
 * el `src` servido por uno equivalente pero DISTINTO, y eso ya no es un NO-OP.
 *
 * ⚠ El PASO 0 de esta tanda midió el precio de saltárselo: colapsar
 * `-\d+x\d+` convierte rutas que EXISTEN en rutas que no
 * (`kunak_IMG_0061-copia-300X300.jpg` — el `-300X300` es parte del NOMBRE).
 */
const RE_SUBIDAS = /^https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/(.+)$/i;
const rutaLocalMedia = (u) => {
  if (typeof u !== "string") return u;
  const m = RE_SUBIDAS.exec(u.trim());
  return m ? `/images/uploads/${m[1]}` : u;
};

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · T-NOMBRE-MEDIA — la transformación de nombre, con su cardinal y su control
 *
 * El clon transcribió a mano en julio los nombres de la galería de PRODUCTO
 * normalizándolos a minúsculas, y `PM2.5` perdió además el punto
 * (`monitor.ts:227-228`). Así que el corpus pide `PM2.5_belgium.webp` y el repo
 * tiene `pm25_belgium.webp`. **Son 6, todas del mismo canal.**
 *
 * ⚠ Y NO es «case-insensitive y ya»: `existsSync` en Windows YA las encuentra
 * —da 1 de 6—, pero en LINUX no, y el que manda es Linux. Por eso la
 * comprobación de esta transformación es **byte a byte contra `readdirSync`**,
 * no `existsSync`.
 *
 * La transformación se DECLARA con su cardinal y **su candidato se DERIVA**
 * (normalizando y exigiendo que sea ÚNICO en su directorio). Un candidato
 * ambiguo TIRA: §regla 6, una ausencia se rechaza, no se sustituye.
 * ═════════════════════════════════════════════════════════════════════════ */
const cacheDir = new Map();
const listaDe = (dir) => {
  if (!cacheDir.has(dir)) cacheDir.set(dir, existsSync(dir) ? readdirSync(dir) : []);
  return cacheDir.get(dir);
};
const existeExacto = (rel) => {
  const abs = join(PUBLICO, decodeURIComponent(rel));
  return listaDe(dirname(abs)).includes(basename(abs));
};
const T_NOMBRE = [];
const norm = (s) => s.toLowerCase().replace(/[._-]/g, "");
function resuelveMedia(rel0, donde) {
  let rel = rel0;
  if (typeof rel !== "string" || !rel.startsWith("/")) return rel;
  /* ⚠⚠ EL SABOTAJE VA EN EL DATO, NO EN LA COMPROBACIÓN (§28a) — y la v1 lo
     tenía al revés: hacía `return rel` ANTES de comprobar, así que la ruta salía
     sin resolver **y sin anotarse**. `MEDIA_SIN_RESOLVER` daba 0, el control
     imprimía su ✅, y el caso pasaba igualmente porque el exit 2 venía de los
     22 bloqueos de HTML — o sea CAYENDO POR OTRO MOTIVO.
     Lo cazó `prohibidoEnSalida`, no el código de salida: §regla 17, 2.ª cara.
     Ahora se rompe el DATO —la ruta apunta a un fichero que no existe— y la
     comprobación hace su trabajo. */
  if (SABOTAJE === "media-ausente" && /2023\/09/.test(rel)) rel = rel.replace(/\.webp$/, "-QUE-NO-EXISTE.webp");
  if (existeExacto(rel)) return rel;
  const abs = join(PUBLICO, decodeURIComponent(rel));
  const cands = listaDe(dirname(abs)).filter((f) => norm(f) === norm(basename(abs)));
  if (cands.length === 1) {
    const nuevo = join(dirname(rel), cands[0]).replace(/\\/g, "/");
    T_NOMBRE.push({ donde, de: rel, a: nuevo });
    return nuevo;
  }
  /* Ni exacto ni candidato único: se ANOTA y se deja pasar para que el
     denominador salga entero (§regla 27) — quien mata es el seed. */
  MEDIA_SIN_RESOLVER.push({ donde, ruta: rel, candidatos: cands.length });
  return rel;
}
const MEDIA_SIN_RESOLVER = [];

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL RECORRIDO — módulos de PRIMER NIVEL del cuerpo
 * ═════════════════════════════════════════════════════════════════════════ */
/** El tipo se deriva del ORDINAL del constructor, no de la primera clase desnuda. */
function tipoDe(n) {
  const ord = n.clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c));
  if (ord) return `et_pb_${/^et_pb_(.+?)_\d+(_[a-z]+)*$/.exec(ord)[1]}`;
  return (
    n.clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ??
    n.clases.find((c) => /^dvmd_[a-z_]+$/.test(c)) ??
    null
  );
}

/** El MARCADOR SEMÁNTICO: la clase que el editor escribe, ni del tema ni ordinal. */
const RE_SISTEMA = /^(et_pb_|et-|et_|dvmd_|clearfix$|wp-)/;
const piezaDe = (n) => oUndef(n.clases.filter((c) => !RE_SISTEMA.test(c)).join(" "));

const A_KIND = {
  et_pb_text: "texto-arq",
  et_pb_blurb: "icono-arq",
  et_pb_image: "imagen-arq",
  et_pb_button: "boton-arq",
  et_pb_fullwidth_slider: "slider-ancho-arq",
  et_pb_slider: "slider-arq",
  et_pb_video: "video-arq",
  et_pb_code: "codigo-arq",
  et_pb_cta: "cta-arq",
  dvmd_table_maker: "tabla-arq",
  et_pb_gallery: "galeria-arq",
};

let fantasmaInyectado = false;
function aBloque(html, n, donde) {
  let tipo = tipoDe(n);
  if (SABOTAJE === "tipo-fantasma" && !fantasmaInyectado) {
    fantasmaInyectado = true;
    tipo = "et_pb_un_tipo_que_divi_no_sirve";
  }
  const kind = A_KIND[tipo];
  if (!kind) {
    TIPOS_SIN_KIND.push({ donde, tipo });
    return null;
  }
  const pieza = piezaDe(n);
  /* ⚠ `ritmo` NO se emite: ningún documento del lote tiene un valor medido como
     no-default (cabecera de este fichero). El sabotaje lo cablea para que la
     omisión no se pueda relajar en silencio. */
  const ritmo = SABOTAJE === "ritmo-cableado" ? { mb: { valor: 34.0469, unidad: "px" } } : undefined;
  const base = { kind, pieza, ritmo };

  const innerDe = (c) => dentro(html, buscaClase(n, c) ?? n);

  switch (tipo) {
    case "et_pb_text":
      return { ...base, contenido: innerDe("et_pb_text_inner") };
    case "et_pb_code":
      return { ...base, contenido: innerDe("et_pb_code_inner") };
    case "dvmd_table_maker":
      return { ...base, contenido: dentro(html, n) };
    case "et_pb_slider":
    case "et_pb_fullwidth_slider":
      return { ...base, contenido: dentro(html, n) };
    case "et_pb_blurb": {
      const t = buscaClase(n, "et_pb_module_header");
      const d = buscaClase(n, "et_pb_blurb_description");
      const img = imgDe(html, buscaClase(n, "et_pb_main_blurb_image") ?? n);
      return {
        ...base,
        titulo: t ? dentro(html, t) : undefined,
        contenido: d ? dentro(html, d) : undefined,
        imagen: img ? resuelveMedia(rutaLocalMedia(attrTag(img, "src")), `${donde}·blurb`) : undefined,
      };
    }
    case "et_pb_image": {
      const img = imgDe(html, n);
      const a = [...A.recorre(n)].find((x) => x.etiqueta === "a");
      const href = a ? attr(a, "href") : undefined;
      return {
        ...base,
        imagen: resuelveMedia(rutaLocalMedia(attrTag(img, "src")), `${donde}·image`),
        alt: oUndef(attrTag(img, "alt")),
        enlace: href ? { label: oUndef(attrTag(img, "alt")) ?? "", href, external: extern(href) } : undefined,
      };
    }
    case "et_pb_button": {
      const a = [...A.recorre(n)].find((x) => x.etiqueta === "a") ?? n;
      const href = attr(a, "href");
      return { ...base, texto: texto(html, a), destino: href ? { label: texto(html, a), href, external: extern(href) } : undefined };
    }
    case "et_pb_video": {
      const src = attr(buscaClase(n, "et_pb_video_box") ?? n, "src") ?? attrTag(imgDe(html, n), "src");
      const poster = attr(n, "poster");
      return { ...base, url: src ?? "", portada: poster ? resuelveMedia(rutaLocalMedia(poster), `${donde}·video`) : undefined };
    }
    case "et_pb_cta": {
      const t = buscaClase(n, "et_pb_module_header");
      const d = buscaClase(n, "et_pb_promo_description");
      const a = [...A.recorre(n)].find((x) => x.etiqueta === "a");
      const href = a ? attr(a, "href") : undefined;
      return {
        ...base,
        titulo: t ? dentro(html, t) : undefined,
        contenido: d ? dentro(html, d) : undefined,
        textoBoton: a ? texto(html, a) : undefined,
        destino: href ? { label: texto(html, a), href, external: extern(href) } : undefined,
      };
    }
    case "et_pb_gallery": {
      const items = [];
      for (const h of A.recorre(n)) {
        if (h.etiqueta !== "a" && !tieneClase(h, "et_pb_gallery_item")) continue;
        const img = imgDe(html, h);
        if (!img) continue;
        const r = resuelveMedia(rutaLocalMedia(attrTag(img, "src")), `${donde}·galeria`);
        if (items.some((x) => x.imagen === r)) continue;
        items.push({ imagen: r, alt: oUndef(attrTag(img, "alt")) });
      }
      return { ...base, items };
    }
    default:
      /* §regla 6, gemelo del render: un `switch` sin `default` que TIRA borra
         contenido en silencio. Mejor reventar que emitir un módulo vacío. */
      throw new Error(`aBloque: tipo '${tipo}' casó un kind pero no tiene rama (${donde})`);
  }
}
const extern = (h) => (/^https?:\/\/(www\.)?kunakair\.com/.test(h) ? undefined : /^https?:/.test(h) ? true : undefined);
const TIPOS_SIN_KIND = [];

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · LA CORRIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const catalogo = [];
const porDoc = {};
for (const d of DOCS) {
  /* ⚠ `A.limpia()` retira `<style>` y `<script>` ANTES de parsear, igual que
     `extractor-f33`. No es higiene: es §*el markup se busca sobre el HTML sin
     `<style>` ni `<script>`* — ahí viven los selectores que se hacen pasar por
     marcado, y un `<script>` dentro de un módulo de texto es lo que §3.3·T4
     prohíbe en el contenido. Sin esta línea el eje `script` daba 5 bloqueos que
     no son del contenido: son del documento. */
  const crudo = readFileSync(join(CORPUS, d.doc), "utf8");
  const html = A.limpia(crudo);
  const raiz = A.parsea(html);

  /* módulos de PRIMER NIVEL del CUERPO: `.et_pb_module` que no cuelga de otro,
     con el cascarón del theme-builder descontado. */
  const modulos = [];
  (function baja(n, dentroModulo, dentroCascaron) {
    for (const h of n.hijos ?? []) {
      const casc = dentroCascaron || h.clases.some((c) => /_tb_(header|footer)/.test(c));
      const esMod = h.clases.includes("et_pb_module");
      if (esMod && !dentroModulo && !casc) modulos.push(h);
      baja(h, dentroModulo || (esMod && !casc), casc);
    }
  })(raiz, false, false);

  const usados = SABOTAJE === "sin-modulos" ? [] : modulos;
  const bloques = usados.map((n) => aBloque(html, n, `${d.slug}`)).filter(Boolean);

  const titulo = (/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? "").replace(/\s*[-–|]\s*Kunak\s*$/i, "").trim();
  const desc = /<meta[^>]+name="description"[^>]+content="([^"]*)"/i.exec(crudo)?.[1];
  const og = /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i.exec(crudo)?.[1];

  catalogo.push({
    slug: d.slug,
    titulo: titulo || d.slug,
    arquetipo: d.arquetipo,
    varianteCorta: d.varianteCorta,
    bloques,
    seo: { title: oUndef(/<title>([^<]*)<\/title>/i.exec(html)?.[1]), description: oUndef(desc), ogImage: oUndef(og ? rutaLocalMedia(og) : undefined) },
  });
  porDoc[d.slug] = { modulosN1: modulos.length, bloques: bloques.length };
  ev.ok(1);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · EL DENOMINADOR DE LOS BLOQUEOS — los CUATRO ejes, no el primero
 * ═════════════════════════════════════════════════════════════════════════ */
const EJES = SABOTAJE === "bloqueo-mudo" ? [] : [
  { eje: "script", f: (h) => (/<script\b/i.test(h) ? ["<script>"] : []) },
  { eje: "etiqueta", f: (h) => etiquetasFueraDelCenso(h) },
  { eje: "host", f: (h) => hostsFueraDeAllowlist(h) },
  { eje: "atributo", f: (h) => atributosFueraDelCenso(h) },
];
const bloqueos = Object.fromEntries(EJES.map((e) => [e.eje, []]));
let camposHtml = 0;
for (const p of catalogo)
  for (const b of p.bloques)
    for (const k of ["contenido", "titulo"]) {
      const v = b[k];
      if (typeof v !== "string" || !v) continue;
      camposHtml++;
      for (const e of EJES) {
        const hit = e.f(v);
        if (hit.length) bloqueos[e.eje].push({ slug: p.slug, kind: b.kind, campo: k, hit: hit.slice(0, 6) });
      }
    }

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · CONTROLES — y el veredicto sale de ELLOS, no del recuento
 * ═════════════════════════════════════════════════════════════════════════ */
const controles = [];
const ctl = (ok, n, d) => controles.push({ ok, nombre: n, detalle: d });

const ref = JSON.parse(readFileSync(CT126, "utf8")).porDoc;
const REF = { "monitor-calidad-aire": "PRODUCTO", accesorios: "CATALOGO", "software-de-medicion-calidad-del-aire": "SOFTWARE", "kunak-api": "SOFTWARE-corta" };
const cruce = DOCS.map((d) => ({ slug: d.slug, mio: porDoc[d.slug].modulosN1, ref: ref[REF[d.slug]].primerNivel }));
ctl(cruce.every((c) => c.mio === c.ref), "CRUCE · el recorrido REPRODUCE el porDoc de la 126.ª", cruce.map((c) => `${c.slug} ${c.mio}${c.mio === c.ref ? "=" : "≠"}${c.ref}`).join(" · "));

const totalBloques = catalogo.reduce((a, p) => a + p.bloques.length, 0);
ctl(totalBloques > 0, "§sondas 4bis · se emitieron bloques (0 emitido no puede salir verde)", `${totalBloques} bloques`);
ctl(TIPOS_SIN_KIND.length === 0, "todo tipo del corpus casa un `kind` — lo que no case sale NOMBRADO", TIPOS_SIN_KIND.length ? [...new Set(TIPOS_SIN_KIND.map((t) => t.tipo))].join(", ") : "0 tipos sin kind");
ctl(MEDIA_SIN_RESOLVER.length === 0, "toda ruta de media resuelve BYTE A BYTE (la guarda de Linux, no la de Windows)", MEDIA_SIN_RESOLVER.length ? `${MEDIA_SIN_RESOLVER.length} sin resolver` : `0 sin resolver · T-nombre-media aplicada ${T_NOMBRE.length} veces`);
/* §regla 22: el booleano va con su CARDINAL, y el código de salida con el n. */
ctl(EJES.length === 4, "los CUATRO ejes de `validaHtmlCorpus` se recorren (no el primero que falle)", `${EJES.length} ejes · ${camposHtml} campos HTML comprobados`);
const sinRitmo = catalogo.every((p) => p.bloques.every((b) => b.ritmo === undefined));
ctl(sinRitmo, "el `ritmo` se OMITE en los 231 (ningún valor del lote está medido como no-default)", sinRitmo ? "0 módulos con ritmo escrito" : "❗ hay ritmo cableado");

const P = (...a) => console.log(...a);
P(`\n════ EXTRACTOR F3-5 ════`);
for (const p of catalogo) P(`   ${p.slug.padEnd(40)} ${String(p.bloques.length).padStart(3)} bloques · arquetipo ${p.arquetipo}${p.varianteCorta ? " (corta)" : ""}`);
P(`\n── BLOQUEOS por eje (los CUATRO, con su denominador) ──`);
for (const e of EJES) P(`   ${e.eje.padEnd(10)} ${String(bloqueos[e.eje].length).padStart(3)} de ${camposHtml} campos HTML`);
if (!EJES.length) P(`   (0 ejes — SABOTAJE=bloqueo-mudo)`);
for (const e of EJES)
  for (const b of bloqueos[e.eje].slice(0, 6)) P(`      ❗ ${e.eje} · ${b.slug} · ${b.kind}.${b.campo} → ${b.hit.join(", ")}`);
P(`\n── T-NOMBRE-MEDIA (${T_NOMBRE.length}) ──`);
for (const t of T_NOMBRE) P(`   ${t.de}  →  ${t.a}`);
P(`\n── CONTROLES ──`);
for (const c of controles) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const nBloqueos = Object.values(bloqueos).reduce((a, v) => a + v.length, 0);
const salida = {
  meta: { fecha: hoy(), tanda: "131.ª", sonda: "cms:extractor-f35", saboteada: SABOTAJE },
  alcance: { docs: DOCS.map((d) => d.doc), unidad: "fila de `arquetipos` · módulo de PRIMER NIVEL del cuerpo" },
  noContesta: [
    "NO mide geometría: el `ritmo` sale del análisis de la 127.ª, no de este recorrido",
    "NO abre el original ni siembra",
    "NO decide modelo: el content type ya estaba escrito (126.ª)",
  ],
  controles,
  porDoc,
  bloqueos: { porEje: Object.fromEntries(EJES.map((e) => [e.eje, bloqueos[e.eje]])), camposHtml, total: nBloqueos },
  transformaciones: { "T-nombre-media": T_NOMBRE },
  mediaSinResolver: MEDIA_SIN_RESOLVER,
  catalogo: { arquetipos: catalogo },
};
w(join(QA, "medidas", (SABOTAJE ? nombreNeg("f35-extraido.json", SABOTAJE) : "f35-extraido.json")), salida);

P(`\n${controles.every((c) => c.ok) && nBloqueos === 0 ? "✅" : "❌"} ${totalBloques} bloques en ${catalogo.length} filas · ${nBloqueos} bloqueos de HTML\n`);
if (!controles.every((c) => c.ok) || nBloqueos > 0) process.exit(2);
