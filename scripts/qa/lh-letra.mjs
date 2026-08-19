/**
 * EL CENSO DE LA LETRA — qué elementos cambian de alto si la raíz pasa de
 * `line-height: 1.7` (razón) a `line-height: 1.7em` (longitud).
 * Uso: node lh-letra.mjs [ancho] [--muestra N]
 *
 * ── El mecanismo, que es de donde sale el predictor ────────────────────────
 * El original sirve `1.7em` en `body`; el clon escribió `1.7` (globals.css:157).
 *
 *   · `1.7em` computa a LONGITUD (1.7 × 18 = 30.6px) y **se hereda como
 *     longitud**: todo descendiente recibe 30.6 sea cual sea su letra;
 *   · `1.7` sin unidad **se hereda como RAZÓN**: cada descendiente computa
 *     1.7 × su propia letra.
 *
 * Coinciden EXACTAMENTE en `font-size: 18px`. Divergen en todo lo demás, con
 *
 *     Δ por renglón AL ARREGLAR = 30.6 − 1.7 × fs
 *
 * ⚠ El encargo de la 84.ª lo pre-registró como `1.7 × fs − 30.6`, que es la
 * misma magnitud con el **signo opuesto**: esa expresión dice *«cuánto sobra
 * hoy»*, no cuánto se MUEVE el elemento al arreglar. Medido: fs 13.5 se mueve
 * **+7.65**, no −7.65. Las dos se congelan, para que la lectura no dependa de
 * recordar cuál era.
 *
 * ── Por qué esta sonda MIDE el efecto en vez de DEDUCIRLO ──────────────────
 * La forma obvia de censar sería *«elementos que no declaran `line-height`
 * propio y tienen `font-size` ≠ 18»*. **No se puede contestar con
 * `getComputedStyle`**: el computado no dice de dónde viene el valor. Y la
 * heurística equivalente —*«su `lineHeight` computado es 1.7 × su `fontSize`»*—
 * tiene un falso positivo REAL en este repo: `listados.css:997` declara
 * `font-size: 14px` **y** `line-height: 1.7em` en el mismo elemento, o sea
 * 23.8px, que es exactamente `1.7 × 14`. Un censo por heurística lo contaría
 * como «hereda la razón» cuando declara lo suyo.
 *
 * Así que la sonda **aplica el cambio y mira qué se mueve**: un estilo en línea
 * `body { line-height: 1.7em }` computa igual que la regla que se va a escribir
 * y se hereda igual. Es `CLAUDE.md` §El principio —verificar contra la salida
 * servida, no contra la fuente que uno supone responsable— aplicado a un cambio
 * que todavía no se ha hecho.
 *
 * ── Y su CONTROL, sin el cual no probaría nada ─────────────────────────────
 * `CLAUDE.md` §sondas 8: *un negativo sin control no es un negativo*. Aquí el
 * riesgo concreto es que el estilo en línea NO se comporte como la regla —que
 * gane otra declaración, que `body` no sea el ancestro que hereda—. El control
 * escribe el valor ACTUAL (`1.7`) por el mismo canal y **exige 0 elementos
 * movidos**. Si el control mueve algo, el instrumento miente y la sonda sale
 * por error sin publicar censo.
 *
 * ── Lo que esta sonda NO contesta (§regla 14: con su cardinal) ─────────────
 * · **no corre `settle()`**: el `line-height` computado es CSS estático y no
 *   depende del scroll. Las perezosas sí se fuerzan a `eager` porque un ancho
 *   distinto cambiaría el wrap. Coste declarado: los altos de elementos que
 *   dependan de una imagen que aún no cargó pueden venir cortos;
 * · **es CLON-CONTRA-CLON**: dice qué se mueve, **nunca si queda BIEN**. Quién
 *   adjudica contra el original es el PASO 2 del encargo, no esta sonda.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, iniciarClon, launch, openPage, w, APP } from "./lib.mjs";

const RAIZ = APP;
const { base: BASE, parar: pararClon } = await iniciarClon();

const args = process.argv.slice(2);
const iM = args.indexOf("--muestra");
const MUESTRA = iM >= 0 ? Number(args[iM + 1]) : 0;
const libres = (iM >= 0 ? [...args.slice(0, iM), ...args.slice(iM + 2)] : args).filter(Boolean);
const width = Number(libres[0] || 1440);
const mobile = width <= 500;

/* ─────────────── rutas publicadas, leídas del build ─────────────── */

const manifiesto = JSON.parse(
  readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"),
);
const TODAS = Object.keys(manifiesto.routes || {})
  .filter((r) => !r.startsWith("/_") && !r.includes("."))
  .sort();
if (TODAS.length === 0) {
  console.error("No hay rutas en .next/prerender-manifest.json — ¿falta `npm run build`?");
  process.exit(2);
}
/**
 * ⚠ **§sondas 4, cuarta cara: un `slice` se lee como una AUSENCIA del original.**
 * Si se recorta, el recorte se publica CON SU CARDINAL en la congelada y en la
 * salida — nunca en silencio. Por defecto no se recorta.
 */
const RUTAS = MUESTRA > 0 ? TODAS.slice(0, MUESTRA) : TODAS;
const RECORTADAS = TODAS.length - RUTAS.length;

/* ───────────────────────── el JS que mide en página ───────────────────────── */

/**
 * Mide, para CADA elemento del documento, su letra, su interlínea computada y
 * su alto. El índice del array es la identidad: no se navega entre pasadas, así
 * que `querySelectorAll('*')` devuelve el mismo orden y el mismo DOM.
 */
const FOTO = () => {
  const els = Array.from(document.querySelectorAll("*"));
  const out = new Array(els.length);
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    out[i] = {
      fs: parseFloat(cs.fontSize),
      lh: cs.lineHeight === "normal" ? -1 : parseFloat(cs.lineHeight),
      h: r.height,
    };
  }
  return out;
};

/** Etiqueta legible de un elemento, para el informe. */
const SENAS = (i) => {
  const el = document.querySelectorAll("*")[i];
  const cls = (el.getAttribute("class") || "").trim().split(/\s+/).slice(0, 3).join(" ");
  /**
   * Renglones contados con un `Range` sobre el CONTENIDO, agrupando las cajas
   * por su `top`. `getClientRects().length` sobre un elemento de bloque
   * devuelve **la caja de borde, o sea 1 siempre** (`CLAUDE.md` §El principio,
   * corolario de instrumento) — informaría «1 renglón» de un párrafo de seis.
   */
  let renglones = null;
  try {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const tops = new Set();
    for (const b of rg.getClientRects()) {
      if (b.width === 0 && b.height === 0) continue;
      tops.add(Math.round(b.top * 4) / 4);
    }
    renglones = tops.size || null;
  } catch { renglones = null; }
  /* ¿es una HOJA de texto? — sin hijos de bloque, o sea que su alto lo deciden
   * sus propios renglones y no los de sus descendientes. Es el subconjunto
   * sobre el que el predictor `Δ = renglones × (30.6 − 1.7·fs)` es exigible.
   *
   * ⚠ **Y EL PROPIO ELEMENTO NO PUEDE SER `inline` — corregido 2026-08-19, 84.ª.**
   * Un elemento `inline` **no forma caja de línea propia**: su
   * `getBoundingClientRect()` devuelve la caja de font-metrics, que es
   * CONSTANTE frente al `line-height`. Metido en el dominio del predictor da un
   * `Δalto medido = 0` contra un esperado ≠ 0, o sea **un fallo que no lo es**.
   *
   * Medido (`medidas/lh-letra-1440-adjudicacion-predictor.json`): los **57**
   * «fallos» de la primera corrida eran los 57 `span.text-[13px]` de las
   * coordenadas de los casos — `display:inline`, `h 18 → 18`, y su padre
   * tampoco se mueve porque su strut de 30.6 ya dominaba al inline box de
   * 22.1. Cambian de interlínea computada y **no mueven un píxel**.
   *
   * Es §*una regla derivada sobre un dominio donde el caso NO SE DA está SIN
   * PROBAR para ese caso*, con el eje cambiado: aquí el dominio incluía un caso
   * al que la regla **no aplica**, y el resultado se leyó como refutación. */
  const propioDisplay = getComputedStyle(el).display;
  const esInline = propioDisplay === "inline";
  const hijos = Array.from(el.children);
  const hojaTexto =
    !esInline &&
    el.textContent.trim().length > 0 &&
    hijos.every((c) => {
      const d = getComputedStyle(c).display;
      return d === "inline" || d === "inline-block" || d === "contents";
    });
  return {
    tag: el.tagName.toLowerCase(),
    cls,
    renglones,
    hojaTexto,
    display: propioDisplay,
    esInline,
    texto: el.textContent.trim().slice(0, 40),
  };
};

/** Escribe el `line-height` del body por estilo en línea y devuelve el computado. */
const APLICA = (valor) => {
  document.body.style.lineHeight = valor;
  return getComputedStyle(document.body).lineHeight;
};

/** Fuerza las perezosas: un ancho distinto cambiaría el wrap, y con él los renglones. */
const EAGER = () => {
  document.querySelectorAll("img").forEach((i) => {
    i.loading = "eager";
    if (i.dataset.src && !i.src) i.src = i.dataset.src;
  });
};

/* ─────────────────────────── medida ─────────────────────────── */

const { browser } = await launch();
const ev = new Evaluadas({
  nombre: `lh-letra @${width}`,
  unidad: "rutas",
  minimo: RUTAS.length,
});

const porFs = {};            // fontSize → { n, dPorRenglon, rutas:Set, ejemplos:[] }
const rutasTocadas = {};     // ruta → nº de elementos movidos
const fallosControl = [];    // rutas en las que el CONTROL movió algo
/**
 * `fueraDeDominio` NO es un cajón de sastre: son los elementos `inline`, donde
 * el predictor **no aplica por el modelo de cajas** y cuyo Δalto = 0 es el
 * comportamiento correcto. Se cuenta y se publica **con su cardinal** en vez de
 * saltarlo con un `continue` — §regla 14: *los ejes excluidos se reparten igual
 * y se publican fuera del recuento*.
 */
const predictor = { ok: 0, fallo: 0, fueraDeDominio: 0, casos: [] };
let totalElementos = 0;
let medidas = 0;

for (const ruta of RUTAS) {
  const { page, status } = await openPage(browser, BASE + ruta, {
    width,
    height: mobile ? 844 : 900,
    mobile,
  });
  /* Una 404 CARGA BIEN y se mide como una página buena: NO cuenta como unidad
   * evaluada, y como el mínimo se deriva del build, el contrato la pone roja
   * sola sin que esta sonda tenga que acordarse de nada. */
  if (status >= 400) { await page.close(); continue; }
  medidas++;

  await page.evaluate(EAGER);
  await page.evaluate(`window.__senas = ${SENAS.toString()}`);
  await new Promise((r) => setTimeout(r, 120));

  const antes = await page.evaluate(FOTO);
  totalElementos += antes.length;

  /* ── CONTROL: el valor de HOY por el mismo canal. Debe ser NO-OP ── */
  const lhControl = await page.evaluate(APLICA, "1.7");
  const control = await page.evaluate(FOTO);
  const movidosControl = [];
  for (let i = 0; i < antes.length && i < control.length; i++) {
    if (Math.abs(antes[i].lh - control[i].lh) > 0.01) movidosControl.push(i);
  }
  if (movidosControl.length > 0) {
    fallosControl.push({ ruta, n: movidosControl.length, lhControl });
  }

  /* ── TRATAMIENTO: el valor que se va a escribir ── */
  const lhTrat = await page.evaluate(APLICA, "1.7em");
  const despues = await page.evaluate(FOTO);

  const movidos = [];
  for (let i = 0; i < antes.length && i < despues.length; i++) {
    if (Math.abs(antes[i].lh - despues[i].lh) > 0.01) movidos.push(i);
  }

  if (movidos.length > 0) {
    rutasTocadas[ruta] = movidos.length;
    /* las señas se piden DESPUÉS de restaurar, para que los renglones se
     * cuenten con la maquetación de hoy y no con la simulada. */
    await page.evaluate(APLICA, "1.7");
    const detalle = await page.evaluate(
      (idx) => idx.map((i) => window.__senas(i)),
      movidos,
    );
    for (let k = 0; k < movidos.length; k++) {
      const i = movidos[k];
      const fs = Math.round(antes[i].fs * 100) / 100;
      /**
       * ⚠ **LAS DOS CONVENCIONES DE SIGNO, y sólo una describe el MOVIMIENTO.**
       *
       * El encargo pre-registró `Δ por renglón = 1.7 × fs − 30.6`. Esa
       * expresión es *«cuánto interlineado SOBRA hoy respecto del original»*
       * —negativa para fs < 18, o sea que hoy falta—, y **no** es lo que el
       * elemento se mueve al aplicar el arreglo:
       *
       *   hoy (razón heredada) ..... 1.7 × fs
       *   tras el arreglo (longitud) 30.6
       *   MOVIMIENTO ............... 30.6 − 1.7 × fs   ← el negativo del anterior
       *
       * Medido en la corrida de validación: fs 13.5 movió **+7.66** donde el
       * enunciado dice −7.65. La MAGNITUD reproduce el predictor al céntimo
       * —o sea que el mecanismo está confirmado— y el signo es el contrario.
       * Se guardan las dos para que la lectura no dependa de recordar cuál era.
       */
      const dPreRegistrado = Math.round((1.7 * fs - 30.6) * 100) / 100;
      const dPred = Math.round((30.6 - 1.7 * fs) * 100) / 100;
      const clave = String(fs);
      porFs[clave] = porFs[clave] || {
        fs,
        dPorRenglon: dPred,
        dPreRegistradoEncargo: dPreRegistrado,
        n: 0,
        rutas: new Set(),
        ejemplos: [],
      };
      const g = porFs[clave];
      g.n++;
      g.rutas.add(ruta);
      const d = detalle[k] || {};
      if (g.ejemplos.length < 6) {
        g.ejemplos.push({
          ruta,
          tag: d.tag,
          cls: d.cls,
          renglones: d.renglones,
          texto: d.texto,
          lhAntes: antes[i].lh,
          lhDespues: despues[i].lh,
        });
      }
      /* ── el PREDICTOR, sólo exigible en HOJAS de texto ──
       * Δ de alto medido == renglones × (1.7·fs − 30.6). En un contenedor con
       * hijos de bloque el alto lo deciden los descendientes, no sus renglones:
       * ahí el predictor no aplica y contarlo sería fabricar un fallo. */
      if (d.esInline && d.renglones && Math.abs(dPred) > 0.01) predictor.fueraDeDominio++;
      if (d.hojaTexto && d.renglones && Math.abs(dPred) > 0.01) {
        const dAlto = Math.round((despues[i].h - antes[i].h) * 100) / 100;
        const esperado = Math.round(d.renglones * dPred * 100) / 100;
        const cuadra = Math.abs(dAlto - esperado) < 0.6;
        if (cuadra) predictor.ok++;
        else {
          predictor.fallo++;
          if (predictor.casos.length < 25) {
            predictor.casos.push({
              ruta, tag: d.tag, cls: d.cls, fs,
              renglones: d.renglones, dPorRenglon: dPred,
              altoAntes: antes[i].h, altoDespues: despues[i].h,
              dAltoMedido: dAlto, dAltoEsperado: esperado,
              texto: d.texto,
            });
          }
        }
      }
    }
  }
  await page.close();
}
await browser.close();
await pararClon();

/* ─────────────────────────── informe ─────────────────────────── */

const clases = Object.values(porFs).sort((a, b) => b.n - a.n);
const salida = {
  meta: {
    width,
    rutasMedidas: RUTAS.length,
    rutasEmitidas: TODAS.length,
    rutasRecortadas: RECORTADAS,
    elementosInspeccionados: totalElementos,
    controlLimpio: fallosControl.length === 0,
  },
  /** §regla 14: toda limitación con su cardinal y su denominador. */
  noMide: [
    `no corre settle(): ${RUTAS.length} rutas medidas sin pase de scroll — el lineHeight computado no lo necesita, los altos de elementos dependientes de imagen pueden venir cortos`,
    `es CLON-CONTRA-CLON: 0 de ${RUTAS.length} rutas comparadas contra el ORIGINAL — dice qué se mueve, no si queda bien`,
    `renglones contados con Range en los ${clases.reduce((a, c) => a + c.n, 0)} elementos movidos; NO en los ${totalElementos} inspeccionados`,
    RECORTADAS > 0 ? `RECORTE: ${RECORTADAS} de ${TODAS.length} rutas emitidas NO se midieron` : `sin recorte: ${RUTAS.length}/${TODAS.length} rutas emitidas`,
  ],
  clases: clases.map((c) => ({
    fs: c.fs,
    /** el MOVIMIENTO al aplicar el arreglo: 30.6 − 1.7·fs */
    dPorRenglon: c.dPorRenglon,
    /** el enunciado del encargo, `1.7·fs − 30.6`: misma magnitud, signo opuesto */
    dPreRegistradoEncargo: c.dPreRegistradoEncargo,
    elementos: c.n,
    rutas: c.rutas.size,
    ejemplos: c.ejemplos,
  })),
  predictor: {
    cuadran: predictor.ok,
    fallan: predictor.fallo,
    /** elementos `inline`: el predictor no aplica ahí (ver adjudicación) */
    fueraDeDominioInline: predictor.fueraDeDominio,
    casos: predictor.casos,
  },
  rutasTocadas,
  fallosControl,
};

/**
 * ⚠ §regla 7: **un artefacto que NO es una medida del sitio lo dice en el
 * nombre.** Una corrida con `--muestra` es una prueba del instrumento, no el
 * censo: si escribiera en el nombre canónico, 3 rutas se leerían como 374.
 */
const nombre =
  MUESTRA > 0
    ? `medidas/lh-letra-${width}-neg-muestra${MUESTRA}.json`
    : `medidas/lh-letra-${width}.json`;
w(nombre, salida);

console.log(`\n═══ CENSO DE LA LETRA @${width} ═══\n`);
console.log(`  rutas medidas ....... ${RUTAS.length}/${TODAS.length}`);
console.log(`  elementos vistos .... ${totalElementos}`);
console.log(`  elementos MOVIDOS ... ${clases.reduce((a, c) => a + c.n, 0)}`);
console.log(`  rutas TOCADAS ....... ${Object.keys(rutasTocadas).length}`);
console.log(`  rutas INTACTAS ...... ${RUTAS.length - Object.keys(rutasTocadas).length}\n`);

if (clases.length === 0) {
  console.log("  (ninguna clase: ningún elemento cambia de interlínea)\n");
} else {
  console.log("  fs      Δ/renglón   elementos   rutas");
  console.log("  ────────────────────────────────────────");
  for (const c of clases) {
    const s = (c.dPorRenglon > 0 ? "+" : "") + c.dPorRenglon.toFixed(2);
    console.log(
      `  ${String(c.fs).padEnd(7)} ${s.padStart(9)}   ${String(c.n).padStart(9)}   ${String(c.rutas.size).padStart(5)}`,
    );
  }
  console.log("  (Δ/renglón = 30.6 − 1.7·fs, el MOVIMIENTO al arreglar;");
  console.log("   el encargo lo pre-registró como 1.7·fs − 30.6: misma magnitud, signo opuesto)");
  console.log("");
}

console.log(`  PREDICTOR (Δalto == renglones × Δ/renglón, sólo hojas de texto)`);
console.log(`    cuadran ${predictor.ok} · fallan ${predictor.fallo} · fuera de dominio (inline) ${predictor.fueraDeDominio}`);
if (predictor.casos.length) {
  console.log(`    primeros fallos:`);
  for (const c of predictor.casos.slice(0, 6)) {
    console.log(
      `      ${c.ruta} ${c.tag}.${c.cls} fs${c.fs} ×${c.renglones} → medido ${c.dAltoMedido} vs esperado ${c.dAltoEsperado}`,
    );
  }
}
console.log("");

/* ── el CONTROL cierra el código de salida ──
 * Si escribir el valor de HOY por el mismo canal mueve algo, el canal no
 * reproduce la regla y el censo NO significa lo que dice. */
if (fallosControl.length > 0) {
  console.error(
    `\n❌ EL CONTROL NO ES NO-OP en ${fallosControl.length} ruta(s): escribir \`1.7\`\n` +
      `   por estilo en línea movió elementos. El canal no reproduce la regla del\n` +
      `   body, así que el censo NO mide el cambio que dice medir. No se concluye nada.\n`,
  );
  for (const f of fallosControl.slice(0, 5)) console.error(`   ${f.ruta}: ${f.n} elementos (body lh=${f.lhControl})`);
  process.exit(1);
}

console.log(`✓ CONTROL limpio: escribir \`1.7\` por el mismo canal es NO-OP en las ${RUTAS.length} rutas`);
ev.ok(medidas);
console.log(`  ✓ evaluadas ${medidas}/${RUTAS.length} rutas · censo de la letra`);
