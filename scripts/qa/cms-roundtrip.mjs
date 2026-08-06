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
 * Es la única del repo que mira de la hoja algo **más que su ruta**: su
 * **DEFECTO** y su **FORMA**. `payload-types` compila y `qa:cms-campos` pasa
 * aunque el defecto de un campo esté mal elegido o su forma no admita el dato;
 * aquí el dato entra, vuelve y se compara, así que si el campo no puede con él,
 * la vuelta no es igual a la ida. Cazó así los dos defectos del 2026-08-04: el
 * `nivel` compartido entre `claim` y `titular`, y las 16 celdas de tabla que
 * entraban en blanco.
 *
 * ⚠ **Y lo que NO mira, medido y no supuesto: el EDITOR de una hoja rica.**
 * Cambiar `productos.bullets[].texto` de `htmlLinea` a `editorNegrita` —o sea
 * **CMS-SP-TIPO literal**, el defecto del `R<sup>2</sup> >0,8`— deja esta sonda
 * en **63/63, exit 0** (sabotaje `tipo-hoja`, corrido). La razón es de sitio, no
 * de rigor: esa pérdida ocurre al **RENDERIZAR**, y guardar-y-releer es inverso
 * igual. **CMS-SP-TIPO sigue abierta** y la cierra el Δ0 de F2-3 o una sonda que
 * contraste las *features* del editor con el inventario de etiquetas del campo.
 * Está declarado como punto ciego **verificado** en `cms-roundtrip.neg.mjs`: si
 * algún día muerde, ese fichero sale rojo.
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
import { Evaluadas, env, hoy, w } from "./lib.mjs";
import { aMedido, camposPropios } from "../../packages/cms-config/src/mapeo.mjs";
import {
  SEMBRADAS,
  FUERA_DE_BLOQUE_1,
  RUTAS_EN_FRONTERA,
  PREPARA,
  DEVUELVE,
  SCRIPTS_ELIMINADOS,
  comoEmbebido,
  podaFrontera,
  podaScripts,
  sonInversas,
  exigeVacia,
  siembra,
} from "../seed/seed.mjs";
import { TAXONOMIAS_DERIVADAS } from "../seed/catalogos.mjs";

/* Esta sonda no abre el clon: mide la DB, no el HTML servido. */
process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["defecto", "defecto-compartido", "sintetico", "envoltorio", "tipo-hoja"];
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
const { construyeConfig, COLECCIONES } = await import("../../packages/cms-config/src/index.ts");

/* ── El sabotaje del EDITOR va ANTES de `buildConfig`, y no por gusto: Payload
 *    «sanea» los editores al resolver la config, y tocar el `editor` después
 *    tira con *«Attempted to access unsanitized rich text editor»*. Un sabotaje
 *    que muere ahí no ha probado nada — se parece a que la sonda cazó algo. ── */
function recorreSinResolver(campos, ruta, visita) {
  for (const c of campos ?? []) {
    if (!c?.name) { if (Array.isArray(c?.fields)) recorreSinResolver(c.fields, ruta, visita); continue; }
    const aqui = ruta ? `${ruta}.${c.name}` : c.name;
    visita(aqui, c);
    if (Array.isArray(c.fields)) recorreSinResolver(c.fields, aqui, visita);
    if (Array.isArray(c.blocks)) for (const b of c.blocks) recorreSinResolver(b.fields, `${aqui}[${b.slug}]`, visita);
  }
}
if (SABOTAJE === "tipo-hoja") {
  /**
   * **CMS-SP-TIPO, tal cual se dio en F2-1**: la hoja pasa de `htmlLinea` a
   * `editorNegrita` — un editor **válido** que no puede expresar `<sup>`, que es
   * exactamente lo que tenía `productos.bullets[].texto` y ni `payload-types` ni
   * `qa:cms-campos` vieron.
   */
  const { editorNegrita } = await import("../../packages/cms-config/src/campos/comunes.ts");
  let diana = null;
  for (const col of COLECCIONES) {
    if (diana || !SEMBRADAS.includes(col.slug)) continue;
    recorreSinResolver(col.fields, "", (ruta, c) => {
      if (!diana && c.type === "code" && c.admin?.language === "html") diana = { col: col.slug, ruta, campo: c };
    });
  }
  if (!diana) {
    console.error(`\n❌ SABOTAJE=tipo-hoja SIN DIANA — ninguna colección de SEMBRADAS tiene una hoja \`htmlLinea\`.`);
    process.exit(2);
  }
  diana.campo.type = "richText";
  diana.campo.editor = editorNegrita;
  delete diana.campo.validate;
  delete diana.campo.admin?.language;
  console.log(`  ⚠ diana: ${diana.col}.${diana.ruta} — htmlLinea → editorNegrita`);
}

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
if (SABOTAJE === "defecto-compartido") {
  /**
   * **El defecto de ESTA tanda, reintroducido**: dos bloques distintos
   * comparten un `nivel` con el mismo `defaultValue`, cuando el render los lee
   * con `?? 2` y `?? 3`. El hook de `conDefecto` omite entonces el valor
   * explícito de uno de los dos y la vuelta lo devuelve AUSENTE.
   *
   * No es lo mismo que `defecto`: aquél prueba que la sonda ve un defecto que
   * vuelve explícito; éste, que ve un defecto **mal elegido**. Son dos formas de
   * fallar de la misma pieza y sólo una la cubría el otro sabotaje.
   */
  const d = exigeDiana(
    buscaDiana((c) => c.name === "nivel" && c.defaultValue === 3),
    "ningún `nivel` con defecto 3 (el del `titular`)",
  );
  d.campo.defaultValue = 2;
  d.campo.hooks = { beforeChange: [({ value }) => (value === 2 ? null : value)] };
  console.log(`  ⚠ diana: ${d.col}.${d.ruta} — defecto 3 → 2, como estaba antes`);
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
 * cablearlo dentro para que `seed.mjs` no dependa de la config.
 *
 * ⚠ **Y después, `DEVUELVE` — la inversa de `PREPARA`, que hasta hoy no
 * existía.** El walker es bidireccional por construcción, pero `PREPARA` es una
 * transformación escrita ENCIMA de él y sólo tenía ida: el documento embebido
 * volvía con los nombres del ESQUEMA (`slug`/`titulo`) contra los del dato
 * medido (`id`/`name`). 72 de las 157 diferencias eran eso. */
ctx.declaraProyector((col, docDestino, donde) => {
  const cfg = config.collections.find((c) => c.slug === col);
  if (!cfg) throw new Error(`PROYECTOR: la colección destino '${col}' (en ${donde}) no está en la config`);
  return (DEVUELVE[col] ?? ((x) => x))(aMedido(cfg.fields, docDestino, ctx, col));
});

/* ══════════════════════════════════════════════════════════════════════════
 * LAS TRANSFORMACIONES DECLARADAS QUE EL LADO MEDIDO TAMBIÉN PASA
 *
 * ⚠ **Aplicar una transformación a los DOS lados es el modo de fallo que el
 * walker único existe para evitar** —*un mismo olvido en las dos daría Δ0 en
 * falso*—, así que cada una va con lo que la hace auditable:
 *
 * | transformación | por qué el lado medido también la pasa | control |
 * |---|---|---|
 * | **T4a** (`podaScripts`) | el `validate` del campo RECHAZA `<script>` (§3.3), así que lo que entró en la DB es el HTML sin ellos. Comparar contra el HTML con scripts sería comparar contra algo que el esquema prohíbe | el nº de eliminaciones se cuenta y se contrasta contra `sondeo-frontera.json`, congelada por OTRA sonda |
 * | **regla de rutas locales** (`comoEmbebido`) | §4 no guarda `href`: se compone de `padre`+`slug`, y dentro del CMS los 24 productos son documentos ⇒ ruta local | la vuelta lo COMPONE y el lado medido lo NORMALIZA: dos cálculos independientes que tienen que coincidir |
 *
 * `podaFrontera` no necesita control: `RUTAS_EN_FRONTERA` está **vacía** desde
 * que se cerró la frontera del teaser, y una ruta declarada que no case sale por
 * `PODA MUERTA` en el sondeo.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Normaliza los documentos EMBEBIDOS del lado medido, guiado por la config —
 * no por una lista de rutas. Un valor de `relationship` que el dato medido
 * escribe como OBJETO es un documento embebido (§2c), y su forma medida la da
 * `comoEmbebido` de su colección destino.
 */
function normalizaEmbebidos(campos, dato) {
  if (dato === null || typeof dato !== "object") return dato;
  const out = Array.isArray(dato) ? [...dato] : { ...dato };
  for (const campo of camposPropios(campos)) {
    if (!campo?.name) {
      if (Array.isArray(campo.fields)) Object.assign(out, normalizaEmbebidos(campo.fields, out));
      continue;
    }
    const v = out[campo.name];
    if (v === undefined || v === null) continue;
    const uno = (x) => {
      if (campo.type === "relationship")
        return x !== null && typeof x === "object"
          ? comoEmbebido(Array.isArray(campo.relationTo) ? campo.relationTo[0] : campo.relationTo, x)
          : x;
      if (campo.type === "blocks") {
        const b = campo.blocks?.find((bl) => x?.kind === bl.slug || Object.hasOwn(x ?? {}, bl.slug));
        return b ? normalizaEmbebidos(b.fields, x) : x;
      }
      if (Array.isArray(campo.fields)) return normalizaEmbebidos(campo.fields, x);
      return x;
    };
    out[campo.name] = Array.isArray(v) ? v.map(uno) : uno(v);
  }
  return out;
}

/* ── El par escrito a mano se verifica ANTES de usarlo: si `DEVUELVE` no es la
 *    inversa de `PREPARA`, todo lo de abajo compara contra un espejo torcido. ── */
const conPrepara = Object.keys(PREPARA).filter((c) => SEMBRADAS.includes(c));
const noInversas = conPrepara.flatMap((col) => sonInversas(col, catalogos.get(col)));
if (noInversas.length) {
  console.error(`\n❌ PREPARA/DEVUELVE NO son inversas en ${noInversas.length} campo(s):`);
  for (const r of noInversas.slice(0, 10)) console.error(`   · ${r.coleccion}/${r.slug} · ${r.campo}`);
  process.exit(2);
}
const FILAS_INVERSAS = conPrepara.reduce((a, c) => a + catalogos.get(c).length, 0);
console.log(`  ✓ PREPARA/DEVUELVE inversas sobre ${FILAS_INVERSAS} filas de ${conPrepara.join(" · ")}`);

/* ── El control de T4a: el lado medido tiene que quitar EXACTAMENTE los mismos
 *    scripts que quitó el seed. Si difiere, la transformación no es la misma en
 *    los dos lados y el Δ0 no significaría nada. ─────────────────────────── */
const T4A_EN_SIEMBRA = SCRIPTS_ELIMINADOS.length;

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
    const esperado = normalizaEmbebidos(
      cfg.fields,
      podaScripts(podaFrontera((PREPARA[col] ?? ((x) => x))(fila)), `esperado:${col}`),
    );
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

/* ── T4a, el control. `podaScripts` apunta en el mismo `SCRIPTS_ELIMINADOS`,
 *    así que la mitad de arriba es la del seed y la de abajo la del lado medido:
 *    tienen que ser el mismo número, y las mismas rutas. ─────────────────── */
const t4aEsperado = SCRIPTS_ELIMINADOS.length - T4A_EN_SIEMBRA;
if (t4aEsperado !== T4A_EN_SIEMBRA) {
  console.error(
    `\n❌ T4a NO es la misma transformación en los dos lados: ${T4A_EN_SIEMBRA} scripts\n` +
      `   quitados al sembrar y ${t4aEsperado} al preparar el lado medido. Un Δ0 con esto\n` +
      `   descuadrado sería exactamente el «mismo olvido en las dos direcciones».`,
  );
  process.exit(2);
}
const dondeT4a = new Set(SCRIPTS_ELIMINADOS.slice(0, T4A_EN_SIEMBRA).map((s) => s.donde.split("/")[1]));
console.log(`  ✓ T4a simétrica — ${T4A_EN_SIEMBRA} <script> en los dos lados, ${dondeT4a.size} documento(s)`);

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

w(env("SALIDA") || (SABOTAJE ? `medidas/cms-roundtrip-neg-${SABOTAJE}.json` : "medidas/cms-roundtrip.json"), informe);

console.log(
  `\n${conDiferencia === 0 ? "✅" : "❌"} round-trip: ${PARES - conDiferencia}/${PARES} documentos IDÉNTICOS` +
    ` en ${filasPorColeccion.size} colecciones.\n` +
    (conDiferencia === 0
      ? `   La ida y la vuelta son inversas sobre lo sembrado, y los defectos vuelven\n` +
        `   OMITIDOS. El alcance de arriba es parte del veredicto, no una nota.\n`
      : ""),
);
process.exit(conDiferencia === 0 ? 0 : 2);
