import { ListaContenido } from "@/components/ListaContenido";
import { BlockTitle } from "@/components/SectionRow";
import { POWER_PACKS } from "@/lib/monitor";

/**
 * S3 · #power-packs — "Paquetes de energía": H2 + shortcode `lista-contenido`
 * con los 3 accesorios (panel solar y los dos cargadores).
 *
 * Instancia gemela de `SondasMeteorologicas`: mismo componente y mismos
 * estilos, solo cambian los datos.
 *
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md §5
 */
export function PaquetesEnergia() {
  return (
    <div>
      <BlockTitle className="mb-[28px]">Paquetes de energía</BlockTitle>
      <ListaContenido items={POWER_PACKS} />
    </div>
  );
}
