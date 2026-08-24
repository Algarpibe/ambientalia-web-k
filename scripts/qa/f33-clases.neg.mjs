/**
 * TEST EN NEGATIVO de `f33-clases`.
 * Uso: npm run qa:f33-clases-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTA SONDA NO COMPARA: DERIVA. Así que su modo de fallo no es un Δ0 falso —
 * es **un default PLAUSIBLE**, que es peor, porque se copia a una hoja y de ahí
 * a 31 páginas. Los cinco casos van cada uno a un modo distinto:
 *
 * | caso | cae por | y NO por |
 * |---|---|---|
 * | `control` | 31 páginas · 313 módulos y 11 tipos cruzados con `f33-spec` · separadoras > 0 · hojas parejas entre anchos · determinismo | «no hay reglas», que es lo que sale de no mirar |
 * | `selector-muerto` | **error**: el selector de sección no casa en NINGUNA página | contar 0 secciones y salir en verde (§sondas 4) |
 * | `dominio-corto` | **error de CONTRATO**: 4 páginas de 31 ⇒ NO SE PUDO EVALUAR | un informe sobre 4 leído como si fueran 31 (§regla 22) |
 * | `sin-hojas` | **error**, y además los NÚMEROS se mueven | un número plausible sin CSS |
 * | `ordinal-ciego` | **error**: sin discriminador los overrides del editor entran en el default y aparecen los conflictos | un default «de la mayoría», que es el arreglo falso |
 * | `movil-recarga` | **error**: las hojas enlazadas se caen entre cargar y medir | 249.594 de ancho de fila leído como dato del original |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ `ordinal-ciego` ES **EL** CASO, Y ES EL QUE EL ENCARGO MANDÓ COMPROBAR
 *
 * La 101.ª declaró que su `f33-cmp-neg` tiene un hueco: **sus tres casos copian
 * el lado del original sobre el del clon**, así que los selectores del lado del
 * clon nunca se ejercitan — **0 instancias separadoras** — y por eso el negativo
 * no pudo cazar que el comparador no vería ni un módulo.
 *
 * La forma equivalente aquí sería tener cinco casos y que **ninguno tocara la
 * CASCADA**, que es el canal entero sobre el que esta sonda se apoya: entonces
 * los cinco podrían pasar con el discriminador roto. `ordinal-ciego` lo anula —
 * y no anula «media hipótesis» (§regla 17, 2.ª cara): apaga `esOrdinal()`
 * ENTERO, que es lo único que separa al editor de la plantilla.
 *
 * **Y su poder discriminante se PUBLICA, no se supone:** el control exige
 * `separadorasDelDiscriminador > 0` en la corrida limpia. Si fuera 0, «con
 * ordinal» y «sin ordinal» predecirían lo mismo en todo el dominio y este caso
 * no probaría nada — sería un sabotaje sin separadoras, verde y mudo. Hoy son
 * **297 nodos**, derivado y no recordado.
 *
 * ⚠ **`movil-recarga` NO es hipotético: es el defecto que esta tanda encontró
 * VIVO.** `setViewport({isMobile})` recarga la página, la recarga vuelve al
 * fichero crudo y se lleva los siete `<link>` reescritos a `file://`. Quedan las
 * hojas en línea, así que **la medida no falla: sale plausible** — fila
 * **249.594** contra los **335.391** reales, en 6 de 6 rutas comprobadas. El
 * caso existe para que la guarda que lo caza no pueda relajarse en silencio.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/f33-clases.json";
const leeCongelada = (etiqueta) => {
  const f = nombreNeg(join(QA, CANONICA), etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 31 páginas, el cruce con f33-spec, las hojas parejas entre anchos y el discriminador con separadoras",
    env: {},
    exit: 0,
    salidaTiene: /CLASES `f33-\*` DERIVADAS/,
    comprueba: (j) => {
      const d = j.meta?.dominio ?? {};
      if (d.medidas !== d.rutasDeclaradas) return `midió ${d.medidas} de ${d.rutasDeclaradas} rutas declaradas`;

      /* §sondas 4: cruzar con otra medida del mismo objeto es obligatorio. */
      const c = j.controles ?? {};
      if (c.modulos !== c.modulosCruzadoConF33Spec) return `${c.modulos} módulos contra los ${c.modulosCruzadoConF33Spec} de f33-spec`;
      if (c.tipos !== c.tiposCruzadoConF33Spec) return `${c.tipos} tipos contra los ${c.tiposCruzadoConF33Spec} de f33-spec`;

      /**
       * ⚠ **EL NÚMERO SIN EL CUAL EL VERDE NO DICE NADA** (§*un verde vale lo
       * que valen sus instancias separadoras, no su recuento de pares*).
       */
      if (!(c.separadorasDelDiscriminador > 0))
        return "0 separadoras del discriminador: «con ordinal» y «sin ordinal» predecirían lo mismo, así que el default no está ELEGIDO sino escrito";

      /* La guarda de las hojas, en el ancho donde se cayeron. */
      if (c.hojas?.desparejadasEntreAnchos !== 0)
        return `${c.hojas?.desparejadasEntreAnchos} página(s) con distinto nº de hojas entre 1440 y 390: la medida de un ancho no es del original`;
      if (c.hojas?.paginasConCero !== 0) return `${c.hojas?.paginasConCero} página(s) con 0 hojas resueltas`;

      /* §*lo que no tiene caja no se cuenta NI SE ANALIZA*, y su cardinal se publica. */
      if (typeof c.nodosSinCaja !== "number" || !c.sinCajaPorTipo)
        return "no publica el reparto de nodos SIN CAJA: getComputedStyle sobre ellos devuelve ceros que entran como dato";
      if (!(c.nodosVivos > 0 && c.nodosVivos < c.nodosTotales))
        return "el reparto vivos/totales está roto: o no excluye nada o no deja nada";

      /* CORTE LIMPIO 1: lo que no se deriva sale NOMBRADO, no contado. */
      if (!Array.isArray(j.sinDerivar)) return "sin `sinDerivar`: lo no derivable tiene que salir nombrado con lo que haría falta";
      if (!Array.isArray(j.familiasSinDerivar) || j.familiasSinDerivar.length === 0)
        return "0 familias SIN DERIVAR: esta sonda mide caja y ritmo, no tipografía — que salga 0 significa que esa declaración se perdió";
      for (const f of j.familiasSinDerivar) if (!f.haceFalta) return `la familia ${f.familia} no dice QUÉ haría falta`;

      /* §regla 14: toda línea de alcance con su número. */
      if (!j.meta.noContesta?.length) return "sin `noContesta`: una derivación que no declara su alcance es la trampa que persigue";
      const sinNumero = j.meta.noContesta.filter((l) => !/\d/.test(l));
      if (sinNumero.length > 2) return `${sinNumero.length} líneas de \`noContesta\` SIN número (§regla 14): «${sinNumero[0]}»`;

      /* Y el default que decide el alto de la página tiene que estar derivado. */
      const mb = j.reglas.filter((r) => /^\.f33-col-\S+ > \.f33-modulo$/.test(r.selector) && r.prop === "margin-bottom" && r.n > 0);
      if (mb.length < 4) return `sólo ${mb.length} repartos con default de \`margin-bottom\` derivado: la retícula quedaría a medias`;
      const ambiguos = mb.filter((r) => r.declarado1440.length !== 1);
      if (ambiguos.length) return `${ambiguos.length} reparto(s) con más de un default de \`margin-bottom\`: ${ambiguos[0].selector}`;
      return null;
    },
  },
  {
    etiqueta: "selector-muerto",
    porQue: "el selector de sección no casa en ninguna página ⇒ error, nunca un cero",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO|CRUCE ROTO/,
  },
  {
    etiqueta: "dominio-corto",
    porQue: "4 páginas de 31 ⇒ el CONTRATO cierra el código de salida; el informe NO se lee como si fueran 31",
    env: { SABOTAJE: "dominio-corto" },
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
  },
  {
    etiqueta: "sin-hojas",
    porQue: "sin CSS la cascada está vacía — y el control exige que los NÚMEROS se muevan, no sólo el exit",
    env: { SABOTAJE: "sin-hojas" },
    exit: 2,
    salidaTiene: /FICCIÓN PLAUSIBLE/,
    comprueba: (j) => {
      const ctrl = leeCongelada("control");
      if (!ctrl) return "sin la congelada del `control` no hay con qué comparar: un negativo sin control no es un negativo (§regla 8)";
      /**
       * El exit NO basta: sale roja por la guarda que cuenta hojas, y eso sólo
       * prueba que la guarda cuenta. Lo que prueba que las hojas HACEN algo es
       * que el ancho de columna deje de ser el mismo — si saliera igual, toda la
       * medida offline sería aire.
       */
      const a = JSON.stringify(ctrl.anchoPorReparto ?? {});
      const b = JSON.stringify(j.anchoPorReparto ?? {});
      if (a === b) return "el ancho por reparto NO cambia sin las hojas: o no llegan nunca, o no afectan a la geometría";
      return null;
    },
  },
  {
    etiqueta: "ordinal-ciego",
    porQue: "sin discriminador, los overrides del EDITOR entran en la población del default y aparecen los conflictos",
    env: { SABOTAJE: "ordinal-ciego" },
    exit: 2,
    comprueba: (j) => {
      const ctrl = leeCongelada("control");
      if (!ctrl) return "sin la congelada del `control` no hay con qué comparar (§regla 8)";
      /**
       * ⚠ **El sabotaje anula el discriminador ENTERO, y su efecto se comprueba
       * en las DOS direcciones** — que es lo que distingue «lo apagué» de «no
       * había nada que apagar»:
       *   · las separadoras tienen que caer a CERO (no hay editor que detectar);
       *   · y de ahí tienen que salir CONFLICTOS que la corrida limpia no tiene.
       * Sin la segunda, apagarlo podría ser inocuo y el caso pasaría igual.
       */
      if (j.controles?.separadorasDelDiscriminador !== 0)
        return `con el discriminador ciego siguen saliendo ${j.controles?.separadorasDelDiscriminador} separadoras: el sabotaje no lo apagó`;
      if (!(ctrl.controles?.separadorasDelDiscriminador > 0))
        return "la corrida limpia tiene 0 separadoras: este sabotaje no puede probar nada (0 instancias separadoras, §regla 17)";
      const antes = ctrl.problemas.length + ctrl.sinDerivar.length;
      const ahora = j.problemas.length + j.sinDerivar.length;
      if (!(ahora > antes))
        return `sin discriminador salen ${ahora} indeterminaciones y con él ${antes}: el canal de la CASCADA no está haciendo el trabajo que la sonda le atribuye`;
      return null;
    },
  },
  {
    etiqueta: "movil-recarga",
    porQue: "el camino viejo recarga y se lleva las hojas ENLAZADAS: la medida de 390 sale plausible y falsa",
    env: { SABOTAJE: "movil-recarga" },
    exit: 2,
    salidaTiene: /DISTINTO nº de hojas aplicadas/,
    comprueba: (j) => {
      const ctrl = leeCongelada("control");
      if (!ctrl) return "sin la congelada del `control` no hay con qué comparar (§regla 8)";
      if (!(j.controles?.hojas?.desparejadasEntreAnchos > 0))
        return "la guarda no ve ninguna página desparejada: el sabotaje no reproduce la recarga";
      /* Y que el número se MUEVA, que es lo que hace al defecto peligroso: si el
       * ancho saliera igual, perder las hojas a 390 no costaría nada. */
      const a = JSON.stringify(ctrl.reglas.find((r) => r.selector === ".f33-fila" && r.prop === "width")?.declarado390 ?? []);
      const b = JSON.stringify(j.reglas.find((r) => r.selector === ".f33-fila" && r.prop === "width")?.declarado390 ?? []);
      if (a === b) return `el ancho de fila a 390 no cambia con la recarga (${b}): entonces la recarga no se lleva nada que importe`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · f33-clases ════════`);
console.log(`  alcance: corpus de fase-3 + sus hojas · SIN red y SIN clon (un solo lado: el original capturado)`);
console.log(`  el canal que esta sonda estrena es la CASCADA, y \`ordinal-ciego\` es el caso que lo ejercita\n`);

const ev = new Evaluadas({ nombre: "f33-clases-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "f33-clases.mjs")], env: c.env, timeout: 1_800_000 });
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
    /**
     * ⚠ **EL MOTIVO DEL HIJO SE IMPRIME, Y NO ES COMODIDAD: SIN ÉL UN CASO
     * ROJO NO SE PUEDE ADJUDICAR.**
     *
     * §regla 21 manda distinguir *«el sabotaje dejó de morder»* de *«la sonda
     * tiene razón»*, y el discriminador es correr la sonda sola. Pero cuando lo
     * que falla es que el HIJO revienta —exit 1, o lo matan— la corrida sola
     * **no reproduce nada** y el negativo dice sólo «esperaba 2, salió 1»: una
     * afirmación cierta y muda. Pasó dos veces con `sin-hojas`, que en solitario
     * sale verde las dos.
     *
     * Es §regla 1 cometida sobre el negativo: lo que imprime y lo que cuenta no
     * pueden discrepar, y aquí contaba un fallo cuya razón se estaba tirando.
     */
    if (res.status !== c.exit) {
      const cola = out.trim().split("\n").slice(-12).join("\n      ");
      console.log(`      ── últimas líneas del hijo ──\n      ${cola || "(ninguna: el hijo no llegó a imprimir)"}`);
      if (res.error) console.log(`      error de spawn: ${res.error.code ?? ""} ${res.error.message ?? res.error}`);
      if (res.signal) console.log(`      terminado por SEÑAL: ${res.signal} — no es un veredicto de la sonda`);
    }
  } else console.log(`  ✓  ${c.etiqueta.padEnd(18)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} f33-clases · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El default sale de la CASCADA y no del instrumento: apagar el discriminador mete los overrides\n` +
        `   del editor en la población y saca conflictos, quitar las hojas mueve los anchos, y el camino\n` +
        `   móvil viejo se caza por el nº de hojas aplicadas EN CADA ANCHO — no por el código de salida.\n`
      : `   Los números de \`f33-clases\` no se pueden citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
