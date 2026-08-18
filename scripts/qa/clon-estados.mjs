/**
 * ¿EL CLON TIENE MÁS DE UN ESTADO CONTRA EL MISMO BUILD?
 * Uso: node clon-estados.mjs [cargas por ruta]        (por defecto 30)
 *      RUTAS=/a,/b  ANCHO=390  SABOTAJE=muerto
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * `clon-base` compara **dos builds** con umbral cero. Cuando marca una ruta,
 * la lectura por defecto es *«el build nuevo la movió»* — y esa lectura tiene
 * un supuesto que la propia sonda **no puede comprobar**: que el clon, contra
 * un build fijo, dé siempre el mismo número.
 *
 * Es exactamente §sondas 15 —*dos instrumentos que comparten premisa no
 * verifican la premisa*— con un solo instrumento: `clon-base` mide la
 * diferencia ENTRE builds y **no mide la dispersión DENTRO de un build**, así
 * que las dos causas le salen idénticas.
 *
 * ── El caso que la trae, con su número ─────────────────────────────────────
 *
 * 2026-08-18: `clon-base 1440 p1 --cmp p0` cierra **367/367 comparadas · 6 con
 * regresión**. Cinco son el efecto buscado (`anclas +1` en las 5 páginas de
 * `/etiqueta/monitorizacion-ambiental` que la regla del paginador predice). La
 * sexta no:
 *
 *   /contaminacion-por-metano   docH 41 974 → 41 990   (+16)   S1 h +16
 *
 * Y **el diff no la explica**: entre el árbol del build `p0` y `HEAD`, lo único
 * que cambia en `apps/web` es `Paginador.tsx` (derivado con `git diff --stat`,
 * no recordado), cuyo único importador es `PaginaListado.tsx` — y esa ruta
 * entra por `app/[slug]/page.tsx`, que no lo importa. La página tampoco carga
 * el chunk de `listados.css` (medido sobre lo servido: enlaza **una** hoja,
 * la compartida; `/blog` enlaza dos).
 *
 * ── Las dos hipótesis, y qué predice cada una ──────────────────────────────
 *
 * | | predice sobre ESTA sonda |
 * |---|---|
 * | **H1 · diferencia de BUILD** | **un solo estado** en N cargas contra el mismo `.next` |
 * | **H2 · carrera de carga** (la ruta es **la más alta de las 367**: 41 990 px, y la siguiente 38 502) | **dos estados**, y el hueco vale **16** |
 *
 * > **Son separables y por eso la sonda existe.** §*antes de fichar una
 * > indeterminación, comprueba que las dos hipótesis sean DISTINTAS — y di
 * > sobre qué entrada difieren*: aquí la entrada es *una segunda carga contra
 * > el mismo build*, que es justo lo que `clon-base` nunca hace.
 *
 * ── Cómo se lee el resultado, escrito ANTES de correrla ────────────────────
 *
 * - **≥2 estados** ⇒ H2. El `+16` **deja de ser regresión** y pasa a ser
 *   dispersión propia del clon en esa ruta; y entonces **`clon-base` necesita
 *   un suelo declarado ahí**, igual que el original lo tiene.
 * - **1 estado** ⇒ **NO se escribe «el clon es determinista»**. Se escribe la
 *   COTA (regla de tres, 0 eventos en n ⇒ 95 % ⇒ `3/n`) y el `+16` se queda
 *   como regresión **con su mecanismo SIN PROBAR**, que no es lo mismo que
 *   explicada.
 *
 * ── El control, que es lo que la hace discriminante ────────────────────────
 *
 * Va con **dos** rutas: la que se movió y **la segunda más alta que NO se
 * movió** (`/monitorizacion-de-emisiones-del-trafico-urbano`, 38 502). Si las
 * dos sacaran dos estados, lo que hay es una sonda ruidosa; si sólo la primera,
 * el fenómeno es de esa página. Un «dos estados» sin control no distingue las
 * dos cosas.
 */
import { Censo, Evaluadas, env, envRutas, iniciarClon, launch, openPage, settle, w } from "./lib.mjs";

const { base: BASE, parar: pararClon } = await iniciarClon();

const PORDEFECTO = ["/contaminacion-por-metano", "/monitorizacion-de-emisiones-del-trafico-urbano"];
const RUTAS = envRutas("RUTAS") || PORDEFECTO;
const CARGAS = Number(process.argv[2] || 30);
const ANCHO = Number(env("ANCHO") || 1440);
const mobile = ANCHO <= 500;

/**
 * `SABOTAJE=muerto` apunta el ancla a un selector inventado. Tiene que salir
 * por el CENSO (código ≠ 0), **no** medir «0 estados» y dar verde: es la regla
 * del cero, y `estados-390` ya la pagó una vez con su propio negativo.
 */
const SABOTAJE = env("SABOTAJE");

const { browser } = await launch();
const censo = new Censo();

/**
 * Contrato de `Evaluadas`: la unidad es la CARGA y el mínimo es **exacto**. Una
 * sonda de muestreo que mide de menos es precisamente la que fabricaría el
 * «un solo estado» falso, que es la conclusión cara de las dos.
 */
const ev = new Evaluadas({
  nombre: `clon-estados @${ANCHO}`,
  unidad: "cargas",
  minimo: RUTAS.length * CARGAS,
  porPaginas: true,
});

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const raiz = sabotaje === "muerto" ? __q("main.no-existe-este-ancla") : __q("main");
  const h1 = __q("h1");
  return {
    /* El observable de `clon-base`, para que los números sean comparables con
     * su congelada sin traducir nada. */
    docH: raiz ? r(document.documentElement.scrollHeight) : null,
    h1y: h1 ? r(h1.getBoundingClientRect().top + scrollY) : null,
    /* La sección que se movió (`S1` en `clon-base` = 2.ª de `main > section,
     * main > div`), por si el Δ vive en una sola. */
    secciones: raiz
      ? [...document.querySelectorAll("main > section, main > div")].map((s) =>
          r(s.getBoundingClientRect().height),
        )
      : null,
    nImgs: document.querySelectorAll("img").length,
    /* Candidatos de la hipótesis H2: si el estado correlaciona con alguno de
     * éstos, el mecanismo deja de ser anónimo. */
    imgsSinCargar: [...document.querySelectorAll("img")].filter((i) => !i.complete).length,
    fuentes: document.fonts?.status ?? null,
  };
};

const crudo = {};
console.log(
  `═══ ESTADOS DEL CLON @${ANCHO} — ${CARGAS} cargas × ${RUTAS.length} rutas = ${RUTAS.length * CARGAS}\n` +
    `    contra UN SOLO build (${BASE}); la pregunta es la dispersión DENTRO del build\n`,
);

for (let i = 0; i < CARGAS; i++) {
  for (const ruta of RUTAS) {
    const t0 = Date.now();
    try {
      const { page } = await openPage(browser, BASE + ruta, {
        width: ANCHO,
        height: mobile ? 844 : 900,
        mobile,
      });
      await settle(page);
      const { datos: m } = await censo.medir(page, LECTOR, SABOTAJE);
      m.cargaMs = Date.now() - t0;
      m.i = i;
      (crudo[ruta] ||= []).push(m);
      await page.close();
      ev.ok();
    } catch (e) {
      (crudo[ruta] ||= []).push({ error: String(e).slice(0, 80), cargaMs: Date.now() - t0, i });
      ev.fallo(`${ruta}#${i}`, e);
    }
  }
  if ((i + 1) % 5 === 0) {
    const est = Object.entries(crudo)
      .map(([r, v]) => `${r.slice(1, 14)}:${new Set(v.filter((c) => c.docH != null).map((c) => c.docH)).size}`)
      .join("  ");
    console.log(`  ${String(i + 1).padStart(3)}/${CARGAS} cargas · estados distintos hasta ahora → ${est}`);
  }
}

/* ─────────────────────────────── el recuento ─────────────────────────────── */
const resumen = {};
for (const [ruta, cargas] of Object.entries(crudo)) {
  const ok = cargas.filter((c) => !c.error && c.docH != null);
  const cuenta = {};
  for (const c of ok) cuenta[c.docH] = (cuenta[c.docH] || 0) + 1;
  const estados = Object.entries(cuenta)
    .map(([v, n]) => ({ valor: Number(v), veces: n }))
    .sort((a, b) => a.valor - b.valor);
  resumen[ruta] = {
    cargasValidas: ok.length,
    cargasConError: cargas.length - ok.length,
    nEstados: estados.length,
    estados,
    huecos: estados.slice(1).map((e, i) => +(e.valor - estados[i].valor).toFixed(2)),
    /** La cota de la regla de tres: 0 eventos en n ⇒ 95 % ⇒ 3/n por carga. */
    cotaSiUnEstado: ok.length ? +(3 / ok.length).toFixed(4) : null,
    cargaMs: ok.length
      ? { min: Math.min(...ok.map((c) => c.cargaMs)), max: Math.max(...ok.map((c) => c.cargaMs)) }
      : null,
  };
}

console.log(`\n═══ RESULTADO @${ANCHO}`);
console.log("  ruta".padEnd(46) + "válidas".padStart(9) + "estados".padStart(9) + "   valores (veces)");
for (const [r, v] of Object.entries(resumen)) {
  console.log(
    "  " + r.slice(0, 42).padEnd(44) + String(v.cargasValidas).padStart(9) + String(v.nEstados).padStart(9) +
      "   " + v.estados.map((e) => `${e.valor}×${e.veces}`).join("  ") +
      (v.huecos.length ? `   huecos: ${v.huecos.join(" ")}` : ""),
  );
}

const multi = Object.entries(resumen).filter(([, v]) => v.nEstados > 1);
const total = Object.values(resumen).reduce((a, v) => a + v.cargasValidas, 0);

if (total === 0)
  console.log(
    `\n  ❌ NO SE PUDO EVALUAR: 0 cargas válidas.\n` +
      `     Eso NO es «un solo estado». Sin cargas no hay recuento — es la regla\n` +
      `     del cero, y es el fallo que el negativo de esta sonda provoca a propósito.`,
  );
else if (multi.length)
  console.log(
    `\n  ⚡ SEGUNDO ESTADO CONTRA EL MISMO BUILD en ${multi.length} de ${Object.keys(resumen).length} ruta(s).\n` +
      `     ⇒ H2: el Δ de esa ruta en \`clon-base\` NO es una regresión de build, es\n` +
      `        dispersión propia del clon. Y entonces \`clon-base\` necesita un SUELO\n` +
      `        declarado ahí, igual que el original lo tiene en las suyas.\n` +
      (multi.length === Object.keys(resumen).length
        ? `     ⚠ Pero SALEN TODAS, control incluido: eso no es «esa página», es la sonda\n` +
          `        o el entorno. No se atribuye a la ruta sin que el control salga limpio.\n`
        : `     El control sale con UN estado, así que el fenómeno es de esa página.\n`),
  );
else
  console.log(
    `\n  UN SOLO ESTADO en las ${total} cargas de esta sentada.\n` +
      `  ⚠ Y eso NO se escribe como «el clon es determinista»: se escribe la COTA.\n` +
      `     Regla de tres (0 eventos en n ⇒ 95 %): < ${(300 / (total / Object.keys(resumen).length)).toFixed(1)} % por carga y ruta.\n` +
      `     El Δ de \`clon-base\` se queda como REGRESIÓN con su mecanismo SIN PROBAR,\n` +
      `     que no es lo mismo que explicada.`,
  );

w(`medidas/clon-estados-${ANCHO}${SABOTAJE ? `-neg-${SABOTAJE}` : ""}.json`, {
  meta: {
    ancho: ANCHO,
    cargasPorRuta: CARGAS,
    rutas: RUTAS,
    base: String(BASE).replace(/:\d+$/, ":<efímero>"),
    ts: new Date().toISOString(),
    escala: { ts: "UTC" },
    queEs:
      "UNA SOLA SENTADA contra UN SOLO build. La unidad es la CARGA. Contesta la dispersión DENTRO de un build, que es justo lo que clon-base no puede ver.",
  },
  resumen,
  crudo,
});

await browser.close();
await pararClon();

const muertos = censo.informe();
const fallos = ev.informe();
console.log(
  `${muertos === 0 && fallos === 0 ? "✅" : "❌"} clon-estados · ${muertos} selector(es) muerto(s) · ` +
    `${total} carga(s) válida(s) · ${multi.length} ruta(s) con más de un estado`,
);
process.exit(muertos === 0 && fallos === 0 ? 0 : 2);
