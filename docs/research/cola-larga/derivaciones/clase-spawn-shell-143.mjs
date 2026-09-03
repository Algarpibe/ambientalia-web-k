/**
 * 143.ª · PASO 0 §3 — EL CARDINAL DE LA CLASE, DERIVADO Y HACIA ATRÁS
 * ═══════════════════════════════════════════════════════════════════
 *
 * §regla 42 (corregida el 2026-09-01): «las instancias que descubren una clase
 * son las que alguien tenía delante, no las que hay». El encargo veía CINCO.
 * Este barrido no las comprueba: las DERIVA del árbol entero.
 *
 * ⚠ **v2 — la v1 publicó 11 sitios con `shell:true` y DOS eran COMENTARIOS**
 * (`programada.mjs:202`, que documenta la clase YA arreglada). Es el falso
 * positivo que `CLAUDE.md` §regla 9 nombra: *un barrido por literal casa dentro
 * de comentarios*, y aquí es peor que de costumbre porque **el comentario
 * describe el defecto**, así que su texto contiene el patrón exacto. La v2
 * despoja comentarios y cadenas ANTES de buscar, y publica el cardinal de lo
 * despojado como control (si fuera 0, el despojo no está ocurriendo).
 *
 * LA CLASE, con sus tres componentes NOMBRADOS por separado porque no todos
 * los sitios los tienen todos, y el veredicto depende de cuáles:
 *
 *   (S) `shell: true`      → el hijo real es `cmd.exe`, no el proceso que crees
 *   (K) alguien le hace `kill()` → mata el shell, el nieto sobrevive
 *   (I) `stdio: "ignore"`  → entierra stderr, o sea el aviso y el fallo
 *
 * SÓLO (S)+(K) produce el defecto de B1 (puerto tomado por un huérfano).
 * (S)+(I) o (I) solo produce el defecto de OCULTACIÓN: un fallo que no se ve.
 * (S) en un proceso de vida corta que se espera con `on("exit")`/`spawnSync`
 * NO ejerce la clase — y decirlo con su cardinal es lo que impide inflarla
 * (§regla 25: lo que ALCANZA y lo que ADMITE DE MÁS son dos números).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function* recorre(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      /* `.tmp` son bundles generados; `node_modules` y los `.next` no son fuente */
      if (/^(node_modules|\.next|\.next-.*|\.git|dist|media-corpus|\.tmp)$/.test(e.name)) continue;
      yield* recorre(p);
    } else if (/\.(mjs|js|ts|tsx)$/.test(e.name)) yield p;
  }
}

/* ── DESPOJO: comentarios y cadenas a espacios, CONSERVANDO los saltos de línea
 * para que los números de línea sigan valiendo. Devuelve también el cardinal de
 * caracteres despojados, que es el control de que el despojo ocurre. */
function despoja(src) {
  let out = "", i = 0, n = 0;
  const blanco = (s) => s.replace(/[^\n]/g, " ");
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") {
      let j = src.indexOf("\n", i); if (j < 0) j = src.length;
      out += blanco(src.slice(i, j)); n += j - i; i = j;
    } else if (c === "/" && d === "*") {
      let j = src.indexOf("*/", i + 2); j = j < 0 ? src.length : j + 2;
      out += blanco(src.slice(i, j)); n += j - i; i = j;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length) { if (src[j] === "\\") j += 2; else if (src[j] === c) { j++; break; } else j++; }
      /* la cadena se conserva VACÍA pero con sus comillas, para no romper sintaxis */
      out += c + blanco(src.slice(i + 1, j - 1)) + (src[j - 1] === c ? c : ""); n += j - i - 2; i = j;
    } else { out += c; i++; }
  }
  return { limpio: out, despojados: n };
}

const ficheros = [...recorre(RAIZ)];

/* corta la llamada por ESTRUCTURA (paréntesis casados) sobre el fuente DESPOJADO,
 * §regla 8b tercera mitad: lo que delimita código es la estructura, no la prosa */
function llamadas(src, fn) {
  const out = [];
  /* `\B\.` delante lo descarta: `.exec()` de un regex no es `child_process.exec` */
  const re = new RegExp(`(^|[^.\\w])${fn}\\s*\\(`, "g");
  let m;
  while ((m = re.exec(src))) {
    const ini = m.index + m[1].length;
    let i = ini + fn.length, prof = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === "(") prof++;
      else if (c === ")") { prof--; if (prof === 0) { i++; break; } }
      i++;
    }
    out.push({ ini, fin: i, texto: src.slice(ini, i) });
  }
  return out;
}

const sitios = [];
let despojadosTotal = 0;
for (const f of ficheros) {
  const bruto = fs.readFileSync(f, "utf8");
  if (!/\bspawn\b|\bfork\b/.test(bruto)) continue;
  const { limpio, despojados } = despoja(bruto);
  despojadosTotal += despojados;
  for (const fn of ["spawn", "spawnSync", "execFile", "execFileSync", "fork"]) {
    for (const ll of llamadas(limpio, fn)) {
      const linea = limpio.slice(0, ll.ini).split("\n").length;
      /* las OPCIONES se leen del bruto en el mismo rango: el despojo vació las
       * cadenas, y `stdio: "ignore"` es una cadena */
      const crudo = bruto.slice(ll.ini, ll.fin);
      const S = /shell\s*:\s*true/.test(crudo);
      const I = /stdio\s*:\s*["']ignore["']/.test(crudo);
      const antes = limpio.slice(Math.max(0, ll.ini - 200), ll.ini);
      const asig = antes.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?$/) || antes.match(/(\w+)\s*=\s*$/);
      const variable = asig ? asig[1] : null;
      let K = false;
      if (variable) {
        if (new RegExp(`\\b${variable}\\s*\\.kill\\s*\\(`).test(limpio)) K = true;
        else {
          const reA = new RegExp(`(?:const|let)\\s+(\\w+)\\s*=\\s*${variable}\\s*;`, "g");
          let ma;
          while ((ma = reA.exec(limpio))) if (new RegExp(`\\b${ma[1]}\\s*\\.kill\\s*\\(`).test(limpio)) K = true;
        }
      }
      const esperado = /Sync$/.test(fn) ||
        (variable ? new RegExp(`\\b${variable}\\s*\\.on(?:ce)?\\s*\\(\\s*["'](close|exit)["']`).test(limpio) : false);
      sitios.push({ rel: path.relative(RAIZ, f).replace(/\\/g, "/"), linea, fn, variable, S, K, I, esperado });
    }
  }
}

for (const s of sitios) {
  if (s.S && s.K) s.veredicto = s.I ? "CLASE-PLENA (S+K+I)" : "CLASE-KILL (S+K)";
  else if (s.S && s.I) s.veredicto = "CLASE-MUDA (S+I) — sin kill, stderr enterrado";
  else if (s.S) s.veredicto = "ALCANZADO (S) sin ejercer";
  else if (s.I && !s.esperado) s.veredicto = "MUDO (I) sin shell — no hay nieto, pero stderr enterrado";
  else s.veredicto = "FUERA-DE-ALCANCE";
}

const conShell = sitios.filter((s) => s.S);
const resumen = {
  ficherosBarridos: ficheros.length,
  caracteresDespojados: despojadosTotal,
  llamadasHalladas: sitios.length,
  conShellTrue: conShell.length,
  CLASE_PLENA: sitios.filter((s) => s.veredicto.startsWith("CLASE-PLENA")).length,
  CLASE_KILL: sitios.filter((s) => s.veredicto.startsWith("CLASE-KILL")).length,
  CLASE_MUDA: sitios.filter((s) => s.veredicto.startsWith("CLASE-MUDA")).length,
  ALCANZADO_sin_ejercer: sitios.filter((s) => s.veredicto.startsWith("ALCANZADO")).length,
  MUDO_sin_shell: sitios.filter((s) => s.veredicto.startsWith("MUDO")).length,
  FUERA: sitios.filter((s) => s.veredicto.startsWith("FUERA")).length,
};

/* ── CONTROL, y por LAS DOS POLARIDADES (§regla 28d) ────────────────────────
 * T1 · un sitio que SABEMOS que ejerce → tiene que salir CLASE-*
 * T2 · un sitio que SABEMOS que YA SE ARREGLÓ (`publicar.mjs:73`, cuyo propio
 *      comentario documenta el arreglo) → tiene que salir SIN shell:true.
 *      Sin T2 un detector que sólo supiera decir «todo es la clase» pasaría.
 * T3 · el despojo ocurre, y su CASO CONOCIDO es la LÍNEA 202 de `programada.mjs`
 *      —el comentario que documenta la clase ya arreglada, que la v1 contó como
 *      código—. NO vale exigir «cero shell en ese fichero»: su `:180` es un
 *      `spawnSync` legítimo, y confundir el fichero con la línea es §*la causa
 *      común* con el contenedor puesto en el propio control.
 * T4 · y el testigo POSITIVO del despojo, que separa «funciona» de «no encuentra
 *      nada»: `programada.mjs:180` SÍ tiene que seguir saliendo con shell:true. */
const t1 = sitios.find((s) => s.rel.endsWith("publicar/publicador.mjs") && s.linea === 222);
const t2 = sitios.find((s) => s.rel.endsWith("qa/publicar.mjs") && s.linea === 73);
const t3 = sitios.find((s) => s.rel.endsWith("qa/programada.mjs") && s.linea === 202);
const t4 = sitios.find((s) => s.rel.endsWith("qa/programada.mjs") && s.linea === 180);
const control = {
  T1_publicador222_ejerce: t1 ? { ok: t1.veredicto.startsWith("CLASE"), veredicto: t1.veredicto } : { ok: false, motivo: "no hallado" },
  T2_publicar73_ya_arreglado: t2 ? { ok: t2.S === false, S: t2.S, veredicto: t2.veredicto } : { ok: false, motivo: "no hallado" },
  T3_comentario_202_despojado: { ok: despojadosTotal > 0 && !t3, caracteresDespojados: despojadosTotal, halladoEn202: !!t3 },
  T4_codigo_180_sobrevive: t4 ? { ok: t4.S === true, S: t4.S } : { ok: false, motivo: "el despojo se llevó código real" },
};
control.vale = control.T1_publicador222_ejerce.ok && control.T2_publicar73_ya_arreglado.ok && control.T3_comentario_202_despojado.ok && control.T4_codigo_180_sobrevive.ok;

const salida = { fecha: new Date().toISOString(), resumen, control, sitios: sitios.sort((a, b) => a.rel.localeCompare(b.rel) || a.linea - b.linea) };
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "clase-spawn-shell-143.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2));

console.log("═══ CLASE spawn+shell:true — barrido ENTERO, v2 (despojando comentarios) ═══");
console.log(JSON.stringify(resumen, null, 2));
console.log("\n── CONTROL (tres testigos, dos polaridades) ──");
console.log(JSON.stringify(control, null, 2));
console.log("\n── SITIOS QUE EJERCEN O SILENCIAN ──");
for (const s of sitios.filter((x) => !x.veredicto.startsWith("FUERA")))
  console.log(`  ${s.rel}:${s.linea}  ${s.fn}(${s.variable ?? "—"})  S=${s.S} K=${s.K} I=${s.I} esperado=${s.esperado}\n      → ${s.veredicto}`);
console.log(`\ncongelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
if (!control.vale) { console.log("\n⛔ EL CONTROL NO PASA — el reparto no vale"); process.exit(1); }
