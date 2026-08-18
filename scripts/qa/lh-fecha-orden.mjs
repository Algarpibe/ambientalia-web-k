/**
 * ¿REPRODUCE `datePublished` EL ORDEN SERVIDO de `/casos-de-exito/` y `/glosario/`?
 * Uso: node scripts/qa/lh-fecha-orden.mjs        (npm run qa:lh-fecha-orden)
 *      SABOTAJE=<x> node …                        (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PREGUNTA CONTESTA, Y QUÉ NO — §*antes de construir sobre una medida,
 * escribe QUÉ PREGUNTA CONTESTA y QUÉ PREGUNTAS NO CONTESTA*
 *
 * CONTESTA: si el `datePublished` que traen los SINGULARES del corpus, ordenado
 * DESC, **reproduce el orden en que el original sirve las tarjetas** en los dos
 * listados cuya decisión (§7g del ESQUEMA) es añadir el campo. Es la
 * precondición (a) del escalón: si no reproduce, el campo NO es la clave y
 * añadirlo sería modelar una coincidencia.
 *
 * NO CONTESTA, y va con su cardinal (§regla 14):
 *   (a) **el MECANISMO**. Reproducir el orden no prueba que WordPress ordene
 *       por ese campo: prueba que el campo lo predice. Otra clave 1:1 con él
 *       daría lo mismo — por eso se publican las SEPARADORAS contra rivales
 *       concretos, que es lo único que convierte el acierto en elección;
 *   (b) **`documentos-cientificos`**: fuera de alcance por DATO —0 de 23 traen
 *       `datePublished`—, y su decisión es DECLARAR (§F3-LH-DESEMPATE-DE-L3);
 *   (c) **el caso «documento SIN fecha»**: hoy **0 de 57** y **0 de 37**, o sea
 *       un camino de render SIN ESTRENAR. La sonda lo cuenta y lo publica; no
 *       lo da por soportado (§*una regla derivada sobre un dominio donde el
 *       caso NO SE DA está SIN PROBAR para ese caso*);
 *   (d) **el DESEMPATE**: si dos documentos comparten fecha, DESC no los
 *       ordena. Se cuenta y se publica `empates`; con empates > 0 el veredicto
 *       no puede ser un pleno limpio.
 *
 * ── DOS CANALES, Y SE TRATAN DISTINTO A PROPÓSITO ─────────────────────────
 * · el ORDEN sale de los listados congelados, buscando la tarjeta sobre el HTML
 *   **sin `<script>` ni `<style>`** — ahí viven los selectores que se hacen
 *   pasar por marcado (§sondas 4, 3.ª cara: `post_content` daba «sí en las 35»
 *   porque casaba dentro del CSS);
 * · la FECHA sale del JSON-LD del singular, que **vive dentro de un `<script>`**.
 *   O sea que aquí quitar los scripts sería quitar el dato. Los dos canales
 *   necesitan tratamientos opuestos, y confundirlos da un cero con cara de dato.
 *
 * ── EL ORDEN SERVIDO NO ESTÁ EN EL ESPEJO ─────────────────────────────────
 * ⚠ `lh-espejo` congela `cards.slice(0, 3)`: dice `nTarjetas 57` y trae TRES
 * (§sondas 4, 4.ª cara — un `slice` se lee como una ausencia del original).
 * Este canal es el HTML del listado **sin recortar**, y por eso `/glosario`
 * necesita sus **8 páginas**: su índice sirve 5 tarjetas, no 37.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, w } from "./lib.mjs";

const SABOTAJES = ["sin-listados", "un-solo-modelo", "fecha-rota"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

/* ── Los dos arquetipos, con sus dos canales cada uno ─────────────────────── */
const RAIZ_LISTADOS = SABOTAJE === "sin-listados" ? "corpus/fase-3/listados-que-no-existen" : "corpus/fase-3/listados";

const ARQUETIPOS = [
  {
    id: "L5-casos",
    coleccion: "casos",
    singulares: "corpus/casos",
    listado: "casos-de-exito",
    /* El cuerpo de `/casos-de-exito/` NO pagina: 57 tarjetas en una página.
     * `page/2` existe en el corpus y es un DUPLICADO (`D2.4`), así que NO entra:
     * meterlo contaría 57 tarjetas dos veces. */
    paginas: [""],
    tarjeta: /<h3[^>]*class="[^"]*\bcase-title\b[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"/gi,
  },
  {
    id: "L2-glosario",
    coleccion: "terminos-kunakpedia",
    singulares: "corpus/terminos-kunakpedia",
    listado: "glosario",
    /* `/glosario/` SÍ pagina: 5·5·5·5·5·5·5·2 = 37. Con sólo el índice, este
     * canal daría 5 y el «37/37» sería un 5/5 disfrazado. */
    paginas: ["", "page/2", "page/3", "page/4", "page/5", "page/6", "page/7", "page/8"],
    tarjeta: /<h2[^>]*class="[^"]*\bentry-title\b[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"/gi,
  },
];

/**
 * ⚠ EL MÍNIMO SALE DE **OTRO CANAL** QUE EL QUE MIDE, Y ES DELIBERADO.
 *
 * §*un sabotaje que comparte variable con el mínimo no puede ejercitarlo*: si
 * el listón saliera de las tarjetas leídas, `sin-listados` lo dejaría en 0
 * contra 0 —mueve la portería— y el caso no probaría nada. Sale de los
 * SINGULARES en disco, que ese sabotaje no toca. Y sigue DERIVADO (§regla 9):
 * capturar un caso más sube el listón solo.
 */
const enDisco = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".html")).length : 0);
const MINIMO = ARQUETIPOS.reduce((a, x) => a + enDisco(x.singulares), 0);

const ev = new Evaluadas({ sonda: "lh-fecha-orden", unidad: "tarjetas servidas", minimo: MINIMO });

/* ── Idioma de extracción ─────────────────────────────────────────────────── */
const sinSS = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");
const slugDe = (href) => String(href).split("?")[0].split("#")[0].replace(/\/+$/, "").split("/").filter(Boolean).pop();

/** Todas las `datePublished` del JSON-LD. NO se quitan los `<script>`: el dato vive dentro. */
function fechasDe(html) {
  const out = [];
  for (const m of html.matchAll(/"datePublished"\s*:\s*"([^"]+)"/g)) out.push(m[1]);
  return out;
}

/* ── Lectura ──────────────────────────────────────────────────────────────── */
const filas = [];
const porArquetipo = {};

for (const A of ARQUETIPOS) {
  /* (1) el ORDEN SERVIDO, en orden de documento y sobre el HTML sin script/style */
  const servido = [];
  let paginasLeidas = 0;
  for (const p of A.paginas) {
    const f = join(RAIZ_LISTADOS, A.listado, p, "index.html");
    if (!existsSync(f)) continue;
    paginasLeidas++;
    const limpio = sinSS(readFileSync(f, "utf8"));
    A.tarjeta.lastIndex = 0;
    for (const m of limpio.matchAll(A.tarjeta)) servido.push(slugDe(m[1]));
  }

  /* (2) las FECHAS de los singulares */
  const fechas = new Map();
  const sinFecha = [];
  const fechaAmbigua = [];
  const dir = A.singulares;
  const ficheros = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".html")).sort() : [];
  const ordenCorpus = ficheros.map((f) => f.replace(/\.html$/, ""));
  for (const f of ficheros) {
    const slug = f.replace(/\.html$/, "");
    let vs = fechasDe(readFileSync(join(dir, f), "utf8"));
    /**
     * Sabotaje `fecha-rota`: al PRIMER singular del orden servido se le pone una
     * fecha FALSA que lo manda al final. El primero es el que más desplaza.
     *
     * ⚠ **La primera versión BORRABA la fecha, y era un sabotaje que movía la
     * portería** (§regla 17-hermana): sin fecha, la tarjeta sale de
     * `comparables`, así que el modelo seguía dando pleno sobre las 56 que
     * quedaban y la sonda caía por el **MÍNIMO** (93/94) en vez de por el orden.
     * Código de salida correcto, motivo falso — lo cazó `esperaEnSalida`, no el
     * `exit` (§regla 1). Un sabotaje tiene que atacar **lo que la sonda
     * afirma**, y lo que afirma es el ORDEN.
     */
    if (SABOTAJE === "fecha-rota" && slug === servido[0]) vs = ["1970-01-01T00:00:00+00:00"];
    if (!vs.length) { sinFecha.push(slug); continue; }
    const unicas = [...new Set(vs)];
    if (unicas.length > 1) fechaAmbigua.push({ slug, valores: unicas });
    fechas.set(slug, unicas[0]);
  }

  /* (3) las tarjetas comparables: servidas Y con fecha */
  const noEnCorpus = servido.filter((s) => !fechas.has(s));
  const comparables = servido.filter((s) => fechas.has(s));
  for (const s of comparables) { filas.push({ arquetipo: A.id, slug: s }); ev.ok(); }

  /* (4) empates: DESC no ordena dos fechas iguales */
  const cuenta = {};
  for (const s of comparables) cuenta[fechas.get(s)] = (cuenta[fechas.get(s)] || 0) + 1;
  const empates = Object.values(cuenta).filter((n) => n > 1).reduce((a, n) => a + n, 0);

  porArquetipo[A.id] = { A, servido, comparables, fechas, sinFecha, fechaAmbigua, noEnCorpus, empates, paginasLeidas, ordenCorpus };
}

/* ── Los modelos ──────────────────────────────────────────────────────────── */
/* El ganador y sus RIVALES. Sin rivales no hay elección, sólo escritura
 * (§*un modelo se elige por lo que lo SEPARA de su alternativa*). */
const MODELOS = {
  "fecha-desc": (s, P) => [...s].sort((a, b) => String(P.fechas.get(b)).localeCompare(String(P.fechas.get(a)))),
  "fecha-asc": (s, P) => [...s].sort((a, b) => String(P.fechas.get(a)).localeCompare(String(P.fechas.get(b)))),
  alfabetico: (s) => [...s].sort((a, b) => a.localeCompare(b)),
  "orden-corpus": (s, P) => [...s].sort((a, b) => P.ordenCorpus.indexOf(a) - P.ordenCorpus.indexOf(b)),
};
const GANADOR = "fecha-desc";
const RIVALES = SABOTAJE === "un-solo-modelo" ? [] : ["fecha-asc", "alfabetico", "orden-corpus"];

const resultado = { fecha: hoy(), sonda: "lh-fecha-orden", sabotaje: SABOTAJE, arquetipos: {}, meta: {} };
let plenos = 0;
let sepTotal = 0;
let arquetiposEvaluados = 0;

for (const [id, P] of Object.entries(porArquetipo)) {
  const s = P.comparables;
  const predicho = MODELOS[GANADOR](s, P);
  const aciertos = s.filter((x, i) => predicho[i] === x).length;
  const pleno = s.length > 0 && aciertos === s.length;
  if (pleno) plenos++;
  if (s.length > 0) arquetiposEvaluados++;

  /* SEPARADORAS: pares ADYACENTES del orden servido en los que un rival predice
   * el orden CONTRARIO. Es la unidad en la que se afirma «este modelo elige». */
  const sep = {};
  const separadorasDistintas = new Set();
  for (const r of RIVALES) {
    const pos = new Map(MODELOS[r](s, P).map((x, i) => [x, i]));
    let n = 0;
    for (let i = 0; i + 1 < s.length; i++) {
      if (pos.get(s[i]) > pos.get(s[i + 1])) { n++; separadorasDistintas.add(i); }
    }
    sep[r] = n;
  }
  sepTotal += separadorasDistintas.size;

  resultado.arquetipos[id] = {
    coleccion: P.A.coleccion,
    listado: `/es/${P.A.listado}/`,
    paginasLeidas: P.paginasLeidas,
    tarjetasServidas: P.servido.length,
    singularesEnDisco: P.ordenCorpus.length,
    comparadas: s.length,
    veredicto: `${aciertos}/${s.length}`,
    pleno,
    separadorasPorRival: sep,
    separadorasDistintas: separadorasDistintas.size,
    empates: P.empates,
    sinFecha: { n: P.sinFecha.length, de: P.ordenCorpus.length, slugs: P.sinFecha.slice(0, 10) },
    fechaAmbigua: P.fechaAmbigua.length,
    servidasSinSingular: P.noEnCorpus.length,
    primerasTres: s.slice(0, 3).map((x) => ({ slug: x, fecha: P.fechas.get(x) })),
  };
}

resultado.meta.noMide = [
  "el MECANISMO: reproducir el orden no prueba que WordPress ordene por ese campo (por eso las separadoras)",
  "`documentos-cientificos`: 0 de 23 traen datePublished — fuera de alcance por DATO, decisión DECLARAR",
  `el caso «documento SIN fecha»: ${Object.values(resultado.arquetipos).reduce((a, x) => a + x.sinFecha.n, 0)} de ${MINIMO} — camino de render SIN ESTRENAR`,
  "el orden de `/casos-de-exito/page/2`: es un DUPLICADO (D2.4) y NO entra, 1 página excluida de 2 en disco",
];
resultado.veredicto = { plenos, arquetiposEvaluados, separadorasTotales: sepTotal, ganador: GANADOR, rivales: RIVALES };

/* ── Informe ──────────────────────────────────────────────────────────────── */
console.log(`\n── ${GANADOR} contra ${RIVALES.length} rival(es): ${RIVALES.join(" · ") || "NINGUNO"}`);
for (const [id, r] of Object.entries(resultado.arquetipos)) {
  console.log(
    `   ${id.padEnd(12)} ${r.veredicto.padStart(7)}` +
      ` · ${r.paginasLeidas} pág · servidas ${r.tarjetasServidas} · singulares ${r.singularesEnDisco}` +
      ` · separadoras ${r.separadorasDistintas}` +
      ` · empates ${r.empates} · sin fecha ${r.sinFecha.n}/${r.sinFecha.de}`,
  );
  if (r.servidasSinSingular) console.log(`     ⚠ ${r.servidasSinSingular} tarjeta(s) servida(s) sin singular en el corpus`);
  if (r.fechaAmbigua) console.log(`     ⚠ ${r.fechaAmbigua} singular(es) con MÁS DE UNA datePublished distinta`);
}
for (const s of resultado.meta.noMide) console.log(`   noMide · ${s}`);

let codigo = 0;
/* §regla 1 y §regla 6: primero el mínimo. Con 0 tarjetas los modelos «empatan»
 * a 0/0 y la sonda anunciaría un pleno de no haber mirado nada. */
if (!ev.suficiente()) {
  console.log(`\n⛔ NO SE PUDO EVALUAR (${ev.n}/${ev.minimo} tarjetas): no se emite veredicto de orden.\n   Con 0 tarjetas servidas el modelo «acierta» 0/0, que es un pleno vacío.`);
  codigo = 2;
} else if (plenos !== arquetiposEvaluados) {
  const malos = Object.entries(resultado.arquetipos).filter(([, r]) => !r.pleno).map(([k, r]) => `${k} ${r.veredicto}`);
  console.log(`\n⛔ NO REPRODUCE el orden servido: ${malos.join(" · ")}.\n   Disparador (a): el campo NO es la clave, y añadirlo sería modelar una coincidencia.`);
  codigo = 2;
} else if (sepTotal === 0) {
  console.log(`\n⛔ SIN PROBAR: '${GANADOR}' da pleno y NINGÚN rival predice otra cosa en ninguna posición.\n   0 separadoras ⇒ no se ha elegido, se ha escrito uno de los modelos.`);
  codigo = 2;
} else {
  console.log(
    `\n✅ '${GANADOR}' REPRODUCE el orden servido en los ${arquetiposEvaluados} arquetipos` +
      ` y se ELIGE con ${sepTotal} posiciones separadoras, no por acierto.`,
  );
}

w("medidas/lh-fecha-orden.json", resultado);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} tarjetas servidas · lh-fecha-orden`);
process.exit(codigo);
