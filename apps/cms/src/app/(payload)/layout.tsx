/* Cascarón del admin de Payload. Generado según el andamio estándar de
 * `@payloadcms/next`: esta app **solo** monta el admin y la API del CMS
 * (CMS-0f), y no comparte nada de render con `apps/web`. */
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";
import "@payloadcms/next/css";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
