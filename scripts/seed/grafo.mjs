/**
 * EL GRAFO DE DEPENDENCIAS, **DERIVADO DE LA CONFIG RESUELTA** — y no el orden
 * escrito a mano.
 *
 * ── El defecto que obliga a que esto exista ────────────────────────────────
 * `CATALOGOS` llevaba su orden **escrito a mano** con un comentario que decía
 * *«el ORDEN es de dependencia»*. La primera corrida del seed falló con
 * `RELACIÓN SIN DESTINO` en `taxonomia-sectores.pagina`, y **la lectura natural
 * de ese error es «el orden está mal puesto»** — o sea, muévelo. No era eso:
 *
 *     taxonomia-sectores → sectores → casos → taxonomia-sectores
 *
 * **es un CICLO, y no hay orden que lo satisfaga.** Reordenar habría movido el
 * fallo de sitio corrida tras corrida sin llegar nunca a verde, que es
 * exactamente la forma de perder una tarde sin aprender nada.
 *
 * Y lo peor no fue el ciclo, fue el veredicto: **una lista escrita a mano
 * afirma «esto es un orden topológico» y nadie lo comprueba.** Es la clase de
 * `CLAUDE.md` §sondas regla 9 —*un recuento afirmado de memoria se barre antes
 * de usarse*— aplicada a un orden en vez de a un número: el orden se **deriva**
 * o no vale.
 *
 * ── Lo que se deriva y lo que no ──────────────────────────────────────────
 * Las aristas salen de recorrer los `fields` de la **config resuelta** buscando
 * `relationship` — *verificar contra la salida servida, no contra la fuente que
 * uno supone responsable*. Lo único declarado son:
 *
 *   · **el conjunto de colecciones en juego** (las que el seed escribe), y
 *   · **las rutas PODADAS** (`RUTAS_EN_FRONTERA`), que se comprueban: una ruta
 *     podada que no casa con ningún campo sale por **DECLARACIÓN MUERTA**, como
 *     las excepciones de `cms-campos`.
 *
 * **`upload` no entra**: `media` no es un catálogo y el seed la crea por
 * demanda, así que no impone orden. Se dice aquí porque un alcance que no se
 * declara se lee como cobertura.
 */

/** Recorre los `fields` de una colección y llama a `visita(ruta, campo)`. */
function recorreCampos(campos, ruta, visita) {
  for (const c of campos ?? []) {
    if (!c?.name) {
      // Presentacional (fila, pestaña…): sus hijos cuelgan del mismo sitio.
      if (Array.isArray(c?.fields)) recorreCampos(c.fields, ruta, visita);
      continue;
    }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    visita(aqui, c);
    if (Array.isArray(c.fields)) recorreCampos(c.fields, aqui, visita);
    if (Array.isArray(c.blocks)) for (const b of c.blocks) recorreCampos(b.fields, `${aqui}[${b.slug}]`, visita);
  }
}

/**
 * Aristas `origen → destino`, con la RUTA del campo que las produce.
 *
 * @param {object} config              la config RESUELTA de Payload
 * @param {string[]} colecciones       las que el seed escribe (el resto no impone orden)
 * @param {string[]} podadas           rutas de campo que el seed no escribe
 * @returns {{aristas: Map<string, Map<string, string[]>>, muertas: string[]}}
 */
export function aristasDeConfig(config, { colecciones, podadas = [] } = {}) {
  const enJuego = new Set(colecciones);
  const aristas = new Map(colecciones.map((c) => [c, new Map()]));
  const podadasVistas = new Set();

  for (const col of colecciones) {
    const cfg = config.collections.find((x) => x.slug === col);
    /* Regla 6: una ausencia se rechaza. Un `?? {fields:[]}` aquí daría un grafo
     * SIN aristas para esa colección — o sea acíclico y verde — que es
     * exactamente el verde vacío del que este fichero protege. */
    if (!cfg) throw new Error(`GRAFO: la colección '${col}' no está en la config resuelta.`);
    recorreCampos(cfg.fields, "", (ruta, campo) => {
      if (campo.type !== "relationship") return;
      if (podadas.includes(ruta)) {
        podadasVistas.add(ruta);
        return;
      }
      const destinos = Array.isArray(campo.relationTo) ? campo.relationTo : [campo.relationTo];
      for (const d of destinos) {
        if (!enJuego.has(d)) continue; // fuera del seed ⇒ no impone orden
        const m = aristas.get(col);
        if (!m.has(d)) m.set(d, []);
        m.get(d).push(ruta);
      }
    });
  }

  /* Una poda declarada que no casa con ningún campo es una declaración que se
   * pudrió: seguiría «podando» nada y el grafo tendría una arista de más sin
   * que nadie se entere. Sale nombrada, igual que en `cms-campos`. */
  const muertas = podadas.filter((p) => !podadasVistas.has(p));
  return { aristas, muertas };
}

/**
 * Componentes fuertemente conexas (Tarjan). Un ciclo es una componente de más
 * de un nodo, o un nodo con arista a sí mismo.
 */
function ciclosDe(aristas) {
  let idx = 0;
  const indice = new Map();
  const bajo = new Map();
  const pila = [];
  const enPila = new Set();
  const ciclos = [];

  const conecta = (v) => {
    indice.set(v, idx);
    bajo.set(v, idx);
    idx++;
    pila.push(v);
    enPila.add(v);
    for (const w of aristas.get(v)?.keys() ?? []) {
      if (!indice.has(w)) {
        conecta(w);
        bajo.set(v, Math.min(bajo.get(v), bajo.get(w)));
      } else if (enPila.has(w)) {
        bajo.set(v, Math.min(bajo.get(v), indice.get(w)));
      }
    }
    if (bajo.get(v) === indice.get(v)) {
      const comp = [];
      for (;;) {
        const w = pila.pop();
        enPila.delete(w);
        comp.push(w);
        if (w === v) break;
      }
      const propio = aristas.get(v)?.has(v);
      if (comp.length > 1 || propio) ciclos.push(comp.reverse());
    }
  };

  for (const v of aristas.keys()) if (!indice.has(v)) conecta(v);
  return ciclos;
}

/**
 * Los valores que una RUTA DE CAMPO alcanza dentro de un dato medido.
 *
 * Hace falta para una pregunta que el grafo solo no contesta: una **auto-
 * relación** (`categorias-recursos.padre → categorias-recursos`) es un ciclo en
 * el grafo, pero **no es el mismo animal** que un ciclo entre colecciones — no
 * pide otro orden de colecciones, pide otro orden de FILAS. Y si el dato no la
 * usa, no pide nada. Eso se **mide**, no se declara.
 */
export function valoresDe(dato, ruta) {
  let actual = [dato];
  for (const bruto of ruta.split(".")) {
    const m = bruto.match(/^([^[]+)(?:\[([^\]]+)\])?$/);
    if (!m) return [];
    const [, nombre, bloque] = m;
    const siguiente = [];
    for (const v of actual) {
      for (const item of Array.isArray(v) ? v : [v]) {
        if (item === null || typeof item !== "object") continue;
        if (bloque && item.blockType !== undefined && item.blockType !== bloque) continue;
        if (bloque && item.kind !== undefined && item.kind !== bloque) continue;
        const hijo = item[nombre];
        if (hijo === undefined || hijo === null) continue;
        siguiente.push(hijo);
      }
    }
    actual = siguiente;
    if (!actual.length) return [];
  }
  return actual.flatMap((v) => (Array.isArray(v) ? v : [v]));
}

/**
 * Comprueba que un orden DECLARADO satisface el grafo derivado.
 *
 * Devuelve las tres cosas por separado porque **significan cosas distintas**:
 *   · `ciclos`      — entre colecciones: no existe NINGÚN orden. Reordenar no
 *                     arregla nada, hacen falta dos pasadas o podar;
 *   · `autos`       — auto-relaciones: el orden que piden es **de filas**
 *                     (padres antes que hijos), no de colecciones;
 *   · `violaciones` — el orden declarado escribe un origen antes que su destino.
 */
export function verificaOrden(aristas, declarado) {
  const todos = ciclosDe(aristas);
  /* Un ciclo de un solo nodo es una auto-relación, y sale por su puerta: si se
   * mezclara con los de arriba, un `padre` jerárquico se leería como «no existe
   * orden posible» y mandaría a partir el seed en dos pasadas sin motivo. */
  const autos = todos.filter((c) => c.length === 1).map((c) => ({ coleccion: c[0], rutas: aristas.get(c[0]).get(c[0]) }));
  const ciclos = todos.filter((c) => c.length > 1);
  const pos = new Map(declarado.map((c, i) => [c, i]));
  const violaciones = [];
  const noDeclaradas = [];
  for (const [origen, destinos] of aristas) {
    if (!pos.has(origen)) { noDeclaradas.push(origen); continue; }
    for (const [destino, rutas] of destinos) {
      if (!pos.has(destino)) { noDeclaradas.push(destino); continue; }
      if (destino === origen) continue; // auto-relación: sale por `autos`
      if (pos.get(destino) > pos.get(origen))
        violaciones.push({ origen, destino, rutas, posOrigen: pos.get(origen), posDestino: pos.get(destino) });
    }
  }
  return { ciclos, autos, violaciones, noDeclaradas: [...new Set(noDeclaradas)] };
}

/** Texto legible de un ciclo: `a → b → c → a`. */
export const pintaCiclo = (c) => [...c, c[0]].join(" → ");
