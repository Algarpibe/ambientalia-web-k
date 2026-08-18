/**
 * TEST EN NEGATIVO de `lh-selectores`.
 * Uso: npm run qa:lh-selectores-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda afirma **dos cosas a la vez** —que el arreglo GANA formas y que no
 * MUEVE las que ya casaban—, y las dos se pueden falsear por separado:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-corpus` | **NO SE PUDO EVALUAR** (0 < 149) | «9 formas a 0/0», que es el verde de un instrumento vacío |
 * | `un-solo-grupo` | **UN SOLO GRUPO** — `parciales()` no discrimina | «0 parciales», que es la afirmación CONTRARIA con la misma salida |
 * | `extracto-viejo` | **EL ARREGLO NO GANA NI UNA TARJETA** | verde por NO-OP trivial: dos listas iguales no se mueven entre sí |
 *
 * `extracto-viejo` es el que da nombre al negativo. La sonda existe para probar
 * un NO-OP, y **un NO-OP es trivialmente cierto si no has cambiado nada**: sin
 * este caso, un arreglo revertido por accidente saldría verde diciendo
 * literalmente «NO-OP confirmado». Es §*un patrón que casa en TODAS tampoco mide
 * nada* aplicado al CONTROL en vez de al selector.
 *
 * `un-solo-grupo` protege la pieza nueva de `lib.mjs`: `Censo.parciales()`
 * devuelve `[]` cuando hay menos de dos grupos, y ese `[]` se lee igual que «no
 * hay parciales» (§regla del cero). La sonda tiene que negarse a opinar.
 *
 * ── EL CONTROL (§sondas, regla 8a) ────────────────────────────────────────
 * Sin sabotaje: verde, con `noOp.rotos === 0` **y** ganancia > 0 **y** ≥2
 * grupos. Si el control no ganara tarjetas, `extracto-viejo` no probaría nada.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-selectores.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: NO-OP sobre lo que ya casaba Y ganancia > 0 en las formas nuevas",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      if (j.noOp.rotos) return `${j.noOp.rotos} tarjetas movidas: el arreglo NO es NO-OP`;
      const ganados = Object.values(j.cobertura).reduce((s, v) => s + v.conNuevo - v.conViejo, 0);
      if (!ganados) return "el control no gana NI UNA tarjeta: el sabotaje `extracto-viejo` no probaría nada";
      if (j.formas.length < 2) return `${j.formas.length} formas: el sabotaje \`un-solo-grupo\` no probaría nada`;
      /* ⚠ EL ARREGLO TIENE DOS MITADES Y LAS DOS TIENEN QUE APORTAR EN EL
       * CONTROL. Si una no ganara nada, el sabotaje que la anula no probaría
       * nada de ella — y su código podría estar muerto sin que nadie lo viera.
       * Es lo que dejó pasar la 1.ª versión: el sabotaje revertía sólo la lista
       * y las 56 del texto suelto mantenían el verde. */
      const vias = Object.values(j.cobertura).flatMap((v) => Object.keys(v.selUsados));
      if (!vias.includes(".scientific-excerpt")) return "el control no usa `.scientific-excerpt` en ninguna forma: media hipótesis sin ejercitar";
      if (!vias.includes("«suelto»")) return "el control no usa el rescate de texto SUELTO en ninguna forma: media hipótesis sin ejercitar";
      /* Las dos formas que ya casaban tienen que seguir EXACTAS: es el
       * antes/después que el encargo pide con su número, no una impresión. */
      for (const f of ["blog", "etiqueta"]) {
        const c = j.cobertura[f];
        if (!c) return `falta la forma ${f} en la cobertura`;
        if (c.conViejo !== c.conNuevo) return `${f} se movió: ${c.conViejo} → ${c.conNuevo}`;
        if (!c.conViejo) return `${f} no casaba NADA antes: no es una forma de control válida`;
      }
      /* §regla 14: la limitación se declara con su cardinal */
      if (!j.meta.noMide.some((s) => /GEOMETR/i.test(s))) return "`noMide` no declara que la geometría no vale (el corpus no trae hojas)";
      if (!j.noEjercitados || typeof j.noEjercitados.vistos !== "number") return "no publica el inventario de selectores no ejercitados";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "sin páginas cae por el MÍNIMO, no por «9 formas a 0/0»",
    env: { SABOTAJE: "sin-corpus" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NO SE PUDO EVALUAR/,
    prohibidoEnSalida: /NO-OP confirmado/,
  },
  {
    etiqueta: "un-solo-grupo",
    porQue: "con un grupo `parciales()` devuelve [] y eso se lee como «0 parciales»: la sonda tiene que negarse",
    env: { SABOTAJE: "un-solo-grupo" },
    exit: 2,
    congela: false,
    esperaEnSalida: /UN SOLO GRUPO/,
    prohibidoEnSalida: /NO-OP confirmado/,
  },
  {
    etiqueta: "extracto-viejo",
    /* ⚠ Anula LAS DOS MITADES del arreglo —la lista y el rescate de texto
     * suelto—. La 1.ª versión revertía sólo la lista y el caso salía VERDE:
     * las 56 tarjetas de `L2` seguían ganándose por la otra mitad, así que el
     * sabotaje no llegaba a falsear la hipótesis que decía falsear. */
    porQue: "sin NINGUNA de las dos mitades del arreglo, el NO-OP es trivial: no se puede dar verde por no haber cambiado nada",
    env: { SABOTAJE: "extracto-viejo" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NO GANA NI UNA TARJETA/,
    prohibidoEnSalida: /NO-OP confirmado/,
  },
];

const ev = new Evaluadas({ sonda: "lh-selectores.neg", unidad: "casos", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: ["scripts/qa/lh-selectores.mjs"], env: c.env });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const problemas = [];
  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperaba ${c.exit})`);
  if (c.esperaEnSalida && !c.esperaEnSalida.test(salida)) problemas.push(`la salida no dice ${c.esperaEnSalida}`);
  /* §regla 1: no basta con que caiga — tiene que caer por SU motivo. */
  if (c.prohibidoEnSalida && c.prohibidoEnSalida.test(salida)) problemas.push(`cae por el motivo EQUIVOCADO: la salida dice ${c.prohibidoEnSalida}`);
  if (c.comprueba) {
    const f = join(QA, CANONICA);
    if (!existsSync(f)) problemas.push(`no congeló ${CANONICA}`);
    else {
      const malo = c.comprueba(JSON.parse(readFileSync(f, "utf8")));
      if (malo) problemas.push(malo);
    }
  }
  if (!c.congela) {
    const n = nombreNeg(CANONICA, c.etiqueta);
    if (existsSync(join(QA, n))) console.log(`     · artefacto marcado: ${n}`);
  }
  ev.ok(1);
  if (problemas.length) { fallos++; console.log(`  ✗ ${c.etiqueta} — ${problemas.join(" · ")}`); }
  else console.log(`  ✓ ${c.etiqueta} — ${c.porQue}`);
}

console.log(
  fallos
    ? `\n⛔ ${fallos}/${casos.length} casos del negativo NO se comportan como su tabla promete.`
    : `\n✅ ${casos.length}/${casos.length} — la sonda sabe FALLAR: sin corpus no evalúa, con un solo grupo\n        no opina de cobertura, y sin arreglo se niega a llamar NO-OP a no haber cambiado nada.`,
);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} casos · lh-selectores.neg`);
process.exit(fallos ? 2 : 0);
