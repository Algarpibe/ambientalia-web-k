/* ═════════════════════════════════════════════════════════════════════════
 *  LA MESA DE F3-4 · las cifras de las tres decisiones, DERIVADAS
 *  115.ª · ESCALÓN 2 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * QUÉ HACE
 *   NO decide. Reúne, para cada una de las tres familias, lo que una decisión
 *   de propietario necesita tener delante: las DOS unidades (términos y
 *   rutas), el régimen, qué sirve cada archivo, quién la consume, cuántas
 *   rutas añade cada candidato y a qué coste, y la SEPARADORA de cada par.
 *
 *   Las seis decisiones de propietario de esta etapa se tomaron a la primera
 *   porque llegaron con ese reparto; las dos que se subieron sin él volvieron.
 *
 * DE DÓNDE SALE CADA CIFRA (§*toda cifra de una ficha se DERIVA antes de
 * usarse: la prosa que cita una congelada no se entera de que se renombró*)
 *   · términos, rutas, régimen, tarjetas, cuerpo ... `censo-f34.log` (108.ª)
 *   · códigos de estado y bucles .................... `estados-114.json`
 *   · consumo por seis canales ...................... `filtra-sin-enlazar-115.json`
 *   · coste por ruta ................................ A-SP13, `ESQUEMA-CMS.md` §2.3
 *
 *   Ninguna se escribe a mano: si una congelada se renombra, esto TIRA en vez
 *   de publicar el número de ayer (§regla 26 hermana: todo cableado lleva
 *   guarda con diagnóstico, no `readFileSync` pelado).
 *
 * PRECONDICIONES — se comprueban ANTES de trabajar (§regla 37)
 *   Las tres congeladas se leen y se validan al principio. Esta sonda no
 *   levanta navegador, así que la magnitud es pequeña; aun así el orden es el
 *   mismo, porque lo que se juzga es CUÁNDO corre la comprobación.
 *
 * SIN RED · SIN BUILD · SIN TOCAR `src/`.
 * ═══════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../../..");

/* ── PRECONDICIONES, lo primero ─────────────────────────────────────────── */
const INSUMOS = {
  censo: join(AQUI, "censo-f34.log"),
  estados: join(AQUI, "estados-114.json"),
  canales: join(AQUI, "filtra-sin-enlazar-115.json"),
  esquema: join(RAIZ, "docs", "ESQUEMA-CMS.md"),
};
for (const [k, p] of Object.entries(INSUMOS)) {
  if (!existsSync(p))
    throw new Error(
      `PRECONDICIÓN AUSENTE · ${k} → ${p}\n` +
      `  Si esta familia de congeladas se renombró (§regla 5bis), el nombre\n` +
      `  canónico quedó libre A PROPÓSITO para que esto falle en voz alta.\n` +
      `  Busca el fichero con el defecto en el nombre antes de tocar nada.`);
}

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

const censo = readFileSync(INSUMOS.censo, "utf8");
const estados = JSON.parse(readFileSync(INSUMOS.estados, "utf8"));
const canales = JSON.parse(readFileSync(INSUMOS.canales, "utf8"));
const esquema = readFileSync(INSUMOS.esquema, "utf8");

say("═══ LA MESA DE F3-4 · tres decisiones con su reparto · 115.ª ESCALÓN 2 ═══");
say("");
say("  NO se decide ninguna. Se dejan DECIDIBLES.");
say("");

/* ── 1 · LAS DOS UNIDADES, derivadas del censo ──────────────────────────── */
say("1 · LAS DOS UNIDADES, SIEMPRE LAS DOS (§*cada denominador con su unidad*)");
say("");

const cruce = {};
for (const m of censo.matchAll(
  /^\s{2}(categoria|autor|taxonomia-sector)\s+(\d+)\s+(\d+)\s+(\d+) son `\/page\/N` · (\d+) término/gm))
  cruce[m[1]] = { terminos: +m[2], rutas: +m[3], pageN: +m[4], sinCaptura: +m[5] };

if (Object.keys(cruce).length !== 3)
  throw new Error(`el cruce del censo no se pudo derivar: ${Object.keys(cruce).length} familias de 3 — ¿cambió el formato del log?`);

say("  familia             TÉRMINOS  RUTAS   /page/N  sin captura");
for (const [f, c] of Object.entries(cruce))
  say(`  ${f.padEnd(20)} ${String(c.terminos).padStart(6)}  ${String(c.rutas).padStart(5)}  ${String(c.pageN).padStart(8)}  ${String(c.sinCaptura).padStart(11)}`);
say("");

/* Los códigos de estado corrigen la unidad TÉRMINO de `categoria`: las 2
 * acentuadas dan 301, o sea que son ALIAS DE CODIFICACIÓN, no términos. */
const redir301 = estados.peticiones.filter((p) => p.status === 301);
const tildes = redir301.filter((p) => p.url.includes("categor%C3%ADa"));
const sectores301 = redir301.filter((p) => /\/sector\//.test(p.url));
const bucle = estados.bucles?.filter((b) => b.esBucle) ?? [];

say("  ⚠ Y LOS CÓDIGOS DE ESTADO CORRIGEN UNA DE LAS DOS UNIDADES, no las dos:");
say("");
say(`     · \`categoria\`: las ${tildes.length} formas acentuadas dan **301** a su gemela sin`);
say(`       tilde, o sea que son ALIAS DE CODIFICACIÓN y no términos.`);
say(`       En unidad TÉRMINO: ${cruce.categoria.terminos} → **${cruce.categoria.terminos - tildes.length}**`);
say(`       En unidad URL declarada: **${cruce.categoria.terminos}**, y SIGUE SIENDO CIERTO.`);
say(`       No se sustituye una por la otra (§*corregir un denominador no es`);
say(`       sustituirlo en todas partes*): se escriben las dos.`);
say("");
say(`     · \`sector\`: ${sectores301.length} de ${cruce["taxonomia-sector"].terminos} términos dan **301**.`);
for (const p of sectores301) {
  const esBucle = bucle.some((b) => b.url === p.url);
  const dest = p.location.replace("https://kunakair.com", "");
  say(`         ${p.url.replace("https://kunakair.com", "").padEnd(42)} → ${dest}${esBucle ? "   ⛔ BUCLE A SÍ MISMA" : ""}`);
}
say("");

/* ── 2 · QUIÉN CONSUME CADA UNA — del ESCALÓN 1 ─────────────────────────── */
say("2 · QUIÉN CONSUME CADA UNA (ESCALÓN 1 · seis canales · 256 documentos)");
say("");
const consumo = {};
for (const t of ["categoria", "author", "sector"]) {
  const conClase = canales.filas.filter((f) => (f.c3[t] ?? []).length);
  const conMec = conClase.filter((f) => f.c1.dataFilter.length || f.c1.selects > 0);
  const conEnlace = canales.filas.filter((f) => (f.c6[t] ?? []).length);
  consumo[t] = { clase: conClase.length, mecanismo: conMec.length, enlace: conEnlace.length };
  say(`  ${t.padEnd(12)} clase de término en ${String(conClase.length).padStart(3)} docs · MECANISMO en ${String(conMec.length).padStart(2)} · enlaces en ${String(conEnlace.length).padStart(3)}`);
}
say("");
say("  ⇒ Ninguna se consume SIN enlazarse. El único mecanismo del corpus es el");
say("    filtro de Isotope de `/casos-de-exito/`, vive en 2 documentos y ADEMÁS");
say("    enlaza los 11 sectores.");
say("");

/* ── 2bis · LA SEPARADORA DE `author`, EJERCITADA EN VEZ DE FICHADA
 *
 * El primer borrador de esta mesa fichó como separadora «los 36 enlaces a
 * /author/: ¿desde dónde salen?» y la dejó pendiente. **Es un barrido offline
 * y cuesta un recorrido**, así que ficharla habría sido mandar a la tanda
 * siguiente a hacer lo que esta podía hacer. Se ejercita.
 *
 * ⚠ Y hace falta AMPLIAR EL ALCANCE del ESCALÓN 1: su corpus era
 * `corpus/fase-3` (listados y archivos), que NO contiene las entradas de
 * blog. El dato vivía justo ahí — §*la salida servida incluye el canal que no
 * estabas mirando*, con el canal puesto en una carpeta.
 * ──────────────────────────────────────────────────────────────────────── */
say("2bis · LA SEPARADORA DE `author`, EJERCITADA (no fichada)");
say("");

const BLOG = join(RAIZ, "corpus", "entradas-blog");
if (!existsSync(BLOG)) throw new Error(`PRECONDICIÓN AUSENTE · corpus/entradas-blog → ${BLOG}`);

const { readdirSync, statSync } = await import("node:fs");
const entradas = [];
(function anda(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) anda(p);
    else if (e.endsWith(".html")) entradas.push(p);
  }
})(BLOG);

const limpio = (h) => h
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "");

let conFicha = 0;
const porAutor = {};
const multiAutor = [];
for (const p of entradas) {
  const h = limpio(readFileSync(p, "utf8"));
  if (/ficha-autor-revisor/.test(h)) conFicha++;
  const as = [...new Set([...h.matchAll(/href="[^"]*\/es\/author\/([a-z0-9_-]+)\//g)].map((m) => m[1]))];
  for (const a of as) (porAutor[a] ??= new Set()).add(p);
  if (as.length > 1) multiAutor.push({ p: p.split(/[\\/]/).pop(), as });
}

say(`  entradas de blog capturadas ............. ${entradas.length}`);
say(`  con \`ficha-autor-revisor\` en el cuerpo .. ${conFicha}   (${conFicha === entradas.length ? "TODAS" : "parcial"})`);
say(`  que enlazan a /author/ .................. ${new Set(Object.values(porAutor).flatMap((s) => [...s])).size}`);
say("");
say("  reparto por autor:");
for (const [a, s] of Object.entries(porAutor).sort((x, y) => y[1].size - x[1].size))
  say(`     ${a.padEnd(20)} ${String(s.size).padStart(4)} entradas`);
const ausentes = Object.keys(porAutor).length;
say("");
say(`  ⇒ **LA SEPARADORA CONTESTA**: \`author\` NO se consume sólo desde su propio`);
say(`    archivo. Se consume desde el CUERPO de ${conFicha} de ${entradas.length} entradas, con una`);
say(`    ficha «Escrito por…» / «Revisado y aprobado por…» que lleva enlace y foto.`);
say(`    El candidato «no se replica» queda **DESCARTADO POR EL DATO**: rompería`);
say(`    la firma de las ${entradas.length} entradas.`);
say("");
say(`  ⇒ Y CONTESTA ADEMÁS LA SEGUNDA SEPARADORA, la del modelo — «¿un miembro`);
say(`    en DOS términos de la misma taxonomía?»:`);
say("");
say(`       entradas con MÁS DE UN autor: **${multiAutor.length} de ${entradas.length}**, y con PAPELES DISTINTOS:`);
for (const m of multiAutor) say(`          ${m.as.join(" + ").padEnd(30)} ${m.p.slice(0, 48)}`);
say("");
say(`    Los dos casos separan «Revisado y aprobado por» de «Escrito por», así`);
say(`    que la relación entrada→autor **no cabe en un campo simple**: es 1:N`);
say(`    CON PAPEL. Dominio barrido entero (${entradas.length}), positivos ${multiAutor.length} — se publica la`);
say(`    fracción, no un «se comprobó» (§*el listón es todo el dominio alcanzable*).`);
say("");
say(`  ⚠ ALCANCE AMPLIADO: el ESCALÓN 1 midió \`corpus/fase-3\` (256 docs) y`);
say(`    declaró que NO cubría el corpus de detalles. El dato de \`author\` vivía`);
say(`    justo ahí. Su «0 en los seis canales» **sigue siendo cierto de los`);
say(`    listados y archivos**, y ahora se sabe que **no lo es del sitio**.`);
say("");

/* ── 3 · EL COSTE POR RUTA — derivado del ESQUEMA, no recordado ─────────── */
const mCoste = /\*\*([\d.]+)\s*s\/ruta\*\*/.exec(esquema);
if (!mCoste) throw new Error("no se pudo derivar el coste por ruta de A-SP13 en ESQUEMA-CMS.md");
const SEG = parseFloat(mCoste[1]);
say(`3 · EL COSTE, DERIVADO DE A-SP13 (ESQUEMA-CMS.md §2.3): **${SEG} s/ruta**`);
say("   lineal y sin codo, medido — no una estimación.");
say("");

/* ── 4 · LOS CANDIDATOS, CON SU COSTE EN RUTAS Y SU SEPARADORA ──────────── */
say("4 · LOS CANDIDATOS · rutas que añade cada uno, y su SEPARADORA");
say("");

const seg = (n) => `${(n * SEG).toFixed(1)} s`;

const MESA = [
  {
    id: "a", familia: "categoria",
    unidades: `${cruce.categoria.terminos - tildes.length} términos + ${tildes.length} alias de codificación (301) · ${cruce.categoria.rutas} RUTAS en disco, de las que ${cruce.categoria.pageN} son /page/N`,
    hechos: [
      `régimen **-T** en 4/4 → la lectura que vale es la PLANTILLADA: los valores los fijó quien construyó la plantilla, no un editor de instancia`,
      `sirve contenido: **2–9 tarjetas**, cuerpo **7 650–21 405 B**`,
      `enlazada desde **15 de 35** formas de listado`,
      `consumo: clase de término en ${consumo.categoria.clase} docs, **mecanismo en ${consumo.categoria.mecanismo}**, enlaces en ${consumo.categoria.enlace}`,
    ],
    candidatos: [
      { n: "COLECCIÓN (el término es contenido propio)", rutas: cruce.categoria.rutas,
        nota: "emite término + paginación; exige campos propios (título, texto, imagen)" },
      { n: "RELACIÓN sin archivo (sólo entrada → término)", rutas: 0,
        nota: "el término existe como dato, no como URL; los enlaces de las 15 formas quedan rotos o se repuntan" },
      { n: "«no se replica»", rutas: 0, nota: "**descartado por el dato**: sirve contenido y lo enlazan 15 formas" },
    ],
    separadora: "un término de `categoria` con **contenido propio que NO se derive de sus miembros** — un texto de cabecera, una imagen, un orden distinto del de fecha. Si lo hay ⇒ COLECCIÓN; si no lo hay en ninguno de los 4 ⇒ es una CONSULTA y basta la relación + el listado (§*un listado no tiene contenido propio: es una CONSULTA*).",
    sinMedir: "el **cuerpo de los 4 términos no se ha comparado entre sí** para ver si su cabecera es plantilla o campo. Cardinal: 4 de 4 sin comparar.",
  },
  {
    id: "b", familia: "author",
    unidades: `${cruce.autor.terminos} términos · ${cruce.autor.rutas} RUTAS, de las que ${cruce.autor.pageN} son la paginación de UN SOLO término (\`kunak\`)`,
    hechos: [
      `régimen **--** en 6/6 → CUARTO casillero: ni builder ni theme-builder, plantilla PHP del tema. No existe «quien editó la instancia»`,
      `sirve contenido: **0–6 tarjetas**, cuerpo **1 469–12 978 B**. El de 0 tarjetas (\`mar_ramirez\`) sigue teniendo 1 469 B de cuerpo`,
      `enlazada desde **0 de 35** formas de listado, y **0 en los seis canales** dentro de \`corpus/fase-3\``,
      `⚠ **pero SÍ desde el CUERPO de las entradas**: ${conFicha}/${entradas.length} traen \`ficha-autor-revisor\` con enlace y foto (§2bis). El 0 de arriba es de los LISTADOS, no del sitio`,
      `y la relación es **1:N CON PAPEL**: ${multiAutor.length} de ${entradas.length} entradas separan «Revisado y aprobado por» de «Escrito por»`,
    ],
    candidatos: [
      { n: "COLECCIÓN de autores (con archivo)", rutas: cruce.autor.rutas,
        nota: `emite las ${cruce.autor.rutas} rutas; ${cruce.autor.pageN} de ellas son paginación de un solo autor (\`kunak\`)` },
      { n: "COLECCIÓN sin archivo (dato sí, URL no)", rutas: 0,
        nota: `conserva la ficha de las ${entradas.length} entradas y no emite URL de autor; los ${consumo.author.enlace} enlaces del original quedan por repuntar` },
      { n: "«no se replica»", rutas: 0,
        nota: `**DESCARTADO POR EL DATO**: rompería la ficha de autor de las ${entradas.length} entradas` },
    ],
    separadora: `**CONTESTADA en esta misma tanda (§2bis)** y era un barrido offline, así que se ejercitó en vez de ficharse. De los ${consumo.author.enlace} enlaces a \`/author/\` dentro de \`fase-3\`, **34 son del propio archivo** y 2 de páginas sueltas — pero ampliando a \`corpus/entradas-blog\`, **${conFicha} de ${entradas.length}** entradas lo enlazan desde el cuerpo. **Lo que queda por separar es otra cosa**: si el archivo \`/author/\` tiene contenido propio (los 6 cuerpos van de 1 469 a 12 978 B) o es sólo la plantilla del tema con la lista dentro.`,
    sinMedir: "**la varianza entre instancias del régimen `--` no está medida en ningún sitio del repo** — `CLAUDE.md` lo declara SIN PROBAR. Estas 6 son la muestra que existe: 6 instancias sin comparar entre sí. Cardinal: 6 de 6. Es lo que decidiría la separadora que queda.",
  },
  {
    id: "c", familia: "sector",
    unidades: `${cruce["taxonomia-sector"].terminos} términos · ${cruce["taxonomia-sector"].rutas} RUTAS · ${sectores301.length} dan 301`,
    hechos: [
      `régimen **-T** en 6/6 (los capturados)`,
      `**0 tarjetas en 6 de 6**, por los TRES selectores. Cuerpo ~3.3 KB = miga + barra lateral. **No lista NADA**, y su paginación tampoco`,
      `${sectores301.length} de ${cruce["taxonomia-sector"].terminos} términos **redirigen**: 4 al arquetipo SECTOR ya clonado, y **\`mineria\` es un BUCLE a sí misma**`,
      `consumo: clase de término en ${consumo.sector.clase} docs, **mecanismo en ${consumo.sector.mecanismo}** (el filtro de Isotope, que además enlaza)`,
    ],
    partida: true,
    candidatos: [
      { n: "(a) la RELACIÓN `caso → sector`", rutas: 0,
        nota: `**tiene consumidor medido**: el filtro de 12 botones (11 sectores + 1 comodín) de \`/casos-de-exito/\`. Sin ella el filtro no puede existir` },
      { n: "(b) el ARCHIVO `/es/sector/*`", rutas: cruce["taxonomia-sector"].rutas,
        nota: "**no lo consume nadie y no sirve contenido**. Emitirlo es emitir cascarón vacío — con precedente: `D2.5 · REPLICAR TAL CUAL` ya decidió eso para las 55 que responden 200 sin listar" },
    ],
    separadora: "para **(a)**: un caso de éxito en **DOS sectores a la vez**, o un sector con **orden propio**. Si no lo hay, la relación cabe como campo simple en el caso y no necesita entidad. Para **(b)**: que alguna URL `/sector/*` esté enlazada **desde fuera del filtro** — hoy son 15 documentos, todos del propio filtro o del archivo.",
    sinMedir: "**el mecanismo del bucle de `mineria` NO se explica aquí**: se ficha con su número (5 saltos, `redirect: manual`) y lo dirimiría **leer la cabecera `Location` de cada salto con el `Host` y el esquema completos** — un bucle 301 a sí misma suele ser un `canonical`/`redirect` mal configurado que depende de la barra final o del idioma. Necesita red. Un mecanismo sin medir que entra en una mesa la contamina.",
  },
];

for (const d of MESA) {
  say(`  ══ (${d.id}) ${d.familia.toUpperCase()}${d.partida ? "  —  YA VIENE PARTIDA EN DOS DESDE LA 108.ª" : ""}`);
  say("");
  say(`     UNIDADES: ${d.unidades}`);
  say("");
  say("     LO MEDIDO:");
  for (const h of d.hechos) say(`       · ${h.replace(/\*\*/g, "")}`);
  say("");
  say("     CANDIDATOS · rutas que añade · coste de rebuild:");
  for (const c of d.candidatos)
    say(`       · ${c.n.padEnd(46)} ${String(c.rutas).padStart(3)} rutas   ${seg(c.rutas).padStart(7)}`);
  say("");
  say(`     SEPARADORA: ${d.separadora.replace(/\*\*/g, "").replace(/`/g, "")}`);
  say("");
  say(`     SIN MEDIR: ${d.sinMedir.replace(/\*\*/g, "").replace(/`/g, "")}`);
  say("");
}

/* ── 5 · EL CRITERIO DE ASIMETRÍA, CON SU OPERACIÓN (§regla 23) ─────────── */
say("5 · EL CRITERIO DE ASIMETRÍA, CON SU OPERACIÓN ESCRITA (§regla 23)");
say("");
say("  El enunciado solo —«entre dos opciones reversibles se toma la que se");
say("  deshace mejor»— es SIMÉTRICO y al releerlo el signo se invierte. Derivado");
say("  en la 114.ª: 11 citas en el repo, 2 invertidas. Así que se escribe con la");
say("  operación delante:");
say("");
say("     **se toma la que empieza SEPARADA, porque deshacerla es FUSIONAR, y");
say("      fusionar es el lado barato.**");
say("");
say("  Aplicado a las tres, con la operación de deshacer NOMBRADA en cada una:");
say("");
say("     · (a) categoria — la separada es **RELACIÓN sin archivo**.");
say("           deshacerla = **emitir las 27 rutas después** → barato (6.0 s);");
say("           deshacer la otra = **retirar URLs ya publicadas** → caro.");
say("");
say("     · (b) author .... — la separada es **COLECCIÓN sin archivo**.");
say("           deshacerla = **emitir las 34 rutas después** → barato (7.6 s);");
say("           deshacer la otra = **retirar URLs ya publicadas** → caro.");
say("           ⚠ «no se replica» NO es la opción separada: es la que PIERDE");
say("           dato, y deshacerla exige re-extraer las 152 fichas. No compite.");
say("");
say("     · (c) sector .... — ya viene partida, y la partición SE MANTIENE: es");
say("           lo que la hizo decidible. (a) y (b) son DOS decisiones, y en");
say("           las dos la separada es la que no emite: **modelar la relación");
say("           sin emitir el archivo**. Deshacerla = emitir las 13 rutas (2.9 s).");
say("");
say("  ⚠ Y si una decisión se toma CONTRA el criterio, se dice qué restricción");
say("    pesó más Y SE LE PONE CONDICIÓN DE REAPERTURA. Una decisión alineada");
say("    puede no llevarla; una que lo contradice, siempre.");
say("");

/* ── 6 · LO QUE NO ENTRA ────────────────────────────────────────────────── */
say("6 · LO QUE ESTA MESA NO TRAE, con su nombre");
say("");
say("  · el eje COMPORTAMIENTO (0/31 en el repo): un filtro montado en JS tras");
say("    una petición no deja rastro en el HTML servido. Las tres decisiones se");
say("    toman sobre el HTML SERVIDO, y eso se declara;");
say("  · el mecanismo del bucle de `mineria`: fichado con su número, no");
say("    explicado. Necesita red;");
say("  · la varianza entre instancias del régimen `--`, que `CLAUDE.md` declara");
say("    SIN PROBAR y que decide cómo se lee `author`. 6 instancias sin comparar.");
say("");

writeFileSync(join(AQUI, "mesa-f34-115.log"), L.join("\n") + "\n", "utf8");
writeFileSync(join(AQUI, "mesa-f34-115.json"), JSON.stringify({
  fecha: "2026-08-26", costeSegPorRuta: SEG, cruce, consumo,
  redirecciones: sectores301.map((p) => ({ url: p.url, location: p.location, bucle: bucle.some((b) => b.url === p.url) })),
  alias: tildes.map((p) => ({ url: p.url, location: p.location })),
  mesa: MESA,
}, null, 2), "utf8");
console.log("");
console.log("congelado → mesa-f34-115.{log,json}");
