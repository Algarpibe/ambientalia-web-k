import type { SVGProps } from "react";

/**
 * Kunak icon set — extracted from https://kunakair.com/es/ on 2026-07-22.
 *
 * These are the inline SVGs that live in the DOM. Uploaded raster/SVG assets
 * (sector illustrations, product photos, client logos, awards, etc.) are
 * downloaded to `public/images/` by `scripts/download-assets.mjs` and are
 * referenced by URL rather than inlined here.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Play button used in the hero "Descubre cómo funciona" CTA. */
export function PlayIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        d="M49.9,2.5C23.6,2.8,2.1,24.4,2.5,50.4C2.9,76.5,24.7,98,50.3,97.5c26.4-0.6,47.4-21.8,47.2-47.7 C97.3,23.7,75.7,2.3,49.9,2.5"
      />
      <path
        fill="currentColor"
        d="M38,69c-1,0.5-1.8,0-1.8-1.1V32.1c0-1.1,0.8-1.6,1.8-1.1l34,18c1,0.5,1,1.4,0,1.9L38,69z"
      />
    </svg>
  );
}

/** Heart used in the footer credits ("Página web diseñada con ♥"). */
export function HeartIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 14"
      width="16"
      height="14"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M8,1.7l0.4-0.4c1-1,2.5-1.5,3.9-1.2C14.4,0.4,16,2.2,16,4.4c0,1.4-0.6,2.7-1.6,3.7l-6,5.5c-0.2,0.2-0.5,0.2-0.7,0l-6-5.5C0.6,7.1,0,5.8,0,4.4c0-2.2,1.6-4,3.7-4.3C5.1,0,6.6,0.5,7.6,1.5L8,1.7z"
      />
    </svg>
  );
}

/** Arrow used in every "→" CTA. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/** Caret used in the nav dropdown triggers. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Chevron left, used in testimonial slider. */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/** Chevron right, used in testimonial slider. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/** Chevron up, used in the scroll-to-top button. */
export function ChevronUpIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/** Plus icon used in the products accordion (collapsed state). */
export function PlusIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

/** Minus icon used in the products accordion (expanded state). */
export function MinusIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

/** Globe icon used in the language switcher. */
export function GlobeIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** Download icon used in "Catálogo" / "Descargar catálogo" CTAs. */
export function DownloadIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      {...props}
    >
      <circle cx="50" cy="50" r="47.5" />
      <path d="M50 25 v40" strokeLinecap="round" />
      <polyline points="35 52 50 67 65 52" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="30" y1="75" x2="70" y2="75" strokeLinecap="round" />
    </svg>
  );
}

/** LinkedIn icon (footer socials). */
export function LinkedInIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a2.7 2.7 0 0 0-.09.79V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
    </svg>
  );
}

/** X / Twitter icon (footer socials). */
export function XIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2H21l-6.522 7.455L22 22h-6.828l-4.77-6.243L4.8 22H2l7.006-8.008L2 2h6.914l4.24 5.6zm-2.4 18h1.855L7.16 4H5.16z" />
    </svg>
  );
}

/** Instagram icon (footer socials). */
export function InstagramIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  );
}

/** Facebook icon (footer socials). */
export function FacebookIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-7H8v-2.88h2.44v-2.2c0-2.42 1.44-3.75 3.64-3.75a15 15 0 0 1 2.16.19v2.36h-1.21c-1.19 0-1.57.74-1.57 1.5v1.9h2.66l-.43 2.88h-2.23v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

/** YouTube icon (footer socials). */
export function YouTubeIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M23 12s0-3.7-.47-5.47a2.83 2.83 0 0 0-2-2C18.75 4 12 4 12 4s-6.75 0-8.53.5a2.83 2.83 0 0 0-2 2A29.57 29.57 0 0 0 1 12a29.57 29.57 0 0 0 .47 5.47 2.83 2.83 0 0 0 2 2C5.25 20 12 20 12 20s6.75 0 8.53-.5a2.83 2.83 0 0 0 2-2C23 15.7 23 12 23 12zM9.75 15.5v-7L15.75 12z" />
    </svg>
  );
}

/**
 * Kunak wordmark logo — extracted vector-approximated.
 * The real site uses two raster variants (white on dark hero, blue on scroll)
 * downloaded to `public/images/logos/`. This inline SVG is used as fallback.
 */
export function KunakLogo({
  variant = "blue",
  ...props
}: IconProps & { variant?: "white" | "blue" }) {
  const color = variant === "white" ? "#ffffff" : "#0075c9";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      width="164"
      height="49"
      role="img"
      aria-label="Kunak"
      {...props}
    >
      <text
        x="0"
        y="34"
        fill={color}
        fontFamily="Manrope, sans-serif"
        fontWeight="800"
        fontSize="36"
        letterSpacing="-1.5"
      >
        kunak®
      </text>
      <text
        x="1"
        y="52"
        fill={color}
        fontFamily="Manrope, sans-serif"
        fontWeight="500"
        fontSize="8"
        letterSpacing="4"
        opacity="0.9"
      >
        SENSING ANYWHERE
      </text>
    </svg>
  );
}
