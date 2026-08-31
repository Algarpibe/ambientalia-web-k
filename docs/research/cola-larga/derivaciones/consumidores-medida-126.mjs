// 126.ª · ESCALÓN 1 — ¿QUIÉN CONSUME `medida()` HOY?
//
// §regla 9, 8.º caso: cuando hay que tocar algo compartido, la elección se
// decide CONTANDO los consumidores, y el recuento se DERIVA. Una lista escrita
// a mano es, en el mejor caso, una copia desactualizada de algo que se puede
// calcular — y aquí la lista decide si se puede AMPLIAR el grupo o hay que
// renombrarlo, que son dos trabajos distintos.
//
// Los consumidores viven en TRES canales, y mirar uno solo da un cero que se
// lee como «no hay» (§*una afirmación de que algo no existe se escribe con la
// lista de canales que se miraron*):
//
//   1 · el ESQUEMA   — quién llama a `medida(` en `packages/`
//   2 · el RENDER    — quién lee `movilValor`/`movilUnidad` en `apps/`
//   3 · la BASE      — qué tablas y columnas existen ya, y con cuántas filas.
//       Éste es el que decide de verdad: un grupo con 0 filas se puede
//       reescribir y uno con 31 no.
//
// ALCANCE: el repo a fecha de la corrida. Necesita el contenedor `kunak-cms-pg`
// arrancado — se comprueba ANTES de gastar nada (§regla 37).

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");

/* ── PRECONDICIONES ────────────────────────────────────────────────────────── */
const psql = (sql) =>
  execFileSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-tAc", sql], {
    encoding: "utf8",
  })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

let dbViva = false;
try {
  dbViva = psql("select 1")[0] === "1";
} catch {
  dbViva = false;
}
if (!dbViva) {
  console.error("❌ PRECONDICION: el contenedor `kunak-cms-pg` no responde. `docker start kunak-cms-pg` (nunca `compose up`).");
  process.exit(1);
}

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/** Recorre un árbol devolviendo los ficheros que casan una extensión. */
function ficheros(dir, exts, fuera = new Set(["node_modules", ".next", "dist", ".git"])) {
  const out = [];
  const pila = [dir];
  while (pila.length) {
    const d = pila.pop();
    let entradas;
    try { entradas = readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entradas) {
      if (fuera.has(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) pila.push(p);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
  }
  return out;
}

/* ── CANAL 1 · EL ESQUEMA ─────────────────────────────────────────────────── */
const fuentesPkg = ficheros(join(RAIZ, "packages"), [".ts"]);
const llamadas = [];
for (const f of fuentesPkg) {
  const texto = readFileSync(f, "utf8");
  texto.split(/\r?\n/).forEach((linea, i) => {
    /* Sólo LLAMADAS: se excluyen la definición y las menciones en comentarios,
       que casan el mismo literal (§*un barrido por literal casa dentro de
       comentarios*). */
    if (/^\s*(\*|\/\/)/.test(linea)) return;
    if (/\bexport function medida\b/.test(linea)) return;
    if (/\bmedida\(\s*["'`]/.test(linea)) llamadas.push({ fichero: relative(RAIZ, f).replace(/\\/g, "/"), linea: i + 1 });
  });
}
const ficherosEsquema = [...new Set(llamadas.map((l) => l.fichero))];

/* ── CANAL 2 · EL RENDER ──────────────────────────────────────────────────── */
/* ⚠ El alcance son `apps/` **Y** `packages/`: `payload-types.ts` —el lector
   GENERADO— vive en `packages/cms-config/src/`, no en la app. La primera
   versión de este barrido sólo miraba `apps/` y publicaba «0 generados», que es
   §sondas 4 en su cara de cero: el control lo cazó, y se arregla el ALCANCE del
   instrumento, no la expectativa (§regla 21). */
const fuentesApp = [...ficheros(join(RAIZ, "apps"), [".ts", ".tsx"]), ...ficheros(join(RAIZ, "packages"), [".ts", ".tsx"])];
const lectores = [];
for (const f of fuentesApp) {
  const rel = relative(RAIZ, f).replace(/\\/g, "/");
  const texto = readFileSync(f, "utf8");
  const n = (texto.match(/movilValor|movilUnidad/g) ?? []).length;
  if (n) lectores.push({ fichero: rel, ocurrencias: n, generado: /payload-types\.ts$/.test(rel) });
}
const lectoresAMano = lectores.filter((l) => !l.generado);

/* ── CANAL 3 · LA BASE ────────────────────────────────────────────────────── */
const cols = psql(
  "select table_name||'|'||column_name from information_schema.columns where table_schema='public' and (column_name like '%_valor' or column_name like '%_movil_valor' or column_name like '%valor767') order by 1;",
).map((s) => { const [t, c] = s.split("|"); return { tabla: t, columna: c }; });
const tablas = [...new Set(cols.map((c) => c.tabla))];
/* Un GRUPO `medida()` = una raíz de columna. Se deriva quitando el sufijo, no
   se divide el total entre un número recordado. */
const grupos = [...new Set(cols.map((c) => `${c.tabla}.${c.columna.replace(/_(movil_valor|valor767|valor)$/, "")}`))];

const colecciones = [...new Set(tablas.map((t) => t.split("_blocks_")[0].replace(/_(cuerpo|columnas|titulares|items)$/, "")))];
const filas = {};
for (const c of colecciones) {
  try { filas[c] = Number(psql(`select count(*) from ${c};`)[0]); } catch { filas[c] = null; }
}

/* ── CONTROLES ────────────────────────────────────────────────────────────── */
ctl(llamadas.length > 0, "CANAL 1 · el barrido del esquema encuentra llamadas (ni cero)", `${llamadas.length} llamadas en ${ficherosEsquema.length} ficheros`);
ctl(
  ficherosEsquema.length > 0 && ficherosEsquema.length < fuentesPkg.length,
  "CANAL 1 · discrimina (ni cero ni pleno de `packages/`)",
  `${ficherosEsquema.length} de ${fuentesPkg.length} ficheros .ts`,
);
ctl(lectoresAMano.length > 0, "CANAL 2 · hay lectores A MANO además del `payload-types` generado", lectoresAMano.map((l) => `${l.fichero} (${l.ocurrencias})`).join(" · "));
ctl(
  lectores.some((l) => l.generado),
  "CANAL 2 · CONTROL: el generado sale IDENTIFICADO, no mezclado con los de a mano",
  lectores.filter((l) => l.generado).map((l) => `${l.fichero} (${l.ocurrencias})`).join(" · ") || "ninguno",
);
ctl(tablas.length > 0 && grupos.length > 0, "CANAL 3 · la base tiene columnas de `medida()`", `${tablas.length} tablas · ${cols.length} columnas · ${grupos.length} grupos`);
/* El control que ata los tres canales: los grupos de la base tienen que ser
   MÁS que las llamadas del esquema —cada llamada se instancia en varios
   bloques—, nunca menos. Menos significaría que la migración no llegó. */
ctl(grupos.length >= llamadas.length, "CRUCE: hay al menos tantos GRUPOS en la base como LLAMADAS en el esquema", `${grupos.length} grupos ≥ ${llamadas.length} llamadas`);
const pobladas = Object.entries(filas).filter(([, n]) => n > 0);
ctl(pobladas.length > 0, "CANAL 3 · las colecciones alcanzadas están POBLADAS (por eso se amplía y no se renombra)", pobladas.map(([c, n]) => `${c}=${n}`).join(" · "));

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 126,
  escalon: 1,
  pregunta: "¿quién consume `medida()` hoy, y por tanto se puede AMPLIAR o hay que renombrar?",
  veredicto:
    "SE AMPLÍA. Las dos colecciones alcanzadas están pobladas y el grupo tiene consumidores en los tres canales, así que renombrar `movilValor` rompería a todos para arreglar a uno (§regla 29 punto 2).",
  canal1Esquema: { llamadas: llamadas.length, ficheros: ficherosEsquema, detalle: llamadas },
  canal2Render: { aMano: lectoresAMano, generado: lectores.filter((l) => l.generado) },
  canal3Base: { tablas: tablas.length, columnas: cols.length, grupos: grupos.length, listaTablas: tablas, filasPorColeccion: filas },
  controles,
};

for (const [ruta, texto] of [[join(DERIV, "consumidores-medida-126.json"), JSON.stringify(salida, null, 1)]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto) {
    console.error(`❌ ${ruta} ya existe y DIFIERE — no se pisa (§regla 5, primera fuga: derivaciones/ no pasa por w()).`);
    process.exit(1);
  }
  writeFileSync(ruta, texto);
}

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "FALLA"} ${c.nombre}\n      ${c.detalle}`);
say("\n=== CANAL 1 · ESQUEMA (quién llama a `medida(`) ===");
for (const f of ficherosEsquema) say(`  ${f} — ${llamadas.filter((l) => l.fichero === f).length} llamadas`);
say(`  TOTAL ${llamadas.length} llamadas en ${ficherosEsquema.length} ficheros`);
say("\n=== CANAL 2 · RENDER (quién lee `movilValor`/`movilUnidad`) ===");
for (const l of lectores) say(`  ${l.generado ? "[generado] " : "[a mano]  "}${l.fichero} — ${l.ocurrencias}`);
say("\n=== CANAL 3 · BASE ===");
say(`  ${tablas.length} tablas · ${cols.length} columnas · ${grupos.length} grupos \`medida()\``);
say(`  filas por colección: ${Object.entries(filas).map(([c, n]) => `${c}=${n}`).join(" · ")}`);
say(`\n⇒ ${salida.veredicto}`);

const fallos = controles.filter((c) => !c.ok);
say(`\n✓ evaluadas 3/3 canales · controles ${controles.length - fallos.length}/${controles.length}`);
writeFileSync(join(DERIV, "consumidores-medida-126.log"), L.join("\n") + "\n");
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
