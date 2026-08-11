/**
 * COMPORTAMIENTO — el eje que lleva 0/31, y la guarda que este eje necesita y
 * ninguno de los otros: el CONTROL POSITIVO DE DISPARO.
 *
 * Uso:  npm run qa:comportamiento -- [ancho]
 *       UNIVERSO=listados|emitidas|ambos   (por defecto: ambos)
 *       SOLO=<trozo de clave>              acota (para probar guardas sin 47 cargas)
 *       TODAS=1                            emitidas: las 37 rutas, no una por familia
 *       SABOTAJE=sin-disparo|diana-falsa|tapado|sin-espera   → test en negativo
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ── POR QUÉ ESTA SONDA NO SE PARECE A NINGUNA OTRA DEL REPO ───────────────
 *
 * Las demás miden PROPIEDADES de una salida quieta: un alto, un ancho, un
 * `href`. Ésta mide **lo que pasa cuando algo ocurre**, y eso trae una forma de
 * falso verde que las otras no tienen:
 *
 *   > **Una interacción que NO SE DISPARA da exactamente la misma lectura que
 *   > una que se dispara y no tiene efecto.** Las dos escriben «0 cambios».
 *
 * Es el `switch` sin `default` de F3-1 con otro disfraz (`CLAUDE.md` §sondas,
 * regla 6bis): no falla, no pinta, no avisa. Y aquí sería peor, porque el eje
 * entero saldría verde midiendo **nada** — que es exactamente cómo lleva 0/31
 * sin que nadie lo notara.
 *
 * ── LA GUARDA: TRES SALIDAS, NO DOS ───────────────────────────────────────
 *
 * Cada interacción lleva un **control positivo**: una evidencia de que el
 * disparo OCURRIÓ, **independiente del efecto que se mide**. Con él, el
 * veredicto tiene tres valores y no dos, y la diferencia es el punto entero:
 *
 * | veredicto | qué significa | ¿cuenta como unidad evaluada? |
 * |---|---|---|
 * | `EFECTO` | disparó y algo cambió | **sí** |
 * | `SIN EFECTO` | disparó y no cambió nada — **es una medida** | **sí** |
 * | `NO APLICA` | la precondición no está (no hay imagen bajo el pliegue, no pagina) — **con su número** | **sí** |
 * | `NO SE DISPARÓ` | la precondición estaba y el disparo no llegó | **NO** → `Evaluadas` pone la corrida en rojo |
 *
 * `NO APLICA` y `NO SE DISPARÓ` son los dos que un informe perezoso funde en
 * «no pasó nada», y son opuestos: el primero es un hecho del sitio, el segundo
 * es un fallo del instrumento. Se separan **por construcción**, y el segundo se
 * cobra por el contrato de `Evaluadas` (`lib.mjs`) — o sea que no depende de que
 * nadie mire la salida.
 *
 * ── LOS CONTROLES, UNO POR TIPO ───────────────────────────────────────────
 *
 * | tipo | disparo | CONTROL POSITIVO (independiente del efecto) |
 * |---|---|---|
 * | `hover` | `mouse.move` al centro de la diana | (a) `elementFromPoint` devuelve la diana **antes** de mover (nadie la tapa); (b) llegó un `pointerover`/`mouseover` **`isTrusted`** cuyo `target` cuelga de la diana; (c) `diana.matches(":hover")` |
 * | `click` | `mouse.click` | (a) el mismo `elementFromPoint`; (b) llegó un `click` `isTrusted` en la diana, **por el canal de CONSOLA** — que sobrevive a la navegación, que es justo lo que este disparo provoca |
 * | `scroll` | `window.scrollTo` | `scrollY` pasó de 0 a >0 **y** se contaron eventos `scroll` **y** una imagen que estaba bajo el pliegue entró en el viewport |
 * | `tiempo` | esperar N ms | un `setTimeout` **de la página** puso su marca **y** `performance.now()` avanzó ≥ 0.9·N — o sea: la cola de temporizadores de la página corrió, no estaba congelada |
 * | `carga` | volver a pedir la URL | las respuestas traen cabeceras `date` **distintas** (el origen contestó de nuevo; no es una copia de caché) |
 *
 * El de `click` es el que más costó: el efecto que se mide **es** una
 * navegación, así que `window.__disp` muere justo cuando habría que leerlo. El
 * control viaja por `console.log`, que puppeteer recoge en el lado de Node y no
 * se lo lleva la navegación. Un control que muere con el efecto no es un
 * control.
 *
 * ── LOS DOS UNIVERSOS, Y POR QUÉ SON DOS ──────────────────────────────────
 *
 *   · `listados` — las 9 formas de LH-2 (`P-LH-C6`, precondición de LISTADO-B).
 *     El clon **no las emite**, así que su lado se mide igual y se registra lo
 *     que devuelve: «404» es una medida de dos lados, «no lo miré» no.
 *   · `emitidas` — las rutas del `prerender-manifest`, **los dos lados de
 *     verdad**. Es lo que mueve la celda `comportamiento` de la matriz de
 *     cobertura, y por eso el recuento se declara en su unidad: la
 *     INTERACCIÓN, no la ruta (§El NIVEL al que se mide, séptimo contenedor).
 *
 * ── LO QUE ESTA SONDA NO MIDE, DICHO AQUÍ ─────────────────────────────────
 *
 *   · **`hover` a 390 no está en el catálogo**, y no por pereza: bajo emulación
 *     táctil el `:hover` no es la misma interacción, así que medirlo ahí no es
 *     «lo mismo más estrecho» — es otra pregunta. El catálogo se declara **por
 *     ancho** y a 390 no lo incluye;
 *   · el suelo de ruido de estas rutas en este eje **no existe**: nadie ha hecho
 *     campaña. Un «SIN EFECTO» aislado es *SIN PROBAR*, no *limpio*.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  Censo, Evaluadas, QA, enApp, env, gritaSiRevienta, hoy, iniciarClon, launch, openPage, w,
} from "./lib.mjs";

const ORIGEN = "https://kunakair.com";
const ANCHO = Number(process.argv[2] || 1440);
const MOVIL = ANCHO <= 500;
const UNIVERSO = env("UNIVERSO", "ambos");
const SOLO = env("SOLO");
const TODAS = !!env("TODAS");
/* ── AFOR · medir OTRA ZONA de la misma afordancia ─────────────────────────
 * El hover de una tarjeta **no es uno**: depende de dónde caiga el puntero.
 * Medido en dos corridas de esta misma sonda sobre `L1-blog`: con el punto en
 * la imagen sale `transform: scale(1.1)` sobre el `<img>`; con el punto en la
 * meta sale el color del enlace de categoría **y la imagen no se mueve**. Las
 * dos son ciertas y ninguna es «el hover de la tarjeta».
 *
 * Así que la zona se declara. `AFOR=<selector>` cambia la afordancia de los
 * listados y **exige `ETIQUETA=<nombre>`**: sin ella la corrida escribiría en
 * el nombre canónico y una medida de otra zona pasaría por la de la tarjeta —
 * que es la regla 7 (*un artefacto que no es la medida canónica lo dice en el
 * nombre*) aplicada antes de que ocurra. */
const AFOR = env("AFOR");
const ETIQUETA = env("ETIQUETA");
if (AFOR && !ETIQUETA) {
  console.error(`\n❌ AFOR sin ETIQUETA: esta corrida mide OTRA zona y escribiría en el nombre\n   canónico. Pon ETIQUETA=<nombre> para que la congelada diga qué es.`);
  process.exit(2);
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Sabotajes del test en negativo ────────────────────────────────────────
 * Cada uno rompe UNA cosa distinta y tiene que caer **por su propio
 * invariante** (`CLAUDE.md` §sondas, corolario de la regla 3): si dos cayeran
 * por el mismo, el exit≠0 no diría cuál guarda saltó.
 *   sin-disparo → NO se ejecuta la acción, pero SÍ se mide  ⇒ «NO SE DISPARÓ»
 *   diana-falsa → el selector de diana no casa con nada     ⇒ selector MUERTO (Censo)
 *   tapado      → una capa cubre la diana                    ⇒ pre-control «TAPADA»
 *   sin-espera  → al tipo `tiempo` no se le da el tiempo     ⇒ reloj de la página sin marca
 * ------------------------------------------------------------------------ */
const SABOTAJE = env("SABOTAJE", "");
const SABOTAJES = ["sin-disparo", "diana-falsa", "tapado", "sin-espera"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) {
  console.error(`\n❌ SABOTAJE=${SABOTAJE} no existe. Los que hay: ${SABOTAJES.join(" · ")}`);
  process.exit(2);
}
const SAB = Object.fromEntries(SABOTAJES.map((s) => [s, SABOTAJE === s]));

gritaSiRevienta();

/* ══════════════════════════════════════════════════════════════════════════
 * EL CATÁLOGO — declarado por ANCHO, y de ahí sale el mínimo
 *
 * `Evaluadas` exige derivar el mínimo en vez de escribirlo. Aquí se deriva del
 * PLAN: cada (página × lado × interacción aplicable) es una unidad, y el plan se
 * calcula **antes** de medir. Consecuencia buscada: una página que no carga, o
 * una interacción que no se dispara, dejan el contador corto y el gancho de
 * salida cierra el código. No hay que acordarse de nada.
 * ═════════════════════════════════════════════════════════════════════════ */
const CATALOGO = [
  { tipo: "inventario", que: "afordancias servidas", anchos: [1440, 390] },
  { tipo: "scroll", que: "lazy de imagen", anchos: [1440, 390] },
  { tipo: "tiempo", que: "cambio espontáneo", anchos: [1440, 390] },
  { tipo: "hover", que: "afordancia", anchos: [1440] },
  { tipo: "filtro", que: "control de filtro", anchos: [1440, 390], soloListados: true },
  { tipo: "click", que: "paginación", anchos: [1440, 390], soloListados: true },
  { tipo: "carga", que: "orden entre cargas", anchos: [1440], soloListados: true },
];
const enCatalogo = (tipo) => CATALOGO.find((c) => c.tipo === tipo && c.anchos.includes(ANCHO));

/** Cuántas afordancias se hoverean por página. Listados: las 2 primeras tarjetas. */
const K_HOVER = { listados: 2, emitidas: 4 };
/** Cuánto se espera al tipo `tiempo`. */
const MS_TIEMPO = 3000;
/** Cuántas veces se pide la misma URL para el tipo `carga`. */
const N_CARGAS = 10;

/* ── Propiedades cuyo cambio cuenta como «efecto» de un hover ──────────────
 * Declaradas, no «todas» — pero **con sus anchuras**, y eso no es cosmético.
 *
 * ⚠ La primera versión leía `borderTopColor` sin `borderTopWidth`, y la corrida
 * completa contó **88 cambios de color de borde en el original**. Un color de
 * borde con anchura **0 no pinta nada**: eso habría publicado 88 «efectos»
 * invisibles y, peor, habría hecho parecer que el original reacciona donde no
 * reacciona. Es la regla del NIVEL otra vez, en su forma más barata: *se mide
 * la propiedad que se ve, no la que está a mano.*
 *
 * Y el borde de ABAJO entra porque es donde Divi pinta el subrayado de enlace;
 * `text-decoration` entra porque es donde lo pinta el clon. Sin los dos, la
 * comparación de los dos lados no puede adjudicar si el mecanismo distinto da
 * el mismo píxel. */
const PROPS = [
  "transform", "opacity", "boxShadow", "backgroundColor", "color", "filter", "scale", "translate",
  "borderTopColor", "borderTopWidth",
  "borderBottomColor", "borderBottomWidth", "borderBottomStyle",
  "textDecorationLine", "textDecorationColor", "textDecorationThickness",
];

/** Cambios de color de borde sin anchura: se registran, pero NO cuentan como efecto. */
const NO_PINTA = [
  { prop: "borderTopColor", ancho: "borderTopWidth" },
  { prop: "borderBottomColor", ancho: "borderBottomWidth" },
  { prop: "textDecorationColor", ancho: "textDecorationLine" },
  { prop: "textDecorationThickness", ancho: "textDecorationLine" },
];

/* ══════════════════════════════════════════════════════════════════════════
 * LA INSTRUMENTACIÓN — se inyecta en la página antes de cada disparo
 *
 * Dos canales a propósito:
 *   · `window.__disp` — barato y completo, pero **muere con la navegación**;
 *   · `console.log("__DISP…")` — sólo para el click, porque es el único disparo
 *     cuyo efecto normal es destruir el contexto donde vive el otro canal.
 *
 * Y dos fases del click, que contestan dos preguntas distintas:
 *   · CAPTURA (`true`)  → «¿llegó el evento?»  ← el control positivo
 *   · BURBUJA en `window` (el último) → «¿alguien lo interceptó?»
 *     (`defaultPrevented`). Si nadie llama a `preventDefault`, la navegación la
 *     hace el enlace; si alguien lo llama, es AJAX. Y si la burbuja **no llega**,
 *     es que alguien paró la propagación — que también es información.
 * ═════════════════════════════════════════════════════════════════════════ */
function INSTRUMENTA() {
  if (window.__disp) return "ya";
  const enDiana = (t) => !!(t instanceof Element && t.closest("[data-diana]"));
  window.__disp = { eventos: [], scrolls: 0, reloj: null, t0: 0, mut: [], ultimoClick: null };
  const anota = (t) => (e) => {
    if (window.__disp.eventos.length > 500) return;
    const r = { t, trusted: !!e.isTrusted, enDiana: enDiana(e.target), x: e.clientX ?? null, y: e.clientY ?? null };
    window.__disp.eventos.push(r);
    // Sólo el click viaja por consola: es el único cuyo efecto mata el otro canal.
    if (t === "click") console.log("__DISP_CLICK__" + JSON.stringify(r));
  };
  for (const t of ["pointerover", "mouseover", "pointerdown", "mousedown", "click"])
    document.addEventListener(t, anota(t), true);
  window.addEventListener("scroll", () => { window.__disp.scrolls++; }, true);
  window.addEventListener("click", (e) => {
    const r = { prevenido: e.defaultPrevented, enDiana: enDiana(e.target) };
    window.__disp.ultimoClick = r;
    console.log("__DISP_FIN__" + JSON.stringify(r));
  }, false);
  return "puesta";
}

/* ── Marcar la diana, y el PRE-CONTROL de que nadie la tapa ────────────────
 * `elementFromPoint` en el punto al que se va a mover el ratón. Si lo que hay
 * encima no cuelga de la diana, el disparo iría a otro sitio — y el efecto
 * saldría «0 cambios» con toda la razón y ninguna verdad. */
function MARCA({ sel, idx, nombre, tapar }) {
  document.querySelectorAll("[data-diana]").forEach((e) => e.removeAttribute("data-diana"));
  document.querySelectorAll("[data-tapadera]").forEach((e) => e.remove());
  const els = window.__qa ? window.__qa(sel) : [...document.querySelectorAll(sel)];
  const el = els[idx];
  if (!el) return null;
  el.setAttribute("data-diana", nombre);
  el.scrollIntoView({ block: "center", behavior: "instant" });
  if (tapar) {
    const capa = document.createElement("div");
    capa.setAttribute("data-tapadera", "1");
    capa.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:transparent";
    document.body.appendChild(capa);
  }
  const c = el.getBoundingClientRect();
  if (c.width === 0 || c.height === 0) return { invisible: true, w: c.width, h: c.height };
  const x = Math.round(c.x + c.width / 2);
  const y = Math.round(c.y + Math.min(c.height / 2, 40));
  const encima = document.elementFromPoint(x, y);
  return {
    x, y,
    w: Math.round(c.width * 100) / 100,
    h: Math.round(c.height * 100) / 100,
    tapada: !(encima && encima.closest("[data-diana]")),
    encima: encima ? `${encima.tagName.toLowerCase()}.${String(encima.className || "").split(/\s+/)[0]}`.slice(0, 48) : null,
    href: el.getAttribute("href") || el.querySelector("a")?.getAttribute("href") || null,
    texto: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 46),
  };
}

/* ── APUNTAR ES OTRO PASO QUE MARCAR, y lo enseñó el control ───────────────
 * `MARCA` hace `scrollIntoView` y devuelve el punto **en ese instante**. En el
 * original eso no vale: Divi anima la entrada de los módulos al scrollear
 * (`et-waypoint`), así que entre marcar y disparar **la diana se mueve**, el
 * ratón cae en otro sitio y el efecto sale «0 cambios».
 *
 * Lo cazó el control positivo en la primera corrida de `/monitor-calidad-aire`
 * —`eventoOverEnDiana:false` con `tapada:false`—, que es exactamente el caso que
 * esta sonda existe para que no se lea como «este elemento no reacciona».
 * El arreglo no es reintentar a ciegas: es **volver a apuntar cuando la
 * maquetación ha parado**, y contar los reintentos en el propio control. */
/* ⚠ **Y el punto no se calcula: se BUSCA.** La primera versión apuntaba al
 * centro del `getBoundingClientRect()`, y la corrida completa dejó **3 dianas
 * `tapada:true`** que no eran ni un fallo del sitio ni una capa intrusa:
 *
 *   · la **cabecera fija** de Divi se come el punto cuando la tarjeta es más
 *     alta que el viewport (`div.fila-menu-principal-contenido`);
 *   · un `<a>` **en línea** que envuelve dos renglones tiene una caja de borde
 *     que cubre el hueco entre ellos, y el centro cae **en el `<p>`**, no en el
 *     enlace. Es la misma trampa que ya está escrita para contar renglones:
 *     *la caja de borde de un contenido en línea no es donde está el contenido*
 *     — se usan `getClientRects()`, que son los renglones de verdad.
 *
 * Así que se generan candidatos —un muestreo dentro de **cada renglón**— y se
 * queda con el primero que `elementFromPoint` confirma que **pertenece a la
 * diana**. Eso no es «reintentar hasta que salga verde»: hoverear un elemento
 * ES poner el puntero en un píxel suyo, y el criterio de aceptación es
 * exactamente ése. Si ningún píxel suyo es alcanzable, el elemento **no se
 * puede hoverear** y el veredicto honesto sigue siendo NO SE DISPARÓ. */
function PUNTO() {
  const el = document.querySelector("[data-diana]");
  if (!el) return null;
  let caja = el.getBoundingClientRect();
  if (caja.width === 0 || caja.height === 0) return { invisible: true, w: caja.width, h: caja.height };
  if (caja.y < 0 || caja.y > window.innerHeight - 8) {
    el.scrollIntoView({ block: "center", behavior: "instant" });
    caja = el.getBoundingClientRect();
  }
  const rects = [...el.getClientRects()];
  if (!rects.length) rects.push(caja);
  const cands = [];
  for (const r of rects) {
    if (r.width < 2 || r.height < 2) continue;
    for (const fy of [0.5, 0.25, 0.75, 0.12, 0.88])
      for (const fx of [0.5, 0.25, 0.75])
        cands.push({ x: Math.round(r.x + r.width * fx), y: Math.round(r.y + r.height * fy) });
  }
  let ultimo = null;
  for (const [n, c] of cands.entries()) {
    if (c.y < 2 || c.y > window.innerHeight - 2 || c.x < 2 || c.x > window.innerWidth - 2) continue;
    const encima = document.elementFromPoint(c.x, c.y);
    ultimo = {
      x: c.x, y: c.y,
      tapada: !(encima && encima.closest("[data-diana]")),
      encima: encima ? `${encima.tagName.toLowerCase()}.${String(encima.className || "").split(/\s+/)[0]}`.slice(0, 48) : null,
      candidato: n, deCuantos: cands.length, renglones: rects.length,
    };
    if (!ultimo.tapada) return ultimo;
  }
  return ultimo || { fueraDelViewport: Math.round(caja.y), renglones: rects.length };
}

/**
 * Estilos de la diana **y de todos sus descendientes** (hasta un tope).
 *
 * ⚠ La primera versión leía tres descendientes DECLARADOS —`a`, `img`,
 * `h2/h3/h4`— y con eso la tarjeta de `L3-sci` salía «SIN EFECTO»: su imagen no
 * es un `<img>` sino un `<span class="scientific-imagen">` con
 * `background-image`, o sea justo el descendiente que la lista no nombraba. Un
 * conjunto escrito de memoria contesta «no cambia nada» sobre lo que no miró
 * (§sondas, regla 4 y su corolario: *el conjunto se deriva censando lo que
 * aparece*). Aquí se recorre el subárbol y el tope se declara.
 */
function ESTILOS(props) {
  const d = document.querySelector("[data-diana]");
  if (!d) return null;
  const lee = (el) => {
    const s = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = s[p];
    const c = el.getBoundingClientRect();
    o.__caja = `${Math.round(c.width * 10) / 10}x${Math.round(c.height * 10) / 10}`;
    return o;
  };
  const TOPE = 40;
  const hijos = [...d.querySelectorAll("*")].slice(0, TOPE);
  const sub = {};
  hijos.forEach((e, n) => {
    sub[`${n}:${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(/\s+/)[0] : ""}`.slice(0, 40)] = lee(e);
  });
  return {
    diana: lee(d), sub, hover: d.matches(":hover"),
    nDescendientes: d.querySelectorAll("*").length, tope: TOPE,
  };
}

/**
 * Diferencias entre dos lecturas de `ESTILOS`, partidas en las que **pintan** y
 * las que no. Un color de borde que cambia con la anchura a `0px` en las dos
 * lecturas es un cambio real del computado y **cero píxeles en pantalla**: se
 * registra aparte para que se pueda auditar, y no cuenta como efecto.
 */
const difEstilos = (a, b) => {
  if (!a || !b) return null;
  const pintan = [];
  const invisibles = [];
  const cmp = (pre, x, y) => {
    for (const k of Object.keys(x)) {
      if (x[k] === y?.[k]) continue;
      const regla = NO_PINTA.find((n) => n.prop === k);
      const muerto = regla
        && (k === "textDecorationColor" || k === "textDecorationThickness"
          ? x[regla.ancho] === "none" && y?.[regla.ancho] === "none"
          : parseFloat(x[regla.ancho] || "0") === 0 && parseFloat(y?.[regla.ancho] || "0") === 0);
      (muerto ? invisibles : pintan).push(`${pre}${k}: ${x[k]} → ${y?.[k]}`);
    }
  };
  cmp("", a.diana, b.diana);
  for (const s of Object.keys(a.sub)) cmp(`${s} · `, a.sub[s], b.sub[s] || {});
  return { pintan, invisibles };
};

/* ══════════════════════════════════════════════════════════════════════════
 * QUÉ SE LEE DE CADA PÁGINA — y por qué la pregunta abierta se CENSA
 *
 * La pregunta «¿hay filtros o control de orden?» **no se contesta con un
 * selector nombrado**. `select[name=orderby]` que no case da cero, y un cero se
 * lee como «no hay» exactamente igual que si el selector estuviera mal escrito
 * (`CLAUDE.md` §sondas, regla 4). Aquí no hay ninguna instancia conocida contra
 * la que validar el selector, así que ese cero no sería auditable.
 *
 * Se contesta al revés: se **enumeran** los controles de formulario que
 * aparecen —con su `tag`, `type` y `name`— y la respuesta se lee de la
 * enumeración. Es el corolario que ya está escrito: *el conjunto que un
 * selector discrimina se deriva censando lo que aparece, no se escribe de
 * memoria.*
 * ═════════════════════════════════════════════════════════════════════════ */
function INVENTARIO({ raiz, selTarjeta, selAfor }) {
  const R = (n) => Math.round(n * 100) / 100;
  const root = window.__q(raiz);
  if (!root) return { sinRaiz: true };
  const vis = (e) => {
    const c = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return c.width > 0 && c.height > 0 && s.visibility !== "hidden";
  };
  const tarjetas = window.__qa(selTarjeta);
  const afor = window.__qa(selAfor);
  const imgs = [...root.querySelectorAll("img")];
  const controles = [...root.querySelectorAll("form, select, input, button, [role='tab'], [aria-controls]")].map((e) => ({
    tag: e.tagName.toLowerCase(),
    type: e.getAttribute("type") || e.getAttribute("role") || null,
    name: e.getAttribute("name") || e.getAttribute("aria-label") || null,
  }));
  return {
    tarjetas: tarjetas.length,
    afordancias: afor.length,
    afordanciasVisibles: afor.filter(vis).length,
    imagenes: {
      total: imgs.length,
      lazy: imgs.filter((i) => i.getAttribute("loading") === "lazy").length,
      eager: imgs.filter((i) => i.getAttribute("loading") === "eager").length,
      sinAtributo: imgs.filter((i) => !i.getAttribute("loading")).length,
      conDataSrc: imgs.filter((i) => i.dataset.src || i.dataset.lazySrc).length,
    },
    /* Estado PRISTINO: sin `settle`, sin scroll. Es la única lectura en la que
     * `complete:false` significa «perezosa y todavía no pedida»; después de un
     * pase de scroll ya no significa nada.
     *
     * ⚠ **Y su ámbito es EL DOCUMENTO, no la raíz** — a diferencia de
     * `imagenes`, que inventaría el contenido principal. La primera versión
     * leía `pristino` de la raíz y la relectura de después del scroll del
     * documento entero, y luego las emparejaba **por índice**: dos listas de
     * distinto largo comparadas posición a posición. Salía «30 imágenes
     * cargadas tras el scroll» en una página cuya raíz tiene **8**, o sea un
     * número plausible de más — la tercera cara de la regla 4 (§sondas): *un
     * detector que encuentra MÁS de lo que hay tampoco da error*. La carga
     * diferida es propiedad de la PÁGINA (pie y cabecera incluidos), así que el
     * ámbito correcto es el documento en los dos lados de la comparación. */
    pristino: [...document.querySelectorAll("img")].map((i) => {
      const c = i.getBoundingClientRect();
      return {
        top: R(c.y + window.scrollY),
        bajoElPliegue: c.y >= window.innerHeight,
        cargada: i.complete && i.naturalWidth > 0,
        loading: i.getAttribute("loading"),
        /* La pregunta de `P-LH-C6` es sobre la imagen DE TARJETA, no sobre las
         * del pie. Sin esta marca, «16 imágenes se pidieron al scrollear» en un
         * listado con 9 tarjetas está contando el pie y contestando otra cosa. */
        enTarjeta: !!i.closest(selTarjeta),
        src: (i.currentSrc || i.src || "").split("/").pop()?.slice(0, 48) || null,
      };
    }),
    marcadores: {
      slider: root.querySelectorAll(".et_pb_slider, .swiper, .swiper-container, [class*='swiper']").length,
      acordeon: root.querySelectorAll(".et_pb_toggle, details, .et_pb_accordion_item").length,
      pestanas: root.querySelectorAll(".et_pb_tabs, [role='tablist'], .lista-contenido-ul").length,
      video: root.querySelectorAll("video, iframe[src*='youtu'], iframe[src*='vimeo']").length,
    },
    controles,
    /* Los controles de FILTRO se derivan de la enumeración, no de un nombre
     * inventado: `[data-filter]` es lo que apareció al censar los `button` que
     * el inventario ya contaba en `casos-de-exito` (12 de 12). */
    filtros: [...root.querySelectorAll("[data-filter]")].map((e) => ({
      valor: e.getAttribute("data-filter"),
      texto: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30),
      activo: /is-checked|is-active|current/.test(String(e.className || "")),
    })),
    alto: R(document.body.scrollHeight),
    viewport: window.innerHeight,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL UNIVERSO — derivado de congeladas y del build, nunca escrito a mano
 * ═════════════════════════════════════════════════════════════════════════ */
const leeJson = (f) => JSON.parse(readFileSync(join(QA, f), "utf8"));

const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const RUTAS_EMITIDAS = Object.keys(manifiesto.routes || {}).filter((r) => !r.startsWith("/_") && !r.includes("."));
const FAMILIA_DE = (r) => manifiesto.routes[r]?.srcRoute || r;

/** `/es/blog/` → `/blog`. La correspondencia del clon es mecánica (§c-cmp). */
const clonDe = (rutaEs) => {
  const r = rutaEs.replace(/^\/es/, "").replace(/\/$/, "");
  return r === "" ? "/" : r;
};

/** Las 9 formas salen de la congelada de `lh-tarjetas`; la paginación, de `lh-paginas`. */
function universoListados() {
  const tarjetas = leeJson("medidas/lh-tarjetas.json");
  const paginas = leeJson("medidas/lh-paginas.json");
  return Object.entries(tarjetas.paginas)
    .filter(([, v]) => !v.error)
    .map(([ruta, v]) => {
      const clon = clonDe(ruta);
      const p = paginas.paginas[ruta] || {};
      return {
        clave: v.forma,
        universo: "listados",
        forma: v.forma,
        orig: ORIGEN + ruta,
        rutaEs: ruta,
        clon,
        clonEmitida: RUTAS_EMITIDAS.includes(clon),
        pagina: p.paginaDeVerdad === true,
        nPaginas: p.paginas ?? 1,
        nTarjetasCongeladas: v.nTarjetas ?? null,
      };
    });
}

/** Una ruta por FAMILIA del manifiesto (o las 37 con `TODAS=1`). */
function universoEmitidas() {
  const porFamilia = new Map();
  for (const r of RUTAS_EMITIDAS.sort()) {
    const f = FAMILIA_DE(r);
    if (!porFamilia.has(f)) porFamilia.set(f, []);
    porFamilia.get(f).push(r);
  }
  const elegidas = TODAS ? RUTAS_EMITIDAS.sort() : [...porFamilia.values()].map((rs) => rs[0]);
  return elegidas.map((r) => ({
    clave: r,
    universo: "emitidas",
    forma: FAMILIA_DE(r),
    orig: `${ORIGEN}/es${r === "/" ? "" : r}/`,
    rutaEs: `/es${r === "/" ? "" : r}/`,
    clon: r,
    clonEmitida: true,
    pagina: false,
  }));
}

let PAGINAS = [];
if (UNIVERSO === "listados" || UNIVERSO === "ambos") PAGINAS.push(...universoListados());
if (UNIVERSO === "emitidas" || UNIVERSO === "ambos") PAGINAS.push(...universoEmitidas());
if (SOLO) PAGINAS = PAGINAS.filter((P) => P.clave.includes(SOLO) || P.forma.includes(SOLO));
if (!PAGINAS.length) {
  console.error(`\n❌ el universo salió VACÍO (UNIVERSO=${UNIVERSO}${SOLO ? ` SOLO=${SOLO}` : ""}).\n   Cero páginas medidas darían un verde sin haber mirado: por eso esto tira.`);
  process.exit(2);
}

/* Las formas cuyo ORDEN se pide varias veces. Tres, y con razón: una por
 * régimen de consulta (archivo de CPT · archivo de taxonomía · plantilla PHP). */
const FORMAS_CARGA = new Set(["L1-blog", "L1-etiqueta", "L5-casos"]);

/* ── EL PLAN, y con él el MÍNIMO ───────────────────────────────────────────
 * Se calcula antes de medir para que el mínimo se DERIVE. Cada entrada es una
 * unidad; una que no se pueda evaluar deja el contador corto. */
const PLAN = [];
for (const P of PAGINAS) {
  const lados = [{ lado: "orig", url: P.orig }];
  lados.push({ lado: "clon", url: null }); // la URL del clon se resuelve al arrancarlo
  for (const L of lados) {
    if (L.lado === "clon" && !P.clonEmitida) {
      PLAN.push({ P, lado: "clon", tipo: "existencia", que: "¿la sirve el clon?" });
      continue;
    }
    if (enCatalogo("inventario")) PLAN.push({ P, lado: L.lado, tipo: "inventario", que: "afordancias servidas" });
    if (enCatalogo("scroll")) PLAN.push({ P, lado: L.lado, tipo: "scroll", que: "lazy de imagen" });
    if (enCatalogo("tiempo")) PLAN.push({ P, lado: L.lado, tipo: "tiempo", que: "cambio espontáneo" });
    if (enCatalogo("hover"))
      for (let k = 0; k < K_HOVER[P.universo]; k++)
        PLAN.push({ P, lado: L.lado, tipo: "hover", que: `afordancia #${k}`, idx: k });
    if (enCatalogo("filtro") && P.universo === "listados") PLAN.push({ P, lado: L.lado, tipo: "filtro", que: "control de filtro" });
    if (enCatalogo("click") && P.universo === "listados" && P.pagina && L.lado === "orig")
      PLAN.push({ P, lado: "orig", tipo: "click", que: "paginación → /page/2/" });
  }
  if (enCatalogo("carga") && FORMAS_CARGA.has(P.forma))
    PLAN.push({ P, lado: "orig", tipo: "carga", que: `orden en ${N_CARGAS} cargas` });
}

const ev = new Evaluadas({
  nombre: `comportamiento@${ANCHO}`,
  unidad: "interacciones con DISPARO CONFIRMADO",
  minimo: PLAN.length,
});

/* ══════════════════════════════════════════════════════════════════════════
 * SELECTORES — los que tienen que casar van por `Censo` (un muerto = error).
 * Los de la pregunta abierta (filtros/orden) NO: se enumeran, ver INVENTARIO.
 * ═════════════════════════════════════════════════════════════════════════ */
const RAIZ = { orig: "#main-content", clon: "main" };
const SEL = {
  listados: {
    tarjeta: "article:not(.type-page)",
    /** Las tres pieles de paginación medidas en el corpus congelado de F3-0. */
    afor: AFOR || "article:not(.type-page)",
    paginacion: [
      ".wp-pagenavi a[href*='/page/2/']",
      "nav.kunak-pagination a[href*='/page/2/']",
      "a.nextpostslink[href*='/page/2/']",
    ],
  },
  emitidas: {
    tarjeta: "article",
    afor: "a[href], button",
    paginacion: [],
  },
};
/** Con `diana-falsa` el selector de diana deja de casar: tiene que salir MUERTO. */
const selAfor = (P, lado) =>
  SAB["diana-falsa"]
    ? `${RAIZ[lado]} .NO-EXISTE-ESTA-CLASE`
    : P.universo === "listados"
      ? SEL.listados.afor
      : `${RAIZ[lado]} ${SEL.emitidas.afor.split(", ").join(`, ${RAIZ[lado]} `)}`;

const censo = new Censo();

/* ══════════════════════════════════════════════════════════════════════════
 * MEDIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const salida = {
  meta: {
    fecha: hoy(),
    ancho: ANCHO,
    viewport: `${ANCHO}x${MOVIL ? 844 : 900}${MOVIL ? " (device metrics, táctil)" : ""} · DPR 1`,
    universo: UNIVERSO,
    sabotaje: SABOTAJE || null,
    afordanciaListados: SEL.listados.afor,
    etiqueta: ETIQUETA || null,
    catalogo: CATALOGO.filter((c) => c.anchos.includes(ANCHO)).map((c) => `${c.tipo}·${c.que}`),
    fueraDelCatalogo: CATALOGO.filter((c) => !c.anchos.includes(ANCHO)).map((c) => `${c.tipo} (no a ${ANCHO})`),
    alcance: {
      paginas: PAGINAS.length,
      listados: PAGINAS.filter((P) => P.universo === "listados").map((P) => P.rutaEs),
      emitidas: PAGINAS.filter((P) => P.universo === "emitidas").map((P) => P.clon),
      unidadesPlanificadas: PLAN.length,
    },
    controles: {
      hover: "elementFromPoint + evento isTrusted en la diana + :hover",
      click: "elementFromPoint + click isTrusted por CANAL DE CONSOLA (sobrevive a la navegación)",
      scroll: "scrollY 0→>0 + eventos scroll + la imagen entra en viewport",
      tiempo: "setTimeout DE LA PÁGINA marcó + performance.now() avanzó ≥0.9·N",
      carga: "cabecera `date` distinta entre respuestas",
    },
  },
  interacciones: [],
  paginas: {},
};

let noDisparadas = 0;

/** Registra una interacción y aplica LA REGLA: sólo cuenta si disparó. */
function registra({ P, lado, tipo, que, aplica = true, motivoNoAplica = null, disparado, control, efecto, detalle }) {
  const veredicto = !aplica ? "NO APLICA" : !disparado ? "NO SE DISPARÓ" : efecto ? "EFECTO" : "SIN EFECTO";
  salida.interacciones.push({ clave: P.clave, forma: P.forma, universo: P.universo, lado, tipo, que, veredicto, motivoNoAplica, control, detalle });
  if (veredicto === "NO SE DISPARÓ") {
    noDisparadas++;
    ev.fallo(`${P.clave} · ${lado} · ${tipo} · ${que}`, JSON.stringify(control).slice(0, 110));
  } else {
    ev.ok();
  }
  return veredicto;
}

const marcaVer = { EFECTO: "◉", "SIN EFECTO": "○", "NO APLICA": "–", "NO SE DISPARÓ": "✗" };

/**
 * Una página, un lado: inventario pristino → scroll/lazy → tiempo → hover.
 * En ese orden y no en otro: el pristino sólo existe antes del primer scroll, y
 * `tiempo` se mide con la página **de vuelta arriba** porque un slider fuera de
 * pantalla puede pausarse (y entonces «no cambia nada» sería del viewport, no
 * del sitio).
 */
async function midePagina(browser, P, lado, url) {
  const { page, status } = await openPage(browser, url, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  const consola = [];
  page.on("console", (m) => { const t = m.text(); if (t.startsWith("__DISP_")) consola.push(t); });
  if (status >= 400 || status === 0) {
    await page.close();
    return { error: `HTTP ${status}` };
  }
  await page.evaluate(INSTRUMENTA);

  /* ── 1 · INVENTARIO (pristino) ── */
  const raiz = RAIZ[lado];
  const { datos: inv } = await censo.medir(page, INVENTARIO, {
    raiz,
    selTarjeta: P.universo === "listados" ? SEL.listados.tarjeta : SEL.emitidas.tarjeta,
    selAfor: selAfor(P, lado),
  });
  registra({
    P, lado, tipo: "inventario", que: "afordancias servidas",
    disparado: !inv.sinRaiz,
    control: { raiz, encontrada: !inv.sinRaiz },
    efecto: !inv.sinRaiz && (inv.afordancias > 0 || inv.tarjetas > 0),
    detalle: inv.sinRaiz ? { sinRaiz: raiz } : {
      tarjetas: inv.tarjetas, afordancias: inv.afordancias, imagenes: inv.imagenes,
      marcadores: inv.marcadores, controles: inv.controles, alto: inv.alto,
    },
  });
  if (inv.sinRaiz) { await page.close(); return { inv }; }

  /* ── 2 · SCROLL / LAZY ── */
  const bajoElPliegue = inv.pristino.filter((i) => i.bajoElPliegue);
  const sinCargar = bajoElPliegue.filter((i) => !i.cargada);
  const puedeScrollear = inv.alto > inv.viewport + 40;
  if (!puedeScrollear || !bajoElPliegue.length) {
    registra({
      P, lado, tipo: "scroll", que: "lazy de imagen",
      aplica: false,
      motivoNoAplica: !puedeScrollear
        ? `la página no scrollea (alto ${inv.alto} ≤ viewport ${inv.viewport})`
        : `0 imágenes bajo el pliegue (de ${inv.imagenes.total})`,
      disparado: false, control: { imagenesBajoElPliegue: bajoElPliegue.length, alto: inv.alto, viewport: inv.viewport },
      efecto: false, detalle: { imagenes: inv.imagenes },
    });
  } else {
    const antesY = await page.evaluate(() => window.scrollY);
    if (!SAB["sin-disparo"])
      await page.evaluate(async () => {
        window.__disp.scrolls = 0;
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 1400));
      });
    const tras = await page.evaluate((selTarjeta) => ({
      y: window.scrollY,
      scrolls: window.__disp.scrolls,
      imgs: [...document.querySelectorAll("img")].map((i) => ({
        cargada: i.complete && i.naturalWidth > 0,
        enTarjeta: !!i.closest(selTarjeta),
        enViewport: (() => { const c = i.getBoundingClientRect(); return c.bottom > 0 && c.top < window.innerHeight; })(),
        src: (i.currentSrc || i.src || "").split("/").pop()?.slice(0, 48) || null,
      })),
    }), P.universo === "listados" ? SEL.listados.tarjeta : SEL.emitidas.tarjeta);
    /* El emparejamiento es POR ÍNDICE y sólo vale si las dos listas son la
     * misma lista. Si el scroll añadió o quitó `<img>` —que sería un efecto de
     * pleno derecho— el índice deja de nombrar la misma imagen, así que se
     * dice y el efecto se calcula por RECUENTOS, que no dependen del orden. */
    const mismaLista = tras.imgs.length === inv.pristino.length;
    const entraron = mismaLista
      ? tras.imgs.filter((i, n) => i.enViewport && inv.pristino[n].bajoElPliegue).length
      : tras.imgs.filter((i) => i.enViewport).length;
    const control = {
      scrollY: `${antesY} → ${tras.y}`, eventosScroll: tras.scrolls, imagenesQueEntraron: entraron,
      imgAntes: inv.pristino.length, imgDespues: tras.imgs.length, mismaLista,
    };
    const disparado = tras.y > antesY && tras.scrolls > 0 && entraron > 0;
    const cargadasAntes = inv.pristino.filter((i) => i.cargada).length;
    const cargadasDespues = tras.imgs.filter((i) => i.cargada).length;
    const cargadasTras = mismaLista
      ? tras.imgs.filter((i, n) => i.cargada && !inv.pristino[n].cargada).length
      : cargadasDespues - cargadasAntes;
    registra({
      P, lado, tipo: "scroll", que: "lazy de imagen", disparado, control,
      efecto: cargadasTras > 0,
      detalle: {
        imagenesDelDocumento: inv.pristino.length,
        bajoElPliegue: bajoElPliegue.length,
        sinCargarAntes: sinCargar.length,
        cargadas: `${cargadasAntes} → ${cargadasDespues}`,
        cargadasTrasScroll: cargadasTras,
        atributoLazyEnLaRaiz: inv.imagenes.lazy,
        /* Lo que P-LH-C6 (c) pregunta de verdad: la imagen DE TARJETA. */
        tarjeta: (() => {
          const antesT = inv.pristino.filter((i) => i.enTarjeta);
          const desT = tras.imgs.filter((i) => i.enTarjeta);
          return {
            imagenes: antesT.length,
            conAtributoLazy: antesT.filter((i) => i.loading === "lazy").length,
            bajoElPliegue: antesT.filter((i) => i.bajoElPliegue).length,
            sinCargarAntes: antesT.filter((i) => !i.cargada).length,
            cargadasDespues: desT.filter((i) => i.cargada).length,
            difieren: desT.filter((i) => i.cargada).length - antesT.filter((i) => i.cargada).length,
          };
        })(),
        lectura: cargadasTras > 0
          ? `hay carga diferida (${cargadasTras} imágenes se pidieron al scrollear)`
          : "todas las imágenes ya estaban cargadas antes de scrollear",
      },
    });
    await page.evaluate(async () => { window.scrollTo({ top: 0, behavior: "instant" }); await new Promise((r) => setTimeout(r, 500)); });
  }

  /* ── 3 · TIEMPO ───────────────────────────────────────────────────────────
   * ⚠ **El observador mira `document.body` y el VEREDICTO mira la raíz.** No es
   * lo mismo, y la primera versión los confundió: sobre `body`, el listado del
   * blog dio **0 mutaciones en una corrida y 81 en la siguiente**, y las 81
   * eran `childList:BODY` — scripts de terceros colgándose del final del
   * documento (chat, analítica). O sea que «el sitio cambia solo» estaba
   * midiendo **que hay etiquetas de terceros**, que es un contenedor que
   * absorbe la pregunta entera (§El NIVEL al que se mide).
   *
   * Se observa `body` a propósito —para poder CONTAR lo de fuera y nombrarlo—
   * y se decide con lo de dentro de la raíz, que es lo que el clon tiene que
   * reproducir. Sin el desglose, el mismo número diría dos cosas distintas en
   * los dos lados: el original tiene terceros y el clon no. */
  await page.evaluate(({ ms, raiz }) => {
    window.__disp.mut = []; window.__disp.fuera = 0; window.__disp.reloj = null; window.__disp.t0 = performance.now();
    const enRaiz = (n) => {
      const el = n && n.nodeType === 1 ? n : n?.parentElement;
      return !!(el && el.closest && el.closest(raiz));
    };
    const o = new MutationObserver((rs) => {
      for (const r of rs) {
        if (!enRaiz(r.target)) { window.__disp.fuera++; continue; }
        if (window.__disp.mut.length > 400) continue;
        window.__disp.mut.push({ t: r.type, n: r.target.nodeName, a: r.attributeName || null, add: r.addedNodes.length, del: r.removedNodes.length });
      }
    });
    o.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "src", "srcset", "aria-hidden", "transform"] });
    window.__disp.obs = o;
    setTimeout(() => { window.__disp.reloj = performance.now(); }, ms);
  }, { ms: MS_TIEMPO, raiz });
  if (!SAB["sin-espera"]) await espera(MS_TIEMPO + 500);
  const t = await page.evaluate(() => {
    window.__disp.obs?.disconnect();
    return { mut: window.__disp.mut, fuera: window.__disp.fuera, reloj: window.__disp.reloj, t0: window.__disp.t0, ahora: performance.now() };
  });
  const transcurrido = Math.round(t.ahora - t.t0);
  const dispTiempo = t.reloj !== null && transcurrido >= MS_TIEMPO * 0.9;
  const porTipo = {};
  for (const m of t.mut) { const k = `${m.t}:${m.n}${m.a ? `[${m.a}]` : ""}`; porTipo[k] = (porTipo[k] || 0) + 1; }
  registra({
    P, lado, tipo: "tiempo", que: "cambio espontáneo",
    disparado: dispTiempo,
    control: { relojDeLaPagina: t.reloj !== null ? "marcó" : "NO marcó", transcurrido, pedido: MS_TIEMPO },
    efecto: t.mut.length > 0,
    detalle: {
      enElContenido: t.mut.length,
      fueraDeLaRaiz: t.fuera,
      porTipo: Object.fromEntries(Object.entries(porTipo).sort((a, b) => b[1] - a[1]).slice(0, 6)),
    },
  });

  /* ── 4 · HOVER ── */
  if (enCatalogo("hover")) {
    for (let k = 0; k < K_HOVER[P.universo]; k++) {
      const d = await page.evaluate(MARCA, { sel: selAfor(P, lado), idx: k, nombre: `h${k}`, tapar: SAB.tapado });
      if (!d || d.invisible) {
        registra({
          P, lado, tipo: "hover", que: `afordancia #${k}`,
          aplica: false, motivoNoAplica: d ? `la afordancia #${k} mide ${d.w}x${d.h}` : `no hay afordancia #${k} (hay ${inv.afordancias})`,
          disparado: false, control: { diana: d }, efecto: false, detalle: null,
        });
        continue;
      }
      await page.mouse.move(1, 1);
      /* Que la maquetación PARE antes de apuntar: las animaciones de entrada de
       * Divi corren justo después del `scrollIntoView` de `MARCA`. */
      await espera(600);
      const antes = await page.evaluate(ESTILOS, PROPS);
      let punto = null;
      let evs = [];
      let despues = null;
      let reintentos = 0;
      for (; reintentos < 2; reintentos++) {
        punto = (await page.evaluate(PUNTO)) || d;
        await page.evaluate(() => { window.__disp.eventos.length = 0; });
        if (!SAB["sin-disparo"] && punto.x !== undefined) await page.mouse.move(punto.x, punto.y);
        await espera(750);
        despues = await page.evaluate(ESTILOS, PROPS);
        evs = await page.evaluate(() => window.__disp.eventos.filter((e) => /over/.test(e.t)));
        if (SAB["sin-disparo"] || despues?.hover === true) break;
        await page.mouse.move(1, 1);
        await espera(250);
      }
      const llego = evs.some((e) => e.trusted && e.enDiana);
      const control = {
        tapada: punto?.tapada ?? d.tapada, encima: punto?.encima ?? d.encima,
        eventoOverEnDiana: llego, hoverCss: despues?.hover ?? null, eventos: evs.length,
        reintentos, ...(punto?.fueraDelViewport ? { fueraDelViewport: punto.y } : {}),
      };
      const dif = difEstilos(antes, despues) || { pintan: [], invisibles: [] };
      /* ⚠ El veredicto se lee de `control`, **no de la marca**. La primera
       * versión ponía `!d.tapada`, o sea la lectura del `getBoundingClientRect`
       * de `MARCA`, mientras el control publicaba la de `PUNTO` — que es la del
       * píxel al que de verdad fue el ratón. Resultado: una interacción con los
       * TRES controles en verde impresos (`tapada:false`,
       * `eventoOverEnDiana:true`, `hoverCss:true`) y veredicto «NO SE DISPARÓ».
       * Es la regla 1 de §sondas —*lo que imprime y lo que cuenta no pueden
       * discrepar*— rota dentro de la sonda escrita para cerrar esta familia. */
      registra({
        P, lado, tipo: "hover", que: `afordancia #${k}`,
        disparado: !control.tapada && llego && despues?.hover === true,
        control,
        efecto: dif.pintan.length > 0,
        detalle: {
          diana: { texto: d.texto, caja: `${d.w}x${d.h}`, href: d.href },
          cambios: dif.pintan.slice(0, 12),
          cambiosQueNoPintan: dif.invisibles.slice(0, 8),
        },
      });
      await page.mouse.move(1, 1);
    }
  }

  /* ── 5 · FILTRO ───────────────────────────────────────────────────────────
   * Es una interacción de CLICK que no navega, y **no estaba en el plan de esta
   * tanda**: apareció al enumerar los controles de formulario del inventario —
   * `casos-de-exito` sirve **12 `<button data-filter=".sector-*">`**—. Por eso
   * la pregunta «¿hay filtros?» se contesta censando y no con un selector
   * escrito de memoria: un `select[name=orderby]` habría dado cero y el cero se
   * habría leído como «no hay filtros en el sitio».
   *
   * Se planifica para TODOS los listados a propósito: los 8 que no lo tienen
   * salen `NO APLICA` **con su número**, que es la forma de que «no hay» sea una
   * medida y no un silencio. */
  if (enCatalogo("filtro") && P.universo === "listados") {
    const fs = inv.filtros || [];
    // El primero suele ser «ver todos»: se pulsa uno que acote de verdad.
    const idx = fs.findIndex((f) => f.valor && f.valor !== "*");
    if (idx < 0) {
      registra({
        P, lado, tipo: "filtro", que: "control de filtro",
        aplica: false, motivoNoAplica: `0 controles con \`data-filter\` (de ${inv.controles.length} controles de formulario en la raíz)`,
        disparado: false, control: { controles: inv.controles.length, filtros: fs.length }, efecto: false, detalle: null,
      });
    } else {
      const antes = await page.evaluate((s) => ({
        visibles: [...document.querySelectorAll(s)].filter((a) => a.getBoundingClientRect().height > 0).length,
        total: document.querySelectorAll(s).length,
        activo: document.querySelector("[data-filter].is-checked, [data-filter].is-active")?.getAttribute("data-filter") ?? null,
        url: location.href,
      }), SEL.listados.tarjeta);
      const d = await page.evaluate(MARCA, { sel: "[data-filter]", idx, nombre: "filtro", tapar: SAB.tapado });
      await espera(400);
      const punto = (await page.evaluate(PUNTO)) || d;
      await page.evaluate(() => { window.__disp.eventos.length = 0; });
      if (!SAB["sin-disparo"] && punto?.x !== undefined) await page.mouse.click(punto.x, punto.y);
      await espera(1200);
      const despues = await page.evaluate((s) => ({
        visibles: [...document.querySelectorAll(s)].filter((a) => a.getBoundingClientRect().height > 0).length,
        total: document.querySelectorAll(s).length,
        activo: document.querySelector("[data-filter].is-checked, [data-filter].is-active")?.getAttribute("data-filter") ?? null,
        url: location.href,
      }), SEL.listados.tarjeta);
      const evs = await page.evaluate(() => window.__disp.eventos.filter((e) => e.t === "click"));
      const llego = evs.some((e) => e.trusted && e.enDiana);
      registra({
        P, lado, tipo: "filtro", que: `pulsar «${fs[idx].texto}» (${fs[idx].valor})`,
        disparado: !punto?.tapada && llego,
        control: { tapada: punto?.tapada ?? null, encima: punto?.encima ?? null, clickIsTrustedEnDiana: llego, eventos: evs.length },
        efecto: antes.visibles !== despues.visibles || antes.activo !== despues.activo,
        detalle: {
          nFiltros: fs.length,
          valores: fs.map((f) => f.valor).slice(0, 14),
          tarjetasVisibles: `${antes.visibles} de ${antes.total} → ${despues.visibles} de ${despues.total}`,
          activo: `${antes.activo} → ${despues.activo}`,
          navegó: antes.url !== despues.url,
          mecanismo: antes.url !== despues.url
            ? "NAVEGACIÓN"
            : antes.visibles !== despues.visibles
              ? "FILTRO DE CLIENTE — oculta tarjetas sin recargar ni cambiar la URL"
              : "sin efecto",
        },
      });
    }
  }

  await page.close();
  return { inv, consola };
}

/**
 * El CLICK de paginación va en su propia carga: su efecto normal es navegar, y
 * después de navegar no queda página que medir. Por eso también su control va
 * por consola.
 */
async function mideClick(browser, P) {
  const { page, status } = await openPage(browser, P.orig, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  const consola = [];
  page.on("console", (m) => { const t = m.text(); if (t.startsWith("__DISP_")) consola.push(t); });
  if (status >= 400) { await page.close(); return registra({ P, lado: "orig", tipo: "click", que: "paginación → /page/2/", disparado: false, control: { http: status }, efecto: false, detalle: null }); }
  await page.evaluate(INSTRUMENTA);
  await page.evaluate(async () => { window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }); await new Promise((r) => setTimeout(r, 900)); });

  const sel = SAB["diana-falsa"] ? ".NO-EXISTE-ESTA-CLASE" : SEL.listados.paginacion.join(", ");
  const d = await page.evaluate(MARCA, { sel, idx: 0, nombre: "pag", tapar: SAB.tapado });
  if (!d || d.invisible) {
    await page.close();
    return registra({
      P, lado: "orig", tipo: "click", que: "paginación → /page/2/",
      aplica: false, motivoNoAplica: `no se encontró enlace a /page/2/ (la sonda dice que pagina: ${P.nPaginas} páginas)`,
      disparado: false, control: { diana: d }, efecto: false, detalle: null,
    });
  }
  const antesUrl = page.url();
  const antesTarjetas = await page.evaluate((s) => [...document.querySelectorAll(s)].slice(0, 4).map((a) => (a.querySelector("a")?.getAttribute("href") || "").slice(-52)), SEL.listados.tarjeta);

  let navego = false;
  const espNav = page.waitForNavigation({ timeout: 8000, waitUntil: "domcontentloaded" }).then(() => { navego = true; }).catch(() => {});
  if (!SAB["sin-disparo"]) await page.mouse.click(d.x, d.y);
  await Promise.race([espNav, espera(8200)]);
  await espera(600);

  /* El prefijo se corta por el `{`, no por una longitud contada a mano: un
   * `slice(15)` sobre un marcador de 14 caracteres deja el JSON roto, el
   * `catch` lo convierte en `false`, y el control diría «no disparó» con el
   * disparo hecho. Un desplazamiento literal es un número recordado (§regla 9). */
  const cuerpoDe = (l) => { try { return JSON.parse(l.slice(l.indexOf("{"))); } catch { return null; } };
  const clickEnDiana = consola.filter((l) => l.startsWith("__DISP_CLICK__")).map(cuerpoDe).some((r) => r && r.trusted && r.enDiana);
  const fin = consola.filter((l) => l.startsWith("__DISP_FIN__")).map(cuerpoDe).filter(Boolean).pop();
  const urlFinal = page.url();
  const tarjetasDespues = await page.evaluate((s) => [...document.querySelectorAll(s)].slice(0, 4).map((a) => (a.querySelector("a")?.getAttribute("href") || "").slice(-52)), SEL.listados.tarjeta).catch(() => []);
  const cambiaronTarjetas = JSON.stringify(antesTarjetas) !== JSON.stringify(tarjetasDespues);

  const mecanismo = navego || urlFinal !== antesUrl
    ? (fin && fin.prevenido ? "NAVEGÓ pero alguien llamó a preventDefault (revisar)" : "ENLACE REAL — navegación del navegador")
    : cambiaronTarjetas ? "AJAX — el DOM cambió sin navegar" : "sin efecto";

  const v = registra({
    P, lado: "orig", tipo: "click", que: "paginación → /page/2/",
    disparado: !d.tapada && clickEnDiana,
    control: { tapada: d.tapada, encima: d.encima, clickIsTrustedEnDiana: clickEnDiana, canal: "consola", burbujaLlego: !!fin },
    efecto: navego || urlFinal !== antesUrl || cambiaronTarjetas,
    detalle: {
      href: d.href, urlAntes: antesUrl, urlDespues: urlFinal,
      defaultPrevented: fin ? fin.prevenido : "la burbuja no llegó (alguien paró la propagación)",
      cambiaronTarjetas, mecanismo,
    },
  });
  await page.close();
  return v;
}

/**
 * EL ORDEN ENTRE CARGAS — por `fetch`, y a propósito.
 *
 * La pregunta es si el SERVIDOR devuelve las entradas en otro orden (es lo que
 * hace la HOME con «Artículos y Guías», P4). Eso vive en el HTML servido, así
 * que no hace falta navegador: 10 peticiones cuestan segundos y un navegador
 * costaría minutos. **Y su control positivo es propio**: si el `date` de las
 * respuestas no cambia, lo que se está midiendo es una caché, no el origen — y
 * entonces «el orden no cambia» no diría nada del sitio.
 *
 * ⚠ Lo que este método NO puede ver es un barajado hecho en el cliente. Por eso
 * el orden servido se compara además contra el orden RENDERIZADO que el
 * inventario ya leyó en el navegador: si coinciden, el orden es del servidor.
 */
async function mideCarga(P) {
  const cargas = [];
  for (let i = 0; i < N_CARGAS; i++) {
    try {
      const r = await fetch(P.orig, { cache: "no-store", headers: { "user-agent": "Mozilla/5.0 (qa kunak-web-clone)", "cache-control": "no-cache" } });
      const html = await r.text();
      const limpio = html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
      const arts = [...limpio.matchAll(/<article\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g)].filter(([, c]) => !/\btype-page\b/.test(c));
      const orden = arts.map(([, , cuerpo]) => (cuerpo.match(/href="([^"]+)"/) || [])[1] || "?").map((u) => u.split("/").filter(Boolean).pop());
      cargas.push({ status: r.status, date: r.headers.get("date"), cache: r.headers.get("cf-cache-status") || r.headers.get("x-cache") || null, age: r.headers.get("age"), n: orden.length, orden });
    } catch (e) {
      cargas.push({ status: 0, error: String(e).slice(0, 80) });
    }
    await espera(400);
  }
  const buenas = cargas.filter((c) => c.status === 200);
  const fechas = new Set(buenas.map((c) => c.date));
  const ordenes = new Set(buenas.map((c) => JSON.stringify(c.orden)));
  const disparado = buenas.length >= 2 && fechas.size >= 2;
  return registra({
    P, lado: "orig", tipo: "carga", que: `orden en ${N_CARGAS} cargas`,
    disparado,
    control: { respuestas200: buenas.length, fechasDistintas: fechas.size, cache: buenas[0]?.cache ?? null, age: buenas[0]?.age ?? null },
    efecto: ordenes.size > 1,
    detalle: {
      ordenesDistintos: ordenes.size,
      nEntradas: [...new Set(buenas.map((c) => c.n))],
      lectura: ordenes.size > 1
        ? "SORTEA: el servidor devuelve otro orden entre cargas"
        : `un solo orden en ${buenas.length} cargas — COTA al 95 %: < ${(300 / Math.max(buenas.length, 1)).toFixed(0)} % por carga (regla de tres). NO es «el orden es estable»`,
      primerOrden: buenas[0]?.orden?.slice(0, 6) ?? null,
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * CORRIDA
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ COMPORTAMIENTO · ${ANCHO}px · universo ${UNIVERSO}${SABOTAJE ? ` · SABOTAJE=${SABOTAJE}` : ""} ════════`);
console.log(`  catálogo a ${ANCHO}: ${salida.meta.catalogo.join(" · ")}`);
if (salida.meta.fueraDelCatalogo.length) console.log(`  fuera del catálogo: ${salida.meta.fueraDelCatalogo.join(" · ")}`);
console.log(`  plan: ${PLAN.length} interacciones en ${PAGINAS.length} páginas\n`);

const { base: BASE_CLON, parar } = await iniciarClon();
const { browser } = await launch();

for (const P of PAGINAS) {
  console.log(`\n  ── ${P.clave}${P.forma !== P.clave ? `  (${P.forma})` : ""}`);
  salida.paginas[P.clave] = { forma: P.forma, universo: P.universo, orig: P.orig, clon: P.clon, clonEmitida: P.clonEmitida, pagina: P.pagina };

  /* ── lado ORIGINAL ── */
  const rO = await midePagina(browser, P, "orig", P.orig);
  if (rO.error) ev.fallo(`${P.clave} · orig`, rO.error);

  /* ── lado CLON ── */
  if (!P.clonEmitida) {
    /* «El clon no la sirve» es una MEDIDA de dos lados, y se comprueba contra
     * lo servido: el manifiesto dice qué se emitió, el servidor dice qué se
     * sirve, y son dos afirmaciones (§F3-1: una ruta 200 no prueba contenido —
     * aquí, al revés, que no esté en el manifiesto no prueba el 404). */
    let http = 0;
    try { http = (await fetch(BASE_CLON + P.clon, { redirect: "manual" })).status; } catch { http = 0; }
    registra({
      P, lado: "clon", tipo: "existencia", que: "¿la sirve el clon?",
      disparado: http > 0,
      control: { peticion: BASE_CLON + P.clon, http },
      efecto: http === 200,
      detalle: { enElManifiesto: false, http, lectura: http === 200 ? "⚠ la sirve y NO está en el manifiesto" : `no construida (HTTP ${http})` },
    });
  } else {
    const rC = await midePagina(browser, P, "clon", BASE_CLON + P.clon);
    if (rC.error) ev.fallo(`${P.clave} · clon`, rC.error);
  }

  /* ── click de paginación (sólo original: el clon no tiene listados) ── */
  if (enCatalogo("click") && P.universo === "listados" && P.pagina) await mideClick(browser, P);
  /* ── orden entre cargas ── */
  if (enCatalogo("carga") && FORMAS_CARGA.has(P.forma)) await mideCarga(P);

  for (const i of salida.interacciones.filter((x) => x.clave === P.clave && !x.__pintada)) {
    i.__pintada = true;
    console.log(`     ${marcaVer[i.veredicto]} ${i.lado.padEnd(4)} ${i.tipo.padEnd(11)} ${i.veredicto.padEnd(14)} ${i.motivoNoAplica || resumeDetalle(i)}`);
  }
}

function resumeDetalle(i) {
  const d = i.detalle || {};
  if (i.tipo === "inventario") return `tarjetas ${d.tarjetas} · afordancias ${d.afordancias} · img ${d.imagenes?.total} (lazy ${d.imagenes?.lazy}) · slider ${d.marcadores?.slider} · controles ${d.controles?.length} · filtros ${d.filtros?.length ?? 0}`;
  if (i.tipo === "scroll") return `doc: ${d.cargadas} (bajo el pliegue ${d.bajoElPliegue}) · TARJETA: ${d.tarjeta?.imagenes} img, lazy ${d.tarjeta?.conAtributoLazy}, bajo el pliegue ${d.tarjeta?.bajoElPliegue}, sin cargar antes ${d.tarjeta?.sinCargarAntes}, Δ ${d.tarjeta?.difieren}`;
  if (i.tipo === "tiempo") return `${d.enElContenido} mutaciones EN EL CONTENIDO (+${d.fueraDeLaRaiz} fuera: terceros) ${JSON.stringify(d.porTipo || {}).slice(0, 80)}`;
  if (i.tipo === "hover") return `${(d.cambios || []).length} cambios${(d.cambiosQueNoPintan || []).length ? ` (+${d.cambiosQueNoPintan.length} que NO pintan)` : ""} ${(d.cambios || []).slice(0, 2).join(" | ").slice(0, 100)}`;
  if (i.tipo === "click") return `${d.mecanismo} · preventDefault=${d.defaultPrevented}`;
  if (i.tipo === "filtro") return `${d.mecanismo} · ${d.nFiltros} filtros · tarjetas ${d.tarjetasVisibles} · activo ${d.activo}`;
  if (i.tipo === "carga") return d.lectura;
  if (i.tipo === "existencia") return d.lectura;
  return "";
}

await browser.close();
await parar();

for (const i of salida.interacciones) delete i.__pintada;

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME — un solo canal de verdad: lo que imprime es lo que cuenta
 * ═════════════════════════════════════════════════════════════════════════ */
const porVeredicto = {};
for (const i of salida.interacciones) porVeredicto[i.veredicto] = (porVeredicto[i.veredicto] || 0) + 1;
salida.resumen = {
  planificadas: PLAN.length,
  registradas: salida.interacciones.length,
  porVeredicto,
  porTipo: Object.fromEntries(
    [...new Set(salida.interacciones.map((i) => i.tipo))].map((t) => [
      t,
      Object.fromEntries(Object.entries(
        salida.interacciones.filter((i) => i.tipo === t).reduce((a, i) => ({ ...a, [i.veredicto]: (a[i.veredicto] || 0) + 1 }), {}),
      )),
    ]),
  ),
};

console.log(`\n═══ RESUMEN · ${ANCHO}px`);
for (const [v, n] of Object.entries(porVeredicto)) console.log(`  ${marcaVer[v]} ${v.padEnd(15)} ${n}`);
console.log(`\n  por tipo:`);
for (const [t, r] of Object.entries(salida.resumen.porTipo)) console.log(`    ${t.padEnd(12)} ${JSON.stringify(r)}`);

const muertos = censo.informe(`· comportamiento@${ANCHO}`);

if (noDisparadas) {
  console.error(
    `\n❌ ${noDisparadas} interacción(es) NO SE DISPARARON, y su medida de efecto NO VALE.\n` +
      `   Esto NO es «no hay efecto»: es que el disparo no llegó, y las dos cosas\n` +
      `   escriben «0 cambios». Por eso no cuentan como unidad evaluada y la corrida\n` +
      `   sale roja por el contrato de \`Evaluadas\`, no por buena voluntad.\n`,
  );
}

w(`medidas/comportamiento-${ANCHO}${UNIVERSO === "ambos" ? "" : `-${UNIVERSO}`}${ETIQUETA ? `-${ETIQUETA}` : ""}.json`, salida);
ev.informe();
process.exitCode = (muertos || noDisparadas) ? 2 : 0;
