/**
 * GUARDA DEL MANIFIESTO — «SIN RUTAS» DEJA DE SER UN VERDE.
 *
 * Uso:  node manifiesto.mjs                        (contra la base congelada)
 *       node manifiesto.mjs --cmp medidas/x.json
 *       node manifiesto.mjs --sin-base             (sólo consistencia interna)
 * Test en negativo:  npm run qa:manifiesto-neg
 *
 * ── El mecanismo que F2-3 estrena, y que ninguna sonda había visto ─────────
 * CMS-0c convierte **Postgres en dependencia de BUILD**: `generateStaticParams()`
 * consulta la Local API mientras `next build` corre. Eso mete en el proyecto un
 * modo de fallo nuevo, y es de los peores que tiene este repo:
 *
 *   > **un build con la DB caída no tiene por qué fallar: puede EMITIR MENOS
 *   > RUTAS.** Basta con que algo aguas arriba traduzca la ausencia a `[]` —un
 *   > `catch {}`, un `?? []`, un `find` que devuelve vacío porque la tabla no
 *   > está—. El build termina en verde, `.next` se escribe, el servidor arranca
 *   > y sirve **404 donde había páginas**.
 *
 * Y entonces toda sonda que **derive sus rutas del build** —`clon-base`,
 * `enlaces`, `slugs`: el patrón que este repo eligió a propósito para que se
 * automantengan— mide sobre el conjunto MENGUADO y no tiene forma de saberlo. Es
 * la familia «0 comparado = verde» (`CLAUDE.md` §sondas, 4bis) con un mecanismo
 * que sube un piso: ya no es la sonda la que no mira, **es el artefacto el que
 * no trae lo que hay que mirar**.
 *
 * ── Las DOS comprobaciones, y son independientes a propósito ───────────────
 *
 * | # | qué mira | de dónde saca la verdad | qué ve que la otra NO |
 * |---|---|---|---|
 * | **1 · familia vacía** | una familia de `dynamicRoutes` que emitió **0** rutas | **el build solo** | funciona sin línea base — sirve el día que la base no exista o no valga |
 * | **2 · contra la base** | rutas de la congelada que ya no están | la congelada de F2-1 | una familia que emite **menos, pero no cero** (5 de 6): para la #1 esa familia está viva |
 *
 * La #1 existe porque `dynamicRoutes` **sobrevive a un `generateStaticParams()`
 * vacío**: la familia sigue declarada aunque no emita nada. Sin ese testigo,
 * «la familia devolvió vacío» y «la familia no existe» dan la misma salida —
 * que es la regla del cero, otra vez, y aquí se compra por un campo del propio
 * manifiesto.
 *
 * ── El nivel al que se cuenta ──────────────────────────────────────────────
 * Se cuenta por **familia** (`srcRoute`) y no sólo el total. Un total dice que
 * algo bajó; el reparto dice **cuál**, que es lo que hace falta cuando F2-3
 * migra familia a familia y hay que saber cuál rompió (`CLAUDE.md` §El NIVEL al
 * que se mide).
 *
 * ── Por qué NO deriva su mínimo del build ─────────────────────────────────
 * `Evaluadas` exige derivar el mínimo en vez de escribirlo, y aquí eso se hace
 * **al revés que en las demás**: con línea base, el mínimo sale de LA BASE. Un
 * mínimo derivado del artefacto que se está auditando encoge con él —el build
 * degenerado se autoriza a sí mismo— y ése es exactamente el fallo que esta
 * sonda viene a impedir. Sin base (`--sin-base`) el mínimo sí sale del build,
 * pero de `dynamicRoutes`, que es la parte que NO encoge.
 */
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import {
  Evaluadas,
  QA,
  APP,
  env,
  hoy,
  leeManifiesto,
  rutasEmitidas,
  familiasEmitidas,
  familiasDinamicas,
  w,
} from "./lib.mjs";

/* No abre el clon: mide el artefacto de build, no el HTML servido. */
process.env.SIN_CLON = "1";

const args = process.argv.slice(2);
const sinBase = args.includes("--sin-base");
const iCmp = args.indexOf("--cmp");
const BASE_POR_DEFECTO = "medidas/clon-base-1440-f21-antes.json";
const ficheroCmp = sinBase ? null : iCmp >= 0 ? args[iCmp + 1] : BASE_POR_DEFECTO;

/**
 * ⚠ **GANCHO DE TEST, declarado y ruidoso.** El negativo necesita darle a la
 * sonda manifiestos saboteados, y la alternativa —copiar el árbol `.next`
 * entero, o pisar el manifiesto bueno y restaurarlo— o es carísima o deja el
 * artefacto real en un estado que un fallo a mitad no revierte. Se anuncia en
 * la salida **y** en la congelada (`meta.manifiesto`), porque un gancho que no
 * se ve en el fichero es un gancho que puede fabricar un verde sin dejar rastro.
 */
const MANIFIESTO = env("MANIFIESTO", null);

let manifiesto;
try {
  manifiesto = MANIFIESTO
    ? JSON.parse(readFileSync(isAbsolute(MANIFIESTO) ? MANIFIESTO : join(QA, MANIFIESTO), "utf8"))
    : leeManifiesto(APP);
} catch (e) {
  /* Un manifiesto que no se puede leer NO es «cero rutas»: es que no hay
   * artefacto. Sale por error, nunca por verde (regla 6: la ausencia se
   * rechaza, no se sustituye por un valor benigno). */
  console.error(`\n❌ NO HAY ARTEFACTO QUE AUDITAR — ${String(e.message || e)}`);
  process.exit(2);
}
if (MANIFIESTO) console.log(`⚠ MANIFIESTO=${MANIFIESTO} — no se audita el build real de ${APP}`);

const RUTAS = rutasEmitidas(manifiesto);
const FAMILIAS = familiasEmitidas(manifiesto);
const DINAMICAS = familiasDinamicas(manifiesto);

console.log(`\n════════ MANIFIESTO · rutas emitidas por el build ════════\n`);
for (const [fam, n] of [...FAMILIAS].sort(([a], [b]) => a.localeCompare(b)))
  console.log(`  ${fam.padEnd(46)} ${String(n).padStart(3)} ruta(s)`);
console.log(`  ${"—".repeat(46)} ${String(RUTAS.length).padStart(3)} en total`);

/* ═══════════ 1 · FAMILIA VACÍA — sin línea base, sólo con el build ═══════════ */

const vacias = DINAMICAS.filter((f) => !FAMILIAS.has(f));
if (vacias.length) {
  console.error(
    `\n❌ ${vacias.length} FAMILIA(S) DECLARADA(S) QUE NO EMITIERON NINGUNA RUTA:\n` +
      vacias.map((f) => `     · ${f}`).join("\n") +
      `\n   \`generateStaticParams()\` devolvió vacío. Con la Local API detrás, la\n` +
      `   causa típica es la DB caída o una consulta que traduce el fallo a [].\n` +
      `   Esto NO es «esa familia no tiene contenido»: es que no se pudo saber.\n`,
  );
} else if (DINAMICAS.length) {
  console.log(`\n✓ las ${DINAMICAS.length} familias dinámicas declaradas emitieron rutas`);
}

/* ═══════════ 2 · CONTRA LA LÍNEA BASE CONGELADA ═══════════ */

let desaparecidas = [];
let nuevas = [];
let rutasBase = null;

if (ficheroCmp) {
  const rutaCmp = isAbsolute(ficheroCmp) ? ficheroCmp : join(QA, ficheroCmp);
  let base;
  try {
    base = JSON.parse(readFileSync(rutaCmp, "utf8"));
  } catch (e) {
    console.error(`\n❌ no se pudo leer la línea base ${rutaCmp}: ${String(e.message || e)}`);
    process.exit(2);
  }
  /* La base puede ser una congelada de `clon-base` (tiene `paginas`) o de esta
   * misma sonda (tiene `rutas`). Se acepta cualquiera de las dos: son el mismo
   * conjunto medido por dos instrumentos, y exigir una sola obligaría a
   * mantener un tercer fichero con la misma lista. */
  rutasBase = Array.isArray(base.rutas)
    ? [...base.rutas].sort()
    : base.paginas
      ? Object.keys(base.paginas).sort()
      : null;
  if (!rutasBase?.length) {
    console.error(
      `\n❌ ${rutaCmp} no declara rutas (ni \`rutas\` ni \`paginas\`).\n` +
        `   Una base vacía haría que «no falta ninguna» fuese cierto por vacío.`,
    );
    process.exit(2);
  }
  desaparecidas = rutasBase.filter((r) => !RUTAS.includes(r));
  nuevas = RUTAS.filter((r) => !rutasBase.includes(r));

  console.log(`\n═══ contra ${ficheroCmp} (${rutasBase.length} rutas)\n`);
  if (nuevas.length) console.log(`  NUEVAS (no estaban en la base): ${nuevas.join(" · ")}`);
  if (desaparecidas.length) {
    console.error(`  ❌ DESAPARECIDAS del build (${desaparecidas.length}):`);
    desaparecidas.forEach((r) => console.error(`       · ${r}`));
  }
  if (!desaparecidas.length) console.log(`  ✅ están las ${rutasBase.length} rutas de la base`);
}

/* ═══════════ EL CONTRATO ═══════════
 *
 * Con base: la unidad es **la ruta de la base**, y el mínimo son todas. Un build
 * que pierda rutas cuenta menos y el gancho de `lib.mjs` cierra el código
 * aunque nadie mire este contador.
 *
 * Sin base: la unidad es **la familia dinámica declarada**, que es la parte del
 * manifiesto que NO encoge cuando la consulta devuelve vacío.
 */
const ev = ficheroCmp
  ? new Evaluadas({ nombre: "manifiesto vs base", unidad: "rutas de la base", minimo: rutasBase.length })
  : new Evaluadas({
      nombre: "manifiesto · familias",
      unidad: "familias dinámicas con rutas",
      minimo: Math.max(1, DINAMICAS.length),
    });

if (ficheroCmp) {
  for (const r of rutasBase) {
    if (RUTAS.includes(r)) ev.ok();
    else ev.fallo(r, "no emitida");
  }
} else {
  for (const f of DINAMICAS) {
    if (FAMILIAS.has(f)) ev.ok();
    else ev.fallo(f, "0 rutas emitidas");
  }
  if (!DINAMICAS.length) ev.fallo("(ninguna familia dinámica)", "el build no declara ninguna");
}

w(env("SALIDA") || "medidas/manifiesto.json", {
  meta: {
    fecha: hoy(),
    app: APP.replace(/\\/g, "/").replace(/^.*\/(apps\/web)$/, "$1"),
    manifiesto: MANIFIESTO ?? "(el del build)",
    base: ficheroCmp ?? "(sin base)",
  },
  rutas: RUTAS,
  familias: Object.fromEntries([...FAMILIAS].sort(([a], [b]) => a.localeCompare(b))),
  dinamicas: DINAMICAS,
  vacias,
  desaparecidas,
  nuevas,
});

const fallos = ev.informe();
const mal = vacias.length > 0 || desaparecidas.length > 0 || fallos > 0;
console.log(
  `\n${mal ? "❌" : "✅"} ${RUTAS.length} rutas · ${FAMILIAS.size} familias · ` +
    `${vacias.length} familia(s) vacía(s) · ${desaparecidas.length} desaparecida(s)`,
);
process.exit(mal ? 1 : 0);
