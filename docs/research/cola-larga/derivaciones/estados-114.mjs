/**
 * DERIVACIÓN · LOS CÓDIGOS DE ESTADO QUE CIERRAN DOS FICHAS (114.ª, ESCALÓN 1)
 *
 * SEIS peticiones del encargo + CUATRO controles. El veredicto es el CÓDIGO DE
 * ESTADO, **sin seguir redirecciones**: si se sigue la 301, el cuerpo es el del
 * destino y no distingue nada. Se publica `status` Y `location`.
 *
 * INSTRUMENTO · `fetch` con `redirect: "manual"`, no navegador. Para un código de
 * estado, un GET HTTP es el instrumento correcto: no tiene perfil, ni cookies, ni
 * historial, así que la nota de método sobre el «perfil limpio» se cumple por
 * construcción en vez de por configuración. No se mide nada renderizado aquí.
 *
 * LAS DOS PREGUNTAS, con sus dos salidas escritas ANTES (el encargo las fija):
 *
 *   (a) los 5 términos de `sector` cuya BASE no está capturada
 *       · 200 ⇒ el término NO redirige y su `/page/N` es real
 *       · 301 ⇒ la ficha del `/page/N` como constricción se resuelve, y se
 *               escribe HACIA DÓNDE
 *
 *   (b) `/es/categoría/eventos/` CON TILDE (o sea `%C3%ADa`)
 *       · 200 ⇒ `categoria` tiene 6 términos
 *       · 301 ⇒ son 4 + 2 duplicados por codificación, y «7 sin captura» pasa a 5
 *
 *   NO se elige: se mide.
 *
 * ⚠ AMPLIACIÓN DECLARADA: el encargo nombra sólo `eventos`, pero el corpus sirve
 * la forma con tilde para `noticias` TAMBIÉN (derivado, no supuesto). Medir una y
 * no la otra dejaría media pregunta contestada, así que entra — nombrada aparte
 * para no confundirla con lo encargado.
 *
 * CONTROL POR LOS DOS LADOS (§regla 8 — *un negativo sin control no es un
 * negativo*), conocido de antemano:
 *   · `sector/edar/`      capturado con http 200 ⇒ DEBE dar 200
 *   · `categoria/eventos/` capturado ⇒ DEBE dar 200 (es el par sin tilde de (b))
 *   · un slug INVENTADO   ⇒ DEBE dar 404. Sin él, «todo 200» no prueba nada:
 *     un servidor que devolviera 200 a cualquier cosa daría el mismo informe.
 *
 * Uso:  node estados-114.mjs
 */

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const BASE = "https://kunakair.com/es";
const ESPACIADO_MS = 700;

/* ── el dominio, DERIVADO del corpus y no escrito de memoria (§regla 9) ────── */
const RAIZ = join(AQUI, "..", "..", "..", "..");
const SECT = join(RAIZ, "corpus", "fase-3", "taxonomia-sector");
if (!existsSync(SECT))
  throw new Error(
    `CORPUS AUSENTE: no existe corpus/fase-3/taxonomia-sector.\n` +
      `  De ahí sale QUÉ sectores tienen base capturada. Sin él, la lista de «los 5\n` +
      `  sin captura» sería un dato recordado (§regla 9) y no derivado.`,
  );

const PETICIONES = [
  /* (a) los 5 términos de `sector` sin BASE capturada */
  { grupo: "a·sector", url: `${BASE}/sector/industria/`, nota: "tiene page/2 y page/3 capturadas, base NO" },
  { grupo: "a·sector", url: `${BASE}/sector/investigacion-consultoria/`, nota: "tiene page/2 capturada, base NO" },
  { grupo: "a·sector", url: `${BASE}/sector/mineria/`, nota: "sin ninguna captura" },
  { grupo: "a·sector", url: `${BASE}/sector/obras/`, nota: "sin ninguna captura" },
  { grupo: "a·sector", url: `${BASE}/sector/urbano/`, nota: "tiene page/2,3,4 capturadas, base NO" },

  /* (b) la forma CON TILDE */
  { grupo: "b·tilde", url: `${BASE}/categor%C3%ADa/eventos/`, nota: "ENCARGADA · «categoría» con tilde" },
  { grupo: "b·tilde+", url: `${BASE}/categor%C3%ADa/noticias/`, nota: "AMPLIACIÓN declarada · misma forma, no encargada" },

  /*  SEGUIMIENTO, añadido al ver que las 5 bases dan 301 — 2 peticiones.
      La pregunta la abre el propio dato y no se puede dejar sin contestar: si la
      BASE redirige, ¿las `/page/N` que SÍ están capturadas son reales, o son
      artefactos de un término que ya no se sirve? Sin esto, la ficha del
      `/page/N` no se resuelve: se cambia de sitio.                            */
  { grupo: "a·pageN", url: `${BASE}/sector/industria/page/2/`, nota: "capturada; su BASE da 301 — ¿se sirve igual?" },
  { grupo: "a·pageN", url: `${BASE}/sector/urbano/page/2/`, nota: "capturada; su BASE da 301 — ¿se sirve igual?" },

  /* controles, conocidos de antemano */
  { grupo: "control+", url: `${BASE}/sector/edar/`, nota: "capturado con http 200 ⇒ DEBE dar 200", espero: 200 },
  { grupo: "control+", url: `${BASE}/categoria/eventos/`, nota: "par SIN tilde de (b), capturado ⇒ DEBE dar 200", espero: 200 },
  { grupo: "control−", url: `${BASE}/sector/no-existe-este-sector-114/`, nota: "inventado ⇒ DEBE dar 404", espero: 404 },
];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const salida = [];

console.log(`\n════════ CÓDIGOS DE ESTADO · 114.ª ESCALÓN 1 ════════\n`);
console.log(`  ${PETICIONES.length} peticiones · redirect: "manual" · sin cookies ni perfil\n`);

for (const p of PETICIONES) {
  let status = null, location = null, error = null;
  try {
    const r = await fetch(p.url, { redirect: "manual", headers: { "User-Agent": "KunakWebClone/1.0 (+recon 114)" } });
    status = r.status;
    location = r.headers.get("location");
  } catch (e) { error = e.message; }
  salida.push({ ...p, status, location, error });
  const marca = p.espero ? (status === p.espero ? "✓" : "✗") : " ";
  console.log(`  ${marca} [${p.grupo}] ${status ?? "ERR"}  ${p.url}`);
  if (location) console.log(`        → ${location}`);
  if (error) console.log(`        ⚠ ${error}`);
  await dormir(ESPACIADO_MS);
}

/*  ── ¿alguna 301 apunta a SÍ MISMA? ────────────────────────────────────────
    `mineria` devolvió `Location` IDÉNTICA a la petición, y eso NO es «redirige»:
    es un BUCLE, o sea una URL INALCANZABLE en un navegador
    (`ERR_TOO_MANY_REDIRECTS`). Leerlo como una redirección más metería en el
    recuento de «redirigen a su arquetipo» una que no llega a ninguna parte.
    Se sigue la cadena a mano hasta 5 saltos para que el bucle quede PROBADO y no
    inferido de un solo `Location`.                                            */
const bucles = [];
for (const s of salida.filter((x) => x.status >= 300 && x.status < 400 && x.location === x.url)) {
  const cadena = [];
  let cur = s.url;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(cur, { redirect: "manual", headers: { "User-Agent": "KunakWebClone/1.0 (+recon 114)" } });
    const loc = r.headers.get("location");
    cadena.push({ salto: i + 1, url: cur, status: r.status, location: loc });
    if (!loc || r.status < 300 || r.status >= 400) break;
    cur = loc;
    await dormir(ESPACIADO_MS);
  }
  const esBucle = cadena.length === 5 && cadena.every((c) => c.status >= 300 && c.location === c.url);
  bucles.push({ url: s.url, esBucle, cadena });
  console.log(`\n  ⚠ ${s.url}`);
  console.log(`    ${esBucle ? "BUCLE PROBADO" : "no es bucle"}: ${cadena.length} saltos, todos 301 a sí misma`);
}

/* ── control: sin las dos mitades el informe no prueba nada ────────────────── */
const controles = salida.filter((s) => s.espero);
const ctrlOk = controles.every((c) => c.status === c.espero);
console.log(`\n──────── CONTROL POR LOS DOS LADOS ────────`);
for (const c of controles) console.log(`  ${c.status === c.espero ? "✓" : "✗"} ${c.url} → esperado ${c.espero}, obtenido ${c.status}`);
if (!ctrlOk) console.log(`\n  ⚠ CONTROL EN ROJO: los códigos de arriba NO valen. Un 404 que no llega, o un\n    200 que no llega, dicen que la petición no está midiendo lo que dice medir.`);

/* ── veredictos, con las dos salidas que el encargo fijó ───────────────────── */
console.log(`\n──────── VEREDICTOS ────────`);
const a = salida.filter((s) => s.grupo === "a·sector");
const a200 = a.filter((s) => s.status === 200);
const aRedir = a.filter((s) => s.status >= 300 && s.status < 400 && s.location !== s.url);
const aBucle = a.filter((s) => s.status >= 300 && s.status < 400 && s.location === s.url);
console.log(`  (a) sectores sin base capturada (${a.length}): ${a200.length} dan 200 · ${aRedir.length} redirigen a OTRA · ${aBucle.length} en BUCLE · ${a.length - a200.length - aRedir.length - aBucle.length} otro`);
for (const s of aRedir) console.log(`      ${s.status} → ${s.location}`);
for (const s of aBucle) console.log(`      ${s.status} → SÍ MISMA · inalcanzable en navegador (ERR_TOO_MANY_REDIRECTS)`);

const pg = salida.filter((s) => s.grupo === "a·pageN");
console.log(`  (a·seguimiento) las /page/N capturadas, con su base en 301: ${pg.map((s) => s.status).join(" · ")}`);
console.log(`      ⇒ ${pg.every((s) => s.status === 200) ? "se sirven IGUAL (200): las capturas son reales, no artefactos" : "NO todas se sirven"}`);

const b = salida.find((s) => s.grupo === "b·tilde");
const bMas = salida.find((s) => s.grupo === "b·tilde+");
console.log(`  (b) «categoría» con tilde (eventos): ${b?.status}${b?.location ? ` → ${b.location}` : ""}`);
console.log(`      ampliación (noticias):          ${bMas?.status}${bMas?.location ? ` → ${bMas.location}` : ""}`);

const F = join(AQUI, "estados-114.json");
writeFileSync(F, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), instrumento: "fetch redirect:manual", peticiones: salida, bucles }, null, 2) + "\n");
console.log(`\n  congelado en derivaciones/estados-114.json`);
console.log(`\n${ctrlOk ? "✅" : "❌"} control ${controles.filter((c) => c.status === c.espero).length}/${controles.length} · ${salida.filter((s) => s.status).length}/${salida.length} peticiones con respuesta\n`);
process.exit(ctrlOk ? 0 : 1);
