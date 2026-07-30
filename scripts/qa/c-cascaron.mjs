/**
 * P-C3-2 — EL CASCARÓN DEL GRUPO C, MEDIDO ANTES DE ESCRIBIR EL COMPONENTE.
 * Uso: npm run qa:c-cascaron -- [ancho]        (1440 por defecto; 390 = móvil)
 *
 * ── Qué predicción cierra ──────────────────────────────────────────────────
 * `grupo-C/DECISIONES.md` P-C3-2: «ritmo, tipografía y retícula del cascarón con
 * varianza cero entre instancias de la misma forma, a los dos anchos, medido en
 * ≥3 instancias por forma **antes** de escribir el componente. *Refuta:*
 * cualquier eje con varianza — y ese eje sería un campo que este modelo no
 * tiene.»
 *
 * Es la lección del monográfico aplicada por adelantado: allí **ocho
 * propiedades** no se veían en la primera página y las ocho eran campo. Medir
 * varias instancias antes de escribir el componente es exactamente lo que no se
 * hizo entonces.
 *
 * ── Qué se mide y qué NO ───────────────────────────────────────────────────
 * El grupo C está en el TERCER régimen (cabecera y pie por Theme Builder, cuerpo
 * por PHP del tema hijo — §0 del recon), así que **el discriminador es la
 * varianza entre instancias**, no el test A de Divi: en plantillado, px absolutos
 * iguales a los dos anchos significan «lo fijó quien construyó la plantilla».
 *
 * Se juzga la varianza de RITMO (padding/margin), TIPOGRAFÍA (font/line-height/
 * letter-spacing/color/transform) y RETÍCULA (anchos de contenedor y reparto de
 * columnas). **Las ALTURAS no se juzgan**: dependen del contenido y varían por
 * construcción — se vuelcan al JSON como contexto, y el informe lo dice.
 *
 * ── Un canal de verdad ─────────────────────────────────────────────────────
 * Regla 1 de `CLAUDE.md` §Tres reglas sobre las sondas: lo que imprime y lo que
 * cuenta no pueden discrepar. Aquí, **todo eje con varianza se cuenta y cierra
 * el código de salida**; y un eje que falta en una instancia (`null`) también
 * cuenta — «ausente en una y presente en otra» ES varianza, no un hueco que
 * ignorar. El informe imprime cuántos ejes se compararon, no solo los que
 * fallan: una sonda que no mira nada y una que no encuentra nada dan la misma
 * salida.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;

/* ── Las instancias: ≥3 por forma, y adversarias, no cómodas ──────────────
 * Casos: con galería y sin, con dos términos de sector y sin ninguno, y los dos
 * prefijos. Si el cascarón dependiera de alguno de esos ejes, esta selección lo
 * ve; una selección de tres casos «normales» no.                             */
const INSTANCIAS = [
  // ── forma «caso» (los dos prefijos son la MISMA forma — D2) ──
  { forma: "caso", id: "des-moines (2 términos, galería 7)",
    url: "https://kunakair.com/es/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa/" },
  { forma: "caso", id: "world-athletics (SIN sector, SIN galería)",
    url: "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/" },
  { forma: "caso", id: "lindano (sin soluciones, sin parámetros)",
    url: "https://kunakair.com/es/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano/" },
  { forma: "caso", id: "belgica (galería 3, 1 término)",
    url: "https://kunakair.com/es/casos-de-exito/analisis-de-la-calidad-del-aire-estaciones-moviles-en-belgica/" },
  { forma: "caso", id: "rio-de-janeiro EN (prefijo inglés, SIN mapa, galería 15)",
    url: "https://kunakair.com/es/case-studies/distrito-baja-emision-rio-de-janeiro/" },
  { forma: "caso", id: "castel-d-ario EN (prefijo inglés)",
    url: "https://kunakair.com/es/case-studies/monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario/" },
  // ── forma «faq» ──
  { forma: "faq", id: "dron (la más corta, 151)",
    url: "https://kunakair.com/es/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento/" },
  { forma: "faq", id: "calibración vs corrección (la más larga, 539, ul+a)",
    url: "https://kunakair.com/es/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion/" },
  { forma: "faq", id: "cartuchos (354)",
    url: "https://kunakair.com/es/faqs/cada-cuanto-tiempo-se-reemplazan-los-cartuchos-y-se-renueva-el-software/" },
  { forma: "faq", id: "área que cubre (414)",
    url: "https://kunakair.com/es/faqs/que-area-cubre-cada-dispositivo/" },
];

/* ── TEST EN NEGATIVO ───────────────────────────────────────────────────────
 * `CLAUDE.md` §Tres reglas, corolario: *no te creas un «limpio» hasta haber
 * probado que la sonda sabe fallar*, y **cada arreglo de la sonda vuelve a
 * correrlo entero**. Éste ya se cobró una vez aquí: la primera versión medía el
 * `<p>` de dentro del contenido rico y daba varianza donde no la había.
 *
 *   SABOTAJE=forma npm run qa:c-cascaron -- 1440
 *
 * mete una FAQ en el grupo «caso». Tiene que caer por su propio invariante —
 * varianza de cascarón (migas ausentes, pie de 3 en vez de 4) y NO por las
 * ausencias que el modelo declara— y salir con 1.                            */
let SUFIJO = "";
if (process.env.SABOTAJE === "forma") {
  INSTANCIAS[5] = { forma: "caso", id: "☠ SABOTAJE: una FAQ colada entre los casos",
    url: "https://kunakair.com/es/faqs/como-se-comunica-el-equipo/" };
  // La corrida de sabotaje escribe APARTE. La primera versión pisaba la salida
  // congelada con la falsa: la prueba de que la sonda sabe fallar no puede
  // destruir la medida que la sonda produjo.
  SUFIJO = "-sabotaje";
  console.log("☠ SABOTAJE=forma — la sonda DEBE refutar y salir con 1\n");
}

const { browser } = await launch();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), n: INSTANCIAS.length }, instancias: {} };

for (const inst of INSTANCIAS) {
  try {
    const { page } = await openPage(browser, inst.url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    salida.instancias[inst.id] = {
      forma: inst.forma,
      url: inst.url,
      ejes: await page.evaluate(() => {
        const r = (n) => Math.round(n * 100) / 100;
        const S = (el) => (el ? getComputedStyle(el) : null);
        const q = (s) => document.querySelector(s);

        /** RITMO: lo que un editor podría haber tocado por instancia. */
        const ritmo = (el) => {
          const s = S(el);
          if (!s) return null;
          return [s.marginTop, s.marginBottom, s.paddingTop, s.paddingBottom,
                  s.paddingLeft, s.paddingRight].join(" | ");
        };
        /** TIPOGRAFÍA: lo que distingue un h2 de plantilla de uno con campo. */
        const tipo = (el) => {
          const s = S(el);
          if (!s) return null;
          return [s.fontFamily.split(",")[0], s.fontSize, s.fontWeight, s.lineHeight,
                  s.letterSpacing, s.color, s.textTransform, s.textAlign].join(" | ");
        };
        /** RETÍCULA: el ancho del contenedor, que es lo único de la caja que no
         *  depende del contenido. El ALTO se vuelca aparte y no se juzga. */
        const caja = (el) => (el ? r(el.getBoundingClientRect().width) : null);
        const alto = (el) => (el ? r(el.getBoundingClientRect().height) : null);

        const ejes = {};
        const add = (nombre, el, { conTipo = true } = {}) => {
          ejes[`${nombre}·ritmo`] = ritmo(el);
          if (conTipo) ejes[`${nombre}·tipo`] = tipo(el);
          ejes[`${nombre}·ancho`] = caja(el);
        };

        /* ── cabecera (tb_header) — común a las dos formas ── */
        add("header", q("#main-header"), { conTipo: false });
        ejes["header·alto"] = alto(q("#main-header"));
        add("mainContent", q("#main-content"), { conTipo: false });

        /* ── migas: sección propia, solo en caso ── */
        add("migas.seccion", q(".migas.et_pb_section"), { conTipo: false });
        add("migas.fila", q(".migas .et_pb_row"), { conTipo: false });
        add("migas.texto", q(".migas .et_pb_text_inner"));
        ejes["migas.ol·tipo"] = tipo(q("ol.kunak-breadcrumbs"));

        /* ── el contenedor de contenido: la retícula del cuerpo ── */
        add("container", q("article .container") || q("#main-content .container"), { conTipo: false });
        add("mainTitle", q(".main-title"), { conTipo: false });
        ejes["sobretitulo·tipo"] = tipo(q("p.sobretitulo"));
        ejes["sobretitulo·ritmo"] = ritmo(q("p.sobretitulo"));
        ejes["h1·tipo"] = tipo(q("h1"));
        ejes["h1·ritmo"] = ritmo(q("h1"));
        ejes["h1·ancho"] = caja(q("h1"));
        ejes["h1·y"] = q("h1") ? r(q("h1").getBoundingClientRect().y + window.scrollY) : null;
        ejes["cliente·tipo"] = tipo(q(".case-cliente"));
        ejes["cliente·ritmo"] = ritmo(q(".case-cliente"));
        ejes["chipSector·tipo"] = tipo(q(".case-sectores"));

        /* ── bloques ricos: el CONTENEDOR, nunca un nodo de dentro ──────────
         * ⚠ La primera versión medía `el.querySelector("p")` y sacó varianza en
         * los tres bloques: `text-align` start vs justify. **No era del
         * cascarón**: los `<p>` del corpus traen `style="text-align: justify"`
         * escrito por el editor DENTRO del contenido rico, que está por debajo
         * de la frontera del contenedor de contenido (`CLAUDE.md` §Dónde para el
         * modelado). Medir ahí es medir el contenido y llamarlo plantilla.
         * El eje bueno es el contenedor: lo que un `<p>` sin `style` hereda.
         * El inventario de esos `style` va aparte, en `estiloEnLinea`, y NO se
         * juzga aquí — alimenta §3.1 (alineación: SIN PROBAR) y C-SP9. */
        for (const [n, sel] of [["need", ".entry-content-need"], ["solution", ".entry-content-solution"],
                                ["results", ".entry-content-results"], ["faq", "#left-area .entry-content"]]) {
          const el = q(sel);
          ejes[`bloque.${n}·ritmo`] = ritmo(el);
          ejes[`bloque.${n}·ancho`] = caja(el);
          ejes[`bloque.${n}.h2·tipo`] = tipo(el?.querySelector("h2"));
          const cont = el?.querySelector(".entry-content-bloque") || el;
          ejes[`bloque.${n}.contenedor·tipo`] = tipo(cont);
          ejes[`bloque.${n}.contenedor·ritmo`] = ritmo(cont);
          ejes[`bloque.${n}·alto`] = alto(el); // contexto: NO se juzga
        }

        /* ── secciones propias del caso ── */
        add("detalles.seccion", q("section.case-detalles"), { conTipo: false });
        ejes["detalles.h2·tipo"] = tipo(q(".case-detalles-title"));
        ejes["detalles.txt·tipo"] = tipo(q(".case-detalles-txt p"));
        ejes["detalles.txt·ancho"] = caja(q(".case-detalles-txt"));
        ejes["detalles.mapa·ancho"] = caja(q(".case-detalles-mapa"));
        ejes["detalles.mapa·alto"] = alto(q(".acf-map"));
        add("soluciones.seccion", q("section.case-soluciones"), { conTipo: false });
        ejes["soluciones.h2·tipo"] = tipo(q(".case-soluciones .titulo-puntos"));
        ejes["soluciones.ul·ancho"] = caja(q(".lista-contenido-ul"));

        /* ── el pie, sección a sección (P-C3-1 mide su CONTENIDO aparte) ── */
        const secsPie = [...document.querySelectorAll("footer .et_pb_section")];
        ejes["pie·nSecciones"] = secsPie.length;
        secsPie.forEach((s, i) => {
          ejes[`pie.S${i}·clase`] = [...s.classList].filter((c) => !/^et_pb_section_\d/.test(c)).join(" ");
          ejes[`pie.S${i}·ritmo`] = ritmo(s);
          ejes[`pie.S${i}·ancho`] = caja(s);
          ejes[`pie.S${i}·alto`] = alto(s); // contexto: NO se juzga
        });

        return ejes;
      }),
      /** Inventario, NO eje: los `style` que el editor escribió DENTRO del
       *  contenido rico. Es lo que hizo `mono-inline.mjs` para el monográfico —
       *  separar estilo de tema, de módulo y de editor. Aquí decide si §3.1
       *  necesita alineación (hoy «no medida, SIN PROBAR, no se habilita»). */
      estiloEnLinea: await page.evaluate(() => {
        const cuenta = {};
        const zonas = ".entry-content-need, .entry-content-solution, .entry-content-results, #left-area .entry-content";
        for (const z of document.querySelectorAll(zonas))
          for (const el of z.querySelectorAll("[style]")) {
            const k = `${el.tagName.toLowerCase()} ${el.getAttribute("style").replace(/\s+/g, " ").trim()}`;
            cuenta[k] = (cuenta[k] || 0) + 1;
          }
        return cuenta;
      }),
    };
    await page.close();
    process.stdout.write(`  ✓ ${inst.forma.padEnd(4)} ${inst.id}\n`);
  } catch (e) {
    salida.instancias[inst.id] = { forma: inst.forma, url: inst.url, error: String(e).slice(0, 200) };
    process.stdout.write(`  ⚠ ${inst.id}: ${String(e).slice(0, 120)}\n`);
  }
}
await browser.close();

w(`medidas/c-cascaron-${width}${SUFIJO}.json`, salida);

/* ─────────────────────── el veredicto, por forma ─────────────────────── */

/** Los ejes que NO se juzgan, y por qué: dependen del CONTENIDO, no del cascarón.
 *  Un `·alto` distinto entre dos casos es que uno tiene más texto; `h1·y` se
 *  mueve porque el título de arriba envuelve en dos renglones. Juzgarlos daría
 *  «varianza» en todas las instancias y taparía la pregunta real. */
const NO_JUZGA = (eje) => /·alto$/.test(eje) || eje === "h1·y";

/**
 * Las secciones que el MODELO ya declara opcionales. Que un eje suyo salga
 * `null` en una instancia y con valor en otra **no es varianza del cascarón**:
 * es la ausencia de una sección que el modelo ya representa con un campo.
 *
 * Va aquí escrito, con su cita, y no como excepción silenciosa: es lo que
 * permite que la sonda tenga UN canal de verdad. Toda ausencia que NO case con
 * esta tabla se cuenta y refuta — que es el caso interesante.
 */
const OPCIONAL_EN_MODELO = [
  ["soluciones.", "`soluciones?` — relación 0..n, 53/57 (MODELO.md §1)"],
  ["detalles.mapa", "`ubicacionMapa?` — un punto, 56/57 (MODELO.md §1)"],
];
const declaradoOpcional = (eje) => OPCIONAL_EN_MODELO.find(([p]) => eje.startsWith(p));

let ejesConVarianza = 0;
let ejesComparados = 0;
let ausenciasDeclaradas = 0;
const informe = {};

for (const forma of ["caso", "faq"]) {
  const insts = Object.entries(salida.instancias).filter(([, v]) => v.forma === forma && !v.error);
  if (insts.length < 3) {
    console.log(`\n❌ ${forma}: solo ${insts.length} instancias medidas — P-C3-2 exige ≥3. NO concluye.`);
    ejesConVarianza++; // no poder medir NO es «sin varianza»
    continue;
  }
  const todosEjes = [...new Set(insts.flatMap(([, v]) => Object.keys(v.ejes)))].sort();
  const varia = [];
  const ausentes = [];
  const muertos = [];
  const juzgados = [];
  for (const eje of todosEjes) {
    if (NO_JUZGA(eje)) continue;
    const vals = insts.map(([id, v]) => [id, v.ejes[eje] ?? null]);
    const conValor = vals.filter(([, x]) => x !== null);
    const distintos = [...new Set(conValor.map(([, x]) => JSON.stringify(x)))];
    // ⚠ Un eje `null` en TODAS las instancias es un **selector que no existe**:
    // no mide nada, y por tanto **no puede contarse entre los ejes juzgados**.
    // La primera versión lo saltaba en silencio y lo sumaba igual al total, así
    // que el informe decía «131 ejes con varianza cero» incluyendo tres que
    // nunca miraron nada (`header·*`: el original no tiene `#main-header`).
    // Un eje muerto y un eje limpio daban el mismo número — que es exactamente
    // la regla 1 de `CLAUDE.md` §Tres reglas: lo que imprime y lo que cuenta no
    // pueden discrepar.
    if (conValor.length === 0) { muertos.push(eje); continue; }
    juzgados.push(eje);

    // (1) dos valores distintos entre las que SÍ lo tienen: eso es varianza y
    //     refuta, venga de donde venga.
    if (distintos.length > 1) { varia.push({ eje, vals }); continue; }

    // (2) presente en unas y ausente en otras: solo pasa si el modelo ya lo
    //     declara opcional. Si no, es una sección que aparece o no sin campo
    //     que lo diga — y eso también refuta.
    if (conValor.length < vals.length) {
      const decl = declaradoOpcional(eje);
      if (decl) ausentes.push({ eje, razon: decl[1], faltaEn: vals.filter(([, x]) => x === null).map(([id]) => id) });
      else varia.push({ eje, vals });
    }
  }
  ejesComparados += juzgados.length;
  ejesConVarianza += varia.length;
  ausenciasDeclaradas += ausentes.length;
  informe[forma] = {
    instancias: insts.length, ejesJuzgados: juzgados.length,
    conVarianza: varia.length, ausenciasDeclaradas: ausentes.length,
    ejesMuertos: muertos,
  };

  console.log(`\n═══ ${forma.toUpperCase()} · ${insts.length} instancias @${width} · ${juzgados.length} ejes juzgados`);
  if (!varia.length) {
    console.log(`  ✅ varianza CERO en los ${juzgados.length - ausentes.length} ejes con valor en todas`);
  } else {
    for (const { eje, vals } of varia) {
      console.log(`  ❌ ${eje}`);
      for (const [id, v] of vals) console.log(`       ${String(v)}   ← ${id}`);
    }
  }
  if (ausentes.length) {
    console.log(`  · ${ausentes.length} ejes de sección OPCIONAL (mismo valor donde existe; el modelo ya los declara):`);
    for (const { eje, razon, faltaEn } of ausentes)
      console.log(`      ${eje.padEnd(28)} falta en ${faltaEn.length} → ${razon}`);
  }
  if (muertos.length) {
    console.log(`  ⚠ ${muertos.length} ejes MUERTOS (selector inexistente en esta forma — NO cuentan como limpios):`);
    console.log(`      ${muertos.join(" · ")}`);
  }
}

/* ── el inventario de `style` en línea: se imprime, no se juzga ── */
const enLinea = {};
for (const v of Object.values(salida.instancias))
  for (const [k, n] of Object.entries(v.estiloEnLinea || {})) enLinea[k] = (enLinea[k] || 0) + n;
salida.estiloEnLineaTotal = enLinea;
console.log(`\n─── \`style\` en línea DENTRO del contenido rico (inventario, no eje del cascarón)`);
if (!Object.keys(enLinea).length) console.log("  (ninguno)");
for (const [k, n] of Object.entries(enLinea).sort((a, b) => b[1] - a[1]))
  console.log(`  ×${String(n).padStart(3)}  ${k}`);

salida.veredicto = informe;
w(`medidas/c-cascaron-${width}${SUFIJO}.json`, salida);

console.log(
  `\n${ejesConVarianza === 0 ? "✅ P-C3-2 SE SOSTIENE" : "❌ P-C3-2 REFUTADA"} @${width} · ` +
    `${ejesComparados} ejes comparados · ${ejesConVarianza} con varianza · ` +
    `${ausenciasDeclaradas} ausencias que el modelo ya declara\n` +
    `   (los ejes ·alto y h1·y se vuelcan al JSON y NO se juzgan: dependen del contenido)`,
);
process.exit(ejesConVarianza === 0 ? 0 : 1);
