/**
 * ¿TIENE `medida()` UNA POSICIÓN POR CADA PUNTO DE RUPTURA QUE EL EDITOR
 * ESCRIBE — Y SE SIRVEN A LOS ANCHOS QUE DICE?
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE
 *
 * `medida()` no tenía guarda ninguna. Se derivó con un `grep`: **0 sondas de
 * `scripts/qa/` leen su forma**, así que la 126.ª le añadió una tercera
 * posición de breakpoint a un grupo que nadie vigila. Un campo nuevo sin guarda
 * es un camino de render sin estrenar Y sin instrumento — dos cosas distintas,
 * y sólo la segunda se puede arreglar sin salir a medir.
 *
 * ── LOS TRES INVARIANTES, y ninguno sobra ─────────────────────────────────
 *
 *   1 · POSICIONES · el grupo tiene una posición por cada punto de ruptura que
 *       el editor escribe. La 125.ª censó **3** —base 85 · `≤980` 20 · `≤767`
 *       20— y el grupo tenía 2. Un valor de tablet guardado en la posición de
 *       móvil se serviría también a 390, donde el original sirve otro.
 *
 *   2 · NOMBRES DERIVADOS · cada valor tiene su unidad y **los seis nombres son
 *       DISTINTOS**. Es el invariante que la versión vieja de `unidadDe`
 *       rompía: mapeaba a mano con un ternario de dos ramas, así que una
 *       tercera posición habría bautizado su unidad como `movilUnidad` y
 *       **colisionado en silencio** con la que ya existe (§regla 9, 7.º caso —
 *       un conjunto enumerado a mano está incompleto desde el día que se
 *       escribe). Dos campos con el mismo `name` en un grupo no son un error de
 *       tipos: son un campo que se come al otro.
 *
 *   3 · LA UNIDAD SE RECHAZA, NO SE SUPONE · el `validate` de cada unidad tiene
 *       que MORDER cuando hay valor y no hay unidad — **en las tres
 *       posiciones**. Una posición nueva cuyo `validate` no muerde reintroduce
 *       exactamente el defecto que este campo existe para corregir: `19px` y
 *       `2 %` valen lo mismo a 1440 y distinto a 390.
 *
 * ── Y EL CRUCE, que es el que no se puede contestar leyendo el esquema ─────
 *
 *   4 · EL ANCHO QUE EL ESQUEMA NOMBRA ES EL QUE EL RENDER APLICA. Se deriva
 *       de `f33.css` y `kb.css` —§*el veredicto lo da la salida servida*—, no
 *       del nombre del campo. Ahí está el hallazgo de la 126.ª: `movilValor` se
 *       llama «móvil» y los dos consumidores lo aplican dentro de
 *       `@media (max-width: 980px)`, que es la pestaña TABLET de Divi. El
 *       nombre es una INTENCIÓN y el ancho es el VALOR.
 *
 *       ⚠ Y `valor767` sale **SIN CABLEAR** por este mismo cruce, con su
 *       cardinal: es un hecho declarado, no un fallo. Cuando el render emita su
 *       tramo, este control lo verá solo.
 *
 * Uso: npm run qa:medida-bp
 * ══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const SABOTAJE = process.env.SABOTAJE || null;
const RAIZ = path.resolve(QA, "..", "..");
const COMUNES = path.join(RAIZ, "packages", "cms-config", "src", "campos", "comunes.ts");
const CSS = [
  path.join(RAIZ, "apps", "web", "src", "app", "f33.css"),
  path.join(RAIZ, "apps", "web", "src", "app", "kb.css"),
];

/* ── PRECONDICIONES ANTES DE GASTAR (§regla 37) ────────────────────────────── */
const faltan = [COMUNES, ...CSS].filter((p) => !fs.existsSync(p));
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.map((p) => path.relative(RAIZ, p)).join(", ")}`);
  process.exit(1);
}

/* Lo que el editor escribe, censado por la 125.ª (`derivaciones/paso0-125.*`).
 * Es el LADO A: contra esto se compara la forma del grupo. */
const BREAKPOINTS_MEDIDOS = [
  { ancho: null, etiqueta: "base (escritorio)", declaraciones: 85 },
  { ancho: 980, etiqueta: "≤980 (pestaña TABLET de Divi)", declaraciones: 20 },
  { ancho: 767, etiqueta: "≤767 (pestaña MÓVIL de Divi)", declaraciones: 20 },
];

/* La unidad es el INVARIANTE, no la sonda: se comprueba UN grupo `medida()` y
 * lo que se cuenta son sus POSICIONES. El mínimo se deriva del censo, no se
 * escribe — una posición medida de más sube el listón sola. */
const ev = new Evaluadas({ unidad: "posiciones de breakpoint", minimo: BREAKPOINTS_MEDIDOS.length, nombre: "medida-bp" });

/* ── LADO ESQUEMA · se IMPORTA el objeto, no se lee el texto ───────────────── */
async function grupoMedida() {
  const tmp = path.join(QA, ".tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const bundle = path.join(tmp, "comunes-medida.mjs");
  await esbuild.build({
    entryPoints: [COMUNES],
    outfile: bundle,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
  });
  const mod = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
  return mod.medida("sonda", "sonda — instancia de prueba de `qa:medida-bp`");
}

const grupo = await grupoMedida();
const campos = grupo.fields ?? [];

/* Las POSICIONES son los campos `number`; las UNIDADES, los `select`. Se derivan
 * del objeto resuelto — no se enumeran por nombre, que es justo el dato
 * recordado del que este instrumento protege. */
let valores = campos.filter((c) => c.type === "number").map((c) => c.name);
let unidades = campos.filter((c) => c.type === "select").map((c) => c.name);

/* ── SABOTAJES · se aplican SOBRE EL DATO, nunca sobre el umbral (§regla 28) ── */
if (SABOTAJE === "posicion-fuera") valores = valores.filter((n) => n !== "valor767");
if (SABOTAJE === "unidad-colision") unidades = unidades.map((n) => (n === "unidad767" ? "movilUnidad" : n));

const fallos = [];
const controles = [];
const ctl = (ok, nombre, detalle) => {
  controles.push({ ok, nombre, detalle });
  if (!ok) fallos.push(`${nombre} — ${detalle}`);
};

/* ── 1 · POSICIONES ───────────────────────────────────────────────────────── */
ctl(
  valores.length === BREAKPOINTS_MEDIDOS.length,
  "POSICIONES: el grupo tiene una por cada punto de ruptura que el editor escribe",
  `esquema=${valores.length} (${valores.join(" · ")}) · medidas por la 125.ª=${BREAKPOINTS_MEDIDOS.length} (${BREAKPOINTS_MEDIDOS.map((b) => b.etiqueta).join(" · ")})`,
);
for (const b of BREAKPOINTS_MEDIDOS) ev.ok(1);

/* ── 2 · NOMBRES DERIVADOS, y sobre todo DISTINTOS ────────────────────────── */
ctl(
  unidades.length === valores.length,
  "NOMBRES: cada posición trae su unidad",
  `valores=${valores.length} · unidades=${unidades.length}`,
);
const dupUnidades = unidades.filter((n, i) => unidades.indexOf(n) !== i);
ctl(
  dupUnidades.length === 0,
  "NOMBRES: los nombres de unidad son DISTINTOS (una colisión se come un campo en silencio)",
  dupUnidades.length ? `COLISIONAN: ${[...new Set(dupUnidades)].join(" · ")}` : `${unidades.length} distintos: ${unidades.join(" · ")}`,
);
const dupValores = valores.filter((n, i) => valores.indexOf(n) !== i);
ctl(dupValores.length === 0, "NOMBRES: los nombres de valor son DISTINTOS", dupValores.length ? `COLISIONAN: ${[...new Set(dupValores)].join(" · ")}` : `${valores.length} distintos`);

/* ── 3 · LA UNIDAD SE RECHAZA, NO SE SUPONE — en las TRES posiciones ──────── */
const muerde = [];
for (const [i, nombreValor] of valores.entries()) {
  let campoUnidad = campos.filter((c) => c.type === "select")[i];
  /* SABOTAJE `validate-mudo` — reproduce EL MODO DE FALLO (§regla 28): una
     posición nueva cuyo `validate` no muerde, o sea la unidad supuesta en vez
     de rechazada. No se toca el umbral: se sustituye la función. */
  if (SABOTAJE === "validate-mudo" && nombreValor === "valor767") campoUnidad = { ...campoUnidad, validate: () => true };
  if (!campoUnidad?.validate) { muerde.push({ posicion: nombreValor, muerde: false, porQue: "sin validate" }); continue; }
  /* Se le pasa el hermano CON valor y SIN unidad: tiene que devolver un
     mensaje. Y el CONTROL simétrico: con la unidad puesta, tiene que pasar —
     si no, el `validate` rechaza siempre y su rojo no significa nada. */
  const rechaza = campoUnidad.validate(undefined, { siblingData: { [nombreValor]: 12 } });
  const acepta = campoUnidad.validate("px", { siblingData: { [nombreValor]: 12 } });
  muerde.push({ posicion: nombreValor, muerde: typeof rechaza === "string", acepta: acepta === true, porQue: typeof rechaza === "string" ? "ok" : `devolvió ${JSON.stringify(rechaza)}` });
}
const noMuerden = muerde.filter((m) => !m.muerde);
ctl(noMuerden.length === 0, "VALIDATE: la unidad se rechaza en cuanto hay valor, en las 3 posiciones", noMuerden.length ? `NO muerden: ${noMuerden.map((m) => `${m.posicion} (${m.porQue})`).join(" · ")}` : muerde.map((m) => m.posicion).join(" · "));
const noAceptan = muerde.filter((m) => m.muerde && !m.acepta);
ctl(noAceptan.length === 0, "VALIDATE · CONTROL: con la unidad puesta PASA (o su rojo no significa nada)", noAceptan.length ? `rechazan siempre: ${noAceptan.map((m) => m.posicion).join(" · ")}` : "3/3 aceptan");

/* ── 4 · CRUCE CON EL RENDER · qué ancho aplica cada variable ─────────────── */
/** Deriva, por fichero CSS, el `max-width` del `@media` que envuelve cada
 *  variable `--*-<sufijo>`. No se busca el número: se busca la variable y se
 *  mira en qué bloque cayó. */
function anchosDe(sufijo) {
  const vistos = new Map();
  for (const f of CSS) {
    let texto = fs.readFileSync(f, "utf8");
    /* SABOTAJE `render-otro-ancho` — el modo de fallo que este cruce vigila es
       *el render aplica la variable a un ancho distinto del que el esquema
       nombra*. Se reproduce sobre el TEXTO leído, en memoria: el fuente
       versionado NO se toca (§regla 20 — un `finally` no corre si matan el
       proceso por señal, así que un sabotaje que edita el fuente sobrevive). */
    if (SABOTAJE === "render-otro-ancho") texto = texto.replace(/max-width:\s*980px/g, "max-width: 900px");
    let ancho = null;
    let prof = 0;
    for (const linea of texto.split(/\r?\n/)) {
      const m = linea.match(/@media[^{]*max-width:\s*(\d+)px/);
      if (m) { ancho = Number(m[1]); prof = 0; }
      if (ancho !== null) {
        prof += (linea.match(/\{/g) ?? []).length - (linea.match(/\}/g) ?? []).length;
        if (prof <= 0 && !m) ancho = null;
      }
      /* Sólo DECLARACIONES, no comentarios: un `*` al principio es prosa. */
      if (/^\s*\*/.test(linea)) continue;
      if (new RegExp(`var\\(--[\\w-]+-${sufijo}[,)]`).test(linea)) {
        const k = `${path.basename(f)}`;
        if (!vistos.has(k)) vistos.set(k, new Set());
        vistos.get(k).add(ancho);
      }
    }
  }
  return vistos;
}

const anchosMovil = anchosDe("movil");
const todosMovil = [...new Set([...anchosMovil.values()].flatMap((s) => [...s]))];
ctl(
  anchosMovil.size === CSS.length,
  "CRUCE: la variable `-movil` aparece en LOS DOS consumidores (ni cero ni uno)",
  [...anchosMovil].map(([f, s]) => `${f}=${[...s].join(",")}`).join(" · "),
);
ctl(
  todosMovil.length === 1 && todosMovil[0] === 980,
  "CRUCE: `movilValor` se sirve al ancho que el esquema dice — y es 980, no 767",
  `anchos donde el render aplica \`-movil\`: ${todosMovil.join(" · ")}`,
);

const anchos767 = anchosDe("767");
const cableado767 = [...anchos767.values()].some((s) => s.size > 0);
/* ⚠ NO es un control que deba estar en verde hoy: es un HECHO DECLARADO con su
   cardinal (§regla 14). `valor767` existe en el esquema y el render no lo emite,
   así que es un camino SIN ESTRENAR. Se publica; no cierra el código de salida. */
const sinEstrenar = { campo: "valor767", cableadoEnElRender: cableado767, consumidoresConTramo767: [...anchos767].map(([f, s]) => `${f}=${[...s].join(",")}`) };

/* ── SALIDA ──────────────────────────────────────────────────────────────── */
const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  sonda: "medida-bp",
  sabotaje: SABOTAJE,
  alcance: { unidad: "posiciones de breakpoint de UN grupo `medida()`", nota: "el grupo es una primitiva: lo que vale para él vale para las 55 instancias de la DB" },
  breakpointsMedidos: BREAKPOINTS_MEDIDOS,
  esquema: { valores, unidades },
  validate: muerde,
  render: { movil: [...anchosMovil].map(([f, s]) => ({ fichero: f, anchos: [...s] })) },
  sinEstrenar,
  controles,
  nFallos: fallos.length,
};
w("medidas/medida-bp.json", salida);

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "FALLA"} ${c.nombre}\n      ${c.detalle}`);
say("\n=== POSICIONES DEL GRUPO ===");
for (const [i, v] of valores.entries()) say(`  ${v.padEnd(12)} → unidad \`${unidades[i] ?? "(ninguna)"}\``);
say("\n=== SIN ESTRENAR (declarado, no es fallo) ===");
say(`  ${sinEstrenar.campo}: cableado en el render = ${sinEstrenar.cableadoEnElRender ? "SI" : "NO"} · consumidores con tramo 767: ${sinEstrenar.consumidoresConTramo767.join(" · ") || "ninguno"}`);
say(`\n✓ evaluadas ${ev.n}/${BREAKPOINTS_MEDIDOS.length} posiciones de breakpoint · controles ${controles.length - fallos.length}/${controles.length}`);
/* El log también pasa por `w()`: si no, una corrida de negativo pisaría la
   canónica — el desvío de `NEG=` sólo alcanza lo que atraviesa la guarda. */
w("medidas/medida-bp.log", L.join("\n") + "\n");

if (fallos.length) {
  console.error(`\n❌ ${fallos.length} invariante(s) de \`medida()\` en rojo:`);
  for (const f of fallos) console.error(`   · ${f}`);
  process.exit(1);
}
