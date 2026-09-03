/**
 * 144.ª · B2 — ¿VIAJA EL SECRETO DENTRO DE LA IMAGEN?
 *
 * La pregunta no se contesta con una sola imagen: un `find` que no encuentra
 * nada y un `find` que no sabe buscar dan la misma salida (§sondas 4). Por eso
 * las DOS POLARIDADES van en la MISMA corrida:
 *
 *   · CONTROL POSITIVO — la imagen ANTES del arreglo (`:144-test`) tiene que
 *     dar ≥1. Si diera 0, la sonda está muda y su otro cero no vale nada;
 *   · EL HALLAZGO — la imagen DESPUÉS (`:144-fix`) tiene que dar 0.
 *
 * Con el control en verde, el 0 de la segunda es AUSENCIA MEDIDA y no silencio.
 *
 * ⚠ Esta sonda NO lee el contenido de ningún `.env`: sólo su presencia. La
 * existencia del fichero más el `ECONNREFUSED` al host del `.env` local ya
 * prueban el mecanismo, y leerlo no añadiría nada que no fuera el secreto.
 *
 * Uso: node docs/research/cola-larga/derivaciones/144-secreto-en-imagen.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "../../../..");

const IMAGENES = [
  { tag: "ai-website-cloner:144-test", papel: "ANTES del arreglo · CONTROL POSITIVO", esperado: ">=1" },
  { tag: "ai-website-cloner:144-fix", papel: "DESPUÉS del arreglo · el hallazgo", esperado: "0" },
];

function envsEn(tag) {
  const salida = execFileSync(
    "docker",
    ["run", "--rm", "--entrypoint", "sh", tag, "-c", 'find /app -name "*.env" -o -name ".env" 2>/dev/null'],
    { encoding: "utf8" },
  );
  return salida.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

const resultado = [];
for (const img of IMAGENES) {
  const ficheros = envsEn(img.tag);
  resultado.push({ ...img, n: ficheros.length, ficheros });
  console.log(`${img.tag}`);
  console.log(`  papel    : ${img.papel}`);
  console.log(`  esperado : ${img.esperado}`);
  console.log(`  hallado  : ${ficheros.length}${ficheros.length ? ` → ${ficheros.join(", ")}` : ""}`);
  console.log();
}

const control = resultado.find((r) => r.esperado === ">=1");
const hallazgo = resultado.find((r) => r.esperado === "0");

const controlOk = control.n >= 1;
const hallazgoOk = hallazgo.n === 0;

console.log("════════ veredicto ════════");
console.log(`CONTROL POSITIVO (la sonda ve el caso donde existe): ${controlOk ? "✅" : "❌ LA SONDA ESTÁ MUDA"}`);
console.log(`HALLAZGO (el secreto ya no viaja):                   ${hallazgoOk ? "✅" : "❌"}`);
if (!controlOk)
  console.log(
    "\n⚠ Sin control positivo el 0 de la otra imagen NO significa ausencia: significa\n" +
      "  que no se sabe si la sonda sabe encontrar nada. La corrida no adjudica.",
  );

const salida = path.join(RAIZ, "docs/research/cola-larga/derivaciones/144-secreto-en-imagen.json");
fs.writeFileSync(
  salida,
  JSON.stringify({ meta: { fecha: new Date().toISOString() }, resultado, controlOk, hallazgoOk }, null, 2),
);
console.log(`\ncongelado en ${path.relative(RAIZ, salida)}`);

process.exit(controlOk && hallazgoOk ? 0 : 1);
