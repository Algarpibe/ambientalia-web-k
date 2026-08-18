/* ⚠ 2026-08-18 (83.ª) · POR QUÉ ESTE NEGATIVO ESTÁ EN 2/5 Y NO EN 5/5.
 *
 * Se arreglaron las DOS averías del instrumento y quedan 3 casos rojos por
 * UNA SOLA causa, que no es del negativo sino un hallazgo de la sonda:
 *
 *  1 · [ARREGLADO] la sonda moría entera en `sharp`: «Input file is missing»
 *      sobre un fichero que SÍ existe. Es el MAX_PATH de Windows —libvips no
 *      usa la API de rutas largas—, y son **3 de 2 707** ficheros de
 *      `apps/web/public` con ruta ≥ 260 chars. Ahora se anotan y se publican
 *      con su cardinal, fuera del denominador (§regla 14);
 *
 *  2 · [FICHADO §MEDIA-REGENERA-SUBIDOS-RECODIFICADOS] el CONTROL interno de
 *      la sonda sale **324/335**: 11 ficheros «comparados consigo mismos» no
 *      dan sha256 idéntico. Medido: los 11 son `-600x600.webp`, los 11 pesan
 *      MÁS en `apps/web/public` que en `media/` (+2…+4 %), y los 11 están
 *      bien clasificados como SUBIDOS —`media/` guarda `X-600x600.webp` como
 *      fuente, con sus `-300x300` y `-480x480` derivadas de él—. O sea que no
 *      es la clasificación: es que el fichero servido **no conserva los bytes
 *      del fuente**, que es una re-codificación en la cadena de colocación.
 *
 * Los 3 casos rojos (`CONTROL`, `sobre-casado`, `sin-cascaron`) esperan exit 0
 * y la sonda sale 2 por (2). **No se cablea `exit: 2`**: eso escribiría el
 * defecto en la guarda. Se dejan rojos hasta que (2) se resuelva en su tanda.
 */
/**
 * TEST EN NEGATIVO de `media-regenera` — entero, cada sabotaje por SU
 * invariante, **y con control**.
 * Uso: npm run qa:media-regenera-neg
 *
 * Esta sonda decide **cuántos ficheros se le piden al sitio vivo** (537 en vez
 * de 1 571) y **qué se da por regenerable**. Los dos son irreversibles en la
 * práctica —lo que no se capture hoy no está—, así que el veredicto tiene que
 * saber salir del otro lado:
 *
 *   · `sin-poblaciones` — GENERADAS y SUBIDAS en el mismo cubo. Los SUBIDOS son
 *     ficheros comparados **consigo mismos**, así que el `sha256 idéntico` se
 *     infla y la conclusión «el pipeline no reproduce los bytes» se ablanda.
 *     **Es el defecto REAL de la primera corrida** (38 de 111);
 *   · `selector-muerto` — las URLs se buscan por un prefijo que no existe ⇒ 0
 *     pares y 0 lista de captura. Tiene que salir por ERROR (regla 4, el cero);
 *   · `sobre-casado` — el patrón de URL no excluye `<` ⇒ captura `…mp4</a` y
 *     fabrica orígenes inexistentes (regla 4, tercera cara). **También real**:
 *     la primera versión contaba 5 de más;
 *   · `sin-cascaron` — no se separa el cuerpo ⇒ la lista de captura se infla
 *     con los thumbs del cascarón, que es exactamente el gasto que la sonda
 *     existe para evitar.
 *
 * Y el **CONTROL**: sin sabotaje, exit 0, dimensiones 73/73, bytes 0/73 y el
 * control de subidos al 100 %.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-poblaciones",
    exit: 2,
    porQue: "GENERADAS y SUBIDAS juntas ⇒ el control se queda vacío y la sonda se acusa (defecto real de la 1.ª corrida)",
    comprueba: (d) =>
      d.reproduccion?.control_subidas?.n === 0 && d.reproduccion?.generadas?.shaIdentico > 0
        ? null
        : `esperaba el control vacío y sha>0 en generadas; salió n=${d.reproduccion?.control_subidas?.n} / sha=${d.reproduccion?.generadas?.shaIdentico}`,
  },
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "prefijo de URL inexistente ⇒ 0 orígenes y lista de captura VACÍA, nunca «ya está todo»",
    comprueba: (d) => (d.poblaciones?.origenesEnCuerpo === 0 ? null : `esperaba 0 orígenes, salió ${d.poblaciones?.origenesEnCuerpo}`),
  },
  {
    sabotaje: "sobre-casado",
    exit: 0,
    porQue: "el patrón sin `<` fabrica orígenes que no existen (`mp4</a`) ⇒ la lista de captura crece",
    comprueba: (d, ctl) =>
      d.poblaciones?.aCapturar > ctl.poblaciones?.aCapturar
        ? null
        : `esperaba MÁS a capturar que el control (${ctl.poblaciones?.aCapturar}); salió ${d.poblaciones?.aCapturar}`,
  },
  {
    sabotaje: "sin-cascaron",
    exit: 0,
    porQue: "sin separar el cuerpo, la lista se infla con los thumbs del cascarón — el gasto que la sonda evita",
    comprueba: (d, ctl) =>
      d.poblaciones?.aCapturar > ctl.poblaciones?.aCapturar * 1.5
        ? null
        : `esperaba una lista MUY superior a la del control (${ctl.poblaciones?.aCapturar}); salió ${d.poblaciones?.aCapturar}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-regenera ════════\n`);
console.log(`  ${casos.length} sabotajes contra la decisión de QUÉ capturar + control\n`);

const ev = new Evaluadas({ nombre: "media-regenera-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "media-regenera.mjs")], env, timeout: 900_000 });
const fich = (e) => join(QA, nombreNeg("medidas/media-regenera.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);
const borra = (e) => { if (existsSync(fich(e))) rmSync(fich(e)); };

/* EL CONTROL VA PRIMERO: dos sabotajes se comparan CONTRA él, así que sin
 * control no hay con qué contrastarlos (F2-1 §5, el control es la mitad que
 * decide si los demás significan algo). */
borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.veredicto?.reproduceDimension !== true) malCtl = "reproduceDimension ≠ true";
else if (dCtl.veredicto?.reproduceBytes !== false) malCtl = "reproduceBytes ≠ false — si los bytes coincidieran, la separación de poblaciones estaría mal";
else if (dCtl.veredicto?.controlOk !== true) malCtl = "el control de SUBIDOS no da 100 % de identidad";
else if (!(dCtl.poblaciones?.aCapturar > 0)) malCtl = "lista de captura vacía: no habría nada que decidir";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)  (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL      (sin sabotaje)  (${segCtl}s)  exit 0 · dimensión SÍ · bytes NO · control 100 % · ${dCtl.poblaciones.aCapturar} a capturar`);

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
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(16)} (${seg}s)  ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-regenera · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} que cazan · control)\n` +
    (fallos === 0
      ? `   La sonda se acusa cuando mezcla las dos poblaciones de media/, cuando su\n` +
        `   patrón no casa y cuando se sobre-casa. El «bastan los orígenes» y el tamaño\n` +
        `   de la lista de captura ya se pueden citar.\n`
      : `   NO se captura nada hasta que esto salga verde: lo que no se capture hoy\n` +
        `   no está, y la lista la decide esta sonda.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
