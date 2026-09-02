/**
 * Tipos de `entorno.mjs` para quien lo importa desde `.ts` DENTRO de este
 * paquete (`packages/cms-config/tsconfig.json` no lleva `allowJs`, así que TS
 * no puede inferirlos del JS — `apps/web` sí los infiere vía `allowJs`, y por
 * eso esta declaración no le hacía falta hasta que un hook la importó).
 *
 * Firma, no reimplementación: si `entorno.mjs` cambia su forma, esto se
 * queda desincronizado — el consumidor típico es `apps/web` con `allowJs`
 * cubriendo la discrepancia; el consumidor nuevo (`registro-slug.ts`) usa
 * sólo `rutasConstruidas`, que es la única firma que le hace falta a este
 * fichero mantener honesta.
 */
export declare const ORIGEN: string;
export declare const COMPONEN_RUTA: Set<string>;
/**
 * `href` acepta CUALQUIER TIPO a propósito — el cuerpo real hace
 * `typeof href !== "string"` y devuelve `href` TAL CUAL si no lo es (no
 * tira). Declararlo `string` sería más estricto que el contrato real y
 * rompería a `apps/web/src/lib/cms/proyector.ts`, que le pasa un `unknown`
 * sin acotar antes de esta llamada — medido al escribir este fichero (140.ª).
 */
export declare function hrefSegunEntorno(href: unknown, construidas: Set<string>): unknown;
export declare function rutasConstruidas(appDir: string): Set<string>;
