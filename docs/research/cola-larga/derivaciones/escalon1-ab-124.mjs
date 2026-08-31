// 124.ª · ESCALON 1 — HACIA ATRAS, Y EN LAS DOS DIRECCIONES.
//
// §*una comprobacion retroactiva se enmarca en las DOS direcciones*: preguntar
// solo «¿lo viejo esta mal?» sesga que respuesta se encuentra. Las dos preguntas
// se escriben ANTES de mirar y se contestan con EL MISMO barrido.
//
//   (a) ¿LO VIEJO ESTA MAL?  Los content types ya escritos guardan el ritmo en
//       campos `type: "number"`, que NO pueden expresar un porcentaje. Si en sus
//       arquetipos el editor escribio porcentajes de margin/padding, esos campos
//       guardarian el px de 1440 y servirian ese px a 390 — sin dar error.
//
//   (b) ¿LO NUEVO ESTA SOBRE-GENERALIZADO?  El PASO 0 midio 31 casos de «el
//       editor escribio un %» y 20 de «el editor escribio por punto de ruptura»
//       en el LOTE de F3-5 (PRODUCTO · CATALOGO · SOFTWARE · SOFTWARE-corta).
//       ¿Es eso del LOTE o de todos los `B-`? Si solo se sostiene en el lote, el
//       hallazgo lleva su dominio escrito y NO se generaliza.
//
// ⚠ EL FALSO POSITIVO QUE HAY QUE EVITAR: un campo derivado con el test A que
// ADEMAS paso el test B esta sostenido por el SEGUNDO, no por el primero. Los
// dos se separan, y el que importa es el que NO tiene segunda pata.
//
// EL INSTRUMENTO es el mismo para los cuatro arquetipos, que es lo que hace
// comparables sus resultados: recorrer el CSS SERVIDO y contar reglas cuyo
// selector lleve ORDINAL (`et_pb_<tipo>_<n>` — la huella del editor) y que
// declaren un eje de ritmo, separadas por UNIDAD y por si viven en un `@media`.
//
// ⚠⚠ Y SE RECORREN LOS DOS CANALES. Divi compila el CSS del editor en el
// `<style>` de la pagina **o** en una hoja `et-cache` ENLAZADA. Escanear solo el
// HTML daria un CERO DEL INSTRUMENTO en cualquier arquetipo cuyo CSS este fuera
// (§*una afirmacion de que un discriminador NO EXISTE se escribe con la lista de
// canales que se miraron*). El control publica cuantas hojas se resolvieron.

import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CSSDIR = join(RAIZ, "corpus/css");

/* Los cuatro arquetipos en regimen `B-` (builder puro) que este repo ha medido.
 * El regimen NO se recuerda: esta derivado en CLAUDE.md §regimenes y en
 * candidatos-f35-123.json para el lote. */
const ARQUETIPOS = [
  { nombre: "LOTE-F3-5", dir: "corpus/productos", ficheros: ["monitor-calidad-aire.html", "accesorios.html", "software-de-medicion-calidad-del-aire.html", "kunak-api.html"], escrito: false },
  { nombre: "SECTOR+MONOGRAFICO", dir: "corpus/fase-3-sectores", ficheros: null, escrito: true },
  { nombre: "ARTICULOS-KB", dir: "corpus/fase-3/articulos-kb", ficheros: null, escrito: true },
];

const EJES = ["margin-top", "margin-bottom", "padding-top", "padding-bottom", "margin", "padding"];
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;

/**
 * ⚠⚠ **SUJETO O CONTEXTO — §regla 36, y la primera version no lo separaba.**
 *
 * `.X { prop }` dice que la propiedad cae en el nodo que lleva la clase.
 * `.X .otra { prop }` dice que cae en un DESCENDIENTE. Los dos son «efecto de
 * X», pero solo el primero es una declaracion SOBRE el nodo ordinal.
 *
 * Se vio en la muestra: `.et_pb_slider .et_pb_slide_0 .et_pb_slide_description
 * { padding-top: 6% }` sale como «el editor escribio un % de ritmo» y no lo es
 * — el ordinal ahi es CONTEXTO y lo que recibe el `padding` es la descripcion
 * de la diapositiva, que no es ninguno de los tres niveles (seccion · fila ·
 * modulo) que el content type modela.
 *
 * La comprobacion es de una linea: la clase es SUJETO si el ordinal aparece en
 * el ULTIMO compuesto del selector (tras partir por combinadores). Con listas
 * separadas por comas, cada alternativa tiene su propio papel.
 */
const tieneOrdinal = (compuesto) => {
  for (const m of compuesto.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (ORDINAL.test(m[1])) return true;
  return false;
};
const papel = (selectorLista) => {
  let sujeto = false, contexto = false;
  for (const alt of selectorLista.split(",")) {
    if (/_tb_/.test(alt)) continue;
    const compuestos = alt.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    if (!compuestos.length) continue;
    if (tieneOrdinal(compuestos[compuestos.length - 1])) sujeto = true;
    else if (compuestos.some(tieneOrdinal)) contexto = true;
  }
  return sujeto ? "sujeto" : contexto ? "contexto" : null;
};

/** El NIVEL que el ordinal nombra, para saber si el content type lo modela. */
const nivelDe = (selectorLista) => {
  for (const alt of selectorLista.split(",")) {
    const comps = alt.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    const ult = comps[comps.length - 1] ?? "";
    for (const m of ult.matchAll(/\.(et_pb_([a-z_]+?)_\d+(?:_[a-z]+)*)\b/g)) {
      const t = m[2];
      if (t === "section") return "seccion";
      if (t === "row" || t === "row_inner") return "fila";
      if (t === "column" || t === "column_inner") return "columna";
      return `modulo:${t}`;
    }
  }
  return null;
};
const attr = (t, n) => t.match(new RegExp(`${n}=["']([^"']*)["']`, "i"))?.[1] ?? null;

/** Recorre un directorio y sus subdirectorios buscando .html. */
function htmlsDe(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...htmlsDe(join(dir, e.name)).map((x) => join(e.name, x)));
    else if (e.name.endsWith(".html")) out.push(e.name);
  }
  return out;
}

/** Todo el CSS que una pagina sirve: sus `<style>` MAS sus hojas ENLAZADAS. */
function cssServido(html) {
  const trozos = [];
  let enlazadas = 0, resueltas = 0;
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) trozos.push({ canal: "style", css: m[1] });
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/rel=["']?stylesheet/i.test(tag)) continue;
    const href = attr(tag, "href");
    if (!href) continue;
    enlazadas++;
    const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
    const f = join(CSSDIR, rel);
    if (/^https?:/i.test(rel) || !existsSync(f)) continue;
    resueltas++;
    trozos.push({ canal: /et-cache/.test(rel) ? "et-cache" : "hoja", css: readFileSync(f, "utf8") });
  }
  return { trozos, enlazadas, resueltas };
}

/** Reglas de ritmo con selector del EDITOR, clasificadas por unidad y por @media. */
function reglasDelEditor(css, canal) {
  const out = [];
  /* se recorre nivel a nivel para saber si la regla vive dentro de un @media */
  const visita = (texto, dentroDeMedia) => {
    for (const m of texto.matchAll(/([^{}]+)\{/g)) {
      const cab = m[1].trim();
      let i = m.index + m[0].length, depth = 1;
      while (i < texto.length && depth > 0) { if (texto[i] === "{") depth++; else if (texto[i] === "}") depth--; i++; }
      const cuerpo = texto.slice(m.index + m[0].length, i - 1);
      if (/^@(media|supports)/i.test(cab)) { visita(cuerpo, /^@media/i.test(cab) ? cab : dentroDeMedia); continue; }
      if (/^@/.test(cab)) continue;
      const pap = papel(cab);
      if (!pap) continue;
      const niv = nivelDe(cab);
      for (const dm of cuerpo.matchAll(/(^|[;\s])(margin|padding)(-top|-bottom)?\s*:\s*([^;}]+)/gi)) {
        const prop = (dm[2] + (dm[3] ?? "")).toLowerCase();
        if (!EJES.includes(prop)) continue;
        const valor = dm[4].trim();
        /* la unidad de lo VERTICAL: en `margin: a b c d` interesan 1.º y 3.º */
        const partes = valor.replace(/!important/i, "").trim().split(/\s+/);
        const vert = prop === "margin" || prop === "padding" ? [partes[0], partes[2] ?? partes[0]] : [partes[0]];
        const unidad = vert.some((v) => /%/.test(v)) ? "%" : vert.some((v) => /(em|rem|ch|ex)\b/.test(v)) ? "relativa-al-font" : vert.some((v) => /px/.test(v)) ? "px" : /^(auto|inherit|initial|unset)$/i.test(vert[0] ?? "") ? "no-numerica" : "otra";
        out.push({ sel: cab.slice(0, 120), prop, valor: valor.slice(0, 60), unidad, media: dentroDeMedia ?? null, canal, papel: pap, nivel: niv });
      }
    }
  };
  visita(css, null);
  return out;
}

/* ── BARRIDO ──────────────────────────────────────────────────────────────── */
const porArquetipo = {};
for (const a of ARQUETIPOS) {
  const dir = join(RAIZ, a.dir);
  if (!existsSync(dir)) { porArquetipo[a.nombre] = { error: `no existe ${a.dir}` }; continue; }
  const ficheros = a.ficheros ?? htmlsDe(dir);
  let enlazadas = 0, resueltas = 0, paginasSinNingunaHoja = 0;
  const reglas = [];
  for (const f of ficheros) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const html = readFileSync(p, "utf8");
    const { trozos, enlazadas: e, resueltas: r } = cssServido(html);
    enlazadas += e; resueltas += r;
    if (r === 0) paginasSinNingunaHoja++;
    for (const t of trozos) for (const x of reglasDelEditor(t.css, t.canal)) reglas.push({ ...x, pagina: f });
  }
  /* ⚠ SOLO las reglas donde el ordinal es SUJETO cuentan como «el editor
   * escribio ESTO en ESTE nodo». Las de CONTEXTO se publican aparte, con su
   * cardinal: son efecto del editor y NO son una declaracion sobre el nivel que
   * el content type modela (§regla 36). */
  const sujeto = reglas.filter((r) => r.papel === "sujeto");
  const contexto = reglas.filter((r) => r.papel === "contexto");
  /* y de las de SUJETO, las que caen en un nivel que el content type modela */
  const MODELADOS = (n) => n === "seccion" || n === "fila" || n === "columna" || String(n).startsWith("modulo:");
  const modelados = sujeto.filter((r) => MODELADOS(r.nivel));
  /**
   * ⚠⚠ **UN `%` DE VALOR CERO ES INOCUO, Y CONTARLO INFLA EL RIESGO.**
   * `0%` y `0px` computan **el mismo px a todos los anchos** — es aritmetica, no
   * una excepcion de conveniencia. Un campo `type:number` guarda `0` y sirve `0`
   * a los dos anchos: no hay nada que perder. Solo los `%` NO CERO pueden
   * guardarse mal, asi que el riesgo se cuenta sobre esos y el cero va aparte
   * con su cardinal.
   */
  const esPctCero = (r) => r.unidad === "%" && (r.valor.replace(/!important/i, "").trim().split(/\s+/).every((v) => /^-?0(\.0+)?%$/.test(v) || !/%/.test(v)));
  const porUnidad = {};
  for (const r of modelados) porUnidad[r.unidad === "%" && esPctCero(r) ? "%-cero (inocuo)" : r.unidad] = (porUnidad[r.unidad === "%" && esPctCero(r) ? "%-cero (inocuo)" : r.unidad] ?? 0) + 1;
  const enMedia = modelados.filter((r) => r.media);
  const pctRiesgo = modelados.filter((r) => r.unidad === "%" && !esPctCero(r));
  const porNivel = {};
  for (const r of pctRiesgo) porNivel[r.nivel] = (porNivel[r.nivel] ?? 0) + 1;
  porArquetipo[a.nombre] = {
    contentTypeYaEscrito: a.escrito,
    paginas: ficheros.length,
    hojas: { enlazadas, resueltas, sinResolver: enlazadas - resueltas, paginasSinNingunaHoja },
    reglas: { total: reglas.length, sujeto: sujeto.length, contexto: contexto.length, sujetoEnNivelModelado: modelados.length },
    porUnidad,
    /* LOS DOS MODOS QUE ROMPEN EL TEST A, sobre niveles que el esquema modela */
    FN_pct: pctRiesgo.length,
    FN_pct_cero_inocuo: porUnidad["%-cero (inocuo)"] ?? 0,
    FN_bp: enMedia.length,
    nivelesConPct: porNivel,
    pctRiesgoEnteros: pctRiesgo.map((r) => `${r.pagina} · [${r.nivel}] ${r.sel} { ${r.prop}: ${r.valor} }`),
    porCanal: modelados.reduce((acc, r) => ((acc[r.canal] = (acc[r.canal] ?? 0) + 1), acc), {}),
    muestraPct: pctRiesgo.slice(0, 5).map((r) => `${r.pagina} · [${r.nivel}] ${r.sel} { ${r.prop}: ${r.valor} }`),
    muestraBp: enMedia.slice(0, 5).map((r) => `${r.pagina} · ${r.media} · [${r.nivel}] ${r.sel} { ${r.prop}: ${r.valor} }`),
  };
}

/* ── (a) LOS CAMPOS EN RIESGO, derivados del ESQUEMA ───────────────────────── */
const src = (p) => (existsSync(join(RAIZ, p)) ? readFileSync(join(RAIZ, p), "utf8") : "");
const comunes = src("packages/cms-config/src/campos/comunes.ts");
const camposRitmo = [];
/* ⚠ el cierre NO es siempre `};`: `ritmoInline` es un `Field[]` y cierra con
 * `];`. La primera version solo buscaba `};` y publico «0 campos» — un cero del
 * instrumento, cazado por su propio control (§sondas 4). */
for (const bloque of ["ritmoInline", "ritmoModulo"]) {
  /* ⚠ y el fuente esta en CRLF: un `\n` pelado no casa su fin de linea. La v2
   * seguia dando «0 campos» por eso — el mismo cero, la segunda causa. */
  const m = comunes.match(new RegExp(`export const ${bloque}\\b[\\s\\S]*?\\r?\\n[\\]}];`));
  if (!m) continue;
  for (const f of m[0].matchAll(/\{\s*name:\s*"(\w+)",\s*type:\s*"(\w+)"/g)) camposRitmo.push({ grupo: bloque, campo: f[1], tipo: f[2] });
}
/**
 * ⚠⚠ **Y LA OTRA MITAD DE (a): ¿HAY YA UNA PRIMITIVA QUE SI EXPRESA EL `%`?**
 * Preguntar solo «¿que campos son `number`?» encuentra el riesgo y NO encuentra
 * la defensa — que es §*una comprobacion retroactiva se enmarca en las DOS
 * direcciones* aplicada dentro del propio barrido. `medida()` guarda
 * `{valor, unidad, movilValor, unidadMovil}`, o sea que expresa **los dos**
 * modos que rompen el test A: el `%` y el valor por punto de ruptura.
 */
const conMedida = {};
for (const d of ["bloques", "colecciones"]) {
  const base = join(RAIZ, "packages/cms-config/src", d);
  if (!existsSync(base)) continue;
  for (const f of readdirSync(base).filter((x) => x.endsWith(".ts"))) {
    const t = readFileSync(join(base, f), "utf8");
    const usos = [...t.matchAll(/\bmedida\(\s*"(\w+)"/g)].map((m) => m[1]);
    if (usos.length) conMedida[`${d}/${f}`] = usos;
  }
}
const campoMedida = comunes.match(/export function medida[\s\S]*?\r?\n\}/);
const medidaExpresa = {
  existe: !!campoMedida,
  subcampos: campoMedida ? [...campoMedida[0].matchAll(/name:\s*"(\w+)"/g)].map((m) => m[1]).filter((x) => x !== "name") : [],
  expresaPct: !!campoMedida && /unidadDe\(\s*"valor"/.test(campoMedida[0]),
  expresaPuntoDeRuptura: !!campoMedida && /movilValor/.test(campoMedida[0]),
};

/* quien los consume: se DERIVA con un recorrido del esquema, no se recuerda */
const consumidores = {};
for (const d of ["bloques", "colecciones"]) {
  const base = join(RAIZ, "packages/cms-config/src", d);
  if (!existsSync(base)) continue;
  for (const f of readdirSync(base).filter((x) => x.endsWith(".ts"))) {
    const t = readFileSync(join(base, f), "utf8");
    for (const g of ["ritmoInline", "ritmoModulo", "moduloBase", "anchoPct"]) {
      if (new RegExp(`\\b${g}\\b`).test(t)) (consumidores[g] ??= []).push(`${d}/${f}`);
    }
  }
}

/* ── CONTROLES ────────────────────────────────────────────────────────────── */
const controles = [];
const vivos = Object.entries(porArquetipo).filter(([, v]) => !v.error);
controles.push({ nombre: "se recorrieron los 3 arquetipos declarados", ok: vivos.length === ARQUETIPOS.length, visto: vivos.map(([k, v]) => `${k}=${v.paginas}p`).join(" · ") });
/* ⚠ EL CONTROL QUE IMPIDE EL CERO DEL INSTRUMENTO: si un arquetipo no resolvio
 * ni una hoja, su 0 no es una medida del original — es que no se miro el canal. */
const sinHojas = vivos.filter(([, v]) => v.hojas.resueltas === 0);
controles.push({
  nombre: "todo arquetipo resolvio hojas (si no, su 0 es del INSTRUMENTO, no del original)",
  ok: sinHojas.length === 0,
  visto: sinHojas.length ? `SIN NINGUNA HOJA: ${sinHojas.map(([k]) => k).join(", ")} ⇒ su cero NO se puede leer` : vivos.map(([k, v]) => `${k} ${v.hojas.resueltas}/${v.hojas.enlazadas}`).join(" · "),
});
controles.push({ nombre: "el ordinal DISCRIMINA (no casa con todo ni con nada)", ok: vivos.some(([, v]) => v.reglas.total > 0), visto: vivos.map(([k, v]) => `${k}=${v.reglas.total}`).join(" · ") });
/* ⚠ §regla 36: si TODAS las reglas salieran «sujeto», el separador sujeto/contexto
 * no estaria separando nada — seria el pleno con otra cara. */
controles.push({ nombre: "SUJETO y CONTEXTO se separan de verdad (§regla 36)", ok: vivos.some(([, v]) => v.reglas.sujeto > 0) && vivos.some(([, v]) => v.reglas.contexto > 0), visto: vivos.map(([k, v]) => `${k} sujeto=${v.reglas.sujeto}/ctx=${v.reglas.contexto}`).join(" · ") });
controles.push({ nombre: "el esquema declara campos de ritmo y se hallaron sus consumidores", ok: camposRitmo.length > 0 && Object.keys(consumidores).length > 0, visto: `${camposRitmo.length} campos · consumidores de ${Object.keys(consumidores).join(", ")}` });
const nulo = controles.some((c) => !c.ok);

const lote = porArquetipo["LOTE-F3-5"];
const otros = vivos.filter(([k]) => k !== "LOTE-F3-5");
const salida = {
  meta: {
    tanda: "124.ª · ESCALON 1", fecha: new Date().toISOString().slice(0, 10),
    lado: "UNO — el CSS SERVIDO del original capturado (dos canales: `<style>` y hojas enlazadas)",
    unidad: "LA REGLA CSS (selector × propiedad), no el nodo ni la pagina",
    dosPreguntas: [
      "(a) ¿lo VIEJO esta mal? — content types ya escritos con ritmo en `type:number`, que no expresa `%`",
      "(b) ¿lo NUEVO esta sobre-generalizado? — ¿el hallazgo es del LOTE o de todos los `B-`?",
    ],
    noContesta: [
      "cuantos NODOS toca cada regla — eso lo mide paso0-nodos-124 con la cascada, y solo para el lote",
      "si la regla GANA la cascada: aqui se cuenta que EXISTE, no que se aplique",
      "la varianza INTER-instancia dentro de cada arquetipo",
    ],
  },
  controles,
  porArquetipo,
  camposEnRiesgo: {
    porQue: "`type: \"number\"` no puede expresar un porcentaje: guardaria el px de 1440 y lo serviria a 390",
    campos: camposRitmo,
    consumidores,
    /* LA DEFENSA QUE YA EXISTE — la otra direccion de la comprobacion */
    laPrimitivaQueSiLoExpresa: { nombre: "medida()", ...medidaExpresa, laUsan: conMedida },
  },
  /* La separacion que el encargo exige: test A solo, o test A + test B. */
  segundaPata: {
    "anchoPct": { testA: "NO vale — se escribe en % igual que su default", testB: "SI — 70·80·90·100 en la misma pagina", sostenidoPor: "test B", enRiesgo: false },
    "lh": { testA: "NO vale — es tipografia, fuera del alcance", testB: "SI — 30.6·36·45 por modulo", sostenidoPor: "test B", enRiesgo: false },
    "flujo": { testA: "no se uso — sale de barrer los 8 sectores con tree-todos", testB: "SI — dos formas de seccion y dos de fila entre instancias", sostenidoPor: "barrido inter-instancia", enRiesgo: false },
    "ritmoInline/ritmoModulo (mt·mb·pt·pb)": { testA: "SI, y es el unico apoyo del NUMERO", testB: "parcial: varia entre modulos, pero eso da «es campo», NO da su UNIDAD", sostenidoPor: "test A para la unidad", enRiesgo: true },
  },
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/escalon1-ab-124.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== EL BARRIDO — reglas de RITMO con selector del EDITOR, por arquetipo ===");
console.log(`  ${"arquetipo".padEnd(20)} ${"pag".padStart(4)} ${"hojas".padStart(7)} ${"suj".padStart(5)} ${"ctx".padStart(5)} ${"nivel-mod".padStart(9)} ${"FN-%".padStart(5)} ${"FN-bp".padStart(6)}  ct`);
for (const [k, v] of Object.entries(porArquetipo)) {
  if (v.error) { console.log(`  ${k.padEnd(20)} ERROR ${v.error}`); continue; }
  console.log(`  ${k.padEnd(20)} ${String(v.paginas).padStart(4)} ${String(v.hojas.resueltas + "/" + v.hojas.enlazadas).padStart(7)} ${String(v.reglas.sujeto).padStart(5)} ${String(v.reglas.contexto).padStart(5)} ${String(v.reglas.sujetoEnNivelModelado).padStart(9)} ${String(v.FN_pct).padStart(5)} ${String(v.FN_bp).padStart(6)}  ${v.contentTypeYaEscrito ? "SI" : "NO"}`);
  console.log(`  ${"".padEnd(20)} unidades=${JSON.stringify(v.porUnidad)} canales=${JSON.stringify(v.porCanal)}`);
  if (v.FN_pct) console.log(`  ${"".padEnd(20)} niveles con %: ${JSON.stringify(v.nivelesConPct)}`);
  for (const m of v.muestraPct) console.log(`      %  ${m}`);
  for (const m of v.muestraBp) console.log(`      bp ${m}`);
}
console.log("");
console.log("=== (a) ¿LO VIEJO ESTA MAL? ===");
const viejosConPct = otros.filter(([, v]) => v.FN_pct > 0);
console.log(`  arquetipos con content type YA ESCRITO: ${otros.map(([k]) => k).join(" · ")}`);
console.log(`  de esos, con % de ritmo escrito por el editor: ${viejosConPct.length ? viejosConPct.map(([k, v]) => `${k} (${v.FN_pct})`).join(" · ") : "NINGUNO"}`);
console.log(`  ⇒ ${viejosConPct.length ? "HAY campos en riesgo: `type:number` no expresa esos %" : "lo viejo NO esta mal por este mecanismo — pero su alcance es lo MEDIDO, no una garantia"}`);
console.log("");
console.log("=== (b) ¿LO NUEVO ESTA SOBRE-GENERALIZADO? ===");
console.log(`  el LOTE: FN-% ${lote?.FN_pct} · FN-bp ${lote?.FN_bp}`);
for (const [k, v] of otros) console.log(`  ${k.padEnd(20)} FN-% ${String(v.FN_pct).padStart(4)} · FN-bp ${String(v.FN_bp).padStart(4)}`);
const soloLote = otros.every(([, v]) => v.FN_pct === 0);
console.log(`  ⇒ ${soloLote ? "el hallazgo del % es DEL LOTE y NO se generaliza a todos los `B-`: lleva su dominio escrito" : "el hallazgo NO es solo del lote: aparece tambien en arquetipos ya escritos"}`);
console.log("");
console.log("=== CAMPOS DE RITMO EN EL ESQUEMA (type:number no expresa %) ===");
for (const c of camposRitmo) console.log(`  ${c.grupo.padEnd(14)} ${c.campo.padEnd(12)} type=${c.tipo}`);
console.log(`  consumidores derivados: ${JSON.stringify(consumidores, null, 0)}`);
console.log("");
console.log("=== LA DEFENSA QUE YA EXISTE — `medida()` (la otra direccion) ===");
console.log(`  existe=${medidaExpresa.existe} · subcampos=[${medidaExpresa.subcampos.join(", ")}]`);
console.log(`  expresa el %            : ${medidaExpresa.expresaPct}`);
console.log(`  expresa el punto de rupt: ${medidaExpresa.expresaPuntoDeRuptura}`);
console.log(`  la usan: ${JSON.stringify(conMedida, null, 0)}`);
console.log(`  ⇒ ${medidaExpresa.expresaPct && medidaExpresa.expresaPuntoDeRuptura ? "los DOS modos que rompen el test A YA son expresables donde se use `medida()`.\n    El riesgo se reduce a los campos `number` que NO la usan." : "la primitiva NO cubre los dos modos"}`);
console.log("");
console.log(`VEREDICTO: ${salida.veredicto}`);
process.exit(nulo ? 1 : 0);
