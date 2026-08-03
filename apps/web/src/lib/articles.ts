import type { BlogPost } from "@/types/kunak";

/**
 * "Últimos artículos" — 3 latest posts, verbatim from the home blog module
 * (`et_pb_blog_0_tb_body`). Extracted 2026-07-22.
 * Spec: docs/research/components/ultimos-articulos.spec.md
 */
export const ARTICLES: BlogPost[] = [
  {
    title:
      "Monitorización de emisiones fugitivas: detección y control de fugas industriales",
    date: "Jul 21, 2026",
    image:
      "/images/uploads/2026/07/Deteccion-temprana-emisiones-fugitivas_Kunak-1024x683.jpg",
    href: "https://kunakair.com/es/monitorizacion-de-emisiones-fugitivas/",
  },
  {
    title:
      "Monitorización perimetral en instalaciones industriales: control continuo y detección de emisiones",
    date: "Jun 25, 2026",
    image: "/images/uploads/2026/06/monitorizacion-perimetral_Kunak-1024x683.jpg",
    href: "https://kunakair.com/es/monitorizacion-perimetral/",
  },
  {
    title:
      "Monitorización near-reference: precisión avanzada en la medición de la calidad del aire",
    date: "Jun 18, 2026",
    image: "/images/uploads/2025/07/aaqms-1024x683.jpg",
    href: "https://kunakair.com/es/monitorizacion-near-reference/",
  },
];
