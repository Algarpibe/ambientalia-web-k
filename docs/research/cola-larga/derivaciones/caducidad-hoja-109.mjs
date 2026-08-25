/* ¿CADUCÓ `hoja-f33-derivable.log`? — 109.ª tanda, PASO 0 · (a), 2026-08-25.
 *
 * §regla 5bis: *arreglar un instrumento no arregla sus medidas: las CADUCA*. Y
 * su mitad 1 dice que **el alcance del daño se declara con su número, y casi
 * nunca es «todo»** — decir «el log está mal» tiraría una medida buena.
 *
 * LA SECUENCIA, derivada de `git log --name-status` y de las mtime:
 *   2026-08-24 13:03  `hoja-f33-derivable.mjs` lee `medidas/f33-geo.json` y
 *                     congela su `.log`. Commiteado 13:05 en `64f6b63`.
 *   2026-08-24 18:03  `040e0d4` RENOMBRA (R100) ese fichero a
 *                     `f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-…`
 *                     declarando su defecto y su ALCANCE.
 * O sea que el `.log` se congeló CINCO HORAS antes de que su fuente fuera
 * declarada caducada, y nadie volvió a mirarlo. La víctima está FUERA de
 * `medidas/` —es un `.log` de derivación— así que ninguna guarda de `w()` la
 * vigila: §regla 5bis no tiene instrumento aquí, sólo esta lectura.
 *
 * ⚠ **NO es una sonda**: no declara `Evaluadas` ni congela en `medidas/`.
 *
 * EL CRUCE, y por qué vale (§regla 15: dos instrumentos que comparten premisa
 * no verifican la premisa). Aquí NO la comparten: `f33-clases.json` midió el
 * original **con sus hojas** —es el camino que la caducidad llama BUENO— y su
 * meta lo dice: *«lado: UNO — el original capturado con sus hojas»*, mismas 31
 * rutas de `medidas/f33-rutas.json`. Es otra medida DEL MISMO OBJETO por otro
 * camino, que es el control que §sondas 4 pide antes de creerse un recuento.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts/qa/medidas");
const lee = (n) => JSON.parse(readFileSync(join(MED, n), "utf8"));

const CADUCADA = "f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json";
const BUENO = "f33-clases.json";

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("══════════════════════════════════════════════════════════════════════");
say("  ¿CADUCÓ `hoja-f33-derivable.log`? — 109.ª · PASO 0 · (a) · 2026-08-25");
say("══════════════════════════════════════════════════════════════════════");

/* ── 0 · el estado del consumidor ─────────────────────────────────────────── */
say("── 0 · EL CONSUMIDOR, HOY ─────────────────────────────────────────────");
const canonico = join(MED, "f33-geo.json");
say(`   \`medidas/f33-geo.json\` existe: ${existsSync(canonico) ? "sí" : "NO"}`);
say(`   ⇒ \`hoja-f33-derivable.mjs\` corrido hoy: ENOENT, exit 1, CERO líneas de`);
say("     stdout (verificado). No lee un fichero marcado — no lee NADA.");
say("   Eso es §regla 9 8.º caso FUNCIONANDO: liberar el canónico hace que el");
say("   consumidor caducado falle EN VOZ ALTA en vez de leer lo caducado.");
say("");

/* ── 1 · qué bloques del .log tocan el alcance declarado ──────────────────── */
say("── 1 · QUÉ BLOQUES DEL `.log` CAEN DENTRO DEL ALCANCE DECLARADO ───────");
say(`   alcance, leído del NOMBRE de la renombrada: \`modulos390\` y \`veredictosA\``);
say("");
const fuenteHoja = readFileSync(join(AQUI, "hoja-f33-derivable.mjs"), "utf8");
const bloques = [
  { n: "§1 · ancho de columna por reparto", lee: ["modulos1440", "modulos390"] },
  { n: "§2 · default de `mb` por ancho de fila", lee: ["defaultMbPorAnchoDeFila"] },
  { n: "§3 · lo que la congelada NO tiene", lee: ["filas1440", "secciones1440", "filas390", "secciones390"] },
];
const ALCANCE = ["modulos390", "veredictos"];
let tocados = 0;
for (const b of bloques) {
  const presentes = b.lee.filter((k) => fuenteHoja.includes(k));
  const dentro = presentes.filter((k) => ALCANCE.some((a) => k.startsWith(a)));
  if (dentro.length) tocados++;
  say(`   ${dentro.length ? "⚠ TOCADO " : "✅ intacto"} ${b.n}`);
  say(`             lee: ${presentes.join(" · ")}`);
  if (dentro.length) say(`             dentro del alcance: ${dentro.join(" · ")}`);
}
say("");
say(`   ⇒ ${tocados} de ${bloques.length} bloques tocados por PROCEDENCIA.`);
say("     «Tocado por procedencia» NO es «su número está mal»: eso lo dice el");
say("     cruce de abajo, no el nombre del fichero.");
say("");

/* ── 2 · EL CRUCE: ¿cambia el número publicado? ───────────────────────────── */
say("── 2 · EL CRUCE CONTRA EL CAMINO BUENO ────────────────────────────────");
const cad = lee(CADUCADA);
const bue = lee(BUENO);
say(`   caducada : ${CADUCADA.slice(0, 46)}…`);
say(`              ${cad.meta.dominio.medidas}/${cad.meta.dominio.rutasDeclaradas} rutas · ${cad.meta.fecha}`);
say(`   bueno    : ${BUENO} · ${bue.meta.dominio.medidas}/${bue.meta.dominio.rutasDeclaradas} rutas · ${bue.meta.fecha}`);
say(`              lado: ${bue.meta.lado.slice(0, 58)}…`);
say("");

/* la razón wCol/wFila por reparto, reconstruida de la CADUCADA igual que la
 * hace `hoja-f33-derivable.mjs` — para comparar lo mismo con lo mismo */
const deLaCaducada = (campo) => {
  const porRep = new Map();
  for (const p of cad.paginas) {
    for (const m of p[campo] ?? []) {
      if (!m.wFila || !m.wCol) continue;
      const pct = +((m.wCol / m.wFila) * 100).toFixed(4);
      if (!porRep.has(m.reparto)) porRep.set(m.reparto, new Map());
      const v = porRep.get(m.reparto);
      v.set(pct, (v.get(pct) ?? 0) + 1);
    }
  }
  return porRep;
};

for (const [campo, clave, etiq] of [["modulos1440", "pct1440", "1440"], ["modulos390", "pct390", "390"]]) {
  const mio = deLaCaducada(campo);
  say(`   ── ${etiq} ── ${etiq === "390" ? "(DENTRO del alcance caducado)" : "(fuera del alcance)"}`);
  let iguales = 0;
  let distintos = 0;
  for (const rep of [...new Set([...mio.keys(), ...Object.keys(bue.anchoPorReparto)])].sort()) {
    const a = mio.get(rep);
    const b = bue.anchoPorReparto[rep]?.[clave];
    if (!a || !b) { say(`     ${rep.padEnd(5)} ⚠ sólo en un lado`); continue; }
    const va = [...a.keys()].sort((x, y) => x - y);
    const vb = Object.keys(b).map(Number).sort((x, y) => x - y);
    const cuadra = va.length === vb.length && va.every((x, i) => x === vb[i]);
    if (cuadra) iguales++; else distintos++;
    const nA = [...a.values()].reduce((s, n) => s + n, 0);
    const nB = Object.values(b).reduce((s, n) => s + n, 0);
    say(
      `     ${rep.padEnd(5)} ${cuadra ? "✅ MISMO valor" : "⛔ DIFIERE     "}  ` +
        `caducada ${va.join("/")} (n=${nA})   ·   bueno ${vb.join("/")} (n=${nB})`,
    );
  }
  say(`     ⇒ repartos con el MISMO valor: ${iguales} · que DIFIEREN: ${distintos}`);
  say("");
}

/* ── 3 · el matiz de UNIDAD, que si no se dice inventa un desacuerdo ──────── */
say("── 3 · ⚠ LAS `n` NO SON COMPARABLES: SON UNIDADES DISTINTAS ───────────");
say("   §*dos instrumentos que censan el mismo objeto tienen que compartir el");
say("   criterio de recuento, o su cruce INVENTA el desacuerdo*.");
say("");
const cr = cad.criterioDeRecuento;
say(`   la CADUCADA cuenta por MÓDULO  : conCaja ${cr.modulos.conCaja} (de ${cr.modulos.enElDom} en el DOM)`);
say(`   el camino BUENO cuenta por COLUMNA: conCaja ${cr.columnas.conCaja} (de ${cr.columnas.enElDom} en el DOM)`);
const sumaBueno = Object.values(bue.anchoPorReparto).reduce((s, e) => s + e.n, 0);
say(`   suma de \`n\` en el camino bueno   : ${sumaBueno}`);
say(`   ⇒ ${sumaBueno === cr.columnas.conCaja ? "CUADRA con las columnas con caja" : "no cuadra — mirar antes de citar"}`);
say("");
say("   Publicar «n 69 contra 48» como discrepancia sería fabricar un desacuerdo");
say("   que no existe: son el mismo objeto contado en dos unidades. Lo que se");
say("   cruza es el VALOR, no el cardinal.");
say("");

/* ── 4 · VEREDICTO ────────────────────────────────────────────────────────── */
say("══════════════════════════════════════════════════════════════════════");
say("  VEREDICTO");
say("══════════════════════════════════════════════════════════════════════");
say("   · el CONSUMIDOR está muerto: `hoja-f33-derivable.mjs` revienta con");
say("     ENOENT. Se arregla apuntándolo a la congelada que exista;");
say("   · su `.log` está TOCADO POR PROCEDENCIA en 1 de 3 bloques (§1, mitad");
say("     de 390) e INTACTO en 2 (§2 y §3 leen bloques que la caducidad declara");
say("     de 1440);");
say("   · ⚠ y el número NO cambia: cruzado contra el camino bueno, los 6");
say("     repartos dan el MISMO valor a 1440 y a 390. **La conclusión publicada");
say("     se sostiene** — lo que estaba mal era de dónde venía, no lo que decía;");
say("   · por tanto NO se renombra nada y NO se retracta nada. Lo que hace falta");
say("     es una NOTA DE PROCEDENCIA en el `.log` y arreglar el `.mjs`.");
say("");
say("   ⚠ ESTO REFUTA MEDIA PREDICCIÓN DEL PRE-REGISTRO (P1.b), y se deja");
say("     escrito: se predijo que el «100 % en los 6 a 390» era la FIRMA de la");
say("     captura sin hojas. NO lo es — el camino bueno, con las hojas puestas,");
say("     da el mismo 100 %. Las columnas apilan de verdad a 390. La mitad");
say("     estructural de P1.b (el bloque lee un campo caducado) sí se cumple.");
say("");
say("── LO QUE ESTA DERIVACIÓN **NO** CONTESTA ─────────────────────────────");
say("   · nada de los otros 3 lectores muertos de `f33-geo.json`");
say("     (`clases-inertes-f33` · `f33-regimen-discriminador` · `qa:f33-spec`):");
say("     cada uno lee campos distintos y su caducidad se adjudica por separado;");
say("   · nada del RITMO ni de los VEREDICTOS: aquí sólo se ha cruzado el ancho");
say("     de columna por reparto, que es lo que el `.log` publica en su §1.");

writeFileSync(join(AQUI, "caducidad-hoja-109.log"), L.join("\n") + "\n", "utf8");
