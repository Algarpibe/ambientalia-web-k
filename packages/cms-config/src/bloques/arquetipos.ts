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
 * §2 · EL RITMO — CORREGIDO EN LA 127.ª: 4 DE LOS 6 «CAMPO» NO ERAN CAMPO
 *
 * La 125.ª midió la varianza INTER-INSTANCIA emparejando por **marcador
 * semántico** —no por el ordinal del constructor, que es único por documento y
 * daba 0 pares por construcción (§regla 29, la mitad que faltaba)—. La llave
 * era correcta. Lo que estaba mal era **leer una diferencia de CONJUNTOS como
 * una diferencia de VALOR**.
 *
 * ⚠⚠ **LA VARIANZA DE ESTRUCTURA NO ES VARIANZA DE CAMPO** (127.ª,
 * `derivaciones/escalon1-varianza-127.*`, instrumento adjudicado sobre el lote
 * con 13/13 controles):
 *
 *   `iconos-xs-2` mb → PRODUCTO `[31.6719]` · SOFTWARE-corta `[0, 31.6719]`
 *
 * Los dos conjuntos no difieren en un valor: difieren en **cuántos módulos hay
 * en la columna**. El `0` lo declara `.et_pb_module:last-child{margin-bottom:0}`
 * del constructor, y **ningún selector ganador de ese par lleva ORDINAL**, o
 * sea que ahí no escribió nadie. Lo mismo `iconos-md-3`.
 *
 * **De los 6 «CAMPO» de la 125.ª sobreviven DOS.** Los 4 de `iconos-xs-2` e
 * `iconos-md-3` pasan a **PLANTILLA** (ganador genérico: el reparto de Divi
 * `5.82% · 4.242% · 3.735%` a 1440 y `.et_pb_column .et_pb_module{30px}` a 390).
 *
 * **Los cardinales, cada uno con SU UNIDAD** (§regla 14, y los dos dominios son
 * ciertos: son DOS conjuntos de documentos, no dos lecturas de uno):
 *
 * ⚠ LAS CUATRO COLUMNAS DE VEREDICTO SON UNA PARTICIÓN Y SUMAN LOS PARES. La
 * varianza ESTRUCTURAL no es una quinta categoría: es un SUB-RECUENTO de
 * `PLANTILLA` — 4 de los 10 del lote, 0 de los 26 de la familia (corregido
 * 2026-08-31, 128.ª). Escritas las cinco al mismo nivel, la fila del lote
 * sumaba 56 sobre 52 pares; el número siempre fue correcto y la FORMA
 * presentaba un sub-recuento como hermano de su contenedor (§regla 14 con el
 * contenedor puesto en el juego de claves). Derivado del `detalle` par a par:
 * `escalon1-lecturas-128.{mjs,json,log}`.
 *
 * | dominio | pares | CAMPO | PLANTILLA | SIN ESCRIBIR | SIN PROBAR | Σ |
 * |---|---|---|---|---|---|---|
 * | LOTE — 4 arquetipos distintos | 52 | **2** | 10 | 40 | 0 | **52 ✓** |
 * | FAMILIA PRODUCTO — 3 instancias del MISMO | 132 | **8** | 26 | 98 | 0 | **132 ✓** |
 *
 * | dominio | de sus PLANTILLA, por varianza ESTRUCTURAL |
 * |---|---|
 * | LOTE | **4 de 10** |
 * | FAMILIA PRODUCTO | **0 de 26** |
 *
 * | unidad | CAMPO (familia) | de |
 * |---|---|---|
 * | par (marcador × ancho × eje) | **8** | 132 |
 * | marcador × eje | **5** | 68 |
 * | eje (`mt`·`mb`·`pt`·`pb`) | **2** (`mb`·`pt`) | 4 |
 *
 * **LOS 8, con la varianza Y la cascada que los sostienen — las dos patas
 * concuerdan en los ocho, que es la evidencia más fuerte que se puede dar:**
 *
 * | pieza | ancho | eje | valores por documento | selector ganador |
 * |---|---|---|---|---|
 * | `parametros` | 1440·390 | `mb` | monitor `0` · estacion `9` · sensor `0` | `.et_pb_text_14` `0.5em !important` |
 * | `clear-both` | 1440·390 | `mb` | monitor `0` · estacion `9` · sensor `0` | `.et_pb_text_14` `0.5em !important` |
 * | `menu-anclas` | 1440 | `mb` | monitor `31.6719` · estacion `27.2` · sensor `31.6719` | `.et_pb_text_15` `1.7rem !important` |
 * | `menu-anclas` | 1440 | `pt` | monitor `0` · estacion `17` · sensor `0` | `.et_pb_text_15` `1em !important` |
 * | `clear` | 1440·390 | `pt` | monitor `0` · estacion `32` | `.et_pb_text_16..29` `2rem !important` |
 *
 * Los 8 llevan **`ordinal: true`**: el valor lo trae un selector
 * `et_pb_<tipo>_<n>`, que el constructor emite por módulo ⇒ lo escribió el
 * editor. El marcador es la LLAVE de emparejamiento, no el portador (§regla 36).
 *
 * ⚠⚠ **LOS 40 QUE SIGUEN ABIERTOS SON `SIN ESCRIBIR`, NO «PLANTILLA», Y NO SE
 * CABLEAN.** De los 46 de la 125.ª, **6 se resuelven a PLANTILLA por la
 * cascada** y **40 siguen abiertos**: su único valor observado es `0`, el
 * INICIAL de la propiedad, así que no hay declaración a la que preguntar
 * (§*el test A supone que hay algo escrito*). Y el test A no los rescata solo:
 * la 124.ª midió que su premisa es falsa en `B-` por `FN-bp` —el editor escribe
 * POR PUNTO DE RUPTURA y compila `@media` con ordinal— con **45 · 32 · 20**
 * casos. Se declaran y se dejan al DEFAULT, que es lo contrario de cablearlos.
 *
 * ⚠ **Y por qué la cascada se toma a LOS DOS ANCHOS** (la 125.ª sólo a 1440):
 * el ganador de `mb` a 1440 es un `%` de reparto por tipo de columna y a 390 es
 * `.et_pb_column .et_pb_module{margin-bottom:30px}`. El test A a 390 leería
 * «px absolutos ⇒ campo» sobre plantilla pura.
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
   LLAVE con la que la varianza inter-instancia pasó de «inmedible» a medible.
   Sin ella, dos instancias de la misma pieza en dos páginas no se pueden
   emparejar — el ordinal del constructor es único POR DOCUMENTO, así que
   empareja 0 por construcción.

   Censo derivado, **con su dominio al lado porque son DOS y cuentan cosas
   distintas** (§*dos lecturas pueden dar el mismo cardinal contando unidades
   distintas*):

     LOTE, 4 arquetipos distintos   18 marcadores ·  7 en ≥2 · 11 singleton
     FAMILIA PRODUCTO, 3 del mismo  19 marcadores · 17 en ≥2 ·  2 singleton

   El dominio que decide qué es CAMPO es **la familia**: allí las instancias son
   del MISMO arquetipo, así que un valor distinto sólo puede haberlo escrito
   quien editó esa página. En el lote, un valor distinto puede ser otra
   PLANTILLA —§*lo que varía entre FORMAS distingue plantillas, no campos*—, y
   ahí es donde la 125.ª se pasó de largo con 4 pares.

   ⚠ Y el censo OFFLINE del mismo lote da **20 · 8 · 12**, que también es cierto:
   cuenta el HTML, no la geometría, así que incluye `popup` y `dark`, sin caja.
   Diferencia simétrica **2 y 0** — un solo lado, y con mecanismo.
   (`derivaciones/escalon1-varianza-127.*` · `paso0-dominio-127.*`.) Opcional
   porque la mayoría de los módulos no lleva ninguno. */
const pieza: Field = {
  name: "pieza",
  type: "text",
  admin: {
    description:
      "Marcador semántico que el editor escribe en el builder (`menu-anclas`, `iconos-md-3`…). " +
      "Es la LLAVE de emparejamiento entre instancias. Censados 18, de los que 7 tienen ≥2 instancias — " +
      "y los otros 11 SÍ son medibles: la CASCADA no necesita segunda instancia (128.ª).",
  },
};

/* ⚠⚠ 128.ª (2026-08-31) — LA EVIDENCIA DE LOS «CAMPO» ESTABA AGREGADA, Y SU
 * ALCANCE REAL ES MENOR. NO CAMBIA NINGUNA DEFINICIÓN DE CAMPO: cambia de
 * cuántas instancias salió la evidencia, que es lo que hace auditable el
 * veredicto.
 *
 * El comparador decidía «lo escribió el editor» con
 * `ganadores.filter(g => g.ordinal).length > 0` sobre TODOS los documentos del
 * par. Es una UNIÓN, así que el ordinal de UNO adjudica CAMPO para sus
 * hermanos — que pueden no haber escrito nada. Re-adjudicado por documento
 * (`SIN_EMPAREJAR=1`, unidad documento × marcador × ancho × eje):
 *
 *   FAMILIA · 348 filas · los 8 CAMPO son los MISMOS que halló el par
 *             (`CAMPO → CAMPO` 8 de 8) y los 8 son de UN documento,
 *             `estacion-de-monitoreo`. `monitor` y `sensor` → CERO CAMPO, y 12
 *             de sus 14 filas movidas caen a `SIN ESCRIBIR`: allí nadie escribió.
 *
 *   LOTE    · 244 filas · de las 6 filas-CAMPO del par sobreviven 4:
 *             CATÁLOGO (`.et_pb_text_7`) y SOFTWARE (`.et_pb_text_14`) tienen
 *             ordinal PROPIO; PRODUCTO no, y cae a PLANTILLA (`mb`) y
 *             SIN ESCRIBIR (`pt`).
 *
 * Los campos siguen siendo campos —la cascada los confirma con su selector
 * ordinal— pero su evidencia es de UNA instancia, no de tres.
 *
 * Y LA CASCADA SOLA ADJUDICA A LOS SINGLETON, que era lo que el emparejamiento
 * no podía por construcción (`docs.length < 2` ⇒ 0 pares):
 *
 *   CATÁLOGO        CAMPO 2 · PLANTILLA 4 · SIN ESCRIBIR 22   (6 de 28 resueltas)
 *   SOFTWARE        CAMPO 4 · PLANTILLA 6 · SIN ESCRIBIR 34   (10 de 44)
 *   SOFTWARE-corta  CAMPO 0 · PLANTILLA 8 · SIN ESCRIBIR 32   (8 de 40)
 *   PRODUCTO        CAMPO 0 · PLANTILLA 27 · SIN ESCRIBIR 105 (27 de 132)
 *
 * ⚠ Y APARECE UN CAMPO QUE NINGÚN PAR PODÍA VER: `SOFTWARE · iconos-md-2 ·
 * mb · 1440 y 390 · 40px !important` sobre `.et_pb_blurb_15/16` — ORDINAL, o
 * sea el editor. `iconos-md-2` sólo está en SOFTWARE dentro del lote, así que
 * el emparejamiento lo descartaba: el cero era del ÁMBITO DE LA LLAVE, no del
 * original. No necesita definición nueva —`pieza` es texto libre— pero SÍ
 * cambia qué instancias ejercitan `mb`. FICHADO, no cableado.
 *
 * Congeladas: `escalon1-varianza-127-por-documento-{lote,familia}.{json,log}`
 * · sabotaje `-neg-sin-ordinal-por-documento-lote` (CAMPO 6 → 0, 18/18)
 * · NO-OP verde en los dos caminos existentes, salida byte-idéntica. */

/* ═══════════════════════════════════════════════════════════════════════════
   EL RITMO — dos ejes MEDIDOS y dos SIN PROBAR, y se distinguen en el campo
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Los dos ejes con varianza inter-instancia medida **dentro del mismo
 * arquetipo** ⇒ **CAMPO**. El veredicto por eje es el MISMO que escribió la
 * 126.ª (`mb` y `pt` sí; `mt` y `pb` no) — lo que cambió es la evidencia: su
 * denominador pasa de 52 pares a **132**, y las piezas que lo sostienen son
 * otras.
 */
const RITMO_MEDIDO: Field[] = [
  medida(
    "mb",
    "CAMPO · varianza inter-instancia en la familia PRODUCTO (3 instancias del MISMO arquetipo), con la CASCADA " +
      "de acuerdo en las 3 piezas: `parametros` y `clear-both` (monitor 0 · estacion 9 · sensor 0, ganador " +
      "`.et_pb_text_14` con `0.5em !important`) y `menu-anclas` (31.6719 · 27.2 · 31.6719 @1440, ganador " +
      "`.et_pb_text_15` con `1.7rem !important`). 5 de 33 pares. " +
      "⚠ CORREGIDO en la 127.ª: `iconos-xs-2` e `iconos-md-3` NO son campo — su `[31.6719]` vs `[0, 31.6719]` es la " +
      "regla `:last-child` del constructor sobre otro número de hermanos, y ningún ganador suyo lleva ordinal. " +
      "Vacío = el default de Divi, que es 2.75 % DE LA FILA — lo da `mbPorDefecto(anchoFila, tipoColumna)`, no un px.",
  ),
  medida(
    "pt",
    "CAMPO · varianza inter-instancia en la familia PRODUCTO con la cascada de acuerdo: `menu-anclas` " +
      "(monitor 0 · estacion 17 · sensor 0 @1440, ganador `.et_pb_text_15` con `1em !important`) y `clear` " +
      "(monitor 0 · estacion 32 a los dos anchos, ganador `.et_pb_text_16..29` con `2rem !important`). 3 de 33 pares. " +
      "Vacío = el default de Divi, que en fila es 2 % DE LA FILA y en sección 4 % DE LA SECCIÓN.",
  ),
];

/** Los dos sin varianza observada ⇒ **SIN PROBAR**, y por eso NO se cablean. */
const RITMO_SIN_PROBAR: Field[] = [
  medida(
    "mt",
    "⚠ SIN PROBAR — 0 de 33 pares (marcador × ancho) con varianza en la familia PRODUCTO, y los 33 salen SIN " +
      "ESCRIBIR: su único valor observado es 0, el INICIAL de la propiedad, así que no hay declaración a la que " +
      "preguntarle nada. Eso NO lo prueba plantilla: puede ser un campo que el editor puso uniforme (falso negativo " +
      "declarado del test B), y el test A no lo rescata solo (`FN-bp`: 45·32·20 casos en los tres `B-`). " +
      "El denominador subió de 13 a 33 al medir la familia: la ausencia está mejor sostenida, no resuelta. " +
      "Se deja al default; no se cablea.",
  ),
  medida(
    "pb",
    "⚠ SIN PROBAR — 0 de 33 pares con varianza; 31 SIN ESCRIBIR y 2 PLANTILLA por cascada (`kunak-faq-item`, " +
      "ganador `.kunak-faq-item{padding:17px}`, genérico y sin ordinal). Mismo motivo que `mt`. " +
      "Se deja al default; no se cablea.",
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
  /* 27 instancias en 4/4. CMS-8a: `enlace` pasa a OPCIONAL — el `required`
     que exigía label+href en las 27 nunca fue una decisión medida, era el
     efecto lateral de `enlace()` siendo un `group` (Payload no hace un group
     opcional por sí mismo). Ahora sólo exige coherencia (si hay `href`, hay
     `label`). Qué fracción de las 27 trae `href` de verdad sigue abierto en
     CMS-8a·SIN-ATRIBUIR (docs/ESQUEMA-CMS.md). */
  fields: [
    ...COMUNES_MODULO,
    subida("imagen", { requerida: true }),
    { name: "alt", type: "text" },
    enlace("enlace", {}, { opcional: true }),
  ],
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

/**
 * ⚠⚠ **0 INSTANCIAS TRAS CMS-6 · C (133.ª, 2026-09-01), y se queda con su cero
 * declarado en vez de borrarse.**
 *
 * Tenía 1 instancia en PRODUCTO y **esa instancia era un FORMULARIO entero** —
 * el campo empieza en `<form` y acaba en `</form>`, 0 caracteres antes y 0
 * después—. El propietario decidió que el formulario va por bloque TIPADO
 * (`FORMULARIO`, abajo), así que este tipo se queda sin dato en el lote.
 *
 * **No se borra**, por dos razones y ninguna es inercia:
 *   · el módulo `et_pb_code` de Divi existe y puede traer contenido que NO sea
 *     un formulario; que el lote de 4 documentos no lo ejercite es un **SIN
 *     PROBAR**, no una prueba de que el caso no exista;
 *   · borrarlo cuesta una migración cuyo `down` está fichado como CLASE
 *     (§regla 42: el generador emite el `DROP CONSTRAINT` detrás del
 *     `DROP TABLE … CASCADE` que ya se lo llevó), y el encargo manda no tocar
 *     definiciones de campo más allá de lo que C exija.
 *
 * ⚠ Y su `campoHtml` **sigue puesto**, que es lo que lo diferencia de
 * `MODULO_CODIGO` (`bloques/paginas.ts`): aquél NO valida contra el censo del
 * cuerpo rico —deliberadamente, *«este módulo existe precisamente para meter lo
 * que ese censo prohíbe»*— y tiene **9 instancias, 9 de 9 formularios de
 * ActiveCampaign, ya sembradas**. Los dos bloques modelan el MISMO módulo de
 * Divi con validadores distintos, y eso está fichado como `F3-5-CODE-DIVERGE`
 * (`ESQUEMA` §2o.9): no se resuelve aquí porque la decisión es del propietario.
 */
const CODIGO: Block = {
  slug: "codigo-arq",
  labels: { singular: "Código", plural: "Códigos" },
  fields: [...COMUNES_MODULO, campoHtml("contenido", { requerido: true })],
};

/**
 * ⚠⚠ **EL FORMULARIO — CMS-6 opción C, decisión del propietario (2026-09-01).**
 *
 * `formulario` **NO entra en la whitelist del cuerpo rico**: sus 20 tokens
 * (`form` · `input` · `select` · `option` · `button` · `label` · `fieldset` ·
 * `legend` · `action` · `method` · `for` · `name` · `value` · `placeholder` ·
 * `required` · `novalidate` · `selected` · `data-autofill` · `data-sitekey` ·
 * `data-styles-version`) quedan fuera con su evidencia, y el contenido entra
 * **modelado**. Es lo que §3.3·T4 ya hace con los `<script>`: nodo tipado en
 * vez de HTML crudo.
 *
 * **1 instancia**, `monitor-calidad-aire` (`et_pb_code_0`, dentro del popup
 * `disenar-proyecto-form-esp`). El clon ya la sirve:
 * `components/monitor/CtaGuiaProyecto.tsx`, spec §2c–2d de
 * `monitor-calidad-aire/components/reutilizables.spec.md`.
 *
 * ── LA FORMA SE DERIVA DEL DATO, no se inventa ────────────────────────────
 * | pieza servida | n | campo |
 * |---|---|---|
 * | `action` | 1 | `destino` |
 * | `method` | 1 | `metodo` |
 * | `<input>` visibles + `<select>` + `<fieldset>` | 5 + 2 + 1 | `campos[]` |
 * | `<option>` | 280 | `campos[].opciones[]` |
 * | `<label>` con texto | 7 | `campos[].etiqueta` |
 * | `<input type=hidden>` | 12 | `ocultos[]` |
 * | `<button>` | 1 | `textoBoton` |
 *
 * ── LO QUE SE PIERDE · PÉRDIDA DECLARADA CON SU CARDINAL (§regla 14) ──────
 * Medida POR ELEMENTO, nunca por el total (§regla 34) —
 * `derivaciones/perdida-133.{mjs,json,log}`:
 *
 * | qué | cardinal | por qué |
 * |---|---|---|
 * | texto VISIBLE | **0 de 286** | el clon ya sirve los 286 trozos, verbatim |
 * | contenido VECINO en el campo | **0 caracteres** | el campo ES el `<form>`, de 0 a 24 681 |
 * | `div.g-recaptcha` + `data-sitekey` | 1 | desviación **ya aceptada** antes de C (spec §2d, *«omitir en el clon»*) |
 * | clases `_form*` del plugin | 26 | presentación; el clon pinta la suya (spec §2d) |
 * | `novalidate` | **1** | atributo del plugin, **sin render** — lo introduce C |
 * | `data-styles-version="3"` | **1** | metadato del plugin, **sin render** — lo introduce C |
 *
 * ⚠ **El `id="_form_106_"` NO se pierde: se RECUPERA** — los ocultos `u` y `f`
 * valen los dos `106`, así que el render lo reconstruye como `_form_${u}_`.
 * Antes de fichar una pérdida se comprueba si otra pieza del modelo ya la
 * porta; si no, se ficha una pérdida que no existe.
 *
 * ⚠⚠ **Y `destino` GUARDA el endpoint de ActiveCampaign, que es un TERCERO.**
 * Guardarlo no es postear a él: el clon manda el submit a `CONTACT_HREF`
 * (spec §2d, decisión anterior a esta tanda). El campo existe para que el dato
 * del original no se pierda, no para que el clon lo use — y esa diferencia
 * entre *lo que el modelo guarda* y *lo que el render hace* se declara aquí
 * porque desde el esquema no se ve.
 *
 * ⚠ **`n = 1`, y eso se declara** (§*un campo que ningún dato ejercita es un
 * camino de render sin estrenar*): con una sola instancia, nada de lo que este
 * bloque haga está probado por variación. Lo que sí está probado es que el dato
 * CABE — medido pieza a pieza arriba, no inspeccionado.
 */
const FORMULARIO: Block = {
  slug: "formulario-arq",
  labels: { singular: "Formulario", plural: "Formularios" },
  fields: [
    ...COMUNES_MODULO,
    { name: "destino", type: "text", required: true },
    /* ⚠ SIN `conDefecto`, y es deliberado: con **n = 1** el único valor medido
       es `POST`, y escribirlo como defecto convertiría una muestra en regla —
       el mismo criterio con el que `MonoAncho` no cierra su rango al enum de lo
       visto. Cuando haya una segunda instancia se sabrá si hay defecto. */
    { name: "metodo", type: "select", required: true, options: ["POST", "GET"] },
    { name: "textoBoton", type: "text", required: true },
    {
      name: "campos",
      type: "array",
      minRows: 1,
      fields: [
        /* El `name` SERVIDO, verbatim: `field[27]` no se normaliza a `pais`
           porque es la llave que el destino espera (§fidelidad al dato). */
        { name: "nombre", type: "text", required: true },
        {
          name: "tipo",
          type: "select",
          required: true,
          /* El enum es el de los tipos OBSERVADOS, no el de HTML entero: una
             cota es una muestra convertida en regla (§*el RANGO no es el enum
             de lo visto*, al revés — aquí se declara que son los medidos). */
          options: ["texto", "seleccion", "casillas"],
        },
        { name: "etiqueta", type: "text" },
        { name: "requerido", type: "checkbox" },
        {
          name: "opciones",
          type: "array",
          fields: [
            { name: "valor", type: "text" },
            { name: "texto", type: "text", required: true },
          ],
        },
      ],
    },
    {
      /* Los 12 ocultos van con su `name` y su `value` verbatim: son el estado
         de ActiveCampaign (`u` · `f` · `act=sub` · `or=<hash>` · 3 de UTM …).
         Sin ellos el `<form>` del original no es reproducible, y §regla 1 se
         pronuncia sobre lo servido, no sobre lo que se ve. */
      name: "ocultos",
      type: "array",
      fields: [
        { name: "nombre", type: "text", required: true },
        { name: "valor", type: "text" },
      ],
    },
  ],
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
  /* `FORMULARIO` va donde estaba el dato de `CODIGO`: es su instancia la que
     pasa aquí (CMS-6 · C). `CODIGO` se queda detrás, con 0 instancias
     declaradas y su razón escrita arriba. */
  FORMULARIO,
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
