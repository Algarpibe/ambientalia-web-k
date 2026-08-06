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
