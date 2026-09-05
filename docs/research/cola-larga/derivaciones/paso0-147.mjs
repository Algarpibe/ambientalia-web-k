/**
 * PASO 0 de la 147.ª — EL TERRENO DE LA ENTREGA, DERIVADO.
 *
 * El encargo trae el terreno del VPS medido A MANO por el propietario y lo
 * marca como PREMISA A CONTRASTAR. Esto lo deriva por SSH y publica cada
 * premisa con su veredicto y CON SU UNIDAD, que es lo que §*cada denominador
 * se escribe CON SU UNIDAD* exige — «~3 GB» de RAM es cierto de lo USADO y
 * falso del TOTAL, y las dos lecturas se escriben igual.
 *
 * Y deriva además las dos propiedades del CANAL de entrega que deciden qué
 * puede comprobar el ESCALÓN 2:
 *
 *   · ¿declara el origen un TAMAÑO? — el encargo manda «comprobar el tamaño
 *     contra el que el origen declara», y eso presupone que lo declare;
 *   · ¿es el repositorio PÚBLICO? — el encargo manda derivar la autenticación
 *     de cada camino ANTES de correrlo.
 *
 * NO mide ninguno de los cuatro caminos: eso es el ESCALÓN 2, y se predice
 * antes en el ESCALÓN 1.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/paso0-147.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "paso0-147.json");

const HOST = "kunak-vps";
const REPO = "Algarpibe/ambientalia-web-k";
const TARBALL = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/main`;

const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();

/* Una sola sesión SSH: cada `ssh` cuesta un apretón de manos, y encadenarlas
 * mediría la latencia de la red tanto como el terreno. */
const ssh = (guion) =>
  execFileSync("ssh", ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", HOST, guion], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

const MiB = (b) => Number((b / 1048576).toFixed(2));

/* ── 1 · EL TERRENO DEL VPS ───────────────────────────────────────────────
 * Se pide en una sola pasada y en formato `clave=valor`, para que el parseo
 * no dependa del ancho de columna de `df` ni del idioma del sistema. */
const GUION_TERRENO = [
  'echo "hostname=$(hostname)"',
  'echo "kernel=$(uname -r)"',
  'echo "disco_total_kb=$(df -k / | awk \'NR==2{print $2}\')"',
  'echo "disco_usado_kb=$(df -k / | awk \'NR==2{print $3}\')"',
  'echo "disco_libre_kb=$(df -k / | awk \'NR==2{print $4}\')"',
  'echo "disco_pct=$(df -k / | awk \'NR==2{print $5}\')"',
  'echo "ram_total_mb=$(free -m | awk \'/^Mem:/{print $2}\')"',
  'echo "ram_usada_mb=$(free -m | awk \'/^Mem:/{print $3}\')"',
  'echo "ram_disponible_mb=$(free -m | awk \'/^Mem:/{print $7}\')"',
  'echo "nucleos=$(nproc)"',
  "echo \"load1=$(cut -d' ' -f1 /proc/loadavg)\"",
  'echo "uptime_dias=$(awk \'{printf "%d", $1/86400}\' /proc/uptime)"',
  'echo "dns_web=$(getent hosts web.ambientalia.cloud | awk \'{print $1}\' | head -1)"',
  'echo "proxy_http=$(curl -sI -o /dev/null -w %{http_code} http://127.0.0.1/ 2>/dev/null)"',
  'echo "reinicio_pendiente=$(test -f /var/run/reboot-required && echo si || echo no)"',
  // herramientas: se declara la AUSENCIA con su nombre, no se omite (§regla 14)
  'for t in curl wget git tar gzip docker; do printf "herr_%s=" "$t"; command -v "$t" >/dev/null 2>&1 && echo si || echo NO; done',
  'echo "tmp_libre_kb=$(df -k /tmp | awk \'NR==2{print $4}\')"',
].join("; ");

const crudo = ssh(GUION_TERRENO);
const vps = {};
for (const linea of crudo.split("\n")) {
  const i = linea.indexOf("=");
  if (i > 0) vps[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
}

const faltan = ["curl", "wget", "git", "tar", "gzip", "docker"].filter((t) => vps[`herr_${t}`] !== "si");

/* ── 2 · CONTRASTE con las premisas del encargo ───────────────────────────
 * El encargo publica seis cifras. Se contrastan una a una y se dice CUÁL no
 * coincide — un terreno vivo se mueve, y callarlo deja la premisa en pie. */
const discoTotalG = Number((Number(vps.disco_total_kb) / 1048576).toFixed(1));
const discoUsadoG = Number((Number(vps.disco_usado_kb) / 1048576).toFixed(1));
const discoLibreG = Number((Number(vps.disco_libre_kb) / 1048576).toFixed(1));
const cpuPct = Number(((Number(vps.load1) / Number(vps.nucleos)) * 100).toFixed(1));

const contraste = [
  {
    que: "disco total",
    premisaEncargo: "96G",
    derivado: `${discoTotalG}G`,
    coincide: Math.abs(discoTotalG - 96) < 1,
  },
  {
    que: "disco usado",
    premisaEncargo: "20G",
    derivado: `${discoUsadoG}G`,
    coincide: Math.abs(discoUsadoG - 20) < 1,
    nota: "terreno vivo: se mueve entre medidas",
  },
  {
    que: "disco libre",
    premisaEncargo: "77G",
    derivado: `${discoLibreG}G`,
    coincide: Math.abs(discoLibreG - 77) < 1,
  },
  {
    que: "disco % de uso",
    premisaEncargo: "21%",
    derivado: vps.disco_pct,
    coincide: vps.disco_pct === "21%",
  },
  {
    que: "CPU",
    premisaEncargo: "5 %",
    derivado: `${cpuPct} % (load1 ${vps.load1} sobre ${vps.nucleos} núcleos)`,
    coincide: null,
    nota: "la premisa no dice su denominador: 5 % de 1 núcleo y de 2 no son lo mismo",
  },
  {
    que: "RAM",
    premisaEncargo: "~3 GB",
    derivado: `total ${vps.ram_total_mb} MB · usada ${vps.ram_usada_mb} MB · disponible ${vps.ram_disponible_mb} MB`,
    coincide: null,
    nota: "«~3 GB» es cierto de lo USADO y falso del TOTAL — sin unidad, las dos lecturas se escriben igual",
  },
  {
    que: "DNS web.ambientalia.cloud",
    premisaEncargo: "72.60.166.93",
    derivado: vps.dns_web,
    coincide: vps.dns_web === "72.60.166.93",
  },
  {
    que: "el proxy responde",
    premisaEncargo: "301",
    derivado: vps.proxy_http,
    coincide: vps.proxy_http === "301",
    nota: "301 y 308 son los dos «redirección permanente» y NO son el mismo byte (§regla del 301/308)",
  },
];

/* ── 3 · EL CANAL DE ENTREGA ──────────────────────────────────────────────
 * Dos preguntas que deciden qué puede comprobar el ESCALÓN 2. Se contestan
 * SIN credenciales a propósito: si contestan, el repo es público. */
function cabeceras(url) {
  const txt = execFileSync("curl", ["-sIL", "--max-time", "40", url], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  const h = {};
  for (const l of txt.split("\n")) {
    const i = l.indexOf(":");
    if (i > 0) h[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
  }
  return h;
}

const cabApi = execFileSync(
  "curl",
  ["-s", "-o", process.platform === "win32" ? "NUL" : "/dev/null", "-w", "%{http_code}", `https://api.github.com/repos/${REPO}`],
  { encoding: "utf8" }
).trim();

const cab1 = cabeceras(TARBALL);
const cab2 = cabeceras(TARBALL);

const canal = {
  repoPublico: cabApi === "200",
  apiStatusSinCredenciales: cabApi,
  declaraContentLength: Object.prototype.hasOwnProperty.call(cab1, "content-length"),
  contentLength: cab1["content-length"] ?? null,
  declaraTransferEncoding: Object.prototype.hasOwnProperty.call(cab1, "transfer-encoding"),
  etag: cab1.etag ?? null,
  etagEstable: cab1.etag != null && cab1.etag === cab2.etag,
  contentType: cab1["content-type"] ?? null,
};

/* ── 4 · EL ÁRBOL LOCAL — el denominador de «¿está completo?» ─────────────
 * Un exit 0 de `tar` no dice qué hay detrás (§regla 61), así que el ESCALÓN 2
 * necesita un cardinal contra el que comparar. Se deriva aquí. */
const rutas = git("ls-tree", "-r", "HEAD", "--name-only").split("\n").filter(Boolean);
const arbol = {
  head: git("rev-parse", "HEAD"),
  ficherosVersionados: rutas.length,
  conNombreEscapado: rutas.filter((r) => r.startsWith('"')).length,
  packBytes: Number(execFileSync("git", ["count-objects", "-v", "-H"], { cwd: RAIZ, encoding: "utf8" })
    .split("\n")
    .find((l) => l.startsWith("size-pack:"))
    .replace("size-pack:", "")
    .trim()
    .replace(/ MiB$/, "") * 1048576),
};
arbol.packMiB = MiB(arbol.packBytes);

/* ── informe ──────────────────────────────────────────────────────────── */
const informe = {
  meta: {
    tanda: "147.ª",
    paso: "PASO 0 — el terreno de la ENTREGA",
    fecha: new Date().toISOString().slice(0, 10),
    contesta: "de qué tamaño es el terreno, si el repo es público, y qué declara el origen sobre el tamaño",
    noContesta:
      "ninguno de los cuatro caminos de entrega: eso es el ESCALÓN 2 y se predice antes en el ESCALÓN 1",
  },
  vps,
  contraste,
  canal,
  arbol,
  herramientasAusentes: faltan,
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log("═══ PASO 0 · 147.ª — EL TERRENO DE LA ENTREGA ═══\n");
console.log(`  host ${vps.hostname} · kernel ${vps.kernel} · up ${vps.uptime_dias} días`);
console.log(`  reinicio pendiente: ${vps.reinicio_pendiente}  (NO se toca: cambiaría el terreno bajo la medida)\n`);

console.log("── CONTRASTE con las premisas del encargo ──");
for (const c of contraste) {
  const v = c.coincide === true ? "✓" : c.coincide === false ? "✗" : "·";
  console.log(`  ${v} ${c.que}`);
  console.log(`      encargo:  ${c.premisaEncargo}`);
  console.log(`      derivado: ${c.derivado}`);
  if (c.nota) console.log(`      ⚠ ${c.nota}`);
}

console.log("\n── EL CANAL DE ENTREGA ──");
console.log(`  repositorio PÚBLICO: ${canal.repoPublico ? "SÍ" : "NO"}  (api sin credenciales → ${canal.apiStatusSinCredenciales})`);
console.log(`  ¿el origen declara content-length?  ${canal.declaraContentLength ? canal.contentLength : "NO — no declara ninguno"}`);
console.log(`  ¿declara transfer-encoding?         ${canal.declaraTransferEncoding ? "sí" : "NO"}`);
console.log(`  etag: ${canal.etag}`);
console.log(`  etag estable entre dos peticiones: ${canal.etagEstable ? "SÍ" : "NO"}`);

console.log("\n── EL ÁRBOL LOCAL (el denominador de «¿está completo?») ──");
console.log(`  HEAD ${arbol.head.slice(0, 7)} · ${arbol.ficherosVersionados} ficheros versionados` +
  ` (${arbol.conNombreEscapado} con nombre escapado) · pack ${arbol.packMiB} MiB`);

console.log("\n── HERRAMIENTAS EN EL VPS ──");
console.log(`  ausentes: ${faltan.length === 0 ? "ninguna" : faltan.join(", ")}`);

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA).replace(/\\/g, "/")}`);
console.log(`✓ evaluadas ${contraste.length}/8 premisas del encargo · ${Object.keys(vps).length} claves de terreno`);
