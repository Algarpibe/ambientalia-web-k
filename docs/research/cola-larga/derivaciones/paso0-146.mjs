/**
 * PASO 0 de la 146.ª — EL TERRENO, DERIVADO.
 *
 * El encargo trae seis cifras como PREMISA A CONTRASTAR y prohíbe usarlas sin
 * derivarlas. Esto las deriva todas y publica las que NO coinciden con su
 * unidad, que es lo que §*cada denominador se escribe CON SU UNIDAD* exige.
 *
 * No mide el solape ni el alcance —eso es el ESCALÓN 2, y se predice antes en
 * el ESCALÓN 1—. Aquí sólo se establece de qué tamaño es cada cosa y por dónde
 * pasa en el despliegue.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/paso0-146.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "paso0-146.json");

const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const MB = (b) => Number((b / 1048576).toFixed(2));

/* ── 1 · lo RASTREADO en HEAD, con su tamaño de blob ──────────────────────
 * `git ls-tree -r -l HEAD` da modo, tipo, sha, TAMAÑO y ruta. La ruta puede
 * venir entrecomillada cuando lleva caracteres no ASCII, así que se
 * des-escapa: si no, esas filas caen en un cubo `"apps/web` distinto del
 * bueno y el reparto se parte en dos sin dar error (§*un cardinal es un
 * contenedor y absorbe la membresía*). */
function desescapa(ruta) {
  if (!ruta.startsWith('"')) return { ruta, entrecomillada: false };
  // git escapa con octales \NNN sobre los bytes UTF-8; se reconstruye el buffer.
  const cuerpo = ruta.slice(1, -1);
  const bytes = [];
  for (let i = 0; i < cuerpo.length; i++) {
    if (cuerpo[i] === "\\") {
      const sig = cuerpo[i + 1];
      if (sig >= "0" && sig <= "7") {
        bytes.push(parseInt(cuerpo.slice(i + 1, i + 4), 8));
        i += 3;
      } else {
        const mapa = { n: 10, t: 9, r: 13, '"': 34, "\\": 92 };
        bytes.push(mapa[sig] ?? sig.charCodeAt(0));
        i += 1;
      }
    } else {
      bytes.push(cuerpo.charCodeAt(i));
    }
  }
  return { ruta: Buffer.from(bytes).toString("utf8"), entrecomillada: true };
}

const filas = git("ls-tree", "-r", "-l", "HEAD")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    // "<modo> <tipo> <sha> <tam>\t<ruta>"
    const tab = l.indexOf("\t");
    const meta = l.slice(0, tab).trim().split(/\s+/);
    const { ruta, entrecomillada } = desescapa(l.slice(tab + 1));
    return { sha: meta[2], bytes: Number(meta[3]), ruta, entrecomillada };
  });

const entrecomilladas = filas.filter((f) => f.entrecomillada).length;

/* ── 2 · el reparto por PREFIJO LÓGICO ────────────────────────────────────
 * No por directorio de N niveles: por el prefijo que decide si algo entra o
 * no en el contexto de Docker, que es la pregunta de la tanda. Los prefijos
 * se DERIVAN del `.dockerignore` más `apps/web/public`, no se enumeran a
 * mano (§regla 9, 7.º caso). */
const dockerignore = fs.readFileSync(path.join(RAIZ, ".dockerignore"), "utf8");
const excluidosDocker = dockerignore
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && !l.startsWith("!"))
  .filter((l) => !l.startsWith("**/") && !l.includes("*") && !l.includes("."))
  .filter((l) => fs.existsSync(path.join(RAIZ, l)));

const PREFIJOS = ["apps/web/public", ...excluidosDocker];

function cubo(ruta) {
  for (const p of PREFIJOS) if (ruta === p || ruta.startsWith(p + "/")) return p;
  return "(resto)";
}

const porCubo = {};
for (const f of filas) {
  const k = cubo(f.ruta);
  porCubo[k] ??= { ficheros: 0, bytes: 0 };
  porCubo[k].ficheros++;
  porCubo[k].bytes += f.bytes;
}
const reparto = Object.entries(porCubo)
  .map(([cubo, v]) => ({
    cubo,
    ficheros: v.ficheros,
    bytes: v.bytes,
    MB: MB(v.bytes),
    entraEnDocker: cubo === "apps/web/public" || cubo === "(resto)",
  }))
  .sort((a, b) => b.bytes - a.bytes);

/* ── 3 · public/ EN DISCO, y la anomalía de bytes ─────────────────────────
 * `git ls-tree` da el tamaño del BLOB; el disco puede diferir por conversión
 * de finales de línea. Los dos números se publican, y su diferencia también:
 * un delta silencioso entre «lo que git guarda» y «lo que Docker copia» es
 * exactamente la clase de cosa que un solo cardinal absorbe. */
function recorre(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...recorre(p));
    else if (e.isFile()) out.push({ ruta: path.relative(RAIZ, p).replace(/\\/g, "/"), bytes: fs.statSync(p).size });
  }
  return out;
}

const PUB = "apps/web/public";
const enDisco = recorre(path.join(RAIZ, PUB));
const rastreadosPub = filas.filter((f) => f.ruta.startsWith(PUB + "/"));
const bytesDisco = enDisco.reduce((s, f) => s + f.bytes, 0);
const bytesBlob = rastreadosPub.reduce((s, f) => s + f.bytes, 0);

/* qué ficheros difieren entre blob y disco — nombrados, no sólo contados */
const porRutaBlob = new Map(rastreadosPub.map((f) => [f.ruta, f.bytes]));
const difieren = enDisco
  .filter((f) => porRutaBlob.has(f.ruta) && porRutaBlob.get(f.ruta) !== f.bytes)
  .map((f) => ({ ruta: f.ruta, blob: porRutaBlob.get(f.ruta), disco: f.bytes, delta: f.bytes - porRutaBlob.get(f.ruta) }));

/* ── 4 · media/ (CMS-0b) ──────────────────────────────────────────────────*/
const DIRMEDIA = path.join(RAIZ, "media");
const media = fs.existsSync(DIRMEDIA) ? recorre(DIRMEDIA) : [];
const mediaRastreados = git("ls-files", "media").split("\n").filter(Boolean).length;

/* ── 5 · el objeto de git ─────────────────────────────────────────────────*/
const conteo = Object.fromEntries(
  git("count-objects", "-v")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split(": ").map((x) => x.trim()))
);

/* ── 6 · POR DÓNDE PASA `public/` EN EL DESPLIEGUE ────────────────────────
 * Derivado de los tres ficheros que lo deciden, no de memoria. Cada campo
 * lleva el fichero y la línea de la que sale. */
const dockerfile = fs.readFileSync(path.join(RAIZ, "Dockerfile"), "utf8").split("\n");
const compose = fs.readFileSync(path.join(RAIZ, "docker-compose.yml"), "utf8").split("\n");
const publicador = fs.readFileSync(path.join(RAIZ, "scripts/publicar/publicador.mjs"), "utf8").split("\n");

const cita = (lineas, fichero, re) =>
  lineas
    .map((l, i) => ({ fichero, linea: i + 1, texto: l.trim() }))
    .filter((x) => re.test(x.texto));

const camino = {
  dockerignoreExcluyePublic: dockerignore
    .split("\n")
    .some((l) => l.trim() === "apps/web/public" || l.trim() === "**/public"),
  dockerfileCopiaPublic: cita(dockerfile, "Dockerfile", /COPY.*public/),
  composeMonta: cita(compose, "docker-compose.yml", /^-\s|^\s*-\s.*:\/app/).filter((x) =>
    x.texto.includes(":/app")
  ),
  publicadorTocaPublic: cita(publicador, "publicador.mjs", /^(?!\s*[*/]).*\bpublic\b/).length,
};

const informe = {
  meta: {
    tanda: "146.ª",
    paso: "PASO 0 — el terreno",
    fecha: new Date().toISOString(),
    head: git("rev-parse", "HEAD").trim(),
    proposito:
      "derivar las seis cifras que el encargo trae como premisa, y por dónde pasa public/ en el despliegue",
  },

  /* Cada cifra con su PREMISA al lado, para que la discrepancia se vea sin
   * tener que abrir el encargo (§*un denominador sin unidad no se puede
   * auditar*). */
  contraste: [
    {
      que: "apps/web/public · ficheros RASTREADOS",
      premisaEncargo: 2755,
      derivado: rastreadosPub.length,
      coincide: rastreadosPub.length === 2755,
    },
    {
      que: "apps/web/public · tamaño",
      premisaEncargo: "668 MB (sin unidad declarada)",
      derivadoBytes: bytesBlob,
      derivadoMiB: MB(bytesBlob),
      derivadoMB_decimal: Number((bytesBlob / 1e6).toFixed(2)),
      nota:
        "661.14 MiB = 693.26 MB decimales. El 668 del encargo no es ninguno de los dos: " +
        "probablemente `du` en bloques de disco (asigna por cluster y redondea al alza).",
    },
    {
      que: "git count-objects · size-pack",
      premisaEncargo: "895 MB",
      derivado: conteo["size-pack"] + " KiB",
      derivadoMiB: MB(Number(conteo["size-pack"]) * 1024),
    },
    {
      que: "media/ · tamaño (CMS-0b)",
      premisaEncargo: "313 MB",
      derivadoBytes: media.reduce((s, f) => s + f.bytes, 0),
      derivadoMiB: MB(media.reduce((s, f) => s + f.bytes, 0)),
      derivadoMB_decimal: Number((media.reduce((s, f) => s + f.bytes, 0) / 1e6).toFixed(2)),
      ficheros: media.length,
      rastreadosEnGit: mediaRastreados,
      nota:
        "319.15 MB decimales ≈ el 313 del encargo con otra unidad. " +
        "Y el dato que el encargo NO trae: media/ tiene 0 ficheros rastreados (.gitignore:61), " +
        "así que NO viaja en el tarball de GitHub por construcción.",
    },
  ],

  publicDir: {
    ficherosRastreados: rastreadosPub.length,
    ficherosEnDisco: enDisco.length,
    bytesBlob,
    bytesDisco,
    deltaBytes: bytesDisco - bytesBlob,
    MiBBlob: MB(bytesBlob),
    ficherosQueDifierenBlobVsDisco: difieren.length,
    difieren,
  },

  mediaDir: {
    ficheros: media.length,
    bytes: media.reduce((s, f) => s + f.bytes, 0),
    MiB: MB(media.reduce((s, f) => s + f.bytes, 0)),
    rastreadosEnGit: mediaRastreados,
  },

  repoEntero: {
    ficherosRastreados: filas.length,
    bytesRastreados: filas.reduce((s, f) => s + f.bytes, 0),
    MiBRastreados: MB(filas.reduce((s, f) => s + f.bytes, 0)),
    rutasEntrecomilladasPorGit: entrecomilladas,
    packMiB: MB(Number(conteo["size-pack"]) * 1024),
    sueltosMiB: MB(Number(conteo.size) * 1024),
  },

  /* El reparto es lo que contesta si `public/` es EL problema o UNA PARTE. */
  repartoPorCubo: reparto,
  resumenReparto: {
    entraEnContextoDocker: {
      MiB: MB(reparto.filter((r) => r.entraEnDocker).reduce((s, r) => s + r.bytes, 0)),
      ficheros: reparto.filter((r) => r.entraEnDocker).reduce((s, r) => s + r.ficheros, 0),
    },
    excluidoDeDockerPeroENELTARBALL: {
      MiB: MB(reparto.filter((r) => !r.entraEnDocker).reduce((s, r) => s + r.bytes, 0)),
      ficheros: reparto.filter((r) => !r.entraEnDocker).reduce((s, r) => s + r.ficheros, 0),
      nota:
        "esto es lo que el `.dockerignore` ya saca de la imagen y que el TARBALL de GitHub " +
        "sigue llevando: el tarball no lee `.dockerignore`.",
    },
  },

  caminoDeDespliegue: camino,

  prefijosDerivadosDelDockerignore: PREFIJOS,
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log("═══ PASO 0 · 146.ª — EL TERRENO ═══\n");
console.log("── CONTRASTE con las premisas del encargo ──");
for (const c of informe.contraste) {
  console.log(`  ${c.que}`);
  console.log(`     encargo:  ${c.premisaEncargo}`);
  console.log(`     derivado: ${c.derivado ?? c.derivadoMiB + " MiB / " + c.derivadoMB_decimal + " MB"}`);
  if (c.nota) console.log(`     ⚠ ${c.nota}`);
}

console.log("\n── REPARTO de lo RASTREADO (lo que el tarball lleva) ──");
for (const r of reparto) {
  console.log(
    `  ${String(r.MB).padStart(9)} MB  ${String(r.ficheros).padStart(5)} f  ` +
      `${r.entraEnDocker ? "→docker" : "  (excl)"}  ${r.cubo}`
  );
}
console.log(
  `\n  entra en el contexto de Docker: ${informe.resumenReparto.entraEnContextoDocker.MiB} MiB` +
    ` · ${informe.resumenReparto.entraEnContextoDocker.ficheros} f`
);
console.log(
  `  excluido de Docker y AUN ASÍ en el tarball: ${informe.resumenReparto.excluidoDeDockerPeroENELTARBALL.MiB} MiB` +
    ` · ${informe.resumenReparto.excluidoDeDockerPeroENELTARBALL.ficheros} f`
);

console.log("\n── public/ blob vs disco ──");
console.log(
  `  blob ${informe.publicDir.bytesBlob} · disco ${informe.publicDir.bytesDisco}` +
    ` · delta ${informe.publicDir.deltaBytes} en ${difieren.length} ficheros`
);
for (const d of difieren) console.log(`     ${d.ruta}  blob ${d.blob} → disco ${d.disco} (${d.delta >= 0 ? "+" : ""}${d.delta})`);

console.log("\n── POR DÓNDE PASA public/ EN EL DESPLIEGUE ──");
console.log(`  ¿el .dockerignore lo excluye?  ${camino.dockerignoreExcluyePublic ? "SÍ" : "NO"}`);
for (const c of camino.dockerfileCopiaPublic) console.log(`  Dockerfile:${c.linea}  ${c.texto}`);
for (const c of camino.composeMonta) console.log(`  compose:${c.linea}  ${c.texto}`);
console.log(`  líneas de publicador.mjs que tocan public/ (fuera de comentario): ${camino.publicadorTocaPublic}`);

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);
