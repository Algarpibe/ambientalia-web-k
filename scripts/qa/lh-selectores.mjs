/**
 * LA COBERTURA POR FORMA DE LOS SELECTORES DE `deTarjeta` — y el NO-OP del
 * arreglo del `extracto`.
 * Uso: node scripts/qa/lh-selectores.mjs          (npm run qa:lh-selectores)
 *      SABOTAJE=<x> node …                         (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PREGUNTA CONTESTA, Y QUÉ NO
 *
 * CONTESTA: **en qué formas casa cada selector de rol** de `lh-barrido`, y si
 * cambiar la lista del `extracto` mueve algo en las formas que YA casaban.
 *
 * NO CONTESTA: la GEOMETRÍA. Se mide sobre el corpus por `file://` y **el
 * corpus no trae sus hojas** (§F3-1-CSS-NO-CAPTURADO: `columna.width` 678.52
 * offline contra 430.80 en vivo). Así que aquí sólo se leen cosas que el CSS no
 * puede mover: **qué selector casa, cuántos nodos, y qué texto**. Un número de
 * `rect` salido de aquí sería plausible y falso.
 *
 * ── POR QUÉ ESTA SONDA EXISTE ─────────────────────────────────────────────
 * El espejo publicaba `extracto: null` en **107 de 236** tarjetas, repartidas
 * **por forma** y **idénticas a 1440 y a 390** — que es la firma de un selector,
 * no la de un defecto de maquetación. Ninguna guarda lo cazó:
 *
 *   > **`Censo.muertos()` suma TODAS las páginas, y 129 no es cero.** Un
 *   > selector que casa en dos formas y en NINGUNA de las otras siete sale vivo.
 *
 * Es el hueco entre §sondas 4 (el cero) y su complementario (el pleno). Se cierra
 * en la CLASE —`Censo.parciales()` / `informeGrupos()` en `lib.mjs`— y esta sonda
 * es quien lo ejercita sobre las 9 formas.
 *
 * ── EL NO-OP, Y POR QUÉ NO BASTA RAZONARLO ────────────────────────────────
 * El arreglo añade `.scientific-excerpt` **al final** de la lista, así que
 * «por construcción» no puede mover `/blog` ni `/etiqueta`. **Eso es un
 * razonamiento, no una medida** (§*el marcador prueba que el build es nuevo, no
 * que el cambio tenga efecto* — aquí al revés: hay que probar que NO lo tiene).
 * La sonda corre las DOS listas sobre las mismas páginas y compara el texto
 * extraído tarjeta a tarjeta.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, openPage, QA, w } from "./lib.mjs";

const SABOTAJES = ["sin-corpus", "un-solo-grupo", "extracto-viejo"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const RAIZ = SABOTAJE === "sin-corpus" ? join(QA, "medidas/no-existe") : "corpus/fase-3/listados";

/* ── Las páginas del corpus, DERIVADAS del árbol (§regla 9) ───────────────── */
const paginas = [];
const anda = (d) => {
  if (!existsSync(d)) return;
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) anda(p);
    else if (e === "index.html") paginas.push(p);
  }
};
anda(RAIZ);
/** La FORMA es la primera carpeta bajo la raíz: es como el corpus las separa. */
const formaDe = (f) => f.slice(RAIZ.length + 1).split(/[\\/]/)[0];
const FORMAS = [...new Set(paginas.map(formaDe))].sort();

const ev = new Evaluadas({ sonda: "lh-selectores", unidad: "páginas del corpus", minimo: 149 });
gritaSiRevienta();

/**
 * ── Las DOS listas del extracto: la de antes del arreglo y la de después ───
 *
 * ⚠ **EL ARREGLO TIENE DOS MITADES Y EL SABOTAJE TIENE QUE ANULAR LAS DOS.**
 * La primera versión de `extracto-viejo` revertía sólo la LISTA y dejaba vivo el
 * rescate del **texto suelto**, así que seguía ganando las 56 tarjetas de
 * `L2-glosario` + `L2-faqs` y **salía verde diciendo «NO-OP confirmado»**. Es la
 * hermana de §regla 17 —*un sabotaje que comparte variable con el mínimo no
 * puede ejercitarlo*— con el objeto cambiado: aquí el sabotaje **cubría media
 * hipótesis**, y media hipótesis no se puede falsear.
 */
const VIEJA = [".post-content p", ".post-content-inner p", ".entry-summary p", ".excerpt"];
const NUEVA = [".post-content p", ".post-content-inner p", ".entry-summary p", ".excerpt", ".scientific-excerpt"];
const SIN_ARREGLO = SABOTAJE === "extracto-viejo";
const LISTA_NUEVA = SIN_ARREGLO ? VIEJA : NUEVA;

/** Los roles tal como los declara `deTarjeta`, para censar su cobertura. */
const ROLES = {
  titulo: ["h1.entry-title", "h2.entry-title", "h3.entry-title", ".case-title", ".scientific-title"],
  fecha: [".published", "time", ".post-meta .updated", ".fecha"],
  categoria: ["a[rel~='category']", "a[href*='/scientific-category/']", ".post-meta a"],
  meta: [".post-meta", ".entry-meta", ".case-taxonomies", ".scientific-taxonomies"],
  media: [".entry-featured-image-url img", ".et_pb_image_container img", "a.case-imagen", ".scientific-imagen-container"],
};

const enPagina = (roles, vieja, nueva, sinArreglo) => {
  const cards = [...document.querySelectorAll("article, .et_pb_post")];
  const primero = (card, sels) => { for (const s of sels) { const e = card.querySelector(s); if (e) return { sel: s, texto: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 300) }; } return null; };
  /* La 2.ª mitad del arreglo. `sinArreglo` la anula junto con la lista: las dos
   * mitades tienen que caer a la vez o el sabotaje no falsea la hipótesis. */
  const suelto = (card) => {
    if (sinArreglo) return null;
    const t = [...card.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.replace(/\s+/g, " ").trim()).filter((s) => s.length > 20);
    return t.length ? { sel: "«texto suelto del <article>»", texto: t.join(" ").slice(0, 300) } : null;
  };
  /* El censo por selector, para la cobertura por forma */
  const censo = {};
  for (const [rol, sels] of Object.entries(roles)) for (const s of sels) censo[`${rol}:${s}`] = cards.reduce((n, c) => n + c.querySelectorAll(s).length, 0);
  for (const s of nueva) censo[`extracto:${s}`] = cards.reduce((n, c) => n + c.querySelectorAll(s).length, 0);
  return {
    nCards: cards.length,
    censo,
    /* Las dos lecturas del extracto sobre LAS MISMAS tarjetas */
    viejo: cards.map((c) => primero(c, vieja)?.texto ?? null),
    nuevo: cards.map((c) => primero(c, nueva)?.texto ?? suelto(c)?.texto ?? null),
    nuevoSel: cards.map((c) => primero(c, nueva)?.sel ?? (suelto(c) ? "«suelto»" : null)),
  };
};

const { browser } = await launch();
const censo = new Censo();
const porForma = {};
let noOpRotos = [];
try {
  for (const f of paginas) {
    const forma = SABOTAJE === "un-solo-grupo" ? "todo-junto" : formaDe(f);
    censo.grupo(forma);
    const { page } = await openPage(browser, pathToFileURL(f).href, { width: 1440, height: 900 });
    const d = await page.evaluate(enPagina, ROLES, VIEJA, LISTA_NUEVA, SIN_ARREGLO);
    await page.close();
    for (const [k, n] of Object.entries(d.censo)) {
      censo.total[k] = (censo.total[k] || 0) + n;
      censo.porGrupo[forma][k] = (censo.porGrupo[forma][k] || 0) + n;
    }
    const pf = (porForma[forma] = porForma[forma] || { paginas: 0, cards: 0, conViejo: 0, conNuevo: 0, selUsados: {} });
    pf.paginas++;
    pf.cards += d.nCards;
    pf.conViejo += d.viejo.filter(Boolean).length;
    pf.conNuevo += d.nuevo.filter(Boolean).length;
    for (const s of d.nuevoSel) if (s) pf.selUsados[s] = (pf.selUsados[s] || 0) + 1;
    /* ⚠ EL NO-OP: donde la lista VIEJA casaba, la NUEVA tiene que dar EL MISMO
     * texto. No basta con que las dos casen: tiene que ser el mismo elemento. */
    d.viejo.forEach((v, i) => {
      if (v !== null && d.nuevo[i] !== v) noOpRotos.push({ pagina: f.split(sep).slice(-4).join("/"), i, viejo: v.slice(0, 60), nuevo: (d.nuevo[i] || "∅").slice(0, 60) });
    });
    ev.ok();
  }
} finally {
  await browser.close();
}

/**
 * ⚠ SELECTORES QUE EL CORPUS NO EJERCITA — declarados con su cardinal, para que
 * uno NUEVO sí cierre el código de salida (§*todo patrón discriminante declara
 * su máximo*).
 *
 * Son **fallbacks** de `deTarjeta`: cada uno tiene delante otro que sí casa, así
 * que el rol se resuelve igual y por eso nunca dieron error. NO se quitan en
 * esta tanda —`deTarjeta` también corre contra el original VIVO y contra formas
 * que este corpus no capturó, así que borrarlos sería un cambio sin medida que
 * lo respalde—. Lo que sí se hace es **dejar de que sean invisibles**: quedan
 * fichados en `PENDIENTES-QA.md` §F3-LH-SELECTORES-NO-EJERCITADOS con su
 * denominador (**0 de 149 páginas**).
 *
 * ⚠ Y esto NO es «declarar un rojo para ponerlo verde»: un selector que aparezca
 * muerto y **no esté en esta lista** sigue cerrando el código con ≠ 0. La lista
 * es un inventario con fecha, no una amnistía.
 */
const NO_EJERCITADOS = [
  "titulo:h1.entry-title",
  "fecha:time",
  "fecha:.post-meta .updated",
  "fecha:.fecha",
  "meta:.entry-meta",
  "media:.et_pb_image_container img",
  "extracto:.entry-summary p",
  "extracto:.excerpt",
];

/* Los parciales que SON dato, medidos y no supuestos. Se declaran para que el
 * resto salga por error (§*todo patrón discriminante declara su máximo*). */
const PARCIALES_DECLARADOS = [
  /* cada forma trae su piel de tarjeta: el título de `L5` es `.case-title` y el
   * de `L2` es `h2.entry-title`; que un selector de piel falte en las otras
   * formas es la definición de piel, no un defecto */
  ...Object.entries(ROLES).flatMap(([rol, sels]) => sels.map((s) => `${rol}:${s}`)),
  ...NUEVA.map((s) => `extracto:${s}`),
];

const cobertura = Object.fromEntries(
  Object.entries(porForma).map(([forma, v]) => [
    forma,
    { ...v, extractoViejo: `${v.conViejo}/${v.cards}`, extractoNuevo: `${v.conNuevo}/${v.cards}` },
  ]),
);

const muertosVistos = censo.muertos();
const muertosSinDeclarar = muertosVistos.filter((s) => !NO_EJERCITADOS.includes(s));
const revividos = NO_EJERCITADOS.filter((s) => !muertosVistos.includes(s));

const salida = {
  meta: {
    fecha: hoy(),
    que: "cobertura POR FORMA de los selectores de rol de lh-barrido, y el NO-OP del arreglo del extracto",
    corpus: `${RAIZ} · ${paginas.length} páginas · ${FORMAS.length} formas`,
    sinRed: "corpus por file://: no toca el original",
    contesta: "en qué formas casa cada selector, y si el arreglo mueve las formas que ya casaban",
    noMide: [
      `la GEOMETRÍA: el corpus no trae sus hojas (§F3-1-CSS-NO-CAPTURADO), así que ningún rect de aquí vale — 0 campos de rect en esta salida`,
      `las formas que el corpus no capturó: se miden ${paginas.length} páginas de las ${paginas.length} que hay en disco, y lo que no está capturado no sale nombrado aquí`,
    ],
    sabotaje: SABOTAJE,
  },
  formas: FORMAS,
  cobertura,
  noOp: { rotos: noOpRotos.length, ejemplos: noOpRotos.slice(0, 5) },
  parciales: censo.parciales(),
  noEjercitados: { declarados: NO_EJERCITADOS.length, vistos: muertosVistos.length, sinDeclarar: muertosSinDeclarar, revividos, de: `0 de ${paginas.length} páginas` },
  censoTotal: censo.total,
};
w(`medidas/lh-selectores.json`, salida);

console.log(`\n── ${paginas.length} páginas · ${FORMAS.length} formas · corpus por file://`);
for (const [forma, v] of Object.entries(cobertura))
  console.log(`   ${forma.padEnd(22)} ${String(v.cards).padStart(4)} tarjetas · extracto ${v.extractoViejo.padStart(8)} → ${v.extractoNuevo.padStart(8)} · ${Object.keys(v.selUsados).join(" ") || "∅"}`);
console.log(`\n   NO EJERCITADOS por este corpus (fallbacks con otro delante que sí casa), 0 de ${paginas.length} páginas:`);
for (const s of muertosVistos) console.log(`     · ${s}${NO_EJERCITADOS.includes(s) ? "" : "   ⛔ SIN DECLARAR"}`);
if (revividos.length) console.log(`   ⚠ declarados como no ejercitados y HOY CASAN (quítalos de la lista): ${revividos.join(" · ")}`);
const parcialesSinDeclarar = censo.informeGrupos(PARCIALES_DECLARADOS, "de roles");

let codigo = 0;
if (!ev.suficiente()) {
  console.log(`\n⛔ por debajo del mínimo (${ev.n}/${ev.minimo}): no se emite veredicto de cobertura.`);
  codigo = 2;
} else if (muertosSinDeclarar.length) {
  console.log(
    `\n⛔ ${muertosSinDeclarar.length} SELECTOR(ES) MUERTO(S) SIN DECLARAR — no casan en ninguna de las\n` +
      `   ${paginas.length} páginas y no están en \`NO_EJERCITADOS\`. Un \`null\` suyo se leería como dato:\n` +
      muertosSinDeclarar.map((s) => `     · ${s}`).join("\n"),
  );
  codigo = 2;
} else if (noOpRotos.length) {
  console.log(
    `\n⛔ EL ARREGLO NO ES NO-OP: ${noOpRotos.length} tarjetas que la lista VIEJA ya leía\n` +
      `   ahora leen OTRA COSA. El arreglo del extracto sólo puede AÑADIR formas,\n` +
      `   nunca mover las ${Object.values(cobertura).reduce((s, v) => s + v.conViejo, 0)} que ya casaban.`,
  );
  for (const r of noOpRotos.slice(0, 5)) console.log(`     · ${r.pagina} #${r.i}: «${r.viejo}» → «${r.nuevo}»`);
  codigo = 2;
} else if (parcialesSinDeclarar) {
  codigo = 2;
} else if (Object.keys(censo.porGrupo).length < 2) {
  /* §regla 15 aplicada al propio instrumento: con UN grupo, `parciales()` no
   * puede discriminar nada y devuelve `[]`. Ese cero se lee igual que «no hay
   * parciales», que es la afirmación contraria. */
  console.log(`\n⛔ UN SOLO GRUPO: \`parciales()\` no puede discriminar y su [] se leería como «0 parciales».\n   Hacen falta ≥2 formas para que la cobertura por grupo signifique algo.`);
  codigo = 2;
} else if (Object.values(cobertura).reduce((s, v) => s + v.conNuevo - v.conViejo, 0) === 0) {
  /* ⚠ Si la lista nueva no gana NI UNA tarjeta, el NO-OP se cumple de forma
   * trivial —las dos listas son la misma— y el verde no distingue «el arreglo
   * funciona» de «no hay arreglo». Es §*un patrón que casa en TODAS tampoco
   * mide nada* con el objeto cambiado: aquí lo que no discrimina es el CONTROL. */
  console.log(`\n⛔ EL ARREGLO NO GANA NI UNA TARJETA: el NO-OP se cumple porque las dos listas\n   son la misma, y eso no prueba nada. Un verde aquí sería el de no haber cambiado nada.`);
  codigo = 2;
} else {
  const ganados = Object.values(cobertura).reduce((s, v) => s + v.conNuevo - v.conViejo, 0);
  console.log(
    `\n✅ NO-OP confirmado sobre las ${Object.values(cobertura).reduce((s, v) => s + v.conViejo, 0)} tarjetas que ya casaban,\n` +
      `   y +${ganados} tarjetas de extracto que el espejo publicaba como \`null\`.\n` +
      `   Los ${parcialesSinDeclarar === 0 ? censo.parciales().length : "?"} parciales por forma están DECLARADOS: una piel de tarjeta que\n` +
      `   sólo existe en su forma es la definición de piel, no un selector roto.`,
  );
}
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} páginas del corpus · lh-selectores`);
process.exit(codigo);
