/**
 * LAS PIELES DE LISTADO CONTRA EL CANAL QUE ACABA DE APARECER — ¿qué afirmaban
 * las specs sobre un canal que no se leía, y qué dice ese canal ahora?
 * Uso: npm run qa:lh-pieles-css        (offline: corpus + corpus/css)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ, Y POR QUÉ ANTES DE CONSTRUIR
 *
 * Las specs de listados se escribieron con `et-core-unified-*` **a cero en las
 * 9 formas** — nadie había capturado ese canal—. Hoy hay **52 hojas**. Así que
 * toca la comprobación retroactiva, **en las dos direcciones** que `CLAUDE.md`
 * exige, porque preguntar sólo una sesga qué se encuentra:
 *
 *   (a) **¿alguna afirmación se apoya en un CERO de ese canal?** Un «aquí no hay
 *       override» derivado cuando el canal no se leía es **SIN PROBAR**, no
 *       falso — y sin probar **no se cablea**;
 *   (b) **¿la evidencia nueva está SOBRE-GENERALIZADA?** ¿Se atribuye a la
 *       plantilla algo que las hojas dicen que es de una forma concreta?
 *
 * Es literalmente el escalón de F3-1: allí el `h2` de KB tenía *«tres pieles sin
 * discriminador servido»* y **el discriminador estaba en el canal que la sonda
 * no miraba** (§El principio — *la salida servida incluye el CSS que el
 * documento se trae*).
 *
 * ── Lo que las specs ya dejaron escrito, y que esto viene a exhibir ───────
 * No hay que adivinar qué auditar: las propias specs **nombraron el hueco**.
 *
 * | dónde | qué dice hoy |
 * |---|---|
 * | `components/README.md` §3 | *«en `L4` la regla está exhibida; **la de `L1` vive en et-cache externo — se replica de la medida**»* |
 * | `listado-tema-tax.spec.md` **SP-T7** | *«queda **sin exhibir la regla de la hoja externa** — la piel se replica de la medida»* |
 * | `hub-builder.spec.md` **SP-H6** | *«si hubiera algún override móvil, ahí estaría el +29»* — hipótesis sin canal para contestarla |
 *
 * **Replicar un número medido sin su regla no es un defecto** —es lo honesto
 * cuando no se puede ver el mecanismo— pero deja la piel **SIN PROBAR**, y una
 * piel sin probar es exactamente lo que no se debe cablear en una plantilla que
 * va a servir 23 instancias.
 *
 * ── El instrumento: el parser que ya existe ───────────────────────────────
 * `reglas()` de `css-compilado.mjs`, que lleva la pila de `@media` — perderla
 * convertiría un override móvil en uno de escritorio, *un número plausible y
 * falso*. Dos parsers serían la clase C7.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · si a una forma le falta **una sola** hoja enlazada, se dice y esa forma
 *     **no puede concluir nada**: es el mismo cero que veníamos a cerrar;
 * 2 · CONTROL: reglas que TIENEN que aparecer (`.et_pb_section`…). Sin control,
 *     «0 overrides» y «no sé leer» son la misma salida (§sondas 8a);
 * 3 · `Evaluadas` con mínimo derivado del nº de páginas del espejo.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cssDe, reglas } from "./css-compilado.mjs";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS_DIR = join(RAIZ, "corpus/css");

const SABOTAJES = ["sin-hojas", "lector-ciego"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

/* ── El universo: el MISMO que el comparador, derivado del espejo ─────────── */
const ESPEJO = JSON.parse(readFileSync(join(QA, "medidas/lh-spec-1440.json"), "utf8"));
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

const PAGINAS = Object.keys(ESPEJO.paginas ?? {})
  .map((clave) => {
    const i = clave.indexOf("::");
    const forma = clave.slice(0, i);
    const ruta = clave.slice(i + 2);
    const entrada = INDICE.paginas[`listados:${ruta}`] ?? Object.values(INDICE.paginas).find((p) => p.url?.endsWith(ruta));
    return { clave, forma, ruta, fichero: entrada?.fichero ?? null };
  })
  .filter((p) => p.fichero);

if (!PAGINAS.length) throw new Error("0 páginas cruzadas entre el espejo y el corpus: sin universo no hay auditoría (regla del cero).");

/* ── El CSS que cada documento se trae ────────────────────────────────────── */
const RE_LINK = /<link\b[^>]*>/gi;
const hojaDe = (tag) => {
  if (!/stylesheet/i.test(tag) && !/\.css/i.test(tag)) return null;
  const m = tag.match(/href=["']([^"']+)["']/i);
  return m ? m[1] : null;
};
const rutaLocalDe = (u) => u.replace(/^https?:\/\/[^/]+\//, "").replace(/[?#].*$/, "");

/** ¿El selector apunta al titular de la página (no al de una tarjeta)? */
const ES_TITULAR_PAGINA = /(^|[\s,>+~])(h1|\.entry-title|\.main-title)\b/i;
const TIPO = ["font-size", "line-height", "font-weight", "color", "letter-spacing"];

/**
 * ⚠ **DIVI SIRVE EL CSS DE MÓDULOS QUE ESTA PÁGINA NO USA**, y contarlo es
 * §sondas 4 en su tercera cara: *un detector que encuentra MÁS de lo que hay no
 * da error, da un número plausible de más*.
 *
 * Lo cazó el propio negativo de esta sonda, y con un caso de manual: en `L3-sci`
 * aparecía `.banner-home .et_pb_text_0 h1 {font-size:1.5vw}` — o sea **el banner
 * de la HOME**, servido en todas las páginas y sin `.banner-home` en ninguna de
 * éstas. Leído sin filtrar, «L3 tiene una regla de módulo para su titular»:
 * plausible, y falso.
 *
 * El arreglo no es nuevo — **`hover-zonal` ya lo tenía escrito** y aquí se
 * aplica igual: una regla cuyas clases NO están en el marcado de la página no es
 * de esta página. El marcado se lee **sin `<style>` ni `<script>`**, porque ahí
 * viven los selectores que se hacen pasar por marcado.
 */
const marcadoDe = (html) => html.replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<script\b[\s\S]*?<\/script>/gi, "");
const clasesDe = (sel) => [...sel.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
/** ¿Alguna rama del selector puede aplicar a este marcado? */
const aplicaA = (selector, marcado) =>
  selector.split(",").some((rama) => clasesDe(rama).every((c) => new RegExp(`class="[^"]*\\b${c}\\b`).test(marcado)));

const salida = { meta: { fecha: hoy(), que: "las pieles de titular de listado contra el CSS SERVIDO (en línea + hojas capturadas)", canal: "corpus/css" }, paginas: {} };
const ev = new Evaluadas({ nombre: "lh-pieles-css", unidad: "páginas auditadas", minimo: PAGINAS.length });

let sinCanal = 0;
let conRegla = 0;
const controlTotal = { ".et_pb_section": 0, ".et_pb_row": 0 };

console.log(`\n════════ PIELES DE LISTADO · el canal que faltaba ════════\n`);

for (const P of PAGINAS) {
  const html = readFileSync(join(CORPUS, P.fichero), "utf8");
  const enLinea = SABOTAJE === "lector-ciego" ? "" : cssDe(html);

  const enlazadas = [...new Set([...html.matchAll(RE_LINK)].map((m) => hojaDe(m[0])).filter(Boolean).map(rutaLocalDe))];
  const faltan = [];
  const trozos = [enLinea];
  for (const local of enlazadas) {
    const f = join(CSS_DIR, local);
    if (!existsSync(f) || SABOTAJE === "sin-hojas") {
      faltan.push(local);
      continue;
    }
    trozos.push(SABOTAJE === "lector-ciego" ? "" : readFileSync(f, "utf8"));
  }
  const css = trozos.join("\n");

  /* Las reglas que pintan el titular de la página, con su @media. */
  const marcado = marcadoDe(html);
  const pieles = [];
  let descartadasPorNoAplicar = 0;
  for (const r of reglas(css)) {
    for (const c of Object.keys(controlTotal)) if (r.selector.includes(c)) controlTotal[c]++;
    if (!ES_TITULAR_PAGINA.test(r.selector)) continue;
    const decl = r.declaraciones.toLowerCase();
    if (!TIPO.some((t) => new RegExp(`(^|;|\\s)${t}\\s*:`).test(decl))) continue;
    /* El filtro que evita el sobre-casado, con su recuento: descartar en
     * silencio y no descartar dan informes distintos, y ninguno es el correcto. */
    if (!aplicaA(r.selector, marcado)) {
      descartadasPorNoAplicar++;
      continue;
    }
    pieles.push({
      media: r.media || "base",
      selector: r.selector.replace(/\s+/g, " ").trim().slice(0, 140),
      declaraciones: r.declaraciones.replace(/\s+/g, " ").trim().slice(0, 160),
    });
  }

  const movil = pieles.filter((p) => p.media !== "base");
  if (faltan.length) sinCanal++;
  if (pieles.length) conRegla++;
  ev.ok(1);

  salida.paginas[P.clave] = {
    ruta: P.ruta,
    fichero: P.fichero,
    hojasEnlazadas: enlazadas.length,
    hojasCapturadas: enlazadas.length - faltan.length,
    faltan,
    bytesCss: css.length,
    descartadasPorNoAplicar,
    pieles,
    conOverrideMovil: movil.length,
  };

  console.log(
    `  ${faltan.length ? "⛔" : pieles.length ? "✓" : "·"} ${P.forma.padEnd(22)} hojas ${String(enlazadas.length - faltan.length).padStart(2)}/${String(enlazadas.length).padEnd(2)}` +
      `  reglas de titular ${String(pieles.length).padStart(3)}  (móvil ${String(movil.length).padStart(2)} · descartadas ${String(descartadasPorNoAplicar).padStart(2)})` +
      (faltan.length ? `   ⛔ FALTAN ${faltan.length}` : ""),
  );
}

/* ── Lo que las specs declararon SIN EXHIBIR, ahora con su regla ──────────── */
console.log(`\n  ── las reglas de titular por forma (lo que las specs no podían exhibir) ──`);
const porForma = {};
for (const [clave, v] of Object.entries(salida.paginas)) {
  const forma = clave.slice(0, clave.indexOf("::"));
  (porForma[forma] ??= []).push(...v.pieles);
}
for (const [forma, ps] of Object.entries(porForma)) {
  const unicas = [...new Map(ps.map((p) => [`${p.media}|${p.selector}|${p.declaraciones}`, p])).values()];
  console.log(`\n  ${forma}  (${unicas.length} reglas distintas)`);
  for (const p of unicas.slice(0, 6)) console.log(`     [${p.media}] ${p.selector}\n        ${p.declaraciones}`);
  if (unicas.length > 6) console.log(`     … y ${unicas.length - 6} más (todas en la congelada)`);
}
salida.porForma = Object.fromEntries(
  Object.entries(porForma).map(([f, ps]) => [f, [...new Map(ps.map((p) => [`${p.media}|${p.selector}|${p.declaraciones}`, p])).values()]]),
);

salida.resumen = { paginas: PAGINAS.length, sinCanalCompleto: sinCanal, conReglaDeTitular: conRegla, control: controlTotal };

console.log(`\n  ── recuento ──`);
console.log(`  páginas auditadas        ${PAGINAS.length}`);
console.log(`  con el canal INCOMPLETO  ${sinCanal}`);
console.log(`  con regla de titular     ${conRegla}`);
console.log(`  CONTROL                  ${Object.entries(controlTotal).map(([k, v]) => `${k} ${v}`).join(" · ")}`);

w("medidas/lh-pieles-css.json", salida);

const controlMudo = Object.values(controlTotal).some((v) => !v);
let codigo = 0;
if (controlMudo) {
  console.log(`\n⛔ CONTROL MUDO — el lector de CSS no encuentra ni \`.et_pb_section\`. Nada de lo de arriba vale.`);
  codigo = 2;
} else if (sinCanal) {
  console.log(`\n⛔ ${sinCanal} páginas con hojas SIN CAPTURAR: en ésas el canal sigue incompleto y no se puede concluir.`);
  codigo = 2;
} else {
  console.log(
    `\n✅ ${PAGINAS.length} páginas con su canal COMPLETO (en línea + enlazadas).\n` +
      `   Las reglas de titular quedan EXHIBIDAS: lo que las specs replicaban de la medida\n` +
      `   ahora tiene su mecanismo servido delante.`,
  );
}
process.exit(codigo);
