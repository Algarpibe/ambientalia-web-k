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
 * 4 · negativo: `SABOTAJE=patron-muerto|colapsa|vacio-inyectado|`
 *     `colapsa-con-vacio|slug-igual-al-nombre`.
 *
 * ⚠ **Tres de los cinco señalan por el VALOR, no por el código de salida**, y
 * hay que saberlo para leerlos: `colapsa`, `colapsa-con-vacio` y
 * `slug-igual-al-nombre` prueban que un discriminador **discrimina**, y su
 * evidencia es que el veredicto CAMBIA. Los que cierran el código son
 * `patron-muerto` (selector) y `vacio-inyectado` (la rama sin estrenar).
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

/* ══════════════════════════════════════════════════════════════════════════
 * D4a · ¿DE DÓNDE SALE EL **TEXTO** DEL `h1`? (2026-08-11, tanda de decisión)
 *
 * `D4` lo publicaba en **una** unidad —«los 35 `h1` = nombre del término/
 * índice»— y ahí van fundidas **dos poblaciones que no admiten el mismo
 * enunciado**:
 *
 *   · **archivo de TÉRMINO** — el `h1` se puede contrastar con el término, así
 *     que la afirmación es FALSABLE;
 *   · **ÍNDICE** — «el `h1` es el nombre del índice» **no se puede falsar** sin
 *     conocer «el nombre del índice» por otra vía. Es un enunciado invacuo, y
 *     la barra de «término/índice» era lo que lo escondía.
 *
 * Se separan aquí, cada una con su denominador.
 * ═════════════════════════════════════════════════════════════════════════ */
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** El slug del término si la ruta es un archivo de término; `null` si es índice. */
const terminoDe = (r) => {
  const s = r.replace(/\/page\/\d+$/, "");
  for (const re of [/^\/etiqueta\/([^/]+)$/, /^\/scientific-category\/([^/]+)$/, /^\/recursos\/articulos\/([^/]+)$/, /^\/recursos\/seminarios-web\/([^/]+)$/]) {
    const m = re.exec(s);
    if (m) return m[1];
  }
  return null;
};

const ev = new Evaluadas({ nombre: "lh-h1", unidad: "documentos", minimo: F.length });

const porForma = { conTexto: [], vacio: [], ausente: [] };
const porFamilia = {};
let totalAbre = 0;
const multiples = [];
const deTermino = [];
const deIndice = [];

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

  /* ── D4a: sólo tiene sentido preguntarlo donde hay texto ───────────────── */
  if (forma === "conTexto") {
    const texto = textos[0].replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    const t = terminoDe(ruta);
    /* `slug-igual-al-nombre` borra los 4 casos que separan «el h1 sale del
     * SLUG» de «sale del NOMBRE»: el veredicto tiene que pasar a
     * INDISTINGUIBLES. Es el control de que la conclusión la sostienen esos 4 y
     * no la redacción (§sondas 8a). */
    if (t) deTermino.push({ ruta, fam, slug: t, texto, casaConElSlug: SAB === "slug-igual-al-nombre" ? true : norm(texto) === norm(t) });
    else deIndice.push({ ruta, fam, base: ruta.replace(/\/page\/\d+$/, ""), texto });
  }
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
  D4a: (() => {
    const noCasan = deTermino.filter((x) => !x.casaConElSlug);
    /* Los ÍNDICES, agrupados por familia: si dentro de una familia hay dos
     * índices con `h1` distinto, ese texto es DATO de la página. */
    const indicesPorFamilia = {};
    for (const x of deIndice) ((indicesPorFamilia[x.fam] ??= {})[x.base] ??= x.texto);
    const conVarianzaIntra = Object.entries(indicesPorFamilia)
      .map(([f, m]) => ({ familia: f, indices: Object.keys(m).length, textosDistintos: new Set(Object.values(m)).size, valores: m }))
      .filter((x) => x.textosDistintos > 1);
    return {
      enunciadoOriginal: "D4: «los 35 h1 = nombre del término/índice» — UNA unidad para DOS poblaciones",
      archivoDeTermino: {
        documentos: deTermino.length,
        elH1CasaConElSlug: deTermino.length - noCasan.length,
        noCasanConElSlug: noCasan.map((x) => ({ ruta: x.ruta, slug: x.slug, h1: x.texto })),
        /* ⚠ Los que NO casan son el DISCRIMINADOR, no las excepciones: sin ellos,
         * «el h1 sale del SLUG» y «sale del NOMBRE del término» serían
         * indistinguibles (§DOS VARIABLES CONFUNDIDAS). Con ellos, el slug
         * queda descartado como fuente. */
        lectura: noCasan.length
          ? `en ${noCasan.length} documentos el h1 NO coincide con el slug pero sí es el nombre del término (sufijo -es de desambiguación, o slug abreviado) ⇒ el h1 sale del NOMBRE del término, NO de su slug — y esos ${noCasan.length} son lo único que separa las dos hipótesis`
          : "slug y nombre coinciden en toda la población: «sale del slug» y «sale del nombre» son INDISTINGUIBLES aquí",
      },
      indice: {
        documentos: deIndice.length,
        indicesDistintos: [...new Set(deIndice.map((x) => x.base))].length,
        valores: Object.fromEntries([...new Set(deIndice.map((x) => x.base))].map((b) => [b, deIndice.find((x) => x.base === b).texto])),
        familiasConVarianzaIntra: conVarianzaIntra,
        lectura:
          conVarianzaIntra.length
            ? `el h1 de un índice NO es derivable de la ruta y VARÍA dentro de ${conVarianzaIntra.length} familia(s) ⇒ es DATO DE LA PÁGINA, no derivación del término. La mitad de D4 que decía «no propiedad de la página» es FALSA para esta población`
            : "no hay dos índices de la misma familia con h1 distinto: no se puede discriminar en esta población",
      },
    };
  })(),
};

console.log(`\n═══ LA FORMA DEL <h1> — ${F.length} documentos de la captura`);
console.log(`  con <h1> y texto : ${salida.formas.conTexto}`);
console.log(`  con <h1> VACÍO   : ${salida.formas.vacio}${porForma.vacio.length ? " → " + porForma.vacio.slice(0, 6).join(" · ") : ""}`);
console.log(`  SIN <h1>         : ${salida.formas.ausente}${porForma.ausente.length ? " → " + porForma.ausente.slice(0, 4).join(" · ") + (porForma.ausente.length > 4 ? " …" : "") : ""}`);
console.log(`  con VARIOS <h1>  : ${multiples.length}`);
console.log(`\n  familia`.padEnd(24) + `n`.padStart(5) + `  conTexto`.padStart(12) + `vacío`.padStart(10) + `ausente`.padStart(10));
for (const [k, v] of Object.entries(porFamilia).sort())
  console.log(`  ${k.padEnd(22)}${String(v.n).padStart(5)}${String(v.conTexto).padStart(12)}${String(v.vacio).padStart(10)}${String(v.ausente).padStart(10)}`);
const D = salida.D4a;
console.log(`\n═══ D4a — de dónde sale el TEXTO del <h1>, con sus DOS denominadores`);
console.log(`  archivo de TÉRMINO : ${D.archivoDeTermino.documentos} documentos · el h1 casa con el slug en ${D.archivoDeTermino.elH1CasaConElSlug}`);
for (const x of D.archivoDeTermino.noCasanConElSlug) console.log(`      slug "${x.slug}"  →  h1 "${x.h1}"   (${x.ruta})`);
console.log(`  ÍNDICE             : ${D.indice.documentos} documentos · ${D.indice.indicesDistintos} índices distintos`);
for (const [b, t] of Object.entries(D.indice.valores)) console.log(`      ${b.padEnd(36)} "${t}"`);
console.log(`  familias con DOS índices de h1 distinto: ${D.indice.familiasConVarianzaIntra.length}${D.indice.familiasConVarianzaIntra.length ? " → " + D.indice.familiasConVarianzaIntra.map((x) => `${x.familia} (${x.textosDistintos})`).join(" · ") : ""}`);
console.log(`✓ evaluadas ${F.length}/${F.length} documentos · forma del <h1>`);
console.log(`✓ evaluadas ${D.archivoDeTermino.documentos + D.indice.documentos}/${porForma.conTexto.length} documentos con h1 · procedencia del texto (D4a)`);

salida.veredicto = {
  D4a: `${D.archivoDeTermino.documentos} documentos de ARCHIVO DE TÉRMINO: el h1 es el NOMBRE del término (no su slug — lo separan ${D.archivoDeTermino.noCasanConElSlug.length} casos). ` +
    `${D.indice.documentos} documentos de ÍNDICE: el h1 NO es derivable y varía dentro de ${D.indice.familiasConVarianzaIntra.length} familia(s) ⇒ es DATO DE LA PÁGINA. ` +
    `Son DOS enunciados con DOS denominadores, no uno con 137.`,
  D4b: `${porForma.ausente.length} documentos SIN <h1> y ${porForma.vacio.length} con <h1> vacío, sobre ${F.length}. ` +
    `Reparto por familia: ${Object.entries(porFamilia).filter(([, v]) => v.ausente).map(([k, v]) => `${k} ${v.ausente}/${v.n}`).join(" · ") || "ninguna"}. ` +
    `Ninguna familia MIXTA ⇒ por el discriminador de régimen plantillado (varianza entre instancias) la PRESENCIA del h1 es PLANTILLA DE LA FAMILIA.`,
  familiasMixtas: Object.entries(porFamilia).filter(([, v]) => v.ausente > 0 && v.ausente < v.n).map(([k]) => k),
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
/* ⛔ DISPARADOR 1 DEL ESCALÓN, cableado: una familia MIXTA —unos documentos con
 * h1 y otros sin él— significaría varianza INTRA-familia, y entonces la
 * presencia del h1 sería CAMPO y no plantilla. Se comprueba, no se supone. */
if (salida.veredicto.familiasMixtas.length) {
  console.error(
    `\n⛔ ESCALÓN · VARIANZA INTRA-FAMILIA en la PRESENCIA del <h1>: ${salida.veredicto.familiasMixtas.join(" · ")}.\n` +
      `   En régimen plantillado eso hace que la presencia sea CAMPO, no plantilla — y eso cambia el modelo.`,
  );
  rotos++;
}
if (porForma.vacio.length) {
  console.error(
    `\n⛔ HAY ${porForma.vacio.length} DOCUMENTO(S) CON <h1> VACÍO: la rama que \`lh-spec\` no ejercita existe.\n` +
      `   La lectura «sin h1 ⇒ ausente» hay que revisarla para: ${porForma.vacio.slice(0, 5).join(" · ")}`,
  );
  rotos++;
}

w("medidas/lh-h1.json", salida);
process.exit(rotos ? 2 : 0);
