/**
 * EL CENSO DE ATRIBUTOS DEL CAMPO RICO — la mitad que la whitelist no mira.
 * Uso: npm run qa:atributos-censo   ·   Negativo: npm run qa:atributos-censo-neg
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * `validaHtmlCorpus` censa **ETIQUETAS** (las 43 de 209/209) y **HOSTS** de
 * iframe. **No mira los atributos.** Lo destapó §DATOS-DOM-AJENO: el `<article>`
 * de ChatGPT saltó por la etiqueta y los `data-start`/`data-end` del renderizador
 * ajeno **pasaron en silencio en 10 páginas**. No es un defecto del saneador: es
 * su ALCANCE, y no estaba escrito.
 *
 * > **En un campo que admite HTML del corpus y que un editor va a poder pegar,
 * > los atributos son superficie, no cosmética.** Sobre una etiqueta admitida
 * > entran `onclick`, `onerror`, `style` y `href="javascript:"` sin que nada los
 * > mire — `<script>` está bloqueado y el resto de vías de ejecución no.
 *
 * ── Qué hace, y qué NO ───────────────────────────────────────────────────
 * **Sólo censa.** La lista se DERIVA de lo que hay, igual que se derivaron las
 * 43 etiquetas; escribirla de memoria sería §regla 9 en su forma más cara,
 * porque de ella depende qué contenido servido se puede perder.
 *
 * **No decide y no rechaza**: eso lo hace el contrato, y sólo después de leer
 * este censo. Si aparecen atributos vivos que no se pueden rechazar sin perder
 * contenido servido, **es una decisión** y se ficha (encargo, ESCALÓN 3).
 *
 * ── El alcance, declarado ────────────────────────────────────────────────
 * Las **309** páginas del corpus, por sus REGIONES RICAS —no por el HTML entero
 * de la página, que traería el cascarón de Divi y mediría otra cosa—:
 *
 *   · grupo A (209) → `corpus/transformado/**`, que es lo que el seed inserta;
 *   · grupo C (76)  → las 5 regiones del caso y la 1 de la faq, ya extraídas y
 *     transformadas, de `medidas/c-extraido.json`.
 *
 * ⚠ **Es el HTML que ENTRA al CMS, no el crudo del original.** El pipeline ya se
 * llevó los `<script>` (T4a) y los ids ajenos (T3b), así que censar el crudo
 * daría una lista que el campo nunca va a ver — medir al nivel que no es.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const TRANSFORMADO = join(RAIZ, "corpus/transformado");
const SABOTAJE = process.env.SABOTAJE || null;
/**
 * ⚠ `tope-cero` → `lector-ubicuo` (97.ª, al escribir el negativo que no existía).
 *
 * `tope-cero` bajaba `TOPE_UBICUOS` a 0 y **no podía morder**: la guarda dispara
 * con `ubicuos.length > TOPE_UBICUOS`, y en este corpus hay **0 ubicuos** —el
 * atributo más extendido, `href`, está en 242 de 294 páginas—. O sea `0 > 0`,
 * falso, y el caso salía VERDE. Es §regla 17 segunda cara: un sabotaje que anula
 * **media** hipótesis no falsea nada; movía el umbral y dejaba el otro lado
 * quieto, así que tenía **0 instancias separadoras** por construcción.
 *
 * El sabotaje correcto reproduce el modo de fallo que la guarda vigila —*el
 * lector no está discriminando*—: hace que **todos** los atributos salgan en
 * todas las páginas. Con eso `ubicuos.length === filas.length` y supera el tope
 * real, que es la mitad. No se toca el tope: se toca el dato.
 */
const VALIDOS = ["lector-muerto", "lector-ubicuo"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * LAS REGIONES — las dos mitades del corpus, cada una de su fuente
 * ═════════════════════════════════════════════════════════════════════════ */

const regiones = [];

for (const col of readdirSync(TRANSFORMADO)) {
  const dir = join(TRANSFORMADO, col);
  for (const f of readdirSync(dir))
    regiones.push({ pagina: `${col}/${f.replace(/\.html$/, "")}`, campo: "cuerpo", html: readFileSync(join(dir, f), "utf8") });
}

const fC = join(QA, "medidas/c-extraido.json");
if (!existsSync(fC))
  throw new Error(
    `no existe medidas/c-extraido.json — es la salida de \`cms:extractor-c\`, y sin ella\n` +
      `  el censo cubriría 209 de 309 y lo diría como si fueran las 309.`,
  );
const C = JSON.parse(readFileSync(fC, "utf8"));
/** Las regiones ricas del grupo C, por su ruta en el documento extraído. */
const RICAS_C = ["necesidad", "solucion", "resultados", "destacado", "detalles.parametros", "cuerpo"];
const enRuta = (o, ruta) => ruta.split(".").reduce((x, k) => x?.[k], o);
for (const [coleccion, filas] of Object.entries(C.catalogo ?? {}))
  for (const d of filas)
    for (const campo of RICAS_C) {
      const v = enRuta(d, campo);
      if (typeof v === "string" && v) regiones.push({ pagina: `${coleccion}/${d.slug}`, campo, html: v });
    }

/**
 * ⚠ **Y `articulos-kb`, que el encargo no pedía y hace falta igual.** El censo se
 * pidió sobre «las 309» (grupo A + grupo C), pero la whitelist que salga de aquí
 * se aplica a `campoHtml`/`htmlLinea` — **y `articulos-kb` los usa**. Derivar la
 * regla sobre un dominio donde el caso no se da y aplicarla donde sí es la
 * trampa ya fichada (§F2-5-ESCALON-ETIQUETAS): el seed de KB moriría con un
 * atributo legítimo que este censo nunca vio.
 */
const fKb = join(QA, "medidas/kb-extraido.json");
if (!existsSync(fKb))
  throw new Error(
    `no existe medidas/kb-extraido.json.\n` +
      `  La whitelist derivada de aquí se aplica también a \`articulos-kb\`, así que\n` +
      `  censar sin él daría una lista que rompe su siembra sin haberlo mirado.`,
  );
const KB = JSON.parse(readFileSync(fKb, "utf8"));
if (!Array.isArray(KB.articulos) || !KB.articulos.length)
  throw new Error("kb-extraido.json no trae `articulos` como array no vacío.");
const cadenas = (x, id, fn) => {
  if (typeof x === "string") fn(x, id);
  else if (Array.isArray(x)) x.forEach((y, i) => cadenas(y, `${id}[${i}]`, fn));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) cadenas(v, `${id}.${k}`, fn);
};
for (const a of KB.articulos)
  cadenas(a.cuerpo, `articulos-kb/${a.slug}#cuerpo`, (v, id) => {
    if (/<[a-zA-Z]/.test(v)) regiones.push({ pagina: `articulos-kb/${a.slug}`, campo: id.split("#")[1] ?? "cuerpo", html: v });
  });

const paginas = new Set(regiones.map((r) => r.pagina));

/* ══════════════════════════════════════════════════════════════════════════
 * EL LECTOR — atributos de etiquetas reales, no de texto que parezca marcado
 * ═════════════════════════════════════════════════════════════════════════ */

/** Una etiqueta de apertura completa. Sin hueco tras `<`, como el parser. */
const RE_APERTURA = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;
/** Los pares `nombre[=valor]` dentro de una apertura. */
const RE_ATRIBUTO = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

/**
 * Las FAMILIAS peligrosas, censadas aparte y **con su número aunque sea cero**:
 * un cero medido y un cero no mirado se escriben igual (§sondas 4).
 */
const FAMILIAS = [
  { id: "manejador-on*", porQue: "ejecuta JS sobre una etiqueta admitida", casa: (n) => /^on[a-z]+$/i.test(n) },
  { id: "url-javascript:", porQue: "`href`/`src` con esquema `javascript:`", casa: (n, v) => /^(href|src|xlink:href|formaction|action)$/i.test(n) && /^\s*javascript:/i.test(v ?? "") },
  { id: "url-data:", porQue: "`href`/`src` con `data:` — puede llevar HTML ejecutable", casa: (n, v) => /^(href|src)$/i.test(n) && /^\s*data:/i.test(v ?? "") },
  { id: "style", porQue: "CSS en línea del editor: no ejecuta, pero pinta", casa: (n) => /^style$/i.test(n) },
  { id: "srcdoc", porQue: "documento embebido en línea dentro de un iframe", casa: (n) => /^srcdoc$/i.test(n) },
  { id: "data-* ajeno", porQue: "restos de otra aplicación (§DATOS-DOM-AJENO)", casa: (n) => /^data-(start|end|message-|testid|scroll-anchor|block-id)/i.test(n) },
];

const censo = new Map(); // atributo → { n, paginas:Set, porEtiqueta:Map, muestra }
const porFamilia = Object.fromEntries(FAMILIAS.map((f) => [f.id, { n: 0, paginas: new Set(), muestras: [] }]));
let aperturas = 0;

/* ⚠ El mínimo se deriva de las REGIONES y **no lo rebaja ningún sabotaje**
 * (97.ª). Aquí ponía `SABOTAJE ? 1 : regiones.length`, y aunque en la práctica
 * daba igual —`ev.ok()` corre por región con sabotaje o sin él—, leía como que
 * el sabotaje mueve la portería (§regla 17). Con el mínimo quieto, cada caso del
 * negativo cae por SU guarda —`LECTOR MUERTO`, `UBICUO`— y no por el contrato,
 * que es lo único que hace que su verde signifique algo. */
const ev = new Evaluadas({ nombre: "atributos-censo", unidad: "regiones ricas", minimo: regiones.length });

for (const r of regiones) {
  RE_APERTURA.lastIndex = 0;
  let m;
  while ((m = RE_APERTURA.exec(SABOTAJE === "lector-muerto" ? "" : r.html))) {
    aperturas++;
    const etiqueta = m[1].toLowerCase();
    RE_ATRIBUTO.lastIndex = 0;
    let a;
    while ((a = RE_ATRIBUTO.exec(m[2] ?? ""))) {
      const nombre = (a[1] ?? "").toLowerCase();
      if (!nombre) continue;
      const valor = a[2] ?? a[3] ?? a[4] ?? null;
      if (!censo.has(nombre)) censo.set(nombre, { n: 0, paginas: new Set(), porEtiqueta: new Map(), muestra: valor });
      const e = censo.get(nombre);
      e.n++;
      e.paginas.add(r.pagina);
      e.porEtiqueta.set(etiqueta, (e.porEtiqueta.get(etiqueta) ?? 0) + 1);
      for (const f of FAMILIAS)
        if (f.casa(nombre, valor)) {
          const g = porFamilia[f.id];
          g.n++;
          g.paginas.add(r.pagina);
          if (g.muestras.length < 5) g.muestras.push({ pagina: r.pagina, campo: r.campo, atributo: nombre, valor: String(valor ?? "").slice(0, 120) });
        }
    }
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

const filas = [...censo.entries()].sort((a, b) => b[1].n - a[1].n);

console.log(`\n════════ CENSO DE ATRIBUTOS · ${paginas.size} páginas · ${regiones.length} regiones ricas ════════\n`);
console.log(`   aperturas de etiqueta leídas   ${aperturas}`);
console.log(`   atributos DISTINTOS            ${filas.length}\n`);
console.log(`   atributo                   apariciones   páginas   etiquetas`);
for (const [nombre, e] of filas)
  console.log(`   ${nombre.padEnd(26)} ${String(e.n).padStart(9)}   ${String(e.paginas.size).padStart(7)}   ${[...e.porEtiqueta.keys()].slice(0, 6).join(" ")}`);

console.log(`\n  ── LAS FAMILIAS QUE DECIDEN EL CONTRATO (con su número, aunque sea cero) ──`);
for (const f of FAMILIAS) {
  const g = porFamilia[f.id];
  console.log(`   ${f.id.padEnd(18)} ${String(g.n).padStart(5)} apariciones · ${String(g.paginas.size).padStart(3)} páginas   ${f.porQue}`);
  for (const s of g.muestras) console.log(`       ${s.pagina} · ${s.campo} · ${s.atributo}="${s.valor}"`);
}

/* ── LAS GUARDAS ────────────────────────────────────────────────────────── */

/* MUERTO: si el lector no casa ni una apertura, esto no es «no hay atributos». */
if (aperturas === 0) err(`LECTOR MUERTO: 0 aperturas de etiqueta en ${regiones.length} regiones. Un cero de lector no es un dato.`);
/* UBICUO: un atributo que aparece en TODAS las páginas no discrimina nada —
 * puede ser cierto (`class`), así que no es rojo por sí solo; lo que sí es rojo
 * es que TODOS lo hagan, porque entonces el lector está leyendo otra cosa. */
/* El sabotaje toca el DATO, no el umbral: simula un lector que casa lo mismo en
 * todas las páginas, que es el modo de fallo del que la guarda protege. */
if (SABOTAJE === "lector-ubicuo") for (const [, e] of censo) e.paginas = new Set(paginas);
const TOPE_UBICUOS = Math.max(1, Math.floor(filas.length * 0.5));
const ubicuos = filas.filter(([, e]) => e.paginas.size === paginas.size);
if (ubicuos.length > TOPE_UBICUOS)
  err(`UBICUO: ${ubicuos.length} atributos aparecen en las ${paginas.size} páginas (tope ${TOPE_UBICUOS}) — el lector no está discriminando.`);
if (!filas.length) err(`0 atributos distintos: el censo no puede estar vacío con ${aperturas} aperturas leídas.`);

/* ⚠ §regla 24, mitad de higiene: **la sonda desvía sus propios sabotajes.** Si
 * el desvío dependiera de que quien la lanza ponga `NEG=`, una corrida saboteada
 * a mano dejaría un fichero fechado y SIN marcar — nombre de medida, contenido
 * de sabotaje (§regla 7). Y este censo es el que decide qué atributos se pueden
 * rechazar sin perder contenido servido: leerlo saboteado sale caro. */
const SALIDA = SABOTAJE ? nombreNeg("medidas/atributos-censo.json", SABOTAJE) : "medidas/atributos-censo.json";
if (SABOTAJE) console.log(`\n  ⚠ SABOTAJE activo: la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.`);

w(SALIDA, {
  meta: {
    fecha: hoy(),
    que: "el censo de ATRIBUTOS del campo rico — la mitad que `validaHtmlCorpus` no mira",
    alcance: `${paginas.size} páginas · ${regiones.length} regiones ricas (grupo A desde corpus/transformado, grupo C desde c-extraido)`,
    nivel: "el HTML que ENTRA al CMS (post-pipeline), no el crudo del original",
    sabotaje: SABOTAJE,
    noDecide: "esto CENSA. Qué se admite y qué se rechaza lo decide el contrato, con este censo delante.",
  },
  recuento: { paginas: paginas.size, regiones: regiones.length, aperturas, atributosDistintos: filas.length },
  familias: Object.fromEntries(FAMILIAS.map((f) => [f.id, { ...porFamilia[f.id], paginas: porFamilia[f.id].paginas.size, porQue: f.porQue }])),
  atributos: Object.fromEntries(
    filas.map(([n, e]) => [n, { n: e.n, paginas: e.paginas.size, etiquetas: [...e.porEtiqueta.keys()].sort(), muestra: e.muestra === null ? null : String(e.muestra).slice(0, 120) }]),
  ),
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} atributos-censo: ${filas.length} atributos distintos en ${paginas.size} páginas · ` +
    `${FAMILIAS.filter((f) => porFamilia[f.id].n > 0).length} de ${FAMILIAS.length} familias sensibles PRESENTES · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
