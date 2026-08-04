import { withPayload } from "@payloadcms/next/withPayload";

/**
 * ⚠ **Este `next.config` no es el del artefacto verificado.** Es justo el punto
 * de CMS-0f: con app única, cada release de Payload aterrizaría en el
 * `package.json` y el `next.config` de la app de render y **forzaría el
 * protocolo completo de re-aceptación** (línea base, matar por puerto, `.next`
 * borrado, marcador de frescura, umbral cero a dos anchos). Aquí el churn del
 * admin se queda.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // El admin no se exporta como sitio estático: es una app viva contra la DB.
  reactStrictMode: true,
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
