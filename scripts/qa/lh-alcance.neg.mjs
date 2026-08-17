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
 * | `pagina-sin-pares` | **exit 2** con la página nombrada | que el agregado se la trague sin mover un dígito |
 * | `frontera-sin-explicar` | **TIRA** al no poder repartir una página fuera | rebucketearla y publicar un **hueco inventado** |
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
      /* El TERCER apoyo del universo, y el único con canal propio: cada página
       * tiene que rendir al menos un par. Un agregado grande absorbe una página
       * muda sin mover un dígito. */
      const m = j.minParPorPagina;
      if (!m) return "sin `minParPorPagina`: el contrato de Evaluadas sólo está aplicado en agregado, y el total absorbe la página muda";
      if (m.cumplen !== m.de) return `${m.de - m.cumplen} página(s) con menos de ${m.minimo} par y la sonda salió en verde`;
      if (m.cierraElCodigo !== true) return "`minParPorPagina` no cierra el código de salida: sería un descuadre impreso y no contado (§sondas 1)";

      /* ── §regla 14: las dos líneas que el resumen se traga si no llevan su
       * cardinal. El control no comprueba SU VALOR —cambia con el espejo— sino
       * que EXISTAN y que sus sumas cuadren: un reparto que no suma es un cubo
       * por defecto disfrazado de clasificación. */
      const ar = j.alcanceReal ?? {};
      const cl = ar.clases ?? {};
      const pg = ar.paginas ?? {};
      if (!Array.isArray(cl.ciegasDetalle)) return "sin `clases.ciegasDetalle`: «toca N de M» se leería como cobertura y las ciegas sin nombrar (§regla 14)";
      if (cl.ciegasDetalle.length !== cl.ciegas) return `ciegasDetalle ${cl.ciegasDetalle.length} ≠ ciegas ${cl.ciegas}`;
      const sumaCiegas = cl.ciegasDetalle.reduce((a, c) => a + c.paginas, 0);
      if (sumaCiegas !== cl.paginasEnClasesCiegas) return `las páginas de ciegasDetalle suman ${sumaCiegas} y paginasEnClasesCiegas dice ${cl.paginasEnClasesCiegas}`;
      if (!cl.queSonLasCiegas) return "sin `clases.queSonLasCiegas`: la limitación quedaría declarada sin decir QUÉ es (§regla 14, mitad 2)";
      if (!pg.fueraPorPosicionYFrontera) return "sin el reparto por posición y frontera: «última 4 de 28» se leería como 24 de hueco";
      for (const [pos, v] of Object.entries(pg.fueraPorPosicionYFrontera)) {
        const sf = Object.values(v.fuera).reduce((a, b) => a + b, 0);
        if (v.compara + sf !== v.delUniverso) return `${pos}: compara ${v.compara} + fuera ${sf} ≠ universo ${v.delUniverso}`;
      }
      if (typeof pg.fueraQueEsHueco !== "number")
        return "sin `fueraQueEsHueco`: sin él las decisiones firmadas y el hueco real se cuentan en el mismo montón";
      if (!pg.ultimaConContenido) return "sin `ultimaConContenido`: `pos` va sobre la serie SERVIDA y nadie lo diría";
      /* Un reparto que dejara todo en un solo cubo no lo caza ninguna suma. */
      if (Object.keys(pg.fueraPorFrontera ?? {}).length < 2)
        return `el reparto por frontera tiene ${Object.keys(pg.fueraPorFrontera ?? {}).length} cubo(s): un clasificador que lo mete todo en uno da un reparto que suma y no dice nada`;
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
  {
    /**
     * ⚠ Este sabotaje vacía **UNA** página, no el universo: es el caso que el
     * agregado se traga. Con 82 páginas y ~10 000 pares, una muda no mueve un
     * dígito del total — así que si el contrato sólo vive en agregado, esta
     * corrida saldría **verde**.
     */
    etiqueta: "pagina-sin-pares",
    porQue: "UNA página del universo rinde 0 pares ⇒ exit 2, en vez de desaparecer dentro del agregado",
    env: { SABOTAJE: "pagina-sin-pares" },
    exit: 2,
    salidaTiene: /CERO pares|MENOS de 1 par/,
  },
  {
    /**
     * ⚠ **El fallo que este sabotaje imita NO es «falta una página»: es que
     * `lh-serie` RENOMBRE `vacia`.** Sin la comprobación de tipo, `!undefined`
     * es `true` y **las 65 páginas vacías se rebucketean a «el espejo no las
     * trae»** — o sea un hueco de 65 inventado, que además es el número que la
     * §regla 14 manda publicar. Es §sondas 4 en su tercera cara: un detector que
     * encuentra MÁS de lo que hay no da error, da un número plausible de más.
     */
    etiqueta: "frontera-sin-explicar",
    porQue: "una página fuera con `vacia` sin tipo ⇒ TIRA, en vez de caer en «el espejo no la trae» e inventar hueco",
    env: { SABOTAJE: "frontera-sin-explicar" },
    exit: 1,
    salidaTiene: /sin frontera que lo explique/,
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
