import puppeteer from "puppeteer-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export async function launch() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "kq-"));
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    userDataDir,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--disable-features=IsolateOrigins,site-per-process",
      // Cookiebot fuera: en sesión viva el banner cambia el render
      '--host-resolver-rules=MAP consent.cookiebot.com 127.0.0.1,MAP consentcdn.cookiebot.com 127.0.0.1,MAP *.cookiebot.com 127.0.0.1,MAP consent.cookiebot.eu 127.0.0.1',
    ],
  });
  return { browser, userDataDir };
}

/**
 * Suma una unidad a las evaluaciones que cuentan PÁGINAS. Se define aquí arriba
 * porque `openPage` la llama; el registro vive con `Evaluadas`, más abajo.
 */
let contarPagina = () => {};

/** Abre una página con viewport dado. mobile=true → device metrics 390x844 por CDP. */
export async function openPage(browser, url, { width, height, mobile = false, dsf = 1 } = {}) {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  if (mobile) {
    // `page.setViewport` ES `Emulation.setDeviceMetricsOverride` por dentro,
    // pero además puppeteer lo recuerda al capturar: llamando al CDP a pelo,
    // `page.screenshot()` captura la ventana real (800×600) en vez del
    // viewport emulado. Con setViewport la captura sale a 390 de verdad.
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: dsf,
      isMobile: true,
      hasTouch: true,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
    );
  } else {
    await page.setViewport({ width, height, deviceScaleFactor: dsf });
  }
  const respuesta = await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  const estado = respuesta?.status() ?? 0;
  /* ── Una 404 NO es una unidad evaluada ────────────────────────────────────
   * El estado se devolvía ya, y el comentario de aquí decía por qué: *una 404
   * CARGA BIEN, `goto` no lanza, la página renderiza, y una sonda que no lo
   * mire mide el 404 y publica deltas plausibles*. **Medido el 2026-08-02: de
   * las 31 sondas que usan `openPage`, 22 NO lo miraban** — `clon-base` entre
   * ellas, que es la guarda que más se corre. El dato estaba y la conexión no:
   * *documentado no es conectado* a escala de directorio.
   *
   * Visto en vivo y por accidente: `dos-rutas` con un slug inventado devolvió
   * `docH 6035 → 900` y `null` en todas las anclas, y lo informó como «el
   * cascarón NO es el mismo». Rojo, sí, **pero por el motivo equivocado** — y
   * un motivo equivocado es lo que se cita después.
   *
   * Arreglado donde pasan todas: **una respuesta ≥ 400 no cuenta como página
   * evaluada** y se grita. Como la mayoría declara `porPaginas: true`, el
   * recuento se queda corto y el contrato la pone roja sola.
   *
   * ⚠ Lo que NO cubre: las sondas que cuentan a mano con `ev.ok()` pueden
   * seguir sumando tras una 404. Para ésas el aviso es la línea gritada. */
  if (estado >= 400 || estado === 0) {
    console.error(
      `\n❌ HTTP ${estado} — ${url}\n` +
        `   Una 404 CARGA BIEN y se mide como una página buena: ésta NO se cuenta\n` +
        `   como unidad evaluada. Si la sonda declara su mínimo, saldrá roja sola.`,
    );
  } else {
    /* Una página que carga es una UNIDAD EVALUADA. Se cuenta aquí —el sitio por
     * el que pasan todas— y no en cada sonda, por lo mismo que la guarda de
     * `BUILD_ID` vive en `w()`: lo que hay que acordarse de poner se olvida. La
     * sonda solo declara su MÍNIMO; el recuento no es cosa suya. */
    contarPagina();
  }
  return { page, client, status: estado };
}

/** Divi recalcula alturas por JS tras el load: pase de scroll + settle + lazy→eager. */
export async function settle(page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => {
      i.loading = "eager";
      if (i.dataset.src && !i.src) i.src = i.dataset.src;
    });
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 600));
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 400));
  });
  await new Promise((r) => setTimeout(r, 800));
}

/* ══════════════════════════════════════════════════════════════════════════
 * CENSO DE SELECTORES — la guarda estructural común a TODAS las sondas.
 *
 * ── El fallo que la obliga a existir ──────────────────────────────────────
 * **Un selector que no casa con nada devuelve `null`, y `null` se lee como
 * «esta propiedad no varía».** Una sonda que no encuentra nada y una que no
 * mira nada dan la misma salida — la regla de `CLAUDE.md`, por cuarta vez, y
 * ésta costó **391 px sin dar un solo error**: `c-cascaron` daba
 * `header·ritmo` y `header·ancho` por ejes limpios con `#main-header`, que en
 * el original **no existe**. La cabecera nunca se midió y el informe decía
 * «varianza cero en 131 ejes».
 *
 * ── La regla, y por qué el ámbito es «todas las páginas» ──────────────────
 * Un selector puede casar en unas páginas y no en otras legítimamente: la FAQ
 * no tiene migas y el caso sí. Eso **no** es un defecto. Lo que no puede pasar
 * es que un selector no case **en ninguna** de las páginas medidas: eso ya no
 * es una ausencia, es un selector equivocado.
 *
 * > **Un selector que no casa en NINGUNA página medida es un defecto de la
 * > sonda y sale por error, nunca por cero.**
 *
 * ── Cómo se usa ──────────────────────────────────────────────────────────
 *   const censo = new Censo();
 *   const { datos } = await censo.medir(page, () => ({
 *     alto: __q("header.et-l--header")?.getBoundingClientRect().height ?? null,
 *   }));
 *   ...
 *   if (censo.informe()) process.exit(2);   // ← muertos ⇒ código ≠ 0
 *
 * Dentro del `evaluate` se usan `__q` / `__qa` en vez de `querySelector(All)`.
 * Son los mismos, más el apunte de cuántos nodos casaron.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Se inyecta en la página antes de cada medida. */
const CENSO_JS = `
  window.__censo = window.__censo || {};
  window.__q = function (sel, raiz) {
    const el = (raiz || document).querySelector(sel);
    window.__censo[sel] = (window.__censo[sel] || 0) + (el ? 1 : 0);
    return el;
  };
  window.__qa = function (sel, raiz) {
    const els = [...(raiz || document).querySelectorAll(sel)];
    window.__censo[sel] = (window.__censo[sel] || 0) + els.length;
    return els;
  };
`;

export class Censo {
  constructor() {
    /** selector → nº de nodos casados sumando TODAS las páginas medidas */
    this.total = {};
    this.paginas = 0;
  }

  /** Inyecta `__q`/`__qa`, corre `fn` y acumula el censo de esta página. */
  async medir(page, fn, ...args) {
    await page.evaluate(CENSO_JS);
    const datos = await page.evaluate(fn, ...args);
    const censo = await page.evaluate(() => window.__censo);
    for (const [sel, n] of Object.entries(censo)) this.total[sel] = (this.total[sel] || 0) + n;
    this.paginas++;
    return { datos, censo };
  }

  /** Selectores que no casaron ni una vez en ninguna página. */
  muertos() {
    return Object.entries(this.total).filter(([, n]) => n === 0).map(([s]) => s);
  }

  /**
   * Imprime el veredicto y devuelve el nº de selectores muertos. **Lo que
   * imprime y lo que devuelve es lo mismo**: quien la llama cierra su código de
   * salida con esto, no con «no encontré diferencias».
   */
  informe(etiqueta = "") {
    const m = this.muertos();
    const vivos = Object.keys(this.total).length - m.length;
    if (!m.length) {
      console.log(`  ✓ censo de selectores${etiqueta ? " " + etiqueta : ""}: ${vivos} vivos, 0 muertos (${this.paginas} páginas)`);
      return 0;
    }
    console.error(
      `\n❌ ${m.length} SELECTOR(ES) MUERTO(S) — no casaron en NINGUNA de las ${this.paginas} páginas.\n` +
        `   Eso no es «esta propiedad no varía»: es un selector equivocado, y su\n` +
        `   \`null\` se estaba leyendo como dato. Arréglalo antes de creerte nada:\n` +
        m.map((s) => `     · ${s}`).join("\n") + "\n",
    );
    return m.length;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL MÍNIMO DE UNIDADES EVALUADAS — «0 comparado = verde», cerrado por fin
 * en el sitio común
 *
 * ── Por qué esto no podía seguir arreglándose sonda a sonda ────────────────
 * El mismo fallo ha aparecido **cinco veces**, cada una con su arreglo local, y
 * ninguno impidió el siguiente:
 *
 *   1. `mono-cmp` imprimía «SEC 3 SOBRA en clon» y **no lo contaba** → `✅ 0·0·0`
 *      con código 0. Vivió una tanda entera (E1).
 *   2. `charsCenso()` estaba definida, documentada y **nunca llamada**: 21 de 24
 *      páginas «medidas» sin medir.
 *   3. `ancho-cuerpo`, al nacer, comparó **0 filas de 13** y sacó ✅ con código 0.
 *   4. `ruido` podía quedarse sin ninguna combinación válida e imprimir
 *      `SUELO POSICIONAL = -Infinity` como si fuera un dato.
 *   5. `clon-base` —**la guarda insignia del clon**— con el puerto vacío imprimía
 *      **31 `ERR_CONNECTION_REFUSED`** y salía con **código 0**.
 *
 * Cinco arreglos locales, cinco veces la misma clase. La conclusión es la misma
 * que con *avisar = contar* y con el `Censo`: **mientras la guarda sea algo que
 * cada sonda tiene que acordarse de poner, la sexta instancia está garantizada.**
 *
 * ── El contrato ───────────────────────────────────────────────────────────
 *
 *   > **Toda sonda declara —o deriva del build— su MÍNIMO de unidades
 *   > evaluadas. Por debajo de ese mínimo el resultado no es «sin
 *   > diferencias»: es NO SE PUDO EVALUAR, y sale con código ≠ 0.**
 *
 * Y lo que lo hace **estructural** y no una función más que se puede olvidar:
 *
 *   · el veredicto lo fuerza un gancho de `process.on("exit")`, así que una
 *     sonda que declare su mínimo **no puede salir con 0 por debajo de él
 *     aunque nunca llame a `informe()`** — ni aunque haga `process.exit(0)`
 *     explícito (comprobado: el gancho sobrescribe el código);
 *   · y una sonda que **congela una medida sin haber declarado nada** sale por
 *     error con «SIN CONTRATO». O sea que el olvido tampoco es verde.
 *
 * ── Cómo se usa ───────────────────────────────────────────────────────────
 *
 *     const ev = new Evaluadas({ unidad: "rutas", minimo: RUTAS.length });
 *     for (const r of RUTAS) {
 *       try { ...medir...; ev.ok(); }
 *       catch (e) { ev.fallo(r, e); }
 *     }
 *     const fallos = ev.informe() + otrosFallosDeLaSonda;
 *     process.exit(fallos ? 2 : 0);
 *
 * `minimo` es obligatorio y ≥ 1: **una sonda que no sabe cuántas unidades
 * debería evaluar no puede decir que las evaluó todas.** Derivarlo del build
 * —`RUTAS.length`— es mejor que escribirlo, porque así una ruta nueva sube el
 * listón sola.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Registro de módulo: lo lee el gancho de salida y lo consulta `w()`. */
const _evaluaciones = [];
let _congelo = false;
let _ganchoPuesto = false;
/**
 * ⚠ **SEXTA instancia de la misma clase, y dentro de otra guarda (2026-08-02).**
 * La guarda de `BUILD_ID` renombraba la salida a `-CONTAMINADA` y gritaba… **y
 * no tocaba el código de salida**. El HANDOFF que la estrenó decía «sale por
 * error»: no salía. Es *documentado no es conectado* cometido por segunda vez en
 * `lib.mjs` —la primera fue la bandera `SIN_CLON`, inerte— y lo destapó pedirle
 * a `clon-base` el negativo de «build viejo», que habría dado verde.
 *
 * Ahora la contaminación va por el MISMO gancho que el mínimo de unidades: un
 * solo sitio decide si una corrida puede salir con 0.
 */
let _contaminada = false;

/** Sondas que NO miden nada y solo orquestan (el propio test de `lib`). */
const sinContrato = () => !!process.env.SIN_CONTRATO;

function ponGancho() {
  if (_ganchoPuesto) return;
  _ganchoPuesto = true;
  process.on("exit", () => {
    // Nada que decir si la sonda ya sale mal: no se pisa un código peor.
    const yaMal = process.exitCode !== undefined && process.exitCode !== 0;
    if (_contaminada) {
      console.error(
        `\n❌ CORRIDA CONTAMINADA: el \`.next\` cambió mientras se medía. La salida\n` +
          `   está congelada como …-CONTAMINADA y NO se puede citar. Repite entera.`,
      );
      if (!yaMal) process.exitCode = 2;
      return;
    }
    const cortas = _evaluaciones.filter((e) => !e.suficiente());
    if (cortas.length) {
      for (const e of cortas) e.grito();
      if (!yaMal) process.exitCode = 2;
      return;
    }
    /* ── La OTRA mitad del contrato, y hasta hoy no estaba conectada ──────────
     * El gancho cerraba el código de salida por debajo del mínimo, y con eso
     * «0 comparado = verde» quedaba cerrado **para la máquina**. Para el LECTOR
     * no: un verde sigue siendo un `✅` sin decir sobre cuántas unidades, y el
     * HANDOFF que estrenó el contrato afirmaba «ahora la imprime».
     *
     * **Medido al validarlas en vivo: la imprimía 1 sonda de 48.** Las otras 47
     * declaran, cuentan y cierran bien el código —la guarda funciona— pero
     * salen con un `✅` mudo, que es exactamente el hábito de lectura que el
     * contrato venía a romper. Es *documentado no es conectado* (`CLAUDE.md`
     * §sondas, regla 3) sobre la mitad legible de la propia guarda.
     *
     * Se arregla aquí y no en 47 ficheros por lo de siempre: **lo que hay que
     * acordarse de llamar se olvida.** `informe()` sigue existiendo para dejar
     * la línea en su sitio dentro del informe; si no se llamó, la pone el
     * gancho al final. Un verde sin línea de unidades deja de ser posible. */
    for (const e of _evaluaciones) if (!e._informado) e.linea();
    if (_congelo && _evaluaciones.length === 0 && !sinContrato()) {
      console.error(
        `\n❌ SIN CONTRATO DE EVALUACIÓN — esta sonda ha congelado una medida sin\n` +
          `   declarar cuántas unidades debía evaluar, así que NO SE PUEDE SABER si\n` +
          `   midió algo o nada. Las dos cosas dan la misma salida, y por eso el\n` +
          `   verde no vale. Declara el mínimo:\n\n` +
          `     const ev = new Evaluadas({ unidad: "rutas", minimo: RUTAS.length });\n\n` +
          `   (ver \`Evaluadas\` en lib.mjs). Si de verdad no mide nada: SIN_CONTRATO=1.\n`,
      );
      if (!yaMal) process.exitCode = 2;
    }
  });
}

export class Evaluadas {
  /**
   * @param {object} o
   * @param {string} o.unidad  qué se cuenta: "rutas", "filas", "páginas", "pares"…
   * @param {number} o.minimo  cuántas hay que evaluar para que el veredicto valga
   * @param {string} [o.nombre] etiqueta para el informe
   */
  /**
   * @param {boolean} [o.porPaginas] cuenta sola cada página que carga en
   *   `openPage`. Es el caso normal: la mayoría de las sondas tienen una unidad
   *   = una página abierta, y así **no hay un `ev.ok()` que se pueda olvidar**.
   *   Se pone a `false` cuando la unidad es otra cosa —un PAR de páginas, una
   *   fila, una comparación— y entonces la sonda cuenta a mano.
   */
  constructor({ unidad, minimo, nombre = "", porPaginas = false } = {}) {
    if (typeof minimo !== "number" || !Number.isFinite(minimo) || minimo < 1)
      throw new Error(
        `Evaluadas: 'minimo' es obligatorio y ≥ 1 (llegó ${JSON.stringify(minimo)}).\n` +
          `  Una sonda que no sabe cuántas unidades DEBERÍA evaluar no puede afirmar\n` +
          `  que las evaluó. Derívalo del build (RUTAS.length) en vez de escribirlo.`,
      );
    if (!unidad) throw new Error("Evaluadas: falta 'unidad' (qué se está contando).");
    this.unidad = unidad;
    this.minimo = minimo;
    this.nombre = nombre;
    this.porPaginas = porPaginas;
    this.n = 0;
    this.fallos = [];
    _evaluaciones.push(this);
    contarPagina = () => {
      for (const e of _evaluaciones) if (e.porPaginas) e.n++;
    };
    ponGancho();
  }

  /**
   * Una unidad evaluada DE VERDAD.
   *
   * ⚠ **`ok()` y `ok(undefined)` NO significan lo mismo, y por eso no puede
   * haber parámetro por defecto** (`CLAUDE.md` §Reglas sobre las sondas, 6).
   * El primero es «una unidad»; el segundo es «te paso el resultado de un
   * cálculo que falló». Un `n = 1` los confunde, y eso **fabrica un verde**.
   *
   * Medido: `cmp-sector` hacía `ev.ok(filas.length)` sobre un **objeto**, o sea
   * `ok(undefined)`; el defecto lo volvía **1**; y con `minimo: 1` la sonda
   * salía verde habiendo contado **1 de 13** filas que tenía impresas en
   * pantalla. Tres capas tapándose, y ésta es la del medio.
   */
  ok(...args) {
    const n = args.length === 0 ? 1 : args[0];
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0)
      throw new Error(
        `Evaluadas.ok(): recibió ${JSON.stringify(args[0])}, que no es un número de unidades.\n` +
          `  Casi siempre es un cálculo que falló —\`.length\` sobre un objeto, un índice\n` +
          `  fuera de rango— y aceptarlo como 1 convierte «no lo sé» en «está bien».\n` +
          `  Si querías sumar UNA unidad, llama a ok() sin argumento.`,
      );
    this.n += n;
    return this;
  }

  /** Una unidad que no se pudo evaluar. Se cuenta y se nombra: no desaparece. */
  fallo(que, motivo) {
    this.fallos.push(`${que}${motivo ? ` — ${String(motivo).slice(0, 120)}` : ""}`);
    return this;
  }

  suficiente() {
    return this.n >= this.minimo;
  }

  /** El grito del gancho de salida. Idempotente: solo la primera vez. */
  grito() {
    if (this._gritado) return;
    this._gritado = true;
    console.error(
      `\n❌ NO SE PUDO EVALUAR${this.nombre ? ` · ${this.nombre}` : ""} — ` +
        `${this.n} de ${this.minimo} ${this.unidad}.\n` +
        `   Esto NO es «no hay diferencias»: es que no hubo medida en ` +
        `${this.minimo - this.n} ${this.unidad}.\n` +
        (this.fallos.length
          ? `   Las que fallaron:\n` +
            this.fallos.slice(0, 8).map((f) => `     · ${f}`).join("\n") +
            (this.fallos.length > 8 ? `\n     … y ${this.fallos.length - 8} más` : "") + "\n"
          : `   Y ni siquiera se registró el motivo: mira si el bucle llegó a correr.\n`),
    );
  }

  /**
   * La línea de unidades. Idempotente: la escribe quien llegue primero
   * —`informe()` si la sonda la llama, el gancho de salida si no—, y nunca dos
   * veces. **Es la mitad legible del contrato**: sin ella, un `✅` no distingue
   * «no hay diferencias» de «no se midió», que es la pregunta entera.
   */
  linea() {
    if (this._informado) return;
    this._informado = true;
    console.log(
      `  ✓ evaluadas ${this.n}/${this.minimo} ${this.unidad}` +
        (this.nombre ? ` · ${this.nombre}` : "") +
        (this.fallos.length ? `  ⚠ ${this.fallos.length} con error, contadas aparte` : ""),
    );
  }

  /**
   * Imprime el veredicto y devuelve el nº de fallos (0 = se puede dar verde).
   * Llamarla es lo recomendable —deja la línea DENTRO del informe, en su
   * sitio— pero **no es necesario**: ni para la guarda (el gancho cierra el
   * código igual) ni para la línea (el gancho la pone al final si falta).
   */
  informe() {
    if (this.suficiente()) {
      this.linea();
      return this.fallos.length ? 1 : 0;
    }
    this.grito();
    return 1;
  }
}

/** Directorio de las sondas. Todo lo relativo se resuelve contra AQUÍ. */
export const QA = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

/* ══════════════════════════════════════════════════════════════════════════
 * DÓNDE VIVE LA APP DE RENDER — un solo sitio, desde la conversión a monorepo
 *
 * ── El fallo del que protege, y es de los que salen VERDES ────────────────
 * Hasta la conversión (F2-1, 2026-08-03) `scripts/qa/../..` era **a la vez** la
 * raíz del repo y la raíz de la app: ahí estaban `.next`, `src/` y el
 * `package.json` con `start`. **12 sitios lo daban por hecho** —el manifiesto de
 * rutas en 4 sondas, el `BUILD_ID`, el `cwd` de `iniciarClon`, y 5 `RAIZ`
 * sueltas—.
 *
 * Con la app en `apps/web/` y las sondas en la raíz, esa igualdad se rompe. Y lo
 * grave es **cómo** se rompe:
 *
 *   > un `prerender-manifest.json` que no existe hace que `RUTAS` sea **vacío**,
 *   > y una sonda que no mide ninguna ruta **no da error: da verde**. Sería
 *   > verde justo sobre la corrida que autoriza la conversión.
 *
 * Es la regla del cero de `CLAUDE.md` §sondas —*no encontrar nada y no mirar
 * nada dan la misma salida*— aplicada a la raíz en vez de a un selector. Por eso
 * **`APP` no devuelve una ruta a la buena de Dios: la VERIFICA** y muere en voz
 * alta si no encuentra la app. Un `join()` silencioso es exactamente lo que
 * fabrica el verde vacío.
 *
 * Se resuelve **buscando hacia arriba** el `package.json` que declara `next`,
 * así que un cambio de layout futuro no vuelve a tocar 12 ficheros.
 * ═════════════════════════════════════════════════════════════════════════ */
function buscaApp() {
  // Candidatas, de la más específica a la más general.
  const cands = [
    path.join(QA, "../../apps/web"), // monorepo: sondas en la raíz
    path.join(QA, "../.."), // layout anterior: la app ES la raíz
    path.join(QA, "../../.."), // sondas dentro de la app
  ];
  for (const c of cands) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(c, "package.json"), "utf8"));
      if (p.dependencies?.next || p.devDependencies?.next) return path.resolve(c);
    } catch { /* siguiente */ }
  }
  throw new Error(
    "no se encuentra la app de render (ningún package.json con `next` en " +
      cands.map((c) => path.resolve(c)).join(", ") +
      ").\n  Una sonda que no la encuentra mediría CERO rutas y saldría VERDE: por eso esto tira.",
  );
}

/**
 * Raíz de la app de render — donde viven `.next`, `src/` y el `package.json`
 * con `start`. **No es la raíz del repo** desde la conversión a monorepo.
 */
export const APP = buscaApp();
/** Fichero dentro de la app de render. Sustituye a los `join(QA, "../../…")`. */
export const enApp = (...partes) => path.join(APP, ...partes);

/**
 * Normaliza una ruta de página recibida por `argv` o por variable de entorno.
 *
 * ── El problema, que ya costó dos sesiones ─────────────────────────────────
 * **Git Bash (MSYS) traduce cualquier argumento que empiece por `/` a una ruta
 * de Windows.** `/sectores/x` llega al script como
 * `C:/Program Files/Git/sectores/x`, y la sonda muere con `Invalid URL` o
 * —peor— navega a algo que no es lo que pediste. El apaño documentado era
 * "lánzalo desde PowerShell", que es una regla que hay que recordar: la clase de
 * fallo seguía viva.
 *
 * Aquí se corta en el origen. Acepta las tres formas y devuelve siempre
 * `/sectores/x`:
 *
 *   /sectores/x                              (PowerShell, o Bash con MSYS2_ARG_CONV_EXCL)
 *   sectores/x                               (sin barra, inmune a MSYS)
 *   C:/Program Files/Git/sectores/x          (lo que MSYS hace con la primera)
 *
 * El prefijo de MSYS se detecta por el directorio de instalación de Git, no por
 * una lista de rutas del sitio: así no hay que mantenerla.
 */
export function ruta(arg) {
  if (!arg) return arg;
  let r = desMsys(arg);
  if (!r.startsWith("/")) r = "/" + r;
  return r.replace(/\/+$/, "") || "/";
}

/**
 * Deshace la traducción de MSYS sobre **un valor cualquiera**, sin forzar barra
 * inicial. Es la mitad reutilizable de `ruta()`: vale para rutas de página
 * (`/kunak-api`) y para rutas de fichero (`SALIDA=/tmp/x.json`), que `ruta()`
 * estropearía al normalizarlas como rutas de página.
 *
 * El prefijo se detecta por el directorio de instalación de Git, no por una
 * lista de rutas del sitio: así no hay que mantenerla.
 */
export function desMsys(v) {
  if (!v) return v;
  const s = String(v).replace(/\\/g, "/");
  const msys = s.match(/^[A-Za-z]:\/.*?\/Git(\/.*)$/);
  return msys ? msys[1] : s;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LECTURA DE VARIABLES DE ENTORNO — la segunda puerta de la misma mordedura.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * MSYS no traduce solo los **argumentos**: traduce igual el valor de una
 * variable de entorno que empiece por `/`. `SOLO=/` llega como
 * `C:/Program Files/Git/`, y `MARCADOR_RUTA=/x` como
 * `C:/Program Files/Git/x`.
 *
 * `ruta()` ya sabía deshacerlo, pero **había que acordarse de llamarla en cada
 * puerta**, y eso es exactamente el corolario *DOCUMENTADO NO ES CONECTADO* de
 * `CLAUDE.md`: en `clon-base.mjs` el README afirmaba que `MARCADOR_RUTA` pasaba
 * por `ruta()` y la llamada **no estaba**. Se arregló allí, y la misma clase
 * volvió a morder en `SOLO` de `c-cabecera.mjs` — dos veces por la misma puerta.
 *
 * ── La corrección, que es de sitio y no de texto ──────────────────────────
 * La normalización deja de vivir en el punto de uso y pasa a vivir en **la
 * lectura**. Una sonda nueva que haga `envRuta("SOLO")` la hereda; una que haga
 * `process.env.SOLO` se ve a simple vista que no.
 *
 * Y el fallo que esto evita **no da error**: una ruta mal traducida no casa con
 * ninguna página, la sonda mide cero y —si nadie la ha instrumentado— imprime
 * un veredicto verde. Es la regla del selector muerto (`Censo`, arriba) con
 * otra forma: *no encontrar nada y no mirar nada dan la misma salida.*
 * ═════════════════════════════════════════════════════════════════════════ */

/** Variable de entorno cualquiera, con la traducción de MSYS deshecha. */
export function env(nombre, porDefecto = undefined) {
  const v = process.env[nombre];
  return v === undefined || v === "" ? porDefecto : desMsys(v);
}

/** Variable de entorno que contiene una RUTA DE PÁGINA (`/kunak-api`). */
export function envRuta(nombre, porDefecto = undefined) {
  const v = process.env[nombre];
  return v === undefined || v === "" ? porDefecto : ruta(v);
}

/**
 * Variable de entorno con una LISTA de rutas de página separadas por coma.
 * Devuelve `null` si no está puesta — que es «todas», no «ninguna».
 *
 * ⚠ La distinción importa: `null` (no acotar) y `[]` (acotar a nada) llevan a
 * sitios opuestos, y es `[]` el que produce la corrida vacía con veredicto
 * verde. Quien la use tiene que tratar la lista vacía como defecto, no como
 * limpio — ver la guarda de `RUTAS.length === 0` en `c-cabecera.mjs`.
 */
export function envRutas(nombre) {
  const v = process.env[nombre];
  if (v === undefined || v === "") return null;
  return v.split(",").map((s) => s.trim()).filter(Boolean).map(ruta);
}

/* ══════════════════════════════════════════════════════════════════════════
 * CONGELAR UNA SALIDA — y la guarda de que no se descongele sola.
 *
 * ── Dos fallos, y el segundo es el que obliga a la guarda ─────────────────
 *
 * **(1) La ruta se resuelve contra `scripts/qa/`, no contra el `cwd`.** Antes
 * iba contra el `cwd`, así que la sonda solo escribía en el sitio correcto si la
 * lanzabas desde `scripts/qa/`. Desde la raíz —que es como las invocan los
 * `npm run qa:*`— habría creado un `medidas/` paralelo y las salidas congeladas
 * se habrían partido en dos árboles sin dar ningún error: dos verdades.
 *
 * **(2) Congelar no sirve de nada si la siguiente corrida descongela sin
 * avisar.** La regla 2 de `CLAUDE.md` §sondas dice que toda sonda congela su
 * salida *para que una conclusión citada en un doc tenga su fichero*. Pero el
 * fichero se llama igual corrida tras corrida, así que **la corrida de
 * verificación machaca el diagnóstico** — que es justo la foto del defecto y la
 * única prueba de que existía.
 *
 * Pasó esta semana, y en la sonda escrita para diagnosticar: al comprobar que
 * C-QA1 estaba arreglada, `c-cabecera` reescribió
 * `medidas/c-cabecera-{1440,390}.json` con el clon **ya corregido**. Hubo que
 * recuperarlos de git. Si no hubieran estado commiteados, la evidencia del
 * defecto habría desaparecido en el acto de arreglarlo.
 *
 * `c-cabecera` se parcheó a mano, y eso es media corrección de las de
 * `CLAUDE.md`: la instancia y no la CLASE. **La guarda vive aquí**, en el único
 * sitio por el que escriben todas.
 *
 * ── La regla ──────────────────────────────────────────────────────────────
 *
 *   · el fichero no existe            → se escribe;
 *   · existe con contenido IDÉNTICO   → se reescribe, no se pierde nada;
 *   · existe con contenido DISTINTO   → **no se pisa**: se escribe al lado con
 *                                       la fecha, y se dice en voz alta;
 *   · `PISAR=1` (o `{pisar:true}`)    → se pisa a propósito, y se dice.
 *
 * Es hermana de la guarda de selectores (`Censo`): las dos convierten en ruido
 * visible algo que por defecto pasaba en silencio. La diferencia es que aquélla
 * protege la MEDIDA y ésta protege la EVIDENCIA.
 * ═════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
 * LA FECHA DE UNA MEDIDA — local, y en UN SOLO SITIO
 *
 * ── El defecto, medido en disco (2026-08-02) ──────────────────────────────
 * `new Date().toISOString().slice(0, 10)` es **UTC**. Con la máquina en −05:00,
 * toda corrida entre las 19:00 y medianoche se sella **con el día siguiente**:
 * cuatro medidas escritas a las 19:03 del **02** se llaman `-2026-08-03`.
 *
 * ── Por qué no es cosmético, y va en los DOS sentidos ─────────────────────
 * En este proyecto el día es un operador: *«los deltas solo se comparan entre
 * medidas del mismo día»*, y el día se lee del nombre del fichero.
 *
 *   · **dos ráfagas del MISMO día pueden salir con fechas distintas** — una a
 *     las 18:00 y otra a las 20:00 quedan como 02 y 03. La campaña C-QA6 exige
 *     ráfagas «en al menos 2 días distintos»: eso es un **verde falso** del
 *     criterio, comprado con dos horas en vez de con un día;
 *   · **y dos de días distintos pueden colapsar en la misma** — la del 02 a las
 *     20:00 y la del 03 a las 10:00 son ambas `-08-03`, y la segunda va a
 *     `…-2`, como si fueran dos corridas de una jornada.
 *
 * Estaba escrito a pelo en `lib.mjs` **y en 22 sondas más**. Vive aquí y se
 * importa: es la misma decisión que `w()`, `Censo` y `Evaluadas` — *lo que hay
 * que acordarse de escribir bien en 23 sitios se escribe mal en alguno*.
 * ═════════════════════════════════════════════════════════════════════════ */

/** El día de HOY en hora local, `YYYY-MM-DD`. Nunca `toISOString()`. */
export function hoy(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Sello local con hora, `YYYY-MM-DDTHH-MM-SS`. Misma FORMA que el
 * `toISOString().replace(/[:.]/g,"-").slice(0,19)` que sustituye —los ficheros
 * de campaña ya escritos siguen ordenando igual— y hora **local**.
 *
 * Es el caso que más duele del sello en UTC: las ráfagas de la campaña C-QA6 se
 * nombran con él, y una corrida de las 19:03 del día 2 se archivaba como
 * `…2026-08-03T00-03-…`. El criterio de la campaña es «≥2 h de separación y al
 * menos 2 días distintos», y se comprueba **leyendo esos nombres**.
 */
export function sello(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${hoy(d)}T${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

/**
 * Sufijo con fecha, evitando colisión si ya hay una corrida de hoy.
 *
 * ⚠ **Y el segundo defecto de esta función, que la hacía fabricar basura:** la
 * comprobación de *«idéntico ⇒ no dupliques»* de `w()` mira **solo el destino
 * canónico**, no los ficheros fechados que ESTA función crea. Así que dos
 * corridas cuya salida difiere del congelado producían `-fecha.json` y
 * `-fecha-2.json` **byte a byte iguales** — comprobado en `slugs`, `cobertura`,
 * `enlaces` y `c-bases`, los cuatro diffs vacíos.
 *
 * Es la misma idempotencia que `w()` ya tenía, sin aplicar al camino
 * alternativo: se guarda evidencia nueva, no copias de la de hace un minuto.
 */
function alLado(destino, cuerpo) {
  const dir = path.dirname(destino);
  const ext = path.extname(destino);
  const base = path.basename(destino, ext);
  const dia = hoy();
  let cand = path.join(dir, `${base}-${dia}${ext}`);
  for (let n = 2; fs.existsSync(cand); n++) {
    // idéntico a una corrida ya fechada ⇒ ése es el fichero, no uno nuevo
    if (cuerpo !== undefined && fs.readFileSync(cand, "utf8") === cuerpo) return cand;
    cand = path.join(dir, `${base}-${dia}-${n}${ext}`);
  }
  return cand;
}

/* ═════════════════════════════════════════════════════════════════════════
 * GUARDA DE INTEGRIDAD DE BUILD — que un `build` concurrente no pueda
 * invalidar una corrida EN SILENCIO
 *
 * Se pagó dos veces, la segunda el 2026-08-02: `npm run check` construye, y
 * lanzarlo con una sonda en vuelo le cambia el `.next` al servidor vivo. Salieron
 * **404 en 4 rutas que existen**, y lo grave no fue el 404:
 *
 *   > **no se sabía dónde había caído el corte.** Las rutas medidas antes del
 *   > cambiazo eran buenas y las de después no, y el fichero no las distingue.
 *
 * Next escribe un identificador por build en `.next/BUILD_ID`. Se lee al cargar
 * `lib.mjs` —o sea al arrancar la sonda— y se vuelve a leer al congelar. Si
 * cambió, **la corrida entera está contaminada** y no puede pasar por buena.
 *
 * Vive en `w()` y no en cada sonda **a propósito**: es el sitio por el que
 * escriben las 19, así que la guarda las cubre todas sin tocar ninguna. Es la
 * misma decisión que la guarda de sobrescritura y que `Censo` — *arreglar la
 * CLASE y no la instancia* (`CLAUDE.md` §sondas, regla 5).
 * ═════════════════════════════════════════════════════════════════════════ */
const RUTA_BUILD_ID = enApp(".next/BUILD_ID");
const leeBuildId = () => {
  try {
    return fs.readFileSync(RUTA_BUILD_ID, "utf8").trim();
  } catch {
    return null; // sin `.next`: la sonda puede estar midiendo solo el original
  }
};
/** El build con el que arrancó esta sonda. `null` si no había `.next`. */
export const BUILD_ID_INICIAL = leeBuildId();

/**
 * ¿Se reconstruyó el clon mientras esta sonda medía? Devuelve `null` si no se
 * puede saber (no había `.next` al arrancar), que **no es lo mismo que «no»**.
 */
export function buildCambiado() {
  if (BUILD_ID_INICIAL === null) return null;
  const ahora = leeBuildId();
  return ahora !== null && ahora !== BUILD_ID_INICIAL;
}

/**
 * ⚠ La guarda es CONSERVADORA, y eso tiene un falso positivo propio: hay sondas
 * que **solo abren el original** —`ruido`, `mono-cabecera`, los censos— y a las
 * que un `build` del clon no les afecta en nada. Marcarlas `-CONTAMINADA` sería
 * una alarma falsa, y una guarda que grita sin motivo se acaba ignorando, que es
 * exactamente lo que no puede pasarle a ésta.
 *
 * `SIN_CLON=1` la desactiva, y **es la sonda quien lo declara**, no quien la
 * lanza a mano: si una sonda mide el clon, no debe llevarlo nunca.
 *
 * ⚠ Se lee EN CADA LLAMADA, no al cargar el módulo. La primera versión era
 * `const SIN_CLON = !!process.env.SIN_CLON` a nivel de módulo, y la sonda lo
 * pone **después** del `import` — o sea que la constante ya estaba evaluada a
 * `false` y **la bandera no hacía nada**. Es *documentado no es conectado*
 * (`CLAUDE.md` §sondas, regla 3) cometido dentro de la propia guarda: el flag
 * existía, estaba documentado, y era inerte.
 */
const sinClon = () => !!process.env.SIN_CLON;

export function w(file, data, { pisar = false } = {}) {
  /* Congelar una medida es la señal de que esta sonda MIDE, y por tanto de que
   * le toca el contrato de `Evaluadas`. Se apunta aquí —el sitio por el que
   * pasan todas— y el gancho de salida lo cobra. */
  _congelo = true;
  ponGancho();
  /* La corrida se contaminó a mitad: se congela igual —tirar la medida sería
   * peor— pero **con nombre de contaminada y gritando**, para que nadie la cite
   * como buena. Un fichero que no se distingue de uno limpio es exactamente el
   * agujero que esta guarda viene a tapar. */
  if (!sinClon() && buildCambiado() === true) {
    const ext = path.extname(file);
    file = `${file.slice(0, file.length - ext.length)}-CONTAMINADA${ext}`;
    _contaminada = true; // y ahora sí cierra el código, desde el gancho
    console.error(
      `\n❌❌ EL CLON SE RECONSTRUYÓ DURANTE ESTA CORRIDA (BUILD_ID cambió).\n` +
        `   Las rutas medidas antes del cambio y las de después NO son comparables,\n` +
        `   y no se sabe dónde cayó el corte: LA CORRIDA ENTERA SE DESCARTA.\n` +
        `   Se congela como …-CONTAMINADA para que no se confunda con una buena.\n` +
        `   Relanza el servidor y repite. Y no construyas con una sonda en vuelo.\n`,
    );
  }
  const destino = path.isAbsolute(file) ? file : path.join(QA, file);
  const cuerpo = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const rel = (p) => path.relative(QA, p).replace(/\\/g, "/");
  fs.mkdirSync(path.dirname(destino), { recursive: true });

  const forzar = pisar || !!process.env.PISAR;
  if (fs.existsSync(destino) && !forzar) {
    // Idéntico ⇒ reescribir no destruye ninguna evidencia, y no ensucia con
    // duplicados fechados cada vez que una corrida reproduce su resultado.
    if (fs.readFileSync(destino, "utf8") === cuerpo) {
      fs.writeFileSync(destino, cuerpo);
      console.log("→", rel(destino), "(idéntica a la congelada)");
      return destino;
    }
    const alt = alLado(destino, cuerpo);
    const yaEstaba = fs.existsSync(alt) && fs.readFileSync(alt, "utf8") === cuerpo;
    console.log(
      `\n⚠ ${rel(destino)} ya existe y NO coincide: es una salida CONGELADA y no se pisa.\n` +
        (yaEstaba
          ? `   Esta corrida es IDÉNTICA a ${rel(alt)}, que ya está: no se duplica.\n`
          : `   Esta corrida va a ${rel(alt)}.\n`) +
        `   Si de verdad quieres re-congelar: PISAR=1 npm run <la sonda>\n`,
    );
    fs.writeFileSync(alt, cuerpo);
    console.log("→", rel(alt));
    return alt;
  }

  if (fs.existsSync(destino) && forzar) console.log(`⚠ PISAR: se re-congela ${rel(destino)}`);
  fs.writeFileSync(destino, cuerpo);
  console.log("→", rel(destino));
  return destino;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA AUDITORÍA DEL CONTRATO — «¿lo declaran las N?», contestada EJECUTANDO
 *
 * ── La SÉPTIMA instancia de la misma clase, y en el test del contrato ──────
 * El barrido que comprobaba que las sondas declaran su mínimo era **una
 * expresión regular sobre el texto del fichero**, y dio verde sobre
 * `c-censo.mjs` **con dos `const ev` y sin compilar**. O sea que la
 * comprobación de que la guarda está puesta miraba **el texto y no el
 * programa** — *mirar una cosa y creer que has mirado otra*, cometido dentro de
 * la comprobación que cierra esa misma clase.
 *
 * El primer parche añadió un `node --check` **al lado**, como segunda
 * aserción. No basta, y la razón es exactamente la regla 1 de `CLAUDE.md`
 * §sondas —*un canal de verdad*—: con dos aserciones independientes, un fichero
 * roto dejaba la primera **en verde**. El informe seguía pudiendo decir
 * «las 48 declaran su mínimo» de un directorio que no arranca.
 *
 * ── La regla ──────────────────────────────────────────────────────────────
 *
 *   > **Una sonda solo cuenta como conforme si COMPILA y declara. Lo que no
 *   > compila no es «sin veredicto»: es NO CONFORME.** Un solo veredicto por
 *   > sonda, y un fichero roto lo tumba.
 *
 * Y la detección de la declaración deja de ser un `grep`: se busca sobre el
 * fuente **sin comentarios y sin literales**, porque `new Evaluadas(` dentro de
 * un comentario o de una cadena es exactamente lo que un `grep` no distingue de
 * una declaración de verdad. Los dos casos tienen fixture en `qa:lib`.
 *
 * ── Lo que esta auditoría NO discrimina, dicho aquí y no en un acta ────────
 * Que la `ev` esté **en el ámbito correcto**. `c-muestra.mjs` estuvo a punto de
 * quedar con la declaración dentro de un `for` anidado: **compila, declara, y
 * no cuenta nada.** Eso no lo ve ni el texto ni el parser — lo ve **correr la
 * sonda**, que es el paso 1 de la validación en vivo. Esta función cubre el
 * fichero; el contrato lo cobra la corrida.
 * ═════════════════════════════════════════════════════════════════════════ */

/** ¿Puede un `/` en esta posición abrir un literal de expresión regular? */
function abreRegex(previo) {
  const t = previo.trimEnd();
  if (!t) return true;
  if (/(?:^|[^\w$.])(return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await)$/.test(t)) return true;
  return !/[\w$)\]]$/.test(t);
}

/**
 * El fuente **sin comentarios, sin cadenas y sin expresiones regulares**: lo
 * que queda es código, y solo ahí cuenta encontrar una declaración.
 *
 * Es un escáner y no un regex a propósito. Un `grep` no distingue
 * `new Evaluadas(` de `// new Evaluadas(`, y esa diferencia es justo la que
 * separa una guarda puesta de una guarda contada dos veces en la documentación.
 */
export function sinLiterales(src) {
  let out = "";
  for (let i = 0; i < src.length; ) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      i++;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === c) { i++; break; }
        i++;
      }
      out += '""';
      continue;
    }
    if (c === "/" && abreRegex(out)) {
      i++;
      let clase = false;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "\n") break; // no era un literal: se corta y punto
        if (src[i] === "[") clase = true;
        else if (src[i] === "]") clase = false;
        else if (src[i] === "/" && !clase) { i++; break; }
        i++;
      }
      while (i < src.length && /[dgimsuvy]/.test(src[i])) i++;
      out += "/RE/";
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Audita un directorio de sondas contra el contrato de `Evaluadas`.
 *
 * Devuelve UN veredicto por sonda —`ok` · `rota` · `sinDeclarar`— porque un
 * fichero que no compila tiene que tumbar la afirmación «declaran», no
 * convivir con ella en verde.
 *
 * @param {string} dir  directorio con las sondas (por defecto, `scripts/qa`)
 * @param {string[]} [excluir]  ficheros que no son sondas
 */
export async function auditarSondas(dir = QA, excluir = ["lib.mjs", "lib.test.mjs"]) {
  const { spawnSync } = await import("node:child_process");
  const ficheros = fs.readdirSync(dir).filter((f) => f.endsWith(".mjs") && !excluir.includes(f)).sort();
  const rotas = [];
  const sinDeclarar = [];
  const conformes = [];

  for (const f of ficheros) {
    const ruta = path.join(dir, f);
    // 1 · COMPILAR. Es el paso que ejecuta un parser de verdad, y es el que
    //     manda: si no compila, no hay nada más que preguntarle al fichero.
    const chk = spawnSync(process.execPath, ["--check", ruta], { encoding: "utf8" });
    if (chk.status !== 0) {
      rotas.push({ fichero: f, error: (chk.stderr || "").split("\n").find((l) => /Error|error/.test(l))?.trim() || "no compila" });
      continue;
    }
    // 2 · DECLARAR, sobre el código y no sobre el texto.
    const codigo = sinLiterales(fs.readFileSync(ruta, "utf8"));
    const declara = /new\s+Evaluadas\s*\(/.test(codigo) || /SIN_CONTRATO\s*\]?\s*=\s*""/.test(codigo);
    if (declara) conformes.push(f);
    else sinDeclarar.push(f);
  }

  return { total: ficheros.length, conformes, rotas, sinDeclarar };
}

/* ═════════════════════════════════════════════════════════════════════════
 * LA SONDA, DUEÑA DE SU CICLO DE SERVIDOR
 *
 * Deuda mecánica anotada en el HANDOFF desde hace semanas y cobrada dos veces.
 * Hasta ahora toda sonda daba por hecho un `next start` ajeno en el 3000: si no
 * estaba, medía contra un puerto vacío; si alguien lo reiniciaba o reconstruía,
 * medía dos builds distintos en la misma corrida.
 *
 * `iniciarClon()` arranca **su propio** servidor en un puerto libre, espera a que
 * responda, y lo mata al terminar el proceso —pase lo que pase, incluidas
 * excepciones y Ctrl-C—. Dos sondas pueden correr a la vez sin pisarse, y nadie
 * puede pararle el servidor a una corrida en vuelo.
 *
 * ⚠ **LO QUE ESTA FUNCIÓN NO PROTEGE, y hay que decirlo:** el servidor propio
 * sigue leyendo el MISMO `.next` del proyecto, así que un `next build`
 * concurrente le cambia el contenido igual. De eso protege la otra mitad —la
 * guarda de `BUILD_ID` en `w()`—, que no lo impide pero lo **detecta** y marca la
 * salida como contaminada. Aislamiento donde se puede, detección donde no.
 *
 * `CLON=<url>` sigue mandando: si está puesta, la sonda mide contra esa URL y no
 * gestiona nada. Es lo que permite apuntar a un despliegue.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Un puerto libre de verdad, pedido al sistema. */
async function puertoLibre() {
  const net = await import("node:net");
  return new Promise((res, rej) => {
    const s = net.createServer();
    s.once("error", rej);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });
}

/**
 * Arranca el clon y devuelve `{ base, propio, parar }`.
 *   · `base`   — la URL contra la que medir
 *   · `propio` — si lo arrancó esta sonda (false si vino por `CLON`)
 *   · `parar()` — idempotente; también se llama sola al salir el proceso
 */
export async function iniciarClon({ timeoutMs = 90_000 } = {}) {
  if (process.env.CLON) {
    console.log(`· clon EXTERNO por CLON=${process.env.CLON} — esta sonda no gestiona el servidor`);
    return { base: process.env.CLON, propio: false, parar: async () => {} };
  }

  const { spawn } = await import("node:child_process");
  const puerto = await puertoLibre();
  const base = `http://127.0.0.1:${puerto}`;
  const raiz = APP;

  // Con `shell` no se pasan argumentos sueltos —Node avisa de que no los escapa—:
  // se arma la orden entera. `puerto` es un entero que hemos generado nosotros.
  const hijo = spawn(`npm run start -- -p ${puerto}`, {
    cwd: raiz,
    stdio: "ignore",
    shell: true,
    // En POSIX hace falta el grupo propio para poder matar el ÁRBOL: `npm`
    // lanza `next`, y matar solo al padre deja el puerto ocupado.
    detached: process.platform !== "win32",
  });

  let parado = false;
  const parar = async () => {
    if (parado) return;
    parado = true;
    try {
      if (process.platform === "win32") {
        const { spawnSync } = await import("node:child_process");
        // El árbol entero: `npm` lanza `next`, y matar solo al padre deja el puerto ocupado.
        spawnSync("taskkill", ["/PID", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        process.kill(-hijo.pid, "SIGKILL");
      }
    } catch { /* ya estaba muerto */ }
  };
  // Que no sobreviva a la sonda por ninguna vía: salida normal, Ctrl-C o
  // excepción sin capturar. Sin esto, una sonda que revienta deja el puerto y el
  // proceso vivos, que es la mitad del problema que esto viene a resolver.
  for (const ev of ["exit", "SIGINT", "SIGTERM", "uncaughtException"]) {
    process.on(ev, () => { void parar(); });
  }

  const t0 = Date.now();
  for (;;) {
    if (Date.now() - t0 > timeoutMs) {
      await parar();
      throw new Error(`el clon no respondió en ${timeoutMs / 1000}s (puerto ${puerto}). ¿Falta 'npm run build'?`);
    }
    try {
      const r = await fetch(base + "/", { redirect: "manual" });
      if (r.status > 0) break;
    } catch { /* aún no escucha */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`· clon PROPIO en ${base} (listo en ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  return { base, propio: true, parar };
}
