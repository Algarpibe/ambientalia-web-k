/**
 * EL MAPEO medido ↔ Payload — **una sola definición, recorrida en los dos
 * sentidos.**
 *
 * ── Por qué un walker y no un mapeador por colección ───────────────────────
 * Escribir `aPayload(caso)` y `aMedido(caso)` a mano por colección son **dos
 * listas de campos escritas a mano**, o sea dos copias desactualizadas de algo
 * que se puede derivar. Y peor: el PASO 2 compara la ida contra la vuelta, así
 * que **un mismo olvido en las dos daría Δ0 en falso**.
 *
 * Aquí hay **un solo recorrido**, dirigido por los `fields` de la config
 * RESUELTA de Payload —*verificar contra la salida servida, no contra la fuente
 * que uno supone responsable*—, y las dos direcciones son el mismo árbol leído
 * al derecho y al revés. Lo único escrito a mano son las **EXCEPCIONES**, que
 * van declaradas y se imprimen.
 *
 * ── Las cuatro transformaciones de FORMA, y por qué existen ────────────────
 *
 * | medido | Payload | de dónde sale |
 * |---|---|---|
 * | ruta de imagen `"/images/…"` | `upload` ⇒ **id de `media`** | CMS-0b · T3: la relación con el medio es una relación, no una clase con un id de otro sistema |
 * | término EMBEBIDO (`sectores: TerminoSector[]`) | `relationship` ⇒ **id** | §2c: el término es su propia colección |
 * | unión por CLAVE (`{claim}` · `{ul}` · `{p}`) | `blocks` ⇒ **`blockType`** | Payload discrimina con `blockType`; el tipo medido discrimina por qué clave está presente |
 * | `MonoInline = string \| MonoTrozo[]` | `richText` (Lexical, negrita) | §1.5c — **el único Lexical que queda** tras §3.1d |
 *
 * ⚠ **La cuarta es la que más cuidado pide en la VUELTA.** `"hola"` y
 * `[{b:"hola"}]` producen Lexical distinto, y tienen que volver distintos. Si
 * el proyector normalizara los dos a `"hola"`, el round-trip daría Δ0 **tapando
 * justo el campo que §1.5c dice que cambia dónde envuelve el texto**.
 */

/* ══════════════════════════════════════════════════════════════════════════
 * EXCEPCIONES DECLARADAS — lo único que no se deriva
 *
 * Son las mismas que `qa:cms-campos` declara en su `ALIAS`, y eso NO es
 * duplicación por comodidad: si las dos listas discreparan, la comprobación de
 * campos y el round-trip estarían midiendo modelos distintos. `aliasCoherentes()`
 * lo verifica contra el fichero de la sonda.
 * ═════════════════════════════════════════════════════════════════════════ */

export const ALIAS = {
  /* `id` lo reserva Payload para la PK; §2e escribe `slug`. */
  "productos:id": { payload: "slug" },
  "productos:name": { payload: "titulo" },
  /**
   * `href` **no se guarda**: §4 replica el plano del original, así que la ruta
   * se DERIVA de `padre` + `slug`. En la ida hay que hacer el camino inverso —
   * de `href` sale `padre`— y en la vuelta se reconstruye.
   */
  "productos:href": { payload: null, derivado: "padre" },
  /* §2b: relación polimórfica a sectores/monograficos. */
  "taxonomia-sectores:paginaSlug": { payload: "pagina" },
};

/** Campos del tipo medido que en Payload **no existen** y no son alias. */
export const IGNORADOS = {
  /* `SectorPage.body` y `MonograficoPage.cuerpo` son el mismo hueco con dos
   * nombres; el walker los resuelve por posición, no aquí. */
};

/* ══════════════════════════════════════════════════════════════════════════
 * `MonoInline` ↔ Lexical — la ida y la vuelta, y tienen que ser inversas
 * ═════════════════════════════════════════════════════════════════════════ */

const nodoTexto = (text, negrita) => ({
  type: "text",
  detail: 0,
  format: negrita ? 1 : 0, // 1 = IS_BOLD en Lexical
  mode: "normal",
  style: "",
  text,
  version: 1,
});

/** `string | MonoTrozo[]` → documento Lexical de un párrafo. */
export function inlineALexical(valor) {
  const trozos = typeof valor === "string" ? [valor] : Array.isArray(valor) ? valor : [];
  const hijos = trozos.map((t) =>
    typeof t === "string" ? nodoTexto(t, false) : nodoTexto(t.b, true),
  );
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          textFormat: 0,
          textStyle: "",
          children: hijos,
        },
      ],
    },
  };
}

/**
 * La vuelta. **Conserva la distinción `string` vs `MonoTrozo[]`**, que es lo que
 * hace que el round-trip pueda fallar cuando tiene que fallar:
 *
 *   · un solo trozo sin negrita  ⇒ `string`   (así lo escribe el dato medido)
 *   · cualquier otra cosa        ⇒ `MonoTrozo[]`
 */
export function lexicalAInline(doc) {
  const hijos = doc?.root?.children?.[0]?.children ?? [];
  const trozos = hijos.map((n) => (n.format & 1 ? { b: n.text } : n.text));
  if (trozos.length === 1 && typeof trozos[0] === "string") return trozos[0];
  return trozos;
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const esObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Elige el bloque de una unión.
 *
 * Dos discriminantes, y los dos son del DATO MEDIDO, no invención:
 *   · `kind` — lo llevan `MonoModulo` y los bloques de cuerpo de SECTOR;
 *   · **la clave presente** — `MonoBloqueTexto` es `{p} | {ul} | {claim} |
 *     {titular}`, sin etiqueta, y el nombre del bloque coincide con la clave.
 *
 * Si ninguno resuelve, **tira**: un bloque que no se sabe qué es no se puede
 * meter «por defecto» en el primero de la lista (regla 6).
 */
function eligeBloque(bloques, item, ruta) {
  if (item?.kind) {
    const b = bloques.find((x) => x.slug === item.kind);
    if (b) return b;
    throw new Error(`BLOQUE DESCONOCIDO en ${ruta}: kind='${item.kind}' no está entre [${bloques.map((x) => x.slug).join(", ")}]`);
  }
  const candidatos = bloques.filter((b) => Object.hasOwn(item ?? {}, b.slug));
  if (candidatos.length === 1) return candidatos[0];
  throw new Error(
    `BLOQUE AMBIGUO en ${ruta}: claves [${Object.keys(item ?? {}).join(", ")}] casan con ` +
      `${candidatos.length} bloques [${candidatos.map((b) => b.slug).join(", ")}]`,
  );
}

/**
 * IDA: dato medido → documento de Payload.
 *
 * `ctx` aporta lo que no se puede derivar de la forma: `media(ruta)` y
 * `rel(coleccion, valor)`.
 */
export async function aPayload(campos, dato, ctx, ruta = "") {
  if (dato === undefined || dato === null) return dato;
  const out = {};
  for (const campo of campos) {
    if (!campo?.name) {
      /* Presentacional sin nombre: sus hijos son hermanos del padre. */
      if (Array.isArray(campo?.fields)) Object.assign(out, await aPayload(campo.fields, dato, ctx, ruta));
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    const valor = await valorDe(campo, dato, ctx, aqui);
    if (valor !== undefined) out[campo.name] = valor;
  }
  return out;
}

async function valorDe(campo, dato, ctx, aqui) {
  const bruto = dato?.[campo.name];
  if (bruto === undefined || bruto === null) return undefined;

  switch (campo.type) {
    case "upload":
      return await ctx.media(bruto, aqui);

    case "relationship": {
      const uno = async (v) => await ctx.rel(campo.relationTo, v, aqui);
      return campo.hasMany ? await Promise.all(bruto.map(uno)) : await uno(bruto);
    }

    case "richText":
      /* El único `richText` que queda tras §3.1d es `MonoInline` (§1.5c). */
      return inlineALexical(bruto);

    case "blocks": {
      const salida = [];
      for (const [i, item] of bruto.entries()) {
        const b = eligeBloque(campo.blocks, item, `${aqui}[${i}]`);
        salida.push({ blockType: b.slug, ...(await aPayload(b.fields, item, ctx, `${aqui}[${i}]`)) });
      }
      return salida;
    }

    case "array": {
      const hijos = campo.fields ?? [];
      /**
       * ⚠ **El envoltorio de un array de UN campo es transparente en el dato
       * medido**: `bullets: string[]` en vez de `[{texto}]`. Es la misma regla
       * que `qa:cms-campos` aplica al derivar rutas de campo, y por eso las dos
       * ven el mismo modelo.
       */
      if (hijos.length === 1 && !esObj(bruto[0])) {
        const h = hijos[0];
        return await Promise.all(
          bruto.map(async (v, i) => ({ [h.name]: await valorDe(h, { [h.name]: v }, ctx, `${aqui}[${i}]`) })),
        );
      }
      return await Promise.all(bruto.map((v, i) => aPayload(hijos, v, ctx, `${aqui}[${i}]`)));
    }

    case "group":
      return await aPayload(campo.fields ?? [], bruto, ctx, aqui);

    default:
      return bruto;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * VUELTA: documento de Payload → la forma de `src/lib`
 *
 * ⚠ **Y la mitad que decide si el PASO 2 vale algo: los DEFECTOS se OMITEN.**
 * `conDefecto` omite al escribir, así que un campo que coincide con su defecto
 * **no está en el dato original**. Si el proyector lo devolviera explícito, la
 * comparación tendría que FALLAR — y por eso el proyector no lo inventa: sólo
 * devuelve lo que la DB trae, y la DB trae `null` donde el hook omitió.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠⚠ **SIN EJERCITAR — escrito y NUNCA CORRIDO (2026-08-04).** El escalón de
 * F2-2 disparó en el PASO 1, así que el PASO 2 (la igualdad mecánica) no llegó a
 * correr y **esta mitad no tiene ni una corrida detrás**.
 *
 * Se deja escrita a propósito, con esta etiqueta encima, porque la alternativa
 * —borrarla— perdería el diseño; pero **no se puede citar como que funciona**:
 * es exactamente la situación de la regla 3 (*documentado no es conectado*), y
 * la única defensa es decirlo aquí en vez de que alguien lo deduzca.
 *
 * **La tanda que la estrene tiene que probarla en negativo antes de creerle
 * nada**, empezando por el invariante del defecto omitido de abajo.
 */
export function aMedido(campos, doc, ctx, ruta = "") {
  if (doc === undefined || doc === null) return doc;
  const out = {};
  for (const campo of campos) {
    if (!campo?.name) {
      if (Array.isArray(campo?.fields)) Object.assign(out, aMedido(campo.fields, doc, ctx, ruta));
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    const v = proyecta(campo, doc, ctx, aqui);
    /* `undefined` y `null` significan **ausente**, y ausente es como lo escribe
     * el dato medido cuando coincide con el defecto. No se emite la clave. */
    if (v !== undefined && v !== null) out[campo.name] = v;
  }
  return out;
}

function proyecta(campo, doc, ctx, aqui) {
  const bruto = doc?.[campo.name];
  if (bruto === undefined || bruto === null) return undefined;

  switch (campo.type) {
    case "upload":
      return ctx.rutaDeMedia(bruto, aqui);

    case "relationship": {
      const uno = (v) => ctx.deRel(campo.relationTo, v, aqui);
      return campo.hasMany ? bruto.map(uno) : uno(bruto);
    }

    case "richText":
      return lexicalAInline(bruto);

    case "blocks":
      return bruto.map((item, i) => {
        const b = campo.blocks.find((x) => x.slug === item.blockType);
        if (!b) throw new Error(`BLOQUE DESCONOCIDO al proyectar ${aqui}[${i}]: '${item.blockType}'`);
        const cuerpo = aMedido(b.fields, item, ctx, `${aqui}[${i}]`);
        /* El `kind` vuelve sólo si el dato medido lo llevaba: lo decide quien
         * compara, con `conKind` — ver `cms-roundtrip.mjs`. */
        return ctx.conKind(b.slug, cuerpo);
      });

    case "array": {
      const hijos = campo.fields ?? [];
      if (hijos.length === 1) {
        const h = hijos[0];
        return bruto.map((v, i) => proyecta(h, v, ctx, `${aqui}[${i}]`));
      }
      return bruto.map((v, i) => aMedido(hijos, v, ctx, `${aqui}[${i}]`));
    }

    case "group": {
      const g = aMedido(campo.fields ?? [], bruto, ctx, aqui);
      return Object.keys(g).length ? g : undefined;
    }

    default:
      return bruto;
  }
}
