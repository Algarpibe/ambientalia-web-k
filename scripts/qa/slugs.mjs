/**
 * GUARDA DE UNICIDAD DE SLUG **ENTRE FAMILIAS** — el plano de `/es/`.
 *
 * Uso:  node slugs.mjs                 (después de `npm run build`)
 * Test en negativo:
 *       SABOTAJE=accesorios node slugs.mjs      → debe salir con código ≠ 0
 *
 * ── Por qué existe: el build NO avisa, y está medido ───────────────────────
 * `docs/research/arquetipo-A/ENRUTADO.md` §2 montó un andamio `[slug]` de raíz
 * que declaraba `accesorios` **a propósito**, colisionando con la ruta estática
 * que el clon ya sirve. Resultado 1: **compila sin error y sin aviso**, y emite
 * `/accesorios` por las dos vías. Resultado 2: **gana la estática**.
 *
 * O sea que una colisión de datos no se ve en ningún sitio hasta que alguien
 * pide la URL y recibe **la página equivocada con HTTP 200**. Es la peor forma
 * de fallo de este proyecto: silenciosa y con aspecto de correcta.
 *
 * `ESQUEMA-CMS.md` §4 lo convierte en requisito, no en recomendación:
 *
 *   > **una guarda que falle en BUILD, porque el build no avisa. Compara los
 *   > slugs de todos los catálogos planos contra las rutas emitidas y sale con
 *   > código ≠ 0. Mismo patrón que `enlaces.mjs`, derivada del
 *   > `prerender-manifest` para que se automantenga.**
 *
 * ── El cambio de MODELO que la obliga, y no es un detalle ──────────────────
 * En WordPress cada CPT garantiza slugs únicos **dentro de sí**, y eso **no
 * basta**: el conflicto es blog × término × `page` × `solutions`, **202 slugs
 * compartiendo un plano**. La unicidad que hay que imponer es **ENTRE
 * familias**. Ésa es la propiedad que esta sonda mide, y la única.
 *
 * ── Se deriva del BUILD, no de una lista ──────────────────────────────────
 * Igual que `enlaces.mjs` y `clon-base.mjs`: las rutas salen del
 * `.next/prerender-manifest.json`. Cuando el grupo A emita sus 187, entran
 * solas; cuando se emitan las 107 de paginación del §4b, también. Nadie tiene
 * que acordarse de tocar este fichero — que es exactamente el modo de fallo que
 * una lista a mano produce.
 *
 * ⚠ **CORREGIDO 2026-08-08 (F2-5, pre-vuelo de la prueba final): el CATÁLOGO
 * del plano se lee de la DB, no de `src/lib/arquetipo-a.ts`.** Los módulos del
 * seed dejaron de ser «el catálogo que usa el build» en F2-3 —el build lee por
 * Local API— y esta sonda siguió anclada a ellos. Con DB == seed la
 * discrepancia es invisible; la destapó la prueba final de F2-5: **un alta
 * legítima desde el admin salía HUÉRFANA** (C), o sea la guarda rechazando
 * exactamente lo que la fase entrega. Es la clase de F2-3 titular 5 —*un
 * ancla a algo que el propio trabajo mueve se auto-invalida*— y se arregla
 * como siempre: DERIVANDO de la fuente que el build usa de verdad.
 *
 * El filtro es `estado = publicado`, el MISMO que aplica el build
 * (`filtraPublicados`): un borrador no emitido no es una desincronía, es un
 * borrador. Y desde CMS-0c esto no le añade requisitos a `npm run check`: el
 * build de dentro ya exige Postgres — sin DB, `check` muere antes de llegar
 * aquí.
 *
 * ── Las CUATRO comprobaciones, y por qué son cuatro y no una ──────────────
 * No son redundantes: cada una ve un fallo que las otras **no** pueden ver.
 *
 *   A · COLISIÓN — un slug declarado por dos familias del plano.
 *       Se mide sobre los DATOS, antes de mirar el build, porque Next
 *       **deduplica en silencio**: dos familias declarando `metano` emiten UNA
 *       ruta, y el manifiesto no guarda memoria de que hubo dos.
 *
 *   B · SOMBRA — un slug del catálogo plano cuya ruta la emite OTRA cosa.
 *       Es el caso literal del andamio: el manifiesto trae `/accesorios` con
 *       `srcRoute: "/accesorios"` (la estática) en vez de `"/[slug]"`. La
 *       comprobación A no lo ve si la familia estática no está en la lista;
 *       ésta lo ve **siempre**, porque pregunta quién emite de verdad.
 *
 *   C · HUÉRFANA — una ruta emitida por el `[slug]` de raíz que ningún
 *       catálogo declara. Es la dirección contraria, y caza que el catálogo y
 *       lo servido se hayan desincronizado.
 *
 *   D · LA GUARDA DE LA PROPIA SONDA — `CLAUDE.md` §sondas, regla 4.
 *       **Una sonda que no encuentra nada y una que no mira nada dan la misma
 *       salida.** Si el conjunto comparado queda vacío —porque un módulo no
 *       resuelve, porque un `export` cambió de nombre, porque el manifiesto no
 *       trae estáticas— esta sonda **no puede** imprimir «0 colisiones»: sale
 *       por error. Y por eso imprime el recuento POR FAMILIA: una familia que
 *       resuelve a 0 se ve, en vez de sumar 0 sin decirlo.
 *
 * ── Alcance, declarado (`CLAUDE.md` §ruido, regla 3) ───────────────────────
 * **Sólo el plano de un segmento de `/es/`.** Las familias prefijadas —casos,
 * FAQ, sectores, documentos científicos— tienen unicidad *por colección*, que
 * es nativa, y **no entran aquí**. Si algún día una familia prefijada baja al
 * plano, se añade a `FAMILIAS` y la guarda la cubre; mientras tanto, que no
 * esté no es un hueco: es el alcance.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, w, APP} from "./lib.mjs";

/**
 * Raíz de la APP de render — donde viven `.next` y `src/`.
 *
 * ⚠ Desde la conversión a monorepo (F2-1, 2026-08-03) **NO es la raíz del
 * repo**: las sondas se quedaron arriba y la app bajó a `apps/web/`. Antes
 * esto era `new URL("../..")`, que ahora apuntaría al repo — y un
 * `prerender-manifest.json` que no existe deja `RUTAS` vacío, o sea **verde
 * sin medir**. Lo resuelve y lo VERIFICA `APP` en `lib.mjs`.
 */
const RAIZ = APP;

/** La ruta dinámica que sirve el plano de raíz. Es la que puede quedar en sombra. */
const PLANO = "/[slug]";

/**
 * Las familias que viven en el plano de un segmento, y de dónde salen sus
 * slugs: **de la DB, que es el catálogo que el build usa desde F2-3** (ver la
 * corrección en la cabecera). Sólo las publicadas — el mismo filtro del build.
 */
const FAMILIAS = [
  { familia: "blog", coleccion: "entradas-blog" },
  { familia: "termino", coleccion: "terminos-kunakpedia" },
];

/* ─────────────────── rutas emitidas, leídas del build ──────────────────── */

const manifiesto = JSON.parse(
  readFileSync(join(RAIZ, ".next/prerender-manifest.json"), "utf8"),
);
const RUTAS = manifiesto.routes || {};
const emitidas = Object.entries(RUTAS).filter(
  ([r]) => !r.startsWith("/_") && !r.includes("."),
);
if (emitidas.length === 0) {
  console.error("No hay rutas en .next/prerender-manifest.json — ¿falta `npm run build`?");
  process.exit(2);
}

/** Quién emite de verdad esta ruta: `/accesorios` (estática) o `/[slug]`. */
const quienEmite = new Map(emitidas.map(([r, v]) => [r, v.srcRoute ?? r]));

/**
 * Familia implícita: **las rutas estáticas de un segmento**. Son `page` y
 * `solutions` del original, y son slugs del plano con el mismo derecho que los
 * del grupo A — `/accesorios` es el ejemplo que la prueba del ENRUTADO usó.
 * Salen del manifiesto, así que nunca hay que mantenerlas.
 */
const estaticas = emitidas
  .filter(([r, v]) => r !== "/" && r.split("/").length === 2 && (v.srcRoute ?? r) === r)
  .map(([r]) => r.slice(1));

/* ──────────────────── slugs de cada catálogo declarado ─────────────────── */

const porFamilia = [{ familia: "estáticas (page · solutions)", slugs: estaticas, fuente: "prerender-manifest" }];
const noConstruidas = [];

/* La DB por la MISMA config que usa el build (Local API). Un fallo aquí TIRA:
 * «no pude leer el catálogo» y «el catálogo está vacío» no pueden dar la misma
 * salida (regla 6). */
const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "slugs", unidad: "familias de slug", minimo: FAMILIAS.length });
for (const { familia, coleccion } of FAMILIAS) {
  const { docs } = await payload.find({
    collection: coleccion,
    where: { estado: { equals: "publicado" } },
    pagination: false,
    depth: 0,
    sort: "id",
  });
  porFamilia.push({ familia, slugs: docs.map((d) => d.slug), fuente: `DB › ${coleccion} (estado=publicado)` });
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}
await payload.db.destroy?.();

/** Test en negativo: una familia postiza con el slug que se pida. */
const sabotaje = process.env.SABOTAJE;
if (sabotaje) {
  porFamilia.push({ familia: `SABOTAJE`, slugs: [sabotaje], fuente: "env SABOTAJE" });
  console.log(`\n⚠ SABOTAJE=${sabotaje} — familia postiza inyectada. Esta corrida DEBE fallar.\n`);
}

/* ─────────── D · la guarda de la sonda, ANTES de cualquier veredicto ────── */

const total = porFamilia.reduce((n, f) => n + f.slugs.length, 0);

console.log(`\nFamilias del plano comparadas (${porFamilia.length}):`);
for (const f of porFamilia) console.log(`  · ${f.familia.padEnd(28)} ${String(f.slugs.length).padStart(4)} slugs   ← ${f.fuente}`);
for (const n of noConstruidas) console.log(`  · ${n.familia.padEnd(28)}    —  ${n.razon}`);

if (total === 0) {
  console.error(
    `\n❌ 0 slugs comparados. Esta sonda NO puede decir «sin colisiones» sin haber\n` +
      `   mirado nada: sería la regla 4 de \`CLAUDE.md\` §sondas —no encontrar nada y\n` +
      `   no mirar nada dan la misma salida—. Revisa \`FAMILIAS\` y el manifiesto.\n`,
  );
  process.exit(2);
}
if (estaticas.length === 0) {
  console.error(
    `\n❌ 0 rutas estáticas de un segmento en el manifiesto. El clon sirve al menos\n` +
      `   4 (\`/accesorios\`, \`/kunak-api\`, \`/monitor-calidad-aire\`,\n` +
      `   \`/software-…\`), así que esto no es un plano vacío: es la lectura rota.\n`,
  );
  process.exit(2);
}

/* ───────────────────────── A · colisión entre familias ─────────────────── */

const dueños = new Map(); // slug → [familias]
for (const { familia, slugs } of porFamilia) {
  for (const s of slugs) {
    if (!dueños.has(s)) dueños.set(s, []);
    dueños.get(s).push(familia);
  }
}
const colisiones = [...dueños]
  .filter(([, fs]) => fs.length > 1)
  .map(([slug, familias]) => ({ slug, familias }));

/* ────────────────────────────── B · sombra ─────────────────────────────── */

const sombras = [];
for (const { familia, slugs } of porFamilia) {
  if (familia.startsWith("estáticas")) continue; // la estática ES quien emite
  for (const s of slugs) {
    const emisor = quienEmite.get("/" + s);
    if (emisor && emisor !== PLANO)
      sombras.push({ slug: s, familia, emisor });
  }
}

/* ───────────────────────────── C · huérfanas ───────────────────────────── */

const declarados = new Set(
  porFamilia.filter((f) => !f.familia.startsWith("estáticas")).flatMap((f) => f.slugs),
);
const huerfanas = emitidas
  .filter(([r]) => quienEmite.get(r) === PLANO)
  .map(([r]) => r.slice(1))
  .filter((s) => !declarados.has(s));

const emitidasPorPlano = emitidas.filter(([r]) => quienEmite.get(r) === PLANO).length;
const sinEmitir = [...declarados].filter((s) => !quienEmite.has("/" + s));

/* ──────────────────────────────  informe  ──────────────────────────────── */

console.log(
  `\nRutas emitidas: ${emitidas.length}  ·  estáticas de un segmento: ${estaticas.length}` +
    `  ·  emitidas por \`${PLANO}\`: ${emitidasPorPlano}`,
);

if (sinEmitir.length) {
  const grave = emitidasPorPlano > 0;
  console.log(
    `\n${grave ? "❌" : "⚠"} ${sinEmitir.length} slug(s) declarados y NO emitidos` +
      (grave
        ? ` — y \`${PLANO}\` SÍ emite: el catálogo y lo servido no cuadran.`
        : ` — \`${PLANO}\` todavía no existe, así que es lo esperado.`),
  );
  console.log(`   ${sinEmitir.slice(0, 10).join(" · ")}${sinEmitir.length > 10 ? " …" : ""}`);
}

// El sabotaje escribe en OTRO fichero: la primera versión de `c-cascaron`
// pisaba la medida buena con la falsa, y eso convierte el test en negativo en
// destructor de evidencia (`CLAUDE.md` §sondas, reglas 2 y 5).
w(sabotaje ? "medidas/slugs-SABOTAJE.json" : "medidas/slugs.json", {
  meta: { fecha: hoy(), sabotaje: sabotaje ?? null },
  familias: porFamilia.map(({ familia, slugs, fuente }) => ({ familia, n: slugs.length, fuente })),
  noConstruidas,
  emitidas: emitidas.length,
  estaticasDeUnSegmento: estaticas.sort(),
  emitidasPorPlano,
  colisiones,
  sombras,
  huerfanas,
  declaradosSinEmitir: sinEmitir,
});

let codigo = 0;

if (colisiones.length) {
  codigo = 1;
  console.log(`\n❌ A · ${colisiones.length} SLUG(S) EN COLISIÓN entre familias del plano:\n`);
  for (const c of colisiones) console.log(`  /${c.slug}\n      lo declaran : ${c.familias.join(" · ")}\n`);
  console.log(
    `   Next NO avisa de esto: deduplica y emite una sola ruta, o deja ganar a la\n` +
      `   estática. La página equivocada se sirve con HTTP 200.\n`,
  );
}

if (sombras.length) {
  codigo = 1;
  console.log(`\n❌ B · ${sombras.length} SLUG(S) DEL CATÁLOGO EN SOMBRA — los emite otra ruta:\n`);
  for (const s of sombras)
    console.log(`  /${s.slug}\n      lo declara  : ${s.familia}\n      lo emite    : ${s.emisor}\n`);
}

if (huerfanas.length) {
  codigo = 1;
  console.log(`\n❌ C · ${huerfanas.length} ruta(s) emitidas por \`${PLANO}\` que ningún catálogo declara:`);
  console.log(`   ${huerfanas.join(" · ")}\n`);
}

if (sinEmitir.length && emitidasPorPlano > 0) codigo = 1;

if (codigo === 0) {
  console.log(
    `\n✅ LIMPIO — ${total} slugs de ${porFamilia.length} familias, sin una colisión.\n` +
      `   · A · ningún slug lo declaran dos familias\n` +
      `   · B · ningún slug del catálogo lo emite otra ruta\n` +
      `   · C · ninguna ruta de \`${PLANO}\` sin catálogo que la declare\n`,
  );
}
process.exit(codigo);
