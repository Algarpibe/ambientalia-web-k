/**
 * HOVER ZONAL — QUÉ CONTENEDOR DISPARA EL ZOOM, leído del CSS SERVIDO.
 *
 * Uso:  npm run qa:hover-zonal
 *       SABOTAJE=sin-hojas|patron-falso|tope     → test en negativo
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LA PREGUNTA, Y POR QUÉ EL COMPORTAMIENTO SOLO NO PUEDE CONTESTARLA
 *
 * `PENDIENTES-QA.md` §LH-C6-HOVER-ZONAL la dejó abierta con estas palabras:
 * *«falta medir cuál es el contenedor que dispara el zoom, y eso es una medida,
 * no una idea»*. Lo que `qa:comportamiento` midió —y está congelado— es el
 * EFECTO y su ZONA:
 *
 *   · puntero en la imagen  → `img.attachment-large · transform: none → 1.1`
 *   · puntero en la meta    → `a.noticias · color: #666 → #0075C9`, **y la
 *     imagen no se mueve**
 *
 * Eso ya **excluye** `article` como disparador: si el `:hover` colgara de la
 * tarjeta, apuntar a la meta también ampliaría la imagen. Pero no separa las dos
 * hipótesis que quedan —`a.entry-featured-image-url:hover img` contra
 * `img:hover`—, y **no las separa por construcción**: las dos cajas coinciden en
 * pantalla, así que ningún píxel al que se pueda apuntar cae en una y no en la
 * otra. Más corridas de hover darían la misma respuesta más veces.
 *
 * > **El discriminador no está en el comportamiento: está SERVIDO.** Es la
 * > lección de F3-1 (`CLAUDE.md` §El principio): *«la salida servida incluye el
 * > CSS que el documento se trae»* — allí diez ejes de atributo y estructura
 * > dijeron «no hay discriminador» y el discriminador estaba en el `<style>`.
 *
 * ── Y AQUÍ HAY UNA VUELTA MÁS QUE EN F3-1 ─────────────────────────────────
 *
 * En `articulos-kb` el CSS de Divi venía **en línea**. En los listados **no**:
 * §F3-1-CSS-NO-CAPTURADO ya lo midió —*19 hojas externas, **0 capturadas***— así
 * que leer sólo los `<style>` del documento daría **cero reglas de zoom** y ese
 * cero se leería como *«no hay regla»* (§sondas, regla 4). Esta sonda **pide las
 * hojas externas**, que es un canal que ninguna otra sonda de este repo leía.
 *
 * ── LAS GUARDAS, Y CADA UNA CONTRA SU FALSO VERDE ─────────────────────────
 *
 * | guarda | de qué protege |
 * |---|---|
 * | patrón MUERTO (0 reglas en todas las páginas) | el cero que se lee como «no hay zoom» (§sondas 4) |
 * | patrón UBICUO (> `TOPE_UBICUO` de las reglas servidas) | el pleno: un filtro que casa con todo no discrimina nada (§sondas 4, complementario) |
 * | **EFECTO SIN REGLA** | el que de verdad importa: una forma con zoom **medido** y ninguna regla que lo explique. La sonda **no puede** salir verde diciendo «medido» de algo que no explicó |
 * | `Evaluadas` | el mínimo se deriva del universo congelado, no se escribe |
 *
 * La tercera es el cruce de instrumentos que `CLAUDE.md` §sondas 4 exige cuando
 * existe: *«otra medición del mismo objeto hecha con otro instrumento… cruzarlo
 * es obligatorio antes de creerse un recuento nuevo»*. Aquí el otro instrumento
 * es `comportamiento-1440.json`, congelado y commiteado, y **no se re-mide**: se
 * lee y se contrasta.
 *
 * ── LO QUE ESTA SONDA NO CONTESTA, DICHO AQUÍ ─────────────────────────────
 *
 *   · **sólo `transform`.** El hover de estas tarjetas cambia además colores
 *     (`a.noticias`, `div.scientific-imagen-container`); eso es otra pregunta y
 *     filtrarlo aquí traería miles de reglas `:hover{color}` del tema. El
 *     alcance va en `meta`, no en la cabeza de quien lea la salida;
 *   · **una regla servida no es una regla que gane.** Esto lee la cascada
 *     escrita, no la computada. Lo computado ya está medido al otro lado
 *     (`qa:comportamiento`), y por eso las dos mitades se cruzan en vez de
 *     sustituirse.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, env, gritaSiRevienta, hoy, w } from "./lib.mjs";
import { cssDe, reglas } from "./css-compilado.mjs";

const ORIGEN = "https://kunakair.com";

/* ── Sabotajes: cada uno tiene que caer por SU invariante ──────────────────
 *   sin-hojas    → a UNA forma no se le piden las hojas externas ⇒ EFECTO SIN REGLA
 *   patron-falso → se busca una propiedad que no existe        ⇒ patrón MUERTO
 *   tope         → el máximo del patrón a 0                    ⇒ patrón UBICUO
 *
 * ⚠ **Y `sin-hojas` sabotea UNA forma y no todas, por una razón que es la mitad
 * del test:** sin hojas en las nueve, el patrón se quedaría a cero y saltaría
 * *también* MUERTO — dos guardas por una causa, y el exit≠0 dejaría de decir
 * cuál. Quitándoselas a la primera forma con zoom medido, el patrón sigue vivo
 * en las otras ocho y el único que puede saltar es el cruce. Es el corolario de
 * §sondas 3: *cada sabotaje tiene que caer por su propio invariante*. */
const SABOTAJE = env("SABOTAJE", "");
const SABOTAJES = ["sin-hojas", "patron-falso", "tope"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) {
  console.error(`\n❌ SABOTAJE=${SABOTAJE} no existe. Los que hay: ${SABOTAJES.join(" · ")}`);
  process.exit(2);
}
const SAB = Object.fromEntries(SABOTAJES.map((s) => [s, SABOTAJE === s]));

gritaSiRevienta();

/** La propiedad cuyo cambio ES el zoom. Con el sabotaje, una que no existe. */
const PROP = SAB["patron-falso"] ? "transfrom" : "transform";
/**
 * Máximo del patrón, como FRACCIÓN de las reglas servidas de la página.
 *
 * Un patrón discriminante declara su máximo (§sondas 4): si «hover que mueve
 * algo» casara con una de cada veinte reglas del tema, no estaría señalando la
 * afordancia de la tarjeta — estaría midiendo que Divi anima mucho. El número
 * es una cota de cordura, no una medida: por eso va aquí con su razón y sale en
 * `meta`.
 */
const TOPE_UBICUO = SAB.tope ? 0 : 0.05;

/* ══════════════════════════════════════════════════════════════════════════
 * EL UNIVERSO — el MISMO que el del otro instrumento, y derivado igual
 * ═════════════════════════════════════════════════════════════════════════ */
const leeJson = (f) => JSON.parse(readFileSync(join(QA, f), "utf8"));
const tarjetas = leeJson("medidas/lh-tarjetas.json");
const comport = leeJson("medidas/comportamiento-1440.json");

/** `img.attachment-large · transform: none → matrix(...)` → `img.attachment-large`. */
const elementoDe = (cambio) => {
  const izq = String(cambio).split("·")[0].trim();
  return izq.replace(/^\d+:/, "");
};

/**
 * Lo que el OTRO instrumento midió por forma: qué elemento cambió su
 * `transform` al hover. Es la preimagen del cruce; si está vacía para una
 * forma, esa forma no tiene zoom medido y aquí no se le exige regla.
 */
const ZOOM_MEDIDO = {};
for (const i of comport.interacciones) {
  if (i.universo !== "listados" || i.tipo !== "hover" || i.veredicto !== "EFECTO") continue;
  for (const c of i.detalle?.cambios || []) {
    if (!/·\s*transform:/.test(c)) continue;
    (ZOOM_MEDIDO[i.clave] ||= new Set()).add(elementoDe(c));
  }
}

const PAGINAS = Object.entries(tarjetas.paginas)
  .filter(([, v]) => !v.error)
  .map(([ruta, v]) => ({ forma: v.forma, ruta, url: ORIGEN + ruta, zoomMedido: [...(ZOOM_MEDIDO[v.forma] || [])] }));

if (!PAGINAS.length) {
  console.error(`\n❌ el universo salió VACÍO. Cero páginas medidas darían un verde sin haber\n   mirado: por eso esto tira.`);
  process.exit(2);
}

const ev = new Evaluadas({ nombre: "hover-zonal", unidad: "formas de listado con su CSS servido leído", minimo: PAGINAS.length });

/** A quién le quita las hojas el sabotaje: la PRIMERA con zoom medido, derivada. */
const FORMA_SIN_HOJAS = PAGINAS.find((P) => P.zoomMedido.length)?.forma ?? null;
if (SAB["sin-hojas"] && !FORMA_SIN_HOJAS) {
  console.error(`\n❌ el sabotaje \`sin-hojas\` no tiene a quién sabotear: ninguna forma trae zoom\n   medido en la congelada del otro instrumento. Un sabotaje que no ejercita la\n   guarda no prueba nada (§sondas, regla 8a).`);
  process.exit(2);
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA RED — una hoja se pide UNA vez aunque la compartan nueve páginas
 * ═════════════════════════════════════════════════════════════════════════ */
const cacheHojas = new Map();
const UA = { "user-agent": "Mozilla/5.0 (qa kunak-web-clone hover-zonal)" };

async function pide(url) {
  for (let i = 0; ; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 45000);
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: UA, cache: "no-store" });
      clearTimeout(t);
      return { status: r.status, texto: r.status === 200 ? await r.text() : "" };
    } catch (e) {
      clearTimeout(t);
      if (i >= 2) return { status: 0, texto: "", error: String(e).slice(0, 80) };
    }
  }
}

const hoja = async (url) => {
  if (!cacheHojas.has(url)) cacheHojas.set(url, await pide(url));
  return cacheHojas.get(url);
};

/** Los `href` de `<link rel=stylesheet>`, absolutos. */
const hojasDe = (html) =>
  [...html.matchAll(/<link\b[^>]*\brel=["']?stylesheet["']?[^>]*>/gi)]
    .map((m) => (m[0].match(/\bhref=["']([^"']+)["']/) || [])[1])
    .filter(Boolean)
    .map((h) => (h.startsWith("http") ? h : new URL(h, ORIGEN).href));

/** El marcado SIN `<style>` ni `<script>`: ahí viven los selectores disfrazados de marcado (§sondas 4). */
const marcadoDe = (html) =>
  html.replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<script\b[\s\S]*?<\/script>/gi, "");

/**
 * Un trozo de selector con `:hover` partido en las dos mitades que contestan la
 * pregunta: **quién dispara** y **sobre qué**.
 *
 * `.et_pb_post a.foo:hover img` → `{ disparador: ".et_pb_post a.foo", objetivo: "img" }`
 * `a.case-imagen:hover`         → `{ disparador: "a.case-imagen", objetivo: "" }` (se
 *                                  amplía a sí mismo, que es una respuesta distinta)
 */
function parte(sel) {
  const i = sel.indexOf(":hover");
  if (i < 0) return null;
  return {
    disparador: sel.slice(0, i).trim(),
    objetivo: sel.slice(i + ":hover".length).trim(),
  };
}

/** Las clases que un trozo de selector nombra, para poder preguntarle al marcado si existen. */
const clasesDe = (sel) => [...sel.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);

/* ══════════════════════════════════════════════════════════════════════════
 * MEDIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "§LH-C6-HOVER-ZONAL — qué CONTENEDOR dispara el zoom de la media de tarjeta",
    instrumento: "el CSS SERVIDO (los <style> del documento + las hojas EXTERNAS que pide)",
    alcance: {
      formas: PAGINAS.length,
      soloPropiedad: PROP,
      noMide: [
        "el hover de COLOR (a.noticias, .scientific-imagen-container): otra pregunta",
        "la cascada COMPUTADA: eso lo mide qa:comportamiento, y por eso se cruzan",
        "390: el catálogo de hover se declara a 1440 (emulación táctil ≠ :hover)",
      ],
    },
    topeUbicuo: TOPE_UBICUO,
    sabotaje: SABOTAJE || null,
    otroInstrumento: "medidas/comportamiento-1440.json (congelado, no se re-mide)",
  },
  formas: {},
};

let totalReglas = 0;
let totalHoverTransform = 0;
let efectoSinRegla = 0;

console.log(`\n════════ HOVER ZONAL · qué dispara el zoom · propiedad «${PROP}» ════════`);
console.log(`  universo: ${PAGINAS.length} formas de listado (el mismo que qa:comportamiento)`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}`);

for (const P of PAGINAS) {
  const doc = await pide(P.url);
  if (doc.status !== 200) {
    ev.fallo(`${P.forma}`, `HTTP ${doc.status} al pedir ${P.ruta}`);
    salida.formas[P.forma] = { ruta: P.ruta, error: `HTTP ${doc.status}` };
    console.log(`\n  ── ${P.forma}: HTTP ${doc.status}`);
    continue;
  }
  const enLinea = cssDe(doc.texto);
  const urls = hojasDe(doc.texto);
  const cegada = SAB["sin-hojas"] && P.forma === FORMA_SIN_HOJAS;
  const externas = cegada ? [] : await Promise.all(urls.map(hoja));
  const css = [enLinea, ...externas.map((h) => h.texto)].join("\n");
  const marcado = marcadoDe(doc.texto);

  let nReglas = 0;
  const halladas = [];
  for (const r of reglas(css)) {
    nReglas++;
    if (!r.selector.includes(":hover")) continue;
    if (!new RegExp(`(^|;|\\s)${PROP}\\s*:`).test(r.declaraciones)) continue;
    for (const trozo of r.selector.split(",")) {
      const p = parte(trozo);
      if (!p) continue;
      /* Divi sirve el CSS de módulos que esta página no usa. Una regla cuyo
       * disparador nombra clases que NO están en el marcado no es de esta
       * tarjeta: contarla sería la tercera cara de la regla 4 —encontrar más de
       * lo que hay— con forma de dato. */
      const clases = clasesDe(p.disparador);
      if (clases.length && !clases.every((c) => new RegExp(`class="[^"]*\\b${c}\\b`).test(marcado))) continue;
      halladas.push({
        media: r.media || "base",
        disparador: p.disparador,
        objetivo: p.objetivo || "(el propio disparador)",
        declaraciones: r.declaraciones.replace(/\s+/g, " ").trim().slice(0, 120),
      });
    }
  }
  totalReglas += nReglas;
  totalHoverTransform += halladas.length;

  /* ── EL CRUCE: ¿explica esta regla el zoom que el OTRO instrumento midió? ── */
  const explica = (el) => {
    const [tag, clase] = [el.split(".")[0], el.split(".")[1]];
    return halladas.filter((h) => {
      const donde = h.objetivo === "(el propio disparador)" ? h.disparador : h.objetivo;
      return (clase && donde.includes(`.${clase}`)) || new RegExp(`(^|\\s|>)${tag}(\\b|$|:|\\.)`).test(donde);
    });
  };
  const cruce = P.zoomMedido.map((el) => ({ elemento: el, reglas: explica(el).map((h) => `${h.disparador}:hover ${h.objetivo}`) }));
  const sinExplicar = cruce.filter((c) => !c.reglas.length);
  efectoSinRegla += sinExplicar.length;

  salida.formas[P.forma] = {
    ruta: P.ruta,
    hojasExternas: urls.length,
    hojasPedidas: externas.length,
    hojasQueContestaron: externas.filter((h) => h.status === 200).length,
    bytesCss: css.length,
    reglasServidas: nReglas,
    reglasHoverConTransform: halladas.length,
    disparadores: halladas,
    zoomMedidoPorComportamiento: P.zoomMedido,
    cruce,
  };

  console.log(`\n  ── ${P.forma}  (${nReglas} reglas servidas · ${urls.length} hojas externas)`);
  if (!halladas.length) console.log(`     · ninguna regla \`:hover\` con \`${PROP}\` cuyo disparador esté en el marcado`);
  for (const h of halladas.slice(0, 6))
    console.log(`     ◉ ${h.disparador}:hover ${h.objetivo}   { ${h.declaraciones} }${h.media !== "base" ? `   @${h.media}` : ""}`);
  for (const c of cruce)
    console.log(`     ${c.reglas.length ? "✓" : "✗"} zoom medido en \`${c.elemento}\` → ${c.reglas.length ? c.reglas.join(" | ") : "SIN REGLA QUE LO EXPLIQUE"}`);
  if (!P.zoomMedido.length) console.log(`     – sin zoom medido en esta forma (no se le exige regla)`);

  /* ⚠ `Evaluadas` cuenta SU unidad, que es *«una forma con su CSS servido
   * leído»* — no *«una forma que además cuadró»*. Mezclarlas haría que el
   * contrato y el cruce saltaran por la misma causa, y entonces el exit≠0 no
   * diría cuál de los dos falló (§sondas 3, corolario). El cruce cierra el
   * código por su cuenta, más abajo. */
  if (css.length > 0) ev.ok();
  else ev.fallo(`${P.forma}`, `0 bytes de CSS: ni en línea ni externo (${urls.length} hojas declaradas)`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME — un solo canal de verdad: lo que imprime es lo que cuenta
 * ═════════════════════════════════════════════════════════════════════════ */
const fraccion = totalReglas ? totalHoverTransform / totalReglas : 0;
salida.resumen = {
  reglasServidas: totalReglas,
  reglasHoverConTransform: totalHoverTransform,
  fraccion: Math.round(fraccion * 1e5) / 1e5,
  efectosMedidosSinRegla: efectoSinRegla,
};

console.log(`\n═══ RESUMEN`);
console.log(`  reglas servidas leídas            ${totalReglas}`);
console.log(`  \`:hover\` con \`${PROP}\` en el marcado  ${totalHoverTransform}  (${(fraccion * 100).toFixed(3)} %)`);
console.log(`  efectos medidos SIN regla         ${efectoSinRegla}`);

/* ── LAS TRES GUARDAS SON EXCLUYENTES A PROPÓSITO ──────────────────────────
 * Con el patrón MUERTO, «hay un efecto medido sin regla» es una CONSECUENCIA de
 * que el instrumento no mira, no un hallazgo sobre el sitio. Publicar las dos
 * haría saltar dos guardas por una causa y el código de salida dejaría de
 * discriminar — que es justo lo que el test en negativo tiene que poder
 * distinguir. Así que el cruce sólo habla cuando el patrón está vivo. */
const muerto = totalHoverTransform === 0;
const ubicuo = !muerto && fraccion > TOPE_UBICUO;
const sinRegla = !muerto && efectoSinRegla > 0;
if (muerto) {
  console.error(
    `\n❌ patrón MUERTO: 0 reglas en las ${PAGINAS.length} formas.\n` +
      `   Un selector que no casa con nada y una propiedad que no existe dan la MISMA\n` +
      `   salida (§sondas, regla 4), así que esto sale por error y no por cero.\n`,
  );
} else if (ubicuo) {
  console.error(
    `\n❌ patrón UBICUO: ${(fraccion * 100).toFixed(2)} % de las reglas servidas casan, por encima del\n` +
      `   máximo declarado (${(TOPE_UBICUO * 100).toFixed(2)} %). Un filtro que casa con todo no discrimina\n` +
      `   nada, y un pleno se lee como dato (§sondas, regla 4, complementario).\n`,
  );
}
if (sinRegla) {
  console.error(
    `\n❌ ${efectoSinRegla} efecto(s) de zoom MEDIDOS por qa:comportamiento sin ninguna regla\n` +
      `   servida que los explique. Esto no es «no hay regla»: es que este instrumento\n` +
      `   no vio la que el otro demostró que existe, y publicarlo como medida sería\n` +
      `   creerse un recuento nuevo que contradice una medida buena anterior.\n`,
  );
}
salida.resumen.veredicto = muerto ? "PATRÓN MUERTO" : ubicuo ? "PATRÓN UBICUO" : sinRegla ? "EFECTO SIN REGLA" : "LEÍDO";

w(`medidas/hover-zonal${SABOTAJE ? `-neg-${SABOTAJE}` : ""}.json`, salida);
ev.informe();
process.exitCode = muerto || ubicuo || sinRegla ? 2 : 0;
