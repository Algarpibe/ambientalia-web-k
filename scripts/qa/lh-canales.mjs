/**
 * LOS CANALES DE LAS PÁGINAS QUE EL COMPARADOR NO MIRA — el inventario que hay
 * que derivar ANTES de capturar nada.
 * Uso: npm run qa:lh-canales
 * Negativos: SABOTAJE=canal-mudo | patron-muerto | guarda-floja
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y POR QUÉ ANTES DE LA CAMPAÑA Y NO DESPUÉS
 *
 * `CLAUDE.md` §EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA
 * DECLARA, NO DE LOS QUE ALGÚN EXTRACTOR YA LEE. Ese hueco se ha pagado **cuatro
 * veces**, y las cuatro se descubrió **chocando**: tres matando un seed y la
 * cuarta —las hojas CSS— dejando una condición de T9 sin pagar durante dos
 * tandas, **sin romper nada**, que es la peor salida posible.
 *
 * Ensanchar `qa:lh-cmp` a la PÁGINA mete **71 páginas nuevas** en el dominio del
 * comparador (§F3-LH-ALCANCE-PAGINA-1). Cada una es un documento del original
 * con sus canales, y sin ellos lo capturado no reproduce lo servido: la medición
 * sale **plausible y falsa** — medido en §F3-1-CSS-NO-CAPTURADO, `columna.width`
 * **678.52 offline contra 430.80 en vivo**.
 *
 * ⚠ **Y la primera versión de esta sonda llegó con la premisa EQUIVOCADA, que
 * es justo lo que su negativo cazó (§sondas 1).** Decía —copiando la cabecera de
 * `cms:captura-css`— que *«Divi compila una hoja `et-cache` por página, así que
 * 71 páginas nuevas traen hasta 71 hojas nuevas»*. **Falso para esta familia**, y
 * el dato lo dice sin ambigüedad:
 *
 * | medido sobre las 84 páginas | n |
 * |---|---|
 * | hojas distintas | **47** (40 `et-cache`) |
 * | `et-cache` usadas por **una sola serie** | **32** de 40 |
 * | series con `et-cache` propia | **30** de 35 |
 * | hojas que las 71 nuevas necesitaban capturar | **0** |
 *
 * O sea que **la unidad de la `et-cache` es el POST/PLANTILLA, no la ruta
 * paginada**: `et-core-unified-cpt-27481.min.css` cubre **las 8 páginas** de su
 * serie. «Una hoja por página» es cierto con *página* = entrada de WordPress, y
 * se lee como *ruta* — que es la lectura que infla la campaña ×2.
 * Por eso el canal se publica **con su relación medida** (`porSerie` abajo) y no
 * sólo con su recuento: un cardinal absorbe la membresía (§la causa común).
 *
 * ── Lo que esta sonda contesta ────────────────────────────────────────────
 *   1 · **cuáles son las 71**, derivadas y no escritas: la población de
 *       `lh-serie.json` menos lo que el espejo ya trae;
 *   2 · **qué canales portan**, enumerados sobre el HTML SERVIDO (el corpus
 *       congelado), con su recuento **y sus ceros** — un canal declarado y sin
 *       dato sale nombrado, que es lo que lo convierte en hueco visible;
 *   3 · **cuánto de eso falta**, cruzado contra **la guarda que para** en cada
 *       caso: `apps/web/public` para lo que sirve el clon, `corpus/css` para las
 *       hojas. Derivar contra otra guarda es lo que convirtió «90 sin capturar»
 *       en «4» (§la mitad 2 de la regla).
 *
 * ── Lo que NO contesta, dicho porque el fichero no lo puede decir ─────────
 * (§UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA)
 *   · **si la página está bien**: esto no compara nada y no abre el clon;
 *   · **si un asset capturado es el correcto**: mira que EXISTA, no que case;
 *   · **el eje de comportamiento**: los canales de un `<script>` no se cuentan
 *     aquí — `qa:comportamiento` es quien tiene esa unidad;
 *   · **las 55 páginas VACÍAS** (`D2.5`): están en el universo de rutas y **no**
 *     en el del comparador, así que sus canales se cuentan **aparte y con su
 *     número**, nunca dentro del denominador de las 71.
 *
 * ── La guarda que hace que un cero signifique algo ────────────────────────
 * §sondas 4: un patrón que no case en NINGUNA página sale por **error**, no por
 * cero. Los tres patrones (hoja · imagen · og:image) declaran además su
 * **máximo**, porque el `<style>` de Divi nombra sus propias clases y un patrón
 * que casa de más da un número plausible de más (§sondas 4, 3.ª cara).
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, origenDe, QA, RE_VARIANTE, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus/fase-3/listados");
const CSS = join(RAIZ, "corpus/css");
const PUBLICO = join(RAIZ, "apps/web/public");

/**
 * LOS SABOTAJES, y por qué son CUATRO y no dos.
 *
 * Los dos primeros atacan el instrumento (§sondas 4): un patrón muerto y un
 * canal que deja de enumerarse tienen que salir por ERROR, nunca por cero.
 *
 * Los dos últimos son **un par**, y existen por §sondas 8a —*un sabotaje que no
 * cambia el resultado no ha probado la guarda*—. Si el día del negativo resulta
 * que **no falta nada**, aflojar la guarda no cambiaría un dígito y el negativo
 * saldría verde sin haber ejercitado nada. Así que los dos **inyectan la misma
 * URL imposible** y sólo se diferencian en la guarda: el control tiene que
 * contarla como AUSENTE y el flojo como presente. El negativo compara **los dos
 * lados**, que es lo único que demuestra que la guarda discrimina.
 */
const SABOTAJES = ["canal-mudo", "patron-muerto", "url-inventada", "guarda-floja"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — corrida de negativo, NO es una medida.\n`);

/** La URL imposible del par de arriba: `uploads`, así que cae en la guarda de
 *  `apps/web/public`, y con un nombre que no puede existir por construcción. */
const INVENTADA = "https://kunakair.com/wp-content/uploads/9999/99/no-existe-jamas-sabotaje.jpg";
const INYECTA = SABOTAJE === "url-inventada" || SABOTAJE === "guarda-floja";

/* ══════════════════════════════════════════════════════════════════════════
 * (1) EL UNIVERSO — derivado de las dos congeladas, ni una ruta escrita
 * ═════════════════════════════════════════════════════════════════════════ */
const lee = (f, porQue) => {
  const p = join(QA, `medidas/${f}`);
  if (!existsSync(p))
    throw new Error(
      `FALTA medidas/${f}: ${porQue}\n` +
        `  Sin ella el universo saldría vacío, y un cero se lee como «no hay nada que\n` +
        `  capturar» en vez de como «no lo miré» (§regla del cero).`,
    );
  return JSON.parse(readFileSync(p, "utf8"));
};
const SERIE = lee("lh-serie.json", "es la población en la unidad PÁGINA, la que estableció que la serie no es una unidad");
const ESPEJO = lee("lh-spec-1440.json", "es el universo que el comparador tiene HOY: sin él no se puede restar lo ya cubierto");
/**
 * La AUTORIDAD de la frontera del servidor, que es lo que separa `D2.5` de
 * `D2.4`. Se usa la canónica; su `paginaDeVerdad` coincide **35/35** con la del
 * 2026-08-14 pese a que las dos congeladas tienen fecha y criterio distintos
 * (`último N con HTTP 200` contra `D2.5`), así que el campo que aquí se lee no
 * depende de cuál se coja — cruzado el 2026-08-14, no supuesto.
 */
const PAGINAS = lee("lh-paginas.json", "es quien mide la frontera del servidor (paginaDeVerdad), y sin ella D2.5 y D2.4 se confunden");

/** `/es/blog/page/2/` · `/blog/page/2` → `blog/page/2`. Tres convenciones en tres ficheros. */
const clave = (r) => String(r).replace(/^\/es/, "").replace(/^\/+/, "").replace(/\/+$/, "") || "/";

const yaEnElEspejo = new Set(Object.keys(ESPEJO.paginas ?? {}).map((k) => clave(k.slice(k.indexOf("::") + 2))));

/**
 * ⚠⚠ **`vacia: true` TIENE DOS CAUSAS Y NO SON LA MISMA FRONTERA — dirimido
 * contra las congeladas, no por parecido (2026-08-14).**
 *
 * El campo por página da **65 de 149**; el resumen del propio `lh-serie` publica
 * **55 de 139**. Las dos son ciertas, y la diferencia **NO es un matiz del
 * denominador de `D2.5`**: es otra frontera del servidor, con otra decisión
 * detrás. Cruzado contra `lh-paginas` (que es la autoridad de la frontera):
 *
 * | grupo | n | lo que dice `lh-paginas` | decisión |
 * |---|---|---|---|
 * | **A** vacías en series que paginan | **55** | `paginaDeVerdad: true` · 200 hasta el 404 · canonical **a sí misma** · `<title>` «Página N de M» | **`D2.5`**, y su denominador **es 55** |
 * | **B** página 1 de 5 series | **5** | `paginaDeVerdad: false`, pero es la página 1: ruta ordinaria, canonical a sí misma | **NINGUNA** |
 * | **C** `/page/2` de esas 5 | **5** | `paginaDeVerdad: false` · 200 hasta N=64 · canonical **a la página 1** (5/5) | **`D2.4`** — y no son «vacías»: **no son rutas** |
 *
 * O sea que **`D2.5` NO se estira a 65**: los 10 no comparten su frontera. Ficha
 * con su número en `PENDIENTES-QA.md` §F3-LH-VACIA-DOS-CAUSAS.
 *
 * ⚠ **Y lo que NO se puede afirmar, con la lista de canales que se miraron:**
 * la primera versión de este comentario decía que en el grupo B *«`tarjetas: 0`
 * no significa que la página no liste nada, sino que esa forma no se lista con
 * `<article>`»*. **No está respaldado.** `lh-serie` cuenta por `<article>` y da
 * 0; `lh-censo` cuenta con **las dos familias** —módulo de Divi y loop del
 * tema— y **también da 0** en las 5. Con esos dos canales mirados, lo único
 * sostenible es *«ninguno de los dos instrumentos les encuentra listado»*; si
 * esas páginas listan por un tercer mecanismo, **nadie lo ha medido**.
 *
 * Se discrimina, por tanto, por lo que SÍ está medido: **la forma usa
 * `<article>` si alguna página de su serie trae tarjetas** — que es el mismo par
 * de ceros que `lh-paginas` ya separaba en su cabecera.
 */
const usaArticle = new Map();
for (const [serie, s] of Object.entries(SERIE.series ?? {}))
  usaArticle.set(clave(serie), (s.paginas ?? []).some((p) => (p.tarjetas ?? 0) > 0));

/** `paginaDeVerdad` por serie: `true` ⇒ la frontera es la de `D2.5` (200 hasta
 *  el 404); `false` ⇒ la de `D2.4` (200 para cualquier N, canonical a la 1.ª). */
const paginaDeVerdad = new Map();
for (const [r, v] of Object.entries(PAGINAS.paginas ?? {})) paginaDeVerdad.set(clave(r), v.paginaDeVerdad !== false);
{
  const huerfanas = [...usaArticle.keys()].filter((s) => !paginaDeVerdad.has(s));
  if (huerfanas.length)
    throw new Error(
      `${huerfanas.length} serie(s) sin frontera medida en lh-paginas.json: ${huerfanas.slice(0, 6).join(" · ")}\n` +
        `  Sin \`paginaDeVerdad\` no se puede separar D2.5 de D2.4, y meterlas en el cubo\n` +
        `  de las vacías estiraría una decisión firmada a rutas que no cubre.`,
    );
}

const UNIVERSO = [];
for (const [serie, s] of Object.entries(SERIE.series ?? {}))
  for (const pg of s.paginas ?? [])
    UNIVERSO.push({
      clave: clave(pg.n === 1 ? serie : `${serie}/page/${pg.n}`),
      serie: clave(serie),
      n: pg.n,
      pos: pg.pos,
      clase: pg.clase,
      vacia: pg.vacia,
      formaUsaArticle: usaArticle.get(clave(serie)) === true,
      paginaDeVerdad: paginaDeVerdad.get(clave(serie)) === true,
      /* Un `/page/N` de una serie que NO pagina **no es una ruta**: el servidor
       * sirve el MISMO documento y su canonical apunta a la página 1. Se marca
       * aquí porque el recuento de «páginas» se los traga sin decirlo. */
      esFantasma: pg.n > 1 && paginaDeVerdad.get(clave(serie)) === false,
    });

if (!UNIVERSO.length)
  throw new Error("0 páginas en lh-serie.json: sin población no hay canales que derivar (§regla del cero).");

/** El dominio del comparador ensanchado: las que TIENEN contenido en `<article>`.
 *  Las otras dos poblaciones se cuentan APARTE y con su número, porque son cosas
 *  distintas y meterlas en el mismo cubo es cómo se declara un cero sin medir. */
const conContenido = UNIVERSO.filter((p) => p.vacia !== true);
const vacias = UNIVERSO.filter((p) => p.vacia === true && p.formaUsaArticle);
const sinArticle = UNIVERSO.filter((p) => p.vacia === true && !p.formaUsaArticle);
const NUEVAS = conContenido.filter((p) => !yaEnElEspejo.has(p.clave));

/**
 * ⚠ **EL REPARTO DE `vacia: true` POR FRONTERA — es lo que impide estirar una
 * decisión firmada a rutas que no cubre.** `D2.5` está firmada **con 55
 * delante**; los otros 10 tienen otra frontera medida, y «se parecen» no es un
 * criterio (§la forma de lo que le pasó a `D4`: la medida era buena y **el
 * denominador estaba mal formado**).
 */
const porFrontera = {
  /* A · la frontera de D2.5: la serie pagina de verdad y esta página no lista. */
  d25_vaciaEnSerieQuePagina: vacias.filter((p) => p.paginaDeVerdad),
  /* Si esto no es 0, `vacias` está mezclando fronteras y el reparto miente. */
  d25_vaciaEnSerieQueNOPagina: vacias.filter((p) => !p.paginaDeVerdad),
  /* B · página 1 de una serie que no pagina: ruta ordinaria, canonical a sí
   *     misma, y ninguna de las dos decisiones habla de ella. */
  sinDecision_pagina1: sinArticle.filter((p) => p.n === 1),
  /* C · `/page/N` de esas mismas: D2.4 — y no son «vacías», NO SON RUTAS. */
  d24_fantasma: sinArticle.filter((p) => p.esFantasma),
};
/** ⚠ Y los fantasmas que se colaron DENTRO de `conContenido`: su `/page/2`
 *  duplica las tarjetas de la 1.ª, así que el filtro por contenido no los ve. */
const fantasmasEnConContenido = conContenido.filter((p) => p.esFantasma);

/* ══════════════════════════════════════════════════════════════════════════
 * (2) LOS CANALES — sobre el HTML SERVIDO, y sobre el que NO lleva CSS dentro
 *
 * §sondas 4, 3.ª cara: el CSS de Divi nombra sus propias clases y sus propias
 * URL (`url(...)` de fondos), así que un patrón sobre el documento entero cuenta
 * selectores como marcado. Los patrones de MARCADO corren sobre el HTML sin
 * `<style>` ni `<script>`; el de `og:image` corre sobre el `<head>` entero
 * porque ahí vive, y es un `<meta>`, no marcado de cuerpo.
 * ═════════════════════════════════════════════════════════════════════════ */
const sinCss = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

const RE = {
  link: /<link\b[^>]*>/gi,
  img: /<img\b[^>]*>/gi,
  ogImage: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
  /* Sólo para PODER DECLARAR SU CARDINAL: los `<script src>` son unidad de
   * `qa:comportamiento`, no de ésta. Pero «fuera de alcance» no se puede
   * escribir sin su número — si no, es un cero que nadie midió (§regla 14 y
   * §la mitad 3 de la regla del inventario). */
  script: /<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi,
};
/** El patrón MUERTO del sabotaje: casa con una etiqueta que no existe. */
const reImg = () => (SABOTAJE === "patron-muerto" ? /<imagen\b[^>]*>/gi : RE.img);

/** Una hoja es `rel` de hoja **o** `href` a `.css`: el corpus trae la misma
 *  escrita de las dos formas y filtrar por una sola da un número más bajo y
 *  plausible (razón ya medida en `cms:captura-css`). */
const hojaDe = (tag) => {
  if (!/stylesheet/i.test(tag) && !/\.css/i.test(tag)) return null;
  const m = tag.match(/href=["']([^"']+)["']/i);
  return m ? m[1] : null;
};
const sinVer = (u) => String(u).split("?")[0];

/** Todo lo que un `<img>` puede portar: `src` **y** cada candidato del `srcset`.
 *  Contar sólo el `src` daría un inventario plausible que se queda corto en las
 *  variantes, y las variantes son ficheros distintos en el disco del clon. */
const urlsDeImg = (tag) => {
  const out = [];
  const s = tag.match(/\ssrc=["']([^"']+)["']/i);
  if (s) out.push(s[1]);
  const ss = tag.match(/\ssrcset=["']([^"']+)["']/i);
  if (ss)
    for (const trozo of ss[1].split(","))
      {
        const u = trozo.trim().split(/\s+/)[0];
        if (u) out.push(u);
      }
  return out;
};

/**
 * LA FAMILIA DE UN ASSET — es lo que decide **quién** tiene que tenerlo, y por
 * tanto contra qué guarda se cruza. No es cosmética: cruzar `uploads` contra
 * `corpus/css` daría «todo falta» y cruzar una hoja contra `apps/web/public`
 * daría «todo está».
 */
const familiaAsset = (u) => {
  const s = String(u);
  if (/^data:/i.test(s)) return "data-uri";
  if (/\/wp-content\/uploads\//i.test(s)) return "uploads";
  if (/\/wp-content\/themes\//i.test(s)) return "tema";
  if (/\/wp-content\/plugins\//i.test(s)) return "plugin";
  if (/\/wp-includes\//i.test(s)) return "wp-includes";
  if (/^https?:\/\//i.test(s)) return "externo";
  return "relativo";
};
const familiaHoja = (u) =>
  u.includes("/et-cache/") ? "et-cache" : u.includes("/plugins/") ? "plugin" : u.includes("/themes/") ? "tema" : u.includes("/wp-includes/") ? "wp-includes" : "otro";

/* ── LAS DOS GUARDAS, cada canal contra la SUYA (§la mitad 2 de la regla) ── */
/** Lo que el clon sirve: el fichero EXACTO bajo `apps/web/public`. Es la misma
 *  traducción que usa `qa:media-siembra`, no una segunda (clase C7). */
const aPublico = (u) =>
  "/" + String(u).replace(/^https?:\/\/kunakair\.com/, "").replace(/^\/?wp-content\/uploads\//, "images/uploads/").replace(/^\//, "");
const enPublico = (u) => {
  if (SABOTAJE === "guarda-floja") return true; // ← la guarda cómoda: «si algo hay, vale»
  return existsSync(join(PUBLICO, aPublico(u).replace(/^\//, "")));
};
/** Lo que la captura del documento necesita: el fichero bajo `corpus/css`. */
const aCss = (u) => String(u).replace(/^https?:\/\/[^/]+\//, "").replace(/[?#].*$/, "");
const enCss = (u) => existsSync(join(CSS, aCss(u)));

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO — una página, sus canales, su cruce
 * ═════════════════════════════════════════════════════════════════════════ */
const aCorpus = (k) => join(CORPUS, k, "index.html");

const ev = new Evaluadas({ nombre: "lh-canales", unidad: "páginas del universo ensanchado", minimo: conContenido.length });

/** Los canales se declaran ENTEROS, con sus ceros: un canal sin dato nombrado es
 *  un hueco visible; un canal ausente de la tabla es la próxima sorpresa. */
const CANALES = {
  hoja: { que: "<link> de hoja de estilo", guarda: "corpus/css", urls: new Map() },
  imagen: { que: "<img> src y cada candidato de srcset", guarda: "apps/web/public", urls: new Map() },
  ogImage: { que: "<meta property=og:image>", guarda: "apps/web/public", urls: new Map() },
};
/** Un patrón que casa en NINGUNA página es un defecto, no un cero (§sondas 4). */
const casos = { hoja: 0, imagen: 0, ogImage: 0 };

const porPagina = {};
const sinCorpus = [];
/** Canales que esta sonda NO cruza contra ninguna guarda, pero cuyo CARDINAL
 *  publica: sin él, «fuera de alcance» y «no hay» se escriben igual. */
const fueraDeAlcance = { script: new Set() };

for (const P of conContenido) {
  const f = aCorpus(P.clave);
  if (!existsSync(f)) {
    sinCorpus.push(P.clave);
    ev.fallo(P.clave, "sin HTML en el corpus");
    continue;
  }
  const html = readFileSync(f, "utf8");
  const cuerpo = sinCss(html);
  /* El `<script src>` se cuenta sobre el HTML CRUDO: `sinCss` se lleva los
   * `<script>` enteros, y contarlos ahí daría CERO — un cero de instrumento
   * exactamente donde se iba a declarar «fuera de alcance». */
  for (const m of html.matchAll(RE.script)) fueraDeAlcance.script.add(String(m[1]).split("?")[0]);

  const hojas = [];
  /* `canal-mudo`: el canal deja de enumerarse. No baja el número — lo pone a
   * CERO, y un cero tiene que salir por error (§sondas 4). */
  if (SABOTAJE !== "canal-mudo")
    for (const m of cuerpo.matchAll(RE.link)) {
      const h = hojaDe(m[0]);
      if (h) hojas.push(sinVer(h));
    }
  const imagenes = [];
  for (const m of cuerpo.matchAll(reImg())) imagenes.push(...urlsDeImg(m[0]));
  if (INYECTA) imagenes.push(INVENTADA);
  const ogs = [...html.matchAll(RE.ogImage)].map((m) => m[1]);

  casos.hoja += hojas.length;
  casos.imagen += imagenes.length;
  casos.ogImage += ogs.length;

  const apunta = (canal, u, extra) => {
    const k = canal === "hoja" ? sinVer(u) : String(u).split("?")[0];
    const m = CANALES[canal].urls;
    if (!m.has(k)) m.set(k, { ...extra, paginas: new Set(), series: new Set() });
    m.get(k).paginas.add(P.clave);
    /* La SERIE, además de la página: es lo que distingue «una hoja por ruta» de
     * «una hoja por post», y las dos dan el mismo recuento de hojas. */
    m.get(k).series.add(P.serie);
  };
  for (const u of hojas) apunta("hoja", u, { familia: familiaHoja(u) });
  for (const u of imagenes) apunta("imagen", u, { familia: familiaAsset(u) });
  for (const u of ogs) apunta("ogImage", u, { familia: familiaAsset(u) });

  porPagina[P.clave] = {
    n: P.n,
    pos: P.pos,
    clase: P.clase,
    nuevaParaElComparador: !yaEnElEspejo.has(P.clave),
    hojas: hojas.length,
    hojasEtCache: hojas.filter((u) => familiaHoja(u) === "et-cache").length,
    imagenes: imagenes.length,
    ogImage: ogs.length,
  };
  ev.ok();
}

/* ── el veredicto por canal, con su cero y su guarda ─────────────────────── */
const resumenCanal = (canal) => {
  const C = CANALES[canal];
  const filas = [...C.urls].map(([u, v]) => ({
    url: u,
    familia: v.familia,
    paginas: v.paginas.size,
    series: v.series.size,
    /* Cada canal contra LA SUYA. `uploads` es lo único que el clon sirve como
     * media; el resto del inventario se nombra y NO se cruza contra `public`,
     * porque ahí no vive (decirlo de otra forma declararía un cero que nadie
     * midió — §la mitad 3 de la regla: «fuera de alcance» ≠ «sin dato»). */
    presente:
      canal === "hoja"
        ? enCss(u)
        : v.familia === "uploads"
          ? enPublico(u)
          : null,
  }));
  const porFamilia = {};
  for (const f of filas) {
    /* ⚠ `enUnaSolaSerie` va **por familia** y no sólo por canal: el número del
     * canal entero y el de `et-cache` coinciden hoy por casualidad —las 7 hojas
     * que no son `et-cache` están todas compartidas— y citar uno por el otro es
     * una afirmación que no se puede auditar. */
    porFamilia[f.familia] ??= { distintas: 0, presentes: 0, faltan: 0, fueraDeAlcance: 0, enUnaSolaSerie: 0, enVariasSeries: 0 };
    porFamilia[f.familia].distintas++;
    if (f.presente === true) porFamilia[f.familia].presentes++;
    else if (f.presente === false) porFamilia[f.familia].faltan++;
    else porFamilia[f.familia].fueraDeAlcance++;
    if (f.series === 1) porFamilia[f.familia].enUnaSolaSerie++;
    else porFamilia[f.familia].enVariasSeries++;
  }
  /**
   * ⚠ **LA RELACIÓN, no sólo el recuento.** «40 hojas» es compatible con *una
   * por ruta* y con *una por post*, y las dos campañas que salen de ahí difieren
   * en el doble. Se publica cuántas usa **una sola serie** frente a cuántas
   * comparten varias, que es lo que separa las dos lecturas.
   */
  const porSerie = {
    enUnaSolaSerie: filas.filter((f) => f.series === 1).length,
    enVariasSeries: filas.filter((f) => f.series > 1).length,
    /* Y el reparto entero, para que nadie tenga que fiarse del resumen. */
    reparto: filas.reduce((m, f) => ((m[f.series] = (m[f.series] || 0) + 1), m), {}),
  };
  return {
    que: C.que,
    guarda: C.guarda,
    apariciones: casos[canal],
    distintas: filas.length,
    presentes: filas.filter((f) => f.presente === true).length,
    faltan: filas.filter((f) => f.presente === false).length,
    fueraDeAlcance: filas.filter((f) => f.presente === null).length,
    porFamilia,
    porSerie,
    /* Las que faltan van con nombre: una lista sin nombres no se puede capturar. */
    listaAPedir: filas.filter((f) => f.presente === false).map((f) => f.url).sort(),
    /* El canal de hojas cabe entero (47 filas) y su relación es la que corrigió
     * la premisa de esta tanda: se congela con nombres, no resumido. */
    ...(canal === "hoja" ? { filas: filas.sort((a, b) => a.url.localeCompare(b.url)) } : {}),
  };
};

const canales = Object.fromEntries(Object.keys(CANALES).map((c) => [c, resumenCanal(c)]));

/* ══════════════════════════════════════════════════════════════════════════
 * EL REPARTO DE LO QUE FALTA — porque «falta» no es UNA cosa
 *
 * ⚠ **Capturar NO es colocar, y una lista que los mezcle pide al original
 * ficheros que ya están en disco.** De lo que falta en `apps/web/public`:
 *
 *   · lo que ya está en `media-corpus/` ⇒ se COPIA (`cms:coloca-media`);
 *   · una VARIANTE `-WxH` cuyo origen está ⇒ se REGENERA con `sharp` — decisión
 *     ya tomada y medida (`qa:media-regenera`, 73/73), no se re-decide aquí;
 *   · lo demás ⇒ se PIDE al original, y **colapsado a su ORIGEN**: pedir la
 *     variante inflaría la campaña sin añadir un byte.
 *
 * La salida usa los mismos nombres que `media-siembra` (`faltan` ·
 * `origenesACapturar`) para que las dos campañas la consuman **sin una segunda
 * definición de «lo que falta»** (clase C7).
 * ═════════════════════════════════════════════════════════════════════════ */
const MEDIA_CORPUS = join(RAIZ, "media-corpus");
const enMediaCorpus = new Set();
(function barre(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) barre(p);
    else if (e.isFile() && !e.name.endsWith(".json"))
      enMediaCorpus.add(relative(MEDIA_CORPUS, p).split(sep).join("/").replace(/^(fase-3|datos)\//, ""));
  }
})(MEDIA_CORPUS);
const enCorpusMedia = (rutaLocal) => enMediaCorpus.has(decodeURIComponent(rutaLocal).replace(/^\/images\/uploads\//, ""));

const faltan = {};
const reparto = { enMediaCorpus: [], variantesConOrigenEnCorpus: [], aPedir: [] };
for (const canal of ["imagen", "ogImage"])
  for (const [u, v] of CANALES[canal].urls) {
    if (v.familia !== "uploads" || enPublico(u)) continue;
    const r = aPublico(u);
    (faltan[r] ??= { canales: [], colecciones: ["listados"], referencias: 0, url: u });
    if (!faltan[r].canales.includes(canal)) faltan[r].canales.push(canal);
    faltan[r].referencias += v.paginas.size;
  }
for (const r of Object.keys(faltan).sort()) {
  const esVar = RE_VARIANTE.test(r);
  if (!esVar && enCorpusMedia(r)) reparto.enMediaCorpus.push(r);
  else if (esVar && enCorpusMedia(origenDe(r))) reparto.variantesConOrigenEnCorpus.push(r);
  else reparto.aPedir.push(r);
}
/** Las variantes se COLAPSAN a su origen: `sharp` fabrica el resto. */
const origenesACapturar = [...new Set(reparto.aPedir.map((r) => (RE_VARIANTE.test(r) ? origenDe(r) : r)))].sort();
const sinRed = reparto.enMediaCorpus.length + reparto.variantesConOrigenEnCorpus.length;

/* Sólo las de las 71 NUEVAS: es el número del encargo, y no es el mismo. */
const clavesNuevas = new Set(NUEVAS.map((p) => p.clave));
const soloDeLasNuevas = (canal) => {
  const C = CANALES[canal];
  const filas = [...C.urls].filter(([, v]) => [...v.paginas].some((p) => clavesNuevas.has(p)));
  const nuevasDelTodo = filas.filter(([, v]) => [...v.paginas].every((p) => clavesNuevas.has(p)));
  return { tocadasPorLasNuevas: filas.length, exclusivasDeLasNuevas: nuevasDelTodo.length };
};

const salida = {
  meta: {
    fecha: hoy(),
    que: "INVENTARIO DE CANALES de las páginas que el comparador NO mira — derivado ANTES de capturar",
    fuente: "corpus/fase-3/listados (HTML congelado) · población de medidas/lh-serie.json · espejo de medidas/lh-spec-1440.json",
    autoridad: "CLAUDE.md §EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA DECLARA · §F3-LH-ALCANCE-PAGINA-1",
    unidad: "la PÁGINA para el universo; la URL DISTINTA para cada canal",
    noMide: [
      `el clon: no abre navegador ni servidor — 0 de las ${conContenido.length} páginas se renderiza aquí`,
      `si un asset presente es el CORRECTO: mira que exista, no que case (${canales.imagen.distintas} URL de imagen distintas)`,
      `las ${vacias.length} páginas VACÍAS de D2.5 (de ${UNIVERSO.length}): están en el universo de RUTAS y no en el del comparador, y sus canales NO entran en estos números`,
      `las ${porFrontera.sinDecision_pagina1.length} páginas 1 de series que NO paginan ` +
        `(${porFrontera.sinDecision_pagina1.map((p) => p.serie).sort().join(" · ")}): son RUTAS ORDINARIAS y ` +
        `NINGUNA decisión las cubre — D2.5 no se les aplica por parecido. Ficha: §F3-LH-VACIA-DOS-CAUSAS`,
      `las ${porFrontera.d24_fantasma.length} \`/page/2\` de esas mismas series: D2.4 (canonical a la página 1) ⇒ el MISMO documento, no una ruta`,
      `${fantasmasEnConContenido.length} fantasmas que sí entran en las ${conContenido.length} con contenido ` +
        `(${fantasmasEnConContenido.map((p) => p.clave).sort().join(" · ") || "—"}): su /page/2 duplica las tarjetas de la 1.ª y el filtro por contenido no los ve`,
      `el eje de comportamiento: ${fueraDeAlcance.script.size} <script src> distintos en estas ${conContenido.length} páginas, cruzados contra 0 guardas — son unidad de qa:comportamiento, no de ésta`,
    ],
  },
  universo: {
    paginas: UNIVERSO.length,
    conContenido: conContenido.length,
    /* Las TRES poblaciones suman el universo, y por eso van las tres: un cubo
     * que se coma dos causas distintas es un cero que nadie midió. */
    vacias: vacias.length,
    sinArticle: sinArticle.length,
    seriesSinArticle: [...new Set(sinArticle.map((p) => p.serie))].sort(),
    cuadraElUniverso: conContenido.length + vacias.length + sinArticle.length === UNIVERSO.length,
    /**
     * El reparto de `vacia: true` **por FRONTERA**, que es lo que decide qué
     * decisión aplica. Cada grupo con su n y su autoridad.
     */
    vaciaPorFrontera: {
      autoridad: `medidas/lh-paginas.json (${PAGINAS.meta?.fecha ?? "?"}) · campo paginaDeVerdad`,
      A_d25_vaciaEnSerieQuePagina: {
        n: porFrontera.d25_vaciaEnSerieQuePagina.length,
        frontera: "200 hasta el 404 · canonical A SÍ MISMA · <title> «Página N de M»",
        decision: "D2.5 (firmada) — y su denominador es ÉSTE",
      },
      B_sinDecision_pagina1DeSerieQueNoPagina: {
        n: porFrontera.sinDecision_pagina1.length,
        series: porFrontera.sinDecision_pagina1.map((p) => p.serie).sort(),
        frontera: "ninguna de paginación: es la página 1, ruta ordinaria con canonical a sí misma",
        decision: "NINGUNA — no se le aplica D2.5 por parecido (ficha propia)",
      },
      C_d24_fantasma: {
        n: porFrontera.d24_fantasma.length,
        frontera: "200 para CUALQUIER N hasta 64 · canonical A LA PÁGINA 1 ⇒ el mismo documento",
        decision: "D2.4 — pero no son «vacías»: NO SON RUTAS",
      },
      /* Guarda: si esto no es 0, el cubo de las vacías mezcla dos fronteras. */
      mezcla_vaciaEnSerieQueNoPagina: porFrontera.d25_vaciaEnSerieQueNOPagina.length,
    },
    /**
     * ⚠ **Y el universo de 149 NO son 149 rutas.** `lh-serie` capturó el
     * `/page/2` de las 7 series que no paginan; `lh-paginas` declara **142**
     * rutas. La diferencia son **7 documentos que no son rutas distintas**, y
     * **2 de ellos están DENTRO de `conContenido`** porque su `/page/2` duplica
     * las tarjetas de la 1.ª (57 y 3) y el filtro por contenido no los ve.
     */
    fantasmas: {
      total: UNIVERSO.filter((p) => p.esFantasma).length,
      dentroDeConContenido: fantasmasEnConContenido.length,
      cuales: fantasmasEnConContenido.map((p) => p.clave).sort(),
      queSignifica: "documentos servidos con 200 cuyo canonical apunta a la página 1: el MISMO documento, no una ruta más",
      rutasSegunLhPaginas: PAGINAS.meta?.total ?? null,
    },
    yaEnElEspejo: yaEnElEspejo.size,
    /* El 71 del encargo, DERIVADO. Si sale otro número, manda éste. */
    nuevasParaElComparador: NUEVAS.length,
    /**
     * ⚠ **Y el universo que el comparador debe medir NO es `conContenido`.**
     * Le sobran los DUPLICADOS: `/page/N` de series que no paginan, que el
     * servidor sirve como el mismo documento (canonical a la 1.ª) y que el
     * filtro por contenido no ve porque repiten sus tarjetas. Se publica aquí
     * para que este número y el de `qa:lh-espejo` **sean el mismo antes** de que
     * `qa:lh-alcance` prediga sobre ninguno de los dos.
     */
    universoDelComparador: conContenido.length - fantasmasEnConContenido.length,
    nuevasSinDuplicados: NUEVAS.filter((p) => !p.esFantasma).length,
    factorSobreLoQueHoySeCompara: yaEnElEspejo.size ? +(conContenido.length / yaEnElEspejo.size).toFixed(1) : null,
    sinHtmlEnElCorpus: sinCorpus.length,
    rutasSinHtml: sinCorpus,
  },
  canales,
  /* Nombrados con su cero y su cardinal: un canal que otro instrumento cubre NO
   * es «sin dato», es fuera de alcance — y decirlo de otra forma declara un cero
   * que nadie midió (§la mitad 3 de la regla del inventario). */
  fueraDeAlcance: {
    script: { distintos: fueraDeAlcance.script.size, guarda: "ninguna aquí — qa:comportamiento", cruzados: 0 },
  },
  aportacionDeLasNuevas: Object.fromEntries(Object.keys(CANALES).map((c) => [c, soloDeLasNuevas(c)])),
  /* Los nombres son los de `media-siembra` a propósito: las dos campañas
   * (`cms:captura-f3-media --lista=` y `cms:coloca-media LISTA=`) los consumen
   * sin una segunda definición de «lo que falta». */
  campana: {
    faltanEnPublico: Object.keys(faltan).length,
    reparto: {
      enMediaCorpus: reparto.enMediaCorpus.length,
      variantesConOrigenEnCorpus: reparto.variantesConOrigenEnCorpus.length,
      aPedir: reparto.aPedir.length,
    },
    seResuelvenSinRed: sinRed,
    origenesDistintosACapturar: origenesACapturar.length,
  },
  faltan,
  origenesACapturar,
  porPagina,
};

console.log(`\n════════ LISTADOS · CANALES DEL UNIVERSO ENSANCHADO ════════\n`);
console.log(
  `  páginas del original      ${UNIVERSO.length}   (${conContenido.length} con contenido · ${vacias.length} vacías D2.5 · ` +
    `${sinArticle.length} de formas SIN <article>)   ${salida.universo.cuadraElUniverso ? "✓ suman" : "⚠ NO SUMAN"}`,
);
const vf = salida.universo.vaciaPorFrontera;
console.log(`  ── \`vacia: true\` = ${vacias.length + sinArticle.length}, y NO es una sola frontera (autoridad: ${vf.autoridad}) ──`);
console.log(`    A · D2.5  vacía en serie que PAGINA        ${String(vf.A_d25_vaciaEnSerieQuePagina.n).padStart(3)}   ${vf.A_d25_vaciaEnSerieQuePagina.frontera}`);
console.log(`    B · ——    página 1 de serie que NO pagina  ${String(vf.B_sinDecision_pagina1DeSerieQueNoPagina.n).padStart(3)}   SIN DECISIÓN — ${vf.B_sinDecision_pagina1DeSerieQueNoPagina.series.join(" · ")}`);
console.log(`    C · D2.4  /page/N de esas mismas           ${String(vf.C_d24_fantasma.n).padStart(3)}   ${vf.C_d24_fantasma.frontera}`);
if (vf.mezcla_vaciaEnSerieQueNoPagina) console.log(`    ⚠ ${vf.mezcla_vaciaEnSerieQueNoPagina} vacías en serie que NO pagina: el cubo mezcla fronteras`);
console.log(`  fantasmas (no son rutas)  ${salida.universo.fantasmas.total}   de los que ${salida.universo.fantasmas.dentroDeConContenido} caen DENTRO de las ${conContenido.length} con contenido: ${salida.universo.fantasmas.cuales.join(" · ") || "—"}`);
console.log(`  lh-paginas declara        ${salida.universo.fantasmas.rutasSegunLhPaginas} rutas   (149 documentos − 7 fantasmas)`);
console.log(`  el comparador ya trae     ${yaEnElEspejo.size}`);
console.log(`  ▸ NUEVAS para el dominio  ${NUEVAS.length}   ← el número del encargo, derivado`);
console.log(
  `  ▸ universo DEL COMPARADOR ${salida.universo.universoDelComparador}   = ${conContenido.length} − ${fantasmasEnConContenido.length} duplicados` +
    `   ⇒ nuevas SIN duplicados ${salida.universo.nuevasSinDuplicados}`,
);
console.log(`  factor                    ×${salida.universo.factorSobreLoQueHoySeCompara}`);
if (sinCorpus.length) console.log(`  ⚠ sin HTML en el corpus   ${sinCorpus.length}   ${sinCorpus.slice(0, 6).join(" · ")}`);
console.log(`\n  ── por canal, con su guarda y sus ceros ──`);
for (const [nombre, c] of Object.entries(canales)) {
  console.log(`  ${nombre.padEnd(10)} ${String(c.apariciones).padStart(6)} apariciones · ${String(c.distintas).padStart(5)} distintas` +
    `  ⇒ presentes ${String(c.presentes).padStart(4)} · FALTAN ${String(c.faltan).padStart(4)} · fuera de alcance ${String(c.fueraDeAlcance).padStart(4)}   [${c.guarda}]`);
  for (const [f, v] of Object.entries(c.porFamilia))
    console.log(
      `      ${f.padEnd(12)} distintas ${String(v.distintas).padStart(5)} · presentes ${String(v.presentes).padStart(4)} · faltan ${String(v.faltan).padStart(4)} · fuera ${String(v.fueraDeAlcance).padStart(4)}` +
        `   · en UNA serie ${String(v.enUnaSolaSerie).padStart(4)} · en varias ${String(v.enVariasSeries).padStart(4)}`,
    );
  console.log(`      ↳ RELACIÓN  en UNA sola serie ${c.porSerie.enUnaSolaSerie} · en varias ${c.porSerie.enVariasSeries}   (reparto por nº de series: ${JSON.stringify(c.porSerie.reparto)})`);
}
console.log(`\n  ── el reparto de lo que falta, que NO es una sola cosa ──`);
console.log(`  faltan en public       ${salida.campana.faltanEnPublico}`);
console.log(`    ya en media-corpus   ${reparto.enMediaCorpus.length}   ⇒ se COPIA (cms:coloca-media)`);
console.log(`    variante regenerable ${reparto.variantesConOrigenEnCorpus.length}   ⇒ se REGENERA con sharp (decisión medida: qa:media-regenera 73/73)`);
console.log(`    A PEDIR al original  ${reparto.aPedir.length}   ⇒ ${origenesACapturar.length} ORÍGENES distintos (las variantes se colapsan)`);
console.log(`  ⇒ sin red se resuelven ${sinRed} de ${salida.campana.faltanEnPublico}`);

console.log(`\n  ── lo que aportan LAS NUEVAS (no es lo mismo que el total) ──`);
for (const [n, v] of Object.entries(salida.aportacionDeLasNuevas))
  console.log(`  ${n.padEnd(10)} tocadas por ellas ${String(v.tocadasPorLasNuevas).padStart(5)} · EXCLUSIVAS suyas ${String(v.exclusivasDeLasNuevas).padStart(5)}`);

w("medidas/lh-canales.json", salida);

/* ── las guardas de la sonda ─────────────────────────────────────────────── */
let codigo = 0;

/* §sondas 4 · un patrón que no casa en NINGUNA página es un defecto. */
const muertos = Object.entries(casos).filter(([, n]) => n === 0);
if (muertos.length) {
  console.error(
    `\n❌ PATRÓN MUERTO: ${muertos.map(([k]) => k).join(", ")} no casó en ninguna de las ${conContenido.length} páginas.\n` +
      `   Un selector que no casa con nada NO es un cero: es un defecto (§sondas 4).`,
  );
  codigo = 2;
}
/* §sondas 4, 3.ª cara · y uno que casa DE MÁS tampoco da error: da un número
 * plausible de más. El tope es por página y sale del orden de magnitud medido. */
const TOPE_POR_PAGINA = { hoja: 60, imagen: 400, ogImage: 4 };
for (const [k, n] of Object.entries(casos)) {
  const max = TOPE_POR_PAGINA[k] * conContenido.length;
  if (n > max) {
    console.error(`\n❌ PATRÓN UBICUO: '${k}' casó ${n} veces, por encima del tope declarado (${max}).`);
    codigo = 2;
  }
}
if (sinCorpus.length) {
  console.error(
    `\n❌ ${sinCorpus.length} página(s) del universo SIN HTML en el corpus.\n` +
      `   El inventario de sus canales no existe — y su ausencia se leería como «no tienen».`,
  );
  codigo = 2;
}

const canalesConHueco = Object.entries(canales).filter(([, c]) => c.faltan > 0);
if (canalesConHueco.length) {
  console.log(
    `\n⛔ HUECO DECLARADO — ${canalesConHueco.map(([k, c]) => `${k}: ${c.faltan}`).join(" · ")}` +
      `   ⇒ ${origenesACapturar.length} orígenes A PEDIR · ${sinRed} sin red\n` +
      `   Es el trabajo de la campaña de captura, no un fallo de esta sonda.\n` +
      `   ⚠ Y capturar NO es colocar: \`cms:coloca-media\` después (§la regla, al pie).`,
  );
} else console.log(`\n✅ 0 huecos: los ${Object.values(canales).reduce((a, c) => a + c.distintas, 0)} canales distintos están presentes en su guarda.`);

ev.informe();
process.exit(codigo);
