/**
 * EL CSS QUE DIVI COMPILÓ — una sola definición, consumida por dos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ ES ESTO Y POR QUÉ ES UN FICHERO APARTE
 *
 * Divi **no escribe los ajustes del editor en el marcado**: los compila a CSS
 * con una clase por módulo (`.et_pb_text_3 h2 { font-size:44px }`) y los sirve
 * en el mismo documento. O sea que **el CSS servido ES el dato del editor**, y
 * leerlo bien es una operación con reglas propias (contexto de `@media`, listas
 * de selectores, la capa `_tb_` del theme-builder).
 *
 * Lo consumen dos: `qa:pieles` —que lo censa en las 573 páginas del corpus— y
 * `cms:extractor-kb` —que lo usa como **segundo testigo** de lo que deriva del
 * estilo computado—. Dos copias de este parser serían la clase C7 con la peor
 * salida posible: la sonda diciendo *«hay 82 overrides»* y el extractor
 * escribiendo otros, **los dos verdes en su propio marco**.
 * ═════════════════════════════════════════════════════════════════════════ */

/* ── El CSS servido, y por qué se lee SÓLO de `<style>` ───────────────────── */
/**
 * §sondas 4, tercera cara: *«el markup se busca sobre el HTML SIN `<style>` ni
 * `<script>`, porque ahí viven los selectores que se hacen pasar por marcado»*.
 * Aquí la pregunta es **la contraria** —se busca CSS—, así que se lee sólo el
 * interior de los `<style>`. Un `.et_pb_text_3 h2` en el cuerpo del artículo no
 * es una regla: es texto.
 */
export const cssDe = (html) =>
  [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");

/** Las hojas EXTERNAS que el documento pide (§F3-1-CSS-NO-CAPTURADO: 0 capturadas). */
export const hojasExternas = (html) =>
  [...html.matchAll(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi)].length;

/**
 * Recorre el CSS emitiendo `{ media, selector, declaraciones }` por regla,
 * llevando la pila de at-rules.
 *
 * No es un parser de CSS completo y **no hace falta que lo sea**: lo único que
 * no puede perder es el contexto de `@media`, que es donde Divi escribe los
 * valores de las pestañas de tableta y móvil del builder. Perderlo convertiría
 * `font-size:35px @767` en un override de escritorio — un número plausible y
 * falso, que es la forma en que este proyecto se equivoca (§sondas 4).
 */
export function* reglas(css) {
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const pila = [];
  let i = 0;
  let buf = "";
  while (i < limpio.length) {
    const c = limpio[i];
    if (c === "{") {
      const cabeza = buf.trim();
      buf = "";
      if (cabeza.startsWith("@")) {
        pila.push(cabeza);
        i++;
        continue;
      }
      let prof = 1;
      let cuerpo = "";
      i++;
      while (i < limpio.length && prof > 0) {
        if (limpio[i] === "{") prof++;
        else if (limpio[i] === "}") {
          prof--;
          if (prof === 0) break;
        }
        cuerpo += limpio[i];
        i++;
      }
      i++;
      yield {
        media: pila.filter((p) => p.startsWith("@media")).join(" AND "),
        selector: cabeza,
        declaraciones: cuerpo.trim(),
      };
      continue;
    }
    if (c === "}") {
      pila.pop();
      buf = "";
      i++;
      continue;
    }
    buf += c;
    i++;
  }
}

/** `.et_pb_text_18 h2` → `{ tipo:"text", n:18, capa:"propia", objetivo:"h2" }` */
const RE_MODULO = /\.et_pb_([a-z][a-z_]*?)_(\d+)(_tb_(?:header|body|footer))?(?=[\s.,:>#[]|$)/;

/**
 * Analiza UN selector. `null` si no nombra un módulo de Divi.
 *
 * ⚠ **La CAPA se lee del propio selector y no es cosmética.**
 * `.et_pb_text_0_tb_body` es un módulo de la plantilla de theme-builder y
 * `.et_pb_text_18` uno propio de la instancia — el híbrido de `CLAUDE.md`
 * §régimen. Mezclarlas daría *«el mecanismo existe en las 309 páginas»*, que es
 * verdad **de la plantilla** y falso **del editor**, y de ahí saldría un campo
 * donde hay una decisión de quien construyó la plantilla.
 */
export function analizaSelector(selector) {
  const sel = selector.trim();
  const m = RE_MODULO.exec(sel);
  if (!m) return null;
  const [, tipo, n, tb] = m;
  const resto = sel.slice(m.index + m[0].length).trim();
  const objetivo = resto.replace(/^\.[A-Za-z0-9_-]+/, "").trim();
  return {
    tipo,
    n: Number(n),
    capa: tb ? "plantilla" : "propia",
    zona: tb ? tb.replace("_tb_", "") : "cuerpo",
    objetivo: objetivo || "modulo",
  };
}

/** Declaraciones normalizadas y ordenadas: la IDENTIDAD de una piel. */
export function declara(txt) {
  return txt
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(":");
      return `${d.slice(0, i).trim().toLowerCase()}:${d.slice(i + 1).trim()}`;
    })
    .sort()
    .join("; ");
}

/** Las propiedades TIPOGRÁFICAS: lo que separa la piel del ritmo y de la caja. */
export const TIPOGRAFICAS = new Set([
  "font-size",
  "line-height",
  "font-weight",
  "color",
  "font-family",
  "font-style",
  "letter-spacing",
  "text-transform",
  "text-align",
  "text-decoration",
  "text-shadow",
]);

/** Sólo lo tipográfico de un bloque de declaraciones ya normalizado. */
export const soloTipo = (decl) =>
  decl
    .split(";")
    .map((d) => d.trim())
    .filter((d) => TIPOGRAFICAS.has(d.slice(0, d.indexOf(":")).trim()))
    .join("; ");

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ QUÉ CUENTA COMO «TITULAR» — y la primera versión tenía un CERO que
 * significaba «no miré» (corregido 2026-08-10, en la misma tanda)
 *
 * `ES_TITULAR` era `/^h[1-6]$/`, y con eso la sonda informó **«los overrides
 * viven en módulos `text` (1299) y `toggle` (10)»** — o sea **0 en `blurb`**.
 * Pero `modulos.spec.md` §2 tenía medido que el titular del blurb tiene **TRES
 * pieles** (`18/21.6 w700` ×24 · `18/21.6 w300` ×9 · `18/18 w600` ×3). Las dos
 * cosas no podían ser verdad.
 *
 * Lo son las dos, y la que fallaba era el selector: **Divi no apunta la piel del
 * blurb a `h4`, la apunta a `.et_pb_module_header`** —el envoltorio con el que
 * escribe el titular de blurb, toggle y compañía—, porque el NIVEL es otro
 * ajuste distinto y la piel tiene que valer para los seis.
 *
 *   > Es §sondas 4 en su forma pura: *un selector que no casa con nada devuelve
 *   > lo mismo que una propiedad que no existe*. El informe decía «0 en blurb» y
 *   > había **216 reglas de blurb en una sola página**.
 *
 * Lo delató **contradecir una medida buena anterior**, que es el control que no
 * siempre se tiene (§sondas 4, tercera cara). Por eso el conjunto se **deriva**
 * —censando los objetivos que aparecen— y no se escribe de memoria.
 *
 * `.et_pb_module_header a` se excluye a propósito: Divi emite la MISMA
 * declaración para el envoltorio y para el enlace de dentro, así que contarla
 * duplicaría cada piel de blurb.
 * ═════════════════════════════════════════════════════════════════════════ */

/** El envoltorio con el que Divi escribe el titular de blurb/toggle. */
export const ENVOLTORIO_TITULAR = ".et_pb_module_header";

/** ¿Este objetivo de selector es un titular? `h1`…`h6` o el envoltorio de Divi. */
export const esTitular = (objetivo) => /^h[1-6]$/.test(objetivo) || objetivo === ENVOLTORIO_TITULAR;

/** @deprecated Se conserva para el `h[1-6]` puro; usa `esTitular`. */
export const ES_TITULAR = /^h[1-6]$/;

/** `@media only screen and (max-width:767px)` → `767`; `""` → `null` (base). */
export const anchoDeMedia = (media) => {
  const m = /max-width:\s*(\d+)px/.exec(media || "");
  return m ? Number(m[1]) : null;
};

/**
 * Las pieles de titular por MÓDULO de una página, en capa propia:
 * `{ "text_3": { h2: { base: {...}, 980: {...}, 767: {...} } } }`.
 *
 * Es la vista que necesita quien quiere preguntar *«¿qué escribió el editor en
 * ESTE módulo?»*, que es justo lo que el extractor cruza contra el estilo
 * computado.
 */
export function pielesPorModulo(html) {
  const out = {};
  for (const { media, selector, declaraciones } of reglas(cssDe(html))) {
    const tipo = soloTipo(declara(declaraciones));
    if (!tipo) continue;
    for (const sel of selector.split(",")) {
      const a = analizaSelector(sel);
      if (!a || a.capa !== "propia" || !esTitular(a.objetivo)) continue;
      const clave = `${a.tipo}_${a.n}`;
      const bp = anchoDeMedia(media) ?? "base";
      ((out[clave] ??= {})[a.objetivo] ??= {})[bp] = Object.fromEntries(
        tipo.split(";").map((d) => {
          const i = d.indexOf(":");
          return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
        }),
      );
    }
  }
  return out;
}
