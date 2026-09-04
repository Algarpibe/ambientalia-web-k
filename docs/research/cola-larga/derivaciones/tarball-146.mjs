/**
 * 146.ª ESCALÓN 2 · P3 — ¿QUÉ HAY DE VERDAD EN EL TARBALL, Y LLEGA ENTERO?
 *
 * El PASO 0 derivó el camino de `public/` leyendo el `Dockerfile`, el
 * `docker-compose.yml` y `publicador.mjs`. Eso es la RECETA. §El principio
 * manda verificar contra **la salida servida**, así que esto va contra el
 * ARTEFACTO: se pide el tarball que Easypanel pediría y se mira qué llega.
 *
 * ⚠ LA SEPARADORA, que es toda la razón de esta medición: `gzip: unexpected
 * end of file` lo producen DOS causas distintas y con el mismo mensaje —
 *
 *   · el archivo está CORRUPTO EN ORIGEN → se reproduce siempre;
 *   · la TRANSFERENCIA se cortó → llega entero al reintentar.
 *
 * Sólo descargarlo y comprobar su integridad las separa. Y la diferencia
 * decide el reparto del ESCALÓN 3: si es lo segundo, encoger `public/` es un
 * arreglo por MAGNITUD y no por causa.
 *
 * No toca el VPS: pide a GitHub, que es lo mismo que Easypanel pide.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/tarball-146.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "tarball-146.json");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "tarball-146-"));

const git = (...a) => execFileSync("git", a, { cwd: RAIZ, encoding: "utf8" }).trim();
const MB = (b) => Number((b / 1048576).toFixed(2));

const remoto = git("remote", "get-url", "origin");
const repo = remoto.replace(/.*github\.com[:/]/, "").replace(/\.git$/, "");
const rama = git("rev-parse", "--abbrev-ref", "HEAD");
const head = git("rev-parse", "HEAD");

console.log("═══ 146.ª ESCALÓN 2 · P3 — EL TARBALL, CONTRA EL ARTEFACTO ═══\n");
console.log(`  repo ${repo} · rama ${rama} · HEAD ${head.slice(0, 7)}`);

/* ── la URL que Easypanel usa ─────────────────────────────────────────────*/
const url = `https://codeload.github.com/${repo}/tar.gz/refs/heads/${rama}`;
console.log(`  URL: ${url}\n`);

/* ── DOS INTENTOS, que es lo que separa las dos causas ────────────────────
 * Un solo intento no puede distinguir «corrupto» de «se cortó»: los dos dan
 * el mismo error. Dos intentos independientes sí — si uno llega entero, el
 * origen no está corrupto. */
const intentos = [];
for (const n of [1, 2]) {
  const dest = path.join(TMP, `intento-${n}.tar.gz`);
  const t0 = Date.now();
  const r = spawnSync(
    "curl",
    ["-sSL", "--max-time", "900", "-w", "%{http_code} %{size_download} %{speed_download}", "-o", dest, url],
    { encoding: "utf8" }
  );
  const segundos = Number(((Date.now() - t0) / 1000).toFixed(1));
  const [codigo, bytesDescargados, velocidad] = (r.stdout || "").trim().split(/\s+/);
  const bytes = fs.existsSync(dest) ? fs.statSync(dest).size : 0;

  /* ── LA COMPROBACIÓN DE INTEGRIDAD, que es el punto entero ──────────────
   * `gzip -t` equivalente en node: descomprimir del todo y ver si el flujo
   * termina limpio. Un archivo truncado tira `unexpected end of file`, que
   * es LITERALMENTE el error que el propietario vio. */
  let integro = null;
  let bytesDescomprimidos = 0;
  let errorGzip = null;
  if (bytes > 0) {
    try {
      const comprimido = fs.readFileSync(dest);
      const salida = zlib.gunzipSync(comprimido);
      bytesDescomprimidos = salida.length;
      integro = true;
    } catch (e) {
      integro = false;
      errorGzip = String(e.message).slice(0, 200);
    }
  }

  const res = {
    intento: n,
    httpCode: codigo ?? null,
    exitCurl: r.status,
    stderrCurl: (r.stderr || "").trim().slice(0, 200) || null,
    segundos,
    bytes,
    MiB: MB(bytes),
    velocidadBytesSeg: velocidad ? Number(velocidad) : null,
    integro,
    bytesDescomprimidos,
    MiBDescomprimidos: MB(bytesDescomprimidos),
    errorGzip,
  };
  intentos.push(res);
  console.log(
    `  intento ${n}: http=${res.httpCode} · ${res.MiB} MiB en ${res.segundos}s · ` +
      `íntegro=${res.integro} · descomprimido ${res.MiBDescomprimidos} MiB`
  );
  if (res.errorGzip) console.log(`     ⚠ gzip: ${res.errorGzip}`);
}

/* ── el CONTROL: los dos intentos tienen que dar el mismo tamaño si el
 * origen es estable. Si difieren, la transferencia es lo inestable. */
const tamanosIguales = intentos[0].bytes === intentos[1].bytes;
const algunoIntegro = intentos.some((i) => i.integro === true);
const todosIntegros = intentos.every((i) => i.integro === true);

/* ── ¿qué lleva dentro? se compara con lo RASTREADO que el PASO 0 derivó ──*/
const paso0 = JSON.parse(fs.readFileSync(path.join(AQUI, "paso0-146.json"), "utf8"));

const veredicto = !algunoIntegro
  ? "CORRUPTO EN ORIGEN o red rota en las dos: 0 de 2 intentos llegaron íntegros"
  : todosIntegros
    ? "EL ORIGEN SIRVE UN ARCHIVO ÍNTEGRO en 2 de 2 intentos. El `gzip: unexpected end of file` del despliegue NO es del archivo: es de la TRANSFERENCIA — se cortó en el camino a Easypanel"
    : "INESTABLE: 1 de 2 íntegros — la transferencia es lo que falla, y de forma intermitente";

const informe = {
  meta: {
    tanda: "146.ª",
    escalon: "ESCALÓN 2 · P3",
    fecha: new Date().toISOString(),
    proposito: "separar «archivo corrupto en origen» de «transferencia cortada» — dan el mismo error",
    repo,
    rama,
    head,
    url,
  },
  intentos,
  controles: {
    dosIntentosIndependientes: true,
    tamanosIguales,
    algunoIntegro,
    todosIntegros,
  },
  veredicto,
  /* el tamaño comprimido contra lo rastreado: no es deducible, porque los
   * JPEG/MP4 no encogen y los JSON de `medidas/` sí (§pre-registro) */
  compresion: {
    rastreadoMiB: paso0.repoEntero.MiBRastreados,
    tarballMiB: intentos[0].MiB,
    ratio: intentos[0].bytes ? Number((paso0.repoEntero.bytesRastreados / intentos[0].bytes).toFixed(2)) : null,
  },
  /* la pregunta de P3 propiamente: ¿sigue public/ en el camino con B? */
  publicEnElCaminoConB: {
    porPUBLICACION: {
      pasa: false,
      evidencia:
        "docker-compose.yml:39 monta SÓLO `.next` (`:ro`); publicador.mjs toca `public/` en 0 líneas de código",
    },
    porCONSTRUIR_LA_IMAGEN: {
      pasa: true,
      frecuencia: "UNA vez con B — frente a cada publicación con A",
      evidencia: "`.dockerignore` no excluye `apps/web/public`; Dockerfile:137 lo copia a la imagen",
    },
    porTRAER_EL_REPO_AL_HOST: {
      pasa: true,
      evidencia:
        "con B quien construye es el publicador EN EL HOST, así que el host necesita el árbol. " +
        "CMS-10 decidió el modelo de publicación, NO el de entrega del código: eso queda abierto",
    },
  },
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log(`\n── CONTROLES ──`);
console.log(`  dos intentos independientes · tamaños iguales: ${tamanosIguales}`);
console.log(`  íntegros: ${intentos.filter((i) => i.integro).length} de 2`);
console.log(`\n── VEREDICTO ──`);
console.log(`  ${veredicto}`);
console.log(`\n── COMPRESIÓN ──`);
console.log(
  `  rastreado ${informe.compresion.rastreadoMiB} MiB → tarball ${informe.compresion.tarballMiB} MiB` +
    ` (ratio ${informe.compresion.ratio}×)`
);
console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);

try {
  fs.rmSync(TMP, { recursive: true, force: true });
} catch {}
