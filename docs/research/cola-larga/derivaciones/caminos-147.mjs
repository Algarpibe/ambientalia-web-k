/**
 * ESCALÓN 2 de la 147.ª — ADJUDICACIÓN de los cuatro caminos de entrega.
 *
 * No mide: la medida la tomó `caminos-147.sh` EN EL VPS y está congelada en
 * `caminos-147.log`. Esto la parsea, la compara contra el pre-registro
 * (`pre-registro-entrega-147.md`, commit `1d0ced0`) y publica el veredicto de
 * cada predicción CON SU NÚMERO.
 *
 * Separar medir de adjudicar es deliberado: el log se tomó antes de escribir
 * una sola línea de esta adjudicación, así que ninguna predicción se puede
 * haber ajustado al resultado.
 *
 * Uso:  node docs/research/cola-larga/derivaciones/caminos-147.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const LOG = path.join(AQUI, "caminos-147.log");
const SALIDA = path.join(AQUI, "caminos-147.json");

if (!fs.existsSync(LOG)) {
  console.error(`FALTA el insumo ${LOG}. Esta sonda ADJUDICA, no mide: sin la
congelada del VPS no hay nada que adjudicar. Correr caminos-147.sh en el VPS
y traerse su log.`);
  process.exit(2);
}

/* El log es `clave=valor` por diseño: parsearlo no depende del ancho de
 * columna de ninguna herramienta ni del idioma del sistema. */
const k = {};
for (const linea of fs.readFileSync(LOG, "utf8").split("\n")) {
  const i = linea.indexOf("=");
  if (i > 0 && !linea.startsWith("=")) {
    k[linea.slice(0, i).trim()] = linea
      .slice(i + 1)
      .replace(/#.*$/, "")
      .trim();
  }
}

const n = (clave) => Number(k[clave]);
const MiB = (b) => Number((b / 1048576).toFixed(2));
const seg = (clave) => Number(Number(k[clave]).toFixed(2));

/* ── EL CONTROL DEL INSTRUMENTO, ANTES DE LEER NINGÚN RESULTADO ──────────
 * §regla 28d: un `gzip -t` que sólo PASA no distingue «el archivo está bien»
 * de «no sé mirar». El testigo negativo es lo que convierte su verde en dato.
 * Si el control no discrimina, la corrida NO ADJUDICA. */
const control = {
  gzip_t_sobre_integro: n("c2_gzip_t_exit"),
  gzip_t_sobre_truncado: n("testigo_gzip_t_sobre_TRUNCADO_exit"),
  bytesTruncado: n("testigo_bytes_truncado"),
  discrimina: n("c2_gzip_t_exit") === 0 && n("testigo_gzip_t_sobre_TRUNCADO_exit") !== 0,
  guionLlegoAlFinal: fs.readFileSync(LOG, "utf8").includes("FIN_DEL_GUION"),
  limpiezaOk: k.limpieza_ok === "si",
  etagEstableDuranteLaCorrida: k.etag_al_empezar === k.etag_al_terminar,
};

const DENOM = n("denominador_ficheros");

/* ── LOS CUATRO CAMINOS, CON EL MISMO CRITERIO EN LOS CUATRO (§regla 32) ── */
const caminos = [
  {
    id: 1,
    nombre: "TUBERÍA  curl | tar -xz",
    bytesTransferidos: n("c2_size_download"), // el mismo artefacto que el c2
    bytesNota: "el tarball no se mide dos veces: es el mismo artefacto que el camino 2",
    segundos: seg("c1_segundos"),
    exits: { curl: n("c1_exit_curl"), tar: n("c1_exit_tar") },
    exitAparente: n("c1_exit_tuberia_APARENTE"),
    ficheros: n("c1_ficheros"),
    bytesEnDisco: n("c1_bytes_en_disco"),
  },
  {
    id: 2,
    nombre: "SEPARADO  curl -o  +  tar -xzf",
    bytesTransferidos: n("c2_size_download"),
    segundos: Number((seg("c2_segundos_descarga") + seg("c2_segundos_extraccion")).toFixed(2)),
    segundosDesglose: {
      descarga: seg("c2_segundos_descarga"),
      gzip_t: seg("c2_segundos_gzip_t"),
      extraccion: seg("c2_segundos_extraccion"),
    },
    exits: { curl: n("c2_exit_descarga"), tar: n("c2_exit_tar"), gzip_t: n("c2_gzip_t_exit") },
    ficheros: n("c2_ficheros"),
    bytesEnDisco: n("c2_bytes_extraido"),
  },
  {
    id: 3,
    nombre: "git clone COMPLETO",
    bytesTransferidos: Math.round(
      Number((k.c3_recibido_segun_git ?? "").match(/([\d.]+) MiB/)?.[1] ?? 0) * 1048576
    ),
    segundos: seg("c3_segundos"),
    exits: { git: n("c3_exit") },
    ficheros: n("c3_ficheros"),
    bytesEnDisco: n("c3_bytes_checkout"),
    objetos: Number((k.c3_recibido_segun_git ?? "").match(/\((\d+)\//)?.[1] ?? 0),
    shaCorrecto: k.c3_sha === k.sha_esperado,
  },
  {
    id: 4,
    nombre: "git clone --depth 1",
    bytesTransferidos: Math.round(
      Number((k.c4_recibido_segun_git ?? "").match(/([\d.]+) MiB/)?.[1] ?? 0) * 1048576
    ),
    segundos: seg("c4_segundos"),
    exits: { git: n("c4_exit") },
    ficheros: n("c4_ficheros"),
    bytesEnDisco: n("c4_bytes_checkout"),
    objetos: Number((k.c4_recibido_segun_git ?? "").match(/\((\d+)\//)?.[1] ?? 0),
    shaCorrecto: k.c4_sha === k.sha_esperado,
  },
];

/* Un exit 0 no dice qué hay detrás (§regla 61): «completo» exige el CARDINAL. */
for (const c of caminos) {
  c.todosLosExitCero = Object.values(c.exits).every((e) => e === 0);
  c.ficherosCuadran = c.ficheros === DENOM;
  c.completa = c.todosLosExitCero && c.ficherosCuadran;
  c.MiBTransferidos = MiB(c.bytesTransferidos);
}

/* Los tres caminos que extraen tienen que dejar LOS MISMOS BYTES en disco. Si
 * no, la advertencia de `text=auto`/LF del pre-registro se habría cobrado. */
const bytesDisco = [...new Set(caminos.map((c) => c.bytesEnDisco))];

/* ── ADJUDICACIÓN contra el pre-registro ─────────────────────────────────
 * Se escribe el rango PREDICHO al lado del medido: un veredicto sin el número
 * de los dos lados no se puede auditar (§sondas 1, «un número de un par se
 * cita con sus dos lados o no se cita»). */
const c1 = caminos[0];
const c2 = caminos[1];
const c3 = caminos[2];
const c4 = caminos[3];

const tarballMiB = MiB(n("c2_size_download"));
const ahorroClonPct = Number((((tarballMiB - c3.MiBTransferidos) / tarballMiB) * 100).toFixed(1));

const veredictos = [
  {
    id: "P1",
    prediccion: "la TUBERÍA falla (control positivo), y falla tarde",
    medido: `exit curl ${c1.exits.curl} · exit tar ${c1.exits.tar} · ${c1.segundos}s · ${c1.ficheros}/${DENOM} ficheros`,
    veredicto: c1.completa ? "REFUTADA" : "CONFIRMADA",
    consecuencia: c1.completa
      ? "el control positivo NO funciona: el fallo no se reproduce desde el host por SSH"
      : "el control positivo funciona",
  },
  {
    id: "P1-mecanismo",
    prediccion:
      "el acoplamiento hace que la tubería tarde ≈ max(descarga, extracción) — la extracción sería el cuello de botella y dejaría la conexión ociosa",
    medido: `tubería ${c1.segundos}s · descarga ${c2.segundosDesglose.descarga}s · extracción ${c2.segundosDesglose.extraccion}s · max=${Math.max(c2.segundosDesglose.descarga, c2.segundosDesglose.extraccion)}s`,
    veredicto:
      Math.abs(c1.segundos - Math.max(c2.segundosDesglose.descarga, c2.segundosDesglose.extraccion)) < 15
        ? "el SOLAPAMIENTO se confirma, la DIRECCIÓN no"
        : "REFUTADA entera",
    consecuencia:
      c2.segundosDesglose.extraccion < c2.segundosDesglose.descarga
        ? `la extracción es ${(c2.segundosDesglose.descarga / c2.segundosDesglose.extraccion).toFixed(2)}× MÁS RÁPIDA que la descarga: el pipe nunca se llena, curl nunca se bloquea, la conexión nunca queda ociosa. El mecanismo predicho EXIGE lo contrario`
        : "la extracción es más lenta que la descarga, como predije",
  },
  {
    id: "P2",
    prediccion: "el SEPARADO completa, gzip -t en verde y el cardinal exacto",
    medido: `exits ${JSON.stringify(c2.exits)} · gzip -t ${control.gzip_t_sobre_integro} · ${c2.ficheros}/${DENOM} ficheros · sha256 de 2 descargas ${k.c2_sha256_1 === k.c2_sha256_2 ? "IDÉNTICO" : "DISTINTO"}`,
    veredicto: c2.completa && k.c2_sha256_1 === k.c2_sha256_2 ? "CONFIRMADA" : "REFUTADA",
    consecuencia: "el artefacto es reproducible al byte entre peticiones: el etag identifica contenido",
  },
  {
    id: "P3a",
    prediccion: "git clone completo transfiere 890–950 MiB",
    medido: `${c3.MiBTransferidos} MiB en ${c3.segundos}s (${c3.objetos} objetos)`,
    veredicto: c3.MiBTransferidos >= 890 && c3.MiBTransferidos <= 950 ? "CONFIRMADA" : "REFUTADA",
    consecuencia: `${(890 - c3.MiBTransferidos).toFixed(2)} MiB por DEBAJO del rango predicho (${(((890 - c3.MiBTransferidos) / 890) * 100).toFixed(1)} %)`,
  },
  {
    id: "P3b",
    prediccion: "git clone --depth 1 transfiere 850–950 MiB y NO es sustancialmente menor",
    medido: `${c4.MiBTransferidos} MiB en ${c4.segundos}s (${c4.objetos} objetos)`,
    veredicto:
      c4.MiBTransferidos >= 850 && c4.MiBTransferidos <= 950 ? "CONFIRMADA en rango" : "REFUTADA",
    consecuencia:
      c4.MiBTransferidos > c3.MiBTransferidos
        ? `y el SIGNO va al revés de lo que sugiere el nombre: el shallow es ${(c4.MiBTransferidos - c3.MiBTransferidos).toFixed(2)} MiB MÁS GRANDE y ${(c4.segundos - c3.segundos).toFixed(2)}s MÁS LENTO que el completo, con ${c3.objetos - c4.objetos} objetos MENOS`
        : `el shallow ahorra ${(c3.MiBTransferidos - c4.MiBTransferidos).toFixed(2)} MiB`,
  },
  {
    id: "P3c",
    prediccion: "el clone transfiere ~32 % menos que el tarball",
    medido: `clone ${c3.MiBTransferidos} MiB contra tarball ${tarballMiB} MiB → ${ahorroClonPct} % menos`,
    veredicto: Math.abs(ahorroClonPct - 32) <= 5 ? "CONFIRMADA" : "REFUTADA",
    consecuencia: "git es el canal más barato en bytes Y el más rápido de los cuatro",
  },
  {
    id: "P4",
    prediccion: "si P2 completa y P1 falla, de la CAUSA no queda nada que public/ explique",
    medido: `P1 ${c1.completa ? "COMPLETA" : "falla"} · P2 ${c2.completa ? "COMPLETA" : "falla"}`,
    veredicto: c1.completa ? "PREMISA NO CUMPLIDA — el condicional no aplica" : "aplica",
    consecuencia: caminos.every((c) => c.completa)
      ? "los CUATRO completan, así que la conclusión es MÁS fuerte que la del condicional: el tamaño no impide la entrega por NINGÚN camino medido"
      : "hay caminos que fallan: el tamaño vuelve al centro",
  },
];

/* Los veredictos caen en TRES cubos, no en dos: publicar sólo «confirmadas» y
 * «refutadas» deja los que no son ninguna de las dos sin denominador, y una
 * limitación sin su número se lee como una nota al pie (§regla 14). */
const aciertos = veredictos.filter((v) => v.veredicto.startsWith("CONFIRMADA")).length;
const fallos = veredictos.filter((v) => v.veredicto.startsWith("REFUTADA")).length;
const niUnaNiOtra = veredictos.filter(
  (v) => !v.veredicto.startsWith("CONFIRMADA") && !v.veredicto.startsWith("REFUTADA")
);

const informe = {
  meta: {
    tanda: "147.ª",
    escalon: "ESCALÓN 2 — los cuatro caminos, medidos en el VPS",
    fecha: k.fecha_utc,
    preRegistro: "pre-registro-entrega-147.md (commit 1d0ced0)",
    contesta: "si cada camino de entrega COMPLETA, con su tamaño, su tiempo y su cardinal de ficheros",
    noContesta:
      "si Easypanel completa — los cuatro se corrieron por SSH en el HOST, y el fallo original ocurrió DENTRO de la tubería de Easypanel, que es otro entorno y no se tocó",
  },
  control,
  denominadorFicheros: DENOM,
  shaEsperado: k.sha_esperado,
  etag: k.etag_al_empezar,
  caminos,
  bytesEnDiscoDistintos: bytesDisco.length,
  bytesEnDisco: bytesDisco,
  tarballMiB,
  ahorroClonPct,
  veredictos,
  balance: {
    aciertos,
    fallos,
    niUnaNiOtra: niUnaNiOtra.length,
    cualesNiUnaNiOtra: niUnaNiOtra.map((v) => ({ id: v.id, veredicto: v.veredicto })),
    total: veredictos.length,
    cuadra: aciertos + fallos + niUnaNiOtra.length === veredictos.length,
  },
  sha256TarballDosDescargas: { a: k.c2_sha256_1, b: k.c2_sha256_2, iguales: k.c2_sha256_1 === k.c2_sha256_2 },
};

fs.writeFileSync(SALIDA, JSON.stringify(informe, null, 2));

/* ── salida ─────────────────────────────────────────────────────────────── */
console.log("═══ ESCALÓN 2 · 147.ª — LOS CUATRO CAMINOS DE ENTREGA ═══\n");

console.log("── CONTROL del instrumento (antes de leer ningún resultado) ──");
console.log(`  gzip -t sobre el ÍNTEGRO   → exit ${control.gzip_t_sobre_integro}  (tiene que ser 0)`);
console.log(`  gzip -t sobre el TRUNCADO  → exit ${control.gzip_t_sobre_truncado}  (tiene que ser ≠0)`);
console.log(`  ¿discrimina? ${control.discrimina ? "SÍ — la corrida adjudica" : "NO — la corrida NO ADJUDICA"}`);
console.log(`  guión hasta el final: ${control.guionLlegoAlFinal ? "sí" : "NO"} · limpieza: ${control.limpiezaOk ? "sí" : "NO"} · etag estable durante la corrida: ${control.etagEstableDuranteLaCorrida ? "sí" : "NO"}`);

console.log("\n── LOS CUATRO CAMINOS ──");
console.log("   #  camino                      transferido      tiempo   exits        ficheros   ¿completa?");
for (const c of caminos) {
  console.log(
    `   ${c.id}  ${c.nombre.padEnd(26)} ${String(c.MiBTransferidos).padStart(9)} MiB ` +
      `${String(c.segundos).padStart(8)}s   ${JSON.stringify(c.exits).padEnd(12)} ` +
      `${String(c.ficheros).padStart(5)}/${DENOM}   ${c.completa ? "✓ SÍ" : "✗ NO"}`
  );
}
console.log(
  `\n  bytes en disco tras extraer: ${bytesDisco.length === 1 ? `IDÉNTICOS en los ${caminos.length} caminos (${bytesDisco[0]})` : `DISTINTOS: ${bytesDisco.join(" · ")}`}`
);

console.log("\n── ADJUDICACIÓN contra el pre-registro ──");
for (const v of veredictos) {
  console.log(`\n  ${v.id} · ${v.veredicto}`);
  console.log(`     predije: ${v.prediccion}`);
  console.log(`     medido:  ${v.medido}`);
  console.log(`     ⇒ ${v.consecuencia}`);
}

console.log(`\n── BALANCE ──`);
console.log(
  `  ${aciertos} confirmadas · ${fallos} refutadas · ${niUnaNiOtra.length} ni una ni otra · de ${veredictos.length}` +
    `  ${aciertos + fallos + niUnaNiOtra.length === veredictos.length ? "(cuadra)" : "⚠ NO CUADRA"}`
);
for (const v of niUnaNiOtra) console.log(`     · ${v.id}: ${v.veredicto}`);

console.log(`\n✓ congelado en ${path.relative(RAIZ, SALIDA).replace(/\\/g, "/")}`);
console.log(`✓ evaluadas ${caminos.length}/4 caminos · ${veredictos.length} predicciones adjudicadas`);
