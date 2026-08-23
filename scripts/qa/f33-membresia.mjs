/**
 * F33-MEMBRESÍA — ¿las 31 que se sembraron son LAS MISMAS 31 que el extractor
 * produjo? Uso: npm run qa:f33-membresia   (SABOTAJE=cardinal | corpus-mudo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO BASTA `31 → 31`
 *
 * > **Un recuento igual no prueba que los conjuntos sean el mismo.** `31 → 31`
 * > es exacto, y los dos conjuntos de 31 pueden diferir en 2 por lado sin que
 * > el número se mueva un dígito.
 *
 * No es una hipótesis del repo: **ya pasó**. `qa:lh-poblacion` daba
 * `/blog 68 → 68` y lo destapó `cms:seed-listados` al sembrar POR SLUG — 2
 * entradas del corpus sin fila en la DB y 2 filas sin `recurso` fuera del
 * corpus, compensándose. El recuento no podía verlas **por construcción**.
 *
 * Lo que prueba la igualdad de dos conjuntos es **nombrar cada elemento**, así
 * que esto publica la **diferencia simétrica con sus DOS LADOS** —«N en el
 * extraído que la DB no tiene, M en la DB que el extraído no tiene»— y el
 * cardinal va al lado como resumen, **nunca como prueba**.
 *
 * ── Y la membresía no es sólo el SLUG ────────────────────────────────────
 * `paginas` es una colección **con prefijo**: dos documentos pueden compartir
 * `slug` y vivir en rutas distintas (`kunak-air` de raíz y el hub de KB). La
 * llave de membresía es por tanto **`prefijo + slug`**, no el slug suelto —
 * comparar por slug daría un empate que no lo es (§dos lecturas pueden dar el
 * mismo cardinal contando unidades distintas).
 *
 * ── Los TRES HUECOS DE GEOMETRÍA, comprobados DESPUÉS de la siembra ──────
 * El extractor ya exige 0 claves de geometría en lo que emite. Esto comprueba
 * lo que de verdad importa: que **la DB tampoco las tiene**. Son cosas
 * distintas — entre el extractor y la fila hay un mapeo, un `aPayload` y un
 * esquema con `defaultValue`, y cualquiera de los tres podría escribir un
 * número donde el modelo dice SIN PROBAR.
 *
 *   | hueco | qué pasa si se rellena |
 *   |---|---|
 *   | el 0 es el VALOR INICIAL, no «px absolutos» — **24 de 49 celdas** | 24 campos inventados de una vez |
 *   | «en el DOM» ≠ «con caja» — **36 módulos** en desplegables cerrados | ceros que `getComputedStyle` devuelve sin resolver nada |
 *   | `anchoPct` en BLOQUE ≠ en LÍNEA — **25 instancias** | una razón sobre un enlínea mide el TEXTO |
 *
 * ── Los sabotajes, y por qué son ÉSTOS ───────────────────────────────────
 *   · `cardinal` — compara por CARDINAL en vez de por elemento, sobre un par de
 *     conjuntos que difieren en 1 por lado. **Tiene que salir rojo**, y es la
 *     instancia separadora que prueba que esta sonda no es un recuento con
 *     otro nombre. Sin él, «diferencia simétrica 0 y 0» y «31 = 31» serían
 *     indistinguibles desde fuera;
 *   · `corpus-mudo` — vacía el lado del extraído. Un dominio encogido no puede
 *     salir en verde (§regla 22: el booleano de concordancia vale `true` sobre
 *     un dominio de uno igual que sobre uno de mil, así que el veredicto se
 *     cierra con el CARDINAL, no con el booleano).
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["cardinal", "corpus-mudo"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

/* ── el lado del EXTRAÍDO, de su congelada ───────────────────────────────── */
const EXTRAIDO = JSON.parse(readFileSync(join(QA, "medidas/f33-extraido.json"), "utf8"));
const llave = (d) => `${d.prefijo ?? ""}|${d.slug}`;
const delExtraido = new Map(
  (SABOTAJE === "corpus-mudo" ? [] : EXTRAIDO.catalogo.paginas).map((d) => [llave(d), d]),
);

/* ── el lado de la DB ────────────────────────────────────────────────────── */
const res = await payload.find({ collection: "paginas", limit: 500, depth: 0, pagination: false });
const deLaDb = new Map(res.docs.map((d) => [llave(d), d]));

/* El sabotaje `cardinal` mueve UN elemento por lado: los cardinales siguen
 * cuadrando y los conjuntos ya no son el mismo. Es exactamente la forma del
 * `68 → 68` que costó dos tandas descubrir. */
if (SABOTAJE === "cardinal") {
  const [k, v] = [...delExtraido.entries()][0];
  delExtraido.delete(k);
  delExtraido.set(`${k}-INVENTADO-POR-EL-SABOTAJE`, v);
}

const soloExtraido = [...delExtraido.keys()].filter((k) => !deLaDb.has(k)).sort();
const soloDb = [...deLaDb.keys()].filter((k) => !delExtraido.has(k)).sort();

/* ══════════════════════════════════════════════════════════════════════════
 * LOS TRES HUECOS DE GEOMETRÍA — sobre lo que la DB DEVUELVE
 * ═════════════════════════════════════════════════════════════════════════ */
const GEOMETRIA = new Set(["pt", "pb", "mt", "mb", "ritmo", "anchoPct"]);

/**
 * ⚠⚠ **`hayValor` es RECURSIVO, y su primera versión no lo era — §sondas 4,
 * tercera cara, cometida en esta misma sonda (2026-08-23).**
 *
 * Payload devuelve el grupo `ritmo` **poblado de nulos**:
 * `{mt:{valor:null,unidad:null,…}, mb:{…}, pb:{…}}`. Un predicado de UN solo
 * nivel ve que los valores de `ritmo` son **objetos** —no `null`— y lo cuenta
 * como escrito: la primera corrida dio **299 claves de geometría en la DB**,
 * un número perfectamente plausible que invitaba a explicarlo.
 *
 * No lo delató ningún error: lo delató **contradecir una medida buena
 * anterior** —`cms:extractor-f33` afirma `0 claves escritas` en lo que emite,
 * y entre lo emitido y la fila no hay nada que las invente—. Ése es el control
 * que este repo no siempre tiene, y cuando existe, cruzarlo es obligatorio
 * antes de creerse un recuento nuevo.
 *
 * **Un grupo lleno de nulos es «no escrito»**: es lo que Postgres devuelve para
 * columnas sin valor, y `medida()` dice que vacío = el default de Divi. Lo que
 * se persigue es un ESCALAR con valor en cualquier hondura.
 */
const hayValor = (x) => {
  if (x === null || x === undefined) return false;
  if (Array.isArray(x)) return x.some(hayValor);
  if (typeof x === "object") return Object.values(x).some(hayValor);
  return true;
};

const geoEnLaDb = [];
(function barre(v, ruta) {
  if (Array.isArray(v)) return v.forEach((x, i) => barre(x, `${ruta}[${i}]`));
  if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (GEOMETRIA.has(k) && hayValor(x)) geoEnLaDb.push(`${ruta}.${k} = ${JSON.stringify(x).slice(0, 60)}`);
      barre(x, `${ruta}.${k}`);
    }
})(res.docs, "paginas");

/**
 * El CONTROL de que `hayValor` no se ha vuelto ciego del otro lado (§sondas 4,
 * el cero): se le da un `ritmo` con un número dentro y tiene que verlo. Sin él,
 * arreglar el sobre-casado podría haber producido un predicado que **nunca**
 * dice que sí — y entonces «0 claves» sería el instrumento, no el dato.
 */
const CONTROL_GEO = [
  [{ mt: { valor: null, unidad: null }, mb: { valor: null, unidad: null } }, false, "grupo lleno de nulos"],
  [{ mt: { valor: 34.05, unidad: "px" }, mb: { valor: null, unidad: null } }, true, "un número en hondura 2"],
  [null, false, "null"],
  [0, true, "el escalar 0 — que es un valor escrito, no una ausencia"],
];

/* ══════════════════════════════════════════════════════════════════════════
 * EL ORIGEN DE IMAGEN, EN LA DB — D2 llegó o no llegó
 * ═════════════════════════════════════════════════════════════════════════ */
const imgs = [];
(function busca(v) {
  if (Array.isArray(v)) return v.forEach(busca);
  if (v && typeof v === "object") {
    if (v.blockType === "imagen-pagina") imgs.push(v);
    for (const x of Object.values(v)) busca(x);
  }
})(res.docs);
const conLocal = imgs.filter((m) => m.src !== null && m.src !== undefined).length;
const conExterno = imgs.filter((m) => typeof m.srcExterno === "string" && m.srcExterno !== "").length;

/* T11: el atributo NO puede haber llegado a la DB. */
const conTeams = JSON.stringify(res.docs).match(/data-teams/g)?.length ?? 0;
/* D3: `1_5` tiene que estar EJERCITADO en la DB, no sólo admitido por el enum. */
const anchos = {};
(function cuenta(v) {
  if (Array.isArray(v)) return v.forEach(cuenta);
  if (v && typeof v === "object") {
    if (typeof v.ancho === "string") anchos[v.ancho] = (anchos[v.ancho] || 0) + 1;
    for (const x of Object.values(v)) cuenta(x);
  }
})(res.docs);

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
const ev = new Evaluadas({ nombre: "f33-membresia", unidad: "documentos del extraído", minimo: EXTRAIDO.catalogo.paginas.length });

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

/* El contador va por DOCUMENTO DEL EXTRAÍDO, que es la unidad que el mínimo
 * declara. Se cuenta lo que de verdad se comparó, no lo que se leyó. */
for (const _ of delExtraido.keys()) ev.ok();

console.log(`\n════════ f33-membresia · los 31 del extraído contra las filas de \`paginas\` ════════\n`);
console.log(`  ── 1 · MEMBRESÍA, elemento a elemento (la llave es \`prefijo|slug\`) ──`);
console.log(`   documentos en el EXTRAÍDO           ${String(delExtraido.size).padStart(4)}`);
console.log(`   filas en la DB                      ${String(deLaDb.size).padStart(4)}`);
console.log(`   ⇢ en el extraído y NO en la DB      ${String(soloExtraido.length).padStart(4)}   ← tiene que ser 0`);
console.log(`   ⇠ en la DB y NO en el extraído      ${String(soloDb.length).padStart(4)}   ← tiene que ser 0`);
for (const k of soloExtraido.slice(0, 10)) console.log(`      ⇢ ${k}`);
for (const k of soloDb.slice(0, 10)) console.log(`      ⇠ ${k}`);
console.log(`   (el cardinal va al lado como RESUMEN, nunca como prueba: 31→31 es exacto`);
console.log(`    con 2 por lado compensándose)`);

console.log(`\n  ── 2 · LOS TRES HUECOS DE GEOMETRÍA, en lo que la DB DEVUELVE ──`);
console.log(`   claves de ritmo/ancho con VALOR     ${String(geoEnLaDb.length).padStart(4)}   ← tiene que ser 0`);
for (const g of geoEnLaDb.slice(0, 6)) console.log(`      ✗ ${g}`);
console.log(`   control de \`hayValor\` (sabe decir SÍ y sabe decir NO):`);
for (const [v, esperado, porQue] of CONTROL_GEO) {
  const dio = hayValor(v);
  if (dio !== esperado) err(`CONTROL de \`hayValor\`: "${porQue}" dio ${dio}, esperaba ${esperado} — el predicado no discrimina.`);
  console.log(`      ${dio === esperado ? "✓" : "✗"} ${String(dio).padEnd(5)} ${porQue}`);
}
console.log(`   SIN ESCRIBIR (24 de 49 celdas) · NO MEDIBLE (36 módulos en desplegables cerrados)`);
console.log(`   · no medido por el instrumento (25 instancias de \`anchoPct\`): los tres siguen`);
console.log(`   OMITIDOS, no convertidos en número.`);

console.log(`\n  ── 3 · LO QUE LAS TRES DECISIONES DE HOY DEJARON EN LA DB ──`);
console.log(`   D1 · \`data-teams\` en las filas      ${String(conTeams).padStart(4)}   ← tiene que ser 0 (T11)`);
console.log(`   D2 · \`imagen-pagina\` en la DB       ${String(imgs.length).padStart(4)}`);
console.log(`        · con \`src\` (asset LOCAL)      ${String(conLocal).padStart(4)}`);
console.log(`        · con \`srcExterno\` (FUERA)     ${String(conExterno).padStart(4)}   ← el canal nuevo, con su cardinal`);
console.log(`   D3 · reparto de \`ancho\`                  ${Object.entries(anchos).sort().map(([k, v]) => `${k}×${v}`).join(" · ")}`);

/* ── LAS GUARDAS ────────────────────────────────────────────────────────── */
if (soloExtraido.length || soloDb.length)
  err(
    `MEMBRESÍA: la diferencia simétrica NO es 0 y 0 — ${soloExtraido.length} en el extraído sin fila, ` +
      `${soloDb.length} filas sin documento.\n` +
      `   Un recuento igual no prueba que los conjuntos sean el mismo: lo prueba nombrarlos.`,
  );
if (geoEnLaDb.length)
  err(
    `GEOMETRÍA EN LA DB: ${geoEnLaDb.length} clave(s) con valor —\n   ${geoEnLaDb.slice(0, 5).join("\n   ")}\n` +
      `   El esquema las declara SIN PROBAR y \`medida()\` dice que vacío = el default de\n` +
      `   Divi. Un número ahí afirma que el editor lo tocó: es un CAMPO INVENTADO.`,
  );
if (conTeams) err(`T11 NO LLEGÓ: quedan ${conTeams} \`data-teams\` en las filas de \`paginas\`.`);
if (conLocal + conExterno !== imgs.length)
  err(`ORIGEN DE IMAGEN: ${conLocal}+${conExterno} ≠ ${imgs.length} — hay imágenes sin origen o con dos en la DB.`);
/* §regla 22: el veredicto se cierra con el CARDINAL, no con el booleano de
 * concordancia — que sale `true` igual sobre un dominio de uno. */
if (delExtraido.size < EXTRAIDO.catalogo.paginas.length)
  err(
    `DOMINIO ENCOGIDO: se comparan ${delExtraido.size} documentos y el extraído trae ` +
      `${EXTRAIDO.catalogo.paginas.length}. «Diferencia simétrica 0 y 0» sobre un dominio\n` +
      `   encogido es cierto y no dice nada (§regla 22).`,
  );

const SALIDA = SABOTAJE ? nombreNeg("medidas/f33-membresia.json", SABOTAJE) : "medidas/f33-membresia.json";
if (SABOTAJE) console.log(`\n  ⚠ SABOTAJE activo: la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.`);

w(SALIDA, {
  meta: {
    fecha: hoy(),
    sonda: "f33-membresia",
    pregunta: "¿las filas de `paginas` son LOS MISMOS documentos que produjo `cms:extractor-f33`?",
    fuente: "medidas/f33-extraido.json (canónica) + la colección `paginas` de la DB",
    llave: "`prefijo|slug` — `paginas` es una colección con prefijo, así que el slug suelto NO identifica",
    sabotaje: SABOTAJE,
    noCubre: [
      "el CONTENIDO de cada documento campo a campo: eso lo mide `qa:cms-roundtrip` (ida y vuelta)",
      "la GEOMETRÍA del clon contra el original: sigue en 0 ejes comparados (`qa:f33-cmp`)",
      "las rutas EMITIDAS: `paginas` todavía no tiene plantilla ni ruta (CMS-4/E1, otra tanda)",
    ],
  },
  membresia: {
    enElExtraido: delExtraido.size,
    enLaDb: deLaDb.size,
    soloEnElExtraido: soloExtraido,
    soloEnLaDb: soloDb,
    diferenciaSimetrica: soloExtraido.length + soloDb.length,
  },
  geometria: { clavesConValor: geoEnLaDb.length, detalle: geoEnLaDb.slice(0, 20) },
  decisiones: {
    d1: { dataTeamsEnLaDb: conTeams },
    d2: { imagenes: imgs.length, conSrcLocal: conLocal, conSrcExterno: conExterno },
    d3: { repartoDeAncho: anchos },
  },
});

console.log(
  `\n${rojo ? "❌" : "✅"} f33-membresia: diferencia simétrica ${soloExtraido.length} y ${soloDb.length} sobre ` +
    `${delExtraido.size} documentos · ${geoEnLaDb.length} claves de geometría en la DB · ${rojo} guarda(s) en rojo`,
);
process.exit(rojo ? 2 : 0);
