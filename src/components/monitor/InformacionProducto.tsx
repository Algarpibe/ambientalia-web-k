import type { ReactNode } from "react";
import { BlueButton, OutlineButton } from "@/components/SectionRow";
import {
  VALIDATOR_LOGOS,
  CHECKLIST_ITEMS,
  CONTAMINANT_CHIPS,
  DATASHEET_PDF,
  CONTACT_HREF,
  CATALOG_HREF,
} from "@/lib/monitor";

/**
 * S1 · fila 2 — "Información del producto".
 * Spec: docs/research/monitor-calidad-aire/components/informacion-producto.spec.md
 *
 * Col izq 1/3: título + foto producto + 3 CTAs apilados.
 * Col der 2/3: copy largo con H3 azules, 2 recuadros azules (radius 20 y 12),
 * checklist de 6 iconos, 2ª fila de logos validadores y grid de 16 chips.
 */

/* Tipografías base de la columna derecha */
function BodyP({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={"text-[18px] leading-[30.6px] text-[#333] " + className} style={{ fontWeight: 400 }}>
      {children}
    </p>
  );
}
function H3Blue({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, color: "#0075C9", letterSpacing: "-0.5px" }}>
      {children}
    </h3>
  );
}
/** Destacado azul sin enlace (span/strong #0075C9 w700). */
function Hi({ children }: { children: ReactNode }) {
  return <strong className="font-bold text-[#0075C9]">{children}</strong>;
}
/** Enlace inline en el copy: color #333 sin subrayado. */
function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-[#333] hover:text-[#0075C9]">
      {children}
    </a>
  );
}

export function InformacionProducto() {
  return (
    <section className="bg-white py-[30px]">
      <div className="mx-auto flex w-[85%] max-w-[1080px] flex-col gap-[30px] md:flex-row md:gap-[4%]">
        {/* ---------- Columna izquierda (1/3) ---------- */}
        <div className="relative w-full md:w-[30%] md:shrink-0">
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
            style={{ width: 60, height: 22 }}
          />
          <p
            className="pb-[10px]"
            style={{ fontSize: 44, lineHeight: "55px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
          >
            Información del producto
          </p>

          <img
            src="/images/uploads/2022/12/kunak_air_pro_completo-isolated-2.png"
            alt="Kunak AIR Pro instalado en mástil con panel solar"
            className="my-[20px] h-auto w-full max-w-[220px] object-contain max-md:mx-auto"
          />

          <div className="flex flex-col items-start gap-[16px] max-md:items-center">
            <OutlineButton href={DATASHEET_PDF}>Descargar ficha técnica</OutlineButton>
            <BlueButton href={CONTACT_HREF}>Solicita más información</BlueButton>
            <BlueButton href={CATALOG_HREF}>Descarga el catálogo</BlueButton>
          </div>
        </div>

        {/* ---------- Columna derecha (2/3) ---------- */}
        <div className="w-full space-y-[22px] md:w-[66%]">
          <H3Blue>Te mereces una buena calidad del aire.</H3Blue>

          <BodyP>
            Monitoriza partículas y hasta 5 gases contaminantes de nuestra amplia gama de sensores. El
            Kunak AIR Pro proporciona datos continuos y en tiempo real del aire ambiente, con mediciones
            equiparables a las de referencia en cualquier entorno, para una monitorización fiable.
          </BodyP>
          <BodyP>
            Todos los datos recogidos se pueden visualizar y analizar en cualquier momento y lugar a través
            de la plataforma web{" "}
            <InlineLink href="https://kunakair.com/es/software-de-medicion-calidad-del-aire/">
              Kunak AIR Cloud
            </InlineLink>
            .
          </BodyP>

          {/* Recuadro azul 1 — radius 20 */}
          <BlueBox radius={20} padding={25}>
            <BodyP>
              <Hi>Calidad de los datos garantizada.</Hi> Todos nuestros sensores se calibran y prueban en
              fábrica de acuerdo con la <Hi>norma europea CEN/TS 17660</Hi> y los protocolos, métricas y
              valores objetivo de la <Hi>EPA/600/R</Hi> para sensores de aire.
            </BodyP>
            <BodyP className="mt-[15px]">
              <Hi>Trazabilidad de los datos</Hi> respecto a normas de referencia:{" "}
              <Hi>Directiva Europea 2024/2881</Hi> y <Hi>USEPA 40 CFR Parte 53</Hi>.
            </BodyP>
          </BlueBox>

          <H3Blue>Obtén datos precisos sobre una amplia gama de contaminantes.</H3Blue>

          <BodyP>
            <strong className="font-bold text-[#333]">La solución más versátil.</strong> Nuestra tecnología
            de cartuchos de gas <em>plug &amp; play</em> te permite combinar y cambiar fácilmente los
            sensores en cualquier momento para adaptarlos a las necesidades de tu proyecto.
          </BodyP>

          {/* Checklist de 6 iconos — grid 2 col */}
          <ul className="grid list-none grid-cols-1 gap-x-[2%] gap-y-[18px] p-0 sm:grid-cols-2">
            {CHECKLIST_ITEMS.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <img src={c.icon} alt="" aria-hidden className="h-[40px] w-[40px] shrink-0 object-contain" />
                <span style={{ fontSize: 18, lineHeight: "21.6px", fontWeight: 300, color: "#333" }}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>

          <BodyP>
            Con las estaciones de calidad del aire{" "}
            <InlineLink href="https://kunakair.com/es/soluciones/">Kunak AIR</InlineLink> obtienes una
            monitorización ambiental con mediciones precisas, fiables y en tiempo real de los principales
            contaminantes con un coste menor a los métodos tradicionales.
          </BodyP>

          {/* Recuadro azul 2 — radius 12 */}
          <BlueBox radius={12} padding={20}>
            <BodyP>
              Las estaciones Kunak AIR ofrecen niveles de rendimiento cercanos a los{" "}
              <Hi>estándares de referencia</Hi>, proporcionando datos fiables y precisos según la{" "}
              <Hi>norma europea CEN/TS 17660</Hi> para alcanzar los DQO de Clase 1 y acorde a los protocolos,
              métricas y valores objetivo <Hi>EPA/600/R-20/279</Hi> para O3, <Hi>EPA/600/R-23/14</Hi> para
              NO2, CO y SO2, <Hi>EPA/600/R-20/280</Hi> para PM2,5 y <Hi>EPA/600/R-23/145</Hi> para PM10.
            </BodyP>
            <BodyP className="mt-[15px]">
              Además, los datos son trazables a estándares internacionales reconocidos (
              <Hi>Directiva (UE) 2024/2881</Hi> y <Hi>USEPA 40 CFR Parte 53</Hi>).
            </BodyP>
          </BlueBox>

          <H3Blue>Empieza hoy mismo a mejorar la calidad del aire en tu entorno.</H3Blue>

          <BodyP>
            Hazte con la solución premiada como el{" "}
            <strong className="font-bold text-[#333]">sensor multi-contaminante más preciso</strong> y
            comienza a tomar medidas efectivas para mejorar la calidad del aire.
          </BodyP>
          <BodyP>
            Con la plataforma web Kunak AIR Cloud podrás visualizar y analizar fácilmente los datos recogidos
            en las estaciones de control de calidad del aire, permitiéndote tomar{" "}
            <strong className="font-bold text-[#333]">mejores decisiones</strong>.
          </BodyP>
          <BodyP>
            Nuestra solución ha sido testada por los principales expertos en calidad del aire del mundo.
          </BodyP>

          {/* 2ª fila de logos validadores */}
          <div className="flex flex-wrap items-center gap-x-[4%] gap-y-[22px] sm:gap-x-[26px]">
            {VALIDATOR_LOGOS.map((v) => (
              <a
                key={v.title}
                href={v.href}
                target="_blank"
                rel="noopener"
                title={v.title}
                className="flex w-[48%] items-center justify-center sm:w-auto sm:justify-start"
              >
                <img
                  src={v.src}
                  alt={v.title}
                  className="h-[52px] w-auto max-w-full object-contain"
                  style={v.width ? { width: v.width } : undefined}
                />
              </a>
            ))}
          </div>

          {/* Grid de 16 chips de contaminantes */}
          <div className="clear-both pt-[10px]">
            <h3
              className="pb-[17px]"
              style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, color: "#0075C9", letterSpacing: "-0.5px" }}
            >
              La gama de contaminantes más completa
            </h3>
            <ul className="flex list-none flex-wrap gap-x-[8px] gap-y-[10px] p-0">
              {CONTAMINANT_CHIPS.map((chip) => (
                <li key={chip.label}>
                  <a
                    href={chip.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={chip.label}
                    className="inline-flex h-[50px] min-w-[50px] items-center justify-center rounded-[30px] border-2 border-[#0075C9] bg-white px-[0.5em] text-center text-[18px] font-bold leading-none text-[#0075C9] transition-colors hover:bg-[#0075C9] hover:text-white"
                  >
                    {chip.segs.map((s, i) =>
                      s.sub ? <sub key={i}>{s.t}</sub> : <span key={i}>{s.t}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Recuadro azul: borde 2px #0075C9, radius y padding parametrizables. */
function BlueBox({
  children,
  radius,
  padding,
}: {
  children: ReactNode;
  radius: number;
  padding: number;
}) {
  return (
    <div
      className="border-2 border-[#0075C9] bg-transparent"
      style={{ borderRadius: radius, padding }}
    >
      {children}
    </div>
  );
}
