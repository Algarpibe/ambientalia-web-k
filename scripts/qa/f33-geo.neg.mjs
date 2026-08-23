/**
 * TEST EN NEGATIVO de `f33-geo`.
 * Uso: npm run qa:f33-geo-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTA SONDA NO COMPARA: DESCRIBE. Así que su modo de fallo no es un Δ0 falso —
 * son **ceros y plenos disfrazados de dato**, y hay que saberlos separar:
 *
 * | caso | cae por | y NO por |
 * |---|---|---|
 * | `control` | 31 páginas · 313 módulos en el DOM · dominio cruzado con el `<body>` · determinismo | «no hay módulos», que es lo que sale de no mirar |
 * | `selector-muerto` | **error**: el selector de sección no casa en NINGUNA página | contar 0 secciones y salir en verde (§sondas 4) |
 * | `dominio-corto` | **error de CONTRATO**: 4 páginas de 31 ⇒ NO SE PUDO EVALUAR | un informe sobre 4 páginas leído como si fueran 31 (§regla 22) |
 * | `sin-hojas` | **error**: las hojas no se resuelven ⇒ la geometría sería FICCIÓN PLAUSIBLE | un número plausible sin CSS, que es el peor de los tres |
 *
 * ⚠⚠ **`sin-hojas` es EL caso, y no por el código de salida.** Está medido en
 * este repo (§F3-1-CSS-NO-CAPTURADO) que una captura sin hojas da
 * `columna.width` **678.52** contra **430.80** en vivo: **no falla, mide otra
 * cosa**. Por eso el control no se conforma con el exit — exige que el número
 * **se mueva** respecto al control, que es la única forma de probar que las
 * hojas están haciendo algo (§regla 8: *un negativo sin control no es un
 * negativo*).
 *
 * ⚠ **Y `control` comprueba DETERMINISMO, que no es adorno**: la primera
 * versión de la sonda derivaba `269` y `270` módulos con caja en corridas del
 * mismo código, y el diff estaba **confinado a `image`** — un `loading=lazy`
 * sin neutralizar. La explicación aburrida (§regla 16) resultó ser la buena, y
 * el control existe para que si vuelve, se vea aquí y no en una tabla.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/f33-geo.json";
const leeCongelada = (etiqueta) => {
  const f = nombreNeg(join(QA, CANONICA), etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 31 páginas, el dominio cruzado con el <body>, el ancho de fila ANTES de los defaults",
    env: {},
    exit: 0,
    salidaTiene: /EL ANCHO DE FILA REAL, POR RÉGIMEN/,
    comprueba: (j) => {
      const d = j.meta?.dominio ?? {};
      if (!d.rutasDeclaradas) return "sin `dominio.rutasDeclaradas`: la membresía no se está derivando de `f33-rutas.json`";
      if (d.medidas !== d.rutasDeclaradas) return `midió ${d.medidas} de ${d.rutasDeclaradas} rutas declaradas`;
      if (d.controlCruzadoSinglePost !== 0)
        return `${d.controlCruzadoSinglePost} rutas con \`single-post\`: dos instrumentos en desacuerdo sobre el dominio`;
      /* §*un censo de NODOS y un censo de LO QUE SE VE son dos medidas distintas*:
       * si no publica los dos criterios, su recuento no se puede leer. */
      const c = j.criterioDeRecuento ?? {};
      if (!c.modulos || typeof c.modulos.conCaja !== "number")
        return "no publica el criterio de recuento: «en el DOM» y «con caja» no son la misma medida y hay que decirlo";
      if (!(c.modulos.conCaja > 0)) return "0 módulos con caja: nada de lo de abajo sería medible";
      if (!(c.modulos.enElDom >= c.modulos.conCaja)) return "el recuento con caja supera al del DOM: el reparto está roto";
      /* El ancho de fila va ANTES de cualquier default, y con más de un valor:
       * si sólo hubiera uno, fila y columna estarían confundidas y la regla de
       * `mb` no se podría separar (§dos variables confundidas). */
      const s = j.separabilidadFilaColumna ?? {};
      if (!(s.anchosDistintos > 1))
        return `un solo ancho de fila (${s.anchosDistintos}): fila y tipo de columna estarían CONFUNDIDAS y la regla de \`mb\` no se puede separar`;
      /* Y el cruce del default de `mb` tiene que publicar sus SEPARADORAS, no
       * sólo su acierto (§*un modelo se elige por lo que lo SEPARA*). */
      const mb = j.defaultMbPorAnchoDeFila ?? {};
      if (typeof mb.nSeparadoras !== "number")
        return "no publica `nSeparadoras` del default de `mb`: un acierto sin separadoras no elige entre los dos modelos";
      if (mb.conElDefaultDeOtraFila !== 0)
        return `${mb.conElDefaultDeOtraFila} módulos con el default de OTRO ancho de fila: la regla de la FILA no se sostendría`;
      /* `anchoPct` no significa lo mismo en todos los tipos, y eso se declara. */
      if (!j.anchoPctPorDisplay) return "no publica `anchoPctPorDisplay`: en los módulos enlínea la caja es la del contenido y `anchoPct` no es el ancho declarado";
      /* CORTE LIMPIO 2 y las celdas sin escribir, NOMBRADOS y con su cardinal. */
      if (!Array.isArray(j.corteLimpio2)) return "sin `corteLimpio2`: lo que no se puede derivar sale NOMBRADO, no contado";
      if (!Array.isArray(j.ejesSinEscribir) || j.ejesSinEscribir.length === 0)
        return "0 celdas `SIN ESCRIBIR`: el valor 0 es el INICIAL y el test A no puede separarlo de «nadie tocó nada» — que salga 0 aquí significa que esa lectura se perdió";
      if (!j.meta.noContesta?.length) return "sin `noContesta`: una derivación que no declara su alcance es la trampa que persigue";
      /* §regla 14 · toda línea de alcance lleva su número. */
      const sinNumero = j.meta.noContesta.filter((l) => !/\d/.test(l));
      if (sinNumero.length > 2) return `${sinNumero.length} líneas de \`noContesta\` SIN número (§regla 14): «${sinNumero[0]}»`;
      return null;
    },
  },
  {
    etiqueta: "selector-muerto",
    porQue: "el selector de sección no casa en ninguna página ⇒ error, nunca un cero",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /0 módulos en 31 páginas|SELECTOR\(ES\) MUERTO/,
  },
  {
    etiqueta: "dominio-corto",
    porQue: "4 páginas de 31 ⇒ el CONTRATO cierra el código de salida; el informe NO se lee como si fueran 31",
    env: { SABOTAJE: "dominio-corto" },
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
    comprueba: () => null,
  },
  {
    etiqueta: "sin-hojas",
    porQue: "sin CSS la geometría es FICCIÓN PLAUSIBLE — y el control exige que los NÚMEROS se muevan, no sólo el exit",
    env: { SABOTAJE: "sin-hojas" },
    exit: 2,
    salidaTiene: /FICCIÓN PLAUSIBLE/,
    comprueba: (j) => {
      const ctrl = leeCongelada("control");
      if (!ctrl) return "sin la congelada del `control` no hay con qué comparar: un negativo sin control no es un negativo (§regla 8)";
      /**
       * ⚠ **El exit NO basta, y por eso este control existe.** Sin hojas la
       * sonda sale roja por la guarda de `hojasCero` — pero eso sólo prueba que
       * la guarda cuenta hojas, **no** que las hojas cambien la geometría. Lo
       * que lo prueba es que el ancho de fila DEJE de ser el mismo: si saliera
       * igual, las hojas no estarían haciendo nada y toda la medida offline
       * sería aire.
       */
      const a = JSON.stringify(ctrl.anchoDeFilaPorRegimen ?? {});
      const b = JSON.stringify(j.anchoDeFilaPorRegimen ?? {});
      if (a === b)
        return `el ancho de fila NO cambia sin las hojas (${b}) — o las hojas no llegan nunca, o no afectan a la geometría; en los dos casos la medida offline no vale`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · f33-geo ════════`);
console.log(`  alcance: corpus de fase-3 + sus hojas · SIN red y SIN clon (un solo lado: el original capturado)\n`);

const ev = new Evaluadas({ nombre: "f33-geo-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "f33-geo.mjs")], env: c.env, timeout: 900_000 });
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
  `\n${fallos === 0 ? "✅" : "❌"} f33-geo · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La geometría sale del CORPUS CON SUS HOJAS y no del instrumento: un selector muerto y un\n` +
        `   dominio encogido salen por error, y las hojas se prueban exigiendo que el ANCHO DE FILA\n` +
        `   se mueva al quitarlas — no con el código de salida, que sólo diría que la guarda cuenta.\n`
      : `   La geometría no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
