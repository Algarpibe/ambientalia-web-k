/**
 * LA GEOMETRÍA DE LA COLA LARGA, DERIVADA DEL CORPUS — ESCALÓN 2 de la 95.ª.
 * Uso: npm run qa:f33-geo        (SABOTAJE=selector-muerto | dominio-corto | sin-hojas)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO — escrito ANTES de mirar el dato
 *
 * `bloques/paginas.ts` declara **SIN PROBAR** el ritmo (`pt`·`pb`·`mt`·`mb`) y
 * el `anchoPct` de los 11 tipos, con la nota *«0 ejes comparados en las 32»*.
 * Esto los MIDE sobre la salida servida y publica su DISTRIBUCIÓN por tipo, que
 * es lo que permite aplicar los dos tests. No decide el modelo: describe.
 *
 * CONTESTA:
 *   · el ANCHO DE FILA real por régimen — **antes** de comparar nada contra
 *     ningún default (§*un default de ritmo se escribe CON SU CONTENEDOR*);
 *   · para cada tipo: `mt`·`mb`·`pt`·`pb` y `anchoPct`, con su n en **LAS DOS
 *     UNIDADES** (instancias y páginas) y su distribución de valores;
 *   · el **test A** (Divi): el número se mide a **1440 y a 390** en la MISMA
 *     corrida y sobre el MISMO módulo. Se mueve ⇒ lo pone la plantilla; igual a
 *     los dos anchos ⇒ lo escribió una persona en el builder ⇒ **campo**;
 *   · el **test B** (general): ¿varía entre hermanos de la misma página?
 *   · si **ancho de fila** y **tipo de columna** se pueden SEPARAR aquí, o si
 *     están confundidos como lo estaban en `articulos-kb` (§*dos variables
 *     confundidas*).
 *
 * NO CONTESTA, y va con su cardinal (§regla 14):
 *   · **NADA del clon.** Es un solo lado: el original capturado. La comparación
 *     de dos lados es `qa:f33-cmp`, y sigue a **0 ejes comparados** porque el
 *     lado del clon no existe;
 *   · **el CONTENIDO de los módulos.** Eso lo derivó `arbol-f33` y está en
 *     `bloques/paginas.ts`. Aquí sólo caja y ritmo;
 *   · **si un valor DEBE ser campo.** Los tests dicen qué está probado y qué no;
 *     la decisión de modelo es de quien escriba el bloque, con esto delante;
 *   · **el régimen `-T`.** Se fue con la webinar (§2j.3c, S1). El dominio son
 *     las **31** de `paginas`, no las 32 capturadas — y esa resta se DERIVA del
 *     `<body>`, no se escribe.
 *
 * ── POR QUÉ CON NAVEGADOR Y NO CON `grep` SOBRE LAS HOJAS ────────────────
 * Porque §El principio lo tiene medido y con fecha: *«el veredicto lo da
 * `getComputedStyle` SOBRE EL ORIGINAL, no `grep` sobre las hojas»*. Una
 * declaración puede estar servida, leerse bien y **no llegar a la propiedad**
 * —el `!important` del tema le ganó a una regla más específica y costó `30`
 * donde el valor real era `32`, cuatro veces—. Aquí se lee lo COMPUTADO.
 *
 * ── Y POR QUÉ OFFLINE ES LEGÍTIMO ────────────────────────────────────────
 * La captura va **con sus hojas** (`corpus/css/`), precondición pagada en la
 * 91.ª: **32/32 páginas**. Sin ellas la medida es plausible y falsa — está
 * medido (§F3-1-CSS-NO-CAPTURADO): una captura sin hojas dio `columna.width`
 * **678.52** contra **430.80** en vivo. Por eso el nº de hojas RESUELTAS se
 * cuenta, se publica y **una página con cero hojas cierra el código de salida**.
 * ═════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["selector-muerto", "dominio-corto", "sin-hojas"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — las 31 de `paginas`, DERIVADAS y no escritas
 *
 * De las 32 capturadas, **una no es de esta colección**: la webinar, que S1
 * mandó a `entradas-blog` (§2j.3c). El descuento se deriva del `<body>`
 * —`single-post` es una entrada— en vez de escribir su ruta: una lista de
 * literales aquí envejecería contra el ESQUEMA en silencio (§regla 9 caso 7).
 * ═════════════════════════════════════════════════════════════════════════ */
const LD = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;

/**
 * La MEMBRESÍA sale de `medidas/f33-rutas.json` —congelada y **commiteada** en
 * la 94.ª— que ya es el conjunto POST-S1: **31 rutas**, la webinar fuera. Se
 * lee de ahí y **no se enumera aquí**: una lista de rutas dentro de esta sonda
 * envejecería contra el ESQUEMA sin dar error (§regla 9 caso 7), y además ya
 * pasó una vez —`arbol-f33` enumera los 6 hubs L4 a mano—.
 */
const F33 = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;
if (!Array.isArray(F33) || F33.length === 0) throw new Error("f33-rutas.json sin `paginas`: no se puede derivar el dominio de la nada (§sondas 4).");

/** Régimen del documento: los DOS marcadores, y la combinación vacía es un dato. */
function regimenDe(html) {
  const body = /<body[^>]*class="([^"]*)"/i.exec(html)?.[1] ?? "";
  const B = /\bet_pb_pagebuilder_layout\b/.test(body);
  const T = /\bet-tb-has-body\b/.test(body);
  return { codigo: `${B ? "B" : "-"}${T ? "T" : "-"}`, body };
}

const porRuta = new Map(LD.filter((e) => e.fichero).map((e) => [e.ruta, e]));
const PAGINAS = [];
const sinCaptura = [];
for (const r of F33) {
  const e = porRuta.get(r.ruta);
  if (!e || !existsSync(join(CORPUS, e.fichero))) { sinCaptura.push(r.ruta); continue; }
  const reg = regimenDe(readFileSync(join(CORPUS, e.fichero), "utf8"));
  PAGINAS.push({ ...e, regimen: reg.codigo, body: reg.body });
}

/**
 * ⚠ **CONTROL CRUZADO, y no es adorno** (§sondas 4: *cruzar con otra medida del
 * mismo objeto es obligatorio*). La membresía viene de `f33-rutas`; el `<body>`
 * es **otro instrumento sobre el mismo objeto**. Si alguna de las 31 llevara
 * `single-post`, o `f33-rutas` está desactualizada o S1 no se aplicó — y las
 * dos cosas invalidan el dominio, así que TIRA en vez de medir.
 */
const intrusas = PAGINAS.filter((p) => /\bsingle-post\b/.test(p.body)).map((p) => p.ruta);
if (intrusas.length)
  throw new Error(
    `DOMINIO CONTRADICHO: ${intrusas.length} de las ${PAGINAS.length} rutas de \`f33-rutas.json\` llevan \`single-post\` en su <body>\n` +
      `  — o sea que son ENTRADAS DE BLOG y S1 (§2j.3c) las sacó de \`paginas\`: ${intrusas.join(" · ")}\n` +
      `  Dos instrumentos en desacuerdo sobre el dominio: se resuelve ANTES de leer ningún número.`,
  );
if (sinCaptura.length)
  throw new Error(
    `${sinCaptura.length} de las ${F33.length} rutas de \`paginas\` SIN CAPTURA en el corpus: ${sinCaptura.join(" · ")}\n` +
      `  La precondición de la 91.ª dice 32/32 con sus hojas. Si falta una, la geometría de esa página\n` +
      `  no se puede derivar offline y «no medida» no puede salir como «sin datos» (§regla 6).`,
  );

/* SABOTAJE `dominio-corto` — el dominio encogido. §regla 22: el veredicto se
 * cierra con el CARDINAL, no con un booleano; y el mínimo se deriva de
 * `f33-rutas`, NO de lo que el sabotaje deje, o movería la portería (§regla 17). */
const TODAS = PAGINAS;
const MINIMO = F33.length;
const DOMINIO = SABOTAJE === "dominio-corto" ? PAGINAS.slice(0, 4) : PAGINAS;

const ev = new Evaluadas({ nombre: "f33-geo", unidad: "páginas de `paginas`", minimo: MINIMO });

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LAS HOJAS — sin ellas la geometría es ficción PLAUSIBLE
 * ═════════════════════════════════════════════════════════════════════════ */
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (LOCAL.size === 0) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

function conHojasLocales(html) {
  let enlazadas = 0, resueltas = 0;
  const out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    if (SABOTAJE === "sin-hojas") return "";
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    resueltas++;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  return { html: out, enlazadas, resueltas };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LA MEDIDA — dentro de la página, sobre lo COMPUTADO
 *
 * Se recorre la CAPA PROPIA (`et_pb_*` sin `_tb_`) en sus cuatro niveles y se
 * anota, de cada nodo, su ritmo computado y su caja. El identificador es el
 * ordinal que Divi escribe (`et_pb_text_3`), que es estable entre anchos — y
 * eso es lo que permite emparejar 1440 con 390 SOBRE EL MISMO MÓDULO, que es
 * lo que el test A exige.
 * ═════════════════════════════════════════════════════════════════════════ */
const censo = new Censo();

function medir(sabotajeSelector) {
  const $$ = (s) => globalThis.__qa(s);
  const px = (v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  };
  const ritmo = (el) => {
    const cs = getComputedStyle(el);
    return { mt: px(cs.marginTop), mb: px(cs.marginBottom), pt: px(cs.paddingTop), pb: px(cs.paddingBottom) };
  };
  const propia = (el) => ![...el.classList].some((c) => c.includes("_tb_"));
  /** `et_pb_<tipo>_<n>` de la capa propia. `null` si no lo lleva. */
  const idDe = (el) => {
    for (const c of el.classList) {
      const m = /^et_pb_([a-z][a-z0-9_]*?)_(\d+)$/.exec(c);
      if (m && !c.includes("_tb_")) return { tipo: m[1], ord: Number(m[2]), id: c };
    }
    return null;
  };
  const esEstructura = (t) => /^(section|row|row_inner|column(_\d+)?|column_inner(_\d+)?)$/.test(t);

  /* SABOTAJE `selector-muerto`: el selector de sección pasa a uno que no existe.
   * Tiene que salir por ERROR, nunca por «esta página no tiene secciones». */
  const SEL_SEC = sabotajeSelector ? ".et_pb_seccion_que_no_existe" : ".et_pb_section";

  const secciones = [], filas = [], columnas = [], modulos = [];

  for (const sec of $$(SEL_SEC)) {
    if (!propia(sec)) continue;
    const idS = idDe(sec);
    secciones.push({ id: idS?.id ?? null, ...ritmo(sec), w: px(sec.getBoundingClientRect().width) });

    for (const fila of sec.querySelectorAll(".et_pb_row, .et_pb_row_inner")) {
      if (!propia(fila)) continue;
      const wFila = px(fila.getBoundingClientRect().width);
      filas.push({ id: idDe(fila)?.id ?? null, seccion: idS?.id ?? null, ...ritmo(fila), w: wFila });

      for (const col of fila.querySelectorAll('[class*="et_pb_column"]')) {
        if (!propia(col)) continue;
        const reparto = [...col.classList].map((c) => /^et_pb_column_(\d+_\d+)$/.exec(c)?.[1]).find(Boolean) ?? null;
        const wCol = px(col.getBoundingClientRect().width);
        columnas.push({ fila: idDe(fila)?.id ?? null, reparto, w: wCol, wFila });

        /* Los módulos DIRECTOS de esta columna: no se desciende dentro de otro
         * módulo (así `et_pb_slide` se queda DENTRO de su slider). */
        const baja = (n) => {
          for (const h of n.children) {
            const d = idDe(h);
            if (d && !esEstructura(d.tipo)) {
              const w = px(h.getBoundingClientRect().width);
              modulos.push({
                id: d.id, tipo: d.tipo, ...ritmo(h), w,
                wCol, wFila, reparto,
                /**
                 * ⚠ `display` NO es adorno: acota lo que `anchoPct` puede
                 * significar. En un módulo de BLOQUE, `w / wCol` recupera el
                 * ancho de módulo que el editor declaró. En uno de nivel
                 * ENLÍNEA —el botón, el icono— la caja mide **su contenido**,
                 * así que la razón es del texto y no de ninguna declaración.
                 */
                display: getComputedStyle(h).display,
                anchoPct: wCol ? Math.round((w / wCol) * 10000) / 100 : null,
              });
              continue;
            }
            baja(h);
          }
        };
        baja(col);
      }
    }
    /* Los módulos *fullwidth* cuelgan de la SECCIÓN sin pasar por fila. */
    for (const h of sec.children) {
      const d = idDe(h);
      if (!d || esEstructura(d.tipo) || !propia(h)) continue;
      const w = px(h.getBoundingClientRect().width);
      modulos.push({ id: d.id, tipo: d.tipo, ...ritmo(h), w, wCol: null, wFila: null, reparto: null, anchoPct: null, sinFila: true });
    }
  }

  return { secciones, filas, columnas, modulos, hojasAplicadas: document.styleSheets.length };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL RECORRIDO — cada página a LOS DOS ANCHOS, en la misma corrida
 * ═════════════════════════════════════════════════════════════════════════ */
const UA_MOVIL = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";

const { browser } = await launch();
const datos = [];
const hojasCero = [];

for (const pg of DOMINIO) {
  const crudo = readFileSync(join(CORPUS, pg.fichero), "utf8");
  const { html, enlazadas, resueltas } = conHojasLocales(crudo);

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let bloqueadas = 0;
  page.on("request", (r) => {
    if (r.url().startsWith("file://") || r.url() === "about:blank") return r.continue();
    bloqueadas++;
    r.abort();
  });

  const porAncho = {};
  await page.goto(pathToFileURL(join(CORPUS, pg.fichero)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });

  /**
   * ⚠⚠ **LAS IMÁGENES PEREZOSAS, ANTES DE MEDIR — y esto NO es higiene: era
   * una DERIVA DE INSTRUMENTO medida en esta misma tanda.**
   *
   * `CLAUDE.md` §Notas de método lo tiene escrito —*«conviene además forzar las
   * imágenes perezosas a `eager`»*— y la primera versión de esta sonda se lo
   * saltó. Dos corridas **del mismo código** dieron `269` y `270` módulos con
   * caja, y el diff de veredictos salió **confinado enteramente a `image`**:
   * un módulo entraba y salía del emparejado a 390 según hubiera cargado su
   * `<img>` o no.
   *
   * **Y así es como NO se lee un residuo de 1:** «el original no es
   * determinista» es la hipótesis que no puede fallar y que contamina hacia
   * atrás todo lo medido (§regla 16). La explicación aburrida —un `loading=lazy`
   * que este repo ya sabe neutralizar— estaba disponible, y el discriminador
   * fue que **la deriva tenía UN SOLO TIPO dentro**.
   */
  /**
   * ⚠ **La espera va ACOTADA, y el tope es parte del contrato.** Con la red
   * cortada, toda imagen externa se aborta: su `onerror` normalmente dispara,
   * pero **no siempre** —una `src` vacía o ya abortada deja la promesa
   * colgada—. La primera versión de esto **colgó la sonda hasta el
   * `protocolTimeout`**, que es §regla 17: una espera sin tope no da rojo, se
   * AGOTA — ni pasa ni falla.
   */
  const asienta = async () => {
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll("img")) { img.loading = "eager"; img.decoding = "sync"; }
      const listas = Promise.all(
        [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })),
      );
      await Promise.race([listas, new Promise((r) => setTimeout(r, 2000))]);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
  };
  await asienta();

  for (const ancho of [1440, 390]) {
    if (ancho <= 500) {
      await page.setViewport({ width: ancho, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await page.setUserAgent(UA_MOVIL);
    } else {
      await page.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1 });
    }
    /* Y OTRA VEZ tras cambiar el viewport: un `srcset` puede pedir un fichero
     * distinto a 390, así que asentar sólo una vez dejaría el otro ancho con
     * la misma deriva que este bloque acaba de quitar. */
    await asienta();
    censo.grupo(`${pg.regimen}@${ancho}`);
    /* `Censo.medir` devuelve `{ datos, censo }`: lo medido es `.datos`. */
    porAncho[ancho] = (await censo.medir(page, medir, SABOTAJE === "selector-muerto")).datos;
  }
  await page.close();

  if (enlazadas && !resueltas) hojasCero.push(pg.ruta);
  datos.push({ ruta: pg.ruta, regimen: pg.regimen, hojas: { enlazadas, resueltas, aplicadas: porAncho[1440].hojasAplicadas, bloqueadas }, ...porAncho });
  ev.ok();
  process.stdout.write(`  · ${pg.ruta.padEnd(62)} ${pg.regimen} · ${porAncho[1440].modulos.length} módulos · ${porAncho[1440].filas.length} filas\n`);
}
await browser.close();

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

const todosMod1440 = datos.flatMap((d) => d[1440].modulos.map((m) => ({ ...m, ruta: d.ruta, regimen: d.regimen })));
const todosMod390 = datos.flatMap((d) => d[390].modulos.map((m) => ({ ...m, ruta: d.ruta, regimen: d.regimen })));
const todasFilas = datos.flatMap((d) => d[1440].filas.map((f) => ({ ...f, ruta: d.ruta, regimen: d.regimen })));
const todasCols = datos.flatMap((d) => d[1440].columnas.map((c) => ({ ...c, ruta: d.ruta, regimen: d.regimen })));
const todasSecs = datos.flatMap((d) => d[1440].secciones.map((s) => ({ ...s, ruta: d.ruta, regimen: d.regimen })));

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CRITERIO DE «UNO», ANTES DE NINGÚN RECUENTO — y no es higiene
 *
 * §*un censo de NODOS y un censo de LO QUE SE VE son dos medidas distintas, y
 * la primera se lee como la segunda en cuanto el CSS puede esconder*. Aquí el
 * CSS esconde: el centro de ayuda sirve sus vídeos dentro de DESPLEGABLES
 * cerrados, así que sus módulos **están en el DOM y no están en la página** —
 * caja de ancho 0.
 *
 * Y no es sólo que el recuento cambie: **la GEOMETRÍA de un elemento sin caja
 * no es medible.** `getComputedStyle` sobre un `display:none` no resuelve los
 * porcentajes contra nada, así que su `mb: 0` no significa «el editor puso 0»:
 * significa **que no hay contra qué resolverlo**. Meterlos en la distribución
 * fabricaría un pico en 0 que el original no tiene.
 *
 * Por eso todo lo de abajo se calcula sobre **los que tienen caja**, y el
 * recuento se publica **con sus dos criterios**.
 * ═════════════════════════════════════════════════════════════════════════ */
const conCaja = (x) => Number.isFinite(x.w) && x.w > 0;
const mod1440 = todosMod1440.filter(conCaja);
const mod390 = todosMod390.filter(conCaja);
const filasConCaja = todasFilas.filter(conCaja);
const colsConCaja = todasCols.filter(conCaja);
const sinCaja = todosMod1440.filter((m) => !conCaja(m));
const sinCajaPorTipo = {};
const sinCajaPorRuta = {};
for (const m of sinCaja) {
  sinCajaPorTipo[m.tipo] = (sinCajaPorTipo[m.tipo] || 0) + 1;
  sinCajaPorRuta[m.ruta] = (sinCajaPorRuta[m.ruta] || 0) + 1;
}

console.log(`\n════════ LA GEOMETRÍA DE LA COLA LARGA — 31 páginas, dos anchos, un solo lado ════════\n`);
console.log(`   capturas legibles                 ${String(TODAS.length).padStart(4)}`);
console.log(`   · membresía DERIVADA de              medidas/f33-rutas.json (94.ª, congelada) — ${F33.length} rutas POST-S1`);
console.log(`   · control cruzado \`<body>\`         ${String(intrusas.length).padStart(4)}   \`single-post\` en el dominio (tiene que ser 0)`);
console.log(`   páginas de \`paginas\` medidas      ${String(DOMINIO.length).padStart(4)}   (mínimo derivado: ${MINIMO})`);
console.log(`\n   ⚠ EL RECUENTO VA CON SUS DOS CRITERIOS — «en el DOM» y «con caja» no son la misma medida:`);
console.log(`     secciones   ${String(todasSecs.length).padStart(4)} en el DOM`);
console.log(`     filas       ${String(todasFilas.length).padStart(4)} en el DOM · ${String(filasConCaja.length).padStart(4)} CON CAJA`);
console.log(`     columnas    ${String(todasCols.length).padStart(4)} en el DOM · ${String(colsConCaja.length).padStart(4)} CON CAJA`);
console.log(`     módulos     ${String(todosMod1440.length).padStart(4)} en el DOM · ${String(mod1440.length).padStart(4)} CON CAJA   ← los ${sinCaja.length} sin caja NO son medibles`);
console.log(`     (los 313 del DOM cuadran con \`arbol-f33.log\` y con §2j.3c: otro instrumento, mismo objeto)`);

/* ── 5a · EL ANCHO DE FILA, ANTES DE COMPARAR NADA ────────────────────────── */
const anchosFila = {};
for (const f of filasConCaja) (anchosFila[f.regimen] ??= {})[f.w] = (anchosFila[f.regimen][f.w] || 0) + 1;
console.log(`\n  ══ 5a · EL ANCHO DE FILA REAL, POR RÉGIMEN — y va ANTES de cualquier default ══`);
console.log(`     Este repo tiene medido que 57.5938 · 28.7969 · 34.0469 son PORCENTAJES resueltos`);
console.log(`     contra una fila de 1238.39, y que leerlos como constantes donde la fila mide`);
console.log(`     911.75 habría inventado ~30 campos. Así que primero: ¿cuánto mide la fila AQUÍ?`);
for (const [reg, m] of Object.entries(anchosFila)) {
  const filas = Object.entries(m).sort((a, b) => b[1] - a[1]);
  console.log(`     ${reg}  →  ${filas.map(([w, n]) => `${w} (×${n})`).join(" · ")}`);
}

/* ── 5b · ¿SE PUEDEN SEPARAR ANCHO DE FILA Y TIPO DE COLUMNA? ─────────────── */
const cruce = {};
for (const c of colsConCaja) {
  if (!c.wFila || !c.reparto) continue;
  const k = `${c.wFila}`;
  (cruce[k] ??= new Set()).add(c.reparto);
}
const anchosDistintos = Object.keys(cruce);
console.log(`\n  ══ 5b · ¿ANCHO DE FILA y TIPO DE COLUMNA se pueden SEPARAR aquí? ══`);
for (const [w, reps] of Object.entries(cruce)) console.log(`     fila ${w.padStart(8)} → repartos {${[...reps].sort().join(", ")}}`);
const separables = anchosDistintos.length > 1;
console.log(
  separables
    ? `     ✅ **SÍ**: hay ${anchosDistintos.length} anchos de fila distintos, así que las dos variables VARÍAN y no están confundidas.`
    : `     ⚠ **NO**: un solo ancho de fila (${anchosDistintos[0]}). Ancho de fila y tipo de columna están CONFUNDIDOS\n` +
      `        en este dominio — cualquier regla que se escriba «depende de X» nombra una de las dos AL AZAR\n` +
      `        (§dos variables confundidas). Se declara y NO se elige.`,
);

/* ══════════════════════════════════════════════════════════════════════════
 * 5b-bis · ⚠⚠ EL DEFAULT DE `mb`, CONTRA SU CONTENEDOR — el hallazgo de 5a puesto a prueba
 *
 * `CLAUDE.md` §Test A tiene esto derivado sobre DOS arquetipos, y con una
 * corrección que costó una tanda: *«la variable que manda es el ANCHO DE LA
 * FILA, no el tipo de columna»* — `34.0469` = 2.75 % de una fila de 1238.39;
 * `25.0625` = 2.75 % de una de 911.75. La regla vieja («depende del TIPO DE
 * COLUMNA») era cierta en `articulos-kb` **porque allí todas las filas miden
 * 911.75** y las dos variables estaban confundidas.
 *
 * **Aquí NO lo están** —5b acaba de medir 4 anchos de fila con repartos
 * solapados—, así que este arquetipo es el **TERCERO** y puede volver a
 * separarlas. Se comprueba, no se supone.
 * ═════════════════════════════════════════════════════════════════════════ */
const DEFAULTS_MB = { 1238.39: 34.05, 911.75: 25.06 };
const cruceMb = {};
for (const m of mod1440) {
  if (!m.wFila || m.mb == null) continue;
  const k = `${m.wFila}`;
  const e = (cruceMb[k] ??= { total: 0, enElDefault: 0, esperado: DEFAULTS_MB[k] ?? null, porReparto: {}, valores: {} });
  e.total++;
  e.valores[m.mb] = (e.valores[m.mb] || 0) + 1;
  if (e.esperado != null && Math.abs(m.mb - e.esperado) < 0.02) {
    e.enElDefault++;
    (e.porReparto[m.reparto ?? "?"] ??= 0);
    e.porReparto[m.reparto] = (e.porReparto[m.reparto] || 0) + 1;
  }
}
console.log(`\n  ══ 5b-bis · ¿EL DEFAULT DE \`mb\` SIGUE SIENDO FUNCIÓN DEL ANCHO DE FILA? ══`);
console.log(`     2.75 % de 1238.39 = 34.05 · 2.75 % de 911.75 = 25.06. Se cuenta cuántos módulos`);
console.log(`     de cada ancho de fila caen EN SU default —y con qué repartos de columna—.\n`);
let mbCoherente = true;
for (const [w, e] of Object.entries(cruceMb)) {
  if (e.esperado == null) { console.log(`     fila ${w.padStart(8)} → ${e.total} módulos · sin default conocido para este ancho`); continue; }
  const reps = Object.keys(e.porReparto).sort().join(", ");
  console.log(`     fila ${w.padStart(8)} → ${String(e.enElDefault).padStart(3)} de ${String(e.total).padStart(3)} módulos en ${e.esperado}   repartos que lo llevan: {${reps}}`);
  /* El cruce que SEPARA: si el mismo default sale con repartos DISTINTOS, el
   * tipo de columna no lo explica; si sale con uno solo, no se puede separar. */
  if (Object.keys(e.porReparto).length < 2) mbCoherente = false;
}
/* Y la comprobación cruzada, que es la que refuta la regla vieja: ¿algún
 * módulo lleva el default de la OTRA fila? */
const cruzados = mod1440.filter((m) => {
  if (!m.wFila || m.mb == null) return false;
  const mio = DEFAULTS_MB[`${m.wFila}`];
  const otros = Object.values(DEFAULTS_MB).filter((v) => v !== mio);
  return otros.some((v) => Math.abs(m.mb - v) < 0.02);
});
console.log(
  `\n     módulos con el default de OTRO ancho de fila: **${cruzados.length}**` +
    (cruzados.length === 0
      ? `  ✅ ninguno — la regla del ANCHO DE FILA se sostiene en este tercer arquetipo`
      : `  ⛔ ${[...new Set(cruzados.map((c) => `${c.tipo}@${c.wFila}=${c.mb}`))].slice(0, 8).join(" · ")}`),
);
/**
 * ⚠⚠ **LA INSTANCIA SEPARADORA, y no es «cada default con varios repartos».**
 *
 * Contar repartos por ancho de fila es un indicio; lo que SEPARA las dos
 * variables es **el mismo TIPO DE COLUMNA en dos anchos de fila distintos, con
 * dos defaults distintos**. Si existe, el tipo de columna queda refutado como
 * causa **sin discusión posible**; si no existe, no hay separadoras y la regla
 * se declara SIN PROBAR en este dominio (§*cuenta las instancias separadoras y
 * publica ese número al lado del acierto*).
 */
const porReparto = {};
for (const m of mod1440) {
  if (!m.wFila || m.mb == null || !m.reparto) continue;
  const esperado = DEFAULTS_MB[`${m.wFila}`];
  if (esperado == null || Math.abs(m.mb - esperado) >= 0.02) continue;
  ((porReparto[m.reparto] ??= {})[m.wFila] ??= new Set()).add(m.mb);
}
const separadoras = Object.entries(porReparto)
  .filter(([, porW]) => Object.keys(porW).length > 1)
  .map(([rep, porW]) => ({ reparto: rep, casos: Object.entries(porW).map(([w, s]) => `fila ${w} ⇒ mb ${[...s].join("/")}`) }));

console.log(`\n     ── LA INSTANCIA SEPARADORA: ¿el MISMO reparto con DOS defaults según la fila? ──`);
if (separadoras.length === 0) {
  console.log(`     ⚠ **0 separadoras.** Ningún tipo de columna aparece en dos anchos de fila con defaults`);
  console.log(`        distintos, así que en ESTE dominio ancho-de-fila y tipo-de-columna **no se separan**`);
  console.log(`        y la regla queda SIN PROBAR aquí — se declara, no se elige.`);
} else {
  for (const s of separadoras) console.log(`     ✅ \`${s.reparto}\` → ${s.casos.join("  ·  ")}`);
  console.log(
    `\n     **${separadoras.length} separadora(s).** El MISMO tipo de columna lleva DOS defaults distintos según\n` +
      `     el ancho de su fila, así que el tipo de columna **NO** los explica y la **FILA sí**. Este es el\n` +
      `     TERCER arquetipo donde se mide, y reproduce la corrección de \`CLAUDE.md\` §Test A de forma\n` +
      `     independiente — en \`articulos-kb\` las dos variables estaban confundidas y no podía verse.`,
  );
}
if (!mbCoherente)
  console.log(
    `\n     ⚠ Y con su matiz: en algún ancho de fila el default sale con **un solo reparto**, así que ESE\n` +
      `        ancho por sí solo no separaría nada. Lo que separa es el CRUCE de arriba, no cada fila suelta.`,
  );

/* ── 5c · POR TIPO: n en LAS DOS UNIDADES + distribución + los dos tests ──── */
const porTipo = {};
for (const m of todosMod1440) (porTipo[m.tipo] ??= { inst: 0, instConCaja: 0, paginas: new Set(), paginasConCaja: new Set(), val: { mt: {}, mb: {}, pt: {}, pb: {}, anchoPct: {} }, porPagina: {} }).inst++;
for (const m of todosMod1440) porTipo[m.tipo].paginas.add(m.ruta);
for (const m of mod1440) {
  const t = porTipo[m.tipo];
  t.instConCaja++;
  t.paginasConCaja.add(m.ruta);
  for (const eje of ["mt", "mb", "pt", "pb", "anchoPct"]) {
    const v = m[eje];
    if (v == null) continue;
    t.val[eje][v] = (t.val[eje][v] || 0) + 1;
    ((t.porPagina[m.ruta] ??= {})[eje] ??= new Set()).add(v);
  }
}
/** Test A · el MISMO módulo a 1440 y a 390. Se empareja por `ruta+id`. */
const en390 = new Map(mod390.map((m) => [`${m.ruta}|${m.id}`, m]));
const testA = {};
for (const m of mod1440) {
  const o = en390.get(`${m.ruta}|${m.id}`);
  if (!o) continue;
  const t = (testA[m.tipo] ??= { mt: { mueve: 0, igual: 0 }, mb: { mueve: 0, igual: 0 }, pt: { mueve: 0, igual: 0 }, pb: { mueve: 0, igual: 0 }, anchoPct: { mueve: 0, igual: 0 }, pares: 0 });
  t.pares++;
  for (const eje of ["mt", "mb", "pt", "pb", "anchoPct"]) {
    if (m[eje] == null || o[eje] == null) continue;
    if (m[eje] === o[eje]) t[eje].igual++; else t[eje].mueve++;
  }
}

console.log(`\n  ══ 5c · CADA TIPO, CON SU n EN LAS DOS UNIDADES ══`);
console.log(`     ⚠ n se publica en instancias Y en páginas porque los dos números circulan y no cuadran:`);
console.log(`        §2j.4 dice «3 tipos en n = 1» y PLAN-FASE-3 §F3-3 dice «4 tipos a n = 1». Ver 5e.`);
console.log(`\n     ${"tipo".padEnd(18)} ${"DOM".padStart(5)} ${"pág".padStart(4)} │ ${"caja".padStart(5)} ${"pág".padStart(4)}   valores distintos por eje (1440, sólo con caja)`);
const tiposOrd = Object.entries(porTipo).sort((a, b) => b[1].inst - a[1].inst);
for (const [tipo, t] of tiposOrd) {
  const res = ["mt", "mb", "pt", "pb", "anchoPct"].map((e) => `${e} ${Object.keys(t.val[e]).length}`).join(" · ");
  const marca = t.instConCaja < t.inst ? ` ⚠ ${t.inst - t.instConCaja} sin caja` : "";
  console.log(
    `     ${tipo.padEnd(18)} ${String(t.inst).padStart(5)} ${String(t.paginas.size).padStart(4)} │ ` +
      `${String(t.instConCaja).padStart(5)} ${String(t.paginasConCaja.size).padStart(4)}   ${res}${marca}`,
  );
}

console.log(`\n  ══ 5d · LOS DOS TESTS, POR TIPO Y POR EJE ══`);
console.log(`     A = test de Divi (1440 vs 390 sobre el MISMO módulo): «mueve» ⇒ plantilla · «igual» ⇒ campo`);
console.log(`     B = varianza INTRA-PÁGINA entre hermanos: «varía» ⇒ campo (sin restricción de alcance)`);
console.log(`     ⚠ El test A NO vale para la CAJA ni la TIPOGRAFÍA: \`anchoPct\` se escribe en % igual que su`);
console.log(`        default, así que se mueve con el ancho LO ESCRIBA QUIEN LO ESCRIBA — y sin embargo es campo.`);
console.log(`        Su columna A se publica pero se lee como NO CONCLUYENTE, con su marca.\n`);
const veredictos = {};
for (const [tipo, t] of tiposOrd) {
  const a = testA[tipo] ?? {};
  const lineas = [];
  for (const eje of ["mt", "mb", "pt", "pb", "anchoPct"]) {
    const vals = Object.keys(t.val[eje]);
    if (vals.length === 0) continue;
    /* Test B: ¿alguna página tiene DOS valores distintos entre hermanos? */
    const paginasQueVarian = Object.entries(t.porPagina).filter(([, ejes]) => (ejes[eje]?.size ?? 0) > 1).length;
    const A = a[eje] ?? { mueve: 0, igual: 0 };
    const noConcluyente = eje === "anchoPct";
    /**
     * ⚠⚠ **EL CERO NO ES UN VALOR ESCRITO, Y EL TEST A NO PUEDE VERLO.**
     *
     * El test A dice: *lo que el editor NO toca es responsive; lo que toca queda
     * en px absolutos, iguales a 1440 y a 390*. Su premisa es que **hay algo
     * escrito**. Un `margin-top` computado de **`0`** es el **valor inicial** de
     * la propiedad: sale igual a los dos anchos **porque nadie escribió nada**,
     * no porque alguien escribiera «0px».
     *
     * Leerlo como «px absolutos ⇒ CAMPO» convierte el defecto del navegador en
     * un campo del modelo — y aquí sería masivo: la mayoría de los ejes de la
     * cola larga computan 0. Es §*una regla derivada sobre un dominio donde el
     * caso NO SE DA*, con el caso puesto en «el editor escribió algo».
     *
     * Así que un eje cuyo ÚNICO valor es 0 sale **SIN ESCRIBIR**, que no es ni
     * campo ni plantilla: es *nadie tocó esto*. Y para el modelo eso significa
     * lo mismo que SIN PROBAR — **no se cablea**.
     */
    const soloCero = vals.length === 1 && Number(vals[0]) === 0;
    let ver;
    if (soloCero) ver = "SIN ESCRIBIR · valor inicial (0) en las N: el test A no puede separar «el editor puso 0» de «nadie tocó nada»";
    else if (paginasQueVarian > 0) ver = "CAMPO (test B)";
    else if (noConcluyente) ver = "SIN PROBAR · el test A no aplica a la caja";
    else if (A.igual > 0 && A.mueve === 0) ver = "CAMPO (test A: px absolutos)";
    else if (A.mueve > 0 && A.igual === 0) ver = "plantilla (test A: se mueve)";
    else if (A.mueve > 0 && A.igual > 0) ver = `MIXTO — ${A.igual} px absolutos de ${a.pares ?? A.mueve + A.igual}`;
    else ver = "SIN PROBAR";
    veredictos[`${tipo}.${eje}`] = { ver, valores: vals.length, valoresDistintos: vals, paginasQueVarian, A, soloCero };
    lineas.push(`       ${eje.padEnd(9)} ${String(vals.length).padStart(2)} val · B: ${String(paginasQueVarian).padStart(2)} pág varían · A: ${String(A.mueve).padStart(3)} mueve / ${String(A.igual).padStart(3)} igual   → ${ver}`);
  }
  console.log(`     ── ${tipo} · ${t.inst} inst · ${t.paginas.size} pág`);
  console.log(lineas.join("\n"));
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5d-bis · ⚠⚠ QUÉ MIDE `anchoPct` DE VERDAD — y en unos módulos NO es el ancho declarado
 *
 * `anchoPct` se calcula como `caja del módulo / caja de su columna`. En un
 * módulo de **BLOQUE** eso recupera el ancho de módulo que el editor escribió
 * (§6c.1: 70 · 80 · 90 · 100). En uno de nivel **ENLÍNEA** —`inline-block`—
 * la caja **es la de su contenido**, así que la razón mide el TEXTO y no una
 * declaración: es §*el ancho de un elemento ENVUELTO es el de su contenedor,
 * no el de su contenido* con el signo cambiado.
 *
 * Se publica **con su cardinal** en vez de mezclarlo: un `33.36` de un botón y
 * un `33` de una imagen se escriben igual y **no son lo mismo**.
 * ═════════════════════════════════════════════════════════════════════════ */
const porDisplay = {};
for (const m of mod1440) {
  if (m.anchoPct == null) continue;
  const enLinea = /inline/.test(m.display ?? "");
  const e = (porDisplay[m.tipo] ??= { bloque: 0, enLinea: 0, displays: new Set() });
  e.displays.add(m.display);
  if (enLinea) e.enLinea++; else e.bloque++;
}
const conEnLinea = Object.entries(porDisplay).filter(([, e]) => e.enLinea > 0);
console.log(`\n  ══ 5d-bis · \`anchoPct\` NO significa lo mismo en todos los tipos ══`);
console.log(`     ${"tipo".padEnd(18)} ${"bloque".padStart(7)} ${"enlínea".padStart(8)}   displays vistos`);
for (const [tipo, e] of Object.entries(porDisplay).sort((a, b) => b[1].enLinea - a[1].enLinea))
  console.log(`     ${tipo.padEnd(18)} ${String(e.bloque).padStart(7)} ${String(e.enLinea).padStart(8)}   ${[...e.displays].join(", ")}`);
console.log(
  conEnLinea.length
    ? `\n     ⚠ En **${conEnLinea.map(([, e]) => e.enLinea).reduce((a, b) => a + b, 0)} instancias** de ${conEnLinea.length} tipo(s)\n` +
      `        —${conEnLinea.map(([t]) => t).join(" · ")}— la caja es la del CONTENIDO, así que su \`anchoPct\`\n` +
      `        **NO es el ancho de módulo declarado** y no se puede leer como campo 70/80/90/100.\n` +
      `        Para esos tipos, \`anchoPct\` queda **SIN MEDIR** por el instrumento, no por el original.`
    : `\n     (ningún tipo con módulos de nivel enlínea: \`anchoPct\` se puede leer como ancho declarado en todos)`,
);

/* ── 5e-bis · LO QUE EL DOM TIENE Y LA PÁGINA NO PINTA ────────────────────── */
console.log(`\n  ══ 5e-bis · LOS ${sinCaja.length} MÓDULOS SIN CAJA — están en el DOM y NO están en la página ══`);
console.log(`     No es higiene de recuento: **la geometría de un elemento sin caja no es medible**.`);
console.log(`     \`getComputedStyle\` sobre un contenedor cerrado no resuelve porcentajes contra nada,`);
console.log(`     así que su \`mb: 0\` NO significa «el editor puso 0» — significa que no hay contra qué.`);
console.log(`     Meterlos en la distribución fabricaría un pico en 0 que el original no tiene.\n`);
console.log(`     por TIPO:  ${Object.entries(sinCajaPorTipo).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(" · ")}`);
console.log(`     por RUTA:`);
for (const [r, n] of Object.entries(sinCajaPorRuta).sort((a, b) => b[1] - a[1])) console.log(`        ${String(n).padStart(3)}  ${r}`);
console.log(`\n     ⚠ **El mecanismo tiene nombre y ya está en el catálogo: son DESPLEGABLES cerrados.**`);
console.log(`        Es §*el mecanismo de PESTAÑAS* del ESQUEMA §7d con el envoltorio cambiado — allí el`);
console.log(`        original sólo servía el panel ACTIVO; aquí los sirve todos y el CSS los esconde.`);
console.log(`        La diferencia importa: **aquí el CONTENIDO sí está capturado** (\`arbol-f33\` lo leyó),`);
console.log(`        y lo que falta es sólo su GEOMETRÍA — que exige ABRIR el desplegable, o sea el eje`);
console.log(`        \`comportamiento\`, que sigue a 0/31 en \`COBERTURA-MEDICION\`.`);

/* ── 5e · LOS DE n PEQUEÑO, uno a uno y con lo INDECIDIBLE declarado ─────── */
console.log(`\n  ══ 5e · LOS DE n PEQUEÑO — y NO son el mismo caso ══`);
console.log(`     ⚠ El n que decide qué test aplica es el de **CON CAJA**, no el del DOM: un módulo`);
console.log(`        escondido no aporta ni un hermano al test B ni una pareja al test A.\n`);
const nPeq = tiposOrd.filter(([, t]) => t.paginasConCaja.size <= 2);
for (const [tipo, t] of nPeq) {
  const intra = Object.entries(t.porPagina).some(([, ejes]) => ["mt", "mb", "pt", "pb", "anchoPct"].some((e) => (ejes[e]?.size ?? 0) > 1));
  console.log(
    `     ${tipo.padEnd(18)} ${t.instConCaja} inst con caja (${t.inst} en el DOM) · ${t.paginasConCaja.size} pág   ` +
      (t.instConCaja === 0
        ? `→ **NINGUNA con caja: su geometría NO ES MEDIBLE sin abrir el desplegable. CORTE LIMPIO 2**`
        : t.paginasConCaja.size === 1 && t.instConCaja > 1
          ? `→ **hay hermanos en la MISMA página: el test B APLICA** y ${intra ? "SÍ varía ⇒ CAMPO" : "NO varía ⇒ *varianza cero*, que NO prueba plantilla"}`
          : t.instConCaja === 1
            ? `→ **1 sola instancia: ni A ni B pueden separar plantilla de campo. INDECIDIBLE, y ésa ES la respuesta**`
            : `→ **${t.instConCaja} instancias en ${t.paginasConCaja.size} páginas: hay varianza ENTRE instancias y se mira**`),
  );
  const detalle = [...t.paginasConCaja].map((r) => `        ${r}`).join("\n");
  if (detalle) console.log(detalle);
  for (const eje of ["mt", "mb", "pt", "pb", "anchoPct"]) {
    const vals = Object.entries(t.val[eje]);
    if (!vals.length) continue;
    console.log(`        ${eje.padEnd(9)} ${vals.map(([v, n]) => `${v} (×${n})`).join(" · ")}`);
  }
}

/* ── LAS GUARDAS ──────────────────────────────────────────────────────────── */
if (hojasCero.length) err(`${hojasCero.length} página(s) con hojas enlazadas y CERO resueltas: la geometría de esas páginas es FICCIÓN PLAUSIBLE — ${hojasCero.join(" · ")}`);
if (todosMod1440.length === 0) err(`0 módulos en ${DOMINIO.length} páginas: eso no es «no hay módulos», es que el recorrido no casó (§sondas 4).`);
if (mod1440.length === 0) err(`0 módulos CON CAJA de ${todosMod1440.length} en el DOM: o el viewport no se aplicó, o las hojas no llegaron. Nada de abajo sería medible.`);
if (filasConCaja.length === 0) err(`0 filas con caja: sin ancho de fila no se puede comparar NINGÚN default de ritmo contra su contenedor.`);
if (mod390.length === 0) err(`0 módulos a 390: sin el segundo ancho el test A no existe y todo saldría «SIN PROBAR» por el instrumento.`);
/* §sondas 4 · el censo de selectores: uno muerto en TODAS las páginas es defecto. */
const muertos = censo.informe();
if (muertos) err(`${muertos} selector(es) no casaron en NINGUNA página — un cero de selector no es un cero del original.`);

/* ── CORTE LIMPIO 2 · los tipos cuya geometría NO se puede derivar ────────── */
const sinDerivar = tiposOrd
  .map(([tipo, t]) => {
    if (t.instConCaja === 0)
      return { tipo, inst: t.inst, conCaja: 0, paginas: t.paginas.size, porQue: "NINGUNA instancia con caja: viven en desplegables cerrados y su geometría no es medible sin abrirlos", haceFalta: "medir con INTERACCIÓN (eje `comportamiento`, hoy 0/31)" };
    if (t.instConCaja === 1)
      return { tipo, inst: t.inst, conCaja: 1, paginas: t.paginasConCaja.size, porQue: "1 sola instancia con caja: ni el test A ni el B pueden separar plantilla de campo", haceFalta: "una SEGUNDA instancia" };
    if (!(testA[tipo]?.pares > 0))
      return { tipo, inst: t.inst, conCaja: t.instConCaja, paginas: t.paginasConCaja.size, porQue: "sin pareja a 390: el test A no se pudo aplicar", haceFalta: "que el módulo exista a los dos anchos" };
    return null;
  })
  .filter(Boolean);

/* Y los EJES sin escribir: no son tipos enteros, son celdas — y hay que contarlas. */
const ejesSinEscribir = Object.entries(veredictos).filter(([, v]) => v.soloCero).map(([k]) => k);

console.log(`\n  ══ CORTE LIMPIO 2 · lo que NO se puede derivar del corpus, NOMBRADO ══`);
if (sinDerivar.length === 0) console.log(`     (ningún tipo)`);
for (const s of sinDerivar)
  console.log(`     ⛔ ${s.tipo.padEnd(18)} ${String(s.inst).padStart(3)} inst (${s.conCaja} con caja) · ${s.paginas} pág — ${s.porQue}\n        haría falta: ${s.haceFalta}`);
console.log(`\n     Y las CELDAS sin escribir —eje a eje, no tipo entero— son **${ejesSinEscribir.length}** de ${Object.keys(veredictos).length}:`);
console.log(`     ${ejesSinEscribir.join(" · ")}`);
console.log(`\n     En ninguno de los dos casos se elige un valor plausible: SIN PROBAR no se cablea.`);

w(`medidas/f33-geo.json`, {
  meta: {
    sonda: "f33-geo",
    fecha: hoy(),
    que: "la geometría (ritmo y caja) de la cola larga, derivada del corpus con sus hojas, a 1440 y 390",
    lado: "UNO — el original capturado. NO compara con el clon: eso es `qa:f33-cmp`, y sigue a 0 ejes comparados",
    anchos: [1440, 390],
    sabotaje: SABOTAJE,
    dominio: {
      membresia: "medidas/f33-rutas.json (94.ª, congelada y commiteada) — las rutas de `paginas` POST-S1",
      rutasDeclaradas: F33.length,
      capturasLegibles: TODAS.length,
      controlCruzadoSinglePost: intrusas.length,
      medidas: DOMINIO.length,
      minimo: MINIMO,
    },
    noContesta: [
      `nada del CLON: es un solo lado, y la comparación de dos lados (qa:f33-cmp) sigue a 0 ejes comparados en las ${MINIMO}`,
      `el CONTENIDO de los módulos: eso lo derivó arbol-f33 (11 tipos) y ya está en bloques/paginas.ts`,
      `si un valor DEBE ser campo: los tests dicen qué está probado; la decisión de modelo es de quien escriba el bloque`,
      `el régimen -T: se fue con la webinar (S1, §2j.3c) y NO está en las ${F33.length} — control cruzado: ${intrusas.length} \`single-post\` en el dominio`,
      `el ancho INTERMEDIO: se miden 1440 y 390, que es donde el contrato es de FIDELIDAD (§El contrato no es el mismo a todos los anchos)`,
      `el ancho DECLARADO de los módulos de nivel ENLÍNEA: su caja es la del contenido, así que \`anchoPct\` no lo recupera — ver \`anchoPctPorDisplay\``,
      `la geometría de los módulos SIN CAJA: están en desplegables cerrados y exigen INTERACCIÓN (eje \`comportamiento\`, 0/31)`,
    ],
  },
  anchoDeFilaPorRegimen: anchosFila,
  separabilidadFilaColumna: { anchosDistintos: anchosDistintos.length, separables, cruce: Object.fromEntries(Object.entries(cruce).map(([k, v]) => [k, [...v].sort()])) },
  defaultMbPorAnchoDeFila: {
    nota: "2.75 % de la FILA — 1238.39⇒34.05 · 911.75⇒25.06. `CLAUDE.md` §Test A: la variable que manda es el ANCHO DE FILA, no el tipo de columna",
    cruce: Object.fromEntries(Object.entries(cruceMb).map(([k, e]) => [k, { total: e.total, enElDefault: e.enElDefault, esperado: e.esperado, porReparto: e.porReparto, valores: e.valores }])),
    conElDefaultDeOtraFila: cruzados.length,
    cadaDefaultConMasDeUnReparto: mbCoherente,
    separadoras,
    nSeparadoras: separadoras.length,
  },
  anchoPctPorDisplay: Object.fromEntries(Object.entries(porDisplay).map(([t, e]) => [t, { bloque: e.bloque, enLinea: e.enLinea, displays: [...e.displays] }])),
  criterioDeRecuento: {
    nota: "«en el DOM» y «con caja» NO son la misma medida — un módulo dentro de un desplegable cerrado está en el primero y no en el segundo, y su geometría NO es medible",
    modulos: { enElDom: todosMod1440.length, conCaja: mod1440.length, sinCaja: sinCaja.length },
    filas: { enElDom: todasFilas.length, conCaja: filasConCaja.length },
    columnas: { enElDom: todasCols.length, conCaja: colsConCaja.length },
    secciones: { enElDom: todasSecs.length },
    sinCajaPorTipo,
    sinCajaPorRuta,
  },
  porTipo: Object.fromEntries(
    tiposOrd.map(([tipo, t]) => [tipo, {
      instancias: t.inst,
      instanciasConCaja: t.instConCaja,
      paginas: t.paginas.size,
      paginasConCaja: t.paginasConCaja.size,
      rutas: [...t.paginas].sort(),
      valores: Object.fromEntries(Object.entries(t.val).map(([e, m]) => [e, m])),
      testA: testA[tipo] ?? null,
    }]),
  ),
  veredictos,
  ejesSinEscribir,
  corteLimpio2: sinDerivar,
  paginas: datos.map((d) => ({
    ruta: d.ruta, regimen: d.regimen, hojas: d.hojas,
    n: { secciones: d[1440].secciones.length, filas: d[1440].filas.length, columnas: d[1440].columnas.length, modulos: d[1440].modulos.length },
    modulos1440: d[1440].modulos,
    modulos390: d[390].modulos,
    filas1440: d[1440].filas,
    secciones1440: d[1440].secciones,
  })),
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} f33-geo: ${DOMINIO.length} páginas · ${todosMod1440.length} módulos en el DOM / ${mod1440.length} CON CAJA · ` +
    `${todasFilas.length}/${filasConCaja.length} filas · ${Object.keys(porTipo).length} tipos · ${anchosDistintos.length} ancho(s) de fila · ` +
    `${sinDerivar.length} tipo(s) y ${ejesSinEscribir.length} celda(s) SIN DERIVAR · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
