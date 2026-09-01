// 135.ª · PASO 0 punto 3 — LA PREMISA QUE DECIDE SI EL ESCALÓN 3 PUEDE
// RESTAURAR EL ENTORNO CON EL PIPELINE COMPLETO.
//
// `F3-5-CODE-DIVERGE` dice que los 9 `MODULO_CODIGO` de `paginas` bloquearían
// 9 de 9 si se les corriera el validador — y sin embargo ESTÁN SEMBRADOS. Las
// dos lecturas se escriben igual y sólo una es cierta, así que se contesta
// CAMINANDO LA CONFIG (§*el veredicto lo da la salida servida*, con «lo
// servido» puesto en el esquema que el sembrador ejecuta), no leyendo el acta
// —§regla 3: un comentario que justifica la divergencia no cuenta como
// medición—.
//
// Y VA EN LAS DOS DIRECCIONES (§*una comprobación retroactiva se enmarca en
// las DOS*), porque con el marco de una sola el hallazgo cabe en «no hay nada»:
//
//   (a) ¿el campo NO lleva validador —y por eso sembraron— o lo lleva y algo
//       los deja pasar?
//   (b) ¿está SOBRE-GENERALIZADO el «9 de 9»? ¿se midió sobre el campo que el
//       sembrador recorre, o sobre otro?
//
// EL DENOMINADOR SE DERIVA RECORRIENDO TODOS LOS EJES (§regla 27): un proceso
// que aborta en el primer fallo contesta «hay al menos uno», nunca «hay N».
// Así que no se censa el bloque `codigo` — se censan TODOS los campos con
// `validate` de TODAS las colecciones, y los ejes a cero salen con su
// denominador.
//
// CONTROL POR CASO CONOCIDO DE ANTEMANO (§regla 28c): el control NO puede ser
// la aritmética de la condición. Los dos bloques `codigo` están escritos en el
// fuente con validadores distintos y SON la separadora de F3-5-CODE-DIVERGE:
// `codigo-arq` tiene que salir CON validate y `codigo` SIN él. Si el censo no
// los separa, no adjudica nada y la corrida no vale.
//
// OFFLINE: no abre navegador, no toca red, NO TOCA LA DB. Es lo único del
// PASO 0 que el socket cerrado no bloquea.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");

const { COLECCIONES } = await import(
  pathToFileURL(join(RAIZ, "packages/cms-config/src/colecciones.ts")).href
);

/** Recorre campos, grupos, pestañas y BLOQUES, anotando los que llevan `validate`. */
const recorre = (campos, ruta, out) => {
  for (const f of campos ?? []) {
    const n = f?.name ? `${ruta}.${f.name}` : ruta;
    if (typeof f?.validate === "function") {
      out.push({ ruta: n, tipo: f.type, required: !!f.required });
    }
    if (Array.isArray(f?.fields)) recorre(f.fields, n, out);
    if (Array.isArray(f?.blocks)) {
      for (const b of f.blocks) recorre(b.fields, `${n}[${b.slug}]`, out);
    }
    if (Array.isArray(f?.tabs)) for (const t of f.tabs) recorre(t.fields, n, out);
  }
};

const porColeccion = COLECCIONES.map((c) => {
  const out = [];
  recorre(c.fields, c.slug, out);
  return { coleccion: c.slug, nValidados: out.length, validados: out };
});

const total = porColeccion.reduce((a, f) => a + f.nValidados, 0);

console.log("=== EJE 1 · CAMPOS CON `validate` POR COLECCIÓN (denominador entero) ===");
for (const f of porColeccion) {
  console.log(`  ${String(f.nValidados).padStart(4)}  ${f.coleccion}`);
}
console.log(`  ${String(total).padStart(4)}  TOTAL en ${porColeccion.length} colecciones`);
console.log("  (los ejes a CERO salen nombrados: 0 validados es un dato, no un hueco)");

// ── La separadora: los dos bloques que modelan el MISMO `et_pb_code` ────────
//
// ⚠ CORREGIDO EN LA MISMA CORRIDA, Y LO CAZÓ EL CONTROL: la primera versión
// preguntaba «¿tiene el BLOQUE algún campo con validate?» y el control cayó
// con 18 en `paginas.[codigo]`. Los 18 son campos de RITMO
// (`ritmo.mt.unidad`, `movilUnidad`, `unidad767`…), que llevan `validate` por
// otro motivo y ABSORBEN la pregunta — §*la causa común: el NIVEL al que se
// mide*, con el contenedor puesto en el BLOQUE.
//
// La pregunta vive en el CAMPO DE CONTENIDO, no en el bloque: `html` en
// `paginas`, `contenido` en `arquetipos`. Se publican LOS DOS cardinales
// —ritmo y contenido— para que el 18 quede a la vista en vez de descontado.
const todos = porColeccion.flatMap((f) => f.validados.map((v) => v.ruta));
const esRitmo = (r) => /\.ritmo\./.test(r);

const bloquePaginas = todos.filter((r) => /\[codigo\]/.test(r));
const bloqueArq = todos.filter((r) => /\[codigo-arq\]/.test(r));

const enPaginasCodigo = bloquePaginas.filter((r) => !esRitmo(r));
const enArqCodigo = bloqueArq.filter((r) => !esRitmo(r));

console.log("\n=== EJE 2 · LA SEPARADORA — los dos bloques `et_pb_code` ===");
console.log("  (se cuentan los DOS cubos: RITMO absorbe la pregunta, CONTENIDO la contesta)");
console.log(`  paginas    · [codigo]      ritmo CON validate: ${bloquePaginas.length - enPaginasCodigo.length}` +
  `  ·  CONTENIDO con validate: ${enPaginasCodigo.length}` +
  (enPaginasCodigo.length ? ` :: ${enPaginasCodigo.join(", ")}` : ""));
console.log(`  arquetipos · [codigo-arq]  ritmo CON validate: ${bloqueArq.length - enArqCodigo.length}` +
  `  ·  CONTENIDO con validate: ${enArqCodigo.length}` +
  (enArqCodigo.length ? ` :: ${enArqCodigo.join(", ")}` : ""));

// ── El control, ANTES del veredicto ────────────────────────────────────────
const controlOk = enPaginasCodigo.length === 0 && enArqCodigo.length > 0;
console.log("\n=== CONTROL (caso conocido de antemano, §regla 28c) ===");
console.log("  Los dos bloques están escritos en el fuente con validadores distintos y SON");
console.log("  la separadora de F3-5-CODE-DIVERGE. El control se pronuncia sobre el CAMPO");
console.log("  DE CONTENIDO, que es donde vive la pregunta.");
console.log(`  paginas.[codigo].html          SIN validate ... ${enPaginasCodigo.length === 0 ? "SÍ ✓" : "NO ✗ (" + enPaginasCodigo.join(",") + ")"}`);
console.log(`  arquetipos.[codigo-arq].contenido CON validate . ${enArqCodigo.length > 0 ? "SÍ ✓" : "NO ✗"}`);
console.log(controlOk
  ? "  ✅ el censo SEPARA los dos bloques — la corrida ADJUDICA"
  : "  ❌ el censo NO separa — la corrida NO adjudica, y el veredicto de abajo NO vale");

// ── Veredicto, en las dos direcciones ──────────────────────────────────────
console.log("\n=== VEREDICTO ===");
if (controlOk) {
  console.log("  (a) el campo que el sembrador recorre en `paginas` es");
  console.log("      MODULO_CODIGO.html = { type:'code', required:true } SIN `validate`.");
  console.log("      => NO lleva validador. Por eso sembraron. NO es que «algo los deje pasar».");
  console.log("");
  console.log("  (b) el «9 de 9» NO está sobre-generalizado, pero es un CONTRAFÁCTICO:");
  console.log("      mide «si a `paginas` se le pusiera el validador de `arquetipos`,");
  console.log("      bloquearía 9 de 9». Es cierto de esa hipótesis y NO es una");
  console.log("      afirmación sobre la siembra — la siembra no valida ese campo.");
  console.log("");
  console.log("  CONSECUENCIA PARA EL ESCALÓN 3: `paginas` NO valida su `codigo`, así que");
  console.log("  restaurar el entorno con el pipeline completo NO se rompe por este eje.");
  console.log("  El pipeline puede usarse tal cual; NO hace falta camino alternativo.");
} else {
  console.log("  SIN VEREDICTO: el control no separa.");
}

// ── Lo que esta medida NO contesta (§*escribe QUÉ preguntas NO contesta*) ───
const noContesta = [
  "si las filas están HOY en la DB — eso es DB, y el socket está cerrado (ECONNREFUSED)",
  "si algún OTRO campo validado de `paginas` bloquearía con dato NUEVO: este censo dice CUÁNTOS validan, no qué admiten",
  "si el validador cambió desde que se sembró: se compara la config de HOY consigo misma",
];
console.log("\n=== QUÉ NO CONTESTA ESTA MEDIDA ===");
for (const n of noContesta) console.log(`  · ${n}`);

const salida = {
  meta: {
    tanda: "135.ª",
    paso: "PASO 0 punto 3 — la premisa de F3-5-CODE-DIVERGE",
    fecha: new Date().toISOString().slice(0, 10),
    offline: true,
    tocaDb: false,
  },
  control: {
    paginasCodigoSinValidate: enPaginasCodigo.length === 0,
    arquetiposCodigoArqConValidate: enArqCodigo.length > 0,
    adjudica: controlOk,
  },
  eje1_camposValidados: { total, nColecciones: porColeccion.length, porColeccion },
  eje2_separadora: {
    nivelBloque: {
      paginasCodigo: bloquePaginas.length,
      arquetiposCodigoArq: bloqueArq.length,
      nota: "ABSORBE la pregunta: casi todo es ritmo.*.unidad. No adjudica.",
    },
    nivelContenido: { enPaginasCodigo, enArqCodigo },
    ritmoDescontado: {
      paginas: bloquePaginas.length - enPaginasCodigo.length,
      arquetipos: bloqueArq.length - enArqCodigo.length,
    },
  },
  veredicto: controlOk
    ? {
        a: "MODULO_CODIGO.html NO lleva `validate` — por eso sembraron",
        b: "el «9 de 9» es un contrafáctico correcto, no una afirmación sobre la siembra",
        escalon3: "el pipeline completo es SEGURO para `paginas` por este eje",
      }
    : null,
  noContesta,
};

const dest = join(OUT, "premisa-code-135.json");
writeFileSync(dest, JSON.stringify(salida, null, 2) + "\n", "utf8");
console.log(`\n  congelada -> ${dest}`);

process.exitCode = controlOk ? 0 : 1;
