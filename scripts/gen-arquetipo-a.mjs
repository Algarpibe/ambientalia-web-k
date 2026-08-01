#!/usr/bin/env node
/**
 * GENERADOR de `src/lib/arquetipo-a.ts` a partir de la transcripción congelada.
 *
 *   node scripts/gen-arquetipo-a.mjs
 *
 * ── Por qué generado y no escrito a mano ──────────────────────────────────
 * El grupo C se transcribió a mano desde `c-spec.json` y funcionó porque eran
 * seis cuerpos cortos. Aquí son **14 cuerpos de hasta 91 727 caracteres** con
 * `<script>`, `<video>`, tablas y galerías dentro. Copiar eso a mano no es
 * «más artesanal»: es **una fuente de erratas que la regla 1 del proyecto
 * prohíbe** —los textos van verbatim, erratas del original incluidas, pero no
 * erratas mías—. Generado, el verbatim es una propiedad de construcción.
 *
 * Y no es andamio de usar y tirar: **es el prototipo del extractor de F2-2**,
 * que hará esto mismo con las 209. Lo que aquí se aprenda sobre reescrituras y
 * casos raros es entrada de esa fase.
 *
 * ── Las DOS reescrituras que aplica, y lo que NO son ──────────────────────
 *
 *   1 · **assets a `public/`** — `https://kunakair.com/wp-content/uploads/…`
 *       pasa a `/images/uploads/…`. Es la regla de `CLAUDE.md` §Assets:
 *       *nunca se enlaza a kunakair.com en caliente*. Los ficheros los baja
 *       `scripts/download-grupo-a.mjs` de la misma transcripción.
 *
 *   2 · **rutas locales** — un `<a>` del cuerpo cuyo destino sea una ruta que
 *       el clon publica pasa a la ruta local. Es la **regla de rutas locales**
 *       de `CLAUDE.md`, la que vigila `qa:enlaces`, y hay que aplicarla porque
 *       al emitir las rutas del plano esos enlaces se convierten en fallo.
 *
 * ⚠ **Ninguna de las dos es T7, ni T2, ni T3.** Las `T*` de `ESQUEMA-CMS.md`
 * §3.2 son transformaciones **de migración**: lo que hay que hacerle al corpus
 * al importarlo a Payload, y siguen **pendientes y sin aplicar**. T7 es la
 * versión de importación de la regla 2 —reescribir en bloque al importar, en
 * vez de que la guarda las cace una a una— y su sitio es F2-2. Aquí se cumple
 * la regla del **clon**, que es obligatoria hoy. El `style="width:1210px"`
 * (T2), las clases `wp-*` (T3) y las `et_pb_button` (T1) **se conservan tal
 * cual**: son el corpus, y tocarlos ahora sería adelantar la migración dentro
 * del clon.
 *
 * ── Las rutas publicadas salen del BUILD ──────────────────────────────────
 * Del `prerender-manifest`, más los slugs que esta misma tanda va a emitir.
 * Igual que `enlaces.mjs`: sin lista a mano, se automantiene.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/a-spec.json"), "utf8"));

/* ───────────────────── rutas que el clon publica ───────────────────────── */

const publicadas = new Set(["/"]);
const manif = join(RAIZ, ".next/prerender-manifest.json");
if (existsSync(manif)) {
  for (const r of Object.keys(JSON.parse(readFileSync(manif, "utf8")).routes || {}))
    if (!r.startsWith("/_") && !r.includes(".")) publicadas.add(r);
} else {
  console.log("⚠ sin `.next/prerender-manifest.json`: solo se reescriben las rutas de esta tanda");
}
/** Las que esta tanda va a emitir: aún no están en el manifiesto. */
const rutaDe = (p) =>
  p.forma === "doc-cientifico"
    ? "/" + p.ruta
    : "/" + p.slug;
for (const p of spec.paginas) publicadas.add(rutaDe(p));

const reescritos = [];

/** `https://kunakair.com/es/x/` → `/x` si la publicamos; si no, se deja. */
function aLocal(href, contexto) {
  const m = /^https:\/\/kunakair\.com(\/es(?:\/[^"?#]*)?)/.exec(href);
  if (!m) return href;
  const cola = href.slice(m[0].length);
  const p = m[1].slice(3).replace(/\/+$/, "") || "/";
  if (!publicadas.has(p)) return href;
  reescritos.push({ contexto, de: href, a: p + cola });
  return p + cola;
}

const aAssetLocal = (s) =>
  s.replaceAll("https://kunakair.com/wp-content/uploads/", "/images/uploads/");

/** Reescribe los `href` de las anclas de un fragmento de campo rico. */
function cuerpoLocal(html, contexto) {
  return aAssetLocal(html).replace(
    /(<a\b[^>]*\bhref=")([^"]+)(")/gi,
    (_, a, href, c) => a + aLocal(href, contexto) + c,
  );
}

/* ─────────────────────────── serialización ─────────────────────────────── */

const q = (s) => JSON.stringify(s);
/** Los cuerpos van en backticks: son HTML largo y multilínea. */
const tpl = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const img = (i) => {
  if (!i) return "undefined";
  const campos = [`src: ${q(aAssetLocal(i.src))}`];
  if (i.srcset) campos.push(`srcset: ${q(aAssetLocal(i.srcset))}`);
  if (i.sizes) campos.push(`sizes: ${q(i.sizes)}`);
  if (i.width) campos.push(`width: ${q(i.width)}`);
  if (i.height) campos.push(`height: ${q(i.height)}`);
  if (i.alt) campos.push(`alt: ${q(i.alt)}`);
  return `{ ${campos.join(", ")} }`;
};

const seo = (s) => {
  const campos = [`title: ${q(s.title)}`];
  if (s.description) campos.push(`description: ${q(s.description)}`);
  if (s.ogImage) campos.push(`ogImage: ${q(aAssetLocal(s.ogImage))}`);
  return `{ ${campos.join(", ")} }`;
};

const termino = (t) => `{ slug: ${q(t.slug)}, nombre: ${q(t.nombre)} }`;

/** Último segmento de la URL de archivo de un término. */
const slugDe = (href) => href.replace(/\/+$/, "").split("/").pop();

/* ───────────────────────────── las tres formas ─────────────────────────── */

const blog = spec.paginas.filter((p) => p.forma === "blog");
const term = spec.paginas.filter((p) => p.forma === "termino");
const docs = spec.paginas.filter((p) => p.forma === "doc-cientifico");

function taxonomias(p) {
  const es = p.taxonomias?.enlaces ?? [];
  const cat = es.filter((e) => e.href.includes("/categoria/"));
  const tag = es.filter((e) => e.href.includes("/etiqueta/"));
  return {
    categorias: cat.map((e) => ({ slug: slugDe(e.href), nombre: e.label })),
    etiquetas: tag.map((e) => ({ slug: slugDe(e.href), nombre: e.label })),
  };
}

/** La hija de `resources`: el 4.º eslabón de la miga, cuando lo hay. */
function recurso(p) {
  const e = p.migas.enlaces.find((x) => /\/recursos\/articulos\/[^/]+\/$/.test(x.href));
  return e ? { slug: slugDe(e.href), nombre: e.label } : null;
}

const entradaBlog = (p) => {
  const { categorias, etiquetas } = taxonomias(p);
  const rec = recurso(p);
  const fecha = p.fecha?.html ?? "";
  const pub = (/<span class="fecha-publicacion">([^<]*)</.exec(fecha) || [])[1] ?? "";
  const act = (/<span class="fecha-actualizacion">Actualizado ([^<]*)</.exec(fecha) || [])[1];
  return `  {
    slug: ${q(p.slug)},
    seo: ${seo(p.seo)},
    titulo: ${q(p.titulo)},
    fechaPublicacion: ${q(pub)},${act ? `\n    fechaActualizacion: ${q(act)},` : ""}${
      p.imagenDestacada ? `\n    imagenDestacada: ${img(p.imagenDestacada)},` : ""
    }
    categorias: [${categorias.map(termino).join(", ")}],
    etiquetas: [${etiquetas.map(termino).join(", ")}],${rec ? `\n    recurso: ${termino(rec)},` : ""}
    relacionados: ${p.relacionados},
    cuerpo: ${tpl(cuerpoLocal(p.cuerpo, `blog/${p.slug}`))},
  },`;
};

/**
 * El rótulo del último eslabón de la miga: el texto de la miga menos el de los
 * eslabones enlazados. En el término NO coincide con el `h1` (3 de 3), y en
 * blog y documento sí (11 de 11) — por eso solo se emite cuando difiere.
 */
function rotuloMiga(p) {
  const prefijo = p.migas.enlaces.map((e) => e.label).join(" ");
  const cola = p.migas.texto.startsWith(prefijo)
    ? p.migas.texto.slice(prefijo.length).trim()
    : null;
  return cola || null;
}

const terminoKp = (p) => {
  const rotulo = rotuloMiga(p);
  return `  {
    slug: ${q(p.slug)},
    seo: ${seo(p.seo)},
    titulo: ${q(p.titulo)},${rotulo && rotulo !== p.titulo ? `
    tituloMiga: ${q(rotulo)},` : ""}
    cuerpo: ${tpl(cuerpoLocal(p.cuerpo, `termino/${p.slug}`))},
  },`;
};

const docCientifico = (p) => {
  const prefijo = p.ruta.split("/")[1];
  const catHref = p.migas.enlaces.find((x) => x.href.includes("/scientific-category/"));
  const cat = { slug: slugDe(catHref.href), nombre: catHref.label };
  const ref = p.referencia?.html ?? "";
  const autores = (/<strong>([^<]*)<\/strong>/.exec(ref) || [])[1] ?? "";
  const anyo = (/<\/strong>\s*\|\s*([0-9]{4})/.exec(ref) || [])[1] ?? "";
  return `  {
    slug: ${q(p.slug)},${prefijo !== "documentos-cientificos" ? `\n    prefijo: ${q(prefijo)},` : ""}
    categoria: ${termino(cat)},
    seo: ${seo(p.seo)},
    titulo: ${q(p.titulo)},
    autores: ${q(autores)},
    anyo: ${q(anyo)},
    portada: ${img(p.portada)},
    descarga: { href: ${q(p.descargaPdf.href)}, label: ${q(p.descargaPdf.label)} },
    cuerpo: ${tpl(cuerpoLocal(p.cuerpo, `doc/${p.slug}`))},
  },`;
};

/* ──────────────── la sección#2 del blog, que es PLANTILLA ──────────────── */

const bloque = spec.paginas.find((p) => p.bloqueRelacionados)?.bloqueRelacionados;
const botonEs = bloque.botones.find((b) => b.href.includes("/es/"));

/* ─────────────────────────────── el fichero ────────────────────────────── */

const CABECERA = `/* ⚠ FICHERO GENERADO — no se edita a mano.
 *
 *   node scripts/gen-arquetipo-a.mjs
 *
 * Fuente: \`scripts/qa/medidas/a-spec.json\`, la transcripción **verbatim del
 * HTML servido** del original (${spec.meta.fecha}), congelada. El generador
 * aplica exactamente dos reescrituras, las dos obligatorias para el clon y
 * ninguna de ellas una \`T*\` de migración — la razón, en la cabecera del
 * generador:
 *
 *   · assets \`wp-content/uploads\` → \`/images/uploads\` (§Assets: nada en caliente)
 *   · \`<a>\` a rutas que publicamos → ruta local (§Regla de rutas locales)
 *
 * Lo demás va tal cual, erratas del original incluidas: el rótulo del botón de
 * descarga del documento científico dice **«View document» en inglés** en la
 * web española, y así se queda.
 */
import type {
  DocumentoCientifico,
  EntradaBlog,
  TerminoKunakpedia,
} from "@/types/kunak";

/**
 * ARQUETIPO A — el mínimo adversario, ${spec.paginas.length} instancias de 209.
 *
 * **No son las 209 a propósito.** Las pueblan F2-2 con el extractor; transcribir
 * a mano lo que un extractor va a rehacer es trabajo tirado. Lo que sí tiene que
 * estar hoy es cada eje capaz de romper la plantilla — que es lo que
 * \`PLAN-MUESTREO.md\` §0 dice que no aparece hasta la instancia 2, 3 o 4:
 *
 * | eje | instancia |
 * |---|---|
 * | la MÁS LARGA de las 209 (69 784 ch de texto) | \`contaminacion-por-metano\` |
 * | la MÁS CORTA de las 209 (275) | \`todas-nuestras-soluciones-en-el-iotswc\` |
 * | las DOS firmas de blog (§2: 83 con relacionados · 66 sin) | 6 sí · 1 no |
 * | tabla (§3.4 abierta) + cita | \`…centros-de-datos\`, \`cloruro-de-hidrogeno-hcl\` |
 * | galería · vídeo · embebido | tres entradas distintas |
 * | \`<script>\` DENTRO del cuerpo (15/209, §3.3) | \`running-for-clean-air\` |
 * | 26 etiquetas distintas | \`la-contaminacion-del-aire-…\` |
 * | los TRES prefijos de documento científico | 2 + 1 + 1 |
 */`;

const salida = `${CABECERA}

export const ENTRADAS_BLOG: EntradaBlog[] = [
${blog.map(entradaBlog).join("\n")}
];

export const TERMINOS_KUNAKPEDIA: TerminoKunakpedia[] = [
${term.map(terminoKp).join("\n")}
];

export const DOCUMENTOS_CIENTIFICOS: DocumentoCientifico[] = [
${docs.map(docCientifico).join("\n")}
];

/** Defecto del prefijo (CMS-1 aplicado al documento científico): 22 de 23. */
export const PREFIJO_DOC_DEFECTO = "documentos-cientificos";

/** Ruta completa de un documento, con el prefijo omitido cuando es el de serie. */
export const rutaDocumento = (d: DocumentoCientifico) =>
  \`/recursos/\${d.prefijo ?? PREFIJO_DOC_DEFECTO}/\${d.categoria.slug}/\${d.slug}\`;

/**
 * La \`section#2\` del blog — «También te puede interesar». **Plantilla**: sus
 * textos son idénticos en las 6 instancias que la llevan.
 *
 * ⚠ El original sirve el rótulo y el botón en **tres idiomas a la vez** (es ·
 * en · ar) y esconde dos por CSS: medido, \`text#7\`/\`text#8\` y
 * \`button#0\`/\`button#2\` dan **w 0 · h 0** a los dos anchos. El clon emite solo
 * el español — reproducir dos módulos invisibles no mueve un píxel y sí mete
 * texto árabe e inglés en el HTML de una página en español. Desviación
 * deliberada, anotada en \`PENDIENTES-QA.md\`.
 */
export const BLOQUE_RELACIONADOS = {
  titulo: ${q(bloque.textos[0])},
  boton: { href: ${q(botonEs.href)}, label: ${q(botonEs.label)} },
};

export const getEntradaBlog = (slug: string) => ENTRADAS_BLOG.find((e) => e.slug === slug);
export const getTermino = (slug: string) => TERMINOS_KUNAKPEDIA.find((t) => t.slug === slug);
export const getDocumento = (slug: string) =>
  DOCUMENTOS_CIENTIFICOS.find((d) => d.slug === slug);
`;

writeFileSync(join(RAIZ, "src/lib/arquetipo-a.ts"), salida);

console.log(
  `→ src/lib/arquetipo-a.ts  ·  blog ${blog.length} · término ${term.length} · doc ${docs.length}`,
);
console.log(`   rutas publicadas conocidas: ${publicadas.size}`);
if (reescritos.length) {
  console.log(`\n${reescritos.length} enlace(s) del cuerpo reescritos a ruta local:`);
  const vistos = new Set();
  for (const r of reescritos) {
    const k = r.de + r.contexto;
    if (vistos.has(k)) continue;
    vistos.add(k);
    console.log(`   ${r.contexto.padEnd(30)} ${r.de}\n   ${" ".repeat(30)} → ${r.a}`);
  }
} else {
  console.log(`\n⚠ 0 enlaces reescritos. Con ${publicadas.size} rutas publicadas eso puede ser`);
  console.log(`   cierto, pero compruébalo: es el mismo cero que la regla 4 de CLAUDE.md`);
  console.log(`   avisa de no distinguir de «no he mirado».`);
}
