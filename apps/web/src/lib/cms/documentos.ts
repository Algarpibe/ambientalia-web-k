/**
 * `LISTADO-TEMA-TAX` (`L3`) — el archivo de `scientific-category`, LEÍDO DEL CMS.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * NO HAY COLECCIÓN «ARCHIVO»: ESTO ES UNA CONSULTA
 *
 * §regla 12, 2.º enunciado — *un listado no tiene contenido propio, es una
 * CONSULTA*. El contenido son los **documentos científicos** y sus **términos**;
 * el archivo es una proyección sobre ellos, y por eso este fichero no lee una
 * colección suya.
 *
 * ── EL ORDEN, que es lo único que no estaba medido ────────────────────────
 * El original ordena por **`anyo` DESCENDENTE**, y eso NO se supuso: se derivó
 * del corpus contra la DB, en las **23** tarjetas de los 3 términos.
 *
 * | modelo | acierta | instancias SEPARADORAS |
 * |---|---|---|
 * | **`anyo` DESC + orden de la colección** | **23/23** | — |
 * | sólo el orden de la colección (`id` ASC) | 21/23 | **2** (en `evaluaciones-independientes`) |
 *
 * O sea que el denominador de la elección **no son las 23 tarjetas: son las 2
 * que separan** (§UN MODELO SE ELIGE POR LO QUE LO SEPARA). Las dos son los
 * documentos que el seed insertó al final (`id` 22 y 23) y que el original
 * coloca por su año, no por su antigüedad en la DB.
 *
 * ⚠⚠ **Y EL DESEMPATE NO ESTÁ DERIVADO — se declara con su cardinal.**
 * **17 de las 23** tarjetas caen en un empate de `anyo` (10 + 7 + 0 por
 * término), así que el desempate decide más de dos tercios del listado. Lo que
 * el original usa ahí es el **ID de WordPress ascendente**, y ese ID **no está
 * en el modelo** — `TarjetaListado` ya lo declara irreproducible: *«no se midió,
 * no se sembró y no tiene por qué existir en el CMS de destino»*.
 *
 * Lo que se usa es **el orden de la propia colección** (`leeColeccion` pide
 * `sort: "id"`, o sea el orden en que el seed insertó), que **hoy reproduce las
 * 23**. Es una coincidencia con causa —el extractor recorrió el corpus en el
 * orden servido— y **no una propiedad medida del original**:
 *
 * > **Un re-seed en otro orden lo rompería sin que nada diera error.** Queda
 * > fichado en `PENDIENTES-QA.md` §F3-LH-DESEMPATE-DE-L3; lo que lo cerraría es
 * > modelar la fecha de publicación del documento, que el original **no sirve**
 * > en esta familia (0 de 23 con `datePublished`, medido).
 *
 * ── EL EXTRACTO: bytes sobre el texto CRUDO ───────────────────────────────
 * Medido en `qa:lh-extracto-unidad` (`medidas/lh-extracto-unidad.json`), 23
 * tarjetas y 4 modelos barridos de 250 a 300 en las dos unidades:
 *
 * | modelo | mejor tope | acierta |
 * |---|---|---|
 * | **bytes sobre el crudo** | **100** | **23/23** |
 * | bytes sobre el decodificado | 100 | 22/23 |
 * | caracteres (crudo o deco) | 99 | 10/23 |
 *
 * ⚠ **Es OTRO mecanismo que el de `/etiqueta`** (269 caracteres, `lh-extracto`).
 * Reutilizar aquel habría acertado 10 de 23.
 */
import type { DocumentoCientifico, TerminoA } from "@/types/kunak";
import { documentosCientificos } from "./arquetipo-a";
import { leeColeccion } from "./proyector";

/** Los 3 términos de `scientific-category`, en el orden de la colección. */
export async function categoriasCientificas(): Promise<TerminoA[]> {
  return leeColeccion<TerminoA>("categorias-cientificas");
}

/** `/scientific-category/<slug>` — sin barra final (§Regla de rutas locales). */
export const rutaCategoriaCientifica = (slug: string, n = 1) =>
  n === 1 ? `/scientific-category/${slug}` : `/scientific-category/${slug}/page/${n}`;

/**
 * Los documentos de un término, en el orden que el original sirve.
 *
 * ⚠ **`sort` de Array es ESTABLE en ES2019+**, y aquí eso no es un detalle: el
 * desempate de `anyo` es *«el orden en que venían»*, o sea el de la colección.
 * Un `sort` inestable barajaría 17 de 23 tarjetas sin dar error.
 *
 * ⚠ **`anyo` es TEXTO en el modelo** («2023», y una instancia trae
 * «2025 - 2026» en `casos`), así que se compara por `parseInt` del primer
 * número y **se TIRA si no hay ninguno** (§regla 6): un `?? 0` mandaría el
 * documento al final del archivo en silencio.
 */
export async function documentosDeCategoria(slug: string): Promise<DocumentoCientifico[]> {
  const todos = await documentosCientificos();
  return todos.filter((d) => d.categoria.slug === slug).sort((a, b) => anyoDe(b) - anyoDe(a));
}

function anyoDe(d: DocumentoCientifico): number {
  const m = /\d{4}/.exec(d.anyo ?? "");
  if (!m)
    throw new Error(
      `documento '${d.slug}': \`anyo\` sin un año de 4 cifras ('${d.anyo}').\n` +
        `  Devolver 0 aquí lo mandaría al final del archivo sin decirlo, que es\n` +
        `  exactamente cómo un valor por defecto convierte «no lo sé» en «está bien».`,
    );
  return Number(m[0]);
}

/* ══════════════════════════════════════════════════════════════════════════
 * CUÁNTAS PÁGINAS EMITE UNA SERIE — y la indeterminación va declarada
 *
 * `qa:lh-paginas` midió la frontera del SERVIDOR: **3 · 2 · 1** para 14, 8 y 1
 * documentos. Con eso el tamaño de página queda **acotado a 5 ó 6**, y las 3
 * instancias **no los separan**: ⌈14/5⌉=⌈14/6⌉=3, ⌈8/5⌉=⌈8/6⌉=2, ⌈1/5⌉=⌈1/6⌉=1.
 *
 * ⚠ **Pero 5 y 6 SÍ son funciones distintas** (§la vuelta de 2026-08-17: «0
 * separadoras» también sale cuando no hay nada que elegir, y entonces no se
 * ficha nada). Aquí sí hay dos funciones, y la entrada que las separa se puede
 * ESCRIBIR: **un término con 6 documentos** daría 2 páginas con tope 5 y 1 con
 * tope 6. Como esa entrada no existe en el dominio, se elige **6** y se dice.
 *
 * ⚠⚠ **Y ESTO NO PARTE LA LISTA.** `L3` **no pagina el cuerpo**: las 3 páginas
 * de la serie canónica sirven las **14** tarjetas (`nTarjetas` 14·14·14 y `docH`
 * idéntico a los dos anchos). El tope sólo decide **cuántas rutas se emiten**;
 * lo que cada una PINTA es el término entero. Rebanar aquí sería inventar un
 * comportamiento que el original no tiene, y se vería en `nTarjetas` y en `docH`
 * a la vez.
 * ═════════════════════════════════════════════════════════════════════════ */
export const POR_PAGINA_SCI = 6;

export const paginasDeCategoria = (n: number) => Math.max(1, Math.ceil(n / POR_PAGINA_SCI));

/* ══════════════════════════════════════════════════════════════════════════
 * EL EXTRACTO — `substr` de PHP sobre el HTML del cuerpo SIN decodificar
 * ═════════════════════════════════════════════════════════════════════════ */

/** El tope, en BYTES. Medido: 23/23 (`qa:lh-extracto-unidad`). */
const TOPE_BYTES = 100;

/**
 * ⚠ **`strip_tags` de PHP quita la etiqueta SIN poner nada en su sitio**, y una
 * regex `→ " "` miente: el `H<sub>2</sub>S` de un documento saldría «H 2 S» y el
 * extracto dejaría de ser prefijo del cuerpo. Es el mismo corte en `<sub>` que
 * la 76.ª se comió al nombrar el sobrante de la serie.
 */
const planoCrudo = (html: string) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Las entidades se decodifican **DESPUÉS de cortar**, porque el corte es sobre
 * el crudo (medido: `bytes-crudo` 23/23 contra `bytes-deco` 22/23, y la
 * instancia que los separa es la única del corpus con `&amp;`).
 */
const decodifica = (s: string) =>
  s
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&#039;|&#39;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&#8211;/g, "–")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&");

/**
 * `substr` de PHP: corta a `n` BYTES y, si parte un carácter multibyte, el byte
 * huérfano **no sobrevive** a la salida UTF-8 y el carácter desaparece entero.
 */
function cortaABytes(s: string, n: number): string {
  return Buffer.from(s, "utf8").subarray(0, n).toString("utf8").replace(/�+$/, "");
}

/**
 * El extracto de la tarjeta de `L3`, con su terminador.
 *
 * ⚠ **El caso «cuerpo MÁS CORTO que el tope» está SIN PROBAR y NO SOPORTADO**:
 * **0 de 23** tarjetas lo ejercitan (`lh-extracto-unidad` §noMide). Así que no
 * se inventa la rama: si el cuerpo no llega al tope, se sirve entero **y sin
 * puntos**, que es lo que hace `wp_trim_words` cuando no recorta — pero eso es
 * una **derivación sin instancia**, y por tanto se declara aquí y se ficha. El
 * día que aparezca un documento corto, esto es un camino de render **sin
 * estrenar** (§F2-5-ESCALON-ETIQUETAS).
 */
export function extractoCientifico(cuerpo: string): { texto: string; recortado: boolean } {
  const crudo = planoCrudo(cuerpo);
  if (Buffer.byteLength(crudo, "utf8") <= TOPE_BYTES) return { texto: decodifica(crudo), recortado: false };
  return { texto: decodifica(cortaABytes(crudo, TOPE_BYTES)), recortado: true };
}
