/**
 * TEST EN NEGATIVO de `hover-zonal` — ENTERO, y cada sabotaje por SU
 * invariante.  Uso: npm run qa:hover-zonal-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ TIENE QUE PROBAR, Y POR QUÉ «SALIÓ ROJO» NO BASTA
 *
 * Esta sonda contesta una pregunta cuyo error natural es un CERO: *«no hay
 * regla de zoom»* y *«no miré donde está la regla»* se escriben igual, y en este
 * caso concreto ya se sabe dónde está la trampa —el CSS de los listados es
 * **externo**, así que leer sólo los `<style>` da cero (§F3-1-CSS-NO-CAPTURADO:
 * 19 hojas, 0 capturadas). Un negativo que sólo mirara códigos de salida no
 * distinguiría las tres formas de equivocarse:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `patron-falso` | **patrón MUERTO** — la propiedad buscada no existe | el sitio: las reglas están, el filtro no |
 * | `tope` | **patrón UBICUO** — el máximo declarado a 0 | el cero: hay reglas de sobra |
 * | `sin-hojas` | **EFECTO SIN REGLA** — a UNA forma se le ciegan las hojas | MUERTO: las otras ocho siguen encontrando reglas |
 *
 * `sin-hojas` es el que prueba el cruce de instrumentos, que es la razón de ser
 * de la sonda: con la forma cegada, el zoom que `qa:comportamiento` **midió**
 * se queda sin regla que lo explique, y eso tiene que salir rojo en vez de
 * publicarse como *«esta forma no tiene regla de hover»*.
 *
 * ── Y EL CONTROL, sin el cual esto no prueba nada (§sondas, regla 8a) ──────
 * La primera fila **no sabotea nada** y tiene que salir verde, con el cruce
 * cerrado y al menos una forma con zoom explicado. Un sabotaje que no cambia el
 * resultado no ha probado la guarda: ha probado que el instrumento no la
 * ejercita.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/hover-zonal.json";

/** Las formas cuyo zoom midió el OTRO instrumento: son las que el cruce interroga. */
const conZoom = (j) => Object.entries(j.formas).filter(([, v]) => (v.zoomMedidoPorComportamiento || []).length);

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: las hojas externas se piden, las reglas aparecen y el cruce cierra",
    env: {},
    exit: 0,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "LEÍDO") return `el CONTROL salió «${j.resumen.veredicto}» — con el control roto, los tres rojos de abajo no prueban nada`;
      if (!j.resumen.reglasHoverConTransform) return "0 reglas `:hover` con `transform`: el control no ejercita el patrón";
      const cz = conZoom(j);
      if (!cz.length) return "ninguna forma trae zoom medido: el cruce no se ejercita y `sin-hojas` no tendría a quién cegar";
      const sinCruzar = cz.filter(([, v]) => (v.cruce || []).some((c) => !c.reglas.length));
      if (sinCruzar.length) return `${sinCruzar.length} forma(s) con zoom medido y sin regla en el CONTROL: ${sinCruzar.map(([f]) => f).join(", ")}`;
      /* La mitad que hace útil a la sonda: que el disparador tenga NOMBRE. Un
       * cruce que cerrara con el selector vacío no contestaría la pregunta. */
      const [, v] = cz[0];
      if (!v.disparadores?.length) return "el cruce cerró pero no hay ni un disparador nombrado: la pregunta se queda sin contestar";
      return null;
    },
  },
  {
    etiqueta: "patron-falso",
    porQue: "se busca una propiedad que no existe ⇒ 0 reglas en las nueve ⇒ patrón MUERTO, no cero (regla 4)",
    env: { SABOTAJE: "patron-falso" },
    exit: 2,
    salidaTiene: /patrón MUERTO/,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "PATRÓN MUERTO") return `cayó por «${j.resumen.veredicto}», que es el discriminador de otro sabotaje`;
      if (j.resumen.reglasServidas < 1000) return `sólo leyó ${j.resumen.reglasServidas} reglas servidas: el cero podría ser de la red y no del patrón`;
      return null;
    },
  },
  {
    etiqueta: "tope",
    porQue: "el máximo declarado a 0 ⇒ patrón UBICUO — el pleno también es un defecto, y se lee como dato",
    env: { SABOTAJE: "tope" },
    exit: 2,
    salidaTiene: /patrón UBICUO/,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "PATRÓN UBICUO") return `cayó por «${j.resumen.veredicto}», que es el discriminador de otro sabotaje`;
      if (!j.resumen.reglasHoverConTransform) return "salió UBICUO con 0 reglas: eso sería MUERTO mal etiquetado";
      return null;
    },
  },
  {
    etiqueta: "sin-hojas",
    porQue: "a UNA forma se le ciegan las hojas externas ⇒ su zoom medido se queda SIN REGLA, y el patrón sigue vivo en las otras",
    env: { SABOTAJE: "sin-hojas" },
    exit: 2,
    salidaTiene: /SIN REGLA QUE LO EXPLIQUE/,
    comprueba: (j) => {
      if (j.resumen.veredicto !== "EFECTO SIN REGLA") return `cayó por «${j.resumen.veredicto}», que es el discriminador de otro sabotaje`;
      const cegadas = Object.entries(j.formas).filter(([, v]) => v.hojasExternas > 0 && v.hojasPedidas === 0);
      if (cegadas.length !== 1) return `el sabotaje cegó ${cegadas.length} formas y tenía que cegar exactamente 1 (si ciega todas, salta MUERTO y no este cruce)`;
      if (!j.resumen.reglasHoverConTransform) return "el patrón se quedó a cero: el sabotaje dejó de ser local y ya no prueba el cruce";
      const [forma, v] = cegadas[0];
      if (!(v.cruce || []).some((c) => !c.reglas.length)) return `la forma cegada (${forma}) cruzó igual: el sabotaje no ejercitó la guarda`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · hover-zonal ════════`);
console.log(`  alcance: las 9 formas de listado, CSS servido (en línea + hojas externas)\n`);

/* La unidad es EL SABOTAJE: uno que no llegue a correr deja un discriminador
 * sin probar, y eso no es «pasó», es «no se miró». */
const ev = new Evaluadas({ nombre: "hover-zonal-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "hover-zonal.mjs")],
    env: c.env,
    timeout: 900_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(13)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(13)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} hover-zonal · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los tres discriminadores disparan por separado y el CONTROL sale verde. O sea\n` +
        `   que un disparador nombrado por esta sonda significa «está en el CSS servido y\n` +
        `   explica el efecto que el otro instrumento midió», no «no encontré otra cosa».\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
