/**
 * `@kunak/cms-config` — el paquete compartido que decidió CMS-0f.
 *
 * **Contenido acotado por el acta (`ESQUEMA-CMS.md` §CMS-0f):** config de
 * colecciones · tipos generados · defaults. **NADA de componentes de admin** —
 * es lo que permite que el build del clon lea por Local API sin HTTP y que el
 * churn del admin no toque el artefacto verificado.
 *
 * Lo que hay dentro, y de qué acta sale cada pieza:
 *
 * | pieza | fichero | acta |
 * |---|---|---|
 * | defaults medidos | `defaults.ts` | §1.4 · §1.5 · §2b · §2c · §2e · CMS-0b |
 * | campos y bloques compartidos | `campos/` · `bloques/` | §1.5b · §2d.1 |
 * | las 15 colecciones | `colecciones/` · `colecciones.ts` | §1.4 … §2e |
 * | la config | `payload.config.ts` | §CMS-0f |
 * | tipos generados | `payload-types.ts` | los emite `npm run cms:types` |
 *
 * ⚠ **La comprobación que verifica que las colecciones expresan TODOS los
 * campos medidos es `npm run qa:cms-campos`** (con su negativo
 * `qa:cms-campos-neg`). Que `payload-types.ts` compile **no** es esa prueba: un
 * campo que se cae en la traducción compila igual de bien.
 */
export * from "./defaults.ts";
export { COLECCIONES } from "./colecciones.ts";
export { construyeConfig } from "./payload.config.ts";
export type { OpcionesConfig } from "./payload.config.ts";

/**
 * Los tipos generados. **Generados, no escritos**: los emite
 * `npm run cms:types` desde las colecciones de este mismo paquete, y por eso
 * salen de aquí y no de la app de render — es la mitad «tipos» del contrato de
 * CMS-0f, y lo que permitirá que el build del clon compile tipado leyendo por
 * Local API.
 */
export type * from "./payload-types.ts";
