import type { SectorHeader } from "@/lib/sectores";

/**
 * `.cabecera.cabecera-sectores` — la franja de foto con el kicker y el H1
 * encima. Spec: docs/research/sectores/components/cabecera-sector.spec.md
 *
 * Es la franja decorativa de las otras 4 páginas MÁS una fila Divi de texto:
 * 397.61 de alto en desktop y 347.25 en móvil, contra los 225 de aquéllas.
 *
 * `HeaderNav` es `absolute` y no ocupa espacio: el hueco de sus filas
 * (185 desktop / 125.58 móvil, medidos en el original) lo pone el `padding-top`
 * de aquí. En el clon el header real acaba en 203.59 a 1440, o sea que su caja
 * solapa 18.6px de la franja, pero no hay colisión visual: lo más bajo que
 * pinta es el pill "Descargar catálogo", que termina en ~173.
 */
export function CabeceraSector({ header }: { header: SectorHeader }) {
  return (
    <section
      className="cabecera-sectores w-full bg-cover bg-center pb-[40px] pt-[125.58px] md:pt-[185px]"
      style={{
        backgroundImage:
          `linear-gradient(rgba(71,71,71,0.17) 0%, rgba(0,0,0,0) 100%), url('${header.image}')`,
      }}
    >
      {/* Fila Divi: **86% máx 1380** en los dos anchos (medido a 1280/1440/
          1600/1800: 1100.8 · 1238.39 · 1376 · 1380 — el máximo entra a ~1605).
          NO es el 80% de las páginas de producto. py 30 móvil / 2% desktop. */}
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        {/* Kicker: 40px sobre una caja de línea de 30.6 y `margin-top: -13`.
            El hueco hasta el h1 (29.77 desktop / 16.22 móvil) incluye los
            11.21px de alto del módulo original que no supimos atribuir a
            ninguna regla Divi — ver la spec. */}
        <p className="-mt-[13px] mb-[16.22px] text-[40px] font-bold leading-[30.6px] text-white md:mb-[29.77px]">
          {header.kicker}
        </p>

        {/* ⚠ ANCHO DE MÓDULO: 50 % en desktop, 100 % por debajo del corte de Divi.
            No es decoración — es lo que decide DÓNDE ENVUELVE el titular, y por
            tanto el alto de toda la cabecera.

            Medido 2026-08-02 con `qa:cabecera` (los dos lados, 5 anchos):

            | ancho | h1 / fila del original | renglones del monográfico |
            |---|---|---|
            | 390  | 335.39 / 335.39 = **100 %** | 4 |
            | 800  | 688 / 688 = **100 %**       | 2 |
            | 1000 | 430 / 860 = **50 %**        | 3 |
            | 1280 | 550.39 / 1100.8 = **50 %**  | 2 |
            | 1440 | 619.19 / 1238.39 = **50 %** | 2 |

            El clon daba **100 % en los cinco**. Con el titular corto de los 4
            sectores eso no deja rastro —cabe en un renglón con 619 y con 1238—,
            y por eso el defecto vivió invisible hasta que un titular largo lo
            destapó: es el mecanismo del NO-WRAP de `CLAUDE.md`, que solo aparece
            al ancho donde el texto SÍ envuelve.

            El 50 % es **porcentaje, no px**: se separó de «un ancho fijo» con el
            tercer ancho (550.39 a 1280 contra 619.19 a 1440). Y el corte está
            entre 800 y 1000 — el de Divi (980), que este repo ya escribe como
            `min-[981px]:`. Los cinco anchos dan el mismo valor en las 4
            instancias vivas: es plantilla, no campo por instancia. */}
        <h1 className="w-full pb-[10px] text-[30px] font-normal leading-[36px] tracking-[-0.5px] text-white min-[981px]:w-1/2">
          {header.title}
        </h1>

        {/* margin-bottom del módulo del h1 (21.6562 desktop / 5.8594 móvil) */}
        <div aria-hidden className="h-[5.8594px] md:h-[21.6562px]" />
      </div>
    </section>
  );
}
