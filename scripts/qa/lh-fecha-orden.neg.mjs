/**
 * TEST EN NEGATIVO de `lh-fecha-orden`.
 * Uso: npm run qa:lh-fecha-orden-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda decide una PRECONDICIÓN de esquema —si se añade un campo a dos
 * colecciones—, así que su negativo tiene que probar las TRES formas de decir
 * que sí sin haberlo medido:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-listados` | **NO SE PUDO EVALUAR** (0 < mínimo) | «el modelo acierta 0/0», que es el pleno de un instrumento vacío |
 * | `un-solo-modelo` | **0 SEPARADORAS ⇒ SIN PROBAR** | verde: un modelo sin rival da pleno y no ha elegido nada |
 * | `fecha-rota` | **NO REPRODUCE** (disparador (a)) | verde: si quitarle la fecha al primero no mueve el veredicto, la sonda no está leyendo el orden |
 *
 * `fecha-rota` es el que protege la decisión: sin él, un «57/57» podría venir
 * de comparar una lista consigo misma. Le pone una fecha FALSA **al primer slug
 * del orden servido**, que es el que más lo desplaza.
 *
 * ⚠ **Y se estrenó FALLANDO, con el defecto en el sabotaje y no en la sonda.**
 * Su primera versión *borraba* la fecha, y eso saca la tarjeta del conjunto
 * comparado: el modelo seguía dando pleno sobre las 56 restantes y la sonda
 * caía por el **MÍNIMO** (93/94). Exit 2 —el esperado— con el motivo
 * equivocado. Lo cazó `esperaEnSalida`, no el código de salida (§regla 1), y es
 * §regla 17-hermana: *un sabotaje que comparte variable con el mínimo mueve la
 * portería*. Ahora ataca el ORDEN, que es lo que la sonda afirma.
 *
 * ── EL CONTROL (§sondas, regla 8a) ────────────────────────────────────────
 * Sin sabotaje: verde, con pleno en los dos arquetipos y
 * `separadorasTotales > 0`. Si el control no separase nada, los rojos de abajo
 * no probarían nada — podrían venir de un corpus que no se lee. Y comprueba
 * además que el canal esté ENTERO por su otro lado: `/glosario` tiene que
 * haber leído sus **8** páginas, porque con 1 el «37/37» sería un 5/5.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-fecha-orden.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: pleno en los DOS arquetipos y elegido con separadoras > 0",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      const a = j.arquetipos["L5-casos"];
      const g = j.arquetipos["L2-glosario"];
      if (!a || !g) return "faltan arquetipos en la congelada";
      if (!a.pleno || !g.pleno) return `el control no da pleno (casos ${a.veredicto} · glosario ${g.veredicto}): los rojos no probarían nada`;
      if (!j.veredicto.separadorasTotales) return "0 separadoras en el CONTROL: el sabotaje `un-solo-modelo` no probaría nada";
      /* El canal del orden tiene que estar ENTERO, y su forma de romperse es
       * silenciosa: leer sólo el índice de `/glosario` daría 5 tarjetas y un
       * «5/5» que se lee igual de bien que un 37/37. */
      if (g.paginasLeidas !== 8) return `glosario leyó ${g.paginasLeidas} páginas y son 8: un 37/37 con 1 página es un 5/5 disfrazado`;
      if (a.paginasLeidas !== 1) return `casos leyó ${a.paginasLeidas} páginas y es 1: page/2 es un duplicado (D2.4) y contaría las tarjetas dos veces`;
      if (a.comparadas !== a.singularesEnDisco) return `casos compara ${a.comparadas} de ${a.singularesEnDisco} singulares`;
      if (g.comparadas !== g.singularesEnDisco) return `glosario compara ${g.comparadas} de ${g.singularesEnDisco} singulares`;
      /* §regla 14: la limitación se declara CON SU NÚMERO, no como nota al pie */
      if (!j.meta.noMide.some((s) => /\d+ de \d+/.test(s))) return "`noMide` no declara su cardinal (§regla 14)";
      return null;
    },
  },
  {
    etiqueta: "sin-listados",
    porQue: "sin el HTML de los listados no hay orden servido: cae por el MÍNIMO, no por «acierta 0/0»",
    env: { SABOTAJE: "sin-listados" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NO SE PUDO EVALUAR/,
    /* Y NO por el otro motivo: con 0 tarjetas el modelo «acierta» 0/0 y eso
     * imprimiría un pleno con el código de salida bueno y el motivo falso. */
    prohibidoEnSalida: /REPRODUCE el orden servido/,
  },
  {
    etiqueta: "un-solo-modelo",
    porQue: "sin rivales el modelo da pleno y NO ha elegido: 0 separadoras ⇒ SIN PROBAR",
    env: { SABOTAJE: "un-solo-modelo" },
    exit: 2,
    congela: false,
    esperaEnSalida: /SIN PROBAR/,
    prohibidoEnSalida: /✅/,
  },
  {
    etiqueta: "fecha-rota",
    porQue: "falsear la fecha del primer slug servido tiene que TUMBAR el pleno: si no, no se está leyendo el orden",
    env: { SABOTAJE: "fecha-rota" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NO REPRODUCE/,
  },
];

const ev = new Evaluadas({ sonda: "lh-fecha-orden.neg", unidad: "casos", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: ["scripts/qa/lh-fecha-orden.mjs"], env: c.env });
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
  /* §regla 7: un artefacto de negativo NO puede parecer una medida */
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
    : `\n✅ ${casos.length}/${casos.length} — la sonda sabe FALLAR: sin listados no evalúa, sin rival no elige,\n        y una fecha rota tumba el pleno en vez de convivir con él.`,
);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} casos · lh-fecha-orden.neg`);
process.exit(fallos ? 2 : 0);
