/**
 * SONDEO DE FRONTERA — recorre TODOS los catálogos sin escribir en la DB y
 * reporta **qué relaciones no tienen destino**.
 *
 * Existe porque el alcance del bloque 1 no se decide razonando: se mide. Un
 * corte elegido «porque parece que depende de» es una lista a mano, y este repo
 * ya sabe cómo acaban.
 */
import { CATALOGOS, cargaCatalogos } from "./catalogos.mjs";
import { creaContexto, derivaTaxonomias, PREPARA, esSlug } from "./seed.mjs";
import { TAXONOMIAS_DERIVADAS } from "./catalogos.mjs";
import { aPayload } from "./mapeo.mjs";

const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const config = await construyeConfig();

const catalogos = await cargaCatalogos();
const taxonomias = derivaTaxonomias(catalogos);

/* Un payload de mentira: el sondeo no escribe. `media` devuelve un id falso
 * porque aquí la pregunta es de RELACIONES, no de ficheros. */
const falso = { create: async () => ({ id: 0 }) };
const ctx = creaContexto(falso, { sondeo: true });
ctx.media = async () => 0;

/* Se registran TODOS los slugs de TODAS las colecciones primero: así lo que
 * quede huérfano es «no existe en `src/lib`», no «aún no lo he insertado». */
for (const [col, filas] of taxonomias) for (const f of filas) ctx.registra(col, f.slug, 1);
for (const c of CATALOGOS)
  for (const f of catalogos.get(c.coleccion))
    ctx.registra(c.coleccion, (PREPARA[c.coleccion] ? PREPARA[c.coleccion](f) : f).slug, 1);

const porColeccion = new Map();
for (const c of CATALOGOS) {
  const cfg = config.collections.find((x) => x.slug === c.coleccion);
  const antes = ctx.huerfanas.length;
  for (const fila of catalogos.get(c.coleccion)) {
    const prep = (PREPARA[c.coleccion] ?? ((x) => x))(fila);
    try {
      await aPayload(cfg.fields, prep, ctx, c.coleccion);
    } catch (e) {
      console.log(`  ⚠ ${c.coleccion}: ${String(e.message).split("\n")[0]}`);
    }
  }
  porColeccion.set(c.coleccion, ctx.huerfanas.length - antes);
}

console.log(`\n════════ SONDEO DE FRONTERA ════════`);
console.log(`  relaciones sin destino, por colección de ORIGEN:\n`);
for (const [col, n] of porColeccion)
  console.log(`   ${n === 0 ? "✓" : "✗"} ${col.padEnd(24)} ${String(n).padStart(4)}`);

const porDestino = {};
for (const h of ctx.huerfanas) {
  const k = `${h.donde.split(/[.[]/)[0]} → ${h.destinos.join("|")}`;
  (porDestino[k] ??= new Set()).add(h.slug);
}
console.log(`\n  detalle (origen → destino : nº de slugs distintos que faltan):`);
for (const [k, v] of Object.entries(porDestino)) console.log(`   ${k.padEnd(46)} ${v.size}`);

/* ── Segunda pregunta del sondeo: campos REQUIRED de Payload sin dato medido.
 *    Es el espejo de `qa:cms-campos` —que va de lo medido a Payload— y ve lo
 *    que aquélla no puede ver por construcción: un campo que Payload EXIGE y
 *    que el catálogo del clon no trae. Sin esto, el hueco sólo aparece como un
 *    400 a mitad del seed, que es un sitio pésimo para enterarse. ───────── */
const requeridosSinDato = [];
function exige(campos, dato, col, ruta = "") {
  for (const c of campos ?? []) {
    if (!c?.name) { if (Array.isArray(c?.fields)) exige(c.fields, dato, col, ruta); continue; }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    const v = dato?.[c.name];
    if (c.required && (v === undefined || v === null)) { requeridosSinDato.push({ col, ruta: aqui }); continue; }
    /* ⚠ Se entra al grupo AUNQUE ESTÉ AUSENTE: un `required` dentro de un grupo
     * opcional que no llega es justo el caso que tumbó el seed (productos.seo.title),
     * y la primera versión de esta guarda lo saltaba por pedir `&& v`. Reportaba
     * «(ninguno)» con el seed cayendo por ese campo. */
    if (c.type === "group") exige(c.fields, v ?? {}, col, aqui);
  }
}
for (const c of CATALOGOS) {
  const cfg = config.collections.find((x) => x.slug === c.coleccion);
  for (const fila of catalogos.get(c.coleccion))
    exige(cfg.fields, (PREPARA[c.coleccion] ?? ((x) => x))(fila), c.coleccion);
}
const agrup = {};
for (const r of requeridosSinDato) (agrup[`${r.col} · ${r.ruta}`] ??= 0), agrup[`${r.col} · ${r.ruta}`]++;
console.log(`\n  campos REQUIRED de Payload sin dato en el catálogo medido:`);
if (!Object.keys(agrup).length) console.log("   (ninguno)");
for (const [k, n] of Object.entries(agrup)) console.log(`   ✗ ${k.padEnd(44)} en ${n} instancia(s)`);
