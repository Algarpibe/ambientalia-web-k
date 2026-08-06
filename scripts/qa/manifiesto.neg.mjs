/**
 * TEST EN NEGATIVO de `manifiesto` — cada sabotaje por SU invariante, con
 * control.
 * Uso: npm run qa:manifiesto-neg
 *
 * ── Por qué esta sonda no puede estrenarse sin él ─────────────────────────
 * `manifiesto` existe para que **«el build emitió menos rutas» deje de ser un
 * verde**. Una guarda contra verdes falsos que ella misma no sepa fallar es el
 * caso perfecto de *una sonda que no encuentra nada y una que no mira nada dan
 * la misma salida* — y encima con la autoridad de llamarse guarda.
 *
 * ── Los sabotajes, y qué AÍSLA cada uno ───────────────────────────────────
 * Las dos comprobaciones de la sonda son independientes por diseño, así que el
 * negativo tiene que dispararlas **por separado**: un sabotaje que las encienda
 * las dos a la vez no distingue cuál de las dos está viva.
 *
 * | sabotaje | enciende | y prueba que |
 * |---|---|---|
 * | `familia-vacia` (`--sin-base`) | **sólo la #1** | la #1 funciona SIN línea base — es la que sirve el día que la base no exista |
 * | `una-menos` (con base) | **sólo la #2** | una familia que emite MENOS pero no cero sigue viva para la #1 y aun así se caza |
 * | `vacio` | la #2 y **el contrato** | 0 rutas no es «no falta ninguna»: es NO SE PUDO EVALUAR |
 * | `ausente` | ninguna: **tira antes** | un manifiesto que no se puede leer sale por ERROR, no por cero rutas |
 * | `base-vacia` | ninguna: **tira antes** | una base sin rutas haría «no falta ninguna» cierto **por vacío** — el verde por vaciado del OTRO lado |
 *
 * Y el **CONTROL**, que es lo que decide si los cinco significan algo (regla 8a:
 * *un sabotaje que no cambia el resultado ha probado que el instrumento no
 * ejercita la guarda*): sin sabotaje, exit 0 sobre el build real.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, leeManifiesto, nombreNeg, QA, rutasEmitidas, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const BASE = "medidas/clon-base-1440-f21-antes.json";
const real = leeManifiesto();
const RUTAS = rutasEmitidas(real);

/** Un manifiesto derivado del real, con la mutación pedida. */
function fabrica(etiqueta, muta) {
  const m = JSON.parse(JSON.stringify(real));
  muta(m);
  const destino = `medidas/manifiesto-neg-${etiqueta}-entrada.json`;
  w(destino, m, { pisar: true });
  return destino;
}

/* ── La diana de `familia-vacia` se DERIVA, no se escribe ───────────────────
 * Una familia cableada a `/faqs/[slug]` deja de existir el día que esa ruta
 * cambie de nombre, y entonces el sabotaje no muta nada: sale verde y se lee
 * como «la sonda lo cazó». Se elige la primera familia dinámica que hoy emite
 * rutas, y si no hay ninguna el negativo sale por ERROR. */
const familiaDeAlguna = Object.keys(real.dynamicRoutes || {}).find((f) =>
  Object.values(real.routes || {}).some((v) => v.srcRoute === f),
);
if (!familiaDeAlguna) {
  console.error(
    `\n❌ SIN DIANA — el build no tiene ninguna familia dinámica con rutas emitidas.\n` +
      `   El sabotaje 'familia-vacia' no llegaría a existir, y «no encontré dónde\n` +
      `   sabotear» y «saboteé y la sonda lo cazó» dan la misma salida.`,
  );
  process.exit(2);
}
/* Y la de `una-menos` tiene que dejar la familia VIVA (≥1 ruta), o encendería
 * también la #1 y el sabotaje dejaría de aislar la #2. */
const conVarias = Object.entries(
  Object.values(real.routes || {}).reduce((a, v) => ((a[v.srcRoute] = (a[v.srcRoute] || 0) + 1), a), {}),
).find(([f, n]) => n > 1 && !f.startsWith("/_"));
if (!conVarias) {
  console.error(`\n❌ SIN DIANA — ninguna familia emite más de una ruta: 'una-menos' encendería la #1 también.`);
  process.exit(2);
}
const [famVarias] = conVarias;
const rutaSuelta = Object.entries(real.routes).find(([, v]) => v.srcRoute === famVarias)[0];

const casos = [
  {
    etiqueta: "familia-vacia",
    args: ["--sin-base"],
    exit: 1,
    porQue: `la familia ${familiaDeAlguna} emite 0 y sigue declarada ⇒ la #1 la caza SIN base`,
    entrada: () =>
      fabrica("familia-vacia", (m) => {
        for (const [r, v] of Object.entries(m.routes)) if (v.srcRoute === familiaDeAlguna) delete m.routes[r];
      }),
    salidaTiene: /NO EMITIERON NINGUNA RUTA/,
    comprueba: (d) =>
      d.vacias?.includes(familiaDeAlguna) ? null : `esperaba ${familiaDeAlguna} en vacias, salió ${JSON.stringify(d.vacias)}`,
  },
  {
    etiqueta: "una-menos",
    args: ["--cmp", BASE],
    exit: 1,
    porQue: `falta ${rutaSuelta} y su familia sigue viva ⇒ sólo la #2 puede verlo`,
    entrada: () => fabrica("una-menos", (m) => delete m.routes[rutaSuelta]),
    salidaTiene: /DESAPARECIDAS del build/,
    comprueba: (d) =>
      d.desaparecidas?.length === 1 && d.desaparecidas[0] === rutaSuelta && d.vacias?.length === 0
        ? null
        : `esperaba 1 desaparecida (${rutaSuelta}) y 0 vacías; salió ` +
          `${JSON.stringify(d.desaparecidas)} / ${JSON.stringify(d.vacias)}`,
  },
  {
    etiqueta: "vacio",
    args: ["--cmp", BASE],
    exit: 1,
    porQue: "0 rutas emitidas ⇒ el contrato de Evaluadas grita NO SE PUDO EVALUAR",
    entrada: () => fabrica("vacio", (m) => (m.routes = {})),
    salidaTiene: /NO SE PUDO EVALUAR/,
    comprueba: (d) =>
      d.rutas?.length === 0 && d.desaparecidas?.length === RUTAS.length
        ? null
        : `esperaba 0 rutas y ${RUTAS.length} desaparecidas; salió ${d.rutas?.length} / ${d.desaparecidas?.length}`,
  },
  {
    etiqueta: "ausente",
    args: ["--cmp", BASE],
    exit: 2,
    porQue: "el manifiesto no existe ⇒ ERROR, no «cero rutas»",
    entrada: () => "medidas/manifiesto-neg-ausente-NO-EXISTE.json",
    salidaTiene: /NO HAY ARTEFACTO QUE AUDITAR/,
    sinArtefacto: true,
  },
  {
    etiqueta: "base-vacia",
    args: ["--cmp", "medidas/manifiesto-neg-base-vacia-entrada.json"],
    exit: 2,
    porQue: "la BASE no declara rutas ⇒ «no falta ninguna» sería cierto por vacío",
    entrada: () => {
      w("medidas/manifiesto-neg-base-vacia-entrada.json", { meta: {}, rutas: [] }, { pisar: true });
      return null; // usa el manifiesto real; lo saboteado es la base
    },
    salidaTiene: /no declara rutas/,
    sinArtefacto: true,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · manifiesto ════════\n`);
console.log(`  build real: ${RUTAS.length} rutas · diana vacía: ${familiaDeAlguna} · diana suelta: ${rutaSuelta}\n`);

const ev = new Evaluadas({ nombre: "manifiesto-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const ficheroDe = (etiqueta) => join(QA, nombreNeg("medidas/manifiesto.json", etiqueta));
const borra = (etiqueta) => { const f = ficheroDe(etiqueta); if (existsSync(f)) rmSync(f); };
const lee = (etiqueta) => { const f = ficheroDe(etiqueta); return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null; };

for (const c of casos) {
  borra(c.etiqueta);
  const entrada = c.entrada();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "manifiesto.mjs"), ...c.args],
    env: entrada ? { MANIFIESTO: entrada } : {},
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = lee(c.etiqueta);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }
  if (!mal && c.sinArtefacto && lee(c.etiqueta))
    mal = "congeló un artefacto habiendo salido por error: una medida que no se pudo tomar no se guarda";

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
borra("control");
const ctl = corridaNegativa({ etiqueta: "control", args: [join(QA, "manifiesto.mjs"), "--cmp", BASE] });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sobre el build real tiene que salir 0`;
else {
  const d = lee("control");
  if (!d) malCtl = "no congeló su medida";
  else if (d.vacias?.length || d.desaparecidas?.length) malCtl = `vacías=${d.vacias?.length} desaparecidas=${d.desaparecidas?.length}`;
  else if (d.rutas?.length !== RUTAS.length) malCtl = `midió ${d.rutas?.length} rutas, el build tiene ${RUTAS.length}`;
  else if (!/✓ las \d+ familias dinámicas declaradas emitieron rutas/.test(ctlOut)) malCtl = "sin la línea de familias";
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL          ${malCtl}`); }
else console.log(`  ✓  CONTROL          exit 0 sobre el build real · ${RUTAS.length} rutas · 0 vacías · 0 desaparecidas`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} manifiesto · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Las dos comprobaciones se disparan por separado, el contrato grita con 0 rutas,\n` +
        `   y las dos formas de «cero por vaciado» —sin manifiesto, sin base— salen por error.\n`
      : `   La guarda del entorno NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
