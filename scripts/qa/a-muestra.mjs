/**
 * SELECTOR DE MUESTRA — aplica la regla del plan sobre el censo. No elige nadie.
 * Uso: npm run qa:a-muestra
 *
 * `docs/research/arquetipo-A/PLAN-MUESTREO.md` §3. La regla se pre-registró
 * antes de mirar contenido y aquí se ejecuta **mecánicamente sobre las señales
 * del censo**: la muestra la elige el dato, no mi criterio — que es justo la
 * fuente de sesgo que la familia S9–S11 demuestra que existe.
 *
 * Orden de prioridad: la más larga · la más corta · una por cada payload raro
 * presente · la de más variedad interna · relleno aleatorio con **semilla fija**.
 *
 * El relleno aleatorio no es decorativo: una muestra 100 % adversaria
 * sobre-generaliza —todo parece opcional y variable— y sin instancias del caso
 * medio no se puede decir qué es típico.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { w, QA } from "./lib.mjs";

const censo = JSON.parse(readFileSync(join(QA, "medidas", "a-censo.json"), "utf8"));

/** PRNG determinista (mulberry32). `Math.random()` no vale: la muestra tiene que ser reproducible. */
function prng(semilla) {
  return function () {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUPO = { blog: 12, termino: 6, "doc-cientifico": 6 };

/**
 * Payloads raros del §3.3. Cada uno con las etiquetas que lo delatan. Los que
 * NO aparezcan en el corpus **no se sustituyen**: se anotan como ausentes, que
 * es un dato del contrato del campo rico.
 */
const PAYLOADS = {
  tabla: ["table"],
  galeria: ["figure"],
  embebido: ["iframe", "embed"],
  codigo: ["code", "pre"],
  cita: ["blockquote"],
  "lista de definición": ["dl"],
  formulario: ["form", "input"],
  "audio/vídeo": ["video", "audio", "source"],
  "script en el cuerpo": ["script"],
};

const salida = { meta: { semilla: 20260730, cupo: CUPO }, formas: {} };

for (const [forma, d] of Object.entries(censo.formas)) {
  const ok = d.paginas.filter((p) => !p.error);
  const cupo = CUPO[forma];
  const elegidas = new Map(); // url → razones
  const marca = (p, razon) => {
    if (!p) return;
    if (elegidas.has(p.url)) elegidas.get(p.url).push(razon);
    else elegidas.set(p.url, [razon]);
  };

  /* 1 · la más larga · 2 · la más corta */
  const porLargo = [...ok].sort((a, b) => a.chars - b.chars);
  marca(porLargo[porLargo.length - 1], `la más larga (${porLargo[porLargo.length - 1].chars} chars)`);
  marca(porLargo[0], `la más corta (${porLargo[0].chars} chars)`);

  /* 3 · una por cada payload raro PRESENTE */
  const ausentes = [];
  for (const [nombre, tags] of Object.entries(PAYLOADS)) {
    const conEl = ok.filter((p) => tags.some((t) => p.etiquetas[t]));
    if (conEl.length === 0) {
      ausentes.push(nombre);
      continue;
    }
    // la que más lo usa: el caso extremo de ese payload, no uno cualquiera
    const cand = conEl.sort(
      (a, b) =>
        tags.reduce((s, t) => s + (b.etiquetas[t] || 0), 0) -
        tags.reduce((s, t) => s + (a.etiquetas[t] || 0), 0),
    );
    // si la primera ya está elegida por otra razón, se anota igual (aporta razón)
    marca(cand[0], `payload «${nombre}» (${conEl.length}/${ok.length} páginas lo llevan)`);
  }

  /* 4 · la de más tipos de elemento distintos */
  const porVariedad = [...ok].sort(
    (a, b) => Object.keys(b.etiquetas).length - Object.keys(a.etiquetas).length,
  );
  marca(porVariedad[0], `más variedad interna (${Object.keys(porVariedad[0].etiquetas).length} etiquetas distintas)`);

  /* 5 · relleno aleatorio con semilla fija — el control anti-sesgo */
  const rnd = prng(20260730 + forma.length);
  const resto = ok.filter((p) => !elegidas.has(p.url));
  while (elegidas.size < cupo && resto.length) {
    const i = Math.floor(rnd() * resto.length);
    marca(resto.splice(i, 1)[0], "aleatoria (control anti-sesgo)");
  }

  salida.formas[forma] = {
    poblacion: ok.length,
    cupo,
    payloadsAusentes: ausentes,
    muestra: [...elegidas].map(([url, razones]) => {
      const p = ok.find((x) => x.url === url);
      return { url, chars: p.chars, nEtiquetas: Object.keys(p.etiquetas).length, razones };
    }),
  };
}

/* ─────────────────────────────── informe ───────────────────────────────── */

for (const [forma, d] of Object.entries(salida.formas)) {
  console.log(`\n█ ${forma} — ${d.muestra.length} de ${d.poblacion}`);
  if (d.payloadsAusentes.length)
    console.log(`   payloads AUSENTES en todo el corpus: ${d.payloadsAusentes.join(" · ")}`);
  for (const m of d.muestra)
    console.log(
      `   ${String(m.chars).padStart(6)} ch  ${String(m.nEtiquetas).padStart(2)} tags  ` +
        `${m.url.replace("https://kunakair.com/es/", "").slice(0, 52).padEnd(52)}  ${m.razones.join(" + ")}`,
    );
}

w("medidas/a-muestra.json", salida);
