/**
 * CAMPOS COMPARTIDOS — «lo que se duplica es el DOCUMENTO, no la DEFINICIÓN».
 *
 * Es la frase literal de `ESQUEMA-CMS.md` §1.5b y §2d.1, y es la razón de que
 * este fichero exista: `sectores` y `monograficos` comparten cabecera, miga,
 * hero, slider y cola comercial; `MonoModulo`, `articulos-kb` y el cuerpo de
 * `productos` comparten las definiciones de texto/imagen/botón y el ritmo.
 * Cambiar un campo común sigue siendo un cambio en un solo sitio.
 *
 * ── El patrón de la casa, y aquí está CONECTADO, no solo documentado ───────
 * `ESQUEMA-CMS.md` §1.5:
 *
 *   > cada campo de presentación editorial lleva **un defecto explícito** y se
 *   > **omite del dato cuando coincide** con él.
 *
 * La primera mitad es `defaultValue`. **La segunda mitad no la hace Payload
 * sola**: sin un hook, el valor por defecto se escribe en la fila y el dato
 * deja de distinguir «el editor eligió esto» de «nadie tocó nada». `conDefecto`
 * pone las dos mitades juntas — si solo pusiera `defaultValue`, este fichero
 * sería un caso más de *documentado no es conectado* (`CLAUDE.md` §sondas,
 * regla 3).
 */
import type { Block, Field } from "payload";
import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

/**
 * El tipo del adaptador de editor, nombrado a mano. El inferido apunta a una
 * ruta interna de `node_modules` y TS lo rechaza como **no portable** — con dos
 * apps consumiendo este paquete (CMS-0f), «no portable» no es teórico.
 */
type EditorLexical = ReturnType<typeof lexicalEditor>;

/* ══════════════════════════════════════════════════════════════════════════
 * EL DEFECTO EXPLÍCITO, CON SU OMISIÓN
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Marca un campo con su defecto **y hace que se omita del dato cuando
 * coincide**. Devuelve el campo, para poder envolverlo en línea.
 *
 * ⚠ Un campo `required` no puede omitirse: si tiene defecto obligatorio, el
 * defecto es plantilla y no campo. Se rechaza en vez de sustituirse en
 * silencio — `CLAUDE.md` §sondas regla 6 (*una ausencia se rechaza, no se
 * traduce a un valor benigno*).
 */
export function conDefecto<T extends Field>(
  campo: T,
  valor: unknown,
  fuente: string,
): T {
  if ("required" in campo && campo.required)
    throw new Error(
      `conDefecto: '${"name" in campo ? campo.name : "?"}' es required, así que no se puede omitir.\n` +
        `  Un defecto que no se puede omitir no distingue «el editor lo eligió» de\n` +
        `  «nadie lo tocó»: o el campo es opcional, o el valor es PLANTILLA y no va aquí.`,
    );
  const c = campo as Field & {
    defaultValue?: unknown;
    admin?: { description?: string };
    hooks?: { beforeChange?: unknown[] };
  };
  c.defaultValue = valor;
  c.admin = { ...(c.admin ?? {}), description: `Defecto ${JSON.stringify(valor)} — ${fuente}` };
  c.hooks = {
    ...(c.hooks ?? {}),
    beforeChange: [
      ...(c.hooks?.beforeChange ?? []),
      // La segunda mitad del patrón: coincidir con el defecto = no haber escrito.
      ({ value }: { value: unknown }) =>
        JSON.stringify(value) === JSON.stringify(valor) ? null : value,
    ],
  };
  return campo;
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CAMPO RICO — whitelist de §3.1, confirmada contra la versión INSTALADA
 *
 * §3.1 lo pedía explícitamente: *«los nombres de feature son los de Payload;
 * los identificadores exactos hay que confirmarlos contra la versión
 * instalada»*. Confirmado contra `@payloadcms/richtext-lexical@3.87.0`; lo que
 * la versión NO ofrece está anotado en `ESQUEMA-CMS.md` §3.1c (hallazgo de
 * esta tanda), no silenciado aquí.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Bloques tipados que viajan DENTRO del campo rico (§3.3b · §3.1b). */
export const BLOQUE_EMBED: Block = {
  slug: "embed",
  labels: { singular: "Embed", plural: "Embeds" },
  fields: [
    // §3.1: «embed, con URL (no `enum` de proveedor)» — 83 iframe · 18 hosts.
    { name: "url", type: "text", required: true },
    { name: "titulo", type: "text" },
    // El envoltorio de proporción de los `iframe` (§2b.1): es del nodo, no estilo de autor.
    { name: "proporcion", type: "text" },
  ],
};

export const BLOQUE_VIDEO: Block = {
  slug: "video",
  labels: { singular: "Vídeo", plural: "Vídeos" },
  fields: [
    // §3.1b: 8 `<video>` en 8 páginas (+2 `<embed>`).
    { name: "archivo", type: "upload", relationTo: "media" },
    { name: "url", type: "text" },
    { name: "poster", type: "upload", relationTo: "media" },
  ],
};

/**
 * **La PRIMERA de las dos listas del §3: lo que se puede escribir de aquí en
 * adelante.** Es el editor por defecto de la config (`payload.config.ts`), o sea
 * el que gobierna cualquier campo rico **nuevo** — no el corpus, que entra por
 * `campoHtml` (§3.1d, abajo).
 *
 * ⚠ Y esa separación es justo lo que hace inofensivos los tres huecos del
 * §3.1c: **`table` y `mark`/`small` NO están** —no por decisión, sino porque
 * `richtext-lexical@3.87.0` no trae feature para ellos—, y las **35 páginas con
 * tabla** del corpus ya no dependen de que existan: entran como HTML. §3.4
 * (¿nodo o block?) sigue abierta, pero **deja de bloquear la importación**.
 */
export const editorRico: EditorLexical = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    // §3.1: h2·h3·h4 sí (144·114·47); h1 y h5 residuales ⇒ NO.
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    UploadFeature({
      collections: {
        media: {
          // §3.1: «upload / imagen, con srcset, width, height y LEYENDA» — 83 con `wp-caption`.
          fields: [{ name: "leyenda", type: "text" }],
        },
      },
    }),
    LinkFeature({
      fields: ({ defaultFields }) => [
        ...defaultFields,
        // T1 (§3.2): 168/209 dependen de `<a class="et_pb_button">` para que un
        // enlace se vea como botón. Es un campo del nodo enlace, NO una clase.
        conDefecto(
          {
            name: "variante",
            type: "select",
            options: ["texto", "boton"],
          } as Field,
          "texto",
          "§3.2 T1 · 168/209",
        ),
      ],
    }),
    BlocksFeature({ blocks: [BLOQUE_EMBED, BLOQUE_VIDEO] }),
  ],
});

/* ══════════════════════════════════════════════════════════════════════════
 * EL CORPUS IMPORTADO — HTML CRUDO, que es donde CMS-0e aterriza (§3.1d)
 *
 * §3.1d dejó escrito el problema: *«un campo `richText` de Payload guarda JSON
 * de Lexical, no HTML, así que el importador no tiene dónde dejar el HTML crudo
 * mientras espera su conversión»*. Y avisaba de que **no se puede empezar a
 * importar sin resolverlo**, porque la primera entrada fija la respuesta de
 * facto. Se resuelve aquí, ANTES de la primera migración — que es el punto de
 * congelación real, no la primera entrada.
 *
 * ── El discriminador NO es mi criterio: es el TIPO MEDIDO ──────────────────
 * `types/kunak.ts` ya lo había decidido y nadie lo leyó al traducir:
 *
 *   · `CampoRico = string` y `CampoRicoEnLinea = string` → **son HTML**. Todo
 *     campo cuyo tipo medido sea uno de estos entra por aquí.
 *   · `MonoInline = string | MonoTrozo[]` → **no** es ninguno de los dos: es la
 *     unión que §1.5 dejó en dos formas y §1.5c resolvió por la rama rica. Sigue
 *     en Lexical (`editorNegrita`), y por eso `inline()` no desaparece.
 *
 * Así que la frontera de `CLAUDE.md` —*«a partir del contenedor de contenido el
 * contenido lleva su propia estructura dentro y se declara RICO: un solo campo
 * HTML, con un contrato de qué tiene que admitir»*— y CMS-0e piden lo mismo, y
 * el modelo medido ya lo decía. La traducción del bloque 2 fue la que se desvió.
 *
 * ── Y las DOS listas del §3, que no son la misma ───────────────────────────
 * §3 abre diciendo: *«lo que el editor permite escribir de aquí en adelante, y
 * lo que hay que hacerle al corpus al importarlo»*. `editorRico` es la primera
 * —sigue siendo el editor por defecto de la config, para contenido NUEVO—; esto
 * es la segunda.
 * ═════════════════════════════════════════════════════════════════════════ */

/* ⚠ **Y lo que este `validate` destapó al sembrar (2026-08-04, F2-2 bloque 1):**
 * **4 de las 7 entradas de blog transcritas traen `<script>` en el cuerpo** —el
 * reproductor de NBC, dos flipbooks FB3D y un embed de Instagram—, así que
 * **rechaza el seed**. Es la guarda funcionando, no un defecto: lo que estaba
 * mal era el PLAN, que puso los seeds en el bloque 1 y T4 en el bloque 2 cuando
 * **los seeds necesitan T4**. Acta: `PLAN-FASE-2.md` §F2-2 · FRONTERA (3). */

/**
 * El contrato del §3.1, escrito como dato y no como prosa: **las 43 etiquetas
 * censadas en 209/209** (`arquetipo-A/components/campo-rico.spec.md` §1).
 *
 * ⚠ Es lo que el campo tiene que **ADMITIR**, no una whitelist que se imponga:
 * el spec lo dice de las ausentes —*«que no aparezcan no significa que el campo
 * pueda prohibirlos»*— y vale igual del otro lado. Aquí vive para que «texto
 * rico» no sea la excusa de no haber mirado; la única prohibición está abajo.
 */
export const ETIQUETAS_CENSADAS = [
  "p", "span", "a", "div", "br", "h2", "sub", "strong", "li", "ul", "img",
  "h3", "em", "blockquote", "iframe", "b", "h4", "sup", "i", "table", "tbody",
  "tr", "td", "thead", "th", "ol", "script", "figure", "video", "source",
  "figcaption", "hr", "u", "section", "h1", "h5", "embed", "style", "center",
  "small", "noscript", "mark", "tfoot",
] as const;

/**
 * Lo ÚNICO que el contrato prohíbe, y no es cosa mía: §3.3 lo escribe como
 * regla —*«`script` no entra. En un CMS propio, script arbitrario dentro del
 * contenido no debe existir»*— y **T4** lo ejecuta al importar (*«ninguno
 * sobrevive como script»*; los 17 acaban en nodo-embed tipado (7) o en
 * eliminación documentada con sustitución (10)).
 *
 * Está como `validate` y no como comentario por la regla 3 (*documentado no es
 * conectado*): si T4 falla o se olvida, el alta tiene que **caer**, no colarse.
 * Es también la regla 6 — una ausencia de transformación se rechaza, no se
 * traduce a un valor benigno.
 */
const SIN_SCRIPT = /<\s*script\b/i;

/**
 * Campo de HTML crudo del corpus. `code` con `language: "html"` — el editor de
 * admin es un editor de código, que es exactamente lo que hay que enseñarle a
 * quien vaya a convertir una entrada: **el HTML es la fuente de verdad hasta
 * que esa entrada esté dada por buena** (CMS-0e).
 *
 * ⚠ **No es un campo de staging temporal.** Las dos formas que §3.1d dejó
 * abiertas —campo hermano `cuerpoHtml` que hay que retirar, o staging fuera de
 * Payload— resolvían el aterrizaje **a costa de** dos fuentes de verdad o de no
 * poder crear las relaciones. Ninguna hace falta: el tipo medido **ya es**
 * `string`, así que el campo definitivo y el sitio de aterrizaje son el mismo.
 */
export function campoHtml(name: string, { requerido = false } = {}): Field {
  return {
    name,
    type: "code",
    required: requerido,
    admin: {
      language: "html",
      description:
        "HTML del corpus (CMS-0e · §3.1). Admite las 43 etiquetas censadas en 209/209. " +
        "Prohibido `<script>` (§3.3 · T4). Rango medido: 275–69 784 caracteres.",
    },
    validate: (valor: unknown) => {
      if (typeof valor === "string" && SIN_SCRIPT.test(valor))
        return "§3.3 · T4: `<script>` no entra en el contenido. Los 17 del corpus van a nodo-embed tipado (7) o a eliminación con sustitución (10).";
      return true;
    },
  } as Field;
}

/**
 * Lo mismo, para el rico **de LÍNEA** — `CampoRicoEnLinea` de `types/kunak.ts`:
 * *«restringido a marcado de línea (`strong`, `b`, `i`, `br`, `sub`, `sup`,
 * `a`); sin bloques: no lleva `<p>` propio»*.
 *
 * Es el mismo `string` y el mismo contrato, así que **es el mismo mecanismo**;
 * lo que cambia es el inventario que se le exige, y por eso se separa: un campo
 * de línea con un `<h2>` dentro es un defecto de importación, no contenido.
 */
export function htmlLinea(name: string, { requerido = false } = {}): Field {
  return {
    name,
    type: "code",
    required: requerido,
    admin: {
      language: "html",
      description:
        "HTML de LÍNEA (`CampoRicoEnLinea`): strong · b · i · br · sub · sup · a. Sin bloques ni `<p>` propio.",
    },
    validate: (valor: unknown) => {
      if (typeof valor === "string" && SIN_SCRIPT.test(valor))
        return "§3.3 · T4: `<script>` no entra en el contenido.";
      return true;
    },
  } as Field;
}

/**
 * `MonoInline` — §1.5 lo deja en dos formas admisibles: *«texto rico acotado a
 * negrita, o un array tipado»*. **Elegida la primera**, y la razón está medida:
 * son **56 `<strong>` a mitad de frase** y lo que importa es dónde envuelven;
 * un array de trozos obliga al editor a partir la frase a mano para poner una
 * negrita. La elección queda registrada en §1.5c — no es libre, es una de las
 * dos que el esquema ya autorizaba.
 *
 * ⚠ **Y ES EL ÚNICO SUPERVIVIENTE de la tanda de §3.1d, con su porqué.** Todo
 * lo demás que era Lexical pasó a HTML crudo porque su tipo medido es
 * `CampoRico`/`CampoRicoEnLinea`, o sea **HTML importado del corpus**.
 * `MonoInline` no: es `string | MonoTrozo[]`, **dato tipado que el clon
 * transcribió a mano** en `lib/monografico.ts`, no un blob de WordPress. No hay
 * importación que aterrizar, así que CMS-0e no lo alcanza — su alcance es *«el
 * cuerpo entra crudo»*, y esto no es un cuerpo.
 */
export const editorNegrita: EditorLexical = lexicalEditor({
  features: () => [ParagraphFeature(), BoldFeature()],
});

/* ══════════════════════════════════════════════════════════════════════════
 * PIEZAS REUTILIZADAS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * SEO. `description` es **opcional** — corrección medida de §2b: falta en 4
 * casos y en las 19 FAQ. `canonical` **se deriva** de prefijo + slug y no se
 * guarda… salvo donde el tipo medido lo trae (SECTOR y MONOGRÁFICO lo llevan
 * en `src/lib`, así que allí es campo y aquí también: se modela lo medido).
 */
export function seo({
  description = true,
  ogImage = true,
  canonical = false,
}: { description?: boolean; ogImage?: boolean; canonical?: boolean } = {}): Field {
  const fields: Field[] = [{ name: "title", type: "text", required: true }];
  if (description) fields.push({ name: "description", type: "textarea" });
  if (ogImage) fields.push({ name: "ogImage", type: "text" });
  if (canonical) fields.push({ name: "canonical", type: "text" });
  return { name: "seo", type: "group", fields };
}

/** `SeoA` del grupo A: `description` falta en los 23 documentos científicos. */
export const seoA: Field = seo({ description: true, ogImage: true });

/** `SectorLink` — `external` solo si el destino es externo (regla de rutas locales). */
export function enlace(name: string, extra: Partial<Field> = {}): Field {
  return {
    name,
    type: "group",
    fields: [
      { name: "label", type: "text", required: true },
      { name: "href", type: "text", required: true },
      { name: "external", type: "checkbox" },
    ],
    ...extra,
  } as Field;
}

/** Lo mismo, como array (los 2 CTA del hero, siempre 2 en los 7 sectores). */
export function enlaces(name: string): Field {
  return {
    name,
    type: "array",
    fields: [
      { name: "label", type: "text", required: true },
      { name: "href", type: "text", required: true },
      { name: "external", type: "checkbox" },
    ],
  };
}

/**
 * `SectorImage { src, alt }`. **Los NOMBRES son los del tipo medido**; lo que
 * cambia es el tipo de `src`, que pasa de ruta en texto a relación con `media`
 * — que es la expresión Payload de «una ruta a una imagen» (§CMS-0b) y lo que
 * hace que T3 (§3.2) pueda cortar el acoplamiento con `wp-image-<id>`.
 */
export function imagen(name: string, { requerida = false } = {}): Field {
  return {
    name,
    type: "group",
    fields: [
      { name: "src", type: "upload", relationTo: "media", required: requerida },
      { name: "alt", type: "text" },
    ],
  };
}

/** `image: string` suelto (cabecera, CTA de descarga, franja del pie). */
export function subida(name: string, { requerida = false } = {}): Field {
  return { name, type: "upload", relationTo: "media", required: requerida };
}

/** `ImagenA` del grupo A — `srcset` es CAMPO, no adorno: es la causa de M-IMG. */
export function imagenA(name: string, { requerida = false } = {}): Field {
  return {
    name,
    type: "group",
    fields: [
      { name: "src", type: "upload", relationTo: "media", required: requerida },
      { name: "srcset", type: "text" },
      { name: "sizes", type: "text" },
      { name: "width", type: "text" },
      { name: "height", type: "text" },
      { name: "alt", type: "text" },
    ],
  };
}

/** Migas: Inicio / Sectores / [título]. El último va sin `href`. */
export const breadcrumb: Field = {
  name: "breadcrumb",
  type: "array",
  fields: [
    { name: "label", type: "text", required: true },
    { name: "href", type: "text" },
  ],
};

/** Cabecera del sector: foto a sangre con kicker y H1 encima. */
export const header: Field = {
  name: "header",
  type: "group",
  fields: [
    { name: "kicker", type: "text", required: true },
    { name: "title", type: "text", required: true },
    subida("image", { requerida: true }),
  ],
};

/** Diapositiva del CTA de ancho completo (3 en los 7 sectores, autoplay 7 s). */
export const ctaSlides: Field = {
  name: "ctaSlides",
  type: "array",
  fields: [
    { name: "heading", type: "text", required: true },
    enlace("cta"),
    subida("image"),
  ],
};

/**
 * La cola comercial que SECTOR y MONOGRÁFICO comparten byte a byte
 * (`CLAUDE.md` §Páginas clonadas: «comparten cabecera, banda de clientes,
 * breadcrumb, hero, slider, bloque K y pie — medido original contra original»).
 *
 * `posts` de `proyectos`/`articulos` son **relaciones**, no datos copiados:
 * `CaseStudy` y `BlogPost` son **proyecciones de teaser** del documento
 * relacionado (§2c.1), no campos de esta colección.
 */
export const colaComercial: Field[] = [
  ctaSlides,
  { name: "soluciones", type: "relationship", relationTo: "productos", hasMany: true },
  {
    name: "proyectos",
    type: "group",
    fields: [
      { name: "title", type: "text", required: true },
      enlace("cta"),
      { name: "posts", type: "relationship", relationTo: "casos", hasMany: true },
    ],
  },
  {
    name: "articulos",
    type: "group",
    fields: [
      { name: "title", type: "text", required: true },
      enlace("cta"),
      { name: "posts", type: "relationship", relationTo: "entradas-blog", hasMany: true },
    ],
  },
  enlace("taxonomy"),
  subida("footerStripImage"),
];

/* ══════════════════════════════════════════════════════════════════════════
 * RITMO — los overrides de Divi en px absolutos
 *
 * Omitido = el default responsive de la plantilla. Los defaults medidos viven
 * en `defaults.ts` con su procedencia; aquí solo está la FORMA.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `MonoRitmo` — sección y fila. **Va EN LÍNEA, no agrupado**, porque el tipo
 * medido lo trae así: `MonoSeccion extends MonoRitmo`. En el módulo, en cambio,
 * el ritmo es una propiedad con nombre (`ritmo?: MonoRitmoModulo`) y allí sí es
 * un grupo. La diferencia no es cosmética: cambia la ruta del campo, que es lo
 * que la comprobación de `qa:cms-campos` empareja.
 */
export const ritmoInline: Field[] = [
  { name: "mt", type: "number" },
  { name: "pt", type: "number" },
  { name: "pb", type: "number" },
];

/**
 * `MonoRitmoModulo`. `mbAlterno` es booleano y no un px **porque son dos
 * defaults responsive de Divi y el dato solo elige cuál**: 2.75 % (34.0469 /
 * 30) contra 3 % (37.1406 / 10.0469). No caben en `mb`.
 */
export const ritmoModulo: Field = {
  name: "ritmo",
  type: "group",
  fields: [
    { name: "mt", type: "number" },
    { name: "mb", type: "number" },
    { name: "pt", type: "number" },
    { name: "pb", type: "number" },
    { name: "pr", type: "number" },
    { name: "mbAlterno", type: "checkbox" },
  ],
};

/**
 * **`anchoPct` — ancho del módulo como % de su columna, defecto 100.**
 *
 * El campo que más altura movía y que ni el recon ni las specs midieron:
 * pintar al 100 % los `titular` que van al 80 % costaba **−55 por instancia**.
 * Valores medidos, iguales a 1440 y a 390: **70 · 80 · 90 · 100**.
 *
 * ⚠ Aquí **no vale** el test de los dos anchos: en Divi el ancho de módulo se
 * escribe en % igual que su default, así que se mueve con el ancho lo escriba
 * quien lo escriba. Lo delata el test B —varía de un módulo a otro dentro de
 * la misma página—. §6c.1 lo midió también en SECTOR (80 · 90 · 100 en las 4
 * instancias), así que es **el mismo campo en dos colecciones**.
 */
export const anchoPct: Field = conDefecto(
  { name: "anchoPct", type: "number" } as Field,
  100,
  "§1.5 · §6c.1 · clase-rango-{1440,390}.json",
);

/** Base de todo módulo: su ritmo y su ancho. */
export const moduloBase: Field[] = [ritmoModulo, anchoPct];
