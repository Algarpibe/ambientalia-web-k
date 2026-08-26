/**
 * EXTRACTOR F3-3 — la cola larga: 31 páginas del corpus → documentos de `paginas`.
 * Uso: npm run cms:extractor-f33
 * Negativos:
 *   SABOTAJE=tipo-fantasma   → exit ≠0 (un tipo Divi sin bloque ⇒ TIRA, no se omite)
 *   SABOTAJE=sin-secciones   → exit ≠0 (0 secciones propias ⇒ parser roto, no «página vacía»)
 *   SABOTAJE=geometria       → exit ≠0 (escribir un 0 de ritmo ⇒ campo INVENTADO)
 *   SABOTAJE=arrasa          → exit ≠0 (retirar el MÓDULO en vez del CONTENEDOR)
 *   SABOTAJE=arrasa-control  → exit  0 (el mismo párrafo inyectado, SIN arrasar:
 *                              es lo que prueba que `arrasa` tiene separadora)
 *   SABOTAJE=t11             → exit ≠0 (sin la transformación de importación, el
 *                              `data-teams` llega al campo rico y lo bloquea)
 *   SABOTAJE=media-externa   → exit ≠0 (el asset alojado FUERA metido en `src`,
 *                              que es `upload → media` y sólo expresa lo local)
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 * `arbol-f33` (92.ª) DERIVÓ la forma: 11 tipos, 313 módulos, sección → fila →
 * columna → módulo. `f33-geo` (95.ª) derivó la geometría del ORIGINAL. El
 * esquema (`bloques/paginas.ts` + `colecciones/paginas.ts`) la expresa. Lo que
 * no existía es **el dato**: esto lo produce.
 *
 * ⚠ **NO abre el original.** Lee `corpus/fase-3/`, que está capturado con sus
 * hojas (32/32) y con su `sha256`.
 *
 * ── EL PARSER SE IMPORTA, NO SE REESCRIBE ────────────────────────────────
 * `parsea` · `seccionesPropias` · `modulosDe` · `tipoDe` · `esEstructura` salen
 * de `arbol-f33.mjs`, que es donde se derivaron **y donde su control cruzado
 * contra `mod-v4.log` los validó**. Un segundo tokenizador sería la clase C7:
 * dos definiciones de «los módulos de esta columna», y la que cuente distinto
 * no daría error — daría otro número (§*una definición, no dos*).
 *
 * Y por eso los recuentos de aquí tienen que CUADRAR con los suyos: 313 módulos
 * y 11 tipos. Si no cuadran, el que está mal es éste (§sondas 4: *cruzar con
 * otra medida del mismo objeto es obligatorio antes de creerse un recuento*).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA GEOMETRÍA NO SE ESCRIBE, Y ES LA REGLA QUE MÁS FÁCIL SE ROMPE AQUÍ
 *
 * El esquema declara `pt/pb/mt/mb` y `anchoPct` con la fuente **«SIN PROBAR —
 * 0 ejes COMPARADOS en las 31»**, y `medida()` dice *«Vacío = el default
 * responsive de Divi»*. O sea que **omitir es expresar el default**, y escribir
 * un número es afirmar que el editor lo tocó.
 *
 * La 95.ª dejó **tres huecos nombrados**, y los tres producen campos inventados
 * si se tratan como dato:
 *
 * | hueco | qué pasa si se escribe |
 * |---|---|
 * | **el 0 es el VALOR INICIAL, no «px absolutos»** — 24 de 49 celdas SIN ESCRIBIR | 24 campos inventados de una vez, cada uno con su medición real de coartada |
 * | **«en el DOM» ≠ «con caja»** — 36 módulos en desplegables CERRADOS | `getComputedStyle` no resuelve % sin caja: devuelve ceros que entran como dato |
 * | **`anchoPct` en BLOQUE ≠ en LÍNEA** — 25 instancias sin medir por el instrumento | una razón sobre un enlínea mide el TEXTO, no una declaración |
 *
 * **Lo SIN ESCRIBIR se omite. Lo NO MEDIBLE se declara. Ninguno de los dos se
 * convierte en un número.** Este extractor **no emite ni una sola clave de
 * geometría**, y el sabotaje `geometria` existe para que eso no se pueda
 * relajar en silencio: es la §regla del arreglo falso puesta en una guarda.
 *
 * ⚠ Y `video` (0 con caja), `map` y `slider` (n = 1) salieron de la 95.ª
 * **nombrados con lo que haría falta para medirlos**. Siguen sin cablear.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, gritaSiRevienta, hoy, nombreNeg, PLIEGUES_FINAL, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES_F33 } from "./transformaciones.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["tipo-fantasma", "sin-secciones", "geometria", "arrasa", "arrasa-control", "t11", "media-externa"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ── el parser, importado ─────────────────────────────────────────────────── */
const A = await import(pathToFileURL(join(RAIZ, "docs/research/cola-larga/derivaciones/arbol-f33.mjs")).href);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — las 31, de la congelada que las derivó
 *
 * §regla 9: la lista no se escribe, se deriva. `f33-rutas.json` ya trae `slug` y
 * `prefijo` calculados por segmentos, que es exactamente lo que el esquema pide
 * (`prefijo` es campo porque las rutas van de 1 a 5 segmentos).
 * ═════════════════════════════════════════════════════════════════════════ */
/* ⚠ GUARDA CON DIAGNÓSTICO (114.ª, PASO 0): un `ENOENT` pelado no dice QUIÉN
 * produce esta congelada, y §regla 5bis puede haber LIBERADO el nombre canónico
 * a propósito al renombrarla. */
const F_RUTAS = join(QA, "medidas/f33-rutas.json");
if (!existsSync(F_RUTAS))
  throw new Error(
    `CONGELADA AUSENTE: no existe medidas/f33-rutas.json.\n` +
      `  La produce \`npm run qa:f33-rutas\`. Si la renombraron (§regla 5bis), el nombre\n` +
      `  canónico quedó LIBRE a propósito: repunta este lector al nombre nuevo.`,
  );
const RUTAS = JSON.parse(readFileSync(F_RUTAS, "utf8"));
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

const CLAVES = Object.keys(INDICE.paginas);
function ficheroDe(ruta) {
  const k = CLAVES.find((x) => x.endsWith(`:${ruta}`));
  if (!k) return null;
  const f = join(CORPUS, INDICE.paginas[k].fichero);
  return existsSync(f) ? f : null;
}

/* ── utilidades de lectura sobre el árbol ─────────────────────────────────── */
const tieneClase = (n, c) => n.clases.includes(c);
const buscaClase = (n, c) => {
  for (const h of A.recorre(n)) if (tieneClase(h, c)) return h;
  return null;
};
const todasClase = (n, c) => {
  const out = [];
  for (const h of A.recorre(n)) if (tieneClase(h, c)) out.push(h);
  return out;
};
const attr = (n, nombre) => {
  const m = new RegExp(`\\b${nombre}="([^"]*)"`).exec(n.attrs || "");
  return m ? m[1] : undefined;
};
/** El HTML interno de un nodo, tal cual lo sirve el original (§verbatim). */
const dentro = (html, n) => html.slice(n.ini, n.fin).trim();
/** El texto plano de un nodo: para `label`, `titulo`, `alt`. */
const texto = (html, n) =>
  dentro(html, n)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const nivelDe = (n, def) => {
  const m = /^h([1-6])$/.exec(n.etiqueta);
  return m ? Number(m[1]) : def;
};
const oUndef = (v) => (v === undefined || v === null || v === "" ? undefined : v);

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL MÓDULO DE TERCEROS NO LLEVA `et_pb_<tipo>_<n>` — Y NO DA ERROR: DA 8
 *
 * `/politica-de-cookies` sirve un `dvmd_table_maker` (plugin Divi Table Maker)
 * cuyo envoltorio es:
 *
 *     class="et_pb_module dvmd_table_maker dvmd_table_maker_0 dvmd_tm_version_4_0_1"
 *
 * Lleva `et_pb_module` y **ningún `et_pb_<tipo>_<n>`**. `A.tipoDe` exige ese
 * patrón, así que devuelve `null`; y como `A.modulosDe` sólo para en un nodo
 * con tipo, **DESCIENDE dentro del módulo**, donde sólo hay `dvmd_tm_*`. La
 * tabla entera es invisible y la página emite **8 módulos en vez de 9**.
 *
 * **No da error: da 8, que es un número perfectamente plausible.** §sondas 4
 * cometida sobre el predicado de un caminante en vez de sobre un selector.
 *
 * ── POR QUÉ SE ARREGLA AQUÍ Y NO EN `arbol-f33.mjs` ───────────────────────
 * `arbol-f33` tiene **15 consumidores** (`grep -rln 'arbol-f33'`), y entre
 * ellos **`f33-spec`**, que es una de las 3 sondas de la deuda de §regla 37.
 * Cambiar `tipoDe` allí movería el recuento de módulos de los 15 y caducaría
 * sus congeladas — §regla 5bis, con el radio que la 112.ª midió. Es §regla 29
 * mitad 2: **no se cambia la definición compartida para arreglar a UN
 * consumidor.** El reconocimiento vive aquí, local, y `arbol-f33` queda igual.
 *
 * ── EL CRITERIO SE DERIVA, NO SE LISTAN VENDEDORES ────────────────────────
 * Es el mismo que ya usa `f33-cmp` (L486-497), y por eso los dos lados del
 * comparador nombran el módulo igual: **una clase `X_<n>` cuya base `X`
 * también está presente en el elemento**. Así `dvmd_table_maker_0` +
 * `dvmd_table_maker` → `dvmd_table_maker`, y `dvmd_tm_version_4_0_1` **no
 * cuela** (su base `dvmd_tm_version_4_0` no está). Una lista de plugins
 * envejecería contra el original en silencio (§regla 9 caso 7).
 * ═════════════════════════════════════════════════════════════════════════ */
const tipoTerceros = (n) => {
  if (!tieneClase(n, "et_pb_module")) return null;
  for (const c of n.clases) {
    const m = /^(.+)_\d+$/.exec(c);
    if (m && n.clases.includes(m[1])) return m[1];
  }
  return null;
};
/* ══════════════════════════════════════════════════════════════════════════
 * LAS ENTIDADES HTML — y por qué esto NO va dentro de `texto()`
 *
 * `texto()` quita etiquetas y NO decodifica entidades, y para sus consumidores
 * está bien: los `titulo`/`alt` del corpus vienen en UTF-8 directo
 * (`"Artículos y Guías"`). La tabla `dvmd` NO: sirve `Prop&oacute;sito`,
 * `M&aacute;s informaci&oacute;n`. Sin decodificar, React escapa el `&` y la
 * página muestra **el literal `Prop&oacute;sito`** — un defecto que se ve.
 *
 * Va LOCAL y no en `texto()` porque tocar el ayudante compartido movería el
 * dato de los otros once tipos para arreglar a uno (§regla 29 mitad 2), y esos
 * once ya están adjudicados.
 *
 * ⚠ **Y la lista de entidades NO puede envejecer en silencio.** Un mapa de seis
 * es §regla 9 caso 7 —una lista de literales cuyo productor las COMBINA—, así
 * que lo que hay aquí es: numéricas por regla general, nombradas por tabla, y
 * **cualquier entidad desconocida TIRA**. El defecto en la dirección que grita
 * (§sondas 6): mejor reventar que servir `&foo;` a la página.
 * Censo del dominio de hoy: 6 nombradas · 0 numéricas en las 55 celdas.
 * ═════════════════════════════════════════════════════════════════════════ */
const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ",
  uuml: "ü", Uuml: "Ü", ordf: "ª", ordm: "º", laquo: "«", raquo: "»",
  hellip: "…", mdash: "—", ndash: "–", deg: "°", euro: "€", middot: "·",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};
const decodifica = (s, donde) =>
  s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (todo, cuerpo) => {
    if (cuerpo[0] === "#") {
      const n = cuerpo[1] === "x" || cuerpo[1] === "X" ? parseInt(cuerpo.slice(2), 16) : Number(cuerpo.slice(1));
      if (Number.isFinite(n)) return String.fromCodePoint(n);
    } else if (cuerpo in ENTIDADES) return ENTIDADES[cuerpo];
    throw new Error(
      `ENTIDAD DESCONOCIDA: '${todo}' en ${donde}.\n` +
        `  No se sirve tal cual —React escaparía el '&' y se vería el literal—.\n` +
        `  Añádela a ENTIDADES con su carácter, derivado del original.`,
    );
  });

/** `A.tipoDe` + los módulos que no son de Divi. LOCAL a este extractor. */
const tipoDe = (n) => A.tipoDe(n) ?? tipoTerceros(n);
/** `A.modulosDe` con el mismo criterio ampliado: para también en terceros. */
function modulosDe(nodo) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      const t = tipoDe(h);
      if (t && !A.esEstructura(t)) {
        out.push(h);
        continue;
      }
      baja(h);
    }
  };
  baja(nodo);
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL `<img>` NO ESTÁ EN EL ÁRBOL — §sondas 4, EL PLENO (2026-08-23)
 *
 * `parsea()` lleva `VACIOS = {img, br, hr, input, …}` y hace `continue` con
 * ellas: **las etiquetas vacías no entran en el árbol**, por diseño — a
 * `arbol-f33` sólo le interesaba la estructura de `div`s, y ahí eso es correcto.
 *
 * La primera versión de este extractor buscaba la imagen con
 * `recorre(n).find(x => x.etiqueta === "img")`, o sea **un selector que no casa
 * NUNCA**. Y no dio error: dio `src: undefined` en **71 de 71** imágenes.
 *
 * > **71 de 71 no es un dato del original: es el instrumento.** Es el
 * > complementario de la regla del cero —*un patrón que casa en TODAS tampoco
 * > mide nada*— y aquí con el pleno invertido: un campo AUSENTE en el 100 % de
 * > las instancias de su tipo no dice «el original no lo trae», dice «no lo sé
 * > leer». Lo destapó Payload al exigir `src`; sin ese `required`, habrían
 * > entrado 71 imágenes sin origen y la página se habría servido con huecos.
 *
 * `<iframe>` y `<a>` **sí** están en el árbol (no son vacías), y por eso
 * `embedUrl` y `href` salían bien: el defecto era exactamente de una etiqueta.
 *
 * Se lee del HTML crudo del nodo, que es donde está. **Y no se toca
 * `arbol-f33`**: es la definición compartida, su control cruzado la validó, y
 * cambiar `VACIOS` movería el censo de otro instrumento para arreglar a éste.
 * ═════════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════════
 * T3b · LA RUTA DEL ORIGINAL PASA A LA LOCAL QUE SIRVE EL CLON
 *
 * `creaContexto().media()` de `seed.mjs` exige una ruta que empiece por `/` y
 * resuelve contra `apps/web/public`. Una URL absoluta del original la hace TIRAR
 * —y bien: un `media` sin fichero convertiría «falta el asset» en «la imagen es
 * opcional».
 *
 * ⚠ **Se toma de `PLIEGUES_FINAL` §`media-original`, que es donde vive la
 * definición** (§una definición, no dos). Y hay que decir lo que se ve al
 * buscarla: **ya existen DOS copias a mano** —`extractor-a.mjs` l. 98 y
 * `extractor-c.mjs` l. 182, las dos con `rutaLocalMedia` propia— que además NO
 * son idénticas a ésta: las suyas no admiten `www.`. Ésta sería la tercera, así
 * que se importa en vez de copiarse. Las otras dos quedan FICHADAS, no
 * arregladas aquí: tocan extractores ya verificados y su unificación es una
 * tanda con su medición, no un arreglo de paso.
 * ═════════════════════════════════════════════════════════════════════════ */
const T3B = PLIEGUES_FINAL.find((p) => p.clase === "media-original");
if (!T3B) throw new Error("PLIEGUES_FINAL no trae `media-original`: T3b no se puede derivar (§sondas 4).");
const rutaLocalMedia = (u) => (typeof u === "string" ? T3B.aplica(u) : u);

const RE_IMG = /<img\b[^>]*>/i;
const imgDe = (html, n) => RE_IMG.exec(dentro(html, n))?.[0] ?? null;
const attrTag = (tag, nombre) => {
  if (!tag) return undefined;
  const m = new RegExp(`\\b${nombre}="([^"]*)"`).exec(tag);
  return m ? m[1] : undefined;
};

/* ══════════════════════════════════════════════════════════════════════════
 * 1bis · LA RETIRADA DE LO GENERADO — cascarón y consulta fuera del campo rico
 *
 * Derivado el 2026-08-23 por `docs/research/cola-larga/derivaciones/clasifica-f33`,
 * que recorrió los 178 campos ricos y publicó la CADENA DE ANCESTROS de cada una
 * de las **120 ocurrencias** de etiqueta fuera del censo de `campoHtml`. Las tres
 * respuestas salieron con su cardinal, y **ninguna es contenido**:
 *
 * | contenedor | ocurrencias | qué es | evidencia |
 * |---|---|---|---|
 * | `ol.kunak-breadcrumbs` | 25 `<meta>` en 10 páginas | **CASCARÓN** | §2 |
 * | `div.et_pb_blog…bucle-entradas` | 3 `<article>` | **CONSULTA** | §3a |
 * | `div.scientific-list-content` | 23 × `<article>·<header>·<svg>·<path>` | **CONSULTA** | §3b |
 *
 * ── Por qué la miga es cascarón, y no es que «parezca de plantilla» ──────
 * El discriminador es **la CAPA**. `kunak-breadcrumbs` está en 18 de 31 páginas:
 * 10 en la capa propia y **8 en `_tb_`**, donde por la regla de regímenes NO
 * EXISTE la persona que editó la instancia. Las dos capas sirven el MISMO
 * marcado —3 formas de `<li>`, diferencia simétrica propia ↔ `_tb_` **0/0**— con
 * la jerarquía correcta de cada página. Eso sólo lo hace un generador. Y el
 * cruce entre páginas cierra: **22 de 22** veces, la etiqueta que una hija usa
 * para su padre es la que el padre usa para sí.
 *
 * ── Por qué los dos listados son consulta: por la MEMBRESÍA, nombrada ────
 * `/es/recursos/` sirve 3 tarjetas, **3 de 3** son entradas de `entradas-blog`;
 * `/es/recursos/documentos-cientificos/` sirve 23 y la **diferencia simétrica**
 * contra la colección `documentos-cientificos` es **0 y 0**. `23 → 23` no habría
 * probado nada (§*un cardinal es un contenedor y absorbe la membresía*).
 *
 * ── Qué se retira, exactamente ──────────────────────────────────────────
 * **El CONTENEDOR, no el módulo.** El criterio es *«lo generado se va»*, y si
 * quedara algo al lado, ese algo es del editor y **se conserva**. El módulo sólo
 * se omite cuando lo que queda está en blanco — medido hoy: **12 de 12**.
 *
 * ⚠ Y no se usa la clase `breadcrumbs` del módulo como criterio aunque en este
 * dominio acierte igual: los dos modelos tienen **0 instancias separadoras**
 * (§*dos modelos que predicen lo mismo en todo tu dominio son uno solo*), así que
 * la elección no la decide el acierto. La decide qué predicen fuera: retirar POR
 * CONTENIDO conserva el texto de un futuro módulo con miga + párrafo; retirar
 * POR CLASE se lo lleva.
 *
 * ── La guarda: que no se lleve contenido por delante ─────────────────────
 * Dos condiciones, las dos sobre cada módulo tocado:
 *   1 · **reconstrucción**: `chars(bruto) === chars(limpio) + Σ chars(retirado)`
 *       — la retirada quita el contenedor y NADA más;
 *   2 · **omitido ⟺ resto en blanco** — un módulo no se va con texto dentro.
 * Sabotaje `arrasa` (inyecta un párrafo Y omite sin mirar) tiene que TIRAR;
 * `arrasa-control` (inyecta y NO arrasa) tiene que salir en verde conservando el
 * párrafo. Sin el control, `arrasa` no tendría instancias separadoras: hoy los
 * 12 restos están vacíos, así que arrasar y no arrasar producen lo mismo
 * (§regla 17, segunda cara).
 *
 * ── Lo que esta retirada CUESTA, y se declara aquí porque es visible ─────
 * Las 10 migas ocupan **ellas solas su sección entera** (`S0 F0 C0`, `4_4`, un
 * módulo, resto de la fila y de la sección **0**), así que al retirarlas la
 * sección se va con ellas: eso es cascarón entero y no se pierde nada.
 *
 * **Las dos consultas NO.** Dejan la página servida INCOMPLETA y con su vecino a
 * la vista: `recursos` conserva `<h2>Guías más recientes</h2>` sin lista debajo,
 * y `documentos-cientificos` conserva su `scientific-filter` sin nada que
 * filtrar. **Es un hueco declarado, no un descuido**: lo sirve un bloque de
 * listado embebido que todavía no existe. Ficha con su número y con qué lo
 * serviría: `ESQUEMA-CMS.md` §2j.6 y `PENDIENTES-QA.md` §F3-3-CONSULTAS-EMBEBIDAS.
 * ═════════════════════════════════════════════════════════════════════════ */
const GENERADOS = [
  { id: "miga", clase: "CASCARÓN", abre: /<ol\s+class="kunak-breadcrumbs"[^>]*>/, etiqueta: "ol", evidencia: "clasifica-f33 §2" },
  { id: "bucle-entradas", clase: "CONSULTA", abre: /<div\s+class="et_pb_module et_pb_blog[^"]*"[^>]*>/, etiqueta: "div", evidencia: "clasifica-f33 §3a" },
  { id: "listado-cientifico", clase: "CONSULTA", abre: /<div\s+class="scientific-list-content"[^>]*>/, etiqueta: "div", evidencia: "clasifica-f33 §3b" },
];

/** El índice JUSTO DESPUÉS del cierre balanceado del elemento que abre en `i`. */
function finBalanceado(html, i, etiqueta) {
  const re = new RegExp(`<(/?)${etiqueta}\\b[^>]*>`, "gi");
  re.lastIndex = i;
  let hondo = 0;
  let m;
  while ((m = re.exec(html))) {
    hondo += m[1] === "/" ? -1 : 1;
    if (hondo === 0) return m.index + m[0].length;
  }
  return -1;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1ter · LOS DEFECTOS DEL ESQUEMA — porque «igual al defecto» = «no escrito»
 *
 * `conDefecto` tiene DOS mitades: el `defaultValue` **y** el `beforeChange` que
 * escribe `null` cuando el valor coincide con él —*«coincidir con el defecto =
 * no haber escrito»*—. O sea que en la DB **el defecto explícito y la ausencia
 * son la misma fila**, y por tanto el dato medido tiene que elegir UNA de las
 * dos preimágenes. La convención del repo es **OMITIR**.
 *
 * ⚠ **Lo destapó la primera siembra**: el extractor emitía `toggle.nivel: 5`,
 * que es exactamente el `defaultValue` de `nivelToggle`. El hook lo anuló, la
 * vuelta devolvió ausente, y el round-trip dio **8 diferencias de FORMA en 3
 * documentos**. Ninguna de las dos partes estaba «mal» por su cuenta: lo que
 * faltaba era que el lado medido respetara el contrato.
 *
 * ── Y el valor NO se cablea: se DERIVA del esquema (§regla 5ter) ─────────
 * Escribir `if (nivel === 5)` aquí sería un número recordado que envejece
 * **contra** el esquema en silencio — y encima en el sitio donde menos se ve,
 * porque sólo se estrena cuando alguien cambia el defecto. Se lee del propio
 * `paginas.ts`, bundleado con esbuild igual que hace `bloqueos-f33`.
 * ═════════════════════════════════════════════════════════════════════════ */
const DEFECTOS = await (async () => {
  const req = createRequire(import.meta.url);
  const esbuild = req("esbuild");
  const TMP = join(QA, ".tmp");
  mkdirSync(TMP, { recursive: true });
  const ENTRY = join(TMP, "entry-f33-defectos.ts");
  writeFileSync(
    ENTRY,
    `export * as BL from ${JSON.stringify(join(RAIZ, "packages/cms-config/src/bloques/paginas.ts").replace(/\\/g, "/"))};\n`,
  );
  const out = join(TMP, "f33-defectos-bundle.mjs");
  await esbuild.build({ entryPoints: [ENTRY], outfile: out, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent" });
  const { BL } = await import(`${pathToFileURL(out).href}?t=${Date.now()}`);
  const bloques = BL.MODULOS_PAGINA;
  if (!Array.isArray(bloques) || !bloques.length)
    throw new Error("no encuentro `MODULOS_PAGINA` en el bundle del esquema (§sondas 4, el cero).");
  /** `slug del bloque` → `{ campo: defecto }`, sólo para los que declaran uno. */
  const m = new Map();
  for (const b of bloques) {
    const d = {};
    for (const c of b.fields ?? []) if (c?.name && c.defaultValue !== undefined) d[c.name] = c.defaultValue;
    if (Object.keys(d).length) m.set(b.slug, d);
  }
  return m;
})();

/**
 * Quita del módulo emitido todo campo cuyo valor COINCIDA con el defecto que el
 * esquema declara. Devuelve además qué quitó, para publicarlo con su cardinal:
 * una omisión silenciosa aquí es indistinguible de un campo que no se leyó.
 */
const OMITIDOS_POR_DEFECTO = [];
function omiteDefectos(mod, donde) {
  const d = DEFECTOS.get(mod?.kind);
  if (!d) return mod;
  for (const [k, v] of Object.entries(d))
    if (mod[k] !== undefined && JSON.stringify(mod[k]) === JSON.stringify(v)) {
      OMITIDOS_POR_DEFECTO.push({ ruta: donde, kind: mod.kind, campo: k, valor: v });
      delete mod[k];
    }
  return mod;
}

/** El censo de todo lo retirado. Se publica y se congela: nada se va en silencio. */
const RETIRADAS = [];

function retiraGenerado(bruto) {
  let h = bruto;
  const retirados = [];
  for (let vuelta = 0; vuelta < 50; vuelta++) {
    let toco = false;
    for (const g of GENERADOS) {
      const m = g.abre.exec(h);
      if (!m) continue;
      const fin = finBalanceado(h, m.index, g.etiqueta);
      /* §sondas 4: un contenedor que casa al abrir y no cierra NO es «no había
       * nada que retirar» — es que el acotador no sabe dónde acaba. Tira. */
      if (fin < 0) throw new Error(`RETIRADA SIN CIERRE: \`${g.id}\` abre y no cierra balanceado. El acotador no puede decidir qué se va.`);
      retirados.push({ contenedor: g.id, clase: g.clase, chars: fin - m.index, evidencia: g.evidencia });
      h = h.slice(0, m.index) + h.slice(fin);
      toco = true;
      break;
    }
    if (!toco) break;
  }
  return { limpio: h, retirados };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · UN MÓDULO DIVI → UN BLOQUE DEL ESQUEMA
 *
 * Los selectores están DERIVADOS del marcado servido (una instancia de cada uno
 * de los 11 tipos, leída antes de escribir esto), nunca supuestos. Y el `switch`
 * lleva `default` que TIRA (§regla 6 gemelo): un renderizador que devuelve
 * `undefined` no falla, **no pinta** — y el extractor que devuelve `undefined`
 * no falla, **no siembra**. Los dos modos de fallo son el mismo, y el segundo
 * llega hasta una página que responde 200 con cero módulos.
 *
 * ⚠ NINGUNA rama escribe `ritmo`, `anchoPct` ni ninguna otra clave de
 * geometría. Ver la cabecera.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Las diapositivas de un slider: `et_pb_slide` es hijo del slider, no bloque (P-S2). */
function diapositivasDe(html, n) {
  return todasClase(n, "et_pb_slide").map((s) => {
    const t = buscaClase(s, "et_pb_slide_title");
    const desc = buscaClase(s, "et_pb_slide_description");
    const btn = buscaClase(s, "et_pb_button");
    const img = buscaClase(s, "et_pb_slide_image");
    const imgN = img ? imgDe(html, img) : null;
    /* El cuerpo es la descripción SIN su titular ni su botón: los dos son campos
     * propios, y dejarlos dentro los duplicaría en el render. */
    let cuerpo;
    if (desc) {
      let h = dentro(html, desc);
      if (t) h = h.replace(dentro(html, t), "");
      h = h.replace(/<h[1-6][^>]*class="et_pb_slide_title"[\s\S]*?<\/h[1-6]>/i, "");
      h = h.replace(/<div[^>]*class="et_pb_button_wrapper"[\s\S]*?<\/div>/i, "").trim();
      cuerpo = oUndef(h);
    }
    return {
      titulo: t ? texto(html, t) : "(sin título)",
      nivel: t ? nivelDe(t, 2) : undefined,
      cuerpo,
      botonLabel: btn ? oUndef(texto(html, btn)) : undefined,
      botonHref: btn ? oUndef(attr(btn, "href")) : undefined,
      fondo: oUndef(rutaLocalMedia(attrTag(imgN, "src"))),
    };
  });
}

/** El sabotaje `tipo-fantasma`: un doceavo tipo, que el esquema no tiene. */
let fantasmaInyectado = false;
/** El sabotaje `arrasa`/`arrasa-control`: el párrafo que crea la separadora. */
let inyectado = false;

/**
 * La envoltura que aplica el contrato de `conDefecto` a TODO módulo emitido:
 * un valor igual al defecto del esquema **no se escribe** (§1ter). Va aquí y no
 * en cada `return` de `aBloqueBruto` porque son once ramas y acordarse once
 * veces es exactamente cómo se olvida la doceava.
 */
const aBloque = (html, n, donde) => omiteDefectos(aBloqueBruto(html, n, donde), donde);

function aBloqueBruto(html, n, donde) {
  let tipo = tipoDe(n);
  if (SABOTAJE === "tipo-fantasma" && !fantasmaInyectado) {
    fantasmaInyectado = true;
    tipo = "un_tipo_que_divi_no_sirve";
  }

  switch (tipo) {
    case "text": {
      const inner = buscaClase(n, "et_pb_text_inner");
      let bruto = dentro(html, inner ?? n);

      /* El sabotaje inyecta un párrafo JUNTO al contenedor generado, y es lo que
       * crea la instancia separadora: sin él, arrasar y no arrasar dan lo mismo
       * (los 12 restos medidos están vacíos). Va en las dos etiquetas —`arrasa`
       * y su control— porque un control que no inyecte no prueba la inyección. */
      if ((SABOTAJE === "arrasa" || SABOTAJE === "arrasa-control") && !inyectado && /kunak-breadcrumbs/.test(bruto)) {
        inyectado = true;
        bruto += "<p>PÁRRAFO INYECTADO: esto NO es cascarón y no se puede ir con él.</p>";
      }

      const { limpio, retirados } = retiraGenerado(bruto);
      if (!retirados.length) return { kind: "texto-pagina", html: bruto };

      const resto = limpio.replace(/\s|&nbsp;/g, "");
      const omitido = SABOTAJE === "arrasa" ? true : resto === "";
      RETIRADAS.push({
        ruta: donde,
        retirados,
        brutoChars: bruto.length,
        limpioChars: limpio.length,
        restoChars: resto.length,
        moduloOmitido: omitido,
      });
      return omitido ? null : { kind: "texto-pagina", html: limpio };
    }

    case "image": {
      const img = imgDe(html, n);
      const a = [...A.recorre(n)].find((x) => x.etiqueta === "a");
      const href = a ? attr(a, "href") : undefined;
      /**
       * ⚠ **D2 · el asset alojado FUERA va a `srcExterno`, no a `src`.**
       *
       * `rutaLocalMedia` (T3b) sólo reescribe `kunakair.com`, así que un host
       * ajeno **pasa entero** — y `src` es `upload → media`, cuyo resolutor
       * (`creaContexto().media`) exige `ruta.startsWith("/")` y TIRA. Eso no era
       * un defecto del resolutor: era el modelo sin sitio para el caso.
       *
       * El discriminador es la SALIDA de T3b, no una lista de hosts: si después
       * de aplicarla la ruta sigue siendo absoluta, es que no es nuestra.
       * Medido: **1 de 71** (`bloqueos-f33.log` §media).
       */
      const origen = rutaLocalMedia(attrTag(img, "src"));
      const externo = typeof origen === "string" && /^(?:https?:)?\/\//i.test(origen);
      /* El sabotaje mete el asset externo por el canal LOCAL, que es el defecto
       * que D2 arregla: sin la guarda, sale un `src` absoluto en un campo
       * `upload` y el que lo caza es Payload, dos pasos más allá. */
      const alLocal = externo && SABOTAJE === "media-externa";
      return {
        kind: "imagen-pagina",
        src: externo && !alLocal ? undefined : origen,
        srcExterno: externo && !alLocal ? origen : undefined,
        alt: oUndef(attrTag(img, "alt")),
        href: oUndef(href),
        /* `external` se DERIVA del destino, no se supone: la regla de rutas
         * locales dice que `_blank` sólo vale si el destino es externo. */
        external: href && !/^https?:\/\/(www\.)?kunakair\.com/.test(href) && /^https?:/.test(href) ? true : undefined,
      };
    }

    case "button":
      return {
        kind: "boton-pagina",
        label: texto(html, n),
        href: attr(n, "href"),
        external: undefined,
        /* `boton-azul` es CAMPO con su n (4 de 13): varía entre hermanos de la
         * misma página, o sea test B. */
        piel: tieneClase(n, "boton-azul") ? "azul" : undefined,
      };

    case "code": {
      const inner = buscaClase(n, "et_pb_code_inner");
      return { kind: "codigo", html: dentro(html, inner ?? n) };
    }

    case "toggle": {
      const t = buscaClase(n, "et_pb_toggle_title");
      const c = buscaClase(n, "et_pb_toggle_content");
      return {
        kind: "toggle",
        titulo: t ? texto(html, t) : "(sin título)",
        nivel: t ? nivelDe(t, 3) : undefined,
        cuerpo: c ? dentro(html, c) : "",
      };
    }

    case "video": {
      const f = [...A.recorre(n)].find((x) => x.etiqueta === "iframe");
      return {
        kind: "video-pagina",
        embedUrl: f ? attr(f, "src") : undefined,
        titulo: f ? oUndef(attr(f, "title")) : undefined,
      };
    }

    case "blurb": {
      const cab = buscaClase(n, "et_pb_module_header");
      const desc = buscaClase(n, "et_pb_blurb_description");
      const wrap = buscaClase(n, "et_pb_main_blurb_image");
      const img = wrap ? imgDe(html, wrap) : null;
      return {
        kind: "blurb",
        titulo: cab ? texto(html, cab) : "(sin título)",
        nivel: cab ? nivelDe(cab, 3) : undefined,
        imagen: oUndef(rutaLocalMedia(attrTag(img, "src"))),
        alt: oUndef(attrTag(img, "alt")),
        descripcion: desc ? oUndef(dentro(html, desc)) : undefined,
      };
    }

    case "fullwidth_slider":
      return { kind: "slider-completo", diapositivas: diapositivasDe(html, n) };

    case "slider":
      return { kind: "slider", diapositivas: diapositivasDe(html, n) };

    case "map":
      return {
        kind: "mapa",
        pines: todasClase(n, "et_pb_map_pin").map((p) => {
          const info = buscaClase(p, "infowindow");
          return {
            titulo: attr(p, "data-title") ?? "(sin título)",
            descripcion: info ? oUndef(dentro(html, info)) : undefined,
            lat: oUndef(attr(p, "data-lat")),
            lng: oUndef(attr(p, "data-lng")),
          };
        }),
      };

    case "icon": {
      const i = buscaClase(n, "et-pb-icon");
      return {
        kind: "icono",
        /* El carácter de la fuente, TAL CUAL lo sirve Divi. No se traduce a un
         * enum: con n = 1 página, enum / carácter / imagen son indistinguibles
         * (F3-3-ICONO-DATO). */
        icono: i ? dentro(html, i) : "",
        texto: undefined,
      };
    }

    /* ══════════════════════════════════════════════════════════════════════
     * T1 · LA TABLA DE TERCEROS — y NO se busca un `<table>`
     *
     * Medido (`derivaciones/tabla-cookies-109.log` + `tabla-canales-113.log`):
     * `<table>`, `<thead>`, `<tr>`, `<th>`, `<td>` salen **0 en el marcado**.
     * Es una REJILLA DE `<div>` con la posición en las clases
     * (`dvmd_tm_row_N` · `dvmd_tm_col_N`) y el texto en un `.dvmd_tm_cdata`
     * INTERIOR — no en el `tcell`. Un extractor que buscara `<table>` daría
     * cero y lo leería como «no hay tabla».
     *
     * ── LA DECISIÓN DEL APLANADO, ESCRITA (no tomada por defecto en el código)
     * **Las 55 celdas van a `filas[].celdas[]` en orden de columna, y
     * `cabeceras` se queda VACÍA.** Las 11 `rhead` y las 11 `rfoot` entran
     * como columnas más: se pierde el PAPEL, no la celda.
     *
     * **Por qué NO se usa `cabeceras` para la fila 0**, que era la alternativa:
     *   1 · el marcado **no marca** la fila 0 como cabecera — lo dice su
     *       contenido ("Cookie · Tipo · Propósito"…). Escribirla en `cabeceras`
     *       sería que el extractor AFIRME algo que el original no dice;
     *   2 · dejaría fuera de `filas` esa fila, o sea 10 × 5 + 5, y el modelo
     *       pasaría a tener una forma que la rejilla no tiene;
     *   3 · y **no resolvería la columna 0**, que es la única que el original
     *       SÍ marca (`dvmd_tm_rhead` + `role="rowheader"`). Quedaría promovido
     *       lo que el marcado calla y perdido lo que el marcado afirma —
     *       exactamente al revés.
     * O sea que la pérdida se reparte UNIFORME: **22 papeles, 0 celdas**.
     *
     * ── EL PAPEL ESTÁ EN DOS CANALES Y NO DICEN LO MISMO ─────────────────
     * clase → `rhead` 11 · `tdata` 33 · `rfoot` 11 (TRES papeles)
     * ARIA  → `rowheader` 11 · `cell` 44           (DOS: `rfoot` no tiene)
     * El papel de PIE existe **sólo en el canal de la clase**. Anotado porque
     * §El principio: la salida servida incluye el canal que no mirabas.
     * ═════════════════════════════════════════════════════════════════════ */
    case "dvmd_table_maker": {
      const celdas = todasClase(n, "dvmd_tm_tcell");
      const pos = (c, eje) => {
        const m = new RegExp(`^dvmd_tm_${eje}_(\\d+)$`);
        for (const k of c.clases) {
          const x = m.exec(k);
          if (x) return Number(x[1]);
        }
        return undefined;
      };

      const rejilla = new Map();
      let sinPosicion = 0;
      let sinCdata = 0;
      for (const c of celdas) {
        const fila = pos(c, "row");
        const col = pos(c, "col");
        /* §regla 33: una LLAVE de emparejamiento nunca es opcional. Sin fila o
         * columna la celda no se puede colocar, y un `undefined` en una llave
         * es «no lo sé» disfrazado de valor. Se tira. */
        if (fila === undefined || col === undefined) {
          sinPosicion++;
          continue;
        }
        const cdata = buscaClase(c, "dvmd_tm_cdata");
        if (!cdata) sinCdata++;
        if (!rejilla.has(fila)) rejilla.set(fila, new Map());
        rejilla.get(fila).set(col, decodifica(texto(html, cdata ?? c), `${donde} celda ${fila}/${col}`));
      }

      if (sinPosicion) {
        throw new Error(
          `TABLA SIN POSICIÓN: ${sinPosicion} de ${celdas.length} celdas sin dvmd_tm_row_N/col_N en ${donde}.\n` +
            `  La posición es la llave de la rejilla: sin ella la celda no se coloca.`,
        );
      }
      /* §sondas 4, 5.ª cara — un campo ausente en el 100 % de su tipo NO es
       * «el original no lo trae»: es el instrumento. El texto vive en un
       * `.dvmd_tm_cdata` INTERIOR, así que si ninguno casa, lo que falla es el
       * selector, no el corpus. Un 100 % redondo se mira dos veces. */
      if (celdas.length && sinCdata === celdas.length) {
        throw new Error(
          `TABLA SIN TEXTO: 0 de ${celdas.length} celdas traen '.dvmd_tm_cdata' en ${donde}.\n` +
            `  Ausente en el 100 % de su tipo ⇒ el selector, no el original.`,
        );
      }

      const nFilas = Math.max(...rejilla.keys()) + 1;
      const nCols = Math.max(...[...rejilla.values()].flatMap((f) => [...f.keys()])) + 1;
      if (rejilla.size * nCols !== celdas.length) {
        throw new Error(
          `TABLA NO RECTANGULAR: ${celdas.length} celdas para ${rejilla.size} × ${nCols} en ${donde}.`,
        );
      }

      const filas = [];
      for (let f = 0; f < nFilas; f++) {
        const r = rejilla.get(f);
        if (!r) continue;
        /* `escalarA: "texto"` lo declara `CELDA` al lado de su definición. */
        filas.push({ celdas: [...Array(nCols).keys()].map((c) => ({ texto: r.get(c) ?? "" })) });
      }
      /* `cabeceras` OMITIDA, no vacía: el original no marca ninguna cabecera de
       * columna, y un array vacío explícito afirmaría que la miró y no había. */
      return { kind: "tabla", filas };
    }

    default:
      /* §sondas 4 + §regla 6 gemelo: un tipo que no casa NO se omite. Omitirlo
       * daría un documento con menos módulos y CERO errores — que es como se
       * sirven seis páginas vacías en verde. */
      throw new Error(
        `TIPO SIN BLOQUE: '${tipo}' en ${donde}.\n` +
          `  arbol-f33 censó once tipos de DIVI; T1 (113.ª) añadió el DOCEAVO, que no\n` +
          `  es de Divi: 'dvmd_table_maker'. Un treceavo no se omite ni se mete en el\n` +
          `  cajón de otro: se mide y se modela.\n` +
          `  ⚠ Y si el tipo te suena a módulo de terceros, mira 'tipoTerceros' arriba:\n` +
          `  el caminante ya para en ellos, así que llegar aquí significa que el bloque\n` +
          `  falta en el esquema, no que el tipo sea invisible.`,
      );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LA RETÍCULA — sección → fila → columna → módulo
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_COLUMNA = /^et_pb_column_(\d+_\d+)$/;
const anchoDe = (n) => {
  for (const c of n.clases) {
    const m = RE_COLUMNA.exec(c);
    if (m) return m[1];
  }
  return undefined;
};
const esFila = (n) => tieneClase(n, "et_pb_row") || tieneClase(n, "et_pb_row_inner");

/** Las filas DIRECTAS de una sección (sin bajar a la fila de dentro de otra). */
function filasDe(nodo) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      if (esFila(h)) { out.push(h); continue; }
      baja(h);
    }
  };
  baja(nodo);
  return out;
}

/** Las columnas DIRECTAS de una fila. */
function columnasDe(fila) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      if (anchoDe(h)) { out.push(h); continue; }
      baja(h);
    }
  };
  baja(fila);
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL CASCARÓN — título y SEO del `<head>`
 * ═════════════════════════════════════════════════════════════════════════ */
const entreEtiquetas = (html, re) => {
  const m = re.exec(html);
  return m ? m[1].trim() : undefined;
};
const desescapa = (s) =>
  s === undefined
    ? undefined
    : s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&#8211;/g, "–")
        .replace(/&#8217;/g, "’")
        .replace(/&nbsp;/g, " ");

function cascaronDe(html) {
  const title = desescapa(entreEtiquetas(html, /<title>([\s\S]*?)<\/title>/i));
  const desc = desescapa(
    entreEtiquetas(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ??
      entreEtiquetas(html, /<meta[^>]+content="([^"]*)"[^>]+name="description"/i),
  );
  /* El `<h1>` de la capa propia es el título editorial; el `<title>` lleva el
   * sufijo del sitio. Se prefiere el `h1` y el `<title>` queda para el SEO. */
  const h1 = desescapa(entreEtiquetas(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]*>/g, ""));
  return { title, desc, h1 };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL RÉGIMEN — y el segundo canal de contenido (S2)
 *
 * `--` (ni `et_pb_pagebuilder_layout` ni `et-tb-has-body`) es la plantilla
 * CLÁSICA del tema: el cuerpo vive en `entry-content` como HTML. Hoy lo ejercita
 * **1 documento de 31**, y ese n = 1 se DECLARA (§*un campo que ningún dato
 * ejercita es un camino de render sin estrenar*).
 * ═════════════════════════════════════════════════════════════════════════ */
function regimenDe(html) {
  const m = /<body[^>]*class="([^"]*)"/i.exec(html);
  const cls = m ? m[1] : "";
  const b = /\bet_pb_pagebuilder_layout\b/.test(cls);
  const t = /\bet-tb-has-body\b/.test(cls);
  return b && t ? "BT" : b ? "B-" : t ? "-T" : "--";
}

function cuerpoClasicoDe(html) {
  const raiz = A.parsea(html);
  const n = buscaClase(raiz, "entry-content");
  return n ? dentro(html, n) : undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LA EXTRACCIÓN
 * ═════════════════════════════════════════════════════════════════════════ */
const ev = new Evaluadas({ nombre: "extractor-f33", unidad: "páginas", minimo: RUTAS.paginas.length });

const docs = [];
const censo = { porTipo: {}, modulos: 0, secciones: 0, filas: 0, columnas: 0, sueltos: 0, porRegimen: {} };
/**
 * ⚠ `censo` cuenta el ÁRBOL (313 módulos, lo que cruza con `arbol-f33`);
 * `emision` cuenta lo EMITIDO, que desde la retirada ya no es el mismo número.
 * Publicar sólo uno sería §regla 1 — lo que se imprime y lo que se cuenta no
 * pueden discrepar — con la discrepancia escondida en la diferencia.
 */
const emision = { modulos: 0, columnasColapsadas: 0, filasColapsadas: 0, seccionesColapsadas: 0 };
const sinFichero = [];
const problemas = [];
/**
 * La DIANA de las transformaciones de importación, contada sobre el HTML **de
 * entrada** de las 31 (§6bis). Es el denominador contra el que se lee cuántas
 * se aplicaron, y se DERIVA de la fuente en vez de escribirse.
 */
let dianaEntrada = 0;

for (const p of RUTAS.paginas) {
  const f = ficheroDe(p.ruta);
  if (!f) { sinFichero.push(p.ruta); continue; }

  const html = A.limpia(readFileSync(f, "utf8"));
  for (const t of TRANSFORMACIONES_F33) dianaEntrada += t.diana(html);
  const reg = regimenDe(html);
  censo.porRegimen[reg] = (censo.porRegimen[reg] || 0) + 1;
  const { title, desc, h1 } = cascaronDe(html);

  const doc = {
    slug: p.slug,
    prefijo: oUndef(p.prefijo),
    /**
     * ⚠ **CMS-5 · R1, aplicada el 2026-08-24 (100.ª).** El régimen viaja al
     * documento **derivado del `<body>`**, con la MISMA `regimenDe()` que esta
     * función ya llamaba dos líneas más arriba para su censo: por eso R1 «no
     * hay que volver al original» era literal y no una estimación.
     *
     * Se escribe **el valor medido, no una lista de rutas** — cablear la ruta
     * (R3) está REFUTADO por dos separadoras, una por dirección
     * (`derivaciones/f33-regimen-discriminador.log`). El modelo y los cuatro
     * casilleros, en `colecciones/paginas.ts`.
     */
    regimen: reg,
    titulo: h1 || title || p.slug,
    seo: { title: oUndef(title), description: oUndef(desc) },
  };

  if (reg === "--") {
    /* S2 · el segundo canal. No es un escape elegido sin medir: es `campoHtml`,
     * el mismo helper y el mismo `validaHtmlCorpus` que ya usan otras cuatro
     * colecciones, con su contrato censado en 209/209. */
    doc.cuerpoClasico = cuerpoClasicoDe(html);
    if (!doc.cuerpoClasico)
      problemas.push(`${p.ruta}: régimen \`--\` y sin \`entry-content\` — el canal del cuerpo no casa`);
  } else {
    const raiz = A.parsea(html);
    const secciones = SABOTAJE === "sin-secciones" ? [] : A.seccionesPropias(raiz);
    const bloques = [];

    for (const sec of secciones) {
      censo.secciones++;
      const filas = filasDe(sec);
      const enFilas = new Set();
      /* ⚠ El caminante LOCAL en los dos sitios, o la tabla se cuenta DOS veces:
       * `enFilas` es lo que descuenta a `sueltos`, así que si aquí se usara
       * `A.modulosDe` el módulo de terceros no entraría en el set y saldría
       * además como suelto. Dos mitades del mismo criterio, nunca una. */
      for (const fila of filas) for (const m of modulosDe(fila)) enFilas.add(m);

      /* Los `fullwidth` cuelgan de la sección SIN fila. 2 medidos en 32 páginas. */
      const sueltos = modulosDe(sec).filter((m) => !enFilas.has(m));
      censo.sueltos += sueltos.length;

      const seccion = {};
      if (sueltos.length) {
        const ms = sueltos
          .map((m) => {
            censo.modulos++;
            const t = tipoDe(m);
            censo.porTipo[t] = (censo.porTipo[t] || 0) + 1;
            return aBloque(html, m, p.ruta);
          })
          .filter(Boolean);
        if (ms.length) seccion.modulosSueltos = ms;
      }

      const filasOut = [];
      for (const fila of filas) {
        censo.filas++;
        const cols = columnasDe(fila);
        const columnas = [];
        for (const col of cols) {
          censo.columnas++;
          const brutos = modulosDe(col).map((m) => {
            censo.modulos++;
            const t = tipoDe(m);
            censo.porTipo[t] = (censo.porTipo[t] || 0) + 1;
            return aBloque(html, m, p.ruta);
          });
          const modulos = brutos.filter(Boolean);
          /* ⚠ Una columna VACÍA no se filtra: hay **21 medidas** en las 31, y son
           * retícula legítima de Divi. Lo que se colapsa es sólo la columna que
           * **la retirada** dejó sin nada — `tenía > 0 y ahora 0` —, porque ésa
           * no es una columna vacía del original: es un contenedor de cascarón.
           * Filtrar por «está vacía» se llevaría las 21 por delante. */
          if (brutos.length && !modulos.length) {
            emision.columnasColapsadas++;
            continue;
          }
          columnas.push({ ancho: anchoDe(col), modulos });
        }
        if (columnas.length) filasOut.push({ columnas });
        else if (cols.length) emision.filasColapsadas++;
      }
      if (filasOut.length) seccion.filas = filasOut;
      if (seccion.filas || seccion.modulosSueltos) bloques.push(seccion);
      else emision.seccionesColapsadas++;
    }
    if (bloques.length) doc.bloques = bloques;
  }

  docs.push(doc);
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6bis · LAS TRANSFORMACIONES DE IMPORTACIÓN — hoy sólo T11 (D1, 2026-08-22)
 *
 * `data-teams="true"` es el residuo de **pegar desde Teams** en el editor. El
 * propietario decidió limpiarlo con una transformación en vez de ampliar
 * `ATRIBUTOS_CENSADOS`, que es la whitelist de seguridad de cinco colecciones
 * verificadas (razón entera en `ESQUEMA-CMS.md` §3.2 T11).
 *
 * ── Se aplica en una PASADA FINAL sobre lo emitido, y no módulo a módulo ──
 * Los campos ricos de este arquetipo son **seis** (`texto-pagina.html`,
 * `toggle.cuerpo`, las dos variantes de slider, `blurb.descripcion`,
 * `cuerpoClasico`), y enumerarlos aquí sería **una lista escrita a mano dentro
 * de un instrumento** (§regla 9, 7.º caso): envejece contra el esquema, en
 * silencio, y un campo rico nuevo entraría sin transformar sin dar error. La
 * pasada recorre **todas** las cadenas del documento, así que un campo nuevo
 * entra solo.
 *
 * ⚠ Y como la pasada es ciega al campo, **lo que la sostiene es la medida, no
 * el argumento**: `derivaciones/t11-noop-f33.log` aplica T11 a los **788**
 * `.html` de `corpus/` y **787 salen byte a byte idénticos**, con seis
 * controles sintéticos de las formas vecinas que NO debe tocar. Aquí, además,
 * se publica **la ruta exacta** de cada aplicación: si tocara algo que no es un
 * campo rico, saldría con nombre y apellidos.
 *
 * ── La guarda: DIANA DE ENTRADA vs APLICADAS EN LA SALIDA ────────────────
 * La diana se cuenta sobre el HTML **de entrada de las 31 páginas** y las
 * aplicaciones sobre **los documentos emitidos**. Si la entrada trae más de las
 * que se aplican, el atributo vive en un sitio que el extractor no recoge —el
 * cascarón, un campo que no viaja— y eso sale ROJO en vez de salir como «ya
 * está limpio». El número NO se cablea: se deriva de la fuente (§regla 5ter).
 * ═════════════════════════════════════════════════════════════════════════ */
const T_IMPORT = { aplicadas: 0, rutas: [], diana: dianaEntrada, porT: {} };
if (SABOTAJE !== "t11")
  (function transforma(v, ruta) {
    if (Array.isArray(v)) return v.forEach((x, i) => transforma(x, `${ruta}[${i}]`));
    if (!v || typeof v !== "object") return;
    for (const [k, x] of Object.entries(v)) {
      if (typeof x === "string") {
        let s = x;
        let n = 0;
        for (const t of TRANSFORMACIONES_F33) {
          const r = t.aplica(s);
          if (r.n) {
            n += r.n;
            T_IMPORT.porT[t.id] = (T_IMPORT.porT[t.id] || 0) + r.n;
          }
          s = r.html;
        }
        if (n) {
          /* Reconstrucción: T11 quita el ATRIBUTO y nada más. Se comprueba con
           * los bytes, no con la intención (§verificar contra la salida). */
          const quitados = [...x.matchAll(/\sdata-teams\s*=\s*"[^"]*"/gi)];
          const suma = s.length + quitados.reduce((a, m) => a + m[0].length, 0);
          T_IMPORT.aplicadas += n;
          T_IMPORT.rutas.push({ ruta: `${ruta}.${k}`, n, chars: x.length - s.length, reconstruye: suma === x.length });
          v[k] = s;
        }
      } else transforma(x, `${ruta}.${k}`);
    }
  })(docs, "docs");

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · LOS CONTROLES — antes de congelar nada
 * ═════════════════════════════════════════════════════════════════════════ */
let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

/** El sabotaje de la geometría: escribir un ritmo donde el esquema dice SIN PROBAR. */
if (SABOTAJE === "geometria" && docs[0]?.bloques?.[0]) docs[0].bloques[0].pt = { valor: 0, unidad: "px" };

/* ══════════════════════════════════════════════════════════════════════════
 * 7bis · LA GUARDA DE LA RETIRADA — que no se lleve contenido por delante
 *
 * Dos condiciones sobre CADA módulo tocado, y hacen falta las dos: la primera
 * dice que se quitó **exactamente el contenedor**, la segunda que **nadie se fue
 * con texto dentro**. Un módulo omitido con resto es el arreglo falso de esta
 * tanda, y sale por su propio motivo, nombrando la página.
 * ═════════════════════════════════════════════════════════════════════════ */
(function contarEmitidos(v) {
  if (Array.isArray(v)) return v.forEach(contarEmitidos);
  if (v && typeof v === "object") {
    if (v.kind) emision.modulos++;
    for (const x of Object.values(v)) contarEmitidos(x);
  }
})(docs.map((d) => d.bloques ?? []));

const retiradaMal = [];
for (const r of RETIRADAS) {
  const suma = r.limpioChars + r.retirados.reduce((a, x) => a + x.chars, 0);
  if (suma !== r.brutoChars)
    retiradaMal.push(`${r.ruta}: reconstrucción ${suma} ≠ ${r.brutoChars} chars — la retirada quitó algo que no era el contenedor`);
  if (r.moduloOmitido && r.restoChars > 0)
    retiradaMal.push(`${r.ruta}: módulo OMITIDO con ${r.restoChars} chars de resto — se lleva contenido del editor por delante`);
}
if (retiradaMal.length)
  err(
    `RETIRADA QUE SE LLEVA CONTENIDO: ${retiradaMal.length} caso(s) —\n   ${retiradaMal.join("\n   ")}\n` +
      `   Lo generado se va; lo que quede al lado lo escribió una persona y se CONSERVA.`,
  );

/**
 * §regla del cero, aplicada a la retirada: `clasifica-f33` midió 12 módulos con
 * contenedor generado en las 31. Si esto retira 0, no es que el corpus haya
 * cambiado — es que los tres patrones dejaron de casar, y eso sale ROJO en vez
 * de salir como «ya no hay nada que retirar».
 */
if (SABOTAJE !== "sin-secciones" && !RETIRADAS.length)
  err(
    `0 RETIRADAS en las ${docs.length} páginas: los 3 patrones de \`GENERADOS\` no casan con nada.\n` +
      `   \`clasifica-f33\` midió 12 módulos con contenedor generado. Un patrón muerto no es un cero (§sondas 4).`,
  );

/**
 * §regla del cero: un extractor que no encuentra NI UN módulo en NINGUNA página
 * no ha medido «páginas vacías» — tiene el parser roto.
 */
if (!censo.modulos) err(`0 MÓDULOS en las ${docs.length} páginas: el parser no casa, no es que estén vacías.`);
if (!censo.secciones) err(`0 SECCIONES propias: `+`\`seccionesPropias\` no casa con nada (§sondas 4).`);
if (sinFichero.length) err(`${sinFichero.length} ruta(s) SIN CAPTURA: ${sinFichero.join(" · ")}`);
for (const x of problemas) err(x);

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA GUARDA DEL PLENO — un campo AUSENTE en el 100 % de su tipo
 *
 * Es la lección del `<img>` puesta en código en vez de en un comentario
 * (§sondas 3: *documentado no es conectado*). El defecto que se pagó —71 de 71
 * imágenes sin `src`— no dio error, dio un dato plausible-por-omisión, y lo
 * destapó Payload dos pasos más allá.
 *
 * > **Un campo que sale ausente en TODAS las instancias de su tipo no dice «el
 * > original no lo trae»: dice «no lo sé leer».** Es el complementario de la
 * > regla del cero, con el pleno invertido — y a diferencia de un selector
 * > muerto, aquí el módulo SÍ se encuentra: lo que no casa es una pieza de
 * > dentro, así que ni el recuento de tipos ni el cruce con `arbol-f33` pueden
 * > verlo. Los dos siguen dando 313.
 *
 * ⚠ Se declara qué campos son **exigibles por tipo**, y se declara con su
 * denominador. Un campo legítimamente opcional —`alt`, `href`, `texto`— no
 * entra: lo que se vigila es lo que el ESQUEMA marca `required`, porque ahí
 * «ausente en todas» sólo puede ser el instrumento.
 * ═════════════════════════════════════════════════════════════════════════ */
const EXIGIBLES = {
  "texto-pagina": ["html"],
  /**
   * ⚠ **El origen de la imagen son DOS campos ALTERNATIVOS desde D2**
   * (2026-08-23): `src` (asset local, `upload → media`) o `srcExterno` (la URL
   * absoluta cuando el asset vive fuera). El pleno se mide sobre **el par**:
   * que falten LOS DOS en el 100 % sí sería el instrumento; que falte uno de
   * los dos es dato, y su reparto se publica en §5 del informe.
   *
   * Una entrada de `EXIGIBLES` puede ser un nombre o un ARRAY de alternativas.
   */
  "imagen-pagina": [["src", "srcExterno"]],
  "boton-pagina": ["label", "href"],
  codigo: ["html"],
  toggle: ["titulo", "cuerpo"],
  "video-pagina": ["embedUrl"],
  blurb: ["titulo"],
  "slider-completo": ["diapositivas"],
  slider: ["diapositivas"],
  mapa: ["pines"],
  icono: ["icono"],
};
const plenos = [];
/** El reparto local/externo del origen de imagen, y sus defectos (D2). */
const origenImagen = { total: 0, local: 0, externo: 0, mal: [] };
{
  const porTipo = {};
  const rec = (v) => {
    if (Array.isArray(v)) return v.forEach(rec);
    if (v && typeof v === "object") {
      if (v.kind) (porTipo[v.kind] ??= []).push(v);
      for (const x of Object.values(v)) rec(x);
    }
  };
  for (const d of docs) rec(d.bloques ?? []);
  const vacio = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
  for (const [tipo, campos] of Object.entries(EXIGIBLES)) {
    const inst = porTipo[tipo] ?? [];
    if (!inst.length) continue;
    for (const c of campos) {
      /* Un nombre o un array de ALTERNATIVAS: falta sólo si faltan todas. */
      const alternativas = Array.isArray(c) ? c : [c];
      const faltan = inst.filter((m) => alternativas.every((k) => vacio(m[k])));
      if (faltan.length === inst.length)
        plenos.push(`${tipo}.${alternativas.join("|")}: ausente en ${faltan.length}/${inst.length}`);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   * LA GUARDA DEL ORIGEN DE IMAGEN — el espejo del `validate` del esquema
   *
   * `validaOrigenImagen` exige **exactamente uno** de `src`/`srcExterno`, y
   * Payload lo comprobaría al sembrar. Comprobarlo aquí es lo que hace que el
   * defecto salga **en el extractor**, con la ruta del módulo, en vez de
   * salir dos pasos más allá como un rechazo de un documento entero
   * (§*un proceso que aborta en el primer fallo contesta «hay al menos uno»*).
   *
   * Y el segundo lado, que es el que el sabotaje `media-externa` ejercita: un
   * `src` que NO es una ruta local. `creaContexto().media` tira con eso, así
   * que dejarlo pasar sería mandar a la siembra un dato que ya se sabe malo.
   * ═══════════════════════════════════════════════════════════════════════ */
  const imgs = porTipo["imagen-pagina"] ?? [];
  origenImagen.local = imgs.filter((m) => !vacio(m.src)).length;
  origenImagen.externo = imgs.filter((m) => !vacio(m.srcExterno)).length;
  origenImagen.total = imgs.length;
  for (const m of imgs) {
    const l = !vacio(m.src);
    const e = !vacio(m.srcExterno);
    if (l && e) origenImagen.mal.push(`dos orígenes a la vez: src=${String(m.src).slice(0, 50)} · srcExterno=${String(m.srcExterno).slice(0, 50)}`);
    else if (!l && !e) origenImagen.mal.push(`imagen SIN origen (ni local ni externo)`);
    else if (l && !String(m.src).startsWith("/"))
      origenImagen.mal.push(`\`src\` no es una ruta local: ${String(m.src).slice(0, 70)} — \`creaContexto().media\` TIRA con eso`);
  }
}
if (plenos.length)
  err(
    `PLENO DE AUSENCIAS: ${plenos.length} campo(s) exigibles ausentes en el 100 % de su tipo —\n` +
      `   ${plenos.join("\n   ")}\n` +
      `   Un campo que falta en TODAS las instancias no dice «el original no lo trae»:\n` +
      `   dice que el selector no casa. Ni el recuento de tipos ni el cruce lo ven.`,
  );

if (origenImagen.mal.length)
  err(
    `ORIGEN DE IMAGEN: ${origenImagen.mal.length} módulo(s) con el origen mal puesto —\n` +
      `   ${[...new Set(origenImagen.mal)].slice(0, 6).join("\n   ")}\n` +
      `   \`validaOrigenImagen\` exige EXACTAMENTE UNO de \`src\` / \`srcExterno\`, y \`src\`\n` +
      `   es \`upload → media\`: sólo expresa un asset LOCAL. Un absoluto ahí no da un\n` +
      `   defecto de imagen, mata la siembra del documento entero.`,
  );

/* ── T11: lo aplicado tiene que cubrir lo que la ENTRADA traía ───────────── */
const t11Mal = [];
if (SABOTAJE !== "t11") {
  if (T_IMPORT.aplicadas !== T_IMPORT.diana)
    t11Mal.push(
      `la entrada de las ${docs.length} páginas trae ${T_IMPORT.diana} diana(s) y lo emitido sólo recogió ` +
        `${T_IMPORT.aplicadas}: el atributo vive en un sitio que el extractor no transforma`,
    );
  for (const r of T_IMPORT.rutas)
    if (!r.reconstruye) t11Mal.push(`${r.ruta}: la reconstrucción no cuadra — T11 se llevó algo que no era el atributo`);
  /* §sondas 4: 0 aplicadas con diana > 0 sería un patrón muerto leído como
   * «ya está limpio». Y con diana 0 también sale rojo: `atributo-teams-f33`
   * midió 1 ocurrencia en el corpus, así que 0 significa que el patrón dejó de
   * casar, no que el corpus haya cambiado. */
  if (!T_IMPORT.diana)
    t11Mal.push(`0 dianas en las ${docs.length} páginas: \`atributo-teams-f33\` midió 1. Un patrón muerto no es un cero.`);
}
/* La postcondición, sobre lo EMITIDO: es la que el sabotaje `t11` tiene que
 * hacer morder. Se pregunta a la transformación, no a una regex de aquí. */
{
  const emitido = JSON.stringify(docs);
  for (const t of TRANSFORMACIONES_F33)
    for (const v of t.post(emitido)) t11Mal.push(`postcondición de ${t.id.toUpperCase()}: ${v}`);
}
if (t11Mal.length)
  err(
    `TRANSFORMACIÓN DE IMPORTACIÓN: ${t11Mal.length} problema(s) —\n   ${t11Mal.join("\n   ")}\n` +
      `   Sin T11, \`data-teams\` llega al campo rico y \`campoHtml\` lo rechaza: el bloqueo\n` +
      `   no lo caza el extractor, lo caza Payload al sembrar (§F3-3-BLOQUEOS-DE-SIEMBRA).`,
  );

/**
 * ⚠ EL CRUCE OBLIGATORIO (§sondas 4): otro instrumento, mismo objeto.
 * `arbol-f33.log` contó 313 módulos en 11 tipos con el mismo parser pero por
 * otro camino. Si esto da otro número, el que está mal es esto.
 */
/**
 * ⚠⚠ T1 (113.ª) · A PARTIR DE AQUÍ LOS DOS CAMINOS **NO** SON EL MISMO PARSER,
 * Y ESO SE DECLARA EN VEZ DE AJUSTAR EL NÚMERO EN SILENCIO.
 *
 * El cruce se escribió cuando extractor y `arbol-f33` recorrían con el MISMO
 * predicado. Ya no: este extractor lleva `tipoTerceros`, que para en módulos
 * que no son de Divi, y `arbol-f33` **no puede verlos** —su `tipoDe` exige
 * `et_pb_<tipo>_<n>`— y se deja así a propósito (15 consumidores, §regla 29
 * mitad 2, arriba).
 *
 * O sea que el cruce sigue valiendo para los **11 tipos de Divi**, que es lo
 * que `arbol-f33` mide, y la fila de terceros es **la diferencia conocida y
 * medida** entre los dos caminantes: 313 + 1 = 314.
 *
 * **La guarda NO se debilita:** cualquier tipo que no esté en esta tabla sigue
 * saliendo por discrepancia. Lo que cambia es que la tabla ahora dice qué
 * instrumento respalda cada fila.
 */
const ESPERADO = { text: 151, image: 71, video: 30, blurb: 22, button: 13, toggle: 10, code: 9, icon: 3, fullwidth_slider: 2, map: 1, slider: 1, dvmd_table_maker: 1 };
const TOTAL_ESPERADO = Object.values(ESPERADO).reduce((a, b) => a + b, 0);
const discrepancias = [];
for (const [t, n] of Object.entries(ESPERADO)) if ((censo.porTipo[t] || 0) !== n) discrepancias.push(`${t}: ${censo.porTipo[t] || 0} ≠ ${n}`);
for (const t of Object.keys(censo.porTipo)) if (!(t in ESPERADO)) discrepancias.push(`${t}: ${censo.porTipo[t]} y arbol-f33 no lo tiene`);

/**
 * ⚠⚠ LA GUARDA DE LA GEOMETRÍA — el arreglo falso puesto en código.
 *
 * Recorre lo emitido y exige que NO haya ni una clave de ritmo ni de ancho. El
 * esquema las declara «SIN PROBAR», y `medida()` dice que vacío = el default de
 * Divi: escribir un número ahí **afirma que el editor lo tocó**, que es
 * exactamente el campo inventado del que avisan los tres huecos de la 95.ª.
 */
const GEOMETRIA = new Set(["pt", "pb", "mt", "mb", "ritmo", "anchoPct"]);
const geoEscrita = [];
(function barre(v, ruta) {
  if (Array.isArray(v)) return v.forEach((x, i) => barre(x, `${ruta}[${i}]`));
  if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (GEOMETRIA.has(k)) geoEscrita.push(`${ruta}.${k}`);
      barre(x, `${ruta}.${k}`);
    }
})(docs, "docs");

/* ══════════════════════════════════════════════════════════════════════════
 * 8 · INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\n════════ extractor-f33 · corpus congelado, sin red ════════\n`);
console.log(`  ── 1 · DOMINIO ──`);
console.log(`   las 31 de f33-rutas.json          ${String(RUTAS.paginas.length).padStart(4)}`);
console.log(`   con captura en corpus/fase-3      ${String(docs.length).padStart(4)}`);
console.log(`   documentos producidos             ${String(docs.length).padStart(4)}`);
console.log(`   por régimen                            ${Object.entries(censo.porRegimen).sort().map(([k, v]) => `${k}×${v}`).join(" · ")}`);

console.log(`\n  ── 2 · RETÍCULA ──`);
console.log(`   secciones ${String(censo.secciones).padStart(4)}   filas ${String(censo.filas).padStart(4)}   columnas ${String(censo.columnas).padStart(4)}`);
console.log(`   módulos   ${String(censo.modulos).padStart(4)}   de ellos SUELTOS (fullwidth, sin fila) ${censo.sueltos}`);

console.log(`\n  ── 3 · POR TIPO, cruzado con arbol-f33.log (otro camino, mismo objeto) ──`);
for (const [t, n] of Object.entries(ESPERADO)) {
  const v = censo.porTipo[t] || 0;
  console.log(`   ${t.padEnd(20)} ${String(v).padStart(4)}   ${v === n ? "✓" : `✗ arbol-f33 dice ${n}`}`);
}
console.log(`   ${"TOTAL".padEnd(20)} ${String(censo.modulos).padStart(4)}   ${censo.modulos === TOTAL_ESPERADO ? "✓" : `✗ arbol-f33 dice ${TOTAL_ESPERADO}`}`);

console.log(`\n  ── 3bis · LA RETIRADA DE LO GENERADO (clasifica-f33, 2026-08-23) ──`);
{
  const porCont = {};
  for (const r of RETIRADAS)
    for (const x of r.retirados) {
      const k = `${x.contenedor} (${x.clase})`;
      porCont[k] ??= { modulos: 0, chars: 0, evidencia: x.evidencia, paginas: new Set() };
      porCont[k].modulos++;
      porCont[k].chars += x.chars;
      porCont[k].paginas.add(r.ruta);
    }
  for (const [k, v] of Object.entries(porCont).sort())
    console.log(`   ${k.padEnd(32)} ${String(v.modulos).padStart(3)} contenedor(es) · ${String(v.paginas.size).padStart(2)} páginas · ${String(v.chars).padStart(6)} chars   ${v.evidencia}`);
  const omit = RETIRADAS.filter((r) => r.moduloOmitido).length;
  console.log(`   ${"módulos tocados".padEnd(32)} ${String(RETIRADAS.length).padStart(3)}`);
  console.log(`   ${"· omitidos (resto en blanco)".padEnd(32)} ${String(omit).padStart(3)}`);
  console.log(`   ${"· conservados (queda texto)".padEnd(32)} ${String(RETIRADAS.length - omit).padStart(3)}   ← si no es 0, hay contenido del editor junto a un generado`);
  console.log(`   ${"árbol → emitido".padEnd(32)} ${String(censo.modulos).padStart(3)} → ${emision.modulos} módulos`);
  console.log(`   ${"colapsados por la retirada".padEnd(32)} ${emision.columnasColapsadas} columnas · ${emision.filasColapsadas} filas · ${emision.seccionesColapsadas} secciones`);
  console.log(`   (las 21 columnas vacías del original NO se filtran: son retícula, no cascarón)`);
  const consultas = RETIRADAS.filter((r) => r.retirados.some((x) => x.clase === "CONSULTA"));
  console.log(`\n   ⚠ HUECO DECLARADO — ${consultas.length} página(s) quedan servidas INCOMPLETAS:`);
  for (const r of consultas)
    console.log(`      ${r.ruta}  → ${r.retirados.filter((x) => x.clase === "CONSULTA").map((x) => x.contenedor).join(", ")}`);
  console.log(`      Un listado no tiene contenido propio: es una CONSULTA, y congelarla como`);
  console.log(`      texto es el error que esa regla existe para evitar. Lo serviría un bloque`);
  console.log(`      de listado embebido que NO existe todavía — ESQUEMA-CMS §2j.6.`);
}

console.log(`\n  ── 4 · GEOMETRÍA ──`);
console.log(`   claves de ritmo/ancho escritas    ${String(geoEscrita.length).padStart(4)}   ← tiene que ser 0`);
console.log(`   (SIN ESCRIBIR se omite · NO MEDIBLE se declara · ninguno se convierte en número)`);

console.log(`\n  ── 5 · EL ORIGEN DE LA IMAGEN (D2, 2026-08-22) ──`);
console.log(`   módulos \`imagen-pagina\`           ${String(origenImagen.total).padStart(4)}`);
console.log(`   · \`src\`        (asset LOCAL)      ${String(origenImagen.local).padStart(4)}`);
console.log(`   · \`srcExterno\` (asset FUERA)      ${String(origenImagen.externo).padStart(4)}   ← se deja ABSOLUTO: es lo que el original sirve`);
console.log(`   con el origen mal puesto          ${String(origenImagen.mal.length).padStart(4)}   ← tiene que ser 0`);
console.log(`   (la regla de no hotlinkear es sobre kunakair.com, para no depender del original)`);

console.log(`\n  ── 6 · TRANSFORMACIONES DE IMPORTACIÓN ──`);
console.log(`   diana en la ENTRADA de las 31     ${String(T_IMPORT.diana).padStart(4)}`);
console.log(`   aplicadas sobre lo EMITIDO        ${String(T_IMPORT.aplicadas).padStart(4)}   ${T_IMPORT.aplicadas === T_IMPORT.diana ? "✓" : "✗ la entrada trae más de las que se recogen"}`);
for (const t of TRANSFORMACIONES_F33)
  console.log(`   ${t.id.padEnd(6)} ${t.titulo.slice(6, 62).padEnd(58)} ${String(T_IMPORT.porT[t.id] || 0).padStart(4)}`);
for (const r of T_IMPORT.rutas) console.log(`      ${r.ruta}  (−${r.chars} chars${r.reconstruye ? "" : ", RECONSTRUCCIÓN MAL"})`);
console.log(`   NO-OP fuera de aquí: 1 de 788 ficheros de corpus/ (t11-noop-f33.log, 787 idénticos byte a byte)`);

console.log(`\n  ── 7 · CAMPOS OMITIDOS POR COINCIDIR CON EL DEFECTO DEL ESQUEMA ──`);
{
  const por = {};
  for (const o of OMITIDOS_POR_DEFECTO) {
    const k = `${o.kind}.${o.campo} = ${JSON.stringify(o.valor)}`;
    por[k] = (por[k] || 0) + 1;
  }
  console.log(`   bloques con defecto declarado     ${String(DEFECTOS.size).padStart(4)}   ${[...DEFECTOS.keys()].sort().join(" · ")}`);
  console.log(`   campos omitidos                   ${String(OMITIDOS_POR_DEFECTO.length).padStart(4)}`);
  for (const [k, v] of Object.entries(por).sort()) console.log(`      ${String(v).padStart(4)} × ${k}`);
  console.log(`   («igual al defecto» = «no escrito»: es la segunda mitad de \`conDefecto\`, y en`);
  console.log(`    la DB las dos preimágenes son la MISMA fila. El lado medido elige OMITIR.)`);
}

if (discrepancias.length) err(`CRUCE CON arbol-f33: ${discrepancias.length} discrepancia(s) — ${discrepancias.join(" · ")}`);
if (geoEscrita.length)
  err(
    `GEOMETRÍA ESCRITA: ${geoEscrita.length} clave(s) — ${geoEscrita.slice(0, 5).join(" · ")}${geoEscrita.length > 5 ? " …" : ""}\n` +
      `   El esquema las declara SIN PROBAR y \`medida()\` dice que vacío = el default de\n` +
      `   Divi. Escribir un número afirma que el editor lo tocó: eso es un CAMPO INVENTADO.`,
  );

/* ⚠ §regla 24, mitad de higiene: **la sonda desvía sus propios sabotajes.** Si
 * el desvío dependiera de que quien la lanza ponga además `NEG=`, el nombre
 * CANÓNICO quedaría al alcance de una corrida de control — y lo que sale
 * entonces es lo peor de §regla 7: un fichero con **nombre de medida y
 * contenido de sabotaje**, plausible y con la autoridad de una congelada. Se
 * arregla la CLASE (aquí), no la instancia (acordarse). */
const SALIDA = SABOTAJE ? nombreNeg("medidas/f33-extraido.json", SABOTAJE) : "medidas/f33-extraido.json";
if (SABOTAJE) console.log(`\n  ⚠ SABOTAJE activo: la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.`);

w(SALIDA, {
  meta: {
    fecha: hoy(),
    sonda: "extractor-f33",
    pregunta: "¿qué documentos de `paginas` produce el corpus de las 31 de la cola larga?",
    fuente: "corpus/fase-3/ (32/32 con sus hojas) + medidas/f33-rutas.json (el dominio)",
    parser: "docs/research/cola-larga/derivaciones/arbol-f33.mjs — importado, no reescrito",
    sabotaje: SABOTAJE,
    alcance: {
      completaPara: "SEMBRAR las 31 en la colección `paginas`",
      noCubre: [
        "la GEOMETRÍA: `pt/pb/mt/mb` y `anchoPct` salen SIN ESCRIBIR (0 ejes comparados en las 31). No es 0: es ausente, que en `medida()` significa «el default de Divi»",
        "las otras 12 transformaciones de `TRANSFORMACIONES`: cuál le toca a este arquetipo está SIN MEDIR — habría que derivar la diana de cada una contra `corpus/fase-3/`",
        "la CLASE «residuo de pegado del editor»: T11 limpia UN atributo (`data-teams`). Cuántos más hay de esa familia sale SIN MEDIR, que no es 0 (`atributo-teams-f33.log` §ALCANCE)",
        "`srcset`: omisión DECLARADA, M-IMG sigue abierta en §CMS-0b",
        "los 36 módulos dentro de desplegables CERRADOS: su geometría NO ES MEDIBLE sin interacción, y no medible no es 0",
        "`anchoPct` de las 25 instancias en LÍNEA: el instrumento no las midió (una razón sobre un enlínea mide el texto, no una declaración)",
      ],
    },
  },
  censo,
  emision,
  /* Nada se va en silencio: la retirada se congela entera, módulo a módulo. */
  retirada: {
    derivadaDe: "docs/research/cola-larga/derivaciones/clasifica-f33.{mjs,log} — 120 ocurrencias, 0 de contenido",
    contenedores: GENERADOS.map((g) => ({ id: g.id, clase: g.clase, evidencia: g.evidencia })),
    modulosTocados: RETIRADAS.length,
    modulosOmitidos: RETIRADAS.filter((r) => r.moduloOmitido).length,
    modulosConservados: RETIRADAS.filter((r) => !r.moduloOmitido).length,
    detalle: RETIRADAS,
  },
  cruce: { esperado: ESPERADO, totalEsperado: TOTAL_ESPERADO, discrepancias },
  geometria: { clavesEscritas: geoEscrita.length, detalle: geoEscrita.slice(0, 20) },
  /**
   * D2 · el reparto del origen de imagen. `externo` es el CANAL NUEVO —el asset
   * alojado fuera— y sale con su cardinal aunque sea 1: un canal declarado con
   * su cero (o con su uno) es un hueco visible, no la próxima sorpresa.
   */
  origenImagen: {
    decision: "D2 (propietario, 2026-08-22): se deja ABSOLUTO. No se captura.",
    total: origenImagen.total,
    local: origenImagen.local,
    externo: origenImagen.externo,
    mal: origenImagen.mal,
  },
  /** D1 · las transformaciones de importación, con diana y aplicadas. */
  transformaciones: {
    decision: "D1 (propietario, 2026-08-22): transformación de importación; `ATRIBUTOS_CENSADOS` NO se amplía.",
    cadena: TRANSFORMACIONES_F33.map((t) => ({ id: t.id, titulo: t.titulo })),
    dianaEntrada: T_IMPORT.diana,
    aplicadas: T_IMPORT.aplicadas,
    porT: T_IMPORT.porT,
    rutas: T_IMPORT.rutas,
    noOp: "derivaciones/t11-noop-f33.log — 1 de 788 ficheros de corpus/ tocado, 787 idénticos byte a byte",
  },
  /**
   * Los campos que se omiten por coincidir con el defecto que el esquema
   * declara. Se congelan con su ruta: una omisión sin censo es indistinguible
   * de un campo que el extractor no supo leer (§regla 1).
   */
  omitidosPorDefecto: {
    porQue: "`conDefecto` escribe `null` cuando el valor coincide con el defecto, así que en la DB el defecto explícito y la ausencia son la MISMA fila. El lado medido elige OMITIR.",
    bloquesConDefecto: Object.fromEntries([...DEFECTOS.entries()].sort()),
    n: OMITIDOS_POR_DEFECTO.length,
    detalle: OMITIDOS_POR_DEFECTO,
  },
  catalogo: { paginas: docs },
});

console.log(
  `\n${rojo ? "❌" : "✅"} extractor-f33: ${docs.length} documentos · ${censo.modulos} módulos en el árbol → ` +
    `${emision.modulos} emitidos · ${Object.keys(censo.porTipo).length} tipos · ${geoEscrita.length} claves de geometría · ` +
    `${RETIRADAS.length} módulos con generado retirado · ${T_IMPORT.aplicadas}/${T_IMPORT.diana} transformaciones de importación · ` +
    `${origenImagen.externo} imagen(es) de origen EXTERNO · ${rojo} guarda(s) en rojo`,
);
if (rojo) process.exit(2);
