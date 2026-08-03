/**
 * `@kunak/cms-config` — el paquete compartido que decidió CMS-0f.
 *
 * **Contenido acotado por el acta (`ESQUEMA-CMS.md` §CMS-0f):** config de
 * colecciones · tipos generados · defaults. **NADA de componentes de admin.**
 *
 * Hoy solo lleva los **defaults**, que es lo único de los tres que ya está
 * medido. Las colecciones y `payload-types.ts` entran en el bloque siguiente de
 * F2-1, cuando Payload se instale — y entran AQUÍ, no en la app de render:
 * es lo que permite que el build del clon lea por Local API sin HTTP y que el
 * churn del admin no toque el artefacto verificado.
 */
export * from "./defaults.js";
