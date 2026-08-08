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

/**
 * ¿Es un campo de INFRAESTRUCTURA declarado por el esquema? (F2-4)
 *
 * Distinto de `esSintetico`, y a propósito: aquél reconoce lo que **Payload
 * inyecta** —y lo reconoce por su forma, porque nadie lo declara—; éste
 * reconoce lo que **el esquema declara** como no-dato. `estado` y `publicarEn`
 * existen para publicar, no para describir el original: no salen de ninguna
 * medición, no viajan al HTML y no tienen contraparte en `src/lib`.
 *
 * ⚠ **Se reconoce por la DECLARACIÓN, nunca por el nombre.** Un
 * `SIN_MEDIR = ["estado", …]` aquí sería una lista a mano que borraría en
 * silencio un campo medido que se llamara igual — que es exactamente el
 * argumento que `esSintetico` ya escribió, aplicado a la otra mitad.
 */
export function esInfraestructura(campo) {
  return campo?.custom?.infraestructura === true;
}

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

/** Los campos MEDIDOS: sin los que Payload se inventa y sin los de infraestructura. */
export const camposPropios = (campos) =>
  (campos ?? []).filter((c) => !esSintetico(c) && !esInfraestructura(c));

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

/* ══════════════════════════════════════════════════════════════════════════
 * LAS DECLARACIONES DE LA VUELTA — CMS-0g, y por qué existen (2026-08-06)
 *
 * Hasta F2-3 la VUELTA (`aMedido`) sólo corría dentro del round-trip, o sea **en
 * el mismo proceso que la IDA**, y por eso podía apoyarse en tres mapas que la
 * ida iba llenando al pasar:
 *
 *   · `formaDeRel` — ¿el dato medido escribe esta relación como TÉRMINO
 *     EMBEBIDO (`{slug, nombre}`) o como slug pelado?
 *   · `CON_KIND`   — ¿los ítems de este `blocks` traen `kind` en el dato medido,
 *     o discriminan por qué clave está presente?
 *   · `centinelas` — ¿este `upload` usa `""` para decir «no hay imagen»?
 *
 * **Desde F2-3 la vuelta corre en el RENDER, y allí no hay ida.** Las tres son
 * propiedades del MODELO —no de una fila—, así que su sitio natural es la
 * config, que es lo que el render sí tiene. Se declaran con `custom` en el campo.
 *
 * ⚠ **Y una declaración sin guarda es la regla 3 —*documentado no es
 * conectado*— esperando a pasar.** Por eso `npm run qa:cms-decl` deriva los tres
 * mapas pasando la IDA sobre los 9 catálogos y los compara con lo declarado, en
 * LAS DOS DIRECCIONES: lo declarado que la ida nunca vio es **declaración
 * muerta**, y lo que la ida ve sin declarar es un **hueco** que el render
 * proyectaría mal. Las dos cierran el código de salida.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Recorre los campos de una colección y devuelve las declaraciones por RUTA DE
 * CAMPO, en el mismo vocabulario que usa el walker (`rutaLimpia`: sin índices).
 *
 * Es **la única lectura de `custom` que hay en el proyecto**: la usan el
 * contexto de lectura del render y la guarda que lo verifica. Dos lectores
 * distintos serían dos definiciones de «lo mismo» — la clase C7.
 */
export function declaracionesDe(campos, ruta = "", acc = null) {
  acc ??= { formaDeRel: new Map(), conKind: new Map(), centinelas: new Set() };
  for (const campo of camposPropios(campos)) {
    /* Presentacional sin nombre: sus hijos son hermanos del padre — exactamente
     * como en `aPayload`, y por la misma razón. */
    if (!campo?.name) {
      if (Array.isArray(campo?.fields)) declaracionesDe(campo.fields, ruta, acc);
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    if (campo.type === "relationship" && campo.custom?.formaMedida) acc.formaDeRel.set(aqui, campo.custom.formaMedida);
    if (campo.type === "upload" && campo.custom?.centinelaVacio) acc.centinelas.add(aqui);
    if (campo.type === "blocks" && campo.custom?.conKind)
      acc.conKind.set(aqui, new Set((campo.blocks ?? []).map((b) => b.slug)));
    if (Array.isArray(campo.fields)) declaracionesDe(campo.fields, aqui, acc);
    if (Array.isArray(campo.blocks)) for (const b of campo.blocks) declaracionesDe(b.fields, aqui, acc);
  }
  return acc;
}

/**
 * El CONTEXTO DE LECTURA — lo que `aMedido` necesita cuando **no hay ida**.
 *
 * Es la mitad de `creaContexto` (`scripts/seed/seed.mjs`) que no depende de
 * haber sembrado: en vez de los mapas que la ida llenó, se apoya en las
 * declaraciones de la config y en que el documento llegue **poblado**.
 *
 * @param {object} coleccionCfg la colección de la config resuelta
 * @param {(col: string, doc: object, donde: string) => object} proyectaDoc
 *        cómo se reconstruye un término EMBEBIDO. Se pasa desde fuera por la
 *        misma razón que en el seed: para que esto no dependa de la config.
 * @param {{slugPorId?: Map<string, unknown> | null, mediaPorId?: Map<unknown, Record<string, unknown>> | null}} [indices]
 *        los dos que la ida tiene por construcción, para las relaciones y la
 *        media que caen un nivel por debajo del `depth` con que se leyó.
 */
export function contextoDeLectura(coleccionCfg, proyectaDoc, { slugPorId = null, mediaPorId = null } = {}) {
  /**
   * ⚠ **La raíz es el SLUG DE LA COLECCIÓN, no la cadena vacía**, y esto costó
   * un verde falso que sólo destapó el negativo (2026-08-06).
   *
   * El seed camina con `aPayload(cfg.fields, fila, ctx, coleccion)`, así que las
   * rutas que registra son `entradas-blog.categorias`. Declarar desde raíz vacía
   * producía `categorias`, y entonces **ningún `get` casaba nunca**: la vuelta
   * devolvía el slug en vez del término, en silencio.
   *
   * Y lo peor no fue el fallo, sino su forma: el contexto de la ida fallaba el
   * mismo `get`, así que los dos lados coincidían **por equivocarse igual** y
   * `cms-lectura` daba 63/63. Un pleno que no medía nada (regla 4).
   */
  const decl = declaracionesDe(coleccionCfg.fields, coleccionCfg.slug);
  const limpia = (r) => String(r).replace(/\[\d+\]/g, "");

  return {
    /**
     * ⚠ **CMS-0g.** `rutaOrigen` es la ruta con la que la migración subió el
     * fichero; **vacía en las altas del admin**, que no tienen origen. Ahí la
     * única URL que puede funcionar es la de la API — el fichero nunca existió
     * bajo `/images/`.
     *
     * Y **tira** si el documento llega con el id pelado, en vez de devolver la
     * URL de la API: eso convertiría «no puedo reconstruirlo» en «esto es lo que
     * había», que es la regla 6. Se lee con `depth ≥ 1`, igual que `deRel`.
     */
    rutaDeMedia(bruto, donde) {
      /* Igual que en `deRel`: un nivel más abajo del que alcanza `depth`, esto
       * llega como id. Se resuelve con el índice —el mismo `porId` que la ida
       * tiene— y NUNCA se inventa la URL de la API a partir de un número. */
      let doc = bruto;
      if (doc === null || typeof doc !== "object") {
        doc = mediaPorId?.get(doc) ?? null;
        if (!doc)
          throw new Error(
            `MEDIA SIN POBLAR NI ÍNDICE: ${donde} llegó como id ${JSON.stringify(bruto)?.slice(0, 40)}\n` +
              `  y no hay \`mediaPorId\` que lo resuelva. Pásalo al contexto o sube el \`depth\`.\n` +
              `  Devolver /api/media/file/… a ciegas sería inventar una ruta donde lo que hay\n` +
              `  es una lectura mal hecha.`,
          );
      }
      if (typeof doc.rutaOrigen === "string" && doc.rutaOrigen) return doc.rutaOrigen;
      if (!doc.filename)
        throw new Error(`MEDIA SIN FILENAME NI rutaOrigen: ${donde}. El documento no identifica ningún fichero.`);
      return `/api/media/file/${doc.filename}`;
    },

    /**
     * Inversa de `ctx.rel`: id (o documento poblado) → slug, o término embebido.
     *
     * ⚠ **El id PELADO no es un caso raro: es lo que pasa un nivel más abajo.**
     * Con `depth: 1` un término embebido llega poblado, pero **su propia
     * relación queda a `depth: 2`** y vuelve como id. La ida no lo notaba porque
     * resolvía con su mapa `id → slug`; aquí hace falta el mismo mapa, leído de
     * la DB (`slugPorId`). Subir el `depth` sería la otra salida, y es peor: los
     * documentos de `sectores`/`monograficos` son enormes y el coste crece con
     * la profundidad, no con lo que se necesita — que es **un slug**.
     *
     * Y cuando no hay ni población ni mapa, **tira**: devolver el id o una
     * cadena plausible convertiría «no puedo reconstruirlo» en «esto es lo que
     * había» (`CLAUDE.md` §sondas, regla 6).
     */
    deRel(relationTo, valor, donde) {
      const destinos = Array.isArray(relationTo) ? relationTo : [relationTo];
      const col = valor?.relationTo ?? destinos[0];
      const bruto = valor?.value !== undefined ? valor.value : valor;
      const poblado = bruto !== null && typeof bruto === "object" ? bruto : null;
      const esObjeto = decl.formaDeRel.get(limpia(donde)) === "objeto";

      if (!poblado) {
        /* Forma OBJETO sin poblar: el término entero no sale de un id, y
         * reconstruirlo del catálogo medido sería comparar el dato consigo
         * mismo — la misma razón que da `seed.mjs` en su `deRel`. */
        if (esObjeto)
          throw new Error(
            `RELACIÓN EMBEBIDA SIN POBLAR: ${donde} se midió como término embebido y llegó\n` +
              `  con el id pelado. Léela con \`depth\` suficiente.`,
          );
        const s = slugPorId?.get(`${col}\0${bruto}`);
        if (s === undefined)
          throw new Error(
            `RELACIÓN SIN POBLAR NI ÍNDICE: ${donde} llegó como id ${JSON.stringify(bruto)} de '${col}'\n` +
              `  y no hay \`slugPorId\` que lo resuelva. Pásalo al contexto o sube el \`depth\`.`,
          );
        return s;
      }

      if (!esObjeto) {
        if (typeof poblado.slug !== "string")
          throw new Error(`RELACIÓN SIN SLUG: ${donde} apunta a un documento de '${col}' sin \`slug\`.`);
        return poblado.slug;
      }
      return proyectaDoc(col, poblado, donde);
    },

    /**
     * El `kind` vuelve **sólo donde el dato medido lo llevaba**, y eso lo dice
     * la declaración del campo `blocks`, no el slug: `claim` y `titular` nombran
     * bloques de DOS campos distintos y sólo uno trae `kind`.
     */
    conKind(ruta, slug, cuerpo) {
      return decl.conKind.get(limpia(ruta))?.has(slug) ? { kind: slug, ...cuerpo } : cuerpo;
    },

    /** Las rutas de `upload` donde el dato medido codifica «no hay» con `""`. */
    esCentinela(ruta) {
      return decl.centinelas.has(limpia(ruta));
    },

    declaraciones: decl,
  };
}
