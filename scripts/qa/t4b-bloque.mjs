/**
 * EL BLOQUE SUSTITUIDO, ADJUDICADO — el criterio de `/[slug]` al nivel que no absorbe.
 *
 * Uso:  node t4b-bloque.mjs [etiqueta]
 *       node t4b-bloque.mjs despues --cmp medidas/t4b-bloque-antes.json
 * Test en negativo:  npm run qa:t4b-bloque-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE: `html-cmp` NO PUEDE JUZGAR ESTA FAMILIA, Y NO ES UN DEFECTO
 * SUYO
 *
 * `html-cmp` compara el `visible` de **la ruta entera** con un hash, y su
 * umbral es CERO porque el efecto esperado de F2-3 es cero: se cambia la FUENTE
 * del dato, no el dato. Para `/[slug]` esa premisa **deja de valer**, y por una
 * razón de contenido, no de instrumento:
 *
 *   > **T4b SUSTITUYE, no restaura.** Donde el original monta un visor de PDF
 *   > por JavaScript, el CMS guarda un enlace al PDF. El marcado servido
 *   > *tiene* que cambiar ahí. Exigirle Δ0 a la ruta es exigir lo imposible.
 *
 * Y en cuanto la ruta puede diferir «por diseño», **su hash deja de decir
 * nada**: cualquier regresión que entre con la migración —un `alt` que llega
 * vacío, un `<sup>` comido (CMS-SP-TIPO), una entidad `&amp;` que vuelve `&`—
 * cae dentro del mismo veredicto «distinta» y **queda tapada por la
 * sustitución**.
 *
 * Es la §causa común de `CLAUDE.md` con un contenedor nuevo, el séptimo:
 *
 *   > *«Una medición tomada a un nivel que puede absorber el error no es una
 *   > medición.»*  Aquí el contenedor no es una fila, ni una caja, ni el
 *   > protocolo: es **el hash de la ruta**, y su holgura mide exactamente lo
 *   > que ocupa la sustitución — 7112 bytes en la peor de las cuatro.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL CRITERIO, EN DOS MITADES QUE SE MIDEN POR SEPARADO
 *
 * **1 · RESTO — PUERTA · CERO.** Se localizan los bloques de las clases
 * DECLARADAS, se sacan de los dos lados, y **lo que queda tiene que ser
 * byte-idéntico**. Ahí no hay nada que la migración pueda cambiar por diseño,
 * así que el listón sigue siendo el de la fase entera. Un byte de diferencia
 * fuera de un bloque declarado es DEFECTO y sale con código 1.
 *
 * **2 · BLOQUE — por CLASE, cada una contra su diana.** El Δ de dentro **no se
 * juzga por su tamaño**: se juzga por lo que la clase declaró que iba a pasar.
 * Tres dianas posibles, y las tres están en la tabla `CLASES` de abajo con su
 * evidencia:
 *
 *   · **hermano materializado** → umbral CERO contra él. Es la única diana que
 *     compra fidelidad, porque compara contra marcado que el ORIGINAL emitió;
 *   · **desviación deliberada** → no hay equivalente en ninguna población. Va a
 *     `PENDIENTES-QA.md` con su razón y su fecha (regla 1 del proyecto), y NO
 *     se disfraza de Δ0 ni se normaliza la sonda para que cuadre;
 *   · **sin pérdida de bloque** → lo que cae es accesorio y el bloque sobrevive.
 *     Es un resultado medido, no una omisión.
 *
 * ⚠ **Lo que este criterio NO compra, dicho aquí y no en el acta.** Que un
 * bloque salga *adjudicado* significa que la diferencia está **donde se
 * declaró**, no que la sustitución sea buena. Para `fb3d` y `nbc` la respuesta
 * de la clase es que el clon queda **peor que el original** y se acepta con
 * acta. Leer «adjudicado» como «fiel» sería el verde prestado de siempre.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * SACAR UN BLOQUE ES DEJAR DE MIRARLO — ASÍ QUE SE CUENTA, COMO `nMascaras`
 *
 * Excluir markup para poder afirmar Δ0 sobre el resto es exactamente la puerta
 * por la que se cuela un `catch {}` disfrazado, y la sonda lo trata como
 * `html-cmp` trata su máscara RSC:
 *
 *   1 · el bloque **no es una región a ojo**: es el match de un patrón
 *       declarado en `CLASES`, revisable, uno por lado;
 *   2 · **se cuenta cuántos** casaron por lado y por ruta, y el número se
 *       compara con el que se DERIVA del catálogo — no con uno escrito a mano.
 *       Un patrón que no casa con nada sale por MUERTO y uno que casa de más
 *       por SOBRECASADO (`CLAUDE.md` §sondas 4 y su complementario);
 *   3 · **el tamaño de cada bloque viaja en la congelada** (`bytes` por lado).
 *       Un patrón ensanchado para tapar una regresión se ve en ese número, que
 *       es la única defensa contra la trampa que este diseño hace posible;
 *   4 · y el veredicto lo decide **el resto**, que no enmascara nada.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL ALCANCE, DECLARADO: ES UNA SONDA CLON-CONTRA-CLON
 *
 * Compara el clon de hoy con el clon de ayer, igual que `html-cmp` y
 * `clon-base`. **No mide fidelidad contra kunakair.com**, y por eso la mitad 2
 * remite a la diana de cada clase en vez de dar un veredicto propio: la única
 * diana que puede hablar de fidelidad es la del hermano materializado, y su
 * evidencia está en el corpus, no aquí.
 */
import { createHash } from "node:crypto";
import { isAbsolute, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import { cargaCatalogos } from "../seed/catalogos.mjs";
import { APP, Evaluadas, hoy, iniciarClon, leeManifiesto, QA, rutasEmitidas, visibleDe, w } from "./lib.mjs";

const args = process.argv.slice(2);
const iCmp = args.indexOf("--cmp");
const ficheroCmp = iCmp >= 0 ? args[iCmp + 1] : null;
const etiqueta = (iCmp >= 0 ? args.slice(0, iCmp) : args).filter(Boolean)[0] || "antes";

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/* ══════════════════════════════════════════════════════════════════════════
 * LAS CLASES — la tabla ES el criterio, y cada fila trae su diana
 *
 * `antes` y `despues` son los patrones del bloque **en el HTML SERVIDO**, uno
 * por lado, verificados contra la salida servida antes de escribirlos (§El
 * principio). `despues: null` significa que la clase **no sustituye nada**: el
 * bloque desaparece del lado nuevo, así que en el recorte se quita entero y en
 * el otro lado no hay nada que quitar.
 *
 * `enCatalogo` es el patrón con el que se DERIVA cuántas instancias debería
 * haber, corriendo sobre el catálogo medido. Es lo que impide que el número
 * esperado sea un recuerdo (regla 9).
 * ═════════════════════════════════════════════════════════════════════════ */
const CLASES = [
  {
    id: "fb3d",
    /* El `<div>` del visor va SIEMPRE vacío y con su `<script>` pegado detrás
     * (verificado sobre el servido: 1 script, el `\n` siguiente queda FUERA del
     * span — si entrara, los dos lados dejarían de alinearse). */
    antes: /<div\b[^>]*_3d-flip-book[^>]*>\s*<\/div>(?:\s*<script\b[^>]*>[\s\S]*?<\/script>)+/g,
    despues: /<p><a href="[^"]*"\s+data-media="[^"]*">[^<]*<\/a><\/p>/g,
    enCatalogo: /<div\b[^>]*_3d-flip-book[^>]*>/g,
    /* El sustituto es EXACTAMENTE un párrafo con un enlace — `<p><a …></a></p>`.
     * Se declara con su MÁXIMO, no sólo con la etiqueta: ver `GUARDA · ANCHURA`. */
    permite: { antes: {}, despues: { p: 1, a: 1 } },
    diana: "DESVIACIÓN DELIBERADA",
    porQue:
      "el original monta el visor de PDF por JavaScript y NO existe equivalente materializado " +
      "en ninguna población: ni en el catálogo medido ni en los 209 documentos del corpus. " +
      "T4b sustituye el visor por un enlace al PDF con `data-media`; el contenido (el PDF) se " +
      "conserva y la PRESENTACIÓN no. Acta en PENDIENTES-QA.md §F2-3-T4B-DESVIACION.",
  },
  {
    id: "nbc",
    antes: /<script\b[^>]*nbcwashington\.com\/portableplayer[^>]*>[\s\S]*?<\/script>/g,
    despues: null,
    enCatalogo: /<script\b[^>]*nbcwashington\.com\/portableplayer/g,
    diana: "DESVIACIÓN DELIBERADA",
    porQue:
      "IMPOSIBLE, no pendiente: §3.3 decidió *enlace a la noticia* y el `<script>` sólo da la " +
      "URL del REPRODUCTOR con su `CID` caducable — la del artículo no está en el dato. " +
      "Su `<div class=\"contenedor-video-fijo\">` queda vacío. Misma acta.",
  },
  {
    id: "instagram",
    antes: /<script\b[^>]*instagram\.com\/embed\.js[^>]*>[\s\S]*?<\/script>/g,
    despues: null,
    enCatalogo: /<script\b[^>]*instagram\.com\/embed\.js/g,
    diana: "SIN PÉRDIDA DE BLOQUE",
    porQue:
      "lo que cae es el CARGADOR, no el bloque: el `<blockquote class=\"instagram-media\">` " +
      "sobrevive entero a T4a con su texto y su permalink, y degrada a una cita válida. " +
      "Verificado en el marcado servido, no supuesto.",
  },
];

/**
 * ⚠ **GANCHO DE TEST, DECLARADO Y ANUNCIADO.** El negativo necesita poder darle
 * a la sonda un patrón equivocado —muerto, sobrecasado o ensanchado— para
 * comprobar que las dos guardas lo paran. Sin gancho, esos tres casos habría
 * que probarlos editando el fichero a mano, o sea: no se probarían.
 *
 * `T4B_PATRON=clase:lado:fuente`. Se imprime en la salida y viaja a la
 * congelada: **un gancho invisible es un gancho que puede fabricar un verde sin
 * dejar rastro** (mismo criterio que el `BUILD_ID` de `html-cmp`).
 */
const GANCHO = process.env.T4B_PATRON ?? null;
if (GANCHO) {
  const i = GANCHO.indexOf(":");
  const j = GANCHO.indexOf(":", i + 1);
  const [clase, lado, fuente] = [GANCHO.slice(0, i), GANCHO.slice(i + 1, j), GANCHO.slice(j + 1)];
  const c = CLASES.find((x) => x.id === clase);
  if (!c || !["antes", "despues"].includes(lado)) {
    console.error(`T4B_PATRON: clase '${clase}' o lado '${lado}' desconocidos. El sabotaje no llegaría a existir.`);
    process.exit(2);
  }
  console.log(`⚠ T4B_PATRON=${GANCHO} — patrón SABOTEADO por entorno, no es el de la sonda`);
  c[lado] = new RegExp(fuente, "g");
}

/**
 * ⚠ **LA CUARTA DIANA EXISTE Y AQUÍ TIENE n = 0 — se declara igual.**
 *
 * *«Hay hermanos del mismo corpus que traen el `<iframe>` ya materializado; la
 * sustitución se verifica contra el hermano y ahí sí cabe umbral cero.»* Es
 * cierto de **`flourish`**, y `flourish` **no está en esta familia**. Derivado,
 * no recordado (regla 9):
 *
 * | población | `flourish-embed` |
 * |---|---:|
 * | `corpus/` — el camino del EXTRACTOR, 209 documentos | **8 ficheros** |
 * | `apps/web/src/lib/*.ts` — el catálogo que siembra `/[slug]` | **0** |
 *
 * Así que la rama de más valor del criterio —la única que compra fidelidad
 * contra el original— **no tiene ni una instancia que juzgar aquí**. Se deja
 * escrita porque es donde caerá `flourish` cuando el importador del corpus
 * entre en una familia de ruta, y porque decirlo es la diferencia entre «no se
 * aplicó» y «no había nada a lo que aplicarlo».
 */
const DIANA_SIN_INSTANCIA = {
  id: "hermano-materializado",
  clase: "flourish",
  umbral: "CERO contra el hermano ya materializado del mismo corpus",
  instanciasAqui: 0,
  derivacion: "grep -rl flourish-embed corpus/ → 8 · grep -c flourish apps/web/src/lib/*.ts → 0",
};

/* ══════════════════════════════════════════════════════════════════════════
 * LAS RUTAS — derivadas del catálogo Y del build, y las dos tienen que casar
 * ═════════════════════════════════════════════════════════════════════════ */
const catalogos = await cargaCatalogos();
const FAMILIA = ["entradas-blog", "terminos-kunakpedia"];
const filas = FAMILIA.flatMap((c) => (catalogos.get(c) ?? []).map((f) => ({ coleccion: c, ...f })));
if (!filas.length) {
  console.error("El catálogo no trae ninguna fila de `/[slug]`: sin filas no hay nada que comparar.");
  process.exit(2);
}

const EMITIDAS = new Set(rutasEmitidas(leeManifiesto(APP)));
const sinEmitir = filas.filter((f) => !EMITIDAS.has(`/${f.slug}`)).map((f) => f.slug);
if (sinEmitir.length) {
  console.error(
    `El build NO emite ${sinEmitir.length} slug(s) del catálogo: ${sinEmitir.slice(0, 5).join(", ")}\n` +
      `  Comparar sólo las que sí emite sería declarar cobertura en la unidad de arriba\n` +
      `  (§la cobertura se declara en la unidad que la sonda compara). ¿Falta \`npm run build\`?`,
  );
  process.exit(2);
}

/* ══════════════════════════════════════════════════════════════════════════
 * GUARDA · ANCHURA — la trampa que este diseño hace posible, cerrada
 *
 * Recortar bloques para poder afirmar Δ0 sobre el resto abre una puerta muy
 * concreta: **ensanchar un patrón hasta que se trague la regresión.** El censo
 * de arriba NO la cierra —un patrón más ancho sigue casando el mismo número de
 * veces— y la identidad de bytes tampoco, porque se cumple por construcción del
 * `replace`. O sea: las dos guardas obvias son ciegas a ésta.
 *
 * La que sí muerde es una propiedad del CONTENIDO del bloque, no de su cuenta:
 *
 *   > **Un bloque declarado es ANDAMIAJE, no cuerpo.** Los tres son un `<div>`
 *   > vacío, un `<script>` y un enlace generado. Si un match se lleva un `<p>`,
 *   > un encabezado, una imagen, una lista o una tabla, el patrón se ha
 *   > ensanchado y está tapando marcado que tendría que estar **bajo la
 *   > puerta**.
 *
 * Cada clase declara por lado qué etiquetas de contenido puede contener
 * legítimamente (`permite`), y el defecto es **ninguna** — la ausencia se
 * rechaza, no se sustituye por algo benigno (regla 6). Es lo que convierte «el
 * patrón es revisable en el código» en «el patrón está medido».
 * ═════════════════════════════════════════════════════════════════════════ */
const TAGS_CONTENIDO = /<(p|h[1-6]|img|figure|figcaption|ul|ol|li|table|blockquote|iframe|a)\b/gi;

/**
 * Las etiquetas de contenido que un bloque se llevó **por encima de su máximo**.
 *
 * ⚠ **El permiso es un MÁXIMO, no una lista, y la diferencia la encontró el
 * negativo.** La primera versión declaraba `["p","a"]` para el sustituto de
 * `fb3d`, y con eso un patrón ensanchado que se tragaba **otro** `<p>` pasaba
 * como bueno: la etiqueta estaba permitida. O sea que la guarda contra el
 * ensanchamiento **era ciega justo en el lado que sustituye**, que es donde el
 * bloque tiene contenido propio.
 *
 * Con máximo —`{ p: 1, a: 1 }`, que es literalmente `<p><a …></a></p>`— el
 * segundo párrafo sobra y muerde. Es la misma regla que `lh-censo` aplica a sus
 * selectores: *todo patrón discriminante declara su máximo, y superarlo cierra
 * el código de salida igual que un patrón muerto*.
 */
function deMas(texto, permitidas) {
  const tope = new Map(Object.entries(permitidas ?? {}).map(([t, n]) => [t.toLowerCase(), n]));
  const visto = new Map();
  /* Dentro de un `<script>` no hay marcado: lo que parezca una etiqueta es
   * texto de un literal de JS, y contarlo daría un falso positivo que
   * apagaría la guarda a base de ruido. Se vacían los scripts primero. */
  const sinJs = texto.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>");
  for (const m of sinJs.matchAll(TAGS_CONTENIDO)) {
    const t = m[1].toLowerCase();
    visto.set(t, (visto.get(t) ?? 0) + 1);
  }
  const mal = [];
  for (const [t, n] of visto) {
    const max = tope.get(t) ?? 0;
    if (n > max) mal.push(max ? `${t}×${n}>${max}` : `${t}×${n}`);
  }
  return mal;
}

/** Cuántos bloques de cada clase DEBE traer cada ruta — derivado del catálogo. */
function esperadosDe(fila) {
  let txt = "";
  (function anda(v) {
    if (typeof v === "string") txt += v;
    else if (Array.isArray(v)) v.forEach(anda);
    else if (v && typeof v === "object") Object.values(v).forEach(anda);
  })(fila);
  return Object.fromEntries(CLASES.map((c) => [c.id, [...txt.matchAll(c.enCatalogo)].length]));
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORTE — sacar los bloques dejando el resto alineado
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Saca de `html` los bloques de cada clase y devuelve el resto + su censo.
 *
 * Los que SUSTITUYEN dejan un centinela (el mismo en los dos lados, así que el
 * resto sigue alineado); los que sólo ELIMINAN se quitan enteros, porque en el
 * lado nuevo no hay nada que ocupe su sitio.
 *
 * ⚠ **SE APLICAN LOS PATRONES DE LOS DOS LADOS SIEMPRE, y el LADO es un HECHO
 * del documento, no una opción de la corrida.** La primera versión lo deducía
 * de la etiqueta —`antes` → patrones viejos, cualquier otra cosa → patrones
 * nuevos—, que es un parámetro por defecto disfrazado (regla 6): con la
 * etiqueta `control` recortaba el lado que no era, el `resto` salía distinto en
 * las 10 rutas, y **el negativo entero se caía por una razón que no era la que
 * cada caso decía probar**. Lo cazó el negativo; leyendo el código no se veía.
 *
 * Aplicando los dos, `resto` queda bien definido venga el HTML de donde venga,
 * y **de qué lado es cada ruta se DERIVA** de cuál casó. Que es además lo que
 * permite ver un documento a MEDIO migrar —los dos lados a la vez—, cosa que la
 * versión con bandera no podía ni enunciar.
 */
function recorta(html) {
  const bloques = [];
  let resto = html;
  for (const c of CLASES) {
    for (const lado of ["antes", "despues"]) {
      const patron = c[lado];
      if (!patron) continue; // esta clase no tiene bloque en este lado
      patron.lastIndex = 0;
      resto = resto.replace(patron, (m) => {
        const invade = deMas(m, c.permite?.[lado] ?? []);
        bloques.push({
          clase: c.id,
          lado,
          bytes: m.length,
          sha: sha(m),
          invade, // vacío = el patrón no se llevó cuerpo. Ver GUARDA · ANCHURA.
          muestra: m.replace(/\s+/g, " ").slice(0, 180),
        });
        /* Centinela sólo si la clase sustituye: si no, el hueco no existe en el
         * otro lado y meter una marca DESALINEARÍA el resto — que es justo lo que
         * la puerta tiene que poder ver. */
        return c.despues ? `[[${c.id}]]` : "";
      });
    }
  }
  return { resto, bloques };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA MEDIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const { base: BASE, parar } = await iniciarClon();

const ev = new Evaluadas({ nombre: `t4b-bloque ${etiqueta}`, unidad: "rutas de /[slug]", minimo: filas.length });

const paginas = {};
try {
  for (const f of filas) {
    const url = `${BASE}/${f.slug}`;
    let crudo;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      crudo = await r.text();
    } catch (e) {
      ev.fallo(f.slug, e.message);
      continue;
    }
    const vis = visibleDe(crudo);
    const { resto, bloques } = recorta(vis);
    paginas[`/${f.slug}`] = {
      coleccion: f.coleccion,
      bytesVisible: vis.length,
      bytesResto: resto.length,
      restoSha: sha(resto),
      /* DERIVADO, no declarado: de qué lado está esta ruta lo dice qué patrones
       * casaron. `mixto` es un documento a medio migrar y es un defecto. */
      lado: bloques.length
        ? [...new Set(bloques.map((b) => b.lado))].sort().join("+").replace("antes+despues", "MIXTO")
        : "sin bloques",
      bloques,
      esperados: esperadosDe(f),
    };
    ev.ok();
  }
} finally {
  await parar();
}

/* ── GUARDA · el patrón tiene que casar LO QUE EL CATÁLOGO DICE ─────────────
 * Ni menos (MUERTO: un selector que no casa con nada da varianza cero, no un
 * cero) ni más (SOBRECASADO: un patrón ensanchado se lleva marcado que debería
 * estar bajo la puerta). El esperado se DERIVA del catálogo, ruta a ruta.
 *
 * ⚠ **La regla depende de si la clase SUSTITUYE, y sale del dato, no del lado
 * de la corrida:**
 *
 * · **sustituye** (`fb3d`) — T4b cambia uno por uno, así que 3 visores en el
 *   catálogo son 3 visores en el HTML viejo o 3 enlaces en el nuevo, nunca otra
 *   cosa: `nAntes + nDespues === esperados`, **y uno de los dos tiene que ser
 *   0**. Los dos a la vez es un documento a MEDIO migrar, y es defecto. Si algún
 *   día una sustitución dejara de ser 1:1, esto saltaría — y saltar es lo
 *   correcto: sería dato nuevo;
 * · **sólo elimina** (`nbc`, `instagram`) — el bloque existe entero antes y no
 *   existe después: `nAntes ∈ {0, esperados}`. Cualquier valor de en medio es un
 *   patrón que casa a medias, que es la forma silenciosa del pleno. */
const censo = [];
for (const [ruta, p] of Object.entries(paginas)) {
  for (const c of CLASES) {
    const nAntes = p.bloques.filter((b) => b.clase === c.id && b.lado === "antes").length;
    const nDespues = p.bloques.filter((b) => b.clase === c.id && b.lado === "despues").length;
    const debidos = p.esperados[c.id];
    const mal = c.despues
      ? nAntes + nDespues !== debidos || (nAntes > 0 && nDespues > 0)
      : nDespues > 0 || (nAntes !== 0 && nAntes !== debidos);
    if (mal) censo.push({ ruta, clase: c.id, hallados: nAntes + nDespues, nAntes, nDespues, esperado: debidos });
  }
}

/* ── GUARDA · ANCHURA, contada (no sólo impresa) ────────────────────────── */
const invasores = [];
for (const [ruta, p] of Object.entries(paginas))
  for (const b of p.bloques) if (b.invade.length) invasores.push({ ruta, clase: b.clase, bytes: b.bytes, invade: b.invade });

const totalPorClase = Object.fromEntries(
  CLASES.map((c) => [c.id, Object.values(paginas).reduce((n, p) => n + p.bloques.filter((b) => b.clase === c.id).length, 0)]),
);

/* ══════════════════════════════════════════════════════════════════════════
 * LA COMPARACIÓN
 * ═════════════════════════════════════════════════════════════════════════ */
let cmp = null;
if (ficheroCmp) {
  /* Las congeladas viven en `scripts/qa/medidas/`, que es donde las pone `w()`.
   * Resolver sólo contra el `cwd` hacía que `--cmp medidas/…` no existiera al
   * llamar desde la raíz del repo — y el fallo no era «no la encuentro» sino
   * una EXCEPCIÓN, o sea la sonda muriendo antes de medir. Se prueban los dos
   * sitios y se dice cuál valió; ninguno → se tira con el motivo, no se sigue. */
  const candidatas = isAbsolute(ficheroCmp)
    ? [ficheroCmp]
    : [join(QA, ficheroCmp), join(process.cwd(), ficheroCmp)];
  const ruta = candidatas.find((f) => existsSync(f));
  if (!ruta) {
    console.error(
      `--cmp: no existe ${ficheroCmp}. Buscada en:\n` + candidatas.map((c) => `   · ${c}`).join("\n"),
    );
    process.exit(2);
  }
  const antes = JSON.parse(readFileSync(ruta, "utf8"));
  const restoAlterado = [];
  const bloquesMovidos = [];
  const sinPar = [];

  for (const [r, p] of Object.entries(paginas)) {
    const a = antes.paginas?.[r];
    if (!a) {
      sinPar.push(r);
      continue;
    }
    if (a.restoSha !== p.restoSha)
      restoAlterado.push({ ruta: r, bytesAntes: a.bytesResto, bytesAhora: p.bytesResto, delta: p.bytesResto - a.bytesResto });
    for (const c of CLASES) {
      const ba = (a.bloques ?? []).filter((b) => b.clase === c.id);
      const bd = p.bloques.filter((b) => b.clase === c.id);
      if (!ba.length && !bd.length) continue;
      bloquesMovidos.push({
        ruta: r,
        clase: c.id,
        diana: c.diana,
        antes: ba.map((b) => b.bytes),
        despues: bd.map((b) => b.bytes),
        delta: bd.reduce((n, b) => n + b.bytes, 0) - ba.reduce((n, b) => n + b.bytes, 0),
      });
    }
  }
  cmp = { fichero: ficheroCmp, restoAlterado, bloquesMovidos, sinPar };
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n═══ t4b-bloque · ${etiqueta} ═══════════════════════════════════════`);
console.log(`  rutas de /[slug] .......... ${String(filas.length).padStart(4)}`);
for (const c of CLASES)
  console.log(`  bloques \`${c.id}\`${"".padEnd(Math.max(0, 14 - c.id.length))} ${String(totalPorClase[c.id]).padStart(4)}   → ${c.diana}`);
console.log(`  diana sin instancia ....... ${String(DIANA_SIN_INSTANCIA.instanciasAqui).padStart(4)}   → ${DIANA_SIN_INSTANCIA.umbral}`);
console.log(`                                     (\`${DIANA_SIN_INSTANCIA.clase}\`: ${DIANA_SIN_INSTANCIA.derivacion})`);

if (censo.length) {
  console.log(`\n── ⛔ el patrón NO casa con lo que el catálogo dice ────────────────`);
  for (const c of censo)
    console.log(`   ✗ ${c.ruta} · ${c.clase}: hallados ${c.hallados} (antes ${c.nAntes} · después ${c.nDespues}), esperados ${c.esperado}`);
}
console.log(`  bloques que invaden CUERPO  ${String(invasores.length).padStart(4)}   (guarda de ANCHURA)`);
for (const i of invasores) console.log(`     ✗ ${i.ruta} · ${i.clase} (${i.bytes} B) se llevó ${i.invade.join(" ")}`);

if (cmp) {
  console.log(`\n── 1 · RESTO (puerta · cero) contra ${cmp.fichero} ─────────────────`);
  console.log(`  rutas comparadas .......... ${String(Object.keys(paginas).length - cmp.sinPar.length).padStart(4)}`);
  console.log(`  con el RESTO alterado ..... ${String(cmp.restoAlterado.length).padStart(4)}`);
  for (const r of cmp.restoAlterado) console.log(`     ✗ ${r.ruta}  ${r.bytesAntes} → ${r.bytesAhora}  (Δ ${r.delta >= 0 ? "+" : ""}${r.delta})`);
  if (cmp.sinPar.length) console.log(`  sin par en la congelada ... ${String(cmp.sinPar.length).padStart(4)}  ${cmp.sinPar.slice(0, 4).join(" ")}`);

  console.log(`\n── 2 · BLOQUE, por clase y contra su diana ─────────────────────────`);
  for (const b of cmp.bloquesMovidos)
    console.log(
      `   · ${b.ruta}\n       ${b.clase.padEnd(10)} ${JSON.stringify(b.antes)} → ${JSON.stringify(b.despues)} ` +
        `bytes (Δ ${b.delta >= 0 ? "+" : ""}${b.delta})  ⇒ ${b.diana}`,
    );
  if (!cmp.bloquesMovidos.length) console.log(`   (ningún bloque declarado en ninguna de las dos partes)`);
}

w(`medidas/t4b-bloque-${etiqueta}.json`, {
  meta: {
    fecha: hoy(),
    etiqueta,
    criterio:
      "RESTO fuera de los bloques declarados = PUERTA a cero · BLOQUE = por clase, contra la diana de su fila en CLASES",
    alcance: "CLON-CONTRA-CLON: no mide fidelidad contra kunakair.com. La única diana que la mide es `hermano-materializado`, con 0 instancias aquí",
    clases: CLASES.map((c) => ({ id: c.id, diana: c.diana, porQue: c.porQue, sustituye: Boolean(c.despues) })),
    dianaSinInstancia: DIANA_SIN_INSTANCIA,
    ganchoDeTest: GANCHO, // `null` en una corrida buena; si no, la congelada NO es una medida
  },
  paginas,
  totalPorClase,
  censo,
  invasores,
  cmp,
});

/* ══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO
 * ═════════════════════════════════════════════════════════════════════════ */
const errores = [];
if (censo.length)
  errores.push(
    `${censo.length} desajuste(s) entre el patrón de una clase y el catálogo.\n` +
      `   Un patrón que no casa con nada da VARIANZA CERO, no un cero; y uno que casa de más\n` +
      `   se lleva marcado que debería estar bajo la puerta. Los dos son defecto de la sonda.`,
  );
if (invasores.length)
  errores.push(
    `${invasores.length} bloque(s) que se llevan CONTENIDO DE CUERPO sin tenerlo declarado.\n` +
      `   Un bloque declarado es andamiaje; si el patrón se traga un <p> o una imagen, está\n` +
      `   sacando de la puerta marcado que la puerta tendría que juzgar. Es LA trampa que\n` +
      `   este diseño hace posible, y la única guarda que puede verla.`,
  );
if (cmp?.restoAlterado.length)
  errores.push(
    `${cmp.restoAlterado.length} ruta(s) con el RESTO alterado — fuera de todo bloque declarado.\n` +
      `   Eso NO es la sustitución: es una regresión que la sustitución habría tapado si\n` +
      `   se hubiera medido la ruta entera. Es exactamente lo que esta sonda existe para ver.`,
  );
if (cmp?.sinPar.length)
  errores.push(`${cmp.sinPar.length} ruta(s) sin par en la congelada: no se compararon, y un no-comparado no es un verde.`);

console.log(`\n═══ VEREDICTO ═════════════════════════════════════════════════════`);
if (!errores.length) {
  console.log(
    `  ✅ ${Object.keys(paginas).length} rutas · el RESTO ${cmp ? "a CERO" : "censado"} y ` +
      `${Object.values(totalPorClase).reduce((a, b) => a + b, 0)} bloque(s) adjudicados a su clase.`,
  );
  console.log(`     ⚠ «adjudicado» NO es «fiel»: dice que la diferencia está DONDE SE DECLARÓ.`);
  console.log(`       La calidad de cada sustitución la juzga la diana de su clase, arriba.`);
} else {
  for (const e of errores) console.error(`  ❌ ${e}`);
}
ev.informe();
/* `exitCode` y no `exit()`: esta sonda hace `fetch`, y `process.exit()` tras un
 * `fetch` aborta libuv en Windows y devuelve 3221226505 en vez del código
 * elegido (§F2-3-EXIT-FETCH, con su repro mínimo). Nace ya sin el defecto. */
process.exitCode = errores.length ? 1 : 0;
