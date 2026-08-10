/**
 * LA UNIÓN PROPIA DE `articulos-kb` — §2d.1, y **medida** por `qa:kb-recon`
 * sobre la captura congelada de F3-0 (36 blurbs y 1 galería en 6 instancias).
 *
 * ── Por qué vive aquí y no en `contenido.ts` ───────────────────────────────
 * §2d.1 lo decidió con predicado: *«tipo propio por arquetipo; `MonoModulo`
 * intacto. `blurb`/`gallery` → unión propia de `articulos-kb`»*, porque P-K1
 * salió ❌ — **no aparecen en SECTOR ni en MONOGRÁFICO**. Meterlos en
 * `MODULOS_COMPARTIDOS` los metería en `MonoSeccion[]` por la puerta de atrás,
 * que es el arreglo falso de §1.5b Razón 1.
 *
 * Y la otra mitad de la misma decisión: **lo compartido se CONSUME, no se
 * duplica** — *lo que se duplica es el documento, no la definición*. Por eso
 * este fichero **importa** `moduloBase`, `nivelTitular`, `inline` y `subida` en
 * vez de re-escribirlos: dos definiciones de «el nivel del titular» es la clase
 * C7, y las dos salidas seguirían verdes mientras divergen.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE LA MEDIDA DICE DE CADA CAMPO — `medidas/kb-recon.json`
 *
 * Régimen: capa propia de BUILDER (el centro de ayuda es híbrido), así que el
 * discriminador es la **varianza entre hermanos** (test B). Alcance: **36
 * blurbs en 3 artículos**, que es todo lo que el arquetipo tiene.
 *
 * | propiedad | medido | veredicto |
 * |---|---|---|
 * | `imagen` | 30/36 | **opcional** — 6 blurbs no la traen |
 * | `descripcion` | 24/36 | **opcional** — 12 no la traen |
 * | nivel del titular | `h4`×27 · `h3`×9 | **CAMPO** — varía entre instancias |
 * | retícula | `iconos-xs-2 iconos-md-3`×24 · `col-md-4`×9 · ninguna×3 | **CAMPO**, y con TRES valores |
 * | alineación | `center`×27 · `left`×9 | **CAMPO** |
 * | enlace | **0/36** | **NO EXISTE** — no se añade |
 *
 * ⚠ **Y lo que NO se cablea, con su nombre:** `et_pb_blurb_position_top` y
 * `et_pb_bg_layout_light` salen **36/36**, y `estiloInline` es `null` en las
 * 36. Cero varianza **no prueba plantilla**: prueba que en las instancias que
 * existen nadie lo tocó. Van al componente y quedan **SIN PROBAR** anotados —
 * cablearlos como campo con un solo valor es inventarse un enum, y darlos por
 * plantilla es lo que costó las ocho propiedades del monográfico.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { Block } from "payload";
import { anchoPct, campoHtml, conDefecto, medida, subida } from "../campos/comunes.ts";
import type { Field } from "payload";
import { CAMPOS_MODULO_BOTON, CAMPOS_MODULO_IMAGEN, ancho, nivelTitular } from "./contenido.ts";

/* ══════════════════════════════════════════════════════════════════════════
 * EL RITMO DE ESTE ARQUETIPO — el mismo concepto que `ritmoModulo`, OTRO TIPO
 *
 * `campos/comunes.ts` ya tiene `ritmoModulo` y lo consumen SECTOR, MONOGRÁFICO
 * y `productos`. **No se reutiliza aquí, y no es por gusto:** sus campos son
 * `number`, o sea px implícitos, y el dato medido de KB trae **porcentajes
 * escritos por el editor** que a 1440 dan el mismo número
 * (`cuerpo.spec.md` §2.1). Guardar `2 %` en un `number` lo convierte en `2px`
 * sin dar error.
 *
 * ⚠ **Y esto NO es la clase C7 (dos definiciones de «lo mismo»), aunque se le
 * parezca.** Lo compartido es la PRIMITIVA —`medida()`, una sola definición de
 * «un valor de ritmo con su unidad»—; lo que difiere es la COMPOSICIÓN, porque
 * lo medido difiere: KB usa `mt`·`mb`·`pb` y no tiene `pr` ni `pt` (0 en los
 * 143 ⇒ SIN EVIDENCIA, y un campo que ninguna instancia ejercita es un camino
 * de render sin estrenar, no un campo).
 *
 * El día que se pague §F3-1-RITMO-SIN-UNIDAD, `ritmoModulo` pasa a esta misma
 * primitiva y las dos composiciones convergen **por medida**, no por ganas.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `mt` · `mb` · `pb` del módulo. Ver `mbPorDefecto()` en `defaults.ts`: el
 * defecto de `mb` **no es un número**, es una función del ancho de la fila.
 */
export const ritmoModuloKb: Field = {
  name: "ritmo",
  type: "group",
  fields: [
    medida("mt", "modulos.spec.md §1.3 — `0`×121 · `−25`×6 · `−18→0`×14 · `−15`×2"),
    medida("mb", "modulos.spec.md §1.3 — 9 pares; el defecto lo da `mbPorDefecto(anchoFila, tipoColumna)`"),
    medida("pb", "modulos.spec.md §1.3 — `0`×141 · `35`×2"),
  ],
};

/** Base de todo módulo de KB: su ritmo (con unidad) y su ancho. */
export const moduloBaseKb: Field[] = [ritmoModuloKb, anchoPct];

/**
 * La retícula del blurb — **el número de columnas que el editor le pone**, y es
 * lo que Divi escribe como clase de módulo. Tres valores medidos y ninguno
 * inventado: `iconos` (xs-2/md-3) · `col-md-4` · ninguna.
 *
 * ⚠ **`ninguna` es un valor, no la ausencia del campo.** Los 3 blurbs de
 * `que-puedes-hacer-con-kunak-air` que no llevan clase de retícula la tienen
 * *deliberadamente* quitada por quien editó, y eso los pinta a ancho completo.
 * Modelarlo como «campo ausente» obligaría a distinguir «no lo puso» de «lo
 * quitó», que es la ambigüedad que §7e acaba de cerrar por el otro lado.
 */
export const reticulaBlurb: Field = conDefecto(
  { name: "reticula", type: "select", options: ["iconos", "col-md-4", "ninguna"] } as Field,
  "iconos",
  "kb-recon · iconos×24 · col-md-4×9 · ninguna×3",
);

/** Alineación del contenido del blurb. `center`×27 · `left`×9. */
export const alineacionBlurb: Field = conDefecto(
  { name: "alineacion", type: "select", options: ["center", "left"] } as Field,
  "center",
  "kb-recon · center×27 · left×9",
);

/**
 * `blurb` — icono + titular + descripción. El módulo más numeroso del
 * arquetipo (36) y el que HD1 no podía expresar.
 *
 * `imagen` usa **`subida`** y no `imagen()`: es la misma relación a `media` que
 * el resto del proyecto, importada, no una segunda definición.
 *
 * ⚠⚠ **`descripcion` era `inline` sobre una afirmación FALSA, y se corrige aquí
 * con la medida delante (2026-08-09, §2d.3).** Esta cabecera decía:
 *
 *   > *«lo medido son `<p>` con texto, sin una sola etiqueta fuera de ese
 *   > conjunto en los 24. Si aparece una, se amplía el campo con la medida
 *   > delante»*
 *
 * La segunda frase es la regla correcta; **la primera no se había derivado**.
 * Recorriendo `medidas/kb-recon.json → descripcionHtml` (los mismos bytes que ya
 * estaban congelados cuando se escribió): **`p×24 · br×1 · img×6`**. Los 6
 * `<img>` son las capturas de pantalla de `que-es-kunak-air` **dentro de la
 * descripción del blurb**, no en su icono.
 *
 * O sea que el tipo medido es **rico de bloque** ⇒ `campoHtml`, igual que el
 * `cuerpo` de grupo A. Es §sondas 9 —*un recuento afirmado de memoria se barre
 * antes de usarse*— cobrada sobre una cabecera que citaba «los 24» sin haberlos
 * recorrido, y es la **tercera** instancia de `inline` prestado a un campo cuyo
 * tipo medido es rico (§2d.3): `productos.bullets` · `MODULO_TEXTO` · ésta.
 */
export const MODULO_BLURB: Block = {
  slug: "blurb",
  labels: { singular: "Blurb", plural: "Blurbs" },
  fields: [
    { name: "titulo", type: "text", required: true },
    nivelTitular,
    subida("imagen"),
    { name: "alt", type: "text" },
    campoHtml("descripcion"),
    reticulaBlurb,
    alineacionBlurb,
    ...moduloBaseKb,
  ],
};

/**
 * `gallery` — **1 módulo en las 6 instancias, con 6 items.**
 *
 * ⚠ **Una sola instancia es la FAMILIA DE CALIBRACIÓN**, así que este bloque se
 * escribe con lo que hay y **se declara que no discrimina nada**: con n=1 no se
 * sabe qué es plantilla y qué es campo, exactamente como PRODUCTO/CATÁLOGO/
 * SOFTWARE/API (§precondición 1) y como `anchoPct: 90`, que vivía en una sola
 * de cuatro instancias. El día que aparezca una segunda galería, se re-mide.
 *
 * Por eso `n` NO es un campo: el número de items es la longitud del array, y
 * un campo que duplique una longitud es un dato que puede mentir.
 */
export const MODULO_GALLERY: Block = {
  slug: "gallery",
  labels: { singular: "Galería", plural: "Galerías" },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      fields: [subida("imagen", { requerida: true }), { name: "alt", type: "text" }, { name: "titulo", type: "text" }],
    },
    ...moduloBaseKb,
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 * `texto-kb` — EL MÓDULO DE TEXTO DEL ARQUETIPO, y el acta del escalón
 *
 * Resuelve §F3-1-ESCALON-TEXTO. El acta completa, con su medida y su tabla de
 * poblaciones, está en `ESQUEMA-CMS.md` §2d.3; aquí va lo que hay que saber
 * para leer el código.
 *
 * ── Lo que el escalón preguntaba, y lo que lo disolvió ─────────────────────
 * `qa:kb-recon` midió que el tipo COMPARTIDO (`MODULO_TEXTO`, con `BLOQUES_TEXTO`
 * y textos `inline` = párrafo + negrita) **no expresa** 7 de las 16 etiquetas
 * que traen los 85 `et_pb_text` de KB. El dilema escrito era: ¿módulo propio
 * para KB, o ensanchar el compartido y tocar un tipo poblado?
 *
 * **Ninguna de las dos, porque la pregunta de antes no se había hecho:**
 *
 *   > **¿sobre qué POBLACIÓN se derivó el tipo compartido?**
 *
 * Sobre `MonoInline`, que es **dato TRANSCRITO A MANO** a `apps/web/src/lib`. Y
 * una transcripción **no se puede auditar contra sí misma**: lo que no se
 * transcribió no está ahí para contarlo. Medido contra el ORIGINAL de los 8
 * `/es/sectores/*` (capturados para esto, porque no estaban en ningún corpus)
 * por `npm run qa:texto-poblacion` — un instrumento, dos poblaciones, con
 * control contra `kb-recon`:
 *
 * | en PROSA, fuera del tipo | n |
 * |---|---|
 * | `articulos-kb` (6 páginas · 85 módulos) | `span·sub·a·i·em·img·sup` — **7** |
 * | **SECTOR/MONOGRÁFICO** (8 páginas · 175 módulos de prosa) | `span·sub·td·tr·th·h5·div·br·em·table·thead·tbody` — **12** |
 *
 * O sea que **el tipo ya se le quedaba corto a sus PROPIOS consumidores**, y KB
 * no es el recién llegado que rompe nada: es el primero que se midió contra el
 * original en vez de contra su transcripción. **`inline` no está corto: está
 * INFRA-ESPECIFICADO**, y ensancharlo corrige una medición.
 *
 * ── El segundo testigo, y es el que no admite réplica ──────────────────────
 * La transcripción misma improvisó **tres veces** para rodear lo que su tipo no
 * podía decir, en un solo fichero (`apps/web/src/lib/monografico.ts`):
 *
 *   · l. 585-589 · `<strong>H<sub>2</sub>S…` → `[{b:"H"},{b:"2"},{b:"S…"}]`
 *                  — el subíndice **aplanado a negrita**;
 *   · l. 627·633·639 · `H<sub>2</sub>S, CH<sub>4</sub>` → `"H₂S, CH₄"`
 *                  — **carácter Unicode**, otro apaño, 40 líneas más allá;
 *   · l. 622 · el `<table>` del cuerpo → `kind: "tabla"`, un **kind inventado**.
 *
 * Tres apaños distintos para la misma carencia es la firma de un tipo corto, no
 * de tres decisiones.
 *
 * ── La decisión, que es la FRONTERA que `CLAUDE.md` ya tenía escrita ───────
 *
 *   > *Hasta el contenedor de contenido, la estructura se modela. A partir del
 *   > contenedor, el contenido lleva su propia estructura dentro y se declara
 *   > RICO.*
 *
 * El módulo, su ritmo, su ancho y su sitio en la fila **siguen modelados** —eso
 * es estructura y lo pone quien maquetó—. Lo de dentro es **un campo HTML**,
 * como el `cuerpo` de grupo A y por la misma razón (CMS-0e: *HTML crudo
 * primero*; §3.1d: *el sitio de aterrizaje ES el campo definitivo*). No se
 * inventan 12 formas de bloque para documentos que ya traen la suya.
 *
 * ⚠ **Y lo que este bloque NO hace: tocar `MODULO_TEXTO`.** El compartido queda
 * como está **con su defecto declarado y fechado** (ficha en `PENDIENTES-QA.md`
 * §CLASE-INLINE-PRESTADO), porque ensancharlo bien exige que `MonoInline`, el
 * render y `mapeo`/`vuelta` sepan llevar las marcas nuevas — y eso se prueba con
 * su round-trip, no de paso. **La razón NO es «no se toca lo poblado»**: un
 * ensanchamiento es RETROCOMPATIBLE y ese tabú no aplica (§2d.3).
 * ═════════════════════════════════════════════════════════════════════════ */
export const MODULO_TEXTO_KB: Block = {
  slug: "texto-kb",
  labels: { singular: "Texto (KB)", plural: "Textos (KB)" },
  fields: [
    campoHtml("html", { requerido: true }),
    /**
     * ⚠ **NO lleva `lh`, y es medida, no olvido.** El compartido tiene `lh`
     * porque en el monográfico varía entre hermanos (30.6 · 36 · 45, test B).
     * Aquí `estiloInline` es **`null` en los 85** módulos: el editor no tocó ni
     * la interlínea ni el ancho en ninguno.
     *
     * **Cero varianza no prueba plantilla** — prueba que nadie lo tocó en las
     * instancias que existen. Así que no se cablea un valor **ni** se inventa un
     * campo: queda **SIN PROBAR**, anotado, y lo decide la segunda instancia que
     * lo mueva. El ritmo sí entra, porque es lo que el editor sí tocó.
     */
    ...moduloBaseKb,
  ],
};

/**
 * `image` — **21 módulos**, el mismo CONTENIDO que el compartido y otro RITMO.
 *
 * Consume `CAMPOS_MODULO_IMAGEN` en vez de re-declararlo: la única diferencia
 * medida está en el ritmo, y duplicar `src`/`alt` sería la clase C7.
 *
 * ⚠ **`srcset` NO es campo aquí, y es una omisión DECLARADA, no una medida.**
 * `modulos.spec.md` §3 censó **14 de 21 con `srcset`** y el grupo A sí lo
 * modela (`imagenA`) *porque es la causa de M-IMG*. Aquí se deja fuera con su
 * ficha (§F3-1-SRCSET-KB) en vez de colarlo: M-IMG está abierta en el ESQUEMA
 * (§CMS-0b) y resolverla de paso, en la tanda que estrena el arquetipo, es
 * exactamente cómo se fabrica una decisión sin medida.
 *
 * `alineacion` no entra: **ninguna clase de alineación en las 21**.
 */
export const MODULO_IMAGEN_KB: Block = {
  slug: "imagen-kb",
  labels: { singular: "Imagen (KB)", plural: "Imágenes (KB)" },
  fields: [...CAMPOS_MODULO_IMAGEN, ...moduloBaseKb],
};

/**
 * `button` — **6 módulos, una sola piel** a los dos anchos (`modulos.spec.md`
 * §4). Cero varianza en 6 ⇒ la piel **no se cablea como campo**: va al
 * componente y queda SIN PROBAR con su denominador.
 *
 * ⚠ **Lleva ritmo, y el compartido NO lo lleva — es medida, no descuido.**
 * `MODULO_BOTON` se declaró sin `moduloBase` porque en el monográfico *«el
 * wrapper del botón de Divi no se entera de ser el último de su columna y lleva
 * su `mb 16` fijo en 7 de 7»*. Aquí el wrapper **sí** lo lleva: `mb 34.0469→30`
 * (el default) ×2 · `mb 0` ×4 · `mt −15` ×2, derivado de
 * `kb-spec-{1440,390}.json`. Dos arquetipos, dos medidas, y por eso dos bloques.
 */
export const MODULO_BOTON_KB: Block = {
  slug: "boton-kb",
  labels: { singular: "Botón (KB)", plural: "Botones (KB)" },
  fields: [...CAMPOS_MODULO_BOTON, ...moduloBaseKb],
};

/** La unión propia del arquetipo: los cinco kinds medidos, ninguno más. */
export const MODULOS_KB: Block[] = [
  MODULO_TEXTO_KB,
  MODULO_IMAGEN_KB,
  MODULO_BOTON_KB,
  MODULO_BLURB,
  MODULO_GALLERY,
];

/* ══════════════════════════════════════════════════════════════════════════
 * LA RETÍCULA — el hueco 1 de §2d.4, cerrado con la medida delante
 *
 * `articulos-kb.cuerpo` era `blocks` **plano**, y el original tiene **45 filas
 * en 6 instancias** que se reparten en 1, 2 o 3 columnas
 * (`cuerpo.spec.md` §1). Una lista plana no puede expresar «este texto y esta
 * imagen van en dos columnas de la misma fila», que es lo que hacen 14 de 45.
 *
 * ── Lo que NO entra, y por qué ─────────────────────────────────────────────
 *
 * **1 · No hay nivel de SECCIÓN.** 1 sección propia por artículo, **6/6** ⇒
 * varianza cero ⇒ plantilla (§2d.1). Su `pt: 0` es un CAMPO uniforme —el
 * default es 4 %— que el componente emite **declarando que el test B no pudo
 * confirmarlo**: no hay hermanos a nivel de sección, y su silencio no es «no
 * varía» (`cuerpo.spec.md` §3).
 *
 * **2 · No hay campo `reparto`, y ES el campo.** El spec lo prueba CAMPO por
 * test B (filas hermanas con repartos distintos) y esto lo expresa como **la
 * secuencia de `ancho` de las columnas**, que es dato escrito por el editor y
 * es lo mismo: `4_4` · `1_2+1_2` · `1_3+2_3` · `1_3+1_3+1_3` son exactamente
 * las cuatro secuencias medidas.
 *
 * > ⚠ **Un `select` con los cuatro repartos vistos sería el catch 1 de
 * > `MODELO.md` §2, repetido con el mismo número.** `ancho` se declaró como **la
 * > retícula y no el enum de los valores vistos** porque *«escrito solo desde
 * > EDAR habría salido de CUATRO valores y Petróleo estrena otros cuatro»*.
 * > Aquí también son cuatro, vistos en 6 instancias. Y guardar las dos cosas
 * > —el reparto y los anchos— sería la clase C7: dos representaciones de un
 * > dato, que divergen en silencio.
 *
 * **3 · La columna no lleva ritmo.** `paddingTop`/`paddingBottom` valen 0 en
 * las 60 ⇒ SIN EVIDENCIA; `marginRight` (50.1406 en toda no-última, 0 en toda
 * última) y `marginBottom` (0 → 30 al apilar) son **regla posicional de la
 * retícula**, el falso positivo del test B que `MEDICION.md` §3.2 nombra. Darlos
 * por campo inventaría un `margenDerecho` por columna.
 *
 * **4 · La fila oculta NO se guarda.** 6 de las 45 (`et_pb_row_0 d-none`, una
 * por artículo) llevan el `<h1>Kunak Help Center</h1>`, que **no es contenido
 * del artículo**: es plantilla, y la emite el componente (`cascaron.spec.md`
 * §3). Lo que se guarda son las **39 visibles**.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * La columna. `ancho` es el compartido —**la retícula de Divi**, no el enum de
 * lo visto— y `modulos` la unión propia.
 */
export const columnasKb: Field = {
  name: "columnas",
  type: "array",
  required: true,
  minRows: 1,
  fields: [
    ancho,
    { name: "modulos", type: "blocks", blocks: MODULOS_KB, required: true, custom: { conKind: true } },
  ],
};

/**
 * La fila. Su ritmo va **con unidad** (`medida`), que es la precisión que
 * `cuerpo.spec.md` §2.1 obliga: el editor escribió px absolutos **y**
 * porcentajes, y a 1440 son el mismo número.
 *
 * ⚠ **Los anchos de las columnas tienen que sumar la fila.** Es la regla de la
 * retícula de Divi (`1_3 + 2_3` = 1), derivada y no inventada, y sin ella el
 * dato admite `1_2 + 1_3`, que no es una fila que el original pueda producir.
 * Se rechaza en vez de renderizarse torcida (§regla 6).
 */
export const CAMPOS_FILA_KB: Field[] = [
  medida("pt", "cuerpo.spec.md §2 — default 2 % (18.2344/30); `7·17·19·20` px"),
  medida("pb", "cuerpo.spec.md §2 — default 2 %; `0·1·14·17` px y `0.8 %`"),
  medida("mt", "cuerpo.spec.md §2 — default 0; `25·−2` px y `2 %·5 %·0.4 %`"),
  medida("mb", "cuerpo.spec.md §2 — default 0; `−21` px"),
  columnasKb,
];

/**
 * La regla de la retícula, **derivada**: `1_3 + 2_3 = 1`. Sin ella el dato
 * admite `1_2 + 1_3`, que no es una fila que el original pueda producir — y se
 * renderizaría torcida sin dar error (§regla 6: la ausencia se rechaza).
 */
export function validaReticulaKb(valor: unknown): true | string {
  if (!Array.isArray(valor)) return true;
  for (const [i, fila] of valor.entries()) {
    const cols = (fila as { columnas?: { ancho?: string }[] })?.columnas;
    if (!Array.isArray(cols) || cols.length === 0) continue;
    let suma = 0;
    for (const c of cols) {
      const m = /^(\d+)_(\d+)$/.exec(String(c?.ancho ?? ""));
      if (!m) return `Fila ${i + 1}: columna con \`ancho\` ilegible ("${c?.ancho}").`;
      suma += Number(m[1]) / Number(m[2]);
    }
    if (Math.abs(suma - 1) > 1e-6)
      return (
        `Fila ${i + 1}: los anchos de sus ${cols.length} columnas suman ${suma.toFixed(4)}, no 1. ` +
        `La retícula de Divi reparte la fila entera (los cuatro repartos medidos son ` +
        `\`4_4\` · \`1_2+1_2\` · \`1_3+2_3\` · \`1_3+1_3+1_3\`).`
      );
  }
  return true;
}

/**
 * `cuerpo` de `articulos-kb` — **LA LISTA DE FILAS**, no una lista plana de
 * módulos y **tampoco** un nivel de sección: la sección es una en las 6
 * (varianza cero ⇒ plantilla) y por eso el cuerpo empieza en la fila.
 *
 * `array` y no `blocks` por la misma razón que en el monográfico: no son una
 * unión, tienen una sola forma, y un `blocks` de una variante es peor admin sin
 * ganar nada.
 */
export const cuerpoKb: Field = {
  name: "cuerpo",
  type: "array",
  required: true,
  minRows: 1,
  fields: CAMPOS_FILA_KB,
  validate: validaReticulaKb,
} as Field;
