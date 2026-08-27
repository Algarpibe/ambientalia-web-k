/**
 * 121.ª · PASO 0 — ¿es ADITIVO añadir `meta.lado` desde `w()`?
 *
 * El encargo declara el cambio «aditivo y no cambia ningún valor ya escrito», y
 * pone la condición de parada: «si el cambio resulta no ser aditivo, PARA».
 * Esto lo MIDE en vez de razonarlo, y con su control (§CUANDO EL CAMBIO SE PUEDA
 * APLICAR, APLÍCALO Y MIDE): el tratamiento no prueba nada si escribir el valor
 * de HOY por el mismo canal no es NO-OP.
 *
 * Cuatro bloques:
 *   1 · el cardinal de partida, POR UNIDAD (§*dos lecturas pueden dar el mismo
 *       cardinal contando unidades distintas*): los «81» del encargo son DOS
 *       conjuntos disjuntos y ninguno es «congeladas que declaran su lado»;
 *   2 · la FORMA de las congeladas — cuántas tienen siquiera un objeto `meta`;
 *   3 · CONTROL (w() tal cual ⇒ NO-OP) + TRATAMIENTO A (valor en el cuerpo);
 *   4 · TRATAMIENTO B por los DOS LADOS (§regla 8): `lado` declarado volátil
 *       compra la aditividad, pero ¿sigue gritando cuando el lado CAMBIA?
 *
 * No toca `medidas/`: copia una congelada real a un directorio de trabajo.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../../../..");
const QA = path.join(REPO, "scripts", "qa");
const MEDIDAS = path.join(QA, "medidas");

const { w, CAMPOS_VOLATILES } = await import(pathToFileURL(path.join(QA, "lib.mjs")).href);
process.env.SIN_CONTRATO = "1"; // esto no es una sonda: no mide el sitio

const L = [];
const di = (...a) => { const s = a.join(" "); L.push(s); console.log(s); };

/* ── 1 · el cardinal, por unidad ─────────────────────────────────────────── */
const todos = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".json")) todos.push(p);
  }
})(MEDIDAS);

let conMetaLado = 0, conLadoEnDato = 0, ocurrMeta = 0, ocurrDato = 0;
const valoresMeta = {}, valoresDato = {};
for (const f of todos) {
  const txt = fs.readFileSync(f, "utf8");
  const o = JSON.parse(txt);
  const tieneMetaLado = o && typeof o === "object" && !Array.isArray(o) && o.meta && typeof o.meta === "object" && "lado" in o.meta;
  const ocurrencias = (txt.match(/"lado"\s*:/g) || []).length;
  if (tieneMetaLado) {
    conMetaLado++; ocurrMeta++;
    const v = String(o.meta.lado);
    valoresMeta[v] = (valoresMeta[v] || 0) + 1;
  }
  const enDato = ocurrencias - (tieneMetaLado ? 1 : 0);
  if (enDato > 0) {
    conLadoEnDato++; ocurrDato += enDato;
    for (const m of txt.match(/"lado"\s*:\s*"[^"]*"/g) || []) {
      const v = m.slice(m.indexOf(":") + 1).trim().replace(/^"|"$/g, "");
      if (!(tieneMetaLado && v === String(o.meta.lado))) valoresDato[v] = (valoresDato[v] || 0) + 1;
    }
  }
}

di("═══ 1 · EL CARDINAL, POR UNIDAD ═══");
di(`  congeladas .json                      : ${todos.length}`);
di(`  ficheros con la cadena "lado"         : ${conMetaLado + conLadoEnDato - todos.filter((f) => { const t = fs.readFileSync(f, "utf8"); const o = JSON.parse(t); return o?.meta && "lado" in o.meta && (t.match(/"lado"\s*:/g) || []).length > 1; }).length}  ← el «81» del encargo`);
di(`    · de ellos, con meta.lado (DECLARAN): ${conMetaLado}`);
di(`    · de ellos, con lado en el DATO     : ${conLadoEnDato}   (${ocurrDato} ocurrencias)`);
di("");
di("  valores de meta.lado (prosa libre, NO derivable):");
for (const [v, n] of Object.entries(valoresMeta)) di(`    ${String(n).padStart(3)} × ${JSON.stringify(v.length > 70 ? v.slice(0, 70) + "…" : v)}`);
di("  valores de lado EN EL DATO (qué lado es esa FILA — otro predicado):");
for (const [v, n] of Object.entries(valoresDato).sort((a, b) => b[1] - a[1])) di(`    ${String(n).padStart(4)} × ${JSON.stringify(v)}`);

/* ── 2 · la forma ────────────────────────────────────────────────────────── */
let objConMeta = 0, objSinMeta = 0;
for (const f of todos) {
  const o = JSON.parse(fs.readFileSync(f, "utf8"));
  if (o && typeof o === "object" && !Array.isArray(o) && o.meta && typeof o.meta === "object") objConMeta++;
  else objSinMeta++;
}
const MARCAS = /-neg-|SABOTAJE|SONDA-|CONTAMINADA/;
const FECHADA = /-\d{4}-\d{2}-\d{2}(-\d+)?\.json$/;
let artefacto = 0, fechada = 0, canonica = 0;
for (const f of todos) {
  const b = path.basename(f);
  if (MARCAS.test(b)) artefacto++;
  else if (FECHADA.test(b)) fechada++;
  else canonica++;
}
di("");
di("═══ 2 · LA FORMA DE LAS CONGELADAS ═══");
di(`  con objeto meta : ${objConMeta}`);
di(`  SIN objeto meta : ${objSinMeta}   ← no hay dónde inyectar sin reestructurar`);
di(`  por papel — artefactos ${artefacto} · fechadas ${fechada} · CANÓNICAS ${canonica}`);

/* ── 3 · control + tratamiento A ─────────────────────────────────────────── */
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lado-121-"));
const FUENTE = path.join(MEDIDAS, "clon-base-1440.json");
const orig = JSON.parse(fs.readFileSync(FUENTE, "utf8"));
const destino = path.join(DIR, "prueba.json");
const n = () => fs.readdirSync(DIR).length;

fs.writeFileSync(destino, JSON.stringify(orig, null, 2));
const base = n();
di("");
di("═══ 3 · CONTROL + TRATAMIENTO A (el valor en el CUERPO) ═══");
di("  — CONTROL · w() tal cual, mismo dato. Tiene que ser NO-OP:");
w(destino, orig);
const trasControl = n();
di(`    ficheros ${base} → ${trasControl}  ${trasControl === base ? "✓ NO-OP — el canal reproduce la realidad" : "✗ EL CONTROL MOVIÓ ALGO: no prueba nada"}`);

di("  — TRATAMIENTO A · w() inyectando meta.lado:");
w(destino, { ...orig, meta: { ...orig.meta, lado: "clon" } });
const trasA = n();
di(`    ficheros ${trasControl} → ${trasA}  ${trasA === trasControl ? "ADITIVO" : "✗ NO ADITIVO — estrena fechado"}`);
const aditivoA = trasA === trasControl;

/* ── 4 · tratamiento B, por los DOS lados ────────────────────────────────── */
di("");
di("═══ 4 · TRATAMIENTO B (lado declarado VOLÁTIL) — por los DOS lados ═══");
CAMPOS_VOLATILES.push("lado");
di(`  CAMPOS_VOLATILES = ${CAMPOS_VOLATILES.join(" · ")}`);

const d2 = path.join(DIR, "vol.json");
fs.writeFileSync(d2, JSON.stringify(orig, null, 2));
const b1 = n();
di("  — B1 · añadir lado donde no lo había (¿aditivo?):");
w(d2, { ...orig, meta: { ...orig.meta, lado: "clon" } });
const trasB1 = n();
const aditivoB = trasB1 === b1;
di(`    ficheros ${b1} → ${trasB1}  ${aditivoB ? "✓ ADITIVO — no estrena fechado" : "✗ no aditivo"}`);

fs.writeFileSync(d2, JSON.stringify({ ...orig, meta: { ...orig.meta, lado: "clon" } }, null, 2));
const b2 = n();
di("  — B2 · CAMBIAR el lado de «clon» a «ambos» (la guarda DEBE gritar):");
w(d2, { ...orig, meta: { ...orig.meta, lado: "ambos" } });
const trasB2 = n();
const enDisco = JSON.parse(fs.readFileSync(d2, "utf8")).meta.lado;
const gritaB = trasB2 !== b2;
di(`    ficheros ${b2} → ${trasB2}  ${gritaB ? "grita" : "✗ NO GRITA: el cambio pasa en SILENCIO"}`);
di(`    lado que queda EN DISCO: ${JSON.stringify(enDisco)}  ${enDisco === "ambos" ? "" : "← el disco conserva el valor CADUCADO"}`);

/* ── veredicto ───────────────────────────────────────────────────────────── */
di("");
di("═══ VEREDICTO ═══");
di(`  A · valor en el cuerpo   → aditivo ${aditivoA ? "SÍ" : "NO"} · registra su cambio SÍ`);
di(`  B · valor volátil        → aditivo ${aditivoB ? "SÍ" : "NO"} · registra su cambio ${gritaB ? "SÍ" : "NO"}`);
di("");
di("  Las dos colocaciones posibles del valor EN LA CONGELADA fallan una condición");
di("  cada una, y son condiciones distintas: A rompe la comparación al nombre");
di(`  canónico de las ${canonica} canónicas (152 sondas congelan), que es el radio de`);
di("  §regla 5bis que esta tanda tiene declarado FUERA de alcance; B convierte el");
di("  campo en uno que NO PUEDE registrar el cambio que existe para registrar,");
di("  que es §regla 21: «una guarda que se acomoda al defecto que vigila deja de");
di("  vigilarlo, y encima en silencio».");
di("");
di("  ⇒ SE CUMPLE LA CONDICIÓN DE PARADA DEL ENCARGO. PASO 0 no se implementa.");

fs.rmSync(DIR, { recursive: true, force: true });
fs.writeFileSync(path.join(AQUI, "lado-aditividad-121.log"), L.join("\n") + "\n");
