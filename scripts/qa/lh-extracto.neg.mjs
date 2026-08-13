/**
 * TEST EN NEGATIVO de `lh-extracto`.
 * Uso: npm run qa:lh-extracto-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda **establece dos hechos** en vez de comparar dos lados, así que su
 * negativo tiene que probar que **no puede establecerlos cuando no los hay**:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-corpus` | **CORPUS AUSENTE** | «0 distintos / 0 deriva», que son los dos ceros que engañan |
 * | `sin-espejo` | **ESPEJO AUSENTE** | «0 titulares cambiaron» |
 * | `mecanismo-unico` | **0 posts con extracto DISTINTO** | verde: si los dos listados dieran el mismo texto, LH-SP10 no estaría contestada |
 *
 * `mecanismo-unico` es el que importa, y es el §sondas 8a en su forma pura: el
 * sabotaje **fuerza que los dos mecanismos coincidan** y la sonda tiene que
 * dejar de afirmar que son dos. Sin él, un emparejado roto —o un sitio que
 * unificara las dos pieles— saldría **verde afirmando lo contrario de lo que
 * pasa**, porque su conclusión está escrita en el código y no en el dato.
 *
 * ── EL CONTROL (§sondas, regla 8a) ────────────────────────────────────────
 * Sin sabotaje: verde, con `distintos > 0` **y** `cambiaron > 0`. Si el control
 * no encontrara ninguna de las dos cosas, los rojos de abajo no probarían nada:
 * podrían venir de un corpus que no se lee.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-extracto.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: los DOS hechos se establecen — dos mecanismos y deriva acotada",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      if (!j.sp10.distintos) return "0 posts con extracto distinto en el CONTROL: el sabotaje `mecanismo-unico` no probaría nada";
      if (!j.sp10.postsEnLosDos) return "0 posts en los dos listados: no hay intersección que cruzar";
      /* La deriva tiene que ser > 0 en el control: es el hecho que la sonda
       * viene a acotar, y un cero aquí haría indistinguible «no hay deriva» de
       * «no se comparó» — que es justo lo que esta sonda existe para separar. */
      if (!j.deriva.cambiaron) return "0 titulares cambiados en el control: la deriva no se estaría midiendo";
      if (!j.deriva.paresTitulo) return "0 titulares comparados: el emparejado contra el espejo está roto";
      /* Y el alcance declarado, porque un lector que no lo vea creerá que
       * `/recursos/*` está medido (§la cobertura se declara en su unidad). */
      if (!/recursos/.test(j.meta.alcance)) return "el alcance no declara que `/recursos/*` queda fuera";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "el corpus no está ⇒ CORPUS AUSENTE, nunca «0 distintos»",
    env: { SABOTAJE: "sin-corpus" },
    exitNoCero: true,
    salidaTiene: /CORPUS AUSENTE/,
  },
  {
    etiqueta: "sin-espejo",
    porQue: "el espejo no está ⇒ ESPEJO AUSENTE, nunca «0 titulares cambiaron»",
    env: { SABOTAJE: "sin-espejo" },
    exitNoCero: true,
    salidaTiene: /ESPEJO AUSENTE/,
  },
  {
    etiqueta: "mecanismo-unico",
    porQue: "los dos listados devuelven el MISMO texto ⇒ LH-SP10 deja de estar contestada",
    env: { SABOTAJE: "mecanismo-unico" },
    exit: 2,
    congela: true,
    salidaTiene: /0 posts con extracto DISTINTO/,
    comprueba: (j) => {
      if (j.sp10.distintos !== 0) return `el sabotaje no se aplicó: siguen saliendo ${j.sp10.distintos} distintos`;
      if (!j.sp10.postsEnLosDos) return "cayó por no tener intersección, que es el discriminador de otro fallo";
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-extracto ════════`);
console.log(`  alcance: corpus F3-0 de listados (/blog y /etiqueta/*), sin red\n`);

const ev = new Evaluadas({ nombre: "lh-extracto-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-extracto.mjs")], env: c.env, timeout: 600_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.exitNoCero && res.status === 0) mal = `esperaba exit ≠ 0, salió 0 — un fallo de precondición NO puede salir verde`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.congela && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-extracto · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los dos hechos que esta sonda afirma dejan de afirmarse cuando el dato no los\n` +
        `   sostiene: sin corpus, sin espejo, o con un solo mecanismo. Un verde suyo\n` +
        `   significa que los cruzó, no que no encontró nada.\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
