/**
 * LA MIGA DEL GRUPO A, original contra clon — el instrumento que cierra A-QA1.
 * Uso: npm run qa:a-miga -- [ancho]        (necesita el clon en localhost:3000)
 * Test en negativo: SABOTAJE=1 npm run qa:a-miga -- 390   → selector muerto, exit 2
 *
 * ── Qué pregunta, y por qué esta y no otra ────────────────────────────────
 * A-QA1 dejó el residuo **cuantizado en renglones de 26**: +26.00 en
 * blog-con-relacionados y +52.00 en documento a 390, con 0.00 y −0.02 en las
 * otras dos formas. Un residuo que es un múltiplo exacto del renglón **no es un
 * error de ritmo vertical**: es que la miga envuelve un renglón (o dos) antes de
 * tiempo, o sea que **sobra ANCHO**.
 *
 * Así que la pregunta no es «cuánto mide de alto» sino **cuánto ocupa de ancho
 * cada eslabón y cuánto el separador**, y hay que preguntarla **en los dos
 * lados a la vez**: el número del original solo no dice nada si no se compara
 * con el que sirve el clon.
 *
 * ── Se mide a 1440, no a 390, y es deliberado ─────────────────────────────
 * A 390 la miga ya está envuelta, así que su ancho total es el del contenedor
 * en los dos lados: **la medida que interesa está tapada por el wrap**. A 1440
 * cabe en un renglón en las dos, y ahí el ancho es observable y comparable.
 * Es `CLAUDE.md` §El NIVEL al que se mide aplicado al eje horizontal: el
 * contenedor de 335.39 absorbe la diferencia que se está buscando.
 *
 * Por eso la sonda mide **los dos anchos**: 1440 da la causa, 390 da el efecto.
 *
 * ── El separador vive en un PSEUDOELEMENTO ────────────────────────────────
 * El original no escribe el `›` en el marcado: lo pinta el CSS del tema en un
 * `::before`/`::after` del `li`. `getComputedStyle(el, "::after")` lo lee —
 * contenido, ancho, márgenes— y sin eso la comparación se hace a ojo.
 */
import { Censo, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
const SABOTAJE = !!process.env.SABOTAJE;

/** Las cuatro formas, con su par original ↔ clon. */
const PARES = [
  {
    forma: "blog CON relacionados",
    original: "https://kunakair.com/es/contaminacion-por-metano/",
    clon: "/contaminacion-por-metano",
  },
  {
    forma: "blog SIN relacionados",
    original: "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/",
    clon: "/todas-nuestras-soluciones-en-el-iotswc",
  },
  {
    forma: "termino",
    original: "https://kunakair.com/es/emisiones-atmosfericas/",
    clon: "/emisiones-atmosfericas",
  },
  {
    forma: "doc-cientifico",
    original:
      "https://kunakair.com/es/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo/",
    clon: "/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
  },
];

/**
 * ── (1b·b) La hipótesis que estos tres pares ponen a prueba ────────────────
 * El recon de C-1 midió «el último `li` truncado a 350 con elipsis» **en el
 * caso de éxito**, y así se construyó: dentro de `variante="caso"` de
 * `Breadcrumb`. Si el tope resulta ser una regla **del TEMA** y no del caso,
 * entonces:
 *
 *   · la variante está **mal delimitada** —mezcló una regla general con las
 *     específicas— y el tope baja al componente base;
 *   · producto y sectores dan Δ0 **porque sus rótulos no llegan a 350**, no
 *     porque estén bien: corrección aparente por contenido corto;
 *   · y eso es **CLASE**: el día que un editor escriba un título largo, el clon
 *     envolverá donde el original trunca.
 *
 * Por eso se miden aunque hoy cuadren. Un Δ0 obtenido con contenido que no
 * ejercita la regla no es una verificación de la regla.
 */
const PARES_TEMA = [
  {
    forma: "caso de éxito",
    original: "https://kunakair.com/es/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa/",
    clon: "/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa",
  },
  {
    forma: "producto",
    original: "https://kunakair.com/es/monitor-calidad-aire/",
    clon: "/monitor-calidad-aire",
  },
  {
    forma: "sector",
    original: "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/",
    clon: "/sectores/calidad-del-aire-en-las-ciudades",
  },
  // Añadido al aplicar el arreglo: es la ÚNICA de las 17 que se movió (−26 de
  //  a 390), así que hay que preguntarle al original si se movió hacia
  // él o en contra. Un guardián clon-contra-clon dice QUÉ cambió, nunca si el
  // cambio es correcto.
  {
    forma: "monográfico (petróleo)",
    original: "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    clon: "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
  },
  // ── Añadidas en A-QA1b (2026-08-01) ────────────────────────────────────────
  // Las otras TRES rutas que tenían la miga escrita a mano. `producto` ya
  // estaba y por eso se vio; éstas no, así que su copia a mano no la miraba
  // NADIE contra el original. Se meten aquí para que la adjudicación de las
  // cuatro salga de la sonda y no de un razonamiento por analogía con producto.
  {
    forma: "accesorios",
    original: "https://kunakair.com/es/accesorios/",
    clon: "/accesorios",
  },
  {
    forma: "software",
    original: "https://kunakair.com/es/software-de-medicion-calidad-del-aire/",
    clon: "/software-de-medicion-calidad-del-aire",
  },
  {
    forma: "kunak-api",
    original: "https://kunakair.com/es/kunak-api/",
    clon: "/kunak-api",
  },
];
if (!process.env.SOLO_A) PARES.push(...PARES_TEMA);

const extraer = function (sel) {
  const r = (n) => Math.round(n * 100) / 100;
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? v : Math.round(n * 100) / 100;
  };
  const t = (el, n = 40) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);

  const caja = __q(sel);
  if (!caja) return { error: "sin contenedor de miga: " + sel };

  const cs = getComputedStyle(caja);
  const bb = caja.getBoundingClientRect();

  /** Cada eslabón, con el pseudoelemento que pinta el separador. */
  const hijos = [...caja.children].map((el) => {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const pseudo = (cual) => {
      const p = getComputedStyle(el, cual);
      const contenido = p.content;
      if (!contenido || contenido === "none" || contenido === "normal") return null;
      return {
        content: contenido,
        w: px(p.width),
        ml: px(p.marginLeft),
        mr: px(p.marginRight),
        pl: px(p.paddingLeft),
        pr: px(p.paddingRight),
        fs: px(p.fontSize),
      };
    };
    // El texto propio del eslabón. `a` y no `a, span`: en el clon el primer
    // `span` del envoltorio ES el separador, así que "a, span" habría medido el
    // separador en un lado y el enlace en el otro — dos definiciones de "lo
    // mismo", que es el fallo que ya costó el censo de `c-spec`.
    const dentro = el.querySelector("a") || el;
    const bd = dentro.getBoundingClientRect();
    return {
      etiqueta: el.tagName.toLowerCase(),
      display: s.display,
      x: r(b.left),
      w: r(b.width),
      h: r(b.height),
      ml: px(s.marginLeft),
      mr: px(s.marginRight),
      pl: px(s.paddingLeft),
      pr: px(s.paddingRight),
      textoW: r(bd.width),
      // ── (1b·a) La IMPLEMENTACIÓN del acotado, no su efecto ────────────────
      // El efecto ya estaba medido (350.00 clavado a 1440 y a 390). Esto lee
      // CON QUÉ lo consigue el original, para que el arreglo sea exacto y no
      // escrito por parecido. Se lee en TODOS los eslabones, no solo en el
      // último: si apareciera en los intermedios, «es del último» sería falso.
      maxW: px(s.maxWidth),
      ws: s.whiteSpace,
      ov: s.overflow,
      to: s.textOverflow,
      va: s.verticalAlign,
      antes: pseudo("::before"),
      despues: pseudo("::after"),
      txt: t(el),
    };
  });

  /**
   * Ancho INLINE real: del borde izquierdo del primer eslabón al derecho del
   * último. Es el número que decide si envuelve, y el que el contenedor tapa.
   */
  const primero = hijos[0];
  const ultimo = hijos[hijos.length - 1];
  const cajas = [...caja.children].map((el) => el.getBoundingClientRect());
  const anchoInline = hijos.length
    ? r(Math.max(...cajas.map((b) => b.right)) - Math.min(...cajas.map((b) => b.left)))
    : 0;

  return {
    contenedorW: r(bb.width),
    contenedorH: r(bb.height),
    fs: px(cs.fontSize),
    lh: px(cs.lineHeight),
    /** Renglones: el alto entre 26, que es el que la construcción midió. */
    renglones: r(bb.height / 26),
    nEslabones: hijos.length,
    anchoInline,
    /** Suma de los anchos propios de los textos, sin separadores ni huecos. */
    sumaTextos: r(hijos.reduce((n, h) => n + h.textoW, 0)),
    primero: primero?.txt ?? null,
    ultimo: ultimo?.txt ?? null,
    hijos,
  };
};

/* ─────────────────────────────── recorrido ─────────────────────────────── */

// El sabotaje rompe el selector del contenedor: tiene que salir por MUERTO, no
// por «la miga no varía» (`CLAUDE.md` §sondas, regla 4).
// El clon reproduce la clase del original (`kunak-breadcrumbs`), así que el
// selector es EL MISMO en los dos lados: una sola definición, no dos.
const SEL = SABOTAJE ? ".kunak-migas-de-pan" : ".kunak-breadcrumbs";
const SEL_ORIGINAL = SEL;
const SEL_CLON = SEL;

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), sabotaje: SABOTAJE }, pares: {} };

for (const p of PARES) {
  const fila = {};
  for (const [lado, url, sel] of [
    ["original", p.original, SEL_ORIGINAL],
    ["clon", CLON + p.clon, SEL_CLON],
  ]) {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    const { datos } = await censo.medir(page, extraer, sel);
    fila[lado] = datos;
    await page.close();
  }
  salida.pares[p.forma] = fila;

  const o = fila.original;
  const c = fila.clon;
  console.log(`\n█ ${p.forma}  @${width}`);
  if (o.error || c.error) {
    console.log(`   ⚠ ${o.error ?? ""} ${c.error ?? ""}`);
    continue;
  }
  console.log(
    `   ancho INLINE   original ${String(o.anchoInline).padStart(8)}` +
      `   clon ${String(c.anchoInline).padStart(8)}   Δ ${(c.anchoInline - o.anchoInline).toFixed(2)}`,
  );
  console.log(
    `   suma de TEXTOS original ${String(o.sumaTextos).padStart(8)}` +
      `   clon ${String(c.sumaTextos).padStart(8)}   Δ ${(c.sumaTextos - o.sumaTextos).toFixed(2)}`,
  );
  console.log(
    `   eslabones ${o.nEslabones} / ${c.nEslabones}   ·   renglones ${o.renglones} / ${c.renglones}` +
      `   ·   alto ${o.contenedorH} / ${c.contenedorH}`,
  );
  for (const lado of ["original", "clon"]) {
    const d = fila[lado];
    const u = d.hijos.at(-1);
    if (u)
      console.log(
        `   ${lado.padEnd(8)} ÚLTIMO    w ${String(u.w).padStart(7)}` +
          `  max-width ${String(u.maxW).padStart(7)}  white-space ${u.ws.padEnd(8)}` +
          `  overflow ${u.ov.padEnd(8)}  text-overflow ${u.to}`,
      );
    const h = d.hijos[1] ?? d.hijos[0];
    if (!h) continue;
    const sep = h.antes ?? h.despues;
    console.log(
      `   ${lado.padEnd(8)} eslabón[1] w ${String(h.w).padStart(7)} texto ${String(h.textoW).padStart(7)}` +
        ` m ${h.ml}/${h.mr} p ${h.pl}/${h.pr}  ${h.display}` +
        (sep
          ? `  · SEPARADOR ${sep.content} w ${sep.w} m ${sep.ml}/${sep.mr} p ${sep.pl}/${sep.pr}`
          : `  · sin pseudoelemento`),
    );
  }
}

await browser.close();

w(SABOTAJE ? `medidas/a-miga-${width}-SABOTAJE.json` : `medidas/a-miga-${width}.json`, salida);

if (censo.informe(`@${width}`)) process.exit(2);
console.log(`\n✅ ${PARES.length} pares medidos a ${width}.`);
