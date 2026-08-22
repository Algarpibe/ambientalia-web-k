/* prueba-union-f33 — 92.ª tanda, 2026-08-22. ESCALÓN 2, punto 3.
 * ⚠ ACTUALIZADA en la 93.ª (2026-08-22) con las DOS SALIDAS del propietario.
 *
 * LA PREGUNTA: ¿la unión de CMS-3 expresa los documentos de `paginas`?
 *
 * ══ LO QUE CAMBIÓ, Y POR QUÉ NO ES «RELAJAR LA PRUEBA» ═════════════════════
 *
 * La 92.ª devolvió **30 de 32** y subió la refutación al propietario. Las dos
 * salidas que tomó cambian **el dato y el modelo**, no esta comprobación:
 *
 *   · **S1** — la webinar sale de `paginas` y entra en `entradas-blog`. O sea
 *     que el DENOMINADOR baja a **31**: el documento no se expresa mejor, es
 *     que **no era de esta colección**. Y por eso aquí no se borra ni se
 *     cuenta como aprobada — sale **NOMBRADA, en su propio bucket «FUERA DE
 *     ALCANCE»**, que es §*un canal que otro sembrador cubre no es «sin dato»,
 *     es fuera de alcance — decirlo de otra forma declara un cero que nadie
 *     midió*;
 *   · **S2** — `paginas` gana `campoHtml`, así que el régimen `--` ya tiene
 *     dónde caer. El punto 3 **no se desactiva: consulta al MODELO**.
 *
 * ⚠⚠ **Y LA PARTE QUE HAY QUE LEER ANTES DEL 31/31: el punto 3 sigue siendo
 * una comprobación, no un permiso.** Lo que se derive del modelo tiene que
 * SALIR NOMBRADO —qué documento se apoya en el campo rico y con qué n— porque
 * §*un campo opcional no expresa un caso: sólo permite que falte*. Un «31/31»
 * que no diga que **1 de 31 descansa en un campo con n = 1** estaría contando
 * un SIN PROBAR como probado.
 *
 * ⚠ **El sabotaje B de la 92.ª (desactivar el punto 3) queda MUDO, y eso hay
 * que decirlo en voz alta en vez de celebrarlo** (§regla 21, la vuelta: *un
 * caso de negativo puede morirse el día que se arregla el objeto — y se muere
 * verde*). Con S1 y S2 puestas no queda ningún documento que ese sabotaje
 * pudiera rescatar, así que ya **no separa nada**. Se sustituye por su
 * simétrico —**quitarle el campo rico al MODELO**— que muerde por el mismo
 * motivo y prueba que la guarda sigue entera. Detalle en
 * `prueba-union-f33-neg.log`.
 *
 * Por EXTRACCIÓN y OFFLINE, no por render: el objetivo es saber si el modelo
 * CABE, no cómo se ve. No abre el original, no construye, no siembra.
 *
 * ── Qué cuenta como «expresada» ────────────────────────────────────────────
 * Un documento está expresado si TODO su contenido tiene sitio en el modelo:
 *   1 · cada módulo de la capa propia cae en un bloque de `MODULOS_PAGINA`;
 *   2 · el anidamiento que trae cabe en `bloques` (sección → [módulo suelto |
 *       fila → columna → módulo]);
 *   3 · y —la que se olvida— **si el documento NO tiene capa propia, su
 *       contenido tiene que estar en algún campo del modelo.**
 *
 * ⚠ **El punto 3 es el que decide, y por eso va escrito antes de mirar.** Sin
 * él, un documento sin capa propia sale «expresado» porque `bloques` es
 * opcional — y eso es §*una ruta que responde 200 no prueba que sirva
 * CONTENIDO*: la página se emitiría con cabecera, pie y nada en medio. Un
 * documento con contenido y sin sitio donde ponerlo **no está expresado**,
 * está OMITIDO.
 *
 * ── Cómo se publica ────────────────────────────────────────────────────────
 * **POR RÉGIMEN, no en total** — el reparto nunca es uniforme — y toda página
 * que la unión no exprese sale **NOMBRADA**, no contada.
 *
 * CONTROLES:
 *   · el nº de módulos por tipo cuadra con `arbol-f33` (mismo parser) y con
 *     `mod-v4` (otro parser). Si alguno falla, es el instrumento;
 *   · la lista de bloques se DERIVA de `bloques/paginas.ts` leyendo sus
 *     `slug:` — no se escribe a mano (§regla 9 caso 7). Si el parseo no casa
 *     con nada, TIRA: un 0 sería «la unión está vacía», que es plausible y
 *     falso;
 *   · la CORRESPONDENCIA `et_pb_<tipo>` → slug es una decisión de modelado, se
 *     declara, y **todo tipo sin correspondencia sale NOMBRADO** en vez de
 *     contarse como cubierto.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parsea, limpia, tipoDe, esPropia, esEstructura, seccionesPropias, modulosDe, recorre } from "./arbol-f33.mjs";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const UNION_TS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const KB_TS = join(RAIZ, "packages/cms-config/src/bloques/kb.ts");
const COL_TS = join(RAIZ, "packages/cms-config/src/colecciones/paginas.ts");

/* ── 0 · S2 · los CAMPOS RICOS que el modelo declara — DERIVADOS ───────────
 * Del mismo modo que la unión se deriva de `bloques/paginas.ts`, el segundo
 * canal de contenido se deriva de la COLECCIÓN. Escribirlo a mano sería
 * §regla 9 caso 7: una lista de literales dentro de un instrumento, que
 * envejece contra el repo en silencio. Si mañana se quita el campo, esta
 * sonda lo nota sola — y eso es justo el sabotaje B′ del negativo. */
const colSrc = readFileSync(COL_TS, "utf8");
const CAMPOS_RICOS = [...colSrc.matchAll(/\bcampoHtml\(\s*"([^"]+)"/g)].map((m) => m[1]);

/* ── 1 · la UNIÓN, derivada del código que la declara ──────────────────────── */
const src = readFileSync(UNION_TS, "utf8");
/** Los slugs que `MODULOS_PAGINA` lista, resueltos contra las declaraciones. */
const declarados = Object.fromEntries(
  [...src.matchAll(/export const (MODULO_[A-Z_]+): Block = \{\s*\n\s*slug: "([^"]+)"/g)].map((m) => [m[1], m[2]]),
);
/* `MODULO_BLURB` se consume de kb.ts: su slug vive allí. */
const kbSrc = readFileSync(KB_TS, "utf8");
for (const m of kbSrc.matchAll(/export const (MODULO_[A-Z_]+): Block = \{\s*\n\s*slug: "([^"]+)"/g)) {
  declarados[m[1]] = m[2];
}
const listaUnion = /export const MODULOS_PAGINA: Block\[\] = \[([\s\S]*?)\];/.exec(src);
if (!listaUnion) throw new Error("PARSEO MUERTO: no se encontró `MODULOS_PAGINA` en bloques/paginas.ts");
const UNION = listaUnion[1].split(",").map((s) => s.trim()).filter(Boolean).map((n) => {
  if (!declarados[n]) throw new Error(`SLUG SIN RESOLVER para ${n} — la unión no se puede derivar`);
  return declarados[n];
});
if (UNION.length === 0) throw new Error("UNIÓN VACÍA: el parseo no casó con nada (§sondas 4)");

/* ── 2 · la CORRESPONDENCIA Divi → slug. DECLARADA, no derivable ───────────── */
const MAPA = {
  text: "texto-pagina",
  image: "imagen-pagina",
  button: "boton-pagina",
  code: "codigo",
  toggle: "toggle",
  video: "video-pagina",
  blurb: "blurb",
  fullwidth_slider: "slider-completo",
  slider: "slider",
  map: "mapa",
  icon: "icono",
  /* `slide` NO está: el árbol lo sitúa DENTRO del slider (P-S2, 2/2), o sea que
   * es el array interno del bloque, no un bloque. Si apareciera como módulo de
   * primer nivel, saldría NOMBRADO como sin correspondencia — que es lo que
   * queremos: sería la refutación de P-S1. */
};

/* ── 3 · el recorrido ─────────────────────────────────────────────────────── */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};

/** El régimen se lee del `<body>`, que es una línea de HTML servido. */
function regimenDe(html) {
  const bc = (/<body[^>]*class="([^"]*)"/.exec(html) || [])[1] || "";
  const B = /\bet_pb_pagebuilder_layout\b/.test(bc);
  const T = /\bet-tb-has-body\b/.test(bc);
  return B && T ? "HIBRIDO (BT)" : B ? "BUILDER (B-)" : T ? "PLANTILLADO (-T)" : "SIN MARCADOR (--)";
}

/**
 * S1 · ¿es este documento de OTRA colección? **Derivado, no una lista de rutas.**
 *
 * El discriminador es `single-post` en el `<body>`: WordPress lo escribe cuando
 * la plantilla que sirve es la de una ENTRADA. La webinar lo trae —igual que
 * las 152 capturas de `corpus/entradas-blog`, con la misma firma
 * `single single-post postid-N single-format-standard`— y estaba en `sueltas`
 * **por su URL, no por su forma**.
 *
 * ⚠ Escrito como derivación y no como excepción a propósito: si mañana otra
 * suelta resultara ser una entrada, esta sonda la saca sola. Y el cardinal se
 * publica, que es lo que impide que «fuera de alcance» se convierta en un
 * cajón. Medido hoy con `regimenes-corpus`: **exactamente 1 de las 32**.
 */
function otraColeccion(html) {
  const bc = (/<body[^>]*class="([^"]*)"/.exec(html) || [])[1] || "";
  if (/\bsingle-post\b/.test(bc)) return { coleccion: "entradas-blog", marca: "single-post" };
  return null;
}

/**
 * ⚠⚠ **LO QUE DE VERDAD ADJUDICA S1 — y NO es la expresabilidad.**
 *
 * Medido con el contrafactual C del negativo: **desaplicando S1 esta prueba
 * sigue dando verde** (32/32), porque el campo rico de S2 también se traga el
 * `post_content` de la webinar. O sea **0 instancias separadoras**: por
 * expresabilidad, «la webinar en `paginas`» y «la webinar en `entradas-blog`»
 * predicen lo mismo, y elegir ahí sería §*dos modelos que predicen lo mismo en
 * todo tu dominio son uno solo*.
 *
 * Lo que sí separa es **dato servido que `paginas` no tiene dónde poner**. Y
 * hay que medirlo, no suponerlo, porque el candidato obvio **no vale**:
 *
 * | campo del JSON-LD | n de 32 | ¿separa? |
 * |---|---|---|
 * | `datePublished`  | **32** | **NO** — lo traen todas. Citarlo sería nombrar una propiedad del conjunto entero |
 * | `articleSection` | **1**  | **SÍ** — sólo la webinar (`Seminarios Web`) |
 * | `author`         | **1**  | **SÍ** — sólo la webinar (`Equipo de marketing y comunicación`) |
 *
 * Así que S1 no es una preferencia de colocación: **alojar la webinar en
 * `paginas` PERDERÍA su categoría y su autor**, que es dato servido sin campo
 * donde caer — el mismo criterio del punto 3, un nivel más abajo.
 */
const CAMPOS_JSONLD = [
  ["articleSection", /"articleSection"\s*:\s*\[?\s*"([^"]+)"/],
  ["author", /"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/],
  ["datePublished", /"datePublished"\s*:\s*"([^"]+)"/],
];
/** Los campos que `paginas` declara — derivados, para saber qué NO tiene. */
const CAMPOS_PAGINAS = new Set([...colSrc.matchAll(/name:\s*"([a-zA-Z]+)"/g)].map((m) => m[1]));
function servidoSinCampo(html) {
  const out = [];
  for (const [nombre, re] of CAMPOS_JSONLD) {
    const m = re.exec(html);
    if (m && !CAMPOS_PAGINAS.has(nombre)) out.push({ campo: nombre, valor: m[1] });
  }
  return out;
}

/** El contenido que NO está en la capa propia: `post_content` o `entry-content`. */
function contenidoFueraDeCapaPropia(html) {
  const out = [];
  for (const [nombre, marca] of [["et_pb_post_content", "et_pb_post_content"], ["entry-content", 'class="entry-content"']]) {
    const i = html.indexOf(marca);
    if (i < 0) continue;
    const raiz = parsea(html.slice(i - 200 > 0 ? i - 200 : 0));
    /* basta con medir el texto que hay tras la marca hasta el cierre del artículo */
    const trozo = html.slice(i, i + 400000);
    const fin = trozo.search(/<\/article>|<\/main>|id="main-footer"/);
    const cuerpo = fin > 0 ? trozo.slice(0, fin) : trozo;
    const texto = cuerpo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const etiquetas = [...new Set([...cuerpo.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase()))];
    if (texto.length > 200) out.push({ canal: nombre, chars: texto.length, etiquetas: etiquetas.slice(0, 18) });
    void raiz;
  }
  return out;
}

const porRegimen = {};
const noExpresadas = [];
const filas = [];
const tiposVistos = {};
const fueraDeAlcance = [];
const apoyadasEnCampoRico = [];
const censoJsonLd = {};
let totalModulos = 0, expresados = 0;

for (const [grupo, lista] of Object.entries(grupos)) {
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
    const bruto = readFileSync(f, "utf8");
    const html = limpia(bruto);

    /* S1 — FUERA DE ALCANCE va ANTES del régimen, y sale nombrada. No es una
     * aprobación: es que el documento no lo aloja esta colección. */
    /* El censo de campos servidos se hace SIEMPRE, dentro y fuera de alcance:
     * es lo que da el denominador de la tabla de separadores. Contarlo sólo en
     * los excluidos daría «1 de 1», que no separa nada. */
    const sinCampo = servidoSinCampo(bruto);
    for (const s of sinCampo) (censoJsonLd[s.campo] = censoJsonLd[s.campo] || []).push(e.ruta);

    const otra = otraColeccion(html);
    if (otra) {
      fueraDeAlcance.push({ ruta: e.ruta, grupo, reg: regimenDe(html), ...otra, sinCampo });
      continue;
    }

    const reg = regimenDe(html);
    porRegimen[reg] = porRegimen[reg] || { n: 0, ok: 0, mal: [] };
    porRegimen[reg].n++;

    const raiz = parsea(html);
    const secs = seccionesPropias(raiz);
    const problemas = [];
    let nMod = 0;

    for (const sec of secs) {
      const filasSec = [...recorre(sec)].filter(
        (n) => n.clases.includes("et_pb_row") && esPropia(n) && !n.clases.includes("et_pb_row_inner"),
      );
      for (const m of modulosDe(sec)) {
        const t = tipoDe(m);
        if (!t || esEstructura(t)) continue;
        nMod++; totalModulos++;
        tiposVistos[t] = (tiposVistos[t] || 0) + 1;
        const slug = MAPA[t];
        if (!slug) { problemas.push(`módulo \`et_pb_${t}\` SIN CORRESPONDENCIA en la unión`); continue; }
        if (!UNION.includes(slug)) { problemas.push(`\`et_pb_${t}\` mapea a \`${slug}\`, que NO está en MODULOS_PAGINA`); continue; }
        expresados++;
      }
      void filasSec;
    }

    /* EL PUNTO 3 — el que decide, y va escrito antes de mirar el dato.
     *
     * ⚠ Con S2 **no se desactiva: consulta al MODELO**. La pregunta sigue
     * siendo la misma —*¿tiene sitio este contenido?*— y lo único que cambió es
     * que ahora puede haber sitio. Si el modelo declara campo rico, el
     * documento se expresa POR ÉL y sale nombrado; si no lo declara, cae
     * exactamente como caía en la 92.ª, con el mismo mensaje. */
    if (secs.length === 0) {
      const fuera = contenidoFueraDeCapaPropia(html);
      for (const x of fuera) {
        if (CAMPOS_RICOS.length) {
          apoyadasEnCampoRico.push({ ruta: e.ruta, reg, campo: CAMPOS_RICOS[0], ...x });
        } else {
          problemas.push(
            `SIN CAPA PROPIA y CON CONTENIDO: ${x.chars} caracteres en \`${x.canal}\`, ` +
            `etiquetas ${x.etiquetas.join(",")} — la unión NO tiene campo donde ponerlo`,
          );
        }
      }
    }

    const ok = problemas.length === 0;
    if (ok) porRegimen[reg].ok++;
    else { porRegimen[reg].mal.push(e.ruta); noExpresadas.push({ ruta: e.ruta, grupo, reg, problemas }); }
    filas.push({ ruta: e.ruta, grupo, reg, secs: secs.length, nMod, ok });
  }
}

/* ── 4 · el informe ───────────────────────────────────────────────────────── */
console.log("═══ 1 · LA UNIÓN QUE SE PRUEBA — derivada de bloques/paginas.ts");
console.log(`  ${UNION.length} bloques: ${UNION.join(" · ")}`);
console.log(`  correspondencias declaradas: ${Object.keys(MAPA).length} tipos de Divi`);
const sinCorr = Object.keys(tiposVistos).filter((t) => !MAPA[t]);
console.log(`  tipos vistos en el corpus SIN correspondencia: ${sinCorr.length}${sinCorr.length ? " — " + sinCorr.join(" · ") : ""}`);
console.log(`  ── S2 · campos ricos que el MODELO declara (derivados de colecciones/paginas.ts):`);
console.log(`     ${CAMPOS_RICOS.length ? CAMPOS_RICOS.map((c) => "`" + c + "`").join(" · ") : "NINGUNO — el punto 3 no tiene dónde mandar el contenido"}`);

console.log(`\n═══ 1b · S1 · FUERA DE ALCANCE — documentos que NO aloja esta colección`);
console.log(`  ⚠ NO son aprobados: son documentos de OTRA colección, y por eso salen NOMBRADOS`);
console.log(`  y RESTADOS del denominador en vez de contarse como expresados.`);
if (fueraDeAlcance.length === 0) console.log("  (ninguno)");
for (const x of fueraDeAlcance)
  console.log(`  · ${x.ruta}\n      → \`${x.coleccion}\` · derivado de \`${x.marca}\` en el <body> · régimen ${x.reg} · grupo ${x.grupo}`);

console.log(`\n  ── QUÉ ADJUDICA S1, medido — y NO es la expresabilidad:`);
console.log(`     el contrafactual C del negativo desaplica S1 y esta prueba SIGUE en verde,`);
console.log(`     porque el campo rico de S2 se traga también el post_content de la webinar.`);
console.log(`     0 instancias separadoras por expresabilidad. Lo que separa es DATO SERVIDO`);
console.log(`     que \`paginas\` no tiene dónde poner:\n`);
const TOTAL_DOCS = Object.values(grupos).flat().filter((e) => e.fichero && existsSync(join(CORPUS, e.fichero))).length;
console.log(`     ${"campo del JSON-LD".padEnd(18)} ${"n".padStart(3)}/${TOTAL_DOCS}  ¿separa?`);
for (const [c] of CAMPOS_JSONLD) {
  const rutas = censoJsonLd[c] || [];
  const sep = rutas.length > 0 && rutas.length < TOTAL_DOCS;
  console.log(`     ${c.padEnd(18)} ${String(rutas.length).padStart(3)}/${TOTAL_DOCS}  ${sep ? "SÍ" : "NO — lo traen todas, nombrarlo sería una propiedad del conjunto entero"}`);
  if (sep) for (const r of rutas) console.log(`     ${" ".repeat(18)}      · ${r}`);
}
console.log(`\n     ⚠ \`datePublished\` NO separa, y decirlo importa: es el candidato obvio y`);
console.log(`     citarlo habría sido §*comprueba que Y VARÍE en el dominio donde se midió*.`);

console.log(`\n═══ 2 · EL RESULTADO **POR RÉGIMEN** — el reparto nunca es uniforme`);
console.log(`  ${"régimen".padEnd(20)} ${"n".padStart(3)} ${"expresadas".padStart(11)} ${"NO expresadas".padStart(14)}`);
for (const [r, v] of Object.entries(porRegimen).sort()) {
  console.log(`  ${r.padEnd(20)} ${String(v.n).padStart(3)} ${String(v.ok).padStart(11)} ${String(v.n - v.ok).padStart(14)}`);
}
const N = Object.values(porRegimen).reduce((s, v) => s + v.n, 0);
const OK = Object.values(porRegimen).reduce((s, v) => s + v.ok, 0);
console.log(`  ${"TOTAL".padEnd(20)} ${String(N).padStart(3)} ${String(OK).padStart(11)} ${String(N - OK).padStart(14)}`);
console.log(`\n  módulos de contenido: ${totalModulos} · expresados por un bloque: ${expresados}`);
console.log(`  denominador: ${N} páginas  (32 capturadas − ${fueraDeAlcance.length} de otra colección)`);

console.log(`\n═══ 2b · LAS QUE DESCANSAN EN EL CAMPO RICO — con su n, no calladas`);
console.log(`  §*un campo opcional no expresa un caso: sólo permite que falte*. Estas NO se`);
console.log(`  expresan por un bloque: se expresan porque S2 añadió un segundo canal.`);
if (apoyadasEnCampoRico.length === 0) console.log("  (ninguna)");
for (const x of apoyadasEnCampoRico)
  console.log(`  · ${x.ruta}\n      régimen ${x.reg} · ${x.chars} car. en \`${x.canal}\` → campo \`${x.campo}\`\n      etiquetas: ${x.etiquetas.join(" · ")}`);
if (apoyadasEnCampoRico.length)
  console.log(`  ⚠ n = ${apoyadasEnCampoRico.length}. Un camino de render con n = 1 está SIN PROBAR por variación:`);
console.log(`     lo que sí está probado es que el dato PASA la validación (valida-campo-rico-f33.log).`);

console.log(`\n═══ 3 · LAS QUE LA UNIÓN NO EXPRESA — NOMBRADAS, no contadas`);
if (noExpresadas.length === 0) console.log("  (ninguna)");
for (const x of noExpresadas) {
  console.log(`\n  ❌ ${x.ruta}`);
  console.log(`     grupo ${x.grupo} · régimen ${x.reg}`);
  for (const p of x.problemas) console.log(`     · ${p}`);
}

console.log(`\n═══ 4 · TODAS, con su régimen`);
for (const f of filas) {
  console.log(`  ${f.ok ? "✅" : "❌"} ${f.reg.padEnd(20)} ${f.grupo.padEnd(9)} ${f.ruta.padEnd(72)} S${String(f.secs).padStart(2)} M${String(f.nMod).padStart(3)}`);
}

console.log(`\n═══ 5 · LO QUE ESTA PRUEBA **NO** CONTESTA`);
console.log(`  · no dice si el render CUADRA: es extracción, no geometría. 0 ejes de estas 32`);
console.log(`    están comparados contra el original (COBERTURA-MEDICION)`);
console.log(`  · no dice si los CAMPOS de cada bloque bastan — dice que el TIPO existe.`);
console.log(`    Ejemplo declarado: la retícula de \`blurb\` trae \`iconos-md-4\` (8/22) y el`);
console.log(`    enum de KB no lo tiene (F3-3-RETICULA-BLURB)`);
console.log(`  · no dice nada de las 16 no-páginas ni de los 13 redirects`);

/* ── 5 · el CONTRATO: por debajo del mínimo NO hay verde ───────────────────
 * §4bis. El mínimo se DERIVA del corpus —32 capturadas menos las que otra
 * colección aloje— y no se escribe. Sin esto, un fallo del recorrido daría
 * «0 de 0 mal» y exit 0, que es el verde falso de toda la vida. */
const CAPTURADAS = Object.values(grupos).flat().filter((e) => e.fichero && existsSync(join(CORPUS, e.fichero))).length;
const MINIMO = CAPTURADAS - fueraDeAlcance.length;
console.log(`\n═══ 6 · CONTRATO — evaluadas ${N}/${MINIMO} páginas · alcance: la cola larga capturada (${CAPTURADAS} documentos)`);
if (N < MINIMO || MINIMO < 1) {
  console.log(`⛔ NO SE PUDO EVALUAR: ${N} < ${MINIMO}. Un recuento por debajo del mínimo no es un verde.`);
  process.exit(2);
}

if (noExpresadas.length) {
  console.log(`\n⚠ CORTE LIMPIO: ${noExpresadas.length} de ${N} documentos NO se expresan. Sube al propietario.`);
  process.exit(3);
}
console.log(`\n✅ LA UNIÓN EXPRESA ${OK} DE ${N} — con S1 (${fueraDeAlcance.length} fuera de alcance) y S2 (${apoyadasEnCampoRico.length} por campo rico) aplicadas.`);
