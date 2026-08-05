/**
 * TEST EN NEGATIVO de `cms-roundtrip` — entero, y **cada sabotaje reintroduce
 * un defecto REAL que esta tanda arregló**, no un fallo inventado.
 *
 * `PLAN-FASE-2.md` §F2-2 pone la igualdad mecánica como criterio de «hecho», y
 * `CLAUDE.md` §sondas pone la otra mitad: *«no te creas un limpio hasta haber
 * probado en negativo que la sonda sabe fallar»*. Aquí hace más falta que de
 * costumbre, porque **este comparador es el único instrumento del repo que mira
 * algo de la hoja que no sea su ruta** (ficha CMS-SP-TIPO): si él no sabe
 * fallar, nadie más va a hacerlo.
 *
 * ⚠ **Y llegaba tarde por partida doble.** `package.json` declaraba
 * `qa:cms-roundtrip-neg` apuntando a este fichero y **el fichero no existía** —
 * `git log --all` vacío—; y la cabecera de `aMedido` en `scripts/seed/mapeo.mjs`
 * lo citaba como *«su negativo entero»*. Dos afirmaciones y cero código: la
 * regla 3 (*documentado no es conectado*) en el `package.json` y en un
 * comentario, que son los dos sitios que nadie ejecuta.
 *
 * ── Los cuatro sabotajes que TIENE que cazar, y de dónde salió cada uno ────
 *
 * | sabotaje | qué reintroduce | cuánto costó de verdad |
 * |---|---|---|
 * | `defecto`            | la DB devuelve el valor explícito donde `conDefecto` escribió `null` | **el invariante que manda**: «omitido» y «escrito igual que el defecto» son dos estados del modelo |
 * | `defecto-compartido` | dos bloques con distinto defecto de render comparten uno solo | el `<h2>` de EDAR salía `<h3>` — el defecto de esta tanda, y no lo veía ninguna otra guarda |
 * | `sintetico`          | `updatedAt` deja de reconocerse como inyectado por `buildConfig` | sin `esSintetico`, **todos** los arrays y bloques salían con Δ ≠ 0 |
 * | `envoltorio`         | un array de UN campo propio deja de serlo | la regla se escribió mal **tres veces en dos días**, siempre con números plausibles |
 *
 * ── ⚠ Y UNO QUE NO CAZA, QUE ES EL RESULTADO MÁS CARO DE ESTE FICHERO ──────
 *
 * `tipo-hoja` cambia `productos.bullets[].texto` de `htmlLinea` a
 * `editorNegrita` — **el defecto de CMS-SP-TIPO literal**, el que escondía el
 * `R<sup>2</sup>`. Medido el 2026-08-04: la sonda sale **63/63, exit 0**.
 *
 *   > **El round-trip NO ve el editor de una hoja rica, y no es un fallo suyo:
 *   > es que la pérdida del `<sup>` ocurre al RENDERIZAR, no al guardar.**
 *   > `inlineALexical("R<sup>2</sup>…")` mete la cadena en un nodo de texto y
 *   > `lexicalAInline` la devuelve igual — la ida y la vuelta son inversas
 *   > perfectas sobre un editor que aun así pinta la fórmula como texto plano.
 *
 * O sea que la cabecera de `cms-roundtrip.mjs` decía de más al llamarse *«la
 * única que mira el TIPO de la hoja»*. Lo que mira es el **DEFECTO** y la
 * **FORMA** de la hoja —y eso ya es más de lo que mira nadie—; el **EDITOR**, no.
 * **CMS-SP-TIPO sigue ABIERTA**, y ahora con la razón medida en vez de
 * pendiente: la cierra un instrumento que compare la SALIDA RENDERIZADA (el Δ0
 * de F2-3), o uno que contraste las *features* del editor contra el inventario
 * de etiquetas medido del campo. Un sabotaje que no muerde es un dato, siempre
 * que se cuente; callarlo sería exactamente el verde falso del que va la casa.
 *
 * ── Y el CONTROL, que es la mitad que decide si los cuatro significan algo ──
 * Sin él, una sonda que fallara SIEMPRE aprobaría los cuatro sabotajes con
 * matrícula. Es la lección de F2-1 §5 —*un negativo sin control no es un
 * negativo*— y se pagó dentro de la verificación de otra guarda.
 *
 * Uso: npm run qa:cms-roundtrip-neg   (necesita el Postgres del CMS vivo)
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const RAIZ = join(QA, "../..");

/**
 * Un sabotaje pasa cuando (a) la sonda sale ≠ 0, (b) congela su fichero y
 * (c) **las diferencias caen donde tienen que caer**. La (c) es la que impide
 * que un sabotaje se apunte el fallo de otro: una sonda rota de cualquier otra
 * forma también daría exit 2, y sin (c) los cuatro saldrían verdes por lo mismo.
 */
const casos = [
  {
    sabotaje: "defecto",
    porQue: "un `conDefecto` que vuelve EXPLÍCITO — el invariante del defecto omitido",
    comprueba: (d) =>
      d.diferencias?.some((x) => x.esperado === "(ausente)")
        ? null
        : "ninguna diferencia dice «medido: (ausente)» — no es el defecto lo que rompió",
  },
  {
    sabotaje: "defecto-compartido",
    porQue: "un defecto MAL ELEGIDO — dos bloques que el render lee distinto compartiéndolo",
    comprueba: (d) =>
      d.diferencias?.some((x) => /\.nivel$/.test(x.ruta) && x.real === "(ausente)")
        ? null
        : "ninguna diferencia deja un `nivel` AUSENTE — rompió otra cosa",
  },
  {
    sabotaje: "sintetico",
    porQue: "`updatedAt` proyectado como si fuera dato medido — sin `esSintetico` no hay Δ0 posible",
    comprueba: (d) =>
      d.diferencias?.some((x) => /updatedAt/.test(x.ruta))
        ? null
        : "ninguna diferencia toca `updatedAt` — rompió otra cosa",
  },
  {
    sabotaje: "envoltorio",
    porQue: "el envoltorio transparente de array, la regla que salió mal tres veces",
    /**
     * ⚠ **Este cae por el otro canal, y hay que aceptarlo NOMBRADO.** Desde que
     * `exigeObjeto` existe, un array que deja de ser transparente recibe una
     * cadena donde espera un objeto y **la ida TIRA** en vez de escribir `{}` —
     * que es justo el arreglo de esta tanda. Así que el sabotaje ya no llega a
     * la comparación: muere antes, y mejor. Lo que no vale es aceptar «murió»:
     * se exige **su** mensaje, o cualquier otra rotura se apuntaría este tanto.
     */
    porError: /ESCALAR SIN DESTINO/,
    comprueba: (d) =>
      d.diferencias?.some((x) => x.clase === "FORMA")
        ? null
        : "ninguna diferencia de FORMA — el envoltorio no es lo que rompió",
  },
];

/**
 * ⚠ **Sabotajes que la sonda NO caza — y eso es un DATO, no un hueco.** Se
 * corren igual y se exige que sigan sin cazarse: el día que uno muerda, este
 * fichero sale rojo y alguien tiene que venir a leer por qué. Un punto ciego
 * documentado y verificado vale; uno documentado y no verificado envejece solo.
 */
const ciegos = [
  {
    sabotaje: "tipo-hoja",
    porQue:
      "CMS-SP-TIPO · `htmlLinea` → `editorNegrita`. La pérdida del `<sup>` es de RENDER,\n" +
      "                                 no de almacenamiento: la ida y la vuelta son inversas igual. La cierra F2-3",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-roundtrip ════════`);
console.log(
  `  ${casos.length} sabotajes que TIENE que cazar · ${ciegos.length} punto(s) ciego(s) declarado(s) · control\n` +
    `  cada uno reintroduce un defecto que existió de verdad\n`,
);

const ev = new Evaluadas({
  nombre: "cms-roundtrip-neg",
  unidad: "sabotajes",
  minimo: casos.length + ciegos.length,
});
let fallos = 0;

/* Todo por `corridaNegativa`: el desvío a `-neg-` lo pone NEG por construcción. */
const corre = (etiqueta, env = {}) =>
  corridaNegativa({
    etiqueta,
    args: ["--env-file=apps/cms/.env", join(QA, "cms-roundtrip.mjs")],
    env,
    cwd: RAIZ,
    timeout: 900_000,
  });

for (const c of casos) {
  const fichero = join(QA, `medidas/cms-roundtrip-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  /* Exit 2 con «SIN DIANA» NO es un sabotaje pasado: es un sabotaje que no
   * llegó a existir, y las dos cosas dan el mismo código. La sonda lo dice en
   * voz alta y aquí se lee. */
  const salida = (res.stdout || "") + (res.stderr || "");
  let canal = "comparación";
  if (/SIN DIANA/.test(salida)) mal = "SIN DIANA — el sabotaje no llegó a aplicarse";
  else if (res.status === 0) mal = `exit 0 — la sonda NO cazó el sabotaje`;
  else if (c.porError?.test(salida)) canal = "guarda de la IDA";
  else if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
  else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  ${mal}`);
  } else
    console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  [${canal}] ${c.porQue}`);
}

/* ── LOS PUNTOS CIEGOS, corridos y verificados como tales ────────────────── */
for (const c of ciegos) {
  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  const salida = (res.stdout || "") + (res.stderr || "");
  ev.ok();
  if (/SIN DIANA/.test(salida)) {
    fallos++;
    console.log(`  ❌ CIEGO=${c.sabotaje.padEnd(21)} (${seg}s)  SIN DIANA — no se llegó a aplicar`);
  } else if (res.status !== 0) {
    fallos++;
    console.log(
      `  ❌ CIEGO=${c.sabotaje.padEnd(21)} (${seg}s)  exit ${res.status} — ¡AHORA SÍ lo caza!\n` +
        `      Eso es una BUENA noticia y este fichero está desactualizado: mueve\n` +
        `      \`${c.sabotaje}\` a \`casos\` y cierra CMS-SP-TIPO con esta corrida.`,
    );
  } else console.log(`  ○  CIEGO=${c.sabotaje.padEnd(21)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL. Sin sabotaje: exit 0, 63/63, y las dos transformaciones
 *    declaradas verificadas. Sin esta mitad, una sonda rota de fábrica pasaría
 *    los cuatro negativos — F2-1 §5. ──────────────────────────────────────── */
const t0 = Date.now();
/* El CONTROL escribe en SU PROPIO nombre POR CONSTRUCCIÓN (NEG=control). */
const fCtl = join(QA, nombreNeg("medidas/cms-roundtrip.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
const seg = ((Date.now() - t0) / 1000).toFixed(0);
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const exigeControl = [
  [ctl.status === 0, `exit ${ctl.status} — sin sabotaje tiene que salir 0`],
  [/documentos IDÉNTICOS/.test(ctlOut), "sin la línea del veredicto"],
  [/PREPARA\/DEVUELVE inversas/.test(ctlOut), "sin la verificación de que el par escrito a mano es inverso"],
  [/T4a simétrica/.test(ctlOut), "sin el control de que T4a se aplica igual en los dos lados"],
];
const malControl = exigeControl.find(([ok]) => !ok);
if (malControl) {
  fallos++;
  console.log(`  ❌ CONTROL      (sin sabotaje) (${seg}s)  ${malControl[1]}`);
} else console.log(`  ✓  CONTROL      (sin sabotaje)      (${seg}s)  exit 0 — la sonda no falla siempre`);

const total = casos.length + ciegos.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-roundtrip · test en negativo: ${total - fallos}/${total}` +
    ` (${casos.length} que caza · ${ciegos.length} punto(s) ciego(s) · control)\n` +
    (fallos === 0
      ? `   Caza el DEFECTO OMITIDO, el defecto MAL ELEGIDO, los campos que inyecta\n` +
        `   \`buildConfig\` y el envoltorio transparente — y pasa en limpio. Su Δ0 ya se\n` +
        `   puede leer, **con su punto ciego declarado**: el EDITOR de una hoja rica no\n` +
        `   lo ve nadie todavía (CMS-SP-TIPO abierta, la cierra F2-3).\n`
      : `   Un 63/63 de \`cms-roundtrip\` NO se puede leer hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
