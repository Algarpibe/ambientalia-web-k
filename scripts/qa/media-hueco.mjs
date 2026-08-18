/**
 * ¿EL «ANCHO PEDIDO» ES PLANTILLA O ES CAMPO? — la frontera que abrió el PASO 1.
 * Uso: npm run qa:media-hueco          (SABOTAJE=… → test en negativo)
 *
 * ── La pregunta, y por qué NO empieza por modelar ─────────────────────────
 * `media-srcset` dejó medido que **39 de 519 orígenes se sirven con `srcset`
 * distinto según el punto de uso**, y que la lista *se topa en el ancho pedido y
 * siempre incluye el fichero pedido*. De ahí sale la tentación de modelar el
 * ancho pedido como un campo — con el precedente de `anchoPct`, que es
 * exactamente eso: un valor de presentación por punto de uso, medido y ya en el
 * esquema.
 *
 * **La pregunta correcta no es cómo modelarlo, es si hay que modelarlo**, y
 * `CLAUDE.md` la contesta con dos tests. Esta sonda los aplica; no decide antes.
 *
 * ── PRIMERO EL RÉGIMEN, que es lo que decide CÓMO se leen los tests ────────
 * Se deriva del `<body>` de cada página capturada, no se supone:
 *
 *   · `et-tb-has-body` ⇒ **PLANTILLADO**. Ahí **no existe la persona que editó
 *     ESTA página**: una plantilla renderiza 149 entradas. El discriminador que
 *     vale es **la varianza ENTRE INSTANCIAS**: cero varianza dentro de la misma
 *     forma = **plantilla**;
 *   · `et_pb_pagebuilder_layout` ⇒ **BUILDER**: hay una persona que compuso esta
 *     página, y lo que varía de un módulo a otro es suyo;
 *   · **ninguno de los dos** (casos · faqs) ⇒ plantilla clásica del tema, sin
 *     builder. Se declara como lo que es —**SIN MARCADOR**— y no se mete a
 *     calzador en uno de los dos: es un tercer estado del dato, no una lectura.
 *
 * ⚠ **El test A (los dos anchos de Divi) NO se aplica aquí, y callarlo sería el
 * error:** su propio alcance dice que vale para el **RITMO** —`margin`/`padding`
 * de sección, fila y módulo— y **no para la caja ni para la tipografía**. El
 * ancho pedido no es ritmo: es qué fichero se solicita. Aplicárselo daría la
 * respuesta invertida, que es justo lo que ese alcance advierte.
 *
 * ── ⚠ QUÉ SE MIDE: LA CAJA PEDIDA, NO EL ANCHO RESULTANTE ─────────────────
 * **La primera corrida de esta sonda midió lo que no era, y el dato la delató.**
 * Midió el `width` renderizado y sacó *«86 grupos del cascarón con anchos
 * distintos»* ⇒ veredicto CAMPO. Falso: dentro del MISMO hueco salían
 * `1024w` y `900w` **con la misma clase `size-large`**, y `size-full` daba
 * `960 · 1280 · 1920 · 2560`.
 *
 * > **`large` es una CAJA (1024×1024) y WordPress no amplía.** El ancho
 * > renderizado es `min(caja del hueco, ancho NATIVO de la imagen)`, así que
 * > mide **dos poblaciones a la vez** — lo que pide el hueco y lo que mide el
 * > fichero— y la segunda no la decidió nadie.
 *
 * Es **el mismo error que `media-srcset` §1 ya tenía documentado** —*«los anchos
 * irregulares del grep son la anchura NATIVA de cada imagen, no tamaños»*—
 * cometido un nivel más arriba. Por eso la magnitud medida es **la caja
 * pedida** (`size-<nombre>`, o el fichero nativo = `full`), y el ancho
 * resultante se queda como sabotaje: `ancho-en-px` reproduce el defecto y el
 * veredicto **voltea**.
 *
 * ── Cómo se evita la circularidad ─────────────────────────────────────────
 * Para cada `<img>` con `srcset` de las 309 páginas congeladas:
 *
 *   · **el HUECO** — el módulo ancestro, por recorrido de PILA de etiquetas (no
 *     por una ventana de N caracteres hacia atrás, que dejaba 1 074 de 1 719
 *     «sin módulo»). Se deriva **SÓLO de los ancestros**;
 *   · **la CAJA PEDIDA** — de la propia `<img>`. Es la MAGNITUD, no el hueco;
 *   · **la ZONA** — dentro del CONTENEDOR DE CONTENIDO (CUERPO) o fuera
 *     (CASCARÓN). Y el contenedor **no es el mismo en los dos regímenes**, que
 *     es lo que la primera versión daba por hecho:
 *
 *       · **PLANTILLADO** → `et_pb_post_content`, con el mismo `postContent()`
 *         que usa el extractor (dos definiciones serían la clase C7);
 *       · **BUILDER** → el módulo de texto (`et_pb_text_inner`), que es el
 *         `wp_editor` de Divi. Una página de builder **no tiene
 *         `post_content`**, así que buscar sólo ése deja al builder **sin
 *         contenedor de contenido** — y entonces el HTML que escribió una
 *         persona se cuenta como cascarón.
 *
 *     Medido: los 6 pares que «varían en el cascarón» eran las fichas de
 *     accesorio escritas a mano dentro de un `et_pb_text_inner` de `productos`.
 *     No es mover la portería: es que la frontera de `CLAUDE.md` —*«hasta el
 *     contenedor de contenido»*— hay que localizarla **en cada régimen**.
 *
 * > ⚠ **El identificador de hueco NO puede mirar los atributos de la propia
 * > `<img>`.** Si los mirara, «la caja pedida es función del hueco» sería verdad
 * > **por construcción** y la sonda contestaría siempre que sí. Cada observación
 * > lleva su `fuente`, y la sonda **exige** que todas sean `ancestros`: un
 * > identificador circular sale por ERROR, no por verde.
 *
 * ── Y LA OTRA MITAD, que sin ella la conclusión no vale ───────────────────
 * Si la caja pedida resulta ser del hueco por encima del contenedor de
 * contenido, por DEBAJO sigue viviendo dentro del campo rico. Que «viaje
 * verbatim» **no se supone: se aplica T1–T8 sobre los cuerpos y se comprueba
 * atributo a atributo** (regla 3 —documentado no es conectado— y D4 —una clase
 * puede estar servida y ser INERTE—).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { enApp, Evaluadas, QA, w } from "./lib.mjs";
import { postContent } from "../seed/corpus.mjs";
import { TRANSFORMACIONES } from "../seed/transformaciones.mjs";
import { mediaPublicada } from "../seed/media-publicada.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const PAGINAS = Object.entries(INDICE.paginas);

/* ── sabotajes: cada uno tiene que caer por SU invariante ────────────────── */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "selector-muerto": "las <img> se buscan por un atributo que no existe → patrón MUERTO (regla 4, el cero)",
  "hueco-ubicuo": "todo cae en UN solo hueco → la varianza deja de estar explicada y el veredicto VOLTEA a campo",
  "hueco-circular": "el hueco incluye la caja pedida → «es función del hueco» sería verdad POR CONSTRUCCIÓN",
  "ancho-en-px": "se mide el ancho RENDERIZADO en vez de la caja pedida → se mezcla el ancho nativo de la imagen (el defecto real de la 1.ª corrida)",
  "sin-zona": "cuerpo y cascarón se cuentan juntos → las excepciones del cuerpo se le imputan al CASCARÓN",
  "transformacion-agresiva": "una T que borra `srcset` → la supervivencia verbatim del campo rico deja de cumplirse",
  control: "ningún sabotaje: la sonda tiene que salir LIMPIA",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ── utilidades compartidas con `media-srcset` (mismo contrato de nombres) ── */
const soloMarcado = (h) =>
  h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
const RE_VARIANTE = /-(\d+)x(\d+)(?=\.[A-Za-z0-9]+$)/;
const origenDe = (url) => url.split("?")[0].replace(RE_VARIANTE, "");
const corto = (u) => u.replace("https://kunakair.com/wp-content/uploads/", "");

/** Etiquetas vacías: no abren nivel en la pila (o el árbol sale torcido). */
const VACIAS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "base", "col", "embed", "param", "track", "wbr"]);
const RE_TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
const attr = (a, n) => new RegExp(`\\b${n}\\s*=\\s*"([^"]*)"`, "i").exec(a)?.[1] ?? null;

/**
 * El hueco, DESDE LOS ANCESTROS. Primero el módulo de Divi —que es la unidad
 * que el theme builder repite instancia tras instancia—; si no hay ninguno
 * (`casos`/`faqs` no llevan builder), el ancestro con clase más cercano, que es
 * lo que hace de módulo en esa plantilla.
 */
function huecoDe(pila) {
  for (let i = pila.length - 1; i >= 0; i--) {
    const m = /\bet_pb_([a-z_]+?)_\d+(_tb_(?:body|header|footer))?\b/.exec(pila[i].cls);
    if (m) return `et_pb_${m[1]}${m[2] ?? ""}`;
  }
  for (let i = pila.length - 1; i >= 0; i--) {
    const c = pila[i].cls.trim();
    if (c) return `[${pila[i].tag}.${c.split(/\s+/).slice(0, 2).join(".")}]`;
  }
  return "(raíz)";
}

/**
 * LA CAJA PEDIDA — la magnitud. WordPress la nombra en la clase de la `<img>`
 * (`size-large`, `size-full`, `size-medium`, `size-post-thumbnail`); el módulo
 * de imagen de Divi no pone clase y sirve **el fichero nativo**, que es `full`.
 * Si el `src` es una variante sin nombre de tamaño, la caja se nombra por su
 * forma —no se inventa un nombre ni se deja en `null` (regla 6).
 */
function cajaDe(atrs, src) {
  const cls = attr(atrs, "class") ?? "";
  const s = /\bsize-([a-z0-9_-]+)/i.exec(cls)?.[1];
  if (s) return s.toLowerCase();
  const vm = src.split("?")[0].match(RE_VARIANTE);
  return vm ? `caja${vm[1]}x${vm[2]}` : "full";
}

/**
 * El tramo INTERIOR de un `<div>` que abre en `desde`, equilibrando anidados.
 * Se cuenta con una pila de `<div>`, no con el primer `</div>` que aparezca: el
 * contenido de un módulo de texto trae `<div>` dentro (`accesorio-container`),
 * y cortar en el primer cierre dejaría fuera justo las imágenes que se miden.
 */
function interiorDe(html, desde) {
  const ini = html.indexOf(">", desde);
  if (ini < 0) return null;
  const RE = /<(\/?)div\b[^>]*>/gi;
  RE.lastIndex = ini + 1;
  let nivel = 1, m;
  while ((m = RE.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return { ini: ini + 1, fin: m.index };
  }
  return null; // sin cierre: no se inventa un tramo (regla 6)
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL RÉGIMEN, derivado del <body> — antes de aplicar ningún test
 * 2 · las observaciones
 * ═════════════════════════════════════════════════════════════════════════ */
const regimen = new Map();
const obs = [];
const huecos = new Map();
const cajas = new Map();
/** qué contenedor de contenido absorbió cada observación de CUERPO */
const porContenedor = new Map();
const ev = new Evaluadas({ unidad: "páginas del corpus", minimo: PAGINAS.length, nombre: "media-hueco" });

for (const [clave, meta] of PAGINAS) {
  const coleccion = clave.split("/")[0];
  const crudo = readFileSync(join(CORPUS, meta.fichero), "utf8");
  const html = soloMarcado(crudo);

  const clsBody = /<body\b[^>]*class="([^"]*)"/i.exec(crudo)?.[1] ?? "";
  const pb = /et_pb_pagebuilder_layout/.test(clsBody);
  const tb = /et-tb-has-body/.test(clsBody);
  const reg = pb && tb ? "HÍBRIDO" : pb ? "BUILDER" : tb ? "PLANTILLADO" : "SIN MARCADOR";
  const r = regimen.get(coleccion) ?? {};
  r[reg] = (r[reg] ?? 0) + 1;
  regimen.set(coleccion, r);

  /* LOS CONTENEDORES DE CONTENIDO de ESTA página, cada uno con su tramo. En
   * plantillado hay uno (`post_content`); en builder, tantos como módulos de
   * texto. La zona se decide por pertenencia a alguno de ellos. */
  const cuerpo = postContent(html);
  const contenedores = [];
  if (cuerpo) {
    const i = html.indexOf(cuerpo);
    if (i >= 0) contenedores.push({ tipo: "post_content", ini: i, fin: i + cuerpo.length });
  }
  for (const t of html.matchAll(/<div\b[^>]*\bclass="[^"]*\bet_pb_text_inner\b[^"]*"[^>]*>/gi)) {
    const dentro = interiorDe(html, t.index);
    if (dentro) contenedores.push({ tipo: "et_pb_text_inner", ...dentro });
  }

  const pila = [];
  let m;
  RE_TAG.lastIndex = 0;
  while ((m = RE_TAG.exec(html))) {
    const [, cierre, bruto, atrs] = m;
    const tag = bruto.toLowerCase();
    if (cierre) {
      for (let i = pila.length - 1; i >= 0; i--) if (pila[i].tag === tag) { pila.length = i; break; }
      continue;
    }
    const cls = attr(atrs, "class") ?? "";
    // ⚠ SABOTAJE `selector-muerto`: el atributo por el que se reconoce una
    // imagen responsive se busca con un nombre que no existe. Sin la guarda del
    // censo, «0 imágenes» se leería como «esta propiedad no varía».
    const nombreAttr = SABOTAJE === "selector-muerto" ? "srcsets" : "srcset";
    if (tag === "img" && new RegExp(`\\b${nombreAttr}\\s*=`).test(atrs)) {
      const src = attr(atrs, "src") ?? "";

      // LA MAGNITUD. ⚠ SABOTAJE `ancho-en-px`: el ancho RENDERIZADO, que mezcla
      // la caja del hueco con la anchura nativa del fichero. Es el defecto real
      // de la primera corrida, conservado como sabotaje.
      const wAttr = attr(atrs, "width");
      const vm = src.split("?")[0].match(RE_VARIANTE);
      const anchoPx = wAttr && /^\d+$/.test(wAttr) ? Number(wAttr) : vm ? Number(vm[1]) : null;
      const caja = SABOTAJE === "ancho-en-px" ? `${anchoPx}px` : cajaDe(atrs, src);

      // ⚠ SABOTAJE `sin-zona`: todo pasa a contar como CASCARÓN.
      const cont = contenedores.find((c) => m.index > c.ini && m.index < c.fin);
      const zona = SABOTAJE === "sin-zona" ? "cascaron" : cont ? "cuerpo" : "cascaron";
      if (cont && SABOTAJE !== "sin-zona") porContenedor.set(cont.tipo, (porContenedor.get(cont.tipo) ?? 0) + 1);

      // ⚠ SABOTAJE `hueco-ubicuo`: un solo hueco para todo (regla 4, el pleno).
      // ⚠ SABOTAJE `hueco-circular`: el hueco mira un atributo de la PROPIA
      //    <img>. Entonces «la caja es función del hueco» es verdad por
      //    construcción — y `fuente` deja de ser `ancestros`, que es lo que la
      //    guarda de abajo exige.
      let hueco, fuente;
      if (SABOTAJE === "hueco-ubicuo") { hueco = "(todo)"; fuente = "ancestros"; }
      else if (SABOTAJE === "hueco-circular") { hueco = `${huecoDe(pila)}@${caja}`; fuente = "ancestros+atributo propio"; }
      else { hueco = huecoDe(pila); fuente = "ancestros"; }

      obs.push({ pagina: clave, coleccion, regimen: reg, zona, hueco, fuente, caja, anchoPx, origen: origenDe(src) });
      huecos.set(hueco, (huecos.get(hueco) ?? 0) + 1);
      cajas.set(caja, (cajas.get(caja) ?? 0) + 1);
      continue;
    }
    if (!VACIAS.has(tag) && !atrs.trimEnd().endsWith("/")) pila.push({ tag, cls });
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * LAS GUARDAS DE LA REGLA 4 — antes de mirar un solo resultado
 * ═════════════════════════════════════════════════════════════════════════ */
const errores = [];
if (obs.length === 0)
  errores.push(
    `PATRÓN MUERTO — 0 <img> con el atributo responsive en las ${PAGINAS.length} páginas.\n` +
      `   Un patrón que no encuentra nada y uno que no mira nada dan la misma salida:\n` +
      `   esto NO es «la caja pedida no varía», es que no se ha mirado.`,
  );
if (huecos.size === 1 && obs.length > 1)
  errores.push(
    `IDENTIFICADOR UBICUO — las ${obs.length} observaciones caen en UN solo hueco.\n` +
      `   Un identificador que casa en todas no discrimina: no puede explicar nada.`,
  );
const circulares = obs.filter((o) => o.fuente !== "ancestros");
if (circulares.length)
  errores.push(
    `IDENTIFICADOR CIRCULAR — ${circulares.length} observación(es) con el hueco derivado de\n` +
      `   «${circulares[0].fuente}». El hueco SOLO puede salir de los ancestros: si mira un\n` +
      `   atributo de la propia <img>, «la caja es función del hueco» es verdad POR\n` +
      `   CONSTRUCCIÓN y la sonda contesta que sí siempre.`,
  );

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · EL TEST QUE VALE EN PLANTILLADO — la varianza ENTRE INSTANCIAS
 *
 * Unidad: el PAR (zona · hueco · origen). Si un par trae dos cajas pedidas, dos
 * instancias del mismo hueco pidieron cosas distintas ⇒ lo escribió alguien ⇒
 * CAMPO. Si no, la caja la fija el hueco ⇒ PLANTILLA.
 * ═════════════════════════════════════════════════════════════════════════ */
const pares = new Map();
for (const o of obs) {
  const k = `${o.zona}␟${o.hueco}␟${o.origen}`;
  if (!pares.has(k)) pares.set(k, { zona: o.zona, hueco: o.hueco, origen: o.origen, cajas: new Map(), paginas: new Set() });
  const p = pares.get(k);
  p.cajas.set(o.caja, (p.cajas.get(o.caja) ?? 0) + 1);
  p.paginas.add(o.pagina);
}
const varian = [...pares.values()].filter((p) => p.cajas.size > 1);
const varianCascaron = varian.filter((p) => p.zona === "cascaron");
const varianCuerpo = varian.filter((p) => p.zona === "cuerpo");
const paresCascaron = [...pares.values()].filter((p) => p.zona === "cascaron").length;
const paresCuerpo = [...pares.values()].filter((p) => p.zona === "cuerpo").length;

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL TEST B — la varianza INTRA-PÁGINA (sin restricción de alcance)
 *
 * ¿Dos hermanos del MISMO hueco, en la MISMA página, piden cajas distintas? Es
 * el test general de `CLAUDE.md`, y es el que hizo campo a `anchoPct`.
 * ═════════════════════════════════════════════════════════════════════════ */
const hermanos = new Map();
for (const o of obs) {
  const k = `${o.pagina}␟${o.zona}␟${o.hueco}`;
  if (!hermanos.has(k)) hermanos.set(k, { pagina: o.pagina, zona: o.zona, hueco: o.hueco, cajas: new Set() });
  hermanos.get(k).cajas.add(o.caja);
}
const hermanosVarian = [...hermanos.values()].filter((h) => h.cajas.size > 1);
const hermanosCascaron = hermanosVarian.filter((h) => h.zona === "cascaron");
const hermanosCuerpo = hermanosVarian.filter((h) => h.zona === "cuerpo");

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · LA OTRA MITAD — ¿el `srcset` del CUERPO sobrevive VERBATIM a T1–T8?
 *
 * Si sobrevive, la caja pedida del cuerpo **ya está almacenada** —dentro del
 * campo rico, carácter a carácter— y no necesita campo propio. Si no
 * sobreviviera, la conclusión de arriba no bastaría: habría que reponerla.
 *
 * Se APLICA la cadena real (`TRANSFORMACIONES`, la misma que el extractor), no
 * se lee su código: D4 —una clase puede estar en la salida y ser INERTE— y su
 * espejo, una transformación puede parecer inocua y llevarse un atributo.
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_IMG = /<img\b[^>]*>/gi;
const attrsDe = (html) =>
  [...html.matchAll(RE_IMG)].map((m) => ({
    srcset: attr(m[0], "srcset"),
    sizes: attr(m[0], "sizes"),
    width: attr(m[0], "width"),
    clase: attr(m[0], "class"),
    src: attr(m[0], "src"),
  }));

/** ⚠ SABOTAJE `transformacion-agresiva`: una T de más que borra el `srcset`. */
const T_AGRESIVA = { id: "T-SABOTAJE", aplica: (h) => ({ html: h.replace(/\s+srcset="[^"]*"/gi, ""), n: 0 }) };
const cadena = SABOTAJE === "transformacion-agresiva" ? [...TRANSFORMACIONES, T_AGRESIVA] : TRANSFORMACIONES;

/* Las rutas publicadas que T7 necesita, DERIVADAS igual que en el extractor
 * (manifest del build + el propio corpus) — no una segunda definición de «lo
 * mismo», que sería la clase C7. Con la regla del cero puesta: sin manifest no
 * hay conjunto, y 0 rutas darían un T7 que no ejercita nada. */
const manifest = enApp(".next/prerender-manifest.json");
if (!existsSync(manifest))
  throw new Error(
    "no hay `prerender-manifest.json`: sin build no hay conjunto de rutas publicadas para T7.\n" +
      "  0 rutas darían una cadena T1–T8 que no ejercita T7, y su «sobrevive» no significaría nada.",
  );
const rutas = new Set(Object.keys(JSON.parse(readFileSync(manifest, "utf8")).routes ?? {}));
for (const p of Object.values(INDICE.paginas)) {
  const camino = new URL(p.url).pathname.replace(/^\/es/, "").replace(/\/$/, "");
  rutas.add(camino === "" ? "/" : camino);
}

let cuerposConImg = 0, imgsAntes = 0, imgsDespues = 0, srcsetAntes = 0, srcsetSobreviven = 0;
const perdidos = [];
const scriptsQuitados = [];
/* El barrido de `apps/web/public`, una vez para las 312 páginas. Se exige no
 * vacío aquí y no sólo dentro de T10, porque un Set vacío haría que la cadena
 * corriera con T10 sin localizar nada — el verde falso de §regla 6. */
const MEDIA_PUBLICADA = mediaPublicada();
const mediaCaliente = [];
for (const [clave, meta] of PAGINAS) {
  const html = soloMarcado(readFileSync(join(CORPUS, meta.fichero), "utf8"));
  const cuerpo = postContent(html);
  if (!cuerpo) continue;
  const antes = attrsDe(cuerpo);
  if (!antes.length) continue;
  cuerposConImg++;
  let out = cuerpo;
  /* ⚠ `mediaPublicada` es OBLIGATORIO desde `6484953` (T10 lo exige con un
   * throw, §regla 6: la ausencia se rechaza en vez de sustituirse). El import
   * estaba desde entonces en la cabecera y el `ctx` NO lo llevaba: import
   * muerto, o sea §regla 3 —*documentado no es conectado*— con la llamada a
   * medias. La sonda reventaba entera y sus 7 casos del negativo salían todos
   * con exit 1, control incluido. Corregido 2026-08-18 (83.ª). */
  const ctx = { pagina: clave, rutas, scriptsQuitados, mediaPublicada: MEDIA_PUBLICADA, mediaCaliente };
  for (const t of cadena) out = t.aplica(out, ctx).html;
  const despues = attrsDe(out);
  imgsAntes += antes.length;
  imgsDespues += despues.length;
  /* La caja pedida se compone de `srcset` + `sizes` + `width` + la clase
   * `size-*`: se exige que las CUATRO lleguen idénticas, no sólo el `srcset`.
   * T3a descarta `wp-image-<id>` y `aligncenter` de esa misma clase, así que se
   * compara la marca de tamaño, no la cadena entera. */
  const marca = (c) => /\bsize-[a-z0-9_-]+/i.exec(c ?? "")?.[0]?.toLowerCase() ?? "(sin size-)";
  const setDespues = new Set(despues.map((d) => `${d.srcset}␟${d.sizes}␟${d.width}␟${marca(d.clase)}`));
  for (const a of antes) {
    if (a.srcset === null) continue;
    srcsetAntes++;
    if (setDespues.has(`${a.srcset}␟${a.sizes}␟${a.width}␟${marca(a.clase)}`)) srcsetSobreviven++;
    else if (perdidos.length < 6) perdidos.push({ pagina: clave, src: corto(a.src ?? ""), width: a.width, clase: a.clase });
  }
}
const sobreviveTodo = srcsetAntes > 0 && srcsetSobreviven === srcsetAntes && imgsAntes === imgsDespues;

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n═══ ¿EL «ANCHO PEDIDO» ES PLANTILLA O CAMPO? — ${PAGINAS.length} páginas congeladas ═══\n`);

console.log(`── 0 · RÉGIMEN, del <body> (antes de aplicar ningún test) ──────────`);
for (const [col, r] of regimen)
  console.log(`  ${col.padEnd(24)} ${Object.entries(r).map(([k, n]) => `${k}×${n}`).join(" · ")}`);
console.log(`  ⇒ en PLANTILLADO no existe «quien editó ESTA página»: el discriminador`);
console.log(`    es la VARIANZA ENTRE INSTANCIAS, no el px absoluto.`);
console.log(`  ⇒ el test A (los dos anchos de Divi) NO aplica: su alcance es el RITMO.`);

console.log(`\n── 1 · observaciones ───────────────────────────────────────────────`);
console.log(`  <img> con srcset ......... ${String(obs.length).padStart(5)}   (cuerpo ${obs.filter((o) => o.zona === "cuerpo").length} · cascarón ${obs.filter((o) => o.zona === "cascaron").length})`);
console.log(`  contenedor de contenido .. ${[...porContenedor].map(([t, n]) => `${t}×${n}`).join(" · ") || "(ninguno)"}`);
console.log(`  huecos distintos ......... ${String(huecos.size).padStart(5)}   (derivados SÓLO de los ancestros)`);
for (const [h, n] of [...huecos].sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(4)} × ${h}`);
console.log(`  cajas pedidas ............ ${String(cajas.size).padStart(5)}   ${[...cajas].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}×${n}`).join(" · ")}`);

console.log(`\n── 2 · TEST de la varianza ENTRE INSTANCIAS (el que vale en plantillado) ──`);
console.log(`  pares (zona × hueco × origen) ..... ${String(pares.size).padStart(5)}  (cascarón ${paresCascaron} · cuerpo ${paresCuerpo})`);
console.log(`  pares con MÁS DE UNA caja pedida .. ${String(varian.length).padStart(5)}  (cascarón ${varianCascaron.length} · cuerpo ${varianCuerpo.length})`);
for (const p of varian.slice(0, 8))
  console.log(`     ⚠ [${p.zona}] ${p.hueco} · ${corto(p.origen)} → ${[...p.cajas].map(([c, n]) => `${c}×${n}`).join(" ")}`);

console.log(`\n── 3 · TEST B · varianza INTRA-PÁGINA entre hermanos del mismo hueco ──`);
console.log(`  grupos (página × zona × hueco) .... ${String(hermanos.size).padStart(5)}`);
console.log(`  grupos con cajas DISTINTAS ........ ${String(hermanosVarian.length).padStart(5)}  (cascarón ${hermanosCascaron.length} · cuerpo ${hermanosCuerpo.length})`);
for (const h of hermanosVarian.slice(0, 4)) console.log(`     ⚠ [${h.zona}] ${h.pagina} · ${h.hueco} → ${[...h.cajas].join(" ")}`);

console.log(`\n── 4 · ¿sobrevive el srcset del CUERPO a T1–T8, VERBATIM? ──────────`);
console.log(`  cuerpos con <img> ${String(cuerposConImg).padStart(4)} · <img> ${imgsAntes} → ${imgsDespues}`);
console.log(`  srcset antes ${String(srcsetAntes).padStart(4)} · idénticos después (srcset+sizes+width+size-) ${srcsetSobreviven}`);
for (const p of perdidos) console.log(`     ⚠ perdido: ${p.pagina} · ${p.src} (width ${p.width} · class ${p.clase})`);

/* ── EL VEREDICTO ────────────────────────────────────────────────────────── */
const esDelHuecoEnCascaron = varianCascaron.length === 0 && hermanosCascaron.length === 0;
const veredicto = esDelHuecoEnCascaron
  ? sobreviveTodo
    ? "PLANTILLA por encima del contenedor · CAMPO RICO por debajo — NO ENTRA NADA EN EL ESQUEMA"
    : "PLANTILLA en el cascarón, pero el CUERPO no lo conserva: hay que reponerlo"
  : "CAMPO — la caja pedida varía entre instancias del mismo hueco del CASCARÓN";

console.log(`\n═══ VEREDICTO ═════════════════════════════════════════════════════`);
console.log(`  ¿la caja pedida es función del HUECO (cascarón)?   ${esDelHuecoEnCascaron ? "SÍ" : "NO"}   ${varianCascaron.length} par(es) y ${hermanosCascaron.length} grupo(s) que varían de ${paresCascaron}/${hermanos.size}`);
console.log(`  ¿el CUERPO lo conserva verbatim tras T1–T8?        ${sobreviveTodo ? "SÍ" : "NO"}   ${srcsetSobreviven}/${srcsetAntes}`);
console.log(`  ⇒ ${veredicto}`);
const varianPostContent = varianCuerpo.filter((p) => p.hueco === "et_pb_post_content_tb_body").length;
const varianTexto = varianCuerpo.length - varianPostContent;
if (esDelHuecoEnCascaron && sobreviveTodo) {
  console.log(
    `     Y las ${varian.length} excepciones caen TODAS por debajo del contenedor de contenido:\n` +
      `     ${varianPostContent} en \`post_content\` (plantillado) y ${varianTexto} en módulos de texto del BUILDER —\n` +
      `     o sea, donde el proyecto ya declara el contenido RICO. La caja pedida NO es\n` +
      `     un \`anchoPct\`: aquél varía entre módulos hermanos de la misma página y por eso\n` +
      `     es campo; ésta no varía ni entre instancias del cascarón, y donde varía ya\n` +
      `     viaja dentro del HTML del campo rico, carácter a carácter.`,
  );
  console.log(
    `\n  ⚠ ALCANCE de la mitad «viaja verbatim»: está MEDIDA sobre \`post_content\`\n` +
      `    (${srcsetSobreviven}/${srcsetAntes}), que es lo único que T1–T8 procesan hoy. Los ${varianTexto} pares del\n` +
      `    módulo de texto del builder quedan SIN esa medida porque su extracción no\n` +
      `    existe todavía (pendiente «extracción de builder»). Se dice, no se supone:\n` +
      `    el día que se escriba, esta sonda tiene que volver a salir verde.`,
  );
}

/* ── congelar ────────────────────────────────────────────────────────────── */
w("medidas/media-hueco.json", {
  meta: {
    fecha: INDICE.meta.fecha,
    fuente: `corpus/ (${PAGINAS.length} páginas congeladas, sha256 por página)`,
    pregunta: "¿el «ancho pedido» del srcset entra en el esquema como campo, o lo fija el hueco?",
    magnitud:
      "la CAJA PEDIDA (`size-<nombre>` o el fichero nativo = `full`), NO el ancho renderizado: " +
      "el renderizado es min(caja, ancho NATIVO de la imagen) y mezcla dos poblaciones (ver sabotaje `ancho-en-px`).",
    alcance:
      "las mismas 309 páginas de `media-srcset`. ⚠ NO incluye sectores ni monograficos " +
      "(fuera del corpus por construcción) — que son la población donde M-IMG está fichada.",
    testAaplicado: false,
    testAporQue:
      "el alcance declarado del test A es el RITMO (margin/padding de sección, fila y módulo). " +
      "El ancho pedido no es ritmo; aplicárselo daría la respuesta invertida.",
    sabotaje: SABOTAJE,
  },
  regimen: Object.fromEntries(regimen),
  totales: {
    observaciones: obs.length,
    cuerpo: obs.filter((o) => o.zona === "cuerpo").length,
    cascaron: obs.filter((o) => o.zona === "cascaron").length,
    huecos: huecos.size,
    porContenedor: Object.fromEntries(porContenedor),
  },
  huecos: Object.fromEntries([...huecos].sort((a, b) => b[1] - a[1])),
  cajas: Object.fromEntries([...cajas].sort((a, b) => b[1] - a[1])),
  entreInstancias: {
    pares: pares.size,
    paresCascaron,
    paresCuerpo,
    varian: varian.length,
    varianCascaron: varianCascaron.length,
    varianCuerpo: varianCuerpo.length,
    detalle: varian.map((p) => ({
      zona: p.zona,
      hueco: p.hueco,
      origen: corto(p.origen),
      cajas: Object.fromEntries(p.cajas),
      paginas: [...p.paginas],
    })),
  },
  intraPagina: {
    grupos: hermanos.size,
    varian: hermanosVarian.length,
    varianCascaron: hermanosCascaron.length,
    varianCuerpo: hermanosCuerpo.length,
    detalle: hermanosVarian.map((h) => ({ pagina: h.pagina, zona: h.zona, hueco: h.hueco, cajas: [...h.cajas] })),
  },
  supervivencia: {
    cuerposConImg,
    imgsAntes,
    imgsDespues,
    srcsetAntes,
    srcsetSobreviven,
    perdidos,
    alcance:
      "medida sobre `post_content`, que es lo único que T1–T8 procesan hoy. El módulo de texto " +
      "del BUILDER (productos) queda FUERA: su extracción no existe todavía (pendiente «extracción de builder»).",
  },
  veredicto: { esDelHuecoEnCascaron, sobreviveTodo, lectura: veredicto },
});

for (const e of errores) console.error(`\n❌ ${e}\n`);
process.exit(errores.length + ev.informe() ? 2 : 0);
