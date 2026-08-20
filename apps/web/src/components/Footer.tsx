import { BlueButton } from "./SectionRow";
import { CtaBanner } from "./CtaBanner";
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
  PIE_CTA_CASO,
} from "@/lib/footer";
import type { SocialLink } from "@/types/kunak";

/**
 * Footer (`footer.et-l--footer`) — 5 link columns + legal / social / language
 * bar. Column links turn blue on hover; the "PRODUCTOS" heading is blue while
 * the others are dark. Language switcher opens upward.
 * Spec: docs/research/components/footer.spec.md
 *
 * ══════════════════════════════════════════════════════════════════════════
 * D4 · EL PIE TIENE TRES PRESENTACIONES, Y LAS ELIGE EL TIPO DE PÁGINA
 * (medido 2026-08-01 · `qa:d4` + `qa:d4-tipo` · ESQUEMA-CMS §6b)
 *
 * El contenido del pie es el MISMO en las 11 formas medidas —mismas secciones,
 * mismos módulos, mismos enlaces—. Lo que cambia es **presentación**, y es
 * constante dentro de cada familia y distinta entre familias: la firma de una
 * decisión de PLANTILLA, no de un campo por instancia. Nadie editó el pie de
 * /accesorios; lo heredó su tipo de página.
 *
 * | presentación | formas | fila | `pad` secc. | alto @1440 |
 * |---|---|---|---|---|
 * | `ancha`       | grupo A · sector · monográfico · caso · faq · home | 86 % | 0 | 593.75 |
 * | `estrecha`    | software | 80 % | 0 | 681.09 |
 * | `estrechaPad` | catálogo · producto | 80 % | 4 % | 1048.25 |
 *
 * ⚠ **Son TRES ejes, no dos.** El ESQUEMA §6b registró el ancho de fila y el
 * `padding`; con esos dos, `footer-background` cuadra al céntimo y catálogo se
 * queda a **−79.19**. El que faltaba es **TIPOGRAFÍA**, y se ve en que las
 * columnas de texto crecen mientras la de la imagen no se mueve:
 *
 *   li      fs 14 lh 26   mb 0  ·  fs 14 lh 30.6 mb 7  ·  fs 18 lh 30.6 mb 9
 *   legal   fs 12         ·        fs 12              ·  fs 18 → 2 renglones
 *
 * El legal a 18px envuelve a 61.19 en vez de 30.59: ahí están los +32.59 de
 * `footer-legal`, al céntimo. **No es responsive** (idéntico a 1280, 1440 y 390).
 *
 * ⚠ La cabecera anterior atribuía `li 14px/30.6 mb 7` a /monitor-calidad-aire
 * medido a 1280. Es incorrecto: esos son los valores de SOFTWARE, y /monitor da
 * **18px/30.6 mb 9** a ese mismo ancho. El clon entero estaba calibrado con
 * SOFTWARE —por eso acertaba ahí y fallaba en las otras diez—.
 *
 * `ulPb` del clon = (pb del `ul` del original) + 32 del margen de widget: el
 * clon mete el `mb` del último `li` DENTRO del `ul` y el original no, así que la
 * partición difiere y el total no. Comprobado: ancha 30.59 + (156 + 46) = 232.59,
 * el alto exacto de la primera columna del original.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Tipo de página, que es quien decide la presentación del pie (ESQUEMA §6b). */
export type TipoPagina =
  | "grupoA"
  | "sector"
  | "caso"
  | "faq"
  | "software"
  | "catalogo"
  | "producto"
  | "home";

type Presentacion = {
  /** Ancho de fila. Literal completo: Tailwind no compone clases en runtime. */
  fila: string;
  /** `padding` vertical de sección: 4 % desktop / 50px móvil, o nada. */
  padSeccion: boolean;
  liA: string;
  li: string;
  ul: string;
  titulo: string;
  legal: string;
  /**
   * Segundo `<p>` del bloque legal («Página web diseñada con…»). Escala con la
   * presentación igual que el primero: **9.6px** donde el legal es de 12 y
   * **14.4px** donde es de 18 (0.8× en los dos casos).
   */
  legal2: string;
  /**
   * Alto del bloque de iconos sociales (solo móvil; en `sm:` pasa a `auto`).
   * Cuarto eje de presentación, medido a
   * 390 en la columna 2 de `footer-legal`: **31.59 en `ancha`** y **61.59 en las
   * dos estrechas** — exactamente +30. El clon servía 31.59 en las tres.
   */
  social: string;
  /**
   * QUINTO eje: el bloque «¡Suscríbete!» de la columna EMPRESA — el residuo
   * entero de `footer-links`, y la 3.ª instancia de LA FAMILIA DE CALIBRACIÓN.
   * De las cinco columnas, cuatro cuadran al céntimo en las tres presentaciones;
   * ésta llevaba `mt 16 · mb 46 · pb 3.1`, que son los valores de SOFTWARE.
   *
   * Medido 2026-08-02 con `qa:d4-sus` (los dos lados, los dos anchos,
   * `medidas/d4-suscribete-{390,1440}-antes.json`). Lo que hay que igualar es la
   * **caja** de la columna del original, no su contenido:
   *
   * | | caja orig @1440 | @390 | `mt` | `mb` | `pb` del botón |
   * |---|---|---|---|---|---|
   * | ancha       | 313.59 | 313.59 | 16 | 46 | **10** |
   * | estrecha    | 349.86 | 350.67 | 16 | 46 | **2.297 / 3.109** |
   * | estrechaPad | 366.16 | 335.56 | **0** | **30** | **10** |
   *
   * ⚠ **El original y el clon parten la misma altura de forma distinta, y por eso
   * el nivel importa.** En el original el `mb` del envoltorio del botón SE
   * ESCAPA de la columna (margen del último hijo, sin `padding` que lo pare):
   * su contenido mide 329.59 y su caja 313.59. La columna del clon es un ítem de
   * rejilla —o sea un contexto de formato propio— y **contiene** su margen. Lo
   * que suma en la fila es la CAJA en los dos lados; comprobado con la Σ de las
   * cinco columnas a 390 (1325.41 orig contra 1318.71 clon, y la fila −7.7).
   * Cablear contra el contenido habría metido 16 px de más en las tres.
   *
   * El `pb` del botón es el único que cambia con el ancho, y solo en `estrecha`.
   */
  sus: string;
  /**
   * SEXTO eje — **D3**, los 42 px entre el cuerpo y el pie. Y no es un eje del
   * pie: es el `margin-bottom` del `<article>` del CPT en el original, medido
   * con `qa:d123` sobre **11 formas** (2026-08-02):
   *
   * | forma | `<article>` | `mb` |
   * |---|---|---|
   * | catálogo · software · producto | `post-N solutions type-solutions` | **42px** |
   * | sector · monográfico · home | `post-N page type-page` | 0 |
   * | A·blog · A·término · A·documento | (no hay `<article>` en la cadena) | 0 |
   *
   * O sea que la frontera es el **tipo de contenido de WordPress**, y resulta
   * ser **la misma** que ya parte `ancha` de las dos estrechas: las tres formas
   * con 42 son exactamente las tres del CPT `solutions`. Por eso vive en esta
   * tabla y no en cuatro `page.tsx` copiados a mano.
   *
   * ⚠ **Dónde se cablea no es dónde vive en el original.** Allí el margen es del
   * `<article>`, lo contiene `#main-content` y empuja al pie; el clon no tiene
   * envoltorio de artículo, así que se expresa como espacio ANTES del pie. La
   * geometría es la misma —`body` es contenedor flex, o sea que el margen no
   * colapsa— pero la atribución no: si algún día el clon estrena `<article>`,
   * esto se mueve allí. Queda dicho para que nadie lo lea como un margen del pie.
   */
  antesDelPie: string;
  /**
   * SÉPTIMO eje — los BORDES de la fila de enlaces. Cerraba el residuo de ~1 px
   * que quedó fichado sin descomponer el 2026-08-02, y no era ruido:
   *
   * | presentación | `border-top` | `border-bottom` |
   * |---|---|---|
   * | ancha | 1px | **1px** |
   * | estrecha | 1px | **1px** |
   * | estrechaPad | **0** | **0** |
   *
   * El clon servía `border-top: 1px` y nada abajo **en las tres**: −1 en ancha y
   * estrecha (le falta el de abajo) y **+1 en estrechaPad** (le sobra el de
   * arriba). Los dos signos del mismo cableado, que es la firma de siempre.
   *
   * ⚠ Y no es solo 1 px de alto: en catálogo y producto el clon **pinta una
   * línea de `#333` cruzando el pie que el original no tiene**. Se veía.
   *
   * Se descubrió midiendo `pt + pb + Σcolumnas` contra el alto de la fila: el
   * original sobraba **2.01** y el clon **1.01**, constante en los dos anchos y
   * en las tres presentaciones. Un residuo constante no es ruido — el ruido no
   * se repite igual a 1440 y a 390.
   */
  borde: string;
};

const ANCHA_FILA = "w-[86%] max-w-[1380px]";
const ESTRECHA_FILA = "w-[80%] max-w-[1380px]";

const PRESENTACION: Record<"ancha" | "estrecha" | "estrechaPad", Presentacion> = {
  ancha: {
    fila: ANCHA_FILA,
    padSeccion: false,
    li: "",
    liA: "text-[14px]",
    ul: "pb-[46px] text-[14px] leading-[26px]",
    titulo: "text-[14px]",
    legal: "text-[12px]",
    legal2: "text-[9.6px]",
    social: "h-[31.6px]",
    sus: "mb-[46px] mt-[16px] [&>a]:pb-[10px]",
    antesDelPie: "",
    borde: "border-y border-[#333]",
  },
  estrecha: {
    fila: ESTRECHA_FILA,
    padSeccion: false,
    li: "mb-[7px]",
    liA: "text-[14px]",
    ul: "pb-[32px] text-[14px] leading-[30.6px]",
    titulo: "text-[14px]",
    legal: "text-[12px]",
    legal2: "text-[9.6px]",
    social: "h-[61.59px]",
    sus: "mb-[46px] mt-[16px] [&>a]:pb-[3.109px] sm:[&>a]:pb-[2.297px]",
    antesDelPie: "mt-[42px]",
    borde: "border-y border-[#333]",
  },
  estrechaPad: {
    fila: ESTRECHA_FILA,
    padSeccion: true,
    li: "mb-[9px]",
    liA: "text-[18px]",
    ul: "pb-[32px] text-[18px] leading-[30.6px]",
    titulo: "text-[18px]",
    legal: "text-[18px]",
    legal2: "text-[14.4px]",
    social: "h-[61.59px]",
    sus: "mb-[30px] [&>a]:pb-[10px]",
    antesDelPie: "mt-[42px]",
    borde: "",
  },
};

/** Qué presentación hereda cada tipo de página. Una tabla, un sitio. */
const DE_TIPO: Record<Exclude<TipoPagina, "home">, keyof typeof PRESENTACION> = {
  grupoA: "ancha",
  sector: "ancha",
  caso: "ancha",
  faq: "ancha",
  software: "estrecha",
  catalogo: "estrechaPad",
  producto: "estrechaPad",
};
const SOCIAL_ICON: Record<SocialLink["network"], typeof LinkedInIcon> = {
  linkedin: LinkedInIcon,
  x: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

export function Footer({
  tipo = "home",
  stripImage = "/images/uploads/2022/12/cabecera-puerto-1.jpg",
}: {
  /**
   * Tipo de página. Decide ancho de fila, `padding` de sección y tipografía
   * (ESQUEMA §6b). `"home"` conserva su maquetación propia — ver abajo.
   */
  tipo?: TipoPagina;
  /**
   * Foto de la franja `footer-background` (todos menos `home`). Las 4
   * páginas de producto sirven la del puerto; **cada sector sirve la SUYA**,
   * la misma de su cabecera (medido 2026-07-28: urbano → `urban-1920.jpg`,
   * industria → `industry-1920x1024-1.jpg`).
   */
  stripImage?: string;
} = {}) {
  const tb = tipo !== "home";
  /**
   * ⚠ `home` sigue por su camino antiguo A PROPÓSITO, y está fichado.
   * Medido 2026-08-01: el pie del original en la home es **idéntico al de
   * grupo A** (593.75 / 1761.17, fila 86 %, 3 secciones), pero el clon lo
   * construye aparte —`w-[85%]`, 1 solo bloque de nivel 1, espaciador de 40—
   * y aun así totaliza **−1.58 @1440 / +0.42 @390**. O sea: partición distinta
   * con total casi igual, que es la firma de una compensación, no de un
   * acierto. Cambiarlo entra en la misma tanda que C-QA3 (la home tiene
   * +289.91 abierto); mezclarlo aquí impediría adjudicar ninguno de los dos.
   * Ficha: `PENDIENTES-QA.md` §D4.
   */
  const p = PRESENTACION[DE_TIPO[(tipo === "home" ? "grupoA" : tipo) as Exclude<TipoPagina, "home">]];
  /** `padding` de sección: 4 % desktop / 50px móvil, en las TRES secciones. */
  const padSec = p.padSeccion ? "py-[50px] sm:py-[4%]" : "";

  /* Ritmo móvil home (<640) medido en vivo B4 (qa/b4-probe.mjs, 390 real):
     sección pt 50, fila pt 30, headings p de 30.6 SIN margen (lh 30.6px
     fijo heredado — 1.7em de 18, no 1.7 sin unidades), li de 26 (fs 14
     en el li para que el strut no infle la caja), ul pb 14, y tras CERT
     32 (mb de widget) + 30 (pb de fila) = 62. En sm: se restauran los
     valores verificados de desktop (footer 592 exacto). */
  const linksGrid = (
    <div
      className={
        tb
          ? `mx-auto grid ${p.fila} ${p.borde} grid-cols-1 pb-[30px] pt-[30px] sm:grid-cols-3 sm:py-[2%] lg:grid-cols-5`
          : "grid grid-cols-1 gap-8 border-t border-[#333] pb-[62px] pt-[30px] sm:grid-cols-3 sm:pb-[55px] sm:pt-[28px] lg:grid-cols-5"
      }
    >
      {FOOTER_COLUMNS.map((col) => (
        // `data-kunak` es MARCADOR DE SONDA, no estilo. Dos intentos de medir el
        // bloque «¡Suscríbete!» dieron nodos equivocados porque el lado del clon
        // no tiene `.et_pb_column`: `closest()` subía hasta la rejilla entera (28
        // enlaces). Lo que identifica un módulo es el marcador semántico, no el
        // literal de `className` (`CLAUDE.md` §sondas, regla 4).
        <div key={col.title} data-kunak="footer-col">
          <p
            className={
              tb
                ? `mb-0 ${p.titulo} font-bold leading-[30.6px] text-[#333]`
                : "mb-0 text-[14px] font-bold leading-[30.6px] text-[#333] sm:mb-4 sm:leading-[1.7]"
            }
          >
            {col.title}
          </p>
          <ul
            className={
              tb ? p.ul : "pb-[14px] text-[14px] leading-[26px] sm:pb-[18px] sm:text-[18px]"
            }
          >
            {col.links.map((l) => (
              <li key={l.label} className={tb ? p.li : undefined}>
                <a
                  href={l.href}
                  className={`${tb ? p.liA : "text-[14px]"} text-[#333] transition-colors duration-300 hover:text-[#0075C9]`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {col.title === "EMPRESA" ? (
            // Home móvil: 48 antes (mb 32 widget + 16 wrapper), 14 después
            // (+32 del gap = 46 = mb 30 del span + 16 del wrapper) y
            // pb 10 del botón (45 de alto; 9/44 solo desktop).
            // TB: ul ya lleva el mb32 del widget → +16 wrapper, botón
            // h37/38.1 (pb 2 desktop / 3.1 móvil), después 30+16=46.
            <div
              data-kunak="footer-suscribete"
              className={
                tb
                  ? p.sus
                  : "mb-[14px] mt-[48px] max-sm:[&>a]:pb-[10px] sm:mb-0 sm:mt-6"
              }
            >
              <BlueButton href={SUBSCRIBE_HREF}>¡Suscríbete!</BlueButton>
            </div>
          ) : null}
        </div>
      ))}

      {/* Certificaciones column */}
      <div data-kunak="footer-col">
        <p
          className={
            tb
              ? `mb-0 ${p.titulo} font-bold leading-[30.6px] text-[#333]`
              : "mb-0 text-[14px] font-bold leading-[30.6px] text-[#333] sm:mb-2 sm:leading-[1.7]"
          }
        >
          CERTIFICACIONES
        </p>
        <a
          href={ENS_CERT.href}
          target="_blank"
          rel="noopener"
          className={tb ? "block pb-[32px]" : undefined}
        >
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
  );

  /* Row 1 — legal / social / language. Home móvil: fila con pad 1% (3.9),
     legal a lh 30.6 (3+1 líneas = 122.4) + 62 hasta iconos (32 widget
     + 30 col), iconos + 38 hasta idioma (61.6 − 24 de caja).
     TB: fila py 1% en TODOS los anchos, legal lh 30.6 también desktop
     (2+1 líneas = 91.8) + mb 32, iconos móvil caja 31.6 + 60 (30 icono
     + 30 col) hasta idioma. */
  const legalRow = (
    <div
      className={
        tb
          ? `mx-auto flex ${p.fila} flex-col py-[1%] md:flex-row md:items-start md:justify-between`
          : "flex flex-col pb-[4px] pt-[4px] sm:gap-6 sm:pb-[32px] sm:pt-[28px] md:flex-row md:items-start md:justify-between"
      }
    >
      {/* Legal */}
      <div
        className={
          tb
            ? // Margen de columna medido en el original: **30 a 390**, no 62.
              // El 62 del clon compensaba que le faltaban los 32 de separación
              // entre los dos `<p>` (abajo): dos errores que casi se anulaban.
              `mb-[30px] ${p.legal} leading-[30.6px] text-[#333] sm:mb-0 md:w-3/5`
            : "mb-[62px] text-[12px] leading-[30.6px] text-[#333] sm:mb-0 sm:space-y-1 sm:leading-[1.6] md:w-3/5"
        }
      >
        {/* Los dos `<p>` del bloque legal van separados por 32 en el original
            (col 93.19 = 30.59 + 32 + 30.59 a 1440). El clon no los separaba y
            lo compensaba con el mb 62 de la columna. */}
        <p className={tb ? "mb-[32px]" : undefined}>
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
        <p
          className={
            tb
              ? `inline-flex items-center gap-1 ${p.legal2}`
              : "inline-flex items-center gap-1"
          }
        >
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

      {/* Social — home móvil: margen Divi responsive 9+33.7 por icono (42.7
          entre iconos, 9 de entrada); TB móvil: 19+19 (38 entre iconos,
          19 de entrada, caja 31.6); desktop: 9px verificado en ambos */}
      <div
        className={
          tb
            ? `mb-[30px] ${p.social} flex items-center gap-[38px] pl-[19px] text-[#333] sm:mb-0 sm:h-auto sm:gap-[9px] sm:pl-0`
            : "mb-[38px] flex items-center gap-[42.7px] pl-[9px] text-[#333] sm:mb-0 sm:gap-[9px] sm:pl-0"
        }
      >
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
  );

  if (tb) {
    return (
      <footer className={`et-l--footer bg-white ${p.antesDelPie}`}>
        {/* 4ª sección, y va PRIMERA: solo el CASO la lleva (343.06 / 265.06).
            Caja medida en `d4-cta`: contenedor 88 %, descripción `py` 6 % ·
            `pl` 10 % desktop y `pt` 10 % · `pb` 15 % móvil — porcentajes del
            contenedor, que es como Divi la escribe. */}
        {tipo === "caso" ? (
          <CtaBanner
            image={PIE_CTA_CASO.image}
            heading={PIE_CTA_CASO.heading}
            headingHref={PIE_CTA_CASO.href}
            buttonLabel={PIE_CTA_CASO.buttonLabel}
            buttonHref={PIE_CTA_CASO.href}
            descPadClassName="pb-[15%] pt-[10%] md:py-[6%] md:pl-[10%]"
            headingPbClassName="pb-[10px]"
            buttonMtClassName="mt-[20px]"
          />
        ) : null}
        {/* ⚠ `data-pie` es MARCADOR DE SONDA, NO ESTILO — el precedente es
            `data-fila` (§*que el objeto medido diga qué es*). El original
            nombra sus tres secciones con `footer-links` · `footer-legal` ·
            `footer-background`; el clon no tenía equivalente, así que
            `pie-cmp` sólo podía emparejarlas **por índice**, que es un
            heurístico posicional y se rompe en cuanto `L5-casos` mete su CTA
            delante. Antes/después a umbral cero en `clon-base`: no mueve un
            píxel. */}
        {/* Sección links: pt 4% desktop (57.5938 a 1440) / 50px móvil. El `pb`
            solo lo llevan catálogo y producto — `padSeccion`. */}
        <div data-pie="links" className={p.padSeccion ? padSec : "pt-[50px] sm:pt-[4%]"}>{linksGrid}</div>
        {/* Sección legal: sin padding propio salvo en `estrechaPad` (la fila
            lleva su 1% en todos los casos). */}
        <div data-pie="legal" className={padSec}>{legalRow}</div>
        {/* `footer-background` — franja foto del puerto. QA 2026-07-26:
            41px desktop / 40px móvil, cover 50% 0%. La franja mide siempre lo
            mismo; lo que crece en catálogo/producto es el `padding` de SU
            sección: 41 → 156.19 = 41 + 57.5938×2, al céntimo. */}
        <div data-pie="background" className={padSec}>
          <div
            aria-hidden
            className="h-[40px] w-full bg-cover lg:h-[41px]"
            style={{
              backgroundImage: `url('${stripImage}')`,
              backgroundPosition: "50% 0%",
            }}
          />
        </div>
      </footer>
    );
  }

  return (
    <footer className="et-l--footer bg-white">
      <div className="mx-auto w-[85%] max-w-[1380px] pt-[50px] sm:pt-[56px]">
        {linksGrid}
        {legalRow}
        {/* Row 2 — empty spacer row from the original template */}
        <div aria-hidden style={{ height: 40 }} />
      </div>
    </footer>
  );
}
