/**
 * TEST EN NEGATIVO de `lh-alcance`.
 * Uso: npm run qa:lh-alcance-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Lo que hay que probar de una sonda que sólo CUENTA es distinto de lo que hay
 * que probarle a una que compara, y conviene decirlo antes de la tabla: aquí no
 * existe «Δ0», así que el modo de fallo no es un verde falso — **es un
 * DENOMINADOR falso**, que es peor porque viaja dentro de una afirmación
 * verdadera («verificado») y la infla sin contradecirla.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | cuenta las 13 formas y **el nº de mixtos es > 0** | «0 mixtos», que es como se lee un censo que no clasificó |
 * | `sin-espejo` | **TIRA** sin el universo | «0 pares», que se lee como «no hay nada que verificar» |
 * | `eje-sin-declarar` | **TIRA** con el camino nombrado | tragárselo y devolver un denominador **de menos** |
 *
 * **`eje-sin-declarar` es el que protege del daño real.** Si el barrido gana
 * una propiedad y nadie la clasifica, un clasificador con defecto la metería en
 * un cubo y el alcance saldría plausible; sin defecto pero sin guarda,
 * desaparecería del denominador y el porcentaje de mixtos bajaría **solo**. Las
 * dos salidas son números creíbles, y ninguna avisa.
 *
 * ⚠ **Y el control comprueba `mixtos > 0` a propósito.** Un censo cuyo
 * clasificador devolviera «plantilla» para todo daría `0 % mixto` — o sea la
 * afirmación más cómoda posible («todo es verificable») producida por el
 * instrumento y no por el sitio. Es §sondas 4 en su tercera cara: un cero que
 * tiene forma de dato.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-alcance-1440.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: censa las formas del espejo y el nº de MIXTOS sale > 0",
    env: {},
    exit: 0,
    salidaTiene: /formas censadas/,
    comprueba: (j) => {
      if (!j.universo) return "sin universo: la sonda no llegó a congelar su recuento";
      if (!j.universo.formas) return "0 formas: el universo no se derivó del espejo";
      if (!(j.universo.pares > 0)) return "0 pares: el aplanado no recorrió nada";
      if (!(j.universo.mixta > 0))
        return "0 MIXTOS: un clasificador que lo mete todo en 'plantilla' daría el denominador más cómodo posible";
      if (j.universo.verificables + j.universo.mixta !== j.universo.pares)
        return `las partes no suman el total: ${j.universo.verificables}+${j.universo.mixta} ≠ ${j.universo.pares}`;
      return null;
    },
  },
  {
    etiqueta: "sin-espejo",
    porQue: "sin el universo ⇒ TIRA, en vez de declarar «0 pares» y leerse como «nada que verificar»",
    env: { SABOTAJE: "sin-espejo" },
    exit: 1,
    salidaTiene: /ESPEJO AUSENTE/,
  },
  {
    etiqueta: "eje-sin-declarar",
    porQue: "un camino que ejeDe() no clasifica ⇒ TIRA con su nombre, en vez de caerse del denominador",
    env: { SABOTAJE: "eje-sin-declarar" },
    exit: 1,
    salidaTiene: /PARES SIN EJE DECLARADO/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-alcance ════════`);
console.log(`  alcance: espejo congelado de lh-spec · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-alcance-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-alcance.mjs")], env: c.env, timeout: 120_000 });
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
    console.log(`  ❌ ${c.etiqueta.padEnd(18)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(18)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-alcance · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El denominador es del ESPEJO, no del instrumento: la sonda tira sin universo,\n` +
        `   tira con un camino sin eje, y no puede declarar «todo verificable» por omisión.\n`
      : `   El alcance no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
