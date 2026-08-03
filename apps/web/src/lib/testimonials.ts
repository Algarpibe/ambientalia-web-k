export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

/** 5 testimonial slides — verbatim from et_pb_slider_0 in HTML source. */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jérôme De Waele",
    role: "Director general - AIRSCAN",
    avatar: "/images/uploads/2024/04/jerome-airscan.jpg",
    quote:
      "Valoramos especialmente la escalabilidad y fiabilidad de la solución Kunak: gestionamos más de 100 estaciones en África, Europa y Asia. Los datos son precisos, tenemos una tasa de 0 defectos en el hardware y el rendimiento de la analítica en la nube de Kunak es excelente, incluso con grandes volúmenes de datos.",
  },
  {
    name: "Cristobal Hernández",
    role: "Profesional del control medioambiental - Cobre Panamá - FQML",
    avatar: "/images/uploads/2024/03/Cristobal-Hernandez.jpg",
    quote:
      "La red de sensores de Kunak nos permiten tener un control preciso del polvo en suspensión y los gases contaminantes en la mina y activar los mecanismos para minimizar su dispersión, mejorando así la calidad del aire y protegiendo a nuestros trabajadores y las comunidades próximas.",
  },
  {
    name: "Bachir Kerkache",
    role: "Director General - CleanAir Europe",
    avatar: "/images/uploads/2024/04/bachir-kerkache-1.jpg",
    quote:
      "Los monitores de calidad del aire Kunak convierten nuestra cartera de instrumentos medioambientales en la más completa del mercado, ya que nos proporcionan una calidad de datos casi de referencia en un sistema flexible y fácil de desplegar.",
  },
  {
    name: "Jelle Hofman",
    role: "I+D sobre la calidad del aire - VITO",
    avatar: "/images/uploads/2024/03/Jelle-Hofman.jpg",
    quote:
      "Valoro enormemente las innovadoras soluciones de Kunak, junto con sus herramientas de análisis y calibración en la nube, ya que constituyen una importante evidencia sobre la fiabilidad de los datos de los sensores de calidad del aire.",
  },
  {
    name: "Ibai Uria Gaztelu-Iturri",
    role: "Responsable de Prevención y Medio Ambiente - Puerto de Bilbao",
    avatar: "/images/uploads/2024/04/Ibai-Uria-Gaztelu-Iturri.jpg",
    quote:
      "La red de sensores de Kunak ha mejorado nuestra supervisión y evaluación del impacto de la actividad portuaria en la calidad del aire. También nos ha ayudado a identificar con más detalle el origen de las fuentes de emisión, lo que hace más eficaces las medidas de mitigación aplicadas.",
  },
];
