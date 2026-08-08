import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      /**
       * ⚠ **Desactivada al emitir el `[slug]` de raíz del grupo A (2026-07-31),
       * y con la razón medida — no «porque molestaba».**
       *
       * `no-html-link-for-pages` marca un `<a>` cuyo destino sea una página del
       * proyecto y pide `<Link>`. Con el plano de raíz emitido, **cualquier href
       * literal de un segmento casa con `/[slug]`**, así que la regla empezó a
       * disparar sobre enlaces que llevan meses servidos y verificados. Se
       * comprobó moviendo las dos rutas nuevas fuera de `src/app`: el error
       * desaparece — o sea que lo produce el enrutado, no el enlace.
       *
       * Y el `<a>` es **deliberado en este repo**: el clon reproduce el marcado
       * del original, donde no hay navegación de cliente. Cambiar a `<Link>` por
       * callar un aviso tocaría páginas ya verificadas para ganar prefetch que
       * el original no tiene — justo el tipo de cambio que `CLAUDE.md` llama
       * criterio propio por encima de fidelidad.
       *
       * La guarda que sí importa aquí no es ésta: es `npm run qa:enlaces`, que
       * comprueba los href **contra las rutas que emite el build** y en las dos
       * direcciones. Ésa se queda.
       */
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /**
     * ⚠ **LOS ÁRBOLES DE BUILD ALTERNOS — F2-4, y su ausencia rompía `check`.**
     *
     * Desde F2-4 el publicador construye fuera de sitio (`NEXT_DIST_DIR`) y
     * promociona por rename, así que junto a `.next` conviven `.next-nuevo`,
     * `.next-anterior` y el que cada sonda estrene (`.next-e2e`, `.next-prog`…).
     * El ignore de arriba nombra **`.next` y sólo `.next`**, de modo que en
     * cuanto una corrida deja un hermano, `eslint` se pone a linter **código
     * generado**: medido el 2026-08-08, **502 errores y 10 187 avisos** que no
     * son de ninguna fuente del repo.
     *
     * Y el modo de fallo es el peor de los dos posibles: no es que `check` deje
     * pasar algo, es que **se pone rojo por un motivo que no existe** — y un
     * rojo que no significa nada es un rojo que se acaba ignorando.
     *
     * Comodín anclado al prefijo, igual que en `.gitignore`, y por lo mismo: la
     * lista a mano se queda corta en la siguiente sonda.
     */
    ".next-*/**",
  ]),
]);

export default eslintConfig;
