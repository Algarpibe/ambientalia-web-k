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
 * LA ALLOWLIST DE HOSTS DE EMBEBIDO — **FIRMADA** (§3.3b, 2026-08-04): los 18
 * hosts del censo 209/209 (`medidas/a-embeds.json`), comparados **por HOST,
 * nunca por proveedor** — el caso `flo.uri.sh`: una lista por nombre de
 * proveedor no habría reconocido a su propio proveedor (Flourish).
 *
 * ⚠ **Procedimiento de alta (parte de la firma):** un host nuevo entra
 * añadiéndose AQUÍ con un comentario de una línea —quién lo pidió y para qué
 * contenido—. Mientras no esté, el saneador lo rechaza NOMBRÁNDOLO. El alta es
 * un cambio de código revisable, no una excepción silenciosa.
 *
 * Alcance firmado: **grupo A + grupo C censados** (AMPLIACIÓN 2026-08-05, ver
 * abajo). Los iframes del grupo C están censados por host en
 * `medidas/c-embeds.json` (C-SP6); un host que ese censo traiga de más entra
 * por este procedimiento, no re-firmando la lista.
 */
export const HOSTS_PERMITIDOS = [
  // ── Tramo A · grupo A (censo 209/209, `medidas/a-embeds.json`, firma 2026-08-04)
  "youtube.com", "ourworldindata.org", "canva.com", "docs.google.com",
  "experience.arcgis.com", "facebook.com", "storymaps.arcgis.com",
  "europeanbiogas.clicdata.com", "linkedin.com", "google.com", "google.es",
  "shipmap.org", "elliotcloud.portsdebalears.com", "flo.uri.sh",
  "geoportal.madrid.es", "data.worldbank.org", "essic.umd.edu",
  "real-decreto-2142025-un--0qvqhh6.gamma.site",

  /* ── Tramo C · grupo C (censo 76/76, `medidas/c-embeds.json`, C-SP6) ────────
   * AMPLIACIÓN firmada por el propietario del sitio el 2026-08-05, con el MISMO
   * criterio de la firma del 04-08 —los hosts CENSADOS, cero pérdida medida—
   * aplicado al censo que entonces no existía. Los 3 son contenido real de las
   * fichas de caso; el alta la pide el propietario para importar el grupo C.
   *
   * ⚠ `googletagmanager.com` queda FUERA con su evidencia: **76 iframes en
   * 76/76 páginas** ⇒ es el `<noscript>` de GTM que el tema mete en el
   * CASCARÓN, no contenido (regla 4, el pleno: un patrón que casa en todas no
   * mide contenido). §3.3: cero analítica dentro del contenido. Jamás
   * candidato a alta. */
  "kunakcloud.com",     // widget propio de Kunak (World Athletics · Running for Clean Air) — 2 iframes
  "player.vimeo.com",   // vídeo del caso World Athletics — 1 iframe
  "dailymotion.com",    // vídeo del caso Calle 30 Natura — 1 iframe
] as const;

/* ══════════════════════════════════════════════════════════════════════════
 * EL SANEADOR EN ESCRITURA — el contrato censado, ejecutado en el `validate`
 *
 * Dos guardas además de `<script>`, cada una contra su dato medido:
 *
 *   · **etiqueta fuera del censo** (§3.1, 43 etiquetas en 209/209) → rechazo
 *     NOMBRÁNDOLA. «Lo que no está en el censo no entra»: una etiqueta nueva no
 *     es un error de quien escribe, es un dato que el censo no tiene — y por
 *     eso se rechaza con nombre, para que la decisión de admitirla sea visible;
 *   · **host de iframe fuera de la allowlist firmada** (§3.3b) → rechazo
 *     NOMBRÁNDOLO. La comparación es por HOST del `src`/`data-src` (Divi
 *     difiere iframes y el `src` llega vacío — precedente de `a-embeds`).
 *
 * Viven aquí exportadas —no dentro del `validate`— porque el extractor del
 * corpus comprueba EL MISMO contrato offline: dos copias de la whitelist serían
 * la clase C7 (dos definiciones de «lo mismo»).
 * ═════════════════════════════════════════════════════════════════════════ */

/** Solo nombres de etiqueta REALES: sin hueco tras `<` (como el parser HTML). */
const RE_ETIQUETA = /<\/?([a-zA-Z][a-zA-Z0-9-]*)(?=[\s/>])/g;
const CENSO = new Set<string>(ETIQUETAS_CENSADAS);

export function etiquetasFueraDelCenso(html: string): string[] {
  const fuera = new Set<string>();
  for (const m of html.matchAll(RE_ETIQUETA)) {
    const tag = m[1].toLowerCase();
    if (!CENSO.has(tag)) fuera.add(tag);
  }
  return [...fuera].sort();
}

const RE_IFRAME = /<iframe\b[^>]*>/gi;
const PERMITIDOS = new Set<string>(HOSTS_PERMITIDOS);

export function hostsFueraDeAllowlist(html: string): string[] {
  const fuera = new Set<string>();
  for (const m of html.matchAll(RE_IFRAME)) {
    const src =
      /\bsrc\s*=\s*"([^"]+)"/i.exec(m[0])?.[1] ?? /\bdata-src\s*=\s*"([^"]+)"/i.exec(m[0])?.[1] ?? "";
    let host: string;
    try {
      host = new URL(src, "https://kunakair.com/").host.replace(/^www\./, "");
    } catch {
      host = "(url ilegible)";
    }
    if (!PERMITIDOS.has(host)) fuera.add(host);
  }
  return [...fuera].sort();
}

/** El `validate` compartido de los campos de HTML del corpus. */
export function validaHtmlCorpus(valor: unknown): true | string {
  if (typeof valor !== "string") return true;
  if (SIN_SCRIPT.test(valor))
    return "§3.3 · T4: `<script>` no entra en el contenido. Los 17 del corpus van a nodo-embed tipado (7) o a eliminación con sustitución (10).";
  const etiquetas = etiquetasFueraDelCenso(valor);
  if (etiquetas.length)
    return `§3.1: etiqueta(s) fuera del censo de 43 — ${etiquetas.map((t) => `<${t}>`).join(", ")}. Lo que no está en el censo no entra; si es legítima, se admite AÑADIÉNDOLA al censo con su evidencia, no colándola.`;
  const hosts = hostsFueraDeAllowlist(valor);
  if (hosts.length)
    return `§3.3b: host(s) de iframe fuera de la allowlist firmada — ${hosts.join(", ")}. Un host nuevo entra por el procedimiento de alta (HOSTS_PERMITIDOS), no en silencio.`;
  return true;
}

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
    validate: validaHtmlCorpus,
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
    /* El mismo saneador que el campo de bloque: sus tres guardas valen para
     * línea (las etiquetas de línea son subconjunto de las 43). Lo que NO se
     * impone es el inventario de línea en sí —su corpus del CPT está SIN
     * CENSAR (§3.1d)— por la misma regla que alineación/indentación en §3.1:
     * sin medir no se restringe a ciegas. */
    validate: validaHtmlCorpus,
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
export function subida(name: string, { requerida = false, centinelaVacio = false } = {}): Field {
  return {
    name,
    type: "upload",
    relationTo: "media",
    required: requerida,
    /**
     * ⚠ **CMS-0g · `centinelaVacio`: el dato medido escribe `""` para decir «no
     * hay imagen».** `mapeo.mjs` ya lo trata como transformación de FORMA y la
     * IDA lo apuntaba en un `Set` del proceso; desde F2-3 la VUELTA corre en el
     * RENDER, donde no hay ida que lo apunte. Se declara aquí, y `qa:cms-decl`
     * comprueba que la declaración coincide con lo que la ida deriva —si no,
     * sería *documentado no es conectado* en el esquema.
     */
    ...(centinelaVacio ? { custom: { centinelaVacio: true } } : {}),
  };
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

/* ══════════════════════════════════════════════════════════════════════════
 * EL TEASER — ⚠ DECIDIDO el 2026-08-04: **dato propio, NO relación.**
 *
 * ── Lo que decía antes, y por qué se cae ──────────────────────────────────
 * Este fichero afirmaba: *«`posts` de `proyectos`/`articulos` son relaciones, no
 * datos copiados: `CaseStudy` y `BlogPost` son proyecciones de teaser del
 * documento relacionado»*. Nadie lo había medido. Medido, se cae por dos sitios
 * independientes — y basta cualquiera de los dos.
 *
 * **1 · El destino no existe para casi ninguno.** `medidas/sondeo-frontera.json`:
 * de los **34** teasers del dato medido, **31 apuntan a un documento que el clon
 * no tiene** (24 slugs distintos). Es **el precedente DIRECTO de §2e `padre`**,
 * que se resolvió igual y por lo mismo: *«`cartuchos-inteligentes` NO es una URL
 * del CPT, así que 17 de 18 hijos apuntarían a un documento inexistente —
 * relación pura no vale»*. Allí eran 17 de 18; aquí **31 de 34**.
 *
 * **2 · Y aunque existiera, el `date` no se deriva.** `medidas/cms-teaser.json`
 * comparó los **3** pares en que el destino SÍ está transcrito, campo a campo, y
 * el resultado es más estrecho de lo que nadie había escrito:
 *
 * | campo | veredicto |
 * |---|---|
 * | `title` · `client` · `sector` | **IDÉNTICO** — derivables |
 * | `image` · `href` · `sectorHref` | **POR REGLA** — los explican M-IMG y el §4, ya decididos |
 * | **`date`** | **DISTINTO** — `"Mar 25, 2026"` en el teaser, `"25 marzo 2026"` en el documento |
 *
 * O sea: **lo único que impide derivar el teaser es la fecha.** Y no lo decide
 * el modelo, lo decide el **contrato de fidelidad** (`CLAUDE.md` §1: textos
 * verbatim, erratas incluidas): `fechaPublicacion` es `string` *a propósito*.
 * Derivar una renderización de la otra exige parsear y re-formatear, y
 * re-formatear **normaliza en silencio cualquier errata del original** — que es
 * exactamente de lo que «verbatim» protege. No es una transformación que falte:
 * es una que el contrato prohíbe.
 *
 * ── ⚠ LA CONSECUENCIA, SIN TAPAR ──────────────────────────────────────────
 *
 *   > **El teaser NO se actualiza cuando cambia el documento destino.** Quien
 *   > edite el título de un caso en el CMS tiene que editarlo **también** en las
 *   > páginas de sector que lo muestran. Es un coste editorial real, recurrente,
 *   > y va en la documentación de traspaso de F2-5 — no en una nota de código.
 *
 * Se elige aun así porque la alternativa no es «teaser vivo»: es **no poder
 * sembrar 31 de 34** hasta que los 57 casos y las 149 entradas estén dentro, y
 * aun entonces seguir sin poder reproducir la fecha.
 *
 * ── EL FALSADOR, que es ejecutable ────────────────────────────────────────
 * `npm run qa:cms-teaser`. **Esta decisión se cae si `date` deja de salir
 * DISTINTO**: o porque `fechaPublicacion` deje de guardarse verbatim, o porque
 * un formateador reproduzca las dos renderizaciones **en todo el corpus**, no en
 * una muestra. Mientras ese campo salga DISTINTO, guardar el teaser es lo único
 * que conserva el dato.
 *
 * ⚠ Y la asimetría del alcance va dicha: **3 pares comparables de 34.** Un
 * DISTINTO basta para falsar la derivación; un IDÉNTICO en 3 pares **no** prueba
 * derivabilidad universal. Por eso el veredicto se apoya en el DISTINTO, que es
 * el lado que sí concluye.
 * ═════════════════════════════════════════════════════════════════════════ */

/** `CaseStudy` — el teaser de caso, tal cual lo mide el clon. */
const teaserCaso: Field = {
  name: "posts",
  type: "array",
  admin: { description: "Teaser VERBATIM, no proyección: no se actualiza solo si cambia el caso (§F2-2 · TEASER)." },
  fields: [
    { name: "client", type: "text", required: true },
    { name: "sector", type: "text", required: true },
    { name: "sectorHref", type: "text" },
    { name: "title", type: "text", required: true },
    subida("image", { requerida: true }),
    { name: "href", type: "text", required: true },
  ],
};

/** `BlogPost` — el teaser de entrada. `date` es el campo que impide derivarlo. */
const teaserEntrada: Field = {
  name: "posts",
  type: "array",
  admin: { description: "Teaser VERBATIM, no proyección: no se actualiza solo si cambia la entrada (§F2-2 · TEASER)." },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "date",
      type: "text",
      required: true,
      admin: {
        description:
          'Fecha VERBATIM en la forma del teaser ("Mar 25, 2026"). El documento la escribe de otra ' +
          'forma ("25 marzo 2026") y las dos son verbatim: no se derivan la una de la otra.',
      },
    },
    subida("image", { requerida: true }),
    { name: "href", type: "text", required: true },
    { name: "excerpt", type: "textarea" },
  ],
};

/**
 * La cola comercial que SECTOR y MONOGRÁFICO comparten byte a byte
 * (`CLAUDE.md` §Páginas clonadas: «comparten cabecera, banda de clientes,
 * breadcrumb, hero, slider, bloque K y pie — medido original contra original»).
 */
export const colaComercial: Field[] = [
  ctaSlides,
  /**
   * ⚠ **CMS-0g · `formaMedida: "objeto"`, y lo encontró la guarda.** SECTOR y
   * MONOGRÁFICO embeben el `Product` ENTERO aquí; el caso de éxito
   * (`grupo-c.ts`) guarda sólo el slug en un campo del mismo nombre. Sin la
   * declaración la vuelta devolvería el slug en las dos, perdiendo el término.
   *
   * Y ése es exactamente el motivo de que la llave sea **(colección, ruta)** y
   * no la ruta a secas: tres colecciones tienen un campo `soluciones` y la
   * clave sin prefijo las colapsaba en una — la clase C7, dos definiciones de
   * «lo mismo» escritas como una.
   */
  { name: "soluciones", type: "relationship", relationTo: "productos", hasMany: true, custom: { formaMedida: "objeto" } },
  {
    name: "proyectos",
    type: "group",
    fields: [{ name: "title", type: "text", required: true }, enlace("cta"), teaserCaso],
  },
  {
    name: "articulos",
    type: "group",
    fields: [{ name: "title", type: "text", required: true }, enlace("cta"), teaserEntrada],
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

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA MEDIDA — un valor de ritmo NO ES UN NÚMERO: es un número CON UNIDAD
 *
 * ── Qué obliga a esto, y por qué el error era invisible ────────────────────
 * `docs/research/articulos-kb/components/cuerpo.spec.md` §2.1, medido a los dos
 * anchos sobre las 45 filas y los 149 módulos de KB: **el editor escribió px
 * absolutos Y porcentajes en el mismo hueco**, y
 *
 *   > **a 1440 son EL MISMO NÚMERO.**
 *
 * | par medido | qué es |
 * |---|---|
 * | `18.2344 → 30`      | el **default** de Divi (`2 %`, que al apilar pasa a `30px` PLANO) |
 * | `18.2344 → 6.70312` | **campo**: el editor escribió `2 %` — y el `%` sigue siendo `%` a 390 |
 * | `45.5781 → 16.7656` | campo `5 %` · `7.28125 → 2.67188` campo `0.8 %` · `3.64062 → 1.32812` campo `0.4 %` |
 * | `7 · 14 · 17 · 19 · 20 · 25 · −2 · −21` | campo, px absolutos (test A) |
 *
 * Un campo `number` fuerza a elegir una de las dos lecturas **y no deja rastro
 * de cuál se eligió**: el dato queda ambiguo POR CONSTRUCCIÓN, y el error no se
 * ve al ancho al que se calibra. Es la §regla 6 en el esquema —*un valor por
 * defecto convierte «no lo sé» en «está bien»*—, con la unidad como el valor
 * implícito.
 *
 * ── Cómo se lee el dato ────────────────────────────────────────────────────
 * · `valor` **ausente** = nadie lo escribió ⇒ el render aplica el default
 *   responsive de Divi (que cambia de unidad al apilar, y por eso NO se puede
 *   representar como un valor de este campo);
 * · `valor` presente ⇒ `unidad` es **obligatoria**. Se rechaza en vez de
 *   suponerse `px`: suponerla es exactamente el defecto que este campo corrige;
 * · `movilValor` ausente = **hereda** el de escritorio (la cascada de Divi);
 *   presente = override de móvil, y entonces `movilUnidad` es obligatoria.
 *
 * ⚠ **Alcance de lo EJERCITADO, declarado (§regla del caso no ejercitado):** la
 * rama `movil*` la ejercitan **4 pares del nivel de MÓDULO** en KB
 * (`34.0469 → 0` ×10 · `13 → 0` · `45 → 0` · `mt −18 → 0` ×14). **A nivel de
 * FILA no la ejercita nadie** en las 45 filas medidas: es legal en Divi y es un
 * camino de render sin estrenar, y por eso se declara aquí en vez de suponerse
 * soportado. Lo cuenta `npm run qa:nunca-vistos`.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Las dos unidades que el dato medido usa. `pct` y no `%`: es un valor de enum. */
export const UNIDADES_MEDIDA = ["px", "pct"] as const;

/** `unidad` es obligatoria en cuanto hay `valor`, y no se sustituye por `px`. */
function unidadDe(nombreValor: string, etiqueta: string): Field {
  return {
    name: nombreValor === "valor" ? "unidad" : "movilUnidad",
    type: "select",
    options: [...UNIDADES_MEDIDA],
    admin: { description: `Obligatoria si hay ${etiqueta}. Sin ella el dato es ambiguo a 1440.` },
    validate: (valor: unknown, opciones: unknown) => {
      const hermano = (opciones as { siblingData?: Record<string, unknown> })?.siblingData;
      const hayValor = hermano?.[nombreValor] !== undefined && hermano?.[nombreValor] !== null;
      if (hayValor && !valor)
        return (
          `Falta la unidad de ${etiqueta}. Un ritmo sin unidad NO es un número: ` +
          `\`19px\` y \`2 %\` valen lo mismo a 1440 y distinto a 390 (cuerpo.spec.md §2.1). ` +
          `Se rechaza en vez de suponer \`px\`.`
        );
      return true;
    },
  } as Field;
}

/**
 * Una medida de ritmo con su unidad y su override de móvil. **Grupo**, para que
 * valor y unidad no puedan separarse: son una sola magnitud.
 *
 * `fuente` no es adorno — es la evidencia, igual que en `conDefecto`.
 */
export function medida(name: string, fuente: string): Field {
  return {
    name,
    type: "group",
    admin: { description: `Vacío = el default responsive de Divi. ${fuente}` },
    fields: [
      { name: "valor", type: "number" },
      unidadDe("valor", "`valor`"),
      { name: "movilValor", type: "number", admin: { description: "Vacío = hereda el de escritorio." } },
      unidadDe("movilValor", "`movilValor`"),
    ],
  } as Field;
}

/**
 * `MonoRitmo` — sección y fila. **Va EN LÍNEA, no agrupado**, porque el tipo
 * medido lo trae así: `MonoSeccion extends MonoRitmo`. En el módulo, en cambio,
 * el ritmo es una propiedad con nombre (`ritmo?: MonoRitmoModulo`) y allí sí es
 * un grupo. La diferencia no es cosmética: cambia la ruta del campo, que es lo
 * que la comprobación de `qa:cms-campos` empareja.
 *
 * ⚠ **Estos tres son `number`, o sea PX IMPLÍCITOS, y eso arrastra la
 * ambigüedad que `medida()` corrige (F3-1 PASO 6, 2026-08-10).** Derivado —no
 * recordado— contra `medidas/mono-modulos-{1440,390}.json`, emparejando nodo a
 * nodo las 3 páginas congeladas (edar · petróleo · urbano):
 *
 * | nivel | n | valores no-default distintos a los dos anchos |
 * |---|---|---|
 * | sección (`mt`·`pt`·`pb`) | 8 | **0** — `−14·14·40·0` iguales a 1440 y a 390 |
 * | fila (`pt`·`pb`) | 22 | **0** — `2·36·40·60·72·0` iguales |
 * | módulo (`mt`·`mb`) | 95 | **0** — `16·17·20·23·26·30·41·0` iguales |
 *
 * Los únicos pares que se mueven son los **defaults** (`57.5938→50` ·
 * `28.7969→30` · `34.0469→30` · `37.1406→10.0469`), que el dato **omite** por
 * convención. O sea: **el editor no escribió ni un porcentaje en lo medido**, y
 * la ambigüedad aquí es **latente, no realizada** — un `number` no puede
 * expresar el `%` que aparecería en una cuarta instancia, y lo guardaría como px
 * sin dar error.
 *
 * **Alcance: 3 páginas de las 4 construidas** (los 8 sectores NO están todos
 * medidos con esta sonda). No se migra en esta tanda porque tocar un tipo
 * poblado se prueba con su round-trip y no de paso: ficha en
 * `PENDIENTES-QA.md` §F3-1-RITMO-SIN-UNIDAD.
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

/* ══════════════════════════════════════════════════════════════════════════
 * LA PUBLICACIÓN — F2-4. Dos campos, y son INFRAESTRUCTURA, no dato medido.
 *
 * ── Qué problema resuelven ────────────────────────────────────────────────
 * F2-4 pide dos cosas que hoy no se pueden ni enunciar: **publicación
 * programada** (§F2-4 · el cron) y **preview de borradores** (§F2-4 · la única
 * grieta de runtime). Las dos necesitan que un documento pueda existir en la DB
 * **sin estar en el sitio**, y hasta hoy todo lo que estaba en la DB salía.
 *
 * ── ⚠ POR QUÉ NO SE USAN LOS DRAFTS NATIVOS DE PAYLOAD ───────────────────
 * Payload trae `versions: { drafts: true }` y hace justo esto. Se descarta con
 * su coste dicho, no por no haberlo mirado:
 *
 *   · **crea una tabla `_v` por colección** —trece— y con ellas un `_status`
 *     cuyo defecto cambia la semántica de TODA consulta existente. Un `find`
 *     sin `draft: true` deja de devolver lo que devolvía, y en este proyecto
 *     eso significa **un build que emite menos rutas sin dar un solo error**:
 *     el modo de fallo exacto que `qa:manifiesto` existe para cazar;
 *   · y su ventaja real —**previsualizar cambios sobre un documento YA
 *     PUBLICADO**— es la que aquí no se compra. Con estos dos campos se pueden
 *     previsualizar **borradores** (documentos que aún no han salido), no
 *     ediciones de uno vivo.
 *
 * > **Se declara la limitación en vez de esconderla:** editar una página
 * > publicada no tiene preview; sale en el siguiente rebuild. Subir a drafts
 * > nativos es un cambio de migración, no de modelo — los dos campos se
 * > traducen a `_status` y a la fecha de `schedulePublish`.
 *
 * ── Y por qué llevan `custom.infraestructura` ────────────────────────────
 * No son dato medido: no salen de ninguna medición del original, no viajan al
 * HTML y no tienen contraparte en `src/lib`. Sin la marca, el proyector los
 * devolvería como si fueran dato y **`qa:cms-roundtrip` fallaría en las 63
 * filas** — la ida no los trae y la vuelta sí. Se marcan **declarándolo en el
 * campo**, no con una lista de nombres en el walker: una lista se pudre y
 * borraría un campo medido que se llamara igual (mismo argumento que
 * `esSintetico`, `mapeo.mjs`).
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **El defecto es `borrador`, y es una decisión editorial, no técnica.**
 *
 * Con `publicado` por defecto, crear un documento lo publica: nada sale mal
 * hasta el día que alguien empieza una página a medias y el siguiente rebuild
 * la sirve. Con `borrador`, lo peor que pasa es que haya que pulsar publicar.
 *
 * **Y su precio, dicho porque hay que pagarlo:** el seed tiene que escribir
 * `publicado` en los 63 documentos **explícitamente**. Si se le olvida, el
 * build emite **cero rutas por familia** — que no es un fallo silencioso
 * porque `qa:manifiesto` grita exactamente eso, y por eso está en `npm run
 * check`.
 */
export const ESTADO_PUBLICACION: Field = {
  name: "estado",
  type: "select",
  required: true,
  defaultValue: "borrador",
  index: true,
  options: [
    { label: "Borrador", value: "borrador" },
    { label: "Publicado", value: "publicado" },
  ],
  admin: {
    position: "sidebar",
    description: "Sólo «Publicado» sale en el sitio. Un borrador se ve en la preview con credencial.",
  },
  custom: { infraestructura: true },
};

/**
 * La hora a la que el cron debe publicarlo. Vacío = no programado.
 *
 * ⚠ **No publica por sí solo.** Lo servido es HTML estático y no sabe qué hora
 * es (CMS-0c), así que sin alguien preguntando *«¿ha llegado la hora de
 * alguno?»* esta fecha no hace absolutamente nada. Quien pregunta es
 * `POST /cron` del publicador, y quien le da el reloj es el cron del sistema.
 */
export const PUBLICAR_EN: Field = {
  name: "publicarEn",
  type: "date",
  index: true,
  admin: {
    position: "sidebar",
    date: { pickerAppearance: "dayAndTime" },
    description:
      "Si está en Borrador y esta hora pasa, el cron lo publica y reconstruye. Vacío = manual.",
  },
  custom: { infraestructura: true },
};

/** Los dos, para añadirlos de una vez. */
export const PUBLICACION: Field[] = [ESTADO_PUBLICACION, PUBLICAR_EN];
