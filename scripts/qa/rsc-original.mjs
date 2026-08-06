/**
 * ¿EL ORIGINAL EMITE CARGA RSC? — el hecho que decide qué nivel de `html-cmp`
 * puede ser PUERTA de fidelidad y cuál no puede serlo NUNCA.
 *
 * Uso:  node rsc-original.mjs
 * Test en negativo:  npm run qa:rsc-original-neg
 *
 * ── Por qué existe una sonda para una obviedad ────────────────────────────
 * El contrato del §F2-3-RSC-ORDEN descansa sobre una frase: *«el original no
 * emite payload RSC, así que el nivel `filas` es clon-contra-clon POR
 * CONSTRUCCIÓN»*. Esa frase decide que un nivel de la sonda insignia de F2-3
 * **deje de cerrar el código de salida**, o sea que decide qué cuenta como
 * defecto en las cuatro familias que quedan.
 *
 * `CLAUDE.md` §sondas 9: *un recuento —o una AUSENCIA— afirmados de memoria se
 * barren antes de usarse*, y **los hechos negativos son los peores**, porque
 * «no hay» parece que no cuesta comprobarlo. Aquí no cuesta: son cuatro
 * `fetch`. Lo que costaría es que la frase fuera falsa —que Divi hubiera metido
 * un `<script>` con ese nombre, o que el original hubiera migrado— y que cuatro
 * familias se hubieran migrado con una puerta apagada por una premisa inventada.
 *
 * ── El CONTROL, que es lo que separa esto de «no encontrar nada» ───────────
 * Un `fetch` que devuelve una página de error, un 404 o una redirección a
 * cookies **también** sale «sin `__next_f`». O sea: *no encontrar nada y no
 * mirar nada dan la misma salida* (`CLAUDE.md` §sondas 4). Por eso cada página
 * tiene que traer **un marcador POSITIVO del original**: `et_pb_` —el prefijo de
 * clase de Divi—, que sólo aparece si lo que llegó es la página real. Sin ese
 * marcador la unidad **no se cuenta como evaluada**: se cuenta como fallo.
 *
 * ── Y el ALCANCE se declara, porque es una propiedad de LO MEDIDO ──────────
 * Cuatro páginas de cuatro arquetipos (HOME · PRODUCTO · SECTOR · DOCUMENTO
 * CIENTÍFICO, éste último el de la ruta con el residuo). No es «el sitio»: es
 * la muestra, y va en la congelada con su fecha. Si mañana hiciera falta
 * afirmarlo de otra familia, se añade su URL aquí.
 */
import { Evaluadas, env, hoy, w } from "./lib.mjs";

/**
 * ⚠ **DOS GANCHOS DE TEST, declarados y ANUNCIADOS.** El negativo necesita
 * poder apuntar la sonda a otro sitio —al **clon**, que es el contraejemplo
 * natural: emite `__next_f` y también `et_pb_`— y a otras rutas. Un gancho
 * invisible es un gancho que puede fabricar un verde sin dejar rastro, así que
 * los dos se anuncian en la salida Y viajan en la congelada.
 */
const ORIGEN = env("ORIGEN", "https://kunakair.com");

/** Cuatro arquetipos, no cuatro páginas cualesquiera. */
const PORDEFECTO = [
  { arquetipo: "HOME", url: "/es/" },
  { arquetipo: "PRODUCTO", url: "/es/monitor-calidad-aire/" },
  { arquetipo: "SECTOR", url: "/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/" },
  {
    arquetipo: "DOC. CIENTÍFICO",
    url: "/es/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023/",
  },
];

/* Sin `envRutas`: normaliza la barra final y aquí la URL va literal. */
const crudas = env("URLS", null);
const PAGINAS = crudas
  ? crudas.split(",").map((s, i) => ({ arquetipo: `NEG-${i + 1}`, url: s.trim() })).filter((p) => p.url)
  : PORDEFECTO;
if (ORIGEN !== "https://kunakair.com") console.log(`⚠ ORIGEN=${ORIGEN} por entorno — NO es el original`);
if (crudas) console.log(`⚠ URLS por entorno — no son las ${PORDEFECTO.length} del alcance declarado`);
if (env("MARCA", null)) console.log(`⚠ MARCA="${env("MARCA")}" por entorno — no es el marcador de control del original`);
if (!PAGINAS.length) {
  console.error("URLS quedó vacía: acotar a nada no es acotar, es no medir.");
  process.exit(2);
}
/* La guarda de contaminación de `w()` vigila que el CLON no se reconstruya a
 * mitad. Midiendo el original eso es un falso positivo declarado (ver su
 * cabecera en `lib.mjs`) — pero **sólo** cuando el origen es el original: el
 * negativo apunta esta misma sonda al clon, y entonces la guarda sí aplica. */
if (ORIGEN === "https://kunakair.com") process.env.SIN_CLON = "1";

/** Lo que se busca: la marca del serializador de React Server Components. */
const MARCA_RSC = "__next_f";
/**
 * El control positivo: sin esto, «no hay RSC» no significa nada.
 *
 * ⚠ **Es el TERCER gancho declarado, y el negativo lo necesita por un hallazgo
 * suyo.** La primera versión daba por hecho que el clon emite `et_pb_` «porque
 * replica las clases de Divi». **Falso, y derivado**: los 70 `et_pb_` de
 * `apps/web/src` están **todos en comentarios** —`grep -rn`— y no llegan al
 * HTML servido. O sea que el marcador de «esto es la página» es distinto en cada
 * lado, y el negativo tiene que poder decir cuál usa. Lo cazó el negativo
 * saliendo rojo por el invariante equivocado: `SIN CONTROL` en vez de `EMITE`.
 */
const MARCA_ORIGINAL = env("MARCA", "et_pb_");

const ev = new Evaluadas({
  nombre: "rsc-original",
  unidad: "páginas del original",
  minimo: PAGINAS.length,
});

const todo = {
  meta: {
    fecha: hoy(),
    origen: ORIGEN,
    porEntorno: {
      origen: env("ORIGEN", null) !== null,
      urls: crudas !== null,
      marca: env("MARCA", null) !== null,
    },
    marcaRsc: MARCA_RSC,
    marcaOriginal: MARCA_ORIGINAL,
  },
  paginas: {},
};

console.log(`\n════════ ¿EL ORIGINAL EMITE CARGA RSC? · ${PAGINAS.length} arquetipos · ${ORIGEN} ════════\n`);

let conRsc = 0;
let sinControl = 0;

for (const { arquetipo, url } of PAGINAS) {
  try {
    const res = await fetch(ORIGEN + url, { redirect: "follow" });
    const html = await res.text();
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const rsc = html.includes(MARCA_RSC);
    const control = html.includes(MARCA_ORIGINAL);
    todo.paginas[url] = { arquetipo, bytes: Buffer.byteLength(html), rsc, control };

    if (!control) {
      /* Regla 6: la ausencia se RECHAZA, no se sustituye. Contar esta página
       * como «sin RSC» sería exactamente convertir «no miré» en «está bien». */
      sinControl++;
      ev.fallo(url, `sin '${MARCA_ORIGINAL}' — lo que llegó no es la página del original`);
      console.log(`  ❌ ${arquetipo.padEnd(16)} SIN CONTROL — no hay '${MARCA_ORIGINAL}' en ${res.status} · ${url}`);
      continue;
    }
    ev.ok();
    if (rsc) {
      conRsc++;
      console.log(`  ❌ ${arquetipo.padEnd(16)} EMITE '${MARCA_RSC}' · ${url}`);
    } else {
      console.log(`  ✓  ${arquetipo.padEnd(16)} sin '${MARCA_RSC}' · con '${MARCA_ORIGINAL}' · ${todo.paginas[url].bytes} bytes`);
    }
  } catch (e) {
    todo.paginas[url] = { arquetipo, error: String(e).slice(0, 200) };
    ev.fallo(url, e);
    console.log(`  ⚠ ${arquetipo.padEnd(16)} ${String(e).slice(0, 100)}`);
  }
}

todo.meta.conRsc = conRsc;
todo.meta.sinControl = sinControl;
w(env("SALIDA") || "medidas/rsc-original.json", todo);

const fallos = ev.informe();
const mal = conRsc > 0 || sinControl > 0 || fallos > 0;
console.log(
  `\n${mal ? "❌" : "✅"} ${PAGINAS.length - sinControl} páginas con control · ` +
    `${conRsc} emiten '${MARCA_RSC}'\n` +
    (mal
      ? `   La premisa del §F2-3-RSC-ORDEN NO se sostiene con esto: revísala antes de\n` +
        `   apoyar en ella ninguna decisión de instrumento.\n`
      : `   El original NO emite carga RSC en los ${PAGINAS.length} arquetipos medidos. El nivel\n` +
        `   \`filas\` de html-cmp no tiene contraparte que auditar: es clon-contra-clon\n` +
        `   POR CONSTRUCCIÓN, hoy y siempre.\n`),
);
process.exit(mal ? 1 : 0);
