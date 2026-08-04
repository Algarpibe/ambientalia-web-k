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
import { media } from "./colecciones/media.ts";
import { usuarios } from "./colecciones/usuarios.ts";

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
  // Grupo D (§2d.1)
  articulosKb,
  // Taxonomías (§2c)
  categorias,
  etiquetas,
  categoriasRecursos,
  categoriasCientificas,
  // Media (CMS-0b)
  media,
  // Infraestructura — sin lado medido, y la comprobación lo dice
  usuarios,
];

export {
  articulosKb,
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
  productos,
  sectores,
  taxonomiaSectores,
  terminosKunakpedia,
  usuarios,
};
