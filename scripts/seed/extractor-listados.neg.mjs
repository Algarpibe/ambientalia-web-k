/**
 * TEST EN NEGATIVO de `extractor-listados`.
 * Uso: npm run cms:extractor-listados-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Un extractor que no encuentra nada y uno que no mira dan **la misma salida**:
 * un JSON con listas vacías y exit 0. Los dos sabotajes atacan ese cero por sus
 * dos puertas.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-corpus` | **CORPUS AUSENTE** | «0 extractos», que es como se lee un extractor mudo |
 * | `extracto-vacio` | **0 extractos extraídos** | verde con la lista vacía |
 * | `via4-muerta` | **0 términos de `resources`** | «recursos no tiene taxonomía» |
 *
 * ── EL CONTROL (§sondas 8a) ───────────────────────────────────────────────
 * Sin sabotaje: 68 extractos, **12 de 12** descripciones y **10 términos de
 * `resources` con 8 padres**. Si el control no sacara las tres cosas, los rojos
 * de abajo no probarían nada — podrían venir de un corpus que no se lee.
 *
 * ⚠ **Y el control exige además que se DESCARTEN las 3 páginas.** Un
 * discriminador que casara en los 13 archivos sería el PLENO de §sondas 4: sin
 * el contraste `page-child`, «10 términos» y «13 términos» se leen igual de
 * bien, y el segundo metería 3 filas inventadas en la taxonomía.
 *
 * ⚠ **Y el control comprueba además la ETIQUETA HTML**, que es lo que decide el
 * tipo del campo en el ESQUEMA: si las descripciones dejaran de traer marcado,
 * `descripcion` habría dejado de ser un campo rico **sin que nada fallara**.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/extractor-listados.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 68 extractos · 12/12 descripciones con su marcado · 10 términos de `resources` (8 con padre) y 3 páginas descartadas",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      if (!j.resumen.extractos) return "0 extractos en el CONTROL: el sabotaje `extracto-vacio` no probaría nada";
      if (j.resumen.terminosConDescripcion !== j.resumen.terminos)
        return `${j.resumen.terminosConDescripcion} de ${j.resumen.terminos} términos con descripción: falta alguna`;
      /* El dato que decide el TIPO del campo (§3a del ESQUEMA). */
      if (!j.resumen.etiquetasHtmlEnDescripcion?.length)
        return "las descripciones no traen marcado: `descripcion` no sería un campo rico y el ESQUEMA estaría mal";
      /* Y que NO se haya guardado el extracto derivado: es la mitad deliberada. */
      if (JSON.stringify(j.meta.noExtrae).indexOf("etiqueta") < 0)
        return "no declara que el extracto de /etiqueta queda FUERA por derivado (LH-SP10)";

      /* ── (3) la jerarquía de `resources` ── */
      if (!j.resumen.categoriasRecursos)
        return "0 términos de `resources` en el CONTROL: el sabotaje `via4-muerta` no probaría nada";
      if (!j.resumen.categoriasRecursosConPadre)
        return "0 términos con `padre`: la jerarquía saldría plana y `D2.8` no tendría dato que sembrar";
      /* El PLENO es tan defecto como el cero: si casaran los 13, las 3 páginas
         entrarían como términos inventados (§sondas 4, el complementario). */
      if (!j.resumen.archivosBajoRecursosDescartadosPorSerPagina)
        return "0 archivos descartados: el discriminador casa en TODOS ⇒ no discrimina, y mete páginas en la taxonomía";
      /* Las dos vías tienen que estar las dos, o «coinciden» no dice nada. */
      const sinDosVias = j.categoriasRecursos.filter((r) => r.padre && r.viaMiga !== r.viaUrl);
      if (sinDosVias.length) return `${sinDosVias.length} término(s) con las dos vías del padre en desacuerdo`;
      /* Y que la conclusión sobre `descripcion` venga de un denominador. */
      if (j.categoriasRecursos.some((r) => r.textoFueraDeLosChips))
        return "algún término trae TEXTO fuera de los chips: `descripcion` sería campo y el ESQUEMA no lo declara";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "el corpus no está ⇒ CORPUS AUSENTE, nunca «0 extractos»",
    env: { SABOTAJE: "sin-corpus" },
    exitNoCero: true,
    salidaTiene: /CORPUS AUSENTE/,
  },
  {
    etiqueta: "extracto-vacio",
    porQue: "las tarjetas devuelven extracto vacío ⇒ el extractor TIRA en vez de congelar una lista vacía",
    env: { SABOTAJE: "extracto-vacio" },
    exitNoCero: true,
    salidaTiene: /0 extractos extraídos/,
  },
  {
    etiqueta: "via4-muerta",
    porQue: "el discriminador del `<body class>` no casa en ninguno ⇒ TIRA, nunca «recursos no tiene taxonomía»",
    env: { SABOTAJE: "via4-muerta" },
    exitNoCero: true,
    salidaTiene: /0 términos de `resources`/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-listados ════════`);
console.log(`  alcance: corpus F3-0 de listados (/blog y /etiqueta/*), sin red\n`);

const ev = new Evaluadas({ nombre: "extractor-listados-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "../seed/extractor-listados.mjs")], env: c.env, timeout: 600_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.exitNoCero && res.status === 0) mal = `esperaba exit ≠ 0, salió 0 — un extractor mudo NO puede salir verde`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.congela && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor-listados · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Las dos puertas del cero están cerradas: sin corpus TIRA, y con las tarjetas\n` +
        `   mudas TIRA. Un verde suyo significa que extrajo, no que no encontró nada.\n`
      : `   Un limpio de este extractor NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
