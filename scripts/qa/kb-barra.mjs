/**
 * LA BARRA LATERAL DEL CASCARÓN `_tb_` — lo que hay DENTRO, medido en las DOS
 * familias que la sirven.
 * Uso: node scripts/qa/kb-barra.mjs [1440|390]      (npm run qa:kb-barra)
 *      SABOTAJE=sin-hojas | sin-fuentes | dominio-corto | selector-muerto
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO — escrito ANTES de mirar el dato (§sondas, el lado
 * del lector: *una medida contesta las preguntas que se le hicieron, y su
 * fichero no lleva escrito cuáles NO*)
 *
 * `PaginaKb.tsx` declara la columna estrecha **VACÍA a propósito**, y su razón
 * es correcta: *«`cascaron.spec.md` §2 midió la caja (258.5 · canal 68.1094 ·
 * `y` alineada) y NO lo de dentro … inventarle contenido sería rellenar una
 * medida que no se tomó»*. O sea que el hueco **no es un defecto de emisión:
 * es una MEDIDA QUE NUNCA SE TOMÓ**, declarada como tal desde F3-1.
 *
 * Esto la toma.
 *
 * CONTESTA:
 *   · QUÉ hay dentro del `et_pb_sidebar_0_tb_body` — el marcado, nombrado
 *     widget a widget y con su cardinal;
 *   · su GEOMETRÍA y su TIPOGRAFÍA por `getComputedStyle` **sobre el original**,
 *     a los dos anchos, con las hojas y las fuentes puestas;
 *   · si el cascarón es **el mismo** en las dos familias que lo sirven —los 6
 *     `articulos-kb` y los 7 hubs `BT` de la cola larga—, que es una HIPÓTESIS
 *     mientras nadie la mida.
 *
 * ✅ **Y DESDE EL ESCALÓN 2 CONTESTA TAMBIÉN EL LADO DEL CLON**, nivel a nivel.
 * Nació de un solo lado —el clon no emitía nada ahí— y esa frase dejó de ser
 * cierta en cuanto emitió. La adjudicación **no podía** dejarse a `f33-cmp`:
 * publica **una sola caja** de la barra, así que su `+197.65` era un número sin
 * causa. Con los dos lados y los tres niveles delante, el defecto se nombró solo.
 *
 * NO CONTESTA:
 *   · ningún ancho intermedio — allí el contrato es de RANGO, y es otra pregunta;
 *   · el COMPORTAMIENTO. El menú del original tiene submenús y estados
 *     `current-*`; si alguno se despliega por interacción, esto no lo ve.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA PRECONDICIÓN, Y **NO SE CUMPLE EN UNA DE LAS DOS FAMILIAS**
 *
 * El encargo de la 107.ª decía *«el corpus está completo (32/32 con todas sus
 * hojas) y `articulos-kb` tiene el suyo, así que esto se mide OFFLINE»*.
 * Derivado en vez de recordado (§regla 9), el 32/32 es cierto **de la cola
 * larga**, que es otra colección y otro corpus:
 *
 *   | familia            | páginas | hojas enlazadas | resueltas | faltan |
 *   |--------------------|---------|-----------------|-----------|--------|
 *   | hubs `BT`          |       7 |              49 |    **49** |  **0** |
 *   | `articulos-kb`     |       6 |              44 |    **30** | **14** |
 *
 * Las 14 son todas `et-cache` **por página** (`et-core-unified-<id>.min.css` y
 * `et-divi-dynamic-tb-140-tb-25181-tb-342-<id>.css`). Y el número que dice por
 * qué eso no es una nota al pie está medido en este repo
 * (§F3-1-CSS-NO-CAPTURADO): sin sus hojas, `columna.width` de esta misma
 * familia da **678.52 offline contra 430.80 en vivo** — *una captura sin sus
 * hojas no es la página: es su esqueleto con el estilo puesto por otro*, y no
 * da error, da una medida **PLAUSIBLE**.
 *
 * Por eso las dos familias **no se promedian ni se mezclan**: se miden las dos,
 * se publican por separado, y la familia incompleta sale marcada
 * `hojasIncompletas` y **cuenta como rojo** (§regla 31: una precondición que
 * invalida la MEDIDA se cuenta en rojo y **deja llegar al informe**, porque los
 * números que produciría son justo la evidencia que su negativo necesita).
 *
 * ── Y de ahí sale el control que esta sonda no habría tenido de otro modo ──
 * `medidas/kb-spec-{1440,390}.json` midió estas 6 páginas **en el sitio VIVO**,
 * con sus 19 hojas, y congeló `cascaron.barraLateral.rect` con **varianza 0 en
 * 6/6**. O sea que hay TRES lecturas del mismo objeto:
 *
 *   (a) hubs offline CON hojas   ← esta sonda, familia completa
 *   (b) artículos offline SIN 14 ← esta sonda, familia incompleta
 *   (c) artículos VIVO con todo  ← `kb-spec`, congelado el 2026-08-10
 *
 * **(a) contra (c) es el cruce que vale** —dos familias, dos instrumentos, dos
 * momentos— y (b) es la medida de cuánto cuesta la precondición que falta.
 * §sondas 4: *cruzar con otra medición del mismo objeto hecha con otro
 * instrumento es obligatorio antes de creerse un recuento nuevo.*
 *
 * ⚠ Y el cruce tiene su límite declarado (§regla 15): (a) y (c) **no comparten
 * fichero ni derivación**, así que su concordancia sí dice algo. Lo que **no**
 * dice es que el corpus reproduzca al vivo en general — eso es otra afirmación.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * CÓMO SE LEE CADA NÚMERO — el régimen decide, y aquí es HÍBRIDO
 *
 * El centro de ayuda trae `et_pb_pagebuilder_layout` **y** `et-tb-has-body`:
 * las dos capas conviviendo. La barra lateral vive en la capa `_tb_`, o sea
 * **lectura PLANTILLADA** — el discriminador NO es el px absoluto (que daría la
 * respuesta invertida) sino **la VARIANZA ENTRE INSTANCIAS**. Cero varianza
 * dentro de una forma ⇒ lo fijó quien construyó la plantilla ⇒ **plantilla**.
 *
 * Por eso el dominio son 13 páginas y no una: con una sola instancia, cualquier
 * eje «no varía» y el veredicto lo pondría el tamaño del dominio, no el dato
 * (§regla 22 — un booleano de concordancia es verdadero sobre un dominio de uno
 * igual que sobre uno de mil, así que el código de salida lo cierra el CARDINAL).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { Evaluadas, launch, iniciarClon, w, hoy, Censo, gritaSiRevienta } from "./lib.mjs";

/**
 * ⚠ **EL LADO DEL CLON, añadido en la misma tanda (107.ª ESCALÓN 2).** Nació de
 * un solo lado porque el clon no emitía nada; en cuanto emitió, medir sólo el
 * original dejaba la adjudicación en manos de `f33-cmp`, que publica **una sola
 * caja** (`cascaron.barra`) y por tanto **no puede decir DÓNDE está el defecto**.
 * Y lo necesitó al momento: la primera emisión dio la barra a **691.31 contra
 * 493.66**, o sea **+197.65**, y con una caja sola eso es un número sin causa.
 *
 * `CLON=0` vuelve al modo de un lado (para medir el original sin levantar nada).
 */
const CON_CLON = process.env.CLON !== "0";
if (!CON_CLON) process.env.SIN_CLON = "1";
gritaSiRevienta();

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");
const ANCHO = Number(process.argv[2] || process.env.ANCHO || 1440);

const VALIDOS = ["sin-hojas", "sin-fuentes", "dominio-corto", "selector-muerto"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);

/* ── 1 · EL DOMINIO — derivado del disco, no de una lista ─────────────────── */
/**
 * §regla 9, 7.º caso: *un conjunto enumerado a mano dentro de una sonda es un
 * dato recordado* — envejece contra el repo y no da error, porque un patrón que
 * no casa no es un cero. Se recorre el árbol.
 */
import { readdirSync } from "node:fs";
function recoge(dir, familia) {
  const out = [];
  (function walk(d) {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "index.html") out.push({ familia, fichero: p, ruta: "/es/" + p.slice(CORPUS.length + 1).split(/[\\/]/).slice(1, -1).join("/") + "/" });
    }
  })(dir);
  return out;
}
const TODAS = [
  ...recoge(join(CORPUS, "articulos-kb"), "articulos-kb"),
  ...recoge(join(CORPUS, "hubs-kb"), "hubs-BT"),
];
/** SABOTAJE `dominio-corto`: una sola página por familia. Con n=1 la varianza
 *  es 0 POR CONSTRUCCIÓN, así que el veredicto de plantilla saldría igual de
 *  «verde» sin haber mirado nada — §regla 22. La guarda va sobre el CARDINAL. */
const PAGINAS = SABOTAJE === "dominio-corto"
  ? [TODAS.find((p) => p.familia === "articulos-kb"), TODAS.find((p) => p.familia === "hubs-BT")]
  : TODAS;
if (!PAGINAS.length) throw new Error("0 páginas en el corpus de KB: su cero se leería como «no hay barra» (§sondas 4).");

const ev = new Evaluadas({
  nombre: `kb-barra@${ANCHO}`,
  unidad: "páginas con barra lateral",
  /* Derivado del disco, no escrito: una página nueva sube el listón sola. */
  minimo: TODAS.length,
});

/* ── 2 · LOS TRES CANALES — hojas, media y fuentes ────────────────────────── */
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
const MEDIA_RAICES = [
  { dir: join(RAIZ, "media-corpus/fase-3") },
  { dir: join(RAIZ, "apps/web/public/images/uploads") },
];
const FUENTES = join(RAIZ, "corpus/fuentes");
const FUENTES_IDX = existsSync(join(FUENTES, "INDICE.json"))
  ? JSON.parse(readFileSync(join(FUENTES, "INDICE.json"), "utf8"))
  : null;
if (!FUENTES_IDX) throw new Error("SIN FUENTES CAPTURADAS: corre `npm run cms:captura-fuentes` (§regla 32).");
const HOJAS_FUENTE = Object.entries(FUENTES_IDX.ficheros).filter(([, v]) => v.tipo === "css").map(([k]) => k);
if (!HOJAS_FUENTE.length) throw new Error("0 hojas de fuente en el índice: su cero se leería como «no hay fuentes» (§sondas 4).");

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[2] ?? m[3] ?? m[4]) : null;
}
const reemplazaAttr = (tag, name, valor) =>
  tag.replace(new RegExp(`${name}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i"), `${name}="${valor}"`);

function mediaLocal(url) {
  const rel = url.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "").split("?")[0];
  if (/^https?:/i.test(rel) || rel.startsWith("/")) return null;
  for (const r of MEDIA_RAICES) if (existsSync(join(r.dir, rel))) return pathToFileURL(join(r.dir, rel)).href;
  return null;
}

/**
 * ⚠ §regla 32: *a un comparador de dos lados se le hace a los dos todo lo que
 * se le hace a uno*. Aquí hay UN lado, así que la regla se aplica en su otra
 * mitad: **los tres canales se cierran o se declaran**, y el cardinal de «sin
 * resolver» es lo que dice si la corrida vale.
 */
function conAssetsLocales(html) {
  let enlazadas = 0, resueltas = 0;
  const sinResolver = [];
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    if (SABOTAJE === "sin-hojas") return "";
    const href = attr(tag, "href");
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) { sinResolver.push(rel); return tag; }
    resueltas++;
    return reemplazaAttr(tag, "href", pathToFileURL(join(CSS, rel)).href);
  });

  let img = 0, imgOk = 0;
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    img++;
    let t = tag;
    const src = attr(t, "src");
    if (src && !src.startsWith("data:")) {
      const f = mediaLocal(src);
      if (f) { imgOk++; t = reemplazaAttr(t, "src", f); }
    } else if (src) imgOk++;
    const ss = attr(t, "srcset");
    if (ss) {
      const vivos = [];
      for (const trozo of ss.split(",")) {
        const p = trozo.trim().split(/\s+/);
        if (!p[0]) continue;
        const f = mediaLocal(p[0]);
        if (f) vivos.push([f, ...p.slice(1)].join(" "));
      }
      t = vivos.length
        ? reemplazaAttr(t, "srcset", vivos.join(", "))
        : t.replace(/\ssrcset\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "").replace(/\ssizes\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "");
    }
    return t;
  });

  /**
   * Las FUENTES se inyectan, no se reescriben: el `@import` vive DENTRO de una
   * hoja del corpus y el corpus no se toca — es la evidencia capturada. Y hacen
   * falta: la 106.ª midió que con Manrope frente a sin ella se mueven **944 de
   * 1257 cajas (75.1 %)**, con `|Δw|` hasta 52.42, mientras `docH` se movía −1.
   * O sea que su ausencia **no deja síntoma en el total**.
   */
  const linksFuente = SABOTAJE === "sin-fuentes" ? "" : HOJAS_FUENTE
    .map((f) => `<link rel="stylesheet" href="${pathToFileURL(join(FUENTES, f)).href}">`).join("");
  out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${linksFuente}</head>`) : linksFuente + out;

  return { html: out, enlazadas, resueltas, sinResolver, img: { n: img, resueltas: imgOk }, fuentes: SABOTAJE === "sin-fuentes" ? 0 : HOJAS_FUENTE.length };
}

/* ── 3 · VIEWPORT Y ASENTADO — los dos ya verificados NO-OP en `f33-cmp` ──── */
const MOVIL = ANCHO <= 500;
const UA_MOVIL = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
async function preparaViewport(page) {
  if (MOVIL) {
    await page.setViewport({ width: ANCHO, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.setUserAgent(UA_MOVIL);
  } else {
    await page.setViewport({ width: ANCHO, height: 900, deviceScaleFactor: 1 });
  }
}
/** ⚠ NO se cambia el viewport DESPUÉS de montar: `setViewport` con `isMobile`
 *  recarga, y una recarga sobre un documento montado con `setContent` vuelve al
 *  fichero crudo y se lleva los `<link file://>`. */
async function asienta(page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) { img.loading = "eager"; img.decoding = "sync"; }
    const listas = Promise.all(
      [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })),
    );
    await Promise.race([listas, new Promise((r) => setTimeout(r, 2000))]);
    if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/* ── 4 · LA MEDIDA ───────────────────────────────────────────────────────── */
const censo = new Censo();
function medir(selBarra, selMenu) {
  const $ = (s) => globalThis.__q(s);
  const $$ = (s) => globalThis.__qa(s);
  const n2 = (v) => +Number(v).toFixed(2);
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: n2(b.x), y: n2(b.y), w: n2(b.width), h: n2(b.height) }; };
  const ritmo = (cs) => ({
    paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft,
    marginTop: cs.marginTop, marginRight: cs.marginRight, marginBottom: cs.marginBottom, marginLeft: cs.marginLeft,
  });
  const tipo = (cs) => ({
    fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, ""), fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight, color: cs.color, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing,
    textDecorationLine: cs.textDecorationLine,
  });
  /** §*lo que no tiene caja no se puede medir*: `getComputedStyle` sobre un
   *  elemento sin caja no resuelve los % contra nada y devuelve ceros que
   *  entran en la distribución como si fueran dato. Se marca, no se descarta
   *  en silencio. */
  const conCaja = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };

  const barra = $(selBarra);
  if (!barra) return { hay: false };
  const csB = getComputedStyle(barra);

  const widgets = $$(`${selBarra} > section, ${selBarra} > .widget, ${selBarra} > div > section`).map((el, i) => {
    const cs = getComputedStyle(el);
    return {
      i, tag: el.tagName.toLowerCase(), id: el.id || null, clases: [...el.classList],
      vacio: el.textContent.trim() === "" && !el.querySelector("img,svg,iframe,input"),
      conCaja: conCaja(el), display: cs.display, rect: r(el), ritmo: ritmo(cs),
      hijos: el.children.length,
    };
  });

  /* El MENÚ: el árbol completo, con la geometría y la tipografía de cada nivel. */
  /**
   * ⚠ El `ul` del menú: **los dos lados no escriben la misma clase** —el
   * original `ul.menu`, el clon `ul.ayuda-menu`—, así que **cada lado trae el
   * suyo**. Dos intentos encadenados (`A || B`) darían la medida correcta y
   * dejarían **un selector MUERTO por construcción** en el censo: el del otro
   * lado no casa nunca, y eso es justo lo que §sondas 4 no deja pasar. Un
   * parcial legítimo se DECLARA —aquí, dándole a cada lado su selector—, no se
   * tapa con un fallback.
   */
  const menu = $(selMenu);
  let arbol = null;
  if (menu) {
    const lis = [...menu.querySelectorAll("li")];
    const nivelDe = (li) => { let n = 0, p = li.parentElement; while (p && p !== menu) { if (p.tagName === "UL") n++; p = p.parentElement; } return n; };
    /**
     * ⚠ Los `ul` ANIDADOS, uno a uno. La primera versión medía sólo `ul.menu`
     * —el raíz— y con eso no se puede construir: la SANGRÍA de un submenú vive
     * en el `padding-left` de SU `ul`, no en el del padre. Medir sólo la raíz
     * habría dado «sangría 0» con toda la cara de un dato (§sondas 4).
     */
    const ulDe = (ul) => { let n = 0, p = ul.parentElement; while (p && p !== menu) { if (p.tagName === "UL") n++; p = p.parentElement; } return n; };
    const uls = [menu, ...menu.querySelectorAll("ul")].map((ul) => {
      const cs = getComputedStyle(ul);
      return {
        nivel: ul === menu ? 0 : ulDe(ul) + 1, clases: [...ul.classList],
        rect: r(ul), ritmo: ritmo(cs),
        listStyleType: cs.listStyleType, listStylePosition: cs.listStylePosition, display: cs.display,
      };
    });
    arbol = {
      nLi: lis.length,
      nNiveles: Math.max(0, ...lis.map(nivelDe)),
      uls,
      ulRect: r(menu), ulRitmo: ritmo(getComputedStyle(menu)),
      items: lis.map((li) => {
        const a = li.querySelector(":scope > a");
        const csLi = getComputedStyle(li), csA = a ? getComputedStyle(a) : null;
        return {
          nivel: nivelDe(li),
          texto: a ? a.textContent.trim() : null,
          href: a ? a.getAttribute("href") : null,
          /* Los estados `current-*` son lo ÚNICO que puede variar entre
           * instancias: dicen dónde está el lector, no qué pone la plantilla. */
          estado: [...li.classList].filter((c) => c.startsWith("current")).sort(),
          hijos: li.querySelectorAll(":scope > ul > li").length,
          conCaja: conCaja(li),
          liRect: r(li), liRitmo: ritmo(csLi), liDisplay: csLi.display,
          liListStyleType: csLi.listStyleType,
          /**
           * ⚠⚠ **LA TIPOGRAFÍA DEL `li`, QUE ES LA QUE MANDA EN EL ALTO — y no
           * estaba medida.** La primera emisión del clon puso `font-size` y
           * `line-height` **sólo en el `<a>`**, que es **enlínea**: el alto de
           * una línea la fija el STRUT del bloque que la contiene, o sea el
           * `li`. Con el `li` heredando el cuerpo del tema (18/30.6), las **15
           * líneas** del menú pasaron de `2×20 + 4×18.75 + 9×16.25 = 261.25` a
           * `15 × 30.6 = 459`: **+197.75**, que es el `+197.65` medido.
           *
           * Medir sólo el `<a>` no podía verlo — los dos lados daban 16/20 —,
           * así que es §*la causa común: el NIVEL al que se mide* con el nivel
           * puesto en **quién genera el strut**.
           */
          liTipo: tipo(csLi),
          aDisplay: csA ? csA.display : null,
          aRect: a ? r(a) : null, aTipo: csA ? tipo(csA) : null, aRitmo: csA ? ritmo(csA) : null,
        };
      }),
    };
  }

  return {
    hay: true,
    /**
     * ⚠ El BORDE va medido, no deducido de la aritmética del ancho. `grep` sobre
     * las hojas encuentra **cinco** reglas para `.et_pb_widget_area_left`, dos de
     * ellas con `border-right: none`, así que la pregunta no es *«¿existe?»* sino
     * **«¿cuál gana?»** — y ésa sólo la contesta el navegador
     * (§*transcribir la declaración servida NO es transcribir la cascada*).
     * Y se mide a los DOS anchos porque el ganador cambia con el `@media`
     * (§regla 35): a 1440 gana `1px solid` + `pr 30`, a 390 gana `none` + `pr 0`.
     */
    barra: {
      clases: [...barra.classList], rect: r(barra), ritmo: ritmo(csB), display: csB.display,
      backgroundColor: csB.backgroundColor,
      borde: {
        right: `${csB.borderRightWidth} ${csB.borderRightStyle} ${csB.borderRightColor}`,
        top: `${csB.borderTopWidth} ${csB.borderTopStyle}`,
        bottom: `${csB.borderBottomWidth} ${csB.borderBottomStyle}`,
        left: `${csB.borderLeftWidth} ${csB.borderLeftStyle}`,
      },
      boxSizing: csB.boxSizing,
    },
    columna: (() => { const c = barra.closest(".et_pb_column"); return c ? { clases: [...c.classList], rect: r(c), ritmo: ritmo(getComputedStyle(c)) } : null; })(),
    nWidgets: widgets.length,
    nWidgetsVacios: widgets.filter((x) => x.vacio).length,
    nWidgetsSinCaja: widgets.filter((x) => !x.conCaja).length,
    widgets, menu: arbol,
    hojasAplicadas: document.styleSheets.length,
    fuenteCargada: (() => { try { return document.fonts.check('16px "Manrope"'); } catch { return null; } })(),
  };
}

/* ── 5 · LA CORRIDA ──────────────────────────────────────────────────────── */
/** SABOTAJE `selector-muerto`: el selector deja de casar. §sondas 4 — un
 *  selector que no casa con nada no es un cero, es un defecto, y sin esta
 *  guarda la sonda diría «no hay barra lateral» con toda la cara de un dato. */
const SEL_BARRA = SABOTAJE === "selector-muerto"
  ? ".et_pb_sidebar_NO_EXISTE_tb_body"
  : "[class*='et_pb_sidebar_'][class*='_tb_body']";
/** El mismo objeto en el clon. Son DOS selectores porque los dos lados no
 *  escriben las mismas clases — lo que tiene que denotar el MISMO conjunto es
 *  el elemento, no la cadena (§sondas 4: *dos selectores que no denotan el
 *  mismo conjunto* fue lo que dio «31 de 31 distintas» en `c-cmp`). */
const SEL_CLON = SABOTAJE === "selector-muerto" ? ".ayuda-barra-NO-EXISTE" : ".ayuda-barra";
/** El `ul` del menú, uno por lado — ver el ⚠ de `medir()`. */
const SEL_MENU_ORIG = `${SEL_BARRA} ul.menu`;
const SEL_MENU_CLON = `${SEL_CLON} ul.ayuda-menu`;

const { browser } = await launch();
const baseClon = CON_CLON ? (await iniciarClon()).base : null;
const salida = {
  meta: {
    sonda: "kb-barra", fecha: hoy(), ancho: ANCHO, movil: MOVIL,
    contrato: "FIDELIDAD (1440/390) · UN SOLO LADO (el original)",
    dominio: { que: "las 2 familias que sirven el cascarón `_tb_` de KB", n: PAGINAS.length, de: TODAS.length },
    selector: SEL_BARRA, sabotaje: SABOTAJE,
  },
  paginas: {},
};

const hojasIncompletas = [], sinBarra = [], fuenteCero = [];
for (const pg of PAGINAS) {
  const { html, enlazadas, resueltas, sinResolver, img, fuentes } = conAssetsLocales(readFileSync(pg.fichero, "utf8"));
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let bloqueadas = 0;
  page.on("request", (q) => {
    const u = q.url();
    if (u.startsWith("file:") || u.startsWith("data:")) return void q.continue();
    bloqueadas++;
    q.abort().catch(() => {});
  });
  await preparaViewport(page);
  await page.goto(pathToFileURL(pg.fichero).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 800));
  await asienta(page);
  censo.grupo(pg.familia);
  const { datos } = await censo.medir(page, medir, SEL_BARRA, SEL_MENU_ORIG);
  await page.close();

  if (enlazadas && sinResolver.length) hojasIncompletas.push({ ruta: pg.ruta, familia: pg.familia, faltan: sinResolver.length, ej: sinResolver });
  if (!datos.hay) sinBarra.push(pg.ruta);
  if (datos.hay && datos.fuenteCargada === false) fuenteCero.push(pg.ruta);

  /* ── (b) EL CLON ────────────────────────────────────────────────────────
   * §regla 32: *a un comparador de dos lados se le hace a los dos todo lo que
   * se le hace a uno, Y ESO INCLUYE LO QUE SE LE PROHÍBE.* La misma frase en
   * los dos lados: **cada uno carga lo SUYO y nada externo** — para el original
   * `file:`, para el clon su propio origen. */
  let clon = null, httpClon = 0, bloqClon = 0;
  if (CON_CLON) {
    const cp = await browser.newPage();
    await cp.setRequestInterception(true);
    const propio = new URL(baseClon).origin;
    cp.on("request", (q) => {
      const u = q.url();
      if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith(propio)) return void q.continue();
      bloqClon++;
      q.abort().catch(() => {});
    });
    await preparaViewport(cp);
    try {
      const resp = await cp.goto(baseClon + pg.ruta.replace(/^\/es/, "").replace(/\/$/, ""), { waitUntil: "networkidle0", timeout: 120_000 });
      httpClon = resp ? resp.status() : 0;
      /* El MISMO asentado que el original: si sólo se asentara un lado, el Δ
       * mediría el asentado y no el clon. */
      if (httpClon < 400 && httpClon !== 0) { await asienta(cp); clon = (await censo.medir(cp, medir, SEL_CLON, SEL_MENU_CLON)).datos; }
    } catch { httpClon = -1; }
    await cp.close();
  }

  salida.paginas[pg.ruta] = {
    familia: pg.familia,
    hojas: { enlazadas, resueltas, sinResolver: sinResolver.length, faltan: sinResolver, aplicadas: datos.hojasAplicadas ?? null },
    media: img, fuentes, peticionesBloqueadas: bloqueadas,
    httpClon, peticionesBloqueadasClon: bloqClon,
    original: datos, clon,
    ...datos,
  };
  ev.ok(1);
}
await browser.close();

/* ── 6 · EL INFORME ──────────────────────────────────────────────────────── */
const filas = Object.entries(salida.paginas);
const porFamilia = {};
for (const [ruta, p] of filas) (porFamilia[p.familia] ??= []).push({ ruta, ...p });

console.log(`\n═══ kb-barra @${ANCHO} · ${filas.length} páginas · ${Object.keys(porFamilia).length} familias ═══`);

console.log(`\n═══ 1 · LOS TRES CANALES, con su cardinal (§regla 32)`);
for (const [fam, ps] of Object.entries(porFamilia)) {
  const e = ps.reduce((a, p) => a + p.hojas.enlazadas, 0), r = ps.reduce((a, p) => a + p.hojas.resueltas, 0);
  const im = ps.reduce((a, p) => a + p.media.n, 0), imr = ps.reduce((a, p) => a + p.media.resueltas, 0);
  console.log(`  ${fam.padEnd(14)} hojas ${r}/${e}${r < e ? `  ⛔ FALTAN ${e - r}` : "  ✓"} · img ${imr}/${im} · fuentes ${ps[0].fuentes} · Manrope ${ps.every((p) => p.fuenteCargada) ? "✓" : "⛔"}`);
}

console.log(`\n═══ 2 · QUÉ HAY DENTRO — el marcado, con su cardinal`);
for (const [fam, ps] of Object.entries(porFamilia)) {
  const w0 = ps[0];
  const uniforme = ps.every((p) => p.nWidgets === w0.nWidgets && p.nWidgetsVacios === w0.nWidgetsVacios);
  console.log(`  ${fam.padEnd(14)} widgets ${w0.nWidgets} (de ellos VACÍOS ${w0.nWidgetsVacios}) en ${uniforme ? `${ps.length}/${ps.length}` : "⛔ NO uniforme"}`);
  for (const wd of w0.widgets ?? [])
    console.log(`       #${wd.i} <${wd.tag}> ${wd.clases.join(".")}  ${wd.vacio ? "VACÍO" : `${wd.hijos} hijo(s)`}  caja ${wd.conCaja ? "sí" : "NO"}  h ${wd.rect.h}  mb ${wd.ritmo.marginBottom}`);
  if (w0.menu) console.log(`       menú: ${w0.menu.nLi} <li> · ${w0.menu.nNiveles} niveles · ul h ${w0.menu.ulRect.h}`);
}

console.log(`\n═══ 3 · VARIANZA ENTRE INSTANCIAS — el discriminador del régimen PLANTILLADO`);
/** En la capa `_tb_` el px absoluto NO discrimina (daría la respuesta
 *  invertida): lo que decide es si el valor VARÍA entre instancias. */
const EJES = [
  ["barra.rect.w", (p) => p.barra?.rect.w], ["barra.rect.h", (p) => p.barra?.rect.h],
  ["barra.rect.x", (p) => p.barra?.rect.x], ["barra.rect.y", (p) => p.barra?.rect.y],
  ["barra.mb", (p) => p.barra?.ritmo.marginBottom], ["barra.pt", (p) => p.barra?.ritmo.paddingTop],
  ["columna.rect.w", (p) => p.columna?.rect.w],
  ["menu.nLi", (p) => p.menu?.nLi], ["menu.ul.h", (p) => p.menu?.ulRect.h],
  ["widget0.h", (p) => p.widgets?.[0]?.rect.h], ["widget0.mb", (p) => p.widgets?.[0]?.ritmo.marginBottom],
  ["a.fontSize", (p) => p.menu?.items[0]?.aTipo?.fontSize], ["a.lineHeight", (p) => p.menu?.items[0]?.aTipo?.lineHeight],
  ["a.fontFamily", (p) => p.menu?.items[0]?.aTipo?.fontFamily], ["a.color", (p) => p.menu?.items[0]?.aTipo?.color],
];
salida.varianza = {};
for (const [fam, ps] of Object.entries(porFamilia)) {
  console.log(`  ── ${fam} (n=${ps.length})`);
  salida.varianza[fam] = { n: ps.length, ejes: {} };
  for (const [nom, f] of EJES) {
    const vals = [...new Set(ps.map((p) => JSON.stringify(f(p) ?? null)))];
    salida.varianza[fam].ejes[nom] = { valores: vals.map((v) => JSON.parse(v)), n: ps.length };
    console.log(`     ${nom.padEnd(16)} ${vals.length === 1 ? `= ${vals[0]}` : `⚠ ${vals.length} valores: ${vals.join(" · ")}`}`);
  }
}

console.log(`\n═══ 4 · ENTRE FAMILIAS — ¿es el MISMO cascarón?`);
const fams = Object.keys(porFamilia);
salida.entreFamilias = {};
if (fams.length === 2) {
  for (const [nom, f] of EJES) {
    const a = JSON.stringify(f(porFamilia[fams[0]][0]) ?? null), b = JSON.stringify(f(porFamilia[fams[1]][0]) ?? null);
    salida.entreFamilias[nom] = { [fams[0]]: JSON.parse(a), [fams[1]]: JSON.parse(b), igual: a === b };
    console.log(`  ${nom.padEnd(16)} ${a === b ? "= " : "≠ "} ${fams[0]} ${a.padEnd(14)} | ${fams[1]} ${b}`);
  }
}

console.log(`\n═══ 5 · CRUCE CON OTRO INSTRUMENTO — \`kb-spec\`, medido en el sitio VIVO`);
/**
 * §sondas 4: *el cero no tenía forma de dar error: tenía forma de dato. Lo
 * único que lo delató fue otra medición del mismo objeto hecha con otro
 * instrumento.* Aquí el cruce es además el que valida la familia incompleta.
 *
 * ⚠⚠ **Y SE CRUZA AL NIVEL, no por el nombre.** La primera versión de esto
 * comparaba el `rect` de `kb-spec.cascaron.barraLateral` contra **mi `barra`**
 * y publicaba `Δh −43.18` — un número plausible y falso: `barraLateral` es la
 * **COLUMNA** (`et_pb_column_1_4`) y `barra` es el **MÓDULO** de dentro
 * (`et_pb_sidebar_0_tb_body`). Dos elementos distintos con nombres parecidos.
 * §*la causa común: el NIVEL al que se mide*, cometida dentro del cruce escrito
 * para cazar exactamente esta clase de error. Al nivel correcto el Δ es **0.00
 * en `w` y en `h`**.
 *
 * ⚠ Y el Δ que queda en `y` **no es defecto: es el SUELO BIMODAL documentado**
 * de este proyecto (`CLAUDE.md` §La base de lectura, C-QA6). El original tiene
 * dos estados discretos separados por **32.28 clavados** a 1440; la captura
 * cogió uno y `kb-spec` el otro. Por eso se lee con su forma —*Δ≈0 limpio ·
 * Δ≈32.28 limpio · cualquier otro valor DEFECTO, incluidos los menores*— y NO
 * como una banda de tolerancia.
 */
const ESPEJO = join(AQUI, `medidas/kb-spec-${ANCHO}.json`);
/** El suelo bimodal medido por la campaña C-QA6, por ancho. Va con su forma:
 *  son PICOS, no un umbral — entre pico y pico no hay masa. */
const PICOS = { 1440: [0, 32.28], 390: [0, 30] }[ANCHO] ?? [0];
salida.cruceVivo = null;
if (existsSync(ESPEJO)) {
  const esp = JSON.parse(readFileSync(ESPEJO, "utf8"));
  const vivo = Object.entries(esp.articulos).map(([r, a]) => ({ ruta: r, rect: a.cascaron.barraLateral.rect, clases: a.cascaron.barraLateral.clases }));
  const vVals = [...new Set(vivo.map((v) => JSON.stringify(v.rect)))];
  const ref = JSON.parse(vVals[0]);
  console.log(`  VIVO (kb-spec, ${esp.meta?.fecha ?? "?"}): ${vivo.length} artículos · ${vVals.length} valor(es) de \`barraLateral.rect\``);
  console.log(`     elemento: ${(vivo[0].clases ?? []).join(".")}  →  es la COLUMNA, no el módulo`);
  console.log(`     ${vVals.join("\n     ")}`);
  salida.cruceVivo = {
    fuente: `medidas/kb-spec-${ANCHO}.json`, fecha: esp.meta?.fecha ?? null, n: vivo.length,
    nivel: "COLUMNA contra COLUMNA (`et_pb_column_1_4` · `et_pb_column_0_tb_body`)",
    picosY: PICOS, rects: vVals.map((v) => JSON.parse(v)), contra: {},
  };
  let cruceMal = 0;
  for (const [fam, ps] of Object.entries(porFamilia)) {
    const mio = ps[0].columna?.rect ?? null;
    const d = mio ? { w: +(mio.w - ref.w).toFixed(2), h: +(mio.h - ref.h).toFixed(2), x: +(mio.x - ref.x).toFixed(2), y: +(mio.y - ref.y).toFixed(2) } : null;
    /* `w` y `h` son invariantes entre los dos estados del original, así que ahí
     * se exige Δ0; `y` se lee contra los picos. */
    const yOk = d ? PICOS.some((p) => Math.abs(Math.abs(d.y) - p) < 0.01) : false;
    const ok = d && d.w === 0 && d.h === 0 && yOk;
    if (!ok) cruceMal++;
    salida.cruceVivo.contra[fam] = { offline: mio, vivo: ref, delta: d, yEnUnPico: yOk, ok };
    console.log(`  ${fam.padEnd(14)} columna offline w ${String(mio?.w).padStart(7)} h ${String(mio?.h).padStart(7)} │ Δ w ${String(d?.w).padStart(7)} h ${String(d?.h).padStart(7)} y ${String(d?.y).padStart(8)} ${yOk ? `(= pico ${PICOS.find((p) => Math.abs(Math.abs(d.y) - p) < 0.01)})` : "⛔ FUERA DE PICO"}  ${ok ? "✓" : "⛔"}`);
  }
  /* El MÓDULO se publica al lado, etiquetado — es otro nivel y no se compara
   * contra el de arriba (que es justo el error que este bloque cometió). */
  for (const [fam, ps] of Object.entries(porFamilia))
    console.log(`  ${fam.padEnd(14)} módulo  offline w ${String(ps[0].barra?.rect.w).padStart(7)} h ${String(ps[0].barra?.rect.h).padStart(7)} │ sin referencia VIVA: \`kb-spec\` no lo midió`);
  salida.cruceVivo.mal = cruceMal;
} else console.log(`  ⚠ no existe ${ESPEJO} — el cruce NO se pudo hacer, y eso es un hueco, no un verde.`);

/* ── 5b · LOS DOS LADOS, NIVEL A NIVEL ───────────────────────────────────── */
const distintos = [];
if (CON_CLON) {
  console.log(`\n═══ 5b · LOS DOS LADOS — nivel a nivel, que es lo que dice DÓNDE está el defecto`);
  /**
   * §*la causa común: el NIVEL al que se mide*. `f33-cmp` publica **una sola
   * caja** de la barra, así que un `+197.65` suyo es un número sin causa. Esto
   * baja a los tres niveles del menú, al `ul` y a cada `li`.
   */
  const EJES2 = [
    ["barra.h", (d) => d.barra?.rect.h], ["barra.w", (d) => d.barra?.rect.w],
    ["barra.pr", (d) => d.barra?.ritmo.paddingRight], ["barra.borderRight", (d) => d.barra?.borde?.right],
    ["widget0.h", (d) => d.widgets?.[0]?.rect.h], ["widget0.w", (d) => d.widgets?.[0]?.rect.w],
    ["nWidgets", (d) => d.nWidgets],
    ["menu.ul.h", (d) => d.menu?.ulRect.h], ["menu.nLi", (d) => d.menu?.nLi],
    ["subMenu.ml", (d) => d.menu?.uls?.find((u) => u.nivel === 1)?.ritmo.marginLeft],
  ];
  for (let n = 0; n <= 2; n++) {
    EJES2.push([`n${n}.li.h`, (d) => d.menu?.items.find((i) => i.nivel === n)?.liRect.h]);
    EJES2.push([`n${n}.li.pt`, (d) => d.menu?.items.find((i) => i.nivel === n)?.liRitmo.paddingTop]);
    EJES2.push([`n${n}.li.mt`, (d) => d.menu?.items.find((i) => i.nivel === n)?.liRitmo.marginTop]);
    EJES2.push([`n${n}.a.fontSize`, (d) => d.menu?.items.find((i) => i.nivel === n)?.aTipo?.fontSize]);
    EJES2.push([`n${n}.a.lineHeight`, (d) => d.menu?.items.find((i) => i.nivel === n)?.aTipo?.lineHeight]);
    EJES2.push([`n${n}.a.h`, (d) => d.menu?.items.find((i) => i.nivel === n)?.aRect?.h]);
  }
  const conClon = filas.filter(([, p]) => p.clon);
  console.log(`  páginas con los dos lados: ${conClon.length}/${filas.length}`);
  if (conClon.length) {
    const [ruta, p] = conClon[0];
    console.log(`  muestra: ${ruta}`);
    console.log(`  ${"eje".padEnd(18)} ${"original".padStart(14)} ${"clon".padStart(14)}   Δ`);
    for (const [nom, f] of EJES2) {
      const o = f(p.original), c = f(p.clon);
      const num = typeof o === "number" && typeof c === "number";
      const d = num ? +(c - o).toFixed(2) : (String(o) === String(c) ? 0 : "≠");
      if (d !== 0) distintos.push({ eje: nom, o, c });
      console.log(`  ${nom.padEnd(18)} ${String(o).padStart(14)} ${String(c).padStart(14)}   ${d === 0 ? "✓" : `⛔ ${d}`}`);
    }
  }
  salida.dosLados = { paginasConClon: conClon.length, distintos };
}

console.log(`\n═══ 6 · LO QUE ESTA SONDA **NO** CONTESTA`);
console.log(`  · el lado del CLON: hoy no emite nada ahí. Esto mide UN lado, el original`);
console.log(`  · ningún ancho intermedio — allí el contrato es de RANGO`);
console.log(`  · el COMPORTAMIENTO: si algún submenú se despliega por interacción, no se ve`);
console.log(`  · sólo mide ${ANCHO}: el contrato de FIDELIDAD es a 1440 Y 390, hay que correr los dos`);
if (hojasIncompletas.length) {
  const n = hojasIncompletas.reduce((a, x) => a + x.faltan, 0);
  console.log(`  · ⛔ y NO contesta la geometría de ${hojasIncompletas.length} página(s) a las que les faltan ${n} hojas:`);
  for (const x of hojasIncompletas) console.log(`       ${x.ruta}  (${x.faltan})`);
}

/* ── 7 · VEREDICTO ───────────────────────────────────────────────────────── */
const muertos = censo.muertos();
console.log(`\n═══ 7 · VEREDICTO`);
console.log(`  ✓ evaluadas ${ev.n}/${TODAS.length} páginas con barra lateral · widgets ${filas.reduce((a, [, p]) => a + (p.nWidgets ?? 0), 0)} · familias ${fams.length}`);
console.log(censo.informe("kb-barra"));

const SABOTEADA = !!SABOTAJE;
if (SABOTEADA && !process.env.NEG) {
  console.log(`\n⚠ CORRIDA SABOTEADA SIN \`NEG=\`: la salida NO puede llevarse el nombre canónico (§regla 24).`);
  console.log(`  Se desvía a \`kb-barra-${ANCHO}-neg-a-mano.json\`.`);
}
w(`medidas/kb-barra-${ANCHO}${SABOTEADA && !process.env.NEG ? "-neg-a-mano" : ""}.json`, salida);

if (muertos.length) { console.log(`\n  ⛔ ${muertos.length} selector(es) MUERTOS: ${muertos.join(" · ")}`); process.exit(2); }
if (salida.cruceVivo?.mal) { console.log(`\n  ⛔ el CRUCE con \`kb-spec\` (vivo) no cuadra en ${salida.cruceVivo.mal} familia(s)`); process.exit(6); }
if (sinBarra.length) { console.log(`\n  ⛔ ${sinBarra.length} página(s) SIN barra lateral: ${sinBarra.join(" · ")}`); process.exit(3); }
if (fuenteCero.length) { console.log(`\n  ⛔ ${fuenteCero.length} página(s) sin Manrope cargada — la tipografía medida NO vale`); process.exit(4); }
/* §regla 31: la precondición que invalida la MEDIDA cuenta en rojo, PERO deja
 * llegar al informe — los números que produce son la evidencia de cuánto cuesta
 * que falte, y son justo lo que su negativo compara. */
if (hojasIncompletas.length) {
  console.log(`\n  ⛔ ${hojasIncompletas.length} página(s) con HOJAS INCOMPLETAS: su geometría está MEDIDA y NO VALE.`);
  console.log(`     Sin sus hojas, esta misma familia dio \`columna.width\` 678.52 offline contra 430.80 en vivo.`);
  process.exit(5);
}
