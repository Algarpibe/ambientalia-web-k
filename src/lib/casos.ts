import type { Metadata } from "next";

import type { CasoDeExito } from "@/types/kunak";
import { getTermino } from "./taxonomia-sectores";

/**
 * CASOS DE ÉXITO — colección `casos`, el content type de D2/D3.
 *
 * Recon C-1 (censo 76/76) y decisiones C-2 en `docs/research/grupo-C/`; modelo
 * en su `MODELO.md`; la medición de entrada de C-3 en su `MEDICION.md`;
 * traslado a Payload en `docs/ESQUEMA-CMS.md` §2b y §2b.1.
 *
 * ── UNA colección para los 57, con el prefijo como CAMPO (D2 · CMS-1) ──────
 * 53 casos cuelgan de `/casos-de-exito/` y 4 de `/case-studies/`. Los 4
 * ingleses son **contenido propio en español sobre la misma plantilla en los
 * cinco ejes**: la única diferencia entre los 57 es una palabra en la URL. Por
 * eso `prefijo` es un campo con defecto `"casos-de-exito"` que **solo los 4
 * escriben**, y no dos colecciones.
 *
 * C-3 añadió evidencia que ni el propio original discute: **las migas de los 4
 * ingleses apuntan al índice ESPAÑOL** (`/es/casos-de-exito/`, C-SP8). Ni
 * WordPress los trata como colección aparte.
 *
 * ── Lo que NO está aquí porque es PLANTILLA (varianza cero en 57/57) ───────
 * El sobretítulo «Caso de éxito» · los títulos «Necesidad · Solución ·
 * Resultados» y su orden · «Detalles del proyecto» · «Soluciones» · los 6
 * rótulos de detalles · el singular/plural de `Sector(es):`, derivado del
 * número de términos · las migas · la mecánica del carrusel · el alto del
 * mapa. **No se promocionan a campo**: están en `MODELO.md` con su evidencia
 * justamente para que nadie lo rehaga.
 *
 * ── Y lo que es UN dato con DOS proyecciones ───────────────────────────────
 * `sectores` se pinta dos veces —el chip bajo el cliente y la fila
 * «Sector(es)» de detalles— y **falta en las dos a la vez** cuando el caso no
 * lo tiene: medido 53/53 de igualdad y 4/4 de ausencia conjunta. `cliente`
 * igual: es campo propio y la fila «Cliente» es su proyección. Por eso ninguno
 * de los dos aparece dentro de `detalles`.
 *
 * ── El mínimo ADVERSARIO, no el cómodo ─────────────────────────────────────
 * Los cuatro poblados rompen un eje distinto del modelo cada uno. Si el modelo
 * solo aguanta las instancias cómodas, no aguanta.
 *
 * Contenido **verbatim** de `scripts/qa/medidas/c-spec.json` —la transcripción
 * congelada del HTML servido, 2026-07-30—, generado desde ahí y no tecleado a
 * mano: una errata de copia en 300 líneas de HTML no da ningún error.
 *
 * ── ⚠ La ÚNICA desviación del verbatim: los enlaces del cuerpo ─────────────
 * La regla de rutas locales (`CLAUDE.md`) también aplica **dentro del campo
 * rico**, y `qa:enlaces` la hace cumplir ahí igual que en cualquier otro sitio
 * — lo cazó en cuanto se emitieron las rutas nuevas, que es literalmente lo que
 * predecía P-C3-5. Localizado en los tres sitios donde aparece:
 *
 *   `<a href="https://kunakair.com/es/monitor-calidad-aire/" target="_blank">`
 *      → `<a href="/monitor-calidad-aire">`   (× 3: des-moines · world-athletics · rio)
 *
 * El `target="_blank"` **se quita a propósito**: solo va cuando el destino es
 * externo, y ahora es interno. Los demás enlaces del cuerpo —envirosuite,
 * worldathletics, breathecities, c40, los cartuchos, `descarga-catalogo`— van a
 * páginas **no clonadas** y se quedan tal cual, que es lo que manda la regla.
 *
 * **Y esto es una transformación de migración, no un apaño del clon**: el campo
 * rico del corpus lleva enlaces absolutos al propio dominio, así que el import
 * tendrá que reescribirlos a relación interna. Anotado en
 * `docs/ESQUEMA-CMS.md` §3.2 como **T7**.
 */
export const CASOS_PUBLICADOS: CasoDeExito[] = [
  {
    // DOS términos de sector · galería 7 · soluciones · mapa
    slug: "control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa",
    seo: {
      title: "Control de la contaminación por malos olores en Des Moines, Iowa - Kunak",
      description: "Descubre cómo Des Moines implementó soluciones avanzadas de monitoreo de calidad del aire para controlar la contaminación por malos olores.",
      ogImage: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines.jpg",
    },
    titulo: "Red de control de la contaminación por malos olores en Des Moines, Iowa",
    cliente: "Ayuntamiento de Des Moines",
    sectores: [getTermino("olores"), getTermino("urbano")],

    necesidad: `<p>La ciudad de <a href="https://www.dsm.city/" target="_blank" rel="noopener">Des Moines</a> es la capital de Iowa y sus 17 departamentos prestan servicio a más de 214.000 residentes y 49 asociaciones de vecinos. Des Moines es líder en sostenibilidad y ofrece a sus residentes barrios vibrantes, un centro vivo y activo y abundantes oportunidades de ocio.</p>
    <p>La gente que vive y trabaja en el centro de Des Moines llevaba mucho tiempo quejándose de los malos olores, y la ciudad había tenido poco éxito a la hora de controlar el problema.<br>
    El personal municipal recibía unas 200 quejas por olores al año, y la mayoría de los olores se describían como «olor putrefacto, a carne cocinándose y a aguas residuales». La metodología empleada hasta el momento para el control de los episodios de malos olores resultaba subjetivo y poco científico.</p>
    <p>En 2022, las autoridades de Des Moines contrataron a una consultora de calidad del aire para que realizara un estudio en el que se analizasen las quejas por malos olores de la última década y se identificaran las posibles fuentes del problema. Tras el estudio, se determinó que eran tres empresas cárnicas industriales de la zona este de Des Moines las fuentes de los malos olores.</p>
    <p>El estudio también recomendaba a la ciudad soluciones como la compra de dispositivos para el seguimiento de los olores y la implantación de un umbral de olor que incitara a las empresas a tomar medidas si los olores alcanzan un determinado nivel.</p>
    <p>La ciudad de Des Moines está adoptando un enfoque basado en datos para reducir los continuos problemas de olores y establecer umbrales con la ayuda de la tecnología de detección y control de olores de Kunak de la mano de <a href="https://envirosuite.com/es/" target="_blank" rel="noopener">Envirosuite</a>.</p>
    <div style="text-align: center;"><iframe src="//www.youtube.com/embed/e1hsaYHRGD8?si=ynkxE4PWmUs_Jaw_" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></div>`,

    solucion: `<p>Tras identificar los tres principales emisores de olores, en octubre de 2023, el equipo de Inspecciones Vecinales encargó a Envirosuite, líder mundial en servicios de consultoría medioambiental, la <strong>instalación de 10 monitores de olores Kunak <a href="/monitor-calidad-aire">AIR Pro</a></strong> en varios lugares alrededor de los tres principales emisores de olores identificados por el estudio y la instalación de una estación meteorológica en la azotea del Centro Municipal de Servicios 2 (MSC 2) situado en Maury Street.</p>
    <p>Esta red de dispositivos de monitorización mide y registra de forma precisa datos basados en las sustancias químicas productoras de olores (H<sub>2</sub>S, NH<sub>3</sub>, y VOCs).</p>
    <p>Una vez calibrados, los monitores de olores empezaron inmediatamente a suministrar al panel Envirosuite de la ciudad datos en tiempo real que miden los niveles de los compuestos químicos. Los datos meteorológicos se recogen en el centro de cada monitor y se comunican a la estación meteorológica.</p>
    <p>Estos datos también se comunican a la plataforma Envirosuite y permiten modelizar las plumas de olor.</p>
    <p>Desde el panel de control, los usuarios pueden ver por dónde se desplaza el olor y detectar la fuente más probable de emisión.</p>`,

    resultados: `<p>Los monitores de olores miden los niveles de compuestos químicos en el aire, como amoníaco, <a href="https://kunakair.com/es/cartuchos-inteligentes/sulfuro-de-hidrogeno/" target="_blank">sulfuro de hidrógeno</a> y <a href="https://kunakair.com/es/cartuchos-inteligentes/compuestos-organicos-volatiles/" target="_blank">compuestos orgánicos volátiles</a>. La información recopilada por los monitores se envía a una base de datos, donde se combina con los datos meteorológicos y de quejas por olores de la ciudad, proporcionando <strong>información más precisa sobre aspectos como de dónde proceden los olores y hacia dónde se dirigen</strong>.</p>
    <p>Se trata de un método más proactivo y basado en datos que un escentómetro (olfatómetro de campo), un aparato que mide los olores en función del número de veces que habría que diluir el aire para que oliera como si no hubiera olor.</p>
    <p>Los dispositivos de control de olores, que funcionan mediante panel solar, proporcionan datos en tiempo real sobre los olores procedentes de los emisores de olores y se conectan a la plataforma Envirosuite a través de una conexión celular 5G.</p>
    <p>Según Dalton Jacobus, administrador de inspecciones de barrio de Des Moines, los datos obtenidos con la tecnología en los próximos seis meses se utilizarán para orientar futuras <strong>políticas en materia de olores y fijar umbrales para las emisiones de olor</strong> de las instalaciones industriales, así como lograr un cumplimiento voluntario de la normativa vigente por aquellas empresas causantes de los episodios de malos olores.</p>`,

    destacado: `El nuevo sistema de control de olores de la ciudad utiliza múltiples puntos de datos en tiempo real para medir los niveles de compuestos químicos en el aire.`,

    galeria: [
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-1-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-2-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-8-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-5-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-3-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-6-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
      { src: "/images/uploads/2024/09/control-de-la-contaminacion-por-malos-olores-des-moines-4-600x600.jpg", alt: "Red de control de la contaminación por malos olores en Des Moines, Iowa", width: 600, height: 600 },
    ],

    detalles: {
      usuario: "Ayuntamiento de Des Moines",
      ubicacion: "Des Moines, Iowa (EE. UU.)",
      anyo: "2024",
      parametros: `<ul>
      <li>Sulfuro de hidrógeno</li>
      <li>Amoniaco</li>
      <li>Compuestos orgánicos volátiles</li>
      <li>Velocidad y dirección del viento</li>
      </ul>`,
    },
    ubicacionMapa: { lat: 41.5868417, lng: -93.6249522 },
    soluciones: ["monitor-calidad-aire", "software-de-medicion-calidad-del-aire", "sulfuro-de-hidrogeno", "amoniaco", "compuestos-organicos-volatiles"],
  },
  {
    // SIN término de sector — los chips y la fila faltan JUNTOS · SIN galería
    slug: "red-calidad-de-aire-para-world-athletics",
    seo: {
      title: "Red global de calidad de aire en pistas de atletismo de World Athletics - Kunak",
      description: "Caso de éxito sobre la instalación de redes de calidad del aire en pistas de atletismo para World Athletics (Asociación Internacional de Federaciones de Atletismo).",
      ogImage: "/images/uploads/2019/05/sports.jpg",
    },
    titulo: "Red global de calidad de aire en pistas de atletismo de World Athletics",
    cliente: "World Athletics",

    necesidad: `<p><a href="https://worldathletics.org/" target="_blank" rel="noopener">World Athletics</a> tiene como objetivo trabajar y abogar por un aire limpio al proporcionar información en tiempo real sobre la calidad del aire y el rendimiento de los atletas. Además, busca influir en las políticas medioambientales, encontrar soluciones de calidad del aire y realizar campañas de sensibilización.</p>
    <p>World Athletics, en colaboración con el Programa de las Naciones Unidas para el Medio Ambiente, tiene como objetivo abordar el problema de la contaminación del aire que contribuye a 7 millones de muertes al año en todo el mundo. Al crear una red de monitoreo de la calidad del aire en 1.000 pistas de atletismo en todo el mundo, brinda una oportunidad de primera para proporcionar evidencias que mejoren la salud de los ciudadanos y futuros atletas.</p>
    <p><a href="https://worldathletics.org/athletics-better-world/air-quality" target="_blank" rel="noopener">https://worldathletics.org/athletics-better-world/air-quality</a></p>
    <p><iframe src="//player.vimeo.com/video/722223811?title=0&amp;byline=0&amp;portrait=0&amp;color=8dc7dc" width="425" height="auto" allowfullscreen="allowfullscreen"></iframe></p>`,

    solucion: `<p style="text-align: justify;">Suministro e instalación a demanda de estaciones Kunak <a href="/monitor-calidad-aire">AIR Pro</a> para la monitorización de gases contaminantes y partículas.</p>
    <p style="text-align: justify;">Acciones realizadas:</p>
    <ul style="text-align: justify;">
    <li>Despliegue de una red de sensores con comunicaciones inalámbricas embebidas.</li>
    <li>Desarrollo de aplicación móvil.</li>
    <li>Informe mensual de los datos obtenidos.</li>
    </ul>
    <p>&nbsp;</p>
    <p style="text-align: left;"><iframe src="//www.youtube.com/embed/0AmzdyB5Jl4" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>`,

    resultados: `<p style="text-align: justify;">Desarrollo de una solución de monitorización ambiental calibrada con las siguientes funcionalidades:</p>
    <ul>
    <li style="text-align: justify;">Sistema de alarmas, alertas y estadísticas en tiempo real.</li>
    <li style="text-align: justify;">Detección de episodios de aumento de la contaminación.</li>
    <li style="text-align: justify;">Gestión y calibración remota de los equipos.</li>
    <li style="text-align: justify;">Desarrollo de protocolos estadísticos avanzados para la obtención de datos de alta calidad y fiabilidad que aportan altas&nbsp;correlaciones con estaciones oficiales y equipos de referencia.</li>
    </ul>
    <p>&nbsp;</p>
    <p style="text-align: left;"><iframe src="https://kunakcloud.com/widgets/wa/widget.html" width="800" height="400"></iframe></p>`,

    destacado: `El proyecto Calidad del Aire de World Athletics forma parte de una amplia campaña de concienciación sobre la contaminación atmosférica en todo el mundo y el impacto que tiene en los atletas de élite y los corredores recreativos.`,

    detalles: {
      usuario: "World Athletics",
      ubicacion: "Mundial (Mónaco, México, Japón, Etiopía, Australia)",
      anyo: "2018",
      parametros: `<ul>
      <li>CO, NO<sub>2</sub>, NO and O<sub>3</sub>.</li>
      <li>PM<sub>1</sub>, PM<sub>2.5</sub>, PM<sub>4</sub> and PM<sub>10.</sub></li>
      <li>Temperature, humidity, pressure and dew point.</li>
      </ul>`,
    },
    ubicacionMapa: { lat: 43.7275817, lng: 7.4156038 },
    soluciones: ["monitor-calidad-aire", "software-de-medicion-calidad-del-aire", "sensor-de-calidad-del-aire"],
  },
  {
    // prefijo INGLÉS · SIN mapa (el único de 57) · galería 15 · destacado CON marcado · tabla
    slug: "distrito-baja-emision-rio-de-janeiro",
    prefijo: "case-studies",
    seo: {
      title: "El primer distrito de bajas emisiones (DBE) en Río de Janeiro (Brasil) para mejorar la calidad del aire y la salud urbana - Kunak",
      description: "Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.",
      ogImage: "/images/uploads/2025/12/Brazil-first-Low-Emission-District-LED-Rio-de-Janeiro.jpg",
    },
    titulo: "El primer distrito de bajas emisiones (DBE) en Río de Janeiro (Brasil) para mejorar la calidad del aire y la salud urbana",
    cliente: "Secretaria Municipal do Ambiente e Clima (SMAC)",
    sectores: [getTermino("urbano")],

    necesidad: `<p>Río de Janeiro avanza hacia una nueva etapa de liderazgo climático con la creación del <b>primer Distrito de Baja Emisión (DBE) de Brasil</b>, una iniciativa destinada a reducir la contaminación atmosférica y transformar el centro de la ciudad en un entorno más saludable, seguro y sostenible.</p>
    <p>El proyecto conectará las zonas norte y sur, y contempla la ampliación de áreas verdes, la creación de ciclovías, la priorización de la movilidad peatonal y un impulso decidido al uso de vehículos eléctricos. Su implementación se desarrollará por fases hasta 2030 y abarcará <b>2,3 km²</b> del corazón histórico de Río.</p>
    <p>El <b>Festival Respira Rio</b>, celebrado el 1 de noviembre de 2025 en la Avenida República do Chile, permitió a los ciudadanos experimentar por primera vez cómo será este nuevo modelo urbano. La avenida, transformada con <b>árboles, arte urbano, zonas verdes y espacios de participación ciudadana</b>, se convirtió en una <b>versión a escala del futuro Distrito de Baja Emisión (DBE)</b>, el primero del país.</p>
    <p>El evento, organizado por <a href="https://breathecities.org/"><b>Breathe Cities</b></a> y la <b>Prefeitura de Río</b>, tuvo lugar en la víspera de la <b>Cumbre mundial de alcaldes de C40</b> y del <a href="https://www.bloomberg.org/cop30-local-leaders-forum/"><b>Foro de Líderes Locales de la COP30</b></a>, lo que consolidó a Río como un ejemplo internacional de cómo las ciudades pueden liderar soluciones climáticas desde lo local.</p>
    <p>Río forma parte activa de <a href="https://www.c40.org/"><b>C40 Cities</b></a>, una red global de urbes comprometidas con la <b>reducción de emisiones y la resiliencia climática</b>. Ciudades como Londres, París, Barcelona, Johannesburgo, Melbourne, Tokio o Lagos comparten con Río una visión común basada en <b>políticas urbanas fundamentadas en datos, innovación tecnológica y colaboración institucional</b>. La red desempeña un papel clave en la aceleración de iniciativas como el DBE, impulsando la transición hacia <b>entornos urbanos más sostenibles, inclusivos y saludables</b>.</p>
    <p>El principal desafío de Río es <b>combatir la contaminación del aire mediante datos precisos y accesibles</b>. Para lograrlo se requiere una <b>red de monitorización continua</b> que permita identificar zonas críticas, evaluar políticas públicas y proteger a las comunidades más expuestas.</p>
    <p>La ciudad también avanza en la <b>electrificación del transporte público</b>, con la llegada de los primeros autobuses eléctricos en 2026. La integración de estas políticas de movilidad con una red sólida de monitorización convierte al DBE en un <b>proyecto estratégico para la salud urbana</b>.</p>
    <p>Dentro de este marco, surgió la necesidad de desplegar una <b>infraestructura de sensores ambientales robusta</b>, trazable a estándares internacionales y capaz de operar en entornos urbanos complejos.</p>`,

    solucion: `<p>La estrategia de Río parte de un principio básico. <b>Sin datos no hay acción climática efectiva</b>. Para ello se desplegó una red de <b>10 estaciones de calidad del aire Kunak <a href="/monitor-calidad-aire">AIR Pro</a></b>, suministradas, instaladas y mantenidas por <a href="https://www.acoem.com/brasil/pt-br/"><b>Acoem Brasil</b></a>.</p>
    <ul>
    <li><b>9 estaciones permanentes</b> adquiridas por Secretaria Municipal do Ambiente e Clima (SMAC) como parte del proyecto principal del distrito de baja emisión.</li>
    <li><b>1 estación adicional temporal</b> instalada en la <b>Avenida República do Chile</b> durante dos semanas para el Festival Respira Rio.</li>
    </ul>
    <p>Las estaciones Kunak AIR Pro destacan por su precisión <i>near-reference</i>, su capacidad para calibración remota, su conectividad continua y la fiabilidad necesaria para proyectos de salud pública. Su despliegue permite ampliar la <b>cobertura y mejorar la resolución espacial de los datos</b>, algo esencial para zonas densamente pobladas y con patrones de contaminación cambiantes.</p>
    <p>Estas estaciones equipadas con sensores de alta precisión ofrecerán <b>datos trazables y comparables con estándares internacionales</b>, posibilitando una <b>evaluación continua</b> de la eficacia de las políticas públicas y una respuesta más rápida ante episodios de contaminación.</p>
    <p>El proyecto se enmarca en la iniciativa <b>Breathe Cities</b>, cuyo objetivo es reducir la contaminación y las emisiones en un <b>30% para 2030</b> respecto a los niveles de 2019. Según las estimaciones de la iniciativa, estas medidas podrían:</p>
    <ul>
    <li>Evitar <b>55.000 muertes prematuras</b></li>
    <li>Reducir <b>111.000 casos nuevos de asma infantil</b></li>
    <li>Evitar <b>394 megatoneladas de CO₂ equivalente</b></li>
    <li>Ahorrar <b>147.000 millones de dólares</b> en costes sanitarios</li>
    </ul>
    <p>Las diez estaciones fueron instaladas en puntos estratégicos de la ciudad para proporcionar una lectura representativa y diversa del entorno urbano.</p>
    <table style="width: 100%; border-collapse: collapse;">
    <thead>
    <tr>
    <th>Nº</th>
    <th>Ubicación</th>
    <th>Tipo de lugar</th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td>1</td>
    <td>Campinho. CF Mario P. Silva</td>
    <td>Centro médico público</td>
    </tr>
    <tr>
    <td>2</td>
    <td>Cascadura. CMS Mário Olinto de Oliveira</td>
    <td>Centro médico público</td>
    </tr>
    <tr>
    <td>3</td>
    <td>Centro. EM C. Salles</td>
    <td>Escuela pública</td>
    </tr>
    <tr>
    <td>4</td>
    <td>Centro. Museu de Arte Moderna</td>
    <td>Museo de arte moderno</td>
    </tr>
    <tr>
    <td>5</td>
    <td>Centro. Praça XV</td>
    <td>Plaza pública</td>
    </tr>
    <tr>
    <td>6</td>
    <td>Centro. Av. Chile. Festival Respira Rio</td>
    <td>Evento DBE. unidad temporal</td>
    </tr>
    <tr>
    <td>7</td>
    <td>Engenheiro Leal. EM Cinco de Julho</td>
    <td>Escuela pública</td>
    </tr>
    <tr>
    <td>8</td>
    <td>Madureira. CMS Alberto B.</td>
    <td>Centro médico público</td>
    </tr>
    <tr>
    <td>9</td>
    <td>Madureira. Parque Madureira</td>
    <td>Parque público</td>
    </tr>
    <tr>
    <td>10</td>
    <td>Presidente Vargas. EM Rivadávia Corrêa</td>
    <td>Escuela pública</td>
    </tr>
    </tbody>
    </table>
    <p>Esta red permitirá evaluar la evolución del aire en el centro de Río, identificar mejoras, detectar episodios críticos y orientar las medidas de movilidad y espacio público en el DBE.</p>`,

    resultados: `<p>La creación del distrito de baja emisión (DBE) marca un antes y un después en la planificación urbana de Brasil. El despliegue de las estaciones Kunak AIR Pro ha permitido a la ciudad:</p>
    <ul>
    <li><b>Reducir emisiones contaminantes</b> en el centro de la ciudad.</li>
    <li><b>Tomar decisiones urbanas</b> con base en indicadores fiables.</li>
    <li><b>Aumentar la conciencia ciudadana</b> sobre la contaminación y sus efectos en la salud.</li>
    <li><b>Promover políticas sostenibles</b> con impacto positivo en la movilidad, el bienestar y la resiliencia urbana.</li>
    <li>Planificar un <b>centro urbano más seguro, saludable y atractivo</b>.</li>
    </ul>
    <p>Este proyecto convierte a Río en un <b>laboratorio de innovación climática urbana</b> dentro de la red global C40 Cities. Las ciudades de esta red representan algunos de los centros urbanos más influyentes del mundo. Esto incluye Ámsterdam, Londres, París, Tokio, Sídney, Johannesburgo, Lagos y Seúl. La incorporación de Río refuerza su papel como ciudad global comprometida con <b>un futuro de cero emisiones</b>.</p>
    <p>Durante el <b>Festival Respira Rio</b> se organizaron actividades educativas, talleres y consultas públicas para sensibilizar a la ciudadanía sobre la calidad del aire y recoger opiniones sobre el futuro <b>Distrito de Baja Emisión (DBE)</b>. Este ejercicio de participación refuerza el vínculo entre tecnología, comunidad y políticas públicas.</p>
    <p><b>Leonora Bedoya, gerente comercial y de negocios de Acoem Brasil:</b></p>
    <blockquote><p>“El mayor legado de este proyecto es la mejora de la salud pública y la creación de un entorno urbano más sostenible y resiliente. El monitoreo preciso de la calidad del aire es un pilar esencial para una gestión climática proactiva. Nos enorgullece apoyar a Río en su camino hacia un futuro más limpio y saludable.”</p></blockquote>
    <p>Gracias a esta cooperación, el futuro <b>DBE de Río</b> se convertirá en un <b>laboratorio urbano de innovación climática</b>, donde los datos ambientales en tiempo real permitirán:</p>
    <ul>
    <li><b>Reducir emisiones contaminantes</b> en el centro de la ciudad.</li>
    <li><b>Optimizar decisiones urbanas</b> con base en indicadores fiables.</li>
    <li><b>Aumentar la conciencia ciudadana</b> sobre la contaminación y sus efectos en la salud.</li>
    <li><b>Promover políticas sostenibles</b> con impacto positivo en la movilidad, el bienestar y la resiliencia urbana.</li>
    </ul>
    <p>El <b>Distrito de Baja Emisión de Río de Janeiro</b> representa un modelo pionero de transformación urbana impulsado por datos, ciencia y participación ciudadana.<br>
    A través del <b>Festival Respira Rio</b>, la ciudad ha demostrado que la combinación de <b>tecnología de monitorización ambiental, políticas sostenibles y compromiso comunitario</b> puede traducirse en acciones concretas para mejorar la calidad del aire y la salud pública.</p>
    <p>Este proyecto refuerza el liderazgo de <b>Acoem Brasil</b> en el desarrollo de <b>soluciones tecnológicas para la gestión ambiental urbana</b>, y consolida a Río de Janeiro como <b>referente latinoamericano en innovación climática</b>.</p>
    <p>El camino iniciado en la Avenida Chile sienta las bases de una <b>nueva generación de ciudades más sostenibles, seguras y saludables</b>, donde <b>respirar aire limpio deje de ser un privilegio y se convierta en un derecho universal</b>.</p>
    <p>Río abre así la puerta para que otras urbes de la región impulsen sus propias zonas de bajas emisiones, integrando la <b>monitorización avanzada de la calidad del aire</b> como herramienta clave para la acción climática y la mejora de la calidad de vida.</p>`,

    destacado: `<strong>Eduardo Paes, alcalde de Río de Janeiro:</strong><br>
    “Con esta iniciativa, Río demuestra liderazgo en la lucha contra la contaminación del aire. Estamos creando el primer distrito de baja emisión del país y ampliando el monitoreo de la calidad del aire, lo cual mejorará la salud y la calidad de vida de todos los cariocas.”`,

    galeria: [
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-1-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-2-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-3-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-4-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-5-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-6-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-7-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-9-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-10-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-8-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-11-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-13-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-14-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-12-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
      { src: "/images/uploads/2025/12/distrito-de-bajas-emisiones-DBE-de-Rio-de-Janeiro-Brasil-600x600.jpg", alt: "Distrito de bajas emisiones en Rio de Janeiro - Río de Janeiro crea el primer distrito de baja emisión de Brasil con monitoreo avanzado del aire para mejorar la salud y la sostenibilidad urbana.", width: 600, height: 600 },
    ],

    detalles: {
      usuario: "Prefeitura de Río de Janeiro",
      ubicacion: "Río de Janeiro, Brasil",
      anyo: "2025",
      parametros: `<p>La red de estaciones desplegadas proporcionan datos hiperlocales y en tiempo real sobre:</p>
      <ul>
      <li><b>Material particulado</b>: PM<sub>10</sub> y PM<sub>2,5</sub>, PTS (partículas totales suspendidas) y RTP (recuento total de partículas).</li>
      <li><b>Condiciones meteorológicas</b>: velocidad del viento y dirección del viento, temperatura, humedad, presión y punto de rocío.</li>
      </ul>`,
    },
    soluciones: ["monitor-calidad-aire", "particulas-en-suspension", "software-de-medicion-calidad-del-aire"],
  },
  {
    // SIN soluciones · SIN parámetros (el único de 57) · SIN galería · SIN destacado
    slug: "sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano",
    seo: {
      title: "Sistema de detección de emisiones de lindano | Kunak",
      description: "Sistema de alerta temprana para la deteccion de episodios de emisiones de aguas contaminadas al río en una zona rural sin cobertura.",
      ogImage: "/images/uploads/2018/06/IMG-20160729-WA0013-sice.jpg",
    },
    titulo: "Alerta de contaminación de acuífero por lindano",
    cliente: "SICE",
    sectores: [getTermino("industria")],

    necesidad: `<p>La Confederación Hidrográfica del Ebro, necesitaba detectar episodios de contaminación de un río por vertidos de lindano en una zona de montaña.</p>
    <p>La Confederación Hidrográfica del Ebro, en colaboración con la empresa integradora de sistemas para las infraestructuras públicas,&nbsp;<span class="il">SICE,</span>&nbsp;necesitaba un sistema de alerta temprana para detectar los vertidos procedentes de unas minas que estaban contaminando de lindano un río en una zona rural, por ser un agente dañino para la salud humana y el medio ambiente.</p>`,

    solucion: `<p>Desarrollo de un sistema autónomo de bajo consumo en una zona rural sin cobertura para detectar emisiones de aguas contaminadas al río. El proyecto consistió en el desarrollo de dispositivos hardware para la detección de presencia de aguas contaminadas con envío de datos inalámbrico hasta la Cloud y la integración de los datos en el SCADA de la Confederación Hodrográfica del Ebro.</p>
    <ul>
    <li>Estudio de cobertura para la transmisión vía GPRS.</li>
    <li>Equipos remotos K-111 GPRS, 4 I/O, con protección para exteriores&nbsp;(IP67).</li>
    <li>Sondas de presencia de líquidos.</li>
    <li>Parametrización del Software para integración en SCADA vía API Rest.</li>
    </ul>`,

    resultados: `<ul>
    <li>Detección de vertidos contaminantes.</li>
    <li>Sistema de alarmas, alertas y estadísticas en tiempo real.</li>
    <li>Cuantificación de aguas contaminadas que se emiten al río.</li>
    <li>Telecontrol de un parámetro crítico desde el SCADA.</li>
    </ul>`,

    detalles: {
      usuario: "Confederación Hidrográfica del Ebro",
      ubicacion: "Sabiñánigo, España",
      anyo: "2017",
    },
    ubicacionMapa: { lat: 42.51935940000001, lng: -0.3638114000000314 },
  },
];

/** El prefijo efectivo. El defecto vive AQUÍ, no repetido en cada dato. */
export const PREFIJO_POR_DEFECTO = "casos-de-exito";
export const prefijoDe = (c: CasoDeExito) => c.prefijo ?? PREFIJO_POR_DEFECTO;

/** La ruta canónica del caso en el clon. Un caso = UNA ruta (D2). */
export const rutaDe = (c: CasoDeExito) => `/${prefijoDe(c)}/${c.slug}`;

/**
 * Busca por prefijo + slug: **las dos partes**, no solo el slug.
 *
 * El original responde a las rutas cruzadas con 301 (7 de 9) o 404 (2 de 9),
 * pero eso es **comportamiento de servicio y no dato del contenido**, así que
 * el clon **no las emite** (C-SP2, cerrada como no-bloqueante en D2). Servir el
 * mismo caso bajo los dos prefijos sería inventar enrutado, no clonarlo.
 */
export function getCaso(prefijo: string, slug: string): CasoDeExito | undefined {
  return CASOS_PUBLICADOS.find((c) => prefijoDe(c) === prefijo && c.slug === slug);
}

/**
 * La `metadata` de un caso. Vive aquí y no en el `page.tsx` porque las **dos**
 * rutas la comparten — y porque un `page.tsx` de App Router solo puede exportar
 * lo que Next reconoce.
 *
 * El **`canonical` se DERIVA** de prefijo + slug y no se guarda: coincide con
 * su propia URL en los 57 (comprobado en los 9 de `c-rutas.json`). Apunta al
 * ORIGINAL a propósito, como en el resto del clon — `qa:enlaces` audita solo
 * anclas justamente por esto.
 *
 * `description` es OPCIONAL (53/57, corrección §0 de `DECISIONES.md`): cuando
 * falta se omite en vez de inventarla.
 */
export function metadataDeCaso(caso: CasoDeExito): Metadata {
  const { seo } = caso;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `https://kunakair.com/es${rutaDe(caso)}/` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}
