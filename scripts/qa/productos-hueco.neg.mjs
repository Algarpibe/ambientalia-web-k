/**
 * TEST EN NEGATIVO de `productos-hueco` — con control.
 * Uso: npm run qa:productos-hueco-neg
 *
 * La sonda decide **el tamaño de una tanda** (qué se modela y qué desbloquea),
 * así que sus modos de fallo son los tres de la casa y uno propio:
 *
 *   **(a) que sepa decir «no he mirado»**
 *     · `cpt-vacio`   el inventario del CPT llega vacío ⇒ 0 de 24 evaluadas. Es
 *       §regla 4bis: «0 comparado» no puede salir verde, y aquí saldría con un
 *       **«0 sin modelar»** que se lee como *«no falta nada»*;
 *     · `panel-muerto` el localizador del `<span data-id>` no casa ⇒ 0
 *       evidencias. **Este sabotaje no es hipotético: la primera corrida de la
 *       sonda cayó por él de verdad** —el original sirve `<span  data-id=` con
 *       DOS espacios— y sin la guarda los 3 huérfanos habrían salido «no son
 *       nada» en vez de «no los sé leer» (§sondas 4).
 *
 *   **(b) que sepa decir «no cuadra»**
 *     · `modelado-fantasma` el clon «modela» un slug que el CPT no tiene ⇒ las
 *       dos fuentes no denotan el mismo conjunto, y el 15 sería otro número.
 *
 *   **(c) el propio, y es el que sostiene el hallazgo de esta tanda**
 *     · `clase-cubo` se inyecta un slug referenciado que no cae en ninguna de
 *       las tres clases. Tiene que salir **SIN CLASIFICAR y en rojo**, nunca
 *       repartido en silencio dentro de «sin-cpt». Es la lección de la tanda
 *       anterior —*un cubo de «combinaciones» es donde se pierden las clases que
 *       nadie nombró*— convertida en guarda: sin ella, los 3 huérfanos que
 *       destapó esta sonda se habrían contado como «de los 15» y el reparto
 *       habría dicho que modelarlos desbloquea la colección.
 *
 * El **CONTROL** cierra el triángulo: comprueba que la corrida limpia ve
 * exactamente lo que el acta cita —15 sin modelar, 7 que desbloquean, 3 SIN-CPT
 * y 5 casos que seguirían bloqueados—, porque los cuatro sabotajes de arriba los
 * aprobaría igual una sonda rota de fábrica.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "cpt-vacio",
    exit: 2,
    porQue: "0 de 24 productos del CPT ⇒ NO SE PUDO EVALUAR, no «no falta ninguno»",
    salidaTiene: /NO SE PUDO EVALUAR/,
    comprueba: (d) =>
      d.inventario?.cpt === 0 && d.inventario?.sinModelar === 0
        ? null
        : `esperaba cpt 0 y sinModelar 0, salió ${d.inventario?.cpt} y ${d.inventario?.sinModelar}`,
  },
  {
    sabotaje: "panel-muerto",
    exit: 2,
    porQue: "el localizador del panel no casa ⇒ LOCALIZADOR MUERTO (el fallo REAL de la 1.ª corrida)",
    /* ⚠ 2026-08-18 (83.ª) · este caso está SIN PROBAR, no roto.
     * La guarda que ejercita es `noModeladoNiCpt.length && evidencia.size === 0`,
     * o sea que necesita AL MENOS UN slug fuera del CPT para poder saltar. Hoy
     * el dominio trae **0 SIN-CPT**, así que matar el localizador no puede
     * producir «LOCALIZADOR MUERTO» — no porque la guarda falle, sino porque no
     * hay nada que localizar.
     *
     * Es §*una regla derivada sobre un dominio donde el caso NO SE DA está SIN
     * PROBAR para ese caso*, aplicado al sabotaje: el negativo no puede
     * fabricar el hueco sin inventarse un slug, y un sabotaje que se inventa su
     * propio dominio prueba el sabotaje, no la sonda.
     *
     * NO se rebaja a `exit: 0` ni se retira: se deja rojo con su razón, porque
     * el día que vuelva a haber un slug fuera del CPT esta guarda es la que
     * impide leer su cero como «no son nada». */
    sinProbarSi: (d) => (d.referencias?.porClase?.["SIN-CPT"]?.length ?? 0) === 0,
    porQueSinProbar:
      "0 slugs fuera del CPT en el dominio de hoy ⇒ la guarda del cero no tiene qué ejercitar (SIN PROBAR, no roto)",
    salidaTiene: /LOCALIZADOR MUERTO/,
    comprueba: (d) =>
      d.referencias?.porClase?.["SIN-CPT"]?.length === 0
        ? null
        : `esperaba 0 en SIN-CPT sin evidencia, salió ${d.referencias?.porClase?.["SIN-CPT"]?.length}`,
  },
  {
    sabotaje: "modelado-fantasma",
    exit: 2,
    porQue: "un modelado que el CPT no tiene ⇒ MODELADO FUERA DEL CPT: las dos fuentes no cuadran",
    salidaTiene: /MODELADO FUERA DEL CPT/,
    comprueba: (d) =>
      d.inventario?.cpt === 24 ? null : `esperaba el CPT intacto (24), salió ${d.inventario?.cpt}`,
  },
  {
    sabotaje: "clase-cubo",
    exit: 2,
    porQue: "un slug que no cae en ninguna clase ⇒ SIN CLASIFICAR en rojo, no repartido en silencio",
    salidaTiene: /SIN CLASIFICAR/,
    comprueba: (d) =>
      d.referencias?.porClase?.["SIN CLASIFICAR"]?.length === 1
        ? null
        : `esperaba 1 SIN CLASIFICAR, salió ${d.referencias?.porClase?.["SIN CLASIFICAR"]?.length}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · productos-hueco ════════`);
console.log(`  el reparto que dimensiona la tanda, falsado — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "productos-hueco-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "productos-hueco.mjs")], env, timeout: 300_000 });

for (const c of casos) {
  const fichero = join(QA, nombreNeg("medidas/productos-hueco.json", c.sabotaje));
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  /* Un caso cuyo DOMINIO no ejercita la guarda no es un caso roto: es un caso
   * SIN PROBAR, y los dos se leen igual si no se nombran (§*una regla derivada
   * sobre un dominio donde el caso NO SE DA está SIN PROBAR*). Sigue contando
   * como fallo —un SIN PROBAR no puede leerse como probado— pero con su razón
   * y su número delante, que es lo que dice qué haría falta para cerrarlo. */
  if (mal && c.sinProbarSi) {
    const dCongelada = existsSync(fichero) ? JSON.parse(readFileSync(fichero, "utf8")) : null;
    if (dCongelada && c.sinProbarSi(dCongelada)) mal = `SIN PROBAR · ${c.porQueSinProbar}`;
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(20)} ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(20)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
const fCtl = join(QA, nombreNeg("medidas/productos-hueco.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  const cl = d.referencias?.porClase ?? {};
  if (d.inventario?.cpt !== 24) malCtl = `CPT ${d.inventario?.cpt}, esperaba 24`;
  else if (d.inventario?.sinModelar !== 15) malCtl = `sinModelar ${d.inventario?.sinModelar}, esperaba 15`;
  else if (d.reparto?.desbloquean?.length !== 7) malCtl = `desbloquean ${d.reparto?.desbloquean?.length}, esperaba 7`;
  else if (cl["SIN-CPT"]?.length !== 3) malCtl = `SIN-CPT ${cl["SIN-CPT"]?.length}, esperaba 3`;
  else if (cl["SIN CLASIFICAR"]?.length !== 0) malCtl = `${cl["SIN CLASIFICAR"]?.length} sin clasificar en la corrida limpia`;
  else if (d.reparto?.casosBloqueadosTrasModelarLos15?.length !== 5)
    malCtl = `${d.reparto?.casosBloqueadosTrasModelarLos15?.length} casos seguirían bloqueados, esperaba 5`;
  /* Y la mitad que hace que el hallazgo sea un hallazgo: los 3 SIN-CPT traen su
   * evidencia SERVIDA, con las dos formas distinguidas. Sin esto, «3 huérfanos»
   * sería un recuento sin saber qué son. */
  else if (cl["SIN-CPT"].filter((x) => x.href).length !== 3)
    malCtl = `sólo ${cl["SIN-CPT"].filter((x) => x.href).length} de 3 SIN-CPT traen href servido`;
  else if (cl["SIN-CPT"].filter((x) => x.forma === "sin-permalink").length !== 1)
    malCtl = `esperaba exactamente 1 sin-permalink entre los SIN-CPT`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   (sin sabotaje)      ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL   (sin sabotaje)      15 sin modelar · 7 desbloquean · 3 SIN-CPT (2 alias + 1 sin permalink) · 5 casos siguen bloqueados`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} productos-hueco · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe decir «no he mirado» (2 formas), «no cuadra» y «esto no cabe\n` +
        `   en ninguna clase». O sea que «modelar los 15 NO desbloquea \`casos\`» es una\n` +
        `   medida y no un descuido de conteo — que es justo lo que §regla 9 tiene\n` +
        `   fichado contra este mismo CPT.\n`
      : `   El reparto de esta tanda NO se puede apoyar en \`productos-hueco\` hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
