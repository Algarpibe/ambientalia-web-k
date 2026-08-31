/**
 * TEST EN NEGATIVO de `medida-bp` — entero, y **cada sabotaje cae por SU
 * invariante**, no por otro.
 *
 * `medida-bp` es la primera guarda que `medida()` ha tenido nunca, y su verde
 * es lo que autoriza a decir *«el grupo tiene una posición por cada punto de
 * ruptura que el editor escribe»*. Si la comprobación no sabe fallar, esa frase
 * no vale nada — y peor: la 126.ª acaba de AÑADIR una posición, así que un
 * verde mudo diría que la posición nueva está bien puesta cuando lo único
 * demostrado sería que la sonda no mira.
 *
 * ── EL CONTROL VA PRIMERO, y no es una formalidad ─────────────────────────
 *
 * §regla 8: *un sabotaje que no cambia el resultado no ha probado la guarda —
 * ha probado que el instrumento no la ejercita*. Así que el caso `control`
 * corre la sonda SIN sabotaje y exige **exit 0**. Sin él, cuatro rojos no
 * distinguen «la guarda muerde» de «la sonda está rota y falla siempre».
 *
 * ── LOS CUATRO SABOTAJES, todos sobre EL DATO y ninguno sobre el umbral ───
 *
 *   · `posicion-fuera`   → se quita la posición nueva. Es el sabotaje que
 *     reproduce el estado ANTERIOR a la 126.ª: dos posiciones para tres
 *     breakpoints medidos. Tiene que salir NOMBRANDO `valor767`, no como un
 *     total.
 *   · `unidad-colision`  → la unidad de la posición nueva se bautiza
 *     `movilUnidad`. Reproduce **exactamente** el defecto de la versión vieja de
 *     `unidadDe` (ternario de dos ramas), que es el modo de fallo del que este
 *     invariante protege — y que NO da error de tipos: dos campos con el mismo
 *     `name` en un grupo se comen el uno al otro en silencio.
 *   · `validate-mudo`    → el `validate` de la unidad nueva devuelve `true`
 *     siempre. Reproduce la unidad SUPUESTA en vez de rechazada, o sea el
 *     defecto que `medida()` existe para corregir.
 *   · `render-otro-ancho`→ el `@media` que envuelve `-movil` pasa a 900. Es el
 *     único cruce que no se puede contestar leyendo el esquema, y su modo de
 *     fallo es *el esquema nombra un ancho y el render aplica otro* — que es
 *     literalmente el hallazgo de la 126.ª con el signo cambiado.
 *
 * ⚠ **Ninguno edita un fichero versionado.** Todos entran por `SABOTAJE=` y
 * actúan en memoria: §regla 20 — un `finally` no corre cuando matan el proceso
 * por señal, así que un sabotaje que edita el fuente **se queda escrito** y el
 * siguiente `git add -A` lo commitea.
 *
 * ⚠⚠ **Y `render-otro-ancho` NO se ata al código de salida y ya está**
 * (§regla 21, la vuelta): se exige que la sonda **NOMBRE** el ancho que
 * encontró. Un caso atado sólo al `exit` caduca el día que alguien cablee el
 * tramo `≤767`, y entonces seguiría en verde sin separar nada.
 *
 * Uso: npm run qa:medida-bp-neg
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "./lib.mjs";

const SONDA = join(QA, "medida-bp.mjs");

const casos = [
  {
    etiqueta: "control",
    sabotaje: null,
    porQue: "SIN sabotaje la sonda tiene que salir en VERDE — o sus rojos no prueban nada (§regla 8)",
    exitEsperado: 0,
    salidaTiene: /evaluadas 3\/3 posiciones de breakpoint/,
    comprueba: (d) =>
      d.esquema?.valores?.length === 3 && d.nFallos === 0
        ? null
        : `el control tendría que ver 3 posiciones y 0 fallos; vio ${d.esquema?.valores?.length} y ${d.nFallos}`,
  },
  {
    etiqueta: "posicion-fuera",
    sabotaje: "posicion-fuera",
    porQue: "quitada la posición nueva ⇒ el grupo vuelve a tener 2 para 3 breakpoints medidos",
    exitEsperado: 1,
    salidaTiene: /POSICIONES: el grupo tiene una por cada punto de ruptura/,
    comprueba: (d) => {
      const c = d.controles?.find((x) => x.nombre.startsWith("POSICIONES"));
      if (!c || c.ok) return "el control de POSICIONES tendría que estar en rojo";
      if (!/esquema=2/.test(c.detalle)) return `el detalle tendría que decir esquema=2; dijo «${c.detalle}»`;
      return null;
    },
  },
  {
    etiqueta: "unidad-colision",
    sabotaje: "unidad-colision",
    porQue: "la unidad nueva bautizada `movilUnidad` ⇒ colisiona y se come el campo, sin error de tipos",
    exitEsperado: 1,
    salidaTiene: /los nombres de unidad son DISTINTOS/,
    comprueba: (d) => {
      const c = d.controles?.find((x) => x.nombre.includes("nombres de unidad"));
      if (!c || c.ok) return "el control de colisión de unidades tendría que estar en rojo";
      if (!/movilUnidad/.test(c.detalle)) return `tendría que NOMBRAR la unidad que colisiona; dijo «${c.detalle}»`;
      /* Y tiene que caer POR SU MOTIVO: las POSICIONES siguen siendo 3. */
      const pos = d.controles.find((x) => x.nombre.startsWith("POSICIONES"));
      if (!pos?.ok) return "cayó también POSICIONES: el sabotaje no está aislado";
      return null;
    },
  },
  {
    etiqueta: "validate-mudo",
    sabotaje: "validate-mudo",
    porQue: "el `validate` de la unidad nueva devuelve true siempre ⇒ la unidad se supone en vez de rechazarse",
    exitEsperado: 1,
    salidaTiene: /VALIDATE: la unidad se rechaza en cuanto hay valor/,
    comprueba: (d) => {
      const c = d.controles?.find((x) => x.nombre.startsWith("VALIDATE:"));
      if (!c || c.ok) return "el control del validate tendría que estar en rojo";
      if (!/valor767/.test(c.detalle)) return `tendría que NOMBRAR la posición muda; dijo «${c.detalle}»`;
      const nombres = d.controles.filter((x) => !x.ok).map((x) => x.nombre);
      if (nombres.length !== 1) return `cayeron ${nombres.length} controles (${nombres.join(" · ")}): el sabotaje no está aislado`;
      return null;
    },
  },
  {
    etiqueta: "render-otro-ancho",
    sabotaje: "render-otro-ancho",
    porQue: "el render aplica `-movil` a 900 ⇒ el esquema nombra un ancho y el render aplica otro",
    exitEsperado: 1,
    salidaTiene: /se sirve al ancho que el esquema dice/,
    comprueba: (d) => {
      const c = d.controles?.find((x) => x.nombre.includes("se sirve al ancho"));
      if (!c || c.ok) return "el cruce con el render tendría que estar en rojo";
      /* §regla 21 (la vuelta): no basta el exit — tiene que NOMBRAR el ancho. */
      if (!/900/.test(c.detalle)) return `tendría que NOMBRAR el ancho que encontró; dijo «${c.detalle}»`;
      return null;
    },
  },
];

const ev = new Evaluadas({ unidad: "casos", minimo: casos.length, nombre: "medida-bp-neg" });

let fallos = 0;
for (const c of casos) {
  const salida = join(QA, "medidas", c.sabotaje ? `medida-bp-neg-${c.sabotaje}.json` : "medida-bp-neg-control.json");
  if (existsSync(salida)) rmSync(salida);

  const r = corridaNegativa({
    etiqueta: c.sabotaje ? `${c.sabotaje}` : "control",
    args: [SONDA],
    env: c.sabotaje ? { SABOTAJE: c.sabotaje } : {},
  });
  const texto = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const problemas = [];

  if (r.status !== c.exitEsperado) problemas.push(`exit ${r.status} (esperado ${c.exitEsperado})`);
  if (!c.salidaTiene.test(texto)) problemas.push(`la salida NO nombra su motivo (${c.salidaTiene})`);

  if (!existsSync(salida)) problemas.push(`no congeló ${salida}`);
  else {
    const d = JSON.parse(readFileSync(salida, "utf8"));
    const p = c.comprueba(d);
    if (p) problemas.push(p);
  }

  ev.ok(1);
  if (problemas.length) {
    fallos++;
    console.error(`❌ ${c.etiqueta} — ${c.porQue}`);
    for (const p of problemas) console.error(`     · ${p}`);
  } else {
    console.log(`✓ ${c.etiqueta} — ${c.porQue}`);
  }
}

console.log(`\n✓ evaluadas ${casos.length}/${casos.length} casos · ${casos.length - fallos}/${casos.length} en verde`);
if (fallos) {
  console.error(`❌ ${fallos} caso(s) del negativo en rojo`);
  process.exit(1);
}
