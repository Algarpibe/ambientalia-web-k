/* atributo-teams-f33 — 97.ª tanda, 2026-08-23.
 *
 * El 13.º bloqueo de la siembra de `paginas`, que NO es una etiqueta.
 *
 * `clasifica-f33` §3d le preguntó a `validaHtmlCorpus` —la función, no mi
 * lectura de ella— y salió que rechaza **13 campos**: 12 por etiqueta y **1 por
 * ATRIBUTO**. Retirados los tres contenedores generados, el único que queda es
 * `data-teams` en `empresa · texto-pagina.html`.
 *
 * ── Qué contesta ─────────────────────────────────────────────────────────
 * CUÁNTAS veces aparece y DÓNDE, en TODO el corpus capturado — no sólo en las
 * 31 de F3-3—, y si es inerte. Es el número que la ficha necesita para que la
 * decisión del propietario se tome sobre un dato (§regla 9).
 *
 * ── Qué NO contesta, y es deliberado ────────────────────────────────────
 * **Qué hacer con él.** Hay dos salidas —darlo de alta en `ATRIBUTOS_CENSADOS`
 * con su evidencia, o convertirlo en una transformación de importación que lo
 * limpie— y las dos son decisiones de MODELO sobre una whitelist de SEGURIDAD
 * que ya valida cinco colecciones verificadas. Ninguna se toma de paso en una
 * tanda de emisión.
 *
 * ⚠ Y no se generaliza a «residuo de pegado»: eso sería una CLASE, y esta
 * derivación sólo ha medido UN atributo. Lo que se publica es lo que se midió.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "../../../..");
const L = (s = "") => console.log(s);

/** Todos los `.html` bajo `corpus/`, recorridos sin lista escrita a mano. */
function htmls(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) htmls(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}
const FICHEROS = htmls(join(RAIZ, "corpus"));
const sinCss = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

L(`═══ atributo-teams-f33 · el 13.º bloqueo, que no es una etiqueta\n`);
L(`  ficheros .html bajo corpus/              ${FICHEROS.length}`);

/* 1 · dónde aparece `data-teams`, en el MARCADO (sin <style> ni <script>) */
const donde = [];
for (const f of FICHEROS) {
  const h = sinCss(readFileSync(f, "utf8"));
  const n = (h.match(/\bdata-teams\b/g) || []).length;
  if (n) donde.push({ f: f.slice(join(RAIZ, "corpus").length + 1).replace(/\\/g, "/"), n, h });
}
L(`  ficheros con \`data-teams\` en el marcado  ${donde.length}`);
for (const d of donde) L(`     ${d.n}×  ${d.f}`);

/* 2 · sobre qué elemento, y con qué valor */
L(`\n  el elemento y el valor, uno a uno:`);
const valores = new Set();
const etiquetas = new Set();
for (const d of donde)
  for (const m of d.h.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*\bdata-teams\s*=\s*"([^"]*)"[^>]*)>/g)) {
    etiquetas.add(m[1].toLowerCase());
    valores.add(m[3]);
    L(`     <${m[1]}${m[2].length > 60 ? m[2].slice(0, 60) + "…" : m[2]}>`);
  }
L(`     etiquetas portadoras                  ${[...etiquetas].join(", ") || "(ninguna)"}`);
L(`     valores distintos                     ${[...valores].map((v) => JSON.stringify(v)).join(", ") || "(ninguno)"}`);

/* 3 · ¿es inerte? Las cuatro familias peligrosas que el censo de atributos mide a CERO. */
L(`\n  ¿es inerte? (las 4 familias que \`ATRIBUTOS_CENSADOS\` mide a CERO):`);
const peligro = { "manejador on*": /^on/i, "javascript:": /javascript:/i, "data: URI": /^data:/i, srcdoc: /^srcdoc$/i };
for (const [k, re] of Object.entries(peligro)) L(`     ${k.padEnd(20)} ${re.test("data-teams") || [...valores].some((v) => re.test(v)) ? "‼ SÍ" : "no"}`);
L(`     → \`data-teams="true"\` no ejecuta, no navega y no pinta. Es un booleano`);
L(`       muerto. **Y eso no lo da de alta**: el procedimiento es añadirlo al`);
L(`       censo CON SU EVIDENCIA, que es un cambio revisable, no una excepción.`);

/* 4 · el contexto: qué texto envuelve */
L(`\n  qué envuelve (lo que se perdería si se limpiara sin mirar):`);
for (const d of donde) {
  const i = d.h.indexOf("data-teams");
  const seg = d.h.slice(Math.max(0, i - 120), i + 320).replace(/\s+/g, " ");
  L(`     ${d.f}`);
  L(`       …${seg}…`);
}

/* 5 · el alcance, declarado — qué NO mira esto */
L(`\n  ⚠ ALCANCE, y se declara porque sin él este cero es del canal, no del dato:`);
L(`     · mira el MARCADO de \`corpus/\`, sin \`<style>\` ni \`<script>\``);
L(`     · NO mira el original vivo, ni las páginas que el corpus no tiene`);
L(`     · NO mide la CLASE «residuo de pegado del editor»: mide UN atributo.`);
L(`       Cuántos atributos de esa familia hay en el corpus es otra pregunta,`);
L(`       y sale SIN MEDIR — que no es 0.`);

/* §sondas 4: si el patrón no casa con nada, es un patrón muerto, no un dato. */
if (!donde.length)
  throw new Error("0 ficheros con `data-teams`: `clasifica-f33` §3d lo midió en `empresa`. Un patrón que no casa no es un cero.");
