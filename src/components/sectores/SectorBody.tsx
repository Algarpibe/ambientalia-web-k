import type { SectorBlock } from "@/lib/sectores";
import { BeneficiosAplicaciones } from "./BeneficiosAplicaciones";
import { ClaimConFoto } from "./ClaimConFoto";
import { CtaDescarga } from "./CtaDescarga";
import { ListaSimple2Col } from "./ListaSimple2Col";
import { MapaProyectos } from "./MapaProyectos";

/**
 * El *flexible content* del arquetipo SECTOR: recorre `body: SectorBlock[]` y
 * despacha cada bloque por su `kind`.
 * Spec: docs/research/sectores/components/sector-body.spec.md
 *
 * Es lo que permite que la MISMA plantilla sirva para:
 *   Urbano    → ctaDescarga · beneficiosAplicaciones · claimConFoto
 *   Industria → beneficiosAplicaciones · ctaDescarga · listaSimple2Col ·
 *               claimConFoto · mapaProyectos
 *   Investigación → sin ctaDescarga
 *
 * El `default` hace un `never` check: si mañana se añade un `kind` al modelo y
 * no se pinta aquí, **rompe el typecheck** en vez de desaparecer en silencio.
 */
export function SectorBody({ body }: { body: SectorBlock[] }) {
  return (
    <>
      {body.map((block, i) => {
        const key = `${block.kind}-${i}`;
        switch (block.kind) {
          case "ctaDescarga":
            return <CtaDescarga key={key} block={block} />;
          case "beneficiosAplicaciones":
            return <BeneficiosAplicaciones key={key} block={block} />;
          case "claimConFoto":
            return <ClaimConFoto key={key} block={block} />;
          case "listaSimple2Col":
            return <ListaSimple2Col key={key} block={block} />;
          case "mapaProyectos":
            return <MapaProyectos key={key} block={block} />;
          default: {
            const nunca: never = block;
            throw new Error(`Bloque de sector sin renderizador: ${JSON.stringify(nunca)}`);
          }
        }
      })}
    </>
  );
}
