/**
 * 122.ª · ¿SEPARA DE VERDAD `casi-toda-sin-comparar`, O PASABA YA?
 *
 * El caso nuevo de los dos negativos exige la frase del contrato —«NO SE PUDO
 * EVALUAR … 1 de 426»— sobre una base en la que 425 páginas no se midieron. Que
 * el caso salga VERDE no prueba nada por sí solo: §regla 8 —*un sabotaje que no
 * cambia el resultado no ha probado la guarda*— y §F3-2 —*un modelo se elige por
 * lo que lo SEPARA, no por lo que acierta*—. Hay que contar las **instancias
 * separadoras**, o sea preguntar qué habría hecho el listón VIEJO con el MISMO
 * dato.
 *
 * ── Por qué esto no se contesta razonando ─────────────────────────────────
 * Se podría escribir «con `minimo: 1`, `1 ≥ 1` ⇒ suficiente» y sonaría
 * concluyente. Pero eso es una afirmación sobre `Evaluadas`, no una medida de
 * `Evaluadas`: el veredicto no lo da `suficiente()` sino **el gancho de salida**
 * (§sondas 4bis), que es el que decide si el proceso grita y con qué código
 * sale. Así que se ejercita **la clase real, en un proceso real**, con los dos
 * listones y el mismo `ok(1)`.
 *
 * El fixture se ESCRIBE a fichero y se lanza con `spawnSync`: no pasa por el
 * shell (§regla 13) y no toca ninguna sonda del repo (§regla 20: un sabotaje no
 * edita el fuente).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const LIB = new URL("../../../../scripts/qa/lib.mjs", import.meta.url).href;
const DIR = join(tmpdir(), "sep-minimo-122");
mkdirSync(DIR, { recursive: true });

const L = [];
const di = (s = "") => {
  L.push(s);
  console.log(s);
};

/**
 * El fixture reproduce EXACTAMENTE lo que hace el segundo contrato de las dos
 * sondas: un `Evaluadas` con su listón y un `ok(comparadas)`. Nada más — si
 * hiciera algo más, no estaría midiendo el contrato.
 */
const fixture = (minimo, comparadas) =>
  [
    `import { Evaluadas } from ${JSON.stringify(LIB)};`,
    `const ev = new Evaluadas({ nombre: "fixture cmp", unidad: "rutas comparadas", minimo: ${minimo} });`,
    `ev.ok(${comparadas});`,
    `console.log("SUFICIENTE=" + ev.suficiente());`,
  ].join("\n");

function corre(etiqueta, minimo, comparadas) {
  const f = join(DIR, `${etiqueta}.mjs`);
  writeFileSync(f, fixture(minimo, comparadas));
  const r = spawnSync(process.execPath, [f], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  return { exit: r.status, grita: /NO SE PUDO EVALUAR/.test(out), suficiente: /SUFICIENTE=true/.test(out) };
}

/* ── EL DATO ES EL MISMO EN LOS DOS: 1 comparada de 426 ──────────────────── */
const COMPARADAS = 1;
const COMUNES = 426;

di(`\n════════ SEPARADORA · el listón del 2.º contrato (122.ª) ════════\n`);
di(`  dato IDÉNTICO en los dos lados: ${COMPARADAS} comparada, ${COMUNES} en común`);
di(`  lo único que cambia es el LISTÓN\n`);

const viejo = corre("viejo-minimo-1", 1, COMPARADAS);
const nuevo = corre("nuevo-derivado", `Math.max(1, ${COMUNES})`, COMPARADAS);

di(`  LISTÓN VIEJO   minimo: 1                       → exit ${viejo.exit} · grita ${viejo.grita} · suficiente ${viejo.suficiente}`);
di(`  LISTÓN NUEVO   minimo: Math.max(1, ${COMUNES})       → exit ${nuevo.exit} · grita ${nuevo.grita} · suficiente ${nuevo.suficiente}`);
di("");

const separa = viejo.grita !== nuevo.grita && viejo.exit !== nuevo.exit;
di(
  separa
    ? `  ✅ SEPARA · 1 instancia separadora. Con el listón viejo el contrato daba el mismo dato\n` +
        `     por SUFICIENTE y salía con 0; con el derivado grita y sale ≠0. El caso del\n` +
        `     negativo mide el arreglo, no la aritmética.`
    : `  ❌ NO SEPARA · 0 instancias separadoras: el caso pasaría igual con el listón viejo,\n` +
        `     así que su verde no dice nada del arreglo (§regla 17, 2.ª cara).`,
);

/* ── Y el CONTRARIO, que es la otra mitad: el caso obvio NO separa ────────── */
di(`\n  ── Contraste: la base AJENA (0 comparadas de 0 en común) ──`);
const ajenoViejo = corre("ajeno-viejo", 1, 0);
const ajenoNuevo = corre("ajeno-nuevo", "Math.max(1, 0)", 0);
di(`  LISTÓN VIEJO   minimo: 1              → exit ${ajenoViejo.exit} · grita ${ajenoViejo.grita}`);
di(`  LISTÓN NUEVO   minimo: Math.max(1, 0) → exit ${ajenoNuevo.exit} · grita ${ajenoNuevo.grita}`);
const ajenoSepara = ajenoViejo.grita !== ajenoNuevo.grita;
di(
  ajenoSepara
    ? `  (separa)`
    : `  ⚠ NO SEPARA, y está bien que se diga: \`base-ajena\` es el caso que primero se le\n` +
        `    ocurre a cualquiera y tiene **0 instancias separadoras** para este arreglo —\n` +
        `    pasaba antes y pasa después. Lo que prueba es el SUELO \`Math.max(1, …)\`, sin\n` +
        `    el cual el listón valdría 0 y no habría veredicto que dar.`,
);

di("");
writeFileSync(new URL("separadora-minimo-122.log", import.meta.url), L.join("\n") + "\n");
process.exit(separa ? 0 : 1);
