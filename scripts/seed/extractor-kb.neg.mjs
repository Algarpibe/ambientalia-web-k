/**
 * TEST EN NEGATIVO del extractor de `articulos-kb` — UNO POR PRECISIÓN MEDIDA.
 *
 * `CLAUDE.md` §sondas: *«no te creas un “limpio” hasta haber probado en negativo
 * que la sonda sabe fallar»*, y su corolario: **cada sabotaje tiene que caer por
 * SU invariante, no por otro** — si cae por uno ajeno, lo que se ha probado es
 * que el extractor es frágil, no que esa guarda esté viva.
 *
 * Los siete sabotajes son las siete cosas que esta tanda midió y que un
 * extractor «razonable» habría hecho mal sin dar error:
 *
 * | sabotaje | qué desactiva | por qué invariante TIENE que caer |
 * |---|---|---|
 * | `unidad` | escribe `px` donde midió `%` | **porcentajes DISTINTOS** (4 → 0) |
 * | `mb-constante` | 34.0469 como default en toda columna | **módulos con `mb` en su defecto** (62 → 49) |
 * | `un-ancho` | clasifica sólo con 1440 | **medidas con override de móvil** (26 → 0) |
 * | `sin-ocultas` | no descarta las filas `d-none` | **filas visibles** (39 → 45) |
 * | `reparto` | `4_4` en toda columna | **los anchos suman** ≠ 1 |
 * | `piel-defecto` | la piel mayoritaria del `h2` como defecto | **titulares con piel de campo** (21 → 24) |
 * | `piel-align` | deriva `align` del computado | **OVERRIDE SIN REGLA** que lo explique |
 *
 * Y el CONTROL, que es lo que hace legible a los cinco: sin sabotaje el
 * extractor sale **exit 0 con 0 problemas**. Sin él, siete rojos sólo probarían
 * que el extractor falla siempre (§sondas 8a — *un negativo sin control no es un
 * negativo*).
 *
 * Uso: npm run cms:extractor-kb-neg     (offline: sólo lee medidas congeladas)
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const EXTRACTOR = join(QA, "../seed/extractor-kb.mjs");

/** El invariante de cada uno, como aparece LITERAL en la salida del extractor. */
const CASOS = [
  { id: "unidad", invariante: "porcentajes DISTINTOS", que: "escribe `px` donde el editor escribió `%`" },
  { id: "mb-constante", invariante: "módulos con `mb` en su defecto", que: "cablea 34.0469 en toda columna" },
  { id: "un-ancho", invariante: "medidas con override de móvil", que: "clasifica con 1440 solamente" },
  { id: "sin-ocultas", invariante: "filas visibles", que: "no descarta las filas `d-none`" },
  { id: "reparto", invariante: "los anchos suman", que: "escribe `4_4` en toda columna" },
  { id: "piel-defecto", invariante: "titulares con piel de campo", que: "toma la piel mayoritaria del `h2` por defecto del tema" },
  { id: "piel-align", invariante: "OVERRIDE SIN REGLA", que: "deriva `align` del computado y se traga el `style=` del campo rico" },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-kb ════════`);
console.log(`  ${CASOS.length} sabotajes —uno por precisión medida— + control\n`);

const ev = new Evaluadas({ nombre: "extractor-kb-neg", unidad: "sabotajes", minimo: CASOS.length });
let fallos = 0;

const corre = (etiqueta, env = {}) => corridaNegativa({ etiqueta, args: [EXTRACTOR], env, timeout: 300_000 });

for (const c of CASOS) {
  const res = corre(c.id, { SABOTAJE: c.id });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.id, res.error || "no llegó a correr");
  else ev.ok();

  const suyo = out.includes(c.invariante);
  let mal = null;
  if (res.status === 0) mal = "exit 0 — el sabotaje no movió nada";
  else if (!suyo) mal = `exit ${res.status} SIN su invariante ("${c.invariante}") — cayó por otra cosa`;

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.id.padEnd(13)} ${mal}`);
  } else console.log(`  ✓  ${c.id.padEnd(13)} cae por «${c.invariante}» — ${c.que}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
const fCtl = join(QA, nombreNeg("medidas/kb-extraido.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!/0 problemas/.test(ctlOut)) malCtl = "sin la línea de «0 problemas»";
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL       ${malCtl}`);
} else console.log(`  ✓  CONTROL       exit 0, 0 problemas — el extractor no falla siempre`);

const total = CASOS.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor-kb · test en negativo: ${total - fallos}/${total}\n` +
    (fallos === 0
      ? `   Las ${CASOS.length} precisiones medidas tienen guarda viva, y el conjunto pasa en limpio.\n`
      : `   \`medidas/kb-extraido.json\` NO se puede citar hasta que esto salga en verde.\n`),
);
console.log(`  ✓ evaluadas ${ev.n}/${CASOS.length} sabotajes · extractor-kb-neg`);
process.exit(fallos === 0 ? 0 : 2);
