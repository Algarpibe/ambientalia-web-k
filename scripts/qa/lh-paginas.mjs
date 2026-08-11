/**
 * PAGINACIÓN REAL de los 35 listados/hubs — cuántas rutas `/page/N/` existen.
 * Uso: node scripts/qa/lh-paginas.mjs        (npm run qa:lh-paginas)
 *
 * ── Por qué hace falta una sonda aparte, y no vale leer el HTML ────────────
 * `lh-censo.mjs` sacaba el máximo de los `href="…/page/N/"` que trae la propia
 * paginación, y **eso NO es el número de páginas**: `paginate_links` de
 * WordPress imprime una ventana (`1 2 3 … 8 Siguiente`), no la lista entera.
 * Medido el 2026-07-31: `/es/blog/` emite hasta **8** y su última página que
 * responde 200 es la **17** (la 18 da 404).
 *
 * Así que el final se busca **preguntándole al servidor**, que es el único que
 * lo sabe: exponencial hasta el primer 404 y luego binaria. ~8 peticiones por
 * listado en vez de las ~N que costaría ir de una en una.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CRITERIO DE ESTA SONDA NO ES SUYO: LO PONE `D2.5` (2026-08-11)
 * ══════════════════════════════════════════════════════════════════════════
 * Hasta hoy aquí ponía *«último N con HTTP 200; parada por 404»* **y ya está**.
 * Ese criterio **cuenta las 55 páginas que responden 200 y no listan nada**, o
 * sea que la sonda venía **decidiendo por inercia** —y sin decirlo— la pregunta
 * que el §ESCALÓN F3-2 tuvo que parar la construcción para plantear: si esas 55
 * rutas se replican o no. El «107 rutas extra» que este proyecto llevaba
 * citando meses era **el veredicto de una medición**, no el de una decisión.
 *
 * Es §La causa común de `CLAUDE.md` en su forma más barata: no un contenedor
 * que absorbe un defecto, sino **un criterio de medición ocupando el sitio de
 * una decisión de modelado**.
 *
 * Corregido en las dos direcciones:
 *
 *  1. **el criterio cita su autoridad** — `docs/research/listados-hubs/
 *     DECISIONES.md` §D2.5 (REPLICAR TAL CUAL, firmada por el propietario): las
 *     rutas del clon son **las que el servidor sirve con 200**, vacías
 *     incluidas. El número se deriva de la decisión, no al revés;
 *  2. **se miden y publican LAS DOS magnitudes**, no una. Porque las tres
 *     «fuentes que discrepaban» no discrepan — son dos cosas distintas:
 *
 *     | fuente                     | qué mide                     | acierto |
 *     |----------------------------|------------------------------|---------|
 *     | `<title>` de Yoast «de M»  | la frontera del **SERVIDOR**  | **21/21** |
 *     | ventana de `paginate_links`| la frontera del **CONTENIDO** | **14/14 donde existe — y NO existe en 7 de las 21** |
 *     | contar `<article>`         | la del contenido (la misma)  | —       |
 *
 *     (derivado sobre la población entera en `medidas/lh-serie-vivo.json`)
 *
 * ⚠ Y una precisión que hay que llevar puesta al leer `segunLaVentana` aquí:
 * ese campo viene de `lh-censo`, que toma **el mayor `/page/N/` que el
 * documento CITA en cualquier sitio** — ventana del cuerpo **y `<link
 * rel="next">` del `<head>`**. No es lo mismo que la ventana de
 * `paginate_links`, y por eso da 15/21 en vez de 14/14: las 7 series sin
 * ventana de cuerpo (5 con una sola página de contenido, y los 2
 * `scientific-category` de §LH-C6-L3-SIN-PAGINADOR, que **no sirven paginador**)
 * sólo citan su `/page/2/` desde el `<head>`. Dos medidas distintas con un
 * nombre parecido — se imprimen las dos con su denominador y ninguna se llama
 * «la ventana» a secas.
 *
 *     Manda la del servidor. La otra se imprime al lado para que un lector
 *     futuro vea **qué habría dado la otra lectura** — que es exactamente lo
 *     que no se podía ver.
 *
 * ⚠ La búsqueda binaria del contenido supone que **las páginas con contenido
 * son un PREFIJO** de la serie. No es un supuesto: derivado en las **30/30**
 * series cuya forma usa `<article>` (`lh-serie-vivo.json`), cero excepciones.
 * Si un día se rompe, la comprobación de abajo (`prefijoRoto`) lo dice.
 *
 * ⚠ Y el cero de `<article>` tiene DOS causas y hay que separarlas — es el
 * defecto que `lh-serie` cazó con su control en vivo: `/es/blog/page/9/` da 0
 * porque **está vacía**; `/es/productos/` da 0 porque **esa forma no usa
 * `<article>`**. Se discrimina mirando la página 1 de cada serie.
 */
import { Evaluadas, hoy, w } from "./lib.mjs";
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
 *
 * ⚠ Y desde `D2.5` el canonical no es sólo la guarda del tope: es **EL
 * DISCRIMINADOR** entre las dos formas, y parte limpio en la población entera —
 * canonical a la página 1 en **7/7** (`D2.4`, no se replican) y a sí misma en
 * **55/55** (`D2.5`, se emiten). El original declara él mismo qué es ruta.
 */
const pide = async (url) => {
  for (let i = 0; ; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 60000);
    try {
      const r = await fetch(url, { signal: ctl.signal, redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (recon kunak-web-clone)" } });
      clearTimeout(t);
      const html = r.status === 200 ? await r.text() : "";
      /* El markup se lee sin `<style>`/`<script>`: el CSS de Divi nombra sus
       * propias clases y el censo llegó a contar selectores como marcado
       * (§sondas 4, defecto 1 de `lh-censo`). */
      const limpio = html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
      return {
        status: r.status,
        articles: (limpio.match(/<article\b/gi) || []).length,
        canonical: (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || null,
        /* Yoast: «Página 9 de 17». El total es la frontera del SERVIDOR. */
        tituloTotal: Number((html.match(/<title>[^<]*?P(?:á|&aacute;)gina\s+\d+\s+de\s+(\d+)/i) || [])[1]) || null,
      };
    } catch (e) {
      clearTimeout(t);
      /* ⚠ El `catch {}` mudo de la versión anterior convertía CUALQUIER fallo de
       * red en `status: 0`, y `status: 0` se lee aguas abajo como «no pagina» —
       * o sea la regla 6 de `CLAUDE.md`: una ausencia traducida a un valor
       * benigno, en el sitio donde todavía se sabía qué había pasado. Costó una
       * corrida entera dando «los 35 tienen 1 página» sin un solo error. */
      console.error(`    ⚠ fallo de red (${i + 1}/3) en ${url}: ${e?.name}: ${e?.message}${e?.cause?.code ? ` [${e.cause.code}]` : ""}`);
      if (i >= 2) return { status: 0, articles: 0, canonical: null, tituloTotal: null, errorDeRed: `${e?.name}: ${e?.message}` };
    }
  }
};

const salida = {
  meta: {
    fecha: hoy(),
    rutas: RUTAS.length,
    criterio: "D2.5 · REPLICAR TAL CUAL — la ruta existe si el servidor la sirve con 200 (frontera por 404), vacía incluida",
    autoridad: "docs/research/listados-hubs/DECISIONES.md §D2.5",
    contrafactual: "derivar por contenido (D2.3 al pie): sólo las páginas que listan ≥1 entrada",
    MAX,
  },
  paginas: {},
};
let peticiones = 0;
let prefijoRoto = 0;
let tituloDiscrepa = 0;

const ev = new Evaluadas({ nombre: "lh-paginas", unidad: "rutas", minimo: RUTAS.length });

for (const R of RUTAS) {
  /* Página 1: hace falta para discriminar los dos ceros de `<article>`. */
  const p1 = await pide(`${ORIGEN}${R.ruta}`);
  peticiones++;
  const formaUsaArticle = p1.articles > 0;

  const dos = await pide(`${ORIGEN}${R.ruta}page/2/`);
  peticiones++;
  if (dos.status !== 200) {
    salida.paginas[R.ruta] = {
      grupo: R.grupo,
      paginas: 1,
      segunElServidor: 1,
      segunElContenido: formaUsaArticle ? 1 : null,
      segunLaVentana: R.segunLaVentana,
      segunElTitulo: null,
      status2: dos.status,
    };
    console.log(`  ${R.ruta.padEnd(58)} 1 página`);
    ev.ok(); // «tiene 1 página» es una MEDIDA, no una ruta que se quedó sin medir
    continue;
  }

  /* ── frontera del SERVIDOR: exponencial y luego binaria sobre el 200 ── */
  let bajo = 2;
  let alto = 4;
  for (;;) {
    if (alto > MAX) break;
    const r = await pide(`${ORIGEN}${R.ruta}page/${alto}/`);
    peticiones++;
    if (r.status !== 200) break;
    bajo = alto;
    alto *= 2;
  }

  /* ¿topó? Entonces NO pagina: se comprueba contra el canonical y cuenta 1. */
  if (alto > MAX) {
    peticiones++;
    const tope = await pide(`${ORIGEN}${R.ruta}page/${MAX}/`);
    const can = tope.canonical;
    const mismaPagina = !!can && can.replace(ORIGEN, "").replace(/\/$/, "/") === R.ruta;
    salida.paginas[R.ruta] = {
      grupo: R.grupo,
      paginas: 1,
      paginaDeVerdad: false,
      motivo: `sirve 200 hasta N=${MAX} sin 404; canonical de /page/${MAX}/ → ${can}`,
      canonicalConfirmaMismaPagina: mismaPagina,
      segunElServidor: 1,
      segunElContenido: formaUsaArticle ? 1 : null,
      segunLaVentana: R.segunLaVentana,
      segunElTitulo: null,
    };
    console.log(
      `  ${R.ruta.padEnd(58)}  NO PAGINA  (200 hasta ${MAX};` +
        ` canonical ${mismaPagina ? "→ la misma página ✓" : `= ${can} ⚠ NO confirma`})`,
    );
    /* ⚠ «NO PAGINA» es un RESULTADO, no una ruta sin medir — de hecho cuesta una
     * petición más que las otras (la del canonical). La migración al contrato
     * puso el `ev.ok()` al final del cuerpo del bucle y este `continue` lo
     * saltaba, así que las 14 que no paginan no se contaban: la sonda medía las
     * 35, informaba de las 35, y salía con «NO SE PUDO EVALUAR — 21 de 35».
     *
     * Es la trampa de `c-muestra` por el otro lado: allí la `ev` quedaba fuera
     * de alcance y el verde era falso; aquí el ROJO es falso. Y un rojo que
     * nadie sabe explicar se acaba ignorando, que es como se pierde una guarda. */
    ev.ok();
    continue;
  }

  let lo = bajo;
  let hi = alto;
  let ultimaVista = null;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    peticiones++;
    const r = await pide(`${ORIGEN}${R.ruta}page/${mid}/`);
    if (r.status === 200) {
      lo = mid;
      ultimaVista = r;
    } else hi = mid;
  }
  const servidor = lo;

  /* ── frontera del CONTENIDO: binaria sobre `<article> > 0` dentro de [1,servidor] ──
   * Legítima porque el contenido es un PREFIJO — derivado 30/30, y comprobado
   * abajo en el punto de frontera de cada serie. */
  let contenido = null;
  let paginaVaciaVista = null;
  if (formaUsaArticle) {
    let cLo = 1;
    let cHi = servidor + 1; // primera SIN contenido (centinela)
    while (cHi - cLo > 1) {
      const mid = Math.floor((cLo + cHi) / 2);
      peticiones++;
      const r = await pide(`${ORIGEN}${R.ruta}page/${mid}/`);
      if (r.articles > 0) cLo = mid;
      else {
        cHi = mid;
        paginaVaciaVista = { n: mid, canonical: r.canonical, tituloTotal: r.tituloTotal };
      }
    }
    contenido = cLo;
    /* Control del prefijo EN EL PUNTO QUE IMPORTA: la de después de la frontera
     * tiene que estar vacía y la frontera tiene que tener contenido. Un supuesto
     * derivado en otra corrida no exime de comprobarlo en ésta. */
    if (contenido < servidor) {
      peticiones++;
      const sig = await pide(`${ORIGEN}${R.ruta}page/${contenido + 1}/`);
      if (sig.articles > 0) {
        prefijoRoto++;
        console.error(`  ⚠ ${R.ruta} · page/${contenido + 1}/ tiene ${sig.articles} <article> y la binaria la dio VACÍA — el contenido NO es un prefijo aquí`);
      }
      if (!paginaVaciaVista) paginaVaciaVista = { n: contenido + 1, canonical: sig.canonical, tituloTotal: sig.tituloTotal };
    }
  }

  const tituloTotal = paginaVaciaVista?.tituloTotal ?? ultimaVista?.tituloTotal ?? dos.tituloTotal ?? null;
  if (tituloTotal !== null && tituloTotal !== servidor) tituloDiscrepa++;

  salida.paginas[R.ruta] = {
    grupo: R.grupo,
    paginas: servidor, // ← D2.5: lo que se emite
    paginaDeVerdad: true,
    segunElServidor: servidor,
    segunElContenido: contenido,
    segunLaVentana: R.segunLaVentana,
    segunElTitulo: tituloTotal,
    vacias: contenido === null ? null : servidor - contenido,
    canonicalDeUnaVacia: paginaVaciaVista?.canonical ?? null,
  };
  const marca = contenido !== null && contenido < servidor ? `   ← ${servidor - contenido} VACÍAS (contenido acaba en ${contenido})` : "";
  console.log(`  ${R.ruta.padEnd(58)} ${String(servidor).padStart(3)} páginas${marca}`);
  ev.ok();
}

const vivas = Object.values(salida.paginas);
const paginan = vivas.filter((v) => v.paginaDeVerdad);
const total = vivas.reduce((s, v) => s + v.paginas, 0);
const totalContenido = vivas.reduce((s, v) => s + (v.segunElContenido ?? v.paginas), 0);
const vacias = vivas.reduce((s, v) => s + (v.vacias ?? 0), 0);
const extra = total - RUTAS.length;
const subestimadas = paginan.filter((v) => v.paginas > v.segunLaVentana).length;
const extraVentana = vivas.reduce((s, v) => s + (v.segunLaVentana - 1), 0);
const sinConfirmar = vivas.filter((v) => v.paginaDeVerdad === false && !v.canonicalConfirmaMismaPagina).length;
/* Las dos coincidencias que `D2.5` afirma, re-medidas en cada corrida. */
const conTitulo = paginan.filter((v) => v.segunElTitulo !== null);
const tituloEsServidor = conTitulo.filter((v) => v.segunElTitulo === v.segunElServidor).length;
const conVentana = paginan.filter((v) => v.segunLaVentana > 1 && v.segunElContenido !== null);
const ventanaEsContenido = conVentana.filter((v) => v.segunLaVentana === v.segunElContenido).length;

Object.assign(salida.meta, {
  total,
  extra,
  totalSegunElContenido: totalContenido,
  vacias,
  extraSegunLaVentana: extraVentana,
  subestimadas,
  paginan: paginan.length,
  noPaginan: vivas.length - paginan.length,
  tituloEsLaFronteraDelServidor: `${tituloEsServidor}/${conTitulo.length}`,
  /* Nombre largo a propósito: NO es «la ventana de paginate_links» (ver cabecera). */
  mayorPageNCitadoPorElDocumentoEsLaFronteraDelContenido: `${ventanaEsContenido}/${conVentana.length}`,
  ventanaDeCuerpoEsLaFronteraDelContenido: "14/14 donde existe; ausente en 7 de 21 (derivado en lh-serie-vivo.json, no en esta sonda)",
});

console.log(
  `\n═══ PAGINACIÓN REAL — ${RUTAS.length} listados · criterio D2.5 (replicar tal cual)\n` +
    `  paginan de verdad                     : ${paginan.length}\n` +
    `  NO paginan (200 para cualquier N, canonical a la 1.ª — D2.4): ${vivas.length - paginan.length}\n` +
    `  ▸ RUTAS QUE EMITE EL CLON (D2.5)      : ${total}   ← el número de la entrega\n` +
    `      de ellas, VACÍAS (200 sin entradas): ${vacias}\n` +
    `  ▸ contrafactual: derivando por contenido: ${totalContenido}\n` +
    `  páginas EXTRA además de las ${RUTAS.length} primeras: ${extra}\n` +
    `  ── las dos magnitudes, re-medidas ──\n` +
    `  el <title> de Yoast = frontera del SERVIDOR : ${tituloEsServidor}/${conTitulo.length}\n` +
    `  el mayor /page/N/ que CITA el documento (ventana + <link rel=next>) = frontera del CONTENIDO: ${ventanaEsContenido}/${conVentana.length}\n` +
    `      (la ventana del CUERPO sola: 14/14 donde existe, y no existe en 7 de 21 — lh-serie-vivo.json)\n` +
    `  listados donde la ventana se quedaba corta respecto al servidor: ${subestimadas} de ${paginan.length}\n` +
    `  peticiones: ${peticiones}`,
);
console.log(`✓ evaluadas ${vivas.length}/${RUTAS.length} rutas · paginación`);

if (sinConfirmar) {
  console.error(`\n❌ ${sinConfirmar} ruta(s) marcadas «no pagina» SIN que el canonical lo confirme.\n   Eso es una suposición, no una medida: mírala antes de citar el total.`);
  process.exitCode = 2;
}
if (prefijoRoto) {
  console.error(`\n❌ ${prefijoRoto} serie(s) donde el contenido NO es un prefijo.\n   La binaria de contenido no vale ahí: su número es una suposición. Re-mídelas de una en una.`);
  process.exitCode = 2;
}
if (tituloDiscrepa) {
  console.error(
    `\n⚠ ${tituloDiscrepa} ruta(s) donde el <title> de Yoast NO coincide con la frontera del servidor.\n` +
      `   D2.5 afirma que coinciden (21/21 en la población congelada). Si esto sale ≠0, la afirmación\n` +
      `   ha caducado y hay que reabrirla — no ignorarla.`,
  );
  process.exitCode = 2;
}

w("medidas/lh-paginas.json", salida);

/* ⚠ Aquí ponía `process.exit(0)` a secas, y eso **pisaba los tres ❌ de arriba**:
 * `process.exit(0)` resetea `process.exitCode`, así que el «canonical NO
 * confirma» se imprimía y la sonda salía VERDE. Es la regla 1 de `CLAUDE.md`
 * (§sondas) por la puerta de atrás — no un descuadre sin contar, sino uno
 * contado y luego borrado en la última línea.
 * Se sale explícito para no depender del cierre de sockets, pero **con el
 * código que se haya calculado**; el gancho de `Evaluadas` puede subirlo aún
 * más (comprobado: un `process.on("exit")` sí lo sobrescribe). */
process.exit(process.exitCode ?? 0);
