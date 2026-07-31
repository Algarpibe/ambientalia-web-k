/**
 * PAGINACIÓN REAL de los 35 listados/hubs — cuántas rutas `/page/N/` existen.
 * Uso: node scripts/qa/lh-paginas.mjs        (npm run qa:lh-paginas)
 *
 * ── Por qué hace falta una sonda aparte, y no vale leer el HTML ────────────
 * `lh-censo.mjs` sacaba el máximo de los `href="…/page/N/"` que trae la propia
 * paginación, y **eso NO es el número de páginas**: `paginate_links` de
 * WordPress imprime una ventana (`1 2 3 … 8 Siguiente`), no la lista entera.
 * Medido el 2026-07-31: `/es/blog/` emite hasta **8** y su última página real
 * es la **17** (la 18 da 404); `etiqueta/monitorizacion-ambiental` emitía 11 y
 * pasa de 13. O sea que el total del censo (56 páginas extra) es un **suelo**,
 * y para el enrutado (§4 del ESQUEMA) un suelo no sirve: cada `/page/N/` es
 * una ruta que alguien tendrá que emitir.
 *
 * Así que el final se busca **preguntándole al servidor**, que es el único que
 * lo sabe: exponencial hasta el primer 404 y luego binaria. ~8 peticiones por
 * listado en vez de las ~N que costaría ir de una en una.
 *
 * ⚠ **El criterio de parada es el 404, y está comprobado** contra el caso
 * conocido: 17 → 200, 18 → 404 en `/es/blog/`. Si un día el sitio sirviera 200
 * para cualquier N (paginación infinita), esta sonda daría el tope y hay que
 * verlo: por eso imprime cuándo ha topado con `MAX`.
 */
import { w } from "./lib.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ORIGEN = "https://kunakair.com";
const QA = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
/** Tope de seguridad: ningún listado de este sitio se acerca, y evita un bucle. */
const MAX = 64;

/** Las 35 salen del censo congelado — no se re-escriben a mano. */
const censo = JSON.parse(readFileSync(join(QA, "medidas/lh-censo.json"), "utf8"));
const RUTAS = Object.entries(censo.paginas)
  .filter(([, v]) => !v.error)
  .map(([ruta, v]) => ({ ruta, grupo: v.grupo, segunLaVentana: v.paginacion?.maxPagina ?? 1 }));

/**
 * ⚠ **Topar con MAX no es «tiene MAX páginas»: es que esa ruta NO pagina.**
 *
 * Medido 2026-07-31: `/es/productos/page/999/` devuelve **200** y su
 * `<link rel="canonical">` apunta a `/es/productos/`. WordPress solo interpreta
 * `/page/N/` cuando hay un loop paginado; en una página normal lo ignora y
 * sirve la misma. Las 7 que topan son las 7 que no son archivos (6 hubs de
 * builder + `casos-de-exito`), y **contarlas como 64 rutas cada una inventaba
 * 441 rutas que no existen**.
 *
 * La primera versión de esta sonda **imprimía el aviso de tope y sumaba el
 * número igual** — la regla 1 de `CLAUDE.md` (§sondas) rota dentro del propio
 * informe, exactamente como le pasó a `ruido.mjs` con el nº de filas variable.
 * Ahora el tope se comprueba contra el canonical y esas rutas cuentan **1**.
 */
const canonicalDe = async (url) => {
  try {
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (recon kunak-web-clone)" } });
    const h = await r.text();
    return (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || null;
  } catch {
    return null;
  }
};

const estado = async (url) => {
  for (let i = 0; ; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 60000);
    try {
      const r = await fetch(url, { signal: ctl.signal, redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (recon kunak-web-clone)" } });
      clearTimeout(t);
      return r.status;
    } catch {
      clearTimeout(t);
      if (i >= 2) return 0;
    }
  }
};
const hay = async (ruta, n) => {
  const s = await estado(`${ORIGEN}${ruta}page/${n}/`);
  return { ok: s === 200, status: s };
};

const salida = { meta: { fecha: new Date().toISOString().slice(0, 10), rutas: RUTAS.length, criterio: "último N con HTTP 200; parada por 404", MAX }, paginas: {} };
let peticiones = 0;
let topes = 0;

for (const R of RUTAS) {
  /* ¿pagina siquiera? */
  const dos = await hay(R.ruta, 2);
  peticiones++;
  if (!dos.ok) {
    salida.paginas[R.ruta] = { grupo: R.grupo, paginas: 1, segunLaVentana: R.segunLaVentana, status2: dos.status };
    console.log(`  ${R.ruta.padEnd(58)} 1 página`);
    continue;
  }
  /* exponencial hasta el primer fallo */
  let bajo = 2;
  let alto = 4;
  while (alto <= MAX && (await hay(R.ruta, alto)).ok) {
    peticiones++;
    bajo = alto;
    alto *= 2;
  }
  peticiones++;
  /* ¿topó? Entonces NO pagina: se comprueba contra el canonical y cuenta 1. */
  if (alto > MAX) {
    topes++;
    peticiones++;
    const can = await canonicalDe(`${ORIGEN}${R.ruta}page/${MAX}/`);
    const mismaPagina = !!can && can.replace(ORIGEN, "").replace(/\/$/, "/") === R.ruta;
    salida.paginas[R.ruta] = {
      grupo: R.grupo,
      paginas: 1,
      paginaDeVerdad: false,
      motivo: `sirve 200 hasta N=${MAX} sin 404; canonical de /page/${MAX}/ → ${can}`,
      canonicalConfirmaMismaPagina: mismaPagina,
      segunLaVentana: R.segunLaVentana,
    };
    console.log(
      `  ${R.ruta.padEnd(58)}  NO PAGINA  (200 hasta ${MAX};` +
        ` canonical ${mismaPagina ? "→ la misma página ✓" : `= ${can} ⚠ NO confirma`})`,
    );
    continue;
  }
  /* binaria en (bajo, alto) */
  let lo = bajo;
  let hi = alto;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    peticiones++;
    if ((await hay(R.ruta, mid)).ok) lo = mid;
    else hi = mid;
  }
  salida.paginas[R.ruta] = { grupo: R.grupo, paginas: lo, paginaDeVerdad: true, segunLaVentana: R.segunLaVentana };
  const marca = lo > R.segunLaVentana ? `  ⚠ la ventana decía ${R.segunLaVentana}` : "";
  console.log(`  ${R.ruta.padEnd(58)} ${String(lo).padStart(3)} páginas${marca}`);
}

const vivas = Object.values(salida.paginas);
const paginan = vivas.filter((v) => v.paginaDeVerdad);
const total = vivas.reduce((s, v) => s + v.paginas, 0);
const extra = total - RUTAS.length;
const subestimadas = paginan.filter((v) => v.paginas > v.segunLaVentana).length;
const extraVentana = vivas.reduce((s, v) => s + (v.segunLaVentana - 1), 0);
const sinConfirmar = vivas.filter((v) => v.paginaDeVerdad === false && !v.canonicalConfirmaMismaPagina).length;

Object.assign(salida.meta, { total, extra, extraSegunLaVentana: extraVentana, subestimadas, paginan: paginan.length, noPaginan: vivas.length - paginan.length });

console.log(
  `\n═══ PAGINACIÓN REAL — ${RUTAS.length} listados\n` +
    `  paginan de verdad                     : ${paginan.length}\n` +
    `  NO paginan (sirven 200 para cualquier N, canonical a la 1.ª): ${vivas.length - paginan.length}\n` +
    `  RUTAS TOTALES (1.ª + paginación)      : ${total}\n` +
    `  páginas EXTRA además de las ${RUTAS.length} primeras: ${extra}\n` +
    `  lo que decía la ventana de paginate_links: ${extraVentana}  ← subestimaba en ${extra - extraVentana}\n` +
    `  listados donde la ventana se quedaba corta: ${subestimadas} de ${paginan.length}\n` +
    `  peticiones: ${peticiones}`,
);
if (sinConfirmar) {
  console.error(`\n❌ ${sinConfirmar} ruta(s) marcadas «no pagina» SIN que el canonical lo confirme.\n   Eso es una suposición, no una medida: mírala antes de citar el total.`);
  process.exitCode = 2;
}

w("medidas/lh-paginas.json", salida);
process.exit(0);
