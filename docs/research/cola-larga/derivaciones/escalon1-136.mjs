/**
 * 136.ª · PASO 0 punto 3 + ESCALÓN 1 — LOS DOS MODELOS DE `et_pb_code`,
 * MEDIDOS EN LA MISMA UNIDAD.
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 *   0 · UNIDAD ...... bloque, campo e instancia son TRES cosas y se publican
 *                     los tres cardinales por separado (§*dos lecturas pueden
 *                     dar el mismo cardinal contando unidades distintas*);
 *   1 · RE-DERIVA ... los 4 heredados: los 9 · el `{type:"code"}` sin
 *                     `validate` · los 21 tokens · el «9 de 9»;
 *   2 · CAMPOS ...... campo a campo, cuáles coinciden y cuáles sólo tiene uno;
 *   3 · VALIDACIÓN .. qué valida cada uno — es lo que produjo el «9 de 9»;
 *   4 · INSTANCIAS .. cuántas, dónde, y cuántas sembradas;
 *   5 · CONTENIDO ... ¿cabe lo de las 9 en `formulario-arq`? ¿y al revés?
 *                     NO por heurística: se corre el EXTRACTOR REAL
 *                     (§*cuando el cambio se pueda aplicar, aplícalo y mide*);
 *   6 · DIRECCIÓN B . ¿está `formulario-arq` sobre-generalizado? Los dos
 *                     sentidos con el mismo barrido (§*una comprobación
 *                     retroactiva se enmarca en las DOS direcciones*).
 *
 * ── QUÉ **NO** CONTESTA (§*antes de construir sobre una medida, escribe qué
 *    preguntas NO contesta*) ─────────────────────────────────────────────
 *   · no DECIDE. El expediente es para el propietario;
 *   · no toca la DB (socket `ECONNREFUSED`): «cuántas sembradas» se deriva
 *     del CATÁLOGO congelado y del cableado del sembrador, y queda **SIN
 *     COMPROBAR contra la tabla**, declarado con su motivo;
 *   · no mide la geometría ni el render de ninguna de las dos: sólo el MODELO
 *     y el DATO que cada modelo tiene que portar;
 *   · no dice si el extractor DEBE tratar el caso que halle: dice si hoy lo
 *     nombra o lo pierde.
 *
 * ── POR QUÉ EL EXTRACTOR SE CORTA DEL FUENTE Y NO SE COPIA ───────────────
 * `extractor-f35.mjs` no exporta nada. Copiar `formularioDe` haría que la
 * sonda y el extractor pudieran DIVERGIR sin que nada avisara — el control
 * mediría mi copia, no el objeto. Se corta del fuente **por ESTRUCTURA**
 * (casando llaves), nunca por un comentario: §*un marcador de texto no
 * delimita una región de código* — un comentario puede vivir DENTRO de la
 * región que dice delimitar y la lectura se traga la cola entera.
 *
 * ── LOS DOS TESTIGOS, UNO POR ESTADO (§regla 28d, polaridad) ─────────────
 * Un control cuyo único testigo es un defecto no puede leer su propia
 * ausencia: «no lo encuentro porque no está» y «no lo encuentro porque no sé
 * buscarlo» se escriben igual. Así que van los dos:
 *   · T1 · SABE VER LO QUE CABE ... la función cortada, corrida sobre el
 *          `<form>` de `monitor-calidad-aire.html`, tiene que reproducir la
 *          congelada `formulario-arq` AL BIT (6 campos · 12 ocultos · 282
 *          opciones · «DESCARGAR»). Si no, el corte está mal y nada vale;
 *   · T2 · SABE VER LO QUE NO CABE . con el sabotaje que el PROPIO extractor
 *          declara (`control-sin-sitio`, inyecta `<input type=file>`),
 *          `SIN_SITIO_FORM` tiene que CRECER. Sin él, un 0 de piezas sin
 *          sitio sería del instrumento y no del dato (§regla 28c).
 *
 * ── SABOTAJES · reproducen el MODO DE FALLO, no la aritmética (§regla 28a) ─
 *   · `censo-mudo` ..... el validador deja de ver: el «9 de 9» tiene que
 *                        MOVERSE a 0. Si no se mueve, no ejercita el canal;
 *   · `extractor-mudo` . la función cortada devuelve null: T1 tiene que CAER;
 *   · `recorrido-ciego`  el recorrido del documento no enumera controles: el
 *                        detector de piezas sin sitio tiene que quedarse a 0
 *                        Y el testigo T2 tiene que seguir vivo — o sea que
 *                        distingue «no hay» de «no miro».
 *
 * Salida: el nombre deriva del ESTADO que describe (§regla 5, fuga de
 * `derivaciones/`), no de la tanda.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);

const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["censo-mudo", "extractor-mudo", "recorrido-ciego"];
if (SAB && !VALIDOS.includes(SAB))
  throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const F33 = join(MED, "f33-extraido.json");
const F35 = join(MED, "f35-extraido.json");
const COMUNES = join(RAIZ, "packages/cms-config/src/campos/comunes.ts");
const B_PAGINAS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const B_ARQ = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
const EXTRACTOR = join(RAIZ, "scripts/seed/extractor-f35.mjs");
const DOC_PRODUCTO = join(RAIZ, "corpus/productos/monitor-calidad-aire.html");
const PRE = [F33, F35, COMUNES, B_PAGINAS, B_ARQ, EXTRACTOR, DOC_PRODUCTO];
const faltan = PRE.filter((p) => !existsSync(p));
if (faltan.length) {
  console.error(`PRECONDICION: faltan ${faltan.length} insumos:\n  ${faltan.join("\n  ")}`);
  process.exit(1);
}

const { validaHtmlCorpus, ETIQUETAS_CENSADAS, ATRIBUTOS_CENSADOS, etiquetasFueraDelCenso, atributosFueraDelCenso } =
  await import(pathToFileURL(COMUNES).href);
const { MODULOS_PAGINA, moduloBasePagina } = await import(pathToFileURL(B_PAGINAS).href);
const { bloquesArquetipo } = await import(pathToFileURL(B_ARQ).href);

let ok = true;
const fallo = (m) => { ok = false; P(`   ❌ ${m}`); };
const bien = (m) => P(`   ✅ ${m}`);

P("=".repeat(78));
P("136.ª · ESCALÓN 1 — `MODULO_CODIGO` (paginas) contra `formulario-arq` (arquetipos)");
P("=".repeat(78));

/* ═══════════════════════════════════════════════════════════════════════
 * 0 · LA UNIDAD, ANTES DE COMPARAR NADA
 *
 * Un BLOQUE es una definición del esquema; un CAMPO es una entrada suya; una
 * INSTANCIA es una fila de dato. Los tres se escriben igual y sus cardinales
 * no son comparables entre sí.
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 0 · LA UNIDAD — tres cardinales, no uno");

/**
 * ⚠ **LAS RUTAS VAN CUALIFICADAS, y no es cosmética (§*se compara en la unidad
 * que se afirma*).** La v1 acumulaba el `name` PELADO, y `mt`, `mb` y `pb` son
 * grupos con los MISMOS subcampos: publicaba `comunes (22)` con `valor` tres
 * veces dentro. Un cardinal cuyo conjunto tiene repetidos no es el cardinal de
 * un conjunto — es §*un cardinal es un contenedor y absorbe la membresía* con
 * el contenedor puesto en el nombre corto. Con `mt.valor` cada campo es uno.
 */
const cuentaCampos = (campos, pre = "", acc = { rutas: [] }) => {
  for (const c of campos ?? []) {
    const r = c?.name ? (pre ? `${pre}.${c.name}` : c.name) : pre;
    if (c?.name && !c?.fields) acc.rutas.push(r);
    if (c?.fields) cuentaCampos(c.fields, r, acc);
  }
  acc.n = acc.rutas.length;
  acc.nombres = acc.rutas;
  return acc;
};

/**
 * La BASE de módulo se DERIVA, no se enumera (§regla 9, 7.º caso): en
 * `paginas` está exportada (`moduloBasePagina`); en `arquetipos` `COMUNES_MODULO`
 * es local, así que se deriva como **lo que comparten TODOS los bloques del
 * grupo** — que es lo que significa «común». Separarla importa porque la
 * pregunta del ESCALÓN 1 es cómo modela cada uno el CONTENIDO, y el ritmo
 * compartido la absorbe.
 */
const baseDelGrupo = (bloques) => {
  const listas = bloques.map((b) => new Set(cuentaCampos(b.fields).rutas));
  if (!listas.length) return new Set();
  return [...listas[0]].reduce((acc, r) => (listas.every((s) => s.has(r)) ? acc.add(r) : acc), new Set());
};

const bCodigo = MODULOS_PAGINA.find((b) => b.slug === "codigo");
const bCodigoArq = bloquesArquetipo.find((b) => b.slug === "codigo-arq");
const bFormArq = bloquesArquetipo.find((b) => b.slug === "formulario-arq");
if (!bCodigo) fallo("no encuentro el bloque `codigo` en MODULOS_PAGINA — ¿cambió el slug?");
if (!bFormArq) fallo("no encuentro el bloque `formulario-arq` en bloquesArquetipo");

const campCodigo = cuentaCampos(bCodigo?.fields);
const campFormArq = cuentaCampos(bFormArq?.fields);
const campCodigoArq = cuentaCampos(bCodigoArq?.fields);

/* ═══════════════════════════════════════════════════════════════════════
 * 1 · LAS INSTANCIAS — del CATÁLOGO congelado, no de la tabla
 * ═════════════════════════════════════════════════════════════════════ */
const rec = (n, out = []) => {
  if (Array.isArray(n)) { n.forEach((x) => rec(x, out)); return out; }
  if (n && typeof n === "object") {
    if (n.kind || n.blockType) out.push(n);
    for (const k of Object.keys(n)) rec(n[k], out);
  }
  return out;
};
const f33 = JSON.parse(readFileSync(F33, "utf8"));
const f35 = JSON.parse(readFileSync(F35, "utf8"));
const bloquesF33 = rec(f33);
const bloquesF35 = rec(f35.catalogo?.arquetipos ?? f35);
const instCodigo = bloquesF33.filter((m) => (m.kind ?? m.blockType) === "codigo");
/* El DOCUMENTO de cada instancia: un cardinal sin sus nombres no se puede
   sopesar (§regla 14) — «9 instancias» y «9 documentos, uno cada uno» son dos
   afirmaciones, y el expediente necesita la segunda. */
const docsCodigo = [];
(function walk(n, doc) {
  if (Array.isArray(n)) return n.forEach((x) => walk(x, doc));
  if (n && typeof n === "object") {
    const d = n.slug ?? n.ruta ?? n.doc ?? doc;
    if ((n.kind ?? n.blockType) === "codigo") docsCodigo.push(d);
    for (const k of Object.keys(n)) walk(n[k], d);
  }
})(f33, null);
const instCodigoArq = bloquesF35.filter((m) => (m.kind ?? m.blockType) === "codigo-arq");
const instFormArq = bloquesF35.filter((m) => (m.kind ?? m.blockType) === "formulario-arq");
const htmlsCodigo = instCodigo.map((m) => m.html ?? m.contenido ?? "");

P(`   modelo             BLOQUES  CAMPOS  INSTANCIAS(catálogo)`);
P(`   codigo (paginas)         1  ${String(campCodigo.n).padStart(6)}  ${String(instCodigo.length).padStart(6)}`);
P(`   formulario-arq           1  ${String(campFormArq.n).padStart(6)}  ${String(instFormArq.length).padStart(6)}`);
P(`   codigo-arq               1  ${String(campCodigoArq.n).padStart(6)}  ${String(instCodigoArq.length).padStart(6)}`);
P(`   ⚠ los tres cardinales cuentan COSAS DISTINTAS y no se comparan entre sí.`);

/* ═══════════════════════════════════════════════════════════════════════
 * 2 · RE-DERIVA LO HEREDADO (PASO 0 punto 3)
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 2 · PASO 0 punto 3 — re-deriva de lo que esta tanda hereda");

/* El campo se busca POR NOMBRE en el fuente y se comprueba contra el objeto
   RESUELTO — «el primero que valide» devuelve el `select` de otro campo. */
const nombreCampo = (ruta, slug) => {
  const txtF = readFileSync(ruta, "utf8");
  const i = txtF.indexOf(`slug: "${slug}"`);
  if (i < 0) return null;
  const trozo = txtF.slice(i, i + 600);
  const m = /campoHtml\(\s*"([^"]+)"/.exec(trozo);
  if (m) return { campo: m[1], via: "campoHtml" };
  const c = /name:\s*"([^"]+)"[^}]*type:\s*"code"/.exec(trozo) ?? /"([^"]+)",\s*\{[^}]*type:\s*"code"/.exec(trozo);
  return c ? { campo: c[1], via: "type:code" } : null;
};
const campoValidador = (bloque, ruta, slug) => {
  const decl = nombreCampo(ruta, slug);
  if (!decl || !bloque) return null;
  const busca = (campos) => {
    for (const c of campos ?? []) {
      if (c?.name === decl.campo) return c;
      if (c?.fields) { const r = busca(c.fields); if (r) return r; }
    }
    return null;
  };
  const c = busca(bloque.fields);
  return { campo: decl.campo, tipo: c?.type ?? "(no resuelto)", valida: typeof c?.validate === "function", via: decl.via };
};
const vCodigo = campoValidador(bCodigo, B_PAGINAS, "codigo");
const vCodigoArq = campoValidador(bCodigoArq, B_ARQ, "codigo-arq");

const valida = SAB === "censo-mudo" ? () => true : validaHtmlCorpus;
const veredictoA = htmlsCodigo.map((h, i) => ({
  i,
  bloquea: valida(h) !== true,
  etiquetasFuera: SAB === "censo-mudo" ? [] : etiquetasFueraDelCenso(h),
  atributosFuera: SAB === "censo-mudo" ? [] : atributosFueraDelCenso(h),
}));
const bloqueanA = veredictoA.filter((v) => v.bloquea).length;
const tokensA = new Set();
for (const v of veredictoA) {
  v.etiquetasFuera.forEach((t) => tokensA.add(`<${t}>`));
  v.atributosFuera.forEach((t) => tokensA.add(t));
}

const HEREDADO = [
  { que: "instancias de `codigo` en `paginas`", esperado: 9, medido: instCodigo.length },
  { que: "`codigo.html` es `type:code` SIN validate", esperado: "code/false", medido: `${vCodigo?.tipo}/${vCodigo?.valida}` },
  { que: "tokens fuera del censo en los 9", esperado: 21, medido: tokensA.size },
  { que: "bloquearían si se les pusiera el validador", esperado: 9, medido: bloqueanA },
];
P("   afirmación heredada                                  esperado   medido  ¿reproduce?");
for (const h of HEREDADO) {
  const rep = String(h.esperado) === String(h.medido);
  P(`   ${h.que.padEnd(52)} ${String(h.esperado).padEnd(10)} ${String(h.medido).padEnd(7)} ${rep ? "SÍ" : "**NO**"}`);
  if (!rep && !SAB) fallo(`la premisa heredada NO reproduce: ${h.que} — esperado ${h.esperado}, medido ${h.medido}`);
}
P(`\n   los ${tokensA.size} tokens: ${[...tokensA].sort().join(", ")}`);

/* ⚠ Y el cardinal del COMENTARIO del esquema es otro, y no es el mismo
   conjunto: `arquetipos.ts` enumera «sus 20 tokens» de la clase `formulario`
   a mano. Se publican LOS DOS con su diferencia nombrada (§regla 9: un
   conjunto enumerado a mano dentro del fuente es un dato recordado). */
const txtArq = readFileSync(B_ARQ, "utf8");
const mLista = /sus (\d+) tokens\s*\n?\s*\*?\s*\(([^)]*(?:\n[^)]*)*)\)/.exec(txtArq);
const listaComentario = mLista
  ? [...mLista[2].matchAll(/`([^`]+)`/g)].map((m) => m[1])
  : [];
const declarados = mLista ? Number(mLista[1]) : null;
const soloEnDato = [...tokensA].map((t) => t.replace(/[<>]/g, "")).filter((t) => !listaComentario.includes(t));
const soloEnComentario = listaComentario.filter((t) => ![...tokensA].map((x) => x.replace(/[<>]/g, "")).includes(t));

/* ═══════════════════════════════════════════════════════════════════════
 * 3 · EL EXTRACTOR REAL, CORTADO DEL FUENTE POR ESTRUCTURA
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 3 · el extractor real — cortado por ESTRUCTURA, no por comentario");

const fuenteExtractor = readFileSync(EXTRACTOR, "utf8");
const ini = fuenteExtractor.indexOf("const SIN_SITIO_FORM = [];");
const iFn = fuenteExtractor.indexOf("function formularioDe(", ini);
if (ini < 0 || iFn < 0) fallo("no localizo `SIN_SITIO_FORM` / `formularioDe` en el extractor");
/* casado de llaves — estructura, nunca prosa */
let prof = 0, fin = -1;
for (let k = fuenteExtractor.indexOf("{", iFn); k < fuenteExtractor.length; k++) {
  const ch = fuenteExtractor[k];
  if (ch === "{") prof++;
  else if (ch === "}") { prof--; if (prof === 0) { fin = k + 1; break; } }
}
if (fin < 0) fallo("las llaves de `formularioDe` no cierran — el corte no es fiable");
const trozo = fuenteExtractor.slice(ini, fin);
P(`   corte: ${trozo.length} chars · desde \`const SIN_SITIO_FORM\` hasta el cierre de \`formularioDe\``);

/**
 * ⚠ **El sabotaje anula el instrumento ENTERO, no la mitad que se mire
 * (§regla 17, 2.ª cara).** La v1 ponía `extractor-mudo` sólo en la §4 y dejaba
 * T1 llamando a la función buena: el caso salía **VERDE** con 0 instancias
 * separadoras, porque su condición de fallo mira T1 y T1 no podía caer. Puesto
 * aquí, en la única puerta por la que pasa la función cortada, caen LOS DOS
 * testigos — que es lo que significa «sin extractor no hay medida».
 */
const crea = (sabExtractor) => {
  // eslint-disable-next-line no-new-func
  const api = new Function("SABOTAJE", `${trozo}\n return { formularioDe, SIN_SITIO_FORM };`)(sabExtractor);
  if (SAB === "extractor-mudo") return { formularioDe: () => null, SIN_SITIO_FORM: api.SIN_SITIO_FORM };
  return api;
};

/* ── T1 · SABE VER LO QUE CABE — reproduce la congelada AL BIT ─────────── */
const docProducto = readFileSync(DOC_PRODUCTO, "utf8");
const mForm = /<form\b[\s\S]*?<\/form>/i.exec(docProducto);
if (!mForm) fallo("no hay <form> en `monitor-calidad-aire.html` — el testigo T1 no se puede tomar");
const api1 = crea(null);
const reproducido = mForm ? api1.formularioDe(mForm[0], "T1") : null;
const congelado = instFormArq[0] ?? null;
const T1 = congelado && reproducido
  ? {
      campos: [reproducido.campos.length, congelado.campos.length],
      ocultos: [reproducido.ocultos.length, congelado.ocultos.length],
      opciones: [
        reproducido.campos.reduce((a, c) => a + (c.opciones?.length ?? 0), 0),
        congelado.campos.reduce((a, c) => a + (c.opciones?.length ?? 0), 0),
      ],
      textoBoton: [reproducido.textoBoton, congelado.textoBoton],
      destino: [reproducido.destino, congelado.destino],
      metodo: [reproducido.metodo, congelado.metodo],
    }
  : null;
const T1ok = !!T1 && Object.values(T1).every(([a, b]) => String(a) === String(b));
P(`\n   T1 · SABE VER LO QUE CABE — el corte reproduce \`formulario-arq\` congelado:`);
if (T1) for (const [k, [a, b]] of Object.entries(T1)) P(`        ${k.padEnd(11)} corte ${String(a).padEnd(34)} congelado ${b}`);
if (T1ok) bien("T1 vivo: la función cortada ES la del extractor");
else fallo("T1 CAE: el corte no reproduce la congelada — nada de lo que sigue vale");

/* ── T2 · SABE VER LO QUE NO CABE — el sabotaje del PROPIO extractor ───── */
const api2 = crea("control-sin-sitio");
api2.formularioDe(mForm ? mForm[0] : "<form></form>", "T2");
const T2ok = api2.SIN_SITIO_FORM.length > 0;
P(`\n   T2 · SABE VER LO QUE NO CABE — con \`control-sin-sitio\` (<input type=file>):`);
P(`        SIN_SITIO_FORM = ${api2.SIN_SITIO_FORM.length} → ${JSON.stringify(api2.SIN_SITIO_FORM.map((s) => s.que))}`);
if (T2ok) bien("T2 vivo: el canal de «sin sitio» del extractor NOMBRA lo que no expresa");
else fallo("T2 CAE: el canal de «sin sitio» no responde — un 0 sería del instrumento");

/* ═══════════════════════════════════════════════════════════════════════
 * 4 · CONTENIDO — ¿CABEN LAS 9 EN `formulario-arq`?
 *
 * No se pregunta «¿cabe lo que hay?» recorriendo los campos del modelo, sino
 * «¿queda contenido SIN SITIO?» recorriendo EL DOCUMENTO (§regla 6, hermano
 * del esquema). Son dos preguntas distintas y sólo la segunda ve lo que el
 * modelo no sabe leer.
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 4 · CONTENIDO — se corre el EXTRACTOR REAL sobre los 9 de `paginas`");

const CONTROLES = ["input", "select", "textarea", "button"];
const recorreControles = (h) => {
  if (SAB === "recorrido-ciego") return [];
  const out = [];
  for (const tag of CONTROLES) {
    const re = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
    for (const m of h.matchAll(re)) {
      const a = m[1];
      const tipo = /\stype\s*=\s*["']?([a-zA-Z]+)/.exec(a)?.[1]?.toLowerCase() ?? null;
      const nombre = /\bname\s*=\s*"([^"]*)"/i.exec(a)?.[1] ?? null;
      out.push({ tag, tipo, nombre });
    }
  }
  return out;
};

const porInstancia = [];
for (let i = 0; i < htmlsCodigo.length; i++) {
  const h = htmlsCodigo[i];
  const api = crea(null);
  const emitido = SAB === "extractor-mudo" ? null : api.formularioDe(h, `paginas[${i}]`);
  const nombrados = api.SIN_SITIO_FORM.map((s) => s.que);

  const controles = recorreControles(h);
  /* lo que el modelo emitió, por `name` — la llave del dato, no el orden */
  const emitidos = new Set([
    ...(emitido?.campos ?? []).map((c) => c.nombre),
    ...(emitido?.ocultos ?? []).map((o) => o.nombre),
  ]);
  const perdidos = controles.filter(
    (c) => c.tag !== "button" && c.nombre && !emitidos.has(c.nombre),
  );
  /* ⚠ y se separa lo PERDIDO EN SILENCIO de lo NOMBRADO: las dos son
     «no cabe», y sólo la primera es un defecto del instrumento. */
  const silenciosos = perdidos.filter((c) => !nombrados.some((n) => n.includes(`<${c.tag}`) || (c.tipo && n.includes(c.tipo))));

  porInstancia.push({
    doc: docsCodigo[i] ?? null,
    i,
    chars: h.length,
    esFormEntero: /^\s*<form\b/i.test(h) && /<\/form>\s*$/i.test(h),
    controlesEnDoc: controles.length,
    camposEmitidos: emitido?.campos?.length ?? null,
    ocultosEmitidos: emitido?.ocultos?.length ?? null,
    textoBoton: emitido?.textoBoton ?? null,
    destino: emitido?.destino ?? null,
    metodo: emitido?.metodo ?? null,
    nombrados,
    perdidos: perdidos.map((c) => `<${c.tag}${c.tipo ? ` type=${c.tipo}` : ""} name=${c.nombre}>`),
    silenciosos: silenciosos.map((c) => `<${c.tag}${c.tipo ? ` type=${c.tipo}` : ""} name=${c.nombre}>`),
  });
}

P("   #  documento                              chars form ctrl cmp ocl NOM  PERDIDO-EN-SILENCIO");
for (const r of porInstancia)
  P(`   ${String(r.i).padStart(2)} ${String(r.doc).slice(0, 38).padEnd(38)} ${String(r.chars).padStart(6)} ${r.esFormEntero ? " sí " : " NO "} ${String(r.controlesEnDoc).padStart(4)} ${String(r.camposEmitidos).padStart(3)} ${String(r.ocultosEmitidos).padStart(3)} ${String(r.nombrados.length).padStart(3)}  ${r.silenciosos.join(" · ") || "—"}`);

const nFormEntero = porInstancia.filter((r) => r.esFormEntero).length;
const conSilencio = porInstancia.filter((r) => r.silenciosos.length > 0);
const totalSilencio = porInstancia.reduce((a, r) => a + r.silenciosos.length, 0);
const totalNombrados = porInstancia.reduce((a, r) => a + r.nombrados.length, 0);

P(`\n   · \`<form>\` ENTERO (0 chars antes y 0 después) ........ ${nFormEntero} de ${porInstancia.length}`);
P(`   · piezas que el modelo NOMBRA como sin sitio ......... ${totalNombrados}`);
P(`   · piezas PERDIDAS EN SILENCIO ....................... ${totalSilencio}  en ${conSilencio.length} instancia(s)`);

/* ═══════════════════════════════════════════════════════════════════════
 * 5 · DIRECCIÓN B — ¿ESTÁ `formulario-arq` SOBRE-GENERALIZADO?
 *
 * La misma corrida contesta las dos direcciones y tienen respuestas
 * INDEPENDIENTES. Un campo del modelo que ninguna instancia ejercita es un
 * camino de render sin estrenar, no una prueba de que el caso no exista.
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 5 · DIRECCIÓN B — ¿el modelo expresa cosas que el original NO ejerce?");

const todas = [...porInstancia.map((r) => r), ...(congelado ? [{ __congelado: congelado }] : [])];
const emitidosTodos = [
  ...porInstancia.map((r, i) => {
    const api = crea(null);
    return SAB === "extractor-mudo" ? null : api.formularioDe(htmlsCodigo[i], `B[${i}]`);
  }),
  congelado,
].filter(Boolean);

const ejercita = (f) => ({
  destino: !!f.destino,
  metodo: f.metodo,
  textoBoton: !!f.textoBoton,
  tipos: new Set((f.campos ?? []).map((c) => c.tipo)),
  conEtiqueta: (f.campos ?? []).filter((c) => c.etiqueta).length,
  conRequerido: (f.campos ?? []).filter((c) => c.requerido).length,
  conOpciones: (f.campos ?? []).filter((c) => (c.opciones ?? []).length).length,
  ocultos: (f.ocultos ?? []).length,
});
const ejercicio = emitidosTodos.map(ejercita);
const metodosVistos = [...new Set(ejercicio.map((e) => e.metodo))];
const tiposVistos = [...new Set(ejercicio.flatMap((e) => [...e.tipos]))];
const ENUM_TIPO = bFormArq
  ? (cuentaCamposEnum(bFormArq.fields, "tipo") ?? [])
  : [];
const ENUM_METODO = bFormArq ? (cuentaCamposEnum(bFormArq.fields, "metodo") ?? []) : [];
function cuentaCamposEnum(campos, nombre) {
  for (const c of campos ?? []) {
    if (c?.name === nombre && Array.isArray(c.options)) return c.options;
    if (c?.fields) { const r = cuentaCamposEnum(c.fields, nombre); if (r) return r; }
  }
  return null;
}
const tipoSinEjercer = ENUM_TIPO.filter((t) => !tiposVistos.includes(t));
const metodoSinEjercer = ENUM_METODO.filter((m) => !metodosVistos.includes(m));

P(`   \`metodo\`  enum ${JSON.stringify(ENUM_METODO)} · visto ${JSON.stringify(metodosVistos)} → SIN EJERCER: ${JSON.stringify(metodoSinEjercer)}`);
P(`   \`tipo\`    enum ${JSON.stringify(ENUM_TIPO)} · visto ${JSON.stringify(tiposVistos)} → SIN EJERCER: ${JSON.stringify(tipoSinEjercer)}`);
P(`   instancias que alimentan la dirección B: ${ejercicio.length} (${porInstancia.length} de \`paginas\` + ${congelado ? 1 : 0} de \`arquetipos\`)`);

/* ═══════════════════════════════════════════════════════════════════════
 * 6 · CAMPOS, CAMPO A CAMPO
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 6 · CAMPOS — cualificados, y separando BASE de CONTENIDO");
const basePaginas = new Set(cuentaCampos(moduloBasePagina).rutas);
const baseArq = baseDelGrupo(bloquesArquetipo);
const contCodigo = campCodigo.rutas.filter((r) => !basePaginas.has(r));
const contFormArq = campFormArq.rutas.filter((r) => !baseArq.has(r));

P(`   BASE de módulo (ritmo/pieza), derivada — paginas ${basePaginas.size} · arquetipos ${baseArq.size}`);
P(`   Es la parte COMPARTIDA por todos los bloques de su grupo: no modela el`);
P(`   \`et_pb_code\`, así que se saca del cubo que contesta la pregunta.`);
const soloCodigo = contCodigo.filter((n) => !contFormArq.includes(n));
const soloForm = contFormArq.filter((n) => !contCodigo.includes(n));
const comunes = contCodigo.filter((n) => contFormArq.includes(n));
P(`\n   CONTENIDO · \`codigo\` (${contCodigo.length}): ${contCodigo.join(", ") || "—"}`);
P(`   CONTENIDO · \`formulario-arq\` (${contFormArq.length}): ${contFormArq.join(", ") || "—"}`);
P(`\n   comunes de CONTENIDO (${comunes.length}): ${comunes.join(", ") || "—"}`);
P(`   sólo \`codigo\` (${soloCodigo.length}): ${soloCodigo.join(", ") || "—"}`);
P(`   sólo \`formulario-arq\` (${soloForm.length}): ${soloForm.join(", ") || "—"}`);
/* La guarda que la v1 no tenía: si un cardinal se publica, su conjunto no
   puede traer repetidos (§regla 29: `llaves distintas === elementos`). */
for (const [n, l] of [["codigo", campCodigo.rutas], ["formulario-arq", campFormArq.rutas]])
  if (new Set(l).size !== l.length) fallo(`el cardinal de campos de \`${n}\` NO es el de un conjunto: hay rutas repetidas`);

/* ═══════════════════════════════════════════════════════════════════════
 * 7 · SEMBRADAS — derivado del CABLEADO, SIN COMPROBAR contra la tabla
 * ═════════════════════════════════════════════════════════════════════ */
P("\n## 7 · ¿cuántas SEMBRADAS? — sin socket, se deriva del cableado");
const SEED = join(RAIZ, "scripts/seed/seed.mjs");
let cableadas = { paginas: null, arquetipos: null, via: "no localizado" };
if (existsSync(SEED)) {
  const s = readFileSync(SEED, "utf8");
  cableadas = {
    paginas: /\bpaginas\b/.test(s),
    arquetipos: /\barquetipos\b/.test(s),
    via: "grep sobre scripts/seed/seed.mjs",
  };
}
P(`   \`paginas\`    cableada al sembrador: ${cableadas.paginas}`);
P(`   \`arquetipos\` cableada al sembrador: ${cableadas.arquetipos}`);
P(`   ⚠ el conteo de FILAS es DB y el socket da ECONNREFUSED → **SIN COMPROBAR**,`);
P(`     no «0» ni «9»: no encontrar nada y no mirar nada dan la misma salida.`);

/* ═══════════════════════════════════════════════════════════════════════
 * VEREDICTO Y CONGELADA
 * ═════════════════════════════════════════════════════════════════════ */
P("\n" + "=".repeat(78));
if (SAB) {
  const movio =
    (SAB === "censo-mudo" && bloqueanA !== instCodigo.length) ||
    (SAB === "extractor-mudo" && !T1ok && !T2ok) ||
    (SAB === "recorrido-ciego" && totalSilencio === 0 && T2ok);
  if (!movio) fallo(`el sabotaje '${SAB}' NO movió su eje — 0 instancias separadoras, el caso no prueba nada`);
  else bien(`el sabotaje '${SAB}' movió su eje: el canal está ejercitado`);
  P(`   (con sabotaje el veredicto es el del SABOTAJE, no el del repo)`);
  process.exit(ok ? 1 : 1);
}

const salida = {
  meta: {
    tanda: "136.ª · PASO 0 punto 3 + ESCALÓN 1",
    fecha: new Date().toISOString().slice(0, 10),
    estado: "socket 55432 ECONNREFUSED — corrida OFFLINE, sin DB",
    sabotaje: null,
    contesta: [
      "los 4 heredados reproducen o no",
      "los dos modelos en la MISMA unidad: bloques · campos · instancias",
      "¿queda contenido SIN SITIO al llevar las 9 de `paginas` a `formulario-arq`?",
      "¿está `formulario-arq` sobre-generalizado?",
    ],
    noContesta: [
      "NO decide: el expediente es del propietario",
      "el nº de FILAS sembradas — es DB, y el socket está cerrado: SIN COMPROBAR",
      "la geometría ni el render de ninguno de los dos modelos",
      "si el extractor DEBE tratar lo que se pierda: dice si hoy lo nombra o lo pierde",
    ],
  },
  unidad: {
    nota: "bloque, campo e instancia son TRES cosas: sus cardinales no se comparan entre sí. Las rutas van CUALIFICADAS (`mt.valor`), o el cardinal no es el de un conjunto",
    codigo: { bloques: 1, campos: campCodigo.n, instanciasCatalogo: instCodigo.length, rutas: campCodigo.rutas },
    formularioArq: { bloques: 1, campos: campFormArq.n, instanciasCatalogo: instFormArq.length, rutas: campFormArq.rutas },
    codigoArq: { bloques: 1, campos: campCodigoArq.n, instanciasCatalogo: instCodigoArq.length, rutas: campCodigoArq.rutas },
  },
  paso0Punto3: {
    heredado: HEREDADO.map((h) => ({ ...h, reproduce: String(h.esperado) === String(h.medido) })),
    censo: { etiquetas: ETIQUETAS_CENSADAS?.length ?? null, atributos: ATRIBUTOS_CENSADOS?.length ?? null },
    tokensFueraDelCenso: [...tokensA].sort(),
    listaDelComentario: {
      declarados,
      hallados: listaComentario.length,
      soloEnDato: soloEnDato.sort(),
      soloEnComentario: soloEnComentario.sort(),
      nota: "el 21 es DERIVADO de los 9 htmls; el 20 del comentario es la clase `formulario` enumerada a mano. Dos conjuntos, no dos lecturas del mismo",
    },
  },
  validacion: {
    codigo: vCodigo,
    codigoArq: vCodigoArq,
    formularioArq: { campo: "(tipado)", tipo: "array/select/text", valida: "por TIPO, no por censo HTML" },
    bloqueanSiSeLesPusieraElValidador: `${bloqueanA} de ${instCodigo.length}`,
  },
  testigos: {
    T1_sabeVerLoQueCabe: { ok: T1ok, detalle: T1 },
    T2_sabeVerLoQueNoCabe: { ok: T2ok, nombrados: api2.SIN_SITIO_FORM.map((s) => s.que) },
  },
  contenido: {
    formEntero: `${nFormEntero} de ${porInstancia.length}`,
    nombrados: totalNombrados,
    perdidosEnSilencio: totalSilencio,
    instanciasConPerdida: conSilencio.map((r) => r.i),
    porInstancia,
  },
  direccionB: {
    metodo: { enum: ENUM_METODO, visto: metodosVistos, sinEjercer: metodoSinEjercer },
    tipo: { enum: ENUM_TIPO, visto: tiposVistos, sinEjercer: tipoSinEjercer },
    n: ejercicio.length,
  },
  campos: {
    base: { paginas: [...basePaginas], arquetipos: [...baseArq], via: "moduloBasePagina exportado · intersección de bloquesArquetipo" },
    contenido: { codigo: contCodigo, formularioArq: contFormArq },
    comunes, soloCodigo, soloFormularioArq: soloForm,
  },
  sembradas: { ...cableadas, filas: "SIN COMPROBAR — socket 55432 ECONNREFUSED" },
  veredicto: ok ? "MEDIDO" : "NO SE PUDO EVALUAR",
};

const NOMBRE = `escalon1-136-SIN-DB.json`;
const destino = join(DERIV, NOMBRE);
if (existsSync(destino) && readFileSync(destino, "utf8") !== JSON.stringify(salida, null, 1)) {
  const alt = destino.replace(/\.json$/, `-${salida.meta.fecha}-b.json`);
  writeFileSync(alt, JSON.stringify(salida, null, 1));
  P(`   ⚠ ya existía y DIFIERE → escrita al lado: ${alt}`);
} else {
  writeFileSync(destino, JSON.stringify(salida, null, 1));
  P(`   congelada: ${destino}`);
}

P(`\n   ✓ evaluadas ${porInstancia.length}/${instCodigo.length} instancias de \`codigo\` · ${ejercicio.length} formularios en la dirección B`);
P(ok ? "\n✅ ESCALÓN 1 MEDIDO" : "\n❌ NO SE PUDO EVALUAR");
process.exit(ok ? 0 : 2);
