import type { SectorBloqueBeneficiosAplicaciones } from "@/lib/sectores";

/**
 * Las dos listas con viñeta azul: "Beneficios de…" | "Aplicaciones en…".
 * Spec: docs/research/sectores/components/beneficios-aplicaciones.spec.md
 *
 * OJO con el nombre: `software/ListaBeneficios` es otra cosa (blurbs con
 * icono). Aquí son dos `<ul>` de texto.
 *
 * El `<h3>` lleva **tamaño de h2 de sección** (44/55 desktop, 35/43.75 móvil)
 * y va al 80% del ancho de la columna, que es lo que hace que envuelva como en
 * el original. La sección tiene `margin-top: -14` (Divi custom, medido).
 */
function ListaConVinetas({ items }: { items: string[] }) {
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

function Columna({
  titulo,
  items,
  ultima = false,
}: {
  titulo: string;
  items: string[];
  /** La última columna Divi no lleva `margin-bottom` en móvil (medido: 30 / 0). */
  ultima?: boolean;
}) {
  return (
    <div
      className={
        "relative w-full md:w-[47.25%] " + (ultima ? "" : "mb-[30px] md:mb-0")
      }
    >
      <img
        src="/images/uploads/2022/12/punteado.svg"
        alt=""
        aria-hidden
        width={60}
        height={22}
        className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
        style={{ width: 60, height: 22 }}
      />
      <h3 className="mb-[30px] w-[80%] pb-[10px] text-[35px] font-light leading-[43.75px] tracking-[-0.5px] text-[#333] md:mb-[34.0469px] md:text-[44px] md:leading-[55px]">
        {titulo}
      </h3>
      <ListaConVinetas items={items} />
    </div>
  );
}

export function BeneficiosAplicaciones({
  block,
}: {
  block: SectorBloqueBeneficiosAplicaciones;
}) {
  return (
    <section className="-mt-[14px] w-full bg-white pb-[14px] pt-[50px] md:pt-[57.5938px]">
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        <div className="flex flex-col md:flex-row md:gap-[5.5%]">
          <Columna titulo={block.left.title} items={block.left.items} />
          <Columna titulo={block.right.title} items={block.right.items} ultima />
        </div>
      </div>
    </section>
  );
}
