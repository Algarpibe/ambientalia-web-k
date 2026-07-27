import { ListaContenido } from "@/components/ListaContenido";
import { METEO_SENSORS } from "@/lib/monitor";

/**
 * S3 · #meteo-sensors — "Sondas meteorológicas": H2 + shortcode
 * `lista-contenido` con las 6 sondas (anemómetros, pluviómetro, piranómetro,
 * WBGT y sensor UV-A).
 *
 * Es la variante "accesorios" del mismo shortcode que `ProductosTabs`: la
 * mecánica (hover en escritorio / acordeón táctil en móvil) vive en
 * `ListaContenido` + `useListaContenido`, así que este componente solo aporta
 * el título y los datos. La instancia gemela `#power-packs` se resolverá igual
 * en cuanto se capturen sus textos y fotos.
 *
 * Spec: docs/research/monitor-calidad-aire/components/sondas-meteorologicas.spec.md
 */
export function SondasMeteorologicas() {
  return (
    <div>
      {/* 37px = escala de los H2 de S3 (no la de 44px de las cabeceras de
          sección); mb 28px ≈ el 2,75% del módulo de título original */}
      <h2
        className="mb-[28px] pb-[10px]"
        style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Sondas meteorológicas
      </h2>

      <ListaContenido items={METEO_SENSORS} />
    </div>
  );
}
