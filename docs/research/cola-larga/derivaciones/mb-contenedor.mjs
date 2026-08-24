/**
 * EL DEFECTO DE `mb`: ¿LA FILA O LA COLUMNA? — derivación de la 104.ª, PASO 0·B.
 * Uso: node docs/research/cola-larga/derivaciones/mb-contenedor.mjs
 *
 * ── QUÉ SE PREGUNTA ────────────────────────────────────────────────────────
 * `CLAUDE.md` afirma, con una tabla de 118 módulos detrás:
 *
 *   > **la variable que manda es el ANCHO DE LA FILA, no el tipo de columna**
 *
 * y deja declarada una excepción **SIN PROBAR** en el párrafo siguiente:
 *
 *   > *«por qué una `4_4` de una fila de 911.75 resuelve su 2.75 % contra
 *   >   1238.39 no se ha medido»*
 *
 * `qa:f33-clases` (103.ª) leyó la CASCADA del original y encontró que la regla
 * servida no es un px: es un **porcentaje por REPARTO**, y el selector la
 * resuelve contra la **COLUMNA**:
 *
 *     .et_pb_gutters3 .et_pb_column_1_2 .et_pb_module { margin-bottom: 5.82% }
 *
 * Así que hay dos modelos candidatos para el MISMO dato, y §*dos modelos que
 * predicen lo mismo en todo tu dominio son uno solo* exige contar las
 * **instancias SEPARADORAS** antes de elegir — no el acierto.
 *
 * ── LAS TRES PREGUNTAS DEL ENCARGO, Y LAS TRES SE CONTESTAN CON EL MISMO BARRIDO
 *   (a) ¿reproduce el «% de la COLUMNA» las CUATRO filas de la tabla (35·11·13·59)?
 *   (b) ¿está la regla vieja SOBRE-GENERALIZADA, o sigue siendo cierta en su
 *       dominio y lo único nuevo es el mecanismo? — §*una comprobación
 *       retroactiva se enmarca en las DOS direcciones*
 *   (c) ¿queda explicada la excepción `4_4` de KB?
 *
 * ── LO QUE ESTA DERIVACIÓN **NO** CONTESTA ────────────────────────────────
 * · nada del CLON: es un solo lado, el original medido;
 * · el ancho de 390: allí las columnas apilan a `100% !important` y el `mb`
 *   servido es `30px` — o sea que a 390 no hay porcentaje que resolver y los
 *   dos modelos predicen lo mismo. **0 separadoras a 390 por construcción.**
 * · si hay que TOCAR `mbPorDefecto()`: eso es una decisión, y va con su ficha.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts/qa/medidas");
const lee = (n) => JSON.parse(readFileSync(join(MED, n), "utf8"));

let rojo = 0;
const err = (m) => { rojo++; console.log(`\n❌ ${m}`); };

console.log(`\n══════════════════════════════════════════════════════════════════════`);
console.log(`  EL DEFECTO DE \`mb\`: ¿LA FILA O LA COLUMNA? (104.ª · PASO 0·B)`);
console.log(`══════════════════════════════════════════════════════════════════════`);

/* ══════════════════════════════════════════════════════════════════════════
 * 0 · LOS PORCENTAJES SERVIDOS, leídos de la cascada (no de memoria)
 * ══════════════════════════════════════════════════════════════════════════ */
const CLASES = lee("f33-clases.json");
const PCT = {};
for (const r of CLASES.reglas) {
  const m = /^\.f33-col-(\w+) > \.f33-modulo$/.exec(r.selector);
  if (!m || r.prop !== "margin-bottom") continue;
  const d = (r.declarado1440 ?? []).filter((v) => v.endsWith("%"));
  if (d.length === 1) PCT[m[1]] = parseFloat(d[0]);
  else if (d.length === 0) PCT[m[1]] = null;          /* sin instancias que lleguen al default */
  else err(`\`${m[1]}\` declara MÁS DE UN porcentaje (${d.join(" · ")}): no hay default único.`);
}
console.log(`\n── 0 · LOS PORCENTAJES SERVIDOS (cascada del original, \`qa:f33-clases\`) ──`);
console.log(`   reparto → % declarado @1440, y a qué equivale sobre la FILA:`);
const ANCHO_COL_PCT = { "4_4": 100, "1_2": 47.25, "1_3": 29.6667, "2_3": 64.833, "1_4": 22.75, "1_5": 17.6 };
for (const [rep, pct] of Object.entries(PCT)) {
  if (pct == null) { console.log(`     ${rep.padEnd(5)}  (sin instancias que lleguen al default)`); continue; }
  const colPct = ANCHO_COL_PCT[rep];
  console.log(`     ${rep.padEnd(5)}  ${String(pct).padStart(7)} %  de una columna que es el ${String(colPct).padStart(8)} % de la fila  ⇒  ${(pct * colPct / 100).toFixed(4)} % de la FILA`);
}
if (Object.keys(PCT).length === 0) err(`0 reglas \`.f33-col-* > .f33-modulo | margin-bottom\` en la congelada: eso no es «no existen», es que el patrón no casó (§sondas 4).`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL BARRIDO — cada módulo, con su fila, su columna y su `mb` MEDIDOS
 *
 * Dos arquetipos, que es lo que deshace la confusión de variables: en
 * `articulos-kb` TODAS las filas miden 911.75 (allí «tipo de columna» y «ancho
 * de fila» son indistinguibles), y en SECTOR/MONOGRÁFICO miden 1238.39.
 * ══════════════════════════════════════════════════════════════════════════ */
const modulos = [];

/* — `articulos-kb`: sección → filas → columnas → módulos — */
const KB = lee("kb-spec-1440.json");
for (const [ruta, pg] of Object.entries(KB.articulos)) {
  for (const sec of pg.propias ?? []) {
    for (const fila of sec.filas ?? []) {
      if (!fila.renderizada) continue;                 /* sin caja ⇒ los % no resuelven (§lo que no tiene caja no se puede medir) */
      for (const col of fila.columnas ?? []) {
        if (!col.renderizada) continue;
        const rep = (col.clases ?? []).map((c) => /^et_pb_column_(\d_\d)$/.exec(c)?.[1]).find(Boolean);
        for (const mod of col.modulos ?? []) {
          if (!mod.renderizado) continue;
          modulos.push({
            arq: "articulos-kb", ruta, rep,
            wFila: fila.rect.w, wCol: col.rect.w,
            mb: parseFloat(mod.ritmo.marginBottom),
            clases: mod.clases ?? [],
          });
        }
      }
    }
  }
}

/* — SECTOR/MONOGRÁFICO: secciones[] → filas[] → cols[] → mods[], `clases` en
 *   cadena y el ancho en `w`. Es OTRO esquema que el de KB: se recorre
 *   explícito, no con un recorrido genérico — un recorrido que «casi» casa da
 *   0 sin dar error (§sondas 4), y ya lo dio una vez en esta misma derivación. */
const MONO = lee("mono-modulos-1440.json");
let modsMonoVistos = 0;
for (const [pag, secciones] of Object.entries(MONO)) {
  for (const sec of secciones ?? []) {
    for (const fila of sec.filas ?? []) {
      for (const col of fila.cols ?? []) {
        const rep = String(col.clases ?? "").split(/\s+/).map((c) => /^et_pb_column_(\d_\d)$/.exec(c)?.[1]).find(Boolean);
        for (const mod of col.mods ?? []) {
          modsMonoVistos++;
          if (mod.mb == null || !(fila.w > 0) || !(col.w > 0)) continue;
          modulos.push({
            arq: "SECTOR/MONOGRÁFICO", ruta: pag, rep,
            wFila: fila.w, wCol: col.w,
            mb: parseFloat(mod.mb),
            clases: String(mod.clases ?? "").split(/\s+/),
          });
        }
      }
    }
  }
}
if (modsMonoVistos === 0) err(`0 módulos recorridos en \`mono-modulos-1440.json\`: el recorrido no casó su esquema (§sondas 4). No se puede publicar el reparto con medio dominio fuera.`);

console.log(`\n── 1 · EL BARRIDO ─────────────────────────────────────────────────────`);
const porArq = {};
for (const m of modulos) (porArq[m.arq] ??= []).push(m);
for (const [a, ms] of Object.entries(porArq)) {
  const filas = [...new Set(ms.map((m) => m.wFila))].sort((x, y) => x - y);
  console.log(`   ${a.padEnd(20)} ${String(ms.length).padStart(4)} módulos · anchos de FILA distintos: ${JSON.stringify(filas)}`);
}
if (modulos.length === 0) err(`0 módulos recorridos en los dos arquetipos: el recorrido no casó (§sondas 4).`);

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LOS DOS MODELOS, PREDICIENDO EL MISMO NÚMERO
 *
 *   · TABLA (el vigente): `mbPorDefecto(anchoFila, tipoColumna)` — una tabla
 *     medida, con dos anchos de fila y una excepción para `4_4`;
 *   · %COLUMNA (el nuevo): `pct[reparto] % × anchoColumna`.
 *
 * Se comparan SÓLO sobre los módulos que llegan al DEFAULT — un módulo con
 * override del editor no dice nada del defecto. El discriminador es el mismo
 * que usó `f33-clases`: si el `mb` medido no casa con NINGUNO de los dos
 * modelos, se aparta como `override` y se cuenta.
 * ══════════════════════════════════════════════════════════════════════════ */
const ANCHO_FILA_KB = 911.75, ANCHO_FILA_CASCARON = 1238.39;
const tabla = (wFila, rep) => {
  if (wFila === ANCHO_FILA_CASCARON) return 34.0469;
  if (wFila === ANCHO_FILA_KB) return rep === "4_4" ? 34.0469 : 25.0625;
  return null;                                          /* fila sin medir: la tabla TIRA */
};
const pctCol = (wCol, rep) => (PCT[rep] == null ? null : +(wCol * PCT[rep] / 100).toFixed(4));

const TOL = 0.05;                                       /* px — el redondeo del navegador, no una banda de ruido */
const casa = (a, b) => a != null && b != null && Math.abs(a - b) <= TOL;

const grupos = {};
for (const m of modulos) {
  const t = tabla(m.wFila, m.rep), p = pctCol(m.wCol, m.rep);
  const ct = casa(m.mb, t), cp = casa(m.mb, p);
  const g = `${m.arq} · fila ${m.wFila} · ${m.rep === "4_4" ? "4_4" : "estrecha"}`;
  const G = (grupos[g] ??= { n: 0, tabla: 0, pct: 0, ambos: 0, ninguno: 0, reps: new Set(), cols: new Set(), mbs: new Set(), ejemplos: [] });
  G.n++; G.reps.add(m.rep); G.cols.add(m.wCol); G.mbs.add(m.mb);
  if (ct && cp) G.ambos++; else if (ct) G.tabla++; else if (cp) G.pct++;
  else { G.ninguno++; if (G.ejemplos.length < 3) G.ejemplos.push({ rep: m.rep, wCol: m.wCol, mb: m.mb, t, p }); }
}

console.log(`\n── 2 · LOS DOS MODELOS, GRUPO A GRUPO ─────────────────────────────────`);
console.log(`   «ambos» = las dos predicciones coinciden ⇒ el grupo NO SEPARA (§0 separadoras)`);
console.log(`\n   ${"grupo".padEnd(48)} ${"n".padStart(4)} │ ${"ambos".padStart(5)} ${"sólo T".padStart(6)} ${"sólo %".padStart(6)} ${"ninguno".padStart(7)}   mb medidos`);
for (const [g, G] of Object.entries(grupos).sort()) {
  console.log(`   ${g.padEnd(48)} ${String(G.n).padStart(4)} │ ${String(G.ambos).padStart(5)} ${String(G.tabla).padStart(6)} ${String(G.pct).padStart(6)} ${String(G.ninguno).padStart(7)}   ${JSON.stringify([...G.mbs].sort((a, b) => a - b)).slice(0, 46)}`);
  if (G.ejemplos.length) for (const e of G.ejemplos) console.log(`        ↳ sin casar: ${e.rep} · col ${e.wCol} · mb ${e.mb} · tabla ${e.t} · %col ${e.p}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LAS INSTANCIAS SEPARADORAS — el número que decide, no el acierto
 * ══════════════════════════════════════════════════════════════════════════ */
const conDefault = modulos.filter((m) => {
  const t = tabla(m.wFila, m.rep), p = pctCol(m.wCol, m.rep);
  return casa(m.mb, t) || casa(m.mb, p);
});
const separadoras = conDefault.filter((m) => {
  const t = tabla(m.wFila, m.rep), p = pctCol(m.wCol, m.rep);
  return t != null && p != null && Math.abs(t - p) > TOL;
});
const aciertaTabla = conDefault.filter((m) => casa(m.mb, tabla(m.wFila, m.rep))).length;
const aciertaPct = conDefault.filter((m) => casa(m.mb, pctCol(m.wCol, m.rep))).length;

console.log(`\n── 3 · SEPARADORAS ────────────────────────────────────────────────────`);
console.log(`   módulos barridos ................ ${modulos.length}`);
console.log(`   que llegan al DEFAULT ........... ${conDefault.length}   (los demás llevan override del editor)`);
console.log(`   INSTANCIAS SEPARADORAS .......... ${separadoras.length}   ← el denominador de la elección`);
console.log(`   acierto TABLA (vigente) ......... ${aciertaTabla}/${conDefault.length}`);
console.log(`   acierto %COLUMNA (nuevo) ........ ${aciertaPct}/${conDefault.length}`);
if (separadoras.length) {
  const rep = {};
  for (const m of separadoras) {
    const k = `${m.arq} · ${m.rep} · fila ${m.wFila} · col ${m.wCol}`;
    (rep[k] ??= { n: 0, mb: new Set(), t: tabla(m.wFila, m.rep), p: pctCol(m.wCol, m.rep) });
    rep[k].n++; rep[k].mb.add(m.mb);
  }
  console.log(`\n   dónde separan, y quién gana:`);
  for (const [k, v] of Object.entries(rep).sort()) {
    const ganaT = [...v.mb].every((x) => casa(x, v.t));
    console.log(`     ${k.padEnd(58)} n=${String(v.n).padStart(3)} · mb ${JSON.stringify([...v.mb])} · tabla ${v.t} · %col ${v.p}  ⇒ gana ${ganaT ? "TABLA" : "%COLUMNA"}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA DECLARACIÓN QUE `articulos-kb` SIRVE — leída de SU PROPIA página
 *
 * §El principio: `grep` contesta *«¿existe esta declaración?»*, no *«¿cuál
 * gana?»*. Pero para la pregunta (c) —*¿queda explicada la excepción `4_4`?*—
 * lo que hace falta saber primero es si KB sirve OTRO porcentaje que la cola
 * larga. Si sirviera el mismo, «% de la columna» no puede explicarla, y eso sí
 * lo cierra un `grep` sobre el HTML capturado de KB.
 * ══════════════════════════════════════════════════════════════════════════ */
const KB_HTML = join(RAIZ, "corpus/fase-3/articulos-kb/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision/index.html");
const html = readFileSync(KB_HTML, "utf8");
const servidas = {};
for (const m of html.matchAll(/\.et_pb_gutters(\d) \.et_pb_column_(\d_\d) \.et_pb_module[^{}]*\{margin-bottom:([\d.]+)%\}/g)) {
  servidas[`gutters${m[1]} · ${m[2]}`] = parseFloat(m[3]);
}
console.log(`\n── 4 · LO QUE \`articulos-kb\` SIRVE EN SU PROPIA PÁGINA ────────────────`);
if (Object.keys(servidas).length === 0) err(`0 reglas \`gutters<n> column_<r> .et_pb_module{margin-bottom:%}\` en el HTML de KB: el patrón no casó (§sondas 4).`);
for (const g of ["gutters3", "gutters2"]) {
  const fila = Object.entries(servidas).filter(([k]) => k.startsWith(g)).map(([k, v]) => `${k.split(" · ")[1]} ${v}%`);
  console.log(`   ${g}: ${fila.join("  ·  ")}`);
}
const KB_4_4 = servidas["gutters3 · 4_4"];
console.log(`\n   ⇒ KB sirve para \`gutters3 · 4_4\` el MISMO ${KB_4_4} % que la cola larga.`);
console.log(`     su columna \`4_4\` mide 911.75 ⇒ ${KB_4_4} % predice ${(911.75 * KB_4_4 / 100).toFixed(4)}`);
console.log(`     y el original renderiza                            34.0469  en 59 de 59`);
console.log(`     ⇒ la excepción \`4_4\` de KB NO la explica el contenedor COLUMNA.`);

/* Y el dato que estrecha la pregunta abierta: los DOS arquetipos aterrizan en
 * el MISMO número con columnas distintas. */
const mb44 = {};
for (const m of modulos.filter((x) => x.rep === "4_4" && Math.abs(x.mb - 34.0469) < TOL)) {
  (mb44[`${m.arq} · col ${m.wCol}`] ??= 0), mb44[`${m.arq} · col ${m.wCol}`]++;
}
console.log(`\n   los dos arquetipos, con columnas DISTINTAS, aterrizan en el MISMO 34.0469:`);
for (const [k, n] of Object.entries(mb44).sort()) console.log(`     ${k.padEnd(46)} n=${n}   (${KB_4_4} % de esa columna daría ${(parseFloat(k.split("col ")[1]) * KB_4_4 / 100).toFixed(4)})`);
console.log(`   ⇒ la pregunta abierta ya no es «¿qué VARIABLE manda?» sino`);
console.log(`     «¿contra QUÉ resuelve ese ${KB_4_4} % en KB?» — y 34.0469 / ${KB_4_4 / 100} = ${(34.0469 / (KB_4_4 / 100)).toFixed(2)}`);

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL HALLAZGO LATERAL: el `1_5` de la cola larga sirve el % de GUTTERS2
 *
 * La ficha §F3-3-GUTTERS-SIN-MODELAR dice que `et_pb_gutters2` y `reparto`
 * están confundidos 1:1 y que el reparto es la SOMBRA. Esto lo cruza por otro
 * canal: no por qué filas lo llevan, sino por el VALOR del porcentaje servido.
 * ══════════════════════════════════════════════════════════════════════════ */
console.log(`\n── 5 · CRUCE CON §F3-3-GUTTERS-SIN-MODELAR (otro canal) ───────────────`);
const pct15 = PCT["1_5"];
const g2_15 = servidas["gutters2 · 1_5"], g3_15 = servidas["gutters3 · 1_5"];
console.log(`   la cola larga declara para \`1_5\`: ${pct15} %`);
console.log(`   Divi sirve  gutters2 · 1_5 = ${g2_15} %   ·   gutters3 · 1_5 = ${g3_15} %`);
if (pct15 === g2_15 && g2_15 !== g3_15) {
  console.log(`   ⇒ el valor SERVIDO en la cola larga es el de GUTTERS2, no el de gutters3.`);
  console.log(`     Es el mismo veredicto de la ficha por un canal distinto: el discriminador`);
  console.log(`     es \`gutters2\` y \`reparto\` es su sombra (§un discriminador 1:1 puede ser la sombra de otro).`);
}
const n15 = CLASES.reglas.find((r) => r.selector === ".f33-col-1_5 > .f33-modulo" && r.prop === "margin-bottom")?.n ?? 0;
console.log(`\n   ⚠ DENOMINADOR: n = ${n15}. Con n = 1 esto NO establece nada por sí solo`);
console.log(`     (§un discriminador hallado en UNA SOLA instancia tampoco es un discriminador).`);
console.log(`     Se publica como CRUCE que concuerda, no como prueba.`);

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · ⚠ EL RESIDUO DE ~0.01 NO ES RUIDO: ES LA REJILLA DE 1/64 DE CHROME
 *
 * `TOL = 0.05` estaba tapando algo. `5.82 % × 585.13 = 34.054566` y el original
 * sirve `34.0469` — una diferencia constante de ~0.008 que aparecía en TODAS
 * las predicciones. Chrome guarda la maquetación en `LayoutUnit`, que es
 * **1/64 de px**, y trunca. Si la hipótesis es cierta, la predicción deja de
 * ser aproximada y pasa a ser EXACTA — que es una afirmación mucho más fuerte
 * y, sobre todo, FALSABLE.
 * ══════════════════════════════════════════════════════════════════════════ */
const aRejilla = (x) => Math.floor(x * 64) / 64;
console.log(`\n── 6 · ¿ES LA REJILLA DE 1/64 DE CHROME? ──────────────────────────────`);
let exactos = 0, casiNo = 0;
const fallos = [];
for (const m of conDefault) {
  const p = pctCol(m.wCol, m.rep);
  if (p == null) continue;
  const pred = aRejilla(m.wCol * PCT[m.rep] / 100);
  /* la congelada redondea a 4 decimales: el epsilon tiene que ser el de ESA
   * unidad, no el de la rejilla. Un 1e-6 aquí daba «13 de 114» y era del
   * redondeo del fichero, no del modelo. */
  if (Math.abs(pred - m.mb) < 0.0001) exactos++;
  else { casiNo++; const k = `${m.arq} · ${m.rep} · col ${m.wCol}`; if (!fallos.some((f) => f.k === k)) fallos.push({ k, mb: m.mb, pred, n: 0 }); fallos.find((f) => f.k === k).n++; }
}
console.log(`   predicción = floor(%·columna × 64)/64`);
console.log(`   EXACTOS al bit: ${exactos} de ${exactos + casiNo}   ·   no exactos: ${casiNo}`);
for (const f of fallos) console.log(`     ↳ ${f.k}  n=${f.n} · medido ${f.mb} · predicho ${f.pred}`);

/* Control en la otra dirección: los defaults de SECCIÓN y FILA que `CLAUDE.md`
 * publica (57.5938 · 28.7969) tienen que salir de la MISMA rejilla resolviendo
 * contra 1440 — que es su contenedor real, la sección a ancho completo. Si no
 * salen, la hipótesis de la rejilla es mía y no del navegador. */
const controles = [
  { que: "sección pt/pb 4 % de 1440", pred: aRejilla(1440 * 0.04), esperado: 57.5938 },
  { que: "fila pt/pb 2 % de 1440", pred: aRejilla(1440 * 0.02), esperado: 28.7969 },
  { que: "módulo mb 2.75 % de 1238.39", pred: aRejilla(1238.39 * 0.0275), esperado: 34.0469 },
  { que: "módulo mb 2.75 % de 911.75", pred: aRejilla(911.75 * 0.0275), esperado: 25.0625 },
];
console.log(`\n   CONTROL — los defaults ya publicados en \`CLAUDE.md\`, por la misma rejilla:`);
let ctrlOk = 0;
for (const c of controles) {
  const ok = Math.abs(c.pred - c.esperado) < 0.0001;
  if (ok) ctrlOk++;
  console.log(`     ${ok ? "✓" : "✗"} ${c.que.padEnd(34)} predicho ${String(c.pred).padEnd(12)} publicado ${c.esperado}`);
}
if (ctrlOk !== controles.length) err(`el control de la rejilla falla en ${controles.length - ctrlOk} de ${controles.length}: la hipótesis de 1/64 no está sostenida y la sección 6 no se puede citar.`);
console.log(`\n   ⇒ los 4 defaults publicados salen de floor(% × contenedor × 64)/64, EXACTOS.`);
console.log(`     Y el 25.0625 de las columnas estrechas de KB resulta ser \`2.75 % de 911.75\``);
console.log(`     — o sea el MISMO 2.75 % de la FILA, no un default distinto.`);
console.log(`\n   ⚠ Lo que esto NO explica, y queda igual de abierto: \`4_4\` de KB.`);
console.log(`     Su columna mide 911.75 y la rejilla predice 25.0625 — que es justo lo que`);
console.log(`     miden sus columnas ESTRECHAS. El original sirve 34.0469 en 59 de 59.`);

console.log(`\n${rojo === 0 ? "✅" : "❌"} mb-contenedor: ${rojo} control(es) en rojo\n`);
process.exit(rojo === 0 ? 0 : 2);
