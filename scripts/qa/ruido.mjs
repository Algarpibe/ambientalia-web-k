/**
 * SUELO DE RUIDO DEL ORIGINAL — cuánto se mueve kunakair.com entre corridas.
 * Uso: node ruido.mjs [corridas]     (por defecto 3)
 *
 * Por qué existe: el original **no es un objetivo de medición estable**. Dos
 * corridas del mismo día leyeron el h1 de Industria a 219.4 y a 189.4 (el clon
 * dio 189.4 en las dos), y el `docH` de la misma página a 7117 y 7144. Sin un
 * suelo medido no hay forma de saber si un Δ pequeño es un defecto del clon o
 * es el original respirando.
 *
 * Separa DOS magnitudes, porque no tienen el mismo ruido y confundirlas hace
 * descartar defectos reales:
 *   · POSICIONAL — `docH`, y el `top` del h1 y del pie. Acumula todo lo que
 *     pase más arriba (una línea que envuelve, un aviso, una fuente que carga
 *     tarde), así que es la magnitud ruidosa.
 *   · DIMENSIONAL — el alto de cada `.et_pb_row`. No acumula nada de fuera de
 *     la fila, así que es mucho más estable. Un Δ de alto de caja NO se juzga
 *     contra el suelo posicional.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Censo, env, envRutas, Evaluadas, launch, openPage, QA, settle, w } from "./lib.mjs";

/* Esta sonda SOLO abre el original: un `build` del clon no la afecta, así que
 * no debe dispararle la guarda de `BUILD_ID` de `w()` (ver `lib.mjs`).
 * Se pone ARRIBA, junto al `import`, y no a media página: la bandera se lee en
 * cada llamada, pero dejarla lejos de su motivo es cómo se llegó a la versión
 * en que era inerte. */
process.env.SIN_CLON = "1";

/**
 * ⚠ **LA LISTA ES EL ALCANCE DE LA AFIRMACIÓN, y durante meses no se leyó así.**
 *
 * De estas 7 páginas × 2 anchos salen las **14 combinaciones** cuya dispersión
 * de `h1` fue 0 en 42 cargas, y de ahí la regla fundacional de `CLAUDE.md`: *la
 * base de lectura es el `h1`*. Lo que la regla NO dice es que esas 7 son las que
 * había clonadas **en julio de 2026**: no incluyen los dos monográficos, ni el
 * caso, ni la FAQ. La afirmación se citaba como si valiera para el sitio entero.
 *
 * Por eso ahora la lista se puede pasar por fuera: medir el suelo de una ruta
 * nueva tiene que ser correr la sonda, no editarla.
 *
 *   RUTAS=/software-de-medicion-calidad-del-aire,/sectores/x ETIQUETA=cqa6 \
 *     npm run qa:ruido -- 3
 */
const PORDEFECTO = [
  ["home", "https://kunakair.com/es/"],
  ["monitor", "https://kunakair.com/es/monitor-calidad-aire/"],
  ["accesorios", "https://kunakair.com/es/accesorios/"],
  ["software", "https://kunakair.com/es/software-de-medicion-calidad-del-aire/"],
  ["api", "https://kunakair.com/es/kunak-api/"],
  ["urbano", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/"],
  ["industria", "https://kunakair.com/es/sectores/control-de-emisiones-industriales/"],
];

/** `RUTAS` acota/sustituye la lista. El nombre corto sale del último segmento. */
const PEDIDAS = envRutas("RUTAS");
const PAGINAS = PEDIDAS
  ? PEDIDAS.map((r) => [r.split("/").filter(Boolean).pop().slice(0, 16), `https://kunakair.com/es${r}/`])
  : PORDEFECTO;

/** Sufijo de la salida, para no mezclar el suelo general con el de una tanda. */
const ETIQUETA = env("ETIQUETA") ? `-${env("ETIQUETA")}` : "";

/**
 * Negativos (`SABOTAJE=`), porque una sonda a la que no se le ha visto fallar no
 * es una sonda:
 *   · `muerto`   — el ancla del `h1` pasa a ser un selector inventado ⇒ el censo
 *                  tiene que sacarla por ERROR, no medir 0 y dar verde.
 *   · `detector` — se inyectan dos detectores binarios de mentira, uno que nunca
 *                  dispara y otro que dispara siempre ⇒ los DOS tienen que salir
 *                  como NO VALIDADOS. Es la regla del cero **y** la del pleno en
 *                  la misma corrida.
 */
const SABOTAJE = env("SABOTAJE");

const CORRIDAS = Number(process.argv[2] || 3);
const { browser } = await launch();
const censo = new Censo();
const crudo = {};
/**
 * Contrato de `Evaluadas` (lib.mjs). La unidad es una CARGA: rutas × 2 anchos ×
 * corridas. Es exacto, no un suelo — y sustituye a la guarda ad-hoc de «ninguna
 * combinación válida», que era la 4.ª instancia local de esta misma clase.
 */
const ev = new Evaluadas({ nombre: "ruido", unidad: "cargas", minimo: PAGINAS.length * 2 * CORRIDAS, porPaginas: true });

/* ══════════════════════════════════════════════════════════════════════════
 * EL OBSERVABLE DISCRIMINANTE — por qué una ráfaga que solo mide `h1.y` ya no
 * puede cerrar esta campaña
 *
 * Las ráfagas 1 y 2 dejaron establecido que el `h1` tiene **dos estados
 * discretos separados por 32.28 exactos**, con el valor alto idéntico en dos
 * días distintos. Eso ya no es temblor continuo: es una **condición binaria**
 * del original. Y una condición binaria no se explica midiendo más veces la
 * misma magnitud —eso solo vuelve a contar CUÁNTO mueve—, sino registrando en
 * **la misma carga** algo que cambie con ella.
 *
 * Por eso cada carga anota ahora, junto al `h1.y`:
 *
 *   · `fuentes`       — `document.fonts.status` y cuántas caras hay cargadas
 *   · `h1Familia`     — el `font-family` COMPUTADO del `h1`
 *   · `h1Disponibles` — cuáles de esas familias dice `document.fonts.check()`
 *                       que están de verdad disponibles al pintar
 *   · `h1Renglones` / `h1AnchoTexto` — la caja RENDERIZADA del texto
 *   · `cadena`        — dónde entra el desplazamiento, nivel a nivel
 *
 * ⚠ **La trampa, dicha antes de que nadie lea el fichero:
 * `getComputedStyle(h1).fontFamily` devuelve la LISTA DECLARADA, no la fuente
 * con la que se pintó.** Si la webfont no ha llegado y el navegador usa la de
 * reserva, ese valor **no cambia**: es un detector que, él solo, no puede
 * discriminar el fenómeno que se le pide discriminar — la regla del selector
 * muerto con otra cara. Se registra igual, porque descarta que el CSS servido
 * cambie entre cargas, pero **quien discrimina son los otros tres**:
 * `fonts.status` y `check()` dicen qué hay cargado, y el ancho y los renglones
 * del texto dicen con qué se pintó de verdad.
 *
 * ⚠ **Y la `cadena`, porque el ±32.28 NO está DENTRO del `h1`: está en su `y`.**
 * Lo que crece está POR ENCIMA. Un observable que solo mire el titular podría
 * decir «no fue su tipografía» y no podría decir qué fue. La cadena anota, del
 * `h1` hacia arriba, la `y` de cada antepasado y el desplazamiento del hijo
 * dentro de él: **el nivel en el que ese desplazamiento cambia entre dos cargas
 * es el nivel donde nace el 32.28.** Es la regla del NIVEL de `CLAUDE.md`
 * aplicada al ruido en vez de a un defecto.
 * ═════════════════════════════════════════════════════════════════════════ */
const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const y = (el) => (el ? r(el.getBoundingClientRect().top + scrollY) : null);

  /**
   * Renglones RENDERIZADOS. `el.getClientRects().length` **no los cuenta** en un
   * elemento de bloque —devuelve la caja de borde, o sea 1 siempre—; un `Range`
   * sí da una caja por línea. Se agrupan por `top` porque un renglón partido en
   * varios nodos de texto produce varias cajas con el mismo `top`.
   */
  const renglones = (el) => {
    if (!el) return null;
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const cajas = [...rango.getClientRects()].filter((b) => b.height > 0);
    const tops = new Set(cajas.map((b) => Math.round(b.top)));
    const ancho = cajas.length ? r(Math.max(...cajas.map((b) => b.width))) : null;
    rango.detach?.();
    return { n: tops.size || null, anchoTexto: ancho };
  };

  /* El ancla de todo el protocolo. `SABOTAJE=muerto` la cambia por un selector
   * inventado: tiene que salir por el censo, no por un 0 silencioso. */
  const h1 = sabotaje === "muerto" ? __q("h1.no-existe-este-ancla") : __q("h1");
  const cs = h1 ? getComputedStyle(h1) : null;

  /** Las familias declaradas, y cuáles de ellas están de verdad disponibles. */
  const familias = cs
    ? cs.fontFamily.split(",").map((f) => f.trim().replace(/^["']|["']$/g, ""))
    : [];
  const disponibles = familias.filter((f) => {
    try {
      return document.fonts.check(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} "${f}"`);
    } catch {
      return false;
    }
  });

  /**
   * La CADENA hasta el `h1`: por cada antepasado, su `y` y el desplazamiento del
   * hijo dentro de él. Dos cargas con `h1.y` distinto se diffean por aquí y el
   * nivel donde el desplazamiento cambia es el nivel donde nace la diferencia.
   */
  const cadena = [];
  for (let el = h1, prof = 0; el && el !== document.documentElement && prof < 12; el = el.parentElement, prof++) {
    const p = el.parentElement;
    cadena.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().trim().split(/\s+/).slice(0, 2).join(" ").slice(0, 40),
      y: y(el),
      h: r(el.getBoundingClientRect().height),
      // Desplazamiento del hijo dentro del padre: lo único que ve el nivel.
      dentro: p ? r(el.getBoundingClientRect().top - p.getBoundingClientRect().top) : null,
    });
  }

  return {
    docH: document.documentElement.scrollHeight,
    h1: y(h1),
    pie: y(__q("footer, .et_pb_section_0_tb_footer")),
    filas: __qa(".et_pb_row").map((f) => r(f.getBoundingClientRect().height)),

    /* ── El observable discriminante, por carga ─────────────────────────── */
    fuentes: document.fonts?.status ?? null,
    fuentesCargadas: document.fonts?.size ?? null,
    h1Familia: cs?.fontFamily ?? null,
    h1Disponibles: disponibles.join(" | ") || null,
    h1Tam: cs ? `${cs.fontSize}/${cs.lineHeight}/${cs.fontWeight}` : null,
    h1Renglones: renglones(h1)?.n ?? null,
    h1AnchoTexto: renglones(h1)?.anchoTexto ?? null,
    cadena,

    /**
     * ── DETECTORES BINARIOS ────────────────────────────────────────────────
     * HIPÓTESIS DE MECANISMO de C-QA6 — **solo se anota**. Rocket Loader de
     * Cloudflare aplaza la ejecución de los scripts, y eso desplaza cuándo
     * asientan fuentes y maquetación: compatible con un `h1` que envuelve
     * distinto, sincronizado en varias rutas y correlacionado con la latencia.
     *
     * ⚠ Un detector que devuelve **lo mismo en el 100 % de las cargas no es un
     * dato**: no ha discriminado nunca, ni en el sentido del cero ni en el del
     * pleno. El informe de abajo lo declara NO VALIDADO y **no se puede citar
     * como evidencia** hasta que se le vea cambiar.
     */
    detectores: {
      // Sin regex a propósito: el token siempre lleva un guion delante de
      // `-text/javascript`, y `type="text/javascript"` a secas no lo tiene.
      rocketToken: document.documentElement.innerHTML.includes('-text/javascript"'),
      /**
       * ⚠ **Este va con `querySelector` a pelo, FUERA del censo, y es una
       * excepción con motivo — no un descuido.** El censo declara defecto todo
       * selector que no casa en ninguna página, porque en una MEDIDA el `null`
       * se lee como dato. Aquí el `null` **es** el dato: el trabajo de un
       * detector de presencia es poder decir «no está».
       *
       * Metido en el censo, la primera corrida sacó `rocket-loader` como
       * selector muerto y cerró el código a 2 — o sea que una sonda de ruido no
       * podría volver a dar verde mientras Cloudflare no sirviera el script.
       *
       * Lo que NO se pierde por sacarlo de ahí: un detector con el selector mal
       * escrito y uno que mide una ausencia real dan lo mismo, y esa
       * indistinguibilidad es exactamente lo que el informe de detectores de
       * abajo declara como **NO VALIDADO**. La guarda no desaparece: cambia de
       * sitio, del censo al veredicto — y con ella la consecuencia, que es que
       * el detector no se puede citar.
       */
      rocketLoader: !!document.querySelector('script[src*="rocket-loader"], script[data-cf-settings]'),
      ...(sabotaje === "detector"
        ? { sabotajeNunca: false, sabotajeSiempre: true }
        : {}),
    },
  };
};

for (const ancho of [1440, 390]) {
  const mobile = ancho <= 500;
  for (let corrida = 0; corrida < CORRIDAS; corrida++) {
    for (const [nombre, url] of PAGINAS) {
      const clave = `${nombre}@${ancho}`;
      /**
       * ⚠ El TIEMPO DE CARGA se congela junto a cada medida (2026-07-31, para
       * la ráfaga 2 de cqa6). La hipótesis que debe poder contestarse desde el
       * fichero: el ±32.28 sincronizado correlaciona con la latencia del
       * original (carga lenta → fuentes/imágenes sin asentar → el `h1` envuelve
       * distinto). Cubre navegación + settle —todo lo que ve la medida— y se
       * guarda también en el error: un timeout ES un dato de latencia.
       */
      const t0 = Date.now();
      try {
        const { page } = await openPage(browser, url, {
          width: ancho,
          height: mobile ? 844 : 900,
          mobile,
        });
        await settle(page);
        const { datos: m } = await censo.medir(page, LECTOR, SABOTAJE);
        m.cargaMs = Date.now() - t0;
        (crudo[clave] ||= []).push(m);
        await page.close();
      } catch (e) {
        (crudo[clave] ||= []).push({ error: String(e).slice(0, 80), cargaMs: Date.now() - t0 });
      }
    }
  }
}

/* ─────────────────────────── dispersión por página ─────────────────────────── */

const disp = (xs) => {
  const v = xs.filter((n) => typeof n === "number");
  if (v.length < 2) return null;
  return Math.round((Math.max(...v) - Math.min(...v)) * 100) / 100;
};

/**
 * ── ¿EL OBSERVABLE ACOMPAÑA AL ESTADO DEL `h1`? ───────────────────────────
 *
 * El `h1` es **bimodal**: dos valores discretos a 32.28. Así que la pregunta que
 * cierra el mecanismo no es «¿cuánto varía el observable?» sino **«¿parte las
 * cargas en los mismos dos grupos que el `h1`?»**. Eso es lo que se calcula
 * aquí, y las tres respuestas posibles son distintas y hay que decirlas
 * distintas:
 *
 *   · `sí`      — cada estado del `h1` trae UN valor del observable, y estados
 *                 distintos traen valores distintos. **Es un candidato a causa.**
 *   · `no`      — el observable no distingue los estados: **descartado**.
 *   · `null`    — **en esta ráfaga el `h1` no cambió de estado**, así que no hay
 *                 nada contra lo que correlacionar. No es «no discrimina»: es
 *                 «aquí no se puede evaluar». Confundirlos sería cerrar la
 *                 pregunta en falso, que es el fallo entero de C-QA6.
 */
const OBSERVABLES = ["fuentes", "fuentesCargadas", "h1Familia", "h1Disponibles", "h1Tam", "h1Renglones", "h1AnchoTexto"];

const analizaObservable = (ok) => {
  const estados = [...new Set(ok.map((c) => c.h1).filter((v) => v !== null))];
  const porObs = {};
  for (const obs of OBSERVABLES) {
    const valores = [...new Set(ok.map((c) => JSON.stringify(c[obs] ?? null)))];
    let acompana = null;
    if (estados.length >= 2) {
      // Un valor por estado, y distinto entre estados: eso es acompañar.
      const mapa = estados.map((e) => [...new Set(ok.filter((c) => c.h1 === e).map((c) => JSON.stringify(c[obs] ?? null)))]);
      const constantePorEstado = mapa.every((v) => v.length === 1);
      const distintoEntreEstados = new Set(mapa.map((v) => v[0])).size === estados.length;
      acompana = constantePorEstado && distintoEntreEstados;
    }
    porObs[obs] = { nValores: valores.length, valores: valores.slice(0, 4).map((v) => JSON.parse(v)), acompana };
  }

  /**
   * Y el NIVEL en el que nace la diferencia. Con dos estados delante, se diffea
   * la cadena `h1`→raíz y se listan los niveles cuyo desplazamiento dentro del
   * padre cambió: **ahí es donde entran los 32.28**, y no en el `h1`.
   */
  let cadena = null;
  if (estados.length >= 2) {
    const a = ok.find((c) => c.h1 === estados[0])?.cadena || [];
    const b = ok.find((c) => c.h1 === estados[1])?.cadena || [];
    const niveles = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const d = +(b[i].dentro - a[i].dentro).toFixed(2);
      const dh = +(b[i].h - a[i].h).toFixed(2);
      if (Math.abs(d) > 0.5 || Math.abs(dh) > 0.5)
        niveles.push({ nivel: i, tag: a[i].tag, cls: a[i].cls, dentroA: a[i].dentro, dentroB: b[i].dentro, dDentro: d, dAlto: dh });
    }
    cadena = { entreEstados: [estados[0], estados[1]], mismaProfundidad: a.length === b.length, niveles };
  }
  return { estadosH1: estados, transicion: estados.length >= 2, porObservable: porObs, cadena };
};

const resumen = {};
for (const [clave, corridas] of Object.entries(crudo)) {
  const ok = corridas.filter((c) => !c.error);
  if (ok.length < 2) {
    resumen[clave] = { error: `solo ${ok.length} corrida(s) válida(s)`, observable: ok.length ? analizaObservable(ok) : null };
    continue;
  }
  // posicional
  const pos = {
    docH: disp(ok.map((c) => c.docH)),
    h1: disp(ok.map((c) => c.h1)),
    pie: disp(ok.map((c) => c.pie)),
  };
  /**
   * Dimensional: dispersión de cada fila **por índice**.
   *
   * ⚠ **Y por eso solo vale si el nº de filas NO cambia entre corridas.** Si
   * cambia, el índice `i` señala filas distintas en cada carga y la resta
   * compara peras con manzanas: sale un número enorme —8950.73 en la primera
   * corrida de C-QA6— que parece «el sitio es un caos» y en realidad es la
   * sonda restando la fila 7 de una carga menos la fila 7 de otra que no es la
   * misma fila.
   *
   * La sonda ya IMPRIMÍA «⚠ nº de filas variable» y **contaba igual el
   * número**: la regla 1 de `CLAUDE.md` §sondas, un canal de verdad, rota en el
   * propio informe. Ahora, si el nº de filas varía, el dimensional vale `null`
   * y se dice por qué. Un dato que no se puede calcular no se calcula.
   */
  const nFilas = Math.min(...ok.map((c) => c.filas.length));
  const mismasFilas = ok.every((c) => c.filas.length === nFilas);
  let dimMax = null;
  if (mismasFilas) {
    const porFila = [];
    for (let i = 0; i < nFilas; i++) porFila.push(disp(ok.map((c) => c.filas[i])));
    dimMax = porFila.length ? Math.max(...porFila.filter((n) => n !== null)) : null;
  }
  /** El tiempo de carga de la combinación: min/max entre corridas. La
   *  correlación latencia↔episodio se lee de aquí y del crudo. */
  const cargas = corridas.map((c) => c.cargaMs).filter((n) => typeof n === "number");
  resumen[clave] = {
    corridas: ok.length,
    posicional: pos,
    posicionalMax: Math.max(...Object.values(pos).filter((n) => n !== null)),
    dimensionalMax: dimMax,
    cargaMs: cargas.length ? { min: Math.min(...cargas), max: Math.max(...cargas) } : null,
    /** Por qué no hay dimensional, cuando no lo hay. */
    dimensionalNoMedible: mismasFilas ? null : `el nº de .et_pb_row varía entre corridas (${ok.map((c) => c.filas.length).join("/")}): comparar por índice compararía filas distintas`,
    filas: nFilas,
    mismoNumeroDeFilas: mismasFilas,
    /** El observable discriminante, congelado junto a la dispersión que explica. */
    observable: analizaObservable(ok),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA CAMPAÑA — porque una ráfaga no es un suelo.
 *
 * `CAMPANA=<nombre>` guarda esta ráfaga como **un fichero propio con su sello
 * de tiempo** dentro de `medidas/campana/<nombre>/`, y después lee **todas** las
 * ráfagas de esa campaña para dar el estado.
 *
 * Por qué un fichero por ráfaga y no uno que se actualiza: porque el suelo es el
 * **máximo entre ráfagas separadas en el tiempo**, así que cada ráfaga es un
 * dato independiente que hay que poder exhibir. Y porque la guarda de `w()`
 * impide (con razón) reescribir una salida congelada — una campaña que
 * acumulara en un solo fichero pelearía con ella en cada sesión.
 * ═════════════════════════════════════════════════════════════════════════ */
/* Esta sonda SOLO abre el original: un  del clon no la afecta, así que
 * no debe dispararle la guarda de BUILD_ID de  (ver ). */
process.env.SIN_CLON = "1";

const CAMPANA = env("CAMPANA");
if (!CAMPANA) {
  w(`medidas/ruido-crudo${ETIQUETA}.json`, crudo);
  w(`medidas/ruido${ETIQUETA}.json`, resumen);
} else {
  const sello = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = `medidas/campana/${CAMPANA}`;
  w(`${dir}/rafaga-${sello}.json`, {
    meta: { campana: CAMPANA, sello, corridas: CORRIDAS, rutas: PAGINAS.map(([n]) => n), anchos: [1440, 390] },
    resumen,
    crudo,
  });

  /* ── El estado de la campaña, leyendo TODAS las ráfagas ── */
  const abs = join(QA, dir);
  const ficheros = readdirSync(abs).filter((f) => f.startsWith("rafaga-") && f.endsWith(".json")).sort();
  const rafagas = ficheros.map((f) => JSON.parse(readFileSync(join(abs, f), "utf8")));

  /** Requisitos del protocolo (`CLAUDE.md` §Notas de método). */
  const MIN_RAFAGAS = 3;
  const MIN_DIAS = 2;
  const MIN_SEP_H = 2;

  const sellos = rafagas.map((r) => new Date(r.meta.sello.slice(0, 10) + "T" + r.meta.sello.slice(11).replace(/-/g, ":") + "Z"));
  const dias = new Set(rafagas.map((r) => r.meta.sello.slice(0, 10)));
  const ordenados = [...sellos].sort((a, b) => a - b);
  const separaciones = ordenados.slice(1).map((t, i) => (t - ordenados[i]) / 3600000);
  const bienSeparadas = separaciones.filter((h) => h >= MIN_SEP_H).length + 1;

  /** El suelo por combinación: el MÁXIMO entre ráfagas, no dentro de una. */
  const suelo = {};
  for (const r of rafagas) {
    for (const [clave, v] of Object.entries(r.resumen)) {
      if (v.error) continue;
      suelo[clave] ||= { h1: 0, pos: 0, rafagas: 0 };
      suelo[clave].h1 = Math.max(suelo[clave].h1, v.posicional.h1 ?? 0);
      suelo[clave].pos = Math.max(suelo[clave].pos, v.posicionalMax ?? 0);
      suelo[clave].rafagas++;
    }
  }

  /**
   * ⚠ **El observable llegó tarde a la campaña, y eso hay que decirlo en la
   * propia campaña.** Las ráfagas anteriores a hoy midieron el `h1` sin nada al
   * lado, así que sus estados no se pueden atribuir a nada: no son ráfagas
   * peores, son ráfagas **ciegas a la pregunta del mecanismo**. Contarlas como
   * si aportaran evidencia de causa sería leer «no hay dato» como «no hay
   * relación» — el mismo fallo que la regla del cero.
   */
  const conObs = rafagas.filter((r) => Object.values(r.resumen).some((v) => v.observable)).length;
  const transiciones = rafagas.flatMap((r) =>
    Object.entries(r.resumen).filter(([, v]) => v.observable?.transicion).map(([k]) => `${r.meta.sello.slice(0, 10)}·${k}`),
  );

  console.log(`\n═══ CAMPAÑA «${CAMPANA}» — ${rafagas.length} ráfaga(s), ${dias.size} día(s)`);
  console.log(`  ${"combinación".padEnd(24)}${"h1 (máx entre ráfagas)".padStart(24)}${"posicional".padStart(13)}`);
  for (const [k, v] of Object.entries(suelo)) {
    console.log(`  ${k.padEnd(24)}${String(v.h1).padStart(24)}${String(v.pos).padStart(13)}`);
  }

  console.log(
    `\n  observable de mecanismo: presente en ${conObs}/${rafagas.length} ráfaga(s)` +
      ` · transiciones registradas CON observable: ${transiciones.length}` +
      (transiciones.length ? `\n     ${transiciones.slice(0, 8).join(" · ")}` : "") +
      (conObs < rafagas.length
        ? `\n     ⚠ las ${rafagas.length - conObs} ráfaga(s) anteriores midieron el \`h1\` SIN observable al lado:\n` +
          `        sus estados están registrados, pero no se pueden atribuir a nada.`
        : ""),
  );

  const completa = rafagas.length >= MIN_RAFAGAS && dias.size >= MIN_DIAS && bienSeparadas >= MIN_RAFAGAS;
  console.log(
    `\n  requisitos: ≥${MIN_RAFAGAS} ráfagas (${rafagas.length}) · ≥${MIN_DIAS} días (${dias.size}) ·` +
      ` separadas ≥${MIN_SEP_H}h (${bienSeparadas})`,
  );
  if (completa) {
    console.log(`  ✅ CAMPAÑA COMPLETA: el suelo de arriba ya se puede citar, con su fecha.`);
  } else {
    console.log(
      `  ⏳ CAMPAÑA ABIERTA — faltan ${Math.max(0, MIN_RAFAGAS - rafagas.length)} ráfaga(s) y` +
        ` ${Math.max(0, MIN_DIAS - dias.size)} día(s).\n` +
        `     Lo de arriba NO es un suelo: es «lo máximo observado hasta ahora».\n` +
        `     Una combinación a 0 significa «no se observó ruido en estos episodios»,\n` +
        `     NO «su suelo es 0». Hasta cerrar, todo residuo pequeño en estas rutas\n` +
        `     queda SIN PROBAR.`,
    );
  }
}

console.log(`\n===== SUELO DE RUIDO DEL ORIGINAL · ${CORRIDAS} corridas =====`);
console.log(
  "página".padEnd(18) +
    "docH".padStart(8) +
    "h1".padStart(8) +
    "pie".padStart(9) +
    "POS max".padStart(10) +
    "DIM max".padStart(10) +
    "carga".padStart(14),
);
for (const [clave, r] of Object.entries(resumen)) {
  if (r.error) {
    console.log(clave.padEnd(18) + "  " + r.error);
    continue;
  }
  console.log(
    clave.padEnd(18) +
      String(r.posicional.docH).padStart(8) +
      String(r.posicional.h1).padStart(8) +
      String(r.posicional.pie).padStart(9) +
      String(r.posicionalMax).padStart(10) +
      String(r.dimensionalMax ?? "—").padStart(10) +
      String(r.cargaMs ? `${(r.cargaMs.min / 1000).toFixed(1)}–${(r.cargaMs.max / 1000).toFixed(1)}s` : "—").padStart(14) +
      (r.mismoNumeroDeFilas ? "" : "   ⚠ nº de filas VARIABLE: dimensional no medible"),
  );
}

const vivos = Object.values(resumen).filter((r) => !r.error);
/**
 * ⚠ **UNA CORRIDA QUE NO MIDIÓ NADA NO PUEDE IMPRIMIR UN SUELO.** Sin esta
 * guarda, `Math.max()` de una lista vacía da `-Infinity` y el informe habría
 * escrito «SUELO POSICIONAL = -Infinity» como si fuera un dato. Es la misma
 * regla que cerró `ancho-cuerpo`: *acotar no puede volverse verde por vaciado*.
 */
const sinNada = vivos.length === 0;
if (sinNada)
  console.error(
    `\n❌ NINGUNA combinación con ≥2 corridas válidas: esta corrida NO midió el suelo.\n` +
      `   Eso no es «el original no se movió», es que no hay con qué comparar.`,
  );
const todosPos = vivos.map((r) => r.posicionalMax);
const todosDim = vivos.map((r) => r.dimensionalMax).filter((n) => n !== null);
const sinDim = vivos.filter((r) => r.dimensionalMax === null).length;
if (!sinNada) console.log(
  `\nSUELO POSICIONAL  = ${Math.max(...todosPos)}   (peor página)` +
    `\nSUELO DIMENSIONAL = ${todosDim.length ? Math.max(...todosDim) : "—"}` +
    (sinDim
      ? `   ⚠ calculado sobre ${todosDim.length} de ${vivos.length}: en ${sinDim} el nº de filas varía\n` +
        `                          entre corridas, y ahí comparar por índice no mide nada.`
      : ""),
);

/**
 * ⚠ **El `h1` aparte, porque es la BASE DE LECTURA del protocolo.** Su
 * dispersión no es «una fila más» del informe: es la que decide si el resto de
 * medidas de esta ruta significan algo. Si no sale 0, la regla fundacional de
 * `CLAUDE.md` no se le aplica a esa ruta.
 */
const h1s = Object.entries(resumen).filter(([, r]) => !r.error);
const sucias = h1s.filter(([, r]) => r.posicional.h1 !== 0);
console.log(`\n═══ LA BASE DE LECTURA (\`h1\`) — ${CORRIDAS} corridas seguidas`);
if (!sucias.length) {
  console.log(`  ✅ dispersión 0 en las ${h1s.length} combinaciones medidas.`);
  console.log(
    `  ⚠ Y eso vale SOLO para estas ${h1s.length}: ${h1s.map(([k]) => k.split("@")[0]).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}.\n` +
      `     «Dispersión 0» no es una propiedad del sitio, es de las rutas medidas.`,
  );
} else {
  console.log(`  ❌ ${sucias.length} combinación(es) con la BASE inestable:`);
  for (const [k, r] of sucias) console.log(`     · ${k.padEnd(22)} h1 ±${r.posicional.h1}`);
  console.log(
    `\n     Sus Δ de cuerpo NO se leen contra un suelo de 0. Hasta fijar el suyo,\n` +
      `     cualquier residuo por debajo de esa cifra queda SIN PROBAR, no limpio.`,
  );
}

/**
 * ⚠ **Y ojo con lo que estas corridas NO pueden ver.** Son N cargas seguidas, en
 * minutos. La deriva que motivó C-QA6 se observó **entre corridas separadas por
 * horas** del mismo día (±32.28 que iba y venía). Un 0 aquí descarta el
 * temblor de ráfaga; **no descarta la deriva lenta**, que es la que se comió
 * dos lecturas de esta semana.
 */
console.log(
  `\n  Alcance temporal: ${CORRIDAS} cargas SEGUIDAS. Esto mide el temblor de ráfaga.\n` +
    `  La deriva de horas —la de C-QA6— es otra magnitud y no se ve aquí.`,
);

/* ══════════════════════════════════════════════════════════════════════════
 * EL OBSERVABLE, LEÍDO — y la única lectura honesta de cada caso
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n═══ EL OBSERVABLE DISCRIMINANTE — ¿acompaña al estado del \`h1\`?`);
let conTransicion = 0;
for (const [clave, r] of Object.entries(resumen)) {
  const o = r.observable;
  if (!o) {
    console.log(`  ${clave.padEnd(22)} — sin cargas válidas`);
    continue;
  }
  if (!o.transicion) {
    console.log(
      `  ${clave.padEnd(22)} ` +
        (o.estadosH1.length
          ? `h1 en UN solo estado (${o.estadosH1[0]}) — el observable NO SE PUEDE EVALUAR aquí`
          : `⚠ SIN \`h1\` en ninguna carga — no hay ancla: esto no es «un solo estado», es que no se midió`),
    );
    continue;
  }
  conTransicion++;
  console.log(`  ${clave.padEnd(22)} ⚡ TRANSICIÓN: h1 ${o.estadosH1.join(" ↔ ")}  (Δ ${(Math.max(...o.estadosH1) - Math.min(...o.estadosH1)).toFixed(2)})`);
  for (const [obs, v] of Object.entries(o.porObservable)) {
    const marca = v.acompana === true ? "✅ ACOMPAÑA" : v.acompana === false ? "·  no" : "?  —";
    console.log(`      ${marca}  ${obs.padEnd(16)} ${v.nValores} valor(es): ${JSON.stringify(v.valores).slice(0, 90)}`);
  }
  if (o.cadena?.niveles.length) {
    console.log(`      NIVEL donde nace la diferencia (cadena h1→raíz):`);
    for (const n of o.cadena.niveles)
      console.log(`         [${n.nivel}] ${(n.tag + " " + n.cls).padEnd(30).slice(0, 30)} dentro ${n.dentroA} → ${n.dentroB}  Δ ${n.dDentro}   (Δalto ${n.dAlto})`);
  } else if (o.cadena) {
    console.log(`      ⚠ la cadena h1→raíz NO cambia en ningún nivel: el desplazamiento entra por ENCIMA de ella.`);
  }
}
if (!conTransicion)
  console.log(
    `\n  Ninguna combinación cambió de estado en esta ráfaga.\n` +
      `  Eso NO dice que el observable no sirva: dice que aquí no hubo episodio y\n` +
      `  no había nada contra lo que correlacionar. Se registra y se espera a una\n` +
      `  ráfaga con transición — que es exactamente lo que la campaña busca.`,
  );

/* ══════════════════════════════════════════════════════════════════════════
 * LOS DETECTORES BINARIOS — un valor constante NO es una respuesta
 *
 * `rocketToken` dio `N` en las 12 cargas de las ráfagas 1 y 2, y eso se estuvo a
 * punto de leer como «el token no interviene». No lo es: es un detector que
 * **nunca ha discriminado**, y por la regla del cero/pleno de `CLAUDE.md`
 * (§sondas, regla 4) eso no es un dato en ninguna de las dos direcciones —
 * ni casar en ninguna, ni casar en todas.
 *
 * Por eso el veredicto se imprime aquí y no lo tiene que recordar nadie:
 *
 *   · **NO VALIDADO** — mismo valor en el 100 % de las cargas. **No se cita como
 *     evidencia.** Si sigue así al cerrar la campaña, se retira del observable:
 *     un detector que no ha discriminado nunca ocupa sitio y sugiere respuesta.
 *   · **VALIDADO** — se le ha visto cambiar, así que su valor significa algo.
 *
 * ⚠ **Y no cierra el código de salida, a propósito.** Un detector sin validar es
 * una observación sobre el ORIGINAL, no un defecto de la sonda: hacerlo fallar
 * convertiría cada ráfaga en roja y la guarda acabaría ignorada. Lo que sí cierra
 * el código es el censo de selectores —eso sí es defecto de la sonda—. Se dice
 * aquí porque *lo que una sonda imprime y lo que cuenta no pueden discrepar sin
 * que se explique por qué*.
 * ═════════════════════════════════════════════════════════════════════════ */
const cargas = Object.values(crudo).flat().filter((c) => !c.error && c.detectores);
const nombresDet = [...new Set(cargas.flatMap((c) => Object.keys(c.detectores)))];
console.log(`\n═══ DETECTORES BINARIOS — ¿han discriminado ALGUNA VEZ? (${cargas.length} cargas)`);
const sinValidar = [];
for (const d of nombresDet) {
  const s = cargas.filter((c) => c.detectores[d] === true).length;
  const n = cargas.length - s;
  const validado = s > 0 && n > 0;
  if (!validado) sinValidar.push(d);
  console.log(
    `  ${d.padEnd(18)} S ${String(s).padStart(3)} / N ${String(n).padStart(3)}   ` +
      (validado
        ? "✅ VALIDADO — se le ha visto cambiar"
        : `❌ NO VALIDADO — ${s === 0 ? "nunca ha dado S" : "da S en el 100 %"}: no se cita como evidencia`),
  );
}
if (sinValidar.length)
  console.log(
    `\n  ${sinValidar.length} detector(es) sin validar: ${sinValidar.join(" · ")}.\n` +
      `  Un valor constante no contesta la pregunta que se le hizo. Hasta que cambie,\n` +
      `  cualquier frase del tipo «X no interviene» carece de respaldo.`,
  );

await browser.close();

/* ── Un canal de verdad: lo que se imprime es lo que cierra el código ────── */
const muertos = censo.informe();
const fallos = muertos + (sinNada ? 1 : 0);
console.log(
  `${fallos === 0 ? "✅" : "❌"} ruido · ${muertos} selector(es) muerto(s) · ${vivos.length} combinación(es) medida(s)` +
    `${sinValidar.length ? ` · ${sinValidar.length} detector(es) NO VALIDADO(S) (no cierran el código: ver arriba)` : ""}`,
);
process.exit(fallos === 0 ? 0 : 2);
