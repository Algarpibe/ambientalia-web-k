/**
 * EL CATÁLOGO DE COLECCIONES — un solo sitio, y **es el lado B de
 * `qa:cms-campos`**.
 *
 * La comprobación deriva los campos de `apps/web/src/lib` y `src/types` (lo
 * medido) y los empareja contra **este array resuelto**, no contra el texto de
 * los ficheros: *verificar contra la salida servida, nunca contra la fuente que
 * uno supone responsable* (`CLAUDE.md` §El principio).
 *
 * Por eso vive aparte de `payload.config.ts`: la comprobación tiene que poder
 * cargar las colecciones **sin** adaptador de base de datos ni secreto.
 */
import type { CollectionConfig } from "payload";

import { monograficos, sectores } from "./colecciones/sectores.ts";
import { productos } from "./colecciones/productos.ts";
import { casos, faqs, taxonomiaSectores } from "./colecciones/grupo-c.ts";
import {
  articulosKb,
  documentosCientificos,
  entradasBlog,
  terminosKunakpedia,
} from "./colecciones/grupo-a.ts";
import {
  categorias,
  categoriasCientificas,
  categoriasRecursos,
  etiquetas,
} from "./colecciones/taxonomias.ts";
import { paginas } from "./colecciones/paginas.ts";
import { arquetipos } from "./colecciones/arquetipos.ts";
import { autores } from "./colecciones/autores.ts";
import { media } from "./colecciones/media.ts";
import { slugs } from "./colecciones/slugs.ts";
import { usuarios } from "./colecciones/usuarios.ts";
import { avisaAlPublicador, fundeHooks } from "./hooks/avisa-publicador.ts";
import { PUBLICACION } from "./campos/comunes.ts";

/* ══════════════════════════════════════════════════════════════════════════
 * EL DISPARO DEL REBUILD SE CABLEA AQUÍ, NO COLECCIÓN A COLECCIÓN — F2-4
 *
 * Añadir `hooks: avisaAlPublicador(...)` a mano en cada fichero sería **una
 * lista escrita a mano de quince entradas**, y este repo ya tiene catalogado lo
 * que pasa con ésas: la número dieciséis se olvida, y su olvido no da error —
 * da una colección que se puede publicar **sin que el sitio se reconstruya**,
 * o sea un cambio guardado que no llega a servirse y nadie se entera.
 *
 * ── El predicado, y por qué NO es «las de contenido» ─────────────────────
 * Se deriva de la config: **dispara todo lo que NO esté en el grupo `Sistema`**.
 * Y el complemento se declara al revés a propósito —lista lo que se EXCLUYE, no
 * lo que se incluye— porque el defecto seguro es disparar de más: una colección
 * nueva entra disparando sola, y lo peor que puede pasar es un build sobrante.
 * Con la lista al derecho, lo peor que puede pasar es una publicación que no se
 * publica.
 *
 * Los dos excluidos, con su razón medida:
 *
 *   · `usuarios` — auth. Cambiar una contraseña no cambia un byte del HTML;
 *   · `slugs`    — **y aquí no es sólo que no haga falta: es que haría daño.**
 *     Lo escriben los hooks de las otras colecciones (§4), así que un guardado
 *     de contenido produce *dos* escrituras —el documento y su slug— y por tanto
 *     **dos disparos por un solo acto de publicar**. El coalescer lo absorbe,
 *     pero el recuento de `GET /estado` mentiría al editor, que es la cifra que
 *     F2-4 le pone delante.
 * ═════════════════════════════════════════════════════════════════════════ */
const SIN_DISPARO = "Sistema";

const conDisparo = (c: CollectionConfig): CollectionConfig =>
  c.admin?.group === SIN_DISPARO
    ? c
    : { ...c, hooks: fundeHooks(c.hooks ?? {}, avisaAlPublicador(c.slug)) };

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CAMPOS DE PUBLICACIÓN — F2-4, y su reparto se declara AL REVÉS que el
 * del disparo, por una razón que hay que decir en voz alta.
 *
 * El disparo lista lo que **excluye**: el defecto seguro es disparar de más y
 * lo peor que puede pasar es un build sobrante. Aquí el defecto seguro es el
 * contrario, y por eso la lista es de lo que **incluye**:
 *
 *   > Un `estado: "borrador"` en una TAXONOMÍA o en un MEDIA no es «un poco de
 *   > más»: es una relación rota. Una categoría en borrador la sigue apuntando
 *   > una entrada publicada, y ahí no hay nada que publicar — la categoría no
 *   > es una página, es una clasificación.
 *
 * Así que se publican los tres grupos que **son páginas o piezas de página** —
 * `Contenido`, `Páginas`, `Catálogo`— y NO `Taxonomías`, `Media` ni `Sistema`.
 * Sale de una declaración que la config ya tiene (`admin.group`), no de una
 * lista de slugs paralela: una colección nueva tiene que elegir grupo de todas
 * formas, así que no hay nada que mantener sincronizado.
 * ═════════════════════════════════════════════════════════════════════════ */
const GRUPOS_PUBLICABLES = new Set(["Contenido", "Páginas", "Catálogo"]);

export const esPublicable = (c: CollectionConfig) =>
  GRUPOS_PUBLICABLES.has(c.admin?.group as string);

const conPublicacion = (c: CollectionConfig): CollectionConfig =>
  esPublicable(c) ? { ...c, fields: [...c.fields, ...PUBLICACION] } : c;

/* ══════════════════════════════════════════════════════════════════════════
 * LAS VISTAS DEL LISTADO — F2-5, y se DERIVAN, no se listan.
 *
 * El criterio del PLAN: columnas que identifican una entrada de un vistazo
 * (título · slug · estado de publicación · fecha), «no los primeros N campos
 * del esquema» — que es lo que Payload pone por defecto. Escribir las columnas
 * colección a colección sería la lista a mano de quince entradas; aquí se
 * componen de lo que cada colección YA declara: su `useAsTitle`, si tiene
 * `slug`, y si es publicable (o sea, si `conPublicacion` le puso `estado`).
 *
 * Reparto:
 *   · `Sistema` no se toca — `usuarios` y `slugs` traen sus columnas escritas;
 *   · `upload` (media) tampoco: la biblioteca de medios de Payload ya lista
 *     por fichero y miniatura, y unas columnas de texto la empeorarían;
 *   · las publicables se ordenan por `-updatedAt` — quien edita busca «lo que
 *     toqué hace un momento», no el id de inserción del seed. La lectura del
 *     render NO depende de esto: el proyector pasa `sort: "id"` explícito;
 *   · la búsqueda del listado va por el título y el slug, que es como quien
 *     edita nombra las cosas.
 * ═════════════════════════════════════════════════════════════════════════ */
const conVistas = (c: CollectionConfig): CollectionConfig => {
  if (c.admin?.group === "Sistema" || c.upload) return c;
  const nombres = new Set(c.fields.map((f) => ("name" in f ? f.name : null)).filter(Boolean));
  const titulo = c.admin?.useAsTitle;
  const columnas = [
    ...(titulo ? [titulo] : []),
    ...(nombres.has("slug") && titulo !== "slug" ? ["slug"] : []),
    ...(nombres.has("estado") ? ["estado", "publicarEn"] : []),
    "updatedAt",
  ];
  const busqueda = [...new Set([titulo, "slug"])].filter((n): n is string => !!n && nombres.has(n));
  return {
    ...c,
    ...(nombres.has("estado") ? { defaultSort: "-updatedAt" } : {}),
    admin: {
      ...c.admin,
      defaultColumns: c.admin?.defaultColumns ?? columnas,
      listSearchableFields: c.admin?.listSearchableFields ?? busqueda,
    },
  };
};

export const COLECCIONES: CollectionConfig[] = [
  // Páginas de sector (§1.4 · §1.5 · §1.5b)
  sectores,
  monograficos,
  // Catálogo (§2e)
  productos,
  // Grupo C (§2b)
  casos,
  faqs,
  taxonomiaSectores,
  // Grupo A (§2 · §2.2 · §2.4)
  entradasBlog,
  terminosKunakpedia,
  documentosCientificos,
  // Cola larga F3-3 (§2j) — 31 páginas, 11 tipos de módulo, 313 módulos
  paginas,
  // Lote F3-5 (§2o) — PRODUCTO · CATÁLOGO · SOFTWARE (+ la variante corta)
  arquetipos,
  // Grupo D (§2d.1)
  articulosKb,
  // Taxonomías (§2c)
  categorias,
  etiquetas,
  categoriasRecursos,
  categoriasCientificas,
  // Autores (117.ª) — COLECCIÓN SIN ARCHIVO: no emite `/author/*`
  autores,
  // Media (CMS-0b)
  media,
  // Infraestructura — sin lado medido, y la comprobación lo dice
  // `slugs` es el registro del plano de /es/ (§4): no es contenido, es la
  // unicidad ENTRE familias hecha objeto. La escriben los hooks.
  slugs,
  usuarios,
]
  .map(conPublicacion)
  /* después de `conPublicacion`: las columnas de estado sólo existen si él las puso */
  .map(conVistas)
  .map(conDisparo);

export {
  articulosKb,
  autores,
  casos,
  categorias,
  categoriasCientificas,
  categoriasRecursos,
  documentosCientificos,
  entradasBlog,
  etiquetas,
  faqs,
  media,
  monograficos,
  paginas,
  productos,
  sectores,
  slugs,
  taxonomiaSectores,
  terminosKunakpedia,
  usuarios,
};
