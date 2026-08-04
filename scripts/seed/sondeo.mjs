/**
 * SONDEO DE FRONTERA — recorre TODOS los catálogos sin escribir en la DB y
 * reporta **qué le falta a cada colección para poder sembrarse**.
 *
 * Existe porque el alcance del bloque 1 no se decide razonando: se mide. Un
 * corte elegido «porque parece que depende de» es una lista a mano, y este repo
 * ya sabe cómo acaban.
 *
 * Uso:  node --env-file=apps/cms/.env scripts/seed/sondeo.mjs
 *       SABOTAJE=slug|grupo|ciclo …          → tiene que salir con código ≠ 0
 *       npm run cms:sondeo-neg               → los tres sabotajes + el control
 *
 * ── ⚠ QUÉ PONE ESTA SONDA EN ROJO, Y QUÉ NO ───────────────────────────────
 * Es una sonda de **medición**, no una guarda de contenido, y por eso el código
 * de salida tiene un significado estrecho que hay que decir en voz alta:
 *
 * | | código |
 * |---|---|
 * | hay relaciones huérfanas, o campos `required` sin dato | **0** — eso es LA MEDIDA |
 * | el INSTRUMENTO no puede sostener esa medida | **≠ 0** |
 *
 * Si las huérfanas la pusieran roja, la sonda estaría siempre roja y su
 * veredicto no diría nada. Lo que la pone roja son sus **tres invariantes**, uno
 * por cada defecto de instrumento que la tanda del 2026-08-04 se cazó a sí
 * misma y que **daba números plausibles**:
 *
 * | # | invariante | el defecto que reportaba |
 * |---|---|---|
 * | 1 | **de todo valor de relación sale una llave** | `esSlug` no leía el `href` del teaser ⇒ «34 huérfanas, **1 slug distinto**», imposible |
 * | 2 | **toda ruta `required` del esquema se AUDITA**, tenga dato o no | no entraba en un grupo ausente ⇒ «campos required sin dato: **(ninguno)**» con el seed cayendo por `productos.seo.title` en la misma corrida |
 * | 3 | **el orden declarado es topológico sobre el grafo DERIVADO** | `CATALOGOS` daba por acíclico un grafo con ciclo ⇒ un `RELACIÓN SIN DESTINO` con pinta de orden mal puesto |
 *
 * Los tres tienen su sabotaje en `sondeo.neg.mjs`, **cada uno cayendo por el
 * suyo**, más un control. *Guarda probada en negativo o no hay guarda.*
 */
import { CATALOGOS, TAXONOMIAS_DERIVADAS, cargaCatalogos } from "./catalogos.mjs";
import { creaContexto, derivaTaxonomias, PREPARA, esSlug, RUTAS_EN_FRONTERA } from "./seed.mjs";
import { aPayload, camposPropios } from "./mapeo.mjs";
import { aristasDeConfig, verificaOrden, pintaCiclo, valoresDe } from "./grafo.mjs";
import { Evaluadas, hoy, w } from "../qa/lib.mjs";

/* Esta sonda no abre el clon: un `next build` concurrente no la afecta. */
process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !["slug", "grupo", "ciclo"].includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (slug | grupo | ciclo)`);

const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const config = await construyeConfig();

const catalogos = await cargaCatalogos();
const taxonomias = derivaTaxonomias(catalogos);

/**
 * El mínimo se **deriva**, no se escribe: una fila nueva en cualquier
 * `src/lib/*.ts` sube el listón sola. Es la diferencia entre `RUTAS.length` y
 * un número a mano que `lib.mjs` explica en `Evaluadas`.
 */
const FILAS = CATALOGOS.reduce((a, c) => a + catalogos.get(c.coleccion).length, 0);
const ev = new Evaluadas({ nombre: "sondeo", unidad: "filas de catálogo", minimo: FILAS });

let fallos = 0;
const grita = (t, cuerpo) => {
  fallos++;
  console.error(`\n❌ ${t}\n${cuerpo}`);
};

/* ══════════════════════════════════════════════════════════════════════════
 * INVARIANTE 3 · el orden declarado, contra el grafo DERIVADO de la config
 *
 * Va PRIMERO a propósito: si no hay orden posible, todo lo que la sonda mida
 * después está midiendo un recorrido que el seed no puede hacer.
 * ═════════════════════════════════════════════════════════════════════════ */

/* El seed escribe las taxonomías derivadas ANTES que los catálogos (§2c: el
 * término es su propia colección y las entradas lo referencian), así que ése es
 * el orden declarado completo, no sólo `CATALOGOS`. */
const ORDEN_DECLARADO = [...TAXONOMIAS_DERIVADAS.map((t) => t.coleccion), ...CATALOGOS.map((c) => c.coleccion)];

/**
 * ⚠ **El sabotaje `ciclo` NO inventa una arista: quita la PODA.** Reintroduce
 * el grafo real de la config —el que tiene el ciclo por `proyectos.posts`— y
 * con él el orden declarado deja de existir. Es exactamente el estado en el que
 * la tanda anterior creyó tener «el orden mal puesto».
 */
const podadas = SABOTAJE === "ciclo" ? [] : RUTAS_EN_FRONTERA;
if (SABOTAJE === "ciclo")
  console.log(`\n⚠ SABOTAJE=ciclo — sin poda de frontera. Esta corrida DEBE fallar.\n`);

const { aristas, muertas } = aristasDeConfig(config, { colecciones: ORDEN_DECLARADO, podadas });
const { ciclos, autos, violaciones, noDeclaradas } = verificaOrden(aristas, ORDEN_DECLARADO);

/**
 * ⚠ **Hallazgo de la primera corrida del instrumento nuevo, y NO es el defecto
 * 3: `categorias-recursos.padre` apunta a su propia colección.** Es la taxonomía
 * jerárquica del §2c (2 padres + 8 hijas), y su arista pide un orden **de
 * filas** —padres antes que hijos—, no de colecciones. Mezclarla con los ciclos
 * habría dicho «no existe orden posible» de algo que sí lo tiene.
 *
 * Y si es un problema **hoy** no lo decide el esquema, lo decide el DATO: se
 * mira si alguna fila la usa de verdad. Inerte en el dato ⇒ no impone nada;
 * usada ⇒ el seed tiene que ordenar las filas y hoy no lo hace, así que ROJO.
 */
const autosMedidos = autos.map((a) => {
  const filas = taxonomias.get(a.coleccion) ?? catalogos.get(a.coleccion) ?? [];
  const usada = filas.filter((f) => a.rutas.some((r) => valoresDe(f, r).length)).length;
  return { ...a, filas: filas.length, usada };
});
for (const a of autosMedidos) {
  if (a.usada)
    grita(
      `AUTO-RELACIÓN USADA EN EL DATO — ${a.coleccion}.${a.rutas.join("/")} en ${a.usada} de ${a.filas} filas`,
      `     El seed inserta las filas en el orden del catálogo, así que un hijo\n` +
        `     puede llegar antes que su padre. Ordena las filas (padres primero) o\n` +
        `     siembra la relación en una segunda pasada.`,
    );
  else
    console.log(
      `  · auto-relación ${a.coleccion}.${a.rutas.join("/")}: INERTE en el dato (0 de ${a.filas} filas)` +
        ` — pide orden de FILAS, no de colecciones`,
    );
}

if (muertas.length && SABOTAJE !== "ciclo")
  grita(
    `PODA MUERTA — ${muertas.length} ruta(s) de \`RUTAS_EN_FRONTERA\` no casan con ningún campo`,
    muertas.map((m) => `     · ${m}`).join("\n") +
      `\n   Una poda que no poda nada deja una arista viva sin que nadie se entere,\n` +
      `   y la declaración se pudre tapando lo que venga después.`,
  );
if (ciclos.length)
  grita(
    `CICLO EN EL GRAFO DE DEPENDENCIAS — NO EXISTE NINGÚN ORDEN`,
    ciclos.map((c) => `     · ${pintaCiclo(c)}`).join("\n") +
      `\n   Reordenar \`CATALOGOS\` no arregla esto: mueve el fallo de sitio. Hacen\n` +
      `   falta DOS PASADAS (documentos primero, relaciones después) o podar la\n` +
      `   arista que lo cierra. Es el defecto de instrumento nº 3 del 2026-08-04.`,
  );
if (violaciones.length)
  grita(
    `ORDEN DECLARADO NO TOPOLÓGICO — ${violaciones.length} arista(s) al revés`,
    violaciones
      .map((v) => `     · ${v.origen} (#${v.posOrigen}) → ${v.destino} (#${v.posDestino})   por ${v.rutas.join(", ")}`)
      .join("\n"),
  );
if (noDeclaradas.length)
  grita(`COLECCIÓN FUERA DEL ORDEN DECLARADO`, noDeclaradas.map((c) => `     · ${c}`).join("\n"));

const aristasPlanas = [];
for (const [origen, destinos] of aristas)
  for (const [destino, rutas] of destinos) aristasPlanas.push({ origen, destino, rutas });

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO — relaciones sin destino, por colección de origen
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * El sabotaje `slug` devuelve el lector de llaves a su estado defectuoso: **sin
 * leer el `href`**. `CaseStudy` y `BlogPost` (§2c.1, proyecciones) no llevan
 * `slug`, así que los 31 teasers dejan de tener llave.
 */
const llave = SABOTAJE === "slug" ? (v) => (typeof v === "string" ? esSlug(v) : v?.slug ?? v?.id) : esSlug;
if (SABOTAJE === "slug")
  console.log(`\n⚠ SABOTAJE=slug — el lector de llaves no mira el \`href\`. Esta corrida DEBE fallar.\n`);

/* Un payload de mentira: el sondeo no escribe. `media` devuelve un id falso
 * porque aquí la pregunta es de RELACIONES, no de ficheros. */
const falso = { create: async () => ({ id: 0 }) };
const ctx = creaContexto(falso, { sondeo: true, llave });
ctx.media = async () => 0;

/* Se registran TODOS los slugs de TODAS las colecciones primero: así lo que
 * quede huérfano es «no existe en `src/lib`», no «aún no lo he insertado». */
for (const [col, filas] of taxonomias) for (const f of filas) ctx.registra(col, f.slug, 1);
for (const c of CATALOGOS)
  for (const f of catalogos.get(c.coleccion))
    ctx.registra(c.coleccion, (PREPARA[c.coleccion] ? PREPARA[c.coleccion](f) : f).slug, 1);

const porColeccion = new Map();
const erroresDeMapeo = [];
for (const c of CATALOGOS) {
  const cfg = config.collections.find((x) => x.slug === c.coleccion);
  const antes = ctx.huerfanas.length;
  for (const fila of catalogos.get(c.coleccion)) {
    const prep = (PREPARA[c.coleccion] ?? ((x) => x))(fila);
    try {
      await aPayload(cfg.fields, prep, ctx, c.coleccion);
      ev.ok();
    } catch (e) {
      /* Regla 1 — un canal de verdad: lo que se imprime se CUENTA. Un `catch`
       * que sólo escribe en pantalla es cómo `mono-cmp` sacó `✅ 0·0·0` con tres
       * secciones descuadradas delante. */
      const msg = String(e.message).split("\n")[0];
      erroresDeMapeo.push({ coleccion: c.coleccion, slug: prep.slug, error: msg });
      ev.fallo(`${c.coleccion}/${prep.slug}`, msg);
      console.log(`  ⚠ ${c.coleccion}: ${msg}`);
    }
  }
  porColeccion.set(c.coleccion, ctx.huerfanas.length - antes);
}

if (erroresDeMapeo.length)
  grita(
    `${erroresDeMapeo.length} FILA(S) QUE NI SIQUIERA SE PUDIERON MAPEAR`,
    erroresDeMapeo.slice(0, 8).map((e) => `     · ${e.coleccion}/${e.slug}: ${e.error}`).join("\n") +
      `\n   Una fila que no se mapea no ha sido medida: su ausencia del recuento de\n` +
      `   huérfanas es un cero de «no miré», no de «no hay».`,
  );

/* ── INVARIANTE 1 · de todo valor de relación sale una llave ──────────────── */
if (ctx.sinLlave.length)
  grita(
    `${ctx.sinLlave.length} VALOR(ES) DE RELACIÓN SIN LLAVE DERIVABLE`,
    [...new Set(ctx.sinLlave.map((s) => `     · ${s.donde}  ←  ${s.valor}`))].slice(0, 8).join("\n") +
      `\n   Esto NO son relaciones huérfanas: son valores que el lector de llaves no\n` +
      `   sabe leer. Los dos dan \`undefined\` y confundirlos produjo «34 huérfanas,\n` +
      `   1 slug distinto» — un número plausible y aritméticamente imposible.`,
  );

console.log(`\n════════ SONDEO DE FRONTERA ════════`);
console.log(`  relaciones sin destino, por colección de ORIGEN:\n`);
for (const [col, n] of porColeccion)
  console.log(`   ${n === 0 ? "✓" : "✗"} ${col.padEnd(24)} ${String(n).padStart(4)}`);

const porDestino = {};
for (const h of ctx.huerfanas) {
  const k = `${h.donde.split(/[.[]/)[0]} → ${h.destinos.join("|")}`;
  (porDestino[k] ??= new Set()).add(h.slug);
}
console.log(`\n  detalle (origen → destino : nº de slugs distintos que faltan):`);
for (const [k, v] of Object.entries(porDestino)) console.log(`   ${k.padEnd(46)} ${v.size}`);

/* ══════════════════════════════════════════════════════════════════════════
 * INVARIANTE 2 · campos REQUIRED de Payload sin dato medido
 *
 * Es el espejo de `qa:cms-campos` —que va de lo medido a Payload— y ve lo que
 * aquélla no puede ver por construcción: un campo que Payload EXIGE y que el
 * catálogo del clon no trae. Sin esto, el hueco sólo aparece como un 400 a
 * mitad del seed, que es un sitio pésimo para enterarse.
 *
 * ⚠ **Y la guarda que lo hace creíble no es el recuento, es la COBERTURA.** La
 * primera versión pedía `&& v` para entrar en un grupo, así que un `required`
 * dentro de un grupo AUSENTE no se auditaba nunca — y «no lo miré» salía
 * impreso como «(ninguno)». Ahora las rutas `required` del esquema se derivan
 * **de la config** y se comprueba que **todas** fueron visitadas: una ruta del
 * esquema que la auditoría no toca es un defecto de la sonda, no un cero.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Rutas `required` alcanzables por GRUPOS, derivadas de la config. */
function requeridosDeConfig(campos, ruta = "", fuera = []) {
  for (const c of camposPropios(campos)) {
    if (!c?.name) {
      if (Array.isArray(c?.fields)) requeridosDeConfig(c.fields, ruta, fuera);
      continue;
    }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    if (c.required) fuera.push(aqui);
    if (c.type === "group") requeridosDeConfig(c.fields, aqui, fuera);
  }
  return fuera;
}

const requeridosSinDato = [];
const visitadas = new Set();

/**
 * @param {boolean} entraEnAusentes  el sabotaje `grupo` lo pone a `false`, que
 *   es el defecto original: pedir `&& v` para descender.
 */
function exige(campos, dato, col, ruta = "", entraEnAusentes = true) {
  for (const c of camposPropios(campos)) {
    if (!c?.name) { if (Array.isArray(c?.fields)) exige(c.fields, dato, col, ruta, entraEnAusentes); continue; }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    const v = dato?.[c.name];
    if (c.required) {
      visitadas.add(`${col}·${aqui}`);
      if (v === undefined || v === null) { requeridosSinDato.push({ col, ruta: aqui }); continue; }
    }
    if (c.type === "group") {
      if (v === undefined || v === null) { if (entraEnAusentes) exige(c.fields, {}, col, aqui, entraEnAusentes); }
      else exige(c.fields, v, col, aqui, entraEnAusentes);
    }
    /* Arrays y blocks: cobertura EXTRA, dependiente del dato. No entran en el
     * conjunto mínimo —sin ítems no hay nada que auditar y eso es legítimo—
     * pero auditarlos cuando hay ítems es gratis y caza un `required` de hoja.
     * El alcance se declara en la salida; una cobertura no declarada absorbe
     * justo lo que no se midió. */
    if (c.type === "array" && Array.isArray(v)) {
      /**
       * ⚠ **El envoltorio de un array de UN campo es TRANSPARENTE en el dato
       * medido** (`bullets: string[]`, no `[{texto}]`), y `aPayload` ya lo
       * sabe. La primera versión de esta cobertura extra no, así que leía
       * `"R² >0,8"["texto"]` como ausente y sacó **45 `bullets[].texto`
       * required sin dato** en productos, más 110 más repartidas.
       *
       * Números plausibles, y ninguno existía: es la tercera cara de la regla
       * 4 —*un detector que encuentra MÁS de lo que hay tampoco da error*—
       * cometida dentro de la guarda que se acaba de escribir para cerrar la
       * segunda. La regla tiene que ser **la misma** que la de la ida, y por
       * eso se escribe una vez y se cita, no se reinventa aquí.
       */
      const propios = camposPropios(c.fields);
      const transparente = propios.length === 1 && v.some((x) => x === null || typeof x !== "object");
      for (const item of v)
        exige(c.fields, transparente ? { [propios[0].name]: item } : item, col, `${aqui}[]`, entraEnAusentes);
    }
    if (c.type === "blocks" && Array.isArray(v))
      for (const item of v) {
        const b = c.blocks?.find((x) => x.slug === item?.blockType || x.slug === item?.kind);
        if (b) exige(b.fields, item, col, `${aqui}[${b.slug}]`, entraEnAusentes);
      }
  }
}

if (SABOTAJE === "grupo")
  console.log(`\n⚠ SABOTAJE=grupo — la auditoría no entra en grupos ausentes. Esta corrida DEBE fallar.\n`);

const esperadas = new Set();
for (const c of CATALOGOS) {
  const cfg = config.collections.find((x) => x.slug === c.coleccion);
  for (const r of requeridosDeConfig(cfg.fields)) esperadas.add(`${c.coleccion}·${r}`);
  for (const fila of catalogos.get(c.coleccion))
    exige(cfg.fields, (PREPARA[c.coleccion] ?? ((x) => x))(fila), c.coleccion, "", SABOTAJE !== "grupo");
}

const sinAuditar = [...esperadas].filter((e) => !visitadas.has(e)).sort();
if (sinAuditar.length)
  grita(
    `${sinAuditar.length} RUTA(S) \`required\` DEL ESQUEMA SIN AUDITAR`,
    sinAuditar.slice(0, 12).map((r) => `     · ${r}`).join("\n") +
      `\n   Que no salgan en el informe NO es «tienen dato»: es que nadie las miró.\n` +
      `   Las dos cosas dan la misma salida, y ésa fue exactamente la que dijo\n` +
      `   «campos required sin dato: (ninguno)» con el seed cayendo por uno de ellas.`,
  );

/* ══════════════════════════════════════════════════════════════════════════
 * TERCERA PREGUNTA · campos cuyo `validate` RECHAZA el dato medido
 *
 * La frontera 3 del bloque 1 —*«4 de 7 cuerpos traen `<script>`»*— se contó **a
 * mano**, y la regla 9 dice qué vale eso: un número recordado y un número
 * derivado se escriben igual y no valen lo mismo. Aquí se deriva: se corre el
 * `validate` de cada campo contra su dato, que es exactamente lo que hará el
 * alta, así que la sonda mide **lo que va a pasar** y no lo que uno cree.
 *
 * ⚠ Un `validate` que **revienta** no es un rechazo: es que esta sonda no sabe
 * invocarlo (Payload le pasa un contexto que aquí no existe). Se cuenta aparte
 * y se declara — meterlo con los rechazos inflaría el número, que es la tercera
 * cara de la regla 4.
 * ═════════════════════════════════════════════════════════════════════════ */
const rechazos = [];
let validatesNoEvaluables = 0;

function valida(campos, dato, col, ruta = "") {
  for (const c of camposPropios(campos)) {
    if (!c?.name) { if (Array.isArray(c.fields)) valida(c.fields, dato, col, ruta); continue; }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    const v = dato?.[c.name];
    if (v === undefined || v === null) continue;
    if (typeof c.validate === "function") {
      try {
        const r = c.validate(v, { data: dato, siblingData: dato, req: {}, operation: "create" });
        if (typeof r === "string") rechazos.push({ col, ruta: aqui, motivo: r, slug: dato?.slug });
      } catch { validatesNoEvaluables++; }
    }
    if (c.type === "group") valida(c.fields, v, col, aqui);
    if (c.type === "array" && Array.isArray(v)) {
      const propios = camposPropios(c.fields);
      const transparente = propios.length === 1 && v.some((x) => x === null || typeof x !== "object");
      for (const item of v) valida(c.fields, transparente ? { [propios[0].name]: item } : item, col, `${aqui}[]`);
    }
    if (c.type === "blocks" && Array.isArray(v))
      for (const item of v) {
        const b = c.blocks?.find((x) => x.slug === item?.blockType || x.slug === item?.kind);
        if (b) valida(b.fields, item, col, `${aqui}[${b.slug}]`);
      }
  }
}

for (const c of CATALOGOS) {
  const cfg = config.collections.find((x) => x.slug === c.coleccion);
  for (const fila of catalogos.get(c.coleccion)) {
    const prep = (PREPARA[c.coleccion] ?? ((x) => x))(fila);
    valida(cfg.fields, prep, c.coleccion);
  }
}

const rechazosPorColeccion = {};
for (const r of rechazos) {
  const k = `${r.col} · ${r.ruta}`;
  (rechazosPorColeccion[k] ??= new Set()).add(r.slug ?? "(sin slug)");
}
console.log(
  `\n  campos cuyo \`validate\` RECHAZA el dato medido` +
    ` (${rechazos.length} rechazo(s)` +
    (validatesNoEvaluables ? `; ${validatesNoEvaluables} validate(s) no evaluables fuera de Payload` : "") +
    `):`,
);
if (!rechazos.length) console.log("   (ninguno)");
for (const [k, v] of Object.entries(rechazosPorColeccion))
  console.log(`   ✗ ${k.padEnd(44)} en ${v.size} documento(s): ${[...v].join(", ").slice(0, 70)}`);

const cubiertas = [...esperadas].filter((e) => visitadas.has(e));
const agrup = {};
for (const r of requeridosSinDato) (agrup[`${r.col} · ${r.ruta}`] ??= 0), agrup[`${r.col} · ${r.ruta}`]++;
console.log(
  `\n  campos REQUIRED de Payload sin dato en el catálogo medido` +
    `  (${cubiertas.length}/${esperadas.size} rutas del esquema` +
    ` + ${visitadas.size - cubiertas.length} extra de arrays y blocks):`,
);
if (!Object.keys(agrup).length) console.log("   (ninguno)");
for (const [k, n] of Object.entries(agrup)) console.log(`   ✗ ${k.padEnd(44)} en ${n} instancia(s)`);

/* ══════════════════════════════════════════════════════════════════════════
 * CONGELAR — regla 2: una conclusión citada en un doc tiene que tener su
 * fichero. Los tres informes del bloque 1 salieron de aquí y la única copia
 * era la consola de quien la corrió.
 * ═════════════════════════════════════════════════════════════════════════ */
const informe = {
  meta: {
    fecha: hoy(),
    sabotaje: SABOTAJE,
    filas: FILAS,
    alcance:
      "los 9 catálogos de CATALOGOS contra la config RESUELTA, sin escribir en la DB. " +
      "Las taxonomías derivadas entran como destino de relación, no como origen.",
  },
  grafo: {
    podadas,
    orden: ORDEN_DECLARADO,
    aristas: aristasPlanas,
    ciclos: ciclos.map(pintaCiclo),
    autoRelaciones: autosMedidos,
    violaciones,
  },
  huerfanas: {
    porColeccion: Object.fromEntries(porColeccion),
    porDestino: Object.fromEntries(Object.entries(porDestino).map(([k, v]) => [k, [...v].sort()])),
    total: ctx.huerfanas.length,
  },
  required: {
    delEsquema: esperadas.size,
    cubiertas: cubiertas.length,
    extra: visitadas.size - cubiertas.length,
    sinAuditar,
    sinDato: agrup,
  },
  validate: {
    rechazos,
    porRuta: Object.fromEntries(Object.entries(rechazosPorColeccion).map(([k, v]) => [k, [...v].sort()])),
    noEvaluables: validatesNoEvaluables,
  },
  instrumento: { sinLlave: ctx.sinLlave, erroresDeMapeo, podasMuertas: muertas },
};
w(SABOTAJE ? `medidas/sondeo-neg-${SABOTAJE}.json` : "medidas/sondeo-frontera.json", informe);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} sondeo: ${fallos} defecto(s) de INSTRUMENTO.` +
    (fallos === 0
      ? `  El grafo es acíclico, el orden es topológico, toda relación tiene llave\n` +
        `   y las ${esperadas.size} rutas \`required\` del esquema se auditaron.\n` +
        `   Las huérfanas y los required sin dato de arriba SON LA MEDIDA, no un fallo.\n`
      : `\n   La medida de arriba NO se puede citar: el instrumento que la produjo falla.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
