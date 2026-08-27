import type { NextConfig } from "next";

/* La lista de redirecciones vive con el resto del dato del archivo de
 * `sector`, no aquí: una segunda copia sería una segunda fuente de verdad. */
import { REDIRECCIONES_SECTOR } from "./src/lib/sector-archivo";

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

  /**
   * ── LAS 5 REDIRECCIONES DE `/sector/*` — F3-4, 118.ª ─────────────────────
   *
   * Decisión: `ESQUEMA-CMS.md` §7i (c2), **REPLICAR TAL CUAL**. De los 11
   * términos de `taxonomia-sectores`, **5 dan 301 en el original** y se
   * replican **como redirección, no como página**: servir un 200 donde el
   * original sirve un salto sería cambiar el comportamiento con la excusa de
   * copiarlo.
   *
   * Los destinos están **medidos en vivo** (`derivaciones/estados-114.*`, con
   * `redirect: "manual"`, sin cookies ni perfil). Un corpus guarda el CUERPO,
   * no el estado: ése es el único canal que puede darlos.
   *
   * ⚠⚠ **`statusCode: 301`, NO `permanent: true` — y esto se midió, no se
   * dedujo.** `permanent: true` es la forma que uno escribe pensando «el
   * original es permanente», y Next la traduce a **308**, no a 301. Medido
   * contra el servidor: las 5 salían `308`.
   *
   * Los dos son «redirección permanente» y **no son el mismo byte**: 301
   * permite que el cliente cambie el método a GET y 308 lo prohíbe. El
   * original sirve **301** (`estados-114`, `redirect: "manual"`), así que 308
   * es un valor que el original no produce.
   *
   * §*el veredicto lo da la salida servida*: el diff de este fichero se leía
   * correcto —el comentario decía «301»— y lo servido decía otra cosa. Lo cazó
   * **medir después**, que es el paso 2 que ningún marcador de frescura da.
   *
   * ⚠ **Y `/sector/mineria` redirige A SÍ MISMA**, 5 saltos medidos. Se
   * replica igual: el visitante del original no llega a ninguna página, y un
   * clon que sí llegue no replica, mejora. El MECANISMO del bucle **no se
   * diagnostica** — necesita red (§7i).
   *
   * Las rutas **no** llevan barra final: `trailingSlash` no está activado.
   */
  async redirects() {
    return REDIRECCIONES_SECTOR.map((r) => ({ source: r.de, destination: r.a, statusCode: 301 as const }));
  },
};

export default nextConfig;
