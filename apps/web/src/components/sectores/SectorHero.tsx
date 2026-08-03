import type { MonoHeroModulo } from "@/lib/monografico";
import type { SectorHero as SectorHeroData } from "@/lib/sectores";
import { BlueButton } from "../SectionRow";

/**
 * S3 — hero del sector: 1/2 + 1/2.
 * Spec: docs/research/sectores/components/sector-hero.spec.md
 *       docs/research/monografico-tecnico/components/cabecera-hero-cola.spec.md
 *
 * Izquierda: punteado a −65 · foto · dos botones azules.
 * Derecha: H2 de 37px (el azul lo pone un `<span>` dentro del h2, como el
 * original) y los párrafos con la rítmica Divi `padding-bottom: 18px` salvo el
 * último.
 *
 * En MÓVIL la columna de la foto va primera y el titular debajo — es el orden
 * del original (col. izq. y569.25, col. der. y972.13), no una decisión propia.
 *
 * ── Compartido con el arquetipo MONOGRÁFICO, con dos campos más (2026-07-29) ──
 * Medido original contra original, las cuatro páginas en la misma corrida: es
 * el MISMO componente, y solo difiere en dos cosas — las dos **entre
 * arquetipos, no entre páginas**:
 *
 * 1. `pb` — `padding-bottom` de la sección en desktop: **60** en SECTOR y
 *    **39** en el monográfico. A 390 los cuatro valen 20, así que el móvil no
 *    distingue nada.
 * 2. `modulos` — la columna derecha es una **lista de módulos de texto**, no
 *    `claim + párrafos`: SECTOR monta 2 y el monográfico 3, cada uno con su
 *    propio `<span>` de color. Un `headingColor` por página **no puede
 *    representar** el hero de EDAR, que lleva `#0c71c3` en el primero y
 *    `#0075c9` en los otros dos.
 *
 * Los datos de SECTOR **no se migran**: sus `heading` + `paragraphs` son
 * exactamente el caso de dos módulos, y tocarlos sería mover cuatro páginas
 * medidas a Δ0 para no ganar nada. Cuando `modulos` viene, manda; si no, se
 * pinta el par de siempre.
 */
/**
 * Un módulo de texto de la columna derecha: su `h2` con el `<span>` de color
 * dentro (como el original: el `h2` computa `#333`) y sus párrafos con la
 * rítmica Divi.
 *
 * Puede venir **vacío**: el primer módulo del hero de Petróleo mide 0 de alto y
 * solo aporta su `margin-bottom: 16`. Omitirlo deja la página 16px corta.
 */
function HeroModulo({
  mod,
  ultimo,
  separaTitular = false,
}: {
  mod: MonoHeroModulo;
  ultimo: boolean;
  separaTitular?: boolean;
}) {
  const mbClase =
    mod.mb !== undefined ? "" : ultimo ? "" : "mb-[30px] md:mb-[34.0469px]";
  return (
    <div className={mbClase} style={mod.mb !== undefined ? { marginBottom: mod.mb } : undefined}>
      {mod.heading ? (
        <h2
          className={
            "pb-[10px] text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333] " +
            (separaTitular ? "mb-[30px] md:mb-[34.0469px]" : "")
          }
        >
          {/* El color es CONTENIDO, no estilo: lo escribe quien edita en
              WordPress y varía **dentro de una misma página** (EDAR). Por
              defecto, el azul de marca. */}
          <span style={{ color: mod.headingColor ?? "#0075C9" }}>{mod.heading}</span>
        </h2>
      ) : null}

      {mod.paragraphs?.length ? (
        <div className="text-[18px] leading-[30.6px] text-[#333] [&>p:not(:last-child)]:pb-[18px]">
          {mod.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SectorHero({
  hero,
  modulos,
  pb,
}: {
  /**
   * La columna izquierda (foto + los dos botones) es la misma en los dos
   * arquetipos; `heading`/`paragraphs` solo los trae SECTOR, porque en el
   * monográfico ese contenido viene en `modulos`.
   */
  hero: Pick<SectorHeroData, "image" | "ctas"> &
    Partial<Pick<SectorHeroData, "heading" | "headingColor" | "paragraphs">>;
  modulos?: MonoHeroModulo[];
  pb?: number;
}) {
  return (
    <section
      /* El `pb` SOLO cambia en desktop (a 390 los cuatro valen 20), así que no
         puede ir por `style` inline: aplicaría a los dos anchos. Van las dos
         clases literales para que Tailwind las emita; si algún día aparece un
         tercer valor, se añade aquí y se anota de dónde salió. */
      className={
        "w-full bg-white pb-[20px] pt-[50px] md:pt-[57.5938px] " +
        (pb === 39 ? "md:pb-[39px]" : "md:pb-[60px]")
      }
    >
      <div data-fila="" className="mx-auto w-[86%] max-w-[1380px] pb-[30px] md:pb-[28.7969px]">
        <div className="flex flex-col md:flex-row md:gap-[5.5%]">
          {/* ── columna izquierda ───────────────────────────────── */}
          <div className="relative mb-[30px] w-full md:mb-0 md:w-[47.25%]">
            <img
              src="/images/uploads/2022/12/punteado.svg"
              alt=""
              aria-hidden
              width={60}
              height={22}
              className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
              style={{ width: 60, height: 22 }}
            />

            <img
              src={hero.image.src}
              alt={hero.image.alt}
              className="mb-[30px] w-full md:mb-[34.0469px]"
            />

            {hero.ctas.map((cta, i) => (
              <div key={cta.href + cta.label} className={i === 0 ? "mb-[16px]" : ""}>
                <BlueButton href={cta.href} external={cta.external}>
                  {cta.label}
                </BlueButton>
                {/* margin-bottom 30 del propio botón Divi (wrapper de 74) */}
                <div aria-hidden className="h-[30px]" />
              </div>
            ))}
          </div>

          {/* ── columna derecha ─────────────────────────────────── */}
          <div className="w-full md:w-[47.25%]">
            {modulos ? (
              modulos.map((mod, i) => (
                <HeroModulo key={i} mod={mod} ultimo={i === modulos.length - 1} />
              ))
            ) : (
              <HeroModulo
                mod={{
                  heading: hero.heading,
                  headingColor: hero.headingColor,
                  paragraphs: hero.paragraphs ?? [],
                }}
                ultimo
                /* SECTOR: el h2 y los párrafos son DOS módulos del original con
                   `mb 34.0469 / 30` entre ellos. Aquí van juntos con ese hueco
                   ya dentro, que es como se midió a Δ0 en los 4 sectores. */
                separaTitular
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
