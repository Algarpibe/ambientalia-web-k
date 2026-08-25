/* LA CLASE DEL RESOLUTOR — 109.ª tanda, PASO 0, 2026-08-25.
 *
 * La 108.ª arregló SU resolutor (`porMtime` con `permiteArtefacto`). Eso es la
 * INSTANCIA. Esto deriva la CLASE, en las dos direcciones que §*una comprobación
 * retroactiva se enmarca en las DOS direcciones* exige.
 *
 * ⚠ **NO es una sonda** —no declara `Evaluadas` ni congela en `medidas/`—: es
 * una lectura del árbol. Su salida va a `resolutores-109.log`, al lado.
 *
 * ⚠⚠ LO QUE CORRIGE DEL ENCARGO, y no es un matiz de etiqueta: el encargo cuenta
 * «9 resuelven por readdir+mtime». Ese número es LÉXICO —sale de que el fichero
 * mencione `readdirSync` y `mtime`—, no FUNCIONAL. Hay DOS clases de defecto y
 * **se arreglan al revés**:
 *
 *   · RESUELVE-POR-MTIME sin descartar marcadores → se pasa a
 *     `eligeCongeladaAnterior`, que ya descarta `/-neg-|SABOTAJE|SONDA-/` y
 *     `-CONTAMINADA` (lib.mjs:1210 y :1291);
 *   · CABLEA-UN-CANÓNICO → `eligeCongeladaAnterior` NO lo arregla. Su modo de
 *     fallo es el contrario y ya está escrito en §regla 5: *`<nombre>.json`
 *     significa «la PRIMERA foto», no «el estado de hoy»*. Y su caso peor es
 *     que el canónico haya sido LIBERADO por un renombre de §regla 5bis — y
 *     entonces el consumidor está MUERTO y nadie lo sabe.
 *
 * ⚠ Y LA PRIMERA VERSIÓN DE ESTE DETECTOR COMETIÓ LAS TRES CARAS DE §sondas 4 A
 * LA VEZ. Se cazaron porque los números eran inverosímiles (340 «cableados
 * vivos», `INDICE.json` entre las congeladas), no porque nada diera error:
 *
 *   · SOBRE-CASADO — un `"INDICE.json"` suelto contaba como congelada de
 *     `medidas/`. Vive en `corpus/`: 15 «AUSENTES» que no lo eran;
 *   · LECTOR vs ESCRITOR — `f33-geo.mjs:730` hace `w("medidas/f33-geo.json")`.
 *     Es el PRODUCTOR, no un consumidor muerto;
 *   · COMENTARIO — `caducidad-geo390.mjs:39` NOMBRA el canónico para explicar
 *     que acababa de liberarlo. Mencionar no es leer.
 *
 * Las tres inflaban el recuento HACIA ARRIBA, que es la dirección que se lee
 * como hallazgo. Por eso el CONTROL de abajo incluye ahora un caso de cada una:
 * un detector que no sepa distinguirlas no puede publicar un cero ni un pleno.
 */
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const MEDIDAS = join(RAIZ, "scripts/qa/medidas");
const rel = (p) => relative(RAIZ, p).replace(/\\/g, "/");

/* Marcadores de §regla 7, copiados de lib.mjs:1210 + `-CONTAMINADA` de :1291.
 * Se COPIAN y no se importan a propósito: importarlos ataría esta derivación a
 * la librería que está auditando. */
const MARCADO = /-neg-|SABOTAJE|SONDA-|-CONTAMINADA/;

/* ── 0 · el árbol de fuentes ──────────────────────────────────────────────── */
const IGNORA = new Set(["node_modules", ".next", ".git", ".next-nuevo", "dist", "build"]);
const fuentes = [];
(function anda(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORA.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) anda(p);
    else if (/\.(mjs|js|ts)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) fuentes.push(p);
  }
})(RAIZ);

const congeladas = existsSync(MEDIDAS) ? readdirSync(MEDIDAS) : [];
const congeladasSet = new Set(congeladas);

/* ── 1 · CLASIFICACIÓN, por lo que el fuente HACE ─────────────────────────── */
const filas = [];
for (const p of fuentes) {
  const src = readFileSync(p, "utf8");
  const r = rel(p);
  if (r.endsWith("resolutores-109.mjs")) continue; /* no se audita a sí misma */

  const usaLib = /eligeCongeladaAnterior/.test(src);

  /* RESUELVE-POR-MTIME: lista un directorio Y ordena por mtime. Las dos cosas:
   * un `statSync(x).mtime` a secas casi siempre es IMPRIMIR una fecha, que es
   * el patrón correcto y no un resolutor. */
  const lista = /readdirSync\s*\(/.test(src);
  const ordenaPorTiempo = /mtimeMs/.test(src) && /\.sort\s*\(|reduce\s*\(/.test(src);
  const resuelveMtime = lista && ordenaPorTiempo && !usaLib;

  /* CABLEA: toda línea que nombre un fichero bajo `medidas/`, clasificada por lo
   * que la línea HACE. Sólo `medidas/` — `corpus/…/INDICE.json` no es una
   * congelada de sonda y no tiene el modo de fallo de §regla 5. */
  /* Se parte por LÍNEAS y se busca dentro de cada una. La v2 de este detector
   * casaba la línea entera con un comodín «resto de línea» a CADA LADO del
   * literal, sobre el fuente completo, y se COLGÓ: eso es backtracking
   * cuadrático, y sobre ficheros de decenas de miles de líneas no termina. No
   * dio error — dejó de imprimir, que es la forma en que una sonda se muere sin
   * decirlo (0 bytes de salida y el proceso vivo).
   *
   * ⚠ Y la v3 no compiló, por la razón que este repo ya tiene escrita para CSS:
   * un comentario NO PUEDE CONTENER el token de cierre, ni citando un regex.
   * Escribir aquí el patrón literal cerraba el bloque y lo que seguía pasaba a
   * ser código. Por eso arriba se describe en palabras y no se transcribe. */
  const menciones = [];
  for (const linea of src.split("\n")) {
    const enLaLinea = [...linea.matchAll(/medidas\/([\w.-]+\.json)/g)];
    if (!enLaLinea.length) continue;

    /* ⚠ EL CONTROL CAZÓ AQUÍ UN DEFECTO REAL, y es de manual: clasificar POR
     * LÍNEA no ve una lectura PARTIDA EN DOS. `hoja-f33-derivable.mjs` hace
     *     const F = join(RAIZ, "scripts/qa/medidas/f33-geo.json");
     *     const geo = JSON.parse(readFileSync(F, "utf8"));
     * — el literal está en una línea y el `readFileSync` en la siguiente, así
     * que el detector lo marcaba "OTRO" y el lector MUERTO no salía. Es
     * §*la causa común: el NIVEL al que se mide*, con el nivel puesto en la
     * LÍNEA cuando la propiedad vive en el FICHERO.
     *
     * Se arregla siguiendo la variable: si el literal se liga a un nombre, se
     * busca ese nombre en el resto del fuente. */
    let que = /^\s*(\*|\/\*|\/\/)/.test(linea)
      ? "COMENTARIO"
      : /\bw\s*\(\s*[`"']/.test(linea) || /writeFileSync/.test(linea)
        ? "ESCRIBE"
        : /readFileSync|JSON\.parse/.test(linea)
          ? "LEE"
          : /existsSync/.test(linea)
            ? /* ⚠ Un `existsSync` SOLO es un SONDEO, no una lectura de contenido:
               * pregunta «¿está?» justo para poder decir que no está. Contarlo
               * como lectura marcaba de «consumidor muerto» a la derivación que
               * COMPRUEBA que el canónico murió — o sea al instrumento, por
               * hacer su trabajo. Es §regla 25: una guarda cuyo dominio es más
               * ancho que su invariante deja de proteger y pasa a bloquear. */
              "SONDEO"
            : "OTRO";

    if (que === "OTRO") {
      const lig = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(linea);
      if (lig) {
        const v = lig[1];
        const usa = new RegExp(`(?:readFileSync|existsSync|JSON\\.parse)\\s*\\(\\s*${v}\\b`);
        const esc = new RegExp(`writeFileSync\\s*\\(\\s*${v}\\b`);
        if (esc.test(src)) que = "ESCRIBE";
        else if (usa.test(src)) que = "LEE";
      }
    }
    for (const m of enLaLinea) menciones.push({ nombre: m[1], que, via: "literal" });
  }

  /* ⚠ Y EL CONTROL CAZÓ UN SEGUNDO HUECO, más ancho que el primero: un HELPER
   * que recibe el nombre PELADO. `caducidad-geo390.mjs` hace
   *     const MED = join(RAIZ, "scripts/qa/medidas");
   *     const lee = (n) => JSON.parse(readFileSync(join(MED, n), "utf8"));
   *     const GEO = lee("f33-geo-SONDA-390-…json");
   * y ahí el literal NO contiene `medidas/` por ninguna parte. El detector lo
   * daba por «sin menciones» — o sea CERO, que es §sondas 4 exacta.
   *
   * La v1 sí lo intentaba, y sobre-casaba: cogía todo `"x.json"` del fichero y
   * se tragaba `INDICE.json` y `LISTA-DERIVADA.json`, que viven en `corpus/`.
   * La salida honesta no es elegir entre las dos: es coger los pelados Y
   * RESOLVERLOS contra `medidas/`. El que no resuelva ahí **no se cuenta como
   * ausente** —puede ser de corpus— y se publica con su cardinal (§regla 14). */
  /* ⚠⚠ §regla 5ter EN DIRECTO, y se cazó en la misma tanda: EL ARREGLO DEL
   * OBJETO CADUCÓ ESTE DETECTOR. Al reparar los 4 lectores muertos se les puso
   *     const GEO_F33 = "f33-geo-SONDA-….json";
   *     const F = join(RAIZ, "scripts/qa/medidas", GEO_F33);
   * — y entonces NINGUNA línea contiene a la vez `medidas/` y el `.json`. Los 4
   * ficheros desaparecieron del censo, que pasó a informar 0 lectores por estar
   * CIEGO, no por estar limpio. El control lo dijo (4/5) porque tenía un caso
   * conocido de antemano; sin él, el cero se habría leído como el arreglo.
   *
   * Se cubre la indirección por CONSTANTE, que es el tercer canal después del
   * literal y del helper. */
  const nombresPorConstante = [];
  if (/medidas/.test(src)) {
    for (const c of src.matchAll(/(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*["'`]([\w.-]+\.json)["'`]/g)) {
      nombresPorConstante.push(c[1]);
    }
  }
  for (const n of nombresPorConstante) {
    if (!congeladasSet.has(n)) continue; /* sólo si resuelve en medidas/ */
    if (menciones.some((m) => m.nombre === n)) continue;
    menciones.push({ nombre: n, que: /readFileSync|JSON\.parse/.test(src) ? "LEE" : "OTRO", via: "constante" });
  }

  const ligaAlDir = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*join\([^)]*["'`][^"'`]*medidas["'`]/.exec(src);
  let pelados = 0;
  if (ligaAlDir) {
    const dirVar = ligaAlDir[1];
    /* helpers que envuelven ese directorio, y si leen o escriben */
    const lectores = new Set();
    const escritores = new Set();
    for (const linea of src.split("\n")) {
      if (!linea.includes(dirVar)) continue;
      const h = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(linea);
      if (!h) continue;
      if (/writeFileSync/.test(linea)) escritores.add(h[1]);
      else if (/readFileSync|existsSync/.test(linea)) lectores.add(h[1]);
    }
    for (const nom of [...lectores, ...escritores]) {
      const re = new RegExp(`\\b${nom}\\s*\\(\\s*[\\n\\s]*["'\`]([\\w.-]+\\.json)["'\`]`, "g");
      for (const c of src.matchAll(re)) {
        menciones.push({ nombre: c[1], que: escritores.has(nom) ? "ESCRIBE" : "LEE", via: "helper" });
        pelados++;
      }
    }
  }
  if (pelados) filas.pelados = (filas.pelados ?? 0) + pelados;

  if (!resuelveMtime && !usaLib && !menciones.length) continue;

  filas.push({
    fichero: r,
    usaLib,
    resuelveMtime,
    descarta: /-neg-|SABOTAJE|SONDA-|CONTAMINADA|yaMarcado|permiteArtefacto/.test(src),
    menciones,
    esNegativo: /\.neg\.mjs$|\.test\.mjs$/.test(r),
    esSeed: r.startsWith("scripts/seed/"),
    esLib: r.startsWith("scripts/qa/lib"),
  });
}

/* ── 2 · ¿EL CABLEADO EXISTE HOY? ─────────────────────────────────────────── */
/* Lo más barato del catálogo y nadie lo había corrido: un canónico cableado que
 * ya no existe es un consumidor MUERTO. §regla 9 8.º caso dice que ése es justo
 * el efecto buscado al liberar el nombre — pero sólo cobra si alguien pasa. */
const estadoDe = (base) => {
  if (congeladas.includes(base)) return { estado: MARCADO.test(base) ? "VIVO-MARCADO" : "VIVO", hermanas: [] };
  const raiz = base.replace(/\.json$/, "");
  const hermanas = congeladas.filter((f) => f.startsWith(raiz));
  return { estado: hermanas.length ? "LIBERADO" : "AUSENTE", hermanas };
};

/* ── 3 · INFORME ──────────────────────────────────────────────────────────── */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("══════════════════════════════════════════════════════════════════════");
say("  LA CLASE DEL RESOLUTOR — 109.ª · PASO 0 · 2026-08-25");
say("══════════════════════════════════════════════════════════════════════");
say(`  árbol barrido: ${fuentes.length} ficheros de fuente (.mjs/.js/.ts, sin node_modules)`);
say(`  congeladas en medidas/: ${congeladas.length}  ·  marcadas §regla 7: ${congeladas.filter((f) => MARCADO.test(f)).length}`);
say("");

/* 3.0 · EL CONTROL, antes de creerse ningún recuento. */
say("── 0 · CONTROL DEL DETECTOR (§regla 8: sin control no significa nada) ──");
say("   Un caso conocido de antemano por cada una de las tres caras que la v1");
say("   de este detector cometió. Si alguno falla, sus ceros no son datos.");
say("");
const control = [
  ["scripts/qa/lh-cmp.mjs", (f) => f?.usaLib === true, "usa la librería"],
  ["scripts/qa/lh-cubos.mjs", (f) => f?.usaLib === true, "usa la librería"],
  ["docs/research/cola-larga/derivaciones/hoja-f33-derivable.mjs", (f) => f?.menciones.some((m) => m.que === "LEE") && !f?.resuelveMtime, "CABLEA y LEE — no resuelve"],
  ["scripts/qa/f33-geo.mjs", (f) => f?.menciones.some((m) => m.que === "ESCRIBE"), "es el ESCRITOR, no un consumidor"],
  /* ⚠ Este caso estaba MAL ESCRITO en la v3 y falló por culpa del control, no
   * del detector: pedía «ninguna mención es LEE», y esta derivación SÍ lee —
   * lee la congelada RENOMBRADA, que es legítimo y es su trabajo. Lo que hay
   * que afirmar es más estrecho: que no lee el canónico `f33-geo.json`, al que
   * sólo NOMBRA en un comentario. Un control demasiado ancho rechaza lo
   * correcto (§regla 25) y se lee como avería del instrumento. */
  ["docs/research/cola-larga/derivaciones/caducidad-geo390.mjs", (f) => f && !f.menciones.some((m) => m.que === "LEE" && m.nombre === "f33-geo.json"), "NOMBRA el canónico en un comentario; lee la renombrada"],
];
let ctrlOk = 0;
for (const [f, pred, que] of control) {
  const fila = filas.find((x) => x.fichero === f);
  const ok = !!pred(fila);
  if (ok) ctrlOk++;
  say(`  ${ok ? "✅" : "❌"} ${f.padEnd(62)} ${que}`);
}
say(`  ⇒ ${ctrlOk}/${control.length} casos conocidos de antemano reencontrados`);
if (ctrlOk !== control.length) say("  ⛔ EL DETECTOR ESTÁ ROTO: sus ceros no son datos.");
say("");

/* 3.1 · dirección (b) */
say("── 1 · (b) ¿SE UNIFICA TODO CONTRA `eligeCongeladaAnterior`? ──────────");
say("   unidad: el FICHERO que resuelve. NO la llamada, NO la mención léxica.");
say("");
const usanLib = filas.filter((f) => f.usaLib && !f.esLib);
const porMtime = filas.filter((f) => f.resuelveMtime);
say(`   USAN LA LIBRERÍA .................. ${usanLib.length}`);
for (const f of usanLib) say(`      ${f.fichero}`);
say("");
say(`   RESUELVEN POR MTIME por su cuenta . ${porMtime.length}`);
const defectos = [];
for (const f of porMtime) {
  const legitimo = f.esNegativo || f.esSeed || f.esLib;
  const razon = f.esLib
    ? "ES la librería"
    : f.esNegativo
      ? "NEGATIVO: necesita leer su propio artefacto"
      : f.esSeed
        ? "SEED: consume corpus/media, no congeladas de sonda"
        : f.descarta
          ? "descarta marcadores POR SU CUENTA (§108.ª)"
          : "⛔ NINGUNA";
  if (!legitimo && !f.descarta) defectos.push(f);
  say(`      ${legitimo || f.descarta ? "✅ legítimo" : "⛔ DEFECTO "} ${f.fichero.padEnd(56)} descarta=${f.descarta ? "sí" : "NO"}  ${razon}`);
}
say("");
say(`   ⇒ de ${porMtime.length} resolutores por mtime: LEGÍTIMOS ${porMtime.length - defectos.length} · DEFECTOS ${defectos.length}`);
say(`   ⇒ RESPUESTA: ${defectos.length === 0 ? "NO se unifica — no queda ninguno que unificar" : `se pasan ${defectos.length} a la librería`}`);
say("");

/* 3.2 · la OTRA clase, la que el encargo no nombra */
say("── 2 · LA OTRA CLASE, LA QUE EL ENCARGO NO NOMBRA: CABLEAR UN CANÓNICO ─");
say("   `eligeCongeladaAnterior` NO arregla esto. §regla 5: el nombre canónico");
say("   es la PRIMERA foto, no el estado de hoy. Y si un renombre de §regla 5bis");
say("   lo LIBERÓ, el consumidor está MUERTO — y sólo se entera quien lo corra.");
say("");
const cuenta = { VIVO: 0, "VIVO-MARCADO": 0, LIBERADO: 0, AUSENTE: 0 };
const muertos = [];
const escritores = [];
/* Los pelados-vía-helper que NO resuelven en `medidas/` se EXCLUYEN del
 * recuento y se publican con su cardinal: pueden ser de `corpus/`, y contarlos
 * como ausentes es justo el sobre-casado que la v1 cometió. §*los ejes
 * excluidos se reparten igual y se publican con su cardinal*. */
let fueraDeMedidas = 0;
for (const f of filas) {
  for (const m of f.menciones) {
    if (m.que === "COMENTARIO") continue;
    if (m.que === "ESCRIBE") { escritores.push({ f: f.fichero, n: m.nombre }); continue; }
    if (m.que !== "LEE") continue;
    const { estado, hermanas } = estadoDe(m.nombre);
    if (m.via === "helper" && estado === "AUSENTE") { fueraDeMedidas++; continue; }
    cuenta[estado]++;
    if (estado !== "VIVO") muertos.push({ fichero: f.fichero, cableado: m.nombre, estado, hermanas, esNegativo: f.esNegativo });
  }
}
say(`   LECTURAS de un canónico cableado, por estado del fichero:`);
say(`     VIVO y sin marcador ......... ${cuenta.VIVO}`);
say(`     VIVO pero MARCADO ........... ${cuenta["VIVO-MARCADO"]}   lee un artefacto de §regla 7 — ver el reparto abajo`);
say(`     LIBERADO (hay hermanas) ..... ${cuenta.LIBERADO}   ⛔ consumidor MUERTO`);
say(`     AUSENTE (ni hermanas) ....... ${cuenta.AUSENTE}`);
say("");
say("   ⚠ Leer un MARCADO no es por sí solo un defecto, y el discriminador es");
say("     barato: **un nombre marcado se escribe entero o no se escribe**. Los de");
say("     esta familia miden 60–90 caracteres con su alcance dentro, así que");
say("     teclearlo es una DECISIÓN — es el patrón de `caducidad-geo390`, que");
say("     audita justamente lo renombrado. El defecto sería llegar a un marcado");
say("     por RESOLUCIÓN (lo que `eligeCongeladaAnterior` impide) o por un nombre");
say("     corto que no declare nada.");
say(`   (ESCRITURAS, fuera del recuento: ${escritores.length} — son el PRODUCTOR)`);
say(`   (pelados vía HELPER que no resuelven en medidas/: ${fueraDeMedidas} — excluidos,`);
say(`    no contados como ausentes: casi todos son de \`corpus/\`)`);
say("");
if (muertos.length) {
  say("   detalle de lo que NO resuelve hoy:");
  const porFichero = new Map();
  for (const m of muertos) {
    if (!porFichero.has(m.cableado)) porFichero.set(m.cableado, []);
    porFichero.get(m.cableado).push(m);
  }
  for (const [cableado, ms] of porFichero) {
    const e = ms[0];
    say(`     ${e.estado.padEnd(9)} → ${cableado}   (${ms.length} lector${ms.length > 1 ? "es" : ""})`);
    for (const m of ms) say(`                  ${m.esNegativo ? "· (negativo)" : "·"} ${m.fichero}`);
    if (e.hermanas.length) {
      const marc = e.hermanas.filter((h) => MARCADO.test(h)).length;
      say(`                  hermanas: ${e.hermanas.length} — ${marc} marcadas, ${e.hermanas.length - marc} sin marcar`);
    }
  }
}
say("");

/* 3.3 · el patrón correcto */
say("── 3 · EL PATRÓN CORRECTO, para que no se lea «cablear es malo» ────────");
const fechados = filas.flatMap((f) => f.menciones.filter((m) => m.que === "LEE" && /\d{4}-\d{2}-\d{2}/.test(m.nombre)));
say(`   lecturas de un cableado CON FECHA en el nombre: ${fechados.length}`);
say("   Un nombre fechado NO tiene el modo de fallo de §regla 5: no promete ser");
say("   «el de hoy», así que no puede envejecer en silencio. Citar una congelada");
say("   concreta por su nombre fechado es lo CORRECTO, no un defecto.");
say("");

say("══════════════════════════════════════════════════════════════════════");
say("  LO QUE ESTA DERIVACIÓN **NO** CONTESTA");
say("══════════════════════════════════════════════════════════════════════");
say("   §*antes de construir sobre una medida, escribe qué preguntas NO contesta*");
say("");
say("   · si un cableado VIVO apunta a la congelada CORRECTA: existir no es ser");
say("     la buena. Eso exige leer la conclusión, y se hace caso a caso;");
say("   · nada de los `.log` ya congelados: un consumidor muerto NO invalida lo");
say("     que escribió cuando su fuente vivía. Eso es §regla 5bis y se adjudica");
say("     cruzando con otra medida del MISMO objeto — hecho aparte para");
say("     `hoja-f33-derivable.log`;");
say("   · los que resuelvan por GLOB de otra librería: el detector exige");
say(`     \`readdirSync\`. Derivado, no supuesto: 0 de ${fuentes.length} fuentes importan`);
say("     glob/fast-glob/globby en este árbol, así que el hueco está VACÍO;");
say("   · los cableados en ficheros que no son fuente (`.md`, `.json`, scripts de");
say("     `package.json`): fuera del barrido por construcción.");

writeFileSync(join(AQUI, "resolutores-109.log"), L.join("\n") + "\n", "utf8");
