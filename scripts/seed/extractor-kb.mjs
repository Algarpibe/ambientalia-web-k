/**
 * EL EXTRACTOR DE `articulos-kb` — de las medidas congeladas al documento.
 * Uso:  npm run cms:extractor-kb        (SABOTAJE=… → test en negativo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ SU ENTRADA NO ES EL HTML: SON LAS MEDIDAS, Y ESO NO ES UNA COMODIDAD
 *
 * En SECTOR y MONOGRÁFICO los valores del editor viajaban en el atributo
 * `style=` del nodo, y el extractor los leía de ahí. **Aquí hay CERO estilos en
 * línea** —en las 45 filas y los 149 módulos, a los dos anchos
 * (`cuerpo.spec.md` §2.2)—: Divi los compiló a `et-core-unified-…css` con una
 * clase por módulo. Así que el ritmo **sólo existe en el estilo COMPUTADO**, y
 * la entrada de este extractor son `medidas/kb-spec-{1440,390}.json`, que son
 * esa computación **congelada, reproducible y commiteada**.
 *
 * **Y hacen falta LOS DOS anchos, no uno.** El editor escribió px absolutos
 * (`7·14·17·19·20·25·−2·−21`) **y** porcentajes (`2·5·0.8·0.4 %`), y **a 1440
 * son el mismo número**. Los separa que el default de Divi cambia de unidad al
 * apilar (`2 %` → `30px` PLANO) y un porcentaje del editor no. Un extractor de
 * un solo ancho no puede escribir la `unidad` — escribiría `px` siempre, que es
 * exactamente el defecto que `medida()` existe para impedir.
 *
 * ── Lo que NO lee, y por qué se dice ──────────────────────────────────────
 * **No lee `corpus/fase-3/` para el píxel.** El PASO 0 midió que la captura
 * tiene **0 de las 19 hojas externas** y aun así renderiza (184 KB de CSS en
 * línea), así que sale **plausible y equivocada**: 55 de 210 anclas de estilo
 * mal, `columna.width` **678.52 offline contra 430.80**. El verbatim que el
 * HTML sí serviría —el texto de los módulos— ya viaja dentro de la medida
 * (`modulo.html`, `blurb.titular.texto`, `blurb.descripcion.html`), capturado
 * en la misma corrida contra el sitio vivo: una sola fuente, no dos que puedan
 * divergir.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, hoy, w } from "../qa/lib.mjs";
import { pielesPorModulo } from "../qa/css-compilado.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina

const RAIZ = join(QA, "../..");
const MEDIDAS = join(QA, "medidas");

/* ══════════════════════════════════════════════════════════════════════════
 * LOS DEFECTOS MEDIDOS — importados del ESQUEMA, no re-escritos
 *
 * `defaults.ts` es TypeScript y este fichero es `.mjs`, así que los valores se
 * traen a mano… lo cual sería la clase C7 (dos definiciones de «lo mismo»). Se
 * evita **derivándolos del mismo sitio que el esquema**: `mbPorDefecto` y las
 * constantes viven allí y aquí se importan por `esbuild`, igual que el
 * extractor del corpus importa `validaHtmlCorpus`.
 * ═════════════════════════════════════════════════════════════════════════ */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "defaults-kb.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/defaults.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
});
const { ARTICULO_KB, ANCHO_FILA_KB, mbPorDefecto, titularPorDefecto } = await import(pathToFileURL(bundle).href);

/** El contenedor contra el que Divi resuelve los % del cuerpo, por ancho. */
const CONTENEDOR = { 1440: ANCHO_FILA_KB, 390: 335.391 };

/* ══════════════════════════════════════════════════════════════════════════
 * EL SABOTAJE — cada uno tiene que morder por SU invariante, no por otro
 * ═════════════════════════════════════════════════════════════════════════ */
const SABOTAJES = {
  unidad: "no escribe `unidad`: todo ritmo sale en px ⇒ los 4 porcentajes se pierden",
  "mb-constante": "usa 34.0469 como default de `mb` en toda columna ⇒ los 13 de columna estrecha salen como campo",
  "un-ancho": "clasifica con 1440 solamente ⇒ default y `2 %` son indistinguibles",
  "sin-ocultas": "no descarta las filas `d-none` ⇒ 45 filas en vez de 39",
  reparto: "escribe `4_4` en toda columna ⇒ la retícula deja de sumar 1",
  "piel-defecto": "toma la piel MAYORITARIA del `h2` (44/1.25em/300) como defecto del tema ⇒ 21 pieles pasan a otra cuenta",
  "piel-align": "deriva `align` del computado ⇒ el `center` que vive en el campo rico se convierte en campo del módulo",
};
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES[SABOTAJE])
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * LECTURA DE UNA MEDIDA DE RITMO
 * ═════════════════════════════════════════════════════════════════════════ */

const px = (v) => {
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};
/** Igualdad de píxeles con la tolerancia del redondeo de `getComputedStyle`. */
const casi = (a, b, eps = 0.02) => a !== null && b !== null && Math.abs(a - b) <= eps;

/**
 * Clasifica un par `(v@1440, v@390)` en una `medida` del esquema.
 *
 * El orden **no es libre**: cada rama descarta la anterior, y saltarse la
 * primera es cómo se inventan campos donde sólo hay defaults.
 *
 *  1 · **coincide con el default** ⇒ AUSENTE. Es la convención del §1.5 (*se
 *      omite del dato cuando coincide*), y el default de Divi **no se puede
 *      representar como valor** porque cambia de unidad al apilar;
 *  2 · **el mismo número a los dos anchos** ⇒ px absoluto (test A). Incluye el
 *      `0` escrito, que es el caso degenerado —«escribió 0» y «no hay nada» dan
 *      el mismo píxel— y por eso sólo llega aquí si NO era el default;
 *  3 · **la misma RAZÓN contra el contenedor a los dos anchos** ⇒ porcentaje
 *      escrito por el editor (test A en razón, `MEDICION.md` §3.3);
 *  4 · **ninguna de las dos** ⇒ hay un override de MÓVIL. Si el valor de
 *      escritorio es el default, sólo se escribe el de móvil.
 *
 * ⚠ **El móvil se lee como `px` y eso es una declaración, no una medida:** los
 * únicos valores medidos en esa rama son **0** (`34.0469→0` ×10 · `13→0` ·
 * `45→0` · `mt −18→0` ×14), y `0px` y `0 %` son el mismo píxel. Si algún día
 * aparece un override de móvil distinto de 0, hará falta un tercer ancho para
 * decidir su unidad — igual que 1440 solo no distingue px de %.
 */
function medidaDe(v1440, v390, def) {
  const a = px(v1440);
  const b = px(v390);
  if (a === null || b === null) return null;
  if (SABOTAJE === "un-ancho") return casi(a, def.px1440) ? undefined : { valor: a, unidad: "px" };

  if (casi(a, def.px1440) && casi(b, def.px390)) return undefined; // 1 · el default: se omite

  if (casi(a, b)) return { valor: redondea(a), unidad: "px" }; // 2 · px absoluto

  const r1440 = (a / CONTENEDOR[1440]) * 100;
  const r390 = (b / CONTENEDOR[390]) * 100;
  if (Math.abs(r1440 - r390) < 0.02) {
    // 3 · porcentaje escrito. Se redondea al valor que una persona teclea.
    const pct = redondea((r1440 + r390) / 2, 2);
    return { valor: pctLimpio(pct), unidad: SABOTAJE === "unidad" ? "px" : "pct" };
  }

  // 4 · override de móvil
  const escritorio = casi(a, def.px1440) ? {} : { valor: redondea(a), unidad: "px" };
  return { ...escritorio, movilValor: redondea(b), movilUnidad: "px" };
}

const redondea = (n, d = 4) => Number(n.toFixed(d));
/** `2.0001 %` es `2 %` tecleado: el ruido viene del redondeo del navegador. */
const pctLimpio = (p) => (Math.abs(p - Math.round(p * 10) / 10) < 0.02 ? Math.round(p * 10) / 10 : p);

/* ══════════════════════════════════════════════════════════════════════════
 * LECTURA DEL ÁRBOL
 * ═════════════════════════════════════════════════════════════════════════ */

const tipoColumna = (c) => String(c.tipo || "").replace(/^et_pb_column_/, "");

/** `anchoPct` del módulo: la razón contra su columna, si es la misma a los dos anchos. */
function anchoPctDe(m1440, m390, col1440, col390) {
  const a = px(m1440.caja?.width);
  const b = px(m390.caja?.width);
  const ca = px(col1440.caja?.width);
  const cb = px(col390.caja?.width);
  if ([a, b, ca, cb].some((v) => v === null) || !ca || !cb) return undefined;
  const r1 = (a / ca) * 100;
  const r2 = (b / cb) * 100;
  if (Math.abs(r1 - r2) > 0.05) return undefined; // no es una razón escrita (ancho intrínseco)
  const pct = pctLimpio(redondea((r1 + r2) / 2, 2));
  return Math.abs(pct - 100) < 0.05 ? undefined : pct; // 100 % es el defecto: se omite
}

/** El ritmo del módulo. `mb` lleva SU default, que depende del ancho de la fila. */
function ritmoModulo(m1440, m390, tipoCol) {
  const defMb = SABOTAJE === "mb-constante"
    ? { px1440: 34.0469, px390: 30 }
    : mbPorDefecto(ANCHO_FILA_KB, tipoCol);
  const r = {
    mt: medidaDe(m1440.ritmo.marginTop, m390.ritmo.marginTop, ARTICULO_KB.moduloMt.valor),
    mb: medidaDe(m1440.ritmo.marginBottom, m390.ritmo.marginBottom, defMb),
    pb: medidaDe(m1440.ritmo.paddingBottom, m390.ritmo.paddingBottom, ARTICULO_KB.moduloPb.valor),
  };
  for (const k of Object.keys(r)) if (r[k] === undefined) delete r[k];
  return Object.keys(r).length ? r : undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA PIEL DE LOS TITULARES — derivada del COMPUTADO, verificada contra el CSS
 *
 * ── Por qué la fuente sigue siendo la medida, y no el CSS ─────────────────
 * El campo se deriva del **estilo computado a los dos anchos**, igual que todo
 * lo demás de este extractor: es la salida servida, y es lo que decide el Δ0.
 * El CSS compilado entra como **SEGUNDO TESTIGO**, no como fuente:
 *
 *   > el computado dice **qué se ve**; el CSS dice **quién lo escribió**. Un
 *   > override que el computado ve y el CSS no explica no es un campo del
 *   > módulo — es contenido, o una hoja que la captura no tiene.
 *
 * **Y eso no es teoría: mordió a la primera.** El `h2` de `text_13` de
 * `como-garantiza` computa `text-align: center` y **ninguna regla lo explica**;
 * viene de `style="text-align: center"` **dentro del campo rico**. O sea que es
 * contenido del editor de texto, no ajuste del módulo, y ya viaja verbatim en
 * `html`. Escribirlo como campo habría duplicado el dato — y las dos copias
 * habrían divergido en cuanto alguien editara el cuerpo.
 *
 * Por eso `align` **no se deriva del computado**: está confundido con la
 * herencia del contenedor Y con el `style=` del campo rico. Existe en el
 * esquema porque el corpus trae **63 reglas reales** de `text-align` por módulo
 * (55 `center` · 8 `left`) fuera de KB; aquí queda **sin ejercitar y dicho**.
 * ═════════════════════════════════════════════════════════════════════════ */

/** `rgb(51, 51, 51)` → `#333333`. El computado siempre da `rgb()`. */
function aHex(color) {
  const m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(String(color || ""));
  if (!m) return null;
  return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
}

/**
 * La piel de UN titular como campo, o `undefined` si es el defecto del tema.
 *
 * `lh` sale en **razón** (`lineHeight / fontSize`) y no en px porque Divi la
 * escribe en `em` — 499 de 499 reglas del corpus—, y porque a 390 el mismo
 * `1.25` produce otro número de píxeles: guardarlo en px es el defecto de
 * `medida()` con otra unidad.
 */
function pielDe(t1440, t390, donde, clave) {
  const nivel = clave ?? t1440.etiqueta;
  /**
   * ⚠ El sabotaje `piel-defecto` es el que más se parece a una decisión
   * razonable: *«el defecto es la piel que más se repite»*. Con 11 de 20 `h2` a
   * 44 px, tomarla por defecto parece estadística — y es cablear la instancia
   * mayoritaria, o sea el arreglo falso de `CLAUDE.md` §Estructura.
   */
  const def =
    SABOTAJE === "piel-defecto" && nivel === "h2"
      ? { fs: 44, lh: 1.25, fw: 300, color: "#333333" }
      : titularPorDefecto(nivel); // TIRA ante un nivel sin medir
  const fs1440 = px(t1440.tipo.fontSize);
  const fs390 = px(t390.tipo.fontSize);
  const lh1440 = px(t1440.tipo.lineHeight);
  const lh390 = px(t390.tipo.lineHeight);
  if ([fs1440, fs390, lh1440, lh390].some((v) => v === null))
    throw new Error(`TITULAR sin tipografía medible en ${donde}`);

  const piel = { nivel };
  if (!casi(fs1440, def.fs)) piel.fs = redondea(fs1440, 2);
  if (!casi(fs390, fs1440)) piel.movilFs = redondea(fs390, 2);

  /* La razón, comprobada a los DOS anchos: si no coincide, no es un `em`. */
  const r1440 = lh1440 / fs1440;
  const r390 = lh390 / fs390;
  if (Math.abs(r1440 - r390) > 0.005)
    throw new Error(
      `INTERLÍNEA que no es una razón en ${donde}: ${r1440.toFixed(4)} a 1440 y ${r390.toFixed(4)} a 390.\n` +
        `  Divi la escribe en \`em\` (499/499 en el corpus). Un par que no casa significa px absolutos,\n` +
        `  y este campo no puede expresarlos: se para en vez de guardar el de 1440.`,
    );
  const lh = redondea((r1440 + r390) / 2, 4);
  if (!casi(lh, def.lh, 0.005)) piel.lh = lh;

  const fw = Number(t1440.tipo.fontWeight);
  if (Number.isFinite(fw) && fw !== def.fw) piel.fw = fw;
  const color = aHex(t1440.tipo.color);
  if (color && color !== def.color) piel.color = color;

  /* `align` NO se deriva: está confundido con la herencia del contenedor y con
   * el `style=` del campo rico. El sabotaje lo hace, y por eso cae. */
  if (SABOTAJE === "piel-align" && t1440.tipo.textAlign && t1440.tipo.textAlign !== "left")
    piel.align = t1440.tipo.textAlign;

  return Object.keys(piel).length > 1 ? piel : undefined; // sólo `nivel` = el defecto
}

/**
 * El campo `titulares` de un módulo de texto, y **su verificación cruzada**.
 *
 * `cssModulo` son las reglas que Divi compiló para ESTE módulo
 * (`css-compilado.mjs` → `pielesPorModulo`). Cada override derivado del
 * computado tiene que estar explicado por una regla; si no lo está, se nombra.
 * Es la única forma de que *«la captura no tiene las 19 hojas externas»* deje de
 * ser un riesgo silencioso y pase a ser un fallo que se ve.
 */
function titularesDe(m1440, m390, cssModulo, donde) {
  const t1440 = m1440.titulares || [];
  const t390 = m390.titulares || [];
  if (t1440.length !== t390.length) throw new Error(`DESCUADRE de titulares en ${donde}`);
  const out = [];
  const sinExplicar = [];
  for (const [i, t] of t1440.entries()) {
    if (t.etiqueta !== t390[i].etiqueta) throw new Error(`TITULAR distinto entre anchos en ${donde}#${i}`);
    const piel = pielDe(t, t390[i], `${donde}#${i}<${t.etiqueta}>`);
    if (!piel) continue;
    if (out.some((p) => p.nivel === piel.nivel)) {
      /* Dos titulares del mismo nivel en un módulo comparten piel por
       * construcción (Divi da UN control por nivel). Si difieren, el modelo es
       * el equivocado y hay que verlo, no promediarlo. */
      const previo = out.find((p) => p.nivel === piel.nivel);
      if (JSON.stringify(previo) !== JSON.stringify(piel))
        throw new Error(
          `DOS PIELES para <${piel.nivel}> en el MISMO módulo (${donde}): ` +
            `${JSON.stringify(previo)} y ${JSON.stringify(piel)}. Divi da un control por nivel.`,
        );
      continue;
    }
    const regla = cssModulo?.[piel.nivel];
    if (!regla) sinExplicar.push(`${donde}<${piel.nivel}> ${JSON.stringify(piel)}`);
    out.push(piel);
  }
  return { titulares: out.length ? out : undefined, sinExplicar };
}

/**
 * La piel del titular de un BLURB — **un grupo, no un array**, porque Divi da un
 * solo control aquí (lo compila contra `.et_pb_module_header`, no contra `h4`).
 *
 * Su defecto no sale de un módulo sin regla —los 36 llevan— sino de las
 * OMISIONES de las reglas que hay: la de ×3 no escribe `fs` ni `lh` y computa
 * `18/18`; la de ×9 no escribe peso y computa `w300`. Ver `TITULAR_POR_DEFECTO`.
 */
function pielBlurbDe(m1440, m390, cssModulo, donde) {
  const t1440 = m1440.titular;
  const t390 = m390.titular;
  if (!t1440?.tipo || !t390?.tipo) return { piel: undefined, sinExplicar: [] };
  const piel = pielDe(t1440, t390, `${donde}<blurb>`, "blurb");
  if (!piel) return { piel: undefined, sinExplicar: [] };
  delete piel.nivel; // la clave era sólo para elegir el defecto
  const regla = cssModulo?.[".et_pb_module_header"];
  return { piel, sinExplicar: regla ? [] : [`${donde}<blurb> ${JSON.stringify(piel)}`] };
}

const RE_NIVEL = /^h([1-6])$/;
const reticulaDe = (clases) =>
  clases.includes("iconos-xs-2") || clases.includes("iconos-md-3")
    ? "iconos"
    : clases.includes("col-md-4")
      ? "col-md-4"
      : "ninguna";
const alineacionDe = (clases) => (clases.includes("et_pb_text_align_left") ? "left" : "center");

/** El ordinal con el que Divi cuelga el CSS de ESTE módulo: `et_pb_text_13` → `text_13`. */
const ordinalDe = (clases) => {
  const c = (clases || []).find((x) => /^et_pb_[a-z_]+_\d+$/.test(x));
  return c ? c.replace(/^et_pb_/, "") : null;
};

/** Un módulo medido → el bloque que el esquema espera. */
function moduloDe(m1440, m390, col1440, col390, donde, cssPagina, sinExplicar) {
  const tipoCol = tipoColumna(col1440);
  const comun = {
    ritmo: ritmoModulo(m1440, m390, tipoCol),
    anchoPct: anchoPctDe(m1440, m390, col1440, col390),
  };
  for (const k of Object.keys(comun)) if (comun[k] === undefined) delete comun[k];

  switch (m1440.kind) {
    case "text": {
      const ord = ordinalDe(m1440.clases);
      const t = titularesDe(m1440, m390, cssPagina?.[ord], donde);
      sinExplicar.push(...t.sinExplicar);
      return { blockType: "texto-kb", html: m1440.html, titulares: t.titulares, ...comun };
    }
    case "image":
      return { blockType: "imagen-kb", src: m1440.src, alt: m1440.alt || undefined, ...comun };
    case "button":
      /* El botón NO lleva `external` medido: se deriva del host, igual que la
       * regla de rutas locales del repo — un `href` a kunakair.com es el propio
       * sitio y no abre pestaña. */
      return {
        blockType: "boton-kb",
        label: m1440.texto,
        href: m1440.href,
        external: esExterno(m1440.href) || undefined,
        ...comun,
      };
    case "blurb": {
      const nivel = Number(RE_NIVEL.exec(m1440.titular?.etiqueta || "")?.[1]);
      if (!nivel) throw new Error(`BLURB sin nivel de titular en ${donde}`);
      const pb = pielBlurbDe(m1440, m390, cssPagina?.[ordinalDe(m1440.clases)], donde);
      sinExplicar.push(...pb.sinExplicar);
      return {
        blockType: "blurb",
        titulo: m1440.titular.texto,
        nivel,
        piel: pb.piel,
        imagen: m1440.imagen?.src,
        alt: m1440.imagen?.alt || undefined,
        descripcion: m1440.descripcion?.html,
        reticula: reticulaDe(m1440.clases),
        alineacion: alineacionDe(m1440.clases),
        ...comun,
      };
    }
    case "gallery":
      return {
        blockType: "gallery",
        items: (m1440.items || []).map((it) => ({ imagen: it.src, alt: it.alt || undefined, titulo: it.titulo || undefined })),
        ...comun,
      };
    default:
      throw new Error(`KIND NO CONTEMPLADO: '${m1440.kind}' en ${donde}. El censo dio cinco y no se inventa el sexto.`);
  }
}

const esExterno = (href) => {
  try {
    return !new URL(href, "https://kunakair.com/").host.replace(/^www\./, "").endsWith("kunakair.com");
  } catch {
    return false;
  }
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL ARTÍCULO
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **Las 6 filas OCULTAS no entran en el dato**, y no es una poda: son
 * plantilla. `et_pb_row_0 d-none` existe una por artículo, ocupa 0×0 y lleva
 * dentro el `<h1>Kunak Help Center</h1>`, que **no es contenido del artículo**
 * (`cascaron.spec.md` §3). Las emite el componente. Lo que se guarda son las
 * **39 visibles**.
 */
const esVisible = (fila) => (SABOTAJE === "sin-ocultas" ? true : fila.renderizada !== false);

function articuloDe(url, a1440, a390, ev, cssPagina, sinExplicar) {
  const partes = url.split("/").filter(Boolean); // ["es", …, slug]
  const slug = partes[partes.length - 1];
  const prefijo = partes.slice(1, -1).join("/");

  const s1440 = a1440.propias;
  const s390 = a390.propias;
  if (s1440.length !== 1 || s390.length !== 1)
    throw new Error(`SECCIONES PROPIAS ≠ 1 en ${slug} (${s1440.length}/${s390.length}) — el modelo supone una, 6/6.`);

  const f1440 = s1440[0].filas.filter(esVisible);
  const f390 = s390[0].filas.filter(esVisible);
  if (f1440.length !== f390.length)
    throw new Error(`DESCUADRE de filas en ${slug}: ${f1440.length} a 1440 y ${f390.length} a 390.`);

  const cuerpo = f1440.map((fa, i) => {
    const fb = f390[i];
    const donde = `${slug}#fila${i}`;
    if ((fa.columnas || []).length !== (fb.columnas || []).length)
      throw new Error(`DESCUADRE de columnas en ${donde}`);
    const fila = {
      pt: medidaDe(fa.ritmo.paddingTop, fb.ritmo.paddingTop, ARTICULO_KB.filaPt.valor),
      pb: medidaDe(fa.ritmo.paddingBottom, fb.ritmo.paddingBottom, ARTICULO_KB.filaPb.valor),
      mt: medidaDe(fa.ritmo.marginTop, fb.ritmo.marginTop, ARTICULO_KB.filaMt.valor),
      mb: medidaDe(fa.ritmo.marginBottom, fb.ritmo.marginBottom, ARTICULO_KB.filaMb.valor),
      columnas: fa.columnas.map((ca, j) => {
        const cb = fb.columnas[j];
        if ((ca.modulos || []).length !== (cb.modulos || []).length)
          throw new Error(`DESCUADRE de módulos en ${donde}c${j}`);
        return {
          ancho: SABOTAJE === "reparto" ? "4_4" : tipoColumna(ca),
          modulos: ca.modulos.map((ma, k) =>
            moduloDe(ma, cb.modulos[k], ca, cb, `${donde}c${j}m${k}`, cssPagina, sinExplicar),
          ),
        };
      }),
    };
    for (const k of ["pt", "pb", "mt", "mb"]) if (fila[k] === undefined) delete fila[k];
    ev.ok();
    return fila;
  });

  /**
   * `titulo` es el `h2` VISIBLE y `seo.title` el `<title>` del documento, y
   * **no son el mismo texto**: en `que-puedes-hacer-con-kunak-air` el `<title>`
   * dice *«Qué puedes hacer…»* sin la `¿` de apertura que el `h2` sí trae. Es
   * una errata del original y va **verbatim** (regla 1 del repo) — y de paso es
   * la evidencia de que los dos son campos y no uno derivado del otro.
   */
  const h2 = s1440[0].filas.find(esVisible)?.columnas?.[0]?.modulos?.[0]?.titulares?.[0];
  if (!h2?.texto) throw new Error(`SIN TÍTULO VISIBLE en ${slug} — el invariante de forma dice h2 en la fila 1, 6/6.`);

  return {
    slug,
    prefijo,
    titulo: h2.texto,
    seo: { title: a1440.title },
    estado: "publicado",
    cuerpo,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * CORRIDA
 * ═════════════════════════════════════════════════════════════════════════ */

const lee = (f) => JSON.parse(readFileSync(join(MEDIDAS, f), "utf8"));
const spec1440 = lee("kb-spec-1440.json");
const spec390 = lee("kb-spec-390.json");

const urls = Object.keys(spec1440.articulos);
/** El mínimo se DERIVA: 39 filas visibles en las 6 instancias medidas. */
const FILAS_VISIBLES = urls.reduce(
  (n, u) => n + spec1440.articulos[u].propias[0].filas.filter((f) => f.renderizada !== false).length,
  0,
);
const ev = new Evaluadas({ unidad: "filas del cuerpo", minimo: FILAS_VISIBLES, nombre: "extractor-kb" });

/* ── EL SEGUNDO TESTIGO: el CSS que Divi compiló, por artículo ────────────── */
const INDICE = JSON.parse(readFileSync(join(RAIZ, "corpus/fase-3/INDICE.json"), "utf8"));
/** La clave de `kb-spec` es la RUTA (`/es/…`) y la del índice la URL completa. */
const soloRuta = (u) => new URL(u, "https://kunakair.com/").pathname.replace(/\/$/, "");
const ficheroDe = (url) => {
  const p = Object.values(INDICE.paginas).find((x) => soloRuta(x.url) === soloRuta(url));
  if (!p) throw new Error(`SIN CAPTURA para ${url} — el segundo testigo no puede faltar en silencio.`);
  return join(RAIZ, "corpus/fase-3", p.fichero);
};
const cssPorArticulo = Object.fromEntries(
  urls.map((u) => [u, pielesPorModulo(readFileSync(ficheroDe(u), "utf8"))]),
);

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA GUARDA ESTRUCTURAL VA ANTES DEL RECORRIDO, y esto lo enseñó el negativo
 *
 * `filas visibles` se comprobaba **al final**, sobre el dato ya emitido. Con
 * `titulares` en el extractor eso dejó de funcionar: el sabotaje `sin-ocultas`
 * mete las 6 filas `d-none`, dentro va el `<h1>Kunak Help Center</h1>`, y
 * `titularPorDefecto("h1")` **tira** —correctamente, porque el defecto de `h1`
 * no está medido en este arquetipo—. O sea que el sabotaje pasaba a caer por
 * una excepción aguas abajo **y no por su invariante**, que es justo lo que
 * `CLAUDE.md` §sondas prohíbe: *«si cae por uno ajeno, lo que se ha probado es
 * que el extractor es frágil, no que esa guarda esté viva»*.
 *
 * Lo cazó **volver a correr el test en negativo ENTERO** tras tocar el
 * extractor (§sondas 4, corolario). Leer el diff no lo habría visto: el diff
 * era correcto.
 *
 * La guarda de la salida (`exige("filas visibles", 39, censo.filas)`) se queda:
 * **son dos objetos distintos** —lo que se selecciona de la entrada y lo que se
 * emite—, y que coincidan es parte de lo que hay que comprobar.
 * ═════════════════════════════════════════════════════════════════════════ */
const FILAS_QUE_ENTRAN = urls.reduce(
  (n, u) => n + spec1440.articulos[u].propias[0].filas.filter(esVisible).length,
  0,
);
if (FILAS_QUE_ENTRAN !== FILAS_VISIBLES) {
  console.log(
    `\n❌ filas visibles: se esperaban ${FILAS_VISIBLES} y entran ${FILAS_QUE_ENTRAN}.\n` +
      `   Las 6 filas \`d-none\` son PLANTILLA (llevan el <h1> del centro de ayuda) y no dato.\n`,
  );
  process.exit(1);
}

/** Overrides que el computado ve y NINGUNA regla del CSS servido explica. */
const sinExplicar = [];
const articulos = urls.map((u) =>
  articuloDe(u, spec1440.articulos[u], spec390.articulos[u], ev, cssPorArticulo[u], sinExplicar),
);

/* ── El recuento, que es lo que hay que mirar para creerse la salida ─────── */
const censo = {
  filas: 0,
  columnas: 0,
  modulos: 0,
  porKind: {},
  repartos: {},
  medidas: { px: 0, pct: 0, movil: 0 },
  /** ⚠ Los porcentajes **distintos**, que no es lo mismo que cuántos nodos los llevan. */
  pctDistintos: {},
  /** Módulos cuyo `mb` coincide con su defecto y por eso NO viaja en el dato. */
  mbPorDefecto: 0,
  /** Titulares: cuántos llevan piel de campo y cuántos van con el defecto del tema. */
  titulares: { conPiel: 0, porDefecto: 0, porNivel: {}, pieles: {} },
  /** Las pieles del titular de blurb: grupo, no array (un control en Divi). */
  blurbPiel: { conPiel: 0, pieles: {} },
};
const cuentaMedida = (m) => {
  if (!m) return;
  if (m.unidad) censo.medidas[m.unidad === "pct" ? "pct" : "px"]++;
  if (m.unidad === "pct") censo.pctDistintos[m.valor] = (censo.pctDistintos[m.valor] || 0) + 1;
  if (m.movilValor !== undefined) censo.medidas.movil++;
};
for (const a of articulos)
  for (const f of a.cuerpo) {
    censo.filas++;
    for (const k of ["pt", "pb", "mt", "mb"]) cuentaMedida(f[k]);
    const reparto = f.columnas.map((c) => c.ancho).join("+");
    censo.repartos[reparto] = (censo.repartos[reparto] || 0) + 1;
    for (const c of f.columnas) {
      censo.columnas++;
      for (const m of c.modulos) {
        censo.modulos++;
        censo.porKind[m.blockType] = (censo.porKind[m.blockType] || 0) + 1;
        if (m.ritmo?.mb === undefined) censo.mbPorDefecto++;
        for (const k of ["mt", "mb", "pb"]) cuentaMedida(m.ritmo?.[k]);
        if (m.piel) {
          censo.blurbPiel.conPiel++;
          const cb = JSON.stringify(m.piel);
          censo.blurbPiel.pieles[cb] = (censo.blurbPiel.pieles[cb] || 0) + 1;
        }
        for (const t of m.titulares || []) {
          censo.titulares.conPiel++;
          censo.titulares.porNivel[t.nivel] = (censo.titulares.porNivel[t.nivel] || 0) + 1;
          const clave = `${t.nivel} ${JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k]) => k !== "nivel")))}`;
          censo.titulares.pieles[clave] = (censo.titulares.pieles[clave] || 0) + 1;
        }
      }
    }
  }

/* ── LAS GUARDAS, cada una contra su medida congelada ────────────────────── */
const problemas = [];
const exige = (que, esperado, real) => {
  if (esperado !== real) problemas.push(`${que}: se esperaban ${esperado} y salieron ${real}`);
};
exige("artículos", 6, articulos.length);
exige("filas visibles", 39, censo.filas);
exige("columnas", 54, censo.columnas);
exige("módulos", 143, censo.modulos);
exige("repartos distintos", 4, Object.keys(censo.repartos).length);
/**
 * ⚠ **Los CUATRO porcentajes son valores DISTINTOS, no cuatro nodos.**
 * `cuerpo.spec.md` §2.1 mide `2 · 5 · 0.8 · 0.4 %`; cuántas filas los llevan es
 * otra cifra (9). La primera versión de esta guarda exigía `4` contra el
 * recuento de NODOS y salía roja con el extractor correcto: es la §regla del
 * denominador —*la cobertura se declara en la unidad que la sonda compara*—
 * cometida dentro de la guarda que la sonda usa para creerse a sí misma.
 */
exige("porcentajes DISTINTOS", 4, Object.keys(censo.pctDistintos).length);
/**
 * Los módulos cuyo `mb` **coincide con su defecto y por eso se omite**. Es la
 * guarda de `mbPorDefecto`: con una constante en vez de la función, los 13 de
 * columna estrecha dejarían de coincidir y saldrían como campo.
 */
exige("módulos con `mb` en su defecto", 62, censo.mbPorDefecto);
/** Los overrides de móvil, que un extractor de un solo ancho no puede ver. */
exige("medidas con override de móvil", 26, censo.medidas.movil);
/**
 * ⚠ **Las pieles de titular, contra la medida que paró la tanda anterior.**
 * `qa:kb-tipografia` censó **30 titulares**: `h2` 6+11+3 · `h3` 4+4 · `h4` 2. De
 * ésos, **los 3 `h2` de 37 px, los 4 `h3` de #333 y los 2 `h4`** son el DEFECTO
 * del tema y **no viajan en el dato** (§1.5: se omite cuando coincide). Quedan
 * **21 con piel de campo**, y si el defecto se cablease mal saldrían 30 o 9.
 */
exige("titulares con piel de campo", 21, censo.titulares.conPiel);
/** Y las pieles DISTINTAS: 3, que son los dos overrides de `h2` y el de color de `h3`. */
exige("pieles de titular DISTINTAS", 3, Object.keys(censo.titulares.pieles).length);
/**
 * ⚠ **Los BLURBS: los 36, con las TRES pieles de `modulos.spec.md` §2.** Y la
 * guarda que de verdad prueba el defecto derivado es que **`fs` no aparece en
 * ninguna de las tres**: 18 px es el defecto, deducido de que la regla de ×3
 * omite `font-size` y computa `18/18`. Si el defecto estuviera mal, las tres
 * pieles traerían un `fs` explícito y este recuento se movería.
 */
exige("blurbs con piel de titular", 36, censo.blurbPiel.conPiel);
exige("pieles de blurb DISTINTAS", 3, Object.keys(censo.blurbPiel.pieles).length);
exige(
  "pieles de blurb que escriben `fs` (el defecto 18 lo hace innecesario)",
  0,
  Object.keys(censo.blurbPiel.pieles).filter((p) => /"fs"/.test(p)).length,
);
/**
 * ⚠ **Ningún override puede quedar sin explicar por el CSS servido.** Es lo que
 * convierte *«la captura no tiene las 19 hojas externas»* de riesgo silencioso
 * en fallo visible — y lo que cazó que el `text-align:center` del `h2` de
 * `text_13` es CONTENIDO (`style=` en el campo rico), no ajuste del módulo.
 */
for (const s of sinExplicar) problemas.push(`OVERRIDE SIN REGLA que lo explique: ${s}`);
const PCT_MEDIDOS = [0.4, 0.8, 2, 5];
for (const p of Object.keys(censo.pctDistintos).map(Number).sort((a, b) => a - b))
  if (!PCT_MEDIDOS.includes(p))
    problemas.push(`porcentaje NO medido: ${p} % (la spec §2.1 midió ${PCT_MEDIDOS.join(" · ")})`);

/* La retícula tiene que sumar 1 en las 39: es la misma regla que el `validate`
 * del esquema, comprobada aquí para que el fallo salga ANTES del alta. */
for (const a of articulos)
  for (const [i, f] of a.cuerpo.entries()) {
    const suma = f.columnas.reduce((s, c) => {
      const m = /^(\d+)_(\d+)$/.exec(c.ancho);
      return s + (m ? Number(m[1]) / Number(m[2]) : NaN);
    }, 0);
    if (Math.abs(suma - 1) > 1e-6) problemas.push(`${a.slug}#fila${i}: los anchos suman ${suma}, no 1`);
  }

console.log(`\n════════ EXTRACTOR · articulos-kb ════════`);
console.log(`  artículos      ${articulos.length}`);
console.log(`  filas          ${censo.filas}   (las 6 ocultas NO entran: son plantilla)`);
console.log(`  columnas       ${censo.columnas}`);
console.log(`  módulos        ${censo.modulos}`);
console.log(`  repartos       ${Object.entries(censo.repartos).map(([k, v]) => `${k}×${v}`).join(" · ")}`);
console.log(`  kinds          ${Object.entries(censo.porKind).map(([k, v]) => `${k}×${v}`).join(" · ")}`);
console.log(`  pct            ${Object.entries(censo.pctDistintos).map(([k, v]) => `${k}%×${v}`).join(" · ")}`);
console.log(`  medidas        px×${censo.medidas.px} · pct×${censo.medidas.pct} · con móvil×${censo.medidas.movil}`);
console.log(`  titulares      ${censo.titulares.conPiel} con piel de campo (${Object.entries(censo.titulares.porNivel).map(([k, v]) => `${k}×${v}`).join(" · ")}) · el resto, defecto del tema`);
for (const [p, n] of Object.entries(censo.titulares.pieles).sort((a, b) => b[1] - a[1]))
  console.log(`                 ×${String(n).padStart(2)}  ${p}`);
/* §sondas 1 — lo que se cuenta se imprime: los blurbs tienen guarda y tienen línea. */
console.log(`  blurbs         ${censo.blurbPiel.conPiel} con piel de titular (GRUPO, no array: Divi da un control)`);
for (const [p, n] of Object.entries(censo.blurbPiel.pieles).sort((a, b) => b[1] - a[1]))
  console.log(`                 ×${String(n).padStart(2)}  ${p}`);

w("medidas/kb-extraido.json", {
  meta: {
    fecha: hoy(),
    que: "Los 6 documentos de `articulos-kb` derivados de las medidas congeladas — la entrada del seed.",
    fuente: ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json"],
    porQue:
      "0 estilos en línea en las 45 filas y los 149 módulos: el ritmo sólo existe en el estilo computado. " +
      "Los DOS anchos hacen falta — uno solo no distingue px de %.",
    sabotaje: SABOTAJE,
  },
  censo,
  problemas,
  articulos,
});

if (problemas.length) {
  console.log(`\n❌ ${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`   · ${p}`);
  process.exitCode = 1;
} else {
  console.log(`\n✅ extractor-kb: ${articulos.length} documentos · 0 problemas.`);
}
console.log(`  ✓ evaluadas ${ev.n}/${FILAS_VISIBLES} filas del cuerpo · extractor-kb`);
