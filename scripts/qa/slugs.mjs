/**
 * GUARDA DE UNICIDAD DE SLUG **ENTRE FAMILIAS** — el plano de `/es/`.
 *
 * Uso:  node slugs.mjs                 (después de `npm run build`)
 *
 * ── Test en negativo — CUATRO casos, y cada uno cae por SU motivo ──────────
 * Corrido el 2026-08-22 (94.ª), con el alcance ya derivado:
 *
 * | caso | qué simula | exit | por qué motivo |
 * |---|---|---|---|
 * | (control) | nada | **0** | `✅ LIMPIO — 204 slugs de 5 familias` |
 * | `SABOTAJE=accesorios` | una familia postiza reclamando un slug estático | **1** | `❌ A · 1 SLUG EN COLISIÓN` |
 * | `SABOTAJE_FAMILIA=<x>` | **una familia en el registro que la config NO declara** | **2** | `❌ FAMILIA EN EL REGISTRO SIN COLECCIÓN QUE LA SIRVA` + el contrato (`0 de 5`) |
 * | `SABOTAJE_REGISTRO_VACIO=1` | el registro devuelve 0 familias | **1** | `Error: REGISTRO DE SLUGS VACÍO` |
 *
 * ⚠ **El tercero es el que esta corrección añade, y es el que faltaba.** Antes,
 * una familia no cubierta **no salía roja: no salía**. Ahora el modo de fallo
 * dejó de ser el silencio — que es lo único que hacía que una lista corta
 * pudiera vivir años sin que nadie la mirara.
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
 * es nativa, y **no entran aquí**.
 *
 * ⚠⚠ **CORREGIDO 2026-08-22 (94.ª): la frase que seguía aquí era el defecto.**
 * Decía *«si algún día una familia prefijada baja al plano, se añade a
 * `FAMILIAS` y la guarda la cubre; mientras tanto, que no esté no es un hueco:
 * es el alcance»*. Las dos mitades fallan:
 *
 *   · **«se añade»** — eso es la lista a mano, o sea el modo de fallo. Ahora el
 *     alcance **se deriva del registro** y una familia nueva entra sola;
 *   · **«que no esté no es un hueco»** — sí lo era, y con número: el registro
 *     tenía **4** familias y esta sonda comparaba **2**, o sea **11 slugs sin
 *     cruzar**. La frase convertía un hueco medible en alcance declarado, que
 *     es §*una limitación declarada sin su número se lee como una nota al pie*.
 *
 * **El alcance de verdad, hoy: lo que el registro `slugs` contenga.** Y si
 * contiene una familia que la config no declara, la sonda **TIRA** en vez de
 * comparar las que sí resuelven.
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
 * ⚠⚠ **LAS FAMILIAS SE DERIVAN DEL REGISTRO. NO SE ESCRIBEN.** (94.ª tanda)
 *
 * Aquí había **dos literales a mano** —`entradas-blog` y `terminos-kunakpedia`—
 * y la cabecera lo asumía: *«si algún día una familia prefijada baja al plano,
 * se añade a `FAMILIAS`»*. Eso es §regla 9 caso 7, y el repo **ya pagó dos
 * veces ese mismo patrón en `cobertura.mjs`** — la primera vez arreglando LA
 * INSTANCIA (añadir el sufijo que faltaba), que es justo lo que hizo que
 * volviera.
 *
 * **Y estaba corta desde antes de esta tanda, medido:** el registro tiene
 * **4** familias con filas —`entradas-blog` 152 · `terminos-kunakpedia` 37 ·
 * `articulos-kb` 6 · `productos` 5— y esta lista comparaba **2**. O sea **11
 * slugs reclamados en el plano que ninguna comprobación cruzaba**, sin dar
 * error: §*un patrón que no casa no es un cero*, con el cero puesto en una
 * familia entera.
 *
 * **La fuente derivada es el REGISTRO (`slugs`)**, y es la correcta por
 * construcción: lo escribe `registroDeSlug` **en la misma transacción** que el
 * alta, así que *estar en el plano* y *tener fila aquí* son la misma cosa. Una
 * familia nueva —`paginas` cuando se siembre— entra **sola**, sin que nadie
 * tenga que acordarse de este fichero.
 *
 * **Y lo que NO se puede derivar, se TIRA** (§regla 6: una ausencia se rechaza,
 * no se sustituye):
 *
 *   · registro vacío ⇒ error. «0 familias» y «no pude leer» no pueden dar la
 *     misma salida;
 *   · una familia del registro **sin colección que la sirva** ⇒ error. El
 *     registro sabría algo que la config no, y comparar sólo las que sí
 *     resuelven sería exactamente el silencio que esta corrección quita.
 */
async function familiasDelRegistro(payload) {
  const { docs } = await payload.find({ collection: "slugs", pagination: false, depth: 0, sort: "familia" });
  const porFam = {};
  for (const d of docs) if (d.familia) (porFam[d.familia] = porFam[d.familia] || []).push(d.slug);
  /**
   * SABOTAJE `SABOTAJE_FAMILIA` — simula **una familia nueva en el registro que
   * la config no declara**, que es el caso que esta corrección existe para no
   * volver a tener en silencio. Tiene que salir **ROJA, no ausente**.
   */
  if (process.env.SABOTAJE_FAMILIA) {
    porFam[process.env.SABOTAJE_FAMILIA] = ["slug-postizo-del-sabotaje"];
    console.log(`\n⚠ SABOTAJE_FAMILIA=${process.env.SABOTAJE_FAMILIA} — familia sin colección. Esta corrida DEBE fallar.\n`);
  }
  /* SABOTAJE `SABOTAJE_REGISTRO_VACIO` — el registro no devuelve nada. La sonda
   * no puede decir «sin colisiones» sin haber mirado (§sondas 4). */
  if (process.env.SABOTAJE_REGISTRO_VACIO) {
    for (const k of Object.keys(porFam)) delete porFam[k];
    console.log(`\n⚠ SABOTAJE_REGISTRO_VACIO — registro a cero. Esta corrida DEBE fallar.\n`);
  }
  const familias = Object.keys(porFam).sort();
  if (familias.length === 0)
    throw new Error(
      "REGISTRO DE SLUGS VACÍO: 0 familias en `slugs`.\n" +
        "  Esta sonda no puede derivar el plano de la nada, y «0 familias» no puede\n" +
        "  significar «sin colisiones» (§sondas 4). ¿Falta sembrar?",
    );
  return { familias, porFam };
}

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
const estaticasTodas = emitidas
  .filter(([r, v]) => r !== "/" && r.split("/").length === 2 && (v.srcRoute ?? r) === r)
  .map(([r]) => r.slice(1));
/**
 * ⚠ **La familia implícita es «estáticas que NADIE declara», y esa palabra
 * hacía falta desde que las familias se derivan (94.ª).**
 *
 * Con la lista a mano de dos familias, ninguna colección declaraba una ruta
 * estática, así que «todas las estáticas» y «las que nadie declara» eran el
 * mismo conjunto. Al derivar entró `productos`, **cuyas páginas SON rutas
 * estáticas** (`/monitor-calidad-aire`, `/kunak-api`, `/software-…`), y el
 * mismo slug pasó a estar en dos familias derivadas: la sonda informó **3
 * colisiones y 3 sombras** que eran **la misma página consigo misma**.
 *
 * Es §*un patrón que casa en TODAS tampoco mide nada* por el otro lado: no un
 * selector que sobra, sino un conjunto implícito que dejó de ser disjunto en
 * cuanto el otro creció. Se resta lo declarado, y se hace **después** de leer
 * las familias — por eso el filtro vive abajo y no aquí.
 */
let estaticas = estaticasTodas;

/* ──────────────────── slugs de cada catálogo declarado ─────────────────── */

const porFamilia = [];
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
const { familias: FAMILIAS, porFam: SLUGS_REGISTRADOS } = await familiasDelRegistro(payload);

/**
 * El mínimo se DERIVA del registro, no se escribe: una familia nueva **sube el
 * listón sola**, que es lo que un número escrito a mano nunca hace (§4bis).
 */
const ev = new Evaluadas({ nombre: "slugs", unidad: "familias de slug", minimo: FAMILIAS.length });

/**
 * La familia del registro es el `slug` de su colección (lo pone
 * `registroDeSlug({familia})`). Si alguna no resuelve, **se TIRA**: el registro
 * sabría algo que la config no.
 */
const conocidas = new Set((await import("../../packages/cms-config/src/colecciones.ts")).COLECCIONES.map((c) => c.slug));
const huerfanasDeConfig = FAMILIAS.filter((f) => !conocidas.has(f));
if (huerfanasDeConfig.length) {
  console.error(
    `\n❌ FAMILIA EN EL REGISTRO SIN COLECCIÓN QUE LA SIRVA: ${huerfanasDeConfig.join(" · ")}\n` +
      `   El registro de slugs reclama el plano para una familia que \`COLECCIONES\` no\n` +
      `   declara. Comparar sólo las que sí resuelven sería declarar un cero que nadie\n` +
      `   midió — la familia entera quedaría fuera sin que nada lo dijera.\n`,
  );
  process.exit(2);
}

/**
 * ⚠⚠ **LOS SLUGS SALEN DEL REGISTRO, NO DE LA COLECCIÓN — y la primera versión
 * de esta corrección lo hizo al revés y salió ROJA.**
 *
 * La colección trae **todos** sus documentos; el registro trae los que están
 * **EN EL PLANO**, porque es donde `registroDeSlug` ya aplicó su `enElPlano`.
 * Medido: `productos` tiene **19 publicados** y sólo **5** en el plano — §2e
 * midió que los que llevan `padre` cuelgan de un segmento y su unicidad es la
 * nativa. Tomarlos de la colección metía 14 slugs que **en la URL real no
 * colisionan**, y la sonda informaba «11 colisiones» que no existen.
 *
 * O sea: es §*la causa común, el NIVEL al que se mide* — la colección es el
 * nivel de arriba del plano, y absorbe la distinción que decide el caso.
 *
 * El `estado` sí sale de la colección (el registro no lo guarda), así que la
 * membresía es **la intersección**: en el plano Y publicado, que es exactamente
 * lo que el build emite.
 */
for (const familia of FAMILIAS) {
  const { docs } = await payload.find({
    collection: familia,
    where: { estado: { equals: "publicado" } },
    pagination: false,
    depth: 0,
    sort: "id",
  });
  const publicados = new Set(docs.map((d) => d.slug));
  const enElPlano = (SLUGS_REGISTRADOS[familia] ?? []).filter((s) => publicados.has(s));
  porFamilia.push({
    familia,
    slugs: enElPlano,
    fuente: `registro ∩ DB › ${familia} (en el plano ${SLUGS_REGISTRADOS[familia].length} · publicados ${publicados.size})`,
  });
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}
await payload.db.destroy?.();

/* La familia implícita, YA disjunta: estáticas de un segmento que ninguna
 * familia declarada reclama. Va aquí porque necesita las familias leídas. */
const declaradosPorDb = new Set(porFamilia.flatMap((f) => f.slugs));
estaticas = estaticasTodas.filter((s) => !declaradosPorDb.has(s));
porFamilia.unshift({
  familia: "estáticas sin dueño",
  slugs: estaticas,
  fuente: `prerender-manifest (${estaticasTodas.length} de un segmento − ${estaticasTodas.length - estaticas.length} ya declaradas)`,
});

/**
 * ⚠ **RECLAMO SIN RUTA — hallazgo NOMBRADO, y NO cierra el código de salida.**
 *
 * Un slug registrado en el plano cuya URL de raíz **no la sirve nada**. No es
 * una colisión ni una sombra: es el registro **reservando un slug de raíz que
 * el sitio no usa**, y eso no protege — **bloquea altas legítimas**, que es la
 * otra forma de que una guarda deje de servir (lo dice el propio hook).
 *
 * Se publica con su cardinal y su familia (§regla 14) y **no es fatal**, con su
 * razón: hoy no puede hacer daño —ningún documento del plano quiere esos
 * slugs— y volver rojo permanente a `npm run check` por algo latente sería
 * cambiar el portón del repo por criterio propio. Fichado en
 * `PENDIENTES-QA.md` §F3-3-REGISTRO-SOBRE-RECLAMA.
 */
const reclamoSinRuta = [];
for (const { familia, slugs } of porFamilia) {
  if (familia.startsWith("estáticas")) continue;
  for (const s of slugs) if (!quienEmite.has("/" + s)) reclamoSinRuta.push({ slug: s, familia });
}

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

/**
 * ⚠ **La sombra sólo tiene sentido para una familia que `/[slug]` SIRVE.**
 *
 * La pregunta es *«esta familia cree que su página la emite el plano, y la
 * emite otra cosa»*. Para una familia a la que **el plano no sirve nunca**
 * —`productos`, cuyas páginas son rutas estáticas propias— la respuesta es
 * «otra cosa» **siempre**, y eso no es una sombra: es su enrutado.
 *
 * El discriminador se DERIVA, no se declara: una familia es «del plano» si
 * **alguno** de sus slugs lo emite `/[slug]`. Sin esto, derivar las familias
 * hacía aparecer 3 sombras que eran el enrutado normal de `productos`.
 */
const esFamiliaDelPlano = (slugs) => slugs.some((s) => quienEmite.get("/" + s) === PLANO);
const sombras = [];
for (const { familia, slugs } of porFamilia) {
  if (familia.startsWith("estáticas")) continue; // la estática ES quien emite
  if (!esFamiliaDelPlano(slugs)) continue;       // no la sirve el plano: su emisor propio no es sombra
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
/* `sinEmitir` se sustituyó por `reclamoSinRuta`, que se publica por familia. */

/* ──────────────────────────────  informe  ──────────────────────────────── */

console.log(
  `\nRutas emitidas: ${emitidas.length}  ·  estáticas de un segmento: ${estaticas.length}` +
    `  ·  emitidas por \`${PLANO}\`: ${emitidasPorPlano}`,
);

if (reclamoSinRuta.length) {
  const porFam = {};
  for (const r of reclamoSinRuta) (porFam[r.familia] = porFam[r.familia] || []).push(r.slug);
  console.log(`\n⚠ RECLAMO SIN RUTA — ${reclamoSinRuta.length} slug(s) reservados en el plano de raíz que NADIE sirve:`);
  for (const [f, ss] of Object.entries(porFam).sort((a, b) => b[1].length - a[1].length))
    console.log(`   ${f.padEnd(22)} ${String(ss.length).padStart(3)} · ${ss.join(" · ")}`);
  console.log(
    `   No es colisión ni sombra: el registro RESERVA slugs de raíz que el sitio no usa.\n` +
      `   Eso no protege — puede BLOQUEAR un alta legítima que quiera ese slug. Se publica\n` +
      `   con su cardinal y NO cierra el código: hoy es latente (ningún documento del plano\n` +
      `   los quiere) y volver rojo permanente a \`npm run check\` por eso sería cambiar el\n` +
      `   portón del repo por criterio propio. Ficha: PENDIENTES-QA.md §F3-3-REGISTRO-SOBRE-RECLAMA.`,
  );
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
  reclamoSinRuta,
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

/**
 * ⚠ **AQUÍ HABÍA UN ROJO MUDO, y lo cometió esta misma corrección.**
 *
 * La línea era `if (sinEmitir.length && emitidasPorPlano > 0) codigo = 1;` —
 * heredada de cuando «declarado y no emitido» era fatal. Al sustituir ese
 * cálculo por `reclamoSinRuta` (que se publica y **no** cierra el código), la
 * condición se quedó viva: la sonda salía con **código 1 imprimiendo CERO
 * `❌`**.
 *
 * Es §sondas 1 al pie de la letra —*lo que imprime y lo que cuenta no pueden
 * discrepar*— y su forma peor: un rojo **sin motivo a la vista**, que quien lo
 * lea atribuirá a lo último que tocó. Se quita, y el hallazgo vive donde se
 * publica, con su cardinal.
 */

if (codigo === 0) {
  console.log(
    `\n✅ LIMPIO — ${total} slugs de ${porFamilia.length} familias, sin una colisión.\n` +
      `   · A · ningún slug lo declaran dos familias\n` +
      `   · B · ningún slug del catálogo lo emite otra ruta\n` +
      `   · C · ninguna ruta de \`${PLANO}\` sin catálogo que la declare\n`,
  );
}
process.exit(codigo);
