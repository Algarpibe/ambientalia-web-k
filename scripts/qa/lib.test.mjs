/**
 * TEST EN NEGATIVO de `lib.mjs` — las funciones puras, sin navegador.
 * Uso: npm run qa:lib          (código 1 si alguna aserción falla)
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 * `CLAUDE.md` §Reglas sobre las sondas: *una sonda es código sin tests, y
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
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditarSondas, corridaNegativa, LIBRERIAS, desMsys, env, envRuta, envRutas, Evaluadas, hoy, iniciarClon, nombreNeg, ruta, sello, sinLiterales, w } from "./lib.mjs";

/* Este fichero NO es una sonda: no mide el sitio, prueba `lib.mjs`. Lo declara
 * él mismo —como `ruido` declara `SIN_CLON`— en vez de exigírselo a quien lo
 * lanza, que es como se llega a una bandera que nadie pone. */
process.env.SIN_CONTRATO = "1";

/** Lo que Git Bash hace con un valor que empieza por `/`. */
const MSYS = "C:/Program Files/Git";

let fallos = 0;
/* Se CUENTAN, no se escriben. El total llevaba tres tandas escrito a mano
 * («42/42», «31/31») y el criterio de aceptación de `TRASPASO-AGENTE.md` citaba
 * un número que dejó de ser cierto en cuanto alguien añadió una aserción. Es la
 * misma clase que la lista de «8 sondas con suelo 1»: un recuento a mano es una
 * copia desactualizada de algo que se puede derivar. */
let corridas = 0;
const eq = (nombre, real, esperado) => {
  corridas++;
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

  /* ⚠ EL SEGUNDO DEFECTO DE `alLado()`, y fabricaba basura: la idempotencia de
   * `w()` mira **solo el destino canónico**, no los ficheros fechados que ella
   * misma crea. Así que re-correr una sonda cuya salida difiere del congelado
   * producía `-fecha.json` y `-fecha-2.json` BYTE A BYTE IGUALES — medido en
   * `slugs`, `cobertura`, `enlaces` y `c-bases`, los cuatro diffs vacíos. */
  const antes = readdirSync(tmp).length;
  const p4b = callado(() => w(f, { v: 3 }));
  eq("re-correr con salida IDÉNTICA a una fechada → no duplica", p4b, p4);
  eq("…y no aparece un fichero nuevo", readdirSync(tmp).length, antes);
  const p4c = callado(() => w(f, { v: 4 }));
  eq("…pero una salida NUEVA sí se guarda aparte", p4c !== p4 && readdirSync(tmp).length === antes + 1, true);

  /* ── CAMPOS VOLÁTILES: la clase del PUERTO EFÍMERO, generalizada ─────────
   * `clon-base` normalizó el puerto EN SU SONDA el 2026-08-04 y ahí se quedó,
   * pero `meta.fecha` la tiene TODA congelada que use `hoy()`: la misma medida
   * de otro día estrenaba fichero y la guarda avisaba de un cambio inexistente.
   *
   * ⚠ **Y el CONTROL es la mitad que hace que esto sea una guarda y no un
   * `catch {}`:** un cuerpo que difiere en `meta.fecha` **Y ADEMÁS** en un campo
   * medido tiene que seguir fabricando el fichero fechado. Sin él, «excluye los
   * volátiles» sería indistinguible de «de-duplica siempre» — la regla 8a: *un
   * sabotaje que no cambia el resultado no ha probado la guarda*. */
  const g = join(tmp, "volatil.json");
  callado(() => w(g, { meta: { fecha: "2026-08-04", alcance: "3 rutas" }, medido: { n: 7 } }));
  const soloFichero = readdirSync(tmp).length;
  const v1 = callado(() => w(g, { meta: { fecha: "2026-08-05", alcance: "3 rutas" }, medido: { n: 7 } }));
  eq("misma medida, otro día → NO estrena fichero", v1 === g && readdirSync(tmp).length === soloFichero, true);
  eq("…y la congelada conserva SU fecha (no se inventa que se re-midió)", JSON.parse(leer(g)).meta.fecha, "2026-08-04");
  const v2 = callado(() => w(g, { meta: { fecha: "2026-08-05", alcance: "3 rutas" }, medido: { n: 8 } }));
  eq("CONTROL · otro día Y otro número → sí estrena fichero", v2 !== g, true);
  eq("…y la congelada sigue intacta", JSON.parse(leer(g)).medido.n, 7);
  const v3 = callado(() => w(g, { meta: { fecha: "2026-08-05", alcance: "31 rutas" }, medido: { n: 7 } }));
  eq("CONTROL · un `meta` que NO es volátil también estrena", v3 !== g, true);

  // la bandera explícita, que es la única forma de re-congelar
  const p5 = callado(() => w(f, { v: 9 }, { pisar: true }));
  eq("con `{pisar:true}` sí pisa", p5 === f && JSON.parse(leer(f)).v === 9, true);
  process.env.PISAR = "1";
  const p6 = callado(() => w(f, { v: 10 }));
  eq("y `PISAR=1` por entorno también", p6 === f && JSON.parse(leer(f)).v === 10, true);
  delete process.env.PISAR;

  /* ── LA CORRIDA NEGATIVA: el desvío POR CONSTRUCCIÓN ──────────────────────
   * La clase del 2026-08-04: el CONTROL de un negativo iba con PISAR sobre la
   * canónica — un test en negativo re-congelando la evidencia buena. Con NEG
   * puesto, `w()` NO PUEDE tocar una canónica, ni siquiera con PISAR. */
  const canonica = JSON.parse(leer(f)).v;
  process.env.NEG = "control";
  const n1 = callado(() => w(f, { v: 99 }));
  eq("con NEG puesto, la canónica NO se toca", JSON.parse(leer(f)).v, canonica);
  eq("…y la corrida va a su `-neg-control`", n1.endsWith("medida-neg-control.json"), true);
  process.env.PISAR = "1";
  const n2 = callado(() => w(f, { v: 100 }));
  eq("NEG gana a PISAR: la canónica sigue intacta", JSON.parse(leer(f)).v, canonica);
  eq("…y el artefacto del negativo SE REESCRIBE sin duplicados", n2 === n1 && JSON.parse(leer(n1)).v === 100, true);
  delete process.env.PISAR;
  delete process.env.NEG;

  // el nombre: puro, y un nombre ya marcado (regla 7) no se re-marca
  eq("nombreNeg marca una canónica", nombreNeg("medidas/x.json", "control").replace(/\\/g, "/"), "medidas/x-neg-control.json");
  eq("…un `-neg-` no se re-marca", nombreNeg("medidas/x-neg-defecto.json", "control").replace(/\\/g, "/"), "medidas/x-neg-defecto.json");
  eq("…ni un SABOTAJE (regla 7, prior art)", nombreNeg("medidas/a-spec-SABOTAJE.json", "x").replace(/\\/g, "/"), "medidas/a-spec-SABOTAJE.json");

  /* ── Y el RUNNER: el entorno del hijo, comprobado EJECUTANDO ──────────────
   * `corridaNegativa` borra PISAR y SALIDA aunque quien lanza los tenga
   * exportados, y pone NEG. Se comprueba con un hijo real, no leyendo el
   * código: documentado no es conectado. */
  process.env.PISAR = "1";
  process.env.SALIDA = "medidas/trampa.json";
  const hijo = corridaNegativa({
    etiqueta: "control",
    args: ["-e", 'console.log(JSON.stringify({ pisar: process.env.PISAR ?? null, salida: process.env.SALIDA ?? null, neg: process.env.NEG ?? null }))'],
    timeout: 30_000,
  });
  delete process.env.PISAR;
  delete process.env.SALIDA;
  const entHijo = JSON.parse(hijo.stdout.trim());
  eq("el runner BORRA `PISAR` del hijo", entHijo.pisar, null);
  eq("…y `SALIDA` también", entHijo.salida, null);
  eq("…y pone `NEG` con la etiqueta", entHijo.neg, "control");
  let sinEtiqueta = null;
  try { corridaNegativa({ args: ["-e", ""] }); } catch (e) { sinEtiqueta = String(e.message); }
  eq("sin etiqueta se RECHAZA (regla 6)", /falta `etiqueta`/.test(sinEtiqueta ?? ""), true);

  rmSync(tmp, { recursive: true, force: true });
}


/* ═══════════════════════════════════════════════════════════════════════
 * 3 · LA SONDA ES DUEÑA DE SU CICLO DE SERVIDOR
 *
 * Lo que hay que probar NO es que sepa arrancar un servidor —eso se ve a la
 * primera— sino que **sepa fallar**: una sonda apuntada a un puerto vacío tiene
 * que reventar en voz alta, nunca medir. Es la regla de siempre: *una sonda que
 * no encuentra nada y una que no mira nada dan la misma salida*.
 * ══════════════════════════════════════════════════════════════════════ */
{
  const net = await import("node:net");
  /** Silenciador propio: el de arriba vive en otro bloque y no es asíncrono. */
  const orig = console.log;
  const mudo = async (fn) => { console.log = () => {}; try { return await fn(); } finally { console.log = orig; } };
  /** Un puerto que estuvo libre y se cierra: nadie escucha ahí. */
  const puertoMuerto = await new Promise((res) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });

  // `CLON` apuntando a la nada: `iniciarClon` NO gestiona servidor, devuelve esa
  // URL, y quien mida contra ella tiene que fallar al conectar.
  process.env.CLON = `http://127.0.0.1:${puertoMuerto}`;
  const externo = await mudo(() => iniciarClon());
  eq("con CLON puesta, la sonda NO arranca servidor propio", externo.propio, false);
  eq("…y usa exactamente esa URL", externo.base, process.env.CLON);

  let fallo = null;
  try {
    await fetch(externo.base + "/");
  } catch (e) {
    fallo = e;
  }
  eq("medir contra un puerto vacío FALLA, no devuelve vacío", fallo !== null, true);
  delete process.env.CLON;

  // Y el arranque propio con un timeout imposible tiene que TIRAR, no seguir
  // adelante con una base a la que nadie responde.
  let arranqueFallido = null;
  try {
    await mudo(() => iniciarClon({ timeoutMs: 1 }));
  } catch (e) {
    arranqueFallido = e;
  }
  eq("un clon que no llega a levantar TIRA en vez de medir", arranqueFallido !== null, true);
  eq("…y lo dice con el puerto", /puerto \d+/.test(String(arranqueFallido)), true);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3b · EL GANCHO DE `uncaughtException` NO PUEDE TRAGARSE LA MUERTE
 *
 * ⚠ **El defecto que este bloque conserva es el peor que ha tenido `lib.mjs`, y
 * vivió meses sin dar una sola señal (2026-08-05).**
 *
 * `iniciarClon` registraba `uncaughtException` **en el mismo bucle** que `exit`,
 * `SIGINT` y `SIGTERM`, con el mismo cuerpo. Parece simetría y no lo es: los
 * tres primeros son avisos, `uncaughtException` es un **relevo**. Registrarlo
 * desactiva el comportamiento por defecto de Node — deja de imprimir el error y
 * deja de salir con 1—, así que **cualquier sonda que reventara terminaba con
 * código 0 y salida vacía**.
 *
 * Cómo salió: el negativo del entorno de F2-3 —`.next` borrado por un build
 * fallido— corrió `clon-base` y dio **exit 0 con CERO líneas**. La sonda que
 * adjudica el Δ0 de la fase daba verde sin haber medido nada.
 *
 * Se prueba en SUBPROCESO y **por los dos lados**, que es lo que lo hace una
 * medida y no una creencia: el mismo `throw` sin gancho y con él.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const { spawnSync } = await import("node:child_process");
  const tmpG = mkdtempSync(join(tmpdir(), "kq-gancho-"));
  const LIB = JSON.stringify(new URL("./lib.mjs", import.meta.url).href);
  const corre = (nombre, cuerpo, entorno = {}) => {
    const f = join(tmpG, `${nombre}.mjs`);
    writeFileSync(f, cuerpo);
    const r = spawnSync(process.execPath, [f], { encoding: "utf8", env: { ...process.env, ...entorno } });
    return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
  };
  /* `CLON` a una URL cualquiera: `iniciarClon` no arranca ningún proceso hijo y
   * el caso mide EL GANCHO, no el `spawn`. Es además la prueba de que la guarda
   * quedó registrada ANTES del atajo de `CLON` — si estuviera después, estos
   * dos casos volverían a salir verdes en silencio. */
  const SIN_SERVIDOR = { CLON: "http://127.0.0.1:1" };

  /* El CONTROL del mecanismo: sin ningún gancho, Node hace lo que hay que hacer. */
  let r = corre("desnudo", `throw new Error("boom");\n`);
  eq("sin gancho, un throw sale ≠0", r.code !== 0, true);
  eq("…y lo imprime", /boom/.test(r.out), true);

  /* El DEFECTO, tal cual estaba: un gancho vacío convierte la muerte en verde.
   * Si algún día esto dejara de ser cierto en Node, el caso de abajo dejaría de
   * significar algo — y este `eq` es el que se enteraría. */
  r = corre("tragon", `process.on("uncaughtException", () => {});\nthrow new Error("boom");\n`);
  eq("un gancho VACÍO se traga la muerte: exit 0 y salida muda", r.code === 0 && r.out.trim() === "", true);

  /* Y lo que hace `iniciarClon` HOY, que es el arreglo: limpia **y** devuelve
   * el fallo. */
  r = corre(
    "con-iniciarclon",
    `import { iniciarClon } from ${LIB};\n` +
      `await iniciarClon();\n` +
      `throw new Error("boom");\n`,
    SIN_SERVIDOR,
  );
  eq("tras iniciarClon(), un throw SIGUE saliendo ≠0", r.code !== 0, true);
  eq("…y lo dice con las palabras exactas", /LA SONDA NO MIDIÓ NADA/.test(r.out), true);
  eq("…y enseña el error original", /boom/.test(r.out), true);

  /* La otra mitad: una promesa rechazada sin capturar —que es la forma que toma
   * un `await` que revienta en el cuerpo de una sonda— tampoco puede ser verde. */
  r = corre(
    "rechazo",
    `import { iniciarClon } from ${LIB};\n` +
      `await iniciarClon();\n` +
      `void Promise.reject(new Error("rechazada"));\n` +
      `await new Promise((r) => setTimeout(r, 50));\n`,
    SIN_SERVIDOR,
  );
  eq("una promesa rechazada sin capturar tampoco es verde", r.code !== 0, true);
  eq("…y se nombra como tal", /PROMESA RECHAZADA SIN CAPTURAR/.test(r.out), true);
}
/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTRATO DE `Evaluadas` — «0 comparado = verde», la sexta vez no
 *
 * Se prueba en SUBPROCESO porque lo que hay que demostrar es el **código de
 * salida**, y eso no se puede afirmar desde dentro del mismo proceso: el gancho
 * de `process.on("exit")` es justamente lo que se está probando.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const { spawnSync } = await import("node:child_process");
  const tmpEv = mkdtempSync(join(tmpdir(), "kq-ev-"));
  let iCaso = 0;
  const corre = (cuerpo, entorno = {}) => {
    const f = join(tmpEv, `caso-${++iCaso}.mjs`);
    writeFileSync(f, cuerpo);
    const r = spawnSync(process.execPath, [f], { encoding: "utf8", env: { ...process.env, ...entorno } });
    return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
  };
  const LIB = JSON.stringify(new URL("./lib.mjs", import.meta.url).href);

  // 1 · Por debajo del mínimo NO se puede salir con 0, ni con `exit(0)` explícito.
  let r = corre(
    `import { Evaluadas } from ${LIB};\n` +
      `const ev = new Evaluadas({ unidad: "rutas", minimo: 3 });\n` +
      `ev.ok(); ev.fallo("/x", "ERR");\n` +
      `console.log("la sonda cree que ha terminado bien");\n` +
      `process.exit(0);\n`,
  );
  eq("bajo el mínimo, un exit(0) explícito se convierte en ≠0", r.code !== 0, true);
  eq("…y lo dice con las palabras exactas", /NO SE PUDO EVALUAR/.test(r.out), true);
  eq("…y nombra la unidad que faltó", /1 de 3 rutas/.test(r.out), true);

  // 2 · Al alcanzar el mínimo, verde de verdad.
  r = corre(
    `import { Evaluadas } from ${LIB};\n` +
      `const ev = new Evaluadas({ unidad: "rutas", minimo: 2 });\n` +
      `ev.ok(); ev.ok();\n` +
      `process.exit(0);\n`,
  );
  eq("alcanzado el mínimo, sale 0", r.code, 0);
  /* ⚠ La MITAD LEGIBLE, que estaba sin conectar: el contrato cerraba el código
   * pero el verde salía MUDO. Validando las 48 en vivo, la línea de unidades la
   * imprimía **1**; el HANDOFF decía «ahora la imprime». Ahora la pone el
   * gancho aunque la sonda no llame a `informe()`. */
  eq("…y el verde NO es mudo: lleva su línea de unidades", /evaluadas 2\/2 rutas/.test(r.out), true);
  r = corre(
    `import { Evaluadas } from ${LIB};\n` +
      `const ev = new Evaluadas({ unidad: "rutas", minimo: 2 });\n` +
      `ev.ok(); ev.ok(); ev.informe();\n`,
  );
  eq("…y si la sonda SÍ llama a informe(), no sale dos veces", (r.out.match(/evaluadas 2\/2 rutas/g) || []).length, 1);

  // 3 · Congelar una medida SIN declarar nada es error: el olvido no es verde.
  //     El subproceso NO hereda la exención del propio test — aquí se prueba
  //     justamente la sonda que se olvidó de declarar.
  r = corre(
    `import { w } from ${LIB};\n` +
      `w(${JSON.stringify(join(tmpEv, "sin-contrato.json"))}, { a: 1 });\n` +
      `process.exit(0);\n`,
    { SIN_CONTRATO: "" },
  );
  eq("congelar sin declarar el mínimo sale ≠0", r.code !== 0, true);
  eq("…y se llama SIN CONTRATO", /SIN CONTRATO DE EVALUACIÓN/.test(r.out), true);

  // 4 · …salvo que la sonda declare que no mide (y entonces lo dice ella).
  r = corre(
    `import { w } from ${LIB};\n` +
      `w(${JSON.stringify(join(tmpEv, "exenta.json"))}, { a: 1 });\n` +
      `process.exit(0);\n`,
    { SIN_CONTRATO: "1" },
  );
  eq("con SIN_CONTRATO=1 declarado, no molesta", r.code, 0);

  // 5 · Un mínimo que no se declara es un defecto de la sonda, no un 0 tácito.
  r = corre(
    `import { Evaluadas } from ${LIB};\n` +
      `try { new Evaluadas({ unidad: "rutas" }); console.log("NO TIRÓ"); }\n` +
      `catch (e) { console.log("TIRÓ:", e.message.split("\\n")[0]); }\n`,
  );
  eq("sin 'minimo' TIRA en vez de asumir 0", /TIRÓ:/.test(r.out), true);
  r = corre(
    `import { Evaluadas } from ${LIB};\n` +
      `try { new Evaluadas({ unidad: "rutas", minimo: 0 }); console.log("NO TIRÓ"); }\n` +
      `catch (e) { console.log("TIRÓ"); }\n`,
  );
  eq("un mínimo de 0 TIRA: sería el agujero otra vez", /TIRÓ/.test(r.out) && !/NO TIRÓ/.test(r.out), true);
}

/* ══════════════════════════════════════════════════════════════════════════
 * Y LA MITAD QUE NINGÚN TEST DE COMPORTAMIENTO CUBRE: que TODAS lo usen.
 *
 * El contrato solo cierra la clase si está **conectado en todas las sondas**.
 * Una que no lo declare vuelve a poder dar verde midiendo nada, y eso no lo
 * detecta ningún test de `lib.mjs` — es *documentado no es conectado* a escala
 * de directorio.
 *
 * ⚠ **SÉPTIMA instancia, y aquí dentro: el barrido era un `grep`.** Daba verde
 * sobre `c-censo.mjs` con dos `const ev` y **sin compilar**, porque el texto
 * contenía `new Evaluadas(` y eso era lo único que miraba. El primer parche
 * puso el `node --check` **como segunda aserción**, y eso deja la primera
 * —«las N declaran»— **en verde sobre un directorio roto**: dos canales de
 * verdad para una sola pregunta, que es la regla 1 de `CLAUDE.md` §sondas.
 *
 * Ahora hay **un veredicto por sonda** (`auditarSondas` en `lib.mjs`): compila
 * **y** declara, o no es conforme. Y se prueba EN NEGATIVO con ficheros rotos a
 * propósito, porque un barrido que no sabe fallar da la misma salida que uno
 * que no mira nada.
 * ═════════════════════════════════════════════════════════════════════════ */
/* El escáner que separa código de texto. Se prueba aparte porque un fallo suyo
 * no da error: da una sonda conforme marcada como SIN DECLARAR, o al revés. El
 * caso peligroso es el literal de expresión regular con comillas dentro
 * —`.replace(/"/g, "")`— que a un escáner ingenuo le abre una cadena y le deja
 * el resto del fichero ciego. */
/* La fecha, en un solo sitio y LOCAL. El defecto que sustituye estaba escrito a
 * pelo en `lib.mjs` y en 22 sondas: `toISOString()` es UTC, así que con la
 * máquina en −05:00 toda corrida entre las 19:00 y medianoche quedaba fechada al
 * día siguiente — comprobado en disco. Y va en los dos sentidos: dos ráfagas de
 * la misma tarde con días distintos, o dos de días distintos colapsadas. */
console.log("\n── `hoy()` / `sello()`: hora LOCAL, nunca UTC ──");
{
  // 2026-08-02 19:03 locales. En UTC−05:00 eso es el 03 a las 00:03.
  const tarde = new Date(2026, 7, 2, 19, 3, 12);
  eq("una corrida de las 19:03 del 02 se fecha el 02", hoy(tarde), "2026-08-02");
  eq("…y su sello conserva la FORMA del que sustituye", sello(tarde), "2026-08-02T19-03-12");
  eq("medianoche justa no se va al día anterior", hoy(new Date(2026, 7, 2, 0, 0, 0)), "2026-08-02");
  eq("un día de un dígito va con cero delante", hoy(new Date(2026, 0, 5, 12, 0, 0)), "2026-01-05");
  /* El control que hace que el test valga: si `hoy()` volviera a UTC, esta
   * aserción es la única que lo caza — las otras pasan en una máquina en UTC. */
  eq(
    "y NO coincide con toISOString() a esa hora (que es el fallo)",
    hoy(tarde) === tarde.toISOString().slice(0, 10),
    false,
  );
}

/* `ok()` no puede traducir «no lo sé» a «está bien» (CLAUDE.md §sondas, 6). */
console.log("\n── `Evaluadas.ok()`: un defecto no rescata un cálculo fallido ──");
{
  const ev = new Evaluadas({ unidad: "filas", minimo: 1 });
  eq("ok() sin argumento sigue sumando 1", ev.ok().n, 1);
  eq("ok(13) suma 13", ev.ok(13).n, 14);
  const tira = (fn) => { try { fn(); return false; } catch { return true; } };
  // el caso exacto de `cmp-sector`: `.length` sobre un objeto
  eq("ok(undefined) TIRA — era el 1 falso de cmp-sector", tira(() => ev.ok({}.length)), true);
  eq("ok(NaN) TIRA", tira(() => ev.ok(NaN)), true);
  eq("ok(null) TIRA", tira(() => ev.ok(null)), true);
  eq("…y el contador no se movió con ninguno", ev.n, 14);
  ev.ok(ev.minimo); // que no dispare el gancho al salir
}

console.log("\n── `sinLiterales()`: qué es código y qué es texto ──");
{
  const hay = (s) => /new\s+Evaluadas\s*\(/.test(sinLiterales(s));
  eq("declaración de verdad → se ve", hay(`const ev = new Evaluadas({minimo:1});`), true);
  eq("en comentario de línea → NO", hay(`// const ev = new Evaluadas({minimo:1});`), false);
  eq("en comentario de bloque → NO", hay(`/* new Evaluadas({minimo:1}) */`), false);
  eq("dentro de una cadena → NO", hay(`const s = "new Evaluadas({minimo:1})";`), false);
  eq("dentro de una plantilla → NO", hay("const s = `new Evaluadas({minimo:1})`;"), false);
  eq(
    "una regex con comillas NO ciega el resto",
    hay(`const t = x.replace(/"/g, "'");\nconst ev = new Evaluadas({minimo:1});`),
    true,
  );
  eq("y una división no se come el código", hay(`const r = a / b; const ev = new Evaluadas({minimo:1});`), true);
}

console.log("\n── el barrido del contrato: EJECUTAR, no casar texto ──");
{
  /* ── (a) EN NEGATIVO, primero: cuatro fixtures con veredicto conocido ── */
  const tmpA = mkdtempSync(join(tmpdir(), "kq-aud-"));
  const poner = (n, s) => writeFileSync(join(tmpA, n), s);

  // 1 · conforme de verdad
  poner("buena.mjs", `import { Evaluadas } from "./lib.mjs";\nconst ev = new Evaluadas({ unidad: "rutas", minimo: 2 });\nev.ok();\n`);
  // 2 · NO COMPILA — y encima contiene el texto que el grep buscaba. Es
  //     literalmente el caso `c-censo`: el barrido viejo lo daba por bueno.
  poner("rota.mjs", `const ev = new Evaluadas({ minimo: 1 });\nconst ev = new Evaluadas({ minimo: 1 });\nfunction (\n`);
  // 3 · compila y no declara nada
  poner("muda.mjs", `console.log("no declaro nada");\n`);
  // 4 · la declaración vive en un COMENTARIO y en una CADENA. Un `grep` la
  //     cuenta; el código no la tiene.
  poner("fantasma.mjs", `// const ev = new Evaluadas({ unidad: "x", minimo: 1 });\nconst ayuda = "usa new Evaluadas({ minimo: 1 })";\nconsole.log(ayuda);\n`);

  const neg = await auditarSondas(tmpA, []);
  eq("negativo · 4 ficheros auditados", neg.total, 4);
  eq("negativo · la buena es la ÚNICA conforme", neg.conformes, ["buena.mjs"]);
  eq("negativo · la que no compila sale ROTA…", neg.rotas.map((r) => r.fichero), ["rota.mjs"]);
  eq("…y NO cuenta como declarante pese al texto", neg.conformes.includes("rota.mjs"), false);
  eq("negativo · muda y fantasma, SIN DECLARAR", neg.sinDeclarar, ["fantasma.mjs", "muda.mjs"]);
  rmSync(tmpA, { recursive: true, force: true });

  /* ── (b) el barrido de verdad, con UN solo veredicto ── */
  /**
   * ⚠ **La exclusión se IMPRIME, y por eso no puede pudrirse.** `LIBRERIAS` es
   * lo único que el contrato no alcanza —ficheros que se importan y no miden—, y
   * una lista de exclusión es literalmente dejar de mirar. Enseñarla en el
   * informe es lo que impide que alguien meta ahí una sonda de verdad y el verde
   * lo tape (§sondas: *lo que imprime y lo que cuenta no pueden discrepar*).
   */
  console.log(`  · fuera del contrato por ser LIBRERÍA (se importan, no miden): ${LIBRERIAS.join(" · ")}`);
  const a = await auditarSondas();
  const noConformes = [
    ...a.rotas.map((r) => `${r.fichero} (NO COMPILA: ${r.error})`),
    ...a.sinDeclarar.map((f) => `${f} (sin declarar)`),
  ];
  eq(
    `las ${a.total} sondas COMPILAN y declaran su mínimo` +
      (noConformes.length ? ` — NO CONFORMES: ${noConformes.join(" · ")}` : ""),
    noConformes.length,
    0,
  );
}

/* ── El canal de verdad: lo que imprime y lo que cuenta no discrepan ── */
const total = corridas;
console.log(
  fallos
    ? `\n❌ ${fallos} de ${total} aserciones fallidas — mira cuál: las cosas que\n` +
        `   prueba esto fallan EN SILENCIO, con números plausibles y código 0.\n`
    : `\n✅ ${total}/${total} — MSYS se deshace en la LECTURA (argumentos y entorno),\n` +
        `        una salida congelada NO se descongela sola, una sonda contra un\n` +
        `        puerto vacío FALLA en voz alta en vez de medir, y el barrido del\n` +
        `        contrato tumba un fichero que no compila en vez de convivir con él.\n`,
);
process.exit(fallos ? 1 : 0);
