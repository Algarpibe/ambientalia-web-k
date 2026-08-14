/**
 * LA JERARQUÍA DE TÉRMINOS — su FORMA completa, en las DOS direcciones.
 * Uso: node scripts/qa/lh-jerarquia.mjs            (npm run qa:lh-jerarquia)
 *      NEG=<etiqueta> SABOTAJE=<x> node …          (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE, Y QUÉ PREGUNTA CONTESTA QUE §F3-LH-JERARQUIA-RECURSOS NO
 *
 * La 65.ª tanda estableció que **la jerarquía EXISTE** — 8 rutas de dos
 * segmentos, 8/8 migas nombrando al padre con su URL, el padre listando sus 8
 * hijas. Eso es un hecho de EXISTENCIA, y con él no se puede modelar: para
 * modelar hace falta la **FORMA** —cuántos niveles, cuántos padres, si algún
 * término tiene dos, y en qué taxonomías pasa esto y en cuáles no—.
 *
 * ── Y la mitad que nadie hace: la dirección CONTRARIA ─────────────────────
 * §UNA COMPROBACIÓN RETROACTIVA SE ENMARCA EN LAS DOS DIRECCIONES. La pregunta
 * cómoda es *«¿el original tiene jerarquía que el clon no tiene?»*. La otra
 * mitad —*«¿el ESQUEMA admite `padre` donde el original nunca lo produce?»*— se
 * contesta con el mismo barrido y decide algo distinto: si la salida es
 * *«poblar `padre`»* o *«poblar `padre` **y acotar dónde**»*.
 *
 * Por eso esta sonda cruza **las dos listas**:
 *   · las taxonomías donde el ORIGINAL sirve un padre  (medido en el corpus)
 *   · las colecciones donde el ESQUEMA declara `padre`  (leído de cms-config)
 * y nombra las cuatro celdas, incluidas las dos que son defecto.
 *
 * ── Las CUATRO vías, cada una con su denominador ──────────────────────────
 * §sondas 4 en su forma útil: selectores independientes sobre la misma
 * afirmación. Si uno diera 0 sería un selector muerto; si coinciden, la
 * afirmación no depende de ninguno. **Y no contestan todas la misma pregunta**:
 *
 *   1 · la FORMA DE LA URL      — nº de segmentos bajo el prefijo de la taxonomía
 *   2 · la MIGA                 — `<li class="taxonomia padre">` con el href del padre
 *   3 · los CHIPS               — `.button-group.filtros-resources` del padre
 *   4 · el `<body class>`       — `archive tax-<t> term-<slug>` vs `page page-child`
 *
 * Las tres primeras dicen **quién es el padre**; la cuarta dice **qué es la
 * cosa**, y es la que separa las dos lecturas que §0b del HANDOFF dio por
 * inseparables (*«las dos producen las mismas 80 tarjetas»*). Las tarjetas son
 * el canal que no discrimina; el `<body>` sí — y su contraste vive en el mismo
 * directorio, con 3 hermanos de `articulos` marcados `page-child`.
 *
 * ⚠ **La vía 1 sola no vale, y por eso no se usa sola.** «Dos segmentos» es la
 * SOMBRA de la jerarquía, no la jerarquía: un CPT con prefijo fijo produce la
 * misma forma sin que exista padre ninguno — es exactamente lo que hacen
 * `/recursos/documentos-cientificos/` y `/recursos/kunakpedia/`, que tienen dos
 * segmentos y **no son términos**. Lo que discrimina es la vía 2, porque el
 * original **dice de qué tipo es cada eslabón** (`taxonomia` · `pagina` ·
 * `categoria`) en el marcado servido.
 *
 * ── El modelo de RUTA se pone a prueba aquí, no se elige ──────────────────
 * §DOS VARIABLES CONFUNDIDAS: «derivar la ruta de la jerarquía» y «cablearla»
 * dan la MISMA salida en las 8 hijas, así que ahí no se pueden separar. Se
 * separan en los términos de PRIMER NIVEL, donde el modelo derivado predice
 * **un** segmento. La sonda evalúa la predicción contra las URL medidas y
 * publica el acierto con su denominador.
 *
 * ── Lo que esta sonda NO hace ─────────────────────────────────────────────
 * No abre el original (corpus congelado), no abre el clon y **no compara
 * geometría**. Es un censo de estructura y un cruce con el esquema.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, leeManifiesto, QA, rutasEmitidas, w } from "./lib.mjs";

gritaSiRevienta();

const SABOTAJES = ["sin-corpus", "via-muerta", "ruta-cableada"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const RAIZ = join(QA, "..", "..");
const rel = (...p) => join(RAIZ, ...p);

/* ══════════════════════════════════════════════════════════════════════════
 * EL DENOMINADOR — de dónde sale cada taxonomía, dicho una por una
 *
 * §regla 9: se DERIVA, no se recuerda. Y §regla 3 del alcance: cada fuente se
 * nombra, porque **no son la misma clase de evidencia** — un sitemap es el
 * original enumerando; un directorio del corpus es lo que una campaña capturó,
 * y puede estar incompleto. Las dos se usan, y la sonda dice cuál usó.
 * ═════════════════════════════════════════════════════════════════════════ */
const TAXONOMIAS = [
  {
    tax: "resources",
    coleccion: "categorias-recursos",
    prefijo: "/es/recursos/",
    fuente: { tipo: "sitemap", ruta: "corpus/fase-3/_sitemaps/resources-sitemap.xml" },
    corpus: "corpus/fase-3/listados/recursos",
  },
  {
    tax: "post_tag",
    coleccion: "etiquetas",
    prefijo: "/es/etiqueta/",
    fuente: { tipo: "sitemap", ruta: "corpus/fase-3/_sitemaps/post_tag-sitemap.xml" },
    corpus: "corpus/fase-3/listados/etiqueta",
  },
  {
    tax: "scientific-category",
    coleccion: "categorias-cientificas",
    prefijo: "/es/scientific-category/",
    fuente: { tipo: "sitemap", ruta: "corpus/fase-3/_sitemaps/scientific-category-sitemap.xml" },
    corpus: "corpus/fase-3/listados/scientific-category",
  },
  {
    /* LH-SP8: viva y FUERA del sitemap. El denominador es el corpus, y se dice. */
    tax: "category",
    coleccion: "categorias",
    prefijo: "/es/categoria/",
    fuente: { tipo: "corpus", ruta: "corpus/fase-3/categoria/categoria" },
    corpus: "corpus/fase-3/categoria/categoria",
  },
  {
    /* Referenciada por §2c y sin colección propia hoy. Entra porque la pregunta
     * (b) es «¿dónde NO aplica `padre`?», y una taxonomía sin modelar es
     * exactamente donde un `padre` de más se colaría sin que nadie lo mirara. */
    tax: "sector",
    coleccion: null,
    prefijo: "/es/sector/",
    fuente: { tipo: "corpus", ruta: "corpus/fase-3/taxonomia-sector/sector" },
    corpus: "corpus/fase-3/taxonomia-sector/sector",
  },
];

const desdeSitemap = (ruta) => {
  const xml = readFileSync(rel(ruta), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace("https://kunakair.com", ""))
    .filter((u) => u.startsWith("/es/"));
};

const desdeCorpus = (dir, prefijo) =>
  readdirSync(rel(dir), { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "page")
    .map((e) => `${prefijo}${e.name}/`);

/* ══════════════════════════════════════════════════════════════════════════
 * LAS TRES VÍAS
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_OL = /<ol class="kunak-breadcrumbs"[\s\S]*?<\/ol>/;
const RE_LI = /<li[^>]*>[\s\S]*?<\/li>/g;
/* ⚠ El selector de la vía 2 es SEMÁNTICO (§sondas 4 · el caso particular): la
 * clase la escribe el tema del original para decir QUÉ ES el eslabón, no cómo
 * se pinta. Un literal de estilo casaría en los 5 eslabones y no discriminaría. */
const SEL_PADRE_TAX = SABOTAJE === "via-muerta" ? /\btaxonomia-padre-inexistente\b/ : /\btaxonomia\b[\s\S]*?\bpadre\b|\bpadre\b[\s\S]*?\btaxonomia\b/;
const RE_CHIPS = /<div class="button-group[^"]*">([\s\S]*?)<\/div>/;

const migaDe = (html) => {
  const m = html.match(RE_OL);
  if (!m) return null;
  return (m[0].match(RE_LI) || []).map((li) => ({
    clase: (li.match(/<li[^>]*class="([^"]*)"/) || [, ""])[1],
    href: ((li.match(/href="([^"]*)"/) || [, null])[1] || "").replace("https://kunakair.com", "") || null,
    nombre: (li.match(/<span itemprop="name">([^<]*)<\/span>/) || [, ""])[1],
  }));
};

const chipsDe = (html) => {
  const m = html.match(RE_CHIPS);
  if (!m) return [];
  return [...m[1].matchAll(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g)].map((x) => ({
    href: x[1].replace("https://kunakair.com", ""),
    nombre: x[2],
  }));
};

/* ══════════════════════════════════════════════════════════════════════════
 * VÍA 4 — EL `<body class>`, que es la que contesta «¿término o página?»
 *
 * Las vías 1–3 dicen **quién es el padre**. Ésta dice **qué es la cosa**, y es
 * la que separa las dos lecturas que el HANDOFF dio por inseparables: WordPress
 * marca el `<body>` de un archivo de taxonomía con `archive tax-<taxonomía>
 * term-<slug> term-<id>`, y el de una página con `page page-id-<n>` más
 * `page-parent`/`page-child`. Los dos vocabularios conviven **en el mismo
 * directorio** del original —`/recursos/articulos/` es `archive`, y sus tres
 * hermanos `/recursos/{kunakpedia,documentos-cientificos,preguntas-frecuentes}/`
 * son `page-child`—, y ése contraste es lo que impide que el discriminador sea
 * inventado: no hay que creerse una regla de WordPress, se ve la partición.
 * ═════════════════════════════════════════════════════════════════════════ */
const TOKENS_CUERPO = /^(archive|tax-|term-|page$|page-id-|page-parent|page-child|page-template-|et-tb-has-body|et_pb_pagebuilder_layout|home|blog)/;
const cuerpoDe = (html) => {
  const c = (html.match(/<body[^>]*class="([^"]*)"/) || [, ""])[1];
  const tokens = c.split(/\s+/).filter((t) => TOKENS_CUERPO.test(t));
  return {
    tokens,
    esArchivo: tokens.includes("archive"),
    esPagina: tokens.some((t) => /^page(-id-|-parent|-child|-template-)?$/.test(t)),
    taxonomiaDeclarada: (tokens.find((t) => t.startsWith("tax-")) || "").slice(4) || null,
    terminoDeclarado: (tokens.find((t) => /^term-[a-z0-9-]*[a-z][a-z0-9-]*$/.test(t)) || "").slice(5) || null,
  };
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL BARRIDO
 * ═════════════════════════════════════════════════════════════════════════ */
const universo = [];
for (const t of TAXONOMIAS) {
  const rutaFuente = SABOTAJE === "sin-corpus" ? "corpus/fase-3/_sitemaps/NO-EXISTE.xml" : t.fuente.ruta;
  if (!existsSync(rel(rutaFuente)))
    throw new Error(
      `FUENTE DEL DENOMINADOR AUSENTE: ${rutaFuente} (taxonomía '${t.tax}').\n` +
        `  Sin ella el censo saldría con MENOS términos y el veredicto seguiría siendo verde:\n` +
        `  un denominador que se encoge solo es la forma barata de «no encontré jerarquía»\n` +
        `  (§sondas 4bis · 0 comparado no es verde).`,
    );
  const urls = t.fuente.tipo === "sitemap" ? desdeSitemap(rutaFuente) : desdeCorpus(rutaFuente, t.prefijo);
  for (const url of urls) universo.push({ ...t, url });
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA UNIDAD ES EL TÉRMINO CENSADO, Y CADA VÍA PUBLICA SU PROPIO DENOMINADOR
 *
 * §regla 12 / §la cobertura declarada al nivel de arriba: un solo «✓ evaluadas
 * 38/38» absorbería que la vía 2 —la que de verdad discrimina— no pudo leerse
 * en todos. Así que se separan:
 *
 *  · **la unidad del contrato** es el término censado por la vía 1 (su URL, que
 *    sale del sitemap o del árbol del corpus). Un término existe y tiene su
 *    número de segmentos aunque su archivo no esté capturado;
 *  · **cada vía lleva su fracción** —`miga N/38`, `chips N/38`— impresa y
 *    congelada, porque son afirmaciones distintas con evidencia distinta.
 *
 * ⚠ **Y la guarda dura va sobre las taxonomías MODELADAS**: de ellas depende la
 * decisión, así que un término modelado sin archivo leído es una celda del
 * cruce (b) que nadie miró, y eso cierra el código. Para las SIN MODELAR
 * (`sector`, sin colección) la afirmación se publica como fracción y se dice
 * en qué vía descansa — que es lo que §regla 10 pide en vez de un titular.
 * ═════════════════════════════════════════════════════════════════════════ */
const modeladas = universo.filter((u) => u.coleccion);
const sinModelar = universo.filter((u) => !u.coleccion);
const ev = new Evaluadas({ nombre: "lh-jerarquia", unidad: "términos censados", minimo: universo.length });

/** Un censo de vías: cuántos nodos casó cada una, sumando TODAS las páginas. */
const casos = { miga: 0, padreEnMiga: 0, chips: 0, dosSegmentos: 0, cuerpoArchivo: 0 };

const terminos = [];
for (const u of universo) {
  const segmentos = u.url.slice(u.prefijo.length).replace(/\/$/, "").split("/").filter(Boolean);
  const slug = segmentos[segmentos.length - 1];
  const dirCorpus = rel(u.corpus, ...segmentos);
  const fichero = join(dirCorpus, "index.html");

  const fila = {
    taxonomia: u.tax,
    coleccion: u.coleccion,
    slug,
    url: u.url,
    segmentos: segmentos.length,
    capturado: existsSync(fichero),
    /* Vía 2 y 3 sólo si hay HTML. Un término sin captura NO se cuenta como
     * «sin padre»: se declara con su motivo (§regla 6 · la ausencia se rechaza). */
    padreSegunMiga: null,
    padreSegunUrl: segmentos.length > 1 ? segmentos[segmentos.length - 2] : null,
    nPadresEnMiga: 0,
    chips: 0,
    hijasSegunChips: [],
  };
  if (segmentos.length > 1) casos.dosSegmentos++;

  /* Censado = la vía 1 pudo clasificarlo (existe y se sabe cuántos segmentos
   * tiene). Las vías 2 y 3 necesitan el archivo, y llevan su propia fracción. */
  ev.ok();
  if (!fila.capturado) {
    terminos.push(fila);
    continue;
  }
  const html = readFileSync(fichero, "utf8");

  const miga = migaDe(html);
  if (miga) {
    casos.miga++;
    const padres = miga.filter((li) => SEL_PADRE_TAX.test(li.clase));
    fila.nPadresEnMiga = padres.length;
    if (padres.length) {
      casos.padreEnMiga++;
      /* Del href del padre se toma su SLUG, que es lo comparable con el modelo
       * derivado. El nombre va al lado para poder leerlo a ojo. */
      const p = padres[padres.length - 1];
      fila.padreSegunMiga = (p.href || "").replace(/\/$/, "").split("/").pop() || null;
      fila.padreNombre = p.nombre;
    }
    fila.miga = miga.map((li) => (li.clase ? `${li.clase}|` : "") + (li.href ?? "(sin href)"));
  }

  const cuerpo = cuerpoDe(html);
  fila.cuerpo = cuerpo;
  if (cuerpo.esArchivo) casos.cuerpoArchivo++;

  const chips = chipsDe(html);
  fila.chips = chips.length;
  if (chips.length) {
    casos.chips++;
    fila.hijasSegunChips = chips.map((c) => c.href.replace(/\/$/, "").split("/").pop());
  }
  terminos.push(fila);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTRASTE DE LA VÍA 4 — los hermanos de `articulos` que NO son términos
 *
 * Un `archive` en 35 de 35 sería un PLENO, y un patrón que casa en todas no
 * discrimina (§sondas 4, su complementario). Lo que convierte la vía 4 en un
 * discriminador es que **el mismo directorio del original trae las dos
 * lecturas**: `/recursos/` es `page-parent` y tres de sus hijos son
 * `page-child`. Si esos tres salieran también `archive`, el token no estaría
 * separando nada y habría que decirlo en vez de citarlo.
 * ═════════════════════════════════════════════════════════════════════════ */
const CONTRASTE = [
  ["/es/recursos/", "corpus/fase-3/listados/recursos/index.html"],
  ["/es/recursos/kunakpedia/", "corpus/fase-3/listados/recursos/kunakpedia/index.html"],
  ["/es/recursos/documentos-cientificos/", "corpus/fase-3/listados/recursos/documentos-cientificos/index.html"],
  ["/es/recursos/preguntas-frecuentes/", "corpus/fase-3/listados/recursos/preguntas-frecuentes/index.html"],
];
const contraste = [];
for (const [url, f] of CONTRASTE) {
  if (!existsSync(rel(f))) {
    contraste.push({ url, capturado: false });
    continue;
  }
  const c = cuerpoDe(readFileSync(rel(f), "utf8"));
  contraste.push({ url, capturado: true, esArchivo: c.esArchivo, esPagina: c.esPagina, tokens: c.tokens });
}
const contrasteLeido = contraste.filter((c) => c.capturado);
const contrastePagina = contrasteLeido.filter((c) => c.esPagina && !c.esArchivo);

/* ══════════════════════════════════════════════════════════════════════════
 * GUARDA DE VÍAS MUERTAS — §sondas 4
 * Un selector que no casa en NINGUNA página sale por error, nunca por cero.
 * El ámbito es «todas», no «cada una»: que una taxonomía no tenga chips es
 * legítimo; que ninguna los tenga significa que el selector está mal.
 * ═════════════════════════════════════════════════════════════════════════ */
const vivas = Object.entries(casos).filter(([, n]) => n > 0).map(([k]) => k);
const muertas = Object.entries(casos).filter(([, n]) => n === 0).map(([k]) => k);
if (muertas.length)
  throw new Error(
    `VÍA MUERTA: ${muertas.join(", ")} casó 0 nodos en ${universo.length} términos.\n` +
      `  Un selector que no encuentra nada y uno que no mira nada dan la MISMA salida,\n` +
      `  y aquí la salida sería «no hay jerarquía» — el veredicto más cómodo posible.\n` +
      `  Vías vivas: ${vivas.join(", ") || "(ninguna)"}`,
  );

/* ══════════════════════════════════════════════════════════════════════════
 * LA FORMA — profundidad, padres, y términos con más de uno
 * ═════════════════════════════════════════════════════════════════════════ */
const conPadre = terminos.filter((t) => t.padreSegunMiga);
const conDosPadres = terminos.filter((t) => t.nPadresEnMiga > 1);
const padres = [...new Set(conPadre.map((t) => t.padreSegunMiga))];
/* Un TERCER nivel sería un término que es padre de alguien Y tiene padre. */
const tercerNivel = conPadre.filter((t) => padres.includes(t.slug));
const profundidad = Math.max(1, ...terminos.filter((t) => t.capturado).map((t) => t.segmentos));

const porTaxonomia = new Map();
for (const t of terminos) {
  const k = t.taxonomia;
  if (!porTaxonomia.has(k))
    porTaxonomia.set(k, { taxonomia: k, coleccion: t.coleccion, terminos: 0, capturados: 0, conPadre: 0, profundidad: 1 });
  const r = porTaxonomia.get(k);
  r.terminos++;
  if (t.capturado) r.capturados++;
  if (t.padreSegunMiga) r.conPadre++;
  r.profundidad = Math.max(r.profundidad, t.capturado ? t.segmentos : 1);
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL MODELO DE RUTA, PUESTO A PRUEBA
 *
 * H (derivado):  ruta(t) = <prefijo> + [padre.slug si lo hay] + t.slug
 *
 * En las hijas H y «cablear el segmento» dan lo mismo — ahí no se separan. Se
 * separan en los términos de PRIMER NIVEL, donde H predice UN segmento y el
 * cableado predice dos. La sonda evalúa H contra las URL medidas y publica el
 * acierto **con su denominador**, no con un titular.
 * ═════════════════════════════════════════════════════════════════════════ */
const predice = (t) => {
  const partes = [];
  if (t.padreSegunMiga) partes.push(t.padreSegunMiga);
  partes.push(t.slug);
  return `${TAXONOMIAS.find((x) => x.tax === t.taxonomia).prefijo}${partes.join("/")}/`;
};
const evaluables = terminos.filter((t) => t.capturado);
const aciertaH = evaluables.filter((t) => (SABOTAJE === "ruta-cableada" ? false : predice(t) === t.url));
const fallaH = evaluables.filter((t) => !aciertaH.includes(t));
/* Los que SEPARAN los dos modelos: primer nivel en una taxonomía que tiene
 * jerarquía. Si son 0, H no está probado — está sin probar (§DOS VARIABLES). */
const taxConJerarquia = [...porTaxonomia.values()].filter((r) => r.conPadre > 0).map((r) => r.taxonomia);
const separadores = evaluables.filter((t) => taxConJerarquia.includes(t.taxonomia) && !t.padreSegunMiga);

/* ══════════════════════════════════════════════════════════════════════════
 * DIRECCIÓN (b) — ¿el ESQUEMA admite `padre` donde el original no lo produce?
 *
 * Se lee de la CONFIG, no de una lista escrita aquí (§regla 9 · derivar). Y se
 * cruza con lo medido arriba, para nombrar las cuatro celdas — incluidas las
 * dos que son defecto, cada una con su nombre propio.
 * ═════════════════════════════════════════════════════════════════════════ */
const FUENTE_TAX = rel("packages/cms-config/src/colecciones/taxonomias.ts");
const srcTax = readFileSync(FUENTE_TAX, "utf8");
const declaraPadre = new Map();
for (const m of srcTax.matchAll(/slug:\s*"([a-z-]+)",[\s\S]*?fields:\s*\[([\s\S]*?)\n\s{2}\],/g)) {
  declaraPadre.set(m[1], /name:\s*"padre"/.test(m[2]));
}
if (![...declaraPadre.values()].some(Boolean))
  throw new Error(
    `LECTURA DEL ESQUEMA MUERTA: ninguna colección de ${FUENTE_TAX} declara 'padre'.\n` +
      `  El cruce de la dirección (b) saldría «0 sobre-generalizaciones» sin haber leído\n` +
      `  nada — un cero con forma de dato (§sondas 4).`,
  );

const cruce = [];
for (const r of porTaxonomia.values()) {
  const esquemaLoDeclara = r.coleccion ? declaraPadre.get(r.coleccion) === true : false;
  const originalLoProduce = r.conPadre > 0;
  cruce.push({
    taxonomia: r.taxonomia,
    coleccion: r.coleccion ?? "(sin colección)",
    esquemaLoDeclara,
    originalLoProduce,
    celda:
      originalLoProduce && esquemaLoDeclara
        ? "OK · modelado y ejercido"
        : originalLoProduce && !esquemaLoDeclara
          ? "DEFECTO · el original tiene jerarquía y el esquema no la expresa"
          : !originalLoProduce && esquemaLoDeclara
            ? "SOBRE-GENERALIZADO · el esquema admite un valor que el original no produce"
            : "OK · plana en los dos lados",
  });
}
const sobreGeneralizadas = cruce.filter((c) => c.celda.startsWith("SOBRE"));
const sinExpresar = cruce.filter((c) => c.celda.startsWith("DEFECTO"));

/* ══════════════════════════════════════════════════════════════════════════
 * LA CONSECUENCIA DE ENRUTADO — derivada del manifiesto y del árbol, no razonada
 * ═════════════════════════════════════════════════════════════════════════ */
let emitidas = null;
let porQueNoHayManifiesto = null;
try {
  emitidas = new Set(rutasEmitidas(leeManifiesto()));
} catch (e) {
  porQueNoHayManifiesto = String(e.message || e).slice(0, 200);
}
const aLocal = (u) => u.replace(/^\/es/, "").replace(/\/$/, "") || "/";
const emitidasDeTerminos = emitidas
  ? terminos.filter((t) => emitidas.has(aLocal(t.url))).map((t) => aLocal(t.url))
  : null;

/** Quién LEE la jerarquía hoy en el clon. Se deriva del árbol (§sondas 3bis). */
const APP_SRC = rel("apps/web/src");
const consumidores = [];
const barre = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) barre(p);
    else if (/\.tsx?$/.test(e.name)) {
      const s = readFileSync(p, "utf8");
      const lineas = s.split("\n");
      lineas.forEach((l, i) => {
        if (/recursos\/articulos/.test(l) || /categorias-recursos/.test(l))
          consumidores.push({ fichero: p.slice(RAIZ.length + 1).replace(/\\/g, "/"), linea: i + 1, texto: l.trim().slice(0, 140) });
      });
    }
  }
};
barre(APP_SRC);
const cableados = consumidores.filter((c) => /recursos\/articulos/.test(c.texto));

/* ══════════════════════════════════════════════════════════════════════════
 * LA CONSECUENCIA YA COBRADA — el padre cableado NO es un riesgo futuro
 *
 * Las 149 entradas de blog del corpus declaran su término de `resources` en la
 * MISMA miga, y con ella su cadena entera. Contarlas por FORMA de cadena separa
 * las dos poblaciones que el prefijo cableado confunde:
 *
 *   · `…/recursos/articulos/<hija>/`  → el término es HIJA  ⇒ el cableado acierta
 *   · `…/recursos/<término>/`         → el término es de PRIMER NIVEL ⇒ falla
 *
 * `extractor-a.mjs` busca los términos por el prefijo literal
 * `recursos/articulos`, así que las de la segunda forma pierden su `recurso` y
 * caen en `/blog`. No es una hipótesis sobre lo que pasaría: es lo que el
 * árbol hace hoy, y el recuento lo dice con nombres.
 * ═════════════════════════════════════════════════════════════════════════ */
const DIR_BLOG = rel("corpus/entradas-blog");
const entradas = { total: 0, soloBlog: 0, bajoHija: 0, bajoPrimerNivel: [], sinMiga: 0 };
if (existsSync(DIR_BLOG)) {
  for (const f of readdirSync(DIR_BLOG).filter((n) => n.endsWith(".html"))) {
    entradas.total++;
    const miga = migaDe(readFileSync(join(DIR_BLOG, f), "utf8"));
    if (!miga) {
      entradas.sinMiga++;
      continue;
    }
    const hrefs = miga.map((li) => li.href).filter(Boolean);
    const bajoRecursos = hrefs.filter((h) => h.startsWith("/es/recursos/"));
    if (!bajoRecursos.length) entradas.soloBlog++;
    else if (bajoRecursos.some((h) => h.startsWith("/es/recursos/articulos/"))) entradas.bajoHija++;
    else
      entradas.bajoPrimerNivel.push({
        slug: f.replace(/\.html$/, ""),
        termino: bajoRecursos[bajoRecursos.length - 1].replace(/\/$/, "").split("/").pop(),
      });
  }
}
/* El prefijo cableado sale del extractor, no de aquí: se lee de su código. */
const FUENTE_EXTRACTOR = rel("scripts/seed/extractor-a.mjs");
const prefijoCableado = existsSync(FUENTE_EXTRACTOR)
  ? (readFileSync(FUENTE_EXTRACTOR, "utf8").match(/terminosDe\(\s*sin\s*,\s*"([^"]+)"\s*\)/) || [, null])[1]
  : null;

const salida = {
  meta: {
    fecha: hoy(),
    que: "La FORMA de la jerarquía de términos, medida por tres vías sobre el corpus congelado, y cruzada con lo que el esquema declara.",
    alcance:
      `${TAXONOMIAS.length} taxonomías · ${universo.length} términos ` +
      `(${modeladas.length} de taxonomía MODELADA · ${sinModelar.length} sin modelar) · corpus congelado (sin red, sin clon)`,
    coberturaDeArchivos: {
      modeladas: `${terminos.filter((t) => t.coleccion && t.capturado).length}/${modeladas.length}`,
      sinModelar: `${terminos.filter((t) => !t.coleccion && t.capturado).length}/${sinModelar.length}`,
      sinArchivo: terminos.filter((t) => !t.capturado).map((t) => t.url),
    },
    fuentes: TAXONOMIAS.map((t) => ({ taxonomia: t.tax, tipo: t.fuente.tipo, ruta: t.fuente.ruta })),
    noMide: "geometría, el clon, ni el original en vivo",
    sabotaje: SABOTAJE,
  },
  vias: casos,
  via4Contraste: {
    queSepara: "«archivo de término» de «página», en el MISMO directorio del original",
    terminosConCuerpoDeArchivo: `${casos.cuerpoArchivo}/${terminos.filter((t) => t.capturado).length}`,
    vecinosLeidos: contrasteLeido.length,
    vecinosQueSonPAGINA: contrastePagina.length,
    /* Se dice el reparto porque «4» y «3 hermanos» no son el mismo conjunto y
     * el acta cita el segundo: la lista trae `/es/recursos/` —el PADRE, que es
     * `page-parent`— más sus 3 hijas `page-child`. */
    reparto: "1 `page-parent` (`/es/recursos/`) + 3 `page-child` (kunakpedia · documentos-cientificos · preguntas-frecuentes)",
    detalle: contraste,
  },
  forma: {
    profundidadMaxima: profundidad,
    terminosConPadre: conPadre.length,
    padresDistintos: padres,
    terminosConMasDeUnPadre: conDosPadres.map((t) => t.url),
    tercerNivel: tercerNivel.map((t) => t.url),
    dosSegmentosPorUrl: casos.dosSegmentos,
  },
  porTaxonomia: [...porTaxonomia.values()],
  modeloDeRuta: {
    hipotesis: "ruta(t) = <prefijo> + [padre.slug si lo hay] + t.slug",
    acierta: aciertaH.length,
    de: evaluables.length,
    falla: fallaH.map((t) => ({ url: t.url, predicho: predice(t) })),
    separadores: separadores.map((t) => t.url),
    porQueImportanLosSeparadores:
      "en las hijas, derivar y cablear dan la MISMA salida; sólo un término de primer nivel de una taxonomía jerárquica los separa",
  },
  direccionB: { cruce, sobreGeneralizadas, sinExpresar },
  enrutado: {
    rutasEmitidasTotal: emitidas ? emitidas.size : null,
    porQueNoHayManifiesto,
    rutasDeTerminosEmitidasHoy: emitidasDeTerminos,
    consumidoresDeLaJerarquiaEnElClon: consumidores,
    consumidoresCONELPADRECABLEADO: cableados,
    consecuenciaYaCobrada: {
      denominador: `${entradas.total} entradas de blog del corpus`,
      soloBlog: entradas.soloBlog,
      bajoHijaDeArticulos: entradas.bajoHija,
      bajoTerminoDePRIMERNIVEL: entradas.bajoPrimerNivel,
      sinMiga: entradas.sinMiga,
      prefijoCableadoEnElExtractor: prefijoCableado,
      queSignifica:
        "las entradas cuyo término de `resources` es de PRIMER NIVEL no casan con el prefijo literal del extractor, " +
        "así que pierden su `recurso` y caen en /blog: el padre cableado ya está produciendo dato equivocado",
    },
  },
  terminos,
};
w("medidas/lh-jerarquia.json", salida);

/* ══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO — qué es fallo aquí
 *
 * Esta sonda no compara clon contra original: ESTABLECE UNA FORMA. Falla cuando
 * la forma no se puede establecer, no cuando el número sale incómodo.
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ LA FORMA DE LA JERARQUÍA ════════`);
console.log(`  alcance: ${salida.meta.alcance}`);
console.log(
  `  vías vivas, cada una con SU denominador: ` +
    `miga ${casos.miga}/${universo.length} · padre-en-miga ${casos.padreEnMiga}/${casos.miga} · ` +
    `chips ${casos.chips}/${casos.miga} · url-de-2-segmentos ${casos.dosSegmentos}/${universo.length}\n`,
);

console.log(`  ── por taxonomía ──`);
for (const r of porTaxonomia.values())
  console.log(
    `   ${r.taxonomia.padEnd(20)} ${String(r.terminos).padStart(3)} términos · ${String(r.capturados).padStart(3)} capturados · ` +
      `${String(r.conPadre).padStart(2)} con padre · profundidad ${r.profundidad}`,
  );

console.log(`\n  ── vía 4: «¿término o página?», y su CONTRASTE ──`);
console.log(`   términos con <body class="archive …">  ${casos.cuerpoArchivo}/${terminos.filter((t) => t.capturado).length}`);
console.log(
  `   vecinos bajo /recursos/ que son PÁGINA  ${contrastePagina.length}/${contrasteLeido.length}  (el padre \`page-parent\` + sus 3 \`page-child\`)`,
);
for (const c of contraste)
  console.log(`     · ${c.url.padEnd(40)} ${c.capturado ? (c.esArchivo ? "archive" : c.esPagina ? "page" : "(ninguno)") : "SIN CAPTURA"}`);

console.log(`\n  ── la forma ──`);
console.log(`   profundidad máxima ......... ${profundidad}`);
console.log(`   términos con padre ......... ${conPadre.length} de ${evaluables.length} capturados`);
console.log(`   padres distintos ........... ${padres.length}${padres.length ? ` (${padres.join(", ")})` : ""}`);
console.log(`   con MÁS DE UN padre ........ ${conDosPadres.length}`);
console.log(`   tercer nivel ............... ${tercerNivel.length}`);

console.log(`\n  ── el modelo de ruta ──`);
console.log(`   H acierta .................. ${aciertaH.length}/${evaluables.length}`);
console.log(`   los que SEPARAN los modelos  ${separadores.length}${separadores.length ? ` (${separadores.map((t) => t.url).join(", ")})` : ""}`);

console.log(`\n  ── dirección (b): el esquema contra el original ──`);
for (const c of cruce) console.log(`   ${c.taxonomia.padEnd(20)} esquema ${c.esquemaLoDeclara ? "SÍ" : "no"} · original ${c.originalLoProduce ? "SÍ" : "no"}  → ${c.celda}`);

console.log(`\n  ── el enrutado, hoy ──`);
console.log(`   rutas emitidas por el build  ${emitidas ? emitidas.size : `— (${porQueNoHayManifiesto})`}`);
console.log(`   de esos términos ........... ${emitidasDeTerminos ? emitidasDeTerminos.length : "—"}`);
console.log(`   quien LEE la jerarquía ..... ${consumidores.length} línea(s), de las que ${cableados.length} tienen el padre CABLEADO`);
for (const c of cableados) console.log(`     · ${c.fichero}:${c.linea}  ${c.texto}`);
console.log(
  `\n  ── la consecuencia YA COBRADA (${entradas.total} entradas de blog del corpus) ──\n` +
    `   sólo /blog ................. ${entradas.soloBlog}\n` +
    `   bajo HIJA de 'articulos' ... ${entradas.bajoHija}  → el prefijo cableado acierta\n` +
    `   bajo término de 1.er NIVEL . ${entradas.bajoPrimerNivel.length}  → el prefijo cableado ('${prefijoCableado}') NO casa y pierden su 'recurso'`,
);
for (const e of entradas.bajoPrimerNivel) console.log(`     · ${e.slug}  (recurso = ${e.termino})`);

let codigo = 0;
const sinArchivo = terminos.filter((t) => !t.capturado);
const modeladasSinLeer = sinArchivo.filter((t) => t.coleccion);
if (modeladasSinLeer.length) {
  console.log(
    `\n⛔ ${modeladasSinLeer.length} término(s) de taxonomía MODELADA sin archivo en el corpus:\n` +
      modeladasSinLeer.map((t) => `     · ${t.url}`).join("\n") +
      `\n   La celda del cruce (b) que les toca no se ha mirado, y un cruce con celdas\n` +
      `   sin mirar se lee como un cruce completo.`,
  );
  codigo = 2;
} else if (!conPadre.length) {
  console.log(
    `\n⛔ 0 términos con padre en ${evaluables.length} capturados.\n` +
      `   O el sitio cambió, o la vía 2 dejó de casar. En los dos casos la afirmación\n` +
      `   de esta sonda deja de valer, y «no hay jerarquía» sería el cero más caro posible.`,
  );
  codigo = 2;
} else if (!separadores.length) {
  console.log(
    `\n⛔ NINGÚN término separa los dos modelos de ruta.\n` +
      `   Con sólo hijas delante, «derivar de la jerarquía» y «cablear el segmento» dan\n` +
      `   la misma salida, y elegir uno nombraría una variable AL AZAR (§DOS VARIABLES\n` +
      `   CONFUNDIDAS). El modelo queda SIN PROBAR, no probado.`,
  );
  codigo = 2;
} else if (!contrastePagina.length) {
  console.log(
    `\n⛔ La vía 4 no SEPARA: 0 de ${contrasteLeido.length} vecinos bajo /recursos/ salen como PÁGINA.\n` +
      `   Un token que casa en todo lo que mira no es un discriminador — y la pregunta\n` +
      `   «¿archivo de término o página propia?» se estaría contestando con un pleno.`,
  );
  codigo = 2;
} else if (casos.cuerpoArchivo !== terminos.filter((t) => t.capturado).length) {
  console.log(
    `\n⛔ ${terminos.filter((t) => t.capturado).length - casos.cuerpoArchivo} término(s) leídos SIN <body class="archive">.\n` +
      `   O el censo metió algo que no es un término, o la vía 4 dejó de casar. En los dos\n` +
      `   casos el cruce (b) estaría clasificando páginas como taxonomía.`,
  );
  codigo = 2;
} else if (fallaH.length) {
  console.log(
    `\n⛔ El modelo derivado FALLA en ${fallaH.length} de ${evaluables.length}:\n` +
      fallaH.map((t) => `     ${t.url}  ≠  ${predice(t)}`).join("\n") +
      `\n   La ruta no se deriva de la jerarquía sola: hace falta un campo más, y hay que decir cuál.`,
  );
  codigo = 2;
} else {
  console.log(
    `\n✅ FORMA ESTABLECIDA · profundidad ${profundidad} · ${padres.length} padre(s) · 0 con dos padres · 0 tercer nivel.\n` +
      `   El modelo derivado acierta ${aciertaH.length}/${evaluables.length}, y ${separadores.length} término(s) de primer nivel\n` +
      `   lo separan del cableado — o sea que la elección está MEDIDA, no elegida.`,
  );
  if (sobreGeneralizadas.length)
    console.log(`   ⚠ dirección (b): ${sobreGeneralizadas.length} taxonomía(s) SOBRE-GENERALIZADA(S) — ver la congelada.`);
  if (sinExpresar.length)
    console.log(`   ⚠ dirección (b): ${sinExpresar.length} con jerarquía que el esquema NO expresa — ver la congelada.`);
}

/* La cobertura de archivos se dice SIEMPRE, verde o rojo: es la mitad del
 * alcance que un «✅ forma establecida» absorbería sin contradecirlo. */
if (sinArchivo.length)
  console.log(
    `\n  ⚠ ${sinArchivo.length} término(s) SIN ARCHIVO en el corpus:\n` +
      sinArchivo.map((t) => `     · ${t.url}  (${t.coleccion ? "MODELADA" : "sin modelar"})`).join("\n") +
      `\n     Para 'sector' la lectura «plana» descansa en la vía 1 (URL: ${sinModelar.length}/${sinModelar.length} de un\n` +
      `     segmento) y en la vía 2 (miga: ${sinModelar.length - sinArchivo.length}/${sinModelar.length}). No es «se comprobó»: es esa fracción.`,
  );

codigo = Math.max(codigo, ev.informe() ? 1 : 0);
process.exit(codigo);
