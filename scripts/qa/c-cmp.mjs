/**
 * ORIGINAL vs CLON para las 6 rutas nuevas del grupo C, y las tres predicciones
 * que solo se pueden cobrar con las rutas ya emitidas.
 * Uso: npm run qa:c-cmp -- [ancho]      (necesita el clon servido en :3000)
 *
 *   P-C3-3 · el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed, sin
 *            construcción nueva. Se inventaría lo que el cuerpo REALMENTE trae
 *            en las 6, y se compara contra los cauces abiertos.
 *   P-C3-6 · el mapa: contenedor **330 a 1440 / 290 a 390**, **un** marcador.
 *   P-C3-7 · la FAQ entra con `titulo + cuerpo` y **no aparece ningún campo**:
 *            se comprueba que su cuerpo no trae ninguna de las piezas del caso.
 *
 * ── La base de lectura es el `h1` ──────────────────────────────────────────
 * Protocolo del README §2: se compara el `h1` **antes que nada** y, si difiere,
 * ese desplazamiento se resta de todo lo demás. Si no, un solo defecto de
 * cabecera se lee como veinte.
 *
 * ── Un canal de verdad ─────────────────────────────────────────────────────
 * Lo que imprime y lo que cuenta no discrepan: **cada predicción cierra el
 * código de salida**, y el Δ de alturas se informa aparte porque el original es
 * un sitio vivo y su suelo de ruido no es cero en todas las regiones.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, env, hoy, launch, openPage, settle, w, enApp} from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
/**
 * Dos sabotajes DISTINTOS, y separados a propósito: si los dos se dispararan
 * con la misma variable, un exit≠0 no diría cuál de las dos guardas saltó — que
 * es justo lo que un test en negativo tiene que distinguir.
 *   SABOTAJE=1|ruta   → una ruta inventada  ⇒ tiene que salir por ERROR
 *   SABOTAJE=cauces   → `p` fuera de cauces ⇒ P-C3-3 tiene que salir REFUTADA
 */
const SABOTAJE = process.env.SABOTAJE === "1" || process.env.SABOTAJE === "ruta";
/** `SOLO=faq` acota por forma o por ruta: probar una guarda no puede costar 62 cargas. */
const SOLO = env("SOLO");

/* ── Las rutas salen del BUILD, no de una lista (generalizada 2026-08-01) ───
 * Nació con las 6 del grupo C cableadas a mano, y por eso las otras 25 rutas
 * emitidas **nunca tuvieron su `docH` ni su árbol comparados con el original**:
 * la auditoría de cobertura las encontró en «c», o sea vigiladas por
 * `clon-base` —clon contra clon— y por nadie más.
 *
 * Ahora deriva del manifiesto como `c-cabecera` y `enlaces`: cuando se emita
 * una ruta nueva **entra sola**, y su hueco de cobertura se cierra sin que
 * nadie tenga que acordarse. La derivación del original es mecánica —`/x` →
 * `/es/x/`— porque el clon reproduce el árbol de rutas del original.
 * ------------------------------------------------------------------------ */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ EL FALLBACK DE `formaDe` ERA UN «NO LO SÉ» DISFRAZADO DE «ES UN BLOG»
 *
 * Medido el 2026-08-09, al contar el coste de cobertura de `articulos-kb`
 * ANTES de construirlo (`PLAN-FASE-3.md` §F3-1, criterio (c)).
 *
 * Las rutas se derivan del manifiesto, así que **una familia nueva entra sola**
 * — eso está bien y es lo que esta sonda ganó en 2026-08-01. Pero la forma se
 * decidía con una cascada de `if` **terminada en `return "A-blog"`**, o sea que
 * una ruta de un arquetipo que esta sonda no conoce **no daba error: daba
 * "A-blog"**, y con él el LECTOR del blog. Resultado: anclas de blog buscadas en
 * una página que no las tiene, y **números plausibles sobre el elemento
 * equivocado**.
 *
 * Es la regla 6 en un sitio nuevo: *un valor por defecto convierte «no lo sé» en
 * «está bien»*. Y es peor que un selector muerto, porque un muerto lo caza el
 * `Censo` y esto no: los selectores del blog **existen** en el DOM del clon.
 *
 * ── El arreglo: la forma se deriva de la FAMILIA del manifiesto ───────────
 * `srcRoute` (`/faqs/[slug]`, `/[slug]`, `/recursos/[...ruta]`…) es lo que el
 * build dice que es cada ruta, no lo que esta sonda adivina del prefijo. Toda
 * familia emitida tiene que estar declarada aquí; una que no lo esté **TIRA**,
 * que es exactamente lo que hará `articulos-kb` el día que emita — y ése es el
 * aviso que su tanda necesita recibir.
 *
 * ⚠ `/[slug]` sirve DOS formas (entrada de blog y término de Kunakpedia) y las
 * dos se leen igual, así que comparten `A-blog`. Eso es una decisión medida
 * (§2.1: mismo cascarón), no el fallback de antes.
 * ═════════════════════════════════════════════════════════════════════════ */
const FORMA_POR_FAMILIA = {
  "/": "home",
  "/monitor-calidad-aire": "producto",
  "/accesorios": "catalogo",
  "/kunak-api": "software",
  "/software-de-medicion-calidad-del-aire": "software",
  "/casos-de-exito/[slug]": "caso",
  "/case-studies/[slug]": "caso",
  "/faqs/[slug]": "faq",
  "/sectores/[slug]": null, // se parte en sector/monografico por el slug, abajo
  "/recursos/[...ruta]": "A-documento",
  "/[slug]": "A-blog", // blog Y término: mismo cascarón medido (§2.1)
};

/**
 * Forma de la página. **Sin fallback**: devuelve `null` para lo que no sabe, y
 * quien llama TIRA. `familia` viene del manifiesto (`srcRoute`), no del prefijo.
 */
const formaDe = (r, familia) => {
  if (familia === "/sectores/[slug]")
    return /^\/sectores\/(monitorizacion-ambiental|monitorizacion-de-emisiones-en-petroleo)/.test(r) ? "monografico" : "sector";
  return FORMA_POR_FAMILIA[familia] ?? null;
};

const desconocidas = [];
const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => !r.startsWith("/_") && r !== "/favicon.ico")
  .sort()
  .map((r) => {
    const familia = manifiesto.routes[r]?.srcRoute || r;
    const forma = formaDe(r, familia);
    if (!forma) desconocidas.push(`${r}   (familia ${familia})`);
    return {
      clave: r,
      clon: r,
      orig: `https://kunakair.com/es${r === "/" ? "" : r}/`,
      forma,
      familia,
    };
  })
  .filter((R) => !SOLO || R.forma === SOLO || R.clave.includes(SOLO));

/* ⚠ Antes que nada: una familia emitida que esta sonda no sabe leer NO se mide
 * con el lector de otra. Es el arreglo del fallback, y su aviso está escrito
 * para la tanda que lo reciba — que será la de `articulos-kb`. */
if (desconocidas.length) {
  console.error(
    `\n❌ ${desconocidas.length} ruta(s) de una FAMILIA que esta sonda no conoce:\n` +
      desconocidas.map((d) => `     · ${d}`).join("\n") +
      `\n\n   Antes esto devolvía "A-blog" por defecto y las medía con el LECTOR del blog:\n` +
      `   anclas que sí existen en el DOM, sobre la página equivocada, y números plausibles.\n` +
      `   Un arquetipo nuevo NO hereda cobertura: declara su familia en FORMA_POR_FAMILIA\n` +
      `   y dale su LECTOR. Ese trabajo ES el coste del arquetipo, y aparece aquí a propósito.\n`,
  );
  process.exit(2);
}

if (RUTAS.length === 0) {
  console.error(SOLO ? `❌ SOLO=${SOLO} no casa con ninguna ruta — filtro equivocado, no corrida limpia.` : "❌ el manifiesto no trae rutas — corre `npm run build` antes.");
  process.exit(2);
}
// Test en negativo: una ruta inventada tiene que salir por ERROR, no por Δ0.
if (SABOTAJE) RUTAS.push({ clave: "/RUTA-INVENTADA", clon: "/RUTA-INVENTADA", orig: "https://kunakair.com/es/RUTA-INVENTADA/", forma: "faq" });

/** Formas para las que P-C3-3 fue escrita: las del grupo C y solo ésas. */
const FORMAS_C = new Set(["caso", "faq"]);

/** Lo que se lee de cada página, sea original o clon. */
const LECTOR = (forma) => {
  const r = (n) => Math.round(n * 100) / 100;
  const q = (s) => document.querySelector(s);
  const caja = (el) => (el ? { w: r(el.getBoundingClientRect().width), h: r(el.getBoundingClientRect().height) } : null);
  const y = (el) => (el ? r(el.getBoundingClientRect().y + window.scrollY) : null);
  /* ── El ámbito de las «zonas» es el GRUPO C, no las 31 rutas ──────────────
   * `.entry-content` es el contenedor del cuerpo del caso y de la FAQ. En las
   * otras 25 rutas la misma clase envuelve **otra cosa** —entre otras, las
   * tarjetas de «Artículos y Guías», que traen `<article>` y `<header>`—, así
   * que barrerlas metía en el inventario etiquetas que P-C3-3 nunca afirmó
   * nada sobre ellas y la predicción salía REFUTADA en todas las corridas.
   *
   * ⚠ Y una sonda que no puede dar verde es peor que ninguna: entrena a
   * ignorar su código de salida, que es la lección que ya se pagó con la barra
   * final de `enlaces`. El arreglo NO es bajar el listón: es medir donde la
   * afirmación aplica. Fuera del grupo C no se lee zona ninguna —lista vacía,
   * y el recuento de abajo se encarga de que «vacía» no pueda pasar por buena.
   * -------------------------------------------------------------------- */
  const enGrupoC = forma === "caso" || forma === "faq";
  const zonas = ".entry-content-need, .entry-content-solution, .entry-content-results, .entry-content";
  const etiquetas = {};
  let nodosZona = 0;
  if (enGrupoC)
    for (const z of document.querySelectorAll(zonas)) {
      nodosZona++;
      for (const el of z.querySelectorAll("*")) {
        const t = el.tagName.toLowerCase();
        etiquetas[t] = (etiquetas[t] || 0) + 1;
      }
    }
  return {
    h1y: y(q("h1")),
    h1: caja(q("h1")),
    // P-C3-6 — el ALTO sí se mide en el DOM asentado (es layout). El número de
    // marcadores NO: ver `marcadoresServidos` abajo.
    mapa: caja(q(".acf-map")),
    // P-C3-3 / P-C3-7 — el inventario del cuerpo
    etiquetas,
    // Cuántas zonas casaron: sin esto, «no encontré etiquetas» y «no miré
    // ninguna zona» dan exactamente la misma salida (regla 4 de §sondas).
    nodosZona,
    iframes: (enGrupoC ? [...document.querySelectorAll(zonas + " iframe")] : []).map((f) => {
      try { return new URL(f.getAttribute("src"), location.href).host; } catch { return "?"; }
    }),
    // piezas del CASO, para P-C3-7: en la FAQ tienen que ser 0 en los dos lados
    piezasDeCaso: {
      sobretitulo: document.querySelectorAll("p.sobretitulo, .sobretitulo").length,
      cliente: document.querySelectorAll(".case-cliente").length,
      chip: document.querySelectorAll(".case-sectores").length,
      detalles: document.querySelectorAll(".case-detalles").length,
      soluciones: document.querySelectorAll(".case-soluciones").length,
      galeria: document.querySelectorAll(".case-galeria").length,
      migas: document.querySelectorAll("ol.kunak-breadcrumbs").length,
    },
    docH: r(document.documentElement.scrollHeight),
    /* ── Árbol de secciones · UN SELECTOR POR LADO ──────────────────────────
     * Los dos cuerpos NO tienen la misma forma: el original es Divi
     * (`.et_pb_section`) y el clon emite `main > section`. Es el mismo criterio
     * que ya usa `tree-cmp` (líneas 71 y 83), y el motivo por el que no existía
     * una comparación general de árbol: no hay un selector único que valga
     * para los dos lados.
     *
     * ⚠ Por eso este eje se lee como **correspondencia estructural**, no como
     * identidad: que los números coincidan dice que el clon partió el documento
     * donde lo parte el original. Que difieran es una PREGUNTA, no un veredicto
     * — y por eso se adjudica a mano, ruta por ruta.
     *
     * ⚠⚠ Y la primera versión de esto MEDÍA UN ARTEFACTO: comparaba
     * `.et_pb_section` (original) contra `main > section, main > div` (clon) y
     * daba **31 de 31 rutas con el árbol distinto** — un pleno, que por la regla
     * del pleno ya es sospechoso. No había ni un defecto: en el original Divi
     * mete en `.et_pb_section` **la cabecera y el pie del theme builder**
     * (`…_tb_header`, `…_tb_footer`), que el clon no emite dentro de `main`.
     * Contra `esqueleto.json`: sector `{tb_header:1, tb_footer:3, propia:7}` = 11
     * contra los 7 del clon, y blog `{tb_header:1, tb_body:2, tb_footer:3}` = 6
     * contra 2. Los 7 y los 2 del clon eran **exactos**.
     *
     * O sea: dos selectores que no denotan el mismo conjunto. Se descuenta
     * cabecera y pie, y del lado del clon se quita `main > div` —que inflaba
     * caso y FAQ—. `clon-base` sí puede usar `main > div` porque compara el clon
     * consigo mismo y solo necesita ser consistente; aquí hay que ser EQUIVALENTE.
     */
    secciones: (() => {
      const divi = [...document.querySelectorAll(".et_pb_section")];
      const lista = divi.length
        ? divi.filter((s) => !/_tb_(header|footer)\b/.test(s.className))
        : [...document.querySelectorAll("main > section")];
      return lista.map((s, i) => ({
        i,
        h: r(s.getBoundingClientRect().height),
        txt: (s.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34),
      }));
    })(),
  };
};

const { browser } = await launch();
const salida = { meta: { width, fecha: hoy() }, paginas: {} };

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "c-cmp", unidad: "páginas (2 por unidad: los dos lados)", minimo: (RUTAS.length) * 2, porPaginas: true });

for (const R of RUTAS) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    // Una 404 carga bien y se deja medir: sin esta guarda la sonda publica los
    // deltas de una página de error como si fueran de la página. Ver lib.mjs.
    if (status !== 200) {
      await page.close();
      throw new Error(`HTTP ${status} en ${url}`);
    }
    await settle(page);
    const d = await page.evaluate(LECTOR, R.forma);
    await page.close();
    return d;
  };
  /**
   * ⚠ El nº de marcadores se cuenta en el **HTML SERVIDO**, no en el DOM
   * asentado. En el original, el JS de Google Maps **consume los `.marker`** al
   * inicializar el mapa, así que tras `settle()` salen **0** aunque el HTML
   * traiga 1. La primera versión los contaba en el DOM y dio «original 0 / clon
   * 1» en las tres: un informe plausible que decía justo lo contrario de la
   * verdad. Es la regla del NIVEL aplicada al TIEMPO — la propiedad vive en el
   * HTML servido, y ahí es donde se mide.
   */
  const servidos = async (url) => {
    const html = await (await fetch(url)).text();
    return (html.match(/class="marker"/g) || []).length;
  };
  try {
    salida.paginas[R.clave] = {
      // `ruta` explícita: `cobertura.mjs` la deriva de aquí en vez de tener un
      // mapa clave→ruta a mano, que es justo lo que se pudre.
      ruta: R.clon,
      forma: R.forma,
      orig: await lee(R.orig), clon: await lee(CLON + R.clon),
      // El mapa solo existe en el caso: pedir el HTML de las 31 sería 31
      // peticiones extra para contar ceros.
      marcadoresServidos:
        R.forma === "caso"
          ? { orig: await servidos(R.orig), clon: await servidos(CLON + R.clon) }
          : null,
    };
    console.log(`  ✓ ${R.clave}`);
  } catch (e) {
    // Una carga que falla NO puede quedarse en «sin datos»: sería una celda
    // vacía leída como «no hay diferencia» (regla 4 de §sondas).
    salida.paginas[R.clave] = { ruta: R.clon, forma: R.forma, error: String(e).slice(0, 200) };
    console.log(`  ✗ ${R.clave}  ERROR ${String(e).slice(0, 120)}`);
  }
}
await browser.close();

/* ───────────────────────── los veredictos ───────────────────────── */

let fallos = 0;
const vivas = Object.entries(salida.paginas).filter(([, v]) => !v.error);
const muertas = Object.entries(salida.paginas).filter(([, v]) => v.error);
const casos = vivas.filter(([, v]) => v.forma === "caso");
const faqs = vivas.filter(([, v]) => v.forma === "faq");

if (muertas.length) {
  fallos += muertas.length;
  console.log(`\n❌ ${muertas.length} ruta(s) no se pudieron medir — NO son «sin diferencia»:`);
  for (const [k, v] of muertas) console.log(`     · ${k}  ${v.error}`);
}

/* P-C3-6 · el mapa */
console.log(`\n═══ P-C3-6 · el mapa a ${width}`);
const ALTO = width <= 500 ? 290 : 330;
let malMapa = 0;
for (const [k, v] of casos) {
  const m = v.marcadoresServidos;
  if (!v.orig.mapa) {
    console.log(`  · ${k}: el ORIGINAL no lleva mapa — clon ${v.clon.mapa ? "SÍ (❌)" : "tampoco (✅)"}`);
    if (v.clon.mapa) malMapa++;
    continue;
  }
  const okAlto = v.clon.mapa?.h === ALTO && v.orig.mapa.h === ALTO;
  const okMarc = m.orig === 1 && m.clon === 1;
  if (!okAlto || !okMarc) malMapa++;
  console.log(`  ${okAlto && okMarc ? "✅" : "❌"} ${k.padEnd(16)} alto orig ${v.orig.mapa.h} · clon ${v.clon.mapa?.h ?? "—"} (esperado ${ALTO}) · marcadores servidos ${m.orig}/${m.clon}`);
}
fallos += malMapa;
console.log(`  ${malMapa === 0 ? "✅ P-C3-6 SE SOSTIENE" : "❌ P-C3-6 REFUTADA"} · ${malMapa} discrepancias`);

/* P-C3-3 · el contrato del cuerpo */
console.log(`\n═══ P-C3-3 · el cuerpo, contra los cauces abiertos`);
// §3.1 + los cauces que el esquema ya abrió. Todo lo que salga de aquí es
// «construcción nueva» y refuta.
const CAUCES = new Set(["p", "a", "strong", "b", "em", "i", "u", "sub", "sup", "br", "span", "div",
  "ul", "ol", "li", "h2", "h3", "h4", "img", "figure", "figcaption", "blockquote", "hr", "small", "mark",
  "iframe", "video", "source", "table", "thead", "tbody", "tfoot", "tr", "th", "td"]);
/* Test en negativo de ESTE veredicto: `SABOTAJE=cauces` quita `p` de los cauces
 * abiertos, así que P-C3-3 TIENE que salir REFUTADA. Sin él, acotar el ámbito
 * (arriba) podría haber dejado la predicción incapaz de fallar y no habría forma
 * de notarlo: verde por no mirar y verde por estar bien se leen igual. */
if (process.env.SABOTAJE === "cauces") CAUCES.delete("p");
const fuera = {};
const tablas = [];
/* ⚠ Solo las formas del grupo C: es de ellas de quien P-C3-3 afirma algo. Y
 * sobre `vivas`, no sobre `salida.paginas` — una ruta con error no tiene
 * `orig` y se llevaba la sonda por delante. */
const deC = vivas.filter(([, v]) => FORMAS_C.has(v.forma));
for (const [k, v] of deC) {
  for (const [t, n] of Object.entries(v.orig.etiquetas)) if (!CAUCES.has(t)) (fuera[t] ??= []).push(`${k}×${n}`);
  if (v.orig.etiquetas.table) tablas.push(k);
}
/* La guarda del ámbito acotado: acotar un selector es la forma más fácil de
 * convertir una sonda en rojo en una sonda que no mira nada. Si NINGUNA página
 * del grupo C casó una zona, o el inventario sale vacío, eso es defecto de
 * sonda y sale por error — nunca por «✅ ninguna construcción fuera». */
const zonasCasadas = deC.reduce((a, [, v]) => a + (v.orig.nodosZona || 0), 0);
const etiquetasVistas = deC.reduce((a, [, v]) => a + Object.keys(v.orig.etiquetas).length, 0);
const hosts = {};
for (const [, v] of deC) for (const h of v.orig.iframes) hosts[h] = (hosts[h] || 0) + 1;
console.log(`  · ámbito: ${deC.length} rutas del grupo C (${[...FORMAS_C].join(" · ")}) de ${vivas.length} medidas`);
console.log(`  · zonas casadas: ${zonasCasadas} · etiquetas distintas inventariadas: ${etiquetasVistas}`);
console.log(`  · tablas en el original: ${tablas.length ? tablas.join(" · ") : "ninguna"} (§3.4 sigue abierta)`);
console.log(`  · hosts de iframe: ${Object.entries(hosts).map(([h, n]) => `${h}×${n}`).join(" · ") || "ninguno"}`);
if (!deC.length || !zonasCasadas || !etiquetasVistas) {
  fallos++;
  console.log(
    `  ❌ P-C3-3 NO SE PUDO EVALUAR — ${!deC.length ? "ninguna ruta del grupo C" : !zonasCasadas ? "las zonas no casaron en ninguna" : "el inventario salió vacío"}.\n` +
      `     Eso NO es «ninguna construcción fuera de los cauces»: es que no se miró nada.`,
  );
} else if (Object.keys(fuera).length) {
  fallos++;
  console.log(`  ❌ P-C3-3 REFUTADA · etiquetas FUERA de los cauces abiertos:`);
  for (const [t, d] of Object.entries(fuera)) console.log(`       <${t}>  ${d.join(" ")}`);
} else {
  console.log(`  ✅ P-C3-3 SE SOSTIENE · ninguna construcción fuera de §3.1 + vídeo + embed + tabla`);
}

/* P-C3-7 · la FAQ no crece */
console.log(`\n═══ P-C3-7 · la FAQ no estrena campos`);
let malFaq = 0;
for (const [k, v] of faqs) {
  const dif = Object.entries(v.orig.piezasDeCaso).filter(([p, n]) => n !== v.clon.piezasDeCaso[p]);
  const conCampo = Object.entries(v.orig.piezasDeCaso).filter(([, n]) => n > 0);
  if (dif.length || conCampo.length) malFaq++;
  console.log(`  ${dif.length || conCampo.length ? "❌" : "✅"} ${k.padEnd(16)} piezas de caso en el original: ${conCampo.length ? conCampo.map(([p, n]) => `${p}=${n}`).join(" ") : "NINGUNA"}${dif.length ? ` · difieren: ${dif.map(([p]) => p).join(" ")}` : ""}`);
}
fallos += malFaq;
console.log(`  ${malFaq === 0 ? "✅ P-C3-7 SE SOSTIENE" : "❌ P-C3-7 REFUTADA"} · la FAQ entra con \`titulo + cuerpo\``);

/* ── Δ de docH, base y árbol · SE INFORMA Y SE CUENTA ──────────────────────
 * No cierra el código de salida —el original es un sitio vivo y estos Δ hay
 * que **adjudicarlos** contra él uno a uno, no cobrarlos— pero **el recuento
 * se imprime**: lo que la sonda ve y lo que dice no pueden discrepar (regla 1
 * de §sondas). Un listado sin total es exactamente cómo un descuadre impreso
 * pasa por no visto.
 */
console.log(`\n─── docH · base · árbol @${width}   (Δ = clon − original)`);
const pend = { base: [], docH: [], sec: [] };
for (const [k, v] of vivas) {
  const base = +(v.clon.h1y - v.orig.h1y).toFixed(2);
  const dDoc = +(v.clon.docH - v.orig.docH).toFixed(2);
  const nO = v.orig.secciones?.length ?? 0;
  const nC = v.clon.secciones?.length ?? 0;
  if (base !== 0) pend.base.push([k, base]);
  if (dDoc !== 0) pend.docH.push([k, dDoc]);
  if (nO !== nC) pend.sec.push([k, `${nO}→${nC}`]);
  const sig = (n) => (n > 0 ? "+" : "") + n;
  console.log(
    `  ${(base === 0 && dDoc === 0 && nO === nC ? "·" : "▲")} ${k.slice(0, 52).padEnd(54)}` +
      ` base ${sig(base).padStart(9)}   docH ${String(v.orig.docH).padStart(6)}→${String(v.clon.docH).padStart(6)} ${sig(dDoc).padStart(10)}` +
      `   sec ${String(nO).padStart(2)}→${String(nC).padStart(2)}${nO !== nC ? " ▲" : ""}`,
  );
}

w(env("SALIDA") || `medidas/c-cmp-${width}${SOLO ? `-solo-${SOLO.replace(/[^a-zA-Z0-9]+/g, "-")}` : ""}.json`, salida);

console.log(
  `\n─── PARA ADJUDICAR @${width} · ${vivas.length} rutas medidas contra el original\n` +
    `      base  ≠0 : ${String(pend.base.length).padStart(2)} de ${vivas.length}\n` +
    `      docH  ≠0 : ${String(pend.docH.length).padStart(2)} de ${vivas.length}\n` +
    `      nº sec ≠ : ${String(pend.sec.length).padStart(2)} de ${vivas.length}\n` +
    `   ⚠ Esto NO es un veredicto: un Δ solo es defecto o corrección cuando se\n` +
    `     adjudica CONTRA EL ORIGINAL (regla de petróleo). Y el árbol se compara\n` +
    `     con un selector por lado, así que un nº distinto es una PREGUNTA.`,
);

console.log(`\n${fallos === 0 ? "✅ las tres predicciones SE SOSTIENEN" : `❌ ${fallos} discrepancias`} @${width}`);
process.exit(fallos === 0 ? 0 : 1);
