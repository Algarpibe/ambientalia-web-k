/**
 * ¿PUEDE CADA CAMPO CONTENER SU DATO MEDIDO? — el detector de **CMS-SP-TIPO**.
 * Uso:  npm run qa:tipo-hoja      Test en negativo:  npm run qa:tipo-hoja-neg
 *
 * ── La ficha que cierra, y por qué hacía falta ÉSTE y no otro ─────────────
 * `ESQUEMA-CMS.md` §7 abrió **CMS-SP-TIPO** el 2026-08-04 con esta frase:
 *
 *   > **ninguna guarda mira el TIPO de la hoja, sólo su nombre** — un campo
 *   > puede existir, llamarse bien y **no poder contener su dato medido**.
 *
 * El caso con nombre es `productos.bullets[].texto`: llevaba `editorNegrita`
 * —Párrafo + Negrita y nada más— y su dato medido trae `R<sup>2</sup> &gt;0,8`.
 * Pasaba `payload-types.ts` **y** `qa:cms-campos`, porque los dos miran la RUTA
 * del campo y ninguno su TIPO.
 *
 * §7b nombró las **dos** salidas posibles:
 *
 *   1 · el **Δ0 de render de F2-3** —comparar la salida renderizada, donde la
 *       pérdida sí existe—;
 *   2 · **una sonda que contraste el editor de cada campo contra el inventario
 *       de etiquetas medido de ese campo**.
 *
 * ⚠ **La salida 1 NO PUEDE cerrarla, y está medido (2026-08-06).** Las viñetas
 * de un producto sólo se sirven dentro de su PANEL, y `ProductosTabs` sólo
 * renderiza en servidor el panel del producto **activo** — el primero de la
 * lista. Derivado sobre las 10 instancias que pintan el bloque (1 home ·
 * 6 sectores · 3 casos): el activo es `monitor-calidad-aire` en **las 10**, y
 * sus 5 viñetas son texto plano. Los 4 `<sup>` viven en los productos 6, 8 y 9,
 * que **nunca son el activo**, así que **no hay una sola ruta emitida cuyo HTML
 * los contenga** — comprobado: `grep -rl "<sup>"` sobre `.next/server/app` da 5
 * ficheros y los 5 son cuerpos de grupo A, ninguno un panel de producto.
 *
 *   > **El mecanismo de pestañas es un CONTENEDOR CON HOLGURA**, y su holgura es
 *   > el panel entero de todo producto que no sea el primero. `html-cmp` mide el
 *   > HTML servido; lo que no se sirve, no lo puede ver.
 *
 * Así que ésta es la salida 2, y no es una alternativa cómoda: es **la única**.
 *
 * ── Qué compara, exactamente ──────────────────────────────────────────────
 * Dos lados que ya existen en el repo y que nadie había puesto uno frente al
 * otro:
 *
 *   · **lo que el campo PUEDE expresar** — de su `type` y, si es `richText`, de
 *     su `editor` **comparado POR REFERENCIA** con los declarados en
 *     `campos/comunes.ts`. No por el nombre: por el objeto;
 *   · **lo que su dato medido TRAE** — las etiquetas HTML que de verdad hay en
 *     los catálogos de `src/lib/*.ts`, extraídas con la misma expresión que usa
 *     el saneador del esquema.
 *
 * ── Las guardas, y cada una contra su forma de dar verde en falso ─────────
 *   · **detector muerto** (`CLAUDE.md` §sondas 4): si NINGUNA hoja del corpus
 *     trae marcado, el extractor está roto y todo saldría «expresable». Sale por
 *     error, nunca por cero. El mínimo se **deriva** del propio censo;
 *   · **editor desconocido** (regla 6): un `richText` con un editor que esta
 *     sonda no sabe evaluar **tira**. Suponer que expresa todo sería fabricar el
 *     verde en el sitio exacto del defecto que persigue;
 *   · **hoja sin emparejar**: una ruta medida con marcado que no case con ningún
 *     campo se cuenta como DEFECTO, no se ignora. «No lo encontré» y «está bien»
 *     no pueden dar la misma salida.
 *
 * ── Y un segundo eje, que sale del mismo sitio ────────────────────────────
 * `href` de `productos` **no se guarda**: §4 lo compone de `padre` + `slug`. El
 * eje `href` mide qué le pasa al dato medido en ese viaje y **si la ruta
 * compuesta la emite el build**. No es una pregunta de tipo sino de valor, pero
 * es la misma pregunta de fondo —*¿el esquema puede devolver lo que el dato
 * medido decía?*— y su respuesta no la ve ninguna otra sonda: esos `href` viajan
 * en la carga RSC como props del componente cliente, así que ni `qa:enlaces`
 * (recorre `<a href>` del marcado) ni `html-cmp` (la puerta es el marcado
 * visible) los miran.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, APP, env, gritaSiRevienta, hoy, leeManifiesto, rutasEmitidas, w } from "./lib.mjs";
import { cargaCatalogos } from "../seed/catalogos.mjs";
import { preparaProducto } from "../seed/seed.mjs";
import { devuelveProducto } from "../../packages/cms-config/src/vuelta.mjs";

gritaSiRevienta();

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const CMS = path.join(QA, "..", "..", "packages", "cms-config", "src");

/**
 * ⚠ **GANCHO DE TEST, declarado** (mismo patrón que `BUILD_ID` en `html-cmp`).
 * `TIPO_SABOTAJE=coleccion:ruta=tipo` cambia el tipo de una hoja **en memoria**
 * para que el negativo pueda comprobar que la sonda muerde. Se anuncia en la
 * salida: un gancho invisible puede fabricar un verde sin dejar rastro.
 */
const SABOTAJE = env("TIPO_SABOTAJE", null);

/**
 * El segundo gancho: **borra** una hoja del esquema. Es el que ejercita la
 * guarda de *hoja sin emparejar* — «no lo encontré» y «está bien» tienen que
 * dar salidas distintas, que es `CLAUDE.md` §sondas 4 en su forma de ruta.
 */
const BORRA = env("TIPO_BORRA", null);
if (BORRA) console.log(`⚠ TIPO_BORRA=${BORRA} — falta una hoja que el esquema SÍ tiene`);

/**
 * El otro gancho: la expresión que extrae etiquetas. El negativo la sustituye
 * por una que no case con nada para comprobar que un **detector muerto** sale
 * por error y no por cero.
 */
const PATRON = env("ETIQUETA_PATRON", null) ?? "<\\/?([a-zA-Z][a-zA-Z0-9-]*)(?=[\\s/>])";
if (SABOTAJE) console.log(`⚠ TIPO_SABOTAJE=${SABOTAJE} — el esquema NO es el del repo`);
if (env("ETIQUETA_PATRON", null)) console.log(`⚠ ETIQUETA_PATRON=${PATRON} — no es el patrón declarado`);

/* ─────────────────── LADO A · la config, importada como objeto ─────────── */

async function config() {
  const tmp = path.join(QA, ".tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const entrada = path.join(tmp, "tipo-hoja-entrada.ts");
  const r = (p) => path.join(CMS, p).replace(/\\/g, "/");
  fs.writeFileSync(
    entrada,
    `export { COLECCIONES } from ${JSON.stringify(r("colecciones.ts"))};\n` +
      `export { editorRico, editorNegrita } from ${JSON.stringify(r("campos/comunes.ts"))};\n`,
    "utf8",
  );
  const bundle = path.join(tmp, "tipo-hoja.mjs");
  await esbuild.build({
    entryPoints: [entrada],
    outfile: bundle,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
  });
  return import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
}

const { COLECCIONES, editorRico, editorNegrita } = await config();

/**
 * Lo que cada tipo de hoja PUEDE expresar.
 *
 * `code` es HTML crudo: expresa cualquier etiqueta **por construcción**, y su
 * whitelist la impone el `validate` del esquema, no el tipo. `text`/`textarea`
 * no expresan ninguna. Un `richText` expresa lo que su editor traiga, y por eso
 * el editor se identifica **por referencia al objeto exportado** y no por su
 * nombre — un nombre se puede escribir mal y el fallo sería silencioso.
 */
const TODAS = Symbol("todas");
const CAPACIDAD_RICH = new Map([
  /* `editorNegrita` = `[ParagraphFeature(), BoldFeature()]`, y nada más. Es la
   * lista que la propia definición trae en `campos/comunes.ts`. */
  [editorNegrita, { nombre: "editorNegrita", tags: new Set(["p", "strong", "b"]) }],
  /* `editorRico` existe y **hoy no lo usa ningún campo** (derivado: 6 `richText`
   * en las 16 colecciones, los 6 con `editorNegrita`). No se le escribe una
   * tabla de etiquetas a ciegas: el día que un campo lo use, esta sonda tiene
   * que **fallar** y obligar a derivarla de sus features. Lo SIN PROBAR no se
   * cablea (`CLAUDE.md` §Cómo se decide si algo es plantilla o campo). */
]);

function capacidad(campo) {
  if (campo.type === "code") return { como: "code (HTML crudo)", tags: TODAS };
  if (campo.type === "text" || campo.type === "textarea")
    return { como: `${campo.type} (texto plano)`, tags: new Set() };
  if (campo.type === "richText") {
    const c = CAPACIDAD_RICH.get(campo.editor);
    if (!c)
      return {
        error:
          `campo \`richText\` con un editor que esta sonda no sabe evaluar` +
          (campo.editor === editorRico ? " (`editorRico`: su tabla de etiquetas no está derivada)" : ""),
      };
    return { como: c.nombre, tags: c.tags };
  }
  return null; // no es una hoja de texto: no aplica
}

/**
 * Las hojas de la config, por ruta normalizada.
 *
 * ⚠ **La regla del ENVOLTORIO es la de `cms-campos`, y se reutiliza tal cual:**
 * Payload no tiene arrays de escalares, así que un `array` con UN solo subcampo
 * es el envoltorio del elemento y **es transparente** para la ruta
 * (`bullets[].texto` ↔ `bullets: string[]`). Escribirla otra vez con otro
 * criterio sería la clase C7 — dos definiciones de «lo mismo».
 */
function hojas(campos, prefijo, salida, col) {
  for (const c of campos ?? []) {
    if (!c) continue;
    if (!c.name) {
      if (Array.isArray(c.fields)) hojas(c.fields, prefijo, salida, col);
      continue;
    }
    const envoltorio = c.type === "array" && Array.isArray(c.fields) && c.fields.length === 1;
    const aqui = envoltorio ? prefijo0(prefijo, c.name) : prefijo0(prefijo, c.name);
    if (envoltorio) {
      hojas(c.fields, aqui, salida, col); // el subcampo NO añade segmento
      salida.set(aqui, c.fields[0]);
      continue;
    }
    if (Array.isArray(c.fields)) hojas(c.fields, aqui, salida, col);
    else if (Array.isArray(c.blocks)) for (const b of c.blocks) hojas(b.fields, `${aqui}.${b.slug}`, salida, col);
    else salida.set(aqui, c);
  }
  return salida;
}
const prefijo0 = (p, n) => (p ? `${p}.${n}` : n);

/* ─────────────────── LADO B · el dato medido ────────────────────────────── */

const RE_ETIQUETA = new RegExp(PATRON, "g");
const catalogos = await cargaCatalogos();

/** Recorre una fila medida y acumula, por ruta, las etiquetas que trae. */
function censoDeMarcado(v, ruta, col, salida) {
  if (typeof v === "string") {
    RE_ETIQUETA.lastIndex = 0;
    const tags = [...v.matchAll(RE_ETIQUETA)].map((m) => m[1].toLowerCase());
    if (!tags.length) return;
    const k = `${col}::${ruta}`;
    const e = salida.get(k) ?? { coleccion: col, ruta, tags: new Set(), ejemplo: null };
    tags.forEach((t) => e.tags.add(t));
    e.ejemplo ??= v.length > 90 ? `${v.slice(0, 90)}…` : v;
    salida.set(k, e);
    return;
  }
  if (Array.isArray(v)) return v.forEach((x) => censoDeMarcado(x, ruta, col, salida));
  if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) censoDeMarcado(x, prefijo0(ruta, k), col, salida);
}

const censo = new Map();
for (const [col, filas] of catalogos) for (const f of filas) censoDeMarcado(f, "", col, censo);

/* ── GUARDA · DETECTOR MUERTO (`CLAUDE.md` §sondas 4) ─────────────────────── */
if (censo.size === 0) {
  console.error(
    `\n❌ DETECTOR MUERTO — ninguna hoja del corpus trae marcado.\n` +
      `   Eso no es «el corpus es texto plano»: es que el extractor de etiquetas no casa\n` +
      `   con nada, y entonces TODOS los campos saldrían «expresables» sin haber mirado.`,
  );
  process.exitCode = 2;
}

/* ─────────────────── EL VEREDICTO · eje TIPO ────────────────────────────── */

if (censo.size > 0) {
  const informe = { meta: { fecha: hoy(), sabotaje: SABOTAJE ?? null }, tipo: [], href: {} };
  const ev = new Evaluadas({ nombre: "tipo-hoja", unidad: "hojas medidas con marcado", minimo: censo.size });

  console.log(`\n════════ ¿PUEDE CADA CAMPO CONTENER SU DATO? · ${censo.size} hojas con marcado ════════\n`);

  const porColeccion = new Map(COLECCIONES.map((c) => [c.slug, hojas(c.fields, "", new Map(), c.slug)]));
  let defectos = 0;

  for (const e of [...censo.values()].sort((a, b) => `${a.coleccion}${a.ruta}`.localeCompare(`${b.coleccion}${b.ruta}`))) {
    const mapa = porColeccion.get(e.coleccion);
    let campo = mapa?.get(e.ruta);
    if (campo && BORRA === `${e.coleccion}:${e.ruta}`) campo = undefined;
    if (campo && SABOTAJE) {
      const [col, resto] = SABOTAJE.split(":");
      const [ruta, tipo] = (resto ?? "").split("=");
      if (col === e.coleccion && ruta === e.ruta) campo = { ...campo, type: tipo, editor: undefined };
    }
    const tags = [...e.tags].sort();
    if (!mapa || !campo) {
      defectos++;
      ev.ok();
      console.log(
        `  ❌ ${e.coleccion} :: ${e.ruta}\n` +
          `       trae marcado (${tags.join(" ")}) y NO casa con ningún campo del esquema.\n` +
          `       «no lo encontré» y «está bien» no pueden dar la misma salida.`,
      );
      informe.tipo.push({ ...e, tags, veredicto: "SIN EMPAREJAR" });
      continue;
    }
    const cap = capacidad(campo);
    if (!cap) {
      defectos++;
      ev.ok();
      console.log(`  ❌ ${e.coleccion} :: ${e.ruta}\n       trae marcado y su campo es \`${campo.type}\`: no es una hoja de texto.`);
      informe.tipo.push({ ...e, tags, veredicto: `TIPO IMPROPIO (${campo.type})` });
      continue;
    }
    if (cap.error) {
      defectos++;
      ev.ok();
      console.log(`  ❌ ${e.coleccion} :: ${e.ruta}\n       ${cap.error}. Suponer que lo expresa TODO sería fabricar el verde.`);
      informe.tipo.push({ ...e, tags, veredicto: "EDITOR DESCONOCIDO" });
      continue;
    }
    const perdidas = cap.tags === TODAS ? [] : tags.filter((t) => !cap.tags.has(t));
    ev.ok();
    if (perdidas.length) {
      defectos++;
      console.log(
        `  ❌ ${e.coleccion} :: ${e.ruta}  —  campo \`${cap.como}\`\n` +
          `       NO puede expresar: ${perdidas.map((t) => `<${t}>`).join(" ")}   (trae: ${tags.join(" ")})\n` +
          `       ejemplo medido: ${e.ejemplo}`,
      );
      informe.tipo.push({ ...e, tags, campo: cap.como, perdidas, veredicto: "NO EXPRESABLE" });
    } else {
      console.log(`  ✅ ${e.coleccion} :: ${e.ruta}  —  \`${cap.como}\` expresa ${tags.join(" ")}`);
      informe.tipo.push({ ...e, tags, campo: cap.como, perdidas: [], veredicto: "EXPRESABLE" });
    }
  }

  /* ─────────────────── EJE 2 · `href` de `productos` ────────────────────── */

  const rutas = new Set(rutasEmitidas(leeManifiesto(APP)));
  const filas = catalogos.get("productos") ?? [];
  const href = filas.map((p) => {
    const compuesto = devuelveProducto(preparaProducto(p)).href;
    return { id: p.id, medido: p.href, compuesto, cambia: p.href !== compuesto, emitida: rutas.has(compuesto) };
  });
  const cambian = href.filter((h) => h.cambia);
  const rotas = href.filter((h) => !h.emitida);
  informe.href = { n: href.length, cambian: cambian.length, sinRutaEmitida: rotas.length, filas: href };

  console.log(`\n──── eje \`href\` · §4 lo compone de \`padre\` + \`slug\` · ${href.length} productos ────\n`);
  for (const h of href)
    console.log(
      `  ${h.emitida ? "✅" : "⚠ "} ${h.id.padEnd(42)} ${h.cambia ? `${h.medido} → ${h.compuesto}` : `${h.compuesto} (sin cambio)`}` +
        (h.emitida ? "" : "  ← el build NO emite esta ruta"),
    );
  console.log(
    `\n  ${cambian.length} de ${href.length} cambian de valor · ${rotas.length} apuntan a una ruta que el build no emite.\n` +
      `  Es la consecuencia DECLARADA de §4 (dentro del CMS los 24 son documentos), no un dato perdido —\n` +
      `  pero tiene número, y no la ve ninguna otra sonda: viaja en la carga RSC como props del cliente.`,
  );

  const evHref = new Evaluadas({ nombre: "tipo-hoja · href", unidad: "productos", minimo: filas.length });
  evHref.ok(href.length);

  /* Una corrida saboteada NO es una medida del sitio (`CLAUDE.md` §sondas 7):
   * escribe donde el negativo le diga, con su marcador en el nombre. */
  w(env("SALIDA") || `medidas/tipo-hoja.json`, informe);

  const fallos = ev.informe() + evHref.informe();
  console.log(
    `\n${defectos || fallos ? "❌" : "✅"} ${censo.size} hojas con marcado · ${defectos} que su campo NO puede contener\n` +
      (defectos
        ? `   CMS-SP-TIPO: un campo puede existir, llamarse bien y no poder contener su dato medido.\n`
        : `   Ningún campo pierde marcado de su corpus. Y el \`<sup>\` de \`productos.bullets\` está\n` +
          `   medido AQUÍ porque el HTML servido no puede verlo: su panel nunca es el activo.\n`),
  );
  process.exitCode = defectos || fallos ? 1 : 0;
}
