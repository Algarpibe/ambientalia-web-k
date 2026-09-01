// 131.ª · ESCALÓN 1 — ¿QUEDA CONTENIDO SIN SITIO EN `arquetipos`?
//
// ══════════════════════════════════════════════════════════════════════════
// POR QUE ESTA COMPROBACION Y NO OTRA — escrito ANTES de mirar el dato
//
// La prueba de que un content type expresa un corpus NO es «¿cabe lo que hay?»,
// sino «¿queda contenido SIN SITIO?». Y las dos se contestan DISTINTO:
//
//   · «¿cabe?»  recorre los CAMPOS y pregunta si tienen dato. Un recorrido que
//     solo mira lo que el modelo SABE LEER no puede ver lo que no sabe leer;
//   · «¿sobra?» recorre el DOCUMENTO y pregunta si cada trozo tiene destino.
//
// El repo ya pago la diferencia: un content type declaro su cuerpo opcional
// «por las 2 paginas de cero modulos», y esas 2 tenian 8387 y 5749 CARACTERES
// de contenido en OTRO CANAL que el modelo no tiene. Con el opcional se habrian
// emitido con cabecera, pie y NADA EN MEDIO, respondiendo 200 (§*un campo
// opcional no expresa un caso: solo permite que falte*).
//
// ── LAS TRES PREGUNTAS, y son de niveles distintos ───────────────────────
//   N1 · ¿hay contenido del CUERPO fuera de todo modulo de primer nivel?
//        (el caso medido de arriba: texto en `entry-content` o suelto)
//   N2 · ¿hay algun TIPO de modulo sin bloque en la union?
//   N3 · ¿hay algun CANAL dentro de un modulo sin campo en su bloque?
//        (un <img> en un bloque que no declara `subida`, un <a> en uno sin
//         `enlace`, un <iframe>…)
//
// Un fallo en cualquiera de los tres es contenido que la siembra PERDERIA en
// silencio, porque Payload no se queja de lo que no le pasas.
//
// ── SU NEGATIVO, y es lo unico que demuestra de donde viene el veredicto ──
// `SABOTAJE=bloque-fuera` quita un bloque de la union → N2 tiene que morder.
// `SABOTAJE=campo-fuera`  quita un campo de un bloque → N3 tiene que morder.
// `SABOTAJE=sin-comprobacion` = **bloque-fuera Y ADEMAS la comprobacion
//   desactivada** → tiene que dar el VERDE FALSO COMPLETO.
//
// ⚠⚠ Y ESA COMPOSICION NO ES UN ADORNO: LA v1 DE ESTE NEGATIVO NO SEPARABA
// NADA. `sin-comprobacion` desactivaba la comprobacion sobre el objeto LIMPIO,
// que ya da 0 — asi que predecia EXACTAMENTE LO MISMO que no sabotear, y salia
// verde por las dos vias. Cero instancias separadoras (§regla 21, la vuelta:
// *un caso de negativo puede morirse el dia que se arregla el objeto, y se
// muere VERDE*). Para que un «apagar la guarda» discrimine hace falta que haya
// algo que la guarda pueda ver, asi que el sabotaje INYECTA el defecto y
// DESPUES apaga: mismo objeto, veredicto distinto — y eso es lo unico que
// demuestra que el 0 viene de la comprobacion y no del vacio.
// ══════════════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const BLOQUES = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
const CT126 = join(DERIV, "tipos-f35-126.json");

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["sin-comprobacion", "bloque-fuera", "campo-fuera"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE)) {
  console.error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
  process.exit(1);
}
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const faltan = [...DOCS.map((d) => join(CORPUS, d.doc)), BLOQUES, CT126].filter((p) => !existsSync(p));
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const P = (...a) => console.log(...a);
const controles = [];
const ctl = (ok, n, d) => controles.push({ ok, nombre: n, detalle: d });

P("=".repeat(78));
P("131.ª · ESCALÓN 1 — ¿queda contenido SIN SITIO en `arquetipos`?");
P("=".repeat(78));

/* ═══════════════════════════════════════════════════════════════════════════
   EL MODELO — derivado del fuente, nunca escrito a mano (§regla 9)
   ═══════════════════════════════════════════════════════════════════════════ */
const fuente = readFileSync(BLOQUES, "utf8");
const marcas = [...fuente.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => ({ slug: m[1], i: m.index }));
const bloques = new Map();
for (let k = 0; k < marcas.length; k++) {
  const cuerpo = fuente.slice(marcas[k].i, k + 1 < marcas.length ? marcas[k + 1].i : fuente.length);
  const campos = new Set();
  for (const m of cuerpo.matchAll(/\b(?:campoHtml|htmlLinea|subida|enlace)\(\s*"([a-zA-Z]+)"/g)) campos.add(m[1]);
  for (const m of cuerpo.matchAll(/\{\s*name:\s*"([a-zA-Z]+)",\s*type:\s*"(text|textarea|number|checkbox)"/g)) campos.add(m[1]);
  bloques.set(marcas[k].slug, campos);
}
if (SABOTAJE === "bloque-fuera" || SABOTAJE === "sin-comprobacion") bloques.delete("galeria-arq");
if (SABOTAJE === "campo-fuera") bloques.get("imagen-arq")?.delete("imagen");

/* ⚠⚠ LA TRADUCCION tipo-de-Divi → slug. La v1 la DERIVABA recorriendo los
   `et_pb_x` de cada bloque, y salio con 4 de 11 mapeados: la cabecera del
   fichero cita casi todos los tipos en su prosa, asi que el primer bloque se
   quedaba con los que aparecian antes y el resto se perdia. De ahi N2 = 21
   tipos «SIN BLOQUE» — entre ellos `et_pb_text`, el MAS FRECUENTE del lote
   (100 instancias) y con su bloque `TEXTO` a la vista.

   > Un tipo obvio saliendo «sin bloque» es §*un 100 % redondo: la primera
   > hipotesis es el instrumento*. Evidencia: `-SONDA-ASLUG-DESDE-LA-CABECERA`.

   Se escribe la tabla, que es lo honesto, Y SE LE PONE SU GUARDA: todo tipo que
   el corpus emita tiene que casar, y un no-casado es ROJO — nunca descontado
   (§*lo que NO case sale nombrado*). Asi la tabla no puede envejecer en
   silencio, que es el modo de fallo de §regla 9 (7.º caso). */
const A_SLUG = {
  et_pb_text: "texto-arq",
  et_pb_blurb: "icono-arq",
  et_pb_image: "imagen-arq",
  et_pb_button: "boton-arq",
  et_pb_fullwidth_slider: "slider-ancho-arq",
  et_pb_slider: "slider-arq",
  et_pb_video: "video-arq",
  et_pb_code: "codigo-arq",
  et_pb_cta: "cta-arq",
  dvmd_table_maker: "tabla-arq",
  et_pb_gallery: "galeria-arq",
};
/**
 * ⚠⚠ OVERRIDE NOMBRADO, añadido en la 133.ª — el DEFECTO no cambia.
 *
 * CMS-6 · C mueve la instancia de `et_pb_code` a un bloque TIPADO
 * (`formulario-arq`). Esta tabla sigue apuntando a `codigo-arq`, así que sin
 * override esta sonda mide **el modelo PRE-C** y su verde no dice nada del
 * post-C — §*una medida contesta las preguntas que se le hicieron, y su fichero
 * no lleva escrito cuáles NO*.
 *
 * `MAPEO=post-c` la re-apunta y desvía la congelada, para que la corrida de la
 * 131.ª se pueda seguir reproduciendo al bit (§regla 5).
 */
const MAPEO = process.env.MAPEO ?? null;
if (MAPEO && MAPEO !== "post-c") throw new Error(`MAPEO desconocido: '${MAPEO}' (post-c)`);
if (MAPEO === "post-c") {
  A_SLUG.et_pb_code = "formulario-arq";
  console.log("\n⚠ MAPEO=post-c — `et_pb_code` → `formulario-arq` (CMS-6 · C)\n");
}
const aSlug = new Map(Object.entries(A_SLUG));
/* La guarda de la tabla: sus destinos tienen que EXISTIR en la union. */
const destinosMuertos = Object.entries(A_SLUG).filter(([, s]) => !bloques.has(s) && !(/bloque-fuera|sin-comprobacion/.test(SABOTAJE ?? "") && s === "galeria-arq"));
ctl(
  bloques.size > 0 && destinosMuertos.length === 0,
  "el MODELO se deriva del fuente, y los destinos de A_SLUG EXISTEN en la unión",
  `${bloques.size} bloques · ${aSlug.size} tipos mapeados · ${destinosMuertos.length} destinos muertos`,
);

/* ═══════════════════════════════════════════════════════════════════════════
   EL RECORRIDO DEL DOCUMENTO — y aqui la unidad es EL TROZO DE CONTENIDO
   ═══════════════════════════════════════════════════════════════════════════ */
const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

function tipoDe(clases) {
  const ord = clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c));
  const porOrdinal = ord ? `et_pb_${/^et_pb_(.+?)_\d+(_[a-z]+)*$/.exec(ord)[1]}` : null;
  const desnuda =
    clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ??
    clases.find((c) => /^dvmd_[a-z_]+$/.test(c)) ?? null;
  return porOrdinal ?? desnuda ?? "?";
}

/**
 * Recorre el CUERPO (cascaron descontado) y devuelve, para cada trozo de
 * contenido —nodo de texto no vacio, <img>, <iframe>, <video>—, si cae DENTRO
 * de un modulo de primer nivel y de que tipo.
 *
 * ⚠ Lo que cuenta como CONTENIDO se declara: texto visible, imagen, media
 * embebida. NO cuentan `<script>`, `<style>`, `<noscript>` ni el texto dentro
 * de ellos — no son contenido del cuerpo y contarlos daria un SIN SITIO falso
 * (§*el markup se busca sobre el HTML sin `<style>` ni `<script>`*).
 */
function recorre(html) {
  /* ⚠ Los COMENTARIOS HTML se quitan antes de tokenizar. La v1 no los trataba y
     su `<!-- Google Tag Manager (noscript) -->` salia como un trozo de texto de
     40 chars FUERA de todo modulo — 8 falsos N1, 2 por documento, idénticos.
     Un comentario no es contenido del cuerpo: el navegador no lo pinta, asi que
     no hay nada que modelar. Es el mismo criterio que ya excluye `<script>` y
     `<style>` (§*el markup se busca sobre el HTML sin `<style>` ni `<script>`*),
     con la forma que aquella regla no nombra. La señal de que era instrumento:
     los 8 son EL MISMO literal en los 4 documentos. */
  const cuerpo = html.slice(html.indexOf("<body")).replace(/<!--[\s\S]*?-->/g, "");
  const pila = [];
  const trozos = [];
  const modulos = [];
  let i = 0;
  const TAG = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  let m;
  const dentroDe = (pred) => pila.some(pred);
  while ((m = TAG.exec(cuerpo))) {
    /* el texto entre el tag anterior y este */
    const texto = cuerpo.slice(i, m.index).replace(/&nbsp;/g, " ").trim();
    if (texto && !dentroDe((p) => p.mudo)) {
      const mod = [...pila].reverse().find((p) => p.esModuloN1);
      trozos.push({ clase: "texto", dentro: mod?.tipo ?? null, muestra: texto.slice(0, 70), n: texto.length });
    }
    i = m.index + m[0].length;

    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (cierre) {
      for (let k = pila.length - 1; k >= 0; k--) if (pila[k].tag === tag) { pila.length = k; break; }
      continue;
    }
    const cm = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
    const clases = cm ? cm[1].split(/\s+/).filter(Boolean) : [];
    const esCascaron = clases.some((c) => /_tb_(header|footer)/.test(c));
    const mudo = tag === "script" || tag === "style" || tag === "noscript" || esCascaron || dentroDe((p) => p.mudo);

    if (!mudo && (tag === "img" || tag === "iframe" || tag === "video")) {
      const mod = [...pila].reverse().find((p) => p.esModuloN1);
      const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
      trozos.push({ clase: tag, dentro: mod?.tipo ?? null, muestra: src.slice(0, 70), n: 1 });
    }
    if (VACIOS.has(tag) || /\/\s*$/.test(attrs)) continue;

    const esModulo = clases.includes("et_pb_module");
    const esModuloN1 = esModulo && !mudo && !dentroDe((p) => p.esModulo);
    if (esModuloN1) modulos.push({ tipo: tipoDe(clases) });
    pila.push({ tag, mudo, esModulo: esModulo && !mudo, esModuloN1, tipo: esModuloN1 ? tipoDe(clases) : null });
  }
  return { trozos, modulos };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LAS TRES PREGUNTAS
   ═══════════════════════════════════════════════════════════════════════════ */
/* ⚠⚠ QUE CANAL EXIGE CADA TROZO — Y LA v2 LO TENIA MAL, CON UN ROJO DE 52.
   Mapeaba `img → ["imagen","portada"]` a secas, asi que las 52 imagenes que
   viven DENTRO de un `et_pb_text` salian «sin campo». No lo estan: el campo de
   `texto-arq` es `campoHtml`, o sea RICO, y §*hasta el contenedor de contenido
   la estructura se modela; a partir de ahi el contenido lleva su propia
   estructura dentro y se declara RICO* dice que un `<img>` dentro de un campo
   rico ESTA expresado — va en su HTML.

   ⚠⚠ PERO EL ROJO NO ERA INUTIL: destapo que el CUERPO RICO ES UN CANAL DE
   MEDIA que el derivador del PASO 0 no habia enumerado —solo camino los
   `subida()`—. Y es el canal #1 de la tabla de los tres que mataron el seed
   («el CUERPO rico | el seed murio al sembrar entradas-blog | 1889 → 28»).
   Se persigue en `canales-media-131` v3; aqui solo se corrige la exigencia.

   Los campos RICOS se DERIVAN del fuente (`campoHtml(...)`), no se listan. */
const RICOS = new Map();
for (let k = 0; k < marcas.length; k++) {
  const cuerpo = fuente.slice(marcas[k].i, k + 1 < marcas.length ? marcas[k + 1].i : fuente.length);
  const rs = [...cuerpo.matchAll(/campoHtml\(\s*"([a-zA-Z]+)"/g)].map((m) => m[1]);
  if (rs.length) RICOS.set(marcas[k].slug, rs);
}
ctl(RICOS.size > 0, "los campos RICOS se derivan del fuente (`campoHtml`), no se listan", `${RICOS.size} bloques con campo rico: ${[...RICOS.keys()].join(" · ")}`);

/** Qué canal de contenido exige cada clase de trozo. */
const EXIGE = { texto: ["contenido", "titulo", "texto", "alt"], img: ["imagen", "portada"], iframe: ["url", "contenido"], video: ["url", "contenido"] };

const informe = [];
let n1 = 0, n2 = 0, n3 = 0;
for (const d of DOCS) {
  const { trozos, modulos } = recorre(readFileSync(join(CORPUS, d.doc), "utf8"));

  /* N1 · contenido del cuerpo FUERA de todo módulo de primer nivel */
  const fuera = trozos.filter((t) => t.dentro === null);
  /* N2 · tipos sin bloque */
  const tiposDoc = [...new Set(modulos.map((x) => x.tipo))];
  const sinBloque = tiposDoc.filter((t) => !bloques.has(aSlug.get(t) ?? ""));
  /* N3 · canales sin campo en su bloque */
  const sinCampo = [];
  for (const t of trozos) {
    if (t.dentro === null) continue;
    const slug = aSlug.get(t.dentro);
    const campos = bloques.get(slug);
    if (!campos) continue; // ya contado en N2
    /* Un bloque con campo RICO expresa cualquier estructura que quepa en HTML:
       imagen, enlace, iframe, tabla. El contrato de qué admite se mide aparte
       (§la whitelist del campo rico), pero «tiene sitio» está contestado. */
    const rico = RICOS.has(slug) && SABOTAJE !== "campo-fuera";
    if (rico) continue;
    const quiere = EXIGE[t.clase] ?? [];
    if (quiere.length && !quiere.some((c) => campos.has(c)))
      sinCampo.push({ tipo: t.dentro, slug, clase: t.clase, muestra: t.muestra });
  }

  const ok = SABOTAJE === "sin-comprobacion";
  if (!ok) { n1 += fuera.length; n2 += sinBloque.length; n3 += sinCampo.length; }

  informe.push({
    arquetipo: d.arquetipo,
    trozos: trozos.length,
    modulosN1: modulos.length,
    N1_fueraDeTodoModulo: fuera.length,
    N1_chars: fuera.reduce((a, t) => a + (t.clase === "texto" ? t.n : 0), 0),
    N1_muestra: fuera.slice(0, 8),
    N2_tiposSinBloque: sinBloque,
    N3_canalesSinCampo: sinCampo.slice(0, 12),
    N3_n: sinCampo.length,
  });

  P(`\n## ${d.arquetipo}`);
  P(`   trozos de contenido: ${trozos.length} | módulos de primer nivel: ${modulos.length}`);
  P(`   N1 · fuera de todo módulo ...... ${fuera.length} trozos (${informe.at(-1).N1_chars} chars de texto)`);
  P(`   N2 · tipos SIN bloque .......... ${sinBloque.length}${sinBloque.length ? ` → ${sinBloque.join(", ")}` : ""}`);
  P(`   N3 · canales SIN campo ......... ${sinCampo.length}`);
  for (const f of fuera.slice(0, 6)) P(`        N1 ❗ ${f.clase.padEnd(6)} «${f.muestra}»`);
  for (const s of sinCampo.slice(0, 6)) P(`        N3 ❗ ${s.clase} en ${s.tipo} (${s.slug}) «${s.muestra}»`);
}

/* ⚠ CONTROL DE LA COMPROBACION: sin sabotaje, tiene que haber MIRADO algo.
   Una comprobacion que recorre 0 trozos publica «0 sin sitio» y es §sondas
   4bis: 0 comparado saliendo verde. */
const totalTrozos = informe.reduce((a, i) => a + i.trozos, 0);
ctl(totalTrozos > 0, "§sondas 4bis · la comprobación RECORRIÓ trozos (0 recorrido no puede salir verde)", `${totalTrozos} trozos en 4 documentos`);
ctl(
  informe.every((i) => i.modulosN1 > 0),
  "cada documento aporta módulos de primer nivel (el recorrido no está mudo)",
  informe.map((i) => `${i.arquetipo} ${i.modulosN1}`).join(" · "),
);

P("\n## CONTROLES");
for (const c of controles) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const sinSitio = n1 + n2 + n3;
P("\n" + "=".repeat(78));
P(`VEREDICTO · contenido SIN SITIO = ${sinSitio}   (N1 ${n1} · N2 ${n2} · N3 ${n3})`);
P(
  sinSitio === 0
    ? "  ✅ el content type EXPRESA el corpus: nada del documento queda fuera."
    : "  ❗ queda contenido SIN SITIO — §DÓNDE CORTAR LIMPIO: tras el ESCALÓN 1.",
);
P("=".repeat(78));

/**
 * ⚠⚠ LA GUARDA DE §REGLA 5, QUE ESTA SONDA NO TENÍA — y se pagó en la 133.ª.
 *
 * `derivaciones/` es una de las DOS FUGAS que `w()` no tapa: aquí había un
 * `writeFileSync` pelado, así que **la corrida que VERIFICA pisó a la que
 * DIAGNOSTICÓ**. Al añadir `formulario-arq` esta sonda reescribió
 * `sin-sitio-131.json` con `12 bloques` donde la 131.ª midió `11`, sin decir
 * nada. Se recuperó con `git checkout` **porque estaba commiteada**, que es
 * exactamente la protección que esa regla compra.
 *
 * Ahora no se pisa una congelada que difiera: se escribe al lado con su fecha y
 * se dice en voz alta. Idéntica se reescribe. Para re-congelar, `PISAR=1`.
 */
const base = SABOTAJE ? `sin-sitio-131-neg-${SABOTAJE}`
  : MAPEO === "post-c" ? "sin-sitio-133-POST-C"
    : "sin-sitio-131";
let out = join(DERIV, `${base}.json`);
const sinFechaSS = (s) => s.replace(/"fecha":\s*"[^"]*"/, '"fecha":"—"');
const preparaSalida = (cuerpo) => {
  if (SABOTAJE || process.env.PISAR || !existsSync(out)) return;
  if (sinFechaSS(readFileSync(out, "utf8")) === sinFechaSS(cuerpo)) return;
  const hoy = new Date().toISOString().slice(0, 10);
  let n = `${base}-${hoy}.json`, i = 1;
  while (existsSync(join(DERIV, n))) n = `${base}-${hoy}-${++i}.json`;
  console.log(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${n}`);
  out = join(DERIV, n);
};
const cuerpoSalida = JSON.stringify(
    {
      fecha: new Date().toISOString().slice(0, 10),
      tanda: "131.ª",
      escalon: 1,
      saboteada: SABOTAJE,
      pregunta: "¿queda contenido SIN SITIO? — recorre el DOCUMENTO, no los campos",
      alcance: { docs: DOCS.map((d) => d.doc), unidad: "trozo de contenido del cuerpo (texto no vacío · img · iframe · video)" },
      noContesta: [
        "NO mide el clon: es una propiedad del CORPUS contra el ESQUEMA",
        "NO mide geometría ni ritmo: sólo si cada trozo tiene destino",
        "NO abre el original",
      ],
      controles,
      informe,
      resumen: { N1: n1, N2: n2, N3: n3, sinSitio },
    },
    null,
    1,
  ) + "\n";
preparaSalida(cuerpoSalida);
writeFileSync(out, cuerpoSalida);
P(`\ncongelado: ${out.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);
if (!controles.every((c) => c.ok)) process.exit(3);
process.exit(sinSitio === 0 ? 0 : 2);
