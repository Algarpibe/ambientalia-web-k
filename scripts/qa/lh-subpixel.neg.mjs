/**
 * TEST EN NEGATIVO de `lh-subpixel`.
 * Uso: npm run qa:lh-subpixel-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * El modo de fallo de esta sonda **no** es un Δ0 falso: es **explicar de más**.
 * Un mecanismo que suena bien —«coma flotante»— se lee igual que uno medido, y
 * la diferencia está en si algo puede salir rojo. Los tres sabotajes son las
 * tres formas de que la explicación fuera falsa y la sonda siguiera en verde:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | un solo elemento, y su aritmética comprobada pieza a pieza | «155 residuos pequeños», que es lo que sale sin mirar |
 * | `sin-cmp` | **TIRA** sin comparador | derivar 0 residuos y llamarlo «nada que explicar» |
 * | `propagacion-mal` | **falla**: el acumulado deja de casar | dar por buena una aritmética que nadie comprobó |
 * | `otro-elemento` | **falla**: los `.w` salen de más de un elemento | llamar «un residuo» a lo que serían varios |
 *
 * ⚠ `otro-elemento` es el que protege de la conclusión que de verdad importa.
 * La frase que esta sonda autoriza a escribir es *«hay UN residuo y 124
 * consecuencias»*; si los anchos vinieran de elementos distintos, serían varios
 * residuos y la frase sería falsa **con los mismos 155 pares delante**.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-subpixel.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: un solo elemento (`span.pages`) y la propagación comprobada",
    env: {},
    exit: 0,
    salidaTiene: /UN residuo/,
    comprueba: (j) => {
      for (const ancho of ["1440", "390"]) {
        const d = j.porAncho?.[ancho];
        if (!d) return `falta el ancho ${ancho}`;
        if (d.subPixel === 0) return `@${ancho}: 0 pares sub-píxel — sin residuos no hay mecanismo que nombrar`;
        if (Object.keys(d.porMarca).length !== 1) return `@${ancho}: ${Object.keys(d.porMarca).length} elementos distintos ⇒ no es UN residuo`;
        if (!d.porMarca["span.pages"]) return `@${ancho}: el elemento no es \`span.pages\``;
        if (d.anchosSubPixelFueraDelPaginador !== 0) return `@${ancho}: hay anchos sub-píxel fuera del paginador ⇒ podría ser desvío global`;
        if (d.propagacion.fallan !== 0) return `@${ancho}: la propagación falla en ${d.propagacion.fallan}`;
        if (d.propagacion.casan === 0) return `@${ancho}: la propagación no se comprueba en ninguna pieza — escrita, no medida`;
        /* El dominio de la aritmética se declara y tiene que existir: sin formas
           «sólo sub-píxel» la comprobación no tendría dónde hacerse, y un 0/0 se
           leería como verde (§sondas 4bis). */
        if (!(d.formasSoloSubPixel > 0)) return `@${ancho}: 0 formas con sólo sub-píxel ⇒ la aritmética no tiene dominio limpio`;
        if (typeof d.formasConOtroDefectoDePaginador !== "number")
          return `@${ancho}: no se declara cuántas formas quedan FUERA del dominio — una limitación sin cardinal se lee como nota al pie (regla 14)`;
        /* Y los dos canales que sostienen el «no es global». Si alguno se
           moviera, la explicación cambiaría de forma y habría que re-escribirla. */
        if (d.ySubPixel !== 0) return `@${ancho}: hay ${d.ySubPixel} residuos sub-píxel VERTICALES ⇒ el mecanismo horizontal no los cubre`;
        if (d.extendConAnchoDistinto !== 0) return `@${ancho}: \`span.extend\` también difiere ⇒ el desvío afecta a más texto y la explicación local no vale`;
        /* El denominador a la vista: si no quedara nada por encima del umbral,
           esta sonda estaría explicando el 100 % y sería sospechosa. */
        if (typeof d.sobreElUmbral !== "number") return `@${ancho}: sin \`sobreElUmbral\` no se ve qué parte NO explica`;
      }
      if (!j.meta.noMide?.length) return "sin `noMide`: una sonda que nombra un mecanismo tiene que declarar el que NO nombra";
      return null;
    },
  },
  {
    etiqueta: "sin-cmp",
    porQue: "sin comparador ⇒ TIRA, en vez de derivar 0 residuos y salir verde",
    env: { SABOTAJE: "sin-cmp" },
    exit: 1,
    salidaTiene: /SIN COMPARADOR|no existe|ENOENT/,
  },
  {
    etiqueta: "propagacion-mal",
    porQue: "con el acumulado desplazado, la aritmética deja de cerrar y la explicación se cae",
    env: { SABOTAJE: "propagacion-mal" },
    exit: 1,
    salidaTiene: /la propagación FALLA/,
  },
  {
    etiqueta: "otro-elemento",
    porQue: "si los anchos vinieran de otro elemento, «un residuo» sería falso con los mismos pares delante",
    env: { SABOTAJE: "otro-elemento" },
    exit: 1,
    salidaTiene: /no es `span.pages`|elementos distintos/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-subpixel ════════`);
console.log(`  alcance: congeladas de medidas/ · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-subpixel-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-subpixel.mjs")], env: c.env, timeout: 120_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(20)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(20)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-subpixel · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El mecanismo no se puede escribir sin que algo pueda desmentirlo.\n`
      : `   El mecanismo no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
