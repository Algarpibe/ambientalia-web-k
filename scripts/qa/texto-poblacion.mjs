/**
 * ¿SOBRE QUÉ POBLACIÓN SE DERIVÓ `MODULO_TEXTO`? — un instrumento, DOS
 * poblaciones, sobre HTML congelado del ORIGINAL.
 * Uso: node scripts/qa/texto-poblacion.mjs        (npm run qa:texto-poblacion)
 *
 * ── La pregunta, y por qué NO es la que contestó `kb-recon` ────────────────
 * `qa:kb-recon` midió lo que hay dentro de los `et_pb_text` de `articulos-kb` y
 * salió el escalón: **7 etiquetas que `BLOQUES_TEXTO` no expresa**. De ahí el
 * dilema de §F3-1-ESCALON-TEXTO — ¿módulo propio para KB, o ensanchar el tipo
 * compartido? — planteado como si el recién llegado fuera la anomalía.
 *
 * Esta sonda contesta la pregunta de antes, que es la que decide el dilema:
 *
 *   > **¿Los otros consumidores del tipo compartido —SECTOR y MONOGRÁFICO—
 *   > traen esas mismas etiquetas dentro de sus módulos de texto?**
 *
 * Si las traen, el tipo no se le queda corto a KB: **estaba corto desde el
 * principio**, y ensancharlo no es acomodar a un recién llegado sino **corregir
 * una medición**. Es la misma pregunta que disolvió CLASE (31 ítems → 1
 * medición): *¿sobre qué dominio se midió esto?*
 *
 * ── Por qué hacía falta capturar, y esto es lo caro de la ficha ────────────
 * `MODULO_TEXTO` se calibró sobre `MonoModulo`/`MonoInline`, o sea sobre datos
 * **TRANSCRITOS A MANO** a `apps/web/src/lib` (lo dice el propio comentario de
 * `contenido.ts`: *«su inventario está medido en 56 `<strong>`»*).
 *
 * > **Una transcripción no se puede auditar contra sí misma.** Lo que no se
 * > transcribió no está ahí para contarlo, así que preguntarle a `src/lib` si le
 * > falta algo devuelve siempre que no. Y el original de estas 8 páginas **no
 * > estaba congelado en ningún sitio del repo** — derivado, no recordado: 0
 * > coincidencias en `corpus/INDICE.json` (309) y 0 en `corpus/fase-3/INDICE.json`
 * > (272), porque las dos campañas las excluyeron con la razón *«CONSTRUIDA
 * > completa: el cuerpo es dato tipado transcrito»*. Correcta para SEMBRAR;
 * > es exactamente la que produce el hueco para AUDITAR.
 *
 * Lo capturó `npm run cms:captura-sectores` (8/8, denominador propio).
 *
 * ── UN instrumento, y su CONTROL ──────────────────────────────────────────
 * Las dos poblaciones se miden con **el mismo código**, y eso no es elegancia:
 * §sondas 4 —*un comparador que falla en el 100 % está comparando dos cosas que
 * no son la misma*— muerde igual cuando la asimetría la produce el instrumento.
 * El control es que esta sonda **reproduzca al carácter** el veredicto congelado
 * de `kb-recon` sobre la población de KB: si no lo reproduce, el instrumento es
 * distinto y el contraste no vale. Cierra el código de salida.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · **CONTROL contra `medidas/kb-recon.json`** — n de módulos, etiquetas y
 *     `fueraDelTipo` idénticos, o TIRA;
 * 2 · `Censo` sobre los selectores (regla 4);
 * 3 · `Evaluadas` con el mínimo derivado de los dos índices;
 * 4 · congela en `medidas/texto-poblacion.json`.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, hoy, launch, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: el clon no la contamina

const RAIZ = join(QA, "../..");
const F3 = join(RAIZ, "corpus/fase-3");
const SEC = join(RAIZ, "corpus/fase-3-sectores");

/**
 * Lo que `BLOQUES_TEXTO` + `inline` (párrafo + negrita) SÍ puede expresar.
 * **Copiado a propósito de `kb-recon.mjs`, no importado**: si el día de mañana
 * el tipo se ensancha, las dos sondas tienen que decirlo por separado y una de
 * ellas es la que congeló el escalón. Un cambio silencioso en el conjunto
 * reescribiría el pasado de las dos a la vez.
 */
const EXPRESABLES = new Set(["p", "ul", "li", "h1", "h2", "h3", "h4", "strong", "b", "span", "sub", "sup", "a", "i", "em", "img"]);

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ EL SOBRE-CASADO, CAZADO EN LA PRIMERA CORRIDA — y por qué hay clasificador
 *
 * La primera versión contó **todo** `et_pb_text` de las secciones propias y dio
 * `div×427 · article×42 · header×22 · meta×24` en SECTOR. Eso no es prosa: en
 * Divi un `et_pb_text` es también el **anfitrión** donde el editor pega un
 * shortcode, y ahí dentro vive la miga (`ol.kunak-breadcrumbs`), la banda de
 * clientes (`swiper`), `#lista-soluciones` y las tarjetas de caso (`article`).
 * Nada de eso lo modela `MODULO_TEXTO` — en el clon son componentes propios.
 *
 * > **§sondas 4, tercera cara: un detector que encuentra MÁS de lo que hay no
 * > da error, da un número plausible de más** — y encima invita a explicarlo.
 * > `div×427` habría entrado en el acta como «el original mete divs en el texto».
 *
 * Así que el módulo **dice qué es**, con marcadores SEMÁNTICOS (§sondas 4: el
 * literal de `className` no discrimina; `kunak-*` e `itemtype` nombran una cosa).
 * Y los marcadores llevan su propia guarda: uno que no case en NINGUNA de las
 * dos poblaciones está muerto y TIRA; uno que case en TODAS es ubicuo y TIRA.
 * ═════════════════════════════════════════════════════════════════════════ */
const MARCADORES_ANFITRION = [
  { id: "miga", re: /class="[^"]*\bkunak-breadcrumbs\b/i },
  { id: "shortcode-kunak", re: /class="[^"]*\bkunak-shortcode\b/i },
  { id: "swiper", re: /class="[^"]*\bswiper\b/i },
  { id: "tarjeta-post", re: /<article\b/i },
  { id: "lista-soluciones", re: /id="lista-soluciones"/i },
];

/* ═══════════════════ LAS DOS POBLACIONES, DERIVADAS DE SUS ÍNDICES ═════════ */
if (!existsSync(join(SEC, "INDICE.json")))
  throw new Error(
    `no existe corpus/fase-3-sectores/INDICE.json.\n` +
      `  Esta sonda contrasta DOS poblaciones y la de SECTOR/MONOGRÁFICO no está capturada.\n` +
      `  Con una sola población la pregunta no se puede contestar — y peor: se contestaría\n` +
      `  igual de verde. Corre antes 'npm run cms:captura-sectores'.`,
  );

const idxKb = JSON.parse(readFileSync(join(F3, "INDICE.json"), "utf8"));
const idxSec = JSON.parse(readFileSync(join(SEC, "INDICE.json"), "utf8"));

const POBLACIONES = [
  {
    id: "articulos-kb",
    que: "los 6 artículos del centro de ayuda — el RECIÉN LLEGADO, dato del editor de WordPress",
    paginas: Object.entries(idxKb.paginas)
      .filter(([k, p]) => k.startsWith("articulos-kb:") && p.fichero && p.http === 200)
      .map(([k, p]) => ({ id: k.slice("articulos-kb:".length), fichero: join(F3, p.fichero) })),
  },
  {
    id: "sector-monografico",
    que: "los 8 de /es/sectores/ — LOS CONSUMIDORES SOBRE LOS QUE SE CALIBRÓ el tipo compartido",
    paginas: Object.entries(idxSec.paginas)
      .filter(([, p]) => p.fichero && p.http === 200)
      .map(([u, p]) => ({ id: new URL(u).pathname, fichero: join(RAIZ, "corpus", p.fichero) })),
  },
];

for (const pob of POBLACIONES)
  if (!pob.paginas.length) throw new Error(`la población '${pob.id}' quedó VACÍA: su índice no da páginas con http 200`);

const TOTAL = POBLACIONES.reduce((n, p) => n + p.paginas.length, 0);

const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: "texto-poblacion", unidad: "páginas", minimo: TOTAL });

const salida = {
  meta: {
    fecha: hoy(),
    que: "Qué hay dentro de los `et_pb_text` del ORIGINAL, en las DOS poblaciones que consumen `MODULO_TEXTO`.",
    fuente: "corpus/fase-3/articulos-kb/** (6) + corpus/fase-3-sectores/** (8)",
    metodo: "file:// + DOM real, red BLOQUEADA; sólo SECCIONES PROPIAS (se excluyen las _tb_)",
    instrumento: "el MISMO código para las dos; el control es reproducir `medidas/kb-recon.json`",
  },
  poblaciones: {},
};

for (const pob of POBLACIONES) {
  console.log(`\n═══ ${pob.id} · ${pob.paginas.length} páginas ═══`);
  const modulos = [];
  for (const pg of pob.paginas) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let bloqueadas = 0;
    page.on("request", (r) => {
      if (r.url().startsWith("file:")) return void r.continue();
      bloqueadas++;
      r.abort().catch(() => {});
    });
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(pathToFileURL(pg.fichero).href, { waitUntil: "domcontentloaded", timeout: 120000 });

    const { datos } = await censo.medir(page, () => {
      const propias = [...__qa(".et_pb_section")].filter((s) => !/_tb_(header|body|footer)/.test(s.className));
      const out = [];
      propias.forEach((s, iSec) => {
        for (const m of s.querySelectorAll(".et_pb_text")) {
          const inner = m.querySelector(".et_pb_text_inner");
          out.push({
            seccion: iSec,
            clasesSeccion: [...s.classList].filter((c) => !/^et_pb_section_\d+$/.test(c)).join(" "),
            html: (inner?.innerHTML ?? "").trim(),
          });
        }
      });
      return { n: propias.length, textos: out };
    });

    for (const t of datos.textos) modulos.push({ pagina: pg.id, ...t });
    ev.ok();
    console.log(`  ${pg.id.split("/").filter(Boolean).pop().slice(0, 50).padEnd(52)} secciones ${String(datos.n).padStart(2)} · et_pb_text ${String(datos.textos.length).padStart(3)}  (${bloqueadas} red BLOQUEADAS)`);
    await page.close();
  }

  /* ── Cada módulo dice qué es: PROSA o ANFITRIÓN de shortcode ────────────── */
  for (const t of modulos) {
    t.anfitrion = MARCADORES_ANFITRION.filter((m) => m.re.test(t.html)).map((m) => m.id);
    t.clase = t.anfitrion.length ? "anfitrion" : "prosa";
  }
  const prosa = modulos.filter((t) => t.clase === "prosa");

  /** El inventario, con EXACTAMENTE la misma cuenta que `kb-recon`. */
  const inventario = (lista) => {
    const etiquetas = {},
      atributos = {};
    for (const t of lista) {
      for (const m of t.html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b/g)) {
        const e = m[1].toLowerCase();
        etiquetas[e] = (etiquetas[e] ?? 0) + 1;
      }
      for (const m of t.html.matchAll(/<[a-zA-Z][^>]*?\s([a-zA-Z-]+)=/g)) atributos[m[1]] = (atributos[m[1]] ?? 0) + 1;
    }
    return {
      etiquetas,
      atributos,
      fueraDelTipo: Object.fromEntries(Object.entries(etiquetas).filter(([e]) => !EXPRESABLES.has(e))),
    };
  };

  /* `todo` es el control contra `kb-recon` (que no clasificaba); `prosa` es el
   * que decide, porque es el único conjunto que `MODULO_TEXTO` pretende modelar. */
  const todo = inventario(modulos);
  const soloProsa = inventario(prosa);
  const { etiquetas, atributos, fueraDelTipo } = todo;

  /* Ejemplos con su página: un recuento sin instancia no se puede adjudicar
   * (§sondas 1, «un número de un par se cita con sus dos lados o no se cita»).*/
  const ejemplos = {};
  for (const e of Object.keys(soloProsa.fueraDelTipo)) {
    const re = new RegExp(`<${e}\\b[^>]*>.{0,90}`, "i");
    ejemplos[e] = prosa
      .filter((t) => new RegExp(`<${e}\\b`, "i").test(t.html))
      .slice(0, 3)
      .map((t) => ({ pagina: t.pagina, seccion: t.seccion, muestra: (t.html.match(re) ?? [""])[0].replace(/\s+/g, " ") }));
  }

  salida.poblaciones[pob.id] = {
    que: pob.que,
    paginas: pob.paginas.length,
    modulosTexto: modulos.length,
    modulosProsa: prosa.length,
    modulosAnfitrion: modulos.length - prosa.length,
    anfitrionPorMarcador: Object.fromEntries(
      MARCADORES_ANFITRION.map((m) => [m.id, modulos.filter((t) => t.anfitrion.includes(m.id)).length]),
    ),
    etiquetas,
    atributos,
    fueraDelTipo,
    prosa: soloProsa,
    ejemplos,
    porPagina: Object.fromEntries(
      pob.paginas.map((pg) => {
        const mios = modulos.filter((t) => t.pagina === pg.id);
        const et = new Set();
        for (const t of mios) for (const m of t.html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b/g)) if (!EXPRESABLES.has(m[1].toLowerCase())) et.add(m[1].toLowerCase());
        return [pg.id, { modulos: mios.length, fuera: [...et].sort() }];
      }),
    ),
  };
}

await browser.close();

/* ═════════════ EL CONTROL: reproducir el veredicto ya congelado ════════════ */
const kbFrio = JSON.parse(readFileSync(join(QA, "medidas/kb-recon.json"), "utf8")).veredicto.moduloTexto;
const kbMio = salida.poblaciones["articulos-kb"];
const discrepa = [];
if (kbFrio.n !== kbMio.modulosTexto) discrepa.push(`n de módulos: kb-recon ${kbFrio.n} → aquí ${kbMio.modulosTexto}`);
for (const [e, n] of Object.entries(kbFrio.etiquetas)) if (kbMio.etiquetas[e] !== n) discrepa.push(`etiqueta ${e}: kb-recon ${n} → aquí ${kbMio.etiquetas[e] ?? 0}`);
for (const e of Object.keys(kbFrio.fueraDelTipo)) if (!(e in kbMio.fueraDelTipo)) discrepa.push(`fueraDelTipo perdió '${e}'`);
salida.control = { contra: "medidas/kb-recon.json → veredicto.moduloTexto", discrepancias: discrepa };

/* ═══ LA GUARDA DE LOS MARCADORES: ni muertos ni ubicuos (§sondas 4) ════════ */
const totalModulos = Object.values(salida.poblaciones).reduce((n, p) => n + p.modulosTexto, 0);
const marcadores = Object.fromEntries(
  MARCADORES_ANFITRION.map((m) => [m.id, Object.values(salida.poblaciones).reduce((n, p) => n + p.anfitrionPorMarcador[m.id], 0)]),
);
const marcadoresMuertos = Object.entries(marcadores).filter(([, n]) => n === 0).map(([id]) => id);
const marcadoresUbicuos = Object.entries(marcadores).filter(([, n]) => n === totalModulos).map(([id]) => id);
salida.marcadores = { cuenta: marcadores, muertos: marcadoresMuertos, ubicuos: marcadoresUbicuos, totalModulos };

/* ══════════════════════════════ EL VEREDICTO ══════════════════════════════ */
const kb = salida.poblaciones["articulos-kb"];
const sm = salida.poblaciones["sector-monografico"];
/** El que decide: sólo PROSA. Los anfitriones de shortcode no los modela nadie. */
const fKb = kb.prosa.fueraDelTipo;
const fSm = sm.prosa.fueraDelTipo;
const compartidas = Object.keys(fKb).filter((e) => e in fSm);
const soloKb = Object.keys(fKb).filter((e) => !(e in fSm));
const soloSm = Object.keys(fSm).filter((e) => !(e in fKb));

salida.veredicto = {
  pregunta: "¿los consumidores sobre los que se calibró `MODULO_TEXTO` traen, EN PROSA, las etiquetas que el tipo no expresa?",
  alcance: "sólo módulos `prosa`: los `anfitrion` hospedan shortcodes (miga · clientes · lista-soluciones · tarjetas) y no los modela `MODULO_TEXTO`",
  fueraDelTipoEnProsa: { "articulos-kb": fKb, "sector-monografico": fSm },
  compartidas,
  soloKb,
  soloSm,
  lectura: Object.keys(fSm).length
    ? "INFRA-ESPECIFICADO: el tipo compartido ya no expresaba lo que traen en PROSA sus PROPIOS consumidores. Ensancharlo corrige una medición, no acomoda a un recién llegado."
    : "El caso NO se da en los consumidores calibrados: las dos salidas siguen vivas y hay que arbitrarlas.",
};

const fmt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e}×${n}`).join(" · ") || "(ninguna)";
console.log(`\n═══════════════════════ VEREDICTO ═══════════════════════`);
console.log(`  marcadores de anfitrión  ${Object.entries(marcadores).map(([id, n]) => `${id}×${n}`).join(" · ")}  (de ${totalModulos} módulos)`);
for (const [id, p] of Object.entries(salida.poblaciones)) {
  console.log(`\n  ${id}  — ${p.paginas} páginas · ${p.modulosTexto} et_pb_text = ${p.modulosProsa} PROSA + ${p.modulosAnfitrion} anfitrión`);
  console.log(`     en prosa           ${fmt(p.prosa.etiquetas)}`);
  console.log(`     FUERA DEL TIPO     ${fmt(p.prosa.fueraDelTipo)}`);
  console.log(`     (todo, con anfitriones: ${fmt(p.fueraDelTipo)})`);
}
console.log(`\n  compartidas por las DOS poblaciones   ${compartidas.join(" · ") || "(ninguna)"}`);
console.log(`  sólo en articulos-kb                  ${soloKb.join(" · ") || "(ninguna)"}`);
console.log(`  sólo en sector/monográfico            ${soloSm.join(" · ") || "(ninguna)"}`);
console.log(`\n  ⇒ ${salida.veredicto.lectura}`);
if (marcadoresMuertos.length || marcadoresUbicuos.length)
  console.log(`\n  ⚠⚠ CLASIFICADOR SIN VALOR — muertos: ${marcadoresMuertos.join(" · ") || "—"} · ubicuos: ${marcadoresUbicuos.join(" · ") || "—"}`);

if (discrepa.length) {
  console.log(`\n  ⚠⚠ EL CONTROL NO CIERRA — este instrumento NO reproduce el veredicto congelado de kb-recon:`);
  for (const d of discrepa) console.log(`     · ${d}`);
  console.log(`     Sin control, el contraste entre poblaciones no vale: la asimetría podría ser del instrumento.\n`);
} else {
  console.log(`\n  ✓ control: reproduce medidas/kb-recon.json al carácter (${kbFrio.n} módulos · ${Object.keys(kbFrio.etiquetas).length} etiquetas)`);
}

const muertos = censo.informe();
w("medidas/texto-poblacion.json", salida);
process.exit(
  ev.informe() + (muertos ? 1 : 0) + (discrepa.length ? 1 : 0) + (marcadoresMuertos.length + marcadoresUbicuos.length ? 1 : 0) === 0 ? 0 : 1,
);
