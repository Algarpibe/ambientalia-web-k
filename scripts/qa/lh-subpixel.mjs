/**
 * LOS RESIDUOS SUB-PÍXEL DEL PAGINADOR — **de dónde salen**, no cuántos son.
 * Uso: node scripts/qa/lh-subpixel.mjs        (npm run qa:lh-subpixel)
 *      SABOTAJE=<x> node …                    (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE: «0.03 px huele a coma flotante» NO ES UN MECANISMO
 *
 * `CLAUDE.md` dice que **sin campaña de ruido para esas rutas un residuo
 * pequeño no es «limpio»: es SIN PROBAR**. Y dice también cómo sale de ahí sin
 * entrar en defecto —como el −30 de EDAR—: **nombrando el mecanismo**. Esta
 * sonda hace exactamente eso y nada más. No arregla nada, no mueve un píxel.
 *
 * ── Lo que deriva, y es una sola frase con dos mitades ────────────────────
 * **(a) Hay UN residuo, no 155.** El único elemento de toda la comparación
 * —82 páginas × 2 anchos— cuyo ancho difiere en centésimas es
 * `span.pages` («Page N of M»): **31 de los 31** pares `.rect.w` sub-píxel son
 * suyos, y **0** están fuera de `paginador`.
 *
 * **(b) Los demás son su ARITMÉTICA.** Las piezas de la piel B son
 * `inline-block` con `margin: 2px`, así que
 *
 *     x(i+1) = x(i) + w(i) + 2 + 2
 *
 * y un Δw de 0.03 en la **primera** pieza desplaza 0.03 a **todas** las
 * siguientes. Los 124 pares de `.rect.x` (@1440) y 116 (@390) no son 124
 * residuos: son **el mismo**, propagado. La sonda lo comprueba pieza a pieza
 * contra el acumulado, que es lo que convierte la explicación en una medida.
 *
 * ── Y LO QUE NO DERIVA, dicho con la lista de canales (regla del cero) ────
 * **De dónde sale el 0.03 mismo NO está establecido.** Canales mirados:
 *
 * | canal | qué dice |
 * |---|---|
 * | `.rect.w` fuera de `paginador` | **0** pares sub-píxel: no es un desvío global de métrica |
 * | `span.extend` («...»), la otra caja de ancho de texto de la misma pieza | **idéntica** en los dos lados ⇒ no todo el texto se desvía |
 * | `.rect.y` sub-píxel | **0**: el fenómeno es horizontal, no de ritmo |
 *
 * Queda fuera de alcance el **fichero de la fuente**: el clon sirve Manrope
 * re-emitida por `next/font` y el original la del tema, y comparar sus avances
 * de glifo exige un canal que esta comparación no tiene. Así que el residuo se
 * queda **fichado con su número y sin tocar** — que es la instrucción.
 *
 * ⚠ **No confundir las dos afirmaciones:** *«los 124 `.x` están explicados»*
 * está medido aquí; *«los 31 `.w` son ruido»* **no lo dice nadie** — sin
 * campaña siguen SIN PROBAR.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // lee congeladas: ni red ni clon
gritaSiRevienta();

const SABOTAJES = ["sin-cmp", "propagacion-mal", "otro-elemento"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const M = join(QA, "medidas");
/** Suelo de lo que cuenta como sub-píxel. Por encima es la clase de la VENTANA. */
const SUB = 0.05;
/** Los dos `margin: 2px` que separan dos piezas `inline-block` consecutivas. */
const MARGENES = 4;

/**
 * El conjunto de congeladas se **DERIVA**, no se enumera (§regla 9, 7.ª
 * instancia): `lh-cmp` nombra su salida `lh-cmp-<ancho><-todas?><-vivo?>[-FECHA]`
 * y una lista escrita a mano nace incompleta.
 *
 * ⚠⚠ **PERO «LA ÚLTIMA» NO ES «LA ÚLTIMA POR ORDEN ALFABÉTICO», Y LA PRIMERA
 * VERSIÓN DE ESTA SONDA LO ERA (2026-08-17).** Con `.sort()` y `cs.at(-1)`
 * eligió **`lh-cmp-1440.json`** —el nombre canónico, que por la guarda de `w()`
 * conserva **la PRIMERA foto**— y salió con `0 pares distintos`: la sonda se
 * declaró incapaz de explicar nada… leyendo el fichero equivocado. `-` (0x2D)
 * ordena antes que `.` (0x2E), así que el canónico cae SIEMPRE al final.
 *
 * Es §*`<nombre>.json` significa «la primera foto», no «el estado de hoy»*
 * cobrada dentro de un instrumento nuevo, y no dio error: dio ceros.
 *
 * La recencia se **deriva de la FECHA del nombre**, no del orden del sistema de
 * ficheros: `(fecha, secuencia)` descendente, y el canónico sin fecha va el
 * último porque es el más viejo. Se publica **cuál se eligió y cuántos
 * candidatos había**, para que una elección mala se vea en la congelada.
 */
const ARTEFACTO = /-neg-|SABOTAJE|SONDA-|CONTAMINADA|OBSOLETA|INTERRUMPIDA/;
const PATRON = (ancho) => new RegExp(`^lh-cmp-${ancho}(-todas)?(-vivo)?(-(\\d{4}-\\d{2}-\\d{2})(-(\\d+))?)?\\.json$`);
const candidatasCmp = (ancho) =>
  readdirSync(SABOTAJE === "sin-cmp" ? join(QA, "no-existe") : M)
    .filter((x) => PATRON(ancho).test(x) && !ARTEFACTO.test(x))
    .map((x) => {
      const m = PATRON(ancho).exec(x);
      return { f: x, fecha: m[4] ?? "0000-00-00", seq: Number(m[6] ?? 1) };
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.seq - a.seq);

/** Los dos anchos de FIDELIDAD del proyecto. El mínimo se DERIVA de aquí, no se
 *  escribe: si algún día entra un tercero, el listón sube solo (§regla 9). */
const ANCHOS = [1440, 390];

const informe = { meta: {}, porAncho: {} };
const ev = new Evaluadas({ nombre: "lh-subpixel", unidad: "anchos", minimo: ANCHOS.length });

for (const ancho of ANCHOS) {
  const cands = candidatasCmp(ancho);
  const fCmp = cands.length ? cands[0].f : null;
  if (!fCmp)
    throw new Error(
      `SIN COMPARADOR para @${ancho}: no hay ninguna congelada 'lh-cmp-${ancho}*.json' en medidas/.\n` +
        `  Sin ella esta sonda derivaría CERO residuos, que se lee como «no hay nada que explicar»\n` +
        `  en vez de como «no miré» (§sondas 4bis).`,
    );
  const fEsp = `lh-espejo-${ancho}.json`;
  if (!existsSync(join(M, fEsp))) throw new Error(`falta medidas/${fEsp}: sin el espejo no se puede resolver a QUÉ elemento pertenece cada camino`);

  const cmp = JSON.parse(readFileSync(join(M, fCmp), "utf8"));
  const esp = JSON.parse(readFileSync(join(M, fEsp), "utf8"));

  /* Sólo los que el comparador cuenta como DEFECTO: los `noEsDefecto` del eje
     mixto no son residuos que explicar. Contarlos daría 802 donde hay 443. */
  const dif = [];
  for (const [clave, F] of Object.entries(cmp.formas ?? {}))
    for (const d of F.diferencias ?? []) if (!d.noEsDefecto) dif.push({ forma: clave, ...d });

  const numer = dif.filter((p) => typeof p.referencia === "number" && typeof p.clon === "number");
  const sub = numer.filter((p) => p.clon !== p.referencia && Math.abs(p.clon - p.referencia) <= SUB);

  /* (a) ¿de qué ELEMENTO es cada `.rect.w` sub-píxel? Se resuelve la marca en el
     espejo en vez de fiarse del nombre del camino. */
  const marcaDe = (forma, camino) => {
    let nodo = esp.paginas?.[forma];
    for (const seg of camino.split(".")) nodo = nodo?.[seg];
    return nodo?.marca ?? nodo?.sel ?? null;
  };
  const anchos = sub.filter((p) => p.camino.endsWith(".rect.w"));
  const porMarca = {};
  for (const p of anchos) {
    const m = SABOTAJE === "otro-elemento" ? "div.inventado" : marcaDe(p.forma, p.camino.replace(/\.rect\.w$/, "")) ?? "«sin resolver»";
    porMarca[m] = (porMarca[m] ?? 0) + 1;
  }

  /* (b) la ARITMÉTICA: por forma, Δx de cada pieza contra el acumulado de los Δw
     anteriores. Se declaran las tres salidas por separado, porque «casa» y «no
     se puede observar» no son lo mismo (§regla del cero).
     ⚠ **Y el dominio se ACOTA a las formas cuyo paginador SÓLO tiene residuos
     sub-píxel**, con su cardinal. Donde además hay un defecto de otra clase —la
     VENTANA— los índices de pieza no se corresponden entre los dos lados, así
     que el acumulado se calcularía sobre parejas que no son la misma pieza: la
     aritmética «fallaría» por un defecto que esta sonda no explica ni pretende.
     Sin este recorte, la sonda saldría roja mientras exista cualquier otro
     defecto de paginador, que es un instrumento que sólo puede dar verde cuando
     ya no hace falta. */
  /* ⚠ El dominio se cuenta sobre **`paginador.piezas.*`**, no sobre
     `paginador.*`. Lo segundo arrastra `hrefs` y `linkNextDelHead`, que difieren
     en TODAS las formas por la §Regla de rutas locales —el original sirve
     `https://kunakair.com/es/…` y el clon `/…`— y no son geometría: contarlos
     dejaba el dominio en **0 de 56** y la aritmética sin dónde comprobarse. Es
     también la unidad en la que la ficha cuenta sus 443. */
  const paginador = {};
  for (const [clave, F] of Object.entries(cmp.formas ?? {}))
    for (const d of F.diferencias ?? []) {
      if (d.noEsDefecto || !/^paginador\.piezas\./.test(d.camino)) continue;
      const esSub = typeof d.referencia === "number" && typeof d.clon === "number" && d.clon !== d.referencia && Math.abs(d.clon - d.referencia) <= SUB;
      (paginador[clave] ??= { total: 0, sub: 0 }).total++;
      if (esSub) paginador[clave].sub++;
    }
  const soloSub = Object.entries(paginador).filter(([, v]) => v.sub > 0 && v.sub === v.total).map(([k]) => k);

  /**
   * ⚠ **LA COTA DE REDONDEO SE DERIVA, NO SE AFLOJA A OJO.** El barrido congela
   * `rect` con 2 decimales, así que cada valor trae ±0.005 de error de
   * almacenamiento. Una DIFERENCIA de dos valores redondeados trae ±0.01, y
   * comparar dos de esas diferencias (Δx contra el acumulado de Δw) trae
   * **±0.02**. Ésa es la cota, y sale de la aritmética del redondeo, no de
   * cuánto haga falta para que salga verde.
   *
   * Se publican **las dos** clases por separado —lo que cierra exacto y lo que
   * sólo cierra dentro de la cota— porque colapsarlas en un único umbral es
   * cómo un residuo real se disfraza de redondeo. Medido: los fallos con
   * tolerancia estricta eran **todos** de ±0.01, o sea un dígito en la última
   * decimal guardada.
   */
  const EXACTO = 0.005;
  const COTA_REDONDEO = 0.02;
  const prop = { dominio: soloSub.length, casan: 0, casanDentroDeLaCota: 0, noObservables: 0, fallan: 0, fallos: [] };
  for (const forma of soloSub) {
    const g = esp.paginas?.[forma]?.paginador;
    if (!g?.piezas) continue;
    const d = new Map();
    for (const p of sub.filter((x) => x.forma === forma)) d.set(p.camino, +(p.clon - p.referencia).toFixed(4));
    /**
     * ⚠ **LA PROPAGACIÓN ES POR RENGLÓN, NO POR PAGINADOR — y lo enseñó 390.**
     * A 1440 la piel B cabe en una línea y el acumulado cierra de punta a punta.
     * A 390 **envuelve en dos renglones** (`312 × 80`, medido en
     * `listado-tema-cpt.spec.md` §3), y las piezas del segundo arrancan en el
     * borde izquierdo del contenedor — **el mismo en los dos lados**—, así que
     * NO heredan el desplazamiento: su Δx es 0 con un acumulado de 0.03.
     *
     * La primera versión de esta sonda las contaba como FALLO (11 a 390, 0 a
     * 1440), que es justo la forma de leer un mecanismo bien explicado como si
     * estuviera mal: el modelo no era falso, era **incompleto en un ancho**.
     *
     * ⚠ Y el renglón se detecta por el **CENTRO vertical**, no por la `y`: dentro
     * de un mismo renglón las piezas **no comparten `y`** porque no miden lo
     * mismo —`span.pages` y `span.extend` miden 27 de alto y las píldoras 36—,
     * así que un `y > yPrevia` salta en cada cambio de tipo de pieza. Medirlo por
     * `y` metía 4 falsos a 1440, donde el paginador NO envuelve: el arreglo del
     * ancho que fallaba estrenó un defecto en el que ya iba bien (§*cada arreglo
     * de una sonda vuelve a correr el test en negativo, entero*).
     */
    const centro = (pz) => (pz.rect?.h ? pz.rect.y + pz.rect.h / 2 : null);
    /** Un renglón nuevo mueve el centro ~40 px; el desajuste 27-vs-36 mueve 1.5. */
    const SALTO_DE_RENGLON = 10;
    let acum = 0;
    let centroPrevio = null;
    g.piezas.forEach((pz, i) => {
      const c = centro(pz);
      if (c != null && centroPrevio != null && c > centroPrevio + SALTO_DE_RENGLON) acum = 0;
      if (c != null) centroPrevio = c;
      const dx = d.get(`paginador.piezas.${i}.rect.x`) ?? 0;
      const dw = d.get(`paginador.piezas.${i}.rect.w`) ?? 0;
      const esperado = SABOTAJE === "propagacion-mal" ? acum + 1 : acum;
      /* Una pieza con caja 0 (`display:none`: `«` y `»`) no tiene `x` que
         desplazar, y un acumulado por debajo de la centésima no puede aparecer en
         un número redondeado a 2 decimales. Ni una cosa ni la otra es un fallo:
         es que ahí no se puede observar. */
      const invisible = pz.rect?.w === 0 && pz.rect?.h === 0;
      if (invisible || (dx === 0 && Math.abs(esperado) < 0.025)) prop.noObservables++;
      else if (Math.abs(dx - esperado) <= EXACTO) prop.casan++;
      else if (Math.abs(dx - esperado) <= COTA_REDONDEO) prop.casanDentroDeLaCota++;
      else {
        prop.fallan++;
        if (prop.fallos.length < 8) prop.fallos.push(`${forma} pieza ${i} (${pz.marca}): Δx ${dx} contra acumulado ${+acum.toFixed(4)}`);
      }
      acum += dw;
    });
  }

  informe.porAncho[ancho] = {
    comparador: fCmp,
    /* Cuál se eligió y de cuántas: sin esto, leer el fichero equivocado da
       ceros y los ceros se leen como dato (§sondas 4). */
    candidatas: cands.length,
    candidatasDescartadas: cands.slice(1, 4).map((c) => c.f),
    paresDistintos: dif.length,
    numericos: numer.length,
    subPixel: sub.length,
    umbral: SUB,
    /* (a) el residuo: UNO, y su elemento */
    anchosSubPixel: anchos.length,
    porMarca,
    anchosSubPixelFueraDelPaginador: anchos.filter((p) => !/^paginador/.test(p.camino)).length,
    deltasDeAncho: [...new Set(anchos.map((p) => +(p.clon - p.referencia).toFixed(4)))].sort((a, b) => a - b),
    /* (b) las consecuencias: su aritmética, con el dominio DECLARADO */
    xSubPixel: sub.filter((p) => p.camino.endsWith(".rect.x")).length,
    formasConPaginadorDistinto: Object.keys(paginador).length,
    formasSoloSubPixel: soloSub.length,
    /* Las que quedan fuera del dominio de la aritmética y por qué: ahí hay OTRO
       defecto y los índices de pieza no se corresponden. Se nombra el cardinal
       en vez de callarlo (regla 14). */
    formasConOtroDefectoDePaginador: Object.keys(paginador).length - soloSub.length,
    propagacion: prop,
    /* los canales que dicen que NO es un desvío global */
    ySubPixel: sub.filter((p) => p.camino.endsWith(".rect.y")).length,
    extendConAnchoDistinto: anchos.filter((p) => (marcaDe(p.forma, p.camino.replace(/\.rect\.w$/, "")) ?? "").includes("extend")).length,
    /* y lo que NO es sub-píxel, para que el denominador esté a la vista */
    sobreElUmbral: numer.filter((p) => Math.abs(p.clon - p.referencia) > SUB).length,
    noNumericos: dif.length - numer.length,
  };
  ev.ok();
}

informe.meta = {
  fecha: hoy(),
  que: "de dónde salen los residuos SUB-PÍXEL del paginador de listados — un residuo y sus consecuencias aritméticas",
  fuente: "medidas/lh-cmp-<ancho>*.json (la última congelada de cada ancho, derivada) + medidas/lh-espejo-<ancho>.json",
  porQue:
    "§sin campaña de ruido un residuo pequeño NO es «limpio», es SIN PROBAR — y sale de ahí NOMBRANDO el mecanismo, " +
    "como el −30 de EDAR. Aquí el mecanismo explica los `.x` y NO explica los `.w`, y las dos mitades se dicen aparte.",
  sabotaje: SABOTAJE,
  noMide: [
    "el FICHERO de la fuente: el clon sirve Manrope por `next/font` y el original la del tema. Comparar avances de glifo exige un canal que esta comparación no tiene",
    "el RUIDO de estas rutas: no hay campaña, así que los 31 pares de `span.pages` siguen SIN PROBAR — ni defecto ni limpios",
    "los anchos intermedios: ahí el contrato es de RANGO",
    "nada del clon en vivo: esta sonda no abre página, lee congeladas",
  ],
};

console.log(`\n════════ LISTADOS · EL SUB-PÍXEL DEL PAGINADOR ════════`);
console.log(`  ⚠ esto NO arregla nada: nombra el mecanismo para que 155 residuos dejen de contarse como 155.\n`);
const rojos = [];
for (const [ancho, d] of Object.entries(informe.porAncho)) {
  const marcas = Object.entries(d.porMarca).map(([k, v]) => `${k} ×${v}`).join(" · ") || "—";
  console.log(`  ── @${ancho}  (${d.comparador})`);
  console.log(`     pares distintos ${d.paresDistintos} · numéricos ${d.numericos} · SUB-PÍXEL ${d.subPixel} (umbral ${d.umbral})`);
  console.log(`     (a) los ${d.anchosSubPixel} \`.rect.w\` son de: ${marcas}   · fuera de \`paginador\`: ${d.anchosSubPixelFueraDelPaginador} · Δ ${d.deltasDeAncho.join(" · ")}`);
  console.log(
    `     (b) los ${d.xSubPixel} \`.rect.x\`: casan exacto ${d.propagacion.casan} · dentro de la cota de redondeo ${d.propagacion.casanDentroDeLaCota} · no observables ${d.propagacion.noObservables} · FALLAN ${d.propagacion.fallan}` +
      `   [dominio: ${d.formasSoloSubPixel} de ${d.formasConPaginadorDistinto} formas — las otras ${d.formasConOtroDefectoDePaginador} tienen OTRO defecto y sus índices de pieza no se corresponden]`,
  );
  console.log(`     canales que descartan un desvío global: \`.rect.y\` sub-píxel ${d.ySubPixel} · \`span.extend\` con ancho distinto ${d.extendConAnchoDistinto}`);

  if (d.subPixel === 0) rojos.push(`@${ancho}: 0 pares sub-píxel — no hay nada que explicar, o la sonda no está mirando`);
  if (d.anchosSubPixel === 0) rojos.push(`@${ancho}: 0 pares de \`.rect.w\` — sin el residuo de origen la propagación no tiene causa`);
  if (Object.keys(d.porMarca).length !== 1) rojos.push(`@${ancho}: los \`.rect.w\` sub-píxel son de ${Object.keys(d.porMarca).length} elementos distintos ⇒ NO es un solo residuo`);
  if (!d.porMarca["span.pages"]) rojos.push(`@${ancho}: el elemento del residuo no es \`span.pages\` — la explicación no es la que está escrita`);
  if (d.anchosSubPixelFueraDelPaginador !== 0) rojos.push(`@${ancho}: hay \`.rect.w\` sub-píxel fuera del paginador ⇒ podría ser un desvío global de métrica y no un residuo local`);
  if (d.propagacion.fallan !== 0) rojos.push(`@${ancho}: la propagación FALLA en ${d.propagacion.fallan} pieza(s): ${d.propagacion.fallos.slice(0, 3).join(" ;; ")}`);
  if (d.propagacion.casan === 0) rojos.push(`@${ancho}: la propagación no casa en NINGUNA pieza observable ⇒ la aritmética no está comprobada, sólo escrita`);
  if (d.formasSoloSubPixel === 0) rojos.push(`@${ancho}: 0 formas con SÓLO sub-píxel ⇒ no hay dominio limpio donde comprobar la aritmética`);
}

w("medidas/lh-subpixel.json", informe);

console.log(
  rojos.length === 0
    ? `\n✅ UN residuo (\`span.pages\`, ±0.03) y sus consecuencias aritméticas comprobadas pieza a pieza.\n` +
        `   Lo que sigue SIN PROBAR es el 0.03 mismo, y se queda fichado sin tocar.\n`
    : `\n❌ ${rojos.length} problema(s):\n${rojos.map((r) => `     · ${r}`).join("\n")}\n`,
);
process.exit(rojos.length === 0 ? 0 : 1);
