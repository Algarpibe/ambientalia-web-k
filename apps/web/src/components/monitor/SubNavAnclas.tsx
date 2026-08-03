import { AnchorNav } from "@/components/AnchorNav";
import { BlueButton, OutlineButton } from "@/components/SectionRow";
import { ANCHOR_LINKS, DATASHEET_PDF, CONTACT_HREF, CATALOG_HREF } from "@/lib/monitor";

/**
 * S3 · columna izquierda — sub-nav de anclas sticky + scrollspy + 3 CTAs.
 * Spec: docs/research/monitor-calidad-aire/components/subnav-anclas.spec.md
 * y docs/research/accesorios/components/anchor-nav.spec.md (valores unificados).
 *
 * La caja de anclas vive ahora en `AnchorNav` (compartida con /accesorios).
 * Aquí solo queda lo propio de esta página: la columna 1/4 sticky, los 3 CTAs
 * —que en móvil sobreviven como barra horizontal gris bajo el header cuando la
 * caja se oculta— y el offset de scroll 0 (el original NO compensa el header
 * al saltar por ancla, y el H2 queda parcialmente tapado: es fiel).
 */
export function SubNavAnclas() {
  return (
    <aside
      className={
        // QA 2026-07-26: columna Divi 1/4 = 20.875% con pt 32 en desktop.
        "columna-lista-anclas w-full md:w-[20.875%] md:shrink-0 md:pt-[32px] " +
        // `md:self-start` es imprescindible: por defecto el flex item se estira
        // (align-items:stretch) a la altura completa de la fila (~5300px) y un
        // sticky tan alto como su contenedor no llega a pegarse nunca.
        "md:self-start " +
        // Desktop: barra lateral sticky. Móvil: barra horizontal gris bajo el header.
        "md:sticky md:top-[70px] max-md:sticky max-md:top-[60px] max-md:z-[2] max-md:bg-[#f4f4f4] max-md:py-2"
      }
    >
      <AnchorNav items={ANCHOR_LINKS}>
        {/* 3 CTAs — apilados en desktop, barra horizontal en móvil */}
        <div className="mt-0 flex flex-row flex-wrap justify-center gap-2 md:mt-0 md:w-full md:flex-col md:items-start md:gap-[14px]">
          <OutlineButton href={DATASHEET_PDF}>Descargar ficha técnica</OutlineButton>
          <BlueButton href={CONTACT_HREF}>Solicita más información</BlueButton>
          <BlueButton href={CATALOG_HREF}>Descarga el catálogo</BlueButton>
        </div>
      </AnchorNav>
    </aside>
  );
}
