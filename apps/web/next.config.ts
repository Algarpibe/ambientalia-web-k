import type { NextConfig } from "next";

/**
 * ⚠ **Este fichero cambia en F2-3 (2026-08-05), y es la primera vez.** Hasta la
 * fase anterior el artefacto verificado no dependía de nada del CMS; desde aquí
 * las páginas leen por Local API en build (CMS-0 · CMS-0c), y eso obliga a
 * decirle al empaquetador cómo tratar dos cosas.
 */
const nextConfig: NextConfig = {
  output: "standalone",

  /**
   * ── `distDir` POR VARIABLE DE ENTORNO — F2-4, y NO es una comodidad ───────
   *
   * **Medido el 2026-08-07, y es lo contrario de lo que se venía diciendo:** un
   * `next build` que falla **no deja el build anterior, lo BORRA**. Con la DB
   * parada, el build sale `exit 1` y `.next` se queda **sin `BUILD_ID`, sin
   * `standalone` y sin `prerender-manifest`** — comprobado los tres.
   *
   * O sea que la frase tranquilizadora *«si el rebuild falla se sigue sirviendo
   * lo de antes»* es **falsa en este proyecto**: reconstruir en sitio no arriesga
   * quedarse desactualizado, arriesga **quedarse sin sitio**. Y no sólo al
   * fallar: `next build` vacía su directorio desde el primer segundo, así que
   * hay una ventana de ~90 s (A-SP13) en la que no hay build **aunque todo
   * vaya bien**.
   *
   * Con CMS-0c —publicar ES reconstruir— eso deja de ser un detalle de
   * despliegue: es el camino que recorre cada publicación. De ahí la única
   * salida que no depende de que nada falle:
   *
   *   > **se construye FUERA y se promociona sólo si el build salió 0.**
   *
   * Esta variable es la mitad de «fuera». La otra —promocionar— vive en
   * `scripts/publicar/publicador.mjs`.
   *
   * ⚠ **Sin la variable puesta vale `.next` y el artefacto no cambia**: es
   * inerte para todo lo que no sea el publicador, que es la condición para que
   * no haya que volver a pagar el Δ0 de las 31 rutas.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",

  /**
   * `@kunak/cms-config` es un paquete del monorepo escrito en TypeScript **sin
   * compilar** (`main: "./src/index.ts"`). Sin esto, Next lo trata como una
   * dependencia ya construida y se encuentra tipos en un `.ts` de
   * `node_modules`.
   */
  transpilePackages: ["@kunak/cms-config"],

  /**
   * `payload` y el adaptador de Postgres **no se empaquetan**: se cargan como
   * módulos de Node. Son código de servidor con binarios y `require` dinámicos
   * detrás (`pg`, `sharp`, las migraciones), y meterlos por el bundler es la
   * vía rápida a un fallo que no se parece a su causa.
   *
   * Y no cuesta nada en lo que a este proyecto le importa: **no llegan al
   * cliente ni al HTML servido**. Sólo corren durante `next build`, que es
   * justo lo que dice CMS-0c — *Postgres es dependencia de build, no de
   * runtime*.
   */
  serverExternalPackages: ["payload", "@payloadcms/db-postgres", "sharp"],
};

export default nextConfig;
