/**
 * LA BARRA LATERAL, DE DOS LADOS Y WIDGET A WIDGET — `L1` y `L2` contra el
 * original.
 * Uso: node scripts/qa/barra-cmp.mjs [1440|390]   (npm run qa:barra-cmp)
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * §UN ARQUETIPO NUEVO NO HEREDA COBERTURA. La barra lateral la sirven **tres
 * formas** —`L1-blog`, `L1-etiqueta`, `L2-glosario`— y **ninguna** se ha
 * comparado nunca contra el original a nivel de widget. Lo que había:
 *
 * | instrumento | qué mide | por qué no basta |
 * |---|---|---|
 * | `qa:lh-barra` | el MARCADO del corpus: 4 ids, 1 firma, 80 documentos | declara de sí misma *«no mide el píxel»* — es de UN lado |
 * | `lh-espejo-{1440,390}` | el original, en la unidad PÁGINA | **no descompone la barra**: 0 apariciones de `search-6`, `custom_html`, `widgettitle` |
 * | `qa:lh-cmp` | clon vs original, ejes del listado | la barra entra como `contenedorTema`, o sea **al nivel que absorbe** |
 *
 * De ahí el `−75.80 @390 · Δ0 @1440` de la ficha de la 88.ª: un número **del
 * contenedor**, con el reparto del CLON medido widget a widget y el del
 * ORIGINAL sin medir. Esta sonda mide el lado que faltaba.
 *
 * ── El nivel al que mide, y por qué ese y no otro ─────────────────────────
 * §La causa común: se mide **el elemento donde vive la propiedad**. Un alto de
 * fila tiene la columna hermana absorbiendo; un alto de barra tiene sus cuatro
 * widgets; un alto de widget tiene su `h4` y su caja. Así que se baja hasta el
 * widget **y hasta el botón**, que es donde está la regla que se sospecha sin
 * transcribir.
 *
 * ⚠ Y se mide el ELEMENTO de la barra, no su fila. El `Δ0 @1440` de la ficha
 * es `#left-area` (968.91) tapando a `#sidebar` (350.39): dos cosas distintas
 * con el mismo número encima.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas` con la unidad **PAR** (`forma·camino`) y el mínimo
 *     **DERIVADO DE LA FUENTE ENTERA**, no del subconjunto que la corrida mire:
 *     el nº de widgets sale de la congelada `lh-barra.json` (fuente
 *     independiente, que no se toca aquí) y el nº de formas del catálogo. Un
 *     sabotaje que encoja el dominio **no puede mover el mínimo con él**
 *     (§regla 17), y por eso `dominio-encogido` es uno de los casos;
 * 2 · `Censo` **POR FORMA** con sus parciales declarados: un selector que casa
 *     en unas formas y en otras no no es ni el cero ni el pleno, y aquí los
 *     parciales son legítimos y conocidos —el envoltorio de `L1` no existe en
 *     `L2` y al revés—, así que se DECLARAN y el resto cierra el código;
 * 3 · congela en `medidas/barra-cmp-<ancho>.json` por `w()`;
 * 4 · el **eje MIXTO se publica solo**, con su reparto ACERCAN/ALEJAN y con su
 *     cardinal, **antes** del titular (§84.ª: el titular dio «sin efecto» con
 *     +938.4 px de mejora dentro del mixto);
 * 5 · negativo `SABOTAJE=` con cinco casos, cada uno cayendo **por su motivo**.
 *
 * ── Lo que NO mide (§regla 14: con su cardinal, no como frase) ────────────
 * · **`L1-resources`: 0 de 37 documentos** — no sirve barra (`lh-barra.json`
 *   §porFamilia), y el clon ya ramifica. No hay par que comparar;
 * · **`/faqs/[slug]`: 4 rutas** — `FaqSidebar.tsx` es otro componente con otros
 *   cuatro widgets. Fuera de alcance por encargo, no por olvido;
 * · **el buscador como INTERACCIÓN** (`SP-B4`): se compara la caja, no lo que
 *   hace al enviarse;
 * · **las páginas que no entran en el catálogo**: `2 de 17` en blog, `2 de 63`
 *   en etiqueta, `2 de 8` en glosario. La firma del marcado es **una en 80
 *   documentos** (varianza 0, congelada), así que 2 por forma alcanzan para
 *   detectar varianza — pero eso es un supuesto sobre el MARCADO, y el PÍXEL
 *   podría variar sin que el marcado lo haga. Se declara con su fracción.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, env, gritaSiRevienta, hoy, iniciarClon, launch, openPage, QA, settle, w } from "./lib.mjs";

gritaSiRevienta();

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = env("SABOTAJE", "");
const { base: CLON, parar: pararClon } = await iniciarClon();

/* ── El catálogo. Dos páginas por forma: la primera y una intermedia. ────── */
const CATALOGO = [
  ["L1-blog", "/es/blog/", "/blog"],
  ["L1-blog", "/es/blog/page/2/", "/blog/page/2"],
  ["L1-etiqueta", "/es/etiqueta/calidad-del-aire/", "/etiqueta/calidad-del-aire"],
  ["L1-etiqueta", "/es/etiqueta/calidad-del-aire/page/2/", "/etiqueta/calidad-del-aire/page/2"],
  ["L2-glosario", "/es/glosario/", "/glosario"],
  ["L2-glosario", "/es/glosario/page/2/", "/glosario/page/2"],
];

/* ── El mínimo, DERIVADO de una fuente que el sabotaje no toca ────────────
 * §regla 17: si el mínimo se deriva de lo mismo que el sabotaje anula, el
 * sabotaje MUEVE LA PORTERÍA y el caso nunca prueba lo que promete. El nº de
 * widgets sale de la congelada de `lh-barra`, que esta sonda no escribe; el nº
 * de páginas, del catálogo **literal de arriba leído del fuente**, no de la
 * variable que el sabotaje puede vaciar. */
const FIRMA = JSON.parse(readFileSync(join(QA, "medidas", "lh-barra.json"), "utf8"));
const WIDGETS = FIRMA.barraLateral.firmas[0].widgets;
if (!Array.isArray(WIDGETS) || WIDGETS.length < 1)
  throw new Error("barra-cmp: `lh-barra.json` no trae la firma de widgets. Sin ella no hay mínimo derivable.");

/** Piezas por página: el contenedor + un widget por id + el botón. */
const N_ELEMENTOS = 1 + WIDGETS.length + 1;
/** Páginas del catálogo, contadas sobre el FUENTE para que vaciar la variable no baje el listón. */
const N_PAGINAS_FUENTE = (readFileSync(new URL(import.meta.url), "utf8").match(/^ {2}\["L[12]-/gm) || []).length;
/**
 * ⚠ La unidad es **la PIEZA LEÍDA EN LOS DOS LADOS**, no el camino comparado, y
 * la diferencia decide si el contrato discrimina. Un camino es un campo de una
 * pieza: con ~14 campos por pieza, un mínimo en caminos se cumple leyendo **3
 * piezas de 36** y `lector-ciego` se colaría por debajo. En piezas, no.
 *
 * Y una pieza sólo cuenta cuando **los dos lados** la devuelven: «hay barra
 * pero no supe leer su botón» sale ROJO en vez de callado.
 */
const ev = new Evaluadas({
  unidad: "piezas leídas en los DOS lados (página·pieza)",
  minimo: N_PAGINAS_FUENTE * N_ELEMENTOS,
  nombre: `barra-cmp @${width}`,
});

/* ── El lector. Corre en la página; devuelve la caja de cada pieza. ─────── */
const LECTOR = (widgets, sab) => {
  const r = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);
  const caja = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      h: r(b.height),
      w: r(b.width),
      mt: cs.marginTop,
      mb: cs.marginBottom,
      pt: cs.paddingTop,
      pb: cs.paddingBottom,
      pl: cs.paddingLeft,
      bt: cs.borderTopWidth,
      bb: cs.borderBottomWidth,
      bl: cs.borderLeftWidth,
      fs: cs.fontSize,
      lh: cs.lineHeight,
      disp: cs.display,
      float: cs.cssFloat,
    };
  };
  /* El contenedor: `L1` lo sirve como módulo Divi y `L2` como `#sidebar`. Los
   * dos selectores se piden SIEMPRE en las dos formas — así el censo por forma
   * puede publicar el parcial en vez de que un `||` lo esconda. */
  const envL1 = window.__q(".et_pb_widget_area");
  const envL2 = window.__q("#sidebar");
  /* `lector-ciego` anula el arreglo ENTERO: sin contenedor no hay barra ni
   * widgets, que es lo que este caso viene a probar. */
  const cont = sab === "lector-ciego" ? null : envL1 || envL2;
  const out = {
    forma: envL1 ? "envoltorio-L1" : envL2 ? "envoltorio-L2" : "SIN-ENVOLTORIO",
    contenedor: caja(cont),
    widgets: {},
    boton: null,
  };
  for (const id of widgets) {
    const el = cont ? cont.querySelector("#" + CSS.escape(id)) : null;
    out.widgets[id] = caja(el);
    /* El `h4` del widget, que es donde vive el ritmo del titular. */
    const h4 = el ? el.querySelector(".widgettitle") : null;
    if (h4) out.widgets[id + "·titulo"] = caja(h4);
  }
  const b = cont ? cont.querySelector(".et_pb_button") : null;
  out.boton = caja(b);
  return out;
};

/* ── Aplanado a CAMINOS comparables ─────────────────────────────────────── */
function aplana(o, pre = "", acc = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const c = pre ? `${pre}.${k}` : k;
    if (v && typeof v === "object") aplana(v, c, acc);
    else acc[c] = v;
  }
  return acc;
}

/* ── Los ejes. `mixta` es el que NO lee como defecto y por eso se publica solo.
 * `contenedor.h` depende de sus cuatro hijos a la vez, así que un Δ suyo mezcla
 * causas: es el nivel de arriba de los widgets (§La causa común). ─────────── */
const ejeDe = (camino) => {
  if (/^forma$/.test(camino)) return "identidad";
  if (/^contenedor\./.test(camino)) return "mixta";
  if (/\.(tag|disp|float)$/.test(camino)) return "texto";
  if (/\.(h|w)$/.test(camino)) return "geometria";
  return "caja";
};

const num = (v) => {
  if (typeof v === "number") return v;
  const m = /^(-?[\d.]+)px$/.exec(String(v || ""));
  return m ? Number(m[1]) : null;
};

/* ── Corrida ────────────────────────────────────────────────────────────── */
const censo = new Censo();
const browser = await launch();
const salida = {
  meta: {
    fecha: hoy(),
    que: "la BARRA LATERAL widget a widget, clon contra original — las 3 formas que la sirven",
    ancho: width,
    ladoOriginal: "kunakair.com VIVO (el espejo NO descompone la barra: 0 apariciones de search-6/custom_html/widgettitle)",
    ladoClon: CLON,
    sabotaje: SABOTAJE || null,
    unidad: "el PAR (forma·página·camino) — no la ruta, no la forma",
    minimoDerivadoDe: `lh-barra.json (${WIDGETS.length} widgets) × ${N_PAGINAS_FUENTE} páginas del fuente`,
    noMide: [
      `L1-resources: 0 de 37 documentos — no sirve barra (lh-barra.json §porFamilia); el clon ya ramifica`,
      `/faqs/[slug]: 4 rutas — FaqSidebar.tsx es OTRO componente con otros 4 widgets, fuera de alcance por encargo`,
      `el buscador como INTERACCIÓN (SP-B4): se compara la caja, no lo que hace al enviarse`,
      `las páginas fuera del catálogo: 2 de 17 en blog · 2 de 63 en etiqueta · 2 de 8 en glosario`,
      `el blanco entre widgets: el original lo sirve (\\n\\t\\t\\t\\t en blog, \\n\\t\\t en glosario) y el clon no emite ninguno — con float:left/none no debería renderizar, pero NO está medido`,
    ],
  },
  paginas: {},
  ejes: {},
  mixto: { unidad: "el PAR", pares: [], suma: 0, cardinal: 0 },
  resumen: {},
};

let pares = 0;
let distintos = 0;

for (const [forma, rutaOrig, rutaClon] of CATALOGO) {
  /* `dominio-encogido`: mide UNA sola forma. El mínimo NO baja con él —viene de
   * `lh-barra.json` y del fuente—, así que el caso ejercita lo que promete. */
  if (SABOTAJE === "dominio-encogido" && forma !== "L1-blog") continue;

  const clave = `${forma}::${rutaClon}`;
  censo.grupo(forma);

  const lee = async (url) => {
    const page = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, WIDGETS, SABOTAJE);
    await page.close();
    return datos;
  };

  /* `sin-original`: se salta el lado del original. Una sonda de dos lados a la
   * que le falta un lado NO puede salir verde. */
  const orig = SABOTAJE === "sin-original" ? null : await lee(`https://kunakair.com${rutaOrig}`);
  const clon = await lee(`${CLON}${rutaClon}`);

  if (!orig) {
    salida.paginas[clave] = { error: "sin lado del original" };
    continue;
  }

  const A = aplana(orig);
  let B = aplana(clon);
  /* `sin-diferencias`: el clon devuelve los valores del original. Prueba que la
   * comparación COMPARA — si con esto siguen saliendo diferencias, el
   * comparador está inventándolas. */
  if (SABOTAJE === "sin-diferencias") B = { ...A };

  /* Las PIEZAS leídas en los dos lados — la unidad del contrato. Una pieza que
   * un lado no devuelve NO cuenta, que es lo que hace que `lector-ciego` caiga
   * por el mínimo y no por casualidad. */
  const PIEZAS = ["contenedor", ...WIDGETS.map((id) => `widgets.${id}`), "boton"];
  for (const p of PIEZAS) {
    const enA = A[`${p}.h`] !== undefined;
    const enB = B[`${p}.h`] !== undefined;
    if (enA && enB) ev.ok();
    else console.log(`     ⚠ pieza NO leída en los dos lados: ${p} (orig=${enA} clon=${enB})`);
  }

  const difs = [];
  for (const camino of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const eje = ejeDe(camino);
    if (eje === "identidad") continue;
    const a = A[camino];
    const b = B[camino];
    pares++;
    if (String(a) === String(b)) continue;
    distintos++;
    const na = num(a);
    const nb = num(b);
    const d = na !== null && nb !== null ? Math.round((nb - na) * 100) / 100 : null;
    difs.push({ camino, eje, orig: a, clon: b, delta: d });
    salida.ejes[eje] = (salida.ejes[eje] || 0) + 1;
    if (eje === "mixta" && d !== null) {
      salida.mixto.pares.push({ par: `${clave} ${camino}`, orig: na, clon: nb, distancia: Math.abs(d), delta: d });
      salida.mixto.suma += Math.abs(d);
      salida.mixto.cardinal++;
    }
  }
  salida.paginas[clave] = { forma, rutaOrig, rutaClon, envoltorio: orig.forma, distintos: difs.length, diferencias: difs };
  console.log(`  ${clave.padEnd(46)} envoltorio=${String(orig.forma).padEnd(14)} pares distintos: ${difs.length}`);
}

await browser.close();
await pararClon();

/* ── Censo por forma: los parciales LEGÍTIMOS se declaran, el resto cierra ─
 * `.et_pb_widget_area` sólo existe en `L1` y `#sidebar` sólo en `L2`. Son
 * parciales de verdad y por eso van nombrados: sin declararlos, la guarda los
 * leería como selector medio muerto; declarándolos a ciegas, un selector que se
 * muriera de verdad pasaría. */
const PARCIALES_DECLARADOS = [".et_pb_widget_area", "#sidebar"];
const sinDeclarar = censo.informeGrupos(PARCIALES_DECLARADOS, `@${width}`);
const muertos = censo.muertos();

/* ── EL EJE MIXTO, SOLO Y ANTES DEL TITULAR ─────────────────────────────── */
salida.mixto.pares.sort((x, y) => y.distancia - x.distancia);
salida.resumen = {
  paresComparados: pares,
  paresDistintos: distintos,
  porEje: salida.ejes,
  formasVistas: Object.keys(salida.paginas).length,
};

console.log("");
console.log(`── EJE MIXTO (lo que NO lee como defecto), a ${width} ──`);
console.log(`   cardinal: ${salida.mixto.cardinal} pares · Σ|clon−orig| = ${Math.round(salida.mixto.suma * 100) / 100}`);
for (const p of salida.mixto.pares.slice(0, 10))
  console.log(`   ${String(p.delta > 0 ? "+" + p.delta : p.delta).padStart(9)}  ${p.par}  (orig ${p.orig} → clon ${p.clon})`);
if (salida.mixto.cardinal === 0) console.log("   (ninguno — el contenedor casa en las formas medidas)");
console.log("");
console.log(`── ejes: ${JSON.stringify(salida.ejes)} · pares comparados ${pares} · distintos ${distintos}`);

w(join(QA, "medidas", `barra-cmp-${width}.json`), salida);

/* ── Veredicto. §regla 22: se cierra con el CARDINAL, no con un booleano. ── */
let fallos = 0;
if (muertos.length) {
  console.log(`\n❌ ${muertos.length} selector(es) MUERTOS: ${muertos.join(" · ")}`);
  fallos++;
}
if (sinDeclarar) fallos++;
if (distintos > 0) {
  console.log(`\n❌ ${distintos} pares DISTINTOS de ${pares} comparados — hay reparto que hacer.`);
  fallos++;
}
/* ⚠ La línea de unidades va con el numerador y el denominador EN LA MISMA
 * unidad —piezas, no caminos— y se imprime SIEMPRE, verde o roja: un verde sin
 * ella no es de este contrato, y un rojo sin ella no dice qué alcanzó a medir
 * (§regla 5ter: el recuento y el contrato son dos frases distintas). */
console.log(`✓ evaluadas ${ev.n}/${ev.minimo} piezas · ${pares} caminos comparados · ${Object.keys(salida.paginas).length} páginas`);
process.exit(fallos === 0 ? 0 : 2);
