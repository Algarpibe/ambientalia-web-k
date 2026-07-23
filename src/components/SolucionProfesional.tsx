import { SectionRow, SectionTitle, BlueButton, OutlineButton } from "./SectionRow";

/**
 * `et_pb_section_2` — "La solución profesional para la monitorización ambiental"
 * (main copy + Solución validada + Reconocimientos).
 *
 * Spec: docs/research/components/solucion-profesional.spec.md
 *
 * Layout: three 1/3 (title) + 2/3 (content) rows. Blurb icons do NOT animate
 * (`et_pb_animation_off` on every image). Validator/award logos scale to 1.2x
 * on hover (300ms).
 */
export function SolucionProfesional() {
  return (
    <section
      id="home-content"
      className="relative bg-white pb-[59px] pt-[50px] md:pt-[57px]"
    >
      {/* Row 1 — Main copy + 5 feature blurbs. Padding de fila Divi 28px;
          módulos encadenados con margin-bottom 33.67px (ver PENDIENTES A2). */}
      <SectionRow
        className="pb-[8px] pt-[30px] md:pb-[28px] md:pt-[28px]"
        title={
          <div className="pb-[20px] md:mr-[10%]">
            <SectionTitle>La solución profesional para la monitorización ambiental</SectionTitle>
          </div>
        }
        belowTitle={
          <div className="flex flex-col items-start gap-[32px] pb-[30px] md:gap-4 md:pb-0">
            <OutlineButton
              href="https://kunakair.com/doc/External/Kunak_AIR_Datasheet_ES.pdf"
            >
              Descargar ficha técnica
            </OutlineButton>
            <BlueButton href="https://kunakair.com/es/descarga-catalogo/">
              Descargar catálogo
            </BlueButton>
          </div>
        }
      >
        {/* Original: H2 37px con line-height 1em (37px), pb 10 (regla Divi h2)
            y mt 10 (primer módulo de la columna) */}
        <h2
          className="pb-[10px] md:mt-[10px]"
          style={{
            fontWeight: 300,
            fontSize: 37,
            lineHeight: "37px",
            color: "#0075C9",
            letterSpacing: "-0.5px",
          }}
        >
          Mide múltiples contaminantes de forma precisa con la estación de calidad del aire más versátil.
        </h2>

        <div className="mt-[34px] text-[18px] leading-[1.7] text-[#333]">
          <p className="pb-[18px]">
            Con las estaciones de calidad del aire{" "}
            <a href="https://kunakair.com/es/soluciones/" className="text-[#333] underline-offset-2 hover:underline">
              Kunak AIR
            </a>{" "}
            obtienes una monitorización ambiental con{" "}
            <strong>mediciones precisas, fiables y en tiempo real</strong> de los principales contaminantes con un
            coste menor a los métodos tradicionales.
          </p>

          {/* El original interpone un <p>&nbsp;</p> (30.6px) antes del recuadro */}
          <div className="mt-[30px] rounded-[12px] border-2 border-[#0075C9] bg-transparent p-[20px]">
            <p className="pb-[18px]">
              Las estaciones Kunak AIR ofrecen niveles de rendimiento cercanos a los{" "}
              <strong>estándares de referencia</strong>, proporcionando datos fiables y precisos según la norma
              europea <span className="text-[#0075C9]">CEN/TS 17660</span> para alcanzar los DQO de Clase 1 y acorde
              a los protocolos, métricas y valores objetivo{" "}
              <span className="text-[#0075C9]">EPA/600/R-20/279</span> para O<sub>3</sub>,{" "}
              <span className="text-[#0075C9]">EPA/600/R-23/14</span> para NO<sub>2</sub>, CO y SO<sub>2</sub>,{" "}
              <span className="text-[#0075C9]">EPA/600/R-20/280</span> para PM<sub>2,5</sub> y{" "}
              <span className="text-[#0075C9]">EPA/600/R-23/145</span> para PM<sub>10</sub>.
            </p>
            <p>
              Además, los datos son trazables a estándares internacionales reconocidos (
              <span className="text-[#0075C9]">Directiva (UE) 2024/2881</span> y{" "}
              <span className="text-[#0075C9]">USEPA 40 CFR Parte 53</span>).
            </p>
          </div>
        </div>

        {/* Blurbs: módulo a +37, icono con 6px arriba y 18 de aire, etiqueta
            18px/21.6 con pb 18 (p de Divi); mb 34 = margen de módulo */}
        <ul className="mt-[33px] grid grid-cols-2 gap-y-[32px] sm:grid-cols-3 md:mb-[34px] md:mt-[37px] lg:grid-cols-5 lg:gap-x-[8px] lg:gap-y-0">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex flex-col items-center px-[14px] text-center">
              <img
                src={f.icon}
                alt=""
                aria-hidden
                width={50}
                height={50}
                className="mb-[18px] mt-[6px]"
                style={{ width: 50, height: 50 }}
              />
              <span className="pb-[12px] text-[18px] leading-[21.6px] text-[#333]">{f.label}</span>
            </li>
          ))}
        </ul>
      </SectionRow>

      {/* Row 2 — Solución validada (padding inferior de fila Divi: 71px) */}
      <SectionRow
        className="pb-[20px] pt-[30px] md:pb-[71px] md:pt-[28px]"
        title={
          <div className="pb-[20px] md:mr-[10%]">
            <SectionTitle>Solución validada</SectionTitle>
          </div>
        }
      >
        <p className="text-[18px] leading-[1.7] text-[#333] md:mt-[10px]">
          Nuestra solución ha sido evaluada por los principales{" "}
          <strong>expertos en calidad del aire</strong> del mundo.
        </p>

        {/* Logos a ancho de columna (113px en desktop) + 30px de aire inferior */}
        <div className="mt-[38px] grid grid-cols-2 gap-x-[2%] gap-y-[33px] sm:grid-cols-6 sm:gap-[23px] md:mt-[42px]">
          {VALIDATORS.map((v) => (
            <a
              key={v.title}
              href={v.href}
              target="_blank"
              rel="noopener"
              title={v.title}
              className="group mb-[30px] flex items-start justify-center transition-transform duration-300 hover:scale-[1.2]"
            >
              {/* Ancho Divi por logo (EPA 120, resto 100, Airparif 100%),
                  limitado por la celda (113px en desktop) */}
              <img
                src={v.src}
                alt={v.title}
                className="h-auto max-w-full object-contain"
                style={v.width ? { width: v.width } : { width: "100%" }}
              />
            </a>
          ))}
        </div>

        <p className="mt-[43px] text-[18px] leading-[1.7] text-[#333]">
          Proteger la salud de las personas te resultará más fácil que nunca.
          <br />
          Toma decisiones informadas que ayuden a mejorar la calidad del aire.
        </p>
        {/* El original son DOS <h2> apilados (37/37, pb 10 cada uno, sin negrita) */}
        <div className="mt-[21px] md:mt-[34px]">
          <h2
            className="pb-[10px]"
            style={{ color: "#0075C9", fontSize: 37, fontWeight: 300, lineHeight: "37px", letterSpacing: "-0.5px" }}
          >
            Protege tu salud.
          </h2>
          <h2
            className="pb-[10px]"
            style={{ color: "#0075C9", fontSize: 37, fontWeight: 300, lineHeight: "37px", letterSpacing: "-0.5px" }}
          >
            Protege el medio ambiente.
          </h2>
        </div>

        <div className="mb-[30px] mt-[34px]">
          <BlueButton href="https://kunakair.com/es/contacto/">Quiero saber más</BlueButton>
        </div>
      </SectionRow>

      {/* Row 3 — Reconocimientos (título sin pb ni margen — t14 del original) */}
      <SectionRow
        className="pb-[30px] pt-[30px] md:pb-[28px] md:pt-[28px]"
        title={<SectionTitle>Reconocimientos</SectionTitle>}
      >
        <p className="text-[18px] leading-[1.7] text-[#333] md:mt-[10px]">
          Confía en la solución premiada y reconocida por numerosos organismos internacionales.
        </p>

        <div className="mt-[26px] grid grid-cols-1 gap-y-[33px] sm:grid-cols-3 sm:gap-[24px] md:mt-[36px]">
          {AWARDS.map((a) => (
            <a
              key={a.title}
              href={a.href}
              title={a.title}
              className="group mb-[30px] flex items-start justify-start pl-[23px] transition-transform duration-300 hover:scale-[1.2] sm:justify-center sm:pl-0"
            >
              <img
                src={a.src}
                alt={a.title}
                width={150}
                height={150}
                style={{ width: 150, height: "auto" }}
                className="object-contain"
              />
            </a>
          ))}
        </div>

        <p className="mt-[26px] text-[18px] leading-[1.7] text-[#333] md:mt-[43px]">
          En la última edición del AIRLAB Microsensors Challenge organizado por Airparif, las estaciones de
          calidad del aire Kunak AIR fueron galardonadas como el{" "}
          <strong className="text-[#0075C9]">SENSOR MULTI-CONTAMINANTE MÁS PRECISO</strong>.{" "}
          <a
            href="https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/"
            className="text-[#333] hover:underline"
          >
            Más info
          </a>
        </p>

        {/* El módulo original mide img + 8px de colchón inferior (167px) */}
        <a
          href="https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/"
          className="mt-[34px] block pb-[8px]"
        >
          <img
            src="/images/uploads/2023/10/banner-winner-airlab-ES.svg"
            alt="Ganador del AIRLAB Microsensors Challenge"
            width={791}
            height={158}
            className="block"
            style={{ width: "100%", height: "auto" }}
          />
        </a>

        <p
          className="mt-[34px] pb-[10px]"
          style={{
            color: "#0075C9",
            fontSize: 37,
            fontWeight: 300,
            lineHeight: "37px",
            letterSpacing: "-0.5px",
          }}
        >
          Construye un futuro más sostenible apostando por la tecnología más innovadora en monitorización
          ambiental.
        </p>
      </SectionRow>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------ */

const FEATURES = [
  { icon: "/images/uploads/2023/02/real-time.svg", label: "Datos fiables en tiempo real" },
  { icon: "/images/uploads/2023/01/Mcerts.svg", label: "Certificación MCERTS CSA MC230418/00" },
  { icon: "/images/uploads/2023/02/data-quality-1.svg", label: "Tecnología patentada" },
  { icon: "/images/uploads/2023/02/global-presence.svg", label: "Equipos en los 5 continentes" },
  { icon: "/images/uploads/2023/02/years-of-experience-1.svg", label: "+10 años de experiencia" },
];

const VALIDATORS = [
  {
    title: "US EPA",
    src: "/images/uploads/2023/01/US-EPA-united-states-environmental-protection-agency.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf",
    width: 120,
  },
  {
    title: "MCERTS",
    src: "/images/uploads/2023/01/Mcerts.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf",
    width: 100,
  },
  {
    title: "AQ-SPEC",
    src: "/images/uploads/2023/01/AQ-SPEC.svg",
    href: "https://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/kunak-air-pro---field-evaluation.pdf",
    width: 100,
  },
  {
    title: "AirParif",
    src: "/images/uploads/2023/01/airparif.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf",
    width: 0, // 100% de la celda (Divi)
  },
  {
    title: "SEDEMA CDMX",
    src: "/images/uploads/2023/05/SEDEMA_CDMX.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/SEDEMA_2b_Evaluacion_Sensores_CDMX_2022.pdf",
    width: 100,
  },
  {
    title: "Ricardo",
    src: "/images/uploads/2023/04/Ricardo_logo.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/Ricardo_Kunak_Air_Pro_Sensor_report_summary.pdf",
    width: 100,
  },
];

const AWARDS = [
  {
    title: "US EPA Wildland Fire Sensors Challenge",
    src: "/images/uploads/2023/04/wildland-fire-sensors-challenge.svg",
    href: "https://kunakair.com/es/mencion-de-honor-de-la-agencia-de-proteccion-ambiental-de-ee-uu-por-el-reto-wildland-fire-sensors-challenge/",
  },
  {
    title: "AIRLAB Challenge Awards",
    src: "/images/uploads/2023/04/AIRLAB-challenge-awards.svg",
    href: "https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/",
  },
  {
    title: "AQE Awards",
    src: "/images/uploads/2023/04/AQE-awards.svg",
    href: "https://kunakair.com/es/blog/medicion-de-la-calidad-del-aire-en-puertos-maritimos/",
  },
];
