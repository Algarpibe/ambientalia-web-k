/**
 * D1 · D2 · D3 — EL FLUJO DEL CASCARÓN, nodo a nodo y en los dos lados
 * Uso: npm run qa:d123 -- [ancho]        SABOTAJE=1 → test en negativo
 *
 * Las tres piezas que quedan de C1 son las tres la misma pregunta, y `c1-localiza`
 * no puede contestarla porque **mide huecos entre secciones sin mirar qué hay
 * dentro del hueco**:
 *
 *   D1 · −225 antes de la 1.ª sección   D2 · +50 de hueco entre secciones
 *   D3 · −42 entre la última y el pie
 *
 * Un «hueco» de 50 px puede ser dos cosas **que se ven idénticas en el número**:
 *   (a) 50 px de aire que el original no tiene  → DEFECTO;
 *   (b) un nodo de 50 px que el censo no cuenta como sección → PARTICIÓN, y el
 *       total no se mueve.
 * Distinguirlas exige bajar un nivel: **enumerar los hijos en flujo de `main`**,
 * no solo los que casan con el selector de sección. Es la regla del NIVEL — un
 * hueco es un contenedor con holgura, y ahí cabe un nodo entero sin dejar rastro.
 *
 * Por eso esta sonda NO clasifica: enumera. Cada hijo con su etiqueta, su alto,
 * su texto y si casa o no con el selector de sección de su lado. La lectura la
 * hace quien mira, con las dos listas delante.
 */
import { Censo, env, Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
const SABOTAJE = !!process.env.SABOTAJE;
const SOLO = env("SOLO");

/**
 * Las tres familias de C1 más las cuatro formas que faltaban. Se ampliaron el
 * 2026-08-02 al localizar D3: los 42 px son el `margin-bottom` del `<article>`
 * del CPT, o sea que **el alcance es «qué tipos de página lo llevan»**, y con
 * tres familias medidas eso no se sabe — se supone. Es el mismo error que D4
 * cometió con 7 familias de 11.
 */
const PARES = [
  ["A · blog", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/", "/todas-nuestras-soluciones-en-el-iotswc"],
  ["A · término", "https://kunakair.com/es/emisiones-atmosfericas/", "/emisiones-atmosfericas"],
  ["A · documento", "https://kunakair.com/es/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023/", "/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023"],
  ["CATÁLOGO", "https://kunakair.com/es/accesorios/", "/accesorios"],
  ["SOFTWARE", "https://kunakair.com/es/kunak-api/", "/kunak-api"],
  ["PRODUCTO", "https://kunakair.com/es/monitor-calidad-aire/", "/monitor-calidad-aire"],
  ["SECTOR", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/", "/sectores/calidad-del-aire-en-las-ciudades"],
  ["MONOGRÁFICO", "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/", "/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["CASO", "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/", "/casos-de-exito/red-calidad-de-aire-para-world-athletics"],
  ["FAQ", "https://kunakair.com/es/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion/", "/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion"],
  ["HOME", "https://kunakair.com/es/", "/"],
];

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const Y = (el) => r(el.getBoundingClientRect().y + window.scrollY);
  const H = (el) => r(el.getBoundingClientRect().height);
  const t = (el, n = 34) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);

  if (sabotaje) __q(".d123-selector-que-no-existe");

  const esOriginal = !!__q(".et_pb_section");
  const cab = __q(esOriginal ? "header.et-l--header, #main-header" : "header");
  const pie = __q(esOriginal ? "footer.et-l--footer, #main-footer" : "footer");

  /**
   * El CONTENEDOR del cuerpo. En el original Divi cuelga las secciones de
   * `#et-main-area > #main-content .entry-content` o directamente del `#page`;
   * se toma el padre común de las secciones de cuerpo, que es lo que de verdad
   * marca el flujo. En el clon es `main`.
   */
  const secsDivi = __qa(".et_pb_section").filter((s) => !/_tb_(header|footer)\b/.test(s.className));
  /**
   * ⚠ El grupo C **no tiene cuerpo de Divi**: la FAQ sirve su contenido por PHP
   * del tema, así que `secsDivi` viene vacío y la 1.ª versión devolvía AUSENTE.
   * Un AUSENTE permanente convierte la sonda en roja para siempre, que es como
   * se enseña a ignorarla. Se baja por una cadena de respaldo y **se dice por
   * cuál se entró** (`via`): un contenedor distinto mide otra cosa, y eso el
   * lector tiene que verlo en la salida, no deducirlo.
   */
  let via = "seccion.parentElement";
  let contenedor = esOriginal ? (secsDivi[0]?.parentElement ?? null) : __q("main");
  if (esOriginal && !contenedor) {
    contenedor = __q("#main-content .entry-content");
    via = "#main-content .entry-content";
    if (!contenedor) { contenedor = __q("#main-content"); via = "#main-content"; }
  }
  if (!esOriginal) via = "main";
  if (!contenedor) return { ausente: true, motivo: "sin contenedor de cuerpo" };

  const casaSeccion = (el) =>
    esOriginal ? el.classList.contains("et_pb_section") && !/_tb_(header|footer)\b/.test(el.className) : el.tagName === "SECTION";

  /* ── Los HIJOS EN FLUJO del contenedor, casen o no con el selector ─────────
   * Aquí está la respuesta: si el «hueco» de D2 lo ocupa un nodo real, sale en
   * esta lista con `esSeccion:false`. Si no sale nada, el hueco es aire. */
  const hijos = [...contenedor.children]
    .filter((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== "none" && cs.position !== "absolute" && cs.position !== "fixed";
    })
    .map((el, i) => {
      const cs = getComputedStyle(el);
      return {
        i,
        tag: el.tagName.toLowerCase(),
        esSeccion: casaSeccion(el),
        y: Y(el), h: H(el),
        mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom,
        clase: (el.className || "").toString().split(" ").filter(Boolean).slice(0, 4).join(" ").slice(0, 70),
        txt: t(el),
      };
    });

  const cs = (el) => (el ? getComputedStyle(el) : null);
  const csCab = cs(cab), csCont = cs(contenedor);

  /* ── D3 vive FUERA del contenedor, así que hay que salir de él ─────────────
   * `entreUltimoHijoYPie` dice que en catálogo y software hay 42 px entre el
   * final del contenedor y el pie, y el contenedor declara `mb: 0`. O sea que
   * los 42 los pone **algún antepasado o algún hermano**, y desde dentro no se
   * ven: es otra vez el NIVEL, ahora hacia arriba. Se enumeran las dos cosas —
   * la cadena de antepasados con su caja, y lo que va DESPUÉS del contenedor. */
  const cadena = [];
  for (let el = contenedor; el && el !== document.body; el = el.parentElement) {
    const s = getComputedStyle(el);
    cadena.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      clase: (el.className || "").toString().split(" ").filter(Boolean).slice(0, 3).join(" ").slice(0, 46),
      y: Y(el), h: H(el),
      pt: s.paddingTop, pb: s.paddingBottom, mt: s.marginTop, mb: s.marginBottom,
    });
  }
  const despuesDelContenedor = [];
  for (let el = contenedor.nextElementSibling; el; el = el.nextElementSibling) {
    const s = getComputedStyle(el);
    if (s.display === "none") { despuesDelContenedor.push({ tag: el.tagName.toLowerCase(), clase: (el.className || "").toString().slice(0, 40), oculto: true }); continue; }
    despuesDelContenedor.push({
      tag: el.tagName.toLowerCase(),
      clase: (el.className || "").toString().slice(0, 40),
      y: Y(el), h: H(el), mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, pb: s.paddingBottom,
      txt: t(el, 24),
    });
  }

  return {
    docH: r(document.documentElement.scrollHeight),
    cabecera: cab ? { y: Y(cab), h: H(cab), position: csCab.position, enFlujo: csCab.position !== "absolute" && csCab.position !== "fixed" } : null,
    contenedor: {
      via,
      tag: contenedor.tagName.toLowerCase(),
      clase: (contenedor.className || "").toString().slice(0, 60),
      y: Y(contenedor), h: H(contenedor),
      pt: csCont.paddingTop, pb: csCont.paddingBottom, mt: csCont.marginTop, mb: csCont.marginBottom,
    },
    pie: pie ? { y: Y(pie), h: H(pie) } : null,
    cadena,
    despuesDelContenedor,
    nHijos: hijos.length,
    nSecciones: hijos.filter((h) => h.esSeccion).length,
    hijos,
    // D3 al nivel correcto: del final del ÚLTIMO HIJO EN FLUJO al pie, no del
    // final de la última SECCIÓN — que es lo que medía `c1-localiza` y por eso
    // no podía ver si en medio había un nodo sin contar.
    entreUltimoHijoYPie: pie && hijos.length ? r(Y(pie) - (hijos.at(-1).y + hijos.at(-1).h)) : null,
  };
};

const LISTA = SOLO ? PARES.filter(([f]) => f.toUpperCase().includes(SOLO.toUpperCase())) : PARES;
if (LISTA.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna familia — es un filtro equivocado, no una corrida limpia.`);
  process.exit(2);
}

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), solo: SOLO ?? null }, familias: {} };
let muertas = 0;

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "d123-flujo", unidad: "páginas (2 por unidad: los dos lados)", minimo: (LISTA.length) * 2, porPaginas: true });

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
    if (o.ausente || c.ausente) { muertas++; console.log(`\n█ ${fam} @${width}\n   ✗ AUSENTE orig:${o.motivo ?? "ok"} clon:${c.motivo ?? "ok"}`); continue; }

    const pinta = (lado, x) => {
      console.log(`   ${lado}  docH ${x.docH} · cabecera y=${x.cabecera?.y} h=${x.cabecera?.h} (${x.cabecera?.position}${x.cabecera?.enFlujo ? "" : ", FUERA DE FLUJO"}) · contenedor <${x.contenedor.tag}> (via ${x.contenedor.via}) y=${x.contenedor.y} h=${x.contenedor.h} pt=${x.contenedor.pt} pb=${x.contenedor.pb} · pie y=${x.pie?.y}`);
      console.log(`         ${x.nHijos} hijos en flujo, ${x.nSecciones} casan como sección · último→pie ${x.entreUltimoHijoYPie}`);
      let prev = null;
      for (const h of x.hijos) {
        const hueco = prev ? +(h.y - (prev.y + prev.h)).toFixed(2) : null;
        if (hueco !== null && Math.abs(hueco) > 0.01) console.log(`           · · hueco ${String(hueco).padStart(8)}`);
        console.log(`           ${h.esSeccion ? "S" : "·"} ${h.tag.padEnd(7)} y=${String(h.y).padStart(8)} h=${String(h.h).padStart(8)} mt=${h.mt.padStart(7)} mb=${h.mb.padStart(7)} | ${h.clase.padEnd(38)} | ${h.txt}`);
        prev = h;
      }
    };
    console.log(`\n█ ${fam}  @${width}    docH Δ ${+(c.docH - o.docH).toFixed(2)}`);
    pinta("ORIG", o);
    pinta("CLON", c);
  } catch (e) {
    muertas++;
    salida.familias[fam] = { error: String(e).slice(0, 200) };
    console.log(`\n█ ${fam} @${width}\n   ✗ ERROR ${String(e).slice(0, 140)}`);
  }
}
await browser.close();
w(env("SALIDA") || `medidas/d123-flujo-${width}${SOLO ? `-solo-${SOLO.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}.json`, salida);

const muertos = censo.informe(`@${width}`);
if (muertas) console.error(`\n❌ ${muertas} familia(s) no se pudieron medir — NO son «sin diferencia».`);
const fallos = muertos + muertas;
console.log(`\n${fallos === 0 ? "✅" : "❌"} d123-flujo @${width} · ${LISTA.length - muertas}/${LISTA.length} familias · ${muertos} selector(es) muerto(s)\n   ⚠ Enumera; NO clasifica. Un hueco con un nodo dentro es PARTICIÓN, no defecto.`);
process.exit(fallos === 0 ? 0 : 2);
