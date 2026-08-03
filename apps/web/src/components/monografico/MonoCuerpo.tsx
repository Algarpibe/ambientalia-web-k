import { Fragment } from "react";

import type {
  MonoAncho,
  MonoBloqueTexto,
  MonoCelda,
  MonoColumna,
  MonoInline,
  MonoModulo,
  MonoNivel,
  MonoRitmoModulo,
  MonoSeccion,
} from "@/lib/monografico";
import { BlueButton } from "../SectionRow";
import { CtaDescarga } from "../sectores/CtaDescarga";
import { MapaProyectos } from "../sectores/MapaProyectos";

/**
 * El cuerpo del arquetipo **MONOGRÁFICO TÉCNICO**.
 * Spec: docs/research/monografico-tecnico/components/seccion-editorial.spec.md
 *
 * **No es un bloque, es el árbol de Divi**: `sección → fila → columna → pila de
 * módulos`. 13 de las 19 filas de las dos páginas son esto, y las otras 6
 * también, solo que con la pila que hace de cierre comercial.
 *
 * ── Lo que este componente pone y lo que pone el dato ──────────────────────
 * El ritmo **por defecto** vive aquí y es responsive (un % del padre). Cada
 * override viaja en el dato como px absolutos y se pinta con `style` inline,
 * que gana a la clase en los dos anchos — que es exactamente lo que hace el
 * original: lo que el editor toca queda en px iguales a 1440 y a 390.
 *
 * ── El punteado NO ocupa alto ──────────────────────────────────────────────
 * Medido en el original (`y −40` respecto a su columna, `position: absolute`):
 * es un módulo de imagen posicionado fuera del flujo, igual que ya lo pintan
 * `SectorHero` y `BeneficiosAplicaciones`. Meterlo en la pila habría metido
 * 22 + 34.05 de aire en 31 columnas.
 */

/* ─────────────────────────── retícula ──────────────────────────────────── */

/**
 * Token de columna Divi → ancho. Los seis repartos medidos suman siempre 94.5%
 * + 5.5% de gutter. Es la MISMA retícula que la de SECTOR (86% máx 1380).
 */
const ANCHO: Record<MonoAncho, string> = {
  "1_4": "md:w-[20.875%]",
  "1_3": "md:w-[29.6667%]",
  "2_5": "md:w-[36.7%]",
  "1_2": "md:w-[47.25%]",
  "3_5": "md:w-[57.8%]",
  "2_3": "md:w-[64.8333%]",
  "3_4": "md:w-[73.625%]",
  "4_4": "md:w-full",
};

/** Default responsive de sección: `pt`/`pb` 4% → 57.5938 / 50. */
const SECCION = "w-full bg-white pb-[50px] pt-[50px] md:pb-[57.5938px] md:pt-[57.5938px]";
/** Default responsive de fila: `pt`/`pb` 2% → 28.7969 / 30, sobre la retícula. */
const FILA = "mx-auto w-[86%] max-w-[1380px] pb-[30px] pt-[30px] md:pb-[28.7969px] md:pt-[28.7969px]";

/* ─────────────────────────── tipografía ────────────────────────────────── */

/**
 * Escala del `titular` (heading SIN `<span>` azul): **cambia con el ancho**, o
 * sea plantilla. `letter-spacing: -0.5px` lo pone la regla global de
 * `globals.css` para `h1…h6`; aquí no se repite.
 */
const TITULAR =
  "pb-[10px] text-[35px] font-light leading-[43.75px] text-[#333] md:text-[44px] md:leading-[55px]";

/**
 * Escala del `claim` (heading CON `<span>` azul): **la misma a 1440 y a 390**,
 * o sea override editorial. El valor está predicho por el nivel en las 12
 * instancias medidas; la spec daba el de nivel 3 como 44/55 y el original lo
 * pinta a **32** — ver `MonoModulo` en `src/lib/monografico.ts`.
 */
const CLAIM: Record<MonoNivel, string> = {
  2: "text-[37px] leading-[37px]",
  3: "text-[32px] leading-[32px]",
  4: "text-[26px] leading-[26px]",
};

const AZUL = "#0075C9";

function Heading({
  nivel,
  className,
  children,
}: {
  nivel: MonoNivel;
  className: string;
  children: React.ReactNode;
}) {
  if (nivel === 2) return <h2 className={className}>{children}</h2>;
  if (nivel === 3) return <h3 className={className}>{children}</h3>;
  return <h4 className={className}>{children}</h4>;
}

/** El claim: el color lo pone un `<span>` DENTRO del heading, como el original. */
function Claim({ texto, nivel = 2 }: { texto: string; nivel?: MonoNivel }) {
  return (
    <Heading nivel={nivel} className={`pb-[10px] font-light text-[#333] ${CLAIM[nivel]}`}>
      <span style={{ color: AZUL }}>{texto}</span>
    </Heading>
  );
}

/* ─────────────────────────── bloques de texto ──────────────────────────── */

/**
 * Texto con marcado en línea. La negrita es más ancha que la redonda, así que
 * esto no es decoración: **decide dónde envuelve el texto**, y por tanto el
 * alto del bloque.
 */
function Inline({ t }: { t: MonoInline }) {
  if (typeof t === "string") return <>{t}</>;
  return (
    <>
      {t.map((trozo, i) =>
        typeof trozo === "string" ? (
          <Fragment key={i}>{trozo}</Fragment>
        ) : (
          <strong key={i}>{trozo.b}</strong>
        ),
      )}
    </>
  );
}

/** Clave estable de un texto que puede ser string o lista de trozos. */
const claveInline = (t: MonoInline) =>
  typeof t === "string" ? t : t.map((x) => (typeof x === "string" ? x : x.b)).join("");

function Bloque({ b }: { b: MonoBloqueTexto }) {
  if ("p" in b)
    return (
      <p style={b.pb !== undefined ? { paddingBottom: b.pb } : undefined}>
        <Inline t={b.p} />
      </p>
    );
  if ("ul" in b)
    return (
      <ul className="list-none pb-[18px] pl-[36px]">
        {b.ul.map((item) => (
          <li
            key={claveInline(item)}
            className="before:-ml-[20.16px] before:inline-block before:w-[20.1562px] before:text-[22.4px] before:text-[#0075C9] before:content-['•']"
          >
            <Inline t={item} />
          </li>
        ))}
      </ul>
    );
  if ("claim" in b) return <Claim texto={b.claim} nivel={b.nivel} />;
  return (
    <Heading nivel={b.nivel ?? 3} className={TITULAR}>
      {b.titular}
    </Heading>
  );
}

/* ─────────────────────────── la tabla ──────────────────────────────────── */

function Celda({ c }: { c: MonoCelda }) {
  if (typeof c === "string") return <>{c}</>;
  return (
    <>
      <strong>{c.fuerte}</strong>
      {c.resto ?? ""}
    </>
  );
}

/**
 * "Tabla resumen: procesos y emisiones" — HTML escrito a mano dentro de un
 * `et_pb_text` del original, sin módulo de tabla, sin clases del tema y sin JS.
 * Spec: `components/tabla-resumen.spec.md`.
 *
 * **Desviación deliberada a 390.** El original la deja desbordar su columna
 * (524.39 dentro de 335.39, `overflow-x: visible`) y **la 4ª columna queda
 * inalcanzable**: el documento no gana scroll horizontal. Aquí se envuelve en
 * `overflow-x: auto`, como ya se decidió en `/accesorios` (A4). Consecuencia
 * esperada: a 390 esta fila **no** medirá lo mismo que el original, y eso no es
 * un defecto.
 */
function Tabla({ cabeceras, filas }: { cabeceras: string[]; filas: MonoCelda[][] }) {
  return (
    // `overflow-x-auto` SOLO en móvil, y por dos razones que coinciden:
    //   1. es donde el original pierde la 4ª columna (desviación deliberada, A4);
    //   2. a 1440 el envoltorio con overflow encerraría el `margin-bottom: 48px`
    //      de la tabla, que en el original se escapa del módulo y se lo come la
    //      columna. Con `md:overflow-x-visible` el reparto es el del original.
    <div className="overflow-x-auto md:overflow-x-visible">
      {/* Los bordes NO son decoración: con `border-collapse: collapse` cada
          borde superior de celda añade 1px a su fila. El original lleva
          `border: 1px solid #333` en la tabla y `border-top: 1px` en `th`/`td`
          (medido), y sin ellos la tabla salía **10px corta**: 9 filas + el
          cierre. La spec decía "sin bordes" mirando `border-bottom-width`. */}
      {/* `margin-bottom: 48px` medido en el original. No lo lleva el módulo
          —su `mb` es 0— sino la propia tabla, y se escapa hacia la columna. */}
      <table className="mb-[48px] w-full border-collapse border border-solid border-[#333]">
        <thead>
          <tr className="bg-[#f2f2f2]">
            {cabeceras.map((c) => (
              <th key={c} className="border-t border-solid border-[#333] px-[10px] py-[12px] text-left">
                <h5 className="pb-[10px] text-[23px] font-light leading-[23px] text-[#333]">{c}</h5>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr
              key={typeof fila[0] === "string" ? fila[0] : fila[0].fuerte}
              /* cebra en las filas PARES del cuerpo (2ª, 4ª, 6ª, 8ª) */
              className={i % 2 === 1 ? "bg-[#fafafa]" : undefined}
            >
              {fila.map((celda, j) => (
                <td
                  key={j}
                  className="border-t border-solid border-[#333] px-[10px] py-[12px] text-[15px] font-normal leading-[30.6px] text-[#333]"
                >
                  <Celda c={celda} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── módulos ───────────────────────────────────── */

/** `margin-bottom` del módulo: default responsive, o el override en px. */
function claseMb(ritmo: MonoRitmoModulo | undefined, esBoton: boolean) {
  if (esBoton) return "mb-[16px]"; // fijo en los dos anchos, incluso si es el último
  if (ritmo?.mb !== undefined) return ""; // lo pone el `style` inline
  if (ritmo?.mbAlterno) return "mb-[10.0469px] md:mb-[37.1406px]";
  return "mb-[30px] md:mb-[34.0469px]";
}

function estiloModulo(ritmo: MonoRitmoModulo | undefined): React.CSSProperties | undefined {
  if (!ritmo) return undefined;
  const s: React.CSSProperties = {};
  if (ritmo.mt !== undefined) s.marginTop = ritmo.mt;
  if (ritmo.mb !== undefined) s.marginBottom = ritmo.mb;
  if (ritmo.pt !== undefined) s.paddingTop = ritmo.pt;
  if (ritmo.pb !== undefined) s.paddingBottom = ritmo.pb;
  if (ritmo.pr !== undefined) s.paddingRight = ritmo.pr;
  return Object.keys(s).length ? s : undefined;
}

function Modulo({ m }: { m: MonoModulo }) {
  const ritmo = m.kind === "boton" ? undefined : m.ritmo;
  const anchoPct = m.kind === "boton" ? undefined : m.anchoPct;
  const envoltorio = (hijo: React.ReactNode) => (
    <div
      className={claseMb(ritmo, m.kind === "boton")}
      style={{
        ...estiloModulo(ritmo),
        // El ancho del módulo es un % de la columna en el original, así que va
        // como % y no como px: escala igual en los dos anchos.
        ...(anchoPct !== undefined ? { width: `${anchoPct}%` } : {}),
      }}
    >
      {hijo}
    </div>
  );

  switch (m.kind) {
    case "titular":
      return envoltorio(
        <Heading nivel={m.nivel ?? 3} className={TITULAR}>
          {m.texto}
        </Heading>,
      );

    case "claim":
      return envoltorio(<Claim texto={m.texto} nivel={m.nivel} />);

    case "texto":
      return envoltorio(
        <div
          className="text-[18px] text-[#333] [&>p:not(:last-child)]:pb-[18px]"
          /* `line-height` del módulo: 30.6 por defecto, pero el editor lo toca
             (30.6 · 36 · 45 medidos). Va inline porque es dato. */
          style={{ lineHeight: `${m.lh ?? 30.6}px` }}
        >
          {m.bloques.map((b, i) => (
            <Bloque key={i} b={b} />
          ))}
        </div>,
      );

    case "serie":
      // Pares `h4 + p` en UN solo módulo, los dos con `padding-left: 40px`
      // inline en el original. Sin marcador: no es una lista.
      return envoltorio(
        <div className="text-[18px] leading-[30.6px] text-[#333] [&>p:not(:last-child)]:pb-[18px]">
          {/* las 2 series medidas van a 30.6; si aparece una con otro, `lh` */}
          {m.items.map((it) => (
            // Fragment y no un <div>: el `h4` y el `p` tienen que quedar como
            // HIJOS DIRECTOS para que la rítmica Divi (`p:not(:last-child)`)
            // los alcance. Con un envoltorio —`display:contents` incluido— el
            // selector `>` deja de casar y la serie pierde 18px por par.
            <Fragment key={it.titulo}>
              <h4 className="pb-[10px] pl-[40px] text-[26px] font-light leading-[26px] text-[#333]">
                <span style={{ color: AZUL }}>{it.titulo}</span>
              </h4>
              <p className="pl-[40px]">{it.texto}</p>
            </Fragment>
          ))}
        </div>,
      );

    case "tabla":
      return envoltorio(<Tabla cabeceras={m.cabeceras} filas={m.filas} />);

    case "imagen":
      return envoltorio(<img src={m.src} alt={m.alt} className="w-full" />);

    case "boton":
      return envoltorio(
        <>
          <BlueButton href={m.href} external={m.external}>
            {m.label}
          </BlueButton>
          {/* el wrapper Divi del botón mide 74 y el botón 44 */}
          <div aria-hidden className="h-[30px]" />
        </>,
      );

    case "ctaDescarga":
      // Piel `"fondo"`, idéntica a la de Industria. Aquí entra como MÓDULO de
      // una columna, no como `SectorBlock` con `flujo`: el ritmo lo ponen la
      // fila y la sección (`MODELO.md` §4.3).
      return envoltorio(
        <CtaDescarga
          block={{
            kind: "ctaDescarga",
            title: m.title,
            body: m.body,
            cta: m.cta,
            image: m.image,
            variante: "fondo",
          }}
        />,
      );

    case "mapaProyectos":
      // `soloCaja`: aquí el titular y la intro son un módulo `texto` aparte, y
      // el punteado es un booleano de la columna.
      return envoltorio(
        <MapaProyectos block={{ kind: "mapaProyectos", title: "", pins: m.pins }} soloCaja />,
      );

    default: {
      const nunca: never = m;
      throw new Error(`Módulo de monográfico sin renderizador: ${JSON.stringify(nunca)}`);
    }
  }
}

/* ─────────────────────────── columnas y filas ──────────────────────────── */

function Columna({ c, ultima }: { c: MonoColumna; ultima: boolean }) {
  // El hueco de móvil: 30 por defecto si no es la última, y 0 si lo es. Cuando
  // el dato trae `mbMovil` manda él (hay columnas no-últimas con 0).
  //
  // Va por CLASE y no por `style` inline porque **solo existe a 390**: en
  // desktop las columnas van en fila y el margen es 0. Un inline ganaría también
  // en desktop. Los dos únicos valores medidos son 0 y 30; un tercero se añade
  // aquí, con su medida.
  const mbMovil = c.mbMovil ?? (ultima ? 0 : 30);
  return (
    <div
      className={`relative w-full md:mb-0 ${mbMovil === 30 ? "mb-[30px]" : "mb-0"} ${ANCHO[c.ancho]}`.trim()}
    >
      {c.punteado ? (
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
          style={{ width: 60, height: 22 }}
        />
      ) : null}
      {c.modulos.map((m, i) => (
        <Modulo key={i} m={m} />
      ))}
    </div>
  );
}

export function MonoCuerpo({ cuerpo }: { cuerpo: MonoSeccion[] }) {
  return (
    <>
      {cuerpo.map((sec, i) => (
        <section
          key={i}
          className={SECCION}
          style={{
            ...(sec.mt !== undefined ? { marginTop: sec.mt } : {}),
            ...(sec.pt !== undefined ? { paddingTop: sec.pt } : {}),
            ...(sec.pb !== undefined ? { paddingBottom: sec.pb } : {}),
          }}
        >
          {sec.filas.map((fila, j) => (
            <div
              key={j}
              data-fila=""
              className={FILA}
              style={{
                ...(fila.pt !== undefined ? { paddingTop: fila.pt } : {}),
                ...(fila.pb !== undefined ? { paddingBottom: fila.pb } : {}),
              }}
            >
              <div className="flex flex-col md:flex-row md:gap-[5.5%]">
                {fila.columnas.map((c, k) => (
                  <Columna key={k} c={c} ultima={k === fila.columnas.length - 1} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
