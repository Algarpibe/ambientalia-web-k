/**
 * `qa:enlaces` · LA CADUCIDAD DE LA CIFRA CITADA Y EL REPARTO DE LA MASA
 * Uso: node docs/research/cola-larga/derivaciones/enlaces-caducidad-reparto-120.mjs
 *      (offline: lee congeladas, no toca el clon)
 *
 * ── Las dos preguntas ───────────────────────────────────────────────────────
 *
 * 1. **¿Contra qué manifiesto se midió la cifra que se venía citando?** La 119.ª
 *    escribió «105 hrefs distintos · 1395 apariciones · 2 rotos». Ninguno de los
 *    tres es de hoy. Una sonda que se cita desde una congelada vieja **mide el
 *    artefacto, no el clon** — y las congeladas llevan su `meta.paginas`, así
 *    que la caducidad se DERIVA en vez de estimarse.
 *
 * 2. **¿Dónde está la masa?** 9695 apariciones repartidas entre 150 hrefs no
 *    dice si son 150 arreglos o uno. La pregunta que decide el trabajo es
 *    cuántos hrefs son del CASCARÓN —presentes en las 426 páginas— porque ésos
 *    se multiplican por el corpus entero y se arreglan en un puñado de ficheros.
 *
 * ⚠ Esta derivación NO adjudica el defecto ni lo arregla: lo dimensiona. El
 * veredicto de §regla 21 es que un rojo real se deja ROJO y se ficha.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MED = new URL("../../../../scripts/qa/medidas/", import.meta.url).pathname
  .replace(/^\/([A-Za-z]:)/, "$1");

const yaMarcado = (n) => /-neg-|SABOTAJE|SONDA-/.test(n);

/* La serie se DERIVA del directorio, no de una lista escrita a mano (§regla 9). */
const serie = readdirSync(MED)
  .filter((n) => /^enlaces(-\d{4}-\d{2}-\d{2}(-\d+)?)?\.json$/.test(n))
  .filter((n) => !yaMarcado(n))
  .map((n) => {
    const o = JSON.parse(readFileSync(join(MED, n), "utf8"));
    return { fichero: n, ...(o.meta || {}), _o: o };
  })
  .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || a.fichero.localeCompare(b.fichero));

const hoy = serie[serie.length - 1];
const canonica = serie.find((s) => s.fichero === "enlaces.json");

/* ── Guarda: sin al menos dos corridas no hay caducidad que derivar ── */
if (serie.length < 2) {
  console.error(`\n❌ sólo ${serie.length} congelada(s): no hay serie que comparar. Corrida NULA.`);
  process.exitCode = 1;
}

const distintos = (o) => new Set((o.fallos || []).map((f) => f.href)).size;

console.log(`\n═══ 1 · LA SERIE, Y LO QUE EL NOMBRE CANÓNICO GUARDA\n`);
console.log(`  fichero                              fecha        páginas  hrefs  aparic  rotos`);
for (const s of serie) {
  const d = s._o.fallos ? distintos(s._o) : "·";
  console.log(
    "  " + s.fichero.padEnd(36) + String(s.fecha).padEnd(13) +
      String(s.paginas ?? "·").padStart(7) + String(d).padStart(7) +
      String(s.fallos ?? "·").padStart(8) + String(s.rotos ?? "·").padStart(7),
  );
}
console.log(
  `\n  ⚠ el nombre CANÓNICO \`enlaces.json\` es de ${canonica?.fecha} y dice ` +
    `${canonica?.paginas} páginas (§regla 5: guarda la PRIMERA foto, no el estado de hoy).`,
);

/* ── 2 · la caducidad de la cifra citada, buscada por su valor ── */
const citado = { hrefs: 105, apariciones: 1395, rotos: 2 };
const origen = serie.find(
  (s) => s.fallos === citado.apariciones && s.rotos === citado.rotos,
);
console.log(`\n═══ 2 · LA CIFRA CITADA POR LA 119.ª, LOCALIZADA\n`);
if (!origen) {
  console.error("  ❌ no se encuentra ninguna congelada con esa cifra: no se puede adjudicar.");
  process.exitCode = 1;
} else {
  console.log(`  «105 hrefs · 1395 apariciones · 2 rotos» sale de ${origen.fichero} (${origen.fecha}).`);
  console.log(`  hrefs distintos en ese fichero, derivado: ${distintos(origen._o)}`);
  const dias = Math.round(
    (new Date(hoy.fecha) - new Date(origen.fecha)) / 86400000,
  );
  console.log(`\n  caducidad: ${dias} días · ${hoy.paginas - origen.paginas} rutas de diferencia`);
  console.log(`\n  eje                 citado (${origen.fecha})   HOY (${hoy.fecha})`);
  console.log(`  páginas                        ${String(origen.paginas).padStart(6)}        ${String(hoy.paginas).padStart(6)}`);
  console.log(`  hrefs distintos                ${String(distintos(origen._o)).padStart(6)}        ${String(distintos(hoy._o)).padStart(6)}`);
  console.log(`  apariciones                    ${String(origen.fallos).padStart(6)}        ${String(hoy.fallos).padStart(6)}`);
  console.log(`  rotos (unidad: href)           ${String(origen.rotos).padStart(6)}        ${String(hoy.rotos).padStart(6)}`);
  console.log(
    `  densidad por página            ${(origen.fallos / origen.paginas).toFixed(2).padStart(6)}        ` +
      `${(hoy.fallos / hoy.paginas).toFixed(2).padStart(6)}`,
  );
}

/* ── 3 · dónde está la masa ── */
const porHref = {};
for (const f of hoy._o.fallos) {
  porHref[f.href] = porHref[f.href] || { n: 0, origen: f.origen };
  porHref[f.href].n++;
}
const orden = Object.entries(porHref).sort((a, b) => b[1].n - a[1].n);
const ubicuos = orden.filter(([, v]) => v.n >= hoy.paginas);
const masa = ubicuos.reduce((a, [, v]) => a + v.n, 0);

console.log(`\n═══ 3 · DÓNDE ESTÁ LA MASA — 21 hrefs o 150 arreglos\n`);
console.log(`  hrefs del CASCARÓN (en las ${hoy.paginas}) : ${ubicuos.length}`);
console.log(`  apariciones que suman ................. ${masa}  (${(100 * masa / hoy.fallos).toFixed(1)} %)`);
console.log(`  el resto ............................. ${hoy.fallos - masa} en ${orden.length - ubicuos.length} hrefs`);
console.log(`\n  aparic  destino (ya emitido por el build)          origen`);
for (const [h, v] of ubicuos)
  console.log(
    "  " + String(v.n).padStart(6) + "  " +
      h.replace("https://kunakair.com/es", "").padEnd(46) +
      (v.origen || "").split(" · ").slice(0, 2).join(" · ").slice(0, 66),
  );

/* ── Guarda: si el cascarón no explica nada, el reparto no discrimina ── */
if (ubicuos.length === 0) {
  console.error(`\n❌ CERO hrefs ubicuos sobre ${hoy.fallos} apariciones: el reparto no discrimina.`);
  process.exitCode = 1;
}

writeFileSync(
  new URL("./enlaces-caducidad-reparto-120.json", import.meta.url),
  JSON.stringify(
    {
      meta: { fecha: "2026-08-27", tanda: "120.ª ESCALÓN 1", congeladas: serie.length },
      canonica: { fichero: canonica?.fichero, fecha: canonica?.fecha, paginas: canonica?.paginas },
      citado: origen ? { fichero: origen.fichero, fecha: origen.fecha, paginas: origen.paginas } : null,
      hoy: { fichero: hoy.fichero, fecha: hoy.fecha, paginas: hoy.paginas, hrefs: distintos(hoy._o), apariciones: hoy.fallos, rotos: hoy.rotos },
      cascaron: { nHrefs: ubicuos.length, apariciones: masa, pct: +(100 * masa / hoy.fallos).toFixed(1), hrefs: ubicuos.map(([h, v]) => ({ href: h, n: v.n, origen: v.origen })) },
      cola: { nHrefs: orden.length - ubicuos.length, apariciones: hoy.fallos - masa },
    },
    null,
    1,
  ),
  "utf8",
);
console.log(`\n→ derivaciones/enlaces-caducidad-reparto-120.json`);
