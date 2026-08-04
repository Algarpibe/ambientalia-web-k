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

/* ── MEDIA (CMS-0b) ────────────────────────────────────────────────────── */
export const IMAGE_SIZES = d(
  [
    { nombre: "sm", width: 480 },
    { nombre: "md", width: 980 },
    { nombre: "card", width: 1024, height: 683 },
    { nombre: "cardWide", width: 1080, height: 675 },
    { nombre: "lg", width: 1280 },
  ],
  "§CMS-0b · unión de los anchos observados; los 848 y 1800 son tamaño nativo, no variante",
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
  GRUPO_A,
  CASO,
  DOCUMENTO_CIENTIFICO,
  PRODUCTOS,
  LISTADOS,
  IMAGE_SIZES,
} as const;
