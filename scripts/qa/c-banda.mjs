/**
 * C-QA1 — LA BANDA DE TÍTULO, por composición. **Mide, no arregla.**
 * Uso: npm run qa:banda -- [ancho]        (necesita el clon en :3000)
 *
 * ── Qué falta saber, y por qué el congelado no lo trae ─────────────────────
 * `c-cabecera` midió el **total** de `header.et-l--header`: 387 en el caso, 225
 * en la FAQ, 397.61 en el sector, contra los 203.59 que sirve el clon siempre.
 * Eso basta para decir que hay un defecto, y no basta para arreglarlo: un total
 * es justo el nivel donde caben dos errores anulándose (`CLAUDE.md` §El
 * principio). Para construir la banda hace falta saber **de qué está hecha**.
 *
 * La pregunta concreta, que decide el arreglo:
 *
 *   > ¿las migas del caso están DENTRO de la cabecera del original o en el
 *   > cuerpo? Según la respuesta, la banda del clon mide 387 y las migas van
 *   > debajo, o mide menos y las migas van dentro.
 *
 * Se contesta mirando los hijos, no suponiendo.
 *
 * ── Y el segundo número que hay que sacar, que casi se me escapa ───────────
 * El sector cuadra porque `section.cabecera-sectores` reproduce el alto ENTERO
 * de la cabecera del original (397.59 ≈ 397.61) con el `h1` dentro, a su
 * offset. El caso y la FAQ tienen el `h1` FUERA de la cabecera, así que su
 * banda es un hueco, y lo que hay que igualar es **dónde empieza el cuerpo**:
 * `yAreaPrincipal` del original (387 · 225) contra los 0 del clon.
 *
 * Por eso se mide el offset del `h1` DENTRO del cuerpo en los dos lados. Si ese
 * offset ya coincide, el arreglo es exactamente un hueco del alto de la
 * cabecera y nada más; si no coincide, hay un segundo defecto debajo y meter el
 * hueco lo taparía — que es cómo se fabrica un Δ0 con dos errores dentro.
 *
 * ── Selectores ─────────────────────────────────────────────────────────────
 * `header.et-l--header` está verificado en los dos lados (C-QA1). Del resto no
 * se supone nada: se vuelca el árbol somero con tag/clase/alto y se lee. Un
 * selector inventado para «las migas» sería C-SP16 otra vez.
 */
import { Censo, envRutas, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";

/**
 * Una instancia por FORMA, más los dos controles que ya sabemos leer.
 * No hacen falta las 17: la pregunta es de plantilla, y C-QA1 ya demostró que
 * las 4 del caso dan el mismo 387 y las 2 de la FAQ el mismo 225.
 */
const PORDEFECTO = [
  "/casos-de-exito/red-calidad-de-aire-para-world-athletics", // CASO (prefijo es)
  "/case-studies/distrito-baja-emision-rio-de-janeiro", //        CASO (prefijo en)
  "/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento", // FAQ
  "/sectores/calidad-del-aire-en-las-ciudades", //                CONTROL: el que ya cuadra
  "/kunak-api", //                                               CONTROL: producto (C-QA2)
];
const RUTAS = (envRutas("SOLO") || PORDEFECTO).map((r) => ({
  clon: r,
  orig: `https://kunakair.com/es${r === "/" ? "" : r}/`,
}));
if (!RUTAS.length) {
  console.error("\n❌ 0 rutas que medir. No se mide, no se escribe, no hay veredicto.\n");
  process.exit(2);
}

const LECTOR = () => {
  const r = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);
  const rect = (el) => el.getBoundingClientRect();
  const y = (el) => r(rect(el).top + window.scrollY);
  const txt = (el, n = 46) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const desc = (el) => ({
    tag: el.tagName.toLowerCase(),
    clase: (el.className || "").toString().split(/\s+/).filter(Boolean).slice(0, 3).join(" ").slice(0, 52),
    id: el.id || null,
    alto: r(rect(el).height),
    y: y(el),
    position: getComputedStyle(el).position,
    txt: txt(el),
  });

  const cab = __q("header.et-l--header");
  const h1 = __q("h1");
  /** El contenedor de flujo de cada lado. El clon no tiene `#et-main-area`. */
  const cuerpo = __q("#et-main-area") || __q("main");

  return {
    cabecera: cab
      ? {
          ...desc(cab),
          enFlujo: ["static", "relative"].includes(getComputedStyle(cab).position),
          /** De qué está hecha: sus hijos directos, que es lo que decide el arreglo. */
          hijos: [...cab.children].map(desc),
        }
      : null,

    h1: h1 ? { ...desc(h1), dentroDeCabecera: !!(cab && cab.contains(h1)) } : null,

    cuerpo: cuerpo
      ? {
          ...desc(cuerpo),
          /** Los primeros hijos del cuerpo: dónde caen las migas de verdad. */
          hijos: [...cuerpo.children].slice(0, 4).map(desc),
        }
      : null,

    /**
     * ⚠ **El número que decide si el arreglo es UNO o DOS.** El offset del `h1`
     * dentro del contenedor de flujo. Si coincide en los dos lados, todo el
     * desfase está en dónde EMPIEZA el cuerpo y el arreglo es un hueco. Si no
     * coincide, hay algo más debajo y el hueco lo taparía.
     */
    h1DentroDelCuerpo: h1 && cuerpo ? r(y(h1) - y(cuerpo)) : null,
    yCuerpo: cuerpo ? y(cuerpo) : null,

    /**
     * ⚠ **La cadena del `h1` hasta el cuerpo, eslabón a eslabón.** El offset
     * total (145.19 vs 140.59) dice que sobran −4.6 y no dice dónde: es un
     * total, o sea el nivel donde caben dos errores anulándose. Esto lo abre.
     *
     * De cada ancestro sale su `y`, su alto, y **cuánto empieza el hijo por
     * debajo del padre** (`sangria`) — que es la suma de padding, borde y de
     * lo que haya de hermanos antes. Ahí es donde vive un desfase de 4.6, no
     * en el número de arriba.
     */
    cadena: (() => {
      if (!h1 || !cuerpo) return null;
      const escalones = [];
      let el = h1;
      while (el && el !== cuerpo && el !== document.body) {
        const padre = el.parentElement;
        if (!padre) break;
        const s = getComputedStyle(padre);
        escalones.push({
          padre: `${padre.tagName.toLowerCase()}.${(padre.className || "").toString().split(/\s+/)[0] || "—"}`.slice(0, 38),
          padreY: y(padre),
          padreAlto: r(rect(padre).height),
          hijo: `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(/\s+/)[0] || "—"}`.slice(0, 34),
          hijoY: y(el),
          /** cuánto cae el hijo por debajo del borde superior del padre */
          sangria: r(y(el) - y(padre)),
          pt: s.paddingTop,
          mt: getComputedStyle(el).marginTop,
          /**
           * Hermanos que van ANTES del hijo: la otra fuente de sangría.
           *
           * ⚠ Van con **la lista de clases entera y su relleno**, no con la
           * primera clase. Leyendo solo la primera, el hermano de las migas del
           * caso salía `div.migas` a 1440 y `div.et-l` a 390 — que se lee como
           * «el original sirve otro DOM en móvil» y **no lo es**: son dos
           * elementos distintos, cada uno oculto en el otro ancho. Un `antes`
           * abreviado convierte una diferencia de clase en una hipótesis sobre
           * el servidor.
           */
          antes: [...padre.children]
            .slice(0, [...padre.children].indexOf(el))
            .map((n) => {
              const s = getComputedStyle(n);
              return {
                tag: n.tagName.toLowerCase(),
                clase: (n.className || "").toString().slice(0, 70),
                alto: r(rect(n).height),
                display: s.display,
                pt: s.paddingTop,
                pb: s.paddingBottom,
                txt: txt(n, 40),
              };
            }),
        });
        el = padre;
      }
      return escalones.reverse();
    })(),

    /**
     * ⚠ **Las migas, que NO son las mismas en las dos plantillas.** El caso las
     * trae en `div.migas` (sección del tema) y el producto en un
     * `et_pb_section` del builder. En el clon las pinta **un solo componente**
     * (`Breadcrumb`), y ahí es donde el parecido engaña:
     *
     *   producto: original 50    · clon 50     → cuadra
     *   caso:     original 54.59 · clon 50     → −4.59 a 1440
     *             original 85.19 · clon 102    → +16.81 a 390, y cambia de signo
     *
     * Un residuo que cambia de signo entre anchos no es un `padding`: es el
     * texto envolviendo distinto. Por eso hace falta la tipografía, no el alto.
     */
    migas: (() => {
      const m = __q(".migas") || __q("nav[aria-label='Migas de pan']");
      if (!m) return null;
      const caja = m.getBoundingClientRect();
      /** el nodo que de verdad lleva el texto: el `ol`, o el `_inner` de Divi */
      const t = m.querySelector("ol") || m.querySelector(".et_pb_text_inner") || m;
      const st = getComputedStyle(t);
      const ct = t.getBoundingClientRect();
      /** la fila: el ancestro que fija la retícula */
      const fila = m.querySelector(".et_pb_row") || (t.parentElement ?? t);
      const sf = getComputedStyle(fila);
      return {
        alto: r(caja.height),
        clase: (m.className || "").toString().slice(0, 70),
        texto: { alto: r(ct.height), ancho: r(ct.width), fontSize: st.fontSize, lineHeight: st.lineHeight, fontWeight: st.fontWeight, letterSpacing: st.letterSpacing },
        fila: { ancho: r(fila.getBoundingClientRect().width), pt: sf.paddingTop, pb: sf.paddingBottom },
        /** renglones = alto del texto / interlínea. Es lo que cambia de signo. */
        renglones: st.lineHeight.endsWith("px") ? r(ct.height / parseFloat(st.lineHeight)) : null,
      };
    })(),

    docH: r(document.documentElement.scrollHeight),
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10), rutas: RUTAS.length }, paginas: {} };

for (const R of RUTAS) {
  const lee = async (url) => {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR);
    await page.close();
    return datos;
  };
  try {
    salida.paginas[R.clon] = { orig: await lee(R.orig), clon: await lee(CLON + R.clon) };
    console.log(`  ✓ ${R.clon}`);
  } catch (e) {
    salida.paginas[R.clon] = { error: String(e).slice(0, 160) };
    console.log(`  ⚠ ${R.clon}: ${String(e).slice(0, 110)}`);
  }
}
await browser.close();

const muertos = censo.informe(`@${width}`);

/* ── (a) de qué está hecha la cabecera del original ── */
console.log(`\n═══ (a) LA CABECERA POR DENTRO @${width}`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  console.log(`\n  ${ruta}`);
  for (const lado of ["orig", "clon"]) {
    const c = v[lado].cabecera;
    console.log(
      `    ${lado.padEnd(4)} header ${String(c?.alto).padStart(7)} ${c?.enFlujo ? "EN FLUJO" : "fuera   "}` +
        `  → cuerpo empieza en ${String(v[lado].yCuerpo).padStart(7)}`,
    );
    for (const h of c?.hijos ?? []) {
      console.log(`           · ${h.tag}.${h.clase || "—"} alto=${h.alto} y=${h.y} "${h.txt.slice(0, 34)}"`);
    }
  }
}

/* ── (b) los primeros hijos del cuerpo: dónde caen las migas ── */
console.log(`\n═══ (b) LOS PRIMEROS HIJOS DEL CUERPO @${width}`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  console.log(`\n  ${ruta}`);
  for (const lado of ["orig", "clon"]) {
    console.log(`    ${lado}:`);
    for (const h of v[lado].cuerpo?.hijos ?? []) {
      console.log(`      · ${h.tag}.${(h.clase || h.id || "—").slice(0, 30)} alto=${h.alto} y=${h.y} "${h.txt.slice(0, 40)}"`);
    }
  }
}

/* ── (c) EL VEREDICTO: ¿es un defecto o son dos? ── */
console.log(`\n═══ (c) ¿UN DEFECTO O DOS? — offset del \`h1\` DENTRO del cuerpo @${width}`);
console.log(`  ${"ruta".padEnd(48)} ${"cuerpo o→c".padEnd(20)} ${"h1 en cuerpo o→c".padEnd(24)} ¿un hueco basta?`);
let dobles = 0;
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  const dCuerpo = +(v.clon.yCuerpo - v.orig.yCuerpo).toFixed(2);
  const dDentro = +(v.clon.h1DentroDelCuerpo - v.orig.h1DentroDelCuerpo).toFixed(2);
  const basta = dDentro === 0;
  if (!basta) dobles++;
  console.log(
    `  ${ruta.slice(0, 47).padEnd(48)} ` +
      `${`${v.orig.yCuerpo}→${v.clon.yCuerpo}`.padEnd(20)} ` +
      `${`${v.orig.h1DentroDelCuerpo}→${v.clon.h1DentroDelCuerpo}`.padEnd(24)} ` +
      `${basta ? `SÍ · hueco de ${(-dCuerpo).toFixed(2)}` : `NO · sobra Δ${dDentro > 0 ? "+" : ""}${dDentro} DEBAJO`}`,
  );
}
console.log(
  dobles
    ? `\n  ⚠ ${dobles} ruta(s) con desfase TAMBIÉN dentro del cuerpo: meter el hueco sin\n` +
        `     corregir eso fabrica un Δ0 con dos errores dentro. Van por separado.`
    : `\n  ✅ el desfase está ENTERO en dónde empieza el cuerpo: un solo defecto, un solo arreglo.`,
);

/* ── (d) y DÓNDE está ese resto: la cadena del `h1`, eslabón a eslabón ── */
console.log(`\n═══ (d) LA CADENA DEL \`h1\` @${width} — dónde se acumula la sangría`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error) continue;
  console.log(`\n  ${ruta}`);
  for (const lado of ["orig", "clon"]) {
    console.log(`    ${lado}:`);
    for (const e of v[lado].cadena ?? []) {
      console.log(
        `      ${e.padre.padEnd(38)} y=${String(e.padreY).padStart(8)}  →  ${e.hijo.padEnd(32)}` +
          ` sangría=${String(e.sangria).padStart(7)}  pt=${e.pt} mt=${e.mt}`,
      );
      for (const n of e.antes) {
        console.log(
          `           antes · ${n.tag}.${n.clase || "—"} alto=${n.alto} display=${n.display}` +
            ` pt=${n.pt} pb=${n.pb} "${n.txt}"`,
        );
      }
    }
  }
}

/* ── (e) las migas, que en el clon las pinta un componente compartido ── */
console.log(`\n═══ (e) LAS MIGAS @${width} — alto, tipografía y RENGLONES`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error || (!v.orig.migas && !v.clon.migas)) continue;
  console.log(`\n  ${ruta}`);
  for (const lado of ["orig", "clon"]) {
    const m = v[lado].migas;
    if (!m) { console.log(`    ${lado}: (sin migas)`); continue; }
    console.log(
      `    ${lado.padEnd(4)} alto=${String(m.alto).padStart(7)}  fila ancho=${String(m.fila.ancho).padStart(7)} pt=${m.fila.pt} pb=${m.fila.pb}\n` +
        `         texto ${m.texto.fontSize}/${m.texto.lineHeight} w${m.texto.fontWeight} ls=${m.texto.letterSpacing}` +
        ` · ancho=${m.texto.ancho} · alto=${m.texto.alto} · RENGLONES=${m.renglones}`,
    );
  }
  const o = v.orig.migas, c = v.clon.migas;
  if (o && c) {
    const d = +(c.alto - o.alto).toFixed(2);
    console.log(`    Δ alto = ${d > 0 ? "+" : ""}${d}${d === 0 ? "  ✅" : `   (renglones ${o.renglones} → ${c.renglones}, interlínea ${o.texto.lineHeight} → ${c.texto.lineHeight})`}`);
  }
}

w(`medidas/c-banda-${width}.json`, salida);
process.exit(muertos ? 2 : 0);
