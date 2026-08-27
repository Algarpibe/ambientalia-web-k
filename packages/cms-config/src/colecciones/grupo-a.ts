/**
 * GRUPO A — §2, §2.2, §2.4 y §2c. 209 páginas: blog 149 · término 37 ·
 * documento científico 23.
 *
 * ── Por qué son TRES colecciones y no una con discriminante ────────────────
 * §2.1: son **tres plantillas distintas**, no una. Difieren en estructura
 * (`row#2` ausente en término), en ritmo (`post_content mb` **72 en blog vs 0**
 * en las otras dos), en tipografía y en campos. Mismo criterio que cerró §1.5b.
 *
 * ── Y por qué NO hay ni un campo de presentación ───────────────────────────
 * **Cero varianza en 24 instancias** (ritmo, tipografía, retícula). Es el
 * RÉGIMEN: A es **plantillado**, así que la persona que decide el ritmo **no
 * existe** — una plantilla renderiza 149 entradas. Aplicar aquí el test de los
 * px absolutos daría la respuesta **invertida** (`CLAUDE.md` §régimen).
 */
import type { CollectionConfig, Field } from "payload";
import { campoHtml, conDefecto, imagenA, requeridoConVacio, seoA } from "../campos/comunes.ts";
import { cuerpoKb } from "../bloques/kb.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

/**
 * El «contrato de nacimiento» de LH-2 D3 — lo caro de re-migrar si falta.
 * **Sin `autor`**: no lo exige ningún listado (0/9 formas, 0 URLs de author en
 * `/es`) y el rótulo salió **idéntico en las 11 instancias medidas**, o sea
 * plantilla (§2.4 · 4).
 */
export const entradasBlog: CollectionConfig = {
  slug: "entradas-blog",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  // §4 · plano de `/es/` — las 149 entradas cuelgan de `/[slug]` de raíz.
  hooks: registroDeSlug({ familia: "entradas-blog" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    { name: "titulo", type: "text", required: true },
    // Verbatim, como lo escribe el original: «7 enero 2025».
    { name: "fechaPublicacion", type: "text", required: true },
    // «15 junio 2026» — presente en las 7 medidas, con el MISMO valor.
    { name: "fechaActualizacion", type: "text" },
    imagenA("imagenDestacada"),
    /**
     * Contrato D3: **derivación por defecto** (~267c del arranque + «…»).
     * LH-SP10 decide si alguno es manual. No está en `EntradaBlog` de
     * `types/kunak.ts` porque el clon no pinta listados todavía — el hueco va en
     * esa dirección, y por eso es un campo de más y no uno de menos.
     */
    { name: "extracto", type: "textarea" },
    // `category` — 1..n. El rótulo singular/plural se deriva del número.
    { name: "categorias", type: "relationship", relationTo: "categorias", hasMany: true, required: true, custom: { formaMedida: "objeto" } },
    { name: "etiquetas", type: "relationship", relationTo: "etiquetas", hasMany: true, custom: { formaMedida: "objeto" } },
    /**
     * `resources` — la categoría del hub de Recursos. **Decide la miga**: con
     * ella `Inicio › Recursos › Artículos y Guías › <hija> › título`; sin ella
     * `Inicio › Blog › título`. Medido en 7 instancias, 6 con y 1 sin.
     */
    { name: "recurso", type: "relationship", relationTo: "categorias-recursos", custom: { formaMedida: "objeto" } },
    /**
     * ⚠ **LA FIRMA — 117.ª. Es un ARRAY con PAPEL, y NO cabe en un campo
     * simple. Lo dice el dato, no la comodidad.**
     *
     * La `ficha-autor-revisor` del original aparece en **152 de 152** entradas
     * y el clon **no la pinta** (0 de 155 ficheros de código). De esas 152,
     * **150 traen un solo firmante y 2 traen DOS**, separando «Revisado y
     * aprobado por» de «Escrito por». Un `relationship` simple perdería el
     * segundo, y un `hasMany` sin papel perdería CUÁL es cuál.
     *
     * ── El orden NO es decorativo: es el HUECO ────────────────────────────
     * El primer elemento se pinta en el hueco `revisor` —que es **el que lleva
     * la foto**, 152 de 152— y el segundo en `autor`, que **no la lleva**,
     * 2 de 2. Así que el hueco se deriva de la POSICIÓN y no necesita campo.
     *
     * ── Y por qué `proemio` se GUARDA en vez de derivarse ─────────────────
     * Se midieron los dos modelos en vez de elegir uno
     * (§*un modelo se elige por lo que lo SEPARA, no por lo que acierta*):
     *
     *   proemio = f(autor, papel)          → **1** separadora · falla
     *   proemio = f(autor, papel, hueco)   → **0** separadoras · 8 de 8 triples
     *
     * Lo probado es que **(autor, papel) NO basta**. Que el triple sea *la*
     * función **no** lo está: se apoya en **UNA** instancia separadora, y
     * §*un discriminador hallado en una sola instancia tampoco es un
     * discriminador*. Así que el texto se guarda con su defecto derivado y se
     * **omite cuando coincide**: si la función es correcta el dato queda vacío
     * en las 152 y no cuesta nada; si es falsa, el original se replica igual.
     *
     * El defecto va **en la dirección que GRITA** (§sondas 6): derivarlo mal
     * serviría «Escrito por el» donde el original dice «Escrito por», en 2
     * páginas, y **ninguna guarda de este repo mira ese texto**.
     *
     * Evidencia: `ficha-autor-117.{mjs,log}` · `medidas/ficha-autor-117.json`.
     */
    {
      name: "firmas",
      type: "array",
      minRows: 1,
      required: true,
      fields: [
        /**
         * ⚠ **SIN `formaMedida: "objeto"`, y es una medida:** el dato medido
         * escribe aquí el **slug pelado** (`"kunak"`), no un término embebido
         * `{slug, nombre}` como hacen `categorias` o `etiquetas`. Declararlo
         * «objeto» haría que la VUELTA exigiera un poblado que nunca llega y
         * tirara con «RELACIÓN EMBEBIDA SIN POBLAR». Lo comprueba
         * `qa:cms-decl`, que deriva los mapas en LAS DOS DIRECCIONES.
         */
        { name: "autor", type: "relationship", relationTo: "autores", required: true },
        /**
         * Dos valores observados, los dos con su n: `escrito` **152** ·
         * `revisado` **2**. No es una taxonomía abierta — es el verbo del
         * proemio, y el barrido de las 152 no encontró un tercero.
         */
        {
          name: "papel",
          type: "select",
          required: true,
          defaultValue: "escrito",
          options: [
            { label: "Escrito por", value: "escrito" },
            { label: "Revisado y aprobado por", value: "revisado" },
          ],
        },
        /**
         * El texto servido con el nombre enlazado sustituido por `‹NOMBRE›`.
         * **Se omite cuando coincide con el derivado** — un valor por defecto
         * explícito y ausente en el dato cuando no aporta, que es lo que
         * `CLAUDE.md` §Consecuencia para el CMS pide para un campo de
         * presentación editorial.
         */
        { name: "proemio", type: "text" },
      ],
    },
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
    /**
     * «También te puede interesar». **83 de 149 lo llevan y no se sabe qué lo
     * decide** (A-SP1/A-SP2, sin causa identificada). Hasta que se sepa es un
     * campo: es lo único que varía entre instancias de la misma forma.
     */
    { name: "relacionados", type: "checkbox" },
  ],
};

export const terminosKunakpedia: CollectionConfig = {
  slug: "terminos-kunakpedia",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  // §4 · plano de `/es/` — los 37 términos comparten espacio con las 149 de blog.
  hooks: registroDeSlug({ familia: "terminos-kunakpedia" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    /**
     * ⚠ **`titulo` admite la cadena VACÍA aquí, y SÓLO aquí** (2026-08-12, tanda
     * de datos, PASO 4). `esmog` sirve el `<h1>` de plantilla vacío —**1 de 37**
     * términos, **0 de 149** entradas, **0 de 23** documentos— y `required` de
     * Payload no distingue `""` de la ausencia.
     *
     * Lo que se decide es de ESQUEMA y no de extractor: el campo declara que el
     * vacío es un valor legal. Lo que **no** se decide —y la tanda anterior hizo
     * bien en no inventarlo— es *«qué poner cuando está vacío»*: eso sería un
     * discriminador de una sola instancia.
     */
    requeridoConVacio({ name: "titulo", type: "text" } as Field, "§2c · `esmog`: el `<h1>` de plantilla vacío, 1 de 37"),
    /**
     * ⚠⚠ **`CMS-ORDEN-L2` · §7g — LA CLAVE DE ORDEN DE `/glosario/`, y es
     * TRANSCRIPCIÓN, no decisión de producto** (2026-08-18, 81.ª tanda).
     *
     * El original ordena su archivo por `datePublished` **DESC**: **37/37**
     * contra el orden SERVIDO, elegido con **36 posiciones separadoras** frente
     * a tres rivales. Sonda `qa:lh-fecha-orden`, negativo 4/4.
     *
     * ⚠ **El canal del orden son las OCHO páginas de `/glosario/`, no su
     * índice**: el índice sirve **5** tarjetas, así que un «37/37» leído de una
     * sola página sería un **5/5 disfrazado**. El control del negativo lo exige
     * (`paginasLeidas === 8`).
     *
     * `text` y no `date`, y el verbatim es el **ISO del JSON-LD** y no un
     * literal en español: el término **no pinta su fecha en ninguna parte**. La
     * diferencia de medio con `entradas-blog` va fichada en
     * `PENDIENTES-QA.md` §F3-LH-FECHA-DOS-FORMATOS — misma razón y mismo
     * cardinal que en `casos` (ver `grupo-c.ts`).
     *
     * **Requerido a propósito** (§sondas 6): lo traen **37 de 37**, y un
     * opcional que faltase dejaría el listado en un orden inventado **sin dar
     * error**, que es el defecto silencioso que esta tanda evita.
     */
    { name: "fechaPublicacion", type: "text", required: true },
    /**
     * **`tituloMiga` — el rótulo NO es el titular** (§2c.1, medido al cerrar
     * A-QA1). De las 14 instancias transcritas, **3 de 3 términos difieren** y
     * **11 de 11** blog/doc coinciden: el `h1` es el titular largo y el rótulo
     * el nombre corto del término.
     *
     * Y la parte que enseña: el término daba **−0.02** en el residuo del `h1`,
     * o sea «limpio». No lo estaba — a 390 el rótulo corto y el largo caen en 2
     * renglones igualmente, así que 218.47 px de diferencia de ANCHO **no
     * producían ni un píxel de alto**. Medida tapada, no acierto.
     *
     * El defecto es «el título»; `null` significa *usa el título*, y por eso el
     * defecto se escribe como ausencia y no como una copia del `h1`.
     */
    conDefecto({ name: "tituloMiga", type: "text" } as Field, null, "§2c.1 · 3 términos de 37"),
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
  ],
};

export const documentosCientificos: CollectionConfig = {
  slug: "documentos-cientificos",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /**
     * ⚠ **No es UN prefijo: son TRES** (§2.4 · 1), y el recon decía uno. Medido
     * en las 23: `documentos-cientificos/<categoría>` en 22 y
     * `estudios-cientificos/articulos-tecnicos` en **1**. Mismo mecanismo que
     * CMS-1: campo con defecto, omitido cuando coincide.
     */
    conDefecto(
      {
        name: "prefijo",
        type: "select",
        options: ["documentos-cientificos", "estudios-cientificos"],
      } as Field,
      "documentos-cientificos",
      "§2.4 · 1 de 23",
    ),
    // El segmento que va ANTES del slug. 3 términos confirmados.
    {
      name: "categoria",
      type: "relationship",
      relationTo: "categorias-cientificas",
      required: true,
      custom: { formaMedida: "objeto" },
    },
    seoA,
    { name: "titulo", type: "text", required: true },
    // §2.4 · 2: `text#2` trae ADEMÁS de portada y PDF `autores` y `anyo`
    // («Reche et al.» | 2020), que varían en las 4 instancias ⇒ campos.
    { name: "autores", type: "text", required: true },
    { name: "anyo", type: "text", required: true },
    imagenA("portada", { requerida: true }),
    // El PDF o la publicación externa. El rótulo va EN INGLÉS en el original.
    {
      name: "descarga",
      type: "group",
      fields: [
        { name: "href", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
  ],
};

/**
 * GRUPO D — §2d.1. **UNA colección nueva**, decidida por predicados
 * pre-registrados: 6 instancias, **1 sección propia las 6** ⇒ varianza cero ⇒
 * plantilla. Los 7 hubs quedan **fuera de colección**, en el casillero L4 de
 * LH-2 (página compuesta por instancia ⇒ cola larga, cero arquetipos).
 *
 * ⚠ **Los 4 kinds ausentes (`blurb`/`gallery`/`video`/`toggle`) NO se añaden
 * aquí**, y es deliberado: §2d.1 los deja «para cuando se construya», y
 * `MonoModulo` queda **intacto** — meterlos en `MonoSeccion[]` sería el arreglo
 * falso de §1.5b Razón 1 (P-K1 salió ❌: no aparecen en SECTOR/MONOGRÁFICO).
 * Hasta entonces el cuerpo usa **solo las definiciones compartidas**.
 *
 * > ✅ **CONSTRUIDO el 2026-08-09 (F3-1), y la mitad de arriba se cumple tal
 * > cual está escrita.** `blurb` y `gallery` entran por `MODULOS_KB` —**unión
 * > PROPIA de este arquetipo** (`bloques/kb.ts`), medida por `qa:kb-recon` sobre
 * > la captura de F3-0—, y `MonoSeccion[]` sigue **intacto**: `MODULOS_KB` no lo
 * > importa nadie más. `video`/`toggle` siguen fuera porque siguen sin darse
 * > aquí: son de los HUBS, y los hubs son cola larga (F3-3).
 *
 * ⚠ Y **no tenía contraparte medida en `src/lib`**: las 6 instancias no están
 * transcritas. **Eso deja de ser un problema y pasa a ser el punto**: es la
 * primera colección cuyo dato NACE en el CMS, sembrada desde la captura
 * congelada en vez de desde un catálogo de TypeScript. Su verificación no es
 * `qa:cms-campos` (que empareja contra `src/lib`) sino el comparador de dos
 * lados **contra el ORIGINAL** — `qa:kb-cmp`.
 */
export const articulosKb: CollectionConfig = {
  slug: "articulos-kb",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  // §4 · las 6 rutas entran en el plano de slugs igual que las demás familias.
  hooks: registroDeSlug({ familia: "articulos-kb" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    { name: "titulo", type: "text", required: true },
    /**
     * ⚠ **El prefijo es CAMPO, y lo dice la medida: hay DOS.**
     * `centro-de-ayuda/kunak-air/articulos-de-ayuda` (5) y
     * `soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda` (1). Es el
     * mismo hallazgo que en grupo A obligó al catch-all de `/recursos/[...ruta]`
     * — *«el prefijo tiene tres valores, no uno»*—, así que el slug NO basta
     * para construir la URL y el prefijo no se puede cablear en la ruta.
     */
    { name: "prefijo", type: "text", required: true },
    /**
     * ⚠ **`cuerpo` DEJA DE SER PLANO (2026-08-10, F3-1 PASO 1 · §2d.5).**
     *
     * Era `blocks` —una lista de módulos— y el original tiene **45 filas** en 6
     * instancias, repartidas en 1, 2 o 3 columnas con **cuatro repartos**
     * (`docs/research/articulos-kb/components/cuerpo.spec.md` §1). Una lista
     * plana no puede expresar «este texto y esta imagen van en dos columnas de
     * la misma fila», que es lo que hacen 14 de las 45. Es el **hueco 1** de
     * §2d.4, y no abría decisión: era trabajo.
     *
     * Lo que se guarda son las **39 filas visibles**; las 6 ocultas
     * (`et_pb_row_0 d-none`, con el `<h1>Kunak Help Center</h1>` dentro) las
     * emite el componente, porque **no son contenido del artículo**
     * (`cascaron.spec.md` §3).
     *
     * ── Los kinds que se ofrecen siguen siendo LOS MEDIDOS ─────────────────
     * `qa:kb-recon` censó los 6 artículos y salieron **cinco**: `text`×85 ·
     * `image`×21 · `button`×6 · `blurb`×36 · `gallery`×1. **No hay módulos
     * `titular` ni `claim`**: aquí los encabezados van DENTRO del texto, que es
     * justo lo que hace que su texto sea rico (§2d.3).
     *
     * ⚠ **Y desde esta tanda tampoco son los COMPARTIDOS de imagen y botón.**
     * Lo eran, y su ritmo es `number` —px implícitos— mientras que el de este
     * arquetipo lleva **unidad**: `MODULO_IMAGEN_KB` y `MODULO_BOTON_KB`
     * consumen los mismos campos de contenido (`CAMPOS_MODULO_IMAGEN`,
     * `CAMPOS_MODULO_BOTON`) sobre `moduloBaseKb`. Lo que se duplica es el
     * documento, no la definición.
     */
    cuerpoKb,
  ],
};
