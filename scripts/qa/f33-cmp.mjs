/* f33-cmp — 93.ª tanda, 2026-08-22. ESCALÓN 3.
 *
 * EL COMPARADOR DE DOS LADOS DE LA COLA LARGA. No existía: `COBERTURA-MEDICION`
 * declara **0 ejes comparados** en las 31, y §*UN ARQUETIPO NUEVO NO HEREDA
 * COBERTURA* dice que construirlo **es parte de la tanda, no un extra**.
 *
 * ══ LOS DOS LADOS, Y POR QUÉ EL DE LA IZQUIERDA NO ES EL ORIGINAL VIVO ══════
 *
 *   · **ORIGINAL** = la captura de `corpus/fase-3/**` renderizada por `file://`
 *     **CON SUS HOJAS**, que viven en `corpus/css/`. Toda petición que no sea
 *     `file:` se aborta: sin eso Chrome pide los assets absolutos al sitio vivo
 *     y la medida «offline» estaría pegándole al original;
 *   · **CLON** = lo que sirve `next start`.
 *
 * ⚠⚠ **LAS HOJAS NO SON UN EXTRA: SIN ELLAS LA MEDIDA ES PLAUSIBLE Y FALSA.**
 * Está medido en este repo (§F3-1-CSS-NO-CAPTURADO): una captura sin hojas dio
 * `columna.width` **678.52** contra **430.80** en vivo — la partición en
 * columnas **no ocurre**, y una spec habría afirmado con número que el cuerpo
 * de ese arquetipo es plano. Por eso:
 *
 *   > **El nº de hojas que CARGARON se cuenta y se publica, y si alguna página
 *   > carga 0 la corrida NO vale.** Un `<link>` a `https://kunakair.com/…` con
 *   > la red cortada no da error: da una página sin estilo, que es exactamente
 *   > la salida que no se nota.
 *
 * Las hojas se sirven reescribiendo el `href` del `<link>` a la copia local
 * **antes** de cargar, y el control de que eso funciona es el recuento de
 * arriba más el sabotaje `sin-hojas` del negativo.
 *
 * ══ CÓMO SE LEE ════════════════════════════════════════════════════════════
 *
 * §CONTRATO A DOS ANCHOS: a **1440 y 390** se exige FIDELIDAD (Δ ≠ 0 es
 * defecto por encima del suelo). No se mide ningún ancho intermedio: ahí el
 * contrato es de RANGO y este comparador no lo contesta — se declara.
 *
 * ⚠ **El eje MIXTO se publica con su reparto ACERCAN/ALEJAN y se mira ANTES
 * del titular** (§*el eje que no lee como defecto esconde la mejora igual que
 * esconde la deriva*). Un recuento de pares distintos dice cuántos difieren;
 * sólo la DISTANCIA dice hacia dónde se movieron.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { Evaluadas, launch, iniciarClon, w, hoy, Censo } from "./lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");
const ANCHO = Number(process.argv[2] || process.env.ANCHO || 1440);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — **las 31 por defecto** desde la 104.ª (E1)
 *
 * Hasta la 103.ª esto comparaba **el PILOTO (6)**, y era lo correcto: no había
 * clon que comparar y el piloto se eligió por *lo que ejercita*. Emitido el
 * arquetipo, el dominio pasa a ser el arquetipo entero — y el nombre CANÓNICO
 * tiene que llevar la comparación completa, no una muestra, porque es el que se
 * cita (§*una cobertura declarada al nivel de arriba absorbe lo que no se midió
 * abajo*).
 *
 * `PILOTO=1` conserva el dominio corto **para los negativos**: su trabajo es
 * probar el INSTRUMENTO, no la cobertura, y con 6 páginas hacen lo mismo en la
 * quinta parte del tiempo. La salida se desvía en consecuencia — un fichero con
 * nombre de medida y contenido de muestra sería §regla 7.
 *
 * ⚠ El censo NO se copia: vive en `arbol-f33.mjs` §`censaPaginasF33`, que es de
 * donde `piloto-f33` saca el suyo. Dos definiciones de «qué régimen tiene esta
 * página» serían la clase C7 y darían dos denominadores ciertos a la vez.
 * ═════════════════════════════════════════════════════════════════════════ */
const SOLO_PILOTO = process.env.PILOTO === "1";
const { censaPaginasF33 } = await import(
  pathToFileURL(join(RAIZ, "docs/research/cola-larga/derivaciones/arbol-f33.mjs")).href
);
const TODAS = censaPaginasF33();
const PILOTO = SOLO_PILOTO
  ? JSON.parse(readFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/piloto-f33.json"), "utf8")).piloto
  : TODAS;
if (!PILOTO.length) throw new Error("DOMINIO VACÍO: 0 páginas que comparar (§sondas 4)");

/* El mínimo se DERIVA del dominio, no se escribe: una página más sube el listón
 * sola (§4bis). */
const ev = new Evaluadas({
  nombre: "f33-cmp",
  minimo: PILOTO.length,
  unidad: SOLO_PILOTO ? "páginas del piloto" : "páginas de la cola larga",
});

/* ── 2 · las HOJAS: mapa url → copia local, derivado del índice ────────────── */
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (LOCAL.size === 0) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

/* ── 2b · LA MEDIA y LAS FUENTES: las otras dos raíces locales ─────────────
 *
 * ⚠⚠ **§regla 32 — A UN COMPARADOR DE DOS LADOS SE LE HACE A LOS DOS TODO LO
 * QUE SE LE HACE A UNO, Y ESO INCLUYE LO QUE SE LE PROHÍBE.**
 *
 * Hasta la 105.ª esto reescribía **un canal de tres** —las hojas— y cortaba la
 * red en **un lado de dos**. Resultado: el original componía sin imágenes y
 * **sin su tipografía**, y el clon con las dos. `peticiones-f33` enumeró lo
 * que se abortaba y salieron TRES canales, no uno:
 *
 *   | canal | abortadas | qué mueve |
 *   |---|---|---|
 *   | `image` | 1129 | 65 de 71 `<img>` a **16 px** (el alto del roto) |
 *   | **fuente** | **47** | **944 de 1257 cajas (75.1 %)** — y `docH` sólo −1 |
 *   | `document` | 60 | los `<iframe>` de YouTube |
 *
 * **El de fuente es el que enseña**: leído por `docH` parece despreciable
 * (−1); leído por elemento mueve tres cuartas partes de la página. El total
 * era el contenedor (`derivaciones/fuente-f33.log`).
 *
 * Y no vale con bloquearlas en los dos lados, que habría sido más barato: el
 * clon sirve Manrope **auto-alojada** por `next/font/google`, con una cara de
 * respaldo con `size-adjust`. Bloquear dejaría al original con el `sans-serif`
 * del sistema y al clon con la de Next: **dos respaldos distintos**.
 * ═════════════════════════════════════════════════════════════════════════ */
const MEDIA_RAICES = [
  /* 1.º la captura PROPIA de este arquetipo; 2.º lo que el pipeline del clon ya
   * bajó del original. El orden importa: donde las dos tienen el fichero manda
   * la captura. Cruzadas por sha256, 305 de 306 coinciden — la que no es
   * `2023/03/world.svg`, y por eso la captura va primera. */
  { nombre: "media-corpus/fase-3", dir: join(RAIZ, "media-corpus/fase-3") },
  { nombre: "public/images/uploads", dir: join(RAIZ, "apps/web/public/images/uploads") },
];
const FUENTES = join(RAIZ, "corpus/fuentes");
const FUENTES_IDX = existsSync(join(FUENTES, "INDICE.json"))
  ? JSON.parse(readFileSync(join(FUENTES, "INDICE.json"), "utf8"))
  : null;
if (!FUENTES_IDX) throw new Error("SIN FUENTES CAPTURADAS: corre `npm run cms:captura-fuentes` (§regla 32).");
const HOJAS_FUENTE = Object.entries(FUENTES_IDX.ficheros).filter(([, v]) => v.tipo === "css").map(([k]) => k);
if (!HOJAS_FUENTE.length) throw new Error("0 hojas de fuente en el índice: su cero se leería como «no hay fuentes» (§sondas 4).");

/** Atributo HTML admitiendo comillas dobles, simples **y SIN comillas**.
 *  ⚠ El corpus sirve `<img src=https://…>` sin comillar: un `/src="([^"]+)"/`
 *  devuelve `null` en las 568 y ese `null` se lee como «no tiene src». */
function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  if (!m) return null;
  return m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
}
function reemplazaAttr(tag, name, valor) {
  return tag.replace(new RegExp(`(\\s${name}\\s*=\\s*)("[^"]*"|'[^']*'|[^\\s>]+)`, "i"), `$1"${valor}"`);
}
/**
 * Resuelve una URL de `wp-content/uploads` a `file://` local. **EXACTA**: no se
 * colapsan variantes `-WxH`, porque servir otra variante serviría otras
 * dimensiones intrínsecas — que es justo lo que se está intentando igualar.
 */
function mediaLocal(url) {
  const rel = url.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "").split("?")[0];
  /**
   * ⚠ **Un host AJENO no es un hueco de captura: es simétrico por
   * construcción.** El `<img>` de `upload.wikimedia.org` de
   * `/es/empresa/premios-y-reconocimientos/` lo sirve ABSOLUTO también el clon
   * (decisión D2 de la 98.ª), así que con la red cortada en los dos lados
   * **los dos** lo pintan roto. Se separa de «local sin capturar», que sí es
   * un hueco — dos cosas distintas no pueden compartir contador.
   */
  if (/^https?:/i.test(rel) || rel.startsWith("/")) return { url: null, motivo: "externo" };
  for (const r of MEDIA_RAICES) if (existsSync(join(r.dir, rel))) return { url: pathToFileURL(join(r.dir, rel)).href, motivo: null };
  return { url: null, motivo: "sin-capturar" };
}

/**
 * Reescribe a copia local **los TRES canales** y devuelve el cardinal de cada
 * uno. §regla 32: *la marca de que un canal está cerrado es su cardinal de
 * «sin resolver» y una corrida que NO VALE si no es cero.*
 */
function conAssetsLocales(html, sinHojas = false) {
  let enlazadas = 0, resueltas = 0;
  const sinResolver = [];
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    if (sinHojas) return "";                    /* SABOTAJE `sin-hojas` */
    const href = attr(tag, "href");
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) { sinResolver.push(rel); return tag; }
    resueltas++;
    return reemplazaAttr(tag, "href", pathToFileURL(join(CSS, rel)).href);
  });

  /* ── IMÁGENES: `src` y cada candidato de `srcset` ──────────────────────── */
  let img = 0, imgOk = 0, cand = 0, candOk = 0, candCaidos = 0;
  const imgSinCapturar = [], imgExterna = [];
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    img++;
    let t = tag;
    const src = attr(t, "src");
    if (src && !src.startsWith("data:")) {
      /* SABOTAJE `sin-media`: reproduce el estado de antes de la 106.ª — el
       * `src` se queda absoluto y la red cortada lo deja en 16 px. */
      const f = SIN_MEDIA ? { url: null, motivo: "sin-capturar" } : mediaLocal(src);
      if (f.url) { imgOk++; t = reemplazaAttr(t, "src", f.url); }
      else (f.motivo === "externo" ? imgExterna : imgSinCapturar).push(src.slice(0, 120));
    } else if (src) imgOk++;                              /* `data:` ya es local */

    /**
     * ⚠ El `srcset` hay que tocarlo o el navegador elige un candidato ABSOLUTO
     * y la reescritura del `src` no sirve de nada. Los candidatos que no
     * resuelven **se CAEN** en vez de quedarse rotos, y eso no mueve la caja:
     * **los 87 `<img>` con `srcset` del corpus declaran `width` y `height` en
     * los 87**, así que la razón de aspecto la fija el atributo y no los bits.
     * Publicado con su cardinal por si algún día deja de ser cierto.
     */
    const ss = attr(t, "srcset");
    if (ss) {
      const vivos = [];
      for (const trozo of ss.split(",")) {
        const p = trozo.trim().split(/\s+/);
        if (!p[0]) continue;
        cand++;
        const f = SIN_MEDIA ? { url: null } : mediaLocal(p[0]);
        if (f.url) { candOk++; vivos.push([f.url, ...p.slice(1)].join(" ")); } else candCaidos++;
      }
      t = vivos.length ? reemplazaAttr(t, "srcset", vivos.join(", "))
        : t.replace(/\ssrcset\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "").replace(/\ssizes\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "");
      }
    return t;
  });

  /* ── FUENTES: se INYECTAN, porque el `@import` vive DENTRO de una hoja del
   * corpus y el corpus no se toca — es la evidencia capturada. Inyectar es
   * aditivo: el `@import` sigue disparando y sigue abortado (se cuenta). ── */
  const linksFuente = SIN_FUENTES ? "" : HOJAS_FUENTE
    .map((f) => `<link rel="stylesheet" href="${pathToFileURL(join(FUENTES, f)).href}">`).join("");
  out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${linksFuente}</head>`) : linksFuente + out;

  return {
    html: out, enlazadas, resueltas, sinResolver,
    img: { n: img, resueltas: imgOk, sinCapturar: imgSinCapturar, externas: imgExterna.length },
    srcset: { candidatos: cand, resueltos: candOk, caidos: candCaidos },
    fuentes: SIN_FUENTES ? 0 : HOJAS_FUENTE.length,
  };
}

/**
 * ⚠ **A 390 NO basta `setViewport({width})`.** Sin emulación de móvil, Chrome
 * headless fuerza un ancho mínimo y el «móvil» que salga es falso
 * (`CLAUDE.md` §Notas de método). Se aplica a **LOS DOS LADOS** por el mismo
 * camino: si sólo se emulara uno, el Δ mediría la emulación, no el clon.
 *
 * Es `setViewport` con `isMobile`/`hasTouch` y no CDP a pelo porque es lo que
 * este repo ya midió que funciona — `openPage`, con su porqué escrito.
 */
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

/**
 * ⚠⚠ **EL ASENTADO — Y ESTA SONDA ERA LA ÚNICA DE LAS TRES QUE NO LO TENÍA**
 * (105.ª tanda).
 *
 * `CLAUDE.md` §Notas de método lo manda —*«conviene además forzar las imágenes
 * perezosas a `eager`»*, *«scroll + settle antes de medir»*— y sus dos hermanas
 * sobre el MISMO corpus ya lo pagaron, cada una con su congelada de evidencia:
 *
 *   · `f33-geo`, 2026-08-22 — `…-SONDA-SIN-EAGER-DERIVA-1-IMAGEN.json`: dos
 *     corridas del mismo código dieron **269 y 270** módulos con caja, y el diff
 *     salía confinado a `image`;
 *   · `f33-clases`, 2026-08-24 — `…-SONDA-SIN-fonts-ready-1-boton-a-7.27.json`:
 *     un botón computaba `7.27` en vez de `7.5` porque `0.5em` se resolvía
 *     contra una fuente todavía sin cargar.
 *
 * **Las dos veces se arregló la instancia.** Ésta es la tercera, y aquí muerde
 * más que en ninguna: este comparador publica `docH`, que es **la suma de todo
 * lo que haya cargado**. Una imagen que entra o sale mueve el titular entero.
 *
 * ⚠ **Va ACOTADA, y el tope es parte del contrato** (§regla 17): con la red
 * cortada una `src` abortada puede dejar la promesa colgada, y una espera sin
 * tope **no da rojo: se AGOTA** — ni pasa ni falla.
 *
 * ⚠ **Y NO se cambia el viewport después.** `setViewport` con `isMobile`
 * RECARGA, y una recarga sobre un documento montado con `setContent` vuelve al
 * fichero crudo y se lleva los siete `<link file://>` (`f33-clases`, 6 de 6
 * rutas: fila **249.594** contra **335.391**). Por eso `preparaViewport` va
 * ANTES de montar y esto sólo asienta. Control de que sigue siendo así: las
 * filas del original a 390 miden **335.39**, no 249.59.
 */
async function asienta(page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) { img.loading = "eager"; img.decoding = "sync"; }
    const listas = Promise.all(
      [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })),
    );
    await Promise.race([listas, new Promise((r) => setTimeout(r, 2000))]);
    if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
    /* El pase de scroll que §Notas de método pide: Divi recalcula alturas por JS
     * después del load, y hay imágenes que sólo se piden al entrar en pantalla. */
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/* ── 3 · LOS EJES — los mismos nombres que la matriz de cobertura ──────────── */
const censo = new Censo();
function medir() {
  const $ = (s) => globalThis.__q(s);
  const $$ = (s) => globalThis.__qa(s);
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };

  /**
   * ⚠⚠ **SÓLO LA CAPA PROPIA. El sufijo `_tb_` es el discriminador, y sin él
   * este comparador daría «las 6 distintas» — que sería el INSTRUMENTO, no un
   * hallazgo.**
   *
   * Divi mete la cabecera y el pie del theme-builder **dentro de
   * `.et_pb_section`**, y el clon no los emite así. La primera versión de
   * `c-cmp` se comió exactamente esto: dio **31 de 31 rutas con el árbol
   * distinto**, cero defectos, porque los dos selectores no denotaban el mismo
   * conjunto (sector `{tb_header:1, tb_footer:3, propia:7}` = 11 contra los 7
   * del clon, **y los 7 eran exactos**).
   *
   * Aquí lo destapó el control a 390: `/es/recursos/` daba `sec 8` cuando el
   * censo del piloto —que sí filtra `_tb_`— dice **4 secciones propias**. Las
   * otras 4 son cascarón.
   *
   * El criterio es el mismo que `arbol-f33.mjs` §`esPropia`: una clase con
   * `_tb_` es de la plantilla, no de la instancia.
   */
  const propio = (el) => ![...el.classList].some((c) => c.includes("_tb_"));

  const h1 = $("h1");
  const secciones = $$(".et_pb_section, [data-seccion]").filter(propio);
  const filas = $$(".et_pb_row:not(.et_pb_row_inner), [data-fila]").filter(propio);
  /**
   * ⚠⚠ **UN MÓDULO DENTRO DE UN MÓDULO NO ES UN MÓDULO — y `[class*=…]` no lo
   * sabe** (104.ª tanda).
   *
   * El selector de subcadena casa DOS cosas de más, y en los DOS lados:
   *
   *   · `et_pb_module_header` — el `h1..h6` de un blurb. Es lo mismo que ya
   *     tropezó `qa:pieles`: Divi compila la piel del titular contra esa clase,
   *     que **contiene** `et_pb_module` sin serlo;
   *   · **el marcado del CAMPO RICO**, que es HTML del original **verbatim** y
   *     por tanto trae sus propias clases `et_pb_*` dentro.
   *
   * No daba error: daba **356 módulos** donde el censo del corpus cuenta
   * **313**, y un tipo `?` con **312 pares** que invitaba a explicarlo. Es
   * §*un heurístico que encuentra MÁS de lo que hay tampoco da error: da un
   * número plausible de más*.
   *
   * La regla es de ANIDAMIENTO y vale igual para los dos lados: se queda el
   * candidato **que no tiene otro candidato por encima**. Así el `h4` de un
   * blurb y el `et_pb_row` que viaje dentro de un `texto-pagina` quedan fuera
   * por la misma razón, sin lista de excepciones que envejezca.
   */
  const cand = $$("[class*='et_pb_module'], [data-modulo]").filter(propio);
  const esCand = new Set(cand);
  const modulos = cand.filter((m) => {
    for (let p = m.parentElement; p; p = p.parentElement) if (esCand.has(p)) return false;
    return true;
  });

  const out = {
    /**
     * ⚠⚠ **`scrollHeight`, NO `getBoundingClientRect().height`** (104.ª).
     *
     * La v1 medía la caja del `<html>`, y en el clon esa caja está
     * **constreñida** por el layout (`flex` con altura de pantalla): devolvía
     * **900 a 1440 y 844 a 390 — o sea el VIEWPORT — en las 31 rutas**,
     * mientras el original daba valores reales. Resultado: `docH` distinto en
     * **31 de 31**, todo artefacto.
     *
     * La señal era el 100 % redondo y el valor CONSTANTE: §*un dato del
     * original casi nunca es unánime, y cuando lo es, la primera hipótesis es
     * el instrumento*. `clon-base` ya medía `scrollHeight` — dos sondas del
     * mismo repo midiendo «el alto del documento» de dos maneras distintas.
     */
    docH: +Number(document.documentElement.scrollHeight).toFixed(2),
    /* BASE EN CRUDO — la `y` absoluta del `h1`, SIN corregir. §Notas de método:
     * la regla del h1 resta la base antes de comparar, así que no puede
     * auditarse a sí misma; cada arquetipo mide su base cruda UNA vez. */
    base: h1 ? +(h1.getBoundingClientRect().top + window.scrollY).toFixed(2) : null,
    nSecciones: secciones.length,
    nFilas: filas.length,
    nModulos: modulos.length,
    /* ANCHOS — el eje que una guarda vertical no ve (§`clon-base` mide otro eje) */
    anchos: {},
    cajas: {},
    enlaces: $$("a[href]").map((a) => a.getAttribute("href")).filter((h) => h && !h.startsWith("#")).length,
    /**
     * EL CASCARÓN — **dato, no par**: no entra en la comparación y no mueve
     * ningún denominador. Está para ATRIBUIR `docH`, que es un total y por
     * tanto un contenedor (§*Alturas: se mide por composición; el total sólo
     * dice si cuadra, la composición dice qué*).
     *
     * El caso que lo pide: **cinco rutas `BT` distintas dan `docH 1497` CLAVADO
     * a 1440** —con contenidos de 186.77 a 419.13— **y ninguna coincide a 390**.
     * Sobre las congeladas de la 104.ª, el modelo `docH = techo(sec0) +
     * max(SUELO, contenido) + pie` ajusta 7 de 7 con `pie ≈ 680.35` y
     * `SUELO ≈ 476.49`. Un suelo así **sólo puede ponerlo un hermano más alto
     * que el contenido**, y el censo del `<body>` de esas rutas nombra uno:
     * `section#help-center-sidebar`. Publicarlo convierte una constante
     * AJUSTADA en una MEDIDA.
     *
     * Los selectores salen de censar los `id` de las capturas, no de suponer.
     * Un `null` aquí es legítimo y sale nombrado: el clon no tiene el cascarón
     * de Divi, y los regímenes `B-`/`--` no tienen barra.
     */
    cascaron: Object.fromEntries(
      [["pagina", "#page-container"], ["area", "#et-main-area"], ["contenido", "#main-content"], ["barra", "[id$='-sidebar']"]]
        .map(([k, sel]) => { const el = $(sel); return [k, el ? r(el) : null]; }),
    ),
    /* CONTROL de que las hojas llegaron: sin CSS, Divi no pinta ni una caja. */
    hojasAplicadas: [...document.styleSheets].length,
    cuerpoTieneEstilo: getComputedStyle(document.body).fontFamily,
    /**
     * ⚠ **CONTROL DE LA FUENTE, y es el que NO tiene síntoma.** Una hoja que
     * no carga deja la página sin maquetar y se ve; una fuente que no carga
     * compone con el respaldo del sistema y **la página sigue midiendo**.
     * Medido: con Manrope frente a sin ella, `docH` se mueve **−1** y **944 de
     * 1257 cajas** (`derivaciones/fuente-f33.log`). Por eso el control no puede
     * ser un total: es este booleano.
     */
    fuenteCargada: [...document.fonts].some((ff) => /manrope/i.test(ff.family) && ff.status === "loaded"),
  };
  secciones.forEach((s, i) => { out.cajas[`sec${i}`] = r(s); });
  filas.forEach((f, i) => { out.anchos[`fila${i}`] = +f.getBoundingClientRect().width.toFixed(2); });

  /* ══════════════════════════════════════════════════════════════════════════
   * EL NIVEL DE MÓDULO — el que la spec midió y este comparador NO comparaba
   *
   * §*la causa común: el NIVEL al que se mide*. Hasta la 103.ª esto publicaba
   * `nModulos` —un RECUENTO— y las cajas de las SECCIONES. Las dos cosas son
   * contenedores con holgura: **un módulo con el ritmo mal no mueve el alto de
   * su sección si la columna hermana es más alta**, y el recuento no se mueve
   * jamás. O sea que «el componente cumple la spec» no tenía con qué
   * respaldarse: la spec midió MARCADO y GEOMETRÍA DE MÓDULO y aquí no se
   * comparaba ninguno de los dos.
   *
   * ⚠ **La llave es POSICIONAL, y hay que decir por qué.** El original nombra
   * sus módulos `et_pb_<tipo>_<n>` y el clon `data-modulo="<kind>"`: **no hay
   * identificador común**, así que emparejar por nombre es imposible sin
   * inventarse una tabla de equivalencias. El orden del documento sí es común —
   * es lo que el render reproduce— y por eso se empareja por índice.
   *
   * Su límite, declarado: **si el clon emite un módulo de MENOS, todos los
   * siguientes se desalinean** y el informe da muchos pares distintos en vez de
   * uno. Eso no es ruido — es la firma de un módulo perdido — y `nModulos` al
   * lado dice cuál de las dos cosas pasó.
   * ════════════════════════════════════════════════════════════════════════ */
  out.modulos = modulos.map((m, i) => {
    const cs = getComputedStyle(m);
    const b = m.getBoundingClientRect();
    return {
      i,
      /**
       * el TIPO, por el canal de cada lado — es dato, no llave.
       *
       * ⚠⚠ **EL ORDINAL DE DIVI NO SIEMPRE TERMINA EN DÍGITOS, Y EL REGEX SÍ LO
       * EXIGÍA: 13 BOTONES DE 13 SALÍAN `null`** (105.ª tanda).
       *
       * El módulo BOTÓN no lleva su ordinal en el propio módulo: lo lleva su
       * envoltorio, y con sufijo —`et_pb_button_module_wrapper
       * et_pb_button_0_wrapper et_pb_module`—. Contra `^et_pb_(\w+?)_\d+$` eso
       * **no casa**, así que el tipo salía `null`.
       *
       * **Y no daba error: daba `null`, que es un valor.** Un alineador que
       * empareja por tipo no puede casar un `null` con nada, así que los 13
       * botones salían **a la vez «el original tiene 13 módulos que el clon no
       * emite» y «el clon tiene 13 que sobran»** — dos hallazgos inventados que
       * se anulan en el neto y por eso no chirriaban en `nModulos`.
       *
       * ⚠ **Es la TERCERA sonda de este arquetipo que tropieza con `_wrapper`**,
       * y la segunda en pagarlo: `f33-clases` lo pagó el 2026-08-24 —congelada
       * `…-SONDA-EL-ORDINAL-PERDIA-_wrapper-6-overrides-del-editor-como-PLANTILLA…`—
       * y se arregló **la instancia**. Aquí se arregla la CLASE: el sufijo entra
       * en el patrón, derivado de censar las clases portadoras de los 31
       * documentos (`derivaciones/modulos-que-faltan.mjs` §controles).
       *
       * ⚠⚠ **Y HAY MÓDULOS QUE NO SON DE DIVI.** `/es/politica-de-cookies/`
       * sirve un `dvmd_table_maker` —un módulo de TERCEROS, plugin Divi Table
       * Maker— con `class="et_pb_module dvmd_table_maker dvmd_table_maker_0
       * dvmd_tm_version_4_0_1"`. Es un módulo real, **con caja de 880×1511**, y
       * ni este comparador ni el censo del árbol ni el extractor lo nombran.
       * Se le da nombre **derivándolo**, no listando vendedores: una clase
       * `X_<n>` cuya base `X` también está presente en el elemento. Así
       * `dvmd_table_maker_0`+`dvmd_table_maker` da `dvmd_table_maker`, y
       * `dvmd_tm_version_4_0_1` **no** cuela (su base `dvmd_tm_version_4_0` no
       * está). Un tipo que no sepamos traducir sale NOMBRADO en el informe —
       * que es lo contrario de un `null`, y la diferencia entre un hueco
       * contable y uno invisible.
       */
      tipo: (() => {
        /* El CLON lo dice en un atributo suyo, y va PRIMERO: el heurístico de
         * terceros mira clases, y las del clon son utilitarias (`mb-4`, `gap-2`)
         * — dejarlo detrás sería un sobre-casado esperando a ocurrir. */
        const propio = m.getAttribute("data-modulo");
        if (propio) return propio;
        const cls = [...m.classList];
        const divi = cls.map((c) => /^et_pb_(\w+?)_\d+(?:_wrapper)?$/.exec(c)?.[1]).find(Boolean);
        if (divi) return divi;
        return cls.map((c) => /^(.+)_\d+$/.exec(c)?.[1]).find((b) => b && cls.includes(b)) ?? null;
      })(),
      etiqueta: m.tagName.toLowerCase(),
      w: +b.width.toFixed(2),
      h: +b.height.toFixed(2),
      /* el RITMO: los tres ejes que el esquema modela (`pt` salió SIN ESCRIBIR) */
      mt: +parseFloat(cs.marginTop).toFixed(2),
      mb: +parseFloat(cs.marginBottom).toFixed(2),
      pb: +parseFloat(cs.paddingBottom).toFixed(2),
      pt: +parseFloat(cs.paddingTop).toFixed(2),
    };
  });
  return out;
}

/* ── 4 · el recorrido ─────────────────────────────────────────────────────── */
const SIN_HOJAS = !!process.env.NEG_SIN_HOJAS;
const MISMO_LADO = !!process.env.NEG_MISMO_LADO;   /* control: los dos lados iguales */
const DELTA = Number(process.env.NEG_INYECTA_DELTA || 0);
/** Sabotajes del canal de media y del de fuentes: reproducen el estado
 *  ASIMÉTRICO de antes de la 106.ª, que es el modo de fallo del que la guarda
 *  nueva protege (§regla 28 — el sabotaje va en el DATO, no en el umbral). */
const SIN_MEDIA = !!process.env.NEG_SIN_MEDIA;
const SIN_FUENTES = !!process.env.NEG_SIN_FUENTES;

/**
 * ⚠ **El control `mismo-lado` NO levanta el clon, y es deliberado.**
 *
 * Lo que ese caso pregunta es *«¿el comparador compara, o inventa
 * diferencias?»*, y eso **no depende de que exista emisión**. Poder correrlo
 * sin clon es lo que permite **probar el instrumento ANTES de emitir**, que es
 * el orden que CORTE LIMPIO 3 impone: un comparador sin negativo probado no
 * adjudica nada, así que se prueba primero.
 */
const { browser } = await launch();
const baseClon = MISMO_LADO ? null : (await iniciarClon()).base;

const salida = { meta: { sonda: "f33-cmp", fecha: hoy(), ancho: ANCHO, movil: MOVIL, contrato: "FIDELIDAD (1440/390)", dominio: { que: SOLO_PILOTO ? "PILOTO (6)" : "las 31 de `paginas`", n: PILOTO.length, de: TODAS.length }, sabotajes: { SIN_HOJAS, MISMO_LADO, DELTA } }, paginas: {} };
const pares = [];
let hojasCero = [];
const mediaCero = [], fuenteCero = [];
const cruceModulos = [];

for (const pg of PILOTO) {
  const f = join(CORPUS, pg.fichero);
  if (!existsSync(f)) { ev.fallo(pg.ruta, "captura ausente"); continue; }

  /* (a) ORIGINAL — captura por file:// con sus hojas, su media y sus fuentes */
  const { html, enlazadas, resueltas, sinResolver, img, srcset, fuentes } =
    conAssetsLocales(readFileSync(f, "utf8"), SIN_HOJAS);
  const off = await browser.newPage();
  await off.setRequestInterception(true);
  let bloqueadas = 0;
  off.on("request", (q) => { if (q.url().startsWith("file:") || q.url().startsWith("data:")) return void q.continue(); bloqueadas++; q.abort().catch(() => {}); });
  await preparaViewport(off);
  /* `setContent` con `baseURL` no existe en puppeteer: se navega al fichero y
   * se sustituye el documento. El `file://` de partida es el que hace que las
   * rutas locales de las hojas resuelvan. */
  await off.goto(pathToFileURL(f).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await off.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 800));
  await asienta(off);
  const orig = (await censo.medir(off, medir)).datos;
  await off.close();

  /**
   * ⚠⚠ **LA GUARDA VA SOBRE `resueltas`, NO SOBRE `document.styleSheets`, y
   * la primera versión la puso mal — lo destapó su propio sabotaje.**
   *
   * `styleSheets` cuenta también los `<style>` EN LÍNEA, y estas páginas traen
   * **8**. Así que con las 7 hojas externas fuera, `hojasAplicadas` valía 8 y
   * la guarda `!hojasAplicadas` **no podía dispararse nunca**: §sondas 4 —una
   * guarda que no casa con nada— cometida dentro de la guarda misma.
   *
   * Lo que discrimina es **enlazadas vs resueltas**, las dos derivadas del
   * documento. Y el número que justifica la guarda es lo que el sabotaje midió:
   * sin las externas, `docH` de `/es/empresa/` pasa de **6623.91 a 13361.03**
   * —más del doble— sin un solo error. Ésa es la medida «plausible y falsa».
   */
  if (enlazadas && !resueltas) hojasCero.push(pg.ruta);

  /* (b) CLON */
  let clon = null, httpClon = 0, bloqueadasClon = 0;
  const hostsClon = new Map();
  if (MISMO_LADO) {
    /* CONTROL `mismo-lado`: se copia el original al lado del clon. Exige 0
     * distintos — si saliera algo, el comparador INVENTA diferencias. */
    clon = JSON.parse(JSON.stringify(orig));
    httpClon = 200;
  } else {
    const cp = await browser.newPage();
    /**
     * ⚠⚠ **LA INTERCEPCIÓN VA EN LOS DOS LADOS. Que estuviera en UNO es el
     * defecto que la 105.ª fichó** — y su forma general es §regla 32: *un lado
     * con la red cortada y el otro sin cortar no mide el objeto, mide la
     * asimetría*, repartida por dentro de todos los altos y con el signo de un
     * defecto real.
     *
     * La política es **la misma frase en los dos lados: cada uno carga lo
     * SUYO y nada externo.** Para el original «lo suyo» es `file:`; para el
     * clon, su propio origen. Así ninguno de los dos toca la red, y un `<img>`
     * a un host ajeno sale roto **en los dos** en vez de en uno.
     *
     * `bloqueadasClon` se publica por página, y es además el control de que
     * esto es NO-OP donde no había nada externo: si sale 0 en N−1 páginas, la
     * intercepción no cambió nada ahí.
     */
    await cp.setRequestInterception(true);
    const propio = new URL(baseClon).origin;
    cp.on("request", (q) => {
      const u = q.url();
      if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith(propio)) return void q.continue();
      bloqueadasClon++;
      /* El HOST, no sólo el recuento: «12 bloqueadas» no dice si el clon está
       * pidiéndole assets al ORIGINAL EN CALIENTE —que sería un defecto de
       * fidelidad, no del comparador— o a un tercero legítimo. Un cardinal sin
       * su ejemplo manda a la tanda siguiente a averiguarlo otra vez. */
      try { hostsClon.set(new URL(u).host, (hostsClon.get(new URL(u).host) || 0) + 1); } catch { /* noop */ }
      q.abort().catch(() => {});
    });
    await preparaViewport(cp);
    try {
      const url = baseClon + (pg.ruta.replace(/^\/es/, "").replace(/\/$/, "") || "/");
      const resp = await cp.goto(url, { waitUntil: "networkidle0", timeout: 120_000 });
      httpClon = resp ? resp.status() : 0;
      /* El MISMO asentado que el original: si sólo se asentara un lado, el Δ
       * mediría el asentado y no el clon. */
      if (httpClon < 400 && httpClon !== 0) { await asienta(cp); clon = (await censo.medir(cp, medir)).datos; }
    } catch { httpClon = -1; }
    await cp.close();
  }

  /* SABOTAJE `inyecta-delta`: un Δ CONOCIDO. La sonda tiene que cazarlo **y
   * nombrarlo** — §regla 21: sin defecto, la pregunta del negativo deja de ser
   * «¿sabe callar?» y pasa a ser «¿sabe gritar?». */
  if (DELTA && clon) clon.docH = +(clon.docH + DELTA).toFixed(2);

  salida.paginas[pg.ruta] = {
    regimen: pg.reg, httpClon,
    hojas: { enlazadas, resueltas, sinResolver: sinResolver.length, aplicadas: orig.hojasAplicadas, peticionesBloqueadas: bloqueadas },
    /* §regla 32: los TRES canales con su cardinal de «sin resolver», y el
     * bloqueo del lado del clon al lado del bloqueo del lado del original —
     * la simetría se lee comparando los dos, no leyendo uno. */
    media: { img: img.n, resueltas: img.resueltas, sinCapturar: img.sinCapturar.length, externas: img.externas, ejemplos: img.sinCapturar.slice(0, 3) },
    srcset, fuentesInyectadas: fuentes, fuenteCargada: orig.fuenteCargada,
    peticionesBloqueadasClon: bloqueadasClon, hostsBloqueadosClon: Object.fromEntries(hostsClon),
    original: orig, clon,
  };
  if (img.sinCapturar.length) mediaCero.push({ ruta: pg.ruta, n: img.sinCapturar.length, ej: img.sinCapturar[0] });
  if (!orig.fuenteCargada) fuenteCero.push(pg.ruta);

  /**
   * ⚠⚠ **CRUCE OBLIGATORIO CON OTRO INSTRUMENTO, y no es ceremonia.**
   *
   * `piloto-f33` cuenta las secciones propias **parseando el HTML**; esto las
   * cuenta **sobre el DOM renderizado**. Son dos instrumentos distintos sobre
   * el mismo objeto, así que **tienen que dar lo mismo** — y cuando no lo dan,
   * lo que falla es el selector, no la página.
   *
   * Es lo que destapó que este comparador contaba la cabecera y el pie del
   * theme-builder: el DOM daba `sec 8` en `/es/recursos/` donde el parser da
   * **4**. Sin este cruce, el clon habría salido «distinto» en las 6 y el
   * veredicto habría sido del INSTRUMENTO (§sondas 4 · *antes de creerse un
   * pleno, reconstruye un caso contra una medida buena anterior*).
   *
   * ⚠ Y su límite, declarado: los dos leen **la misma captura**, así que este
   * cruce prueba *«los dos cuentan lo mismo»*, **no** *«el recuento es
   * correcto»* (§regla 15).
   */
  /**
   * ⚠⚠ **EL CRUCE SE HACÍA SOBRE LAS SECCIONES Y NO SOBRE LOS MÓDULOS — y el
   * módulo es la unidad que este comparador AFIRMA** (105.ª tanda).
   *
   * El cruce de abajo lleva desde la 103.ª y hace su trabajo. Pero cruza **un
   * solo eje**, y el titular que se cita es `nModulos: 314 → 267`. O sea que la
   * unidad del veredicto **no tenía cruce**: §*se compara en la unidad que se
   * afirma*.
   *
   * Lo que estaba escondido ahí: el DOM cuenta **314** módulos propios y el
   * censo del árbol **313**. El de más es `/es/politica-de-cookies/` —**9
   * contra 8**— y es un `dvmd_table_maker`, un módulo de **TERCEROS** (plugin
   * Divi Table Maker) con caja de **880×1511** que ni el censo ni el extractor
   * nombran. Un `+1` que nadie miraba, y debajo una tabla de 11×5 que el clon
   * no sirve por ningún canal.
   *
   * ⚠ **Cuenta en ROJO pero NO salta la página** (§regla 31: *una guarda que
   * tira antes de congelar deja a su propio negativo sin nada que comparar*).
   * La diferencia con el cruce de secciones es de qué informa cada uno: un
   * descuadre de SECCIONES dice que el selector no denota lo mismo y **invalida
   * la página entera**; uno de MÓDULOS con el tipo NOMBRADO es un hallazgo
   * sobre el corpus, y tirarlo perdería justo la medida que lo prueba.
   */
  const nCenso = Object.values(pg.tipos ?? {}).reduce((a, b) => a + b, 0);
  if (orig.nModulos !== nCenso) {
    const tipos = [...new Set((orig.modulos ?? []).map((m) => m.tipo))].filter((t) => !(t in (pg.tipos ?? {})));
    cruceModulos.push({ ruta: pg.ruta, dom: orig.nModulos, censo: nCenso, tiposQueElCensoNoNombra: tipos });
  }

  if (orig.nSecciones !== pg.nSec) {
    ev.fallo(pg.ruta, `CRUCE ROTO: el DOM cuenta ${orig.nSecciones} secciones propias y el parser de \`piloto-f33\` cuenta ${pg.nSec}. Es el selector, no la página.`);
    console.log(`  ⛔ ${pg.ruta}: DOM ${orig.nSecciones} ≠ parser ${pg.nSec} secciones propias`);
    continue;
  }

  if (!clon) { ev.fallo(pg.ruta, `el clon no sirve la ruta (HTTP ${httpClon})`); continue; }
  ev.ok(1);

  for (const k of ["docH", "base", "nSecciones", "nFilas", "nModulos", "enlaces"])
    pares.push({ ruta: pg.ruta, eje: k, o: orig[k], c: clon[k] });
  for (const k of Object.keys(orig.anchos))
    pares.push({ ruta: pg.ruta, eje: `ancho.${k}`, o: orig.anchos[k], c: clon.anchos?.[k] ?? null });
  for (const k of Object.keys(orig.cajas))
    for (const d of ["y", "h", "w"])
      pares.push({ ruta: pg.ruta, eje: `caja.${k}.${d}`, o: orig.cajas[k][d], c: clon.cajas?.[k]?.[d] ?? null });

  /* EL NIVEL DE MÓDULO — el cotejo contra los ejes que la SPEC estableció.
   * Se empareja por índice de documento (ver el porqué en `medir`), y el `tipo`
   * viaja como DATO para poder decir en qué tipo cae cada Δ. */
  for (const m of orig.modulos ?? []) {
    const c = (clon.modulos ?? [])[m.i] ?? null;
    for (const eje of ["w", "h", "mt", "mb", "pt", "pb"])
      pares.push({
        ruta: pg.ruta, eje: `mod${m.i}.${eje}`, tipo: m.tipo,
        tipoClon: c?.tipo ?? null, o: m[eje], c: c ? c[eje] : null,
      });
  }
}

await browser.close();

/* ── 5 · el informe ───────────────────────────────────────────────────────── */
const numericos = pares.filter((p) => typeof p.o === "number" && typeof p.c === "number");
const mixtos = pares.filter((p) => !(typeof p.o === "number" && typeof p.c === "number"));
const distintos = numericos.filter((p) => Math.abs(p.o - p.c) >= 0.01);

console.log(`═══ 0 · LOS DOS LADOS · ancho ${ANCHO}${MOVIL ? " (MÓVIL emulado: isMobile+hasTouch+UA, los DOS lados)" : ""} · contrato FIDELIDAD`);
console.log(`  ORIGINAL: captura de corpus/fase-3 por file:// CON SUS HOJAS (corpus/css), red cortada`);
console.log(`  CLON:     ${baseClon || "(no se levanta: control mismo-lado)"}`);
if (SIN_HOJAS || MISMO_LADO || DELTA) console.log(`  ⚠ SABOTAJES ACTIVOS: ${JSON.stringify(salida.meta.sabotajes)}`);

console.log(`\n═══ 1 · CONTROL DE LOS TRES CANALES — §regla 32: se cierran los tres o no se cierra ninguno`);
console.log(`  Un lado con la red cortada y el otro sin cortar no mide el objeto: mide la ASIMETRÍA.`);
console.log(`  ${"ruta".padEnd(50)} ${"hojas".padStart(9)} ${"imágenes".padStart(11)} ${"srcset".padStart(11)} ${"fuente".padStart(7)}  bloq O/C`);
for (const [r, v] of Object.entries(salida.paginas))
  console.log(
    `  ${r.padEnd(50)} ${`${v.hojas.resueltas}/${v.hojas.enlazadas}`.padStart(9)}` +
    ` ${`${v.media.resueltas}/${v.media.img}`.padStart(11)}` +
    ` ${`${v.srcset.resueltos}/${v.srcset.candidatos}`.padStart(11)}` +
    ` ${(v.fuenteCargada ? "✓" : "✗").padStart(7)}` +
    `  ${String(v.hojas.peticionesBloqueadas).padStart(4)}/${String(v.peticionesBloqueadasClon).padStart(3)}` +
    `${v.media.externas ? `   (externas ${v.media.externas}: rotas EN LOS DOS)` : ""}` +
    `${v.media.sinCapturar ? `   ⛔ sin capturar ${v.media.sinCapturar}` : ""}`,
  );

/**
 * ⚠ Las tres guardas **cuentan en rojo y NO tiran** (§regla 31): una
 * precondición que invalida la MEDIDA tiene que dejar llegar al informe, o su
 * propio negativo se queda sin nada que comparar salvo el código de salida.
 */
let canalRoto = 0;
if (hojasCero.length) {
  canalRoto++;
  console.log(`\n⛔ HOJAS · ${hojasCero.length} página(s) con CERO hojas aplicadas: ${hojasCero.join(" · ")}`);
  console.log(`   Medido con el sabotaje: sin las externas, docH de /es/empresa/ pasa de 6623.91 a 13361.03.`);
}
if (mediaCero.length) {
  canalRoto++;
  console.log(`\n⛔ MEDIA · ${mediaCero.length} página(s) con imágenes LOCALES sin capturar (las externas NO cuentan: son simétricas)`);
  for (const x of mediaCero.slice(0, 8)) console.log(`     ${x.ruta}  ${x.n}  p.ej. ${x.ej}`);
  console.log(`   Un <img> abortado mide 16 px: medido, 65 de 71 en el original y las 71 vivas en el clon.`);
}
if (fuenteCero.length) {
  canalRoto++;
  console.log(`\n⛔ FUENTE · ${fuenteCero.length} página(s) SIN Manrope cargada: ${fuenteCero.slice(0, 6).join(" · ")}${fuenteCero.length > 6 ? " …" : ""}`);
  console.log(`   Y éste NO tiene síntoma: docH se mueve −1 y 944 de 1257 cajas (derivaciones/fuente-f33.log).`);
}
if (canalRoto) console.log(`\n   La corrida NO VALE: ${canalRoto} de 3 canales abiertos. Los números son plausibles y falsos.`);
else console.log(`\n  ✓ los TRES canales cerrados en las ${Object.keys(salida.paginas).length} páginas`);

/* ⚠ EL CRUCE DE LA UNIDAD QUE SE AFIRMA, antes de los pares: si el DOM y el
 * censo no cuentan los mismos módulos, el titular `nModulos` habla de dos
 * conjuntos distintos y ninguno de los dos lo dice. */
salida.cruceModulos = cruceModulos;
console.log(`\n═══ 1b · CRUCE DE MÓDULOS — DOM contra el censo del árbol (\`arbol-f33\`)`);
console.log(`  §*se compara en la unidad que se afirma*: el titular de esta sonda es \`nModulos\`.`);
if (!cruceModulos.length) console.log(`  ✓ las ${PILOTO.length} cuadran`);
for (const x of cruceModulos)
  console.log(`  ⚠ ${x.ruta}: DOM ${x.dom} ≠ censo ${x.censo}  ·  tipos que el censo NO nombra: ${x.tiposQueElCensoNoNombra.map((t) => `\`${t}\``).join(" · ") || "(ninguno)"}`);

console.log(`\n═══ 2 · LOS PARES`);
console.log(`  numéricos ${numericos.length} · MIXTOS ${mixtos.length} · distintos ${distintos.length}`);

/* ⚠ EL EJE MIXTO, ANTES DEL TITULAR. */
console.log(`\n═══ 3 · EJE MIXTO — publicado con su reparto, y mirado ANTES del titular`);
console.log(`  Son pares donde un lado no es número: el ancla no se renderiza en uno de los dos.`);
console.log(`  §*el eje que no lee como defecto esconde la mejora igual que esconde la deriva*.`);
const soloOrig = mixtos.filter((p) => typeof p.o === "number" && typeof p.c !== "number");
const soloClon = mixtos.filter((p) => typeof p.o !== "number" && typeof p.c === "number");
const ninguno = mixtos.filter((p) => typeof p.o !== "number" && typeof p.c !== "number");
console.log(`  sólo en el ORIGINAL (el clon no lo emite): ${soloOrig.length}`);
console.log(`  sólo en el CLON (sobra):                   ${soloClon.length}`);
console.log(`  en ninguno de los dos:                     ${ninguno.length}`);
for (const p of soloOrig.slice(0, 12)) console.log(`     · ${p.ruta} ${p.eje}  orig ${p.o} → clon —`);
if (soloOrig.length > 12) console.log(`     … y ${soloOrig.length - 12} más`);

console.log(`\n═══ 4 · POR PÁGINA — Δ = clon − original`);
for (const [r, v] of Object.entries(salida.paginas)) {
  if (!v.clon) { console.log(`  ❌ ${r}  ·  el clon no sirve la ruta (HTTP ${v.httpClon})`); continue; }
  const d = (k) => (typeof v.original[k] === "number" && typeof v.clon[k] === "number" ? (v.clon[k] - v.original[k]).toFixed(2) : "—");
  console.log(`  ${r}  [${v.regimen}]`);
  console.log(`     docH ${String(v.original.docH).padStart(9)} → ${String(v.clon.docH).padStart(9)}  Δ${d("docH")}`);
  console.log(`     base ${String(v.original.base).padStart(9)} → ${String(v.clon.base).padStart(9)}  Δ${d("base")}   ← EN CRUDO, sin corregir`);
  console.log(`     sec ${v.original.nSecciones}→${v.clon.nSecciones} · filas ${v.original.nFilas}→${v.clon.nFilas} · mód ${v.original.nModulos}→${v.clon.nModulos} · enlaces ${v.original.enlaces}→${v.clon.enlaces}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4b · POR RÉGIMEN — porque el cascarón lo elige `regimen` y no la ruta
 *
 * Un titular sobre las 31 mezcla TRES cascarones distintos. Si uno está mal, su
 * Δ se diluye en el total de los otros dos: es §*la causa común* con el
 * contenedor puesto en el agregado del informe.
 * ════════════════════════════════════════════════════════════════════════ */
const regDe = {};
for (const [r, v] of Object.entries(salida.paginas)) regDe[r] = v.regimen;
console.log(`\n═══ 4b · POR RÉGIMEN — el cascarón lo elige el campo, no la ruta`);
const porReg = {};
for (const p of numericos) {
  const g = (porReg[regDe[p.ruta] ?? "?"] ??= { n: 0, dist: 0, rutas: new Set() });
  g.n++; g.rutas.add(p.ruta);
  if (Math.abs(p.o - p.c) >= 0.01) g.dist++;
}
for (const [reg, g] of Object.entries(porReg).sort())
  console.log(`  ${reg.padEnd(4)} ${String(g.rutas.size).padStart(3)} rutas · ${String(g.n).padStart(6)} pares numéricos · ${String(g.dist).padStart(6)} distintos`);

/* ══════════════════════════════════════════════════════════════════════════
 * 4c · EL NIVEL DE MÓDULO — el cotejo contra los ejes de la SPEC
 *
 * §*UN ARQUETIPO NUEVO NO HEREDA COBERTURA* pide comparar los ejes estándar;
 * la spec de este arquetipo midió MARCADO y GEOMETRÍA DE MÓDULO, y hasta la
 * 103.ª este comparador publicaba `nModulos` —un recuento— y nada de dentro.
 * Un recuento es el nivel de arriba de la membresía: `313 → 313` es exacto y
 * los dos conjuntos pueden diferir sin que el número se mueva.
 * ════════════════════════════════════════════════════════════════════════ */
console.log(`\n═══ 4c · NIVEL DE MÓDULO — por TIPO (llave posicional; ver \`medir\`)`);
const modPares = numericos.filter((p) => /^mod\d+\./.test(p.eje));
const porTipoMod = {};
for (const p of modPares) {
  const t = (porTipoMod[p.tipo ?? "?"] ??= { n: 0, dist: 0, ejes: {} });
  t.n++;
  if (Math.abs(p.o - p.c) >= 0.01) {
    t.dist++;
    const e = p.eje.split(".")[1];
    t.ejes[e] = (t.ejes[e] || 0) + 1;
  }
}
console.log(`  pares de MÓDULO: ${modPares.length}  (de ${numericos.length} numéricos)`);
if (modPares.length === 0)
  console.log(`  ⚠⚠ CERO pares de módulo: eso NO es «los módulos cuadran», es que no se midió ninguno (§sondas 4).`);
for (const [t, v] of Object.entries(porTipoMod).sort((a, b) => b[1].n - a[1].n))
  console.log(`  ${String(t).padEnd(20)} ${String(v.n).padStart(5)} pares · ${String(v.dist).padStart(5)} distintos${v.dist ? "   ejes: " + Object.entries(v.ejes).map(([k, n]) => `${k}×${n}`).join(" · ") : ""}`);

/**
 * El CRUCE de tipo: la llave es posicional, así que si el clon emite un módulo
 * de menos, el `tipo` de los siguientes deja de coincidir. Se publica porque es
 * la señal que distingue «ritmo mal» de «módulo perdido».
 *
 * ⚠⚠ **PERO LOS DOS LADOS NOMBRAN EL MISMO TIPO DISTINTO, y la v1 de este cruce
 * no lo sabía: daba `257 de 356 desalineados` — o sea el 72 %.** El original
 * dice `et_pb_text` y el clon dice `texto-pagina`: son **el mismo tipo en dos
 * sistemas de nombres**, no un desalineamiento. Un cruce que marca a casi todas
 * está midiendo el instrumento (§*un patrón que casa en TODAS tampoco mide
 * nada*, en su forma sobre-casada), y encima **invitaba a explicarlo**.
 *
 * La tabla traduce Divi → `kind` del esquema, y es la misma correspondencia que
 * el extractor ya aplica en `aBloque`. Un tipo que no esté aquí sale **NOMBRADO**
 * en vez de contarse como desalineado: no saber traducirlo es un hueco del
 * instrumento, y decirlo «desalineado» sería atribuírselo al clon.
 */
const KIND_DE_DIVI = {
  text: "texto-pagina", image: "imagen-pagina", button: "boton-pagina", code: "codigo",
  toggle: "toggle", video: "video-pagina", blurb: "blurb", icon: "icono", map: "mapa",
  slider: "slider", fullwidth_slider: "slider-completo",
};
const tipoCruz = pares.filter((p) => /^mod\d+\.w$/.test(p.eje));
const sinTraducir = [...new Set(tipoCruz.map((p) => p.tipo).filter((t) => t && !KIND_DE_DIVI[t]))];
const desalineados = tipoCruz.filter(
  (p) => p.tipoClon != null && p.tipo != null && KIND_DE_DIVI[p.tipo] && KIND_DE_DIVI[p.tipo] !== p.tipoClon,
);
if (sinTraducir.length)
  console.log(`\n  ⚠ tipos del ORIGINAL que esta sonda NO sabe traducir a \`kind\`: ${sinTraducir.join(" · ")}`);
console.log(`\n  CRUCE DE TIPO en la llave posicional: ${desalineados.length} de ${tipoCruz.length} módulos emparejados con OTRO tipo`);
if (desalineados.length)
  for (const p of desalineados.slice(0, 10))
    console.log(`     ⚠ ${p.ruta} ${p.eje.split(".")[0]}  orig \`${p.tipo}\` → clon \`${p.tipoClon}\``);

console.log(`\n═══ 5 · LO QUE ESTE COMPARADOR **NO** CONTESTA`);
console.log(`  · sólo mide ${ANCHO}. El contrato de FIDELIDAD es a 1440 y 390: hay que correr LOS DOS`);
console.log(`  · NO mide ningún ancho intermedio — allí el contrato es de RANGO, y es otra pregunta`);
console.log(`  · el lado «original» es la CAPTURA, no el sitio vivo. Lo que mide es fidelidad`);
console.log(`    del clon a la captura; que la captura reproduzca al vivo lo dice otra sonda`);
console.log(
  SOLO_PILOTO
    ? `  · ${PILOTO.length} páginas de ${TODAS.length}: un verde aquí NO es un verde del arquetipo`
    : `  · las ${PILOTO.length} de ${TODAS.length}, o sea el arquetipo ENTERO — pero sólo sus ejes: la` +
        `\n    TIPOGRAFÍA y el COMPORTAMIENTO (desplegables) siguen sin comparar`,
);
console.log(`  · los módulos SIN CAJA no se pueden medir: \`getComputedStyle\` no resuelve sus %`);
console.log(`    y devolvería ceros que entrarían como dato (36 de 313 en el original)`);

/* El nombre del negativo NO lo pone la sonda: lo pone `w()` desde `NEG`.
 * Ponerlo aquí produciría `…-neg-mismo-lado-neg-delta`, que ningún negativo
 * sabe buscar — y el caso saldría «no congeló» en vez de por su motivo.
 *
 * ⚠⚠ **PERO UNA CORRIDA SABOTEADA A MANO NO PUEDE LLEVARSE EL NOMBRE
 * CANÓNICO, y esta sonda ya se lo llevó una vez (93.ª).** Lanzada como
 * `NEG_MISMO_LADO=1 node f33-cmp.mjs` —sin `NEG=`— `w()` no desvía nada y
 * congeló `medidas/f33-cmp-1440.json` con el lado del clon COPIADO del
 * original y un `httpClon: 200` fabricado. Un fichero con **nombre de medida y
 * contenido de control**: quien lo abriera leería «248 pares · 0 distintos ·
 * clon 200» y concluiría que el clon es perfecto (§regla 7, el precedente de
 * `dos-rutas-1440.json`).
 *
 * Se arregla **la clase, no la instancia**: si hay sabotaje y no hay `NEG`, la
 * salida se desvía igual y se dice en voz alta. Así el nombre canónico sólo
 * puede escribirlo una corrida de verdad — y hasta que exista, quien lo lea
 * **falla en voz alta** en vez de leer un control (§el defecto en la dirección
 * que grita). */
const SABOTEADA = SIN_HOJAS || MISMO_LADO || DELTA || SIN_MEDIA || SIN_FUENTES;
if (SABOTEADA && !process.env.NEG) {
  console.log(`\n⚠ CORRIDA SABOTEADA SIN \`NEG=\`: la salida NO puede llevarse el nombre canónico.`);
  console.log(`  Se desvía a \`f33-cmp-${ANCHO}-neg-a-mano.json\`. Para un negativo con nombre propio, usa \`npm run qa:f33-cmp-neg\`.`);
}
/* ⚠ El dominio va EN EL NOMBRE: una corrida del piloto no puede llevarse el
 * canónico, porque quien lo lea creería que compara las 31 (§regla 7 — un
 * fichero con nombre de medida y contenido de muestra). */
w(`medidas/f33-cmp-${ANCHO}${SOLO_PILOTO ? "-piloto" : ""}${SABOTEADA && !process.env.NEG ? "-neg-a-mano" : ""}.json`, salida);

console.log(`\n═══ 6 · VEREDICTO`);
console.log(`  ✓ evaluadas ${ev.n}/${PILOTO.length} ${SOLO_PILOTO ? "páginas del piloto" : "páginas de la cola larga"} · pares ${pares.length} · distintos ${distintos.length}`);
/* Los TRES canales cierran el código de salida por el MISMO sitio: si uno solo
 * lo cerrara, los otros dos serían una nota al pie (§regla 14). */
if (hojasCero.length || mediaCero.length || fuenteCero.length) process.exit(2);
if (cruceModulos.length)
  console.log(`  ⚠ ${cruceModulos.length} ruta(s) con el CRUCE DE MÓDULOS descuadrado — ver §1b. Cuenta como rojo.`);
if (distintos.length) {
  console.log(`\n  ${distintos.length} pares con Δ ≠ 0. Los 20 mayores:`);
  for (const p of [...distintos].sort((a, b) => Math.abs(b.c - b.o) - Math.abs(a.c - a.o)).slice(0, 20))
    console.log(`     ${p.ruta.padEnd(46)} ${p.eje.padEnd(18)} orig ${String(p.o).padStart(9)} → clon ${String(p.c).padStart(9)}  Δ${(p.c - p.o).toFixed(2)}`);
  process.exit(3);
}
/* Sin este remate, «0 distintos» taparía un cruce descuadrado y la corrida
 * saldría VERDE con dos censos que no cuentan lo mismo debajo (§regla 1: lo que
 * imprime y lo que cuenta no pueden discrepar). */
if (cruceModulos.length) process.exit(4);
