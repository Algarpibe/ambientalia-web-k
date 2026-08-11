/**
 * TEST EN NEGATIVO de `comportamiento` — ENTERO, y cada sabotaje por SU
 * invariante.  Uso: npm run qa:comportamiento-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ TIENE QUE PROBAR ESTE FICHERO, Y POR QUÉ NO BASTA CON «SALIÓ ROJO»
 *
 * La sonda existe por UNA razón: que **«no se disparó» y «no tuvo efecto» dejen
 * de escribirse igual**. Así que el negativo no puede limitarse a comprobar
 * códigos de salida — tiene que comprobar que cada sabotaje cae por **el
 * discriminador que le toca**, porque tres de los cuatro producen el mismo
 * código:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-disparo` | `NO SE DISPARÓ` con `control.tapada === false` | la diana estaba libre: nadie la tapó |
 * | `tapado` | `NO SE DISPARÓ` con `control.tapada === true` | el disparo se hizo; lo comió una capa |
 * | `diana-falsa` | **selector MUERTO** (`Censo`, regla 4) | ni siquiera llega a haber interacción |
 * | `sin-espera` | el **reloj de la página** no marcó, y el scroll SÍ disparó | el sabotaje es local al tipo `tiempo` |
 *
 * `sin-disparo` es **el que prueba la sonda entera**: reproduce exactamente el
 * fallo que la motiva —medir el efecto sin haber disparado— y sin la guarda
 * saldría *«0 cambios»* con código 0. Con ella tiene que salir rojo **y decir
 * por qué**.
 *
 * ── Y el CONTROL, sin el cual esto no prueba nada (§sondas, regla 8a) ──────
 * Un sabotaje que no cambia el resultado no ha probado la guarda: ha probado
 * que el instrumento no la ejercita. Por eso la primera fila **no sabotea
 * nada** y tiene que salir en VERDE, con `NO SE DISPARÓ` a cero. Si el control
 * ya saliera rojo, los cuatro rojos siguientes no dirían nada.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

/* Una sola forma, y **tiene que ser una que pagine y liste tarjetas**: es la
 * única donde los cuatro tipos del catálogo a 1440 se ejercitan de verdad
 * (`hover` sobre tarjeta · `scroll` con imágenes bajo el pliegue · `click` de
 * paginación · `carga`). Un negativo sobre una página sin paginación dejaría el
 * control del canal de consola —el más caro de los cuatro— sin probar. */
const SOLO = "L1-blog";
const UNIVERSO = "listados";
const CANONICA = `medidas/comportamiento-1440-${UNIVERSO}.json`;

/** Interacciones que salieron «NO SE DISPARÓ» en la congelada de un sabotaje. */
const sinDisparo = (j) => j.interacciones.filter((i) => i.veredicto === "NO SE DISPARÓ");

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: los disparos LLEGAN y la corrida sale verde — sin esto, los cuatro rojos de abajo no prueban nada",
    env: {},
    exit: 0,
    comprueba: (j) => {
      const nd = sinDisparo(j);
      if (nd.length) return `el CONTROL trae ${nd.length} «NO SE DISPARÓ» (${nd.map((i) => `${i.lado}·${i.tipo}`).join(", ")}) — con el control roto, ningún sabotaje prueba nada`;
      if (!j.interacciones.some((i) => i.tipo === "click")) return "el control no llegó a ejercitar el `click` de paginación, que es el del canal de consola";
      return null;
    },
  },
  {
    etiqueta: "sin-disparo",
    porQue: "NO se ejecuta la acción pero SÍ se mide el efecto ⇒ «NO SE DISPARÓ», y con la diana LIBRE",
    env: { SABOTAJE: "sin-disparo" },
    exit: 2,
    salidaTiene: /NO SE DISPARARON/,
    comprueba: (j) => {
      const nd = sinDisparo(j);
      if (nd.length < 2) return `esperaba ≥2 «NO SE DISPARÓ» (hover, scroll, click), salieron ${nd.length}`;
      const tapadas = nd.filter((i) => i.control?.tapada === true);
      if (tapadas.length) return `${tapadas.length} cayeron por «tapada», que es el discriminador de OTRO sabotaje`;
      const tipos = new Set(nd.map((i) => i.tipo));
      if (!tipos.has("hover") || !tipos.has("scroll")) return `esperaba que cayeran hover Y scroll, cayeron ${[...tipos].join("+")}`;
      /* La mitad que de verdad importa: que NO se hayan colado como «NO APLICA»,
       * que es el veredicto con el que un informe perezoso los enterraría. */
      const naHover = j.interacciones.filter((i) => i.tipo === "hover" && i.veredicto === "NO APLICA").length;
      if (naHover) return `${naHover} hover salieron «NO APLICA» en vez de «NO SE DISPARÓ»: los dos se están fundiendo`;
      return null;
    },
  },
  {
    etiqueta: "tapado",
    porQue: "una capa cubre la diana ⇒ el PRE-CONTROL `elementFromPoint` la marca `tapada`",
    env: { SABOTAJE: "tapado" },
    exit: 2,
    comprueba: (j) => {
      const tap = sinDisparo(j).filter((i) => i.control?.tapada === true);
      if (!tap.length) return `ninguna interacción cayó con \`control.tapada === true\` (las que cayeron: ${JSON.stringify(sinDisparo(j).map((i) => i.tipo))})`;
      const encima = tap.find((i) => i.control?.encima)?.control?.encima || "";
      if (!/tapadera|div/.test(encima)) return `\`encima\` no nombra la capa: «${encima}» — el pre-control no está diciendo QUÉ tapa`;
      return null;
    },
  },
  {
    etiqueta: "diana-falsa",
    porQue: "el selector de afordancia no casa en NINGUNA página ⇒ sale por selector MUERTO, no por cero (regla 4)",
    env: { SABOTAJE: "diana-falsa" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    etiqueta: "sin-espera",
    porQue: "al tipo `tiempo` no se le da tiempo ⇒ el reloj DE LA PÁGINA no marca, y el resto sigue disparando",
    env: { SABOTAJE: "sin-espera" },
    exit: 2,
    comprueba: (j) => {
      const t = j.interacciones.filter((i) => i.tipo === "tiempo");
      if (!t.length) return "no se ejercitó ningún `tiempo`";
      if (!t.every((i) => i.control?.relojDeLaPagina === "NO marcó")) return `el reloj marcó igual en ${t.filter((i) => i.control?.relojDeLaPagina !== "NO marcó").length} de ${t.length}`;
      if (!t.every((i) => i.veredicto === "NO SE DISPARÓ")) return "el `tiempo` no cayó como NO SE DISPARÓ pese a no haber marcado el reloj";
      /* El sabotaje tiene que ser LOCAL: si tumbara también el scroll, no
       * estaría probando el control del reloj sino uno cualquiera. */
      const scrollCaido = j.interacciones.filter((i) => i.tipo === "scroll" && i.veredicto === "NO SE DISPARÓ");
      if (scrollCaido.length) return `también tumbó ${scrollCaido.length} scroll: el sabotaje no es local al reloj`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · comportamiento ════════`);
console.log(`  alcance: UNIVERSO=${UNIVERSO} SOLO=${SOLO} @1440 — la forma que ejercita los cuatro tipos\n`);

/* El contrato también aquí, y la unidad es EL SABOTAJE: uno que no llegue a
 * correr deja un discriminador sin probar, y eso no es «pasó», es «no se
 * miró». */
const ev = new Evaluadas({ nombre: "comportamiento-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "comportamiento.mjs"), "1440"],
    env: { UNIVERSO, SOLO, ...c.env },
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

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(12)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(12)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} comportamiento · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los cuatro discriminadores disparan por separado, y el CONTROL sale verde.\n` +
        `   O sea que un «SIN EFECTO» de esta sonda significa «se disparó y no cambió nada»,\n` +
        `   que es la afirmación que el eje comportamiento nunca había podido hacer.\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
