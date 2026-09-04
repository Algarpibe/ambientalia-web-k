/**
 * 146.ª ESCALÓN 2 · P2 — EL ALCANCE REAL DE `apps/web/public`, Y EL DESGLOSE
 * DE LOS 661 MiB POR ORIGEN.
 *
 * ⚠ LA DIRECCIÓN IMPORTA Y SON DOS PREGUNTAS, NO UNA (§regla 61 al revés):
 *
 *   · §regla 61 pregunta: de los `src` CITADOS, ¿cuántos tienen fichero
 *     detrás? → detecta **assets rotos**;
 *   · P2 pregunta: de los FICHEROS que hay, ¿cuántos cita alguien? → detecta
 *     **arrastre**.
 *
 * Son la diferencia simétrica del mismo emparejamiento y se publican **los dos
 * lados**, nunca su resta (§*un cardinal es un contenedor*).
 *
 * TRES CANALES, cada uno con su cardinal (§regla 14): un asset citado sólo por
 * CSS o sólo por JS no aparece en el HTML, y un cero en un canal no es un cero
 * del conjunto.
 *
 * Se lee del build YA EN DISCO — no construye nada, que es lo que el encargo
 * manda para una tanda de expediente— y declara su `BUILD_ID` y su `mtime`.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/alcance-146.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "alcance-146.json");

const PUB = path.join(RAIZ, "apps/web/public");
const NEXT = path.join(RAIZ, "apps/web/.next");
const MED = path.join(RAIZ, "media");
const MB = (b) => Number((b / 1048576).toFixed(2));

const SABOTAJE = process.env.SABOTAJE_ALCANCE || "";
if (SABOTAJE) console.error(`⚠⚠ SABOTAJE_ALCANCE=${SABOTAJE}: corrida ROTA A PROPÓSITO`);

function recorre(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...recorre(p, base));
    else if (e.isFile())
      out.push({ abs: p, rel: path.relative(base, p).replace(/\\/g, "/"), base: e.name, bytes: fs.statSync(p).size });
  }
  return out;
}

/* ── PRECONDICIONES, ANTES de gastar nada (§regla 37) ─────────────────────*/
if (!fs.existsSync(path.join(NEXT, "BUILD_ID"))) {
  console.error("✗ no hay `apps/web/.next/BUILD_ID`: sin build en disco no hay salida que leer.");
  process.exit(1);
}
const BUILD_ID = fs.readFileSync(path.join(NEXT, "BUILD_ID"), "utf8").trim();
const MTIME_BUILD = fs.statSync(path.join(NEXT, "BUILD_ID")).mtime.toISOString();

console.log("═══ 146.ª ESCALÓN 2 · P2 — ALCANCE de public/ ═══\n");
console.log(`  build leído: BUILD_ID=${BUILD_ID}  mtime=${MTIME_BUILD}`);

const pub = recorre(PUB);
console.log(`  public/: ${pub.length} ficheros · ${MB(pub.reduce((s, f) => s + f.bytes, 0))} MiB`);

/* ── LOS TRES CANALES, recorridos por separado ────────────────────────────*/
const canales = {
  html: recorre(path.join(NEXT, "server", "app")).filter((f) => f.abs.endsWith(".html")),
  rsc: recorre(path.join(NEXT, "server", "app")).filter((f) => /\.(rsc|body|json)$/.test(f.abs)),
  css: recorre(path.join(NEXT, "static")).filter((f) => f.abs.endsWith(".css")),
  js: recorre(path.join(NEXT, "static")).filter((f) => f.abs.endsWith(".js")),
};
/* el fuente también cuenta como canal: un asset puede citarse desde
 * `src/lib/*.ts` y llegar al HTML sólo en una ruta dinámica que no
 * prerenderiza. Sin este canal, el arrastre saldría inflado. */
canales.fuente = recorre(path.join(RAIZ, "apps/web/src")).filter((f) => /\.(ts|tsx|css|mjs)$/.test(f.abs));

for (const [k, v] of Object.entries(canales)) console.log(`  canal ${k}: ${v.length} ficheros`);

/* ── el emparejamiento ────────────────────────────────────────────────────
 * Se busca el `rel` del fichero de public/ dentro del texto de cada canal.
 * Un asset servido desde public/ se cita por su ruta desde la raíz del sitio,
 * o sea exactamente su `rel`. Se busca también sólo el BASENAME, y los dos
 * cardinales se publican por separado: casar por basename SOBRE-CASA (dos
 * ficheros con el mismo nombre en años distintos) y casar por ruta puede
 * SUB-casar si el render la compone por trozos. Los dos números acotan. */
const porRel = new Map(pub.map((f) => [f.rel, f]));
const citadoPorRel = new Map(); // rel -> Set(canal)
const citadoPorBase = new Map();

/* ⚠⚠ EL DELIMITADOR — arreglado tras la primera corrida, que está conservada
 * en `alcance-146-ANTES-delimitador-sobrecasa.{json,log}`.
 *
 * La clase de caracteres original —`[^"'()\s\\?#]`— NO excluía el backtick ni
 * el `\` de escape del payload RSC, así que se llevaba el delimitador PEGADO
 * a la ruta: `images/logos/kunak-logo.svg\`` y
 * `images/uploads/2025/07/x.jpg\`. El `rel` resultante no casa con ningún
 * fichero, así que el asset salía como ARRASTRE y, del otro lado, como
 * «citado sin fichero». Es §sondas 4 en su cara de SOBRE-CASADO cometida
 * sobre el delimitador, y la misma clase que §regla 8b tercera mitad —*un
 * marcador de texto no delimita una región de código*—.
 *
 * Coste medido del defecto: **1 730 falsos «citados sin fichero»**.
 *
 * El conjunto se escribe por lo que SÍ puede llevar una ruta, no por lo que
 * se recuerde que la delimita. */
const FIN_DE_RUTA = "[^\"'()\\s\\\\`<>,;&?#]";
const RE_RUTA = new RegExp(`[/\\\\]{1,2}((?:images|fonts|videos|seo)${FIN_DE_RUTA}*)`, "g");

/* ⚠⚠ Y EL ANCLAJE, QUE ES EL OTRO SOBRE-CASADO Y NO SE VE HASTA MIRAR LAS
 * INSTANCIAS: `/images/…` aparece también DENTRO DE URLs ABSOLUTAS AJENAS
 * —`https://www.who.int/images/default-source/…`, `https://…nasa.gov/images/…`—
 * y el regex no distingue el asset propio del asset de otro dominio. Eso no
 * afecta al ARRASTRE —el emparejamiento del alcance casa contra `porRel`, así
 * que una ruta ajena simplemente no está y no cuenta— pero SÍ inflaba el lado
 * de §regla 61, que es donde una ruta que no existe es justo el hallazgo.
 *
 * Se separan en su propio cubo con su cardinal, porque son un DATO (el clon
 * cita assets de terceros) y no ruido: descontarlos sin nombrarlos sería
 * §regla 14. */
const RE_URL_AJENA = new RegExp(`https?://[^"'()\\s\\\\\`<>]*?/((?:images|fonts|videos|seo)${FIN_DE_RUTA}*)`, "g");

/* ⚠ Y EL SEGUNDO DEFECTO ES DE POLARIDAD, NO DE CARACTERES: un barrido que
 * busca una RUTA DE ASSET casa, por construcción, con cada sitio donde
 * alguien DOCUMENTÓ esa ruta — porque documentarla es escribirla (§regla 9,
 * el caso garantizado del 2026-09-03). `KunakLogo.tsx` cita
 * `public/images/logos/kunak-logo.svg` **en un comentario** que explica de
 * dónde se extrajeron los paths, y el componente INLINEA el SVG: no lo pide
 * nunca. Contarlo como alcanzable convierte arrastre en uso.
 *
 * Se despojan comentarios del canal `fuente` ANTES de buscar, y el cardinal
 * de lo despojado se PUBLICA como control: si sale 0, el despojo no está
 * ocurriendo. */
function despojaComentarios(texto) {
  let fuera = texto.replace(/\/\*[\s\S]*?\*\//g, " ");
  fuera = fuera.replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  return fuera;
}

/* índice inverso de basenames para no hacer 2755 × N búsquedas */
const basenames = new Map();
for (const f of pub) {
  if (!basenames.has(f.base)) basenames.set(f.base, []);
  basenames.get(f.base).push(f.rel);
}

/* SABOTAJE `un-solo-canal`: mira sólo el HTML. Anula el arreglo ENTERO de
 * «tres canales» —no media hipótesis— y tiene que hacer SUBIR el arrastre. */
const canalesAMirar = SABOTAJE === "un-solo-canal" ? { html: canales.html } : canales;

/* control del despojo, publicado (§regla 9): si el cardinal sale 0, el
 * despojo no está ocurriendo y el canal `fuente` está contando comentarios */
let charsDespojados = 0;
let ficherosDespojados = 0;

for (const [nombreCanal, ficheros] of Object.entries(canalesAMirar)) {
  for (const f of ficheros) {
    let texto;
    try {
      texto = fs.readFileSync(f.abs, "utf8");
    } catch {
      continue;
    }
    /* sólo el FUENTE se despoja: en el HTML/CSS/JS emitidos un comentario ya
     * no es documentación de un humano, y despojarlos ahí se llevaría por
     * delante cosas que sí se sirven */
    if (nombreCanal === "fuente") {
      const antes = texto.length;
      texto = despojaComentarios(texto);
      if (texto.length < antes) {
        charsDespojados += antes - texto.length;
        ficherosDespojados++;
      }
    }
    /* por RUTA: se buscan las ocurrencias de "/…" que empiecen por un
     * directorio de primer nivel de public/ y se resuelven contra el índice */
    RE_RUTA.lastIndex = 0;
    for (const m of texto.matchAll(RE_RUTA)) {
      const rel = m[1].replace(/\\\\/g, "/").replace(/\\/g, "/");
      if (porRel.has(rel)) {
        if (!citadoPorRel.has(rel)) citadoPorRel.set(rel, new Set());
        citadoPorRel.get(rel).add(nombreCanal);
      }
    }
    /* por BASENAME: acota por arriba */
    for (const [b, rels] of basenames) {
      if (texto.includes(b)) {
        for (const rel of rels) {
          if (!citadoPorBase.has(rel)) citadoPorBase.set(rel, new Set());
          citadoPorBase.get(rel).add(nombreCanal);
        }
      }
    }
  }
}

/* ── LOS DOS LADOS de la diferencia simétrica ─────────────────────────────*/
const alcanzables = pub.filter((f) => citadoPorRel.has(f.rel));
const arrastre = pub.filter((f) => !citadoPorRel.has(f.rel));
const alcanzablesPorBase = pub.filter((f) => citadoPorBase.has(f.rel));
const arrastrePorBase = pub.filter((f) => !citadoPorBase.has(f.rel));

/* el lado de §regla 61: rutas CITADAS que no tienen fichero.
 * Se reparte en DOS cubos y se publican los dos: lo que el clon pide de su
 * propio origen y no está (defecto) y lo que pide de OTRO dominio (dato). */
const citadasSinFichero = new Set();
const citadasDeOtroDominio = new Set();
for (const [, ficheros] of Object.entries(canalesAMirar)) {
  for (const f of ficheros) {
    let texto;
    try {
      texto = fs.readFileSync(f.abs, "utf8");
    } catch {
      continue;
    }
    RE_URL_AJENA.lastIndex = 0;
    for (const m of texto.matchAll(RE_URL_AJENA)) citadasDeOtroDominio.add(m[1]);
    RE_RUTA.lastIndex = 0;
    for (const m of texto.matchAll(RE_RUTA)) {
      const rel = m[1].replace(/\\\\/g, "/").replace(/\\/g, "/");
      if (!porRel.has(rel) && !citadasDeOtroDominio.has(rel)) citadasSinFichero.add(rel);
    }
  }
}

/* ── AUDITORÍA DEL CERO DE `/api/media/` (§sondas 4) ──────────────────────
 * `solape-146` publicó `/api/media/ ×0`. Un cero se audita con un TESTIGO
 * CONOCIDO DE ANTEMANO, no releyendo el patrón: se cogen ficheros que están
 * SÓLO en media/ y se busca su NOMBRE —no un prefijo de URL— en el HTML. Si
 * ninguno aparece, el HTML no consume media/ por NINGÚN canal, y el cero es
 * del objeto. */
const med = recorre(MED);
const relsPub = new Set(pub.map((f) => f.base));
const soloMediaBases = med.filter((f) => !relsPub.has(f.base)).map((f) => f.base);
const textoHtml = canales.html.map((f) => fs.readFileSync(f.abs, "utf8")).join("\n");
const soloMediaCitadosCrudo = soloMediaBases.filter((b) => textoHtml.includes(b));

/* ⚠ UN BASENAME CORTO Y GENÉRICO CASA POR AZAR, Y CON n=1 ESO NO ES CONSUMO
 * (§*un discriminador hallado en una sola instancia tampoco es un
 * discriminador*). La primera corrida publicó «hay consumo de media/» sobre
 * UNA coincidencia de 2 202, y era `1-300x300.jpg` — un nombre que aparece
 * dentro de CUALQUIER cadena que lo contenga como sufijo, p. ej.
 * `kunak_IMG_1-300x300.jpg`. Se exige que el nombre sea DISCRIMINANTE:
 * ≥12 caracteres antes de la extensión y no empezar por dígito suelto. */
const discriminante = (b) => {
  const sinExt = b.replace(/\.[a-z0-9]+$/i, "");
  return sinExt.length >= 12 && !/^\d+([-_]|$)/.test(sinExt);
};
const soloMediaCitados = soloMediaCitadosCrudo.filter(discriminante);
const descartadosPorGenericos = soloMediaCitadosCrudo.filter((b) => !discriminante(b));

/* control POSITIVO del mismo instrumento: un basename que SÍ está en public/
 * tiene que aparecer. Si no aparece, el buscador no busca. */
const controlPositivo = pub.find((f) => f.rel.startsWith("images/uploads/") && textoHtml.includes(f.base));

/* ── EL DESGLOSE DE LOS 661 MiB POR ORIGEN ────────────────────────────────
 * El origen se DERIVA de la ruta y la extensión, y cada cubo lleva su regla
 * escrita al lado para que se pueda auditar. `(sin clasificar)` se publica
 * con su cardinal en vez de repartirse a ojo (§regla 14). */
const REGLAS = [
  { origen: "captura del original · uploads de WordPress", test: (r) => /^images\/uploads\/\d{4}\//.test(r) },
  { origen: "captura del original · uploads sin año", test: (r) => /^images\/uploads\//.test(r) },
  { origen: "tema Divi / KunakAir", test: (r) => /^images\/theme\//.test(r) },
  { origen: "logos", test: (r) => /^images\/logos\//.test(r) },
  { origen: "fuentes", test: (r) => /^fonts\//.test(r) },
  { origen: "vídeos", test: (r) => /^videos\//.test(r) },
  { origen: "SEO (favicon, og, manifest)", test: (r) => /^seo\//.test(r) },
  { origen: "otros de images/", test: (r) => /^images\//.test(r) },
];
const porOrigen = {};
for (const f of pub) {
  const regla = REGLAS.find((x) => x.test(f.rel));
  const k = regla ? regla.origen : "(sin clasificar)";
  porOrigen[k] ??= { ficheros: 0, bytes: 0, alcanzables: 0, bytesAlcanzables: 0 };
  porOrigen[k].ficheros++;
  porOrigen[k].bytes += f.bytes;
  if (citadoPorRel.has(f.rel)) {
    porOrigen[k].alcanzables++;
    porOrigen[k].bytesAlcanzables += f.bytes;
  }
}

/* ── el arrastre por FORMA: ¿son variantes de WordPress? ──────────────────
 * WordPress sirve `-300x200`, `-1024x683`, `-scaled`… Si el arrastre son
 * sobre todo variantes, la causa es la captura, no el clon. */
const esVariante = (b) => /-\d{2,4}x\d{2,4}\.[a-z0-9]+$/i.test(b) || /-scaled\.[a-z0-9]+$/i.test(b);
const arrastreVariantes = arrastre.filter((f) => esVariante(f.base));
const arrastreNoVariantes = arrastre.filter((f) => !esVariante(f.base));

const testigosOk = !!controlPositivo;

const informe = {
  meta: {
    tanda: "146.ª",
    escalon: "ESCALÓN 2 · P2 + desglose por origen",
    fecha: new Date().toISOString(),
    saboteada: SABOTAJE || null,
    acredita: testigosOk && !SABOTAJE,
    buildLeido: { BUILD_ID, mtime: MTIME_BUILD, rutasHtml: canales.html.length },
  },

  canales: Object.fromEntries(Object.entries(canales).map(([k, v]) => [k, v.length])),

  /* controles del instrumento, publicados con su cardinal: si el despojo sale
   * a 0 no está ocurriendo, y el canal `fuente` estaría contando comentarios */
  controlesDelInstrumento: {
    despojoDeComentarios: { ficheros: ficherosDespojados, caracteres: charsDespojados },
    testigoDeDespojo: {
      que: "apps/web/src/components/KunakLogo.tsx cita `public/images/logos/kunak-logo.svg` SÓLO en un comentario; el componente inlinea el SVG",
      esperado: "images/logos/kunak-logo.svg NO debe salir alcanzable",
      obtenido: citadoPorRel.has("images/logos/kunak-logo.svg") ? "SALE ALCANZABLE ✗" : "no sale ✓",
    },
    testigoDeQueElRegexSIGUEcasando: {
      que: "un asset citado de verdad tiene que seguir saliendo — si no, el despojo se llevó el objeto",
      alcanzablesTotales: citadoPorRel.size,
      obtenido: citadoPorRel.size > 1000 ? "el regex casa ✓" : "SOSPECHOSO ✗",
    },
  },

  /* LOS DOS LADOS, y las DOS cotas del emparejamiento */
  alcance: {
    porRUTA_cotaBaja: {
      alcanzables: alcanzables.length,
      alcanzablesMiB: MB(alcanzables.reduce((s, f) => s + f.bytes, 0)),
      arrastre: arrastre.length,
      arrastreMiB: MB(arrastre.reduce((s, f) => s + f.bytes, 0)),
      pctArrastreFicheros: Number(((100 * arrastre.length) / pub.length).toFixed(1)),
      pctArrastreMiB: Number(
        ((100 * arrastre.reduce((s, f) => s + f.bytes, 0)) / pub.reduce((s, f) => s + f.bytes, 0)).toFixed(1)
      ),
    },
    porBASENAME_cotaAlta: {
      alcanzables: alcanzablesPorBase.length,
      alcanzablesMiB: MB(alcanzablesPorBase.reduce((s, f) => s + f.bytes, 0)),
      arrastre: arrastrePorBase.length,
      arrastreMiB: MB(arrastrePorBase.reduce((s, f) => s + f.bytes, 0)),
    },
    nota:
      "las dos cotas ACOTAN: por ruta sub-casa si el render compone la URL por trozos; " +
      "por basename sobre-casa si dos años traen el mismo nombre. El valor real está entre las dos.",
  },

  /* el lado de §regla 61, publicado aunque no sea la pregunta de P2 */
  reglaSesentaYUno: {
    pregunta: "de los `src` CITADOS, ¿cuántos NO tienen fichero en public/?",
    citadasSinFichero: citadasSinFichero.size,
    muestra: [...citadasSinFichero].slice(0, 25),
    deOtroDominio: citadasDeOtroDominio.size,
    muestraDeOtroDominio: [...citadasDeOtroDominio].slice(0, 8),
    nota:
      "las de OTRO DOMINIO se separan y se publican con su cardinal: son un DATO " +
      "(el clon cita assets de terceros), no un asset roto del sitio. " +
      "No afectan al arrastre: el emparejamiento del alcance casa contra `porRel`.",
  },

  auditoriaDelCeroDeApiMedia: {
    pregunta: "¿el HTML consume media/ por ALGÚN canal? — se busca por NOMBRE, no por prefijo de URL",
    ficherosSoloEnMedia: soloMediaBases.length,
    citadosCrudo: soloMediaCitadosCrudo.length,
    descartadosPorGenericos: descartadosPorGenericos.length,
    muestraDescartados: descartadosPorGenericos.slice(0, 5),
    deEsosCitadosEnElHtml: soloMediaCitados.length,
    muestraCitados: soloMediaCitados.slice(0, 10),
    controlPositivo: controlPositivo ? controlPositivo.rel : null,
    veredicto: !controlPositivo
      ? "SIN ADJUDICAR — el control positivo no aparece: el buscador no busca"
      : soloMediaCitados.length === 0
        ? "el cero es DEL OBJETO: el HTML no cita ni un fichero exclusivo de media/ con nombre discriminante. Mecanismo DECLARADO en CMS-0g — el clon renderiza `/images/uploads/…` a propósito, y el campo de PROCEDENCIA existe justamente para reconstruir esa cadena. O sea: mismo byte, otra URL"
        : `hay consumo de media/ en ${soloMediaCitados.length} ficheros con nombre discriminante — el cero de /api/media/ era del patrón`,
  },

  desglosePorOrigen: Object.entries(porOrigen)
    .map(([origen, v]) => ({
      origen,
      ficheros: v.ficheros,
      MiB: MB(v.bytes),
      pctMiB: Number(((100 * v.bytes) / pub.reduce((s, f) => s + f.bytes, 0)).toFixed(1)),
      alcanzables: v.alcanzables,
      alcanzablesMiB: MB(v.bytesAlcanzables),
    }))
    .sort((a, b) => b.MiB - a.MiB),

  formaDelArrastre: {
    total: arrastre.length,
    variantesDeWordPress: arrastreVariantes.length,
    variantesMiB: MB(arrastreVariantes.reduce((s, f) => s + f.bytes, 0)),
    noVariantes: arrastreNoVariantes.length,
    noVariantesMiB: MB(arrastreNoVariantes.reduce((s, f) => s + f.bytes, 0)),
    lectura:
      arrastreVariantes.length > arrastreNoVariantes.length
        ? "el arrastre es sobre todo VARIANTES de WordPress: lo produjo la captura, no el clon"
        : "el arrastre NO es sobre todo variantes: hay que mirar qué es",
  },

  masPesadosDelArrastre: [...arrastre].sort((a, b) => b.bytes - a.bytes).slice(0, 20).map((f) => ({ rel: f.rel, MiB: MB(f.bytes) })),
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

const ci = informe.controlesDelInstrumento;
console.log(`\n── CONTROLES DEL INSTRUMENTO (por las dos polaridades) ──`);
console.log(`  despojo de comentarios: ${ci.despojoDeComentarios.ficheros} ficheros · ${ci.despojoDeComentarios.caracteres} chars`);
console.log(`  testigo NEGATIVO (el logo, citado sólo en comentario): ${ci.testigoDeDespojo.obtenido}`);
console.log(`  testigo POSITIVO (el regex sigue casando):             ${ci.testigoDeQueElRegexSIGUEcasando.obtenido} (${ci.testigoDeQueElRegexSIGUEcasando.alcanzablesTotales})`);

const a = informe.alcance;
console.log(`\n── LOS DOS LADOS (diferencia simétrica, nunca la resta) ──`);
console.log(`  por RUTA (cota baja de alcance):`);
console.log(`     alcanzables ${a.porRUTA_cotaBaja.alcanzables} f · ${a.porRUTA_cotaBaja.alcanzablesMiB} MiB`);
console.log(`     ARRASTRE    ${a.porRUTA_cotaBaja.arrastre} f · ${a.porRUTA_cotaBaja.arrastreMiB} MiB` +
  `  (${a.porRUTA_cotaBaja.pctArrastreFicheros}% f · ${a.porRUTA_cotaBaja.pctArrastreMiB}% MiB)`);
console.log(`  por BASENAME (cota alta de alcance):`);
console.log(`     alcanzables ${a.porBASENAME_cotaAlta.alcanzables} f · ${a.porBASENAME_cotaAlta.alcanzablesMiB} MiB`);
console.log(`     ARRASTRE    ${a.porBASENAME_cotaAlta.arrastre} f · ${a.porBASENAME_cotaAlta.arrastreMiB} MiB`);

console.log(`\n── §regla 61, el otro lado ──`);
console.log(`  rutas citadas SIN fichero en public/: ${informe.reglaSesentaYUno.citadasSinFichero}`);
console.log(`  de OTRO dominio (dato, no defecto):    ${informe.reglaSesentaYUno.deOtroDominio}`);

console.log(`\n── AUDITORÍA DEL CERO de /api/media/ ──`);
console.log(`  ficheros exclusivos de media/: ${soloMediaBases.length} · citados en el HTML: ${soloMediaCitados.length}`);
console.log(`  control positivo: ${controlPositivo ? controlPositivo.rel : "✗ NO APARECE"}`);
console.log(`  ${informe.auditoriaDelCeroDeApiMedia.veredicto}`);

console.log(`\n── DESGLOSE de los ${MB(pub.reduce((s, f) => s + f.bytes, 0))} MiB POR ORIGEN ──`);
for (const o of informe.desglosePorOrigen)
  console.log(
    `  ${String(o.MiB).padStart(9)} MiB (${String(o.pctMiB).padStart(5)}%)  ${String(o.ficheros).padStart(5)} f  ` +
      `alcanzables ${String(o.alcanzables).padStart(5)}  ${o.origen}`
  );

console.log(`\n── FORMA del arrastre ──`);
const fa = informe.formaDelArrastre;
console.log(`  variantes de WordPress: ${fa.variantesDeWordPress} f · ${fa.variantesMiB} MiB`);
console.log(`  NO variantes:           ${fa.noVariantes} f · ${fa.noVariantesMiB} MiB`);
console.log(`  ${fa.lectura}`);

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);
if (!testigosOk) {
  console.error("\n✗ CONTROL POSITIVO EN ROJO: la corrida NO adjudica.");
  process.exitCode = 2;
}
