/**
 * LA UNIÓN PROPIA DE LA COLA LARGA — CMS-3 (`ESQUEMA-CMS.md` §2j), escrita en
 * la 92.ª tanda sobre las **32 páginas capturadas con sus hojas**.
 *
 * ── Por qué unión PROPIA y no `MODULOS_COMPARTIDOS` ────────────────────────
 * Es el camino que `articulos-kb` abrió y que §2j ratificó: `MODULOS_KB` **no**
 * consume `MODULOS_COMPARTIDOS`, declara los suyos. Meter `video`/`toggle`/
 * `code` en el compartido los metería en `MonoSeccion[]` por la puerta de
 * atrás, y SECTOR y MONOGRÁFICO **no tienen ninguno de los tres medido** — que
 * es el arreglo falso de §1.5b Razón 1. `MonoSeccion[]` no se toca.
 *
 * Lo compartido sí se CONSUME: `medida()`, `anchoPct`, `campoHtml`, `subida`,
 * `nivelTitular`, `CAMPOS_MODULO_IMAGEN`, `CAMPOS_MODULO_BOTON`. *Lo que se
 * duplica es el documento, no la definición* (§1.5b) — dos declaraciones de
 * «la imagen de un módulo» son la clase C7.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA MITAD QUE HAY QUE LEER ANTES DE USAR ESTE FICHERO: **CINCO DE LAS OCHO
 * DEFINICIONES NUEVAS DESCANSAN EN n ≤ 2 PÁGINAS, Y TRES EN n = 1.**
 *
 * Este repo tiene escrito que **un discriminador hallado en una sola instancia
 * no es un discriminador**, y que **una propiedad que no pasa ninguno de los
 * dos tests no está probada como plantilla: está SIN PROBAR — y SIN PROBAR no
 * se cablea**. Así que estos bloques se escriben con **lo que la instancia
 * lleva seguro** y con **lo que NO está probado declarado con su n**, nunca
 * con los valores de su única instancia convertidos en el modelo.
 *
 * | bloque | n páginas | n instancias | qué NO se puede decidir con esa n |
 * |---|---|---|---|
 * | `codigo`   | 9 | 9 | nada pendiente: es HTML crudo, no tiene forma que decidir |
 * | `toggle`   | 5 | 10 | si «abierto por defecto» es campo o plantilla |
 * | `video`    | 5 | 30 | si el proveedor del `iframe` es un enum o texto libre |
 * | `slider-completo` | **2** | **2** | **todo lo que no sea el array de diapositivas** |
 * | `mapa`     | **1** | **1** | **si el pin es uno o varios; si el zoom es campo** |
 * | `slider`   | **1** | **1** | **si difiere del `fullwidth` en algo más que el ancho** |
 * | `icono`    | **1** | **3** | **si el icono es enum, fuente o imagen** |
 *
 * **Y el corolario que evita el arreglo falso:** cuando para un tipo de n = 1
 * no se pueda distinguir plantilla de campo, **ésa es la respuesta y se
 * escribe** — el campo no se inventa. Lo que la instancia trae seguro va como
 * campo; lo demás va al componente **y queda SIN PROBAR anotado**, para que la
 * segunda instancia lo re-mida en vez de heredar un enum inventado.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── Fuente de cada n ───────────────────────────────────────────────────────
 * `docs/research/cola-larga/derivaciones/arbol-f33.log` §4, que parsea las 32
 * capturas con pila de anidamiento y **cuadra con `mod-v4.log`** —otro
 * instrumento, otro método— en 12 de 12 tipos, con **una** discrepancia
 * declarada y explicada (`slide`, ver abajo).
 */
import type { Block, Field } from "payload";

import { anchoPct, campoHtml, medida, subida } from "../campos/comunes.ts";
import {
  CAMPOS_MODULO_BOTON,
  CAMPOS_MODULO_IMAGEN,
  ancho,
  nivelTitular,
} from "./contenido.ts";

/* ══════════════════════════════════════════════════════════════════════════
 * EL RITMO — el de KB, con UNIDAD, y por la misma razón medida
 *
 * `ritmoModulo` (compartido) guarda `number`, o sea px implícitos. Estas
 * páginas son de BUILDER, así que el editor escribió **px absolutos Y
 * porcentajes**, que a 1440 dan el mismo número (§*un default expresado como
 * porcentaje se lee como constante en cuanto se cita*). Guardar `2 %` en un
 * `number` lo convierte en `2px` sin dar error.
 *
 * ⚠ **NO se reutiliza `ritmoModuloKb` y esto NO es la clase C7.** Lo compartido
 * es la PRIMITIVA —`medida()`, una sola definición de «un valor con su
 * unidad»—; lo que difiere es la COMPOSICIÓN, y aquí todavía **no está
 * medida**: ninguna sonda ha comparado un solo eje de estas 32 contra el
 * original (`COBERTURA-MEDICION`, 0/32). Se declara la misma composición que
 * KB **como punto de partida SIN PROBAR**, no como medida.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **SIN PROBAR: el ritmo de este arquetipo no está medido.** Se copia la
 * composición de KB (`mt`·`mb`·`pb`) porque es el arquetipo de builder más
 * cercano que sí lo tiene medido, y se marca para que la primera tanda que
 * mida estas páginas lo derive en vez de heredarlo. Un ritmo heredado que
 * nadie midió es exactamente el arreglo falso: cablea el valor de otra página.
 */
export const ritmoModuloPagina: Field = {
  name: "ritmo",
  type: "group",
  fields: [
    medida("mt", "SIN PROBAR — 0 ejes comparados en las 32 (COBERTURA-MEDICION)"),
    medida("mb", "SIN PROBAR — el defecto lo da `mbPorDefecto(anchoFila, tipoColumna)`"),
    medida("pb", "SIN PROBAR — 0 ejes comparados en las 32"),
  ],
};

/** Base de todo módulo de la cola larga: su ritmo (con unidad) y su ancho. */
export const moduloBasePagina: Field[] = [ritmoModuloPagina, anchoPct];

/* ══════════════════════════════════════════════════════════════════════════
 * LOS TRES QUE `MonoSeccion[]` YA EXPRESA — mismo CONTENIDO, otro RITMO
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `text` — **151 instancias en 29 de 32 páginas**, el tipo mayoritario con
 * diferencia.
 *
 * **Es un campo RICO, y lo dice el censo**: 94/151 traen encabezado, 27/151
 * traen `<a href>` y 3/151 traen `<img>` DENTRO del texto. Es exactamente la
 * frontera que este repo ya declara — *hasta el contenedor de contenido la
 * estructura se modela; a partir de ahí el contenido lleva su propia
 * estructura y se declara RICO*. Modelarlo como bloques tipados sería inventar
 * un esquema para documentos que ya tienen uno.
 */
export const MODULO_TEXTO_PAGINA: Block = {
  slug: "texto-pagina",
  labels: { singular: "Texto", plural: "Textos" },
  fields: [campoHtml("html", { requerido: true }), ...moduloBasePagina],
};

/**
 * `image` — **71 instancias en 19 páginas**. `<img>` en 71/71 y **18/71
 * envueltas en `<a href>`**, así que el enlace es CAMPO OPCIONAL: varía entre
 * hermanos de la misma página (test B).
 *
 * ⚠ **`srcset` queda FUERA, y es omisión DECLARADA, no medida** — igual que en
 * `MODULO_IMAGEN_KB`: M-IMG sigue abierta en §CMS-0b y resolverla de paso, en
 * la tanda que estrena el arquetipo, es cómo se fabrica una decisión sin
 * medida.
 */
export const MODULO_IMAGEN_PAGINA: Block = {
  slug: "imagen-pagina",
  labels: { singular: "Imagen", plural: "Imágenes" },
  fields: [
    ...CAMPOS_MODULO_IMAGEN,
    { name: "href", type: "text" },
    { name: "external", type: "checkbox" },
    ...moduloBasePagina,
  ],
};

/**
 * `button` — **13 instancias en 6 páginas**.
 *
 * ⚠ **`boton-azul` es CAMPO, con su n: 4 de 13.** Es una clase que el editor
 * pone y que **varía entre hermanos**, así que pasa el test B. Y su nombre es
 * el que `CLAUDE.md` cita como el caso de §sondas 4 cometida sobre un `grep`
 * —*la regla que faltaba se llamaba `.boton-azul` y el filtro exigía `button`
 * en el selector*—, o sea que aquí hay evidencia de que **cambia el render**.
 *
 * ⚠ **Y lleva ritmo, al contrario que `MODULO_BOTON` compartido.** Aquél lo
 * omite por una medida del monográfico (`mb 16` fijo en 7/7). Aquí **no está
 * medido**, así que se le da ritmo (el caso general) y se anota: si al medir
 * resulta fijo, se quita. Omitirlo por analogía sería heredar la medida de otro
 * arquetipo.
 */
export const MODULO_BOTON_PAGINA: Block = {
  slug: "boton-pagina",
  labels: { singular: "Botón", plural: "Botones" },
  fields: [
    ...CAMPOS_MODULO_BOTON,
    {
      name: "piel",
      type: "select",
      options: [
        { label: "Por defecto", value: "defecto" },
        { label: "Azul (boton-azul)", value: "azul" },
      ],
      defaultValue: "defecto",
      admin: { description: "`boton-azul` — 4 de 13 instancias (arbol-f33.log §4)" },
    },
    ...moduloBasePagina,
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL QUE SE COPIA DE OTRA UNIÓN — `blurb`
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `blurb` — **22 instancias en 3 páginas**. El bloque **ya existe** en
 * `MODULOS_KB` y **no se re-declara**: se consume desde allí (ver
 * `MODULOS_PAGINA`). Dos definiciones de «blurb» son la clase C7, y las dos
 * saldrían verdes mientras divergen.
 *
 * ⚠ **Pero su RETÍCULA no coincide con la medida de KB, y hay que decirlo.**
 * KB midió `iconos-xs-2 iconos-md-3` · `col-md-4` · ninguna. Aquí el censo da
 * **`iconos-xs-2` 13/22 · `iconos-md-4` 8/22 · `iconos-md-3` 5/22**, o sea un
 * valor —`iconos-md-4`— que **el enum de KB no tiene**. Consumir el bloque tal
 * cual dejaría 8 instancias sin representar.
 *
 * Es §*una regla derivada sobre un dominio donde el caso NO SE DA está SIN
 * PROBAR para ese caso*: el enum de KB es correcto **en KB** y **incompleto
 * fuera**. Ficha: `F3-3-RETICULA-BLURB`. **No se amplía aquí de paso** — se
 * mide contra qué defecto compara cada valor, como se hizo en KB.
 */

/* ══════════════════════════════════════════════════════════════════════════
 * LAS OCHO DEFINICIONES NUEVAS — con su n al lado y su SIN PROBAR declarado
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `code` — **9 instancias en 9 páginas** (una por página; ninguna las repite).
 *
 * **n alto y forma trivial: no hay nada que decidir.** El censo dice `<img>`
 * 0/9, `<a>` 0/9, encabezado 0/9, texto 9/9. Es HTML crudo que el editor pega,
 * y su modelo correcto es **un solo campo de texto**, no un árbol.
 *
 * ⚠ **NO pasa por `campoHtml`, y es deliberado.** `campoHtml` valida contra el
 * censo de etiquetas del cuerpo rico (§campo-rico), y el módulo `code` de Divi
 * existe **precisamente** para meter lo que ese censo prohíbe —formularios,
 * `<script>`, embebidos de terceros—. Validarlo con la whitelist del cuerpo
 * rico rechazaría dato real del original.
 *
 * ⚠ **Y por eso mismo es el que más SIN PROBAR arrastra en SEGURIDAD**: un
 * campo que admite `<script>` es un canal de ejecución. Qué se le permite y
 * quién puede editarlo **no lo decide esta tanda**: ficha `F3-3-CODE-SEGURIDAD`.
 */
export const MODULO_CODIGO: Block = {
  slug: "codigo",
  labels: { singular: "Código", plural: "Códigos" },
  fields: [
    {
      name: "html",
      type: "code",
      required: true,
      admin: {
        language: "html",
        description:
          "HTML crudo del módulo `et_pb_code`. NO se valida contra el censo del cuerpo rico: " +
          "este módulo existe para meter lo que ese censo prohíbe. 9 instancias en 9 páginas.",
      },
    },
    ...moduloBasePagina,
  ],
};

/**
 * `toggle` — **10 instancias en 5 páginas** (los 5 hubs de KB con
 * `…/articulos-de-ayuda/` o índice).
 *
 * Censo: encabezado 10/10, texto 10/10, `<a href>` **10/10**. O sea: un título
 * y un cuerpo RICO que siempre trae enlaces. Los dos son campo.
 *
 * ⚠ **SIN PROBAR con n = 5 páginas: si «abierto por defecto» es campo.** Divi
 * tiene el ajuste (`et_pb_toggle_open` / `et_pb_toggle_close`) pero el censo no
 * halló ninguna clase que no esté en las 10 — o sea **varianza cero**, y
 * *varianza cero no prueba plantilla: prueba que en las instancias que existen
 * nadie lo tocó*. No se cablea como campo (sería inventarse un booleano) y no
 * se da por plantilla. Ficha `F3-3-TOGGLE-ABIERTO`.
 */
export const MODULO_TOGGLE: Block = {
  slug: "toggle",
  labels: { singular: "Desplegable", plural: "Desplegables" },
  fields: [
    { name: "titulo", type: "text", required: true },
    nivelTitular,
    campoHtml("cuerpo", { requerido: true }),
    ...moduloBasePagina,
  ],
};

/**
 * `video` — **30 instancias en 5 páginas**, todas de la familia del centro de
 * ayuda.
 *
 * Censo: `<iframe>` **30/30**, `<img>` 0/30, texto 0/30. O sea que el módulo
 * **no tiene contenido propio**: sólo la URL embebida. Un solo campo.
 *
 * ⚠ **SIN PROBAR: si el proveedor es un enum.** Las 30 son del mismo sitio, así
 * que «siempre es este proveedor» es una afirmación sobre 5 páginas de una sola
 * familia. Se guarda la **URL completa** —que es lo servido— en vez de
 * `{proveedor, id}`, que sería un enum derivado de un dominio de uno.
 * Ficha `F3-3-VIDEO-PROVEEDOR`.
 *
 * ⚠ **Y `poster`/`portada` NO entra**: 0/30 en el censo. Un campo que ninguna
 * instancia ejercita es un camino de render sin estrenar, no un campo.
 */
export const MODULO_VIDEO: Block = {
  slug: "video-pagina",
  labels: { singular: "Vídeo", plural: "Vídeos" },
  fields: [
    {
      name: "embedUrl",
      type: "text",
      required: true,
      admin: { description: "`src` del `<iframe>`, tal cual. 30/30 instancias lo traen." },
    },
    { name: "titulo", type: "text", admin: { description: "`title` del iframe. Es lo que lee un lector de pantalla." } },
    ...moduloBasePagina,
  ],
};

/**
 * La DIAPOSITIVA — **y no es un bloque de la unión: es el array interno del
 * slider.** Es el hallazgo estructural de la 92.ª y contesta P-S1 y P-S2 del
 * pre-registro **offline**, sin abrir el original:
 *
 *   `et_pb_fullwidth_slider_0 > et_pb_slides > et_pb_slide_0`
 *
 * `mod-v4.log` la contaba como tipo de primer nivel porque barre el documento
 * con un regex plano; el árbol con pila dice que está **dentro**. Los dos
 * instrumentos son correctos en lo que miden — y sólo uno contesta la pregunta
 * que el pre-registro hacía. Por eso **la unión son 11 bloques, no 12**.
 *
 * ⚠ **n = 2 páginas / 2 sliders.** Lo que la diapositiva trae seguro:
 * encabezado 2/2, texto 2/2, `<a href>` 2/2. Todo lo demás —fondo, alineación
 * del medio, duración— **SIN PROBAR**: `et_pb_media_alignment_center` y
 * `et_pb_bg_layout_dark` salen en las 2, o sea varianza cero sobre n = 2.
 */
export const CAMPOS_DIAPOSITIVA: Field[] = [
  { name: "titulo", type: "text", required: true },
  nivelTitular,
  campoHtml("cuerpo"),
  { name: "botonLabel", type: "text" },
  { name: "botonHref", type: "text" },
  subida("fondo"),
];

/**
 * `fullwidth_slider` — **2 instancias en 2 páginas** (`/es/contacto/` y
 * `/es/empresa/`). Cuelga **de la sección, sin fila**: es una de las 2
 * apariciones de `seccion>modulo (sin fila)` que el árbol encontró, y por eso
 * la colección tiene que admitir módulos a nivel de sección (ver §nota en
 * `paginas.ts` de colecciones).
 *
 * ⚠⚠ **n = 2, y aquí es donde el repo obliga a parar.** Con dos instancias no
 * se puede separar plantilla de campo para NADA que no sea el contenido de las
 * diapositivas: las dos traen las mismas clases, así que cualquier eje
 * «discrimina» trivialmente. Se escribe el array de diapositivas —que es lo
 * que las dos traen seguro— y **se declara SIN PROBAR el resto**: autoplay,
 * transición, flechas, puntos, alto. Ficha `F3-3-SLIDER-AJUSTES`.
 */
export const MODULO_SLIDER_COMPLETO: Block = {
  slug: "slider-completo",
  labels: { singular: "Slider a todo ancho", plural: "Sliders a todo ancho" },
  fields: [
    {
      name: "diapositivas",
      type: "array",
      required: true,
      minRows: 1,
      fields: CAMPOS_DIAPOSITIVA,
      admin: { description: "`et_pb_slide` — hijo del slider, no bloque de la unión (P-S2, 2/2)" },
    },
  ],
};

/**
 * `slider` — **1 instancia en 1 página** (`/es/empresa/`, el carrusel de
 * testimonios).
 *
 * ⚠⚠ **n = 1: NO SE PUEDE DECIDIR si difiere de `slider-completo` en algo más
 * que el ancho, y ÉSA ES LA RESPUESTA.** Con una sola instancia cualquier eje
 * posicional «los separa» —§*un discriminador hallado en una sola instancia no
 * es un discriminador*—. Las dos salidas posibles serían igual de
 * defendibles:
 *
 *   · **fusionarlos** en un bloque con campo `ancho: completo | fila` — y si
 *     resulta que difieren en más, habría que separar luego (el lado caro);
 *   · **dejarlos separados** — y si resulta que no difieren, fusionar luego
 *     (el lado barato, §1.5b Razón 3: *se toma la separada, porque deshacerla
 *     es fusionar y fusionar es el lado barato*).
 *
 * Se toman **separados**, y el criterio se cita CON SU OPERACIÓN para que el
 * signo no se pueda invertir al releerlo (§regla 23). **Condición de
 * reapertura: la segunda instancia de cualquiera de los dos.**
 */
export const MODULO_SLIDER: Block = {
  slug: "slider",
  labels: { singular: "Slider en fila", plural: "Sliders en fila" },
  fields: [
    {
      name: "diapositivas",
      type: "array",
      required: true,
      minRows: 1,
      fields: CAMPOS_DIAPOSITIVA,
    },
    ...moduloBasePagina,
  ],
};

/**
 * `map` — **1 instancia en 1 página** (`/es/contacto/`).
 *
 * Lo que trae seguro: encabezado 1/1, texto 1/1 (la dirección de Kunak).
 *
 * ⚠⚠ **n = 1, y estos dos NO se pueden decidir — se escriben como no decididos:**
 *
 *   · **¿un pin o varios?** Divi permite N. Aquí hay uno. Un `array` con
 *     `minRows: 1` admite los dos casos **sin afirmar cuál es**, que es lo
 *     único honesto con n = 1: un campo escalar afirmaría «siempre uno»;
 *   · **¿el zoom y el centro son campo o plantilla?** No se puede saber, y
 *     **no se cablean**. Divi los guarda en atributos `data-*`; leerlos de la
 *     única instancia y convertirlos en defecto es cablear el valor de la
 *     primera instancia, que es el arreglo falso con su nombre.
 *
 * Ficha `F3-3-MAPA-AJUSTES`.
 */
export const MODULO_MAPA: Block = {
  slug: "mapa",
  labels: { singular: "Mapa", plural: "Mapas" },
  fields: [
    {
      name: "pines",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "titulo", type: "text", required: true },
        campoHtml("descripcion"),
        { name: "lat", type: "text" },
        { name: "lng", type: "text" },
      ],
      admin: { description: "array y no escalar: con n = 1 no se puede afirmar «siempre uno»" },
    },
    ...moduloBasePagina,
  ],
};

/**
 * `icon` — **3 instancias en 1 página** (`/es/soporte/`).
 *
 * ⚠⚠ **n = 1 PÁGINA, y la pregunta que no se puede contestar es CUÁL ES EL
 * DATO DEL ICONO.** Divi lo sirve como un carácter de su fuente de iconos
 * (`data-icon`), pero **con una sola página no se puede saber** si el modelo
 * correcto es un enum cerrado, un carácter libre o una subida de imagen — y
 * las tres producirían un render idéntico en esta instancia. **Cero instancias
 * separadoras.**
 *
 * Se guarda **el carácter servido, como texto**, que es lo que el original
 * emite (§*verificar contra la salida servida*), y se declara que **no es una
 * decisión de modelo: es una transcripción a la espera de la segunda página**.
 * Ficha `F3-3-ICONO-DATO`.
 */
export const MODULO_ICONO: Block = {
  slug: "icono",
  labels: { singular: "Icono", plural: "Iconos" },
  fields: [
    {
      name: "icono",
      type: "text",
      required: true,
      admin: {
        description:
          "El carácter de la fuente de iconos, tal cual lo sirve Divi (`data-icon`). " +
          "n = 1 página: enum / carácter / imagen son indistinguibles aquí — F3-3-ICONO-DATO.",
      },
    },
    { name: "texto", type: "text" },
    ...moduloBasePagina,
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 * LA UNIÓN — 11 bloques de primer nivel
 *
 * `blurb` se CONSUME de `MODULOS_KB` (no se re-declara: clase C7). `slide` NO
 * está: es el array interno de los dos sliders, medido en 2/2.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Se importa aquí abajo para que la nota de arriba explique el porqué antes. */
import { MODULO_BLURB } from "./kb.ts";

export const MODULOS_PAGINA: Block[] = [
  MODULO_TEXTO_PAGINA,
  MODULO_IMAGEN_PAGINA,
  MODULO_BOTON_PAGINA,
  MODULO_CODIGO,
  MODULO_TOGGLE,
  MODULO_VIDEO,
  MODULO_BLURB,
  MODULO_SLIDER_COMPLETO,
  MODULO_SLIDER,
  MODULO_MAPA,
  MODULO_ICONO,
];

/* ══════════════════════════════════════════════════════════════════════════
 * LA RETÍCULA — sección → fila → columna → módulo
 *
 * ⚠ **Este arquetipo SÍ tiene nivel de SECCIÓN, y `articulos-kb` NO.** En KB la
 * sección es una en las 6 instancias (varianza cero ⇒ plantilla) y por eso su
 * cuerpo empieza en la fila. Aquí el censo da **86 secciones en 32 páginas**,
 * de **0 a 11 por página** — o sea el editor las compone, y son campo.
 *
 * Los siete repartos de columna medidos suman 1 **los siete**, así que la regla
 * de la retícula de KB vale aquí igual y se reutiliza el mismo validador de
 * forma (`4_4` · `1_2+1_2` · `1_3+2_3` · `1_3+1_3+1_3` · `2_3+1_3` ·
 * `1_5×5` · `1_4×4`).
 * ═════════════════════════════════════════════════════════════════════════ */

export const columnasPagina: Field = {
  name: "columnas",
  type: "array",
  required: true,
  minRows: 1,
  fields: [
    ancho,
    { name: "modulos", type: "blocks", blocks: MODULOS_PAGINA, required: true, custom: { conKind: true } },
  ],
};

/**
 * ⚠ **La regla de la retícula, DERIVADA de las 113 filas** — los 7 repartos
 * vistos suman 1 sin excepción (`arbol-f33.log` §2). Sin ella el dato admite
 * `1_2 + 1_3`, que no es una fila que el original pueda producir, y se
 * renderizaría torcida sin dar error (§regla 6: la ausencia se rechaza).
 */
export function validaReticulaPagina(valor: unknown): true | string {
  if (!Array.isArray(valor)) return true;
  for (const [i, sec] of valor.entries()) {
    const filas = (sec as { filas?: { columnas?: { ancho?: string }[] }[] })?.filas;
    if (!Array.isArray(filas)) continue;
    for (const [j, fila] of filas.entries()) {
      const cols = fila?.columnas;
      if (!Array.isArray(cols) || cols.length === 0) continue;
      let suma = 0;
      for (const c of cols) {
        const m = /^(\d+)_(\d+)$/.exec(String(c?.ancho ?? ""));
        if (!m) return `Sección ${i + 1}, fila ${j + 1}: columna con \`ancho\` ilegible ("${c?.ancho}").`;
        suma += Number(m[1]) / Number(m[2]);
      }
      if (Math.abs(suma - 1) > 1e-6)
        return (
          `Sección ${i + 1}, fila ${j + 1}: los anchos de sus ${cols.length} columnas suman ` +
          `${suma.toFixed(4)}, no 1. Los siete repartos medidos en las 113 filas son ` +
          `\`4_4\` · \`1_2+1_2\` · \`1_3+2_3\` · \`1_3+1_3+1_3\` · \`2_3+1_3\` · ` +
          `\`1_5+1_5+1_5+1_5+1_5\` · \`1_4+1_4+1_4+1_4\`.`
        );
    }
  }
  return true;
}

export const CAMPOS_FILA_PAGINA: Field[] = [
  medida("pt", "SIN PROBAR — 0 ejes comparados en las 32 (COBERTURA-MEDICION)"),
  medida("pb", "SIN PROBAR — ídem"),
  medida("mt", "SIN PROBAR — ídem"),
  medida("mb", "SIN PROBAR — ídem"),
  columnasPagina,
];

/**
 * `bloques` — LA LISTA DE SECCIONES.
 *
 * ⚠ **Los módulos a nivel de SECCIÓN no son un adorno: el árbol encontró 2**
 * (`seccion>modulo (sin fila)`), y son los dos `fullwidth_slider`. En Divi los
 * módulos *fullwidth* cuelgan de la sección sin pasar por fila. Si `bloques`
 * sólo admitiera filas, esas 2 instancias **no se podrían expresar** — y el
 * fallo sería silencioso: la página saldría con 200 y sin su slider.
 *
 * ⚠⚠ **Y es OPCIONAL, que es el coste conocido de C3** (§2j.1, §1.5b Razón 2):
 * la obligatoriedad deja de vivir en el esquema. **No es un descubrimiento de
 * esta tanda** — se paga a cambio de no partir la cola larga en dos colecciones
 * que R1 no sostiene.
 */
export const bloquesPagina: Field = {
  name: "bloques",
  type: "array",
  required: false,
  fields: [
    medida("pt", "SIN PROBAR — 0 ejes comparados en las 32"),
    medida("pb", "SIN PROBAR — ídem"),
    {
      name: "modulosSueltos",
      type: "blocks",
      blocks: MODULOS_PAGINA,
      required: false,
      custom: { conKind: true },
      admin: { description: "Módulos *fullwidth* que cuelgan de la sección sin fila. 2 medidos en 32 páginas." },
    },
    { name: "filas", type: "array", required: false, fields: CAMPOS_FILA_PAGINA },
  ],
  validate: validaReticulaPagina,
} as Field;
