/**
 * IGUALDAD MECÁNICA — el criterio de «hecho» del §F2-2, literal: *«los seeds
 * insertados se re-leen y proyectan **idénticos** a `src/lib` (igualdad
 * mecánica, no de ojo)»*.
 *
 * Uso:  npm run qa:cms-roundtrip          (resetea, siembra y compara)
 *       SIN_RESET=1 …                     (sobre una DB ya sembrada)
 *       SABOTAJE=… npm run qa:cms-roundtrip   → tiene que salir ≠ 0
 *       npm run qa:cms-roundtrip-neg      (los sabotajes + el control)
 *
 * ── Por qué esta sonda y no leer el admin ─────────────────────────────────
 * Es la ÚNICA del repo que mira **el tipo de la hoja** y no sólo su ruta.
 * `payload-types` compila y `qa:cms-campos` pasa aunque un campo esté declarado
 * con un editor que **no puede expresar su contenido** — es la ficha
 * **CMS-SP-TIPO**, abierta en F2-1 con `productos.bullets[].texto`
 * (`R<sup>2</sup> >0,8`) como caso. Aquí el dato entra, vuelve y se compara: si
 * el campo no puede con él, la vuelta no es igual a la ida.
 *
 * ── ⚠ EL INVARIANTE QUE MANDA: el DEFECTO OMITIDO ─────────────────────────
 * `conDefecto` (§1.5c) omite el valor al escribir cuando coincide con el
 * defecto, así que en el dato medido **ese campo no está**. El proyector tiene
 * que devolverlo **ausente**, no explícito:
 *
 *   > **Si el round-trip devolviera el defecto explícito, la comparación FALLA.**
 *   > No es una tolerancia que ajustar: «omitido» y «escrito igual que el
 *   > defecto» son dos estados distintos del modelo, y confundirlos borra la
 *   > diferencia entre *el editor lo eligió* y *nadie lo tocó*.
 *
 * ── Y lo que NO se hace, por si tienta ────────────────────────────────────
 * **Ninguna diferencia se arregla normalizando** — ni en el seed, ni en el
 * proyector, ni en el comparador. Un `?? ""`, un «ignora este campo» o un
 * `JSON.parse(JSON.stringify())` de más darían verde y falsificarían justo el
 * instrumento que decide si el modelo es fiel. Si un campo no cuadra, o se
 * arregla el ESQUEMA (con su migración versionada) o se anota como frontera.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Evaluadas, hoy, w } from "./lib.mjs";
import { aMedido, camposPropios } from "../seed/mapeo.mjs";
import {
  SEMBRADAS,
  FUERA_DE_BLOQUE_1,
  RUTAS_EN_FRONTERA,
  PREPARA,
  podaFrontera,
  exigeVacia,
  siembra,
} from "../seed/seed.mjs";
import { TAXONOMIAS_DERIVADAS } from "../seed/catalogos.mjs";

/* Esta sonda no abre el clon: mide la DB, no el HTML servido. */
process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["defecto", "sintetico", "envoltorio", "tipo-hoja"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);

/* ── La DB vacía es precondición, no higiene (§F2-2: «migrate desde cero +
 *    seed»): los ids son claves foráneas de todo lo demás y sin determinismo el
 *    Δ0 de F2-3 no es alcanzable. Se resetea aquí y no a mano para que la sonda
 *    sea dueña de su precondición, como `iniciarClon` lo es del servidor. ──── */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
if (!process.env.SIN_RESET) {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [path.join(RAIZ, "scripts/seed/reset.mjs")], {
    encoding: "utf8",
    env: process.env,
  });
  process.stdout.write(r.stdout ?? "");
  if (r.status !== 0) {
    console.error(r.stderr ?? "");
    console.error(`\n❌ no se pudo dejar la DB vacía y migrada. ¿Está \`kunak-cms-pg\` levantado?`);
    process.exit(2);
  }
}

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const config = await construyeConfig();

/* ══════════════════════════════════════════════════════════════════════════
 * LOS SABOTAJES — cada uno reintroduce UN modo de fallo REAL, y ninguno toca el
 * comparador.
 *
 * Tres se aplican sobre la **config resuelta** —lo mismo que hace
 * `cms-slugs.neg`—, porque sabotear el comparador probaría que el comparador
 * sabe quejarse, no que el modelo cuadra. `defecto` es el único que se aplica al
 * documento leído: lo que reproduce es que **la DB devuelva el valor explícito**
 * en vez del `null` que el hook de `conDefecto` escribe.
 *
 * ⚠ **Y los tres de config se aplican ANTES de sembrar**, no después: un
 * sabotaje que llega cuando los datos ya están escritos mide otra cosa.
 *
 * ⚠⚠ **Un sabotaje sin diana sale por ERROR, nunca por verde.** Si el alcance
 * sembrado no contiene ningún array transparente o ninguna hoja de marcado, el
 * sabotaje no puede reproducir su defecto — y «no encontré dónde sabotear» y
 * «saboteé y la sonda lo cazó» dan la misma salida si se dejan pasar. Es la
 * regla del cero aplicada al propio test en negativo.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Recorre los campos propios de una colección, con su ruta. */
function recorre(campos, ruta, visita) {
  for (const c of camposPropios(campos)) {
    if (!c?.name) { if (Array.isArray(c.fields)) recorre(c.fields, ruta, visita); continue; }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    visita(aqui, c);
    if (Array.isArray(c.fields)) recorre(c.fields, aqui, visita);
    if (Array.isArray(c.blocks)) for (const b of c.blocks) recorre(b.fields, `${aqui}[${b.slug}]`, visita);
  }
}

/** La primera diana de cada clase DENTRO del alcance sembrado. Derivada. */
function buscaDiana(predicado) {
  for (const col of SEMBRADAS) {
    let hallado = null;
    recorre(config.collections.find((c) => c.slug === col).fields, "", (ruta, campo) => {
      if (!hallado && predicado(campo)) hallado = { col, ruta, campo };
    });
    if (hallado) return hallado;
  }
  return null;
}

const exigeDiana = (d, que) => {
  if (d) return d;
  console.error(
    `\n❌ SABOTAJE=${SABOTAJE} SIN DIANA — ninguna colección de SEMBRADAS tiene ${que}.\n` +
      `   Esto NO es «la sonda lo cazó»: es que el sabotaje no llegó a existir, y las\n` +
      `   dos cosas dan la misma salida si se dejan pasar. Alcance: ${SEMBRADAS.join(", ")}.`,
  );
  process.exit(2);
};

let dianaDefecto = null;
if (SABOTAJE === "defecto") {
  dianaDefecto = exigeDiana(
    buscaDiana((c) => c.defaultValue !== undefined),
    "ningún campo con `defaultValue` (o sea, ningún `conDefecto`)",
  );
}
if (SABOTAJE === "sintetico") {
  /* `updatedAt` deja de reconocerse como inyectado ⇒ el proyector lo devuelve
   * como si fuera dato medido. Prueba `esSintetico`, que es la pieza sin la
   * cual TODOS los arrays y bloques del modelo salían con Δ ≠ 0. */
  for (const col of SEMBRADAS) {
    const f = config.collections.find((c) => c.slug === col).fields.find((x) => x.name === "updatedAt");
    if (f?.admin) delete f.admin.hidden;
  }
}
if (SABOTAJE === "envoltorio") {
  /* Un array de UN campo propio deja de serlo ⇒ el envoltorio transparente no
   * aplica y la vuelta devuelve objetos donde el dato medido tiene cadenas. */
  const d = exigeDiana(
    buscaDiana((c) => c.type === "array" && camposPropios(c.fields).length === 1),
    "ningún array de UN solo campo propio",
  );
  d.campo.fields = [...d.campo.fields, { name: "sabotaje", type: "text" }];
  console.log(`  ⚠ diana: ${d.col}.${d.ruta}`);
}
if (SABOTAJE === "tipo-hoja") {
  /* **CMS-SP-TIPO**: la hoja pasa a un editor que NO puede expresar su
   * contenido. Es el defecto que ni `payload-types` ni `qa:cms-campos` ven,
   * porque los dos miran la RUTA del campo y no su tipo. */
  const d = exigeDiana(
    buscaDiana((c) => c.type === "code" && c.admin?.language === "html"),
    "ninguna hoja de HTML en línea (`htmlLinea`)",
  );
  d.campo.type = "richText";
  delete d.campo.validate;
  console.log(`  ⚠ diana: ${d.col}.${d.ruta}`);
}

const payload = await getPayload({ config });
await exigeVacia(payload, config.collections);

console.log(`\n════════ ROUND-TRIP · igualdad mecánica ════════`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar\n`);
const { ctx, catalogos, taxonomias } = await siembra(payload, config.collections);

/* ══════════════════════════════════════════════════════════════════════════
 * LOS PARES A COMPARAR — derivados de lo que el seed escribió, no de una lista
 * ═════════════════════════════════════════════════════════════════════════ */

/** Filas medidas por colección, en el mismo orden en que el seed las insertó. */
const filasPorColeccion = new Map();
for (const t of TAXONOMIAS_DERIVADAS)
  if (SEMBRADAS.includes(t.de)) filasPorColeccion.set(t.coleccion, taxonomias.get(t.coleccion));
for (const col of SEMBRADAS) filasPorColeccion.set(col, catalogos.get(col));

const PARES = [...filasPorColeccion].reduce((a, [, f]) => a + f.length, 0);
const ev = new Evaluadas({ nombre: "cms-roundtrip", unidad: "documentos", minimo: PARES });

/* Cómo se reconstruye un TÉRMINO EMBEBIDO (§2c): proyectando el documento
 * destino con los campos de SU colección — no copiándolo del catálogo medido,
 * que sería comparar el dato consigo mismo. Se le pasa al contexto en vez de
 * cablearlo dentro para que `seed.mjs` no dependa de la config. */
ctx.declaraProyector((col, docDestino, donde) => {
  const cfg = config.collections.find((c) => c.slug === col);
  if (!cfg) throw new Error(`PROYECTOR: la colección destino '${col}' (en ${donde}) no está en la config`);
  return aMedido(cfg.fields, docDestino, ctx, col);
});

/* ══════════════════════════════════════════════════════════════════════════
 * LA COMPARACIÓN — estructural, y las diferencias se NOMBRAN por ruta
 *
 * Un booleano «son distintos» no sirve: la mitad del valor de esta sonda es
 * decir DÓNDE, porque un Δ en la raíz y uno en la hoja seis niveles abajo se
 * leen igual de mal desde arriba.
 * ═════════════════════════════════════════════════════════════════════════ */
const tipoDe = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const corta = (v) => {
  const s = JSON.stringify(v);
  return s === undefined ? "(ausente)" : s.length > 90 ? s.slice(0, 87) + "…" : s;
};

function difiere(esperado, real, ruta, fuera) {
  if (esperado === undefined && real === undefined) return;
  if (tipoDe(esperado) !== tipoDe(real) || esperado === undefined || real === undefined) {
    fuera.push({ ruta, clase: "FORMA", esperado: corta(esperado), real: corta(real) });
    return;
  }
  if (Array.isArray(esperado)) {
    if (esperado.length !== real.length)
      fuera.push({ ruta, clase: "LONGITUD", esperado: `${esperado.length} ítems`, real: `${real.length} ítems` });
    for (let i = 0; i < Math.max(esperado.length, real.length); i++)
      difiere(esperado[i], real[i], `${ruta}[${i}]`, fuera);
    return;
  }
  if (esperado !== null && typeof esperado === "object") {
    for (const k of new Set([...Object.keys(esperado), ...Object.keys(real)]))
      difiere(esperado[k], real[k], ruta ? `${ruta}.${k}` : k, fuera);
    return;
  }
  if (esperado !== real) fuera.push({ ruta, clase: "VALOR", esperado: corta(esperado), real: corta(real) });
}

const informe = {
  meta: {
    fecha: hoy(),
    sabotaje: SABOTAJE,
    alcance: {
      comparadas: [...filasPorColeccion.keys()],
      pares: PARES,
      fuera: FUERA_DE_BLOQUE_1,
      rutasEnFrontera: RUTAS_EN_FRONTERA,
    },
  },
  porColeccion: {},
  diferencias: [],
};

let conDiferencia = 0;

for (const [col, filas] of filasPorColeccion) {
  const cfg = config.collections.find((c) => c.slug === col);
  const ids = ctx.idsPorColeccion.get(col);
  let malas = 0;
  for (const fila of filas) {
    const esperado = podaFrontera((PREPARA[col] ?? ((x) => x))(fila));
    const id = ids?.get(esperado.slug);
    if (id === undefined) {
      ev.fallo(`${col}/${esperado.slug}`, "el seed no registró su id");
      malas++;
      continue;
    }
    /* `depth: 1` y no 0: una relación cuya forma medida es un TÉRMINO EMBEBIDO
     * (§2c) sólo se puede reconstruir si el documento destino viene con ella.
     * Con `depth: 0` la vuelta devolvería el slug y la comparación fallaría por
     * FORMA — que es justo lo que la primera corrida enseñó. */
    const doc = await payload.findByID({ collection: col, id, depth: 1 });
    /* El sabotaje del defecto vive AQUÍ y no en la config: lo que reproduce es
     * que la DB devuelva el valor explícito donde el hook escribió `null`. */
    if (SABOTAJE === "defecto" && col === dianaDefecto.col) doc[dianaDefecto.ruta] = dianaDefecto.campo.defaultValue;
    const real = aMedido(cfg.fields, doc, ctx, col);
    const fuera = [];
    difiere(esperado, real, "", fuera);
    ev.ok();
    if (fuera.length) {
      malas++;
      for (const d of fuera) informe.diferencias.push({ coleccion: col, slug: esperado.slug, ...d });
    }
  }
  conDiferencia += malas;
  informe.porColeccion[col] = { documentos: filas.length, conDiferencia: malas };
  console.log(
    `  ${malas === 0 ? "✓" : "✗"} ${col.padEnd(24)} ${String(filas.length).padStart(4)} doc` +
      (malas ? `   ${malas} CON DIFERENCIA` : ""),
  );
}

/* ── El alcance viaja con el dato: una cobertura declarada al nivel de arriba
 *    absorbe justo lo que no se midió abajo. ─────────────────────────────── */
console.log(`\n  alcance — FUERA de la comparación, con su razón:`);
for (const [c, r] of Object.entries(FUERA_DE_BLOQUE_1)) console.log(`   · ${c.padEnd(22)} ${r.slice(0, 100)}`);
if (RUTAS_EN_FRONTERA.length) console.log(`   · rutas podadas del dato: ${RUTAS_EN_FRONTERA.join(" · ")}`);

if (informe.diferencias.length) {
  console.error(`\n❌ ${informe.diferencias.length} DIFERENCIA(S) entre lo medido y lo proyectado:\n`);
  for (const d of informe.diferencias.slice(0, 25))
    console.error(
      `   · ${d.coleccion}/${d.slug} · ${d.ruta || "(raíz)"} [${d.clase}]\n` +
        `       medido:     ${d.esperado}\n       proyectado: ${d.real}`,
    );
  if (informe.diferencias.length > 25) console.error(`   … y ${informe.diferencias.length - 25} más`);
  console.error(
    `\n   NO se normaliza ninguna: o el ESQUEMA cambia (con su migración versionada)\n` +
      `   o la diferencia se anota como frontera. Tocar el seed o el proyector para\n` +
      `   que desaparezca falsifica el único instrumento que mira el TIPO de la hoja.`,
  );
}

w(SABOTAJE ? `medidas/cms-roundtrip-neg-${SABOTAJE}.json` : "medidas/cms-roundtrip.json", informe);

console.log(
  `\n${conDiferencia === 0 ? "✅" : "❌"} round-trip: ${PARES - conDiferencia}/${PARES} documentos IDÉNTICOS` +
    ` en ${filasPorColeccion.size} colecciones.\n` +
    (conDiferencia === 0
      ? `   La ida y la vuelta son inversas sobre lo sembrado, y los defectos vuelven\n` +
        `   OMITIDOS. El alcance de arriba es parte del veredicto, no una nota.\n`
      : ""),
);
process.exit(conDiferencia === 0 ? 0 : 2);
