/**
 * TEST EN NEGATIVO de `texto-poblacion.mjs` — que la sonda sepa FALLAR.
 * Uso: npm run qa:texto-poblacion-neg
 *
 * «Una sonda que no encuentra nada y una que no mira nada dan la misma salida»
 * (§sondas, corolario 2). Aquí la salida es un VEREDICTO sobre una decisión de
 * modelo, así que un verde falso no cuesta un píxel: cuesta un arbitraje.
 *
 * Cada sabotaje tiene que morder **por SU invariante**, no por otro:
 *
 * | sabotaje | qué rompe | quién lo caza |
 * |---|---|---|
 * | `poblacion-una` | esconde la 2.ª población | la guarda del índice: sin las dos, la pregunta no se puede contestar |
 * | `control-roto` | cambia el conjunto EXPRESABLES | el CONTROL contra `medidas/kb-recon.json` |
 * | `marcador-muerto` | añade un marcador que no casa nunca | la guarda de marcadores (§sondas 4, el cero) |
 * | `marcador-ubicuo` | añade uno que casa en todo | la guarda de marcadores (§sondas 4, el pleno) |
 *
 * Los dos últimos son los que protegen del error que esta sonda YA cometió: la
 * primera corrida contó los anfitriones de shortcode como prosa y sacó
 * `div×427`. La evidencia de aquello se conserva —regla 7— en
 * `medidas/texto-poblacion-SONDA-SOBRECASABA-ANFITRIONES.json`.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, QA } from "./lib.mjs";

const SONDA = join(QA, "texto-poblacion.mjs");
const INDICE_SEC = join(QA, "../../corpus/fase-3-sectores/INDICE.json");
const original = readFileSync(SONDA, "utf8");

const SABOTAJES = [
  {
    id: "poblacion-una",
    que: "esconde la población de SECTOR/MONOGRÁFICO",
    aplica: () => renameSync(INDICE_SEC, `${INDICE_SEC}.neg`),
    revierte: () => renameSync(`${INDICE_SEC}.neg`, INDICE_SEC),
    espera: /captura-sectores|no existe/i,
  },
  {
    id: "control-roto",
    que: "ensancha EXPRESABLES: el inventario deja de casar con kb-recon",
    aplica: () =>
      writeFileSync(
        SONDA,
        original.replace(
          `const EXPRESABLES = new Set(["p", "ul", "li", "h1", "h2", "h3", "h4", "strong", "b"]);`,
          `const EXPRESABLES = new Set(["p", "ul", "li", "h1", "h2", "h3", "h4", "strong", "b", "span", "sub", "sup", "a", "i", "em", "img"]);`,
        ),
      ),
    revierte: () => writeFileSync(SONDA, original),
    espera: /EL CONTROL NO CIERRA|fueraDelTipo perdió/i,
  },
  {
    id: "marcador-muerto",
    que: "añade un marcador de anfitrión que no casa en NINGÚN módulo",
    aplica: () =>
      writeFileSync(
        SONDA,
        original.replace(
          `  { id: "miga", re: /class="[^"]*\\bkunak-breadcrumbs\\b/i },`,
          `  { id: "miga", re: /class="[^"]*\\bkunak-breadcrumbs\\b/i },\n  { id: "inventado", re: /data-esto-no-existe-en-el-original/i },`,
        ),
      ),
    revierte: () => writeFileSync(SONDA, original),
    espera: /CLASIFICADOR SIN VALOR[\s\S]*inventado/i,
  },
  {
    id: "marcador-ubicuo",
    que: "añade un marcador que casa en TODOS los módulos",
    aplica: () =>
      writeFileSync(
        SONDA,
        original.replace(
          `  { id: "miga", re: /class="[^"]*\\bkunak-breadcrumbs\\b/i },`,
          `  { id: "miga", re: /class="[^"]*\\bkunak-breadcrumbs\\b/i },\n  { id: "ubicuo", re: /|/ },`,
        ),
      ),
    revierte: () => writeFileSync(SONDA, original),
    espera: /CLASIFICADOR SIN VALOR[\s\S]*ubicuo/i,
  },
];

let vivos = 0;
console.log(`\n═══ NEGATIVO · texto-poblacion (${SABOTAJES.length} sabotajes) ═══\n`);
for (const s of SABOTAJES) {
  s.aplica();
  let r;
  try {
    r = corridaNegativa({ etiqueta: s.id, args: [SONDA] });
  } finally {
    s.revierte();
  }
  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const mordio = r.status !== 0 && s.espera.test(salida);
  if (mordio) vivos++;
  console.log(`  ${mordio ? "✓" : "✗"} ${s.id.padEnd(18)} exit ${String(r.status).padStart(2)} · ${s.que}`);
  if (!mordio) console.log(`     ⚠ NO mordió por su invariante. Se esperaba ${s.espera} y exit ≠ 0.\n${salida.slice(-700)}`);
}

console.log(`\n  ✓ evaluadas ${vivos}/${SABOTAJES.length} sabotajes · texto-poblacion-neg`);
process.exit(vivos === SABOTAJES.length ? 0 : 1);
