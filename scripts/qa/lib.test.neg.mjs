/**
 * EL NEGATIVO DE `qa:lib` — el guardián del contrato, ¿declaraba el suyo?
 * Uso: npm run qa:lib-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * `lib.test.mjs` es el fichero que obliga a las 211 sondas a declarar cuántas
 * unidades deben evaluar. Hasta la 111.ª tanda **el suyo lo ponía el objeto que
 * examina**: el único `Evaluadas` del fichero era el fixture de
 * `Evaluadas.ok()`, con `minimo: 1` y unidad `filas`. Tres cifras en tres
 * unidades —114 casos afirmados, 10 `ev.ok(` contados, 1 de mínimo— y la
 * consecuencia medible: **un recorte del dominio salía VERDE**.
 *
 * ── LA TABLA ─────────────────────────────────────────────────────────────
 * | caso              | qué anula                     | qué tiene que pasar |
 * |-------------------|-------------------------------|---------------------|
 * | `control`         | nada                          | 114/114 casos, exit 0, y las DOS líneas de unidades distinguibles |
 * | `dominio-corto`   | el DOMINIO (no el umbral)     | la sonda imprime `✅ 14/14` **y aun así** sale ≠0 por el contrato |
 * | `separadoras`     | —                             | con el contrato VIEJO el mismo recorte salía 0 por DOS caminos; con el derivado, ≠0 |
 *
 * ⚠ **El sabotaje va en el DATO, no en el umbral** (§regla 28a). Bajar el
 * mínimo no habría probado nada: lo que hay que reproducir es el modo de fallo
 * —una corrida que se para a la mitad y se lee como completa—, no la aritmética
 * de la condición.
 *
 * ⚠ **Y el caso `separadoras` es el que hace que este negativo signifique
 * algo** (§regla 22 / *0 instancias separadoras*): control y sabotaje en verde
 * y rojo no dicen que el ARREGLO haga nada — sólo que hoy discrimina. Lo que
 * dice que el arreglo hace algo es que el contrato VIEJO predecía verde en las
 * dos posiciones posibles del recorte, y el derivado predice rojo.
 *
 * ⚠ **Alcance declarado con su cardinal** (§regla 14): este negativo NO prueba
 * que las 114 aserciones de `lib.test.mjs` sean correctas — prueba que si
 * dejan de correr, se nota. Y `negativos.mjs` lo clasifica como
 * `conNavegador` porque su fuente efectiva incluye `lib.test.mjs`, que llama a
 * `iniciarClon(`: queda censado pero FUERA del lote barato, y eso es honesto —
 * la sonda intenta levantar un servidor en su bloque 3.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Evaluadas, hoy, w } from "./lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const SONDA = join(AQUI, "lib.test.mjs");
const LIB = JSON.stringify(new URL("./lib.mjs", import.meta.url).href);
const TMP = mkdtempSync(join(tmpdir(), "kq-libneg-"));

const corre = (env, etiqueta) => {
  const r = spawnSync(process.execPath, [SONDA], {
    cwd: RAIZ,
    env: { ...process.env, SABOTAJE: "", ...env },
    encoding: "utf8",
    timeout: 600_000,
  });
  const salida = (r.stdout ?? "") + (r.stderr ?? "");
  console.log(`   [${etiqueta}] exit ${r.status === null ? "AGOTADO" : r.status} · ${salida.split("\n").length} líneas`);
  return { exit: r.status, salida };
};

/** Un guion suelto: demuestra el MECANISMO de `Evaluadas`, no la sonda. */
let iGuion = 0;
const guion = (cuerpo) => {
  const f = join(TMP, `g-${++iGuion}.mjs`);
  writeFileSync(f, cuerpo);
  const r = spawnSync(process.execPath, [f], { encoding: "utf8", env: { ...process.env, SIN_CONTRATO: "" } });
  return { exit: r.status, salida: (r.stdout || "") + (r.stderr || "") };
};

/**
 * El CANAL INDEPENDIENTE de «cuántos casos corrieron»: se cuentan las líneas
 * que la sonda IMPRIMIÓ, no se vuelve a aplicar su mismo patrón sobre su mismo
 * fuente. Dos instrumentos que derivan del mismo fichero concuerdan igual de
 * bien sobre una premisa verdadera que sobre una falsa (§regla 15).
 */
const impresos = (salida) =>
  salida.split("\n").filter((l) => /^ {2}[✓❌] /.test(l) && !/evaluadas /.test(l)).length;

const casos = [];
const apunta = (nombre, ok, detalle) => { casos.push({ nombre, ok, detalle }); console.log(`   ${ok ? "✓" : "✗"} ${nombre}: ${detalle}`); ev.ok(); };

/* ── EL CONTRATO DE ESTE NEGATIVO ──────────────────────────────────────────
 * Mismo criterio que `kb-barra.neg`: el mínimo se DERIVA contando `apunta(` en
 * columna 0 del propio fuente, no de `casos.length` —que se construye sobre la
 * marcha y haría que diez casos y tres dieran los dos «suficiente» (§regla 17,
 * *un sabotaje que comparte variable con el mínimo mueve la portería*)—. Y no
 * se escribe un 10, porque un literal envejece CONTRA el fichero (§regla 9). */
const NCASOS = (readFileSync(fileURLToPath(import.meta.url), "utf8").match(/^apunta\(/gm) ?? []).length;
const ev = new Evaluadas({ nombre: "lib.test-neg", unidad: "casos", minimo: NCASOS });

console.log(`\n═══ lib.test.neg · ¿sabe fallar el guardián del contrato? ═══\n`);

/* ── 1 · CONTROL — sin sabotaje. Es lo que da sentido a los demás (§regla 8) ─ */
console.log("1 · control (sin sabotaje)");
const ctl = corre({}, "control");
const decl = ctl.salida.match(/evaluadas (\d+)\/(\d+) casos · lib\.test\b/);
const nCtl = impresos(ctl.salida);

apunta(
  "control · alcanza su dominio entero y sale VERDE",
  ctl.exit === 0 && !!decl && decl[1] === decl[2],
  `exit ${ctl.exit} · ${decl ? `evaluadas ${decl[1]}/${decl[2]} casos` : "SIN línea de unidades — el contrato no llegó a hablar"}`,
);
/* El mínimo se DERIVA, no se escribe — y eso no se comprueba leyendo el fuente
 * (§regla 3: *documentado no es conectado*), se comprueba viendo si RESPONDE.
 * Se ejercita sobre el IDIOMA en dos guiones con distinto nº de casos, porque
 * añadir un `eq` al fichero real sería editar un fuente versionado y un
 * sabotaje que edita el fuente sobrevive a la muerte de su corrida (§regla 20).
 *
 * ⚠ ALCANCE, con su límite dicho (§regla 14): esto prueba que **el idioma**
 * sube el listón solo. Que `lib.test.mjs` use ese idioma y no un `114` escrito
 * lo prueba el caso de al lado, que compara su mínimo contra un canal
 * independiente —las líneas que imprimió—. Ninguno de los dos solo basta. */
const conKCasos = (k) =>
  guion(
    `import { Evaluadas } from ${LIB};\n` +
      `import { readFileSync } from "node:fs";\n` +
      `import { fileURLToPath } from "node:url";\n` +
      `const eq = () => {};\n` +
      `const N = (readFileSync(fileURLToPath(import.meta.url), "utf8").match(/^\\s*eq\\(/gm) ?? []).length;\n` +
      `const ev = new Evaluadas({ unidad: "casos", minimo: N });\n` +
      `console.log("MINIMO=" + N);\n` +
      Array.from({ length: k }, (_, i) => `eq(${i});\n`).join("") +
      `ev.ok(N);\n` +
      `process.exit(0);\n`,
  );
const leeMin = (r) => Number((r.salida.match(/MINIMO=(\d+)/) ?? [])[1] ?? NaN);
const k3 = leeMin(conKCasos(3));
const k7 = leeMin(conKCasos(7));
apunta(
  "control · el mínimo RESPONDE al fuente: un caso más sube el listón solo",
  k3 === 3 && k7 === 7,
  `3 casos ⇒ mínimo ${k3} · 7 casos ⇒ mínimo ${k7} — un literal daría el mismo número en los dos`,
);
apunta(
  "control · el mínimo DERIVADO cuadra con los casos que de verdad corrieron",
  !!decl && Number(decl[2]) === nCtl,
  `${nCtl} líneas de caso impresas contra un mínimo declarado de ${decl?.[2]} — canal independiente del patrón del fuente`,
);
apunta(
  "control · las DOS líneas de unidades se distinguen: el fixture sale NOMBRADO",
  /evaluadas \d+\/1 filas · FIXTURE de ok\(\)/.test(ctl.salida),
  "un fichero con dos `Evaluadas` y una sola línea sin nombre son dos canales de verdad para una pregunta",
);

/* ── 2 · DOMINIO CORTO — el sabotaje en el DATO (§regla 28a) ─────────────── */
console.log("\n2 · dominio-corto");
const sab = corre({ SABOTAJE: "dominio-corto" }, "dominio-corto");
const nSab = impresos(sab.salida);
const gritado = sab.salida.match(/NO SE PUDO EVALUAR · lib\.test — (\d+) de (\d+) casos/);

apunta(
  "dominio-corto · la sonda imprime su VERDE plausible, que es el modo de fallo",
  new RegExp(`✅ ${nSab}/${nSab}\\b`).test(sab.salida),
  `\`✅ ${nSab}/${nSab}\` — un número perfectamente plausible; nadie sabría que se declararon ${decl?.[2]}`,
);
apunta(
  "dominio-corto · …y AUN ASÍ sale rojo, porque el contrato no es su recuento",
  sab.exit !== 0 && !!gritado,
  `exit ${sab.exit} · ${gritado ? `«${gritado[1]} de ${gritado[2]} casos»` : "SIN grito — el recorte pasó desapercibido"}`,
);
apunta(
  "dominio-corto · el grito nombra la unidad y el hueco, no un booleano",
  !!gritado && Number(gritado[1]) === nSab && Number(gritado[2]) === nCtl,
  gritado ? `contó ${gritado[1]}, esperaba ${gritado[2]}, faltaron ${gritado[2] - gritado[1]}` : "—",
);
apunta(
  "dominio-corto · el sabotaje TIENE CON QUÉ MORDER: el corte es menor que el mínimo",
  nSab > 0 && nSab < nCtl,
  `corte ${nSab} < mínimo ${nCtl} — si fueran iguales el caso saldría verde por construcción, con 0 instancias separadoras`,
);

/* ── 3 · LAS SEPARADORAS — ¿el arreglo hace algo? ─────────────────────────
 * El recorte puede caer ANTES o DESPUÉS del fixture, y el contrato viejo era
 * verde en los dos casos. Se demuestra ejecutando el mecanismo, no razonándolo. */
console.log("\n3 · separadoras (el contrato VIEJO contra el derivado)");
const viejoAntes = guion(
  `import { w } from ${LIB};\n` +
    `process.env.SIN_CONTRATO = "1";\n` +
    `console.log("la sonda cree que ha terminado bien");\n` +
    `process.exit(0);\n`,
);
apunta(
  "SEPARADORA · viejo, recorte ANTES del fixture: CERO `Evaluadas` ⇒ exit 0 y mudo",
  viejoAntes.exit === 0 && !/NO SE PUDO EVALUAR/.test(viejoAntes.salida),
  `exit ${viejoAntes.exit} — sin ninguna instancia registrada no hay contador al que gritar`,
);
const viejoDespues = guion(
  `import { Evaluadas } from ${LIB};\n` +
    `const ev = new Evaluadas({ unidad: "filas", minimo: 1 });\n` +
    `ev.ok(15);\n` +
    `process.exit(0);\n`,
);
apunta(
  "SEPARADORA · viejo, recorte DESPUÉS: `minimo: 1` con 15 contadas ⇒ exit 0 igual",
  viejoDespues.exit === 0,
  `exit ${viejoDespues.exit} — 15 ≥ 1: el mínimo no podía distinguir 114 casos de 14`,
);
const derivado = guion(
  `import { Evaluadas } from ${LIB};\n` +
    `const ev = new Evaluadas({ unidad: "casos", minimo: ${nCtl} });\n` +
    `ev.ok(${nSab});\n` +
    `process.exit(0);\n`,
);
apunta(
  "SEPARADORA · derivado: el MISMO recuento contra el mínimo del fuente ⇒ ≠0",
  derivado.exit !== 0 && /NO SE PUDO EVALUAR/.test(derivado.salida),
  `exit ${derivado.exit} · ${nSab} de ${nCtl} — 2 instancias separadoras, no 0`,
);

/* ── VEREDICTO ──────────────────────────────────────────────────────────── */
const mal = casos.filter((c) => !c.ok);
console.log(`\n═══ VEREDICTO · ${casos.length - mal.length}/${casos.length} casos`);
for (const c of mal) console.log(`   ✗ ${c.nombre} — ${c.detalle}`);
console.log(`\n  · el par que se cita: control exit ${ctl.exit} · dominio-corto exit ${sab.exit}`);
console.log(`  ⚠ lo que este negativo NO prueba: que las ${nCtl} aserciones de \`lib.test\` sean CORRECTAS.`);
console.log(`     Prueba que si dejan de correr, se nota — que es otra afirmación.\n`);

w(join(AQUI, "medidas", "lib-test-neg.json"), {
  meta: {
    fecha: hoy(),
    sonda: "lib.test.neg",
    alcance: "el CONTRATO de qa:lib — no la corrección de sus aserciones",
  },
  derivado: { casosDeclarados: nCtl, corteDelSabotaje: nSab },
  exits: { control: ctl.exit, dominioCorto: sab.exit },
  separadoras: {
    viejoRecorteAntes: viejoAntes.exit,
    viejoRecorteDespues: viejoDespues.exit,
    derivado: derivado.exit,
    n: 2,
  },
  casos: casos.map((c) => ({ nombre: c.nombre, ok: c.ok })),
});

rmSync(TMP, { recursive: true, force: true });
const veredicto = ev.informe();
process.exitCode = veredicto || (mal.length ? 1 : 0);
