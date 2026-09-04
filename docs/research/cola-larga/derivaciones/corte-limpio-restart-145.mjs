/**
 * 145.ª · PASO 0 punto 2 — EL CORTE LIMPIO DE B.
 *
 * B (volumen + `docker restart`) tiene UN solo riesgo: que el proceso del
 * publicador pueda reiniciar el contenedor. Este script lo mide en LOCAL.
 *
 * ⚠ La pregunta se hace desde un proceso NODE HIJO, no desde el shell del
 * operador: el publicador es node, y lo que decide es si NODE puede, no si el
 * humano puede. Son dos afirmaciones distintas (§regla 15).
 *
 * ⚠ Y la comprobación es POR EFECTO (§regla 53): no que `docker restart`
 * devuelva 0, sino que `StartedAt` del contenedor CAMBIE. Un `restart` sobre el
 * contenedor equivocado devuelve sin error y no reinicia nada.
 *
 * CONTROLES, por las DOS polaridades (§regla 28d) — con uno solo, un mecanismo
 * que dijera siempre «sí» pasaría igual:
 *   · POSITIVO — restart sobre un contenedor que EXISTE ⇒ exit 0 y StartedAt
 *     avanza;
 *   · NEGATIVO — restart sobre un contenedor INVENTADO ⇒ exit != 0.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PROBE = "kunak-restart-probe";
const INVENTADO = "kunak-no-existe-" + Math.random().toString(36).slice(2, 10);

const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });

function startedAt(nombre) {
  const r = d("inspect", nombre, "--format", "{{.State.StartedAt}}");
  return r.status === 0 ? r.stdout.trim() : null;
}

const salida = { fecha: new Date().toISOString(), casos: {} };

// ── 1 · ¿el CLI de docker es alcanzable desde node? ──────────────────────────
const ver = d("version", "--format", "{{.Server.Version}}");
salida.casos.cliAlcanzable = {
  pregunta: "¿un proceso node puede hablar con el demonio de Docker?",
  exit: ver.status,
  servidor: ver.stdout.trim() || null,
  error: ver.status === 0 ? null : (ver.stderr || "").trim().slice(0, 200),
  veredicto: ver.status === 0 ? "SÍ" : "NO",
};

// ── 2 · CONTROL POSITIVO — restart sobre contenedor que existe ───────────────
const antes = startedAt(PROBE);
const rs = d("restart", PROBE);
const despues = startedAt(PROBE);
salida.casos.restartPositivo = {
  pregunta: "¿node puede reiniciar un contenedor que existe, POR EFECTO?",
  contenedor: PROBE,
  exit: rs.status,
  startedAtAntes: antes,
  startedAtDespues: despues,
  cambio: Boolean(antes && despues && antes !== despues),
  error: rs.status === 0 ? null : (rs.stderr || "").trim().slice(0, 200),
  veredicto:
    rs.status === 0 && antes && despues && antes !== despues ? "SÍ" : "NO",
};

// ── 3 · CONTROL NEGATIVO — restart sobre contenedor inventado ────────────────
const rn = d("restart", INVENTADO);
salida.casos.restartNegativo = {
  pregunta: "¿el mecanismo sabe FALLAR? (sin esto, el positivo no prueba nada)",
  contenedor: INVENTADO,
  exit: rn.status,
  error: (rn.stderr || "").trim().slice(0, 200),
  veredicto: rn.status !== 0 ? "SÍ, falla como debe" : "NO — mecanismo mudo",
};

// ── 4 · ¿por qué canal habla? (el que decide el riesgo en destino) ───────────
const ctx = d("context", "inspect", "--format", "{{.Endpoints.docker.Host}}");
salida.casos.canal = {
  pregunta: "¿por qué endpoint habla node con el demonio?",
  host: ctx.stdout.trim() || null,
  nota:
    "en destino este endpoint es el socket de Docker, y quien lo gobierna es " +
    "Easypanel: por eso la mitad de DESTINO no se puede derivar desde aquí.",
};

const ok =
  salida.casos.cliAlcanzable.veredicto === "SÍ" &&
  salida.casos.restartPositivo.veredicto === "SÍ" &&
  salida.casos.restartNegativo.exit !== 0;

salida.veredicto = ok
  ? "B ES VIABLE EN LOCAL — node reinicia el contenedor, y el mecanismo sabe fallar"
  : "B NO ES VIABLE EN LOCAL";

const fichero = path.join(AQUI, "corte-limpio-restart-145.json");
fs.writeFileSync(fichero, JSON.stringify(salida, null, 2) + "\n");
console.log(JSON.stringify(salida, null, 2));
console.log("\n→ " + fichero);
process.exit(ok ? 0 : 1);
