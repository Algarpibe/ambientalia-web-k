/**
 * TEST EN NEGATIVO de `f33-spec`.
 * Uso: npm run qa:f33-spec-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTA SONDA NO COMPARA: CENSA. Así que su modo de fallo no es un Δ0 falso —
 * son **ceros disfrazados de dato**, y el más caro ya se cobró en la tanda que
 * la escribió:
 *
 * | caso | cae por | y NO por |
 * |---|---|---|
 * | `control` | 31 páginas · 313 módulos · 11 tipos · el cruce con `f33-geo` · las dos clases conocidas | «no hay módulos», que es lo que sale de no mirar |
 * | `selector-muerto` | **error**: el selector de sección no casa en NINGUNA página | censar 0 módulos y salir en verde (§sondas 4) |
 * | `dominio-corto` | **error de CONTRATO**: 4 páginas de 31 ⇒ NO SE PUDO EVALUAR | un informe sobre 4 leído como si fueran 31 (§regla 22) |
 * | `sin-hojas` | **error**: las hojas no se resuelven ⇒ lo computado sería FICCIÓN PLAUSIBLE | un número plausible sin CSS |
 * | `sin-control` | **error**: las dos clases conocidas se declaran ausentes | que un cero de la SONDA se lea como un dato del ORIGINAL |
 *
 * ⚠⚠ **`sin-control` es EL caso de esta sonda, y existe por una razón medida.**
 * La v1 de `f33-spec` usaba `.et_pb_module` y perdía **`button` entero** —13
 * instancias, 300 módulos y 10 tipos contra 313 y 11—. No dio error: dio un
 * **número plausible**. Lo destapó cruzar con `f33-geo`, que es la única
 * defensa que este repo tiene contra un cero con forma de dato. Así que el
 * cruce y el control de clases conocidas **cierran el código de salida**, no
 * son informativos.
 *
 * ⚠ **Y el sabotaje va en el DATO, no en un umbral** (§regla 28): `sin-control`
 * no baja ningún listón — declara ausentes las dos clases, que es el MODO DE
 * FALLO del que la guarda protege. Bajar un tope no habría mordido, porque el
 * lado medido no es 0.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/f33-spec.json";
const leeCongelada = (etiqueta) => {
  const f = nombreNeg(join(QA, CANONICA), etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 31 páginas, 313 módulos, 11 tipos, el cruce con `f33-geo` y las dos clases conocidas",
    env: {},
    exit: 0,
    salidaTiene: /CRUCE CONTRA/,
    comprueba: (j) => {
      const d = j.meta?.dominio ?? {};
      if (!d.rutasDeclaradas) return "sin `dominio.rutasDeclaradas`: la membresía no se deriva de `f33-rutas.json`";
      if (d.medidas !== d.rutasDeclaradas) return `midió ${d.medidas} de ${d.rutasDeclaradas} declaradas`;
      /* §*un censo de NODOS y un censo de LO QUE SE VE son dos medidas
       * distintas*: si no publica los dos criterios, el recuento no se lee. */
      const c = j.criterioDeRecuento?.modulos ?? {};
      if (typeof c.conCaja !== "number" || typeof c.enElDom !== "number")
        return "no publica el criterio de recuento (DOM vs con caja)";
      if (c.enElDom < c.conCaja) return "el recuento con caja supera al del DOM: el reparto está roto";
      if (c.sinCaja !== c.enElDom - c.conCaja) return "los tres recuentos no cuadran entre sí";
      /* El cruce con el otro instrumento tiene que estar PUBLICADO, no sólo
       * impreso: lo que no se congela no se puede auditar (§regla 2). */
      if (!j.cruce) return "no publica el `cruce` contra `f33-geo`: sin él un tipo entero puede faltar sin dar error";
      if (!j.cruce.modulos?.cuadra || !j.cruce.conCaja?.cuadra)
        return `el cruce con f33-geo NO cuadra: ${JSON.stringify(j.cruce)}`;
      if (j.cruce.tiposSoloEnGeo?.length || j.cruce.tiposSoloEnSpec?.length)
        return `tipos descuadrados: soloGeo=${j.cruce.tiposSoloEnGeo} soloSpec=${j.cruce.tiposSoloEnSpec}`;
      /* Las dos clases CONOCIDAS DE ANTEMANO — el control barato de §sondas 4. */
      if (j.control?.faltan?.length) return `faltan clases conocidas: ${j.control.faltan.map((x) => x.clase).join(" ")}`;
      /* Y el marcado tiene que separar INVARIANTE de VARIABLE: si todo saliera
       * invariante, el censo estaría mirando un solo caso. */
      const tipos = Object.values(j.porTipo ?? {});
      if (tipos.length < 11) return `${tipos.length} tipos: el dominio no está entero`;
      if (!tipos.some((t) => t.clasesVariables?.length))
        return "ningún tipo tiene clases VARIABLES: un censo que sólo ve invariantes está mirando una instancia";
      /* Los SIN CAJA se declaran, no se rellenan con ceros. */
      if (!(c.sinCaja > 0)) return "0 módulos sin caja: `f33-geo` midió 36, así que este censo perdió los desplegables cerrados";
      return null;
    },
  },
  {
    etiqueta: "selector-muerto",
    porQue: "el selector de sección no casa en NINGUNA página ⇒ error, no «esta página no tiene módulos»",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    comprueba: () => null,
  },
  {
    etiqueta: "dominio-corto",
    porQue: "4 páginas de 31 ⇒ el CONTRATO cierra el código de salida",
    env: { SABOTAJE: "dominio-corto" },
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
    comprueba: () => null,
  },
  {
    etiqueta: "sin-hojas",
    porQue: "sin CSS lo computado es FICCIÓN PLAUSIBLE — y el control exige que los NÚMEROS se muevan, no sólo el exit",
    env: { SABOTAJE: "sin-hojas" },
    exit: 2,
    comprueba: (j) => {
      const ctrl = leeCongelada("control");
      if (!ctrl) return "sin la congelada del `control` no hay con qué comparar (§regla 8)";
      /**
       * ⚠ **El exit NO basta.** Sin hojas la sonda sale roja por la guarda de
       * `hojasCero`, y eso sólo prueba que la guarda cuenta hojas — **no** que
       * las hojas cambien lo computado. Lo que lo prueba es que el reparto de
       * `conCaja` DEJE de ser el mismo: sin CSS los desplegables no se cierran,
       * así que los 36 sin caja tienen que desaparecer.
       */
      const a = ctrl.criterioDeRecuento?.modulos?.conCaja;
      const b = j.criterioDeRecuento?.modulos?.conCaja;
      if (a === b)
        return `el reparto con/sin caja NO cambia sin las hojas (${b}) — o las hojas no llegan, o no afectan a lo computado`;
      return null;
    },
  },
  {
    etiqueta: "sin-control",
    porQue: "las dos clases conocidas se declaran ausentes ⇒ el cero se atribuye a la SONDA, no al original",
    env: { SABOTAJE: "sin-control" },
    exit: 2,
    salidaTiene: /CONTROL EN ROJO/,
    comprueba: (j) => {
      if (!j.control?.faltan?.length) return "el sabotaje no llegó: el control sigue declarando 0 ausencias";
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · f33-spec ════════`);
console.log(`  alcance: corpus de fase-3 + sus hojas · SIN red y SIN clon (un solo lado: el original capturado)\n`);

const ev = new Evaluadas({ nombre: "f33-spec-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "f33-spec.mjs")],
    env: { ...c.env, NEG: c.etiqueta },
    timeout: 900_000,
  });
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
  `\n${fallos === 0 ? "✅" : "❌"} f33-spec · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El marcado sale del CORPUS CON SUS HOJAS y no del instrumento: un selector muerto y un\n` +
        `   dominio encogido salen por error, las hojas se prueban exigiendo que el reparto con/sin\n` +
        `   caja SE MUEVA, y el cruce con \`f33-geo\` impide que un tipo entero falte en silencio.\n`
      : `   Un caso en rojo NO es automáticamente un negativo podrido: corre \`npm run qa:f33-spec\`\n` +
        `   sola primero (§regla 21). Si ya sale roja, el hallazgo es de la sonda o del dato.\n`),
);
process.exit(fallos === 0 ? 0 : 1);
