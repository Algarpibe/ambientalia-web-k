/**
 * LOS CASOS LEGALES QUE EL RENDER NUNCA HA RENDERIZADO — la FAMILIA DE
 * CALIBRACIÓN aplicada al ESQUEMA en vez de a las páginas.
 *
 * Uso:  npm run qa:nunca-vistos     (SIN_CLON · sin build: config + catálogos)
 *       SABOTAJE=<caso> …           → `npm run qa:nunca-vistos-neg`
 *
 * ── De dónde sale, y por qué es una sonda y no una lista ──────────────────
 * §F2-5-ESCALON-ETIQUETAS costó una fase entera parada, y su causa cabe en una
 * frase: **el clon se calibró con 7 entradas de 149, y las 7 traían
 * etiquetas.** El campo admitía vacío en el esquema, el original lo ejerce 8
 * veces de 149, y el render **nunca lo había renderizado**. El primer editor lo
 * creó en su primer alta.
 *
 * Eso no es un fallo de `etiquetas`: es **una clase**, y la clase tiene un
 * generador nuevo —cada alta desde el admin— así que la pregunta hay que poder
 * repetirla:
 *
 *   > **Por cada caso que el esquema admite, ¿lo ejercita alguna fila
 *   > sembrada?** Cobertura CERO = un camino de render que no ha corrido nunca
 *   > y que un editor puede crear hoy.
 *
 * ── Qué cuenta como CASO, y por qué estos tres ────────────────────────────
 * Un «caso» es un par (ruta de campo · forma del valor) que el esquema permite:
 *
 *   · **ausente** — un campo sin `required` puede no estar. Es el más peligroso
 *     porque el tipo medido puede prometer que sí (el escalón, literal);
 *   · **vacía** — una lista (`array`/`blocks`/`hasMany`) con cero filas. En
 *     Payload es indistinguible de ausente (§LA LISTA VACÍA de `mapeo.mjs`),
 *     así que se cuenta aparte;
 *   · **cada opción de un `select`** y **cada valor de un `checkbox`** — un
 *     valor legal que ningún dato trae es una rama del render sin estrenar.
 *
 * ⚠ **Y lo que la sonda NO afirma, dicho antes de que nadie lo suponga: un
 * caso sin ejercitar NO es un defecto.** Es un hueco de cobertura. Puede estar
 * perfectamente soportado —y muchos lo están— o puede matar el build como mató
 * el de la 40.ª. **La salida es una lista con número, no un juicio**, y por eso
 * el código de salida NO depende de cuántos haya: depende de que la sonda haya
 * podido mirar.
 *
 * ── El alcance, declarado porque es la mitad del resultado ────────────────
 * La cobertura se mide sobre **el SEED** —los 9 catálogos de `src/lib`, 46
 * filas— porque es el dato con el que el render está calibrado. **No** sobre el
 * corpus de 309 capturas: el corpus es HTML del original, no tiene la forma del
 * esquema. O sea que este inventario dice *«el render no ha visto esto»*, no
 * *«el original no lo tiene»* — que es justo la distinción que el escalón
 * enseñó: `etiquetas` vacías **existen 8 veces en el original** y **cero en el
 * seed**.
 *
 * ── Las guardas ───────────────────────────────────────────────────────────
 * · **`Evaluadas` con mínimo DERIVADO** del nº de casos que la config admite:
 *   una colección nueva sube el listón sola;
 * · **cero casos ⇒ ERROR** (regla 4, el cero): un walker roto daría «0 sin
 *   ejercitar», que se lee como cobertura perfecta;
 * · **cero filas recorridas ⇒ ERROR** (regla 4bis): sin catálogos, TODOS los
 *   casos salen sin ejercitar y la lista sería verdadera y vacua;
 * · **cobertura del 100 % ⇒ ERROR**: si ningún caso queda sin ejercitar sobre
 *   46 filas, el detector está midiendo otra cosa. Es el PLENO, y aquí lo que
 *   discrimina es la ausencia.
 */
import { Evaluadas, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE ?? "";
const SABOTAJES = {
  "sin-catalogos": "no se recorre ninguna fila ⇒ todo sale sin ejercitar y la lista es vacua",
  "sin-casos": "el walker no reconoce ningún caso ⇒ «0 sin ejercitar» se leería como cobertura perfecta",
  "todo-ejercitado": "se marcan todos los casos como vistos ⇒ el PLENO, que tampoco puede salir verde",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

const { CATALOGOS, cargaCatalogos } = await import("../seed/catalogos.mjs");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const { camposPropios, esLista } = await import("../../packages/cms-config/src/mapeo.mjs");

const config = await construyeConfig();
const catalogos = await cargaCatalogos();

/* ── EL UNIVERSO: los casos que el esquema ADMITE ────────────────────────── */
/** clave = `${ruta}\0${forma}` · valor = { coleccion, ruta, forma, tipo, detalle } */
const universo = new Map();
const anota = (coleccion, ruta, forma, tipo, detalle = null) => {
  if (SABOTAJE === "sin-casos") return;
  universo.set(`${ruta}\0${forma}${detalle ? `\0${detalle}` : ""}`, { coleccion, ruta, forma, tipo, detalle });
};

function declara(coleccion, campos, ruta) {
  for (const campo of camposPropios(campos)) {
    if (!campo?.name) {
      if (Array.isArray(campo?.fields)) declara(coleccion, campo.fields, ruta);
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    /* Para una LISTA se apunta además QUÉ decide la vuelta con su caso vacío
     * (§7e del ESQUEMA). Es lo que convierte «43 casos sin ejercitar» en un
     * dato accionable: un caso sin ejercitar CON respuesta decidida y guardada
     * no es lo mismo que uno sin ella, y la lista sola no los distingue. */
    if (esLista(campo)) anota(coleccion, aqui, "vacía", campo.type, null, campo.custom?.vaciaEsAusente === true ? "ausente" : "[]");
    else if (!campo.required) anota(coleccion, aqui, "ausente", campo.type);
    if (campo.type === "select" && Array.isArray(campo.options))
      for (const o of campo.options) anota(coleccion, aqui, "valor", campo.type, typeof o === "string" ? o : o.value);
    if (campo.type === "checkbox") for (const v of ["true", "false"]) anota(coleccion, aqui, "valor", campo.type, v);
    if (Array.isArray(campo.fields)) declara(coleccion, campo.fields, aqui);
    if (Array.isArray(campo.blocks)) for (const b of campo.blocks) declara(coleccion, b.fields, aqui);
  }
}

for (const { coleccion } of CATALOGOS) {
  const cfg = config.collections.find((c) => c.slug === coleccion);
  if (!cfg) throw new Error(`COLECCIÓN AUSENTE en la config: '${coleccion}'`);
  declara(coleccion, cfg.fields, coleccion);
}

/* ── LO EJERCITADO: el mismo recorrido sobre las filas de verdad ─────────── */
const vistos = new Set();
const ve = (ruta, forma, detalle = null) => vistos.add(`${ruta}\0${forma}${detalle ? `\0${detalle}` : ""}`);
let filasRecorridas = 0;

function recorre(campos, doc, ruta) {
  for (const campo of camposPropios(campos)) {
    if (!campo?.name) {
      if (Array.isArray(campo?.fields)) recorre(campo.fields, doc, ruta);
      continue;
    }
    const aqui = ruta ? `${ruta}.${campo.name}` : campo.name;
    const v = doc?.[campo.name];
    const ausente = v === undefined || v === null;

    if (esLista(campo)) {
      if (ausente || (Array.isArray(v) && v.length === 0)) ve(aqui, "vacía");
    } else if (ausente && !campo.required) ve(aqui, "ausente");

    /* ⚠ **Una clave ausente NO significa que su valor no se renderice.** Si el
     * campo tiene `defaultValue`, el render recibe ese valor — y el dato medido
     * OMITE lo que coincide con su defecto (§conDefecto de `mapeo.mjs`), así
     * que el caso más común de todos llega por aquí y no por el valor
     * explícito. Sin esto la lista contaba como «nunca visto» exactamente el
     * valor que ven casi todas las filas: un sobre-casado del detector, que es
     * la tercera cara de §sondas 4 — un número plausible de más. */
    const valor = ausente ? campo.defaultValue : v;
    if (valor !== undefined && valor !== null) {
      if (campo.type === "select") ve(aqui, "valor", String(valor));
      if (campo.type === "checkbox") ve(aqui, "valor", String(Boolean(valor)));
    }

    if (ausente) continue;
    if (campo.type === "group") recorre(campo.fields ?? [], v, aqui);
    else if (campo.type === "array" && Array.isArray(v)) for (const item of v) recorre(campo.fields ?? [], item, aqui);
    else if (campo.type === "blocks" && Array.isArray(v))
      for (const item of v) {
        const b = (campo.blocks ?? []).find((x) => x.slug === (item?.kind ?? item?.blockType));
        if (b) recorre(b.fields, item, aqui);
      }
  }
}

if (SABOTAJE !== "sin-catalogos")
  for (const { coleccion } of CATALOGOS) {
    const cfg = config.collections.find((c) => c.slug === coleccion);
    for (const fila of catalogos.get(coleccion) ?? []) {
      recorre(cfg.fields, fila, coleccion);
      filasRecorridas++;
    }
  }
if (SABOTAJE === "todo-ejercitado") for (const k of universo.keys()) vistos.add(k);

/* ── EL REPARTO ──────────────────────────────────────────────────────────── */
const sinEjercitar = [...universo.entries()].filter(([k]) => !vistos.has(k)).map(([, v]) => v);
const ejercitados = universo.size - sinEjercitar.length;

/* ── LAS GUARDAS, cada una contra su forma de dar verde en falso ─────────── */
const problemas = [];
if (universo.size === 0)
  problemas.push("CERO CASOS DECLARADOS — el walker no reconoció ninguno; «0 sin ejercitar» sería cobertura perfecta de nada");
if (filasRecorridas === 0)
  problemas.push("CERO FILAS RECORRIDAS — sin catálogos TODO sale sin ejercitar, y la lista sería verdadera y vacua");
if (universo.size > 0 && sinEjercitar.length === 0)
  problemas.push(
    `PLENO — 0 de ${universo.size} casos sin ejercitar sobre ${filasRecorridas} filas. ` +
      `Lo que esta sonda discrimina es la AUSENCIA: cobertura total significa que no está mirando la ausencia`,
  );

/* ── INFORME ─────────────────────────────────────────────────────────────── */
const ev = new Evaluadas({ nombre: "casos-nunca-vistos", unidad: "casos que el esquema admite", minimo: Math.max(1, universo.size) });
ev.ok(universo.size);

console.log(`\n════════ CASOS LEGALES QUE EL RENDER NUNCA HA RENDERIZADO ════════`);
console.log(`  universo: ${universo.size} casos que el esquema admite · ejercitados por ${filasRecorridas} filas sembradas: ${ejercitados}`);
console.log(`  ⚠ alcance: la cobertura es del SEED (9 catálogos), no del original. El escalón vivía justo ahí.\n`);

const porForma = { ausente: [], vacía: [], valor: [] };
for (const c of sinEjercitar) porForma[c.forma].push(c);

for (const [forma, lista] of Object.entries(porForma)) {
  if (!lista.length) continue;
  console.log(`  ── ${forma.toUpperCase()} · ${lista.length} sin ejercitar ──`);
  const porCol = new Map();
  for (const c of lista) {
    if (!porCol.has(c.coleccion)) porCol.set(c.coleccion, []);
    porCol.get(c.coleccion).push(c);
  }
  /* Los `vacía` son LA FORMA DEL ESCALÓN —Payload no distingue vacío de
   * ausente, así que la vuelta tiene que elegir— y desde §7e todos tienen su
   * elección escrita y guardada. Decirlo aquí es lo que separa «sin ejercitar»
   * de «sin decidir», que no son lo mismo y la lista sola los confunde. */
  if (forma === "vacía") {
    const conAusente = lista.filter((c) => c.laVueltaDevuelve === "ausente").length;
    console.log(
      `     ⓘ es LA FORMA DEL ESCALÓN, y los ${lista.length} tienen respuesta DECIDIDA (ESQUEMA §7e):\n` +
        `       ${lista.length - conAusente} vuelven \`[]\` por defecto · ${conAusente} vuelven AUSENTE por declaración.\n` +
        `       Guardada en las dos direcciones por \`npm run qa:cms-decl\`. Sin ejercitar ≠ sin decidir.`,
    );
  }
  for (const [col, cs] of [...porCol].sort()) {
    console.log(`     ${col} (${cs.length})`);
    for (const c of cs.slice(0, 40))
      console.log(`       · ${c.ruta}${c.detalle ? ` = ${JSON.stringify(c.detalle)}` : ""}   [${c.tipo}]`);
    if (cs.length > 40) console.log(`       … y ${cs.length - 40} más`);
  }
  console.log("");
}

if (problemas.length) {
  console.error(`  ❌ ${problemas.length} problema(s) del instrumento:`);
  for (const p of problemas) console.error(`     · ${p}`);
}

console.log(
  `${problemas.length ? "❌" : "✅"} ${sinEjercitar.length} de ${universo.size} casos SIN EJERCITAR sobre ${filasRecorridas} filas.\n` +
    (problemas.length
      ? `   El inventario NO se puede citar: el instrumento no midió lo que dice.\n`
      : `   No es una lista de defectos: es la lista de caminos de render que no han\n` +
        `   corrido nunca y que el primer editor puede crear. El escalón de F2-5 era\n` +
        `   uno de ellos (\`entradas-blog.etiquetas\` vacía), y ya está cerrado.\n`),
);

w("medidas/casos-nunca-vistos.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿qué casos que el esquema ADMITE no ejercita ninguna fila sembrada?",
    alcance: `los ${CATALOGOS.length} catálogos de src/lib — ${filasRecorridas} filas. NO el corpus del original`,
    deDonde: "docs/PENDIENTES-QA.md §F2-5-ESCALON-ETIQUETAS · PASO 3",
    noEsUnJuicio: "un caso sin ejercitar no es un defecto: es un camino de render sin estrenar",
    sabotaje: SABOTAJE || null,
  },
  contrato: { universo: universo.size, filasRecorridas, ejercitados, minimo: ev.minimo, problemas },
  sinEjercitar: {
    total: sinEjercitar.length,
    porForma: Object.fromEntries(Object.entries(porForma).map(([k, v]) => [k, v.length])),
    casos: sinEjercitar.sort((a, b) => (a.coleccion + a.ruta).localeCompare(b.coleccion + b.ruta)),
  },
});

process.exit(ev.informe() || problemas.length ? 2 : 0);
