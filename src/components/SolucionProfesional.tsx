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
      className="relative bg-white"
      style={{ paddingTop: 57, paddingBottom: 59 }}
    >
      {/* Row 1 — Main copy + 5 feature blurbs */}
      <SectionRow
        title={<SectionTitle>La solución profesional para la monitorización ambiental</SectionTitle>}
        belowTitle={
          <div className="flex flex-col items-start gap-4">
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
        <h3
          style={{
            fontWeight: 300,
            fontSize: 37,
            lineHeight: 1.25,
            color: "#0075C9",
            letterSpacing: "-0.5px",
          }}
        >
          Mide múltiples contaminantes de forma precisa con la estación de calidad del aire más versátil.
        </h3>

        <div className="mt-6 space-y-5 text-[18px] leading-[1.7] text-[#333]">
          <p>
            Con las estaciones de calidad del aire{" "}
            <a href="https://kunakair.com/es/soluciones/" className="text-[#333] underline-offset-2 hover:underline">
              Kunak AIR
            </a>{" "}
            obtienes una monitorización ambiental con{" "}
            <strong>mediciones precisas, fiables y en tiempo real</strong> de los principales contaminantes con un
            coste menor a los métodos tradicionales.
          </p>

          <div className="space-y-4 rounded-[12px] border-2 border-[#0075C9] bg-transparent p-[20px]">
            <p>
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

        <ul className="mt-10 grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex flex-col items-center gap-2 px-2 text-center">
              <img src={f.icon} alt="" aria-hidden width={50} height={50} style={{ width: 50, height: 50 }} />
              <span className="text-[15px] leading-tight text-[#333]">{f.label}</span>
            </li>
          ))}
        </ul>
      </SectionRow>

      {/* Row 2 — Solución validada */}
      <div className="mt-24">
        <SectionRow title={<SectionTitle>Solución validada</SectionTitle>}>
          <p className="text-[18px] leading-[1.7] text-[#333]">
            Nuestra solución ha sido evaluada por los principales{" "}
            <strong>expertos en calidad del aire</strong> del mundo.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 sm:grid-cols-6">
            {VALIDATORS.map((v) => (
              <a
                key={v.title}
                href={v.href}
                target="_blank"
                rel="noopener"
                title={v.title}
                className="group flex items-center justify-center transition-transform duration-300 hover:scale-[1.2]"
              >
                <img
                  src={v.src}
                  alt={v.title}
                  width={100}
                  height={100}
                  style={{ width: 100, height: 100, maxWidth: "none" }}
                  className="object-contain"
                />
              </a>
            ))}
          </div>

          <div className="mt-10 space-y-5 text-[18px] leading-[1.7] text-[#333]">
            <p>
              Proteger la salud de las personas te resultará más fácil que nunca.
              <br />
              Toma decisiones informadas que ayuden a mejorar la calidad del aire.
            </p>
            <p
              style={{
                color: "#0075C9",
                fontSize: 37,
                fontWeight: 300,
                lineHeight: 1.25,
                letterSpacing: "-0.5px",
              }}
            >
              Protege tu salud. <strong className="font-semibold">Protege el medio ambiente.</strong>
            </p>
          </div>

          <div className="mt-8">
            <BlueButton href="https://kunakair.com/es/contacto/">Quiero saber más</BlueButton>
          </div>
        </SectionRow>
      </div>

      {/* Row 3 — Reconocimientos */}
      <div className="mt-24">
        <SectionRow title={<SectionTitle>Reconocimientos</SectionTitle>}>
          <p className="text-[18px] leading-[1.7] text-[#333]">
            Confía en la solución premiada y reconocida por numerosos organismos internacionales.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {AWARDS.map((a) => (
              <a
                key={a.title}
                href={a.href}
                title={a.title}
                className="group flex items-center justify-center transition-transform duration-300 hover:scale-[1.2]"
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

          <p className="mt-8 text-[18px] leading-[1.7] text-[#333]">
            En la última edición del AIRLAB Microsensors Challenge organizado por Airparif, las estaciones de
            calidad del aire Kunak AIR fueron galardonadas como el{" "}
            <strong>SENSOR MULTI-CONTAMINANTE MÁS PRECISO</strong>.{" "}
            <a
              href="https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/"
              className="text-[#0075C9] hover:underline"
            >
              Más info
            </a>
          </p>

          <a
            href="https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/"
            className="mt-8 block"
          >
            <img
              src="/images/uploads/2023/10/banner-winner-airlab-ES.svg"
              alt="Ganador del AIRLAB Microsensors Challenge"
              width={791}
              height={158}
              style={{ width: "100%", height: "auto" }}
            />
          </a>

          <p
            className="mt-10"
            style={{
              color: "#0075C9",
              fontSize: 37,
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            Construye un futuro más sostenible apostando por la tecnología más innovadora en monitorización
            ambiental.
          </p>
        </SectionRow>
      </div>
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
    width: 100,
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
