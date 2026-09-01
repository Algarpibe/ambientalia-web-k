// 133.ª · ESCALÓN 1 — EL TRAMO F3-5, CON SU DOMINIO DECLARADO
//
// El propietario resolvió CMS-6 = A + C. **A** admite las 4 clases INERTES
// —schema.org · estructura HTML5 · `data-*` del constructor · aria de tabla—
// cada una con su evidencia.
//
// ── LA TRAMPA QUE ESTO TIENE QUE EVITAR ────────────────────────────────────
// El censo que hoy bloquea se derivó de la cola larga y del arquetipo A, y por
// eso NO conocía estas clases: 43 de 43 tokens con cero apariciones en su
// dominio. Si el tramo nuevo se escribe SIN declarar SU dominio, queda una
// whitelist derivada de 4 documentos aplicada a todo el sitio — que es §*una
// regla derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR para
// ese caso* cometida EN EL ARREGLO en vez de en el defecto.
//
// Así que el tramo declara CUATRO cosas y ninguna sobra:
//   1. QUÉ tokens (derivados de la congelada, no escritos a mano);
//   2. de qué DOMINIO salieron, con su cardinal;
//   3. qué queda FUERA, con su razón;
//   4. y §regla 25 — el cardinal de lo que la whitelist ampliada ALCANZA y su
//      invariante NO cubre. Si sale 0 está ajustada; si no, ése es el número.
//
// ── EL INVARIANTE, QUE ES LO QUE HACE «INERTE» UNA MEDIDA Y NO UN NOMBRE ───
// `ATRIBUTOS_CENSADOS` se firmó con este invariante escrito: *«las cuatro
// familias peligrosas salen a CERO: `on*` 0 · `javascript:` 0 · `data:` 0 ·
// `srcdoc` 0. Por eso el rechazo puede ir en la dirección que grita sin perder
// un solo byte»*. Un tramo nuevo tiene que sostener EL MISMO invariante, y eso
// se mide sobre los VALORES SERVIDOS, no sobre el nombre del atributo: dos de
// los 23 llevan URL (`data-main-image-url`, `data-image-url-format`) y un
// «inerte» por nombre puede no serlo por valor.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const CFG = join(RAIZ, "packages/cms-config/src");
const P = (...a) => console.log(...a);
const SAB = process.env.SABOTAJE || null;
/**
 * ⚠ LOS SABOTAJES SE PONEN EN EL DATO, NO EN LA ARITMÉTICA (§regla 28a).
 *
 * La v1 llevaba `invariante-ciego` —cegar el detector de valores— y salía
 * **VERDE**: con 0 peligrosos en el dato, cegar el detector predice exactamente
 * lo mismo que no cegarlo. **0 instancias separadoras POR CONSTRUCCIÓN**, no por
 * pobreza del dominio. El modo de fallo que esta guarda vigila es *«un token
 * peligroso entra en el tramo»*, así que el sabotaje mete uno.
 */
const VALIDOS = ["token-peligroso", "dominio-encogido", "inventario-mudo"];
if (SAB && !VALIDOS.includes(SAB)) throw new Error(`SABOTAJE desconocido: '${SAB}' (${VALIDOS.join(" | ")})`);
if (SAB) P(`\n⚠ SABOTAJE=${SAB} — esta corrida DEBE fallar.\n`);

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const CLASES = join(DERIV, "clases-132.json");
/**
 * ⚠ Lee la extracción **ANTES de CMS-6 · C**, no la canónica, y es deliberado:
 * esta derivación se pronuncia sobre el estado en que `codigo-arq` llevaba el
 * formulario como HTML crudo. Tras C la canónica es la post-C —`formulario-arq`,
 * 0 bloqueos— y leerla aquí no daría un error: daría OTRA MEDIDA con la misma
 * cara (§regla 5bis: arreglar el objeto no arregla sus medidas, las CADUCA).
 *
 * El nombre deriva del ESTADO, así que no se mueve con la siguiente corrida.
 */
const F35 = join(MED, "f35-extraido-ANTES-DE-CMS6-C.json");
const COMUNES = join(CFG, "campos/comunes.ts");
const faltan = [CLASES, F35, COMUNES].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`PRECONDICION: faltan ${faltan.length}:\n  ${faltan.join("\n  ")}`); process.exit(1); }

const { ETIQUETAS_CENSADAS, ATRIBUTOS_CENSADOS } = await import(pathToFileURL(COMUNES).href);
const c132 = JSON.parse(readFileSync(CLASES, "utf8"));
const f35 = JSON.parse(readFileSync(F35, "utf8"));

let ok = true;
const fallo = (m) => { ok = false; P(`   ❌ ${m}`); };

P("=".repeat(78));
P("133.ª · ESCALÓN 1 — el TRAMO F3-5, con su dominio declarado");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 1 · LOS TOKENS — derivados de la congelada, NUNCA escritos a mano
 *
 * §regla 9, 7.º caso: un conjunto enumerado a mano dentro de una sonda es un
 * dato recordado, y envejece contra el repo en silencio.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 1 · LOS TOKENS DEL TRAMO — derivados de clases-132.json");

/** La clasificación que SUMA 22 es la de FUNCIÓN (la de sintaxis suma 23). */
const porClase = c132.porClase.funcion;
const INERTES = ["schema.org", "estructura HTML5", "data-* del constructor", "aria de tabla"];
const FUERA = ["formulario"];

const faltantes = [...INERTES, ...FUERA].filter((k) => !porClase[k]);
if (faltantes.length) fallo(`clases ausentes en la congelada: ${faltantes.join(", ")}`);

/** El eje de cada token —etiqueta o atributo— se DERIVA de dónde bloqueó. */
const ejeDe = new Map();
for (const [eje, lista] of Object.entries(f35.bloqueos?.porEje ?? {}))
  for (const b of lista) for (const t of b.hit ?? []) if (!ejeDe.has(t)) ejeDe.set(t, eje);
/** Los ocultos por el tope se re-adjudican por presencia en el censo hermano. */
const ejePorToken = (t) => ejeDe.get(t) ?? (/^[a-z][a-z0-9]*$/.test(t) && !t.includes("-") && !/^(action|for|method|name|value|content|required|selected)$/.test(t) ? "etiqueta" : "atributo");

const tramo = { etiquetas: [], atributos: [] };
const porClaseTramo = {};
for (const clase of INERTES) {
  const v = porClase[clase];
  const et = v.tokens.filter((t) => ejePorToken(t) === "etiqueta");
  const at = v.tokens.filter((t) => ejePorToken(t) === "atributo");
  porClaseTramo[clase] = { etiquetas: et, atributos: at, ...v };
  tramo.etiquetas.push(...et);
  tramo.atributos.push(...at);
  P(`   ${clase.padEnd(24)} ${String(v.tokens.length).padStart(2)} tok · ${v.bloqueos} bloq · ${v.documentos.length} docs · etiquetas [${et.join(", ") || "—"}] · atributos ${at.length}`);
}
tramo.etiquetas = [...new Set(tramo.etiquetas)].sort();
tramo.atributos = [...new Set(tramo.atributos)].sort();
/** El sabotaje entra AQUÍ, en el dato: un token peligroso colado en el tramo. */
if (SAB === "token-peligroso") tramo.atributos.push("onclick", "srcdoc");
P(`\n   TRAMO F3-5 = ${tramo.etiquetas.length} etiquetas + ${tramo.atributos.length} atributos = ${tramo.etiquetas.length + tramo.atributos.length} tokens`);
P(`   etiquetas: ${tramo.etiquetas.join(", ")}`);

/**
 * ⚠⚠ EL ESTADO DEL ALTA SE PUBLICA; LO QUE SE EXIGE ES EL INVARIANTE (§regla 5ter).
 *
 * La v1 exigía *«ninguno está ya censado»*. Cierto ANTES del alta y falso
 * DESPUÉS: es un control atado al estado del objeto, o sea uno que caduca el
 * día que el arreglo entra —y que entonces falla en voz alta y se lee como un
 * hallazgo del objeto en vez de como una avería del instrumento—.
 *
 * Lo que se exige es lo que vale en LOS DOS estados: que **ningún token de
 * `formulario` esté censado**, que es exactamente lo que la opción C promete y
 * lo único que un alta descuidada podría romper.
 */
const yaEt = tramo.etiquetas.filter((t) => ETIQUETAS_CENSADAS.includes(t));
const yaAt = tramo.atributos.filter((t) => ATRIBUTOS_CENSADOS.includes(t));
const nTramoTot = tramo.etiquetas.length + tramo.atributos.length;
const dentro = yaEt.length + yaAt.length;
P(`   estado del alta: ${dentro} de ${nTramoTot} tokens del tramo YA están en el censo` +
  (dentro === 0 ? "  → sin aplicar" : dentro === nTramoTot ? "  → APLICADO" : "  ⚠ a MEDIAS"));
if (dentro !== 0 && dentro !== nTramoTot) fallo(`el alta está a medias: ${dentro} de ${nTramoTot} — o entra entera o no entra`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · EL DOMINIO DEL TRAMO — de dónde salen, con su cardinal
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 2 · EL DOMINIO DEL TRAMO — declarado, que es lo que hoy falta");

const dom = {
  documentos: f35.alcance?.docs ?? [],
  camposHtml: c132.denominadores?.camposHtml,
  bloqueos: c132.denominadores?.bloqueos,
  unidad: f35.alcance?.unidad,
  regimen: "B- · builder puro",
  arquetipos: ["PRODUCTO", "CATALOGO", "SOFTWARE", "SOFTWARE-corta"],
};
P(`   documentos ... ${dom.documentos.length}: ${dom.documentos.join(", ")}`);
P(`   arquetipos ... ${dom.arquetipos.join(" · ")}  (régimen ${dom.regimen})`);
P(`   campos HTML .. ${dom.camposHtml}  ·  bloqueos ${dom.bloqueos}`);
P(`   unidad ....... ${dom.unidad}`);
P(`\n   ⚠ ESTE es el dominio del tramo. NO es el del censo original:`);
P(`     · ETIQUETAS_CENSADAS (${ETIQUETAS_CENSADAS.length}) salió de a-censo — post_content servido de 209 páginas`);
P(`     · ATRIBUTOS_CENSADOS (${ATRIBUTOS_CENSADOS.length}) salió de atributos-censo — 294 páginas`);
P(`     · y ninguno de los ${tramo.etiquetas.length + tramo.atributos.length} tokens aparece en ellos (132.ª: 43 de 43 a cero)`);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · EL INVARIANTE — medido sobre los VALORES, no sobre el nombre
 *
 * «Inerte» no puede ser una etiqueta que uno le pone a una clase: es una
 * propiedad de lo que el token TRAE. Dos de los 23 llevan URL.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · EL INVARIANTE — ¿siguen a CERO las cuatro familias peligrosas?");

const rec = (n, out = []) => {
  if (Array.isArray(n)) { n.forEach((x) => rec(x, out)); return out; }
  if (n && typeof n === "object") { if (n.kind) out.push(n); for (const k of Object.keys(n)) rec(n[k], out); }
  return out;
};
const modulos = rec(f35.catalogo.arquetipos);
const RE_PAR = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

const enTramo = new Set(tramo.atributos);
const valores = new Map();
let paresLeidos = 0;
for (const m of modulos)
  for (const v of Object.values(m)) {
    if (typeof v !== "string") continue;
    RE_PAR.lastIndex = 0;
    let a;
    while ((a = RE_PAR.exec(v))) {
      paresLeidos++;
      const n = a[1].toLowerCase();
      if (!enTramo.has(n)) continue;
      (valores.get(n) ?? valores.set(n, new Set()).get(n)).add(a[2] ?? a[3] ?? "");
    }
  }

/**
 * SABOTAJE `invariante-ciego`: el detector deja de ver los valores. Si el
 * veredicto NO se mueve, la comprobación no ejercita el canal (§regla 28a).
 */
const mira = valores;

const FAMILIAS = {
  "on* (manejador)": (n) => /^on[a-z]/i.test(n),
  "javascript: en valor": (n, vs) => [...vs].some((v) => /^\s*javascript:/i.test(v)),
  "data: en valor": (n, vs) => [...vs].some((v) => /^\s*data:/i.test(v)),
  srcdoc: (n) => n === "srcdoc",
};
const peligrosos = {};
for (const [fam, test] of Object.entries(FAMILIAS)) {
  const hits = [...mira.entries()].filter(([n, vs]) => test(n, vs)).map(([n]) => n);
  // `on*` y `srcdoc` se comprueban también sobre los tokens SIN valor observado
  const porNombre = tramo.atributos.filter((n) => test(n, new Set()));
  peligrosos[fam] = [...new Set([...hits, ...(fam.startsWith("on") || fam === "srcdoc" ? porNombre : [])])];
  P(`   ${fam.padEnd(22)} ${peligrosos[fam].length}  ${peligrosos[fam].join(", ")}`);
}
const totalPeligro = Object.values(peligrosos).reduce((a, x) => a + x.length, 0);

P(`\n   ── los que llevan URL, con su VALOR leído (no supuesto) ──`);
const conUrl = [...mira.entries()].filter(([, vs]) => [...vs].some((v) => /^https?:\/\/|\.(jpg|png|webp|svg)$/i.test(v)));
for (const [n, vs] of conUrl) P(`   ${n.padEnd(24)} ${[...vs].slice(0, 2).map((v) => JSON.stringify(v.slice(0, 72))).join("  ")}`);
if (!conUrl.length) P(`   (ninguno)`);

/**
 * ⚠ Y su consecuencia para OTRA fase, que se ficha aquí y no se resuelve:
 * `data-main-image-url` trae una URL ABSOLUTA al original. Es un CANAL DE MEDIA
 * implícito (§regla 48) que ningún `upload` declara.
 */
const urlsAbsolutas = conUrl.flatMap(([n, vs]) => [...vs].filter((v) => /^https?:\/\//i.test(v)).map((v) => ({ token: n, url: v })));

/* ════════════════════════════════════════════════════════════════════════
 * 4 · §REGLA 25 — el dominio de la GUARDA contra el del INVARIANTE
 *
 * «Una guarda cuyo dominio es más ancho que su invariante deja de proteger y
 * pasa a bloquear.» Aquí la guarda es GLOBAL —un solo `validaHtmlCorpus` para
 * todos los campos `campoHtml` del esquema— y el invariante del tramo se midió
 * en 4 documentos. El número que hay que publicar es cuánto los separa.
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 4 · §regla 25 — ¿el dominio de la guarda es más ancho que su invariante?");

/** El dominio de la guarda se DERIVA recorriendo el fuente, no se enumera. */
const ficheros = [];
const anda = (dir) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) anda(p);
    else if (f.name.endsWith(".ts")) ficheros.push(p);
  }
};
anda(CFG);
const usos = [];
for (const p of ficheros) {
  const txt = readFileSync(p, "utf8");
  for (const m of txt.matchAll(/campoHtml\(\s*"([^"]+)"/g))
    usos.push({ fichero: p.slice(RAIZ.length + 1).replace(/\\/g, "/"), campo: m[1] });
}
const porFichero = [...new Set(usos.map((u) => u.fichero))];
const alcanceGuarda = SAB === "dominio-encogido" ? usos.slice(0, 1) : usos;

P(`   dominio de la GUARDA .... ${alcanceGuarda.length} campos \`campoHtml\` en ${porFichero.length} ficheros del esquema`);
P(`   dominio del INVARIANTE .. ${dom.documentos.length} documentos · ${dom.camposHtml} campos HTML (el lote F3-5)`);
const noCubierto = alcanceGuarda.length - 0; /* ningún campo del esquema queda censado POR el tramo */
P(`\n   ⇒ la whitelist ampliada ALCANZA ${alcanceGuarda.length} campos; el tramo la censó en ${dom.documentos.length} documentos de UNO de ellos.`);
P(`     **cardinal de lo que alcanza y el invariante NO cubre: ${alcanceGuarda.length - 1} campos de ${alcanceGuarda.length}** (todos menos \`codigo-arq.contenido\` … y sus hermanos del lote)`);

/**
 * ⚠ Pero ese número no es todavía un riesgo: dice cuánto ALCANZA, no cuánto
 * ADMITE DE MÁS. Lo segundo se mide preguntando si esos tokens APARECEN hoy
 * fuera del lote — y la 132.ª ya lo midió: 43 de 43 a cero en los dos censos.
 */
P(`\n   ── ¿y cuánto admite DE MÁS hoy? ──`);
const A_CENSO = join(MED, "a-censo.json");
const AT_CENSO = join(MED, "atributos-censo.json");
let fueraHoy = null;
if (existsSync(A_CENSO) && existsSync(AT_CENSO)) {
  const a = JSON.parse(readFileSync(A_CENSO, "utf8"));
  const at = JSON.parse(readFileSync(AT_CENSO, "utf8"));
  /**
   * ⚠ Las llaves se leen de la FORMA REAL de cada congelada, no se adivinan con
   * un `??` encadenado: la v1 puso `inventario ?? etiquetas ?? global` y `a-censo`
   * las llama `inventarioGlobal`, así que devolvió **0 etiquetas** — un cero con
   * cara de dato (§sondas 4, cometida sobre el lector de la propia sonda). Lo
   * cazó el control del inventario muerto, que por eso NO es opcional.
   */
  const invA = new Set(Object.keys(SAB === "inventario-mudo" ? {} : (a.inventarioGlobal ?? {})));
  const invAt = SAB === "inventario-mudo" ? {} : (at.atributos ?? {});
  const etFuera = tramo.etiquetas.filter((t) => invA.has(t));
  const atFuera = tramo.atributos.filter((t) => (invAt[t]?.total ?? invAt[t] ?? 0) > 0);
  fueraHoy = { etiquetas: etFuera, atributos: atFuera, invA: invA.size, invAt: Object.keys(invAt).length };
  P(`   inventarios leídos: a-censo ${invA.size} etiquetas · atributos-censo ${Object.keys(invAt).length} atributos`);
  P(`   tokens del tramo que YA aparecen fuera del lote: ${etFuera.length + atFuera.length}  ${[...etFuera, ...atFuera].join(", ") || "(ninguno)"}`);
  if (invA.size < 40 || Object.keys(invAt).length < 60)
    fallo(`§sondas 4 · el inventario leído está MUERTO (${invA.size} / ${Object.keys(invAt).length}): un 0 sería del instrumento`);
} else P(`   ⚠ censos no encontrados: este eje queda SIN MEDIR y se declara así`);

/* ════════════════════════════════════════════════════════════════════════
 * 5 · LO QUE QUEDA FUERA, CON SU RAZÓN
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 5 · LO QUE QUEDA FUERA — con su razón, como `googletagmanager.com` en el Tramo C");
for (const clase of FUERA) {
  const v = porClase[clase];
  P(`   ${clase}: ${v.tokens.length} tokens · ${v.bloqueos} bloqueos · ${v.documentos.length} documento`);
  P(`   razón: decisión del propietario (CMS-6 = A + C). No entra en la whitelist;`);
  P(`          va por BLOQUE TIPADO, que es lo que §3.3·T4 hace con los <script>.`);
  P(`   tokens: ${v.tokens.join(", ")}`);
}

/* ════════════════════════════════════════════════════════════════════════
 * 6 · CONTROLES
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 6 · CONTROLES");

const nTramo = tramo.etiquetas.length + tramo.atributos.length;
if (nTramo === 23) P(`   ✅ el tramo tiene los ${nTramo} tokens de las 4 inertes (5 + 2 + 12 + 4)`);
else fallo(`el tramo tiene ${nTramo} tokens, esperados 23 — ¿cambió la clasificación?`);

/**
 * ⚠ EL CONTROL QUE VALE EN LOS DOS ESTADOS, y el que de verdad protege la
 * opción C: ni un token de `formulario` puede acabar en el censo. Es lo único
 * que un alta descuidada —copiar los 43 en vez de los 23— rompería, y no
 * caduca el día que el alta entra.
 */
const formTokens = porClase["formulario"]?.tokens ?? [];
const coladas = formTokens.filter((t) => ETIQUETAS_CENSADAS.includes(t) || ATRIBUTOS_CENSADOS.includes(t));
if (coladas.length === 0) P(`   ✅ opción C sostenida: 0 de los ${formTokens.length} tokens de \`formulario\` están en el censo`);
else fallo(`§CMS-6 C · ${coladas.length} tokens de \`formulario\` SE COLARON en el censo: ${coladas.join(", ")}`);

if (totalPeligro === 0) P(`   ✅ el INVARIANTE se sostiene: 0 en las cuatro familias peligrosas, medido sobre ${paresLeidos} pares atributo=valor`);
else fallo(`el invariante NO se sostiene: ${totalPeligro} tokens peligrosos — el tramo NO se puede firmar`);

if (paresLeidos > 100) P(`   ✅ §sondas 4bis · el detector de valores VE el corpus (${paresLeidos} pares leídos) — un 0 es del dato`);
else fallo(`§sondas 4bis · sólo ${paresLeidos} pares leídos: un 0 sería del instrumento`);

if (valores.size >= 8) P(`   ✅ §regla 28c · TESTIGOS: ${valores.size} de los ${tramo.atributos.length} atributos del tramo traen valor observado, con su contenido publicado`);
else fallo(`§regla 28c · sólo ${valores.size} atributos con valor: sin testigos, el 0 de peligrosos no adjudica`);

if (alcanceGuarda.length >= 20) P(`   ✅ §regla 25 · el dominio de la guarda se DERIVA del fuente (${alcanceGuarda.length} campos), no se enumera`);
else fallo(`§regla 25 · dominio de la guarda ${alcanceGuarda.length}: encogido o mal derivado — el cardinal no vale`);

P("\n" + "=".repeat(78));
P(ok
  ? `VEREDICTO · TRAMO F3-5 firmable: ${nTramo} tokens · dominio 4 documentos · invariante 0/4 familias · alcance de la guarda ${alcanceGuarda.length} campos`
  : "VEREDICTO · ❌ algún control cae — el tramo NO se firma");
P("=".repeat(78));

const salida = {
  meta: { tanda: "133.ª", escalon: "ESCALÓN 1", fecha: new Date().toISOString(), saboteada: SAB },
  tramo: { etiquetas: tramo.etiquetas, atributos: tramo.atributos, total: nTramo, porClase: porClaseTramo },
  /** El ESTADO va en la congelada: sin él, la foto de antes y la de después
   *  del alta son el mismo fichero y la §regla 5 no puede distinguirlas. */
  alta: { enElCenso: dentro, de: nTramoTot, aplicada: dentro === nTramoTot, formularioColado: coladas },
  dominio: dom,
  invariante: { familias: peligrosos, total: totalPeligro, paresLeidos, valoresObservados: Object.fromEntries([...valores].map(([k, v]) => [k, [...v].slice(0, 4)])) },
  regla25: { alcanceGuarda: alcanceGuarda.length, ficheros: porFichero, dominioInvariante: dom.documentos.length, apareceFuera: fueraHoy },
  fuera: Object.fromEntries(FUERA.map((c) => [c, porClase[c]])),
  fichaMedia: { canalImplicito: urlsAbsolutas },
  controles: { ok },
};

const { writeFileSync } = await import("node:fs");
let nombre = SAB ? `tramo-133-neg-${SAB}.json` : "tramo-133.json";
const cuerpo = JSON.stringify(salida, null, 1);
const sinFecha = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const destino = join(DERIV, nombre);
if (!SAB && !process.env.PISAR && existsSync(destino)
    && sinFecha(readFileSync(destino, "utf8")) !== sinFecha(cuerpo)) {
  const hoy = new Date().toISOString().slice(0, 10);
  let n = `tramo-133-${hoy}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `tramo-133-${hoy}-${++i}.json`;
  console.log(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  nombre = n;
}
writeFileSync(join(DERIV, nombre), cuerpo);
P(`\ncongelada → derivaciones/${nombre}`);

process.exit(ok ? 0 : 2);
