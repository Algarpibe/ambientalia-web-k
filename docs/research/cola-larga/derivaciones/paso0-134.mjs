/**
 * 134.ª · PASO 0 punto 3 — `F3-5-CODE-DIVERGE`, RE-MEDIDO CON EL TRAMO PUESTO.
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 * La 133.ª midió *«los 9 `MODULO_CODIGO` de `paginas` bloquean 9 de 9»* en su
 * PASO 0 (`d4174a4`), o sea **antes** de que el Tramo F3-5 entrara
 * (`1d83527`). El tramo sólo puede hacer el censo MÁS PERMISIVO, así que el
 * número pudo moverse y nadie lo ha vuelto a mirar.
 *
 * Y se enmarca en LAS DOS DIRECCIONES (§*una comprobación retroactiva se
 * enmarca en las dos direcciones*), porque la misma corrida las contesta:
 *
 *   A · ¿lo VIEJO está mal? ...... ¿siguen bloqueando los 9 de `paginas`?
 *   B · ¿lo NUEVO está SOBRE-GENERALIZADO? ... ¿los 23 tokens del tramo
 *        APARECEN en `paginas`, que es una colección SEMBRADA cuyo dominio
 *        el tramo NO cubre?
 *
 * ── QUÉ **NO** CONTESTA (§*antes de construir sobre una medida, escribe qué
 *    preguntas NO contesta*) ─────────────────────────────────────────────
 *   · no dice si las dos colecciones DEBEN unificarse — eso es del propietario;
 *   · no toca la DB: los 9 htmls salen de la congelada de `paginas`, no de la
 *     tabla sembrada. Si el catálogo y lo sembrado divergieran, esto mide el
 *     catálogo;
 *   · el `apareceFuera` de la 133.ª se midió contra el corpus del ARQUETIPO A
 *     (`a-censo` · `atributos-censo`), NO contra `paginas`. Ese hueco es justo
 *     lo que la dirección B viene a tapar, y por eso el número no se hereda.
 *
 * ── SABOTAJES ────────────────────────────────────────────────────────────
 * Los dos reproducen el MODO DE FALLO, no la aritmética de la condición
 * (§regla 28a):
 *   · `censo-mudo` ....... el validador deja de ver: la dirección A tiene que
 *                          MOVERSE. Si no se mueve, no ejercita el canal;
 *   · `tokenizador-mudo` . el inventario de tokens sale vacío: el TESTIGO tiene
 *                          que CAER. Sin él, un 0 en la dirección B sería del
 *                          instrumento y no del dato (§sondas 4bis).
 *
 * Salida: el nombre deriva del ESTADO que describe (§regla 5, fuga de
 * `derivaciones/`), no de la tanda: `paso0-134-CON-TRAMO.json`.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);

const SAB = process.env.SABOTAJE || null;
const VALIDOS = ["censo-mudo", "tokenizador-mudo"];
if (SAB && !VALIDOS.includes(SAB))
  throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const F33 = join(MED, "f33-extraido.json");
const F35 = join(MED, "f35-extraido.json");
const COMUNES = join(RAIZ, "packages/cms-config/src/campos/comunes.ts");
const B_PAGINAS = join(RAIZ, "packages/cms-config/src/bloques/paginas.ts");
const B_ARQ = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
const faltan = [F33, F35, COMUNES, B_PAGINAS, B_ARQ].filter((p) => !existsSync(p));
if (faltan.length) {
  console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`);
  process.exit(1);
}

const { validaHtmlCorpus, ETIQUETAS_CENSADAS, ATRIBUTOS_CENSADOS, etiquetasFueraDelCenso, atributosFueraDelCenso } =
  await import(pathToFileURL(COMUNES).href);
const { MODULOS_PAGINA } = await import(pathToFileURL(B_PAGINAS).href);
const { bloquesArquetipo } = await import(pathToFileURL(B_ARQ).href);

let ok = true;
const fallo = (m) => { ok = false; P(`   ❌ ${m}`); };

P("=".repeat(78));
P("134.ª · PASO 0 punto 3 — `F3-5-CODE-DIVERGE` con el TRAMO F3-5 PUESTO");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 0 · EL TRAMO ESTÁ PUESTO — se DERIVA, no se cita (§regla 9)
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 0 · ¿está el tramo puesto? — se deriva del fuente");

/**
 * ⚠⚠ **EL TRAMO SE DERIVA DEL `diff`, NO DE UN MARCADOR EN EL FUENTE — y la v1
 * de esta sonda se estrelló ahí exactamente como §sondas 4 predice.**
 *
 * La v1 buscaba el comentario `Tramo F3-5 · el lote de \`arquetipos\`` y leía
 * «del marcador al cierre del array». Pero el marcador vive **DENTRO** del
 * array, no delante, así que se tragaba **la cola entera** —y de propina el
 * array siguiente—: publicó **205 tokens** donde hay 23. No dio error: dio un
 * número plausible de más, que es la cara *sobre-casado* de §sondas 4, y sólo
 * lo delató el control del cardinal conocido de antemano.
 *
 * La forma que no puede sobre-casar es la de §regla 8b: **«qué cambió» se saca
 * del `diff`**. Se extrae el array de la versión PRE-tramo (`d4174a4`, el
 * padre del commit que lo mete) y el de hoy, y el tramo es su diferencia. El
 * extractor casa por LLAVES, no por un marcador de texto.
 */
const fuente = readFileSync(COMUNES, "utf8");
const { execFileSync } = await import("node:child_process");
const PRE = "d4174a4"; /* padre de 1d83527, el commit que mete el tramo */
let fuentePre = null;
try {
  fuentePre = execFileSync("git", ["show", `${PRE}:packages/cms-config/src/campos/comunes.ts`], {
    cwd: RAIZ, encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
  });
} catch (e) {
  console.error(`PRECONDICION: no puedo leer la versión PRE-tramo (${PRE}): ${e.message}`);
  process.exit(1);
}

/** Extrae los literales de un array `export const NOMBRE = [ … ];` por llaves. */
const arrayLiteral = (txt, nombre) => {
  const i = txt.indexOf(`const ${nombre}`);
  if (i < 0) return null;
  const ini = txt.indexOf("[", i);
  if (ini < 0) return null;
  let prof = 0, fin = -1;
  for (let k = ini; k < txt.length; k++) {
    if (txt[k] === "[") prof++;
    else if (txt[k] === "]") { prof--; if (prof === 0) { fin = k; break; } }
  }
  if (fin < 0) return null;
  const sinComentarios = txt.slice(ini, fin).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  return [...new Set([...sinComentarios.matchAll(/"([^"]+)"/g)].map((m) => m[1]))];
};
const diff = (nombre) => {
  const hoy = arrayLiteral(fuente, nombre) ?? [];
  const antes = new Set(arrayLiteral(fuentePre, nombre) ?? []);
  return { hoy, antes: [...antes], nuevos: hoy.filter((t) => !antes.has(t)) };
};
const dEt = diff("ETIQUETAS_CENSADAS");
const dAt = diff("ATRIBUTOS_CENSADOS");
const TRAMO = { etiquetas: dEt.nuevos, atributos: dAt.nuevos };
const nTramo = TRAMO.etiquetas.length + TRAMO.atributos.length;
P(`   PRE-tramo (${PRE}): ${dEt.antes.length} etiquetas · ${dAt.antes.length} atributos`);

P(`   ETIQUETAS_CENSADAS ... ${ETIQUETAS_CENSADAS.length}   (43 antes del tramo)`);
P(`   ATRIBUTOS_CENSADOS ... ${ATRIBUTOS_CENSADOS.length}  (81 antes del tramo)`);
P(`   tramo derivado del fuente: ${TRAMO.etiquetas.length} etiquetas + ${TRAMO.atributos.length} atributos = ${nTramo} tokens`);
P(`     etiquetas: ${TRAMO.etiquetas.join(", ")}`);
P(`     atributos: ${TRAMO.atributos.join(", ")}`);

/* ════════════════════════════════════════════════════════════════════════
 * 1 · LA DIVERGENCIA SIGUE EXISTIENDO — el hecho que la ficha describe
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 1 · ¿sigue habiendo dos definiciones del MISMO `et_pb_code`?");

/**
 * ⚠ **El campo se busca POR NOMBRE, no «el primero que valide».** La v1 hacía
 * lo segundo y devolvió `unidad`/`select` para `codigo-arq` —un `select` trae
 * su propio `validate`—, así que el veredicto salía bien **por el selector
 * equivocado** (§sondas 4: *el dato salía bien por el selector equivocado*, la
 * forma que ninguna guarda ve). Los dos nombres se derivan del fuente.
 */
const nombreCampo = (ruta, slug) => {
  const txt = readFileSync(ruta, "utf8");
  const i = txt.indexOf(`slug: "${slug}"`);
  if (i < 0) return null;
  const trozo = txt.slice(i, i + 600);
  const m = /campoHtml\(\s*"([^"]+)"/.exec(trozo);
  if (m) return { campo: m[1], via: "campoHtml", valida: true };
  const c = /name:\s*"([^"]+)"[^}]*type:\s*"code"/.exec(trozo) ?? /"([^"]+)",\s*\{[^}]*type:\s*"code"/.exec(trozo);
  return c ? { campo: c[1], via: "type:code", valida: false } : null;
};
const campoValidador = (bloque, ruta, slug) => {
  if (!bloque) return null;
  const decl = nombreCampo(ruta, slug);
  if (!decl) return null;
  /* y se comprueba contra el objeto RESUELTO, no sólo contra el fuente */
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
const bCodigo = MODULOS_PAGINA.find((b) => b.slug === "codigo");
const bCodigoArq = bloquesArquetipo.find((b) => b.slug === "codigo-arq");
const vCodigo = campoValidador(bCodigo, B_PAGINAS, "codigo");
const vCodigoArq = campoValidador(bCodigoArq, B_ARQ, "codigo-arq");

P("   colección    slug         campo        tipo    ¿valida?");
P(`   paginas      codigo       ${String(vCodigo?.campo).padEnd(12)} ${String(vCodigo?.tipo).padEnd(7)} ${vCodigo?.valida ? "SÍ" : "NO"}`);
P(`   arquetipos   codigo-arq   ${String(vCodigoArq?.campo).padEnd(12)} ${String(vCodigoArq?.tipo).padEnd(7)} ${vCodigoArq?.valida ? "SÍ" : "NO"}`);

if (!bCodigo || !bCodigoArq) fallo("no encuentro uno de los dos bloques — ¿cambió el slug?");
const divergeHoy = vCodigo?.valida === false && vCodigoArq?.valida === true;

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LAS INSTANCIAS
 * ══════════════════════════════════════════════════════════════════════ */
const rec = (n, out = []) => {
  if (Array.isArray(n)) { n.forEach((x) => rec(x, out)); return out; }
  if (n && typeof n === "object") {
    if (n.kind || n.blockType) out.push(n);
    for (const k of Object.keys(n)) rec(n[k], out);
  }
  return out;
};
const htmlDe = (m) => m.html ?? m.contenido ?? "";
const f33 = JSON.parse(readFileSync(F33, "utf8"));
const f35 = JSON.parse(readFileSync(F35, "utf8"));

const bloquesF33 = rec(f33);
const bloquesF35 = rec(f35.catalogo?.arquetipos ?? f35);
const htmlsCodigo = bloquesF33.filter((m) => (m.kind ?? m.blockType) === "codigo").map(htmlDe);
const htmlsCodigoArq = bloquesF35.filter((m) => (m.kind ?? m.blockType) === "codigo-arq").map(htmlDe);

/**
 * ⚠ `codigo-arq` puede dar **0** hoy sin que sea un defecto: CMS-6·C movió el
 * formulario a `formulario-arq`, así que la instancia que la ficha cuenta como
 * «1» ya no está en ese `kind`. Se publica **el reparto de los dos**, no sólo
 * el que se esperaba — un 0 sin su destino se lee como pérdida.
 */
const htmlsFormArq = bloquesF35.filter((m) => (m.kind ?? m.blockType) === "formulario-arq");
P(`\n   \`codigo\`        (paginas) .... ${htmlsCodigo.length} instancias en la congelada`);
P(`   \`codigo-arq\`    (arquetipos) . ${htmlsCodigoArq.length} instancias`);
P(`   \`formulario-arq\`(arquetipos) . ${htmlsFormArq.length} instancias  ← donde CMS-6·C llevó el formulario`);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · DIRECCIÓN A — ¿LO VIEJO ESTÁ MAL?
 *
 * §regla 27: el denominador NO se obtiene re-corriendo hasta que deje de
 * morir. `validaHtmlCorpus` devuelve el PRIMER motivo, así que además del
 * veredicto se publican TODOS los tokens fuera del censo, por instancia.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · DIRECCIÓN A — ¿siguen bloqueando los 9 de `paginas` con el tramo puesto?");

const valida = SAB === "censo-mudo" ? () => true : validaHtmlCorpus;
const veredictoA = htmlsCodigo.map((h, i) => {
  const r = valida(h);
  return {
    i,
    bloquea: r !== true,
    motivo: r === true ? null : String(r).slice(0, 90),
    etiquetasFuera: SAB === "censo-mudo" ? [] : etiquetasFueraDelCenso(h),
    atributosFuera: SAB === "censo-mudo" ? [] : atributosFueraDelCenso(h),
  };
});
const bloqueanA = veredictoA.filter((v) => v.bloquea).length;
const veredictoArq = htmlsCodigoArq.map((h) => valida(h) !== true);
const bloqueanArq = veredictoArq.filter(Boolean).length;

P(`   \`codigo\`     (NO valida hoy) → si se le pusiera el validador: **${bloqueanA} de ${htmlsCodigo.length} BLOQUEAN**`);
P(`   \`codigo-arq\` (SÍ valida)     → bloquean HOY: **${bloqueanArq} de ${htmlsCodigoArq.length}**`);
P(`\n   133.ª (ANTES del tramo): 9 de 9 · HOY (CON el tramo): ${bloqueanA} de ${htmlsCodigo.length}`);
P(`   ⇒ el tramo ${bloqueanA === htmlsCodigo.length ? "NO cambia" : "CAMBIA"} el veredicto sobre \`paginas\`.`);

const tokensDeA = new Set();
for (const v of veredictoA) {
  v.etiquetasFuera.forEach((t) => tokensDeA.add(`<${t}>`));
  v.atributosFuera.forEach((t) => tokensDeA.add(t));
}
P(`\n   todos los tokens fuera del censo en los ${htmlsCodigo.length} (no sólo el primer motivo): ${tokensDeA.size}`);
P(`     ${[...tokensDeA].sort().join(", ") || "(ninguno)"}`);

/* ════════════════════════════════════════════════════════════════════════
 * 4 · DIRECCIÓN B — ¿ESTÁ EL TRAMO SOBRE-GENERALIZADO?
 *
 * §regla 25, mitad de la AMPLIACIÓN: son DOS cardinales y publicar sólo uno
 * decide mal en las dos direcciones.
 *   · ALCANZA ....... cuántos campos `campoHtml` de `paginas` toca la
 *                     whitelist ampliada, sin que su dominio los cubriera;
 *   · ADMITE DE MÁS . cuántos de los 23 tokens APARECEN hoy en el corpus de
 *                     `paginas` — que es el único que se puede sopesar.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 4 · DIRECCIÓN B — ¿el tramo admite de más en `paginas`, que SÍ está sembrada?");

/* El dominio de la guarda se DERIVA del fuente, no se enumera. */
const camposHtmlPaginas = [...new Set([...readFileSync(B_PAGINAS, "utf8").matchAll(/campoHtml\(\s*"([^"]+)"/g)].map((m) => m[1]))];
P(`   campos \`campoHtml\` declarados en \`paginas.ts\`: ${camposHtmlPaginas.length} — ${camposHtmlPaginas.join(", ")}`);

/**
 * El inventario de tokens presentes se saca con LOS MISMOS tokenizadores del
 * esquema, invertidos: un token del tramo está PRESENTE en `h` si al quitarlo
 * del censo aparecería como «fuera». Como el censo es una constante del
 * módulo, se pregunta al revés — se tokeniza con las mismas expresiones que
 * `comunes.ts` exporta a través de sus funciones, aplicándolas a un html
 * SONDA construido con el token dentro. No sirve.
 *
 * Se hace lo directo y se DECLARA: un tokenizador propio, con su TESTIGO —los
 * 23 tokens tienen que aparecer en el lote F3-5, donde se sabe que están—. Si
 * el testigo cae, un 0 en `paginas` es del instrumento (§regla 28c).
 */
const RE_ET = /<([a-zA-Z][a-zA-Z0-9-]*)/g;
const RE_AP = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;
const RE_PAR = /([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/g;
const inventario = (htmls) => {
  const et = new Map(), at = new Map();
  if (SAB === "tokenizador-mudo") return { et, at };
  for (const h of htmls) {
    if (typeof h !== "string") continue;
    for (const m of h.matchAll(RE_ET)) {
      const t = m[1].toLowerCase();
      et.set(t, (et.get(t) ?? 0) + 1);
    }
    for (const m of h.matchAll(RE_AP)) {
      RE_PAR.lastIndex = 0;
      let a;
      while ((a = RE_PAR.exec(m[2] ?? ""))) {
        const n = (a[1] ?? "").toLowerCase();
        if (n) at.set(n, (at.get(n) ?? 0) + 1);
      }
    }
  }
  return { et, at };
};

/* Los valores de campoHtml de `paginas`, en su unidad estrecha y en la ancha. */
const estrechoPag = [];
for (const b of bloquesF33)
  for (const c of camposHtmlPaginas)
    if (typeof b[c] === "string") estrechoPag.push(b[c]);
const anchoPag = [];
const cadenas = (n) => {
  if (typeof n === "string") { anchoPag.push(n); return; }
  if (Array.isArray(n)) { n.forEach(cadenas); return; }
  if (n && typeof n === "object") for (const k of Object.keys(n)) cadenas(n[k]);
};
cadenas(f33.catalogo?.paginas ?? f33);

const camposHtmlArq = [...new Set([...readFileSync(B_ARQ, "utf8").matchAll(/campoHtml\(\s*"([^"]+)"/g)].map((m) => m[1]))];
const loteF35 = [];
for (const b of bloquesF35)
  for (const c of camposHtmlArq)
    if (typeof b[c] === "string") loteF35.push(b[c]);

const invEstrecho = inventario(estrechoPag);
const invAncho = inventario(anchoPag);
const invLote = inventario(loteF35);

P(`\n   corpus de \`paginas\`: ${estrechoPag.length} campos \`campoHtml\` (unidad estrecha) · ${anchoPag.length} cadenas (unidad ancha, superconjunto)`);
P(`   corpus del lote F3-5 (TESTIGO): ${loteF35.length} campos \`campoHtml\``);

const presentes = (inv) => ({
  etiquetas: TRAMO.etiquetas.filter((t) => inv.et.has(t)),
  atributos: TRAMO.atributos.filter((t) => inv.at.has(t)),
});
const enEstrecho = presentes(invEstrecho);
const enAncho = presentes(invAncho);
const enLote = presentes(invLote);

const n = (x) => x.etiquetas.length + x.atributos.length;
P(`\n   ── los DOS cardinales de §regla 25 ──`);
P(`   ALCANZA ........ ${camposHtmlPaginas.length} campos \`campoHtml\` de \`paginas\`, y el dominio del tramo (4 documentos del lote F3-5) NO cubre ninguno`);
P(`   ADMITE DE MÁS .. ${n(enEstrecho)} de ${nTramo} tokens aparecen hoy en el corpus de \`paginas\` (unidad estrecha)`);
P(`                    ${n(enAncho)} de ${nTramo} en la unidad ANCHA (superconjunto: toda cadena del catálogo)`);
if (n(enEstrecho)) {
  P(`     etiquetas: ${enEstrecho.etiquetas.join(", ") || "—"}`);
  P(`     atributos: ${enEstrecho.atributos.join(", ") || "—"}`);
}
if (n(enAncho) && n(enAncho) !== n(enEstrecho)) {
  P(`     (ancha) etiquetas: ${enAncho.etiquetas.join(", ") || "—"}`);
  P(`     (ancha) atributos: ${enAncho.atributos.join(", ") || "—"}`);
}

/* ════════════════════════════════════════════════════════════════════════
 * 5 · CONTROLES
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 5 · CONTROLES");

/* §regla 28c · el control de un CERO es el CASO CONOCIDO DE ANTEMANO. */
if (n(enLote) >= 10)
  P(`   ✅ §regla 28c · TESTIGO: el tokenizador VE ${n(enLote)} de los ${nTramo} tokens del tramo en el lote F3-5, donde se sabe que están — un 0 en \`paginas\` es del DATO`);
else
  fallo(`§regla 28c · el tokenizador sólo ve ${n(enLote)} de ${nTramo} tokens en el lote donde SÍ están: un 0 en \`paginas\` sería del INSTRUMENTO, no del dato`);

if (htmlsCodigo.length === 9)
  P(`   ✅ el cardinal de \`codigo\` reproduce el de la 133.ª: ${htmlsCodigo.length} de 9`);
else
  fallo(`el cardinal de \`codigo\` es ${htmlsCodigo.length}, no 9 — la congelada cambió y el número no se puede comparar`);

if (nTramo === 23)
  P(`   ✅ el tramo derivado del \`diff\` da ${nTramo} tokens, como el acta de la 133.ª`);
else
  fallo(`el tramo derivado da ${nTramo} tokens, no 23 — o el fuente cambió o el lector del tramo está mal`);

/* §regla 28c · el CASO CONOCIDO DE ANTEMANO del extractor de arrays. */
if (dEt.antes.length === 43 && dAt.antes.length === 81)
  P(`   ✅ §regla 28c · el extractor reproduce el estado PRE-tramo conocido: ${dEt.antes.length} etiquetas · ${dAt.antes.length} atributos`);
else
  fallo(`§regla 28c · el estado PRE-tramo sale ${dEt.antes.length}/${dAt.antes.length}, no 43/81 — el extractor de arrays no adjudica`);

if (vCodigoArq?.via === "campoHtml" && vCodigo?.via === "type:code")
  P(`   ✅ los campos se resolvieron POR NOMBRE: \`codigo.${vCodigo.campo}\` (type:code) y \`codigo-arq.${vCodigoArq.campo}\` (campoHtml)`);
else
  fallo(`la resolución de campos no da lo declarado en el fuente: codigo→${vCodigo?.via} codigo-arq→${vCodigoArq?.via}`);

if (divergeHoy)
  P(`   ✅ la divergencia de \`F3-5-CODE-DIVERGE\` SIGUE EN PIE: \`codigo\` no valida y \`codigo-arq\` sí`);
else
  fallo(`la divergencia ya no es la que la ficha describe — codigo.valida=${vCodigo?.valida} codigo-arq.valida=${vCodigoArq?.valida}`);

if (estrechoPag.length > 100)
  P(`   ✅ §sondas 4bis · el lector VE el corpus de \`paginas\` (${estrechoPag.length} campos) — un 0 no es del alcance`);
else
  fallo(`§sondas 4bis · sólo ${estrechoPag.length} campos leídos de \`paginas\`: un 0 sería del instrumento`);

/**
 * ⚠ **El TESTIGO del validador, y va sobre el MECANISMO y no sobre el
 * recuento.** Atar el control a «bloquean 9» convertiría el HALLAZGO en
 * control: el día que el tramo SÍ moviera el veredicto, el control caería y se
 * leería como avería del instrumento (§regla 5ter). Lo que se exige es que el
 * validador siga sabiendo rechazar un caso conocido de antemano —un `<form>`,
 * que es la clase que CMS-6·C dejó FUERA— y aceptar uno limpio.
 */
const T_MALO = '<div class="x"><form action="/a" method="post"><input name="e"></form></div>';
const T_BUENO = '<div class="x"><p>texto <strong>en negrita</strong> y un <a href="/y">enlace</a>.</p></div>';
const testigoMalo = valida(T_MALO) !== true;
const testigoBueno = valida(T_BUENO) === true;
if (testigoMalo && testigoBueno)
  P(`   ✅ §regla 28c · TESTIGO del validador: rechaza el \`<form>\` conocido y acepta el html limpio — el \`9 de 9\` es del DATO`);
else
  fallo(`§regla 28c · el validador no discrimina los testigos (malo→${testigoMalo ? "rechaza" : "ACEPTA"}, bueno→${testigoBueno ? "acepta" : "RECHAZA"}): su veredicto no adjudica`);

/* ════════════════════════════════════════════════════════════════════════
 * 6 · VEREDICTO
 * ══════════════════════════════════════════════════════════════════════ */
P("\n" + "=".repeat(78));
const cambiaOrden = bloqueanA < htmlsCodigo.length;
P(ok
  ? `VEREDICTO · A: ${bloqueanA} de ${htmlsCodigo.length} bloquean CON el tramo (133.ª: 9 de 9) · B: admite de más ${n(enEstrecho)} de ${nTramo}`
  : "VEREDICTO · ❌ algún control cae — los números NO adjudican");
if (ok)
  P(cambiaOrden
    ? `           ⚠ el tramo MUEVE el veredicto: la ficha se encoge y hay que releerla`
    : `           la ficha \`F3-5-CODE-DIVERGE\` NO se encoge: sigue siendo una divergencia de MODELO, no un defecto vivo`);
P("=".repeat(78));

const cuerpo = JSON.stringify({
  meta: {
    tanda: "134.ª · PASO 0 punto 3",
    fecha: new Date().toISOString().slice(0, 10),
    estado: "CON el Tramo F3-5 aplicado (ETIQUETAS 46 · ATRIBUTOS 101)",
    sabotaje: SAB,
    contesta: "¿siguen bloqueando los 9 de `paginas`? ¿y el tramo admite de más allí?",
    noContesta: [
      "si las dos colecciones deben unificarse — es del propietario",
      "el estado de lo SEMBRADO: mide el catálogo congelado, no la tabla",
      "el `apareceFuera` contra el arquetipo A, que la 133.ª ya midió aparte",
    ],
  },
  tramo: { ...TRAMO, n: nTramo, etiquetasCensadas: ETIQUETAS_CENSADAS.length, atributosCensados: ATRIBUTOS_CENSADOS.length, preTramo: { etiquetas: dEt.antes.length, atributos: dAt.antes.length, commit: PRE } },
  divergencia: { codigo: vCodigo, "codigo-arq": vCodigoArq, sigueEnPie: divergeHoy, instancias: { codigo: htmlsCodigo.length, "codigo-arq": htmlsCodigoArq.length, "formulario-arq": htmlsFormArq.length } },
  direccionA: {
    instancias: htmlsCodigo.length,
    bloqueanHoy: bloqueanA,
    bloqueaban133: 9,
    elTramoMueveElVeredicto: cambiaOrden,
    tokensFueraDelCenso: [...tokensDeA].sort(),
    porInstancia: veredictoA,
    codigoArq: { instancias: htmlsCodigoArq.length, bloquean: bloqueanArq },
  },
  direccionB: {
    regla25: {
      alcanza: { campos: camposHtmlPaginas, n: camposHtmlPaginas.length },
      admiteDeMas: { estrecho: enEstrecho, nEstrecho: n(enEstrecho), ancho: enAncho, nAncho: n(enAncho) },
    },
    corpus: { paginasEstrecho: estrechoPag.length, paginasAncho: anchoPag.length, loteF35: loteF35.length },
    testigo: { enLote, n: n(enLote) },
  },
  ok,
}, null, 1);

const nombre = SAB ? `paso0-134-neg-${SAB}.json` : "paso0-134-CON-TRAMO.json";
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada: derivaciones/${nombre}`);
process.exit(ok ? 0 : 1);
