/**
 * EL ARCHIVO DE TAXONOMÍA `/sector/*` — la LISTA MEDIDA de rutas.
 *
 * Decisión: `docs/ESQUEMA-CMS.md` §7i · `CMS-F34-SECTOR` (c2), tomada por el
 * propietario el 2026-08-26 — **REPLICAR TAL CUAL**, por precedente `D2.5`.
 * Derivación del estado: `docs/research/cola-larga/derivaciones/estado-118.*`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ POR QUÉ ESTO ES UNA LISTA MEDIDA Y NO UNA REGLA DERIVADA
 *
 * Lo natural sería derivar la paginación del dato: `ceil(casos / porPagina)`.
 * **Se barrió el parámetro en vez de razonarlo** (§*antes de escribir una
 * regla ajustada, BARRE el parámetro*): `k = 1..30` contra el total que el
 * original declara en su propio `<title>` («Página N de M»).
 *
 * > **Mejor `k = 5`: acierta 8 de 9 y falla en UNA — `industria`, con 8 casos,
 * > predice 2 y el original declara 3.**
 *
 * O sea que el archivo **no pagina los casos**: pagina algo que el clon no
 * tiene. Cablear `k = 5` metería la regla equivocada en 1 de 9; publicar sólo
 * «no es derivable» tiraría una regla que explica el resto. Van los dos
 * números, y la lista se replica **como medida**.
 *
 * ⚠ **CONSECUENCIA, declarada aquí y no descubierta después: un término nuevo
 * NO entra solo.** Es lo contrario de lo que hace `paramsEtiquetas()`, y es
 * deliberado: derivarlo exigiría una regla que el dominio refuta.
 *
 * ⚠ **Y la excepción no es aleatoria:** `industria` es también el ÚNICO término
 * cuyo título no sale de su `nombre`. Dos anomalías sobre el mismo término son
 * una señal, pero con **n = 1** no son un discriminador (§*un discriminador
 * hallado en una sola instancia tampoco es un discriminador*). Se ficha.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS DOS UNIDADES, QUE NO SON EL MISMO CONJUNTO
 *
 * La mesa habla de «13 rutas, 5 de ellas redirección». Son **dos lecturas de
 * 13** y su intersección es **0** (§*dos lecturas pueden dar el mismo cardinal
 * contando unidades distintas*):
 *
 *   · **13 PÁGINAS**  = 6 base + 7 `/page/N`   ← la que manda para el manifiesto
 *   · **11 TÉRMINOS** = 6 que sirven 200 + 5 que dan 301
 *
 * La familia son **18 URLs**. Las 5 redirecciones **no son páginas** y viven en
 * `next.config.ts`: replicar un 301 como página sería servir un 200 donde el
 * original sirve un salto — o sea cambiar el comportamiento con la excusa de
 * copiarlo.
 */

/** Una entrada del archivo: qué páginas sirve el original, y con qué título. */
export type ArchivoSector = {
  slug: string;
  /**
   * Los números de página que el original sirve con **200**.
   *
   * ⚠ Vacío NO significa «no tiene páginas»: significa que **ninguna** de sus
   * URLs responde 200 — el término entero redirige. Su `total` es entonces
   * **desconocido**, no 0 (§*un cero de muestreo no es prueba de ausencia*).
   */
  paginas: number[];
  /**
   * El total que el original declara en su `<title>` («Página N de M»).
   * `null` cuando no hay ninguna captura de la que leerlo.
   */
  total: number | null;
  /**
   * Override del título de archivo. `undefined` ⇒ se compone con el `nombre`
   * del término, que es lo que hacen 9 de los 10 con captura.
   */
  tituloArchivo?: string;
};

/**
 * Las **13 páginas**, agrupadas por término. Medido sobre
 * `corpus/fase-3/taxonomia-sector/` (13 `index.html`) y los `<title>` que cada
 * captura trae.
 */
export const ARCHIVO_SECTOR: ArchivoSector[] = [
  { slug: "edar", paginas: [1], total: 1 },
  // Base en 301 ⇒ no está entre las páginas; sus 2 y 3 SÍ responden 200.
  // Título propio, medido en 2 de 2 de sus capturas.
  {
    slug: "industria",
    paginas: [2, 3],
    total: 3,
    tituloArchivo: "Articles about air quality monitoring in industries",
  },
  { slug: "investigacion-consultoria", paginas: [2], total: 2 },
  { slug: "metalurgia", paginas: [1], total: 1 },
  // `mineria` redirige A SÍ MISMA (5 saltos). El bucle NO se diagnostica:
  // necesita red, y *un mecanismo sin medir que entra en una decisión la
  // contamina* (§7i). Sin captura ⇒ `total` desconocido.
  { slug: "mineria", paginas: [], total: null },
  { slug: "obras", paginas: [], total: null },
  { slug: "oil-gas-es", paginas: [1], total: 1 },
  { slug: "olores", paginas: [1], total: 1 },
  { slug: "puertos", paginas: [1, 2], total: 2 },
  { slug: "sports", paginas: [1], total: 1 },
  { slug: "urbano", paginas: [2, 3, 4], total: 4 },
];

/**
 * Las **5 redirecciones 301**, con su destino medido en vivo
 * (`derivaciones/estados-114.{mjs,json,log}`, `redirect: "manual"`).
 *
 * Un corpus guarda el **cuerpo**, no el estado, así que éste es el único canal
 * que puede darlas — por eso se citan de esa medición y no del corpus.
 */
export const REDIRECCIONES_SECTOR: { de: string; a: string }[] = [
  { de: "/sector/industria", a: "/sectores/control-de-emisiones-industriales" },
  { de: "/sector/investigacion-consultoria", a: "/sectores/estudio-de-la-contaminacion-atmosferica" },
  /**
   * ⚠ **BUCLE A SÍ MISMA — se replica TAL CUAL, y es una decisión, no un
   * descuido.** El original sirve `301 /es/sector/mineria/ →
   * /es/sector/mineria/`, medido con **5 saltos** y `ERR_TOO_MANY_REDIRECTS`
   * en navegador (`estados-114`).
   *
   * La tentación es «arreglarlo» mandándolo a algún sitio razonable. Eso sería
   * inventar enrutado, no clonarlo: el visitante del original **no llega a
   * ninguna página**, y un clon que sí llegue no replica, mejora.
   *
   * **Y el MECANISMO del bucle no se diagnostica**: dirimirlo exige leer la
   * cabecera `Location` de cada salto con el `Host` y el esquema completos, y
   * eso **necesita red** (§7i). *Un mecanismo sin medir que entra en una
   * decisión la contamina.*
   */
  { de: "/sector/mineria", a: "/sector/mineria" },
  { de: "/sector/obras", a: "/sectores/contaminacion-por-construccion" },
  { de: "/sector/urbano", a: "/sectores/calidad-del-aire-en-las-ciudades" },
];

/** Las 13 páginas como pares `(slug, n)`, derivadas — no escritas a mano. */
export function rutasArchivoSector(): { slug: string; n: number }[] {
  return ARCHIVO_SECTOR.flatMap((a) => a.paginas.map((n) => ({ slug: a.slug, n })));
}

const POR_SLUG = new Map(ARCHIVO_SECTOR.map((a) => [a.slug, a]));

/**
 * La entrada del archivo de un término.
 *
 * **Tira si no existe**, en vez de devolver `undefined`: §regla 6 —una ausencia
 * se rechaza, no se sustituye—, y su gemelo del render, donde `undefined` no
 * falla, **no pinta**.
 */
export function getArchivoSector(slug: string): ArchivoSector {
  const a = POR_SLUG.get(slug);
  if (!a) throw new Error(`sector-archivo: término sin entrada de archivo: "${slug}"`);
  return a;
}
