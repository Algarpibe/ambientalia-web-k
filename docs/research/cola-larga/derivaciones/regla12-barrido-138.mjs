// 138.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
//
// §regla 12: un acta se lee UNA VEZ; `CLAUDE.md` se lee CADA sesión. Un
// enunciado con forma de regla general escrito sólo en un acta equivale a no
// haberlo escrito. El discriminador: quítale la fecha y el nombre propio — si
// sigue diciendo qué hacer, es regla.
//
// ⚠ ACOTADO a lo que esta tanda midió, y **el número se escribe aunque sea
// cero**: «no encontré ninguna» y «no barrí» son la misma salida si no se dice.
//
// ⚠⚠ LOS DOS CRUCES, y manda el ENDURECIDO — con sus TRES testigos y el
// ANTES/DESPUÉS contra HEAD, que es lo único que prueba que la regla LLEGÓ.
// La 133.ª publicó «0 de 6» con 4 reglas YA escritas; la 134.ª lo verificó
// corriendo el mismo cruce contra HEAD. Se hereda ese diseño entero.
//
// OFFLINE: no mide un píxel, no abre navegador, no toca red ni DB.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const CLAUDE = readFileSync(join(RAIZ, "CLAUDE.md"), "utf8");

const salida = [];
const di = (s = "") => { salida.push(s); console.log(s); };

/* Los candidatos se ENUMERAN a mano —salen de leer lo que la tanda midió, que
 * es lo que §regla 12 pide—. El instrumento los CRUZA, no los encuentra.
 *
 * ⚠ LÍMITE declarado (§regla 14): este barrido sólo ve enunciados YA ESCRITOS
 * EN PROSA. Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un `slice`—
 * es invisible para él, así que su cero es cierto de la prosa y no del repo. */
const candidatos = [
  {
    id: "R1",
    tipo: "REGLA",
    enunciado:
      "Un volumen ANÓNIMO no es EFÍMERO: «anónimo» dice quién le puso el nombre, no cuánto vive. Aparece en `docker volume ls` con su hash y se puede montar por ese hash en un contenedor NUEVO. Lo que lo destruye es `docker rm -v` o `compose down -v`, no recrear el contenedor.",
    porQue:
      "Medido: `kunak-cms-pg` se recreó montando `2ebbe245…` por su ID y no se perdió nada — 151 tablas, `paginas=31 · productos=19 · entradas_blog=152`, socket en 77 ms. Y lo que costó la lectura vieja no fue un borrado: fueron CINCO TANDAS. Con «muere con una recreación» escrito en CLAUDE.md, recrear el contenedor —la única salida al binding no publicado— quedaba fichado como IMPOSIBLE, y las tandas 134.ª–137.ª corrieron OFFLINE dando el entorno por bloqueado. La salida costaba un `docker inspect`. Es §*antes de fichar una indeterminación, enumera las separadoras candidatas*: aquí ni se enumeró, porque la premisa falsa cerró la búsqueda.",
    vocabulario: ["anónimo", "efímero", "volumen"],
    enunciadoClave: "ANÓNIMO NO ES EFÍMERO",
    destino: "CLAUDE.md, §*lo DECLARADO y lo PUBLICADO son dos canales*",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Un contenedor CORRIENDO puede estar atado a CERO redes, y entonces `NetworkSettings.Ports` sale vacío NECESARIAMENTE, no por avería. Ante un binding declarado y no publicado se mira `NetworkSettings.Networks` ANTES de culpar al proxy: si está vacío, ni `restart` ni reiniciar el demonio lo arreglan —los dos conservan la ausencia de endpoint—; lo arregla recrear el contenedor con su red y su volumen.",
    porQue:
      "La tabla de los cinco canales dejaba el defecto en «el publish» y de ahí en el proxy de Docker Desktop, o sea del propietario. Le faltaba una fila, y es CAUSAL en vez de sintomática: sin endpoint de red no hay nada que publicar, así que «el binding está declarado y no aplicado» no era el defecto sino su SÍNTOMA. Las dos premisas falsas se sostenían entre ellas: ésta cerraba el diagnóstico y la del volumen cerraba la única salida.",
    vocabulario: ["networks", "endpoint", "publicar"],
    enunciadoClave: "PUEDE ESTAR ATADO A CERO REDES",
    destino: "CLAUDE.md, §*lo DECLARADO y lo PUBLICADO son dos canales*",
  },
  {
    id: "R3",
    tipo: "REGLA",
    enunciado:
      "Comparar dos ARTEFACTOS GENERADOS exige normalizar lo que el generador produce distinto por construcción —un id de build, el orden de serialización— o el comparador mide «¿es el mismo build?» en vez de «¿es el mismo contenido?». Y la normalización se aplica a LOS DOS lados y publica su cardinal de sustituciones: si fuera 0 en alguno, no está ocurriendo.",
    porQue:
      "Medido en dos vueltas: comparar el HTML prerenderizado al bit dio 428 de 428 distintas —el 100 % redondo, la señal de §sondas 4 quinta cara— y era el BUILD_ID. Normalizado, quedaron 196; reconstruido un caso a mano, el primer byte divergente de `aviso-legal.html` es el ORDEN de las líneas del payload RSC, con el título idéntico. Es §*el detector de separadoras tiene su propio NIVEL: se compara EL VEREDICTO, no el artefacto entero* con el artefacto puesto en un BUILD.",
    vocabulario: ["normaliza", "artefacto generado", "serialización"],
    enunciadoClave: "NORMALIZAR LO QUE EL GENERADOR PRODUCE DISTINTO POR CONSTRUCCIÓN",
    destino: "CLAUDE.md, §*el detector de separadoras tiene su propio NIVEL*",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "CMS-8 levantado: los 5 `required` de `arquetipos` que paran la siembra, con sus dos sub-problemas separados (8a `imagen-arq.enlace` 27/27 · 8b los 3 vacíos) y las opciones con su operación de deshacer NOMBRADA.",
    porQue:
      "Tiene fecha, cardinales y opciones sobre ESTE repo. La regla que lo gobierna —§regla 23, se cita el criterio CON SU OPERACIÓN— ya está escrita y se aplicó; lo que se añade es que en un `NOT NULL` la asimetría va AL REVÉS (relajar es barato, re-imponer tiene ventana), y eso es una aplicación, no un enunciado nuevo.",
    vocabulario: ["CMS-8"],
    enunciadoClave: "CMS-8",
    destino: "ESQUEMA-CMS.md §CMS-8 + PENDIENTES-QA.md §138.ª + PLAN-FASE-3.md",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "El sondeo agrupaba documentos con `Set.add(r.slug ?? \"(sin slug)\")` y el slug no llega a los required ANIDADOS, así que todos colapsaban en un cubo y `.size` daba 1. `video-arq.url` salía «en 1 documento(s)» y son 2.",
    porQue:
      "Es una instancia de §regla 29 tercera cara —una llave que colapsa da un cardinal que no es el de un conjunto— con el colapso DENTRO de la sonda, y de §*una regla derivada sobre un dominio donde el caso NO SE DA*: antes del alta el informe de vacíos daba (ninguno) en las 11 colecciones. Las dos reglas ya están escritas.",
    vocabulario: ["colapsa", "sin slug"],
    enunciadoClave: "una llave que colapsa",
    destino: "PENDIENTES-QA.md §138.ª + la cabecera de `exige` en sondeo.mjs",
  },
  {
    id: "E3",
    tipo: "EVENTO",
    enunciado:
      "La migración de `formulario-arq` NO es una quinta instancia de §regla 42: no emite el patrón `DROP TABLE … CASCADE` + `DROP CONSTRAINT`, y medido sin `IF EXISTS` da 0 separadoras en la PRIMERA pasada. El cardinal de la clase sigue en 4. Lo que el `IF EXISTS` compra es idempotencia: 1 separadora, en la SEGUNDA pasada.",
    porQue:
      "Es la aplicación de §regla 42 con su corrección del 2026-09-01 —el cardinal de una clase se DERIVA, no se hereda del descubrimiento— y de §*antes de fichar una indeterminación, comprueba que las dos hipótesis sean DISTINTAS*. Tiene números y fecha, no enunciado nuevo.",
    vocabulario: ["idempotencia", "IF EXISTS"],
    enunciadoClave: "el cardinal de la clase sigue en 4",
    destino: "PENDIENTES-QA.md §138.ª + la cabecera de la migración",
  },
  {
    id: "E4",
    tipo: "EVENTO",
    enunciado:
      "131 de 428 documentos prerenderizados difieren en HTML VISIBLE entre el build base (2026-08-31 14:54) y el de hoy — entre ellos `blog.html`, que pierde `<link rel=\"next\" href=\"/blog/page/2\"/>` con `/blog/page/2` emitida en los dos. NO atribuidas a la 138.ª: `git diff --name-only 16405ae..HEAD` da 0 ficheros de `apps/web/src`, y ninguna migración entra al bundle (testigos 1709 · 59 · 126 contra 0 · 0 · 0).",
    porQue:
      "Es una ficha con su cardinal y su no-atribución, sobre ESTE repo y este intervalo. La regla que lo gobierna —§regla 16, «mismo código» es un hecho negativo y se DERIVA del diff— ya está escrita y es justo lo que se aplicó para no atribuirlo mal.",
    vocabulario: ["rel=\"next\"", "sin atribuir"],
    enunciadoClave: "131 de 428",
    destino: "PENDIENTES-QA.md §138.ª",
  },
];

/* ── TESTIGOS del propio cruce (§regla 28c) ──────────────────────────────────
 * Heredados de la 134.ª enteros: uno positivo en prosa, uno inventado, y el
 * de CAJA —un titular en CAPS— que es el que destapó la tercera cara del
 * sub-casado. Sin los tres, ni un 0 ni un pleno adjudican. */
const TESTIGOS = [
  {
    id: "T+",
    espera: true,
    clave: "Una medición tomada a un nivel que puede absorber el error no es una medición",
    que: "un enunciado que SE SABE escrito en CLAUDE.md",
  },
  {
    id: "T-",
    espera: false,
    clave: "Antes de medir un color se calibra el monitor contra una carta de grises",
    que: "un enunciado INVENTADO que no puede estar",
  },
  {
    id: "T±",
    espera: true,
    clave: "UN SELECTOR QUE NO CASA CON NADA NO ES UN CERO: ES UN DEFECTO",
    que: "un TITULAR EN MAYÚSCULAS que lleva meses escrito",
  },
];

di("=".repeat(78));
di("138.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces y su NEGATIVO");
di("=".repeat(78));

/** Cruce A · HEREDADO: ¿aparecen las PALABRAS? SOBRE-CASA. */
const laxo = (c) => c.vocabulario.every((v) => CLAUDE.toLowerCase().includes(v.toLowerCase()));

/** Cruce B · ENDURECIDO: ¿aparece el ENUNCIADO? SUB-CASA. Manda éste.
 *  Normaliza espacios, quita los `>` de cita y baja la caja — las tres caras
 *  del sub-casado que las tandas 133.ª y 134.ª pagaron. Sigue exigiendo el
 *  enunciado entero, no su vocabulario; su testigo T- lo demuestra. */
const plano = (s) => s.replace(/^[>\s]+/gm, " ").replace(/\s+/g, " ").toLowerCase();
const CLAUDE_PLANO = plano(CLAUDE);
const endurecido = (c) => CLAUDE_PLANO.includes(plano(c.enunciadoClave));

/** El ANTES/DESPUÉS contra HEAD — lo único que prueba que la regla LLEGÓ.
 *  Que el cruce diga «ya escrito» tras escribirla no separa «la escribí» de
 *  «el cruce se aflojó» (§regla 21). */
const { execFileSync } = await import("node:child_process");
let CLAUDE_HEAD = null;
try {
  CLAUDE_HEAD = plano(
    execFileSync("git", ["show", "HEAD:CLAUDE.md"], {
      cwd: RAIZ, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    }),
  );
} catch { /* sin HEAD legible, el antes/después se declara NO MEDIDO */ }
const enHead = (c) => (CLAUDE_HEAD === null ? null : CLAUDE_HEAD.includes(plano(c.enunciadoClave)));

let ok = true;
const fallo = (m) => { ok = false; di(`   ❌ ${m}`); };

di("");
di("── TESTIGOS DEL CRUCE (antes de creerse ningún número) ──");
for (const t of TESTIGOS) {
  const hallado = CLAUDE_PLANO.includes(plano(t.clave));
  const bien = hallado === t.espera;
  di(`  ${t.id} · ${t.que}`);
  di(`      espera ${t.espera ? "«ya escrito»" : "«NO está»"} → ${hallado ? "«ya escrito»" : "«NO está»"} ${bien ? "✓" : "✗"}`);
  if (!bien) fallo(`el testigo ${t.id} falla: el cruce ${t.espera ? "SUB-CASA" : "SOBRE-CASA"} y su número NO adjudica`);
}
di(`  HEAD legible para el antes/después: ${CLAUDE_HEAD === null ? "NO ✗" : "SÍ ✓"}`);
if (CLAUDE_HEAD === null) fallo("sin HEAD no hay antes/después: «ya escrito» no se puede separar de «el cruce se aflojó»");

di("");
di("── CANDIDATOS ──");
const filas = [];
for (const c of candidatos) {
  const l = laxo(c), e = endurecido(c), h = enHead(c);
  filas.push({ ...c, laxo: l, endurecido: e, enHead: h });
  di("");
  di(`  ${c.id} · ${c.tipo}`);
  di(`      ${c.enunciado}`);
  di(`      POR QUÉ: ${c.porQue}`);
  di(`      cruce LAXO (vocabulario) ....... ${l ? "ya escrito" : "NO está"}`);
  di(`      cruce ENDURECIDO (enunciado) ... ${e ? "ya escrito" : "NO está"}   ← manda`);
  di(`      en HEAD (antes de esta tanda) .. ${h === null ? "NO MEDIDO" : h ? "ya estaba" : "NO estaba"}`);
  di(`      DESTINO: ${c.destino}`);
  if (l && !e) di("      ⚠ el laxo SOBRE-CASA: sus palabras están, el enunciado no.");
}

const reglas = filas.filter((f) => f.tipo === "REGLA");
const suben = reglas.filter((f) => !f.endurecido);
const yaEstaban = reglas.filter((f) => f.endurecido);

di("");
di("── VEREDICTO ──");
di(`  candidatos ................ ${filas.length}`);
di(`  · REGLA ................... ${reglas.length}`);
di(`      · YA escritas ......... ${yaEstaban.length}${yaEstaban.length ? " :: " + yaEstaban.map((f) => f.id).join(", ") : ""}`);
di(`      · SUBEN a CLAUDE.md ... ${suben.length}${suben.length ? " :: " + suben.map((f) => f.id).join(", ") : ""}`);
di(`  · EVENTO (se quedan) ...... ${filas.filter((f) => f.tipo === "EVENTO").length}`);
di("  (el número se escribe aunque sea cero: «no encontré» y «no barrí» son la misma salida)");

di("");
di(ok
  ? "  ✅ los tres testigos pasan y HEAD es legible — el cruce ADJUDICA"
  : "  ❌ el cruce NO adjudica: arriba está el testigo que falla");

writeFileSync(
  join(OUT, "regla12-barrido-138.json"),
  JSON.stringify({
    meta: { tanda: "138.ª", fecha: new Date().toISOString().slice(0, 10), offline: true, adjudica: ok },
    limite: "sólo ve enunciados YA ESCRITOS EN PROSA; una regla que viva en el código es invisible",
    testigos: TESTIGOS.map((t) => ({ ...t, hallado: CLAUDE_PLANO.includes(plano(t.clave)) })),
    candidatos: filas,
    veredicto: { reglas: reglas.length, yaEstaban: yaEstaban.map((f) => f.id), suben: suben.map((f) => f.id) },
  }, null, 2) + "\n",
  "utf8",
);
writeFileSync(join(OUT, "regla12-barrido-138.log"), salida.join("\n") + "\n", "utf8");

process.exitCode = ok ? 0 : 1;
