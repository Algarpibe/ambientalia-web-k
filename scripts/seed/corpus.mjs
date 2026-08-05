/**
 * LO QUE «EL CUERPO» SIGNIFICA — una sola definición, importada.
 *
 * ── Por qué existe este fichero ────────────────────────────────────────────
 * `captura.mjs` y `extractor.mjs` traían **la misma función copiada**, y la
 * tercera copia iba a ser la sonda del `srcset`. Eso es la clase C7 de este
 * repo —*dos definiciones de «lo mismo»*— y el precedente ya está pagado: el
 * `validate` del alta y el extractor importan **la misma** `validaHtmlCorpus`
 * en vez de replicar la whitelist.
 *
 * El riesgo concreto no es estético: si una copia deja de estar de acuerdo con
 * la otra, el recuento de `cuerpoBytes` del INDICE y lo que el extractor
 * transforma dejan de referirse al mismo texto — **y las dos salidas seguirían
 * siendo verdes**, porque cada una es coherente consigo misma.
 */

/**
 * El interior de un `<div>` que empieza en `desde`, casando etiquetas de
 * apertura y cierre. No sirve un regex: los `div` de Divi anidan.
 */
export function interiorDiv(html, desde) {
  const fin = html.indexOf(">", desde);
  if (fin < 0) return null;
  const re = /<(\/?)div\b/gi;
  re.lastIndex = fin + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}

/**
 * El `post_content` de una página del corpus, o `null` si no lo tiene.
 * `null` NO es «vacío»: las páginas de builder (casos · faqs · productos) no
 * tienen marcador, y eso es forma, no fallo.
 */
export function postContent(html) {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  return i < 0 ? null : interiorDiv(html, i);
}
