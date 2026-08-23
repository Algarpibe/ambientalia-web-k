/**
 * EL HUECO DE `productos` — quiénes son los que faltan, y **para qué hace falta
 * cada uno**. Uso: npm run qa:productos-hueco
 *   SABOTAJE=cpt-vacio | clase-cubo | panel-muerto | modelado-fantasma
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y POR QUÉ NO BASTABA CON EL NÚMERO QUE YA HABÍA
 *
 * `PENDIENTES-QA.md` §DATOS-C-SOLUCIONES dice *«qué la cierra: modelar los 15
 * productos que faltan»*, y las dos mitades de esa frase están medidas: el CPT
 * tiene **24** URLs y el clon modela **9**. Lo que NO estaba medido es si esos
 * 15 son **los mismos** que los 10 que bloquean la siembra.
 *
 * > **«Los 15 que faltan» y «los 10 que desbloquean» son dos conjuntos, y nadie
 * > los había intersecado.** Un total sin reparto es el error ya fichado
 * > (`CLAUDE.md` §El NIVEL al que se mide, séptimo contenedor): la cobertura
 * > declarada al nivel de arriba absorbe lo que no se miró abajo.
 *
 * Y el precedente es de este mismo CPT: §regla 9 lo tiene fichado como instancia
 * n.º 5 —*«el CPT `solutions` tiene 22 URLs»* eran **24**, y dos «singleton» no
 * lo eran—. Un número de este CPT no se cita: se deriva.
 *
 * ── LAS CUATRO PREGUNTAS DEL PASO 1, cada una con su unidad ───────────────
 *   1 · **quiénes son los 15** — inventario del CPT (corpus) menos lo modelado
 *       (el catálogo IMPORTADO, no una lista escrita);
 *   2 · **cuáles desbloquean** — intersección con lo que los 57 casos
 *       referencian en `soluciones`. Con su reparto, nunca con el total;
 *   3 · **qué arquetipo les toca** — la evidencia ya congelada de
 *       `solutions-campos.json` (plantilla · secciones · kinds), agrupada;
 *   4 · **DOCUMENTO o PÁGINA** — cuántos de los referenciados tienen hoy ruta
 *       emitida, contra el manifiesto real del build.
 *
 * ── LA CLASE QUE EL REPARTO TIENE QUE PODER NOMBRAR ──────────────────────
 * Un slug referenciado puede caer en tres sitios y **no hay un cuarto cubo**:
 * MODELADO · EN-CPT-SIN-MODELAR · **SIN-CPT**. El tercero es el que importa,
 * porque es el que «modelar los 15» **no arregla**: un `data-id` que no
 * corresponde a ninguna de las 24 URLs no tiene página que clonar. Lo que no
 * encaje en los tres sale `SIN CLASIFICAR` y es **rojo** — la lección de la
 * tanda anterior: *un cubo de «combinaciones» es donde se pierden las clases que
 * nadie nombró*.
 *
 * ── LO QUE NO HACE ───────────────────────────────────────────────────────
 * No abre el original (corpus congelado + medidas congeladas + manifiesto), no
 * transforma, no siembra y **no decide**: dice qué hay y cuánto pesa. Qué se
 * modela y en qué orden lo decide el acta.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cargaCatalogos } from "../seed/catalogos.mjs";
import {
  APP,
  Evaluadas,
  gritaSiRevienta,
  hoy,
  leeManifiesto,
  QA,
  rutasEmitidas,
  w,
} from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["cpt-vacio", "clase-cubo", "panel-muerto", "modelado-fantasma"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL INVENTARIO DEL CPT — del corpus congelado, no del sitemap
 *
 * `solutions-campos` deriva su alcance del `solutions-sitemap.xml` **en
 * caliente**; esta tanda no abre el original, así que la fuente es el corpus,
 * que es el sitemap ya cobrado y con su `sha256`. Las dos tienen que dar 24 y
 * lo comprueba el cruce de abajo.
 * ═════════════════════════════════════════════════════════════════════════ */

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const rutasCpt = Object.keys(INDICE.paginas)
  .filter((k) => k.startsWith("productos/"))
  .map((k) => k.slice("productos/".length))
  .sort();

/** El slug del documento es la HOJA: `cartuchos-inteligentes/ozono` → `ozono`.
 *  Es el mismo dato que el `data-id` del panel y que `Product.id`. */
const hoja = (r) => r.split("/").pop();
/** …y el segmento anterior es `padre`, que el esquema ya modela como `select`. */
const padreDe = (r) => (r.includes("/") ? r.slice(0, r.lastIndexOf("/")) : null);

const CPT = SABOTAJE === "cpt-vacio" ? [] : rutasCpt;
const cptPorHoja = new Map(CPT.map((r) => [hoja(r), r]));

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LO MODELADO — importado, nunca escrito a mano
 *
 * §regla 3 (*un comentario que afirma consumidores es un dato sin fuente*): la
 * lista de lo que el clon modela **se deriva** del mismo catálogo que siembra
 * la colección, o sería una copia con su propia deriva.
 * ═════════════════════════════════════════════════════════════════════════ */

const catalogos = await cargaCatalogos();
const productosCat = catalogos.get("productos") ?? [];
const modelados = new Set(productosCat.map((p) => p.id));
if (SABOTAJE === "modelado-fantasma") modelados.add("producto-que-no-existe-en-el-cpt");

/* ══════════════════════════════════════════════════════════════════════════
 * 2bis · LOS DOCUMENTOS DEL CPT **SIN PÁGINA PROPIA** — CMS-PR3
 *
 * ⚠⚠ **AÑADIDO 2026-08-23 (96.ª tanda). Es §regla 5ter: ARREGLAR EL OBJETO
 * MEDIDO CADUCA EL CONTROL DEL INSTRUMENTO QUE LO MIDIÓ.**
 *
 * Esta sonda hizo su trabajo: fue ELLA la que midió que 3 de los 19 slugs
 * referenciados no son ninguna de las 24 URLs del CPT. La 95.ª leyó el hallazgo,
 * lo modeló —el campo `pagina: propia | ninguna`, 21 · 3— y la ida lo derivó en
 * `preparaProducto()`. **Lo que nadie actualizó fue esta guarda**, que siguió
 * escribiendo la expectativa de ayer (*«todo lo modelado es una URL del CPT»*) y
 * por eso fallaba **en voz alta** — que se lee como hallazgo del objeto en vez de
 * como avería del instrumento.
 *
 * Y en su forma es §regla 25: **el DOMINIO de la guarda quedó más ancho que su
 * invariante**, así que dejó de proteger y pasó a BLOQUEAR. El invariante que
 * quiere vigilar es *«un slug modelado que no corresponde a ningún DOCUMENTO del
 * CPT»* —lo que inyecta el sabotaje `modelado-fantasma`—; el dominio que
 * reclamaba era *«…que no es ninguna URL del CPT»*, y **documento ≠ URL**: el
 * corpus tiene 24 URLs porque los otros 3 documentos **no tienen permalink**
 * (`ozone-2` sólo sale por `?post_type=solutions&p=56674`).
 *
 * ⚠ **El discriminador se DERIVA con la función de la IDA, no se reimplementa**
 * (§una definición, no dos) y **no se escribe como lista** (§regla 9): una lista
 * de tres slugs envejecería contra el catálogo en silencio. `preparaProducto()`
 * decide por la medida —*¿el último segmento del `href` SERVIDO es el `slug`?*—
 * así que si mañana el original le da permalink a `ozone-2`, la exclusión
 * desaparece sola.
 *
 * ⚠ **Y el sabotaje sigue mordiendo, que es la condición de que esto no sea
 * «ajustar la expectativa»** (§regla 21): el fantasma se añade a `modelados`
 * DESPUÉS de leer el catálogo, así que no está en `productosCat`, no puede salir
 * `ninguna`, y cae en la guarda igual que antes.
 * ═════════════════════════════════════════════════════════════════════════ */
const { preparaProducto } = await import("../seed/seed.mjs");
const sinPaginaPropia = new Set(
  productosCat.filter((p) => preparaProducto(p).pagina === "ninguna").map((p) => p.id),
);

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LO QUE LOS 57 CASOS REFERENCIAN
 * ═════════════════════════════════════════════════════════════════════════ */

const fExtraido = join(QA, "medidas/c-extraido.json");
if (!existsSync(fExtraido))
  throw new Error(
    `no existe medidas/c-extraido.json.\n` +
      `  Es la salida de \`npm run cms:extractor-c\`, y sin ella el reparto de esta\n` +
      `  sonda no existe. Un \`?? []\` aquí diría «ningún caso referencia nada».`,
  );
const EXTRAIDO = JSON.parse(readFileSync(fExtraido, "utf8"));
const casos = EXTRAIDO.catalogo?.casos;
if (!Array.isArray(casos) || !casos.length)
  throw new Error(`c-extraido.json no trae 'catalogo.casos' como array no vacío.`);

const evCpt = new Evaluadas({ nombre: "inventario CPT", unidad: "productos del CPT", minimo: rutasCpt.length });
const evCasos = new Evaluadas({ nombre: "referencias", unidad: "casos del corpus", minimo: casos.length });

for (const _ of CPT) evCpt.ok();

/** slug referenciado → { n, casos[] }. El orden final es por peso. */
const refs = new Map();
for (const c of casos) {
  const lista = c.soluciones ?? [];
  /* El sabotaje inyecta un slug que NO cae en ninguna de las tres clases: ni
   * está modelado, ni está en el CPT. Tiene que salir por SIN CLASIFICAR y no
   * repartirse en silencio dentro de «sin-cpt». */
  const conSabotaje = SABOTAJE === "clase-cubo" ? [...lista, " cubo-sin-clase"] : lista;
  for (const s of conSabotaje) {
    if (!refs.has(s)) refs.set(s, { n: 0, casos: [] });
    const e = refs.get(s);
    e.n++;
    e.casos.push(c.slug);
  }
  evCasos.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA CLASIFICACIÓN — tres clases y NINGÚN cubo
 * ═════════════════════════════════════════════════════════════════════════ */

const CLASES = {
  MODELADO: "el clon ya lo modela: la relación tiene destino",
  "EN-CPT-SIN-MODELAR": "es una de las 24 URLs del CPT y el clon no la modela — modelarlo lo arregla",
  "SIN-CPT": "el caso lo referencia y NO es ninguna de las 24 URLs: no hay página que clonar",
};
const claseDe = (slug) => {
  if (modelados.has(slug)) return "MODELADO";
  if (cptPorHoja.has(slug)) return "EN-CPT-SIN-MODELAR";
  /* Un `data-id` que no es del CPT sólo se puede clasificar si se sabe QUÉ es, y
   * eso lo dice el panel servido. Sin evidencia no se mete en un cubo. */
  if (evidencia.has(slug)) return "SIN-CPT";
  return "SIN CLASIFICAR";
};

/* ── La evidencia de los que no son del CPT: lo que el ORIGINAL sirve ──────
 * §El principio: se verifica contra la salida servida. El panel del caso trae,
 * por cada `data-id`, su rótulo y el `href` de su botón «Ver más» — y ese `href`
 * es lo que dice si el `data-id` es un ALIAS de una URL que sí existe o un
 * documento sin permalink. Se busca sobre el HTML del caso, sin `<style>` ni
 * `<script>` (§sondas 4, tercera cara). */
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

const evidencia = new Map();
/**
 * El `<li>` del panel: `<span  data-id="X">Rótulo…</span>…<a href="…" class="et_pb_button">`.
 *
 * ⚠ **`<span[^>]*\bdata-id=`, no `<span data-id=`, y lo cazó la guarda de
 * MUERTO en la primera corrida:** el original sirve **dos espacios** ahí
 * (`<li><span  data-id="accesories">`). Con un solo espacio la sonda daba
 * **0 evidencias** —un cero plausible, sin error— y los 3 huérfanos habrían
 * salido «no son nada» en vez de «no los sé leer». §sondas 4: un selector que no
 * casa con nada no es un cero, es un defecto.
 */
const RE_PANEL = (slug) =>
  new RegExp(
    `<span[^>]*\\bdata-id="${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)</span>` +
      `[\\s\\S]{0,4000}?<a href="([^"]+)"[^>]*class="[^"]*et_pb_button`,
  );
const RE_MUERTA = /<span[^>]*\bdata-id="ESTE-ATRIBUTO-NO-EXISTE"[^>]*>([\s\S]*?)<\/span>/;

const noModeladoNiCpt = [...refs.keys()].filter((s) => !modelados.has(s) && !cptPorHoja.has(s));
for (const slug of noModeladoNiCpt) {
  for (const cs of refs.get(slug).casos) {
    const f = join(CORPUS, "casos", `${cs}.html`);
    if (!existsSync(f)) continue;
    const html = sinScriptNiStyle(readFileSync(f, "utf8"));
    const m = SABOTAJE === "panel-muerto" ? RE_MUERTA.exec(html) : RE_PANEL(slug).exec(html);
    if (!m) continue;
    evidencia.set(slug, {
      rotulo: m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80),
      href: m[2],
      /** El discriminador de verdad: un `href` de consulta cruda (`?post_type=`)
       *  es un documento **sin permalink**; uno con ruta bonita es un ALIAS. */
      forma: /[?&]post_type=/.test(m[2]) ? "sin-permalink" : "alias-de-ruta",
      visto: cs,
    });
    break;
  }
}

const porClase = { MODELADO: [], "EN-CPT-SIN-MODELAR": [], "SIN-CPT": [], "SIN CLASIFICAR": [] };
for (const [slug, e] of [...refs.entries()].sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0])))
  porClase[claseDe(slug)].push({ slug, n: e.n, casos: e.casos.length, ...(evidencia.get(slug) ?? {}) });

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · LOS 15, Y SU REPARTO POR PARA-QUÉ
 * ═════════════════════════════════════════════════════════════════════════ */

const sinModelar = CPT.filter((r) => !modelados.has(hoja(r)));
const referenciadosPorCasos = new Set(porClase["EN-CPT-SIN-MODELAR"].map((x) => x.slug));
const desbloquean = sinModelar.filter((r) => referenciadosPorCasos.has(hoja(r)));
const cola = sinModelar.filter((r) => !referenciadosPorCasos.has(hoja(r)));

/** Los casos que HOY no pueden sembrarse, y los que seguirían sin poder. */
const casoBloqueado = (c) => (c.soluciones ?? []).some((s) => !modelados.has(s));
const casoBloqueadoTrasModelarLos15 = (c) =>
  (c.soluciones ?? []).some((s) => !modelados.has(s) && !cptPorHoja.has(s));
const bloqueadosHoy = casos.filter(casoBloqueado);
const bloqueadosDespues = casos.filter(casoBloqueadoTrasModelarLos15);

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · EL ARQUETIPO — de la medida ya congelada, no re-medida
 * ═════════════════════════════════════════════════════════════════════════ */

const fCampos = join(QA, "medidas/solutions-campos.json");
const CAMPOS = existsSync(fCampos) ? JSON.parse(readFileSync(fCampos, "utf8")) : null;
const arquetipoDe = (ruta) => {
  const p = CAMPOS?.paginas?.[ruta];
  if (!p) return null;
  return { forma: p.forma, tpl: p.tpl, nSecciones: p.nSecciones, nModulos: p.nModulos, kinds: p.kinds };
};
/** Agrupa los 15 por (forma · plantilla · nº de secciones): si sale UNA sola
 *  caja y su plantilla es la de los ya construidos, no hay arquetipo nuevo. */
const grupos = new Map();
for (const r of sinModelar) {
  const a = arquetipoDe(r);
  const k = a ? `${a.forma} · ${a.tpl} · ${a.nSecciones} secciones` : "SIN MEDIDA CONGELADA";
  if (!grupos.has(k)) grupos.set(k, []);
  grupos.get(k).push(r);
}
/** La plantilla de los que YA están construidos, para comparar contra algo. */
const tplConstruidos = [...new Set(
  CPT.filter((r) => modelados.has(hoja(r))).map((r) => arquetipoDe(r)?.tpl).filter(Boolean),
)];

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · ¿DOCUMENTO O PÁGINA? — contra el manifiesto real
 * ═════════════════════════════════════════════════════════════════════════ */

const manifiesto = leeManifiesto(APP);
const EMITIDAS = new Set(rutasEmitidas(manifiesto));
const rutaCandidata = (r) => `/${r}`;
const conRutaEmitida = CPT.filter((r) => EMITIDAS.has(rutaCandidata(r)));
const referenciadosConRuta = [...refs.keys()].filter((s) => {
  const r = cptPorHoja.get(s);
  return r && EMITIDAS.has(rutaCandidata(r));
});

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

console.log(`\n════════ EL HUECO DE \`productos\` · corpus congelado, sin red ════════\n`);

console.log(`  ── 1 · INVENTARIO ──`);
console.log(`   CPT \`solutions\` en el corpus        ${String(CPT.length).padStart(4)}`);
console.log(`   modelados por el clon (importado)   ${String(CPT.filter((r) => modelados.has(hoja(r))).length).padStart(4)}`);
console.log(`   SIN MODELAR                         ${String(sinModelar.length).padStart(4)}`);

/* Reconciliación: una identidad aritmética que no puede fallar en silencio.
 * §regla 3 aplicada al recuento — lo que se imprime y lo que se cuenta no
 * pueden discrepar. */
const modeladosEnCpt = CPT.filter((r) => modelados.has(hoja(r))).length;
if (modeladosEnCpt + sinModelar.length !== CPT.length)
  err(`RECONCILIACIÓN: ${modeladosEnCpt} + ${sinModelar.length} ≠ ${CPT.length} productos del CPT.`);
/* §regla 25: el cardinal de lo que la GUARDA alcanza y el INVARIANTE no. Si sale
 * 0, la guarda está ajustada; si no, ése es el número de rechazos falsos que
 * evita — y se publica, porque un dominio mal puesto no da error: rechaza cosas
 * correctas con toda la autoridad de la guarda. */
const fueraDelInvariante = [...modelados].filter((s) => !cptPorHoja.has(s) && sinPaginaPropia.has(s));
console.log(
  `   documentos del CPT SIN PÁGINA propia ${String(sinPaginaPropia.size).padStart(4)}` +
    (sinPaginaPropia.size ? `   ${[...sinPaginaPropia].sort().join(" · ")} (CMS-PR3 · derivado por preparaProducto)` : ""),
);
console.log(
  `   ├ de ésos, fuera de las URLs del CPT ${String(fueraDelInvariante.length).padStart(4)}   ← los que la guarda alcanzaría y el invariante NO`,
);

const modeladosFueraDelCpt = [...modelados].filter((s) => !cptPorHoja.has(s) && !sinPaginaPropia.has(s));
if (modeladosFueraDelCpt.length)
  err(
    `MODELADO FUERA DEL CPT: ${modeladosFueraDelCpt.length} slug(s) que el clon modela y que no son\n` +
      `   NINGÚN DOCUMENTO del corpus — ${modeladosFueraDelCpt.join(" · ")}.\n` +
      `   Eso NO es «uno de más»: es que las dos fuentes no denotan el mismo conjunto.\n` +
      `   (Los documentos del CPT SIN PÁGINA propia no cuentan aquí: son documentos\n` +
      `    legítimos sin permalink, y el invariante es sobre el DOCUMENTO, no la URL.)`,
  );

console.log(`\n  ── 2 · LO QUE LOS ${casos.length} CASOS REFERENCIAN (${refs.size} slugs distintos) ──`);
for (const [clase, filas] of Object.entries(porClase)) {
  if (!filas.length) { console.log(`   ${clase.padEnd(20)} —`); continue; }
  const refsN = filas.reduce((a, x) => a + x.n, 0);
  console.log(`   ${clase.padEnd(20)} ${String(filas.length).padStart(2)} slugs · ${String(refsN).padStart(3)} referencias   ${CLASES[clase] ?? ""}`);
  for (const x of filas)
    console.log(
      `       ${String(x.n).padStart(3)}  ${x.slug.padEnd(38)}` +
        (x.href ? `  ${x.forma === "sin-permalink" ? "⛔ SIN PERMALINK" : "↪ alias"}  ${x.rotulo} → ${x.href}` : ""),
    );
}

const sumaClases = Object.values(porClase).reduce((a, f) => a + f.length, 0);
if (sumaClases !== refs.size)
  err(`RECONCILIACIÓN: las clases suman ${sumaClases} y hay ${refs.size} slugs referenciados.`);
if (porClase["SIN CLASIFICAR"].length)
  err(
    `SIN CLASIFICAR: ${porClase["SIN CLASIFICAR"].length} slug(s) no caen en ninguna clase —\n` +
      `   ${porClase["SIN CLASIFICAR"].map((x) => x.slug).join(" · ")}.\n` +
      `   Un cubo de sobras es donde se pierden las clases que nadie nombró: es ROJO.`,
  );

/* La guarda del cero (§sondas 4): si NINGÚN slug fuera del CPT trae evidencia,
 * eso no es «no hay huérfanos»: es que el localizador del panel no casa. */
if (noModeladoNiCpt.length && evidencia.size === 0)
  err(
    `LOCALIZADOR MUERTO: ${noModeladoNiCpt.length} slug(s) fuera del CPT y CERO evidencias del panel.\n` +
      `   Un cero aquí no es «no son nada»: es que el patrón del \`<span data-id>\` no casa.`,
  );
/* …y la del pleno: si casara con TODO lo referenciado, no estaría discriminando. */
if (evidencia.size && evidencia.size === refs.size)
  err(`LOCALIZADOR UBICUO: la evidencia casa en los ${refs.size} referenciados — no discrimina.`);

console.log(`\n  ── 3 · EL REPARTO DE LOS ${sinModelar.length} SIN MODELAR ──`);
console.log(`   desbloquean \`casos\` (los referencian)  ${String(desbloquean.length).padStart(3)}   ${desbloquean.map(hoja).join(" · ") || "—"}`);
console.log(`   cola de §F3-COLA-DESTINOS (no)         ${String(cola.length).padStart(3)}   ${cola.map(hoja).join(" · ") || "—"}`);
console.log(`\n   casos que HOY no se pueden sembrar            ${String(bloqueadosHoy.length).padStart(3)} de ${casos.length}`);
console.log(`   casos que SEGUIRÍAN sin poder tras los ${String(sinModelar.length).padStart(2)}    ${String(bloqueadosDespues.length).padStart(3)} de ${casos.length}` +
  (bloqueadosDespues.length ? `   ⛔ modelar los ${sinModelar.length} NO desbloquea la colección` : `   ✅ la colección entra entera`));
for (const c of bloqueadosDespues)
  console.log(`       ⛔ ${c.slug}  ←  ${(c.soluciones ?? []).filter((s) => !modelados.has(s) && !cptPorHoja.has(s)).join(" · ")}`);

console.log(`\n  ── 4 · ARQUETIPO de los ${sinModelar.length} (medida congelada de solutions-campos) ──`);
if (!CAMPOS) console.log(`   ⚠ no existe medidas/solutions-campos.json — sin evidencia de arquetipo`);
for (const [k, rs] of grupos) console.log(`   ${String(rs.length).padStart(2)} × ${k}`);
console.log(`   plantilla de los ya construidos: ${tplConstruidos.join(" | ") || "—"}`);
const gruposSinMedida = [...grupos.keys()].filter((k) => k === "SIN MEDIDA CONGELADA");
if (gruposSinMedida.length)
  err(`${grupos.get("SIN MEDIDA CONGELADA").length} de los ${sinModelar.length} no tienen medida de arquetipo congelada.`);
/** El ESCALÓN 1 del encargo, medido: ¿alguno trae plantilla distinta? */
const tplNuevas = [...new Set(sinModelar.map((r) => arquetipoDe(r)?.tpl).filter(Boolean))].filter(
  (t) => !tplConstruidos.includes(t),
);

console.log(`\n  ── 5 · ¿DOCUMENTO o PÁGINA? (contra el prerender-manifest) ──`);
console.log(`   rutas del CPT emitidas hoy por el build      ${String(conRutaEmitida.length).padStart(3)} de ${CPT.length}   ${conRutaEmitida.join(" · ") || "—"}`);
console.log(`   referenciados por casos CON ruta emitida     ${String(referenciadosConRuta.length).padStart(3)} de ${refs.size}`);
console.log(
  `   → la relación \`soluciones\` la satisface el DOCUMENTO (\`getProductosCms\` resuelve por \`id\`);\n` +
    `     el \`href\` del panel lo compone el proyector y \`segunEntorno\` lo manda al ORIGINAL\n` +
    `     mientras la ruta no esté construida. O sea: DOCUMENTO desbloquea, PÁGINA localiza.`,
);

w("medidas/productos-hueco.json", {
  meta: {
    fecha: hoy(),
    que: "el hueco de `productos` repartido por PARA-QUÉ: qué desbloquea `casos` y qué es cola de §F3-COLA-DESTINOS",
    fuentes: [
      "corpus/INDICE.json (24 URLs del CPT, congeladas con sha256)",
      "apps/web/src/lib/products.ts vía cargaCatalogos() — importado, no escrito",
      "medidas/c-extraido.json (los 57 casos y sus `soluciones`)",
      "corpus/casos/*.html (el panel SERVIDO, para los que no son del CPT)",
      "medidas/solutions-campos.json (arquetipo ya congelado)",
      ".next/prerender-manifest.json (qué rutas emite el build HOY)",
    ],
    sabotaje: SABOTAJE,
    noMide: ["no abre el original", "no transforma", "no siembra", "no decide qué se modela"],
  },
  inventario: {
    cpt: CPT.length,
    modelados: modeladosEnCpt,
    sinModelar: sinModelar.length,
    rutas: CPT.map((r) => ({ ruta: r, slug: hoja(r), padre: padreDe(r), modelado: modelados.has(hoja(r)) })),
  },
  referencias: {
    casos: casos.length,
    slugsDistintos: refs.size,
    porClase: Object.fromEntries(Object.entries(porClase).map(([k, v]) => [k, v])),
  },
  reparto: {
    desbloquean: desbloquean.map((r) => ({ ruta: r, slug: hoja(r), n: refs.get(hoja(r))?.n ?? 0 })),
    cola: cola.map((r) => ({ ruta: r, slug: hoja(r) })),
    casosBloqueadosHoy: bloqueadosHoy.length,
    casosBloqueadosTrasModelarLos15: bloqueadosDespues.map((c) => ({
      slug: c.slug,
      culpables: (c.soluciones ?? []).filter((s) => !modelados.has(s) && !cptPorHoja.has(s)),
    })),
  },
  arquetipo: {
    grupos: Object.fromEntries([...grupos].map(([k, v]) => [k, v])),
    tplConstruidos,
    tplNuevas,
    detalle: Object.fromEntries(sinModelar.map((r) => [r, arquetipoDe(r)])),
  },
  documentoOPagina: {
    rutasCptEmitidas: conRutaEmitida,
    referenciadosConRutaEmitida: referenciadosConRuta,
    regla:
      "la relación se satisface con el DOCUMENTO (getProductosCms resuelve por id y TIRA si falta); " +
      "la PÁGINA sólo decide si el href del panel es local o vuelve al original (segunEntorno).",
  },
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} productos-hueco: ${sinModelar.length} sin modelar de ${CPT.length} · ` +
    `${desbloquean.length} desbloquean · ${porClase["SIN-CPT"].length} SIN-CPT · ` +
    `${bloqueadosDespues.length} casos seguirían bloqueados · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
