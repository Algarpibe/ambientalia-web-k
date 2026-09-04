/**
 * 145.ª · PASO 0 punto 2, LA SEPARADORA QUE DECIDE EL RIESGO EN DESTINO.
 *
 * El corte limpio de B se enunció como *«¿puede el publicador ejecutar `docker
 * restart`?»*, y esa forma **presupone el socket de Docker** —que es root, y en
 * destino lo gobierna Easypanel—. Antes de fichar la indeterminación hay que
 * enumerar las separadoras candidatas (§*antes de fichar una indeterminación,
 * enumera las separadoras candidatas y di por qué cada una no sirve*), y hay una
 * que NO necesita el socket:
 *
 *   > **Un contenedor con política `restart: unless-stopped` / `always` vuelve a
 *   > arrancar SOLO cuando su proceso principal SALE.** Así que el publicador no
 *   > necesita hablar con el demonio: le basta con TERMINARSE.
 *
 * Si eso se sostiene, B es viable en destino **sin privilegios especiales**, y
 * la pregunta a Easypanel deja de ser «¿me das el socket?» —que casi siempre es
 * que no— y pasa a ser «¿qué política de reinicio tiene el servicio?», que es
 * una casilla de su interfaz.
 *
 * CONTROLES por las DOS polaridades (§regla 28d):
 *   · POSITIVO — con `--restart unless-stopped`, salir ⇒ el contenedor VUELVE;
 *   · NEGATIVO — con `--restart no`, salir ⇒ el contenedor NO vuelve.
 * Sin el negativo, un demonio que reiniciara todo pasaría igual.
 *
 * Y se mide POR EFECTO (§regla 53): no que el comando devuelva, sino que
 * `RestartCount` suba y `StartedAt` avance.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const IMG = "postgres:17-alpine";
const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });

function estado(n) {
  const r = d(
    "inspect",
    n,
    "--format",
    "{{.State.Status}}|{{.RestartCount}}|{{.State.StartedAt}}",
  );
  if (r.status !== 0) return null;
  const [status, restartCount, startedAt] = r.stdout.trim().split("|");
  return { status, restartCount: Number(restartCount), startedAt };
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Levanta un contenedor cuyo proceso principal vive `vidaSeg` y luego SALE con
 * código 0 — que es exactamente lo que haría un publicador que decide
 * reiniciarse. Después observa si vuelve.
 */
async function caso(nombre, politica, vidaSeg = 3, esperaSeg = 12) {
  d("rm", "-f", nombre);
  const r = d(
    "run",
    "-d",
    "--name",
    nombre,
    "--restart",
    politica,
    IMG,
    "sh",
    "-c",
    `sleep ${vidaSeg}; exit 0`,
  );
  if (r.status !== 0)
    return { politica, error: (r.stderr || "").trim().slice(0, 200) };

  const inicial = estado(nombre);
  await espera((vidaSeg + esperaSeg) * 1000);
  const final = estado(nombre);
  d("rm", "-f", nombre);

  const volvio = Boolean(
    final &&
      inicial &&
      (final.restartCount > inicial.restartCount ||
        (final.status === "running" && final.startedAt !== inicial.startedAt)),
  );
  return {
    politica,
    inicial,
    final,
    volvio,
    veredicto: volvio ? "VUELVE SOLO" : "NO vuelve",
  };
}

const salida = { fecha: new Date().toISOString(), imagen: IMG, casos: {} };

salida.casos.positivo = await caso(
  "kunak-autoreinicio-si",
  "unless-stopped",
);
salida.casos.negativo = await caso("kunak-autoreinicio-no", "no");

const ok =
  salida.casos.positivo.volvio === true &&
  salida.casos.negativo.volvio === false;

salida.veredicto = ok
  ? "SEPARADORA SOSTENIDA — un contenedor con `unless-stopped` se reinicia SOLO al salir su proceso, y sin la política NO lo hace. B no necesita el socket de Docker en destino: le basta con que el servicio tenga política de reinicio."
  : "SEPARADORA NO SOSTENIDA — revisar: los dos casos tienen que diferir";

salida.consecuencia = ok
  ? {
      enDestino:
        "la pregunta a Easypanel deja de ser «¿me das /var/run/docker.sock?» " +
        "(root, casi siempre que no) y pasa a ser «¿qué política de reinicio " +
        "tiene el servicio?», que es una casilla de su interfaz y el valor por " +
        "defecto de casi todo orquestador.",
      enLocal:
        "las DOS vías quedan disponibles: `docker restart` desde fuera (medido " +
        "en corte-limpio-restart-145.json) y la auto-salida desde dentro.",
    }
  : null;

const fichero = path.join(AQUI, "autorreinicio-145.json");
fs.writeFileSync(fichero, JSON.stringify(salida, null, 2) + "\n");
console.log(JSON.stringify(salida, null, 2));
console.log("\n→ " + fichero);
process.exit(ok ? 0 : 1);
