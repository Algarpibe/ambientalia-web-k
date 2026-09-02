/**
 * `arquetipos` — EL CONTENT TYPE DEL LOTE **F3-5**, escrito en la 126.ª
 * (2026-08-31). `ESQUEMA-CMS.md` §2o.
 *
 * ── Su membresía, DERIVADA y en la unidad correcta ─────────────────────────
 * Los arquetipos construidos que **todavía leen su contenido de `src/lib/`**:
 * **5 rutas · 4 arquetipos + 1 variante** (§F3-5, re-derivado por la 123.ª y
 * reproducido). HOME queda **FUERA de esta colección en esta tanda** —no por
 * criterio, por alcance: la 126.ª no la toca, y su SIN PROBAR irreducible de 3
 * y sus 0 de 788 documentos capturados siguen en pie—.
 *
 * | ruta | discriminante |
 * |---|---|
 * | `/monitor-calidad-aire` | `producto` |
 * | `/accesorios` | `catalogo` |
 * | `/software-de-medicion-calidad-del-aire` | `software` |
 * | `/kunak-api` | `software` + `varianteCorta` |
 *
 * **`/kunak-api` NO estrena arquetipo**, y eso está medido: el recon
 * (`research/kunak-api/PAGE_TOPOLOGY.md`) concluyó que *«el arquetipo
 * API/desarrollador no existe»*. Modelarlo como un cuarto valor del
 * discriminante habría creado un arquetipo que la medición niega.
 *
 * ── El registro de slugs: SIN predicado, y por qué SIGUE sin hacer falta uno
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠⚠ **CORREGIDO (140.ª, CMS-9): esto decía que las 4 SÍ arbitran el plano
 * de `/es/`, y era falso — medido, no leído.** `ESQUEMA-CMS.md` §CMS-9 (139.ª)
 * encontró que **3 de las 4** (`kunak-api` · `monitor-calidad-aire` ·
 * `software-de-medicion-calidad-del-aire`) YA estaban reclamadas por
 * `productos`, con el mismo slug. Las 4 SÍ son de un segmento —eso seguía
 * siendo cierto—, pero «de un segmento» no es lo mismo que «lo emite el
 * plano»: las 4 las sirve una CARPETA ESTÁTICA de `apps/web/src/app/`
 * (`monitor-calidad-aire/page.tsx` y hermanas), nunca `/[slug]`.
 *
 * `registro-slug.ts` (§CMS-9 = A') ahora filtra eso DERIVANDO del árbol de
 * `app/` — el mismo derivador que usa el render (`rutasConstruidas()` de
 * `../entorno.mjs`) — así que ninguna de las 4 llega a arbitrar el plano
 * NUNCA, con `productos` reclamándolas o sin reclamarlas. `enElPlano` sigue
 * sin hacer falta aquí, pero no porque el dominio y el invariante coincidan
 * (coincidían en el segmento, no en el EMISOR): sigue sin hacer falta porque
 * el filtro nuevo ya deja esta colección en 0 reclamos, siempre.
 *
 * ── Lo que esta colección NO hace todavía, con su cardinal ─────────────────
 * · **0 lectores en el render**: las 4 rutas siguen sirviéndose de `src/lib/`.
 *   §F3-5 «hecho» es *el content type escrito con sus SIN PROBAR declarados y
 *   no cableados*, y eso es lo que hay aquí — no el sitio servido desde Payload,
 *   que es la segunda mitad y otra tanda;
 * · **0 filas sembradas**: el extractor del lote no existe. Un content type sin
 *   dato es un camino de render SIN ESTRENAR, y se declara en vez de suponerse
 *   soportado (`npm run qa:nunca-vistos`);
 * · ⚠ y por eso **una ruta que responda 200 no prueba que sirva contenido**:
 *   ninguna guarda de este repo mira DENTRO. Lo que lo distingue es el
 *   comparador de dos lados —`qa:productos-cmp`—, no el manifiesto.
 */
import type { CollectionConfig } from "payload";

import { seoA } from "../campos/comunes.ts";
import { ARQUETIPOS_F35, bloquesArquetipo, varianteCorta } from "../bloques/arquetipos.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

export const arquetipos: CollectionConfig = {
  slug: "arquetipos",
  labels: { singular: "Arquetipo", plural: "Arquetipos" },
  admin: { useAsTitle: "titulo", group: "Contenido" },
  /* Las 4 son de un segmento, pero las sirve una carpeta ESTÁTICA de `app/`,
     no el plano — `registro-slug.ts` §CMS-9 lo filtra solo, derivado del
     árbol. Sin `enElPlano`: el filtro deja esta colección en 0 reclamos
     siempre, así que un predicado propio no aportaría nada. */
  hooks: registroDeSlug({ familia: "arquetipos" }),
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "El segmento de la URL. Las 4 rutas del lote son de UN segmento (derivado de `apps/web/src/app/`), " +
          "así que `unique` sobre el slug SÍ coincide con el invariante aquí — a diferencia de `paginas`, " +
          "donde la identidad es el par `(prefijo, slug)`.",
      },
    },
    { name: "titulo", type: "text", required: true },
    {
      name: "arquetipo",
      type: "select",
      required: true,
      options: [...ARQUETIPOS_F35],
      admin: {
        description:
          "El discriminante del lote. TRES valores, derivados del inventario de §F3-5: `/kunak-api` NO es un " +
          "cuarto — el recon concluyó que el arquetipo «API/desarrollador» no existe. Se distingue con `varianteCorta`.",
      },
    },
    varianteCorta,
    /**
     * ⚠ **El cuerpo es `required`, y la razón está medida.** Un `bloques`
     * opcional contestaría *«este documento PUEDE no traer módulos»*, que no es
     * *«no los trae»* — y los 4 documentos del lote traen **90 · 35 · 70 · 36**
     * módulos de primer nivel, 231 en total, **0 vacíos**. Declararlo opcional
     * permitiría emitir una ruta con cabecera, pie y nada en medio,
     * respondiendo 200 (§*un campo opcional no expresa un caso: sólo permite
     * que falte*).
     */
    {
      name: "bloques",
      type: "blocks",
      required: true,
      minRows: 1,
      blocks: bloquesArquetipo,
      admin: {
        description:
          "Los módulos de PRIMER NIVEL del cuerpo (§2n): 90 · 35 · 70 · 36 = 231 medidos, 0 documentos vacíos. " +
          "Un acordeón cuenta como UN módulo: sus 19 toggles son contenido de un campo, no 19 bloques.",
      },
    },
    seoA,
  ],
};
