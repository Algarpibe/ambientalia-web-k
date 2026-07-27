import { BlueButton } from "./SectionRow";
import { CookiePreferencesButton } from "./CookiePreferencesButton";
import {
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  HeartIcon,
  GlobeIcon,
  ChevronDownIcon,
} from "./icons";
import { LANGUAGES } from "@/lib/nav";
import {
  FOOTER_COLUMNS,
  SUBSCRIBE_HREF,
  ENS_CERT,
  LEGAL_LINKS,
  DESIGNER,
  SOCIALS,
} from "@/lib/footer";
import type { SocialLink } from "@/types/kunak";

/**
 * Footer (`footer.et-l--footer`) — 5 link columns + legal / social / language
 * bar. Column links turn blue on hover; the "PRODUCTOS" heading is blue while
 * the others are dark. Language switcher opens upward.
 * Spec: docs/research/components/footer.spec.md
 */
const SOCIAL_ICON: Record<SocialLink["network"], typeof LinkedInIcon> = {
  linkedin: LinkedInIcon,
  x: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

export function Footer({ backgroundStrip = false }: { backgroundStrip?: boolean } = {}) {
  return (
    <footer className="et-l--footer bg-white">
      {/* Ritmo móvil (<640) medido en vivo B4 (qa/b4-probe.mjs, 390 real):
          sección pt 50, fila pt 30, headings p de 30.6 SIN margen (lh 30.6px
          fijo heredado — 1.7em de 18, no 1.7 sin unidades), li de 26 (fs 14
          en el li para que el strut no infle la caja), ul pb 14, y tras CERT
          32 (mb de widget) + 30 (pb de fila) = 62. En sm: se restauran los
          valores verificados de desktop (footer 592 exacto). */}
      <div className="mx-auto w-[85%] max-w-[1380px] pt-[50px] sm:pt-[56px]">
        {/* Row 0 — link columns */}
        <div className="grid grid-cols-1 gap-8 border-t border-[#333] pb-[62px] pt-[30px] sm:grid-cols-3 sm:pb-[55px] sm:pt-[28px] lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-0 text-[14px] font-bold leading-[30.6px] text-[#333] sm:mb-4 sm:leading-[1.7]">
                {col.title}
              </p>
              <ul className="pb-[14px] text-[14px] leading-[26px] sm:pb-[18px] sm:text-[18px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[14px] text-[#333] transition-colors duration-300 hover:text-[#0075C9]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              {col.title === "EMPRESA" ? (
                // Móvil: 48 antes (mb 32 widget + 16 wrapper), 14 después
                // (+32 del gap = 46 = mb 30 del span + 16 del wrapper) y
                // pb 10 del botón (45 de alto; 9/44 solo desktop)
                <div className="mb-[14px] mt-[48px] max-sm:[&>a]:pb-[10px] sm:mb-0 sm:mt-6">
                  <BlueButton href={SUBSCRIBE_HREF}>¡Suscríbete!</BlueButton>
                </div>
              ) : null}
            </div>
          ))}

          {/* Certificaciones column */}
          <div>
            <p className="mb-0 text-[14px] font-bold leading-[30.6px] text-[#333] sm:mb-2 sm:leading-[1.7]">CERTIFICACIONES</p>
            <a href={ENS_CERT.href} target="_blank" rel="noopener">
              <img
                src={ENS_CERT.image}
                alt="Certificación ENS RD 311/2022"
                width={100}
                height={121}
                style={{ width: 100, height: "auto" }}
              />
            </a>
          </div>
        </div>

        {/* Row 1 — legal / social / language. Móvil: fila con pad 1% (3.9),
            legal a lh 30.6 (3+1 líneas = 122.4) + 62 hasta iconos (32 widget
            + 30 col), iconos + 38 hasta idioma (61.6 − 24 de caja). */}
        <div className="flex flex-col pb-[4px] pt-[4px] sm:gap-6 sm:pb-[32px] sm:pt-[28px] md:flex-row md:items-start md:justify-between">
          {/* Legal */}
          <div className="mb-[62px] text-[12px] leading-[30.6px] text-[#333] sm:mb-0 sm:space-y-1 sm:leading-[1.6] md:w-3/5">
            <p>
              2026 © KUNAK TECHNOLOGIES SL ·{" "}
              {LEGAL_LINKS.map((l, i) => (
                <span key={l.label}>
                  {i > 0 ? " – " : null}
                  {l.href ? (
                    <a href={l.href} className="text-[#333] transition-colors hover:text-[#0075C9]">
                      {l.label}
                    </a>
                  ) : (
                    // "Editar preferencias de cookies" → abre Cookiebot (B6)
                    <CookiePreferencesButton
                      label={l.label}
                      className="text-[#333] transition-colors hover:text-[#0075C9]"
                    />
                  )}
                </span>
              ))}
            </p>
            <p className="inline-flex items-center gap-1">
              Página web diseñada con
              <HeartIcon className="inline-block h-4 w-4 text-[#333]" />
              por{" "}
              <a
                href={DESIGNER.href}
                target="_blank"
                rel="noopener"
                className="text-[#333] transition-colors hover:text-[#0075C9]"
              >
                {DESIGNER.label}
              </a>
            </p>
          </div>

          {/* Social — móvil: margen Divi responsive 9+33.7 por icono (42.7
              entre iconos, 9 de entrada); desktop: 9px verificado */}
          <div className="mb-[38px] flex items-center gap-[42.7px] pl-[9px] text-[#333] sm:mb-0 sm:gap-[9px] sm:pl-0">
            {SOCIALS.map((s) => {
              const Icon = SOCIAL_ICON[s.network];
              return (
                <a
                  key={s.network}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.network}
                  className="text-[#333] transition-colors hover:text-[#0075C9]"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>

          {/* Language (opens upward) */}
          <div className="group relative md:text-right">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] text-[#333]"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              Español
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 min-w-[132px] rounded-[10px] border border-[#333] bg-white py-1 opacity-0 shadow-none transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              {LANGUAGES.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="block px-5 py-1.5 text-[14px] text-[#333] transition-colors hover:bg-black/[0.03]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — empty spacer row from the original template */}
        <div aria-hidden style={{ height: 40 }} />
      </div>

      {/* `footer-background` — franja foto del puerto (solo plantillas TB con
          footer propio, p. ej. /monitor-calidad-aire). QA 2026-07-26: 41px
          desktop / 40px móvil, cover 50% 0%. */}
      {backgroundStrip ? (
        <div
          aria-hidden
          className="h-[40px] w-full bg-cover lg:h-[41px]"
          style={{
            backgroundImage: "url('/images/uploads/2022/12/cabecera-puerto-1.jpg')",
            backgroundPosition: "50% 0%",
          }}
        />
      ) : null}
    </footer>
  );
}
