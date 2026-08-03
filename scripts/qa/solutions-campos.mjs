/**
 * CPT `solutions` — el INVENTARIO DE CAMPOS por instancia, para decidir cuántas
 * colecciones es. Uso: node solutions-campos.mjs      SABOTAJE=muerto|pleno|control
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO
 *
 * Contesta el criterio de `ESQUEMA-CMS.md` §1.5b aplicado al CPT `solutions`:
 * **no el parecido, sino QUÉ CUESTA LA FUSIÓN** — qué campos tiene cada forma
 * que otra no tiene. Pre-registro: `docs/research/productos/PRE-REGISTRO.md`.
 *
 * **NO es un recon de topología y NO mide un solo píxel.** La resolución que
 * hace falta es «qué bloques con dato trae cada página», que es mucho más
 * gruesa que una topología — y por eso esta sonda es corta.
 *
 * ── EL PROXY, dicho para que no se lea como más de lo que es ──────────────
 * En Divi, «los campos que el editor rellenó» **son los módulos que puso**. Así
 * que el inventario de campos se mide como el **histograma de kinds de módulo**
 * por instancia. Es un proxy, y se declara: dos módulos del mismo kind con
 * contenidos distintos son el mismo campo repetido, no dos campos.
 *
 * ── LA REGLA QUE GOBIERNA CADA LECTURA ───────────────────────────────────
 * **Una propiedad vista en UNA sola instancia está SIN PROBAR.** Es la FAMILIA
 * DE CALIBRACIÓN, pagada el 2026-08-03: con **cuatro** instancias de SECTOR el
 * `anchoPct: 90` vivía en **una sola**. Por eso la sonda reporta, por forma, el
 * **n** y **en cuántas instancias** aparece cada kind — nunca «la forma tiene X»
 * a secas.
 *
 * ── EL CONTROL, que es parte del instrumento ─────────────────────────────
 * Las 4 instancias CONSTRUIDAS (`monitor-calidad-aire`, `accesorios`,
 * `software-…`, `kunak-api`) tienen su modelo en `src/lib`, así que se sabe qué
 * debe salir. Si la sonda no ve en ellas los kinds que el clon ya pinta, **su
 * lectura sobre las 20 sin medir no vale** — *no encontrar nada y no mirar nada
 * dan la misma salida*.
 *
 * DIAGNÓSTICO PURO: no arregla nada y no propone nada. El recuento de frontera
 * lo adjudica el acta contra el umbral pre-registrado.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { Censo, Evaluadas, env, hoy, launch, openPage, settle, w } from "./lib.mjs";

const SABOTAJE = env("SABOTAJE");
const SOLO = env("SOLO");

/* El alcance sale del SITEMAP del CPT, no de una lista a mano: así una página
 * nueva del CPT entra sola y sube el listón del contrato sin tocar la sonda.
 * (La tanda anterior citó el censo en vez de derivar, y se dejó fuera dos.) */
const sitemap = await (await fetch("https://kunakair.com/solutions-sitemap.xml")).text();
const URLS = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => u.includes("/es/"))
  .sort()
  .filter((u) => !SOLO || u.includes(SOLO));
if (URLS.length === 0) {
  console.error(`❌ 0 URLs del CPT solutions en /es${SOLO ? ` con SOLO=${SOLO}` : ""} — el sitemap no dio nada, no es una corrida limpia.`);
  process.exit(2);
}

const slug = (u) => u.replace("https://kunakair.com/es/", "").replace(/\/$/, "");
/** Las 4 con modelo en `src/lib`: el CONTROL del instrumento. */
const CONTROL = ["monitor-calidad-aire", "accesorios", "software-de-medicion-calidad-del-aire", "kunak-api"];
/** Forma APARENTE por la ruta. Es una hipótesis de agrupación, no el veredicto:
 *  la sonda mide y el acta decide si estas cajas son las buenas. */
const formaDe = (s) => {
  if (s.startsWith("cartuchos-inteligentes/")) return "cartucho";
  if (s === "accesorios") return "catalogo";
  if (s === "monitor-calidad-aire") return "producto";
  if (s === "software-de-medicion-calidad-del-aire" || s === "kunak-api") return "software";
  return "ficha";
};

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;

  // Negativo 1: selector muerto en todas ⇒ sale por el censo, no por cero.
  if (sabotaje === "muerto") __q(".solutions-selector-que-no-existe");
  // Negativo 2: patrón ubicuo ⇒ sale por PLENO, no como dato.
  if (sabotaje === "pleno") __qa("div");

  /** Secciones PROPIAS de la instancia: fuera cabecera y pie del theme builder. */
  const secciones = __qa(".et_pb_section").filter((s) => !/_tb_(header|footer)\b/.test(s.className));

  /* Negativo 3: se vacían los kinds ⇒ el CONTROL tiene que gritar. Sin esta
   * guarda, una sonda que no ve nada da el mismo informe que una forma pobre. */
  const raiz = sabotaje === "control" ? [] : secciones;

  /** El kind de un módulo Divi: `et_pb_text` → `text`. Sin las de estado. */
  const KIND = /^et_pb_([a-z_]+?)(_\d+)?$/;
  const kinds = {};
  const modulos = [];
  for (const sec of raiz)
    for (const m of sec.querySelectorAll(".et_pb_module")) {
      const k = [...m.classList]
        .map((c) => (KIND.exec(c) || [])[1])
        .filter((c) => c && !/^(module|css_mix_blend|text_align|bg_layout|with_border|no_shadow|light|dark|inner)/.test(c))[0];
      if (!k) continue;
      kinds[k] = (kinds[k] || 0) + 1;
      modulos.push(k);
    }

  /* Estructuras con DATO que un histograma de kinds no distingue por sí solo, y
   * que son justo las candidatas a campo de frontera. Se miran sobre las
   * secciones propias, nunca sobre el documento entero (el CSS de Divi nombra
   * sus propias clases y el pie trae de todo). */
  const en = (sel) => raiz.some((s) => s.querySelector(sel));
  const cuenta = (sel) => raiz.reduce((a, s) => a + s.querySelectorAll(sel).length, 0);

  return {
    tpl: (document.body.className.match(/\b\S*template\S*\b/g) || []).join(" "),
    body: document.body.className.slice(0, 200),
    nSecciones: secciones.length,
    nModulos: modulos.length,
    kinds,
    estructuras: {
      tabla: cuenta("table"),
      tabs: cuenta(".et_pb_tabs"),
      toggle: cuenta(".et_pb_toggle, .et_pb_accordion"),
      galeria: cuenta(".et_pb_gallery"),
      video: cuenta(".et_pb_video, video"),
      slider: cuenta(".et_pb_slider"),
      mapa: cuenta(".et_pb_map"),
      formulario: cuenta("form"),
      /** El botón de descarga: es campo si lo lleva una forma y otra no. */
      descargaPdf: cuenta('a[href$=".pdf"]'),
      botones: cuenta("a.et_pb_button"),
      /** Ficha técnica: una tabla de especificaciones tiene ≥2 columnas. */
      filasTabla: cuenta("table tr"),
    },
    h1: r(__q("h1")?.getBoundingClientRect().height ?? 0),
    titulo: (__q("h1")?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70),
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = {
  meta: {
    fecha: hoy(), width: 1440, sabotaje: SABOTAJE ?? null,
    preRegistro: "docs/research/productos/PRE-REGISTRO.md",
    fuente: "solutions-sitemap.xml filtrado a /es — DERIVADO, no citado",
    control: CONTROL,
  },
  paginas: {},
};
let muertas = 0;

/* `SIN_CLON`: esta sonda solo abre el ORIGINAL, así que un build del clon no la
 * contamina y marcarla sería una alarma falsa. */
process.env.SIN_CLON = "1";

const ev = new Evaluadas({ nombre: "solutions-campos", unidad: "páginas del CPT", minimo: URLS.length, porPaginas: true });

for (const url of URLS) {
  const s = slug(url);
  try {
    const { page, status } = await openPage(browser, url, { width: 1440, height: 900 });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    salida.paginas[s] = { forma: formaDe(s), control: CONTROL.includes(s), ...datos };
    const ks = Object.entries(datos.kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}${n > 1 ? "×" + n : ""}`);
    console.log(`  ${formaDe(s).padEnd(9)} ${s.slice(0, 44).padEnd(46)} sec ${String(datos.nSecciones).padStart(2)} mod ${String(datos.nModulos).padStart(3)}  ${ks.slice(0, 7).join(" ")}`);
  } catch (e) {
    muertas++;
    salida.paginas[s] = { forma: formaDe(s), error: String(e).slice(0, 160) };
    ev.fallo(s, e);
    console.log(`  ✗ ${s.slice(0, 52).padEnd(54)} ERROR ${String(e).slice(0, 60)}`);
  }
}
await browser.close();

/* ══ AGREGADO POR FORMA — con el n delante, que es lo que la regla exige ══ */
const formas = {};
for (const [s, p] of Object.entries(salida.paginas)) {
  if (p.error) continue;
  const f = (formas[p.forma] ||= { n: 0, instancias: [], kinds: {}, estructuras: {} });
  f.n++;
  f.instancias.push(s);
  for (const k of Object.keys(p.kinds)) f.kinds[k] = (f.kinds[k] || 0) + 1;          // EN CUÁNTAS instancias
  for (const [k, v] of Object.entries(p.estructuras)) if (v > 0) f.estructuras[k] = (f.estructuras[k] || 0) + 1;
}
salida.formas = formas;

/**
 * ⚠ **LA FRONTERA se calcula sobre lo que está EN TODAS las instancias de una
 * forma, no sobre lo que aparece en alguna.** Un kind que sale en 1 de 17
 * cartuchos es contenido de esa página, no un campo de la forma — y contarlo
 * como frontera inflaría el número justo en la dirección que decide.
 */
const universal = (f) => new Set([...Object.entries(f.kinds), ...Object.entries(f.estructuras)].filter(([, n]) => n === f.n).map(([k]) => k));
salida.universales = Object.fromEntries(Object.entries(formas).map(([nom, f]) => [nom, [...universal(f)].sort()]));

const nombres = Object.keys(formas);
const frontera = {};
for (const a of nombres)
  for (const b of nombres) {
    if (a >= b) continue;
    const ua = universal(formas[a]), ub = universal(formas[b]);
    const soloA = [...ua].filter((k) => !ub.has(k)).sort();
    const soloB = [...ub].filter((k) => !ua.has(k)).sort();
    frontera[`${a} ↔ ${b}`] = { soloA, soloB, n: soloA.length + soloB.length };
  }
salida.frontera = frontera;

w(env("SALIDA") || `medidas/solutions-campos${SABOTAJE ? `-neg-${SABOTAJE}` : ""}${SOLO ? `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}` : ""}.json`, salida);

/* ══ UN SOLO CANAL DE VERDAD ══ */
const muertos = censo.informe();
const ubicuos = Object.entries(censo.total).filter(([, n]) => n > censo.paginas * 40);
if (ubicuos.length)
  console.error(`\n⚠ PATRÓN UBICUO — casa ${ubicuos[0][1]} veces en ${censo.paginas} páginas: no discrimina nada.\n` + ubicuos.map(([s, n]) => `     · ${s} (${n})`).join("\n"));
if (muertas) console.error(`\n❌ ${muertas} página(s) no se pudieron medir — NO son «sin campos».`);

console.log(`\n─── CPT solutions · ${URLS.length - muertas}/${URLS.length} páginas · ${nombres.length} formas aparentes\n`);
for (const [nom, f] of Object.entries(formas))
  console.log(`      ${nom.padEnd(10)} n=${String(f.n).padStart(2)}  universales: ${[...universal(f)].sort().join(" ") || "—"}`);
console.log(`\n      FRONTERA (kinds/estructuras universales en una forma y ausentes en la otra):`);
for (const [par, d] of Object.entries(frontera))
  console.log(`        ${par.padEnd(24)} ${String(d.n).padStart(2)}  ${d.soloA.map((k) => "←" + k).concat(d.soloB.map((k) => "→" + k)).join(" ") || "(vacía)"}`);

/**
 * ⚠ **EL CONTROL ES PARTE DEL INSTRUMENTO.** Las 4 construidas tienen modelo en
 * `src/lib`, así que se sabe que traen módulos. Si la sonda no ve NADA en ellas,
 * su lectura sobre las 20 sin medir no vale: *no encontrar nada y no mirar nada
 * dan la misma salida*. Con un sabotaje puesto la comprobación sí aplica —
 * `control` la ataca a propósito.
 */
const ctrl = CONTROL.map((s) => salida.paginas[s]).filter((p) => p && !p.error);
const ctrlVacio = ctrl.filter((p) => p.nModulos === 0);
let controlFalla = 0;
if (ctrl.length === 0) { controlFalla = 1; console.error(`\n❌ EL CONTROL NO SE MIDIÓ: sin él no se sabe si la sonda ve los campos.`); }
else if (ctrlVacio.length) {
  controlFalla = 1;
  console.error(
    `\n❌ ${ctrlVacio.length}/${ctrl.length} CONTROL(ES) CON CERO MÓDULOS. Su modelo está en \`src/lib\` y\n` +
      `   el clon los pinta, así que esto NO es un dato sobre el sitio: es la sonda que no\n` +
      `   sabe leer los campos. Nada de lo medido en las 20 sin medir se puede citar.`,
  );
} else console.log(`\n      ✓ CONTROL: ${ctrl.length}/${ctrl.length} con módulos — la sonda ve los campos donde se sabe que los hay.`);

const fallos = muertos + muertas + ubicuos.length + controlFalla;
console.log(
  `${fallos === 0 ? "✅" : "❌"} solutions-campos · ${muertos} muerto(s) · ${ubicuos.length} ubicuo(s)\n` +
    `   ⚠ DIAGNÓSTICO: la frontera es un HALLAZGO, no un fallo. La adjudica el acta\n` +
    `     contra el umbral PRE-REGISTRADO (U1 obligatoriedad · U2 ≥3 o >25 %).`,
);
process.exit(fallos === 0 ? 0 : 2);
