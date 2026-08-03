/**
 * LÍNEA BASE DEL CLON — el "Antes/Después" de tocar un componente compartido.
 * Uso: node clon-base.mjs [ancho] [etiqueta] [--cmp <fichero.json>]
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * Las demás sondas comparan el clon **contra el original**, y por tanto arrastran
 * el ruido del sitio vivo. Ésta compara el clon **contra sí mismo** antes y
 * después de un cambio: dos builds del mismo código dan el mismo número al
 * céntimo, así que aquí **el umbral es cero** y no hay tolerancia que discutir.
 *
 * Se escribió al construir MONOGRÁFICO (2026-07-29), que añade campos a
 * `CabeceraSector` y `SectorHero` — compartidos con los 4 sectores. Que añadir un
 * campo opcional sea aditivo no prueba que no mueva un píxel: eso se mide.
 *
 * ── Las rutas salen del BUILD, no de una lista ─────────────────────────────
 * Igual que `enlaces.mjs`: `.next/prerender-manifest.json`. Así la sonda se
 * automantiene — cuando el monográfico emita sus rutas entran solas, y el informe
 * las marca como NUEVAS en vez de callárselas. Una lista a mano habría medido 9
 * páginas antes y 9 después, dando "sin regresión" sin mirar las dos nuevas.
 *
 * ── El marcador discriminante ──────────────────────────────────────────────
 * `CLAUDE.md` §El principio, corolario 2: un "limpio" contra un `next start`
 * desincronizado de `.next` es un limpio falso, y ya pasó una vez. Antes de medir
 * nada, la sonda exige encontrar un marcador del cambio en el HTML **servido**:
 *
 *   MARCADOR="texto que solo existe en el build nuevo" node clon-base.mjs 1440
 *   MARCADOR_RUTA=/sectores/x MARCADOR="…" node clon-base.mjs 1440
 *
 * Sin `MARCADOR` avisa y sigue: la primera corrida de una tanda no tiene contra
 * qué discriminar todavía. Con `MARCADOR` y sin encontrarlo, **sale con 2 y no
 * mide** — que es el punto: la corrida que más importa es la que dice "no se
 * movió nada".
 */
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { Evaluadas, QA, env, envRuta, iniciarClon, launch, openPage, settle, w, APP} from "./lib.mjs";

/**
 * Raíz de la APP de render — donde viven `.next` y `src/`.
 *
 * ⚠ Desde la conversión a monorepo (F2-1, 2026-08-03) **NO es la raíz del
 * repo**: las sondas se quedaron arriba y la app bajó a `apps/web/`. Antes
 * esto era `new URL("../..")`, que ahora apuntaría al repo — y un
 * `prerender-manifest.json` que no existe deja `RUTAS` vacío, o sea **verde
 * sin medir**. Lo resuelve y lo VERIFICA `APP` en `lib.mjs`.
 */
const RAIZ = APP;

/**
 * ── DUEÑA DE SU SERVIDOR desde el 2026-08-02 ──────────────────────────────
 * Antes daba por hecho un `next start` ajeno en el 3000, y ése era el terreno
 * en el que se cultivó su peor fallo: **con el puerto vacío medía 31 errores y
 * salía con código 0**. Ahora arranca el suyo en un puerto libre, espera a que
 * responda y lo mata al salir — así el modo de fallo no se detecta, **no
 * existe**. `CLON=<url>` sigue mandando para apuntar a un despliegue.
 *
 * Y la otra mitad la pone `w()`: si el `.next` cambia a mitad de corrida, la
 * salida se congela como `-CONTAMINADA` y sale por error. Aislamiento donde se
 * puede, detección donde no.
 */
const { base: BASE, parar: pararClon } = await iniciarClon();

const args = process.argv.slice(2);
const iCmp = args.indexOf("--cmp");
const ficheroCmp = iCmp >= 0 ? args[iCmp + 1] : null;
const libres = (iCmp >= 0 ? args.slice(0, iCmp) : args).filter(Boolean);
const width = Number(libres[0] || 1440);
const etiqueta = libres[1] ? `-${libres[1]}` : "";
const mobile = width <= 500;

/* ─────────────── rutas publicadas, leídas del build ─────────────── */

const manifiesto = JSON.parse(
  readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"),
);
const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => !r.startsWith("/_") && !r.includes("."))
  .sort();
if (RUTAS.length === 0) {
  console.error("No hay rutas en .next/prerender-manifest.json — ¿falta `npm run build`?");
  process.exit(2);
}

/* ─────────────── marcador discriminante del build servido ─────────────── */

const marcador = process.env.MARCADOR || null;
if (marcador) {
  // `envRuta()` deshace la traducción de MSYS **en la lectura**. Git Bash
  // convierte cualquier valor que empiece por `/` en una ruta de Windows, así
  // que `MARCADOR_RUTA=/x` llegaba como `C:/Program Files/Git/x` y la sonda
  // moría con `Invalid URL`. El README decía que `ruta()` cubría
  // `MARCADOR_RUTA` **y aquí no se llamaba**: el corolario de `CLAUDE.md`
  // §DOCUMENTADO NO ES CONECTADO, en la propia sonda. Aquí falló ruidosamente;
  // en un caso menos afortunado habría medido otra página. Ahora no hay nada
  // que acordarse de llamar.
  const rutaMarcador = envRuta("MARCADOR_RUTA", "/");
  const res = await fetch(BASE + rutaMarcador);
  const html = res.ok ? await res.text() : "";
  if (!html.includes(marcador)) {
    console.error(
      `\n❌ MARCADOR no encontrado en ${BASE + rutaMarcador} (HTTP ${res.status}).\n` +
        `   El servidor NO está sirviendo el build que crees. Mátalo POR PUERTO,\n` +
        `   rehaz \`npm run build\`, relánzalo y repite. No se mide nada.\n`,
    );
    process.exit(2);
  }
  console.log(`✓ marcador presente en ${rutaMarcador} — el build servido es el nuevo`);
} else {
  console.log("⚠ sin MARCADOR: no se ha discriminado el build servido (ver cabecera)");
}

/* ─────────────────────────── medida ─────────────────────────── */

const { browser } = await launch();
const todo = { meta: { width, base: BASE, rutas: RUTAS.length }, paginas: {} };

/**
 * El contrato de `Evaluadas`: el mínimo se DERIVA DEL BUILD, así que una ruta
 * nueva sube el listón sola. Por debajo de él el veredicto no es «sin
 * regresión» — es NO SE PUDO EVALUAR, y lo cierra el gancho de salida de
 * `lib.mjs` aunque esta sonda no vuelva a mirarlo.
 */
const ev = new Evaluadas({ nombre: `clon-base @${width}`, unidad: "rutas", minimo: RUTAS.length });

for (const ruta of RUTAS) {
  try {
    const { page } = await openPage(browser, BASE + ruta, {
      width,
      height: mobile ? 844 : 900,
      mobile,
    });
    await settle(page);
    todo.paginas[ruta] = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const t = (el, n = 60) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
      const h1 = document.querySelector("h1");
      const caja = (el) => {
        const b = el.getBoundingClientRect();
        return { x: r(b.x), y: r(b.y + window.scrollY), w: r(b.width), h: r(b.height) };
      };
      return {
        docH: r(document.documentElement.scrollHeight),
        // La base de lectura del protocolo (README §2): dispersión 0 en 42 cargas.
        h1: h1 ? { ...caja(h1), txt: t(h1) } : null,
        // Árbol de primer nivel: una entrada por sección del documento, con su
        // ritmo. Un Δ localizado dice QUÉ sección se movió; el `docH` solo dice
        // que algo se movió — y puede ser dos errores anulándose.
        secciones: [...document.querySelectorAll("main > section, main > div")].map((s, i) => {
          const st = getComputedStyle(s);
          return {
            i,
            h: r(s.getBoundingClientRect().height),
            mt: st.marginTop,
            pt: st.paddingTop,
            pb: st.paddingBottom,
            txt: t(s, 34),
          };
        }),
        nAnclas: document.querySelectorAll("a[href]").length,
        nImgs: document.querySelectorAll("img").length,
      };
    });
    await page.close();
    ev.ok();
  } catch (e) {
    todo.paginas[ruta] = { error: String(e).slice(0, 200) };
    ev.fallo(ruta, e);
  }
}
await browser.close();

const salida = `clon-base-${width}${etiqueta}.json`;
w(env("SALIDA") || `medidas/${salida}`, todo);

for (const [ruta, d] of Object.entries(todo.paginas)) {
  if (d.error) {
    console.log(`  ⚠ ${ruta}  ${d.error}`);
    continue;
  }
  console.log(
    `  ${ruta.padEnd(52)} docH ${String(d.docH).padStart(8)}  h1.y ${String(d.h1?.y ?? "—").padStart(8)}` +
      `  secciones ${String(d.secciones.length).padStart(2)}  a ${String(d.nAnclas).padStart(3)}`,
  );
}

/**
 * ⚠ **UNA RUTA QUE NO SE PUDO MEDIR NO ES UNA RUTA SIN REGRESIÓN, y durante
 * meses esta sonda no las distinguía.** Medido el 2026-08-02 con el 3000 vacío:
 * imprimió **31 `ERR_CONNECTION_REFUSED`** y **salió con código 0**. La guarda
 * de regresión del clon daba verde midiendo exactamente nada.
 *
 * Hoy eso no depende de estas líneas: **el veredicto lo cierra el contrato de
 * `Evaluadas`** desde el gancho de salida de `lib.mjs`, aunque nadie vuelva a
 * mirarlo aquí. Y el modo de fallo que lo originó ya no existe — la sonda
 * arranca su propio servidor. Se deja el informe explícito porque un código de
 * salida no explica nada al que lo lee en consola.
 */
const fallosEv = ev.informe();

/* ─────────────────────────── comparación ─────────────────────────── */

if (!ficheroCmp) process.exit(fallosEv ? 2 : 0);

/**
 * ⚠ **La ruta del `--cmp` se resuelve contra `scripts/qa/`, no contra el `cwd`
 * — igual que `w()`.** `w()` se arregló en su día y **el lado de LECTURA se
 * quedó sin arreglar**: la sonda escribía en `scripts/qa/medidas/` y luego no
 * sabía leer de ahí lo que ella misma había escrito. Lanzada desde la raíz
 * —que es como la invoca `npm run qa:clon-base`— el `--cmp medidas/x.json` de
 * la propia documentación moría con ENOENT.
 *
 * Es media corrección de las de `CLAUDE.md`: se arregló la instancia que había
 * delante y no la CLASE. Aquí se cierra la otra mitad.
 */
const rutaCmp = isAbsolute(ficheroCmp) ? ficheroCmp : join(QA, ficheroCmp);
const antes = JSON.parse(readFileSync(rutaCmp, "utf8"));
if (antes.meta.width !== width) {
  console.error(`\n❌ ${rutaCmp} se midió a ${antes.meta.width}, no a ${width}.`);
  process.exit(2);
}

console.log(`\n═══ ANTES (${rutaCmp}) vs DESPUÉS @${width}\n`);
const rutasAntes = Object.keys(antes.paginas);
const nuevas = RUTAS.filter((r) => !rutasAntes.includes(r));
const idas = rutasAntes.filter((r) => !RUTAS.includes(r));
if (nuevas.length) console.log(`  NUEVAS (no había línea base): ${nuevas.join(" · ")}`);
if (idas.length) console.log(`  ❌ DESAPARECIDAS del build: ${idas.join(" · ")}`);

let regresiones = 0;
let sinComparar = 0;
for (const ruta of rutasAntes.filter((r) => RUTAS.includes(r))) {
  const a = antes.paginas[ruta];
  const b = todo.paginas[ruta];
  if (a.error || b.error) {
    // Impreso Y CONTADO: un `continue` que no incrementa nada es exactamente
    // cómo E1 vivió una tanda entera (`CLAUDE.md` §sondas, regla 1).
    sinComparar++;
    console.log(`  ⚠ ${ruta}: error en una de las dos corridas — NO comparada`);
    continue;
  }
  const deltas = [];
  const dDoc = +(b.docH - a.docH).toFixed(2);
  if (dDoc !== 0) deltas.push(`docH ${dDoc > 0 ? "+" : ""}${dDoc}`);
  const dH1 = +((b.h1?.y ?? 0) - (a.h1?.y ?? 0)).toFixed(2);
  if (dH1 !== 0) deltas.push(`h1.y ${dH1 > 0 ? "+" : ""}${dH1}`);
  if (a.secciones.length !== b.secciones.length)
    deltas.push(`nº secciones ${a.secciones.length}→${b.secciones.length}`);
  else
    a.secciones.forEach((sa, i) => {
      const sb = b.secciones[i];
      const d = +(sb.h - sa.h).toFixed(2);
      if (d !== 0) deltas.push(`S${i} h ${d > 0 ? "+" : ""}${d} ("${sa.txt}")`);
      if (sa.mt !== sb.mt || sa.pt !== sb.pt || sa.pb !== sb.pb)
        deltas.push(`S${i} ritmo ${sa.mt}/${sa.pt}/${sa.pb} → ${sb.mt}/${sb.pt}/${sb.pb}`);
    });
  if (a.nAnclas !== b.nAnclas) deltas.push(`anclas ${a.nAnclas}→${b.nAnclas}`);

  if (deltas.length) {
    regresiones++;
    console.log(`  ❌ ${ruta}`);
    deltas.forEach((d) => console.log(`       ${d}`));
  } else {
    console.log(`  ✅ ${ruta}  sin mover un píxel`);
  }
}

/* `páginas comparadas` es ahora las que SE COMPARARON, no las que se
 * intentaron: contar las que fallaron como comparadas es la misma mentira que
 * darles verde, solo que en la cifra del titular. */
const comparadas = rutasAntes.length - idas.length - sinComparar;
/**
 * ⚠ **Y la comparación tiene su propio «verde por vaciado», distinto del de la
 * medida.** Se puede medir las 31 rutas perfectamente y comparar CERO — basta
 * con una línea base cuyas rutas ya no existan. Antes eso imprimía
 * «0 páginas comparadas · 0 con regresión» y salía con **0**.
 *
 * El contrato se aplica al segundo nivel con su propio mínimo: **al menos una
 * ruta en común**. No se deriva del build porque el listón aquí lo pone el
 * fichero de comparación, no el build.
 */
const evCmp = new Evaluadas({ nombre: `clon-base cmp @${width}`, unidad: "rutas comparadas", minimo: 1 });
evCmp.ok(comparadas);
console.log(
  `\n${regresiones === 0 && sinComparar === 0 && comparadas > 0 ? "✅" : "❌"} ${comparadas} páginas comparadas · ` +
    `${regresiones} con regresión · umbral CERO (clon contra clon)` +
    (sinComparar ? `\n   ⚠ ${sinComparar} NO comparada(s) por error: no son «sin regresión», son SIN MEDIR.` : ""),
);
const fallosCmp = evCmp.informe();
await pararClon();
process.exit(
  regresiones === 0 && idas.length === 0 && sinComparar === 0 && fallosEv === 0 && fallosCmp === 0 ? 0 : 1,
);
