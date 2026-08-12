/**
 * ¿SIRVE «LA PRIMERA TARJETA» COMO ANCLA DE LECTURA? — la pregunta que `D4b`
 * deja planteada y sin la cual no se puede medir el cuerpo de `L2`.
 * Uso: node scripts/qa/lh-ancla.mjs        (npm run qa:lh-ancla)
 *
 * ── De dónde sale la pregunta ─────────────────────────────────────────────
 * `D4b` (2026-08-11) cierra que **la PRESENCIA del `h1` es plantilla de la
 * familia**: `L2` no emite ninguno, en sus 12 documentos. Con eso, *«`L2` no
 * tiene `h1`»* deja de ser una anomalía y pasa a ser **una propiedad de su
 * plantilla** — pero el protocolo de este proyecto lee el cuerpo **restando la
 * `y` del `h1`**, así que `L2` necesita otra base o **no se puede medir**.
 *
 * `lh-spec` ya propone una: `anclaAlternativa = «primera tarjeta»`. Eso es un
 * **candidato**, no un ancla. Para serlo (§Notas de método + lo que
 * `c-cabecera` aprendió a exigir) hacen falta **dos** cosas:
 *
 *   1. **existir en las 9 formas** — si falta en una, esa forma se queda sin
 *      base y el problema sólo se ha movido de sitio;
 *   2. **ser EL MISMO elemento en los dos lados** — un selector que casa en
 *      original y clon pero apunta a cosas distintas no lo caza ningún censo.
 *
 * ⚠⚠ **LA SEGUNDA NO SE PUEDE CONTESTAR HOY, Y SE DECLARA EN VEZ DE OMITIRSE.**
 * El clon **no emite estas rutas** (F3-2 no ha construido), así que no hay
 * segundo lado contra el que comparar. **Media verificación**, con la otra
 * mitad asignada: la hace **la tanda que construya**, y es `P-LH-C8` abajo.
 * Escribirlo aquí es lo que impide que se lea como cerrada.
 *
 * ── Por qué sobre la CAPTURA ──────────────────────────────────────────────
 * Porque la mitad que SÍ se puede contestar —¿existe, y es inequívoco?— es de
 * **marcado servido**, y la población entera está congelada: 149 documentos. El
 * píxel (la `y` del ancla) lo pone `lh-spec` contra el original, y no hace falta
 * volver a pegarle para saber si el ancla existe.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas`, mínimo derivado del recuento de ficheros;
 * 2 · **si el ancla falta en alguna familia, el código de salida se cierra**:
 *     sin ancla no se puede medir esa forma, y eso bloquea su spec — no puede
 *     quedar como un campo dentro de un JSON;
 * 3 · congela en `medidas/lh-ancla.json`;
 * 4 · negativo: `SABOTAJE=selector-muerto|sin-filtro|familia-huerfana`.
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

/* ══════════════════════════════════════════════════════════════════════════
 * LOS DOS SELECTORES, y la diferencia entre ellos ES el hallazgo
 *
 * `lh-spec` tiene el filtro de `type-page` **en un sitio y no en el otro**:
 *
 *   · :152 `contenedorDeTarjetas()` — `article[class*='type-']` **filtrando**
 *     `type-page` y `page`. Correcto, y su comentario (:146) explica por qué:
 *     *«el wrapper `article.type-page` de la propia página»*;
 *   · :310 `anclaAlternativa` — `article[class*='type-'], article.et_pb_post`
 *     **sin filtrar**.
 *
 * O sea que el ancla propuesta puede apuntar **al wrapper de la página** en vez
 * de a una tarjeta. Es §sondas 3 —*documentado no es conectado*— en su forma
 * más barata: el arreglo existe, está explicado, y **no está en la llamada que
 * importa**. Se miden los dos para dejar la diferencia congelada.
 * ═════════════════════════════════════════════════════════════════════════ */
const ES_WRAPPER = (c) => /\btype-page\b/.test(c) || /(^|\s)page(\s|$)/.test(c);
const CASA_LH_SPEC = (c) =>
  SAB === "selector-muerto" ? /\bno-existe-este-tipo\b/.test(c) : /\btype-/.test(c) || /\bet_pb_post\b/.test(c);
const CASA_FILTRADO = (c) => (SAB === "sin-filtro" ? CASA_LH_SPEC(c) : CASA_LH_SPEC(c) && !ES_WRAPPER(c));

/** Marca identificable de un `<article>`: su `post-N` y su `type-*`. */
const marca = (c) => {
  const id = (/\bpost-(\d+)\b/.exec(c) ?? [])[0] ?? "(sin post-N)";
  const tipo = (/\btype-([a-z0-9-]+)\b/.exec(c) ?? [])[0] ?? "(sin type-)";
  return `${id} ${tipo}`;
};

const ev = new Evaluadas({ nombre: "lh-ancla", unidad: "documentos", minimo: SAB === "familia-huerfana" ? F.length + 1 : F.length });

const porFamilia = {};
const discrepan = [];
const sinAncla = [];
const vacios = [];
const sinBase = [];
const baseDe = { h1: [], primeraTarjeta: [] };

for (const f of F) {
  const ruta = "/" + relative(BASE, f).split(sep).join("/").replace(/\/index\.html$/, "");
  const fam = familiaDe(ruta);
  const m = marcado(readFileSync(f, "utf8"));
  const arts = [...m.matchAll(/<article\b[^>]*class="([^"]*)"/g)].map((x) => x[1]);

  const primeroLhSpec = arts.find(CASA_LH_SPEC) ?? null;
  const primeroFiltrado = arts.find(CASA_FILTRADO) ?? null;

  /* ⚠ EL DENOMINADOR, y la primera versión de esta sonda lo tuvo MAL.
   * Un documento **vacío** —de las 55 que `D2.5` manda replicar con 200 y sin
   * listar nada— no tiene primera tarjeta **porque no tiene cuerpo que medir**,
   * y su contrato (`P-LH-C7`) es otro: 200 · canonical · `<title>`. Exigirle
   * ancla es §la causa común aplicada al propio instrumento: medir sobre una
   * población que no ejerce la propiedad. El denominador correcto son los
   * documentos **con contenido**. */
  /* ⚠⚠ Y LA CONDICIÓN NO ES «TIENE ANCLA»: ES «TIENE BASE».
   * El ancla alternativa sólo hace falta **donde no hay `h1`**. Exigir «primera
   * tarjeta» a una página que tiene `h1` es pedirle una base que no necesita, y
   * eso produjo un ⛔ falso en la 2.ª versión de esta sonda. Lo que hay que
   * comprobar es la DISYUNCIÓN: ningún documento con contenido puede quedarse
   * sin ninguna de las dos. */
  const hayH1 = /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(m);
  const acc = (porFamilia[fam] ??= { n: 0, conContenido: 0, conAncla: 0, conH1: 0, vacios: 0, sinBase: [], sinAncla: [], marcas: {}, discrepan: 0 });
  acc.n++;
  if (!arts.length) {
    acc.vacios++;
    vacios.push(ruta);
  } else {
    acc.conContenido++;
    if (hayH1) acc.conH1++;
    if (primeroFiltrado) {
      acc.conAncla++;
      acc.marcas[marca(primeroFiltrado)] = (acc.marcas[marca(primeroFiltrado)] ?? 0) + 1;
    } else {
      acc.sinAncla.push(ruta);
      sinAncla.push(ruta);
    }
    if (!hayH1 && !primeroFiltrado) {
      acc.sinBase.push(ruta);
      sinBase.push(ruta);
    }
    baseDe[hayH1 ? "h1" : "primeraTarjeta"].push(ruta);
  }
  /* La discrepancia: el selector de `lh-spec` y el filtrado apuntan a
   * elementos DISTINTOS. Ahí el ancla propuesta no es la primera tarjeta. */
  if (primeroLhSpec !== primeroFiltrado && primeroFiltrado) {
    acc.discrepan++;
    discrepan.push({ ruta, familia: fam, lhSpecApuntaA: marca(primeroLhSpec), deberiaApuntarA: marca(primeroFiltrado) });
  }
  ev.ok();
}

const familias = Object.keys(porFamilia).length;
const familiasConAncla = Object.values(porFamilia).filter((v) => v.conContenido > 0 && v.conAncla === v.conContenido).length;
const familiasConContenido = Object.values(porFamilia).filter((v) => v.conContenido > 0).length;

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿«la primera tarjeta» sirve de ancla de lectura en las 9 formas? — la base que L2 necesita porque D4b dice que su plantilla no emite h1",
    fuente: "corpus/fase-3/listados — captura congelada de F3-0, población COMPLETA (sin red)",
    sabotaje: SAB || null,
    /* ⚠ La mitad que esta sonda NO puede contestar, escrita aquí para que no se
     * lea como cerrada. §regla 10: una afirmación de completitud se declara
     * respecto a un USO. */
    mediaVerificacion: {
      loQueSeContestaAqui: "que el ancla EXISTE en las 9 formas y que el selector es inequívoco (no apunta al wrapper de la página)",
      loQueNO: "que sea EL MISMO ELEMENTO en los dos lados — el clon no emite estas rutas todavía, así que no hay segundo lado",
      dueño: "la tanda que CONSTRUYA F3-2 · pre-registro P-LH-C8 en listados-hubs/DECISIONES.md",
      porQueImporta: "c-cabecera existe porque un selector que casa en los dos lados puede apuntar a cosas distintas, y eso no lo caza ningún censo",
    },
    noMide: [
      "la `y` del ancla: eso es geometría y la pone lh-spec contra el original",
      "si el ancla es ESTABLE entre cargas (el orden de las tarjetas): eso lo midió qa:comportamiento — 1 solo orden en 10 cargas, cota < 30 %",
    ],
  },
  documentos: F.length,
  familias,
  familiasConContenido,
  familiasConAnclaEnTodosSusDocumentosConContenido: familiasConAncla,
  documentosVacios: {
    n: vacios.length,
    porQueNoCuentan: "no tienen cuerpo que medir: son las que D2.5 manda replicar con 200 sin listar nada, y su contrato es P-LH-C7 (200 · canonical · <title>), no una base de lectura",
    rutas: vacios,
  },
  porFamilia,
  baseDeLectura: { porH1: baseDe.h1.length, porPrimeraTarjeta: baseDe.primeraTarjeta.length, sinNinguna: sinBase.length, rutasSinNinguna: sinBase, rutasQueUsanLaTarjeta: baseDe.primeraTarjeta },
  documentosConContenidoSinPrimeraTarjeta: { n: sinAncla.length, tienenH1: true, porQueNoImporta: "usan la base estándar (el h1); son páginas de builder que no listan posts", rutas: sinAncla },
  discrepanciaEntreSelectores: {
    queEs: "lh-spec.mjs:310 (`anclaAlternativa`) NO filtra el wrapper `type-page`, y lh-spec.mjs:152 (`contenedorDeTarjetas`) SÍ",
    documentos: discrepan.length,
    casos: discrepan,
  },
};

/* ── Salida, y el ORDEN es deliberado: primero las dos que rompieron el
 * protocolo. Calibrar contra las siete que sí tienen `h1` sería fabricar una
 * familia de calibración. */
const ORDEN = ["L2-glosario", "L2-faqs"];
const clave = (k) => (ORDEN.indexOf(k) >= 0 ? ORDEN.indexOf(k) : 9);
console.log(`\n═══ ¿EXISTE EL ANCLA «primera tarjeta»? — ${F.length} documentos · ${familias} formas`);
console.log(`  denominador: los documentos CON CONTENIDO. Los ${vacios.length} vacíos no tienen cuerpo que medir (D2.5 / P-LH-C7).`);
console.log(`\n  familia`.padEnd(24) + `n`.padStart(4) + `c/conten.`.padStart(11) + `con ancla`.padStart(11) + `  vacíos`.padStart(9) + `   tipo de la 1.ª tarjeta`);
for (const [k, v] of Object.entries(porFamilia).sort((a, b) => clave(a[0]) - clave(b[0]) || a[0].localeCompare(b[0]))) {
  const tipos = [...new Set(Object.keys(v.marcas).map((x) => x.split(" ")[1]))];
  const flag = k.startsWith("L2") ? " ←" : "";
  console.log(
    `  ${k.padEnd(22)}${String(v.n).padStart(4)}${String(v.conContenido).padStart(11)}${String(v.conAncla).padStart(11)}${String(v.vacios).padStart(9)}   ${tipos.join(" · ") || "—"}${flag}`,
  );
}

let rotos = 0;
if (sinBase.length) {
  console.error(
    `\n⛔ ${sinBase.length} documento(s) con contenido y SIN NINGUNA BASE (ni <h1> ni primera tarjeta):\n` +
      `   ${sinBase.slice(0, 6).join(" · ")}\n` +
      `   Sin base no se puede medir el cuerpo de esa forma, y eso BLOQUEA su spec.`,
  );
  rotos++;
}
if (sinAncla.length)
  console.log(
    `\n  ℹ ${sinAncla.length} documento(s) con contenido y sin «primera tarjeta» — y NO es un problema:\n` +
      `    los ${sinAncla.length} tienen <h1>, así que usan la base ESTÁNDAR. Son páginas de builder que no\n` +
      `    listan posts (D1: «los hubs son páginas compuestas por instancia»): ${[...new Set(sinAncla.map((r) => r.replace(/\/page\/\d+$/, "")))].join(" · ")}`,
  );
/* ── El filtro del wrapper: por qué hace falta, medido ─────────────────────
 * Esto NO cierra el código: `lh-spec:310` ya está arreglado (2026-08-11) y usa
 * el mismo `contenedorDeTarjetas()` que filtra. Lo que queda aquí es **la
 * evidencia de que el filtro no es decorativo** — sin él, el ancla apunta al
 * wrapper de la página en estos documentos. Es lo que el negativo `sin-filtro`
 * reproduce a demanda. */
if (discrepan.length) {
  console.log(`\n  ℹ el filtro del wrapper \`type-page\` cambia el ancla en ${discrepan.length} documento(s) — sin él apuntaría a la PÁGINA:`);
  for (const d of discrepan.slice(0, 4)) console.log(`     ${d.ruta} (${d.familia}): sin filtro «${d.lhSpecApuntaA}» · con filtro «${d.deberiaApuntarA}»`);
}
/* §sondas 4: un selector que no casa en NINGÚN documento no es un cero de dato. */
const totalConAncla = Object.values(porFamilia).reduce((a, v) => a + v.conAncla, 0);
if (totalConAncla === 0) {
  console.error(`\n❌ selector MUERTO: «primera tarjeta» no casa en NINGUNO de los ${F.length} documentos.`);
  rotos++;
}
console.log(`\n✓ evaluadas ${F.length}/${F.length} documentos · existencia del ancla`);

salida.veredicto = {
  todoDocumentoConContenidoTieneBase: sinBase.length === 0,
  existeElAnclaDondeHaceFalta: baseDe.primeraTarjeta.length > 0 && sinBase.length === 0,
  selectorInequivoco: discrepan.length === 0,
  tiposDeTarjetaQueElAnclaTieneQueCubrir: [...new Set(Object.values(porFamilia).flatMap((v) => Object.keys(v.marcas).map((x) => x.split(" ")[1])))].sort(),
  lectura:
    sinBase.length === 0
      ? `TODO documento con contenido tiene base: ${baseDe.h1.length} por <h1> y ${baseDe.primeraTarjeta.length} por «primera tarjeta» (los 12 de L2, que es donde hace falta). ` +
        `Los ${sinAncla.length} sin primera tarjeta tienen <h1>, y los ${vacios.length} vacíos no tienen cuerpo que medir. ` +
        `MEDIA VERIFICACIÓN: falta «el mismo elemento en los dos lados» — el clon no emite estas rutas (P-LH-C8).`
      : `${sinBase.length} documento(s) con contenido SIN NINGUNA BASE (ni <h1> ni primera tarjeta): su spec queda BLOQUEADA — ${sinBase.slice(0, 5).join(" · ")}`,
};

w("medidas/lh-ancla.json", salida);
process.exit(rotos ? 2 : 0);
