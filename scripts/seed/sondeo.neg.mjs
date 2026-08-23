/**
 * TEST EN NEGATIVO de `sondeo` — entero, y **cada sabotaje reproduce UNO de los
 * tres defectos de instrumento del 2026-08-04**.
 *
 * ⚠ **REESCRITO 2026-08-04 (F2-2 bloque 2): las TRES dianas están HOY fuera del
 * catálogo, y este fichero lo VERIFICA en vez de fingir que muerde.** Al
 * re-correr el negativo entero tras migrar al runner común, los tres sabotajes
 * salieron **exit 0** — y no por la migración: la tanda 26.ª cerró las tres
 * fronteras que les daban diana (teaser → dato propio §2g eliminó las 31
 * relaciones con `href`; `seo.title` medido §2h eliminó el grupo ausente;
 * `RUTAS_EN_FRONTERA = []` hizo no-op quitar la poda) **y nadie re-corrió este
 * negativo después**. Es la regla 8a cobrada en su forma silenciosa: *un
 * sabotaje que no cambia el resultado no ha probado la guarda — ha probado que
 * el instrumento ya no la ejercita*, y un 3/3 de julio citado en agosto habría
 * sido un verde de otra época.
 *
 * | sabotaje | reintroduce | HOY cae por | volverá a morder cuando |
 * |---|---|---|---|
 * | `slug`  | el lector de llaves sin `href` | **SIN DIANA** | el corpus traiga relaciones |
 * | `grupo` | no descender a un grupo ausente | **SIN DIANA** | un grupo `required` vuelva a faltar |
 * | `ciclo` | el grafo sin podar | **SIN DIANA** | el ciclo vuelva (57 casos · 149 entradas) |
 *
 * **El mecanismo es el del punto ciego de `cms-roundtrip.neg`**: cada sabotaje
 * se corre igual y se exige su SIN DIANA nombrado. El día que uno muerda de
 * verdad —exit ≠ 0 con SU invariante en vez de SIN DIANA— este fichero sale
 * ROJO con la instrucción de devolverlo a la tabla de los que cazan. Una diana
 * perdida documentada y no verificada envejece sola; ésta avisa cuando vuelve.
 *
 * Uso: npm run cms:sondeo-neg
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const SONDEO = join(QA, "../seed/sondeo.mjs");
const ENV = join(QA, "../../apps/cms/.env");

/**
 * Las tres dianas perdidas. `siMordiera` es el invariante ORIGINAL de cada una:
 * si reaparece en la salida, la diana volvió y este fichero exige devolver el
 * sabotaje a la tabla de los que cazan (con sus comprobaciones de artefacto,
 * que están en git — commit 65d6cf5 y anteriores).
 */
const dianasPerdidas = [
  {
    sabotaje: "slug",
    porQue: "sin relaciones con `href` en el catálogo (§2g), el lector saboteado deriva las mismas llaves",
    siMordiera: /VALOR\(ES\) DE RELACIÓN SIN LLAVE DERIVABLE/,
  },
  {
    sabotaje: "grupo",
    porQue: "con `productos.seo` medido (§2h), no descender en ausentes ya no salta ninguna auditoría",
    siMordiera: /RUTA\(S\) `required` DEL ESQUEMA SIN AUDITAR/,
  },
  {
    sabotaje: "ciclo",
    porQue: "con `RUTAS_EN_FRONTERA` vacía (§2g), quitar la poda no reintroduce ninguna arista",
    siMordiera: /CICLO EN EL GRAFO DE DEPENDENCIAS/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · sondeo de frontera ════════`);
console.log(`  ${dianasPerdidas.length} sabotajes CON DIANA PERDIDA (verificada, no supuesta) + control\n`);

const ev = new Evaluadas({ nombre: "sondeo-neg", unidad: "sabotajes", minimo: dianasPerdidas.length });
let fallos = 0;

/* Todo pasa por `corridaNegativa`: el desvío a `-neg-` lo pone NEG por
 * construcción. El control de antes iba con PISAR sobre `sondeo-frontera.json`
 * — la canónica que las fronteras del bloque 1 citan (regla 5 automatizada). */
const corre = (etiqueta, extra = {}) =>
  corridaNegativa({
    etiqueta,
    args: [`--env-file=${ENV}`, SONDEO],
    env: extra,
    timeout: 300_000,
  });

for (const c of dianasPerdidas) {
  /* El artefacto de una corrida ANTIGUA (cuando la diana existía) no puede
   * quedarse pareciendo actual: se borra antes de correr. */
  const fichero = join(QA, `medidas/sondeo-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.siMordiera.test(out)) {
    mal =
      `¡AHORA SÍ muerde! (${c.siMordiera})\n` +
      `      Eso es una BUENA noticia y este fichero está desactualizado: la diana\n` +
      `      volvió al catálogo. Devuelve \`${c.sabotaje}\` a la tabla de los que cazan\n` +
      `      (sus comprobaciones de artefacto están en git, commit 65d6cf5).`;
  } else if (res.status === 0) mal = `exit 0 — ni mordió ni declaró SIN DIANA: la sonda no comprobó su diana`;
  else if (!/SIN DIANA/.test(out)) mal = `exit ${res.status} sin «SIN DIANA» — cayó por otra cosa`;

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  ${mal}`);
  } else console.log(`  ○  SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  SIN DIANA declarado — ${c.porQue}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL DENOMINADOR DEL CONTROL SE **DERIVA**, Y AQUÍ ESTABA CABLEADO
 * (corregido 2026-08-23, 98.ª tanda — §regla 5ter)
 *
 * Ponía `/evaluadas 46\/46 filas de catálogo/`, escrito el **2026-08-04**,
 * cuando `SEMBRADAS` tenía de verdad 46 filas. Desde entonces los catálogos
 * crecieron —`casos` y `faqs` cambiaron de fuente el 2026-08-13 (4→57 y 2→19),
 * y el resto con ellos—, así que el control llevaba **rojo desde entonces** y
 * **nadie lo vio**: `sondeo.neg` está en el grupo `conDb`, y la corrida completa
 * de `qa:negativos` se agota antes de llegar (47 corridos de 78 censados).
 *
 * ⚠ **Y no se arregla poniendo el número de hoy.** Eso sería *«un caso que pasa
 * a verde AJUSTANDO su expectativa al valor de hoy»* (§regla 21): volvería a
 * envejecer en la primera tanda que siembre algo. Se deriva **de la misma
 * fuente que la sonda usa para declarar su mínimo** —`CATALOGOS` +
 * `cargaCatalogos()`—, que es literalmente lo que §regla 5ter pide: *el valor
 * que un control escribe se DERIVA de la fuente que lo declara, nunca se
 * cablea; y si no se puede derivar, la sonda TIRA en vez de suponer*.
 *
 * ⚠ Y se comprueba el par entero, no sólo el denominador: `N/M` con `N !== M`
 * es «no se midió todo» y sale rojo igual (§regla 22 — el cardinal al lado del
 * booleano).
 * ═════════════════════════════════════════════════════════════════════════ */
const { CATALOGOS, cargaCatalogos } = await import("./catalogos.mjs");
const FILAS_ESPERADAS = await (async () => {
  const c = await cargaCatalogos();
  const n = CATALOGOS.reduce((a, x) => a + (c.get(x.coleccion)?.length ?? 0), 0);
  if (!n)
    throw new Error(
      "DENOMINADOR NO DERIVABLE: los catálogos suman 0 filas.\n" +
        "  Eso no es «el control no tiene qué comprobar»: es que no se pudo derivar,\n" +
        "  y las dos cosas no pueden dar la misma salida (§regla 6).",
    );
  return n;
})();

/** `null` si la línea de unidades está y cuadra; el motivo si no. */
function malUnidades(salida) {
  const m = /evaluadas (\d+)\/(\d+) filas de catálogo/.exec(salida);
  if (!m) return "sin la línea de unidades evaluadas";
  const [, n, total] = m.map(Number);
  if (n !== total) return `evaluó ${n} de ${total}: no midió todo lo que declara`;
  if (total !== FILAS_ESPERADAS)
    return `declara ${total} filas y los catálogos suman ${FILAS_ESPERADAS} — el denominador no sale de la fuente`;
  return null;
}

/* ── EL CONTROL, que es lo que decide si los tres de arriba significan algo.
 *    Sin él, una sonda que fallara SIEMPRE los pasaría los tres — y la lección
 *    de F2-1 §5 se pagó justo por no tenerlo. ─────────────────────────────── */
const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
if (ctl.status !== 0) {
  fallos++;
  console.log(`  ❌ CONTROL          exit ${ctl.status} — sin sabotaje tiene que salir 0`);
} else if (!/0 defecto\(s\) de INSTRUMENTO/.test(ctlOut)) {
  fallos++;
  console.log(`  ❌ CONTROL          exit 0 pero sin la línea de 0 defectos de instrumento`);
} else if (!malUnidades(ctlOut)) {
  console.log(`  ✓  CONTROL         (sin sabotaje) exit 0 con sus ${FILAS_ESPERADAS} filas — la sonda no falla siempre`);
} else {
  /* La línea de unidades es la mitad legible del contrato: un verde sin ella no
   * distingue «no hay defectos» de «no se midió». */
  fallos++;
  console.log(`  ❌ CONTROL          exit 0 pero ${malUnidades(ctlOut)}`);
}

const total = dianasPerdidas.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} sondeo · test en negativo: ${total - fallos}/${total}` +
    ` (${dianasPerdidas.length} dianas perdidas verificadas · control)\n` +
    (fallos === 0
      ? `   Las tres guardas de instrumento SIGUEN en el código y sus dianas están HOY\n` +
        `   fuera del catálogo (§2g · §2h) — verificado, no supuesto. El día que el\n` +
        `   corpus las reintroduzca, este fichero sale ROJO y exige devolverlas a la\n` +
        `   tabla de los que cazan.\n`
      : `   NADA de lo que mida \`sondeo\` se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
