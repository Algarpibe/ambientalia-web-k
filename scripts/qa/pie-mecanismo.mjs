/**
 * POR QUÉ EL ORIGINAL SIRVE TRES PIELES DE PIE — UN NIVEL POR DEBAJO DE LA SECCIÓN.
 * Uso: node scripts/qa/pie-mecanismo.mjs [1440|390]   (npm run qa:pie-mecanismo)
 * Negativo: node scripts/qa/pie-mecanismo.neg.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO BASTA CON LO QUE YA ESTÁ DERIVADO
 *
 * `qa:pie-familias` estableció, **del archivo y sin abrir el original**, que hay
 * **3 pieles** de pie (n = 64 · 12 · 6) y que la CTA es una dimensión ortogonal.
 * Separando contenido de `padding` con el ritmo que el espejo ya trae:
 *
 * | rol | Δ contenido B−A @1440 / @390 | Δ contenido C−A |
 * |---|---|---|
 * | `background` | **0 · 0** | **0 · 0** |
 * | `links` | +85.34 · +266.63 | +87.35 · +261.74 |
 * | `legal` | +22.67 · +97 | 0 · +30 |
 *
 * O sea que **`background` está EXPLICADO** —toda su diferencia es el `padding`
 * de sección, 41 → 156.19 = 41 + 57.5938×2 al céntimo— y **`links` y `legal`
 * NO**: ahí lo que crece es el CONTENIDO, y el espejo **no baja de la sección**.
 *
 * > **Replicar 458.53 y 144.64 sin saber de dónde salen es exactamente el
 * > ARREGLO FALSO que `CLAUDE.md` describe**: cablear el valor de la instancia
 * > que tienes delante, que sigue funcionando hasta que llega la tercera. Por
 * > eso esta sonda existe antes que el cambio, y no después.
 *
 * ── Qué mide, y por qué ESE nivel ─────────────────────────────────────────
 * §*La causa común: el NIVEL al que se mide*. La sección es el contenedor que
 * absorbe; el nivel donde vive la propiedad es **la fila y la columna de Divi**
 * dentro de ella. Se miden, para una página por piel y en el ORIGINAL vivo:
 *
 *   · la FILA de cada sección de pie: ancho, `padding`, cuántas hay;
 *   · sus COLUMNAS: cuántas, qué ancho, qué alto;
 *   · y el nº de RENGLONES de los bloques de texto, contados con `Range`
 *     agrupando por `top` — **no** con `getClientRects().length`, que en un
 *     elemento de bloque devuelve 1 siempre (§el corolario de instrumento).
 *
 * ── Lo que esta sonda NO contesta ─────────────────────────────────────────
 * - **no toca el clon.** Es una medida del original a tres bandas (A · B · C);
 *   quien compara los dos lados es `pie-cmp`;
 * - **no explica la CTA**: es ortogonal y ya está medida a Δ0 por `pie-cmp`;
 * - **no establece el ruido** de estas rutas: sin campaña, un residuo pequeño
 *   es SIN PROBAR.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Censo, Evaluadas, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

const ARGS = process.argv.slice(2);
const width = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);
const mobile = width <= 500;

const ESPEJO_NOMBRE = (ARGS.find((a) => a.startsWith("--espejo=")) || "").slice(9) || `medidas/lh-espejo-${width}.json`;
const ESPEJO_F = join(QA, ESPEJO_NOMBRE);
if (!existsSync(ESPEJO_F)) {
  console.error(`\n❌ NO SE PUDO EVALUAR · no existe ${ESPEJO_NOMBRE}. Sin él no se sabe qué piel es cada forma.\n`);
  process.exit(2);
}
const espejo = JSON.parse(readFileSync(ESPEJO_F, "utf8"));

/**
 * Las representantes salen del ESPEJO, no de una lista a mano (§regla 9, 7.º
 * caso): una piel nueva entraría sola. Se toma **la primera página de cada
 * piel**, y se publica cuántas instancias la sostienen.
 */
const rolDe = (cl) => {
  for (const c of cl || []) {
    if (c === "footer-links") return "links";
    if (c === "footer-legal") return "legal";
    if (c === "footer-background") return "background";
  }
  return "cta";
};
const porPiel = new Map();
for (const v of Object.values(espejo.paginas || {})) {
  const sec = (v.esqueleto?.cascaron || []).filter((s) => s.capa === "tb_footer");
  if (!sec.length) continue;
  const partes = {};
  for (const s of sec) if (rolDe(s.clases) !== "cta") partes[rolDe(s.clases)] = s.rect.h;
  const firma = JSON.stringify(partes);
  if (!porPiel.has(firma)) porPiel.set(firma, { firma, partes, n: 0, formas: new Set(), ruta: v.ruta });
  const e = porPiel.get(firma);
  e.n++;
  e.formas.add(v.forma);
}
const PIELES = [...porPiel.values()].sort((a, b) => b.n - a.n).map((p, i) => ({ ...p, etiqueta: "ABCDEFG"[i], formas: [...p.formas] }));

if (PIELES.length === 0) {
  console.error("\n❌ 0 pieles en el espejo. No se mide, no se escribe y no se da ningún veredicto.\n");
  process.exit(2);
}

/* ───────────────────────── el JS que mide en página ───────────────────── */

const LECTOR = () => {
  const R = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);
  const caja = (el) => {
    const r = el.getBoundingClientRect();
    return { w: R(r.width), h: R(r.height), y: R(r.top + window.scrollY), x: R(r.left) };
  };
  const px = (el, prop) => getComputedStyle(el)[prop];

  /**
   * Renglones DE VERDAD: `getClientRects()` sobre un elemento de bloque
   * devuelve la caja de borde —1 siempre—, así que se usa un `Range` sobre el
   * contenido y se agrupan las cajas por su `top` redondeado.
   */
  const renglones = (el) => {
    try {
      const r = document.createRange();
      r.selectNodeContents(el);
      const tops = new Set();
      for (const c of r.getClientRects()) if (c.width > 0 && c.height > 0) tops.add(Math.round(c.top * 2) / 2);
      return tops.size || null;
    } catch { return null; }
  };

  const rolDeClases = (cl) => {
    if (cl.contains("footer-links")) return "links";
    if (cl.contains("footer-legal")) return "legal";
    if (cl.contains("footer-background")) return "background";
    return "cta";
  };

  const pie = __q("footer.et-l--footer, footer.et-l, footer");
  if (!pie) return { secciones: [] };

  const secs = [...pie.querySelectorAll(".et_builder_inner_content > .et_pb_section")];
  return {
    secciones: secs.map((s) => {
      const filas = [...s.querySelectorAll(":scope > .et_pb_row, :scope > .et_pb_row_inner")];
      return {
        rol: rolDeClases(s.classList),
        rect: caja(s),
        padTop: px(s, "paddingTop"),
        padBottom: px(s, "paddingBottom"),
        nFilas: filas.length,
        filas: filas.map((f) => {
          const cols = [...f.querySelectorAll(":scope > .et_pb_column")];
          return {
            rect: caja(f),
            padTop: px(f, "paddingTop"),
            padBottom: px(f, "paddingBottom"),
            maxWidth: px(f, "maxWidth"),
            nCols: cols.length,
            cols: cols.map((c) => {
              /* Los módulos de texto de la columna, con sus renglones: es donde
                 vive el alto cuando el ritmo no lo explica. */
              const mods = [...c.querySelectorAll(":scope > .et_pb_module")];
              return {
                rect: caja(c),
                nModulos: mods.length,
                modulos: mods.map((m) => ({
                  clase: (m.className || "").split(/\s+/).filter((x) => /^et_pb_(text|widget|button|image|menu|social)/.test(x))[0] || null,
                  rect: caja(m),
                  mb: px(m, "marginBottom"),
                  renglones: renglones(m),
                  fs: px(m, "fontSize"),
                  lh: px(m, "lineHeight"),
                })),
              };
            }),
          };
        }),
      };
    }),
  };
};

/* ───────────────────────────── la corrida ─────────────────────────────── */

const { browser } = await launch();
const censo = new Censo();
const salida = {
  meta: {
    fecha: hoy(),
    width,
    que: "el mecanismo de las 3 pieles de pie, un nivel por debajo de la sección",
    lado: "SÓLO el original vivo (kunakair.com). El clon lo compara pie-cmp",
    unidad: "la FILA y la COLUMNA dentro de cada sección de pie",
    noMide: [
      "el clon: esta sonda es de un lado",
      "la CTA: es ortogonal y pie-cmp ya la mide a Δ0",
      "el ruido de estas rutas: sin campaña, un residuo pequeño es SIN PROBAR",
    ],
  },
  pieles: {},
};

const ev = new Evaluadas({ nombre: `pie-mecanismo @${width}`, unidad: "pieles", minimo: PIELES.length, porPaginas: true });

for (const piel of PIELES) {
  const url = `https://kunakair.com${piel.ruta}`;
  try {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    try {
      await settle(page);
      const { datos } = await censo.medir(page, LECTOR);
      salida.pieles[piel.etiqueta] = { ruta: url, n: piel.n, formas: piel.formas, partes: piel.partes, ...datos };
    } finally {
      await page.close();
    }
  } catch (e) {
    salida.pieles[piel.etiqueta] = { ruta: url, error: String(e && e.message ? e.message : e) };
  }
}

await browser.close();
const muertos = censo.informe(`@${width}`);

w(`medidas/pie-mecanismo-${width}.json`, salida);

/* ─────────────────────────────── informe ─────────────────────────────── */

console.log(`\n═══ EL MECANISMO DE LAS PIELES DE PIE @${width} · ${PIELES.length} pieles ═══\n`);
for (const [et, p] of Object.entries(salida.pieles)) {
  if (p.error) { console.log(`  ${et}: ERROR ${p.error.slice(0, 90)}`); continue; }
  console.log(`── piel ${et} · n=${p.n} · ${p.formas.join(" ")} · ${p.ruta}`);
  for (const s of p.secciones) {
    if (s.rol === "cta") continue;
    console.log(`   ${s.rol.padEnd(11)} h=${String(s.rect.h).padStart(8)} pt=${s.padTop} pb=${s.padBottom} · ${s.nFilas} fila(s)`);
    for (const f of s.filas) {
      console.log(`       fila w=${String(f.rect.w).padStart(8)} h=${String(f.rect.h).padStart(8)} maxW=${f.maxWidth} pt=${f.padTop} pb=${f.padBottom} · ${f.nCols} col(s)`);
      for (const c of f.cols) {
        const rg = c.modulos.map((m) => m.renglones).filter((x) => x != null);
        console.log(`         col w=${String(c.rect.w).padStart(7)} h=${String(c.rect.h).padStart(8)} · ${c.nModulos} mód · renglones ${rg.join(",") || "—"}`);
      }
    }
  }
  console.log("");
}

const conError = Object.values(salida.pieles).filter((p) => p.error).length;
if (conError) console.error(`\n❌ ${conError} de ${PIELES.length} pieles cayeron con error.`);

console.log(`  ✓ evaluadas ${PIELES.length - conError}/${PIELES.length} pieles · mecanismo del pie\n`);
process.exitCode = muertos > 0 || conError > 0 ? 1 : 0;
