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
  /* ⚠⚠ REESCRITO 2026-08-23 (96.ª tanda) — §regla 5ter: ARREGLAR EL OBJETO
   * MEDIDO CADUCA EL CONTROL DEL INSTRUMENTO QUE LO MIDIÓ.
   *
   * Este control cableaba **seis números de un acta**: `15` sin modelar, `7`
   * que desbloquean, `3` SIN-CPT (2 alias + 1 sin permalink) y `5` casos
   * bloqueados. Los seis eran ciertos **el día que se escribieron** y ninguno
   * lo es hoy — y no porque nada se rompiera, sino porque **el objeto cambió
   * legítimamente**: el 2026-08-13 `productos` cambió de fuente (9 productos
   * transcritos a mano → los 19 de `p-extraido.json`), así que
   *
   *   · los 3 que caían en SIN-CPT pasaron a estar MODELADOS  ⇒ SIN-CPT 3 → 0
   *   · `sinModelar` bajó de 15 a 8, y `desbloquean` de 7 a 0.
   *
   * O sea que el control llevaba **desde el 13 aplicando el tratamiento al
   * revés**, y fallando en voz alta — que se lee como hallazgo del objeto en
   * vez de como avería del instrumento.
   *
   * ── Y CÓMO SE ARREGLA SIN «AJUSTAR LA EXPECTATIVA AL VALOR DE HOY» ───────
   * Escribir `8` donde ponía `15` sería exactamente el corolario que §regla 21
   * prohíbe: el defecto entra DENTRO de la guarda y vuelve a caducar el día que
   * `productos` cambie de fuente otra vez. Así que se parte en dos:
   *
   *   **(a) lo que se puede DERIVAR de la fuente que lo declara** — el
   *   inventario. `cpt` sale de `INDICE.json` y `sinModelar` del cruce con el
   *   catálogo real, o sea de las MISMAS fuentes que la sonda pero por un
   *   camino independiente. Si la sonda dejara de cargar el catálogo, esto lo
   *   caza; y si mañana entra un producto nuevo, el listón sube solo;
   *
   *   **(b) lo que NO se puede derivar sin reimplementar la clasificación**
   *   —`desbloquean`, `SIN-CPT`, `casosBloqueados`— pasa de VALOR a
   *   **INVARIANTE ESTRUCTURAL**: la partición suma, los subconjuntos son
   *   subconjuntos, nadie queda sin clasificar, y toda evidencia SIN-CPT trae
   *   su `href` **si la hay**. Eso discrimina una sonda que pierda una clase y
   *   **no caduca con el dato**, que es la propiedad que le faltaba.
   *
   * ⚠ Lo que se PIERDE al hacerlo, y se dice: el control ya no fija los
   * cardinales del acta. Ese trabajo lo hace hoy la congelada de `medidas/`,
   * que es donde vive la evidencia (§sondas 2). Un control no es el sitio donde
   * se archiva un número: es el sitio donde se comprueba que el instrumento no
   * se ha desviado de sus fuentes. */
  const { cargaCatalogos } = await import("../seed/catalogos.mjs");
  const INDICE = JSON.parse(readFileSync(join(QA, "../../corpus/INDICE.json"), "utf8"));
  const rutasCptCtl = Object.keys(INDICE.paginas)
    .filter((k) => k.startsWith("productos/"))
    .map((k) => k.slice("productos/".length));
  const idsCtl = new Set(((await cargaCatalogos()).get("productos") ?? []).map((p) => p.id));
  const hojaCtl = (r) => r.split("/").pop();
  const cptCtl = rutasCptCtl.length;
  const sinModelarCtl = rutasCptCtl.filter((r) => !idsCtl.has(hojaCtl(r))).length;

  const referenciados = Object.values(cl).reduce((n, v) => n + (v?.length ?? 0), 0);
  const sinCpt = cl["SIN-CPT"] ?? [];
  const desbloquean = d.reparto?.desbloquean ?? [];
  /* `casosBloqueadosTrasModelarLos15` conserva el nombre de cuando eran 15: es
   * una CLAVE de la congelada, y renombrarla rompería las actas que la citan. */
  const bloqueados = d.reparto?.casosBloqueadosTrasModelarLos15 ?? [];
  /* Las rutas sin modelar, del propio inventario: es el conjunto del que
   * «desbloquean» tiene que ser subconjunto. */
  const sinModelarRutas = (d.inventario?.rutas ?? []).filter((r) => !r.modelado).map((r) => r.ruta);

  // (a) inventario DERIVADO de las fuentes
  if (d.inventario?.cpt !== cptCtl) malCtl = `CPT ${d.inventario?.cpt}, derivado del corpus ${cptCtl}`;
  else if (d.inventario?.sinModelar !== sinModelarCtl)
    malCtl = `sinModelar ${d.inventario?.sinModelar}, derivado del cruce corpus×catálogo ${sinModelarCtl}`;
  // (b) INVARIANTES estructurales, que no caducan con el dato
  else if (d.inventario?.modelados + d.inventario?.sinModelar !== d.inventario?.cpt)
    malCtl = `la partición del CPT no suma: ${d.inventario?.modelados} + ${d.inventario?.sinModelar} ≠ ${d.inventario?.cpt}`;
  else if (referenciados !== d.referencias?.slugsDistintos)
    malCtl = `las clases suman ${referenciados} y hay ${d.referencias?.slugsDistintos} slugs referenciados: alguien se perdió por el camino`;
  else if (cl["SIN CLASIFICAR"]?.length !== 0)
    malCtl = `${cl["SIN CLASIFICAR"]?.length} sin clasificar en la corrida limpia`;
  else if (!desbloquean.every((x) => sinModelarRutas.includes(x.ruta ?? x.slug ?? x)))
    malCtl = `«desbloquean» no es subconjunto de «sin modelar»: la clasificación no cierra`;
  else if (bloqueados.length > d.referencias?.casos)
    malCtl = `${bloqueados.length} casos bloqueados de ${d.referencias?.casos}: imposible`;
  /* Y la mitad que hace que un hallazgo sea un hallazgo: **si** hay SIN-CPT,
   * traen su evidencia SERVIDA. Condicionado a que los haya — hoy son 0 y eso
   * es dato, no un fallo (§regla del cero). */
  else if (sinCpt.length && sinCpt.filter((x) => x.href).length !== sinCpt.length)
    malCtl = `sólo ${sinCpt.filter((x) => x.href).length} de ${sinCpt.length} SIN-CPT traen href servido`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   (sin sabotaje)      ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL   (sin sabotaje)      inventario DERIVADO del corpus×catálogo · partición cierra · 0 sin clasificar`,
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
