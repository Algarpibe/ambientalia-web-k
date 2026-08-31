// 126.ª · ESCALÓN 2 — ¿CABE EL LOTE F3-5 EN LA COLECCIÓN `paginas` QUE YA
// EXISTE, O NECESITA LA SUYA?
//
// §1.5b Razón 3 —*fusionar luego es más barato que separar luego*, y la
// operación se escribe: deshacer «separadas» es FUSIONAR, que es el lado
// barato— favorece empezar SEPARADO. Pero un criterio de asimetría no decide
// solo: decide **cuando las dos opciones siguen vivas tras contar**. Así que
// aquí se cuenta primero.
//
// LA PREGUNTA, en la unidad en la que se decide:
//
//   ¿cuántos TIPOS DE MÓDULO del lote F3-5 expresa ya la unión de `paginas`, y
//   cuántos tendría que estrenar? Si la intersección es casi todo, fusionar es
//   lo barato; si el lote estrena la mayoría, meterlo en `paginas` sería
//   ampliar una unión derivada de OTRO corpus — que es §*una regla derivada
//   sobre un dominio donde el caso NO SE DA está SIN PROBAR para ese caso*, con
//   el objeto puesto en el esquema.
//
// EL CRITERIO DE MÓDULO es el que fija §2n del ESQUEMA en esta misma tanda:
// nodo `.et_pb_module` del CUERPO que NO cuelga de otro. Ni el censo del DOM
// (311, cuenta un acordeón de 19 toggles como 20) ni el truncado del
// comparador (215). Se cita la unidad porque los tres son ciertos.
//
// ALCANCE: los 4 documentos del lote. Offline.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const BLOQUES_PAGINAS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const CRITERIO = join(DERIV, "paso0-criterio-126.json");

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];

/* ── PRECONDICIONES (§regla 37) ───────────────────────────────────────────── */
const faltan = [...DOCS.map((d) => join(CORPUS, d.doc)), BLOQUES_PAGINAS, CRITERIO].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ── CENSO · el mismo recorrido del PASO 0, copiado sin tocar ─────────────── */
const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

/**
 * ⚠⚠ EL TIPO SE DERIVA DEL **ORDINAL**, NO DE LA PRIMERA CLASE DESNUDA.
 *
 * La v1 de este censo tomaba `clases.find(c => /^et_pb_[a-z_]+$/.test(c))`, o
 * sea *la primera clase sin dígitos que no sea `et_pb_module`*. Eso no da error:
 * da **clases MODIFICADORAS leídas como tipos**, y con cara de dato —
 *
 *   `et_pb_with_border et_pb_module et_pb_text et_pb_text_7 menu-anclas`
 *      → v1 dijo `et_pb_with_border` (×4). El tipo es `et_pb_text`.
 *   `et_pb_module et_pb_cta_0 et_pb_promo`
 *      → v1 dijo `et_pb_promo`. El ordinal dice `et_pb_cta`.
 *   `et_pb_button_module_wrapper et_pb_button_0_wrapper et_pb_module`
 *      → v1 dijo `et_pb_button_module_wrapper`. El ordinal dice `et_pb_button`.
 *
 * Los tres inflaban el recuento de «tipos que el lote ESTRENA» y con él el
 * veredicto. Es §sondas 4 en su cara de SOBRE-CASADO, y lo delató que
 * *«con borde»* no es un tipo de módulo — §*un 100 % redondo, o un tipo
 * implausible, primero se sospecha del instrumento*.
 *
 * El ordinal es lo que el CONSTRUCTOR escribe, y su forma es
 * `et_pb_<tipo>_<n>[_sufijo]`. Cuando no hay ordinal —el editor no lo colocó:
 * §escalón 2 de la 125.ª— se cae a la clase desnuda, y eso se PUBLICA.
 */
function tipoDe(clases) {
  const ord = clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c));
  const porOrdinal = ord ? `et_pb_${/^et_pb_(.+?)_\d+(_[a-z]+)*$/.exec(ord)[1]}` : null;
  const desnuda = clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ?? clases.find((c) => /^dvmd_[a-z_]+$/.test(c)) ?? null;
  return {
    tipo: porOrdinal ?? desnuda ?? "?",
    via: porOrdinal ? "ordinal" : desnuda ? "clase-desnuda" : "ninguna",
    porOrdinal,
    desnuda,
  };
}

function censaModulos(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const pila = [];
  const modulos = [];
  const TAG = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  for (const m of cuerpo.matchAll(TAG)) {
    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (tag === "script" || tag === "style") continue;
    if (cierre) { for (let i = pila.length - 1; i >= 0; i--) if (pila[i].tag === tag) { pila.length = i; break; } continue; }
    if (VACIOS.has(tag) || /\/\s*$/.test(attrs)) continue;
    const cm = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
    const clases = cm ? cm[1].split(/\s+/).filter(Boolean) : [];
    const esModulo = clases.includes("et_pb_module");
    const esCascaron = clases.some((c) => /_tb_(header|footer)/.test(c));
    if (esModulo && !pila.some((p) => p.esCascaron) && !esCascaron) {
      modulos.push({ profModulo: pila.filter((p) => p.esModulo).length, ...tipoDe(clases) });
    }
    pila.push({ tag, esModulo, esCascaron });
  }
  return modulos;
}

const porDoc = {};
const tiposLote = new Map(); // tipo → { n, docs:Set }
const discrepan = new Map(); // ordinal!=desnuda → cuántos, y con qué par
let sinOrdinal = 0;
for (const d of DOCS) {
  const mods = censaModulos(readFileSync(join(CORPUS, d.doc), "utf8")).filter((m) => m.profModulo === 0);
  porDoc[d.arquetipo] = { primerNivel: mods.length, tipos: {} };
  for (const m of mods) {
    porDoc[d.arquetipo].tipos[m.tipo] = (porDoc[d.arquetipo].tipos[m.tipo] ?? 0) + 1;
    if (!tiposLote.has(m.tipo)) tiposLote.set(m.tipo, { n: 0, docs: new Set() });
    const t = tiposLote.get(m.tipo);
    t.n++; t.docs.add(d.arquetipo);
    if (m.via !== "ordinal") sinOrdinal++;
    else if (m.desnuda && m.desnuda !== m.porOrdinal) {
      const k = `${m.desnuda} → ${m.porOrdinal}`;
      discrepan.set(k, (discrepan.get(k) ?? 0) + 1);
    }
  }
}

/* ⚠ EL CONTROL QUE CAZA EL DEFECTO DE LA v1, y se publica siempre — no sólo
   cuando falla. Las dos vías tienen que coincidir en la mayoría; donde NO
   coinciden es donde la clase desnuda es un MODIFICADOR, y ahí manda el
   ordinal. Un cero aquí significaría que las dos vías son la misma función y el
   arreglo no habría cambiado nada (§*antes de fichar una indeterminación,
   comprueba que las dos hipótesis sean DISTINTAS*). */
const nDiscrepan = [...discrepan.values()].reduce((a, n) => a + n, 0);
ctl(
  nDiscrepan > 0,
  "las DOS vías de tipo (ordinal vs clase desnuda) DISCREPAN — o el arreglo de la v1 no habría cambiado nada",
  nDiscrepan ? [...discrepan].map(([k, n]) => `${k} ×${n}`).join(" · ") : "0 discrepancias: las dos vías son la misma función aquí",
);
ctl(
  sinOrdinal > 0 && sinOrdinal < [...tiposLote.values()].reduce((a, t) => a + t.n, 0),
  "la vía CLASE-DESNUDA se usa donde el constructor no numeró, y se publica con su cardinal",
  `${sinOrdinal} módulos de primer nivel sin ordinal (§escalón 2 de la 125.ª: lo que el editor no colocó)`,
);

/* CRUCE con el criterio fijado en el PASO 0 (§sondas 4: otra medida del mismo
   objeto, y se cruza POR DOCUMENTO, no por total). */
const crit = JSON.parse(readFileSync(CRITERIO, "utf8"));
const cruce = DOCS.map((d) => ({
  arquetipo: d.arquetipo,
  mio: porDoc[d.arquetipo].primerNivel,
  paso0: crit.criterio.elegido.cardinal[d.arquetipo],
  ok: porDoc[d.arquetipo].primerNivel === crit.criterio.elegido.cardinal[d.arquetipo],
}));
ctl(cruce.every((c) => c.ok), "CRUCE con el criterio del PASO 0: el cardinal de primer nivel REPRODUCE en 4/4", cruce.map((c) => `${c.arquetipo} ${c.mio}=${c.paso0}`).join(" · "));
ctl(tiposLote.size > 1, "el censo de TIPOS discrimina (ni cero ni un solo tipo)", `${tiposLote.size} tipos distintos`);

/* ── LADO `paginas` · los slugs de su unión, DERIVADOS del fuente ─────────── */
const fuente = readFileSync(BLOQUES_PAGINAS, "utf8");
const slugsPaginas = [...fuente.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
ctl(slugsPaginas.length > 0, "los bloques de `paginas` se DERIVAN de su fuente (no se recuerdan)", `${slugsPaginas.length}: ${slugsPaginas.join(" · ")}`);

/* La traducción tipo-de-Divi → slug del esquema. Se escribe AQUÍ y con su
   cardinal, porque es una tabla y una tabla es un dato recordado en cuanto se
   copia (§regla 9). Lo que NO case sale nombrado, nunca descontado. */
const A_SLUG = {
  et_pb_text: "texto-pagina",
  et_pb_image: "imagen-pagina",
  et_pb_button: "boton-pagina",
  et_pb_code: "codigo",
  et_pb_toggle: "toggle",
  et_pb_video: "video-pagina",
  et_pb_fullwidth_slider: "slider-completo",
  et_pb_slider: "slider",
  et_pb_map: "mapa",
  et_pb_blurb: "icono",
};

const filas = [...tiposLote.entries()]
  .map(([tipo, t]) => ({ tipo, instancias: t.n, docs: [...t.docs].sort(), slug: A_SLUG[tipo] ?? null, expresado: !!A_SLUG[tipo] && slugsPaginas.includes(A_SLUG[tipo]) }))
  .sort((a, b) => b.instancias - a.instancias);

const expresados = filas.filter((f) => f.expresado);
const estrena = filas.filter((f) => !f.expresado);
const instExpresadas = expresados.reduce((a, f) => a + f.instancias, 0);
const instEstrena = estrena.reduce((a, f) => a + f.instancias, 0);

ctl(
  expresados.length > 0 && estrena.length > 0,
  "el cruce DISCRIMINA: ni el lote cabe entero ni estrena todo (si no, no habría decisión que tomar)",
  `expresados=${expresados.length} tipos · estrena=${estrena.length} tipos`,
);
/* Control de suma: ningún tipo en dos cubos ni fuera. */
ctl(
  expresados.length + estrena.length === filas.length && instExpresadas + instEstrena === [...tiposLote.values()].reduce((a, t) => a + t.n, 0),
  "el reparto es una PARTICIÓN (ningún tipo en dos cubos ni fuera)",
  `${expresados.length}+${estrena.length}=${filas.length} tipos · ${instExpresadas}+${instEstrena}=${instExpresadas + instEstrena} instancias`,
);

/* ── VEREDICTO, con el número delante ─────────────────────────────────────── */
const pctTipos = (expresados.length / filas.length) * 100;
const pctInst = (instExpresadas / (instExpresadas + instEstrena)) * 100;
const veredicto =
  pctInst >= 90
    ? "REUTILIZAR `paginas`: la unión ya expresa casi todas las instancias del lote."
    : "COLECCIÓN PROPIA: el lote estrena bastante como para que meterlo en `paginas` fuera ampliar una unión derivada de otro corpus.";

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 126,
  escalon: 2,
  alcance: { docs: DOCS.map((d) => d.doc), unidad: "módulo de PRIMER NIVEL del cuerpo (§2n del ESQUEMA)", nota: "propiedad de estos 4 documentos" },
  controles,
  porDoc,
  tipos: filas,
  slugsPaginas,
  resumen: {
    tiposLote: filas.length,
    tiposExpresadosPorPaginas: expresados.length,
    tiposQueEstrena: estrena.length,
    instanciasExpresadas: instExpresadas,
    instanciasQueEstrenan: instEstrena,
    pctTipos: Math.round(pctTipos * 10) / 10,
    pctInstancias: Math.round(pctInst * 10) / 10,
  },
  veredicto,
};

for (const [ruta, texto] of [[join(DERIV, "tipos-f35-126.json"), JSON.stringify(salida, null, 1)]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto) { console.error(`❌ ${ruta} existe y DIFIERE — no se pisa (§regla 5).`); process.exit(1); }
  writeFileSync(ruta, texto);
}

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "FALLA"} ${c.nombre}\n      ${c.detalle}`);
say("\n=== TIPOS DE MÓDULO DEL LOTE (primer nivel) ===");
say("  tipo                        inst  docs                              ¿lo expresa `paginas`?");
for (const f of filas)
  say(`  ${f.tipo.padEnd(26)} ${String(f.instancias).padStart(4)}  ${f.docs.join(",").padEnd(32)} ${f.expresado ? `SI (${f.slug})` : "NO — lo ESTRENA"}`);
say(`\n  ${filas.length} tipos · ${instExpresadas} instancias expresadas · ${instEstrena} instancias que estrenan`);
say(`  cobertura: ${salida.resumen.pctTipos} % de los tipos · ${salida.resumen.pctInstancias} % de las instancias`);
say(`\n⇒ ${veredicto}`);

const fallos = controles.filter((c) => !c.ok);
say(`\n✓ evaluados 4/4 documentos · controles ${controles.length - fallos.length}/${controles.length}`);
writeFileSync(join(DERIV, "tipos-f35-126.log"), L.join("\n") + "\n");
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
