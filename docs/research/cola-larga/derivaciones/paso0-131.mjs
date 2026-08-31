#!/usr/bin/env node
// PASO 0 de la 131.ª — todo derivado, nada recordado (§regla 9).
// Cada cifra con su unidad (§regla 14). Los hechos negativos se BUSCAN.
//
// ⚠ v1 de este script tuvo DOS defectos, los dos cazados por sus propias guardas:
//   (a) execSync en Windows va por cmd.exe: `||` y comillas simples revientan.
//       Se fuerza shell bash.
//   (b) `git ls-files scripts/qa | grep -c neg` dio 554, IDENTICO al recuento de
//       artefactos de medidas/ — porque casaba scripts/qa/medidas/*-neg-*.json.
//       Es §sondas 4 en su cara de SOBRE-CASADO, y lo delato el pleno. Ahora se
//       cuenta sobre el basename y solo ficheros .mjs.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve, basename } from "node:path";

const RAIZ = resolve(
  new URL("../../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
);
const sh = (c) =>
  execSync(c, { cwd: RAIZ, maxBuffer: 1e9, shell: "C:/Program Files/Git/bin/bash.exe" }).toString();
const P = (...a) => console.log(...a);
const lineas = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

P("=".repeat(78));
P("PASO 0 · 131.a — DERIVA. fecha del sistema:", new Date().toISOString().slice(0, 10));
P("=".repeat(78));

// ─────────────────────────────────────────────────────────── 1 · tripwire
P("\n## 1 · TRIPWIRE DE CARGA (§regla 19: forma completa Y ANCLADA A LINEA)");
const HEAD = sh("git rev-parse HEAD").trim();
const cm = sh(`git show ${HEAD}:CLAUDE.md`);
P(`   HEAD de arranque ....................... ${HEAD}`);
P(`   chars del fichero que la sesion CARGO .. ${cm.length}`);
P(`   ratio contra el aviso de 150000 ........ ${(cm.length / 150000).toFixed(2)}x`);
const ls = cm.split("\n");
for (const m of ["KV-01 · 7HQMPD", "KV-08 · 5ZMCFR"]) {
  const libres = cm.split(m).length - 1;
  const i = ls.findIndex((l) => l.trim() === "`" + m + "`");
  const anc = ls.filter((l) => l.trim() === "`" + m + "`").length;
  const pos = i < 0 ? null : ls.slice(0, i).join("\n").length / cm.length;
  P(`   ${m} | libres ${libres} | ANCLADAS ${anc} | pos ${pos === null ? "n/a" : (pos * 100).toFixed(1) + "%"}`);
}

// ─────────────────────────────────────────────────────── 2 · censo de repo
P("\n## 2 · CENSO (congeladas y sondas) — cada cifra CON SU UNIDAD");
const MED = join(RAIZ, "scripts/qa/medidas");
const congeladas = readdirSync(MED).filter((f) => f.endsWith(".json"));
const MARCAS = ["-neg-", "SABOTAJE", "SONDA-", "CONTAMINADA"];
const artefactos = congeladas.filter((f) => MARCAS.some((m) => f.includes(m)));
const qaFicheros = lineas(sh("git ls-files scripts/qa"));
const negMjs = qaFicheros.filter((f) => f.endsWith(".mjs") && /\bneg\b|\.neg\./.test(basename(f)));
P(`   scripts/qa/medidas/*.json .............. ${congeladas.length} FICHEROS`);
P(`   de ellos ARTEFACTOS (§regla 7) ......... ${artefactos.length} FICHEROS`);
P(`   negativos en disco (*.neg.mjs) ......... ${negMjs.length} FICHEROS  <- v1 dijo 554: sobre-casado`);
const pkg = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8"));
const cmdNeg = Object.keys(pkg.scripts).filter((k) => k.endsWith("-neg"));
P(`   comandos npm *-neg en package.json ..... ${cmdNeg.length} COMANDOS`);
// §regla 26: el registro de comandos y el disco son DOS canales. Cruzarlos.
const huerfanos = cmdNeg.filter((k) => {
  const m = pkg.scripts[k].match(/scripts\/[\w./-]+\.mjs/);
  return m && !existsSync(join(RAIZ, m[0]));
});
P(`   §regla 26 · comandos *-neg cuyo fichero NO existe: ${huerfanos.length}${huerfanos.length ? " -> " + huerfanos.join(", ") : ""}`);

// ─────────────────────────────────────────────── 3 · manifiesto CON su fichero
P("\n## 3 · MANIFIESTO (citado CON SU FICHERO, §regla 5)");
for (const d of [".next", ".next-130", ".next-131"]) {
  const pm = join(RAIZ, "apps/web", d, "prerender-manifest.json");
  if (!existsSync(pm)) {
    P(`   apps/web/${d}/prerender-manifest.json ... AUSENTE`);
    continue;
  }
  const j = JSON.parse(readFileSync(pm, "utf8"));
  P(
    `   apps/web/${d}/prerender-manifest.json ... ${Object.keys(j.routes || {}).length} RUTAS | mtime ${statSync(pm).mtime.toISOString()}`,
  );
}

// ────────────────────────────────── 4 · el content type de `arquetipos`
P("\n## 4 · EL CONTENT TYPE `arquetipos` — que campos declara");
const CT = join(RAIZ, "packages/cms-config/src/colecciones/arquetipos.ts");
const BL = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
for (const f of [CT, BL]) {
  P(
    existsSync(f)
      ? `   ${f.slice(RAIZ.length + 1).replace(/\\/g, "/")} .... ${readFileSync(f, "utf8").length} chars`
      : `   ❗ AUSENTE: ${f}`,
  );
}
P("   -- ¿esta registrada en colecciones.ts? --");
P(sh("grep -n -i arquetipo packages/cms-config/src/colecciones.ts || echo '   (0 lineas)'"));
P("   -- migracion de la tabla --");
P(sh("ls packages/cms-config/src/migrations/ | grep -i arquetipo || echo '   (0 ficheros)'"));

// ────────────────────────── 5 · congeladas de la 128.a y la 130.a
P("\n## 5 · LAS CONGELADAS QUE DICEN QUE SEMBRAR (128.a y 130.a)");
for (const pat of ["tipos-f35", "f35", "arquetipo"]) {
  const hits = congeladas.filter((f) => f.toLowerCase().includes(pat));
  P(`   medidas/*${pat}* -> ${hits.length} ficheros`);
  for (const h of hits.sort()) P(`      ${h}  | mtime ${statSync(join(MED, h)).mtime.toISOString()}`);
}

// ───────────────────────── 6 · §regla 5bis sobre la linea base de la 129.a
P("\n## 6 · §regla 5bis — la linea base de la 129.a y el artefacto del `srcset`");
const cands = congeladas.filter((f) => f.startsWith("productos-cmp"));
for (const f of cands.sort()) {
  const p = join(MED, f);
  let extra = "";
  try {
    const j = JSON.parse(readFileSync(p, "utf8"));
    const d = j.resumen?.distintos ?? j.distintos ?? j.meta?.distintos;
    const pares = j.resumen?.pares ?? j.pares ?? j.meta?.pares;
    extra = ` | distintos=${d} pares=${pares}`;
  } catch {
    extra = " | (no parsea)";
  }
  P(`   ${f}${extra}`);
  P(`      mtime ${statSync(p).mtime.toISOString()} | ${statSync(p).size} bytes`);
}

// ─────────────────── 7 · que hay YA en el repo que haga parte de este trabajo
P("\n## 7 · QUE HAY YA EN EL REPO — sembradores, extractores, proyecciones");
P("   -- ficheros de scripts/cms --");
P(sh("git ls-files scripts/cms | sed 's|^|      |' || echo '      (0)'"));
P("   -- comandos npm cms:* --");
const cms = Object.keys(pkg.scripts).filter((k) => k.startsWith("cms:"));
for (const k of cms) P(`      ${k}`);
P(`   total comandos cms:* = ${cms.length}`);
P("\n" + "=".repeat(78));
