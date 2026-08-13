/**
 * LISTADO-B (`L1`) LEÍDO DEL CMS — la CONSULTA, no un content type.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ AQUÍ NO HAY COLECCIÓN «BLOG» NI «ETIQUETA»
 *
 * §regla 12, 2.º enunciado: **un listado no tiene contenido propio, es una
 * CONSULTA.** El contenido son las entradas y los términos; el listado es una
 * proyección sobre ellos. Por eso este fichero no lee una colección suya: lee
 * `entradas-blog` y `etiquetas` y las **ordena, filtra y parte en páginas**.
 *
 * De ahí sale también lo que este módulo NO puede hacer: inventarse un campo.
 * Todo lo que pinta la tarjeta o viene del documento o está DERIVADO con una
 * regla escrita aquí y adjudicada por `qa:lh-cmp` contra el original.
 *
 * ── Las dos variantes, y en qué se diferencian de verdad ──────────────────
 * `D1` quedó ACOTADA al medir: `L1` es **uno con tres variantes**, y lo que
 * cambia entre ellas no es sólo la tarjeta — es **tarjeta + retícula + barra**.
 * Aquí sólo viven las dos primeras (blog y etiqueta); `L1-resources` está
 * parado por §F3-LH-JERARQUIA-RECURSOS y **no se construye en esta tanda**.
 *
 * ── LH-SP10: el extracto son DOS MECANISMOS, no uno ───────────────────────
 * Medido (`qa:lh-extracto`, negativo 4/4, `medidas/lh-extracto.json`), sobre
 * los **63** posts que aparecen en los dos listados: **0 idénticos**, 48 donde
 * el de blog es PREFIJO del de etiqueta y **15 completamente distintos**.
 *
 * | | mecanismo | evidencia |
 * |---|---|---|
 * | `/blog` | **CAMPO** — el extracto manual donde existe, el automático si no | 15 de 63 no son prefijo; longitudes 86–401, media 301 |
 * | `/etiqueta` | **DERIVADO** — trunca el cuerpo | 143 de 143 terminan en «...», longitudes 256–271 |
 *
 * O sea: el de blog **se lee del dato** y el de etiqueta **se calcula**. Meter
 * los dos en el mismo campo habría sido el arreglo falso — funcionaría en las
 * 48 y fallaría en las 15.
 */
import type { EntradaBlog, EtiquetaA } from "@/types/kunak";
import { entradasBlog } from "./arquetipo-a";
import { leeColeccion } from "./proyector";

/* ══════════════════════════════════════════════════════════════════════════
 * EL ORDEN — fecha descendente, y la fecha es TEXTO VERBATIM
 *
 * `fechaPublicacion` se guarda como el original la escribe («7 enero 2025»),
 * que es la decisión de §2.4 y no se reabre aquí. Para ordenar hay que
 * parsearla, y **el parseo TIRA si no reconoce el formato** (§regla 6): un
 * `?? 0` mandaría la entrada al final de la lista **en silencio**, y el listado
 * saldría plausible con una entrada fuera de sitio.
 *
 * Verificado en la 64.ª tanda: **las 149 fechas parsean 149/149**, y las
 * posiciones 0 y 1 de `/blog` y de `/etiqueta/calidad-del-aire` reproducen el
 * original (LH-SP3 · ✅ fecha descendente).
 * ═════════════════════════════════════════════════════════════════════════ */

const MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split(" ");

/** «7 enero 2025» · «7 de enero de 2025» → epoch. **Tira** si no casa. */
export function aEpoch(fecha: string): number {
  const m = /^(\d{1,2})\s+(?:de\s+)?(\p{L}+)\s+(?:de\s+)?(\d{4})$/u.exec(fecha.trim());
  const i = m ? MESES.indexOf(m[2].toLowerCase()) : -1;
  if (!m || i < 0)
    throw new Error(
      `fechaPublicacion no parseable: '${fecha}'.\n` +
        `  Devolver 0 aquí mandaría la entrada al final del listado sin decirlo, que es\n` +
        `  exactamente cómo un valor por defecto convierte «no lo sé» en «está bien».`,
    );
  return Date.UTC(Number(m[3]), i, Number(m[1]));
}

/** Descendente por fecha, y a igualdad de fecha por slug — para que sea estable. */
const porFechaDesc = (a: EntradaBlog, b: EntradaBlog) =>
  aEpoch(b.fechaPublicacion) - aEpoch(a.fechaPublicacion) || a.slug.localeCompare(b.slug);

/* ══════════════════════════════════════════════════════════════════════════
 * LOS DOS FORMATOS DE FECHA QUE LA TARJETA PINTA
 *
 * El mismo dato, dos renderizados, y los dos salen del original:
 *
 *   `/blog`      «24 de febrero de 2026»   — el formato largo de WordPress en es_ES
 *   `/etiqueta`  «May 25, 2026»            — el `.published` del módulo de Divi
 *
 * ⚠ **Que se DERIVEN no es una suposición cómoda: es una afirmación que el
 * comparador contrasta.** Los dos textos son eje `contenido`, así que `qa:lh-cmp`
 * los mide contra el CORPUS carácter a carácter en las 3 primeras tarjetas de
 * cada forma. Si una regla estuviera mal, sale con su camino.
 * ═════════════════════════════════════════════════════════════════════════ */

const ABREV_EN = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const partes = (fecha: string) => {
  const d = new Date(aEpoch(fecha));
  return { dia: d.getUTCDate(), mes: d.getUTCMonth(), anio: d.getUTCFullYear() };
};

/** `/blog` — «24 de febrero de 2026». */
export const fechaLarga = (fecha: string) => {
  const { dia, mes, anio } = partes(fecha);
  return `${dia} de ${MESES[mes]} de ${anio}`;
};

/** `/etiqueta` — «May 25, 2026», el `.published` del módulo `et_pb_blog`. */
export const fechaCorta = (fecha: string) => {
  const { dia, mes, anio } = partes(fecha);
  return `${ABREV_EN[mes]} ${dia}, ${anio}`;
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL EXTRACTO DERIVADO DE `/etiqueta`
 *
 * Divi trunca el contenido a **270 caracteres**, retrocede hasta el último
 * espacio y añade «...». Es lo que explica el rango medido —256 a 271 en 143
 * tarjetas— y el terminador en **143 de 143**.
 *
 * ⚠ **La regla se escribe con su número y la adjudica el comparador.** Es una
 * derivación, no una medida: reproduce el rango observado, y si el corte real
 * fuera otro saldría como diferencia de `contenido` en `qa:lh-cmp` con su
 * camino. Lo que NO se hace es usar aquí el extracto manual — `/etiqueta` lo
 * ignora, medido en las 15 que difieren.
 * ═════════════════════════════════════════════════════════════════════════ */

const TOPE = 270;

export function extractoDerivado(cuerpo: string): string {
  const plano = cuerpo
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
  if (plano.length <= TOPE) return plano;
  const corte = plano.slice(0, TOPE);
  const ultimo = corte.lastIndexOf(" ");
  return `${ultimo > 0 ? corte.slice(0, ultimo) : corte}...`;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA PAGINACIÓN — 9 por página, DERIVADA y no escrita a ojo
 *
 * `qa:lh-serie` censó las 149 páginas capturadas: `/blog` sirve **9 tarjetas**
 * en su página 1 y su paginador nombra **8 páginas** para 68 entradas
 * (⌈68/9⌉ = 8 ✓). `/etiqueta/calidad-del-aire` sirve 9 y dice «Page 1 of 4».
 *
 * ⚠ **El número es el mismo en las dos variantes y aun así se declara una vez,
 * no dos**: si mañana una de las dos cambiara, la que no cambió no debe
 * seguirla — es el mismo argumento por el que `BANDA` da entrada propia a
 * familias que hoy miden igual.
 * ═════════════════════════════════════════════════════════════════════════ */

export const POR_PAGINA = 9;

export type Pagina<T> = {
  items: T[];
  n: number;
  total: number;
};

/**
 * La página `n` (1-based) de una lista ya ordenada.
 *
 * ⚠ **Una página FUERA de rango devuelve `items: []`, no `null`, y eso es la
 * decisión `D2.5` (REPLICAR TAL CUAL) hecha código.** El original sirve **55
 * páginas que responden 200, se declaran canónicas de sí mismas y no listan ni
 * una entrada** (`/es/blog/page/9/`…`17/`). Devolver `null` aquí las convertiría
 * en 404 y sería divergir del original **sin decirlo**.
 */
export function pagina<T>(todos: T[], n: number): Pagina<T> {
  const total = Math.max(1, Math.ceil(todos.length / POR_PAGINA));
  return { items: todos.slice((n - 1) * POR_PAGINA, n * POR_PAGINA), n, total };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LAS DOS CONSULTAS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * `/blog` — las entradas **SIN `recurso`**, fecha descendente.
 *
 * El discriminador está derivado y es exacto: 149 − 81 con `recurso` = **68**,
 * que es lo que el original lista. El campo `recurso` decide **la miga y el
 * listado a la vez**, y por eso no hace falta un campo «sale en blog».
 *
 * ⚠ **68 = 68 es un cardinal, y un cardinal absorbe la membresía**
 * (§F3-LH-DOS-CONJUNTOS-DE-149): los dos conjuntos de 68 **difieren en 2 por
 * lado** porque 2 documentos que el listado nombra no están capturados. No es
 * un fallo de esta consulta ni del seed: es un hueco de CAPTURA, y su efecto en
 * el comparador está pre-declarado para que no se persiga.
 */
export async function entradasDeBlog(o?: { conBorradores?: boolean }): Promise<EntradaBlog[]> {
  return (await entradasBlog(o)).filter((e) => !e.recurso).sort(porFechaDesc);
}

/** Las 12 etiquetas (`post_tag`), con su descripción rica. */
export async function etiquetasA(): Promise<EtiquetaA[]> {
  return leeColeccion<EtiquetaA>("etiquetas");
}

/** `/etiqueta/<slug>` — las entradas con esa etiqueta, fecha descendente. */
export async function entradasDeEtiqueta(
  slug: string,
  o?: { conBorradores?: boolean },
): Promise<EntradaBlog[]> {
  return (await entradasBlog(o)).filter((e) => e.etiquetas?.some((t) => t.slug === slug)).sort(porFechaDesc);
}
