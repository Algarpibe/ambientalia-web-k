/**
 * LA FASE DE SPECS DE LISTADOS Y HUBS — `getComputedStyle` del árbol de las 9
 * formas, en el ORIGINAL VIVO, a los dos anchos.
 * Uso: node scripts/qa/lh-spec.mjs [1440|390]      (npm run qa:lh-spec)
 *
 * ── Por qué existe: `LH-SP2` dice que aquí NO HAY UN PÍXEL MEDIDO ─────────
 * El recon de `listados-hubs` es de topología (régimen, esqueleto de primer
 * nivel, campos por tarjeta) y lo dice él mismo: *«LH-SP2 · la geometría: ni un
 * píxel medido en esta tanda»*. `LH-2` decidió el modelado sobre eso, y la
 * pasada de comportamiento (`P-LH-C6`) cerró las interacciones. Lo que nunca se
 * midió es **la caja, el ritmo y la tipografía** — o sea la spec.
 *
 * Construir sin ella es §UN ARQUETIPO NUEVO NO HEREDA COBERTURA con su versión
 * más cara: la plantilla se inventa y después las anclas de QA se calibran
 * contra lo inventado.
 *
 * ── Contra el sitio VIVO, no contra la captura ────────────────────────────
 * Misma razón medida que en `kb-spec` (PASO 0 de F3-1, `medidas/kb-css.json`):
 * la captura **no trae las hojas externas** y aun así renderiza, así que sale
 * *plausible y equivocada*. Aquí el riesgo es idéntico y está cuantificado por
 * `qa:hover-zonal`, que tuvo que pedir **7–14 hojas externas por forma** para
 * encontrar la regla de zoom: sin ellas, esa regla no está en el documento.
 *
 * ── EL RÉGIMEN, que decide cómo se lee cada número ────────────────────────
 * `CLAUDE.md` §régimen: se identifica ANTES de aplicar ningún test, porque en
 * el régimen equivocado los tests dan la respuesta INVERTIDA. Medido en
 * `medidas/lh-regimen.json`, y las 9 formas NO son homogéneas:
 *
 *   · **L1** (23 archivos, `tb_body`) · **L2** · **L3** (plantilla de tema) ·
 *     **L5** (plantilla PHP) → **PLANTILLADOS**. No existe un editor por
 *     instancia: el discriminador es la **VARIANZA ENTRE INSTANCIAS**, y un px
 *     absoluto significa «lo fijó quien construyó la plantilla» = PLANTILLA.
 *   · **L4** (6 hubs de builder) → **BUILDER**. Ahí sí valen los tests A y B
 *     tal como están escritos.
 *
 * ⚠ Y de ahí sale el alcance de esta sonda, que es lo que la hace útil o
 * inútil: **la varianza entre instancias no se puede medir con UNA instancia.**
 * Por eso no se mide «una por forma»: se mide la canónica **más una segunda por
 * familia**, elegida por la regla adversaria que el propio recon pre-registró
 * (*el extremo* — la instancia con MENOS tarjetas, que es la que rompe una
 * plantilla calibrada con la abundante). Sin segunda instancia, toda propiedad
 * de esa forma se congela como **SIN PROBAR**, no como plantilla.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Censo`: un selector que no case en ninguna página ⇒ error, no cero
 *     (§sondas 4). Los selectores de tarjeta son DOS FAMILIAS —módulo de Divi y
 *     loop del tema— y confundirlas ya costó un defecto en `lh-censo`;
 * 2 · `Evaluadas`, mínimo **derivado** de la lista de páginas, no escrito;
 * 3 · congela en `medidas/lh-spec-<ancho>.json` (§sondas 2 y 5);
 * 4 · `SIN_CLON=1`: no toca el clon, así que un `build` en vuelo no la
 *     contamina — y al revés, ella no obliga a parar nada;
 * 5 · los renglones se cuentan con un `Range`, **nunca** con
 *     `getClientRects().length` sobre el elemento: en un bloque eso devuelve 1
 *     siempre, que es un número plausible y falso (§corolario de instrumento);
 * 6 · **la base se mide EN CRUDO** (`y` absoluta del `h1`, sin corregir): es la
 *     obligación de §Notas de método para todo arquetipo nuevo, y lo que
 *     destapó los −48 que cuatro páginas llevaban meses escondiendo.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { barrer } from "./lh-barrido.mjs";
import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, openPage, QA, settle, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const ANCHO = Number(process.argv[2] || 1440);
const MOVIL = ANCHO <= 500;
const ORIGEN = "https://kunakair.com";

/* ── QUÉ PÁGINAS, y todas DERIVADAS de congeladas ──────────────────────────
 * Las 9 canónicas salen de `hover-zonal.json` (las mismas que midió el eje de
 * comportamiento: si la spec midiera otras instancias, las dos medidas no se
 * podrían cruzar). Las segundas salen de `lh-censo.json` por la regla
 * adversaria. Ni una ruta escrita a mano. */
const hover = JSON.parse(readFileSync(join(QA, "medidas/hover-zonal.json"), "utf8"));
const censoLh = JSON.parse(readFileSync(join(QA, "medidas/lh-censo.json"), "utf8"));

/** Familia del censo → forma de las 9. El reparto es el del recon §4. */
const FAMILIA_DEL_GRUPO = { post_tag: "L1-etiqueta", resources: "L1-resources-hijo", "scientific-category": "L3-sci" };

const nTarjetas = (r) => censoLh.paginas[r]?.tarjetas?.n ?? censoLh.paginas[r]?.tarjetas?.length ?? 0;

/** El EXTREMO de cada familia: la que menos tarjetas trae, desempate alfabético.
 *  Es la regla adversaria que el recon pre-registró («el que MÁS y el que MENOS»),
 *  y la que rompe una plantilla calibrada con la instancia abundante. */
const segundaDe = (grupo, canonica) =>
  Object.entries(censoLh.paginas)
    .filter(([r, v]) => v.grupo === grupo && r !== canonica && !v.error)
    .sort((a, b) => nTarjetas(a[0]) - nTarjetas(b[0]) || a[0].localeCompare(b[0]))[0]?.[0] ?? null;

const PAGINAS = [];
for (const [forma, v] of Object.entries(hover.formas)) {
  PAGINAS.push({ forma, ruta: v.ruta, papel: "canónica", n: nTarjetas(v.ruta) });
  const grupo = Object.entries(FAMILIA_DEL_GRUPO).find(([, f]) => f === forma)?.[0];
  if (grupo) {
    const s = segundaDe(grupo, v.ruta);
    if (s) PAGINAS.push({ forma, ruta: s, papel: "2.ª (extremo: menos tarjetas)", n: nTarjetas(s) });
  }
}
/* L1-resources-PADRE tiene 2 instancias y su hermana es la otra ruta de su par;
 * L2 ya viene con sus dos instancias como dos «formas» del censo de 9. */
{
  const canon = hover.formas["L1-resources-padre"]?.ruta;
  const otra = ["/es/recursos/articulos/", "/es/recursos/seminarios-web/"].find((r) => r !== canon);
  if (canon && otra) PAGINAS.push({ forma: "L1-resources-padre", ruta: otra, papel: "2.ª (la otra del par)", n: nTarjetas(otra) });
}

if (PAGINAS.length < Object.keys(hover.formas).length)
  throw new Error(`derivadas ${PAGINAS.length} páginas y las formas son ${Object.keys(hover.formas).length}. Sin denominador no hay spec.`);

/** Lo que se ejecuta dentro de la página. Es la spec entera. */
/* ⚠ El barrido vive en `lh-barrido.mjs` desde el 2026-08-13 (F3-2): lo comparte
 * con `lh-cmp`, el comparador de dos lados. Copiarlo habría sido la clase C7 —
 * dos barridos divergiendo, los dos verdes en su marco. La extracción fue
 * mecánica y está comprobada por igualdad de texto. */

const { browser } = await launch();
const censo = new Censo();
const ev = new Evaluadas({ nombre: `lh-spec@${ANCHO}`, unidad: "páginas", minimo: PAGINAS.length });

const salida = {
  meta: {
    fecha: hoy(),
    que: `SPECS de listados y hubs: \`getComputedStyle\` del árbol de las 9 formas + una 2.ª instancia por familia, a ${ANCHO}.`,
    fuente: "kunakair.com VIVO — la captura no trae las hojas externas (7–14 por forma, medido en hover-zonal.json)",
    ancho: ANCHO,
    protocolo: "perfil limpio · Cookiebot bloqueado · " + (MOVIL ? "Emulation.setDeviceMetricsOverride 390×844" : "viewport 1440×900") + " · scroll+settle · lazy→eager",
    regimen: "L1/L2/L3/L5 PLANTILLADOS (discriminador = varianza ENTRE INSTANCIAS) · L4 BUILDER (tests A y B). Aplicar el test del otro régimen da la respuesta invertida.",
    alcance:
      "9 formas × 1 instancia canónica + 4 segundas instancias (regla adversaria: la de MENOS tarjetas). " +
      "Toda propiedad de una forma con n=1 se congela SIN PROBAR: la varianza entre instancias no se mide con una.",
    ruido: "⚠ estas rutas NO tienen campaña de ruido: un residuo pequeño aquí es SIN PROBAR, no limpio",
    noMide: [
      "el clon: no está construido (las 9 dan 404 — medido en comportamiento-1440.json)",
      "anchos intermedios: el contrato ahí es de RANGO, no de fidelidad (§CONTRATO)",
      "la varianza de las formas con una sola instancia (L1-blog · L4-listado-embebido · L5-casos)",
    ],
  },
  paginas: {},
};

for (const P of PAGINAS) {
  const { page, status } = await openPage(browser, ORIGEN + P.ruta, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  if (status >= 400 || status === 0) { ev.fallo(P.ruta, `HTTP ${status}`); await page.close(); continue; }
  await settle(page);
  const { datos } = await censo.medir(page, barrer);
  salida.paginas[`${P.forma}::${P.ruta}`] = { forma: P.forma, ruta: P.ruta, papel: P.papel, ...datos };
  await page.close();
  await new Promise((r) => setTimeout(r, 400));
  ev.ok();

  console.log(
    `  ${P.forma.padEnd(20)} ${P.ruta.padEnd(56)} ${P.papel.padEnd(30)}` +
      ` h1.y ${String(datos.baseEnCrudo?.yAbsoluta ?? "—").padStart(8)} · secc ${datos.esqueleto.nSecciones} (tb ${datos.esqueleto.nTb})` +
      ` · tarjetas ${String(datos.listado.nTarjetas).padStart(3)} vía ${datos.listado.via ?? "—"}` +
      ` · paginador ${datos.paginador.enElCuerpo ? "sí" : "NO"}`,
  );
}

await browser.close();

/* ══════════ LO QUE LA SPEC DECIDE, CON SU TEST Y SU DENOMINADOR ══════════ */
const P = Object.values(salida.paginas);
const uniq = (a) => [...new Set(a.map((x) => JSON.stringify(x)))].map((s) => JSON.parse(s));
const porForma = {};
for (const p of P) (porForma[p.forma] ??= []).push(p);

/** Varianza ENTRE INSTANCIAS de una familia. Con n=1 devuelve SIN PROBAR — que
 *  es una afirmación distinta de «no varía», y confundirlas es cómo se cablea
 *  una plantilla inventada. */
const entreInstancias = (grupo, f) => {
  const vals = uniq(grupo.map(f));
  if (grupo.length < 2) return { n: grupo.length, veredicto: "SIN PROBAR (n=1)", valores: vals };
  return { n: grupo.length, veredicto: vals.length === 1 ? "PLANTILLA (varianza 0)" : "VARÍA — mirar", valores: vals };
};

salida.veredicto = {
  ancho: ANCHO,
  porForma: Object.fromEntries(
    Object.entries(porForma).map(([forma, g]) => [
      forma,
      {
        instancias: g.length,
        regimen: g[0].body.regimen.tbBody ? (g[0].body.regimen.builder ? "híbrido" : "plantillado (tb_body)") : g[0].body.regimen.builder ? "builder" : "plantillado (tema)",
        baseEnCrudo: entreInstancias(g, (x) => x.baseEnCrudo?.yAbsoluta ?? null),
        cabeceraAlto: entreInstancias(g, (x) => x.cabecera?.rect.h ?? null),
        nSecciones: entreInstancias(g, (x) => x.esqueleto.nSecciones),
        capas: entreInstancias(g, (x) => x.esqueleto.porCapa),
        pielPaginador: entreInstancias(g, (x) => x.paginador.piel),
        via: entreInstancias(g, (x) => x.listado.via),
        anchoTarjeta: entreInstancias(g, (x) => x.listado.tarjetas[0]?.rect.w ?? null),
        rejilla: entreInstancias(g, (x) => ({ columnas: x.listado.rejilla?.columnas ?? null, huecoH: x.listado.rejilla?.huecoH ?? null, huecoV: x.listado.rejilla?.huecoV ?? null })),
        tipoTitulo: entreInstancias(g, (x) => x.listado.tarjetas[0]?.titulo?.tipo ?? null),
        tipoH1: entreInstancias(g, (x) => x.baseEnCrudo?.tipo ?? null),
        paginadorEnElCuerpo: entreInstancias(g, (x) => x.paginador.enElCuerpo),
        colaSecciones: entreInstancias(g, (x) => (x.cola ?? []).length),
      },
    ]),
  ),
  /* Test B (varía entre hermanos de la MISMA página) — sólo legítimo en L4, que
   * es la única forma en régimen de builder. En las plantilladas se registra
   * igual, pero NO decide: ahí el discriminador es el de arriba. */
  testB_soloL4: (() => {
    const l4 = porForma["L4-listado-embebido"]?.[0];
    if (!l4) return null;
    const secc = l4.esqueleto.cuerpo;
    const filas = secc.flatMap((s) => s.filas);
    const mods = filas.flatMap((f) => f.columnas.flatMap((c) => c.modulos));
    return {
      seccionPt: uniq(secc.map((s) => s.ritmo?.paddingTop)),
      seccionPb: uniq(secc.map((s) => s.ritmo?.paddingBottom)),
      filaPt: uniq(filas.filter((f) => f.renderizada).map((f) => f.ritmo?.paddingTop)),
      moduloMb: uniq(mods.filter((m) => m.renderizado).map((m) => m.ritmo?.marginBottom)),
      moduloAncho: uniq(mods.filter((m) => m.renderizado).map((m) => m.caja?.width)),
    };
  })(),
};

console.log(`\n═══ SPEC LISTADOS @${ANCHO} — ${P.length} páginas, ${Object.keys(porForma).length} formas`);
for (const [forma, v] of Object.entries(salida.veredicto.porForma)) {
  console.log(`  ${forma.padEnd(20)} n=${v.instancias} · ${v.regimen}`);
  for (const k of ["baseEnCrudo", "anchoTarjeta", "rejilla", "capas", "pielPaginador", "colaSecciones"]) {
    const r = v[k];
    console.log(`      ${k.padEnd(16)} ${r.veredicto.padEnd(24)} ${JSON.stringify(r.valores).slice(0, 90)}`);
  }
}
console.log(`✓ evaluadas ${P.length}/${PAGINAS.length} páginas · spec de listados`);

const muertos = censo.informe();
w(`medidas/lh-spec-${ANCHO}.json`, salida);
const codigo = ev.informe() + (muertos ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
