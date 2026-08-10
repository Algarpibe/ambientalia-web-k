/**
 * DEFECTOS MEDIDOS del esquema — la mitad de `@kunak/cms-config` que existe
 * antes de que Payload esté instalado.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ HACE ESTE FICHERO AQUÍ Y NO EN LA APP
 *
 * CMS-0f (`ESQUEMA-CMS.md` §CMS-0f) decidió **dos apps y un paquete
 * compartido**, y acotó su contenido: **config de colecciones, tipos generados
 * y defaults — NADA de componentes de admin.** Los defaults son lo único de los
 * tres que ya está **medido** hoy, así que es lo único que este paquete lleva
 * en el primer bloque de F2-1.
 *
 * ── Por qué los defaults son código compartido y no una tabla en un doc ────
 * El patrón de la casa (`ESQUEMA-CMS.md` §1.5) es:
 *
 *   > cada campo de presentación editorial lleva **un defecto explícito** y se
 *   > **omite del dato cuando coincide** con él.
 *
 * Eso significa que **el defecto lo aplican DOS sitios** —el admin al dar de
 * alta y el render al leer un dato que lo omite— y si cada uno lleva su copia,
 * divergen en silencio: el dato no dice nada y los dos «tienen razón». Aquí
 * viven una vez.
 *
 * ⚠ **Cada valor lleva su procedencia.** Un defecto sin la medida que lo
 * respalda es un número inventado con aspecto de decisión, y este proyecto ya
 * sabe cómo se lee eso: *documentado no es medido*.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Un defecto con su procedencia. El `porQue` no es adorno: es la evidencia. */
export interface Defecto<T> {
  readonly valor: T;
  /** Dónde está medido. Sección de `ESQUEMA-CMS.md` o acta de `docs/research/`. */
  readonly fuente: string;
}

const d = <T>(valor: T, fuente: string): Defecto<T> => ({ valor, fuente });

/* ── SECTOR (§1.4) ─────────────────────────────────────────────────────── */
export const SECTOR = {
  /** Dónde corta la sección. 4 valores; el editor elige. */
  flujo: d("seccion", "§1.4 · medido en los 8 sectores vivos (tree-todos)"),
  /** Las dos pieles del shortcode `calls`. */
  varianteCtaDescarga: d("foto", "§1.4 · CLAUDE.md §Estructura que en realidad es contenido"),
  /** El azul de marca. Industria y EDAR usan #0c71c3 — error del original, replicado. */
  headingColor: d("#0075c9", "§1.4"),
  /**
   * Ancho de MÓDULO. Medido campo el 2026-08-03: `80 · 90 · 100` en las 4
   * instancias, idénticos a 1440 y 390, con varianza intra-página y entre
   * instancias. Es el MISMO campo que `MonoModuloBase.anchoPct`.
   */
  anchoPct: d(100, "§6c.1 · clase/DECISION-ANCHO-MODULO.md · medidas/clase-rango-{1440,390}.json"),
} as const;

/* ── MONOGRÁFICO (§1.5) ────────────────────────────────────────────────── */
export const MONOGRAFICO = {
  anchoPct: d(100, "§1.5 · 70·80·90 en monografico.ts, 19 módulos"),
  lh: d(30.6, "§1.5 · 30.6 · 36 · 45 por módulo"),
  /**
   * ⚠ **Son DOS defectos, no uno.** El render los lee distinto —`Claim({nivel
   * = 2})` y `titular ?? 3` en `MonoCuerpo.tsx`— y tenerlos como uno hacía que
   * el hook de `conDefecto` omitiera el `nivel: 2` explícito de un `titular`,
   * que volvía como `<h3>`. Lo cazó `qa:cms-roundtrip` el 2026-08-04; ver el
   * bloque de `nivelCon` en `bloques/contenido.ts`.
   */
  nivelClaim: d(2, "§1.5 · MonoCuerpo.tsx l.100/281"),
  nivelTitular: d(3, "§1.5 · MonoCuerpo.tsx l.156/275"),
  /** `pb` de fila: 2 % — 28.7969 @1440 · 30 @390. Omitido cuando coincide. */
  filaPb: d({ px1440: 28.7969, px390: 30 }, "§1.5 · monográfico, 19 filas"),
} as const;

/* ══════════════════════════════════════════════════════════════════════════
 * `articulos-kb` (§2d.5) — y EL DEFECTO DE `mb`, QUE NO ES UN NÚMERO
 *
 * ── El enunciado que había, y por qué engaña ───────────────────────────────
 * `CLAUDE.md` escribía el defecto de Divi como **«módulo `mb` 2.75 %
 * (34.0469/30)»**, y calibró con él los arquetipos anteriores. Es correcto en
 * ellos y **no es una constante**: `docs/research/articulos-kb/components/modulos.spec.md`
 * §1.3 midió en KB **34.0469 en las 59 columnas `4_4` y 25.0625 en las 13
 * estrechas, sin una excepción**, y ninguno de los dos es el 2.75 % de su
 * propio contenedor.
 *
 * ── ⚠ Y LA SPEC LO ATRIBUYE A LA VARIABLE EQUIVOCADA — derivado en la misma
 *    tanda contra un SEGUNDO arquetipo (F3-1 PASO 6, 2026-08-10) ────────────
 * La spec concluye «función del TIPO DE COLUMNA» porque en KB **todas las filas
 * miden 911.75**: dentro de KB, tipo de columna y ancho de fila están
 * confundidos y sólo uno de los dos se puede ver. Añadiendo
 * `medidas/mono-modulos-{1440,390}.json` (edar · petróleo · urbano, filas de
 * **1238.39**) la confusión se deshace, y el resultado **invierte** el
 * enunciado de la spec fuera de KB:
 *
 * | arquetipo | fila | columna | `mb` por defecto @1440 | n |
 * |---|---|---|---|---|
 * | SECTOR/MONOGRÁFICO | 1238.39 | `1_2·1_3·1_4·2_3·3_4·3_5` (**estrechas**) | **34.0469** | 35 |
 * | SECTOR/MONOGRÁFICO | 1238.39 | `4_4` | **34.0469** | 11 |
 * | `articulos-kb` | 911.75 | `1_2·1_3·2_3` (**estrechas**) | **25.0625** | 13 |
 * | `articulos-kb` | 911.75 | `4_4` | **34.0469** | 59 |
 *
 * > **La variable que manda es el ANCHO DE LA FILA, no el tipo de columna.** Un
 * > `1_2` de 585.13 en fila de 1238.39 lleva **34.0469**; un `2_3` de 591.11
 * > —casi el mismo ancho de columna— en fila de 911.75 lleva **25.0625**.
 * > Aplicar la spec literalmente fuera de KB pondría 25.0625 donde hay 34.0469
 * > medido en 35 módulos: el mismo arreglo falso, con el signo cambiado.
 *
 * `25.0625` es el 2.75 % de la fila propia (911.75) y `34.0469` el 2.75 % de la
 * fila del cascarón (1238.39). Las dos filas coinciden en una página de builder
 * sin cascarón, **y por eso el enunciado como constante nunca falló**.
 *
 * ⚠ **La excepción `4_4` queda SIN PROBAR, y se replica sin explicarla:** por
 * qué una columna `4_4` de una fila de 911.75 resuelve su 2.75 % contra 1238.39
 * no se ha medido. Lo que se afirma es el número, no el mecanismo
 * (`PENDIENTES-QA.md` §F3-1-SIN-PROBAR-KB).
 * ═════════════════════════════════════════════════════════════════════════ */

/** Anchos de fila MEDIDOS. Fuera de estos dos no hay defecto derivable. */
export const ANCHO_FILA_CASCARON = 1238.39;
export const ANCHO_FILA_KB = 911.75;

/**
 * `margin-bottom` por defecto de un módulo, **@1440**. Tabla medida, no
 * fórmula: este proyecto compara píxeles y `2.75 % × 1238.39` da `34.0557`, que
 * no es lo que el original sirve.
 *
 * ⚠ Un ancho de fila no medido **TIRA**: §regla 6 — una ausencia se rechaza, no
 * se sustituye por un valor benigno. Un `?? 34.0469` aquí sería exactamente el
 * arreglo falso que esta tabla existe para impedir.
 */
export function mbPorDefecto(anchoFila: number, tipoColumna: string): { px1440: number; px390: number } {
  const esCuatroCuartos = tipoColumna === "4_4";
  if (anchoFila === ANCHO_FILA_CASCARON) return { px1440: 34.0469, px390: 30 };
  if (anchoFila === ANCHO_FILA_KB)
    return { px1440: esCuatroCuartos ? 34.0469 : 25.0625, px390: 30 };
  throw new Error(
    `mbPorDefecto: ancho de fila SIN MEDIR (${anchoFila}).\n` +
      `  Los dos medidos son ${ANCHO_FILA_CASCARON} (SECTOR/MONOGRÁFICO, 46 módulos) y ` +
      `${ANCHO_FILA_KB} (articulos-kb, 72 módulos).\n` +
      `  El defecto de \`mb\` depende del ancho de la FILA, no del tipo de columna: ` +
      `inventarlo para una fila nueva es el arreglo falso de CLAUDE.md §Estructura.`,
  );
}

export const ARTICULO_KB = {
  /** `pt`/`pb` de fila: 2 % de la fila propia. Omitido cuando coincide. */
  filaPt: d({ px1440: 18.2344, px390: 30 }, "§2d.5 · cuerpo.spec.md §2 — 45 filas"),
  filaPb: d({ px1440: 18.2344, px390: 30 }, "§2d.5 · cuerpo.spec.md §2 — 45 filas"),
  /** `mt`/`mb` de fila: Divi no pone ninguno. Omitido cuando coincide. */
  filaMt: d({ px1440: 0, px390: 0 }, "§2d.5 · cuerpo.spec.md §2"),
  filaMb: d({ px1440: 0, px390: 0 }, "§2d.5 · cuerpo.spec.md §2"),
  /** `mt`/`pb` de módulo: 0. Omitidos cuando coinciden. */
  moduloMt: d({ px1440: 0, px390: 0 }, "§2d.5 · modulos.spec.md §1.3 — 121 de 143 a 0"),
  moduloPb: d({ px1440: 0, px390: 0 }, "§2d.5 · modulos.spec.md §1.3 — 141 de 143 a 0"),
  /** El de `mb` NO cabe aquí: es `mbPorDefecto(anchoFila, tipoColumna)`. */
  anchoPct: d(100, "§2d.5 · 85 %×6 · 50 %×4 · 40 %×2, los 12 en `image`"),
  /**
   * La sección propia. `pt` es **CAMPO uniforme** —el default es 4 % y las 6
   * escriben 0—, `pb` es el default. No hay hermanos, así que el test B **no
   * puede pronunciarse**: se emite como plantilla DECLARANDO su silencio
   * (`cuerpo.spec.md` §3).
   */
  seccionPt: d({ px1440: 0, px390: 0 }, "§2d.5 · cuerpo.spec.md §3 — CAMPO uniforme, test B mudo"),
  seccionPb: d({ px1440: 36.4688, px390: 50 }, "§2d.5 · cuerpo.spec.md §3 — default 4 % de 911.75"),
  /** SIN PROBAR e **inerte**: 1380 > 911.75 y > 335.39, así que no recorta. */
  filaMaxWidth: d(1380, "§2d.5 · MEDICION.md §4 — uniforme en 39, sin test que lo pruebe"),
} as const;

/* ── GRUPO A (§2, §2c.1) ───────────────────────────────────────────────── */
export const GRUPO_A = {
  /**
   * El rótulo del último eslabón de la miga **no es el `h1`** en el término de
   * Kunakpedia: 3 de 3 términos difieren, 11 de 11 blog/doc coinciden.
   * Defecto = el título; se omite cuando coinciden.
   */
  tituloMiga: d(null, "§2c.1 · alcance 3 términos de 37 — por eso es opcional"),
  /** Sin `autor`: no lo exige ningún listado (0/9 formas, 0 URLs de author en /es). */
  autor: d(null, "§2c · LH-2 D3"),
} as const;

/* ── GRUPO C (§2b, CMS-1) ──────────────────────────────────────────────── */
export const CASO = {
  /** Solo los 4 ingleses lo escriben. */
  prefijo: d("casos-de-exito", "§2b · CMS-1 · grupo-C/DECISIONES.md D2"),
} as const;

export const DOCUMENTO_CIENTIFICO = {
  /** Solo 1 de 23 escribe `estudios-cientificos`. */
  prefijo: d("documentos-cientificos", "§2.4 · medido en la construcción"),
} as const;

/* ── PRODUCTOS (§2e) ───────────────────────────────────────────────────── */
export const PRODUCTOS = {
  /** 23 de 24 son `ficha`; `catalogo` solo lo usa `accesorios` (n=1, PR-SP1). */
  tipo: d("ficha", "§2e · productos/DECISION.md · medidas/solutions-campos.json"),
  /** El único campo de frontera medido, y opcional: lo traen 18 de 24. */
  padre: d(null, "§2e · PR-SP2 — relación vs select lo decide el enrutado del §4"),
} as const;

/* ── LISTADOS (§2c) ────────────────────────────────────────────────────── */
export const LISTADOS = {
  /** Parámetro de PLANTILLA de cada variante, no campo por listado (LH-2 D2). */
  entradasPorPagina: d(
    { blog: 9, etiqueta: 9, resources: 15, temaCpt: 5 },
    "§2c · LH-2 D2 · varianza 0 intra-familia · L3 SIN PROBAR (LH-SP9)",
  ),
} as const;

/* ── MEDIA (CMS-0b) ──────────────────────────────────────────────────────
 * ⚠ **CORREGIDO 2026-08-04 contra el censo de las 309 páginas del corpus**
 * (`qa:media-srcset`, `medidas/media-srcset.json`). La lista anterior salía de
 * **14 instancias** y traía dos errores que sólo se ven con el censo delante:
 *
 * **1 · `card: {width: 1024, height: 683}` FORZABA UN RECORTE QUE EL ORIGINAL
 * NUNCA PRODUCE.** El `fit` por defecto de Payload es `cover`, así que declarar
 * los dos lados **recorta a 3:2 todo lo que entre**. Medido: la caja de 1024
 * emite **10 formas WxH distintas** —1024x682 · 1024x1024 · 1024x576 ·
 * 1024x683 · 1024x797 …—, o sea que **conserva la proporción de cada imagen**.
 * `1024x683` era una de las diez, no la forma de la caja. Pasa a `width: 1024`.
 *
 * **2 · faltaban dos cajas que el CUERPO sí usa:** `300` (6 candidatos en
 * cuerpo) y `768` (1). Pocos, pero el criterio es «el corpus lo usa en el
 * cuerpo», no la frecuencia — y una imagen sin su variante es exactamente el
 * defecto que M-IMG describe.
 *
 * **Lo que NO se declara, y con su razón medida** — `caja150` (50 candidatos),
 * `caja300` (311) y `caja600` (16): **las tres están a CERO en el cuerpo**, son
 * del cascarón (el sello del pie, los avatares, las galerías del tema). Payload
 * genera toda variante declarada para toda subida, así que declararlas costaría
 * tres ficheros por imagen para algo que ningún contenido pide. `caja600`
 * además **recorta** (600x600 y 576x600 sobre originales de 0.75 y 0.5627), y
 * es la única caja del corpus que lo hace: si algún día entra, entra con
 * `width`+`height`+`fit` declarados, no por omisión.
 *
 * **`cardWide` se queda, y su alcance es OTRO**: `1080x675` no aparece **ni una
 * vez** en los 4318 candidatos del corpus. Su evidencia es `lh-tarjetas`, o sea
 * las tarjetas de LISTADO, que no están en el corpus ni construidas todavía. Se
 * conserva con la procedencia escrita para que nadie la lea como parte del
 * mismo censo — que es justo lo que pasaba con `card`.
 *
 * ⚠ **Y lo que esta lista NO puede cerrar, dicho aquí porque es donde se busca:
 * M-IMG.** El censo demostró que el `srcset` **no es función de la imagen** —39
 * de 519 orígenes se sirven con `srcset` distinto según el punto de uso—, así
 * que un juego de tamaños, por bien medido que esté, genera los FICHEROS y no
 * el ATRIBUTO. Ver ESQUEMA §CMS-0b/M-IMG y `medidas/cmp-srcset.json`.
 */
export const IMAGE_SIZES = d(
  [
    { nombre: "w300", width: 300 },
    { nombre: "sm", width: 480 },
    { nombre: "w768", width: 768 },
    { nombre: "md", width: 980 },
    { nombre: "card", width: 1024 },
    { nombre: "lg", width: 1280 },
    { nombre: "cardWide", width: 1080, height: 675 },
  ],
  "§CMS-0b · CENSADO en las 309 páginas del corpus (qa:media-srcset): las 6 cajas que el CUERPO usa, todas de ancho libre. `cardWide` viene de lh-tarjetas (listados), NO del corpus. Fuera por medida: caja150/300/600 (0 en cuerpo, cascarón) y los nativos 848/1800",
);

/**
 * ⚠ Los defectos de esta lista están **medidos sobre las instancias que había**,
 * y varias llevan su alcance escrito en la `fuente`. No son constantes del
 * sitio: son el valor que hereda quien dé de alta un contenido nuevo, y se
 * re-miden cuando aparezca una instancia que los contradiga.
 */
export const DEFECTOS = {
  SECTOR,
  MONOGRAFICO,
  ARTICULO_KB,
  GRUPO_A,
  CASO,
  DOCUMENTO_CIENTIFICO,
  PRODUCTOS,
  LISTADOS,
  IMAGE_SIZES,
} as const;
