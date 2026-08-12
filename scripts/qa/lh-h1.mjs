/**
 * ¿«VACÍO» O «AUSENTE»? — la forma del `<h1>` en la población entera de F3-2.
 * Uso: node scripts/qa/lh-h1.mjs        (npm run qa:lh-h1)
 *
 * ── De dónde sale la pregunta ─────────────────────────────────────────────
 * `lh-censo` guardó **`h1: ""`** para `/es/glosario/` y `/es/preguntas-frecuentes/`,
 * y ese valor **colapsa dos hechos distintos**: «lo encontré y estaba vacío» y
 * «no lo encontré». Es §la regla del cero de `CLAUDE.md` —*no encontrar nada y
 * no mirar nada dan la misma salida*— dentro de un censo que después se citó.
 *
 * `D4` afirma, con `lh-censo` por evidencia: *«los 35 `h1` = nombre del
 * término/índice»*. Esta sonda existe para contestar **las dos direcciones** que
 * §UNA COMPROBACIÓN RETROACTIVA SE ENMARCA EN LAS DOS DIRECCIONES exige, con el
 * mismo barrido y antes de mirar:
 *
 *   (a) ¿alguna medida congelada o decisión cerrada se apoya en ese `""`?
 *   (b) ¿la lectura NUEVA de `lh-spec` —`hayH1: false` ⇒ *ausente*— está
 *       SOBRE-GENERALIZADA, o sea, hay formas con un `<h1>` vacío legítimo que
 *       estaría tratando como ausente?
 *
 * ── Por qué sobre la CAPTURA ──────────────────────────────────────────────
 * Porque la pregunta es de MARCADO SERVIDO y la población entera está congelada:
 * **149 documentos**. En vivo daría 13 y una cota; aquí da el censo completo.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas` con el mínimo derivado del recuento de ficheros;
 * 2 · el patrón de `<h1>` es DISCRIMINANTE en el sentido débil —no tiene que
 *     casar en todos— pero **sí tiene que casar en alguno**: si sale 0 en los
 *     149, es un selector muerto y no un sitio sin titulares (§sondas 4);
 * 3 · congela en `medidas/lh-h1.json`;
 * 4 · negativo: `SABOTAJE=patron-muerto|colapsa|vacio-inyectado|colapsa-con-vacio`.
 *
 * ⚠ **Y los dos últimos existen porque `colapsa` A SOLAS NO PRUEBA NADA, y eso
 * se descubrió corriéndolo.** `colapsa` reproduce el defecto de `lh-censo`
 * —leer el TEXTO en vez del ELEMENTO— y da **exactamente el mismo resultado**
 * que la corrida limpia: 137 · 0 · 12. No porque el defecto no exista, sino
 * porque **esta población no lo ejercita**: no hay ni un `<h1>` vacío en los
 * 149, así que texto y elemento coinciden documento a documento.
 *
 * Es §sondas 8a en su enunciado literal — *un sabotaje que no cambia el
 * resultado no ha probado la guarda: ha probado que el instrumento no la
 * ejercita*—. El control que faltaba es **fabricar el caso**: `vacio-inyectado`
 * mete un `<h1></h1>` en un documento de `L2`, y entonces las dos lecturas se
 * separan y el negativo significa algo:
 *
 * | corrida | discriminador | vacío | ausente |
 * |---|---|---|---|
 * | limpia | elemento | 0 | 12 |
 * | `colapsa` | texto | 0 | 12 ← **no discrimina: no hay caso** |
 * | `vacio-inyectado` | elemento | **1** | 11 |
 * | `colapsa-con-vacio` | texto | **0** | **12** ← el mismo documento, mal leído |
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const SAB = process.env.SABOTAJE ?? "";
const BASE = join(QA, "../..", "corpus/fase-3/listados");

const ficheros = (d, acc = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) ficheros(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
};
const F = ficheros(BASE);
if (!F.length) throw new Error(`la captura de F3-0 no está en ${BASE}: sin población no hay censo`);

const marcado = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

/** La familia se deriva de la RUTA — misma partición que `lh-barra` y el censo. */
const familiaDe = (r) =>
  /^\/etiqueta\//.test(r) ? "L1-etiqueta"
  : /^\/blog(\/|$)/.test(r) ? "L1-blog"
  : /^\/recursos\/articulos(\/|$)/.test(r) || /^\/recursos\/seminarios-web(\/|$)/.test(r) ? "L1-resources"
  : /^\/scientific-category\//.test(r) ? "L3-sci"
  : /^\/glosario(\/|$)/.test(r) ? "L2-glosario"
  : /^\/preguntas-frecuentes(\/|$)/.test(r) ? "L2-faqs"
  : /^\/casos-de-exito(\/|$)/.test(r) ? "L5-casos"
  : /^\/recursos(\/page)?(\/|$)/.test(r) ? "L4-hub"
  : "otra";

const ABRE = SAB === "patron-muerto" ? /<h1-no-existe\b/gi : /<h1\b/gi;
const PAR = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;

const ev = new Evaluadas({ nombre: "lh-h1", unidad: "documentos", minimo: F.length });

const porForma = { conTexto: [], vacio: [], ausente: [] };
const porFamilia = {};
let totalAbre = 0;
const multiples = [];

const COLAPSA = SAB === "colapsa" || SAB === "colapsa-con-vacio";
const INYECTA = SAB === "vacio-inyectado" || SAB === "colapsa-con-vacio";
let inyectados = 0;

for (const f of F) {
  const ruta = "/" + relative(BASE, f).split(sep).join("/").replace(/\/index\.html$/, "");
  let m = marcado(readFileSync(f, "utf8"));
  /* El CONTROL de §sondas 8a: la población no tiene ni un `<h1>` vacío, así que
   * sin fabricarlo el sabotaje `colapsa` no puede cambiar ningún resultado — y
   * un negativo que no cambia el resultado no ha probado nada. */
  if (INYECTA && /^\/glosario$/.test(ruta) && inyectados++ === 0) m = m.replace("<body", "<h1></h1><body");
  const nAbre = [...m.matchAll(ABRE)].length;
  totalAbre += nAbre;
  const textos = [...m.matchAll(PAR)].map((x) => x[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim());

  /* ⚠ EL DISCRIMINADOR ES EL ELEMENTO, NO EL TEXTO. Ésta es literalmente la
   * línea que `lh-censo` no tenía: con `SABOTAJE=colapsa` se lee el texto —como
   * hacía el censo— y las dos formas se funden en una. */
  const forma =
    COLAPSA
      ? (textos[0] ?? "") === "" ? "ausente" : "conTexto"
      : nAbre === 0 ? "ausente"
        : textos.some((t) => t === "") ? "vacio"
          : "conTexto";

  porForma[forma].push(ruta);
  if (nAbre > 1) multiples.push({ ruta, n: nAbre });
  const fam = familiaDe(ruta);
  const acc = (porFamilia[fam] ??= { n: 0, conTexto: 0, vacio: 0, ausente: 0 });
  acc.n++;
  acc[forma]++;
  ev.ok();
}

let rotos = 0;
if (totalAbre === 0) {
  console.error(`❌ patrón MUERTO: \`<h1\` no casa en NINGUNO de los ${F.length} documentos. Un cero de selector no es un cero de dato.`);
  rotos++;
}

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿el `h1: \"\"` de lh-censo es «vacío» o «ausente», y a qué se apoya en él? — las dos direcciones de la comprobación retroactiva",
    fuente: "corpus/fase-3/listados — captura congelada de F3-0, población COMPLETA (sin red, sin muestreo)",
    sabotaje: SAB || null,
    noMide: [
      "el original de HOY: el censo es de lo capturado en F3-0",
      "el CLON: estas rutas todavía no las emite (F3-2 no ha construido), así que la mitad «es el MISMO elemento en los dos lados» de la regla de `c-cabecera` no se puede contestar aquí",
      "la `y` del h1: esto es marcado, no geometría — el píxel lo pone `lh-spec`",
    ],
  },
  documentos: F.length,
  formas: { conTexto: porForma.conTexto.length, vacio: porForma.vacio.length, ausente: porForma.ausente.length },
  conH1Vacio: porForma.vacio,
  sinH1: porForma.ausente,
  conVariosH1: multiples,
  porFamilia,
};

console.log(`\n═══ LA FORMA DEL <h1> — ${F.length} documentos de la captura`);
console.log(`  con <h1> y texto : ${salida.formas.conTexto}`);
console.log(`  con <h1> VACÍO   : ${salida.formas.vacio}${porForma.vacio.length ? " → " + porForma.vacio.slice(0, 6).join(" · ") : ""}`);
console.log(`  SIN <h1>         : ${salida.formas.ausente}${porForma.ausente.length ? " → " + porForma.ausente.slice(0, 4).join(" · ") + (porForma.ausente.length > 4 ? " …" : "") : ""}`);
console.log(`  con VARIOS <h1>  : ${multiples.length}`);
console.log(`\n  familia`.padEnd(24) + `n`.padStart(5) + `  conTexto`.padStart(12) + `vacío`.padStart(10) + `ausente`.padStart(10));
for (const [k, v] of Object.entries(porFamilia).sort())
  console.log(`  ${k.padEnd(22)}${String(v.n).padStart(5)}${String(v.conTexto).padStart(12)}${String(v.vacio).padStart(10)}${String(v.ausente).padStart(10)}`);
console.log(`✓ evaluadas ${F.length}/${F.length} documentos · forma del <h1>`);

salida.veredicto = {
  a_colapsaLaEvidencia: porForma.ausente.length > 0,
  b_hayCasoQueEjercite_h1Vacio: porForma.vacio.length > 0,
  lectura:
    porForma.vacio.length === 0 && porForma.ausente.length > 0
      ? `«${porForma.ausente.length} documentos SIN <h1>» y «0 con <h1> vacío» ⇒ (a) el "" de lh-censo era AUSENCIA, y su valor no podía decirlo; (b) la lectura de lh-spec NO está sobre-generalizada — distingue por elemento, y además ningún documento de la población ejercita la rama del <h1> vacío: es un CAMINO SIN ESTRENAR, se declara con su alcance y no se da por probado`
      : porForma.vacio.length > 0
        ? `hay ${porForma.vacio.length} documento(s) con <h1> VACÍO de verdad ⇒ la lectura «sin h1 = ausente» SÍ estaría sobre-generalizada en esos casos`
        : "todos los documentos tienen <h1> con texto: la pregunta no se ejercita en esta población",
};

/* En la dirección que GRITA: un `<h1>` vacío de verdad significa que la lectura
 * «sin h1 ⇒ ausente» de `lh-spec` tiene un caso que no cubre, y eso no puede
 * vivir como un campo dentro de un JSON. */
if (porForma.vacio.length) {
  console.error(
    `\n⛔ HAY ${porForma.vacio.length} DOCUMENTO(S) CON <h1> VACÍO: la rama que \`lh-spec\` no ejercita existe.\n` +
      `   La lectura «sin h1 ⇒ ausente» hay que revisarla para: ${porForma.vacio.slice(0, 5).join(" · ")}`,
  );
  rotos++;
}

w("medidas/lh-h1.json", salida);
process.exit(rotos ? 2 : 0);
