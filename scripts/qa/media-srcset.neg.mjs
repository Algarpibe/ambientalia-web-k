/**
 * TEST EN NEGATIVO de `media-srcset` — entero, cada sabotaje por SU invariante,
 * **y con control**.
 * Uso: npm run qa:media-srcset-neg
 *
 * Esta sonda produce el veredicto que decide la forma del bloque 3 de F2-2:
 * *«un juego FIJO de image sizes es NECESARIO y NO SUFICIENTE»*. Un veredicto
 * así sólo vale si la sonda **sabe salir del otro lado**, y las dos mitades
 * pueden falsearse por sitios distintos:
 *
 *   · `selector-muerto` — si el atributo se buscara por un nombre que no existe,
 *     la sonda no encontraría un solo `srcset` y **eso se leería como «no hay
 *     variantes»**. Tiene que salir por ERROR (regla 4, el cero);
 *   · `sin-marcado` — si no se quitaran `<script>`/`<style>`, el patrón del
 *     cuerpo se sobre-casaría (el JS de Divi lleva plantillas de `srcset`) y
 *     pasaría de su máximo derivado. Tiene que salir por ERROR (regla 4, el
 *     pleno);
 *   · `un-solo-uso` — es el sabotaje del HALLAZGO. Pliega las firmas por origen,
 *     que es exactamente el defecto que haría invisible la varianza por punto de
 *     uso, y entonces el veredicto **voltea a SUFICIENTE**. Si no voltea, el
 *     «NO SUFICIENTE» del control no significa nada: significaría que la sonda
 *     lo dice siempre;
 *   · `sin-cajas` — agrupa por ANCHO en vez de por CAJA. Aparecen formas que
 *     ninguna caja explica ⇒ `generaLosFicheros: false`. Es la mitad contraria:
 *     prueba que el «SÍ genera los ficheros» tampoco es una constante;
 *   · `sin-cascaron` — cuenta el cuerpo y el cascarón juntos. El reparto que
 *     dice qué tamaños necesita el CMS se infla, y las cajas que hoy están a
 *     **0 en cuerpo** (`caja150` · `caja300` · `caja600`, la única que recorta)
 *     pasan a contar. Es la lectura de `googletagmanager` aplicada al media.
 *
 * Y el **CONTROL**, que es la mitad que decide si los cinco significan algo
 * (F2-1 §5): sin sabotaje, exit 0, veredicto `NECESARIO y NO SUFICIENTE`, y las
 * tres cajas de sólo-cascarón a 0 en cuerpo.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "atributo buscado por un nombre inexistente ⇒ PATRÓN MUERTO, nunca «no hay variantes»",
    salidaTiene: /PATRÓN\(ES\) MUERTO\(S\)/,
  },
  {
    sabotaje: "sobre-casado",
    exit: 2,
    porQue: "`sizes` sin exigir <img>/<source> ⇒ casa sobre <link rel=icon sizes=\"32x32\">",
    salidaTiene: /PATRÓN SOBRE-CASADO/,
  },
  {
    sabotaje: "un-solo-uso",
    exit: 0,
    porQue: "firmas plegadas ⇒ la varianza por punto de uso desaparece y el veredicto VOLTEA",
    comprueba: (d) =>
      d.veredicto?.esFuncionDeLaImagen === true && d.porPuntoDeUso?.origenesConVariasFirmas === 0
        ? null
        : `esperaba esFuncionDeLaImagen=true y 0 orígenes con varias firmas; salió ` +
          `${d.veredicto?.esFuncionDeLaImagen} / ${d.porPuntoDeUso?.origenesConVariasFirmas}`,
  },
  {
    sabotaje: "sin-cajas",
    exit: 2,
    porQue: "agrupado por ancho ⇒ formas que ninguna caja explica, y NO genera los ficheros",
    salidaTiene: /forma\(s\) WxH que ninguna caja explica/,
    comprueba: (d) =>
      d.veredicto?.generaLosFicheros === false ? null : `esperaba generaLosFicheros=false, salió ${d.veredicto?.generaLosFicheros}`,
  },
  {
    sabotaje: "sin-cascaron",
    exit: 0,
    porQue: "cuerpo y cascarón juntos ⇒ el reparto se infla y las cajas de sólo-cascarón pasan a contar",
    comprueba: (d) => {
      const soloCascaron = ["caja150", "caja300", "caja600"];
      const contaminadas = soloCascaron.filter((k) => (d.cajas?.[k]?.cuerpo ?? 0) > 0);
      return contaminadas.length === soloCascaron.length
        ? null
        : `esperaba las ${soloCascaron.length} cajas de sólo-cascarón con cuerpo>0; sólo ${contaminadas.length} (${contaminadas.join(" ") || "ninguna"})`;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-srcset ════════\n`);

const ev = new Evaluadas({ nombre: "media-srcset-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* Todo por `corridaNegativa`: el desvío a `-neg-` lo pone NEG por construcción,
 * y borra `PISAR`/`SALIDA` del hijo. Una corrida negativa NO PUEDE pisar la
 * canónica (regla 5, cerrada en el sitio común). */
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "media-srcset.mjs")], env, timeout: 900_000 });

const leeArtefacto = (etiqueta) => {
  const f = join(QA, nombreNeg("medidas/media-srcset.json", etiqueta));
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};
const borraArtefacto = (etiqueta) => {
  const f = join(QA, nombreNeg("medidas/media-srcset.json", etiqueta));
  if (existsSync(f)) rmSync(f);
};

for (const c of casos) {
  borraArtefacto(c.sabotaje);
  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = leeArtefacto(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
borraArtefacto("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!/NECESARIO y NO SUFICIENTE/.test(ctlOut)) malCtl = "sin la línea del veredicto";
else {
  const d = leeArtefacto("control");
  if (!d) malCtl = "no congeló su medida";
  else if (d.veredicto?.generaLosFicheros !== true) malCtl = "generaLosFicheros ≠ true";
  else if (d.veredicto?.esFuncionDeLaImagen !== false) malCtl = "esFuncionDeLaImagen ≠ false";
  else {
    const conCuerpo = ["caja150", "caja300", "caja600"].filter((k) => (d.cajas?.[k]?.cuerpo ?? 0) > 0);
    if (conCuerpo.length) malCtl = `caja(s) de sólo-cascarón con cuerpo>0: ${conCuerpo.join(" ")}`;
  }
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL         (sin sabotaje) (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL         (sin sabotaje) (${segCtl}s)  exit 0 · NECESARIO y NO SUFICIENTE · cascarón separado`);

/* ══════════════════════════════════════════════════════════════════════════
 * LA DIANA PERDIDA — `sin-marcado`, verificada como tal y no escondida
 *
 * La regla del markup («se busca sobre el HTML sin `<script>` ni `<style>`»)
 * está PUESTA en la sonda y es correcta. Lo que este negativo mide es otra
 * cosa: **si quitarla cambia algo en ESTE corpus**. No lo cambia — las 309
 * páginas no traen un solo `<img … srcset>` dentro de `<script>` o `<style>`,
 * así que la salida sale **byte a byte idéntica**.
 *
 * > **Un sabotaje que no cambia el resultado no ha probado la guarda: ha
 * > probado que el instrumento ya no la ejercita** (regla 8a). Y no da rojo:
 * > da exit 0, que es como los 3 sabotajes de `sondeo` vivieron una tanda
 * > entera en verde falso.
 *
 * Por eso NO se cuenta entre los que cazan y NO se borra: se verifica como
 * diana perdida, con el precedente del punto ciego de `cms-roundtrip`. La
 * prueba de que no hay diana es la IGUALDAD BYTE A BYTE con el control — no
 * «salió 0», que es exactamente lo que no distingue las dos cosas. El día que
 * el corpus traiga un `srcset` dentro de un `<script>`, esto sale ROJO y pide
 * devolver el sabotaje a la tabla de los que cazan.
 * ═════════════════════════════════════════════════════════════════════════ */
borraArtefacto("sin-marcado");
const tDp = Date.now();
const dp = corre("sin-marcado", { SABOTAJE: "sin-marcado" });
const segDp = ((Date.now() - tDp) / 1000).toFixed(0);
const aCtl = leeArtefacto("control");
const aDp = leeArtefacto("sin-marcado");
let malDp = null;
if (dp.status !== 0) malDp = `exit ${dp.status} — la diana perdida tiene que seguir sin morder`;
else if (!aDp || !aCtl) malDp = "falta uno de los dos artefactos para comparar";
else {
  const norm = (d) => JSON.stringify({ ...d, meta: { ...d.meta, sabotaje: null } });
  if (norm(aDp) !== norm(aCtl))
    malDp =
      "⚠ LA DIANA VOLVIÓ: quitar el filtro de <script>/<style> YA cambia la medida. " +
      "Devuelve `sin-marcado` a la tabla de los que cazan y dale su aserción.";
}
if (malDp) { fallos++; console.log(`  ❌ DIANA PERDIDA=sin-marcado   (${segDp}s)  ${malDp}`); }
else console.log(`  ✓  DIANA PERDIDA=sin-marcado   (${segDp}s)  sigue sin morder: salida IDÉNTICA al control (0 srcset dentro de script/style)`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-srcset · test en negativo: ${casos.length + 2 - fallos}/${casos.length + 2}` +
    `  (${casos.length} que cazan · 1 diana perdida verificada · control)\n` +
    (fallos === 0
      ? `   La sonda sabe gritar cuando su patrón no casa y cuando se sobre-casa, y su\n` +
        `   veredicto VOLTEA en los dos sentidos. El «NECESARIO y NO SUFICIENTE» del\n` +
        `   control ya se puede citar: no es una constante de la sonda.\n`
      : `   El contrato del \`srcset\` NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
