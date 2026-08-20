/**
 * LOS CUATRO PIES DEL ORIGINAL — DERIVADOS DEL ARCHIVO, CON SU `n` POR FAMILIA.
 * Uso: node scripts/qa/pie-familias.mjs        (npm run qa:pie-familias)
 * Negativo: node scripts/qa/pie-familias.neg.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTA SONDA NO ABRE UNA SOLA PÁGINA
 *
 * §F3-LH-PIE-UNO-CONTRA-CUATRO se cerró con una frase —*«el original sirve
 * CUATRO pies, uno por familia, con varianza CERO dentro de cada una»*— y esa
 * frase **tiene dos mitades y sólo una estaba publicada con su número**:
 *
 * | mitad | ¿tenía número? |
 * |---|---|
 * | los valores de cada pie | **sí**: la tabla de `pie-cmp` |
 * | **cuántas instancias sostienen cada «varianza cero»** | **no** |
 *
 * Y la segunda es la que decide si «cuatro» está probado o es **el `n` que
 * había**: §*una varianza cero con n = 1 no es varianza cero, es que no había
 * con qué variar*. `L5-casos` y `L4` tienen **una sola página** en el espejo,
 * así que su «varianza cero» es exactamente eso — y escribir un modelo de
 * cuatro familias sin decirlo es §*un discriminador hallado en UNA instancia
 * tampoco es un discriminador*.
 *
 * Todo lo que hace falta **ya está commiteado** en `lh-espejo-{1440,390}.json`:
 * el pie del original viene descompuesto en `esqueleto.cascaron[]` con su clase.
 * Derivarlo cuesta un `readFileSync` y no toca el original — que es el orden
 * bueno (§*lo decisivo salió del archivo antes que del navegador*).
 *
 * ── Lo que esta sonda NO puede contestar, y se declara ────────────────────
 * - **el `n` es el del ESPEJO, no el del sitio.** El espejo tiene 82 páginas de
 *   9 formas; el sitio tiene más instancias de algunas. Un `n` alto aquí prueba
 *   varianza cero **en lo medido**, no en el CPT entero;
 * - **no dice POR QUÉ** el original sirve pies distintos. Agrupa y cuenta;
 * - **no mira el clon.** Para eso está `pie-cmp`, que es de dos lados.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const ARGS = process.argv.slice(2);
const ANCHOS = [1440, 390];

/** El rol sale de la clase `footer-*`; lo que no casa y es de pie es la CTA. */
const rolDe = (clases) => {
  for (const c of clases || []) {
    if (c === "footer-links") return "links";
    if (c === "footer-legal") return "legal";
    if (c === "footer-background") return "background";
  }
  return "cta";
};

/**
 * ⚠ **SABOTAJE del negativo:** apunta los dos anchos al MISMO espejo. Si la
 * sonda no lo nota, su «los dos anchos coinciden» no significa nada.
 */
const ESPEJO_DE = (w2) => {
  /* `--espejo1440=` / `--espejo390=` sustituyen UN ancho y dejan el otro en su
   * sitio. Hace falta para que el sabotaje `piel-mezclada` pueda ejercitarse:
   * con el `--espejo=` global los dos anchos comparten fichero y lo para antes
   * la guarda de «mismo espejo», así que el caso nunca llegaría a probar lo que
   * su tabla promete (§sondas 17: un sabotaje que otra guarda intercepta no
   * ejercita nada). */
  const porAncho = (ARGS.find((a) => a.startsWith(`--espejo${w2}=`)) || "").split("=")[1];
  if (porAncho) return porAncho;
  const forzado = (ARGS.find((a) => a.startsWith("--espejo=")) || "").slice(9);
  return forzado || `medidas/lh-espejo-${w2}.json`;
};

/**
 * ⚠ **Los dos anchos tienen que salir de DOS ficheros distintos.** El control
 * de esta sonda es *«la partición coincide a los dos anchos»*, y si los dos
 * leen el MISMO espejo eso se cumple **por construcción**: un control vacuo que
 * imprime ✓. Es §regla 15 —*dos instrumentos que comparten premisa no verifican
 * la premisa*— con la premisa reducida al extremo: el mismo fichero consigo
 * mismo.
 */
if (ANCHOS.length > 1 && new Set(ANCHOS.map(ESPEJO_DE)).size === 1) {
  console.error(
    `\n❌ NO SE PUDO EVALUAR · los ${ANCHOS.length} anchos apuntan al MISMO espejo (${ESPEJO_DE(ANCHOS[0])}).\n` +
      `   El control «la partición coincide a los dos anchos» se cumpliría por\n` +
      `   construcción y saldría ✓ sin haber comparado nada.\n`,
  );
  process.exit(2);
}

const ev = new Evaluadas({ nombre: "pie-familias", unidad: "anchos derivados", minimo: ANCHOS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: "los pies del original agrupados por FAMILIA, con el n que sostiene cada varianza cero",
    fuente: "medidas/lh-espejo-{1440,390}.json (congelado y commiteado) — NO abre el original",
    unidad: "la FAMILIA de pie; y dentro de ella, la PÁGINA como instancia",
    noMide: [],
  },
  porAncho: {},
};

for (const width of ANCHOS) {
  const f = join(QA, ESPEJO_DE(width));
  if (!existsSync(f)) {
    console.error(`\n❌ NO SE PUDO EVALUAR · no existe ${ESPEJO_DE(width)}.\n   Sin el espejo no hay nada que derivar.\n`);
    process.exit(2);
  }
  const espejo = JSON.parse(readFileSync(f, "utf8"));

  /* forma → { paginas, firmas:Map(firma → n) } */
  const porForma = new Map();
  for (const v of Object.values(espejo.paginas || {})) {
    const sec = (v.esqueleto?.cascaron || []).filter((s) => s.capa === "tb_footer");
    if (!sec.length) continue;
    const partes = {};
    for (const s of sec) partes[rolDe(s.clases)] = s.rect.h;
    const firma = JSON.stringify(partes);
    if (!porForma.has(v.forma)) porForma.set(v.forma, { paginas: 0, firmas: new Map(), total: v.pie?.rect?.h ?? null });
    const e = porForma.get(v.forma);
    e.paginas++;
    e.firmas.set(firma, (e.firmas.get(firma) || 0) + 1);
  }

  /* familia = firma de pie. Varias formas pueden compartirla — eso es el hallazgo. */
  const familias = new Map();
  for (const [forma, e] of porForma) {
    for (const [firma, n] of e.firmas) {
      if (!familias.has(firma)) familias.set(firma, { formas: {}, instancias: 0, partes: JSON.parse(firma) });
      const fam = familias.get(firma);
      fam.formas[forma] = (fam.formas[forma] || 0) + n;
      fam.instancias += n;
    }
  }

  salida.porAncho[width] = {
    espejo: ESPEJO_DE(width),
    formasConPie: porForma.size,
    familias: [...familias.values()]
      .map((f) => ({
        partes: f.partes,
        total: +Object.values(f.partes).reduce((a, b) => a + b, 0).toFixed(2),
        formas: f.formas,
        instancias: f.instancias,
        /* La mitad que faltaba: una varianza cero con n=1 no es varianza cero. */
        varianzaCeroSostenidaPor: f.instancias,
        establecida: f.instancias >= 2,
      }))
      .sort((a, b) => b.instancias - a.instancias),
    /* Control: ¿alguna FORMA sirve más de un pie? Si sí, «una familia por
       forma» es falso y el modelo que se iba a escribir es el equivocado. */
    formasConMasDeUnPie: [...porForma.entries()].filter(([, e]) => e.firmas.size > 1).map(([forma, e]) => ({ forma, pies: e.firmas.size })),
  };
  ev.ok();
}

/**
 * ⚠⚠ **Y AQUÍ ESTÁ LO QUE CAMBIA EL MODELO: LA CTA ES UNA DIMENSIÓN
 * ORTOGONAL, ASÍ QUE NO SON CUATRO PIES SINO TRES PIELES.**
 *
 * Agrupar por la firma ENTERA da 4 familias, y una de ellas —`L5-casos`— con
 * **n = 1**. Quitando la sección CTA de la firma, `L5-casos` cae **exactamente
 * encima de la familia de `L1`**: `430.78 · 121.97 · 41` a 1440 y
 * `1437.42 · 283.75 · 40` a 390, **idénticos al céntimo**. O sea que `L5` no
 * sirve un pie propio: sirve **el de `L1` con un bloque CTA delante**.
 *
 * **Las dos consecuencias, y la segunda es la que ahorra la tanda:**
 *
 * 1. **el `n = 1` desaparece.** Con la CTA fuera de la firma, `L5` suma a la
 *    piel de `L1` y su varianza cero pasa a sostenerse en **64 instancias**.
 *    Las tres pieles quedan con n = 64 · 12 · 6, todas ≥ 2;
 * 2. **el clon YA modela la dimensión CTA** (`Footer tipo="caso"`). Lo que le
 *    falta es **la piel**, que es un eje distinto. Escribir «cuatro pies»
 *    habría metido la CTA dentro de la piel y duplicado la variante de `L1`.
 *
 * Es §*dos variables confundidas* al revés: la 85.ª midió **4 valores del
 * TOTAL** y nombró «4 pies»; descompuesto por sección, el total confundía
 * **piel × CTA**. El total era el contenedor.
 */
const pielesDe = (width) => {
  const sinCta = new Map();
  for (const f of salida.porAncho[width].familias) {
    const { cta, ...resto } = f.partes;
    const k = JSON.stringify(resto);
    if (!sinCta.has(k)) sinCta.set(k, { partes: resto, formas: {}, instancias: 0, cta: {} });
    const e = sinCta.get(k);
    for (const [nom, n] of Object.entries(f.formas)) e.formas[nom] = (e.formas[nom] || 0) + n;
    e.instancias += f.instancias;
    if (cta != null) for (const nom of Object.keys(f.formas)) e.cta[nom] = cta;
  }
  return [...sinCta.values()]
    .map((e) => ({ ...e, total: +Object.values(e.partes).reduce((a, b) => a + b, 0).toFixed(2), establecida: e.instancias >= 2 }))
    .sort((a, b) => b.instancias - a.instancias);
};
salida.pieles = { 1440: pielesDe(1440), 390: pielesDe(390) };

/* ── El control que hace discriminante el resultado: los dos anchos tienen
 *    que dar la MISMA partición de formas en familias. Si no, «cuatro pies» es
 *    una propiedad de un ancho y no del sitio. */
const particion = (width) =>
  salida.porAncho[width].familias
    .map((f) => Object.keys(f.formas).sort().join("+"))
    .sort()
    .join(" | ");
salida.control = {
  particion1440: particion(1440),
  particion390: particion(390),
  coincide: particion(1440) === particion(390),
};

w("medidas/pie-familias.json", salida);

/* ─────────────────────────────── informe ─────────────────────────────── */

console.log(`\n═══ LOS PIES DEL ORIGINAL, POR FAMILIA · derivado de los espejos congelados\n`);
for (const width of ANCHOS) {
  const a = salida.porAncho[width];
  console.log(`── @${width} · ${a.familias.length} familias de pie sobre ${a.formasConPie} formas ──`);
  console.log(`  ${"formas".padEnd(46)} ${"links".padStart(9)} ${"legal".padStart(8)} ${"backg".padStart(8)} ${"cta".padStart(8)} ${"total".padStart(9)}   n`);
  for (const f of a.familias) {
    const nom = Object.entries(f.formas).map(([k, v]) => `${k}(${v})`).join(" ");
    const p = f.partes;
    console.log(
      `  ${nom.padEnd(46)} ${String(p.links ?? "—").padStart(9)} ${String(p.legal ?? "—").padStart(8)} ${String(p.background ?? "—").padStart(8)} ${String(p.cta ?? "—").padStart(8)} ${String(f.total).padStart(9)}  ${String(f.instancias).padStart(2)}${f.establecida ? "" : "  ⚠ n=1: varianza cero NO ESTABLECIDA"}`,
    );
  }
  if (a.formasConMasDeUnPie.length) {
    console.log(`  ⚠ formas que sirven MÁS DE UN pie: ${a.formasConMasDeUnPie.map((x) => `${x.forma}(${x.pies})`).join(" · ")}`);
  }
  console.log("");
}

console.log(`── CONTROL · la partición tiene que ser la MISMA a los dos anchos ──`);
console.log(`  @1440  ${salida.control.particion1440}`);
console.log(`  @390   ${salida.control.particion390}`);
console.log(`  ${salida.control.coincide ? "✓ coinciden" : "❌ NO coinciden: «cuatro pies» sería propiedad de un ancho, no del sitio"}\n`);

const sinEstablecer = salida.porAncho[1440].familias.filter((f) => !f.establecida);
if (sinEstablecer.length) {
  console.log(`⚠ ${sinEstablecer.length} familia(s) con n = 1 por la firma ENTERA — ver las PIELES abajo:`);
  for (const f of sinEstablecer) console.log(`   ${Object.keys(f.formas).join("+")} · total ${f.total}`);
  console.log("");
}

/* ── LAS PIELES: la CTA fuera de la firma ── */
console.log(`── PIELES · la sección CTA es una dimensión ORTOGONAL, no parte de la piel ──`);
for (const width of ANCHOS) {
  console.log(`  @${width}`);
  for (const p of salida.pieles[width]) {
    const cta = Object.entries(p.cta).map(([k, v]) => `${k}+CTA(${v})`).join(" ");
    console.log(
      `    links ${String(p.partes.links).padStart(8)} · legal ${String(p.partes.legal).padStart(7)} · backg ${String(p.partes.background).padStart(7)}` +
        `  n=${String(p.instancias).padStart(2)}${p.establecida ? " " : " ⚠"}  ${Object.keys(p.formas).join(" ")}${cta ? `   [${cta}]` : ""}`,
    );
  }
}
const nPieles = salida.pieles[1440].length;
const pielesSinEstablecer = salida.pieles[1440].filter((p) => !p.establecida).length;
console.log(
  `\n  ${salida.porAncho[1440].familias.length} familias por la firma entera ⇒ **${nPieles} PIELES** al sacar la CTA` +
    ` · ${pielesSinEstablecer === 0 ? "las " + nPieles + " con n ≥ 2" : pielesSinEstablecer + " sin establecer"}\n`,
);

const nFam = salida.porAncho[1440].familias.length;
console.log(`  ✓ evaluadas ${ANCHOS.length}/${ANCHOS.length} anchos · ${nFam} familias · ${nPieles} pieles · partición ${salida.control.coincide ? "estable" : "INESTABLE"}\n`);

process.exitCode = salida.control.coincide && salida.porAncho[1440].formasConMasDeUnPie.length === 0 ? 0 : 1;
