import { BlueButton } from "./SectionRow";
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

export function Footer() {
  return (
    <footer className="et-l--footer bg-white">
      <div className="mx-auto w-[85%] max-w-[1380px]" style={{ paddingTop: 56 }}>
        {/* Row 0 — link columns */}
        <div
          className="grid grid-cols-1 gap-8 border-t border-[#333] sm:grid-cols-3 lg:grid-cols-5"
          style={{ paddingTop: 28, paddingBottom: 55 }}
        >
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[14px] font-bold text-[#333]">{col.title}</p>
              <ul className="pb-[18px] leading-[26px]">
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
                <div className="mt-6">
                  <BlueButton href={SUBSCRIBE_HREF}>¡Suscríbete!</BlueButton>
                </div>
              ) : null}
            </div>
          ))}

          {/* Certificaciones column */}
          <div>
            <p className="mb-2 text-[14px] font-bold text-[#333]">CERTIFICACIONES</p>
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

        {/* Row 1 — legal / social / language */}
        <div className="flex flex-col gap-6 pb-[32px] pt-[28px] md:flex-row md:items-start md:justify-between">
          {/* Legal */}
          <div className="space-y-1 text-[12px] leading-[1.6] text-[#333] md:w-3/5">
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
                    <button
                      type="button"
                      className="text-[#333] transition-colors hover:text-[#0075C9]"
                    >
                      {l.label}
                    </button>
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

          {/* Social */}
          <div className="flex items-center gap-[9px] text-[#333]">
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
    </footer>
  );
}
