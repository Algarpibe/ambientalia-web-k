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
 * ⚠ **DÓNDE VIVEN LOS ALIAS — y por qué aquí ya NO hay ninguna lista
 * (borrada el 2026-08-04).**
 *
 * Aquí había un `export const ALIAS = {…}` con los cuatro alias de §2e/§2b, más
 * un `IGNORADOS` vacío, más un comentario que decía que `aliasCoherentes()` los
 * verificaba contra el fichero de `qa:cms-campos`. Derivado (`grep -rn "ALIAS"
 * scripts/`): **nadie importaba ninguno de los dos, y `aliasCoherentes` no
 * existía en el repo.** Tres afirmaciones y cero código — la regla 3 de
 * `CLAUDE.md` §sondas (*documentado no es conectado*) en mi propio fichero, y
 * la 3.ª hermana (*un comentario que afirma consumidores es un dato sin
 * fuente*) en el mismo bloque.
 *
 * Lo que hace el trabajo de verdad, y hay que mirar ahí:
 *
 * | quién | qué alias | dónde |
 * |---|---|---|
 * | **la IDA** | `id→slug` · `name→titulo` · `href→padre` · `paginaSlug→pagina` | `PREPARA` en `seed.mjs` |
 * | **la VUELTA** | los mismos, al revés | `DEVUELVE` en `seed.mjs`, y `sonInversas()` lo COMPRUEBA sobre el catálogo |
 * | **la auditoría de campos** | los mismos, declarados para el censo | `ALIAS` en `scripts/qa/cms-campos.mjs`, con su `DECLARACIÓN MUERTA` |
 *
 * La coherencia entre la ida y la vuelta **no se declara: se ejecuta** —
 * `sonInversas()` corre `DEVUELVE(PREPARA(fila)) === fila` sobre las 46 filas y
 * tira si alguna no vuelve. Es lo que el comentario borrado prometía y no hacía.
 * ═════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CAMPOS QUE PAYLOAD AÑADE SOLO — y por qué esto no es cosmética
 *
 * ⚠ **DEFECTO DE INSTRUMENTO Nº 4, cazado el 2026-08-04 por el sondeo nuevo y
 * NO por leer el código: la regla del envoltorio transparente NUNCA LLEGÓ A
 * DISPARARSE.**
 *
 * El walker va dirigido por la config **resuelta**, que es lo correcto —
 * *verificar contra la salida servida*—, y `buildConfig` **inyecta campos que
 * nadie escribió**: un `id` oculto en cada `array`, un `id` + `blockName` en
 * cada `block`, y `createdAt`/`updatedAt` en cada colección.
 *
 * Consecuencia, y es de las que no dan error:
 *
 *   · la ida decidía «array de UN campo ⇒ envoltorio transparente» con
 *     `hijos.length === 1`, y con el `id` inyectado **la longitud es 2**. La
 *     rama nunca se ejecutó. `bullets: string[]` habría entrado como
 *     `[{}, {}, {}, {}, {}]` — **cinco filas vacías, cero error**;
 *   · y la vuelta habría devuelto `id`, `blockName` y las dos fechas como si
 *     fueran dato medido, o sea **Δ ≠ 0 en cada array y cada bloque del
 *     modelo**, con la causa a tres saltos del síntoma.
 *
 * **Alcance medido: 17 arrays de un solo campo propio**, en `sectores`,
 * `monograficos`, `productos` y `articulos-kb`. **Ninguno en las tres
 * colecciones sembradas hasta hoy** (`faqs` · `terminos-kunakpedia` ·
 * `documentos-cientificos`), y por eso los 12 documentos del bloque 1 no
 * perdieron nada: el defecto estaba **fuera de la muestra que se sembró**, que
 * es la definición de FAMILIA DE CALIBRACIÓN.
 *
 * ── Cómo se reconocen, y por qué NO por el nombre ─────────────────────────
 * Un `SINTETICOS = ["id", "blockName", …]` por nombre es una lista a mano que
 * se pudre y que además **borraría un campo medido que se llamara igual**. Se
 * reconocen por su **forma**, que es lo que Payload garantiza: el `id` de array
 * es `text` + `admin.hidden`; `blockName` es `text` + `admin.disabled`; las dos
 * fechas son `date` + `admin.hidden`. Y `esSintetico` se comprueba en negativo
 * (`sondeo.neg.mjs` no lo cubre; lo cubre el round-trip, que sin esto no da Δ0).
 * ═════════════════════════════════════════════════════════════════════════ */

/** ¿Lo puso `buildConfig` o lo escribió el esquema? */
export function esSintetico(campo) {
  if (!campo?.name) return false;
  const a = campo.admin ?? {};
  if (campo.name === "id" && campo.type === "text" && a.hidden === true) return true;
  if (campo.name === "blockName" && campo.type === "text" && a.disabled === true) return true;
  if ((campo.name === "createdAt" || campo.name === "updatedAt") && campo.type === "date" && a.hidden === true)
    return true;
  return false;
}

/** Los campos del esquema, sin los que Payload se inventa. */
export const camposPropios = (campos) => (campos ?? []).filter((c) => !esSintetico(c));

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
 * ¿Es este `array` un ENVOLTORIO TRANSPARENTE del dato medido? — o sea,
 * `bullets: string[]` en vez de `[{texto}]`.
 *
 * ⚠ **Se exporta y se usa en TODAS partes, y eso no es comodidad: es la clase
 * C7.** La regla se ha re-implementado tres veces en dos días y ha salido mal
 * las tres, siempre con números plausibles:
 *
 *   1. el walker contaba `campo.fields.length`, que incluye el `id` que inyecta
 *      `buildConfig` ⇒ la rama **no se ejecutaba nunca** (17 arrays del modelo);
 *   2. la auditoría del sondeo copió la idea sin la corrección ⇒ **110
 *      `required` sin dato que no existían**;
 *   3. y la copió otra vez con `typeof x !== "object"` en vez de `esObj`, que
 *      **es distinto para un array** ⇒ **43 más**, en `ul: MonoInline[][]`.
 *
 * Las tres eran la misma regla escrita tres veces. Ahora está escrita una.
 */
export function envoltorioTransparente(campo, valor) {
  return camposPropios(campo.fields).length === 1 && Array.isArray(valor) && !esObj(valor[0]);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL ESCALAR EN UN ARRAY DE VARIOS CAMPOS — ⚠ **el defecto que TIRABA 16
 * CELDAS DE TABLA SIN UN SOLO ERROR (2026-08-04, `qa:cms-roundtrip`).**
 *
 * `MonoCelda = string | { fuerte: string; resto?: string }` es una **unión de
 * dos formas**, y §1.5 la modela aplanada: `CELDA = [texto, fuerte, resto]`,
 * donde `texto` **es** la forma de cadena. Tres campos propios, así que el
 * envoltorio transparente de arriba —que exige UNO— no aplica.
 *
 * Y lo que pasaba entonces no era un error: `aPayload(CELDA, "H₂S, CH₄, CO₂")`
 * hace `dato?.[campo.name]` sobre una **cadena**, así que los tres campos salen
 * `undefined` y el resultado es **`{}`**. Una fila vacía en la tabla, insertada
 * sin protestar. **16 celdas de la tabla de EDAR entraban en la DB en blanco**,
 * y sólo se vio porque la vuelta las devolvió como `{}` contra un texto.
 *
 * Las dos mitades del arreglo, y la primera importa más que la segunda:
 *
 *   1. **un escalar donde el esquema espera un objeto TIRA** (regla 6: una
 *      ausencia se rechaza, no se traduce a un valor benigno). Sin esto, la
 *      próxima unión aplanada vuelve a entrar en blanco;
 *   2. **`escalarA` dice a qué campo va la forma escalar**, y **se declara en el
 *      propio campo** (`custom.escalarA` de Payload), no en una tabla de rutas
 *      aquí: una lista de rutas escrita a mano es una copia desactualizada de
 *      algo que puede vivir al lado de su definición (regla 9).
 *
 * Con 3 campos candidatos **no hay nada que derivar** —cuál de los tres recibe
 * la cadena es una decisión del modelo—, y por eso se declara. Lo que no se
 * declara es que exista: eso lo dice el dato, y si no está declarado, tira.
 * ═════════════════════════════════════════════════════════════════════════ */

/** El campo que recibe la forma ESCALAR de una unión aplanada, si se declaró. */
export const escalarA = (campo) => campo?.custom?.escalarA ?? null;

/**
 * La VUELTA de `escalarA`: un objeto en el que **sólo** está el campo escalar
 * vuelve como el valor pelado. Si hay cualquier otro campo, vuelve como objeto —
 * que es la otra rama de la unión, y confundirlas perdería `{fuerte, resto}`.
 */
export function deEscalar(campo, obj) {
  const n = escalarA(campo);
  if (!n || !esObj(obj)) return obj;
  const claves = Object.keys(obj);
  return claves.length === 1 && claves[0] === n ? obj[n] : obj;
}

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
export function eligeBloque(bloques, item, ruta, ctx) {
  if (item?.kind) {
    const b = bloques.find((x) => x.slug === item.kind);
    /**
     * ⚠ **Aquí es donde se DERIVA si el `kind` vuelve, y por eso no hay lista.**
     * Que un bloque lo lleve o no es una propiedad **del dato medido**, no del
     * esquema: `MonoModulo` lo trae y `MonoBloqueTexto` (`{p} | {ul} | {claim}`)
     * discrimina por la clave presente. Una lista escrita a mano de «cuáles
     * llevan kind» sería una copia desactualizada de algo que este `if` ya sabe
     * — que es literalmente la regla 9 de `CLAUDE.md` §sondas.
     *
     * ⚠ **Y se declara POR RUTA, no por slug (corregido el 2026-08-04).** Se
     * apuntaba en un `Set` global de slugs, y **`claim` y `titular` son slug de
     * DOS bloques distintos**: uno de `modulos` (que sí trae `kind`) y otro de
     * `bloques` (que discrimina por la clave presente y **no** lo trae). Un
     * `kind: "claim"` en un módulo marcaba el slug entero, así que la vuelta le
     * inventaba un `kind` a los 7 `{claim: …}` del cuerpo. Un `Set` global es
     * *dos definiciones de «lo mismo»* (clase C7) escritas como una.
     */
    if (b) { ctx?.declaraKinds?.(ruta, [b.slug]); return b; }
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
  for (const campo of camposPropios(campos)) {
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
      /**
       * ⚠ **`""` EN UN `upload` ES EL CENTINELA DE «NO HAY IMAGEN» DEL CLON, y
       * es dato medido, no un hueco.** `products.ts` lo dice en su comentario:
       * *«Medido: este panel NO trae imagen en el original. No es un hueco por
       * llenar — es el dato»*. `Product.image` es `string` no opcional, así que
       * la clave está SIEMPRE y la ausencia se codifica con la cadena vacía.
       *
       * En Payload la ausencia se expresa **no poniendo el campo**, así que ésta
       * es una transformación de FORMA como las cuatro de la cabecera — y como
       * ellas, tiene que ser **invertible**: se apunta la ruta en `ctx` para que
       * la vuelta devuelva `""` y no una clave que falta. Sin la inversa, el
       * round-trip fallaría por FORMA en cada producto sin foto.
       *
       * Lo cazó la guarda de `ctx.media`, que tira en vez de sustituir: un
       * `?? null` habría subido una media vacía y nadie se habría enterado.
       */
      if (bruto === "") { ctx.centinelaVacio?.(aqui); return undefined; }
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
        const b = eligeBloque(campo.blocks, item, `${aqui}[${i}]`, ctx);
        salida.push({ blockType: b.slug, ...(await aPayload(b.fields, item, ctx, `${aqui}[${i}]`)) });
      }
      return salida;
    }

    case "array": {
      const hijos = camposPropios(campo.fields);
      /**
       * ⚠ **El envoltorio de un array de UN campo es transparente en el dato
       * medido**: `bullets: string[]` en vez de `[{texto}]`. Es la misma regla
       * que `qa:cms-campos` aplica al derivar rutas de campo, y por eso las dos
       * ven el mismo modelo.
       *
       * ⚠⚠ **`hijos` es `camposPropios(...)` y no `campo.fields`, y ésa es la
       * diferencia entre que esta rama corra y que no corra nunca.** Ver el
       * bloque de `esSintetico` arriba: con el `id` inyectado la longitud era 2
       * en los 17 arrays de un solo campo del modelo.
       */
      if (envoltorioTransparente(campo, bruto)) {
        const h = hijos[0];
        return await Promise.all(
          bruto.map(async (v, i) => ({ [h.name]: await valorDe(h, { [h.name]: v }, ctx, `${aqui}[${i}]`) })),
        );
      }
      return await Promise.all(
        bruto.map((v, i) => aPayload(hijos, exigeObjeto(campo, v, `${aqui}[${i}]`), ctx, `${aqui}[${i}]`)),
      );
    }

    case "group":
      return await aPayload(campo.fields ?? [], bruto, ctx, aqui);

    default:
      return bruto;
  }
}

/**
 * Un ítem de array que llega ESCALAR contra un objeto de varios campos: o lo
 * envuelve el `escalarA` declarado, **o tira**. Nunca `{}`.
 */
function exigeObjeto(campo, v, donde) {
  if (esObj(v)) return v;
  const n = escalarA(campo);
  if (n) return { [n]: v };
  throw new Error(
    `ESCALAR SIN DESTINO en ${donde}: llegó ${JSON.stringify(v)?.slice(0, 60)} y el esquema\n` +
      `  espera un objeto de [${camposPropios(campo.fields).map((c) => c.name).join(", ")}].\n` +
      `  Antes esto devolvía \`{}\` en silencio —16 celdas de tabla entraron en blanco—.\n` +
      `  Si es una unión aplanada, declara \`custom: { escalarA: "<campo>" }\` en el array.`,
  );
}

/** El bloque de la config que corresponde a un `blockType`. */
function bloqueDe(campo, blockType, aqui, i) {
  const b = campo.blocks?.find((x) => x.slug === blockType);
  if (!b) throw new Error(`BLOQUE DESCONOCIDO al proyectar ${aqui}[${i}]: '${blockType}'`);
  return b;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA LISTA VACÍA — `[]` en Payload es la MISMA cosa que «este campo no está»
 *
 * ⚠ Y decirlo importa, porque parece una normalización de las prohibidas.
 *
 * La ida no emite la clave cuando el dato medido no la trae, así que Payload no
 * escribe filas. Al leer, un `array`/`blocks` sin filas **siempre** devuelve
 * `[]`: no hay forma de guardar «este campo no existe» distinta de «existe y
 * está vacío». O sea que la ida no es inyectiva **por el modelo de Payload**, no
 * por el walker, y la vuelta tiene que elegir una de las dos preimágenes.
 *
 * Se elige AUSENTE, y el respaldo es derivado, no recordado: un recorrido de los
 * 9 catálogos —46 filas— da **0 arrays vacíos explícitos**. Sobre el dominio
 * medido la preimagen es única, así que la inversa es exacta.
 *
 * **Y se auto-vigila**: el día que un dato medido traiga un `[]` explícito, el
 * comparador verá `[]` contra ausente y fallará por FORMA en esa ruta. No hace
 * falta acordarse de nada.
 * ═════════════════════════════════════════════════════════════════════════ */

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
 * ✅ **EJERCITADA el 2026-08-04 por `qa:cms-roundtrip`**, que la estrenó. La
 * etiqueta anterior decía «escrita y nunca corrida», y era literal en un
 * sentido que ni ella misma se atribuía: **llamaba a tres métodos de `ctx` que
 * no existían** (`rutaDeMedia`, `deRel`, `conKind`). La primera llamada habría
 * muerto con `is not a function`.
 *
 * Lo que la primera corrida le encontró, ninguno visible leyendo el código:
 *
 *   1. los tres métodos de contexto ausentes (arriba);
 *   2. **los campos sintéticos de `buildConfig`** —`id`, `blockName`,
 *      `createdAt`, `updatedAt`— proyectados como si fueran dato medido;
 *   3. el envoltorio transparente de array, roto en las **dos** direcciones por
 *      la misma causa (ver `esSintetico`).
 *
 * **Su negativo entero es `qa:cms-roundtrip-neg`**, y el invariante que manda es
 * el del **defecto omitido** de aquí abajo: `conDefecto` omite al escribir, así
 * que un campo que coincide con su defecto **no está en el dato medido**. Si el
 * proyector lo devolviera explícito, la comparación tiene que FALLAR.
 */
export function aMedido(campos, doc, ctx, ruta = "") {
  if (doc === undefined || doc === null) return doc;
  const out = {};
  for (const campo of camposPropios(campos)) {
    if (!campo?.name) {
      if (Array.isArray(campo?.fields)) Object.assign(out, aMedido(campo.fields, doc, ctx, ruta));
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    const v = proyecta(campo, doc, ctx, aqui);
    /* `undefined` y `null` significan **ausente**, y ausente es como lo escribe
     * el dato medido cuando coincide con el defecto. No se emite la clave. */
    if (v !== undefined && v !== null) out[campo.name] = v;
    /* …salvo donde el dato medido codifica la ausencia con un CENTINELA. La
     * inversa de la ida, y **sólo en las rutas que la ida vio usarlo**: emitirlo
     * en todas inventaría un `""` donde el original no tiene ni la clave. */
    else if (campo.type === "upload" && ctx?.esCentinela?.(aqui)) out[campo.name] = "";
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
      /* Misma razón que en `array`/`blocks` (ver LA LISTA VACÍA): una relación
       * `hasMany` sin filas y una ausente son indistinguibles en Payload. */
      if (campo.hasMany && bruto.length === 0) return undefined;
      const uno = (v) => ctx.deRel(campo.relationTo, v, aqui);
      return campo.hasMany ? bruto.map(uno) : uno(bruto);
    }

    case "richText":
      return lexicalAInline(bruto);

    case "blocks":
      /**
       * ⚠ **Una lista VACÍA vuelve AUSENTE.** Ver el bloque `LA LISTA VACÍA`
       * más abajo: Payload no puede almacenar la diferencia, y el dato medido
       * no la usa — derivado, **0 arrays vacíos explícitos en las 46 filas**.
       */
      if (bruto.length === 0) return undefined;
      return bruto.map((item, i) => {
        const b = bloqueDe(campo, item.blockType, aqui, i);
        const cuerpo = aMedido(b.fields, item, ctx, `${aqui}[${i}]`);
        /* El `kind` vuelve sólo si el dato medido lo llevaba: lo decide el
         * BLOQUE **en esta ruta**, no el comparador — ver `conKind` en `seed.mjs`. */
        return ctx.conKind(aqui, b.slug, cuerpo);
      });

    case "array": {
      if (bruto.length === 0) return undefined;
      const hijos = camposPropios(campo.fields);
      /* Espejo exacto de la ida: un array de UN campo propio es transparente,
       * así que vuelve como lista de valores y no como lista de objetos. */
      if (hijos.length === 1) {
        const h = hijos[0];
        return bruto.map((v, i) => proyecta(h, v, ctx, `${aqui}[${i}]`));
      }
      /* Y la inversa de `escalarA`: la unión aplanada vuelve a su forma escalar
       * cuando el único campo presente es el declarado. */
      return bruto.map((v, i) => deEscalar(campo, aMedido(hijos, v, ctx, `${aqui}[${i}]`)));
    }

    case "group": {
      const g = aMedido(campo.fields ?? [], bruto, ctx, aqui);
      return Object.keys(g).length ? g : undefined;
    }

    default:
      return bruto;
  }
}
