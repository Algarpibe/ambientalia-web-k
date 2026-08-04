/**
 * ¿ES EL TEASER UNA PROYECCIÓN DEL DOCUMENTO? — **el falsador de la decisión
 * §F2-2 · TEASER**, escrito como programa y no como párrafo.
 *
 * Uso: node scripts/qa/cms-teaser.mjs
 *
 * ── Qué decide ────────────────────────────────────────────────────────────
 * §1.5 dejó `proyectos.posts` y `articulos.posts` como **relaciones**, con este
 * comentario: *«`CaseStudy` y `BlogPost` son proyecciones de teaser del
 * documento relacionado, no campos de esta colección»*. Si eso es cierto, el
 * teaser **se deriva** y guardarlo sería duplicar. Si es falso, la relación
 * pierde dato y hay que guardarlo.
 *
 * Nadie lo había medido. Esta sonda lo mide sobre los ÚNICOS pares donde se
 * puede: los teasers **cuyo destino el clon sí transcribió**.
 *
 * ── Cómo se lee, y es la mitad que importa ────────────────────────────────
 * Por campo del teaser, tres estados:
 *
 *   · **IDÉNTICO**  — el documento lo trae igual ⇒ derivable, no hace falta guardarlo;
 *   · **DISTINTO**  — el documento lo trae con otro valor ⇒ **NO derivable sin
 *     una transformación**, y ésa hay que escribirla y probarla;
 *   · **AUSENTE**   — el documento no tiene ese campo ⇒ no derivable en absoluto.
 *
 * **La decisión se cae si TODOS los campos salen IDÉNTICO en todos los pares**:
 * entonces el teaser sí es proyección y guardarlo es duplicar. Mientras haya un
 * DISTINTO o un AUSENTE, guardarlo es lo único que conserva el dato.
 *
 * ⚠ **Y el alcance manda sobre la conclusión.** Los pares comparables son pocos
 * —el clon transcribió 4 casos de 57 y 7 entradas de 149— así que un IDÉNTICO en
 * todos NO probaría derivabilidad universal: probaría que en estos pares
 * coincide. La asimetría es real y va escrita: **un DISTINTO basta para falsar
 * la derivación; un IDÉNTICO no basta para probarla.**
 */
import { Evaluadas, env, hoy, w } from "./lib.mjs";
import { cargaCatalogos } from "../seed/catalogos.mjs";
import { esSlug } from "../seed/seed.mjs";

process.env.SIN_CLON = "1";

/* ══════════════════════════════════════════════════════════════════════════
 * LOS SABOTAJES — `npm run qa:cms-teaser-neg`
 *
 * Un falsador que **no supiera falsar** sería la peor pieza posible aquí: la
 * decisión §F2-2 · TEASER se apoya en que este programa dice DISTINTO, y un
 * programa que dijera DISTINTO pase lo que pase daría exactamente la misma
 * salida. Los dos invariantes:
 *
 *   · `derivable` — se fabrica el mundo en el que `date` SÍ se deriva (un
 *     formateador de meses en español). El veredicto tiene que **voltear a
 *     FALSADA**. Sin este, «hay un campo no derivable» no se distingue de una
 *     sonda que siempre lo dice;
 *   · `sin-pares` — ningún teaser tiene destino transcrito ⇒ **exit 2**, que es
 *     lo que la propia sonda declara: *0 pares comparables NO es verde*.
 * ═════════════════════════════════════════════════════════════════════════ */
const SABOTAJE = env("SABOTAJE") || null;
const SABOTAJES = ["derivable", "sin-pares"];
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" | ")})`);

/** El formateador que la decisión dice que NO se puede escribir. Para el sabotaje. */
const MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split(" ");
const ABREV = "Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov Dic".split(" ");
const comoTeaser = (fecha) => {
  const m = /^(\d{1,2}) (\p{L}+) (\d{4})$/u.exec(String(fecha ?? "").trim());
  if (!m) return fecha;
  const i = MESES.indexOf(m[2].toLowerCase());
  return i < 0 ? fecha : `${ABREV[i]} ${m[1]}, ${m[3]}`;
};

const catalogos = await cargaCatalogos();

/** De dónde sale cada teaser y contra qué colección se compara. */
const FUENTES = [
  { origen: "sectores", grupo: "proyectos", destino: "casos" },
  { origen: "sectores", grupo: "articulos", destino: "entradas-blog" },
  { origen: "monograficos", grupo: "proyectos", destino: "casos" },
  { origen: "monograficos", grupo: "articulos", destino: "entradas-blog" },
];

/**
 * De dónde sale, EN EL DOCUMENTO, el valor que el teaser trae. **Es lo único
 * escrito a mano de esta sonda**, y por eso va declarado y se imprime.
 *
 * ⚠ **La primera versión de este mapa DIO EL RESULTADO INFLADO a favor de la
 * decisión que se quería tomar**, que es la peor forma posible de medir. Decía
 * `image: "imagen"` cuando el caso lo llama `imagenCabecera`, y ponía `sector` y
 * `sectorHref` como «sin equivalente» cuando el caso trae
 * `sectores: [{slug, nombre, …}]` y el teaser pinta `sectores[0].nombre`. Tres
 * campos «no derivables» que **sí lo son**, y el aviso de dos líneas más arriba
 * describía exactamente el fallo mientras el código lo cometía.
 *
 * `regla` declara **qué transformación YA DECIDIDA** explica una diferencia. No
 * es una tolerancia: es la diferencia entre *«esto lo arregla una regla que ya
 * existe»* y *«esto no se puede derivar»*, y sin esa distinción el veredicto
 * cuenta como frontera lo que es un enrutado.
 */
const EQUIVALE = {
  casos: {
    title: { de: (d) => d.titulo },
    client: { de: (d) => d.cliente },
    image: { de: (d) => d.imagenCabecera, regla: "M-IMG · el teaser pinta la variante de `srcset`" },
    href: { de: (d) => d.slug, regla: "§4 · la ruta se compone de prefijo + slug" },
    sector: { de: (d) => d.sectores?.[0]?.nombre },
    sectorHref: { de: (d) => d.sectores?.[0]?.slug, regla: "§4 · ruta del término, `/sector/<slug>` en el original" },
  },
  "entradas-blog": {
    title: { de: (d) => d.titulo },
    /* El sabotaje `derivable` le pone el formateador que la decisión rechaza. */
    date: { de: (d) => (SABOTAJE === "derivable" ? comoTeaser(d.fechaPublicacion) : d.fechaPublicacion) },
    image: { de: (d) => d.imagenDestacada, regla: "M-IMG · el teaser pinta la variante de `srcset`" },
    href: { de: (d) => d.slug, regla: "§4 · la ruta se compone de prefijo + slug" },
    excerpt: { de: (d) => d.extracto },
  },
};

const porSlug = new Map();
for (const col of ["casos", "entradas-blog"])
  porSlug.set(col, new Map(catalogos.get(col).map((f) => [f.slug, f])));

/** Un valor comparable: las imágenes llegan como objeto `{src, alt}` o cadena. */
const plano = (v) => (v && typeof v === "object" ? (v.src ?? v.url ?? JSON.stringify(v)) : v);

/**
 * ⚠ **El mínimo se DERIVA del catálogo, y no es `1`.** Lo era, y `1` no
 * expresaba nada: la sonda podía recorrer un teaser de 34 y salir conforme. La
 * unidad correcta es **el teaser recorrido** —que existe en el dato antes de
 * medir nada— y no el par comparable, que **es el resultado**: un mínimo puesto
 * sobre el resultado no puede detectar que el instrumento no miró.
 */
const TEASERS = FUENTES.reduce(
  (a, f) => a + catalogos.get(f.origen).reduce((b, fila) => b + (fila[f.grupo]?.posts?.length ?? 0), 0),
  0,
);
const ev = new Evaluadas({ nombre: "cms-teaser", unidad: "teasers del catálogo", minimo: TEASERS });

const pares = [];
let teasers = 0;
for (const f of FUENTES) {
  for (const fila of catalogos.get(f.origen)) {
    for (const t of fila[f.grupo]?.posts ?? []) {
      teasers++;
      ev.ok();
      const slug = esSlug(t);
      const doc = SABOTAJE === "sin-pares" ? undefined : porSlug.get(f.destino).get(slug);
      if (!doc) continue; // destino no transcrito: no comparable, y eso ya lo cuenta el sondeo
      const campos = {};
      for (const [campoTeaser, eq] of Object.entries(EQUIVALE[f.destino])) {
        const vT = plano(t[campoTeaser]);
        if (vT === undefined) continue;
        const vD = plano(eq.de(doc));
        campos[campoTeaser] =
          vD === undefined || vD === null
            ? { estado: "AUSENTE", teaser: vT }
            : vT === vD
              ? { estado: "IDÉNTICO", teaser: vT }
              : eq.regla
                ? { estado: "POR REGLA", teaser: vT, documento: vD, regla: eq.regla }
                : { estado: "DISTINTO", teaser: vT, documento: vD };
      }
      pares.push({ origen: `${f.origen}/${fila.slug}`, grupo: f.grupo, destino: `${f.destino}/${slug}`, campos });
    }
  }
}

/* ── Resumen por campo ─────────────────────────────────────────────────── */
const ESTADOS = ["IDÉNTICO", "POR REGLA", "DISTINTO", "AUSENTE"];
const porCampo = {};
for (const p of pares)
  for (const [c, r] of Object.entries(p.campos)) {
    const k = `${p.destino.split("/")[0]}.${c}`;
    (porCampo[k] ??= Object.fromEntries([...ESTADOS.map((e) => [e, 0]), ["ejemplo", null]]));
    porCampo[k][r.estado]++;
    if (r.estado !== "IDÉNTICO" && !porCampo[k].ejemplo) porCampo[k].ejemplo = r;
  }

console.log(`\n════════ ¿EL TEASER ES PROYECCIÓN DEL DOCUMENTO? ════════`);
console.log(`  ${teasers} teasers en el dato medido · ${pares.length} con destino transcrito (comparables)\n`);
console.log(`  ${"campo".padEnd(30)}${ESTADOS.map((e) => e.padStart(11)).join("")}`);
for (const [k, v] of Object.entries(porCampo))
  console.log(`  ${k.padEnd(30)}${ESTADOS.map((e) => String(v[e]).padStart(11)).join("")}`);

const porRegla = Object.entries(porCampo).filter(([, v]) => v["POR REGLA"]);
const noDerivables = Object.entries(porCampo).filter(([, v]) => v.DISTINTO || v.AUSENTE);

console.log(`\n  difieren pero los explica una transformación YA DECIDIDA:`);
if (!porRegla.length) console.log(`   (ninguno)`);
for (const [k, v] of porRegla)
  console.log(
    `   ~ ${k.padEnd(28)} ${v.ejemplo.regla}\n` +
      `        teaser: ${JSON.stringify(v.ejemplo.teaser)?.slice(0, 88)}\n` +
      `        doc:    ${JSON.stringify(v.ejemplo.documento)?.slice(0, 88)}`,
  );

console.log(`\n  NO derivables — ninguna regla escrita los explica:`);
if (!noDerivables.length) console.log(`   (ninguno)`);
for (const [k, v] of noDerivables)
  console.log(
    `   ✗ ${k.padEnd(28)} ${v.ejemplo.estado}\n` +
      `        teaser: ${JSON.stringify(v.ejemplo.teaser)?.slice(0, 88)}\n` +
      (v.ejemplo.documento !== undefined
        ? `        doc:    ${JSON.stringify(v.ejemplo.documento)?.slice(0, 88)}\n`
        : ""),
  );

w(env("SALIDA") || `medidas/cms-teaser${SABOTAJE ? `-neg-${SABOTAJE}` : ""}.json`, {
  meta: {
    fecha: hoy(),
    sabotaje: SABOTAJE ?? null,
    pregunta: "¿es `CaseStudy`/`BlogPost` una proyección derivable del documento destino?",
    alcance: `${pares.length} pares comparables de ${teasers} teasers — el resto no tiene destino transcrito`,
    asimetria:
      "un DISTINTO basta para falsar la derivación; un IDÉNTICO en estos pares NO prueba derivabilidad universal",
    equivalencias: Object.fromEntries(
      Object.entries(EQUIVALE).map(([col, campos]) => [
        col,
        Object.fromEntries(Object.entries(campos).map(([c, e]) => [c, { de: String(e.de), regla: e.regla ?? null }])),
      ]),
    ),
  },
  /* El veredicto CONGELADO y no sólo impreso: es lo que el negativo comprueba, y
   * lo que la decisión §F2-2 · TEASER cita. Regla 1 — un canal único de verdad. */
  veredicto: {
    decision: pares.length === 0 ? "NO SE PUEDE DECIDIR" : noDerivables.length ? "SE SOSTIENE" : "FALSADA",
    noDerivables: noDerivables.map(([k]) => k),
    paresComparables: pares.length,
  },
  porCampo,
  pares,
});

const veredicto = noDerivables.length === 0 && pares.length > 0;
console.log(
  `\n${veredicto ? "⚠" : "✅"} VEREDICTO: ` +
    (pares.length === 0
      ? `0 pares comparables — NO SE PUEDE DECIDIR con este dato.\n`
      : veredicto
        ? `todos los campos coinciden ⇒ la decisión de GUARDAR el teaser QUEDA FALSADA\n` +
          `   en estos ${pares.length} pares. Reabre §F2-2 · TEASER.\n`
        : `${noDerivables.length} campo(s) NO derivables ⇒ guardar el teaser es lo único\n` +
          `   que conserva el dato. La decisión de §F2-2 · TEASER se sostiene.\n`),
);
/* Ojo: 0 pares comparables NO es verde. Es la regla del cero: «no encontré
 * diferencias» y «no comparé nada» dan la misma salida si se dejan pasar. */
process.exit(pares.length === 0 ? 2 : 0);
