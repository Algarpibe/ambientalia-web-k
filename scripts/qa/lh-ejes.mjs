/**
 * EL CLASIFICADOR DE EJES DE LOS LISTADOS — módulo compartido, sin efectos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTO ES UN MÓDULO Y NO UNA COPIA
 *
 * `ejeDe()` nació dentro de `lh-cmp.mjs` y ahí sigue siendo su consumidor
 * principal. Lo que obligó a sacarlo es que **el alcance verificable de una
 * tanda hay que declararlo ANTES de construir**, y `lh-cmp.mjs` arranca el clon
 * en el módulo (`iniciarClon()` al importarse): preguntarle «¿qué fracción de
 * pares puedo verificar?» costaba un `next start` y una corrida entera del
 * comparador.
 *
 * La alternativa —reescribir la clasificación en la sonda de alcance— es la
 * clase C7 en su peor salida: **dos verdes en su marco midiendo cosas
 * distintas**. Es el mismo argumento que la cabecera de `lh-cmp.mjs` ya escribe
 * para `lh-barrido.mjs` (*«Dos copias serían la clase C7»*), aplicado al otro
 * eje del mismo fichero.
 *
 * Así que aquí no hay lógica nueva: es **el mismo código, movido**, y sus dos
 * consumidores (`lh-cmp.mjs` y `lh-alcance.mjs`) lo importan.
 *
 * ── LA REFERENCIA SE DECLARA POR EJE (§F3-LH-DOS-FOTOS) ───────────────────
 *
 * | eje | referencia | por qué |
 * |---|---|---|
 * | `contenido` | **el CORPUS** del que se sembró el clon | comparar el texto contra el vivo mide la deriva del ORIGINAL, no la fidelidad del clon |
 * | `plantilla` | **el ORIGINAL vivo** (el espejo) | la plantilla no deriva, y ahí es donde vive la fidelidad |
 * | `mixta` | **ninguna de las dos, limpia** | depende de las dos cosas a la vez ⇒ ESCALÓN declarado |
 *
 * ── Y POR QUÉ EL CLASIFICADOR DEVUELVE `null` EN VEZ DE UN DEFECTO ────────
 * §regla 6: *un valor por defecto convierte «no lo sé» en «está bien»*. Un
 * `?? "plantilla"` metería toda propiedad nueva en el eje que se compara contra
 * el vivo, **en silencio**. Devolver `null` obliga a quien llama a tirar con el
 * nombre del camino, que es la única forma de que el escalón dispare por
 * mecanismo y no porque alguien se acordara de mirar.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Caminos que NO son pares: metadatos del barrido y etiquetas que `lh-spec`
 * añade **encima** del barrido para rotular sus páginas.
 *
 * ⚠ `forma`, `ruta` y `papel` **no salen de `barrer()`**. El clon **nunca** los
 * tiene, así que sin esta exclusión aparecerían como **3 pares «AUSENTE» por
 * forma —39 en total— leídos como defecto del clon**. Es la clase de fantasma
 * que se hace pasar por hallazgo, y la cazó el censo de ejes al no saber
 * clasificarlos.
 */
export const IGNORAR = new Set(["ancho", "canonical", "titulo", "docH", "forma", "ruta", "papel"]);

/**
 * De un árbol a un mapa `camino → escalar`.
 *
 * Las listas de longitud distinta no se emparejan por índice a ciegas: la
 * longitud es ella misma un par (`listado.nTarjetas`), y los índices que faltan
 * salen como AUSENTE en un lado — que es información, no un hueco.
 */
export const aplana = (v, camino = "", out = new Map()) => {
  if (v === null || v === undefined) out.set(camino, null);
  else if (Array.isArray(v)) {
    out.set(`${camino}.length`, v.length);
    v.forEach((x, i) => aplana(x, `${camino}.${i}`, out));
  } else if (typeof v === "object") for (const [k, x] of Object.entries(v)) aplana(x, camino ? `${camino}.${k}` : k, out);
  else out.set(camino, v);
  return out;
};

/** Hoja del camino: `listado.tarjetas.0.titulo.tipo.fontSize` → `fontSize`. */
export const hoja = (c) => c.slice(c.lastIndexOf(".") + 1);

/** Texto y URLs que vienen del DOCUMENTO: su referencia es el corpus. */
const HOJAS_CONTENIDO = new Set(["texto", "titular", "alt", "src", "srcset", "href", "linkNextDelHead", "attrW", "attrH"]);

/** Depende de la plantilla Y de cuánto contenido hay: sin referencia limpia. */
const HOJAS_MIXTAS = new Set(["h", "y", "yAbsoluta", "renglones", "nTarjetas", "huecoV", "docH"]);

/** Estructura y piel que la plantilla fija: su referencia es el original vivo. */
const HOJAS_PLANTILLA = new Set([
  "w", "x", "via", "piel", "presente", "enElCuerpo", "hayH1", "renderizado", "renderizada",
  "etiqueta", "que", "reparto", "nFilas", "nColumnas", "nSecciones", "nModulos", "capa",
  "columnas", "huecoH", "apiladas", "nota", "builder", "tbBody", "estiloInline", "length",
]);

/**
 * El eje de un camino, o `null` si no está declarado.
 *
 * ⚠ `clases`, `marca` y `hrefs` **no se clasifican por la hoja**: su valor
 * mezcla las dos cosas (`article.et_pb_post.post-68584`) o es una lista de URLs.
 * Se resuelven por el camino, antes que por la hoja.
 */
export function ejeDe(camino) {
  const h = hoja(camino);
  /* Las listas de URLs y los índices dentro de ellas: contenido. */
  if (/(^|\.)hrefs(\.|$)/.test(camino)) return h === "length" ? "mixta" : "contenido";
  /* `clases.N` y `marca`: el tema y el dato en el mismo valor ⇒ mixta. */
  if (/(^|\.)clases(\.|$)/.test(camino)) return h === "length" ? "mixta" : "mixta";
  if (h === "marca") return "mixta";
  /* `etiquetas` del barrido es la lista de TAGS HTML de la tarjeta: estructura. */
  if (/(^|\.)etiquetas(\.|$)/.test(camino)) return "plantilla";
  /* Los grupos de estilo son plantilla enteros, sea cual sea la propiedad CSS. */
  if (/\.(tipo|ritmo|caja)\.[A-Za-z]+$/.test(camino)) return "plantilla";
  /* ⚠ `…columnas.N.tipo` NO es el grupo de tipografía: es el TIPO DE COLUMNA
   * (`et_pb_column_4_4`), o sea el reparto de la retícula. La hoja se llama
   * igual y significa otra cosa — por eso va por camino y antes que por hoja. */
  if (/\.columnas\.\d+\.tipo$/.test(camino)) return "plantilla";
  /**
   * ⚠ **LA AUSENCIA DE UN ROL ES MIXTA, y es el escalón en su forma más
   * afilada.** `un(p)` devuelve `null` cuando el rol no casa, y `null` significa
   * **dos cosas distintas que el camino no distingue**:
   *
   *  · `media: null` en la 1.ª tarjeta de `/blog` ⇒ **ese post no tiene imagen**
   *    (la 2.ª sí) — o sea CONTENIDO;
   *  · `fecha: null` en las 15 tarjetas de `resources` ⇒ **esa variante no pinta
   *    fecha** — o sea PLANTILLA.
   *
   * El discriminador existe y es el **test B** del proyecto —*¿varía entre
   * hermanos de la misma página?*—, pero la comparación par a par es plana y no
   * puede aplicarlo: habría que mirar las 3 tarjetas a la vez. Así que se
   * declara **mixta** en vez de elegir, que es lo que este repo llama no
   * inventar un discriminador.
   */
  if (/^listado\.tarjetas\.\d+\.(media|envoltorioMedia|titulo|fecha|categoria|meta|extracto)$/.test(camino)) return "mixta";
  /* Lo mismo para cualquier otro objeto que el barrido pueda devolver nulo. */
  if (/^(cabecera|pie|contenedorTema|listado\.contenedor)$/.test(camino)) return "mixta";
  /* `porCapa.tb_header` y compañía: recuento de estructura. */
  if (/(^|\.)porCapa\./.test(camino)) return "plantilla";
  if (/(^|\.)regimen\./.test(camino)) return "plantilla";
  /* `sel` es el selector que casó: dice CON QUÉ se midió, o sea estructura. */
  if (h === "sel") return "plantilla";
  if (HOJAS_CONTENIDO.has(h)) return "contenido";
  if (HOJAS_MIXTAS.has(h)) return "mixta";
  if (HOJAS_PLANTILLA.has(h)) return "plantilla";
  return null;
}

/**
 * Censo de ejes de un árbol de espejo: `{ contenido, plantilla, mixta }` más la
 * lista de caminos **sin eje declarado**.
 *
 * Devuelve los sin clasificar en vez de tirar: quien llama decide si eso es un
 * error (el comparador) o un dato que enseñar (la sonda de alcance). Lo que
 * ninguno de los dos puede hacer es ignorarlos.
 */
export function censaEjes(arbol) {
  const censo = { contenido: 0, plantilla: 0, mixta: 0 };
  const sinClasificar = [];
  for (const k of aplana(arbol).keys()) {
    if (IGNORAR.has(k)) continue;
    const e = ejeDe(k);
    if (!e) sinClasificar.push(k);
    else censo[e]++;
  }
  return { censo, sinClasificar };
}
