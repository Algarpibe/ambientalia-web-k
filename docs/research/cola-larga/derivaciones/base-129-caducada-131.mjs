// 131.ª · PASO 0 punto 4 — §regla 5bis sobre la LINEA BASE de la 129.ª
//
// «Arreglar un instrumento no arregla sus medidas: LAS CADUCA.» La 130.ª cerro
// el `srcset` del lado del original, que es un cambio DEL INSTRUMENTO (la
// referencia pasa a pintar imagenes que antes no pintaba). Toda congelada de
// `productos-cmp` anterior a ese arreglo esta tomada con OTRO instrumento.
//
// LO QUE HAY QUE DERIVAR NO ES «esta mal»: es EL ALCANCE, con su numero.
// §regla 5bis: «el alcance del daño se declara con su número, y casi nunca es
// «todo»: aqui era SOLO el campo `extracto` — geometria, ritmo y arbol seguian
// valiendo, y decir «el espejo esta mal» habria tirado una medida buena».
//
// ⚠ Y EL TITULAR NO SIRVE PARA MEDIRLO. Las dos congeladas publican
// `distintos: 43` — el MISMO numero. Leido por ahi, el arreglo del srcset «no
// hizo nada». Es §*el eje que no lee como defecto esconde la mejora igual que
// esconde la deriva*: lo que discrimina es comparar |clon − original| ANTES y
// DESPUES, PAR A PAR, no el recuento.

import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const PARES = [
  { ancho: 1440, antes: "productos-cmp-1440-2026-08-31.json", despues: "productos-cmp-1440-2026-08-31-srcset-cerrado.json" },
  { ancho: 390, antes: "productos-cmp-390-2026-08-31.json", despues: "productos-cmp-390-2026-08-31-srcset-cerrado.json" },
];
const faltan = PARES.flatMap((p) => [p.antes, p.despues]).filter((f) => !existsSync(join(MED, f)));
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const P = (...a) => console.log(...a);
const controles = [];
const ctl = (ok, n, d) => controles.push({ ok, nombre: n, detalle: d });

P("=".repeat(78));
P("131.ª · PASO 0 punto 4 — el ALCANCE del daño en la línea base de la 129.ª");
P("=".repeat(78));

const informe = [];
for (const par of PARES) {
  const fa = join(MED, par.antes);
  const fd = join(MED, par.despues);
  const a = JSON.parse(readFileSync(fa, "utf8"));
  const d = JSON.parse(readFileSync(fd, "utf8"));

  /* ⚠ §regla 5, las dos fugas: se EXIGE que el DESPUES sea POSTERIOR al ANTES.
     Sin esta linea, dos fotos del mismo dia se comparan llamandose antes y
     despues, y eso publica un «no se movio nada» perfectamente plausible. */
  const ta = statSync(fa).mtime, td = statSync(fd).mtime;
  ctl(td > ta, `@${par.ancho} · el DESPUÉS es POSTERIOR al ANTES`, `${ta.toISOString()} → ${td.toISOString()}`);

  P(`\n## @${par.ancho}`);
  P(`   antes:   ${par.antes}   distintos=${a.resumen?.distintos}`);
  P(`   después: ${par.despues}   distintos=${d.resumen?.distintos}`);
  P(`   ⚠ el TITULAR no discrimina: ${a.resumen?.distintos} → ${d.resumen?.distintos}`);

  /* ── Indexado de pares por su llave, para comparar POR EJE ──────────────
     La llave tiene que ser IDENTIDAD (§regla 29): si se repite, se TIRA. */
  /* ⚠ La congelada NO publica todos los pares: `difs` lleva SÓLO los que
     difieren, más `subpixel.casos` y `modulos.difs`. Así que el universo
     comparable es la UNIÓN de llaves de las dos congeladas — y un par que
     DESAPARECE de `difs` es uno que pasó a Δ0, que es información, no un hueco. */
  const idx = (j) => {
    const m = new Map();
    /* ⚠ La llave de un dif de MÓDULO incluye su índice: `modulos.difs` trae una
       entrada por (fila, módulo, eje), no por (fila, eje). Sin el `modulo` la
       llave NO es identidad y la v2 lo cazó tirando —que es lo que tiene que
       hacer un índice de identidad (§regla 29), en vez de pisar en silencio. */
    const mete = (ruta, grupo, e) => {
      const k = `${ruta}|${grupo}|fila${e.fila}|${e.modulo ?? "-"}|${e.eje}`;
      if (m.has(k)) throw new Error(`LLAVE REPETIDA: ${k} — no es identidad`);
      m.set(k, { orig: e.orig, clon: e.clon, delta: e.delta });
    };
    for (const r of j.informe ?? []) {
      for (const e of r.difs ?? []) mete(r.ruta, "fila", e);
      for (const e of r.subpixel?.casos ?? []) mete(r.ruta, "subpx", e);
      for (const e of r.modulos?.difs ?? []) mete(r.ruta, "modulo", e);
    }
    return m;
  };
  let ma, md;
  try { ma = idx(a); md = idx(d); }
  catch (e) {
    P(`   ❗ ${e.message}`);
    P(`   claves de una ruta: ${JSON.stringify(Object.keys((a.rutas ?? [])[0] ?? a)).slice(0, 300)}`);
    informe.push({ ancho: par.ancho, error: e.message });
    continue;
  }

  const claves = new Set([...ma.keys(), ...md.keys()]);
  let acerca = 0, aleja = 0, igual = 0, soloA = 0, soloD = 0;
  const movidos = [];
  for (const k of claves) {
    const ea = ma.get(k), ed = md.get(k);
    /* Ausente de `difs` = ese par estaba a Δ0 en esa corrida, no que falte. */
    const da = ea ? Math.abs((ea.clon ?? 0) - (ea.orig ?? 0)) : 0;
    const dd = ed ? Math.abs((ed.clon ?? 0) - (ed.orig ?? 0)) : 0;
    if (!ea) soloD++;
    if (!ed) soloA++;
    if (Math.abs(da - dd) < 1e-9) { igual++; continue; }
    if (dd < da) acerca++; else aleja++;
    movidos.push({
      k,
      distAntes: +da.toFixed(2),
      distDespues: +dd.toFixed(2),
      origAntes: ea?.orig ?? null,
      origDespues: ed?.orig ?? null,
    });
  }
  P(`   pares comparables: ${claves.size} | ACERCA ${acerca} · ALEJA ${aleja} · igual ${igual} · sólo-antes ${soloA} · sólo-después ${soloD}`);
  const tocados = movidos.length;

  /* ⚠⚠ EL CORTE QUE DECIDE, Y SIN ÉL EL NÚMERO SE LEE AL REVÉS (§*el recuento
     de pares tocados por una deriva del objetivo*): «cuántos pares tocó» NO
     dice si hay daño. Un par que NO EXISTÍA en la congelada de antes sale con
     `distAntes = 0` y por tanto como «ALEJA», y no se ha alejado de nada:
     es COBERTURA NUEVA — aquí, el eje `módulos` que la 130.ª encendió.
     El discriminador es CREA / MUEVE, y hay que contarlo aparte porque el
     total los suma y el total es el nivel de arriba de la atribución. */
  const crea = movidos.filter((m) => m.origAntes === null);
  const mueve = movidos.filter((m) => m.origAntes !== null);
  const mueveAcerca = mueve.filter((m) => m.distDespues < m.distAntes).length;
  const mueveAleja = mueve.length - mueveAcerca;
  P(`   ➜ tocados ${tocados} de ${claves.size} = ${((tocados / claves.size) * 100).toFixed(1)} %`);
  P(`      · CREA  ${crea.length}  — pares que la congelada de antes NO TENÍA: cobertura nueva, NO daño`);
  P(`      · MUEVE ${mueve.length}  — el ALCANCE REAL del daño: ${mueveAcerca} acercan · ${mueveAleja} alejan`);
  if (movidos.length) {
    P(`   los 12 mayores movimientos:`);
    for (const m of movidos.sort((x, y) => Math.abs(y.distAntes - y.distDespues) - Math.abs(x.distAntes - x.distDespues)).slice(0, 12))
      P(`      ${m.k.padEnd(58)} |Δ| ${String(m.distAntes).padStart(9)} → ${String(m.distDespues).padStart(9)}   (orig ${m.origAntes} → ${m.origDespues})`);
  }
  informe.push({ ancho: par.ancho, antes: par.antes, despues: par.despues, pares: claves.size, acerca, aleja, igual, soloA, soloD, tocados, crea: crea.length, mueve: mueve.length, mueveAcerca, mueveAleja, losQueMueven: mueve, movidos: movidos.slice(0, 60) });
}

/* ⚠⚠ LA GUARDA QUE LA v1 NO TENÍA, Y SU CORRIDA SALIÓ VERDE CON `NaN %`.
   La v1 indexaba `j.rutas[].ejes[]`, que en esta congelada NO EXISTE, así que
   comparó 0 pares y publicó «ALCANCE = 0» con exit 0 — mientras sus DOS
   controles (el `mtime`) pasaban tan campantes. Es §sondas 4bis por un camino
   que los controles no podían ver: vigilaban el ORDEN de las congeladas, no
   que se hubiera comparado nada. §regla 44: el contrato estaba un nivel por
   ENCIMA de lo que se compara. Evidencia: `-SONDA-INDEXABA-RUTAS-EJES.log`. */
const nPares = informe.reduce((a, i) => a + (i.pares ?? 0), 0);
ctl(nPares > 0, "§sondas 4bis · pares COMPARADOS > 0 (0 comparado no puede salir verde)", `${nPares} pares`);

P("\n## CONTROLES");
for (const c of controles) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const out = join(DERIV, "base-129-caducada-131.json");
writeFileSync(out, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), tanda: "131.ª", regla: "5bis", controles, informe }, null, 1) + "\n");
P(`\ncongelado: ${out.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);
P("=".repeat(78));
if (!controles.every((c) => c.ok)) process.exit(2);
