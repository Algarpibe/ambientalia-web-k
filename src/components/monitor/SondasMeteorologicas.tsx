import { ListaContenido } from "@/components/ListaContenido";
import { BlockTitle } from "@/components/SectionRow";
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
      {/* mb 28px ≈ el 2,75% de margen del módulo de título original */}
      <BlockTitle className="mb-[28px]">Sondas meteorológicas</BlockTitle>

      <ListaContenido items={METEO_SENSORS} />
    </div>
  );
}
