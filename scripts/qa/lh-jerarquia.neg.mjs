/**
 * TEST EN NEGATIVO de `lh-jerarquia`.
 * Uso: npm run qa:lh-jerarquia-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda no compara: **establece una forma**, y por tanto su modo de fallo
 * no es un «Δ0 falso» — es una FORMA MÁS SIMPLE DE LA REAL, que es la que sale
 * cuando un selector no casa, cuando el denominador se encoge o cuando nadie
 * ha comprobado que los dos modelos de ruta se puedan separar. Las tres salidas
 * son números creíbles, y las tres favorecen la decisión cómoda.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | censa 38 términos, encuentra padre en ≥1, **≥1 separador** y **≥1 vecino que es PÁGINA** | «0 con padre», que se lee como «el original es plano» |
 * | `sin-corpus` | **TIRA** sin la fuente del denominador | censar menos términos y seguir en verde |
 * | `via-muerta` | **TIRA** con la vía nombrada | «0 términos con padre» = «no hay jerarquía» |
 * | `ruta-cableada` | **falla con los términos nombrados** | tragarse que el modelo derivado no reproduce las URL |
 *
 * ⚠ **`via-muerta` es el que protege del daño de verdad.** La vía 2 —la clase
 * `taxonomia padre` de la miga— es la única que discrimina jerarquía de
 * «prefijo fijo»; si su selector deja de casar, la sonda diría *«8 URLs de dos
 * segmentos, 0 padres»* y la lectura natural sería que las dos segmentos son un
 * prefijo. §sondas 4: un selector que no casa con nada no es un cero, es un
 * defecto.
 *
 * ⚠ Y el control comprueba **`separadores > 0`** a propósito. Sin un término de
 * primer nivel en una taxonomía jerárquica, «derivar la ruta» y «cablearla» dan
 * exactamente la misma salida y elegir uno nombraría una variable al azar
 * (§DOS VARIABLES CONFUNDIDAS). Un control que sólo mirase «H acierta 35/35»
 * daría verde sobre un dato que no puede distinguir los dos modelos.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-jerarquia.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: censa las 5 taxonomías, encuentra jerarquía en una y ≥1 término que separa los modelos",
    env: {},
    exit: 0,
    salidaTiene: /FORMA ESTABLECIDA/,
    comprueba: (j) => {
      if (!j.forma) return "sin bloque 'forma': la sonda no llegó a censar";
      if (!(j.forma.terminosConPadre > 0)) return "0 términos con padre: la vía que discrimina no encontró nada";
      if (j.forma.profundidadMaxima < 2) return "profundidad 1: sin dos niveles no hay jerarquía que modelar";
      if (!(j.modeloDeRuta.separadores.length > 0))
        return "0 separadores: con sólo hijas delante, derivar y cablear son indistinguibles";
      if (j.modeloDeRuta.acierta !== j.modeloDeRuta.de)
        return `el modelo derivado no reproduce las URL (${j.modeloDeRuta.acierta}/${j.modeloDeRuta.de})`;
      if (!j.direccionB || !j.direccionB.cruce.length) return "sin cruce (b): la mitad contraria no se contestó";
      if (!j.direccionB.cruce.some((c) => c.esquemaLoDeclara))
        return "ninguna colección declara 'padre' según la lectura del esquema: el cruce (b) sería un cero sin haber leído";
      if (!j.enrutado || j.enrutado.consumidoresDeLaJerarquiaEnElClon === undefined)
        return "sin el censo de consumidores: la consecuencia de enrutado quedaría razonada y no derivada";
      if (!j.via4Contraste || !(j.via4Contraste.vecinosQueSonPAGINA > 0))
        return "la vía 4 no separa: sin un vecino marcado PÁGINA, «archivo de término» sería un pleno y no un discriminador";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "sin la fuente del denominador ⇒ TIRA, en vez de censar menos términos y seguir verde",
    env: { SABOTAJE: "sin-corpus" },
    exit: 1,
    salidaTiene: /FUENTE DEL DENOMINADOR AUSENTE/,
  },
  {
    etiqueta: "via-muerta",
    porQue: "el selector de la miga no casa en ninguna página ⇒ TIRA, en vez de decir «no hay jerarquía»",
    env: { SABOTAJE: "via-muerta" },
    exit: 1,
    salidaTiene: /VÍA MUERTA/,
  },
  {
    etiqueta: "ruta-cableada",
    porQue: "si el modelo derivado no reproduce las URL, sale con los términos NOMBRADOS y código ≠ 0",
    env: { SABOTAJE: "ruta-cableada" },
    exit: 2,
    salidaTiene: /El modelo derivado FALLA/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-jerarquia ════════`);
console.log(`  alcance: corpus congelado · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-jerarquia-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-jerarquia.mjs")], env: c.env, timeout: 120_000 });
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
    console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(16)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-jerarquia · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La forma sale del CORPUS y no del instrumento: la sonda tira sin denominador,\n` +
        `   tira con la vía muerta, y no puede declarar «derivable» sin un término que lo separe.\n`
      : `   La forma no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
