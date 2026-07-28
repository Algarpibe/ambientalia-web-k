import type { SectorBloqueMapaProyectos } from "@/lib/sectores";

/**
 * "Proyectos por todo el mundo" — módulo `et_pb_map` con pines.
 * Spec: docs/research/sectores/components/sector-body.spec.md §mapaProyectos
 *
 * ⚠️ **El mapa de Google NO se clona, y es deliberado.** El módulo del original
 * carga la Maps JavaScript API con la clave del sitio; replicarlo significaría
 * usar una clave propia (coste y alta en GCP) o incrustar la ajena. Este
 * componente pinta el titular, la intro y la lista de pines en el contenedor
 * del tamaño medido (1238.4×570 a 1440), y deja el mapa como decisión de
 * producto.
 *
 * No lo usa Urbano — sí Industria (41 pines), Puertos (30) y Minería (32).
 */
export function MapaProyectos({ block }: { block: SectorBloqueMapaProyectos }) {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        <div className="relative">
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
            style={{ width: 60, height: 22 }}
          />
          <h2 className="pb-[10px] text-[35px] font-light leading-[43.75px] tracking-[-0.5px] text-[#333] md:text-[44px] md:leading-[55px]">
            {block.title}
          </h2>
          {block.intro ? (
            <p className="text-[18px] leading-[30.6px] text-[#333]">{block.intro}</p>
          ) : null}
        </div>

        {/* S8 (2026-07-28): la altura va SIN prefijo. El `et_pb_map_container`
            del original mide **570 en los dos anchos** (medido: 1238.4×570 y
            335.4×570, `height: 570px` fijo). Con `md:h-[570px]` los 41 pines de
            Industria se desplegaban enteros a 390 — 1632.9 de alto, +1062.9
            sobre el original, que era el grueso de su desfase móvil. */}
        <div className="mt-[30px] h-[570px] overflow-y-auto border border-[#ddd] bg-[#f4f4f4] p-[20px]">
          <ul className="columns-1 text-[18px] leading-[30.6px] text-[#333] md:columns-3">
            {block.pins.map((pin) => (
              <li key={pin.title + pin.lat}>{pin.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
