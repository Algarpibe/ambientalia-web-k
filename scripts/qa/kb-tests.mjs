/**
 * LOS DOS TESTS APLICADOS AL ÁRBOL DE `articulos-kb` — qué pone la PLANTILLA y
 * qué escribió quien EDITÓ, propiedad a propiedad y nodo a nodo.
 * Uso: node scripts/qa/kb-tests.mjs        (npm run qa:kb-tests)
 *
 * ── Qué es y qué no es ─────────────────────────────────────────────────────
 * No mide nada: lee las dos medidas congeladas de `qa:kb-spec` (1440 y 390) y
 * las clasifica. Va aparte de la sonda **a propósito** — la sonda mide UN ancho
 * por corrida, y el test A necesita los DOS; meterlo dentro obligaría a medir
 * los dos anchos en la misma corrida y a que un episodio del original en el
 * segundo contaminara la clasificación del primero sin dejar rastro.
 *
 * ── Los dos tests, con sus alcances (`CLAUDE.md` §Cómo se decide) ─────────
 * Régimen de la capa clasificada: **BUILDER** (las secciones propias del
 * `post_content`; el cascarón `_tb_` se lee con la otra lectura y lo despacha
 * `kb-spec` con la varianza entre las 6 instancias).
 *
 *   · **test A — los dos anchos.** Igual a 1440 y a 390 ⇒ px absoluto ⇒ lo
 *     escribió una persona ⇒ **CAMPO**. Alcance: el RITMO. No vale para la caja
 *     ni la tipografía, donde da la respuesta al revés;
 *   · **test B — la variación intra-página.** Dos hermanos del mismo hueco con
 *     valores distintos ⇒ **CAMPO**. Sin restricción de alcance.
 *
 * ── Y la tercera casilla, que es la que importa ───────────────────────────
 * Los dos tienen falsos negativos y distintos. Una propiedad que **cambia con
 * el ancho** (falla A) **y no varía entre hermanos** (falla B) **no está
 * probada como plantilla: está SIN PROBAR**, y se congela como tal. Se anota si
 * coincide con el default de Divi documentado —lo que la haría plantilla— pero
 * la coincidencia se declara, no se asume.
 *
 * ── El alcance que esta clasificación NO tiene, y hay que decirlo ─────────
 * El test B necesita HERMANOS. Con **una sola sección propia por artículo**
 * (6/6, medido), a nivel de SECCIÓN no hay hermanos: el test B **no puede
 * pronunciarse**, y su silencio no es un «no varía». Se informa aparte.
 *
 * Guardas: `Evaluadas` con el mínimo derivado del nº de nodos emparejados, y
 * congela en `medidas/kb-tests.json`. No abre navegador (`SIN_CONTRATO` no
 * aplica: sí evalúa unidades, que son los pares de nodos).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const M = (a) => JSON.parse(readFileSync(join(QA, `medidas/kb-spec-${a}.json`), "utf8"));
const G = M(1440), P = M(390);

/* ── Defaults de Divi documentados en `CLAUDE.md` §Cómo se decide, medidos en
 *    el recon del monográfico. Aquí el contenedor NO es 1440 sino la columna
 *    de contenido (911.75), así que el porcentaje se resuelve contra ella; el
 *    valor móvil de Divi es plano y no depende del contenedor. ───────────── */
const DEFAULTS = {
  "seccion.paddingTop": { pct: 4, movil: 50 },
  "seccion.paddingBottom": { pct: 4, movil: 50 },
  "fila.paddingTop": { pct: 2, movil: 30 },
  "fila.paddingBottom": { pct: 2, movil: 30 },
  "modulo.marginBottom": { pct: 2.75, movil: 30 },
};
const px = (v) => (typeof v === "string" && /^-?[\d.]+px$/.test(v) ? +v.slice(0, -2) : null);

const PROPS = {
  seccion: ["paddingTop", "paddingBottom", "marginTop", "marginBottom"],
  fila: ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "marginLeft", "marginRight"],
  columna: ["marginRight", "marginBottom", "paddingTop", "paddingBottom"],
  modulo: ["marginTop", "marginBottom", "paddingTop", "paddingBottom"],
};
/* La CAJA va aparte: el test A NO vale para ella (§alcance), así que sólo se le
 * aplica el B. Mezclarlas daría «plantilla» a `anchoPct`, que es el caso
 * canónico de la respuesta invertida. */
const PROPS_CAJA = { fila: ["maxWidth", "width"], columna: ["width"], modulo: ["width"] };

/** Recorre las dos medidas en paralelo y emite un registro por (nodo, propiedad). */
function* pares() {
  for (const ruta of Object.keys(G.articulos)) {
    const g = G.articulos[ruta], p = P.articulos[ruta];
    if (!p) throw new Error(`\`${ruta}\` está en la medida de 1440 y no en la de 390: los árboles no son comparables.`);
    for (let si = 0; si < g.propias.length; si++) {
      const sg = g.propias[si], sp = p.propias[si];
      if (!sp) throw new Error(`${ruta} sección ${si} no existe a 390`);
      const anchoCont = g.cascaron.contenido?.rect.w ?? null;
      const anchoContP = p.cascaron.contenido?.rect.w ?? null;
      for (const prop of PROPS.seccion)
        yield { ruta, nivel: "seccion", path: `s${si}`, prop, idx: si, n: g.propias.length, g: sg.ritmo[prop], p: sp.ritmo[prop], hermanos: g.propias.map((x) => x.ritmo[prop]), oculto: !sg.renderizada, padreG: anchoCont, padreP: anchoContP };
      const filasVis = sg.filas.filter((x) => x.renderizada);
      for (let fi = 0; fi < sg.filas.length; fi++) {
        const fg = sg.filas[fi], fp = sp.filas[fi];
        if (!fp) throw new Error(`${ruta} s${si} fila ${fi} no existe a 390`);
        const comunF = { ruta, nivel: "fila", path: `s${si}.f${fi}`, idx: fi, n: sg.filas.length, oculto: !fg.renderizada, padreG: sg.rect?.w ?? null, padreP: sp.rect?.w ?? null };
        /* ── El REPARTO de columnas, que no es CSS y es la propiedad que decide
         * el cuerpo. Clasificarlo por `columna.width` no funciona: en una fila
         * `1_2 + 1_2` las dos columnas miden lo mismo, así que el test B calla,
         * y la conclusión sería «el reparto no está probado» sobre la fila que
         * mejor lo demuestra. El reparto es una propiedad **de la fila**, y sus
         * hermanas son las otras filas de la sección — que traen repartos
         * distintos. Medido ahí, el test B dispara y lo prueba. */
        yield { ...comunF, prop: "reparto", derivada: true, g: fg.reparto, p: fp.reparto, hermanos: filasVis.map((x) => x.reparto) };
        yield { ...comunF, prop: "nColumnas", derivada: true, g: fg.nColumnas, p: fp.nColumnas, hermanos: filasVis.map((x) => x.nColumnas) };
        for (const prop of PROPS.fila)
          yield { ...comunF, prop, g: fg.ritmo[prop], p: fp.ritmo[prop], hermanos: filasVis.map((x) => x.ritmo[prop]) };
        for (const prop of PROPS_CAJA.fila)
          yield { ...comunF, prop, caja: true, g: fg.caja[prop], p: fp.caja[prop], hermanos: filasVis.map((x) => x.caja[prop]) };
        for (let ci = 0; ci < fg.columnas.length; ci++) {
          const cg = fg.columnas[ci], cp = fp.columnas[ci];
          if (!cp) throw new Error(`${ruta} s${si}.f${fi} columna ${ci} no existe a 390`);
          const comunC = { ruta, nivel: "columna", path: `s${si}.f${fi}.c${ci}`, idx: ci, n: fg.columnas.length, oculto: !cg.renderizada, padreG: fg.rect?.w ?? null, padreP: fp.rect?.w ?? null };
          for (const prop of PROPS.columna)
            yield { ...comunC, prop, g: cg.ritmo[prop], p: cp.ritmo[prop], hermanos: fg.columnas.map((x) => x.ritmo[prop]) };
          for (const prop of PROPS_CAJA.columna)
            yield { ...comunC, prop, caja: true, g: cg.caja[prop], p: cp.caja[prop], hermanos: fg.columnas.map((x) => x.caja[prop]) };
          for (let mi = 0; mi < cg.modulos.length; mi++) {
            const mg = cg.modulos[mi], mp = cp.modulos[mi];
            if (!mp) throw new Error(`${ruta} s${si}.f${fi}.c${ci} módulo ${mi} no existe a 390`);
            if (mg.kind !== mp.kind) throw new Error(`${ruta} s${si}.f${fi}.c${ci}.m${mi}: kind ${mg.kind} a 1440 y ${mp.kind} a 390`);
            const comunM = { ruta, nivel: "modulo", kind: mg.kind, path: `s${si}.f${fi}.c${ci}.m${mi}`, idx: mi, n: cg.modulos.length, oculto: !mg.renderizado, padreG: cg.rect?.w ?? null, padreP: cp.rect?.w ?? null };
            for (const prop of PROPS.modulo)
              yield { ...comunM, prop, g: mg.ritmo[prop], p: mp.ritmo[prop], hermanos: cg.modulos.map((x) => x.ritmo[prop]) };
            for (const prop of PROPS_CAJA.modulo)
              yield { ...comunM, prop, caja: true, g: mg.caja[prop], p: mp.caja[prop], hermanos: cg.modulos.map((x) => x.caja[prop]) };
          }
        }
      }
    }
  }
}

/* ── ¿el valor a 1440 es el default de Divi para ese nivel? ─────────────────
 * Se comprueba contra el ANCHO DEL CONTENEDOR medido, no contra 1440: en este
 * arquetipo el cuerpo vive dentro de la columna de contenido (911.75), así que
 * el 2 % de una fila vale 18.23 y no 28.80. Escribir los números del
 * monográfico aquí habría dado «no es el default» a todos los defaults. */
const anchoFila = {};
for (const [ruta, a] of Object.entries(G.articulos)) anchoFila[ruta] = a.cascaron.contenido?.rect.w ?? null;

/* ⚠ **LÍMITE DECLARADO, medido el 2026-08-10.** Esta función reconoce UNA forma
 * de default: «el % contra la fila propia». Y `modulo.marginBottom` tiene DOS
 * valores que se comportan como default —los dos colapsan a `30px` a 390— y
 * **cuál sale lo decide el TIPO DE COLUMNA**, sin excepción en los 72 que los
 * llevan: `34.0469` en las 59 de columna `4_4` (= 2.75 % de **1238.39**, la fila
 * del CASCARÓN) y `25.0625` en las 13 de columna estrecha (= 2.75 % de
 * **911.75**, la fila propia). Ninguno es el 2.75 % de su propio contenedor.
 *
 * Consecuencia: los 59 a `34.0469` salen **CAMPO por test B**, y eso NO afirma
 * que los escribiera un editor — afirma que aquí no está la regla para
 * reconocerlos. El veredicto de la propiedad no depende de ellos (lo sostienen
 * `16`, `27`, `40`, `13`, `45`). Detalle:
 * `docs/research/articulos-kb/components/modulos.spec.md` §1.3. */
function esDefault(r) {
  const d = DEFAULTS[`${r.nivel}.${r.prop}`];
  if (!d) return null;
  const cont = anchoFila[r.ruta];
  const vg = px(r.g), vp = px(r.p);
  if (vg === null || vp === null || !cont) return null;
  const esperado = (d.pct / 100) * cont;
  return Math.abs(vg - esperado) < 0.5 && Math.abs(vp - d.movil) < 0.5;
}

/* ══════════════════════════════════════════════════════════════════════════
 * TEST A EN LA UNIDAD CORRECTA — la RAZÓN contra el padre, no el píxel
 *
 * `CLAUDE.md` §alcance ya avisa de que el test A **da la respuesta al revés**
 * sobre la caja: en Divi el ancho de módulo se escribe en % igual que su
 * default, así que el número se mueve con el ancho lo escriba quien lo escriba,
 * y sin embargo es un campo (`anchoPct`: 70 · 80 · 90 · 100 en la misma
 * página). Ahí el test se quedaba mudo.
 *
 * **Pero el test A no es «el píxel no cambia»: es «el valor que escribió la
 * persona no cambia».** Si lo que escribió es un %, lo que hay que comparar
 * entre los dos anchos es el %, o sea **la razón contra el ancho del padre**.
 * En esa unidad el test vuelve a discriminar, y sin cambiar su lógica.
 *
 * Medido aquí: un módulo de 366.172 en una columna de 430.797 (85.0 %) mide
 * 285.078 en una de 335.391 a 390 — **85.0 % otra vez**. Razón constante entre
 * anchos ⇒ lo escribió una persona ⇒ CAMPO. Y un módulo que llena su columna da
 * 100 % en los dos: ése es el default, no un campo.
 * ═════════════════════════════════════════════════════════════════════════ */
const razon = (v, padre) => { const n = px(v); return n === null || !padre ? null : Math.round((n / padre) * 1000) / 10; };

/* ══════════════════════════════════════════════════════════════════════════
 * EL FALSO POSITIVO DEL TEST B — la REGLA POSICIONAL
 *
 * ⚠ Esto no estaba escrito, y sale de esta tanda. `CLAUDE.md` documenta los
 * falsos NEGATIVOS de los dos tests; el B tiene además uno POSITIVO:
 *
 *   > **El test B supone que si dos hermanos difieren, lo escribió una
 *   > persona. Una regla de plantilla que dependa de la POSICIÓN —`:last-child`,
 *   > `:nth-child`— produce exactamente la misma variación entre hermanos.**
 *
 * Medido: `columna.marginRight` vale **50.1406 en toda columna que no es la
 * última y 0 en toda última, en las 60 columnas de los 6 artículos**. El test B
 * lo llamaría campo; es el CANAL de la retícula de Divi, o sea plantilla. Darlo
 * por campo inventaría un `margenDerecho` por columna en el content type.
 *
 * El discriminador es que **la variación queda COMPLETAMENTE explicada por la
 * posición**: si al agrupar por (¿es el primero?, ¿es el último?, ¿está solo?)
 * cada grupo tiene un único valor y hay más de un grupo, es una regla. Si
 * dentro de un mismo grupo siguen apareciendo valores distintos, no lo es —
 * ahí sí hay alguien escribiendo.
 *
 * ⚠ Y la condición que le faltaba en la primera versión, que la hacía disparar
 * sobre **todo**: hay que exigir además que la propiedad **VARÍE de verdad**.
 * Una constante cumple «cada grupo tiene un único valor» trivialmente, así que
 * sin este requisito `fila.marginLeft` —`auto` en las 39— salía «regla
 * posicional». 515 pares de 1429 clasificados por una tautología: el pleno de
 * §sondas 4 otra vez, esta vez dentro de un clasificador y no de un selector.
 * ═════════════════════════════════════════════════════════════════════════ */
const firmaPos = (r) => `${r.idx === 0 ? "primero" : ""}|${r.idx === r.n - 1 ? "ultimo" : ""}|${r.n === 1 ? "solo" : ""}`;

const crudos = [...pares()];

/** ¿(nivel, prop) queda explicada del todo por la posición, en TODOS los nodos? */
const posicional = {};
{
  const porClave = {};
  for (const r of crudos) {
    if (r.oculto) continue;
    const k = `${r.nivel}.${r.prop}`;
    (porClave[k] ??= []).push(r);
  }
  for (const [k, rs] of Object.entries(porClave)) {
    const grupos = {};
    const todos = new Set();
    for (const r of rs) { (grupos[firmaPos(r)] ??= new Set()).add(`${r.g}→${r.p}`); todos.add(`${r.g}→${r.p}`); }
    const claves = Object.keys(grupos);
    // varía DE VERDAD · hay más de un grupo · y cada grupo trae un solo valor
    posicional[k] = todos.size > 1 && claves.length > 1 && claves.every((c) => grupos[c].size === 1);
  }
}

const registros = [];
for (const r of crudos) {
  const igual = r.g === r.p;
  const rg = r.caja ? razon(r.g, r.padreG) : null;
  const rp = r.caja ? razon(r.p, r.padreP) : null;
  const razonIgual = rg !== null && rp !== null && Math.abs(rg - rp) < 0.6;
  const variaHermanos = new Set(r.hermanos.map((x) => JSON.stringify(x))).size > 1;
  const hayHermanos = r.hermanos.length > 1;
  const def = esDefault(r);
  const esPos = posicional[`${r.nivel}.${r.prop}`] === true;
  let veredicto;
  if (r.oculto)
    /* Un nodo `display:none` devuelve el valor ESPECIFICADO (`2%`), no el usado:
     * no es comparable con el de un nodo renderizado y meterlo en el recuento
     * daría un «SIN PROBAR» que no habla de nada. Se cuenta aparte. */
    veredicto = "OCULTO · no comparable (getComputedStyle devuelve el especificado)";
  /* La posicionalidad es una propiedad **de la propiedad**, no de cada nodo:
   * si el canal vale 50.14 en toda columna no-última y 0 en toda última, los
   * ceros no son «un campo que vale 0», son la otra mitad de la misma regla.
   * Por eso va delante — pero sólo desde que el detector exige variación real
   * (antes, con la tautología dentro, robaba 143 pares a `modulo.paddingTop`,
   * que es constante e igual a los dos anchos, o sea test A puro).
   *
   * ⚠ Y de paso tapa el caso degenerado del test A: **`0px` es a la vez «el
   * editor escribió 0» y «aquí no hay nada»**, y el test A no los distingue. */
  else if (esPos) veredicto = "PLANTILLA · regla posicional (el test B da FALSO POSITIVO aquí)";
  /* ⚠ El test A en PÍXELES no se aplica a la CAJA — es su alcance documentado, y
   * saltárselo da la respuesta al revés. Medido aquí: `fila.maxWidth` vale
   * `1380px` a los dos anchos en las 39 filas, y el test A en px lo llamaría
   * campo; es la constante del tema. La caja sólo se clasifica por el test B y
   * por el test A EN RAZÓN. */
  else if (igual && !r.caja) veredicto = "CAMPO · test A (px absoluto, igual a los dos anchos)";
  else if (r.caja && razonIgual && rg >= 99.5) veredicto = "PLANTILLA · llena a su padre en los dos anchos (100 %)";
  else if (r.caja && razonIgual) veredicto = `CAMPO · test A en RAZÓN (${rg} % del padre a los dos anchos)`;
  else if (variaHermanos) veredicto = "CAMPO · test B (varía entre hermanos; escrito en % ⇒ el test A en px lo daría por plantilla)";
  else if (def) veredicto = "PLANTILLA · default de Divi (coincide con el % documentado y con el valor móvil)";
  else if (!hayHermanos) veredicto = "SIN PROBAR · sin hermanos con los que aplicar el test B";
  else veredicto = "SIN PROBAR · cambia con el ancho y no varía entre hermanos";
  registros.push({ ...r, hermanos: undefined, nHermanos: r.hermanos.length, igual, razonG: rg, razonP: rp, variaHermanos, esDefault: def, posicional: esPos, veredicto });
}

const ev = new Evaluadas({ nombre: "kb-tests", unidad: "pares (nodo × propiedad)", minimo: registros.length || 1 });
ev.ok(registros.length);

const porVeredicto = {};
for (const r of registros) porVeredicto[r.veredicto] = (porVeredicto[r.veredicto] ?? 0) + 1;

/* ══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO SE DA POR PROPIEDAD, NO POR NODO — y esto no es presentación
 *
 * La primera versión clasificaba nodo a nodo y sacaba una CONTRADICCIÓN a la
 * cara: `fila.paddingTop` con el mismo par `18.2344px → 30px` marcado **CAMPO
 * ×17 y PLANTILLA ×13**. Las dos ramas eran correctas —unas filas tenían
 * hermanas con valor distinto (test B ⇒ campo) y otras no (⇒ coincide con el
 * default)— y la conclusión conjunta, imposible: **el mismo valor no puede ser
 * las dos cosas.**
 *
 * Porque la pregunta no es de nodo: *«¿el editor PUEDE escribir el `pt` de una
 * fila?»* se contesta una vez para la propiedad. Si **algún** nodo lo prueba,
 * la propiedad es CAMPO — y los nodos que llevan el default no son plantilla,
 * son **el campo con su valor por defecto**, que es justo lo que el ESQUEMA
 * dice que se omite en el dato.
 *
 * ── Y el caso degenerado del test A, que hay que enunciar ────────────────
 * **`0px` es a la vez «el editor escribió 0» y «aquí no hay nada».** Si TODOS
 * los nodos valen 0 a los dos anchos, el test A daría «campo» sin que nadie
 * haya escrito nada. Se discrimina con el default documentado:
 *
 *   · hay default no nulo (una fila trae 2 % de serie) ⇒ un 0 uniforme es un
 *     **desvío** del default, o sea alguien lo escribió ⇒ CAMPO uniforme;
 *   · no hay default (el margen de un módulo es 0 de serie) ⇒ el 0 no es
 *     evidencia de nada ⇒ **SIN EVIDENCIA**, que no es lo mismo que plantilla.
 * ═════════════════════════════════════════════════════════════════════════ */
const porProp = {};
for (const r of registros) {
  const k = `${r.nivel}.${r.prop}`;
  porProp[k] ??= { n: 0, veredictos: {}, valores1440: new Set(), valores390: new Set(), pares: new Set(), nivel: r.nivel, caja: !!r.caja, derivada: !!r.derivada };
  const e = porProp[k];
  e.n++;
  e.veredictos[r.veredicto.split(" · ")[0]] = (e.veredictos[r.veredicto.split(" · ")[0]] ?? 0) + 1;
  if (!r.oculto) { e.valores1440.add(r.g); e.valores390.add(r.p); e.pares.add(`${r.g} → ${r.p}`); }
}
for (const [k, e] of Object.entries(porProp)) {
  e.valores1440 = [...e.valores1440];
  e.valores390 = [...e.valores390];
  e.pares = [...e.pares];
  const hayDefault = !!DEFAULTS[k];
  const todoCero = e.pares.length === 1 && /^0px → 0px$/.test(e.pares[0]);
  const nCampo = Object.entries(e.veredictos).filter(([v]) => v === "CAMPO").reduce((n, [, x]) => n + x, 0);
  const nPos = e.veredictos["PLANTILLA"] ?? 0;
  const nSin = e.veredictos["SIN PROBAR"] ?? 0;
  if (todoCero && !hayDefault)
    e.veredicto = `SIN EVIDENCIA · 0px en los ${e.n - (e.veredictos.OCULTO ?? 0)} nodos y sin default no nulo que contradecir: el test A no distingue «escribió 0» de «no hay nada»`;
  else if (todoCero && hayDefault)
    e.veredicto = `CAMPO uniforme · 0px en todos, y el default de Divi NO es 0 (${DEFAULTS[k].pct} % / ${DEFAULTS[k].movil}px) ⇒ alguien lo escribió. Test B no puede confirmarlo: no varía`;
  else if (posicional[k]) e.veredicto = "PLANTILLA · regla posicional";
  else if (nCampo > 0) e.veredicto = `CAMPO · probado en ${nCampo} de ${e.n} nodos` + (hayDefault ? ` · default de Divi = ${DEFAULTS[k].pct} % / ${DEFAULTS[k].movil}px (se omite en el dato)` : "");
  else if (nSin > 0 && nSin >= nPos) e.veredicto = `SIN PROBAR · ${nSin} nodos sin veredicto y ningún nodo prueba campo`;
  else e.veredicto = `PLANTILLA · ${nPos} de ${e.n} nodos, ninguno prueba campo`;
}

const salida = {
  meta: {
    fecha: hoy(),
    que: "Los dos tests (A · los dos anchos; B · la variación intra-página) aplicados nodo a nodo al árbol de `articulos-kb`, capa de BUILDER.",
    fuente: ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json"],
    regimen: "capa PROPIA = builder ⇒ los dos tests valen tal cual. El cascarón `_tb_` NO entra aquí: se lee con la varianza entre las 6 instancias (kb-spec §veredicto.cascaron).",
    alcances: {
      testA: "sólo el RITMO. Las propiedades de CAJA (`width`, `maxWidth`) se marcan `caja:true` y se clasifican SÓLO por el test B.",
      testB: "necesita hermanos. A nivel de SECCIÓN no los hay (1 sección propia por artículo, 6/6): su silencio NO es «no varía».",
      testBfalsoPositivo: "una REGLA POSICIONAL de plantilla (`:last-child`) produce la misma variación entre hermanos que un campo. Se detecta y se descuenta: ver §firmaPos.",
      testAenRazon: "sobre la CAJA el test A se aplica a la razón contra el padre, no al píxel: lo que la persona escribió es un %, y en esa unidad el test vuelve a discriminar.",
      ocultos: "los nodos `display:none` se cuentan aparte: su `getComputedStyle` devuelve el valor especificado y no es comparable con el usado.",
    },
    defaultsDivi: DEFAULTS,
    contenedor: anchoFila,
  },
  resumen: { registros: registros.length, porVeredicto },
  porPropiedad: porProp,
  registros,
};

console.log(`\n═══ LOS DOS TESTS · ${registros.length} pares (nodo × propiedad) ═══`);
for (const [k, n] of Object.entries(porVeredicto).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\n  ═══ VEREDICTO POR PROPIEDAD (la unidad en la que se decide) ═══`);
for (const [k, e] of Object.entries(porProp))
  console.log(`    ${k.padEnd(24)}${e.caja ? "[caja]" : e.derivada ? "[deriv]" : "      "} ${String(e.pares.length).padStart(2)} valor(es) · ${e.veredicto}`);

const sinProbar = registros.filter((r) => r.veredicto.startsWith("SIN PROBAR"));
if (sinProbar.length) {
  const agr = {};
  for (const r of sinProbar) { const k = `${r.nivel}.${r.prop}`; agr[k] ??= new Set(); agr[k].add(`${r.g} → ${r.p}`); }
  console.log(
    `\n  ⚠ ${sinProbar.length} pares SIN PROBAR — no pasan NINGUNO de los dos tests.\n` +
      `    No se cablean: se anotan. Cablearlos es exactamente el ARREGLO FALSO.\n` +
      Object.entries(agr).map(([k, v]) => `      · ${k.padEnd(24)} ${[...v].slice(0, 6).join(" | ")}`).join("\n") + "\n",
  );
}

w("medidas/kb-tests.json", salida);
process.exit(ev.informe() === 0 ? 0 : 1);
