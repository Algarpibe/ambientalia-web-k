/**
 * 146.ª ESCALÓN 3 · LA PREGUNTA APARTE — ¿QUÉ CUESTA QUE 2 755 FICHEROS
 * BINARIOS DE 661 MiB ESTÉN RASTREADOS EN GIT?
 *
 * El encargo pide ponerle NÚMERO y COSTE, y NO decidirla. Esto sólo mide.
 *
 * ⚠ EL COSTE DE UN BINARIO EN GIT NO ES SU TAMAÑO: ES SU TAMAÑO **POR CADA
 * VERSIÓN QUE HAYA TENIDO.** Git no hace delta útil entre dos JPEG, así que
 * cada re-captura de un asset añade un blob entero al pack, **para siempre**.
 * Medirlo en el árbol de trabajo (661 MiB) responde otra pregunta que la que
 * decide: lo que se clona es el PACK.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/coste-git-146.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "coste-git-146.json");
const MB = (b) => Number((b / 1048576).toFixed(2));

const git = (...a) =>
  execFileSync("git", a, { cwd: RAIZ, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });

console.log("═══ 146.ª ESCALÓN 3 · EL COSTE EN GIT (medido, no estimado) ═══\n");

/* ── 1 · TODOS los blobs del historial, con su tamaño EN EL PACK ──────────
 * `rev-list --objects --all` da cada objeto alcanzable; `cat-file
 * --batch-check` da su tipo y su tamaño en disco dentro del pack. Eso es lo
 * que un clon transfiere, y es la unidad que decide. */
const objetos = git("rev-list", "--objects", "--all")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const sp = l.indexOf(" ");
    return sp === -1 ? { sha: l, ruta: null } : { sha: l.slice(0, sp), ruta: l.slice(sp + 1) };
  });

console.log(`  objetos alcanzables en TODO el historial: ${objetos.length}`);

const entrada = objetos.map((o) => o.sha).join("\n");
const salida = execFileSync(
  "git",
  ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize) %(objectsize:disk)"],
  { cwd: RAIZ, input: entrada, encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 }
);

const info = new Map();
for (const l of salida.split("\n")) {
  if (!l.trim()) continue;
  const [sha, tipo, tam, disco] = l.split(" ");
  if (tipo === "blob") info.set(sha, { bytes: Number(tam), disco: Number(disco) });
}

/* ── 2 · repartir por cubo, contando CADA VERSIÓN ─────────────────────────*/
const paso0 = JSON.parse(fs.readFileSync(path.join(AQUI, "paso0-146.json"), "utf8"));
const PREFIJOS = paso0.prefijosDerivadosDelDockerignore;
const cubo = (r) => {
  if (!r) return "(sin ruta)";
  for (const p of PREFIJOS) if (r === p || r.startsWith(p + "/")) return p;
  return "(resto)";
};

/* un mismo blob puede alcanzarse por varias rutas; se cuenta UNA vez y se le
 * atribuye el cubo de su primera ruta. Se publica el cardinal de los que
 * aparecen en más de un cubo, porque ésos son los que un reparto absorbe. */
const yaVisto = new Set();
const porCubo = {};
const versionesPorRuta = new Map();

/* ⚠⚠ UN BLOB PUEDE ESTAR EN VARIOS CUBOS A LA VEZ, Y ATRIBUIRLO AL PRIMERO
 * MIENTE SOBRE LO QUE QUITA SACAR UNO.
 *
 * Git deduplica por contenido: el MISMO JPEG capturado en `media-corpus/` y
 * colocado en `apps/web/public/` es **un solo blob**. Si se le atribuye al
 * cubo que lo alcanza primero, el reparto suma bien el total y **el «quita X
 * MiB» de cada cubo sale inflado**: sacar `public/` no libera un blob que
 * `media-corpus` sigue reteniendo.
 *
 * Es §*un cardinal es un contenedor y absorbe la membresía* con el contenedor
 * puesto en la ATRIBUCIÓN. Se mide: cada blob guarda TODOS sus cubos, y se
 * publican dos cifras por cubo —lo EXCLUSIVO (lo que de verdad se libera al
 * sacarlo) y lo COMPARTIDO (lo que no)—. */
const cubosDelBlob = new Map(); // sha -> Set(cubo)

for (const o of objetos) {
  const i = info.get(o.sha);
  if (!i) continue; // no es blob
  if (o.ruta) {
    if (!versionesPorRuta.has(o.ruta)) versionesPorRuta.set(o.ruta, new Set());
    versionesPorRuta.get(o.ruta).add(o.sha);
    if (!cubosDelBlob.has(o.sha)) cubosDelBlob.set(o.sha, new Set());
    cubosDelBlob.get(o.sha).add(cubo(o.ruta));
  }
  if (yaVisto.has(o.sha)) continue;
  yaVisto.add(o.sha);
  const k = cubo(o.ruta);
  porCubo[k] ??= { blobs: 0, bytes: 0, disco: 0 };
  porCubo[k].blobs++;
  porCubo[k].bytes += i.bytes;
  porCubo[k].disco += i.disco;
}

/* el reparto CORRECTO: por cubo, exclusivo vs compartido */
const exclusivoPorCubo = {};
for (const [sha, cubos] of cubosDelBlob) {
  const i = info.get(sha);
  if (!i) continue;
  for (const c of cubos) {
    exclusivoPorCubo[c] ??= { exclusivoDisco: 0, exclusivoBlobs: 0, compartidoDisco: 0, compartidoBlobs: 0 };
    if (cubos.size === 1) {
      exclusivoPorCubo[c].exclusivoDisco += i.disco;
      exclusivoPorCubo[c].exclusivoBlobs++;
    } else {
      exclusivoPorCubo[c].compartidoDisco += i.disco;
      exclusivoPorCubo[c].compartidoBlobs++;
    }
  }
}
const blobsCompartidos = [...cubosDelBlob.values()].filter((s) => s.size > 1).length;

const reparto = Object.entries(porCubo)
  .map(([c, v]) => ({
    cubo: c,
    blobsEnElHistorial: v.blobs,
    contenidoMiB: MB(v.bytes),
    enElPackMiB: MB(v.disco),
    /* lo que DE VERDAD se libera al sacar este cubo, y lo que no */
    exclusivoMiB: MB(exclusivoPorCubo[c]?.exclusivoDisco ?? 0),
    exclusivoBlobs: exclusivoPorCubo[c]?.exclusivoBlobs ?? 0,
    compartidoMiB: MB(exclusivoPorCubo[c]?.compartidoDisco ?? 0),
    compartidoBlobs: exclusivoPorCubo[c]?.compartidoBlobs ?? 0,
  }))
  .sort((a, b) => b.exclusivoMiB - a.exclusivoMiB);

console.log(`\n── EL PACK, POR CUBO — EXCLUSIVO vs COMPARTIDO ──`);
console.log(`  (git deduplica por contenido: un blob en dos cubos NO se libera sacando uno)`);
for (const r of reparto)
  console.log(
    `  exclusivo ${String(r.exclusivoMiB).padStart(9)} MiB (${String(r.exclusivoBlobs).padStart(5)} blobs) · ` +
      `compartido ${String(r.compartidoMiB).padStart(8)} MiB (${String(r.compartidoBlobs).padStart(5)})  ${r.cubo}`
  );
console.log(`\n  blobs presentes en MÁS DE UN cubo: ${blobsCompartidos}`);

/* ── 3 · EL MULTIPLICADOR: ¿cuántas versiones tiene cada fichero de public/?
 * Ésta es la cifra que decide, porque es la que crece sin que nadie lo note. */
const PUB = "apps/web/public";
const rutasPub = [...versionesPorRuta.entries()].filter(([r]) => r.startsWith(PUB + "/"));
const conVarias = rutasPub.filter(([, s]) => s.size > 1);
const totalVersiones = rutasPub.reduce((s, [, v]) => s + v.size, 0);

/* el actual, para poder decir cuánto es HISTÓRICO */
const actuales = new Set(
  git("ls-tree", "-r", "HEAD", "--", PUB)
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split(/\s+/)[2])
);
let bytesActuales = 0;
let discoActual = 0;
let bytesHistoricos = 0;
let discoHistorico = 0;
let blobsHistoricos = 0;
for (const [ruta, shas] of rutasPub) {
  void ruta;
  for (const s of shas) {
    const i = info.get(s);
    if (!i) continue;
    if (actuales.has(s)) {
      bytesActuales += i.bytes;
      discoActual += i.disco;
    } else {
      bytesHistoricos += i.bytes;
      discoHistorico += i.disco;
      blobsHistoricos++;
    }
  }
}

console.log(`\n── EL MULTIPLICADOR de public/ ──`);
console.log(`  rutas distintas en el historial: ${rutasPub.length}`);
console.log(`  con MÁS DE UNA versión:          ${conVarias.length}`);
console.log(`  versiones totales:               ${totalVersiones}  (media ${(totalVersiones / rutasPub.length).toFixed(2)} por ruta)`);
console.log(`  en el pack — ACTUAL:   ${MB(discoActual)} MiB`);
console.log(`  en el pack — HISTÓRICO (versiones muertas): ${MB(discoHistorico)} MiB en ${blobsHistoricos} blobs`);

const masVersiones = [...rutasPub]
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 10)
  .map(([r, s]) => ({ ruta: r, versiones: s.size }));

/* ── 4 · EL COSTE OPERATIVO, en las unidades en que se paga ───────────────*/
const conteo = Object.fromEntries(
  git("count-objects", "-v")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split(": ").map((x) => x.trim()))
);
const tar = JSON.parse(fs.readFileSync(path.join(AQUI, "tarball-146.json"), "utf8"));

const packMiB = MB(Number(conteo["size-pack"]) * 1024);
const pubReg = reparto.find((r) => r.cubo === PUB);
const pubPack = pubReg?.exclusivoMiB ?? 0;

const informe = {
  meta: {
    tanda: "146.ª",
    escalon: "ESCALÓN 3 · la pregunta aparte",
    fecha: new Date().toISOString(),
    pregunta: "¿tiene sentido que 2 755 ficheros binarios de 661 MiB estén rastreados en git? — SE MIDE, NO SE DECIDE",
    advertencia:
      "el coste de un binario en git no es su tamaño: es su tamaño POR CADA VERSIÓN. Git no delta-comprime dos JPEG.",
  },

  packPorCubo: reparto,
  blobsEnMasDeUnCubo: blobsCompartidos,
  avisoDeAtribucion:
    "git deduplica por contenido: un mismo JPEG en media-corpus/ y en apps/web/public/ es UN blob. " +
    "El `quita X MiB` de cada cubo usa su EXCLUSIVO, no su total — sacar uno no libera lo que el otro retiene.",

  multiplicadorDePublic: {
    rutasDistintasEnElHistorial: rutasPub.length,
    rutasConMasDeUnaVersion: conVarias.length,
    versionesTotales: totalVersiones,
    mediaVersionesPorRuta: Number((totalVersiones / rutasPub.length).toFixed(2)),
    enElPack: { actualMiB: MB(discoActual), historicoMiB: MB(discoHistorico), blobsHistoricos },
    contenido: { actualMiB: MB(bytesActuales), historicoMiB: MB(bytesHistoricos) },
    masVersiones,
    lectura:
      conVarias.length === 0
        ? "ningún fichero de public/ se ha re-capturado: el coste histórico es CERO y el pack es sólo el estado actual"
        : `${conVarias.length} rutas se han re-capturado; ${MB(discoHistorico)} MiB del pack son versiones que ya nadie usa`,
  },

  costeOperativo: {
    packTotalMiB: packMiB,
    sueltosMiB: MB(Number(conteo.size) * 1024),
    gitEnDiscoMiB: MB(Number(conteo["size-pack"]) * 1024 + Number(conteo.size) * 1024),
    clonCompletoMiB: Number((packMiB + paso0.repoEntero.MiBRastreados).toFixed(2)),
    tarballMiB: tar.intentos[0].MiB,
    aportacionDePublicAlPackMiB: pubPack,
    pctDelPack: Number(((100 * pubPack) / packMiB).toFixed(1)),
  },

  /* lo que costaría cada salida — en trabajo, no en opinión */
  costeDeCadaSalida: [
    {
      salida: "no hacer nada",
      trabajo: "cero",
      loQuePagas:
        `cada clon completo transfiere ${packMiB} MiB de pack; cada tarball de despliegue, ${tar.intentos[0].MiB} MiB`,
      reversible: "n/a",
    },
    {
      salida: "dejar de RASTREAR public/ de aquí en adelante (`.gitignore` + volumen/CDN)",
      trabajo:
        "una línea en `.gitignore`, más resolver CÓMO llega public/ al destino (hoy llega por la imagen)",
      loQuePagas:
        `el pack NO encoge: los ${pubPack} MiB ya escritos siguen en el historial. Sólo deja de CRECER`,
      deshacer: "volver a añadirlo — barato, es un `git add`",
      reversible: "sí, barato",
    },
    {
      salida: "REESCRIBIR el historial para sacar public/ (`git filter-repo`)",
      trabajo:
        "reescribe TODOS los commits: cambian los SHA, hay que forzar el push y cualquier clon existente queda huérfano",
      loQuePagas: `el pack baja ~${pubPack} MiB (${Number(((100 * pubPack) / packMiB).toFixed(1))}% del pack)`,
      deshacer:
        "NO se deshace: los SHA nuevos son otros commits. La única vuelta atrás es un clon guardado de antes",
      reversible: "NO — es la única de la lista que no tiene operación de deshacer",
    },
    {
      salida: "Git LFS para los binarios",
      trabajo: "migrar el historial (mismo coste que filter-repo) y que el destino tenga cliente LFS",
      loQuePagas: "el pack baja, pero el tarball de GitHub NO trae los objetos LFS: el despliegue tendría que hacer `lfs pull`",
      deshacer: "migrar de vuelta — caro, mismo coste que la ida",
      reversible: "sí, caro",
    },
  ],
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log(`\n── COSTE OPERATIVO ──`);
console.log(`  pack total:                    ${packMiB} MiB`);
console.log(`  de eso, public/:               ${pubPack} MiB (${informe.costeOperativo.pctDelPack}%)`);
console.log(`  clon completo (pack + árbol):  ${informe.costeOperativo.clonCompletoMiB} MiB`);
console.log(`  tarball de despliegue:         ${tar.intentos[0].MiB} MiB`);
console.log(`\n  ${informe.multiplicadorDePublic.lectura}`);
console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);
