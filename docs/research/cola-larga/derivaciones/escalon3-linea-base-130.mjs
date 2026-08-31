/**
 * ESCALÓN 3 de la 130.ª · la LÍNEA BASE del eje `módulos` en las rutas que
 * acreditan, a los dos anchos.
 *
 * ⚠ CÓMO SE LEE LO QUE SALE, y va delante porque decide el veredicto: esto es
 * COBERTURA NUEVA, no una regresión. La fila 3 de `/software-…` nunca se había
 * comparado en módulos contra el original, así que un Δ es un defecto que
 * llevaba ahí desde que se construyó — no algo que esta tanda haya roto.
 *
 * Y NO se publica un recuento de pares distintos: el recuento dice cuántos
 * difieren, sólo la DISTANCIA `|clon − original|` dice cuánto y hacia dónde
 * (§*el eje que no lee como defecto esconde la mejora igual que esconde la
 * deriva*). Cada Δ va con SUS DOS LADOS y su ancho: `orig X → clon Y @1440`,
 * porque un número de un par citado sin su lado no se puede leer (§sondas 1).
 *
 * LOS EJES QUE NO LEEN COMO DEFECTO van SOLOS y ANTES del titular, con su
 * cardinal y fuera del recuento (§regla 14): las filas SIN MARCADOR, las
 * PARCIALES y las HUÉRFANAS. Si cayeran dentro, el titular absorbería lo que
 * no se midió.
 *
 * QUÉ NO CONTESTA: no dice CUÁL de los Δ es campo y cuál plantilla —para eso
 * hace falta la cascada (§regla 41)— ni mide nada nuevo: sólo lee congeladas.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const RAIZ = join(import.meta.dirname, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts", "qa", "medidas");
const SAL = import.meta.dirname;

const FUENTES = [
  { ancho: 1440, f: "productos-cmp-1440-2026-08-31-srcset-cerrado.json" },
  { ancho: 390, f: "productos-cmp-390-2026-08-31-srcset-cerrado.json" },
];
for (const s of FUENTES) if (!existsSync(join(MED, s.f))) throw new Error(`PRECONDICIÓN: falta ${s.f}`);

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };
const abs = (x) => Math.abs(x);

const informe = [];
for (const { ancho, f } of FUENTES) {
  const J = JSON.parse(readFileSync(join(MED, f), "utf8"));

  /* ── 1 · LO QUE NO LEE COMO DEFECTO, con su cardinal y ANTES del titular ── */
  say(`═══════ @${ancho} · EJES EXCLUIDOS Y NO COMPARADOS (van ANTES del titular) ═══════`);
  const excl = [];
  for (const i of J.informe) {
    const m = i.modulos || {};
    const huerfanas = i.filas.orig - i.filas.clon;
    excl.push({
      ruta: i.ruta,
      filasHuerfanas: huerfanas,
      filasSinMarcador: m.filasSinMarcador ?? 0,
      filasParciales: m.filasParciales ?? 0,
      modulosNoComparadosPorSinMarcador: (i.modulosSinMarcador?.porFila || []).reduce((s, x) => s + (x.orig || 0), 0),
      modulosNoComparadosPorParcial: (m.parciales || []).reduce((s, x) => s + (x.orig || 0), 0),
      parciales: (m.parciales || []).map((x) => ({ fila: x.fila, orig: x.orig, clon: x.clon, motivo: x.motivo })),
    });
  }
  for (const e of excl) {
    say(`  ${e.ruta.padEnd(40)} filas: huérfanas ${e.filasHuerfanas} · SIN MARCADOR ${e.filasSinMarcador} · PARCIALES ${e.filasParciales}`);
    say(`      módulos NO comparados: ${e.modulosNoComparadosPorSinMarcador} por falta de marcador · ${e.modulosNoComparadosPorParcial} por recuento descuadrado`);
    for (const p of e.parciales) say(`      · fila ${p.fila}: orig ${p.orig} → clon ${p.clon} — ${p.motivo}`);
  }
  const totExcl = excl.reduce((a, e) => ({
    sinMarcador: a.sinMarcador + e.filasSinMarcador,
    parciales: a.parciales + e.filasParciales,
    modsSin: a.modsSin + e.modulosNoComparadosPorSinMarcador,
    modsParc: a.modsParc + e.modulosNoComparadosPorParcial,
  }), { sinMarcador: 0, parciales: 0, modsSin: 0, modsParc: 0 });
  say(`  ⇒ TOTAL fuera del recuento: ${totExcl.sinMarcador} filas sin marcador · ${totExcl.parciales} parciales · ${totExcl.modsSin + totExcl.modsParc} módulos del original no comparados`);

  /* ── 2 · EL DESALINEAMIENTO, que tampoco es defecto del clon ─────────────── */
  say("");
  say(`  ── ⚠ y APARTE: el desalineamiento de la ÚLTIMA fila, que NO es defecto del clon ──`);
  /* ⚠ La v1 de este detector filtraba por el literal `orig === 146`, que es el
   * valor A 1440. A 390 no casa ninguno y publicaba «0 de 4» — §sondas 4
   * cometida sobre mi propio filtro: un selector que no casa con nada no es un
   * cero. Se DERIVA: la última fila comparada de cada ruta, sin literal. */
  const desal = [];
  for (const i of J.informe) {
    const d = i.difs.find((x) => x.fila === i.filas.clon - 1 && x.eje === "h");
    if (d) { desal.push({ ruta: i.ruta, fila: d.fila, orig: d.orig, clon: d.clon, delta: d.delta }); say(`     ${i.ruta.padEnd(40)} fila ${d.fila} h: orig ${d.orig} → clon ${d.clon} @${ancho}  Δ${d.delta > 0 ? "+" : ""}${d.delta}`); }
  }
  const mismoOrig = new Set(desal.map((d) => d.orig));
  say(`     ⇒ ${desal.length} de 4 rutas, y las ${desal.length} con el MISMO \`orig\` (${[...mismoOrig].join(" · ")}): el original sirve una fila propia para el botón`);
  say(`       «Amplia tus conocimientos con nuestras guías» que el clon no marca con \`data-fila\`, así que el`);
  say(`       índice desliza y la FAQ del clon se empareja con ese botón. 4 de 4 = el instrumento, no el clon.`);

  /* ── 3 · LA DISTANCIA PAR A PAR, que es el titular ──────────────────────── */
  say("");
  say(`═══════ @${ancho} · LÍNEA BASE del eje MÓDULOS — |clon − original| PAR A PAR ═══════`);
  const pares = [];
  for (const i of J.informe) {
    for (const d of (i.modulos?.difs || [])) {
      if (d.eje === "nModulos") continue; /* el descuadre de recuento ya va arriba, en PARCIALES */
      pares.push({ ruta: i.ruta, fila: d.fila, modulo: d.modulo, kind: d.kind, eje: d.eje, orig: d.orig, clon: d.clon, delta: d.delta, dist: abs(d.delta) });
    }
  }
  pares.sort((a, b) => b.dist - a.dist);
  for (const p of pares) {
    say(`  ${p.ruta.padEnd(40)} f${p.fila} m${String(p.modulo).padStart(2)} ${String(p.kind ?? "—").padEnd(7)} ${p.eje.padEnd(3)}  orig ${String(p.orig).padStart(8)} → clon ${String(p.clon).padStart(8)} @${ancho}  Δ${p.delta > 0 ? "+" : ""}${p.delta}`);
  }
  const suma = pares.reduce((s, p) => s + p.dist, 0);
  say(`  ⇒ ${pares.length} pares con distancia ≠ 0 · Σ|clon−orig| = ${Math.round(suma * 100) / 100} px  (unidad: el PAR módulo×eje)`);

  /* Reparto por eje: dice DÓNDE está el defecto, que el total no puede. */
  const porEje = {};
  for (const p of pares) { porEje[p.eje] = porEje[p.eje] || { n: 0, suma: 0 }; porEje[p.eje].n++; porEje[p.eje].suma += p.dist; }
  say(`  reparto por eje: ${Object.entries(porEje).map(([e, v]) => `${e} ${v.n} pares / ${Math.round(v.suma * 100) / 100} px`).join(" · ")}`);
  const porRuta = {};
  for (const p of pares) { porRuta[p.ruta] = porRuta[p.ruta] || { n: 0, suma: 0 }; porRuta[p.ruta].n++; porRuta[p.ruta].suma += p.dist; }
  say(`  reparto por ruta: ${Object.entries(porRuta).map(([r, v]) => `${r} ${v.n}/${Math.round(v.suma * 100) / 100}px`).join(" · ")}`);
  say("");

  informe.push({ ancho, fuente: f, excluidos: excl, totalesExcluidos: totExcl, desalineamiento: desal, pares, suma: Math.round(suma * 100) / 100, porEje, porRuta });
}

/* ── El Δ que se repite EN LOS DOS ANCHOS pesa más que su tamaño ──────────── */
say("═══ los pares que aparecen a 1440 Y a 390 (dos maquetaciones distintas: no puede ser ruido) ═══");
const clave = (p) => `${p.ruta}::f${p.fila}::m${p.modulo}::${p.eje}`;
const a = new Map(informe[0].pares.map((p) => [clave(p), p]));
const b = new Map(informe[1].pares.map((p) => [clave(p), p]));
const enLosDos = [...a.keys()].filter((k) => b.has(k));
for (const k of enLosDos.sort((x, y) => b.get(y).dist - b.get(x).dist)) {
  const p = a.get(k), q = b.get(k);
  say(`  ${k.padEnd(58)} @1440 orig ${p.orig} → clon ${p.clon} (Δ${p.delta})   @390 orig ${q.orig} → clon ${q.clon} (Δ${q.delta})`);
}
say(`  ⇒ ${enLosDos.length} de ${a.size} (@1440) y ${b.size} (@390) — sólo a 1440: ${a.size - enLosDos.length} · sólo a 390: ${b.size - enLosDos.length}`);

const salida = {
  meta: {
    tanda: "130.ª", escalon: "3", fecha: new Date().toISOString().slice(0, 10),
    unidad: "el PAR módulo×eje (`ruta::fila::modulo::eje`) — no la ruta, no el recuento",
    lectura: "COBERTURA NUEVA, no regresión: estas filas nunca se habían comparado en módulos contra el original",
    noContesta: "no dice cuál Δ es CAMPO y cuál PLANTILLA (eso lo dice la cascada, §regla 41), y no mide nada nuevo: lee congeladas",
  },
  informe,
  enLosDosAnchos: enLosDos,
};

const w2 = (nombre, contenido) => {
  const p = join(SAL, nombre);
  if (existsSync(p) && readFileSync(p, "utf8") !== contenido) {
    const alt = p.replace(/(\.\w+)$/, `-${new Date().toISOString().slice(0, 10)}$1`);
    writeFileSync(alt, contenido); say(`⚠ ${nombre} existe y difiere — al lado: ${basename(alt)}`); return;
  }
  writeFileSync(p, contenido); say(`→ ${nombre}`);
};
say("");
w2("escalon3-linea-base-130.json", JSON.stringify(salida, null, 1));
w2("escalon3-linea-base-130.log", L.join("\n") + "\n");
say(`✓ evaluadas ${informe.length}/2 anchos · línea base del eje MÓDULOS`);
