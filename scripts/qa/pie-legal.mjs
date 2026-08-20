/**
 * LA SECCIÓN `legal` DEL PIE, DESCOMPUESTA — sección → fila → columna → módulo.
 * Uso: node scripts/qa/pie-legal.mjs        (npm run qa:pie-legal)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE: EL TOTAL ABSORBÍA LA COMPOSICIÓN
 *
 * La 86.ª cerró el pie con **tres pieles** (n = 64 · 12 · 6) y un mecanismo
 * medido —el ancho de FILA (1238.39 vs 1152) más el `padding` de sección—, y
 * dejó **un residuo sin adjudicar**: el contenido de `legal` difería
 * **`+22.67 @1440` · `+97 @390`**, citado como *«entre las pieles B y C»* y
 * *«en la columna de iconos sociales (115.86 vs 48.86)»*.
 *
 * Dos avisos venían con el encargo y **los dos se han cobrado**:
 *
 * 1. *«no des por hecho que es UNA causa»* — no lo es: son **tres componentes**;
 * 2. *«115.86 − 48.86 = 67.00 no reconstruye ninguno de los dos»* — cierto, y
 *    la razón es que **los dos números no son del mismo par de pieles**.
 *
 * ⚠ **`+22.67 / +97` es `B − A`, no `B − C`.** A 1440 da igual —A y C tienen la
 * misma fila `legal`, 121.97— pero **a 390 A y C difieren en 30**, así que a ese
 * ancho la etiqueta «B vs C» nombra un par y el número es de otro. Es §sondas 1
 * —*un número de un par se cita con sus dos lados o no se cita*— con el par
 * cambiado: aquí los dos lados no son original/clon, son **qué dos pieles**.
 *
 * ── Lo que la descomposición dice, y el total no podía ────────────────────
 * Restado el `padding` de sección (mecanismo YA medido en la 86.ª), el residuo
 * de `legal` vive **entero en `col1`, la columna de iconos**: `col0` (el widget
 * legal) y `col2` (el menú de idioma) son **idénticas en las tres pieles y a los
 * dos anchos**. Y dentro de `col1` hay **dos ejes independientes**:
 *
 * | eje | separa | @1440 | @390 |
 * |---|---|---|---|
 * | `font-size` del icono | **B** de {A, C} | 96 vs 25 px ⇒ **+67.00** | ídem ⇒ **+67.00** |
 * | `margin-bottom` de los hermanos | **A** de {B, C} | 18.5625 vs 17.2656 ⇒ +1.30 | 0 vs 30 ⇒ **+30** |
 *
 * **Entre B y C hay UNA sola causa** —el `font-size`—, y vale **+67.00 a los dos
 * anchos**. El `+22.67` de 1440 es ese mismo +67.00 con **44.33 absorbidos por la
 * columna hermana**: a 1440 las columnas van EN FILA y la fila la gobierna la más
 * alta, que en C es `col0` (93.19) porque `col1` sólo mide 48.86. A 390 apilan y
 * no hay dónde absorber, así que sale entero. §La causa común, con el contenedor
 * a la vista.
 *
 * ── El modelo de la columna, y es exacto 6/6 ──────────────────────────────
 *   col1.h = altoIcono + mbHermanos
 * en las 3 pieles × los 2 anchos, sin una excepción. Se comprueba aquí y **cierra
 * el código de salida**: un modelo que no reproduce sus 6 casos no es un modelo.
 *
 * ── EL MECANISMO, y hasta dónde llega el archivo ──────────────────────────
 * **Entre B y C el marcado de `legal` es IDÉNTICO** salvo los `href` — byte a
 * byte tras normalizarlos, y ése es justo el par del que va la conclusión. O sea
 * que el +67.00 **no está en el marcado**: §El principio, *«Divi no escribe
 * marcado: COMPILA CSS»*.
 *
 * ⚠ **Esta frase se ESTRECHÓ al derivarla, y conviene dejar por qué.** La
 * primera redacción decía *«idéntico en las TRES pieles»* — salido de leer un
 * diff a ojo. Comprobado por código da **2 firmas, no 1**: `B ≡ C`, y **A no
 * lleva el item de idioma `fr`** (3 contra 4, 344 caracteres). Es una diferencia
 * de **contenido** —esa página no tiene traducción al francés—, no de piel, y no
 * toca la geometría: `col2` mide **30 en las tres** a los dos anchos.
 *
 * Es §sondas 1 cobrada sobre la PROSA: la cabecera afirmaba y **nada contaba**.
 * Ahora lo cuenta, y cierra el código de salida.
 *
 * Y el CSS aparece — **en una de las tres**. La captura de C trae la regla EN
 * LÍNEA:
 *
 *   .et_pb_icon_N_tb_footer .et_pb_icon_wrap .et-pb-icon { … font-size:25px }
 *
 * A y B **no la traen**: su CSS del theme builder vive en una hoja ENLAZADA
 * (`et-cache/…/et-divi-dynamic-tb-*.css`) que **el corpus no capturó** —es el
 * cuarto canal de §*EL INVENTARIO DE MEDIA*, con 0 de 505 hojas capturadas—.
 *
 * Así que el mecanismo queda **IDENTIFICADO y NO VERIFICADO**, y la diferencia
 * importa: `96px` es **el valor por defecto del módulo de icono de Divi**, de
 * modo que la hipótesis es *«a la página de B no le llega la regla de 25px y cae
 * al defecto»*. Es una hipótesis con mecanismo y con dos casos a favor — o sea
 * exactamente la forma que §*una explicación con mecanismo y dos casos se parece
 * muchísimo a una medida* manda **no** dar por buena. Lo que la dirimiría son
 * **3 hojas** (`captura-css`), no 505 ni el original vivo.
 *
 * ── Cómo se deriva el `font-size` efectivo, y por qué no es una corazonada ─
 * De los **anchos de glifo**, que la sonda de mecanismo ya congeló: los 5 iconos
 * miden `0.875 · 1 · 0.875 · 1 · 1.125` em, y esas tres razones **coinciden
 * exactamente** en las tres pieles. Dividiendo, el cuerpo sale `25` en A y C y
 * `96` en B, en **6 lecturas independientes por piel**. Se comprueba que las 5
 * razones sean las mismas antes de dividir: si no lo fueran, no serían los mismos
 * iconos y la división no significaría nada.
 *
 * ── LO QUE ESTA SONDA NO MIDE (§regla 14: con su cardinal) ────────────────
 * - **el clon**: es de un lado. `pie-cmp` compara los dos;
 * - **3 hojas `et-divi-dynamic-tb-*.css`** de 3 pieles: **0 capturadas**. Sin
 *   ellas, el `font-size` de A y B se DERIVA de la geometría, no se lee;
 * - **el ruido** de estas rutas: sin campaña, un residuo pequeño es SIN PROBAR;
 * - **el `mb` a 390**: `0` en A y `30` en B y C. No es 1.5 % de ninguna fila
 *   (5.03 y 4.68), así que a ese ancho **el eje del ancho de fila NO lo explica**
 *   y se queda **SIN MECANISMO**, con su número.
 * ══════════════════════════════════════════════════════════════════════════ */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const ANCHOS = [1440, 390];
const PIELES = ["A", "B", "C"];

/** La captura de cada piel. Se declara aquí y **tiene que existir**: un fichero
 * que falta se rechaza, no se sustituye por un `continue` (§regla 6). */
const CAPTURA = {
  A: "corpus/fase-3/listados/blog/index.html",
  B: "corpus/fase-3/listados/glosario/index.html",
  C: "corpus/fase-3/listados/scientific-category/articulos-cientificos-y-estudios/index.html",
};

/* La unidad es la DESCOMPOSICIÓN de `legal`: una piel a un ancho. 3 × 2 = 6, y
 * se DERIVA de las dos listas para que añadir una piel suba el listón solo. */
const ev = new Evaluadas({ unidad: "descomposiciones de `legal` (piel × ancho)", minimo: PIELES.length * ANCHOS.length, nombre: "pie-legal" });

const raiz = join(QA, "..", "..");
const rel = (p) => join(raiz, p);
const r2 = (n) => +n.toFixed(2);

/* ── Los sabotajes, DECLARADOS aquí y no en el negativo ───────────────────
 * Cada uno anula UNA de las tres cosas que esta sonda afirma, y tiene que caer
 * **por su motivo** (§regla 17), no por una excepción ni por el código a secas:
 *
 * | sabotaje | anula | cae por |
 * |---|---|---|
 * | `mb-cero`      | el modelo `col1.h = altoIcono + mbHermanos` | el recuento 6/6 |
 * | `glifo-torcido`| que los 5 glifos sean los mismos iconos     | las firmas de razón |
 * | `corpus-mudo`  | el DENOMINADOR del cruce (las 149 capturas) | el dominio del cruce |
 */
const SABOTAJE = process.env.SABOTAJE || "";
const num = (v) => (typeof v === "string" ? parseFloat(v) : v) || 0;
/** El `mb` de un módulo. El sabotaje entra AQUÍ y no en `num()`: si entrara ahí
 * se llevaría también los `padding`, y entonces el caso caería por el control
 * de sección en vez de por el modelo — que es §regla 17, *caer por su motivo*. */
const mbDe = (m) => (SABOTAJE === "mb-cero" ? 0 : r2(num(m.mb)));
/** El ancho de glifo. `glifo-torcido` mueve uno **EN UNA SOLA PIEL**.
 *
 * ⚠ La primera versión lo movía en las seis lecturas y el negativo salió VERDE:
 * `firmasDistintas` compara las razones **entre lecturas**, así que una
 * perturbación uniforme produce otra firma… **única**. O sea que el sabotaje
 * no ejercitaba lo que su tabla prometía — §regla 17, y cazado por el propio
 * negativo en vez de por el código de salida. */
const anchoDe = (m, i, piel) => (SABOTAJE === "glifo-torcido" && piel === "C" && i === 0 ? r2(m.rect.w * 1.37) : m.rect.w);

/* ── 1 · La geometría, de la congelada de `pie-mecanismo` ─────────────────── */
const mec = {};
for (const a of ANCHOS) {
  const f = join(QA, `medidas/pie-mecanismo-${a}.json`);
  if (!existsSync(f)) throw new Error(`falta ${f} — esta sonda DERIVA de pie-mecanismo, no vuelve al original`);
  mec[a] = JSON.parse(readFileSync(f, "utf8"));
}

const salida = {
  meta: {
    fecha: hoy(),
    que: "la sección `legal` del pie, descompuesta hasta el módulo, en las 3 pieles y a los 2 anchos",
    lado: "SÓLO el original: geometría de `pie-mecanismo` + marcado y CSS del corpus capturado",
    unidad: "la descomposición (piel × ancho); el reparto se publica en la COLUMNA y en el MÓDULO",
    derivaDe: ANCHOS.map((a) => `medidas/pie-mecanismo-${a}.json`),
    noMide: [
      "el clon — esta sonda es de un lado; los dos los compara `pie-cmp`",
      "3 hojas `et-divi-dynamic-tb-*.css` (una por piel): 0 de 3 capturadas · 0 de 505 en el corpus entero",
      "el ruido de estas rutas: sin campaña, un residuo pequeño es SIN PROBAR",
      "el `mb` a 390 (0 en A · 30 en B y C): 2 valores, SIN MECANISMO",
    ],
  },
  descomposicion: {},
  columnas: {},
  modeloColumna: { formula: "col1.h = altoIcono + mbHermanos", casos: [], aciertos: 0, total: 0 },
  cuerpoDelIcono: {},
  canalCss: {},
  reparto: {},
  ejes: {},
};

/* ── 2 · Descomponer `legal`: sección → fila → columnas ───────────────────── */
for (const a of ANCHOS) {
  for (const p of PIELES) {
    const piel = mec[a].pieles[p];
    if (!piel) throw new Error(`pie-mecanismo-${a}.json no trae la piel ${p}`);
    const sec = Object.values(piel.secciones).find((s) => s.rol === "legal");
    if (!sec) throw new Error(`la piel ${p} @${a} no tiene sección con rol 'legal'`);
    const fila = sec.filas[0];
    const padSec = num(sec.padTop) + num(sec.padBottom);
    const padFila = num(fila.padTop) + num(fila.padBottom);
    const cols = fila.cols.map((c, i) => ({ i, h: c.rect.h, w: c.rect.w, y: c.rect.y, nModulos: c.nModulos }));

    salida.descomposicion[`${p}@${a}`] = {
      n: piel.n,
      ruta: piel.ruta,
      seccion: { h: sec.rect.h, padSeccion: r2(padSec) },
      fila: { h: fila.rect.h, w: fila.rect.w, padFila: r2(padFila), contenido: r2(fila.rect.h - padFila) },
      /* El control de la composición: sección = padding + fila. Si no cuadra,
       * la descomposición no es una descomposición y es una lista. */
      controlSeccion: r2(sec.rect.h - padSec - fila.rect.h),
      cols,
    };

    /* La columna de iconos y su modelo. `mbHermanos` es el `mb` de los cuatro
     * primeros (el quinto lleva 0 SIEMPRE, en las 6 lecturas). */
    const c1 = fila.cols[1];
    const mods = c1.modulos || [];
    const mbH = [...new Set(mods.slice(0, -1).map((m) => mbDe(m)))];
    const altos = [...new Set(mods.slice(0, -1).map((m) => m.rect.h))];
    if (mbH.length !== 1 || altos.length !== 1)
      throw new Error(`${p}@${a}: los 4 primeros iconos no son homogéneos (mb ${JSON.stringify(mbH)} · h ${JSON.stringify(altos)}) — el modelo asume que lo son`);
    const altoIcono = altos[0];
    const predicho = r2(altoIcono + mbH[0]);
    const acierta = Math.abs(predicho - c1.rect.h) < 0.01;
    salida.modeloColumna.casos.push({ caso: `${p}@${a}`, altoIcono, mbHermanos: mbH[0], predicho, medido: c1.rect.h, acierta });
    salida.modeloColumna.total++;
    if (acierta) salida.modeloColumna.aciertos++;

    /* El cuerpo del icono, DERIVADO de los anchos de glifo. Las razones tienen
     * que ser las mismas en las tres pieles: si no, no son los mismos iconos y
     * dividir no significa nada (el control va antes que el número). */
    const anchos = mods.map((m, i) => anchoDe(m, i, p));
    const base = anchos[1]; // el 2.º glifo es el de 1 em
    const razones = anchos.map((x) => +(x / base).toFixed(3));
    salida.cuerpoDelIcono[`${p}@${a}`] = { anchos, razones, cuerpoDerivado: base, altoIcono, mbHermanos: mbH[0] };
    salida.columnas[`${p}@${a}`] = { col0: cols[0].h, col1: cols[1].h, col2: cols[2].h };
    ev.ok();
  }
}

/* Control de las razones: los 5 glifos tienen que dar la MISMA firma en las 6
 * lecturas. Es lo que autoriza a leer el ancho como cuerpo × em. */
const firmas = [...new Set(Object.values(salida.cuerpoDelIcono).map((v) => JSON.stringify(v.razones)))];
salida.controlRazones = { firmasDistintas: firmas.length, firmas };

/* ── 3 · El reparto, por componente y con su signo ────────────────────────── */
const D = salida.descomposicion;
for (const a of ANCHOS) {
  const par = (x, y) => ({
    padSeccion: r2(D[`${x}@${a}`].seccion.padSeccion - D[`${y}@${a}`].seccion.padSeccion),
    fila: r2(D[`${x}@${a}`].fila.h - D[`${y}@${a}`].fila.h),
    col0: r2(D[`${x}@${a}`].cols[0].h - D[`${y}@${a}`].cols[0].h),
    col1: r2(D[`${x}@${a}`].cols[1].h - D[`${y}@${a}`].cols[1].h),
    col2: r2(D[`${x}@${a}`].cols[2].h - D[`${y}@${a}`].cols[2].h),
    seccion: r2(D[`${x}@${a}`].seccion.h - D[`${y}@${a}`].seccion.h),
  });
  salida.reparto[`@${a}`] = { "B-C": par("B", "C"), "B-A": par("B", "A"), "A-C": par("A", "C") };
  /* Lo absorbido: cuánto del Δ de `col1` NO llega a la fila. A 1440 las columnas
   * van en fila y la gobierna la más alta; a 390 apilan. */
  const abs = (x, y) => r2(salida.reparto[`@${a}`][`${x}-${y}`].fila - salida.reparto[`@${a}`][`${x}-${y}`].col1);
  salida.reparto[`@${a}`].absorbidoPorLaHermana = { "B-C": abs("B", "C"), "B-A": abs("B", "A"), "A-C": abs("A", "C") };
}

/* ── 4 · El canal CSS: ¿trae cada captura la regla, o la enlaza? ──────────── */
const RE_ICONO = /et_pb_icon_\d_tb_footer/g;
/* ⚠ DOS reglas, y confundirlas es §sondas 4 en su tercera cara —*el
 * sobre-casado no da error: da un número plausible de más*. La primera versión
 * de esta sonda usaba `/et-pb-icon[^}]*font-size:(\d+)px/` y devolvía **96 en
 * las tres pieles**, incluidas las dos que tienen CERO selectores de módulo en
 * línea. No estaba leyendo el override: estaba leyendo **el DEFECTO del tema**,
 * `.et-pb-icon{…font-size:96px;line-height:1}`, que Divi inlina siempre.
 *
 * Lo delató que contradecía al recuento de al lado (`enCssEnLinea: 0` y sin
 * embargo «servido: 96px»), que es el control de §sondas 4: *la contradicción
 * con otra medida de la misma corrida*. Y el número mal leído resultó ser el
 * dato que faltaba: **96 es el defecto**, o sea el valor al que cae quien no
 * recibe el override. */
const RE_DEFECTO = /\.et-pb-icon\{[^}]*font-size:\s*(\d+(?:\.\d+)?)px/;
const RE_OVERRIDE = /et_pb_icon_\d_tb_footer[^{}]*\.et-pb-icon[^{]*\{[^}]*font-size:\s*(\d+(?:\.\d+)?)px/;
for (const p of PIELES) {
  const f = rel(CAPTURA[p]);
  if (!existsSync(f)) throw new Error(`falta la captura de la piel ${p}: ${CAPTURA[p]}`);
  const h = readFileSync(f, "utf8");
  const estilos = [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const hojas = [...h.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/g)].map((m) => (m[0].match(/href=["']([^"']+)/) || [])[1]).filter(Boolean);
  const dinamica = hojas.find((x) => /et-divi-dynamic-tb-/.test(x)) || null;
  const d = estilos.match(RE_DEFECTO);
  const o = estilos.match(RE_OVERRIDE);
  salida.canalCss[p] = {
    captura: CAPTURA[p],
    enMarcado: (h.match(RE_ICONO) || []).length,
    enCssEnLinea: (estilos.match(RE_ICONO) || []).length,
    defectoDeDiviEnLinea: d ? Number(d[1]) : null,
    overrideDelModuloEnLinea: o ? Number(o[1]) : null,
    hojaDinamicaDelThemeBuilder: dinamica ? dinamica.replace(/\?.*/, "").replace("https://kunakair.com", "") : null,
    hojaCapturada: false, // 0 de 505 en el corpus (§F3-1-CSS-NO-CAPTURADO)
  };
}
/* ── El marcado: la afirmación «es idéntico» se DERIVA, no se recuerda ─────
 * La cabecera de esta sonda dice que el marcado de `legal` es idéntico en las
 * tres pieles salvo los `href` del selector de idioma. Eso es una afirmación
 * sobre el dato, y si nada la comprueba es §sondas 1 —*lo que imprime y lo que
 * cuenta no pueden discrepar*— con el canal cambiado: la prosa afirma y el
 * código no cuenta. Se extrae la sección de cada captura, se normalizan los
 * `href` (que es la excepción DECLARADA) y se compara. */
const seccionLegalDe = (h) => {
  const i = h.indexOf("footer-legal");
  if (i < 0) return null;
  const ini = h.lastIndexOf('<div class="et_pb_section', i);
  const marca = h.indexOf("et_pb_section_2_tb_footer", i);
  const fin = marca < 0 ? i + 9000 : h.lastIndexOf('<div class="et_pb_section', marca);
  return h.slice(ini, fin);
};
const sinHrefs = (s) => s.replace(/href="[^"]*"/g, 'href="—"').replace(/\s+/g, " ").trim();
const marcados = {};
for (const p of PIELES) {
  const s = seccionLegalDe(readFileSync(rel(CAPTURA[p]), "utf8"));
  if (!s) throw new Error(`la captura de ${p} no tiene la sección footer-legal`);
  marcados[p] = { largo: s.length, normalizado: sinHrefs(s) };
}
const idiomasDe = (s) => [...new Set(s.match(/wpml-ls-item-([a-z]{2})/g) || [])].map((x) => x.slice(-2)).sort();
salida.controlMarcado = {
  /* ⚠ **LA AFIRMACIÓN SE ESTRECHÓ AL DERIVARLA, y ése es el hallazgo.** La
   * primera redacción decía *«el marcado es idéntico en las TRES pieles salvo
   * los href»*, que es lo que salió de leer un diff a ojo. Derivado, da **2
   * firmas, no 1**: `B ≡ C` byte a byte, y **A no lleva el item de idioma
   * `fr`** (3 items contra 4) — 344 caracteres normalizados de diferencia.
   *
   * La conclusión no cambia y se apoya mejor: lo que hace falta para descartar
   * el marcado como causa del +67.00 es **`B ≡ C`**, que es exactamente el par
   * en cuestión. La diferencia de A es de CONTENIDO (esa página no tiene
   * traducción al francés), no de piel, y no toca la geometría: `col2` mide
   * **30 en las tres** a los dos anchos.
   *
   * §sondas 1 cobrada sobre la PROSA: la cabecera afirmaba y nada contaba. */
  afirmacion: "entre las pieles B y C el marcado de `legal` es IDÉNTICO salvo los `href` — que es el par del que va la conclusión",
  excepcionDeclarada: "los `href` se normalizan antes de comparar; sin normalizarlos, las 3 difieren",
  B_identico_a_C: marcados.B.normalizado === marcados.C.normalizado,
  A_difiere: marcados.A.normalizado !== marcados.C.normalizado,
  porQueDifiereA: {
    idiomas: Object.fromEntries(PIELES.map((p) => [p, idiomasDe(marcados[p].normalizado)])),
    caracteresDeDiferencia: marcados.C.normalizado.length - marcados.A.normalizado.length,
    efectoGeometrico: "NINGUNO: `col2` (el menú de idioma) mide 30 en las 3 pieles y a los 2 anchos",
    queEs: "contenido (esa página no tiene traducción al francés), no piel",
  },
  largos: Object.fromEntries(PIELES.map((p) => [p, marcados[p].largo])),
  /* El control en negativo de la propia comprobación: SIN normalizar, B y C
   * tienen que DIFERIR. Si no difirieran, la normalización no estaría
   * discriminando nada y el «idéntico» sería un pleno que no mide. */
  BdifiereDeCsinNormalizar:
    seccionLegalDe(readFileSync(rel(CAPTURA.B), "utf8")).replace(/\s+/g, " ") !== seccionLegalDe(readFileSync(rel(CAPTURA.C), "utf8")).replace(/\s+/g, " "),
};

const conRegla = PIELES.filter((p) => salida.canalCss[p].overrideDelModuloEnLinea !== null);
const enlazan = PIELES.filter((p) => salida.canalCss[p].overrideDelModuloEnLinea === null);
salida.canalCss.__resumen = {
  defectoDeDivi: [...new Set(PIELES.map((p) => salida.canalCss[p].defectoDeDiviEnLinea))],
  pielesConElOverrideEnLinea: conRegla.length,
  cuales: conRegla,
  pielesQueLoENLAZAN: enlazan.length,
  cualesEnlazan: enlazan,
  hojasQueHabriaQueCapturarParaCerrarlo: enlazan.length,
  /* §sondas 4: la afirmación «no existe» se escribe con la lista de canales
   * mirados, o es una afirmación sobre el canal y no sobre el dato. */
  canalesMirados: ["el marcado de la sección entera (diff de las 3)", "todo `<style>` en línea", "los `<link rel=stylesheet>` (nombres, no contenido)"],
};

/* ══════════════════════════════════════════════════════════════════════════
 * 4bis · EL DENOMINADOR: de 3 capturas a las 149
 *
 * Lo de arriba es *«una explicación con mecanismo y DOS casos a favor»*, que es
 * exactamente la forma que `CLAUDE.md` manda **no** dar por buena: *«se parece
 * muchísimo a una medida, y la única diferencia es EL DENOMINADOR»*. Así que
 * antes de escribir nada, se barre **el dominio alcanzable entero** — las 149
 * capturas del corpus de listados — cruzando tres cosas:
 *
 *   piel  ×  contexto de caché de la hoja dinámica  ×  ¿trae el override en línea?
 *
 * Si el contexto `archive/` cae 1:1 con la piel B en las 149, la afirmación deja
 * de apoyarse en 3 páginas. Y si NO cae, eso también es el resultado: el eje
 * elegido sería la sombra de otro (§*un discriminador 1:1 puede ser la sombra
 * de otro*).
 *
 * ⚠ La piel de cada ruta **no se adivina**: sale de `pie-familias.json`, que ya
 * agrupó las 82 formas por su firma medida. Escribirla a mano aquí sería un dato
 * recordado (§regla 9).
 * ══════════════════════════════════════════════════════════════════════════ */
const FAM = join(QA, "medidas/pie-familias.json");
if (!existsSync(FAM)) throw new Error(`falta ${FAM} — la piel de cada ruta se DERIVA de ahí, no se escribe a mano`);
const familias = JSON.parse(readFileSync(FAM, "utf8"));
/* Los grupos de `pie-familias` van por índice; se les pone nombre por su `legal`
 * y su `padding`, que es lo que `pie-mecanismo` midió — no por el orden. */
const grupos = familias.pieles["1440"];
const nombreDePiel = {};
for (const [i, g] of Object.entries(grupos)) {
  const legal = g.partes.legal;
  const cual = PIELES.find((p) => D[`${p}@1440`].seccion.h === legal && D[`${p}@1440`].fila.w === (legal === 259.83 ? 1152 : D[`${p}@1440`].fila.w));
  /* La firma que separa las tres a 1440 es (legal, links). Se busca por las dos. */
  const exacto = PIELES.find((p) => D[`${p}@1440`].seccion.h === legal && Math.abs(mec[1440].pieles[p].secciones[0].rect.h - g.partes.links) < 0.01);
  const p = exacto || cual;
  if (!p) throw new Error(`el grupo ${i} de pie-familias (legal ${legal}, links ${g.partes.links}) no casa con ninguna piel de pie-mecanismo`);
  for (const forma of Object.keys(g.formas)) nombreDePiel[forma] = p;
}

/** De una ruta capturada a su FORMA, con el mismo criterio que `pie-familias`. */
const formaDeRuta = (r) =>
  r.startsWith("glosario") ? "L2-glosario"
  : r.startsWith("preguntas-frecuentes") ? "L2-faqs"
  : r.startsWith("scientific-category") ? "L3-sci"
  : r.startsWith("blog") ? "L1-blog"
  : r.startsWith("etiqueta") ? "L1-etiqueta"
  : r.startsWith("casos-de-exito") ? "L5-casos"
  : r === "recursos" ? "L4-listado-embebido"
  : r.startsWith("recursos/articulos/") && r.split("/").length > 2 && !/^recursos\/articulos\/page\//.test(r) ? "L1-resources-hijo"
  : r.startsWith("recursos") ? "L1-resources-padre"
  : null;

const RAIZ_CORPUS = rel("corpus/fase-3/listados");
const anda = (d, out = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
};
/* El listón del cruce se DERIVA del corpus entero, no del subárbol que el
 * sabotaje pueda estar mirando: así `corpus-mudo` no puede mover la portería
 * (§regla 17 · *un sabotaje que comparte variable con el mínimo no lo
 * ejercita*). Se cuenta sobre la raíz de verdad, siempre. */
const MIN_CRUCE = Math.floor(anda(rel("corpus/fase-3/listados")).length * 0.9);
/* ⚠ `corpus-mudo` FILTRA, no reapunta la raíz. La primera versión apuntaba
 * `RAIZ_CORPUS` al subárbol de `glosario`, y con eso las rutas relativas salían
 * vacías, `formaDeRuta` devolvía `null` en todas y el caso caía por «0
 * clasificadas» — o sea por otro motivo. Filtrando, las 12 se clasifican bien,
 * `esUnoAUno` SIGUE en `true`, y lo único que se desploma es el DENOMINADOR:
 * que es exactamente la guarda que este caso viene a ejercitar. */
const capturas = anda(RAIZ_CORPUS).filter((f) => SABOTAJE !== "corpus-mudo" || /[\\/]glosario[\\/]/.test(f));
const cruce = {};
const sinForma = [];
for (const f of capturas) {
  const h = readFileSync(f, "utf8");
  const estilos = [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const hoja = (h.match(/et-cache\/[^"'?]*et-divi-dynamic-tb-[^"'?]*/) || [])[0] || null;
  const ctx = hoja ? hoja.replace(/^et-cache\//, "").split("/")[0] : "(sin hoja dinámica)";
  const ov = estilos.match(RE_OVERRIDE);
  const r = f.slice(RAIZ_CORPUS.length + 1).split(/[\\/]/).slice(0, -1).join("/");
  const forma = formaDeRuta(r);
  if (!forma || !nombreDePiel[forma]) { sinForma.push(r); continue; }
  const clave = `${nombreDePiel[forma]} · ctx=${ctx} · override ${ov ? ov[1] + "px" : "ENLAZADO"}`;
  (cruce[clave] ||= { n: 0, ejemplo: r }).n++;
}
salida.cruceContextoDeCache = {
  capturas: capturas.length,
  clasificadas: capturas.length - sinForma.length,
  sinClasificar: sinForma.length,
  ejemplosSinClasificar: sinForma.slice(0, 8),
  grupos: cruce,
};
/* El discriminador: ¿el contexto `archive/` cae 1:1 con la piel B? */
const ctxDePiel = {};
for (const [k, v] of Object.entries(cruce)) {
  const [p, c] = k.split(" · ");
  ((ctxDePiel[p.trim()] ||= {})[c.replace("ctx=", "").trim()] ||= 0);
  ctxDePiel[p.trim()][c.replace("ctx=", "").trim()] += v.n;
}
salida.cruceContextoDeCache.contextosPorPiel = ctxDePiel;
const ctxB = Object.keys(ctxDePiel.B || {});
const ctxOtros = new Set([...Object.keys(ctxDePiel.A || {}), ...Object.keys(ctxDePiel.C || {})]);
salida.cruceContextoDeCache.veredicto = {
  contextosDeB: ctxB,
  contextosDeAyC: [...ctxOtros],
  esUnoAUno: ctxB.length === 1 && !ctxOtros.has(ctxB[0]),
  n: Object.values(ctxDePiel).reduce((s, o) => s + Object.values(o).reduce((a, b) => a + b, 0), 0),
};

/* ── 5 · Los ejes, nombrados uno a uno ────────────────────────────────────── */
const cuerpoPorPiel = Object.fromEntries(PIELES.map((p) => [p, [...new Set(ANCHOS.map((a) => salida.cuerpoDelIcono[`${p}@${a}`].cuerpoDerivado))]]));
const mbPorPiel = Object.fromEntries(PIELES.map((p) => [p, Object.fromEntries(ANCHOS.map((a) => [a, salida.cuerpoDelIcono[`${p}@${a}`].mbHermanos]))]));
salida.ejes = {
  "1-cuerpoDelIcono": {
    valores: cuerpoPorPiel,
    separa: "B de {A, C}",
    aporta: { "@1440": salida.reparto["@1440"]["B-C"].col1, "@390": salida.reparto["@390"]["B-C"].col1 },
    mecanismo:
      "CSS compilado. El DEFECTO del tema —`.et-pb-icon{…font-size:96px;line-height:1}`— viene EN LÍNEA en las tres capturas, y es exactamente lo que mide B. " +
      "El override por módulo —`.et_pb_icon_N_tb_footer … .et-pb-icon{…font-size:25px}`— viene en línea SÓLO en C; A y B lo ENLAZAN en su `et-divi-dynamic-tb-*.css`. " +
      "A mide 25 (le llega por la hoja) y B mide 96 (no le llega, o su hoja no lo trae)",
    estado: "IDENTIFICADO con n = 145 · el TEXTO de la regla NO leído — lo dirime UNA hoja (`et-cache/archive/et-divi-dynamic-tb-140-tb-342.css`), no capturada",
    discriminador: "el CONTEXTO DE CACHÉ de la hoja dinámica: `archive/` en las 12 de la piel B y en NINGUNA de las 133 restantes (1:1, n = 145)",
    control: "dentro de la piel A, 37 páginas TRAEN el override en línea y 63 lo ENLAZAN, y las dos miden 25px ⇒ «enlazarlo» no es el eje",
    confundidoCon: "«ser el archivo de un CPT» — las 12 son `glosario` y `preguntas-frecuentes`, así que las dos variables van juntas en todo el dominio",
    queLoDirimiria: "un GET a la hoja `archive/` y buscar `font-size:25px` en el selector del módulo. 1 fichero, no 505 — pero es volver al original: §disparador (b)",
    paraConstruir:
      "NO hace falta el porqué: el CUÁNTO está medido —`legal` 259.83 @1440 y 480.75 @390 en las 12 instancias, varianza cero (`pie-familias`)—. " +
      "Es un TERCER eje de la piel de pie, no una hipótesis",
  },
  "2-mbDeLosHermanos": {
    valores: mbPorPiel,
    separa: "A de {B, C} — NO separa B de C",
    aporta: { "@1440": salida.reparto["@1440"]["A-C"].col1, "@390": salida.reparto["@390"]["A-C"].col1 },
    mecanismo:
      "@1440 es 1.5 % del ancho de FILA (18.5625/1237.5 = 17.2656/1151.04 = 1.4989 %), o sea EL MISMO eje del mecanismo de las pieles. " +
      "@390 vale 0 y 30, que no son 1.5 % de 335.39 (5.03) ni de 312 (4.68): SIN MECANISMO",
    estado: "@1440 EXPLICADO por el ancho de fila · @390 SIN MECANISMO",
  },
  "3-paddingDeSeccion": {
    valores: Object.fromEntries(PIELES.map((p) => [p, Object.fromEntries(ANCHOS.map((a) => [a, D[`${p}@${a}`].seccion.padSeccion]))])),
    separa: "B de {A, C}",
    mecanismo: "medido en la 86.ª tanda (`pie-mecanismo`): es uno de los dos ejes binarios de las pieles",
    estado: "YA MEDIDO — no es residuo",
  },
};

/* ── 6 · Informe ─────────────────────────────────────────────────────────── */
console.log(`\n════════ LA SECCIÓN \`legal\` DEL PIE, DESCOMPUESTA ════════`);
console.log(`  deriva de   ${salida.meta.derivaDe.join(" · ")}`);
console.log(`  unidad      ${salida.meta.unidad}\n`);

for (const a of ANCHOS) {
  console.log(`  ── @${a} · sección = padding + fila; fila = padding + la columna que la gobierna ──`);
  console.log(`  ${"piel".padEnd(6)}${"n".padStart(4)}  ${"secc".padStart(8)} = ${"pad".padStart(7)} + ${"fila".padStart(8)}   │ ${"col0".padStart(7)} ${"col1".padStart(7)} ${"col2".padStart(6)}   fila w`);
  for (const p of PIELES) {
    const d = D[`${p}@${a}`];
    console.log(
      `  ${p.padEnd(6)}${String(d.n).padStart(4)}  ${String(d.seccion.h).padStart(8)} = ${String(d.seccion.padSeccion).padStart(7)} + ${String(d.fila.h).padStart(8)}` +
        `   │ ${String(d.cols[0].h).padStart(7)} ${String(d.cols[1].h).padStart(7)} ${String(d.cols[2].h).padStart(6)}   ${d.fila.w}`,
    );
  }
  const R = salida.reparto[`@${a}`];
  console.log(`  ── el reparto, y OJO A QUÉ PAR DE PIELES es cada número ──`);
  for (const par of ["B-C", "B-A", "A-C"])
    console.log(
      `   ${par}   sección ${String(R[par].seccion).padStart(8)}  =  padSecc ${String(R[par].padSeccion).padStart(7)}  +  fila ${String(R[par].fila).padStart(7)}` +
        `   │ col0 ${String(R[par].col0).padStart(5)} · col1 ${String(R[par].col1).padStart(6)} · col2 ${String(R[par].col2).padStart(4)}` +
        `   │ absorbido por la hermana ${String(R.absorbidoPorLaHermana[par]).padStart(7)}`,
    );
  console.log("");
}

console.log(`  ── el modelo de la columna de iconos: ${salida.modeloColumna.formula} ──`);
for (const c of salida.modeloColumna.casos)
  console.log(`   ${c.acierta ? "✓" : "❌"} ${c.caso.padEnd(8)} ${String(c.altoIcono).padStart(7)} + ${String(c.mbHermanos).padStart(8)} = ${String(c.predicho).padStart(8)}   medido ${c.medido}`);
console.log(`   ${salida.modeloColumna.aciertos}/${salida.modeloColumna.total} — y si no fueran las 6, no sería un modelo\n`);

console.log(`  ── el cuerpo del icono, DERIVADO de los anchos de glifo ──`);
console.log(`   control · firmas de razón distintas entre las 6 lecturas: ${salida.controlRazones.firmasDistintas}  ${salida.controlRazones.firmasDistintas === 1 ? "(la misma ⇒ son los mismos 5 iconos)" : "⛔ NO son los mismos iconos: dividir no significa nada"}`);
for (const p of PIELES) console.log(`   piel ${p}   cuerpo ${JSON.stringify(cuerpoPorPiel[p])} px   ·   mb hermanos ${JSON.stringify(mbPorPiel[p])}`);

console.log(`\n  ── el canal CSS: dónde vive la regla que lo decide ──`);
for (const p of PIELES) {
  const c = salida.canalCss[p];
  console.log(
    `   piel ${p}   marcado ${String(c.enMarcado).padStart(3)} · selectores de módulo en el CSS en línea ${String(c.enCssEnLinea).padStart(3)}` +
      `   │ DEFECTO de Divi ${c.defectoDeDiviEnLinea}px` +
      `   │ override del módulo ${c.overrideDelModuloEnLinea === null ? "— (lo ENLAZA)" : c.overrideDelModuloEnLinea + "px"}` +
      `   │ MEDIDO ${salida.cuerpoDelIcono[`${p}@1440`].cuerpoDerivado}px`,
  );
  console.log(`             hoja dinámica del theme builder: ${c.hojaDinamicaDelThemeBuilder}   ← NO capturada`);
}
const RES = salida.canalCss.__resumen;
console.log(`   ⚠ ${RES.pielesQueLoENLAZAN} de ${PIELES.length} pieles ENLAZAN el override (${RES.cualesEnlazan.join(" · ")}): ${RES.hojasQueHabriaQueCapturarParaCerrarlo} hojas lo dirimen (§F3-1-CSS-NO-CAPTURADO, 0 de 505 capturadas)`);
console.log(`   y el DEFECTO de Divi vale ${JSON.stringify(RES.defectoDeDivi)} px en las tres — que es EXACTAMENTE lo que mide la piel B`);
console.log(`   canales mirados para decir «no está en el marcado»: ${RES.canalesMirados.join(" · ")}`);
const CM = salida.controlMarcado;
console.log(
  `   y «el marcado es idéntico» DERIVADO, no recordado:  B≡C ${CM.B_identico_a_C}  ·  A difiere ${CM.A_difiere}` +
    `  (le falta el idioma: ${JSON.stringify(CM.porQueDifiereA.idiomas)}, ${CM.porQueDifiereA.caracteresDeDiferencia} chars — CONTENIDO, no piel; col2 = 30 en las 3)
` +
    `   control · B≠C SIN normalizar: ${CM.BdifiereDeCsinNormalizar} (si fuera false, normalizar no discriminaría nada)`,
);

const CR = salida.cruceContextoDeCache;
console.log(`\n  ── EL DENOMINADOR: de 3 capturas a las ${CR.capturas} (§«la única diferencia es EL DENOMINADOR») ──`);
console.log(`   capturas ${CR.capturas} · clasificadas ${CR.clasificadas} · SIN CLASIFICAR ${CR.sinClasificar}  ${CR.sinClasificar ? "(" + CR.ejemplosSinClasificar.join(" · ") + " — no son formas de `pie-familias`)" : ""}`);
for (const [k, v] of Object.entries(CR.grupos).sort()) console.log(`   ${k.padEnd(52)} n=${String(v.n).padStart(3)}   p.ej. ${v.ejemplo}`);
console.log(`   veredicto · contexto de B: ${JSON.stringify(CR.veredicto.contextosDeB)} · de A y C: ${JSON.stringify(CR.veredicto.contextosDeAyC)}`);
console.log(`   ⇒ 1:1 en ${CR.veredicto.n} páginas: ${CR.veredicto.esUnoAUno ? "SÍ" : "NO"}`);
console.log(
  `   ⚠ y el CONTROL que lo hace concluyente: dentro de la piel A hay ${CR.grupos["A · ctx=taxonomy · override 25px"]?.n ?? 0} páginas que TRAEN el override\n` +
    `     y ${CR.grupos["A · ctx=taxonomy · override ENLAZADO"]?.n ?? 0} que lo ENLAZAN, y las dos miden 25px. O sea que «traerlo en línea» NO es\n` +
    `     el eje: el eje es el CONTEXTO 'archive/'. Sin ese control, enlazar y medir 96 iban juntos.`,
);
console.log(
  `   ⚠ ⚠ CONFUNDIDO, y hay que decirlo (§dos variables que toman siempre el mismo valor): 'ctx=archive' y\n` +
    `     «ser el archivo de un CPT» son la MISMA cosa en este dominio — las 12 son \`glosario\` y \`preguntas-frecuentes\`.\n` +
    `     El 1:1 no dice cuál de las dos es la causa; dice que en las ${CR.veredicto.n} van juntas.`,
);

console.log(`\n  ── LOS EJES, uno a uno (§disparador (a): se reparten y se NOMBRAN antes de tocar nada) ──`);
for (const [k, v] of Object.entries(salida.ejes)) {
  console.log(`   ${k}`);
  console.log(`      separa    ${v.separa}`);
  if (v.aporta) console.log(`      aporta    @1440 ${v.aporta["@1440"]} · @390 ${v.aporta["@390"]}   (en col1)`);
  console.log(`      estado    ${v.estado}`);
}

w(`medidas/pie-legal.json`, salida);

/* El veredicto: el modelo tiene que reproducir sus 6 casos y las razones tienen
 * que ser una sola firma. Lo demás es informe, no aserción. */
let codigo = 0;
if (salida.modeloColumna.aciertos !== salida.modeloColumna.total) {
  console.log(`\n⛔ el modelo de la columna falla en ${salida.modeloColumna.total - salida.modeloColumna.aciertos} de ${salida.modeloColumna.total} casos.`);
  codigo = 2;
} else if (salida.controlRazones.firmasDistintas !== 1) {
  console.log(`\n⛔ los 5 glifos NO tienen la misma firma de razones en las 6 lecturas (${salida.controlRazones.firmasDistintas}): no son los mismos iconos.`);
  codigo = 2;
} else if (!salida.controlMarcado.B_identico_a_C || !salida.controlMarcado.BdifiereDeCsinNormalizar) {
  console.log(
    `\n⛔ el control del MARCADO no cuadra: B≡C normalizando = ${salida.controlMarcado.B_identico_a_C} (esperado true) · ` +
      `B≠C sin normalizar = ${salida.controlMarcado.BdifiereDeCsinNormalizar} (esperado true).\n` +
      `   Si B y C fueran iguales SIN normalizar, la normalización no discriminaría nada y el «idéntico» sería un pleno que no mide.`,
  );
  codigo = 2;
} else if (CR.veredicto.n < MIN_CRUCE) {
  /* §regla 14 y §sondas 4bis: un cruce que no alcanza dominio NO es «1:1», es
   * un cruce sin denominador — y con `esUnoAUno: true` encima, que es como se
   * lee un 1:1 de una sola página. El mínimo se DERIVA del corpus, no se
   * escribe: si mañana hay más capturas, el listón sube solo. */
  console.log(
    `\n⛔ el cruce sólo clasificó ${CR.veredicto.n} páginas de las ${CR.capturas} capturadas (mínimo ${MIN_CRUCE}).\n` +
      `   Un 1:1 sobre un dominio recortado no es un discriminador: es el denominador que falta.`,
  );
  codigo = 2;
} else {
  console.log(
    `\n✅ ${salida.modeloColumna.total}/${salida.modeloColumna.total} · el residuo de \`legal\` vive ENTERO en col1 · ` +
      `entre B y C hay UNA causa (+${salida.reparto["@1440"]["B-C"].col1} a los dos anchos)\n` +
      `   y el «+22.67 / +97» del encargo es B−A, no B−C: a 390 A y C difieren ${salida.reparto["@390"]["A-C"].col1}.`,
  );
}
process.exit(codigo);
