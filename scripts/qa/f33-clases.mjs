/**
 * LA DERIVACIÓN DE LAS CLASES `f33-*` — de los nodos servidos a la REGLA que la
 * hoja tiene que poner.
 * Uso: node scripts/qa/f33-clases.mjs        (npm run qa:f33-clases)
 *      SABOTAJE=sin-hojas | dominio-corto | ordinal-ciego | selector-muerto
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO — escrito ANTES de mirar el dato
 *
 * `qa:f33-geo` clasificó cada eje en CAMPO / SIN ESCRIBIR / MIXTO. Eso dice
 * **quién** escribe el valor, no **cuál** es el valor que la plantilla pone
 * cuando el dato calla — que es lo único que se puede escribir en un `.css`.
 * Esto contesta lo segundo, para las **17 clases `f33-*`** y las **5 familias
 * de variables** que `CuerpoPagina.tsx` emite y que hoy **nadie lee**
 * (§F3-3-SIN-HOJA: 0 reglas en `globals · kb · listados · tema`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CANAL QUE LA 101.ª DIO POR INEXISTENTE — Y ESTABA SERVIDO
 *
 * `derivaciones/hoja-f33-derivable.log` concluyó, sobre `f33-geo.json`:
 *
 *   > *«el ritmo por DEFECTO de sección y fila — la congelada trae el valor
 *   > COMPUTADO, y no separa «lo que el dato trae» de «lo que la hoja pone»»*
 *
 * **Cierto de esa congelada y FALSO del repo**, que es exactamente la forma que
 * el encargo mandaba comprobar. `kb-clases` separa las dos cosas con
 * `kb-extraido.json`, donde el extractor guarda lo que el editor escribió; el
 * extractor de f33 **no emite ni una clave de geometría** —y hace bien, con su
 * sabotaje `geometria` para que no se relaje—, así que por ese canal la
 * separación es imposible: **313 de 313 módulos omiten, 0 declaran**, o sea
 * **cero instancias separadoras POR CONSTRUCCIÓN** (§regla 17, 2.ª cara).
 *
 * Pero ese no es el único canal, y el que faltaba lleva escrito en `CLAUDE.md`
 * desde el 2026-08-10: **Divi no escribe marcado, COMPILA CSS**. Lo que el
 * editor tocó viaja en una regla con ORDINAL —`.et_pb_image_0 { margin-top:
 * -33px !important }`— compilada en el `<style>` de la propia página; lo que
 * pone la plantilla viaja en reglas GENÉRICAS de las hojas del tema
 * —`.et_pb_gutters3 .et_pb_column_4_4 .et_pb_module { margin-bottom: 2.75% }`—.
 *
 * **Medido antes de escribir esta sonda, en 2 páginas y sin una excepción:**
 *
 *   reglas CON ordinal  →  100 % del `<style>` de la propia página
 *   reglas SIN ordinal  →  las 3 hojas del tema (+ las genéricas de Divi)
 *
 * Así que el discriminador **existe, está servido en los dos lados y se lee por
 * CDP** — `CSS.getMatchedStylesForNode`, que devuelve las reglas que casan EN
 * ORDEN. Es §El principio literal: *«el veredicto lo da `getComputedStyle`
 * SOBRE EL ORIGINAL, no `grep` sobre las hojas; y cuando haga falta saber POR
 * QUÉ, se le pregunta a la cascada»*. Aquí se usan los dos: la cascada NOMBRA
 * la regla, `getComputedStyle` ADJUDICA el valor.
 *
 * ── La capa `_tb_` se descuenta, y no es simetría ─────────────────────────
 * Un ordinal `_tb_` (`.et_pb_row_0_tb_header`) es del editor **de la plantilla
 * del cascarón**, no del de esta página. El régimen es propiedad de la CAPA
 * (`CLAUDE.md` §CORREGIDO 2026-08-03), así que la capa del cascarón no entra ni
 * como nodo ni como regla.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ NO CONTESTA — con su cardinal (§regla 14)
 *
 *   · **NADA del clon.** Un solo lado: el original capturado. La comparación de
 *     dos lados es `qa:f33-cmp`, y sigue a **0 ejes comparados**;
 *   · **si la hoja escrita FUNCIONA.** Verificar el CSS contra el CSS es
 *     *«contra la fuente que uno supone responsable»*. Esto es la ENTRADA de la
 *     escritura, no su prueba;
 *   · **los 34 módulos SIN CAJA** (§CORTE LIMPIO 2 de la 99.ª): 30 `video` en
 *     desplegables cerrados + `slider`/`map`/`fullwidth_slider`. Sin caja,
 *     `getComputedStyle` no resuelve los % contra nada y devuelve ceros que
 *     entrarían en la distribución como dato. Se **excluyen del análisis**, no
 *     sólo del recuento, y su cardinal se publica;
 *   · **las PIELES de titular** (`--f33h-*`, `--f33blurb-*`): la tipografía no
 *     está en el dominio de esta sonda — mide caja y ritmo. Sale nombrada con
 *     su cero, que es lo que la convierte en hueco visible;
 *   · **el ancho INTERMEDIO**: 1440 y 390, donde el contrato es de FIDELIDAD.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Censo, Evaluadas, gritaSiRevienta, hoy, launch, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["sin-hojas", "dominio-corto", "ordinal-ciego", "selector-muerto", "movil-recarga"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DOMINIO — las 31, DERIVADAS (§regla 9: la lista no se escribe)
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
  if (!e || !existsSync(join(CORPUS, e.fichero))) {
    sinCaptura.push(r.ruta);
    continue;
  }
  const html = readFileSync(join(CORPUS, e.fichero), "utf8");
  const body = /<body[^>]*class="([^"]*)"/i.exec(html)?.[1] ?? "";
  PAGINAS.push({
    ...e,
    regimen: `${/\bet_pb_pagebuilder_layout\b/.test(body) ? "B" : "-"}${/\bet-tb-has-body\b/.test(body) ? "T" : "-"}`,
  });
}
if (sinCaptura.length)
  throw new Error(
    `${sinCaptura.length} de las ${F33.length} rutas SIN CAPTURA en el corpus: ${sinCaptura.join(" · ")}\n` +
      `  Sin la captura no hay cascada que leer, y «no medida» no puede salir como «sin datos» (§regla 6).`,
  );

const MINIMO = F33.length;
const DOMINIO = SABOTAJE === "dominio-corto" ? PAGINAS.slice(0, 4) : PAGINAS;
const ev = new Evaluadas({ nombre: "f33-clases", unidad: "páginas de `paginas`", minimo: MINIMO });

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LAS HOJAS — sin ellas la cascada está VACÍA y la geometría es ficción
 *
 * §regla 31: esta precondición **invalida la medida** pero no impide medir, así
 * que se cuenta en ROJO y deja llegar al informe. Su negativo necesita los
 * números para comparar el reparto con y sin hojas; con un `throw` sólo podría
 * mirar el código de salida, que es justo lo que no basta aquí
 * (§F3-1-CSS-NO-CAPTURADO: sin hojas la medida no falla, SALE PLAUSIBLE).
 * ═════════════════════════════════════════════════════════════════════════ */
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (LOCAL.size === 0) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

function conHojasLocales(html) {
  let enlazadas = 0;
  let resueltas = 0;
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
 * 3 · EL RECORRIDO, DENTRO DE LA PÁGINA
 *
 * Mismo walker que `qa:f33-geo` —validado contra `f33-spec` en **313 = 313**—
 * con dos añadidos que esta sonda necesita:
 *
 *   · **una CLAVE por nodo** (`s0/f1/c0/m2`), escrita en `data-f33k`. Es lo que
 *     permite unir la medida (que se toma en la página) con la cascada (que se
 *     lee por CDP, fuera). El ordinal de Divi no sirve de llave porque **las
 *     COLUMNAS no lo llevan**: `et_pb_column_1_2` es el reparto, no un ordinal;
 *   · **la caja entera** —`width` · `max-width` · `float` · `display` ·
 *     `box-sizing` · `text-align`—, porque la retícula es la mitad de lo que
 *     esta hoja tiene que poner y `f33-geo` sólo guardó `w`.
 *
 * El atributo se pone DESPUÉS de leer el estilo computado de cada nodo, y
 * `data-f33k` no casa ningún selector de las hojas del original (censado: 0).
 * ═════════════════════════════════════════════════════════════════════════ */
const PROPS = [
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "width",
  "maxWidth",
  "float",
  "display",
  "boxSizing",
  "textAlign",
  "fontSize",
];

function medir(selMuerto) {
  const $$ = (s) => globalThis.__qa(s);
  const num = (v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  };
  const propia = (el) => ![...el.classList].some((c) => c.includes("_tb_"));
  const idDe = (el) => {
    for (const c of el.classList) {
      const m = /^et_pb_([a-z][a-z0-9_]*?)_(\d+)$/.exec(c);
      if (m && !c.includes("_tb_")) return { tipo: m[1], id: c };
    }
    return null;
  };
  const esEstructura = (t) => /^(section|row|row_inner|column(_\d+)?|column_inner(_\d+)?)$/.test(t);

  /** El estilo computado, en las dos formas que hacen falta. */
  const leer = (el, clave, extra) => {
    const cs = getComputedStyle(el);
    const est = {};
    for (const p of [
      "marginTop",
      "marginBottom",
      "marginLeft",
      "marginRight",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "width",
      "maxWidth",
      "float",
      "display",
      "boxSizing",
      "textAlign",
      /* §*un `em` citado sin su `font-size` es la misma trampa que un `%` sin su
       * contenedor*: el `padding: 0.5em` del botón no se puede escribir sin la
       * base contra la que resuelve, y la base se mide EN EL ELEMENTO. */
      "fontSize",
    ]) {
      /* Un valor que no es un px —`auto`, `none`, `left`— se guarda TAL CUAL:
       * convertirlo a `null` con `parseFloat` borraría la diferencia entre «no
       * hay medida» y «el valor es `none`», que es §regla 6 dentro del lector. */
      const n = num(cs[p]);
      est[p] = n === null ? cs[p] : n;
    }
    const r = el.getBoundingClientRect();
    el.setAttribute("data-f33k", clave);
    /**
     * ⚠ **Las CLASES propias y las de los ANCESTROS no son adorno: son los
     * candidatos a DISCRIMINADOR.** Cuando dos nodos del mismo nivel reciben
     * declaraciones distintas, la pregunta no es «¿cuál es la buena?» sino
     * «¿qué los separa, y está SERVIDO?» — y la respuesta vive casi siempre en
     * un token de clase (`et_pb_gutters2` frente a `gutters3`, `help-content`).
     * Sin recogerlos aquí, la partición habría que adivinarla.
     */
    const clases = [...el.classList].filter((c) => !/^et_pb_[a-z_]*_\d+$/.test(c));
    const ancestros = [];
    for (let a = el.parentElement, i = 0; a && i < 8; a = a.parentElement, i++)
      for (const c of a.classList) if (!/^et_pb_[a-z_]*_\d+$/.test(c)) ancestros.push(c);
    return {
      clave,
      ...extra,
      est,
      clases,
      ancestros: [...new Set(ancestros)],
      rectW: num(r.width),
      rectH: num(r.height),
      conCaja: r.width > 0,
    };
  };

  const SEL_SEC = selMuerto ? ".et_pb_seccion_que_no_existe" : ".et_pb_section";
  const nodos = [];
  let si = -1;
  for (const sec of $$(SEL_SEC)) {
    if (!propia(sec)) continue;
    si++;
    nodos.push(leer(sec, `s${si}`, { nivel: "seccion", id: idDe(sec)?.id ?? null }));

    let fi = -1;
    const filas = [...sec.querySelectorAll(".et_pb_row, .et_pb_row_inner")].filter(propia);
    for (const fila of filas) {
      fi++;
      const nF = leer(fila, `s${si}/f${fi}`, { nivel: "fila", id: idDe(fila)?.id ?? null, seccion: `s${si}` });
      nodos.push(nF);

      const cols = [...fila.querySelectorAll('[class*="et_pb_column"]')].filter(propia);
      let ci = -1;
      for (const col of cols) {
        ci++;
        const reparto = [...col.classList].map((c) => /^et_pb_column_(\d+_\d+)$/.exec(c)?.[1]).find(Boolean) ?? null;
        const nC = leer(col, `s${si}/f${fi}/c${ci}`, {
          nivel: "columna",
          reparto,
          fila: `s${si}/f${fi}`,
          ultima: ci === cols.length - 1,
          primera: ci === 0,
          hermanas: cols.length,
          wFila: nF.rectW,
          etLastChild: col.classList.contains("et-last-child"),
        });
        nodos.push(nC);

        /* Los módulos DIRECTOS: no se desciende dentro de otro módulo. */
        const mods = [];
        const baja = (n) => {
          for (const h of n.children) {
            const d = idDe(h);
            if (d && !esEstructura(d.tipo)) {
              mods.push({ el: h, tipo: d.tipo, id: d.id });
              continue;
            }
            baja(h);
          }
        };
        baja(col);
        mods.forEach((m, mi) => {
          nodos.push(
            leer(m.el, `s${si}/f${fi}/c${ci}/m${mi}`, {
              nivel: "modulo",
              tipo: m.tipo,
              id: m.id,
              columna: `s${si}/f${fi}/c${ci}`,
              reparto,
              wCol: nC.rectW,
              wFila: nF.rectW,
              ultimo: mi === mods.length - 1,
              hermanos: mods.length,
              etLastChild: m.el.classList.contains("et-last-child"),
            }),
          );
          /**
           * ⚠⚠ **EL ENVOLTORIO, Y NO ES UN NIVEL DE MÁS: ES EL NODO AL QUE
           * CORRESPONDE EL `.f33-modulo` DEL CLON.**
           *
           * El walker heredado de `f33-geo` identifica el módulo por su ORDINAL
           * (`et_pb_button_0`), y en `button` ese ordinal **está en el `<a>`**
           * mientras `et_pb_module` está en el `div` de fuera — que es lo que la
           * 101.ª midió contra el HTML servido (§F3-3-MARCADO-INTERIOR). Con lo
           * cual la regla de retícula `.et_pb_column_X .et_pb_module` **no casa
           * el nodo medido**, y sus 12 botones salen con `margin-bottom: 0` del
           * reset universal en vez de con el gutter de su columna.
           *
           * Leído sin esto, el derivador informa *«el `1_2` declara dos valores»*
           * y el discriminador que encuentra es `clase:et_pb_button` — cierto, y
           * **una conclusión sobre el instrumento disfrazada de dato**.
           *
           * ⚠ El criterio de recuento NO se cambia: `f33-spec` y `f33-geo` ya
           * censaron **313 módulos** con esta misma definición y tienen
           * consumidores, así que se unifica **con el criterio ya congelado** y
           * el envoltorio entra como **nivel aparte con su propio cardinal**
           * (§*dos instrumentos que censan el mismo objeto tienen que compartir
           * el criterio, y se unifica con el congelado*).
           */
          let env = m.el.parentElement;
          while (env && env !== col && !env.classList.contains("et_pb_module")) env = env.parentElement;
          if (env && env !== col && env.classList.contains("et_pb_module"))
            nodos.push(
              leer(env, `s${si}/f${fi}/c${ci}/m${mi}/w`, {
                nivel: "envoltorio",
                tipo: m.tipo,
                id: m.id,
                columna: `s${si}/f${fi}/c${ci}`,
                reparto,
                wCol: nC.rectW,
                wFila: nF.rectW,
                ultimo: mi === mods.length - 1,
                etLastChild: env.classList.contains("et-last-child"),
              }),
            );
        });
      }
    }

    /* Los *fullwidth* que cuelgan de la SECCIÓN sin pasar por fila. */
    let ui = -1;
    for (const h of sec.children) {
      const d = idDe(h);
      if (!d || esEstructura(d.tipo) || !propia(h)) continue;
      ui++;
      nodos.push(
        leer(h, `s${si}/u${ui}`, { nivel: "modulo", tipo: d.tipo, id: d.id, sinFila: true, reparto: null, wCol: null, wFila: null }),
      );
    }
  }
  return { nodos, hojasAplicadas: document.styleSheets.length };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA CASCADA, POR CDP — quién DECLARA cada propiedad y desde dónde
 *
 * `CSS.getMatchedStylesForNode` devuelve las reglas que casan **en orden de
 * precedencia creciente**, con su hoja y su `!important`. De ahí salen las dos
 * cosas que la derivación necesita:
 *
 *   · **el VEREDICTO** — ¿la declaración GANADORA viene de un selector con
 *     ordinal (el editor) o de uno genérico (la plantilla)?
 *   · **la REGLA** — el selector y el valor que la plantilla sirve, que es lo
 *     que se escribe en `f33.css`. Un px derivado no es lo mismo: `2.75 %` de
 *     la columna sobrevive a los dos anchos y un px no.
 *
 * ⚠ El ganador se calcula, no se supone: **`!important` gana a todo lo normal**,
 * y entre iguales gana **el último**. Coger «la última regla que la declara» a
 * secas daría el ganador equivocado cada vez que un `!important` esté antes —
 * y en este corpus los hay (`.et_pb_row_0.et_pb_row{padding-top:11px!important}`).
 * ═════════════════════════════════════════════════════════════════════════ */
/**
 * ¿el selector lleva un ordinal de módulo de ESTA página (no del cascarón)?
 *
 * ⚠⚠ **SE DECIDE POR TOKEN, NO CON UN REGEX SOBRE EL SELECTOR ENTERO — Y LA
 * PRIMERA VERSIÓN SE COMÍA SEIS OVERRIDES SIN DAR ERROR.**
 *
 * Empezó siendo `/\.et_pb_[a-z_]*?_\d+\b/`, y ese `\b` **no casa antes de un
 * `_`**: `.et_pb_button_0_wrapper` —que es exactamente lo que Divi compila
 * cuando el editor mueve un botón— quedaba clasificado como PLANTILLA. Con eso,
 * `margin-bottom: 3rem !important` de `centro-de-ayuda`, `60px !important` de
 * `empresa` y `-5% !important` de `productos` entraban en la población del
 * default: reglas de UNA página escritas en la hoja de las 31.
 *
 * Lo delató **la HOJA**, que esta sonda ya recogía: las tres venían del
 * `<style>` de su propia página mientras el resto del default venía de las hojas
 * del tema. Es §sondas 4 *la contradicción con una medida buena anterior*,
 * cobrada dentro de la sonda y **antes** de publicar.
 *
 * Y el remedio no es alargar el regex sino cambiar de unidad: se tokeniza el
 * selector en clases y se pregunta por cada una. La forma del ordinal de Divi es
 * `et_pb_<tipo>_<n>` con `<tipo>` **sin dígitos**, más sufijos alfabéticos
 * (`_wrapper`). Eso deja fuera por construcción los dos que se le parecen y no
 * lo son: el reparto `et_pb_column_1_2` (dos números) y `et_pb_gutters3` (sin
 * `_` antes del dígito), que son PLANTILLA y cuya reclasificación habría
 * invertido la derivación entera.
 */
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;
const SABOTAJE_CIEGO = SABOTAJE === "ordinal-ciego";
const esOrdinal = (sel) => {
  if (SABOTAJE_CIEGO || /_tb_/.test(sel)) return false;
  for (const m of sel.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (ORDINAL.test(m[1])) return true;
  return false;
};

/** CSS `margin-top` ⇄ JS `marginTop`. */
const aCss = (p) => p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * ⚠⚠ **EL NOMBRE DE LA HOJA SE RESUELVE AQUÍ, CON EL MAPA DE **ESTA** PÁGINA —
 * y la primera versión lo resolvía al final contra un mapa GLOBAL.**
 *
 * Los `styleSheetId` de CDP son **de la sesión de la página**, así que se
 * REPITEN entre páginas. Acumulándolos en un solo `Map`, el nombre que se
 * imprime al lado de cada regla puede ser el de la hoja de otra página — y como
 * el mapa se va pisando en el orden en que llegan los eventos, **el resultado
 * cambia entre corridas del mismo código**.
 *
 * Lo cazó el control de DETERMINISMO: dos corridas idénticas salvo **un** nodo
 * en `plantillaDesdeHojaDePagina` (90 contra 91). Un residuo de 1 en un
 * instrumento que lee un corpus ESTÁTICO no puede ser del dato — y la
 * explicación aburrida (§regla 16) era ésta, no «CDP no es determinista».
 *
 * ⚠ No afecta a la CLASIFICACIÓN, que se decide por el SELECTOR y no por la
 * hoja. Afecta a lo que la sonda **cita**, que es lo que después se copia a la
 * hoja del clon — o sea al único sitio donde nadie lo iba a comprobar.
 */
async function cascada(client, root, hojas) {
  const { nodeIds } = await client.send("DOM.querySelectorAll", { nodeId: root, selector: "[data-f33k]" });
  const fuera = new Map();
  for (const nodeId of nodeIds) {
    const { attributes } = await client.send("DOM.getAttributes", { nodeId });
    const i = attributes.indexOf("data-f33k");
    if (i < 0) continue;
    const clave = attributes[i + 1];

    let m;
    try {
      m = await client.send("CSS.getMatchedStylesForNode", { nodeId });
    } catch {
      continue;
    }
    /* ganador por propiedad: {origen, selector, valor, hoja} */
    const gana = {};
    const declaran = {};
    const anota = (sel, hoja, style, orden, inline) => {
      for (const p of style?.cssProperties ?? []) {
        if (!p.value || p.disabled) continue;
        const nom = p.name;
        if (!PROPS.some((x) => aCss(x) === nom)) continue;
        const editor = inline || esOrdinal(sel);
        (declaran[nom] ??= []).push({ sel, hoja, valor: p.value, editor, imp: !!p.important });
        const prev = gana[nom];
        const peso = (p.important ? 2 : 0) + (inline ? 1 : 0);
        if (!prev || peso > prev.peso || (peso === prev.peso && orden >= prev.orden))
          gana[nom] = { peso, orden, sel, hoja, valor: p.value, editor, imp: !!p.important };
      }
    };
    m.matchedCSSRules.forEach((r, i2) =>
      anota(r.rule.selectorList.text, hojas.get(r.rule.styleSheetId) ?? String(r.rule.styleSheetId ?? "?"), r.rule.style, i2, false),
    );
    if (m.inlineStyle) anota("(style=)", "(inline)", m.inlineStyle, 1e6, true);

    fuera.set(clave, { gana, declaran });
  }
  return fuera;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL RECORRIDO — cada página a LOS DOS ANCHOS, en la misma corrida
 * ═════════════════════════════════════════════════════════════════════════ */
const UA_MOVIL =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
const censo = new Censo();
const { browser } = await launch();
const paginas = [];
const hojasCero = [];
const hojasDesparejadas = [];


for (const pg of DOMINIO) {
  const crudo = readFileSync(join(CORPUS, pg.fichero), "utf8");
  const { html, enlazadas, resueltas } = conHojasLocales(crudo);
  if (resueltas === 0) hojasCero.push(pg.ruta);

  /**
   * ⚠ **UNA sola página por documento, y el ancho se cambia con el viewport.**
   * La primera versión abría dos y hacía `setContent` dos veces: la corrida
   * murió con `Navigation timeout of 120000 ms` en la 4.ª página, o sea que el
   * coste del doble montaje **no era teórico**. Es además lo que ya hace
   * `qa:f33-geo`, y compartir el montaje es lo que garantiza que los dos anchos
   * se miden **sobre el mismo DOM** — que es lo que el test A exige.
   */
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (r) => (r.url().startsWith("file://") || r.url() === "about:blank" ? r.continue() : r.abort()));
  let hojasDeLaPagina = new Map();
  let client;
  /** Abre una sesión CDP con sus dos dominios y su escucha de hojas. */
  const abreSesion = async () => {
    hojasDeLaPagina = new Map();
    const c = await page.createCDPSession();
    c.on("CSS.styleSheetAdded", (e) =>
      hojasDeLaPagina.set(e.header.styleSheetId, e.header.sourceURL.split("/").slice(-2).join("/") || `(inline ${e.header.title || "style"})`),
    );
    await c.send("DOM.enable");
    await c.send("CSS.enable");
    return c;
  };
  client = await abreSesion();

  await page.goto(pathToFileURL(join(CORPUS, pg.fichero)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  /**
   * ⚠⚠ **`load`, NO `networkidle0` — y no es una rebaja: es la espera que
   * contesta la pregunta, y encima la ACOTADA.**
   *
   * Lo que hace falta antes de medir es *«las hojas y las imágenes ya están»*, y
   * eso **es** `load`. `networkidle0` contesta otra cosa —*«nadie ha pedido nada
   * en 500 ms»*— que un solo recurso rezagado puede impedir para siempre.
   *
   * Y no era teórico: **el sabotaje `sin-hojas` lo agotaba a los 120 s**, y sólo
   * ése. El mecanismo es suyo — sin CSS, todo lo que las hojas ESCONDEN pasa a
   * ser visible, así que la página pide muchos más subrecursos, los aborta la
   * intercepción, y la red no llega a quedarse quieta. El caso salía `exit 1`
   * sin congelar: §regla 17, *una espera sin tope no da rojo, se AGOTA — ni pasa
   * ni falla*.
   *
   * ⚠ **Y el NO-OP se escribe con lo que de verdad se midió, no con «idéntica».**
   * Comprobado contra las **3** corridas (`networkidle0` · `load` · `load` +
   * `fonts.ready`):
   *
   *   · **0 de 48** reglas difieren en lo DECLARADO, en sus poblaciones, en sus
   *     separadoras ni en las reglas servidas — o sea **todo lo que la hoja
   *     usa**; los controles y `anchoPorReparto` también idénticos;
   *   · **1 nodo de 570** difiere en el campo de EVIDENCIA (`computado1440`), y
   *     es un botón: `7.5 → 7.27 → 7.49`. Es el `em` otra vez, y por eso va
   *     `fonts.ready` abajo.
   *
   * Se declara así y no como «idéntica» porque **no lo es**: decir NO-OP de una
   * corrida que mueve un nodo sería §*el marcador prueba que el build es nuevo,
   * no que el cambio tenga efecto* con el signo cambiado.
   */
  await page.setContent(html, { waitUntil: "load", timeout: 120_000 });

  /**
   * ⚠ **La espera va ACOTADA, y el tope es parte del contrato** (§regla 17,
   * copiado de `f33-geo` con su razón): con la red cortada una `src` abortada
   * puede dejar la promesa colgada, y una espera sin tope **no da rojo: se
   * AGOTA** — ni pasa ni falla. Y se asienta OTRA VEZ tras cambiar el viewport,
   * porque un `srcset` puede pedir otro fichero a 390.
   */
  const asienta = async () => {
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll("img")) {
        img.loading = "eager";
        img.decoding = "sync";
      }
      const listas = Promise.all(
        [...document.images]
          .filter((i) => !i.complete)
          .map((i) => new Promise((r) => {
            i.onload = i.onerror = r;
          })),
      );
      await Promise.race([listas, new Promise((r) => setTimeout(r, 2000))]);
      /**
       * ⚠⚠ **LAS FUENTES, Y NO ES HIGIENE: ESTA SONDA MIDE `em`.**
       *
       * El `padding` del botón se declara `0.5em`, así que su px **depende del
       * `font-size` resuelto**, y el `font-size` resuelto depende de que la
       * fuente esté cargada. Sin esperarla, un botón de 31 páginas computaba
       * **7.27 en vez de 7.5** (`0.5 × 14.54` contra `0.5 × 15`) y arrastraba su
       * `padding-bottom` (8.66 / 9), su `margin-right` (13.87 / 15) y su ancho
       * (226.66 / 228.36).
       *
       * Es la §*un `em` sin su `font-size`* del propio `CLAUDE.md` cobrada
       * **dentro del instrumento**: no en cómo se cita el valor, sino en cuándo
       * se lee la base. Y la diferencia era de UN nodo, o sea justo el tamaño que
       * se lee como ruido y no lo es.
       *
       * Va ACOTADA como el resto (§regla 17): `fonts.ready` puede no resolver
       * nunca con la red cortada.
       */
      if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
  };
  await asienta();

  const porAncho = {};
  for (const ancho of [1440, 390]) {
    /**
     * ⚠⚠ **EL MÓVIL VA POR `Emulation.setDeviceMetricsOverride` Y NO POR
     * `setViewport({isMobile})` — Y LA DIFERENCIA NO ES DE ESTILO: SON 85.8 px
     * DE ANCHO DE FILA.**
     *
     * `setViewport` **RECARGA la página** cuando cambia `isMobile`/`hasTouch`
     * (lo hace puppeteer por dentro), y una recarga sobre un documento montado
     * con `setContent` **vuelve al fichero CRUDO**: los `<link>` reescritos a
     * `file://` desaparecen y los siete se van con ellos. Quedan las hojas EN
     * LÍNEA —que son la mayoría de las reglas— así que la medida **no falla:
     * sale PLAUSIBLE**, que es exactamente §F3-1-CSS-NO-CAPTURADO entrando por
     * otra puerta — no «no se capturaron», sino «se cayeron al medir».
     *
     * **Medido en 6 de 6 rutas, y difieren las 6:**
     *
     *     setViewport(isMobile)      fila 249.594  ·  <link file:> ausente
     *     deviceMetricsOverride      fila 335.391  ·  <link file:> presente
     *
     * `335.39` es el ancho que `kb.css` ya tiene documentado a 390, y sale de
     * `.et_pb_row{width:86%}` de `KunakAir/style.css` — una hoja ENLAZADA. Con
     * la recarga gana el `80%` de Divi porque la que lo pisaba ya no está.
     *
     * Y esto no es una preferencia: `CLAUDE.md` §Notas de método lo manda desde
     * el principio —*«Móvil solo con `Emulation.setDeviceMetricsOverride`»*—.
     * La excepción que documenta es la CAPTURA, y aquí no se captura nada.
     *
     * ⚠ `qa:f33-geo` usa el camino de `setViewport`, así que su lado de 390
     * arrastra este defecto: ficha `F3-3-GEO-390-SIN-HOJAS-ENLAZADAS`.
     */
    if (ancho <= 500 && SABOTAJE === "movil-recarga") {
      /* El camino VIEJO, el que recarga. Existe sólo para que su guarda tenga
       * un negativo que la ejercite con el modo de fallo REAL (§regla 28: el
       * sabotaje reproduce el fallo, no la aritmética de la condición). */
      await page.setViewport({ width: ancho, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await page.setUserAgent(UA_MOVIL);
      /**
       * ⚠ **La recarga que ESTE sabotaje reproduce se lleva por delante la
       * sesión CDP**, y con ella los `nodeId` del árbol: `DOM.getAttributes`
       * tira `TargetCloseError` y la sonda muere **antes de congelar**. Sin
       * esto el caso salía `exit 1` y su `comprueba` no podía mirar nada —
       * §regla 31: *una guarda que tira antes de congelar deja a su propio
       * negativo sin nada que comparar, y el exit es justo lo que ese caso
       * declara insuficiente*.
       *
       * Rehacer la sesión **es parte de reproducir fielmente el camino viejo**
       * (`qa:f33-geo` no usa CDP, por eso allí no se notaba), y no toca el
       * camino real: el `control` sigue reproduciendo la congelada al byte.
       */
      client = await abreSesion();
    } else if (ancho <= 500) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: ancho,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      /* No recarga (`Network.setUserAgentOverride`), así que no se lleva las
       * hojas por delante. La geometría de Divi es por media query, no por UA. */
      await page.setUserAgent(UA_MOVIL);
    } else {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: ancho,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }
    await asienta();
    censo.grupo(`${pg.regimen}@${ancho}`);
    const { datos } = await censo.medir(page, medir, SABOTAJE === "selector-muerto");
    /* El árbol se vuelve a pedir en CADA ancho: las reglas que casan cambian con
     * las media queries, y ahí es donde vive el piso móvil de la cascada. */
    const { root } = await client.send("DOM.getDocument", { depth: -1 });
    const casc = await cascada(client, root.nodeId, hojasDeLaPagina);
    porAncho[ancho] = { nodos: datos.nodos, cascada: casc, hojasAplicadas: datos.hojasAplicadas };
  }
  await page.close();

  /**
   * ⚠⚠ **LA GUARDA QUE HABRÍA CAZADO LA RECARGA: LAS HOJAS SE CUENTAN EN CADA
   * ANCHO, NO SÓLO AL CARGAR.**
   *
   * Resolver los `<link>` al montar prueba que las hojas ESTABAN; no prueba que
   * sigan aplicándose **en el momento de medir**. Entre las dos cosas cabe una
   * recarga, y ahí es donde se perdieron 7 hojas a 390 sin que nada fallara.
   * Es §*el marcador prueba que el build es nuevo, NO que el cambio tenga
   * efecto* con el objeto cambiado: la precondición se comprueba **donde se
   * usa**, no donde se prepara.
   */
  const hojasPorAncho = Object.fromEntries(Object.entries(porAncho).map(([a, v]) => [a, v.hojasAplicadas]));
  if (hojasPorAncho[390] !== hojasPorAncho[1440]) hojasDesparejadas.push({ ruta: pg.ruta, ...hojasPorAncho });

  paginas.push({ ruta: pg.ruta, regimen: pg.regimen, hojas: { enlazadas, resueltas, porAncho: hojasPorAncho }, porAncho });
  ev.ok();
  process.stdout.write(
    `  · ${pg.ruta.padEnd(60).slice(0, 60)} ${pg.regimen} · ${porAncho[1440].nodos.length} nodos · hojas ${resueltas}/${enlazadas}\n`,
  );
}
await browser.close();

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LA UNIÓN — un registro por nodo, con sus dos anchos y su veredicto
 * ═════════════════════════════════════════════════════════════════════════ */
/** La hoja llega ya RESUELTA desde , con el mapa de su propia página. */
const nombreHoja = (h) => String(h ?? "?");

const TODOS = [];
for (const p of paginas) {
  const g = p.porAncho[1440];
  const m = p.porAncho[390];
  const porClave390 = new Map((m?.nodos ?? []).map((n) => [n.clave, n]));
  for (const n of g?.nodos ?? []) {
    const n390 = porClave390.get(n.clave) ?? null;
    TODOS.push({
      ruta: p.ruta,
      regimen: p.regimen,
      ...n,
      p390: n390,
      casc: g.cascada.get(n.clave) ?? null,
      casc390: m ? (m.cascada.get(n.clave) ?? null) : null,
    });
  }
}

/**
 * ⚠ **LO QUE NO TIENE CAJA NO SE CUENTA NI SE ANALIZA** (`CLAUDE.md` §*lo que no
 * tiene caja no es que no se cuente — es que no se puede medir, y aun así
 * devuelve números*). `getComputedStyle` sobre un módulo dentro de un
 * desplegable cerrado **no resuelve los % contra nada**: devuelve ceros que
 * fabricarían un pico que el original no tiene.
 */
const SIN_CAJA = TODOS.filter((n) => !n.conCaja);
const VIVOS = TODOS.filter((n) => n.conCaja);
const sinCajaPorTipo = {};
for (const n of SIN_CAJA) sinCajaPorTipo[n.tipo ?? n.nivel] = (sinCajaPorTipo[n.tipo ?? n.nivel] ?? 0) + 1;

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · EL DERIVADOR
 *
 * **El default de una propiedad es el valor MEDIDO en los nodos cuya
 * declaración GANADORA NO viene del editor.** Si esos nodos no coinciden entre
 * sí, no hay default que escribir y la derivación FALLA nombrando la propiedad
 * — una clase no puede emitir dos valores (mismo contrato que `qa:kb-clases`).
 *
 * ⚠ Y un conjunto VACÍO no devuelve nada benigno: *«ningún nodo llega al
 * default»* y *«el default es X»* son afirmaciones distintas, y la primera no
 * autoriza a escribir la segunda (§regla 6).
 * ═════════════════════════════════════════════════════════════════════════ */
const reglas = [];
const problemas = [];
/** Lo que la sonda NO puede derivar, NOMBRADO con lo que haría falta (CORTE LIMPIO 1). */
const sinDerivar = [];

/** ¿la declaración ganadora de `prop` en este nodo la puso el EDITOR? */
const delEditor = (casc, prop) => !!casc?.gana?.[aCss(prop)]?.editor;

/**
 * ⚠⚠ **LO QUE SE DERIVA ES LA DECLARACIÓN, NO EL VALOR COMPUTADO — Y LA
 * DIFERENCIA NO ES DE ESTILO: DECIDE SI LA REGLA SOBREVIVE A LOS DOS ANCHOS.**
 *
 * El valor computado es el valor **USADO**, así que confunde dos cosas:
 *
 *   · `margin: auto` de una fila **computa `0px`** en las visibles — `kb.css` ya
 *     documenta que escribir ese `0px` daba Δ en 15 pares que ningún ancho
 *     enseña, y que la única forma de leer el `auto` era mirar un nodo OCULTO;
 *   · `padding: 4%` de la sección **computa 36.47 contra la columna de 911.75 y
 *     57.59 contra la de 1440**. Escribir el px es cablear un contenedor: es
 *     literalmente §*un default expresado como porcentaje se lee como constante
 *     en cuanto se cita, porque el px es lo que se puede comparar y el
 *     contenedor no viaja con él*.
 *
 * La cascada devuelve **lo declarado**, así que aquí el default es *el valor que
 * la regla ganadora GENÉRICA declara* —`4%`, `auto`, `2.75%`— y el computado va
 * al lado como **evidencia de que esa regla llega a la propiedad**. Los dos
 * hacen falta y son las dos mitades de §El principio: la cascada nombra la
 * regla, `getComputedStyle` adjudica que gana.
 *
 * Un nodo sin ninguna regla que declare la propiedad no es un hueco: su
 * declaración es **`(inicial)`**, que es un valor tan bueno como los otros y
 * además el que §*un eje cuyo ÚNICO valor observado es el inicial sale SIN
 * ESCRIBIR* manda no cablear.
 */
const declarado = (casc, prop) => {
  const g = casc?.gana?.[aCss(prop)];
  return g && !g.editor ? g.valor + (g.imp ? " !important" : "") : g ? null : "(inicial)";
};

/** Las reglas GENÉRICAS ganadoras, agregadas con su hoja y su valor. */
function reglasServidas(nodos, prop, lado) {
  const acc = new Map();
  for (const n of nodos) {
    const g = (lado === 390 ? n.casc390 : n.casc)?.gana?.[aCss(prop)];
    if (!g || g.editor) continue;
    const e = acc.get(g.sel) ?? { selector: g.sel, hoja: nombreHoja(g.hoja), valores: new Map(), n: 0, important: g.imp };
    e.n++;
    e.valores.set(g.valor, (e.valores.get(g.valor) ?? 0) + 1);
    acc.set(g.sel, e);
  }
  return [...acc.values()]
    .sort((a, b) => b.n - a.n)
    .map((e) => ({
      selector: e.selector.length > 160 ? `${e.selector.slice(0, 157)}…` : e.selector,
      hoja: e.hoja,
      important: e.important,
      n: e.n,
      valor: Object.fromEntries(e.valores),
    }));
}

const cuenta = (xs, f) => {
  const m = new Map();
  for (const x of xs) {
    const k = f(x);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};

/**
 * Deriva UNA declaración.
 *
 * El denominador de móvil es **el suyo**: un nodo con override de móvil del
 * editor **no llega** al default de móvil, así que confundir los dos
 * denominadores inventa un conflicto que no existe — medido en `kb-clases`,
 * donde 10 módulos con override a 0 daban «dos valores» del instrumento.
 */
function deriva({ selector, prop, nivel, niveles, filtra, nota, obligatorio = true }) {
  const ns = niveles ?? [nivel];
  const cand = VIVOS.filter((n) => ns.includes(n.nivel) && (!filtra || filtra(n)));
  const llegan = cand.filter((n) => !delEditor(n.casc, prop));
  const llegan390 = cand.filter((n) => n.p390 && !delEditor(n.casc, prop) && !delEditor(n.casc390, prop));

  const d1440 = cuenta(llegan, (n) => declarado(n.casc, prop));
  const d390 = cuenta(llegan390, (n) => declarado(n.casc390, prop));
  const c1440 = cuenta(llegan, (n) => n.est[prop]);
  const c390 = cuenta(llegan390, (n) => n.p390.est[prop]);

  const r = {
    selector,
    prop: aCss(prop),
    n: llegan.length,
    nMovil: llegan390.length,
    deCuantos: cand.length,
    delEditor: cand.length - llegan.length,
    /** LO QUE LA HOJA TIENE QUE ESCRIBIR. */
    declarado1440: [...d1440.keys()],
    declarado390: [...d390.keys()],
    repartoDeclarado1440: Object.fromEntries(d1440),
    repartoDeclarado390: Object.fromEntries(d390),
    /** EVIDENCIA de que esa declaración llega a la propiedad. */
    computado1440: [...c1440.keys()],
    computado390: [...c390.keys()],
    repartoComputado1440: Object.fromEntries(c1440),
    regla1440: reglasServidas(llegan, prop, 1440),
    regla390: reglasServidas(llegan390, prop, 390),
    nota: nota ?? null,
  };
  /**
   * ⚠⚠ **CUANDO LA POBLACIÓN NO COINCIDE, LA PREGUNTA NO ES «¿CUÁL ES LA
   * BUENA?» SINO «¿QUÉ LAS SEPARA, Y ESTÁ SERVIDO?».**
   *
   * La primera versión de este derivador exigía **un** valor y fichaba nueve
   * conflictos. Ocho de los nueve no eran conflictos: eran **dos reglas
   * distintas del original leídas al nivel de arriba** —`gutters2` frente a
   * `gutters3`, `.help-content` frente al resto, el `padding` del botón frente
   * al del resto de módulos—. O sea §*la causa común: el NIVEL al que se mide*
   * cometida dentro de la sonda, con el contenedor puesto en **la clase que
   * agrupa**.
   *
   * Así que aquí se BUSCA la partición en vez de elegir un valor: se prueban
   * los ejes que el nodo trae —tipo, posición, reparto y **cada token de clase
   * propia o heredada**— y se publica cuál separa los grupos **1:1**. Un eje que
   * separa 1:1 es una **subclase que la hoja tiene que escribir**; que no lo
   * haya es el conflicto de verdad, y ése sí sale SIN DERIVAR.
   *
   * ⚠ Y el eje se elige por lo que dice `CLAUDE.md`: **el que tenga mecanismo y
   * esté SERVIDO** — por eso los candidatos son tokens de clase del original y
   * no propiedades calculadas. Un `1:1` sobre un eje que el clon no puede emitir
   * no sirve de nada, y por eso se publica el eje, no sólo el hecho de que exista.
   */
  const ejes = (n) => {
    const e = { tipo: n.tipo ?? null, reparto: n.reparto ?? null, ultimo: n.ultimo ?? n.ultima ?? null, regimen: n.regimen };
    /* ⚠ Los tokens `_tb_` NO son candidatos: son de la capa del CASCARÓN, que
     * esta sonda excluye como nodo y como regla, y **el clon no los emite**. Un
     * eje que separa 1:1 pero que el clon no puede escribir no es un
     * discriminador: es una coincidencia con la que no se puede hacer nada. */
    for (const c of n.clases ?? []) if (!c.includes("_tb_")) e[`clase:${c}`] = true;
    for (const c of n.ancestros ?? []) if (!c.includes("_tb_")) e[`de:${c}`] = true;
    return e;
  };
  /**
   * La unidad de la comparación es **el PAR** —lo declarado a 1440 y a 390—,
   * porque eso es lo que la hoja escribe: una regla con su piso móvil. Mirar
   * sólo 1440 daría por unánime a `.f33-columna{margin-bottom}`, que declara
   * `0px` en los 145 a 1440 y **`30px` en 66 de ellos al apilar**.
   */
  const par = (n) => `${declarado(n.casc, prop)}  @390 ${declarado(n.casc390, prop)}`;
  const pares = cuenta(llegan390, par);
  r.par = Object.fromEntries(pares);

  let separa = null;
  if (pares.size > 1 && llegan390.length) {
    const claves = new Set();
    for (const n of llegan390) for (const k of Object.keys(ejes(n))) claves.add(k);
    const buenos = [];
    for (const k of claves) {
      /* 1:1 exige las DOS direcciones: cada valor del eje da un solo par Y cada
       * par un solo valor del eje. Sólo la primera es «el eje explica»; sin la
       * segunda, un eje muy fino «explica» cualquier cosa partiéndola en trozos. */
      const porEje = new Map();
      const porValor = new Map();
      for (const n of llegan390) {
        const ve = String(ejes(n)[k] ?? "—");
        const vd = par(n);
        if (!porEje.has(ve)) porEje.set(ve, new Set());
        if (!porValor.has(vd)) porValor.set(vd, new Set());
        porEje.get(ve).add(vd);
        porValor.get(vd).add(ve);
      }
      /**
       * ⚠⚠ **DOS CRITERIOS, NO UNO — Y EXIGIR EL FUERTE PIERDE EL EJE BUENO.**
       *
       * · **EXPLICA**: cada valor del eje da UN solo par. Es lo que hace falta
       *   para escribir el selector, y admite **muchos-a-uno**;
       * · **BIYECTIVO**: además cada par da un solo valor del eje.
       *
       * La primera versión exigía el biyectivo, y con eso `.f33-modulo
       * {padding-top}` salió con **0 candidatos** teniendo delante el eje bueno:
       * `tipo` tiene 7 valores y sólo 3 pares —`0px` para cinco tipos, `20px`
       * para `toggle`, `0.5em` para `button`—, o sea muchos-a-uno perfecto. El
       * criterio fuerte lo descartaba por ser DEMASIADO explicativo.
       *
       * La guarda contra el eje que «explica» por ser único por nodo no es la
       * biyección: es **que tenga menos valores que nodos**. Un eje con un valor
       * por nodo explica cualquier cosa y no dice nada.
       */
      const explica = [...porEje.values()].every((s) => s.size === 1) && porEje.size < llegan390.length;
      if (!explica) continue;
      const biyectivo = porEje.size === pares.size && [...porValor.values()].every((s) => s.size === 1);
      buenos.push({
        eje: k,
        biyectivo,
        grupos: Object.fromEntries([...porEje].map(([a, s]) => [a, [...s][0]])),
        n: Object.fromEntries([...porEje].map(([a]) => [a, llegan390.filter((n) => String(ejes(n)[k] ?? "—") === a).length])),
      });
    }
    /* Ordenados por lo que los hace utilizables: primero el que es EXACTAMENTE
     * el discriminador, luego el que reparte en menos grupos. */
    buenos.sort((a, b) => Number(b.biyectivo) - Number(a.biyectivo) || Object.keys(a.grupos).length - Object.keys(b.grupos).length);
    separa = { nCandidatos: buenos.length, nBiyectivos: buenos.filter((x) => x.biyectivo).length, candidatos: buenos.slice(0, 6) };
    r.separa = separa;
  }

  reglas.push(r);

  /**
   * ⚠ **`obligatorio: false` NO puede querer decir «pasa en silencio».** Eso
   * sería exactamente el hueco del que el CORTE LIMPIO 1 avisa: *si el
   * instrumento no puede derivar algo, sale NOMBRADO con lo que haría falta*.
   * Así que lo no obligatorio que no resuelve va a `sinDerivar` —visible, con su
   * cardinal y sus valores— en vez de cerrar el código de salida.
   */
  if (!obligatorio) {
    /* ⚠ Población VACÍA: «no hay nadie que llegue al default» y «el default es
     * X» son afirmaciones distintas, y la primera no autoriza a escribir la
     * segunda (§regla 6). Sale NOMBRADA, no en silencio. */
    if (llegan390.length === 0)
      sinDerivar.push({
        selector,
        prop: aCss(prop),
        n: 0,
        deCuantos: cand.length,
        valores: {},
        haceFalta:
          cand.length === 0
            ? "una instancia de este caso en el corpus: hoy no hay NINGUNA que lo ejercite"
            : `una instancia que llegue al default: las ${cand.length} que hay las escribe el editor`,
      });
    else if (pares.size > 1 && !separa?.nCandidatos)
      sinDerivar.push({
        selector,
        prop: aCss(prop),
        n: llegan390.length,
        valores: Object.fromEntries(pares),
        haceFalta:
          "un eje SERVIDO que separe estos valores y que el clon pueda emitir; " +
          "hoy ninguno de los tokens de clase propios ni heredados lo hace",
      });
    return r;
  }
  if (llegan.length === 0 || llegan390.length === 0)
    problemas.push({
      selector,
      prop: aCss(prop),
      por: `NINGUNO de los ${cand.length} nodos llega al default (@1440 ${llegan.length} · @390 ${llegan390.length}): sin población no hay default derivable.`,
    });
  else if (pares.size > 1 && !separa?.nCandidatos)
    problemas.push({
      selector,
      prop: aCss(prop),
      por:
        `los nodos que el editor NO toca declaran cosas distintas y NINGÚN eje servido los separa 1:1: ` +
        `${[...pares.entries()].map(([k, c]) => `«${k}»×${c}`).join(" · ")}. ` +
        `Sin discriminador no hay dos clases que escribir: es SIN DERIVAR.`,
    });
  return r;
}

/* ── SECCIÓN · `.f33-seccion` ─────────────────────────────────────────────── */
for (const p of ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "width", "boxSizing", "textAlign"])
  deriva({ selector: ".f33-seccion", prop: p, nivel: "seccion" });

/* ── FILA · `.f33-fila` ───────────────────────────────────────────────────── */
for (const p of ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "marginLeft", "width", "maxWidth", "boxSizing"])
  deriva({ selector: ".f33-fila", prop: p, nivel: "fila" });

/* ── COLUMNA · `.f33-columna` y `.f33-col-<reparto>` ──────────────────────── */
for (const p of ["float", "marginBottom", "paddingTop", "paddingBottom", "boxSizing"])
  deriva({ selector: ".f33-columna", prop: p, nivel: "columna" });

/**
 * El CANAL de la retícula: `margin-right` es POSICIONAL, no campo — la última
 * columna no lo lleva y las demás sí. Se derivan por separado porque son dos
 * reglas distintas y agregarlas daría «dos valores» de una sola cosa.
 */
deriva({ selector: ".f33-columna:not(:last-child)", prop: "marginRight", nivel: "columna", filtra: (n) => !n.ultima });
deriva({ selector: ".f33-columna:last-child", prop: "marginRight", nivel: "columna", filtra: (n) => n.ultima });

/**
 * El ANCHO por reparto, como RAZÓN contra la fila propia.
 *
 * ⚠ Se emite la razón CRUDA y sus candidatos legibles, y **quien adjudica es
 * `qa:f33-cmp`**: el valor computado está cuantizado a 1/64 px (LayoutUnit), así
 * que un px medido **no determina un porcentaje** — determina un conjunto. Un
 * intervalo calculado aquí sería un número plausible que ninguna medida
 * respalda (mismo precedente que `kb-clases`, donde la 1.ª versión lo emitió y
 * habría fallado por un cuanto).
 */
const anchosColumna = {};
for (const n of VIVOS.filter((x) => x.nivel === "columna" && x.reparto)) {
  const e = (anchosColumna[n.reparto] ??= { n: 0, pct1440: new Map(), pct390: new Map(), wFila: new Set() });
  e.n++;
  if (n.wFila) {
    e.pct1440.set(Math.round((n.rectW / n.wFila) * 1e6) / 1e4, (e.pct1440.get(Math.round((n.rectW / n.wFila) * 1e6) / 1e4) ?? 0) + 1);
    e.wFila.add(n.wFila);
  }
  if (n.p390?.rectW && n.p390 && n.p390.rectW > 0) {
    const f390 = TODOS.find((x) => x.ruta === n.ruta && x.clave === n.fila)?.p390?.rectW;
    if (f390) {
      const k = Math.round((n.p390.rectW / f390) * 1e6) / 1e4;
      e.pct390.set(k, (e.pct390.get(k) ?? 0) + 1);
    }
  }
}
/**
 * ⚠⚠ **Y EL ANCHO DECLARADO, QUE ES LO QUE SE ESCRIBE — la razón medida es la
 * EVIDENCIA, no la regla.**
 *
 * `kb.css` escribió el ancho de columna como la razón px/px con seis decimales
 * y dejó dicho que *«la cuantización a 1/64 px no la resuelve la aritmética»*.
 * Cierto — y evitable: **la declaración está SERVIDA** (`.et_pb_gutters3
 * .et_pb_column_1_2 { width: 47.25% }`), así que no hay que reconstruirla desde
 * el píxel. Copiar la razón medida en vez de la declaración es §*transcribir la
 * declaración servida* al revés: reconstruir a ojo lo que el original ya dice.
 */
for (const rep of Object.keys(anchosColumna))
  deriva({
    selector: `.f33-col-${rep}`,
    prop: "width",
    nivel: "columna",
    filtra: (n) => n.reparto === rep,
    nota: "el ancho DECLARADO por la retícula de Divi; la razón medida va en `anchoPorReparto` como evidencia",
    obligatorio: false,
  });

/** El ancho del MÓDULO — el canal de `anchoPct`, que es CAMPO (f33-geo §veredictos). */
deriva({ selector: ".f33-modulo", prop: "width", nivel: "modulo", filtra: (n) => !n.sinFila, obligatorio: false });

const anchoPorReparto = {};
for (const [rep, e] of Object.entries(anchosColumna))
  anchoPorReparto[rep] = {
    n: e.n,
    pct1440: Object.fromEntries(e.pct1440),
    pct390: Object.fromEntries(e.pct390),
    anchosDeFila: [...e.wFila].sort((a, b) => a - b),
    adjudica: "qa:f33-cmp — la cuantización a 1/64 px no la resuelve la aritmética de esta sonda",
  };

/* ── MÓDULO · `.f33-modulo` ───────────────────────────────────────────────── */
for (const p of ["marginTop", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "boxSizing"])
  deriva({ selector: ".f33-modulo", prop: p, nivel: "modulo", filtra: (n) => !n.sinFila });

/**
 * `margin-bottom` del módulo — **la propiedad que decide el alto de la página**.
 *
 * `CLAUDE.md` la documenta como *«una función del ANCHO DE LA FILA … el
 * mecanismo queda SIN PROBAR»*. La cascada lo NOMBRA: la regla servida es
 * `.et_pb_gutters3 .et_pb_column_<reparto> .et_pb_module { margin-bottom: P% }`,
 * o sea un **porcentaje de la COLUMNA distinto por reparto** — y por eso el px
 * resultante es la misma fracción de la FILA en todos. Se deriva POR REPARTO,
 * que es la unidad en la que el original la escribe.
 */
/**
 * ⚠ **La población es LA QUE LLEVA `et_pb_module`, no «los módulos».** El
 * selector servido es `.et_pb_gutters3 .et_pb_column_X .et_pb_module`, así que
 * los nodos a los que la regla llega son exactamente los portadores de esa
 * clase — que en `button` es el ENVOLTORIO y no el nodo con ordinal. Filtrar
 * por nivel en vez de por la clase del selector metía 12 botones con el `0px`
 * del reset en una distribución de gutters, y el derivador informaba «dos
 * valores» de una regla que sólo tiene uno (§*la causa común: el NIVEL*).
 */
const llevaModulo = (n) => (n.clases ?? []).includes("et_pb_module");
for (const rep of Object.keys(anchoPorReparto))
  deriva({
    selector: `.f33-col-${rep} > .f33-modulo`,
    prop: "marginBottom",
    niveles: ["modulo", "envoltorio"],
    filtra: (n) => !n.sinFila && n.reparto === rep && !n.ultimo && llevaModulo(n),
    nota: "el default lo sirve `.et_pb_gutters<n> .et_pb_column_<reparto> .et_pb_module` como % de la COLUMNA; ver `regla1440`",
    obligatorio: false,
  });

/**
 * El ÚLTIMO módulo de la columna. §reticula.spec.md §2 lo midió en **78 de 79**
 * columnas y el nivel de arriba lo confirma **por ausencia** (0 de 51). Aquí se
 * deriva del mismo canal que todo lo demás, para no cablear una medida ajena.
 */
deriva({
  selector: ".f33-modulo:last-child",
  prop: "marginBottom",
  niveles: ["modulo", "envoltorio"],
  filtra: (n) => !n.sinFila && n.ultimo && llevaModulo(n),
  nota: "el original lo sirve con `.et-last-child`; el clon no emite esa clase, así que la hoja usa `:last-child`",
  obligatorio: false,
});

/* ── El ENVOLTORIO del módulo · el nodo al que corresponde `.f33-modulo` ────
 * Sólo lo tiene `button` en este corpus. Se deriva aparte y con su cardinal: es
 * el nodo que SÍ lleva `et_pb_module`, o sea el que recibe la regla de retícula
 * — y el que el clon emite como `<div class="f33-modulo f33-boton">`. */
{
  const envs = VIVOS.filter((n) => n.nivel === "envoltorio");
  const porTipoEnv = {};
  for (const n of envs) porTipoEnv[n.tipo] = (porTipoEnv[n.tipo] ?? 0) + 1;
  reglas.push({
    selector: ".f33-modulo · ENVOLTORIO del original",
    prop: "(nivel aparte)",
    n: envs.length,
    deCuantos: TODOS.filter((n) => n.nivel === "envoltorio").length,
    porTipo: porTipoEnv,
    declarado1440: [...new Set(envs.map((n) => declarado(n.casc, "marginBottom")))],
    declarado390: [...new Set(envs.map((n) => declarado(n.casc390, "marginBottom")))],
    regla1440: reglasServidas(envs, "marginBottom", 1440),
    nota:
      "el walker identifica el módulo por su ORDINAL y en `button` el ordinal está en el <a>; `et_pb_module` está en el div de fuera. " +
      "Éste es el nodo que recibe la retícula, y el que el clon emite como `.f33-modulo.f33-boton`",
  });
  for (const p of ["marginBottom", "marginTop", "paddingTop", "paddingBottom"])
    deriva({ selector: ".f33-modulo[envoltorio]", prop: p, nivel: "envoltorio", obligatorio: false });
}

/* ── El MÓDULO SUELTO de sección (fullwidth) ──────────────────────────────── */
{
  const sueltos = VIVOS.filter((n) => n.nivel === "modulo" && n.sinFila);
  reglas.push({
    selector: ".f33-seccion > .f33-modulo",
    prop: "(módulo suelto, sin fila)",
    n: sueltos.length,
    deCuantos: TODOS.filter((n) => n.nivel === "modulo" && n.sinFila).length,
    declarado1440: [...new Set(sueltos.map((n) => `mt${n.est.marginTop} mb${n.est.marginBottom} w${n.rectW}`))],
    nota: "los `fullwidth` cuelgan de la SECCIÓN sin pasar por fila; hoy los 2 medidos son `slider-completo`, o sea SIN_CABLEAR",
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * 8 · LAS FAMILIAS QUE ESTA SONDA **NO** DERIVA — con su cero (§regla 14)
 * ═════════════════════════════════════════════════════════════════════════ */
const familias = {
  "--f33s-*": { consume: "ritmo de SECCIÓN", derivada: reglas.some((r) => r.selector === ".f33-seccion" && r.declarado1440.length === 1) },
  "--f33f-*": { consume: "ritmo de FILA", derivada: reglas.some((r) => r.selector === ".f33-fila" && r.declarado1440.length === 1) },
  "--f33m-*": { consume: "ritmo y ancho de MÓDULO", derivada: reglas.some((r) => r.selector === ".f33-modulo" && r.declarado1440.length === 1) },
  "--f33h-*": { consume: "piel de TITULAR del módulo de texto", derivada: false },
  "--f33blurb-*": { consume: "piel del titular de BLURB", derivada: false },
};
const familiasSinDerivar = Object.entries(familias)
  .filter(([, v]) => !v.derivada)
  .map(([k, v]) => ({
    familia: k,
    consume: v.consume,
    haceFalta:
      k === "--f33h-*" || k === "--f33blurb-*"
        ? "una sonda de TIPOGRAFÍA sobre el mismo corpus (el equivalente de `qa:kb-tipografia`): esta mide caja y ritmo, no `font-size`/`line-height`/`color`"
        : "nada: sale derivada arriba",
  }));

/* ══════════════════════════════════════════════════════════════════════════
 * 9 · LOS CONTROLES QUE CIERRAN EL CÓDIGO DE SALIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const nModulos = TODOS.filter((n) => n.nivel === "modulo").length;
const nTipos = new Set(TODOS.filter((n) => n.nivel === "modulo").map((n) => n.tipo)).size;

/**
 * ⚠⚠ **LAS SEPARADORAS DEL DISCRIMINADOR — el número sin el cual este verde no
 * dice nada** (§*un verde vale lo que valen sus instancias separadoras*).
 *
 * Si NINGÚN nodo tuviera declaración ganadora del editor, «con ordinal» y «sin
 * ordinal» predecirían exactamente lo mismo en todo el dominio: el discriminador
 * no se habría ejercitado y el default saldría igual con él y sin él. El
 * cardinal de nodos con al menos un override es lo que separa *«el
 * discriminador funciona»* de *«aquí no hay nada que discriminar»*.
 */
let separadoras = 0;
const overridePorProp = {};
for (const n of VIVOS) {
  let tiene = false;
  for (const [prop, g] of Object.entries(n.casc?.gana ?? {}))
    if (g.editor) {
      tiene = true;
      overridePorProp[prop] = (overridePorProp[prop] ?? 0) + 1;
    }
  if (tiene) separadoras++;
}

/**
 * ⚠⚠ **EL CONTROL QUE CAZÓ EL DEFECTO DEL DISCRIMINADOR — y por eso se queda.**
 *
 * La clasificación la decide **el SELECTOR**; la **HOJA** es una señal
 * independiente sobre el mismo objeto. Un default que la sonda dé por PLANTILLA
 * y que venga del `<style>` de UNA página es la firma exacta del fallo que esta
 * sonda ya tuvo: una regla de una página entrando en la hoja de las 31.
 *
 * No es un error por sí solo —Divi compila **también** sus reglas genéricas ahí
 * (`gutters`, la retícula)—, así que no cierra el código de salida: se **publica
 * la lista de selectores distintos** para que sea auditable de un vistazo. La
 * diferencia entre esto y no mirar es que un cero aquí es un cero *medido*.
 */
const hojaDePagina = (h) => /\.html$/.test(nombreHoja(h));
const plantillaDesdeHojaDePagina = new Map();
for (const n of VIVOS)
  for (const [prop, g] of Object.entries(n.casc?.gana ?? {}))
    if (!g.editor && hojaDePagina(g.hoja)) {
      const k = `${g.sel.slice(0, 90)} { ${prop} }`;
      plantillaDesdeHojaDePagina.set(k, (plantillaDesdeHojaDePagina.get(k) ?? 0) + 1);
    }

const muertos = censo.muertos();

/* ══════════════════════════════════════════════════════════════════════════ */
const salida = {
  meta: {
    sonda: "f33-clases",
    fecha: hoy(),
    que: "la REGLA que el original sirve para cada clase `f33-*`, derivada de los nodos cuya declaración GANADORA no viene del editor",
    lado: "UNO — el original capturado con sus hojas. NO compara con el clon: eso es `qa:f33-cmp`",
    anchos: [1440, 390],
    sabotaje: SABOTAJE,
    metodo:
      "el discriminador es la CASCADA (CSS.getMatchedStylesForNode): un selector con ordinal `et_pb_<tipo>_<n>` (sin `_tb_`) es el editor; " +
      "uno genérico es la plantilla. default = valor computado en los nodos que llegan a la plantilla. Dos valores ⇒ no hay default.",
    noEsUnaVerificacion:
      "esto es la ENTRADA de la escritura de `f33.css`. La aceptación es `qa:f33-cmp`, que mide el clon renderizado par a par — verificar el CSS contra el CSS sería comprobar contra la fuente que uno supone responsable.",
    dominio: {
      membresia: "medidas/f33-rutas.json (94.ª, congelada y commiteada)",
      rutasDeclaradas: F33.length,
      medidas: DOMINIO.length,
      minimo: MINIMO,
    },
    noContesta: [
      "NADA del clon: un solo lado. `qa:f33-cmp` sigue a 0 ejes comparados en las 31",
      `la TIPOGRAFÍA: 2 de las 5 familias de variables (--f33h-* y --f33blurb-*) salen SIN DERIVAR — esta sonda mide caja y ritmo`,
      `los ${SIN_CAJA.length} nodos SIN CAJA: getComputedStyle no resuelve los % sin caja y devolvería ceros que entrarían como dato`,
      "el ancho INTERMEDIO: se miden 1440 y 390, que es donde el contrato es de FIDELIDAD",
      "si la hoja escrita FUNCIONA: eso sólo lo cierra una comparación de dos lados",
    ],
  },
  controles: {
    modulos: nModulos,
    modulosCruzadoConF33Spec: 313,
    tipos: nTipos,
    tiposCruzadoConF33Spec: 11,
    nodosTotales: TODOS.length,
    nodosVivos: VIVOS.length,
    nodosSinCaja: SIN_CAJA.length,
    sinCajaPorTipo,
    /** §regla 22: el veredicto se cierra con el CARDINAL, no con un booleano. */
    separadorasDelDiscriminador: separadoras,
    overridesDelEditorPorPropiedad: overridePorProp,
    /** Señal INDEPENDIENTE sobre la clasificación: ver §el control que la cazó. */
    plantillaDesdeHojaDePagina: {
      n: [...plantillaDesdeHojaDePagina.values()].reduce((a, b) => a + b, 0),
      selectores: Object.fromEntries([...plantillaDesdeHojaDePagina].sort((a, b) => b[1] - a[1]).slice(0, 20)),
    },
    selectoresMuertos: muertos,
    hojas: {
      paginasConCero: hojasCero.length,
      rutas: hojasCero.slice(0, 5),
      /** Ver §la guarda que habría cazado la recarga. */
      desparejadasEntreAnchos: hojasDesparejadas.length,
      detalle: hojasDesparejadas.slice(0, 5),
    },
  },
  anchoPorReparto,
  familiasSinDerivar,
  sinDerivar,
  reglas,
  problemas,
};

/* ══════════════════════════════════════════════════════════════════════════ */
console.log(`\n═══ CLASES \`f33-*\` DERIVADAS · ${TODOS.length} nodos (${VIVOS.length} con caja) en ${DOMINIO.length} páginas ═══\n`);
for (const r of reglas) {
  const v = (r.declarado1440 ?? []).join(" | ");
  const v2 = (r.declarado390 ?? []).join(" | ");
  console.log(
    `  ${String(r.selector).padEnd(34)} ${String(r.prop).padEnd(16)} n=${String(r.n).padStart(3)}/${String(r.deCuantos).padStart(3)}` +
      ` ed=${String(r.delEditor ?? 0).padStart(3)}  @1440 ${String(v).slice(0, 46)}`,
  );
  if (v2 && v2 !== v) console.log(`  ${" ".padEnd(34)} ${" ".padEnd(16)}${" ".padEnd(15)}  @390  ${String(v2).slice(0, 46)}`);
  for (const g of (r.regla1440 ?? []).slice(0, 2))
    console.log(`  ${" ".padEnd(34)}    ← [${g.hoja}] ${g.selector.slice(0, 74)} ${JSON.stringify(g.valor)}`);
  if (r.separa)
    console.log(
      `  ${" ".padEnd(34)}    ⇢ SEPARAN 1:1 (${r.separa.nCandidatos}): ` +
        r.separa.candidatos.map((c) => c.eje).join(" · ").slice(0, 110),
    );
}

console.log(`\n  ANCHO por reparto (razón cruda contra la fila propia · la cuantización la adjudica qa:f33-cmp):`);
for (const [rep, e] of Object.entries(anchoPorReparto))
  console.log(
    `    ${rep.padEnd(5)} n=${String(e.n).padStart(3)}  @1440 ${JSON.stringify(e.pct1440)}   @390 ${JSON.stringify(e.pct390)}`,
  );

console.log(`\n  CONTROLES`);
console.log(`    módulos ${nModulos} (f33-spec: 313) · tipos ${nTipos} (f33-spec: 11)`);
console.log(`    nodos sin caja EXCLUIDOS del análisis: ${SIN_CAJA.length} — ${JSON.stringify(sinCajaPorTipo)}`);
console.log(`    separadoras del discriminador (nodos con override GANADOR del editor): ${separadoras}`);
console.log(`    overrides por propiedad: ${JSON.stringify(overridePorProp)}`);

if (sinDerivar.length) {
  console.log(`\n  ⚠ ${sinDerivar.length} propiedad(es) SIN DERIVAR — nombradas con lo que haría falta (CORTE LIMPIO 1):`);
  for (const s of sinDerivar)
    console.log(`    · ${s.selector} { ${s.prop} } n=${s.n} — ${JSON.stringify(s.valores)}\n        hace falta: ${s.haceFalta}`);
}

if (familiasSinDerivar.length) {
  console.log(`\n  ⚠ ${familiasSinDerivar.length} familia(s) de variables SIN DERIVAR, con lo que haría falta:`);
  for (const f of familiasSinDerivar) console.log(`    · ${f.familia.padEnd(14)} ${f.consume} — ${f.haceFalta}`);
}

if (problemas.length) {
  console.log(`\n  ⚠ ${problemas.length} propiedad(es) SIN default derivable:`);
  for (const p of problemas) console.log(`    · ${p.selector} { ${p.prop} } — ${p.por}`);
  console.log(`\n    No se escribe «el valor de la mayoría»: eso es exactamente el arreglo falso.\n`);
}

w("medidas/f33-clases.json", salida);

/* ── Las guardas que cierran el código de salida ──────────────────────────── */
let mal = 0;
if (muertos.length) {
  console.log(`\n❌ ${muertos.length} SELECTOR(ES) MUERTO(S): ${muertos.join(" · ")} — un selector que no casa NO es un cero (§sondas 4)`);
  mal++;
}
if (hojasCero.length) {
  console.log(
    `\n❌ ${hojasCero.length} página(s) con CERO hojas resueltas: la geometría de esta corrida es FICCIÓN PLAUSIBLE.\n` +
      `   Sin CSS una captura no falla — MIDE OTRA COSA (§F3-1-CSS-NO-CAPTURADO: columna.width 678.52 contra 430.80 en vivo).`,
  );
  mal++;
}
if (hojasDesparejadas.length) {
  console.log(
    `\n❌ ${hojasDesparejadas.length} página(s) con DISTINTO nº de hojas aplicadas a 1440 y a 390:\n` +
      `   ${hojasDesparejadas.slice(0, 3).map((h) => `${h.ruta} 1440:${h[1440]} 390:${h[390]}`).join("\n   ")}\n` +
      `   Las hojas se cayeron ENTRE cargar y medir. La medida del ancho afectado no es del original:\n` +
      `   es plausible y falsa (medido: fila 249.594 sin las enlazadas contra 335.391 con ellas).`,
  );
  mal++;
}
if (nModulos !== 313 || nTipos !== 11) {
  console.log(
    `\n❌ CRUCE ROTO con \`f33-spec\`: ${nModulos} módulos y ${nTipos} tipos contra 313 y 11.\n` +
      `   Dos instrumentos en desacuerdo sobre el mismo objeto se resuelven ANTES de leer ningún número (§sondas 4).`,
  );
  mal++;
}
if (separadoras === 0) {
  console.log(
    `\n❌ CERO SEPARADORAS del discriminador: ningún nodo tiene declaración ganadora del editor, así que\n` +
      `   «con ordinal» y «sin ordinal» predicen lo mismo en todo el dominio. El default de arriba NO está\n` +
      `   elegido: está escrito (§*un modelo se elige por lo que lo SEPARA, no por lo que acierta*).`,
  );
  mal++;
}

console.log(
  `\n✓ evaluadas ${DOMINIO.length}/${MINIMO} rutas · nodos ${VIVOS.length} con caja de ${TODOS.length} · separadoras ${separadoras}\n`,
);
process.exit(ev.informe() === 0 && problemas.length === 0 && mal === 0 ? 0 : 2);
