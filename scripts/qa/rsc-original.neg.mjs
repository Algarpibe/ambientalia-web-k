/**
 * TEST EN NEGATIVO de `rsc-original` — y su falsador no es un sabotaje
 * sintético: **es el clon**.
 *
 * Uso: npm run qa:rsc-original-neg
 *
 * ── Qué hay que poder falsar, y son TRES cosas distintas ──────────────────
 * `rsc-original` afirma *«el original no emite carga RSC»*. Esa frase puede ser
 * falsa —o vacía— por tres caminos que no se parecen:
 *
 *   1 · **que no vea la carga cuando SÍ está.** El contraejemplo existe y está
 *       corriendo al lado: el **clon** emite `__next_f`, así que tiene que salir
 *       ROJO **por su propio invariante**. Una sonda que no distingue el
 *       original del clon no está midiendo nada.
 *
 *       ⚠ **Y este caso ya cobró una premisa mía.** La primera versión no le
 *       pasaba `MARCA` porque daba por hecho que el clon emite `et_pb_`
 *       «replicando las clases de Divi». El caso salió rojo por `SIN CONTROL`
 *       —el invariante equivocado— y el `grep` lo explicó: los 70 `et_pb_` de
 *       `apps/web/src` están **todos en comentarios**. Cada sabotaje tiene que
 *       caer **por el invariante que ataca**, y por eso la comprobación de la
 *       salida es tan importante como la del código de salida: con sólo mirar
 *       el `exit 1` este caso habría pasado con la premisa falsa dentro.
 *   2 · **que un 200 que NO es la página se lea como «aquí no hay RSC».** Es
 *       *la regla del cero* (`CLAUDE.md` §sondas 4): no encontrar nada y no
 *       mirar nada dan la misma salida. `robots.txt` responde 200, no tiene
 *       `__next_f` **y tampoco `et_pb_`** — o sea que sin el control positivo
 *       se contaría como una página limpia más.
 *   3 · **que no llegue a mirar y salga verde igual.** Un host que no responde
 *       tiene que bajar del mínimo de `Evaluadas` y cerrar el código.
 *
 * El caso 2 usa `robots.txt` **del propio original**: un 200 de verdad, servido
 * por el mismo host, y no una URL inventada. Lo que se prueba es que el control
 * discrimina la PÁGINA, no el host.
 */
import { join } from "node:path";
import { corridaNegativa, Evaluadas, iniciarClon, QA } from "./lib.mjs";

const { base: BASE, parar } = await iniciarClon();

const casos = [
  {
    etiqueta: "clon-emite-rsc",
    exit: 1,
    porQue: "el CLON emite `__next_f` ⇒ con SU marcador de control, rojo por el invariante propio",
    /* `Migas de pan` es el `aria-label` de la miga: marcador SEMÁNTICO del clon
     * —no un literal de `className`, que casa en 16 ficheros y no discrimina
     * (`CLAUDE.md` §sondas 4, el pleno)—. La HOME queda fuera: no tiene miga. */
    env: { ORIGEN: BASE, MARCA: "Migas de pan", URLS: "/monitor-calidad-aire,/kunak-api,/accesorios" },
    salidaTiene: /EMITE '__next_f'/,
  },
  {
    etiqueta: "sin-control",
    exit: 1,
    porQue: "robots.txt es un 200 sin `__next_f` y sin `et_pb_` ⇒ «no hay RSC» aquí no significa nada",
    env: { URLS: "/robots.txt" },
    salidaTiene: /SIN CONTROL/,
  },
  {
    etiqueta: "host-mudo",
    exit: 1,
    porQue: "si no llega a mirar, el mínimo de `Evaluadas` cierra el código: no es «limpio»",
    env: { ORIGEN: "http://127.0.0.1:1", URLS: "/es/" },
    salidaTiene: /NO SE PUDO EVALUAR/,
  },
  {
    etiqueta: "urls-vacia",
    exit: 2,
    porQue: "acotar a NADA no es acotar: es no medir, y no puede dar verde",
    env: { URLS: " , " },
    salidaTiene: /acotar a nada no es acotar/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · rsc-original ════════\n`);
console.log(`  clon en ${BASE}\n`);

const ev = new Evaluadas({ nombre: "rsc-original-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

for (const c of casos) {
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "rsc-original.mjs")],
    /* Sin `SALIDA`: el desvío a `…-neg-<etiqueta>.json` lo pone `NEG` en `w()`,
     * y `corridaNegativa` borra `SALIDA` del entorno del hijo a propósito. */
    env: c.env,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────────
 * Sin gancho, el original tiene que salir 0 **con las 4 páginas contadas**. Un
 * verde sobre 1 página no distingue «no emite» de «casi nada mirado». */
const ctl = corridaNegativa({
  etiqueta: "control",
  args: [join(QA, "rsc-original.mjs")],
});
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin gancho tiene que salir 0`;
else if (!/4 páginas con control · 0 emiten '__next_f'/.test(ctlOut))
  malCtl = "no dice «4 páginas con control · 0 emiten '__next_f'»";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL          ${malCtl}`); }
else console.log(`  ✓  CONTROL          exit 0 · 4 páginas con control · 0 emiten '__next_f'`);

await parar();

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} rsc-original · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Distingue el original del CLON, se niega a contar un 200 que no es la página,\n` +
        `   y no da verde cuando no llegó a mirar.\n`
      : `   «El original no emite carga RSC» NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
