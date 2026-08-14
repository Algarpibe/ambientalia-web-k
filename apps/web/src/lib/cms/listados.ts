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
 * Desde el 2026-08-14 viven aquí **las tres**: `L1-resources` la desbloqueó
 * `D2.8` y su dato lo sembró el PASO 1 de esa tanda.
 *
 * ── Y la tercera aporta un eje que las dos primeras no tenían: la JERARQUÍA ──
 * `resources` es la única taxonomía jerárquica del sitio (profundidad 2, 1
 * padre), así que su consulta **no es «las entradas de este término»** sino
 * «las de este término y las de sus descendientes» — medido, no supuesto: el
 * archivo del padre sirve 80 tarjetas y la suma de sus 8 hijas es 80.
 * Y su paginación **no es 9: es 15**.
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
import type { CategoriaRecurso, EntradaBlog, EtiquetaA } from "@/types/kunak";
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

/**
 * ⚠ **269, y el número está AJUSTADO CONTRA LOS DATOS, no deducido de la
 * documentación de Divi.** La primera versión puso `270` «porque es el
 * `$amount` por defecto de `truncate_post`» y falló en 4 de 6 tarjetas; la
 * segunda dedujo *«PHP `substr` cuenta BYTES»*, escribió un contador de bytes
 * con su tabla de casos… y falló en 3 de 6.
 *
 * Ajustado sobre las **6 tarjetas de `/etiqueta` que el espejo congela con
 * cuerpo en el corpus**, barriendo topes de 250 a 300 en las dos unidades:
 *
 * | unidad | mejor tope | aciertos |
 * |---|---|---|
 * | **caracteres** | **268 y 269** | **6 / 6** |
 * | caracteres | 267 · 270 | 5 / 6 · 4 / 6 |
 * | bytes | 271 · 272 · 273 | 5 / 6 (ninguno llega a 6) |
 *
 * **Los bytes NO explican los datos**, así que la hipótesis se descarta con su
 * número en vez de quedarse como comentario plausible.
 *
 * ⚠ **Y 268 y 269 son INDISTINGUIBLES con n = 6**: las dos aciertan las seis.
 * Se elige 269 —el más cercano al 270 documentado— y **se declara que el dato
 * no las separa**. Una séptima tarjeta con la palabra del corte de 269 caracteres
 * lo dirimiría; hasta entonces esto es un valor ajustado, no medido.
 *
 * Quien adjudica no es este comentario: es `qa:lh-cmp`, que compara los 6
 * extractos contra el original par a par.
 */
const TOPE = 269;

/**
 * ⚠ **EL CUERPO DEL CLON ESTÁ RENDERIZADO, Y EL DEL ORIGINAL NO — y eso NO es
 * un detalle de implementación: cambia lo que el extracto puede decir.**
 *
 * El original construye su extracto sobre `post_content` **crudo**, con
 * `strip_shortcodes` delante. El clon se sembró de la captura, o sea del HTML
 * **ya renderizado**, donde esos shortcodes están EXPANDIDOS. Resultado medido:
 * el extracto del clon se comía la definición completa del glosario —
 *
 *   original  «…el impacto del transporte en la calidad del aire. Estas redes…»
 *   clon      «…el impacto del transporte en la calidad del aire La calidad del
 *              aire se refiere al estado del aire que respiramos…»
 *
 * — porque el cuerpo trae `<span class="tooltip-content">` con el texto del
 * término dentro. Es §El principio con los papeles cambiados: no es que se
 * midiera sobre la transcripción y ésta hubiera TIRADO algo, es que el
 * renderizado tiene **de más**.
 *
 * Lo que se quita es exactamente eso —el contenido del tooltip— y se quita
 * **nombrando el marcador servido**, no adivinando una longitud.
 */
const SIN_RENDER = [
  /<(script|style)\b[\s\S]*?<\/\1>/gi,
  /<span class="tooltip-content">[\s\S]*?<\/span>/gi,
];

export function extractoDerivado(cuerpo: string): string {
  let html = cuerpo;
  for (const re of SIN_RENDER) html = html.replace(re, "");
  const plano = html
    /* ⚠ Las etiquetas se quitan **sin meter un espacio**, que es lo que hace
       `wp_strip_all_tags`. Meterlo partía `NO<sub>2</sub>` en «NO 2» y el
       comparador lo veía: el original da «NO2». La separación entre bloques ya
       viene en el HTML servido, que trae saltos de línea entre párrafos. */
    .replace(/<[^>]*>/g, "")
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
 * LA HIPÓTESIS DE LOS BYTES SE PROBÓ Y SE DESCARTÓ — y el hueco queda escrito
 *
 * Aquí vivió un `cortaAByte()` con su comentario razonado: *«PHP `substr` cuenta
 * BYTES, así que dos acentos antes del corte dejan 268 caracteres»*. La
 * explicación era mecánicamente correcta, encajaba con las **dos** tarjetas que
 * se habían mirado, y **es falsa**: barrida contra las 6 con cuerpo, ninguna
 * longitud en bytes pasa de **5/6**, y dos en caracteres dan **6/6**.
 *
 * Se borra en vez de dejarla desactivada porque una función sin llamadores es
 * código muerto que se lee como respaldo (§sondas 3). Lo que se conserva es el
 * NÚMERO de la refutación, arriba en `TOPE`.
 *
 * **La lección, que es de método:** una explicación con mecanismo y dos casos a
 * favor se parece mucho a una medida. La diferencia es el denominador — y aquí
 * costó una corrida entera del comparador descubrir que el denominador era 2.
 * ═════════════════════════════════════════════════════════════════════════ */

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

/**
 * ⚠ **`L1-resources` NO sirve 9: sirve 15**, y es lo primero que hay que medir
 * en vez de heredar. Derivado del corpus congelado, contando `<article>` en las
 * **18 páginas con contenido** bajo `/recursos/`:
 *
 * | serie | tarjetas por página | total | páginas |
 * |---|---|---|---|
 * | `/recursos/articulos/` | 15·15·15·15·15·**5** | 80 | 6 |
 * | `…/contaminacion-urbana/` | 15·**9** | 24 | 2 |
 * | `…/contaminacion-y-salud/` | 15·**4** | 19 | 2 |
 * | `…/industria-…-olores/` | 15·**6** | 21 | 2 |
 * | `…/productos-kunak/` | **7** | 7 | 1 |
 * | `/recursos/seminarios-web/` | **3** | 3 | 1 |
 *
 * Y cuadra con `qa:lh-paginas` del día: `/recursos/articulos/` da **6** páginas
 * de contenido (16 según el servidor, 10 vacías).
 *
 * Se declara aparte y no se reutiliza `POR_PAGINA`, por la misma razón por la
 * que blog y etiqueta lo declaran una vez cada uno aunque hoy midan igual: si
 * mañana uno cambiara, el otro no debe seguirlo.
 */
export const POR_PAGINA_RESOURCES = 15;

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
export function pagina<T>(todos: T[], n: number, porPagina: number = POR_PAGINA): Pagina<T> {
  const total = Math.max(1, Math.ceil(todos.length / porPagina));
  return { items: todos.slice((n - 1) * porPagina, n * porPagina), n, total };
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

/* ══════════════════════════════════════════════════════════════════════════
 * `L1-resources` — LA TERCERA CONSULTA, y la única JERÁRQUICA
 * ═════════════════════════════════════════════════════════════════════════ */

/** Los 10 términos de `resources`, con su `padre` (slug) donde lo hay. */
export async function categoriasRecursos(): Promise<CategoriaRecurso[]> {
  return leeColeccion<CategoriaRecurso>("categorias-recursos");
}

/**
 * La ruta LOCAL del archivo de un término: `prefijo + [padre] + slug`.
 *
 * `D2.8` la compone en la plantilla en vez de guardarla, y el discriminador
 * entre los dos modelos son los **2 términos de primer nivel** — ver la ficha
 * de `CategoriaRecurso`.
 *
 * ⚠ Sin barra final: `trailingSlash` no está activado (§Regla de rutas locales).
 */
export function rutaRecurso(t: CategoriaRecurso): string {
  return t.padre ? `/recursos/${t.padre}/${t.slug}` : `/recursos/${t.slug}`;
}

/**
 * Los DESCENDIENTES de un término, él incluido.
 *
 * ⚠ **Está escrito como cierre transitivo y con la jerarquía medida da lo mismo
 * que un solo nivel**, porque la profundidad es **2** (`qa:lh-jerarquia`: 1
 * padre, 0 con dos padres, 0 tercer nivel). O sea que las dos
 * implementaciones tienen **0 instancias separadoras** hoy y elegir una es
 * elegir al azar (§DOS MODELOS QUE PREDICEN LO MISMO).
 *
 * Se elige el cierre transitivo porque el coste es el mismo y el fallo es más
 * ruidoso: si mañana apareciera un tercer nivel, «un solo nivel» dejaría de
 * listar entradas **en silencio**, y esto las listaría. El defecto se pone en la
 * dirección que grita.
 */
function conDescendientes(slug: string, todos: CategoriaRecurso[]): Set<string> {
  const dentro = new Set([slug]);
  let creció = true;
  while (creció) {
    creció = false;
    for (const t of todos) if (t.padre && dentro.has(t.padre) && !dentro.has(t.slug)) { dentro.add(t.slug); creció = true; }
  }
  return dentro;
}

/**
 * `/recursos/<término>` — las entradas del término **y las de sus
 * descendientes**, fecha descendente.
 *
 * ⚠ **Que el archivo del PADRE liste lo de sus hijas no es una suposición sobre
 * cómo funciona WordPress: está medido.** `/es/recursos/articulos/` sirve
 * exactamente **80** tarjetas (15·5 + 5) y la suma de sus 8 hijas es
 * 24+19+21+7+4+3+1+1 = **80**, sin una repetida y sin ninguna suya propia. Si
 * listara sólo lo suyo, ese archivo estaría vacío.
 */
export async function entradasDeRecurso(
  slug: string,
  terminos: CategoriaRecurso[],
  o?: { conBorradores?: boolean },
): Promise<EntradaBlog[]> {
  const dentro = conDescendientes(slug, terminos);
  return (await entradasBlog(o)).filter((e) => e.recurso && dentro.has(e.recurso.slug)).sort(porFechaDesc);
}
