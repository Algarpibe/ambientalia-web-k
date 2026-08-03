import type { SectorBlock } from "@/lib/sectores";
import { BeneficiosAplicaciones } from "./BeneficiosAplicaciones";
import { ClaimConFoto } from "./ClaimConFoto";
import { CtaDescarga } from "./CtaDescarga";
import { ListaSimple2Col } from "./ListaSimple2Col";
import { MapaProyectos } from "./MapaProyectos";

/**
 * El *flexible content* del arquetipo SECTOR: recorre `body: SectorBlock[]`,
 * **agrupa los bloques en secciones** según su `flujo` y despacha cada uno por
 * su `kind`.
 * Spec: docs/research/sectores/components/sector-body.spec.md
 *
 * Es lo que permite que la MISMA plantilla sirva para:
 *   Urbano    → ctaDescarga · beneficiosAplicaciones · claimConFoto
 *   Industria → beneficiosAplicaciones · ctaDescarga · listaSimple2Col ·
 *               claimConFoto · mapaProyectos
 *   Investigación → sin ctaDescarga
 *
 * ── Por qué este componente monta la sección y la fila, y no cada bloque ──────
 * S7 (2026-07-28). Antes cada bloque se envolvía a sí mismo en una `<section>`
 * con ritmo completo, que es lo que hace Urbano *por casualidad*: allí el CTA y
 * las listas SÍ caen en dos secciones distintas del original. En Industria los
 * cinco bloques son **cinco filas de la misma sección**, y meter cada uno en la
 * suya metía de más el `pb 14` de sección + el `pt 2%` de fila en cada junta:
 * el CTA caía +42.8 y de ahí abajo todo ~+70.
 *
 * El ritmo es de la plantilla, así que vive aquí; lo editorial es **dónde
 * corta**, y eso es el campo `flujo` del content type. Reglas, de la tabla
 * medida en `SectorBlockFlujo`:
 *
 *   · abre `<section>` → `seccion` | `seccionRasa` | ser el primero del cuerpo
 *     (una fila necesita una sección que la contenga, lo declare o no)
 *   · la sección lleva ritmo salvo que sea `seccionRasa`
 *   · la fila lleva `padding-top` salvo que sea `filaPegada`
 *   · **todas** las filas cierran igual, de ahí que el `pb` no dependa de nada
 *
 * El `default` del switch hace un `never` check: si mañana se añade un `kind` al
 * modelo y no se pinta aquí, **rompe el typecheck** en vez de desaparecer en
 * silencio.
 */

/** Sección Divi con ritmo del cuerpo: `mt −14` · `pt 57.5938 / 50` · `pb 14`. */
const SECCION_CON_RITMO = "-mt-[14px] pb-[14px] pt-[50px] md:pt-[57.5938px]";
/** Retícula de fila del sector: 86% máx 1380, `pb 2% / 30` siempre. */
const FILA = "mx-auto w-[86%] max-w-[1380px] pb-[30px] md:pb-[28.7969px]";
/** `pt` de fila — el que se come `filaPegada`. */
const FILA_PT = "pt-[30px] md:pt-[28.7969px]";

/** Un bloque con el índice que tenía en `body` (la key estable de su fila). */
type Fila = { block: SectorBlock; i: number };

/**
 * Reparte los bloques en secciones. Devuelve una entrada por `<section>` del
 * original, con las filas que van dentro y si esa sección es rasa.
 */
function agruparEnSecciones(body: SectorBlock[]): { rasa: boolean; filas: Fila[] }[] {
  const secciones: { rasa: boolean; filas: Fila[] }[] = [];

  body.forEach((block, i) => {
    const flujo = block.flujo ?? "seccion";
    const abreSeccion =
      secciones.length === 0 || flujo === "seccion" || flujo === "seccionRasa";

    if (abreSeccion) secciones.push({ rasa: flujo === "seccionRasa", filas: [] });
    secciones[secciones.length - 1].filas.push({ block, i });
  });

  return secciones;
}

function Bloque({ block }: { block: SectorBlock }) {
  switch (block.kind) {
    case "ctaDescarga":
      return <CtaDescarga block={block} />;
    case "beneficiosAplicaciones":
      return <BeneficiosAplicaciones block={block} />;
    case "claimConFoto":
      return <ClaimConFoto block={block} />;
    case "listaSimple2Col":
      return <ListaSimple2Col block={block} />;
    case "mapaProyectos":
      return <MapaProyectos block={block} />;
    default: {
      const nunca: never = block;
      throw new Error(`Bloque de sector sin renderizador: ${JSON.stringify(nunca)}`);
    }
  }
}

export function SectorBody({ body }: { body: SectorBlock[] }) {
  return (
    <>
      {agruparEnSecciones(body).map((seccion) => (
        <section
          key={`sec-${seccion.filas[0].i}`}
          className={"w-full bg-white" + (seccion.rasa ? "" : ` ${SECCION_CON_RITMO}`)}
        >
          {seccion.filas.map(({ block, i }) => (
            <div
              key={`${block.kind}-${i}`}
              data-fila=""
              className={
                FILA + (block.flujo === "filaPegada" ? "" : ` ${FILA_PT}`)
              }
            >
              <Bloque block={block} />
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
