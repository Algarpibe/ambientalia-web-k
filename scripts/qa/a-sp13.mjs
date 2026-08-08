/**
 * A-SP13 — EL COSTE DEL REBUILD, MEDIDO POR FASES Y CON PENDIENTE.
 *
 * Uso:  npm run qa:a-sp13                        (3 corridas en frío, población real)
 *       MODO=tibio npm run qa:a-sp13             (sin borrar `.next`: reconstrucción en sitio)
 *       CORRIDAS=1 EXTRA=100 npm run qa:a-sp13   (población inflada: mide la PENDIENTE)
 *
 * `PLAN-FASE-2.md` §F2-4 · `ESQUEMA-CMS.md` CMS-0c · `arquetipo-A/ENRUTADO.md` §4.
 *
 * ── Qué pregunta contesta, y por qué NO es «cuánto tarda el build» ─────────
 * CMS-0c dice que **publicar y reconstruir son la misma operación**. Así que el
 * coste del rebuild no es un dato de curiosidad: es la latencia que ve quien
 * publica, y es el número contra el que se diseñan el webhook, su idempotencia
 * y el aviso al editor. Por eso se mide **antes** de escribir ninguna de las
 * tres cosas.
 *
 * ── ⚠ POR QUÉ UN SOLO NÚMERO NO PUEDE CONTESTAR A-SP13 ────────────────────
 * A-SP13 pregunta por **~220 rutas** y hoy el build emite 34. La tentación es
 * medir una vez y multiplicar, y eso da la respuesta mal por dos motivos que se
 * suman:
 *
 *   1 · **la mayor parte del rebuild no depende del nº de rutas.** Arranque,
 *       compilación y `tsc` cuestan lo mismo con 11 rutas que con 220. Escalar
 *       el TOTAL por el nº de rutas multiplica también el coste fijo, y eso
 *       infla la proyección varias veces;
 *   2 · **la parte que sí depende puede no ser lineal.** Next genera con N
 *       workers: mientras las rutas caben en una tanda de workers el coste
 *       marginal es casi plano, y a partir de ahí crece por tandas. Un solo
 *       punto **no puede ver** dónde está ese codo.
 *
 * De donde el diseño, que es el mismo principio que gobierna el repo — *medir
 * al nivel donde vive la propiedad*, aplicado al tiempo:
 *
 *   > **El rebuild se descompone en FASES y sólo se proyecta la que escala con
 *   > el nº de rutas. Y su pendiente se MIDE, con una segunda población, en vez
 *   > de suponerse lineal desde un punto.**
 *
 * ── La proyección heredada, y qué dice exactamente ────────────────────────
 * `ENRUTADO.md` §4 escribió: *«El build actual emite 11 en ~1 s; 220 es otro
 * orden»*. Ese «~1 s» **no es el rebuild** —ningún `next build` termina en un
 * segundo— sino la línea que Next imprime al cerrar la generación de estáticas.
 * O sea que la cita es de UNA FASE, y usarla como coste de publicación es leer
 * un contenedor por otro. Esta sonda mide las dos cosas por separado y las
 * imprime juntas para que no vuelva a pasar.
 *
 * ── EXTRA: la segunda población, y las cuatro guardas que la hacen segura ──
 * `EXTRA=N` clona **una entrada de blog real** N veces con slug
 * `qa-sp13-sintetico-<i>` antes de construir, y las borra después. Clona una
 * real y no inventa una vacía a propósito: el coste por ruta depende del tamaño
 * del cuerpo, y una entrada de mentira mediría una página que el sitio no tiene.
 *
 * Tocar la DB desde una sonda es peligroso —si la limpieza no corre, todas las
 * congeladas de las demás dejan de ser comparables y nada lo dice—, así que:
 *
 *   1 · el prefijo del slug es reconocible y **se borra por prefijo**, no por
 *       una lista de ids que un fallo a mitad dejaría incompleta;
 *   2 · la limpieza va en `finally`, y también corre si el build revienta;
 *   3 · **se cuentan las filas antes y después** y, si no cuadran, la sonda sale
 *       con código ≠ 0 diciendo cuántas sobran. Un residuo silencioso es
 *       exactamente el fallo del que este repo protege en todo lo demás;
 *   4 · su congelada **lleva `sintetico` en el nombre** (§sondas, regla 7): la
 *       población no es la del sitio, y un fichero que no lo diga es una medida
 *       falsa con la autoridad de una congelada.
 *
 * ── Lo que esta sonda NO prueba ───────────────────────────────────────────
 * Un tiempo es una propiedad **de esta máquina, esta fecha y esta
 * configuración**, no del proyecto: por eso `meta.config` va dentro de la
 * congelada y cualquier cita tiene que arrastrarla. Y con `EXTRA` mide el coste
 * de **N rutas más de la forma clonada**; una familia con páginas mucho más
 * pesadas tendría otra pendiente. Las dos cosas se declaran, no se redondean.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { APP, Evaluadas, env, gritaSiRevienta, hoy, leeManifiesto, rutasEmitidas, familiasEmitidas, w } from "./lib.mjs";

/* No abre el clon: mide el proceso de construcción, no el HTML servido. */
process.env.SIN_CLON = "1";
gritaSiRevienta();

const CORRIDAS = Number(env("CORRIDAS", "3"));
const EXTRA = Number(env("EXTRA", "0"));
const MODO = env("MODO", "frio"); // "frio" borra `.next`; "tibio" reconstruye encima

if (!Number.isInteger(CORRIDAS) || CORRIDAS < 1) throw new Error(`CORRIDAS inválido: ${CORRIDAS}`);
if (!Number.isInteger(EXTRA) || EXTRA < 0) throw new Error(`EXTRA inválido: ${EXTRA}`);
if (MODO !== "frio" && MODO !== "tibio") throw new Error(`MODO inválido: ${MODO} (frio|tibio)`);

const ev = new Evaluadas({ unidad: "builds", minimo: CORRIDAS, nombre: "a-sp13" });

/* ══════════════════════════════════════════════════════════════════════════
 * LAS FASES — marcadores del stream, no los números que Next se autoinforma
 *
 * Next imprime sus propios tiempos («Compiled successfully in 11.3s»), y son
 * útiles como control cruzado, pero **no suman el rebuild**: entre fase y fase
 * hay tramos que nadie reporta (el arranque de npm, el volcado final). Aquí el
 * reloj es de esta sonda y va de `spawn` a `exit`, así que las fases **suman el
 * total por construcción** y no hay tiempo que se escape sin nombre.
 *
 * ⚠ Un marcador que no aparece NO vale cero. Una fase ausente convierte la
 * corrida en un fallo contado (§sondas, regla 6: una ausencia no se sustituye
 * por un valor benigno). Si Next cambia sus rótulos, esta sonda tiene que
 * romperse ruidosamente, no repartir el total entre las fases que sí casaron.
 * ═════════════════════════════════════════════════════════════════════════ */
const MARCADORES = [
  { fase: "arranque", re: /▲\s*Next\.js/, que: "hasta que Next arranca (npm + boot)" },
  { fase: "compilacion", re: /Compiled successfully/, que: "empaquetado" },
  { fase: "typescript", re: /Finished TypeScript/, que: "typecheck del build" },
  { fase: "datos", re: /Generating static pages[^\n]*\(0\/(\d+)\)/, que: "Collecting page data — generateStaticParams + DB" },
  { fase: "generacion", re: /✓\s*Generating static pages[^\n]*\((\d+)\/(\d+)\)/, que: "render de las N rutas ← LA QUE ESCALA" },
  { fase: "cierre", re: null, que: "Finalizing + volcado a disco (hasta exit)" },
];

/** La fase que escala con el nº de rutas. Es la única que se proyecta. */
const FASE_ESCALA = "generacion";

function unBuild() {
  return new Promise((resolve) => {
    if (MODO === "frio") fs.rmSync(path.join(APP, ".next"), { recursive: true, force: true });

    const t0 = Date.now();
    const marcas = new Map();
    const lineas = [];
    let rutasNext = null;
    let autoinforme = {}; // lo que Next dice de sí mismo, como control cruzado

    const p = spawn("npm", ["run", "build", "-w", "web"], {
      shell: true,
      cwd: path.resolve(APP, "../.."),
      env: { ...process.env, SIN_CLON: "" },
    });

    let buf = "";
    const linea = (l) => {
      const t = (Date.now() - t0) / 1000;
      lineas.push({ t: +t.toFixed(3), l });
      for (const m of MARCADORES) {
        if (!m.re || marcas.has(m.fase)) continue;
        const g = m.re.exec(l);
        if (!g) continue;
        marcas.set(m.fase, t);
        if (m.fase === "datos" && g[1]) rutasNext = Number(g[1]);
        if (m.fase === "generacion" && g[2]) rutasNext = Number(g[2]);
      }
      let g;
      if ((g = /Compiled successfully in ([\d.]+)(m?s)/.exec(l))) autoinforme.compilacion = seg(g);
      if ((g = /Finished TypeScript in ([\d.]+)(m?s)/.exec(l))) autoinforme.typescript = seg(g);
      if ((g = /Generating static pages[^\n]*in ([\d.]+)(m?s)/.exec(l))) autoinforme.generacion = seg(g);
    };
    const seg = (g) => (g[2] === "ms" ? Number(g[1]) / 1000 : Number(g[1]));

    const on = (d) => {
      buf += d.toString();
      const ps = buf.split(/\r?\n/);
      buf = ps.pop();
      for (const l of ps) if (l.trim()) linea(l);
    };
    p.stdout.on("data", on);
    p.stderr.on("data", on);

    p.on("close", (codigo) => {
      if (buf.trim()) linea(buf);
      const total = (Date.now() - t0) / 1000;
      marcas.set("cierre", total);

      /* Las fases son DIFERENCIAS entre marcas consecutivas: así suman el total. */
      const fases = {};
      const faltan = [];
      let prev = 0;
      for (const m of MARCADORES) {
        if (!marcas.has(m.fase)) {
          faltan.push(m.fase);
          continue;
        }
        fases[m.fase] = +(marcas.get(m.fase) - prev).toFixed(3);
        prev = marcas.get(m.fase);
      }
      resolve({ codigo, total: +total.toFixed(3), fases, faltan, rutasNext, autoinforme, lineas });
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA POBLACIÓN SINTÉTICA — sólo si EXTRA > 0
 * ═════════════════════════════════════════════════════════════════════════ */
const PREFIJO = "qa-sp13-sintetico-";
let payload = null;
let clonadaDe = null;

async function cms() {
  if (payload) return payload;
  const { getPayload } = await import("payload");
  const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
  payload = await getPayload({ config: await construyeConfig() });
  return payload;
}

/** Cuenta las filas de `entradas-blog` y de `slugs`: el par que la limpieza tiene que devolver. */
async function censo() {
  const p = await cms();
  const [b, s] = await Promise.all([
    p.count({ collection: "entradas-blog" }),
    p.count({ collection: "slugs" }),
  ]);
  return { "entradas-blog": b.totalDocs, slugs: s.totalDocs };
}

async function siembra(n) {
  const p = await cms();
  const { docs } = await p.find({ collection: "entradas-blog", limit: 1, depth: 0, sort: "id" });
  if (!docs.length)
    throw new Error(
      "no hay ni una `entradas-blog` de la que clonar.\n" +
        "  Sin población real no se puede medir la pendiente de una población real:\n" +
        "  esto tira en vez de inventarse una entrada vacía. ¿Falta `npm run cms:seed`?",
    );
  clonadaDe = docs[0].slug;
  const base = { ...docs[0] };
  for (const k of ["id", "createdAt", "updatedAt"]) delete base[k];
  for (let i = 0; i < n; i++) {
    await p.create({
      collection: "entradas-blog",
      data: { ...base, slug: `${PREFIJO}${String(i).padStart(4, "0")}` },
      depth: 0,
    });
  }
}

async function limpia() {
  const p = await cms();
  const { docs } = await p.find({
    collection: "entradas-blog",
    where: { slug: { like: PREFIJO } },
    limit: 0,
    pagination: false,
    depth: 0,
  });
  for (const d of docs) await p.delete({ collection: "entradas-blog", id: d.id });
  return docs.length;
}

/* ══════════════════════════════════════════════════════════════════════════
 * CORRIDA
 * ═════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  fecha: hoy(),
  modo: MODO,
  node: process.version,
  next: JSON.parse(fs.readFileSync(path.join(APP, "package.json"), "utf8")).dependencies.next,
  so: `${os.type()} ${os.release()}`,
  cpu: os.cpus()[0]?.model ?? "(desconocida)",
  nucleos: os.cpus().length,
  ramGB: +(os.totalmem() / 1024 ** 3).toFixed(1),
  postgres: "docker kunak-cms-pg · postgres:17-alpine · localhost:55432",
};

console.log(`\nA-SP13 — coste del rebuild · modo ${MODO} · ${CORRIDAS} corrida(s)${EXTRA ? ` · +${EXTRA} rutas sintéticas` : ""}`);
console.log(`  ${CONFIG.cpu} · ${CONFIG.nucleos} núcleos · ${CONFIG.ramGB} GB · node ${CONFIG.node} · next ${CONFIG.next}`);

const antes = EXTRA ? await censo() : null;
const corridas = [];
let sobrantes = 0;

try {
  if (EXTRA) {
    console.log(`\n  · sembrando ${EXTRA} clones de una entrada real…`);
    await siembra(EXTRA);
    const d = await censo();
    console.log(`    entradas-blog ${antes["entradas-blog"]} → ${d["entradas-blog"]} (clonada: ${clonadaDe})`);
  }

  for (let i = 1; i <= CORRIDAS; i++) {
    const r = await unBuild();
    if (r.codigo !== 0) {
      ev.fallo(`corrida ${i}`, `el build salió con código ${r.codigo}`);
      console.log(`  ✗ corrida ${i}: EXIT ${r.codigo} — ver salida`);
      for (const { t, l } of r.lineas.slice(-12)) console.log(`      ${String(t).padStart(8)} | ${l}`);
      continue;
    }
    if (r.faltan.length) {
      ev.fallo(`corrida ${i}`, `fases sin marcador: ${r.faltan.join(", ")}`);
      console.log(`  ✗ corrida ${i}: no se reconocieron las fases ${r.faltan.join(", ")} — ¿cambió la salida de Next?`);
      continue;
    }

    const man = leeManifiesto();
    const rutas = rutasEmitidas(man);
    const familias = Object.fromEntries([...familiasEmitidas(man)].sort());
    corridas.push({ n: i, ...r, lineas: undefined, rutas: rutas.length, rutasNext: r.rutasNext, familias });
    ev.ok();

    const f = r.fases;
    console.log(
      `  ✓ corrida ${i}: TOTAL ${r.total.toFixed(2)} s · ${rutas.length} rutas` +
        `   [arranque ${f.arranque} · compila ${f.compilacion} · tsc ${f.typescript} · datos ${f.datos} · GENERA ${f.generacion} · cierre ${f.cierre}]`,
    );
  }
} finally {
  if (EXTRA) {
    const borradas = await limpia();
    const despues = await censo();
    sobrantes =
      despues["entradas-blog"] - antes["entradas-blog"] + (despues.slugs - antes.slugs);
    console.log(
      `\n  · limpieza: ${borradas} borradas · entradas-blog ${despues["entradas-blog"]} (era ${antes["entradas-blog"]})` +
        ` · slugs ${despues.slugs} (era ${antes.slugs})`,
    );
    if (sobrantes !== 0)
      console.error(
        `\n❌ LA DB NO VOLVIÓ A SU ESTADO: sobran ${sobrantes} fila(s).\n` +
          `   Toda congelada de otra sonda tomada a partir de ahora mide OTRA población\n` +
          `   y nada lo diría. Bórralas antes de seguir: slug LIKE '${PREFIJO}%'.`,
      );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL INFORME
 * ═════════════════════════════════════════════════════════════════════════ */
const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : +((s[s.length / 2 - 1] + s[s.length / 2]) / 2).toFixed(3);
};

let resumen = null;
if (corridas.length) {
  const claves = MARCADORES.map((m) => m.fase);
  resumen = {
    rutas: corridas[0].rutas,
    total: {
      min: Math.min(...corridas.map((c) => c.total)),
      mediana: mediana(corridas.map((c) => c.total)),
      max: Math.max(...corridas.map((c) => c.total)),
    },
    fases: Object.fromEntries(
      claves.map((k) => [
        k,
        {
          mediana: mediana(corridas.map((c) => c.fases[k])),
          min: Math.min(...corridas.map((c) => c.fases[k])),
          max: Math.max(...corridas.map((c) => c.fases[k])),
        },
      ]),
    ),
  };
  resumen.fijo = +(resumen.total.mediana - resumen.fases[FASE_ESCALA].mediana).toFixed(3);
  resumen.porRuta = +(resumen.fases[FASE_ESCALA].mediana / resumen.rutas).toFixed(4);

  console.log(`\n  RESUMEN · ${resumen.rutas} rutas · mediana de ${corridas.length} corrida(s)`);
  console.log(`    TOTAL           ${resumen.total.mediana.toFixed(2)} s   (min ${resumen.total.min.toFixed(2)} · max ${resumen.total.max.toFixed(2)})`);
  for (const m of MARCADORES) {
    const r = resumen.fases[m.fase];
    const marca = m.fase === FASE_ESCALA ? " ←escala" : "";
    console.log(`    ${m.fase.padEnd(12)}${String(r.mediana.toFixed(2)).padStart(7)} s   (${r.min.toFixed(2)}–${r.max.toFixed(2)})  ${m.que}${marca}`);
  }
  console.log(`\n    coste FIJO (todo menos ${FASE_ESCALA}) ....... ${resumen.fijo.toFixed(2)} s`);
  console.log(`    coste de ${FASE_ESCALA} por ruta ......... ${resumen.porRuta.toFixed(3)} s/ruta`);
  console.log(
    `\n    ⚠ ${resumen.porRuta.toFixed(3)} s/ruta es la MEDIA de esta población, no la pendiente.\n` +
      `      La pendiente exige un segundo punto: \`CORRIDAS=1 EXTRA=<n> npm run qa:a-sp13\`.`,
  );
}

const salida = {
  meta: {
    sonda: "a-sp13",
    que: "coste del rebuild por fases; la fase que escala con el nº de rutas se aísla",
    fecha: hoy(),
    config: CONFIG,
    corridas: CORRIDAS,
    extraSinteticas: EXTRA,
    poblacion: EXTRA ? `REAL + ${EXTRA} clones sintéticos de "${clonadaDe}"` : "REAL (la sembrada por cms:seed)",
    alcance:
      "Un tiempo es propiedad de ESTA máquina, ESTA fecha y ESTA configuración. " +
      "Ninguna cifra de aquí se cita sin `meta.config` al lado.",
  },
  resumen,
  corridas,
  dbRestaurada: EXTRA ? sobrantes === 0 : null,
};

w(EXTRA ? `medidas/a-sp13-sintetico-${EXTRA}.json` : `medidas/a-sp13-${MODO}.json`, salida);

const fallos = ev.informe();
process.exitCode = fallos || sobrantes !== 0 ? 1 : 0;
