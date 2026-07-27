/**
 * Shared TypeScript interfaces for the Kunak homepage clone.
 * Derived from PAGE_TOPOLOGY.md and BEHAVIORS.md.
 */

export type LocaleCode = "es" | "en" | "fr" | "ar";

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavSubItem[];
}

export interface ClientLogo {
  name: string;
  src: string;
  href?: string;
  width?: number;
  height?: number;
}

export interface FeatureIcon {
  icon: string;
  label: string;
  href?: string;
}

export interface AwardCard {
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  href?: string;
}

export interface SectorSlide {
  slug: string;
  label: string;
  description: string;
  image: string;
  icon: string;
  href: string;
}

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  authorCompany?: string;
  avatar: string;
}

export interface Benefit {
  icon: string;
  label: string;
}

export interface Product {
  /** data-id of the `<span>` tab in the original `#lista-soluciones` module. */
  id: string;
  name: string;
  /** Subtitle shown under the tab label ("Monitor de calidad de aire…"). */
  tagline: string;
  description: string;
  /** "BASADA EN SENSORES | LA MAYOR PRECISIÓN" claim line. */
  highlight: string;
  bullets: string[];
  /** Product photo; empty string for Kunak API (text-only panel). */
  image: string;
  href: string;
}

/**
 * Item of the `lista-contenido` shortcode in its "accesorios" flavour
 * (`#producto-accesorios-*`): label + photo + one intro line + "Ver más".
 * The richer `Product` above is the "soluciones" flavour of the same
 * shortcode (`#lista-soluciones`, with tagline/highlight/bullets).
 */
export interface AccesorioItem {
  /** data-id of the `<span>` label (also the panel's `item-<id>`). */
  id: string;
  /** Label in the left list; repeated as the panel heading. */
  label: string;
  intro: string;
  image: string;
  href: string;
}

export interface BlogPost {
  title: string;
  date: string;
  image: string;
  href: string;
  excerpt?: string;
}

export interface CaseStudy {
  client: string;
  sector: string;
  sectorHref?: string;
  /** The descriptive case title (`.case-title`). */
  title: string;
  image: string;
  href: string;
}

export interface SustainabilityPillar {
  icon: string;
  htmlContent: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  network: "linkedin" | "x" | "instagram" | "facebook" | "youtube";
  href: string;
}

export interface CTABanner {
  heading: string;
  cta: { label: string; href: string };
  bgImage: string;
  variant?: "light" | "dark";
}
