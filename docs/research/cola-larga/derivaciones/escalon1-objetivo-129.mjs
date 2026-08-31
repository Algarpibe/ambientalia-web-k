// 129.ª · ESCALÓN 1 — EL OBJETIVO: qué es un MÓDULO en las 4 rutas del lote.
//
// El clon tiene que emitir `[data-modulo]` donde el original tiene
// `.et_pb_module`, y para eso hace falta saber PRIMERO qué hay ahí. Esto lo
// deriva del ORIGINAL capturado, fila a fila y con el TIPO de cada módulo, para
// que quien escriba el marcador tenga el objetivo delante en vez de contarlos
// en el navegador.
//
// EL CRITERIO SE REPLICA DE `productos-cmp.mjs` L246-268, NO SE INVENTA —
// §regla 31 hermana: dos instrumentos que censan el mismo objeto con criterios
// distintos INVENTAN el desacuerdo, y aquí el desacuerdo se leería como «al
// clon le faltan módulos».
//
//   · fila   = `.et_pb_row` que NO cuelga de `_tb_header` / `_tb_footer`
//              (el cascarón del theme builder, que el clon no marca);
//   · módulo = `.et_pb_module` DESCENDIENTE de esa fila (no hijo directo).
//
// ⚠ ESTO ES UN CENSO DE NODOS, NO DE LO QUE SE VE (§*un censo de NODOS y un
// censo de LO QUE SE VE son dos medidas distintas*). Corre sobre el HTML del
// corpus SIN NAVEGADOR, así que **no puede filtrar por caja** — y el comparador
// sí lo hace. Por eso publica su cardinal `enElDOM` y se declara como COTA
// SUPERIOR del objetivo, no como el objetivo. El número con caja lo da
// `productos-cmp`, y su `porFila` ya está congelado: se CRUZA contra él, que es
// el control que hace que este censo signifique algo (§sondas 4).
//
// LO QUE NO CONTESTA: no dice DÓNDE va el marcador en el clon —eso es leer los
// componentes— ni mide un píxel. OFFLINE: no toca red, clon, Postgres ni
// construye.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus", "productos");
const M = join(RAIZ, "scripts", "qa", "medidas");
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");

/* Los 4 documentos y su ruta, DERIVADOS de la congelada de `productos-cmp` para
 * no escribir a mano un mapa que ya existe (§regla 9). */
const ARTEFACTO = /-neg-|SABOTAJE|SONDA-|CONTAMINADA|OBSOLETA|INTERRUMPIDA/;
const resuelve = (p) =>
  readdirSync(M)
    .filter((x) => x.startsWith(p) && x.endsWith(".json") && !ARTEFACTO.test(x))
    .map((x) => ({ x, mt: statSync(join(M, x)).mtimeMs }))
    .sort((a, b) => b.mt - a.mt)[0] ?? null;

const ref = resuelve("productos-cmp-1440");
if (!ref) {
  console.error("PRECONDICIÓN: no hay congelada de productos-cmp-1440. Sin ella no hay control y la corrida NO VALE.");
  process.exit(2);
}
const CMP = JSON.parse(readFileSync(join(M, ref.x), "utf8"));

const MAPA = {
  "/monitor-calidad-aire": "monitor-calidad-aire.html",
  "/accesorios": "accesorios.html",
  "/software-de-medicion-calidad-del-aire": "software-de-medicion-calidad-del-aire.html",
  "/kunak-api": "kunak-api.html",
};

const salida = [];
const di = (s = "") => {
  salida.push(s);
  console.log(s);
};
const fallos = [];
const control = (id, ok, det) => {
  di(`   ${ok ? "✓" : "✗"} ${id} · ${det}`);
  if (!ok) fallos.push(id);
};

/* ── un troceador de HTML por etiquetas de apertura/cierre, con pila ───────
 * No hay DOM: se recorre el marcado contando `<div` … `</div>`. Sirve porque
 * sólo se necesita CONTENER (qué módulo está dentro de qué fila) y CLASIFICAR
 * (qué clase `et_pb_<tipo>` lleva), no maquetar. */
function nodos(html) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  const pila = [];
  let m;
  while ((m = re.exec(html))) {
    const [txt, cierre, tag, attrs, auto] = m;
    const vacio = /^(img|br|hr|input|meta|link|source|area|base|col|embed|param|track|wbr)$/i.test(tag) || auto === "/";
    if (cierre) {
      for (let i = pila.length - 1; i >= 0; i--) {
        if (pila[i].tag === tag.toLowerCase()) {
          pila[i].fin = m.index + txt.length;
          pila.splice(i);
          break;
        }
      }
      continue;
    }
    const cls = (attrs.match(/\bclass\s*=\s*"([^"]*)"/) || attrs.match(/\bclass\s*=\s*'([^']*)'/) || [, ""])[1];
    const nodo = { tag: tag.toLowerCase(), cls, ini: m.index, fin: null, prof: pila.length, padres: pila.map((p) => p.cls).join(" ") };
    out.push(nodo);
    if (!vacio) pila.push(nodo);
  }
  return out;
}

di("═".repeat(78));
di("129.ª · ESCALÓN 1 — el OBJETIVO del marcador `data-modulo`");
di("═".repeat(78));
di("");
di(`   control cruzado contra: ${ref.x} (mtime ${new Date(ref.mt).toISOString().slice(0, 16).replace("T", " ")})`);
di("");

const informe = [];
for (const [ruta, doc] of Object.entries(MAPA)) {
  const f = join(CORPUS, doc);
  if (!existsSync(f)) {
    console.error(`PRECONDICIÓN: falta ${doc}`);
    process.exit(2);
  }
  const html = readFileSync(f, "utf8");
  const ns = nodos(html);

  /* Fila = `.et_pb_row` fuera del cascarón. El descarte se hace por los PADRES
   * acumulados, que es lo que `closest()` hace en el navegador. */
  const esCascaron = (n) => /_tb_header|_tb_footer/.test(n.padres) || /_tb_header|_tb_footer/.test(n.cls);
  const filas = ns.filter((n) => /\bet_pb_row\b/.test(n.cls) && !esCascaron(n));
  const modulos = ns.filter((n) => /\bet_pb_module\b/.test(n.cls) && !esCascaron(n));

  const porFila = filas.map((fila, j) => {
    /* Contención por posición en el marcado: un módulo está dentro de la fila
     * si su apertura cae entre la apertura y el cierre de ésta. */
    const dentro = modulos.filter((m) => m.ini > fila.ini && (fila.fin === null || m.ini < fila.fin));
    const tipos = {};
    for (const m of dentro) {
      const t = (m.cls.match(/\bet_pb_([a-z_]+?)_\d+\b/) || m.cls.match(/\bet_pb_(text|image|blurb|button|toggle|video|code|divider|cta|gallery|number_counter|blog|tabs|accordion|slider|testimonial|promo)\b/) || [, "?"])[1];
      tipos[t] = (tipos[t] || 0) + 1;
    }
    return { fila: j, n: dentro.length, tipos };
  });

  const ref4 = (CMP.informe ?? []).find((i) => i.ruta === ruta);
  const refPorFila = ref4?.modulosSinComparar?.porFila ?? [];
  informe.push({ ruta, doc, nFilas: filas.length, nModulos: modulos.length, porFila, refPorFila });

  di(`── ${ruta}`);
  di(`   filas fuera del cascarón: ${filas.length} · módulos: ${modulos.length}`);
  di("   | fila | módulos (censo DOM) | productos-cmp (CON CAJA) | tipos |");
  di("   |---|---|---|---|");
  for (const p of porFila) {
    const r = refPorFila.find((x) => x.fila === p.fila);
    const tipos = Object.entries(p.tipos)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `${t}×${n}`)
      .join(" · ");
    di(`   | ${p.fila} | ${p.n} | ${r ? r.orig : "—"} | ${tipos || "—"} |`);
  }
  di("");
}

/* ── controles ─────────────────────────────────────────────────────────── */
di("── controles ───────────────────────────────────────────────────────────");

const totalDOM = informe.reduce((s, i) => s + i.nModulos, 0);
const totalRef = informe.reduce((s, i) => s + i.refPorFila.reduce((a, x) => a + x.orig, 0), 0);
control("K1 · el censo no está muerto", totalDOM > 0, `${totalDOM} módulos en los 4 documentos`);
control(
  "K2 · las filas concuerdan con el comparador",
  informe.every((i) => i.nFilas === (CMP.informe ?? []).find((x) => x.ruta === i.ruta)?.filas?.origEnElDOM),
  informe.map((i) => `${i.ruta.split("/").pop()}: ${i.nFilas} vs ${(CMP.informe ?? []).find((x) => x.ruta === i.ruta)?.filas?.origEnElDOM}`).join(" · "),
);
/* El censo del DOM es COTA SUPERIOR del que tiene caja: nunca puede ser menor.
 * Si lo fuera, el troceador estaría perdiendo módulos y el objetivo saldría
 * corto — que es el defecto que dejaría al clon emitiendo de menos. */
const cota = informe.every((i) => i.porFila.every((p) => (i.refPorFila.find((x) => x.fila === p.fila)?.orig ?? 0) <= p.n));
control("K3 · el censo es COTA SUPERIOR del que tiene caja", cota, `DOM ${totalDOM} ≥ con-caja ${totalRef} en todas las filas`);
control(
  "K4 · el troceador clasifica",
  informe.every((i) => i.porFila.some((p) => Object.keys(p.tipos).length && !p.tipos["?"])),
  `tipos reconocidos en las 4 rutas`,
);
di("");

di("═".repeat(78));
di("OBJETIVO DEL MARCADOR");
di("");
for (const i of informe) {
  const conCaja = i.refPorFila.reduce((a, x) => a + x.orig, 0);
  di(`  ${i.ruta}: el clon debe emitir ~${conCaja} \`[data-modulo]\` con caja (cota DOM ${i.nModulos}), hoy expone ${i.refPorFila.reduce((a, x) => a + x.clonHijosDirectos, 0)} hijos directos.`);
}
di("");
di(`  controles: ${fallos.length === 0 ? "todos en verde" : `EN ROJO — ${fallos.join(", ")}`}`);
di("═".repeat(78));

const nombre = process.env.NEG ? `escalon1-objetivo-129-neg-${process.env.NEG}` : "escalon1-objetivo-129";
writeFileSync(
  join(OUT, `${nombre}.json`),
  JSON.stringify(
    {
      meta: {
        tanda: "129.ª",
        fecha: new Date().toISOString().slice(0, 10),
        criterio: "replicado de productos-cmp.mjs L246-268: fila = .et_pb_row fuera de _tb_header/_tb_footer; módulo = .et_pb_module descendiente",
        unidad: "NODO en el DOM — cota superior del censo CON CAJA, que lo da productos-cmp",
        controlCruzado: ref.x,
        offline: true,
        noContesta: "no dice dónde va el marcador en el clon, ni mide un píxel",
      },
      informe,
      controles: { fallos, verde: fallos.length === 0 },
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(OUT, `${nombre}.log`), salida.join("\n") + "\n");
process.exit(fallos.length ? 3 : 0);
