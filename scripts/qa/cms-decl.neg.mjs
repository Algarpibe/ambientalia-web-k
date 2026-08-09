/**
 * TEST EN NEGATIVO de `cms-decl` — entero, cada sabotaje por SU invariante,
 * **y con control**.
 * Uso: npm run qa:cms-decl-neg
 *
 * ── Qué se está probando, y por qué no basta con que la guarda exista ─────
 * `cms-decl` es la guarda de CMS-0g: comprueba que lo que la config DECLARA
 * para la vuelta coincide con lo que la IDA deriva del dato medido. Una guarda
 * así falla en la dirección peligrosa —dando VERDE— por dos caminos distintos,
 * y los dos hay que ejercitarlos:
 *
 *   · **no cuadra y no se entera** — los cuatro sabotajes de declaración;
 *   · **no mira nada y lo cuenta como que cuadra** — `selector-muerto`, la
 *     regla del cero, que aquí tiene que caer por el CONTRATO (`Evaluadas`) y
 *     no por «0 huecos».
 *
 * Los sabotajes de declaración **no inventan una situación**: borran un `custom`
 * exactamente como se lo llevaría un refactor por delante, que es el modo de
 * fallo real del que la guarda protege.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-forma-de-rel",
    exit: 2,
    porQue: "se cae un `formaMedida: \"objeto\"` ⇒ el render devolvería el slug donde el dato medido tiene el término entero",
    comprueba: (d) =>
      d.veredicto?.huecos?.some((h) => h.tipo === "formaDeRel") && !d.veredicto?.muertas?.length
        ? null
        : `esperaba un hueco de formaDeRel y 0 muertas; salió ${JSON.stringify(d.veredicto?.huecos?.map((h) => h.tipo))} / ${d.veredicto?.muertas?.length}`,
  },
  {
    sabotaje: "sin-con-kind",
    exit: 2,
    porQue: "se cae un `conKind` ⇒ la vuelta perdería el `kind` de todos los módulos de ese campo",
    comprueba: (d) =>
      d.veredicto?.huecos?.some((h) => h.tipo === "conKind")
        ? null
        : `esperaba huecos de conKind; salió ${JSON.stringify(d.veredicto?.huecos?.map((h) => h.tipo))}`,
  },
  {
    sabotaje: "sin-centinela",
    exit: 2,
    porQue: "se cae el `centinelaVacio` ⇒ el `\"\"` de «no hay imagen» volvería como clave ausente",
    comprueba: (d) =>
      d.veredicto?.huecos?.some((h) => h.tipo === "centinelaVacio")
        ? null
        : `esperaba un hueco de centinelaVacio; salió ${JSON.stringify(d.veredicto?.huecos?.map((h) => h.tipo))}`,
  },
  {
    sabotaje: "sin-vacia-es-ausente",
    exit: 2,
    porQue: "se cae un `vaciaEsAusente` ⇒ la vuelta emitiría `[]` donde el dato medido no tiene la clave",
    comprueba: (d) =>
      d.veredicto?.huecos?.some((h) => h.tipo === "vaciaEsAusente")
        ? null
        : `esperaba un hueco de vaciaEsAusente; salió ${JSON.stringify(d.veredicto?.huecos?.map((h) => h.tipo))}`,
  },
  {
    /* ⚠ **Éste es EL ESCALÓN**, reproducido como sabotaje: declarar omitible una
     * lista que el dato medido trae SIEMPRE hace que la vuelta devuelva
     * `undefined` donde el tipo promete un array — que es exactamente lo que
     * mató el build de la prueba final de F2-5 con `undefined.length`. La otra
     * mitad (`sin-vacia-es-ausente`) la cazaría además el round-trip; **ésta
     * sólo la caza esta guarda**, y por eso la mitad de las «muertas» no es
     * simétrica de la de los «huecos». */
    sabotaje: "vacia-es-ausente-muerta",
    exit: 2,
    porQue: "se declara omitible una lista SIEMPRE presente ⇒ el render devolvería `undefined` donde el tipo promete un array (§F2-5-ESCALON-ETIQUETAS)",
    comprueba: (d) =>
      d.veredicto?.muertas?.some((m) => m.tipo === "vaciaEsAusente") && !d.veredicto?.huecos?.length
        ? null
        : `esperaba 1 muerta de vaciaEsAusente y 0 huecos; salió ${JSON.stringify(d.veredicto?.muertas?.map((m) => m.tipo))} / ${d.veredicto?.huecos?.length}`,
  },
  {
    sabotaje: "declaracion-muerta",
    exit: 2,
    porQue: "una declaración que la ida no ve NUNCA — la otra dirección, sin la cual las declaraciones se pudren y tapan huecos futuros",
    comprueba: (d) =>
      d.veredicto?.muertas?.length === 1 && !d.veredicto?.huecos?.length
        ? null
        : `esperaba 1 muerta y 0 huecos; salió ${d.veredicto?.muertas?.length} / ${d.veredicto?.huecos?.length}`,
  },
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "la ida no deriva nada ⇒ tiene que caer por el CONTRATO, no por «0 huecos» (regla 4)",
    comprueba: (d) =>
      d.contrato?.suficiente === false && d.veredicto?.verificadas === 0
        ? null
        : `esperaba contrato insuficiente con 0 verificadas; salió suficiente=${d.contrato?.suficiente} / ${d.veredicto?.verificadas}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-decl ════════\n`);
console.log(`  ${casos.length} sabotajes contra la guarda de CMS-0g + control\n`);

const ev = new Evaluadas({ nombre: "cms-decl-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "cms-decl.mjs")], env, timeout: 900_000 });
const fich = (e) => join(QA, nombreNeg("medidas/cms-decl.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);
const borra = (e) => { if (existsSync(fich(e))) rmSync(fich(e)); };

borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.veredicto?.ok !== true) malCtl = "veredicto.ok ≠ true";
else if (!(dCtl.veredicto?.verificadas > 0)) malCtl = "0 verificadas: la guarda no habría mirado nada";
else if (!dCtl.contrato?.suficiente) malCtl = "el contrato no se cumple en el control";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)  (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL      (sin sabotaje)  (${segCtl}s)  exit 0 · ${dCtl.veredicto.verificadas} rutas verificadas · 0 huecos · 0 muertas`);

for (const c of casos) {
  borra(c.sabotaje);
  const t = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const seg = ((Date.now() - t) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.comprueba) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d, dCtl ?? {}) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(20)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(20)} (${seg}s)  ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-decl · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} sabotajes · control)\n` +
    (fallos === 0
      ? `   La guarda se acusa cuando una declaración se cae, cuando sobra, y cuando no\n` +
        `   mira nada. Las declaraciones de la vuelta ya se pueden citar como CONECTADAS.\n`
      : `   Sin esto, el \`custom\` de la config es un comentario: el render proyecta mal y\n` +
        `   sólo se ve si mueve píxeles.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
