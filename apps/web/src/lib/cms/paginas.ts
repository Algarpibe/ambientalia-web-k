/**
 * `paginas` — LA COLA LARGA (F3-3). El camino de LECTURA del render.
 *
 * Esquema: `packages/cms-config/src/colecciones/paginas.ts` +
 * `bloques/paginas.ts`. Decisión **CMS-3** (`ESQUEMA-CMS.md` §2j): una
 * colección con **unión propia de 11 bloques**, por el camino de
 * `articulos-kb`. Enrutado: **E1** (§2k) — `/[slug]` despacha un TERCER
 * catálogo para las 19 de un segmento, los tres catch-all extienden su
 * `generateStaticParams` para las 11, y `/empresa/premios-y-reconocimientos`
 * estrena ruta.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL DISCRIMINADOR QUE LLEGA AL RENDER SE LLAMA `kind`, NO `blockType`
 *
 * No es una preferencia de nombres: es **el defecto que ya se cobró una corrida
 * entera** en `articulos-kb`. `blockType` es lo que Payload guarda; la VUELTA lo
 * traduce a `kind` cuando el bloque lo declara (`custom: { conKind: true }`), y
 * el valor que pone es **el `slug` del bloque** (`mapeo.mjs` §blocks:
 * `ctx.conKind(aqui, b.slug, cuerpo)`).
 *
 * Un `switch (m.blockType)` sin `default` devuelve `undefined`, y en React
 * **`undefined` renderiza NADA**: las 6 páginas de KB se sirvieron con sus
 * filas, sus columnas y **cero módulos**, con HTTP 200, `npm run check` verde,
 * `qa:slugs` limpio y el `prerender-manifest` con sus 6 rutas. Lo cazó el
 * comparador de dos lados con `columna.nModulos: orig 2 → clon 0`.
 *
 * Por eso los `kind` de aquí abajo son **los `slug` de los 11 bloques**, y por
 * eso el `switch` del renderizador lleva `default` que **TIRA**.
 * ═════════════════════════════════════════════════════════════════════════ */
import { leeColeccion } from "./proyector";

/* ── Los tipos compartidos con KB, reusados y no re-declarados (clase C7) ──
 * `MedidaKb` y `PielKb` son la MISMA forma medida; duplicarlas aquí sería dos
 * definiciones de lo mismo, que es exactamente lo que el esquema evita cuando
 * `paginas` CONSUME `MODULO_BLURB` de `bloques/kb.ts` en vez de redeclararlo. */
export type { MedidaKb, PielKb } from "./articulos-kb";
import type { MedidaKb, PielKb } from "./articulos-kb";

/**
 * El token de columna. **`1_5` y `1_6` son de este arquetipo** (D3, 98.ª):
 * `1_5` lo ejercitan 10 módulos; `1_6` está **SIN EJERCITAR con su denominador
 * declarado** (0 de 313 módulos, 0 de 113 filas) y aun así se expresa, porque
 * la regla de la retícula es *«los anchos suman 1»* y `1_6 ×6` la cumple.
 */
export type TipoColumnaPagina =
  | "1_6"
  | "1_5"
  | "1_4"
  | "1_3"
  | "2_5"
  | "1_2"
  | "3_5"
  | "2_3"
  | "3_4"
  | "4_4";

/**
 * El ritmo de un MÓDULO. Tres ejes y no cuatro: `pt` **no está en el esquema**
 * de módulo porque `qa:f33-geo` lo dio **SIN ESCRIBIR** —valor inicial (0) en
 * todas—, y §*un eje cuyo ÚNICO valor observado es el inicial de la propiedad
 * sale SIN ESCRIBIR, que no es ni campo ni plantilla*. No se cablea.
 */
type RitmoModulo = { mt?: MedidaKb | null; mb?: MedidaKb | null; pb?: MedidaKb | null } | null;

/** Base de todo módulo: su ritmo (con unidad) y su ancho de módulo. */
type Base = { ritmo?: RitmoModulo; anchoPct?: number | null };

export type DiapositivaPagina = {
  titulo: string;
  nivel?: number | null;
  cuerpo?: string | null;
  botonLabel?: string | null;
  botonHref?: string | null;
};

/**
 * LOS DOCE MÓDULOS. El `kind` es el `slug` del bloque — ver la cabecera.
 *
 * ⚠ **Tres de los doce NO se pintan en esta tanda, y salen NOMBRADOS**
 * (CORTE LIMPIO 2). Están en el tipo porque el DATO existe y el renderizador
 * tiene que poder recibirlos sin mentir; lo que no existe es la medida con la
 * que pintarlos. Ver `CuerpoPagina.tsx` §LOS TRES QUE NO SE PINTAN.
 */
export type ModuloPagina =
  | (Base & { kind: "texto-pagina"; html: string; titulares?: (PielKb & { nivel: string })[] | null })
  | (Base & {
      kind: "imagen-pagina";
      /** Media local. Excluyente con `srcExterno` — lo impone `validaOrigenImagen`. */
      src?: string | null;
      /** D2 (98.ª): el `<img>` de `upload.wikimedia.org` se deja ABSOLUTO. 70 local · 1 externo. */
      srcExterno?: string | null;
      alt?: string | null;
      href?: string | null;
      external?: boolean | null;
    })
  | (Base & {
      kind: "boton-pagina";
      label: string;
      href: string;
      external?: boolean | null;
      /** `defecto` se OMITE en el dato (`conDefecto`): ausente = `defecto`. */
      piel?: "defecto" | "azul" | null;
    })
  | (Base & { kind: "codigo"; html: string })
  | (Base & { kind: "toggle"; titulo: string; nivel?: number | null; cuerpo: string })
  | (Base & { kind: "video-pagina"; embedUrl: string; titulo?: string | null })
  | (Base & {
      kind: "blurb";
      titulo: string;
      nivel?: number | null;
      imagen?: string | null;
      alt?: string | null;
      descripcion?: string | null;
      reticula?: "iconos" | "col-md-4" | "ninguna" | null;
      alineacion?: "center" | "left" | null;
      piel?: PielKb | null;
    })
  | (Base & { kind: "slider-completo"; diapositivas: DiapositivaPagina[] })
  | (Base & { kind: "slider"; diapositivas: DiapositivaPagina[] })
  | (Base & {
      kind: "mapa";
      pines: { titulo: string; descripcion?: string | null; lat?: string | null; lng?: string | null }[];
    })
  | (Base & { kind: "icono"; icono: string; texto?: string | null })
  /**
   * ── T1 (113.ª) · `tabla`, ADOPTADO TAL CUAL DESDE MONOGRÁFICO ────────────
   *
   * 1 instancia: `/politica-de-cookies`, 11 filas × 5 columnas = 55 celdas de
   * texto plano. `CELDA = {texto, fuerte, resto}` y `escalarA: "texto"`.
   *
   * ⚠⚠ **LLEVA `Base` COMO SUS HERMANOS, Y EL BLOQUE NO — la divergencia se
   * declara aquí porque el tipo no puede expresarla sin fabricar código
   * muerto.** `MODULO_TABLA` trae `...moduloBase` (el COMPARTIDO,
   * `ritmoModulo` con `number`), no `moduloBasePagina` (`ritmoModuloPagina`,
   * con UNIDAD). Es la consecuencia directa de adoptarlo **sin modificarlo**,
   * que es lo que T1 decidió.
   *
   * Tiparlo con su forma real obligaría a `estiloModulo` a ramificar sobre una
   * segunda forma de ritmo **que ningún dato ejercita**, o sea a escribir un
   * camino de render sin estrenar para cubrir un caso que no se da.
   *
   * **La divergencia es INERTE hoy, y por eso esto es lícito:** el extractor no
   * escribe **ni una** clave de geometría —lo exige su guarda, con sabotaje
   * `geometria`—, así que ni `ritmo` ni `anchoPct` llegan nunca aquí, para
   * ninguno de los doce. Inerte no es inexistente (§regla 14).
   *
   * > **CONDICIÓN: el día que la geometría se pueble, estas dos formas hay que
   * > conciliarlas ANTES**, o `estiloModulo` leerá un `number` donde espera una
   * > `MedidaKb` y emitirá una variable CSS sin unidad — que **no da error: da
   * > una declaración que el navegador tira** (§*una declaración inválida se
   * > sirve como que no existe*).
   *
   * `cabeceras` existe en el bloque y el extractor **no lo escribe**: el
   * original no marca ninguna cabecera de COLUMNA. Ver la decisión del
   * aplanado en `extractor-f33.mjs` §T1.
   */
  | (Base & {
      kind: "tabla";
      /**
       * ⚠⚠ **`string[][]`, NO `{celdas:{texto}[]}[]` — LA FORMA MEDIDA NO ES LA
       * FORMA DEL BLOQUE, y componerlo mal no da error: RENDERIZA NADA.**
       *
       * En la VUELTA (`mapeo.mjs` §case "array") se aplican DOS
       * transparencias, y se COMPONEN:
       *
       *   1 · `filas` tiene **un solo campo propio** (`celdas`), y *«un array de
       *       UN campo propio es transparente»* (L584) ⇒ `filas` vuelve como
       *       lista de los VALORES de `celdas`, no como `[{celdas}]`;
       *   2 · cada celda es `{texto, fuerte: null, resto: null}`; los nulos no
       *       llegan, así que queda **una sola clave** y ésa es la declarada en
       *       `custom.escalarA` ⇒ `deEscalar` la devuelve **pelada**.
       *
       * Resultado medido, no deducido:
       * `filas[0] === ["Cookie","Propia o de terceros","Tipo","Propósito","Más información"]`
       *
       * **Y el coste de tiparlo mal fue exactamente el modo de fallo de
       * §regla 6 gemelo:** el render hacía `f.celdas.map(...)` sobre un ARRAY,
       * `f.celdas` era `undefined`, el `?? []` lo convertía en cero celdas, y la
       * página se sirvió con **11 filas vacías, HTTP 200 y altura 0** — con
       * `data-modulo="tabla"` presente, así que hasta el comparador contaba el
       * módulo. Lo cazó medir la CAJA (`h: 0` contra `1511`), no el recuento.
       */
      cabeceras?: string[] | null;
      filas?: string[][] | null;
    });

/** Los doce `kind`, derivados del tipo — para que el renderizador no los liste a mano. */
export type KindPagina = ModuloPagina["kind"];

export type ColumnaPagina = { ancho: TipoColumnaPagina; modulos?: ModuloPagina[] | null };

export type FilaPagina = {
  pt?: MedidaKb | null;
  pb?: MedidaKb | null;
  mt?: MedidaKb | null;
  mb?: MedidaKb | null;
  columnas: ColumnaPagina[];
};

/**
 * La SECCIÓN. **Este arquetipo SÍ tiene nivel de sección y `articulos-kb` NO**:
 * allí la sección es una en las 6 instancias (varianza cero ⇒ plantilla); aquí
 * el censo da **86 secciones en 32 páginas, de 0 a 11 por página**, o sea que
 * las compone el editor y son campo.
 *
 * `modulosSueltos` son los *fullwidth* que cuelgan de la sección **sin fila**:
 * 2 medidos, los dos `fullwidth_slider`. Sin ellos esas 2 instancias no se
 * podrían expresar, y el fallo sería silencioso — la página saldría con 200 y
 * sin su slider.
 */
export type SeccionPagina = {
  pt?: MedidaKb | null;
  pb?: MedidaKb | null;
  modulosSueltos?: ModuloPagina[] | null;
  filas?: FilaPagina[] | null;
};

/**
 * Los CUATRO casilleros del régimen. Son **dos marcadores binarios del
 * `<body>`**, así que la taxonomía tiene `2 × 2 = 4` **por construcción** —
 * `-T` entra con su denominador (**0 de 31**) y **SIN EJERCITAR no es 0**.
 * Esquema: `colecciones/paginas.ts` §`regimen` (CMS-5 = R1).
 */
export type RegimenPagina = "B-" | "BT" | "-T" | "--";

export type PaginaColaLarga = {
  slug: string;
  /** CAMPO, no plantilla: las rutas van de 1 a 5 segmentos, así que el slug no basta. */
  prefijo?: string | null;
  /**
   * ⚠ **EL CAMPO QUE ELIGE EL CASCARÓN, y por eso está en el tipo de LECTURA y
   * no sólo en el esquema.** CMS-5 (§2j.9): el régimen lo derivó `regimenDe()`
   * del `<body>` del corpus, es `required`, y su reparto medido es
   * **`B-` 22 · `BT` 8 · `--` 1 · `-T` 0**.
   *
   * Sin él el render **no puede elegir**, y el defecto está puesto en la
   * dirección que grita: `PaginaF33` hace `switch` con `default` que TIRA. Un
   * defecto benigno serviría las 8 `BT` con el cascarón de las 22 y **nadie se
   * enteraría** (§regla 6).
   */
  regimen: RegimenPagina;
  titulo: string;
  seo: { title: string; description?: string | null; ogImage?: string | null };
  /** Opcional: es el coste conocido de C3 (§2j.1). Ver `cuerpoClasico`. */
  bloques?: SeccionPagina[] | null;
  /**
   * **S2 — el SEGUNDO canal de contenido** (decisión del propietario,
   * 2026-08-22). El régimen `--` no tiene builder: el tema sirve la plantilla
   * clásica y el cuerpo vive en `entry-content` como HTML.
   *
   * ⚠ **n = 1 de 31**, y se declara: `/es/politica-de-seguridad-de-la-informacion/`
   * (8387 caracteres). Con una sola instancia **nada de lo que este campo haga
   * está probado por variación**.
   */
  cuerpoClasico?: string | null;
};

/* ══════════════════════════════════════════════════════════════════════════
 * LA LECTURA
 * ═════════════════════════════════════════════════════════════════════════ */

export async function paginasColaLarga(o?: { conBorradores?: boolean }): Promise<PaginaColaLarga[]> {
  return leeColeccion<PaginaColaLarga>("paginas", o);
}

/**
 * La RUTA de una página. **Se deriva del par `(prefijo, slug)`**, que es la
 * identidad real de este arquetipo — el slug solo NO lo es: de las 31 páginas
 * salen **29 slugs distintos** (`articulos-de-ayuda` y `video-tutoriales` se
 * repiten bajo prefijos distintos), y por eso la colección lleva índice
 * compuesto `(prefijo, slug)` en vez de `unique` sobre el slug.
 */
export const rutaDePagina = (p: Pick<PaginaColaLarga, "slug" | "prefijo">): string =>
  "/" + [p.prefijo, p.slug].filter(Boolean).join("/");

/**
 * Despacho por ruta completa. Recibe los segmentos ya partidos —es lo que dan
 * tanto `[slug]` (uno) como los catch-all (varios)— y compara contra la ruta
 * derivada, no contra el slug: comparar por slug emparejaría **2 documentos con
 * el equivocado** (§regla 29, que se pagó en el round-trip de la 98.ª).
 */
export async function getPaginaColaLarga(
  segmentos: string[],
  o?: { conBorradores?: boolean },
): Promise<PaginaColaLarga | null> {
  const ruta = "/" + segmentos.filter(Boolean).join("/");
  return (await paginasColaLarga(o)).find((p) => rutaDePagina(p) === ruta) ?? null;
}

/**
 * Las que el PLANO DE RAÍZ sirve: **las de un solo segmento**, o sea sin
 * prefijo.
 *
 * ⚠⚠ **ES EL MISMO PREDICADO QUE LA COLECCIÓN, Y ESTÁ ESCRITO DOS VECES —
 * declarado, no ignorado.** `colecciones/paginas.ts` lleva
 * `enElPlano: (doc) => !doc.prefijo` para decidir si reclama el slug en el
 * registro; esto decide si `/[slug]` emite su ruta. **Tienen que denotar el
 * mismo conjunto** o la guarda vigila uno y el build emite otro — que es
 * §regla 25 exacta: *una guarda cuyo dominio no es el de su invariante deja de
 * proteger y pasa a bloquear*, y aquí en la otra dirección.
 *
 * No se comparte el símbolo porque viven en paquetes distintos —el esquema no
 * depende de la app y no debe—, así que **la unicidad la sostiene una
 * comprobación, no la confianza**: `npm run qa:slugs` deriva sus familias del
 * registro y compara los slugs reclamados contra las rutas que el build emite.
 * Si los dos predicados divergieran, ahí sale.
 */
export const enElPlanoDeRaiz = (p: Pick<PaginaColaLarga, "prefijo">): boolean => !p.prefijo;

/** Las que cuelgan de un catch-all concreto (`centro-de-ayuda` · `soporte` · `recursos`). */
export const bajoPrefijo = (ps: PaginaColaLarga[], raiz: string): PaginaColaLarga[] =>
  ps.filter((p) => p.prefijo === raiz || (p.prefijo ?? "").startsWith(`${raiz}/`));
