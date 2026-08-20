/**
 * TEST EN NEGATIVO de `pie-cmp`.
 * Uso: npm run qa:pie-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL MODO DE FALLO DE ESTA SONDA NO ES UN Δ0 FALSO: ES UN REPARTO PLAUSIBLE
 *
 * `pie-cmp` descompone el pie en secciones y las empareja **por ROL**. Su
 * manera de mentir no es decir «todo cuadra» —eso se ve— sino **repartir mal y
 * que los números sigan sumando el total correcto**. Un reparto equivocado
 * cuyo total cuadra es indistinguible de uno bueno mirando el total, que es
 * justo la razón por la que esta sonda existe.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | descompone, empareja por rol y **el control de suma cuadra** | un total que cuadra sin reparto |
 * | `sin-espejo` | **no existe el lado del original** ⇒ exit 2 antes de medir | seguir con 0 formas y dar verde de lo que no miró |
 * | `espejo-sin-formas` | **0 formas en el espejo** ⇒ la guarda tira | `COMPARABLES = 0` leído como «nada que comparar» |
 * | `sin-marcador` | **la vía de RESPALDO**: sin `data-pie` no hay identidad ⇒ exit 1 nombrándolo | emparejar por índice en silencio |
 *
 * ⚠ **`sin-marcador` es el que protege del daño de verdad**, y es la razón de
 * que el marcador exista. Sin él, los bloques del pie del clon sólo se pueden
 * emparejar **por posición**; y la posición se rompe en cuanto `L5-casos` mete
 * su sección CTA **delante** de `footer-links`. El resultado sería atribuir el
 * alto de `links` a `cta`, el de `legal` a `links`… con el total intacto. Por
 * eso el caso no comprueba sólo el código de salida sino que la frase del
 * VERDE **no aparezca** (§sondas 17: que caiga POR SU MOTIVO).
 *
 * ── Lo que este negativo NO puede ejercitar, y se dice ────────────────────
 * **El contrato de `Evaluadas` por debajo de su mínimo.** `minimo` se deriva de
 * `COMPARABLES.length * 2`, así que un sabotaje que vacíe el universo **mueve
 * la portería**: deja 0 evaluadas contra un mínimo de 0, o sea «0 contra 0» y
 * no «0 contra un mínimo positivo» (§sondas 17: *un sabotaje que comparte
 * variable con el mínimo no puede ejercitarlo*). Lo que `espejo-sin-formas` sí
 * prueba es **la guarda explícita**, que tira antes de construir el contrato.
 * Son dos cosas distintas y sólo la segunda está cubierta aquí.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/pie-cmp-1440.json";
const SONDA = join(QA, "pie-cmp.mjs");

/** Un espejo de mentira: 0 páginas ⇒ 0 formas que comparar. */
const ESPEJO_VACIO = "medidas/pie-cmp-neg-espejo-sin-formas.json";
const fVacio = join(QA, ESPEJO_VACIO);
mkdirSync(dirname(fVacio), { recursive: true });
writeFileSync(fVacio, JSON.stringify({ meta: { fecha: "«artefacto de negativo»" }, paginas: {} }, null, 2));

const casos = [
  {
    etiqueta: "control",
    porQue: "descompone el pie por sección, empareja por ROL y el control de suma cuadra",
    args: ["1440"],
    exit: 0,
    salidaTiene: /DESCOMPOSICIÓN DEL PIE/,
    comprueba: (j) => {
      if (!Array.isArray(j.reparto) || j.reparto.length === 0) return "sin `reparto`";
      const roles = new Set(j.reparto.filter((f) => f.rol !== "· TOTAL").map((f) => f.rol));
      if (!roles.has("links") || !roles.has("legal")) return `los roles no salen del marcador: ${[...roles].join(",")}`;
      if (j.reparto.some((f) => f.rol === null)) return "hay filas con rol null: el emparejamiento no es por rol";
      if (!Array.isArray(j.control) || j.control.length === 0) return "sin bloque `control`";
      /* El control interno: la suma de secciones tiene que reconstruir el pie.
         Si no, el reparto es una lista y no una descomposición. */
      const malos = j.control.filter((c) => Math.abs(c.resto) > 0.01);
      if (malos.length) return `${malos.length} control(es) con resto ≠ 0: el reparto no reconstruye el pie`;
      if (!j.viasDelClon || !j.viasDelClon.includes("data-pie")) return `el clon no se leyó por 'data-pie': ${JSON.stringify(j.viasDelClon)}`;
      return null;
    },
  },
  {
    etiqueta: "sin-espejo",
    porQue: "sin el lado del original no hay comparación: tira en vez de medir 0 formas y darlas por buenas",
    args: ["1440", "--espejo=medidas/pie-cmp-neg-NO-EXISTE.json"],
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
    prohibidoEnSalida: /DESCOMPOSICIÓN DEL PIE/,
  },
  {
    etiqueta: "espejo-sin-formas",
    porQue: "un espejo con 0 páginas lo para la guarda explícita, antes de construir el contrato",
    args: ["1440", `--espejo=${ESPEJO_VACIO}`],
    exit: 2,
    salidaTiene: /0 formas en el espejo/,
    prohibidoEnSalida: /DESCOMPOSICIÓN DEL PIE/,
  },
  {
    etiqueta: "sin-marcador",
    porQue: "sin `data-pie` no hay identidad: cae a la vía de respaldo y LO DICE, en vez de emparejar por índice",
    args: ["1440"],
    env: { SABOTAJE_SIN_MARCADOR: "1" },
    exit: 1,
    salidaTiene: /NO SE PUDO ATRIBUIR/,
    /* La frase del verde no puede aparecer: si el rojo y el verde imprimen lo
       mismo, el negativo no ha probado nada. */
    prohibidoEnSalida: /secciones emparejadas \d+ · con Δ≠0/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · pie-cmp ════════`);
console.log(`  alcance: abre el ORIGINAL vivo y un clon propio. 4 sabotajes, ~14 páginas el control.\n`);

const ev = new Evaluadas({ nombre: "pie-cmp-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA, ...c.args], env: c.env ?? {}, timeout: 900_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.prohibidoEnSalida && c.prohibidoEnSalida.test(out)) mal = `la salida contiene ${c.prohibidoEnSalida}, que es la frase del VERDE`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(22)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(22)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} pie-cmp · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El reparto sale del ROL servido en los dos lados y no de la posición: sin espejo\n` +
        `   no compara, sin formas no arranca, y sin \`data-pie\` se niega a atribuir en vez\n` +
        `   de emparejar por índice — que es la única forma en que este instrumento podría\n` +
        `   publicar un reparto falso con el total cuadrando.\n`
      : `   El reparto del pie no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
