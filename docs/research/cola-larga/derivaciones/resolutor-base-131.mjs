// 131.ª · PASO 0 punto 4 (2.ª mitad) — ¿HAY QUE RENOMBRAR, Y QUE ELIGE HOY EL
// RESOLUTOR? Se verifica POR EFECTO, no por frescura: que un fichero se llame
// de una manera no prueba que las guardas lo vean de otra (§*el marcador prueba
// que el build es nuevo, no que el cambio tenga efecto*).
//
// Dos preguntas, y son distintas:
//   (a) ¿que congelada elige HOY quien resuelve por mtime? Si ya elige la
//       buena, renombrar no compra nada — y §regla 5bis avisa de que renombrar
//       cuesta: vuelve el fichero INVISIBLE a los censos (§regla 7, la vuelta);
//   (b) ¿quien MAS la consume, y para que? Un consumidor para el que la
//       congelada sigue siendo correcta (un NO-OP con los dos lados tomados con
//       el mismo instrumento) se rompe si la marcamos como artefacto.

import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const P = (...a) => console.log(...a);

P("=".repeat(78));
P("131.ª · ¿RENOMBRAR la línea base de la 129.ª? — verificado POR EFECTO");
P("=".repeat(78));

const lib = await import("../../../../scripts/qa/lib.mjs");
P(`\n## exportaciones de lib.mjs relacionadas con resolver congeladas`);
const rel = Object.keys(lib).filter((k) => /congelad|elige|anterior/i.test(k));
P(`   ${rel.length ? rel.join(" · ") : "(0 — no hay resolutor exportado)"}`);

/* ── (a) ¿QUE ELIGE HOY? ─────────────────────────────────────────────────── */
for (const ancho of [1440, 390]) {
  P(`\n## @${ancho} · candidatos de la familia productos-cmp-${ancho}, por mtime`);
  const fam = readdirSync(MED)
    .filter((f) => f.startsWith(`productos-cmp-${ancho}`) && f.endsWith(".json"))
    .map((f) => ({ f, m: statSync(join(MED, f)).mtime }))
    .sort((a, b) => b.m - a.m);
  const MARCAS = ["-neg-", "SABOTAJE", "SONDA-", "CONTAMINADA"];
  const esArtefacto = (f) => MARCAS.some((x) => f.includes(x));
  for (const { f, m } of fam)
    P(`   ${esArtefacto(f) ? "artefacto" : "  MEDIDA "}  ${m.toISOString()}  ${f}`);

  const elegida = fam.find(({ f }) => !esArtefacto(f));
  P(`   ➜ un resolutor por mtime que descarte artefactos elige: ${elegida?.f}`);

  if (rel.length) {
    for (const k of rel) {
      try {
        const r = await lib[k]({ prefijo: `productos-cmp-${ancho}`, dir: MED });
        P(`   ➜ ${k}(...) devuelve: ${JSON.stringify(r)?.slice(0, 160)}`);
      } catch (e) {
        P(`   ➜ ${k}(...) no acepta esa firma: ${e.message.slice(0, 110)}`);
      }
    }
  }
}

/* ── (b) ¿QUIEN MAS LA CONSUME, y sigue siendo correcta para el? ─────────── */
P(`\n## consumidores de la familia (derivado, no recordado)`);
P(`   scripts/qa/cobertura.mjs L309 · congeladasDe("productos-cmp") — recorre TODAS`);
const cob = readFileSync(join(RAIZ, "scripts/qa/cobertura.mjs"), "utf8");
const usaTodas = /congeladasDe\("productos-cmp"\)/.test(cob);
P(`      ¿recorre la familia entera? ${usaTodas ? "SI" : "no"}`);
P(`   derivaciones/escalon1-noop-130.mjs · la usa como ANTES de su NO-OP`);
P(`      para ESE uso sigue siendo CORRECTA: los dos lados de aquel NO-OP se`);
P(`      tomaron con el MISMO instrumento (sin srcset cerrado en ninguno).`);

P("\n" + "=".repeat(78));
