/**
 * CPT `solutions` — **¿existe `seo.title`, y es un campo o es derivable?**
 *
 * Uso: node scripts/qa/solutions-seo.mjs        (SOLO=<trozo de url> para acotar)
 *
 * ── Por qué existe esta sonda ─────────────────────────────────────────────
 * §2e escribió *«`seo`: grupo, como en las demás»* y el traductor lo puso
 * **`required`**. El sondeo de frontera midió lo que eso significa hoy:
 * **`productos.seo.title` es `required` y no tiene dato en 9 de 9** — ni en
 * `src/lib/products.ts` (que es la proyección de PESTAÑA, no la ficha) ni en
 * `medidas/solutions-campos.json`, que inventarió módulos y no cabecera.
 *
 * O sea que el esquema **afirma** algo que ninguna medida respalda. Las salidas
 * honestas son dos y esta sonda es la que decide cuál:
 *
 *   · **existe en el original en las N** ⇒ `required` está respaldado, y además
 *     aquí queda el DATO con el que sembrarlo;
 *   · **falta en alguna** ⇒ `required` cae, porque un `required` sin respaldo
 *     convierte «no lo medí» en «el sitio siempre lo tiene».
 *
 * Lo que **no** vale es un `?? ""`: eso no arregla el hueco, lo tapa — y encima
 * en el sitio donde todavía se sabía que faltaba (regla 6).
 *
 * ── Y la segunda pregunta, que es la que decide si es CAMPO ───────────────
 * Que el `<title>` exista no lo hace un campo. Si fuera **derivable** del `h1`
 * con una plantilla fija (`"<h1> | Kunak"`), sería **plantilla** y el modelo no
 * tendría que guardarlo. Así que se mide también **la relación entre el título
 * de la cabecera y el `h1`**, y el veredicto se apoya en la varianza:
 * *lo que varía de una instancia a otra lo escribió una persona.*
 */
import { Censo, Evaluadas, env, hoy, launch, openPage, w } from "./lib.mjs";

/* Sólo abre el original: un `build` del clon no puede contaminar esta corrida. */
process.env.SIN_CLON = "1";

const SOLO = env("SOLO");

/* ══════════════════════════════════════════════════════════════════════════
 * LOS SABOTAJES — `npm run qa:solutions-seo-neg`
 *
 * Los tres invariantes que esta sonda tiene que saber disparar por separado, y
 * los tres son de la familia *«no encontrar nada y no mirar nada dan la misma
 * salida»*:
 *
 *   · `muerto`     — un selector que no casa en NINGUNA página sale por ERROR y
 *                    no por «este campo no está» (regla 4). Aquí es literal: si
 *                    el selector del `h1` fallara, «no contiene el h1» saldría
 *                    en las 24 y el veredicto diría **CAMPO** sin haber medido;
 *   · `derivable`  — el `<title>` se fabrica del `h1` con plantilla única ⇒ el
 *                    veredicto tiene que voltear a **PLANTILLA**. Sin este, un
 *                    «NO derivable» no se distingue de una sonda que siempre
 *                    dice lo mismo;
 *   · `sin-urls`   — 0 URLs del sitemap ⇒ exit 2, nunca un verde vacío.
 * ═════════════════════════════════════════════════════════════════════════ */
const SABOTAJE = env("SABOTAJE") || null;
const SABOTAJES = ["muerto", "derivable", "sin-urls"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);

/** El selector del `h1`. Es variable para que `muerto` pueda romperlo. */
const SEL_H1 = SABOTAJE === "muerto" ? "h1.no-existe-en-ninguna-pagina" : "h1";

/* El alcance sale del SITEMAP del CPT, igual que `solutions-campos`: una página
 * nueva entra sola y sube el listón sin tocar la sonda. */
const sitemap = await (await fetch("https://kunakair.com/solutions-sitemap.xml")).text();
const URLS = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => u.includes("/es/"))
  .sort()
  .filter((u) => !SOLO || u.includes(SOLO))
  .filter(() => SABOTAJE !== "sin-urls");
if (URLS.length === 0) {
  console.error(`❌ 0 URLs del CPT solutions en /es — el sitemap no dio nada, no es una corrida limpia.`);
  process.exit(2);
}

const ev = new Evaluadas({ nombre: "solutions-seo", unidad: "URLs del CPT", minimo: URLS.length, porPaginas: true });
const censo = new Censo();
const { browser } = await launch();

const filas = [];
for (const url of URLS) {
  const { page, status } = await openPage(browser, url, { width: 1440, height: 900 });
  if (status >= 400) { ev.fallo(url, `HTTP ${status}`); await page.close(); continue; }
  const { datos } = await censo.medir(
    page,
    (selH1) => {
      const meta = (sel, attr = "content") => __q(sel)?.getAttribute(attr) ?? null;
      return {
        title: document.title || null,
        ogTitle: meta('meta[property="og:title"]'),
        description: meta('meta[name="description"]'),
        ogDescription: meta('meta[property="og:description"]'),
        ogImage: meta('meta[property="og:image"]'),
        canonical: meta('link[rel="canonical"]', "href"),
        h1: __q(selH1)?.textContent?.trim() ?? null,
      };
    },
    SEL_H1,
  );
  /* El sabotaje `derivable` fabrica el título del `h1` con plantilla ÚNICA: es
   * el mundo en el que `seo.title` sería PLANTILLA y no campo. */
  if (SABOTAJE === "derivable" && datos.h1) datos.title = `${datos.h1} | Kunak`;
  filas.push({ url, ...datos });
  await page.close();
}
await browser.close();

/* ══════════════════════════════════════════════════════════════════════════
 * LECTURA
 * ═════════════════════════════════════════════════════════════════════════ */
const CAMPOS = ["title", "ogTitle", "description", "ogDescription", "ogImage", "canonical"];
const presencia = Object.fromEntries(CAMPOS.map((c) => [c, filas.filter((f) => f[c]).length]));

/** ¿El `<title>` se puede fabricar del `h1` con una plantilla fija? */
const plantillas = new Map();
for (const f of filas) {
  if (!f.title || !f.h1) continue;
  /* La «plantilla» es lo que queda al quitar el `h1` del título. Si es la MISMA
   * cadena en todas, el título es derivable; si varía, lo escribió alguien. */
  plantillas.set(f.title.includes(f.h1) ? f.title.replace(f.h1, "«h1»") : "(no contiene el h1)",
    (plantillas.get(f.title.includes(f.h1) ? f.title.replace(f.h1, "«h1»") : "(no contiene el h1)") ?? 0) + 1);
}

console.log(`\n════════ CPT solutions · CABECERA SEO ════════`);
console.log(`  ${filas.length} URLs del sitemap · ${hoy()} · viewport 1440×900\n`);
console.log(`  presencia por campo:`);
for (const c of CAMPOS)
  console.log(`   ${presencia[c] === filas.length ? "✓" : "✗"} ${c.padEnd(16)} ${presencia[c]}/${filas.length}`);

console.log(`\n  ¿el <title> es derivable del h1? — formas distintas de «título menos h1»:`);
for (const [p, n] of [...plantillas].sort((a, b) => b[1] - a[1]))
  console.log(`   · ${String(n).padStart(3)} × ${p.slice(0, 92)}`);

const faltan = CAMPOS.filter((c) => presencia[c] < filas.length);
const derivable = plantillas.size === 1 && ![...plantillas.keys()][0].startsWith("(no contiene");

console.log(
  `\n  VEREDICTO para \`productos.seo\`:\n` +
    `   · title  → ${presencia.title === filas.length ? "presente en TODAS" : `AUSENTE en ${filas.length - presencia.title}`}` +
    ` · ${derivable ? "DERIVABLE del h1 (plantilla única) ⇒ plantilla" : "NO derivable del h1 ⇒ CAMPO"}\n` +
    `   · description → ${presencia.description}/${filas.length}` +
    ` ⇒ ${presencia.description === filas.length ? "universal" : "opcional, con respaldo"}\n`,
);

w(
  env("SALIDA") ||
    `medidas/solutions-seo${SABOTAJE ? `-neg-${SABOTAJE}` : ""}${SOLO ? `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}` : ""}.json`,
  {
    meta: {
      fecha: hoy(),
      sabotaje: SABOTAJE ?? null,
      alcance: `${filas.length} URLs de /es/ del solutions-sitemap.xml, derivadas no citadas`,
      viewport: "1440×900 · DPR 1",
      pregunta: "¿`productos.seo.title` tiene respaldo medido, y es campo o plantilla?",
    },
    /* El veredicto va CONGELADO y no sólo impreso: lo que la sonda afirma tiene
     * que estar en su fichero, o su negativo no puede comprobarlo (regla 1). */
    veredicto: { titulo: derivable ? "PLANTILLA" : "CAMPO", derivable },
    presencia,
    plantillasDeTitulo: Object.fromEntries(plantillas),
    faltan,
    filas,
  },
);

const muertos = censo.informe();
console.log(`  ✓ ${filas.length} URLs medidas`);
process.exit(muertos ? 2 : 0);
