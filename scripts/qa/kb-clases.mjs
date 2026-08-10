/**
 * LA DERIVACIÓN DE LAS CLASES `kb-*` — de los pares (nodo × propiedad) al valor
 * que la HOJA tiene que poner.
 * Uso: node scripts/qa/kb-clases.mjs        (npm run qa:kb-clases)
 *
 * ── Qué contesta, y por qué hace falta un paso aparte ─────────────────────
 * `kb-tests` clasifica cada propiedad en PLANTILLA / CAMPO / SIN PROBAR. Eso
 * dice **quién** escribe el valor, no **cuál** es el valor que la plantilla
 * pone cuando el dato calla. Esta sonda contesta lo segundo, que es lo único
 * que se puede escribir en un `.css`:
 *
 *   > **El default de una propiedad es el valor MEDIDO en los nodos cuyo DATO la
 *   > omite.** Si esos nodos no coinciden entre sí, no hay default que escribir
 *   > y la derivación FALLA nombrando la propiedad — una clase no puede emitir
 *   > dos valores.
 *
 * O sea que el dato (`kb-extraido.json`) no es un adorno: es **el discriminador**
 * de qué nodos hablan del default. Escribir la hoja mirando sólo la medida daría
 * el valor de la mayoría, que es otra cosa — y con 1519 pares delante, escribirla
 * «de impresión» es el arreglo falso con otro disfraz.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * **No verifica la hoja.** Verificar el CSS contra el CSS es exactamente
 * *«contra la fuente que uno supone responsable»* (`CLAUDE.md` §El principio):
 * una declaración puede estar escrita, servida, y ser INERTE. La aceptación es
 * `qa:kb-cmp`, que mide el clon renderizado par a par contra esta misma medida
 * congelada. Esto es la ENTRADA de la escritura; aquello es su prueba.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas` con el mínimo derivado del nº de pares recorridos;
 * 2 · una propiedad con dos valores entre los nodos que la omiten ⇒ **fallo**,
 *     no «se coge el más frecuente»;
 * 3 · el emparejamiento medida ↔ dato **tira** si los árboles no cuadran: un
 *     `?? {}` convertiría «no pude emparejar» en «el dato no lo trae», que es
 *     justo lo que decide el default (§sondas 6);
 * 4 · congela en `medidas/kb-clases.json`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const J = (f) => JSON.parse(readFileSync(join(QA, `medidas/${f}`), "utf8"));
const G = J("kb-spec-1440.json");
const P = J("kb-spec-390.json");
const E = J("kb-extraido.json");

/* ── El emparejamiento medida ↔ dato ──────────────────────────────────────
 * El extractor guarda las 39 filas VISIBLES; la medida trae las 45. La oculta
 * es siempre la primera de la sección (`et_pb_row_0 d-none`, 6/6), pero eso no
 * se supone: se filtra por `renderizada` y se exige que los recuentos cuadren. */
const porRuta = new Map();
for (const a of E.articulos) porRuta.set(`${a.prefijo}/${a.slug}`, a);

/** Une (medida@1440, medida@390, dato) nodo a nodo. */
function* nodos() {
  for (const ruta of Object.keys(G.articulos)) {
    const g = G.articulos[ruta];
    const p = P.articulos[ruta];
    const slug = ruta.replace(/\/$/, "").split("/").pop();
    const dato = [...porRuta.values()].find((a) => a.slug === slug);
    if (!dato) throw new Error(`la medida trae \`${slug}\` y \`kb-extraido.json\` no. Sin dato no se sabe qué omite el editor.`);

    for (let si = 0; si < g.propias.length; si++) {
      const sg = g.propias[si];
      const sp = p.propias[si];
      yield { nivel: "seccion", ruta: `${slug}/s${si}`, g: sg, p: sp, d: {}, oculto: !sg.renderizada };

      const visiblesG = sg.filas.filter((f) => f.renderizada);
      if (visiblesG.length !== dato.cuerpo.length)
        throw new Error(
          `${slug}: la medida trae ${visiblesG.length} filas visibles y el dato ${dato.cuerpo.length}. ` +
            `Sin emparejamiento no se puede saber qué propiedad omite el dato.`,
        );
      let vi = -1;
      for (let fi = 0; fi < sg.filas.length; fi++) {
        const fg = sg.filas[fi];
        const fp = sp.filas[fi];
        const oculta = !fg.renderizada;
        if (!oculta) vi++;
        const df = oculta ? null : dato.cuerpo[vi];
        yield { nivel: "fila", ruta: `${slug}/f${fi}`, g: fg, p: fp, d: df ?? {}, oculto: oculta, sinDato: oculta };
        for (let ci = 0; ci < fg.columnas.length; ci++) {
          const cg = fg.columnas[ci];
          const cp = fp.columnas[ci];
          const dc = df?.columnas?.[ci] ?? null;
          if (df && !dc) throw new Error(`${slug}/f${fi}: la medida trae la columna ${ci} y el dato no.`);
          yield {
            nivel: "columna",
            ruta: `${slug}/f${fi}/c${ci}`,
            tipo: cg.tipo?.replace("et_pb_column_", "") ?? null,
            ultima: ci === fg.columnas.length - 1,
            g: cg,
            p: cp,
            d: dc ?? {},
            oculto: oculta,
            sinDato: oculta,
          };
          for (let mi = 0; mi < cg.modulos.length; mi++) {
            const mg = cg.modulos[mi];
            const mp = cp.modulos[mi];
            const dm = dc?.modulos?.[mi] ?? null;
            if (dc && !dm) throw new Error(`${slug}/f${fi}/c${ci}: la medida trae el módulo ${mi} y el dato no.`);
            yield {
              nivel: "modulo",
              kind: mg.kind,
              ruta: `${slug}/f${fi}/c${ci}/m${mi}`,
              tipoColumna: cg.tipo?.replace("et_pb_column_", "") ?? null,
              g: mg,
              p: mp,
              d: dm ?? {},
              oculto: oculta,
              sinDato: oculta,
            };
          }
        }
      }
    }
  }
}

const TODOS = [...nodos()];
const ev = new Evaluadas({ nombre: "kb-clases", unidad: "nodos (medida × dato)", minimo: TODOS.length || 1 });
ev.ok(TODOS.length);

/* ══════════════════════════════════════════════════════════════════════════
 * EL DERIVADOR — un valor por (selector, propiedad), con su denominador
 * ═════════════════════════════════════════════════════════════════════════ */

const reglas = [];
const problemas = [];

/**
 * Deriva UNA declaración. `omite(n)` dice si el dato calla en ese nodo; `leeG` /
 * `leeP` sacan el valor medido a cada ancho.
 *
 * Un conjunto vacío no devuelve nada benigno: se anota como problema. «Ningún
 * nodo omite esta propiedad» y «el default es X» son afirmaciones distintas y
 * la primera no autoriza a escribir la segunda (§sondas 6).
 */
function deriva({ selector, prop, nivel, filtra, omite, omiteMovil, leeG, leeP, nota, dondeMovil }) {
  const cand = TODOS.filter((n) => n.nivel === nivel && (!filtra || filtra(n)));
  const callan = cand.filter((n) => omite(n));
  /**
   * ⚠ **Los dos anchos tienen DENOMINADORES distintos, y confundirlos inventa un
   * conflicto.** El default de escritorio habla cuando el dato omite `valor`; el
   * de móvil, sólo cuando omite **los dos** (`valor` y `movilValor`) — porque la
   * cascada que escribe la hoja es `var(--x-movil, var(--x, DEFECTO))`, así que
   * un nodo con override de móvil **no llega** al defecto de móvil.
   *
   * Sin esta separación, los 10 módulos con `34.0469 → 0` (override de móvil a
   * 0, medido) entraban en el recuento de @390 y la derivación sacaba «dos
   * valores» — un conflicto del instrumento, no del original.
   */
  const callanMovil = cand.filter((n) => (omiteMovil ?? omite)(n));
  const v1440 = new Map();
  const v390 = new Map();
  for (const n of callan) {
    const a = leeG(n);
    v1440.set(a, (v1440.get(a) ?? 0) + 1);
  }
  for (const n of callanMovil) {
    const b = (leeP ?? leeG)(n, true);
    v390.set(b, (v390.get(b) ?? 0) + 1);
  }
  const r = {
    selector,
    prop,
    n: callan.length,
    nMovil: callanMovil.length,
    deCuantos: cand.length,
    valor1440: [...v1440.keys()],
    valor390: [...v390.keys()],
    reparto1440: Object.fromEntries(v1440),
    reparto390: Object.fromEntries(v390),
    movil: dondeMovil ?? "@media (max-width: 980px)",
    nota: nota ?? null,
  };
  if (callan.length === 0 || callanMovil.length === 0)
    problemas.push({ selector, prop, por: `NINGUNO de los ${cand.length} nodos omite esta propiedad: no hay default derivable del dato.` });
  else if (v1440.size !== 1 || v390.size !== 1)
    problemas.push({
      selector,
      prop,
      por:
        `los nodos que la OMITEN no coinciden: ` +
        `@1440 (${callan.length}) ${[...v1440.entries()].map(([k, c]) => `${k}×${c}`).join(" · ")} — ` +
        `@390 (${callanMovil.length}) ${[...v390.entries()].map(([k, c]) => `${k}×${c}`).join(" · ")}. ` +
        `Una clase no puede emitir dos valores.`,
    });
  reglas.push(r);
  return r;
}

const rit = (k) => (n, mov) => (mov ? n.p : n.g).ritmo[k];
const caja = (k) => (n, mov) => (mov ? n.p : n.g).caja[k];
/** ¿el dato omite este campo de ritmo EN ESCRITORIO? `valor` ausente = lo omite. */
const omiteRitmo = (contenedor, k) => (n) => {
  const c = contenedor ? n.d?.[contenedor] : n.d;
  const m = c?.[k];
  return !m || m.valor === null || m.valor === undefined;
};
/** ¿lo omite también en MÓVIL? Hace falta que falten los dos: ver §deriva. */
const omiteRitmoMovil = (contenedor, k) => (n) => {
  const c = contenedor ? n.d?.[contenedor] : n.d;
  const m = c?.[k];
  return omiteRitmo(contenedor, k)(n) && (!m || m.movilValor === null || m.movilValor === undefined);
};

/* ── SECCIÓN propia ─────────────────────────────────────────────────────── */
// No hay dato de sección: la sección entera es plantilla (§2d.1, varianza 0 en 6).
const todaLaSeccion = () => true;
deriva({ selector: ".kb-seccion", prop: "padding-top", nivel: "seccion", omite: todaLaSeccion, leeG: rit("paddingTop"), nota: "CAMPO uniforme: el default de Divi es 4 % y las 6 escriben 0. El test B no puede confirmarlo (una sección por página) — cuerpo.spec.md §3" });
deriva({ selector: ".kb-seccion", prop: "padding-bottom", nivel: "seccion", omite: todaLaSeccion, leeG: rit("paddingBottom"), nota: "el 4 % de Divi resuelto contra la columna de contenido (911.75), no contra 1440" });
deriva({ selector: ".kb-seccion", prop: "margin-top", nivel: "seccion", omite: todaLaSeccion, leeG: rit("marginTop") });
deriva({ selector: ".kb-seccion", prop: "margin-bottom", nivel: "seccion", omite: todaLaSeccion, leeG: rit("marginBottom") });

/* ── FILA ───────────────────────────────────────────────────────────────── */
for (const [prop, k] of [["padding-top", "pt"], ["padding-bottom", "pb"], ["margin-top", "mt"], ["margin-bottom", "mb"]]) {
  const css = { pt: "paddingTop", pb: "paddingBottom", mt: "marginTop", mb: "marginBottom" }[k];
  deriva({
    selector: ".kb-fila",
    prop,
    nivel: "fila",
    filtra: (n) => !n.oculto,
    omite: omiteRitmo(null, k),
    omiteMovil: omiteRitmoMovil(null, k),
    leeG: rit(css),
    nota: k === "pt" || k === "pb" ? "default de Divi 2 % de la fila propia en escritorio y 30px PLANO al apilar: cambia de UNIDAD, por eso no se puede escribir un solo valor" : null,
  });
}
deriva({ selector: ".kb-fila", prop: "max-width", nivel: "fila", filtra: (n) => !n.oculto, omite: todaLaSeccion, leeG: caja("maxWidth"), nota: "SIN PROBAR e inerte: 1380 > 911.75 y > 335.39, así que no recorta" });
deriva({ selector: ".kb-fila", prop: "margin-left/right (especificado)", nivel: "fila", filtra: (n) => n.oculto, omite: todaLaSeccion, leeG: rit("marginLeft"), nota: "el nodo OCULTO devuelve el valor especificado: `auto`. Los visibles dan 0px, que es el valor USADO del mismo `auto`" });

/* ── COLUMNA ────────────────────────────────────────────────────────────── */
/**
 * El ancho de columna se deriva como RAZÓN contra la fila.
 *
 * ⚠ **Y aquí la derivación se PARA y dice hasta dónde llega, en vez de rematar
 * con aritmética.** El valor computado está cuantizado a 1/64 px (LayoutUnit),
 * así que un px medido **no determina un porcentaje**: determina un conjunto. Y
 * la regla con la que el motor elige dentro de ese conjunto —redondeo, truncado,
 * reparto del resto en la última columna— **no está medida**: los cuatro tipos
 * de esta página no se explican con una sola de las tres.
 *
 * Así que esto emite la razón cruda y sus candidatos «legibles», y **quien
 * adjudica es `qa:kb-cmp`**, que mide el clon con el MISMO motor y contra el
 * mismo número. Es §El principio otra vez: la salida servida decide, no mi
 * modelo de cómo redondea Chrome. Un intervalo calculado a mano aquí sería un
 * número plausible que ninguna medida respalda — y la primera versión de esta
 * función lo emitió, dando por bueno un `29.666 %` que habría fallado por un
 * cuanto contra el `29.6667 %` real.
 */
const anchoFila1440 = 911.75;
const pctDe = (px) => {
  const razon = (px / anchoFila1440) * 100;
  return {
    razonCruda: +razon.toFixed(6),
    candidatos: [2, 3, 4].map((d) => +razon.toFixed(d)),
    adjudica: "qa:kb-cmp — la cuantización a 1/64 px no la resuelve la aritmética de esta sonda",
  };
};
const tiposCol = {};
for (const n of TODOS.filter((x) => x.nivel === "columna" && !x.oculto)) {
  const px = +n.g.caja.width.replace("px", "");
  (tiposCol[n.tipo] ??= { px: new Set(), px390: new Set(), n: 0 }).px.add(px);
  tiposCol[n.tipo].px390.add(n.p.caja.width);
  tiposCol[n.tipo].n++;
}
const anchosColumna = {};
for (const [tipo, e] of Object.entries(tiposCol)) {
  if (e.px.size !== 1) problemas.push({ selector: `.kb-col-${tipo}`, prop: "width", por: `${e.px.size} anchos distintos a 1440: ${[...e.px].join(" · ")}` });
  const px = [...e.px][0];
  anchosColumna[tipo] = { px, n: e.n, ...pctDe(px), px390: [...e.px390] };
}
reglas.push({ selector: ".kb-columna[data-ancho]", prop: "width", n: Object.values(tiposCol).reduce((a, b) => a + b.n, 0), porTipo: anchosColumna, nota: "razón contra la fila propia (911.75); el intervalo es el que la cuantización a 1/64 px deja abierto" });

deriva({ selector: ".kb-columna:not(:last-child)", prop: "margin-right", nivel: "columna", filtra: (n) => !n.oculto && !n.ultima, omite: todaLaSeccion, leeG: rit("marginRight"), nota: "el CANAL de la retícula: regla POSICIONAL, no campo (MEDICION.md §3.2)" });
deriva({ selector: ".kb-columna:last-child", prop: "margin-right", nivel: "columna", filtra: (n) => !n.oculto && n.ultima, omite: todaLaSeccion, leeG: rit("marginRight") });
deriva({ selector: ".kb-columna:not(:last-child)", prop: "margin-bottom", nivel: "columna", filtra: (n) => !n.oculto && !n.ultima, omite: todaLaSeccion, leeG: rit("marginBottom"), nota: "0 en escritorio y 30 al apilar: la otra mitad de la misma regla posicional" });
deriva({ selector: ".kb-columna", prop: "padding-top/bottom", nivel: "columna", filtra: (n) => !n.oculto, omite: todaLaSeccion, leeG: rit("paddingTop") });

/* ── MÓDULO ─────────────────────────────────────────────────────────────── */
for (const [prop, k, css] of [["margin-top", "mt", "marginTop"], ["padding-bottom", "pb", "paddingBottom"]])
  deriva({ selector: ".kb-modulo", prop, nivel: "modulo", filtra: (n) => !n.oculto, omite: omiteRitmo("ritmo", k), omiteMovil: omiteRitmoMovil("ritmo", k), leeG: rit(css) });

/** `mb` se deriva POR TIPO DE COLUMNA: es la tabla de `mbPorDefecto`. */
for (const tipo of Object.keys(anchosColumna))
  deriva({
    selector: `.kb-col-${tipo} > .kb-modulo`,
    prop: "margin-bottom",
    nivel: "modulo",
    filtra: (n) => !n.oculto && n.tipoColumna === tipo,
    omite: omiteRitmo("ritmo", "mb"),
    omiteMovil: omiteRitmoMovil("ritmo", "mb"),
    leeG: rit("marginBottom"),
    nota: "el default de `mb` NO es un número: depende del ancho de la FILA y, dentro de KB, del tipo de columna (§2d.6). El mecanismo queda SIN PROBAR",
  });

deriva({ selector: ".kb-modulo", prop: "padding-top / padding-left / padding-right", nivel: "modulo", filtra: (n) => !n.oculto, omite: todaLaSeccion, leeG: rit("paddingTop") });
deriva({ selector: ".kb-modulo:not(.kb-ancho)", prop: "margin-left/right", nivel: "modulo", filtra: (n) => !n.oculto && (n.d.anchoPct === undefined || n.d.anchoPct === null), omite: todaLaSeccion, leeG: rit("marginLeft") });
/** Con `anchoPct` el módulo se CENTRA: los márgenes valen (100−pct)/2 de la columna. */
{
  const conAncho = TODOS.filter((n) => n.nivel === "modulo" && !n.oculto && typeof n.d.anchoPct === "number");
  const razones = new Set();
  for (const n of conAncho) {
    const ml = +n.g.ritmo.marginLeft.replace("px", "");
    const w = +n.g.caja.width.replace("px", "");
    razones.add(Math.round((ml / (w / (n.d.anchoPct / 100))) * 1000) / 10);
  }
  reglas.push({
    selector: ".kb-modulo.kb-ancho",
    prop: "margin-left/right",
    n: conAncho.length,
    valor1440: [...razones].map((x) => `${x} % de la columna`),
    nota: "= (100 − anchoPct)/2 en los 12 ⇒ es `auto`, no un número: el módulo se centra. Un ml/mr asimétrico de 1/64 px en 2 de los 12 lo confirma (el resto se lo lleva un lado)",
  });
}

/* ── TIPOGRAFÍA: el DEFECTO del tema, derivado de los módulos SIN override ─ */
const nivelesTitular = {};
for (const n of TODOS.filter((x) => x.nivel === "modulo" && x.kind === "text" && !x.oculto)) {
  const overrides = new Set((n.d.titulares ?? []).map((t) => t.nivel));
  for (let i = 0; i < n.g.titulares.length; i++) {
    const h = n.g.titulares[i];
    const hp = n.p.titulares[i];
    if (overrides.has(h.etiqueta)) continue; // el dato lo trae ⇒ no habla del defecto
    const e = (nivelesTitular[h.etiqueta] ??= { n: 0, v: new Map(), v390: new Map(), ritmo: new Set() });
    e.n++;
    const k = `${h.tipo.fontSize}/${h.tipo.lineHeight} w${h.tipo.fontWeight} ${h.tipo.color} ls${h.tipo.letterSpacing}`;
    e.v.set(k, (e.v.get(k) ?? 0) + 1);
    const k2 = `${hp?.tipo.fontSize}/${hp?.tipo.lineHeight} w${hp?.tipo.fontWeight}`;
    e.v390.set(k2, (e.v390.get(k2) ?? 0) + 1);
    e.ritmo.add(JSON.stringify(h.ritmo));
  }
}
for (const [nivel, e] of Object.entries(nivelesTitular)) {
  reglas.push({ selector: `.kb-texto ${nivel}`, prop: "font-size/line-height/font-weight/color", n: e.n, valor1440: [...e.v.keys()], valor390: [...e.v390.keys()], ritmo: [...e.ritmo], nota: "DEFECTO del tema: derivado de los titulares cuyo módulo NO trae override en el dato" });
  if (e.v.size !== 1) problemas.push({ selector: `.kb-texto ${nivel}`, prop: "tipografía", por: `${e.v.size} pieles entre los ${e.n} SIN override: ${[...e.v.keys()].join(" | ")}` });
}

/** El titular de BLURB: Divi lo compila contra `.et_pb_module_header`. Los 36 traen piel. */
{
  const sinPiel = TODOS.filter((n) => n.nivel === "modulo" && n.kind === "blurb" && !n.oculto && !n.d.piel);
  reglas.push({ selector: ".kb-blurb-titulo", prop: "font-size/line-height/font-weight", n: sinPiel.length, valor1440: [...new Set(sinPiel.map((n) => `${n.g.titular.tipo.fontSize}/${n.g.titular.tipo.lineHeight} w${n.g.titular.tipo.fontWeight}`))], nota: "los 36 traen piel ⇒ el defecto NO se deriva de un módulo sin regla: se deriva de las OMISIONES de las reglas (defaults.ts §TITULAR_POR_DEFECTO.blurb)" });
}

/* Cuerpo del módulo de texto: `p`, `li`, `ul`. Ningún campo los toca. */
{
  const textos = TODOS.filter((n) => n.nivel === "modulo" && n.kind === "text" && !n.oculto);
  const agr = (sel, lee) => {
    const v = new Map();
    const v390 = new Map();
    let n = 0;
    for (const x of textos) {
      const a = lee(x.g);
      if (!a) continue;
      n++;
      v.set(a, (v.get(a) ?? 0) + 1);
      const b = lee(x.p);
      v390.set(b, (v390.get(b) ?? 0) + 1);
    }
    reglas.push({ selector: sel, prop: "tipografía/ritmo", n, valor1440: [...v.keys()], reparto1440: Object.fromEntries(v), valor390: [...v390.keys()], nota: "sin campo que lo toque: es plantilla entera" });
    return v;
  };
  agr(".kb-texto p", (m) => (m.p ? `${m.p.tipo.fontSize}/${m.p.tipo.lineHeight} w${m.p.tipo.fontWeight} ${m.p.tipo.color} ls${m.p.tipo.letterSpacing} pb${m.p.ritmo.paddingBottom}` : null));
  agr(".kb-texto li", (m) => (m.li ? `${m.li.tipo.fontSize}/${m.li.tipo.lineHeight} w${m.li.tipo.fontWeight} ${m.li.tipo.color}` : null));
  agr(".kb-texto ul", (m) => (m.li ? `pl${m.li.lista.paddingLeft} pb${m.li.lista.paddingBottom} ${m.li.lista.listStyleType}` : null));
  agr(".kb-texto .inner", (m) => JSON.stringify(m.inner?.ritmo ?? null));
}

/* ── BLURB: la retícula, medida a los dos anchos ────────────────────────── */
{
  const blurbs = TODOS.filter((n) => n.nivel === "modulo" && n.kind === "blurb" && !n.oculto);
  const porRet = {};
  for (const n of blurbs) {
    const ret = n.d.reticula ?? "iconos";
    const e = (porRet[ret] ??= { n: 0, w: new Set(), w390: new Set(), mr: new Set(), mr390: new Set(), display: new Set(), display390: new Set(), maxWidth: new Set() });
    e.n++;
    const colW = 911.75; // todas las columnas de blurb miden 4_4 o 1_3; se anota el % contra la propia columna abajo
    e.w.add(`${((+n.g.caja.width.replace("px", "") / (n.tipoColumna === "4_4" ? colW : 270.484)) * 100).toFixed(2)} %`);
    e.w390.add(`${((+n.p.caja.width.replace("px", "") / 335.391) * 100).toFixed(2)} %`);
    e.mr.add(`${((+n.g.ritmo.marginRight.replace("px", "") / (n.tipoColumna === "4_4" ? colW : 270.484)) * 100).toFixed(2)} %`);
    e.mr390.add(`${((+n.p.ritmo.marginRight.replace("px", "") / 335.391) * 100).toFixed(2)} %`);
    e.display.add(n.g.caja.display);
    e.display390.add(n.p.caja.display);
    e.maxWidth.add(n.g.contenido?.maxWidth ?? "—");
  }
  for (const [ret, e] of Object.entries(porRet))
    reglas.push({ selector: `.kb-blurb-${ret}`, prop: "retícula", n: e.n, valor1440: { w: [...e.w], mr: [...e.mr], display: [...e.display], contenidoMaxWidth: [...e.maxWidth] }, valor390: { w: [...e.w390], mr: [...e.mr390], display: [...e.display390] } });
}

/* ── BOTÓN e IMAGEN: una sola piel medida ───────────────────────────────── */
{
  const bts = TODOS.filter((n) => n.nivel === "modulo" && n.kind === "button" && !n.oculto);
  const v = new Set(bts.map((n) => `${n.g.boton.tipo.fontSize}/${n.g.boton.tipo.lineHeight} w${n.g.boton.tipo.fontWeight} ${n.g.boton.tipo.color} pad ${n.g.boton.ritmo.paddingTop} ${n.g.boton.ritmo.paddingRight} ${n.g.boton.ritmo.paddingBottom} ${n.g.boton.ritmo.paddingLeft} mr${n.g.boton.ritmo.marginRight} b${n.g.boton.caja.borderTopWidth} ${n.g.boton.caja.borderColor} r${n.g.boton.caja.borderRadius} ${n.g.boton.caja.display}`));
  reglas.push({ selector: ".kb-boton-a", prop: "piel", n: bts.length, valor1440: [...v], nota: "cero varianza en 6 instancias ⇒ NO se cablea como campo: va al componente declarado SIN PROBAR de bajo riesgo (modulos.spec.md §4)" });

  const ims = TODOS.filter((n) => n.nivel === "modulo" && n.kind === "image" && !n.oculto);
  const vw = new Set(ims.map((n) => `${n.g.wrap.caja.display} maxW${n.g.wrap.caja.maxWidth}`));
  reglas.push({ selector: ".kb-imagen-wrap", prop: "display/max-width", n: ims.length, valor1440: [...vw], nota: "`.et_pb_image_wrap` es inline-block con max-width 100 %: 21/21. Los anchos de 752 y 800 son INTRÍNSECOS, no campo" });
}

/* ══════════════════════════════════════════════════════════════════════════ */
const salida = {
  meta: {
    fecha: hoy(),
    que: "El VALOR que la hoja `kb-*` tiene que poner en cada propiedad, derivado de los nodos cuyo DATO la omite.",
    fuente: ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json", "medidas/kb-extraido.json"],
    metodo: "default = valor medido en los nodos que el dato NO escribe. Dos valores entre esos nodos ⇒ no hay default y la derivación falla.",
    noEsUnaVerificacion: "esto es la ENTRADA de la escritura del CSS. La aceptación es `qa:kb-cmp`, que mide el clon renderizado par a par — verificar el CSS contra el CSS sería comprobar contra la fuente que uno supone responsable.",
    nodos: TODOS.length,
  },
  anchosColumna,
  reglas,
  problemas,
};

console.log(`\n═══ CLASES \`kb-*\` DERIVADAS · ${TODOS.length} nodos (medida × dato) ═══\n`);
for (const r of reglas) {
  const v = Array.isArray(r.valor1440) ? r.valor1440.join(" | ") : JSON.stringify(r.valor1440 ?? r.porTipo ?? "");
  const v2 = r.valor390 ? (Array.isArray(r.valor390) ? r.valor390.join(" | ") : JSON.stringify(r.valor390)) : "";
  console.log(`  ${String(r.selector).padEnd(30)} ${String(r.prop).padEnd(34)} n=${String(r.n).padStart(3)}  @1440 ${String(v).slice(0, 90)}`);
  if (v2 && v2 !== v) console.log(`  ${" ".padEnd(30)} ${" ".padEnd(34)}        @390  ${String(v2).slice(0, 90)}`);
}
console.log(`\n  anchos de columna (razón cruda contra la fila de 911.75 · la cuantización la adjudica qa:kb-cmp):`);
for (const [t, e] of Object.entries(anchosColumna))
  console.log(`    ${t.padEnd(5)} ${String(e.px).padStart(8)}px  →  ${e.razonCruda} %   candidatos ${e.candidatos.join(" · ")}   n=${e.n}`);

if (problemas.length) {
  console.log(`\n  ⚠ ${problemas.length} propiedad(es) SIN default derivable:`);
  for (const p of problemas) console.log(`    · ${p.selector} { ${p.prop} } — ${p.por}`);
  console.log(`\n    No se escribe «el valor de la mayoría»: eso es exactamente el arreglo falso.\n`);
}

w("medidas/kb-clases.json", salida);
process.exit(ev.informe() === 0 && problemas.length === 0 ? 0 : 1);
