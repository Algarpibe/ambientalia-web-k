/**
 * CLASE-RANGO — la sonda de DOS NÚMEROS: fidelidad **y** rango.
 * Uso: node clase-rango.mjs [ancho]        SOLO=<txt> · SALIDA=…
 *      SABOTAJE=fidelidad|rango|muerto|pleno     ← los cuatro negativos
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO VALÍA NINGUNA DE LAS 49 QUE YA HAY
 *
 * Todas las comparadoras del repo miden **un** contenido contra **un** original.
 * El defecto de la clase CLASE es el contrario: **«no varía»**. Un clon que
 * cablea el valor de la primera instancia da **Δ0 en esa instancia** y sigue
 * dando un número plausible en las demás — y una sonda de un solo número lo
 * llama limpio.
 *
 *   > **FIDELIDAD** — Δ del ancho % por elemento EMPAREJADO. Se calcula de
 *   > **pares**, así que necesita emparejar.
 *   > **RANGO** — nº de valores DISTINTOS intra-página, en cada lado por
 *   > separado. Se calcula de **conjuntos por lado**, así que NO necesita
 *   > emparejar.
 *
 * **La independencia de los dos ejes es estructural, y es la razón de ser del
 * segundo:** donde el emparejamiento falla —y falla; el eje horizontal tiene 17
 * filas sin emparejar— la fidelidad ENMUDECE y el rango sigue hablando. Por eso
 * los dos sabotajes caen cada uno por SU invariante y se asertan sobre los
 * CONTADORES, no sobre el código de salida: «salió rojo» no distingue por cuál
 * de los dos cayó, y esa distinción es justo lo que hay que probar.
 *
 * ── EL NIVEL, que aquí es el hallazgo y no un detalle ─────────────────────
 * Se miden **TRES** niveles —fila · columna · módulo— y NO se promedian.
 * `DECISION.md` agrupó los 10 bloqueadores bajo «cablean ancho de MÓDULO»;
 * leído el fuente, **nueve cablean retícula** (fila 86/80 %, columna 47.25 %) y
 * **uno** está al nivel de módulo. Medir un nivel y extenderlo a los otros dos
 * es la clase que `CLAUDE.md` §La causa común documenta seis veces.
 *
 * ⚠ **Y el que no se puede leer del fuente:** un módulo sin clase de ancho en el
 * clon **es un módulo al 100 %**. Si el original le da 80 %, no hay valor
 * cableado que encontrar — hay un valor **AUSENTE**. Ningún `grep` lo ve; lo ve
 * el eje de RANGO.
 *
 * DIAGNÓSTICO PURO: esta sonda no arregla nada y no propone arreglos. El
 * veredicto campo/plantilla lo adjudica el acta con la evidencia congelada, no
 * la sonda — que solo cuenta valores distintos.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, QA, env, hoy, iniciarClon, launch, openPage, settle, w, enApp} from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = env("SABOTAJE");
const SOLO = env("SOLO");

/* ── EL ALCANCE, derivado del build ───────────────────────────────────────
 * Igual que en `c-cmp` y `ancho-cuerpo`: una ruta nueva entra sola y sube el
 * listón del contrato sin tocar la sonda. Lo único que se lee de fuera es qué
 * slugs de `/sectores/` son MONOGRÁFICO, porque ésos son el CONTROL —su
 * respuesta ya está medida— y mezclarlos con la muestra sería preguntarle a la
 * sonda algo que ya se sabe y contarlo como hallazgo. */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const SLUGS_MONO = [...readFileSync(enApp("src/lib/monografico.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
if (SLUGS_MONO.length === 0)
  throw new Error("0 slugs de monográfico leídos de src/lib/monografico.ts — el CONTROL se habría quedado vacío en silencio.");

const familia = (r) => {
  if (/^\/sectores\//.test(r)) return SLUGS_MONO.some((s) => r.endsWith("/" + s)) ? "MONOGRAFICO" : "SECTOR";
  if (/^\/(casos-de-exito|case-studies)\//.test(r)) return "CASO";
  if (/^\/faqs\//.test(r)) return "FAQ";
  return null;
};

const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => familia(r))
  .sort()
  .filter((r) => !SOLO || r.includes(SOLO));
if (RUTAS.length === 0) {
  console.error(`❌ 0 rutas en el alcance${SOLO ? ` con SOLO=${SOLO}` : ""} — filtro equivocado, no corrida limpia.`);
  process.exit(2);
}
const CONTROL = RUTAS.filter((r) => familia(r) === "MONOGRAFICO");
if (CONTROL.length === 0) {
  console.error(
    `❌ NINGUNA ruta de CONTROL en el alcance. El pre-registro exige medir los\n` +
      `   monográficos —respuesta conocida: CAMPO— en la MISMA corrida: sin ellos,\n` +
      `   un «no varía» es indistinguible de un cero de instrumento.`,
  );
  process.exit(2);
}

const { base: CLON, parar: pararClon } = await iniciarClon();
const aOriginal = (r) => `https://kunakair.com/es${r === "/" ? "/" : r + "/"}`;

/* ══════════════════════════════════════════════════════════════════════════
 * EL LECTOR — tres niveles, los dos lados, con `via` declarado en cada uno.
 * ═════════════════════════════════════════════════════════════════════════ */
const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const W = (el) => el.getBoundingClientRect().width;

  /** Firma de texto: misma definición que en `ancho-cuerpo`, y por las mismas
   *  tres razones (sin espacios · `innerText` · sin la flecha decorativa). */
  const firma = (el) => {
    if (!el) return "";
    const t = el.innerText ?? el.textContent ?? "";
    return t.replace(/[→←↑↓➔»]/g, "").replace(/\s+/g, "").slice(0, 48);
  };

  // Negativo 3: selector muerto en los dos lados ⇒ sale por el censo.
  if (sabotaje === "muerto") __q(".clase-rango-selector-que-no-existe");
  // Negativo 4: patrón ubicuo ⇒ sale por PLENO, no por dato.
  if (sabotaje === "pleno") __qa("div");

  const esOriginal = !!__q(".et_pb_section");

  /* ── NIVEL 1 · las FILAS ───────────────────────────────────────────────
   *   · original → `.et_pb_row` (clase del tema: eso SÍ es identidad)
   *   · clon     → `[data-fila]` (marcador de sonda), y si no lo hay, el
   *                conductual DECLARADO — nunca en silencio. */
  const raiz = esOriginal ? document.body : __q("main") || document.body;
  const secciones = esOriginal
    ? __qa(".et_pb_section").filter((s) => !/_tb_(header|footer)\b/.test(s.className))
    : [];

  let vias = {};
  let filas = [];
  if (esOriginal) {
    for (const sec of secciones)
      for (const f of sec.querySelectorAll(".et_pb_row, [class*='et_pb_row']")) filas.push({ el: f, padre: sec });
    vias.et_pb_row = filas.length;
  } else {
    const marcadas = [...raiz.querySelectorAll("[data-fila]")];
    const anidadas = marcadas.filter((el) => marcadas.some((o) => o !== el && o.contains(el)));
    if (anidadas.length) vias.marcadorAnidado = anidadas.length;
    const buenas = marcadas.filter((el) => !anidadas.includes(el));
    if (buenas.length) {
      for (const f of buenas) filas.push({ el: f, padre: f.parentElement || raiz });
      vias.marcador = buenas.length;
    } else {
      /* Respaldo conductual: hijo centrado y más estrecho que su padre. Es una
       * COTA SUPERIOR —sobre-casa— y por eso se declara en `via`, no se calla. */
      const visita = (el, prof) => {
        if (prof > 3) return;
        const pb = el.getBoundingClientRect();
        for (const h of el.children) {
          const b = h.getBoundingClientRect();
          const izq = b.left - pb.left;
          const der = pb.right - b.right;
          const centrado = Math.abs(izq - der) < 1.5 && izq > 0.5;
          if (b.width > 0 && b.width < pb.width - 1 && centrado && getComputedStyle(h).display !== "none")
            filas.push({ el: h, padre: el });
          else visita(h, prof + 1);
        }
      };
      visita(raiz, 0);
      vias.conductual = filas.length;
    }
  }

  /* ── NIVEL 2 · las COLUMNAS de cada fila ──────────────────────────────
   *   · original → `.et_pb_column` (identidad del tema)
   *   · clon     → el primer nivel de descendientes que va EN HORIZONTAL
   *                (≥2 hermanos visibles con `top` parecido y `left` distinto);
   *                si no lo hay, los hijos directos. Declarado en `viaCol`. */
  const columnasDe = (fila) => {
    if (esOriginal) return { via: "et_pb_column", cols: [...fila.querySelectorAll(".et_pb_column")] };
    /* Si algún día el clon marca sus columnas —como ya marca sus filas con
     * `data-fila`—, este camino las coge y el nivel pasa a tener VEREDICTO. */
    const marc = [...fila.querySelectorAll("[data-col]")];
    if (marc.length) return { via: "marcador", cols: marc };
    const visibles = (el) => [...el.children].filter((c) => getComputedStyle(c).display !== "none" && c.getBoundingClientRect().width > 0);
    const enFila = (hs) => {
      if (hs.length < 2) return false;
      const t = hs.map((h) => h.getBoundingClientRect().top);
      const l = hs.map((h) => h.getBoundingClientRect().left);
      return Math.max(...t) - Math.min(...t) < 30 && Math.max(...l) - Math.min(...l) > 5;
    };
    let nivel = [fila];
    for (let prof = 0; prof < 4; prof++) {
      const sig = nivel.flatMap(visibles);
      if (!sig.length) break;
      if (enFila(sig)) return { via: "horizontal", cols: sig };
      nivel = sig.length === 1 ? sig : [];
      if (!nivel.length) break;
    }
    return { via: "hijos", cols: visibles(fila) };
  };

  /* ── NIVEL 3 · los MÓDULOS de cada columna ────────────────────────────
   *   · original → `:scope > .et_pb_module` — el nivel EXACTO donde Divi
   *                escribe el ancho de módulo (`anchoPct` en el clon).
   *   · clon     → hijos directos visibles de la columna. */
  const modulosDe = (col) => {
    if (esOriginal) return { via: "et_pb_module", mods: [...col.querySelectorAll(":scope > .et_pb_module")] };
    const marc = [...col.querySelectorAll("[data-mod]")];
    if (marc.length) return { via: "marcador", mods: marc };
    return { via: "hijos", mods: [...col.children].filter((c) => getComputedStyle(c).display !== "none" && c.getBoundingClientRect().width > 0) };
  };

  /* ── SABOTAJES, aplicados al DOM ANTES de medir ───────────────────────
   * Se mutan los elementos de verdad, no los números: un sabotaje que falsea
   * la salida no prueba que el CAMINO DE MEDIDA sepa fallar. Solo el clon —el
   * original no se toca nunca. */
  /** Cada elemento con el PADRE contra el que se mide su %: el sabotaje de
   *  rango necesita esa pareja, no la lista suelta (ver más abajo). */
  const marcadosCon = [];
  for (const { el: f, padre } of filas) {
    marcadosCon.push([f, padre]);
    for (const c of columnasDe(f).cols) {
      marcadosCon.push([c, f]);
      for (const m of modulosDe(c).mods) marcadosCon.push([m, c]);
    }
  }
  const marcados = marcadosCon.map(([el]) => el);
  if (!esOriginal && sabotaje === "fidelidad") {
    /* Desplaza TODOS los anchos un δ constante ⇒ todo par Δ≠0, y **la varianza
     * se conserva a los dos lados** ⇒ FIDELIDAD roja, RANGO verde. δ=40 y no 7
     * porque el padre encoge lo mismo que el hijo: a δ pequeño el % apenas se
     * mueve y el Δ se quedaría por debajo de la tolerancia — un sabotaje que no
     * llega a disparar prueba justo lo contrario de lo que quiere probar. */
    const anchos = new Map(marcados.map((el) => [el, el.getBoundingClientRect().width]));
    for (const el of marcados) el.style.setProperty("width", Math.max(20, anchos.get(el) - 40) + "px", "important");
  }
  if (!esOriginal && sabotaje === "rango")
    /* Aplana el clon a UN solo valor de **%** ⇒ distintos = 1 donde el original
     * tiene varios. La firma se anula más abajo, así que no empareja NADA y la
     * fidelidad se queda MUDA: RANGO rojo, FIDELIDAD sin pares.
     *
     * ⚠ **La primera versión ponía `width:100%` y NO aplanaba.** El `%` de CSS
     * se resuelve contra el **content box** del padre y esta sonda mide contra
     * su **border box**, así que un padre con `padding` daba 95.83 y uno sin él
     * 100: **dos valores**, y el sabotaje no disparaba en el único nivel que
     * tiene veredicto. Es *dos definiciones de «lo mismo»*, la trampa de
     * `charsCenso()`, dentro del test que valida el eje.
     *
     * Se fija en PX contra el border box del padre real de la medida —el mismo
     * que usa `pct()`—, y top-down para que cada nivel vea el ancho ya mutado
     * del anterior. */
    for (const [el, padre] of marcadosCon) {
      const p = padre.getBoundingClientRect().width;
      el.style.setProperty("width", Math.max(20, p * 0.5) + "px", "important");
      el.style.setProperty("flex", "0 0 auto", "important");
      el.style.setProperty("max-width", "none", "important");
    }

  const anula = !esOriginal && sabotaje === "rango";
  const fir = (el) => (anula ? "" : firma(el));

  /* ── La lectura ───────────────────────────────────────────────────────── */
  const pct = (el, padre) => {
    const p = W(padre);
    return p > 0 ? r((W(el) / p) * 100) : null;
  };
  const filasOut = [];
  let viaCol = {}, viaMod = {};
  filas.forEach(({ el: f, padre }, iF) => {
    const { via: vc, cols } = columnasDe(f);
    viaCol[vc] = (viaCol[vc] || 0) + cols.length;
    filasOut.push({
      nivel: "fila",
      i: iF,
      firma: fir(f),
      w: r(W(f)),
      pct: pct(f, padre),
      h: r(f.getBoundingClientRect().height),
      nCols: cols.length,
      cols: cols.map((c, iC) => {
        const { via: vm, mods } = modulosDe(c);
        viaMod[vm] = (viaMod[vm] || 0) + mods.length;
        return {
          nivel: "columna",
          i: `${iF}.${iC}`,
          firma: fir(c),
          w: r(W(c)),
          pct: pct(c, f),
          h: r(c.getBoundingClientRect().height),
          mods: mods.map((m, iM) => ({
            nivel: "modulo",
            i: `${iF}.${iC}.${iM}`,
            firma: fir(m),
            w: r(W(m)),
            pct: pct(m, c),
            h: r(m.getBoundingClientRect().height),
          })),
        };
      }),
    });
  });

  return {
    ancho: r(document.documentElement.clientWidth),
    nSecciones: secciones.length,
    vias: { fila: vias, columna: viaCol, modulo: viaMod },
    filas: filasOut,
  };
};

/* ══════════════════════════════════════════════════════════════════════════
 * AGREGACIÓN — aplanar a los tres niveles y contar DISTINTOS por lado.
 * ═════════════════════════════════════════════════════════════════════════ */
/** Todos los elementos de un nivel, en orden de recorrido. */
const aplana = (datos, nivel) => {
  const out = [];
  for (const f of datos.filas) {
    if (nivel === "fila") out.push(f);
    for (const c of f.cols) {
      if (nivel === "columna") out.push(c);
      if (nivel === "modulo") out.push(...c.mods);
    }
  }
  return out;
};

/**
 * Valores DISTINTOS, agrupados con tolerancia.
 *
 * ⚠ No es redondeo: dos medidas del mismo % salen con decimales distintos según
 * el ancho del padre, y contarlas como dos valores convertiría el ruido de coma
 * flotante en «varianza» — o sea en un CAMPO inventado. La tolerancia es 0.5
 * puntos porcentuales, tres órdenes por debajo del salto que se busca (70·80·90
 * van de diez en diez).
 */
const TOL = 0.5;
const distintos = (vals) => {
  const v = vals.filter((x) => x != null).sort((a, b) => a - b);
  const grupos = [];
  for (const x of v) {
    const g = grupos.find((g) => Math.abs(g.centro - x) <= TOL);
    if (g) { g.n++; g.vals.push(x); g.centro = g.vals.reduce((a, b) => a + b, 0) / g.vals.length; }
    else grupos.push({ centro: x, n: 1, vals: [x] });
  }
  return grupos.map((g) => ({ valor: Math.round(g.centro * 100) / 100, n: g.n }));
};

const { browser } = await launch();
const censo = new Censo();
const NIVELES = ["fila", "columna", "modulo"];
const salida = {
  meta: {
    width, fecha: hoy(), sabotaje: SABOTAJE ?? null, solo: SOLO ?? null,
    preRegistro: "docs/research/clase/PRE-REGISTRO-ANCHO-MODULO.md",
    tolerancia: TOL,
    control: CONTROL,
  },
  rutas: {},
};
/* Los DOS contadores del veredicto, separados a propósito: un solo número no
 * distingue por cuál de los dos invariantes cayó la corrida. */
let nFidelidad = 0, nRango = 0, muertas = 0, paresTot = 0;
/* Celdas ruta×nivel donde el CLON se identificó por heurístico: ahí los dos ejes
 * quedan SIN VEREDICTO, y eso se cuenta — no se calla ni se pinta de verde. */
let sinVeredicto = 0;
const porFamilia = {};

/**
 * ⚠ **LA IDENTIDAD DEL LADO DEL CLON DECIDE SI EL NIVEL TIENE VEREDICTO.**
 *
 * Medido en la primera corrida de esta sonda, contra el control: el original da
 * **17 filas · 27 columnas · 66 módulos**; el clon, por marcador, da **17
 * filas** —exacto— pero por heurístico **66 «columnas» y 102 «módulos»**. El
 * conductual **sobre-casa**, igual que le pasó a `ancho-cuerpo` antes de
 * `data-fila`, y las consecuencias van en los DOS ejes:
 *
 *   · **FIDELIDAD** — emparejar por firma casa el texto correcto en el
 *     ELEMENTO EQUIVOCADO: `pctO 100 → pctC 31.18`, `wO 1238 → wC 386`. Es el
 *     mismo texto dentro de un envoltorio distinto, o sea *el NIVEL al que se
 *     mide*, no un defecto del clon.
 *   · **RANGO** — un clon sobre-casado tiene SIEMPRE muchos valores distintos,
 *     así que `distintos.clon === 1` no se cumple nunca y el eje **no puede
 *     disparar**. Eso no es limpio: es CIEGO, y sin esta guarda saldría verde.
 *
 * Así que un nivel solo tiene veredicto si la identidad es del tema (original)
 * **y** de marcador (clon). Hoy eso es cierto en la FILA y falso en columna y
 * módulo: el clon no marca esos dos niveles todavía. Se dice, se cuenta, y NO
 * se convierte en un cero.
 */
const fiable = (viasClon, nivel) => {
  const v = viasClon[nivel] || {};
  return (v.marcador || 0) > 0 && !v.conductual && !v.hijos && !v.horizontal;
};

const ev = new Evaluadas({
  nombre: "clase-rango",
  unidad: "páginas (2 por ruta: los dos lados)",
  minimo: RUTAS.length * 2,
  porPaginas: true,
});

for (const ruta of RUTAS) {
  const fam = familia(ruta);
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    return datos;
  };
  try {
    const o = await lee(aOriginal(ruta));
    const c = await lee(CLON + ruta);

    const niveles = {};
    for (const nivel of NIVELES) {
      const eo = aplana(o, nivel);
      const ec = aplana(c, nivel);

      /* ── EJE 2 · RANGO — por LADO, sin emparejar ────────────────────────
       * Es lo que hace que este número sobreviva donde la fidelidad muere. */
      const dO = distintos(eo.map((e) => e.pct));
      const dC = distintos(ec.map((e) => e.pct));
      /** ¿Se puede opinar de este nivel? Solo si el clon se identificó por
       *  marcador; con heurístico los dos ejes están ciegos, no limpios. */
      const conVeredicto = fiable(c.vias, nivel);
      if (!conVeredicto) sinVeredicto++;
      /* El defecto de rango: el original ofrece varios valores y el clon uno
       * solo. NO al revés — un clon con más varianza es otra cosa y se ve en el
       * fichero, pero no es «no varía». */
      const defectoRango = conVeredicto && dO.length > 1 && dC.length === 1;
      if (defectoRango) nRango++;

      /* ── EJE 1 · FIDELIDAD — por PARES, emparejando por firma ───────────
       * Unicidad por los dos lados: sin ella dos elementos parecidos casan con
       * el primero que pillan y el Δ sería de dos cosas distintas. */
      const usadas = new Set();
      const difs = [];
      let pares = 0;
      for (const a of eo) {
        if (!a.firma) continue;
        const cand = ec.map((x, k) => [x, k]).filter(([x, k]) => !usadas.has(k) && x.firma === a.firma);
        const ambiguoO = eo.filter((x) => x !== a && x.firma === a.firma).length > 0;
        if (cand.length !== 1 || ambiguoO) continue;
        const [b, k] = cand[0];
        usadas.add(k);
        pares++;
        const d = a.pct != null && b.pct != null ? +(b.pct - a.pct).toFixed(2) : null;
        const dW = +(b.w - a.w).toFixed(2);
        if (d != null && Math.abs(d) > TOL) difs.push({ firma: a.firma, i: { o: a.i, c: b.i }, pctO: a.pct, pctC: b.pct, d, wO: a.w, wC: b.w, dW });
      }
      if (conVeredicto) paresTot += pares;
      if (conVeredicto && difs.length) nFidelidad++;

      niveles[nivel] = {
        n: { orig: eo.length, clon: ec.length },
        /** Sin esto, los números de abajo se leerían como veredictos. */
        conVeredicto,
        viaClon: c.vias[nivel],
        /** El número que contesta CAMPO/PLANTILLA: cuántos valores distintos
         *  ofrece el ORIGINAL dentro de esta página, en este nivel. */
        distintos: { orig: dO, clon: dC },
        varianzaOrig: dO.length > 1,
        defectoRango,
        pares,
        difs,
        /** El inventario entero, para que el acta pueda adjudicar sin re-medir:
         *  la retícula de Divi (47.25 · 29.6667 · 20.875 · 73.62) es plantilla
         *  aunque los hermanos difieran, y eso lo decide quien lee, no la sonda. */
        valores: { orig: eo.map((e) => ({ i: e.i, pct: e.pct, w: e.w, h: e.h, firma: e.firma.slice(0, 24) })), clon: ec.map((e) => ({ i: e.i, pct: e.pct, w: e.w, h: e.h, firma: e.firma.slice(0, 24) })) },
      };
    }

    salida.rutas[ruta] = { familia: fam, vias: { orig: o.vias, clon: c.vias }, niveles };
    (porFamilia[fam] ||= []).push({ ruta, niveles });

    const resumen = NIVELES.map((n) => {
      const x = niveles[n];
      return `${n.slice(0, 3)} ${String(x.distintos.orig.length)}/${String(x.distintos.clon.length)}${x.defectoRango ? "⚑" : " "}`;
    }).join("  ");
    console.log(
      `  ${fam.padEnd(11)} ${ruta.slice(0, 44).padEnd(46)} distintos o/c → ${resumen}` +
        `  Δ≠0 ${NIVELES.reduce((a, n) => a + niveles[n].difs.length, 0)}`,
    );
  } catch (e) {
    muertas++;
    salida.rutas[ruta] = { familia: fam, error: String(e).slice(0, 200) };
    console.log(`  ✗ ${ruta.slice(0, 52).padEnd(54)} ERROR ${String(e).slice(0, 70)}`);
  }
}
await browser.close();
await pararClon();

/**
 * ⚠ **LOS DOS CONTADORES VAN AL FICHERO, no solo a la consola.** El test en
 * negativo tiene que poder afirmar *«este sabotaje cayó por SU invariante»*, y
 * el código de salida no lo distingue: es UN número para DOS ejes. Asertar
 * sobre el artefacto congelado es además lo que hace la aserción auditable
 * después (`CLAUDE.md` §sondas, regla 2).
 */
salida.veredicto = { fidelidad: nFidelidad, rango: nRango, pares: paresTot, muertas, sinVeredicto };
w(env("SALIDA") || `medidas/clase-rango-${width}${SABOTAJE ? `-neg-${SABOTAJE}` : ""}${SOLO ? `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}` : ""}.json`, salida);

/* ══════════════════════════════════════════════════════════════════════════
 * UN SOLO CANAL DE VERDAD — lo que imprime y lo que cuenta es lo mismo.
 * ═════════════════════════════════════════════════════════════════════════ */
const muertos = censo.informe(`@${width}`);
const ubicuos = Object.entries(censo.total).filter(([, n]) => n > censo.paginas * 40);
if (ubicuos.length)
  console.error(`\n⚠ PATRÓN UBICUO — casa ${ubicuos[0][1]} veces en ${censo.paginas} páginas: no está discriminando nada.\n` + ubicuos.map(([s, n]) => `     · ${s} (${n})`).join("\n"));
if (muertas) console.error(`\n❌ ${muertas} ruta(s) no se pudieron medir — NO son «sin diferencia».`);

console.log(`\n─── CLASE-RANGO @${width} · ${RUTAS.length - muertas}/${RUTAS.length} rutas\n`);
console.log(`      VARIANZA INTRA-PÁGINA DEL ORIGINAL (test B) — el número que decide campo/plantilla:`);
for (const [fam, filas] of Object.entries(porFamilia)) {
  for (const nivel of NIVELES) {
    const conVar = filas.filter((f) => f.niveles[nivel].varianzaOrig).length;
    console.log(`        ${fam.padEnd(12)} ${nivel.padEnd(8)} varía en ${String(conVar).padStart(2)}/${filas.length} instancias` +
      `   (valores distintos: ${filas.map((f) => f.niveles[nivel].distintos.orig.length).join(",")})`);
  }
}
console.log(
  `\n      ① FIDELIDAD : ${nFidelidad} celda(s) ruta×nivel con Δ ≠ 0   · ${paresTot} pares comparados\n` +
    `      ② RANGO     : ${nRango} celda(s) donde el ORIGINAL varía y el CLON no\n`,
);
/**
 * ⚠ **Y la línea sin la que los dos ceros de arriba se leen al revés.** Un
 * nivel cuyo lado del clon salió de un heurístico no está limpio: está CIEGO —
 * el sobre-casado le da siempre muchos valores distintos, así que el eje ② no
 * puede disparar ahí ni queriendo. Contarlo aparte es la diferencia entre «no
 * hay defecto» y «no se ha podido mirar».
 */
if (sinVeredicto)
  console.error(
    `      ⚠ SIN VEREDICTO: ${sinVeredicto} celda(s) ruta×nivel — el clon se identificó por\n` +
      `        HEURÍSTICO, no por marcador, así que sobre-casa y los dos ejes están CIEGOS ahí.\n` +
      `        NO es «sin defecto». Se cierra marcando esos niveles en el clon (data-col /\n` +
      `        data-mod), igual que \`data-fila\` cerró el nivel de fila para \`ancho-cuerpo\`.\n`,
  );
/**
 * ⚠ **ACOTAR NO PUEDE VOLVERSE VERDE POR VACIADO** (`CLAUDE.md` §sondas, 4bis).
 * El eje de rango se calcula por lado y no necesita pares, así que una corrida
 * sin un solo par **sigue teniendo veredicto de rango** — pero NO de fidelidad,
 * y eso hay que decirlo en vez de dejar que el ✅ lo tape.
 */
const sinPares = paresTot === 0;
if (sinPares)
  console.error(
    `\n⚠ 0 PARES EMPAREJADOS: el eje ① FIDELIDAD no tiene veredicto en esta corrida.\n` +
      `   El eje ② RANGO sí lo tiene —se calcula por lado, sin emparejar—, que es\n` +
      `   exactamente para lo que existe. No leas el resultado como «sin diferencias».`,
  );
/**
 * ⚠ **EL CONTROL ES PARTE DEL INSTRUMENTO, NO DE LA MUESTRA.** Los monográficos
 * tienen respuesta conocida —CAMPO, `anchoPct` 70·80·90 en 19 módulos—, así que
 * si la sonda NO ve varianza en ellos, su «no varía» sobre SECTOR y grupo C es
 * indistinguible de un cero de instrumento: *no encontrar nada y no mirar nada
 * dan la misma salida*. El control se comprueba en la corrida buena; con un
 * sabotaje puesto, el DOM está mutado a propósito y la comprobación no aplica.
 */
const controlMedido = CONTROL.filter((r) => salida.rutas[r] && !salida.rutas[r].error);
const controlVaria = controlMedido.filter((r) => NIVELES.some((n) => salida.rutas[r].niveles[n].varianzaOrig));
let controlFalla = 0;
if (!SABOTAJE) {
  if (controlMedido.length === 0) { controlFalla = 1; console.error(`\n❌ EL CONTROL NO SE MIDIÓ: sin él no hay forma de saber si la sonda ve la varianza.`); }
  else if (controlVaria.length === 0) {
    controlFalla = 1;
    console.error(
      `\n❌ EL CONTROL NO VARÍA EN NINGÚN NIVEL (${controlMedido.length} monográfico(s)).\n` +
        `   Su respuesta está medida y es CAMPO (anchoPct 70·80·90, 19 módulos), así que\n` +
        `   esto NO es un dato sobre el sitio: es la sonda que no sabe ver la varianza.\n` +
        `   Cualquier «no varía» de SECTOR o grupo C en esta corrida NO se puede citar.`,
    );
  } else console.log(`      ✓ CONTROL: ${controlVaria.length}/${controlMedido.length} monográfico(s) con varianza — la sonda ve la varianza donde la hay.`);
}

const fallos = muertos + muertas + ubicuos.length + controlFalla;
console.log(
  `${fallos === 0 ? "✅" : "❌"} clase-rango @${width} · ${muertos} muerto(s) · ${ubicuos.length} ubicuo(s)\n` +
    `   ⚠ DIAGNÓSTICO: nada se arregla aquí. ① y ② son HALLAZGOS, no fallos de la sonda:\n` +
    `     se adjudican en el acta contra el pre-registro, con la retícula de Divi delante.`,
);
process.exit(fallos === 0 ? 0 : 2);
