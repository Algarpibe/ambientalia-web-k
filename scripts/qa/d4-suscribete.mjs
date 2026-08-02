/**
 * D4 · EL BLOQUE «¡Suscríbete!» — la 3.ª instancia de LA FAMILIA DE CALIBRACIÓN
 * Uso: npm run qa:d4-sus -- [ancho]        SABOTAJE=1 → test en negativo
 *
 * Es el residuo ENTERO de `footer-links`: de las cinco columnas del pie, cuatro
 * cuadran al céntimo en las tres presentaciones y todo lo que queda vive en
 * EMPRESA, la única con el botón. Sus márgenes (`mt 16 · mb 46 · pb 3.1`) están
 * cableados con el valor de SOFTWARE: **−0.01 ahí y +25.1 en catálogo** (@390).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ POR QUÉ ESTA SONDA EXISTE Y LAS DOS ANTERIORES NO SIRVIERON
 *
 * Dos intentos de medir esta caja dieron **nodos equivocados**: el lado del clon
 * casaba la rejilla entera (28 enlaces). La causa no es un descuido, es la que
 * `CLAUDE.md` §sondas nombra: **para identificar un componente, el literal de
 * `className` no discrimina** — las clases son tokens del tema y se repiten por
 * diseño. Y `.et_pb_column`, que sí identifica la columna en el original, **no
 * existe en el clon**, así que cualquier `closest()` sube hasta la rejilla.
 *
 * Aquí la identidad es **semántica y la misma en los dos lados**:
 *   1. el ANCLA se busca por su TEXTO (`¡Suscríbete!`) — ningún selector;
 *   2. la COLUMNA es `.et_pb_column` en el original y `[data-kunak=footer-col]`
 *      en el clon, un marcador puesto para esto (no es estilo);
 *   3. lo demás se DERIVA de esos dos, no se vuelve a seleccionar.
 *
 * Y se mide **por composición**, no por total: un total de columna es un
 * contenedor con holgura y absorbe dos errores de signo opuesto (regla del
 * NIVEL). Las cuatro piezas que suman el alto de la columna EMPRESA son
 *
 *      título + ul + hueco ANTES + caja del BOTÓN + hueco DESPUÉS
 *
 * y la sonda las devuelve las cinco por separado, en los dos lados. Un Δ en el
 * total sin su descomposición no se puede cablear: sería otra vez el `+26.29 sin
 * atribuir` que esta sonda viene a atribuir.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { Censo, env, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
const SABOTAJE = !!process.env.SABOTAJE;
const SOLO = env("SOLO");

/** Una ruta por PRESENTACIÓN del pie, que es el eje del que habla el defecto. */
const RUTAS = [
  ["ancha · A·blog", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/", "/todas-nuestras-soluciones-en-el-iotswc"],
  ["ancha · SECTOR", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/", "/sectores/calidad-del-aire-en-las-ciudades"],
  ["estrecha · SOFTWARE", "https://kunakair.com/es/kunak-api/", "/kunak-api"],
  ["estrechaPad · CATÁLOGO", "https://kunakair.com/es/accesorios/", "/accesorios"],
  ["estrechaPad · PRODUCTO", "https://kunakair.com/es/monitor-calidad-aire/", "/monitor-calidad-aire"],
];

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const R = (el) => {
    const b = el.getBoundingClientRect();
    return { y: r(b.y + window.scrollY), h: r(b.height), w: r(b.width), bottom: r(b.y + window.scrollY + b.height) };
  };
  const caja = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      ...R(el),
      mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom,
      fs: cs.fontSize, lh: cs.lineHeight,
    };
  };

  // Test en negativo: un selector que no casa en NINGUNA página sale por error.
  if (sabotaje) __q(".d4sus-selector-que-no-existe");

  const esOriginal = !!__q(".et_pb_section");
  const pie = __q(esOriginal ? "footer.et-l--footer, #main-footer" : "footer");
  if (!pie) return { ausente: true, motivo: "sin pie" };

  /* ── 1 · el ANCLA, por TEXTO y por ROL ─────────────────────────────────────
   * Ningún selector de clase interviene: «¡Suscríbete!» significa lo mismo en
   * los dos lados, un `class` no.
   *
   * ⚠ Dos cosas que la 1.ª versión de esta sonda dio por supuestas y el HTML
   * servido desmintió — las dos habrían dado `0 anclas`, o sea un AUSENTE que
   * parece «no hay bloque» cuando lo que no hay es la suposición:
   *
   * (a) **En el original NO es un `<a>`**: es
   *     `<span class="et_pb_button … kunak-obfuscated-link" role="link"
   *      tabindex="0" data-url="<base64>">`. El destino va ofuscado en base64 y
   *     lo resuelve JS. Por eso la identidad es *rol de enlace*, no etiqueta.
   *
   * (b) **Hay UNO POR IDIOMA en el DOM** (`ocultar-en` · `ocultar-es` ·
   *     `ocultar-fr`…), todos servidos y todos menos uno ocultos por CSS. Así
   *     que «cuántos casan» y «cuántos se ven» son preguntas distintas: se
   *     cuentan las dos y se mide **el visible**. Contar sin mirar la
   *     visibilidad es el pleno de la regla 4 —un patrón que casa de más—, y
   *     habría medido una caja de alto 0. */
  const esAncla = (el) => el.tagName === "A" || el.getAttribute("role") === "link";
  const candidatos = [...pie.querySelectorAll("a, [role='link']")].filter(
    (el) => esAncla(el) && /suscr[íi]bete/i.test((el.textContent || "").replace(/\s+/g, " ").trim()),
  );
  const visibles = candidatos.filter((el) => el.getBoundingClientRect().height > 0 && getComputedStyle(el).display !== "none");
  if (visibles.length !== 1)
    return { ausente: true, motivo: `${candidatos.length} candidatos «¡Suscríbete!», ${visibles.length} visibles` };
  const a = visibles[0];

  /* ── 2 · la COLUMNA, con su marcador por lado y diciendo CUÁL ─────────────
   * El clon no tiene `.et_pb_column`; sin el marcador `data-kunak`, `closest()`
   * sube hasta la rejilla y mide 5 columnas como si fueran una. Es el fallo que
   * invalidó los dos intentos anteriores, y por eso `via` va en la salida. */
  const selCol = esOriginal ? ".et_pb_column" : "[data-kunak='footer-col']";
  const col = a.closest(selCol);
  if (!col) return { ausente: true, motivo: `sin columna (${selCol})` };

  /* ── 3 · lo demás, DERIVADO del ancla y de la columna ─────────────────────── */
  const wrapper = a.parentElement === col ? null : a.parentElement;
  const uls = [...col.querySelectorAll("ul")];
  const ul = uls.length ? uls[uls.length - 1] : null;
  const titulos = [...col.children].filter((e) => e !== wrapper && e !== a && !e.contains(a));

  const cA = caja(a), cCol = caja(col), cUl = caja(ul), cW = caja(wrapper);

  /* ── El ALTO DE CONTENIDO de la columna, que NO es su alto de caja ─────────
   * ⚠ Corregido 2026-08-02, con el 1440 ya medido: **la columna del clon es un
   * ítem de rejilla y por defecto va `stretch`**, o sea que su alto es el de la
   * columna más alta del pie, no el suyo. La del original es un bloque de Divi y
   * sí vale lo que ocupa su contenido. Comparar `col.h` a 1440 es comparar dos
   * cosas distintas —la clase C7— y da Δ +51 y +83 que no son defecto: son el
   * sobrante del estirado. A 390 no pasa porque la rejilla va a una columna.
   *
   * Lo que sí es propiedad de este bloque es dónde acaba su CONTENIDO: el borde
   * inferior de la caja de margen del último hijo en flujo. */
  const enFlujo = [...col.children].filter((e) => getComputedStyle(e).display !== "none");
  const finContenido = enFlujo.length
    ? Math.max(...enFlujo.map((e) => e.getBoundingClientRect().bottom + window.scrollY + parseFloat(getComputedStyle(e).marginBottom || 0)))
    : null;

  /* ── La FILA y sus CINCO columnas ──────────────────────────────────────────
   * Sin esto el arreglo se cablea a ciegas. A 390 las columnas apilan y la fila
   * es su SUMA: cada píxel de EMPRESA entra entero en `footer-links`. A 1440 van
   * en rejilla y la fila es el MÁXIMO: EMPRESA solo manda si es la más alta, y
   * si no lo es, su error está TAPADO por la holgura de la columna mayor —
   * exactamente el catálogo del NIVEL. Arreglar EMPRESA a 390 puede por tanto
   * convertirla en la más alta a 1440 y mover la fila allí donde no se tocaba.
   * Se mide antes, no se descubre después. */
  const filaCols = [...pie.querySelectorAll(selCol)].filter((c) => c.parentElement === col.parentElement);
  const contenidoDe = (c) => {
    const hijos = [...c.children].filter((e) => getComputedStyle(e).display !== "none");
    if (!hijos.length) return null;
    const fin = Math.max(...hijos.map((e) => e.getBoundingClientRect().bottom + window.scrollY + parseFloat(getComputedStyle(e).marginBottom || 0)));
    return r(fin - (c.getBoundingClientRect().y + window.scrollY));
  };
  const filaEl = col.parentElement;
  const csFila = filaEl ? getComputedStyle(filaEl) : null;

  return {
    via: { col: esOriginal ? "et_pb_column" : "data-kunak", nColsPie: __qa(selCol, pie).length },
    fila: filaEl
      ? {
          ...R(filaEl),
          pt: csFila.paddingTop, pb: csFila.paddingBottom,
          bt: csFila.borderTopWidth, bb: csFila.borderBottomWidth,
          boxSizing: csFila.boxSizing,
          nCols: filaCols.length,
          colsCaja: filaCols.map((c) => r(c.getBoundingClientRect().height)),
          colsContenido: filaCols.map(contenidoDe),
          iEmpresa: filaCols.indexOf(col),
        }
      : null,
    // Control de que la columna es UNA y no la rejilla: si aquí salen 28
    // enlaces, la sonda está midiendo lo que no es (el fallo de los 2 intentos).
    control: {
      nEnlacesCol: col.querySelectorAll("a[href]").length,
      nUls: uls.length,
      // Cuántos hermanos de idioma trae el DOM y cuántos se ven. En el original
      // son varios y uno visible; en el clon, uno y uno.
      nCandidatos: candidatos.length,
      tagAncla: a.tagName.toLowerCase() + (a.getAttribute("role") ? `[role=${a.getAttribute("role")}]` : ""),
      // Los hermanos ocultos ocupan sitio en el árbol pero no en el flujo: se
      // dice cuánto miden para que no se lea su 0 como si no estuvieran.
      hOcultos: candidatos.filter((el) => el !== a).map((el) => r(el.getBoundingClientRect().height)),
    },
    col: cCol,
    // `altoContenido` es el que se adjudica; `col.h` queda en la salida solo
    // para poder exhibir la diferencia entre los dos y no repetir el error.
    altoContenido: finContenido != null && cCol ? r(finContenido - cCol.y) : null,
    estirada: finContenido != null && cCol ? r(cCol.bottom - finContenido) : null,
    // ── La COMPOSICIÓN: cinco piezas que suman el alto de la columna ─────────
    piezas: {
      // Todo lo que va antes del ul (título del widget, y en el original puede
      // haber más de un widget): se da como bloque y como lista.
      antesDelUl: titulos.map(caja),
      ul: cUl,
      // hueco ANTES: del final del ul al borde superior de la caja del botón.
      // Es donde vive el `mt 16` cableado con el valor de software.
      gapAntes: cUl && cA ? r(cA.y - cUl.bottom) : null,
      boton: cA,
      wrapper: cW,
      // hueco DESPUÉS: del final del botón al final del CONTENIDO de la columna.
      // Aquí vive el `mb 46`. A 390 las columnas apilan, así que este hueco entra
      // ENTERO en el alto de `footer-links` — que es por qué el defecto se ve ahí.
      // ⚠ Contra `finContenido`, no contra `col.bottom`: a 1440 el borde de la
      // caja del clon es el de la columna más alta del pie (ver `estirada`).
      gapDespues: cA && finContenido != null ? r(finContenido - cA.bottom) : null,
      gapDespuesCaja: cA && cCol ? r(cCol.bottom - cA.bottom) : null,
    },
  };
};

const LISTA = SOLO ? RUTAS.filter(([f]) => f.toUpperCase().includes(SOLO.toUpperCase())) : RUTAS;
if (LISTA.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna presentación — es un filtro equivocado, no una corrida limpia.`);
  process.exit(2);
}

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), solo: SOLO ?? null }, formas: {} };
let muertas = 0;

const num = (v, n = 8) => String(v ?? "—").padStart(n);

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
    salida.formas[fam] = { orig: o, clon: c };
    if (o.ausente || c.ausente) {
      muertas++;
      console.log(`\n█ ${fam}  @${width}\n   ✗ AUSENTE  orig:${o.motivo ?? "ok"}  clon:${c.motivo ?? "ok"}`);
      continue;
    }
    const d = (x, y) => (x == null || y == null ? "—" : String(+(y - x).toFixed(2)).padStart(9));
    console.log(`\n█ ${fam}  @${width}   (col via orig=${o.via.col} · clon=${c.via.col};  enlaces en la col: ${o.control.nEnlacesCol} / ${c.control.nEnlacesCol})`);
    console.log(`   ${"".padEnd(12)} ${"orig".padStart(8)} ${"clon".padStart(8)} ${"Δ".padStart(9)}`);
    const fila = (et, ov, cv) => console.log(`   ${et.padEnd(12)} ${num(ov)} ${num(cv)} ${d(ov, cv)}`);
    if (o.fila && c.fila) {
      fila("FILA h", o.fila.h, c.fila.h);
      console.log(`   cols caja  orig [${o.fila.colsCaja.join(", ")}]  (EMPRESA i=${o.fila.iEmpresa}, pt=${o.fila.pt} pb=${o.fila.pb})`);
      console.log(`              clon [${c.fila.colsCaja.join(", ")}]  (EMPRESA i=${c.fila.iEmpresa}, pt=${c.fila.pt} pb=${c.fila.pb})`);
      console.log(`   cols cont. orig [${o.fila.colsContenido.join(", ")}]\n              clon [${c.fila.colsContenido.join(", ")}]`);
    }
    fila("COL contenido", o.altoContenido, c.altoContenido);
    fila("  (caja)", o.col.h, c.col.h);
    if (o.estirada > 0.5 || c.estirada > 0.5)
      console.log(`   ⚠ sobrante de ESTIRADO (no es defecto): orig ${o.estirada} · clon ${c.estirada} — se adjudica por CONTENIDO`);
    fila("ul h", o.piezas.ul?.h, c.piezas.ul?.h);
    fila("gapAntes", o.piezas.gapAntes, c.piezas.gapAntes);
    fila("botón h", o.piezas.boton.h, c.piezas.boton.h);
    fila("gapDespués", o.piezas.gapDespues, c.piezas.gapDespues);
    console.log(`   botón  orig pt=${o.piezas.boton.pt} pb=${o.piezas.boton.pb} fs=${o.piezas.boton.fs} lh=${o.piezas.boton.lh}`);
    console.log(`          clon pt=${c.piezas.boton.pt} pb=${c.piezas.boton.pb} fs=${c.piezas.boton.fs} lh=${c.piezas.boton.lh}`);
    if (o.piezas.wrapper || c.piezas.wrapper)
      console.log(`   wrapper orig ${o.piezas.wrapper ? `h=${o.piezas.wrapper.h} mt=${o.piezas.wrapper.mt} mb=${o.piezas.wrapper.mb}` : "— (el <a> cuelga de la columna)"}\n           clon ${c.piezas.wrapper ? `h=${c.piezas.wrapper.h} mt=${c.piezas.wrapper.mt} mb=${c.piezas.wrapper.mb}` : "—"}`);
  } catch (e) {
    muertas++;
    salida.formas[fam] = { error: String(e).slice(0, 200) };
    console.log(`\n█ ${fam}  @${width}\n   ✗ ERROR ${String(e).slice(0, 140)}`);
  }
}
await browser.close();
w(env("SALIDA") || `medidas/d4-suscribete-${width}${SOLO ? `-solo-${SOLO.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}.json`, salida);

const muertos = censo.informe(`@${width}`);
if (muertas) console.error(`\n❌ ${muertas} forma(s) no se pudieron medir — NO son «sin diferencia».`);
const fallos = muertos + muertas;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} d4-suscribete @${width}${SOLO ? ` (SOLO=${SOLO})` : ""} · ${LISTA.length - muertas}/${LISTA.length} formas medidas · ${muertos} selector(es) muerto(s)\n` +
    `   ⚠ Esto NO adjudica por sí solo: el Δ de la columna se lee CONTRA EL ORIGINAL y por PIEZAS.`,
);
process.exit(fallos === 0 ? 0 : 2);
