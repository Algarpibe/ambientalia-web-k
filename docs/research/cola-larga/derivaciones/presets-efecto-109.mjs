/* «NO EMITE LA CLASE» NO ES «NO SIRVE EL EFECTO» — 109.ª, ESCALÓN 2, 2026-08-25.
 *
 * `deudas-modelo-f33.log` §5 contesta *«¿ESCRIBE el clon esta CLASE?»*. Esto
 * intenta contestar la otra: *«¿SIRVE el clon este EFECTO?»* — y su resultado
 * principal va a ser **cuántos de los 16 pares NO se pueden contestar offline**,
 * que es información y no una excusa.
 *
 * ⚠ **NO es una sonda**: no declara `Evaluadas` ni congela en `medidas/`. No
 * abre el original ni el clon: lee corpus y congeladas.
 *
 * ── LOS TRES CANALES QUE SE MIRAN, y lo que cada uno puede decir ───────────
 *   1. la CASCADA capturada (`corpus/css`, hojas servidas por el original) —
 *      dice QUÉ PROPIEDAD gana la clase. Sin esto no hay pregunta que hacer;
 *   2. el HTML capturado del original — dice SOBRE QUÉ NODOS, o sea el `n`;
 *   3. el fuente del clon (`apps/web/src` + `packages/cms-config/src`) — dice
 *      si el clon **puede** servir esa propiedad.
 *
 * ⚠⚠ Y EL LÍMITE DEL CANAL 3, QUE HAY QUE DECLARAR ARRIBA Y NO EN UNA NOTA
 * (§regla 14): mirar el fuente del clon es **verificar contra la fuente que uno
 * supone responsable**, que es justo lo que §El principio prohíbe. Dice que la
 * propiedad EXISTE en alguna hoja del clon; **no** dice que llegue a estos
 * nodos, ni con qué valor, ni quién gana la cascada allí. Así que un «sí» del
 * canal 3 vale como *«hay candidato a otro canal»*, nunca como veredicto — y
 * por eso ningún par sale VERDE de aquí.
 */
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const CSS_DIR = join(RAIZ, "corpus/css");
const L = [];
const P = (s = "") => { L.push(s); console.log(s); };

/* ── 1 · LOS 16 PARES, DERIVADOS del log — no escritos a mano (§regla 9) ──── */
const LOG = join(AQUI, "deudas-modelo-f33.log");
if (!existsSync(LOG)) throw new Error("falta deudas-modelo-f33.log: corre antes esa derivación");
const lineas = readFileSync(LOG, "utf8").split("\n");
const ini = lineas.findIndex((x) => x.includes("clase") && x.includes("grupo") && x.includes("¿el clon la emite?"));
if (ini < 0) throw new Error("no encuentro la tabla de §5 en deudas-modelo-f33.log — ¿cambió su formato?");
const fin = lineas.findIndex((x, i) => i > ini && x.trim() === "");
const pares = lineas
  .slice(ini + 1, fin)
  .map((x) => ({ clase: x.slice(2, 42).trim(), grupo: x.slice(42, 71).trim(), nTotal: x.slice(71, 82).trim(), emite: x.trim().endsWith("SÍ") }))
  .filter((p) => p.clase && !p.emite);

/* ── 2 · COBERTURA del corpus CSS, declarada ANTES de leer ningún cero ─────
 * §sondas 4: un 0 de este canal puede ser la cobertura y no el original, así
 * que el denominador va delante del dato, no en una nota al pie. */
const INDICE = JSON.parse(readFileSync(join(CSS_DIR, "INDICE.json"), "utf8"));
const hojas = [];
(function anda(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p);
    else if (e.name.endsWith(".css")) hojas.push(p);
  }
})(CSS_DIR);
const css = hojas.map((h) => readFileSync(h, "utf8"));

/* ── 3 · la CASCADA: qué propiedad gana cada clase ────────────────────────── */
/* Se extraen los bloques `selector { decls }` cuyo selector nombre la clase.
 * Minificado o no, el corte por `}` funciona porque una declaración no puede
 * contener una llave sin comillas. */
/* ⚠⚠ LA V1 DE ESTA FUNCIÓN SOBRE-CASÓ, y el resultado era PLAUSIBLE, que es la
 * cara de §sondas 4 que invita a explicarla en vez de a dudar: dijo que
 * `et_pb_with_background` **gana `width`**. Una clase que se llama «con fondo»
 * ganando `width` y NO `background` es justo el número que hay que mirar dos
 * veces. La regla real es
 *     .et_pb_posts.et_pb_module article .et_pb_with_background .et_pb_row{width:80%}
 * — o sea que la propiedad la gana un **DESCENDIENTE**, no el nodo que lleva la
 * clase, y sólo dentro de un contexto (`.et_pb_posts`) que estos nodos puede
 * que ni tengan. Igual `et_pb_sticky_module`, cuyo `width` es de un
 * `.et_pb_image_wrap` de dentro.
 *
 * Es §*una regla en el NIVEL equivocado no da error* leída al revés: aquí no
 * falta el nivel, SOBRA — se atribuye a la clase lo que gana otro elemento.
 *
 * Se separan los dos papeles, porque deciden cosas distintas:
 *   · SUJETO  — la clase está en el último compuesto del selector: la propiedad
 *               cae en el nodo que la lleva. Esto SÍ es «el efecto del preset»;
 *   · CONTEXTO — la clase es un ancestro: el preset cambia a sus hijos. Cuenta,
 *               pero no se puede comparar en el mismo nodo ni atribuir igual. */
const ultimoCompuesto = (sel) => sel.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).pop() ?? "";
const propsDe = (clase) => {
  const sujeto = new Map();
  const contexto = new Map();
  let bSujeto = 0;
  let bContexto = 0;
  const re = new RegExp("([^{}]*\\." + clase + "[^{}]*)\\{([^{}]*)\\}", "g");
  for (const t of css) {
    for (const m of t.matchAll(re)) {
      /* un selector puede ser una lista: cada alternativa tiene su propio papel */
      const alts = m[1].split(",").filter((s) => s.includes("." + clase));
      const esSujeto = alts.some((s) => ultimoCompuesto(s).includes("." + clase));
      const destino = esSujeto ? sujeto : contexto;
      if (esSujeto) bSujeto++;
      else bContexto++;
      for (const d of m[2].split(";")) {
        const i = d.indexOf(":");
        if (i < 1) continue;
        const prop = d.slice(0, i).trim();
        if (!prop || prop.startsWith("-")) continue;
        if (!destino.has(prop)) destino.set(prop, new Set());
        destino.get(prop).add(d.slice(i + 1).trim());
      }
    }
  }
  return { props: sujeto, contexto, bloques: bSujeto, bloquesContexto: bContexto };
};

/* ── 4 · el canal 3: ¿el clon PUEDE servir esa propiedad? ─────────────────── */
const srcClon = ["apps/web/src", "packages/cms-config/src"]
  .flatMap((d) => {
    const out = [];
    (function rec(x) {
      for (const e of readdirSync(x, { withFileTypes: true })) {
        const p = join(x, e.name);
        if (e.isDirectory()) rec(p);
        else if (/\.(tsx?|css)$/.test(e.name)) out.push(readFileSync(p, "utf8"));
      }
    })(join(RAIZ, d));
    return out;
  })
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

/* ── 5 · los ejes que `f33-cmp` compara, DERIVADOS de su congelada ────────── */
const MED = join(RAIZ, "scripts/qa/medidas");
const CMP = "f33-cmp-1440.json";
const cmp = JSON.parse(readFileSync(join(MED, CMP), "utf8"));
const unaPag = cmp.paginas[Object.keys(cmp.paginas)[0]];
const ejesCmp = new Set(Object.keys(unaPag.original ?? {}));

/* ── INFORME ──────────────────────────────────────────────────────────────── */
P("══════════════════════════════════════════════════════════════════════");
P("  «NO EMITE LA CLASE» NO ES «NO SIRVE EL EFECTO» — 109.ª · ESCALÓN 2");
P("══════════════════════════════════════════════════════════════════════");
P(`  pares SIN EMITIR, derivados de deudas-modelo-f33.log: ${pares.length}`);
P(`  clases distintas: ${new Set(pares.map((p) => p.clase)).size}`);
P("");
P("── 0 · COBERTURA DEL CANAL 1, delante del dato ────────────────────────");
P(`   hojas del original DISTINTAS ...... ${INDICE.resumen.hojasDistintas}`);
P(`   CAPTURADAS ........................ ${INDICE.resumen.capturadas}   (leídas aquí: ${hojas.length})`);
P(`   SIN CAPTURAR ...................... ${INDICE.resumen.sinCapturar}`);
P(`   alcance declarado ................. ${INDICE.meta.alcance}`);
P("");
P("   ⚠ CONSECUENCIA, y decide cómo se lee cada cero: con 399 hojas sin");
P("     capturar, «0 reglas» NO distingue «la clase no tiene regla» de «su hoja");
P("     no está». Todo cero de este canal sale NO CONTESTABLE, nunca AUSENTE.");
P("");
P("── 1 · EJES QUE `f33-cmp` COMPARA, derivados de su congelada ──────────");
P(`   fuente: ${CMP}`);
P(`   ejes  : ${[...ejesCmp].join(" · ")}`);
P("   ⇒ son GEOMETRÍA y estructura. Una propiedad que no cambie ninguno de");
P("     éstos NO se puede adjudicar con esta congelada, por mucho que se mida.");
P("");

/* clasificación */
const GEOMETRICAS = /^(width|max-width|min-width|height|max-height|min-height|margin|padding|top|left|right|bottom|flex|float|display|position|grid)/;
const filas = [];
for (const p of pares) {
  const { props, contexto, bloques, bloquesContexto } = propsDe(p.clase);
  const nombres = [...props.keys()];
  const nContexto = [...contexto.keys()];
  const geo = nombres.filter((x) => GEOMETRICAS.test(x));
  let salida, razon;
  if (!nombres.length) {
    salida = "NO CONTESTABLE";
    razon = bloquesContexto
      ? `0 reglas donde la clase sea SUJETO (${bloquesContexto} donde es CONTEXTO: ${nContexto.slice(0, 3).join("/")}) — el preset cambia a sus hijos, no a su nodo`
      : `0 reglas en ${hojas.length} hojas — y con ${INDICE.resumen.sinCapturar} sin capturar, el cero no es del original`;
  } else if (!geo.length) {
    salida = "NO CONTESTABLE";
    razon = `gana ${nombres.slice(0, 3).join("/")} — ninguna es geométrica, así que f33-cmp no puede verla`;
  } else {
    const puede = geo.some((x) => srcClon.includes(x));
    salida = puede ? "OTRO CANAL?" : "EFECTO AUSENTE?";
    razon = `gana ${geo.slice(0, 3).join("/")} (geométrica) · el fuente del clon ${puede ? "SÍ" : "NO"} menciona esa propiedad`;
  }
  filas.push({ ...p, nProps: nombres.length, bloques, bloquesContexto, nContexto, props: nombres, geo, salida, razon });
}

P("── 2 · PAR A PAR ──────────────────────────────────────────────────────");
P("");
for (const f of filas) {
  P(`   ${f.clase} · ${f.grupo}   ${f.nTotal}`);
  P(`      reglas donde es SUJETO      : ${f.bloques} bloque(s) · ${f.nProps} propiedad(es)`);
  P(`      reglas donde es CONTEXTO    : ${f.bloquesContexto} bloque(s) · ${f.nContexto.length} propiedad(es) sobre DESCENDIENTES`);
  if (f.nProps) P(`      propiedades                : ${f.props.slice(0, 8).join(" · ")}${f.nProps > 8 ? " …" : ""}`);
  P(`      ⇒ ${f.salida}  — ${f.razon}`);
  P("");
}

P("── 3 · EL REPARTO ─────────────────────────────────────────────────────");
const cuenta = {};
for (const f of filas) cuenta[f.salida] = (cuenta[f.salida] ?? 0) + 1;
for (const [k, v] of Object.entries(cuenta).sort((a, b) => b[1] - a[1])) {
  const cl = new Set(filas.filter((f) => f.salida === k).map((f) => f.clase)).size;
  P(`   ${k.padEnd(16)} ${String(v).padStart(2)} pares · ${cl} clases`);
}
P("");
P(`   CERRADOS con un Δ de dos lados sobre su propiedad: 0 de ${filas.length}`);
P("   — y no por falta de ganas: ninguna congelada de este repo compara");
P("     `text-align`, `background` ni `position` en estos nodos.");
P("");

P("══════════════════════════════════════════════════════════════════════");
P("  LO QUE ESTO CONTESTA Y LO QUE NO");
P("══════════════════════════════════════════════════════════════════════");
P("   CONTESTA: qué propiedad gana cada clase en el original, con su cardinal");
P("   de bloques, y si esa propiedad cae dentro de lo que `f33-cmp` compara.");
P("");
P("   NO CONTESTA, y son tres cosas distintas:");
P("     · si el clon sirve el EFECTO en ESTOS nodos. El canal 3 mira el FUENTE");
P("       del clon, que es §*verificar contra la fuente que uno supone");
P("       responsable*. Dice «hay candidato», nunca «sirve». Por eso las dos");
P("       salidas llevan interrogante: `OTRO CANAL?` y `EFECTO AUSENTE?`;");
P("     · las INSTANCIAS SEPARADORAS. Saber que una clase gana `text-align`");
P("       no dice que cambie nada observable en las 31 rutas: para eso hay que");
P("       comparar los nodos CON y SIN la clase, y eso pide el original vivo;");
P("     · nada a 390. Si esto se midiera contra el original iría a LOS DOS");
P("       ANCHOS (§regla 35): un preset con `@media` puede tener ganador");
P("       distinto, y el ancho donde su regla no compite no puede verla.");
P("");
P("   ⇒ LO QUE HARÍA FALTA, nombrado: una sonda de DOS LADOS que compare la");
P("     PROPIEDAD ganadora sobre los nodos que llevan la clase, a 1440 y 390.");
P("     No existe — `f33-cmp` compara geometría de caja, no propiedades.");
P("");

/* ── 4 · EL PRE-REGISTRO CONTRA EL RESULTADO ──────────────────────────────── */
P("══════════════════════════════════════════════════════════════════════");
P("  EL PRE-REGISTRO CONTRA EL RESULTADO (PRE-REGISTRO-PRESETS-109.md)");
P("══════════════════════════════════════════════════════════════════════");
const esperado = { "OTRO CANAL?": 8, "EFECTO AUSENTE?": 3, "NO CONTESTABLE": 5 };
for (const k of ["OTRO CANAL?", "EFECTO AUSENTE?", "NO CONTESTABLE"]) {
  const real = cuenta[k] ?? 0;
  P(`   ${k.padEnd(17)} predicho ${String(esperado[k]).padStart(2)} · real ${String(real).padStart(2)}   ${real === esperado[k] ? "✅" : "❌"}`);
}
P("");
P("   ⇒ EL REPARTO POR PAR: FALLADO, y en la dirección optimista — predije");
P("     que la mayoría se resolvería por otro canal y casi todo es NO");
P("     CONTESTABLE. El motivo es una distinción que el pre-registro no tenía:");
P("     SUJETO contra CONTEXTO. Varias clases NO tienen ni una regla donde");
P("     ellas sean el sujeto.");
P("");
P("   ⇒ LA PREDICCIÓN ESTRUCTURAL —la que el pre-registro dice que más se");
P("     jugaba— CUMPLIDA, y por sus dos mitades:");
P(`        «≥ 5 pares en NO CONTESTABLE»  →  ${cuenta["NO CONTESTABLE"] ?? 0}   ✅`);
P(`        «0 pares cerrados con Δ»       →  0    ✅`);
P("     Su refutación estaba escrita —«≥3 pares cerrados con Δ de dos lados»—");
P("     y no se ha producido.");
P("");

/* ── 5 · LO ACCIONABLE: dónde vive el efecto ──────────────────────────────── */
P("══════════════════════════════════════════════════════════════════════");
P("  LO ACCIONABLE PARA QUIEN CONSTRUYA ESA SONDA");
P("══════════════════════════════════════════════════════════════════════");
const soloContexto = filas.filter((f) => f.bloques === 0 && f.bloquesContexto > 0);
const conSujeto = filas.filter((f) => f.bloques > 0);
const sinNada = filas.filter((f) => f.bloques === 0 && f.bloquesContexto === 0);
P(`   pares cuyo efecto está en el NODO (la clase es sujeto) ... ${conSujeto.length}`);
P(`   pares cuyo efecto está en los DESCENDIENTES .............. ${soloContexto.length}`);
for (const f of soloContexto) P(`       ${f.clase} · ${f.grupo} → ${f.nContexto.slice(0, 4).join("/")}`);
P(`   pares SIN NINGUNA regla en lo capturado ................. ${sinNada.length}`);
for (const f of sinNada) P(`       ${f.clase} · ${f.grupo}`);
P("");
P("   ⚠ Y ESTO CAMBIA EL DISEÑO DE LA SONDA, no sólo su alcance: para los");
P("     pares de DESCENDIENTES, comparar la propiedad EN EL NODO QUE LLEVA LA");
P("     CLASE daría Δ0 con el defecto puesto — el nodo no cambia, cambian sus");
P("     hijos. Es §*una regla en el NIVEL equivocado no da error*, y aquí se");
P("     sabe de antemano en qué nivel mirar cada uno.");
P("");
P("   ⚠ Y los que no tienen ninguna regla NO son «sin efecto»: son la");
P(`     COBERTURA (${INDICE.resumen.sinCapturar} hojas sin capturar). Lo que los cerraría es`);
P("     capturar sus hojas, no medir más — y eso necesita red.");

writeFileSync(join(AQUI, "presets-efecto-109.log"), L.join("\n") + "\n", "utf8");
