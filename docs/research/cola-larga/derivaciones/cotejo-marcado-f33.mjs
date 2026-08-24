/* COTEJO DE LECTURA · PASO 0 de la 101.ª — el MARCADO servido de los 11 tipos.
 *
 * NO es una sonda: no congela en `medidas/` ni declara `Evaluadas`. Es la
 * derivación del PASO 0, que el encargo declara BARATA y NO-VERIFICACIÓN.
 *
 * Lo que hace: para cada tipo de módulo, censa sobre el HTML SERVIDO del corpus
 * (31 ficheros) el elemento que lo porta y su ENVOLTORIO, para cotejar contra lo
 * que `CuerpoPagina.tsx` emite. Se hace contra lo servido y no contra la tabla
 * de `modulos.spec.md` porque la spec midió LAS CLASES DEL MÓDULO y no contesta
 * qué hay por encima ni por debajo (§*una medida contesta las preguntas que se
 * le hicieron y su fichero no lleva escrito cuáles NO*).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");

/* La membresía se DERIVA de la congelada, no se escribe (§regla 9). */
const RUTAS = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;

/* El fichero de cada ruta lo trae la congelada de geo, que sí lo lleva. */
const CARPETAS = ["sueltas", "hubs-kb", "listados"]; /* derivadas del disco: los 3 subárboles donde el corpus deja las 31 */
const FICH = new Map();
const SIN_CARPETA = [];
for (const r of RUTAS) {
  const rel = r.ruta.replace(/^\/es\//, "").replace(/\/$/, "");
  let hallado = null;
  for (const c of CARPETAS) {
    const f = `${c}/${rel}/index.html`;
    if (existsSync(join(CORPUS, f))) { hallado = f; break; }
  }
  if (hallado) FICH.set(r.ruta, hallado);
  else SIN_CARPETA.push(r.ruta);
}
/* §sondas 4: si el mapa ruta→fichero no resuelve NINGUNA, eso es un defecto del
 * instrumento y no un cero del original. Sale por error, nunca por cero. */
if (FICH.size === 0) throw new Error("el mapa ruta→fichero no resolvió NINGUNA de las 31 (§sondas 4)");

/* Los 11 tipos, con el ordinal que los identifica (mismo criterio que f33-spec:
 * `et_pb_<tipo>_<n>`). Derivado de modulos.spec.md, que es un documento del
 * repo — no de memoria. */
const TIPOS = [
  "text", "image", "video", "blurb", "button", "toggle",
  "code", "icon", "fullwidth_slider", "map", "slider",
];

const sal = { porTipo: {}, ficherosLeidos: 0, ficherosSinFichero: [] };

for (const r of RUTAS) {
  const f = FICH.get(r.ruta);
  if (!f) { sal.ficherosSinFichero.push(r.ruta); continue; }
  let h;
  try { h = readFileSync(join(CORPUS, f), "utf8"); } catch { sal.ficherosSinFichero.push(r.ruta); continue; }
  sal.ficherosLeidos++;

  /* ⚠ DOS ACOTACIONES, las dos por defectos que la v1 de este cotejo cometió y
   * que este repo ya tiene documentados:
   *
   * 1 · `<style>` y `<script>` FUERA. El CSS de Divi nombra sus propias clases,
   *     así que un censo sobre el HTML entero las encuentra ahí y las cuenta
   *     como marcado (§*el markup se busca sobre el HTML sin `<style>` ni
   *     `<script>`*). La v1 daba `text` en una etiqueta `style` ×2;
   * 2 · el CASCARÓN fuera. `_tb_header` / `_tb_footer` / `_tb_body` son la
   *     cabecera y el pie del theme builder, que Divi mete dentro de
   *     `.et_pb_section` y NO son módulos del cuerpo. La v1 contaba 96 `button`
   *     (83 del pie) y 155 `icon` (152 del pie) — el mismo pleno que
   *     `c-cmp` se comió en la 80.ª. */
  h = h.replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<script\b[\s\S]*?<\/script>/gi, "");

  for (const t of TIPOS) {
    /* El ordinal es el ancla: `et_pb_text_0`, `et_pb_button_3`… y el sufijo
     * `_tb_*` es lo que separa el cascarón del cuerpo. Va en el patrón —y no en
     * un filtro posterior— porque si no `et_pb_code_0_tb_header` y
     * `et_pb_code_0` colisionan en el mismo `vistos` y el del CUERPO se pierde
     * detrás del del cascarón: la v1 daba 1 `code` de cuerpo donde hay 9. */
    const re = new RegExp(`et_pb_${t}_(\\d+)(_tb_[a-z]+)?`, "g");
    let m;
    const vistos = new Set();
    while ((m = re.exec(h))) {
      const clase = m[0];
      if (m[2]) continue;                       /* cascarón: no es el cuerpo */
      if (vistos.has(clase)) continue;
      vistos.add(clase);
      const s = (sal.porTipo[t] ??= {
        n: 0, paginas: new Set(), etiquetaPortadora: {}, clasesPortadora: {},
        envoltorio: {}, primerHijo: {},
      });
      s.n++; s.paginas.add(r.ruta);

      /* Retrocede hasta el `<` que abre el elemento que lleva la clase. */
      const i = m.index;
      const abre = h.lastIndexOf("<", i);
      const cierra = h.indexOf(">", i);
      if (abre < 0 || cierra < 0) continue;
      const tag = h.slice(abre, cierra + 1);
      const etq = (/^<([a-z0-9]+)/i.exec(tag) || [])[1] ?? "?";
      s.etiquetaPortadora[etq] = (s.etiquetaPortadora[etq] ?? 0) + 1;

      /* Las clases de la portadora, sin el ordinal (que es contador de Divi). */
      const cls = ((/class="([^"]*)"/i.exec(tag) || [])[1] ?? "")
        .split(/\s+/).filter(Boolean).filter((c) => c !== clase);
      for (const c of cls) s.clasesPortadora[c] = (s.clasesPortadora[c] ?? 0) + 1;

      /* EL ENVOLTORIO: el tag de apertura inmediatamente anterior que no sea un
       * cierre. Es la pregunta que la spec no contesta y donde vive el wrapper
       * del botón con su alineación. */
      const antes = h.slice(Math.max(0, abre - 700), abre);
      const tags = [...antes.matchAll(/<([a-z0-9]+)\b([^>]*)>/gi)];
      const ult = tags.length ? tags[tags.length - 1] : null;
      if (ult) {
        const ecls = ((/class="([^"]*)"/i.exec(ult[2]) || [])[1] ?? "")
          .split(/\s+/).filter(Boolean)
          .filter((c) => !/_\d+$/.test(c) && !/_\d+_wrapper$/.test(c));
        const firma = `${ult[1]}.${ecls.join(".") || "(sin clase)"}`;
        s.envoltorio[firma] = (s.envoltorio[firma] ?? 0) + 1;
      }

      /* EL PRIMER HIJO: la otra pregunta que la spec no contesta. */
      const dentro = h.slice(cierra + 1, cierra + 400);
      const h1 = /<([a-z0-9]+)\b([^>]*)>/i.exec(dentro);
      if (h1) {
        const hcls = ((/class="([^"]*)"/i.exec(h1[2]) || [])[1] ?? "")
          .split(/\s+/).filter(Boolean).filter((c) => !/_\d+$/.test(c));
        const firma = `${h1[1]}.${hcls.join(".") || "(sin clase)"}`;
        s.primerHijo[firma] = (s.primerHijo[firma] ?? 0) + 1;
      }
    }
  }
}

/* ── informe ─────────────────────────────────────────────────────────────── */
const orden = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
console.log(`ficheros leídos: ${sal.ficherosLeidos}/${RUTAS.length}` +
  (sal.ficherosSinFichero.length ? `  ⚠ SIN FICHERO: ${sal.ficherosSinFichero.join(", ")}` : ""));

let total = 0;
for (const t of TIPOS) {
  const s = sal.porTipo[t];
  if (!s) { console.log(`\n## ${t} — 0 instancias  ⚠ el selector no casó en NINGUNA (§sondas 4: eso es un DEFECTO, no un cero)`); continue; }
  total += s.n;
  console.log(`\n## ${t} — ${s.n} instancias · ${s.paginas.size} páginas`);
  console.log(`   etiqueta portadora : ${orden(s.etiquetaPortadora).map(([k, v]) => `${k} ×${v}`).join(" · ")}`);
  console.log(`   clases portadora   : ${orden(s.clasesPortadora).map(([k, v]) => `${k} ×${v}`).join(" · ")}`);
  console.log(`   ENVOLTORIO         : ${orden(s.envoltorio).map(([k, v]) => `${k} ×${v}`).join("\n                        ")}`);
  console.log(`   PRIMER HIJO        : ${orden(s.primerHijo).map(([k, v]) => `${k} ×${v}`).join("\n                        ")}`);
}
console.log(`\nTOTAL instancias censadas: ${total}`);
console.log(`(control: modulos.spec.md declara 313 módulos · 11 tipos · 31 páginas)`);
