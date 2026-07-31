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
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  return { page, client };
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

/** Directorio de las sondas. Todo lo relativo se resuelve contra AQUÍ. */
export const QA = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

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

/** Sufijo con fecha, evitando colisión si ya hay una corrida de hoy. */
function alLado(destino) {
  const dir = path.dirname(destino);
  const ext = path.extname(destino);
  const base = path.basename(destino, ext);
  const hoy = new Date().toISOString().slice(0, 10);
  let cand = path.join(dir, `${base}-${hoy}${ext}`);
  for (let n = 2; fs.existsSync(cand); n++) cand = path.join(dir, `${base}-${hoy}-${n}${ext}`);
  return cand;
}

export function w(file, data, { pisar = false } = {}) {
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
    const alt = alLado(destino);
    console.log(
      `\n⚠ ${rel(destino)} ya existe y NO coincide: es una salida CONGELADA y no se pisa.\n` +
        `   Esta corrida va a ${rel(alt)}.\n` +
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
