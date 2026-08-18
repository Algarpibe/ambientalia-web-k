/**
 * LA UNIDAD DEL CORTE DEL EXTRACTO DE `L3` — chars o bytes, antes o después de
 * decodificar las entidades.
 * Uso: node scripts/qa/lh-extracto-unidad.mjs      (npm run qa:lh-extracto-unidad)
 *      SABOTAJE=<x> node …                          (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PREGUNTA CONTESTA, Y QUÉ NO — §*antes de construir sobre una medida,
 * escribe QUÉ PREGUNTA CONTESTA y QUÉ PREGUNTAS NO CONTESTA*
 *
 * CONTESTA: **en qué unidad y sobre qué texto corta** el extracto de la tarjeta
 * del arquetipo `L3` (`scientific-docs`), derivado del corpus congelado.
 *
 * NO CONTESTA: (a) si otros arquetipos usan el mismo mecanismo — `/blog` y
 * `/etiqueta/*` ya tienen el suyo medido por `lh-extracto` y son **otro**;
 * (b) qué pasa cuando el cuerpo es MÁS CORTO que el tope: **ninguno de los 23
 * lo ejercita** (§*una regla derivada sobre un dominio donde el caso NO SE DA
 * está SIN PROBAR para ese caso*), y por eso sale nombrado en `noMide`.
 *
 * ── POR QUÉ HACÍA FALTA MEDIRLO, Y NO ELEGIR ──────────────────────────────
 * La 77.ª bancó dos cotas que aciertan las 23 —`chars ≤ 99` y `bytes ≤ 100`— y
 * **se negó a elegir**, porque elegir con 0 separadoras es escribir uno de los
 * dos modelos (§*dos modelos que predicen lo mismo en todo tu dominio son uno
 * solo*). Lo que faltaba era el paso barato: **aplicar las reglas al cuerpo**.
 *
 * ⚠ Y la trampa que hay debajo: una COTA (`≤ N`) y una REGLA GENERADORA
 * (`corta a N`) no son la misma afirmación. Las dos cotas empatan a 23/23; las
 * dos reglas **no empatan**, porque una regla generadora predice la longitud
 * EXACTA y ahí el dato tiene varianza. Medir la cota es medir el techo; medir
 * la regla es medir la función.
 *
 * ── LOS DOS EJES, Y POR QUÉ VAN JUNTOS ────────────────────────────────────
 * No hay un modelo y su alternativa: hay **cuatro**, en el cruce de dos ejes
 * que la ficha bancada no separaba.
 *
 *   · unidad:  `chars` (mb_substr)  ·  `bytes` (substr de PHP)
 *   · momento: `crudo` (el HTML del cuerpo, con `&amp;` sin decodificar)
 *              `deco`  (después de decodificar las entidades)
 *
 * El segundo eje NO se me ocurrió: lo trajo el dato. Con las entidades
 * decodificadas los bytes salen `{100: 22, 96: 1}` y esa **única** instancia
 * —`…glasgow-kerbside-kunak-air-pro`, que trae un `&amp;`— es la que separa
 * `crudo` de `deco`. Un dominio sin un solo `&` no habría podido verlo.
 *
 * ── EL CONTRATO DE ESTA SONDA: PUBLICAR LAS SEPARADORAS ───────────────────
 * §*un modelo se elige por lo que lo SEPARA de su alternativa, no por lo que
 * acierta*. Así que el veredicto NO es «tal modelo acierta 23/23»: es
 * «acierta 23/23 **y hay N instancias en las que su rival predice otra cosa**».
 * Con `separadoras === 0` el veredicto es **SIN PROBAR**, y cierra ≠ 0.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, hoy, w } from "./lib.mjs";

const SABOTAJES = ["sin-corpus", "un-solo-modelo", "plano-con-espacio"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const LISTADOS = SABOTAJE === "sin-corpus" ? join(QA, "medidas/no-existe") : "corpus/fase-3/listados/scientific-category";
const DOCS = "corpus/documentos-cientificos";
/* Los 3 términos de `L3`. El cuerpo NO pagina —las 3 páginas de un término
 * sirven las mismas tarjetas—, así que la página 1 de cada uno trae el total. */
const TERMINOS = ["articulos-cientificos-y-estudios", "evaluaciones-independientes", "articulos-tecnicos"];

/**
 * ⚠ EL MÍNIMO SE DERIVA DE **OTRO CANAL** QUE EL QUE MIDE, Y ES DELIBERADO.
 *
 * §*un sabotaje que comparte variable con el mínimo no puede ejercitarlo*: si
 * el listón saliera de `pares.length`, el sabotaje `sin-corpus` lo dejaría en
 * **0 contra 0** —mueve la portería— y el caso no probaría nada. Así que sale
 * de los ficheros de `corpus/documentos-cientificos`, que `sin-corpus` no toca:
 * el listón se queda en 23 y el 0 sí choca contra él.
 *
 * Y sigue siendo DERIVADO, no recordado (§regla 9): capturar un documento más
 * sube el listón solo, sin tocar la sonda.
 */
const DOCS_EN_DISCO = existsSync(DOCS) ? readdirSync(DOCS).filter((f) => f.endsWith(".html")).length : 0;
const ev = new Evaluadas({
  sonda: "lh-extracto-unidad",
  unidad: "tarjetas de L3",
  minimo: DOCS_EN_DISCO,
});

/* ── El idioma de los extractores de este repo ────────────────────────────── */
const sinSS = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");
const deco = (s) =>
  s
    .replace(/&hellip;/g, "…").replace(/&nbsp;/g, " ").replace(/&#8217;|&#039;|&#39;/g, "’")
    .replace(/&quot;/g, '"').replace(/&laquo;/g, "«").replace(/&raquo;/g, "»")
    .replace(/&#8211;/g, "–").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&");

/**
 * ⚠ `strip_tags` de PHP quita la etiqueta **sin poner nada en su sitio**. Una
 * regex `→ " "` es lo que este repo usa en otros sitios y **aquí miente**: el
 * `H<sub>2</sub>S` de un documento sale «H 2 S» y su extracto deja de ser
 * prefijo del cuerpo. Es el mismo corte en `<sub>` que la 76.ª se comió al
 * nombrar el sobrante de la serie. El sabotaje `plano-con-espacio` lo ejercita.
 */
const planoCrudo = (s) => (SABOTAJE === "plano-con-espacio" ? s.replace(/<[^>]+>/g, " ") : s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const B = (s) => Buffer.byteLength(s, "utf8");
/** substr de PHP: corta a `n` BYTES; si parte un carácter multibyte, el byte
 *  huérfano no sobrevive a la salida UTF-8 y el carácter desaparece entero. */
const porBytes = (s, n) => Buffer.from(s, "utf8").subarray(0, n).toString("utf8").replace(/�+$/, "");
const porChars = (s, n) => [...s].slice(0, n).join("");

/* ── (1) Las 23 tarjetas del corpus — el canal SIN RECORTAR ──────────────── */
const RE_EXC = /<div class="scientific-excerpt">([\s\S]*?)<\/div>/g;
const pares = [];
for (const t of TERMINOS) {
  const f = join(LISTADOS, t, "index.html");
  if (!existsSync(f)) continue;
  const h = readFileSync(f, "utf8");
  let m;
  RE_EXC.lastIndex = 0;
  while ((m = RE_EXC.exec(h))) {
    const bruto = m[1];
    const href = /<a href="([^"]+)"/.exec(bruto);
    if (!href) continue;
    /* El texto observado, en CRUDO: sin decodificar, sólo sin el enlace de
     * «Seguir leyendo» y con los espacios colapsados. */
    const conPuntos = bruto.replace(/<a [\s\S]*$/, "").replace(/\s+/g, " ").trim();
    if (!conPuntos.endsWith("...")) continue;
    pares.push({
      termino: t,
      slug: href[1].replace(/\/$/, "").split("/").pop(),
      crudo: conPuntos.slice(0, -3),
    });
    ev.ok(1);
  }
}

/* ── (2) El cuerpo de cada documento — el canal INDEPENDIENTE ────────────── */
const cuerpoDe = (html0) => {
  const html = sinSS(html0);
  const i = html.search(/<div class="[^"]*\bet_pb_post_content\b/);
  if (i < 0) return null;
  let d = 0, fin = -1;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === "</div>") d--; else d++;
    if (d === 0) { fin = m.index; break; }
  }
  return fin < 0 ? null : html.slice(html.indexOf(">", i) + 1, fin);
};

const filas = [];
let sinCuerpo = 0;
for (const p of pares) {
  const f = join(DOCS, p.slug + ".html");
  if (!existsSync(f)) { sinCuerpo++; continue; }
  const c = cuerpoDe(readFileSync(f, "utf8"));
  if (!c) { sinCuerpo++; continue; }
  const cuerpoCrudo = planoCrudo(c);
  filas.push({
    ...p,
    cuerpoCrudo,
    cuerpoDeco: deco(cuerpoCrudo),
    obsCrudo: p.crudo,
    obsDeco: deco(p.crudo),
    esPrefijo: cuerpoCrudo.startsWith(p.crudo),
    chars: [...p.crudo].length,
    bytes: B(p.crudo),
    charsDeco: [...deco(p.crudo)].length,
    bytesDeco: B(deco(p.crudo)),
  });
}

/* ── (3) LOS CUATRO MODELOS, con su parámetro BARRIDO ─────────────────────
 * §*antes de escribir una regla ajustada, BARRE el parámetro en vez de
 * razonarlo* — aquí de 80 a 130 en las cuatro combinaciones. El barrido es lo
 * que dice además QUÉ TOPES SON INDISTINGUIBLES, que ninguna deducción da. */
const MODELOS = [
  { id: "bytes-crudo", unidad: "bytes", momento: "crudo", corta: porBytes, texto: (f) => f.cuerpoCrudo, obs: (f) => f.obsCrudo },
  { id: "bytes-deco", unidad: "bytes", momento: "deco", corta: porBytes, texto: (f) => f.cuerpoDeco, obs: (f) => f.obsDeco },
  { id: "chars-crudo", unidad: "chars", momento: "crudo", corta: porChars, texto: (f) => f.cuerpoCrudo, obs: (f) => f.obsCrudo },
  { id: "chars-deco", unidad: "chars", momento: "deco", corta: porChars, texto: (f) => f.cuerpoDeco, obs: (f) => f.obsDeco },
];
const CANDIDATOS = SABOTAJE === "un-solo-modelo" ? MODELOS.slice(0, 1) : MODELOS;

const barrido = {};
for (const mo of CANDIDATOS) {
  const curva = [];
  for (let n = 80; n <= 130; n++) {
    let ac = 0;
    for (const f of filas) if (mo.corta(mo.texto(f), n) === mo.obs(f)) ac++;
    curva.push({ n, aciertos: ac });
  }
  const mejor = curva.reduce((a, b) => (b.aciertos > a.aciertos ? b : a));
  /* Los topes INDISTINGUIBLES: los que empatan con el mejor. Publicarlos evita
   * afirmar un número que el dato no distingue de sus vecinos. */
  const empatan = curva.filter((c) => c.aciertos === mejor.aciertos).map((c) => c.n);
  barrido[mo.id] = { unidad: mo.unidad, momento: mo.momento, mejorN: mejor.n, aciertos: mejor.aciertos, de: filas.length, topesIndistinguibles: empatan };
}

/* ── (4) LAS SEPARADORAS — lo único que convierte un acierto en una elección
 * Una separadora es UNA ENTRADA CONCRETA en la que dos modelos, cada uno con su
 * mejor tope, predicen textos DISTINTOS. Se nombran, no se cuentan y ya. */
const separadoras = {};
for (let a = 0; a < CANDIDATOS.length; a++)
  for (let b = a + 1; b < CANDIDATOS.length; b++) {
    const A = CANDIDATOS[a], C = CANDIDATOS[b];
    const nA = barrido[A.id].mejorN, nC = barrido[C.id].mejorN;
    const cuales = filas.filter((f) => A.corta(A.texto(f), nA) !== C.corta(C.texto(f), nC)).map((f) => f.slug);
    separadoras[`${A.id} vs ${C.id}`] = { n: cuales.length, ejemplos: cuales.slice(0, 3) };
  }

const ganadores = Object.entries(barrido).filter(([, v]) => v.aciertos === filas.length).map(([k]) => k);
/* El ganador está PROBADO sólo si algún rival predice otra cosa en alguna
 * instancia. Con 0 separadoras contra todos, no se ha elegido: se ha escrito. */
const sepDelGanador = ganadores.length === 1
  ? Object.entries(separadoras).filter(([k]) => k.includes(ganadores[0])).reduce((s, [, v]) => s + v.n, 0)
  : 0;

const dist = (k) => filas.reduce((o, f) => ((o[f[k]] = (o[f[k]] || 0) + 1), o), {});

const salida = {
  meta: {
    fecha: hoy(),
    que: "la UNIDAD del corte del extracto de la tarjeta de L3 (scientific-docs)",
    corpus: `${LISTADOS} (23 tarjetas, 3 términos) + ${DOCS} (23 cuerpos)`,
    sinRed: "derivación sobre disco: no toca el original ni el clon",
    contesta: "en qué unidad y sobre qué texto corta el extracto de L3",
    noMide: [
      `otros arquetipos: /blog y /etiqueta/* tienen su mecanismo medido aparte (lh-extracto), y son OTRO`,
      `el caso «cuerpo MÁS CORTO que el tope»: 0 de ${filas.length} tarjetas lo ejercitan — SIN PROBAR, no soportado`,
      `el terminador: las ${filas.length}/${filas.length} acaban en «...» ASCII; no se ha visto un solo «…» (hellip) en este arquetipo`,
    ],
    sabotaje: SABOTAJE,
  },
  poblacion: {
    tarjetas: pares.length,
    conCuerpo: filas.length,
    sinCuerpo,
    esPrefijoDelCuerpo: `${filas.filter((f) => f.esPrefijo).length}/${filas.length}`,
    porTermino: TERMINOS.map((t) => ({ termino: t, n: pares.filter((p) => p.termino === t).length })),
  },
  /* La tabla que refuta el modelo de caracteres SIN necesidad del cuerpo:
   * en bytes-crudo la longitud es CONSTANTE y en chars VARÍA. Una regla
   * generadora en chars predice constante en chars. */
  distribucionObservada: {
    bytesCrudo: dist("bytes"),
    charsCrudo: dist("chars"),
    bytesDeco: dist("bytesDeco"),
    charsDeco: dist("charsDeco"),
  },
  barrido,
  separadoras,
  veredicto: { ganadores, separadorasDelGanador: sepDelGanador },
};
w(`medidas/lh-extracto-unidad.json`, salida);

/* ══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO
 * Falla cuando la elección NO está respaldada, no cuando el número sale feo:
 *  · 0 modelos con pleno ⇒ ninguno reproduce: el mecanismo es otro;
 *  · >1 con pleno       ⇒ empate real, se ficha y NO se elige;
 *  · 1 con pleno y 0 separadoras ⇒ SIN PROBAR (§el comparador de modelos).
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n── ${filas.length} tarjetas de L3 · ${pares.length} en el corpus · prefijo del cuerpo ${filas.filter((f) => f.esPrefijo).length}/${filas.length}`);
console.log(`   observado CRUDO · bytes ${JSON.stringify(dist("bytes"))} · chars ${JSON.stringify(dist("chars"))}`);
console.log(`   observado DECO  · bytes ${JSON.stringify(dist("bytesDeco"))} · chars ${JSON.stringify(dist("charsDeco"))}`);
for (const [id, v] of Object.entries(barrido))
  console.log(`   ${id.padEnd(12)} mejor n=${String(v.mejorN).padStart(3)} · ${v.aciertos}/${v.de}` + (v.topesIndistinguibles.length > 1 ? ` · indistinguibles: ${v.topesIndistinguibles.join(",")}` : ""));
for (const [k, v] of Object.entries(separadoras)) console.log(`   sep ${k.padEnd(28)} ${v.n}` + (v.ejemplos.length ? ` · p.ej. ${v.ejemplos[0]}` : ""));

let codigo = 0;
/**
 * ⚠ PRIMERO EL MÍNIMO, Y NO ES ORDEN DE CONVENIENCIA.
 *
 * Con `filas.length === 0` la comparación `aciertos === filas.length` da
 * `0 === 0` para **los cuatro** modelos, así que la sonda anunciaría un
 * «EMPATE real» — un veredicto SOBRE MODELOS derivado de no haber mirado
 * ninguna instancia. El código de salida sería el correcto por el gancho, y el
 * motivo impreso, falso: §regla 1, *lo que imprime y lo que cuenta no pueden
 * discrepar*. Por debajo del mínimo esta sonda no opina de modelos.
 */
if (!ev.suficiente()) {
  console.log(`\n⛔ por debajo del mínimo (${ev.n}/${ev.minimo}): NO se emite veredicto de modelos.\n   Con 0 instancias los cuatro «empatan», y eso sería un empate de no haber mirado.`);
  codigo = 2;
} else if (ganadores.length === 0) {
  console.log(`\n⛔ NINGÚN modelo reproduce las ${filas.length}: el mecanismo no es ninguno de los cuatro.\n   No se elige por «el que más acierta» — eso es cablear el menos malo.`);
  codigo = 2;
} else if (ganadores.length > 1) {
  console.log(`\n⛔ EMPATE real (${ganadores.join(" · ")}): se ficha, NO se elige.`);
  codigo = 2;
} else if (sepDelGanador === 0) {
  console.log(`\n⛔ SIN PROBAR: '${ganadores[0]}' acierta ${filas.length}/${filas.length} y NINGÚN rival predice otra cosa en ninguna instancia.\n   0 separadoras ⇒ no se ha elegido, se ha escrito uno de los modelos.`);
  codigo = 2;
} else {
  console.log(
    `\n✅ LA UNIDAD ES '${ganadores[0]}' (n = ${barrido[ganadores[0]].mejorN}).\n` +
      `   Acierta ${filas.length}/${filas.length} y se ELIGE con ${sepDelGanador} instancias separadoras, no por acierto.\n` +
      `   Y el modelo de CARACTERES no empata: queda REFUTADO — predice longitud constante\n` +
      `   en chars y el dato tiene ${Object.keys(dist("chars")).length} valores (${Object.keys(dist("chars")).join(" · ")}).`,
  );
}
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} tarjetas de L3 · lh-extracto-unidad`);
process.exit(codigo);
