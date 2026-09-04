/**
 * 146.ª ESCALÓN 2 · el reparto EN LA UNIDAD QUE DECIDE — MiB DEL TARBALL.
 *
 * El PASO 0 repartió los 1 825.78 MiB **en disco**. Para el ESCALÓN 3 eso no
 * sirve: lo que viaja es el tarball, y **el ratio de compresión NO es uniforme
 * por cubo**. `public/` son JPEG y MP4 ya comprimidos —gzip no los encoge—; y
 * `scripts/qa/medidas` son JSON, que encogen muchísimo.
 *
 * Leer el reparto en MiB de disco y proponer recortes con él es §*un default
 * expresado como porcentaje se lee como constante en cuanto se cita* con el
 * contenedor puesto en **la unidad**: los dos números se escriben igual y sólo
 * uno predice lo que el despliegue va a transferir.
 *
 * Medido, no estimado: se comprime cada cubo por separado con el mismo gzip.
 *
 * CONTROL: la suma de los cubos comprimidos por separado tiene que quedar
 * CERCA del tarball entero medido por `tarball-146` (no idéntica — gzip
 * comparte diccionario a lo largo del flujo, así que trocear pierde algo de
 * ratio). Si se desviara mucho, el método no vale.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/peso-tarball-146.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "peso-tarball-146.json");
const MB = (b) => Number((b / 1048576).toFixed(2));

const paso0 = JSON.parse(fs.readFileSync(path.join(AQUI, "paso0-146.json"), "utf8"));
const tar = JSON.parse(fs.readFileSync(path.join(AQUI, "tarball-146.json"), "utf8"));

/* las rutas rastreadas, por cubo — mismo criterio que el PASO 0 */
const filas = execFileSync("git", ["ls-tree", "-r", "-l", "HEAD"], {
  cwd: RAIZ,
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const tab = l.indexOf("\t");
    const meta = l.slice(0, tab).trim().split(/\s+/);
    let ruta = l.slice(tab + 1);
    if (ruta.startsWith('"')) {
      const cuerpo = ruta.slice(1, -1);
      const bytes = [];
      for (let i = 0; i < cuerpo.length; i++) {
        if (cuerpo[i] === "\\" && cuerpo[i + 1] >= "0" && cuerpo[i + 1] <= "7") {
          bytes.push(parseInt(cuerpo.slice(i + 1, i + 4), 8));
          i += 3;
        } else if (cuerpo[i] === "\\") {
          bytes.push(cuerpo.charCodeAt(i + 1));
          i += 1;
        } else bytes.push(cuerpo.charCodeAt(i));
      }
      ruta = Buffer.from(bytes).toString("utf8");
    }
    return { bytes: Number(meta[3]), ruta };
  });

const PREFIJOS = paso0.prefijosDerivadosDelDockerignore;
const cubo = (r) => {
  for (const p of PREFIJOS) if (r === p || r.startsWith(p + "/")) return p;
  return "(resto)";
};

/* agrupar por cubo y comprimir el contenido de cada uno */
const porCubo = new Map();
for (const f of filas) {
  const k = cubo(f.ruta);
  if (!porCubo.has(k)) porCubo.set(k, []);
  porCubo.get(k).push(f);
}

console.log("═══ 146.ª · PESO DE CADA CUBO EN EL TARBALL (medido, no estimado) ═══\n");
console.log(`  tarball entero medido: ${tar.intentos[0].MiB} MiB\n`);

const resultado = [];
for (const [k, ficheros] of porCubo) {
  let crudo = 0;
  let comprimido = 0;
  let leidos = 0;
  let ausentes = 0;
  for (const f of ficheros) {
    const abs = path.join(RAIZ, f.ruta);
    if (!fs.existsSync(abs)) {
      ausentes++;
      continue;
    }
    const buf = fs.readFileSync(abs);
    crudo += buf.length;
    comprimido += zlib.gzipSync(buf, { level: 6 }).length;
    leidos++;
  }
  resultado.push({
    cubo: k,
    ficheros: ficheros.length,
    leidos,
    ausentes,
    crudoMiB: MB(crudo),
    comprimidoMiB: MB(comprimido),
    ratio: comprimido ? Number((crudo / comprimido).toFixed(2)) : null,
    entraEnDocker: k === "apps/web/public" || k === "(resto)",
  });
  console.log(
    `  ${String(MB(comprimido)).padStart(9)} MiB comp · ${String(MB(crudo)).padStart(9)} MiB crudo · ` +
      `ratio ${String(comprimido ? (crudo / comprimido).toFixed(2) : "-").padStart(5)}×  ${k}`
  );
}

resultado.sort((a, b) => b.comprimidoMiB - a.comprimidoMiB);

const sumaComprimida = resultado.reduce((s, r) => s + r.comprimidoMiB, 0);
const desviacion = Number((100 * ((sumaComprimida - tar.intentos[0].MiB) / tar.intentos[0].MiB)).toFixed(1));

/* ── qué quita cada CANDIDATO, en MiB de tarball ──────────────────────────
 * Esto es lo único que el ESCALÓN 3 puede usar para comparar costes: los
 * candidatos se puntúan en la unidad que viaja. */
const del = (nombre) => resultado.find((r) => r.cubo === nombre)?.comprimidoMiB ?? 0;
const alcance = JSON.parse(fs.readFileSync(path.join(AQUI, "alcance-146.json"), "utf8"));
const solape = JSON.parse(fs.readFileSync(path.join(AQUI, "solape-146.json"), "utf8"));

const candidatos = [
  {
    candidato: "no tocar nada",
    quitaMiBTarball: 0,
    tarballResultanteMiB: Number(sumaComprimida.toFixed(2)),
  },
  {
    candidato: "quitar SÓLO el arrastre de public/ (lo que nadie cita)",
    quitaMiBTarball: null, // se calcula abajo, hay que comprimir sólo esos ficheros
    ficheros: alcance.alcance.porRUTA_cotaBaja.arrastre,
    crudoMiB: alcance.alcance.porRUTA_cotaBaja.arrastreMiB,
  },
  {
    candidato: "quitar de public/ lo que SOLAPA con media/ (CMS-0b)",
    ficheros: solape.cardinales.enAmbos.ficheros,
    crudoMiB: solape.cardinales.enAmbos.MiB,
    bloqueo:
      "el HTML los pide por `/images/…`, no por el canal de media/: mover el byte no basta, hay que cambiar el canal del render",
  },
  {
    candidato: "sacar public/ ENTERO del repo",
    quitaMiBTarball: del("apps/web/public"),
    tarballResultanteMiB: Number((sumaComprimida - del("apps/web/public")).toFixed(2)),
  },
  {
    candidato: "sacar del repo lo que el .dockerignore YA excluye (media-corpus + scripts + corpus + docs)",
    quitaMiBTarball: Number(
      resultado.filter((r) => !r.entraEnDocker).reduce((s, r) => s + r.comprimidoMiB, 0).toFixed(2)
    ),
    tarballResultanteMiB: Number(
      resultado.filter((r) => r.entraEnDocker).reduce((s, r) => s + r.comprimidoMiB, 0).toFixed(2)
    ),
  },
];

/* el arrastre, comprimido de verdad */
{
  const rels = new Set(
    (alcance.masPesadosDelArrastre || []).map((x) => x.rel) // sólo hay muestra; se recomprime el conjunto entero abajo
  );
  // recomprimir el arrastre entero exige la lista completa: se recalcula aquí
  const pub = [];
  const recorre = (dir, base) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorre(p, base);
      else if (e.isFile()) pub.push(path.relative(base, p).replace(/\\/g, "/"));
    }
  };
  const PUB = path.join(RAIZ, "apps/web/public");
  recorre(PUB, PUB);
  void rels;
  // el arrastre se identifica por exclusión usando el mismo criterio del alcance:
  // no se recalcula el emparejamiento, se usa el cardinal ya publicado y se
  // comprime una MUESTRA proporcional — y se dice que es una muestra.
  const muestra = (alcance.masPesadosDelArrastre || []).slice(0, 20);
  let crudo = 0;
  let comp = 0;
  for (const m of muestra) {
    const abs = path.join(PUB, m.rel);
    if (!fs.existsSync(abs)) continue;
    const buf = fs.readFileSync(abs);
    crudo += buf.length;
    comp += zlib.gzipSync(buf, { level: 6 }).length;
  }
  const ratioArrastre = comp ? crudo / comp : 1;
  candidatos[1].quitaMiBTarball = Number(
    (alcance.alcance.porRUTA_cotaBaja.arrastreMiB / ratioArrastre).toFixed(2)
  );
  candidatos[1].tarballResultanteMiB = Number((sumaComprimida - candidatos[1].quitaMiBTarball).toFixed(2));
  candidatos[1].ratioUsado = Number(ratioArrastre.toFixed(2));
  candidatos[1].nota = `ratio derivado de una MUESTRA de ${muestra.length} ficheros del arrastre, no del conjunto`;

  const ratioPub = resultado.find((r) => r.cubo === "apps/web/public");
  candidatos[2].quitaMiBTarball = Number(
    (solape.cardinales.enAmbos.MiB / (ratioPub?.ratio || 1)).toFixed(2)
  );
  candidatos[2].tarballResultanteMiB = Number((sumaComprimida - candidatos[2].quitaMiBTarball).toFixed(2));
  candidatos[2].nota = `ratio del cubo public/ entero (${ratioPub?.ratio}×)`;
}

const informe = {
  meta: {
    tanda: "146.ª",
    escalon: "ESCALÓN 2 · peso por cubo EN EL TARBALL",
    fecha: new Date().toISOString(),
    proposito: "el reparto en MiB de disco NO predice lo que viaja: el ratio de compresión no es uniforme",
  },
  control: {
    tarballEnteroMedidoMiB: tar.intentos[0].MiB,
    sumaDeCubosComprimidosMiB: Number(sumaComprimida.toFixed(2)),
    desviacionPct: desviacion,
    lectura:
      Math.abs(desviacion) < 10
        ? "el método vale: trocear pierde poco ratio"
        : "⚠ desviación alta — trocear cambia el ratio, los números de abajo son cota",
  },
  porCubo: resultado,
  candidatos,
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

console.log(`\n── CONTROL del método ──`);
console.log(`  tarball entero medido:      ${informe.control.tarballEnteroMedidoMiB} MiB`);
console.log(`  suma de cubos comprimidos:  ${informe.control.sumaDeCubosComprimidosMiB} MiB`);
console.log(`  desviación: ${desviacion}%  → ${informe.control.lectura}`);

console.log(`\n── QUÉ QUITA CADA CANDIDATO, EN MiB DE TARBALL ──`);
for (const c of candidatos)
  console.log(
    `  quita ${String(c.quitaMiBTarball).padStart(8)} MiB → tarball ${String(c.tarballResultanteMiB).padStart(8)} MiB  ${c.candidato}`
  );

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA)}`);
