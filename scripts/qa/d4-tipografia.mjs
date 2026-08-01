/**
 * D4 · EL TERCER EJE DEL PIE — por qué catálogo/producto son MÁS ALTOS con la
 * misma fila y los mismos módulos.
 * Uso: npm run qa:d4-tipo -- [ancho]        SABOTAJE=1 → test en negativo
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * El modelo de D4 (ESQUEMA §6b) dice que entre familias solo varían DOS ejes de
 * presentación: el **ancho de fila** (86 % / 80 %) y el **`padding` de sección**
 * (0 / 4 %). Con esos dos, `footer-background` cuadra al céntimo.
 *
 * **No cuadra el resto.** Medido en `d4-pie-1440-antes.json`, catálogo contra
 * software — **misma fila de 1152, mismo `padding` de fila (28.7969), mismos 8
 * módulos**:
 *
 *   sec0 columnas  288.16 363.34 349.86 400.94 184.05   (software)
 *                  300.16 379.34 366.16 449.53 184.05   (catálogo)
 *                   +12    +16    +16.30 +48.59  0
 *   sec1 col legal  93.19 → 125.78                        +32.59
 *
 * O sea **+79.18 que los dos ejes no explican**, y con una firma muy concreta:
 * las columnas de TEXTO crecen ~2 px por renglón de enlace y la columna de la
 * IMAGEN no se mueve (0). Eso no es caja: es **tipografía o ritmo de línea**.
 *
 * Aplicar los dos ejes y parar habría dejado catálogo y producto a **−79.19**,
 * con el arreglo dado por bueno porque «el modelo dice dos ejes». Es la regla
 * del NIVEL: el alto de la sección es un contenedor que absorbe: hay que bajar
 * al renglón.
 *
 * ── Qué mide ──────────────────────────────────────────────────────────────
 * La VARIANZA ENTRE INSTANCIAS de las propiedades tipográficas del pie. Es el
 * discriminador que `CLAUDE.md` manda usar en régimen plantillado: cero
 * varianza = plantilla; lo que varía entre formas distingue plantillas.
 * No decide nada por sí solo — dice **qué propiedad** hay que llevar al modelo.
 */
import { Censo, launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const SABOTAJE = !!process.env.SABOTAJE;

/** Las tres presentaciones medidas, más una de control por grupo. */
const RUTAS = [
  ["A · blog   86/0", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/"],
  ["SECTOR     86/0", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/"],
  ["SOFTWARE   80/0", "https://kunakair.com/es/kunak-api/"],
  ["CATÁLOGO   80/4", "https://kunakair.com/es/accesorios/"],
  ["PRODUCTO   80/4", "https://kunakair.com/es/monitor-calidad-aire/"],
];

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const H = (el) => r(el.getBoundingClientRect().height);
  const cs = (el, ...props) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = s[p];
    return o;
  };

  if (sabotaje) __q(".d4-tipo-selector-que-no-existe");

  const pie = __q("footer.et-l--footer, #main-footer");
  if (!pie) return { ausente: true };

  const links = __q(".footer-links", pie);
  const legal = __q(".footer-legal", pie);
  const col0 = links ? __q(".et_pb_column", links) : null;

  return {
    // El renglón de enlace: donde vive el ~+2 px por li
    li: (() => {
      const el = col0 ? __q("li", col0) : null;
      return el && { h: H(el), ...cs(el, "fontSize", "lineHeight", "marginBottom", "paddingBottom") };
    })(),
    liA: (() => {
      const el = col0 ? __q("li a", col0) : null;
      return el && { h: H(el), ...cs(el, "fontSize", "lineHeight", "fontFamily") };
    })(),
    ul: (() => {
      const el = col0 ? __q("ul", col0) : null;
      return el && { h: H(el), n: __qa("li", el).length, ...cs(el, "paddingBottom", "marginBottom", "lineHeight") };
    })(),
    // El título de columna
    titulo: (() => {
      const el = col0 ? __q("h4, h3, p, .widgettitle", col0) : null;
      return el && { h: H(el), txt: (el.textContent || "").trim().slice(0, 22), ...cs(el, "fontSize", "lineHeight", "marginBottom") };
    })(),
    // El párrafo legal: donde vive el renglón entero de más (+32.59)
    legalP: (() => {
      const el = legal ? __q("p", legal) : null;
      return el && { h: H(el), ...cs(el, "fontSize", "lineHeight", "marginBottom", "width") };
    })(),
    legalCol: (() => {
      const el = legal ? __q(".et_pb_column", legal) : null;
      return el && { h: H(el), ...cs(el, "width", "paddingRight") };
    })(),
    // El contexto que podría estar moviéndolo por herencia
    raiz: cs(document.documentElement, "fontSize"),
    cuerpo: cs(document.body, "fontSize", "lineHeight", "fontFamily"),
    pieCs: cs(pie, "fontSize", "lineHeight"),
    bodyClases: [...document.body.classList].filter((c) => /^(et|page|postid|single|tax|term|product)/.test(c)).slice(0, 8),
  };
};

const { browser } = await launch();
const censo = new Censo();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10) }, familias: {} };
let muertas = 0;

for (const [fam, url] of RUTAS) {
  try {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status); }
    await settle(page);
    const { datos } = await censo.medir(page, LECTOR, SABOTAJE);
    await page.close();
    salida.familias[fam] = datos;
    console.log(`\n█ ${fam}`);
    console.log(`   li      h=${String(datos.li?.h).padStart(7)}  fs=${datos.li?.fontSize}  lh=${datos.li?.lineHeight}  mb=${datos.li?.marginBottom}`);
    console.log(`   li>a    h=${String(datos.liA?.h).padStart(7)}  fs=${datos.liA?.fontSize}  lh=${datos.liA?.lineHeight}`);
    console.log(`   ul      h=${String(datos.ul?.h).padStart(7)}  n=${datos.ul?.n}  pb=${datos.ul?.paddingBottom}  lh=${datos.ul?.lineHeight}`);
    console.log(`   título  h=${String(datos.titulo?.h).padStart(7)}  fs=${datos.titulo?.fontSize}  lh=${datos.titulo?.lineHeight}  mb=${datos.titulo?.marginBottom}  «${datos.titulo?.txt}»`);
    console.log(`   legal p h=${String(datos.legalP?.h).padStart(7)}  fs=${datos.legalP?.fontSize}  lh=${datos.legalP?.lineHeight}  w=${datos.legalP?.width}`);
  } catch (e) {
    muertas++;
    salida.familias[fam] = { error: String(e).slice(0, 200) };
    console.log(`\n█ ${fam}\n   ✗ ERROR ${String(e).slice(0, 120)}`);
  }
}
await browser.close();
w(`medidas/d4-tipografia-${width}.json`, salida);

/* ── La varianza, que es lo que se venía a buscar ─────────────────────────── */
const vivas = Object.entries(salida.familias).filter(([, v]) => !v.error && !v.ausente);
const EJES = [
  ["li.h", (v) => v.li?.h], ["li.fontSize", (v) => v.li?.fontSize], ["li.lineHeight", (v) => v.li?.lineHeight],
  ["li.marginBottom", (v) => v.li?.marginBottom], ["li>a.lineHeight", (v) => v.liA?.lineHeight],
  ["ul.h", (v) => v.ul?.h], ["ul.paddingBottom", (v) => v.ul?.paddingBottom], ["ul.lineHeight", (v) => v.ul?.lineHeight],
  ["titulo.h", (v) => v.titulo?.h], ["titulo.lineHeight", (v) => v.titulo?.lineHeight],
  ["legalP.h", (v) => v.legalP?.h], ["legalP.fontSize", (v) => v.legalP?.fontSize],
  ["legalP.lineHeight", (v) => v.legalP?.lineHeight], ["legalP.width", (v) => v.legalP?.width],
  ["cuerpo.fontSize", (v) => v.cuerpo?.fontSize], ["pie.lineHeight", (v) => v.pieCs?.lineHeight],
];
console.log(`\n─── VARIANZA ENTRE FORMAS @${width}  (lo que varía distingue plantillas)`);
let conVarianza = 0;
for (const [nombre, f] of EJES) {
  const vals = vivas.map(([k, v]) => [k, f(v)]);
  const distintos = [...new Set(vals.map(([, x]) => String(x)))];
  const varia = distintos.length > 1;
  if (varia) conVarianza++;
  console.log(`  ${varia ? "▲" : "·"} ${nombre.padEnd(18)} ${varia ? vals.map(([k, x]) => `${k.trim().split(" ")[0]}=${x}`).join("  ") : distintos[0]}`);
}
console.log(`\n  ${conVarianza} eje(s) con varianza de ${EJES.length}`);

const muertos = censo.informe(`@${width}`);
if (muertas) console.error(`\n❌ ${muertas} forma(s) no se pudieron medir — NO son «sin diferencia».`);
const fallos = muertos + muertas;
console.log(`\n${fallos === 0 ? "✅" : "❌"} d4-tipo @${width} · ${vivas.length}/${RUTAS.length} formas · ${muertos} selector(es) muerto(s)`);
process.exit(fallos === 0 ? 0 : 2);
