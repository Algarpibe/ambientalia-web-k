"use client";

/**
 * "Editar preferencias de cookies" — en el original es el botón del plugin
 * de consentimiento (Cookiebot). Al pulsarlo, Cookiebot reabre el panel de
 * preferencias vía `window.Cookiebot.renew()` (ver BEHAVIORS.md punto
 * abierto #8 — `window.Cookiebot` presente en el original).
 *
 * En el clon el script de Cookiebot no está cargado, así que la llamada es
 * un no-op seguro hasta que se decida clonar el banner (pendiente B6). Deja
 * el botón cableado a la API correcta para cuando exista.
 */
declare global {
  interface Window {
    Cookiebot?: { renew?: () => void };
  }
}

export function CookiePreferencesButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.Cookiebot?.renew?.()}
    >
      {label}
    </button>
  );
}
