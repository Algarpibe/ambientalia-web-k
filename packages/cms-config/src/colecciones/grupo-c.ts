/**
 * GRUPO C — §2b y §2b.1. 76 páginas: caso de éxito 57 · FAQ 19.
 *
 * **D1: caso y FAQ son DOS arquetipos** (firma de secciones, pie 4 vs 3, cuerpo
 * estructurado vs `entry-content` único — tres criterios F cuando bastaba uno),
 * y con `taxonomia-sectores` salen **tres colecciones**.
 *
 * Régimen **plantillado** (cabecera y pie por Theme Builder, cuerpo por PHP del
 * tema hijo), así que se aplica la lectura por varianza entre instancias: el
 * cascarón dio **varianza cero en las 76** y por eso aquí no hay ni un campo de
 * presentación. Lo que tiene un solo valor en las 57 es PLANTILLA y **no
 * aparece**: sobretítulo «Caso de éxito», los títulos «Necesidad · Solución ·
 * Resultados» y su orden, «Detalles del proyecto», «Soluciones», los 6 rótulos
 * y el singular/plural de `Sector(es):`, que se deriva del número de términos.
 */
import type { CollectionConfig } from "payload";
import { campoHtml, conDefecto, htmlLinea, seo, subida } from "../campos/comunes.ts";
import type { Field } from "payload";

/**
 * La taxonomía de 11 términos medida en los 57 casos. Es **propia del modelo,
 * no un espejo de la de WordPress**: C-SP3 (si allí es taxonomía real) sigue
 * abierta y no condiciona, porque el modelo es robusto a las dos respuestas.
 */
export const taxonomiaSectores: CollectionConfig = {
  slug: "taxonomia-sectores",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "nombre", type: "text", required: true },
    /**
     * ⚠ ALIAS de `TerminoSector.paginaSlug`. §2b lo modela como **relación
     * polimórfica opcional** a `sectores`/`monograficos` — el mecanismo que
     * §1.5b reserva justamente para esto: hay **11 términos y 8 páginas**
     * (Olores, Metalurgia, Sports y Obras no tienen). El slug deja de viajar
     * suelto y pasa a ser una referencia real.
     */
    {
      name: "pagina",
      type: "relationship",
      relationTo: ["sectores", "monograficos"],
    },
  ],
};

export const casos: CollectionConfig = {
  slug: "casos",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  fields: [
    // Único **a través de ambos prefijos** (D2): los 4 de `/case-studies/` son
    // contenido propio en español sobre la misma plantilla en los cinco ejes, y
    // la única diferencia es una palabra en la URL. Las migas del original lo
    // confirman: incluso las de los 4 ingleses apuntan al índice ESPAÑOL (C-SP8).
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /**
     * CMS-1. `select` con defecto, omitido cuando coincide — solo los 4 ingleses
     * lo escriben. Es el precedente que §2.4 reutilizó para el documento
     * científico, y el que §2e reutiliza para `padre`.
     */
    conDefecto(
      { name: "prefijo", type: "select", options: ["casos-de-exito", "case-studies"] } as Field,
      "casos-de-exito",
      "§2b · CMS-1 · D2 · 4 de 57",
    ),
    // `description` es OPCIONAL (corrección medida): falta en 4 casos. El
    // `canonical` se DERIVA de prefijo + slug y no se guarda.
    seo(),
    { name: "titulo", type: "text", required: true },
    /**
     * ⚠⚠ **`CMS-ORDEN-L2` · §7g — LA CLAVE DE ORDEN DE `/casos-de-exito/`, y es
     * TRANSCRIPCIÓN, no decisión de producto** (2026-08-18, 81.ª tanda).
     *
     * El original ordena su archivo por `datePublished` **DESC**, y está medido
     * contra el orden SERVIDO: **57/57**, elegido con **56 posiciones
     * separadoras** frente a tres rivales (`fecha-asc` · `alfabetico` ·
     * `orden-corpus`). Sonda `qa:lh-fecha-orden`, negativo 4/4.
     *
     * ── POR QUÉ `text` Y NO `date` ────────────────────────────────────────
     * Precedente de la casa (`entradas-blog.fechaPublicacion`, §2.4): la fecha
     * se guarda **verbatim como la sirve el original** y se parsea al ORDENAR
     * (`aEpoch` en `lib/cms/listados.ts`). Un `type: "date"` la normalizaría al
     * guardar, y normalizar es justo de lo que protege el contrato de fidelidad.
     *
     * ⚠ **Y AQUÍ EL MEDIO ES OTRO QUE EN BLOG, que es lo que hay que no
     * confundir:** en `entradas-blog` el verbatim es la fecha **RENDERIDA**
     * («7 enero 2025»), porque el original la pinta. En `casos` **no se pinta en
     * ninguna parte** —ni en la tarjeta de `L5` ni en el singular—: sólo existe
     * en el **JSON-LD**, en ISO 8601 (`2021-04-20T10:35:17+02:00`). Así que el
     * verbatim de este campo es **el ISO**, no un literal en español.
     *
     * Un mismo nombre con dos formatos es una inconsistencia real y va fichada
     * con su cardinal —**1 concepto · 2 formatos · 3 colecciones**— en
     * `PENDIENTES-QA.md` §F3-LH-FECHA-DOS-FORMATOS. No se unifica aquí porque
     * unificar toca `entradas-blog`, que está **poblada y verificada**.
     *
     * ── REQUERIDO A PROPÓSITO (§sondas 6: el defecto en la dirección que grita)
     * Hoy lo traen **57 de 57**, así que `required` no cuesta nada. Y lo que
     * compra es el fallo bueno: sin fecha, un opcional **no rompe nada y deja el
     * listado en un orden inventado** —silencioso, y exactamente el defecto que
     * esta tanda existe para evitar—; requerido **mata el seed en el acto**.
     */
    { name: "fechaPublicacion", type: "text", required: true },
    /**
     * La foto de la **banda de cabecera** (C-QA1). El original la pone como
     * `background-image` del `et_pb_section` de `header.et-l--header`. El alto
     * es `min-height: 387px` en **4 de 4** ⇒ plantilla; la **foto es distinta en
     * las 4** ⇒ campo. Obligatoria: las 4 medidas la traen.
     */
    subida("imagenCabecera", { requerida: true }),
    // 55 valores distintos en 57 ⇒ texto, no relación.
    { name: "cliente", type: "text", required: true },
    /**
     * 0..n términos (53/57; 4 casos con dos, 4 sin ninguno). **Un solo dato con
     * DOS proyecciones**: el chip bajo el cliente y la fila «Sector(es)» de
     * detalles. No existen aparte y faltan las dos juntas cuando el dato no está.
     */
    {
      name: "sectores",
      type: "relationship",
      relationTo: "taxonomia-sectores",
      hasMany: true,
      /* `vaciaEsAusente`: `CaseStudy.sectores?` es OPCIONAL en el tipo medido y
       * la ida lo ve faltar (3 de 4 casos lo traen). Ver §LA LISTA VACÍA de
       * `mapeo.mjs`: sin la declaración la vuelta emitiría `[]` contra una clave
       * que no está, y `qa:cms-roundtrip` fallaría por FORMA. */
      custom: { formaMedida: "objeto", vaciaEsAusente: true },
    },

    // Los tres bloques, obligatorios los tres (57/57). Contrato del §3.1, y
    // `CampoRico` ⇒ HTML del corpus, no Lexical (§3.1d).
    campoHtml("necesidad", { requerido: true }),
    campoHtml("solucion", { requerido: true }),
    campoHtml("resultados", { requerido: true }),

    /**
     * 49/57. **Rico en LÍNEA** — C-SP9 la cerró C-3: lleva `<strong>` y `<br>`,
     * así que el «texto plano mientras no se sepa» que escribió C-2 queda
     * resuelto por medición. Se renderiza como último hijo del contenedor de
     * `necesidad`, que es donde lo pone el original.
     */
    htmlLinea("destacado"),
    /**
     * 48/57; 3–15 imágenes, mediana 7. El carrusel es plantilla.
     *
     * C-SP10: el `alt` es **constante dentro de cada caso** (el mismo texto en
     * las 7 de Des Moines y en las 15 de Río) ⇒ es del caso, no de la imagen. Se
     * guarda por imagen igual, porque es donde vive en el medio.
     */
    {
      name: "galeria",
      type: "array",
      /* `CaseStudy.galeria?` — opcional en el tipo, y la ida la ve faltar en 2
       * de 4 casos. Ver `sectores` arriba. */
      custom: { vaciaEsAusente: true },
      fields: [
        { name: "src", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text" },
        { name: "width", type: "number" },
        { name: "height", type: "number" },
      ],
    },

    {
      name: "detalles",
      type: "group",
      fields: [
        { name: "usuario", type: "text", required: true },
        { name: "ubicacion", type: "text", required: true },
        // String, no number: el formato no está censado.
        { name: "anyo", type: "text", required: true },
        /**
         * 56/57. **RICO** — trae `ul li sub b p` dentro (§2b.1 · 2).
         *
         * ⚠ Y su trampa de migración, que no da error: el original escribe
         * `<p><span>Parámetros:</span><br><ul>…</ul></p>`, y `<ul>` dentro de
         * `<p>` es HTML inválido — el parser cierra el `<p>` antes del `<ul>`,
         * la lista queda de hermana, y un extractor ingenuo devuelve el campo
         * **vacío**. El importador recompone hasta el siguiente rótulo.
         */
        campoHtml("parametros"),
        // `cliente` y `sectores` NO están aquí: se PROYECTAN de los de arriba
        // (igualdad 57/57 y 53/53; ausencia conjunta 4/4).
      ],
    },

    /**
     * 56/57. **UN punto, no un array** — exactamente 1 marcador en las 56.
     * Reapertura escrita: el primer caso con 2 lo convierte en array.
     */
    {
      name: "ubicacionMapa",
      type: "group",
      fields: [
        { name: "lat", type: "number" },
        { name: "lng", type: "number" },
      ],
    },

    /**
     * 0..n productos (53/57; 3–10 por caso). El caso guarda **qué** productos;
     * **la ficha se proyecta del producto** — §2e cerró que son UNA colección,
     * así que esto no necesita relación polimórfica.
     */
    /* `CaseStudy.soluciones?` — opcional en el tipo, ausente en 1 de 4. */
    { name: "soluciones", type: "relationship", relationTo: "productos", hasMany: true, custom: { vaciaEsAusente: true } },
  ],
};

/**
 * La colección más simple del proyecto: cuatro campos y ninguno de caso.
 *
 * Su cascarón sí tiene una pieza que el modelo no mencionaba —`et_right_sidebar`
 * con 4 widgets (§2b.1 · 3)— pero **no añade campo**: es barato en CAMPOS, no en
 * cascarón. `description` y `ogImage` están **AUSENTES en las 19**: no se
 * inventan.
 */
export const faqs: CollectionConfig = {
  slug: "faqs",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seo({ description: false, ogImage: false }),
    { name: "titulo", type: "text", required: true },
    // 151–539 caracteres. Perfil medido `p ul li a span br sub` — §3.1 entero.
    campoHtml("cuerpo", { requerido: true }),
  ],
};
