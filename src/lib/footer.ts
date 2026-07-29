import type { FooterColumn, SocialLink } from "@/types/kunak";

/**
 * Footer data — verbatim from the KunakAir Theme Builder footer template.
 * Extracted 2026-07-22. Spec: docs/research/components/footer.spec.md
 */

const BASE = "https://kunakair.com";

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "PRODUCTOS",
    // Las páginas ya clonadas van a RUTA LOCAL (sin barra final: `trailingSlash`
    // no está activado); el resto sigue apuntando al original hasta que se clone.
    links: [
      { label: "Kunak AIR Pro", href: "/monitor-calidad-aire" },
      { label: "Kunak AIR Lite", href: `${BASE}/es/estacion-de-monitoreo-de-calidad-del-aire/` },
      { label: "Kunak AIR Cloud", href: "/software-de-medicion-calidad-del-aire" },
      { label: "Kunak API", href: "/kunak-api" },
      { label: "Cartuchos inteligentes", href: `${BASE}/es/sensor-de-calidad-del-aire/` },
      { label: "Accesorios", href: "/accesorios" },
    ],
  },
  {
    title: "SECTORES",
    links: [
      // Mismo criterio que `SECTORS` en nav.ts: clonado → ruta local, no
      // clonado → original. Los hrefs originales quedan anotados al lado.
      // original: ${BASE}/es/sectores/calidad-del-aire-en-las-ciudades/
      { label: "Urbano", href: "/sectores/calidad-del-aire-en-las-ciudades" },
      // original: ${BASE}/es/sectores/control-de-emisiones-industriales/
      { label: "Industria y olores", href: "/sectores/control-de-emisiones-industriales" },
      { label: "EDAR", href: `${BASE}/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/` },
      { label: "Petróleo y gas", href: `${BASE}/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/` },
      { label: "Puertos y aeropuertos", href: `${BASE}/es/sectores/contaminacion-del-transporte-maritimo/` },
      // original: ${BASE}/es/sectores/contaminacion-por-construccion/
      { label: "Construcción", href: "/sectores/contaminacion-por-construccion" },
      { label: "Minería", href: `${BASE}/es/sectores/contaminacion-del-aire-por-la-mineria/` },
      // original: ${BASE}/es/sectores/estudio-de-la-contaminacion-atmosferica/
      { label: "Investigación y consultoría", href: "/sectores/estudio-de-la-contaminacion-atmosferica" },
    ],
  },
  {
    title: "EMPRESA",
    links: [
      { label: "Sobre Kunak", href: `${BASE}/es/empresa/` },
      { label: "Premios y reconocimientos", href: `${BASE}/es/empresa/premios-y-reconocimientos/` },
      { label: "Contacto", href: `${BASE}/es/contacto/` },
      { label: "Política de seguridad", href: `${BASE}/es/politica-de-seguridad-de-la-informacion/` },
      { label: "Sistema interno de información", href: `${BASE}/es/sistema-interno-de-informacion/` },
    ],
  },
  {
    title: "RECURSOS",
    links: [
      { label: "Artículos y guías", href: `${BASE}/es/recursos/guias/` },
      { label: "Casos de éxito", href: `${BASE}/es/casos-de-exito/` },
      { label: "Blog", href: `${BASE}/es/blog/` },
      { label: "Documentos científicos", href: `${BASE}/es/recursos/documentos-cientificos/` },
      { label: "Kunakpedia", href: `${BASE}/es/recursos/kunakpedia/` },
      { label: "Preguntas frecuentes", href: `${BASE}/es/recursos/preguntas-frecuentes/` },
      { label: "Centro de ayuda", href: `${BASE}/es/soporte/centro-de-ayuda/` },
      { label: "Servicio de reparación (RMA)", href: `${BASE}/es/soporte/servicio-de-reparacion/` },
      {
        label: "Soporte técnico",
        href: "https://kunaksensing.atlassian.net/servicedesk/customer/portal/1/group/6/create/50",
      },
    ],
  },
];

export const SUBSCRIBE_HREF = `${BASE}/es/suscribete/`;

export const ENS_CERT = {
  image: "/images/uploads/2026/07/certificacion-ens.png",
  href: `${BASE}/doc/11.Certificates/Certificado_ENS_-_Kunak_Technologies.pdf`,
};

export const LEGAL_LINKS: { label: string; href?: string }[] = [
  { label: "Aviso legal", href: `${BASE}/es/aviso-legal/` },
  { label: "Política de privacidad", href: `${BASE}/es/politica-de-privacidad-y-de-proteccion-de-datos/` },
  { label: "Política de cookies", href: `${BASE}/es/politica-de-cookies/` },
  { label: "Editar preferencias de cookies" }, // GDPR plugin button — no href
];

export const DESIGNER = { label: "Digital Design", href: "https://digitaldesign.es/" };

export const SOCIALS: SocialLink[] = [
  { network: "linkedin", href: "https://www.linkedin.com/company/kunak/" },
  { network: "x", href: "https://twitter.com/KunaK_sensing" },
  { network: "instagram", href: "https://www.instagram.com/kunak_technologies/" },
  { network: "facebook", href: "https://www.facebook.com/KunakTechnologies/" },
  { network: "youtube", href: "https://www.youtube.com/channel/UC-suigTybwCW50od_rhTZxg" },
];
