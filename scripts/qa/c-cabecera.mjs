/**
 * C-QA1 — DIAGNÓSTICO de la cabecera. **Mide, no arregla.**
 * Uso: npm run qa:c-cabecera -- [ancho]      (necesita el clon en :3000)
 *
 * ── La pregunta, que es la única que importa ───────────────────────────────
 * Las 6 rutas nuevas del grupo C traen el `h1` a **−391.6** del original a 1440.
 * Las 11 antiguas están a Δ0. **¿Están bien, o están a Δ0 porque algo compensa
 * los −391.6?** Si compensan, son **dos defectos**, no cero — y arreglar la
 * cabecera rompería once páginas hoy limpias.
 *
 * Por eso esto se corre ANTES de tocar una línea.
 *
 * ── Cómo se contesta, y por qué así ────────────────────────────────────────
 * (a) el alto de la cabecera **por composición** en los dos lados — no el
 *     total, que es donde caben dos errores anulándose;
 * (b) la **Y absoluta del `h1` en crudo**, SIN restar la base de lectura. La
 *     regla del `h1` de `CLAUDE.md` es para leer el CUERPO sin que un desfase
 *     de cabecera se lea veinte veces; aplicada aquí **taparía justo lo que se
 *     está midiendo**. Es un contenedor con holgura más, y el más antiguo;
 * (c) **qué hay entre la cabecera y el `h1`** en cada ruta, elemento a
 *     elemento y con su alto en los dos lados. Ahí es donde vive «lo que
 *     compensa», si existe.
 *
 * ── Los selectores están verificados en AMBOS lados ────────────────────────
 * La lección de C-SP16: `#main-header` **no existe** en el original y su `null`
 * se leyó como «varianza cero». Aquí la cabecera es `header.et-l--header`,
 * comprobado en el HTML servido de los dos, y **la sonda sale con error si
 * cualquier selector no casa en ninguna página** (`Censo` de `lib.mjs`).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, launch, openPage, ruta, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";
const RAIZ = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

/* ── Las 17 rutas salen del BUILD, y su original se deriva ────────────────
 * Igual que `enlaces.mjs` y `clon-base.mjs`: una lista a mano volvería a medir
 * 11 cuando hay 17. La derivación es mecánica —`/x` → `/es/x/`— porque el clon
 * espeja la rama `/es` del original. */
const manifiesto = JSON.parse(readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"));
/**
 * `SOLO=/ ,/kunak-api` acota la corrida. Pasa por `ruta()` porque **MSYS
 * traduce cualquier valor que empiece por `/`**: `SOLO=/` llegaba como
 * `C:/Program Files/Git/` y no casaba con nada.
 */
const SOLO = process.env.SOLO ? process.env.SOLO.split(",").map((s) => ruta(s.trim())) : null;
const RUTAS = Object.keys(manifiesto.routes || {})
  .filter((r) => !r.startsWith("/_") && !r.includes("."))
  .filter((r) => !SOLO || SOLO.includes(r))
  .sort()
  .map((r) => ({ clon: r, orig: `https://kunakair.com/es${r === "/" ? "" : r}/` }));

/**
 * ⚠ **Medir CERO rutas no es un limpio: es un defecto.** La primera versión con
 * `SOLO` filtró a nada por la traducción de MSYS, midió 0 páginas y **imprimió
 * “✅ la cabecera mide lo mismo… no hay nada que compensar”** — el veredicto
 * verde de una sonda que no miró nada, que es la regla de `CLAUDE.md` otra vez
 * y **en el código escrito para cazarla**. Y de paso pisó la salida congelada
 * con la vacía.
 */
if (RUTAS.length === 0) {
  console.error(
    `\n❌ 0 rutas que medir.` +
      (SOLO ? ` \`SOLO\` no casó con ninguna ruta del build: ${SOLO.join(" · ")}` : " ¿falta `npm run build`?") +
      `\n   No se mide, no se escribe y no se da ningún veredicto.\n`,
  );
  process.exit(2);
}
/** Con `SOLO` la salida NO pisa la congelada: es una corrida parcial. */
const SUFIJO = SOLO ? "-parcial" : "";

/** Lo que se lee, idéntico en original y clon. Usa `__q`/`__qa` del Censo. */
const LECTOR = () => {
  const r = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);
  const rect = (el) => (el ? el.getBoundingClientRect() : null);
  const comp = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const b = rect(el);
    return {
      alto: r(b.height), y: r(b.top + window.scrollY),
      position: s.position, mt: s.marginTop, mb: s.marginBottom,
      pt: s.paddingTop, pb: s.paddingBottom,
      // (a) por COMPOSICIÓN: si la cabecera no está en flujo, su alto no dice
      // nada del hueco que deja. `enFlujo` es la mitad que falta del número.
      enFlujo: s.position === "static" || s.position === "relative",
    };
  };

  const cab = __q("header.et-l--header");
  const h1 = __q("h1");
  const yH1 = h1 ? r(rect(h1).top + window.scrollY) : null;

  /* (c) qué hay ENTRE la cabecera y el `h1`: los hermanos de nivel superior que
   * empiezan antes del `h1`. Se recorren los hijos del contenedor de página de
   * cada lado; el clon no tiene `#page-container`, así que se cae al `body`. */
  const raiz = __q("#et-main-area") || __q("main") || document.body;
  const entre = [...raiz.children]
    .map((el) => {
      const b = rect(el);
      const contieneH1 = h1 && el.contains(h1);
      return {
        tag: el.tagName.toLowerCase(),
        clase: (el.className || "").toString().split(/\s+/).slice(0, 3).join(" ").slice(0, 60),
        alto: r(b.height), y: r(b.top + window.scrollY),
        position: getComputedStyle(el).position,
        contieneH1,
      };
    })
    .filter((n) => n.y < (yH1 ?? Infinity) || n.contieneH1);

  return {
    cabecera: comp(cab),
    // (b) EN CRUDO, sin restar base de lectura. Es el número que la regla del
    // `h1` lleva absorbiendo desde el principio.
    h1yCrudo: yH1,
    h1alto: h1 ? r(rect(h1).height) : null,
    /**
     * ⚠ El primo hermano de C-SP16: un selector que **casa en los dos lados
     * pero apunta a cosas distintas**. `document.querySelector("h1")` devuelve
     * el PRIMER `h1`, y si el original tiene uno dentro de la cabecera que el
     * clon no tiene, se están comparando dos elementos que no son el mismo. El
     * censo de selectores no lo ve —los dos casan— así que hace falta esto:
     * el texto, para poder afirmar que la comparación es legítima.
     */
    h1txt: h1 ? (h1.textContent || "").replace(/\s+/g, " ").trim().slice(0, 42) : null,
    h1dentroDeCabecera: !!(cab && h1 && cab.contains(h1)),
    nH1: __qa("h1").length,

    /**
     * ⚠ **El `h1` puede no ser un ancla visible**, y entonces su `y` no es la
     * base que la regla supone. En la home, el `h1` del original mide **alto
     * 0** y el del clon **alto 1**: los dos son títulos ocultos para SEO, no el
     * titular de la página. Comparar sus `y` no dice nada de la maquetación.
     *
     * Por eso se lee además un **ancla VISIBLE**: el primer encabezado con caja
     * real. Es contra eso contra lo que se juzga si el cuerpo cuadra cuando el
     * `h1` no sirve de apoyo.
     */
    anclaVisible: (() => {
      for (const el of __qa("h1, h2, h3")) {
        const b = rect(el);
        const t = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (b.height > 4 && t) {
          return { tag: el.tagName.toLowerCase(), y: r(b.top + window.scrollY), alto: r(b.height), txt: t.slice(0, 42) };
        }
      }
      return null;
    })(),
    // Referencia estable e independiente de la cabecera: dónde empieza el área
    // principal. Si la cabecera está fuera de flujo, esto vale 0 en ese lado.
    yAreaPrincipal: (() => {
      const a = __q("#et-main-area") || __q("main");
      return a ? r(rect(a).top + window.scrollY) : null;
    })(),
    entre,
    docH: r(document.documentElement.scrollHeight),
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), rutas: RUTAS.length }, paginas: {} };

for (const R of RUTAS) {
  const lee = async (url) => {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR);
    await page.close();
    return datos;
  };
  try {
    salida.paginas[R.clon] = { orig: await lee(R.orig), clon: await lee(CLON + R.clon) };
    console.log(`  ✓ ${R.clon}`);
  } catch (e) {
    salida.paginas[R.clon] = { error: String(e).slice(0, 160) };
    console.log(`  ⚠ ${R.clon}: ${String(e).slice(0, 110)}`);
  }
}
await browser.close();

/* ── La guarda estructural, ANTES de leer un solo número ── */
const muertos = censo.informe(`@${width}`);

/* ─────────────────────── (a) la cabecera, por composición ─────────────────────── */
console.log(`\n═══ (a) LA CABECERA @${width} — alto y si OCUPA FLUJO`);
console.log(`  ${"ruta".padEnd(50)} ${"orig alto/pos".padEnd(22)} ${"clon alto/pos".padEnd(22)} Δalto`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const o = v.orig.cabecera, c = v.clon.cabecera;
  const d = o && c ? +(c.alto - o.alto).toFixed(2) : null;
  console.log(
    `  ${ruta.slice(0, 49).padEnd(50)} ` +
      `${`${o?.alto ?? "—"} ${o?.enFlujo ? "EN FLUJO" : "fuera"}`.padEnd(22)} ` +
      `${`${c?.alto ?? "—"} ${c?.enFlujo ? "EN FLUJO" : "fuera"}`.padEnd(22)} ${d === null ? "—" : (d > 0 ? "+" : "") + d}`,
  );
}

/* ─────────────────────── (b) el `h1` EN CRUDO ─────────────────────── */
console.log(`\n═══ (b) EL \`h1\` EN CRUDO @${width} — sin restar base de lectura`);
const nuevas = new Set(["/casos-de-exito", "/case-studies", "/faqs"]);
const esNueva = (r) => [...nuevas].some((p) => r.startsWith(p));
let conDesfase = 0;
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const d = +(v.clon.h1yCrudo - v.orig.h1yCrudo).toFixed(2);
  if (d !== 0) conDesfase++;
  console.log(
    `  ${d === 0 ? "  " : "≠ "}${ruta.slice(0, 49).padEnd(50)} orig ${String(v.orig.h1yCrudo).padStart(8)} · clon ${String(v.clon.h1yCrudo).padStart(8)} · Δ ${(d > 0 ? "+" : "") + d}` +
      `${esNueva(ruta) ? "   ← ruta NUEVA" : ""}`,
  );
}
console.log(`  → ${conDesfase} de ${Object.keys(salida.paginas).length} rutas con el \`h1\` desplazado`);

/* ── ¿Se está comparando el MISMO `h1`? Sin esto, el Δ no significa nada ── */
console.log(`\n═══ (b·bis) ¿es el MISMO \`h1\` en los dos lados?`);
let distintos = 0;
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const mismo = v.orig.h1txt === v.clon.h1txt;
  if (!mismo) distintos++;
  console.log(
    `  ${mismo ? "✅" : "❌"} ${ruta.slice(0, 44).padEnd(45)} orig ${v.orig.nH1}×${v.orig.h1dentroDeCabecera ? "[en cabecera] " : ""}"${v.orig.h1txt}"` +
      `\n       ${" ".repeat(46)}clon ${v.clon.nH1}×${v.clon.h1dentroDeCabecera ? "[en cabecera] " : ""}"${v.clon.h1txt}"`,
  );
}
console.log(`  → ${distintos} rutas donde el primer \`h1\` NO es el mismo elemento: su Δ NO es comparable`);

/* ── ¿Sirve el `h1` como base? Solo si es VISIBLE en los dos lados ── */
console.log(`\n═══ (b·ter) ¿es el \`h1\` un ancla VISIBLE? — si no, su \`y\` no es la base que la regla supone`);
let ocultos = 0;
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const oculto = (v.orig.h1alto ?? 0) <= 4 || (v.clon.h1alto ?? 0) <= 4;
  if (!oculto) continue;
  ocultos++;
  const a = v.orig.anclaVisible, b = v.clon.anclaVisible;
  const d = a && b ? +(b.y - a.y).toFixed(2) : null;
  console.log(
    `  ⚠ ${ruta}: el \`h1\` mide ${v.orig.h1alto}/${v.clon.h1alto} de alto → OCULTO, no es base.\n` +
      `      ancla visible orig: ${a ? `${a.tag} y=${a.y} "${a.txt}"` : "—"}\n` +
      `      ancla visible clon: ${b ? `${b.tag} y=${b.y} "${b.txt}"` : "—"}\n` +
      `      Δ contra el ancla visible: ${d === null ? "—" : (d > 0 ? "+" : "") + d}` +
      `${a && b && a.txt !== b.txt ? "   ❌ ¡anclas DISTINTAS: el Δ no vale!" : ""}`,
  );
}
if (!ocultos) console.log(`  ✅ el \`h1\` es visible en los dos lados en las ${Object.keys(salida.paginas).length} rutas`);

/* ────────── (c) qué hay entre la cabecera y el `h1`, y cuánto mide ────────── */
console.log(`\n═══ (c) LO QUE VA ENTRE LA CABECERA Y EL \`h1\` @${width}`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const pinta = (lado) => lado.entre.map((n) => `${n.tag}.${n.clase.split(" ")[0] || "—"}=${n.alto}${n.position !== "static" ? `(${n.position})` : ""}`).join(" · ") || "(nada)";
  console.log(`  ${ruta}`);
  console.log(`      orig: ${pinta(v.orig).slice(0, 190)}`);
  console.log(`      clon: ${pinta(v.clon).slice(0, 190)}`);
}

w(`medidas/c-cabecera-${width}${SUFIJO}.json`, salida);

/* ── El veredicto de la pregunta que motivó la corrida ── */
console.log(`\n═══ ¿LAS 11 ANTIGUAS ESTÁN BIEN, O COMPENSADAS?`);
const antiguas = Object.entries(salida.paginas).filter(([r, v]) => !esNueva(r) && !v.error);
const deltaCab = antiguas.map(([, v]) => +(v.clon.cabecera.alto - v.orig.cabecera.alto).toFixed(2));
const deltaH1 = antiguas.map(([, v]) => +(v.clon.h1yCrudo - v.orig.h1yCrudo).toFixed(2));
const cabDistinta = deltaCab.filter((d) => d !== 0).length;
const h1Igual = deltaH1.filter((d) => d === 0).length;
console.log(`  · ${antiguas.length} rutas antiguas · cabecera con Δ≠0 en ${cabDistinta} · \`h1\` con Δ=0 en ${h1Igual}`);
if (cabDistinta > 0 && h1Igual === antiguas.length) {
  console.log(`  ⚠ COMPENSACIÓN: la cabecera difiere y el \`h1\` NO se mueve → hay algo\n` +
    `     absorbiendo el desfase. Son DOS defectos, no cero, y arreglar la\n` +
    `     cabecera sola movería las ${antiguas.length} antiguas.`);
} else if (cabDistinta === 0) {
  console.log(`  ✅ la cabecera mide lo mismo en los dos lados en las antiguas: no hay nada que compensar ahí.`);
}

process.exit(muertos ? 2 : 0);
