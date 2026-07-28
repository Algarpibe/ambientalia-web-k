import type { SectorBloqueListaSimple2Col } from "@/lib/sectores";

/**
 * Párrafo de entrada + una lista repartida en dos columnas 1/2.
 * Spec: docs/research/sectores/components/sector-body.spec.md §listaSimple2Col
 *
 * No lo usa Urbano: lo usa Industria ("Algunos de las aplicaciones donde
 * desplegar sistemas de monitorización ambiental son:" + 6 + 6). Se implementa
 * porque forma parte del arquetipo y la plantilla tiene que servir para los 8
 * sectores sin tocar código.
 *
 * Mismas reglas de lista que `BeneficiosAplicaciones` (viñeta azul colgando).
 */
function Lista({ items }: { items: string[] }) {
  return (
    <ul className="list-none pb-[18px] pl-[36px] text-[18px] leading-[30.6px] text-[#333]">
      {items.map((item) => (
        <li
          key={item}
          className="before:-ml-[20.16px] before:inline-block before:w-[20.1562px] before:text-[22.4px] before:text-[#0075C9] before:content-['•']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ListaSimple2Col({ block }: { block: SectorBloqueListaSimple2Col }) {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        {block.intro ? (
          <p className="text-[18px] leading-[30.6px] text-[#333]">{block.intro}</p>
        ) : null}

        <div className="flex flex-col md:flex-row md:gap-[5.5%]">
          <div className="w-full md:w-[47.25%]">
            <Lista items={block.left} />
          </div>
          <div className="w-full md:w-[47.25%]">
            <Lista items={block.right} />
          </div>
        </div>
      </div>
    </section>
  );
}
