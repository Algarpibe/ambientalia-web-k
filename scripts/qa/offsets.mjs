/**
 * OFFSETS — medir al nivel donde vive la propiedad, no al que la contiene.
 * Uso: node offsets.mjs <ruta> [ancho] [--cmp <otraRuta>]
 *
 *   node offsets.mjs /sectores/calidad-del-aire-en-las-ciudades 1440
 *   node offsets.mjs /sectores/a 390 --cmp /sectores/b
 *
 * ── Por qué existe: hay defectos que NINGÚN alto puede ver ─────────────────
 * `CLAUDE.md` §El principio. Un contenedor más alto que su contenido **absorbe**
 * lo que le pase dentro: el alto sale idéntico y el defecto sigue ahí. Medido,
 * no supuesto:
 *
 * | el defecto | lo tapaba | se vio midiendo |
 * |---|---|---|
 * | claim centrado vs pegado arriba (**121.03 → 0**) | la fila: centrado o arriba, mide lo mismo | el **offset del claim dentro de su fila** |
 * | `<p>` → `<h2>` (+10 de `padding-bottom`) | la columna hermana, 390.08 de alto contra 148 | el alto **del módulo**, no de la fila |
 *
 * O sea: **una medición tomada a un nivel que puede absorber el error no es una
 * medición.** Esta sonda baja al nivel donde vive cada propiedad y reporta lo
 * que los árboles de alturas no reportan:
 *
 *   · el **offset** de cada nodo dentro de su padre (un 0 esperado que no es 0,
 *     o al revés, es la firma del centrado y de los márgenes de columna);
 *   · si una columna **estira** (alto de columna ≠ alto de su contenido) — que es
 *     literalmente "aquí cabe un error sin que se note";
 *   · el `align-items` de la fila, que es quien decide lo anterior;
 *   · por módulo: etiqueta, `letter-spacing`, `padding-bottom` y `margin-bottom`
 *     — las cuatro que cambian de valor sin cambiar el alto de la fila.
 *
 * Nació como `exp-detalle.mjs` del experimento Urbano (acta en
 * `docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md` §8), cableada a esas
 * dos rutas. Generalizada el **2026-07-30**: el hallazgo no era del experimento,
 * era del método. La salida congelada de aquella corrida se queda en
 * `medidas/exp-detalle-{1440,390}.json` como evidencia del experimento.
 *
 * Solo necesita el clon servido: es determinista y no toca el original.
 */
import { env, launch, openPage, settle, w, ruta } from "./lib.mjs";

const BASE = process.env.CLON || "http://localhost:3000";
const args = process.argv.slice(2);
const iCmp = args.indexOf("--cmp");
// `ruta()` deshace la traducción de MSYS y acepta la ruta con o sin barra
// inicial: `/sectores/x`, `sectores/x` o el `C:/Program Files/Git/sectores/x`
// que Git Bash fabrica a partir de la primera. Ver `lib.mjs`.
const rutaB = iCmp >= 0 ? ruta(args[iCmp + 1]) : null;
const libres = (iCmp >= 0 ? args.slice(0, iCmp) : args).filter(Boolean);
const rutaA = ruta(libres[0]);
const width = Number(libres[1] || 1440);
const mobile = width <= 500;

if (!rutaA) {
  console.error("Uso: node offsets.mjs <ruta> [ancho] [--cmp <otraRuta>]");
  process.exit(2);
}

const extraer = function () {
  const r = (n) => Math.round(n * 100) / 100;
  const t = (el, n = 30) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? v : Math.round(n * 100) / 100;
  };

  /* el corte del cuerpo, con el ancla correcta (E1) */
  const todas = [...document.querySelectorAll("main > section")];
  const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
  let iCorte = -1;
  for (let i = iHero + 1; i < todas.length; i++) {
    if (todas[i].querySelector("[aria-roledescription='carrusel'], .swiper")) {
      iCorte = i;
      break;
    }
  }
  const aviso =
    iHero < 0
      ? "no se localizó el hero"
      : iCorte <= iHero
        ? "no se localizó el slider: el cuerpo NO está delimitado"
        : null;
  const secs = todas.slice(iHero + 1, iCorte > iHero ? iCorte : undefined);

  /**
   * Offset del borde superior de `el` respecto al **borde de contenido** de
   * `padre` — con su `padding-top` descontado.
   *
   * Contra el borde exterior, el `padding-top` de la fila (28.7969) entraba en
   * el número y la sonda cantaba "¿centrado vertical?" en filas que solo tenían
   * el ritmo de la plantilla. Un falso positivo en una sonda de holgura es
   * especialmente caro: enseña a ignorar sus avisos.
   */
  const off = (el, padre) =>
    r(
      el.getBoundingClientRect().top -
        padre.getBoundingClientRect().top -
        parseFloat(getComputedStyle(padre).paddingTop || 0),
    );

  /** Alto real del contenido de un contenedor: del primer hijo al último. */
  const altoContenido = (el) => {
    const hijos = [...el.children].filter((h) => {
      const s = getComputedStyle(h);
      return s.position !== "absolute" && s.display !== "none";
    });
    if (!hijos.length) return 0;
    const arr = hijos.map((h) => h.getBoundingClientRect());
    return r(Math.max(...arr.map((b) => b.bottom)) - Math.min(...arr.map((b) => b.top)));
  };

  return {
    aviso,
    secciones: secs.map((sec, i) => ({
      i,
      h: r(sec.getBoundingClientRect().height),
      filas: [...sec.querySelectorAll(":scope > div")].map((fila, j) => {
        /**
         * ── Dónde está el nivel de COLUMNA, que no es el mismo en los dos
         * cuerpos del clon ────────────────────────────────────────────────
         *
         * `MonoCuerpo` monta `fila > flex > columnas`. `SectorBody` NO: cada
         * bloque aporta su propio envoltorio, así que ahí las columnas cuelgan
         * del primer hijo solo si ese hijo es un flex.
         *
         * Se **detecta y se dice cuál** (`nivel`), en vez de asumir uno: dar
         * por columna lo que es el interior de un `CtaDescarga` produce un
         * informe plausible y falso — el mismo fallo que E1.
         */
        const primero = fila.firstElementChild;
        const esFlex = primero && /flex/.test(getComputedStyle(primero).display);
        const contenedor = esFlex ? primero : fila;
        const nivel = esFlex ? "flex" : "directo";
        const cols = [...contenedor.children].filter(
          (c) => getComputedStyle(c).position !== "absolute",
        );
        const sCont = getComputedStyle(contenedor);
        return {
          j,
          h: r(fila.getBoundingClientRect().height),
          txt: t(fila, 34),
          nivel,
          // QUIÉN decide si las columnas estiran. Sin esto, el "estira" es un
          // síntoma sin causa.
          alignItems: sCont.alignItems,
          /**
           * Y en qué eje. **A 390 las columnas apilan**, así que el offset de la
           * segunda es la altura de la primera: normal, no alineación. Sin este
           * dato la sonda cantaba "OFFSET 685.16" en una fila intacta, que es el
           * tipo de aviso que enseña a ignorar los avisos.
           */
          flexDirection: /flex/.test(sCont.display) ? sCont.flexDirection : "apilado",
          columnas: cols.map((col, k) => {
            const hCol = r(col.getBoundingClientRect().height);
            const hCont = altoContenido(col);
            return {
              k,
              h: hCol,
              // Offset dentro de su CONTENEDOR REAL, no de la fila: medirlo
              // contra la fila mete su `padding-top` (28.7969) en el número y
              // saca "centrado vertical" en las cinco filas que no lo están.
              off: off(col, contenedor),
              hContenido: hCont,
              /**
               * Holgura: lo que esta columna puede absorber sin que el alto de
               * la fila se mueva.
               *
               * Se descuenta su propio `padding` vertical, que no es holgura:
               * sin descontarlo, una caja con `padding: 40px` salía "absorbe 82"
               * — y una sonda de holgura que grita en cajas normales no sirve.
               */
              absorbe: r(
                hCol -
                  parseFloat(getComputedStyle(col).paddingTop || 0) -
                  parseFloat(getComputedStyle(col).paddingBottom || 0) -
                  hCont,
              ),
              mb: px(getComputedStyle(col).marginBottom),
              modulos: [...col.children]
                .filter((m) => getComputedStyle(m).position !== "absolute")
                .map((m, l) => {
                  const hijo = m.firstElementChild;
                  // La tipografía se lee del elemento que la lleva —el heading
                  // dentro del envoltorio de módulo—, pero la ETIQUETA que se
                  // reporta es la del módulo Y la de dentro: reportar solo la
                  // interna decía `SPAN` donde el original tiene un `<p>`, que
                  // es justo la propiedad que el experimento midió.
                  const s = getComputedStyle(hijo || m);
                  return {
                    l,
                    tag: hijo ? `${m.tagName}>${hijo.tagName}` : m.tagName,
                    h: r(m.getBoundingClientRect().height),
                    off: off(m, col),
                    mb: px(getComputedStyle(m).marginBottom),
                    // las cuatro que cambian sin cambiar el alto de la fila
                    pb: px(s.paddingBottom),
                    ls: s.letterSpacing,
                    fs: px(s.fontSize),
                    lh: px(s.lineHeight),
                    txt: t(m),
                  };
                }),
            };
          }),
        };
      }),
    })),
  };
};

const { browser } = await launch();
// el parámetro NO se llama `ruta`: taparía el import del mismo nombre
async function medir(destino) {
  const { page } = await openPage(browser, BASE + destino, {
    width,
    height: mobile ? 844 : 900,
    mobile,
  });
  await settle(page);
  const out = await page.evaluate(extraer);
  await page.close();
  return out;
}
const A = await medir(rutaA);
const B = rutaB ? await medir(rutaB) : null;
await browser.close();

if (A.aviso) console.error(`\n❌ ${rutaA}: ${A.aviso}`);
if (B?.aviso) console.error(`\n❌ ${rutaB}: ${B.aviso}`);

/* ─────────────────────────── informe ───────────────────────────────────── */

const sig = (n) => (n > 0 ? `+${n}` : String(n));

console.log(`\n════════ ${rutaA} @${width} ════════`);
/** Lo que ningún alto de fila puede ver: se lista aparte y por delante. */
const senales = [];

for (const sec of A.secciones) {
  console.log(`\nSEC ${sec.i}   h ${sec.h}`);
  for (const fila of sec.filas) {
    console.log(
      `  F${fila.j}  h ${String(fila.h).padStart(8)}  align-items ${fila.alignItems}` +
        `  eje ${fila.flexDirection}  columnas:${fila.nivel}  | ${fila.txt}`,
    );
    for (const col of fila.columnas) {
      const estira = col.absorbe > 0.01;
      if (estira)
        senales.push(
          `SEC${sec.i}/F${fila.j}/C${col.k} ABSORBE ${col.absorbe} (columna ${col.h} · contenido ${col.hContenido})`,
        );
      // Solo en el eje horizontal: apiladas, el offset ES la suma de las de
      // arriba y no dice nada de alineación.
      if (col.off > 0.01 && fila.flexDirection === "row")
        senales.push(
          `SEC${sec.i}/F${fila.j}/C${col.k} OFFSET ${col.off} dentro de su contenedor` +
            ` (align-items: ${fila.alignItems})`,
        );
      console.log(
        `    C${col.k}  h ${String(col.h).padStart(8)}  off ${String(col.off).padStart(7)}` +
          `  contenido ${String(col.hContenido).padStart(8)}` +
          `  absorbe ${String(col.absorbe).padStart(7)}${estira ? " ⚠" : ""}` +
          `  mb ${col.mb}`,
      );
      for (const m of col.modulos) {
        console.log(
          `      M${m.l}  ${m.tag.padEnd(4)} h ${String(m.h).padStart(8)}  off ${String(m.off).padStart(7)}` +
            `  mb ${String(m.mb).padStart(8)}  pb ${String(m.pb).padStart(6)}` +
            `  ls ${String(m.ls).padStart(7)}  ${m.fs}/${m.lh}  | ${m.txt}`,
        );
      }
    }
  }
}

if (senales.length) {
  console.log(`\n── ⚠ HOLGURA: aquí cabe un error sin que el alto de la fila se mueva ──`);
  senales.forEach((s) => console.log(`  ${s}`));
  console.log(
    `  ↑ no son defectos por sí mismos. Son los sitios donde un defecto NO se vería\n` +
      `    en el árbol de alturas: hay que medir el módulo, no la fila.`,
  );
} else {
  console.log(`\n✅ ninguna columna con holgura: aquí el alto de la fila sí es concluyente.`);
}

/* ── comparación de dos rutas, módulo a módulo y por offset ── */
if (B) {
  console.log(`\n════════ ${rutaA}  →  ${rutaB}  @${width} ════════`);
  let dif = 0;
  const nS = Math.max(A.secciones.length, B.secciones.length);
  for (let i = 0; i < nS; i++) {
    const sa = A.secciones[i],
      sb = B.secciones[i];
    if (!sa || !sb) {
      console.log(`SEC ${i}  ${sa ? "FALTA en B" : "SOBRA en B"}`);
      dif++;
      continue;
    }
    const nF = Math.max(sa.filas.length, sb.filas.length);
    for (let j = 0; j < nF; j++) {
      const fa = sa.filas[j],
        fb = sb.filas[j];
      if (!fa || !fb) {
        console.log(`  F${j}  ${fa ? "FALTA en B" : "SOBRA en B"}`);
        dif++;
        continue;
      }
      if (fa.alignItems !== fb.alignItems) {
        console.log(`  SEC${i}/F${j}  align-items ${fa.alignItems} → ${fb.alignItems}  ❌`);
        dif++;
      }
      const nC = Math.max(fa.columnas.length, fb.columnas.length);
      for (let k = 0; k < nC; k++) {
        const ca = fa.columnas[k],
          cb = fb.columnas[k];
        if (!ca || !cb) {
          console.log(`    C${k}  ${ca ? "FALTA en B" : "SOBRA en B"}`);
          dif++;
          continue;
        }
        if (ca.off !== cb.off) {
          console.log(`    SEC${i}/F${j}/C${k}  OFFSET ${ca.off} → ${cb.off}  Δ${sig(+(cb.off - ca.off).toFixed(2))}  ❌`);
          dif++;
        }
        const nM = Math.max(ca.modulos.length, cb.modulos.length);
        for (let l = 0; l < nM; l++) {
          const ma = ca.modulos[l],
            mb = cb.modulos[l];
          if (!ma || !mb) {
            console.log(`      M${l}  ${ma ? "FALTA en B" : "SOBRA en B"}  "${(ma || mb).txt}"`);
            dif++;
            continue;
          }
          const cambios = [];
          for (const k2 of ["tag", "h", "off", "mb", "pb", "ls", "fs", "lh"])
            if (String(ma[k2]) !== String(mb[k2])) cambios.push(`${k2} ${ma[k2]} → ${mb[k2]}`);
          if (cambios.length) {
            dif++;
            console.log(`      SEC${i}/F${j}/C${k}/M${l}  "${ma.txt}"`);
            cambios.forEach((c) => console.log(`          ${c}`));
          }
        }
      }
    }
  }
  console.log(
    `\n${dif === 0 ? "✅ IDÉNTICAS al nivel del módulo" : `❌ ${dif} diferencia(s)`} · umbral CERO (clon contra clon)`,
  );
  w(env("SALIDA") || `medidas/offsets-cmp-${width}.json`, {
    meta: { rutaA, rutaB, width },
    A,
    B,
  });
  process.exit(dif === 0 ? 0 : 1);
}

w(
  env("SALIDA") ||
    `medidas/offsets-${rutaA.replace(/^\/|\/$/g, "").replace(/\//g, "-")}-${width}.json`,
  { meta: { ruta: rutaA, width }, A },
);
process.exit(A.aviso ? 1 : 0);
