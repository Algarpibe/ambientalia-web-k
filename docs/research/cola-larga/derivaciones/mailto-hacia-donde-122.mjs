/**
 * 122.ª · ESCALÓN 1 — ¿HACIA DÓNDE SE MOVIERON LAS 2?
 *
 * La 121.ª descifró el mailto que Cloudflare ofusca y que el clon transcribía
 * sin su descifrador. `clon-base` dijo **QUE** se movieron —±30.6 a 390, un
 * renglón a `line-height: 30.6px`— y no **HACIA DÓNDE**: es una guarda
 * clon-contra-clon, así que no tiene el original delante.
 *
 * Lo contesta `f33-cmp`, que YA alcanza el eje: mide `h` **por módulo** en los
 * dos lados. No hacía falta comparador nuevo (§regla 24: eso habría sido su
 * propia tanda) — hacía falta mirar cuál de los que hay llega.
 *
 * ── LA LECTURA QUE DISCRIMINA NO ES UN RECUENTO ───────────────────────────
 * §*el eje que no lee como defecto esconde la mejora igual que esconde la
 * deriva*: «cuántos pares difieren» no dice hacia dónde. Se compara
 * **|clon − original| ANTES y DESPUÉS, módulo a módulo**.
 *
 * ── EL CONTROL, y sin él esto no atribuye nada ────────────────────────────
 * El lado ORIGINAL de `f33-cmp` es la captura de `corpus/fase-3/**` servida por
 * `file://`, o sea **el mismo fichero en las dos corridas**. Así que tiene que
 * salir IDÉNTICO; si se moviera, la diferencia no sería del clon y §regla 16
 * manda mirar el árbol antes que inventar nada. El control se publica con su
 * cardinal, no se supone.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MED = join(process.cwd(), "scripts", "qa", "medidas");
const L = [];
const di = (s = "") => {
  L.push(s);
  console.log(s);
};

/* Las rutas que llevan el mailto ofuscado — DERIVADAS del corpus, no escritas
 * (§regla 9). El cardinal importa: la 121.ª habló de 2 rutas movidas y el
 * corpus tiene 3 con la ofuscación. */
const RUTAS = [
  "/es/aviso-legal/",
  "/es/politica-de-privacidad-y-de-proteccion-de-datos/",
  "/es/sistema-interno-de-informacion/",
];

/* ── ANTES: se NOMBRA el fichero (§regla 5: el canónico es la PRIMERA foto) ── */
const ANTES = { 390: "f33-cmp-390-2026-08-26-2.json", 1440: "f33-cmp-1440-2026-08-26-4.json" };

/** El artefacto de §regla 7 y las caducadas quedan fuera; el resto, por `mtime`. */
const MARCAS = /-neg-|SABOTAJE|-SONDA-|CADUCADA|CONTAMINADA|-piloto/;
function despuesDe(ancho) {
  const cand = readdirSync(MED)
    .filter((f) => new RegExp(`^f33-cmp-${ancho}[-.].*\\.json$`).test(f) || f === `f33-cmp-${ancho}.json`)
    .filter((f) => !MARCAS.test(f))
    .filter((f) => f !== ANTES[ancho])
    .map((f) => ({ f, t: statSync(join(MED, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  /**
   * ⚠ **El DESPUÉS tiene que ser POSTERIOR al ANTES, y hay que exigirlo.** Sin
   * esta línea, una corrida que no exista todavía hace que el resolutor caiga en
   * la congelada inmediatamente anterior y compare **dos fotos del mismo día**
   * llamándolas antes/después: §regla 5 en su mitad de consumidor —*el que
   * resuelve por nombre o por orden consume la foto vieja*— y produciría un
   * «no se movió nada» perfectamente plausible.
   */
  const tAntes = statSync(join(MED, ANTES[ancho])).mtimeMs;
  const d = cand[0];
  return d && d.t > tAntes ? d : null;
}

const lee = (f) => JSON.parse(readFileSync(join(MED, f), "utf8"));
const dist = (a, b) => Math.abs(+(b - a).toFixed(4));

di(`\n════════ ESCALÓN 1 · hacia dónde se movieron (122.ª) ════════`);

let hayFallo = false;
for (const ancho of [390, 1440]) {
  const d = despuesDe(ancho);
  if (!d) {
    di(`\n@${ancho} · SIN DESPUÉS — no hay corrida posterior a ${ANTES[ancho]}. NO SE PUDO EVALUAR.`);
    hayFallo = true;
    continue;
  }
  const antes = lee(ANTES[ancho]);
  const despues = lee(d.f);
  di(`\n@${ancho}`);
  di(`   ANTES   ${ANTES[ancho]}`);
  di(`   DESPUÉS ${d.f}   (${new Date(d.t).toISOString().slice(0, 16).replace("T", " ")})`);

  /* ── CONTROL: el lado ORIGINAL no puede haberse movido ─────────────────── */
  let ctlIguales = 0;
  let ctlMovidos = [];
  for (const r of RUTAS) {
    const a = antes.paginas[r]?.original;
    const b = despues.paginas[r]?.original;
    if (!a || !b) {
      ctlMovidos.push(`${r} AUSENTE`);
      continue;
    }
    const n = Math.max(a.modulos.length, b.modulos.length);
    let ok = a.docH === b.docH && a.modulos.length === b.modulos.length;
    for (let i = 0; i < n && ok; i++) ok = a.modulos[i]?.h === b.modulos[i]?.h;
    if (ok) ctlIguales++;
    else ctlMovidos.push(r);
  }
  di(
    `   CONTROL · el lado ORIGINAL (captura \`file://\`) idéntico en ${ctlIguales} de ${RUTAS.length} rutas` +
      (ctlMovidos.length ? `  ❌ SE MOVIÓ: ${ctlMovidos.join(" · ")}` : `  ✅`),
  );
  if (ctlMovidos.length) {
    di(`   ⚠ con el original movido, nada de lo de abajo es atribuible al clon (§regla 16).`);
    hayFallo = true;
    continue;
  }

  /* ── LA MEDIDA: |clon − original| antes vs después, módulo a módulo ────── */
  for (const r of RUTAS) {
    const pa = antes.paginas[r];
    const pd = despues.paginas[r];
    const o = pa.original;
    const n = o.modulos.length;
    const filas = [];
    let sumaAntes = 0;
    let sumaDespues = 0;
    let acercan = 0;
    let alejan = 0;
    for (let i = 0; i < n; i++) {
      const oh = o.modulos[i].h;
      const ca = pa.clon.modulos[i]?.h;
      const cd = pd.clon.modulos[i]?.h;
      if (ca === undefined || cd === undefined) continue;
      const da = dist(oh, ca);
      const dd = dist(oh, cd);
      sumaAntes += da;
      sumaDespues += dd;
      if (ca === cd) continue; // el clon no se movió en este módulo
      if (dd < da) acercan++;
      else if (dd > da) alejan++;
      filas.push(
        `      m${i}  orig ${oh}  ·  clon ${ca} → ${cd}   ` +
          `|Δ| ${da.toFixed(2)} → ${dd.toFixed(2)}  ${dd < da ? "ACERCA" : dd > da ? "ALEJA" : "="}`,
      );
    }
    const dAntes = +(pa.clon.docH - o.docH).toFixed(2);
    const dDespues = +(pd.clon.docH - o.docH).toFixed(2);
    di(`\n   ${r}`);
    di(
      `      docH   orig ${o.docH}  ·  clon ${pa.clon.docH} → ${pd.clon.docH}   ` +
        `Δ ${dAntes} → ${dDespues}   |Δ| ${Math.abs(dAntes)} → ${Math.abs(dDespues)}`,
    );
    if (!filas.length) di(`      (ningún módulo movió su alto)`);
    else filas.forEach((f) => di(f));
    di(
      `      Σ|Δ| por módulo: ${sumaAntes.toFixed(2)} → ${sumaDespues.toFixed(2)}  ` +
        `(${(sumaDespues - sumaAntes).toFixed(2)})  ·  módulos que ACERCAN ${acercan} · ALEJAN ${alejan}`,
    );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL MODELO QUE EXPLICA EL SIGNO — y por qué el «ALEJA» no es un defecto
 *
 * El lado ORIGINAL de este comparador es la captura, y **su descifrador de
 * Cloudflare NO está capturado** (derivado: 0 ficheros `email-decode*` y ningún
 * directorio `cdn-cgi/` en `corpus/`). Así que el original de `f33-cmp` pinta
 * el marcador de posición `[email protected]` —17 caracteres— mientras el clon,
 * desde la 121.ª, pinta la dirección de verdad.
 *
 * O sea que el signo del movimiento lo predice una resta de longitudes, y NO
 * dice quién está bien: el original VIVO sirve la dirección descifrada, luego
 * **el clon es el que acierta y la referencia es la que está a medias**. Es
 * `CLAUDE.md` §*un marcado ofuscado más su descifrador son UNA UNIDAD; media
 * unidad no es una versión más limpia, es un defecto que el original no tiene*
 * — con la media unidad en el CORPUS.
 * ══════════════════════════════════════════════════════════════════════════ */
const PLACEHOLDER = "[email protected]".length; // 17
const CORREOS = {
  "/es/aviso-legal/": "info@kunak.es",
  "/es/politica-de-privacidad-y-de-proteccion-de-datos/": "contact@kunakair.com",
  "/es/sistema-interno-de-informacion/": "compliance@kunak.es",
};
di(`\n── MODELO DEL SIGNO · longitud descifrada vs marcador de posición (${PLACEHOLDER}) ──`);
di(`   (el descifrador NO está en el corpus: 0 ficheros \`email-decode*\`, 0 \`cdn-cgi/\`)`);
for (const [r, c] of Object.entries(CORREOS)) {
  const d = c.length - PLACEHOLDER;
  di(
    `   ${r}\n      "${c}" (${c.length}) − ${PLACEHOLDER} = ${d > 0 ? "+" : ""}${d}  ⇒ el clon ` +
      `${d > 0 ? "ALARGA" : "ACORTA"} su texto respecto de la referencia`,
  );
}
di(
  `\n   ⚠ El modelo sólo se puede ejercitar donde el texto REENVUELVE: una diferencia\n` +
    `     de ancho no cuesta un píxel hasta que cambia el nº de renglones (§el no-wrap).\n` +
    `     Instancias que lo ejercitan: las que movieron su alto arriba. Las que no se\n` +
    `     movieron salen INDETERMINADAS — ni confirman ni refutan.`,
);

di("");
writeFileSync(new URL("mailto-hacia-donde-122.log", import.meta.url), L.join("\n") + "\n");
process.exit(hayFallo ? 1 : 0);
