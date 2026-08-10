import type { CSSProperties, ReactNode } from "react";

import type {
  FilaKb,
  MedidaKb,
  ModuloKb,
  PielKb,
} from "@/lib/cms/articulos-kb";

/**
 * EL CUERPO DE `articulos-kb` — la capa PROPIA, la del builder.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LA PLANTILLA VIVE EN DOS SITIOS, Y ÉSTE ES EL QUE NO TIENE LOS NÚMEROS
 *
 * Los valores por defecto —el `pt` de la fila, el `mb` del módulo, las pieles
 * del tema— **están en `src/app/kb.css`**, derivados por `npm run qa:kb-clases`
 * de los nodos cuyo dato los omite. Este fichero no repite ni uno: lo único que
 * hace es **emitir por variable lo que el dato SÍ trae**, y dejar que la hoja
 * ponga el resto.
 *
 * No es reparto de gusto, es lo que exige el original: el default de Divi
 * **cambia de unidad al apilar** (`2 %` en escritorio, `30px` plano a 390), y un
 * valor que se emita desde aquí gana en los dos anchos. Escribirlo en línea
 * sería un defecto de RANGO invisible a 1440 — el mismo modo de fallo que
 * §CONTRATO POR ANCHOS nombra.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Specs: `docs/research/articulos-kb/components/{cuerpo,modulos}.spec.md`,
 * medidas `kb-spec-{1440,390}.json` y `kb-tests.json` (**1519 pares nodo ×
 * propiedad**). Esto se escribe contra esos pares, no contra la impresión.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS TRES COSAS QUE HAY QUE SABER ANTES DE LEER UNA LÍNEA
 *
 * **1 · El ritmo llega CON UNIDAD, y por eso no hay `px` cableado.** El editor
 * escribió px absolutos **y** porcentajes, y a 1440 son el mismo número; los
 * separa que el default de Divi cambia de unidad al apilar. Un `%` se emite
 * como `%` —y el navegador lo resuelve contra el contenedor, que es lo que hace
 * el original— y un `px` como `px`. Traducir el `%` a px aquí sería el defecto
 * que `medida()` existe para impedir, con un disfraz más.
 *
 * **2 · El default NO se emite.** Un valor ausente = «nadie lo escribió» ⇒ lo
 * pone el CSS de la plantilla (`kb-fila`, `kb-modulo` en `globals.css`), que es
 * donde vive el default responsive de Divi — el único sitio donde puede vivir,
 * porque **cambia de unidad** entre escritorio y móvil (`2 %` → `30px` plano).
 *
 * **3 · El default de `mb` de un módulo depende del ANCHO DE LA FILA**, no del
 * tipo de columna (§2d.6, corrección medida contra un segundo arquetipo). Dentro
 * de KB la fila mide siempre 911.75, así que la tabla se reduce al tipo de
 * columna — y por eso **la resuelve la hoja** (`.kb-col-4_4 > .kb-modulo`) y no
 * este fichero: la clase sí sabe en qué columna cayó, porque el componente se lo
 * dice con `kb-col-<tipo>`. Emitirlo desde aquí obligaba a elegir un píxel de
 * escritorio y arrastrarlo a 390.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** `{valor, unidad}` → la cadena CSS. `null` = no lo escribió nadie. */
function css(m: MedidaKb | null | undefined): string | null {
  if (!m || m.valor === null || m.valor === undefined) return null;
  return m.unidad === "pct" ? `${m.valor}%` : `${m.valor}px`;
}

/** El override de móvil, si lo hay. Se emite por variable CSS, ver abajo. */
function cssMovil(m: MedidaKb | null | undefined): string | null {
  if (!m || m.movilValor === null || m.movilValor === undefined) return null;
  return m.movilUnidad === "pct" ? `${m.movilValor}%` : `${m.movilValor}px`;
}

/**
 * Las variables CSS del ritmo. **Se emiten como variables y no como propiedad
 * directa** porque un mismo hueco tiene hasta tres orígenes —el default de la
 * plantilla, el valor de escritorio y el de móvil— y sólo una cascada los
 * ordena bien: `globals.css` pone el default, la variable lo pisa si existe, y
 * la media query pisa la variable con la de móvil si existe.
 *
 * Poner `style={{ marginBottom }}` en línea haría **ganar siempre al valor de
 * escritorio**, incluso a 390 donde el original pone otro: es el modo de fallo
 * que §CONTRATO POR ANCHOS llama *defecto de rango* —un valor cableado donde el
 * original varía— y no se vería a 1440.
 *
 * ⚠ **El prefijo lo pone quien llama, y es obligatorio**: las custom properties
 * HEREDAN, así que un `--kb-mb` puesto en la fila lo verían sus columnas y sus
 * módulos — y un módulo sin `mb` propio cogería el de su fila en vez del default
 * de la hoja, **sin dar error y sólo en las filas que traen `mb`**. Con
 * `--kbf-*` / `--kbm-*` el hueco de cada nivel es suyo.
 */
function vars(prefijo: "kbf" | "kbm", pares: Record<string, MedidaKb | null | undefined>): CSSProperties {
  const s: Record<string, string> = {};
  for (const [k, m] of Object.entries(pares)) {
    const v = css(m);
    const mv = cssMovil(m);
    if (v !== null) s[`--${prefijo}-${k}`] = v;
    if (mv !== null) s[`--${prefijo}-${k}-movil`] = mv;
  }
  return s as CSSProperties;
}

/**
 * La PIEL de un titular → variables. Una propiedad ausente **no se emite**: es
 * lo que deja llegar el defecto del tema, que vive en `kb.css`. Traducirla aquí
 * a un valor «razonable» sería convertir «el editor no lo tocó» en «el editor
 * escribió esto», que es la §regla 6 al revés.
 *
 * `lh` se emite **sin unidad** (razón), que es como está medido y como Divi lo
 * escribe: `line-height: 1.25` sobre una `fs` de 44 da 55 y sobre 35 da 43.75,
 * que es exactamente lo que hace el original al apilar.
 */
function varsPiel(prefijo: string, p: PielKb | null | undefined): Record<string, string> {
  const s: Record<string, string> = {};
  if (!p) return s;
  if (p.fs !== null && p.fs !== undefined) s[`${prefijo}-fs`] = `${p.fs}px`;
  if (p.lh !== null && p.lh !== undefined) s[`${prefijo}-lh`] = `${p.lh}`;
  if (p.fw !== null && p.fw !== undefined) s[`${prefijo}-fw`] = `${p.fw}`;
  if (p.color) s[`${prefijo}-color`] = p.color;
  if (p.align) s[`${prefijo}-align`] = p.align;
  if (p.movilFs !== null && p.movilFs !== undefined) s[`${prefijo}-movil-fs`] = `${p.movilFs}px`;
  return s;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS MÓDULOS — los cinco kinds medidos, y ni uno más
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * El estilo en línea de un módulo: **sólo lo que el dato trae**. El default de
 * `mb` NO se emite aquí — lo pone `.kb-col-<tipo> > .kb-modulo` en la hoja, que
 * sabe en qué columna cayó porque el componente se lo dice.
 */
function estiloModulo(m: ModuloKb): CSSProperties {
  const s: Record<string, string> = {
    ...(vars("kbm", { mt: m.ritmo?.mt, mb: m.ritmo?.mb, pb: m.ritmo?.pb }) as Record<string, string>),
  };
  /* `anchoPct` — 85 · 50 · 40 medidos, defecto 100. La razón se conserva a los
   * dos anchos (test A en razón), así que se emite como % y no como px. Y con
   * él va el centrado: los márgenes medidos son (100 − pct)/2 en los 12, o sea
   * `auto` — lo aplica `.kb-ancho`, no un número. */
  if (m.anchoPct !== undefined && m.anchoPct !== null && m.anchoPct !== 100) s["--kbm-w"] = `${m.anchoPct}%`;
  return s as CSSProperties;
}

/** ¿lleva ancho de módulo? Decide la clase que activa el centrado. */
const conAncho = (m: ModuloKb) => m.anchoPct !== undefined && m.anchoPct !== null && m.anchoPct !== 100;

function Modulo({ m }: { m: ModuloKb }) {
  const style = estiloModulo(m);
  const ancho = conAncho(m) ? " kb-ancho" : "";

  switch (m.kind) {
    case "texto-kb":
      /**
       * `html` es el campo RICO del arquetipo (§2d.3): 16 etiquetas medidas
       * dentro de los 85 `et_pb_text`, 7 fuera de lo que el tipo compartido
       * expresa. Va crudo — es la frontera de `CLAUDE.md`: *a partir del
       * contenedor de contenido, el contenido lleva su estructura dentro*.
       */
      return (
        <div
          className={`kb-modulo kb-texto${ancho}`}
          /**
           * La piel de CADA nivel que el editor tocó, una variable por
           * propiedad. Divi da seis controles aquí (`h1`…`h6`) y por eso el dato
           * es un array por nivel — a diferencia del blurb, donde da uno.
           */
          style={{
            ...style,
            ...(m.titulares ?? []).reduce<Record<string, string>>(
              (acc, t) => ({ ...acc, ...varsPiel(`--kbh-${t.nivel}`, t) }),
              {},
            ),
          }}
          dangerouslySetInnerHTML={{ __html: m.html }}
        />
      );

    case "imagen-kb":
      /**
       * `.et_pb_image_wrap` es `inline-block` con `max-width: 100%` (21/21). Las
       * imágenes de 752 y 800 son **anchos intrínsecos**, no campo: la imagen es
       * más estrecha que su columna y no se estira. Por eso no hay `width:100%`.
       */
      return (
        <div className={`kb-modulo kb-imagen${ancho}`} style={style}>
          <span className="kb-imagen-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.src} alt={m.alt ?? ""} />
          </span>
        </div>
      );

    case "boton-kb":
      /**
       * Una sola piel en los 6 y a los dos anchos (`modulos.spec.md` §4), así
       * que va al componente **declarando que cero varianza no prueba
       * plantilla**: es SIN PROBAR de bajo riesgo, con denominador 6.
       */
      return (
        <div className={`kb-modulo kb-boton${ancho}`} style={style}>
          <a
            className="kb-boton-a"
            href={m.href}
            {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m.label}
          </a>
        </div>
      );

    case "blurb":
      /**
       * `et_pb_blurb_position_top` sale 36/36 y **no se cablea como campo**:
       * cero varianza no prueba plantilla. La retícula (`iconos` · `col-md-4` ·
       * `ninguna`) y la alineación sí son campos, con sus tres y dos valores.
       */
      return (
        <div
          className={`kb-modulo kb-blurb kb-blurb-${m.reticula ?? "iconos"} kb-al-${m.alineacion ?? "center"}${ancho}`}
          /* Aquí la piel es UN grupo, no un array: Divi da un solo control y por
             eso Divi mismo la compila contra `.et_pb_module_header`, no contra
             el nivel. Es lo que hizo que `qa:pieles` diera «0 overrides». */
          style={{ ...style, ...varsPiel("--kbb", m.piel) }}
        >
          {m.imagen && (
            <span className="kb-blurb-icono">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.imagen} alt={m.alt ?? ""} />
            </span>
          )}
          <Titular nivel={m.nivel ?? 4}>
            <span>{m.titulo}</span>
          </Titular>
          {m.descripcion && (
            <div className="kb-blurb-desc" dangerouslySetInnerHTML={{ __html: m.descripcion }} />
          )}
        </div>
      );

    case "gallery":
      /**
       * ⚠ **n = 1 en las 6 instancias.** Es la FAMILIA DE CALIBRACIÓN: con una
       * sola no se sabe qué es plantilla y qué es campo, así que esto reproduce
       * lo medido (6 items, `et_pb_gallery_grid`, centrado) y **no afirma nada
       * del arquetipo**. La segunda galería que aparezca se re-mide.
       */
      return (
        <div className={`kb-modulo kb-gallery${ancho}`} style={style}>
          {m.items.map((it, i) => (
            <figure key={i} className="kb-gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imagen} alt={it.alt ?? ""} />
              {it.titulo && <figcaption>{it.titulo}</figcaption>}
            </figure>
          ))}
        </div>
      );

    /**
     * ⚠ **El `default` que TIRA, y no es paranoia: el hueco ya se cobró una
     * corrida.** Un `switch` sin él devuelve `undefined`, y React renderiza
     * `undefined` **sin decir nada**: las 6 páginas salieron con sus filas, sus
     * columnas y **cero módulos**, con HTTP 200 y el build en verde, porque el
     * discriminador se llama `kind` y aquí ponía `blockType`.
     *
     * Es la §regla 6 en su forma más cara —una ausencia traducida a un valor
     * benigno, aquí «no pintes nada»— y el defecto se pone en la dirección que
     * GRITA: mejor una página que revienta que seis que mienten.
     */
    default: {
      const desconocido = m as { kind?: string };
      throw new Error(
        `CuerpoKb: módulo con \`kind\` desconocido ("${desconocido.kind}"). Los cinco medidos son ` +
          `texto-kb · imagen-kb · boton-kb · blurb · gallery. Ojo: el dato del CMS discrimina con ` +
          `\`kind\` (lo pone la VUELTA), no con el \`blockType\` que guarda Payload.`,
      );
    }
  }
}

/** `h2`…`h4` según el nivel medido del blurb (`h4`×27 · `h3`×9). */
function Titular({ nivel, children }: { nivel: number; children: ReactNode }) {
  const T = (`h${Math.min(Math.max(nivel, 2), 4)}` as "h2" | "h3" | "h4");
  return <T className="kb-blurb-titulo">{children}</T>;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA RETÍCULA DEL CUERPO — filas y columnas
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * La retícula de Divi: **los cuatro que este arquetipo ejercita están medidos**
 * (`4_4` 100 % · `1_2` 47.249465 % · `2_3` 64.832355 % · `1_3` 29.666466 %,
 * razón contra la fila de 911.75), y los otros cuatro son la retícula del tema
 * — **no los ejercita ninguna instancia de KB** y por eso están declarados en
 * `qa:nunca-vistos`, no verificados.
 *
 * ⚠ **Un `ancho` fuera de la tabla TIRA.** Un `?? "100%"` convertiría «no sé qué
 * es esto» en «ocupa la fila entera», y la fila saldría torcida sin un solo
 * error (§regla 6). La validación del esquema ya exige que los anchos sumen 1;
 * esto es la misma guarda del lado del render.
 */
const ANCHO_COLUMNA: Record<string, string> = {
  "4_4": "100%",
  "3_4": "73.625%",
  "2_3": "64.8333%",
  "3_5": "58.75%",
  "1_2": "47.25%",
  "2_5": "38.75%",
  "1_3": "29.6667%",
  "1_4": "20.875%",
};
function anchoDe(ancho: string): string {
  const v = ANCHO_COLUMNA[ancho];
  if (!v)
    throw new Error(
      `CuerpoKb: columna con \`ancho\` fuera de la retícula de Divi ("${ancho}"). ` +
        `Los ocho de la retícula son ${Object.keys(ANCHO_COLUMNA).join(" · ")}; ` +
        `los medidos en \`articulos-kb\` son 4_4 · 1_2 · 2_3 · 1_3.`,
    );
  return v;
}

/**
 * Una fila. El canal entre columnas —`margin-right` 50.1406 en toda columna que
 * no es la última y `0` en la última— es **regla posicional de la retícula, no
 * campo** (`MEDICION.md` §3.2): lo pone el CSS con `:not(:last-child)`, que es
 * exactamente lo que el original hace. Modelarlo como dato habría inventado un
 * `margenDerecho` por columna en el content type.
 *
 * `kb-col-<tipo>` no es decoración: es lo que le permite a la hoja resolver el
 * default de `mb` del módulo, que **depende del tipo de columna** (§2d.6).
 */
function Fila({ f }: { f: FilaKb }) {
  return (
    <div className="kb-fila" style={vars("kbf", { pt: f.pt, pb: f.pb, mt: f.mt, mb: f.mb })}>
      {f.columnas.map((c, i) => (
        <div
          key={i}
          className={`kb-columna kb-col-${c.ancho}`}
          style={{ "--kbc-w": anchoDe(c.ancho) } as CSSProperties}
        >
          {c.modulos.map((m, j) => (
            <Modulo key={j} m={m} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * El cuerpo entero: **la sección propia** y sus filas.
 *
 * ⚠ **La FILA OCULTA se emite aquí y no viene del dato.** `et_pb_row_0 d-none`
 * existe una por artículo, ocupa 0×0 y contiene el `<h1>Kunak Help Center</h1>`
 * — el **único `h1` de la página**, y está oculto en las 6
 * (`cascaron.spec.md` §3). No es contenido del artículo: es plantilla. Y hay
 * que emitirla, porque si no **el árbol no empareja** con el original: son 6 de
 * las 45 filas y el comparador las cuenta.
 *
 * ⚠ **`padding-top: 0` de la sección es un CAMPO UNIFORME**, no plantilla
 * probada: el default de Divi es 4 % y las 6 escriben 0, así que **alguien lo
 * escribió** — pero hay **una** sección por página, así que el test B no puede
 * confirmarlo y su silencio no es «no varía». Se emite declarándolo
 * (`cuerpo.spec.md` §3).
 */
export function CuerpoKb({ filas }: { filas: FilaKb[] }) {
  return (
    <div className="kb-seccion">
      {/* La fila oculta: `d-none`, 0×0, con el único `h1` de la página. */}
      <div className="kb-fila kb-fila-oculta">
        <div className="kb-columna kb-col-4_4" style={{ "--kbc-w": "100%" } as CSSProperties}>
          <div className="kb-modulo kb-texto">
            <h1>Kunak Help Center</h1>
          </div>
        </div>
      </div>
      {filas.map((f, i) => (
        <Fila key={i} f={f} />
      ))}
    </div>
  );
}
