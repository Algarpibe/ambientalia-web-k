/**
 * EL MARCADO DE LA COLA LARGA, DERIVADO DEL CORPUS — la fase de SPECS que este
 * arquetipo nunca tuvo (100.ª tanda).
 * Uso: npm run qa:f33-spec   (SABOTAJE=selector-muerto | dominio-corto | sin-hojas)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO — escrito ANTES de mirar el dato
 *
 * `qa:f33-geo` derivó la GEOMETRÍA (ritmo y caja, 49 celdas con veredicto) y
 * declara explícitamente que **no contesta el CONTENIDO de los módulos**. O sea
 * que el MARCADO —qué etiquetas y qué clases emite cada tipo— **no lo ha medido
 * nadie**, y es justo el canal donde `CuerpoPagina.tsx` se escribió de memoria
 * y ya pagó **dos clases** (`et_pb_toggle_item` y el `clearfix` de
 * `et_pb_toggle_content`).
 *
 * CONTESTA:
 *   · para cada tipo de módulo, el **marcado INVARIANTE** — las clases y la
 *     forma que aparecen en el **100 %** de sus instancias— separado de lo que
 *     VARÍA. Lo primero es la plantilla del módulo; lo segundo es dato;
 *   · el **árbol de etiquetas** que cada tipo emite, con su cardinal;
 *   · el discriminador **`:first-child` / `:last-child`**: se mide el PRIMER y
 *     el ÚLTIMO hermano por separado en cada nivel, porque la pregunta al
 *     transcribir no es «¿existe?» sino **«¿SOBRE QUÉ?»**;
 *   · lo hace **sobre lo COMPUTADO** (`getComputedStyle`) y no con `grep` sobre
 *     las hojas: una declaración puede estar servida, leerse bien y **no llegar
 *     a la propiedad** — el `!important` del tema costó `30` donde el valor era
 *     `32`, cuatro veces (§El principio, 2026-08-21).
 *
 * NO CONTESTA, y va con su cardinal (§regla 14):
 *   · **NADA del clon.** Es UN SOLO LADO: el original capturado. La comparación
 *     de dos lados es `qa:f33-cmp` y sigue a **0 ejes comparados**;
 *   · **la GEOMETRÍA.** Ritmo, caja y `anchoPct` son de `qa:f33-geo`, ya
 *     derivados y congelados. Aquí no se recalculan ni se contradicen;
 *   · **los módulos SIN CAJA.** `f33-geo` midió **36 de 313** dentro de
 *     desplegables CERRADOS. Su marcado SÍ está en el DOM y se censa; su
 *     **geometría no es medible** con `getComputedStyle` —devuelve ceros que
 *     entrarían en la distribución como si fueran dato— y necesita
 *     **INTERACCIÓN** (eje `comportamiento`, hoy 0/31). Se declara, no se
 *     rellena;
 *   · **si un valor DEBE ser campo.** Esto describe; la decisión de modelo es
 *     de quien escriba el bloque, con esto delante.
 *
 * ── EL CONTROL, y es un caso CONOCIDO DE ANTEMANO ────────────────────────
 * La forma más barata de auditar un cero que uno mismo acaba de producir es
 * exigir que aparezca algo que ya se sabe que está. Aquí: **`et_pb_toggle_item`
 * y el `clearfix` de `et_pb_toggle_content`**, las dos clases que la 99.ª
 * encontró a mano. Si esta sonda no las saca, el defecto es de la sonda —no del
 * original— y cierra el código de salida (§sondas 4).
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
const VALIDOS = ["selector-muerto", "dominio-corto", "sin-hojas", "sin-control"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ⚠ §regla 24, mitad de higiene: la sonda comprueba SUS PROPIOS sabotajes y
 * desvía el nombre de la salida ella misma. Si dependiera de que quien la lanza
 * ponga además `NEG=`, el nombre CANÓNICO quedaría al alcance de una corrida de
 * control — y lo que sale entonces es un fichero con nombre de medida y
 * contenido de sabotaje. */
const NEG = process.env.NEG || null;
/**
 * ⚠ El caso `control` del negativo corre **SIN sabotaje**, así que si el desvío
 * dependiera sólo de `SABOTAJE` ese caso escribiría en el CANÓNICO — que es
 * justo lo que §regla 24 prohíbe: un fichero con nombre de medida y contenido
 * de control. Por eso manda `NEG` cuando está, y `SABOTAJE` desvía por sí solo
 * aunque nadie ponga `NEG`.
 */
const SALIDA = NEG
  ? `medidas/f33-spec-neg-${NEG}.json`
  : SABOTAJE
    ? `medidas/f33-spec-neg-${SABOTAJE}.json`
    : "medidas/f33-spec.json";
if (NEG || SABOTAJE) console.log(`  ⚠ la salida se desvía a \`${SALIDA}\` — el canónico NO se toca.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — las 31 de `paginas`, DERIVADAS igual que en `f33-geo`
 * ═════════════════════════════════════════════════════════════════════════ */
const LD = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const F33 = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;
if (!Array.isArray(F33) || F33.length === 0)
  throw new Error("f33-rutas.json sin `paginas`: no se puede derivar el dominio de la nada (§sondas 4).");

const porRuta = new Map(LD.filter((e) => e.fichero).map((e) => [e.ruta, e]));
const PAGINAS = [];
const sinCaptura = [];
for (const r of F33) {
  const e = porRuta.get(r.ruta);
  if (!e || !existsSync(join(CORPUS, e.fichero))) { sinCaptura.push(r.ruta); continue; }
  PAGINAS.push(e);
}
if (sinCaptura.length)
  throw new Error(`${sinCaptura.length} de las ${F33.length} rutas SIN CAPTURA: ${sinCaptura.join(" · ")}`);

const MINIMO = F33.length;
const DOMINIO = SABOTAJE === "dominio-corto" ? PAGINAS.slice(0, 4) : PAGINAS;
const ev = new Evaluadas({ nombre: "f33-spec", unidad: "páginas de `paginas`", minimo: MINIMO });

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LAS HOJAS — sin ellas lo computado es ficción PLAUSIBLE (§F3-1-CSS)
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
 * 3 · LA MEDIDA — el MARCADO de cada módulo, y lo COMPUTADO de sus piezas
 * ═════════════════════════════════════════════════════════════════════════ */
const censo = new Censo();

function medir(selectorMuerto) {
  const $$ = (s) => globalThis.__qa(s);
  const px = (v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  };
  const propia = (el) => ![...el.classList].some((c) => c.includes("_tb_"));
  const idDe = (el) => {
    for (const c of el.classList) {
      const m = /^et_pb_([a-z][a-z0-9_]*?)_(\d+)$/.exec(c);
      if (m && !c.includes("_tb_")) return { tipo: m[1], ord: Number(m[2]) };
    }
    return null;
  };

  /**
   * ⚠⚠ **EL RECORRIDO ES EL DE `f33-geo`, Y NO ES UNA COMODIDAD: LA PRIMERA
   * VERSIÓN USABA `.et_pb_module` Y PERDÍA UN TIPO ENTERO.**
   *
   * Medido en esta misma tanda: `.et_pb_module` daba **300 módulos y 10 tipos**
   * contra los **313 y 11** de `f33-geo`, y la diferencia era **exactamente 13**
   * — o sea `button` **al completo**, porque Divi no le pone `et_pb_module` al
   * envoltorio del botón. Es §sondas 4 en su forma de COBERTURA PARCIAL: el
   * selector casaba de sobra en los otros diez, así que no salía ni cero ni
   * pleno, y los 13 ausentes se habrían leído como *«este arquetipo no tiene
   * botones»* — una afirmación sobre el original hecha por un descuido del
   * instrumento.
   *
   * Así que el conjunto de módulos se deriva **igual que `f33-geo`**: bajando
   * sección → fila → columna e identificando por el ordinal `et_pb_<tipo>_<n>`,
   * sin descender dentro de otro módulo. Los dos instrumentos coinciden
   * entonces **por construcción**, y el cruce se exige al final.
   */
  const esEstructura = (t) => /^(section|row|row_inner|column(_\d+)?|column_inner(_\d+)?)$/.test(t);
  const SEL_SEC = selectorMuerto ? ".et_pb_seccion_que_no_existe" : ".et_pb_section";

  const modulos = [];
  for (const sec of $$(SEL_SEC)) {
    if (!propia(sec)) continue;
    for (const col of sec.querySelectorAll('[class*="et_pb_column"]')) {
      if (!propia(col)) continue;
      const baja = (n) => {
        for (const h of n.children) {
          const d = idDe(h);
          if (d && !esEstructura(d.tipo)) { modulos.push(h); continue; }
          baja(h);
        }
      };
      baja(col);
    }
    /* Los *fullwidth* cuelgan de la SECCIÓN sin pasar por fila. */
    for (const h of sec.children) {
      const d = idDe(h);
      if (d && !esEstructura(d.tipo) && propia(h)) modulos.push(h);
    }
  }

  /** Clases `et_pb_*` normalizadas: el ordinal se borra (`_3` → `_N`). */
  const clasesDe = (el) =>
    [...el.classList]
      .filter((c) => !c.includes("_tb_"))
      .map((c) => c.replace(/^(et_pb_[a-z][a-z0-9_]*?)_\d+$/, "$1_N"))
      .sort();

  /** Árbol tag.clases hasta `prof` niveles — la FORMA del módulo. */
  const forma = (el, prof) => {
    if (prof === 0) return null;
    const hijos = [...el.children].map((h) => forma(h, prof - 1)).filter(Boolean);
    return {
      tag: el.tagName.toLowerCase(),
      cls: clasesDe(el),
      hijos,
    };
  };

  const out = [];
  for (const m of modulos) {
    const id = idDe(m);
    if (!id) continue;
    const r = m.getBoundingClientRect();
    const cs = getComputedStyle(m);
    out.push({
      tipo: id.tipo,
      /**
       * ⚠ **El criterio de caja es `w > 0`, EL MISMO que `f33-geo`** — y
       * también costó su discrepancia: exigir además `h > 0` daba `code`
       * **1 con caja** contra los **9** de `f33-geo`, porque un módulo dentro de
       * un desplegable cerrado conserva su ancho y pierde su alto. Dos
       * criterios distintos sobre el mismo objeto producen dos censos ciertos
       * que no se pueden cruzar, así que se unifica con el que ya está
       * congelado.
       */
      conCaja: Number.isFinite(r.width) && r.width > 0,
      clases: clasesDe(m),
      tag: m.tagName.toLowerCase(),
      forma: forma(m, 3),
      /* La BASE de todo valor relativo, medida EN EL ELEMENTO: un `em` citado
       * sin su `font-size` es la misma trampa que un `%` sin su contenedor. */
      fontSize: px(cs.fontSize),
      lineHeight: cs.lineHeight === "normal" ? "normal" : px(cs.lineHeight),
      display: cs.display,
    });
  }

  /* ── `:first-child` / `:last-child` — «¿existe?» no; «¿SOBRE QUÉ?» ──────
   * Se mide el PRIMER y el ÚLTIMO hermano por separado en cada contenedor. Si
   * difieren, el nivel lleva la regla; si no, ahí no está. */
  const primerUltimo = [];
  const niveles = [
    { nombre: "modulo-en-columna", cont: ".et_pb_column", hijo: ".et_pb_module" },
    { nombre: "columna-en-fila", cont: ".et_pb_row", hijo: ".et_pb_column" },
    { nombre: "fila-en-seccion", cont: ".et_pb_section", hijo: ".et_pb_row" },
  ];
  for (const n of niveles) {
    for (const c of $$(n.cont).filter(propia)) {
      const hs = [...c.querySelectorAll(n.hijo)].filter((h) => h.parentElement === c && propia(h));
      if (hs.length < 2) continue;
      const g = (el) => {
        const s = getComputedStyle(el);
        return { mt: px(s.marginTop), mb: px(s.marginBottom) };
      };
      primerUltimo.push({ nivel: n.nombre, n: hs.length, primero: g(hs[0]), ultimo: g(hs[hs.length - 1]) });
    }
  }

  return { modulos: out, primerUltimo, hojasAplicadas: document.styleSheets.length };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · EL RECORRIDO — a 1440 y a 390, en la misma corrida
 * ═════════════════════════════════════════════════════════════════════════ */
const UA_MOVIL =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";

const { browser } = await launch();
const datos = [];
const hojasCero = [];

for (const pg of DOMINIO) {
  const crudo = readFileSync(join(CORPUS, pg.fichero), "utf8");
  const { html, enlazadas, resueltas } = conHojasLocales(crudo);

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (r.url().startsWith("file://") || r.url() === "about:blank") return r.continue();
    r.abort();
  });

  await page.goto(pathToFileURL(join(CORPUS, pg.fichero)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });

  /* Las perezosas a `eager` ANTES de medir, con la espera ACOTADA: sin tope,
   * una promesa colgada agota la sonda en vez de darla en rojo (§regla 17). */
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

  const porAncho = {};
  for (const ancho of [1440, 390]) {
    if (ancho <= 500) {
      await page.setViewport({ width: ancho, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await page.setUserAgent(UA_MOVIL);
    } else {
      await page.setViewport({ width: ancho, height: 900, deviceScaleFactor: 1 });
    }
    await asienta();
    censo.grupo(`@${ancho}`);
    porAncho[ancho] = (await censo.medir(page, medir, SABOTAJE === "selector-muerto")).datos;
  }
  await page.close();

  if (enlazadas && !resueltas) hojasCero.push(pg.ruta);
  datos.push({ ruta: pg.ruta, hojas: { enlazadas, resueltas }, ...porAncho });
  ev.ok();
  process.stdout.write(`  · ${pg.ruta.padEnd(62)} ${porAncho[1440].modulos.length} módulos\n`);
}
await browser.close();

/**
 * ⚠ **La guarda de hojas NO tira: cuenta en rojo — y la diferencia la destapó
 * su propio negativo.** La v1 hacía `throw` aquí, o sea que moría **antes de
 * congelar**; y entonces el caso `sin-hojas` sólo podía comprobar el código de
 * salida, que es exactamente lo que ese caso declara insuficiente: sin CSS la
 * sonda no falla, **mide otra cosa** (§F3-1-CSS-NO-CAPTURADO — `columna.width`
 * 678.52 contra 430.80 en vivo). Para poder exigir que los NÚMEROS se muevan
 * hay que dejarla llegar al informe y cerrar el exit con el resto de guardas.
 */
const hojasEnRojo = hojasCero.length > 0;

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL INFORME — el marcado INVARIANTE por tipo, separado de lo que VARÍA
 * ═════════════════════════════════════════════════════════════════════════ */
const porTipo = {};
for (const d of datos) {
  for (const m of d[1440].modulos) {
    const t = (porTipo[m.tipo] ||= {
      instancias: 0, conCaja: 0, rutas: new Set(),
      clasesTodas: new Map(), tags: {}, formas: new Map(),
      fontSize: {}, lineHeight: {}, display: {},
    });
    t.instancias++;
    if (m.conCaja) t.conCaja++;
    t.rutas.add(d.ruta);
    for (const c of new Set(m.clases)) t.clasesTodas.set(c, (t.clasesTodas.get(c) || 0) + 1);
    t.tags[m.tag] = (t.tags[m.tag] || 0) + 1;
    const f = JSON.stringify(m.forma);
    t.formas.set(f, (t.formas.get(f) || 0) + 1);
    if (m.conCaja) {
      t.fontSize[m.fontSize] = (t.fontSize[m.fontSize] || 0) + 1;
      t.lineHeight[m.lineHeight] = (t.lineHeight[m.lineHeight] || 0) + 1;
      t.display[m.display] = (t.display[m.display] || 0) + 1;
    }
  }
}

const informe = {};
for (const [tipo, t] of Object.entries(porTipo)) {
  /* INVARIANTE = presente en el 100 % de las instancias del tipo. Es lo único
   * que se puede escribir como plantilla del módulo; el resto es dato. */
  const invariantes = [...t.clasesTodas.entries()].filter(([, n]) => n === t.instancias).map(([c]) => c).sort();
  const variables = [...t.clasesTodas.entries()]
    .filter(([, n]) => n < t.instancias)
    .map(([c, n]) => ({ clase: c, en: n, de: t.instancias }))
    .sort((a, b) => b.en - a.en);
  informe[tipo] = {
    instancias: t.instancias,
    conCaja: t.conCaja,
    sinCaja: t.instancias - t.conCaja,
    paginas: t.rutas.size,
    clasesInvariantes: invariantes,
    clasesVariables: variables,
    tags: t.tags,
    formasDistintas: t.formas.size,
    formaMasComun: t.formas.size ? JSON.parse([...t.formas.entries()].sort((a, b) => b[1] - a[1])[0][0]) : null,
    /* La BASE medida en el elemento, para que ningún `em` se cite sin ella. */
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    display: t.display,
  };
}

/* ── `:first`/`:last`: ¿difieren el primero y el último hermano? ──────────── */
const pu = {};
for (const d of datos) {
  for (const x of d[1440].primerUltimo) {
    const g = (pu[x.nivel] ||= { contenedores: 0, difiereMt: 0, difiereMb: 0, ejemplos: [] });
    g.contenedores++;
    if (x.primero.mt !== x.ultimo.mt) g.difiereMt++;
    if (x.primero.mb !== x.ultimo.mb) {
      g.difiereMb++;
      if (g.ejemplos.length < 4) g.ejemplos.push({ ruta: d.ruta, n: x.n, primero: x.primero.mb, ultimo: x.ultimo.mb });
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · EL CONTROL — las DOS clases conocidas de antemano (§sondas 4)
 * ═════════════════════════════════════════════════════════════════════════ */
const CONTROL = [
  { clase: "et_pb_toggle_item", donde: "toggle", porQue: "la 99.ª la encontró a mano al verificar el toggle" },
  { clase: "clearfix", donde: "toggle", porQue: "el `clearfix` de `et_pb_toggle_content`, ídem" },
];
const enToggle = new Set();
for (const d of datos) {
  for (const m of d[1440].modulos) {
    if (m.tipo !== "toggle") continue;
    const rec = (n) => { if (!n) return; for (const c of n.cls) enToggle.add(c); n.hijos.forEach(rec); };
    rec(m.forma);
  }
}
const controlFalla = SABOTAJE === "sin-control" ? CONTROL : CONTROL.filter((c) => !enToggle.has(c.clase));

console.log(`\n════════ F33-SPEC · EL MARCADO DE LA COLA LARGA ════════\n`);
console.log(`  páginas medidas   ${datos.length} de ${MINIMO}`);
console.log(`  tipos             ${Object.keys(informe).length}`);
const totalInst = Object.values(informe).reduce((a, t) => a + t.instancias, 0);
const totalCaja = Object.values(informe).reduce((a, t) => a + t.conCaja, 0);
console.log(`  módulos           ${totalInst} en el DOM · ${totalCaja} con caja · ${totalInst - totalCaja} SIN CAJA`);
console.log(`\n  ── ALCANCE POR TIPO, en LAS DOS UNIDADES ──`);
console.log(`  ${"tipo".padEnd(18)} ${"inst".padStart(5)} ${"caja".padStart(5)} ${"pág".padStart(4)}  ${"formas".padStart(6)}  invariantes`);
for (const [t, v] of Object.entries(informe).sort((a, b) => b[1].instancias - a[1].instancias))
  console.log(
    `  ${t.padEnd(18)} ${String(v.instancias).padStart(5)} ${String(v.conCaja).padStart(5)} ${String(v.paginas).padStart(4)}  ${String(v.formasDistintas).padStart(6)}  ${v.clasesInvariantes.length}`,
  );

console.log(`\n  ── \`:first\`/\`:last\` · ¿DIFIEREN EL PRIMERO Y EL ÚLTIMO HERMANO? ──`);
for (const [n, g] of Object.entries(pu))
  console.log(`  ${n.padEnd(20)} ${String(g.contenedores).padStart(4)} contenedores · mb difiere en ${g.difiereMb} · mt en ${g.difiereMt}`);

console.log(`\n  ── CONTROL · las dos clases conocidas de antemano ──`);
for (const c of CONTROL)
  console.log(`  ${enToggle.has(c.clase) && SABOTAJE !== "sin-control" ? "✓" : "✗"} ${c.clase.padEnd(22)} ${c.porQue}`);

/* ══════════════════════════════════════════════════════════════════════════
 * 6bis · EL CRUCE CONTRA `f33-geo` — obligatorio, y NO es adorno
 *
 * §sondas 4: *«cuando exista otra medición del mismo objeto hecha con otro
 * instrumento, cruzarla es obligatorio antes de creerse un recuento nuevo»*.
 * Aquí ya se cobró: la v1 de esta sonda daba 300/10 contra 313/11 y la
 * diferencia era `button` entero.
 *
 * ⚠ Y lo que este cruce SÍ y NO prueba (§regla 15): prueba que **las dos leen
 * el MISMO conjunto de módulos** — que es real y es justo lo que falló—. **NO**
 * prueba que ese conjunto sea el correcto: eso lo sostiene `arbol-f33`, que es
 * de donde salen los 313 y una derivación independiente.
 * ═════════════════════════════════════════════════════════════════════════ */
/* ⚠⚠ ESTA LECTURA ESTUVO MUERTA (109.ª, PASO 0): el canónico `f33-geo.json` ya
 * no existe —la 104.ª lo RENOMBRÓ con su alcance (§regla 5bis)— y las 10
 * congeladas de la familia llevan marcador, 0 sin marcar. Así que esta sonda
 * levantaba Chrome, medía las 31 rutas, y **moría con ENOENT justo aquí, en su
 * cruce**, después de todo el trabajo.
 *
 * Y es el caso caro de §regla 26: `qa:f33-spec` sigue declarada en
 * `package.json`, así que el registro de comandos prometía una sonda que no
 * podía terminar. Un `npm run` que existe se lee como que la sonda existe.
 *
 * Se nombra el fichero marcado y se declara por qué es lícito: de aquí sólo
 * salen `criterioDeRecuento` y `porTipo`, que la caducidad lista entre los
 * bloques INTACTOS de 1440. El defecto declarado —`modulos390`, `veredictosA`—
 * no toca ninguno de los dos. Derivado en `resolutores-109.log` §2. */
const GEO_F33 = "f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json";
const GEO_RUTA = join(RAIZ, "scripts/qa/medidas", GEO_F33);
if (!existsSync(GEO_RUTA))
  throw new Error(
    `no existe ${GEO_F33}.\n` +
      `  Es la familia f33-geo, que NO tiene canónico. Si la han vuelto a renombrar,\n` +
      `  actualiza este nombre y comprueba que \`criterioDeRecuento\` y \`porTipo\`\n` +
      `  sigan fuera del alcance declarado en el nombre nuevo.`,
  );
const GEO = JSON.parse(readFileSync(GEO_RUTA, "utf8"));
const geoTot = GEO.criterioDeRecuento.modulos;
const geoTipos = Object.keys(GEO.porTipo).sort();
const misTipos = Object.keys(informe).sort();
const cruce = {
  modulos: { geo: geoTot.enElDom, spec: totalInst, cuadra: geoTot.enElDom === totalInst },
  conCaja: { geo: geoTot.conCaja, spec: totalCaja, cuadra: geoTot.conCaja === totalCaja },
  tiposSoloEnGeo: geoTipos.filter((t) => !misTipos.includes(t)),
  tiposSoloEnSpec: misTipos.filter((t) => !geoTipos.includes(t)),
};
console.log(`\n  ── CRUCE CONTRA \`f33-geo\` (§sondas 4) ──`);
console.log(`  módulos en el DOM   geo ${cruce.modulos.geo} · spec ${cruce.modulos.spec}  ${cruce.modulos.cuadra ? "✓" : "✗"}`);
console.log(`  con caja            geo ${cruce.conCaja.geo} · spec ${cruce.conCaja.spec}  ${cruce.conCaja.cuadra ? "✓" : "✗"}`);
console.log(`  tipos               geo ${geoTipos.length} · spec ${misTipos.length}  ${cruce.tiposSoloEnGeo.length + cruce.tiposSoloEnSpec.length === 0 ? "✓" : "✗ " + [...cruce.tiposSoloEnGeo, ...cruce.tiposSoloEnSpec].join(" ")}`);

w(SALIDA, {
  meta: {
    sonda: "f33-spec",
    fecha: hoy(),
    que: "el MARCADO de los 11 tipos de módulo de la cola larga, derivado del corpus con sus hojas, a 1440 y 390",
    lado: "UNO — el original capturado. NO compara con el clon: eso es `qa:f33-cmp`, y sigue a 0 ejes comparados",
    anchos: [1440, 390],
    sabotaje: SABOTAJE,
    dominio: { rutasDeclaradas: MINIMO, medidas: datos.length, minimo: MINIMO },
    noContesta: [
      "nada del CLON: es un solo lado",
      "la GEOMETRÍA (ritmo, caja, anchoPct): es de `qa:f33-geo`, ya congelada — aquí no se recalcula",
      "la geometría de los 36 módulos SIN CAJA: su marcado se censa, su geometría exige INTERACCIÓN (eje `comportamiento`, 0/31)",
      "si un valor DEBE ser campo: esto describe; la decisión de modelo es de quien escriba el bloque",
    ],
  },
  criterioDeRecuento: { modulos: { enElDom: totalInst, conCaja: totalCaja, sinCaja: totalInst - totalCaja } },
  porTipo: informe,
  primerUltimo: pu,
  cruce,
  control: { exigidas: CONTROL, faltan: controlFalla },
  paginas: datos.map((d) => ({ ruta: d.ruta, hojas: d.hojas, modulos: d[1440].modulos.length })),
});

const muertos = censo.informe();
let malo = 0;
if (!cruce.modulos.cuadra || !cruce.conCaja.cuadra || cruce.tiposSoloEnGeo.length || cruce.tiposSoloEnSpec.length) {
  console.log(`\n❌ CRUCE EN ROJO: esta sonda y \`f33-geo\` NO leen el mismo conjunto de módulos.`);
  console.log(`   Dos instrumentos en desacuerdo sobre el dominio se resuelven ANTES de leer ningún número.`);
  malo = 1;
}
if (controlFalla.length) {
  console.log(`\n❌ CONTROL EN ROJO: ${controlFalla.length} clase(s) conocida(s) que esta sonda NO encuentra.`);
  console.log(`   Un cero aquí es de la SONDA, no del original (§sondas 4).`);
  malo = 1;
}
if (hojasEnRojo) {
  console.log(
    `\n❌ ${hojasCero.length} página(s) con hojas ENLAZADAS y CERO resueltas: lo computado en ellas es` +
      ` FICCIÓN PLAUSIBLE — ${hojasCero.join(" · ")}`,
  );
  malo = 1;
}
if (muertos) { console.log(`\n❌ ${muertos} selector(es) MUERTO(s).`); malo = 1; }

console.log(
  `\n${malo ? "❌" : "✅"} f33-spec: ${Object.keys(informe).length} tipos · ${totalInst} módulos en el DOM · ${totalCaja} con caja · ${totalInst - totalCaja} SIN CAJA declarados · ${controlFalla.length} control(es) en rojo`,
);
process.exit(malo === 0 ? 0 : 2);
