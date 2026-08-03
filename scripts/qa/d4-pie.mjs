/**
 * D4 · EL PIE — ¿mismo pie con contenido distinto, o PLANTILLAS de pie distintas?
 * Uso: npm run qa:d4 -- [ancho]            SABOTAJE=1 → test en negativo
 *
 * C1 midió que el pie del ORIGINAL vale 593.75 en blog, 1048.25 en catálogo y
 * 681.09 en software, **constante dentro de cada familia**, mientras el clon
 * sirve siempre 681.09. Esa firma —constante por familia, distinta entre
 * familias— es la de una **variante de plantilla**, no la de un campo por
 * instancia (§«Estructura que en realidad es contenido»). Pero eso hay que
 * verificarlo, no deducirlo de la forma del número.
 *
 * Lo que decide la pregunta es la COMPOSICIÓN interna del pie: si las tres
 * familias traen las MISMAS secciones con distinto contenido, es contenido; si
 * traen un número o un tipo distinto de secciones, son plantillas distintas —
 * que es lo que C-1 ya vio en el censo (`tb_footer` 4 en caso de éxito contra 3
 * en el resto, `esqueleto.json`).
 *
 * Se mide sobre el ORIGINAL, que es donde vive la respuesta.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ AMPLIADA 2026-08-01, antes de escribir el arreglo de D4. Tres huecos que
 * la primera versión tenía y que habrían producido un arreglo cableado a ojo:
 *
 * **(1) Medía 7 familias y el clon emite 31 rutas de 11 formas.** FAQ, HOME,
 * A·documento y MONOGRÁFICO —**9 rutas**— no estaban, así que su ancho de fila
 * y su `padding` se habrían asignado por parecido de nombre. Es exactamente lo
 * que `CLAUDE.md` llama SIN PROBAR: no se cablea, se mide.
 *
 * **(2) Era CIEGA DEL LADO DEL CLON en el eje que se va a tocar.** `caja.filaW`
 * sale de `.et_pb_row`, que en el clon no existe → `null` en las 7, o sea que
 * el ancho de fila —el knob del arreglo— **no se podía adjudicar**. Un `null`
 * leído como dato es la regla 4 de §sondas. Ahora cada lado trae su selector y
 * se dice **cuál** en `via`.
 *
 * **(3) No abría el alto de la sección.** El modelo de dos ejes (ancho de fila
 * + `padding` de sección) explica `footer-background` al céntimo, pero en
 * catálogo/producto deja **+79.18 sin explicar** (sec0 +46.59, sec1 +32.59)
 * contra software. Un total no dice qué; la composición sí — de ahí `fila`,
 * `cols` y `mods` con sus márgenes. Es la regla del NIVEL, aplicada al pie.
 *
 * Y estrena lo que le faltaba para poder fallar: **`Censo`** (un selector
 * muerto sale por error, no por cero) y **código de salida** — antes devolvía
 * 0 pasara lo que pasara, que es un verde que no significa nada.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { Censo, Evaluadas, env, hoy, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
const SABOTAJE = !!process.env.SABOTAJE;
/**
 * `SOLO=CASO` acota a las familias cuyo nombre contenga eso. Existe para que el
 * test en negativo cueste 2 cargas y no 22 — una guarda que sale cara de probar
 * se prueba una vez y luego ya no.
 *
 * ⚠ Acotar NO puede volverse verde por vaciado: si el filtro no casa con nada,
 * es un fallo, no una corrida limpia (la distinción `null` vs `[]` de `lib.mjs`).
 */
const SOLO = env("SOLO");

/**
 * Una ruta por FORMA de página del clon, no por familia intuida. Las cuatro
 * marcadas ⊕ se añadieron el 2026-08-01: sin ellas, 9 de las 31 rutas emitidas
 * habrían recibido su pie por analogía en vez de por medida.
 */
const RUTAS = [
  ["A · blog", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/", "/todas-nuestras-soluciones-en-el-iotswc"],
  ["A · término", "https://kunakair.com/es/emisiones-atmosfericas/", "/emisiones-atmosfericas"],
  // ⊕ A·documento va bajo /recursos/ y es la 3.ª forma del grupo A
  ["A · documento", "https://kunakair.com/es/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023/", "/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023"],
  ["CATÁLOGO", "https://kunakair.com/es/accesorios/", "/accesorios"],
  ["SOFTWARE", "https://kunakair.com/es/kunak-api/", "/kunak-api"],
  ["PRODUCTO", "https://kunakair.com/es/monitor-calidad-aire/", "/monitor-calidad-aire"],
  ["SECTOR", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/", "/sectores/calidad-del-aire-en-las-ciudades"],
  // ⊕ el monográfico comparte ruta con SECTOR pero es otro arquetipo
  ["MONOGRÁFICO", "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/", "/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["CASO", "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/", "/casos-de-exito/red-calidad-de-aire-para-world-athletics"],
  // ⊕ FAQ y HOME: 3 rutas emitidas que nunca se habían mirado por el pie
  ["FAQ", "https://kunakair.com/es/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion/", "/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion"],
  ["HOME", "https://kunakair.com/es/", "/"],
];

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const H = (el) => r(el.getBoundingClientRect().height);
  const W = (el) => r(el.getBoundingClientRect().width);
  const t = (el, n = 42) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);

  // Test en negativo: un selector que no casa en NINGUNA página tiene que salir
  // por error. Se pide aquí dentro para que pase por el censo como los de verdad.
  if (sabotaje) __q(".d4-selector-que-no-existe");

  const esOriginal = !!__q(".et_pb_section");
  const pie = __q(esOriginal ? "footer.et-l--footer, #main-footer" : "footer");
  if (!pie) return { ausente: true };

  // En el original el pie del Theme Builder son `.et_pb_section` con sufijo
  // `_tb_footer`. En el clon son los bloques de nivel 1 del <footer>.
  const secciones = esOriginal ? __qa(".et_pb_section", pie) : [...pie.children];

  /**
   * La FILA de una sección, con el selector de cada lado — y diciendo cuál.
   *
   * En el original es `.et_pb_row`. En el clon **no hay clase equivalente**: la
   * fila es el bloque centrado (`mx-auto w-[…]`) que cuelga de la sección, o sea
   * su primer hijo. Devolver `null` para el clon —lo que hacía la versión
   * anterior— dejaba el eje del arreglo sin lado contra el que adjudicar.
   */
  const filaDe = (s) => {
    const divi = s.querySelector(".et_pb_row, [class*='et_pb_row']");
    const el = divi || s.firstElementChild;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      via: divi ? "et_pb_row" : "primer hijo",
      w: W(el), h: H(el),
      pt: cs.paddingTop, pb: cs.paddingBottom,
      mt: cs.marginTop, mb: cs.marginBottom,
    };
  };

  return {
    alto: H(pie),
    nSecciones: secciones.length,
    // La IDENTIDAD de cada sección, no solo su alto: es lo que distingue
    // «mismo pie con otro contenido» de «otra plantilla de pie».
    secciones: secciones.map((s, i) => {
      const cs = getComputedStyle(s);
      // Columnas: Divi las marca; el clon usa una rejilla CSS, así que sus
      // «columnas» son los hijos de la fila. Otra vez, un selector por lado.
      const fila = s.querySelector(".et_pb_row, [class*='et_pb_row']") || s.firstElementChild;
      const cols = s.querySelectorAll(".et_pb_column").length
        ? [...s.querySelectorAll(".et_pb_column")]
        : fila ? [...fila.children] : [];
      return {
        i,
        h: H(s),
        clase: (s.className || "").split(" ").filter((c) => /_tb_footer|et_pb_section_\d|^[a-z-]{4,}$/.test(c)).slice(0, 3).join(" "),
        nFilas: s.querySelectorAll(".et_pb_row, [class*='et_pb_row']").length,
        nModulos: s.querySelectorAll(".et_pb_module").length,
        // ── Por qué la MISMA sección mide distinto en dos familias ───────────
        // Con las mismas clases y los mismos módulos, lo único que puede cambiar
        // el alto es la CAJA: si la fila es más estrecha, las columnas apilan y
        // el bloque crece. Es la regla del ancho aplicada al pie.
        caja: {
          secW: W(s),
          filaW: fila ? W(fila) : null,
          nCols: cols.length,
          colsW: cols.slice(0, 6).map(W),
          colsY: cols.slice(0, 6).map((c) => r(c.getBoundingClientRect().y + window.scrollY)),
          pt: cs.paddingTop,
          pb: cs.paddingBottom,
        },
        // ── La COMPOSICIÓN, que es lo que dice QUÉ ───────────────────────────
        // El total solo dice si cuadra. Sin esto, el +79.18 de catálogo contra
        // software es un número sin dueño.
        fila: filaDe(s),
        cols: cols.slice(0, 6).map((c) => ({ w: W(c), h: H(c) })),
        mods: [...s.querySelectorAll(".et_pb_module")].slice(0, 4).map((m) => {
          const ms = getComputedStyle(m);
          return { h: H(m), mt: ms.marginTop, mb: ms.marginBottom };
        }),
        txt: t(s),
      };
    }),
    // Marcadores de contenido que podrían explicar una diferencia de alto
    nEnlaces: pie.querySelectorAll("a[href]").length,
    nImgs: pie.querySelectorAll("img").length,
    nForm: pie.querySelectorAll("form").length,
    nWidgets: pie.querySelectorAll(".et_pb_widget, .widget").length,
  };
};

const LISTA = SOLO ? RUTAS.filter(([f]) => f.toUpperCase().includes(SOLO.toUpperCase())) : RUTAS;
if (LISTA.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna familia — eso es un filtro equivocado, no una corrida limpia.`);
  process.exit(2);
}

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: hoy(), solo: SOLO ?? null }, familias: {} };
let muertas = 0;

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "d4-pie", unidad: "páginas (2 por unidad: los dos lados)", minimo: (LISTA.length) * 2, porPaginas: true });

for (const [fam, orig, clon] of LISTA) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    return datos;
  };
  try {
    const o = await lee(orig), c = await lee(CLON + clon);
    salida.familias[fam] = { orig: o, clon: c };

    console.log(`\n█ ${fam}  @${width}`);
    console.log(`   PIE  orig ${String(o.alto).padStart(8)} (${o.nSecciones} secs · ${o.nEnlaces} a · ${o.nImgs} img · ${o.nForm} form · ${o.nWidgets} widg)`);
    console.log(`        clon ${String(c.alto).padStart(8)} (${c.nSecciones} secs · ${c.nEnlaces} a · ${c.nImgs} img · ${c.nForm} form)   Δ ${+(c.alto - o.alto).toFixed(2)}`);
    for (const s of o.secciones) console.log(`          orig sec${s.i} h=${String(s.h).padStart(8)} filaW=${String(s.caja.filaW).padStart(8)} pt=${s.caja.pt.padStart(9)} pb=${s.caja.pb.padStart(9)} cols=${s.caja.nCols}  ${s.clase.padEnd(34)} | ${s.txt}`);
    for (const s of c.secciones) console.log(`          clon sec${s.i} h=${String(s.h).padStart(8)} filaW=${String(s.caja.filaW).padStart(8)} pt=${s.caja.pt.padStart(9)} pb=${s.caja.pb.padStart(9)} cols=${s.caja.nCols}  (${s.fila?.via ?? "—"})`);
  } catch (e) {
    // Una carga que falla NO puede quedarse en «sin datos»: sería una celda
    // vacía leída como «no hay diferencia» (regla 4 de §sondas).
    muertas++;
    salida.familias[fam] = { error: String(e).slice(0, 200) };
    console.log(`\n█ ${fam}  @${width}\n   ✗ ERROR ${String(e).slice(0, 140)}`);
  }
}
await browser.close();
// Una corrida ACOTADA no es la medida de referencia: se congela con su propio
// nombre para que no se confunda con la completa ni ensucie su historial.
// `SALIDA` (como en `clon-base`) nombra las corridas de antes/después de un
// arreglo, que es el par que hay que poder exhibir luego.
w(env("SALIDA") || `medidas/d4-pie-${width}${SOLO ? `-solo-${SOLO.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}.json`, salida);

/* ── Un canal de verdad: lo que imprime y lo que cuenta ───────────────────── */
const muertos = censo.informe(`@${width}`);
if (muertas) console.error(`\n❌ ${muertas} familia(s) no se pudieron medir — NO son «sin diferencia».`);
const fallos = muertos + muertas;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} d4 @${width}${SOLO ? ` (SOLO=${SOLO})` : ""} · ${LISTA.length - muertas}/${LISTA.length} familias medidas · ` +
    `${muertos} selector(es) muerto(s)\n` +
    `   ⚠ Esto NO adjudica: los Δ del pie se leen CONTRA EL ORIGINAL, uno a uno.`,
);
process.exit(fallos === 0 ? 0 : 2);
