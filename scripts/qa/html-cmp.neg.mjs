/**
 * TEST EN NEGATIVO de `html-cmp` — cada sabotaje por SU invariante, con control.
 * Uso: npm run qa:html-cmp-neg
 *
 * ── Qué hay que poder falsar aquí, y son DOS cosas distintas ──────────────
 * `html-cmp` afirma *«el HTML servido es el mismo byte a byte»*. Esa frase
 * puede ser falsa por dos caminos que no se parecen:
 *
 *   1 · **que no vea una diferencia que existe** — el fallo obvio, y el que
 *       cubren `visible-alterado`, los tres `inv-*`, `ruta-fantasma` y `base-vacia`;
 *   2 · **que la NORMALIZACIÓN se coma la diferencia** — el fallo propio de
 *       esta sonda y el más peligroso, porque *fabrica* el verde en vez de
 *       perderlo: un volátil corto o frecuente borra contenido real **de los
 *       dos lados** y los iguala. Lo cubren `volatil-corto` y `volatil-ubicuo`.
 *
 * Sin el grupo 2, «byte a byte» sería una etiqueta y no una medida: bastaría un
 * volátil mal elegido para que las 31 rutas salieran idénticas siempre.
 *
 * ── Y un TERCER camino, desde el contrato del §F2-3-RSC-ORDEN ─────────────
 *   3 · **que un nivel INFORMATIVO se comporte como una puerta, o al revés.**
 *       Degradar `filas` a informativo sólo vale si a la vez (a) una
 *       renumeración sale **verde y contada aparte** —`filas-renumeradas`— y
 *       (b) un invariante movido sale **rojo** —los tres `inv-*`—. Con sólo lo
 *       primero, el nivel se habría apagado; con sólo lo segundo, no se habría
 *       degradado nada. Son las dos mitades de la misma decisión y el negativo
 *       las dispara por separado.
 *
 * El sabotaje `volatil-ubicuo` **deriva su cadena del HTML prerenderizado de
 * disco** (`.next/server/app/*.html`) en vez de escribir una a mano: una cadena
 * cableada deja de ser frecuente en cuanto cambie el marcado, y entonces el
 * sabotaje no sabotea nada y se lee como «la sonda lo cazó».
 */
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, APP, nombreNeg, QA, w } from "./lib.mjs";

/**
 * ⚠ **LA BASE DEL NEGATIVO SE MIDE, NO SE HEREDA DEL PROYECTO (2026-08-06).**
 *
 * Esto usaba `medidas/html-f23-base.json`, que es **la línea base de la FASE**:
 * el HTML de antes de migrar nada. Y ahí conviven dos afirmaciones que no se
 * parecen:
 *
 *   · *«el comparador sabe decir IGUAL cuando algo es igual»* — lo único que un
 *     control tiene que probar;
 *   · *«el clon de hoy coincide con el de antes de F2-3»* — un **hecho del
 *     proyecto**, que deja de ser cierto en cuanto una familia se migra con una
 *     desviación deliberada (`/[slug]`: 4 rutas que **no pueden** coincidir).
 *
 * Mezcladas, el negativo del instrumento enrojece **porque el proyecto avanzó**,
 * y ese rojo no dice qué pasó. Es la misma enfermedad que la diana escrita a
 * mano, una vuelta más arriba, y con la misma factura: *la tanda que migra una
 * familia deja rojo el negativo del instrumento con el que va a medirla.*
 *
 * Así que la base se **MIDE al empezar**: una corrida de sondeo contra el build
 * de ahora. Comparar el build consigo mismo es el control correcto, y cada
 * sabotaje se construye encima de algo que ya compara limpio.
 */
const SONDEO = "control-diana";
const ARCH_SONDEO = nombreNeg(`medidas/html-${SONDEO}.json`, SONDEO);
/* El exit de esta corrida NO se exige 0: se usa como MEDIDA, no como veredicto.
 * Se lanza SIN `--cmp` — no compara nada, sólo congela el build de ahora. */
corridaNegativa({ etiqueta: SONDEO, args: [join(QA, "html-cmp.mjs"), SONDEO] });
if (!existsSync(join(QA, ARCH_SONDEO))) {
  console.error(
    `\n❌ SIN BASE — la corrida de sondeo no dejó ${ARCH_SONDEO}.\n` +
      `   Sin ella habría que comparar contra la línea base de la FASE, y entonces este\n` +
      `   negativo se pondría rojo cada vez que el proyecto avanzara a propósito.`,
  );
  process.exit(2);
}
const BASE = ARCH_SONDEO;
const base = JSON.parse(readFileSync(join(QA, BASE), "utf8"));
const rutasBase = Object.keys(base.paginas);
if (!rutasBase.length) {
  console.error(`\n❌ SIN BASE — ${ARCH_SONDEO} no trae páginas: no hay nada contra lo que sabotear.`);
  process.exit(2);
}

/* ── La cadena UBICUA se deriva del artefacto, no se escribe ──────────────── */
const dirHtml = join(APP, ".next/server/app");
const ficheroHtml = existsSync(dirHtml)
  ? readdirSync(dirHtml).filter((f) => f.endsWith(".html") && !f.startsWith("_")).sort()[0]
  : null;
if (!ficheroHtml) {
  console.error(`\n❌ SIN DIANA — no hay HTML prerenderizado en ${dirHtml}. ¿Falta \`npm run build\`?`);
  process.exit(2);
}
const htmlDisco = readFileSync(join(dirHtml, ficheroHtml), "utf8");
/**
 * La ventana de 8 caracteres —el largo mínimo que la guarda acepta— que más
 * bytes del documento cubre. **Se calcula, no se elige**: una cadena escrita a
 * mano deja de ser frecuente en cuanto cambie el marcado, y entonces el
 * sabotaje no sabotea y su verde se lee como «la sonda lo cazó».
 */
const LARGO = 8;
const cuenta = new Map();
for (let i = 0; i + LARGO <= htmlDisco.length; i++) {
  const s = htmlDisco.slice(i, i + LARGO);
  cuenta.set(s, (cuenta.get(s) || 0) + 1);
}
const [cad, veces] = [...cuenta].sort((a, b) => b[1] - a[1])[0] ?? [];
const ubicua = cad ? { c: cad, n: veces } : null;
if (!ubicua || ubicua.n * ubicua.c.length <= Buffer.byteLength(htmlDisco) * 0.01) {
  console.error(
    `\n❌ SIN DIANA para 'volatil-ubicuo' — ninguna candidata de ≥8 caracteres supera el 1 % de ${ficheroHtml}.\n` +
      `   El sabotaje no llegaría a existir, y eso da la misma salida que «la sonda lo cazó».`,
  );
  process.exit(2);
}

/**
 * Una base derivada de la congelada, **con la diana puesta al día** y luego la
 * mutación pedida. Ver `sincroniza` arriba: sin ese paso el sabotaje no aísla
 * nada, porque arrastra tres tandas de renumeración RSC además de lo que rompe.
 */
function fabricaBase(etiqueta, muta) {
  const b = sincroniza(JSON.parse(JSON.stringify(base)));
  muta(b);
  const destino = `medidas/html-cmp-neg-${etiqueta}-base.json`;
  w(destino, b, { pisar: true });
  return destino;
}

/**
 * La diana se elige DERIVANDO, y con una condición: que no sea una de las rutas
 * que hoy difieren de verdad por el reparto del stream (las de las familias
 * migradas). Si la diana fuese una de ésas, el sabotaje y el fenómeno real se
 * mezclarían y el caso dejaría de aislar nada.
 *
 * ⚠ **CORREGIDO 2026-08-06 — esto era una LISTA ESCRITA A MANO, y envejecía
 * sola.** Decía `r.startsWith("/faqs/")`, que era verdad el día que se escribió
 * —la FAQ era la única familia migrada— y dejó de serlo con cada familia que
 * entró después. La renumeración RSC **no se queda en la familia que se migra**:
 * hoy la tienen 22 de las 31 rutas, `/accesorios` entre ellas, y `/accesorios`
 * era justo la diana que salía elegida. El caso `solo-reparto` pedía ver
 * *«filas RSC Δ0»* en una ruta cuyas filas ya NO estaban a Δ0, así que el
 * negativo salía **9/11 sin que nadie hubiera roto nada**.
 *
 * Es `CLAUDE.md` §sondas 9 dentro del propio test en negativo: *un número
 * recordado envejece CONTRA el repo, en silencio*. Y el precio real es peor que
 * un rojo — es que **la tanda que migra una familia deja rojo el negativo del
 * instrumento con el que va a medirla**, y ese rojo no dice qué pasó.
 *
 * La lista se sustituye por su DERIVACIÓN: se corre el control primero (que es
 * la sonda contra la base, sin sabotaje) y se lee de su congelada qué rutas
 * tienen hoy `filas` idéntico a la base. Una familia migrada mañana se queda
 * fuera sola.
 */
const ahora = base.paginas;

/**
 * ⚠ **Y aquí la segunda mitad, que es la que hacía el caso INSATISFACIBLE.**
 *
 * Buscar una ruta *«sin reparto real»* ya no encuentra ninguna: medido hoy,
 * **0 de las 31** tienen `filas` igual a `html-f23-base.json`. La renumeración
 * RSC la han acumulado todas al migrarse tres familias, y va a seguir. O sea que
 * el caso `solo-reparto` **no era arreglable eligiendo mejor la diana**: pedía
 * un estado del build que ya no existe y que no va a volver.
 *
 * El defecto de fondo es que los sabotajes se construían sobre **la base
 * congelada**, que describe un build de hace tres tandas. Un sabotaje así no
 * rompe una cosa: rompe la que se quería **más todo lo que haya derivado desde
 * entonces**, y su rojo deja de decir qué lo causó.
 *
 * La construcción correcta es la de siempre en este repo —**el control primero,
 * y el sabotaje encima de algo que ya compara limpio**—:
 *
 *   > `sincroniza()` copia a la diana **la medida de HOY** (la del control, que
 *   > por definición compara a Δ0 consigo misma) y sólo entonces se rompe UNA
 *   > propiedad. Así cada caso aísla lo que dice aislar, y ninguno depende del
 *   > estado accidental del build.
 *
 * Y con eso la diana deja de tener requisitos: vale cualquier ruta.
 */
const rutaDiana = rutasBase.find((r) => r !== "/" && ahora[r] && !ahora[r].error) ?? rutasBase[0];
if (!ahora[rutaDiana] || ahora[rutaDiana].error) {
  console.error(`\n❌ SIN DIANA — ${rutaDiana} no se pudo medir en la corrida de sondeo.`);
  process.exit(2);
}

/** Deja la diana con la medida de HOY: el punto de partida que compara limpio. */
const sincroniza = (b) => {
  b.paginas[rutaDiana] = { ...ahora[rutaDiana] };
  return b;
};

const casos = [
  {
    /* ⚠ **CORREGIDO 2026-08-06, y lo cazó ESTE negativo en la misma tanda que
     * movió la puerta.** El caso saboteaba sólo `visible`, que era la puerta
     * hasta que se declaró el 2º volátil. Con la puerta en `visibleSinChunks`,
     * *«cambió el visible»* dejó de significar una sola cosa —puede ser un
     * nombre de chunk (benigno, y lo cubre `solo-bundle`) o contenido (defecto,
     * y lo cubre esto)—, así que el sabotaje pasó a caer del lado benigno y
     * **salió exit 0 esperando 1**.
     *
     * Es la clase que esta tanda tuvo que nombrar dos veces: *un negativo
     * anclado a una línea base que el propio trabajo mueve se auto-invalida.*
     * Aquí la «línea base» no es un fichero: es **el CONTRATO**. Cuando cambia
     * qué nivel decide, todo falsador que apuntara al nivel viejo deja de
     * falsar — y su verde no dice nada. Se arregla apuntando a la puerta, no
     * relajando la expectativa. */
    etiqueta: "visible-alterado",
    exit: 1,
    porQue: `${rutaDiana} con otro marcado visible **y** otro \`visibleSinChunks\` ⇒ es lo que ve el visitante: DEFECTO`,
    base: () =>
      fabricaBase("visible-alterado", (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].visible = "0".repeat(16);
        b.paginas[rutaDiana].visibleSinChunks = "0".repeat(16);
      }),
    salidaTiene: /visible DISTINTO/,
  },
  {
    /* ⚠ CAMBIADO 2026-08-06 con el contrato del §F2-3-RSC-ORDEN. Este caso
     * esperaba **exit 1**: `filas` era PUERTA. Ya no lo es —el original no emite
     * carga RSC, así que ese nivel no tiene contraparte que auditar— y lo que
     * tiene que hacer la sonda con unas filas renumeradas es **contarlas y
     * nombrarlas**, no enrojecer. Su hermano de abajo es el que conserva el
     * poder de falsar: los INVARIANTES. */
    etiqueta: "filas-renumeradas",
    exit: 0,
    porQue: "visible Δ0, filas distintas, invariantes quietos ⇒ renumeración: verde y CONTADO aparte",
    base: () =>
      fabricaBase("filas-renumeradas", (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].filas = "0".repeat(16);
      }),
    salidaTiene: new RegExp(
      `✅ ${rutaDiana.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+marcado visible Δ0 · filas RSC con OTROS identificadores`,
    ),
  },
  /* ── UN CASO POR INVARIANTE, y no es exceso ────────────────────────────────
   * El contrato promete que el nivel informativo dispara con TRES invariantes.
   * Probar uno y citar los tres es *documentado no es conectado* (`CLAUDE.md`
   * §sondas 3): dos de ellos podrían no estar comprobándose y la salida sería
   * idéntica. `bytesCarga` además ejercita el camino de un invariante que la
   * base de F2-3 **no trae** —aquí se inyecta a propósito— para que ese camino
   * esté probado el día que una base sí lo traiga. */
  ...[
    { campo: "nFilas", valor: (v) => v + 1 },
    { campo: "nMascaras", valor: (v) => v + 1 },
    { campo: "bytesCarga", valor: (v) => (v ?? 0) + 1 },
  ].map(({ campo, valor }) => ({
    etiqueta: `inv-${campo.toLowerCase()}`,
    exit: 1,
    porQue: `visible Δ0 pero \`${campo}\` movido ⇒ NO es renumeración: es contenido de la carga`,
    base: () =>
      fabricaBase(`inv-${campo.toLowerCase()}`, (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].filas = "0".repeat(16);
        b.paginas[rutaDiana][campo] = valor(b.paginas[rutaDiana][campo]);
      }),
    salidaTiene: new RegExp(`movió un invariante: ${campo} `),
  })),
  {
    /* ⚠ El complementario de los dos de arriba, y el que evita que «sólo
     * reparto» se vuelva un cajón de sastre: con `visible` y `filas` iguales, un
     * `normalizado` distinto tiene que salir VERDE **y contarse aparte**. Si
     * esto saliera rojo, los tres niveles no serían tres niveles: serían uno. */
    etiqueta: "solo-reparto",
    exit: 0,
    porQue: "visible y filas iguales, documento distinto ⇒ verde, pero CONTADO como reparto",
    base: () => fabricaBase("solo-reparto", (b) => (b.paginas[rutaDiana].normalizado = "0".repeat(16))),
    /* Anclado en LA DIANA, no en el recuento total: el total incluye las rutas
     * que hoy difieren de verdad por el reparto, y contarlas juntas haría que
     * este caso pasara sin que el sabotaje hubiera hecho nada. */
    salidaTiene: new RegExp(
      `✅ ${rutaDiana.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+marcado visible Δ0 · filas RSC Δ0`,
    ),
  },
  {
    /* ── EL SEGUNDO VOLÁTIL, sus dos mitades ────────────────────────────────
     * Igual que con `filas`: declarar un volátil sólo vale si a la vez (a) el
     * caso legítimo sale **verde y contado aparte** —esto— y (b) una
     * normalización ensanchada sale **roja** —`chunk-ensanchado`, abajo—. Con
     * sólo lo primero se habría apagado la puerta; con sólo lo segundo, no se
     * habría declarado nada. */
    etiqueta: "solo-bundle",
    exit: 0,
    porQue:
      "visible distinto, `visibleSinChunks` igual ⇒ mismo marcado y otro BUNDLE cliente: verde y CONTADO aparte",
    base: () =>
      fabricaBase("solo-bundle", (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].visible = "0".repeat(16);
      }),
    salidaTiene: new RegExp(
      `✅ ${rutaDiana.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+marcado visible Δ0 SALVO los nombres de chunk`,
    ),
  },
  {
    /* La otra mitad: un patrón de chunk ENSANCHADO tiene que morir en la guarda
     * de ubicuidad, no igualar los dos lados. La diana del ensanche se deriva —
     * `class="…"` está por todo el documento— y el sabotaje entra por el gancho
     * declarado, igual que `volatil-ubicuo` entra por `BUILD_ID`. */
    etiqueta: "chunk-ensanchado",
    exit: 2,
    porQue: 'un patrón de chunk que además se coma `class="…"` BORRA documento e iguala los dos lados',
    base: () => BASE,
    env: { CHUNK_PATRON: 'class="[^"]*"' },
    salidaTiene: /VOLÁTIL UBICUO \(nombres de chunk\)/,
  },
  {
    etiqueta: "ruta-fantasma",
    exit: 1,
    porQue: "la base trae una ruta que el build ya no emite ⇒ DESAPARECIDA, no «ninguna difiere»",
    base: () => fabricaBase("ruta-fantasma", (b) => (b.paginas["/una-ruta-que-no-existe"] = { ...b.paginas[rutaDiana] })),
    salidaTiene: /DESAPARECIDAS del build/,
  },
  {
    etiqueta: "base-vacia",
    exit: 2,
    porQue: "base sin páginas ⇒ «ninguna difiere» sería cierto por vacío",
    base: () => fabricaBase("base-vacia", (b) => (b.paginas = {})),
    salidaTiene: /no tiene páginas/,
  },
  {
    etiqueta: "volatil-corto",
    exit: 2,
    porQue: "un volátil de 1 carácter borraría documento en vez de esconder el build id",
    base: () => BASE,
    env: { BUILD_ID: "e" },
    salidaTiene: /VOLÁTIL DEMASIADO CORTO/,
  },
  {
    etiqueta: "volatil-ubicuo",
    exit: 2,
    porQue: `"${ubicua.c}" sale ${ubicua.n} veces en ${ficheroHtml} ⇒ normalizarlo IGUALA los dos lados`,
    base: () => BASE,
    env: { BUILD_ID: ubicua.c },
    salidaTiene: /VOLÁTIL UBICUO/,
  },
  {
    /* ── EL LISTÓN DEL SEGUNDO CONTRATO (122.ª) ──────────────────────────────
     * Hasta hoy el contrato del nivel de comparación declaraba `minimo: 1`, así
     * que **comparar 1 ruta de 426 salía «suficiente»**. Este caso es el que lo
     * separa, y hay que ver POR QUÉ es éste y no el evidente:
     *
     *   · una base de otro conjunto de rutas —`ruta-fantasma` llevado al
     *     extremo— tiene **0 instancias separadoras** para este arreglo: con
     *     `minimo: 1` y 0 comparadas, `0 < 1` ya gritaba. El caso obvio pasaba
     *     ANTES y DESPUÉS (§regla 17, 2.ª cara: un sabotaje que anula media
     *     hipótesis no falsea nada);
     *   · lo que sólo el listón derivado ve es el caso **PARCIAL**: la base y el
     *     build comparten las 426, y aun así se compara UNA. Ahí `1 ≥ 1` daba
     *     verde en el contrato y `426 ≥ 1` no lo da.
     *
     * ⚠ Y el sabotaje va EN EL DATO, no en el umbral (§regla 28a): se marcan
     * con `error` todas las páginas de la base menos la diana, que es el modo de
     * fallo real del que la guarda protege —una corrida en la que la medida no
     * llegó—, no un `minimo` bajado a mano.
     *
     * ⚠ El caso NO se ancla en el código de salida: `sinComparar > 0` ya ponía
     * exit 1 antes del arreglo, así que el exit **no separa nada** (§regla 21,
     * la vuelta). Lo que separa es la frase del contrato y sus dos cifras. */
    etiqueta: "casi-toda-sin-comparar",
    exit: 1,
    porQue: `base con todas las páginas en error salvo la diana ⇒ 1 comparada de ${rutasBase.length}: NO SE PUDO EVALUAR`,
    base: () =>
      fabricaBase("casi-toda-sin-comparar", (b) => {
        for (const r of Object.keys(b.paginas))
          if (r !== rutaDiana) b.paginas[r].error = "SABOTAJE 122.ª: esta página no se midió";
      }),
    salidaTiene: new RegExp(
      `NO SE PUDO EVALUAR · html-cmp vs casi-toda-sin-comparar — 1 de ${rutasBase.length} rutas comparadas`,
    ),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · html-cmp ════════\n`);
console.log(`  base: ${BASE} (${rutasBase.length} rutas) · diana: ${rutaDiana}`);
console.log(`  cadena ubicua derivada de ${ficheroHtml}: "${ubicua.c}" ×${ubicua.n}\n`);

const ev = new Evaluadas({ nombre: "html-cmp-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const ficheroDe = (etiqueta) => join(QA, nombreNeg(`medidas/html-${etiqueta}.json`, etiqueta));
const borra = (etiqueta) => { const f = ficheroDe(etiqueta); if (existsSync(f)) rmSync(f); };

for (const c of casos) {
  borra(c.etiqueta);
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "html-cmp.mjs"), c.etiqueta, "--cmp", c.base()],
    env: c.env ?? {},
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────────
 * Sin sabotaje, el build actual contra la congelada tiene que dar exit 0. Y con
 * una exigencia más, que es la que hace que el control diga algo: **las 31
 * rutas comparadas**. Un control que saliera 0 comparando una sola ruta no
 * distinguiría «todo igual» de «casi nada mirado». */
borra("control");
const ctl = corridaNegativa({ etiqueta: "control", args: [join(QA, "html-cmp.mjs"), "control", "--cmp", BASE] });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
/**
 * ⚠ **ACTUALIZADO EN LA 122.ª, y no por relajar: por ESTRECHAR.** El titular
 * pasó de «N rutas comparadas» a «N **de N** rutas comparadas» al derivar el
 * listón del segundo contrato, así que la expectativa vieja dejó de casar. Es
 * §regla 5ter —*arreglar el objeto caduca el control que lo lee*— y la salida
 * correcta es escribir la afirmación NUEVA, que además dice más: el control ya
 * no sólo exige que se comparen todas, exige que el **denominador** sea el que
 * la sonda publica.
 *
 * Y la tercera línea es la que hace que el control separe de verdad: sin
 * sabotaje **NO puede aparecer** la frase del contrato. Un control que sólo
 * mirase el exit 0 no distinguiría «comparó todas» de «gritó y alguien se comió
 * el código de salida».
 */
const RE_CTL = new RegExp(`${rutasBase.length} de ${rutasBase.length} rutas comparadas · 0 con CONTENIDO distinto`);
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!RE_CTL.test(ctlOut))
  malCtl = `no dice «${rutasBase.length} de ${rutasBase.length} rutas comparadas · 0 con CONTENIDO distinto»`;
else if (/NO SE PUDO EVALUAR · html-cmp vs/.test(ctlOut))
  malCtl = `sin sabotaje NO puede gritar el contrato de comparación`;
if (malCtl) { fallos++; console.log(`  ❌ CONTROL          ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL          exit 0 · ${rutasBase.length} de ${rutasBase.length} rutas comparadas · 0 distintas · el contrato NO grita`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} html-cmp · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve una diferencia de contenido, ve una ruta que falta, se niega a comparar\n` +
        `   contra una base vacía, y RECHAZA los DOS volátiles cuando se ensanchan hasta\n` +
        `   borrar documento — que es la única forma que tenían de dar verde siempre. Y\n` +
        `   los dos niveles degradados lo están por sus dos mitades: la renumeración y el\n` +
        `   cambio de bundle se CUENTAN, el invariante y el marcado gritan.\n`
      : `   «El HTML es el mismo byte a byte» NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
