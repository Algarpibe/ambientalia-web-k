/**
 * EL ANCHO DEL CUERPO — original contra clon, por COMPOSICIÓN horizontal.
 * Uso: npm run qa:ancho -- [ancho]     SOLO=<txt> · SALIDA=…
 *      SABOTAJE=muerto|pleno|sinmarcador|anidado   ← los cuatro negativos
 *
 * El eje que `COBERTURA-MEDICION.md` tiene a **0/31**: nunca se ha comparado el
 * ancho de la retícula del cuerpo contra el original. Las cuatro pistas que
 * existen —la miga (−33.25), el kicker de /monitor, el `w-[80%]` por defecto de
 * `Breadcrumb`/`UltimosArticulos` y el `h1` al 100 % de la cabecera— salieron
 * **todas de refilón**, buscando otra cosa. Esta sonda lo mira a propósito.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO LECCIONES QUE LE DAN FORMA
 *
 * **1 · El NIVEL, en horizontal.** *El ancho de un elemento ENVUELTO es el de su
 * contenedor, no el de su contenido.* Así que el Δ de ancho de un bloque que
 * LLENA su contenedor **no es evidencia de nada**: repite el número de su padre.
 * La sonda marca cada medida con `informativo`, y **un Δ0 sobre una medida no
 * informativa NO cuenta como verificación** — es la trampa que dejó este eje a
 * 0/31 pareciendo verde.
 *
 * **2 · Identidad por marcador semántico, no por `className`.** En el original
 * las clases del tema (`et_pb_row`, `et_pb_column`, `et_pb_module`) SÍ nombran
 * una cosa. En el clon no hay equivalente, así que la fila se identifica **por
 * comportamiento**: el bloque hijo de la sección que va centrado y es más
 * estrecho que ella. Se dice por dónde se entró (`via`) en cada lado.
 *
 * **3 · Emparejar por CONTENIDO, no por índice.** El nº de secciones ya difiere
 * entre lados por partición (D1/D2), así que casar por posición compararía cosas
 * distintas — la clase C7. Se empareja por la **firma de texto** de la fila, y lo
 * que no case se reporta como HUÉRFANO en vez de desaparecer.
 *
 * **4 · Censo en los DOS lados, y el pleno también avisa.** Un selector que no
 * casa en ninguna página sale por error; uno que casa en el 100 % se declara con
 * su máximo, porque *un patrón que casa en todas no mide nada*.
 *
 * DIAGNÓSTICO PURO: esta sonda no arregla nada y no propone arreglos.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, QA, env, hoy, iniciarClon, launch, openPage, settle, w, enApp} from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = env("SABOTAJE");
const SOLO = env("SOLO");

const { base: CLON, parar: pararClon } = await iniciarClon();

/* Las rutas salen del BUILD, como en `c-cmp`: una ruta nueva entra sola. */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const RUTAS = Object.keys(manifiesto.routes || {})
  // Rutas internas de Next: no existen en el original y solo aportan 404.
  .filter((r) => !/^\/(_not-found|_global-error|favicon)/.test(r))
  .sort()
  .filter((r) => !SOLO || r.includes(SOLO));
if (RUTAS.length === 0) {
  console.error(`❌ SOLO=${SOLO} no casa con ninguna ruta emitida — filtro equivocado, no corrida limpia.`);
  await pararClon();
  process.exit(2);
}
/** `/x` → `/es/x/`, igual que en `c-cmp`: el clon reproduce el árbol del original. */
const aOriginal = (r) => `https://kunakair.com/es${r === "/" ? "/" : r + "/"}`;

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const W = (el) => r(el.getBoundingClientRect().width);
  /**
   * ⚠ La firma va SIN ESPACIOS. El original separa los nodos en línea con
   * espacios y el clon no —el mismo texto sale «Inicio Productos» contra
   * «InicioProductos»—, así que normalizar a UN espacio no empareja: la primera
   * versión casó **0 de 13 filas** y aun así imprimió ✅. Es la trampa de
   * `charsCenso()` de `CLAUDE.md`: dos definiciones de «lo mismo».
   *
   * ⚠⚠ **Y va con `innerText`, no con `textContent`, por lo mismo dos veces
   * más.** Las dos correcciones son de la misma familia —el emparejador tenía
   * TRES definiciones distintas de «el mismo texto»— y cada una se llevaba por
   * delante filas que sí tenían pareja:
   *
   *   1. **El original sirve TODOS LOS IDIOMAS en el DOM** y oculta por CSS
   *      todos menos uno. Es el hallazgo del «¡Suscríbete!» del pie, otra vez:
   *      «cuántos casan» y «cuántos se ven» son preguntas distintas. Con
   *      `textContent` la fila del original decía
   *      «TambiéntepuedeinteresarRelatedcontentقديهمكأيضًا» y la del clon
   *      «Tambiéntepuedeinteresar…»: nunca podían casar. `innerText` solo
   *      devuelve lo RENDERIZADO.
   *   2. **La flecha de los botones es `::after` en el original y un `<span>`
   *      en el clon**, así que sale en el texto de un lado y no del otro
   *      («Descargarcatálogo→» contra «Descargarcatálogo»). Se quita de los
   *      DOS, que es lo que la vuelve la misma definición. Es decoración en los
   *      dos casos y en el clon va `absolute`, o sea que no mueve maquetación:
   *      esto NO es un defecto de fidelidad, es una diferencia de acarreo.
   */
  const firma = (el) => {
    if (!el) return "";
    const t = el.innerText ?? el.textContent ?? "";
    return t.replace(/[→←↑↓➔»]/g, "").replace(/\s+/g, "").slice(0, 48);
  };

  /**
   * Firma de RESPALDO para las filas sin texto. Una fila de solo imágenes —la
   * banda de clientes, una galería— no puede emparejar por texto **nunca**, y
   * eso no es una diferencia entre los dos lados: es un límite del método. Los
   * assets del clon se descargan del original con su nombre, así que el nombre
   * de fichero **sí** identifica la misma fila en los dos.
   *
   * ⚠ Es un CONJUNTO, no una cadena en orden, y esa decisión está medida: la
   * banda de clientes es un **carrusel con autoplay de 2.5 s** (13 logos), así
   * que las tres imágenes visibles dependen del instante de la captura. La
   * primera versión concatenaba las tres en orden y daba
   * `…|emt-madrid.svg|gent.svg` contra `…|teck.svg|apm-terminals.svg`: la misma
   * fila, dos fases del carrusel, cero parejas. Es la misma lección que el
   * módulo barajado, en otro medio — **lo que rota no se puede usar como
   * identidad; lo que se puede usar es que compartan alguna.**
   */
  const firmaImg = (el) =>
    [...new Set(
      [...el.querySelectorAll("img")]
        .map((i) => (i.currentSrc || i.src || "").split("/").pop().split("?")[0])
        .filter(Boolean),
    )].slice(0, 12);

  // Negativo 1: selector muerto en los dos lados ⇒ tiene que salir por error.
  if (sabotaje === "1" || sabotaje === "muerto") __q(".ancho-selector-que-no-existe");
  // Negativo 2: un patrón ubicuo ⇒ tiene que salir por PLENO, no por dato.
  if (sabotaje === "pleno") __qa("div");

  const esOriginal = !!__q(".et_pb_section");

  /* ── Las SECCIONES del cuerpo, con el selector de cada lado ─────────────── */
  const secciones = esOriginal
    ? __qa(".et_pb_section").filter((s) => !/_tb_(header|footer)\b/.test(s.className))
    : __qa("main > section, main > div");

  /**
   * La FILA dentro de una sección.
   *   · original → `.et_pb_row` (clase del tema: eso SÍ es identidad)
   *   · clon     → por COMPORTAMIENTO: hijo de la sección, más estrecho que ella
   *                y centrado (márgenes laterales iguales y no nulos).
   * Devolver el primer hijo a secas —lo que hacían sondas anteriores— casa con
   * bloques a ancho completo que no son filas.
   */
  /**
   * ⚠ **Y en el clon, desde 2026-08-02, PRIMERO EL MARCADOR.** El detector
   * conductual **sobre-casa**: en las páginas de sector daba 16 filas contra las
   * 11 del original, porque casa también bloques centrados anidados que en Divi
   * no son filas. Eso no solo infla el recuento — deja **huérfanas que no son
   * preguntas de verdad**, y una huérfana falsa gasta exactamente la misma
   * atención que una real.
   *
   * El arreglo no es afinar el heurístico: es que el clon **diga cuál es su
   * fila**, igual que el original lo dice con `.et_pb_row`. `data-fila` es
   * MARCADOR DE SONDA, no estilo: no cambia ni un píxel, cambia la identidad.
   *
   * El conductual se queda como respaldo declarado —`via`— para que una página
   * todavía sin marcar no desaparezca de la comparación en silencio, que sería
   * cambiar un sobre-casado por un hueco invisible.
   */
  const filasDe = (sec) => {
    if (esOriginal) return { via: "et_pb_row", filas: [...sec.querySelectorAll(".et_pb_row, [class*='et_pb_row']")] };
    /* El marcador NO se busca aquí: se recorre sobre `main` entero, más abajo.
     * Este camino es solo el RESPALDO de una página todavía sin marcar. */
    const anchoSec = sec.getBoundingClientRect().width;
    const cand = [];
    const visita = (el, prof) => {
      if (prof > 3) return;
      for (const h of el.children) {
        const b = h.getBoundingClientRect();
        const cs = getComputedStyle(h);
        const izq = b.left - el.getBoundingClientRect().left;
        const der = el.getBoundingClientRect().right - b.right;
        const centrado = Math.abs(izq - der) < 1.5 && izq > 0.5;
        if (b.width > 0 && b.width < anchoSec - 1 && centrado && cs.display !== "none") cand.push(h);
        else visita(h, prof + 1);
      }
    };
    visita(sec, 0);
    return { via: "conductual", filas: cand };
  };

  const columnasDe = (fila) =>
    esOriginal ? [...fila.querySelectorAll(".et_pb_column")] : [...fila.children].filter((c) => getComputedStyle(c).display !== "none");

  const filas = [];
  const vias = {};
  const porSeccion = {};
  const empuja = (fila, sec, iSec, via) => {
    const anchoSec = W(sec);
    const anchoFila = W(fila);
    const cols = columnasDe(fila);
    vias[via] = (vias[via] || 0) + 1;
    porSeccion[iSec] = (porSeccion[iSec] || 0) + 1;
    filas.push({
      iSec,
      iFila: porSeccion[iSec] - 1,
      via,
      firma: firma(fila),
      firmaImg: firmaImg(fila),
      secW: anchoSec,
      filaW: anchoFila,
      // El % que es lo trasladable al CMS: la retícula se escribe en %.
      pctDeSeccion: anchoSec ? r((anchoFila / anchoSec) * 100) : null,
      /**
       * ⚠ La marca que decide si el número vale: una fila que MIDE LO MISMO que
       * su sección no está diciendo su ancho, está repitiendo el de su padre.
       * Un Δ0 ahí no verifica nada (lección 1).
       */
      informativo: anchoSec - anchoFila > 1,
      nCols: cols.length,
      cols: cols.slice(0, 8).map((c) => {
        const cw = W(c);
        return { w: cw, pctDeFila: anchoFila ? r((cw / anchoFila) * 100) : null, informativo: anchoFila - cw > 1 };
      }),
    });
  };

  /**
   * ⚠ **El clon se recorre por MARCADOR sobre `main` entero, no sección a
   * sección.** No es un atajo: la miga de pan del clon vive en un `<nav>` que
   * cuelga de `main` **fuera de toda sección** —la partición D2— mientras que
   * en el original es una `.et_pb_row` dentro de una sección. Recorriendo por
   * secciones, esa fila **no existe por ningún lado** y las ~29 migas del
   * original salían huérfanas por una diferencia de envoltorio, no de ancho.
   *
   * Se puede porque el emparejamiento es POR CONTENIDO (lección 3): no hace
   * falta que los dos lados recorran el mismo árbol, solo que las filas se
   * puedan reconocer. La sección de referencia se busca después, y si no la
   * hay, la referencia es `main`.
   */
  const raiz = __q("main") || document.body;
  /* Negativo 3: el clon como si nadie hubiera marcado nada ⇒ tiene que caer al
   * respaldo conductual Y declararlo en «SIN MARCADOR», no medir peor en
   * silencio. */
  if (sabotaje === "sinmarcador" && !esOriginal)
    for (const el of raiz.querySelectorAll("[data-fila]")) el.removeAttribute("data-fila");
  /* Negativo 4: un marcador dentro de otro ⇒ la guarda de anidados tiene que
   * cerrar el código de salida. */
  if (sabotaje === "anidado" && !esOriginal) {
    const primera = raiz.querySelector("[data-fila]");
    if (primera?.firstElementChild) primera.firstElementChild.setAttribute("data-fila", "");
  }
  let marcadas = esOriginal ? [] : [...raiz.querySelectorAll("[data-fila]")];
  /* Un marcador dentro de otro declararía dos filas donde el original tiene
   * una: se descarta el interior y se CUENTA, porque eso es un marcador mal
   * puesto y tiene que verse. */
  const anidadas = marcadas.filter((el) => marcadas.some((o) => o !== el && o.contains(el)));
  if (anidadas.length) vias.marcadorAnidado = anidadas.length;
  marcadas = marcadas.filter((el) => !anidadas.includes(el));

  if (marcadas.length) {
    for (const fila of marcadas) {
      const sec = secciones.find((s) => s.contains(fila)) || raiz;
      empuja(fila, sec, secciones.indexOf(sec), "marcador");
    }
  } else {
    secciones.forEach((sec, iSec) => {
      const { via, filas: encontradas } = filasDe(sec);
      for (const fila of encontradas) empuja(fila, sec, iSec, via);
    });
  }

  return {
    ancho: r(document.documentElement.clientWidth),
    nSecciones: secciones.length,
    nFilas: filas.length,
    vias,
    filas,
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: hoy(), solo: SOLO ?? null, sabotaje: SABOTAJE ?? null }, rutas: {} };
let muertas = 0, conDelta = 0, huerfanasTot = 0, noInformativas = 0, comparadas = 0;
/** Cobertura AL NIVEL EN QUE SE MIDE: filas, no rutas. Ver el informe final. */
let parejasTot = 0, filasOrigTot = 0, filasClonTot = 0;
const viasTot = {};
const porMetodo = {};
const sinMarcar = [];

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "ancho-cuerpo", unidad: "páginas (2 por unidad: los dos lados)", minimo: (RUTAS.length) * 2, porPaginas: true });

for (const ruta of RUTAS) {
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

    /* ══ Emparejar por CONTENIDO, no por índice (lección 3) — TRES PASADAS ══
     *
     * Una sola pasada de firma exacta dejaba fuera tres clases de fila que **sí
     * tienen pareja**, y contarlas como «huérfanas» las convertía en preguntas
     * abiertas que ya tenían respuesta. Cada pasada lleva su nombre al fichero
     * (`metodo`) porque **un Δ obtenido con un emparejamiento flojo no vale lo
     * mismo que uno obtenido con la firma entera**, y quien lea el fichero tiene
     * que poder distinguirlos sin preguntar.
     *
     *   1 · `texto`    — la firma completa. La buena.
     *   2 · `prefijo`  — los primeros 12 caracteres, y **solo si hay
     *                    exactamente un candidato de cada lado**. Existe por el
     *                    módulo «Artículos y Guías», que el original BARAJA en
     *                    cada carga (la familia de ruido 27·54·81 de
     *                    `CLAUDE.md`): su texto cambia entre cargas, así que la
     *                    firma exacta no puede casar nunca, y su ANCHO —lo que
     *                    esta sonda mide— es perfectamente estable.
     *   3 · `imagenes` — el nombre de fichero de las imágenes, para las filas
     *                    SIN TEXTO. También exige candidato único por lado.
     *
     * La unicidad no es un detalle: sin ella, dos filas parecidas se emparejan
     * con la primera que pillan y el Δ que salga será de dos cosas distintas —
     * exactamente el fallo que la lección 3 viene a evitar.
     */
    const usadas = new Set();
    const pares = [];
    const parDe = new Map(); // índice de fila del clon → índice de fila del original
    const metodo = new Map(); // índice de fila del original → cómo se emparejó

    const unico = (lista, pred) => {
      const hits = lista.map((x, k) => [x, k]).filter(([x, k]) => !usadas.has(k) && pred(x));
      return hits.length === 1 ? hits[0][1] : -1;
    };

    for (const [j, fo] of o.filas.entries()) {
      let i = c.filas.findIndex((fc, k) => !usadas.has(k) && fc.firma && fc.firma === fo.firma);
      let via = "texto";
      if (i < 0 && fo.firma.length >= 12) {
        const pre = fo.firma.slice(0, 12);
        // Unicidad EN LOS DOS LADOS: si el original tiene dos filas con el mismo
        // prefijo, no hay forma de saber cuál es cuál.
        const ambiguoOrig = o.filas.filter((x, k) => k !== j && !metodo.has(k) && x.firma.startsWith(pre)).length > 0;
        if (!ambiguoOrig) { i = unico(c.filas, (fc) => fc.firma.startsWith(pre)); via = "prefijo"; }
      }
      if (i < 0 && !fo.firma && fo.firmaImg.length) {
        const comparte = (x) => x.firmaImg.some((n) => fo.firmaImg.includes(n));
        const ambiguoOrig = o.filas.filter((x, k) => k !== j && !metodo.has(k) && !x.firma && comparte(x)).length > 0;
        if (!ambiguoOrig) { i = unico(c.filas, (fc) => !fc.firma && comparte(fc)); via = "imagenes"; }
      }
      if (i >= 0) { usadas.add(i); parDe.set(i, j); metodo.set(j, via); pares.push([fo, c.filas[i]]); }
      else pares.push([fo, null]);
    }
    const huerfanasClon = c.filas.filter((_, k) => !usadas.has(k));
    for (const v of metodo.values()) porMetodo[v] = (porMetodo[v] || 0) + 1;

    /**
     * ⚠ **UNA HUÉRFANA SIN TEXTO NO ES LA MISMA PREGUNTA QUE UNA HUÉRFANA CON
     * TEXTO, y contarlas juntas oculta cuál de las dos tienes delante.**
     *
     *   · **sin texto** (`firma === ""`) — una fila de solo imagen o solo
     *     botón no puede emparejar por firma de texto **nunca**: es un límite
     *     del método de emparejamiento, no una diferencia entre los dos lados.
     *     Se arregla cambiando el emparejador, no el clon.
     *   · **con texto** — el otro lado no tiene ninguna fila con ese texto: eso
     *     sí es una pregunta sobre la PARTICIÓN, la clase de D1/D2.
     *
     * Se separan porque el plan de cierre de cada una es distinto, y porque
     * «177 huérfanas» sin desglosar invita a leerlas todas como partición.
     */
    const clasifica = (fs) => ({
      sinTexto: fs.filter((f) => !f.firma).length,
      conTexto: fs.filter((f) => f.firma).length,
    });
    const huerfanasOrigLista = pares.filter(([, fc]) => !fc).map(([fo]) => fo);

    const difs = [];
    for (const [j, [fo, fc]] of pares.entries()) {
      if (!fc) continue;
      const d = +(fc.filaW - fo.filaW).toFixed(2);
      const dPct = fo.pctDeSeccion != null && fc.pctDeSeccion != null ? +(fc.pctDeSeccion - fo.pctDeSeccion).toFixed(2) : null;
      // Solo cuenta como comparación con valor si el ancho DICE algo en los dos.
      const vale = fo.informativo && fc.informativo;
      comparadas++;
      if (!vale) noInformativas++;
      if (vale && Math.abs(d) > 0.5) difs.push({ firma: fo.firma, metodo: metodo.get(j), orig: fo.filaW, clon: fc.filaW, d, dPct, pctO: fo.pctDeSeccion, pctC: fc.pctDeSeccion, nColsO: fo.nCols, nColsC: fc.nCols });
    }
    const huerfanasOrig = huerfanasOrigLista.length;
    huerfanasTot += huerfanasOrig + huerfanasClon.length;
    if (difs.length) conDelta++;
    parejasTot += pares.filter(([, fc]) => fc).length;
    filasOrigTot += o.nFilas;
    filasClonTot += c.nFilas;
    for (const [v, n] of Object.entries(c.vias)) viasTot[v] = (viasTot[v] || 0) + n;
    if (!c.vias.marcador && o.nFilas > 0) sinMarcar.push(ruta);

    salida.rutas[ruta] = {
      nFilas: { orig: o.nFilas, clon: c.nFilas },
      nSecciones: { orig: o.nSecciones, clon: c.nSecciones },
      /** Por dónde se identificó la fila en el clon. Un cambio de `via` cambia
       *  el conjunto medido, así que va en el fichero, no solo en la consola. */
      via: { orig: "et_pb_row", clon: c.vias },
      emparejadas: pares.filter(([, fc]) => fc).length,
      /** Con qué pasada casó cada pareja. Un `prefijo` no vale lo que un `texto`. */
      metodos: [...metodo.values()].reduce((a, v) => ((a[v] = (a[v] || 0) + 1), a), {}),
      huerfanas: {
        orig: huerfanasOrig,
        clon: huerfanasClon.length,
        porQue: { orig: clasifica(huerfanasOrigLista), clon: clasifica(huerfanasClon) },
        firmasOrig: huerfanasOrigLista.map((f) => f.firma || "(sin texto)"),
        firmasClon: huerfanasClon.map((f) => f.firma || "(sin texto)"),
      },
      /**
       * El INVENTARIO completo de las dos listas. Sin él, «99 de 276» es una
       * cifra que hay que creerse: con él, cualquiera puede ver qué fila cayó
       * de qué lado y por qué — que es la regla 2 de §sondas llevada al nivel
       * en el que este eje declara su cobertura.
       */
      inventario: {
        orig: o.filas.map((f, j) => ({ sec: f.iSec, firma: f.firma, img: f.firmaImg, w: f.filaW, pct: f.pctDeSeccion, inf: f.informativo, par: pares[j][1] ? "sí" : null })),
        clon: c.filas.map((f, k) => ({ sec: f.iSec, via: f.via, firma: f.firma, img: f.firmaImg, w: f.filaW, pct: f.pctDeSeccion, inf: f.informativo, par: parDe.has(k) ? parDe.get(k) : null, comoPar: parDe.has(k) ? metodo.get(parDe.get(k)) : null })),
      },
      difs,
    };

    const marca = difs.length ? "▲" : "·";
    console.log(
      `  ${marca} ${ruta.slice(0, 52).padEnd(54)} filas ${String(o.nFilas).padStart(3)}→${String(c.nFilas).padStart(3)}` +
        ` [${Object.keys(c.vias).join("+") || "—"}]  Δ≠0 ${String(difs.length).padStart(2)}` +
        `  pares ${String(pares.filter(([, fc]) => fc).length).padStart(2)}  huérfanas ${huerfanasOrig}/${huerfanasClon.length}`,
    );
    for (const d of difs.slice(0, 6))
      console.log(`        ${String(d.orig).padStart(8)} → ${String(d.clon).padStart(8)}  Δ ${String(d.d).padStart(8)}  (${d.pctO}% → ${d.pctC}%)  cols ${d.nColsO}/${d.nColsC}  | ${d.firma}`);
  } catch (e) {
    muertas++;
    salida.rutas[ruta] = { error: String(e).slice(0, 200) };
    console.log(`  ✗ ${ruta.slice(0, 52).padEnd(54)} ERROR ${String(e).slice(0, 70)}`);
  }
}
await browser.close();
await pararClon();

w(env("SALIDA") || `medidas/ancho-cuerpo-${width}${SOLO ? `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}` : ""}.json`, salida);

/* ── Un canal de verdad ──────────────────────────────────────────────────── */
const muertos = censo.informe(`@${width}`);
/** El pleno: un selector que casa en TODAS las páginas no discrimina (lección 4). */
const ubicuos = Object.entries(censo.total).filter(([, n]) => n > censo.paginas * 40);
if (ubicuos.length)
  console.error(`\n⚠ PATRÓN UBICUO — casa ${ubicuos[0][1]} veces en ${censo.paginas} páginas: no está discriminando nada.\n` + ubicuos.map(([s, n]) => `     · ${s} (${n})`).join("\n"));
if (muertas) console.error(`\n❌ ${muertas} ruta(s) no se pudieron medir — NO son «sin diferencia».`);

/**
 * ⚠ **LA COBERTURA SE DECLARA AL NIVEL AL QUE SE MIDE, y el de este eje son
 * FILAS.** «31/31 rutas» es verdad y es la cifra equivocada: una ruta cuenta
 * como cubierta con una sola de sus doce filas emparejada. Por eso el informe
 * imprime primero el cociente de filas y solo después el de rutas — y por eso
 * `COBERTURA-MEDICION.md` lleva la misma columna.
 */
const pctFilas = filasOrigTot ? ((parejasTot / filasOrigTot) * 100).toFixed(1) : "—";
console.log(
  `\n─── ANCHO DEL CUERPO @${width} · ${RUTAS.length - muertas}/${RUTAS.length} rutas\n` +
    `      COBERTURA REAL        : ${parejasTot}/${filasOrigTot} filas del original emparejadas (${pctFilas} %)\n` +
    `      cómo se emparejaron   : ${Object.entries(porMetodo).map(([m, n]) => `${m} ${n}`).join(" · ") || "—"}\n` +
    `      filas del clon        : ${filasClonTot}   vía ${Object.entries(viasTot).map(([v, n]) => `${v} ${n}`).join(" · ") || "—"}\n` +
    `      filas comparadas      : ${comparadas}\n` +
    `      de ellas NO informativas: ${noInformativas}  ← su Δ0 no verifica nada (llenan a su padre)\n` +
    `      rutas con Δ ≠ 0       : ${conDelta}\n` +
    `      filas huérfanas       : ${huerfanasTot}  ← no emparejadas por firma: son PREGUNTAS, no defectos\n`,
);
/**
 * Una ruta sin una sola fila marcada sigue midiéndose por el conductual, así que
 * **no desaparece**; pero su recuento es el del heurístico que sobre-casa, y eso
 * hay que verlo desde la consola en vez de deducirlo del fichero.
 */
if (sinMarcar.length)
  console.log(
    `      ⚠ ${sinMarcar.length} ruta(s) SIN MARCADOR de fila en el clon — medidas por el detector\n` +
      `        conductual, que sobre-casa. Su recuento es una cota superior, no una lista:\n` +
      sinMarcar.slice(0, 8).map((r) => `           · ${r}`).join("\n") +
      (sinMarcar.length > 8 ? `\n           … y ${sinMarcar.length - 8} más` : "") + "\n",
  );
/**
 * ⚠ ACOTAR NO PUEDE VOLVERSE VERDE POR VACIADO. La primera corrida comparó
 * **0 filas** —el emparejamiento no casaba ninguna— y salió con ✅ y código 0.
 * Una sonda que no compara nada y una que compara y no encuentra nada dan la
 * misma salida; sin esta guarda, este eje habría pasado de «0/31» a «verde»
 * sin haber medido una sola fila.
 */
const sinComparar = comparadas === 0;
if (sinComparar)
  console.error(
    `\n❌ 0 FILAS COMPARADAS en ${RUTAS.length - muertas} ruta(s): el emparejamiento no casó NADA.\n` +
      "   Eso no es «no hay diferencias», es que la sonda no midió. Revisa la firma.",
  );
/**
 * ⚠ Un `data-fila` DENTRO de otro declara dos filas donde el original tiene una:
 * es un marcador mal puesto, y sale por error. Sin esta guarda se descartaría en
 * silencio (la sonda ya se queda con el de fuera) y el marcador iría acumulando
 * ruido sin que nadie lo viera — que es como se llega a un heurístico con clase.
 */
const anidados = viasTot.marcadorAnidado || 0;
if (anidados)
  console.error(
    `\n❌ ${anidados} MARCADOR(ES) \`data-fila\` ANIDADO(S): una fila dentro de otra.\n` +
      `   El original no tiene filas anidadas, así que uno de los dos sobra. Se ha\n` +
      `   medido el de fuera, pero el marcador está mal puesto: arréglalo en el clon.`,
  );
const fallos = muertos + muertas + ubicuos.length + (sinComparar ? 1 : 0) + (anidados ? 1 : 0);
console.log(`${fallos === 0 ? "✅" : "❌"} ancho-cuerpo @${width} · ${muertos} muerto(s) · ${ubicuos.length} ubicuo(s)\n   ⚠ DIAGNÓSTICO: nada se arregla aquí. Cada Δ se adjudica contra el original y se ficha con su encuadre.`);
process.exit(fallos === 0 ? 0 : 2);
