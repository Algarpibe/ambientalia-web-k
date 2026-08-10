import type { CSSProperties, ReactNode } from "react";

import type {
  FilaKb,
  MedidaKb,
  ModuloKb,
  TipoColumnaKb,
} from "@/lib/cms/articulos-kb";
import { ANCHO_FILA_KB, mbPorDefectoKb } from "@/lib/cms/articulos-kb";

/**
 * EL CUERPO DE `articulos-kb` — la capa PROPIA, la del builder.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔ ESTE COMPONENTE SIGUE SIN RUTA — pero **ya no por un escalón**
 *
 * ✅ **El ESCALÓN de la tipografía está CERRADO** (2026-08-10,
 * `PENDIENTES-QA.md` §F3-1-ESCALON-TIPOGRAFIA · `ESQUEMA-CMS.md` §2d.7). Lo que
 * decía esta cabecera —*«ninguno de los 10 ejes servidos distingue las tres
 * pieles del `h2`»*— era cierto de los diez ejes **y falso del servido**: los
 * diez eran atributos y estructura, y **Divi no escribe marcado, compila CSS**.
 * Leído el `<style>` del propio documento, las tres pieles son **el DEFECTO del
 * tema (37/37 w300) y DOS overrides por módulo**, y lo mismo el `h3`.
 *
 * El campo existe (`titulares` en `texto-kb`, `piel` en `blurb`), está migrado y
 * la colección **está re-sembrada con él**: 21 pieles de titular y 36 de blurb,
 * verificadas en la DB.
 *
 * **Lo que falta ahora es CONSTRUCCIÓN, no decisión:**
 *
 *   1 · el CSS de este componente —las clases `kb-*` que usa **no existen
 *       todavía** en `globals.css`—, incluida la cascada de la piel:
 *       `.kb-texto h2 { font-size: var(--kb-h2-fs, 37px); … }` con su
 *       `@media (max-width:980px)` para `movilFs`, que es como Divi lo sirve;
 *   2 · el cascarón de KB (`cascaron.spec.md`: 5 secciones `_tb_`, barra lateral
 *       a la IZQUIERDA con 1 widget) y la ruta con sus **dos prefijos**;
 *   3 · y sólo entonces el Δ0 contra el sitio VIVO, con su sonda de dos lados.
 *
 * ⚠ **La piel se emite por VARIABLE CSS con defecto en la hoja, no en línea** —
 * por la misma razón que el ritmo (nota 1 de abajo): un `style={{fontSize}}`
 * ganaría también a 390, donde 11 de los 17 `h2` valen 35 y no 44. Sería un
 * defecto de RANGO invisible a 1440.
 *
 * Lo que sí queda hecho y medido está abajo: la retícula, el ritmo con unidad,
 * el default de `mb`, los cinco kinds y la fila oculta.
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
 * tipo de columna (§2d.6, corrección medida contra un segundo arquetipo). Aquí
 * la fila mide siempre 911.75, así que se resuelve con `mbPorDefectoKb`, que
 * es la misma función que usó el extractor — no una segunda copia.
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
 */
function vars(pares: Record<string, MedidaKb | null | undefined>): CSSProperties {
  const s: Record<string, string> = {};
  for (const [k, m] of Object.entries(pares)) {
    const v = css(m);
    const mv = cssMovil(m);
    if (v !== null) s[`--kb-${k}`] = v;
    if (mv !== null) s[`--kb-${k}-movil`] = mv;
  }
  return s as CSSProperties;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS MÓDULOS — los cinco kinds medidos, y ni uno más
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **El `mb` por defecto se emite EXPLÍCITO cuando el dato lo omite**, y no es
 * una contradicción con la nota 2 de arriba: el default de un módulo depende
 * del tipo de su columna, así que **no se puede escribir en una clase CSS** — la
 * clase no sabe en qué columna cayó. Lo que sí se conserva es la regla: el dato
 * lo omite (es plantilla) y el componente lo resuelve.
 */
function estiloModulo(m: ModuloKb, tipoColumna: TipoColumnaKb): CSSProperties {
  const def = mbPorDefectoKb(ANCHO_FILA_KB, tipoColumna);
  const s: Record<string, string> = {
    ...(vars({ mt: m.ritmo?.mt, mb: m.ritmo?.mb, pb: m.ritmo?.pb }) as Record<string, string>),
  };
  if (s["--kb-mb"] === undefined) {
    s["--kb-mb"] = `${def.px1440}px`;
    s["--kb-mb-movil"] = `${def.px390}px`;
  }
  /* `anchoPct` — 85 · 50 · 40 medidos, defecto 100. La razón se conserva a los
   * dos anchos (test A en razón), así que se emite como % y no como px. */
  if (m.anchoPct !== undefined && m.anchoPct !== null && m.anchoPct !== 100) s.width = `${m.anchoPct}%`;
  return s as CSSProperties;
}

function Modulo({ m, tipoColumna }: { m: ModuloKb; tipoColumna: TipoColumnaKb }) {
  const style = estiloModulo(m, tipoColumna);

  switch (m.blockType) {
    case "texto-kb":
      /**
       * `html` es el campo RICO del arquetipo (§2d.3): 16 etiquetas medidas
       * dentro de los 85 `et_pb_text`, 7 fuera de lo que el tipo compartido
       * expresa. Va crudo — es la frontera de `CLAUDE.md`: *a partir del
       * contenedor de contenido, el contenido lleva su estructura dentro*.
       */
      return (
        <div className="kb-modulo kb-texto" style={style} dangerouslySetInnerHTML={{ __html: m.html }} />
      );

    case "imagen-kb":
      /**
       * `.et_pb_image_wrap` es `inline-block` con `max-width: 100%` (21/21). Las
       * imágenes de 752 y 800 son **anchos intrínsecos**, no campo: la imagen es
       * más estrecha que su columna y no se estira. Por eso no hay `width:100%`.
       */
      return (
        <div className="kb-modulo kb-imagen" style={style}>
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
        <div className="kb-modulo kb-boton" style={style}>
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
          className={`kb-modulo kb-blurb kb-blurb-${m.reticula ?? "iconos"} kb-al-${m.alineacion ?? "center"}`}
          style={style}
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
        <div className="kb-modulo kb-gallery" style={style}>
          {m.items.map((it, i) => (
            <figure key={i} className="kb-gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imagen} alt={it.alt ?? ""} />
              {it.titulo && <figcaption>{it.titulo}</figcaption>}
            </figure>
          ))}
        </div>
      );
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

/** `4_4` → 100 % · `1_2` → 47.25 % · `2_3` → 64.833 % · `1_3` → 29.6667 %. */
const ANCHO_COLUMNA: Record<string, string> = {
  "4_4": "100%",
  "3_4": "73.625%",
  "2_3": "64.833%",
  "3_5": "58.75%",
  "1_2": "47.25%",
  "2_5": "38.75%",
  "1_3": "29.6667%",
  "1_4": "20.875%",
};

/**
 * Una fila. El canal entre columnas —`margin-right` 50.1406 en toda columna que
 * no es la última y `0` en la última— es **regla posicional de la retícula, no
 * campo** (`MEDICION.md` §3.2): lo pone el CSS con `:not(:last-child)`, que es
 * exactamente lo que el original hace. Modelarlo como dato habría inventado un
 * `margenDerecho` por columna en el content type.
 */
function Fila({ f }: { f: FilaKb }) {
  return (
    <div className="kb-fila" style={vars({ pt: f.pt, pb: f.pb, mt: f.mt, mb: f.mb })}>
      {f.columnas.map((c, i) => (
        <div
          key={i}
          className="kb-columna"
          style={{ "--kb-col": ANCHO_COLUMNA[c.ancho] ?? "100%" } as CSSProperties}
        >
          {c.modulos.map((m, j) => (
            <Modulo key={j} m={m} tipoColumna={c.ancho} />
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
        <div className="kb-columna" style={{ "--kb-col": "100%" } as CSSProperties}>
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
