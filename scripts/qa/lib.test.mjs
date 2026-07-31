/**
 * TEST EN NEGATIVO de `lib.mjs` — las funciones puras, sin navegador.
 * Uso: npm run qa:lib          (código 1 si alguna aserción falla)
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * `CLAUDE.md` §Cuatro reglas sobre las sondas: *una sonda es código sin tests, y
 * el único control es mirar su salida contra algo que ya sabes.* De las cuatro
 * reglas, dos se aplican aquí literalmente:
 *
 *  · **DOCUMENTADO NO ES CONECTADO.** `ruta()` sabía deshacer la traducción de
 *    MSYS desde hacía dos sesiones, el README afirmaba que `MARCADOR_RUTA`
 *    pasaba por ella, y **la llamada no estaba** en `clon-base.mjs`. Se arregló
 *    ahí y la misma clase volvió a morder en `SOLO` de `c-cabecera.mjs`: dos
 *    veces por la misma puerta. La corrección de fondo es de SITIO —la
 *    normalización vive en la lectura, `env`/`envRuta`/`envRutas`— y esto es lo
 *    que prueba que sigue conectada.
 *
 *  · **Un fallo así NO da error: da una corrida vacía con veredicto verde.** Una
 *    ruta mal traducida no casa con ninguna página; la sonda mide cero y dice
 *    «✅ no hay nada que compensar». Exactamente lo que pasó, y en el código
 *    escrito para cazarlo.
 *
 * ── El caso que más importa, y es el menos obvio ───────────────────────────
 * `SALIDA` es una ruta de **fichero**, no de página: pasarla por `ruta()` le
 * fuerza una barra inicial y la convierte en absoluta. Por eso hay dos lecturas
 * distintas —`env()` y `envRuta()`— y por eso se prueban las dos.
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { desMsys, env, envRuta, envRutas, ruta, w } from "./lib.mjs";

/** Lo que Git Bash hace con un valor que empieza por `/`. */
const MSYS = "C:/Program Files/Git";

let fallos = 0;
const eq = (nombre, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(
    `  ${ok ? "✓" : "❌"} ${nombre.padEnd(54)}${JSON.stringify(real)}` +
      (ok ? "" : `   ESPERADO ${JSON.stringify(esperado)}`),
  );
};
/** Pone la variable y la lee: el test es de la LECTURA, no de la función suelta. */
const con = (nombre, valor, leer) => {
  if (valor === null) delete process.env[nombre];
  else process.env[nombre] = valor;
  return leer();
};

console.log("\n── `SOLO`: lista de rutas de página, la puerta de `c-cabecera` ──");
eq("SOLO=/           → MSYS lo manda como `…/Git/`", con("SOLO", `${MSYS}/`, () => envRutas("SOLO")), ["/"]);
eq("SOLO=/kunak-api  → `…/Git/kunak-api`", con("SOLO", `${MSYS}/kunak-api`, () => envRutas("SOLO")), ["/kunak-api"]);
eq("SOLO con dos, una traducida y otra no", con("SOLO", `${MSYS}/faqs/x, /accesorios`, () => envRutas("SOLO")), ["/faqs/x", "/accesorios"]);
eq("SOLO sin poner → null, que es «todas»", con("SOLO", null, () => envRutas("SOLO")), null);
eq('SOLO="" → null, no []', con("SOLO", "", () => envRutas("SOLO")), null);

console.log("\n── `MARCADOR_RUTA`: la puerta que ya mordió una vez ──");
eq("MARCADOR_RUTA=/x → `…/Git/x`", con("MARCADOR_RUTA", `${MSYS}/x`, () => envRuta("MARCADOR_RUTA", "/")), "/x");
eq("sin poner → el defecto de quien llama", con("MARCADOR_RUTA", null, () => envRuta("MARCADOR_RUTA", "/dos")), "/dos");

console.log("\n── `SALIDA` es ruta de FICHERO: `env()`, no `envRuta()` ──");
eq("SALIDA=medidas/x.json queda intacta", con("SALIDA", "medidas/x.json", () => env("SALIDA")), "medidas/x.json");
eq("SALIDA=/tmp/x.json (MSYS) → absoluta", con("SALIDA", `${MSYS}/tmp/x.json`, () => env("SALIDA")), "/tmp/x.json");
eq("…y `ruta()` NO le añade barra de más", ruta(`${MSYS}/tmp/x.json`), "/tmp/x.json");

console.log("\n── lo que NO es de MSYS no se toca ──");
eq("ruta de Windows de verdad, sin `/Git/`", desMsys("C:/Users/algar/proyecto"), "C:/Users/algar/proyecto");
eq("URL entera", desMsys("https://kunakair.com/es/"), "https://kunakair.com/es/");
eq("ruta de página ya limpia", ruta("/sectores/x"), "/sectores/x");
eq("sin barra inicial (inmune a MSYS)", ruta("sectores/x"), "/sectores/x");

/* ══════════════════════════════════════════════════════════════════════════
 * `w()` — LA GUARDA DE CONGELADO
 *
 * Lo que se prueba es exactamente el fallo de la semana: la corrida de
 * verificación de C-QA1 machacó `c-cabecera-{1440,390}.json`, que era el
 * DIAGNÓSTICO, con el clon ya arreglado. Hubo que recuperarlo de git; si no
 * hubiera estado commiteado, la evidencia del defecto habría desaparecido en el
 * acto de arreglarlo.
 *
 * ⚠ Y se prueba **en negativo**: no basta con ver que escribe donde toca. Hay
 * que ver que **se NIEGA a pisar** — que es lo que no hacía.
 * ═════════════════════════════════════════════════════════════════════════ */
console.log("\n── `w()`: una salida congelada no se descongela sola ──");
{
  const tmp = mkdtempSync(join(tmpdir(), "kq-w-"));
  const f = join(tmp, "medida.json");
  const leer = (p) => readFileSync(p, "utf8");
  const silencio = console.log;
  const callado = (fn) => { console.log = () => {}; try { return fn(); } finally { console.log = silencio; } };

  const p1 = callado(() => w(f, { v: 1 }));
  eq("primera escritura → va al destino", p1 === f, true);
  eq("…y con el contenido pedido", JSON.parse(leer(f)).v, 1);

  // idéntico: reescribir no destruye nada, y no debe ensuciar con duplicados
  const p2 = callado(() => w(f, { v: 1 }));
  eq("mismo contenido → mismo fichero, sin duplicar", p2 === f, true);
  eq("…y sigue habiendo 1 solo fichero", readdirSync(tmp).length, 1);

  // DISTINTO: aquí es donde antes se perdía la evidencia
  const p3 = callado(() => w(f, { v: 2 }));
  eq("contenido DISTINTO → NO pisa", p3 !== f, true);
  eq("…la congelada sigue intacta", JSON.parse(leer(f)).v, 1);
  eq("…y la nueva está al lado, fechada", JSON.parse(leer(p3)).v, 2);
  eq("…dos ficheros, ninguno perdido", readdirSync(tmp).length, 2);

  // dos veces el mismo día no se pisan entre sí
  const p4 = callado(() => w(f, { v: 3 }));
  eq("otra corrida el mismo día → tampoco colisiona", p4 !== p3, true);
  eq("…tres ficheros", readdirSync(tmp).length, 3);

  // la bandera explícita, que es la única forma de re-congelar
  const p5 = callado(() => w(f, { v: 9 }, { pisar: true }));
  eq("con `{pisar:true}` sí pisa", p5 === f && JSON.parse(leer(f)).v === 9, true);
  process.env.PISAR = "1";
  const p6 = callado(() => w(f, { v: 10 }));
  eq("y `PISAR=1` por entorno también", p6 === f && JSON.parse(leer(f)).v === 10, true);
  delete process.env.PISAR;

  rmSync(tmp, { recursive: true, force: true });
}

/* ── El canal de verdad: lo que imprime y lo que cuenta no discrepan ── */
const total = 26;
console.log(
  fallos
    ? `\n❌ ${fallos} de ${total} aserciones fallidas — mira cuál: las dos cosas que\n` +
        `   prueba esto fallan EN SILENCIO, con números plausibles y código 0.\n`
    : `\n✅ ${total}/${total} — MSYS se deshace en la LECTURA (argumentos y entorno)\n` +
        `        y una salida congelada NO se descongela sola.\n`,
);
process.exit(fallos ? 1 : 0);
