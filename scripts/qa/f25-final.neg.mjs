/**
 * TEST EN NEGATIVO de `f25-final` — la prueba final, falsada, con control.
 * Uso: npm run qa:f25-final-neg    (⚠ construye varias veces: minutos)
 *
 * `f25-final` es lo único que sostiene *«la FASE 2 entrega lo que promete: el
 * editor da de alta y el sitio se reconstruye»*. Un programa que dijera 6/6
 * pasara lo que pasara daría exactamente la misma salida verde, y la fase
 * quedaría cerrada sobre nada. Los tres sabotajes atacan los tres invariantes
 * que de verdad afirman algo:
 *
 *   · `sin-guarda-render` — **no se construye**. Es el caso peor de todos
 *     porque el escalón murió justo ahí: si P4 pudiera salir verde sin haber
 *     corrido el build, la sonda estaría certificando la cura sin ejercitarla.
 *     Tiene que caer **por P4**, no por otro;
 *   · `href-no-cubre` — el eje `href` se corre con la regla de rutas locales
 *     desactivada. El producto **del admin** tiene que aparecer entre los
 *     defectos; si no aparece, el eje lo lista y no lo juzga, que es la 4.ª
 *     instancia de *«un instrumento anclado a algo que el trabajo mueve»*
 *     volviendo por la puerta de atrás;
 *   · `sin-limpieza` — no se deshace el alta. P6 existe para que una prueba no
 *     deje el sitio distinto de como lo encontró, y sin sabotaje esa promesa no
 *     está ejercitada nunca (las 6 salen verdes con o sin ella).
 *
 * ⚠ **`sin-limpieza` DEJA RESIDUO A PROPÓSITO**, así que este fichero lo
 * recoge: lee la `marca` de la congelada del hijo, borra sus filas y
 * reconstruye. Un negativo que ensucia la DB compartida y se va es peor que no
 * tenerlo.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-guarda-render",
    exit: 1,
    porQue: "no se construye ⇒ P4 no midió nada, y eso NO puede salir verde (el escalón murió ahí)",
    comprueba: (d) =>
      d.invariantes?.["P4·`next build` sobrevive y emite las dos rutas nuevas"]?.ok === false
        ? null
        : `esperaba P4 en rojo; salió ${JSON.stringify(d.veredicto)}`,
  },
  {
    sabotaje: "href-no-cubre",
    exit: 0,
    porQue: "con la regla desactivada, el producto DEL ADMIN sale entre los defectos ⇒ el eje sí lo juzga",
    comprueba: (d) => {
      const p5 = d.invariantes?.["P5·el eje `href` cubre el producto nuevo y NO lo cuenta como coincidente"];
      return p5?.ok === true && /MUERDE sobre el alta del admin/.test(p5.detalle)
        ? null
        : `esperaba P5 verde por mordida sobre el alta; salió ${JSON.stringify(p5)}`;
    },
  },
  {
    sabotaje: "sin-limpieza",
    exit: 1,
    porQue: "no se deshace el alta ⇒ P6 acusa que el artefacto NO volvió a sus rutas",
    comprueba: (d) =>
      d.invariantes?.["P6·deshecho el alta y reconstruido, el artefacto vuelve a las rutas de antes"]?.ok === false
        ? null
        : `esperaba P6 en rojo; salió ${JSON.stringify(d.veredicto)}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · f25-final ════════`);
console.log(`  ${casos.length} sabotajes + control · ⚠ cada uno construye: esto tarda minutos\n`);

const ev = new Evaluadas({ nombre: "f25-final-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "f25-final.mjs")], env, timeout: 1_800_000 });
const fich = (e) => join(QA, nombreNeg("medidas/f25-final.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);

/* ── EL CONTROL, primero: sin él los tres negativos los aprobaría una sonda
 *    rota de fábrica (F2-1 §5). ────────────────────────────────────────────── */
if (existsSync(fich("control"))) rmSync(fich("control"));
const t0 = Date.now();
const ctl = corre("control");
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.veredicto?.violados !== 0) malCtl = `${dCtl.veredicto?.violados} invariante(s) violado(s)`;
else if (dCtl.evidencia?.rutasConAltas !== dCtl.evidencia?.rutasAntes + 1)
  malCtl = `el alta no añadió exactamente 1 ruta (${dCtl.evidencia?.rutasAntes} → ${dCtl.evidencia?.rutasConAltas})`;
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   (${((Date.now() - t0) / 1000).toFixed(0)}s)  ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL   (${((Date.now() - t0) / 1000).toFixed(0)}s)  6/6 · ` +
      `${dCtl.evidencia.rutasAntes} → ${dCtl.evidencia.rutasConAltas} → ${dCtl.evidencia.rutasDespues} rutas`,
  );

for (const c of casos) {
  if (existsSync(fich(c.sabotaje))) rmSync(fich(c.sabotaje));
  const t = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const seg = ((Date.now() - t) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  ${c.porQue}`);
}

/* ── La recogida del residuo que `sin-limpieza` deja a propósito ──────────── */
const marca = lee("sin-limpieza")?.meta?.marca ?? null;
if (marca) {
  console.log(`\n  ── recogiendo el residuo de \`sin-limpieza\` (marca ${marca}) …`);
  const { getPayload } = await import("payload");
  const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
  const payload = await getPayload({ config: await construyeConfig() });
  let n = 0;
  for (const col of ["entradas-blog", "productos", "usuarios"]) {
    const campo = col === "usuarios" ? "email" : "slug";
    const { docs } = await payload.find({
      collection: col,
      where: { [campo]: { like: `${marca}-` } },
      limit: 50,
      depth: 0,
    });
    for (const d of docs) { await payload.delete({ collection: col, id: d.id }); n++; }
  }
  await payload.db.destroy?.();
  const b = spawnSync("npm", ["run", "build", "-w", "web"], {
    cwd: join(QA, "..", ".."),
    encoding: "utf8",
    shell: true,
    timeout: 900_000,
  });
  console.log(`     ${n} fila(s) borradas · reconstruido: exit ${b.status}`);
  if (b.status !== 0) { fallos++; console.log(`  ❌ el residuo NO se pudo recoger del artefacto`); }
} else if (!fallos) {
  fallos++;
  console.log(`  ❌ no se pudo leer la marca de \`sin-limpieza\`: su residuo se queda en la DB`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} f25-final · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La prueba sabe fallar por cada uno de sus tres invariantes con contenido:\n` +
        `   sin build P4 cae, con la regla desactivada el alta del admin SALE entre los\n` +
        `   defectos, y sin deshacer el alta P6 acusa que el sitio quedó distinto.\n`
      : `   La FASE 2 no se puede cerrar citando \`f25-final\` hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
