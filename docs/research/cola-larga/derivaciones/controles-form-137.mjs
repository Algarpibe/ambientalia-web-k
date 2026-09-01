/* ═══════════════════════════════════════════════════════════════════════════
   137.ª · ESCALÓN 2 · ¿QUÉ CONTROLES HAY DE VERDAD DENTRO DE LOS `<form>`?
   ═══════════════════════════════════════════════════════════════════════════

   CONTESTA
     · qué ETIQUETAS de control aparecen dentro de un `<form>` en el dominio que
       `formularioDe` recorre, con su cardinal y su reparto por documento;
     · cuáles de ellas el recorrido de `formularioDe` ENUMERA hoy y cuáles no;
     · y por tanto qué se pierde EN SILENCIO — nombrado, no sólo `<textarea>`.

   NO CONTESTA
     · si el modelo DEBE expresarlos: con CMS-7 = A ninguno se va a tipar. Esta
       derivación decide qué hay que NOMBRAR, no qué hay que modelar;
     · nada de la DB —el socket da ECONNREFUSED y la corrida es OFFLINE—;
     · nada del render ni de la geometría;
     · no dice si un control perdido CAMBIA la página: dice que el modelo no lo
       nombra.

   EL DOMINIO VA PARTIDO EN DOS, Y ES LO QUE ENSEÑA
     · `paginas` — los 9 htmls crudos del bloque `codigo`. Es donde vive el caso
       que la guarda no cubre;
     · `arquetipos` — los 4 documentos del corpus con los que el extractor se
       CALIBRÓ. Publicar sólo el total los mezclaría y taparía el contraste que
       explica por qué la guarda afirma de más (§*una regla derivada sobre un
       dominio donde el caso NO SE DA está SIN PROBAR para ese caso*).

   POR QUÉ SE MIDE ANTES DE TOCAR EL EXTRACTOR
     Añadir `textarea` a mano sería arreglar LA INSTANCIA y no la CLASE — cómo
     se llega a la tercera tanda del mismo defecto. §regla 49 manda derivar la
     enumeración DEL DOMINIO QUE SE VA A RECORRER, no del que la calibró.

   CONTROL — un censo sin control es §sondas 4 esperando
     Testigos POR POLARIDAD (§regla 28d), porque uno de un solo signo no separa
     «el instrumento no ve» de «el objeto cambió»:
       · T-ENUM      `input` · `select` — presentes Y enumerados;
       · T-PRESENTE  `textarea`         — PRESENTE en el dominio.
     Ninguno de los dos se ata al DEFECTO, y no es un detalle: la v1 exigía
     `textarea` **NO enumerado** —el estado con defecto— y se habría muerto en
     rojo el día del arreglo, describiéndolo como avería (§regla 5ter). Lo que
     el control vigila es lo cierto en LOS DOS estados; si `textarea` sale a 0,
     el cero es del instrumento y la corrida NO adjudica.
     Y los `PERDIDOS EN SILENCIO` se publican con su cardinal aunque sean 0 —
     no encontrar nada y no mirar nada dan la misma salida.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const MED = join(RAIZ, "scripts/qa/medidas");
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = AQUI;

const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["ciega-el-censo", "extractor-sin-input"];
if (SAB && !VALIDOS.includes(SAB)) {
  console.error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
  process.exit(3);
}

const F33 = join(MED, "f33-extraido.json");
const EXTRACTOR = join(RAIZ, "scripts/seed/extractor-f35.mjs");
/* Los 4 del corpus de `arquetipos`, derivados del propio extractor más abajo. */

/* PRECONDICIÓN ANTES DE GASTAR NADA (§regla 37). Esta corrida no navega, pero
   la comprobación va delante igual: lo que no depende de lo que la corrida
   produce se comprueba antes, no después. */
const faltan = [F33, EXTRACTOR].filter((p) => !existsSync(p));
if (faltan.length) {
  console.error(`PRECONDICIÓN: faltan ${faltan.length} insumos:\n  ${faltan.join("\n  ")}`);
  process.exit(2);
}

const salidaTxt = [];
const P = (s = "") => { salidaTxt.push(s); console.log(s); };

P("═".repeat(78));
P("  137.ª · ESCALÓN 2 · CONTROLES DENTRO DE LOS `<form>` — censo del DOMINIO");
P("═".repeat(78));

/* ── 1 · el dominio ───────────────────────────────────────────────────────── */
const fuente = readFileSync(EXTRACTOR, "utf8");

/* Los 4 documentos NO se enumeran aquí: se DERIVAN de la lista `DOCS` del
   extractor, que es quien decide qué recorre. Copiarlos sería la §regla 9 en su
   7.º caso —un conjunto enumerado a mano dentro del código—. */
const mDocs = /const DOCS = \[([\s\S]*?)\n\];/.exec(fuente);
if (!mDocs) { console.error("PRECONDICIÓN: no se halla `const DOCS = [` en el extractor"); process.exit(2); }
const docsArq = [...mDocs[1].matchAll(/doc:\s*"([^"]+)"/g)].map((m) => m[1]);
if (docsArq.length === 0) { console.error("PRECONDICIÓN: `DOCS` derivado da 0 documentos"); process.exit(2); }

const f33 = JSON.parse(readFileSync(F33, "utf8"));

/* Se baja por `catalogo`, cuya CLAVE se DERIVA (`Object.keys`), y el `slug` del
   documento se arrastra hacia abajo porque los bloques cuelgan de él sin
   repetirlo. */
const bloquesDe = (j) => {
  const out = [];
  const anda = (n, coleccion, doc) => {
    if (Array.isArray(n)) { for (const x of n) anda(x, coleccion, doc); return; }
    if (!n || typeof n !== "object") return;
    const d = n.slug ?? doc;
    if (n.kind || n.blockType) out.push({ ...n, __col: coleccion, __doc: d });
    for (const v of Object.values(n)) anda(v, coleccion, d);
  };
  for (const [col, docs] of Object.entries(j.catalogo ?? {})) anda(docs, col, "?");
  return out;
};

const instPaginas = bloquesDe(f33)
  .filter((m) => (m.kind ?? m.blockType) === "codigo")
  .map((m) => ({ lado: "paginas", doc: m.__doc, html: m.html ?? m.contenido ?? "" }));

const instArq = docsArq
  .filter((d) => existsSync(join(CORPUS, d)))
  .map((d) => ({ lado: "arquetipos", doc: d.replace(/\.html$/, ""), html: readFileSync(join(CORPUS, d), "utf8") }));

/* PRECONDICIÓN del DOMINIO: un censo sobre 0 instancias no es «no hay nada», es
   un lector que no casa (§sondas 4). El 9 está MEDIDO por la 136.ª y por el
   PASO 0 de ésta, así que se exige y la corrida cae en voz alta si no sale. */
if (instPaginas.length !== 9) {
  console.error(`PRECONDICIÓN: \`codigo\` en \`paginas\` da ${instPaginas.length} y el cardinal medido es 9 — el lector no casa, no es que no haya`);
  process.exit(2);
}
if (instArq.length !== docsArq.length) {
  console.error(`PRECONDICIÓN: del corpus de \`arquetipos\` faltan ${docsArq.length - instArq.length} de ${docsArq.length} documentos`);
  process.exit(2);
}

P(`\n## 1 · el DOMINIO, partido en sus dos lados`);
P(`   \`paginas\`     ${String(instPaginas.length).padStart(2)} htmls crudos del bloque \`codigo\`   ← donde VIVE el caso`);
P(`   \`arquetipos\`  ${String(instArq.length).padStart(2)} documentos del corpus (DOCS del extractor) ← donde se CALIBRÓ`);
P(`   ⚠ \`codigo-arq\` en \`f35-extraido.json\`: **0 instancias** — el extractor mapea`);
P(`     \`et_pb_code\` a \`formulario-arq\` (ya TIPADO), así que ese lado no aporta HTML`);
P(`     crudo. Se dice, no se descuenta en silencio.`);

/* ── 2 · el censo, dentro del `<form>` y sólo dentro ──────────────────────── */
/* El recorte al `<form>` es el ÁMBITO que la guarda declara: *«todo control DEL
   `<form>` tiene sitio»*. Contar fuera mediría otra afirmación. Y se cogen
   TODOS los `<form>` del documento, no el primero. */
const recortesForm = (html) => {
  const out = [];
  const bajo = html.toLowerCase();
  let i = 0;
  for (;;) {
    const a = /<form\b[^>]*>/i.exec(html.slice(i));
    if (!a) break;
    const desde = i + a.index;
    const c = bajo.indexOf("</form>", desde);
    out.push(c < 0 ? html.slice(desde) : html.slice(desde, c + 7));
    i = c < 0 ? html.length : c + 7;
  }
  return out;
};

/* Las etiquetas se LEEN del HTML y se cruzan contra los controles conocidos de
   HTML: enumerar «las que espero» reproduciría el defecto que se está midiendo. */
const CONTROLES_HTML = new Set([
  "input", "select", "textarea", "button", "fieldset", "legend", "label",
  "option", "optgroup", "datalist", "output", "progress", "meter", "form",
]);

const porLado = { paginas: new Map(), arquetipos: new Map() };
const porDoc = [];
for (const inst of [...instPaginas, ...instArq]) {
  const trozos = recortesForm(inst.html);
  const cuenta = {};
  for (const t of trozos) {
    for (const m of t.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b/g)) {
      const tag = m[1].toLowerCase();
      if (!CONTROLES_HTML.has(tag)) continue;
      /* SABOTAJE `ciega-el-censo`: reproduce EL MODO DE FALLO que se mide —un
         censo que sólo ve lo que ya sabía— y no la aritmética de un umbral
         (§regla 28a). */
      if (SAB === "ciega-el-censo" && !["input", "select", "fieldset", "button"].includes(tag)) continue;
      cuenta[tag] = (cuenta[tag] ?? 0) + 1;
      porLado[inst.lado].set(tag, (porLado[inst.lado].get(tag) ?? 0) + 1);
    }
  }
  porDoc.push({ lado: inst.lado, doc: inst.doc, forms: trozos.length, etiquetas: cuenta });
}

const todas = [...new Set([...porLado.paginas.keys(), ...porLado.arquetipos.keys()])];
P(`\n## 2 · CENSO de etiquetas de control dentro del \`<form>\` — por LADO`);
P(`   etiqueta        paginas(9)   arquetipos(${instArq.length})   docs con ella`);
const censo = todas
  .map((t) => ({
    etiqueta: t,
    paginas: porLado.paginas.get(t) ?? 0,
    arquetipos: porLado.arquetipos.get(t) ?? 0,
    documentos: porDoc.filter((d) => (d.etiquetas[t] ?? 0) > 0).length,
  }))
  .sort((a, b) => b.paginas + b.arquetipos - (a.paginas + a.arquetipos));
for (const c of censo) {
  P(`   ${c.etiqueta.padEnd(14)} ${String(c.paginas).padStart(8)} ${String(c.arquetipos).padStart(12)} ${String(c.documentos).padStart(14)}`);
}

/* ── 3 · qué ENUMERA hoy el recorrido de `formularioDe` ───────────────────── */
/* El corte va por ESTRUCTURA —casando llaves—, no por un comentario: un
   marcador de texto puede vivir DENTRO de la región que dice delimitar, y
   entonces la lectura se traga la cola entera (§regla 8b, 3.ª mitad). */
const iFn = fuente.indexOf("function formularioDe(");
if (iFn < 0) { console.error("PRECONDICIÓN: no se halla `function formularioDe(` en el extractor"); process.exit(2); }
let prof = 0, fin = -1, visto = false;
for (let k = iFn; k < fuente.length; k++) {
  if (fuente[k] === "{") { prof++; visto = true; }
  else if (fuente[k] === "}") { prof--; if (visto && prof === 0) { fin = k + 1; break; } }
}
if (fin < 0) { console.error("PRECONDICIÓN: no cierra `formularioDe`"); process.exit(2); }
let corte = fuente.slice(iFn, fin);
/* SABOTAJE `extractor-sin-input`: el modo de fallo es «el extractor deja de
   enumerar un control». El T-VIVO `input` tiene que morir. */
if (SAB === "extractor-sin-input") corte = corte.replaceAll("input", "XXXXX");

P(`\n## 3 · el recorrido REAL de \`formularioDe\` — corte por ESTRUCTURA`);
P(`   corte: ${corte.length} chars · de \`function formularioDe(\` a su cierre de llave`);

const enumera = (t) => corte.includes(`<${t}`) || corte.includes(`"${t}"`) || corte.includes(`'${t}'`);
const veredicto = censo.map((c) => ({ ...c, loEnumera: enumera(c.etiqueta) }));

/* ── 4 · CONTROL: testigos POR POLARIDAD (§regla 28d) ─────────────────────── */
/**
 * ⚠ LA POLARIDAD DEL TESTIGO NO SE CABLEA AL DEFECTO, o el control se muere el
 * día del arreglo (§regla 5ter: arreglar el OBJETO caduca el CONTROL del
 * instrumento). La v1 de esta sonda exigía `textarea` **NO enumerado**, o sea
 * el estado CON defecto: puesta la rama, habría caído en rojo describiendo un
 * arreglo como si fuera una avería.
 *
 * Lo que se ata al control es lo que es cierto en LOS DOS estados —que el censo
 * VEA la etiqueta en el dominio—, y si está enumerada o no es el RESULTADO, no
 * el control. Un testigo que sólo sabe reconocer el estado viejo no separa «se
 * arregló» de «no sé buscarlo»: las dos salen en rojo.
 */
const T_ENUM = ["input", "select"];   // presentes Y enumerados en los dos estados
const T_PRESENTE = "textarea";        // presente en el dominio en los dos estados
const busca = (t) => veredicto.find((v) => v.etiqueta === t);
const total = (v) => (v ? v.paginas + v.arquetipos : 0);

const tVivo = T_ENUM.map((t) => {
  const f = busca(t);
  return { testigo: t, ocurrencias: total(f), enumerado: f?.loEnumera ?? false, ok: total(f) > 0 && (f?.loEnumera ?? false) };
});
const fP = busca(T_PRESENTE);
const tPresente = {
  testigo: T_PRESENTE,
  ocurrencias: total(fP),
  enumerado: fP?.loEnumera ?? false,
  /* El control es que el censo LO VEA. Si sale 0, el cero es del instrumento
     —es lo que provoca el sabotaje `ciega-el-censo`— y la corrida no adjudica. */
  ok: total(fP) > 0,
  estado: (fP?.loEnumera ?? false) ? "ENUMERADO (arreglado)" : "NO enumerado (expuesto)",
};

P(`\n## 4 · CONTROL — testigos por POLARIDAD (§regla 28d)`);
for (const t of tVivo) P(`   T-ENUM     ${t.testigo.padEnd(10)} ocurrencias ${String(t.ocurrencias).padStart(4)}  enumerado ${String(t.enumerado).padEnd(6)} ${t.ok ? "OK" : "❌"}`);
P(`   T-PRESENTE ${tPresente.testigo.padEnd(10)} ocurrencias ${String(tPresente.ocurrencias).padStart(4)}  ${tPresente.estado.padEnd(22)} ${tPresente.ok ? "OK" : "❌"}`);

/* ── 5 · veredicto ────────────────────────────────────────────────────────── */
/* `label`, `legend`, `option`, `optgroup`, `form` y `fieldset` NO son controles
   que el modelo deba nombrar: son ESTRUCTURA que el recorrido ya consume —la
   etiqueta cuelga del campo, la leyenda del fieldset, la opción del select—. Se
   declaran aparte CON SU RAZÓN, no se descuentan en silencio (§regla 14). */
const ESTRUCTURA = new Set(["label", "legend", "option", "optgroup", "form", "fieldset"]);
const mudos = veredicto.filter((v) => !v.loEnumera && !ESTRUCTURA.has(v.etiqueta));
const enumerados = veredicto.filter((v) => v.loEnumera && !ESTRUCTURA.has(v.etiqueta));

P(`\n## 5 · VEREDICTO`);
P(`   controles que el recorrido ENUMERA ..... ${enumerados.map((v) => v.etiqueta).join(", ") || "—"}`);
P(`   ESTRUCTURA que el recorrido consume .... ${veredicto.filter((v) => ESTRUCTURA.has(v.etiqueta)).map((v) => v.etiqueta).join(", ") || "—"}`);
P(`   ⚠ PERDIDOS EN SILENCIO ................. ${mudos.length ? mudos.map((v) => `${v.etiqueta} (paginas ${v.paginas} · arquetipos ${v.arquetipos})`).join(" · ") : "0"}`);

/* La asimetría entre los dos lados es LO QUE EXPLICA la guarda que afirma de
   más, así que se publica como número y no como frase. */
const soloPaginas = mudos.filter((v) => v.paginas > 0 && v.arquetipos === 0);
P(`\n   de los perdidos, los que SÓLO existen en \`paginas\` (fuera del dominio`);
P(`   donde la guarda se calibró): ${soloPaginas.length ? soloPaginas.map((v) => v.etiqueta).join(", ") : "0"}`);

const ok = tVivo.every((t) => t.ok) && tPresente.ok;
if (!ok) P(`\n   ❌ los testigos NO adjudican: el censo no vale (§regla 28c)`);

const salida = {
  meta: {
    tanda: "137.ª · ESCALÓN 2 · censo de controles del `<form>`",
    fecha: new Date().toISOString().slice(0, 10),
    estado: "socket 55432 ECONNREFUSED — corrida OFFLINE, sin DB",
    sabotaje: SAB,
    contesta: [
      "qué etiquetas de control hay dentro del `<form>` en el dominio a recorrer",
      "cuáles enumera hoy `formularioDe` y cuáles no",
      "qué se pierde EN SILENCIO, con su cardinal y su reparto por LADO",
    ],
    noContesta: [
      "si el modelo DEBE expresarlos — con CMS-7 = A ninguno se tipa",
      "nada de la DB: el socket está cerrado",
      "nada del render ni de la geometría",
      "no dice si un control perdido CAMBIA la página; dice que el modelo no lo nombra",
    ],
  },
  unidad: "ETIQUETA de control × instancia de módulo/documento",
  dominio: {
    paginas: instPaginas.length,
    arquetipos: instArq.length,
    docsArqDerivados: docsArq,
    nota: "`codigo-arq` da 0 en f35-extraido.json: el extractor mapea et_pb_code a `formulario-arq`, ya tipado, sin HTML crudo",
  },
  censo: veredicto,
  porDocumento: porDoc,
  testigos: { enumerados: tVivo, presente: tPresente },
  estructura: [...ESTRUCTURA],
  perdidosEnSilencio: mudos,
  soloEnPaginas: soloPaginas.map((v) => v.etiqueta),
  veredicto: ok ? "MEDIDO" : "NO SE PUDO EVALUAR",
};

/* La guarda de §regla 5 puesta a mano, porque `derivaciones/` no pasa por `w()`
   y ahí la corrida que VERIFICA pisa a la que DIAGNOSTICÓ.

   ⚠ Y el nombre se DERIVA DEL ESTADO que describe, no de la sonda que lo
   escribe: se pregunta al FUENTE si la rama del `<textarea>` ya está puesta.
   Elegirlo a mano dejaría que la corrida que verifica el arreglo pisara a la
   que lo diagnosticó, que es el defecto original de §regla 5 en el directorio
   donde nadie lo espera. */
const RAMA_PUESTA = /if \(s\.tag === "textarea"\)/.test(fuente);
const NOMBRE = SAB
  ? `controles-form-137-neg-${SAB}.json`
  : `controles-form-137-${RAMA_PUESTA ? "DESPUES" : "ANTES"}-del-arreglo.json`;
const destino = join(DERIV, NOMBRE);
const cuerpo = JSON.stringify(salida, null, 1);
if (existsSync(destino) && readFileSync(destino, "utf8") !== cuerpo) {
  const alt = destino.replace(/\.json$/, `-${salida.meta.fecha}-b.json`);
  writeFileSync(alt, cuerpo);
  P(`   ⚠ ya existía y DIFIERE → escrita al lado: ${alt}`);
} else {
  writeFileSync(destino, cuerpo);
  P(`\n   congelada: ${destino}`);
}

P(`\n   ✓ evaluadas ${instPaginas.length + instArq.length}/${instPaginas.length + instArq.length} instancias · ${censo.length} etiquetas censadas`);
P(ok ? "\n✅ CENSO MEDIDO" : "\n❌ NO SE PUDO EVALUAR");
process.exit(ok ? 0 : 2);
