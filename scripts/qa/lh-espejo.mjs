/**
 * EL ESPEJO EN LA UNIDAD QUE `lh-serie` ESTABLECIÓ: LA PÁGINA.
 * El lado ORIGINAL de `qa:lh-cmp` para **todas** las `/page/N`, no sólo la 1.
 * Uso: node scripts/qa/lh-espejo.mjs [1440|390]     (npm run qa:lh-espejo)
 *      SOLO=/blog,/glosario  → recorta el universo (para una corrida corta)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y POR QUÉ NO ES `lh-spec` CON MÁS RUTAS
 *
 * `qa:lh-serie` midió la pregunta y su veredicto es **«LA SERIE NO ES UNA
 * UNIDAD»** (19 series heterogéneas de 28, 38 clases). `qa:lh-spec` mide **la
 * página 1** de 9 formas + 4 segundas instancias = **13 páginas**, porque su
 * trabajo es otro: establecer la **varianza ENTRE INSTANCIAS** de cada forma,
 * que es el discriminador del régimen plantillado.
 *
 * Y de ahí salía el desacuerdo que §F3-LH-ALCANCE-PAGINA-1 tuvo que declarar:
 * `qa:lh-cmp` deriva su universo del espejo, así que **comparaba 13 páginas de
 * 149**, todas `primera` — `intermedia` **86** y `última` **28** sin abrir a
 * ningún ancho, y **11 de 38** clases tocadas. Dos defectos de plantilla en dos
 * tandas seguidas vivían enteros ahí (la piel A y la piel B, **31 de 38**
 * instancias).
 *
 * ── Por qué un fichero nuevo y no `PISAR=1` sobre `lh-spec` ───────────────
 * Son **dos afirmaciones distintas** y mezclarlas rompe las dos:
 *
 * | sonda | unidad | qué afirma |
 * |---|---|---|
 * | `lh-spec` | la FORMA (13 páginas) | varianza entre instancias ⇒ plantilla o SIN PROBAR |
 * | **`lh-espejo`** | la PÁGINA (todas las que listan) | el lado original, par a par, para comparar |
 *
 * Meter las `/page/N` en `lh-spec` haría que su `entreInstancias` comparase la
 * página 1 con la 7 de la misma forma y dijera **«VARÍA — mirar»** de cosas que
 * varían por diseño (el paginador, el nº de tarjetas de la última). Sería un
 * rojo correcto de una pregunta que nadie hizo.
 *
 * ⚠ **Y para que las dos no diverjan, esta sonda EXIGE contener a la otra**: si
 * alguna de las páginas de `lh-spec` se queda fuera de este universo, tira. Un
 * espejo que perdiera formas por el camino daría un comparador más estrecho
 * **con aspecto de más ancho**, que es el modo de fallo de esta familia.
 *
 * ── El barrido es EL MISMO ───────────────────────────────────────────────
 * `lh-barrido.mjs`, el que ya comparten `lh-spec` y `lh-cmp`. Una segunda copia
 * sería la clase C7 con su peor salida: dos verdes en su marco midiendo cosas
 * distintas.
 *
 * ── La etiqueta de cada página, DERIVADA y con su SIN PROBAR ──────────────
 * La clave del espejo es `"<etiqueta>::<ruta>"`. La etiqueta sale de tres
 * congeladas —`lh-spec` (13 rutas ya con forma medida), `hover-zonal` (las 9
 * canónicas) y el `grupo` de `lh-censo` con el reparto que `lh-spec` ya usa—.
 * Lo que **no** se hace es adivinar: las series cuyo `grupo` es `hub` y que
 * ninguna medición ha nombrado salen como **`hub:<slug>`** con
 * `formaEstablecida: false`. Inferirlas por vecindad de directorio es
 * exactamente el error de §*el discriminador estaba servido, con su contraste al
 * lado* — `/recursos/kunakpedia` **parece** hermana de `/recursos/articulos` y el
 * `<body>` puede decir otra cosa.
 *
 * ── Lo que NO contesta (§una regla incompleta se lee igual que una completa) ─
 *   · **si el clon cuadra**: esto es UN lado. La comparación es `qa:lh-cmp`;
 *   · **la varianza entre instancias de una forma**: eso es `qa:lh-spec`, y su
 *     veredicto no se recalcula aquí;
 *   · **las páginas VACÍAS de `D2.5`**: existen como ruta y no listan nada, así
 *     que no entran en el universo del comparador. Se cuentan y se nombran;
 *   · **el suelo de ruido**: estas rutas no tienen campaña, así que un residuo
 *     pequeño medido contra este espejo es SIN PROBAR, no «limpio».
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { barrer } from "./lh-barrido.mjs";
import { Censo, Evaluadas, env, gritaSiRevienta, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const ANCHO = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) || 1440);
const MOVIL = ANCHO <= 500;
const ORIGEN = "https://kunakair.com";

const SABOTAJES = ["sin-serie", "pierde-el-espejo"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — corrida de negativo, NO es una medida.\n`);

/* ── las congeladas de las que sale TODO (§regla 6: si falta, tira) ───────── */
const lee = (f, porQue) => {
  const p = join(QA, `medidas/${f}`);
  if (!existsSync(p))
    throw new Error(
      `FALTA medidas/${f}: ${porQue}\n` +
        `  Sin ella el universo saldría corto, y un espejo corto produce un comparador\n` +
        `  MÁS ESTRECHO CON ASPECTO DE MÁS ANCHO (§regla del cero).`,
    );
  return JSON.parse(readFileSync(p, "utf8"));
};
const SERIE = SABOTAJE === "sin-serie" ? { series: {} } : lee("lh-serie.json", "es la población en la unidad PÁGINA");
const SPEC = lee(`lh-spec-${ANCHO}.json`, "es el espejo de FORMAS que este universo tiene que contener");
const CENSO_LH = lee("lh-censo.json", "trae el `grupo` de cada serie, que es de donde sale la etiqueta");
const HOVER = lee("hover-zonal.json", "trae las 9 formas canónicas con su ruta");

const clave = (r) => String(r).replace(/^\/es/, "").replace(/^\/+/, "").replace(/\/+$/, "") || "/";

/* ── la etiqueta: medida donde la hay, `hub:<slug>` donde no ──────────────── */
/** El mismo reparto que `lh-spec` usa para elegir sus segundas instancias. No se
 *  reescribe: si allí cambia, aquí tiene que cambiar y el desacuerdo se ve. */
const FAMILIA_DEL_GRUPO = { post_tag: "L1-etiqueta", resources: "L1-resources-hijo", "scientific-category": "L3-sci" };

const formaPorRuta = new Map();
for (const k of Object.keys(SPEC.paginas ?? {})) formaPorRuta.set(clave(k.slice(k.indexOf("::") + 2)), k.slice(0, k.indexOf("::")));
for (const [forma, v] of Object.entries(HOVER.formas ?? {})) if (!formaPorRuta.has(clave(v.ruta))) formaPorRuta.set(clave(v.ruta), forma);

const grupoPorRuta = new Map();
for (const [r, v] of Object.entries(CENSO_LH.paginas ?? {})) if (!v.error) grupoPorRuta.set(clave(r), v.grupo);

const etiquetaDe = (serie) => {
  if (formaPorRuta.has(serie)) return { etiqueta: formaPorRuta.get(serie), establecida: true };
  const g = grupoPorRuta.get(serie);
  if (g && FAMILIA_DEL_GRUPO[g]) return { etiqueta: FAMILIA_DEL_GRUPO[g], establecida: true };
  /* §regla 6 · no se adivina por vecindad de directorio: se nombra el hueco. */
  return { etiqueta: `hub:${serie.split("/").pop()}`, establecida: false };
};

/* ── el universo, en la unidad PÁGINA ────────────────────────────────────── */
const SOLO = (env("SOLO") ?? "").split(",").map((s) => s.trim()).filter(Boolean).map(clave);

const TODAS = [];
for (const [serie, s] of Object.entries(SERIE.series ?? {})) {
  const k = clave(serie);
  const { etiqueta, establecida } = etiquetaDe(k);
  for (const pg of s.paginas ?? [])
    TODAS.push({
      serie: k,
      clave: clave(pg.n === 1 ? serie : `${serie}/page/${pg.n}`),
      ruta: `/es/${pg.n === 1 ? k : `${k}/page/${pg.n}`}/`,
      n: pg.n,
      pos: pg.pos,
      clase: pg.clase,
      vacia: pg.vacia,
      etiqueta,
      formaEstablecida: establecida,
    });
}

const vacias = TODAS.filter((p) => p.vacia === true);
let PAGINAS = TODAS.filter((p) => p.vacia !== true);
if (SOLO.length) PAGINAS = PAGINAS.filter((p) => SOLO.includes(p.serie) || SOLO.includes(p.clave));

if (!PAGINAS.length)
  throw new Error(
    "0 páginas en el universo: un cero aquí se leería como «no hay nada que medir»,\n" +
      "  que es la salida de no haber mirado (§regla del cero).",
  );

/* ⚠ LA GUARDA QUE IMPIDE QUE LOS DOS ESPEJOS DIVERJAN — y corre ANTES de
 * arrancar el navegador, que es lo barato primero. */
const enElSpec = new Set(Object.keys(SPEC.paginas ?? {}).map((k) => clave(k.slice(k.indexOf("::") + 2))));
if (!SOLO.length) {
  /* El sabotaje quita EXACTAMENTE las que el espejo de formas trae: así la
   * guarda tiene siempre algo que rechazar y el negativo no depende de qué
   * página caiga primero (§sondas 8a — un sabotaje que no cambia nada no prueba). */
  if (SABOTAJE === "pierde-el-espejo") PAGINAS = PAGINAS.filter((p) => !enElSpec.has(p.clave));
  const mias = new Set(PAGINAS.map((p) => p.clave));
  const perdidas = [...enElSpec].filter((r) => !mias.has(r));
  if (perdidas.length)
    throw new Error(
      `ESPEJO INCOMPLETO: ${perdidas.length} página(s) de lh-spec-${ANCHO}.json NO están en este universo.\n` +
        perdidas.slice(0, 10).map((r) => `    · ${r}`).join("\n") +
        `\n  Un espejo que pierde formas da un comparador MÁS ESTRECHO con aspecto de más\n` +
        `  ancho: el recuento de pares sube y la cobertura baja, y nada lo dice.`,
    );
}

/* ══════════════════════════════ la medida ══════════════════════════════ */
const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: `lh-espejo@${ANCHO}`, unidad: "páginas del original", minimo: PAGINAS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: `ESPEJO del original en la unidad PÁGINA (todas las /page/N que listan), a ${ANCHO}`,
    fuente: "kunakair.com VIVO — la captura no trae las hojas externas, y sin ellas la geometría sale plausible y falsa",
    ancho: ANCHO,
    unidad: "la PÁGINA — la que estableció qa:lh-serie («LA SERIE NO ES UNA UNIDAD»)",
    barrido: "lh-barrido.mjs, el mismo de lh-spec y lh-cmp (una sola definición, §C7)",
    protocolo:
      "perfil limpio · Cookiebot bloqueado · " +
      (MOVIL ? "Emulation.setDeviceMetricsOverride 390×844" : "viewport 1440×900") +
      " · scroll+settle · lazy→eager · 400 ms entre páginas",
    ruido: "⚠ estas rutas NO tienen campaña de ruido: un residuo pequeño medido contra este espejo es SIN PROBAR, no «limpio»",
    contiene: `las ${Object.keys(SPEC.paginas ?? {}).length} páginas de lh-spec-${ANCHO}.json — comprobado antes de medir`,
    noMide: [
      `el clon: esta sonda mide UN lado — las ${PAGINAS.length} páginas se abren sólo en el original`,
      `las ${vacias.length} páginas VACÍAS de D2.5 (de ${TODAS.length}): existen como ruta y no listan nada, así que no entran en el universo del comparador`,
      `la varianza entre instancias de una forma: eso es qa:lh-spec, y son sus ${Object.keys(SPEC.paginas ?? {}).length} páginas, no éstas`,
      `la forma de ${TODAS.filter((p) => !p.formaEstablecida && p.vacia !== true).length} páginas de ${PAGINAS.length}: su serie es \`hub\` y ninguna medición la ha nombrado — salen como \`hub:<slug>\` con formaEstablecida:false`,
      "anchos intermedios: el contrato ahí es de RANGO, no de fidelidad (§CONTRATO)",
    ],
  },
  paginas: {},
  /* Los rótulos (serie · n · posición · clase de lh-serie) van FUERA de
   * `paginas` a propósito — ver el comentario del bucle. */
  rotulos: {},
};

console.log(`\n════════ LISTADOS · ESPEJO EN LA UNIDAD PÁGINA @${ANCHO} ════════`);
console.log(`  población            ${TODAS.length} páginas (${vacias.length} vacías D2.5, fuera del universo)`);
console.log(`  A MEDIR              ${PAGINAS.length}${SOLO.length ? `   ⚠ recortado por SOLO=${SOLO.join(",")}` : ""}`);
console.log(`  lh-spec trae         ${Object.keys(SPEC.paginas ?? {}).length}   ⇒ factor ×${(PAGINAS.length / Object.keys(SPEC.paginas ?? {}).length).toFixed(1)}`);
console.log(`  forma NO establecida ${PAGINAS.filter((p) => !p.formaEstablecida).length} páginas\n`);

let i = 0;
for (const P of PAGINAS) {
  i++;
  const url = ORIGEN + P.ruta;
  const { page, status } = await openPage(browser, url, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  if (status >= 400 || status === 0) {
    ev.fallo(P.clave, `HTTP ${status}`);
    console.log(`  ✗ ${String(i).padStart(3)}/${PAGINAS.length}  ${P.clave.padEnd(52)} HTTP ${status}`);
    await page.close().catch(() => {});
    continue;
  }
  await settle(page);
  const { datos } = await censo.medir(page, barrer);
  /**
   * ⚠ **DENTRO de `paginas[k]` sólo van `forma`, `ruta`, `papel` y el barrido, y
   * es una restricción DURA, no estilo.** `lh-cmp` aplana este árbol entero y
   * `IGNORAR` (en `lh-ejes.mjs`) sólo exime esos tres: cualquier rótulo extra
   * aquí saldría como **un par «AUSENTE» por página** —el clon nunca los tiene—
   * y el comparador lo leería como defecto, que es la clase de fantasma que se
   * hace pasar por hallazgo. Los rótulos de esta sonda viven fuera, en
   * `salida.rotulos`, donde nadie los aplana.
   */
  salida.paginas[`${P.etiqueta}::${P.ruta}`] = {
    forma: P.etiqueta,
    ruta: P.ruta,
    papel: `serie ${P.serie} · página ${P.n} (${P.pos})`,
    ...datos,
  };
  salida.rotulos[`${P.etiqueta}::${P.ruta}`] = {
    serie: P.serie,
    n: P.n,
    pos: P.pos,
    clase: P.clase,
    formaEstablecida: P.formaEstablecida,
  };
  await page.close().catch(() => {});
  await new Promise((r) => setTimeout(r, 400));
  ev.ok();

  console.log(
    `  ✓ ${String(i).padStart(3)}/${PAGINAS.length}  ${P.clave.padEnd(52)} ${P.etiqueta.padEnd(20)}` +
      ` h1.y ${String(datos.baseEnCrudo?.yAbsoluta ?? "—").padStart(8)} · tarjetas ${String(datos.listado.nTarjetas).padStart(3)}` +
      ` · paginador ${datos.paginador.enElCuerpo ? datos.paginador.piel ?? "sí" : "NO"}`,
  );
}

await browser.close();

const medidas = Object.values(salida.paginas);
const rot = Object.values(salida.rotulos);
salida.resumen = {
  paginas: medidas.length,
  porPosicion: rot.reduce((m, p) => ((m[p.pos] = (m[p.pos] || 0) + 1), m), {}),
  clasesTocadas: new Set(rot.map((p) => p.clase)).size,
  formasSinEstablecer: rot.filter((p) => !p.formaEstablecida).length,
  conPaginadorEnElCuerpo: medidas.filter((p) => p.paginador?.enElCuerpo).length,
  pielesDePaginador: [...new Set(medidas.map((p) => p.paginador?.piel ?? "ninguna"))].sort(),
};

console.log(`\n═══ ESPEJO @${ANCHO} — ${medidas.length} páginas`);
console.log(`  por posición         ${JSON.stringify(salida.resumen.porPosicion)}`);
console.log(`  clases tocadas       ${salida.resumen.clasesTocadas}`);
console.log(`  pieles de paginador  ${salida.resumen.pielesDePaginador.join(" · ")}`);

const muertos = censo.informe();
w(`medidas/lh-espejo-${ANCHO}.json`, salida);
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
