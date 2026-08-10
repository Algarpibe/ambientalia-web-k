/**
 * EL COMPARADOR DE DOS LADOS DE `articulos-kb` — par a par, nodo × propiedad.
 * Uso: node scripts/qa/kb-cmp.mjs [1440|390]         (npm run qa:kb-cmp)
 *      VIVO=1 node scripts/qa/kb-cmp.mjs [1440|390]  (npm run qa:kb-cmp-vivo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ES PAR A PAR Y NO UN Δ0 DE PÁGINA
 *
 * **Un total puede ser dos errores que se anulan** — es la lección más cara del
 * proyecto (`CLAUDE.md` §El principio) y aquí hay **1519 sitios** donde puede
 * pasar. Un `docH` idéntico no dice que la hoja esté bien: dice que la suma
 * coincide. Así que esto compara **cada propiedad de cada nodo** y, cuando algo
 * no cuadra, **lo nombra con su camino** (`…/f3/c0/m2 · modulo.marginBottom`).
 *
 * Es también lo que convierte a `articulos-kb` en un arquetipo con cobertura de
 * verdad: hasta hoy su única guarda posible era el clon contra el clon, que
 * §UN ARQUETIPO NUEVO NO HEREDA COBERTURA declara insuficiente por construcción.
 *
 * ── Los dos lados, y de dónde sale cada uno ────────────────────────────────
 *
 * | modo | lado ORIGINAL | para qué |
 * |---|---|---|
 * | por defecto | `medidas/kb-spec-{1440,390}.json` **congelado** | la aceptación de la HOJA: los mismos 1519 pares de los que se derivó |
 * | `VIVO=1` | `kunakair.com` medido **en esta misma corrida** | el Δ0 contra el sitio vivo, con la disciplina completa |
 *
 * **Los dos hacen falta y no se sustituyen.** El congelado es reproducible y no
 * depende del original —se puede correr mil veces mientras se escribe la hoja—;
 * el vivo es el único que contesta *«¿sigue siendo así?»*. Y el congelado tiene
 * un límite que hay que decir: **es una foto del 2026-08-10**, así que un Δ0
 * contra él prueba que la hoja reproduce **esa medida**, no el sitio de hoy.
 *
 * ── El suelo de ruido, y por qué aquí no hay ───────────────────────────────
 * ⚠ **`articulos-kb` NO tiene campaña de ruido propia** (`meta.ruido` de
 * `kb-spec` ya lo declara). Así que un residuo pequeño en estas rutas **no es
 * «limpio»: es SIN PROBAR** — §Notas de método, y no se puede rodear leyendo el
 * suelo de otra ruta, porque un suelo es propiedad **de las rutas medidas**.
 *
 * ── La puerta es `visible`, no el byte ─────────────────────────────────────
 * Esto compara **geometría y tipografía renderizadas**, nunca HTML. El byte no
 * puede ser puerta en este entorno: `medidas/html-cascaron-{antes,despues}.json`
 * mide **31 de 31 rutas con el marcado distinto entre dos builds del mismo
 * árbol**, incluidas dos que no importan el fichero tocado
 * (§HTML-CMP-NO-REPRODUCIBLE). *31 de 31 no es un hallazgo, es el instrumento.*
 *
 * ── Guardas ────────────────────────────────────────────────────────────────
 * 1 · `Evaluadas` con el mínimo derivado del nº de pares del lado original: si
 *     el clon no emite un nodo, la clave falta y el recuento cae por debajo;
 * 2 · `Censo` sobre los selectores de los dos dialectos;
 * 3 · los huecos DECLARADOS traen su número exacto y **superarlo falla**: un
 *     hueco conocido que crece se lee igual que uno nuevo si no se cuenta;
 * 4 · congela en `medidas/kb-cmp-<ancho>[-vivo].json`.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, QA, env, gritaSiRevienta, hoy, iniciarClon, launch, openPage, settle, w } from "./lib.mjs";

/* `--vivo` como ARGUMENTO y no como variable de entorno: `VIVO=1 node …` no es
 * portable a la shell de Windows, y este repo se corre ahí. */
const ARGS = process.argv.slice(2);
const ANCHO = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);
const MOVIL = ANCHO <= 500;
const VIVO = ARGS.includes("--vivo") || !!env("VIVO");

const { base: CLON, parar: pararClon } = await iniciarClon();
gritaSiRevienta(pararClon);

/* ── Las 6 rutas, DERIVADAS de la medida congelada ─────────────────────────
 * No hay lista a mano: las claves de `kb-spec` son las rutas del original, y la
 * del clon se compone quitándole el `/es/` y la barra final. Si mañana hay un
 * séptimo artículo, entra solo — igual que en `enlaces.mjs`. */
const ESPEJO = JSON.parse(readFileSync(join(QA, `medidas/kb-spec-${ANCHO}.json`), "utf8"));
const RUTAS = Object.keys(ESPEJO.articulos).map((r) => ({
  original: `https://kunakair.com${r}`,
  clave: r,
  clon: CLON + r.replace(/^\/es/, "").replace(/\/$/, ""),
}));

/* ══════════════════════════════════════════════════════════════════════════
 * EL DIALECTO — un walker, dos vocabularios
 *
 * El árbol es el mismo (sección › fila › columna › módulo) y los nombres de las
 * clases no. Escribir dos recorridos sería la clase C7 con su peor salida: los
 * dos verdes en su marco mientras miden cosas distintas. Así que hay UN
 * recorrido y dos tablas de selectores.
 * ═════════════════════════════════════════════════════════════════════════ */
const DIALECTO = {
  original: {
    nombre: "original",
    seccion: ".et_pb_section",
    excluyeSeccion: "_tb_(header|body|footer)",
    fila: ":scope > .et_pb_row, :scope > .et_pb_row_inner",
    columna: ":scope > .et_pb_column",
    modulo: ":scope > .et_pb_module",
    tipoColumna: "^et_pb_column_(\\d_\\d)$",
    kind: [["et_pb_blurb", "blurb"], ["et_pb_gallery", "gallery"], ["et_pb_text", "text"], ["et_pb_image", "image"], ["et_pb_button_module_wrapper", "button"]],
    inner: ".et_pb_text_inner",
    blurbTitular: ".et_pb_module_header",
    blurbDesc: ".et_pb_blurb_description",
    blurbIcono: ".et_pb_main_blurb_image",
    imagenWrap: ".et_pb_image_wrap",
    boton: "a.et_pb_button",
    galeriaItem: ".et_pb_gallery_item",
  },
  clon: {
    nombre: "clon",
    seccion: ".kb-seccion",
    excluyeSeccion: null,
    fila: ":scope > .kb-fila",
    columna: ":scope > .kb-columna",
    modulo: ":scope > .kb-modulo",
    tipoColumna: "^kb-col-(\\d_\\d)$",
    kind: [["kb-blurb", "blurb"], ["kb-gallery", "gallery"], ["kb-texto", "text"], ["kb-imagen", "image"], ["kb-boton", "button"]],
    inner: null, // el propio módulo hace de inner: su ritmo es 0 en los 85
    blurbTitular: ".kb-blurb-titulo",
    blurbDesc: ".kb-blurb-desc",
    blurbIcono: ".kb-blurb-icono",
    imagenWrap: ".kb-imagen-wrap",
    boton: "a.kb-boton-a",
    galeriaItem: ".kb-gallery-item",
  },
};

/**
 * Aplana el árbol a `{ "camino · propiedad": valor }`. Es la forma que hace
 * posible la comparación par a par: dos mapas y una diferencia de claves, en vez
 * de dos recorridos en paralelo que se pueden desincronizar sin avisar.
 */
function barrer(D) {
  const n = (v) => (v === null || v === undefined ? null : v);
  const out = {};
  const put = (camino, prop, valor) => { out[`${camino} · ${prop}`] = n(valor); };
  const S = (el, props, camino, pre) => {
    if (!el) return;
    const c = getComputedStyle(el);
    for (const p of props) put(camino, `${pre}.${p}`, c[p]);
  };
  const RITMO = ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "marginLeft", "marginRight"];
  const TIPO = ["fontSize", "lineHeight", "fontWeight", "color", "letterSpacing", "textAlign"];
  const CAJA = ["width", "maxWidth", "display"];
  const rend = (el) => !!el && el.getClientRects().length > 0;

  const re = D.excluyeSeccion ? new RegExp(D.excluyeSeccion) : null;
  const secciones = [...__qa(D.seccion)].filter((s) => !re || !re.test(s.className));

  for (const [si, s] of secciones.entries()) {
    const cs = `s${si}`;
    S(s, RITMO, cs, "seccion");
    S(s, CAJA, cs, "seccion");
    const filas = [...s.querySelectorAll(D.fila)];
    put(cs, "seccion.nFilas", filas.length);

    for (const [fi, f] of filas.entries()) {
      const cf = `${cs}.f${fi}`;
      const visible = rend(f);
      put(cf, "fila.visible", visible);
      S(f, RITMO, cf, "fila");
      S(f, CAJA, cf, "fila");
      const cols = [...f.querySelectorAll(D.columna)];
      const tipos = cols.map((c) => {
        for (const cl of c.classList) { const m = new RegExp(D.tipoColumna).exec(cl); if (m) return m[1]; }
        return "?";
      });
      put(cf, "fila.nColumnas", cols.length);
      put(cf, "fila.reparto", tipos.join(" + "));

      for (const [ci, c] of cols.entries()) {
        const cc = `${cf}.c${ci}`;
        S(c, RITMO, cc, "columna");
        S(c, CAJA, cc, "columna");
        const mods = [...c.querySelectorAll(D.modulo)];
        put(cc, "columna.nModulos", mods.length);

        for (const [mi, m] of mods.entries()) {
          const cm = `${cc}.m${mi}`;
          let kind = "?";
          for (const [cl, k] of D.kind) if (m.classList.contains(cl)) { kind = k; break; }
          put(cm, "modulo.kind", kind);
          S(m, RITMO, cm, "modulo");
          S(m, CAJA, cm, "modulo");

          if (kind === "text") {
            const inner = D.inner ? m.querySelector(D.inner) : m;
            const hs = [...(inner?.querySelectorAll("h1,h2,h3,h4,h5,h6") ?? [])];
            put(cm, "texto.nTitulares", hs.length);
            for (const [hi, h] of hs.entries()) {
              put(`${cm}.h${hi}`, "titular.etiqueta", h.tagName.toLowerCase());
              S(h, TIPO, `${cm}.h${hi}`, "titular");
              S(h, ["paddingBottom", "marginTop", "marginBottom"], `${cm}.h${hi}`, "titular");
            }
            const ps = [...(inner?.querySelectorAll("p") ?? [])];
            put(cm, "texto.nParrafos", ps.length);
            for (const [pi, p] of ps.entries()) {
              S(p, TIPO, `${cm}.p${pi}`, "parrafo");
              S(p, ["paddingBottom", "marginTop", "marginBottom"], `${cm}.p${pi}`, "parrafo");
            }
            const li = inner?.querySelector("li");
            if (li) {
              S(li, TIPO, cm, "li");
              S(li.parentElement, ["paddingLeft", "paddingBottom", "listStyleType"], cm, "lista");
            }
          }
          if (kind === "blurb") {
            const h = m.querySelector(D.blurbTitular);
            if (h) { S(h, TIPO, cm, "blurbTitular"); S(h, ["paddingBottom", "marginTop", "marginBottom"], cm, "blurbTitular"); }
            const d = m.querySelector(D.blurbDesc);
            const dp = d?.querySelector("p");
            if (dp) S(dp, TIPO, cm, "blurbDesc");
            const ic = m.querySelector(D.blurbIcono);
            if (ic) { S(ic, ["marginBottom"], cm, "blurbIcono"); put(cm, "blurbIcono.w", Math.round(ic.getBoundingClientRect().width * 100) / 100); }
          }
          if (kind === "image") {
            const wrp = m.querySelector(D.imagenWrap);
            if (wrp) put(cm, "imagenWrap.w", Math.round(wrp.getBoundingClientRect().width * 100) / 100);
            const img = m.querySelector("img");
            if (img) {
              const b = img.getBoundingClientRect();
              put(cm, "img.w", Math.round(b.width * 100) / 100);
              put(cm, "img.h", Math.round(b.height * 100) / 100);
            }
          }
          if (kind === "button") {
            const b = m.querySelector(D.boton);
            if (b) { S(b, TIPO, cm, "boton"); S(b, RITMO, cm, "boton"); S(b, [...CAJA, "borderTopWidth", "borderRadius"], cm, "boton"); }
          }
          if (kind === "gallery") {
            const items = [...m.querySelectorAll(D.galeriaItem)];
            put(cm, "galeria.nItems", items.length);
            for (const [gi, g] of items.entries()) {
              const b = g.getBoundingClientRect();
              put(`${cm}.g${gi}`, "item.w", Math.round(b.width * 100) / 100);
              put(`${cm}.g${gi}`, "item.h", Math.round(b.height * 100) / 100);
            }
          }
          /* El alto del módulo va al final y APARTE: es la propiedad que
           * DEPENDE de todas las demás, así que un Δ aquí sin Δ arriba señala
           * algo que este barrido no mira (contenido, wrap, fuente cargada). */
          put(cm, "modulo.altoDerivado", Math.round(m.getBoundingClientRect().height * 100) / 100);
        }
      }
    }
  }
  return out;
}

/**
 * El lado ORIGINAL desde la medida congelada: se re-aplana el árbol de
 * `kb-spec` a las mismas claves. **No es una segunda medición** — son los mismos
 * bytes congelados, leídos con la forma que el comparador usa.
 */
function aplanaEspejo(a) {
  const out = {};
  const put = (c, p, v) => { out[`${c} · ${p}`] = v === undefined ? null : v; };
  const RITMO = ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "marginLeft", "marginRight"];
  const TIPO = ["fontSize", "lineHeight", "fontWeight", "color", "letterSpacing", "textAlign"];
  const CAJA = ["width", "maxWidth", "display"];
  const vol = (o, props, c, pre) => { if (o) for (const p of props) put(c, `${pre}.${p}`, o[p]); };

  for (const [si, s] of a.propias.entries()) {
    const cs = `s${si}`;
    vol(s.ritmo, RITMO, cs, "seccion");
    vol(s.caja, CAJA, cs, "seccion");
    put(cs, "seccion.nFilas", s.filas.length);
    for (const [fi, f] of s.filas.entries()) {
      const cf = `${cs}.f${fi}`;
      put(cf, "fila.visible", f.renderizada);
      vol(f.ritmo, RITMO, cf, "fila");
      vol(f.caja, CAJA, cf, "fila");
      put(cf, "fila.nColumnas", f.nColumnas);
      put(cf, "fila.reparto", f.columnas.map((c) => String(c.tipo || "").replace("et_pb_column_", "")).join(" + "));
      for (const [ci, c] of f.columnas.entries()) {
        const cc = `${cf}.c${ci}`;
        vol(c.ritmo, RITMO, cc, "columna");
        vol(c.caja, CAJA, cc, "columna");
        put(cc, "columna.nModulos", c.modulos.length);
        for (const [mi, m] of c.modulos.entries()) {
          const cm = `${cc}.m${mi}`;
          put(cm, "modulo.kind", m.kind);
          vol(m.ritmo, RITMO, cm, "modulo");
          vol(m.caja, CAJA, cm, "modulo");
          if (m.kind === "text") {
            put(cm, "texto.nTitulares", (m.titulares ?? []).length);
            for (const [hi, h] of (m.titulares ?? []).entries()) {
              put(`${cm}.h${hi}`, "titular.etiqueta", h.etiqueta);
              vol(h.tipo, TIPO, `${cm}.h${hi}`, "titular");
              vol(h.ritmo, ["paddingBottom", "marginTop", "marginBottom"], `${cm}.h${hi}`, "titular");
            }
            /* ⚠ `kb-spec` guarda **el primer** `p` y no todos, así que aquí sólo
             * puede haber `p0`. El clon aporta los demás y el comparador los
             * cuenta como «sin pareja»: se informan, no se comparan. */
            if (m.p) { vol(m.p.tipo, TIPO, `${cm}.p0`, "parrafo"); vol(m.p.ritmo, ["paddingBottom", "marginTop", "marginBottom"], `${cm}.p0`, "parrafo"); }
            if (m.li) { vol(m.li.tipo, TIPO, cm, "li"); vol(m.li.lista, ["paddingLeft", "paddingBottom", "listStyleType"], cm, "lista"); }
          }
          if (m.kind === "blurb") {
            if (m.titular) { vol(m.titular.tipo, TIPO, cm, "blurbTitular"); vol(m.titular.ritmo, ["paddingBottom", "marginTop", "marginBottom"], cm, "blurbTitular"); }
            if (m.descripcion?.p) vol(m.descripcion.p.tipo, TIPO, cm, "blurbDesc");
            if (m.imagen?.contenedor) { vol(m.imagen.contenedor.ritmo, ["marginBottom"], cm, "blurbIcono"); put(cm, "blurbIcono.w", m.imagen.contenedor.rect?.w); }
          }
          if (m.kind === "image") {
            if (m.wrap?.rect) put(cm, "imagenWrap.w", m.wrap.rect.w);
            if (m.img?.rect) { put(cm, "img.w", m.img.rect.w); put(cm, "img.h", m.img.rect.h); }
          }
          if (m.kind === "button" && m.boton) {
            vol(m.boton.tipo, TIPO, cm, "boton");
            vol(m.boton.ritmo, RITMO, cm, "boton");
            vol(m.boton.caja, [...CAJA, "borderTopWidth", "borderRadius"], cm, "boton");
          }
          if (m.kind === "gallery") {
            put(cm, "galeria.nItems", m.n);
            for (const [gi, g] of (m.items ?? []).entries()) { put(`${cm}.g${gi}`, "item.w", g.rect?.w); put(`${cm}.g${gi}`, "item.h", g.rect?.h); }
          }
          put(cm, "modulo.altoDerivado", m.rect?.h);
        }
      }
    }
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS HUECOS DECLARADOS — con su número, porque uno que crece no se ve
 *
 * Cada uno es una decisión de modelo que YA está fichada. Se listan aquí con el
 * nº EXACTO de pares que se espera que fallen por su causa: si aparece uno más,
 * la sonda falla igual que con un defecto nuevo. Un hueco sin número es un
 * permiso en blanco (§sondas 4: todo patrón discriminante declara su máximo).
 * ═════════════════════════════════════════════════════════════════════════ */
const HUECOS = [
  {
    ficha: "F3-1-PIEL-CUERPO-KB",
    que: "la piel del CUERPO del módulo de texto (claim 25px ×5 · etiqueta azul 15px ×2) no es campo todavía",
    n: { 1440: 18, 390: 18 },
    casa: (clave, o) => /· parrafo\.(fontSize|lineHeight|fontWeight|color|letterSpacing)$/.test(clave) && /^(25px|15px|30px|42px|35px|13px|800|rgb\(0, 117, 201\)|0\.1px)$/.test(String(o)),
  },
  {
    ficha: "F3-1-ALIGN-BLURB-KB",
    que: "el `align` de la piel del blurb no se extrae: el extractor lo lee del COMPUTADO, donde está confundido con la herencia, y la regla compilada sí lo dice",
    n: { 1440: 9, 390: 9 },
    casa: (clave) => /· blurbTitular\.textAlign$/.test(clave),
  },
  {
    ficha: "F3-1-ICONO-BLURB-KB",
    que: "el contenedor del icono mide 50×46 con una imagen de 50×50 desplazada +6: la spec no capturó `height`, `overflow` ni los márgenes del `img`, así que el mecanismo no es derivable de lo congelado",
    n: { 1440: 27, 390: 27 },
    /* Δ **con signo**: el clon sale +4 porque su icono mide 50 de alto donde el
     * original mide 46. Un `Math.abs` aquí se tragaba además 2 módulos de texto
     * con −4, que son otra causa — la excepción tiene que casar con lo suyo. */
    casa: (clave, o, c) => /· modulo\.altoDerivado$/.test(clave) && Math.abs(c - o - 4) < 0.1,
  },
  {
    ficha: "F3-1-GALERIA-KB",
    que: "la galería es n=1 en las 6 instancias — FAMILIA DE CALIBRACIÓN: con una sola no se sabe qué es plantilla y qué es campo",
    n: { 1440: 10, 390: 19 },
    casa: (clave) => /· item\.[wh]$/.test(clave) || /\.m1 · modulo\.altoDerivado$/.test(clave),
  },
  {
    ficha: "F3-1-ALTO-DERIVADO-KB",
    que: "altos de módulo de texto con Δ de 0.6 a 10.6 y ninguna propiedad comparada distinta: la causa está FUERA de este barrido y el espejo congelado guarda un solo `p` por módulo, así que no puede adjudicarlo — lo resuelve la corrida `--vivo`",
    n: { 1440: 18, 390: 24 },
    casa: (clave) => /· modulo\.altoDerivado$/.test(clave),
  },
  {
    ficha: "F3-1-SRCSET-KB",
    que:
      "la caja de la imagen. `srcset` está FUERA del modelo por decisión declarada (§F3-1-SRCSET-KB), " +
      "así que a 390 el original sirve una VARIANTE y el clon el fichero entero, y la razón de aspecto NO es la misma: " +
      "**0.34 px en 7 imágenes y hasta 108.83 px en 3** — el original pinta 335.39×188.66 (16:9, la variante que " +
      "WordPress RECORTA) donde el fichero mide 1651×393. La ficha deja de ser sólo de peso y pasa a tener " +
      "consecuencia GEOMÉTRICA, que es lo que la asciende de cómoda a cara",
    n: { 1440: 7, 390: 12 },
    casa: (clave) => /· (img|imagenWrap)\.[wh]$/.test(clave),
  },
  {
    ficha: "F3-1-BOTON-ALIGN-KB",
    que: "1 de los 6 botones computa `start` en el original y los otros 5 `left`: varianza del ORIGINAL que ninguna propiedad capturada explica",
    n: { 1440: 1, 390: 1 },
    casa: (clave) => /· boton\.textAlign$/.test(clave),
  },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const { browser } = await launch();
const censo = new Censo();
const espejoVivo = {};

if (VIVO) {
  for (const r of RUTAS) {
    const { page, status } = await openPage(browser, r.original, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
    if (status >= 400 || status === 0) throw new Error(`${r.original} → HTTP ${status}`);
    await settle(page);
    const { datos } = await censo.medir(page, barrer, DIALECTO.original);
    espejoVivo[r.clave] = datos;
    await page.close();
    await new Promise((x) => setTimeout(x, 500));
  }
}

const salida = {
  meta: {
    fecha: hoy(),
    que: `Comparación de DOS LADOS de \`articulos-kb\`, par a par (nodo × propiedad), a ${ANCHO}.`,
    ancho: ANCHO,
    ladoOriginal: VIVO ? "kunakair.com VIVO, medido en esta corrida" : `medidas/kb-spec-${ANCHO}.json (congelado el ${ESPEJO.meta.fecha})`,
    ladoClon: `${CLON} — HTML servido por \`next start\` sobre el build actual`,
    puerta: "geometría y tipografía RENDERIZADAS. El byte no puede ser puerta aquí (§HTML-CMP-NO-REPRODUCIBLE)",
    ruido: "⚠ `articulos-kb` NO tiene campaña de ruido propia: un residuo pequeño en estas rutas es SIN PROBAR, no limpio",
    huecosDeclarados: HUECOS.map((h) => ({ ficha: h.ficha, que: h.que })),
  },
  rutas: {},
};

let paresTotales = 0;
let iguales = 0;
const defectos = [];
const huecos = {};
const soloClon = [];
const soloOriginal = [];

for (const r of RUTAS) {
  const { page, status } = await openPage(browser, r.clon, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL });
  if (status >= 400 || status === 0) throw new Error(`${r.clon} → HTTP ${status}. ¿El build es el de ahora?`);
  await settle(page);
  const { datos: clon } = await censo.medir(page, barrer, DIALECTO.clon);
  await page.close();

  const orig = VIVO ? espejoVivo[r.clave] : aplanaEspejo(ESPEJO.articulos[r.clave]);
  const claves = new Set([...Object.keys(orig), ...Object.keys(clon)]);
  const dif = [];
  let n = 0;
  let ok = 0;
  for (const k of [...claves].sort()) {
    const o = orig[k];
    const c = clon[k];
    if (o === undefined) { soloClon.push(`${r.clave} ${k}`); continue; }
    if (c === undefined) { soloOriginal.push(`${r.clave} ${k}`); continue; }
    n++;
    paresTotales++;
    if (String(o) === String(c)) { ok++; iguales++; continue; }
    const hueco = HUECOS.find((h) => h.casa(k, o, c));
    if (hueco) { (huecos[hueco.ficha] ??= []).push({ ruta: r.clave, clave: k, original: o, clon: c }); continue; }
    const d = { ruta: r.clave, clave: k, original: o, clon: c };
    dif.push(d);
    defectos.push(d);
  }
  salida.rutas[r.clave] = { pares: n, iguales: ok, distintos: dif.length, diferencias: dif };
  console.log(
    `  ${r.clave.replace(/\/$/, "").split("/").pop().slice(0, 46).padEnd(47)} ${String(ok).padStart(4)}/${String(n).padEnd(4)} iguales` +
      (dif.length ? `  ⚠ ${dif.length} distintos` : "  ✓"),
  );
}

await browser.close();
await pararClon();

/* El mínimo: los pares que el lado ORIGINAL tiene. Si el clon no emite un nodo,
 * su clave desaparece del emparejamiento y el contador no llega. */
const minimo = VIVO
  ? Object.values(espejoVivo).reduce((a, x) => a + Object.keys(x).length, 0)
  : Object.values(ESPEJO.articulos).reduce((a, x) => a + Object.keys(aplanaEspejo(x)).length, 0);
const ev = new Evaluadas({ nombre: `kb-cmp@${ANCHO}${VIVO ? " vivo" : ""}`, unidad: "pares (nodo × propiedad)", minimo });
ev.ok(paresTotales);

const porPropiedad = {};
for (const d of defectos) {
  const p = d.clave.split(" · ")[1];
  (porPropiedad[p] ??= { n: 0, ejemplos: [] }).n++;
  if (porPropiedad[p].ejemplos.length < 3) porPropiedad[p].ejemplos.push(`${d.ruta.split("/").filter(Boolean).pop()} ${d.clave.split(" · ")[0]}: orig ${d.original} → clon ${d.clon}`);
}
salida.resumen = {
  pares: paresTotales,
  iguales,
  distintos: defectos.length,
  porPropiedad,
  huecos: Object.fromEntries(Object.entries(huecos).map(([k, v]) => [k, v.length])),
  soloClon: soloClon.length,
  soloOriginal: soloOriginal.length,
};
salida.soloClon = soloClon;
salida.soloOriginal = soloOriginal;
salida.huecosPorFicha = huecos;

console.log(`\n═══ kb-cmp @${ANCHO}${VIVO ? " · ORIGINAL VIVO" : " · original CONGELADO"} ═══`);
console.log(`  ${iguales} de ${paresTotales} pares iguales · ${defectos.length} distintos`);
if (soloOriginal.length) console.log(`  ⚠ ${soloOriginal.length} claves que el ORIGINAL tiene y el clon no emite`);
if (soloClon.length) console.log(`  · ${soloClon.length} claves que sólo el clon tiene (el espejo guarda un solo \`p\` por módulo: no son defecto)`);
for (const [f, v] of Object.entries(huecos)) console.log(`  · hueco declarado §${f}: ${v.length} pares`);
if (Object.keys(porPropiedad).length) {
  console.log(`\n  DIFERENCIAS POR PROPIEDAD:`);
  for (const [p, e] of Object.entries(porPropiedad).sort((a, b) => b[1].n - a[1].n))
    console.log(`    ${String(e.n).padStart(4)}  ${p.padEnd(28)} ${e.ejemplos[0] ?? ""}`);
}

w(`medidas/kb-cmp-${ANCHO}${VIVO ? "-vivo" : ""}.json`, salida);

/* ── La guarda de los HUECOS, en las DOS direcciones ───────────────────────
 * Un hueco declarado con su número protege de que crezca en silencio; y la
 * dirección contraria —el hueco que ya no casa con nada— es §sondas 4 aplicada
 * a la tabla de excusas: **una excepción muerta se lee como un permiso vigente**
 * y tapa el defecto que aparezca mañana en su sitio. Las dos fallan. */
const desviados = [];
for (const h of HUECOS) {
  const esperado = h.n?.[ANCHO];
  const visto = (huecos[h.ficha] ?? []).length;
  if (esperado === null || esperado === undefined) {
    console.log(`  · §${h.ficha}: ${visto} pares — SIN número declarado a ${ANCHO} (esta corrida lo establece)`);
    continue;
  }
  if (visto !== esperado) desviados.push(`§${h.ficha}: declarados ${esperado}, vistos ${visto}`);
}
if (desviados.length) {
  console.log(`\n  ❌ ${desviados.length} hueco(s) declarado(s) que NO cuadran:`);
  for (const d of desviados) console.log(`     ${d}`);
  console.log(`     Un hueco que CRECE es un defecto nuevo con coartada; uno que se VACÍA es un permiso muerto.\n`);
}
salida.resumen.huecosDesviados = desviados;

const muertos = censo.informe();
const codigo =
  ev.informe() + (muertos ? 1 : 0) + (defectos.length ? 1 : 0) + (soloOriginal.length ? 1 : 0) + (desviados.length ? 1 : 0);
process.exit(codigo === 0 ? 0 : 1);
