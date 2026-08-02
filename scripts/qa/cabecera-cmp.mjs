/**
 * LA CABECERA DE `/sectores/*` — original contra CLON, y por qué el monográfico
 * mide 36 de más solo a 1440.
 * Uso: npm run qa:cabecera -- [ancho]      SABOTAJE=1 → test en negativo
 *
 * `mono-cabecera.mjs` compara **original contra original** —para decidir si el
 * monográfico estrena arquetipo— y por eso no puede adjudicar nada del clon.
 * Ésta abre los dos lados.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ MIDE Y POR QUÉ ASÍ
 *
 * El síntoma es de ENVOLVIMIENTO: la cabecera del monográfico vale 433.61 en el
 * original y 397.59 en el clon a 1440 —exactamente **un renglón de 36**— y
 * cuadra a 390. `CLAUDE.md` §El NIVEL lo nombra: *cuando el síntoma sea de
 * envolvimiento, mide al ancho donde NO envuelve*, y la causa es el **ancho del
 * contenedor**, no el alto.
 *
 * Así que se ancla en el `h1` —semántico, uno por página, el mismo objeto en los
 * dos lados— y se sube **la cadena entera hasta la sección**, con el ancho de
 * cada nivel. Un alto no dice dónde se envuelve; la cadena de anchos, sí.
 *
 * `nLineas` sale de un `Range` sobre el contenido —no de `getClientRects()` del
 * elemento, ver el comentario de `renglones()`—: es el dato que convierte «+36»
 * en «un renglón más», y sin él un Δ de alto no distingue envolvimiento de
 * `padding`.
 *
 * ⚠ Y se corre a **TRES anchos**, no dos. Con 1440 y 390 no se puede distinguir
 * «50 % de la fila» de «un ancho fijo en px que a 390 no cabe»: las dos
 * hipótesis predicen lo mismo en esos dos puntos. El tercero las separa.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { Censo, env, iniciarClon, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
/* Esta sonda es DUEÑA de su servidor: lo arranca en un puerto propio, espera a
 * que responda y lo mata al salir. Nadie puede pararle el clon a mitad de
 * corrida, y dos sondas pueden medir a la vez. `CLON=<url>` sigue mandando. */
const { base: CLON, parar: pararClon } = await iniciarClon();
const SABOTAJE = !!process.env.SABOTAJE;
const SOLO = env("SOLO");

/** Los 4 vivos de la ruta: 2 del arquetipo SECTOR y 2 del MONOGRÁFICO. */
const PARES = [
  ["SECTOR · urbano", "calidad-del-aire-en-las-ciudades"],
  ["SECTOR · investigación", "estudio-de-la-contaminacion-atmosferica"],
  ["MONOGRÁFICO · edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["MONOGRÁFICO · petróleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
];

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const caja = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      clase: (el.className || "").toString().split(" ").filter(Boolean).slice(0, 3).join(" ").slice(0, 48),
      x: r(b.x), y: r(b.y + window.scrollY), w: r(b.width), h: r(b.height),
      pt: cs.paddingTop, pb: cs.paddingBottom, mt: cs.marginTop, mb: cs.marginBottom,
      fs: cs.fontSize, lh: cs.lineHeight,
    };
  };

  if (sabotaje) __q(".cabecera-selector-que-no-existe");

  /**
   * ⚠ CORREGIDO en la misma corrida que lo estrenó. La 1.ª versión contaba
   * renglones con `el.getClientRects().length` y **daba 1 siempre**: en un
   * elemento de BLOQUE eso devuelve la caja de borde, una sola, no las cajas de
   * línea. O sea que informaba «1 renglón» de un `h1` de 82 px de alto con
   * `line-height: 36` — un número plausible, sin error, y falso.
   *
   * Es la regla 1 de §sondas en su forma más barata de cometer: la sonda llegó
   * con el defecto puesto y **habría publicado «Δ renglones 0» junto a un Δ de
   * alto de −36**, que es precisamente la contradicción que venía a resolver.
   *
   * Un `Range` sí devuelve **una caja por línea**. Se cuentan las distintas por
   * su `top` redondeado, porque un renglón partido en varios nodos de texto da
   * varias cajas con el mismo `top`.
   */
  const renglones = (el) => {
    if (!el) return null;
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const tops = new Set([...rango.getClientRects()].filter((b) => b.height > 0).map((b) => Math.round(b.top)));
    rango.detach?.();
    return tops.size || null;
  };

  const esOriginal = !!__q(".et_pb_section");
  /* El ancla: el `h1`. Uno por página y el mismo objeto en los dos lados — que
   * es justo lo que `qa:c-cabecera` exige verificar de todo primer `h1`. */
  const h1 = __q("h1");
  if (!h1) return { ausente: true, motivo: "sin h1" };

  const seccion = h1.closest(esOriginal ? ".et_pb_section" : "section");
  if (!seccion) return { ausente: true, motivo: "el h1 no cuelga de una sección" };

  /* La CADENA de anchos, del `h1` a la sección. Aquí aparece el nivel donde el
   * original estrecha el módulo y el clon no. */
  const cadena = [];
  for (let el = h1; el && el !== seccion.parentElement; el = el.parentElement) {
    cadena.push(caja(el));
    if (el === seccion) break;
  }

  /* El kicker: el `<p>` anterior al `h1` dentro de la sección. Por posición, no
   * por clase — el original lo envuelve en módulos de Divi y el clon no. */
  /* ⚠ En el original el kicker NO es un `<p>` —la 1.ª versión lo buscaba así y
   * daba `null` en las 4, o sea un hueco leído como «no hay kicker»—. Se busca
   * por POSICIÓN: el último elemento con texto propio que precede al `h1` y no
   * lo contiene. Eso lo denota en los dos lados sin depender de la etiqueta. */
  const previos = [...seccion.querySelectorAll("*")].filter(
    (el) =>
      !el.contains(h1) &&
      el.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING &&
      (el.textContent || "").trim().length > 0 &&
      ![...el.children].some((h) => (h.textContent || "").trim().length > 0),
  );
  const kicker = previos.at(-1) ?? null;

  /* ── Los hijos EN FLUJO de la sección ─────────────────────────────────────
   * Para el contrato de RANGO no basta el alto de la sección: hay que saber QUÉ
   * pieza varía con el ancho. El alto es un contenedor con holgura — la regla
   * del NIVEL— y aquí dentro hay al menos dos cosas distintas: el hueco que deja
   * la barra de navegación y la fila del título. */
  const hijosSeccion = [...seccion.children]
    .filter((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== "none" && cs.position !== "absolute" && cs.position !== "fixed";
    })
    .map(caja);

  /* La BARRA DE NAVEGACIÓN: en el original va dentro de la sección de cabecera
   * y en el clon es `absolute` con un hueco cableado. Si su alto varía con el
   * ancho, el hueco cableado es un defecto de RANGO. */
  const nav = __q(esOriginal ? "header.et-l--header, #main-header" : "header");

  return {
    seccion: caja(seccion),
    nav: caja(nav),
    hijosSeccion,
    // El alto de la sección MENOS el del `h1`: aísla lo que no depende del
    // envolvimiento del titular, que es lo que tiene que variar con el ancho.
    sinH1: r(caja(seccion).h - caja(h1).h),
    h1: { ...caja(h1), nLineas: renglones(h1), txt: (h1.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60) },
    kicker: kicker ? { ...caja(kicker), nLineas: renglones(kicker), txt: (kicker.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30) } : null,
    cadena,
    // El ancho del `h1` como FRACCIÓN del nivel que lo contiene: es lo que
    // distingue «ancho de módulo en %» de «ancho en px», y lo que hay que
    // cablear. Se da con sus dos operandos, nunca solo el cociente.
    fraccion: cadena.length > 1 ? { h1w: cadena[0].w, padreW: cadena[1].w, pct: r((cadena[0].w / cadena[1].w) * 100) } : null,
  };
};

const LISTA = SOLO ? PARES.filter(([f]) => f.toUpperCase().includes(SOLO.toUpperCase())) : PARES;
if (LISTA.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna ruta — es un filtro equivocado, no una corrida limpia.`);
  process.exit(2);
}

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), solo: SOLO ?? null }, rutas: {} };
let muertas = 0;

for (const [fam, slug] of LISTA) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    return datos;
  };
  try {
    const o = await lee(`https://kunakair.com/es/sectores/${slug}/`);
    const c = await lee(`${CLON}/sectores/${slug}`);
    salida.rutas[fam] = { slug, orig: o, clon: c };
    if (o.ausente || c.ausente) { muertas++; console.log(`\n█ ${fam} @${width}\n   ✗ AUSENTE orig:${o.motivo ?? "ok"} clon:${c.motivo ?? "ok"}`); continue; }

    const d = (x, y) => (x == null || y == null ? "—" : String(+(y - x).toFixed(2)).padStart(9));
    const n = (v, k = 8) => String(v ?? "—").padStart(k);
    console.log(`\n█ ${fam}  @${width}`);
    console.log(`   ${"".padEnd(13)} ${"orig".padStart(8)} ${"clon".padStart(8)} ${"Δ".padStart(9)}`);
    console.log(`   SECCIÓN h    ${n(o.seccion.h)} ${n(c.seccion.h)} ${d(o.seccion.h, c.seccion.h)}`);
    console.log(`   h1 ancho     ${n(o.h1.w)} ${n(c.h1.w)} ${d(o.h1.w, c.h1.w)}`);
    console.log(`   h1 alto      ${n(o.h1.h)} ${n(c.h1.h)} ${d(o.h1.h, c.h1.h)}`);
    console.log(`   h1 renglones ${n(o.h1.nLineas)} ${n(c.h1.nLineas)} ${d(o.h1.nLineas, c.h1.nLineas)}`);
    console.log(`   kicker alto  ${n(o.kicker?.h)} ${n(c.kicker?.h)} ${d(o.kicker?.h, c.kicker?.h)}`);
    console.log(`   h1 / padre   orig ${o.fraccion?.h1w} / ${o.fraccion?.padreW} = ${o.fraccion?.pct}%   ·   clon ${c.fraccion?.h1w} / ${c.fraccion?.padreW} = ${c.fraccion?.pct}%`);
    const pintaHijos = (lado, x) => console.log(`     ${lado} sinH1=${x.sinH1} · hijos: ` + x.hijosSeccion.map((n2) => `<${n2.tag}${n2.clase ? "." + n2.clase.split(" ")[0] : ""} h=${n2.h} pt=${n2.pt} pb=${n2.pb}>`).join(" "));
    pintaHijos("orig", o); pintaHijos("clon", c);
    const pinta = (lado, x) => console.log(`     ${lado} ` + x.cadena.map((n2) => `<${n2.tag}${n2.clase ? "." + n2.clase.split(" ")[0] : ""} ${n2.w}>`).join(" ← "));
    pinta("orig", o); pinta("clon", c);
  } catch (e) {
    muertas++;
    salida.rutas[fam] = { error: String(e).slice(0, 200) };
    console.log(`\n█ ${fam} @${width}\n   ✗ ERROR ${String(e).slice(0, 140)}`);
  }
}
await browser.close();
await pararClon();
w(env("SALIDA") || `medidas/cabecera-cmp-${width}${SOLO ? `-solo-${SOLO.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}.json`, salida);

const muertos = censo.informe(`@${width}`);
if (muertas) console.error(`\n❌ ${muertas} ruta(s) no se pudieron medir — NO son «sin diferencia».`);
const fallos = muertos + muertas;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cabecera-cmp @${width} · ${LISTA.length - muertas}/${LISTA.length} rutas · ${muertos} selector(es) muerto(s)\n` +
    `   ⚠ El alto NO es la propiedad: lo es el ANCHO del h1. Un Δ de alto de 36 con Δ de renglones de 1 es envolvimiento.`,
);
process.exit(fallos === 0 ? 0 : 2);
