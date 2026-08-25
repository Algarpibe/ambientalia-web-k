/* doch-por-composicion — 105.ª tanda, 2026-08-25. ESCALÓN 2.
 *
 * LA PREGUNTA: `docH` sale distinto en **31 de 31** rutas. Un `docH` es un
 * TOTAL, o sea el nivel de arriba de todo lo demás —§*Alturas: se mide por
 * composición; el total sólo dice si cuadra, la composición dice qué*—, y un
 * Δ de total puede ser dos errores que se anulan.
 *
 * Se parte en TRES tramos que **existen en los dos lados**:
 *
 *     docH  =  TECHO  +  CUERPO  +  PIE
 *              ↑          ↑          ↑
 *     y de la   fondo de la    lo que queda por
 *     1.ª sec   última sec     debajo de la última
 *
 * ⚠ **Y NO se usa `cascaron`**, aunque esta tanda lo haya medido: sus cuatro
 * anclas (`#page-container`·`#et-main-area`·`#main-content`·`[id$=-sidebar]`)
 * salen **31·31·31·7 en el ORIGINAL y 0·0·0·0 en el CLON**. Comparar un tramo
 * que sólo un lado tiene no es comparar: es publicar el original con el clon a
 * `null`, que es justo el eje MIXTO del que este repo ya se defiende. El
 * cascarón vale para ATRIBUIR dentro del original —y ahí se usa, §3— no para
 * el Δ.
 *
 * ── SÓLO SECCIONES CON CAJA ────────────────────────────────────────────────
 * §*lo que no tiene caja no es que no se cuente — es que no se puede medir, y
 * aun así devuelve números*. Las secciones dentro de un popup cerrado computan
 * `{0,0,0,0}`; meterlas en un `min(y)` daría **techo 0** en las 5 rutas `BT`
 * que las tienen, y de ahí un Δ inventado del tamaño de la cabecera entera.
 * El criterio de caja es el del congelado (`w > 0`).
 *
 * ── CONTROLES ──────────────────────────────────────────────────────────────
 *   1. IDENTIDAD — `Δtecho + Δcuerpo + ΔdocH_pie` tiene que sumar `ΔdocH`
 *      exacto en las 31 y a los dos anchos. Es aritmética, así que un fallo
 *      aquí es de la derivación y **nada de lo que siga vale**;
 *   2. una ruta SIN ninguna sección con caja sale NOMBRADA y fuera del
 *      denominador — no se le inventa un techo;
 *   3. los dos anchos, y el reparto se publica por RÉGIMEN.
 *
 * ── LO QUE **NO** CONTESTA ─────────────────────────────────────────────────
 *   · no dice si un tramo es defecto: dice EN QUÉ TRAMO cae el Δ;
 *   · no toca `base` más que para publicarlo con sus dos lados;
 *   · los 47 módulos que faltan (ESCALÓN 1) están DENTRO del cuerpo: este
 *     reparto no los descuenta, los localiza.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const lee = (n) => JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas", n), "utf8"));

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };
const n2 = (x) => (x === null || x === undefined ? "    —" : x.toFixed(2).padStart(9));

say("═══ doch-por-composicion — 105.ª tanda, 2026-08-25 · ESCALÓN 2");
say("    docH = TECHO + CUERPO + PIE, con las anclas que tienen LOS DOS lados.");
say("");

let malo = 0;
const porAncho = {};

for (const ANCHO of [1440, 390]) {
  const cmp = lee(`f33-cmp-${ANCHO}.json`);
  const filas = [];
  const sinCaja = [];

  for (const [ruta, v] of Object.entries(cmp.paginas)) {
    if (!v.clon) continue;
    const tramos = (lado) => {
      const cajas = Object.values(lado.cajas ?? {}).filter((c) => c.w > 0);
      if (!cajas.length) return null;
      const techo = Math.min(...cajas.map((c) => c.y));
      const fondo = Math.max(...cajas.map((c) => c.y + c.h));
      return { techo, cuerpo: fondo - techo, pie: lado.docH - fondo };
    };
    const o = tramos(v.original), c = tramos(v.clon);
    if (!o || !c) { sinCaja.push(ruta); continue; }

    /* CONTROL 1 — identidad aritmética */
    const suma = (c.techo - o.techo) + (c.cuerpo - o.cuerpo) + (c.pie - o.pie);
    const dTotal = v.clon.docH - v.original.docH;
    if (Math.abs(suma - dTotal) > 0.02) {
      malo++;
      say(`  ⛔ IDENTIDAD ROTA @${ANCHO} ${ruta}: tramos ${suma.toFixed(2)} ≠ docH ${dTotal.toFixed(2)}`);
    }
    filas.push({
      ruta, reg: v.regimen, dTotal,
      dTecho: c.techo - o.techo, dCuerpo: c.cuerpo - o.cuerpo, dPie: c.pie - o.pie,
      oTecho: o.techo, cTecho: c.techo, oPie: o.pie, cPie: c.pie,
      oBase: v.original.base, cBase: v.clon.base,
    });
  }
  porAncho[ANCHO] = { filas, sinCaja };
}

say("═══ 0 · CONTROLES");
for (const a of [1440, 390]) {
  const p = porAncho[a];
  say(`  @${a}  descompuestas ${p.filas.length} · sin ninguna sección con caja: ${p.sinCaja.length}${p.sinCaja.length ? " → " + p.sinCaja.join(" · ") : ""}`);
  if (p.filas.length === 0) { say(`  ⛔ @${a} CERO rutas descompuestas`); malo++; }
}
say(`  identidad aritmética rota en: ${malo} caso(s)`);
say("");

for (const ANCHO of [1440, 390]) {
  const { filas } = porAncho[ANCHO];
  say(`═══ 1 · @${ANCHO} — DÓNDE CAE EL Δ DE \`docH\`, por tramo`);
  const cae = { techo: 0, cuerpo: 0, pie: 0 };
  for (const f of filas) {
    if (Math.abs(f.dTecho) >= 0.01) cae.techo++;
    if (Math.abs(f.dCuerpo) >= 0.01) cae.cuerpo++;
    if (Math.abs(f.dPie) >= 0.01) cae.pie++;
  }
  say(`  rutas con Δ ≠ 0 en TECHO ${cae.techo}/${filas.length} · CUERPO ${cae.cuerpo}/${filas.length} · PIE ${cae.pie}/${filas.length}`);
  const suma = (k) => filas.reduce((a, f) => a + f[k], 0);
  say(`  Δ acumulado:  techo ${suma("dTecho").toFixed(2)} · cuerpo ${suma("dCuerpo").toFixed(2)} · pie ${suma("dPie").toFixed(2)} · TOTAL ${suma("dTotal").toFixed(2)}`);
  /* el TECHO por valor, no por Δ: si es constante en cada lado, es cascarón */
  const vt = (k) => [...new Set(filas.map((f) => f[k].toFixed(2)))];
  say(`  valores distintos de TECHO — original: ${vt("oTecho").join(" · ")}`);
  say(`                              clon:     ${vt("cTecho").join(" · ")}`);
  say(`  valores distintos de PIE   — original: ${vt("oPie").join(" · ")}`);
  say(`                              clon:     ${vt("cPie").join(" · ")}`);
  say("");
  say(`  ruta                                                    reg   ΔdocH    Δtecho   Δcuerpo     Δpie`);
  for (const f of [...filas].sort((a, b) => Math.abs(b.dTotal) - Math.abs(a.dTotal)))
    say(`  ${f.ruta.slice(0, 54).padEnd(54)} ${f.reg.padEnd(3)} ${n2(f.dTotal)} ${n2(f.dTecho)} ${n2(f.dCuerpo)} ${n2(f.dPie)}`);
  say("");
}

/* ── LA BASE, con sus dos lados y su caso declarado ───────────────────────── */
say("═══ 2 · LA BASE EN CRUDO — con sus DOS lados, y el caso que NO es un Δ");
say("    §Notas de método: cada arquetipo mide su base sin corregir UNA vez.");
for (const ANCHO of [1440, 390]) {
  const cmp = lee(`f33-cmp-${ANCHO}.json`);
  const sinAncla = [], dist = [];
  for (const [ruta, v] of Object.entries(cmp.paginas)) {
    if (!v.clon) continue;
    const o = v.original.base, c = v.clon.base;
    if (o === 0 || o === null) { sinAncla.push({ ruta, reg: v.regimen, o, c }); continue; }
    if (Math.abs(o - c) >= 0.01) dist.push({ ruta, reg: v.regimen, o, c });
  }
  say(`  @${ANCHO}  con Δ ≠ 0: ${dist.length} · SIN ANCLA en el original (\`base\` 0/null): ${sinAncla.length}`);
  for (const x of sinAncla)
    say(`     ℹ ${x.ruta} [${x.reg}]  orig ${x.o} → clon ${x.c}  ← el \`h1\` del original vive en fila SIN CAJA: no hay ancla que comparar. NO es un Δ del clon`);
  for (const x of dist.sort((a, b) => Math.abs(b.c - b.o) - Math.abs(a.c - a.o)).slice(0, 12))
    say(`     · ${x.ruta.slice(0, 52).padEnd(52)} [${x.reg}] orig ${n2(x.o)} → clon ${n2(x.c)}  Δ${(x.c - x.o).toFixed(2)}`);
  say("");
}

/* ── EL SUELO DEL CASCARÓN, dentro del original ───────────────────────────── */
say("═══ 3 · EL SUELO DE `#main-content` — por qué CINCO rutas dan `docH 1497` a 1440");
say("    Esto NO es un Δ: es atribución DENTRO del original (el clon no tiene estas anclas).");
for (const ANCHO of [1440, 390]) {
  const cmp = lee(`f33-cmp-${ANCHO}.json`);
  const bt = Object.entries(cmp.paginas).filter(([, v]) => v.regimen === "BT" && v.original.cascaron?.contenido);
  const resto = [...new Set(bt.map(([, v]) => (v.original.docH - v.original.cascaron.contenido.h).toFixed(2)))];
  const conts = [...new Set(bt.map(([, v]) => v.original.cascaron.contenido.h))];
  const barras = [...new Set(bt.map(([, v]) => v.original.cascaron.barra?.h ?? null))];
  say(`  @${ANCHO}  n = ${bt.length} rutas BT`);
  say(`     docH − #main-content.h : ${resto.join(" · ")}   ⇐ el cascarón, CONSTANTE`);
  say(`     #main-content.h        : ${conts.map((x) => x.toFixed(2)).join(" · ")}`);
  say(`     barra lateral .h       : ${barras.map((x) => (x === null ? "null" : x.toFixed(2))).join(" · ")}`);
  const cnt = {};
  for (const [, v] of bt) { const k = v.original.cascaron.contenido.h.toFixed(2); cnt[k] = (cnt[k] || 0) + 1; }
  const rep = Object.entries(cnt).filter(([, n]) => n > 1);
  say(`     valores de #main-content.h con MÁS de una ruta: ${rep.length ? rep.map(([k, n]) => `${k} ×${n}`).join(" · ") : "ninguno"}`);
  say("");
}

/* ── ⚠⚠ EL ARTEFACTO QUE INVALIDA EL EJE ──────────────────────────────────
 * §*una captura sin sus hojas no es la página*: aquí no son las hojas, son las
 * IMÁGENES, y el modo de fallo es idéntico —no da error, da una medida
 * plausible—. La captura conserva `src` absolutos a `kunakair.com`, y la sonda
 * **aborta todo lo que no sea `file:` o `data:`**… pero `setRequestInterception`
 * está puesto en UN SOLO LADO. O sea que el original mide con las imágenes
 * ROTAS y el clon con las suyas cargadas: los dos lados **no se midieron en las
 * mismas condiciones**. */
say("═══ 4 · ⚠ EL ARTEFACTO DE IMAGEN — los dos lados NO se miden igual");
for (const ANCHO of [1440, 390]) {
  const cmp = lee(`f33-cmp-${ANCHO}.json`);
  let so = 0, sc = 0, rotas = 0, tot = 0, bloq = 0;
  for (const [, v] of Object.entries(cmp.paginas)) {
    bloq += v.hojas.peticionesBloqueadas;
    for (const m of v.original.modulos ?? []) if (m.tipo === "image") { tot++; so += m.h; if (m.h === 16) rotas++; }
    for (const m of v.clon?.modulos ?? []) if (m.tipo === "imagen-pagina") sc += m.h;
  }
  say(`  @${ANCHO}  imágenes del original ${tot} · a EXACTAMENTE 16 px (alto de \`<img>\` roto): ${rotas}`);
  say(`      suma de altos  orig ${so.toFixed(2)}  ·  clon ${sc.toFixed(2)}  ·  Δ +${(sc - so).toFixed(2)}`);
  say(`      peticiones ABORTADAS en el lado del original: ${bloq} (en el del clon: 0 — no hay intercepción)`);
  const cuerpo = porAncho[ANCHO].filas.reduce((a, f) => a + f.dCuerpo, 0);
  say(`      Δcuerpo acumulado: ${cuerpo.toFixed(2)}  ⇒ el artefacto vale el ${((sc - so) / cuerpo * 100).toFixed(0)} % de él`);
}
say("");
say("  ⇒ `docH`, `caja.*.h` y todo alto de módulo con imagen dentro quedan NO ADJUDICABLES.");
say("    A 390 el artefacto (+9861) es MAYOR que el Δcuerpo total (+4919): hay efectos de");
say("    signo contrario debajo, así que el total no se puede leer (§dos errores que se anulan).");
say("");

writeFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/doch-por-composicion.log"), L.join("\n") + "\n");
console.log("  → doch-por-composicion.log");
if (malo) { console.error(`\n⛔ ${malo} control(es) en rojo: la derivación NO vale`); process.exit(2); }
