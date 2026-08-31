/**
 * LA UNIÓN DE BLOQUES DEL LOTE **F3-5** — PRODUCTO · CATÁLOGO · SOFTWARE ·
 * SOFTWARE-corta. Escrita en la 126.ª (2026-08-31).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §0 · QUÉ ES «UN MÓDULO» AQUÍ — Y POR QUÉ ESTO VA DELANTE
 *
 * Un elemento de esta unión es **un MÓDULO DE PRIMER NIVEL DEL CUERPO**: un
 * nodo `.et_pb_module` que **NO cuelga de otro `.et_pb_module`**, con el
 * cascarón descontado. Cardinal medido: **90 · 35 · 70 · 36 = 231**
 * (`ESQUEMA-CMS.md` §2n, `derivaciones/paso0-criterio-126.*`).
 *
 * **Los otros dos cardinales del mismo objeto son ciertos y NO son éste**, y se
 * nombran para que nadie los cruce por el total (§*corregir un denominador no es
 * sustituirlo en todas partes*):
 *
 * | cardinal | unidad |
 * |---|---|
 * | **231** | módulo de PRIMER NIVEL ← **el elemento de esta unión** |
 * | 311 | nodo `.et_pb_module` del cuerpo EN EL DOM, a cualquier profundidad |
 * | 215 | módulo con caja @1440 dentro de las `min(orig,clon)` primeras filas |
 *
 * El de 311 cuenta **un acordeón de 19 toggles como 20**; el de 215 no es un
 * criterio de módulo sino un truncado del emparejamiento del comparador.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §1 · POR QUÉ COLECCIÓN PROPIA Y NO `paginas`
 *
 * Derivado antes de decidir (`derivaciones/tipos-f35-126.*`, 7 controles):
 * la unión de `paginas` ya expresa **8 de los 11 tipos** del lote y **228 de
 * las 231 instancias (98.7 %)**. Con ese número, meterlo en `paginas` era una
 * opción viva — y aun así se separa, por dos razones y con su OPERACIÓN
 * escrita (§regla 23):
 *
 *   1 · **§1.5b Razón 3**: deshacer «dos colecciones» es **FUSIONAR**, que es
 *       el lado barato; deshacer «una» es SEPARAR, el caro. Ante la duda, la
 *       que se deshace mejor;
 *   2 · **`paginas` es la COLA LARGA**, con una membresía enumerada (48 rutas /
 *       32 páginas: hubs de KB, hubs de L4 y sueltas). Estas 4 son arquetipos
 *       NOMBRADOS, con su recon, sus specs y sus componentes. Meterlos ahí
 *       haría falsa la definición de esa colección.
 *
 * > ⚠ **CONDICIÓN DE REAPERTURA** (esta decisión NO va contra el criterio, pero
 * > se toma con un dominio corto y por tanto la lleva): si el lote crece hasta
 * > que las dos uniones coincidan al 100 % de los TIPOS —hoy 72.7 %— o si
 * > alguno de los 3 tipos que estrena desaparece del corpus, **se re-evalúa
 * > fusionar**, que es el lado barato.
 *
 * **Los 3 tipos que ESTRENA, con su cardinal:** `et_pb_cta` (1) ·
 * `dvmd_table_maker` (1) · `et_pb_gallery` (1). Los tres en PRODUCTO.
 *
 * ⚠ Y `gallery` **sí lo expresa el esquema por otro canal** —`MODULO_GALLERY`
 * en `bloques/kb.ts`—; lo que no lo expresa es la unión de `paginas`. La
 * distinción importa: decir *«el esquema no lo expresa»* leyendo una sola
 * colección es §*la salida servida incluye el canal que no estabas mirando*.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §2 · EL RITMO — LOS 6 EJES QUE SON CAMPO, Y LOS 46 QUE ESTÁN SIN PROBAR
 *
 * La 125.ª midió la varianza INTER-INSTANCIA emparejando por **marcador
 * semántico** —no por el ordinal del constructor, que es único por documento y
 * daba 0 pares por construcción (§regla 29, la mitad que faltaba)—.
 *
 * **Los cardinales, cada uno con SU UNIDAD** (§regla 14: sin unidad no se
 * pueden auditar, y los tres son ciertos):
 *
 * | unidad | CON varianza | SIN varianza | total |
 * |---|---|---|---|
 * | marcador × ancho × eje | **6** | **46** | 52 |
 * | marcador × eje | **4** | **24** | 28 |
 * | eje (`mt`·`mb`·`pt`·`pb`) | **2** (`mb`·`pt`) | **2** (`mt`·`pb`) | 4 |
 *
 * **LOS 6, con la varianza que los sostiene — para que nadie tenga que fiarse:**
 *
 * | pieza | ancho | eje | n | valores por documento |
 * |---|---|---|---|---|
 * | `iconos-xs-2` | 1440 | `marginBottom` | 2 | PRODUCTO `31.6719` · SOFTWARE-corta `0, 31.6719` |
 * | `iconos-xs-2` | 390 | `marginBottom` | 2 | PRODUCTO `30` · SOFTWARE-corta `0, 30` |
 * | `iconos-md-3` | 1440 | `marginBottom` | 2 | PRODUCTO `31.6719` · SOFTWARE-corta `0, 31.6719` |
 * | `iconos-md-3` | 390 | `marginBottom` | 2 | PRODUCTO `30` · SOFTWARE-corta `0, 30` |
 * | `menu-anclas` | 1440 | `marginBottom` | 3 | PRODUCTO `31.6719` · CATÁLOGO `0, 27.2` · SOFTWARE `27.2` |
 * | `menu-anclas` | 1440 | `paddingTop` | 3 | PRODUCTO `0` · CATÁLOGO `0, 17` · SOFTWARE `17` |
 *
 * Tres piezas, dos ejes, valores distintos entre instancias de **la misma
 * pieza**: lo escribió quien editó cada página ⇒ **CAMPO**. Y el papel del
 * marcador en el selector ganador es `no-aparece` en todos (§regla 36): el
 * valor lo trae el selector ORDINAL, o sea el editor — el marcador es la
 * LLAVE de emparejamiento, no el portador del valor.
 *
 * ⚠⚠ **LOS 46 SIN VARIANZA SALEN `SIN PROBAR`, NO «PLANTILLA», Y NO SE
 * CABLEAN.** Un eje sin varianza en 2–4 instancias **no está probado como
 * plantilla**: puede ser un campo que el editor puso uniforme (el falso
 * negativo declarado del test B). Y **el test A no puede rescatarlos solo**: la
 * 124.ª midió que su premisa central es falsa en régimen `B-` por `FN-bp` —el
 * editor escribe POR PUNTO DE RUPTURA y compila `@media` con ordinal, así que
 * **su** valor también se mueve con el ancho— con **45 · 32 · 20** casos en los
 * tres arquetipos `B-` medidos. Por eso los 46 se declaran y se dejan al
 * DEFAULT, que es lo contrario de cablearlos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §3 · LOS DEFAULTS DE RITMO SE ESCRIBEN CON SU CONTENEDOR
 *
 * Vacío en un campo `medida()` = **el default responsive de Divi**, que NO es
 * una constante:
 *
 *   · sección `pt`/`pb` = **4 % DE LA SECCIÓN**
 *   · fila `pt`/`pb`    = **2 % DE LA FILA**
 *   · módulo `mb`       = **2.75 % DE LA FILA**
 *
 * Escribirlos como px (`57.5938 · 28.7969 · 34.0469`) los convierte en
 * constantes de una página cuyo contenedor medía 1440 y cuya fila medía
 * 1238.39 — y en cuanto el contenido entra en una columna, los tres cambian y
 * **ninguno da error**.
 *
 * ⚠ **Y `mbPorDefecto()` NO se sustituye por la fórmula del porcentaje.** El
 * modelo del `%` acierta 55 de 114 al bit y falla en **59 módulos de un solo
 * grupo** (`articulos-kb · 4_4`), donde pondría `25.0625` contra `34.0469`
 * medido. La tabla acierta **118 de 118**. Se replica el número; el mecanismo
 * de esa `4_4` sigue SIN PROBAR.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §4 · LO QUE ESTA UNIÓN **NO** HACE, con su cardinal
 *
 * · **no está cableada al render**: ningún componente lee esta colección
 *   todavía (0 lectores). Las 4 rutas siguen sirviéndose de `src/lib/`. Es
 *   §F3-5 «hecho» en su primera mitad —*el content type escrito con sus SIN
 *   PROBAR declarados y no cableados*—, no la segunda;
 * · **no se siembra en esta tanda**: el extractor del lote no existe;
 * · **el eje `módulos` sigue SIN COMPARAR** contra el original (`·`, no «a 0»):
 *   el clon no emite marcador de módulo. El criterio ya no lo bloquea; el coste
 *   sí — 35 componentes de 97.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { Block, Field } from "payload";

import { campoHtml, conDefecto, enlace, htmlLinea, medida, subida } from "../campos/comunes.ts";

/* ═══════════════════════════════════════════════════════════════════════════
   LA PIEZA — el marcador semántico, y es un CAMPO
   ═══════════════════════════════════════════════════════════════════════════
   Es la clase que el editor escribe en el builder (`menu-anclas`,
   `iconos-md-3`, `breadcrumbs`…). **No es adorno ni un dato de sonda:** es la
   LLAVE con la que la varianza inter-instancia pasó de «inmedible» a 7 piezas
   con ≥2 instancias y 6 ejes CAMPO. Sin ella, dos instancias de la misma pieza
   en dos páginas no se pueden emparejar — el ordinal del constructor es único
   POR DOCUMENTO, así que empareja 0 por construcción.

   Censo derivado: **18 marcadores · 7 con ≥2 instancias · 11 singleton**
   (`derivaciones/escalon4-varianza-125.*`). Opcional porque
   la mayoría de los módulos no lleva ninguno. */
const pieza: Field = {
  name: "pieza",
  type: "text",
  admin: {
    description:
      "Marcador semántico que el editor escribe en el builder (`menu-anclas`, `iconos-md-3`…). " +
      "Es la LLAVE de emparejamiento entre instancias: sin ella la varianza inter-instancia no es medible. " +
      "Censados 18, de los que 7 tienen ≥2 instancias.",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   EL RITMO — dos ejes MEDIDOS y dos SIN PROBAR, y se distinguen en el campo
   ═══════════════════════════════════════════════════════════════════════════ */

/** Los dos ejes con varianza inter-instancia medida ⇒ **CAMPO**. */
const RITMO_MEDIDO: Field[] = [
  medida(
    "mb",
    "CAMPO · varianza inter-instancia MEDIDA en 3 piezas: `iconos-xs-2` (2 inst: 31.6719 vs 0,31.6719 @1440; " +
      "30 vs 0,30 @390) · `iconos-md-3` (2 inst, mismos valores) · `menu-anclas` (3 inst: 31.6719 · 0,27.2 · 27.2 @1440). " +
      "Vacío = el default de Divi, que es 2.75 % DE LA FILA — lo da `mbPorDefecto(anchoFila, tipoColumna)`, no un px.",
  ),
  medida(
    "pt",
    "CAMPO · varianza inter-instancia MEDIDA en `menu-anclas` (3 inst @1440: PRODUCTO 0 · CATÁLOGO 0,17 · SOFTWARE 17). " +
      "Vacío = el default de Divi, que en fila es 2 % DE LA FILA y en sección 4 % DE LA SECCIÓN.",
  ),
];

/** Los dos sin varianza observada ⇒ **SIN PROBAR**, y por eso NO se cablean. */
const RITMO_SIN_PROBAR: Field[] = [
  medida(
    "mt",
    "⚠ SIN PROBAR — 0 de 13 pares (marcador × ancho) con varianza. Eso NO lo prueba plantilla: puede ser un campo " +
      "que el editor puso uniforme (falso negativo declarado del test B), y el test A no lo rescata solo " +
      "(`FN-bp`: 45·32·20 casos en los tres `B-`). Se deja al default; no se cablea.",
  ),
  medida(
    "pb",
    "⚠ SIN PROBAR — 0 de 13 pares (marcador × ancho) con varianza. Mismo motivo que `mt`. Se deja al default; no se cablea.",
  ),
];

/**
 * El ritmo de un módulo del lote. **Grupo**, igual que en KB y en la cola
 * larga, para que la ruta del campo sea la que `qa:cms-campos` empareja.
 */
const ritmo: Field = {
  name: "ritmo",
  type: "group",
  admin: {
    description:
      "Vacío = el default RESPONSIVE de Divi (sección 4 % de la sección · fila 2 % de la fila · módulo 2.75 % de la fila). " +
      "Nunca se escribe el px del default: un porcentaje citado sin su contenedor se lee como constante.",
  },
  fields: [...RITMO_MEDIDO, ...RITMO_SIN_PROBAR],
};

/** Lo que todo módulo del lote lleva, sea del tipo que sea. */
const COMUNES_MODULO: Field[] = [pieza, ritmo];

/* ═══════════════════════════════════════════════════════════════════════════
   LOS 11 TIPOS, con su cardinal medido y su vía de derivación
   ═══════════════════════════════════════════════════════════════════════════
   El tipo se derivó del ORDINAL del constructor (`et_pb_<tipo>_<n>`), no de la
   primera clase desnuda: ésta última toma MODIFICADORES por tipos y no da
   error —`et_pb_with_border` sobre un `et_pb_text` (×3), `et_pb_promo` donde el
   ordinal dice `et_pb_cta`, `et_pb_button_module_wrapper` donde dice
   `et_pb_button` (×24)—. Evidencia del defecto, conservada:
   `tipos-f35-126-SONDA-TIPO-POR-CLASE-DESNUDA-MODIFICADORES.json`. */

const TEXTO: Block = {
  slug: "texto-arq",
  labels: { singular: "Texto", plural: "Textos" },
  /* 100 instancias en 4/4 documentos — el tipo más frecuente del lote. */
  fields: [...COMUNES_MODULO, campoHtml("contenido", { requerido: true })],
};

const ICONO: Block = {
  slug: "icono-arq",
  labels: { singular: "Icono con texto", plural: "Iconos con texto" },
  /* 70 instancias en 3/4 (`et_pb_blurb`). Falta en CATÁLOGO. */
  fields: [...COMUNES_MODULO, htmlLinea("titulo"), campoHtml("contenido"), subida("imagen")],
};

const IMAGEN: Block = {
  slug: "imagen-arq",
  labels: { singular: "Imagen", plural: "Imágenes" },
  /* 27 instancias en 4/4. */
  fields: [...COMUNES_MODULO, subida("imagen", { requerida: true }), { name: "alt", type: "text" }, enlace("enlace")],
};

const BOTON: Block = {
  slug: "boton-arq",
  labels: { singular: "Botón", plural: "Botones" },
  /* 24 instancias en 4/4. ⚠ El módulo que Divi marca es el ENVOLTORIO
     (`et_pb_button_module_wrapper`), no el `<a>`: por eso su ordinal lleva
     sufijo (`et_pb_button_0_wrapper`) y la llave de la 123.ª no lo casaba. */
  fields: [...COMUNES_MODULO, { name: "texto", type: "text", required: true }, enlace("destino")],
};

/**
 * ⚠ **EL SLUG DE UN BLOQUE TIENE UN PRESUPUESTO DE 18 CARACTERES, Y ES
 * DERIVABLE — no una preferencia de estilo.** Postgres corta los
 * identificadores a **63**, y el nombre más largo que Payload genera por bloque
 * es el enum de la unidad de móvil:
 *
 *     enum_arquetipos_blocks_<slug>_ritmo_mb_movil_unidad
 *     └──────── 23 ────────┘        └──────── 22 ───────┘   ⇒ 63 − 45 = 18
 *
 * `slider-completo-arq` son **19** y el `migrate:create` falla en el acto —
 * *«Exceeded max identifier length … Invalid name:
 * enum_arquetipos_blocks_slider_completo_arq_ritmo_mb_movil_unidad»*—. De ahí
 * `slider-ancho-arq` (16). **Falla en voz alta, que es lo bueno**: no hay
 * truncado silencioso que colisione dos enums.
 *
 * Y el que manda sigue siendo `movil_unidad`: la posición nueva de la 126.ª
 * (`unidad767`, 19 chars de sufijo) es **más corta**, así que no estrecha el
 * presupuesto.
 */
const SLIDER_COMPLETO: Block = {
  slug: "slider-ancho-arq",
  labels: { singular: "Slider a ancho completo", plural: "Sliders a ancho completo" },
  /* 3 instancias en 3/4. */
  fields: [...COMUNES_MODULO, campoHtml("contenido")],
};

const SLIDER: Block = {
  slug: "slider-arq",
  labels: { singular: "Slider", plural: "Sliders" },
  /* 1 instancia, en SOFTWARE. */
  fields: [...COMUNES_MODULO, campoHtml("contenido")],
};

const VIDEO: Block = {
  slug: "video-arq",
  labels: { singular: "Vídeo", plural: "Vídeos" },
  /* 2 instancias en 2/4. */
  fields: [...COMUNES_MODULO, { name: "url", type: "text", required: true }, subida("portada")],
};

const CODIGO: Block = {
  slug: "codigo-arq",
  labels: { singular: "Código", plural: "Códigos" },
  /* 1 instancia, en PRODUCTO. Contenedor de contenido ⇒ HTML crudo. */
  fields: [...COMUNES_MODULO, campoHtml("contenido", { requerido: true })],
};

/* ── Los TRES que el lote ESTRENA sobre la unión de `paginas` ─────────────── */

const CTA: Block = {
  slug: "cta-arq",
  labels: { singular: "Llamada a la acción", plural: "Llamadas a la acción" },
  /* 1 instancia, en PRODUCTO. El ordinal dice `et_pb_cta_0`; la clase
     renderizada es `et_pb_promo`, que es la que engañaba al censo v1. */
  fields: [...COMUNES_MODULO, htmlLinea("titulo"), campoHtml("contenido"), { name: "textoBoton", type: "text" }, enlace("destino")],
};

const TABLA: Block = {
  slug: "tabla-arq",
  labels: { singular: "Tabla", plural: "Tablas" },
  /* 1 instancia, en PRODUCTO. `dvmd_table_maker` es un módulo de un TERCERO:
     el constructor NO lo numera, así que es el único módulo de primer nivel
     del lote SIN llave (1 de 231). Su tipo se derivó por clase desnuda, y eso
     se publica en vez de esconderse. */
  fields: [...COMUNES_MODULO, campoHtml("contenido", { requerido: true })],
};

const GALERIA: Block = {
  slug: "galeria-arq",
  labels: { singular: "Galería", plural: "Galerías" },
  /* 1 instancia, en PRODUCTO. ⚠ El esquema YA expresa `gallery` por otro canal
     (`MODULO_GALLERY` en `bloques/kb.ts`): lo que no lo expresa es la unión de
     `paginas`. No se reutiliza aquél porque su forma está medida contra el
     corpus de KB, no contra éste — y copiar una forma medida en otro dominio es
     §*una regla derivada sobre un dominio donde el caso NO SE DA*. */
  fields: [
    ...COMUNES_MODULO,
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [subida("imagen", { requerida: true }), { name: "alt", type: "text" }],
    },
  ],
};

/**
 * La unión. **11 tipos, y el orden es el del cardinal medido** —no alfabético—
 * para que el editor vea primero lo que de verdad usa.
 */
export const bloquesArquetipo: Block[] = [
  TEXTO,
  ICONO,
  IMAGEN,
  BOTON,
  SLIDER_COMPLETO,
  VIDEO,
  CTA,
  TABLA,
  GALERIA,
  CODIGO,
  SLIDER,
];

/** El discriminante del lote. Derivado del inventario de §F3-5, no escrito. */
export const ARQUETIPOS_F35 = ["producto", "catalogo", "software"] as const;

/**
 * `variante` distingue SOFTWARE de su variante corta (`/kunak-api`), que el
 * recon concluyó que **NO es un arquetipo nuevo** (`research/kunak-api/`).
 * Modelarla como arquetipo habría creado uno que la medición niega.
 */
export const varianteCorta: Field = conDefecto(
  { name: "varianteCorta", type: "checkbox" },
  false,
  "recon de `/kunak-api`: variante CORTA de SOFTWARE, no arquetipo nuevo. 1 de las 4 rutas del lote.",
);
