/**
 * LOS CATÁLOGOS MEDIDOS, CARGADOS COMO MÓDULO — no parseados.
 *
 * `PLAN-FASE-2.md` §F2-2: *«`src/lib/*.ts` **son los datos**»*. Y son TypeScript
 * tipado, así que **se importan**: parsearlos sería fabricar una segunda
 * definición de un dato que el compilador ya sabe leer, con su propia deriva.
 *
 * ── Por qué hace falta empaquetar, y no es capricho ────────────────────────
 * Los ficheros de `apps/web/src/lib` usan **dos cosas que Node no resuelve
 * solo**: el alias `@/…` del `tsconfig` de la app y las **rutas relativas sin
 * extensión** (`./taxonomia-sectores`). `import()` directo falla con
 * `ERR_MODULE_NOT_FOUND` — comprobado.
 *
 * Se empaqueta con **esbuild**, que es el patrón que ya usa `cms-campos.mjs`
 * para el lado B (*«se empaqueta `colecciones.ts` con esbuild y se importa el
 * objeto»*). Misma razón allí y aquí: **verificar contra la salida servida** —
 * el objeto que el build usaría, no el texto del fichero.
 *
 * ⚠ `slugs.mjs` sí hace `import()` directo sobre `arquetipo-a.ts`, y no es una
 * contradicción: **ese fichero sólo tiene `import type`**, que el borrado de
 * tipos de Node se lleva por delante. En cuanto un catálogo importa un valor
 * —`casos.ts` importa `getTermino`— deja de funcionar. Por eso aquí se
 * empaqueta siempre y no «cuando haga falta»: que hoy funcione por accidente es
 * exactamente cómo se rompe mañana.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { APP, QA } from "../qa/lib.mjs";

/**
 * **El catálogo de catálogos.** Cada entrada dice de qué fichero medido sale la
 * colección y con qué nombre se exporta.
 *
 * ⚠ **El ORDEN es de dependencia, no estético**, y por eso está aquí y no en el
 * seeder: una relación no se puede escribir antes que su destino.
 *
 * ⚠⚠ **Y el grafo tiene un CICLO, medido al sembrar:**
 *
 *     taxonomia-sectores → sectores → casos → taxonomia-sectores
 *                          (por `proyectos.posts`)
 *
 * No hay orden que lo satisfaga, y por eso la primera corrida falló con
 * `RELACIÓN SIN DESTINO` en `taxonomia-sectores.pagina` — no era el orden mal
 * puesto, era un ciclo.
 *
 * **Lo rompe la poda de la frontera**, y conviene ver por qué no es casualidad:
 * la arista `sectores → casos` es justo `proyectos.posts`, o sea **el teaser**.
 * Quitada esa, el grafo es acíclico y el orden de abajo es el topológico. Cuando
 * el bloque 2 traiga los 57 casos y las 149 entradas, el ciclo **vuelve**, y
 * entonces hará falta sembrar en dos pasadas (documentos primero, relaciones
 * después). Queda escrito aquí para que esa tanda no lo redescubra.
 */
export const CATALOGOS = [
  {
    coleccion: "productos",
    modulo: "src/lib/products.ts",
    exportado: ["PRODUCTS_TABS", "PRODUCTS_CARTUCHOS"],
    /* §2e: **UNA** colección. Los dos arrays son la misma, partidos en el clon
     * por dónde se pintan (pestañas de la home vs fichas de cartucho). */
  },
  { coleccion: "sectores", modulo: "src/lib/sectores.ts", exportado: "SECTORES_PUBLICADOS" },
  { coleccion: "monograficos", modulo: "src/lib/monografico.ts", exportado: "MONOGRAFICOS_PUBLICADOS" },
  { coleccion: "taxonomia-sectores", modulo: "src/lib/taxonomia-sectores.ts", exportado: "TERMINOS_SECTOR" },
  { coleccion: "casos", modulo: "src/lib/casos.ts", exportado: "CASOS_PUBLICADOS" },
  { coleccion: "faqs", modulo: "src/lib/faqs.ts", exportado: "FAQS_PUBLICADAS" },
  { coleccion: "entradas-blog", modulo: "src/lib/arquetipo-a.ts", exportado: "ENTRADAS_BLOG" },
  { coleccion: "terminos-kunakpedia", modulo: "src/lib/arquetipo-a.ts", exportado: "TERMINOS_KUNAKPEDIA" },
  { coleccion: "documentos-cientificos", modulo: "src/lib/arquetipo-a.ts", exportado: "DOCUMENTOS_CIENTIFICOS" },
];

/**
 * Las cuatro taxonomías del §2c **no tienen catálogo propio**: viven EMBEBIDAS
 * en las entradas (`categorias: TerminoA[]`). Se **derivan** deduplicando por
 * slug, y por eso no están en `CATALOGOS`.
 *
 * Es una transformación de forma, no de dato — el clon las lleva embebidas
 * porque las pinta ahí; Payload las lleva como colección porque §2c decidió que
 * el término es su propia colección. **El proyector del PASO 2 tiene que
 * deshacerla**, o el round-trip compararía dos formas distintas de lo mismo,
 * que es la clase C7.
 */
export const TAXONOMIAS_DERIVADAS = [
  { coleccion: "categorias", de: "entradas-blog", campo: "categorias", lista: true },
  { coleccion: "etiquetas", de: "entradas-blog", campo: "etiquetas", lista: true },
  { coleccion: "categorias-recursos", de: "entradas-blog", campo: "recurso", lista: false },
  { coleccion: "categorias-cientificas", de: "documentos-cientificos", campo: "categoria", lista: false },
];

let cache = null;

/** Empaqueta e importa. Una sola pasada para todos los catálogos. */
export async function cargaCatalogos() {
  if (cache) return cache;
  const tmp = path.join(QA, ".tmp");
  fs.mkdirSync(tmp, { recursive: true });

  const modulos = [...new Set(CATALOGOS.map((c) => c.modulo))];
  /* Un punto de entrada sintético que reexporta todo: una sola invocación de
   * esbuild y un solo `import()`, así que no puede haber dos versiones del
   * mismo módulo en memoria. */
  const entrada = path.join(tmp, "catalogos-entrada.ts");
  fs.writeFileSync(
    entrada,
    modulos
      /* ⚠ Ruta cruda con barras, **no** `pathToFileURL().pathname`: en Windows
       * eso devuelve `/C:/…` y esbuild no lo resuelve (medido). */
      .map((m, i) => `export * as m${i} from ${JSON.stringify(path.join(APP, m).replace(/\\/g, "/"))};`)
      .join("\n"),
    "utf8",
  );

  const bundle = path.join(tmp, "catalogos.mjs");
  await esbuild.build({
    entryPoints: [entrada],
    outfile: bundle,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
    tsconfig: path.join(APP, "tsconfig.json"), // el alias `@/…` sale de aquí
  });

  const mod = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
  const porModulo = new Map(modulos.map((m, i) => [m, mod[`m${i}`]]));

  const salida = new Map();
  for (const c of CATALOGOS) {
    const m = porModulo.get(c.modulo);
    const nombres = Array.isArray(c.exportado) ? c.exportado : [c.exportado];
    const filas = [];
    for (const n of nombres) {
      const v = m?.[n];
      /* Regla 6: una ausencia se RECHAZA. Un `?? []` aquí convertiría «el export
       * cambió de nombre» en «esta colección no tiene datos», y el seed saldría
       * verde con cero filas. */
      if (!Array.isArray(v))
        throw new Error(
          `CATÁLOGO AUSENTE: ${c.modulo} no exporta '${n}' como array (es ${typeof v}).\n` +
            `  Eso NO es «esta colección no tiene instancias»: es un export equivocado,\n` +
            `  y su \`undefined\` se estaba a punto de leer como cero.`,
        );
      filas.push(...v);
    }
    salida.set(c.coleccion, filas);
  }
  cache = salida;
  return salida;
}
