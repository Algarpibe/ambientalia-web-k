/**
 * TEST EN NEGATIVO de `media-colision` — entero, cada sabotaje por SU
 * invariante, **y con control**.
 * Uso: npm run qa:media-colision-neg
 *
 * ── Por qué éste importa más de lo normal ─────────────────────────────────
 * Esta sonda no informa: **decide si CMS-0g toca el esquema**. Y decide por la
 * NEGATIVA —«no colisionan, luego no hace falta campo»—, que es la forma de
 * conclusión que la regla del cero convierte en verde falso: *no encontrar
 * colisiones* y *no mirar* dan exactamente la misma salida. Un campo de más en
 * `media` es caro de quitar (§CMS-0f, la asimetría de deshacer); un campo de
 * menos es peor, porque se descubre con contenido dentro.
 *
 * ── Los seis casos, y el que tiene que salir VERDE ────────────────────────
 * `variante-pisa-origen` es el que hace honesto todo lo demás: la sonda cuenta
 * ese hallazgo y **no cierra el código de salida con él**, a propósito, porque
 * contesta otra pregunta (bytes, no la tabla). Si ese caso saliera rojo, los
 * dos veredictos serían uno solo y C estaría decidiendo CMS-0g de tapadillo.
 * Es el mismo papel que `solo-reparto` en `html-cmp`.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "colision-inventada",
    exit: 2,
    porQue: "entra al dominio el par homónimo REAL de public/images ⇒ la tabla deja de ser función",
    comprueba: (d) =>
      d.poblaciones?.dominio?.basenamesRepetidos > 0 && d.veredicto?.funcionHoy === false
        ? d.comprobaciones?.filenameEsBasename?.ok && d.comprobaciones?.dominioBajoPublico?.ok
          ? null
          : "cayó también por B o por D: el sabotaje tiene que caer por SU invariante (A) y sólo por él"
        : `esperaba repetidos>0 y funcionHoy=false; salió ${d.poblaciones?.dominio?.basenamesRepetidos} / ${d.veredicto?.funcionHoy}`,
  },
  {
    sabotaje: "filename-renombrado",
    exit: 2,
    porQue: "se simula que Payload saneó un nombre ⇒ `filename` deja de ser el basename y la tabla no se puede teclear",
    comprueba: (d) =>
      d.comprobaciones?.filenameEsBasename?.ok === false && d.poblaciones?.dominio?.basenamesRepetidos === 0
        ? null
        : `esperaba B en falso con A limpia; salió B=${d.comprobaciones?.filenameEsBasename?.ok} / A=${d.poblaciones?.dominio?.basenamesRepetidos}`,
  },
  {
    sabotaje: "variante-pisa-origen",
    exit: 0, // ← EL CASO QUE TIENE QUE SALIR VERDE
    porQue: "un origen con forma de variante generable: se CUENTA y NO cierra el código — contesta otra pregunta (bytes, no la tabla)",
    comprueba: (d, ctl) =>
      d.comprobaciones?.variantePisaOrigen?.n > ctl.comprobaciones?.variantePisaOrigen?.n
        ? d.veredicto?.funcionHoy === true
          ? null
          : "el hallazgo tumbó `funcionHoy`: entonces C SÍ estaría decidiendo CMS-0g"
        : `esperaba MÁS pisadas que el control (${ctl.comprobaciones?.variantePisaOrigen?.n}); salió ${d.comprobaciones?.variantePisaOrigen?.n}`,
  },
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "el walker recorre 0 campos ⇒ dominio VACÍO, y eso sale por ERROR, nunca por «no hay colisiones» (regla 4)",
    comprueba: (d) =>
      d.poblaciones?.dominio?.rutas === 0 && d.comprobaciones?.filenameEsBasename?.ok === false
        ? null
        : `esperaba dominio vacío Y B en falso (un dominio vacío no puede dar B verde); salió ${d.poblaciones?.dominio?.rutas} / ${d.comprobaciones?.filenameEsBasename?.ok}`,
  },
  {
    sabotaje: "sin-corpus",
    exit: 2,
    porQue: "el índice de media-corpus se lee de un sitio que no existe ⇒ 0 capturados, y un `?? {}` lo habría leído como «sin colisiones»",
    comprueba: (d) =>
      d.poblaciones?.corpus?.rutas === 0 && d.poblaciones?.dominio?.rutas > 0
        ? null
        : `esperaba corpus vacío con dominio intacto; salió ${d.poblaciones?.corpus?.rutas} / ${d.poblaciones?.dominio?.rutas}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-colision ════════\n`);
console.log(`  ${casos.length} sabotajes contra la decisión de CMS-0g + control`);
console.log(`  (uno de ellos, \`variante-pisa-origen\`, tiene que salir VERDE)\n`);

const ev = new Evaluadas({ nombre: "media-colision-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "media-colision.mjs")], env, timeout: 900_000 });
const fich = (e) => join(QA, nombreNeg("medidas/media-colision.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);
const borra = (e) => { if (existsSync(fich(e))) rmSync(fich(e)); };

/* EL CONTROL VA PRIMERO: `variante-pisa-origen` se compara CONTRA él, y sin
 * control ese sabotaje no significa nada (regla 8a). */
borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.veredicto?.funcionHoy !== true) malCtl = "funcionHoy ≠ true: sin eso no hay línea base contra la que leer los sabotajes";
else if (!(dCtl.poblaciones?.dominio?.rutas > 0)) malCtl = "dominio vacío en el control";
else if (!(dCtl.poblaciones?.corpus?.rutas > 0)) malCtl = "corpus vacío en el control";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)  (${segCtl}s)  ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL      (sin sabotaje)  (${segCtl}s)  exit 0 · dominio ${dCtl.poblaciones.dominio.rutas} · ` +
      `corpus ${dCtl.poblaciones.corpus.rutas} · función HOY sí`,
  );

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
  `\n${fallos === 0 ? "✅" : "❌"} media-colision · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} sabotajes · control)\n` +
    (fallos === 0
      ? `   La sonda se acusa cuando el dominio colisiona, cuando el \`filename\` deja de\n` +
        `   ser el basename, cuando no mira nada y cuando pierde una población. Y NO se\n` +
        `   acusa por la pisada de variante, que se cuenta aparte a propósito.\n` +
        `   El «no hace falta campo» ya se puede citar — con su alcance: HOY.\n`
      : `   No se decide CMS-0g hasta que esto salga verde: un campo de menos se\n` +
        `   descubre con contenido dentro, y ésa es la dirección cara.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
