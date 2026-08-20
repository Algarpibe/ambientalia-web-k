/**
 * LA DESCOMPOSICIÓN DEL PIE — POR SECCIÓN Y DE DOS LADOS.
 * Uso: node scripts/qa/pie-cmp.mjs [1440|390]      (npm run qa:pie-cmp)
 * Negativo: node scripts/qa/pie-cmp.neg.mjs        (npm run qa:pie-cmp-neg)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE: `pie.rect.h` ES UN TOTAL, Y UN TOTAL ABSORBE SU COMPOSICIÓN
 *
 * Dos desfases del pie llevan fichados desde la 80.ª y la 84.ª —**+1.80** y
 * **+0.30** a 390— y la pregunta que ninguna de las dos fichas puede contestar
 * es **dónde viven**. No por falta de medición: porque la única magnitud que se
 * compara es `pie.rect.h`, o sea **el alto del pie entero**. §*La causa común:
 * el NIVEL al que se mide* — un contenedor con holgura absorbe el defecto y el
 * número de arriba no se entera.
 *
 * ── Lo que YA estaba medido y nadie había leído ───────────────────────────
 * El espejo congelado **sí descompone el pie del ORIGINAL**: sus secciones
 * viven en `esqueleto.cascaron[].rect.h` con su clase. Derivado de
 * `lh-espejo-{1440,390}.json`, el pie del original tiene **CUATRO valores
 * distintos, uno por familia de forma, y varianza CERO dentro de cada una**
 * (n = 36 en `L1-etiqueta`):
 *
 * | forma | links | legal | background | total @390 |
 * |---|---|---|---|---|
 * | `L1-*` · `L4` | 1437.42 | 283.75 | 40 | **1761.17** |
 * | `L5-casos` | + CTA 265.06 | 1437.42 | 283.75 | 40 | **2026.23** |
 * | `L3-sci` | **1699.16** | **313.75** | 40 | **2052.91** |
 * | `L2-*` | **1754.05** | **480.75** | **140** | **2374.8** |
 *
 * **El «+1.80» siempre se citó contra 1761.17, que es sólo el valor de `L1`.**
 *
 * ── Y por qué hace falta una sonda en vez de otra lectura del espejo ──────
 * Porque **del lado del CLON esa descomposición NO EXISTE**. En
 * `lh-cmp-390-todas-2026-08-19-2.json` el clon publica
 * `esqueleto.cascaron.length = 0` y **todos** los `cascaron.N.*` salen
 * `«AUSENTE»`: el clon no emite las clases `et_pb_section_N_tb_footer` que el
 * barrido usa para reconocer una sección. O sea que el reparto del original
 * está congelado desde julio **y no tiene contra qué compararse**.
 *
 * Es §*un selector que no casa con nada no es un cero* con la mitad que menos
 * se mira: aquí el selector casa **en un lado y no en el otro**, y el resultado
 * no es un cero ruidoso sino un `«AUSENTE»` que el comparador clasifica en el
 * eje **mixto** — el que no lee como defecto.
 *
 * ── Cómo identifica las secciones, y por qué se DECLARA la vía ────────────
 * Las dos vías se publican en `via`, nunca se adivinan en silencio:
 *
 * | lado | vía | qué es |
 * |---|---|---|
 * | original | `et_pb_section` | las secciones Divi dentro de `.et_builder_inner_content`, con su clase `footer-*` |
 * | clon | `data-pie` | **marcador de sonda, no estilo** — el precedente es `data-fila` (§*que el objeto medido diga qué es*) |
 * | clon (respaldo) | `hijos` | hijos directos del `<footer>`, por índice. **Heurístico DECLARADO**, no identidad |
 *
 * El rol (`links` · `legal` · `background` · `cta`) es lo que empareja los dos
 * lados. Emparejar por índice sería un heurístico posicional que se rompe en
 * cuanto una forma tiene la sección CTA delante — que es justo lo que hace
 * `L5-casos`.
 *
 * ── Lo que esta sonda NO mide ─────────────────────────────────────────────
 * - **`L2-*` no está en el clon**: sus 12 páginas dan 404, así que la fila peor
 *   desviada de la tabla de arriba **no se compara** — sale como `ausente` con
 *   su cardinal, no como un cero;
 * - **el ruido**: estas rutas no tienen campaña, así que un residuo pequeño es
 *   **SIN PROBAR**, no «limpio» (§Notas de método);
 * - **por qué** el original sirve cuatro pies distintos. Esta sonda mide el
 *   reparto; el mecanismo que lo produce no lo toca.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Censo, Evaluadas, hoy, iniciarClon, launch, openPage, QA, settle, w, APP } from "./lib.mjs";

const RAIZ = APP;
const { base: BASE, parar: pararClon } = await iniciarClon();

const ARGS = process.argv.slice(2);
const width = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);
const mobile = width <= 500;

/** El espejo se puede nombrar para que el negativo no dependa del por defecto. */
const ESPEJO_NOMBRE = (ARGS.find((a) => a.startsWith("--espejo=")) || "").slice(9) || `medidas/lh-espejo-${width}.json`;

/**
 * ⚠ **SABOTAJE del negativo, no una opción de uso.** Ignora `data-pie` para
 * comprobar que la sonda **cae a la vía de respaldo y LO DICE** en vez de
 * seguir emparejando por índice en silencio — que es el daño real: un
 * heurístico posicional que se rompe en cuanto `L5-casos` mete su CTA delante
 * y produce un reparto plausible y falso.
 */
const SIN_MARCADOR = process.env.SABOTAJE_SIN_MARCADOR === "1";

/* ───────── el universo: una ruta por FORMA, derivada del espejo ─────────
 * No se escribe a mano (§regla 9, 7.º caso: un conjunto enumerado a mano
 * dentro de una sonda es un dato recordado). Se lee del espejo y se cruza
 * contra las rutas que el build emite. */
const ESPEJO_F = join(QA, ESPEJO_NOMBRE);
if (!existsSync(ESPEJO_F)) {
  console.error(
    `\n❌ NO SE PUDO EVALUAR · no existe el espejo ${ESPEJO_NOMBRE}\n` +
      `   Sin el lado del original no hay comparación posible. Una sonda que\n` +
      `   siguiera con 0 formas daría un verde de algo que no miró.\n`,
  );
  process.exit(2);
}
const espejo = JSON.parse(readFileSync(ESPEJO_F, "utf8"));
/* El `distDir` sale del entorno igual que en `next.config.ts`: leer `.next` a
 * pelo mientras se mide un build construido fuera compara **las rutas de un
 * build con el HTML de otro**, que es la forma barata de fabricar un
 * `«AUSENTE»` que no existe. */
const DIST = process.env.NEXT_DIST_DIR || ".next";
const manifiesto = JSON.parse(readFileSync(join(RAIZ, DIST, "prerender-manifest.json"), "utf8"));
const EMITE = new Set(Object.keys(manifiesto.routes || {}));

/** `/es/blog/page/2/` → `/blog/page/2` */
const aClon = (r) => {
  const s = r.replace(/^\/es/, "").replace(/\/$/, "");
  return s === "" ? "/" : s;
};

/** Una ruta por forma: la PRIMERA de cada una, en orden estable. */
const porForma = new Map();
for (const v of Object.values(espejo.paginas)) {
  if (!porForma.has(v.forma)) porForma.set(v.forma, v);
}
const UNIVERSO = [...porForma.entries()]
  .map(([forma, v]) => ({
    forma,
    orig: `https://kunakair.com${v.ruta}`,
    clon: aClon(v.ruta),
    pieEspejo: v.pie ? v.pie.rect.h : null,
    seccionesEspejo: (v.esqueleto?.cascaron || [])
      .filter((s) => s.capa === "tb_footer")
      .map((s) => ({
        rol: rolDe(s.clases || []),
        h: s.rect.h,
        clases: s.clases,
      })),
  }))
  .sort((a, b) => a.forma.localeCompare(b.forma));

/** El rol sale de la clase `footer-*`; lo que no casa y es de pie es la CTA. */
function rolDe(clases) {
  for (const c of clases) {
    if (c === "footer-links") return "links";
    if (c === "footer-legal") return "legal";
    if (c === "footer-background") return "background";
  }
  return "cta";
}

const COMPARABLES = UNIVERSO.filter((u) => EMITE.has(u.clon));
const AUSENTES = UNIVERSO.filter((u) => !EMITE.has(u.clon));

if (UNIVERSO.length === 0) {
  console.error("\n❌ 0 formas en el espejo. No se mide, no se escribe y no se da ningún veredicto.\n");
  process.exit(2);
}

/* ───────────────────────── el JS que mide en página ───────────────────── */

const LECTOR = (sinMarcador) => {
  const R = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);
  const caja = (el) => {
    const r = el.getBoundingClientRect();
    return { w: R(r.width), h: R(r.height), y: R(r.top + window.scrollY), x: R(r.left) };
  };
  const rolDeClases = (cl) => {
    if (cl.contains("footer-links")) return "links";
    if (cl.contains("footer-legal")) return "legal";
    if (cl.contains("footer-background")) return "background";
    return "cta";
  };

  const pie = __q("footer.et-l--footer, footer.et-l, footer");
  if (!pie) return { pie: null, via: null, secciones: [] };

  /* Vía 1 · el ORIGINAL: secciones Divi. */
  let nodos = [...pie.querySelectorAll(".et_builder_inner_content > .et_pb_section")];
  let via = "et_pb_section";
  let rol = (el) => rolDeClases(el.classList);

  /* Vía 2 · el CLON con marcador. */
  if (nodos.length === 0 && !sinMarcador) {
    const marcados = [...pie.querySelectorAll("[data-pie]")];
    if (marcados.length) {
      nodos = marcados;
      via = "data-pie";
      rol = (el) => el.getAttribute("data-pie");
    }
  }

  /* Vía 3 · RESPALDO declarado: hijos directos, sin identidad. */
  if (nodos.length === 0) {
    nodos = [...pie.children];
    via = "hijos";
    rol = () => null;
  }

  /* ⚠ **La guarda que impide que el marcador FABRIQUE una ausencia.**
   * Si el `<footer>` sirve más bloques de los que llevan `data-pie`, los que
   * faltan **no salen** — y un rol que falta en un lado se lee como *«el clon
   * no lo emite»* cuando lo que pasa es que **nadie lo marcó** (§sondas 4: un
   * selector que no casa con nada no es un cero). Es el caso real de la CTA de
   * `L5-casos`, que el clon emite vía `<CtaBanner>` sin marcar. Se publica el
   * descuadre con su cardinal; no se adivina. */
  const nBloques = via === "et_pb_section" ? nodos.length : pie.children.length;

  return {
    pie: caja(pie),
    marca: pie.tagName.toLowerCase() + (pie.className ? "." + String(pie.className).trim().split(/\s+/).join(".") : ""),
    via,
    nBloques,
    sinMarcar: Math.max(0, nBloques - nodos.length),
    secciones: nodos.map((el, i) => ({
      i,
      rol: rol(el),
      rect: caja(el),
      padTop: getComputedStyle(el).paddingTop,
      padBottom: getComputedStyle(el).paddingBottom,
    })),
  };
};

/* ───────────────────────────── la corrida ─────────────────────────────── */

const { browser } = await launch();
const censo = new Censo();
const salida = {
  meta: {
    fecha: hoy(),
    width,
    que: "descomposición del PIE por sección, de dos lados",
    ladoOriginal: "kunakair.com VIVO (no el espejo: el espejo no trae el clon)",
    ladoClon: BASE,
    unidad: "la SECCIÓN de pie (rol × forma), no el alto del pie",
    ruido: "⚠ estas rutas NO tienen campaña de ruido: un residuo pequeño es SIN PROBAR, no «limpio»",
    noMide: [
      `L2-* NO está en el clon: ${AUSENTES.length} forma(s) ausente(s) de ${UNIVERSO.length} — la peor desviada del espejo entre ellas`,
      "el MECANISMO por el que el original sirve cuatro pies distintos: se mide el reparto, no la causa",
    ],
  },
  formas: {},
  ausentes: AUSENTES.map((a) => ({ forma: a.forma, clon: a.clon, pieEspejo: a.pieEspejo })),
};

const ev = new Evaluadas({
  nombre: "pie-cmp",
  unidad: "páginas (2 por forma: los dos lados)",
  minimo: COMPARABLES.length * 2,
  porPaginas: true,
});

for (const u of COMPARABLES) {
  const lee = async (url) => {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    try {
      await settle(page);
      const { datos } = await censo.medir(page, LECTOR, SIN_MARCADOR);
      return datos;
    } finally {
      await page.close();
    }
  };
  try {
    const orig = await lee(u.orig);
    const clon = await lee(BASE + u.clon);
    salida.formas[u.forma] = { orig, clon, rutaOrig: u.orig, rutaClon: u.clon };
  } catch (e) {
    salida.formas[u.forma] = { error: String(e && e.message ? e.message : e) };
  }
}

await browser.close();

const muertos = censo.informe(`@${width}`);

/* ───────────────────────── el reparto, por ROL ─────────────────────────── */

const filas = [];
for (const [forma, v] of Object.entries(salida.formas)) {
  if (v.error || !v.orig || !v.clon) continue;
  const porRolO = new Map();
  for (const s of v.orig.secciones) porRolO.set(s.rol, s);
  const porRolC = new Map();
  for (const s of v.clon.secciones) porRolC.set(s.rol, s);
  const roles = [...new Set([...porRolO.keys(), ...porRolC.keys()])];
  for (const rol of roles) {
    const o = porRolO.get(rol);
    const c = porRolC.get(rol);
    filas.push({
      forma,
      rol,
      orig: o ? o.rect.h : null,
      clon: c ? c.rect.h : null,
      delta: o && c ? +(c.rect.h - o.rect.h).toFixed(2) : null,
    });
  }
  const dTotal = +(v.clon.pie.h - v.orig.pie.h).toFixed(2);
  filas.push({ forma, rol: "· TOTAL", orig: v.orig.pie.h, clon: v.clon.pie.h, delta: dTotal });
}
salida.reparto = filas;

/* ── el CONTROL interno: la suma de las secciones tiene que dar el total ──
 * Si no da, es que el `<footer>` tiene ritmo propio o una sección sin contar,
 * y entonces el reparto NO es una descomposición: es una lista. */
salida.control = [];
for (const [forma, v] of Object.entries(salida.formas)) {
  if (v.error || !v.orig || !v.clon) continue;
  for (const lado of ["orig", "clon"]) {
    const suma = +v[lado].secciones.reduce((a, s) => a + s.rect.h, 0).toFixed(2);
    salida.control.push({ forma, lado, suma, pie: v[lado].pie.h, resto: +(v[lado].pie.h - suma).toFixed(2) });
  }
}

w(`medidas/pie-cmp-${width}.json`, salida);

/* ───────────────────────────── el informe ─────────────────────────────── */

const ANCHO = 22;
console.log(`\n═══ DESCOMPOSICIÓN DEL PIE @${width} · ${COMPARABLES.length} formas comparadas · ${AUSENTES.length} ausentes\n`);
console.log(`  ${"forma".padEnd(ANCHO)} ${"rol".padEnd(12)} ${"orig".padStart(10)} ${"clon".padStart(10)} ${"Δ".padStart(9)}`);
let formaPrev = "";
for (const f of filas) {
  const et = f.forma === formaPrev ? "" : f.forma;
  formaPrev = f.forma;
  const d = f.delta === null ? "—" : (f.delta > 0 ? "+" : "") + f.delta;
  const marca = f.delta === null ? "  ?" : f.delta === 0 ? "  ✓" : "  ⚠";
  console.log(
    `  ${et.padEnd(ANCHO)} ${String(f.rol).padEnd(12)} ${String(f.orig ?? "—").padStart(10)} ${String(f.clon ?? "—").padStart(10)} ${d.padStart(9)}${marca}`,
  );
}

console.log(`\n── CONTROL · suma de secciones contra el alto del pie ──`);
for (const c of salida.control) {
  console.log(`  ${c.forma.padEnd(ANCHO)} ${c.lado.padEnd(6)} suma ${String(c.suma).padStart(9)} · pie ${String(c.pie).padStart(9)} · resto ${String(c.resto).padStart(8)}${c.resto === 0 ? " ✓" : " ⚠ el pie tiene ritmo propio"}`);
}

if (AUSENTES.length) {
  console.log(`\n── AUSENTES del clon (${AUSENTES.length} de ${UNIVERSO.length} formas) ──`);
  for (const a of salida.ausentes) console.log(`  ${a.forma.padEnd(ANCHO)} ${a.clon} · pie del original: ${a.pieEspejo}`);
}

const vias = [...new Set(Object.values(salida.formas).filter((v) => v.clon).map((v) => v.clon.via))];
salida.viasDelClon = vias;
const porRespaldo = Object.values(salida.formas).filter((v) => v.clon && v.clon.via === "hijos").length;
if (porRespaldo > 0) {
  console.error(
    `\n❌ NO SE PUDO ATRIBUIR · el clon se leyó por la vía de RESPALDO ('hijos') en ${porRespaldo} de ${COMPARABLES.length} formas.\n` +
      `   Esa vía no da identidad: el rol sale \`null\` y los ${porRespaldo} bloques colapsarían en\n` +
      `   una sola clave, produciendo un reparto PLAUSIBLE Y FALSO. Falta el marcador \`data-pie\`\n` +
      `   en el Footer del clon. Emparejar por índice se rompe en cuanto \`L5-casos\` mete su CTA delante.\n`,
  );
}

/* El descuadre del marcador, con su cardinal y por forma. */
const sinMarcar = Object.entries(salida.formas)
  .filter(([, v]) => v.clon && v.clon.sinMarcar > 0)
  .map(([forma, v]) => ({ forma, sinMarcar: v.clon.sinMarcar, nBloques: v.clon.nBloques }));
salida.sinMarcar = sinMarcar;
if (sinMarcar.length) {
  console.log(`\n⚠ BLOQUES DE PIE SIN \`data-pie\` EN EL CLON — un rol que falte NO significa que el clon no lo emita:`);
  for (const s of sinMarcar) console.log(`  ${s.forma.padEnd(ANCHO)} ${s.sinMarcar} de ${s.nBloques} bloques sin marcar`);
}

/**
 * ⚠⚠ **LA GUARDA QUE ESTA SONDA NO TENÍA EN SU PRIMERA CORRIDA, Y ES §sondas
 * 4bis EN EL CÓDIGO ESCRITO PARA CAZARLA.**
 *
 * `censo.evaluate` no existe —el método es `medir`—, así que las 6 formas
 * cayeron al `catch` con `error` y la sonda **imprimió su tabla vacía, dijo
 * `evaluadas 12/12` y salió con 0**. El contrato de `Evaluadas` no podía verlo:
 * cuenta **páginas**, y las 12 páginas se abrieron de verdad. Lo que falló fue
 * la LECTURA dentro de cada una, que es una unidad que el contrato no mira.
 *
 * De donde la regla que vale para cualquier sonda de dos lados: **el mínimo se
 * declara en la unidad que la sonda AFIRMA**, y ésta afirma secciones, no
 * páginas. Con 0 secciones emparejadas no hay reparto, y un reparto vacío es
 * `NO SE PUDO EVALUAR`, nunca un verde.
 */
const errores = Object.entries(salida.formas).filter(([, v]) => v.error);
if (errores.length) {
  console.error(`\n❌ ${errores.length} de ${COMPARABLES.length} formas cayeron con error de LECTURA:`);
  for (const [f, v] of errores.slice(0, 5)) console.error(`   ${f.padEnd(ANCHO)} ${String(v.error).slice(0, 120)}`);
}

const conDelta = filas.filter((f) => f.rol !== "· TOTAL" && f.delta !== null);
const noCero = conDelta.filter((f) => f.delta !== 0);

if (conDelta.length === 0) {
  console.error(
    `\n❌ NO SE PUDO EVALUAR · 0 secciones de pie emparejadas.\n` +
      `   Esta sonda afirma SECCIONES; con cero no hay reparto que publicar y su\n` +
      `   tabla vacía se lee exactamente igual que un pie que cuadra (§sondas 4bis).\n`,
  );
  process.exitCode = 2;
}
console.log(
  `\n  ✓ evaluadas ${COMPARABLES.length * 2}/${COMPARABLES.length * 2} páginas · secciones de pie\n` +
    `  secciones emparejadas ${conDelta.length} · con Δ≠0 ${noCero.length} · vías del clon: ${vias.join(" · ") || "—"}\n`,
);

if (process.exitCode !== 2) process.exitCode = muertos > 0 || porRespaldo > 0 ? 1 : 0;

/**
 * ⚠ **`process.exitCode` NO MATA** (§sondas 17): sólo dice con qué código se
 * terminará **cuando el bucle de eventos se vacíe**, y el servidor del clon lo
 * sostiene abierto para siempre. La primera corrida de esta sonda imprimió su
 * informe entero y se quedó colgada hasta que la mató un timeout de 10 min —
 * que no es un rojo, es un negativo que **ni pasa ni falla: se agota**.
 */
await pararClon();
