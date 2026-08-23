/* clasifica-f33 — 97.ª tanda, 2026-08-23. ESCALÓN 1: qué SON las cinco.
 *
 * `censo-f33` (96.ª) dijo QUÉ etiquetas y DÓNDE, y cerró declarando lo que no
 * podía decir: *«si son legítimas… eso se mide, no se deduce»*. Esto lo mide.
 *
 * ── Las TRES respuestas, que no son dos ───────────────────────────────────
 *   CONTENIDO  lo escribió quien editó la página → única que puede llegar a ser
 *              una pregunta de whitelist
 *   CASCARÓN   lo pone el tema; lo quita el EXTRACTOR, la whitelist no se toca
 *   CONSULTA   un listado embebido; no se modela como contenido en absoluto
 *
 * ── Cómo se contesta: por la CADENA DE ANCESTROS, no por la etiqueta ──────
 * La etiqueta sola no distingue las tres — un `<article>` puede ser una tarjeta
 * de un bucle o un envoltorio que escribió alguien. Lo que las distingue es
 * **dentro de qué está**, así que §1 recorre el HTML servido de cada campo rico
 * y publica, para CADA ocurrencia, su cadena de ancestros con clases.
 *
 * Y de ahí sale la mitad que el marco «demostrar que son cascarón» nunca
 * encuentra: **una ocurrencia cuya cadena no lleve ningún contenedor generado
 * sale NOMBRADA** (§CORTE LIMPIO 1). El titular de §4 es ese número, y por eso
 * §5 tiene que probar que puede salir distinto de 0.
 *
 * ── El CONTROL, que es lo que hace que «0 fuera» signifique algo ──────────
 * Un recorrido que dijera «dentro» siempre daría exactamente este informe
 * (§sondas 4: *no encontrar nada y no mirar nada dan la misma salida*). §5 corre
 * el mismo recorrido sobre un HTML sintético con UNA dentro y UNA fuera, y
 * **TIRA** si no las separa. Va en línea, en todas las corridas: un negativo por
 * variable de entorno se puede olvidar; éste no.
 *
 * ── Qué NO contesta ───────────────────────────────────────────────────────
 * · No toca `campoHtml` ni propone tocarlo — eso es el escalón 2.
 * · No mide geometría, ni píxeles, ni el clon. **No abre el original**: lee
 *   `corpus/fase-3/` (32/32 páginas con sus hojas) y congeladas del repo.
 * · No dice qué SIRVE lo que resulte ser consulta. Dice que no es contenido.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "../../../..");
const CORPUS = join(RAIZ, "corpus/fase-3");

const L = (s = "") => console.log(s);
const pad = (s, n) => String(s).padEnd(n);

/* ═════════════════════════════════════════════════════════════════════════
 * 0 · EL DOMINIO — derivado con el MISMO criterio que `censo-f33`
 *
 * El censo se LEE de `comunes.ts` y las etiquetas fuera se RECALCULAN. Copiar
 * aquí «las cinco» sería un conjunto enumerado a mano dentro de una derivación
 * (§regla 9 caso 7): el día que el censo cambie, esta lista envejecería contra
 * el repo en silencio y no daría error.
 * ═══════════════════════════════════════════════════════════════════════ */
const src = readFileSync(join(RAIZ, "packages/cms-config/src/campos/comunes.ts"), "utf8");
const bloque = /export const ETIQUETAS_CENSADAS = \[([\s\S]*?)\] as const;/.exec(src);
if (!bloque) throw new Error("no encuentro ETIQUETAS_CENSADAS: el censo no se puede derivar (§sondas 4)");
const CENSO = new Set([...bloque[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
if (CENSO.size < 10) throw new Error(`censo de ${CENSO.size} etiquetas: el regex no casó (§sondas 4, el cero)`);

const EXTRAIDO = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-extraido.json"), "utf8"));
const RUTAS = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const CLAVES = Object.keys(INDICE.paginas);

/** Los campos que pasan por `campoHtml` → `validaHtmlCorpus`. Igual que censo-f33. */
const RICOS = { "texto-pagina": ["html"], toggle: ["cuerpo"], blurb: ["descripcion"] };
const RICOS_ARR = { slider: "diapositivas", "slider-completo": "diapositivas", mapa: "pines" };

/** (pagina, campo, html) de todo lo que valida `campoHtml`. */
const CAMPOS = [];
const rec = (v, pag) => {
  if (Array.isArray(v)) return v.forEach((x) => rec(x, pag));
  if (v && typeof v === "object") {
    if (v.kind) {
      for (const c of RICOS[v.kind] ?? []) if (typeof v[c] === "string") CAMPOS.push({ pag, campo: `${v.kind}.${c}`, html: v[c] });
      const arr = RICOS_ARR[v.kind];
      if (arr && Array.isArray(v[arr]))
        for (const d of v[arr])
          for (const [k, x] of Object.entries(d))
            if (typeof x === "string" && /<[a-z]/i.test(x)) CAMPOS.push({ pag, campo: `${v.kind}.${arr}.${k}`, html: x });
    }
    for (const x of Object.values(v)) rec(x, pag);
  }
};
for (const p of EXTRAIDO.catalogo.paginas) {
  rec(p.bloques ?? [], p.slug);
  if (p.cuerpoClasico) CAMPOS.push({ pag: p.slug, campo: "cuerpoClasico", html: p.cuerpoClasico });
}

/* ═════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO — una pila de ancestros, tolerante con el HTML servido
 *
 * ⚠ NO se reutiliza el tokenizador de `arbol-f33.mjs`: sus `VACIOS` DESCARTAN
 * las etiquetas vacías por diseño, y `<meta>` es una de ellas. Sería §sondas 4
 * quinta cara —el campo que el instrumento no sabe leer— cometido a propósito.
 * Aquí las vacías NO se descartan: se REGISTRAN y no se apilan.
 * ═══════════════════════════════════════════════════════════════════════ */
const VACIOS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RE_TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

/** Devuelve, por cada ocurrencia de una etiqueta objetivo, su cadena de ancestros. */
function ocurrencias(html, objetivos) {
  const out = [];
  const pila = [];
  RE_TAG.lastIndex = 0;
  let m;
  while ((m = RE_TAG.exec(html))) {
    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const atr = m[3] || "";
    if (cierre) {
      for (let k = pila.length - 1; k >= 0; k--)
        if (pila[k].tag === tag) {
          pila.length = k;
          break;
        }
      continue;
    }
    const clase = (/\bclass\s*=\s*"([^"]*)"/.exec(atr) ?? /\bclass\s*=\s*'([^']*)'/.exec(atr) ?? [])[1] ?? "";
    if (objetivos.has(tag)) out.push({ tag, indice: m.index, cadena: pila.map((x) => x.tag + (x.clase ? "." + x.clase.trim().split(/\s+/).join(".") : "")) });
    if (!VACIOS.has(tag) && !/\/\s*$/.test(atr)) pila.push({ tag, clase });
  }
  return out;
}

/* ═════════════════════════════════════════════════════════════════════════
 * LOS CONTENEDORES GENERADOS — declarados aquí, MEDIDOS en §2 y §3
 *
 * Esto es una tabla de hipótesis, no una conclusión: cada marcador se sostiene
 * con la medición que lleva al lado, y la clasificación de §1 sólo dice DENTRO
 * DE CUÁL cae cada ocurrencia. Lo que no caiga en ninguno sale NOMBRADO.
 * ═══════════════════════════════════════════════════════════════════════ */
const CONTENEDORES = [
  { id: "miga", marca: (c) => /^ol\..*kunak-breadcrumbs/.test(c), evidencia: "§2" },
  { id: "bucle-entradas", marca: (c) => /^div\..*et_pb_blog/.test(c) || /^div\..*et_pb_ajax_pagination_container/.test(c), evidencia: "§3a" },
  { id: "listado-cientifico", marca: (c) => /^div\..*scientific-list-content/.test(c), evidencia: "§3b" },
];
const contenedorDe = (cadena) => {
  for (const c of CONTENEDORES) if (cadena.some((x) => c.marca(x))) return c.id;
  return null;
};

/* ═════════════════════════════════════════════════════════════════════════
 * 1 · LAS OCURRENCIAS, UNA A UNA — con su cadena
 * ═══════════════════════════════════════════════════════════════════════ */
const FUERA = new Set();
for (const { html } of CAMPOS) for (const m of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b/g)) if (!CENSO.has(m[1].toLowerCase())) FUERA.add(m[1].toLowerCase());

const hallazgos = [];
for (const { pag, campo, html } of CAMPOS)
  for (const o of ocurrencias(html, FUERA)) hallazgos.push({ pag, campo, ...o, contenedor: contenedorDe(o.cadena) });

L(`═══ clasifica-f33 · qué SON las etiquetas de F3-3 fuera del censo\n`);
L(`  censo leído de comunes.ts                ${CENSO.size} etiquetas`);
L(`  documentos de f33-extraido               ${EXTRAIDO.catalogo.paginas.length}`);
L(`  campos ricos recorridos                  ${CAMPOS.length}`);
L(`  etiquetas fuera del censo                ${[...FUERA].sort().map((t) => `<${t}>`).join(" ")}`);
L(`  OCURRENCIAS (no páginas: la unidad es la ocurrencia)   ${hallazgos.length}\n`);

L(`─── §1 · el reparto POR ETIQUETA — la unidad es la OCURRENCIA ───`);
L(`  ⚠ y no se publica el total: «5 etiquetas en 10 páginas» es un contenedor`);
L(`     que absorbe tres casos distintos (§la causa común).\n`);
L(`  ${pad("etiqueta", 12)}${pad("ocurr.", 8)}${pad("páginas", 9)}contenedor generado → n`);
for (const t of [...FUERA].sort()) {
  const hs = hallazgos.filter((h) => h.tag === t);
  const porCont = {};
  for (const h of hs) porCont[h.contenedor ?? "‼ NINGUNO"] = (porCont[h.contenedor ?? "‼ NINGUNO"] ?? 0) + 1;
  const pags = new Set(hs.map((h) => h.pag));
  L(`  ${pad("<" + t + ">", 12)}${pad(hs.length, 8)}${pad(pags.size, 9)}${Object.entries(porCont).map(([k, v]) => `${k} → ${v}`).join(" · ")}`);
}

L(`\n  y POR PÁGINA, que es la otra unidad que el total absorbe:`);
L(`  ${pad("página", 28)}${pad("etiqueta", 11)}${pad("n", 4)}contenedor`);
const clave = (h) => `${h.pag} ${h.tag} ${h.contenedor ?? "‼ NINGUNO"}`;
const agr = {};
for (const h of hallazgos) (agr[clave(h)] ??= []).push(h);
for (const k of Object.keys(agr).sort()) {
  const [pag, tag, cont] = k.split(" ");
  L(`  ${pad(pag.slice(0, 27), 28)}${pad("<" + tag + ">", 11)}${pad(agr[k].length, 4)}${cont}`);
}

L(`\n  las CADENAS distintas observadas (una por combinación etiqueta·contenedor):`);
const vistas = new Set();
for (const h of hallazgos) {
  const k = `${h.tag} ${h.contenedor}`;
  if (vistas.has(k)) continue;
  vistas.add(k);
  L(`     <${h.tag}>  ${h.cadena.slice(-4).join(" ▸ ") || "(raíz del campo)"}`);
}

/* ═════════════════════════════════════════════════════════════════════════
 * 2 · EL CONTENEDOR «miga» — ¿lo escribió una persona o lo GENERA algo?
 *
 * El discriminador NO es que el marcado parezca de plantilla: es la CAPA.
 * Por la regla de regímenes, en la capa `_tb_` **no existe la persona que editó
 * la instancia** — una plantilla de theme builder rinde N páginas a la vez. Si
 * la MISMA miga aparece ahí con la jerarquía CORRECTA DE CADA PÁGINA, entonces
 * el marcado lo produce un generador, no un editor. Y si el generador existe,
 * también produce las de la capa propia: son el mismo marcado.
 * ═══════════════════════════════════════════════════════════════════════ */
const sinCss = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
const ficheroDe = (ruta) => {
  const k = CLAVES.find((x) => x.endsWith(`:${ruta}`));
  if (!k) return null;
  const f = join(CORPUS, INDICE.paginas[k].fichero);
  return existsSync(f) ? f : null;
};

const migas = [];
for (const r of RUTAS) {
  const f = ficheroDe(r.ruta);
  if (!f) {
    migas.push({ slug: r.slug, ruta: r.ruta, estado: "SIN FICHERO" });
    continue;
  }
  const h = sinCss(readFileSync(f, "utf8"));
  const i = h.indexOf('class="kunak-breadcrumbs"');
  if (i < 0) {
    migas.push({ slug: r.slug, ruta: r.ruta, estado: "sin miga" });
    continue;
  }
  const abre = h.lastIndexOf("<ol", i);
  const cierra = h.indexOf("</ol>", i);
  const ol = h.slice(abre, cierra + 5);
  /* el módulo Divi que la contiene: `et_pb_text_<n>` propio, `…_tb_<capa>` del theme builder */
  const antes = h.slice(Math.max(0, abre - 1200), abre);
  const mod = [...antes.matchAll(/\bet_pb_text_(\d+(?:_tb_[a-z]+)?)/g)].pop()?.[0] ?? "??";
  const capa = /_tb_/.test(mod) ? "theme-builder" : "propia";
  const items = [...ol.matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map((m) => ({
    clase: (/\bclass="([^"]*)"/.exec(m[1]) ?? [])[1] ?? "",
    label: (/itemprop="name">([^<]*)</.exec(m[2]) ?? [])[1] ?? null,
    href: (/href="([^"]*)"/.exec(m[2]) ?? [])[1] ?? null,
    pos: (/content="(\d+)"/.exec(m[2]) ?? [])[1] ?? null,
  }));
  /* esqueleto de cada <li>: sin texto, sin href, sin posición. Lo que queda es la FORMA. */
  const formas = [...ol.matchAll(/<li[\s\S]*?<\/li>/g)].map((m) =>
    m[0].replace(/>[^<]*</g, "><").replace(/href="[^"]*"/g, 'href=""').replace(/content="[^"]*"/g, 'content=""'),
  );
  migas.push({ slug: r.slug, ruta: r.ruta, estado: "con miga", mod, capa, items, formas, ol });
}

const conMiga = migas.filter((m) => m.estado === "con miga");
const propias = conMiga.filter((m) => m.capa === "propia");
const tb = conMiga.filter((m) => m.capa === "theme-builder");

L(`\n─── §2 · el contenedor «miga»: ¿escrita o GENERADA? ───\n`);
L(`  páginas de F3-3                          ${RUTAS.length}`);
L(`  con \`kunak-breadcrumbs\` en el MARCADO     ${conMiga.length}`);
L(`     · en la capa PROPIA (et_pb_text_N)     ${propias.length}   ← las que llegan al campo rico`);
L(`     · en la capa THEME BUILDER (_tb_)      ${tb.length}   ← las que el extractor ya NO recoge`);
L(`  sin miga                                 ${migas.filter((m) => m.estado === "sin miga").length}`);
L(`  sin fichero                              ${migas.filter((m) => m.estado === "SIN FICHERO").length}`);
L(``);
L(`  ⚠ El censo de la 96.ª dijo «<meta> en 10 páginas». Cierto — y el contenedor`);
L(`     está en ${conMiga.length}. Las ${tb.length} de \`_tb_\` no salían porque el extractor lee`);
L(`     SECCIONES PROPIAS: ya las trata como cascarón, sin que nadie lo escribiera.`);

/* las FORMAS de <li>: si el generador es uno, el conjunto de formas es pequeño y CERRADO */
const formasTodas = new Map();
for (const m of conMiga) for (const f of m.formas) formasTodas.set(f, (formasTodas.get(f) ?? 0) + 1);
const formasPropia = new Set(propias.flatMap((m) => m.formas));
const formasTb = new Set(tb.flatMap((m) => m.formas));
const soloPropia = [...formasPropia].filter((f) => !formasTb.has(f));
const soloTb = [...formasTb].filter((f) => !formasPropia.has(f));

L(`\n  las FORMAS de <li> (marcado sin texto, sin href, sin posición):`);
L(`     formas distintas en las ${conMiga.length}                ${formasTodas.size}`);
L(`     <li> totales                             ${[...formasTodas.values()].reduce((a, b) => a + b, 0)}`);
L(`     diferencia simétrica propia ↔ theme-builder:  ${soloPropia.length} sólo propia · ${soloTb.length} sólo _tb_`);
for (const [f, n] of [...formasTodas].sort((a, b) => b[1] - a[1]))
  L(`       ×${pad(n, 4)} ${f.length > 150 ? f.slice(0, 150) + "…" : f}`);

/* derivabilidad: ¿los eslabones con href son ancestros de la propia URL? ¿y el último es la página? */
let eslabones = 0;
let ancestros = 0;
let ultimoSinHref = 0;
const noDerivables = [];
for (const m of conMiga) {
  for (const [k, it] of m.items.entries()) {
    eslabones++;
    const esUltimo = k === m.items.length - 1;
    if (esUltimo) {
      if (!it.href) ultimoSinHref++;
      else noDerivables.push(`${m.slug}: el ÚLTIMO eslabón lleva href ${it.href}`);
      continue;
    }
    const p = it.href ? new URL(it.href).pathname : null;
    if (p && m.ruta.startsWith(p)) ancestros++;
    else noDerivables.push(`${m.slug}: eslabón ${k + 1} (${JSON.stringify(it.label)}) href=${it.href} NO es prefijo de ${m.ruta}`);
  }
}
L(`\n  ¿el contenido de la miga se DERIVA de la posición de la página?`);
L(`     eslabones totales                        ${eslabones}`);
L(`     intermedios cuyo href ES prefijo de la ruta   ${ancestros} de ${eslabones - conMiga.length}`);
L(`     últimos SIN href (= la página actual)     ${ultimoSinHref} de ${conMiga.length}`);
if (noDerivables.length) {
  L(`     ‼ NO derivables por la URL (${noDerivables.length}):`);
  for (const x of noDerivables) L(`        ${x}`);
} else L(`     ‼ NO derivables por la URL               0`);

/* ⚠ 30 de 40 es un TOTAL, y mezcla las dos capas: §la causa común aplicada al
 * denominador. El número que decide la whitelist es el de la capa PROPIA — las
 * `_tb_` ni siquiera llegan al campo rico. Se publica el reparto, no la suma. */
const porCapa = { propia: { n: 0, ok: 0 }, "theme-builder": { n: 0, ok: 0 } };
for (const m of conMiga)
  for (const [k, it] of m.items.entries()) {
    if (k === m.items.length - 1 || !it.href) continue;
    porCapa[m.capa].n++;
    if (m.ruta.startsWith(new URL(it.href).pathname)) porCapa[m.capa].ok++;
  }
L(`\n     y el reparto POR CAPA, que es lo que el 30/40 absorbe:`);
for (const [c, v] of Object.entries(porCapa)) L(`       ${pad(c, 16)}${v.ok} de ${v.n} intermedios son prefijo de su ruta`);
L(`       → los ${porCapa["theme-builder"].n - porCapa["theme-builder"].ok} que fallan son TODOS de \`_tb_\`, y no fallan por azar: son`);
L(`         las páginas del centro de ayuda, que el original sirve en DOS familias`);
L(`         de URL a la vez. La miga sigue el PADRE de WordPress, no la URL pedida —`);
L(`         que es justo lo que un generador hace y lo que una persona escribiendo`);
L(`         el HTML de la página en la que está NO haría.`);

/* la guarda del escalón 2: ¿el módulo contiene SÓLO la miga? */
L(`\n  la GUARDA de la retirada: ¿el campo rico contiene SÓLO la miga?`);
let soloMiga = 0;
const conResto = [];
for (const c of CAMPOS) {
  if (!/kunak-breadcrumbs/.test(c.html)) continue;
  const resto = c.html.replace(/<ol class="kunak-breadcrumbs"[\s\S]*?<\/ol>/g, "").replace(/\s|&nbsp;/g, "");
  if (resto === "") soloMiga++;
  else conResto.push(`${c.pag} · ${c.campo} · quedan ${resto.length} chars: ${resto.slice(0, 120)}`);
}
L(`     campos ricos con miga                    ${soloMiga + conResto.length}`);
L(`     que NO contienen NADA MÁS                ${soloMiga}`);
if (conResto.length) for (const x of conResto) L(`     ‼ ${x}`);
L(`\n  y su POSICIÓN, que también es derivable:`);
const mods = [...new Set(propias.map((m) => m.mod))];
L(`     módulo Divi que la contiene en las ${propias.length} propias:  ${mods.join(" · ")}`);

/* y el cruce entre páginas: la etiqueta que una hija usa para su padre, ¿es la que el padre usa para sí? */
const porRuta = new Map(conMiga.map((m) => [m.ruta, m]));
let cruces = 0;
let crucesOk = 0;
const crucesMal = [];
for (const m of conMiga)
  for (const [k, it] of m.items.entries()) {
    if (k === m.items.length - 1 || !it.href) continue;
    const p = new URL(it.href).pathname;
    const padre = porRuta.get(p);
    if (!padre) continue;
    cruces++;
    const suyo = padre.items[padre.items.length - 1]?.label;
    if (suyo === it.label) crucesOk++;
    else crucesMal.push(`${m.slug} llama al padre ${JSON.stringify(it.label)}; el padre se llama ${JSON.stringify(suyo)}`);
  }
L(`\n  cruce ENTRE páginas (la etiqueta del padre según la hija vs. según el padre):`);
L(`     pares comprobables                       ${cruces}`);
L(`     coinciden                                ${crucesOk}`);
for (const x of crucesMal) L(`     ‼ ${x}`);

/* ═════════════════════════════════════════════════════════════════════════
 * 3 · LOS DOS LISTADOS — ¿consulta?
 *
 * La prueba no es que «parezca un listado»: es que sus elementos sean LOS
 * MISMOS que ya viven en otra colección. Y se compara NOMBRANDO cada uno
 * (diferencia simétrica), nunca por cardinal — `23 → 23` es exacto y los dos
 * conjuntos de 23 pueden diferir en 2 por lado sin mover un dígito.
 * ═══════════════════════════════════════════════════════════════════════ */
const slugsDe = (dir) => new Set(readdirSync(join(RAIZ, dir)).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));
const simetrica = (a, b) => ({ soloA: [...a].filter((x) => !b.has(x)), soloB: [...b].filter((x) => !a.has(x)) });

L(`\n─── §3 · los dos listados: ¿CONSULTA? ───`);

/* 3a · el bucle de entradas de /es/recursos/ */
const hRec = CAMPOS.filter((c) => c.pag === "recursos").map((c) => c.html).join("");
const tarjetasBlog = [...hRec.matchAll(/<article[^>]*\bid="post-(\d+)"[\s\S]*?<a href="https:\/\/kunakair\.com\/es\/([^/"]+)\//g)].map((m) => ({ id: m[1], slug: m[2] }));
const blogCorpus = slugsDe("corpus/entradas-blog");
const dBlog = simetrica(new Set(tarjetasBlog.map((t) => t.slug)), new Set());
L(`\n  3a · /es/recursos/ — el módulo \`et_pb_blog…bucle-entradas\``);
L(`       tarjetas <article id="post-N">        ${tarjetasBlog.length}`);
L(`       corpus \`entradas-blog\`                ${blogCorpus.size} documentos`);
for (const t of tarjetasBlog) L(`         post-${pad(t.id, 8)} ${pad(t.slug, 46)} ${blogCorpus.has(t.slug) ? "✓ en entradas-blog" : "‼ NO está en entradas-blog"}`);
const blogFuera = tarjetasBlog.filter((t) => !blogCorpus.has(t.slug));
L(`       tarjetas que NO son entradas del corpus   ${blogFuera.length} de ${tarjetasBlog.length}`);
void dBlog;

/* 3b · el listado científico de /es/recursos/documentos-cientificos/ */
const hSci = CAMPOS.filter((c) => c.pag === "documentos-cientificos").map((c) => c.html).join("");
const tarjetasSci = [...hSci.matchAll(/<article[^>]*\bid="post-(\d+)"([\s\S]*?)(?=<article[^>]*\bid="post-|$)/g)].map((m) => ({
  id: m[1],
  slug: (/href="https:\/\/kunakair\.com\/es\/recursos\/[^"]*?\/([^/"]+)\/"/.exec(m[2]) ?? [])[1] ?? null,
}));
const sciCorpus = slugsDe("corpus/documentos-cientificos");
const sciSlugs = new Set(tarjetasSci.map((t) => t.slug).filter(Boolean));
const d = simetrica(sciSlugs, sciCorpus);
L(`\n  3b · /es/recursos/documentos-cientificos/ — \`div.scientific-list-content\``);
L(`       tarjetas <article id="post-N">        ${tarjetasSci.length}`);
L(`       con slug de /es/recursos/…/           ${sciSlugs.size}`);
L(`       corpus \`documentos-cientificos\`       ${sciCorpus.size} documentos`);
L(`       DIFERENCIA SIMÉTRICA (§el cardinal absorbe la membresía):`);
L(`         en el listado y NO en el corpus      ${d.soloA.length}${d.soloA.length ? " → " + d.soloA.join(", ") : ""}`);
L(`         en el corpus y NO en el listado      ${d.soloB.length}${d.soloB.length ? " → " + d.soloB.join(", ") : ""}`);
const sinSlug = tarjetasSci.filter((t) => !t.slug);
if (sinSlug.length) L(`       ‼ tarjetas sin slug legible: ${sinSlug.length} → ${sinSlug.map((t) => "post-" + t.id).join(", ")}`);

/* 3c · la GUARDA de la retirada: ¿los campos de consulta contienen SÓLO el listado? */
L(`\n  3c · la GUARDA: ¿el campo rico contiene SÓLO el listado?`);
const MARCAS = [
  { id: "bucle-entradas", re: /<div class="et_pb_module et_pb_blog[\s\S]*<\/div>\s*$/ },
  { id: "listado-cientifico", re: /<div class="scientific-list-content">[\s\S]*<\/div>\s*$/ },
];
for (const { id, re } of MARCAS) {
  const cs = CAMPOS.filter((c) => (id === "bucle-entradas" ? /et_pb_blog/.test(c.html) : /scientific-list-content/.test(c.html)));
  for (const c of cs) {
    const resto = c.html.replace(re, "").replace(/\s|&nbsp;/g, "");
    L(`     ${pad(id, 20)}${pad(c.pag, 26)}${c.campo}`);
    L(`       campo ${c.html.length} chars · fuera del listado: ${resto.length}${resto.length ? " → " + JSON.stringify(resto.slice(0, 160)) : "  ✓ SÓLO el listado"}`);
  }
}

/* ═════════════════════════════════════════════════════════════════════════
 * 3d · QUÉ MÁS BLOQUEA — el veredicto REAL de `validaHtmlCorpus`, no el mío
 *
 * `censo-f33` midió ETIQUETAS. El validador mira cuatro cosas —script, etiqueta,
 * host de iframe y ATRIBUTO— y sólo devuelve la primera que falla. Retirar las
 * etiquetas puede destapar un atributo que estaba detrás. Así que la pregunta
 * «¿se completa la siembra?» se le hace A LA FUNCIÓN, no a mi lectura de ella
 * (§El principio: verificar contra la salida servida).
 * ═══════════════════════════════════════════════════════════════════════ */
const { createRequire } = await import("node:module");
const { pathToFileURL } = await import("node:url");
const { mkdirSync } = await import("node:fs");
const req = createRequire(import.meta.url);
const esbuild = req("esbuild");
const TMP = join(RAIZ, "scripts/qa/.tmp");
mkdirSync(TMP, { recursive: true });
const bundle = join(TMP, "comunes-clasifica-f33.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/campos/comunes.ts")],
  outfile: bundle, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const CM = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

const familia = (msg) => (/§3\.3 · T4/.test(msg) ? "script" : /§3\.1:/.test(msg) ? "etiqueta" : /§3\.3b/.test(msg) ? "host" : /§3\.1-atributos/.test(msg) ? "atributo" : "?");
const veredictos = CAMPOS.map((c) => ({ ...c, r: CM.validaHtmlCorpus(c.html) })).filter((c) => c.r !== true);
L(`\n  3d · el veredicto REAL de \`validaHtmlCorpus\` — los cuatro ejes, no sólo etiquetas`);
L(`       campos ricos                          ${CAMPOS.length}`);
L(`       que RECHAZA hoy                       ${veredictos.length}`);
const porFam = {};
for (const v of veredictos) porFam[familia(v.r)] = (porFam[familia(v.r)] ?? 0) + 1;
L(`       por familia                           ${Object.entries(porFam).map(([k, n]) => `${k} → ${n}`).join(" · ") || "(ninguna)"}`);
for (const v of veredictos) L(`         ${pad(v.pag.slice(0, 26), 27)}${pad(v.campo, 20)}${familia(v.r)}: ${v.r.slice(0, 110)}`);

/* y el DESPUÉS simulado: los mismos campos con los contenedores generados fuera */
const sinContenedores = (h) =>
  h
    .replace(/<ol class="kunak-breadcrumbs"[\s\S]*?<\/ol>/g, "")
    .replace(/<div class="et_pb_module et_pb_blog[\s\S]*<\/div>\s*$/, "")
    .replace(/<div class="scientific-list-content">[\s\S]*<\/div>\s*$/, "");
const despues = CAMPOS.map((c) => ({ ...c, r: CM.validaHtmlCorpus(sinContenedores(c.html)) })).filter((c) => c.r !== true);
L(`\n       DESPUÉS (simulado: los 3 contenedores retirados)`);
L(`       campos que seguirían rechazados       ${despues.length}`);
for (const v of despues) L(`         ‼ ${pad(v.pag.slice(0, 26), 27)}${pad(v.campo, 20)}${familia(v.r)}: ${v.r.slice(0, 140)}`);
L(`\n       ⚠ Esto es la SIMULACIÓN, no el efecto (§CUANDO EL CAMBIO SE PUEDA`);
L(`          APLICAR, APLÍCALO Y MIDE). El efecto lo dice re-correr el extractor`);
L(`          y volver a pasar esta misma comprobación: tiene que dar 0.`);

/* ═════════════════════════════════════════════════════════════════════════
 * 4 · LA DIRECCIÓN CONTRARIA — ¿cuál de las cinco la escribió una persona?
 *
 * El marco «demostrar que son cascarón» encuentra cascarón. Esta es la otra
 * pregunta, y se contesta con el MISMO barrido: toda ocurrencia cuya cadena no
 * lleve ningún contenedor generado es candidata a CONTENIDO y sale nombrada.
 * ═══════════════════════════════════════════════════════════════════════ */
const huerfanas = hallazgos.filter((h) => !h.contenedor);
L(`\n─── §4 · la dirección contraria: ¿alguna es CONTENIDO? ───\n`);
L(`  ocurrencias FUERA de todo contenedor generado   ${huerfanas.length} de ${hallazgos.length}`);
for (const h of huerfanas) L(`     ‼ ${h.pag} · ${h.campo} · <${h.tag}> · cadena: ${h.cadena.join(" ▸ ") || "(raíz)"}`);
if (!huerfanas.length) L(`     → ninguna. Las ${hallazgos.length} ocurrencias caen dentro de uno de los ${CONTENEDORES.length} contenedores.`);

/* ═════════════════════════════════════════════════════════════════════════
 * 5 · EL CONTROL — sin esto, «0 fuera» es un cero por construcción
 *
 * Un recorrido que dijera «dentro» siempre daría el mismo §4. Se le da un HTML
 * sintético con UNA dentro y UNA fuera y se exige que las separe. Va en línea:
 * un negativo por variable de entorno se puede olvidar; éste no.
 * ═══════════════════════════════════════════════════════════════════════ */
const SINTETICO =
  '<div class="et_pb_text_inner">' +
  '<ol class="kunak-breadcrumbs"><li><span>x</span><meta itemprop="position" content="1"></li></ol>' +
  '<p>texto</p><meta name="suelta" content="ESTA LA ESCRIBIÓ ALGUIEN">' +
  "</div>";
const ctrl = ocurrencias(SINTETICO, new Set(["meta"])).map((o) => ({ ...o, contenedor: contenedorDe(o.cadena) }));
const dentro = ctrl.filter((c) => c.contenedor === "miga").length;
const fuera = ctrl.filter((c) => !c.contenedor).length;
L(`\n─── §5 · control en línea del recorrido ───\n`);
L(`  sintético: 1 <meta> dentro de la miga + 1 <meta> suelto`);
L(`     ocurrencias vistas                       ${ctrl.length}   (esperado 2)`);
L(`     clasificadas «miga»                      ${dentro}   (esperado 1)`);
L(`     clasificadas FUERA                       ${fuera}   (esperado 1)`);
if (ctrl.length !== 2 || dentro !== 1 || fuera !== 1)
  throw new Error(`CONTROL ROTO: ${ctrl.length}/${dentro}/${fuera} ≠ 2/1/1. El recorrido no separa dentro de fuera, así que el «${huerfanas.length}» de §4 no significa nada (§sondas 4).`);
L(`     → el recorrido SABE decir «fuera». El ${huerfanas.length} de §4 es un dato, no un cero por construcción.`);

/* ═════════════════════════════════════════════════════════════════════════
 * 6 · EL REPARTO
 * ═══════════════════════════════════════════════════════════════════════ */
L(`\n═══ EL REPARTO ═══\n`);
const veredicto = { miga: "CASCARÓN", "bucle-entradas": "CONSULTA", "listado-cientifico": "CONSULTA" };
L(`  ${pad("etiqueta", 12)}${pad("ocurr.", 8)}${pad("contenedor", 22)}${pad("veredicto", 12)}evidencia`);
for (const t of [...FUERA].sort()) {
  const hs = hallazgos.filter((h) => h.tag === t);
  const conts = [...new Set(hs.map((h) => h.contenedor ?? "‼ NINGUNO"))];
  for (const c of conts) {
    const n = hs.filter((h) => (h.contenedor ?? "‼ NINGUNO") === c).length;
    const ev = CONTENEDORES.find((x) => x.id === c)?.evidencia ?? "—";
    L(`  ${pad("<" + t + ">", 12)}${pad(n, 8)}${pad(c, 22)}${pad(veredicto[c] ?? "SIN CLASIFICAR", 12)}${ev}`);
  }
}
L(`\n  CONTENIDO: ${huerfanas.length} ocurrencias de las ${hallazgos.length}.`);
L(`\n  ⚠⚠ Y LO QUE ESTE REPARTO NO BASTA PARA CONCLUIR — está en §3d:`);
L(`     «0 de contenido» es cierto de las ETIQUETAS, y la siembra NO se desbloquea`);
L(`     con eso. \`validaHtmlCorpus\` mira CUATRO ejes y devuelve el PRIMERO que`);
L(`     falla, así que retirar los contenedores destapa lo que estaba detrás:`);
L(`     quedan ${despues.length} campo(s) rechazados, por ATRIBUTO, no por etiqueta.`);
L(`     Preguntar «¿qué etiquetas sobran?» no puede ver un atributo — §El principio:`);
L(`     el veredicto lo da la función sobre la salida servida, no la lectura de ella.`);
