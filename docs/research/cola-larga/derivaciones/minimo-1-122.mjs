/**
 * 122.ª · PASO 0 punto 5 — ¿SON DOS, O ES UNA CLASE?
 *
 * `clon-base.mjs:415` y `html-cmp.mjs:644` declaran `minimo: 1` en su SEGUNDO
 * contrato (el del nivel de comparación). Antes de dar la clase por cerrada con
 * dos instancias, §regla 9 8.º caso: **el conjunto se DERIVA, no se enumera a
 * mano** — «dos es un gemelo; el censo dirá si son dos».
 *
 * ── Qué separa este censo, y por qué no basta un `grep 'minimo: 1'` ────────
 * `grep` casa dentro de comentarios y de cadenas —§regla 9, mitad de la 121.ª—
 * y `lib.test.mjs` está lleno de FIXTURES que escriben `minimo: 1` a propósito.
 * Por eso el censo va sobre `sinLiterales()`, que es el mismo despojador que
 * `qa:lib` usa para comprobar que las sondas declaran su contrato: instrumento
 * YA ADJUDICADO, no uno nuevo (§sondas 4, cruzar con otra medida del objeto).
 *
 * ── Las DOS preguntas, que no son la misma ────────────────────────────────
 *   A · ¿cuántas declaraciones llevan un `minimo` LITERAL (un número escrito)?
 *   B · ¿cuántas de ésas son un contrato SECUNDARIO — o sea, la sonda ya tenía
 *       otro contrato antes y éste es el del nivel de comparación?
 *
 * La clase de la 122.ª es **B**, no A: un `minimo: 1` en una sonda de un solo
 * contrato cuya unidad es «la única cosa que mira» puede estar bien; lo que no
 * puede estar bien es que el nivel que COMPARA declare 1 teniendo delante un
 * conjunto que él mismo calcula.
 *
 * Control (§regla 8: un negativo sin control no es un negativo): un fixture con
 * el mismo texto en código, en comentario de línea, en comentario de bloque y
 * en cadena. Si el censo no los separa, sus números son del despojador.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sinLiterales } from "../../../../scripts/qa/lib.mjs";

const QA = join(process.cwd(), "scripts", "qa");
const L = [];
const di = (s = "") => {
  L.push(s);
  console.log(s);
};

/* ── CONTROL, antes de censar nada ───────────────────────────────────────── */
const FIXTURE = [
  `const a = new Evaluadas({ unidad: "x", minimo: 1 });`,
  `// const b = new Evaluadas({ unidad: "x", minimo: 1 });`,
  `/* const c = new Evaluadas({ unidad: "x", minimo: 1 }); */`,
  `const d = "new Evaluadas({ unidad: \\"x\\", minimo: 1 })";`,
  `const e = new Evaluadas({ unidad: "y", minimo: RUTAS.length });`,
].join("\n");
const RE = /new\s+Evaluadas\s*\(\s*\{([^}]*)\}/g;
const declara = (src) => [...sinLiterales(src).matchAll(RE)].map((m) => m[1]);
const minimoDe = (cuerpo) => {
  const m = /minimo\s*:\s*([^,}]+)/.exec(cuerpo);
  return m ? m[1].trim() : null;
};
const esLiteral = (expr) => expr !== null && /^\d+$/.test(expr);

const ctlDecls = declara(FIXTURE);
const ctlLiterales = ctlDecls.map(minimoDe).filter(esLiteral);
const CTL_OK = ctlDecls.length === 2 && ctlLiterales.length === 1;
di(`CONTROL · declaraciones vistas en el fixture: ${ctlDecls.length} (esperadas 2: código y el derivado)`);
di(`CONTROL · literales vistos: ${ctlLiterales.length} (esperado 1)`);
di(`CONTROL · ${CTL_OK ? "✅ el censo separa código de comentario y cadena" : "❌ ROTO — sus números serían del despojador"}`);
di("");
if (!CTL_OK) {
  writeFileSync(new URL("minimo-1-122.log", import.meta.url), L.join("\n") + "\n");
  process.exit(2);
}

/* ── EL CENSO ────────────────────────────────────────────────────────────── */
/* `lib.mjs` DEFINE la clase y `lib.test*.mjs` la ejercita con fixtures: los
 * tres son el instrumento, no sondas. Excluirlos es declarar el dominio, y su
 * cardinal se publica abajo para que la exclusión no sea invisible. */
const EXCLUIDOS = ["lib.mjs", "lib.test.mjs", "lib.test.neg.mjs"];
const ficheros = readdirSync(QA)
  .filter((f) => f.endsWith(".mjs"))
  .filter((f) => !EXCLUIDOS.includes(f))
  .sort();

const filas = [];
for (const f of ficheros) {
  const cuerpos = declara(readFileSync(join(QA, f), "utf8"));
  cuerpos.forEach((c, i) => {
    const expr = minimoDe(c);
    filas.push({ fichero: f, orden: i + 1, nContratos: cuerpos.length, minimo: expr, literal: esLiteral(expr) });
  });
}

const literales = filas.filter((r) => r.literal);
const secundarios = literales.filter((r) => r.orden >= 2);
const negativos = (f) => f.includes(".neg.");

di(`DOMINIO · ${ficheros.length} ficheros censados · ${EXCLUIDOS.length} excluidos por ser el instrumento (${EXCLUIDOS.join(" · ")})`);
di(`         ${filas.length} declaraciones de \`Evaluadas\` en total`);
di("");
di(`A · con \`minimo\` LITERAL: ${literales.length} de ${filas.length}`);
for (const r of literales) di(`      ${r.orden}/${r.nContratos}  ${r.fichero}  → minimo: ${r.minimo}${negativos(r.fichero) ? "   (negativo)" : ""}`);
di("");
di(`B · LITERAL en un contrato SECUNDARIO (la clase de la 122.ª): ${secundarios.length}`);
for (const r of secundarios) di(`      ${r.orden}/${r.nContratos}  ${r.fichero}  → minimo: ${r.minimo}`);
di("");

/* ── Y el reparto de los literales de contrato ÚNICO, que NO son la clase ── */
const unicos = literales.filter((r) => r.orden === 1);
di(`   · literales en contrato ÚNICO (fuera de la clase, se nombran igual): ${unicos.length}`);
for (const r of unicos) di(`      ${r.fichero}  → minimo: ${r.minimo}`);
di("");

/* ── Las sondas con MÁS de un contrato: el dominio donde la clase puede darse ── */
const multi = [...new Set(filas.filter((r) => r.nContratos >= 2).map((r) => r.fichero))];
di(`DENOMINADOR de B · sondas con ≥2 contratos: ${multi.length}`);
for (const f of multi) {
  const rs = filas.filter((r) => r.fichero === f);
  di(`      ${f}  → ${rs.map((r) => r.minimo).join("  |  ")}`);
}
di("");
/**
 * ⚠ **EL VEREDICTO SE DERIVA, NO SE CABLEA — y aquí se pagó §regla 5ter EN LA
 * MISMA TANDA.** La primera versión decía `secundarios.length === 2 ? "son DOS"
 * : "NO son dos"`, o sea el valor de ANTES del arreglo escrito a mano. En
 * cuanto las dos sondas quedaron arregladas, el mismo censo —correcto— publicó
 * *«NO son dos: son 0»*, que es el tratamiento aplicado al revés: 0 es
 * exactamente lo que el arreglo tenía que producir.
 *
 * Un censo de esta forma tiene DOS estados legítimos y hay que nombrarlos los
 * dos; el que decide cuál toca es la fecha de la corrida, no el instrumento.
 */
di(`VEREDICTO · instancias de la clase VIVAS hoy: ${secundarios.length}`);
di(
  secundarios.length === 0
    ? `           0 = la clase está CERRADA. La evidencia de que existió es la corrida ANTES (\`minimo-1-122-ANTES.log\`: 2).`
    : `           ≠0 = quedan sondas por arreglar, nombradas arriba. La clase NO se cierra hasta que este número sea 0.`,
);

/**
 * ⚠ Y la salida se nombra por el ESTADO, no por la sonda: la corrida que
 * VERIFICA un arreglo escribe con el mismo nombre que la que lo DIAGNOSTICÓ
 * (`CLAUDE.md` §sondas 5), y esta derivación no pasa por `w()`, así que no tiene
 * su guarda. La primera corrida de esta tanda se perdió por eso y hubo que
 * recuperarla de la consola.
 */
const salida = secundarios.length === 0 ? "minimo-1-122.log" : "minimo-1-122-ANTES.log";
writeFileSync(new URL(salida, import.meta.url), L.join("\n") + "\n");
di(`\n(congelado en ${salida})`);
