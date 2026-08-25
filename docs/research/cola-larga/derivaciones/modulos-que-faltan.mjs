/* modulos-que-faltan — 105.ª tanda, 2026-08-25. ESCALÓN 1.
 *
 * LA PREGUNTA: el comparador dice `314 → 267`, o sea **−47 módulos**. Un −47 es
 * un CONTENEDOR y ya se sabe que absorbe —las filas parecían `−2` y eran `−10` y
 * `+8`—, así que la pregunta no es *«¿cuántos faltan?»* sino **«¿CUÁLES?»**.
 *
 * §*un cardinal es un contenedor y absorbe la membresía*: `68 → 68` es exacto y
 * los dos conjuntos pueden diferir en 2 por lado. Aquí el cardinal ni siquiera
 * empata, y aun así **no dice qué falta**: −47 puede ser 47 módulos perdidos, o
 * 50 perdidos y 3 de sobra, y las dos lecturas mandan a sitios distintos.
 *
 * **El original NO se abre.** Todo sale de congeladas que ya estaban en el repo:
 *   · `f33-cmp-{1440,390}.json`  — los dos lados, módulo a módulo (104.ª)
 *   · `f33-geo-neg-control.json` — el criterio de recuento con/sin caja (95.ª)
 *   · `f33-extraido.json` §retirada — los 12 módulos retirados a propósito
 *
 * ── CÓMO SE ALINEAN LOS DOS LADOS ──────────────────────────────────────────
 * `f33-cmp` empareja **por índice de documento**, y lo declara: *«si el clon
 * emite un módulo de MENOS, todos los siguientes se desalinean»*. Para NOMBRAR
 * hace falta lo contrario de una llave posicional: una alineación que **admita
 * huecos**. Se usa LCS sobre el tipo traducido a `kind` — la misma tabla que el
 * comparador ya publica—, y lo que queda fuera del emparejamiento es,
 * literalmente, lo que un lado tiene y el otro no.
 *
 * ── CONTROLES (§sondas 4 · §regla 8: un negativo sin control no es un negativo)
 *   1. IDENTIDAD ARITMÉTICA — por ruta, `soloOrig − soloClon` tiene que valer
 *      exactamente `orig.nModulos − clon.nModulos`. Si no, la alineación está
 *      inventando o perdiendo módulos y **nada de lo que siga vale**;
 *   2. NI CERO NI PLENO — 0 sin emparejar contradiría el −47 medido; emparejar
 *      0 sería un alineador muerto. Las dos salidas cierran el código ≠ 0;
 *   3. DOS ANCHOS — la ficha afirma que las cifras de árbol son idénticas a
 *      1440 y a 390. Si el CONJUNTO nombrado difiere entre anchos, la
 *      afirmación era sobre el cardinal y no sobre la membresía (§*dos lecturas
 *      pueden dar el mismo cardinal contando unidades distintas*);
 *   4. EL CRITERIO DE CAJA se toma del CONGELADO (`w > 0`), no se inventa uno
 *      nuevo: dos censos del mismo objeto con criterios distintos inventan el
 *      desacuerdo (§regla 31, hermana);
 *   5. TIPOS SIN TRADUCIR salen NOMBRADOS. No saber traducir un tipo es un
 *      hueco del instrumento, y contarlo como «falta» se lo atribuye al clon.
 *
 * ── LO QUE **NO** CONTESTA ─────────────────────────────────────────────────
 *   · ni un píxel: esto es MEMBRESÍA, no geometría;
 *   · nada de `docH` ni de `base` — son ESCALÓN 2, y se leen DESPUÉS;
 *   · por qué el clon no emite un módulo. Dice CUÁL y con qué correlaciona;
 *     la causa mecánica se busca en el extractor/render con el nombre delante.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const MED = join(RAIZ, "scripts/qa/medidas");
const lee = (n) => JSON.parse(readFileSync(join(MED, n), "utf8"));

/* La MISMA tabla que publica `f33-cmp` §4c. Se copia con su origen declarado:
 * si divergiera, el cruce de tipo del comparador y esto dirían cosas distintas
 * del mismo objeto. */
const KIND_DE_DIVI = {
  text: "texto-pagina", image: "imagen-pagina", button: "boton-pagina", code: "codigo",
  toggle: "toggle", video: "video-pagina", blurb: "blurb", icon: "icono", map: "mapa",
  slider: "slider", fullwidth_slider: "slider-completo",
};

const geo = lee("f33-geo-neg-control.json");
const SIN_CAJA_RUTA = geo.criterioDeRecuento.sinCajaPorRuta;
const SIN_CAJA_TIPO = geo.criterioDeRecuento.sinCajaPorTipo;
/* §regla 31 hermana: el criterio lo fija el CONGELADO, no esta sonda. */
const CRITERIO_CAJA = geo.criterioDeRecuento.nota;

const ext = lee("f33-extraido.json");
const RETIRADA = {};
for (const d of ext.retirada.detalle)
  if (d.moduloOmitido) (RETIRADA[d.ruta] ??= []).push(d.retirados[0]);

/* ── LCS con huecos ───────────────────────────────────────────────────────── */
function alinea(a, b) {
  const n = a.length, m = b.length;
  const T = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      T[i][j] = a[i] === b[j] ? T[i + 1][j + 1] + 1 : Math.max(T[i + 1][j], T[i][j + 1]);
  const soloA = [], soloB = [], pares = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { pares.push([i, j]); i++; j++; }
    else if (T[i + 1][j] >= T[i][j + 1]) soloA.push(i++);
    else soloB.push(j++);
  }
  while (i < n) soloA.push(i++);
  while (j < m) soloB.push(j++);
  return { soloA, soloB, pares };
}

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("═══ modulos-que-faltan — 105.ª tanda, 2026-08-25 · ESCALÓN 1");
say("    NOMBRA los módulos del −47. No abre el original: lee congeladas.");
say(`    criterio de caja, tomado del congelado: ${CRITERIO_CAJA}`);
say("");

const porAncho = {};
const sinTraducirGlobal = new Set();

for (const ANCHO of [1440, 390]) {
  const cmp = lee(`f33-cmp-${ANCHO}.json`);
  const faltan = [], sobran = [];
  let rotos = 0, empatados = 0;

  for (const [ruta, v] of Object.entries(cmp.paginas)) {
    if (!v.clon) continue;
    const O = v.original.modulos ?? [], C = v.clon.modulos ?? [];
    for (const m of O) if (m.tipo && !KIND_DE_DIVI[m.tipo]) sinTraducirGlobal.add(m.tipo);

    const ka = O.map((m) => KIND_DE_DIVI[m.tipo] ?? `?${m.tipo}`);
    const kb = C.map((m) => m.tipo ?? "?null");
    const { soloA, soloB, pares } = alinea(ka, kb);
    empatados += pares.length;

    /* CONTROL 1 — identidad aritmética */
    const dReal = C.length - O.length;
    const dAlin = soloB.length - soloA.length;
    if (dReal !== dAlin) {
      rotos++;
      say(`  ⛔ ALINEACIÓN ROTA ${ruta}: Δ real ${dReal} ≠ Δ alineado ${dAlin}`);
    }

    for (const i of soloA)
      faltan.push({
        ruta, reg: v.regimen, i, tipo: O[i].tipo, kind: ka[i],
        etiqueta: O[i].etiqueta, w: O[i].w, h: O[i].h,
        conCaja: O[i].w > 0,          /* criterio del congelado */
      });
    for (const j of soloB)
      sobran.push({ ruta, reg: v.regimen, j, tipo: C[j].tipo, w: C[j].w, h: C[j].h });
  }

  porAncho[ANCHO] = { faltan, sobran, empatados, rotos };
}

/* ── CONTROLES 1-3, antes del titular ─────────────────────────────────────── */
say("═══ 0 · CONTROLES — antes de ningún titular");
let malo = 0;
for (const a of [1440, 390]) {
  const p = porAncho[a];
  say(`  @${a}  emparejados ${p.empatados} · faltan ${p.faltan.length} · sobran ${p.sobran.length} · alineaciones rotas ${p.rotos}`);
  if (p.rotos) malo++;
  if (p.faltan.length === 0) { say(`  ⛔ @${a} CERO módulos sin emparejar, y el comparador mide −47: es el alineador (§sondas 4)`); malo++; }
  if (p.empatados === 0) { say(`  ⛔ @${a} CERO emparejados: alineador muerto`); malo++; }
}
const clave = (x) => `${x.ruta}#${x.i}:${x.kind}`;
const s1440 = new Set(porAncho[1440].faltan.map(clave));
const s390 = new Set(porAncho[390].faltan.map(clave));
const soloEn1440 = [...s1440].filter((k) => !s390.has(k));
const soloEn390 = [...s390].filter((k) => !s1440.has(k));
say(`  membresía entre anchos — diferencia simétrica: ${soloEn1440.length} sólo @1440 · ${soloEn390.length} sólo @390`);
for (const k of [...soloEn1440, ...soloEn390].slice(0, 10)) say(`     · ${k}`);
if (sinTraducirGlobal.size) say(`  ⚠ tipos del ORIGINAL sin traducir a \`kind\`: ${[...sinTraducirGlobal].join(" · ")}`);
else say(`  tipos sin traducir: 0`);
say("");

/* ── EL REPARTO, por régimen y por tipo ───────────────────────────────────── */
const F = porAncho[1440].faltan, S = porAncho[1440].sobran;

say("═══ 1 · LOS QUE FALTAN — por RÉGIMEN (nunca en total)");
const reg = {};
for (const x of F) { const g = (reg[x.reg] ??= { n: 0, conCaja: 0, sinCaja: 0, rutas: new Set() }); g.n++; g.rutas.add(x.ruta); x.conCaja ? g.conCaja++ : g.sinCaja++; }
for (const [r, g] of Object.entries(reg).sort())
  say(`  ${r.padEnd(4)} ${String(g.n).padStart(3)} módulos en ${g.rutas.size} rutas · CON caja ${g.conCaja} · SIN caja ${g.sinCaja}`);
say(`  TOTAL ${F.length}   (sobran en el clon: ${S.length})`);
say("");

say("═══ 2 · LOS QUE FALTAN — por TIPO, cruzado con el criterio de caja");
const tip = {};
for (const x of F) { const g = (tip[x.kind] ??= { n: 0, conCaja: 0, sinCaja: 0 }); g.n++; x.conCaja ? g.conCaja++ : g.sinCaja++; }
for (const [t, g] of Object.entries(tip).sort((a, b) => b[1].n - a[1].n))
  say(`  ${t.padEnd(18)} ${String(g.n).padStart(3)} · con caja ${String(g.conCaja).padStart(3)} · SIN caja ${String(g.sinCaja).padStart(3)}`);
say("");

say("═══ 3 · EL CRUCE QUE DECIDE — ¿es «sin caja» el discriminador?");
say("    §*un discriminador 1:1 puede ser la SOMBRA de otro*: se publica el 2×2 entero.");
const conCaja = F.filter((x) => x.conCaja).length, sinCaja = F.length - conCaja;
say(`  faltan y NO tienen caja en el original: ${sinCaja}`);
say(`  faltan y SÍ tienen caja en el original: ${conCaja}`);
const totalSinCaja = Object.values(SIN_CAJA_RUTA).reduce((a, b) => a + b, 0);
say(`  módulos SIN caja que el congelado \`f33-geo\` censa en total: ${totalSinCaja}`);
say(`  ⇒ sin caja QUE SÍ EMITE el clon: ${totalSinCaja - sinCaja}`);
say(`     (tipos sin caja según f33-geo: ${JSON.stringify(SIN_CAJA_TIPO)})`);
say("");

say("═══ 4 · LOS QUE FALTAN, NOMBRADOS — ruta por ruta");
const porRuta = {};
for (const x of F) (porRuta[x.ruta] ??= []).push(x);
for (const [r, xs] of Object.entries(porRuta)) {
  const ret = (RETIRADA[r] ?? []).map((z) => `${z.contenedor}/${z.clase}`);
  say(`  ${r}  [${xs[0].reg}]  faltan ${xs.length}${ret.length ? `  · retirada declarada: ${ret.join(" · ")}` : ""}`);
  for (const x of xs)
    say(`     · mod${String(x.i).padStart(2)}  \`${x.tipo}\` → \`${x.kind}\`  <${x.etiqueta}>  ${x.conCaja ? `caja ${x.w}×${x.h}` : "SIN CAJA (w=0)"}`);
}
if (S.length) {
  say("");
  say("═══ 4b · LOS QUE SOBRAN EN EL CLON — nombrados");
  for (const x of S) say(`  ${x.ruta} [${x.reg}] mod${x.j} \`${x.tipo}\` caja ${x.w}×${x.h}`);
}
say("");

say("═══ 5 · LA RETIRADA, cruzada al ELEMENTO (no al cardinal)");
let retExplica = 0, retNoCasa = [];
for (const [r, zs] of Object.entries(RETIRADA)) {
  const xs = porRuta[r] ?? [];
  for (const z of zs) {
    /* la miga es un `text`; los dos CONSULTA son `code`/`text` — se busca por
     * ruta y se dice si hay hueco donde caer, sin forzar la correspondencia */
    if (xs.length) retExplica++;
    else retNoCasa.push(`${r} · ${z.contenedor}/${z.clase}`);
  }
}
say(`  retiradas declaradas: ${Object.values(RETIRADA).flat().length} en ${Object.keys(RETIRADA).length} rutas`);
say(`  retiradas con hueco donde caer: ${retExplica} · SIN hueco: ${retNoCasa.length}`);
for (const x of retNoCasa) say(`     ⚠ ${x}  ← declarada retirada y el clon SÍ la emite`);
say("");

/* ── LA ADJUDICACIÓN ──────────────────────────────────────────────────────
 * Cada módulo que falta contra las causas YA DECLARADAS en el repo. Lo que no
 * case con ninguna es el residuo, y es lo único que esta tanda añade.
 *
 * ⚠ Las dos causas se leen de su fuente, no se recuerdan:
 *   · `SIN_CABLEAR` de `apps/web/src/components/cola-larga/CuerpoPagina.tsx`
 *     (§F3-3-CUATRO-SIN-CABLEAR, 99.ª);
 *   · la RETIRADA de `f33-extraido.json` §retirada (declarada desde la 97.ª).
 */
const SIN_CABLEAR = new Set(
  (readFileSync(join(RAIZ, "apps/web/src/components/cola-larga/CuerpoPagina.tsx"), "utf8")
    .match(/const SIN_CABLEAR[^=]*=\s*new Set<[^>]*>\(\[([^\]]*)\]\)/) ?? [, ""])[1]
    .match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) ?? [],
);
if (SIN_CABLEAR.size === 0) throw new Error("SIN_CABLEAR vacío: el parseo no casó (§sondas 4)");

const retPend = {};
for (const [r, zs] of Object.entries(RETIRADA)) retPend[r] = zs.length;
const adj = { sinCablear: [], retirada: [], residuo: [] };
for (const x of F) {
  if (SIN_CABLEAR.has(x.kind)) adj.sinCablear.push(x);
  else if (x.kind === "texto-pagina" && retPend[x.ruta] > 0) { retPend[x.ruta]--; adj.retirada.push(x); }
  else adj.residuo.push(x);
}

say("═══ 6 · LA ADJUDICACIÓN — cada uno contra una causa YA declarada");
say(`  SIN_CABLEAR leído del render: ${[...SIN_CABLEAR].join(" · ")}`);
say(`  · los 4 kinds SIN CABLEAR (§F3-3-CUATRO-SIN-CABLEAR, 99.ª): ${adj.sinCablear.length}`);
for (const [k, n] of Object.entries(adj.sinCablear.reduce((a, x) => ((a[x.kind] = (a[x.kind] || 0) + 1), a), {})))
  say(`       ${k.padEnd(18)} ${n}`);
say(`  · la RETIRADA (§f33-extraido.retirada, 97.ª):            ${adj.retirada.length}`);
say(`  · RESIDUO sin causa declarada:                           ${adj.residuo.length}`);
for (const x of adj.residuo)
  say(`       ⛔ ${x.ruta} mod${x.i} \`${x.kind}\` <${x.etiqueta}> ${x.conCaja ? `caja ${x.w}×${x.h}` : "sin caja"}`);
say(`  sobrantes del retirada declarado que no encontraron módulo: ${Object.values(retPend).reduce((a, b) => a + b, 0)}`);
say("");

/* ── EL DISCRIMINADOR, con sus separadoras ────────────────────────────────
 * §*dos variables confundidas*: las 30 instancias de `video` son TODAS sin
 * caja, así que dentro de ese tipo «kind» y «sin caja» **no se pueden
 * separar**. Lo que las separa está fuera, y hay que contarlo antes de
 * escribir la regla. */
say("═══ 7 · ¿KIND o SIN CAJA? — las separadoras, contadas antes de decidir");
const sinCajaTotal = Object.values(SIN_CAJA_TIPO).reduce((a, b) => a + b, 0);
const faltanSinCaja = F.filter((x) => !x.conCaja).length;
const sepA = sinCajaTotal - faltanSinCaja;                     /* sin caja y EMITIDO */
const sepB = F.filter((x) => x.conCaja && SIN_CABLEAR.has(x.kind)).length; /* con caja y NO emitido */
say(`  (a) SIN caja y el clon SÍ los emite:  ${sepA}   ⇒ «sin caja» NO basta para faltar`);
say(`      tipos sin caja según f33-geo: ${JSON.stringify(SIN_CAJA_TIPO)} · total ${sinCajaTotal}`);
say(`  (b) CON caja y el clon NO los emite:  ${sepB}   ⇒ «con caja» NO basta para estar`);
say(`  ⇒ separadoras en las DOS direcciones: ${sepA} + ${sepB} = ${sepA + sepB}`);
say(`     El discriminador es el KIND. Si fueran 0, la regla estaría nombrando una correlación.`);
say("");

say("═══ 8 · VEREDICTO");
const noSinCaja = F.filter((x) => x.conCaja);
say(`  −${F.length} módulos nombrados uno a uno, +${S.length} de sobra.`);
say(`  SIN CAJA en el original: ${sinCaja}  ⇒ es el grupo mayor.`);
say(`  CON CAJA (visibles en el original y ausentes del clon): ${noSinCaja.length}`);
for (const x of noSinCaja) say(`     · ${x.ruta} mod${x.i} \`${x.kind}\` ${x.w}×${x.h}`);

writeFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/modulos-que-faltan.log"), L.join("\n") + "\n");
say("");
say(`  → modulos-que-faltan.log`);
if (malo) { console.error(`\n⛔ ${malo} control(es) en rojo: la derivación NO vale`); process.exit(2); }
