/**
 * 121.ª · ESCALÓN 1 — T12 verificada CONTRA LAS FILAS REALES, con control y
 * negativo.
 *
 * No se inventa ninguna cadena de prueba: se leen las 5 filas del corpus que
 * de verdad traen el marcado ofuscado de Cloudflare, en las DOS tablas que las
 * sirven (`entradas_blog.cuerpo`, de `extractor-a`; y
 * `paginas_blocks_texto_pagina.html`, de `extractor-f33`).
 *
 * Cuatro comprobaciones, y las cuatro hacen falta:
 *   1 · DIANA — cuántos objetivos declara T12 por fila, y que la suma cuadre
 *       con lo medido sobre el HTML SERVIDO (§El principio);
 *   2 · APLICA — que `n` iguale la diana y que `post()` quede VACÍO: si queda
 *       un solo rastro del CDN, el arreglo es media unidad otra vez;
 *   3 · CONTROL de idempotencia — pasarla DOS veces tiene que dar `n = 0` la
 *       segunda. Es el NO-OP que prueba que la primera terminó el trabajo
 *       (§*el marcador prueba que el build es nuevo, no que el cambio tenga
 *       efecto*: aquí el efecto es que no queda nada que hacer);
 *   4 · NEGATIVO por los DOS lados (§regla 8) — (a) una fila SIN marcado no se
 *       toca; (b) un `data-cfemail` cuyo descifrado NO parece un correo se
 *       deja INTACTO en vez de escribir un `mailto:` inventado, porque §regla 6
 *       manda rechazar la ausencia, no sustituirla.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../../../..");
const { T12 } = await import(pathToFileURL(path.join(REPO, "scripts/seed/transformaciones.mjs")).href);

const L = [];
const di = (...a) => { const s = a.join(" "); L.push(s); console.log(s); };

const psql = (sql) =>
  execFileSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-tAc", sql], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  });

/* ── las filas reales, de las DOS tablas ─────────────────────────────────────
 * ⚠ Se piden en JSON, y NO por líneas con separador. La primera versión hacía
 * `slug||chr(1)||html` y partía la salida de `psql` por `\n`: **el HTML lleva
 * saltos de línea**, así que de cada fila sólo sobrevivía el PRIMER renglón —
 * que no contiene el marcado— y las cinco daban `diana = 0`. El veredicto salió
 * en VERDE sobre un dominio vacío: §*el tope de una sonda se lee como una
 * ausencia del original*, y §regla 22 sobre el propio control. `json_agg`
 * codifica los saltos y el problema desaparece por construcción. */
const filas = [];
for (const [q, etiq] of [
  [`select coalesce(json_agg(json_build_object('slug',slug,'html',cuerpo))::text,'[]') from entradas_blog where cuerpo like '%cdn-cgi%'`, "entradas_blog.cuerpo"],
  [`select coalesce(json_agg(json_build_object('slug',p.slug,'html',b.html))::text,'[]') from paginas_blocks_texto_pagina b join paginas p on p.id=b._parent_id where b.html like '%cdn-cgi%'`, "paginas_blocks_texto_pagina.html"],
]) {
  for (const r of JSON.parse(psql(q).trim())) filas.push({ tabla: etiq, ...r });
}

di("═══ 0 · EL CORPUS AFECTADO (leído de la DB, no supuesto) ═══");
di(`  filas con marcado ofuscado: ${filas.length}`);
for (const f of filas) di(`    ${f.tabla.padEnd(34)} ${f.slug}`);

/* ── 1 y 2 · diana, aplica, post ─────────────────────────────────────────── */
di("");
di("═══ 1+2 · DIANA · n · post() ═══");
let dianaTotal = 0, nTotal = 0, quejas = 0;
const correos = new Map();
const trasT12 = [];
for (const f of filas) {
  const d = T12.diana(f.html);
  const { html, n } = T12.aplica(f.html);
  const q = T12.post(html);
  dianaTotal += d; nTotal += n; quejas += q.length;
  trasT12.push({ ...f, html });
  for (const m of html.matchAll(/href="mailto:([^"]+)"/g)) correos.set(m[1], (correos.get(m[1]) || 0) + 1);
  di(`  ${f.slug.slice(0, 52).padEnd(54)} diana=${d} n=${n} ${d === n ? "✓" : "✗ DIANA≠n"} post=${q.length ? "✗ " + q.join(" · ") : "vacío ✓"}`);
}
di(`  ── totales: diana ${dianaTotal} · n ${nTotal} · quejas ${quejas}`);

di("");
di("  correos restituidos (lo que el autor escribió, antes de que el CDN lo tapara):");
for (const [c, n] of [...correos].sort()) di(`    ${String(n).padStart(2)} × mailto:${JSON.stringify(c)}`);

/* ── 3 · control de idempotencia ─────────────────────────────────────────── */
di("");
di("═══ 3 · CONTROL · segunda pasada tiene que ser NO-OP ═══");
let n2 = 0, cambia = 0;
for (const f of trasT12) {
  const { html, n } = T12.aplica(f.html);
  n2 += n;
  if (html !== f.html) cambia++;
}
di(`  segunda pasada: n=${n2} · filas que cambian=${cambia}  ${n2 === 0 && cambia === 0 ? "✓ NO-OP — la primera terminó el trabajo" : "✗ NO es idempotente"}`);

/* ── 4 · negativo por los dos lados ──────────────────────────────────────── */
di("");
di("═══ 4 · NEGATIVO (§regla 8) ═══");

const limpia = psql(`select cuerpo from entradas_blog where cuerpo not like '%cdn-cgi%' and length(cuerpo) between 2000 and 8000 limit 1`).trim();
const rl = T12.aplica(limpia);
di(`  (a) fila SIN marcado (${limpia.length} chars): n=${rl.n} · intacta=${rl.html === limpia}` +
   `  ${rl.n === 0 && rl.html === limpia ? "✓ no toca lo que no es suyo" : "✗ TOCÓ una fila limpia"}`);

/* Un hex que descifra a algo que NO es un correo: el sabotaje que prueba que
 * T12 rechaza en vez de inventar. `00` de clave ⇒ el texto es el hex literal. */
const noCorreo = "0068656c6c6f"; // clave 00 ⇒ "hello"
const sabot = `<p>x <a href="/cdn-cgi/l/email-protection#${noCorreo}">t</a> <span class="__cf_email__" data-cfemail="${noCorreo}">[email&#160;protected]</span></p>`;
const rs = T12.aplica(sabot);
di(`  (b) descifra a ${JSON.stringify("hello")} (no es correo): n=${rs.n} · intacto=${rs.html === sabot}` +
   `  ${rs.n === 0 && rs.html === sabot ? "✓ rechaza en vez de inventar un mailto" : "✗ ESCRIBIÓ un mailto inventado"}`);
const rsPost = T12.post(rs.html);
di(`      y post() SÍ se queja (${rsPost.length} quejas) ${rsPost.length ? "✓ el rastro sigue siendo visible" : "✗ lo dejó pasar en silencio"}`);

/* Control del negativo (b): el MISMO marcado con un hex que sí es correo debe
 * aplicarse. Si no, (b) no probaría el rechazo — probaría que T12 no muerde. */
const siCorreo = "20535550504f5254604b554e414b0e4553"; // support@kunak.es
const ctrl = sabot.replaceAll(noCorreo, siCorreo);
const rc = T12.aplica(ctrl);
di(`      CONTROL de (b): el mismo marcado con hex de correo → n=${rc.n} ${rc.n > 0 ? "✓ (b) mide el rechazo, no la inercia" : "✗ (b) no prueba nada: T12 no muerde ni con correo"}`);

/* ── veredicto ───────────────────────────────────────────────────────────────
 * ⚠ `dominio` es la guarda que FALTABA en la v1 y sin la cual esto no dice
 * nada: `diana === n` y «post vacío» son ciertos sobre 0 objetivos igual que
 * sobre 9 (§regla 22 — un booleano de concordancia no depende del tamaño del
 * dominio, así que el código de salida se cierra con el CARDINAL). Los mínimos
 * se declaran contra la fuente entera, no contra lo que la corrida encuentre. */
const dominio = filas.length >= 5 && dianaTotal >= 9;
di("");
di("═══ GUARDA DE DOMINIO (§regla 22) ═══");
di(`  filas ${filas.length} (mínimo 5) · diana ${dianaTotal} (mínimo 9)  ${dominio ? "✓" : "✗ DOMINIO VACÍO O CORTO: el verde no valdría"}`);

const ok = dominio && dianaTotal === nTotal && quejas === 0 && n2 === 0 && cambia === 0 &&
  rl.n === 0 && rs.n === 0 && rsPost.length > 0 && rc.n > 0;
di("");
di(`═══ VEREDICTO: ${ok ? "T12 CORRECTA sobre el corpus real" : "✗ ALGO NO CUADRA"} ═══`);

fs.writeFileSync(path.join(AQUI, "t12-cloudflare-121.log"), L.join("\n") + "\n");
process.exitCode = ok ? 0 : 1;
