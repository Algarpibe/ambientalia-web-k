/**
 * MATRIZ DE COBERTURA — qué se ha comparado CONTRA EL ORIGINAL y qué no.
 * Uso: npm run qa:cobertura            (no necesita Chrome ni servidor)
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * En A-QA1b tres rutas resultaron tener el mismo defecto que una cuarta, y no
 * por fallar una comprobación: **nunca se habían comparado con el original en
 * ese eje**. El problema de fondo es que
 *
 *     «no hay defecto conocido» y «no se ha mirado» producen el MISMO informe.
 *
 * Sólo se distinguen con la lista de lo que se ha medido, y una lista escrita a
 * mano se pudre. Ésta se **computa de las salidas congeladas de `medidas/`**, o
 * sea que refrescarla es una corrida y no una tarde.
 *
 * ── Los tres estados, y por qué la distinción es el documento entero ───────
 *   O = comparado CONTRA EL ORIGINAL: alguna sonda abrió los DOS lados
 *   c = solo clon-contra-clon (`clon-base`, `offsets`): detecta regresión
 *       respecto a un build anterior y **no dice nada sobre fidelidad**
 *   · = nunca
 *
 * ⚠ `c` no es media medición: es cero información sobre fidelidad. Los tres
 * defectos de la miga vivían en rutas con `c` verde durante meses, y `clon-base`
 * dio 31/31 «sin mover un píxel» en la corrida que corregía +33.25 px de ancho.
 *
 * ── La guarda: una FUENTE QUE NO EXISTE ES UN ERROR, NO UN CERO ────────────
 * `CLAUDE.md` §sondas regla 4, aplicada a ficheros en vez de a selectores. Si
 * esta sonda declara que `mono-cmp-edar-1440.json` acredita el eje «módulos» y
 * el fichero no está, la celda saldría `·` — indistinguible de «nunca se midió».
 * Por eso toda fuente declarada y ausente sale por ERROR y cierra el código de
 * salida. Test en negativo: `SABOTAJE=1 npm run qa:cobertura` inventa una
 * fuente y tiene que salir con 2.
 */
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, hoy, w, enApp} from "./lib.mjs";

const M = path.join(QA, "medidas");
const SABOTAJE = !!process.env.SABOTAJE;
const hay = (f) => fs.existsSync(path.join(M, f));
const J = (f) => JSON.parse(fs.readFileSync(path.join(M, f), "utf8"));

/**
 * La congelación MÁS RECIENTE de una sonda: `base.json`, `base-FECHA.json`,
 * `base-FECHA-N.json`.
 *
 * ⚠ NO se ordena por nombre. `.` (0x2E) va DESPUÉS de `-` (0x2D), así que un
 * `.sort().pop()` elige `a-miga-1440-2026-08-01.json` por encima de
 * `…-08-01-4.json` — o sea la corrida de 8 pares en vez de la de 11. Da un
 * número plausible y MÁS BAJO, que es el peor fallo posible en una matriz de
 * cobertura: subestima en silencio. Se ordena por (fecha, secuencia) parseadas,
 * y el fichero sin fecha cuenta como el más antiguo.
 */
const congeladas = (base) => {
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:-(\\d{4}-\\d{2}-\\d{2})(?:-(\\d+))?)?\\.json$`);
  return fs
    .readdirSync(M)
    .map((x) => {
      const m = x.match(re);
      return m && { x, fecha: m[1] || "0000-00-00", seq: Number(m[2] || 1) };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.seq - b.seq)
    .map((o) => o.x);
};

/**
 * ⚠ La cobertura es la UNIÓN de todas las congelaciones, no la última.
 *
 * La pregunta que contesta la matriz es «¿se ha comparado ESTO alguna vez?», y
 * dos corridas de la misma sonda pueden cubrir rutas distintas: `c-banda`
 * congeló primero `world-athletics` + `kunak-api` y después **solo**
 * `/monitor-calidad-aire`. Quedarse con la última borraba dos rutas que sí se
 * habían medido — la matriz subestimaría, que es su peor fallo posible: manda a
 * remedir lo hecho y, peor, hace ruido donde no lo hay.
 */
const ultima = (base) => congeladas(base).pop();

/* ⚠ `enApp(...)`, no `path.enApp(...)`. La conversión a monorepo (F2-1, bcc2b83)
 * dejó aquí la llamada colgando del `path` de Node, o sea que **esta sonda no
 * arrancaba desde el 2026-08-03**: `TypeError` a nivel de módulo. No es un verde
 * falso —muere gritando y con código ≠0— pero sí una semana en la que la matriz
 * de cobertura **no se podía regenerar** y sólo se leía a mano. Lo destapó
 * intentar usarla, que es §regla 10: *una afirmación de completitud se verifica
 * ejercitándola.* */
const MANIFIESTO = enApp(".next/prerender-manifest.json");
if (!fs.existsSync(MANIFIESTO)) {
  console.error("❌ no hay .next/prerender-manifest.json — corre `npm run build` antes.");
  process.exit(2);
}
/* Contrato de `Evaluadas` (lib.mjs): la unidad es una RUTA de la matriz. Si el
 * manifiesto no da rutas no hay matriz que computar, y eso no es «matriz
 * limpia»: es NO SE PUDO EVALUAR. */
const RUTAS = Object.keys(JSON.parse(fs.readFileSync(MANIFIESTO, "utf8")).routes)
  .filter((r) => !r.startsWith("/_") && r !== "/favicon.ico")
  .sort();
const ev = new Evaluadas({ nombre: "cobertura", unidad: "rutas de la matriz", minimo: RUTAS.length });

/* ───────────────────────────── ejes y familias ───────────────────────────── */

const EJES = [
  ["docH", "docH"],
  ["base", "base cruda (h1.y)"],
  ["secciones", "árbol secciones"],
  ["filas", "filas"],
  ["modulos", "módulos"],
  ["offsets", "offsets/holgura"],
  ["anchos", "anchos horiz."],
  ["enlaces", "enlaces"],
  ["comport", "comportamiento"],
  /**
   * ⚠ **EJE NUEVO (2026-08-20, 85.ª tanda): la COMPOSICIÓN del pie.**
   *
   * No cabía en `secciones`. Ese eje dice *«el árbol del cuerpo cuadra»*, y el
   * pie **no está en el cuerpo**: en Divi vive en la capa `tb_footer`, y las
   * sondas que llenan `secciones` no bajan a él. Meterlo ahí habría subido un
   * eje ya poblado sin que nadie pudiera saber qué parte era del pie — que es
   * §*una cobertura declarada al nivel de arriba absorbe lo que no se midió
   * abajo*, cometida al declarar la cobertura.
   *
   * Lo que este eje afirma es estrecho y por eso es útil: **el pie se comparó
   * SECCIÓN A SECCIÓN contra el original**, no sólo su alto total —que es lo
   * único que `lh-cmp` miraba, y en eje mixto—.
   */
  ["pie", "pie (secciones)"],
];

const FAMILIAS = [
  ["HOME", (r) => r === "/"],
  ["PRODUCTO", (r) => r === "/monitor-calidad-aire"],
  ["CATÁLOGO", (r) => r === "/accesorios"],
  ["SOFTWARE", (r) => r === "/kunak-api" || r === "/software-de-medicion-calidad-del-aire"],
  ["MONOGRÁFICO", (r) => /^\/sectores\/(monitorizacion-ambiental|monitorizacion-de-emisiones-en-petroleo)/.test(r)],
  ["SECTOR", (r) => r.startsWith("/sectores/")],
  ["CASO", (r) => r.startsWith("/casos-de-exito/") || r.startsWith("/case-studies/")],
  ["FAQ", (r) => r.startsWith("/faqs/")],
  ["A · documento científico", (r) => r.startsWith("/recursos/")],
  ["A · blog / término", () => true],
];
const familia = (r) => FAMILIAS.find(([, t]) => t(r))[0];

/* ─────────────────── acreditaciones, leídas de los congelados ────────────── */

const cov = {};
const errores = [];
/** Marca celdas. `nivel`: "O" (dos lados) | "c" (solo clon). */
const set = (ejes, rutas, nivel, sonda, fichero) => {
  for (const eje of [].concat(ejes))
    for (const r of [].concat(rutas)) {
      if (!r) continue;
      cov[eje] ??= {};
      const prev = cov[eje][r];
      if (prev?.nivel === "O") continue; // O gana a c
      if (prev?.nivel === "c" && nivel === "c") continue;
      cov[eje][r] = { nivel, sonda, fichero };
    }
};
/** Toda fuente declarada tiene que existir: si no, ERROR (no cero). */
const fuente = (f) => {
  if (hay(f)) return true;
  errores.push(f);
  return false;
};

// 1 · clon-base — guarda de no-regresión: docH, base, nº secciones. SOLO CLON.
for (const f of ["clon-base-1440-aqa1b.json", "clon-base-390-aqa1b.json"])
  if (fuente(f)) set(["docH", "base", "secciones"], Object.keys(J(f).paginas || J(f)), "c", "clon-base", f.replace(".json", ""));

// 2 · c-cabecera — BASE EN CRUDO contra el original. Deriva rutas del build.
for (const f of [...congeladas("c-cabecera-1440"), ...congeladas("c-cabecera-390")]) {
  if (fuente(f)) set("base", Object.keys(J(f).paginas || {}), "O", "c-cabecera", f.replace(".json", ""));
}

// 2b · a-cascaron (original) emparejado A MANO con clon-base en A-QA1.
//      Es comparación real de base en crudo, pero NO la hace una sonda sola.
if (fuente("a-cascaron-1440-2026-07-31-4.json"))
  set(
    "base",
    [
      "/contaminacion-por-metano",
      "/todas-nuestras-soluciones-en-el-iotswc",
      "/emisiones-atmosfericas",
      "/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
    ],
    "O",
    "a-cascaron×clon-base (a mano)",
    "a-cascaron-{1440,390}-2026-07-31-4",
  );

// 3 · c-cmp — docH + árbol contra el original. Desde 2026-08-01 deriva del build
//     y congela la ruta en cada entrada, así que ya no hace falta mapa a mano.
for (const f of [...congeladas("c-cmp-1440"), ...congeladas("c-cmp-390")]) {
  if (!fuente(f)) continue;
  const pag = J(f).paginas || {};
  const rutas = Object.values(pag)
    .map((v) => v?.ruta)
    .filter(Boolean);
  set(["docH", "secciones"], rutas.length ? rutas : [], "O", "c-cmp", f.replace(".json", ""));
}

// 4 · mono-cmp — docH, árbol, filas y MÓDULOS de los 2 monográficos.
for (const cual of ["edar", "petroleo"])
  for (const wdt of [1440, 390]) {
    const f = `mono-cmp-${cual}-${wdt}.json`;
    if (!fuente(f)) continue;
    set(
      ["docH", "secciones", "filas", "modulos"],
      J(f).meta.clon.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, ""),
      "O",
      "mono-cmp",
      f.replace(".json", ""),
    );
  }

// 4b · lh-cmp — LISTADO-B par a par contra el original (66.ª tanda, F3-2).
//
//  ⚠ **Los ejes que se acreditan son los que la sonda COMPARA, no los que
//  toca.** Se acreditan `base` (con `P-LH-C8` verificando que es el mismo
//  elemento), `secciones`, `filas`, `modulos` y `anchos` —`rect.w`/`x` son eje
//  `plantilla` y se comparan contra el original—. **NO** se acredita:
//
//    · `docH`   — está en el `IGNORAR` del comparador: no lo compara;
//    · `enlaces`— compara `href` contra el CORPUS, que es otra pregunta que la
//                 de `enlaces.mjs` (contra las rutas que el build emite);
//    · `comport`/`offsets` — esta sonda no los mira.
//
//  Acreditar un eje que la sonda no compara es §la cobertura declarada al nivel
//  de arriba con el contenedor más cómodo: el nombre de la sonda.
//
//  Las rutas se DERIVAN de la congelada —y sólo las que el clon sirve—: una
//  forma AUSENTE no está comparada, está pendiente.
//  ⚠⚠ **Y LAS CORRIDAS `--vivo` NO ENTRABAN, que es el caso más fuerte que hay
//  (2026-08-14, 68.ª tanda).** `congeladas(base)` exige que el sufijo sea una
//  FECHA, así que `lh-cmp-1440-vivo.json` y `lh-cmp-1440-vivo-2026-08-14.json`
//  **no casaban con ningún patrón** y la matriz se quedaba con la comparación
//  contra el ESPEJO congelado, ignorando la del original VIVO.
//
//  No daba error: daba una matriz **plausible y baja** — §sondas 4, un patrón
//  que no casa no es un cero, y aquí el cero se leía como «esas rutas no están
//  comparadas» cuando lo están, y mejor.
//
//  ⚠⚠⚠ **Y VOLVIÓ A PASAR, CON `-todas` (2026-08-17, 73.ª tanda) — porque la vez
//  anterior se arregló LA INSTANCIA.** Añadir `congeladas("lh-cmp-<ancho>-vivo")`
//  a mano tapó el caso de julio y dejó la lista igual de frágil: `lh-cmp` nombra
//  su salida `lh-cmp-<ancho><-todas?><-vivo?>`, o sea **8 bases posibles**, y la
//  lista enumeraba **4**. Al ensanchar el espejo, las **61 formas** de
//  `lh-cmp-{1440,390}-todas.json` **no casaron con ninguna** y la matriz salió
//  IDÉNTICA a la de antes de comparar 82 páginas: `base 38 · filas 13 · módulos 9`.
//
//  Otra vez sin error y otra vez plausible. La lección no es «acuérdate de añadir
//  el sufijo nuevo» —eso es lo que falló— sino §regla 9 aplicada al instrumento:
//  **el conjunto se DERIVA de lo que hay en `medidas/`, no se escribe.** Un
//  sufijo futuro entra solo, como las rutas nuevas entran solas en `enlaces.mjs`.
//
//  El filtro es el de la §regla 7 al revés: entra todo `lh-cmp-*.json` MENOS lo
//  que el nombre declara que no es una medida del sitio.
const ARTEFACTO = /-neg-|SABOTAJE|SONDA-|CONTAMINADA|OBSOLETA|INTERRUMPIDA/;
const congeladasDe = (prefijo) =>
  fs
    .readdirSync(M)
    .filter((x) => x.startsWith(`${prefijo}-`) && x.endsWith(".json") && !ARTEFACTO.test(x))
    .sort();
for (const f of congeladasDe("lh-cmp")) {
  if (!fuente(f)) continue;
  const rutas = Object.values(J(f).formas || {})
    .filter((v) => v && v.estado && v.estado !== "AUSENTE")
    .map((v) => String(v.clon || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, ""))
    .filter(Boolean);
  set(["base", "secciones", "filas", "modulos", "anchos"], rutas, "O", "lh-cmp", f.replace(".json", ""));
}

/**
 * 4c · pie-cmp — la COMPOSICIÓN del pie, sección a sección contra el original
 * (85.ª tanda). Se deriva con `congeladasDe` por la misma razón que `lh-cmp`
 * (§regla 9, 7.º caso): un sufijo futuro tiene que entrar solo.
 *
 * ⚠ **Su unidad nativa es la FORMA, y la matriz cuenta RUTAS.** Cada forma
 * aporta **la ruta que se midió**, que es una por forma — así que este eje
 * marca **6**, no 374, y ése es su alcance real. Las 3 formas `ausentes`
 * (`L2-glosario` · `L2-faqs` · `L4`) **no se cuentan**: el clon no las emite, y
 * contarlas convertiría un hueco declarado en cobertura inventada.
 */
for (const f of congeladasDe("pie-cmp")) {
  if (!fuente(f)) continue;
  const rutas = Object.values(J(f).formas || {})
    .filter((v) => v && !v.error && v.orig && v.clon)
    .map((v) => String(v.rutaClon || ""))
    .filter(Boolean);
  set(["pie"], rutas, "O", "pie-cmp", f.replace(".json", ""));
}

// 5 · tree-cmp — árbol de secciones/filas del cuerpo, original vs clon.
for (const f of fs.readdirSync(M).filter((x) => /^tree-cmp-.*\.json$/.test(x)))
  set(["secciones", "filas"], J(f).meta.clon.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, ""), "O", "tree-cmp", f.replace(".json", ""));

// 5bis · productos-cmp — filas del CUERPO de PRODUCTO · CATÁLOGO · SOFTWARE
// (123.ª). Acredita SÓLO `filas`: el eje `modulos` está **SIN COMPARAR** porque
// el clon no emite marcador de módulo, y acreditarlo sería §*acreditar un eje
// que la sonda no COMPARA*. Los artefactos de §regla 7 —`-neg-`, `-SONDA-`— se
// descartan: una congelada de control no acredita nada.
/* ⚠ EL PATRÓN ERA `^productos-cmp-\d+\.json$` Y NO CASABA LAS FECHADAS.
 * `w()` desvía toda corrida cuyo contenido difiera a `<base>-<fecha>.json`
 * (§regla 5), así que en cuanto la sonda mide algo nuevo su congelada deja de
 * casar — y la matriz se queda leyendo la primera foto SIN DAR ERROR. Es §regla
 * 9, 7.º caso: un conjunto enumerado a mano dentro de una sonda, y es
 * exactamente lo que ya pasó dos veces con los sufijos de `lh-cmp`. Se deriva
 * con `congeladasDe`, que descarta los artefactos de la §regla 7 y deja entrar
 * solo lo nuevo. */
for (const f of congeladasDe("productos-cmp")) {
  const j = J(f);
  /* Una corrida que NO ACREDITA —canales sin cerrar— tampoco entra: mide, pero
   * su medida es plausible y falsa (§regla 32). */
  if (j.meta?.acredita === false) continue;
  for (const i of j.informe ?? []) {
    set(["filas"], i.ruta, "O", "productos-cmp", f.replace(".json", ""));
    /* ⚠⚠ Y `modulos` SÓLO donde la sonda comparó DE VERDAD ≥1 fila.
     *
     * Desde la 129.ª el clon emite `data-modulo`, pero **sólo en parte del
     * lote**: acreditar la ruta entera porque la sonda «ya mira módulos» sería
     * §*la cobertura declarada al nivel de arriba absorbe todo lo que no se
     * midió abajo*, con el contenedor puesto en la RUTA. Una ruta cuyas filas
     * salen todas `SIN MARCADOR` no tiene su eje comparado: lo tiene pendiente.
     *
     * La condición es `filasComparadas > 0`, no «la sonda soporta el eje». */
    if ((i.modulos?.filasComparadas ?? 0) > 0) set(["modulos"], i.ruta, "O", "productos-cmp", f.replace(".json", ""));
  }
}

// 6 · cmp-sector — sector ancla a ancla contra el original.
for (const f of fs.readdirSync(M).filter((x) => /^cmp-sector-.*\.json$/.test(x))) {
  const r = J(f).meta?.clon?.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  set(["secciones", "filas"], r, "O", "cmp-sector", f.replace(".json", ""));
}

// 7 · a-miga — ANCHOS, pero SOLO de la miga de pan (ver §caveat del informe).
{
  // ⚠ NO se ordena por nombre: `.` (0x2E) va DESPUÉS de `-` (0x2D), así que un
  // `.sort().pop()` elige `…-08-01.json` por encima de `…-08-01-4.json` y se
  // queda con la congelación de 8 pares en vez de la de 11. Da un número
  // plausible y más bajo — el peor tipo de fallo de sonda. Se ordena por
  // (fecha, secuencia) parseadas.
  const f = fs
    .readdirSync(M)
    .map((x) => {
      const m = x.match(/^a-miga-1440-(\d{4}-\d{2}-\d{2})(?:-(\d+))?\.json$/);
      return m && { x, fecha: m[1], seq: Number(m[2] || 1) };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.seq - b.seq)
    .pop()?.x;
  if (f) {
    const MAPA = {
      "blog CON relacionados": "/contaminacion-por-metano",
      "blog SIN relacionados": "/todas-nuestras-soluciones-en-el-iotswc",
      termino: "/emisiones-atmosfericas",
      "doc-cientifico":
        "/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
      "caso de éxito": "/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa",
      producto: "/monitor-calidad-aire",
      sector: "/sectores/calidad-del-aire-en-las-ciudades",
      "monográfico (petróleo)": "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
      accesorios: "/accesorios",
      software: "/software-de-medicion-calidad-del-aire",
      "kunak-api": "/kunak-api",
    };
    for (const k of Object.keys(J(f).pares || {})) set("anchos", MAPA[k], "O", "a-miga", f.replace(".json", ""));
  }
}

// 8 · c-banda — ancho/composición de la banda de título.
for (const f of [...congeladas("c-banda-1440"), ...congeladas("c-banda-390")])
  if (fuente(f)) set("anchos", Object.keys(J(f).paginas || {}), "O", "c-banda", f.replace(".json", ""));

// 9 · offsets — holgura de columna. SOLO CLON por construcción.
for (const f of fs.readdirSync(M).filter((x) => x.startsWith("offsets-") && x.endsWith(".json")))
  set("offsets", J(f).meta.ruta, "c", "offsets", f.replace(".json", ""));

// 10 · enlaces — las 31 contra las rutas que emite el build.
if (fuente("enlaces.json")) set("enlaces", J("enlaces.json").publicadas || RUTAS, "O", "enlaces", "enlaces");

/* 10b · f33-cmp — LA COLA LARGA, de dos lados. Entra el 2026-08-25 (107.ª), y
 * lo que lo tenía fuera NO era que no comparase: era un canal abierto.
 *
 * El motivo que lo excluía —§F3-3-CMP-IMAGENES-ROTAS— era que el comparador
 * cortaba la red **del lado del original y no del clon**, así que 65 de 71
 * imágenes del original medían 16 px y `docH` y todo alto con imagen dentro no
 * eran acreditables. La 105.ª y la 106.ª cerraron los tres canales y la corrida
 * de hoy lo dice en su propia salida: **«los TRES canales cerrados en las 31
 * páginas»**, con `hojas 7/7`, `imágenes 16/16` y Manrope cargada en las 31.
 *
 * ⚠ **EL MAPEO ES SEMÁNTICO Y SE ESCRIBE MIRANDO `pares.push`**, no derivándolo
 * del nombre de los ejes: los dos vocabularios no coinciden. Derivado de la
 * fuente (`f33-cmp.mjs` §4), lo que compara es:
 *
 *   `docH` `base` `nSecciones` `nFilas` `nModulos` `enlaces`  (pares directos)
 *   `ancho.filaN`                                             (ancho de fila)
 *   `caja.secN.{y,h,w}`                                       (árbol de secciones)
 *   `mod{i}.{w,h,mt,mb,pt,pb}`                                (nivel de módulo)
 *
 * ── Y LO QUE **NO** ACREDITA, cada uno con su razón (§regla 14) ───────────
 *   · `filas`   — compara el RECUENTO (`nFilas`) y el ANCHO de cada fila, y
 *                 **no su alto ni su ritmo**. El ancho ya lo acredita `anchos`;
 *                 acreditar además `filas` diría que la geometría de la fila
 *                 está comparada, y no lo está;
 *   · `offsets` — no mide holgura por columna. Es otra sonda;
 *   · `comport` — no hay interacción: es HTML servido, no comportamiento;
 *   · `pie`     — su `cascaron` es `pagina · area · contenido · barra`. **No
 *                 baja al pie**, que en Divi vive en la capa `tb_footer`.
 */
for (const f of [...congeladas("f33-cmp-1440"), ...congeladas("f33-cmp-390")]) {
  if (!fuente(f)) continue;
  const j = J(f);
  /* ⚠ Sólo las corridas del arquetipo ENTERO. Una del piloto (6 de 31) no puede
   * acreditar 31 rutas — sería §regla 7 en la matriz: un fichero con nombre de
   * medida acreditando una cobertura que no midió. */
  if ((j.meta?.dominio?.n ?? 0) < (j.meta?.dominio?.de ?? Infinity)) continue;
  /* Y sólo las rutas con los DOS lados: si el clon no sirvió, no hay par. */
  const rutas = Object.entries(j.paginas || {})
    .filter(([, p]) => p.clon && p.httpClon >= 200 && p.httpClon < 400)
    .map(([r]) => r.replace(/^\/es/, "").replace(/\/$/, "") || "/");
  set(["docH", "base", "secciones", "modulos", "anchos", "enlaces"], rutas, "O", f.replace(".json", ""));
}

/* 11 · comportamiento — la celda deja de estar vacía (2026-08-10, P-LH-C6).
 *
 * `a-behaviors` y `c-behaviors` SOLO abren el original: son recon de fase 1, y
 * censar el original no es comparar el clon. Por eso el eje llevaba **0/31**
 * desde que existe esta matriz — no por descuido, sino porque **ninguna sonda
 * lo miraba por los dos lados**.
 *
 * `comportamiento.mjs` sí, y por eso acredita `O`. Con dos condiciones que se
 * comprueban aquí y no se dan por hechas:
 *
 *   · la ruta tiene que ser del universo `emitidas` — las 9 formas de listado
 *     también se miden, pero su lado del clon es un **404 verificado**, o sea
 *     que no hay comparación de comportamiento que acreditar;
 *   · y tiene que haberse medido **el lado del clon**, no sólo el del original.
 *
 * ⚠ Sólo entran las rutas que la corrida MIDIÓ. La sonda mide **una ruta por
 * familia** salvo con `TODAS=1`, así que esta celda va a quedar parcial a
 * propósito: 13 de 37 es lo que se midió, y contar las 37 porque «la familia
 * está cubierta» sería el séptimo contenedor otra vez.
 *
 * ⚠⚠ **Y «familia» ahí no quiere decir lo mismo que en ESTE fichero, que es
 * cómo un arquetipo entero se quedó a cero sin que la cifra lo dijera
 * (2026-08-11).** `comportamiento.mjs` agrupa por `srcRoute` del manifiesto —13
 * grupos— y `FAMILIAS` de arriba agrupa por ARQUETIPO —10—. No son la misma
 * partición: `/sectores/[slug]` es **un** `srcRoute` que sirve **dos**
 * arquetipos (SECTOR y MONOGRÁFICO, §Páginas clonadas de `CLAUDE.md`), así que
 * tomar «la primera de cada `srcRoute`» eligió la de SECTOR y dejó
 * **MONOGRÁFICO en 0 de sus 2 rutas** — el arquetipo del que este repo ya sabe
 * que esconde los defectos de los componentes que comparte con SECTOR (el −36.02
 * del `h1`, §El NIVEL al que se mide). El `13/37` era cierto y el hueco no se
 * veía en él.
 *
 * Cerrado midiendo, no reinterpretando: la congelada etiquetada de abajo. Se
 * declara **por su nombre y no por glob** a propósito — un glob sobre
 * `comportamiento-1440-*` absorbería también una corrida `AFOR=`, que mide OTRA
 * ZONA de la afordancia y no puede acreditar el hover canónico.
 */
const PARCIALES_COMPORT = [
  // TODAS=1 SOLO=monitorizacion ETIQUETA=monografico · 5 rutas × 2 lados, 70/70
  "comportamiento-1440-emitidas-monografico.json",
  /* TODAS=1 UNIVERSO=emitidas · LAS 37 rutas × 2 lados · 518/518 con disparo
   * confirmado, 0 selectores muertos (2026-08-11). Es la corrida que quita el
   * «una por familia» del alcance: ya no hay que elegir de qué partición se
   * habla, porque están todas. Y sigue declarada POR NOMBRE y no por glob, por
   * la misma razón que la de arriba — un glob se tragaría una corrida `AFOR=`,
   * que mide OTRA ZONA de la afordancia y no acredita el hover canónico. */
  "comportamiento-1440-emitidas-todas.json",
];
for (const f of [...congeladas("comportamiento-1440"), ...congeladas("comportamiento-390"), ...PARCIALES_COMPORT]) {
  if (!fuente(f)) continue;
  const j = J(f);
  const rutas = Object.values(j.paginas || {})
    .filter((v) => v.universo === "emitidas" && v.clonEmitida)
    .map((v) => v.clon);
  set("comport", rutas, "O", "comportamiento", f.replace(".json", ""));
}

if (SABOTAJE) fuente("cobertura-FUENTE-INVENTADA.json");

/* ──────────────────────────────── informe ────────────────────────────────── */

const sim = (c) => (!c ? "·" : c.nivel === "O" ? "**O**" : "c");
const lineas = [];
lineas.push("| ruta | " + EJES.map(([, n]) => n).join(" | ") + " |");
lineas.push("|---|" + EJES.map(() => "---").join("|") + "|");
const orden = FAMILIAS.map(([n]) => n);
let ultimaFam = "";
for (const r of [...RUTAS].sort((a, b) => orden.indexOf(familia(a)) - orden.indexOf(familia(b)) || a.localeCompare(b))) {
  ev.ok();
  if (familia(r) !== ultimaFam) {
    ultimaFam = familia(r);
    lineas.push(`| **${ultimaFam}** |` + EJES.map(() => "").join("|") + "|");
  }
  lineas.push("| `" + r + "` | " + EJES.map(([e]) => sim(cov[e]?.[r])).join(" | ") + " |");
}

const recuento = EJES.map(([e, n]) => {
  const O = RUTAS.filter((r) => cov[e]?.[r]?.nivel === "O").length;
  const c = RUTAS.filter((r) => cov[e]?.[r]?.nivel === "c").length;
  const sondas = [...new Set(RUTAS.map((r) => cov[e]?.[r]?.sonda).filter(Boolean))];
  return { eje: e, nombre: n, O, c, nunca: RUTAS.length - O - c, sondas };
});

console.log(lineas.join("\n"));
console.log("\n=== RECUENTO POR EJE ===");
for (const x of [...recuento].sort((a, b) => b.O - a.O))
  console.log(
    x.nombre.padEnd(20),
    "O=" + String(x.O).padStart(2),
    " c=" + String(x.c).padStart(2),
    " nunca=" + String(x.nunca).padStart(2),
    " ← " + (x.sondas.join(" · ") || "NINGUNA"),
  );
console.log("\ntotal rutas emitidas:", RUTAS.length);

w("medidas/cobertura.json", {
  meta: { fecha: hoy(), rutas: RUTAS.length, sabotaje: SABOTAJE },
  recuento,
  matriz: Object.fromEntries(RUTAS.map((r) => [r, Object.fromEntries(EJES.map(([e]) => [e, cov[e]?.[r] ?? null]))])),
  tablaMarkdown: lineas.join("\n"),
});

if (errores.length) {
  console.log(
    `\n❌ ${errores.length} FUENTE(S) DECLARADA(S) QUE NO EXISTEN. Una fuente ausente\n` +
      `   deja su celda en «·», que es indistinguible de «nunca se midió»: la matriz\n` +
      `   mentiría a la baja sin dar un solo error. Restaura el fichero o quita su\n` +
      `   declaración de esta sonda:\n` +
      errores.map((e) => "     · medidas/" + e).join("\n"),
  );
  process.exit(2);
}

/**
 * ⚠⚠ **LA GUARDA DEL LADO CONTRARIO, Y ES LA QUE FALTABA TRES VECES
 * (2026-08-20, 86.ª tanda).**
 *
 * Arriba se caza *«una fuente declarada que no existe»*. El fallo que este
 * fichero ha tenido **tres veces** es el simétrico y no daba error ninguno:
 * *«una congelada que existe y que NADIE declaró»*. Pasó con el sufijo `-vivo`
 * en julio, con `-todas` en agosto y con **`pie-cmp` ayer** — y las tres veces
 * se arregló **la instancia**, añadiendo la línea que faltaba, que es por lo que
 * volvió.
 *
 * **La mitad derivable se deriva, y la que no, GRITA.** El mapeo *sonda → eje*
 * no se puede derivar: es semántico —qué mide `a-miga` y contra qué— y por eso
 * cada fuente sigue teniendo su bloque. Lo que sí se deriva es **el conjunto de
 * sondas que han congelado algo**, y de ahí las que ninguna fuente nombra.
 *
 * Así una sonda nueva **aparece en el informe el día que congela**, en vez de
 * ser invisible hasta que alguien note que la matriz no subió. Es §*el defecto
 * se pone en la dirección que grita* aplicado al sitio donde este repo ya se ha
 * tropezado tres veces.
 *
 * Las que **no aportan a la matriz por naturaleza** se declaran aquí una vez
 * —con su razón— y dejan de avisar. Declarar es barato; el olvido, no.
 */
const NO_APORTAN = new Set([
  "cobertura", "manifiesto", "slugs", "negativos", "ruido", "estados-390", "clon-estados",
  "lib", "artefacto", "esqueleto", "arbol-todos", "clase-censo", "clase-rango",
  "cms-campos", "cms-slugs", "cms-roundtrip", "cms-decl", "cms-teaser", "cms-arquetipos",
  "cms-lectura", "lectura-forma", "roles", "publicar", "publica-e2e", "pagina-propia",
  "media-hueco", "media-regenera", "media-srcset", "media-colision", "media-poblaciones",
  "media-canales", "media-siembra", "coloca-media", "productos-hueco", "saneador",
  "extractor", "extractor-a", "extractor-c", "extractor-kb", "extractor-listados", "extractor-corpus",
  "kb-extraido", "a-extraido", "c-extraido", "a-inventario", "c-inventario", "casos-nunca-vistos",
  "escalon-etiquetas", "hover-zonal", "t9-css", "texto-poblacion", "tipo-hoja", "vacio-legal",
  "seed-listados", "sondeo", "f25-final", "captura-css", "captura-f3", "captura-f3-media",
  "lh-censo", "lh-paginas", "lh-tarjetas", "lh-selectores", "lh-serie", "lh-alcance",
  "lh-espejo", "lh-barra", "lh-h1", "lh-ancla", "lh-spec", "lh-huecos", "lh-cubos",
  "lh-fecha-orden", "lh-jerarquia", "lh-extracto", "lh-extracto-unidad", "lh-pieles-css",
  "lh-subpixel", "lh-canales", "lh-poblacion", "lh-letra", "lh-barrido",
  // Las tres describen el ORIGINAL y sólo el original; quien compara los dos
  // lados es `pie-cmp`. `pie-legal` además no abre navegador: deriva de
  // `pie-mecanismo` y del corpus capturado, así que no puede aportar a una
  // matriz cuya unidad es «ruta comparada contra el original».
  "pie-familias", "pie-mecanismo", "pie-legal",
  /**
   * `f33-geo` (95.ª) — **UN SOLO LADO, y por eso no aporta.** Deriva la
   * geometría de las 31 de la cola larga del CORPUS CON SUS HOJAS, offline. Es
   * una medida buena del ORIGINAL y **no es una comparación**: quien compara
   * los dos lados es `qa:f33-cmp`.
   *
   * Acreditarle ejes aquí sería §*acreditar un eje que la sonda no compara* —
   * el mismo motivo por el que `f33-cmp` tampoco está en `DECLARADAS`.
   *
   * ⚠⚠ **PERO EL MOTIVO DE `f33-cmp` CAMBIÓ EL 2026-08-25 (105.ª), Y ESTE
   * COMENTARIO DECÍA LO DE ANTES.** Hasta la 104.ª rezaba *«sigue sin corrida de
   * verdad porque el lado del clon no existe»*, y **eso ya es falso**: la 104.ª
   * emitió y `f33-cmp` comparó las 31 a los dos anchos (2107 pares). Un
   * comentario que declara un hecho del repo envejece **contra** el repo (§regla
   * 9), y éste llevaba una tanda haciéndolo.
   *
   * **El motivo de hoy es otro y está medido:** el comparador corta la red del
   * lado del ORIGINAL y no del lado del CLON, así que **65 de 71 imágenes del
   * original miden 16 px** —el alto de un `<img>` roto— y `docH` y todo alto con
   * imagen dentro NO son acreditables (§F3-3-CMP-IMAGENES-ROTAS). Los ejes que
   * **no** dependen de imágenes sí están comparados y entran **en cuanto ese
   * canal se cierre**. El eje de MÓDULOS, que era la condición de la 104.ª, ya
   * está adjudicado: **47 de 47**.
   */
  "f33-geo",
  "dos-rutas", "c-rutas", "c-censo", "c-muestra", "c-spec", "c-embeds", "c-bases",
  "a-censo", "a-muestra", "a-behaviors", "a-scripts", "a-lexical", "a-ids", "a-embeds", "a-spec",
  "c-behaviors", "c1-localiza", "d4-pie", "d4-tipografia", "d4-cta", "d4-suscribete", "d123-flujo",
  "cabecera-cmp", "html-cmp", "rsc-original", "t4b-bloque", "cmp-srcset", "solutions-campos",
  "solutions-seo", "corte-cuerpo", "enlaces-clases", "c-cascaron", "a-cascaron",
]);
const DECLARADAS = new Set(["f33-cmp", "clon-base", "c-cabecera", "c-cmp", "mono-cmp", "lh-cmp", "pie-cmp", "tree-cmp", "cmp-sector", "a-miga", "c-banda", "offsets", "enlaces", "comportamiento", "ancho-cuerpo"]);
/**
 * ⚠ **El discriminador es que el prefijo sea UNA SONDA REAL, no que el nombre
 * parezca uno.** La primera versión partía el nombre del fichero por sufijos y
 * sacaba **106 huérfanas**, casi todas artefactos con nombre largo
 * (`ancho-diag-sector-img2`, `a-spec-SEGUNDA-CARGA-…`). Una lista de 106 no se
 * lee: se archiva — que es §*un patrón que casa en todas no mide nada*, y
 * habría hecho inútil la guarda el día de estrenarla.
 *
 * Se cruza contra `scripts/qa/*.mjs`: sólo avisa de congeladas cuyo prefijo
 * **es** una sonda del repo. Un artefacto no tiene `.mjs` y desaparece solo.
 */
const SONDAS = new Set(
  fs.readdirSync(QA).filter((f) => f.endsWith(".mjs") && !f.endsWith(".neg.mjs")).map((f) => f.replace(/\.mjs$/, "")),
);
const huerfanas = new Map();
for (const f of fs.readdirSync(M)) {
  if (!f.endsWith(".json") || ARTEFACTO.test(f)) continue;
  const base = f.replace(/\.json$/, "");
  /* El prefijo más largo que sea una sonda real. */
  let p = null;
  for (const s of SONDAS) if ((base === s || base.startsWith(s + "-")) && (!p || s.length > p.length)) p = s;
  if (!p || DECLARADAS.has(p) || NO_APORTAN.has(p)) continue;
  huerfanas.set(p, (huerfanas.get(p) || 0) + 1);
}
if (huerfanas.size) {
  console.log(
    `\n⚠ ${huerfanas.size} SONDA(S) CON CONGELADAS QUE NINGUNA FUENTE DECLARA.\n` +
      `   No es un error: puede que no aporten a la matriz. Pero se dice, porque la\n` +
      `   alternativa —el silencio— es como esta lista se quedó corta TRES veces.\n` +
      `   Añádelas arriba con su eje, o a NO_APORTAN con su razón:\n` +
      [...huerfanas.entries()].map(([p, n]) => `     · ${p}  (${n} congelada${n > 1 ? "s" : ""})`).join("\n"),
  );
}
console.log("\n✅ matriz computada · todas las fuentes declaradas existen.");
