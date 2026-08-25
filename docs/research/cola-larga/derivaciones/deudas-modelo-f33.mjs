/* deudas-modelo-f33 — 108.ª tanda, 2026-08-25. ESCALÓN 1.
 *
 * ── Por qué UNA mesa y no cuatro fichas ───────────────────────────────────
 * F3-3 deja cuatro cosas fichadas por separado y todas tienen la misma forma:
 * **algo medido que el esquema no sabe expresar**. Traídas de una en una son
 * cuatro decisiones de propietario; traídas juntas puede que sean menos — y la
 * pregunta que lo decide es **¿comparten MECANISMO?**, no ¿se parecen?
 *
 * ── Qué CONTESTA ─────────────────────────────────────────────────────────
 *   · el CARDINAL de cada una, derivado y no citado de la ficha (§regla 9);
 *   · su SEPARADORA — qué instancia distingue modelarla de no modelarla;
 *   · si toca una colección ya verificada;
 *   · y **el denominador del MECANISMO**, que es lo que ninguna ficha tiene:
 *     si dos deudas son la misma clase de cosa, decidirlas una a una es
 *     arreglar la instancia en vez de la CLASE.
 *
 * ── Qué NO contesta ──────────────────────────────────────────────────────
 * NO decide ninguna. Un bloque nuevo o un campo nuevo es una migración y es
 * decisión del propietario. Esto es la MESA, no el acta.
 *
 * NO mide geometría: no abre Chrome. Todo sale del HTML capturado (markup, sin
 * `<style>` ni `<script>` — §sondas 4, *el CSS de Divi nombra sus propias
 * clases*) y de congeladas ya commiteadas.
 *
 * ⚠ Las congeladas se resuelven por **mtime** descartando §regla 7, y se dice
 * en voz alta cuál se resolvió. `f33-geo.json` canónico **no existe** —está
 * liberado a propósito— así que su lectura se toma de la renombrada CADUCADA
 * y **se marca como tal en la salida**: es una cita de archivo, no una medida
 * vigente.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus");
const F3 = join(CORPUS, "fase-3");
const MED = join(RAIZ, "scripts/qa/medidas");

const P = (...a) => console.log(...a);
const ARTEFACTO = /-neg-|-neg\.|SABOTAJE|SONDA-|CADUCADA|CONTAMINADA|CORRIDA-SUELTA/;

function porMtime(re, { permiteArtefacto = false } = {}) {
  const l = readdirSync(MED)
    .filter((f) => re.test(f) && (permiteArtefacto || !ARTEFACTO.test(f)))
    .map((f) => ({ f, m: statSync(join(MED, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return l[0]?.f ?? null;
}

const { parsea, recorre, limpia, tipoDe, esEstructura, esPropia } = await import("./arbol-f33.mjs");

/* ══════════════════════════════════════════════════════════════════════════
 * 0 · EL DOMINIO — derivado de la MISMA fuente que `f33-clases`
 * ═════════════════════════════════════════════════════════════════════════ */
const LD = JSON.parse(readFileSync(join(F3, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const F33 = JSON.parse(readFileSync(join(MED, "f33-rutas.json"), "utf8")).paginas;
const porRuta = new Map(LD.filter((e) => e.fichero).map((e) => [e.ruta, e]));

const cargadas = new Map(); // ruta → {bucket, html limpio, rutaClon}
const sinCaptura = [];
for (const r of F33) {
  const e = porRuta.get(r.ruta);
  if (!e || !existsSync(join(F3, e.fichero))) { sinCaptura.push(r.ruta); continue; }
  cargadas.set(r.ruta, { bucket: e.bucket, rutaClon: r.rutaClon, html: limpia(readFileSync(join(F3, e.fichero), "utf8")) });
}
if (sinCaptura.length) {
  P(`⛔ ${sinCaptura.length} de ${F33.length} rutas de F3-3 SIN CAPTURA: ${sinCaptura.join(" · ")}`);
  process.exitCode = 1;
}

/* Los `articulos-kb`, que son OTRA colección y hacen falta para `gallery`. */
const KB = LD.filter((e) => e.bucket === "articulos-kb" && e.fichero && existsSync(join(F3, e.fichero)));

P("═══ 0 · DOMINIO");
P(`  F3-3 (colección \`paginas\`) ........ ${cargadas.size} de ${F33.length} rutas · sin captura ${sinCaptura.length}`);
P(`  articulos-kb (otra colección) ..... ${KB.length} rutas`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · DEUDA `gallery` — ¿cuántas, dónde, y en qué colección?
 * ═════════════════════════════════════════════════════════════════════════ */
function anda(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

/* ⚠⚠ SON DOS CONJUNTOS Y SE ESCRIBEN LOS DOS — es el PASO 0 otra vez.
 *
 *   `KIND_DE_DIVI`  = lo que **la sonda `f33-cmp` sabe traducir**. Vive en el
 *                     instrumento y sólo cubre la colección `paginas`.
 *   los `slug` de   = lo que **el ESQUEMA expresa**, colección a colección.
 *   `bloques/*.ts`
 *
 * La ficha de la 106.ª concluyó *«el esquema no lo expresa por ningún canal»*
 * leyendo el PRIMERO. Son cosas distintas: `gallery` no está en `KIND_DE_DIVI`
 * **y sí está en `bloques/kb.ts`**. Es §*verificar contra la salida servida,
 * nunca contra la fuente que uno supone responsable*, con la fuente equivocada
 * puesta en la tabla de un comparador.
 *
 * §regla 9 caso 7: los dos conjuntos se LEEN de sus fuentes, no se copian. */
const srcCmp = readFileSync(join(RAIZ, "scripts/qa/f33-cmp.mjs"), "utf8");
const blq = /const KIND_DE_DIVI = \{([\s\S]*?)\};/.exec(srcCmp);
if (!blq) throw new Error("no se pudo leer KIND_DE_DIVI de f33-cmp.mjs — §sondas 4: un patrón que no casa no es un cero");
const KINDS = new Set([...blq[1].matchAll(/(\w+):\s*"/g)].map((m) => m[1]));

const DIR_BLOQUES = join(RAIZ, "packages/cms-config/src/bloques");
const SLUGS = {};
for (const f of readdirSync(DIR_BLOQUES).filter((x) => x.endsWith(".ts"))) {
  const src = readFileSync(join(DIR_BLOQUES, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  SLUGS[f.replace(/\.ts$/, "")] = [...src.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
}
if (!Object.values(SLUGS).some((v) => v.length)) throw new Error("cero slugs leídos de bloques/*.ts — §sondas 4");

/* ⚠ LA DEUDA NO ES «`gallery`»: ES «TIPOS DE MÓDULO FUERA DEL MODELO», y
 * `gallery` es UNO. El otro —`dvmd_table_maker`— es de TERCEROS, o sea que su
 * clase no empieza por `et_pb_`, así que `tipoDe` **no puede verlo** y los
 * censos de 313 módulos lo cuentan como si no existiera. Censarlo por el
 * prefijo de Divi sería §*un campo ausente en el 100 % de su tipo es el
 * instrumento*. Se buscan los DOS por su marcado. */
/* ⚠ EL CONTADOR DE ITEMS SE CUENTA POR ORDINAL, NO POR SUBCADENA. `et_pb_gallery_items`
 * —el CONTENEDOR, en plural— contiene `et_pb_gallery_item`, y cada `<div>` de item lleva
 * la clase desnuda MÁS su ordinal: 6 items dan **13** ocurrencias del literal. La ficha
 * publica **11**; el crudo da **13**; los ordinales distintos dan **6**. Es §*un cardinal
 * es un contenedor* con el contenedor puesto en un `match()`. */
const TIPOS_FUERA = {
  gallery: { mod: /et_pb_gallery_\d/g, item: /et_pb_gallery_item_\d+_\d+/g },
  dvmd_table_maker: { mod: /dvmd_table_maker_\d/g, item: null },
};

/* ¿qué rutas EMITE el build? — se deriva del manifiesto, no se recuerda. */
const MANI = join(RAIZ, "apps/web/.next/prerender-manifest.json");
const emitidas = existsSync(MANI) ? new Set(Object.keys(JSON.parse(readFileSync(MANI, "utf8")).routes ?? {})) : null;
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8")).paginas;
const urlDeFichero = new Map(Object.values(INDICE).map((e) => [e.fichero, e.url]));
for (const e of LD) if (e.fichero) urlDeFichero.set(`fase-3/${e.fichero}`, `https://kunakair.com${e.ruta}`);
const aClon = (u) => { const s = (u || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/es(?=\/|$)/, "").replace(/\/+$/, ""); return s === "" ? "/" : s; };

const todosHtml = anda(CORPUS);
const fuera = {};
for (const f of todosHtml) {
  const rel = relative(CORPUS, f).split("\\").join("/");
  const h = limpia(readFileSync(f, "utf8"));
  for (const [tipo, re] of Object.entries(TIPOS_FUERA)) {
    const mods = (h.match(re.mod) || []).length;
    if (!mods) continue;
    const items = re.item ? new Set(h.match(re.item) || []).size : null;
    const ruta = aClon(urlDeFichero.get(rel));
    /* ⚠ EL TESTIGO SE SACA DEL SUBÁRBOL DEL MÓDULO, NO DE «20 000 CHARS DESDE
     * AQUÍ». La primera versión buscaba hacia delante y en `/monitor-calidad-aire`
     * le tocó `co_mexico.webp` — que es de la GALERÍA, no de la tabla. Un testigo
     * de otro módulo contesta que sí a una pregunta que nadie hizo. */
    const nodo = [...recorre(parsea(h))].find((n) => n.clases.some((c) => re.mod.test(c) || new RegExp(`^${tipo}$`).test(c)));
    const dentro = nodo ? h.slice(nodo.ini, nodo.fin) : "";
    /* ⚠ EL TESTIGO NO ES UN TROZO: SON LAS CELDAS, Y SE PUBLICA LA FRACCIÓN.
     * Un solo trozo «el más largo» acaba siendo la tabla entera concatenada, que
     * por supuesto no aparece literal en ningún fuente — un NO que no significa
     * nada. Se extraen los NODOS DE TEXTO del módulo y se cuenta cuántos cita el
     * fuente: §*se compara en la unidad que se afirma*. */
    const celdas = [...new Set(
      [...dentro.matchAll(/>([^<>]{8,})</g)]
        .map((m) => m[1].replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ").trim())
        .filter((s) => s.length >= 8 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(s) && !/_|dvmd|et_pb/.test(s)),
    )];
    const imagen = /\/wp-content\/uploads\/[^"' ]*?\/([\w-]+\.(?:webp|jpe?g|png))/.exec(dentro)?.[1] ?? null;
    const testigo = imagen ? { tipo: "imagen", vals: [imagen] } : { tipo: "celdas", vals: celdas };
    (fuera[tipo] ??= []).push({ rel, mods, items, ruta, testigo, emite: emitidas ? emitidas.has(ruta) : null });
  }
}

/* ¿el clon sirve el CONTENIDO? Se pregunta al fuente por el TESTIGO, y para las
 * rutas de F3-3 además al comparador de dos lados, que es el que manda. */
const srcTodo = ["apps/web/src", "packages/cms-config/src"].map((d) => {
  const out = [];
  (function rec(x) { for (const e of readdirSync(x, { withFileTypes: true })) { const p = join(x, e.name); if (e.isDirectory()) rec(p); else if (/\.(tsx?|css|json)$/.test(e.name)) out.push(readFileSync(p, "utf8")); } })(join(RAIZ, d));
  return out.join("\n");
}).join("\n");
const fCmp = porMtime(/^f33-cmp-1440(-\d{4}-\d{2}-\d{2}(-\d+)?)?\.json$/);
const cmp = fCmp ? JSON.parse(readFileSync(join(MED, fCmp), "utf8")).paginas : {};
const porRutaClon = new Map(Object.entries(cmp).map(([u, v]) => [aClon(u), v]));

/* El lado de `articulos-kb`, que es OTRO comparador de dos lados. */
const fKb = porMtime(/^kb-cmp-1440.*.json$/);
const kb = fKb ? JSON.parse(readFileSync(join(MED, fKb), "utf8")) : null;
const kbPorRuta = new Map(Object.entries(kb?.rutas ?? {}).map(([u, v]) => [aClon(u), v]));

P("═══ 1 · DEUDA de TIPO — módulos que el modelo no puede expresar");
P(`  html del corpus barridos ....... ${todosHtml.length}`);
P(`  ¿existe el manifiesto? ......... ${emitidas ? `sí · ${emitidas.size} rutas` : "NO — la columna «¿emite?» sale nula, no falsa (§regla 6)"}`);
P("");
P("  ⚠ DOS CONJUNTOS, y la ficha de la 106.ª leyó el primero creyendo leer el segundo:");
P(`     lo que la SONDA \`f33-cmp\` traduce (KIND_DE_DIVI) .... ${KINDS.size}: ${[...KINDS].join(" · ")}`);
P("     lo que el ESQUEMA expresa (slug de `bloques/*.ts`):");
for (const [f, s] of Object.entries(SLUGS)) P(`        ${f.padEnd(14)} ${s.length.toString().padStart(2)}: ${s.join(" · ")}`);
P("");
P(`  comparadores de dos lados resueltos → ${fCmp}   ·   ${fKb}`);
P("");
for (const [tipo, docs] of Object.entries(fuera)) {
  const emit = docs.filter((d) => d.emite);
  const enEsquema = Object.entries(SLUGS).filter(([, s]) => s.includes(tipo)).map(([f]) => f);
  P(`  ── ${tipo}   ·   ${docs.length} documentos · ${emit.length} EMITIDOS`);
  P(`     ∈ KIND_DE_DIVI (la sonda) .... ${KINDS.has(tipo) ? "SÍ" : "NO"}`);
  P(`     ∈ el ESQUEMA ................. ${enEsquema.length ? `SÍ — en ${enEsquema.join(", ")}` : "NO en ninguna colección"}`);
  P(`     (los NO emitidos son páginas sin clonar, no un hueco — «falta» y «esa página no existe» son cosas distintas)`);
  for (const d of emit) {
    const v = porRutaClon.get(d.ruta);
    const k = kbPorRuta.get(d.ruta);
    P(`     ${d.ruta}`);
    P(`         módulos ${d.mods}${d.items != null ? ` · items ${d.items}` : ""}`);
    if (v) P(`         f33-cmp (dos lados) .. orig ${v.original.nModulos} mód → clon ${v.clon.nModulos} · Δ docH ${(v.clon.docH - v.original.docH).toFixed(2)}`);
    if (k) {
      const gs = new Set((kb.huecosPorFicha?.["F3-1-GALERIA-KB"] ?? []).filter((x) => aClon(x.ruta) === d.ruta).map((x) => (/\.g(\d+)/.exec(x.clave) || [])[1]).filter(Boolean));
      P(`         kb-cmp  (dos lados) .. ${k.pares} pares · ${k.distintos} distintos · items de galería vistos EN LOS DOS LADOS: ${gs.size}`);
      P(`         soloOriginal en TODA la corrida: ${(kb.soloOriginal ?? []).length}   ← si el clon no lo sirviera, sus nodos estarían AQUÍ`);
    }
    if (!v && !k) {
      const src1 = srcTodo.replace(/\s+/g, " ");
      const hit = d.testigo.vals.filter((v) => src1.includes(v));
      P(`         sin comparador de dos lados — se pregunta al FUENTE por ${d.testigo.tipo}:`);
      P(`             ${hit.length} de ${d.testigo.vals.length} citadas en \`src/\`   p.ej. ${JSON.stringify((hit[0] ?? d.testigo.vals[0] ?? "").slice(0, 58))}`);
      P(`         ⚠ sólo vale para arquetipos ESCRITOS A MANO: lo que sirve el CMS vive en la DB.`);

      P(`           Un «no lo cita» de ahí sobre una página del CMS es un FALSO NO.`);
    }
  }
  P("");
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · DEUDA alineación del botón — y el nivel importa
 *
 * ⚠ La clase NO va en el nodo que lleva el ordinal: `tipoDe` identifica el
 * botón por `et_pb_button_<n>`, que Divi pone en el `<a>`; la alineación va en
 * el ENVOLTORIO (`et_pb_module`). Censarla al nivel del ordinal daría CERO —
 * §*una regla en el NIVEL equivocado no da error*.
 * ═════════════════════════════════════════════════════════════════════════ */
const EJES = { escritorio: /^et_pb_button_alignment_(left|center|right)$/, tablet: /^et_pb_button_alignment_tablet_(left|center|right)$/, phone: /^et_pb_button_alignment_phone_(left|center|right)$/ };

/* ⚠ LA PRIMERA VERSIÓN DIO **0 DE 0** Y ERA EL SELECTOR, no el dato.
 * Pedía `et_pb_button` en el envoltorio, y el envoltorio NO la lleva: la lleva
 * el `<a>` de dentro. La clase del envoltorio es `et_pb_button_module_wrapper`
 * (+ `et_pb_button_<n>_wrapper`, que es el ordinal con SUFIJO — el mismo que ya
 * se había comido un censo anterior). Un `0 de 0` no da error: da un cero que
 * se lee como *«esta página no tiene botones»* — §sondas 4. Se caza porque el
 * denominador tenía que ser 13 y salió 0. */
let nBotones = 0;
const align = { escritorio: {}, tablet: {}, phone: {} };
const rutasConAlign = new Set();
let botonesConAlgo = 0;
for (const [ruta, pg] of cargadas) {
  for (const n of recorre(parsea(pg.html))) {
    if (!esPropia(n)) continue;
    if (!n.clases.includes("et_pb_button_module_wrapper")) continue;
    nBotones++;
    let tiene = false;
    for (const [eje, re] of Object.entries(EJES)) {
      const c = n.clases.find((x) => re.test(x));
      if (c) { const v = c.split("_").pop(); align[eje][v] = (align[eje][v] || 0) + 1; tiene = true; }
    }
    if (tiene) { rutasConAlign.add(ruta); botonesConAlgo++; }
  }
}
/* El `<a>` con ordinal — el OTRO nivel, para cruzar el cardinal. */
let nAnclas = 0;
for (const [, pg] of cargadas) for (const n of recorre(parsea(pg.html))) if (esPropia(n) && n.clases.includes("et_pb_button") && tipoDe(n) === "button") nAnclas++;

P("═══ 2 · DEUDA alineación del botón — CAMPO por test B, tres ejes");
P(`  envoltorios \`et_pb_button_module_wrapper\` .... ${nBotones}`);
P(`  anclas \`et_pb_button_<n>\` (el otro nivel) .... ${nAnclas}   ${nBotones === nAnclas ? "✅ cuadran" : "⚠ NO cuadran — hay un botón sin envoltorio o al revés"}`);
if (nBotones === 0) { P("  ⛔ CERO envoltorios: eso es el SELECTOR, no el dato (§sondas 4)."); process.exitCode = 1; }
for (const [eje, r] of Object.entries(align)) {
  const n = Object.values(r).reduce((a, b) => a + b, 0);
  P(`    ${eje.padEnd(11)} ${String(n).padStart(2)} de ${nBotones}   ${JSON.stringify(r)}`);
}
P(`  botones con AL MENOS un eje ........ ${botonesConAlgo} de ${nBotones}`);
P(`  rutas afectadas .................... ${rutasConAlign.size} de ${cargadas.size}`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · DEUDA `gutters` — el portador, su nivel, y su sombra
 * ═════════════════════════════════════════════════════════════════════════ */
const gutters = {}; // valor → {porNivel, nodos}
const filasGutters2 = [];
for (const [ruta, pg] of cargadas) {
  for (const n of recorre(parsea(pg.html))) {
    if (!esPropia(n)) continue;
    const g = n.clases.find((c) => /^et_pb_gutters\d$/.test(c));
    if (!g) continue;
    /* el PORTADOR importa: `gutters3` lo lleva `.et_builder_inner_content` (el
     * contenedor del constructor, uno por página) y `gutters2` lo lleva la
     * FILA. Son dos niveles y sólo el segundo es un ajuste de instancia. */
    const t = tipoDe(n) ?? (n.clases.includes("et_pb_row") ? "row" : n.clases.includes("et_pb_section") ? "section" : n.clases.includes("et_builder_inner_content") ? "et_builder_inner_content" : `otro:${n.etiqueta}.${n.clases.filter((c) => !/^et_pb_gutters/.test(c)).slice(0, 2).join(".")}`);
    gutters[g] ??= {};
    gutters[g][t] = (gutters[g][t] || 0) + 1;
    if (g === "et_pb_gutters2") {
      /* el reparto de sus columnas — el eje CONFUNDIDO */
      const cols = [...recorre(n)].filter((x) => /^column(_\d+)?$/.test(tipoDe(x) ?? "") || x.clases.some((c) => /^et_pb_column_\d_\d$/.test(c)));
      const rep = [...new Set(cols.flatMap((c) => c.clases.filter((x) => /^et_pb_column_\d_\d$/.test(x)).map((x) => x.replace("et_pb_column_", ""))))];
      filasGutters2.push({ ruta, nivel: t, reparto: rep.join("+") || "(sin columnas con reparto)" });
    }
  }
}
/* denominador: las filas de la capa propia */
let nFilas = 0;
for (const [, pg] of cargadas) for (const n of recorre(parsea(pg.html))) if (esPropia(n) && n.clases.includes("et_pb_row") && !n.clases.includes("et_pb_row_inner")) nFilas++;

P("═══ 3 · DEUDA `gutters` — campo de la FILA, con su sombra");
P(`  filas de la capa propia (denominador) ... ${nFilas}`);
for (const [g, porNivel] of Object.entries(gutters)) P(`  ${g.padEnd(18)} ${JSON.stringify(porNivel)}`);
P(`  las que llevan \`gutters2\`:`);
for (const r of filasGutters2) P(`      ${r.nivel.padEnd(8)} reparto ${r.reparto.padEnd(24)} ${r.ruta}`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · DEUDA `button.pt` / `button.pb` — el CRUCE de dos instrumentos
 *
 * El test A (de `f33-geo`) y la CASCADA (de `f33-clases`) contestan la misma
 * pregunta —¿lo escribió el editor o la plantilla?— por canales distintos.
 * Cuando difieren, gana el que ve QUIÉN escribe la regla.
 * ═════════════════════════════════════════════════════════════════════════ */
const fClases = porMtime(/^f33-clases(-\d{4}-\d{2}-\d{2}(-\d+)?)?\.json$/);
const fGeoCanonico = existsSync(join(MED, "f33-geo.json"));

/* ⚠⚠ LA PRIMERA VERSIÓN RESOLVIÓ `f33-geo` POR MTIME CON LOS ARTEFACTOS DENTRO
 * y le tocó `f33-geo-neg-sin-hojas.json` — o sea **un SABOTAJE**, que publicó
 * `["4.5"]` y «CAMPO (test A: px absolutos)». Es §regla 7 al pie de la letra:
 * un fichero de negativo leído como medida es una medida falsa con la autoridad
 * de una congelada. Aquí no se elige UNA: se listan TODAS las que traen
 * veredicto, con su naturaleza, para que la divergencia se vea. */
const geos = readdirSync(MED)
  .filter((f) => /^f33-geo.*\.json$/.test(f))
  .map((f) => ({ f, j: JSON.parse(readFileSync(join(MED, f), "utf8")) }))
  .filter((x) => x.j.veredictos?.["button.pt"])
  .map((x) => ({ ...x, neg: /-neg-|-neg\./.test(x.f), sonda: /SONDA-/.test(x.f) }));

P("═══ 4 · DEUDA `button.pt` / `button.pb` — el veredicto que cambia de lado");
P(`  cascada  → ${fClases}`);
P(`  ⚠ \`f33-geo.json\` canónico existe: ${fGeoCanonico ? "SÍ" : "NO — LIBERADO (§regla 5bis)"}`);
P(`     ⇒ NO HAY MEDIDA VIGENTE DEL TEST A. Las ${geos.length} congeladas con veredicto son TODAS artefactos de §regla 7:`);
for (const g of geos) P(`        ${g.neg ? "[NEGATIVO]" : g.sonda ? "[CADUCADA]" : "[?]"} ${g.f}`);
P("");

const clases = JSON.parse(readFileSync(join(MED, fClases), "utf8"));
for (const prop of ["padding-top", "padding-bottom"]) {
  const r = clases.reglas.find((x) => x.selector === ".f33-modulo" && x.prop === prop);
  if (!r) { P(`  ⛔ sin regla \`.f33-modulo · ${prop}\` en la cascada — §sondas 4`); process.exitCode = 1; continue; }
  const bot = (r.regla1440 || []).find((g) => g.selector === ".et_pb_button");
  const bot390 = (r.regla390 || []).find((g) => g.selector === ".et_pb_button");
  P(`  ── ${prop}`);
  if (!bot) { P("     ⛔ `.et_pb_button` no gana en ningún nodo — la premisa de esta deuda no se reproduce"); process.exitCode = 1; continue; }
  P(`     selector ganador ... ${bot.selector}   ¿lleva ORDINAL \`et_pb_<tipo>_<n>\`? ${/_\d+$/.test(bot.selector) ? "SÍ ⇒ editor" : "NO ⇒ PLANTILLA"}`);
  P(`     hoja ............... ${bot.hoja}   !important ${bot.important}`);
  P(`     n .................. ${bot.n} nodos`);
  P(`     valor @1440 ........ ${JSON.stringify(bot.valor)}`);
  P(`     valor @390  ........ ${JSON.stringify(bot390?.valor)}   ¿MISMA declaración a los dos anchos? ${JSON.stringify(bot.valor) === JSON.stringify(bot390?.valor) ? "SÍ" : "NO"}`);
  P(`     computado @1440 .... ${JSON.stringify(r.repartoComputado1440)}`);
}

P("");
P("  ── lo que dice el test A en CADA artefacto (ninguno es medida vigente):");
P("     artefacto                          eje         valor@1440  A(mueve/igual)   veredicto");
for (const g of geos) {
  const etq = g.neg ? `NEG ${g.f.replace(/^f33-geo-neg-|\.json$/g, "")}` : "CADUCADA";
  for (const k of ["button.pt", "button.pb"]) {
    const v = g.j.veredictos?.[k];
    if (!v) continue;
    const val = JSON.stringify(v.valoresDistintos ?? null);
    const a = v.A ? `${v.A.mueve}/${v.A.igual}` : "—";
    P(`     ${etq.padEnd(35)}${k.padEnd(12)}${val.padEnd(12)}${a.padEnd(17)}${v.ver ?? "(sin veredicto)"}`);
  }
}
P("");
P("  ⇒ LA SEPARADORA YA ESTABA CONGELADA, y es el propio SABOTAJE (§regla 8b:");
P("    `medidas/` es una muestra que nadie interroga). `neg-sin-hojas` quita las");
P("    hojas enlazadas A LOS DOS ANCHOS, así que gana el `0.3em` del core de Divi");
P("    — que es PLANTILLA sin discusión — y el valor sale IGUAL a 1440 y a 390.");
P("    El test A lee eso como «px absolutos» y dicta **CAMPO**. O sea que el");
P("    sabotaje demuestra el modo de fallo: un valor en `em` NO se mueve con el");
P("    ancho, lo escriba quien lo escriba, y el test A lo lee al revés.");
const cad = geos.find((g) => g.sonda && !g.neg) ?? geos[0];
const sc = cad?.j.criterioDeRecuento?.sinCajaPorTipo ?? {};
const nCasc = clases.reglas.find((x) => x.selector === ".f33-modulo" && x.prop === "padding-top")?.regla1440?.find((g) => g.selector === ".et_pb_button")?.n;
const conCaja = cad?.j.veredictos?.["button.pt"]?.A;
const nGeo = (conCaja?.mueve ?? 0) + (conCaja?.igual ?? 0);
P("");
P(`  ── control cruzado AL ELEMENTO (§sondas 4, otro instrumento sobre el mismo objeto):`);
P(`     cascada ${nCasc} nodos   ==   test A ${nGeo} con caja + ${sc.button ?? 0} sin caja = ${nGeo + (sc.button ?? 0)}   ${nCasc === nGeo + (sc.button ?? 0) ? "✅" : "⚠ NO CUADRAN"}`);

/* ¿está transcrito el valor en algún arquetipo verificado? Se DERIVA — y la
 * lectura se ACOTA al `className` de `BlueButton`: un `pt-[…]` suelto del
 * fichero es de otro componente (la primera versión leyó `pb-[10px]` de otro
 * sitio y publicó 10 donde hay 9). */
const srcSR = readFileSync(join(RAIZ, "apps/web/src/components/SectionRow.tsx"), "utf8");
/* ⚠ `[\s\S]*?\n\}` cortaba en el `}` de la LISTA DE PARÁMETROS (`}: {`) y
 * devolvía la firma sin el `className` — tres `undefined` que se leían como
 * «no está transcrito», o sea el cero de §sondas 4 fabricado por mi regex. Se
 * ancla al bloque entero: de `BlueButton` al siguiente `export`. */
const bloqueBB = /export function BlueButton\([\s\S]*?(?=\nexport |\n\/\*\*)/.exec(srcSR)?.[0] ?? "";
if (!/className=/.test(bloqueBB)) { P("  ⛔ el bloque de BlueButton no trae `className`: el recorte está mal (§sondas 4)"); process.exitCode = 1; }
const pt = /pt-\[([\d.]+)px\]/.exec(bloqueBB), pb = /pb-\[([\d.]+)px\]/.exec(bloqueBB), fsz = /text-\[(\d+)px\]/.exec(bloqueBB);
P("");
P("  ── ¿la BASE del `em` está SIN DERIVAR? — se comprueba en el árbol, no se recuerda");
P(`     SectionRow.tsx · BlueButton (.boton-azul, arquetipo HOME ya verificado), acotado a su className:`);
P(`        padding-top ${pt?.[1]} · padding-bottom ${pb?.[1]} · font-size ${fsz?.[1]}`);
if (pt && fsz) {
  const a = 0.5 * Number(fsz[1]), b = 0.6 * Number(fsz[1]);
  P(`        0.5em × ${fsz[1]} = ${a}  vs transcrito ${pt[1]}  ${String(a) === pt[1] ? "✅" : "⚠"}`);
  P(`        0.6em × ${fsz[1]} = ${b}  vs transcrito ${pb?.[1]}  ${String(b) === pb?.[1] ? "✅" : "⚠"}`);
}
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL MECANISMO — el denominador que ninguna ficha tiene
 *
 * Si `gutters` y la alineación son la misma CLASE de cosa —un preset que el
 * editor elige y que Divi transporta como CLASE, no como CSS con ordinal—
 * decidirlas una a una es arreglar la instancia. Y entonces hace falta saber
 * CUÁNTAS hay, no cuáles se encontraron por casualidad.
 *
 * Criterio: clase `et_pb_*` de la capa propia que (a) no es ordinal, (b) no es
 * la clase de tipo desnuda, (c) no es del cascarón (`_tb_`, menú), y que
 * (d) DISCRIMINA — la llevan unos nodos de su nivel y otros no.
 * ═════════════════════════════════════════════════════════════════════════ */
const NIVEL = (n) => {
  if (n.clases.includes("et_pb_section")) return "seccion";
  if (n.clases.includes("et_pb_row")) return "fila";
  if (n.clases.some((c) => /^et_pb_column(_\d_\d)?$/.test(c))) return "columna";
  if (n.clases.includes("et_pb_module")) return "modulo";
  return null;
};
const TIPO_DESNUDO = /^et_pb_(text|image|video|blurb|button|toggle|code|icon|map|slider|fullwidth_slider|gallery|section|row|row_inner|column|module|gutter)$/;
const CASCARON = /_tb_|^et_pb_menu_page_id-/;

/* ⚠⚠ LA PRIMERA VERSIÓN COMPARABA CONTRA EL TOTAL DEL NIVEL — 333 módulos — y
 * publicó **55 clases que «discriminan»**, casi todas basura: `et_pb_text_inner`
 * sale 191/333 porque no todos los módulos son de texto, no porque separe nada.
 * Es el PLENO de §sondas 4 disfrazado de hallazgo. El test B compara **hermanos
 * del mismo hueco**, así que el denominador es el TIPO, no el nivel. */
const tipoDeNodo = (n) => {
  const t = tipoDe(n);
  if (t && !esEstructura(t)) return t;
  const w = n.clases.find((c) => /^et_pb_([a-z_]+)_module_wrapper$/.test(c));
  if (w) return `${/^et_pb_([a-z_]+)_module_wrapper$/.exec(w)[1]}·envoltorio`;
  return null;
};
const ORDINAL = /^et_pb_[a-z][a-z0-9_]*?_\d+(_wrapper|_tb_body)?$/;

const porGrupoTotal = {};
const lleva = new Map(); // clase → {grupo → n}
for (const [, pg] of cargadas) {
  for (const n of recorre(parsea(pg.html))) {
    if (!esPropia(n)) continue;
    const niv = NIVEL(n);
    if (!niv) continue;
    const grupo = niv === "modulo" ? `modulo:${tipoDeNodo(n) ?? "sin-tipo"}` : niv;
    porGrupoTotal[grupo] = (porGrupoTotal[grupo] || 0) + 1;
    for (const c of n.clases) {
      if (!c.startsWith("et_pb_")) continue;
      if (ORDINAL.test(c)) continue;                    // ordinal, con o sin sufijo
      if (/^et_pb_column_\d_\d$/.test(c)) continue;     // el reparto YA está modelado
      if (TIPO_DESNUDO.test(c) || CASCARON.test(c)) continue;
      if (/_module_wrapper$/.test(c)) continue;         // el envoltorio, no un preset
      lleva.set(c, lleva.get(c) || {});
      lleva.get(c)[grupo] = (lleva.get(c)[grupo] || 0) + 1;
    }
  }
}

const srcClon = ["apps/web/src", "packages/cms-config/src"].flatMap((d) => {
  const out = [];
  (function rec(x) { for (const e of readdirSync(x, { withFileTypes: true })) { const p = join(x, e.name); if (e.isDirectory()) rec(p); else if (/\.(tsx?|css)$/.test(e.name)) out.push(readFileSync(p, "utf8")); } })(join(RAIZ, d));
  return out;
}).join("\n");
/* §*ningún comentario declara un hecho del repo*: se mira el fuente SIN comentarios. */
const clonSinComentarios = srcClon.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const presets = [];
const ubicuas = [];
for (const [c, porG] of lleva) {
  for (const [grupo, n] of Object.entries(porG)) {
    const total = porGrupoTotal[grupo];
    if (n === total) { ubicuas.push({ clase: c, grupo, n }); continue; } // el pleno no mide nada
    presets.push({ clase: c, grupo, n, total, emite: clonSinComentarios.includes(c) });
  }
}
presets.sort((a, b) => b.n / b.total - a.n / a.total || b.n - a.n);

P("═══ 5 · EL MECANISMO — clases-preset que DISCRIMINAN entre HERMANOS DEL MISMO TIPO");
P(`  grupos (nivel · tipo) y su n:`);
for (const [g, n] of Object.entries(porGrupoTotal).sort((a, b) => b[1] - a[1])) P(`      ${g.padEnd(28)} ${n}`);
P("");
P(`  clases descartadas por UBICUAS (n = total de su grupo): ${ubicuas.length}`);
P(`  clases que DISCRIMINAN: ${presets.length}`);
P("");
P("  clase                                   grupo                        n/total   ¿el clon la emite?");
for (const p of presets) P(`  ${p.clase.padEnd(40)}${p.grupo.padEnd(29)}${String(p.n).padStart(3)}/${String(p.total).padEnd(6)} ${p.emite ? "SÍ" : "NO"}`);
const sinEmitir = presets.filter((p) => !p.emite);
P("");
P(`  ⇒ SIN EMITIR: ${sinEmitir.length} de ${presets.length}`);
P(`     ${[...new Set(sinEmitir.map((p) => p.clase))].join(" · ")}`);
P("");
P("  ⚠ Este censo contesta «¿escribe el clon esta CLASE?», NO «¿sirve el clon");
P("    este EFECTO?» — un preset puede estar resuelto por otro canal. Un «NO»");
P("    de aquí es una PREGUNTA para el dato, no un veredicto (§tipos-sin-emitir).");
P("");
P(`  Y contesta sobre las ${cargadas.size} rutas de F3-3 y sólo ésas: una clase que`);
P("  no discrimine aquí puede discriminar en el primer documento nuevo.");
