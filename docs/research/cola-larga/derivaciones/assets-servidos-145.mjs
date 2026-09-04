/**
 * 145.ª · ESCALÓN 3 — ¿SIRVE EL CONTENEDOR LOS ASSETS DE `public/`?
 *
 * El pre-registro (`pre-registro-assets-145.md`) fijó el testigo: *«un fichero
 * concreto de `public/images/`, pedido al contenedor por HTTP»*. Al pedirlo
 * apareció un **404 sobre un fichero que SÍ está en la imagen** — o sea una ruta
 * que no cuadra, no un asset que falte.
 *
 * ⚠ **Y esto es lo que un comparador de HTML NO PUEDE VER**, que es la lección
 * de método: el HTML del contenedor y el de la referencia son **idénticos** —las
 * etiquetas `<img>` están, con su `src` correcto—. Lo que falla es lo que hay
 * DETRÁS del `src`. La página responde **200** y se ve rota.
 *
 * CONTROLES por las dos polaridades (§regla 28d), porque un «200» sin el negativo
 * no distingue «el arreglo funciona» de «este contenedor devuelve 200 a todo»:
 *   · NEGATIVO — la imagen SIN arreglar (`:144-fix`) tiene que dar **404**;
 *   · POSITIVO — la imagen CON el arreglo tiene que dar **200 y los bytes
 *     EXACTOS** del fichero en disco. No basta con 200: una página de error
 *     también lo sería si el servidor la sirviera, y de hecho el 404 de arriba
 *     traía 10 796 bytes de HTML.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const APP = path.join(RAIZ, "apps/web");
const TESTIGO = "images/logos/kunak-logo.svg";
const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const bytesEnDisco = fs.statSync(path.join(APP, "public", TESTIGO)).size;

async function pideElTestigo(imagen, puerto) {
  const NOMBRE = "kunak-assets-" + puerto;
  d("rm", "-f", NOMBRE);
  const r = d(
    "run", "-d", "--name", NOMBRE,
    "-p", `${puerto}:3000`,
    /* Conexión inválida a propósito: los assets estáticos NO dependen de la DB,
     * y así el caso no arrastra el estado de Postgres (§regla 32: lo que se le
     * hace a un lado se le hace al otro — aquí, los dos igual de sin DB). */
    "-e", "DATABASE_URI=postgres://x:y@host.docker.internal:55432/z",
    "-e", "PAYLOAD_SECRET=assets-probe-145-local-only",
    "--add-host", "host.docker.internal:host-gateway",
    "-v", `${path.join(APP, ".next")}:/app/apps/web/.next:ro`,
    "-v", "/app/apps/web/.next/standalone",
    imagen,
  );
  let res = { arranque: r.status, http: null, bytes: null };
  if (r.status === 0) {
    for (let i = 0; i < 50; i++) {
      try {
        const q = await fetch(`http://127.0.0.1:${puerto}/${TESTIGO}`, {
          signal: AbortSignal.timeout(5000),
        });
        res.http = q.status;
        res.bytes = (await q.arrayBuffer()).byteLength;
        break;
      } catch {
        /* aún no escucha */
      }
      await espera(1000);
    }
  } else {
    res.error = (r.stderr || "").trim().slice(0, 200);
  }
  d("rm", "-f", NOMBRE);
  return res;
}

const salida = {
  fecha: new Date().toISOString(),
  testigo: TESTIGO,
  bytesEnDisco,
  casos: {},
};

salida.casos.sinArreglo = {
  pregunta: "la imagen con `public` en /app/public — el estado ANTES",
  imagen: "ai-website-cloner:144-fix",
  ...(await pideElTestigo("ai-website-cloner:144-fix", 3920)),
};

salida.casos.conArreglo = {
  pregunta: "la imagen con `public` en /app/apps/web/public — el efecto del COPY corregido",
  imagen: "ai-website-cloner:145-publicfix",
  ...(await pideElTestigo("ai-website-cloner:145-publicfix", 3921)),
};

const neg = salida.casos.sinArreglo;
const pos = salida.casos.conArreglo;
const ok = neg.http === 404 && pos.http === 200 && pos.bytes === bytesEnDisco;

salida.veredicto = ok
  ? `✅ EL ARREGLO SIRVE LOS ASSETS — sin él ${neg.http} (${neg.bytes} bytes de HTML de error), con él ${pos.http} y ${pos.bytes} bytes = los del fichero en disco`
  : `NO ADJUDICA — sin arreglo ${neg.http}/${neg.bytes}, con arreglo ${pos.http}/${pos.bytes}, disco ${bytesEnDisco}`;

const fichero = path.join(AQUI, "assets-servidos-145.json");
fs.writeFileSync(fichero, JSON.stringify(salida, null, 2) + "\n");
console.log(JSON.stringify(salida, null, 2));
console.log("\n→ " + fichero);
process.exit(ok ? 0 : 1);
