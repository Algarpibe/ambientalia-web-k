/**
 * ⛔ EL ESCALÓN DE LA TIPOGRAFÍA DE `articulos-kb` — la evidencia, congelada.
 * Uso:  npm run qa:kb-tipografia        (offline: lee las medidas congeladas)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PREGUNTA, Y POR QUÉ APARECE AHORA Y NO EN LAS SPECS
 *
 * `modulos.spec.md` §1.1 **midió** que el `h2` tiene más de una piel y lo dijo:
 *
 *   > *«El `h2` tiene DOS pieles y las separa el peso, no el nivel. Un
 *   > componente que trate “h2” como una sola cosa se equivoca en 11 de 17.»*
 *
 * Lo que la spec **no** contestó —porque no era su pregunta— es la que aparece
 * al escribir el componente: **¿con qué las separa el componente?** Una spec
 * dice qué valores hay; una plantilla necesita un DISCRIMINADOR.
 *
 * Esta sonda lo busca en los cuatro sitios donde podría estar y **congela el
 * resultado**, que es lo que la consigna llama *parar con la evidencia*:
 *
 *   1 · el HTML del campo rico (`style=` o `class=` en la propia etiqueta);
 *   2 · las clases del módulo, quitando el ordinal `et_pb_text_N`;
 *   3 · `estiloInline` del módulo;
 *   4 · la ESTRUCTURA: reparto de la fila, posición, ritmo, etiquetas vecinas.
 *
 * ── Por qué el ordinal `et_pb_text_N` NO cuenta como discriminador ────────
 * Es el gancho con el que Divi cuelga el CSS compilado de los ajustes de ESE
 * módulo (`et-core-unified-…css`). O sea que **es la huella del campo que
 * falta**, no un dato: `N` es el ordinal del módulo dentro de la página y no
 * significa nada fuera de ella. Aceptarlo sería cablear la piel a la posición
 * — el arreglo falso, con la instancia siguiente por delante.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, hoy, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const MEDIDAS = join(QA, "medidas");
const lee = (f) => JSON.parse(readFileSync(join(MEDIDAS, f), "utf8"));

/** Un titular medido, con todo lo que podría discriminarlo. */
function titulares(spec) {
  const out = [];
  for (const [url, art] of Object.entries(spec.articulos)) {
    const slug = url.split("/").filter(Boolean).pop();
    art.propias[0].filas.forEach((f, fi) => {
      if (f.renderizada === false) return;
      const reparto = (f.columnas || []).map((c) => String(c.tipo).replace("et_pb_column_", "")).join("+");
      (f.columnas || []).forEach((c, ci) =>
        (c.modulos || []).forEach((m, mi) => {
          if (m.kind !== "text") return;
          for (const t of m.titulares || []) {
            const attrs = new RegExp(`<${t.etiqueta}([^>]*)>`, "i").exec(m.html || "")?.[1] ?? "";
            out.push({
              slug,
              donde: `f${fi}c${ci}m${mi}`,
              etiqueta: t.etiqueta,
              piel: `${t.tipo.fontSize}/${t.tipo.lineHeight} w${t.tipo.fontWeight} ${t.tipo.color}`,
              /* 1 · el HTML del campo rico */
              htmlStyle: /style=/.test(attrs) ? attrs.match(/style="([^"]*)"/)?.[1] ?? "" : null,
              htmlClass: /class=/.test(attrs) ? attrs.match(/class="([^"]*)"/)?.[1] ?? "" : null,
              /* 2 · las clases del módulo, SIN el ordinal */
              clases: m.clases.filter((x) => !/^et_pb_text_\d+$/.test(x) && x !== "et_pb_text").sort().join(" "),
              /* 3 · el estilo en línea del módulo */
              estiloInline: m.estiloInline,
              /* 4 · la estructura */
              reparto,
              fila: fi,
              primeroDeColumna: mi === 0,
              mb: m.ritmo.marginBottom,
              mt: m.ritmo.marginTop,
              etiquetasDelModulo: (m.etiquetas || []).join(","),
            });
          }
        }),
      );
    });
  }
  return out;
}

const t1440 = titulares(lee("kb-spec-1440.json"));
const t390 = titulares(lee("kb-spec-390.json"));

const ev = new Evaluadas({ unidad: "titulares", minimo: t1440.length, nombre: "kb-tipografia" });

/** Los ejes candidatos a discriminador, en el orden en que se buscaron. */
const EJES = [
  "htmlStyle",
  "htmlClass",
  "clases",
  "estiloInline",
  "reparto",
  "primeroDeColumna",
  "fila",
  "mb",
  "mt",
  "etiquetasDelModulo",
];

/** Por etiqueta: las pieles, y qué eje (si alguno) las separa sin solaparse. */
const porEtiqueta = {};
for (const t of t1440) {
  const e = (porEtiqueta[t.etiqueta] ??= { pieles: {}, n: 0 });
  (e.pieles[t.piel] ??= []).push(t);
  e.n++;
  ev.ok();
}

const veredictos = [];
for (const [etiqueta, { pieles, n }] of Object.entries(porEtiqueta).sort()) {
  const nombres = Object.keys(pieles);
  if (nombres.length === 1) {
    veredictos.push({ etiqueta, n, pieles: nombres, veredicto: "UNA PIEL", discriminador: null });
    continue;
  }

  /* ── test B: ¿coexisten dos pieles en la MISMA página? ⇒ CAMPO ─────────── */
  const paginasPorPiel = Object.fromEntries(nombres.map((p) => [p, new Set(pieles[p].map((t) => t.slug))]));
  const intraPagina = [];
  for (let i = 0; i < nombres.length; i++)
    for (let j = i + 1; j < nombres.length; j++)
      for (const s of paginasPorPiel[nombres[i]])
        if (paginasPorPiel[nombres[j]].has(s)) intraPagina.push({ a: nombres[i], b: nombres[j], slug: s });

  /* ── ¿algún eje separa las pieles sin solapar un solo valor? ───────────── */
  const separa = [];
  for (const eje of EJES) {
    const valores = Object.fromEntries(nombres.map((p) => [p, new Set(pieles[p].map((t) => String(t[eje])))]));
    let solapa = false;
    for (let i = 0; i < nombres.length && !solapa; i++)
      for (let j = i + 1; j < nombres.length && !solapa; j++)
        for (const v of valores[nombres[i]]) if (valores[nombres[j]].has(v)) solapa = true;
    if (!solapa) separa.push(eje);
  }

  /**
   * ⚠ **UN DISCRIMINADOR HALLADO EN UNA SOLA PÁGINA NO ES UN DISCRIMINADOR.**
   *
   * Con las dos pieles viviendo en la misma página, **cualquier** eje posicional
   * las separa por accidente: `fila` y `mb` «separan» los 8 `h3` de
   * `que-es-kunak-air-cloud` porque los 4 de un color caen antes que los 4 del
   * otro, no porque el color dependa de la fila. Es §sondas 4 en su tercera
   * cara —*un detector que encuentra MÁS de lo que hay da un número plausible
   * de más*— y aquí produciría una plantilla que cablea la piel a la posición.
   *
   * Se exige que la separación se sostenga en **≥2 páginas**: si todas las
   * instancias de las pieles enfrentadas están en una, el eje se reporta como
   * **NO ESTABLECIDO** con su denominador, que es lo único que la medida
   * respalda.
   */
  const paginas = new Set(nombres.flatMap((p) => pieles[p].map((t) => t.slug)));
  const poder = paginas.size;
  veredictos.push({
    etiqueta,
    n,
    pieles: nombres.map((p) => `${p} ×${pieles[p].length}`),
    intraPagina: intraPagina.map((x) => `${x.slug}: «${x.a}» y «${x.b}»`),
    /** El test B con su nombre: dos hermanos de la misma página ⇒ lo escribió una persona. */
    veredicto: intraPagina.length ? "CAMPO (test B)" : "SIN PROBAR — no coexisten en una página",
    paginasImplicadas: poder,
    discriminador: separa.length && poder >= 2 ? separa : null,
    discriminadorNoEstablecido: separa.length && poder < 2 ? separa : null,
  });
}

/* ── LA GUARDA: una piel CAMPO sin discriminador es el escalón ───────────── */
const sinDiscriminador = veredictos.filter((v) => v.veredicto.startsWith("CAMPO") && !v.discriminador);

/* ── El control de forma: el árbol tiene que ser el mismo a los dos anchos ─ */
const problemas = [];
if (t1440.length !== t390.length)
  problemas.push(`DESCUADRE de titulares entre anchos: ${t1440.length} a 1440 y ${t390.length} a 390`);

console.log(`\n════════ TIPOGRAFÍA DE LOS TITULARES · articulos-kb ════════`);
console.log(`  ${t1440.length} titulares en los 79 módulos de texto de las 6 instancias\n`);
for (const v of veredictos) {
  console.log(`  ${v.etiqueta.toUpperCase()}  n=${v.n}  ${v.veredicto}`);
  for (const p of v.pieles) console.log(`      · ${p}`);
  if (v.intraPagina?.length) for (const x of v.intraPagina) console.log(`      ↳ misma página: ${x}`);
  if (v.veredicto === "UNA PIEL") continue; // nada que discriminar
  if (v.discriminador) console.log(`      discriminador: ${v.discriminador.join(" · ")} (en ${v.paginasImplicadas} páginas)`);
  else if (v.discriminadorNoEstablecido)
    console.log(
      `      discriminador: ${v.discriminadorNoEstablecido.join(" · ")} — ⚠ NO ESTABLECIDO: ` +
        `las dos pieles viven en UNA sola página, así que cualquier eje posicional las separa por accidente`,
    );
  else console.log(`      discriminador: NINGUNO de los ${EJES.length} ejes`);
}

w("medidas/kb-tipografia.json", {
  meta: {
    fecha: hoy(),
    que: "Las pieles tipográficas de los titulares de `articulos-kb` y la búsqueda de un discriminador para la plantilla.",
    fuente: ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json"],
    ejes: EJES,
    porQue:
      "`modulos.spec.md` §1.1 midió que el h2 tiene más de una piel. Esto contesta la pregunta SIGUIENTE, " +
      "que es la que necesita el componente: con qué las separa.",
    ordinalExcluido:
      "`et_pb_text_N` NO cuenta: es el gancho del CSS compilado de ESE módulo, o sea la huella del campo que falta.",
  },
  veredictos,
  sinDiscriminador: sinDiscriminador.map((v) => v.etiqueta),
  problemas,
  titulares: t1440,
});

if (problemas.length) {
  console.log(`\n❌ ${problemas.length} problema(s) de forma: ${problemas.join(" · ")}`);
  process.exitCode = 1;
} else if (sinDiscriminador.length) {
  console.log(
    `\n⛔ ESCALÓN — ${sinDiscriminador.length} etiqueta(s) con piel de CAMPO y NINGÚN discriminador servido:\n` +
      sinDiscriminador.map((v) => `     · <${v.etiqueta}>: ${v.pieles.join("  ·  ")}`).join("\n") +
      `\n\n   El dato que el clon guarda NO puede reproducir estas pieles: el content type\n` +
      `   de \`texto-kb\` no tiene campo para ellas y el HTML servido no las distingue.\n` +
      `   Es una forma que las specs no anticiparon ⇒ se para aquí con la evidencia\n` +
      `   congelada, en vez de cablear la mayoritaria y llamar Δ a la diferencia.\n`,
  );
  process.exitCode = 3;
} else console.log(`\n✅ toda piel de CAMPO tiene discriminador servido.`);

console.log(`  ✓ evaluadas ${ev.n}/${t1440.length} titulares · kb-tipografia`);
